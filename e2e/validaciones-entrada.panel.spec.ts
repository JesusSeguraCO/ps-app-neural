// Recorrido de las validaciones de entrada en un navegador real (EP-003 · SS1, tarea 1.10; HU-177,
// HU-176): crear un alcance SARO en Catálogos → asignarlo con su fecha a un perfil en el editor →
// intentar publicar sin la fecha DISC (bloqueado con «Falta …» y el foco en el campo) → completarla y
// publicar → la vista previa muestra el texto del alcance con «marzo de 2026» y la DISC con
// «abril de 2026». Sin errores de consola ni violaciones de CSP. La sesión y el perfil de partida se
// crean directamente (BD de BD_INSTALACION_URL y API del panel); todo lo demás, con clics.
import { createHash, createHmac, randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import pg from "pg";

const CORREO = "e2e-validaciones@trycore.com";
const INSTALACION =
  process.env.BD_INSTALACION_URL ?? "postgres://ps_instalacion@127.0.0.1:54329/ps";
const SUFIJO = randomBytes(3).toString("hex");
// Distinto del que trae la siembra («Antecedentes judiciales, disciplinarios y fiscales»), para que la
// revisión de parecidos no pida confirmar.
const ALCANCE = `Policía, Procuraduría y Contraloría ${SUFIJO}`;
const TEXTO = "Verificamos sus antecedentes ante Policía, Procuraduría y Contraloría.";

function claveCorreo(): string {
  const salida = execFileSync("bash", ["scripts/entorno-dev.sh", "panel"], { encoding: "utf8" });
  return salida.match(/^export EMAIL_HMAC_KEY=(.*)$/m)![1]!;
}

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

// Un borrador completo con consentimiento nominal, sin SARO ni DISC, por la API del panel (la misma vía
// que el editor). Devuelve su código.
async function borradorSinValidaciones(page: Page): Promise<string> {
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
  await page.goto("/inventario");
  return page.evaluate(async (ids) => {
    const csrf = decodeURIComponent(
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("__Host-csrf="))!
        .slice("__Host-csrf=".length),
    );
    const enviar = (ruta: string, cuerpo: unknown) =>
      fetch(ruta, {
        method: "POST",
        headers: { "content-type": "application/json", "x-ps-csrf": csrf },
        body: JSON.stringify(cuerpo),
      }).then((r) => r.json());
    const { perfil } = await enviar("/api/v1/perfiles", {
      nombre: "Valeria",
      primerApellido: "Ospina",
      aniosExperiencia: 7,
      disponibilidad: { opcion: "ahora" },
      experiencias: [{ cargo: "Backend senior", desde: 2020, descripcion: "Pagos en línea." }],
      ...ids,
    });
    await enviar(`/api/v1/perfiles/${perfil.codigo}/consentimiento`, {
      nombreApellido: true,
      trayectoria: true,
      clientes: true,
    });
    return perfil.codigo as string;
  }, ids);
}

