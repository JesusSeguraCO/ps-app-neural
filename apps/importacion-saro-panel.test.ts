// SARO y DISC por importación masiva (EP-003 · sub-slice 3: HU-191; D81) contra el servidor standalone
// real del panel (`ps_panel`) y el despacho real del worker (`ps_worker`): la exportación y la plantilla
// traen las tres columnas (el alcance como está en el catálogo; el de la plantilla, uno activo); pegarlas
// sin tocar da «sin cambios» y la fila de ejemplo no da error en esas columnas; una hoja completa tres
// publicados incompletos sin cambiarles el estado (dejan de marcarse, el portal ve SARO y DISC, historial
// por importación con quien confirmó); los valores fuera de regla y `[vaciar]` en un publicado van al
// grupo con error. Lo que ve el cliente se lee como `ps_portal`.
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { DobleCorreo } from "@ps/infra/mailgun/index";
import { leerCambios } from "@ps/infra/postgres/auditoria";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { vuelta, type ContextoDespacho } from "./worker/src/despacho";
import { sembrarFicticios, sembrarHeredadosIncompletos } from "./worker/src/sembrar-ficticios";

const ANTECEDENTES = "Antecedentes judiciales, disciplinarios y fiscales";
const ENC = {
  alcance: "Alcance de la verificación SARO (del catálogo)",
  saro: "Fecha de la verificación SARO (AAAA-MM-DD o DD/MM/AAAA)",
  disc: "Fecha de la evaluación DISC (AAAA-MM-DD o DD/MM/AAAA)",
};
const diaBogota = (dias: number) =>
  new Date(Date.now() - 5 * 3_600_000 + dias * 86_400_000).toISOString().slice(0, 10);

type FilaPlan = {
  codigo: string | null;
  grupo: string;
  errores: Array<{ campo: string | null; mensaje: string }>;
  cambios: Array<{ campo: string; antes: unknown; despues: unknown }>;
};

