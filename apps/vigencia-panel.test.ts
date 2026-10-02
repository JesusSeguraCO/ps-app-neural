// Contrato HTTP de disponibilidad, pausa y vigencia (EP-006 · sub-slice 7: HU-132, HU-133, HU-136)
// contra el servidor standalone real del panel (`ps_panel`): disponibilidad de uno o en bloque con
// resultado por perfil y la banda nueva en el portal (`ps_portal`); pausar con motivo, el desvío a
// disponibilidad en la hoja; reactivar y archivar desde la bandeja; la bandeja con sus grupos y vacía;
// la observadora sin controles y con 403. Base tomada de validacion-panel.test.ts.
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { sembrarFicticios } from "./worker/src/sembrar-ficticios";
import { sembrarLexicoFicticio } from "./worker/src/sembrar-lexico";

describe.skipIf(!HAY_BD || !hayBuild("panel"))(
  "Disponibilidad, pausa y vigencia en el panel (HU-132, HU-133, HU-136)",
  () => {
    let bd: BdPrueba;
    let panel: ServidorPrueba;
    let portal: pg.Pool;
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
    const pedir = (
      metodo: string,
      ruta: string,
      cuerpo: unknown,
      o: { cookie?: string; version?: number; sinCsrf?: boolean } = {},
    ) =>
      panel.pedir(ruta, {
        method: metodo,
        body: JSON.stringify(cuerpo),
        headers: {
          "content-type": "application/json",
          origin: panel.url,
          ...(o.sinCsrf ? {} : { "x-ps-csrf": csrf }),
          cookie: `__Host-csrf=${csrf}; ${o.cookie ?? admin}`,
          ...(o.version !== undefined ? { "if-match": `"${o.version}"` } : {}),
        },
      });
    const id = async (tabla: string, nombre: string) =>
      (await bd.instalacion.query(`SELECT id FROM inventario.${tabla} WHERE nombre = $1`, [nombre]))
        .rows[0]?.id as string;
    let ids: Record<"java" | "kafka", string>;

    // Un perfil completo con consentimiento nominal, publicado por la API.
    async function publicado() {
      const p = (
        await (
          await pedir("POST", "/api/v1/perfiles", {
            nombre: "Lorena",
            primerApellido: "Salcedo",
            rolId: await id("catalogo_roles", "Desarrolladora backend Java"),
            tecnologiaIds: [ids.java],
            seniorityId: await id("catalogo_seniorities", "Senior"),
            aniosExperiencia: 8,
            ciudadId: await id("catalogo_ciudades", "Medellín"),
            modalidadTrabajoId: await id("catalogo_modalidades", "hibrido"),
            disponibilidad: { opcion: "ahora" },
            modalidadPruebaId: await id(
              "catalogo_modalidades_prueba",
              "Prueba práctica revisada por un arquitecto",
            ),
            aporte: "Integraciones estables.",
            experiencias: [
              { cargo: "Backend senior", desde: 2021, descripcion: "Pagos inmediatos." },
            ],
          })
        ).json()
      ).perfil as { codigo: string };
      const c = (
        await (
          await pedir("POST", `/api/v1/perfiles/${p.codigo}/consentimiento`, {
            nombreApellido: true,
            trayectoria: true,
            clientes: true,
          })
        ).json()
      ).perfil as { version: number };
      const r = await pedir(
        "POST",
        `/api/v1/perfiles/${p.codigo}/publicar`,
        {},
        { version: c.version },
      );
      expect(r.status).toBe(200);
      return (await r.json()).perfil as { codigo: string; version: number; estado: string };
    }

    beforeAll(async () => {
      bd = await crearBdPrueba();
      const entorno = { ...entornoDev("panel"), APP_ENV: "ci", DATABASE_URL: bd.urlDe("ps_panel") };
      await sembrarFicticios({
        bd: bd.como("ps_panel"),
        auditoria: { hmac: entorno.AUDIT_HMAC_KEY!, kek: entorno.AUDIT_KEK! },
        appEnv: "ci",
        registrar: () => {},
      });
      await sembrarLexicoFicticio({ bd: bd.como("ps_panel"), candidatas: bd.como("ps_worker"), appEnv: "ci", registrar: () => {} });
      portal = bd.como("ps_portal");
      admin = await sesion("karen@trycore.com", "administrador");
      observador = await sesion("mirar@trycore.com", "observador");
      ids = {
        java: await id("catalogo_tecnologias", "Java"),
        kafka: await id("catalogo_tecnologias", "Kafka"),
      };
      panel = await arrancarServidor("panel", entorno);
    }, 120_000);

    afterAll(async () => {
      await panel?.cerrar();
      await bd?.cerrar();
    });

    const motivoId = async () =>
      (
        await bd.instalacion.query(
          `SELECT id FROM inventario.catalogo_motivos_pausa WHERE nombre = 'Decisión de Talento Humano'`,
        )
      ).rows[0].id as string;
    const fechaPortal = async (codigo: string) =>
      (
        await portal.query(
          `SELECT disponibilidad_fecha::text AS f FROM operacion.catalogo_publicable WHERE codigo = $1`,
          [codigo],
        )
      ).rows[0]?.f as string | undefined;
    const pagina = async (ruta: string, cookie = admin) =>
      (await panel.pedir(ruta, { headers: { cookie } })).text();

    it("disponibilidad en bloque: 200 con resultado por perfil y el portal ve la fecha nueva", async () => {
      const a = await publicado();
      const b = await publicado();
      const r = await pedir("POST", "/api/v1/perfiles/disponibilidad", {
        codigos: [a.codigo, b.codigo, "PS-9998"],
        disponibilidad: { fecha: "2026-12-24" },
      });
      expect(r.status).toBe(200);
      const d = await r.json();
      expect(d.resultados.map((x: { codigo: string; ok: boolean }) => [x.codigo, x.ok])).toEqual([
        [a.codigo, true],
        [b.codigo, true],
        ["PS-9998", false],
      ]);
      expect(await fechaPortal(a.codigo)).toBe("2026-12-24");
    });

    it("pausar con motivo: sale del portal; el listado lo muestra con su motivo (el desvío «es una fecha» lo recorre el e2e)", async () => {
      const p = await publicado();
      const html = await pagina("/inventario");
      expect(html).toContain("Más acciones para Lorena Salcedo");
      const r = await pedir("POST", `/api/v1/perfiles/${p.codigo}/pausar`, {
        motivoId: await motivoId(),
      });
      expect(r.status).toBe(200);
      expect((await r.json()).perfil.estado).toBe("pausado");
      expect(await fechaPortal(p.codigo)).toBeUndefined();
      expect(await pagina("/inventario?estado=pausado")).toContain("Decisión de Talento Humano");
      const sinMotivo = await pedir("POST", `/api/v1/perfiles/${p.codigo}/pausar`, {
        motivoId: "00000000-0000-0000-0000-000000000000",
      });
      expect(sinMotivo.status).toBe(409);
    });

    it("bandeja: un pausado de 31 días aparece con su motivo; reactivar lo devuelve al portal; archivar es idempotente", async () => {
      const p = await publicado();
      await pedir("POST", `/api/v1/perfiles/${p.codigo}/pausar`, { motivoId: await motivoId() });
      await bd.instalacion.query(
        `UPDATE inventario.perfiles SET pausado_en = now() - interval '31 days' WHERE codigo = $1`,
        [p.codigo],
      );
      const html = await pagina("/vigencia");
      expect(html).toContain("Pausados hace más de 30 días");
      expect(html).toContain("31 días");
      expect(html).toContain(`Reactivar a Lorena Salcedo`);
      const re = await pedir("POST", `/api/v1/perfiles/${p.codigo}/reactivar`, {
        disponibilidad: { opcion: "ahora" },
      });
      expect(re.status).toBe(200);
      expect(await fechaPortal(p.codigo)).toBeDefined();
      const q = await publicado();
      await pedir("POST", `/api/v1/perfiles/${q.codigo}/pausar`, { motivoId: await motivoId() });
      expect(
        (await (await pedir("POST", `/api/v1/perfiles/${q.codigo}/archivar`, {})).json())
          .yaArchivado,
      ).toBe(false);
      expect(
        (await (await pedir("POST", `/api/v1/perfiles/${q.codigo}/archivar`, {})).json())
          .yaArchivado,
      ).toBe(true);
    });

    it("la observadora ve la bandeja y el listado sin controles, y recibe 403 al escribir", async () => {
      const p = await publicado();
      const html = await pagina("/vigencia", observador);
      expect(html).toContain("Bandeja de vigencia");
      expect(html).not.toContain("Confirmar sin cambios");
      expect(await pagina("/inventario", observador)).not.toContain("Pausar a");
      const huella = async () =>
        (
          await bd.instalacion.query(
            `SELECT p.disponibilidad_fecha::text AS fecha, p.estado,
                  (SELECT count(*)::int FROM auditoria.auditoria a WHERE a.titular = p.codigo) AS cambios
             FROM inventario.perfiles p WHERE p.codigo = $1`,
            [p.codigo],
          )
        ).rows[0];
      const antes = await huella();
      for (const [ruta, cuerpo] of [
        [
          "/api/v1/perfiles/disponibilidad",
          { codigos: [p.codigo], disponibilidad: { opcion: "ahora" } },
        ],
        [`/api/v1/perfiles/${p.codigo}/pausar`, { motivoId: await motivoId() }],
        [`/api/v1/perfiles/${p.codigo}/archivar`, {}],
      ] as const)
        expect((await pedir("POST", ruta, cuerpo, { cookie: observador })).status).toBe(403);
      // HU-132 error: la disponibilidad no cambia y no queda ningún cambio registrado.
      expect(await huella()).toEqual(antes);
    });

    it("un publicado vencido dice en cuántos enlaces activos está", async () => {
      const p = await publicado();
      await bd.instalacion.query(
        `UPDATE inventario.perfiles SET disponibilidad_actualizada_en = now() - interval '45 days' WHERE codigo = $1`,
        [p.codigo],
      );
      await bd.instalacion.query(
        `INSERT INTO identidad.enlaces (cuenta_ref, cuenta_nombre, razon, codigos_perfil, vigente_desde, vigente_hasta, generado_por)
         VALUES ('1', 'Bancolombia', 'Pagos.', $1, now() - interval '1 day', now() + interval '20 days', gen_random_uuid())`,
        [[p.codigo]],
      );
      expect(await pagina("/vigencia")).toContain("· en 1 enlace activo");
    });

    it("Catálogos administra los motivos de pausa", async () => {
      const html = await pagina("/catalogos?tipo=motivo_pausa");
      expect(html).toContain("Motivos de pausa");
      expect(html).toContain("En licencia o ausencia temporal");
    });
  },
);
