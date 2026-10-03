// Recorrido de SARO y DISC por importación en un navegador real (EP-003 · SS3, tarea 3.6; HU-191):
// exportar el banco (trae las tres columnas) → completar SARO y DISC de tres publicados incompletos →
// pegar en Importar → vista previa con los tres «actualizado» → confirmar → el worker aplica → el
// listado ya no los marca y la ficha (la misma del portal) muestra SARO y DISC con su mes. Los tres
// heredados los fabrica el spec (publicados completos y luego sin SARO por SQL); el worker es el real
// del worktree, con las fronteras como dobles (APP_ENV=local), contra la BD de BD_INSTALACION_URL.
import { createHash, createHmac, randomBytes } from "node:crypto";
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import pg from "pg";

const CORREO = "e2e-importacion-saro@trycore.com";
const INSTALACION =
  process.env.BD_INSTALACION_URL ?? "postgres://ps_instalacion@127.0.0.1:54329/ps";
const BD = new URL(INSTALACION).pathname.slice(1);
const ENC = {
  alcance: "Alcance de la verificación SARO (del catálogo)",
  saro: "Fecha de la verificación SARO (AAAA-MM-DD o DD/MM/AAAA)",
  disc: "Fecha de la evaluación DISC (AAAA-MM-DD o DD/MM/AAAA)",
};

const entorno = (proceso: string): Record<string, string> => {
  const salida = execFileSync("bash", ["scripts/entorno-dev.sh", proceso], { encoding: "utf8" });
  return Object.fromEntries(
    [...salida.matchAll(/^export ([A-Z_]+)=(.*)$/gm)].map((m) => [m[1]!, m[2]!]),
  );
};

async function conBd<T>(f: (bd: pg.Client) => Promise<T>): Promise<T> {
  const bd = new pg.Client({ connectionString: INSTALACION });
  await bd.connect();
  try {
    return await f(bd);
  } finally {
    await bd.end();
  }
}

