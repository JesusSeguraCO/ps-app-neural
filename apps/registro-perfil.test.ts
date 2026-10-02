// Registro de auditoría por perfil (EP-006 · sub-slice 10: HU-138) contra el panel standalone real (`ps_panel`),
// con historia generada por las vías reales (panel por HTTP; importación, reversión y carga de Operaciones
// por sus servicios con `ps_panel`/`ps_worker`): la página muestra campo, antes, después, quién y cuándo
// para ambos roles; la importación enlaza a su lote y la carga muestra su fecha de corte; un perfil
// archivado conserva todo su historial; una sesión vencida no aplica nada ni deja cambios sin autor.
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CAMPOS_IMPORTACION, leer } from "@ps/contratos/importacion";
import { hmacCorreo } from "@ps/dominio/acceso/codigo";
import { proponerEmparejamiento } from "@ps/dominio/importacion/emparejar";
import { calcularPlan, mapearFilas } from "@ps/dominio/importacion/plan";
import { aplicarLote } from "@ps/infra/postgres/aplicar-importacion";
import { cargarOperaciones } from "@ps/infra/postgres/colocados";
import {
  bancoEnFormato,
  catalogosImportacion,
  confirmarLote,
  registrarLote,
} from "@ps/infra/postgres/importacion";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { sembrarFicticios } from "./worker/src/sembrar-ficticios";

const HOY = new Date().toISOString().slice(0, 10);
const enDias = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
const plano = (html: string) =>
  html
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

