// Configuración por proceso y por APP_ENV (ADR-0008 «Interfaces», ADR-0010 §3.3, V8-9).
// Cada proceso recibe solo sus variables; el proceso no arranca si falta una.
// Los errores nombran variables, nunca valores.
import { z } from "zod";

export type Proceso = "portal" | "panel" | "worker" | "migrar";
export type AppEnv = "local" | "ci" | "staging" | "produccion";
export type Doble = "mailgun" | "hubspot" | "gemini" | "spaces" | "latido";

const DOBLES_VALIDOS: readonly Doble[] = ["mailgun", "hubspot", "gemini", "spaces", "latido"];

// Lista normativa de ADR-0010 §3.3.
export const VARIABLES: Record<Proceso, readonly string[]> = {
  portal: [
    "APP_ENV",
    "DATABASE_URL",
    "OTP_PEPPER_CLIENTE",
    "EMAIL_HMAC_KEY",
    "EDGE_SECRET",
    "EDGE_SECRET_PREV",
    "GEMINI_API_KEY",
    "MAILGUN_SENDING_KEY",
    "MAILGUN_DOMAIN",
    "SALUD_TOKEN",
  ],
  panel: [
    "APP_ENV",
    "DATABASE_URL",
    "OTP_PEPPER_PANEL",
    "EMAIL_HMAC_KEY",
    "AUDIT_HMAC_KEY",
    "AUDIT_KEK",
    "EDGE_SECRET",
    "EDGE_SECRET_PREV",
    "SPACES_KEY",
    "SPACES_SECRET",
    "SPACES_BUCKET",
    "MAILGUN_SENDING_KEY",
    "MAILGUN_DOMAIN",
    "MAILGUN_WEBHOOK_SIGNING_KEY",
    "MAILGUN_WEBHOOK_SIGNING_KEY_PREV",
    "SALUD_TOKEN",
    "PORTAL_ORIGEN",
  ],
  worker: [
    "APP_ENV",
    "WORKER_PAUSADO",
    "DATABASE_URL",
    "DATABASE_DIRECT_URL",
    "EXPORT_DATABASE_URL",
    "HUBSPOT_PRIVATE_APP_TOKEN",
    "MAILGUN_SENDING_KEY",
    "MAILGUN_SUPPRESSIONS_KEY",
    "MAILGUN_DOMAIN",
    "GEMINI_API_KEY",
    "AUDIT_HMAC_KEY",
    "AUDIT_KEK",
    "EMAIL_HMAC_KEY",
    "OTP_PEPPER_CLIENTE",
    "OTP_PEPPER_PANEL",
    "EVENTOS_SEUDONIMO_SAL",
    "LATIDO_URL",
    "SPACES_KEY",
    "SPACES_SECRET",
    "SPACES_BUCKET",
    "EXPORT_AGE_RECIPIENT",
    "PANEL_ADMIN_INICIAL",
    // Renovación del enlace vencido (HU-092, EP-001 · 5.7): enlace nuevo con el origen del portal;
    // propiedad y valor de «cuenta activa» en HubSpot (configuración, no código); buzón de Talento
    // Humano para las peticiones que no pueden ser automáticas. Enmienda de ADR-0010 §3.3.
    "PORTAL_ORIGEN",
    "HUBSPOT_PROP_CUENTA_ACTIVA",
    "HUBSPOT_VALOR_CUENTA_ACTIVA",
    "CORREO_TALENTO_HUMANO",
  ],
  migrar: ["APP_ENV", "MIGRATOR_DATABASE_URL"],
};

// Variables que solo existen durante una rotación, o con valor por omisión.
// EDGE_SECRET es opcional desde el 2026-09-28: Cloudflare dejó de ser criterio (decisión del sponsor);
// si un proxy de borde vuelve a ponerse delante, basta con configurarla (enmienda pendiente de ADR-0010).
export const OPCIONALES: ReadonlySet<string> = new Set([
  "EDGE_SECRET",
  "EDGE_SECRET_PREV",
  "MAILGUN_WEBHOOK_SIGNING_KEY_PREV",
  "WORKER_PAUSADO",
]);

// Credenciales que un doble declarado permite omitir (solo local y ci).
const CREDENCIALES_DE: Record<Doble, readonly string[]> = {
  mailgun: [
    "MAILGUN_SENDING_KEY",
    "MAILGUN_SUPPRESSIONS_KEY",
    "MAILGUN_DOMAIN",
    "MAILGUN_WEBHOOK_SIGNING_KEY",
  ],
  hubspot: ["HUBSPOT_PRIVATE_APP_TOKEN"],
  gemini: ["GEMINI_API_KEY"],
  spaces: ["SPACES_KEY", "SPACES_SECRET", "SPACES_BUCKET"],
  latido: ["LATIDO_URL"],
};

