// Recorrido de «Incompleto» y del aviso de lenguaje en un navegador real (EP-003 · SS2, tarea 2.8;
// HU-178, HU-194): un publicado heredado sin SARO aparece marcado en el listado y en su filtro → editarlo
// sin completarlo pregunta con el motivo y el portal conserva la versión vigente → completarlo y
// confirmar lo deja de marcar → guardar una trayectoria con «stock» avisa sin bloquear. Y en un
// borrador: el aviso aparece aparte del error de la fecha futura y se retira al corregir la frase. Sin
// errores de consola. El heredado se fabrica como en datos reales (publicado completo y luego sin SARO,
// por SQL); la sesión y los perfiles de partida, por la BD de BD_INSTALACION_URL y la API del panel.
import { createHash, createHmac, randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import pg from "pg";

const CORREO = "e2e-incompleto@trycore.com";
const INSTALACION =
  process.env.BD_INSTALACION_URL ?? "postgres://ps_instalacion@127.0.0.1:54329/ps";
const SARO = "la verificación SARO (alcance y fecha)";

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

// Un perfil completo por la API del panel (la vía del editor); publicado si se pide. Devuelve su código.
async function perfilCompleto(page: Page, publicar: boolean): Promise<string> {
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
  return page.evaluate(
    async ({ ids, publicar }) => {
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
      const { perfil } = await enviar("/api/v1/perfiles", {
        nombre: "Mariana",
        primerApellido: "Restrepo",
        aniosExperiencia: 9,
        disponibilidad: { opcion: "ahora" },
        saroFecha: "2026-03-15",
        discFecha: "2026-04-10",
        experiencias: [{ cargo: "Backend senior", desde: 2019, descripcion: "Pagos en línea." }],
        ...ids,
      });
      const c = await enviar(`/api/v1/perfiles/${perfil.codigo}/consentimiento`, {
        nombreApellido: true,
        trayectoria: true,
        clientes: true,
      });
      if (publicar)
        await enviar(`/api/v1/perfiles/${perfil.codigo}/publicar`, {}, c.perfil.version);
      return perfil.codigo as string;
    },
    { ids, publicar },
  );
}

// Publicado antes de la regla (D62): se le quita la verificación SARO ya publicado.
async function heredadoSinSaro(page: Page): Promise<string> {
  const codigo = await perfilCompleto(page, true);
  await conBd((bd) =>
    bd.query(
      `UPDATE inventario.perfiles SET saro_alcance_id = NULL, saro_fecha = NULL WHERE codigo = $1 AND estado = 'publicado'`,
      [codigo],
    ),
  );
  return codigo;
}

const fichaPortal = (codigo: string) =>
  conBd(
    async (bd) =>
      (
        await bd.query(
          `SELECT resumen, saro_fecha::text AS saro FROM operacion.ficha_publicable WHERE codigo = $1`,
          [codigo],
        )
      ).rows[0] as { resumen: string | null; saro: string | null } | undefined,
  );

test.describe("«Incompleto» y aviso de lenguaje de inventario (HU-178, HU-194)", () => {
  test.beforeEach(async ({ context, baseURL }, info) => {
    test.skip(info.project.name !== "panel", "solo el panel");
    await abrirSesion(context, baseURL!);
  });

  test("marcado → editar sin completar (pregunta) → completar y confirmar (deja de marcarse) → trayectoria con «stock» (aviso, guardado)", async ({
    page,
  }) => {
    const errores: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errores.push(m.text());
    });
    page.on("pageerror", (e) => errores.push(e.message));
    const codigo = await heredadoSinSaro(page);

    // 1. El listado lo marca con lo que falta y el filtro «Incompletos» lo encuentra; sigue publicado.
    await page.goto("/inventario?estado=incompleto");
    await expect(page.getByRole("link", { name: /Incompletos/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    const fila = page.getByRole("row").filter({ hasText: codigo });
    await expect(fila).toContainText(`Incompleto: falta ${SARO}`);
    await expect(fila).toContainText("Publicado");
    expect(await fichaPortal(codigo)).toBeDefined();

    // 2. Editar el resumen sin registrar SARO: la pregunta con el motivo; el portal no cambia.
    await page.goto(`/inventario/${codigo}`);
    await expect(
      page.getByRole("note").filter({ hasText: `Incompleto: falta ${SARO}.` }),
    ).toBeVisible();
    await page.locator("#pe-resumen").fill("Lidera integraciones de pagos en banca.");
    await page
      .getByRole("button", { name: /^Guardar/ })
      .first()
      .click();
    const pregunta = page.getByRole("dialog", { name: "Este cambio no se puede publicar" });
    await expect(pregunta).toContainText(`No se puede publicar mientras falte ${SARO}.`);
    await expect(
      pregunta.getByText("¿Descarto el cambio o paso el perfil a borrador?"),
    ).toBeVisible();
    await expect(
      pregunta.getByText("Mientras no respondas, el perfil sigue publicado sin el cambio."),
    ).toBeVisible();
    expect((await fichaPortal(codigo))?.resumen).toBeNull();
    await pregunta.getByRole("button", { name: "Seguir editando" }).first().click();

    // 3. Completar la verificación SARO y confirmar: el cambio llega al portal y deja de marcarse.
    await page.locator("#pe-saro-alcance").selectOption({ index: 1 });
    await page.locator("#pe-saro-fecha").fill("2026-03-15");
    await page
      .getByRole("button", { name: /^Guardar/ })
      .first()
      .click();
    const impacto = page.getByRole("dialog", { name: "Esto cambia para el cliente" });
    await expect(impacto).toBeVisible();
    await impacto.getByRole("button", { name: "Confirmar cambios" }).click();
    await expect(page.getByText("Cambios confirmados. El portal ya los muestra.")).toBeVisible();
    expect(await fichaPortal(codigo)).toEqual({
      resumen: "Lidera integraciones de pagos en banca.",
      saro: "2026-03-15",
    });
    await page.goto("/inventario?estado=incompleto");
    await expect(page.getByRole("row").filter({ hasText: codigo })).toHaveCount(0);
    await page.goto(`/inventario?q=${codigo}`);
    await expect(page.getByRole("row").filter({ hasText: codigo })).not.toContainText("Incompleto");

    // 4. Una trayectoria con «stock»: el aviso señala la expresión y no impide confirmar.
    await page.goto(`/inventario/${codigo}`);
    await page.getByRole("button", { name: "Editar Backend senior" }).click();
    await page.locator("#ex-texto").fill("stock de consultores para banca");
    await page.getByRole("button", { name: "Guardar experiencia" }).click();
    await page
      .getByRole("button", { name: /^Guardar/ })
      .first()
      .click();
    const conAviso = page.getByRole("dialog", { name: "Esto cambia para el cliente" });
    await expect(conAviso.locator('[data-aviso="lenguaje"]')).toContainText(
      "La trayectoria usa lenguaje de inventario: «stock»",
    );
    await conAviso.getByRole("button", { name: "Confirmar cambios" }).click();
    await expect(page.getByText("Cambios confirmados. El portal ya los muestra.")).toBeVisible();
    await expect(page.locator('[data-aviso="lenguaje"]')).toContainText("«stock»");
    const exp = await conBd(async (bd) =>
      (
        await bd.query(
          `SELECT e.descripcion FROM inventario.perfil_experiencias e JOIN inventario.perfiles p ON p.id = e.perfil_id
              WHERE p.codigo = $1 AND e.vigente`,
          [codigo],
        )
      ).rows.map((f) => f.descripcion),
    );
    expect(exp).toEqual(["stock de consultores para banca"]);

    expect(errores).toEqual([]);
  });

  test("borrador: el aviso va aparte del error de la fecha futura y se retira al corregir la frase", async ({
    page,
  }) => {
    const errores: string[] = [];
    page.on("pageerror", (e) => errores.push(e.message));
    const codigo = await perfilCompleto(page, false);
    await page.goto(`/inventario/${codigo}`);
    const futura = new Date(Date.now() - 5 * 3_600_000 + 30 * 86_400_000)
      .toISOString()
      .slice(0, 10);

    // Error: «stock» y fecha SARO futura → no se guarda por la fecha; el aviso aparte, sin ser la causa.
    await page.getByRole("button", { name: "Editar Backend senior" }).click();
    await page.locator("#ex-texto").fill("stock de consultores para banca");
    await page.getByRole("button", { name: "Guardar experiencia" }).click();
    await page.locator("#pe-saro-fecha").fill(futura);
    await page.getByRole("button", { name: "Guardar borrador" }).click();
    const rechazo = page.getByRole("alert").filter({ hasText: "No se guardó." });
    await expect(rechazo).toContainText(
      "La fecha de una verificación no puede ser posterior a hoy.",
    );
    await expect(rechazo).not.toContainText("stock");
    const aviso = page.locator('[data-aviso="lenguaje"]');
    await expect(aviso).toHaveAttribute("role", "status");
    await expect(aviso).toContainText("«stock»");

    // Corregir: con la fecha válida y la frase con «unidad» guarda con aviso; reescrita, sin aviso.
    await page.locator("#pe-saro-fecha").fill("2026-03-15");
    await page.getByRole("button", { name: "Editar Backend senior" }).click();
    await page.locator("#ex-texto").fill("Lideró la unidad de pagos");
    await page.getByRole("button", { name: "Guardar experiencia" }).click();
    await page.getByRole("button", { name: "Guardar borrador" }).click();
    await expect(page.getByText("Guardado como borrador.").first()).toBeVisible();
    await expect(aviso).toContainText("«unidad»");
    await page.getByRole("button", { name: "Editar Backend senior" }).click();
    await page.locator("#ex-texto").fill("Lideró el área de pagos");
    await page.getByRole("button", { name: "Guardar experiencia" }).click();
    await page.getByRole("button", { name: "Guardar borrador" }).click();
    await expect(page.getByText("Guardado como borrador.").first()).toBeVisible();
    await expect(aviso).toHaveCount(0);
    expect(errores).toEqual([]);
  });
});
