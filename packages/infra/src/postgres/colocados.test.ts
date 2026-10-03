// Registrar colocados y la pestaña por vencimiento contra PostgreSQL real con `ps_panel` (EP-006 ·
// sub-slice 9; HU-137): registrar un colocado deja la colocación con su autor como fuente y la
// disponibilidad = liberación (el portal ve la banda nueva, el perfil sigue publicado); sin fecha de
// liberación no se escribe nada; la pestaña lista por vencimiento con la cuenta, el inicio y el autor.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { entradaValidaciones } from "../pruebas/validaciones-entrada";
import type pg from "pg";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import type { ClavesAuditoria } from "./auditoria";
import {
  cargarOperaciones,
  decidirDiferencia,
  listarColocados,
  listarDiferencias,
  registrarColocado,
  resumenCarga,
  ultimoCorte,
} from "./colocados";
import { archivarPerfil } from "./estado-perfil";
import { crearPerfil, leerPerfil, publicarPerfil, registrarConsentimiento } from "./perfiles-panel";
import { RechazoInventario } from "./unidad-inventario";
import { sembrarFicticios } from "../../../../apps/worker/src/sembrar-ficticios";

const claves: ClavesAuditoria = {
  hmac: randomBytes(32).toString("base64"),
  kek: randomBytes(32).toString("base64"),
};

async function rechazo(p: Promise<unknown>) {
  try {
    await p;
  } catch (e) {
    if (e instanceof RechazoInventario) return e;
    throw e;
  }
  throw new Error("sin_rechazo");
}

// Fechas relativas a hoy en Bogotá, para que la prueba no caduque.
const BOGOTA_MS = -5 * 3_600_000;
const enDias = (n: number) =>
  new Date(Date.now() + BOGOTA_MS + n * 86_400_000).toISOString().slice(0, 10);

// Alcance SARO y fechas para las entradas completas (lo siembra `sembrarFicticios`).
let saroDisc: Awaited<ReturnType<typeof entradaValidaciones>>;

