// Contrato HTTP de colocados (EP-006 · sub-slice 9: HU-137) contra el servidor standalone real del panel
// (`ps_panel`): registrar un colocado con su autor como fuente y la disponibilidad = liberación que el
// portal (`ps_portal`) ve de inmediato; sin fecha de liberación no se guarda nada; la pestaña ordenada
// por vencimiento con los de 60 días destacados; el colocado sigue publicado en el inventario; la
// observadora la consulta sin registrar y recibe 403 al escribir. La carga de Operaciones (HU-150): JSON o
// CSV con su resultado, filas con error, rechazo entero de otro formato, gana el panel con la diferencia
// para decidir y el aviso «dato desincronizado» (7 → no, 8 → sí). Base tomada de vigencia-panel.test.ts.
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

describe.skipIf(!HAY_BD || !hayBuild("panel"))("Colocados en el panel (HU-137, HU-150)", () => {
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

  describe("carga de Operaciones (HU-150)", () => {
    const csv = (filas: string[]) =>
      [
        "Código del perfil,Cliente,Fecha de inicio,Fecha de liberación,Observaciones",
        ...filas,
      ].join("\n");
    const cargar = (archivo: string, contenido: string, cookie?: string) =>
      pedir("/api/v1/colocados/cargas", { archivo, contenido }, cookie ? { cookie } : {});
    const cargas = async () =>
      (await bd.instalacion.query(`SELECT count(*)::int AS n FROM inventario.cargas_operaciones`))
        .rows[0].n as number;

    it("happy: 201 con el resumen; la pestaña marca los de Operaciones, muestra el corte e informa la columna ignorada", async () => {
      const a = await publicado("Úrsula");
      const r = await cargar(
        "asignaciones-30sep.csv",
        csv([`${a.codigo},Logística Magdalena,${enDias(-30)},${enDias(80)},renovación probable`]),
      );
      expect(r.status).toBe(201);
      const { carga } = await r.json();
      expect(carga).toMatchObject({
        aplicadas: 1,
        nuevos: 1,
        ignoradas: ["Observaciones"],
        errores: [],
      });
      expect(await fechaPortal(a.codigo)).toBe(enDias(80));
      const html = await pagina(`/colocados?carga=${carga.id}`);
      expect(html).toContain("Carga aplicada: 1 fila de asignaciones-30sep.csv.");
      expect(html).toContain("Se ignoró la columna «Observaciones»");
      expect(html).toContain("La fecha de corte es el momento de esta carga.");
      // Corte de hoy con la hora y la fila recién traída marcada (prototipo colocados--carga-operaciones).
      expect(html).toMatch(/Operaciones · corte hoy \d{2}:\d{2} · nuevo/);
      expect(html).toContain(" · corte ");
      expect(html).not.toContain("dato desincronizado");
    });

    it("JSON con filas con error: se aplican las válidas y cada error sale con su número y motivo", async () => {
      const a = await publicado("Vera");
      const r = await cargar(
        "ops.json",
        JSON.stringify([
          {
            codigo: a.codigo,
            cliente: "Retail Nogal",
            fecha_inicio: enDias(-2),
            fecha_liberacion: enDias(30),
          },
          {
            codigo: "PS-237",
            cliente: "X",
            fecha_inicio: enDias(-2),
            fecha_liberacion: enDias(30),
          },
        ]),
      );
      expect(r.status).toBe(201);
      const { carga } = await r.json();
      const html = await pagina(`/colocados?carga=${carga.id}`);
      expect(html).toContain("Se aplicaron 1 de 2 filas de ops.json.");
      expect(html).toContain("Filas que no se aplicaron");
      expect(html).toContain("Fila 2");
      expect(html).toContain("El código no tiene el formato PS-XXXX (cuatro dígitos).");
    });

    it("otro formato: 422 `formato_no_admitido`, nada escrito; sin columnas mínimas: 422 con cuáles faltan", async () => {
      const n = await cargas();
      const x = await cargar("asignaciones-octubre.xlsx", "PK\u0003\u0004");
      expect(x.status).toBe(422);
      expect((await x.json()).motivo).toBe("formato_no_admitido");
      const c = await cargar("ops.csv", "codigo,cliente\nPS-0001,X");
      expect(c.status).toBe(422);
      expect(await c.json()).toEqual({
        motivo: "faltan_columnas",
        faltan: ["fecha de inicio", "fecha de liberación"],
      });
      expect(await cargas()).toBe(n);
    });

    it("gana el panel: la diferencia queda a la vista con los dos valores; aceptarla aplica la de Operaciones", async () => {
      const p = await publicado("Wilma");
      await pedir("/api/v1/colocados", {
        codigo: p.codigo,
        cuenta: "Seguros Altamira",
        inicio: enDias(-100),
        liberacion: enDias(43),
      });
      const r = await cargar(
        "ops.csv",
        csv([`${p.codigo},Seguros Altamira,${enDias(-100)},${enDias(60)},`]),
      );
      expect((await r.json()).carga).toMatchObject({ diferencias: 1, nuevos: 0 });
      expect(await fechaPortal(p.codigo)).toBe(enDias(43));
      const html = await pagina("/colocados");
      expect(html).toContain("Diferencias con Operaciones");
      expect(html).toContain("Aceptar la de Operaciones");
      expect(html).toContain("En el panel · karen@trycore.com");
      const id = (
        await bd.instalacion.query(
          `SELECT d.id FROM inventario.diferencias_operaciones d
             JOIN inventario.colocaciones c ON c.id = d.colocacion_id
             JOIN inventario.perfiles f ON f.id = c.perfil_id
            WHERE f.codigo = $1 AND d.decision IS NULL`,
          [p.codigo],
        )
      ).rows[0].id as string;
      expect(
        (
          await pedir(
            `/api/v1/colocados/diferencias/${id}`,
            { decision: "aceptada" },
            { cookie: observador },
          )
        ).status,
      ).toBe(403);
      expect(
        (await pedir(`/api/v1/colocados/diferencias/${id}`, { decision: "aceptada" })).status,
      ).toBe(200);
      expect(await fechaPortal(p.codigo)).toBe(enDias(60));
      expect(
        (await pedir(`/api/v1/colocados/diferencias/${id}`, { decision: "descartada" })).status,
      ).toBe(409);
    });

    it("la observadora no carga: sin botón y 403", async () => {
      const n = await cargas();
      expect(await pagina("/colocados", observador)).not.toContain("Cargar archivo de Operaciones");
      expect((await cargar("ops.csv", csv([]), observador)).status).toBe(403);
      expect(await cargas()).toBe(n);
    });

    it("dato desincronizado: con 7 días no aparece, con 8 sí, y los colocados de esa carga siguen visibles", async () => {
      const atrasar = (dias: number) =>
        bd.instalacion.query(
          `UPDATE inventario.cargas_operaciones SET cargado_en = now() - make_interval(days => $1)`,
          [dias],
        );
      await atrasar(7);
      let html = await pagina("/colocados");
      expect(html).not.toContain("dato desincronizado");
      expect(html).toContain("Úrsula Salcedo");
      await atrasar(8);
      html = await pagina("/colocados");
      expect(html).toContain("dato desincronizado");
      expect(html).toContain("hace 8 días sin una nueva");
      expect(html).toContain("Úrsula Salcedo");
    });
  });
});
