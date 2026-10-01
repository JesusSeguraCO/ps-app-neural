// Importación contra PostgreSQL real con `ps_panel` (EP-006 · sub-slice 3; HU-088, HU-086, HU-148):
// el banco sale en la forma del formato, la ida y vuelta exportar → leer → emparejar → plan deja todo
// «sin cambios», registrar un lote no toca `perfiles` y las plantillas se guardan con nombre único.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { CAMPOS_IMPORTACION, escribirCsv, escribirJson, leer } from "@ps/contratos/importacion";
import { proponerEmparejamiento } from "@ps/dominio/importacion/emparejar";
import { calcularPlan, mapearFilas } from "@ps/dominio/importacion/plan";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import type { ClavesAuditoria } from "./auditoria";
import {
  bancoEnFormato,
  catalogosImportacion,
  guardarPlantilla,
  actualizarPlanLote,
  filasDelLote,
  leerLote,
  leerPlantilla,
  listarPlantillas,
  registrarLote,
} from "./importacion";
import { RechazoInventario } from "./unidad-inventario";
import { crearPerfil } from "./perfiles-panel";
import { sembrarFicticios } from "../../../../apps/worker/src/sembrar-ficticios";
import { sembrarLexicoFicticio } from "../../../../apps/worker/src/sembrar-lexico";

const claves: ClavesAuditoria = {
  hmac: randomBytes(32).toString("base64"),
  kek: randomBytes(32).toString("base64"),
};
const HOY = "2026-10-01";

