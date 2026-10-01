// Job `migrar` (ADR-0010 CON-3): `node dist/migrar.js`, con `ps_migrador` por conexión directa.
// Falla (código ≠ 0) si no puede aplicar; admite la BD por delante y lo registra.
// `MIGRAR_HASTA=<nombre>` aplica solo hasta esa migración (incluida): es el primer paso de un
// expand/contract con datos que mueve el worker entre medias (EP-006 9.1: `MIGRAR_HASTA=0020_colocaciones`,
// luego `node dist/worker.js --migrar-colocados`, luego `migrar` sin la variable).
import { exigirConfiguracion } from "@ps/infra/config";
import { MIGRACIONES, migrarHastaElFinal } from "@ps/infra/postgres/migrar";

const registrar = (e: Record<string, unknown>) =>
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...e }));
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
