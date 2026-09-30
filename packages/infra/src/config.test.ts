import { describe, expect, it } from "vitest";
import {
  ErrorConfiguracion,
  OPCIONALES, VARIABLES, cargarConfiguracion, doblesDe, type Proceso } from "./config";

const SECRETO = "s".repeat(48);

// Entorno completo y válido por proceso (ADR-0010 §3.3), sin dobles.
function entornoCompleto(proceso: Proceso): Record<string, string> {
  const valores: Record<string, string> = {
    APP_ENV: "produccion",
    DATABASE_URL: "postgres://ps_x:clave@pool:6432/ps",
    DATABASE_DIRECT_URL: "postgres://ps_worker:clave@bd:5432/ps",
    EXPORT_DATABASE_URL: "postgres://ps_exportador:clave@bd:5432/ps",
    MIGRATOR_DATABASE_URL: "postgres://ps_migrador:clave@bd:5432/ps",
    MAILGUN_DOMAIN: "mg.people.trycore.com",
    SPACES_BUCKET: "ps-evidencias",
    LATIDO_URL: "https://latido.example/ping",
    EXPORT_AGE_RECIPIENT: "age1ejemplo",
    PANEL_ADMIN_INICIAL: "admin@trycore.com",
    PORTAL_ORIGEN: "https://people.trycore.com",
    WORKER_PAUSADO: "0",
    CORREO_TALENTO_HUMANO: "people.service@trycore.com",
  };
  const entorno: Record<string, string> = {};
  for (const nombre of VARIABLES[proceso]) {
    entorno[nombre] = valores[nombre] ?? SECRETO;
  }
  return entorno;
}

const obligatoriasPorProceso: Array<[Proceso, string]> = (
  ["portal", "panel", "worker", "migrar"] as const
).flatMap((p) =>
  VARIABLES[p]
    .filter((v) => !OPCIONALES.has(v))
    .map((v) => [p, v] as [Proceso, string]),
);

describe("cargarConfiguracion (V8-9)", () => {
  it.each(["portal", "panel", "worker", "migrar"] as const)(
    "acepta el entorno completo de %s",
    (proceso) => {
      const config = cargarConfiguracion(proceso, entornoCompleto(proceso));
      expect(config.APP_ENV).toBe("produccion");
    },
  );

  it.each(obligatoriasPorProceso)("rechaza %s sin %s y nombra la variable", (proceso, variable) => {
    const entorno = entornoCompleto(proceso);
    delete entorno[variable];
    expect(() => cargarConfiguracion(proceso, entorno)).toThrowError(ErrorConfiguracion);
    try {
      cargarConfiguracion(proceso, entorno);
    } catch (e) {
      expect((e as ErrorConfiguracion).faltan).toContain(variable);
    }
  });

  it("el error nunca incluye valores de secretos", () => {
    const entorno = entornoCompleto("portal");
    entorno.EMAIL_HMAC_KEY = "corto";
    try {
      cargarConfiguracion("portal", entorno);
      expect.unreachable();
    } catch (e) {
      expect(String((e as Error).message)).not.toContain("corto");
      expect((e as ErrorConfiguracion).invalidas).toContain("EMAIL_HMAC_KEY");
    }
  });

  it("cada proceso recibe solo sus variables: el portal no conoce el pepper del panel", () => {
    expect(VARIABLES.portal).not.toContain("OTP_PEPPER_PANEL");
    expect(VARIABLES.panel).not.toContain("OTP_PEPPER_CLIENTE");
    expect(VARIABLES.portal).not.toContain("AUDIT_HMAC_KEY");
  });

  it("no existen variables retiradas", () => {
    for (const proceso of ["portal", "panel", "worker", "migrar"] as const) {
      expect(VARIABLES[proceso]).not.toContain("LINK_SIGNING_SECRET");
      expect(VARIABLES[proceso]).not.toContain("OTP_PEPPER");
      expect(VARIABLES[proceso]).not.toContain("MAILGUN_API_KEY");
    }
  });
});

describe("dobles declarados", () => {
  it("en local un doble permite omitir la credencial de su frontera", () => {
    const entorno = entornoCompleto("worker");
    entorno.APP_ENV = "local";
    entorno.DOBLES = "mailgun,gemini";
    delete entorno.MAILGUN_SENDING_KEY;
    delete entorno.MAILGUN_SUPPRESSIONS_KEY;
    delete entorno.MAILGUN_DOMAIN;
    delete entorno.GEMINI_API_KEY;
    const config = cargarConfiguracion("worker", entorno);
    expect(doblesDe(config)).toEqual(new Set(["mailgun", "gemini"]));
  });

  it("sin declarar el doble la credencial sigue siendo obligatoria", () => {
    const entorno = entornoCompleto("worker");
    entorno.APP_ENV = "local";
    entorno.DOBLES = "gemini";
    delete entorno.MAILGUN_SENDING_KEY;
    expect(() => cargarConfiguracion("worker", entorno)).toThrowError(ErrorConfiguracion);
  });

  it.each(["produccion", "staging"])("con APP_ENV=%s se rechaza cualquier doble", (appEnv) => {
    const entorno = entornoCompleto("portal");
    entorno.APP_ENV = appEnv;
    entorno.DOBLES = "mailgun";
    expect(() => cargarConfiguracion("portal", entorno)).toThrowError(/DOBLES/);
  });

  it("rechaza un doble desconocido", () => {
    const entorno = entornoCompleto("portal");
    entorno.APP_ENV = "ci";
    entorno.DOBLES = "redis";
    expect(() => cargarConfiguracion("portal", entorno)).toThrowError(/DOBLES/);
  });
});
