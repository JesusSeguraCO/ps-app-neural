// Revertir la última importación contra PostgreSQL real (EP-006 · sub-slice 4, tarea 4.3; HU-087):
// el panel prepara y confirma con `ps_panel`, el worker revierte con `ps_worker`. Cada perfil
// actualizado vuelve exactamente a como estaba (diff = 0), los creados se archivan, solo se revierte la
// última y un perfil cambiado después solo se toca si la persona lo incluye.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { CAMPOS_IMPORTACION, leer } from "@ps/contratos/importacion";
import { proponerEmparejamiento } from "@ps/dominio/importacion/emparejar";
import { calcularPlan, mapearFilas } from "@ps/dominio/importacion/plan";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import { verificarCadena, type ClavesAuditoria } from "./auditoria";
import { aplicarLote } from "./aplicar-importacion";
import { bancoEnFormato, catalogosImportacion, confirmarLote, registrarLote } from "./importacion";
import { guardarPerfil, leerPerfil, type PerfilEditor } from "./perfiles-panel";
import {
  antesDeRevertir,
  confirmarReversion,
  detalleReversion,
  revertirLote,
} from "./revertir-importacion";
import { sembrarFicticios } from "../../../../apps/worker/src/sembrar-ficticios";

const claves: ClavesAuditoria = {
  hmac: randomBytes(32).toString("base64"),
  kek: randomBytes(32).toString("base64"),
};
const HOY = "2026-10-01";

// Lo que la persona ve de un perfil, sin la versión ni la hora de la última escritura.
const comparable = (p: PerfilEditor | null) => {
  if (!p) return null;
  const resto: Partial<PerfilEditor> = { ...p };
  delete resto.version;
  delete resto.actualizadoEn;
  delete resto.evaluacion;
  return resto;
};

