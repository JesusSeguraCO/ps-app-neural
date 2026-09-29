// Acceso al panel (ADR-0002 §2-3, enmienda y H8/H22; HU-123). Sin proveedor de identidad: correo
// @trycore.com inscrito + código de un uso al buzón + sesión de una jornada.
//  - solicitar: MISMO trabajo en ambas ramas (inscrito o no): lectura de intentos y del usuario,
//    `codigo_pedido` en accesos_log y un `enviar_codigo` con ref nulo o el id; respuesta fija.
//  - verificar: compara contra 3 ranuras fijas en tiempo constante; un solo mensaje de fallo.
import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type pg from "pg";
import { hmacCodigo, hmacCorreo, normalizarCorreo } from "@ps/dominio/acceso/codigo";
import {
  estadoInicial,
  evaluarIntentos,
  puedeEmitir,
  registrarEmision,
  registrarAcierto,
  registrarFallo,
  type EstadoIntentos,
} from "@ps/dominio/acceso/intentos";
import { DURACION_PANEL_MS } from "@ps/dominio/acceso/sesion";
import { enTransaccion, guardarIntentos, leerIntentos, type TipoIntentos, type Tx } from "./intentos";

export interface SecretosAccesoPanel {
  emailHmac: string; // EMAIL_HMAC_KEY
  pepper: string; // OTP_PEPPER_PANEL
}

export const RANURAS = 3;
const esTrycore = (correo: string) => /^[^@\s]+@trycore\.com$/.test(correo);
const claveEmision = (correoHmac: Buffer, s: SecretosAccesoPanel) =>
  createHmac("sha256", s.emailHmac).update("emision:").update(correoHmac).digest();
const claveIp = (ip: string, s: SecretosAccesoPanel) =>
  createHmac("sha256", s.emailHmac).update(`ip:${ip}`).digest();

const TABLA = "identidad_panel.intentos_panel" as const;
const leer = (tx: Tx, clave: Buffer, tipo: TipoIntentos) => leerIntentos(tx, TABLA, clave, tipo);
const guardar = (tx: Tx, clave: Buffer, e: EstadoIntentos) => guardarIntentos(tx, TABLA, clave, e);

export interface SolicitudCodigo {
  trabajoId: string;
}

export async function solicitarCodigoPanel(
  bd: pg.Pool,
  s: SecretosAccesoPanel,
  entrada: { correo: string; ip: string | null },
): Promise<SolicitudCodigo> {
  const correo = normalizarCorreo(entrada.correo);
  const correoHmac = hmacCorreo(correo, s.emailHmac);
  return enTransaccion(bd, async (tx) => {
    // Mismas lecturas y escrituras en ambas ramas.
    const par = await leer(tx, correoHmac, "par");
    // Sin IP conocida no hay capa por IP (R-86): nunca se agrupa a todos en un solo contador.
    const porIp = entrada.ip ? await leer(tx, claveIp(entrada.ip, s), "ip") : estadoInicial(new Date());
    const claveEmi = claveEmision(correoHmac, s);
    const emision = await leer(tx, claveEmi, "emision");
    const u = await tx.query(
      `SELECT id, activo FROM identidad_panel.usuarios_panel WHERE correo_hmac = $1`,
      [correoHmac],
    );
    const usuario = u.rows[0] as { id: string; activo: boolean } | undefined;
    const ahora = new Date();
    const bloqueado =
      !evaluarIntentos(par, ahora).permitido || !evaluarIntentos(porIp, ahora).permitido;
    // Tope de emisión por sujeto (R-85): se cuenta en ambas ramas, así que no revela la inscripción.
    const emitir = puedeEmitir(emision, ahora);
    await guardar(tx, claveEmi, emitir ? registrarEmision(emision, ahora) : emision);
    const ref = usuario?.activo && esTrycore(correo) && !bloqueado && emitir ? usuario.id : null;
    await tx.query(
      `INSERT INTO identidad.accesos_log (host, ambito, evento, correo_hash, ip) VALUES ('panel', 'panel', 'codigo_pedido', $1, $2)`,
      [correoHmac, entrada.ip],
    );
    const t = await tx.query(`SELECT operacion.encolar_panel('enviar_codigo', $1::jsonb) AS id`, [
      JSON.stringify({ ref, ambito: "panel" }),
    ]);
    return { trabajoId: String(t.rows[0].id) };
  });
}

export type ResultadoVerificacion =
  { ok: true; idSesion: string; usuarioId: string } | { ok: false };

// Ranuras de relleno para comparar siempre contra 3 HMAC (tiempo constante con y sin códigos).
const RELLENO = Array.from({ length: RANURAS }, () => randomBytes(32));

