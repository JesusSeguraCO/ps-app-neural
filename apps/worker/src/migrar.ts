// Job `migrar` (ADR-0010 CON-3): `node dist/migrar.js`, con `ps_migrador` por conexión directa.
// `--sembrar-ficticios` siembra los perfiles ficticios, las modalidades de prueba y las consultas sin
// coincidencia sintéticas y sale (local, CI y staging; EP-001 3.2, EP-006 1.8). Cada dato con el rol que
// lo escribe en producción: el del worker ya no escribe consentimientos ni catálogos (ADR-0009, 0026).
// Con `--heredados-incompletos` además siembra los cuatro publicados heredados sin SARO, DISC o
// modalidad (HU-178; opcional, para la demo del panel: no mueve los conteos del banco base).
// Falla (código ≠ 0) si no puede aplicar; admite la BD por delante y lo registra.
// `MIGRAR_HASTA=<nombre>` aplica solo hasta esa migración (incluida): es el primer paso de un
// expand/contract con datos que mueve el worker entre medias (EP-006 9.1: `MIGRAR_HASTA=0020_colocaciones`,
// luego `node dist/worker.js --migrar-colocados`, luego `migrar` sin la variable).
import pg from "pg";
import { exigirConfiguracion } from "@ps/infra/config";
import { MIGRACIONES, migrarHastaElFinal } from "@ps/infra/postgres/migrar";
import { sembrarFicticios, sembrarHeredadosIncompletos } from "./sembrar-ficticios";
import { sembrarLexicoFicticio } from "./sembrar-lexico";

const registrar = (e: Record<string, unknown>) =>
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...e }));
if (process.argv.includes("--sembrar-ficticios")) {
  const c = exigirConfiguracion("sembrar");
  if (c.APP_ENV === "produccion") {
    registrar({ evento: "ficticios_rechazado", motivo: "bloqueado en producción" });
    process.exit(1);
  }
  const panel = new pg.Pool({ connectionString: c.SEMBRAR_PANEL_URL, max: 2 });
  const worker = new pg.Pool({ connectionString: c.SEMBRAR_WORKER_URL, max: 1 });
  try {
    await sembrarFicticios({
      bd: panel,
      auditoria: { hmac: c.AUDIT_HMAC_KEY!, kek: c.AUDIT_KEK! },
      appEnv: c.APP_ENV,
      registrar,
    });
    await sembrarLexicoFicticio({ bd: panel, candidatas: worker, appEnv: c.APP_ENV, registrar });
    if (process.argv.includes("--heredados-incompletos"))
      await sembrarHeredadosIncompletos({
        bd: panel,
        auditoria: { hmac: c.AUDIT_HMAC_KEY!, kek: c.AUDIT_KEK! },
        appEnv: c.APP_ENV,
        registrar,
      });
    await Promise.all([panel.end(), worker.end()]);
    process.exit(0);
  } catch (e) {
    registrar({ evento: "ficticios_fallo", error: (e as Error).message });
    process.exit(1);
  }
}

const config = exigirConfiguracion("migrar");

const hasta = process.env.MIGRAR_HASTA;
if (hasta && !(hasta in MIGRACIONES)) {
  registrar({ evento: "migrar_fallo", error: `MIGRAR_HASTA «${hasta}» no es una migración conocida` });
  process.exit(1);
}
const migraciones = hasta
  ? Object.fromEntries(Object.entries(MIGRACIONES).filter(([nombre]) => nombre <= hasta))
  : MIGRACIONES;

migrarHastaElFinal(config.MIGRATOR_DATABASE_URL!, { registrar, migraciones })
  .then((r) => {
    registrar({ evento: "migrar_terminado", aplicadas: r.aplicadas, porDelante: r.porDelante });
    process.exit(0);
  })
  .catch((e) => {
    registrar({ evento: "migrar_fallo", error: (e as Error).message });
    process.exit(1);
  });
