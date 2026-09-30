// Catálogos del panel contra PostgreSQL real con `ps_panel` (HU-089, HU-143; tareas 1.2–1.5):
// cada escritura deja su fila de auditoría con actor y sube `inventario_version`; la cadena sigue
// íntegra con escritores concurrentes (V3-1); fusionar reasigna tantos perfiles como anunció la vista
// de impacto.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { envolverClave } from "@ps/dominio/auditoria/cadena";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import { verificarCadena } from "./auditoria";
import {
  cambiarActivo,
  crearValor,
  dependientes,
  editarValor,
  fusionarValores,
  impactoFusion,
  listarCatalogo,
  revisarNombre,
} from "./catalogos-panel";
import { RechazoInventario } from "./unidad-inventario";

const claves = { hmac: randomBytes(32).toString("hex"), kek: randomBytes(32).toString("hex") };
const karen = { usuarioId: "00000000-0000-0000-0000-000000000001", correo: "karen@trycore.com" };

async function rechazo(p: Promise<unknown>): Promise<RechazoInventario> {
  try {
    await p;
  } catch (e) {
    if (e instanceof RechazoInventario) return e;
    throw e;
  }
  throw new Error("se esperaba un rechazo");
}

describe.skipIf(!HAY_BD)("catálogos del panel (HU-089, HU-143)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let conModalidades: string;
  let sinModalidades: string;

  const version = async () =>
    Number(
      (await panel.query(`SELECT version FROM inventario.inventario_version`)).rows[0].version,
    );
  const filasAuditoria = async (entidadId: string) =>
    (
      await bd.instalacion.query(
        `SELECT actor, entidad, campo, origen FROM auditoria.auditoria WHERE entidad_id = $1 ORDER BY seq`,
        [entidadId],
      )
    ).rows;

  const perfilCon = async (codigo: string, estado: string, tecnologia: string) => {
    const i = bd.instalacion;
    const id = (
      await i.query(
        `INSERT INTO inventario.perfiles (codigo, nombre, primer_apellido) VALUES ($1, 'Ana', 'Ruiz') RETURNING id`,
        [codigo],
      )
    ).rows[0].id;
    await i.query(
      `INSERT INTO inventario.perfil_tecnologias (perfil_id, valor_id, orden) VALUES ($1, $2, 1)`,
      [id, tecnologia],
    );
    if (estado !== "borrador") {
      await i.query(
        `INSERT INTO inventario.consentimientos (perfil_id, alcance) VALUES ($1, 'nominal')`,
        [id],
      );
      await i.query(`UPDATE inventario.perfiles SET estado = $2 WHERE id = $1`, [id, estado]);
    }
    await i.query(
      `INSERT INTO identidad.claves_titular (titular, clave_envuelta) VALUES ($1, $2)`,
      [codigo, envolverClave(claves.kek, randomBytes(32))],
    );
    return id as string;
  };

  beforeAll(async () => {
    bd = await crearBdPrueba();
    panel = bd.como("ps_panel");
    const i = bd.instalacion;
    conModalidades = (
      await i.query(
        `INSERT INTO inventario.catalogo_familias (nombre) VALUES ('Diseño de producto') RETURNING id`,
      )
    ).rows[0].id;
    sinModalidades = (
      await i.query(
        `INSERT INTO inventario.catalogo_familias (nombre) VALUES ('Seguridad de la información') RETURNING id`,
      )
    ).rows[0].id;
    await i.query(
      `INSERT INTO inventario.catalogo_modalidades_prueba (familia_id, nombre, texto_cliente) VALUES ($1, 'Reto de diseño', 'Resuelve un caso real')`,
      [conModalidades],
    );
    await i.query(
      `INSERT INTO inventario.catalogo_tecnologias (nombre, grupo) VALUES ('Figma', 'Diseño de producto')`,
    );
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  describe("crear sin duplicar (HU-089)", () => {
    it("happy: rol nuevo en familia con modalidades → creado, sin advertencia, auditado y versión +1", async () => {
      const v0 = await version();
      const r = await crearValor(panel, claves, karen, "rol", {
        nombre: "Diseñador UX/UI Banking",
        familiaId: conModalidades,
      });
      expect(r).toMatchObject({
        nombre: "Diseñador UX/UI Banking",
        advertencia: null,
        familia: "Diseño de producto",
      });
      expect(await version()).toBe(v0 + 1);
      const filas = await filasAuditoria(r.id);
      expect(filas).toEqual([
        { actor: "karen@trycore.com", entidad: "catalogo_roles", campo: "nombre", origen: "panel" },
        {
          actor: "karen@trycore.com",
          entidad: "catalogo_roles",
          campo: "familia_id",
          origen: "panel",
        },
      ]);
      const roles = await listarCatalogo(panel, "rol");
      expect(roles.find((x) => x.id === r.id)?.grupo).toBe("Diseño de producto");
    });

    it("la familia es obligatoria para un rol", async () => {
      expect(
        (await rechazo(crearValor(panel, claves, karen, "rol", { nombre: "Rol huérfano" }))).motivo,
      ).toBe("familia_requerida");
    });

    it("edge: familia sin modalidades → el rol queda creado con la advertencia", async () => {
      const r = await crearValor(panel, claves, karen, "rol", {
        nombre: "Especialista en seguridad de aplicaciones",
        familiaId: sinModalidades,
      });
      expect(r.advertencia).toBe("familia_sin_modalidades");
      expect((await listarCatalogo(panel, "rol")).some((x) => x.id === r.id)).toBe(true);
    });

    it("error: «figma» se impide y nombra a «Figma», sin escribir ni subir versión", async () => {
      const v0 = await version();
      const e = await rechazo(crearValor(panel, claves, karen, "tecnologia", { nombre: "figma" }));
      expect(e.motivo).toBe("duplicado");
      expect((e.detalle.existente as { nombre: string }).nombre).toBe("Figma");
      expect(await version()).toBe(v0);
    });

    it("error: «Fgima» se parece a «Figma»; crearla exige confirmar que es distinta", async () => {
      const e = await rechazo(crearValor(panel, claves, karen, "tecnologia", { nombre: "Fgima" }));
      expect(e.motivo).toBe("parecido");
      expect((e.detalle.parecidos as Array<{ nombre: string }>).map((p) => p.nombre)).toEqual([
        "Figma",
      ]);
      const r = await crearValor(panel, claves, karen, "tecnologia", {
        nombre: "Fgima",
        grupo: "Diseño de producto",
        confirmarDistinto: true,
      });
      expect((await filasAuditoria(r.id)).map((f) => f.campo)).toContain("confirmado_distinto");
    });

    it("revisarNombre informa mientras se escribe sin escribir nada", async () => {
      expect((await revisarNombre(panel, "tecnologia", "FIGMA")).tipo).toBe("identico");
      expect((await revisarNombre(panel, "tecnologia", "Sketch")).tipo).toBe("nuevo");
    });

    it("RF-8.16.8: una modalidad de prueba exige su texto de cara al cliente y su familia", async () => {
      expect(
        (
          await rechazo(
            crearValor(panel, claves, karen, "modalidad_prueba", {
              nombre: "Reto",
              familiaId: conModalidades,
            }),
          )
        ).motivo,
      ).toBe("texto_cliente_requerido");
      const m = await crearValor(panel, claves, karen, "modalidad_prueba", {
        nombre: "Prueba de accesibilidad",
        familiaId: conModalidades,
        textoCliente: "Audita una pantalla con WCAG 2.2 y entrega el informe",
        criterios: "Cobertura de criterios A y AA",
      });
      const lista = await listarCatalogo(panel, "modalidad_prueba");
      expect(lista.find((x) => x.id === m.id)).toMatchObject({
        textoCliente: "Audita una pantalla con WCAG 2.2 y entrega el informe",
        criterios: "Cobertura de criterios A y AA",
        grupo: "Diseño de producto",
      });
    });

    it("editar renombra sin chocar consigo mismo y audita antes/después", async () => {
      const r = await crearValor(panel, claves, karen, "sector", { nombre: "Seguros" });
      await editarValor(panel, claves, karen, "sector", r.id, { nombre: "Seguros y reaseguros" });
      const filas = await filasAuditoria(r.id);
      expect(filas.at(-1)).toMatchObject({ campo: "nombre" });
      // Cambiar solo mayúsculas del propio nombre no choca consigo mismo.
      await editarValor(panel, claves, karen, "sector", r.id, { nombre: "SEGUROS Y REASEGUROS " });
    });
  });

  describe("desactivar y fusionar (HU-143)", () => {
    let figma: string;
    let fgima: string;

    beforeAll(async () => {
      const t = await listarCatalogo(panel, "tecnologia");
      figma = t.find((x) => x.nombre === "Figma")!.id;
      fgima = t.find((x) => x.nombre === "Fgima")!.id;
      await perfilCon("PS-0101", "publicado", figma);
      await perfilCon("PS-0102", "publicado", fgima);
      await perfilCon("PS-0103", "borrador", fgima);
      await perfilCon("PS-0104", "publicado", fgima);
    });

    it("desactivar informa cuántas fichas dependen, no se ofrece para elegir y las fichas lo conservan", async () => {
      const dep = await dependientes(panel, "tecnologia", fgima);
      expect(dep).toMatchObject({ nombre: "Fgima", borradores: 1 });
      expect(dep!.publicados.map((p) => p.codigo)).toEqual(["PS-0102", "PS-0104"]);
      const r = await cambiarActivo(panel, claves, karen, "tecnologia", fgima, false);
      expect(r).toEqual({ id: fgima, activo: false, dependientes: 3 });
      const vista = await panel.query(
        `SELECT nombre FROM operacion.valores_busqueda WHERE tipo = 'tecnologia' ORDER BY nombre`,
      );
      expect(vista.rows.map((x) => x.nombre)).not.toContain("Fgima");
      const conservan = await panel.query(
        `SELECT count(*)::int n FROM inventario.perfil_tecnologias WHERE valor_id = $1`,
        [fgima],
      );
      expect(conservan.rows[0].n).toBe(3);
      await cambiarActivo(panel, claves, karen, "tecnologia", fgima, true);
    });

    it("la vista de impacto no escribe nada y cuenta los perfiles que pasarán", async () => {
      const v0 = await version();
      const imp = await impactoFusion(panel, "tecnologia", fgima, figma);
      expect(imp.origen).toMatchObject({ nombre: "Fgima", perfiles: 3 });
      expect(imp.destino).toMatchObject({ nombre: "Figma", perfiles: 1 });
      expect(imp.perfiles.map((p) => p.codigo)).toEqual(["PS-0102", "PS-0104", "PS-0103"]);
      expect(await version()).toBe(v0);
      expect((await listarCatalogo(panel, "tecnologia")).find((x) => x.id === fgima)?.activo).toBe(
        true,
      );
    });

    it("error: mismo valor o catálogos distintos → rechazo con motivo, nada cambia", async () => {
      expect((await rechazo(impactoFusion(panel, "tecnologia", fgima, fgima))).motivo).toBe(
        "mismo_valor",
      );
      const sector = (await listarCatalogo(panel, "sector"))[0]!.id;
      expect(
        (await rechazo(fusionarValores(panel, claves, karen, "tecnologia", fgima, sector))).motivo,
      ).toBe("distinto_catalogo");
      expect((await listarCatalogo(panel, "tecnologia")).find((x) => x.id === fgima)?.activo).toBe(
        true,
      );
    });

    it("confirmar: los 3 perfiles pasan a Figma, Fgima sale del catálogo, auditoría con origen fusion", async () => {
      const antes = await impactoFusion(panel, "tecnologia", fgima, figma);
      const r = await fusionarValores(panel, claves, karen, "tecnologia", fgima, figma);
      expect(r.reasignados).toBe(antes.perfiles.length);
      const uso = await panel.query(
        `SELECT count(*)::int n FROM inventario.perfil_tecnologias WHERE valor_id = $1`,
        [figma],
      );
      expect(uso.rows[0].n).toBe(4);
      const t = await listarCatalogo(panel, "tecnologia");
      expect(t.find((x) => x.id === fgima)).toMatchObject({ activo: false, fusionadoEn: figma });
      const fusion = await bd.instalacion.query(
        `SELECT campo, titular FROM auditoria.auditoria WHERE origen = 'fusion' AND entidad = 'perfiles' ORDER BY titular`,
      );
      expect(fusion.rows).toEqual([
        { campo: "tecnologias", titular: "PS-0102" },
        { campo: "tecnologias", titular: "PS-0103" },
        { campo: "tecnologias", titular: "PS-0104" },
      ]);
    });
  });

  it("V3-1: escritores concurrentes dejan la cadena íntegra y una versión por escritura", async () => {
    const v0 = await version();
    const nombres = Array.from(
      { length: 12 },
      (_, k) => `Tecnología concurrente ${String.fromCharCode(65 + k)}${k}`,
    );
    await Promise.all(
      nombres.map((nombre) =>
        crearValor(panel, claves, karen, "tecnologia", { nombre, confirmarDistinto: true }),
      ),
    );
    expect(await version()).toBe(v0 + nombres.length);
    expect(await verificarCadena(bd.instalacion, claves.hmac)).toMatchObject({ ok: true });
  });
});
