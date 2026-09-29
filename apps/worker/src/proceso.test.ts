// Procesos reales empaquetados (V8-9 y V8-11): el bundle de esbuild arranca, se niega a arrancar sin
// configuración completa, `migrar` aplica todo en una BD vacía y el worker despacha por NOTIFY.
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { OPCIONALES, VARIABLES } from "@ps/infra/config";
import { MIGRACIONES } from "../../../packages/infra/migraciones/indice";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";

const RAIZ = fileURLToPath(new URL("../../../", import.meta.url));
const WORKER = fileURLToPath(new URL("../dist/worker.js", import.meta.url));
const MIGRAR = fileURLToPath(new URL("../dist/migrar.js", import.meta.url));

function entornoDev(proceso: "worker" | "migrar"): Record<string, string> {
  const salida = execFileSync("bash", [`${RAIZ}/scripts/entorno-dev.sh`, proceso], {
    encoding: "utf8",
  });
  const entorno: Record<string, string> = {};
  for (const linea of salida.split("\n")) {
    const m = linea.match(/^export ([A-Z_]+)=(.*)$/);
    if (m) entorno[m[1]!] = m[2]!;
  }
  return entorno;
}

function correr(binario: string, entorno: Record<string, string>, args: string[] = []) {
  return spawnSync(process.execPath, [binario, ...args], {
    env: { PATH: process.env.PATH ?? "", ...entorno },
    encoding: "utf8",
    timeout: 20_000,
  });
}

beforeAll(() => {
  execFileSync("npm", ["run", "build", "-w", "@ps/worker"], { cwd: RAIZ, stdio: "ignore" });
}, 60_000);

describe("arranque con configuración incompleta (V8-9)", () => {
  const opcionales = OPCIONALES;
  // Sin dobles: toda variable de la lista es obligatoria salvo las de rotación.
  const obligatorias = VARIABLES.worker.filter((v) => !opcionales.has(v));

  it("el worker con configuración completa pasa --comprobar con código 0", () => {
    const r = correr(WORKER, entornoDev("worker"), ["--comprobar"]);
    expect(r.status).toBe(0);
  });

  it.each(obligatorias)("el worker sin %s sale con código ≠ 0 sin conectarse", (variable) => {
    const entorno = entornoDev("worker");
    delete entorno.DOBLES; // sin dobles, las credenciales de las fronteras son obligatorias
    for (const v of obligatorias) entorno[v] ??= "x".repeat(40);
    entorno.MAILGUN_DOMAIN = "mg.people.trycore.com";
    entorno.SPACES_BUCKET = "ps-evidencias";
    entorno.LATIDO_URL = "https://latido.example/ping";
    delete entorno[variable];
    const r = correr(WORKER, entorno, ["--comprobar"]);
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain(variable);
  });

  it("con APP_ENV=produccion rechaza los dobles", () => {
    const entorno = { ...entornoDev("worker"), APP_ENV: "produccion" };
    const r = correr(WORKER, entorno, ["--comprobar"]);
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain("DOBLES");
  });

  it("migrar sin MIGRATOR_DATABASE_URL sale con código ≠ 0", () => {
    const entorno = entornoDev("migrar");
    delete entorno.MIGRATOR_DATABASE_URL;
    expect(correr(MIGRAR, entorno).status).not.toBe(0);
  });
});

