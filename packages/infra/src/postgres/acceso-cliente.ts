// Acceso nominal del cliente (ADR-0002 §3, enmienda de plataforma, H5/H8/H9/H22 y enmienda 2026-09-28;
// HU-090, HU-144). Sin registro ni contraseña: token opaco del enlace + correo invitado + código de un
// uso al buzón + sesión de 30 días acotada al enlace.
//  - consultar: SHA-256 del token → estado tipado; inexistente = revocado. Nunca devuelve inventario.
//  - solicitar: MISMO trabajo en ambas ramas (invitado o no): lecturas de intentos y del invitado,
//    `codigo_pedido` y un `enviar_codigo {ref, ambito: cliente}` con ref nulo o el id del invitado.
//  - verificar: compara contra 3 ranuras fijas en tiempo constante; la apertura se registra aquí.
import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type pg from "pg";
import { hmacCodigo, hmacCorreo, normalizarCorreo } from "@ps/dominio/acceso/codigo";
import {
  estadoAlAbrir,
  expiraSesionPortal,
  tokenConForma,
  type EstadoAlAbrir,
} from "@ps/dominio/acceso/enlace";
import {
  estadoInicial,
  evaluarIntentos,
  puedeEmitir,
  registrarAcierto,
  registrarEmision,
  registrarFallo,
  type EstadoIntentos,
} from "@ps/dominio/acceso/intentos";
import { validarSesionPortal } from "@ps/dominio/acceso/sesion";
import { hashTokenEnlace } from "@ps/dominio/enlaces/crear";
import {
  enTransaccion,
  guardarIntentos,
  leerIntentos,
  type TipoIntentos,
  type Tx,
} from "./intentos";
import { buscarSesionPortal, hashIdSesion } from "./sesiones";

export interface SecretosAccesoCliente {
  emailHmac: string; // EMAIL_HMAC_KEY
  pepper: string; // OTP_PEPPER_CLIENTE
}

const RANURAS = 3;
const NINGUNO = "00000000-0000-0000-0000-000000000000";
const TABLA = "identidad.intentos_cliente" as const;
const leer = (tx: Tx, clave: Buffer, tipo: TipoIntentos) => leerIntentos(tx, TABLA, clave, tipo);
const guardar = (tx: Tx, clave: Buffer, e: EstadoIntentos) => guardarIntentos(tx, TABLA, clave, e);

// El par y el sujeto de emisión son enlace + correo (columna `clave` de intentos_cliente); la IP aparte.
const clavePar = (enlaceId: string | null, correoHmac: Buffer, s: SecretosAccesoCliente) =>
  createHmac("sha256", s.emailHmac)
    .update(`par:${enlaceId ?? "-"}:`)
    .update(correoHmac)
    .digest();
const claveEmision = (enlaceId: string | null, correoHmac: Buffer, s: SecretosAccesoCliente) =>
  createHmac("sha256", s.emailHmac)
    .update(`emision:${enlaceId ?? "-"}:`)
    .update(correoHmac)
    .digest();
const claveIp = (ip: string, s: SecretosAccesoCliente) =>
  createHmac("sha256", s.emailHmac).update(`ip:${ip}`).digest();

interface EnlaceDelToken {
  enlaceId: string;
  estado: EstadoAlAbrir;
  vigenteHasta: Date;
}

async function enlaceDelToken(
  q: Tx | pg.Pool,
  token: string,
  ahora: Date,
): Promise<EnlaceDelToken | null> {
  if (!tokenConForma(token)) return null;
  const r = await q.query(
    `SELECT t.enlace_id, t.revocado_en IS NOT NULL AS token_revocado, e.estado, e.vigente_hasta
       FROM identidad.enlace_tokens t JOIN identidad.enlaces e ON e.id = t.enlace_id
      WHERE t.token_hash = $1`,
    [hashTokenEnlace(token)],
  );
  const f = r.rows[0];
  if (!f) return null;
  return {
    enlaceId: f.enlace_id,
    vigenteHasta: f.vigente_hasta,
    estado: estadoAlAbrir(
      { tokenRevocado: f.token_revocado, enlaceEstado: f.estado, vigenteHasta: f.vigente_hasta },
      ahora,
    ),
  };
}

export type ResultadoConsulta = EstadoAlAbrir & { conSesion: boolean };

