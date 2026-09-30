// Cadena de auditoría (ADR-0003 «Revisión adversarial» H1, H42): el hash cubre metadatos y el
// compromiso HMAC(clave_titular, valor) de antes y después; los valores viven cifrados aparte con la
// clave del titular (AES-256-GCM), envuelta con AUDIT_KEK. Cálculo puro, sin BD.
import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "node:crypto";

export type OrigenAuditoria =
  | "panel"
  | "importacion"
  | "reversion"
  | "sincronizacion"
  | "fusion"
  | "revocacion"
  | "migracion"
  | "worker"
  | "restauracion"
  | "rotacion"
  | "supresion";

export interface FilaAuditada {
  seq: number;
  tramo: number;
  actor: string;
  entidad: string;
  entidadId: string;
  campo: string;
  titular: string;
  antesHmac: Buffer | null;
  despuesHmac: Buffer | null;
  origen: OrigenAuditoria;
  cuando: Date;
}

export const TITULAR_SISTEMA = "sistema";

export function contenidoCanonico(f: FilaAuditada): string {
  return JSON.stringify([
    f.seq,
    f.tramo,
    f.actor,
    f.entidad,
    f.entidadId,
    f.campo,
    f.titular,
    f.antesHmac ? f.antesHmac.toString("hex") : null,
    f.despuesHmac ? f.despuesHmac.toString("hex") : null,
    f.origen,
    f.cuando.toISOString(),
  ]);
}

export function hashDeFila(claveAuditoria: string, hashAnterior: Buffer, f: FilaAuditada): Buffer {
  return createHmac("sha256", claveAuditoria)
    .update(hashAnterior)
    .update(contenidoCanonico(f))
    .digest();
}

export function compromisoDeValor(claveTitular: Buffer, valor: string | null): Buffer | null {
  return valor === null ? null : createHmac("sha256", claveTitular).update(valor).digest();
}

// AES-256-GCM: iv (12) ‖ tag (16) ‖ texto cifrado.
function cifrar(clave: Buffer, datos: Buffer): Buffer {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", clave, iv);
  const cuerpo = Buffer.concat([c.update(datos), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), cuerpo]);
}

function descifrar(clave: Buffer, sobre: Buffer): Buffer {
  const d = createDecipheriv("aes-256-gcm", clave, sobre.subarray(0, 12));
  d.setAuthTag(sobre.subarray(12, 28));
  return Buffer.concat([d.update(sobre.subarray(28)), d.final()]);
}

const claveDeKek = (kek: string) => createHash("sha256").update(kek).digest();

export function envolverClave(kek: string, claveTitular: Buffer): Buffer {
  return cifrar(claveDeKek(kek), claveTitular);
}

export function desenvolverClave(kek: string, envuelta: Buffer): Buffer {
  return descifrar(claveDeKek(kek), envuelta);
}

export function cifrarValor(claveTitular: Buffer, valor: string | null): Buffer | null {
  return valor === null ? null : cifrar(claveTitular, Buffer.from(valor, "utf8"));
}

export function descifrarValor(claveTitular: Buffer, cifrado: Buffer): string {
  return descifrar(claveTitular, cifrado).toString("utf8");
}
