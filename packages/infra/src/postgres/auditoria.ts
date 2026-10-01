// Registro y verificación de la auditoría encadenada (ADR-0003 H1, H25, H42). Siempre dentro de la
// transacción del acto auditado: 1) claves de titular, 2) `bloquear_cabeza()`, 3) hashes en la
// aplicación (la BD no tiene la clave HMAC), 4) `registrar(lote)`, que comprueba el enlace.
import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type pg from "pg";
import {
  TITULAR_SISTEMA,
  cifrarValor,
  compromisoDeValor,
  descifrarValor,
  desenvolverClave,
  envolverClave,
  hashDeFila,
  type FilaAuditada,
  type OrigenAuditoria,
} from "@ps/dominio/auditoria/cadena";

export interface ClavesAuditoria {
  hmac: string; // AUDIT_HMAC_KEY
  kek: string; // AUDIT_KEK
}

export interface CambioAuditado {
  actor: string;
  entidad: string;
  entidadId: string;
  campo: string;
  titular?: string;
  antes: string | null;
  despues: string | null;
  origen: OrigenAuditoria;
}

type Consultor = Pick<pg.PoolClient, "query">;

export const HASH_GENESIS = createHash("sha256")
  .update("people-service:auditoria:genesis")
  .digest();

async function claveDeTitular(tx: Consultor, kek: string, titular: string): Promise<Buffer> {
  const leer = () =>
    tx.query(`SELECT clave_envuelta FROM identidad.claves_titular WHERE titular = $1`, [titular]);
  let r = await leer();
  if (!r.rows[0] && titular === TITULAR_SISTEMA) {
    await tx.query(
      `INSERT INTO identidad.claves_titular (titular, clave_envuelta) VALUES ($1, $2) ON CONFLICT (titular) DO NOTHING`,
      [titular, envolverClave(kek, randomBytes(32))],
    );
    r = await leer();
  }
  const envuelta = r.rows[0]?.clave_envuelta as Buffer | null | undefined;
  if (!envuelta) throw new Error(`auditoría: el titular ${titular} no tiene clave vigente`);
  return desenvolverClave(kek, envuelta);
}

export async function registrarAuditoria(
  tx: Consultor,
  claves: ClavesAuditoria,
  cambios: CambioAuditado[],
): Promise<number> {
  if (cambios.length === 0) throw new Error("auditoría: lote vacío");
  const clavesTitular = new Map<string, Buffer>();
  for (const titular of new Set(cambios.map((c) => c.titular ?? TITULAR_SISTEMA))) {
    clavesTitular.set(titular, await claveDeTitular(tx, claves.kek, titular));
  }

  const cabeza = (await tx.query(`SELECT tramo, seq, hash FROM auditoria.bloquear_cabeza()`))
    .rows[0] as {
    tramo: number;
    seq: string;
    hash: Buffer;
  };
  let seq = Number(cabeza.seq);
  let anterior = cabeza.hash;
  const cuando = new Date();
  const lote = cambios.map((c) => {
    seq += 1;
    const titular = c.titular ?? TITULAR_SISTEMA;
    const claveTitular = clavesTitular.get(titular)!;
    const fila: FilaAuditada = {
      seq,
      tramo: cabeza.tramo,
      actor: c.actor,
      entidad: c.entidad,
      entidadId: c.entidadId,
      campo: c.campo,
      titular,
      antesHmac: compromisoDeValor(claveTitular, c.antes),
      despuesHmac: compromisoDeValor(claveTitular, c.despues),
      origen: c.origen,
      cuando,
    };
    const hash = hashDeFila(claves.hmac, anterior, fila);
    const salida = {
      seq,
      tramo: cabeza.tramo,
      actor: fila.actor,
      entidad: fila.entidad,
      entidad_id: fila.entidadId,
      campo: fila.campo,
      titular,
      antes_hmac: fila.antesHmac?.toString("hex") ?? null,
      despues_hmac: fila.despuesHmac?.toString("hex") ?? null,
      origen: fila.origen,
      cuando: cuando.toISOString(),
      hash_anterior: anterior.toString("hex"),
      hash: hash.toString("hex"),
      antes_cifrado: cifrarValor(claveTitular, c.antes)?.toString("hex") ?? null,
      despues_cifrado: cifrarValor(claveTitular, c.despues)?.toString("hex") ?? null,
    };
    anterior = hash;
    return salida;
  });
  const r = await tx.query(`SELECT auditoria.registrar($1::jsonb) AS ultimo`, [
    JSON.stringify(lote),
  ]);
  return Number(r.rows[0].ultimo);
}

