// Contrato HTTP de colocados (EP-006 · sub-slice 9: HU-137) contra el servidor standalone real del panel
// (`ps_panel`): registrar un colocado con su autor como fuente y la disponibilidad = liberación que el
// portal (`ps_portal`) ve de inmediato; sin fecha de liberación no se guarda nada; la pestaña ordenada
// por vencimiento con los de 60 días destacados; el colocado sigue publicado en el inventario; la
// observadora la consulta sin registrar y recibe 403 al escribir. Base tomada de vigencia-panel.test.ts.
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

const BOGOTA_MS = -5 * 3_600_000;
const enDias = (n: number) =>
  new Date(Date.now() + BOGOTA_MS + n * 86_400_000).toISOString().slice(0, 10);

describe.skipIf(!HAY_BD || !hayBuild("panel"))("Colocados en el panel (HU-137)", () => {
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
    ruta: string,
    cuerpo: unknown,
    o: { cookie?: string; version?: number; sinCsrf?: boolean } = {},
  ) =>
    panel.pedir(ruta, {
      method: "POST",
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

  async function publicado(nombre: string) {
    const p = (
      await (
        await pedir("/api/v1/perfiles", {
          nombre,
          primerApellido: "Salcedo",
          rolId: await id("catalogo_roles", "Desarrolladora backend Java"),
          tecnologiaIds: [await id("catalogo_tecnologias", "Java")],
          seniorityId: await id("catalogo_seniorities", "Senior"),
          aniosExperiencia: 8,
          ciudadId: await id("catalogo_ciudades", "Medellín"),
          modalidadTrabajoId: await id("catalogo_modalidades", "hibrido"),
          disponibilidad: { opcion: "ahora" },
          modalidadPruebaId: await id(
            "catalogo_modalidades_prueba",
            "Prueba práctica revisada por un arquitecto",
          ),
          experiencias: [
            { cargo: "Backend senior", desde: 2021, descripcion: "Pagos inmediatos." },
          ],
        })
      ).json()
    ).perfil as { codigo: string };
    const c = (
      await (
        await pedir(`/api/v1/perfiles/${p.codigo}/consentimiento`, {
          nombreApellido: true,
          trayectoria: true,
          clientes: true,
        })
      ).json()
    ).perfil as { version: number };
    const r = await pedir(`/api/v1/perfiles/${p.codigo}/publicar`, {}, { version: c.version });
    expect(r.status).toBe(200);
    return (await r.json()).perfil as { codigo: string };
  }
  const fechaPortal = async (codigo: string) =>
    (
      await portal.query(
        `SELECT disponibilidad_fecha::text AS f FROM operacion.catalogo_publicable WHERE codigo = $1`,
        [codigo],
      )
    ).rows[0]?.f as string | undefined;
  const huella = async (codigo: string) =>
    (
      await bd.instalacion.query(
        `SELECT p.estado, p.disponibilidad_fecha::text AS fecha,
                (SELECT count(*)::int FROM inventario.colocaciones c WHERE c.perfil_id = p.id) AS colocaciones,
                (SELECT count(*)::int FROM auditoria.auditoria a WHERE a.titular = p.codigo) AS cambios
           FROM inventario.perfiles p WHERE p.codigo = $1`,
        [codigo],
      )
    ).rows[0];
  const pagina = async (ruta: string, cookie = admin) =>
    (await panel.pedir(ruta, { headers: { cookie } })).text();

  beforeAll(async () => {
    bd = await crearBdPrueba();
    const entorno = { ...entornoDev("panel"), APP_ENV: "ci", DATABASE_URL: bd.urlDe("ps_panel") };
    const worker = bd.como("ps_worker");
    await sembrarFicticios({
      bd: worker,
      auditoria: { hmac: entorno.AUDIT_HMAC_KEY!, kek: entorno.AUDIT_KEK! },
      appEnv: "ci",
      registrar: () => {},
    });
    await sembrarLexicoFicticio({ bd: worker, appEnv: "ci", registrar: () => {} });
    portal = bd.como("ps_portal");
    admin = await sesion("karen@trycore.com", "administrador");
    observador = await sesion("mirar@trycore.com", "observador");
    panel = await arrancarServidor("panel", entorno);
  }, 120_000);

  afterAll(async () => {
    await panel?.cerrar();
    await bd?.cerrar();
  });

  it("registrar: 200, disponibilidad = liberación en el portal y la pestaña lo muestra con cuenta, fechas y autor", async () => {
    const p = await publicado("Rocío");
    const liberacion = enDias(45);
    const r = await pedir("/api/v1/colocados", {
      codigo: p.codigo,
      cuenta: "Seguros Altamira",
      inicio: enDias(-3),
      liberacion,
    });
    expect(r.status).toBe(200);
    const perfil = (await r.json()).perfil;
    expect(perfil).toMatchObject({ estado: "publicado", disponibilidadFecha: liberacion });
    expect(await fechaPortal(p.codigo)).toBe(liberacion);
    const html = await pagina("/colocados");
    expect(html).toContain("Rocío Salcedo");
    expect(html).toContain("Seguros Altamira");
    expect(html).toContain("Panel · karen@trycore.com");
    expect(html).toContain(`dateTime="${liberacion}"`);
    expect(html).toContain("Vencen en los próximos 60 días");
    expect(html).toContain("45 días");
    expect(html).toContain("Registrar colocado");
    // Ya colocado: 409 sin tocar nada.
    const antes = await huella(p.codigo);
    const otra = await pedir("/api/v1/colocados", {
      codigo: p.codigo,
      cuenta: "Otra",
      inicio: null,
      liberacion: enDias(90),
    });
    expect(otra.status).toBe(409);
    expect((await otra.json()).motivo).toBe("ya_colocado");
    expect(await huella(p.codigo)).toEqual(antes);
  });

  it("sin fecha de liberación: 422 `sin_liberacion` y el perfil conserva estado y disponibilidad", async () => {
    const p = await publicado("Mateo");
    const antes = await huella(p.codigo);
    const r = await pedir("/api/v1/colocados", {
      codigo: p.codigo,
      cuenta: "Bancolombia",
      inicio: enDias(0),
      liberacion: "",
    });
    expect(r.status).toBe(422);
    expect((await r.json()).motivo).toBe("sin_liberacion");
    expect(await huella(p.codigo)).toEqual(antes);
    expect(antes).toMatchObject({ estado: "publicado", colocaciones: 0 });
  });

  it("ordenados por vencimiento: el de 59 días en el grupo destacado y el de 61 después", async () => {
    const tarde = await publicado("Tadeo");
    const pronto = await publicado("Paula");
    for (const [p, dias] of [
      [tarde, 61],
      [pronto, 59],
    ] as const)
      expect(
        (
          await pedir("/api/v1/colocados", {
            codigo: p.codigo,
            cuenta: "Energía Sabana",
            inicio: enDias(-1),
            liberacion: enDias(dias),
          })
        ).status,
      ).toBe(200);
    const html = await pagina("/colocados");
    const grupo2 = html.indexOf("Después de 60 días");
    expect(grupo2).toBeGreaterThan(0);
    expect(html.indexOf("Paula Salcedo")).toBeLessThan(grupo2);
    expect(html.indexOf("Tadeo Salcedo")).toBeGreaterThan(grupo2);
    expect(html).toMatch(/cl-faltan cl-faltan--pronto">59 días/);
    expect(html).toMatch(/cl-faltan">61 días/);
  });

  it("el colocado sigue publicado en el inventario y en el catálogo del portal (edge HU-137)", async () => {
    const p = await publicado("Inés");
    const liberacion = enDias(20);
    await pedir("/api/v1/colocados", {
      codigo: p.codigo,
      cuenta: "Retail Nogal",
      inicio: null,
      liberacion,
    });
    const inventario = await pagina(`/inventario?q=${encodeURIComponent("Inés")}`);
    expect(inventario).toContain("Inés Salcedo");
    expect(inventario).toContain("Publicado");
    expect(await fechaPortal(p.codigo)).toBe(liberacion);
  });

  it("la observadora consulta la pestaña sin registrar y recibe 403 al escribir; sin CSRF también 403", async () => {
    const p = await publicado("Olga");
    const html = await pagina("/colocados", observador);
    expect(html).toContain("Colocados");
    expect(html).not.toContain("Registrar colocado");
    const antes = await huella(p.codigo);
    const cuerpo = { codigo: p.codigo, cuenta: "X", inicio: null, liberacion: enDias(30) };
    expect((await pedir("/api/v1/colocados", cuerpo, { cookie: observador })).status).toBe(403);
    expect((await pedir("/api/v1/colocados", cuerpo, { sinCsrf: true })).status).toBe(403);
    expect(await huella(p.codigo)).toEqual(antes);
  });

  it("el menú lleva a Colocados", async () => {
    expect(await pagina("/inventario")).toMatch(/href="\/colocados"/);
  });
});
