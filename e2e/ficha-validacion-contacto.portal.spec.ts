// Recorrido de la ficha en un navegador real (EP-003 · SS5, tarea 5.6; HU-154, HU-155, HU-157): entrar
// con el código → abrir la ficha desde la selección → «Verificado por Trycore» y «Declarado por la
// persona» → plegar y desplegar la validación técnica con clic (computador) y con toque (teléfono) → el
// contacto vigente en el bloque de conversación → cambiar el contacto en el panel → la ficha lo refleja.
// Un perfil con reporte confirmado (Nivel 1) y otro solo con la modalidad (Nivel 0). El contacto es una
// fila única que también escriben otros e2e: se turnan con el mismo candado y se repone al terminar.
import { randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import pg from "pg";
import {
  INSTALACION,
  PANEL,
  arrancarWorker,
  confirmarReporte,
  enlace,
  publicar,
  sesionPanel,
  sinIncidenciasGraves,
} from "./ayudas/perfiles-publicados";

const CANDADO_CONTACTO = 147_147;

test.describe("ficha del perfil (EP-003 · SS5)", () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "portal", "solo el portal"));

  test("código → ficha (verificado/declarado) → validación técnica desplegable → contacto → cambiarlo en el panel → la ficha lo refleja", async ({
    page,
    context,
  }) => {
    test.setTimeout(150_000);
    const sufijo = randomBytes(3)
      .toString("hex")
      .replace(/\d/g, (d) => "abcdefghij"[Number(d)]!);
    await sesionPanel(context);
    const [nivel1, nivel0] = await publicar(page, [
      {
        nombre: `Dana${sufijo}`,
        sello: ["Liderazgo técnico", "Pensamiento sistémico", "Comunicación clara"],
        tecnologias: ["Java", "Kafka"],
        sectores: ["Banca"],
        experiencia: "Diseñó la arquitectura de pagos para un banco con 3 millones de usuarios.",
      },
      { nombre: `Eva${sufijo}`, sello: [], tecnologias: ["Java"], sectores: [] },
    ]);
    await confirmarReporte(page, nivel1!, {
      evaluador: "Célula de arquitectura de Trycore",
      fecha: "2026-02-18",
      resultado: "Aprobada 4,5/5",
    });
    const correo = `lider-${sufijo}@bancolombia.com`;
    const token = await enlace([nivel1!, nivel0!], correo);
    const errores: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error" && !m.text().includes("favicon")) errores.push(m.text());
    });

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
    await expect(page.getByRole("heading", { name: "Los 2 perfiles del correo" })).toBeVisible();

    const bd = new pg.Client({ connectionString: INSTALACION });
    await bd.connect();
    await bd.query(`SELECT pg_advisory_lock($1)`, [CANDADO_CONTACTO]);
    const previo = (await bd.query(`SELECT * FROM inventario.configuracion_contacto`)).rows[0];
    try {
      await bd.query(
        `INSERT INTO inventario.configuracion_contacto (unica, correo, nombre, cargo, actualizado_por, actualizado_en)
         VALUES (true, 'eida.tinjaca@trycore.com', 'Eida Tinjacá', 'Coordinación de Servicio',
                 (SELECT id FROM identidad_panel.usuarios_panel WHERE correo = 'e2e-portal-perfiles@trycore.com'), now())
         ON CONFLICT (unica) DO UPDATE SET correo = EXCLUDED.correo, nombre = EXCLUDED.nombre, cargo = EXCLUDED.cargo`,
      );

      // 1. Abrir la ficha desde la selección.
      await page.getByRole("link", { name: `Ver ficha de Dana${sufijo} Tarjeta` }).click();
      const ficha = page.getByRole("dialog");
      await expect(ficha).toBeVisible();
      const verificado = ficha.locator("section", { has: page.locator("#fp-verificado") });
      const declarado = ficha.locator("section", { has: page.locator("#fp-declarado") });
      await expect(
        verificado.getByRole("heading", { name: "Verificado por Trycore" }),
      ).toBeVisible();
      await expect(
        declarado.getByRole("heading", { name: "Declarado por la persona" }),
      ).toBeVisible();
      await expect(declarado).toContainText("Diseñó la arquitectura de pagos");
      await expect(verificado).not.toContainText("arquitectura de pagos");

      // 2. La validación técnica: abierta por omisión, se pliega y despliega con clic.
      const vt = ficha.locator("details.fp-validacion");
      await expect(vt).toHaveAttribute("open", "");
      await expect(vt.locator("dt")).toHaveText([
        "Prueba aplicada",
        "Qué se evaluó",
        "Resultado",
        "Evaluador",
        "Fecha",
      ]);
      await expect(vt.locator("dd").nth(0)).toHaveText(
        "Prueba práctica revisada por un arquitecto",
      );
      await expect(vt.locator("dd").nth(2)).toHaveText("Cumple el estándar");
      await expect(vt.locator("dd").nth(3)).toHaveText("Célula de arquitectura de Trycore");
      await expect(vt.locator("dd").nth(4)).toHaveText("febrero de 2026");
      await expect(vt).toContainText(
        "La evidencia de la validación puede revisarse en la sesión de alineación con Trycore.",
      );
      await expect(vt.locator("a")).toHaveCount(0);
      await expect(ficha).not.toContainText("4,5");
      await vt.locator("summary").click();
      await expect(vt).not.toHaveAttribute("open");
      await expect(vt.locator("dl")).toBeHidden();
      await vt.locator("summary").click();
      await expect(vt.locator("dl")).toBeVisible();

      // 3. El contacto vigente, sin desplegar nada.
      const contacto = ficha.locator("section.fp-contacto");
      await expect(contacto).toBeVisible();
      await expect(contacto).toContainText(
        "La conversación sobre este profesional va por Trycore.",
      );
      await expect(contacto).toContainText(
        "Eida Tinjacá, Coordinación de Servicio: eida.tinjaca@trycore.com",
      );
      await expect(ficha.getByText("Escribir a Trycore")).toHaveCount(0);
      await sinIncidenciasGraves(page);

      // 4. Cambiar el contacto en el panel → la ficha lo refleja en la siguiente apertura.
      const url = page.url();
      await page.goto(`${PANEL}/administracion/contacto`);
      await page.getByLabel("Nombre (opcional)").fill("Ana Ruiz");
      await page.getByLabel("Cargo (opcional)").fill("Dirección Comercial");
      await page.getByLabel("Correo", { exact: true }).fill("ana.ruiz@trycore.com");
      await page.getByRole("button", { name: "Guardar contacto" }).click();
      await expect(page.getByText("Contacto guardado.")).toBeVisible();
      await page.goto(url);
      await expect(page.getByRole("dialog").locator("section.fp-contacto")).toContainText(
        "Ana Ruiz, Dirección Comercial: ana.ruiz@trycore.com",
      );

      // 4b. La vista previa del panel dibuja la misma ficha (HU-129): mismos bloques y el mismo contacto.
      await page.goto(`${PANEL}/inventario/${nivel1}?vista=ficha`);
      const previa = page.locator("#vp-vista");
      await expect(previa.getByRole("heading", { name: "Verificado por Trycore" })).toBeVisible();
      await expect(previa.getByRole("heading", { name: "Declarado por la persona" })).toBeVisible();
      await expect(previa.locator("details.fp-validacion dd").nth(2)).toHaveText("Cumple el estándar");
      await expect(previa.locator("section.fp-contacto")).toContainText(
        "Ana Ruiz, Dirección Comercial: ana.ruiz@trycore.com",
      );
      await page.goto(url);

      // 5. Nivel 0: solo la prueba aplicada, sin fecha ni promesa; en el ancho de teléfono se pliega con el mismo control.
      await page.keyboard.press("ArrowRight");
      await expect(page).toHaveURL(new RegExp(`ficha=${nivel0}`));
      const vt0 = page.getByRole("dialog").locator("details.fp-validacion");
      await expect(vt0.locator("dt")).toHaveText(["Prueba aplicada"]);
      await expect(vt0).not.toContainText(/Fecha|pendiente|no aplica|sesión de alineación/);
      await page.setViewportSize({ width: 390, height: 844 });
      // details/summary nativo: el mismo control para clic y toque (no depende del cursor).
      await vt0.locator("summary").click();
      await expect(vt0).not.toHaveAttribute("open");
      await vt0.locator("summary").click();
      await expect(vt0).toHaveAttribute("open", "");
      await sinIncidenciasGraves(page);
      expect(errores).toEqual([]);
    } finally {
      await bd.query(`DELETE FROM inventario.configuracion_contacto`);
      if (previo)
        await bd.query(
          `INSERT INTO inventario.configuracion_contacto (unica, correo, nombre, cargo, actualizado_por, actualizado_en)
           VALUES (true, $1, $2, $3, $4, $5)`,
          [
            previo.correo,
            previo.nombre,
            previo.cargo,
            previo.actualizado_por,
            previo.actualizado_en,
          ],
        );
      await bd.end();
    }
  });
});
