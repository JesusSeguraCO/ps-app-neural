// Contrato HTTP de coherencia y archivo (EP-006 · sub-slice 8: HU-134, HU-135) contra el servidor
// standalone real del panel (`ps_panel`): la contradicción ALTA de un pausado con fecha se ve en su fila
// con sus dos salidas y bloquea publicar (409 con la contradicción); quitar la disponibilidad y publicar
// con ella; la pestaña «Con incoherencia»; archivar desde «Más acciones», idempotente y sin cambio para
// la observadora; un archivado en un enlace curado se ve «fuera del banco» (`ps_portal`). Base tomada de
// vigencia-panel.test.ts.
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import type { SesionPortalVerificada } from "@ps/dominio/acceso/sesion";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import { aterrizajeDelEnlace } from "@ps/infra/postgres/seleccion";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { sembrarFicticios } from "./worker/src/sembrar-ficticios";
import { sembrarLexicoFicticio } from "./worker/src/sembrar-lexico";

describe.skipIf(!HAY_BD || !hayBuild("panel"))(
  "Coherencia y archivo en el panel (HU-134, HU-135)",
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
      const worker = bd.como("ps_worker");
      await sembrarFicticios({
        bd: worker,
        auditoria: { hmac: entorno.AUDIT_HMAC_KEY!, kek: entorno.AUDIT_KEK! },
        appEnv: "ci",
        registrar: () => {},
      });
      await sembrarLexicoFicticio({ bd: worker, appEnv: "ci", registrar: () => {} });
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

    const pausadoConFecha = async () => {
      const p = await publicado();
      await pedir("POST", `/api/v1/perfiles/${p.codigo}/pausar`, { motivoId: await motivoId() });
      const r = await pedir("POST", "/api/v1/perfiles/disponibilidad", {
        codigos: [p.codigo],
        disponibilidad: { fecha: "2026-12-01" },
      });
      expect((await r.json()).resultados[0].ok).toBe(true);
      return p;
    };
    const auditorias = async (codigo: string) =>
      (
        await bd.instalacion.query(
          `SELECT count(*)::int AS n FROM auditoria.auditoria WHERE titular = $1`,
          [codigo],
        )
      ).rows[0].n as number;

    it("pausado con fecha: señal ALTA en la fila con sus dos salidas y en la pestaña «Con incoherencia»", async () => {
      const p = await pausadoConFecha();
      const html = await pagina(`/inventario?estado=incoherencia&q=${p.codigo}`);
      expect(html).toContain("Bloquea la publicación");
      expect(html).toContain("Pausado y con disponibilidad «");
      expect(html).toContain("Contradice el estado pausado");
      expect(html).toContain("Quitar la disponibilidad");
      expect(html).toContain("Publicar con esa disponibilidad");
      expect(html).toMatch(/Con incoherencia(?:<!-- -->| )+<span class="pp-pestana__conteo">[1-9]/);
    });

    it("publicar con ALTA: 409 con la contradicción y el perfil no cambia", async () => {
      const p = await pausadoConFecha();
      const n = await auditorias(p.codigo);
      const version = (
        await bd.instalacion.query(`SELECT version FROM inventario.perfiles WHERE codigo = $1`, [
          p.codigo,
        ])
      ).rows[0].version as number;
      const r = await pedir("POST", `/api/v1/perfiles/${p.codigo}/publicar`, {}, { version });
      expect(r.status).toBe(409);
      const d = await r.json();
      expect(d.motivo).toBe("incoherencia");
      expect(d.contradiccion).toMatch(/^Pausado y con disponibilidad «/);
      const m = await pedir("POST", "/api/v1/perfiles/publicar", { codigos: [p.codigo] });
      expect((await m.json()).resultados[0]).toMatchObject({
        ok: false,
        motivos: ["incoherencia"],
      });
      expect(await fechaPortal(p.codigo)).toBeUndefined();
      expect(await auditorias(p.codigo)).toBe(n);
    });

    it("las salidas: quitar la disponibilidad lo deja pausado; publicar con ella lo devuelve al portal", async () => {
      const a = await pausadoConFecha();
      const b = await pausadoConFecha();
      const q = await pedir("POST", `/api/v1/perfiles/${a.codigo}/quitar-disponibilidad`, {});
      expect(q.status).toBe(200);
      expect((await q.json()).perfil).toMatchObject({
        estado: "pausado",
        disponibilidadFecha: null,
      });
      const r = await pedir("POST", `/api/v1/perfiles/${b.codigo}/reactivar`, {
        disponibilidad: { confirmar: true },
      });
      expect(r.status).toBe(200);
      expect(await fechaPortal(b.codigo)).toBe("2026-12-01");
      expect(await pagina(`/inventario?q=${b.codigo}`)).not.toContain("Bloquea la publicación");
      expect(
        (await pedir("POST", `/api/v1/perfiles/${b.codigo}/quitar-disponibilidad`, {})).status,
      ).toBe(409);
    });

    it("MEDIA: vencida y sin tocar se ve «por confirmar», sin rojo, y sigue en el portal", async () => {
      const p = await publicado();
      await bd.instalacion.query(
        `UPDATE inventario.perfiles SET disponibilidad_fecha = current_date - 15,
                disponibilidad_actualizada_en = now() - interval '46 days' WHERE codigo = $1`,
        [p.codigo],
      );
      const html = await pagina(`/inventario?q=${p.codigo}`);
      expect(html).toContain("Advertencia media");
      expect(html).toContain("el portal lo muestra como «Disponibilidad por confirmar»");
      expect(html).not.toContain("Bloquea la publicación");
      expect(html).toContain("Ver en Vigencia");
      expect(await fechaPortal(p.codigo)).toBeDefined();
    });

    it("archivar: el menú lo ofrece, sale del portal, repetirlo informa sin tocar fecha ni historial", async () => {
      const p = await publicado();
      expect(await pagina(`/inventario?q=${p.codigo}`)).toContain(
        "Más acciones para Lorena Salcedo",
      );
      const r = await pedir("POST", `/api/v1/perfiles/${p.codigo}/archivar`, {});
      expect((await r.json()).yaArchivado).toBe(false);
      expect(await fechaPortal(p.codigo)).toBeUndefined();
      const fecha = async () =>
        (
          await bd.instalacion.query(
            `SELECT archivado_en FROM inventario.perfiles WHERE codigo = $1`,
            [p.codigo],
          )
        ).rows[0].archivado_en as Date;
      const antes = await fecha();
      const n = await auditorias(p.codigo);
      const otra = await pedir("POST", `/api/v1/perfiles/${p.codigo}/archivar`, {});
      expect((await otra.json()).yaArchivado).toBe(true);
      expect((await fecha()).getTime()).toBe(antes.getTime());
      expect(await auditorias(p.codigo)).toBe(n);
    });

    it("la observadora no archiva: 403, el perfil conserva su estado y no queda cambio", async () => {
      const p = await publicado();
      const n = await auditorias(p.codigo);
      for (const ruta of ["archivar", "quitar-disponibilidad", "usar-liberacion"])
        expect(
          (await pedir("POST", `/api/v1/perfiles/${p.codigo}/${ruta}`, {}, { cookie: observador }))
            .status,
        ).toBe(403);
      expect(await fechaPortal(p.codigo)).toBeDefined();
      expect(await auditorias(p.codigo)).toBe(n);
      expect(await pagina(`/inventario?q=${p.codigo}`, observador)).not.toContain("Archivar a");
    });

    it("un archivado en un enlace curado se ve «fuera del banco» y los demás con normalidad", async () => {
      const a = await publicado();
      const b = await publicado();
      const e = (
        await bd.instalacion.query(
          `INSERT INTO identidad.enlaces (cuenta_ref, cuenta_nombre, razon, codigos_perfil, vigente_desde, vigente_hasta, generado_por)
           VALUES ('1', 'Bancolombia', 'Pagos.', $1, now() - interval '1 day', now() + interval '20 days', gen_random_uuid())
           RETURNING id`,
          [[a.codigo, b.codigo]],
        )
      ).rows[0].id as string;
      await pedir("POST", `/api/v1/perfiles/${a.codigo}/archivar`, {});
      const t = await aterrizajeDelEnlace(portal, { enlaceId: e } as SesionPortalVerificada);
      expect(
        t.seleccion.items.map((i) => [i.codigo, i.tipo === "cambio" ? i.estado : i.tipo]),
      ).toEqual([
        [a.codigo, "archivado"],
        [b.codigo, "disponible"],
      ]);
    });
  },
);