async function abrirSesion(context: BrowserContext, baseURL: string): Promise<void> {
  await conBd(async (bd) => {
    const hmac = createHmac("sha256", entorno("panel").EMAIL_HMAC_KEY!).update(CORREO).digest();
    const u = await bd.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ($1, $2, 'administrador')
       ON CONFLICT (correo_hmac) DO UPDATE SET activo = true RETURNING id`,
      [CORREO, hmac],
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
        domain: new URL(baseURL).hostname,
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
  });
}

// Tres publicados completos por la API del panel; luego, como heredados, sin la verificación SARO.
async function heredadosSinSaro(page: Page): Promise<string[]> {
  const ids = await conBd(async (bd) => {
    const id = async (tabla: string, cond: string) =>
      (await bd.query(`SELECT id FROM inventario.${tabla} WHERE ${cond} LIMIT 1`)).rows[0]
        .id as string;
    return {
      rolId: await id("catalogo_roles", "nombre = 'Desarrolladora backend Java'"),
      tecnologiaIds: [await id("catalogo_tecnologias", "nombre = 'Java'")],
      seniorityId: await id("catalogo_seniorities", "nombre = 'Senior'"),
      ciudadId: await id("catalogo_ciudades", "nombre = 'Medellín'"),
      modalidadTrabajoId: await id("catalogo_modalidades", "nombre = 'hibrido'"),
      modalidadPruebaId: await id(
        "catalogo_modalidades_prueba",
        "nombre = 'Prueba práctica revisada por un arquitecto'",
      ),
      saroAlcanceId: await id("catalogo_alcances_saro", "activo"),
    };
  });
  await page.goto("/inventario");
  const codigos = await page.evaluate(async (ids) => {
    const csrf = decodeURIComponent(
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("__Host-csrf="))!
        .slice("__Host-csrf=".length),
    );
    const enviar = (ruta: string, cuerpo: unknown, version?: number) =>
      fetch(ruta, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-ps-csrf": csrf,
          ...(version ? { "if-match": `"${version}"` } : {}),
        },
        body: JSON.stringify(cuerpo),
      }).then((r) => r.json());
    const salida: string[] = [];
    for (const nombre of ["Inés", "Óscar", "Lucía"]) {
      const { perfil } = await enviar("/api/v1/perfiles", {
        nombre,
        primerApellido: "Heredada",
        aniosExperiencia: 6,
        disponibilidad: { opcion: "ahora" },
        saroFecha: "2026-01-20",
        discFecha: "2026-01-21",
        experiencias: [{ cargo: "Backend", desde: 2020, descripcion: "Pagos en línea." }],
        ...ids,
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
  }, ids);
  await conBd((bd) =>
    bd.query(
      `UPDATE inventario.perfiles SET saro_alcance_id = NULL, saro_fecha = NULL
        WHERE codigo = ANY($1) AND estado = 'publicado'`,
      [codigos],
    ),
  );
  return codigos;
}

// El worker real del worktree hasta que el lote quede aplicado.
async function aplicarConWorker(): Promise<void> {
  const e = entorno("worker");
  const conBdAislada = (u: string) => u.replace(/\/ps$/, `/${BD}`);
  const env = {
    ...process.env,
    ...e,
    DATABASE_URL: conBdAislada(e.DATABASE_URL!),
    DATABASE_DIRECT_URL: conBdAislada(e.DATABASE_DIRECT_URL!),
    EXPORT_DATABASE_URL: conBdAislada(e.EXPORT_DATABASE_URL!),
  };
  const w: ChildProcess = spawn("node", ["apps/worker/dist/worker.js"], { env, stdio: "ignore" });
  try {
    await expect
      .poll(
        () =>
          conBd(
            async (bd) =>
              (
                await bd.query(
                  `SELECT estado FROM inventario.lotes_importacion ORDER BY creado_en DESC LIMIT 1`,
                )
              ).rows[0]?.estado,
          ),
        { timeout: 30_000, intervals: [500] },
      )
      .toBe("aplicado");
  } finally {
    w.kill("SIGTERM");
  }
}

test.describe("SARO y DISC por importación (HU-191)", () => {
  test.beforeEach(async ({ context, baseURL }, info) => {
    test.skip(info.project.name !== "panel", "solo el panel");
    await abrirSesion(context, baseURL!);
  });

  test("exportar → completar tres incompletos → pegar → vista previa → confirmar → listado sin marcas → ficha con SARO y DISC", async ({
    page,
  }) => {
    const errores: string[] = [];
    page.on("pageerror", (e) => errores.push(e.message));
    const codigos = await heredadosSinSaro(page);
    await page.goto("/inventario?estado=incompleto");
    for (const c of codigos)
      await expect(page.getByRole("row").filter({ hasText: c })).toContainText(
        "Incompleto: falta la verificación SARO (alcance y fecha)",
      );

    // 1. Exportar: el banco trae las tres columnas y el alcance como está en el catálogo.
    const exportado = await page.evaluate(() =>
      fetch("/api/v1/importacion/exportar?formato=csv").then((r) => r.text()),
    );
    const cabeza = exportado.replace(/^﻿/, "").split("\r\n")[0]!;
    for (const e of Object.values(ENC)) expect(cabeza).toContain(e);
    const alcance = await conBd(
      async (bd) =>
        (
          await bd.query(
            `SELECT nombre FROM inventario.catalogo_alcances_saro WHERE activo ORDER BY nombre LIMIT 1`,
          )
        ).rows[0].nombre as string,
    );

    // 2. Completar SARO y DISC de los tres y pegarlo en Importar.
    const hoja = [
      ["Código", ENC.alcance, ENC.saro, ENC.disc],
      ...codigos.map((c) => [c, alcance, "12/03/2026", "2026-04-08"]),
    ]
      .map((f) => f.join("\t"))
      .join("\n");
    await page.goto("/importar");
    await page.locator("#pegado").fill(hoja);
    await expect(page.locator("#deteccion")).toContainText("3 filas · 4 columnas");
    await page.getByRole("button", { name: "Ver la vista previa" }).click();
    await expect(page.getByRole("heading", { name: "Vista previa" })).toBeVisible();
    for (const c of codigos) await expect(page.getByText(c).first()).toBeVisible();
    await expect(page.getByText("Alcance de la verificación SARO").first()).toBeVisible();

    // 3. Confirmar: el worker aplica.
    await page.getByRole("button", { name: "Importar 3 perfiles" }).click();
    await aplicarConWorker();

    // 4. Ya no se marcan, siguen publicados y la ficha muestra SARO y DISC con su mes.
    await page.goto("/inventario?estado=incompleto");
    for (const c of codigos)
      await expect(page.getByRole("row").filter({ hasText: c })).toHaveCount(0);
    const fichas = await conBd(
      async (bd) =>
        (
          await bd.query(
            `SELECT f.codigo, f.saro_fecha::text AS saro, f.disc_fecha::text AS disc, p.estado
               FROM operacion.ficha_publicable f JOIN inventario.perfiles p ON p.codigo = f.codigo
              WHERE f.codigo = ANY($1) ORDER BY f.codigo`,
            [codigos],
          )
        ).rows,
    );
    expect(fichas).toEqual(
      [...codigos]
        .sort()
        .map((codigo) => ({ codigo, saro: "2026-03-12", disc: "2026-04-08", estado: "publicado" })),
    );
    await page.goto(`/inventario/${codigos[0]}?vista=ficha`);
    const verificado = page.locator(".pp-bloque--verificado");
    await expect(verificado).toContainText("Verificación de seguridad SARO");
    await expect(verificado).toContainText("marzo de 2026");
    await expect(verificado).toContainText("abril de 2026");
    expect(errores).toEqual([]);
  });
});
