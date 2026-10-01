// Marco del panel con sesión abierta en un navegador real (prototipo admin-shell): barra lateral y
// contenido en dos columnas en escritorio, sin scroll horizontal en móvil, CSP limpia y axe sin
// incidencias serias. La sesión se crea directamente en la BD local (misma que usa el panel).
import AxeBuilder from "@axe-core/playwright";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { expect, test, type BrowserContext } from "@playwright/test";
import pg from "pg";

const CORREO = "e2e-marco@trycore.com";
const INSTALACION =
  process.env.BD_INSTALACION_URL ?? "postgres://ps_instalacion@127.0.0.1:54329/ps";

function claveCorreo(): string {
  const salida = execFileSync("bash", ["scripts/entorno-dev.sh", "panel"], { encoding: "utf8" });
  return salida.match(/^export EMAIL_HMAC_KEY=(.*)$/m)![1]!;
}

async function abrirSesion(context: BrowserContext, baseURL: string): Promise<void> {
  const bd = new pg.Client({ connectionString: INSTALACION });
  await bd.connect();
  try {
    const hmac = createHmac("sha256", claveCorreo()).update(CORREO).digest();
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
      { name: "__Host-pp", value: id, domain: new URL(baseURL).hostname, path: "/", secure: true, httpOnly: true, sameSite: "Lax" },
    ]);
  } finally {
    await bd.end();
  }
}

test.describe("marco del panel con sesión", () => {
  test.beforeEach(async ({ context, baseURL }, info) => {
    test.skip(info.project.name !== "panel", "solo el panel");
    await abrirSesion(context, baseURL!);
  });

  test("escritorio 1440: barra lateral y contenido en dos columnas, 8 destinos deshabilitados; Enlaces, Peticiones, Catálogos y Léxico activos", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const errores: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errores.push(m.text());
    });
    await page.goto("/");
    await expect(page.getByText(CORREO)).toBeVisible();
    const m = await page.evaluate(() => {
      const panel = document.querySelector(".pp-panel")!;
      const lateral = document.querySelector(".pp-sidebar")!.getBoundingClientRect();
      const cuerpo = document.querySelector(".pp-panel__cuerpo")!.getBoundingClientRect();
      return {
        display: getComputedStyle(panel).display,
        lateralAncho: lateral.width,
        cuerpoALaDerecha: cuerpo.left >= lateral.right - 1 && cuerpo.top < lateral.top + 5,
        inactivos: document.querySelectorAll('.pp-sidelink[aria-disabled="true"]').length,
        conHref: document.querySelectorAll(".pp-sidelink[href]").length,
        scroll: document.scrollingElement!.scrollWidth - document.scrollingElement!.clientWidth,
      };
    });
    expect(m.display).toBe("grid");
    expect(m.lateralAncho).toBeLessThan(400);
    expect(m.cuerpoALaDerecha).toBe(true);
    expect(m.inactivos).toBe(8);
    expect(m.conHref).toBe(4); // Enlaces y Peticiones (EP-001); Catálogos y Léxico (EP-006 · sub-slice 1)
    expect(m.scroll).toBe(0);
    expect(errores).toEqual([]);
  });

  for (const ancho of [320, 390]) {
    test(`móvil a ${ancho} px: sin scroll horizontal del documento y «Cerrar sesión» a mano`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: ancho, height: 800 });
      await page.goto("/");
      const m = await page.evaluate(() => ({
        scroll: document.scrollingElement!.scrollWidth - document.scrollingElement!.clientWidth,
      }));
      expect(m.scroll).toBe(0);
      const salir = page.getByRole("button", { name: "Cerrar sesión" });
      await expect(salir).toBeVisible();
      const caja = (await salir.boundingBox())!;
      expect(caja.height).toBeGreaterThanOrEqual(44);
    });
  }

  test("accesibilidad del marco: 0 incidencias serias o críticas", async ({ page }) => {
    await page.goto("/");
    const r = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
    ).toEqual([]);
  });

  test("Cerrar sesión vuelve a la puerta y la sesión deja de valer", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await page.waitForURL(/\/acceso$/);
    await page.goto("/");
    await expect(page).toHaveURL(/\/acceso/);
  });
});

test("HU-123: al pedir el código, el foco pasa a la primera casilla (prototipo panel-acceso--codigo)", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "panel", "solo el panel");
  await page.goto("/acceso");
  await page.getByLabel("Correo corporativo").fill("no-inscrito-e2e@trycore.com");
  await page.getByRole("button", { name: /código/ }).click();
  await expect(page.getByLabel("Dígito 1")).toBeFocused();
});

test.describe("pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139)", () => {
  test.beforeEach(async ({ context, baseURL }, info) => {
    test.skip(info.project.name !== "panel", "solo el panel");
    await abrirSesion(context, baseURL!);
  });

  for (const ruta of [
    "/enlaces",
    "/enlaces/nuevo",
    "/peticiones",
    "/peticiones/renovaciones",
    "/catalogos",
    "/catalogos?tipo=modalidad_prueba",
    "/lexico",
    "/lexico?vista=candidatas",
  ]) {
    test(`${ruta}: axe sin incidencias serias y sin scroll horizontal a 320/390`, async ({ page }) => {
      const errores: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error") errores.push(m.text());
      });
      await page.goto(ruta);
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
      for (const ancho of [320, 390]) {
        await page.setViewportSize({ width: ancho, height: 800 });
        const scroll = await page.evaluate(() => document.scrollingElement!.scrollWidth - document.scrollingElement!.clientWidth);
        expect(scroll, `${ruta} a ${ancho}`).toBe(0);
      }
      expect(errores).toEqual([]);
    });
  }
});
