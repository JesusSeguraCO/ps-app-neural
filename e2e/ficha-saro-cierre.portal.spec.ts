// Recorrido de la ficha en un navegador real (EP-003 · SS6, tarea 6.6; HU-156, HU-158): entrar con el
// código → ficha de un perfil completo (SARO con el texto del alcance y su mes, DISC con su mes y las
// competencias, condiciones de trabajo, SLA en el tamaño del texto, garantía Neural Speed y el código solo
// al pie) → ficha de un publicado heredado sin SARO (sin la línea y sin marca de incompleto) → completarlo
// en el panel → la ficha muestra la línea. El heredado se fabrica como en datos reales (D62): se publica
// completo y luego se le quita la verificación SARO.
import { randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import {
  PANEL,
  arrancarWorker,
  conBd,
  enlace,
  publicar,
  sesionPanel,
  sinIncidenciasGraves,
} from "./ayudas/perfiles-publicados";

const SELLO = ["Liderazgo técnico", "Pensamiento sistémico", "Comunicación clara"];
const SLA = "Trycore responde a tu solicitud en 10 días hábiles.";

test.describe("ficha del perfil · SARO, DISC y cierre (EP-003 · SS6)", () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "portal", "solo el portal"));

  test("código → ficha completa (SARO, DISC, cierre, código al pie) → heredado sin SARO (sin línea ni marca) → completarlo en el panel → la ficha muestra la línea", async ({
    page,
    context,
  }) => {
    test.setTimeout(150_000);
    const sufijo = randomBytes(3)
      .toString("hex")
      .replace(/\d/g, (d) => "abcdefghij"[Number(d)]!);
    await sesionPanel(context);
    const [completo, heredado] = await publicar(page, [
      {
        nombre: `Gala${sufijo}`,
        sello: SELLO,
        tecnologias: ["Java", "Kafka"],
        sectores: ["Banca"],
      },
      { nombre: `Hugo${sufijo}`, sello: [], tecnologias: ["Java"], sectores: [] },
    ]);
    const alcance = await conBd(async (bd) => {
      await bd.query(
        `UPDATE inventario.perfiles SET saro_alcance_id = NULL, saro_fecha = NULL WHERE codigo = $1 AND estado = 'publicado'`,
        [heredado],
      );
      return (
        await bd.query(
          `SELECT c.texto_cliente FROM inventario.perfiles p JOIN inventario.catalogo_alcances_saro c ON c.id = p.saro_alcance_id WHERE p.codigo = $1`,
          [completo],
        )
      ).rows[0].texto_cliente as string;
    });
    const correo = `lider-${sufijo}@bancolombia.com`;
    const token = await enlace([completo!, heredado!], correo);
    const errores: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error" && !m.text().includes("favicon")) errores.push(m.text());
    });
    page.on("pageerror", (e) => errores.push(e.message));

    const worker = arrancarWorker();
    try {
      await worker.listo();
      await page.goto(`/e/#t=${token}`);
      await page.getByLabel("Correo corporativo").fill(correo);
      await page.getByRole("button", { name: "Enviarme el código" }).click();
      const codigo = await worker.codigoPara(correo);
      for (let i = 0; i < 6; i++) await page.getByLabel(`Dígito ${i + 1}`).fill(codigo[i]!);
      await page.getByRole("button", { name: "Entrar" }).click();
    } finally {
      worker.proceso.kill("SIGTERM");
    }
    await expect(page.getByRole("heading", { name: "Los 2 perfiles del correo" })).toBeVisible();

    // 1. Ficha completa: SARO y DISC como contenido en lo verificado.
    await page.getByRole("link", { name: `Ver ficha de Gala${sufijo} Tarjeta` }).click();
    const ficha = page.getByRole("dialog");
    await expect(ficha).toBeVisible();
    await expect(ficha.locator("#vp-fila-seguridad dd")).toHaveText(`${alcance} · marzo de 2026`);
    await expect(ficha.locator("#vp-fila-disc dd")).toHaveText(
      `abril de 2026Sello Personal: ${SELLO.join(" · ")}`,
    );
    await expect(
      ficha.locator("#vp-fila-seguridad .pp-badge, #vp-fila-disc .pp-badge"),
    ).toHaveCount(0);
    await expect(ficha).not.toContainText(/%|puntaje|aprobad/i);

    // 2. El cierre: condiciones de trabajo, el servicio de Trycore y el código solo al pie.
    const condiciones = ficha.locator("section.fp-condiciones");
    await expect(condiciones).toContainText("Remoto");
    await expect(condiciones).toContainText("Colombia");
    await expect(condiciones).toContainText("En 2 semanas");
    const servicio = ficha.locator("section.fp-servicio");
    await expect(servicio.locator(".fp-servicio__sla")).toHaveText(SLA);
    await expect(servicio).toContainText("agentes de IA desde el día 1");
    await expect(servicio).toContainText("línea directa al CoE");
    const tamano = (sel: string) =>
      ficha
        .locator(sel)
        .first()
        .evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    const sla = await tamano(".fp-servicio__sla");
    // En el tamaño del texto de la ficha (el del resumen y la persona), no en letra pequeña.
    expect(sla).toBe(await tamano(".fp-persona"));
    expect(sla).toBeGreaterThan(await tamano(".fp-referencia"));
    await expect(ficha.locator(".fp-referencia")).toHaveText(
      `Referencia interna ${completo}. Todos los perfiles que publicamos pasan por nuestro estándar Neural-Grid™.`,
    );
    await expect(ficha.locator("header")).not.toContainText(completo!);
    expect(await page.title()).not.toContain(completo!);
    await ficha.locator(".fp-referencia").scrollIntoViewIfNeeded();
    await sinIncidenciasGraves(page);

    // 3. El heredado sin SARO: sin la línea, sin marca de incompleto, el resto completo.
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(new RegExp(`ficha=${heredado}`));
    const h = page.getByRole("dialog");
    await expect(h.locator(".fp-referencia")).toContainText(heredado!);
    await expect(h.locator("#vp-fila-seguridad")).toHaveCount(0);
    await expect(h).not.toContainText(/SARO|incomplet|pendiente|no aplica|falta/i);
    await expect(h.locator("#vp-fila-disc dd")).toHaveText("abril de 2026");
    await expect(h.locator("details.fp-validacion")).toBeVisible();
    await expect(h.locator("section.fp-servicio .fp-servicio__sla")).toHaveText(SLA);
    const url = page.url();

    // 4. Completar la verificación SARO en el panel y confirmar.
    await page.goto(`${PANEL}/inventario/${heredado}`);
    await page.locator("#pe-saro-alcance").selectOption({ index: 1 });
    await page.locator("#pe-saro-fecha").fill("2026-03-15");
    await page
      .getByRole("button", { name: /^Guardar/ })
      .first()
      .click();
    const impacto = page.getByRole("dialog", { name: "Esto cambia para el cliente" });
    await impacto.getByRole("button", { name: "Confirmar cambios" }).click();
    await expect(page.getByText("Cambios confirmados. El portal ya los muestra.")).toBeVisible();

    // 5. La ficha del portal ya muestra la línea, con el texto del alcance elegido y su mes.
    await page.goto(url);
    await expect(page.getByRole("dialog").locator("#vp-fila-seguridad dd")).toContainText(
      "· marzo de 2026",
    );
    // Teléfono: el cierre y la referencia sin desbordar.
    await page.setViewportSize({ width: 390, height: 844 });
    const scroll = await page.evaluate(
      () => document.scrollingElement!.scrollWidth - document.scrollingElement!.clientWidth,
    );
    expect(scroll).toBe(0);
    await sinIncidenciasGraves(page);
    expect(errores).toEqual([]);
  });
});