// Ejecuta `acto` y su auditoría en una sola transacción: o se aplican ambos o ninguno.
export async function conAuditoria<T>(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  acto: (tx: pg.PoolClient) => Promise<{ resultado: T; cambios: CambioAuditado[] }>,
): Promise<T> {
  const tx = await bd.connect();
  try {
    await tx.query("BEGIN");
    const { resultado, cambios } = await acto(tx);
    if (cambios.length) await registrarAuditoria(tx, claves, cambios);
    await tx.query("COMMIT");
    return resultado;
  } catch (e) {
    await tx.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    tx.release();
  }
}

export interface ResultadoVerificacion {
  ok: boolean;
  filas: number;
  rotaEnSeq?: number;
}

// Recorre la cadena por seq y hash_anterior recalculando cada HMAC (ADR-0003: nunca por id).
export async function verificarCadena(
  bd: Consultor,
  claveHmac: string,
): Promise<ResultadoVerificacion> {
  const r = await bd.query(
    `SELECT seq, tramo, actor, entidad, entidad_id, campo, titular, antes_hmac, despues_hmac, origen, cuando,
            hash_anterior, hash
       FROM auditoria.auditoria ORDER BY seq`,
  );
  let anterior: Buffer = HASH_GENESIS;
  let esperado = 1;
  for (const f of r.rows) {
    const seq = Number(f.seq);
    if (seq !== esperado || !Buffer.from(f.hash_anterior).equals(anterior))
      return { ok: false, filas: r.rowCount ?? 0, rotaEnSeq: seq };
    const calculado = hashDeFila(claveHmac, anterior, {
      seq,
      tramo: f.tramo,
      actor: f.actor,
      entidad: f.entidad,
      entidadId: f.entidad_id,
      campo: f.campo,
      titular: f.titular,
      antesHmac: f.antes_hmac,
      despuesHmac: f.despues_hmac,
      origen: f.origen,
      cuando: f.cuando,
    });
    if (!calculado.equals(Buffer.from(f.hash)))
      return { ok: false, filas: r.rowCount ?? 0, rotaEnSeq: seq };
    anterior = calculado;
    esperado += 1;
  }
  const cabeza = await bd.query(
    `SELECT seq, hash FROM auditoria.auditoria_cabeza ORDER BY tramo DESC LIMIT 1`,
  );
  const c = cabeza.rows[0];
  if (Number(c.seq) !== esperado - 1 || !Buffer.from(c.hash).equals(anterior)) {
    return { ok: false, filas: r.rowCount ?? 0, rotaEnSeq: Number(c.seq) };
  }
  return { ok: true, filas: r.rowCount ?? 0 };
}

export interface CambioLeido {
  seq: number;
  actor: string;
  campo: string;
  antes: string | null;
  despues: string | null;
  origen: OrigenAuditoria;
  cuando: string;
  // La clave del titular se destruyó (supresión, Ley 1581): el valor ya no se puede leer.
  suprimido: boolean;
}

// Cambios de una entidad en orden de la cadena, con los valores descifrados en el servidor del panel
// (HU-138, HU-147). Nunca sale de aquí un valor cifrado ni una clave.
export async function leerCambios(
  bd: Consultor,
  kek: string,
  entidad: string,
  entidadId: string,
): Promise<CambioLeido[]> {
  const r = await bd.query(
    `SELECT a.seq, a.actor, a.campo, a.origen, a.cuando, a.titular,
            v.antes_cifrado, v.despues_cifrado, k.clave_envuelta
       FROM auditoria.auditoria a
       LEFT JOIN auditoria.auditoria_valores v ON v.seq = a.seq
       LEFT JOIN identidad.claves_titular k ON k.titular = a.titular
      WHERE a.entidad = $1 AND a.entidad_id = $2
      ORDER BY a.seq`,
    [entidad, entidadId],
  );
  const claves = new Map<string, Buffer | null>();
  return r.rows.map((f) => {
    if (!claves.has(f.titular))
      claves.set(f.titular, f.clave_envuelta ? desenvolverClave(kek, f.clave_envuelta) : null);
    const clave = claves.get(f.titular)!;
    const valor = (c: Buffer | null) => (c && clave ? descifrarValor(clave, c) : null);
    return {
      seq: Number(f.seq),
      actor: f.actor,
      campo: f.campo,
      antes: valor(f.antes_cifrado),
      despues: valor(f.despues_cifrado),
      origen: f.origen,
      cuando: f.cuando.toISOString(),
      suprimido: clave === null,
    };
  });
}
