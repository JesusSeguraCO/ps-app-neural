// Migración 0019 (EP-006 · sub-slice 7; HU-133, HU-136): la fecha de pausa la mantiene la BD —entra
// con la hora, se conserva mientras siga pausado, respeta la que trae la reversión, se pone a un
// pausado antiguo que no la tenía y se limpia al salir—; un pausado nuevo exige motivo; los motivos se
// fusionan como cualquier catálogo; la foto previa de la importación admite `pausado_en`.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { HAY_BD, codigoDeError, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";

const VIOLACION_CHECK = "23514";

describe.skipIf(!HAY_BD)("migración 0019: pausa y vigencia", () => {
  let bd: BdPrueba;
  let motivo: string;
  let otro: string;
  const q = (s: string, p: unknown[] = []) => bd.instalacion.query(s, p);
  const fila = async (codigo: string) =>
    (
      await q(
        `SELECT estado, pausado_en, motivo_pausa_id FROM inventario.perfiles WHERE codigo = $1`,
        [codigo],
      )
    ).rows[0];
  const perfil = async (codigo: string) =>
    q(
      `INSERT INTO inventario.perfiles (codigo, estado, nombre, primer_apellido) VALUES ($1, 'borrador', 'Ana', 'Ríos')`,
      [codigo],
    );

  beforeAll(async () => {
    bd = await crearBdPrueba();
    motivo = (
      await q(
        `INSERT INTO inventario.catalogo_motivos_pausa (nombre, descripcion) VALUES ('Licencia', 'Sin fecha de regreso.') RETURNING id`,
      )
    ).rows[0].id;
    otro = (
      await q(
        `INSERT INTO inventario.catalogo_motivos_pausa (nombre) VALUES ('Licencia temporal') RETURNING id`,
      )
    ).rows[0].id;
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("pausar exige motivo; al entrar se pone la hora y se conserva mientras siga pausado", async () => {
    await perfil("PS-0701");
    expect(
      await codigoDeError(
        q(`UPDATE inventario.perfiles SET estado = 'pausado' WHERE codigo = 'PS-0701'`),
      ),
    ).toBe(VIOLACION_CHECK);
    await q(
      `UPDATE inventario.perfiles SET estado = 'pausado', motivo_pausa_id = $1 WHERE codigo = 'PS-0701'`,
      [motivo],
    );
    const a = await fila("PS-0701");
    expect(a.pausado_en).toBeInstanceOf(Date);
    await q(`UPDATE inventario.perfiles SET motivo_pausa_id = $1 WHERE codigo = 'PS-0701'`, [otro]);
    expect((await fila("PS-0701")).pausado_en).toEqual(a.pausado_en);
  });

  it("al salir de la pausa se limpian la fecha y el motivo; la reversión puede traer su fecha", async () => {
    await perfil("PS-0702");
    await q(
      `UPDATE inventario.perfiles SET estado = 'pausado', motivo_pausa_id = $1 WHERE codigo = 'PS-0702'`,
      [motivo],
    );
    await q(`UPDATE inventario.perfiles SET estado = 'borrador' WHERE codigo = 'PS-0702'`);
    expect(await fila("PS-0702")).toMatchObject({ pausado_en: null, motivo_pausa_id: null });
    const antes = new Date("2026-08-01T15:00:00Z");
    await q(
      `UPDATE inventario.perfiles SET estado = 'pausado', motivo_pausa_id = $1, pausado_en = $2 WHERE codigo = 'PS-0702'`,
      [motivo, antes],
    );
    expect((await fila("PS-0702")).pausado_en).toEqual(antes);
  });

  it("los motivos de pausa se fusionan reasignando los perfiles", async () => {
    await perfil("PS-0703");
    await q(
      `UPDATE inventario.perfiles SET estado = 'pausado', motivo_pausa_id = $1 WHERE codigo = 'PS-0703'`,
      [otro],
    );
    const r = await q(`SELECT perfil_id FROM inventario.fusionar_valor('motivo_pausa', $1, $2)`, [
      otro,
      motivo,
    ]);
    expect(r.rowCount).toBeGreaterThanOrEqual(1);
    expect((await fila("PS-0703")).motivo_pausa_id).toBe(motivo);
    expect(
      (
        await q(
          `SELECT activo, fusionado_en_id FROM inventario.catalogo_motivos_pausa WHERE id = $1`,
          [otro],
        )
      ).rows[0],
    ).toEqual({
      activo: false,
      fusionado_en_id: motivo,
    });
  });

  it("la foto previa de la importación admite pausado_en", async () => {
    expect(
      (
        await q(
          `SELECT inventario.solo_claves_de_estado_previo('{"pausado_en": null, "estado": "pausado"}') AS ok`,
        )
      ).rows[0].ok,
    ).toBe(true);
    expect(
      (await q(`SELECT inventario.solo_claves_de_estado_previo('{"foto": "x"}') AS ok`)).rows[0].ok,
    ).toBe(false);
  });
});
