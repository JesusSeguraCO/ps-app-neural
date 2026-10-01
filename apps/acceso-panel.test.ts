// HU-123 (entrar al panel con identidad corporativa) y V8-5 (CSRF) contra el servidor standalone del
// panel. Sin worker vivo, el propio Route Handler envía el código (modo degradado H8) al doble de correo,
// cuya salida se lee del proceso.
import { createHash, randomBytes } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { hmacCorreo } from "@ps/dominio/acceso/codigo";
import { MatrizPermisos } from "@ps/dominio/acceso/permisos";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  RAIZ,
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";

describe.skipIf(!HAY_BD || !hayBuild("panel"))("acceso al panel (HU-123, V8-5, H8)", () => {
  let bd: BdPrueba;
  let srv: ServidorPrueba;
  let entorno: Record<string, string>;
  const csrf = randomBytes(16).toString("hex");
  const cookieCsrf = `__Host-csrf=${csrf}`;

  const post = (ruta: string, cuerpo: unknown, extra: Record<string, string> = {}) =>
    srv.pedir(ruta, {
      method: "POST",
      body: JSON.stringify(cuerpo),
      headers: {
        "content-type": "application/json",
        origin: srv.url,
        "x-ps-csrf": csrf,
        cookie: cookieCsrf,
        ...extra,
      },
    });

  async function codigoEnviadoA(correo: string, ms = 8_000): Promise<string> {
    const fin = Date.now() + ms;
    for (;;) {
      const lineas = srv
        .salida()
        .split("\n")
        .filter((l) => l.includes('"correo_doble"') && l.includes(correo));
      const m = lineas.at(-1)?.match(/(\d{3}) (\d{3})/);
      if (m) return m[1]! + m[2]!;
      if (Date.now() > fin) throw new Error(`no llegó código a ${correo}`);
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  beforeAll(async () => {
    bd = await crearBdPrueba();
    entorno = {
      ...entornoDev("panel"),
      APP_ENV: "ci",
      DATABASE_URL: bd.urlDe("ps_panel"),
      // Buzón muerto de quien salió de la empresa (HU-123): el doble lo acepta y nunca lo entrega.
      DOBLE_MAILGUN_REBOTA: "salio@trycore.com",
    };
    await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('ana@trycore.com', $1, 'administrador')`,
      [hmacCorreo("ana@trycore.com", entorno.EMAIL_HMAC_KEY!)],
    );
    srv = await arrancarServidor("panel", entorno);
  }, 90_000);

  afterAll(async () => {
    await srv?.cerrar();
    await bd?.cerrar();
  });

  describe("CSRF (V8-5): 403 y ningún cambio", () => {
    const casos: Array<[string, Record<string, string>]> = [
      ["sin cabecera CSRF", { "x-ps-csrf": "" }],
      ["con token erróneo", { "x-ps-csrf": "otro" }],
      ["con Origin de otro subdominio de trycore.com", { origin: "https://people.trycore.com" }],
      ["sin Origin ni Referer", { origin: "" }],
    ];
    it.each(casos)("%s", async (_caso, extra) => {
      const antes = (await bd.instalacion.query(`SELECT count(*)::int n FROM operacion.trabajos`))
        .rows[0].n;
      const cabeceras: Record<string, string> = {};
      for (const [k, v] of Object.entries(extra)) if (v) cabeceras[k] = v;
      const r = await srv.pedir("/api/v1/acceso/codigo", {
        method: "POST",
        body: JSON.stringify({ correo: "ana@trycore.com" }),
        headers: {
          "content-type": "application/json",
          cookie: cookieCsrf,
          ...(extra.origin === "" ? {} : { origin: extra.origin ?? srv.url }),
          ...(extra["x-ps-csrf"] === "" ? {} : { "x-ps-csrf": extra["x-ps-csrf"] ?? csrf }),
        },
      });
      expect(r.status).toBe(403);
      expect(
        (await bd.instalacion.query(`SELECT count(*)::int n FROM operacion.trabajos`)).rows[0].n,
      ).toBe(antes);
    });
  });

  it("HU-123 happy path: correo inscrito + código de un uso → entra con su rol, sin contraseña, identificado por correo", async () => {
    const pedir = await post("/api/v1/acceso/codigo", { correo: "Ana@Trycore.com" });
    expect(pedir.status).toBe(202);
    const codigo = await codigoEnviadoA("ana@trycore.com");
    const r = await post("/api/v1/acceso/verificar", { correo: "ana@trycore.com", codigo });
    expect(r.status).toBe(204);
    const setCookie = r.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(
      /__Host-pp=[^;]+; Path=\/; Secure; HttpOnly; SameSite=Lax; Max-Age=43200/,
    );
    const sesion = setCookie.split(";")[0]!;
    const inicio = await srv.pedir("/", { headers: { cookie: sesion } });
    expect(inicio.status).toBe(200);
    const html = await inicio.text();
    expect(html).toContain("ana@trycore.com");
    // Marco del panel (admin-shell): menú canónico de 12 destinos, deshabilitados hasta su épica.
    const destinos = [
      "Inventario", "Importar", "Vigencia", "Catálogos", "Léxico",
      "Enlaces", "Peticiones", "Colocados", "Demanda",
      "Medición", "Envíos", "Fallos",
    ];
    // Habilitados por la épica que los entregó: Enlaces y Peticiones (EP-001), Catálogos, Léxico,
    // Inventario, Importar y Vigencia (EP-006).
    const habilitados = ["Enlaces", "Peticiones", "Catálogos", "Léxico", "Inventario", "Importar", "Vigencia"];
    for (const d of destinos.filter((x) => !habilitados.includes(x))) expect(html, d).toMatch(new RegExp(`aria-disabled="true"[^>]*>(<svg[\\s\\S]*?</svg>)?${d}<`));
    expect(html.match(/class="pp-sidelink[^"]*"[^>]*aria-disabled="true"/g)?.length).toBe(5);
    expect(html).toMatch(/<a class="pp-sidelink" href="\/enlaces">/);
    expect(html).toMatch(/<a class="pp-sidelink" href="\/catalogos">/);
    expect(html).toMatch(/<a class="pp-sidelink" href="\/lexico">/);
    expect(html).toMatch(/<a class="pp-sidelink" href="\/inventario">/);
    expect(html).toMatch(/<a class="pp-sidelink" href="\/importar">/);
    expect(html).toMatch(/<a class="pp-sidelink" href="\/vigencia">/);
    expect(html).toContain(">Administración<");
    expect(html).toMatch(/Sesión hasta las \d{1,2}:\d{2}(\s|&nbsp;)[ap]\. m\./);
    expect(html).toContain("Cerrar sesión");
    // El código sirve una vez.
    expect(
      (await post("/api/v1/acceso/verificar", { correo: "ana@trycore.com", codigo })).status,
    ).toBe(403);
    // Salir cierra la sesión: la siguiente petición vuelve a la puerta.
    expect(
      (await post("/api/v1/acceso/salir", {}, { cookie: `${cookieCsrf}; ${sesion}` })).status,
    ).toBe(204);
    expect((await srv.pedir("/", { headers: { cookie: sesion } })).status).toBe(307);
  }, 30_000);

  it("R-85: pedir códigos en bucle no pasa del tope de emisión y la respuesta sigue siendo neutra", async () => {
    await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('bucle@trycore.com', $1, 'observador')`,
      [hmacCorreo("bucle@trycore.com", entorno.EMAIL_HMAC_KEY!)],
    );
    const respuestas = [];
    for (let i = 0; i < 5; i++)
      respuestas.push(
        await (await post("/api/v1/acceso/codigo", { correo: "bucle@trycore.com" })).text(),
      );
    expect(new Set(respuestas).size).toBe(1);
    await new Promise((r) => setTimeout(r, 2_000));
    const enviados = srv
      .salida()
      .split("\n")
      .filter((l) => l.includes('"correo_doble"') && l.includes("bucle@trycore.com"));
    expect(enviados.length).toBe(3);
  }, 30_000);

  describe("límite de intentos en tres capas (ADR-0002 §2), de punta a punta", () => {
    const FALLO = JSON.stringify({ motivo: "codigo_invalido" });
    const inscribir = (correo: string) =>
      bd.instalacion.query(
        `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ($1, $2, 'observador')`,
        [correo, hmacCorreo(correo, entorno.EMAIL_HMAC_KEY!)],
      );
    const verificar = (correo: string, codigo: string, ip: string) =>
      post("/api/v1/acceso/verificar", { correo, codigo }, { "do-connecting-ip": ip });
    const erroneo = (codigo: string) => String((Number(codigo) + 1) % 1_000_000).padStart(6, "0");
    const filaPar = async (correo: string) =>
      (
        await bd.instalacion.query(
          `SELECT fallos_ventana, fallos_dia, bloqueado_hasta FROM identidad_panel.intentos_panel WHERE clave = $1`,
          [hmacCorreo(correo, entorno.EMAIL_HMAC_KEY!)],
        )
      ).rows[0];

    it("5 fallos en 15 min por correo bloquean incluso el código bueno, con el mismo 403; pasada la ventana, entra", async () => {
      const correo = "ventana@trycore.com";
      await inscribir(correo);
      await post("/api/v1/acceso/codigo", { correo }, { "do-connecting-ip": "10.1.0.1" });
      const codigo = await codigoEnviadoA(correo);
      // IPs distintas: se mide la capa del par, no la de IP.
      for (let i = 0; i < 5; i++) {
        const r = await verificar(correo, erroneo(codigo), `10.1.1.${i}`);
        expect(r.status).toBe(403);
        expect(await r.text()).toBe(FALLO);
      }
      const bloqueado = await verificar(correo, codigo, "10.1.2.1");
      expect(bloqueado.status).toBe(403);
      expect(await bloqueado.text()).toBe(FALLO);
      // El bloqueo no suma más fallos.
      expect((await filaPar(correo)).fallos_ventana).toBe(5);

      await bd.instalacion.query(
        `UPDATE identidad_panel.intentos_panel SET ventana_inicio = ventana_inicio - interval '16 minutes'
          WHERE clave = $1`,
        [hmacCorreo(correo, entorno.EMAIL_HMAC_KEY!)],
      );
      expect((await verificar(correo, codigo, "10.1.2.1")).status).toBe(204);
    }, 30_000);

    it("5 fallos en 15 min desde una IP bloquean esa IP para cualquier correo, no a otra IP", async () => {
      const correo = "porip@trycore.com";
      await inscribir(correo);
      await post("/api/v1/acceso/codigo", { correo }, { "do-connecting-ip": "10.2.0.1" });
      const codigo = await codigoEnviadoA(correo);
      for (let i = 0; i < 5; i++) {
        expect((await verificar(`tanteo${i}@trycore.com`, "000000", "10.2.9.9")).status).toBe(403);
      }
      const desdeLaIp = await verificar(correo, codigo, "10.2.9.9");
      expect(desdeLaIp.status).toBe(403);
      expect(await desdeLaIp.text()).toBe(FALLO);
      expect((await verificar(correo, codigo, "10.2.0.1")).status).toBe(204);
    }, 30_000);

    it("el fallo 20 del día bloquea 24 h con alerta: ni el código bueno ni uno nuevo pasan aunque se abra la ventana", async () => {
      const correo = "diario@trycore.com";
      await inscribir(correo);
      await post("/api/v1/acceso/codigo", { correo }, { "do-connecting-ip": "10.3.0.1" });
      const codigo = await codigoEnviadoA(correo);
      const clave = hmacCorreo(correo, entorno.EMAIL_HMAC_KEY!);
      // 19 fallos previos del día, fuera de la ventana corta.
      await bd.instalacion.query(
        `UPDATE identidad_panel.intentos_panel
            SET fallos_dia = 19, fallos_ventana = 0, dia_inicio = now() - interval '2 hours'
          WHERE clave = $1`,
        [clave],
      );
      expect((await verificar(correo, erroneo(codigo), "10.3.1.1")).status).toBe(403);
      const fila = await filaPar(correo);
      expect(fila.fallos_dia).toBe(20);
      const horas = (new Date(fila.bloqueado_hasta).getTime() - Date.now()) / 3_600_000;
      expect(horas).toBeGreaterThan(23.9);
      expect(horas).toBeLessThanOrEqual(24);
      const alertas = await bd.instalacion.query(
        `SELECT count(*)::int n FROM identidad.accesos_log WHERE evento = 'bloqueo' AND correo_hash = $1`,
        [clave],
      );
      expect(alertas.rows[0].n).toBe(1);

      await bd.instalacion.query(
        `UPDATE identidad_panel.intentos_panel SET ventana_inicio = now() - interval '16 minutes', fallos_ventana = 0
          WHERE clave = $1`,
        [clave],
      );
      const r = await verificar(correo, codigo, "10.3.1.2");
      expect(r.status).toBe(403);
      expect(await r.text()).toBe(FALLO);
      // Pedir otro código durante el bloqueo: misma respuesta neutra y nada llega al buzón.
      const antes = srv
        .salida()
        .split("\n")
        .filter((l) => l.includes('"correo_doble"') && l.includes(correo)).length;
      expect(
        (await post("/api/v1/acceso/codigo", { correo }, { "do-connecting-ip": "10.3.1.3" }))
          .status,
      ).toBe(202);
      await new Promise((res) => setTimeout(res, 1_500));
      const despues = srv
        .salida()
        .split("\n")
        .filter((l) => l.includes('"correo_doble"') && l.includes(correo)).length;
      expect(despues).toBe(antes);
    }, 30_000);
  });

  it("HU-123 correo sin inscribir: misma respuesta que uno inscrito, sin código ni datos", async () => {
    const inscrito = await post("/api/v1/acceso/codigo", { correo: "ana@trycore.com" });
    const noInscrito = await post("/api/v1/acceso/codigo", { correo: "nadie@trycore.com" });
    expect(noInscrito.status).toBe(inscrito.status);
    expect(await noInscrito.text()).toBe(await inscrito.text());
    await new Promise((r) => setTimeout(r, 1_500));
    expect(srv.salida()).not.toMatch(/"correo_doble".*nadie@trycore\.com/);
    expect(
      (await post("/api/v1/acceso/verificar", { correo: "nadie@trycore.com", codigo: "123456" }))
        .status,
    ).toBe(403);
  }, 30_000);

  it("HU-123 buzón desactivado: sigue inscrito y activo, el código se envía pero no llega y no entra, sin baja manual en la auditoría", async () => {
    // Nadie lo da de baja: sigue en la lista y activo. Lo que murió es su buzón corporativo.
    await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('salio@trycore.com', $1, 'observador')`,
      [hmacCorreo("salio@trycore.com", entorno.EMAIL_HMAC_KEY!)],
    );
    expect((await post("/api/v1/acceso/codigo", { correo: "salio@trycore.com" })).status).toBe(202);
    await new Promise((r) => setTimeout(r, 1_500));
    // Se intentó entregar (es un inscrito activo) y el buzón lo rebotó: el código nunca llegó.
    expect(srv.salida()).toMatch(/"correo_doble_rebote".*salio@trycore\.com/);
    expect(srv.salida()).not.toMatch(/"correo_doble".*salio@trycore\.com/);
    const codigos = await bd.instalacion.query(
      `SELECT count(*)::int n FROM identidad_panel.codigos_panel c JOIN identidad_panel.usuarios_panel u ON u.id = c.usuario_id WHERE u.correo = 'salio@trycore.com'`,
    );
    expect(codigos.rows[0].n).toBe(1);
    expect(
      (await post("/api/v1/acceso/verificar", { correo: "salio@trycore.com", codigo: "123456" })).status,
    ).toBe(403);
    const bajas = await bd.instalacion.query(
      `SELECT count(*)::int n FROM auditoria.auditoria WHERE entidad = 'usuarios_panel' AND campo = 'activo'`,
    );
    expect(bajas.rows[0].n).toBe(0);
  }, 30_000);

  it("HU-123 sesión de 12 h: al cumplirse, el panel pide un código nuevo", async () => {
    const id = randomBytes(16).toString("hex");
    const u = await bd.instalacion.query(
      `SELECT id FROM identidad_panel.usuarios_panel WHERE correo = 'ana@trycore.com'`,
    );
    await bd.instalacion.query(
      `INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, creada, ultima_actividad, expira)
       VALUES ($1, $2, now() - interval '12 hours', now() - interval '1 minute', now() + interval '1 hour')`,
      [createHash("sha256").update(id).digest(), u.rows[0].id],
    );
    const r = await srv.pedir("/", { headers: { cookie: `__Host-pp=${id}` } });
    expect(r.status).toBe(307);
    expect(r.headers.get("location")).toContain("/acceso?motivo=sesion_expirada");
    // La puerta explica la causa real y precarga el correo de la sesión vencida.
    const puerta = await srv.pedir("/acceso?motivo=sesion_expirada", {
      headers: { cookie: `__Host-pp=${id}` },
    });
    const html = await puerta.text();
    expect(html).toMatch(/Entraste (hoy|el [^<]+) a las <span class="pa-num">\d{1,2}:\d{2}/);
    expect(html).toContain("y la sesión dura 12 horas");
    expect(html).toMatch(/value="ana@trycore\.com"/);
    // Sin cookie: texto general y campo vacío.
    const sinCookie = await (await srv.pedir("/acceso?motivo=sesion_expirada")).text();
    expect(sinCookie).toContain("La sesión dura 12 horas y se cierra tras 60 minutos sin actividad.");
    expect(sinCookie).not.toContain("ana@trycore.com");
  });

  it("HU-123 el panel no se alcanza desde el portal: nada del portal apunta al host del panel", () => {
    const dir = `${RAIZ}apps/portal/.next/standalone/apps/portal/.next`;
    const ficheros: string[] = [];
    const recorrer = (d: string) => {
      for (const f of readdirSync(d)) {
        const p = path.join(d, f);
        if (statSync(p).isDirectory()) recorrer(p);
        else if (/\.(js|html|json|rsc|txt)$/.test(f)) ficheros.push(p);
      }
    };
    recorrer(dir);
    expect(ficheros.length).toBeGreaterThan(0);
    for (const f of ficheros)
      expect(readFileSync(f, "utf8"), f).not.toMatch(/people-panel|panel\.trycore/);
  });

  it("V2-3: cada route.ts mutante del panel declara una acción de MatrizPermisos, salvo las públicas", () => {
    const publicas = new Set(
      JSON.parse(readFileSync(`${RAIZ}apps/panel/rutas-publicas.json`, "utf8")),
    );
    const base = `${RAIZ}apps/panel/app`;
    const rutas: string[] = [];
    const recorrer = (d: string) => {
      for (const f of readdirSync(d)) {
        const p = path.join(d, f);
        if (statSync(p).isDirectory()) recorrer(p);
        else if (f === "route.ts") rutas.push(p);
      }
    };
    recorrer(base);
    for (const r of rutas) {
      const url = "/" + path.relative(base, path.dirname(r)).split(path.sep).join("/");
      const fuente = readFileSync(r, "utf8");
      const mutantes = [...fuente.matchAll(/export const (POST|PUT|PATCH|DELETE)\b/g)].map(
        (m) => m[1]!,
      );
      if (!mutantes.length || publicas.has(url) || url.startsWith("/api/v1/salud")) continue;
      const permisos = readFileSync(path.join(path.dirname(r), "permisos.ts"), "utf8");
      for (const metodo of mutantes) {
        const accion = permisos.match(new RegExp(`${metodo}:\\s*"([^"]+)"`))?.[1];
        expect(accion && Object.hasOwn(MatrizPermisos, accion), `${url} ${metodo}`).toBe(true);
        expect(fuente, url).toMatch(/conAutorizacion\(/);
      }
    }
  });
});
