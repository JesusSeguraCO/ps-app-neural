// Shell del esqueleto en un navegador real: 0 violaciones de CSP (ADR-0010 QA-5), accesibilidad axe sin
// incidencias serias ni críticas y móvil a 320 y 390 px (V8-7: M-1, M-2, M-3, M-8), y la redirección
// de una página protegida sin sesión.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const PAGINAS: Record<string, string[]> = {
  portal: ["/acceso", "/acceso?motivo=enlace_vencido", "/e"],
  panel: ["/acceso"],
};

async function vigilarCsp(page: Page): Promise<() => Promise<string[]>> {
  await page.addInitScript(() => {
    (window as unknown as { __csp: string[] }).__csp = [];
    document.addEventListener("securitypolicyviolation", (e) => {
      (window as unknown as { __csp: string[] }).__csp.push(
        `${e.violatedDirective} ${e.blockedURI}`,
      );
    });
  });
  const errores: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errores.push(m.text());
  });
  return async () => [
    ...errores,
    ...(await page.evaluate(() => (window as unknown as { __csp: string[] }).__csp)),
  ];
}

test.describe("shell del esqueleto", () => {
  for (const ruta of ["/acceso", "/e"]) {
    test(`sin violaciones de CSP ni errores de consola en ${ruta}`, async ({ page }, info) => {
      test.skip(!PAGINAS[info.project.name]!.includes(ruta), "ruta de la otra app");
      const incidencias = await vigilarCsp(page);
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      expect(await incidencias()).toEqual([]);
    });
  }

  test("accesibilidad: 0 incidencias serias o críticas (axe, WCAG 2.1 AA)", async ({
    page,
  }, info) => {
    for (const ruta of PAGINAS[info.project.name]!) {
      await page.goto(ruta);
      const r = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(graves.map((v) => `${ruta}: ${v.id}`)).toEqual([]);
    }
  });

  for (const ancho of [320, 390]) {
    test(`móvil a ${ancho} px: sin scroll horizontal, controles de 44 px, campos de 16 px, texto ≥ 13 px`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width: ancho, height: 800 });
      for (const ruta of PAGINAS[info.project.name]!) {
        await page.goto(ruta);
        const m = await page.evaluate(() => {
          const raiz = document.scrollingElement!;
          const accionables = [
            ...document.querySelectorAll("a, button, [role=button], input, select, textarea"),
          ] as HTMLElement[];
          const pequenos = accionables
            .map((el) => el.getBoundingClientRect())
            .filter((r) => r.width > 0 && (r.width < 44 || r.height < 44)).length;
          const campos = (
            [...document.querySelectorAll("input, select, textarea")] as HTMLElement[]
          ).filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16).length;
          const textos = ([...document.querySelectorAll("body *")] as HTMLElement[]).filter(
            (el) =>
              [...el.childNodes].some(
                (n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim(),
              ) && parseFloat(getComputedStyle(el).fontSize) < 13,
          ).length;
          return { scroll: raiz.scrollWidth - raiz.clientWidth, pequenos, campos, textos };
        });
        // M-1 y M-8 son de la cara cliente (PRD §8.1); M-2 y M-3, de todo control.
        const esperado = { scroll: 0, pequenos: 0, campos: 0, textos: info.project.name === "portal" ? 0 : m.textos };
        expect(m, `${ruta} a ${ancho}px`).toEqual(esperado);
      }
    });
  }

  test("una página protegida sin sesión lleva a /acceso sin mostrar datos", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/acceso$/);
  });
});
