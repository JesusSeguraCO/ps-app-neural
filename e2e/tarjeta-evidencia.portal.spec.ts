// Recorrido de la tarjeta en un navegador real (EP-003 · SS4, tarea 4.7; HU-153, HU-081, HU-119):
// entrar con el código que llega al buzón → la selección del correo (tarjetas con la capacidad primero,
// el Sello Personal y el código al pie, sin evidencia) → ampliar al banco → filtrar por una categoría →
// cada tarjeta con su línea ✓ → abrir la ficha con «Frente a tu búsqueda» y la misma línea. Los tres
// perfiles los crea el spec por la API del panel (publicados con las validaciones de entrada y el Sello
// Personal); el código lo envía el worker real del worktree con el doble de Mailgun (APP_ENV=local), y
// el spec lo lee de su registro, como lo leería la persona en su buzón.
import { randomBytes } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { arrancarWorker, enlace, publicar, sesionPanel, sinIncidenciasGraves } from "./ayudas/perfiles-publicados";

const SELLO_A = [
  "Comunicación directa con negocio",
  "Rigor en la documentación",
  "Calma bajo presión",
];
const SELLO_B = ["Liderazgo técnico", "Pensamiento sistémico", "Comunicación clara"];

const tarjetaDe = (page: Page, codigo: string) =>
  page.locator("article.pp-perfil", {
    has: page.locator(".pp-codigo-perfil", { hasText: codigo }),
  });

test.describe("tarjeta del perfil (EP-003 · SS4)", () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "portal", "solo el portal"));

  test("código → selección (capacidad, sello, código al pie, sin evidencia) → banco filtrado (✓) → ficha con «Frente a tu búsqueda»", async ({
    page,
    context,
  }) => {
    test.setTimeout(120_000);
    const sufijo = randomBytes(3)
      .toString("hex")
      .replace(/\d/g, (d) => "abcdefghij"[Number(d)]!);
    await sesionPanel(context);
    const [conA, conB, sinSello] = await publicar(page, [
      {
        nombre: `Ana${sufijo}`,
        sello: SELLO_A,
        tecnologias: ["Java", "Spring Boot", "Kafka", "PostgreSQL", "AWS", "Terraform"],
        sectores: ["Banca"],
      },
      { nombre: `Bea${sufijo}`, sello: SELLO_B, tecnologias: ["Java", "Kafka"], sectores: [] },
      { nombre: `Cris${sufijo}`, sello: [], tecnologias: ["Java"], sectores: ["Seguros"] },
    ]);
    const correo = `lider-${sufijo}@bancolombia.com`;
    const token = await enlace([conA!, conB!, sinSello!], correo);
    const errores: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error" && !m.text().includes("favicon")) errores.push(m.text());
    });

    // 1. Entrar con el código que llega al buzón.
    const worker = arrancarWorker();
    try {
      await worker.listo();
      await page.goto(`/e/#t=${token}`);
      await page.getByLabel("Correo corporativo").fill(correo);
      await page.getByRole("button", { name: "Enviarme el código" }).click();
      await expect(page.getByLabel("Dígito 1")).toBeFocused();
      const codigo = await worker.codigoPara(correo);
      for (let i = 0; i < 6; i++) await page.getByLabel(`Dígito ${i + 1}`).fill(codigo[i]!);
      await page.getByRole("button", { name: "Entrar" }).click();
    } finally {
      worker.proceso.kill("SIGTERM");
    }

    // 2. La selección del correo: la capacidad primero, el sello como verificado, el código al pie.
    await expect(page.getByRole("heading", { name: "Los 3 perfiles del correo" })).toBeVisible();
    const a = tarjetaDe(page, conA!);
    await expect(a.getByRole("heading", { level: 3 })).toHaveText(
      "Desarrolladora backend Java · Senior · 9 años de experiencia",
    );
    await expect(a.locator(".pp-perfil__nombre")).toHaveText(`Ana${sufijo} Tarjeta`);
    await expect(a.locator(".pp-perfil__tecnologias li")).toHaveText([
      "Java",
      "Spring Boot",
      "Kafka",
      "PostgreSQL",
      "AWS",
    ]);
    await expect(a.locator(".pp-perfil__meta li")).toHaveText(["Banca", "Remoto", "Colombia"]);
    await expect(a.locator(".pp-estado")).toHaveText("En 2 semanas");
    await expect(a.locator(".rs-sello")).toHaveText(`Sello Personal${SELLO_A.join(" · ")}`);
    await expect(a.locator(".pp-bloque__rotulo")).toHaveText("Verificado por Trycore");
    await expect(a.locator(".pp-perfil__pie .pp-codigo-perfil")).toHaveText(conA!);
    await expect(tarjetaDe(page, conB!).locator(".rs-sello")).toHaveText(
      `Sello Personal${SELLO_B.join(" · ")}`,
    );
    await expect(tarjetaDe(page, conB!).locator(".pp-perfil__meta li")).toHaveText([
      "Remoto",
      "Colombia",
    ]);
    await expect(tarjetaDe(page, sinSello!).locator(".pp-evidencia")).toHaveCount(0);
    // Sin criterios activos: ninguna línea de evidencia en la selección.
    await expect(page.locator(".pp-criterio")).toHaveCount(0);
    await sinIncidenciasGraves(page);

    // 3. Ampliar al banco y filtrar por la categoría: cada tarjeta con su línea ✓.
    await page.getByRole("link", { name: "Ampliar la búsqueda al banco" }).click();
    await expect(page).toHaveURL(/\/banco$/);
    await expect(page.locator(".pp-criterio")).toHaveCount(0);
    await page
      .locator(".as-familias")
      .getByRole("link", { name: "Desarrollo", exact: true })
      .click();
    await expect(page).toHaveURL(/\/banco\?categoria=Desarrollo$/);
    const lineaA = tarjetaDe(page, conA!).locator(".pp-criterio");
    await expect(lineaA).toHaveCount(1);
    await expect(lineaA).toHaveClass(/pp-criterio--cumple/);
    await expect(lineaA.locator(".pp-criterio__marca")).toHaveText("✓");
    await expect(lineaA).toContainText("Categoría: Desarrollo");
    const total = await page.locator("article.pp-perfil").count();
    await expect(page.locator(".pp-criterio--cumple")).toHaveCount(total);
    await expect(page.locator(".pp-criterio--no")).toHaveCount(0);
    await sinIncidenciasGraves(page);

    // 4. Abrir la ficha: «Frente a tu búsqueda» con la misma línea, en el mismo orden.
    await tarjetaDe(page, conA!)
      .getByRole("link", { name: /^Ver ficha/ })
      .click();
    const ficha = page.getByRole("dialog");
    await expect(ficha).toBeVisible();
    await expect(ficha.getByRole("heading", { name: "Frente a tu búsqueda" })).toBeVisible();
    await expect(ficha.locator(".fp-criterio")).toHaveCount(1);
    await expect(ficha.locator(".fp-criterio__marca")).toHaveText("✓");
    await expect(ficha.locator(".fp-criterio__nombre")).toContainText("Categoría: Desarrollo");
    await expect(ficha.getByText(SELLO_A.join(" · "))).toBeVisible();
    await sinIncidenciasGraves(page);

    // 5. La ficha desde la selección no tiene el bloque (sin criterios).
    await page.goto(`/?ficha=${conA}`);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("Frente a tu búsqueda")).toHaveCount(0);
    expect(errores).toEqual([]);
  });
});
