// HU-090 (entrar con correo invitado y código), HU-144 (revocado o alterado; la revocación corta la
// sesión) y los estados tipados de ADR-0002 contra el servidor standalone del portal. Sin worker vivo,
// el propio Route Handler envía el código (modo degradado H8) al doble de correo, cuya salida se lee
// del proceso. Enlaces sembrados directamente en BD (HU-144 «Orden de construcción y pruebas»).
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { hmacCorreo } from "@ps/dominio/acceso/codigo";
import { fechaDeColombia } from "@ps/dominio/fecha/colombia";
import { generarTokenEnlace } from "@ps/dominio/enlaces/crear";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";

const NEUTRA = {
  estado: "si_tu_correo_esta_invitado_te_llego_un_codigo",
};

describe.skipIf(!HAY_BD || !hayBuild("portal"))(
  "acceso del cliente (HU-090, HU-144, ADR-0002)",
  () => {
    let bd: BdPrueba;
    let srv: ServidorPrueba;
    let entorno: Record<string, string>;
    const csrf = randomBytes(16).toString("hex");
    const cookieCsrf = `__Host-csrf=${csrf}`;
    // Una IP por caso: la capa por IP (5 fallos en 15 min) es real y no debe cruzar escenarios.
    let ip = "";
    let n = 0;
    beforeEach(() => {
      n += 1;
      ip = `10.9.${Math.floor(n / 250)}.${(n % 250) + 1}`;
    });

    const post = (ruta: string, cuerpo: unknown, cookie = "") =>
      srv.pedir(ruta, {
        method: "POST",
        body: JSON.stringify(cuerpo),
        headers: {
          "content-type": "application/json",
          origin: srv.url,
          "x-ps-csrf": csrf,
          "do-connecting-ip": ip,
          cookie: [cookieCsrf, cookie].filter(Boolean).join("; "),
        },
      });

    const lineasCorreo = (correo: string) =>
      srv
        .salida()
        .split("\n")
        .filter((l) => l.includes('"correo_doble"') && l.includes(correo));

    async function codigoEnviadoA(correo: string, previos = 0, ms = 8_000): Promise<string> {
      const fin = Date.now() + ms;
      for (;;) {
        const lineas = lineasCorreo(correo);
        const m = lineas.length > previos ? lineas.at(-1)?.match(/(\d{3}) (\d{3})/) : null;
        if (m) return m[1]! + m[2]!;
        if (Date.now() > fin) {
          const t = await bd.instalacion.query(
            `SELECT id, estado, payload, locked_by, ultimo_error FROM operacion.trabajos ORDER BY id DESC LIMIT 3`,
          );
          const w = await bd.instalacion.query(
            `SELECT tipo, fallos_ventana, fallos_dia, bloqueado_hasta, ventana_inicio FROM identidad.intentos_cliente WHERE fallos_ventana > 0 ORDER BY ventana_inicio DESC LIMIT 12`,
          );
          throw new Error(
            `no llegó código a ${correo}: ${JSON.stringify(t.rows)} intentos=${JSON.stringify(w.rows)}`,
          );
        }
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    // Enlace con token opaco (en BD solo su hash) e invitados; devuelve el token en claro.
    async function sembrarEnlace(
      opciones: {
        invitados?: string[];
        vigenteHasta?: string;
        estado?: "activo" | "revocado";
        proyecto?: string | null;
      } = {},
    ): Promise<{ token: string; enlaceId: string; invitados: Record<string, string> }> {
      const e = await bd.instalacion.query(
        `INSERT INTO identidad.enlaces (cuenta_ref, cuenta_nombre, proyecto, razon, vigente_desde, vigente_hasta, generado_por, estado)
       VALUES ('hs-1', 'Bancolombia', $1, 'Perfiles para el core bancario', now() - interval '40 days', $2, gen_random_uuid(), $3)
       RETURNING id`,
        [
          opciones.proyecto === undefined ? "Migración core" : opciones.proyecto,
          opciones.vigenteHasta ?? new Date(Date.now() + 20 * 86_400_000).toISOString(),
          opciones.estado ?? "activo",
        ],
      );
      const enlaceId = e.rows[0].id as string;
      const invitados: Record<string, string> = {};
      for (const correo of opciones.invitados ?? []) {
        const i = await bd.instalacion.query(
          `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, $2, $3) RETURNING id`,
          [enlaceId, correo, hmacCorreo(correo, entorno.EMAIL_HMAC_KEY!)],
        );
        invitados[correo] = i.rows[0].id;
      }
      const { token, hash } = generarTokenEnlace();
      await bd.instalacion.query(
        `INSERT INTO identidad.enlace_tokens (enlace_id, token_hash) VALUES ($1, $2)`,
        [enlaceId, hash],
      );
      return { token, enlaceId, invitados };
    }

    async function entrar(token: string, correo: string): Promise<string> {
      const previos = lineasCorreo(correo).length;
      expect((await post("/api/v1/acceso/codigo", { token, correo })).status).toBe(202);
      const codigo = await codigoEnviadoA(correo, previos);
      const r = await post("/api/v1/acceso/verificar", { token, correo, codigo });
      expect(r.status).toBe(204);
      return (r.headers.get("set-cookie") ?? "").split(";")[0]!;
    }

    beforeAll(async () => {
      bd = await crearBdPrueba();
      entorno = { ...entornoDev("portal"), APP_ENV: "ci", DATABASE_URL: bd.urlDe("ps_portal") };
      srv = await arrancarServidor("portal", entorno);
    }, 90_000);

    afterAll(async () => {
      await srv?.cerrar();
      await bd?.cerrar();
    });

    describe("POST /api/v1/acceso/enlace: estados tipados (ADR-0002 §3, H9)", () => {
      it("enlace vigente → 200 activo, sin inventario, y queda enlace_consultado", async () => {
        const { token, enlaceId } = await sembrarEnlace({ invitados: ["a@cliente.com"] });
        const r = await post("/api/v1/acceso/enlace", { token });
        expect(r.status).toBe(200);
        expect(await r.json()).toEqual({ estado_enlace: "activo", con_sesion: false });
        const log = await bd.instalacion.query(
          `SELECT count(*)::int n FROM identidad.accesos_log WHERE evento = 'enlace_consultado' AND enlace_id = $1`,
          [enlaceId],
        );
        expect(log.rows[0].n).toBe(1);
      });

      it("HU-144: revocado → 410 enlace_revocado", async () => {
        const { token } = await sembrarEnlace({ estado: "revocado" });
        const r = await post("/api/v1/acceso/enlace", { token });
        expect(r.status).toBe(410);
        expect(await r.json()).toEqual({ motivo: "enlace_revocado" });
      });

      it.each([
        ["token con un carácter cambiado", (t: string) => (t[0] === "A" ? "B" : "A") + t.slice(1)],
        ["token truncado", (t: string) => t.slice(0, 20)],
        ["texto cualquiera", () => "hola"],
      ])("HU-144: dirección alterada (%s) → el mismo 410 que revocado", async (_c, alterar) => {
        const { token } = await sembrarEnlace();
        const r = await post("/api/v1/acceso/enlace", { token: alterar(token) });
        expect(r.status).toBe(410);
        expect(await r.json()).toEqual({ motivo: "enlace_revocado" });
      });

      it("HU-092: vencido → 410 enlace_vencido con la fecha en que venció", async () => {
        const vencio = new Date(Date.now() - 3 * 86_400_000);
        const { token } = await sembrarEnlace({ vigenteHasta: vencio.toISOString() });
        const r = await post("/api/v1/acceso/enlace", { token });
        expect(r.status).toBe(410);
        const cuerpo = await r.json();
        expect(cuerpo.motivo).toBe("enlace_vencido");
        expect(new Date(cuerpo.vencio).getTime()).toBe(vencio.getTime());
      });

      it("entrada con campos extra → 410 revocado (sin revelar nada)", async () => {
        const { token } = await sembrarEnlace();
        const r = await post("/api/v1/acceso/enlace", { token, otro: 1 });
        expect(r.status).toBe(410);
      });
    });

    it("HU-090 happy path: invitado + código de un uso → sesión de 30 días acotada al enlace, apertura registrada", async () => {
      const { token, enlaceId, invitados } = await sembrarEnlace({
        invitados: ["mariana@bancolombia.com.co"],
      });
      const pedir = await post("/api/v1/acceso/codigo", {
        token,
        correo: " Mariana@Bancolombia.com.co ",
      });
      expect(pedir.status).toBe(202);
      expect(await pedir.json()).toEqual(NEUTRA);
      const codigo = await codigoEnviadoA("mariana@bancolombia.com.co");
      const r = await post("/api/v1/acceso/verificar", {
        token,
        correo: "mariana@bancolombia.com.co",
        codigo,
      });
      expect(r.status).toBe(204);
      const setCookie = r.headers.get("set-cookie") ?? "";
      expect(setCookie).toMatch(
        /^__Host-ps=[^;]+; Path=\/; Secure; HttpOnly; SameSite=Lax; Max-Age=\d+$/,
      );
      const maxAge = Number(setCookie.match(/Max-Age=(\d+)/)![1]);
      // Acotada a la vigencia del enlace (20 días), no los 30 por omisión.
      expect(maxAge).toBeLessThanOrEqual(20 * 86_400);
      expect(maxAge).toBeGreaterThan(19 * 86_400);
      const s = await bd.instalacion.query(
        `SELECT enlace_id, invitado_id, expira FROM identidad.sesiones_portal WHERE enlace_id = $1`,
        [enlaceId],
      );
      expect(s.rows).toHaveLength(1);
      expect(s.rows[0].invitado_id).toBe(invitados["mariana@bancolombia.com.co"]);
      const ok = await bd.instalacion.query(
        `SELECT invitado_id FROM identidad.accesos_log WHERE evento = 'verificacion_ok' AND enlace_id = $1`,
        [enlaceId],
      );
      expect(ok.rows).toEqual([{ invitado_id: invitados["mariana@bancolombia.com.co"] }]);
      // Con la sesión, la API protegida responde.
      const cookie = setCookie.split(";")[0]!;
      expect((await srv.pedir("/api/v1/catalogo", { headers: { cookie } })).status).toBe(200);
    });

    it("HU-090: la apertura NO se registra al cargar la página ni al pedir el código, solo al verificar", async () => {
      const { token, enlaceId } = await sembrarEnlace({ invitados: ["b@cliente.com"] });
      await post("/api/v1/acceso/enlace", { token });
      await post("/api/v1/acceso/codigo", { token, correo: "b@cliente.com" });
      const ok = await bd.instalacion.query(
        `SELECT count(*)::int n FROM identidad.accesos_log WHERE evento = 'verificacion_ok' AND enlace_id = $1`,
        [enlaceId],
      );
      expect(ok.rows[0].n).toBe(0);
    });

    it("HU-090 error: correo no invitado de la misma empresa → misma respuesta byte a byte, sin código, sin perfiles", async () => {
      const { token, enlaceId } = await sembrarEnlace({ invitados: ["lider@bancolombia.com.co"] });
      const invitado = await post("/api/v1/acceso/codigo", {
        token,
        correo: "lider@bancolombia.com.co",
      });
      const noInvitado = await post("/api/v1/acceso/codigo", {
        token,
        correo: "colega@bancolombia.com.co",
      });
      expect(noInvitado.status).toBe(invitado.status);
      const [a, b] = [await invitado.text(), await noInvitado.text()];
      expect(b).toBe(a);
      expect(JSON.parse(b)).toEqual(NEUTRA);
      for (const k of ["content-type", "content-length", "cache-control"])
        expect(noInvitado.headers.get(k), k).toBe(invitado.headers.get(k));
      await codigoEnviadoA("lider@bancolombia.com.co");
      await new Promise((r) => setTimeout(r, 500));
      expect(lineasCorreo("colega@bancolombia.com.co")).toHaveLength(0);
      // Ambas ramas encolaron la misma forma de trabajo; la del no invitado con ref nulo.
      const t = await bd.instalacion.query(
        `SELECT payload FROM operacion.trabajos WHERE tipo = 'enviar_codigo' AND origen = 'portal' ORDER BY id DESC LIMIT 2`,
      );
      expect(t.rows.map((f) => Object.keys(f.payload).sort())).toEqual([
        ["ambito", "ref"],
        ["ambito", "ref"],
      ]);
      expect(t.rows[0].payload).toEqual({ ref: null, ambito: "cliente" });
      const r = await post("/api/v1/acceso/verificar", {
        token,
        correo: "colega@bancolombia.com.co",
        codigo: "123456",
      });
      expect(r.status).toBe(403);
      expect(await r.json()).toEqual({ motivo: "codigo_invalido" });
      const s = await bd.instalacion.query(
        `SELECT count(*)::int n FROM identidad.sesiones_portal WHERE enlace_id = $1`,
        [enlaceId],
      );
      expect(s.rows[0].n).toBe(0);
    });

    it("HU-090: un invitado de OTRO enlace no recibe código con este enlace", async () => {
      await sembrarEnlace({ invitados: ["ajeno@cliente.com"] });
      const { token } = await sembrarEnlace({ invitados: ["propio@cliente.com"] });
      expect(
        (await post("/api/v1/acceso/codigo", { token, correo: "ajeno@cliente.com" })).status,
      ).toBe(202);
      await new Promise((r) => setTimeout(r, 800));
      expect(lineasCorreo("ajeno@cliente.com")).toHaveLength(0);
    });

    describe("HU-090 error: el código no sirve → 403 en lenguaje llano, se puede pedir otro", () => {
      it("equivocado", async () => {
        const { token } = await sembrarEnlace({ invitados: ["c1@cliente.com"] });
        await post("/api/v1/acceso/codigo", { token, correo: "c1@cliente.com" });
        const bueno = await codigoEnviadoA("c1@cliente.com");
        const malo = bueno === "000000" ? "111111" : "000000";
        const r = await post("/api/v1/acceso/verificar", {
          token,
          correo: "c1@cliente.com",
          codigo: malo,
        });
        expect(r.status).toBe(403);
        expect(await r.json()).toEqual({ motivo: "codigo_invalido" });
      });
      it("vencido", async () => {
        const { token, invitados } = await sembrarEnlace({ invitados: ["c2@cliente.com"] });
        await post("/api/v1/acceso/codigo", { token, correo: "c2@cliente.com" });
        const codigo = await codigoEnviadoA("c2@cliente.com");
        await bd.instalacion.query(
          `UPDATE identidad.codigos_cliente SET expira_en = now() - interval '1 second' WHERE invitado_id = $1`,
          [invitados["c2@cliente.com"]],
        );
        const r = await post("/api/v1/acceso/verificar", {
          token,
          correo: "c2@cliente.com",
          codigo,
        });
        expect(r.status).toBe(403);
        expect(await r.json()).toEqual({ motivo: "codigo_invalido" });
      });
      it("ya usado", async () => {
        const { token } = await sembrarEnlace({ invitados: ["c3@cliente.com"] });
        await post("/api/v1/acceso/codigo", { token, correo: "c3@cliente.com" });
        const codigo = await codigoEnviadoA("c3@cliente.com");
        expect(
          (await post("/api/v1/acceso/verificar", { token, correo: "c3@cliente.com", codigo }))
            .status,
        ).toBe(204);
        const r = await post("/api/v1/acceso/verificar", {
          token,
          correo: "c3@cliente.com",
          codigo,
        });
        expect(r.status).toBe(403);
        expect(await r.json()).toEqual({ motivo: "codigo_invalido" });
      });
      it("tras un código que no sirve, pedir otro envía uno nuevo que sí entra", async () => {
        const { token } = await sembrarEnlace({ invitados: ["c4@cliente.com"] });
        await post("/api/v1/acceso/codigo", { token, correo: "c4@cliente.com" });
        await codigoEnviadoA("c4@cliente.com");
        await post("/api/v1/acceso/verificar", {
          token,
          correo: "c4@cliente.com",
          codigo: "999999",
        });
        const cookie = await entrar(token, "c4@cliente.com");
        expect(cookie).toMatch(/^__Host-ps=/);
      });
    });

    it("HU-090 edge: cinco fallos → espera; ni el código correcto entra; lo mismo para un no invitado", async () => {
      const { token, enlaceId } = await sembrarEnlace({ invitados: ["d@cliente.com"] });
      await post("/api/v1/acceso/codigo", { token, correo: "d@cliente.com" });
      const bueno = await codigoEnviadoA("d@cliente.com");
      const malo = bueno === "000000" ? "111111" : "000000";
      const respuestas: number[] = [];
      for (const correo of ["d@cliente.com", "nadie@cliente.com"]) {
        // Otra IP para el segundo correo: se mide la capa por enlace+correo, no la de IP.
        if (correo === "nadie@cliente.com") ip = "10.8.0.1";
        for (let k = 0; k < 5; k++)
          respuestas.push(
            (await post("/api/v1/acceso/verificar", { token, correo, codigo: malo })).status,
          );
      }
      expect(respuestas.slice(0, 4)).toEqual([403, 403, 403, 403]);
      expect(respuestas.slice(5, 9)).toEqual([403, 403, 403, 403]);
      const conBueno = await post("/api/v1/acceso/verificar", {
        token,
        correo: "d@cliente.com",
        codigo: bueno,
      });
      const noInvitado = await post("/api/v1/acceso/verificar", {
        token,
        correo: "nadie@cliente.com",
        codigo: bueno,
      });
      expect(conBueno.status).toBe(429);
      expect(noInvitado.status).toBe(429);
      const [a, b] = [await conBueno.json(), await noInvitado.json()];
      expect(a.motivo).toBe("en_espera");
      expect(Object.keys(a).sort()).toEqual(["hasta", "motivo"]);
      expect(Object.keys(b).sort()).toEqual(Object.keys(a).sort());
      expect(new Date(a.hasta).getTime()).toBeGreaterThan(Date.now());
      const s = await bd.instalacion.query(
        `SELECT count(*)::int n FROM identidad.sesiones_portal WHERE enlace_id = $1`,
        [enlaceId],
      );
      expect(s.rows[0].n).toBe(0);
    });

    describe("HU-090 edge: alcance de la sesión", () => {
      it("vigente, mismo dispositivo → entra directamente (con_sesion)", async () => {
        const { token } = await sembrarEnlace({ invitados: ["e1@cliente.com"] });
        const cookie = await entrar(token, "e1@cliente.com");
        const r = await post("/api/v1/acceso/enlace", { token }, cookie);
        expect(await r.json()).toEqual({ estado_enlace: "activo", con_sesion: true });
        expect((await srv.pedir("/", { headers: { cookie } })).status).toBe(200);
      });
      it("vigente, otro dispositivo (sin cookie) → la puerta", async () => {
        const { token } = await sembrarEnlace({ invitados: ["e2@cliente.com"] });
        await entrar(token, "e2@cliente.com");
        const r = await post("/api/v1/acceso/enlace", { token });
        expect(await r.json()).toEqual({ estado_enlace: "activo", con_sesion: false });
      });
      it("sesión de OTRO enlace no cuenta: prevalece el token (H5)", async () => {
        const a = await sembrarEnlace({ invitados: ["e3@cliente.com"] });
        const b = await sembrarEnlace({ invitados: ["e3@cliente.com"] });
        const cookie = await entrar(a.token, "e3@cliente.com");
        const r = await post("/api/v1/acceso/enlace", { token: b.token }, cookie);
        expect(await r.json()).toEqual({ estado_enlace: "activo", con_sesion: false });
      });
      it("vencido, mismo dispositivo → pantalla de renovación, no el portal", async () => {
        const { token, enlaceId } = await sembrarEnlace({ invitados: ["e4@cliente.com"] });
        const cookie = await entrar(token, "e4@cliente.com");
        await bd.instalacion.query(
          `UPDATE identidad.enlaces SET vigente_hasta = now() - interval '1 minute' WHERE id = $1`,
          [enlaceId],
        );
        const r = await post("/api/v1/acceso/enlace", { token }, cookie);
        expect(r.status).toBe(410);
        expect((await r.json()).motivo).toBe("enlace_vencido");
        const pagina = await srv.pedir("/", { headers: { cookie } });
        expect(pagina.status).toBe(307);
        expect(pagina.headers.get("location")).toMatch(/\/acceso\?motivo=enlace_vencido$/);
        // HU-092 edge: al entrar directamente ve que el enlace venció, cuándo, y dónde escribir su correo.
        const vencido = await (await srv.pedir("/acceso?motivo=enlace_vencido", { headers: { cookie } })).text();
        expect(vencido).toContain("ya venció");
        const hasta = await bd.instalacion.query(`SELECT vigente_hasta FROM identidad.enlaces WHERE id = $1`, [enlaceId]);
        expect(vencido).toMatch(new RegExp(`<time[^>]*>${fechaDeColombia(hasta.rows[0].vigente_hasta)}</time>`));
        expect(vencido).toMatch(/<input[^>]*type="email"/);
      });
      it("HU-144: la revocación corta una sesión abierta en la siguiente petición", async () => {
        const { token, enlaceId } = await sembrarEnlace({ invitados: ["e5@cliente.com"] });
        const cookie = await entrar(token, "e5@cliente.com");
        expect((await srv.pedir("/api/v1/catalogo", { headers: { cookie } })).status).toBe(200);
        await bd.instalacion.query(
          `UPDATE identidad.enlaces SET estado = 'revocado', revocado_en = now() WHERE id = $1`,
          [enlaceId],
        );
        const api = await srv.pedir("/api/v1/catalogo", { headers: { cookie } });
        expect(api.status).toBe(401);
        expect(await api.json()).toEqual({ motivo: "enlace_revocado" });
        const pagina = await srv.pedir("/", { headers: { cookie } });
        expect(pagina.status).toBe(307);
        expect(pagina.headers.get("location")).toMatch(/\/acceso\?motivo=enlace_revocado$/);
        const enlace = await post("/api/v1/acceso/enlace", { token }, cookie);
        expect(await enlace.json()).toEqual({ motivo: "enlace_revocado" });
      });
    });

    it("tope de emisión por sujeto (R-85): el 4.º código en 15 min no se envía, con la misma respuesta", async () => {
      const { token } = await sembrarEnlace({ invitados: ["f@cliente.com"] });
      for (let k = 0; k < 3; k++) {
        const previos = lineasCorreo("f@cliente.com").length;
        await post("/api/v1/acceso/codigo", { token, correo: "f@cliente.com" });
        await codigoEnviadoA("f@cliente.com", previos);
      }
      const cuarto = await post("/api/v1/acceso/codigo", { token, correo: "f@cliente.com" });
      expect(cuarto.status).toBe(202);
      expect(await cuarto.json()).toEqual(NEUTRA);
      await new Promise((r) => setTimeout(r, 800));
      expect(lineasCorreo("f@cliente.com")).toHaveLength(3);
    });

    it("verificar un enlace distinto reemplaza la sesión anterior de este dispositivo (H5)", async () => {
      const a = await sembrarEnlace({ invitados: ["g@cliente.com"] });
      const b = await sembrarEnlace({ invitados: ["g@cliente.com"] });
      const vieja = await entrar(a.token, "g@cliente.com");
      const previos = lineasCorreo("g@cliente.com").length;
      await post("/api/v1/acceso/codigo", { token: b.token, correo: "g@cliente.com" }, vieja);
      const codigo = await codigoEnviadoA("g@cliente.com", previos);
      const r = await post(
        "/api/v1/acceso/verificar",
        { token: b.token, correo: "g@cliente.com", codigo },
        vieja,
      );
      expect(r.status).toBe(204);
      const restantes = await bd.instalacion.query(
        `SELECT enlace_id FROM identidad.sesiones_portal WHERE invitado_id IN (SELECT id FROM identidad.enlace_invitados WHERE correo = 'g@cliente.com')`,
      );
      expect(restantes.rows).toEqual([{ enlace_id: b.enlaceId }]);
    });

    it("un invitado desactivado por Talento Humano no recibe código (misma respuesta neutra)", async () => {
      const { token, invitados } = await sembrarEnlace({ invitados: ["baja@cliente.com"] });
      await bd.instalacion.query(
        `UPDATE identidad.enlace_invitados SET activo = false WHERE id = $1`,
        [invitados["baja@cliente.com"]],
      );
      const r = await post("/api/v1/acceso/codigo", { token, correo: "baja@cliente.com" });
      expect(r.status).toBe(202);
      expect(await r.json()).toEqual(NEUTRA);
      await new Promise((res) => setTimeout(res, 800));
      expect(lineasCorreo("baja@cliente.com")).toHaveLength(0);
    });

    it("con los intentos agotados, pedir código no envía nada (la espera no se salta pidiendo otro)", async () => {
      const { token } = await sembrarEnlace({ invitados: ["h@cliente.com"] });
      for (let k = 0; k < 5; k++)
        await post("/api/v1/acceso/verificar", {
          token,
          correo: "h@cliente.com",
          codigo: "000000",
        });
      ip = "10.7.0.1"; // otra IP: solo cuenta el bloqueo del par enlace+correo
      const r = await post("/api/v1/acceso/codigo", { token, correo: "h@cliente.com" });
      expect(r.status).toBe(202);
      expect(await r.json()).toEqual(NEUTRA);
      await new Promise((res) => setTimeout(res, 800));
      expect(lineasCorreo("h@cliente.com")).toHaveLength(0);
    });
  },
);
