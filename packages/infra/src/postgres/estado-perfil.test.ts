// Disponibilidad, pausa y vigencia contra PostgreSQL real con `ps_panel` (EP-006 · sub-slice 7; HU-132,
// HU-133, HU-136): la disponibilidad cambia sin abrir la ficha —uno o en bloque, con resultado por
// perfil—, el portal (`ps_portal`) ve la banda nueva de inmediato y la auditoría guarda quién y cuándo;
// pausar exige un motivo del catálogo, saca del portal y guarda desde cuándo; reactivar pasa las guardas
// de publicar con la disponibilidad nueva; archivar es idempotente; la bandeja lee lo que toca revisar.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import type { ClavesAuditoria } from "./auditoria";
import {
  actualizarDisponibilidad,
  archivarPerfil,
  listarMotivosPausa,
  listarVigencia,
  pausarPerfil,
  quitarDisponibilidad,
  reactivarPerfil,
  usarFechaLiberacion,
} from "./estado-perfil";
import {
  crearPerfil,
  leerPerfil,
  listarInventario,
  publicarPerfil,
  publicarVarios,
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

describe.skipIf(!HAY_BD)("disponibilidad, pausa y vigencia (HU-132, HU-133, HU-136)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let portal: pg.Pool;
  let autor: { usuarioId: string; correo: string };
  let motivo: string;
  const ids = {} as Record<"rol" | "java" | "senior" | "medellin" | "hibrido" | "prueba", string>;

  const id = async (tabla: string, nombre: string) =>
    (await bd.instalacion.query(`SELECT id FROM inventario.${tabla} WHERE nombre = $1`, [nombre]))
      .rows[0].id as string;
  async function publicado(extra: Record<string, unknown> = {}) {
    const p = await crearPerfil(panel, claves, autor, {
      nombre: "Lorena",
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
      ...extra,
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
  const atrasar = (
    codigo: string,
    columna: "disponibilidad_actualizada_en" | "pausado_en",
    dias: number,
  ) =>
    bd.instalacion.query(
      `UPDATE inventario.perfiles SET ${columna} = now() - make_interval(days => $2) WHERE codigo = $1`,
      [codigo, dias],
    );

  beforeAll(async () => {
    bd = await crearBdPrueba();
    panel = bd.como("ps_panel");
    portal = bd.como("ps_portal");
    const worker = bd.como("ps_worker");
    await sembrarFicticios({ bd: worker, auditoria: claves, appEnv: "ci", registrar: () => {} });
    await sembrarLexicoFicticio({ bd: worker, appEnv: "ci", registrar: () => {} });
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
    motivo = await id("catalogo_motivos_pausa", "En licencia o ausencia temporal");
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  describe("HU-132 · disponibilidad en dos clics", () => {
    it("desde el listado: se guarda sin la ficha, el portal ve la fecha nueva y queda quién y cuándo", async () => {
      const p = await publicado();
      const n = (await auditoria(p.codigo)).length;
      const [r] = await actualizarDisponibilidad(panel, claves, autor, [p.codigo], {
        fecha: "2026-12-01",
      });
      expect(r).toMatchObject({ codigo: p.codigo, ok: true });
      expect(await enPortal(p.codigo)).toEqual({ fecha: "2026-12-01" });
      const nuevas = (await auditoria(p.codigo)).slice(n);
      expect(nuevas.map((x) => x.campo).sort()).toEqual([
        "disponibilidad_actualizada_en",
        "disponibilidad_fecha",
      ]);
      expect(new Set(nuevas.map((x) => `${x.actor}/${x.origen}`))).toEqual(
        new Set(["karen@trycore.com/panel"]),
      );
    });

    it("en bloque: se aplica a todos y el resultado es por perfil (un pausado no aplica y no aborta)", async () => {
      const a = await publicado();
      const b = await publicado();
      const c = await publicado();
      await pausarPerfil(panel, claves, autor, c.codigo, motivo);
      const r = await actualizarDisponibilidad(
        panel,
        claves,
        autor,
        [a.codigo, b.codigo, c.codigo, "PS-9999"],
        {
          opcion: "dos_semanas",
        },
      );
      expect(r.map((x) => [x.codigo, x.ok, x.ok ? null : x.motivo])).toEqual([
        [a.codigo, true, null],
        [b.codigo, true, null],
        [c.codigo, false, "no_aplica"],
        ["PS-9999", false, "no_existe"],
      ]);
      expect((await enPortal(a.codigo))?.fecha).toBe((await enPortal(b.codigo))?.fecha);
    });

    it("confirmar sin cambios conserva la fecha y renueva cuándo se actualizó", async () => {
      const p = await publicado({ disponibilidad: { fecha: "2026-12-15" } });
      await atrasar(p.codigo, "disponibilidad_actualizada_en", 40);
      const [r] = await actualizarDisponibilidad(panel, claves, autor, [p.codigo], {
        confirmar: true,
      });
      expect(r!.ok).toBe(true);
      const leido = (await leerPerfil(panel, p.codigo))!;
      expect(leido.disponibilidadFecha).toBe("2026-12-15");
      expect(Date.now() - Date.parse(leido.disponibilidadActualizadaEn!)).toBeLessThan(60_000);
    });
  });

  describe("HU-133 · pausar con motivo", () => {
    it("exige un motivo del catálogo, sale del portal y queda el motivo con quién y desde cuándo", async () => {
      const p = await publicado();
      expect(
        (
          await rechazo(
            pausarPerfil(panel, claves, autor, p.codigo, "00000000-0000-0000-0000-000000000000"),
          )
        ).motivo,
      ).toBe("motivo_no_disponible");
      const n = (await auditoria(p.codigo)).length;
      const r = await pausarPerfil(panel, claves, autor, p.codigo, motivo);
      expect(r.estado).toBe("pausado");
      expect(await enPortal(p.codigo)).toBeUndefined();
      expect(
        (await auditoria(p.codigo))
          .slice(n)
          .map((x) => x.campo)
          .sort(),
      ).toEqual(["disponibilidad_fecha", "estado", "motivo_pausa"]);
      const f = (
        await bd.instalacion.query(`SELECT pausado_en FROM inventario.perfiles WHERE codigo = $1`, [
          p.codigo,
        ])
      ).rows[0];
      expect(Date.now() - f.pausado_en.getTime()).toBeLessThan(60_000);
    });

    it("solo se pausa lo que está a la vista; los motivos son los activos del catálogo", async () => {
      const p = await publicado();
      await pausarPerfil(panel, claves, autor, p.codigo, motivo);
      expect((await rechazo(pausarPerfil(panel, claves, autor, p.codigo, motivo))).motivo).toBe(
        "transicion_invalida",
      );
      expect((await listarMotivosPausa(panel)).map((m) => m.nombre)).toEqual([
        "Decisión de Talento Humano",
        "En licencia o ausencia temporal",
        "En proceso de selección con otro cliente",
      ]);
    });

    it("reactivar vuelve a publicado con la disponibilidad nueva y limpia la pausa", async () => {
      const p = await publicado();
      await pausarPerfil(panel, claves, autor, p.codigo, motivo);
      const r = await reactivarPerfil(panel, claves, autor, p.codigo, { fecha: "2026-11-20" });
      expect(r.estado).toBe("publicado");
      expect(await enPortal(p.codigo)).toEqual({ fecha: "2026-11-20" });
      const f = (
        await bd.instalacion.query(
          `SELECT pausado_en, motivo_pausa_id FROM inventario.perfiles WHERE codigo = $1`,
          [p.codigo],
        )
      ).rows[0];
      expect(f).toEqual({ pausado_en: null, motivo_pausa_id: null });
    });

    it("un motivo retirado del catálogo no sirve para pausar y el perfil sigue a la vista", async () => {
      const p = await publicado();
      const retirado = (
        await bd.instalacion.query(
          `INSERT INTO inventario.catalogo_motivos_pausa (nombre, activo) VALUES ('Motivo retirado', false) RETURNING id`,
        )
      ).rows[0].id as string;
      expect((await rechazo(pausarPerfil(panel, claves, autor, p.codigo, retirado))).motivo).toBe(
        "motivo_no_disponible",
      );
      expect((await leerPerfil(panel, p.codigo))!.estado).toBe("publicado");
      expect(await enPortal(p.codigo)).toBeDefined();
    });

    it("reactivar pasa las guardas de publicar: si falta algo, dice qué y sigue pausado", async () => {
      const p = await publicado();
      await pausarPerfil(panel, claves, autor, p.codigo, motivo);
      await bd.instalacion.query(
        `UPDATE inventario.perfiles SET modalidad_prueba_id = NULL WHERE codigo = $1`,
        [p.codigo],
      );
      const e = await rechazo(reactivarPerfil(panel, claves, autor, p.codigo, { opcion: "ahora" }));
      expect(e.motivo).toBe("no_publicable");
      expect((await leerPerfil(panel, p.codigo))!.estado).toBe("pausado");
      expect(await enPortal(p.codigo)).toBeUndefined();
    });

    it("archivar saca del banco una vez; repetirlo informa sin escribir", async () => {
      const p = await publicado();
      await pausarPerfil(panel, claves, autor, p.codigo, motivo);
      expect((await archivarPerfil(panel, claves, autor, p.codigo)).yaArchivado).toBe(false);
      const n = (await auditoria(p.codigo)).length;
      expect((await archivarPerfil(panel, claves, autor, p.codigo)).yaArchivado).toBe(true);
      expect((await auditoria(p.codigo)).length).toBe(n);
    });
  });

  describe("HU-134 · coherencia entre estado y disponibilidad", () => {
    it("pausar deja la disponibilidad vacía: un pausado recién pausado es coherente (D32)", async () => {
      const p = await publicado();
      const r = await pausarPerfil(panel, claves, autor, p.codigo, motivo);
      expect(r.disponibilidadFecha).toBeNull();
      expect(r.coherencia).toBeNull();
    });

    it("un pausado al que le ponen fecha queda en ALTA con la contradicción nombrada (D6)", async () => {
      const p = await publicado();
      await pausarPerfil(panel, claves, autor, p.codigo, motivo);
      const [r] = await actualizarDisponibilidad(panel, claves, autor, [p.codigo], {
        fecha: "2026-12-01",
      });
      expect(r!.ok).toBe(true);
      const leido = (await leerPerfil(panel, p.codigo))!;
      expect(leido.estado).toBe("pausado");
      expect(leido.coherencia).toMatchObject({
        severidad: "alta",
        clave: "pausado_con_disponibilidad",
      });
      expect(await enPortal(p.codigo)).toBeUndefined();
      const fila = (await listarInventario(panel)).find((f) => f.codigo === p.codigo)!;
      expect(fila.coherencia?.clave).toBe("pausado_con_disponibilidad");
    });

    it("en bloque, un pausado sigue sin aplicar: no se crean contradicciones en masa", async () => {
      const a = await publicado();
      const c = await publicado();
      await pausarPerfil(panel, claves, autor, c.codigo, motivo);
      const r = await actualizarDisponibilidad(panel, claves, autor, [a.codigo, c.codigo], {
        opcion: "ahora",
      });
      expect(r.map((x) => x.ok)).toEqual([true, false]);
      expect((await leerPerfil(panel, c.codigo))!.disponibilidadFecha).toBeNull();
    });

    it("publicar un pausado con ALTA se impide y dice la contradicción; el perfil no cambia", async () => {
      const p = await publicado();
      await pausarPerfil(panel, claves, autor, p.codigo, motivo);
      await actualizarDisponibilidad(panel, claves, autor, [p.codigo], { fecha: "2026-12-01" });
      const n = (await auditoria(p.codigo)).length;
      const e = await rechazo(publicarPerfil(panel, claves, autor, p.codigo));
      expect(e.motivo).toBe("incoherencia");
      expect(e.detalle.contradiccion).toMatch(/^Pausado y con disponibilidad «/);
      const [m] = await publicarVarios(panel, claves, autor, [p.codigo]);
      expect(m).toMatchObject({ ok: false, motivos: ["incoherencia"] });
      expect((await leerPerfil(panel, p.codigo))!.estado).toBe("pausado");
      expect((await auditoria(p.codigo)).length).toBe(n);
    });

    it("las dos salidas desde la fila: quitar la disponibilidad o publicar con ella", async () => {
      const a = await publicado();
      const b = await publicado();
      for (const x of [a, b]) {
        await pausarPerfil(panel, claves, autor, x.codigo, motivo);
        await actualizarDisponibilidad(panel, claves, autor, [x.codigo], { fecha: "2026-12-01" });
      }
      const q = await quitarDisponibilidad(panel, claves, autor, a.codigo);
      expect(q).toMatchObject({ estado: "pausado", disponibilidadFecha: null, coherencia: null });
      const r = await reactivarPerfil(panel, claves, autor, b.codigo, { confirmar: true });
      expect(r).toMatchObject({
        estado: "publicado",
        disponibilidadFecha: "2026-12-01",
        coherencia: null,
      });
      expect(await enPortal(b.codigo)).toEqual({ fecha: "2026-12-01" });
      // Quitar la disponibilidad a lo que está a la vista lo dejaría en ALTA: no se permite.
      expect((await rechazo(quitarDisponibilidad(panel, claves, autor, b.codigo))).motivo).toBe(
        "no_aplica",
      );
    });

    it("colocado con «Disponible ahora» es ALTA y «Usar la fecha de liberación» lo corrige", async () => {
      const p = await publicado();
      // Colocado (publicado con colocación vigente) al que alguien le puso «Disponible ahora».
      await bd.instalacion.query(
        `INSERT INTO inventario.colocaciones (perfil_id, cuenta, inicio, liberacion, fuente)
         SELECT id, 'Seguros Altamira', current_date - 30, '2099-11-13', 'siembra'
           FROM inventario.perfiles WHERE codigo = $1`,
        [p.codigo],
      );
      await bd.instalacion.query(
        `UPDATE inventario.perfiles SET disponibilidad_fecha = current_date WHERE codigo = $1`,
        [p.codigo],
      );
      expect((await leerPerfil(panel, p.codigo))!.coherencia?.clave).toBe(
        "colocado_disponible_ahora",
      );
      const r = await usarFechaLiberacion(panel, claves, autor, p.codigo);
      expect(r).toMatchObject({ disponibilidadFecha: "2099-11-13", coherencia: null });
      expect((await auditoria(p.codigo)).at(-1)?.campo).toBe("disponibilidad_actualizada_en");
    });

    it("MEDIA no bloquea: vencida y más de 30 días se lee «por confirmar» y sigue en el portal", async () => {
      const p = await publicado({ disponibilidad: { fecha: "2026-11-15" } });
      await bd.instalacion.query(
        `UPDATE inventario.perfiles SET disponibilidad_fecha = current_date - 15,
                disponibilidad_actualizada_en = now() - interval '46 days' WHERE codigo = $1`,
        [p.codigo],
      );
      const leido = (await leerPerfil(panel, p.codigo))!;
      expect(leido.coherencia).toMatchObject({
        severidad: "media",
        clave: "por_confirmar",
        porConfirmar: true,
      });
      expect(await enPortal(p.codigo)).toBeDefined();
      const b = await listarVigencia(panel);
      expect(b.porConfirmar.map((x) => x.codigo)).toContain(p.codigo);
    });
  });

  describe("HU-135 · archivar en lugar de borrar", () => {
    it("archivar deja de mostrarse, pone archivado_en y vacía la disponibilidad; repetirlo no toca nada", async () => {
      const p = await publicado();
      const r = await archivarPerfil(panel, claves, autor, p.codigo);
      expect(r).toMatchObject({
        yaArchivado: false,
        perfil: { estado: "archivado", disponibilidadFecha: null },
      });
      expect(r.perfil.coherencia).toBeNull();
      expect(await enPortal(p.codigo)).toBeUndefined();
      const antes = (
        await bd.instalacion.query(
          `SELECT archivado_en FROM inventario.perfiles WHERE codigo = $1`,
          [p.codigo],
        )
      ).rows[0].archivado_en as Date;
      expect(antes).toBeInstanceOf(Date);
      const n = (await auditoria(p.codigo)).length;
      expect((await archivarPerfil(panel, claves, autor, p.codigo)).yaArchivado).toBe(true);
      const despues = (
        await bd.instalacion.query(
          `SELECT archivado_en FROM inventario.perfiles WHERE codigo = $1`,
          [p.codigo],
        )
      ).rows[0].archivado_en as Date;
      expect(despues.getTime()).toBe(antes.getTime());
      expect((await auditoria(p.codigo)).length).toBe(n);
    });
  });

  describe("HU-136 · bandeja de vigencia", () => {
    it("trae publicados de más de 30 días y pausados de más de 30 días; 30 días no entra", async () => {
      const viejo = await publicado();
      const limite = await publicado();
      const pausado31 = await publicado();
      const pausado30 = await publicado();
      await atrasar(viejo.codigo, "disponibilidad_actualizada_en", 45);
      await atrasar(limite.codigo, "disponibilidad_actualizada_en", 30);
      await pausarPerfil(panel, claves, autor, pausado31.codigo, motivo);
      await pausarPerfil(panel, claves, autor, pausado30.codigo, motivo);
      await atrasar(pausado31.codigo, "pausado_en", 31);
      await atrasar(pausado30.codigo, "pausado_en", 30);
      const b = await listarVigencia(panel);
      const codigos = [...b.porRevisar, ...b.porConfirmar].map((x) => x.codigo);
      expect(codigos).toContain(viejo.codigo);
      expect(codigos).not.toContain(limite.codigo);
      expect(b.pausados.map((x) => x.codigo)).toContain(pausado31.codigo);
      expect(b.pausados.map((x) => x.codigo)).not.toContain(pausado30.codigo);
      const fila = b.pausados.find((x) => x.codigo === pausado31.codigo)!;
      expect(fila).toMatchObject({ dias: 31, motivoPausa: "En licencia o ausencia temporal" });
      expect(b.perfiles[pausado31.codigo]).toMatchObject({ nombre: "Lorena Salcedo" });
    });

    it("cada fila dice en cuántos enlaces activos y vigentes está (los revocados y vencidos no cuentan)", async () => {
      const viejo = await publicado();
      await atrasar(viejo.codigo, "disponibilidad_actualizada_en", 45);
      const enlace = (desde: string, hasta: string, estado = "activo") =>
        bd.instalacion.query(
          `INSERT INTO identidad.enlaces (cuenta_ref, cuenta_nombre, razon, codigos_perfil, vigente_desde, vigente_hasta, estado, generado_por)
           VALUES ('1', 'Bancolombia', 'Pagos.', $1, now() + $2::interval, now() + $3::interval, $4, gen_random_uuid())`,
          [[viejo.codigo, "PS-0187"], desde, hasta, estado],
        );
      await enlace("-1 day", "20 days");
      await enlace("-2 days", "10 days");
      await enlace("-1 day", "20 days", "revocado");
      await enlace("-40 days", "-10 days");
      const b = await listarVigencia(panel);
      expect(b.perfiles[viejo.codigo]!.enlacesActivos).toBe(2);
    });
  });
});
