// Registrar colocados y la pestaña por vencimiento contra PostgreSQL real con `ps_panel` (EP-006 ·
// sub-slice 9; HU-137): registrar un colocado deja la colocación con su autor como fuente y la
// disponibilidad = liberación (el portal ve la banda nueva, el perfil sigue publicado); sin fecha de
// liberación no se escribe nada; la pestaña lista por vencimiento con la cuenta, el inicio y el autor.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import type { ClavesAuditoria } from "./auditoria";
import { listarColocados, registrarColocado } from "./colocados";
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
});
