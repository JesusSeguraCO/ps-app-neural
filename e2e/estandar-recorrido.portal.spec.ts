// Recorrido del encabezado del estándar y de las fichas en un navegador real (EP-003 · SS7, tareas 7.5 y
// 7.7; HU-159, HU-178, HU-120). Una selección de 5 perfiles con un publicado incompleto (sin SARO): el
// encabezado describe el estándar sin «ningún» → completar ese último incompleto en el panel → recargar:
// el encabezado afirma «Ningún perfil…» → recorrer las fichas: «3 de 5» en computador y en teléfono, el
// último con el botón y el primero con la flecha del teclado sin dar la vuelta → cerrar vuelve a la misma
// lista (con el filtro del banco) en la posición del perfil. Los incompletos que ya había en la BD aislada
// se completan al empezar y se reponen tal cual al terminar (la frase «ningún» exige 0 en todo el banco).
import { randomBytes } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import {
  PANEL,
  arrancarWorker,
  conBd,
  enlace,
  publicar,
  sesionPanel,
  sinIncidenciasGraves,
} from "./ayudas/perfiles-publicados";

const NINGUNO = /^Ningún perfil llega al portal sin verificación de identidad bajo SARO/;
const DESCRIPTIVA =
  "El estándar exige a cada perfil verificación de identidad bajo SARO, prueba técnica revisada por Trycore y evaluación DISC.";

type Previo = {
  codigo: string;
  saro_alcance_id: string | null;
  saro_fecha: string | null;
  disc_fecha: string | null;
  modalidad_prueba_id: string | null;
};

async function completarIncompletosPrevios(): Promise<Previo[]> {
  return conBd(async (bd) => {
    const previos = (
      await bd.query(
        `SELECT p.codigo, p.saro_alcance_id, p.saro_fecha::text, p.disc_fecha::text, p.modalidad_prueba_id
           FROM inventario.perfiles p
           LEFT JOIN inventario.catalogo_modalidades_prueba m ON m.id = p.modalidad_prueba_id
          WHERE p.estado = 'publicado'
            AND (p.saro_alcance_id IS NULL OR p.saro_fecha IS NULL OR p.disc_fecha IS NULL
                 OR p.modalidad_prueba_id IS NULL OR NOT m.activo OR m.familia_id IS DISTINCT FROM p.familia_id)`,
      )
    ).rows as Previo[];
    if (previos.length)
      await bd.query(
        `UPDATE inventario.perfiles p
            SET saro_alcance_id = COALESCE(p.saro_alcance_id, (SELECT id FROM inventario.catalogo_alcances_saro WHERE activo LIMIT 1)),
                saro_fecha = COALESCE(p.saro_fecha, '2026-03-15'),
                disc_fecha = COALESCE(p.disc_fecha, '2026-04-10'),
                modalidad_prueba_id = CASE
                  WHEN EXISTS (SELECT 1 FROM inventario.catalogo_modalidades_prueba m
                                WHERE m.id = p.modalidad_prueba_id AND m.activo AND m.familia_id = p.familia_id)
                  THEN p.modalidad_prueba_id
                  ELSE (SELECT m.id FROM inventario.catalogo_modalidades_prueba m
                         WHERE m.familia_id = p.familia_id AND m.activo LIMIT 1) END
          WHERE p.codigo = ANY($1)`,
        [previos.map((p) => p.codigo)],
      );
    return previos;
  });
}

async function reponer(previos: Previo[]) {
  await conBd(async (bd) => {
    for (const p of previos)
      await bd.query(
        `UPDATE inventario.perfiles SET saro_alcance_id = $2, saro_fecha = $3, disc_fecha = $4, modalidad_prueba_id = $5 WHERE codigo = $1`,
        [p.codigo, p.saro_alcance_id, p.saro_fecha, p.disc_fecha, p.modalidad_prueba_id],
      );
  });
}

const frase = (page: Page) => page.locator(".ee-estandar__frase");
const enVista = (page: Page, sel: string) =>
  page.locator(sel).evaluate((e) => {
    const r = e.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= window.innerHeight;
  });

