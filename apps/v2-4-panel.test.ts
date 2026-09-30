// V2-4 en el panel (ADR-0002 H8): con el worker detenido y Mailgun simulado lento (3-5 s), pedir un
// código tarda lo mismo esté o no inscrito el correo (N = 200 por rama, Mann-Whitney α = 0,05 y
// diferencia de medianas < 5 ms); 4 peticiones concurrentes no agotan el pool; y con el worker vivo
// pero con su ciclo retrasado, cada petición genera exactamente un código. Contra el servidor
// standalone real con `ps_panel` y `ps_worker` por PgBouncer, sin superusuario.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { hmacCorreo } from "@ps/dominio/acceso/codigo";
import { DobleCorreo } from "@ps/infra/mailgun/index";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import { mannWhitney, mediana } from "@ps/infra/pruebas/estadistica";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { vuelta } from "./worker/src/despacho";

const N = Number(process.env.V24_N ?? "200");
const CALENTAMIENTO = 20;

describe.skipIf(!HAY_BD || !hayBuild("panel"))(
  "V2-4 panel: tiempos por rama en modo degradado",
  () => {
    let bd: BdPrueba;
    let srv: ServidorPrueba;
    let entorno: Record<string, string>;
    const csrf = randomBytes(16).toString("hex");

    const pedirCodigo = async (
      correo: string,
    ): Promise<{ ms: number; status: number; cuerpo: string }> => {
      const t0 = performance.now();
      const r = await srv.pedir("/api/v1/acceso/codigo", {
        method: "POST",
        body: JSON.stringify({ correo }),
        headers: {
          "content-type": "application/json",
          origin: srv.url,
          "x-ps-csrf": csrf,
          cookie: `__Host-csrf=${csrf}`,
        },
      });
      const cuerpo = await r.text();
      return { ms: performance.now() - t0, status: r.status, cuerpo };
    };

    const inscribir = async (prefijo: string, n: number) => {
      const correos = Array.from({ length: n }, (_, i) => `${prefijo}${i}@trycore.com`);
      await bd.instalacion.query(
        `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol)
       SELECT c, h, 'observador' FROM unnest($1::text[], $2::bytea[]) AS t(c, h)`,
        [correos, correos.map((c) => hmacCorreo(c, entorno.EMAIL_HMAC_KEY!))],
      );
      return correos;
    };

    beforeAll(async () => {
      bd = await crearBdPrueba();
      entorno = {
        ...entornoDev("panel"),
        APP_ENV: "ci",
        DATABASE_URL: bd.urlDe("ps_panel"),
        DOBLE_MAILGUN_LATENCIA_MS: "3000-5000",
      };
      srv = await arrancarServidor("panel", entorno);
    }, 90_000);

    afterAll(async () => {
      await srv?.cerrar();
      await bd?.cerrar();
    });

    it(`N = ${N} por rama: inscrito y no inscrito indistinguibles (Mann-Whitney p ≥ 0,05, Δ mediana < 5 ms)`, async () => {
      // Sin fila en worker_ciclo el worker cuenta como caído: modo degradado.
      expect(
        (await bd.instalacion.query(`SELECT count(*)::int n FROM operacion.worker_ciclo`)).rows[0]
          .n,
      ).toBe(0);
      // Un correo distinto por petición para que el tope de emisión (R-85) no cambie de rama.
      const inscritos = await inscribir("v24-", N + CALENTAMIENTO);
      const ajenos = Array.from(
        { length: N + CALENTAMIENTO },
        (_, i) => `ajeno-v24-${i}@trycore.com`,
      );

      const tInscrito: number[] = [];
      const tAjeno: number[] = [];
      const cuerpos = new Set<string>();
      for (let i = 0; i < N + CALENTAMIENTO; i++) {
        // Orden aleatorio dentro de cada par para no sesgar por la posición.
        const primeroInscrito = Math.random() < 0.5;
        const orden = primeroInscrito ? [inscritos[i]!, ajenos[i]!] : [ajenos[i]!, inscritos[i]!];
        for (const correo of orden) {
          const r = await pedirCodigo(correo);
          expect(r.status).toBe(202);
          cuerpos.add(r.cuerpo);
          if (i >= CALENTAMIENTO) (correo.startsWith("ajeno") ? tAjeno : tInscrito).push(r.ms);
        }
      }
      expect(cuerpos.size).toBe(1);

      const mw = mannWhitney(tInscrito, tAjeno);
      const delta = Math.abs(mediana(tInscrito) - mediana(tAjeno));
      console.log(
        JSON.stringify({
          v24: "panel",
          n: N,
          mediana_inscrito_ms: +mediana(tInscrito).toFixed(2),
          mediana_ajeno_ms: +mediana(tAjeno).toFixed(2),
          delta_ms: +delta.toFixed(2),
          p: +mw.p.toFixed(4),
        }),
      );
      expect(delta).toBeLessThan(5);
      expect(mw.p).toBeGreaterThanOrEqual(0.05);

      // El modo degradado actuó de verdad: llegaron códigos a inscritos (tras la latencia) y a ningún ajeno.
      await new Promise((r) => setTimeout(r, 5_500));
      expect(srv.salida()).toMatch(/"correo_doble".*v24-\d+@trycore\.com/);
      expect(srv.salida()).not.toMatch(/"correo_doble".*ajeno-v24/);
    }, 600_000);

    it("4 peticiones concurrentes con Mailgun a 3-5 s no agotan el pool: cada una responde en < 1 s", async () => {
      const correos = await inscribir("concurrente-", 4);
      await new Promise((r) => setTimeout(r, 5_500)); // que terminen los envíos lentos de la prueba anterior
      const r = await Promise.all(correos.map((c) => pedirCodigo(c)));
      for (const x of r) {
        expect(x.status).toBe(202);
        expect(x.ms).toBeLessThan(1_000);
      }
      // El pool sigue sirviendo mientras los envíos degradados esperan a Mailgun.
      const siguiente = await pedirCodigo("despues-concurrente@trycore.com");
      expect(siguiente.ms).toBeLessThan(1_000);
    }, 60_000);

    it("carrera: worker vivo con worker_ciclo retrasado → exactamente un código por petición", async () => {
      await new Promise((r) => setTimeout(r, 5_500));
      const correos = await inscribir("carrera-", 10);
      const worker = bd.como("ps_worker");
      const ctx = {
        bd: worker,
        correo: new DobleCorreo(),
        peppers: {
          cliente: entorno.OTP_PEPPER_CLIENTE ?? "c".repeat(40),
          panel: entorno.OTP_PEPPER_PANEL!,
        },
        reclamo: "worker-carrera",
        registrar: () => {},
      };
      const retrasar = () =>
        bd.instalacion.query(
          `INSERT INTO operacion.worker_ciclo (id, ultima_vuelta) VALUES (1, now() - interval '3 minutes')
         ON CONFLICT (id) DO UPDATE SET ultima_vuelta = excluded.ultima_vuelta`,
        );
      for (const correo of correos) {
        await retrasar();
        // La petición ve el worker caído y procesa su fila con after(); el worker la reclama a la vez.
        await Promise.all([pedirCodigo(correo), vuelta(ctx)]);
        await retrasar();
        await vuelta(ctx);
      }
      await new Promise((r) => setTimeout(r, 6_000));
      await vuelta(ctx);
      const r = await bd.instalacion.query(
        `SELECT u.correo, count(c.id)::int AS codigos
         FROM identidad_panel.usuarios_panel u
         LEFT JOIN identidad_panel.codigos_panel c ON c.usuario_id = u.id
        WHERE u.correo = ANY($1)
        GROUP BY u.correo`,
        [correos],
      );
      expect(r.rows).toHaveLength(correos.length);
      for (const f of r.rows) expect(f, f.correo).toMatchObject({ codigos: 1 });
    }, 120_000);
  },
);
