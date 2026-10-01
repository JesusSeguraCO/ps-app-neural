// Filas con error de una importación contra PostgreSQL real (EP-006 · sub-slice 4, tarea 4.4; HU-142):
// el archivo de errores trae solo las que fallaron, con su motivo y en el formato en que llegaron; si
// falla el archivo entero se dice; reimportar las corregidas actualiza por código sin duplicar.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { CAMPOS_IMPORTACION, escribirErrores, leer, type Formato } from "@ps/contratos/importacion";
import { proponerEmparejamiento } from "@ps/dominio/importacion/emparejar";
import { calcularPlan, mapearFilas } from "@ps/dominio/importacion/plan";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import type { ClavesAuditoria } from "./auditoria";
import { aplicarLote } from "./aplicar-importacion";
import {
  bancoEnFormato,
  catalogosImportacion,
  confirmarLote,
  erroresDelLote,
  registrarLote,
} from "./importacion";
import { sembrarFicticios } from "../../../../apps/worker/src/sembrar-ficticios";

const claves: ClavesAuditoria = {
  hmac: randomBytes(32).toString("base64"),
  kek: randomBytes(32).toString("base64"),
};
const HOY = "2026-10-01";

describe.skipIf(!HAY_BD)("filas con error de una importación (HU-142)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let worker: pg.Pool;
  let autor: { usuarioId: string; correo: string };

  const calcular = async (texto: string, formato: Formato = "csv") => {
    const lectura = leer(texto, formato);
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
    return registrarLote(panel, autor, {
      archivoHash: randomBytes(32).toString("hex"),
      formato,
      modo: "crear_y_actualizar",
      emparejamiento: emparejamiento.map((c) => ({
        columna: c.columna,
        clave: c.destino.tipo === "campo" ? c.destino.clave : null,
      })),
      filas,
      plan,
    });
  };
  const aplicar = async (id: string) => {
    await confirmarLote(panel, autor, id);
    return aplicarLote(worker, claves, id, { hoy: HOY });
  };
  const perfilesNuevos = async () =>
    (
      await bd.instalacion.query(
        `SELECT count(*)::int AS n, count(DISTINCT codigo)::int AS distintos FROM inventario.perfiles WHERE codigo >= 'PS-1001'`,
      )
    ).rows[0];

  // 60 filas: profesionales nuevos; las filas 10, 25 y 40 traen un año imposible.
  const MALAS = new Set([10, 25, 40]);
  const hoja = (corregir: boolean) =>
    [
      "Código,Nombre,Primer apellido,Años de experiencia,Notas internas",
      ...Array.from({ length: 60 }, (_, i) => {
        const n = i + 1;
        const anios = MALAS.has(n) && !corregir ? "muchos" : String(n % 30);
        return `PS-${1000 + n},Persona${n},Apellido${n},${anios},nota que no se importa`;
      }),
    ].join("\r\n");

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
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("descargar solo lo que falló: las 3 filas con su motivo, en el formato en que llegaron", async () => {
    const id = await calcular(hoja(false));
    expect(await aplicar(id)).toMatchObject({ tipo: "aplicado", creados: 57 });
    const e = (await erroresDelLote(panel, id))!;
    expect(e).toMatchObject({ formato: "csv", total: 60, todas: false, causaComun: null });
    // Las columnas importadas con su nombre original; la que no se importó no viaja.
    expect(e.encabezados).toEqual(["Código", "Nombre", "Primer apellido", "Años de experiencia"]);
    expect(e.filas.map((f) => f.celdas[0])).toEqual(["PS-1010", "PS-1025", "PS-1040"]);
    expect(e.filas[0]!.motivo).toMatch(/^Años de experiencia: «muchos» no es un número/);
    const archivo = leer(escribirErrores(e.formato, e.encabezados, e.filas), "csv");
    if (!archivo.ok) throw new Error(archivo.motivo);
    expect(archivo.tabla.filas).toHaveLength(3);
    expect(archivo.tabla.encabezados.at(-1)).toBe("Motivo");
    expect(archivo.tabla.filas.some((f) => f.celdas[0] === "PS-1001")).toBe(false);
  });

  it("reimportar las corregidas actualiza por código y no duplica lo que ya había entrado", async () => {
    const corregidas = [
      "Código,Nombre,Primer apellido,Años de experiencia",
      ...[...MALAS].map((n) => `PS-${1000 + n},Persona${n},Apellido${n},${n % 30}`),
    ].join("\r\n");
    expect(await aplicar(await calcular(corregidas))).toMatchObject({
      tipo: "aplicado",
      creados: 3,
    });
    expect(await perfilesNuevos()).toEqual({ n: 60, distintos: 60 });
    // Volver a pegar la hoja entera ya corregida: todo «sin cambios», nada que aplicar.
    const otra = await calcular(hoja(true));
    const conteos = (
      await bd.instalacion.query(`SELECT conteos FROM inventario.lotes_importacion WHERE id = $1`, [
        otra,
      ])
    ).rows[0].conteos;
    expect(conteos).toMatchObject({ nuevos: 0, actualizados: 0, sin_cambios: 60, con_error: 0 });
    await expect(confirmarLote(panel, autor, otra)).rejects.toMatchObject({
      motivo: "nada_que_aplicar",
    });
    expect(await perfilesNuevos()).toEqual({ n: 60, distintos: 60 });
  });

  it("si ninguna fila se pudo procesar, salen todas con su motivo y se dice si fue el archivo entero", async () => {
    // Sin columna de código: el problema es del archivo, no de cada fila.
    const sinCodigo = await calcular("Nombre\tPrimer apellido\nAna\tRuiz\nLuis\tMora", "tsv");
    const e = (await erroresDelLote(panel, sinCodigo))!;
    expect(e).toMatchObject({ formato: "tsv", total: 2, todas: true });
    expect(e.filas).toHaveLength(2);
    expect(e.causaComun).toMatch(/Ninguna columna es el código/);

    // Todas fallan, cada una por lo suyo: no es del archivo entero.
    const cadaUna = await calcular("Código,Años de experiencia\nPS-0160,muchos\nPS-0187,-3");
    const f = (await erroresDelLote(panel, cadaUna))!;
    expect(f).toMatchObject({ todas: true, causaComun: null });
    expect(f.filas.map((x) => x.motivo)).toHaveLength(2);
  });
});
