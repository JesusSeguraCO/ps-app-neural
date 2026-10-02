// Catálogo de alcances SARO en el panel contra PostgreSQL real con `ps_panel` (EP-003 · SS1, tareas
// 1.2, 1.3 y 1.8; HU-177): se administra con el mismo código que los demás catálogos (crear sin
// duplicar, parecidos, desactivar sin borrar, fusionar), con texto de cara al cliente obligatorio, y
// corregir ese texto declara antes cuántas fichas publicadas lo mostrarán; confirmar queda auditado con
// el valor anterior y el nuevo, y la ficha del portal (vista leída por `ps_portal`) muestra el nuevo.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { envolverClave } from "@ps/dominio/auditoria/cadena";
import { esTipoCatalogo, ETIQUETA_TIPO, TIPOS_CATALOGO } from "@ps/dominio/catalogo/tipos";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import { darModalidadDePrueba } from "../pruebas/modalidad-prueba";
import { leerCambios, verificarCadena } from "./auditoria";
import {
  cambiarActivo,
  crearValor,
  dependientes,
  editarValor,
  fusionarValores,
  impactoTextoCliente,
  listarCatalogo,
  valoresActivos,
} from "./catalogos-panel";
import { RechazoInventario } from "./unidad-inventario";

const claves = { hmac: randomBytes(32).toString("hex"), kek: randomBytes(32).toString("hex") };
const karen = { usuarioId: "00000000-0000-0000-0000-000000000001", correo: "karen@trycore.com" };
const ANTECEDENTES = "Antecedentes judiciales, disciplinarios y fiscales";

async function rechazo(p: Promise<unknown>): Promise<RechazoInventario> {
  try {
    await p;
  } catch (e) {
    if (e instanceof RechazoInventario) return e;
    throw e;
  }
  throw new Error("se esperaba un rechazo");
}

describe("tipo de catálogo alcance_saro (dominio)", () => {
  it("es un tipo de catálogo con su pestaña", () => {
    expect(TIPOS_CATALOGO).toContain("alcance_saro");
    expect(esTipoCatalogo("alcance_saro")).toBe(true);
    expect(ETIQUETA_TIPO.alcance_saro.pestana).toBe("Alcances SARO");
  });
});

