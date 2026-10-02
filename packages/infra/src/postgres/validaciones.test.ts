// Reporte de validación contra PostgreSQL real con `ps_panel` (EP-006 · sub-slice 6; HU-140, HU-130
// edge): el borrador se precarga desde la modalidad de prueba con origen «plantilla», sin modalidad no
// hay borrador, lo que la persona corrige queda como suyo, descartar no toca la ficha y confirmar
// enriquece la ficha del portal (`ps_portal`) sin cambiar el estado ni republicar, auditado. Ninguna
// llamada sale del proceso.
import { randomBytes } from "node:crypto";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type pg from "pg";
import type { SesionPortalVerificada } from "@ps/dominio/acceso/sesion";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import type { ClavesAuditoria } from "./auditoria";
import { fichaDelPortal } from "./catalogo";
import { crearPerfil, leerPerfil, publicarPerfil, registrarConsentimiento } from "./perfiles-panel";
import { RechazoInventario } from "./unidad-inventario";
import {
  confirmarBorrador,
  descartarBorrador,
  guardarBorrador,
  leerBorrador,
  pedirBorrador,
} from "./validaciones";
import { sembrarFicticios } from "../../../../apps/worker/src/sembrar-ficticios";
import { sembrarLexicoFicticio } from "../../../../apps/worker/src/sembrar-lexico";

const claves: ClavesAuditoria = {
  hmac: randomBytes(32).toString("base64"),
  kek: randomBytes(32).toString("base64"),
};
const HOY = "2026-10-01";
const sesionPortal = {} as SesionPortalVerificada;

async function rechazo(p: Promise<unknown>) {
  try {
    await p;
  } catch (e) {
    if (e instanceof RechazoInventario) return e;
    throw e;
  }
  throw new Error("sin_rechazo");
}