describe.skipIf(!HAY_BD)("procesos contra una BD real (V8-11)", () => {
  let bd: BdPrueba;

  beforeAll(async () => {
    bd = await crearBdPrueba({ migrar: false });
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("migrar contra una BD vacía aplica todas; una segunda ejecución no aplica nada", () => {
    const entorno = {
      APP_ENV: "ci",
      MIGRATOR_DATABASE_URL: bd.urlDe("ps_migrador", { directa: true }),
    };
    const primera = correr(MIGRAR, entorno);
    expect(primera.status).toBe(0);
    const evento = JSON.parse(primera.stdout.trim().split("\n").at(-1)!);
    expect(evento.aplicadas).toEqual(Object.keys(MIGRACIONES));
    const segunda = correr(MIGRAR, entorno);
    expect(segunda.status).toBe(0);
    expect(JSON.parse(segunda.stdout.trim().split("\n").at(-1)!).aplicadas).toEqual([]);
  });

  it("el worker empaquetado siembra PANEL_ADMIN_INICIAL al arrancar con el panel vacío", async () => {
    const entorno: Record<string, string> = {
      ...entornoDev("worker"),
      APP_ENV: "ci",
      DATABASE_URL: bd.urlDe("ps_worker"),
      DATABASE_DIRECT_URL: bd.urlDe("ps_worker", { directa: true }),
    };
    const hijo = spawn(process.execPath, [WORKER], {
      env: { PATH: process.env.PATH ?? "", ...entorno },
    });
    let salida = "";
    hijo.stdout.on("data", (d) => (salida += String(d)));
    const cerrado = new Promise<number | null>((res) => hijo.on("exit", res));
    await new Promise<void>((res, rej) => {
      const fin = Date.now() + 5_000;
      const t = setInterval(() => {
        if (/worker_arrancado/.test(salida)) {
          clearInterval(t);
          res();
        } else if (Date.now() > fin) {
          clearInterval(t);
          rej(new Error(`el worker no arrancó: ${salida}`));
        }
      }, 50);
    });
    hijo.kill("SIGTERM");
    expect(await cerrado).toBe(0);

    expect(salida).toContain("admin_inicial_sembrado");
    const u = await bd.instalacion.query(`SELECT correo, rol FROM identidad_panel.usuarios_panel`);
    expect(u.rows).toEqual([
      { correo: entorno.PANEL_ADMIN_INICIAL!.toLowerCase(), rol: "administrador" },
    ]);
    const a = await bd.instalacion.query(
      `SELECT origen FROM auditoria.auditoria WHERE entidad = 'usuarios_panel'`,
    );
    expect(a.rows).toEqual([{ origen: "migracion" }]);
    await bd.instalacion.query(`DELETE FROM identidad_panel.usuarios_panel`);
  }, 30_000);

  it("el worker empaquetado despacha un código por NOTIFY y se apaga limpio con SIGTERM", async () => {
    const i = bd.instalacion;
    const u = await i.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('ana@trycore.com', '\\x01', 'administrador') RETURNING id`,
    );
    const e = await i.query(
      `INSERT INTO identidad.enlaces (cuenta_ref, cuenta_nombre, razon, vigente_hasta, generado_por)
       VALUES ('hs', 'Cuenta', 'razón', now() + interval '1 day', $1) RETURNING id`,
      [u.rows[0].id],
    );
    const inv = await i.query(
      `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, 'lider@cliente.com', '\\x02') RETURNING id`,
      [e.rows[0].id],
    );

    const entorno = {
      ...entornoDev("worker"),
      APP_ENV: "ci",
      DATABASE_URL: bd.urlDe("ps_worker"),
      DATABASE_DIRECT_URL: bd.urlDe("ps_worker", { directa: true }),
    };
    const hijo = spawn(process.execPath, [WORKER], {
      env: { PATH: process.env.PATH ?? "", ...entorno },
    });
    let salida = "";
    hijo.stdout.on("data", (d) => (salida += String(d)));
    const esperar = (patron: RegExp, ms: number) =>
      new Promise<void>((res, rej) => {
        const fin = Date.now() + ms;
        const t = setInterval(() => {
          if (patron.test(salida)) {
            clearInterval(t);
            res();
          } else if (Date.now() > fin) {
            clearInterval(t);
            rej(new Error(`no apareció ${patron} en: ${salida}`));
          }
        }, 50);
      });

    await esperar(/worker_arrancado/, 5_000);
    const t0 = Date.now();
    await bd
      .como("ps_portal")
      .query(`SELECT operacion.encolar_portal('enviar_codigo', $1::jsonb)`, [
        JSON.stringify({ ref: inv.rows[0].id, ambito: "cliente" }),
      ]);
    await esperar(/"evento":"correo_doble"/, 4_000);
    // Por NOTIFY, no por la espera de 5 s.
    expect(Date.now() - t0).toBeLessThan(3_000);

    const cerrado = new Promise<number | null>((res) => hijo.on("exit", res));
    hijo.kill("SIGTERM");
    expect(await cerrado).toBe(0);
    expect(salida).toContain("worker_detenido");
  }, 30_000);
});
