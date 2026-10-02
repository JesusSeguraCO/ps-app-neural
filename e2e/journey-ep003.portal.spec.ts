// Recorrido integrado de EP-003 de punta a punta en un navegador real (tarea 8.1): panel → catálogos
// (crear un alcance SARO con su texto de cara al cliente) → editor (un perfil nuevo sin la fecha DISC:
// publicar queda bloqueado con «Falta …» y salta al campo; completarla y publicar) → un publicado
// heredado sin SARO aparece «Incompleto» en el listado y en su filtro → importación (pegar SARO y DISC
// de otro heredado con el alcance creado; el worker aplica) → portal con enlace e invitado: la tarjeta
// del perfil completo con el bloque verificado, la ficha con la línea SARO (texto del alcance creado) y
// la DISC, el heredado sin marca de incompleto → el encabezado del estándar con la frase descriptiva.
// Todo con sufijo aleatorio; los incompletos que ya había en la BD aislada se completan al empezar y se
// reponen tal cual al terminar (la frase del estándar depende de todo el banco).
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

const SARO = "la verificación SARO (alcance y fecha)";
const DESCRIPTIVA =
  "El estándar exige a cada perfil verificación de identidad bajo SARO, prueba técnica revisada por Trycore y evaluación DISC.";
const SELLO = ["Liderazgo técnico", "Pensamiento sistémico", "Comunicación clara"];
const ENC = {
  alcance: "Alcance de la verificación SARO (del catálogo)",
  saro: "Fecha de la verificación SARO (AAAA-MM-DD o DD/MM/AAAA)",
  disc: "Fecha de la evaluación DISC (AAAA-MM-DD o DD/MM/AAAA)",
};

type Previo = {
  codigo: string;
  saro_alcance_id: string | null;
  saro_fecha: string | null;
  disc_fecha: string | null;
  modalidad_prueba_id: string | null;
};

// Como en estandar-recorrido.portal.spec.ts (SS7): completa los publicados incompletos previos.
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

// Un borrador con consentimiento nominal y Sello Personal, sin SARO ni DISC, por la API del panel (la
// misma vía que el editor; como validaciones-entrada.panel.spec.ts). Devuelve su código.
async function borradorSinValidaciones(page: Page, nombre: string): Promise<string> {
  const ids = await conBd(async (bd) => {
    const id = async (tabla: string, nombre: string) =>
      (await bd.query(`SELECT id FROM inventario.${tabla} WHERE nombre = $1`, [nombre])).rows[0]
        .id as string;
    return {
      rolId: await id("catalogo_roles", "Desarrolladora backend Java"),
      tecnologiaIds: [await id("catalogo_tecnologias", "Java")],
      seniorityId: await id("catalogo_seniorities", "Senior"),
      ciudadId: await id("catalogo_ciudades", "Medellín"),
      modalidadTrabajoId: await id("catalogo_modalidades", "hibrido"),
      modalidadPruebaId: await id(
        "catalogo_modalidades_prueba",
        "Prueba práctica revisada por un arquitecto",
      ),
    };
  });
  await page.goto(`${PANEL}/inventario`);
  return page.evaluate(
    async ({ ids, nombre, sello }) => {
      const csrf = decodeURIComponent(
        document.cookie
          .split("; ")
          .find((c) => c.startsWith("__Host-csrf="))!
          .slice("__Host-csrf=".length),
      );
      const enviar = async (ruta: string, cuerpo: unknown) => {
        const r = await fetch(ruta, {
          method: "POST",
          headers: { "content-type": "application/json", "x-ps-csrf": csrf },
          body: JSON.stringify(cuerpo),
        });
        const j = await r.json();
        if (!r.ok) throw new Error(`${ruta} ${r.status} ${JSON.stringify(j)}`);
        return j;
      };
      const { perfil } = await enviar("/api/v1/perfiles", {
        nombre,
        primerApellido: "Ospina",
        aniosExperiencia: 7,
        disponibilidad: { opcion: "ahora" },
        selloPersonal: sello,
        experiencias: [{ cargo: "Backend senior", desde: 2020, descripcion: "Pagos en línea." }],
        ...ids,
      });
      await enviar(`/api/v1/perfiles/${perfil.codigo}/consentimiento`, {
        nombreApellido: true,
        trayectoria: true,
        clientes: true,
      });
      return perfil.codigo as string;
    },
    { ids, nombre, sello: SELLO },
  );
}

const quitarSaro = (codigos: string[]) =>
  conBd((bd) =>
    bd.query(
      `UPDATE inventario.perfiles SET saro_alcance_id = NULL, saro_fecha = NULL
        WHERE codigo = ANY($1) AND estado = 'publicado'`,
      [codigos],
    ),
  );

const tarjetaDe = (page: Page, codigo: string) =>
  page.locator("article.pp-perfil", {
    has: page.locator(".pp-codigo-perfil", { hasText: codigo }),
  });