test.describe("estándar Neural-Grid y recorrido de fichas (EP-003 · SS7)", () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "portal", "solo el portal"));

  test("selección con un incompleto (descriptiva) → completarlo en el panel → «ningún» → recorrer fichas hasta los extremos → cerrar en la misma posición", async ({
    page,
    context,
  }) => {
    test.setTimeout(180_000);
    const sufijo = randomBytes(3)
      .toString("hex")
      .replace(/\d/g, (d) => "abcdefghij"[Number(d)]!);
    const errores: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error" && !m.text().includes("favicon")) errores.push(m.text());
    });
    page.on("pageerror", (e) => errores.push(e.message));
    await sesionPanel(context);
    const codigos = await publicar(
      page,
      ["Ana", "Bea", "Cris", "Dora", "Eli"].map((n) => ({
        nombre: `${n}${sufijo}`,
        sello: [],
        tecnologias: ["Java"],
        sectores: [],
      })),
    );
    const heredado = codigos[4]!;
    const previos = await completarIncompletosPrevios();
    try {
      await conBd((bd) =>
        bd.query(
          `UPDATE inventario.perfiles SET saro_alcance_id = NULL, saro_fecha = NULL WHERE codigo = $1 AND estado = 'publicado'`,
          [heredado],
        ),
      );
      const correo = `lider-${sufijo}@bancolombia.com`;
      const token = await enlace(codigos, correo);
      const worker = arrancarWorker();
      try {
        await page.goto(`/e/#t=${token}`);
        await page.getByLabel("Correo corporativo").fill(correo);
        await page.getByRole("button", { name: "Enviarme el código" }).click();
        const codigo = await worker.codigoPara(correo);
        for (let i = 0; i < 6; i++) await page.getByLabel(`Dígito ${i + 1}`).fill(codigo[i]!);
        await page.getByRole("button", { name: "Entrar" }).click();
      } finally {
        worker.proceso.kill("SIGTERM");
      }
      await expect(page.getByRole("heading", { name: "Los 5 perfiles del correo" })).toBeVisible();

      // 1. Un publicado incompleto: el encabezado describe el estándar, antes del primer perfil, una vez.
      await expect(frase(page)).toHaveText(DESCRIPTIVA);
      await expect(page.locator(".ee-estandar")).toHaveCount(1);
      await expect(page.locator(".ee-estandar")).toContainText("cuatro dimensiones");
      await expect(page.locator(".ee-dim")).toHaveText([
        /Grid de Seguridad/,
        /Grid Técnico/,
        /Neural Fit/,
        /Neural Speed/,
      ]);
      const antes = await page.evaluate(() => {
        const e = document.querySelector(".ee-estandar")!;
        const t = document.querySelector(".pp-perfil")!;
        return Boolean(e.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING);
      });
      expect(antes).toBe(true);
      await expect(
        page.locator(".pp-perfil .ee-estandar, .pp-perfil :text('Neural-Grid')"),
      ).toHaveCount(0);
      const respaldo = page.locator(".ee-respaldo");
      await expect(respaldo).toContainText("Trycore University");
      await expect(respaldo).toContainText("Hive Mind");
      await expect(respaldo).toContainText("Coordinación de Servicio dedicada");
      await expect(respaldo.locator(".ee-respaldo__sla")).toHaveText(
        "Trycore responde a tu solicitud en 10 días hábiles.",
      );
      const tam = (sel: string) =>
        page
          .locator(sel)
          .first()
          .evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
      expect(await tam(".ee-respaldo__sla")).toBeGreaterThanOrEqual(await tam(".pp-franja__texto"));
      await sinIncidenciasGraves(page);

      // 2. Completar ese último incompleto en el panel → recargar: el encabezado afirma «ningún».
      await page.goto(`${PANEL}/inventario/${heredado}`);
      await page.locator("#pe-saro-alcance").selectOption({ index: 1 });
      await page.locator("#pe-saro-fecha").fill("2026-03-15");
      await page
        .getByRole("button", { name: /^Guardar/ })
        .first()
        .click();
      await page
        .getByRole("dialog", { name: "Esto cambia para el cliente" })
        .getByRole("button", { name: "Confirmar cambios" })
        .click();
      await expect(page.getByText("Cambios confirmados. El portal ya los muestra.")).toBeVisible();
      await page.goto("/");
      await expect(frase(page)).toHaveText(NINGUNO);
      await expect(frase(page)).not.toContainText(/\d/);

      // 3. Teléfono: el encabezado en el flujo, se baja hasta el primer perfil sin cerrar nada y no reaparece encima.
      await page.setViewportSize({ width: 390, height: 844 });
      expect(await page.locator(".ee-estandar").evaluate((e) => getComputedStyle(e).position)).toBe(
        "static",
      );
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await page.locator(".pp-perfil").nth(2).scrollIntoViewIfNeeded();
      // Al recorrer la lista, el encabezado queda arriba, en su sitio: nunca encima de una tarjeta.
      const caja = (await page.locator(".ee-estandar").boundingBox())!;
      for (const i of [0, 1, 2]) {
        const t = (await page.locator(".pp-perfil").nth(i).boundingBox())!;
        expect(caja.y + caja.height, `tarjeta ${i + 1}`).toBeLessThanOrEqual(t.y);
      }
      expect(
        await page.evaluate(
          () => document.scrollingElement!.scrollWidth - document.scrollingElement!.clientWidth,
        ),
      ).toBe(0);

      // 4. HU-120 en el teléfono: del segundo al tercero, pantalla completa con anterior / siguiente y «3 de 5».
      await page.goto(`/?ficha=${codigos[1]}`);
      await page.getByRole("dialog").getByRole("link", { name: "Perfil siguiente" }).click();
      await expect(page).toHaveURL(new RegExp(`ficha=${codigos[2]}`));
      let hoja = page.getByRole("dialog");
      await expect(hoja.locator(".fp-barra__pos b")).toHaveText("3 de 5");
      expect((await hoja.boundingBox())!.width).toBe(390);
      await expect(hoja.getByRole("link", { name: "Perfil anterior" })).toBeVisible();

      // 5. Computador: panel lateral sobre la lista, que sigue visible detrás, con «3 de 5».
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/?ficha=${codigos[1]}`);
      await page.keyboard.press("ArrowRight");
      await expect(page).toHaveURL(new RegExp(`ficha=${codigos[2]}`));
      hoja = page.getByRole("dialog");
      await expect(hoja.locator(".fp-barra__pos b")).toHaveText("3 de 5");
      expect((await hoja.boundingBox())!.width).toBeLessThan(1440);
      await expect(page.locator(".pp-perfil.fp-abierta")).toBeVisible();

      // 6. El último con el botón: deshabilitado, sigue en «5 de 5», sin saltar al primero.
      await page.goto(`/?ficha=${codigos[4]}`);
      const siguiente = page.getByRole("dialog").getByRole("button", { name: "Perfil siguiente" });
      await expect(siguiente).toBeDisabled();
      await siguiente.click({ force: true });
      await expect(page).toHaveURL(new RegExp(`ficha=${codigos[4]}$`));
      await expect(page.getByRole("dialog").locator(".fp-barra__pos b")).toHaveText("5 de 5");

      // 7. El primero con la flecha izquierda: sigue en «1 de 5», «anterior» deshabilitado, sin saltar al último.
      await page.goto(`/?ficha=${codigos[0]}`);
      await page.keyboard.press("ArrowLeft");
      await page.waitForTimeout(300);
      await expect(page).toHaveURL(new RegExp(`ficha=${codigos[0]}$`));
      await expect(page.getByRole("dialog").locator(".fp-barra__pos b")).toHaveText("1 de 5");
      await expect(
        page.getByRole("dialog").getByRole("button", { name: "Perfil anterior" }),
      ).toBeDisabled();

      // 8. Cerrar en el banco filtrado: la misma lista, el mismo filtro y la posición del tercer perfil.
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/banco?categoria=Desarrollo");
      const tarjetas = page.locator(".pp-perfil");
      const tercero = await tarjetas.nth(2).locator(".pp-perfil__rol").getAttribute("id");
      await tarjetas
        .nth(2)
        .getByRole("link", { name: /^Ver ficha/ })
        .click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByRole("dialog").locator(".fp-barra__pos b")).toHaveText(/^3 de \d+$/);
      await page.keyboard.press("Escape");
      await expect(page).toHaveURL(new RegExp(`/banco\\?categoria=Desarrollo#${tercero}$`));
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(page.locator(".pp-chip__valor")).toHaveText(["Desarrollo"]);
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
      expect(await enVista(page, `#${tercero}`)).toBe(true);
      await sinIncidenciasGraves(page);
      expect(errores).toEqual([]);
    } finally {
      await reponer(previos);
    }
  });
});