describe.skipIf(!HAY_BD || !hayBuild("panel"))("Registro de auditoría por perfil (HU-138)", () => {
  let bd: BdPrueba;
  let panel: ServidorPrueba;
  let admin: string;
  let observadora: string;
  let vencida: string;
  let karen: { usuarioId: string; correo: string };
  let codigo: string;
  let loteId: string;
  const csrf = randomBytes(16).toString("hex");
  const env = entornoDev("panel");
  const claves = { hmac: env.AUDIT_HMAC_KEY!, kek: env.AUDIT_KEK! };

  async function usuario(correo: string, rol: "administrador" | "observador") {
    const u = await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ($1, $2, $3) RETURNING id`,
      [correo, hmacCorreo(correo, env.EMAIL_HMAC_KEY!), rol],
    );
    return u.rows[0].id as string;
  }
  async function sesion(
    id: string,
    rol: "administrador" | "observador",
    expira = "now() + interval '12 hours'",
  ) {
    const s = randomBytes(32).toString("base64url");
    await bd.instalacion.query(
      `INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, expira, rol_al_abrir, creada)
       VALUES ($1, $2, ${expira}, $3, ${expira} - interval '12 hours')`,
      [createHash("sha256").update(s).digest(), id, rol],
    );
    return `__Host-pp=${s}`;
  }
  const pedir = (
    metodo: string,
    ruta: string,
    cuerpo: unknown,
    cookie: string,
    extra: Record<string, string> = {},
  ) =>
    panel.pedir(ruta, {
      method: metodo,
      body: JSON.stringify(cuerpo),
      headers: {
        "content-type": "application/json",
        origin: panel.url,
        "x-ps-csrf": csrf,
        cookie: `__Host-csrf=${csrf}; ${cookie}`,
        ...extra,
      },
    });
  const pagina = async (ruta: string, cookie = admin) => {
    const r = await panel.pedir(ruta, { headers: { cookie } });
    return { status: r.status, html: await r.text() };
  };
  const filasAuditoria = async (titular: string) =>
    (
      await bd.instalacion.query(
        `SELECT count(*)::int AS n, count(*) FILTER (WHERE btrim(actor) = '')::int AS sin_autor
           FROM auditoria.auditoria WHERE titular = $1`,
        [titular],
      )
    ).rows[0] as { n: number; sin_autor: number };

  beforeAll(async () => {
    bd = await crearBdPrueba();
    const worker = bd.como("ps_worker");
    const ps = bd.como("ps_panel");
    await sembrarFicticios({ bd: bd.como("ps_panel"), auditoria: claves, appEnv: "ci", registrar: () => {} });
    const idKaren = await usuario("karen.rodriguez@trycore.com", "administrador");
    karen = { usuarioId: idKaren, correo: "karen.rodriguez@trycore.com" };
    admin = await sesion(idKaren, "administrador");
    observadora = await sesion(
      await usuario("mariana.velez@trycore.com", "observador"),
      "observador",
    );
    vencida = await sesion(idKaren, "administrador", "now() - interval '1 minute'");
    panel = await arrancarServidor("panel", {
      ...env,
      APP_ENV: "ci",
      DATABASE_URL: bd.urlDe("ps_panel"),
    });

    // Alta y edición por HTTP, como lo hace la administradora.
    const alta = await pedir(
      "POST",
      "/api/v1/perfiles",
      { nombre: "Laura", primerApellido: "Méndez" },
      admin,
    );
    expect(alta.status).toBe(201);
    const perfil = (await alta.json()).perfil as { codigo: string; version: number };
    codigo = perfil.codigo;
    const edicion = await pedir(
      "PATCH",
      `/api/v1/perfiles/${codigo}`,
      { aniosExperiencia: 9 },
      admin,
      {
        "if-match": `"${perfil.version}"`,
      },
    );
    expect(edicion.status).toBe(200);

    // Importación que la aplica el worker.
    const lectura = leer(["Código\tAños de experiencia", `${codigo}\t11`].join("\n"), "tsv");
    if (!lectura.ok) throw new Error(lectura.motivo);
    const filas = mapearFilas(
      lectura.tabla,
      proponerEmparejamiento(lectura.tabla.encabezados, CAMPOS_IMPORTACION),
    );
    const banco = await bancoEnFormato(ps);
    loteId = await registrarLote(ps, karen, {
      archivoHash: randomBytes(32).toString("hex"),
      formato: "tsv",
      modo: "crear_y_actualizar",
      emparejamiento: [],
      filas,
      plan: calcularPlan({
        filas,
        modo: "crear_y_actualizar",
        banco: new Map(banco.map((f) => [f.codigo as string, f])),
        catalogos: await catalogosImportacion(ps),
        hoy: HOY,
      }),
    });
    await bd.instalacion.query(
      `UPDATE inventario.lotes_importacion SET archivo_nombre = 'inventario-sep.tsv' WHERE id = $1`,
      [loteId],
    );
    await confirmarLote(ps, karen, loteId);
    expect((await aplicarLote(worker, claves, loteId, { hoy: HOY })).tipo).toBe("aplicado");

    // Carga de Operaciones sobre un publicado.
    await cargarOperaciones(ps, claves, karen, {
      nombre: "asignaciones.csv",
      texto: [
        "Código del perfil,Cliente,Fecha de inicio,Fecha de liberación",
        `PS-0142,Bancolombia,${enDias(-10)},${enDias(60)}`,
      ].join("\n"),
    });

    // Archivar por HTTP.
    expect((await pedir("POST", `/api/v1/perfiles/${codigo}/archivar`, {}, admin)).status).toBe(
      200,
    );
  }, 180_000);

  afterAll(async () => {
    await panel?.cerrar();
    await bd?.cerrar();
  });

  it("happy: la administradora ve campo, antes, después, quién y cuándo; estado igual que el contenido", async () => {
    const { status, html } = await pagina(`/inventario/${codigo}/auditoria`);
    expect(status).toBe(200);
    const t = plano(html);
    expect(t).toContain("Registro de auditoría");
    expect(t).toMatch(/Cuándo Campo Antes Después Quién/);
    expect(t).toMatch(
      /Años de experiencia Contenido 9 11 Importación «inventario-sep\.tsv» confirmó karen\.rodriguez@trycore\.com/,
    );
    expect(t).toMatch(/Años de experiencia Contenido Sin valor 9 KR karen\.rodriguez@trycore\.com/);
    expect(t).toMatch(
      /Publicación Estado y publicación Borrador Archivado KR karen\.rodriguez@trycore\.com/,
    );
    expect(t).toMatch(/\d{1,2} [a-z]{3} \d{4}, \d{1,2}:\d{2} [ap]\. m\./);
  });

  it("edge: la importación enlaza al registro de su lote", async () => {
    const { html } = await pagina(`/inventario/${codigo}/auditoria?quien=importaciones`);
    expect(html).toContain(`href="/importar?lote=${loteId}"`);
    const t = plano(html);
    expect(t).not.toContain("Publicación Estado y publicación");
    expect((await pagina(`/importar?lote=${loteId}`)).status).toBe(200);
  });

  it("edge: la carga de Operaciones lleva quién la hizo y la fecha de corte", async () => {
    const t = plano((await pagina(`/inventario/PS-0142/auditoria?quien=cargas`)).html);
    expect(t).toMatch(
      /Disponibilidad .* Carga de Operaciones «asignaciones\.csv» corte \d{1,2} [a-z]{3} \d{4}, \d{1,2}:\d{2} [ap]\. m\. · cargó karen\.rodriguez@trycore\.com/,
    );
    expect(t).toContain("Colocación");
  });

  it("edge: un perfil archivado conserva su historial completo y lo dice en la cabecera", async () => {
    const t = plano((await pagina(`/inventario/${codigo}/auditoria`)).html);
    expect(t).toMatch(/Archivado el \d{1,2} [a-z]{3} \d{4} · no aparece en el portal/);
    expect(t).toMatch(/Nombre Contenido Sin valor Laura/);
    expect(t).not.toContain("Editar perfil");
  });

  it("la observadora también lo consulta, sin editar y con los datos en la vista de la ficha", async () => {
    const { status, html } = await pagina(`/inventario/PS-0142/auditoria`, observadora);
    expect(status).toBe(200);
    expect(html).toContain(`href="/inventario/PS-0142?vista=ficha"`);
    expect(html).not.toContain("Editar perfil");
    expect(plano(html)).toContain("Carga de Operaciones «asignaciones.csv»");
    expect((await pagina(`/inventario/PS-9999/auditoria`)).status).toBe(404);
  });

  it("error: con la sesión vencida el cambio no se aplica, se pide volver a entrar y no queda ningún cambio sin autor", async () => {
    const antes = await filasAuditoria("PS-0151");
    const r = await pedir("PATCH", "/api/v1/perfiles/PS-0151", { aniosExperiencia: 30 }, vencida, {
      "if-match": '"1"',
    });
    expect(r.status).toBe(401);
    const despues = await filasAuditoria("PS-0151");
    expect(despues.n).toBe(antes.n);
    // La página con esa sesión manda a la puerta.
    const p = await panel.pedir(`/inventario/PS-0151/auditoria`, {
      headers: { cookie: vencida },
      redirect: "manual",
    });
    expect([302, 303, 307]).toContain(p.status);
    expect(p.headers.get("location")).toContain("/acceso");
    for (const c of [codigo, "PS-0142", "PS-0151"])
      expect((await filasAuditoria(c)).sin_autor).toBe(0);
  });
});