test.describe("recorrido integrado de EP-003 (tarea 8.1)", () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "portal", "solo el portal"));

  test("catálogo (alcance SARO) → editor (bloqueado sin DISC, publicar) → «Incompleto» en el panel → importación SARO/DISC → portal (tarjeta, ficha, sin marca al cliente) → estándar descriptivo", async ({
    page,
    context,
  }) => {
    test.setTimeout(240_000);
    const sufijo = randomBytes(3)
      .toString("hex")
      .replace(/\d/g, (d) => "abcdefghij"[Number(d)]!);
    const ALCANCE = `Listas restrictivas y antecedentes ${sufijo}`;
    const TEXTO = `Verificamos listas restrictivas y antecedentes (${sufijo}).`;
    const errores: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error" && !m.text().includes("favicon")) errores.push(m.text());
    });
    page.on("pageerror", (e) => errores.push(e.message));
    await sesionPanel(context);

    const previos = await completarIncompletosPrevios();
    try {
      // 1. Panel · Catálogos: crear el alcance SARO con su texto de cara al cliente.
      await page.goto(`${PANEL}/catalogos?tipo=alcance_saro`);
      await expect(page.getByRole("link", { name: /Alcances SARO/ })).toHaveAttribute(
        "aria-current",
        "page",
      );
      await page.getByRole("button", { name: "Crear alcance SARO" }).first().click();
      await page.locator("#ct-nombre").fill(ALCANCE);
      await page.locator("#ct-texto").fill(TEXTO);
      await expect(page.locator("#ct-nombre-val")).toContainText("Ningún alcance SARO parecido");
      await page.locator('button[form="ct-form"]').click();
      const filaAlcance = page.getByRole("row", { name: new RegExp(ALCANCE) });
      await expect(filaAlcance).toBeVisible();
      await expect(filaAlcance).toContainText(TEXTO);

      // 2. Editor: un perfil nuevo con el alcance creado y su fecha, sin la fecha DISC → publicar queda
      // bloqueado con «Falta …» y el foco salta al campo; completarla y publicar.
      const completo = await borradorSinValidaciones(page, `Vera${sufijo}`);
      await page.goto(`${PANEL}/inventario/${completo}`);
      await page.locator("#pe-saro-alcance").selectOption({ label: ALCANCE });
      await expect(page.getByText(`«${TEXTO}»`)).toBeVisible();
      await page.locator("#pe-saro-fecha").fill("2026-03-15");
      await page.getByRole("button", { name: "Guardar borrador" }).click();
      await expect(page.getByText("Guardado como borrador.").first()).toBeVisible();
      const publicarBtn = page.getByRole("button", { name: "Publicar", exact: true });
      await expect(publicarBtn).toHaveAttribute("aria-disabled", "true");
      await publicarBtn.click({ force: true });
      await expect(page.locator("#pe-bloqueo")).toContainText(
        `No se publicó ${completo}: Falta la fecha de la evaluación DISC.`,
      );
      await expect(page.locator("#pe-disc-fecha")).toBeFocused();
      await expect(page.locator("#pe-disc-fecha-error")).toContainText(
        "Falta la fecha de la evaluación DISC.",
      );
      expect(
        await conBd(
          async (bd) =>
            (await bd.query(`SELECT estado FROM inventario.perfiles WHERE codigo = $1`, [completo]))
              .rows[0].estado,
        ),
      ).toBe("borrador");
      await page.locator("#pe-disc-fecha").fill("2026-04-10");
      await publicarBtn.click();
      await expect(page.getByText("Publicado. El portal ya muestra su ficha.")).toBeVisible();

      // 3. Un publicado heredado sin SARO: «Incompleto» en el listado del panel y en su filtro.
      // (El segundo heredado es el que completa la importación del paso 4.)
      const [heredado, importado] = await publicar(page, [
        { nombre: `Hugo${sufijo}`, sello: [], tecnologias: ["Java"], sectores: [] },
        { nombre: `Iris${sufijo}`, sello: [], tecnologias: ["Java"], sectores: [] },
      ]);
      await quitarSaro([heredado!, importado!]);
      await page.goto(`${PANEL}/inventario?q=${heredado}`);
      const enListado = page.getByRole("row").filter({ hasText: heredado! });
      await expect(enListado).toContainText(`Incompleto: falta ${SARO}`);
      await expect(enListado).toContainText("Publicado");
      await page.goto(`${PANEL}/inventario?estado=incompleto`);
      await expect(page.getByRole("link", { name: /Incompletos/ })).toHaveAttribute(
        "aria-current",
        "page",
      );
      for (const c of [heredado!, importado!])
        await expect(page.getByRole("row").filter({ hasText: c })).toContainText(
          `Incompleto: falta ${SARO}`,
        );
      await expect(page.getByRole("row").filter({ hasText: completo })).toHaveCount(0);

      // 4. Importación: pegar las columnas SARO/DISC (con el alcance creado en 1) → vista previa →
      // confirmar → el worker aplica → el perfil queda con esos valores y deja de marcarse.
      const hoja = [
        ["Código", ENC.alcance, ENC.saro, ENC.disc],
        [importado!, ALCANCE, "12/03/2026", "2026-04-08"],
      ]
        .map((f) => f.join("\t"))
        .join("\n");
      await page.goto(`${PANEL}/importar`);
      await page.locator("#pegado").fill(hoja);
      await expect(page.locator("#deteccion")).toContainText("1 fila · 4 columnas");
      await page.getByRole("button", { name: "Ver la vista previa" }).click();
      await expect(page.getByRole("heading", { name: "Vista previa" })).toBeVisible();
      await expect(page.getByText(importado!).first()).toBeVisible();
      await expect(page.getByText("Alcance de la verificación SARO").first()).toBeVisible();
      await page.getByRole("button", { name: /^Importar 1 perfil/ }).click();
      const valoresImportado = () =>
        conBd(
          async (bd) =>
            (
              await bd.query(
                `SELECT c.nombre AS alcance, p.saro_fecha::text AS saro, p.disc_fecha::text AS disc, p.estado
                   FROM inventario.perfiles p LEFT JOIN inventario.catalogo_alcances_saro c ON c.id = p.saro_alcance_id
                  WHERE p.codigo = $1`,
                [importado],
              )
            ).rows[0],
        );
      const w1 = arrancarWorker();
      try {
        await expect
          .poll(valoresImportado, { timeout: 60_000, intervals: [500] })
          .toEqual({
            alcance: ALCANCE,
            saro: "2026-03-12",
            disc: "2026-04-08",
            estado: "publicado",
          });
      } finally {
        w1.proceso.kill("SIGTERM");
      }
      await page.goto(`${PANEL}/inventario?estado=incompleto`);
      await expect(page.getByRole("row").filter({ hasText: importado! })).toHaveCount(0);
      await expect(page.getByRole("row").filter({ hasText: heredado! })).toBeVisible();

      // 5. Portal con enlace e invitado: entrar con el código que llega al buzón.
      const correo = `lider-${sufijo}@bancolombia.com`;
      const token = await enlace([completo, heredado!, importado!], correo);
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
      await expect(page.getByRole("heading", { name: "Los 3 perfiles del correo" })).toBeVisible();

      // 5a. La tarjeta del perfil completo: el bloque verificado con su Sello Personal.
      const t = tarjetaDe(page, completo);
      await expect(t.locator(".pp-bloque--verificado .pp-bloque__rotulo")).toHaveText(
        "Verificado por Trycore",
      );
      await expect(t.locator(".rs-sello")).toHaveText(`Sello Personal${SELLO.join(" · ")}`);
      // 5b. El incompleto, al cliente, sin marca de incompleto.
      await expect(tarjetaDe(page, heredado!)).toBeVisible();
      await expect(tarjetaDe(page, heredado!)).not.toContainText(/incomplet|falta/i);
      await expect(page.locator("main")).not.toContainText(/incomplet/i);

      // 6. El encabezado del estándar: la frase descriptiva (hay un publicado incompleto).
      await expect(page.locator(".ee-estandar__frase")).toHaveText(DESCRIPTIVA);
      await expect(page.locator(".ee-estandar")).toHaveCount(1);
      await sinIncidenciasGraves(page);

      // 5c. La ficha del completo: la línea SARO con el texto del alcance creado en 1 y la DISC.
      await page.getByRole("link", { name: `Ver ficha de Vera${sufijo} Ospina` }).click();
      let ficha = page.getByRole("dialog");
      await expect(ficha).toBeVisible();
      await expect(ficha.locator("#vp-fila-seguridad dd")).toHaveText(`${TEXTO} · marzo de 2026`);
      await expect(ficha.locator("#vp-fila-disc dd")).toHaveText(
        `abril de 2026Sello Personal: ${SELLO.join(" · ")}`,
      );
      await sinIncidenciasGraves(page);

      // 5d. La ficha del importado: el alcance y las fechas de la hoja pegada.
      await page.goto(`/?ficha=${importado}`);
      ficha = page.getByRole("dialog");
      await expect(ficha.locator(".fp-referencia")).toContainText(importado!);
      await expect(ficha.locator("#vp-fila-seguridad dd")).toHaveText(`${TEXTO} · marzo de 2026`);
      await expect(ficha.locator("#vp-fila-disc dd")).toHaveText("abril de 2026");

      // 5e. La ficha del heredado: sin la línea SARO y sin ninguna marca de incompleto.
      await page.goto(`/?ficha=${heredado}`);
      ficha = page.getByRole("dialog");
      await expect(ficha.locator(".fp-referencia")).toContainText(heredado!);
      await expect(ficha.locator("#vp-fila-seguridad")).toHaveCount(0);
      await expect(ficha).not.toContainText(/SARO|incomplet|pendiente|no aplica|falta/i);
      await expect(ficha.locator("#vp-fila-disc dd")).toHaveText("abril de 2026");
      await sinIncidenciasGraves(page);

      expect(errores).toEqual([]);
    } finally {
      await reponer(previos);
    }
  });
});
