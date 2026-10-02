// Siembra de la colección Newman de EP-006 (tarea 11.2) en una BD EFÍMERA propia (no la de desarrollo):
// roles y migraciones, perfiles y léxico ficticios, una administradora y una observadora del panel con su
// sesión abierta, dos propuestas de léxico pendientes (aprobar y rechazar) y los identificadores de
// catálogo que la colección usa. Escribe `.local/newman-ep-006/entorno.json` (URL de la BD para el panel y
// el worker) y `vars.txt` (variables de Newman). La BD se borra al final de `correr-ep-006.sh`.
//   eval "$(scripts/bd-local.sh entorno)"; npx tsx --conditions=react-server tests/postman/sembrar-ep-006.mts <RUN>
import { createHash, randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { hmacCorreo } from "@ps/dominio/acceso/codigo";
import { crearBdPrueba } from "@ps/infra/pruebas/bd-prueba";
import { sembrarFicticios } from "../../apps/worker/src/sembrar-ficticios";
import { sembrarLexicoFicticio } from "../../apps/worker/src/sembrar-lexico";

const RUN = process.argv[2] ?? String(Date.now());
const s = (n: string) => `dev-${n}-0123456789abcdef0123456789abcdef`;
const auditoria = { hmac: s("auditoria"), kek: s("kek") };
const DIR = new URL("../../.local/newman-ep-006/", import.meta.url);
mkdirSync(DIR, { recursive: true });

const bd = await crearBdPrueba();
const worker = bd.como("ps_worker");
await sembrarFicticios({ bd: worker, auditoria, appEnv: "ci", registrar: () => {} });
await sembrarLexicoFicticio({ bd: worker, appEnv: "ci", registrar: () => {} });
const i = bd.instalacion;

async function usuario(correo: string, rol: "administrador" | "observador") {
  const u = await i.query(
    `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ($1, $2, $3) RETURNING id`,
    [correo, hmacCorreo(correo, s("email")), rol],
  );
  const sesion = randomBytes(32).toString("base64url");
  await i.query(
    `INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, expira, rol_al_abrir)
     VALUES ($1, $2, now() + interval '11 hours', $3)`,
    [createHash("sha256").update(sesion).digest(), u.rows[0].id, rol],
  );
  return { id: u.rows[0].id as string, sesion };
}
const admin = await usuario(`newman-adm-${RUN}@trycore.com`, "administrador");
const obs = await usuario(`newman-obs-${RUN}@trycore.com`, "observador");

const id = async (tabla: string, nombre: string) =>
  (await i.query(`SELECT id FROM inventario.${tabla} WHERE nombre = $1`, [nombre])).rows[0]
    ?.id as string;
const propuesta = async (termino: string, equivalencias: Array<{ tipo: string; id: string }>) =>
  (
    await i.query(
      `INSERT INTO inventario.propuestas_lexico (termino, sinonimos, equivalencias, ejemplo, busquedas, cuentas, consultas)
       VALUES ($1, '{}', $2, $3, 4, 3, '{}') RETURNING id`,
      [termino, JSON.stringify(equivalencias), `perfil con ${termino}`],
    )
  ).rows[0].id as string;
const seguros = await id("catalogo_sectores", "Seguros");
const candidata = (
  await i.query(`SELECT id FROM inventario.candidatas_lexico WHERE destino IS NULL ORDER BY consulta LIMIT 1`)
).rows[0]?.id as string;

const vars: Record<string, string> = {
  run: RUN,
  adminSesion: admin.sesion,
  adminId: admin.id,
  obsSesion: obs.sesion,
  obsId: obs.id,
  rolId: await id("catalogo_roles", "Desarrolladora backend Java"),
  tecnologiaId: await id("catalogo_tecnologias", "Kafka"),
  javaId: await id("catalogo_tecnologias", "Java"),
  seniorityId: await id("catalogo_seniorities", "Senior"),
  ciudadId: await id("catalogo_ciudades", "Medellín"),
  modalidadId: await id("catalogo_modalidades", "hibrido"),
  modalidadPruebaId: await id(
    "catalogo_modalidades_prueba",
    "Prueba práctica revisada por un arquitecto",
  ),
  motivoPausaId: (await i.query(`SELECT id FROM inventario.catalogo_motivos_pausa ORDER BY nombre LIMIT 1`))
    .rows[0].id,
  propuestaAprobar: await propuesta(`aseguradoras ${RUN}`, [{ tipo: "sector", id: seguros }]),
  propuestaRechazar: await propuesta(`mensajería ${RUN}`, [{ tipo: "sector", id: seguros }]),
  candidataId: candidata,
  hoy: new Date(Date.now() - 5 * 3_600_000).toISOString().slice(0, 10),
  enSesenta: new Date(Date.now() - 5 * 3_600_000 + 60 * 86_400_000).toISOString().slice(0, 10),
  enNoventa: new Date(Date.now() - 5 * 3_600_000 + 90 * 86_400_000).toISOString().slice(0, 10),
};
for (const [k, v] of Object.entries(vars)) if (!v) throw new Error(`siembra: falta ${k}`);

writeFileSync(
  new URL("entorno.json", DIR),
  JSON.stringify(
    {
      BD: bd.nombre,
      PANEL_URL: bd.urlDe("ps_panel"),
      WORKER_URL: bd.urlDe("ps_worker"),
      WORKER_DIRECTA: bd.urlDe("ps_worker", { directa: true }),
      EXPORT_URL: bd.urlDe("ps_exportador", { directa: true }),
      ADMIN: `newman-adm-${RUN}@trycore.com`,
    },
    null,
    2,
  ),
);
writeFileSync(
  new URL("vars.txt", DIR),
  Object.entries(vars)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n") + "\n",
);
console.log(bd.nombre);
process.exit(0);