describe.skipIf(!HAY_BD)("reporte de validación (HU-140, HU-130)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let portal: pg.Pool;
  let autor: { usuarioId: string; correo: string };
  const ids = {} as Record<"rol" | "java" | "senior" | "medellin" | "hibrido" | "prueba", string>;

  const id = async (tabla: string, nombre: string) =>
    (await bd.instalacion.query(`SELECT id FROM inventario.${tabla} WHERE nombre = $1`, [nombre]))
      .rows[0].id as string;
  const completo = (extra: Record<string, unknown> = {}) => ({
    nombre: "Lorena",
    primerApellido: "Salcedo",
    rolId: ids.rol,
    tecnologiaIds: [ids.java],
    seniorityId: ids.senior,
    aniosExperiencia: 8,
    ciudadId: ids.medellin,
    modalidadTrabajoId: ids.hibrido,
    disponibilidad: { opcion: "ahora" as const },
    modalidadPruebaId: ids.prueba,
    experiencias: [{ cargo: "Backend senior", desde: 2021, hasta: 2026, descripcion: "Pagos." }],
    ...extra,
  });
  async function publicado() {
    const p = await crearPerfil(panel, claves, autor, completo());
    const c = await registrarConsentimiento(panel, claves, autor, p.codigo, {
      nombreApellido: true,
      trayectoria: true,
      clientes: true,
    });
    return publicarPerfil(panel, claves, autor, c.codigo, c.version);
  }
  const reporte = {
    evaluador: "Célula de arquitectura de Trycore",
    fecha: "2026-09-28",
    resultado: "Aprobada, nivel senior",
  };
  const auditoria = async (codigo: string) =>
    (
      await bd.instalacion.query(
        `SELECT entidad, campo, actor, origen FROM auditoria.auditoria WHERE titular = $1 ORDER BY seq`,
        [codigo],
      )
    ).rows as Array<{ entidad: string; campo: string; actor: string; origen: string }>;

  beforeAll(async () => {
    bd = await crearBdPrueba();
    panel = bd.como("ps_panel");
    portal = bd.como("ps_portal");
    await sembrarFicticios({ bd: bd.como("ps_panel"), auditoria: claves, appEnv: "ci", registrar: () => {} });
    await sembrarLexicoFicticio({ bd: bd.como("ps_panel"), candidatas: bd.como("ps_worker"), appEnv: "ci", registrar: () => {} });
    const u = await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('karen@trycore.com', $1, 'administrador') RETURNING id`,
      [randomBytes(32)],
    );
    autor = { usuarioId: u.rows[0].id, correo: "karen@trycore.com" };
    ids.rol = await id("catalogo_roles", "Desarrolladora backend Java");
    ids.java = await id("catalogo_tecnologias", "Java");
    ids.senior = await id("catalogo_seniorities", "Senior");
    ids.medellin = await id("catalogo_ciudades", "Medellín");
    ids.hibrido = await id("catalogo_modalidades", "hibrido");
    ids.prueba = await id(
      "catalogo_modalidades_prueba",
      "Prueba práctica revisada por un arquitecto",
    );
    // La plantilla de la modalidad (el texto vive en el catálogo, B.9.1).
    await bd.instalacion.query(
      `UPDATE inventario.catalogo_modalidades_prueba
          SET enunciado_reto = 'Construir un servicio REST de conciliación de pagos.',
              entregables = 'Repositorio con el código y las pruebas',
              criterios = E'Diseño de la capa de servicios\\nCobertura de pruebas'
        WHERE id = $1`,
      [ids.prueba],
    );
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("pedir el borrador lo precarga desde la modalidad, con origen «plantilla», sin ninguna llamada saliente", async () => {
    const fetchEspia = vi.fn();
    vi.stubGlobal("fetch", fetchEspia);
    const p = await crearPerfil(panel, claves, autor, completo());
    const b = await pedirBorrador(panel, claves, autor, p.codigo);
    expect(b).toMatchObject({
      modalidad: { id: ids.prueba, nombre: "Prueba práctica revisada por un arquitecto" },
      enunciadoReto: "Construir un servicio REST de conciliación de pagos.",
      entregables: "Repositorio con el código y las pruebas",
      criterios: ["Diseño de la capa de servicios", "Cobertura de pruebas"],
      origen: { enunciadoReto: "plantilla", entregables: "plantilla", criterios: "plantilla" },
      evaluador: null,
      fecha: null,
      resultado: null,
    });
    // Pedirlo otra vez devuelve el mismo borrador pendiente.
    expect((await pedirBorrador(panel, claves, autor, p.codigo)).id).toBe(b.id);
    expect((await leerPerfil(panel, p.codigo))!.borradorValidacion?.id).toBe(b.id);
    expect(fetchEspia).not.toHaveBeenCalled();
  });

  it("sin modalidad de prueba elegida no hay borrador", async () => {
    const p = await crearPerfil(panel, claves, autor, completo({ modalidadPruebaId: null }));
    const e = await rechazo(pedirBorrador(panel, claves, autor, p.codigo));
    expect(e.motivo).toBe("sin_modalidad_prueba");
    expect(await leerBorrador(panel, p.codigo)).toBeNull();
  });

  it("lo que la persona corrige queda como suyo y la ficha guarda su valor, no el de la plantilla", async () => {
    const p = await publicado();
    const b = await pedirBorrador(panel, claves, autor, p.codigo);
    const campos = {
      enunciadoReto: b.enunciadoReto,
      entregables: "Repositorio con el código",
      criterios: b.criterios,
      ...reporte,
    };
    const g = await guardarBorrador(panel, claves, autor, p.codigo, b.id, campos);
    expect(g.origen).toEqual({
      enunciadoReto: "plantilla",
      entregables: "persona",
      criterios: "plantilla",
    });
    const c = await confirmarBorrador(
      panel,
      claves,
      autor,
      p.codigo,
      b.id,
      { ...campos, revisado: true },
      HOY,
    );
    expect(c.reporte).toMatchObject({
      entregables: "Repositorio con el código",
      resultado: reporte.resultado,
    });
    expect(c.borradorValidacion).toBeNull();
  });

  it("confirmar enriquece la ficha del portal sin cambiar el estado ni la versión del perfil, y lo audita", async () => {
    const p = await publicado();
    const antes = await fichaDelPortal(portal, sesionPortal, p.codigo);
    expect(antes?.validacion.nivel).toBe(0);
    const b = await pedirBorrador(panel, claves, autor, p.codigo);
    const n = (await auditoria(p.codigo)).length;
    const c = await confirmarBorrador(
      panel,
      claves,
      autor,
      p.codigo,
      b.id,
      {
        enunciadoReto: b.enunciadoReto,
        entregables: b.entregables,
        criterios: b.criterios,
        ...reporte,
        revisado: true,
      },
      HOY,
    );
    expect(c.estado).toBe("publicado");
    expect(c.version).toBe(p.version);
    const despues = await fichaDelPortal(portal, sesionPortal, p.codigo);
    expect(despues?.validacion).toEqual({
      nivel: 1,
      enunciado: antes!.validacion.enunciado,
      modalidad: "Prueba práctica revisada por un arquitecto",
      resultado: "Aprobada, nivel senior",
      evaluador: "Célula de arquitectura de Trycore",
      fecha: "2026-09-28",
      criterios: ["Diseño de la capa de servicios", "Cobertura de pruebas"],
    });
    const nuevas = (await auditoria(p.codigo)).slice(n);
    expect(new Set(nuevas.map((x) => `${x.entidad}/${x.actor}/${x.origen}`))).toEqual(
      new Set(["validaciones/karen@trycore.com/panel"]),
    );
    expect(nuevas.map((x) => x.campo)).toEqual(
      expect.arrayContaining(["estado", "evaluador", "fecha", "resultado", "criterios"]),
    );
  });

  it("descartar no toca la ficha: ningún campo del borrador llega al portal", async () => {
    const p = await publicado();
    const b = await pedirBorrador(panel, claves, autor, p.codigo);
    await guardarBorrador(panel, claves, autor, p.codigo, b.id, {
      enunciadoReto: b.enunciadoReto,
      entregables: b.entregables,
      criterios: ["Algo que el artefacto no sostiene"],
      ...reporte,
    });
    const n = (await auditoria(p.codigo)).length;
    await descartarBorrador(panel, claves, autor, p.codigo, b.id);
    expect((await fichaDelPortal(portal, sesionPortal, p.codigo))?.validacion.nivel).toBe(0);
    expect((await leerPerfil(panel, p.codigo))!.reporte).toBeNull();
    expect(await leerBorrador(panel, p.codigo)).toBeNull();
    expect((await auditoria(p.codigo)).length).toBe(n);
  });

  it("confirmar exige la revisión y lo que escribe la persona; un borrador ya resuelto no se reusa", async () => {
    const p = await publicado();
    const b = await pedirBorrador(panel, claves, autor, p.codigo);
    const base = {
      enunciadoReto: b.enunciadoReto,
      entregables: b.entregables,
      criterios: b.criterios,
    };
    const e = await rechazo(
      confirmarBorrador(
        panel,
        claves,
        autor,
        p.codigo,
        b.id,
        { ...base, ...reporte, fecha: "2026-10-05", revisado: false },
        HOY,
      ),
    );
    expect(e.motivo).toBe("reporte_incompleto");
    expect(e.detalle.faltan).toEqual(["revisado", "fecha"]);
    await descartarBorrador(panel, claves, autor, p.codigo, b.id);
    const otra = await rechazo(
      confirmarBorrador(
        panel,
        claves,
        autor,
        p.codigo,
        b.id,
        { ...base, ...reporte, revisado: true },
        HOY,
      ),
    );
    expect(otra.motivo).toBe("borrador_resuelto");
  });

  it("si la modalidad del perfil cambió, el borrador ya no vale; y un reporte de otra modalidad no se muestra", async () => {
    const p = await publicado();
    const b = await pedirBorrador(panel, claves, autor, p.codigo);
    const otra = (
      await bd.instalacion.query(
        `INSERT INTO inventario.catalogo_modalidades_prueba (familia_id, nombre, texto_cliente)
         SELECT familia_id, 'Otra modalidad', 'Validada con otra prueba.' FROM inventario.catalogo_modalidades_prueba WHERE id = $1
         RETURNING id`,
        [ids.prueba],
      )
    ).rows[0].id;
    await bd.instalacion.query(
      `UPDATE inventario.perfiles SET modalidad_prueba_id = $2 WHERE codigo = $1`,
      [p.codigo, otra],
    );
    const e = await rechazo(
      confirmarBorrador(
        panel,
        claves,
        autor,
        p.codigo,
        b.id,
        {
          enunciadoReto: b.enunciadoReto,
          entregables: b.entregables,
          criterios: b.criterios,
          ...reporte,
          revisado: true,
        },
        HOY,
      ),
    );
    expect(e.motivo).toBe("modalidad_cambio");
  });

  it("un reporte confirmado deja de mostrarse si el perfil cambia de modalidad: la ficha vuelve a Nivel 0", async () => {
    const p = await publicado();
    const b = await pedirBorrador(panel, claves, autor, p.codigo);
    await confirmarBorrador(
      panel,
      claves,
      autor,
      p.codigo,
      b.id,
      { enunciadoReto: b.enunciadoReto, entregables: b.entregables, criterios: b.criterios, ...reporte, revisado: true },
      HOY,
    );
    expect((await fichaDelPortal(portal, sesionPortal, p.codigo))?.validacion.nivel).toBe(1);
    await bd.instalacion.query(
      `UPDATE inventario.perfiles SET modalidad_prueba_id = (
         SELECT id FROM inventario.catalogo_modalidades_prueba WHERE nombre = 'Otra modalidad') WHERE codigo = $1`,
      [p.codigo],
    );
    expect((await fichaDelPortal(portal, sesionPortal, p.codigo))?.validacion).toEqual({
      nivel: 0,
      enunciado: "Validada con otra prueba.",
    });
    expect((await leerPerfil(panel, p.codigo))!.reporte).toBeNull();
  });
});
