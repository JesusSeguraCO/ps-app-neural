// Cara cliente en un navegador real (HU-090, HU-144, HU-092; prototipo puerta-acceso, enlace-revocado,
// acceso-vencido y aterrizaje-curado): el fragmento `#t=` se borra de la barra, cada estado del enlace
// lleva a su pantalla, y el aterrizaje con sesión pasa axe y no desborda en móvil. Enlaces y sesiones se
// siembran en la BD local (la misma que usa el portal).
import AxeBuilder from "@axe-core/playwright";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import pg from "pg";

const INSTALACION =
  process.env.BD_INSTALACION_URL ?? "postgres://ps_instalacion@127.0.0.1:54329/ps";
const clave = execFileSync("bash", ["scripts/entorno-dev.sh", "portal"], {
  encoding: "utf8",
}).match(/^export EMAIL_HMAC_KEY=(.*)$/m)![1]!;

async function sembrar(o: { vencido?: boolean; revocado?: boolean; correo: string }) {
  const bd = new pg.Client({ connectionString: INSTALACION });
  await bd.connect();
  try {
    const e = await bd.query(
      `INSERT INTO identidad.enlaces (cuenta_nombre, proyecto, razon, codigos_perfil, vigente_desde, vigente_hasta, generado_por, estado, revocado_en)
       VALUES ('Cuenta E2E', 'Proyecto E2E', 'Razón de la selección E2E.', '{PS-0142,PS-0151,PS-0137}', now() - interval '40 days',
               now() + ($1::int * interval '1 day'), gen_random_uuid(), $2::text, CASE WHEN $2::text = 'revocado' THEN now() END) RETURNING id`,
      [o.vencido ? -2 : 20, o.revocado ? "revocado" : "activo"],
    );
    const i = await bd.query(
      `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, $2, $3) RETURNING id`,
      [e.rows[0].id, o.correo, createHmac("sha256", clave).update(o.correo).digest()],
    );
    const token = randomBytes(32).toString("base64url");
    await bd.query(`INSERT INTO identidad.enlace_tokens (enlace_id, token_hash) VALUES ($1, $2)`, [
      e.rows[0].id,
      createHash("sha256").update(token).digest(),
    ]);
    return { token, enlaceId: e.rows[0].id as string, invitadoId: i.rows[0].id as string };
  } finally {
    await bd.end();
  }
}

