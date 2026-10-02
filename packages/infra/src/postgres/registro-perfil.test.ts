// Registro de auditoría por perfil contra PostgreSQL real con `ps_panel` (EP-006 · sub-slice 10; HU-138), con
// historia generada por las vías reales: alta y edición en el panel, consentimiento, importación y su
// reversión (worker), carga de Operaciones y archivado. Cada fila trae campo, antes, después, quién y
// cuándo, descifrados; la importación y la carga se atribuyen a su proceso y a su persona, con el enlace al
// lote y la fecha de corte; el archivado es un cambio de estado más; ninguna fila queda sin autor.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { CAMPOS_IMPORTACION, leer } from "@ps/contratos/importacion";
import { proponerEmparejamiento } from "@ps/dominio/importacion/emparejar";
import { calcularPlan, mapearFilas } from "@ps/dominio/importacion/plan";
import { sembrarFicticios } from "../../../../apps/worker/src/sembrar-ficticios";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import { verificarCadena, type ClavesAuditoria } from "./auditoria";
import { aplicarLote } from "./aplicar-importacion";
import { cargarOperaciones } from "./colocados";
import { archivarPerfil } from "./estado-perfil";
import { bancoEnFormato, catalogosImportacion, confirmarLote, registrarLote } from "./importacion";
import { crearPerfil, guardarPerfil, registrarConsentimiento } from "./perfiles-panel";
import { cabeceraRegistro, leerRegistroPerfil, type FilaRegistro } from "./registro-perfil";
import { confirmarReversion, revertirLote } from "./revertir-importacion";

const claves: ClavesAuditoria = {
  hmac: randomBytes(32).toString("base64"),
  kek: randomBytes(32).toString("base64"),
};
const HOY = new Date().toISOString().slice(0, 10);
const enDias = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

