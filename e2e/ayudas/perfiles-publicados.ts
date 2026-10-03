// Ayudas de los e2e del portal de EP-003 (SS4, SS5): perfiles publicados por la API del panel con sus
// validaciones de entrada, un enlace con su invitado y su token, el worker real del worktree con el doble
// de Mailgun (para leer el código de acceso) y axe sin incidencias graves.
import AxeBuilder from "@axe-core/playwright";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { expect, type BrowserContext, type Page } from "@playwright/test";
import pg from "pg";

export const INSTALACION =
  process.env.BD_INSTALACION_URL ?? "postgres://ps_instalacion@127.0.0.1:54329/ps";
const BD = new URL(INSTALACION).pathname.slice(1);
// Por defecto el panel del playwright.config.ts (3101); el entorno aislado de EP-003 pasa PANEL_URL=…:3201.
export const PANEL = process.env.PANEL_URL ?? "http://127.0.0.1:3101";
const ADMIN = "e2e-portal-perfiles@trycore.com";
export const entorno = (proceso: string): Record<string, string> => {
  const salida = execFileSync("bash", ["scripts/entorno-dev.sh", proceso], { encoding: "utf8" });
  return Object.fromEntries(
    [...salida.matchAll(/^export ([A-Z_]+)=(.*)$/gm)].map((m) => [m[1]!, m[2]!]),
  );
};

export async function conBd<T>(f: (bd: pg.Client) => Promise<T>): Promise<T> {
  const bd = new pg.Client({ connectionString: INSTALACION });
  await bd.connect();
  try {
    return await f(bd);
  } finally {
    await bd.end();
  }
}

