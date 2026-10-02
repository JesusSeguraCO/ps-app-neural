// SARO y DISC en el perfil contra PostgreSQL real con `ps_panel` (EP-003 · SS1, tareas 1.6, 1.7 y 1.8;
// HU-176, HU-177): el editor guarda el alcance elegido del catálogo (solo activos; el desactivado que el
// perfil ya tenía se conserva), la fecha SARO y la DISC; una fecha posterior a hoy se rechaza sin
// escribir; publicar (individual y masiva) exige los tres con el motivo exacto; corregir un publicado
// pasa por la confirmación de HU-126 y queda en el historial con el valor anterior y el nuevo; el
// portal (`ps_portal`) ve el dato nuevo.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { faltaDe, type EvaluacionPublicacion } from "@ps/dominio/inventario/perfil";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import { leerCambios, type ClavesAuditoria } from "./auditoria";
import { cambiarActivo, crearValor } from "./catalogos-panel";
import {
  crearPerfil,
  editarPublicado,
  guardarPerfil,
  leerPerfil,
  opcionesEditor,
  publicarPerfil,
  publicarVarios,
  registrarConsentimiento,
  type EntradaPerfil,
} from "./perfiles-panel";
import { RechazoInventario } from "./unidad-inventario";
import { sembrarFicticios } from "../../../../apps/worker/src/sembrar-ficticios";
import { sembrarLexicoFicticio } from "../../../../apps/worker/src/sembrar-lexico";

const claves: ClavesAuditoria = {
  hmac: randomBytes(32).toString("base64"),
  kek: randomBytes(32).toString("base64"),
};
// «Hoy» de los escenarios de HU-176 (2 de octubre de 2026, Bogotá).
const HOY = new Date("2026-10-02T15:00:00Z");
const ANTECEDENTES = "Antecedentes judiciales, disciplinarios y fiscales";

async function rechazo(p: Promise<unknown>) {
  try {
    await p;
  } catch (e) {
    if (e instanceof RechazoInventario) return e;
    throw e;
  }
  throw new Error("sin_rechazo");
}