describe.skipIf(!HAY_BD)("registro de auditoría por perfil (HU-138)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let worker: pg.Pool;
  let karen: { usuarioId: string; correo: string };
  let eida: { usuarioId: string; correo: string };
  let codigo: string;
  let loteId: string;
  let cargaId: string;

  const usuario = async (correo: string) => {
    const u = await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ($1, $2, 'administrador') RETURNING id`,
      [correo, randomBytes(32)],
    );
    return { usuarioId: u.rows[0].id as string, correo };
  };
  const de = (filas: FilaRegistro[], campo: string) => filas.filter((f) => f.campo === campo);

  beforeAll(async () => {
    bd = await crearBdPrueba();
    panel = bd.como("ps_panel");
    worker = bd.como("ps_worker");
    await sembrarFicticios({ bd: worker, auditoria: claves, appEnv: "ci", registrar: () => {} });
    karen = await usuario("karen.rodriguez@trycore.com");
    eida = await usuario("eida.tinjaca@trycore.com");

    // 1. Alta y edición en el panel, y consentimiento.
    const opciones = await bd.instalacion.query(
      `SELECT (SELECT id FROM inventario.catalogo_ciudades WHERE nombre = 'Medellín') AS medellin,
              (SELECT id FROM inventario.catalogo_ciudades WHERE nombre = 'Bogotá') AS bogota`,
    );
    const { medellin, bogota } = opciones.rows[0];
    const alta = await crearPerfil(panel, claves, karen, {
      nombre: "Laura",
      primerApellido: "Méndez",
      ciudadId: medellin,
    });
    codigo = alta.codigo;
    const editado = await guardarPerfil(panel, claves, eida, codigo, alta.version, {
      ciudadId: bogota,
      aniosExperiencia: 9,
    });
    await registrarConsentimiento(panel, claves, karen, codigo, {
      nombreApellido: true,
      trayectoria: true,
      clientes: true,
      fechaFirma: HOY,
    });
    void editado;

    // 2. Importación (la aplica el worker) y su reversión.
    const lectura = leer(
      ["Código\tAños de experiencia\tTecnologías", `${codigo}\t11\tJava; Rust`].join("\n"),
      "tsv",
    );
    if (!lectura.ok) throw new Error(lectura.motivo);
    const filas = mapearFilas(
      lectura.tabla,
      proponerEmparejamiento(lectura.tabla.encabezados, CAMPOS_IMPORTACION),
    );
    const banco = await bancoEnFormato(panel);
    loteId = await registrarLote(panel, karen, {
      archivoHash: randomBytes(32).toString("hex"),
      formato: "tsv",
      modo: "crear_y_actualizar",
      emparejamiento: [],
      filas,
      plan: calcularPlan({
        filas,
        modo: "crear_y_actualizar",
        banco: new Map(banco.map((f) => [f.codigo as string, f])),
        catalogos: await catalogosImportacion(panel),
        hoy: HOY,
      }),
    });
    await bd.instalacion.query(
      `UPDATE inventario.lotes_importacion SET archivo_nombre = 'inventario-sep.tsv' WHERE id = $1`,
      [loteId],
    );
    await confirmarLote(panel, eida, loteId);
    expect((await aplicarLote(worker, claves, loteId, { hoy: HOY })).tipo).toBe("aplicado");
    await confirmarReversion(panel, karen, loteId, []);
    expect((await revertirLote(worker, claves, loteId, [])).tipo).toBe("revertido");

    // 3. Carga de Operaciones sobre un perfil publicado (PS-0142) y archivado del nuestro.
    cargaId = (
      await cargarOperaciones(panel, claves, eida, {
        nombre: "asignaciones.csv",
        texto: [
          "Código del perfil,Cliente,Fecha de inicio,Fecha de liberación",
          `PS-0142,Bancolombia,${enDias(-10)},${enDias(60)}`,
        ].join("\n"),
      })
    ).cargaId;
    await archivarPerfil(panel, claves, karen, codigo);
  }, 120_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("happy: campo, antes, después, quién y cuándo, descifrados y en lenguaje llano", async () => {
    const filas = await leerRegistroPerfil(panel, claves.kek, codigo);
    const ciudad = de(filas, "ciudad");
    expect(ciudad.map((f) => [f.antes, f.despues, f.actor])).toEqual([
      ["Medellín", "Bogotá", "eida.tinjaca@trycore.com"],
      [null, "Medellín", "karen.rodriguez@trycore.com"],
    ]);
    expect(ciudad[0]).toMatchObject({
      etiqueta: "Ciudad",
      grupo: "contenido",
      quien: { tipo: "persona", titulo: "eida.tinjaca@trycore.com" },
    });
    // Consentimiento y estado, igual que el contenido.
    const consentimiento = de(filas, "consentimiento")[0]!;
    expect(consentimiento).toMatchObject({
      etiqueta: "Consentimiento",
      grupo: "consentimiento",
      despues: "Nominal, con clientes nombrados",
      actor: "karen.rodriguez@trycore.com",
    });
    // Del más reciente al más antiguo.
    const seqs = filas.map((f) => f.seq);
    expect(seqs).toEqual([...seqs].sort((a, b) => b - a));
    expect(filas.every((f) => !Number.isNaN(Date.parse(f.cuando)))).toBe(true);
  });

  it("edge: lo que entró por la importación se atribuye a ella y a quien la confirmó, con enlace al lote", async () => {
    const filas = await leerRegistroPerfil(panel, claves.kek, codigo);
    const importados = filas.filter((f) => f.origen === "importacion");
    expect(importados.length).toBeGreaterThan(0);
    for (const f of importados)
      expect(f.quien).toEqual({
        tipo: "importacion",
        titulo: "Importación «inventario-sep.tsv»",
        detalle: "confirmó eida.tinjaca@trycore.com",
        enlace: `/importar?lote=${loteId}`,
      });
    expect(de(importados, "anios_experiencia")[0]).toMatchObject({ antes: "9", despues: "11" });
    const deshechos = filas.filter((f) => f.origen === "reversion");
    expect(deshechos.length).toBeGreaterThan(0);
    expect(deshechos[0]!.quien).toMatchObject({
      tipo: "importacion",
      detalle: "deshizo karen.rodriguez@trycore.com",
      enlace: `/importar?lote=${loteId}`,
    });
  });

  it("edge: la disponibilidad que cambió por la carga de Operaciones lleva la carga, quién y la fecha de corte", async () => {
    const filas = await leerRegistroPerfil(panel, claves.kek, "PS-0142");
    const carga = filas.filter((f) => f.origen === "sincronizacion");
    expect(carga.map((f) => f.campo)).toEqual(
      expect.arrayContaining(["colocacion", "disponibilidad_fecha"]),
    );
    const corte = (
      await bd.instalacion.query(
        `SELECT cargado_en FROM inventario.cargas_operaciones WHERE id = $1`,
        [cargaId],
      )
    ).rows[0].cargado_en as Date;
    for (const f of carga) {
      expect(f.quien.tipo).toBe("carga");
      expect(f.quien.titulo).toBe("Carga de Operaciones «asignaciones.csv»");
      expect(f.quien.detalle).toMatch(
        /^corte \d{1,2} [a-z]{3} \d{4}, \d{1,2}:\d{2} [ap]\. m\. · cargó eida\.tinjaca@trycore\.com$/,
      );
      expect(f.quien.enlace).toBe(`/colocados?carga=${cargaId}`);
    }
    expect(corte).toBeInstanceOf(Date);
  });

  it("edge: un perfil archivado muestra su historial completo y el archivado como un cambio de estado más", async () => {
    const cabecera = await cabeceraRegistro(panel, codigo);
    expect(cabecera).toMatchObject({
      estado: "archivado",
      nombre: "Laura",
      primerApellido: "Méndez",
    });
    expect(cabecera!.archivadoEn).not.toBeNull();
    const filas = await leerRegistroPerfil(panel, claves.kek, codigo);
    expect(filas[0]).toMatchObject({
      campo: "estado",
      etiqueta: "Publicación",
      grupo: "estado",
      despues: "Archivado",
      actor: "karen.rodriguez@trycore.com",
    });
    // Desde el alta: el primer cambio sigue ahí.
    expect(filas.at(-1)!.actor).toBe("karen.rodriguez@trycore.com");
    expect(de(filas, "nombre").at(-1)).toMatchObject({ antes: null, despues: "Laura" });
  });

  it("ninguna fila del registro queda sin autor y la cadena sigue íntegra", async () => {
    for (const c of [codigo, "PS-0142"]) {
      const filas = await leerRegistroPerfil(panel, claves.kek, c);
      expect(filas.every((f) => f.actor.trim().length > 0)).toBe(true);
    }
    expect((await verificarCadena(panel, claves.hmac)).ok).toBe(true);
    expect(await cabeceraRegistro(panel, "PS-9999")).toBeNull();
  });
});