describe.skipIf(!HAY_BD)("catálogo de alcances SARO (HU-177)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let portal: pg.Pool;
  let n = 0;

  const publicadoCon = async (alcance: string, estado = "publicado") => {
    const i = bd.instalacion;
    const codigo = `PS-${String(9100 + ++n)}`;
    const id = (
      await i.query(
        `INSERT INTO inventario.perfiles (codigo, nombre, primer_apellido) VALUES ($1, 'Ana', 'Ruiz') RETURNING id`,
        [codigo],
      )
    ).rows[0].id as string;
    await i.query(
      `INSERT INTO identidad.claves_titular (titular, clave_envuelta) VALUES ($1, $2)`,
      [codigo, envolverClave(claves.kek, randomBytes(32))],
    );
    await i.query(
      `INSERT INTO inventario.consentimientos (perfil_id, alcance) VALUES ($1, 'nominal')`,
      [id],
    );
    await darModalidadDePrueba(i, id);
    await i.query(
      `UPDATE inventario.perfiles SET saro_alcance_id = $2, estado = $3 WHERE id = $1`,
      [id, alcance, estado],
    );
    return { id, codigo };
  };
  const filasAuditoria = async (entidadId: string) =>
    (
      await bd.instalacion.query(
        `SELECT actor, entidad, campo, origen FROM auditoria.auditoria WHERE entidad_id = $1 ORDER BY seq`,
        [entidadId],
      )
    ).rows;

  beforeAll(async () => {
    bd = await crearBdPrueba();
    panel = bd.como("ps_panel");
    portal = bd.como("ps_portal");
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  describe("crear sin duplicar (HU-177 happy y error; tarea 1.2)", () => {
    it("happy: crea el alcance con su texto de cara al cliente, auditado; queda para elegir en el editor", async () => {
      const r = await crearValor(panel, claves, karen, "alcance_saro", {
        nombre: ANTECEDENTES,
        textoCliente: "Verificamos antecedentes judiciales, disciplinarios y fiscales.",
      });
      expect(r).toMatchObject({ nombre: ANTECEDENTES, advertencia: null });
      expect((await valoresActivos(panel, "alcance_saro")).map((v) => v.nombre)).toContain(
        ANTECEDENTES,
      );
      const lista = await listarCatalogo(panel, "alcance_saro");
      expect(lista.find((v) => v.id === r.id)).toMatchObject({
        textoCliente: "Verificamos antecedentes judiciales, disciplinarios y fiscales.",
        perfiles: 0,
        publicados: 0,
      });
      expect((await filasAuditoria(r.id)).map((f) => f.campo).sort()).toEqual([
        "nombre",
        "texto_cliente",
      ]);
    });

    it("sin texto de cara al cliente → rechazado, nada escrito", async () => {
      const e = await rechazo(
        crearValor(panel, claves, karen, "alcance_saro", { nombre: "Antecedentes laborales" }),
      );
      expect(e.motivo).toBe("texto_cliente_requerido");
      expect((await listarCatalogo(panel, "alcance_saro")).map((v) => v.nombre)).not.toContain(
        "Antecedentes laborales",
      );
    });

    it("texto de más de 280 caracteres → rechazado con su motivo", async () => {
      const e = await rechazo(
        crearValor(panel, claves, karen, "alcance_saro", {
          nombre: "Antecedentes largos",
          textoCliente: "x".repeat(281),
        }),
      );
      expect(e.motivo).toBe("texto_cliente_largo");
    });

    it("error: idéntico salvo mayúsculas → duplicado con la forma registrada", async () => {
      const e = await rechazo(
        crearValor(panel, claves, karen, "alcance_saro", {
          nombre: "antecedentes judiciales, disciplinarios y fiscales",
          textoCliente: "Otro texto",
        }),
      );
      expect(e.motivo).toBe("duplicado");
      expect((e.detalle.existente as { nombre: string }).nombre).toBe(ANTECEDENTES);
    });
  });

  describe("corregir el texto de un alcance en uso (HU-177 edge; tarea 1.3)", () => {
    it("el impacto previo cuenta las 4 fichas publicadas (no los borradores); confirmar audita antes/después y el portal ve el texto nuevo", async () => {
      const alcance = (
        await crearValor(panel, claves, karen, "alcance_saro", {
          nombre: "Antecedentes judiciales y disciplinarios",
          textoCliente: "Texto anterior del alcance.",
        })
      ).id;
      const publicados = [];
      for (let k = 0; k < 4; k++) publicados.push(await publicadoCon(alcance));
      await publicadoCon(alcance, "borrador");

      const impacto = await impactoTextoCliente(panel, "alcance_saro", alcance);
      expect(impacto.publicados.map((p) => p.codigo).sort()).toEqual(
        publicados.map((p) => p.codigo).sort(),
      );
      // Previsualizar no escribe nada.
      const fila = async () =>
        (
          await panel.query(
            `SELECT texto_cliente FROM inventario.catalogo_alcances_saro WHERE id = $1`,
            [alcance],
          )
        ).rows[0].texto_cliente;
      expect(await fila()).toBe("Texto anterior del alcance.");

      await editarValor(panel, claves, karen, "alcance_saro", alcance, {
        nombre: "Antecedentes judiciales y disciplinarios",
        textoCliente: "Texto nuevo del alcance.",
      });
      expect(await fila()).toBe("Texto nuevo del alcance.");
      for (const p of publicados) {
        const f = (
          await portal.query(
            `SELECT saro_texto FROM operacion.ficha_publicable WHERE codigo = $1`,
            [p.codigo],
          )
        ).rows[0];
        expect(f.saro_texto).toBe("Texto nuevo del alcance.");
      }
      const audit = await filasAuditoria(alcance);
      expect(audit.at(-1)).toMatchObject({
        actor: "karen@trycore.com",
        entidad: "catalogo_alcances_saro",
        campo: "texto_cliente",
        origen: "panel",
      });
      const cambios = await leerCambios(bd.instalacion, claves.kek, "catalogo_alcances_saro", alcance);
      expect(cambios.at(-1)).toMatchObject({
        actor: "karen@trycore.com",
        campo: "texto_cliente",
        antes: "Texto anterior del alcance.",
        despues: "Texto nuevo del alcance.",
      });
      expect(cambios.at(-1)!.cuando).toBeTruthy();
      expect(await verificarCadena(bd.instalacion, claves.hmac)).toMatchObject({ ok: true });
    });

    it("el impacto de la modalidad de prueba (gemela: también un texto de cara al cliente en fichas) se calcula igual", async () => {
      const r = await panel.query(
        `SELECT modalidad_prueba_id AS id FROM inventario.perfiles WHERE estado = 'publicado' LIMIT 1`,
      );
      const impacto = await impactoTextoCliente(panel, "modalidad_prueba", r.rows[0].id);
      expect(impacto.publicados.length).toBeGreaterThan(0);
    });

    it("un catálogo sin texto de cara al cliente no tiene impacto de texto", async () => {
      const t = (await crearValor(panel, claves, karen, "sector", { nombre: "Agro" })).id;
      const e = await rechazo(impactoTextoCliente(panel, "sector", t));
      expect(e.motivo).toBe("no_aplica");
    });
  });

  describe("retirar un alcance en uso (HU-177 edge; tarea 1.8)", () => {
    it("desactivar: deja de ofrecerse, los 2 perfiles lo conservan y sus fichas lo siguen mostrando; no hay borrado", async () => {
      const alcance = (
        await crearValor(panel, claves, karen, "alcance_saro", {
          nombre: "Antecedentes judiciales",
          textoCliente: "Verificamos antecedentes judiciales.",
          // Se parece a «Antecedentes judiciales y disciplinarios»: es otro alcance (HU-089 parecidos).
          confirmarDistinto: true,
        })
      ).id;
      const a = await publicadoCon(alcance);
      const b = await publicadoCon(alcance);
      const dep = await dependientes(panel, "alcance_saro", alcance);
      expect(dep!.publicados.map((p) => p.codigo).sort()).toEqual([a.codigo, b.codigo].sort());
      const r = await cambiarActivo(panel, claves, karen, "alcance_saro", alcance, false);
      expect(r).toMatchObject({ activo: false, dependientes: 2 });
      expect((await valoresActivos(panel, "alcance_saro")).map((v) => v.id)).not.toContain(alcance);
      for (const p of [a, b]) {
        const perfil = (
          await panel.query(`SELECT saro_alcance_id FROM inventario.perfiles WHERE id = $1`, [p.id])
        ).rows[0];
        expect(perfil.saro_alcance_id).toBe(alcance);
        const f = (
          await portal.query(
            `SELECT saro_texto FROM operacion.ficha_publicable WHERE codigo = $1`,
            [p.codigo],
          )
        ).rows[0];
        expect(f.saro_texto).toBe("Verificamos antecedentes judiciales.");
      }
      const borrar = await panel
        .query(`DELETE FROM inventario.catalogo_alcances_saro WHERE id = $1`, [alcance])
        .catch((e: { code?: string }) => e.code);
      expect(borrar).toBe("42501");
    });
  });

  describe("fusionar alcances (HU-143 reutilizada)", () => {
    it("reasigna los perfiles del origen, lo retira y audita cada perfil con origen «fusion»", async () => {
      const origen = (
        await crearValor(panel, claves, karen, "alcance_saro", {
          nombre: "Antecedentes fiscales",
          textoCliente: "Verificamos antecedentes fiscales.",
          confirmarDistinto: true,
        })
      ).id;
      const destino = (
        await crearValor(panel, claves, karen, "alcance_saro", {
          nombre: "Antecedentes fiscales y contables",
          textoCliente: "Verificamos antecedentes fiscales y contables.",
          confirmarDistinto: true,
        })
      ).id;
      const p = await publicadoCon(origen);
      const r = await fusionarValores(panel, claves, karen, "alcance_saro", origen, destino);
      expect(r).toEqual({ reasignados: 1, destino: "Antecedentes fiscales y contables" });
      expect(
        (await panel.query(`SELECT saro_alcance_id FROM inventario.perfiles WHERE id = $1`, [p.id]))
          .rows[0].saro_alcance_id,
      ).toBe(destino);
      expect((await filasAuditoria(p.id)).at(-1)).toMatchObject({
        campo: "saro_alcance",
        origen: "fusion",
      });
    });
  });
});