describe.skipIf(!HAY_BD || !hayBuild("panel"))("SARO y DISC por importación (HU-191)", () => {
  let bd: BdPrueba;
  let panel: ServidorPrueba;
  let portal: pg.Pool;
  let ctx: ContextoDespacho;
  let admin: string;
  let kek: string;
  const csrf = randomBytes(16).toString("hex");

  const sesion = async (correo: string, rol: "administrador" | "observador") => {
    const u = await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ($1, $2, $3) RETURNING id`,
      [correo, randomBytes(32), rol],
    );
    const id = randomBytes(32).toString("base64url");
    await bd.instalacion.query(
      `INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, expira) VALUES ($1, $2, now() + interval '12 hours')`,
      [createHash("sha256").update(id).digest(), u.rows[0].id],
    );
    return `__Host-pp=${id}`;
  };
  const enviar = (ruta: string, cuerpo: unknown) =>
    panel.pedir(ruta, {
      method: "POST",
      body: JSON.stringify(cuerpo),
      headers: {
        "content-type": "application/json",
        origin: panel.url,
        "x-ps-csrf": csrf,
        cookie: `__Host-csrf=${csrf}; ${admin}`,
      },
    });
  const leer = (ruta: string) => panel.pedir(ruta, { headers: { cookie: admin } });
  // Pegar: el emparejamiento que propone el panel, tal cual, y la vista previa del lote.
  const pegar = async (texto: string) => {
    const e = await (await enviar("/api/v1/importacion/emparejar", { texto })).json();
    const columnas = (
      e.emparejamiento as Array<{ columna: string; destino: { tipo: string; clave?: string } }>
    ).map((c) => ({
      columna: c.columna,
      clave: c.destino.tipo === "campo" ? c.destino.clave! : null,
    }));
    const r = await enviar("/api/v1/importacion/lotes", {
      texto,
      formato: e.formato,
      modo: "crear_y_actualizar",
      columnas,
    });
    expect(r.status).toBe(201);
    return (await r.json()) as {
      loteId: string;
      plan: { filas: FilaPlan[]; valoresNuevos: unknown[] };
    };
  };
  const tsv = (filas: string[][]) => filas.map((f) => f.join("\t")).join("\n");
  const marcas = async () =>
    Object.fromEntries(
      (
        (await (await leer("/api/v1/perfiles")).json()).perfiles as Array<{
          codigo: string;
          incompleto: string | null;
          estado: string;
        }>
      )
        .filter((f) => f.incompleto)
        .map((f) => [f.codigo, f.incompleto]),
    );

  beforeAll(async () => {
    bd = await crearBdPrueba();
    portal = bd.como("ps_portal");
    const entorno = { ...entornoDev("panel"), APP_ENV: "ci", DATABASE_URL: bd.urlDe("ps_panel") };
    const auditoria = { hmac: entorno.AUDIT_HMAC_KEY!, kek: entorno.AUDIT_KEK! };
    kek = auditoria.kek;
    await sembrarFicticios({
      bd: bd.como("ps_panel"),
      auditoria,
      appEnv: "ci",
      registrar: () => {},
    });
    await sembrarHeredadosIncompletos({
      bd: bd.como("ps_panel"),
      auditoria,
      appEnv: "ci",
      registrar: () => {},
    });
    // Tres publicados sin la verificación SARO (HU-191 Dado): al de solo DISC también se le quita.
    await bd.instalacion.query(
      `UPDATE inventario.perfiles SET saro_alcance_id = NULL, saro_fecha = NULL WHERE codigo = 'PS-0118'`,
    );
    admin = await sesion("karen@trycore.com", "administrador");
    panel = await arrancarServidor("panel", entorno);
    ctx = {
      bd: bd.como("ps_worker"),
      correo: new DobleCorreo(),
      peppers: { cliente: "c".repeat(40), panel: "p".repeat(40) },
      reclamo: "prueba",
      registrar: () => {},
      importacion: { auditoria },
    };
  }, 120_000);

  afterAll(async () => {
    await panel?.cerrar();
    await bd?.cerrar();
  });

  it("happy: la exportación trae las tres columnas con el alcance como está en el catálogo, y vuelve «sin cambios»", async () => {
    const r = await leer("/api/v1/importacion/exportar?formato=csv");
    expect(r.status).toBe(200);
    const csv = await r.text();
    const [cabeza, ...lineas] = csv.replace(/^﻿/, "").split("\r\n");
    for (const e of Object.values(ENC)) expect(cabeza).toContain(e);
    const laura = lineas.find((l) => l.startsWith("PS-0142,"))!;
    expect(laura).toContain(`"${ANTECEDENTES}",2026-03-15,2026-04-10`);
    const json = await (await leer("/api/v1/importacion/exportar?formato=json")).json();
    expect(json.find((p: { codigo: string }) => p.codigo === "PS-0142")).toMatchObject({
      saroAlcance: ANTECEDENTES,
      saroFecha: "2026-03-15",
      discFecha: "2026-04-10",
    });
    const { plan } = await pegar(csv);
    expect(plan.filas.find((f) => f.codigo === "PS-0142")!.grupo).toBe("sin_cambios");
    expect(plan.filas.filter((f) => f.grupo !== "sin_cambios")).toEqual([]);
  });

  it("happy: la plantilla trae las tres columnas con un alcance activo; su fila de ejemplo no da error en ellas", async () => {
    const r = await leer("/api/v1/importacion/plantilla?formato=csv");
    expect(r.status).toBe(200);
    const csv = await r.text();
    for (const e of Object.values(ENC)) expect(csv).toContain(e);
    expect(csv).toContain(`"${ANTECEDENTES}",2026-03-15,2026-04-10`);
    const { plan } = await pegar(csv);
    const ejemplo = plan.filas.find((f) => f.codigo === "PS-0900")!;
    expect(
      ejemplo.errores.filter((e) =>
        ["saroAlcance", "saroFecha", "discFecha"].includes(e.campo ?? ""),
      ),
    ).toEqual([]);
  });

  it("happy: una hoja completa tres publicados incompletos; siguen publicados, dejan de marcarse, el portal ve SARO y DISC, historial por importación", async () => {
    const codigos = ["PS-0105", "PS-0112", "PS-0118"];
    const antes = await marcas();
    for (const c of codigos) expect(antes[c]).toMatch(/^Incompleto: falta la verificación SARO/);
    const { loteId, plan } = await pegar(
      tsv([
        ["Código", ENC.alcance, ENC.saro, ENC.disc],
        ...codigos.map((c) => [c, ANTECEDENTES, "2026-03-15", "2026-04-10"]),
      ]),
    );
    expect(plan.filas.map((f) => f.grupo)).toEqual(["actualizado", "actualizado", "actualizado"]);
    expect((await enviar(`/api/v1/importacion/lotes/${loteId}/aplicar`, {})).status).toBe(202);
    await vuelta(ctx);
    const despues = await marcas();
    for (const c of codigos) expect(despues[c], c).toBeUndefined();
    const filas = (
      await portal.query(
        `SELECT codigo, saro_texto, saro_fecha::text AS saro, disc_fecha::text AS disc
           FROM operacion.ficha_publicable WHERE codigo = ANY($1) ORDER BY codigo`,
        [codigos],
      )
    ).rows;
    expect(filas).toHaveLength(3);
    for (const f of filas)
      expect(f).toMatchObject({
        saro: "2026-03-15",
        disc: "2026-04-10",
        saro_texto: expect.any(String),
      });
    const estados = await bd.instalacion.query(
      `SELECT id, estado FROM inventario.perfiles WHERE codigo = ANY($1)`,
      [codigos],
    );
    for (const p of estados.rows) {
      expect(p.estado).toBe("publicado");
      const c = (await leerCambios(bd.instalacion, kek, "perfiles", p.id)).filter((x) =>
        ["saro_alcance", "saro_fecha", "disc_fecha"].includes(x.campo),
      );
      expect(c.length).toBeGreaterThan(0);
      for (const x of c)
        expect(x).toMatchObject({ origen: "importacion", actor: "karen@trycore.com" });
    }
  });

  it.each([
    [
      "alcance «Antecedentes penales»",
      [ENC.alcance],
      ["Antecedentes penales"],
      "El alcance SARO no está en el catálogo: «Antecedentes penales»",
    ],
    [
      "fecha SARO 15/11 futura",
      [ENC.saro],
      [`${diaBogota(40).slice(8, 10)}/${diaBogota(40).slice(5, 7)}/${diaBogota(40).slice(0, 4)}`],
      "La fecha de una verificación no puede ser posterior a hoy",
    ],
    [
      "fecha DISC «abril»",
      [ENC.disc],
      ["abril"],
      "La fecha DISC no se reconoce como fecha: «abril»",
    ],
  ])(
    "error: %s → fila con error y su motivo, sin valor nuevo; la otra fila sigue",
    async (_, cols, vals, motivo) => {
      const { plan } = await pegar(
        tsv([
          ["Código", ...cols, "Anclaje de experiencia"],
          ["PS-0201", ...vals, ""],
          ["PS-0215", ...cols.map(() => ""), "Otra fila válida"],
        ]),
      );
      const mala = plan.filas.find((f) => f.codigo === "PS-0201")!;
      expect(mala.grupo).toBe("con_error");
      expect(mala.errores[0]!.mensaje).toContain(motivo);
      expect(plan.valoresNuevos).toEqual([]);
      expect(plan.filas.find((f) => f.codigo === "PS-0215")!.grupo).toBe("actualizado");
    },
  );

  it("edge: `[vaciar]` en la fecha DISC de un publicado → error con el motivo; conserva su fecha y sigue publicado", async () => {
    const { plan } = await pegar(
      tsv([
        ["Código", ENC.disc],
        ["PS-0142", "[vaciar]"],
      ]),
    );
    expect(plan.filas[0]).toMatchObject({
      grupo: "con_error",
      errores: [
        {
          campo: "discFecha",
          mensaje:
            "No se puede vaciar una validación de entrada de un perfil publicado; pásalo a borrador desde el editor",
        },
      ],
    });
    const p = await bd.instalacion.query(
      `SELECT estado, disc_fecha::text AS disc FROM inventario.perfiles WHERE codigo = 'PS-0142'`,
    );
    expect(p.rows[0]).toEqual({ estado: "publicado", disc: "2026-04-10" });
  });
});