export async function verificarCodigoPanel(
  bd: pg.Pool,
  s: SecretosAccesoPanel,
  entrada: { correo: string; codigo: string; ip: string | null },
): Promise<ResultadoVerificacion> {
  const correo = normalizarCorreo(entrada.correo);
  const correoHmac = hmacCorreo(correo, s.emailHmac);
  const recibido = hmacCodigo(/^\d{6}$/.test(entrada.codigo) ? entrada.codigo : "------", s.pepper);
  return enTransaccion(bd, async (tx) => {
    const ahora = new Date();
    const clavePar = correoHmac;
    const claveDeIp = entrada.ip ? claveIp(entrada.ip, s) : null;
    const par = await leer(tx, clavePar, "par");
    const porIp = claveDeIp ? await leer(tx, claveDeIp, "ip") : estadoInicial(ahora);
    const u = await tx.query(
      `SELECT id, activo FROM identidad_panel.usuarios_panel WHERE correo_hmac = $1`,
      [correoHmac],
    );
    const usuario = u.rows[0] as { id: string; activo: boolean } | undefined;
    const c = await tx.query(
      `SELECT id, codigo_hmac, invalidado_por_sistema FROM identidad_panel.codigos_panel
        WHERE usuario_id = $1 AND usado_en IS NULL AND expira_en > now()
        ORDER BY emitido_en DESC LIMIT ${RANURAS}`,
      [usuario?.id ?? "00000000-0000-0000-0000-000000000000"],
    );
    const ranuras = c.rows as Array<{
      id: string;
      codigo_hmac: Buffer;
      invalidado_por_sistema: boolean;
    }>;
    let valido = false;
    let invalidadoPorSistema = false;
    for (let i = 0; i < RANURAS; i++) {
      const r = ranuras[i];
      const igual = timingSafeEqual(r ? Buffer.from(r.codigo_hmac) : RELLENO[i]!, recibido);
      if (igual && r && !r.invalidado_por_sistema) valido = true;
      if (igual && r?.invalidado_por_sistema) invalidadoPorSistema = true;
    }
    const permitido =
      evaluarIntentos(par, ahora).permitido && evaluarIntentos(porIp, ahora).permitido;

    if (valido && permitido && usuario?.activo) {
      await tx.query(
        `UPDATE identidad_panel.codigos_panel SET usado_en = now() WHERE usuario_id = $1 AND usado_en IS NULL`,
        [usuario.id],
      );
      const idSesion = randomBytes(32).toString("base64url");
      await tx.query(
        `INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, expira) VALUES ($1, $2, $3)`,
        [
          createHash("sha256").update(idSesion).digest(),
          usuario.id,
          new Date(ahora.getTime() + DURACION_PANEL_MS),
        ],
      );
      await guardar(tx, clavePar, registrarAcierto(par));
      await tx.query(
        `INSERT INTO identidad.accesos_log (host, ambito, evento, correo_hash, ip) VALUES ('panel', 'panel', 'verificacion_ok', $1, $2)`,
        [correoHmac, entrada.ip],
      );
      return { ok: true, idSesion, usuarioId: usuario.id };
    }

    // Un código invalidado por el sistema no suma fallo (H22); un bloqueo tampoco añade más.
    if (!invalidadoPorSistema && permitido) {
      const rPar = registrarFallo(par, ahora);
      await guardar(tx, clavePar, rPar.estado);
      if (claveDeIp) await guardar(tx, claveDeIp, registrarFallo(porIp, ahora).estado);
      if (rPar.alerta) {
        await tx.query(
          `INSERT INTO identidad.accesos_log (host, ambito, evento, correo_hash, ip) VALUES ('panel', 'panel', 'bloqueo', $1, $2)`,
          [correoHmac, entrada.ip],
        );
      }
    }
    await tx.query(
      `INSERT INTO identidad.accesos_log (host, ambito, evento, correo_hash, ip) VALUES ('panel', 'panel', 'verificacion_fallida', $1, $2)`,
      [correoHmac, entrada.ip],
    );
    return { ok: false };
  });
}

export async function cerrarSesionPanel(bd: pg.Pool, idCookie: string): Promise<void> {
  await bd.query(`SELECT identidad_panel.cerrar_sesion($1)`, [
    createHash("sha256").update(idCookie).digest(),
  ]);
}

// Modo degradado (H8): el worker lleva > 2 min sin ciclo.
export async function workerCaido(bd: pg.Pool): Promise<boolean> {
  const r = await bd.query(`SELECT ultima_vuelta FROM operacion.worker_ciclo WHERE id = 1`);
  const u = r.rows[0]?.ultima_vuelta as Date | undefined;
  return !u || Date.now() - u.getTime() > 2 * 60_000;
}
