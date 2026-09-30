// Job `migrar` (ADR-0010 CON-3): `node dist/migrar.js`, con `ps_migrador` por conexión directa.
// Falla (código ≠ 0) si no puede aplicar; admite la BD por delante y lo registra.
import { exigirConfiguracion } from "@ps/infra/config";
import { migrarHastaElFinal } from "@ps/infra/postgres/migrar";

const registrar = (e: Record<string, unknown>) =>
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...e }));
const config = exigirConfiguracion("migrar");

migrarHastaElFinal(config.MIGRATOR_DATABASE_URL!, { registrar })
  .then((r) => {
    registrar({ evento: "migrar_terminado", aplicadas: r.aplicadas, porDelante: r.porDelante });
    process.exit(0);
  })
  .catch((e) => {
    registrar({ evento: "migrar_fallo", error: (e as Error).message });
    process.exit(1);
  });
