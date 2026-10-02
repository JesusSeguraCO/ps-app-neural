// Worker de trabajo diferido (ADR-0009 §3). `node dist/worker.js`:
//   --comprobar          valida la configuración y sale (0 si es válida; V8-11)
//   --proponer-lexico    corre una vez la tarea semanal `proponer_lexico` y sale (EP-006 1.7)
//   --migrar-colocados   pasa los perfiles en estado `colocado` a publicado con su colocación y sale
//                        (EP-006 9.1; requisito de la migración 0021). También corre al arrancar.
// Sin configuración completa sale con código 1 antes de abrir conexiones (V8-9).
import { randomUUID } from "node:crypto";
import pg from "pg";
import { doblesDe, exigirConfiguracion } from "@ps/infra/config";
import { DobleGemini, proponedorGemini, type ProponedorLexico } from "@ps/infra/gemini/lexico";
import { DobleCorreo, enviadorMailgun, rebotesDelDoble, type EnviadorCorreo } from "@ps/infra/mailgun/index";
import { vuelta, type ContextoDespacho } from "./despacho";
import { registrarTareas, vueltaPlanificador, type Tarea } from "./planificador";
import { migrarColocados } from "@ps/infra/postgres/colocados";
import { proponerLexico } from "./proponer-lexico";
import { sembrarAdminInicial } from "./sembrar";

const registrar = (e: Record<string, unknown>) =>
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...e }));

const config = exigirConfiguracion("worker");

if (process.argv.includes("--comprobar")) {
  registrar({ evento: "configuracion_valida", proceso: "worker", app_env: config.APP_ENV });
  process.exit(0);
}

const correo: EnviadorCorreo = doblesDe(config).has("mailgun")
  ? new DobleCorreo(
      (m) => registrar({ evento: "correo_doble", para: m.para, asunto: m.asunto, texto: m.texto }),
      undefined,
      {
        buzones: rebotesDelDoble(process.env.DOBLE_MAILGUN_REBOTA),
        alRebotar: (para) => registrar({ evento: "correo_doble_rebote", para }),
      },
    )
  : enviadorMailgun({ clave: config.MAILGUN_SENDING_KEY!, dominio: config.MAILGUN_DOMAIN! });

// Frontera `llm-interpreter`: con el doble declarado solo se registra qué consultas recibiría (ids).
const proponedor: ProponedorLexico = doblesDe(config).has("gemini")
  ? (() => {
      const doble = new DobleGemini();
      return {
        proponer: (lote) => {
          registrar({ evento: "gemini_doble", consultas: lote.consultas.map((c) => c.id) });
          return doble.proponer(lote);
        },
      };
    })()
  : proponedorGemini({ clave: config.GEMINI_API_KEY! });

const bd = new pg.Pool({ connectionString: config.DATABASE_URL, max: 5 });

const TAREAS: Tarea[] = [
  {
    nombre: "proponer_lexico",
    intervalo: "7 days",
    tope: "10 minutes",
    critica: false,
    ejecutar: async () => {
      const r = await proponerLexico({ bd, proponedor, registrar });
      return { fallo: r.fallo, detalle: { enviadas: r.enviadas, omitidas: r.omitidas, propuestas: r.propuestas } };
    },
  },
];

const clavesAuditoria = { hmac: config.AUDIT_HMAC_KEY!, kek: config.AUDIT_KEK! };

if (process.argv.includes("--migrar-colocados")) {
  try {
    const r = await migrarColocados(bd, clavesAuditoria);
    registrar({ evento: "colocados_migrados", ...r });
    await bd.end();
    process.exit(0);
  } catch (e) {
    registrar({ evento: "migrar_colocados_error", error: (e as Error).message });
    process.exit(1);
  }
}