describe.skipIf(!HAY_BD)("SARO y DISC en el perfil (HU-176, HU-177)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let portal: pg.Pool;
  let autor: { usuarioId: string; correo: string };
  let antecedentes: string;
  const ids = {} as Record<"rol" | "java" | "senior" | "medellin" | "hibrido" | "prueba", string>;

  const id = async (tabla: string, nombre: string) =>
    (await bd.instalacion.query(`SELECT id FROM inventario.${tabla} WHERE nombre = $1`, [nombre]))
      .rows[0].id as string;

  const base = (extra: EntradaPerfil = {}): EntradaPerfil => ({
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
    experiencias: [
      { cargo: "Backend senior", desde: 2021, hasta: 2026, descripcion: "Pagos inmediatos." },
    ],
    ...extra,
  });
  const saroDisc = (extra: EntradaPerfil = {}): EntradaPerfil => ({
    saroAlcanceId: antecedentes,
    saroFecha: "2026-03-15",
    discFecha: "2026-04-10",
    ...extra,
  });
  const nominal = { nombreApellido: true, trayectoria: true, clientes: true };

  // Borrador con consentimiento: lo único que decide si se publica es lo que cada test le dé.
  const borrador = async (e: EntradaPerfil) => {
    const p = await crearPerfil(panel, claves, autor, base(e), HOY);
    return registrarConsentimiento(panel, claves, autor, p.codigo, nominal);
  };
  const publicado = async (e: EntradaPerfil = saroDisc()) => {
    const p = await borrador(e);
    return publicarPerfil(panel, claves, autor, p.codigo, p.version);
  };
  const fichaPortal = async (codigo: string) =>
    (
      await portal.query(
        `SELECT saro_texto, saro_fecha::text AS saro_fecha, disc_fecha::text AS disc_fecha
           FROM operacion.ficha_publicable WHERE codigo = $1`,
        [codigo],
      )
    ).rows[0];

  beforeAll(async () => {
    bd = await crearBdPrueba();
    panel = bd.como("ps_panel");
    portal = bd.como("ps_portal");
    await sembrarFicticios({ bd: panel, auditoria: claves, appEnv: "ci", registrar: () => {} });
    await sembrarLexicoFicticio({
      bd: panel,
      candidatas: bd.como("ps_worker"),
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
    antecedentes = await id("catalogo_alcances_saro", ANTECEDENTES);
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  describe("HU-176 · registrar los tres datos (tarea 1.6)", () => {
    it("happy: guardar conserva el alcance elegido, la fecha SARO y la DISC; el editor lee el texto del alcance", async () => {
      const p = await crearPerfil(panel, claves, autor, base(), HOY);
      expect(p.saro).toEqual({ alcance: null, fecha: null });
      expect(p.disc).toEqual({ fecha: null });
      const g = await guardarPerfil(panel, claves, autor, p.codigo, p.version, saroDisc(), HOY);
      expect(g.saro).toEqual({
        alcance: {
          id: antecedentes,
          nombre: ANTECEDENTES,
          textoCliente: "Verificamos sus antecedentes judiciales, disciplinarios y fiscales.",
          activo: true,
        },
        fecha: "2026-03-15",
      });
      expect(g.disc).toEqual({ fecha: "2026-04-10" });
      const cambios = await leerCambios(bd.instalacion, claves.kek, "perfiles", p.id);
      expect(
        cambios
          .filter((c) => c.campo.startsWith("saro") || c.campo === "disc_fecha")
          .map((c) => [c.campo, c.despues]),
      ).toEqual([
        ["saro_alcance", antecedentes],
        ["saro_fecha", "2026-03-15"],
        ["disc_fecha", "2026-04-10"],
      ]);
    });

    it("un borrador se guarda con parte de los datos", async () => {
      const p = await crearPerfil(panel, claves, autor, base({ saroAlcanceId: antecedentes }), HOY);
      expect(p.saro.alcance?.id).toBe(antecedentes);
      expect(p.saro.fecha).toBeNull();
    });

    it("el editor ofrece solo los alcances activos del catálogo, con su texto", async () => {
      const o = await opcionesEditor(panel);
      expect(o.alcancesSaro).toContainEqual({
        id: antecedentes,
        nombre: ANTECEDENTES,
        textoCliente: "Verificamos sus antecedentes judiciales, disciplinarios y fiscales.",
      });
    });

    it("HU-177: el editor no admite un alcance que no esté en el catálogo", async () => {
      const p = await crearPerfil(panel, claves, autor, base(), HOY);
      const e = await rechazo(
        guardarPerfil(
          panel,
          claves,
          autor,
          p.codigo,
          p.version,
          { saroAlcanceId: "00000000-0000-0000-0000-000000000099" },
          HOY,
        ),
      );
      expect(e.motivo).toBe("valor_no_disponible");
    });
  });

  describe("HU-176 · una fecha futura (tarea 1.6)", () => {
    it.each(["saroFecha", "discFecha"] as const)(
      "%s posterior a hoy → rechazada con su campo, sin escribir: el perfil conserva lo que tenía",
      async (campo) => {
        const p = await crearPerfil(panel, claves, autor, base(saroDisc()), HOY);
        const e = await rechazo(
          guardarPerfil(
            panel,
            claves,
            autor,
            p.codigo,
            p.version,
            { [campo]: "2026-11-15", resumen: "otro" },
            HOY,
          ),
        );
        expect(e.motivo).toBe("fecha_verificacion_futura");
        expect(e.detalle).toMatchObject({ campo });
        const despues = (await leerPerfil(panel, p.codigo))!;
        expect(despues.version).toBe(p.version);
        expect(despues.saro.fecha).toBe("2026-03-15");
        expect(despues.disc.fecha).toBe("2026-04-10");
        expect(despues.resumen).toBeNull();
      },
    );

    it("una fecha ilegible → rechazada", async () => {
      const p = await crearPerfil(panel, claves, autor, base(), HOY);
      const e = await rechazo(
        guardarPerfil(panel, claves, autor, p.codigo, p.version, { saroFecha: "2026-02-30" }, HOY),
      );
      expect(e.motivo).toBe("fecha_verificacion_ilegible");
    });
  });

  describe("HU-176 · publicar sin SARO o sin DISC (tarea 1.7)", () => {
    it.each([
      ["el alcance de la verificación SARO", { saroAlcanceId: null }, "saro_alcance"],
      ["la fecha de la verificación SARO", { saroFecha: null }, "saro_fecha"],
      ["la fecha de la evaluación DISC", { discFecha: null }, "disc_fecha"],
    ] as const)(
      "falta %s → «Falta …» exacto, campo de destino, sigue en borrador y fuera del portal",
      async (motivo, quitar, clave) => {
        const p = await borrador(saroDisc(quitar));
        const e = await rechazo(publicarPerfil(panel, claves, autor, p.codigo, p.version));
        expect(e.motivo).toBe("no_publicable");
        const ev = e.detalle.evaluacion as EvaluacionPublicacion;
        const fallan = ev.condiciones.filter((c) => !c.cumple);
        expect(fallan.map((c) => [c.clave, faltaDe(c), c.campo])).toEqual([
          [clave, `Falta ${motivo}`, clave],
        ]);
        expect((await leerPerfil(panel, p.codigo))!.estado).toBe("borrador");
        expect(await fichaPortal(p.codigo)).toBeUndefined();
      },
    );

    it("con los tres publica y el portal ve el texto del alcance y las fechas", async () => {
      const p = await publicado();
      expect(p.estado).toBe("publicado");
      expect(await fichaPortal(p.codigo)).toEqual({
        saro_texto: "Verificamos sus antecedentes judiciales, disciplinarios y fiscales.",
        saro_fecha: "2026-03-15",
        disc_fecha: "2026-04-10",
      });
    });

    it("publicación masiva: el que no cumple queda con su motivo y no aborta a los demás", async () => {
      const ok = await borrador(saroDisc());
      const sinDisc = await borrador(saroDisc({ discFecha: null }));
      const r = await publicarVarios(panel, claves, autor, [ok.codigo, sinDisc.codigo]);
      expect(r.find((x) => x.codigo === ok.codigo)).toMatchObject({ ok: true });
      expect(r.find((x) => x.codigo === sinDisc.codigo)).toMatchObject({
        ok: false,
        motivos: ["disc_fecha"],
      });
      expect((await leerPerfil(panel, sinDisc.codigo))!.estado).toBe("borrador");
    });
  });

  describe("HU-176 · corregir el dato de un perfil publicado (tarea 1.7)", () => {
    it("pasa por la confirmación de HU-126: previsualizar no escribe; confirmar cambia la ficha y deja quién, cuándo, antes y después", async () => {
      const p = await publicado();
      const pre = await editarPublicado(
        panel,
        claves,
        autor,
        p.codigo,
        p.version,
        { saroFecha: "2026-02-20" },
        { previsualizar: true },
        HOY,
      );
      expect(pre.resultado).toBe("impacto");
      expect((await fichaPortal(p.codigo)).saro_fecha).toBe("2026-03-15");
      const r = await editarPublicado(
        panel,
        claves,
        autor,
        p.codigo,
        p.version,
        { saroFecha: "2026-02-20" },
        {},
        HOY,
      );
      expect(r.resultado).toBe("aplicado");
      expect((await fichaPortal(p.codigo)).saro_fecha).toBe("2026-02-20");
      const c = (await leerCambios(bd.instalacion, claves.kek, "perfiles", p.id)).filter(
        (x) => x.campo === "saro_fecha",
      );
      expect(c.at(-1)).toMatchObject({
        actor: "karen@trycore.com",
        antes: "2026-03-15",
        despues: "2026-02-20",
        origen: "panel",
      });
      expect(c.at(-1)!.cuando).toBeTruthy();
    });

    it("una fecha futura en un publicado tampoco se escribe", async () => {
      const p = await publicado();
      const e = await rechazo(
        editarPublicado(
          panel,
          claves,
          autor,
          p.codigo,
          p.version,
          { discFecha: "2026-11-15" },
          {},
          HOY,
        ),
      );
      expect(e.motivo).toBe("fecha_verificacion_futura");
      expect((await fichaPortal(p.codigo)).disc_fecha).toBe("2026-04-10");
    });
  });

  describe("HU-177 · alcance desactivado (tarea 1.8)", () => {
    it("los perfiles que lo tenían lo conservan; no se asigna a uno que no lo tenía; el editor no lo ofrece", async () => {
      const retirado = (
        await crearValor(panel, claves, autor, "alcance_saro", {
          nombre: "Antecedentes judiciales",
          textoCliente: "Verificamos antecedentes judiciales.",
          confirmarDistinto: true,
        })
      ).id;
      const a = await publicado(saroDisc({ saroAlcanceId: retirado }));
      const b = await publicado(saroDisc({ saroAlcanceId: retirado }));
      await cambiarActivo(panel, claves, autor, "alcance_saro", retirado, false);
      for (const p of [a, b]) {
        const l = (await leerPerfil(panel, p.codigo))!;
        expect(l.saro.alcance).toMatchObject({ id: retirado, activo: false });
        expect((await fichaPortal(p.codigo)).saro_texto).toBe(
          "Verificamos antecedentes judiciales.",
        );
      }
      expect((await opcionesEditor(panel)).alcancesSaro.map((x) => x.id)).not.toContain(retirado);
      const otro = await crearPerfil(panel, claves, autor, base(), HOY);
      const e = await rechazo(
        guardarPerfil(
          panel,
          claves,
          autor,
          otro.codigo,
          otro.version,
          { saroAlcanceId: retirado },
          HOY,
        ),
      );
      expect(e.motivo).toBe("valor_no_disponible");
    });

    it("editar el resumen de un publicado con el alcance desactivado: se confirma y queda publicado, conservándolo, sin marcarlo incompleto", async () => {
      const retirado = (
        await crearValor(panel, claves, autor, "alcance_saro", {
          nombre: "Antecedentes judiciales recientes",
          textoCliente: "Verificamos antecedentes judiciales recientes.",
          confirmarDistinto: true,
        })
      ).id;
      const p = await publicado(saroDisc({ saroAlcanceId: retirado }));
      await cambiarActivo(panel, claves, autor, "alcance_saro", retirado, false);
      // El editor reenvía el alcance actual con el resto del formulario.
      const cambio = { resumen: "Resumen corregido.", saroAlcanceId: retirado };
      const pre = await editarPublicado(
        panel,
        claves,
        autor,
        p.codigo,
        p.version,
        cambio,
        { previsualizar: true },
        HOY,
      );
      expect(pre.resultado).toBe("impacto");
      const r = await editarPublicado(panel, claves, autor, p.codigo, p.version, cambio, {}, HOY);
      expect(r.resultado).toBe("aplicado");
      const l = (await leerPerfil(panel, p.codigo))!;
      expect(l.estado).toBe("publicado");
      expect(l.resumen).toBe("Resumen corregido.");
      expect(l.saro.alcance).toMatchObject({ id: retirado, activo: false });
      expect(l.evaluacion.publicable).toBe(true);
      expect((await fichaPortal(p.codigo)).saro_texto).toBe(
        "Verificamos antecedentes judiciales recientes.",
      );
    });
  });
});
