// Migraciones 0020 (expand) y 0021 (contract) del sub-slice 9 (HU-137; RF-8.13.2; diseño §1): con la BD
// en la 0020 quedan perfiles `colocado` de antes; el trabajo `migrar_colocados` del worker los pasa a
// publicado con su colocación (origen `migracion`, auditado) y la 0021 retira el estado. Si quedara algún
// colocado sin migrar, la 0021 no se aplica y lo dice. Después: cuatro estados, sin `fecha_liberacion`, y las
// vistas de estado del enlace derivan «colocado» de la colocación vigente (RF-19.2).
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { envolverClave } from "@ps/dominio/auditoria/cadena";
import { HAY_BD, codigoDeError, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import { MIGRACIONES } from "../../migraciones/indice";
import type { ClavesAuditoria } from "./auditoria";
import { migrarColocados } from "./colocados";
import { migrarHastaElFinal } from "./migrar";

const claves: ClavesAuditoria = {
  hmac: randomBytes(32).toString("base64"),
  kek: randomBytes(32).toString("base64"),
};
const hasta = (n: string) =>
  Object.fromEntries(Object.entries(MIGRACIONES).filter(([k]) => k <= n));

describe.skipIf(!HAY_BD)("migraciones 0020–0021: colocado deja de ser estado", () => {
  let bd: BdPrueba;
  let familia: string;
  let prueba: string;
  const q = (s: string, p: unknown[] = []) => bd.instalacion.query(s, p);
  const perfil = async (
    codigo: string,
    estado: string,
    liberacion: string | null,
    consentido = true,
  ) => {
    const id = (
      await q(
        `INSERT INTO inventario.perfiles (codigo, estado, nombre, primer_apellido, disponibilidad_fecha,
                disponibilidad_actualizada_en, fecha_liberacion, familia_id, modalidad_prueba_id)
         VALUES ($1, 'borrador', 'Ana', 'Ríos', $2, now(), NULL, $3, $4) RETURNING id`,
        [codigo, liberacion ?? "2026-10-01", familia, prueba],
      )
    ).rows[0].id as string;
    await q(`INSERT INTO identidad.claves_titular (titular, clave_envuelta) VALUES ($1, $2)`, [
      codigo,
      envolverClave(claves.kek, randomBytes(32)),
    ]);
    if (consentido)
      await q(`INSERT INTO inventario.consentimientos (perfil_id, alcance) VALUES ($1, 'prueba')`, [
        id,
      ]);
    // Directo con la instalación: así quedaban los colocados antes de la 0021.
    await q(
      `ALTER TABLE inventario.perfiles DISABLE TRIGGER USER;
       UPDATE inventario.perfiles SET estado = '${estado}', fecha_liberacion = ${liberacion ? `'${liberacion}'` : "NULL"} WHERE id = '${id}';
       ALTER TABLE inventario.perfiles ENABLE TRIGGER USER;`,
    );
    return id;
  };

  beforeAll(async () => {
    bd = await crearBdPrueba({ migrar: false });
    await migrarHastaElFinal(bd.urlDe("ps_migrador", { directa: true }), {
      migraciones: hasta("0020_colocaciones"),
    });
    familia = (
      await q(
        `INSERT INTO inventario.catalogo_familias (nombre) VALUES ('Desarrollo') RETURNING id`,
      )
    ).rows[0].id;
    prueba = (
      await q(
        `INSERT INTO inventario.catalogo_modalidades_prueba (familia_id, nombre, texto_cliente)
         VALUES ($1, 'Prueba práctica', 'Prueba práctica revisada') RETURNING id`,
        [familia],
      )
    ).rows[0].id;
  }, 120_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("la 0021 no se aplica si queda algún colocado sin migrar, y lo dice", async () => {
    await perfil("PS-0901", "colocado", "2026-12-15");
    await expect(
      migrarHastaElFinal(bd.urlDe("ps_migrador", { directa: true }), { migraciones: MIGRACIONES }),
    ).rejects.toThrow(/colocado.*migrar_colocados/s);
  });

  it("migrar_colocados: publicado + colocación vigente, disponibilidad = liberación, auditado como migración", async () => {
    await perfil("PS-0902", "colocado", "2026-08-01"); // ya terminó: colocación cerrada
    await perfil("PS-0903", "colocado", "2027-01-20", false); // sin consentimiento: no puede publicarse
    const r = await migrarColocados(bd.como("ps_worker"), claves, new Date("2026-10-01T15:00:00Z"));
    expect(r).toEqual({ migrados: 3, aBorrador: 1 });
    const filas = (
      await q(
        `SELECT p.codigo, p.estado, p.disponibilidad_fecha::text AS disp, c.cuenta, c.inicio, c.liberacion::text AS lib,
                c.fuente, c.vigente
           FROM inventario.perfiles p LEFT JOIN inventario.colocaciones c ON c.perfil_id = p.id
          WHERE p.codigo IN ('PS-0901', 'PS-0902', 'PS-0903') ORDER BY p.codigo`,
      )
    ).rows;
    expect(filas).toEqual([
      {
        codigo: "PS-0901",
        estado: "publicado",
        disp: "2026-12-15",
        cuenta: "Sin registrar",
        inicio: null,
        lib: "2026-12-15",
        fuente: "migracion",
        vigente: true,
      },
      {
        codigo: "PS-0902",
        estado: "publicado",
        disp: "2026-08-01",
        cuenta: "Sin registrar",
        inicio: null,
        lib: "2026-08-01",
        fuente: "migracion",
        vigente: false,
      },
      {
        codigo: "PS-0903",
        estado: "borrador",
        disp: "2027-01-20",
        cuenta: "Sin registrar",
        inicio: null,
        lib: "2027-01-20",
        fuente: "migracion",
        vigente: true,
      },
    ]);
    const audit = (
      await q(
        `SELECT titular, campo, origen FROM auditoria.auditoria WHERE titular LIKE 'PS-09%' ORDER BY seq`,
      )
    ).rows;
    expect(new Set(audit.map((a) => a.origen))).toEqual(new Set(["migracion"]));
    expect(audit.filter((a) => a.titular === "PS-0901").map((a) => a.campo)).toEqual([
      "colocacion",
      "estado",
    ]);
    // Idempotente: una segunda vuelta no encuentra nada.
    expect(await migrarColocados(bd.como("ps_worker"), claves)).toEqual({
      migrados: 0,
      aBorrador: 0,
    });
  });

  it("la 0021 retira el estado y la columna; las vistas derivan «colocado» de la colocación vigente", async () => {
    await migrarHastaElFinal(bd.urlDe("ps_migrador", { directa: true }), {
      migraciones: MIGRACIONES,
    });
    expect(
      await codigoDeError(
        q(`UPDATE inventario.perfiles SET estado = 'colocado' WHERE codigo = 'PS-0901'`),
      ),
    ).toBe("23514");
    expect(
      (
        await q(
          `SELECT count(*)::int AS n FROM information_schema.columns
            WHERE table_schema = 'inventario' AND table_name = 'perfiles' AND column_name = 'fecha_liberacion'`,
        )
      ).rows[0].n,
    ).toBe(0);
    const portal = bd.como("ps_portal");
    const enlace = (
      await portal.query(
        `SELECT codigo, estado, libera_en::text AS libera_en FROM operacion.estado_enlace_perfil
          WHERE codigo IN ('PS-0901', 'PS-0902') ORDER BY codigo`,
      )
    ).rows;
    expect(enlace).toEqual([
      { codigo: "PS-0901", estado: "colocado", libera_en: "2026-12-15" },
      { codigo: "PS-0902", estado: "disponible", libera_en: null },
    ]);
    const seleccion = (
      await portal.query(
        `SELECT codigo, estado, libera_en::text AS libera_en, nombre FROM operacion.estado_seleccion_perfil
          WHERE codigo IN ('PS-0901', 'PS-0902', 'PS-0903') ORDER BY codigo`,
      )
    ).rows;
    expect(seleccion).toEqual([
      { codigo: "PS-0901", estado: "colocado", libera_en: "2026-12-15", nombre: "Ana" },
      { codigo: "PS-0902", estado: "disponible", libera_en: null, nombre: null },
      { codigo: "PS-0903", estado: "no_publicado", libera_en: null, nombre: null },
    ]);
    // El colocado sigue publicado: el catálogo lo muestra con su banda (HU-137 edge).
    expect(
      (
        await portal.query(
          `SELECT codigo FROM operacion.catalogo_publicable WHERE codigo = 'PS-0901'`,
        )
      ).rows,
    ).toHaveLength(1);
  });
});