describe.skipIf(!HAY_BD)("colocados (HU-137)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let portal: pg.Pool;
  let autor: { usuarioId: string; correo: string };
  const ids = {} as Record<"rol" | "java" | "senior" | "medellin" | "hibrido" | "prueba", string>;

  const id = async (tabla: string, nombre: string) =>
    (await bd.instalacion.query(`SELECT id FROM inventario.${tabla} WHERE nombre = $1`, [nombre]))
      .rows[0].id as string;
  async function publicado(nombre = "Lorena") {
    const p = await crearPerfil(panel, claves, autor, {
      nombre,
      primerApellido: "Salcedo",
      rolId: ids.rol,
      tecnologiaIds: [ids.java],
      seniorityId: ids.senior,
      aniosExperiencia: 8,
      ciudadId: ids.medellin,
      modalidadTrabajoId: ids.hibrido,
      disponibilidad: { opcion: "ahora" },
      modalidadPruebaId: ids.prueba,
    // Validaciones de entrada SARO/DISC (EP-003, D61): publicar las exige.
    ...saroDisc,
      experiencias: [{ cargo: "Backend senior", desde: 2021, descripcion: "Pagos." }],
    });
    const c = await registrarConsentimiento(panel, claves, autor, p.codigo, {
      nombreApellido: true,
      trayectoria: true,
      clientes: true,
    });
    return publicarPerfil(panel, claves, autor, c.codigo, c.version);
  }
  const enPortal = async (codigo: string) =>
    (
      await portal.query(
        `SELECT disponibilidad_fecha::text AS fecha FROM operacion.catalogo_publicable WHERE codigo = $1`,
        [codigo],
      )
    ).rows[0] as { fecha: string } | undefined;
  const auditoria = async (codigo: string) =>
    (
      await bd.instalacion.query(
        `SELECT campo, actor, origen FROM auditoria.auditoria WHERE titular = $1 ORDER BY seq`,
        [codigo],
      )
    ).rows as Array<{ campo: string; actor: string; origen: string }>;
  const colocaciones = async (codigo: string) =>
    (
      await bd.instalacion.query(
        `SELECT c.cuenta, c.inicio::text AS inicio, c.liberacion::text AS liberacion, c.fuente,
                c.registrado_por, c.vigente
           FROM inventario.colocaciones c JOIN inventario.perfiles p ON p.id = c.perfil_id
          WHERE p.codigo = $1 ORDER BY c.registrado_en`,
        [codigo],
      )
    ).rows;

  beforeAll(async () => {
    bd = await crearBdPrueba();
    panel = bd.como("ps_panel");
    portal = bd.como("ps_portal");
    await sembrarFicticios({
      bd: bd.como("ps_panel"),
      auditoria: claves,
      appEnv: "ci",
      registrar: () => {},
    });
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
  }, 60_000);

  beforeAll(async () => {
    saroDisc = await entradaValidaciones(bd.instalacion);
  });

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("registrar: colocación del panel con su autor, disponibilidad = liberación y el portal la ve; sigue publicado", async () => {
    const p = await publicado();
    const liberacion = enDias(78);
    const r = await registrarColocado(panel, claves, autor, p.codigo, {
      cuenta: " Bancolombia ",
      inicio: enDias(0),
      liberacion,
    });
    expect(r.estado).toBe("publicado");
    expect(r.disponibilidadFecha).toBe(liberacion);
    expect(r.colocacion).toMatchObject({ cuenta: "Bancolombia", liberacion, fuente: "panel" });
    expect(await colocaciones(p.codigo)).toEqual([
      {
        cuenta: "Bancolombia",
        inicio: enDias(0),
        liberacion,
        fuente: "panel",
        registrado_por: autor.usuarioId,
        vigente: true,
      },
    ]);
    // HU-137 edge: el cliente lo ve, con la fecha de liberación como disponibilidad (la banda).
    expect(await enPortal(p.codigo)).toEqual({ fecha: liberacion });
    const a = await auditoria(p.codigo);
    expect(a.slice(-3)).toEqual([
      { campo: "colocacion", actor: "karen@trycore.com", origen: "panel" },
      { campo: "disponibilidad_fecha", actor: "karen@trycore.com", origen: "panel" },
      { campo: "disponibilidad_actualizada_en", actor: "karen@trycore.com", origen: "panel" },
    ]);
  });

  it("sin fecha de liberación: no escribe nada y el perfil conserva estado y disponibilidad", async () => {
    const p = await publicado();
    const antes = (await leerPerfil(panel, p.codigo))!;
    const n = (await auditoria(p.codigo)).length;
    const e = await rechazo(
      registrarColocado(panel, claves, autor, p.codigo, {
        cuenta: "Bancolombia",
        inicio: enDias(0),
        liberacion: null,
      }),
    );
    expect(e.motivo).toBe("sin_liberacion");
    const despues = (await leerPerfil(panel, p.codigo))!;
    expect(despues.estado).toBe("publicado");
    expect(despues.disponibilidadFecha).toBe(antes.disponibilidadFecha);
    expect(despues.colocacion).toBeNull();
    expect(await colocaciones(p.codigo)).toEqual([]);
    expect((await auditoria(p.codigo)).length).toBe(n);
  });

  it("solo un publicado sin colocación vigente; liberación pasada o sin cliente se rechaza", async () => {
    const p = await publicado();
    await registrarColocado(panel, claves, autor, p.codigo, {
      cuenta: "Seguros Altamira",
      inicio: null,
      liberacion: enDias(20),
    });
    expect(
      (
        await rechazo(
          registrarColocado(panel, claves, autor, p.codigo, {
            cuenta: "Otra",
            inicio: null,
            liberacion: enDias(40),
          }),
        )
      ).motivo,
    ).toBe("ya_colocado");
    const q = await publicado();
    expect(
      (
        await rechazo(
          registrarColocado(panel, claves, autor, q.codigo, {
            cuenta: "X",
            inicio: enDias(-30),
            liberacion: enDias(0),
          }),
        )
      ).motivo,
    ).toBe("liberacion_pasada");
    expect(
      (
        await rechazo(
          registrarColocado(panel, claves, autor, q.codigo, {
            cuenta: "  ",
            inicio: null,
            liberacion: enDias(9),
          }),
        )
      ).motivo,
    ).toBe("sin_cuenta");
    await archivarPerfil(panel, claves, autor, q.codigo);
    expect(
      (
        await rechazo(
          registrarColocado(panel, claves, autor, q.codigo, {
            cuenta: "X",
            inicio: null,
            liberacion: enDias(9),
          }),
        )
      ).motivo,
    ).toBe("no_es_publicado");
    expect(
      (
        await rechazo(
          registrarColocado(panel, claves, autor, "PS-9999", {
            cuenta: "X",
            inicio: null,
            liberacion: enDias(9),
          }),
        )
      ).motivo,
    ).toBe("no_existe");
  });

  it("una colocación ya liberada no impide registrar la siguiente: se cierra y queda auditada", async () => {
    const p = await publicado();
    await bd.instalacion.query(
      `INSERT INTO inventario.colocaciones (perfil_id, cuenta, inicio, liberacion, fuente, registrado_por)
       SELECT id, 'Anterior', $2, $3, 'panel', $4 FROM inventario.perfiles WHERE codigo = $1`,
      [p.codigo, enDias(-200), enDias(-1), autor.usuarioId],
    );
    await registrarColocado(panel, claves, autor, p.codigo, {
      cuenta: "Nueva",
      inicio: null,
      liberacion: enDias(30),
    });
    expect((await colocaciones(p.codigo)).map((c) => [c.cuenta, c.vigente])).toEqual([
      ["Anterior", false],
      ["Nueva", true],
    ]);
  });

  it("la pestaña lista los vigentes por vencimiento con cuenta, inicio, fuente y autor; candidatos sin colocación", async () => {
    const a = await publicado("Ana");
    const b = await publicado("Beto");
    await registrarColocado(panel, claves, autor, a.codigo, {
      cuenta: "Tarde",
      inicio: enDias(-10),
      liberacion: enDias(61),
    });
    await registrarColocado(panel, claves, autor, b.codigo, {
      cuenta: "Pronto",
      inicio: enDias(-10),
      liberacion: enDias(59),
    });
    const { colocados, candidatos } = await listarColocados(panel);
    const mios = colocados.filter((c) => [a.codigo, b.codigo].includes(c.codigo));
    expect(mios.map((c) => [c.codigo, c.cuenta, c.inicio, c.liberacion, c.fuente])).toEqual([
      [b.codigo, "Pronto", enDias(-10), enDias(59), "panel"],
      [a.codigo, "Tarde", enDias(-10), enDias(61), "panel"],
    ]);
    expect(mios[0]).toMatchObject({
      nombre: "Beto Salcedo",
      estado: "publicado",
      registradoPor: "karen@trycore.com",
      corte: null,
      disponibilidadFecha: enDias(59),
    });
    // El orden general es por liberación.
    const fechas = colocados.map((c) => c.liberacion);
    expect([...fechas].sort()).toEqual(fechas);
    expect(candidatos.some((c) => c.codigo === a.codigo)).toBe(false);
    const libre = await publicado("Ceci");
    expect((await listarColocados(panel)).candidatos.map((c) => c.codigo)).toContain(libre.codigo);
  });

  describe("carga de Operaciones (HU-150)", () => {
    const csv = (filas: string[]) =>
      ["Código del perfil,Cliente,Fecha de inicio,Fecha de liberación,Observaciones", ...filas].join("\n");
    const auditoriaOrigen = async (codigo: string) =>
      (
        await bd.instalacion.query(
          `SELECT campo, origen FROM auditoria.auditoria WHERE titular = $1 ORDER BY seq`,
          [codigo],
        )
      ).rows as Array<{ campo: string; origen: string }>;

    it("happy: colocados nuevos de Operaciones con su carga, disponibilidad = liberación, columna ignorada y corte = momento de la carga", async () => {
      const a = await publicado("Opa");
      const b = await publicado("Opb");
      const antes = new Date();
      const { cargaId } = await cargarOperaciones(panel, claves, autor, {
        nombre: "asignaciones-30sep.csv",
        texto: csv([
          `${a.codigo},Logística Magdalena,${enDias(-30)},${enDias(75)},renovación probable`,
          `${b.codigo},Salud Integral Caribe,${enDias(-10)},${enDias(150)},`,
        ]),
      });
      const r = (await resumenCarga(panel, cargaId))!;
      expect(r).toMatchObject({
        archivo: "asignaciones-30sep.csv",
        filas: 2,
        aplicadas: 2,
        nuevos: 2,
        venian: 0,
        iguales: 0,
        diferencias: 0,
        ignoradas: ["Observaciones"],
        errores: [],
      });
      expect(new Date(r.cargadoEn).getTime()).toBeGreaterThanOrEqual(antes.getTime() - 1000);
      expect((await ultimoCorte(panel))!.toISOString()).toBe(r.cargadoEn);
      const { colocados } = await listarColocados(panel);
      expect(colocados.find((c) => c.codigo === a.codigo)).toMatchObject({
        fuente: "operaciones",
        cuenta: "Logística Magdalena",
        corte: r.cargadoEn,
        disponibilidadFecha: enDias(75),
        nuevo: true,
        diferencia: false,
      });
      expect(colocados.find((c) => c.codigo === b.codigo)?.nuevo).toBe(true);
      expect(await enPortal(a.codigo)).toEqual({ fecha: enDias(75) });
      expect((await auditoriaOrigen(a.codigo)).slice(-3).map((x) => x.origen)).toEqual([
        "sincronizacion",
        "sincronizacion",
        "sincronizacion",
      ]);

      // Una carga nueva reemplaza la colocación de la anterior: «ya venían».
      const { cargaId: segunda } = await cargarOperaciones(panel, claves, autor, {
        nombre: "asignaciones-07oct.csv",
        texto: csv([`${a.codigo},Logística Magdalena,${enDias(-30)},${enDias(90)},`]),
      });
      expect(await resumenCarga(panel, segunda)).toMatchObject({ nuevos: 0, venian: 1, aplicadas: 1 });
      expect((await colocaciones(a.codigo)).map((c) => [c.liberacion, c.vigente])).toEqual([
        [enDias(75), false],
        [enDias(90), true],
      ]);
      expect(await enPortal(a.codigo)).toEqual({ fecha: enDias(90) });
      // «· nuevo» solo para lo que entró nuevo en la carga más reciente: `a` ya venía y `b` es de la anterior.
      const tras = (await listarColocados(panel)).colocados;
      expect(tras.find((c) => c.codigo === a.codigo)?.nuevo).toBe(false);
      expect(tras.find((c) => c.codigo === b.codigo)?.nuevo).toBe(false);
    });

    it("filas con error: solo se aplican las válidas; cada error con número y motivo, también los del banco", async () => {
      const a = await publicado("Opc");
      const pausado = await publicado("Opd");
      await bd.instalacion.query(
        `UPDATE inventario.perfiles SET estado = 'borrador' WHERE codigo = $1`,
        [pausado.codigo],
      );
      const { cargaId } = await cargarOperaciones(panel, claves, autor, {
        nombre: "ops.csv",
        texto: csv([
          `${a.codigo},Uno,${enDias(-5)},${enDias(40)},`,
          `PS-237,Dos,${enDias(-5)},${enDias(40)},`,
          `PS-9998,Tres,${enDias(-5)},${enDias(40)},`,
          `${pausado.codigo},Cuatro,${enDias(-5)},${enDias(40)},`,
          `PS-0192,Cinco,${enDias(-5)},30/02/2027,`,
        ]),
      });
      const r = (await resumenCarga(panel, cargaId))!;
      expect(r).toMatchObject({ filas: 5, aplicadas: 1, nuevos: 1 });
      expect(r.errores).toEqual([
        { numero: 3, codigo: "PS-237", motivo: "El código no tiene el formato PS-XXXX (cuatro dígitos)." },
        { numero: 4, codigo: "PS-9998", motivo: "No hay ningún perfil con el código PS-9998." },
        {
          numero: 5,
          codigo: pausado.codigo,
          motivo: `${pausado.codigo} no está publicado: solo un perfil publicado puede estar colocado.`,
        },
        { numero: 6, codigo: "PS-0192", motivo: "«30/02/2027» no es una fecha de liberación válida." },
      ]);
      expect(await colocaciones(pausado.codigo)).toEqual([]);
    });

    it("otro formato o sin columnas mínimas: rechazo entero, nada escrito y el corte anterior se conserva", async () => {
      const corte = await ultimoCorte(panel);
      const n = (await bd.instalacion.query(`SELECT count(*)::int AS n FROM inventario.cargas_operaciones`))
        .rows[0].n;
      expect(
        (
          await rechazo(
            cargarOperaciones(panel, claves, autor, { nombre: "asignaciones-octubre.xlsx", texto: "PK\u0003" }),
          )
        ).motivo,
      ).toBe("formato_no_admitido");
      const e = await rechazo(
        cargarOperaciones(panel, claves, autor, { nombre: "ops.csv", texto: "codigo,cliente\nPS-0001,X" }),
      );
      expect(e.motivo).toBe("faltan_columnas");
      expect(e.detalle.faltan).toEqual(["fecha de inicio", "fecha de liberación"]);
      expect(
        (await bd.instalacion.query(`SELECT count(*)::int AS n FROM inventario.cargas_operaciones`)).rows[0].n,
      ).toBe(n);
      expect(await ultimoCorte(panel)).toEqual(corte);
    });

    it("gana el panel: la fila distinta no lo pisa y queda como diferencia; aceptarla la aplica, descartarla la deja", async () => {
      const p = await publicado("Ope");
      const q = await publicado("Opf");
      const igual = await publicado("Opg");
      for (const [x, lib] of [
        [p, enDias(43)],
        [q, enDias(50)],
        [igual, enDias(70)],
      ] as const)
        await registrarColocado(panel, claves, autor, x.codigo, {
          cuenta: "Seguros Altamira",
          inicio: enDias(-100),
          liberacion: lib,
        });
      const { cargaId } = await cargarOperaciones(panel, claves, autor, {
        nombre: "ops.csv",
        texto: csv([
          `${p.codigo},Seguros Altamira,${enDias(-100)},${enDias(60)},`,
          `${q.codigo},Seguros Altamira,${enDias(-100)},${enDias(65)},`,
          `${igual.codigo},Seguros Altamira,${enDias(-100)},${enDias(70)},`,
        ]),
      });
      expect(await resumenCarga(panel, cargaId)).toMatchObject({
        aplicadas: 3,
        nuevos: 0,
        iguales: 1,
        diferencias: 2,
      });
      // El panel conserva sus datos.
      expect((await colocaciones(p.codigo)).map((c) => [c.fuente, c.liberacion, c.vigente])).toEqual([
        ["panel", enDias(43), true],
      ]);
      expect((await leerPerfil(panel, p.codigo))!.disponibilidadFecha).toBe(enDias(43));
      const difs = (await listarDiferencias(panel)).filter((d) => [p.codigo, q.codigo].includes(d.codigo));
      expect(difs.map((d) => [d.codigo, d.numeroFila, d.panel.liberacion, d.operaciones.liberacion])).toEqual([
        [p.codigo, 2, enDias(43), enDias(60)],
        [q.codigo, 3, enDias(50), enDias(65)],
      ]);
      expect(difs[0]!.panel.registradoPor).toBe("karen@trycore.com");
      // La fila de la tabla queda señalada «diferencia con Operaciones»; la igual, no.
      const fil = (await listarColocados(panel)).colocados;
      expect(fil.find((c) => c.codigo === p.codigo)).toMatchObject({ diferencia: true, nuevo: false });
      expect(fil.find((c) => c.codigo === q.codigo)?.diferencia).toBe(true);
      expect(fil.find((c) => c.codigo === igual.codigo)?.diferencia).toBe(false);

      await decidirDiferencia(panel, claves, autor, difs[0]!.id, "aceptada");
      expect((await colocaciones(p.codigo)).map((c) => [c.fuente, c.liberacion, c.vigente])).toEqual([
        ["panel", enDias(43), false],
        ["operaciones", enDias(60), true],
      ]);
      expect(await enPortal(p.codigo)).toEqual({ fecha: enDias(60) });
      await decidirDiferencia(panel, claves, autor, difs[1]!.id, "descartada");
      expect((await colocaciones(q.codigo)).map((c) => [c.fuente, c.liberacion, c.vigente])).toEqual([
        ["panel", enDias(50), true],
      ]);
      expect((await listarDiferencias(panel)).some((d) => [p.codigo, q.codigo].includes(d.codigo))).toBe(false);
      // Decidida, la marca desaparece; aceptar la de Operaciones no la vuelve «nueva».
      const dec = (await listarColocados(panel)).colocados;
      expect(dec.find((c) => c.codigo === p.codigo)).toMatchObject({ diferencia: false, nuevo: false });
      expect(dec.find((c) => c.codigo === q.codigo)?.diferencia).toBe(false);
      expect(
        (await rechazo(decidirDiferencia(panel, claves, autor, difs[1]!.id, "aceptada"))).motivo,
      ).toBe("ya_decidida");
    });
  });
});