const secreto = z.string().min(32);
const urlPostgres = z.string().regex(/^postgres(ql)?:\/\//);
const correoTrycore = z.string().regex(/^[^@\s]+@trycore\.com$/);

const FORMATO: Record<string, z.ZodType<string>> = {
  APP_ENV: z.enum(["local", "ci", "staging", "produccion"]),
  DATABASE_URL: urlPostgres,
  DATABASE_DIRECT_URL: urlPostgres,
  EXPORT_DATABASE_URL: urlPostgres,
  MIGRATOR_DATABASE_URL: urlPostgres,
  MAILGUN_DOMAIN: z.string().regex(/^mg\./),
  SPACES_BUCKET: z.string().min(3),
  LATIDO_URL: z.url(),
  EXPORT_AGE_RECIPIENT: z.string().regex(/^age1/),
  PANEL_ADMIN_INICIAL: correoTrycore,
  // Origen público del portal con el que el panel compone el enlace `/e/#t=` (config, no secreto).
  PORTAL_ORIGEN: z.string().regex(/^https?:\/\/[^/\s]+$/),
  WORKER_PAUSADO: z.enum(["0", "1"]),
  HUBSPOT_PROP_CUENTA_ACTIVA: z.string().regex(/^[a-z0-9_]{1,100}$/),
  HUBSPOT_VALOR_CUENTA_ACTIVA: z.string().min(1).max(100),
  CORREO_TALENTO_HUMANO: correoTrycore,
};

export class ErrorConfiguracion extends Error {
  constructor(
    readonly proceso: Proceso,
    readonly faltan: string[],
    readonly invalidas: string[],
    readonly motivo?: string,
  ) {
    const partes = [
      faltan.length ? `faltan: ${faltan.join(", ")}` : "",
      invalidas.length ? `inválidas: ${invalidas.join(", ")}` : "",
      motivo ?? "",
    ].filter(Boolean);
    super(`configuración de ${proceso} incompleta (${partes.join("; ")})`);
    this.name = "ErrorConfiguracion";
  }
}

export type Configuracion = Readonly<Record<string, string | undefined>> & { readonly APP_ENV: AppEnv };

const DOBLES_DE = new WeakMap<Configuracion, ReadonlySet<Doble>>();

// Fronteras sustituidas por un doble declarado (solo local y ci).
export function doblesDe(config: Configuracion): ReadonlySet<Doble> {
  return DOBLES_DE.get(config) ?? new Set();
}

function leerDobles(proceso: Proceso, appEnv: string, crudo: string | undefined): Set<Doble> {
  const nombres = (crudo ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (nombres.length === 0) return new Set();
  if (appEnv !== "local" && appEnv !== "ci") {
    throw new ErrorConfiguracion(
      proceso,
      [],
      ["DOBLES"],
      `DOBLES no se admite con APP_ENV=${appEnv}`,
    );
  }
  const desconocidos = nombres.filter((n) => !DOBLES_VALIDOS.includes(n as Doble));
  if (desconocidos.length) {
    throw new ErrorConfiguracion(proceso, [], ["DOBLES"], "DOBLES contiene fronteras desconocidas");
  }
  return new Set(nombres as Doble[]);
}

export function cargarConfiguracion(
  proceso: Proceso,
  entorno: Readonly<Record<string, string | undefined>> = process.env,
): Configuracion {
  const appEnv = entorno.APP_ENV ?? "";
  const dobles = leerDobles(proceso, appEnv, entorno.DOBLES);
  const omitibles = new Set([...dobles].flatMap((d) => CREDENCIALES_DE[d]));

  const faltan: string[] = [];
  const invalidas: string[] = [];
  const valores: Record<string, string | undefined> = {};

  for (const nombre of VARIABLES[proceso]) {
    const valor = entorno[nombre];
    if (valor === undefined || valor === "") {
      if (!OPCIONALES.has(nombre) && !omitibles.has(nombre)) faltan.push(nombre);
      continue;
    }
    const formato = FORMATO[nombre] ?? secreto;
    if (!formato.safeParse(valor).success) {
      invalidas.push(nombre);
      continue;
    }
    valores[nombre] = valor;
  }

  if (faltan.length || invalidas.length) {
    throw new ErrorConfiguracion(proceso, faltan, invalidas);
  }
  const config: Configuracion = Object.freeze({ ...valores, APP_ENV: appEnv as AppEnv });
  DOBLES_DE.set(config, dobles);
  return config;
}

// Punto de entrada de cada proceso: sin configuración completa, sale con código 1
// antes de abrir puertos o conexiones. El registro nombra variables, nunca valores.
export function exigirConfiguracion(proceso: Proceso): Configuracion {
  try {
    return cargarConfiguracion(proceso);
  } catch (e) {
    if (e instanceof ErrorConfiguracion) {
      console.error(
        JSON.stringify({
          evento: "configuracion_invalida",
          proceso,
          faltan: e.faltan,
          invalidas: e.invalidas,
          motivo: e.motivo,
        }),
      );
      process.exit(1);
    }
    throw e;
  }
}