test.describe("validaciones de entrada SARO/DISC (HU-177, HU-176)", () => {
  test.beforeEach(async ({ context, baseURL }, info) => {
    test.skip(info.project.name !== "panel", "solo el panel");
    await abrirSesion(context, baseURL!);
  });

  test("crear un alcance → asignarlo con fecha → publicar sin DISC (bloqueado, al campo) → completar y publicar → la vista previa muestra SARO y DISC", async ({
    page,
  }) => {
    const errores: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errores.push(m.text());
    });
    page.on("pageerror", (e) => errores.push(e.message));

    // 1. Crear el alcance en Catálogos, con su texto de cara al cliente.
    await page.goto("/catalogos?tipo=alcance_saro");
    await expect(page.getByRole("link", { name: /Alcances SARO/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await page.getByRole("button", { name: "Crear alcance SARO" }).first().click();
    await page.locator("#ct-nombre").fill(ALCANCE);
    await page.locator("#ct-texto").fill(TEXTO);
    // La revisión del nombre corre mientras se escribe: ninguno parecido; luego se crea.
    await expect(page.locator("#ct-nombre-val")).toContainText("Ningún alcance SARO parecido");
    await page.locator('button[form="ct-form"]').click();
    await expect(page.getByText(`Alcance SARO creado: ${ALCANCE}.`)).toBeVisible();
    // El listado va por uso y pagina de 25: el recién creado (0 usos) se busca por su nombre.
    await page.goto(`/catalogos?tipo=alcance_saro&q=${encodeURIComponent(ALCANCE)}`);
    await expect(page.getByRole("row", { name: new RegExp(ALCANCE) })).toBeVisible();
    await expect(page.getByRole("row", { name: new RegExp(ALCANCE) })).toContainText(TEXTO);

    // 2. Asignarlo con su fecha a un perfil (sin la fecha DISC) y guardar el borrador.
    const codigo = await borradorSinValidaciones(page);
    await page.goto(`/inventario/${codigo}`);
    await page.locator("#pe-saro-alcance").selectOption({ label: ALCANCE });
    await expect(page.getByText(`«${TEXTO}»`)).toBeVisible();
    await page.locator("#pe-saro-fecha").fill("2026-03-15");
    await page.getByRole("button", { name: "Guardar borrador" }).click();
    await expect(page.getByText("Guardado como borrador.").first()).toBeVisible();

    // 3. Publicar sin la fecha DISC: el botón se ve inactivo (aria-disabled) pero responde al clic con
    // el motivo exacto y el foco en el campo que falta (Playwright no pulsa lo aria-disabled sin force).
    await expect(page.getByRole("button", { name: "Publicar", exact: true })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await page.getByRole("button", { name: "Publicar", exact: true }).click({ force: true });
    await expect(page.locator("#pe-bloqueo")).toContainText(
      `No se publicó ${codigo}: Falta la fecha de la evaluación DISC.`,
    );
    await expect(page.locator("#pe-disc-fecha")).toBeFocused();
    await expect(page.locator("#pe-disc-fecha-error")).toContainText(
      "Falta la fecha de la evaluación DISC.",
    );
    const estado = await conBd(
      async (bd) =>
        (await bd.query(`SELECT estado FROM inventario.perfiles WHERE codigo = $1`, [codigo]))
          .rows[0].estado as string,
    );
    expect(estado).toBe("borrador");

    // 4. Completar la fecha DISC y publicar.
    await page.locator("#pe-disc-fecha").fill("2026-04-10");
    await page.getByRole("button", { name: "Publicar", exact: true }).click();
    await expect(page.getByText("Publicado. El portal ya muestra su ficha.")).toBeVisible();

    // 5. La vista previa (la ficha del portal) muestra la verificación SARO y la DISC con su mes.
    await page.goto(`/inventario/${codigo}?vista=ficha`);
    const verificado = page.locator(".pp-bloque--verificado");
    await expect(verificado).toContainText("Verificación de seguridad SARO");
    await expect(verificado).toContainText(`${TEXTO} · marzo de 2026`);
    await expect(verificado).toContainText("Evaluación DISC");
    await expect(verificado).toContainText("abril de 2026");

    expect(errores).toEqual([]);
  });

  test("una fecha futura no se guarda: el panel lo dice en el campo y el perfil conserva lo que tenía", async ({
    page,
  }) => {
    const codigo = await borradorSinValidaciones(page);
    await page.goto(`/inventario/${codigo}`);
    const futura = new Date(Date.now() - 5 * 3_600_000 + 44 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    await page.locator("#pe-saro-fecha").fill(futura);
    await expect(page.locator("#pe-saro-fecha-error")).toContainText(
      "La fecha de una verificación no puede ser posterior a hoy.",
    );
    await page.getByRole("button", { name: "Guardar borrador" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "No se guardó." })).toContainText(
      "La fecha de una verificación no puede ser posterior a hoy.",
    );
    const fila = await conBd(
      async (bd) =>
        (await bd.query(`SELECT saro_fecha FROM inventario.perfiles WHERE codigo = $1`, [codigo]))
          .rows[0],
    );
    expect(fila.saro_fecha).toBeNull();
  });
});