export async function sesionPanel(context: BrowserContext): Promise<void> {
  await conBd(async (bd) => {
    const hmac = createHmac("sha256", entorno("panel").EMAIL_HMAC_KEY!).update(ADMIN).digest();
    const u = await bd.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ($1, $2, 'administrador')
       ON CONFLICT (correo_hmac) DO UPDATE SET activo = true RETURNING id`,
      [ADMIN, hmac],
    );
    const id = randomBytes(32).toString("base64url");
    await bd.query(
      `INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, expira) VALUES ($1, $2, now() + interval '12 hours')`,
      [createHash("sha256").update(id).digest(), u.rows[0].id],
    );
    await context.addCookies([
      {
        name: "__Host-pp",
        value: id,
        domain: "127.0.0.1",
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
  });
}

export interface Alta {
  nombre: string;
  sello: string[];
  tecnologias: string[];
  sectores: string[];
  experiencia?: string;
}

// Tres publicados por la API del panel, con las tres validaciones de entrada y su Sello Personal.
export async function publicar(page: Page, altas: Alta[]): Promise<string[]> {
  const ids = await conBd(async (bd) => {
    const id = async (tabla: string, cond: string, p: unknown[] = []) =>
      (await bd.query(`SELECT id FROM inventario.${tabla} WHERE ${cond} LIMIT 1`, p)).rows[0]
        .id as string;
    const tecnologias = Object.fromEntries(
      await Promise.all(
        [...new Set(altas.flatMap((a) => a.tecnologias))].map(async (t) => [
          t,
          await id("catalogo_tecnologias", "nombre = $1", [t]),
        ]),
      ),
    );
    const sectores = Object.fromEntries(
      await Promise.all(
        [...new Set(altas.flatMap((a) => a.sectores))].map(async (s) => [
          s,
          await id("catalogo_sectores", "nombre = $1", [s]),
        ]),
      ),
    );
    return {
      comunes: {
        rolId: await id("catalogo_roles", "nombre = 'Desarrolladora backend Java'"),
        seniorityId: await id("catalogo_seniorities", "nombre = 'Senior'"),
        ciudadId: await id("catalogo_ciudades", "nombre = 'Medellín'"),
        modalidadTrabajoId: await id("catalogo_modalidades", "nombre = 'remoto'"),
        modalidadPruebaId: await id(
          "catalogo_modalidades_prueba",
          "nombre = 'Prueba práctica revisada por un arquitecto'",
        ),
        saroAlcanceId: await id("catalogo_alcances_saro", "activo"),
      },
      tecnologias,
      sectores,
    };
  });
  await page.goto(`${PANEL}/inventario`);
  return page.evaluate(
    async ({ ids, altas }) => {
      const csrf = decodeURIComponent(
        document.cookie
          .split("; ")
          .find((c) => c.startsWith("__Host-csrf="))!
          .slice("__Host-csrf=".length),
      );
      const enviar = async (ruta: string, cuerpo: unknown, version?: number) => {
        const r = await fetch(ruta, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-ps-csrf": csrf,
            ...(version ? { "if-match": `"${version}"` } : {}),
          },
          body: JSON.stringify(cuerpo),
        });
        const j = await r.json();
        if (!r.ok) throw new Error(`${ruta} ${r.status} ${JSON.stringify(j)}`);
        return j;
      };
      const salida: string[] = [];
      for (const a of altas) {
        const { perfil } = await enviar("/api/v1/perfiles", {
          nombre: a.nombre,
          primerApellido: "Tarjeta",
          aniosExperiencia: 9,
          disponibilidad: { opcion: "dos_semanas" },
          saroFecha: "2026-03-15",
          discFecha: "2026-04-10",
          selloPersonal: a.sello,
          tecnologiaIds: a.tecnologias.map((t) => ids.tecnologias[t]),
          sectorIds: a.sectores.map((s) => ids.sectores[s]),
          experiencias: [{ cargo: "Backend", desde: 2018, descripcion: a.experiencia ?? "Pagos inmediatos para banca." }],
          ...ids.comunes,
        });
        const c = await enviar(`/api/v1/perfiles/${perfil.codigo}/consentimiento`, {
          nombreApellido: true,
          trayectoria: true,
          clientes: true,
        });
        await enviar(`/api/v1/perfiles/${perfil.codigo}/publicar`, {}, c.perfil.version);
        salida.push(perfil.codigo as string);
      }
      return salida;
    },
    { ids, altas },
  );
}

export async function enlace(codigos: string[], correo: string): Promise<string> {
  const clave = entorno("portal").EMAIL_HMAC_KEY!;
  return conBd(async (bd) => {
    const e = await bd.query(
      `INSERT INTO identidad.enlaces (cuenta_nombre, proyecto, razon, codigos_perfil, vigente_desde, vigente_hasta, generado_por)
       VALUES ('Bancolombia', 'Pagos inmediatos', 'Backend para la nueva plataforma de pagos.', $1, now() - interval '1 day',
               now() + interval '20 days', gen_random_uuid()) RETURNING id`,
      [codigos],
    );
    await bd.query(
      `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, $2, $3)`,
      [e.rows[0].id, correo, createHmac("sha256", clave).update(correo).digest()],
    );
    const token = randomBytes(32).toString("base64url");
    await bd.query(`INSERT INTO identidad.enlace_tokens (enlace_id, token_hash) VALUES ($1, $2)`, [
      e.rows[0].id,
      createHash("sha256").update(token).digest(),
    ]);
    return token;
  });
}

// El worker real del worktree con el doble de Mailgun: registra cada correo «enviado» con su texto.
export function arrancarWorker(): {
  proceso: ChildProcess;
  listo: () => Promise<void>;
  codigoPara: (correo: string) => Promise<string>;
} {
  const e = entorno("worker");
  const conBdAislada = (u: string) => u.replace(/\/ps$/, `/${BD}`);
  const env = {
    ...process.env,
    ...e,
    DATABASE_URL: conBdAislada(e.DATABASE_URL!),
    DATABASE_DIRECT_URL: conBdAislada(e.DATABASE_DIRECT_URL!),
    EXPORT_DATABASE_URL: conBdAislada(e.EXPORT_DATABASE_URL!),
  };
  const proceso = spawn("node", ["apps/worker/dist/worker.js"], {
    env,
    stdio: ["ignore", "pipe", "ignore"],
  });
  let salida = "";
  proceso.stdout!.on("data", (d) => (salida += String(d)));
  const codigoPara = async (correo: string) => {
    let codigo = "";
    await expect
      .poll(
        () => {
          for (const l of salida.split("\n")) {
            if (!l.includes('"correo_doble"')) continue;
            const m = JSON.parse(l) as { para: string; texto: string };
            const c = m.para === correo ? m.texto.match(/^(\d{3}) (\d{3})$/m)?.slice(1).join("") : undefined;
            if (c) codigo = c;
          }
          return codigo;
        },
        // Con otros e2e antes (renovaciones, invitaciones), el worker despacha primero esa cola.
        { timeout: 90_000, intervals: [300] },
      )
      .toMatch(/^\d{6}$/);
    return codigo;
  };
  // Esperar a que el worker arranque y dé su primera vuelta antes de pedir el código: si la última vuelta
  // registrada tiene más de 2 min, el portal da el worker por caído y despacha el código él mismo
  // (workerCaido → procesarCodigoPropio) y el correo sale por el portal, no por este worker.
  const listo = async () => {
    await expect.poll(() => salida.includes('"worker_arrancado"'), { timeout: 30_000 }).toBe(true);
    await expect
      .poll(
        () =>
          conBd(async (bd) => {
            const r = await bd.query(
              `SELECT ultima_vuelta > now() - interval '30 seconds' AS reciente FROM operacion.worker_ciclo WHERE id = 1`,
            );
            return Boolean(r.rows[0]?.reciente);
          }),
        { timeout: 30_000, intervals: [200] },
      )
      .toBe(true);
  };
  return { proceso, listo, codigoPara };
}

export async function sinIncidenciasGraves(page: Page) {
  const r = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(
    graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
  ).toEqual([]);
}


// Confirma un reporte de validación técnica (Nivel 1) por la API del panel, como Talento Humano (HU-140).
export async function confirmarReporte(
  page: Page,
  codigo: string,
  reporte: { evaluador: string; fecha: string; resultado: string },
): Promise<void> {
  await page.goto(`${PANEL}/inventario`);
  await page.evaluate(
    async ({ codigo, reporte }) => {
      const csrf = decodeURIComponent(
        document.cookie.split("; ").find((c) => c.startsWith("__Host-csrf="))!.slice("__Host-csrf=".length),
      );
      const pedir = async (metodo: string, ruta: string, cuerpo: unknown) => {
        const r = await fetch(ruta, {
          method: metodo,
          headers: { "content-type": "application/json", "x-ps-csrf": csrf },
          body: JSON.stringify(cuerpo),
        });
        const j = await r.json();
        if (!r.ok) throw new Error(`${ruta} ${r.status} ${JSON.stringify(j)}`);
        return j;
      };
      const { borrador: b } = await pedir("POST", `/api/v1/perfiles/${codigo}/validacion`, {});
      const campos = { id: b.id, enunciadoReto: b.enunciadoReto, entregables: b.entregables, criterios: b.criterios };
      await pedir("PATCH", `/api/v1/perfiles/${codigo}/validacion`, { ...campos, ...reporte });
      await pedir("POST", `/api/v1/perfiles/${codigo}/validacion/confirmar`, { ...campos, ...reporte, revisado: true });
    },
    { codigo, reporte },
  );
}
