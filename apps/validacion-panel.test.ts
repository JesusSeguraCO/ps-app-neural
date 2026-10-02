// Contrato HTTP del reporte de validación (EP-006 · sub-slice 6: HU-140, HU-130 edge) contra el
// servidor standalone real del panel (`ps_panel`): pedir el borrador precargado desde la modalidad,
// sin modalidad 422, guardarlo, confirmar exige la revisión y lo que escribe la persona, confirmar
// enriquece la ficha del portal (`ps_portal`) sin republicar y descartar no la toca. Permisos y CSRF.
//
// (Base tomada de editar-publicado-panel.test.ts.) Contrato HTTP de editar un publicado (EP-006 · sub-slice 6: HU-126, HU-129 «previsualizar un perfil
// ya publicado») contra el servidor standalone real del panel (`ps_panel`), por PgBouncer: el PATCH
// con `?previsualizar` declara qué cambia de cara al cliente (antes y después) sin escribir —el portal,
// leído con `ps_portal`, sigue con la versión vigente—; el PATCH sin él confirma; un cambio que deja el
// perfil incompleto responde 409 `deja_incompleto` con la pregunta de D1 y se resuelve con
// `?resolucion=descartar` o `?resolucion=a_borrador`. Permisos, CSRF e `If-Match` como el resto.
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import type { SesionPortalVerificada } from "@ps/dominio/acceso/sesion";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import { entradaValidaciones } from "@ps/infra/pruebas/validaciones-entrada";
import { fichaDelPortal } from "@ps/infra/postgres/catalogo";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { sembrarFicticios } from "./worker/src/sembrar-ficticios";
import { sembrarLexicoFicticio } from "./worker/src/sembrar-lexico";

describe.skipIf(!HAY_BD || !hayBuild("panel"))("Reporte de validación en el panel (HU-140, HU-130)", () => {
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
          // Validaciones de entrada SARO/DISC (EP-003, D61): publicar las exige.
          ...(await entradaValidaciones(bd.instalacion)),
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

  const hoy = new Date(Date.now() - 5 * 3_600_000).toISOString().slice(0, 10);
  const pedirBorrador = async (codigo: string, cookie?: string) =>
    pedir("POST", `/api/v1/perfiles/${codigo}/validacion`, {}, { cookie });
  const reporte = { evaluador: "Célula de arquitectura de Trycore", fecha: hoy, resultado: "Aprobada, nivel senior" };

  it("POST pide el borrador desde la modalidad, con origen «plantilla»; pedirlo otra vez da el mismo", async () => {
    const p = await publicado();
    const r = await pedirBorrador(p.codigo);
    expect(r.status).toBe(200);
    const { borrador } = await r.json();
    expect(borrador.modalidad.nombre).toBe("Prueba práctica revisada por un arquitecto");
    expect(borrador.criterios.length).toBeGreaterThan(0);
    expect(borrador.origen).toEqual({ enunciadoReto: "plantilla", entregables: "plantilla", criterios: "plantilla" });
    expect((await (await pedirBorrador(p.codigo)).json()).borrador.id).toBe(borrador.id);
    const html = await (
      await panel.pedir(`/inventario/${p.codigo}/validacion`, { headers: { cookie: admin } })
    ).text();
    expect(html).toContain("Borrador de la validación técnica");
    expect(html).toContain("De la modalidad de prueba");
  });

  it("sin modalidad de prueba: 422 `sin_modalidad_prueba`", async () => {
    const p = (
      await (
        await pedir("POST", "/api/v1/perfiles", { nombre: "Ana", primerApellido: "Ríos" })
      ).json()
    ).perfil as { codigo: string };
    const r = await pedirBorrador(p.codigo);
    expect(r.status).toBe(422);
    expect((await r.json()).motivo).toBe("sin_modalidad_prueba");
  });

  it("confirmar: 422 con lo que falta; con todo, 200 y la ficha del portal pasa a Nivel 1 sin republicar", async () => {
    const p = await publicado();
    const { borrador: b } = await (await pedirBorrador(p.codigo)).json();
    const campos = { id: b.id, enunciadoReto: b.enunciadoReto, entregables: b.entregables, criterios: b.criterios };
    const g = await pedir("PATCH", `/api/v1/perfiles/${p.codigo}/validacion`, { ...campos, entregables: "Solo el repositorio", ...reporte });
    expect(g.status).toBe(200);
    expect((await g.json()).borrador.origen.entregables).toBe("persona");
    const sin = await pedir("POST", `/api/v1/perfiles/${p.codigo}/validacion/confirmar`, { ...campos, ...reporte, revisado: false });
    expect(sin.status).toBe(422);
    expect((await sin.json()).faltan).toEqual(["revisado"]);
    const ok = await pedir("POST", `/api/v1/perfiles/${p.codigo}/validacion/confirmar`, { ...campos, ...reporte, revisado: true });
    expect(ok.status).toBe(200);
    const d = await ok.json();
    expect(d.perfil.estado).toBe("publicado");
    expect(d.perfil.version).toBe(p.version);
    const ficha = await fichaDelPortal(portal, {} as SesionPortalVerificada, p.codigo);
    expect(ficha?.validacion).toMatchObject({ nivel: 1, resultado: "Aprobada, nivel senior", fecha: hoy });
    const html = await (await panel.pedir(`/inventario/${p.codigo}`, { headers: { cookie: admin } })).text();
    expect(html).toContain("Registrar un reporte nuevo");
    expect(html).toContain("Aprobada, nivel senior");
  });

  it("descartar: 200 y la ficha sigue en Nivel 0; un borrador resuelto no se reusa (409)", async () => {
    const p = await publicado();
    const { borrador: b } = await (await pedirBorrador(p.codigo)).json();
    const des = await pedir("POST", `/api/v1/perfiles/${p.codigo}/validacion/descartar`, { id: b.id });
    expect(des.status).toBe(200);
    expect((await fichaDelPortal(portal, {} as SesionPortalVerificada, p.codigo))?.validacion.nivel).toBe(0);
    const otra = await pedir("POST", `/api/v1/perfiles/${p.codigo}/validacion/descartar`, { id: b.id });
    expect(otra.status).toBe(409);
    expect((await otra.json()).motivo).toBe("borrador_resuelto");
  });

  it("observador 403, sin CSRF 403, entrada inválida 400", async () => {
    const p = await publicado();
    expect((await pedirBorrador(p.codigo, observador)).status).toBe(403);
    expect((await pedir("POST", `/api/v1/perfiles/${p.codigo}/validacion`, {}, { sinCsrf: true })).status).toBe(403);
    expect((await pedir("POST", `/api/v1/perfiles/${p.codigo}/validacion/confirmar`, { id: "x" })).status).toBe(400);
  });
});
