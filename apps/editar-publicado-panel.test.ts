// Contrato HTTP de editar un publicado (EP-006 · sub-slice 6: HU-126, HU-129 «previsualizar un perfil
// ya publicado») contra el servidor standalone real del panel (`ps_panel`), por PgBouncer: el PATCH
// con `?previsualizar` declara qué cambia de cara al cliente (antes y después) sin escribir —el portal,
// leído con `ps_portal`, sigue con la versión vigente—; el PATCH sin él confirma; un cambio que deja el
// perfil incompleto responde 409 `deja_incompleto` con la pregunta de D1 y se resuelve con
// `?resolucion=descartar` o `?resolucion=a_borrador`. Permisos, CSRF e `If-Match` como el resto.
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { sembrarFicticios } from "./worker/src/sembrar-ficticios";
import { sembrarLexicoFicticio } from "./worker/src/sembrar-lexico";

describe.skipIf(!HAY_BD || !hayBuild("panel"))("Editar un publicado en el panel (HU-126)", () => {
  let bd: BdPrueba;
  let panel: ServidorPrueba;
  let portal: pg.Pool;
  let admin: string;
  let observador: string;
  const csrf = randomBytes(16).toString("hex");

  const sesion = async (correo: string, rol: "administrador" | "observador") => {
    const u = await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ($1, $2, $3) RETURNING id`,
      [correo, randomBytes(32), rol],
    );
    const id = randomBytes(32).toString("base64url");
    await bd.instalacion.query(
      `INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, expira) VALUES ($1, $2, now() + interval '12 hours')`,
      [createHash("sha256").update(id).digest(), u.rows[0].id],
    );
    return `__Host-pp=${id}`;
  };
  const pedir = (
    metodo: string,
    ruta: string,
    cuerpo: unknown,
    o: { cookie?: string; version?: number; sinCsrf?: boolean } = {},
  ) =>
    panel.pedir(ruta, {
      method: metodo,
      body: JSON.stringify(cuerpo),
      headers: {
        "content-type": "application/json",
        origin: panel.url,
        ...(o.sinCsrf ? {} : { "x-ps-csrf": csrf }),
        cookie: `__Host-csrf=${csrf}; ${o.cookie ?? admin}`,
        ...(o.version !== undefined ? { "if-match": `"${o.version}"` } : {}),
      },
    });
  const id = async (tabla: string, nombre: string) =>
    (await bd.instalacion.query(`SELECT id FROM inventario.${tabla} WHERE nombre = $1`, [nombre]))
      .rows[0]?.id as string;
  let ids: Record<"java" | "kafka", string>;

  // Un perfil completo con consentimiento nominal, publicado por la API.
  async function publicado() {
    const p = (
      await (
        await pedir("POST", "/api/v1/perfiles", {
          nombre: "Lorena",
          primerApellido: "Salcedo",
          rolId: await id("catalogo_roles", "Desarrolladora backend Java"),
          tecnologiaIds: [ids.java],
          seniorityId: await id("catalogo_seniorities", "Senior"),
          aniosExperiencia: 8,
          ciudadId: await id("catalogo_ciudades", "Medellín"),
          modalidadTrabajoId: await id("catalogo_modalidades", "hibrido"),
          disponibilidad: { opcion: "ahora" },
          modalidadPruebaId: await id(
            "catalogo_modalidades_prueba",
            "Prueba práctica revisada por un arquitecto",
          ),
          aporte: "Integraciones estables.",
          experiencias: [
            { cargo: "Backend senior", desde: 2021, descripcion: "Pagos inmediatos." },
          ],
        })
      ).json()
    ).perfil as { codigo: string };
    const c = (
      await (
        await pedir("POST", `/api/v1/perfiles/${p.codigo}/consentimiento`, {
          nombreApellido: true,
          trayectoria: true,
          clientes: true,
        })
      ).json()
    ).perfil as { version: number };
    const r = await pedir(
      "POST",
      `/api/v1/perfiles/${p.codigo}/publicar`,
      {},
      { version: c.version },
    );
    expect(r.status).toBe(200);
    return (await r.json()).perfil as { codigo: string; version: number; estado: string };
  }
  const enPortal = async (codigo: string) =>
    (
      await portal.query(
        `SELECT tecnologias FROM operacion.catalogo_publicable WHERE codigo = $1`,
        [codigo],
      )
    ).rows[0]?.tecnologias as string[] | undefined;
  const filasAuditoria = async (codigo: string) =>
    (
      await bd.instalacion.query(
        `SELECT count(*)::int AS n FROM auditoria.auditoria WHERE titular = $1`,
        [codigo],
      )
    ).rows[0].n as number;

  beforeAll(async () => {
    bd = await crearBdPrueba();
    const entorno = { ...entornoDev("panel"), APP_ENV: "ci", DATABASE_URL: bd.urlDe("ps_panel") };
    await sembrarFicticios({
      bd: bd.como("ps_panel"),
      auditoria: { hmac: entorno.AUDIT_HMAC_KEY!, kek: entorno.AUDIT_KEK! },
      appEnv: "ci",
      registrar: () => {},
    });
    await sembrarLexicoFicticio({ bd: bd.como("ps_panel"), candidatas: bd.como("ps_worker"), appEnv: "ci", registrar: () => {} });
    portal = bd.como("ps_portal");
    admin = await sesion("karen@trycore.com", "administrador");
    observador = await sesion("mirar@trycore.com", "observador");
    ids = {
      java: await id("catalogo_tecnologias", "Java"),
      kafka: await id("catalogo_tecnologias", "Kafka"),
    };
    panel = await arrancarServidor("panel", entorno);
  }, 120_000);

  afterAll(async () => {
    await panel?.cerrar();
    await bd?.cerrar();
  });

  it("?previsualizar: 200 con qué cambia para el cliente, lo interno aparte y nada escrito", async () => {
    const p = await publicado();
    const n = await filasAuditoria(p.codigo);
    const r = await pedir(
      "PATCH",
      `/api/v1/perfiles/${p.codigo}?previsualizar`,
      { tecnologiaIds: [ids.java, ids.kafka], aporte: "Acompañar migraciones a eventos." },
      { version: p.version },
    );
    expect(r.status).toBe(200);
    const d = await r.json();
    expect(d.impacto.cambios).toEqual([
      {
        campo: "tecnologias",
        etiqueta: "Tecnologías ancla",
        antes: "Java",
        despues: "Java · Kafka",
      },
    ]);
    expect(d.impacto.internos).toEqual(["aporte"]);
    expect(d.impacto.evaluacion.publicable).toBe(true);
    expect(d.perfil.version).toBe(p.version);
    // HU-129 edge: el portal sigue con la versión vigente mientras no se confirme.
    expect(await enPortal(p.codigo)).toEqual(["Java"]);
    expect(await filasAuditoria(p.codigo)).toBe(n);
  });

  it("confirmar (PATCH sin ?previsualizar): 200, el portal lo muestra y la auditoría lo registra", async () => {
    const p = await publicado();
    const n = await filasAuditoria(p.codigo);
    const r = await pedir(
      "PATCH",
      `/api/v1/perfiles/${p.codigo}`,
      { tecnologiaIds: [ids.java, ids.kafka] },
      { version: p.version },
    );
    expect(r.status).toBe(200);
    const d = await r.json();
    expect(d.perfil.estado).toBe("publicado");
    expect(await enPortal(p.codigo)).toEqual(["Java", "Kafka"]);
    expect(await filasAuditoria(p.codigo)).toBe(n + 1);
  });

  it("deja incompleto: `deja_incompleto` con la pregunta (200 al previsualizar, 409 al confirmar)", async () => {
    const p = await publicado();
    for (const [ruta, status] of [
      [`/api/v1/perfiles/${p.codigo}?previsualizar`, 200],
      [`/api/v1/perfiles/${p.codigo}`, 409],
    ] as const) {
      const r = await pedir("PATCH", ruta, { tecnologiaIds: [] }, { version: p.version });
      expect(r.status).toBe(status);
      const d = await r.json();
      expect(d.motivo).toBe("deja_incompleto");
      expect(d.pregunta).toBe(
        "Este cambio deja el perfil incompleto: ¿descarto el cambio o paso el perfil a borrador?",
      );
      expect(d.impacto.cambios).toEqual([
        { campo: "tecnologias", etiqueta: "Tecnologías ancla", antes: "Java", despues: null },
      ]);
      expect(d.impacto.evaluacion.faltanDatos.map((f: { campo: string }) => f.campo)).toEqual([
        "tecnologias",
      ]);
    }
    expect(await enPortal(p.codigo)).toEqual(["Java"]);
  });

  it("?resolucion=descartar: 200 sin escribir ni auditar; ?resolucion=a_borrador: sale del portal", async () => {
    const p = await publicado();
    const n = await filasAuditoria(p.codigo);
    const des = await pedir(
      "PATCH",
      `/api/v1/perfiles/${p.codigo}?resolucion=descartar`,
      { tecnologiaIds: [] },
      { version: p.version },
    );
    expect(des.status).toBe(200);
    expect((await des.json()).descartado).toBe(true);
    expect(await filasAuditoria(p.codigo)).toBe(n);
    expect(await enPortal(p.codigo)).toEqual(["Java"]);

    const bor = await pedir(
      "PATCH",
      `/api/v1/perfiles/${p.codigo}?resolucion=a_borrador`,
      { tecnologiaIds: [] },
      { version: p.version },
    );
    expect(bor.status).toBe(200);
    expect((await bor.json()).perfil.estado).toBe("borrador");
    expect(await enPortal(p.codigo)).toBeUndefined();
    expect(await filasAuditoria(p.codigo)).toBe(n + 3);
  });

  it("versión, entrada, permisos y CSRF", async () => {
    const p = await publicado();
    const ruta = `/api/v1/perfiles/${p.codigo}?previsualizar`;
    expect((await pedir("PATCH", ruta, { aniosExperiencia: 9 })).status).toBe(428);
    const vieja = await pedir("PATCH", ruta, { aniosExperiencia: 9 }, { version: p.version - 1 });
    expect(vieja.status).toBe(409);
    expect((await vieja.json()).motivo).toBe("version_distinta");
    expect(
      (
        await pedir(
          "PATCH",
          `/api/v1/perfiles/${p.codigo}?resolucion=otra`,
          {},
          { version: p.version },
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await pedir(
          "PATCH",
          ruta,
          { aniosExperiencia: 9 },
          { version: p.version, cookie: observador },
        )
      ).status,
    ).toBe(403);
    expect(
      (await pedir("PATCH", ruta, { aniosExperiencia: 9 }, { version: p.version, sinCsrf: true }))
        .status,
    ).toBe(403);
  });

  it("el editor de un publicado ofrece «Guardar cambios» y no «Publicar»", async () => {
    const p = await publicado();
    const html = await (
      await panel.pedir(`/inventario/${p.codigo}`, { headers: { cookie: admin } })
    ).text();
    expect(html).toContain("Guardar cambios");
    expect(html).not.toContain("Guardar borrador");
    expect(html).toContain("al guardar verás qué cambia para el cliente");
  });
});