async function abrirSesion(
  context: BrowserContext,
  baseURL: string,
  enlaceId: string,
  invitadoId: string,
) {
  const bd = new pg.Client({ connectionString: INSTALACION });
  await bd.connect();
  const id = randomBytes(32).toString("base64url");
  await bd.query(
    `INSERT INTO identidad.sesiones_portal (id_hash, enlace_id, invitado_id, expira) VALUES ($1, $2, $3, now() + interval '10 days')`,
    [createHash("sha256").update(id).digest(), enlaceId, invitadoId],
  );
  await bd.end();
  await context.addCookies([
    {
      name: "__Host-ps",
      value: id,
      domain: new URL(baseURL).hostname,
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

async function sinIncidenciasGraves(page: Page) {
  // Tras cambiar de tema los botones transicionan su color: axe mediría un color intermedio.
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== "running"),
  );
  const r = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(
    graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
  ).toEqual([]);
}

const scrollHorizontal = (page: Page) =>
  page.evaluate(
    () => document.scrollingElement!.scrollWidth - document.scrollingElement!.clientWidth,
  );

test.describe("cara cliente", () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "portal", "solo el portal"));

  test("HU-090: enlace vigente → la puerta explica por qué pide el correo y el token sale de la barra", async ({
    page,
  }) => {
    const { token } = await sembrar({
      correo: `e2e-${randomBytes(3).toString("hex")}@cliente.com`,
    });
    await page.goto(`/e/#t=${token}`);
    await expect(page.getByRole("heading", { name: "Entra con tu correo" })).toBeVisible();
    await expect(
      page.getByText("Lo pedimos porque los perfiles muestran nombre y trayectoria"),
    ).toBeVisible();
    expect(page.url()).not.toContain(token);
    expect(new URL(page.url()).hash).toBe("");
    await page.getByLabel("Correo corporativo").fill("no-invitado@cliente.com");
    await page.getByRole("button", { name: "Enviarme el código" }).click();
    await expect(page.getByText("está invitado, te llegó un código")).toBeVisible();
    await sinIncidenciasGraves(page);
  });

  test("HU-144: enlace revocado → pantalla explicativa, sin puerta ni inventario", async ({
    page,
  }) => {
    const { token } = await sembrar({ revocado: true, correo: "rev@cliente.com" });
    await page.goto(`/e/#t=${token}`);
    await expect(page.getByRole("heading", { name: "Este enlace ya no abre" })).toBeVisible();
    await expect(page.getByLabel("Correo corporativo")).toHaveCount(0);
    await expect(page.locator(".pp-perfil")).toHaveCount(0);
    await sinIncidenciasGraves(page);
  });

  test("HU-144: dirección alterada → la misma pantalla que revocado", async ({ page }) => {
    await page.goto(`/e/#t=${"A".repeat(43)}`);
    await expect(page.getByRole("heading", { name: "Este enlace ya no abre" })).toBeVisible();
  });

  test("HU-092: enlace vencido → explicación con la fecha y campo para pedir uno nuevo; respuesta neutra", async ({
    page,
  }) => {
    const { token } = await sembrar({ vencido: true, correo: "venc@cliente.com" });
    await page.goto(`/e/#t=${token}`);
    await expect(page.getByRole("heading", { name: "Este enlace ya venció" })).toBeVisible();
    await expect(page.getByText(/Venció el \d{1,2} [a-z]{3} \d{4}/)).toBeVisible();
    await sinIncidenciasGraves(page);
    await page.getByLabel("Tu correo corporativo").fill("otro@cliente.com");
    await page.getByRole("button", { name: "Pedir un enlace nuevo" }).click();
    // Sin worker en este e2e la petición queda pendiente: se muestra la pantalla neutra.
    await expect(
      page.getByRole("heading", { name: /Revisa tu buzón|Recibimos tu petición/ }),
    ).toBeVisible({ timeout: 40_000 });
    await expect(page.getByText(/#t=|\/e\//)).toHaveCount(0);
  });

  test("HU-144: con sesión, la selección con su razón; axe y sin scroll horizontal a 320/390; tema oscuro", async ({
    page,
    context,
    baseURL,
  }) => {
    const { enlaceId, invitadoId } = await sembrar({ correo: "ses@cliente.com" });
    await abrirSesion(context, baseURL!, enlaceId, invitadoId);
    const errores: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error" && !m.text().includes("favicon")) errores.push(m.text());
    });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Tres perfiles para Proyecto E2E" }),
    ).toBeVisible();
    await expect(page.getByText("Razón de la selección E2E.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ampliar la búsqueda al banco" })).toBeVisible();
    await expect(page.locator(".pp-perfil")).toHaveCount(3);
    await sinIncidenciasGraves(page);
    for (const ancho of [320, 390]) {
      await page.setViewportSize({ width: ancho, height: 800 });
      expect(await scrollHorizontal(page), `a ${ancho}`).toBe(0);
    }
    await page.getByRole("button", { name: "Cambiar a tema oscuro" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await sinIncidenciasGraves(page);
    expect(errores).toEqual([]);
  });

  test("HU-144: la revocación corta la sesión abierta en la siguiente petición", async ({
    page,
    context,
    baseURL,
  }) => {
    const { enlaceId, invitadoId } = await sembrar({ correo: "corta@cliente.com" });
    await abrirSesion(context, baseURL!, enlaceId, invitadoId);
    await page.goto("/");
    await expect(page.locator(".pp-perfil")).toHaveCount(3);
    const bd = new pg.Client({ connectionString: INSTALACION });
    await bd.connect();
    await bd.query(
      `UPDATE identidad.enlaces SET estado = 'revocado', revocado_en = now() WHERE id = $1`,
      [enlaceId],
    );
    await bd.end();
    await page.reload();
    await expect(page).toHaveURL(/\/acceso\?motivo=enlace_revocado$/);
    await expect(page.getByRole("heading", { name: "Este enlace ya no abre" })).toBeVisible();
    await expect(page.locator(".pp-perfil")).toHaveCount(0);
  });
});
