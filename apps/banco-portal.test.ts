// Sub-slice 6a de EP-001: HU-091 (la selección se reconoce; ninguno publicado → explorar con el contexto),
// HU-093 (encuadre sin selección), HU-094 (ampliar al banco y volver) y el «Mi equipo» mínimo por
// invitado (tarea 6.3), contra el portal standalone con `ps_portal` y los perfiles ficticios de la 3.2.
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { PERFILES_FICTICIOS, sembrarFicticios } from "./worker/src/sembrar-ficticios";

const publicados = PERFILES_FICTICIOS.filter((p) => p.estado === "publicado");
const escapar = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const tarjetas = (html: string) => html.split('<article class="pp-perfil').slice(1);
const codigos = (html: string) => tarjetas(html).map((t) => t.match(/PS-\d{4}/)?.[0]);

describe.skipIf(!HAY_BD || !hayBuild("portal"))(
  "banco, encuadre y Mi equipo (HU-091, HU-093, HU-094)",
  () => {
    let bd: BdPrueba;
    let srv: ServidorPrueba;

    async function enlace(o: { codigos: string[]; proyecto?: string | null; invitados?: number }) {
      const e = await bd.instalacion.query(
        `INSERT INTO identidad.enlaces (cuenta_nombre, proyecto, razon, codigos_perfil, vigente_desde, vigente_hasta, generado_por)
       VALUES ('Grupo Éxito', $1, 'Perfiles para la plataforma omnicanal.', $2, now() - interval '2 days', now() + interval '25 days', gen_random_uuid())
       RETURNING id`,
        [o.proyecto === undefined ? "Plataforma omnicanal" : o.proyecto, o.codigos],
      );
      const cookies: string[] = [];
      const invitados: string[] = [];
      for (let k = 0; k < (o.invitados ?? 1); k++) {
        const i = await bd.instalacion.query(
          `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, $2, $3) RETURNING id`,
          [e.rows[0].id, `inv${k}-${randomBytes(3).toString("hex")}@exito.com`, randomBytes(32)],
        );
        const id = randomBytes(32).toString("base64url");
        await bd.instalacion.query(
          `INSERT INTO identidad.sesiones_portal (id_hash, enlace_id, invitado_id, expira) VALUES ($1, $2, $3, now() + interval '20 days')`,
          [createHash("sha256").update(id).digest(), e.rows[0].id, i.rows[0].id],
        );
        cookies.push(`__Host-ps=${id}`);
        invitados.push(i.rows[0].id);
      }
      return { enlaceId: e.rows[0].id as string, cookies, invitados };
    }

    const html = async (ruta: string, cookie: string) => {
      const r = await srv.pedir(ruta, { headers: { cookie } });
      expect(r.status, ruta).toBe(200);
      return r.text();
    };

    beforeAll(async () => {
      bd = await crearBdPrueba();
      const panelEnv = entornoDev("panel");
      await sembrarFicticios({
        bd: bd.como("ps_worker"),
        auditoria: { hmac: panelEnv.AUDIT_HMAC_KEY!, kek: panelEnv.AUDIT_KEK! },
        appEnv: "ci",
        registrar: () => {},
      });
      srv = await arrancarServidor("portal", {
        ...entornoDev("portal"),
        APP_ENV: "ci",
        DATABASE_URL: bd.urlDe("ps_portal"),
      });
    }, 90_000);

    afterAll(async () => {
      await srv?.cerrar();
      await bd?.cerrar();
    });

    describe("HU-093: enlace sin selección", () => {
      it("happy: la pregunta de encuadre con las categorías y los roles del banco publicado, antes del listado", async () => {
        const { cookies } = await enlace({ codigos: [] });
        const h = await html("/", cookies[0]!);
        expect(h).toContain("¿Qué necesita tu proyecto?");
        expect(h).toContain(`${publicados.length} perfiles publicados`);
        for (const f of new Set(publicados.map((p) => p.familia))) {
          const n = publicados.filter((p) => p.familia === f).length;
          expect(h, f).toMatch(
            new RegExp(
              `href="/banco\\?categoria=${encodeURIComponent(f)}"[^>]*>.*?${f}</span><span class="enc-op__conteo" aria-hidden="true">${n}<`,
            ),
          );
        }
        expect(h).toMatch(/href="\/banco\?rol=Ingeniera%20de%20datos"[^>]*>.*?>1</);
        // Un rol del catálogo sin perfiles publicados hoy también es opción (con 0).
        expect(h).toMatch(
          /Analista de datos<\/span><span class="enc-op__conteo" aria-hidden="true">0</,
        );
        expect(h).toMatch(/href="\/banco"[^>]*>.*?Ver los .*?7.*? perfiles/s);
        expect(tarjetas(h)).toHaveLength(0);
        expect(h).not.toContain("Volver a la selección");
      });

      it("elijo una opción de rol o de categoría → el banco filtrado por esa opción", async () => {
        const { cookies } = await enlace({ codigos: [] });
        const porRol = await html(
          `/banco?rol=${encodeURIComponent("Analista QA automatización")}`,
          cookies[0]!,
        );
        expect(codigos(porRol)).toEqual(["PS-0201"]);
        const porCategoria = await html(`/banco?categoria=Calidad`, cookies[0]!);
        expect(codigos(porCategoria).sort()).toEqual(["PS-0201", "PS-0238"]);
        expect(porCategoria).toContain("Calidad");
      });

      it("sigo sin elegir → el banco completo, sin mensaje ni bloqueo", async () => {
        const { cookies } = await enlace({ codigos: [] });
        const h = await html("/banco", cookies[0]!);
        expect(codigos(h).sort()).toEqual(publicados.map((p) => p.codigo).sort());
        expect(h).not.toMatch(/Hoy no hay perfiles|pp-aviso/);
      });

      it("opción sin perfiles publicados → lo dice y ofrece ampliar la búsqueda", async () => {
        const { cookies } = await enlace({ codigos: [] });
        const h = await html(`/banco?rol=${encodeURIComponent("Analista de datos")}`, cookies[0]!);
        expect(h).toContain("Hoy no hay perfiles publicados de Analista de datos.");
        expect(h).toMatch(/href="\/banco"[^>]*>Ampliar la búsqueda</);
        expect(tarjetas(h)).toHaveLength(0);
        // Una opción inexistente se trata igual (sin error crudo).
        const x = await html(`/banco?categoria=${encodeURIComponent("No existe")}`, cookies[0]!);
        expect(x).toContain("Hoy no hay perfiles publicados de No existe.");
      });

      it("edge: sin contexto de proyecto → saluda con la cuenta, sin proyecto ni motivo", async () => {
        const { cookies } = await enlace({ codigos: [], proyecto: null });
        const h = await html("/", cookies[0]!);
        expect(h).toContain('<p class="pp-cuenta__nombre">Grupo Éxito</p>');
        expect(h).not.toContain("Plataforma omnicanal");
        expect(h).not.toContain("Perfiles para la plataforma omnicanal.");
      });

      it("HU-094 edge: nunca hubo selección → el banco no ofrece «Volver a la selección» ni la navegación la muestra", async () => {
        const { cookies } = await enlace({ codigos: [] });
        const h = await html("/banco", cookies[0]!);
        expect(h).not.toContain("Volver a la selección");
        expect(h).not.toContain("Selección para ti");
        expect(h).toMatch(/class="pp-navlink" href="\/banco" aria-current="page">Buscar</);
      });
    });

    describe("HU-094: ampliar la búsqueda y volver a la selección", () => {
      it("happy: desde la selección, el banco ofrece volver; volver muestra la selección y Mi equipo queda igual", async () => {
        const { cookies, invitados } = await enlace({ codigos: ["PS-0187", "PS-0223"] });
        await html("/", cookies[0]!); // primer ingreso: crea su Mi equipo vacío
        const eq = await bd.instalacion.query(
          `SELECT id FROM identidad.equipos WHERE invitado_id = $1`,
          [invitados[0]],
        );
        await bd.instalacion.query(
          `INSERT INTO identidad.equipo_perfiles (equipo_id, codigo_perfil, orden) VALUES ($1, 'PS-0142', 1), ($1, 'PS-0230', 2)`,
          [eq.rows[0].id],
        );
        const banco = await html("/banco", cookies[0]!);
        expect(banco).toMatch(/href="\/"[^>]*>Volver a la selección</);
        expect(codigos(banco).length).toBe(publicados.length);
        const vuelta = await html("/", cookies[0]!);
        expect(codigos(vuelta)).toEqual(["PS-0187", "PS-0223"]);
        expect(vuelta).toContain("Perfiles para la plataforma omnicanal.");
        expect(vuelta).toMatch(/pp-equipo__conteo[^"]*" aria-hidden="true">2</);
        const despues = await bd.instalacion.query(
          `SELECT codigo_perfil FROM identidad.equipo_perfiles WHERE equipo_id = $1 ORDER BY orden`,
          [eq.rows[0].id],
        );
        expect(despues.rows.map((f) => f.codigo_perfil)).toEqual(["PS-0142", "PS-0230"]);
      });

      it("error: perfiles de la selección archivados mientras exploraba → cada uno con su estado y la opción de ampliar", async () => {
        const { cookies } = await enlace({ codigos: ["PS-0215", "PS-0238"] });
        await html("/banco", cookies[0]!);
        await bd.instalacion.query(
          `UPDATE inventario.perfiles SET estado = 'archivado' WHERE codigo IN ('PS-0215', 'PS-0238')`,
        );
        try {
          const h = await html("/", cookies[0]!);
          expect(codigos(h)).toEqual(["PS-0215", "PS-0238"]);
          expect(tarjetas(h).every((t) => t.includes("Archivado"))).toBe(true);
          expect(h).toMatch(
            /href="\/banco[^"]*"[^>]*>(Ampliar la búsqueda al banco|Explorar el banco)/,
          );
        } finally {
          await bd.instalacion.query(
            `UPDATE inventario.perfiles SET estado = 'publicado' WHERE codigo IN ('PS-0215', 'PS-0238')`,
          );
        }
      });
    });

    describe("HU-091: la selección del correo", () => {
      it("happy: los mismos perfiles del correo sin pasos intermedios, con la razón referida al proyecto", async () => {
        const { cookies } = await enlace({ codigos: ["PS-0230", "PS-0142", "PS-0201"] });
        const h = await html("/", cookies[0]!);
        expect(codigos(h)).toEqual(["PS-0230", "PS-0142", "PS-0201"]);
        expect(h).toContain("Tres perfiles para Plataforma omnicanal");
        expect(h).toContain("Perfiles para la plataforma omnicanal.");
        expect(h).not.toContain("¿Qué necesita tu proyecto?");
      });

      it("error: un perfil pausado desde el envío → en su lugar con «Pausado»; los demás con toda su información", async () => {
        const { cookies } = await enlace({ codigos: ["PS-0142", "PS-0151", "PS-0187"] });
        const t = tarjetas(await html("/", cookies[0]!));
        expect(t[1]).toContain("Pausado");
        expect(t[0]).toContain(escapar("Laura Méndez"));
        expect(t[0]).toContain("pp-perfil__tecnologias");
        expect(t[2]).toContain("pp-perfil__tecnologias");
      });

      it("edge: ninguno sigue publicado → lista completa con estados e invitación a explorar con el contexto aplicado", async () => {
        const { cookies } = await enlace({ codigos: ["PS-0151", "PS-0137", "PS-0099"] });
        const h = await html("/", cookies[0]!);
        expect(tarjetas(h)).toHaveLength(3);
        expect(h).toContain("Ninguno de los tres sigue publicado");
        const m = h.match(
          /href="(\/banco\?contexto=seleccion)"[^>]*>Explorar el banco con este contexto/,
        );
        expect(m).toBeTruthy();
        // El contexto son las categorías de la selección (Desarrollo y Calidad), visibles antes de abrir.
        expect(h).toMatch(/pp-chip[^>]*>Desarrollo</);
        expect(h).toMatch(/pp-chip[^>]*>Calidad</);
        const banco = await html(m![1]!, cookies[0]!);
        const esperado = publicados
          .filter((p) => ["Desarrollo", "Calidad"].includes(p.familia))
          .map((p) => p.codigo);
        expect(codigos(banco).sort()).toEqual(esperado.sort());
        expect(banco).toContain("Volver a la selección");
        expect(banco).toMatch(/href="\/banco"[^>]*>Ver el banco completo</);
      });
    });

    describe("tarea 6.3: «Mi equipo» por invitado en el servidor", () => {
      it("dos invitados del mismo enlace: el que entra por primera vez tiene su equipo vacío y no ve el del otro", async () => {
        const { cookies, invitados } = await enlace({ codigos: ["PS-0142"], invitados: 2 });
        await html("/", cookies[0]!);
        const a = await bd.instalacion.query(
          `SELECT id FROM identidad.equipos WHERE invitado_id = $1`,
          [invitados[0]],
        );
        await bd.instalacion.query(
          `INSERT INTO identidad.equipo_perfiles (equipo_id, codigo_perfil, orden) VALUES ($1, 'PS-0142', 1), ($1, 'PS-0187', 2)`,
          [a.rows[0].id],
        );
        const deB = await html("/", cookies[1]!);
        expect(deB).toMatch(/pp-equipo__conteo[^"]*" aria-hidden="true">0</);
        const deA = await html("/", cookies[0]!);
        expect(deA).toMatch(/pp-equipo__conteo[^"]*" aria-hidden="true">2</);
        const equipos = await bd.instalacion.query(
          `SELECT invitado_id, (SELECT count(*)::int FROM identidad.equipo_perfiles p WHERE p.equipo_id = e.id) n
           FROM identidad.equipos e WHERE invitado_id = ANY($1) ORDER BY n`,
          [invitados],
        );
        expect(equipos.rows).toEqual([
          { invitado_id: invitados[1], n: 0 },
          { invitado_id: invitados[0], n: 2 },
        ]);
      });

      it("un equipo por invitado y enlace (único) y ps_portal no puede escribir perfiles en él (EP-004)", async () => {
        const { invitados, enlaceId } = await enlace({ codigos: [] });
        await bd.instalacion.query(
          `INSERT INTO identidad.equipos (enlace_id, invitado_id) VALUES ($1, $2)`,
          [enlaceId, invitados[0]],
        );
        await expect(
          bd.instalacion.query(
            `INSERT INTO identidad.equipos (enlace_id, invitado_id) VALUES ($1, $2)`,
            [enlaceId, invitados[0]],
          ),
        ).rejects.toThrow();
        const portal = bd.como("ps_portal");
        await expect(
          portal.query(
            `INSERT INTO identidad.equipo_perfiles (equipo_id, codigo_perfil, orden) SELECT id, 'PS-0142', 1 FROM identidad.equipos LIMIT 1`,
          ),
        ).rejects.toThrow();
      });
    });
  },
);