// POST /acceso/enlace. `conSesion` = ya hay sesión válida de ESE enlace en este dispositivo (HU-090:
// «entro directamente»); una sesión de otro enlace no cuenta (prevalece el token, H5).
export async function consultarEnlace(
  bd: pg.Pool,
  entrada: { token: string; idCookie?: string; ip: string | null },
): Promise<ResultadoConsulta> {
  const ahora = new Date();
  const enlace = await enlaceDelToken(bd, entrada.token, ahora);
  const estado = enlace?.estado ?? estadoAlAbrir(null, ahora);
  await bd.query(
    `INSERT INTO identidad.accesos_log (host, ambito, evento, enlace_id, ip) VALUES ('portal', 'cliente', 'enlace_consultado', $1, $2)`,
    [enlace?.enlaceId ?? null, entrada.ip],
  );
  let conSesion = false;
  if (estado.estado === "activo" && entrada.idCookie) {
    const s = validarSesionPortal(await buscarSesionPortal(bd, entrada.idCookie), ahora);
    conSesion = s.ok && s.enlaceId === enlace!.enlaceId;
  }
  return { ...estado, conSesion };
}

export async function solicitarCodigoCliente(
  bd: pg.Pool,
  s: SecretosAccesoCliente,
  entrada: { token: string; correo: string; ip: string | null },
): Promise<{ trabajoId: string }> {
  const correoHmac = hmacCorreo(normalizarCorreo(entrada.correo), s.emailHmac);
  return enTransaccion(bd, async (tx) => {
    const ahora = new Date();
    const enlace = await enlaceDelToken(tx, entrada.token, ahora);
    const enlaceId = enlace?.enlaceId ?? null;
    // Mismas lecturas y escrituras en ambas ramas (invitado o no, enlace útil o no).
    const par = await leer(tx, clavePar(enlaceId, correoHmac, s), "par");
    // Sin IP conocida no hay capa por IP (R-86): nunca se agrupa a todos en un solo contador.
    const porIp = entrada.ip ? await leer(tx, claveIp(entrada.ip, s), "ip") : estadoInicial(ahora);
    const claveEmi = claveEmision(enlaceId, correoHmac, s);
    const emision = await leer(tx, claveEmi, "emision");
    const i = await tx.query(
      `SELECT id, activo FROM identidad.enlace_invitados WHERE enlace_id = $1 AND correo_hmac = $2`,
      [enlaceId ?? NINGUNO, correoHmac],
    );
    const invitado = i.rows[0] as { id: string; activo: boolean } | undefined;
    const bloqueado =
      !evaluarIntentos(par, ahora).permitido || !evaluarIntentos(porIp, ahora).permitido;
    // Tope de emisión por sujeto (R-85): se cuenta en ambas ramas, así que no revela la invitación.
    const emitir = puedeEmitir(emision, ahora);
    await guardar(tx, claveEmi, emitir ? registrarEmision(emision, ahora) : emision);
    const ref =
      invitado?.activo && enlace?.estado.estado === "activo" && !bloqueado && emitir
        ? invitado.id
        : null;
    await tx.query(
      `INSERT INTO identidad.accesos_log (host, ambito, evento, enlace_id, correo_hash, ip) VALUES ('portal', 'cliente', 'codigo_pedido', $1, $2, $3)`,
      [enlaceId, correoHmac, entrada.ip],
    );
    const t = await tx.query(`SELECT operacion.encolar_portal('enviar_codigo', $1::jsonb) AS id`, [
      JSON.stringify({ ref, ambito: "cliente" }),
    ]);
    return { trabajoId: String(t.rows[0].id) };
  });
}

export type ResultadoVerificacionCliente =
  | { ok: true; idSesion: string; expira: Date; enlaceId: string }
  | { ok: false; motivo: "codigo_invalido" }
  | { ok: false; motivo: "en_espera"; hasta: Date };

// Ranuras de relleno para comparar siempre contra 3 HMAC (tiempo constante con y sin códigos).
const RELLENO = Array.from({ length: RANURAS }, () => randomBytes(32));

const masTarde = (a: Date | undefined, b: Date | undefined) =>
  a && b ? (a > b ? a : b) : (a ?? b ?? new Date());