if (process.argv.includes("--proponer-lexico")) {
  try {
    const r = await proponerLexico({ bd, proponedor, registrar });
    await bd.end();
    process.exit(r.fallo ? 1 : 0);
  } catch (e) {
    registrar({ evento: "proponer_lexico_error", error: (e as Error).message });
    process.exit(1);
  }
}
const escucha = new pg.Client({ connectionString: config.DATABASE_DIRECT_URL });

const ctx: ContextoDespacho = {
  bd,
  correo,
  peppers: { cliente: config.OTP_PEPPER_CLIENTE!, panel: config.OTP_PEPPER_PANEL! },
  reclamo: `worker-${randomUUID()}`,
  registrar,
  renovacion: {
    portalOrigen: config.PORTAL_ORIGEN!,
    correoTalentoHumano: config.CORREO_TALENTO_HUMANO!,
    auditoria: { hmac: config.AUDIT_HMAC_KEY!, kek: config.AUDIT_KEK! },
  },
  importacion: { auditoria: { hmac: config.AUDIT_HMAC_KEY!, kek: config.AUDIT_KEK! } },
};
const pausado = config.WORKER_PAUSADO === "1";

let deteniendo = false;
let despertar: (() => void) | null = null;

async function bucle(): Promise<void> {
  while (!deteniendo) {
    try {
      if (pausado) {
        await bd.query(
          `INSERT INTO operacion.worker_ciclo (id, ultima_vuelta) VALUES (1, now())
           ON CONFLICT (id) DO UPDATE SET ultima_vuelta = excluded.ultima_vuelta`,
        );
      } else {
        await vuelta(ctx);
        await vueltaPlanificador(bd, ctx.reclamo, TAREAS, registrar);
      }
    } catch (e) {
      registrar({ evento: "vuelta_error", error: (e as Error).message });
    }
    // Al recibir NOTIFY o cada 5 s.
    await new Promise<void>((res) => {
      const t = setTimeout(res, 5_000);
      despertar = () => {
        clearTimeout(t);
        res();
      };
    });
    despertar = null;
  }
}

async function arrancar(): Promise<void> {
  await escucha.connect();
  escucha.on("notification", () => despertar?.());
  await escucha.query("LISTEN trabajos");
  await sembrarAdminInicial(
    {
      bd,
      auditoria: { hmac: config.AUDIT_HMAC_KEY!, kek: config.AUDIT_KEK! },
      emailHmac: config.EMAIL_HMAC_KEY!,
      registrar,
    },
    config.PANEL_ADMIN_INICIAL!,
  );
  // Antes de la 0021 (contract): sin colocados por migrar no hace nada. Si la columna ya no existe, la
  // BD ya está en la 0021 y no queda nada que mover.
  try {
    const r = await migrarColocados(bd, clavesAuditoria);
    if (r.migrados) registrar({ evento: "colocados_migrados", ...r });
  } catch (e) {
    if ((e as { code?: string }).code !== "42703")
      registrar({ evento: "migrar_colocados_error", error: (e as Error).message });
  }
  await registrarTareas(bd, TAREAS);
  registrar({ evento: "worker_arrancado", pid: process.pid, pausado, dobles: [...doblesDe(config)] });
  await bucle();
}

async function apagar(senal: string): Promise<void> {
  if (deteniendo) return;
  deteniendo = true;
  despertar?.();
  // Devuelve las filas en curso de este proceso para que otro las retome sin esperar el arrendamiento.
  await bd
    .query(
      `UPDATE operacion.trabajos SET estado = 'pendiente', locked_by = NULL, locked_until = NULL
        WHERE locked_by = $1 AND estado = 'en_curso'`,
      [ctx.reclamo],
    )
    .catch(() => {});
  await escucha.end().catch(() => {});
  await bd.end().catch(() => {});
  registrar({ evento: "worker_detenido", senal });
  process.exit(0);
}

process.on("SIGTERM", () => void apagar("SIGTERM"));
process.on("SIGINT", () => void apagar("SIGINT"));

arrancar().catch((e) => {
  registrar({ evento: "worker_fallo_arranque", error: (e as Error).message });
  process.exit(1);
});