describe.skipIf(!HAY_BD)("revertir la última importación (HU-087)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let worker: pg.Pool;
  let autor: { usuarioId: string; correo: string };

  const aplicado = async (tsv: string) => {
    const lectura = leer(tsv, "tsv");
    if (!lectura.ok) throw new Error(lectura.motivo);
    const emparejamiento = proponerEmparejamiento(lectura.tabla.encabezados, CAMPOS_IMPORTACION);
    const filas = mapearFilas(lectura.tabla, emparejamiento);
    const banco = await bancoEnFormato(panel);
    const plan = calcularPlan({
      filas,
      modo: "crear_y_actualizar",
      banco: new Map(banco.map((f) => [f.codigo as string, f])),
      catalogos: await catalogosImportacion(panel),
      hoy: HOY,
    });
    const id = await registrarLote(panel, autor, {
      archivoHash: randomBytes(32).toString("hex"),
      formato: "tsv",
      modo: "crear_y_actualizar",
      emparejamiento: [],
      filas,
      plan,
    });
    await confirmarLote(panel, autor, id);
    expect((await aplicarLote(worker, claves, id, { hoy: HOY })).tipo).toBe("aplicado");
    return id;
  };
  const revertir = async (id: string, incluir: string[] = []) => {
    await confirmarReversion(panel, autor, id, incluir);
    return revertirLote(worker, claves, id, incluir);
  };
  const leerTodos = async (codigos: string[]) =>
    Promise.all(codigos.map(async (c) => comparable(await leerPerfil(panel, c))));

  beforeAll(async () => {
    bd = await crearBdPrueba();
    panel = bd.como("ps_panel");
    worker = bd.como("ps_worker");
    await sembrarFicticios({ bd: worker, auditoria: claves, appEnv: "ci", registrar: () => {} });
    const u = await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('karen@trycore.com', $1, 'administrador') RETURNING id`,
      [randomBytes(32)],
    );
    autor = { usuarioId: u.rows[0].id, correo: "karen@trycore.com" };
    await bd.instalacion.query(
      `INSERT INTO inventario.catalogo_motivos_pausa (nombre) VALUES ('En licencia o ausencia temporal')`,
    );
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("cada actualizado vuelve exactamente a como estaba, los creados se archivan y queda como evento propio", async () => {
    const codigos = ["PS-0142", "PS-0160"];
    const antes = await leerTodos(codigos);
    const version = (
      await bd.instalacion.query(`SELECT version FROM inventario.inventario_version`)
    ).rows[0].version;
    const id = await aplicado(
      [
        "Código\tNombre\tPrimer apellido\tEstado\tMotivo de pausa\tTecnologías\tSectores\tDisponibilidad\tIdiomas\tExperiencia",
        "PS-0142\t\t\tpausado\tEn licencia o ausencia temporal\tJava; Rust\tBanca\t2027-01-15\tInglés C1\t",
        "PS-0160\t\t\t\t\t\tRetail; Seguros\t\t\tAnalista · Éxito · 2024-2026: tableros de ventas para 40 tiendas",
        "PS-0700\tNora\tVélez\t\t\tPython\tSalud\t\t\t",
      ].join("\n"),
    );
    // La importación sí cambió las cosas…
    expect((await leerPerfil(panel, "PS-0142"))!.estado).toBe("pausado");
    expect((await leerPerfil(panel, "PS-0160"))!.experiencias).toHaveLength(1);

    expect(await revertir(id)).toEqual({
      tipo: "revertido",
      restaurados: 2,
      archivados: 1,
      dejados: 0,
    });
    // …y revertir las deja como estaban: diff = 0 en todo lo que se ve del perfil.
    expect(await leerTodos(codigos)).toEqual(antes);
    const motivo = await bd.instalacion.query(
      `SELECT motivo_pausa_id FROM inventario.perfiles WHERE codigo = 'PS-0142'`,
    );
    expect(motivo.rows[0].motivo_pausa_id).toBeNull();
    // El creado se archiva, no se borra.
    expect((await leerPerfil(panel, "PS-0700"))!.estado).toBe("archivado");
    // Volvió a publicado: el cliente lo ve de nuevo (una subida por aplicar y otra por revertir).
    const despues = (
      await bd.instalacion.query(`SELECT version FROM inventario.inventario_version`)
    ).rows[0].version;
    expect(Number(despues)).toBe(Number(version) + 2);

    const lote = await bd.instalacion.query(
      `SELECT estado, revertido_en IS NOT NULL AS con_fecha FROM inventario.lotes_importacion WHERE id = $1`,
      [id],
    );
    expect(lote.rows[0]).toEqual({ estado: "revertido", con_fecha: true });
    const eventos = await bd.instalacion.query(
      `SELECT entidad, campo, actor FROM auditoria.auditoria WHERE origen = 'reversion' ORDER BY seq`,
    );
    expect(eventos.rows.some((r) => r.entidad === "lotes_importacion")).toBe(true);
    expect(eventos.rows.map((r) => r.campo)).toEqual(
      expect.arrayContaining(["estado", "tecnologias", "motivo_pausa", "experiencias"]),
    );
    expect(new Set(eventos.rows.map((r) => r.actor))).toEqual(new Set(["karen@trycore.com"]));
    expect((await verificarCadena(bd.instalacion, claves.hmac)).ok).toBe(true);
    // Revertir dos veces no hace nada.
    expect(await revertirLote(worker, claves, id, [])).toEqual({
      tipo: "sin_efecto",
      estado: "revertido",
    });
  });

  it("una importación que ya no es la última no se revierte y se dice cuáles hay después", async () => {
    const primera = await aplicado("Código\tAnclaje\nPS-0187\tPrimera importación");
    const segunda = await aplicado("Código\tAnclaje\nPS-0201\tSegunda importación");
    const previo = (await antesDeRevertir(panel, primera))!;
    expect(previo.posteriores).toEqual([
      expect.objectContaining({ id: segunda, confirmadoPor: "karen@trycore.com", perfiles: 1 }),
    ]);
    await expect(confirmarReversion(panel, autor, primera, [])).rejects.toMatchObject({
      motivo: "no_es_la_ultima",
    });
    expect((await leerPerfil(panel, "PS-0187"))!.anclaje).toBe("Primera importación");
    // Revertida la segunda, la primera vuelve a ser la última.
    expect((await revertir(segunda)).tipo).toBe("revertido");
    expect((await antesDeRevertir(panel, primera))!.posteriores).toEqual([]);
    expect((await revertir(primera)).tipo).toBe("revertido");
  });

  it("un perfil cambiado a mano después se advierte y la persona elige dejarlo o incluirlo", async () => {
    const original = comparable(await leerPerfil(panel, "PS-0223"));
    const id = await aplicado(
      "Código\tAnclaje\nPS-0160\tAnclaje importado\nPS-0223\tAnclaje importado",
    );
    const tomas = (await leerPerfil(panel, "PS-0160"))!;
    await guardarPerfil(panel, claves, autor, "PS-0160", tomas.version, {
      anclaje: "Editado a mano después",
    });
    const previo = (await antesDeRevertir(panel, id))!;
    expect(previo.cambiadosDespues).toEqual([
      { codigo: "PS-0160", nombre: "Tomás Rincón", creado: false },
    ]);
    // El detalle dice quién lo cambió, qué, y cómo queda hoy frente a si se incluye; proyectarlo no
    // escribe nada.
    const editado = (await leerPerfil(panel, "PS-0160"))!;
    const d = (await detalleReversion(panel, id))!;
    expect(d.vuelven).toEqual({ actualizados: 1, creados: 0, archivados: 0 });
    expect(d.cambiadosDespues[0]).toMatchObject({
      codigo: "PS-0160",
      autor: "karen@trycore.com",
      campos: ["anclaje"],
      hoy: ["Editado a mano después"],
    });
    expect(d.cambiadosDespues[0]!.siIncluyes).toHaveLength(1);
    expect(d.cambiadosDespues[0]!.siIncluyes[0]).not.toBe("Editado a mano después");
    expect(await leerPerfil(panel, "PS-0160")).toEqual(editado);
    // Un código que no está entre los cambiados no se puede «incluir».
    await expect(confirmarReversion(panel, autor, id, ["PS-0223"])).rejects.toMatchObject({
      motivo: "incluir_invalido",
    });
    // Dejarlo como está: se revierte lo demás.
    expect(await revertir(id, [])).toMatchObject({ restaurados: 1, dejados: 1 });
    expect((await leerPerfil(panel, "PS-0160"))!.anclaje).toBe("Editado a mano después");
    expect(comparable(await leerPerfil(panel, "PS-0223"))).toEqual(original);

    // Incluirlo: vuelve a como estaba antes de la importación.
    const antesDeOtra = comparable(await leerPerfil(panel, "PS-0160"));
    const otro = await aplicado("Código\tAnclaje\nPS-0160\tOtra importación");
    const t = (await leerPerfil(panel, "PS-0160"))!;
    await guardarPerfil(panel, claves, autor, "PS-0160", t.version, { anclaje: "Otra edición" });
    expect(await revertir(otro, ["PS-0160"])).toMatchObject({ restaurados: 1, dejados: 0 });
    expect(comparable(await leerPerfil(panel, "PS-0160"))).toEqual(antesDeOtra);
  });
});