export async function verificarCodigoCliente(
  bd: pg.Pool,
  s: SecretosAccesoCliente,
  entrada: { token: string; correo: string; codigo: string; ip: string | null },
): Promise<ResultadoVerificacionCliente> {
  const correoHmac = hmacCorreo(normalizarCorreo(entrada.correo), s.emailHmac);
  const recibido = hmacCodigo(/^\d{6}$/.test(entrada.codigo) ? entrada.codigo : "------", s.pepper);
  return enTransaccion(bd, async (tx) => {
    const ahora = new Date();
    const enlace = await enlaceDelToken(tx, entrada.token, ahora);
    const enlaceId = enlace?.enlaceId ?? null;
    const claveDePar = clavePar(enlaceId, correoHmac, s);
    const claveDeIp = entrada.ip ? claveIp(entrada.ip, s) : null;
    const par = await leer(tx, claveDePar, "par");
    const porIp = claveDeIp ? await leer(tx, claveDeIp, "ip") : estadoInicial(ahora);
    const i = await tx.query(
      `SELECT id, activo FROM identidad.enlace_invitados WHERE enlace_id = $1 AND correo_hmac = $2`,
      [enlaceId ?? NINGUNO, correoHmac],
    );
    const invitado = i.rows[0] as { id: string; activo: boolean } | undefined;
    const c = await tx.query(
      `SELECT id, codigo_hmac, invalidado_por_sistema FROM identidad.codigos_cliente
        WHERE invitado_id = $1 AND usado_en IS NULL AND expira_en > now()
        ORDER BY emitido_en DESC LIMIT ${RANURAS}`,
      [invitado?.id ?? NINGUNO],
    );
    const ranuras = c.rows as Array<{
      id: string;
      codigo_hmac: Buffer;
      invalidado_por_sistema: boolean;
    }>;
    let valido = false;
    let invalidadoPorSistema = false;
    for (let k = 0; k < RANURAS; k++) {
      const r = ranuras[k];
      const igual = timingSafeEqual(r ? Buffer.from(r.codigo_hmac) : RELLENO[k]!, recibido);
      if (igual && r && !r.invalidado_por_sistema) valido = true;
      if (igual && r?.invalidado_por_sistema) invalidadoPorSistema = true;
    }
    const evPar = evaluarIntentos(par, ahora);
    const evIp = evaluarIntentos(porIp, ahora);
    const log = (evento: string, invitadoId: string | null = null) =>
      tx.query(
        `INSERT INTO identidad.accesos_log (host, ambito, evento, enlace_id, invitado_id, correo_hash, ip) VALUES ('portal', 'cliente', $1, $2, $3, $4, $5)`,
        [evento, enlaceId, invitadoId, correoHmac, entrada.ip],
      );

    // Intentos agotados: ni el código correcto entra; la espera no revela si el correo está invitado.
    if (!evPar.permitido || !evIp.permitido) {
      await log("verificacion_fallida");
      return {
        ok: false,
        motivo: "en_espera",
        hasta: masTarde(
          evPar.permitido ? undefined : evPar.hasta,
          evIp.permitido ? undefined : evIp.hasta,
        ),
      };
    }

    if (valido && invitado?.activo && enlace?.estado.estado === "activo") {
      await tx.query(
        `UPDATE identidad.codigos_cliente SET usado_en = now() WHERE invitado_id = $1 AND usado_en IS NULL`,
        [invitado.id],
      );
      const idSesion = randomBytes(32).toString("base64url");
      const expira = expiraSesionPortal(ahora, enlace.vigenteHasta);
      await tx.query(
        `INSERT INTO identidad.sesiones_portal (id_hash, enlace_id, invitado_id, expira) VALUES ($1, $2, $3, $4)`,
        [hashIdSesion(idSesion), enlace.enlaceId, invitado.id, expira],
      );
      await guardar(tx, claveDePar, registrarAcierto(par));
      // Apertura atribuida (ADR-0002 §3): la guarda `verificacion_ok` con el invitado.
      await log("verificacion_ok", invitado.id);
      return { ok: true, idSesion, expira, enlaceId: enlace.enlaceId };
    }

    // Un código invalidado por el sistema no suma fallo (H22).
    if (!invalidadoPorSistema) {
      const rPar = registrarFallo(par, ahora);
      await guardar(tx, claveDePar, rPar.estado);
      if (claveDeIp) await guardar(tx, claveDeIp, registrarFallo(porIp, ahora).estado);
      if (rPar.alerta) await log("bloqueo");
      await log("verificacion_fallida");
      const tras = evaluarIntentos(rPar.estado, ahora);
      if (!tras.permitido) return { ok: false, motivo: "en_espera", hasta: tras.hasta };
      return { ok: false, motivo: "codigo_invalido" };
    }
    await log("verificacion_fallida");
    return { ok: false, motivo: "codigo_invalido" };
  });
}

export async function cerrarSesionPortal(bd: pg.Pool, idCookie: string): Promise<void> {
  await bd.query(`SELECT identidad.cerrar_sesion($1)`, [hashIdSesion(idCookie)]);
}
