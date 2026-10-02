// Editar un publicado en dos pasos contra PostgreSQL real con `ps_panel` (EP-006 · sub-slice 6;
// HU-126, D1, D3): previsualizar no escribe nada y el portal (`ps_portal`) sigue con la versión
// vigente; confirmar aplica, sube la versión del inventario y audita cada campo con su autor; un
// cambio que deja el perfil incompleto no se aplica sin respuesta —descartar no escribe ni audita
// nada; pasar a borrador guarda el cambio, lo saca del portal y audita que salió por esta edición—.
// La versión que se abrió (`If-Match`) se exige en todos los pasos.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import type { ClavesAuditoria } from "./auditoria";
import {
  crearPerfil,
  editarPublicado,
  guardarPerfil,
  leerPerfil,
  publicarPerfil,
  registrarConsentimiento,
} from "./perfiles-panel";
import { RechazoInventario } from "./unidad-inventario";
import { sembrarFicticios } from "../../../../apps/worker/src/sembrar-ficticios";
import { sembrarLexicoFicticio } from "../../../../apps/worker/src/sembrar-lexico";

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

describe.skipIf(!HAY_BD)("editar un perfil publicado (HU-126)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let portal: pg.Pool;
  let autor: { usuarioId: string; correo: string };
  const ids = {} as Record<
    "rol" | "java" | "kafka" | "senior" | "medellin" | "hibrido" | "prueba",
    string
  >;

  const id = async (tabla: string, nombre: string) =>
    (await bd.instalacion.query(`SELECT id FROM inventario.${tabla} WHERE nombre = $1`, [nombre]))
      .rows[0].id as string;

  const completo = () => ({
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
    aporte: "Integraciones estables.",
    experiencias: [
      { cargo: "Backend senior", desde: 2021, hasta: 2026, descripcion: "Pagos inmediatos." },
    ],
  });

  // Un perfil completo, con consentimiento nominal y publicado.
  async function publicado() {
    const p = await crearPerfil(panel, claves, autor, completo());
    const c = await registrarConsentimiento(panel, claves, autor, p.codigo, {
      nombreApellido: true,
      trayectoria: true,
      clientes: true,
    });
    return publicarPerfil(panel, claves, autor, c.codigo, c.version);
  }

  const tecnologiasEnPortal = async (codigo: string) =>
    (
      await portal.query(
        `SELECT tecnologias FROM operacion.catalogo_publicable WHERE codigo = $1`,
        [codigo],
      )
    ).rows[0]?.tecnologias as string[] | undefined;
  const auditoria = async (codigo: string) =>
    (
      await bd.instalacion.query(
        `SELECT campo, actor, origen FROM auditoria.auditoria WHERE titular = $1 ORDER BY seq`,
        [codigo],
      )
    ).rows as Array<{ campo: string; actor: string; origen: string }>;
  const versionInventario = async () => Number(
    (await bd.instalacion.query(`SELECT version FROM inventario.inventario_version WHERE id = 1`))
      .rows[0].version as string);

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
    ids.kafka = await id("catalogo_tecnologias", "Kafka");
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

  it("guardar un publicado por la vía del borrador sigue rechazado: se edita en dos pasos", async () => {
    const p = await publicado();
    const e = await rechazo(
      guardarPerfil(panel, claves, autor, p.codigo, p.version, {
        tecnologiaIds: [ids.java, ids.kafka],
      }),
    );
    expect(e.motivo).toBe("editar_publicado");
  });

  it("previsualizar muestra el impacto sin escribir: el portal sigue con la versión anterior", async () => {
    const p = await publicado();
    const auditAntes = await auditoria(p.codigo);
    const inv = await versionInventario();
    const r = await editarPublicado(
      panel,
      claves,
      autor,
      p.codigo,
      p.version,
      {
        tecnologiaIds: [ids.java, ids.kafka],
        aporte: "Acompañar migraciones a eventos.",
      },
      { previsualizar: true },
    );
    expect(r.resultado).toBe("impacto");
    if (r.resultado !== "impacto") return;
    expect(r.antes.tecnologias.map((t) => t.nombre)).toEqual(["Java"]);
    expect(r.propuesto.tecnologias.map((t) => t.nombre)).toEqual(["Java", "Kafka"]);
    expect(r.propuesto.evaluacion.publicable).toBe(true);
    // La motivación es interna: se declara aparte, sin efecto para el cliente.
    expect(r.internos).toEqual(["aporte"]);
    expect(await tecnologiasEnPortal(p.codigo)).toEqual(["Java"]);
    const vigente = (await leerPerfil(panel, p.codigo))!;
    expect(vigente.version).toBe(p.version);
    expect(vigente.aporte).toBe("Integraciones estables.");
    expect(await auditoria(p.codigo)).toEqual(auditAntes);
    expect(await versionInventario()).toBe(inv);
  });

  it("confirmar aplica el cambio en el portal y registra qué cambió, quién y con qué origen", async () => {
    const p = await publicado();
    const n = (await auditoria(p.codigo)).length;
    const inv = await versionInventario();
    const r = await editarPublicado(panel, claves, autor, p.codigo, p.version, {
      tecnologiaIds: [ids.java, ids.kafka],
    });
    expect(r.resultado).toBe("aplicado");
    if (r.resultado !== "aplicado") return;
    expect(r.perfil.estado).toBe("publicado");
    expect(r.perfil.version).toBeGreaterThan(p.version);
    expect(await tecnologiasEnPortal(p.codigo)).toEqual(["Java", "Kafka"]);
    expect((await auditoria(p.codigo)).slice(n)).toEqual([
      { campo: "tecnologias", actor: "karen@trycore.com", origen: "panel" },
    ]);
    expect(await versionInventario()).toBe(inv + 1);
  });

  it("si el cambio deja el perfil incompleto, pregunta y no aplica nada mientras no responda", async () => {
    const p = await publicado();
    const n = (await auditoria(p.codigo)).length;
    for (const previsualizar of [true, false]) {
      const r = await editarPublicado(
        panel,
        claves,
        autor,
        p.codigo,
        p.version,
        { tecnologiaIds: [] },
        {
          previsualizar,
        },
      );
      expect(r.resultado).toBe("deja_incompleto");
      if (r.resultado !== "deja_incompleto") return;
      expect(r.propuesto.evaluacion.faltanDatos.map((f) => f.campo)).toEqual(["tecnologias"]);
    }
    expect(await tecnologiasEnPortal(p.codigo)).toEqual(["Java"]);
    expect((await leerPerfil(panel, p.codigo))!.estado).toBe("publicado");
    expect((await auditoria(p.codigo)).length).toBe(n);
  });

  it("descartar conserva exactamente los valores y no deja nada en la auditoría", async () => {
    const p = await publicado();
    const auditAntes = await auditoria(p.codigo);
    const r = await editarPublicado(
      panel,
      claves,
      autor,
      p.codigo,
      p.version,
      { tecnologiaIds: [] },
      {
        resolucion: "descartar",
      },
    );
    expect(r.resultado).toBe("descartado");
    const vigente = (await leerPerfil(panel, p.codigo))!;
    expect({ ...vigente, evaluacion: undefined }).toEqual({ ...p, evaluacion: undefined });
    expect(await auditoria(p.codigo)).toEqual(auditAntes);
    expect(await tecnologiasEnPortal(p.codigo)).toEqual(["Java"]);
  });

  it("pasar a borrador guarda el cambio, lo saca del portal y registra que salió por esta edición", async () => {
    const p = await publicado();
    const n = (await auditoria(p.codigo)).length;
    const r = await editarPublicado(
      panel,
      claves,
      autor,
      p.codigo,
      p.version,
      { tecnologiaIds: [] },
      {
        resolucion: "a_borrador",
      },
    );
    expect(r.resultado).toBe("a_borrador");
    if (r.resultado !== "a_borrador") return;
    expect(r.perfil.estado).toBe("borrador");
    expect(r.perfil.tecnologias).toEqual([]);
    expect(await tecnologiasEnPortal(p.codigo)).toBeUndefined();
    const nuevas = (await auditoria(p.codigo)).slice(n);
    expect(nuevas.map((x) => x.campo).sort()).toEqual(["estado", "motivo_estado", "tecnologias"]);
    expect(new Set(nuevas.map((x) => `${x.actor}/${x.origen}`))).toEqual(
      new Set(["karen@trycore.com/panel"]),
    );
    const motivo = await bd.instalacion.query(
      `SELECT count(*)::int AS n FROM auditoria.auditoria WHERE titular = $1 AND campo = 'motivo_estado'`,
      [p.codigo],
    );
    expect(motivo.rows[0].n).toBe(1);
  });

  it("pasar a borrador con un cambio que no lo deja incompleto también lo aplica (la persona decide)", async () => {
    const p = await publicado();
    const r = await editarPublicado(
      panel,
      claves,
      autor,
      p.codigo,
      p.version,
      { aniosExperiencia: 9 },
      {
        resolucion: "a_borrador",
      },
    );
    expect(r.resultado).toBe("a_borrador");
  });

  it("exige la versión que se abrió en todos los pasos y no edita un borrador por esta vía", async () => {
    const p = await publicado();
    for (const o of [
      { previsualizar: true },
      {},
      { resolucion: "descartar" as const },
      { resolucion: "a_borrador" as const },
    ]) {
      const e = await rechazo(
        editarPublicado(panel, claves, autor, p.codigo, p.version - 1, { aniosExperiencia: 9 }, o),
      );
      expect(e.motivo).toBe("version_distinta");
    }
    const b = await crearPerfil(panel, claves, autor, completo());
    const e = await rechazo(
      editarPublicado(panel, claves, autor, b.codigo, b.version, { aniosExperiencia: 9 }),
    );
    expect(e.motivo).toBe("no_es_publicado");
  });
});