describe.skipIf(!HAY_BD)(
  "importación: banco en formato, lotes y plantillas (HU-088, HU-086, HU-148)",
  () => {
    let bd: BdPrueba;
    let panel: pg.Pool;
    let autor: { usuarioId: string; correo: string };

    beforeAll(async () => {
      bd = await crearBdPrueba();
      panel = bd.como("ps_panel");
      await sembrarFicticios({
        bd: bd.como("ps_worker"),
        auditoria: claves,
        appEnv: "ci",
        registrar: () => {},
      });
      const u = await bd.instalacion.query(
        `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('karen@trycore.com', $1, 'administrador') RETURNING id`,
        [randomBytes(32)],
      );
      autor = { usuarioId: u.rows[0].id, correo: "karen@trycore.com" };
      await sembrarLexicoFicticio({ bd: bd.como("ps_worker"), appEnv: "ci", registrar: () => {} });
      // Un perfil con todos los campos del Anexo B (la siembra de EP-001 no trae trayectoria ni sello).
      const id = async (tabla: string, nombre: string) =>
        (
          await bd.instalacion.query(`SELECT id FROM inventario.${tabla} WHERE nombre = $1`, [
            nombre,
          ])
        ).rows[0].id as string;
      await crearPerfil(panel, claves, autor, {
        nombre: "Lorena",
        primerApellido: "Salcedo",
        rolId: await id("catalogo_roles", "Desarrolladora backend Java"),
        tecnologiaIds: [
          await id("catalogo_tecnologias", "Kafka"),
          await id("catalogo_tecnologias", "Java"),
        ],
        sectorId: await id("catalogo_sectores", "Banca"),
        seniorityId: await id("catalogo_seniorities", "Senior"),
        aniosExperiencia: 8,
        ciudadId: await id("catalogo_ciudades", "Medellín"),
        modalidadTrabajoId: await id("catalogo_modalidades", "hibrido"),
        disponibilidad: { fecha: "2026-11-01" },
        modalidadPruebaId: await id(
          "catalogo_modalidades_prueba",
          "Prueba práctica revisada por un arquitecto",
        ),
        capacidad: "Ingeniera Backend Senior",
        anclaje: "8 años en core bancario",
        resumen: 'Backend transaccional; listas con ; y comas, y "comillas".',
        vinculo: "banco_no_vinculado",
        formacion: "Ingeniera de Sistemas",
        idiomas: ["Inglés B2", "Portugués A2"],
        selloPersonal: ["Rigurosidad", "Autodidactismo", "Cautela"],
        experiencias: [
          {
            cargo: "Backend senior",
            cliente: "Bancolombia",
            desde: 2021,
            hasta: 2026,
            descripcion: "Pagos inmediatos con Kafka.",
          },
          {
            cargo: "Desarrolladora",
            cliente: null,
            desde: 2017,
            hasta: null,
            descripcion: "Core de seguros: 3 equipos.",
          },
        ],
      });
    }, 60_000);

    afterAll(async () => {
      await bd?.cerrar();
    });

    it("una fila por perfil con los campos del formato y sin consentimiento", async () => {
      const banco = await bancoEnFormato(panel);
      const total = (
        await bd.instalacion.query(`SELECT count(*)::int AS n FROM inventario.perfiles`)
      ).rows[0].n;
      expect(banco).toHaveLength(total);
      expect(banco.length).toBeGreaterThan(5);
      const claves = new Set(CAMPOS_IMPORTACION.map((c) => c.clave as string));
      for (const f of banco) {
        expect(f.codigo).toMatch(/^PS-\d{4}$/);
        for (const k of Object.keys(f)) expect(claves, k).toContain(k);
      }
      expect(JSON.stringify(banco)).not.toMatch(/consentim/i);
      const lorena = banco.find((f) => f.nombre === "Lorena")!;
      expect(lorena).toMatchObject({
        estado: "borrador",
        rol: "Desarrolladora backend Java",
        familia: "Desarrollo",
        tecnologias: ["Kafka", "Java"],
        modalidad: "Híbrido",
        disponibilidad: "2026-11-01",
        vinculo: "banco no vinculado",
        idiomas: ["Inglés B2", "Portugués A2"],
        experiencias: [
          "Backend senior · Bancolombia · 2021-2026: Pagos inmediatos con Kafka.",
          "Desarrolladora ·  · 2017-: Core de seguros: 3 equipos.",
        ],
      });
    });

    for (const formato of ["csv", "json"] as const)
      it(`ida y vuelta en ${formato}: exportar → leer → emparejar → plan = todo «sin cambios»`, async () => {
        const banco = await bancoEnFormato(panel);
        const texto = formato === "csv" ? escribirCsv(banco) : escribirJson(banco);
        const lectura = leer(texto);
        if (!lectura.ok) throw new Error(lectura.motivo);
        expect(lectura.formato).toBe(formato);
        const emparejamiento = proponerEmparejamiento(
          lectura.tabla.encabezados,
          CAMPOS_IMPORTACION,
        );
        const plan = calcularPlan({
          filas: mapearFilas(lectura.tabla, emparejamiento),
          modo: "crear_y_actualizar",
          banco: new Map(banco.map((f) => [f.codigo as string, f])),
          catalogos: await catalogosImportacion(panel),
          hoy: HOY,
        });
        const conCambios = plan.filas.filter((f) => f.grupo !== "sin_cambios");
        expect(conCambios, JSON.stringify(conCambios.slice(0, 2))).toEqual([]);
        expect(plan.conteos.sin_cambios).toBe(banco.length);
        expect(plan.valoresNuevos).toEqual([]);
        expect(plan.filas.flatMap((f) => f.avisos)).toEqual([]);
      });

    it("registrar un lote guarda el plan calculado y no toca perfiles ni la versión global", async () => {
      const antes = await bd.instalacion.query(
        `SELECT (SELECT max(actualizado_en) FROM inventario.perfiles) AS p, (SELECT version FROM inventario.inventario_version) AS v`,
      );
      const banco = await bancoEnFormato(panel);
      const filas = [
        { numero: 2, celdas: { codigo: banco[0]!.codigo as string, disponibilidad: "2030-01-01" } },
        {
          numero: 3,
          celdas: { codigo: "PS-0142" },
          rechazadas: [{ columna: "Consentimiento", detalle: "x" }],
        },
      ];
      const plan = calcularPlan({
        filas,
        modo: "crear_y_actualizar",
        banco: new Map(banco.map((f) => [f.codigo as string, f])),
        catalogos: await catalogosImportacion(panel),
        hoy: HOY,
      });
      const id = await registrarLote(panel, autor, {
        archivoHash: "b".repeat(64),
        formato: "tsv",
        modo: "crear_y_actualizar",
        emparejamiento: [{ columna: "Código", clave: "codigo" }],
        filas,
        plan,
      });
      const lote = await leerLote(panel, id);
      expect(lote).toMatchObject({
        estado: "calculado",
        modo: "crear_y_actualizar",
        bloqueado: false,
      });
      expect(lote!.filas[0]).toMatchObject({
        numero: 2,
        grupo: "actualizado",
        datos: { disponibilidad: "2030-01-01" },
      });
      expect(lote!.filas[0]!.cambios[0]).toMatchObject({ campo: "disponibilidad" });
      const despues = await bd.instalacion.query(
        `SELECT (SELECT max(actualizado_en) FROM inventario.perfiles) AS p, (SELECT version FROM inventario.inventario_version) AS v`,
      );
      expect(despues.rows[0]).toEqual(antes.rows[0]);
    });

    it("recalcular: desmarcar una de dos filas repetidas desbloquea y conserva las columnas rechazadas", async () => {
      const banco = await bancoEnFormato(panel);
      const contexto = {
        banco: new Map(banco.map((f) => [f.codigo as string, f])),
        catalogos: await catalogosImportacion(panel),
        hoy: HOY,
      };
      const filas = [
        {
          numero: 2,
          celdas: { codigo: "PS-0142", ciudad: "Cali" },
          rechazadas: [{ columna: "Consentimiento", detalle: "no se concede" }],
        },
        { numero: 3, celdas: { codigo: "PS-0142", ciudad: "Bogotá" } },
      ];
      const plan = calcularPlan({ ...contexto, filas, modo: "crear_y_actualizar" });
      expect(plan.bloqueado).toBe(true);
      const id = await registrarLote(panel, autor, {
        archivoHash: "c".repeat(64),
        formato: "csv",
        modo: "crear_y_actualizar",
        emparejamiento: [],
        filas,
        plan,
      });
      const guardado = await filasDelLote(panel, id);
      expect(guardado).toMatchObject({ estado: "calculado", modo: "crear_y_actualizar" });
      expect(guardado!.filas).toEqual(filas);
      const nuevo = calcularPlan({
        ...contexto,
        filas: guardado!.filas,
        modo: "crear_y_actualizar",
        excluidas: new Set([3]),
      });
      await actualizarPlanLote(panel, id, "crear_y_actualizar", nuevo);
      const lote = (await leerLote(panel, id))!;
      expect(lote.bloqueado).toBe(false);
      expect(lote.filas.map((f) => [f.numero, f.grupo, f.incluida])).toEqual([
        [2, "actualizado", true],
        [3, "actualizado", false],
      ]);
      expect(lote.filas[0]!.avisos).toEqual([
        { campo: null, mensaje: "Columna «Consentimiento» rechazada: no se concede" },
      ]);
    });

    it("un lote que ya no está calculado no se recalcula", async () => {
      const plan = calcularPlan({
        filas: [],
        modo: "crear_y_actualizar",
        banco: new Map(),
        catalogos: await catalogosImportacion(panel),
        hoy: HOY,
      });
      const id = await registrarLote(panel, autor, {
        archivoHash: "d".repeat(64),
        formato: "csv",
        modo: "crear_y_actualizar",
        emparejamiento: [],
        filas: [{ numero: 2, celdas: { codigo: "PS-0142" } }],
        plan: {
          ...plan,
          filas: [
            {
              numero: 2,
              codigo: "PS-0142",
              grupo: "sin_cambios",
              incluida: true,
              cambios: [],
              errores: [],
              avisos: [],
            },
          ],
        },
      });
      await bd.instalacion.query(
        `UPDATE inventario.lotes_importacion SET estado = 'aplicado' WHERE id = $1`,
        [id],
      );
      await expect(actualizarPlanLote(panel, id, "solo_crear", plan)).rejects.toMatchObject({
        motivo: "lote_no_calculado",
      });
      await expect(
        actualizarPlanLote(panel, "00000000-0000-4000-8000-000000000000", "solo_crear", plan),
      ).rejects.toMatchObject({ motivo: "no_existe" });
    });

    it("plantillas: guardar con nombre, listarlas y rechazar el nombre repetido", async () => {
      const columnas = [
        { columna: "Cód.", clave: "codigo" as const },
        { columna: "Comentario", clave: null },
      ];
      const p = await guardarPlantilla(panel, autor, {
        nombre: "Disponibilidad mensual",
        columnas,
      });
      expect(p).toMatchObject({ nombre: "Disponibilidad mensual", columnas });
      expect(await leerPlantilla(panel, p.id)).toMatchObject({
        nombre: "Disponibilidad mensual",
        columnas,
      });
      expect(await leerPlantilla(panel, "00000000-0000-4000-8000-000000000000")).toBeNull();
      const lista = await listarPlantillas(panel);
      expect(lista.map((x) => x.nombre)).toContain("Disponibilidad mensual");
      expect(lista.find((x) => x.id === p.id)).toMatchObject({
        columnas,
        autor: "karen@trycore.com",
      });
      await expect(
        guardarPlantilla(panel, autor, { nombre: "disponibilidad  MENSUAL", columnas }),
      ).rejects.toMatchObject({ motivo: "nombre_repetido" } satisfies Partial<RechazoInventario>);
    });
  },
);
