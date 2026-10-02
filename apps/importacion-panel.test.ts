// Contrato HTTP del asistente de importación (EP-006 · sub-slice 3: HU-088, HU-086, HU-148) contra el
// servidor standalone real del panel (`ps_panel`, por PgBouncer) con los perfiles ficticios. Nada de
// esto escribe en el banco: se comprueba que `perfiles` y la versión global quedan intactos.
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CAMPOS_IMPORTACION, leer } from "@ps/contratos/importacion";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { sembrarFicticios } from "./worker/src/sembrar-ficticios";
import { sembrarLexicoFicticio } from "./worker/src/sembrar-lexico";

type Fila = {
  numero: number;
  codigo: string | null;
  grupo: string;
  incluida: boolean;
  cambios: Array<{ campo: string; antes: unknown; despues: unknown }>;
  errores: Array<{ campo: string | null; mensaje: string }>;
};

describe.skipIf(!HAY_BD || !hayBuild("panel"))(
  "Asistente de importación en el panel (HU-088, HU-086, HU-148)",
  () => {
    let bd: BdPrueba;
    let panel: ServidorPrueba;
    let admin: string;
    let observador: string;
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
    const enviar = (
      ruta: string,
      cuerpo: unknown,
      opciones: { cookie?: string; metodo?: string; sinCsrf?: boolean } = {},
    ) =>
      panel.pedir(ruta, {
        method: opciones.metodo ?? "POST",
        body: JSON.stringify(cuerpo),
        headers: {
          "content-type": "application/json",
          origin: panel.url,
          ...(opciones.sinCsrf ? {} : { "x-ps-csrf": csrf }),
          cookie: `__Host-csrf=${csrf}; ${opciones.cookie ?? admin}`,
        },
      });
    const leerRuta = (ruta: string, cookie = admin) => panel.pedir(ruta, { headers: { cookie } });
    const huella = async () =>
      (
        await bd.instalacion.query(
          `SELECT (SELECT md5(string_agg(p::text, '|' ORDER BY codigo)) FROM inventario.perfiles p) AS perfiles,
                  (SELECT version FROM inventario.inventario_version) AS version`,
        )
      ).rows[0];
    const columnasDe = (e: {
      emparejamiento: Array<{ columna: string; destino: { tipo: string; clave?: string } }>;
    }) =>
      e.emparejamiento.map((c) => ({
        columna: c.columna,
        clave: c.destino.tipo === "campo" ? c.destino.clave! : null,
      }));

    beforeAll(async () => {
      bd = await crearBdPrueba();
      const entorno = { ...entornoDev("panel"), APP_ENV: "ci", DATABASE_URL: bd.urlDe("ps_panel") };
      const worker = bd.como("ps_worker");
      await sembrarFicticios({
        bd: worker,
        auditoria: { hmac: entorno.AUDIT_HMAC_KEY!, kek: entorno.AUDIT_KEK! },
        appEnv: "ci",
        registrar: () => {},
      });
      await sembrarLexicoFicticio({ bd: worker, appEnv: "ci", registrar: () => {} });
      admin = await sesion("karen@trycore.com", "administrador");
      observador = await sesion("mirar@trycore.com", "observador");
      panel = await arrancarServidor("panel", entorno);
    }, 120_000);

    afterAll(async () => {
      await panel?.cerrar();
      await bd?.cerrar();
    });

    describe("HU-088 · exportar y plantilla de muestra", () => {
      it("el banco en hoja de cálculo: una fila por perfil, encabezados de la plantilla, listas con «;», internos marcados, sin consentimiento", async () => {
        const r = await leerRuta("/api/v1/importacion/exportar?formato=csv");
        expect(r.status).toBe(200);
        expect(r.headers.get("content-type")).toMatch(/text\/csv/);
        expect(r.headers.get("content-disposition")).toMatch(
          /attachment; filename="banco-de-perfiles-\d{4}-\d{2}-\d{2}\.csv"/,
        );
        const texto = await r.text();
        const l = leer(texto);
        if (!l.ok) throw new Error(l.motivo);
        expect(l.tabla.encabezados).toEqual(CAMPOS_IMPORTACION.map((c) => c.encabezado));
        const total = (
          await bd.instalacion.query(`SELECT count(*)::int AS n FROM inventario.perfiles`)
        ).rows[0].n;
        expect(l.tabla.filas).toHaveLength(total);
        const laura = l.tabla.filas.find((f) => f.celdas[0] === "PS-0142")!;
        const tec = CAMPOS_IMPORTACION.findIndex((c) => c.clave === "tecnologias");
        expect(laura.celdas[tec]).toBe("Java; Spring Boot; Kafka; PostgreSQL");
        expect(l.tabla.encabezados.filter((h) => h.endsWith("· interno"))).toHaveLength(3);
        expect(texto).not.toMatch(/consentim/i);
      });

      it("el mismo banco en JSON, con la estructura que acepta la importación", async () => {
        const r = await leerRuta("/api/v1/importacion/exportar?formato=json");
        expect(r.status).toBe(200);
        const datos = (await r.json()) as Array<Record<string, unknown>>;
        const csv = leer(await (await leerRuta("/api/v1/importacion/exportar?formato=csv")).text());
        expect(datos.map((d) => d.codigo)).toEqual(
          csv.ok && csv.tabla.filas.map((f) => f.celdas[0]),
        );
        expect(datos.find((d) => d.codigo === "PS-0142")).toMatchObject({
          tecnologias: ["Java", "Spring Boot", "Kafka", "PostgreSQL"],
        });
      });

      it("la plantilla de muestra trae los tres casos: actualizar, crear y archivar", async () => {
        const r = await leerRuta("/api/v1/importacion/plantilla?formato=csv");
        expect(r.status).toBe(200);
        const l = leer(await r.text());
        if (!l.ok) throw new Error(l.motivo);
        expect(l.tabla.filas.map((f) => f.celdas[0])).toEqual(["PS-0142", "PS-0900", "PS-0099"]);
        expect(l.tabla.filas[2]!.celdas[1]).toBe("archivado");
        expect((await leerRuta("/api/v1/importacion/plantilla?formato=xlsx")).status).toBe(400);
      });
    });

    describe("HU-086 · pegar desde la hoja de cálculo y emparejar", () => {
      it("reconoce las celdas de Excel sin preguntar y propone el emparejamiento; B.4 bloqueada", async () => {
        const r = await enviar("/api/v1/importacion/emparejar", {
          texto:
            "Código\tDisponibilidad\tTeléfono\tObs.\nPS-0142\t2026-12-01\t300 1234567\tconfirmó\n",
        });
        expect(r.status).toBe(200);
        const e = await r.json();
        expect(e).toMatchObject({
          formato: "tsv",
          totalFilas: 1,
          encabezados: ["Código", "Disponibilidad", "Teléfono", "Obs."],
        });
        expect(columnasDe(e)).toEqual([
          { columna: "Código", clave: "codigo" },
          { columna: "Disponibilidad", clave: "disponibilidad" },
          { columna: "Teléfono", clave: null },
          { columna: "Obs.", clave: null },
        ]);
        expect(e.emparejamiento[2]).toMatchObject({
          bloqueada: true,
          destino: { motivo: "lista_negra" },
        });
        // El ejemplo de una columna bloqueada no vuelve.
        expect(e.ejemplo).toEqual(["PS-0142", "2026-12-01", "", "confirmó"]);
      });

      it("lo ambiguo se pregunta; lo vacío o sin filas se explica", async () => {
        expect(
          await (
            await enviar("/api/v1/importacion/emparejar", { texto: "codigo\nPS-0142" })
          ).json(),
        ).toEqual({ motivo: "ambiguo" });
        const r = await enviar("/api/v1/importacion/emparejar", {
          texto: "codigo\nPS-0142",
          formato: "csv",
        });
        expect(r.status).toBe(200);
        expect(
          (await enviar("/api/v1/importacion/emparejar", { texto: "codigo\tnombre\n" })).status,
        ).toBe(422);
      });
    });

    describe("HU-086 · vista previa sin escritura", () => {
      it("la exportación con dos disponibilidades cambiadas: 2 actualizados, el resto sin cambios, banco intacto", async () => {
        const antes = await huella();
        const csv = await (await leerRuta("/api/v1/importacion/exportar?formato=csv")).text();
        const disp = CAMPOS_IMPORTACION.findIndex((c) => c.clave === "disponibilidad");
        const lineas = csv.split("\r\n");
        let cambiadas = 0;
        const editado = lineas
          .map((l, i) => {
            if (i === 0 || !l || cambiadas === 2 || l.includes('"')) return l;
            const celdas = l.split(",");
            celdas[disp] = "2031-01-0" + (cambiadas + 1);
            cambiadas++;
            return celdas.join(",");
          })
          .join("\r\n");
        const e = await (await enviar("/api/v1/importacion/emparejar", { texto: editado })).json();
        const r = await enviar("/api/v1/importacion/lotes", {
          texto: editado,
          formato: e.formato,
          modo: "crear_y_actualizar",
          columnas: columnasDe(e),
        });
        expect(r.status).toBe(201);
        const { loteId, plan } = await r.json();
        expect(loteId).toMatch(/^[0-9a-f-]{36}$/);
        expect(plan.conteos).toMatchObject({ actualizados: 2, nuevos: 0, con_error: 0 });
        expect(plan.conteos.sin_cambios).toBe(lineas.filter(Boolean).length - 3);
        const act = (plan.filas as Fila[]).filter((f) => f.grupo === "actualizado");
        for (const f of act) expect(f.cambios.map((c) => c.campo)).toEqual(["disponibilidad"]);
        expect(await huella()).toEqual(antes);
      });

      it("dos filas con el mismo código: ambas con error y bloqueado; desmarcarlas lo desbloquea", async () => {
        const texto = "codigo\tciudad\nPS-0142\tCali\nPS-0187\tCali\nPS-0142\tBogotá\n";
        const r = await enviar("/api/v1/importacion/lotes", {
          texto,
          formato: "tsv",
          modo: "crear_y_actualizar",
          columnas: [
            { columna: "codigo", clave: "codigo" },
            { columna: "ciudad", clave: "ciudad" },
          ],
        });
        const v = await r.json();
        expect(v.plan.bloqueado).toBe(true);
        expect((v.plan.filas as Fila[]).map((f) => [f.numero, f.grupo])).toEqual([
          [2, "con_error"],
          [3, "actualizado"],
          [4, "con_error"],
        ]);
        expect(v.plan.filas[0].errores[0].mensaje).toMatch(/PS-0142.*repetido.*fila 4/);
        const p = await enviar(
          `/api/v1/importacion/lotes/${v.loteId}`,
          { excluidas: [2, 4] },
          { metodo: "PATCH" },
        );
        expect(p.status).toBe(200);
        const w = await p.json();
        expect(w.plan.bloqueado).toBe(false);
        expect(w.plan.resumen).toMatchObject({ actualizar: 1, excluidas: 2 });
      });

      it("valores que no existen en el banco: destacados con valor y veces, sin bloquear", async () => {
        const r = await enviar("/api/v1/importacion/lotes", {
          texto: "codigo\ttecnologias\nPS-0142\tJava; Kubernets\nPS-0187\tkubernets\n",
          formato: "tsv",
          modo: "solo_actualizar",
          columnas: [
            { columna: "codigo", clave: "codigo" },
            { columna: "tecnologias", clave: "tecnologias" },
          ],
        });
        const { plan } = await r.json();
        expect(plan.bloqueado).toBe(false);
        expect(plan.valoresNuevos).toEqual([
          expect.objectContaining({ tipo: "tecnologia", valor: "Kubernets", veces: 2 }),
        ]);
      });

      it("el cliente no puede abrir una columna B.4 diciendo que es un campo", async () => {
        const r = await enviar("/api/v1/importacion/lotes", {
          texto: "codigo\tTeléfono\nPS-0142\t3001234567\n",
          formato: "tsv",
          modo: "crear_y_actualizar",
          columnas: [
            { columna: "codigo", clave: "codigo" },
            { columna: "Teléfono", clave: "nombre" },
          ],
        });
        const { loteId, plan } = await r.json();
        expect(plan.filas[0].grupo).toBe("sin_cambios");
        const datos = await bd.instalacion.query(
          `SELECT datos FROM inventario.lote_filas WHERE lote_id = $1`,
          [loteId],
        );
        expect(JSON.stringify(datos.rows)).not.toContain("3001234567");
      });
    });

    describe("HU-148 · emparejamientos guardados", () => {
      const hoja = "Cód.\tDisp. (mes)\tComentario\nPS-0142\t2026-12-01\tok\n";
      let id: string;

      it("guardar con nombre lo deja en la lista con qué columna va a qué campo; el nombre no se repite", async () => {
        const columnas = [
          { columna: "Cód.", clave: "codigo" },
          { columna: "Disp. (mes)", clave: "disponibilidad" },
          { columna: "Comentario", clave: null },
        ];
        const r = await enviar("/api/v1/importacion/plantillas", {
          nombre: "Disponibilidad mensual",
          columnas,
        });
        expect(r.status).toBe(201);
        id = (await r.json()).plantilla.id;
        const lista = (await (await leerRuta("/api/v1/importacion/plantillas")).json()).plantillas;
        expect(lista).toEqual([
          expect.objectContaining({
            id,
            nombre: "Disponibilidad mensual",
            columnas,
            autor: "karen@trycore.com",
          }),
        ]);
        const otra = await enviar("/api/v1/importacion/plantillas", {
          nombre: "disponibilidad MENSUAL",
          columnas,
        });
        expect(otra.status).toBe(409);
        expect((await otra.json()).motivo).toBe("nombre_repetido");
      });

      it("aplicarla a la hoja del mes siguiente empareja como se guardó", async () => {
        const e = await (
          await enviar("/api/v1/importacion/emparejar", { texto: hoja, plantillaId: id })
        ).json();
        expect(e.plantilla).toEqual({ id, nombre: "Disponibilidad mensual" });
        expect(columnasDe(e)).toEqual([
          { columna: "Cód.", clave: "codigo" },
          { columna: "Disp. (mes)", clave: "disponibilidad" },
          { columna: "Comentario", clave: null },
        ]);
        expect(e.faltantes).toEqual([]);
        expect(e.nuevas).toEqual([]);
      });

      it("columna que falta: se dice cuál y su campo no se toca; columna nueva: sin emparejar e informada", async () => {
        const e = await (
          await enviar("/api/v1/importacion/emparejar", {
            texto: "Cód.\tComentario\tProyecto actual\nPS-0142\tok\tCore\n",
            plantillaId: id,
          })
        ).json();
        expect(e.faltantes).toEqual([{ columna: "Disp. (mes)", clave: "disponibilidad" }]);
        expect(e.nuevas).toEqual(["Proyecto actual"]);
        const r = await enviar("/api/v1/importacion/lotes", {
          texto: "Cód.\tComentario\tProyecto actual\nPS-0142\tok\tCore\n",
          formato: "tsv",
          modo: "crear_y_actualizar",
          columnas: columnasDe(e),
        });
        expect((await r.json()).plan.filas[0].grupo).toBe("sin_cambios");
      });
    });

    describe("permisos, CSRF y la pantalla", () => {
      it("la observadora no exporta, no empareja, no calcula ni guarda (403)", async () => {
        expect(
          (await leerRuta("/api/v1/importacion/exportar?formato=csv", observador)).status,
        ).toBe(403);
        expect(
          (await leerRuta("/api/v1/importacion/plantilla?formato=csv", observador)).status,
        ).toBe(403);
        expect((await leerRuta("/api/v1/importacion/plantillas", observador)).status).toBe(403);
        expect(
          (
            await enviar(
              "/api/v1/importacion/emparejar",
              { texto: "a\tb\n1\t2" },
              { cookie: observador },
            )
          ).status,
        ).toBe(403);
        expect(
          (
            await enviar(
              "/api/v1/importacion/lotes",
              {
                texto: "codigo\nPS-0142",
                formato: "csv",
                modo: "crear_y_actualizar",
                columnas: [],
              },
              { cookie: observador },
            )
          ).status,
        ).toBe(403);
        expect(
          (
            await enviar(
              "/api/v1/importacion/plantillas",
              { nombre: "x", columnas: [{ columna: "a", clave: null }] },
              { cookie: observador },
            )
          ).status,
        ).toBe(403);
        const html = await (await leerRuta("/importar", observador)).text();
        expect(html).toContain("Solo la administración del inventario importa.");
        expect(html).not.toContain("Exportar banco");
      });

      it("sin cabecera CSRF → 403 y sin sesión → 401", async () => {
        expect(
          (
            await enviar(
              "/api/v1/importacion/emparejar",
              { texto: "a\tb\n1\t2" },
              { sinCsrf: true },
            )
          ).status,
        ).toBe(403);
        expect((await panel.pedir("/api/v1/importacion/exportar?formato=csv")).status).toBe(401);
      });

      it("la pantalla de la administradora trae el formato, el pegado y el modo, con el menú habilitado", async () => {
        const r = await leerRuta("/importar");
        expect(r.status).toBe(200);
        const html = await r.text();
        for (const t of [
          "Importar perfiles",
          "Parte del formato",
          "Exportar banco · hoja de cálculo",
          "Plantilla de muestra",
          "¿No arranca la descarga? Ver para copiar",
          "Pega tu hoja",
          "Crear y actualizar",
          "Solo actualizar",
          "Solo crear",
          "Nada cambia en el banco hasta que confirmes en la vista previa.",
        ])
          expect(html, t).toContain(t);
        expect(html).toMatch(/<a class="pp-sidelink" href="\/importar" aria-current="page">/);
        // Respaldo de HU-088: el área de texto para copiar existe aunque la descarga no arranque.
        expect(html).toMatch(/<textarea[^>]*id="copiar-plantilla"[^>]*readOnly|<textarea[^>]*readonly[^>]*id="copiar-plantilla"/i);
      });
    });
  },
);
