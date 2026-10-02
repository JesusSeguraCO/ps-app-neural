// Marco del panel con sesión abierta en un navegador real (prototipo admin-shell): barra lateral y
// contenido en dos columnas en escritorio, sin scroll horizontal en móvil, CSP limpia y axe sin
// incidencias serias. La sesión se crea directamente en la BD local (misma que usa el panel).
import AxeBuilder from "@axe-core/playwright";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { expect, test, type BrowserContext } from "@playwright/test";
import pg from "pg";

const CORREO = "e2e-marco@trycore.com";
// Mismo número en e2e/acceso.portal.spec.ts: serializa los e2e que escriben el contacto de Trycore.
const CANDADO_CONTACTO = 147_147;
const INSTALACION =
  process.env.BD_INSTALACION_URL ?? "postgres://ps_instalacion@127.0.0.1:54329/ps";

function entornoPanel(): Record<string, string> {
  const salida = execFileSync("bash", ["scripts/entorno-dev.sh", "panel"], { encoding: "utf8" });
  return Object.fromEntries([...salida.matchAll(/^export ([A-Z_]+)=(.*)$/gm)].map((m) => [m[1]!, m[2]!]));
}

function claveCorreo(): string {
  const salida = execFileSync("bash", ["scripts/entorno-dev.sh", "panel"], { encoding: "utf8" });
  return salida.match(/^export EMAIL_HMAC_KEY=(.*)$/m)![1]!;
}

async function abrirSesion(
  context: BrowserContext,
  baseURL: string,
  quien: { correo: string; rol: "administrador" | "observador" } = { correo: CORREO, rol: "administrador" },
): Promise<void> {
  const bd = new pg.Client({ connectionString: INSTALACION });
  await bd.connect();
  try {
    const hmac = createHmac("sha256", claveCorreo()).update(quien.correo).digest();
    const u = await bd.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ($1, $2, $3)
       ON CONFLICT (correo_hmac) DO UPDATE SET activo = true RETURNING id`,
      [quien.correo, hmac, quien.rol],
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

  test("escritorio 1440: barra lateral y contenido en dos columnas, 4 destinos deshabilitados; Enlaces, Peticiones, Catálogos, Léxico, Inventario, Importar, Vigencia y Colocados activos", async ({
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
    expect(m.inactivos).toBe(4);
    expect(m.conHref).toBe(8); // Enlaces y Peticiones (EP-001); Catálogos y Léxico (EP-006 · sub-slice 1); Inventario (2); Importar (3); Vigencia (7); Colocados (9)
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

test.describe("pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136)", () => {
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
    "/catalogos?tipo=motivo_pausa",
    "/lexico",
    "/lexico?vista=candidatas",
    "/inventario",
    "/inventario/nuevo",
    "/inventario/PS-0187",
    "/importar",
    "/importar?vista=historial",
    "/vigencia",
    "/colocados",
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

// Vista previa de la ficha (EP-006 · sub-slice 5, HU-129): el modo del editor que dibuja la ficha del
// portal. Sin incidencias serias de axe (la ficha va inerte) y sin scroll horizontal en móvil; la
// necesidad presencial muestra la ciudad y la remota no.
test.describe("resultado de una importación (HU-141, HU-142)", () => {
  test.beforeEach(async ({ context, baseURL }, info) => {
    test.skip(info.project.name !== "panel", "solo el panel");
    await abrirSesion(context, baseURL!);
  });

  // El lote se registra en la prueba (sin aplicarlo): no depende de datos de una BD concreta.
  test("/importar?lote=…: axe sin incidencias serias, sin scroll horizontal a 320/390 y consola limpia", async ({ page }) => {
    const errores: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errores.push(m.text());
    });
    await page.goto("/importar");
    const lote = await page.evaluate(async () => {
      const par = document.cookie.split("; ").find((c) => c.startsWith("__Host-csrf="));
      const r = await fetch("/api/v1/importacion/lotes", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-ps-csrf": par ? decodeURIComponent(par.slice("__Host-csrf=".length)) : "",
        },
        body: JSON.stringify({
          texto: "Código\tAños de experiencia\nPS-0187\t9\nXX-1\t4",
          formato: "tsv",
          modo: "crear_y_actualizar",
          archivo: "e2e-resultado.tsv",
          columnas: [
            { columna: "Código", clave: "codigo" },
            { columna: "Años de experiencia", clave: "aniosExperiencia" },
          ],
        }),
      });
      return { status: r.status, id: (await r.json()).loteId as string };
    });
    expect(lote.status).toBe(201);
    await page.goto(`/importar?lote=${lote.id}`);
    await expect(page.getByText("Esta importación no se confirmó.")).toBeVisible();
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
    for (const ancho of [320, 390]) {
      await page.setViewportSize({ width: ancho, height: 800 });
      expect(await page.evaluate(() => document.scrollingElement!.scrollWidth - document.scrollingElement!.clientWidth)).toBe(0);
    }
    expect(errores).toEqual([]);
  });
});

test.describe("vista previa de la ficha (HU-129)", () => {
  test.beforeEach(async ({ context, baseURL }, info) => {
    test.skip(info.project.name !== "panel", "solo el panel");
    await abrirSesion(context, baseURL!);
  });

  test("axe sin incidencias serias, sin scroll horizontal y la ciudad según la necesidad", async ({ page }) => {
    const errores: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errores.push(m.text());
    });
    await page.goto("/inventario/PS-0187");
    await page.getByRole("button", { name: "Vista previa" }).click();
    await expect(page.getByRole("heading", { name: "Vista previa de la ficha" })).toBeVisible();
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    const modalidad = page.locator("#vp-fila-modalidad dd");
    const remota = await modalidad.textContent();
    await page.getByRole("button", { name: "Presencial", exact: true }).click();
    const presencial = await modalidad.textContent();
    expect(presencial!.length).toBeGreaterThan(remota!.length);
    for (const ancho of [320, 390]) {
      await page.setViewportSize({ width: ancho, height: 800 });
      const scroll = await page.evaluate(() => document.scrollingElement!.scrollWidth - document.scrollingElement!.clientWidth);
      expect(scroll, `vista previa a ${ancho}`).toBe(0);
    }
    await page.getByRole("button", { name: "Volver a editar" }).click();
    await expect(page.getByRole("heading", { name: "Vista previa de la ficha" })).toHaveCount(0);
    expect(errores).toEqual([]);
  });

  test("HU-129 · falta un dato que la publicación exige: el bloque sale marcado, nombra el dato e impide publicar", async ({ page }) => {
    await page.goto("/inventario/nuevo");
    await page.getByLabel("Nombre", { exact: true }).fill(`E2E incompleta ${randomBytes(2).toString("hex")}`);
    await page.getByRole("button", { name: "Guardar borrador" }).click();
    await expect(page).toHaveURL(/\/inventario\/PS-\d{4}$/);
    await page.getByRole("button", { name: "Vista previa" }).click();
    await expect(page.getByRole("heading", { name: "Vista previa de la ficha" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Bloques incompletos" })).toBeVisible();
    await expect(page.locator(".vp-grupo").filter({ hasText: "Impide publicar" })).toBeVisible();
    // En la ficha, el bloque de la persona va marcado y nombra lo que falta.
    const marcas = page.locator(".fp-ficha .vp-marca");
    expect(await marcas.count()).toBeGreaterThan(0);
    await expect(page.locator(".fp-ficha .fp-persona.vp-marca")).toContainText(/Falta: .*primer apellido/);
  });
});

// Editor de perfiles en un navegador real (EP-006 · sub-slice 2): lo tecleado solo encuentra valores
// del catálogo (HU-089 «seleccionar en vez de escribir») y un rol que no existe muestra antes los
// parecidos y deja crear después de verlos (HU-125 edge). Guardar deja un borrador (HU-125).
test.describe("editor de perfiles (HU-089, HU-125)", () => {
  test.beforeEach(async ({ context, baseURL }, info) => {
    test.skip(info.project.name !== "panel", "solo el panel");
    await abrirSesion(context, baseURL!);
  });

  test("las tecnologías se eligen del catálogo; Enter nunca guarda lo escrito", async ({ page }) => {
    await page.goto("/inventario/nuevo");
    const tec = page.getByRole("combobox", { name: "Tecnologías ancla" });
    await tec.fill("kaf");
    const opciones = page.getByRole("listbox", { name: "Valores del catálogo" });
    await expect(opciones.getByRole("option", { name: "Kafka" })).toBeVisible();
    await expect(opciones.getByRole("option", { name: "Crear «kaf» en el catálogo" })).toBeVisible();
    await tec.press("Enter");
    await expect(page.getByRole("list", { name: "Tecnologías elegidas" }).getByText("Kafka")).toBeVisible();
    await expect(tec).toHaveValue("");
    // Un texto sin coincidencias no se convierte en valor: solo ofrece crearlo aparte.
    await tec.fill("zzqq");
    await expect(opciones.getByText("Ningún valor del catálogo coincide.")).toBeVisible();
    await tec.press("Escape");
    await expect(page.getByRole("list", { name: "Tecnologías elegidas" }).getByRole("listitem")).toHaveCount(1);
  });

  test("el sector admite varios valores del catálogo y se conservan al guardar y volver (D23)", async ({ page }) => {
    await page.goto("/inventario/nuevo");
    await page.getByLabel("Nombre", { exact: true }).fill("E2E");
    const sector = page.getByRole("combobox", { name: "Sectores" });
    const elegidos = page.getByRole("list", { name: "Sectores elegidos" });
    for (const [q, nombre] of [["banc", "Banca"], ["segu", "Seguros"], ["reta", "Retail"]]) {
      await sector.fill(q!);
      await page.getByRole("option", { name: nombre! }).click();
    }
    await expect(elegidos.getByRole("listitem")).toHaveCount(3);
    await elegidos.getByRole("button", { name: "Quitar Retail" }).click();
    await page.getByRole("button", { name: "Guardar borrador" }).click();
    await expect(page).toHaveURL(/\/inventario\/PS-\d{4}$/);
    await page.reload();
    await expect(page.getByRole("list", { name: "Sectores elegidos" }).getByRole("listitem")).toHaveText([
      "Banca",
      "Seguros",
    ]);
  });

  test("un rol que no existe muestra los parecidos antes de dejar crearlo", async ({ page }) => {
    await page.goto("/inventario/nuevo");
    const rol = page.getByRole("combobox", { name: "Rol" });
    await rol.fill("Desarrolador full stak");
    await page.getByRole("option", { name: "Crear «Desarrolador full stak» en el catálogo" }).click();
    const hoja = page.getByRole("dialog", { name: "Crear rol en el catálogo" });
    await expect(hoja.getByText("Antes de crear uno nuevo, revisa si es alguno de estos:")).toBeVisible();
    await expect(hoja.getByText("Desarrollador full stack")).toBeVisible();
    await expect(hoja.getByRole("button", { name: "Crear «Desarrolador full stak» de todos modos" })).toBeVisible();
    await hoja.getByRole("button", { name: "Usar este" }).first().click();
    await expect(page.getByRole("list", { name: "Rol elegido" }).getByText("Desarrollador full stack")).toBeVisible();
    await expect(page.getByText("Familia Desarrollo")).toBeVisible();
  });

  test("guardar un perfil nuevo lo deja en borrador y señala lo que falta", async ({ page }) => {
    await page.goto("/inventario/nuevo");
    await page.getByLabel("Nombre", { exact: true }).fill("E2E");
    await page.getByRole("button", { name: "Guardar borrador" }).click();
    await expect(page).toHaveURL(/\/inventario\/PS-\d{4}$/);
    await expect(page.getByText("Guardado como borrador. No se perdió nada de lo que escribiste.")).toBeVisible();
    await expect(page.locator(".pp-encabezado .pp-estado")).toHaveText("Borrador");
    await expect(page.getByText("Falta el primer apellido.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Registrar el consentimiento nominal" })).toBeVisible();
  });
});

test.describe("sesión vencida al guardar (HU-138 escenario 2, HU-151)", () => {
  const VENCE = "e2e-vence@trycore.com";
  test.beforeEach(async ({ context, baseURL }, info) => {
    test.skip(info.project.name !== "panel", "solo el panel");
    await abrirSesion(context, baseURL!, { correo: VENCE, rol: "administrador" });
  });

  test("Guardar con la sesión vencida no escribe nada y lleva a la puerta con la causa", async ({ page }) => {
    await page.goto("/inventario/nuevo");
    const nombre = `E2E vencida ${randomBytes(3).toString("hex")}`;
    await page.getByLabel("Nombre", { exact: true }).fill(nombre);
    const bd = new pg.Client({ connectionString: INSTALACION });
    await bd.connect();
    try {
      await bd.query(
        `UPDATE identidad_panel.sesiones_panel s SET creada = now() - interval '2 days', ultima_actividad = now() - interval '2 days'
           FROM identidad_panel.usuarios_panel u WHERE u.id = s.usuario_id AND u.correo = $1`,
        [VENCE],
      );
    } finally {
      await bd.end();
    }
    await page.getByRole("button", { name: "Guardar borrador" }).click();
    await expect(page).toHaveURL(/\/acceso\?motivo=sesion_expirada/);
    await expect(page.getByText("No se pudo guardar")).toHaveCount(0);
    // Nada se escribió: ningún perfil con ese nombre.
    const consulta = new pg.Client({ connectionString: INSTALACION });
    await consulta.connect();
    try {
      const n = await consulta.query(`SELECT count(*)::int AS n FROM inventario.perfiles WHERE nombre = $1`, [nombre]);
      expect(n.rows[0].n).toBe(0);
    } finally {
      await consulta.end();
    }
  });
});

// Crea un perfil publicado por la API del panel (alta → consentimiento → publicar) y devuelve su código.
// Un alcance SARO activo del catálogo (lo siembra `sembrarFicticios`; si la BD se sembró antes de la
// 0027, se crea el mismo).
async function alcanceSaro(bd: pg.Client): Promise<string> {
  await bd.query(
    `INSERT INTO inventario.catalogo_alcances_saro (nombre, texto_cliente)
     SELECT 'Antecedentes judiciales, disciplinarios y fiscales', 'Verificamos sus antecedentes judiciales, disciplinarios y fiscales.'
      WHERE NOT EXISTS (SELECT 1 FROM inventario.catalogo_alcances_saro WHERE activo)`,
  );
  return (
    await bd.query(`SELECT id FROM inventario.catalogo_alcances_saro WHERE activo ORDER BY nombre LIMIT 1`)
  ).rows[0].id as string;
}

async function crearPublicado(
  page: import("@playwright/test").Page,
  nombre = "E2E",
  primerApellido = "Publicada",
): Promise<string> {
  await page.goto("/inventario");
  // La API de peticiones de Playwright no envía cookies `Secure` por http: van en la cabecera.
  const galletas = await page.context().cookies();
  const csrf = galletas.find((c) => c.name === "__Host-csrf")!.value;
  const cab = {
    "x-ps-csrf": csrf,
    origin: new URL(page.url()).origin,
    cookie: galletas.map((c) => `${c.name}=${c.value}`).join("; "),
  };
  const bd = new pg.Client({ connectionString: INSTALACION });
  await bd.connect();
  const id = async (t: string, n: string) =>
    (await bd.query(`SELECT id FROM inventario.${t} WHERE nombre = $1`, [n])).rows[0].id as string;
  const cuerpo = {
    nombre,
    primerApellido,
    rolId: await id("catalogo_roles", "Desarrolladora backend Java"),
    tecnologiaIds: [await id("catalogo_tecnologias", "Java")],
    seniorityId: await id("catalogo_seniorities", "Senior"),
    aniosExperiencia: 8,
    ciudadId: await id("catalogo_ciudades", "Medellín"),
    modalidadTrabajoId: await id("catalogo_modalidades", "hibrido"),
    disponibilidad: { opcion: "ahora" },
    modalidadPruebaId: await id("catalogo_modalidades_prueba", "Prueba práctica revisada por un arquitecto"),
    // Validaciones de entrada (EP-003, D61): publicar exige alcance SARO del catálogo y las dos fechas.
    saroAlcanceId: await alcanceSaro(bd),
    saroFecha: "2026-03-15",
    discFecha: "2026-04-10",
    experiencias: [{ cargo: "Backend senior", desde: 2021, descripcion: "Pagos inmediatos." }],
  };
  await bd.end();
  const alta = await page.request.post("/api/v1/perfiles", { data: cuerpo, headers: cab });
  expect(alta.status(), await alta.text()).toBe(201);
  const p = (await alta.json()).perfil;
  const c = (
    await (
      await page.request.post(`/api/v1/perfiles/${p.codigo}/consentimiento`, {
        data: { nombreApellido: true, trayectoria: true, clientes: true },
        headers: cab,
      })
    ).json()
  ).perfil;
  const r = await page.request.post(`/api/v1/perfiles/${p.codigo}/publicar`, {
    data: {},
    headers: { ...cab, "if-match": `"${c.version}"` },
  });
  expect(r.status()).toBe(200);
  return p.codigo as string;
}

// Editar un publicado y su reporte de validación (EP-006 · sub-slice 6: HU-126, HU-140, HU-130 edge)
// en un navegador real: guardar declara el impacto y confirmar lo aplica; un cambio que deja el perfil
// incompleto pregunta y «Pasar a borrador» lo saca del portal; el borrador del reporte sale de la
// modalidad, se confirma con la revisión y la ficha pasa a Nivel 1. Perfiles propios creados por la
// API (los ficticios no se tocan). axe sin incidencias serias en las hojas y en el borrador.
test.describe("editar un publicado y su reporte (HU-126, HU-140, HU-130)", () => {
  test.beforeEach(async ({ context, baseURL }, info) => {
    test.skip(info.project.name !== "panel", "solo el panel");
    await abrirSesion(context, baseURL!);
  });

  const axeGraves = async (page: import("@playwright/test").Page) =>
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);

  test("guardar declara el impacto y confirmar lo aplica; incompleto pregunta y pasa a borrador", async ({ page }) => {
    const errores: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errores.push(m.text());
    });
    const codigo = await crearPublicado(page);
    await page.goto(`/inventario/${codigo}`);
    await page.getByRole("spinbutton", { name: "Años de experiencia" }).fill("9");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    const hoja = page.getByRole("dialog", { name: "Esto cambia para el cliente" });
    await expect(hoja.getByText("Años de experiencia")).toBeVisible();
    expect(await axeGraves(page)).toEqual([]);
    await hoja.getByRole("button", { name: "Confirmar cambios" }).click();
    await expect(page.getByText("Cambios confirmados. El portal ya los muestra.")).toBeVisible();

    await page.getByRole("button", { name: "Quitar Java" }).click();
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    const pregunta = page.getByRole("dialog", { name: "Este cambio deja el perfil incompleto" });
    await expect(pregunta.getByText("¿Descarto el cambio o paso el perfil a borrador?")).toBeVisible();
    expect(await axeGraves(page)).toEqual([]);
    await pregunta.getByRole("button", { name: "Pasar a borrador" }).click();
    await expect(page.getByText("Cambio guardado. El perfil salió del portal y quedó en borrador.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Guardar borrador" })).toBeVisible();
    expect(errores).toEqual([]);
  });

  test("el reporte sale de la modalidad, se confirma con la revisión y la ficha pasa a Nivel 1", async ({ page }) => {
    const errores: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errores.push(m.text());
    });
    const codigo = await crearPublicado(page);
    await page.goto(`/inventario/${codigo}`);
    await page.getByRole("button", { name: "Registrar reporte detallado" }).click();
    await expect(page.getByRole("heading", { name: "Borrador de la validación técnica" })).toBeVisible();
    await expect(page.getByText("De la modalidad de prueba").first()).toBeVisible();
    expect(await axeGraves(page)).toEqual([]);
    await page.getByRole("textbox", { name: "Entregables esperados" }).fill("Solo el repositorio");
    await expect(page.getByText("Editado por ti")).toBeVisible();
    await page.getByRole("textbox", { name: "Evaluador" }).fill("Célula de arquitectura de Trycore");
    await page.getByLabel("Fecha de la validación").fill("2026-09-29");
    await page.getByRole("textbox", { name: "Resultado" }).fill("Aprobada, nivel senior");
    // Sin la revisión el botón va `aria-disabled` pero se puede pulsar y dice qué falta (D28).
    await page.getByRole("button", { name: "Confirmar borrador" }).click({ force: true });
    await expect(page.getByText("Marca «Revisé cada campo» para confirmar.")).toBeVisible();
    await page.getByRole("checkbox", { name: "Revisé cada campo" }).check();
    await page.getByRole("button", { name: "Confirmar borrador" }).click();
    await expect(page).toHaveURL(new RegExp(`/inventario/${codigo}$`));
    await expect(page.getByText("Reporte confirmado. La ficha del portal ya lo muestra, sin republicar.")).toBeVisible();
    await page.getByRole("button", { name: "Vista previa" }).click();
    // HU-155 (EP-003, D59): cinco campos en orden fijo; el resultado publicado es «Cumple el estándar».
    await expect(page.locator("#vp-fila-validacion dt")).toHaveText(["Prueba aplicada", "Qué se evaluó", "Resultado", "Evaluador", "Fecha"]);
    await expect(page.locator("#vp-fila-validacion")).toContainText("Cumple el estándar");
    for (const ancho of [320, 390]) {
      await page.setViewportSize({ width: ancho, height: 800 });
      const scroll = await page.evaluate(() => document.scrollingElement!.scrollWidth - document.scrollingElement!.clientWidth);
      expect(scroll, `vista previa a ${ancho}`).toBe(0);
    }
    expect(errores).toEqual([]);
  });
});

// Disponibilidad, pausa y vigencia (EP-006 · sub-slice 7: HU-132, HU-133, HU-136) en un navegador
// real: dos publicados propios se actualizan en bloque con resultado por perfil; uno se pausa con un
// motivo del catálogo; con su pausa llevada a 31 días (solo ese perfil propio) la bandeja lo muestra con
// el motivo y «Reactivar» lo devuelve a publicado con la banda elegida. Los ficticios no se tocan.
test.describe("disponibilidad, pausa y vigencia (HU-132, HU-133, HU-136)", () => {
  test.beforeEach(async ({ context, baseURL }, info) => {
    test.skip(info.project.name !== "panel", "solo el panel");
    await abrirSesion(context, baseURL!);
  });

  test("actualizar en bloque → pausar con motivo → a los 31 días en la bandeja → reactivar", async ({ page }) => {
    const errores: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errores.push(m.text());
    });
    const marca = `Vig${randomBytes(3).toString("hex").replace(/\d/g, (d) => "abcdefghij"[Number(d)]!)}`;
    const uno = await crearPublicado(page, marca, "Uno");
    const dos = await crearPublicado(page, marca, "Dos");

    await page.goto(`/inventario?q=${marca}`);
    await page.getByRole("checkbox", { name: `Seleccionar a ${marca} Uno` }).check();
    await page.getByRole("checkbox", { name: `Seleccionar a ${marca} Dos` }).check();
    const lote = page.getByRole("region", { name: "Acciones sobre los perfiles seleccionados" });
    await expect(lote.getByText("2 seleccionados")).toBeVisible();
    await lote.getByLabel("Disponibilidad").selectOption({ label: "En 2 semanas" });
    await lote.getByRole("button", { name: "Aplicar a los 2" }).click();
    await expect(page.getByText("Disponibilidad actualizada en 2 de 2")).toBeVisible();

    // HU-133 · el motivo es en realidad una fecha: la hoja de pausa ofrece el desvío, no pausa y lleva
    // a la fecha de su fila.
    await page.getByRole("button", { name: `Más acciones para ${marca} Dos` }).click();
    await page.getByRole("menuitem", { name: `Pausar a ${marca} Dos` }).click();
    const desvio = page.getByRole("dialog", { name: `Pausar a ${marca} Dos` });
    await expect(desvio.getByText("¿Está ocupada hasta una fecha?")).toBeVisible();
    await expect(desvio.getByText(/Eso no es una pausa, es disponibilidad/)).toBeVisible();
    await desvio.getByRole("button", { name: "Poner la fecha en que queda libre" }).click();
    await expect(desvio).toBeHidden();
    await expect(page.locator(":focus")).toHaveAttribute("type", "date");
    const sigue = new pg.Client({ connectionString: INSTALACION });
    await sigue.connect();
    try {
      const e = await sigue.query(`SELECT estado, motivo_pausa_id FROM inventario.perfiles WHERE codigo = $1`, [dos]);
      expect(e.rows[0]).toEqual({ estado: "publicado", motivo_pausa_id: null });
    } finally {
      await sigue.end();
    }

    await page.getByRole("button", { name: `Más acciones para ${marca} Uno` }).click();
    await page.getByRole("menuitem", { name: `Pausar a ${marca} Uno` }).click();
    const hoja = page.getByRole("dialog", { name: `Pausar a ${marca} Uno` });
    await hoja.getByRole("radio").first().check();
    await hoja.getByRole("button", { name: "Pausar y ocultar del portal" }).click();
    await expect(hoja).toBeHidden();

    const bd = new pg.Client({ connectionString: INSTALACION });
    await bd.connect();
    try {
      const f = (
        await bd.query(
          `SELECT estado, motivo_pausa_id, pausado_en FROM inventario.perfiles WHERE codigo = $1`,
          [uno],
        )
      ).rows[0];
      expect(f.estado).toBe("pausado");
      expect(f.motivo_pausa_id).not.toBeNull();
      expect(f.pausado_en).not.toBeNull();
      // El reloj de la bandeja es el de Bogotá: se lleva la pausa de este perfil propio a 31 días.
      await bd.query(
        `UPDATE inventario.perfiles SET pausado_en = now() - interval '31 days' WHERE codigo = $1`,
        [uno],
      );
    } finally {
      await bd.end();
    }

    await page.goto("/vigencia");
    const fila = page.getByRole("listitem", { name: `${marca} Uno` });
    await expect(fila.getByText("31 días")).toBeVisible();
    await expect(fila.getByText("Pausado").first()).toBeVisible();
    await expect(page.getByRole("listitem", { name: `${marca} Dos` })).toHaveCount(0);
    await fila.getByRole("button", { name: `Reactivar a ${marca} Uno` }).click();
    const form = page.getByRole("form", { name: `Reactivar o archivar a ${marca} Uno` });
    await form.getByLabel("Disponibilidad al reactivar").selectOption({ label: "Disponible ahora" });
    await form.getByRole("button", { name: "Reactivar" }).click();
    await expect(page.getByText(/Volvió al portal con «/)).toBeVisible();
    await expect(page.getByRole("listitem", { name: `${marca} Uno` })).toHaveCount(0);

    const bd2 = new pg.Client({ connectionString: INSTALACION });
    await bd2.connect();
    try {
      const r = (
        await bd2.query(
          `SELECT codigo, estado, pausado_en, motivo_pausa_id FROM inventario.perfiles WHERE codigo = ANY($1) ORDER BY codigo`,
          [[uno, dos]],
        )
      ).rows;
      expect(r.map((x) => x.estado)).toEqual(["publicado", "publicado"]);
      expect(r[0].pausado_en).toBeNull();
      expect(r[0].motivo_pausa_id).toBeNull();
    } finally {
      await bd2.end();
    }
    expect(errores).toEqual([]);
  });
});

// Coherencia y archivo (EP-006 · sub-slice 8: HU-134, HU-135) en un navegador real: un publicado propio
// se pausa (queda sin disponibilidad), se le pone fecha en su fila y la contradicción ALTA aparece en esa
// misma fila; «Publicar con esa disponibilidad» la corrige y lo publica; después se archiva desde «Más
// acciones» con su confirmación y un enlace curado que lo incluía lo ve «archivado» (fuera del banco).
test.describe("coherencia y archivo (HU-134, HU-135)", () => {
  test.beforeEach(async ({ context, baseURL }, info) => {
    test.skip(info.project.name !== "panel", "solo el panel");
    await abrirSesion(context, baseURL!);
  });

  test("pausado con fecha → ALTA en la fila → publicar con esa disponibilidad → archivar → fuera del banco", async ({ page }) => {
    const errores: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errores.push(m.text());
    });
    const marca = `Coh${randomBytes(3).toString("hex").replace(/\d/g, (d) => "abcdefghij"[Number(d)]!)}`;
    const uno = await crearPublicado(page, marca, "Uno");
    const dos = await crearPublicado(page, marca, "Dos");
    const nombre = `${marca} Uno`;

    await page.goto(`/inventario?q=${marca}`);
    await page.getByRole("button", { name: `Más acciones para ${nombre}` }).click();
    await page.getByRole("menuitem", { name: `Pausar a ${nombre}` }).click();
    const hoja = page.getByRole("dialog", { name: `Pausar a ${nombre}` });
    await hoja.getByRole("radio").first().check();
    await hoja.getByRole("button", { name: "Pausar y ocultar del portal" }).click();
    // Pausar recarga la página: se elige la fecha cuando ya cargó (el aviso sale tras la recarga).
    await expect(page.getByText(`${nombre} quedó pausado y salió del portal.`)).toBeVisible();
    await expect(page.getByLabel(`Disponibilidad de ${nombre}`)).toBeVisible();
    await expect(page.getByText("Bloquea la publicación")).toHaveCount(0);

    await page.getByLabel(`Disponibilidad de ${nombre}`).selectOption({ label: "En 2 semanas" });
    await expect(page.getByText("Bloquea la publicación")).toBeVisible();
    await expect(page.getByText("Contradice el estado pausado")).toBeVisible();
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      ),
    ).toEqual([]);
    await page.getByRole("button", { name: `Publicar con esa disponibilidad: ${nombre}` }).click();
    await expect(page.getByText(`${nombre} volvió a publicado con esa disponibilidad.`)).toBeVisible();
    await expect(page.getByText("Bloquea la publicación")).toHaveCount(0);

    const bd = new pg.Client({ connectionString: INSTALACION });
    await bd.connect();
    try {
      const f = (
        await bd.query(
          `SELECT estado, disponibilidad_fecha IS NOT NULL AS con_fecha, pausado_en FROM inventario.perfiles WHERE codigo = $1`,
          [uno],
        )
      ).rows[0];
      expect(f).toMatchObject({ estado: "publicado", con_fecha: true, pausado_en: null });
      await bd.query(
        `INSERT INTO identidad.enlaces (cuenta_ref, cuenta_nombre, razon, codigos_perfil, vigente_desde, vigente_hasta, generado_por)
         VALUES ('1', 'Cuenta e2e', 'Recorrido de coherencia.', $1, now() - interval '1 day', now() + interval '20 days', gen_random_uuid())`,
        [[uno, dos]],
      );

      await page.getByRole("button", { name: `Más acciones para ${nombre}` }).click();
      await page.getByRole("menuitem", { name: `Archivar a ${nombre}` }).click();
      const pop = page.getByRole("dialog", { name: `¿Archivar a ${nombre}?` });
      await expect(pop.getByText("Se archiva, no se borra.")).toBeVisible();
      await pop.getByRole("button", { name: "Archivar perfil" }).click();
      await expect(page.getByText(`${nombre} quedó archivado: no se borró`)).toBeVisible();

      const sel = (
        await bd.query(
          `SELECT codigo, estado FROM operacion.estado_seleccion_perfil WHERE codigo = ANY($1) ORDER BY codigo`,
          [[uno, dos]],
        )
      ).rows;
      expect(sel).toEqual([
        { codigo: uno, estado: "archivado" },
        { codigo: dos, estado: "disponible" },
      ]);
    } finally {
      await bd.end();
    }
    expect(errores).toEqual([]);
  });
});

// Colocados (EP-006 · sub-slice 9, HU-137) en un navegador real: registrar sin fecha de liberación no
// guarda y lo dice; con ella, el perfil aparece en el grupo de los próximos 60 días y su hoja dice lo
// que ve el cliente. Perfil propio creado por la API, archivado al final (cierra su colocación).
test.describe("colocados (HU-137)", () => {
  test.beforeEach(async ({ context, baseURL }, info) => {
    test.skip(info.project.name !== "panel", "solo el panel");
    await abrirSesion(context, baseURL!);
  });

  test("registrar sin liberación → aviso sin guardar → con liberación → fila destacada → hoja del cliente", async ({ page }) => {
    const errores: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errores.push(m.text());
    });
    const marca = `Col${randomBytes(3).toString("hex").replace(/\d/g, (d) => "abcdefghij"[Number(d)]!)}`;
    const codigo = await crearPublicado(page, marca, "Uno");
    const nombre = `${marca} Uno`;
    const liberacion = new Date(Date.now() - 5 * 3_600_000 + 40 * 86_400_000).toISOString().slice(0, 10);
    try {
      await page.goto("/colocados");
      await page.getByRole("button", { name: "Registrar colocado" }).click();
      const hoja = page.getByRole("dialog", { name: "Registrar colocado" });
      await hoja.getByLabel("Perfil").selectOption(codigo);
      await expect(hoja.getByText("Hoy: «Disponible ahora».")).toBeVisible();
      await hoja.getByLabel("Cliente").fill("Cuenta e2e");
      await hoja.getByRole("button", { name: "Guardar colocado" }).click();
      await expect(
        hoja.getByText(`Un colocado siempre lleva su fecha de liberación. No se guardó: ${nombre} sigue publicado con «Disponible ahora».`),
      ).toBeVisible();
      await expect(hoja.getByLabel("Fecha de liberación")).toHaveAttribute("aria-invalid", "true");
      expect(
        (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical",
        ),
      ).toEqual([]);

      await hoja.getByLabel("Fecha de liberación").fill(liberacion);
      await hoja.getByRole("button", { name: "Guardar colocado" }).click();
      await expect(page.getByText(`${nombre} quedó colocado en Cuenta e2e`)).toBeVisible();
      const fila = page.getByRole("row", { name: new RegExp(nombre) });
      await expect(fila).toContainText("Cuenta e2e");
      await expect(fila).toContainText("40 días");
      await expect(fila.locator(".cl-faltan--pronto")).toBeVisible();

      await fila.getByRole("button", { name: nombre }).click();
      const detalle = page.getByRole("dialog", { name: nombre });
      await expect(detalle.getByText("Lo que ve el cliente")).toBeVisible();
      await expect(detalle.getByText("Publicado")).toBeVisible();
      await expect(detalle.getByText("fin de la asignación")).toBeVisible();
      await expect(detalle.getByRole("link", { name: "Abrir en el inventario" })).toHaveAttribute(
        "href",
        `/inventario/${codigo}`,
      );
      expect(
        (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical",
        ),
      ).toEqual([]);
      for (const ancho of [320, 390]) {
        await page.setViewportSize({ width: ancho, height: 800 });
        expect(
          await page.evaluate(() => document.scrollingElement!.scrollWidth - document.scrollingElement!.clientWidth),
        ).toBe(0);
      }
    } finally {
      const galletas = await page.context().cookies();
      await page.request.post(`/api/v1/perfiles/${codigo}/archivar`, {
        data: {},
        headers: {
          "x-ps-csrf": galletas.find((c) => c.name === "__Host-csrf")!.value,
          origin: new URL(page.url()).origin,
          cookie: galletas.map((c) => `${c.name}=${c.value}`).join("; "),
        },
      });
    }
    expect(errores).toEqual([]);
  });
});

// Carga de Operaciones (EP-006 · sub-slice 9, HU-150) en un navegador real: una hoja de cálculo se
// rechaza entera con su aviso; el CSV entra con su resultado y la columna ignorada; la fila distinta de
// un colocado del panel queda como diferencia y se acepta. Perfiles propios, archivados al final.
test.describe("carga de Operaciones (HU-150)", () => {
  test.beforeEach(async ({ context, baseURL }, info) => {
    test.skip(info.project.name !== "panel", "solo el panel");
    await abrirSesion(context, baseURL!);
  });

  test("xlsx rechazado → CSV aplicado con columna ignorada → diferencia con el panel aceptada", async ({ page }) => {
    const errores: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errores.push(m.text());
    });
    const marca = `Ope${randomBytes(3).toString("hex").replace(/\d/g, (d) => "abcdefghij"[Number(d)]!)}`;
    const nuevo = await crearPublicado(page, marca, "Uno");
    const delPanel = await crearPublicado(page, marca, "Dos");
    const dia = (n: number) => new Date(Date.now() - 5 * 3_600_000 + n * 86_400_000).toISOString().slice(0, 10);
    const galletas = await page.context().cookies();
    const cab = {
      "x-ps-csrf": galletas.find((c) => c.name === "__Host-csrf")!.value,
      origin: "http://127.0.0.1:3101",
      cookie: galletas.map((c) => `${c.name}=${c.value}`).join("; "),
    };
    try {
      expect(
        (
          await page.request.post("/api/v1/colocados", {
            data: { codigo: delPanel, cuenta: "Seguros Altamira", inicio: dia(-100), liberacion: dia(43) },
            headers: cab,
          })
        ).status(),
      ).toBe(200);
      await page.goto("/colocados");
      const archivo = page.locator("#cl-archivo");
      await archivo.setInputFiles({
        name: "asignaciones-octubre.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        buffer: Buffer.from("PK\u0003\u0004"),
      });
      await expect(page.locator(".pp-aviso--danger")).toContainText("No se cargó asignaciones-octubre.xlsx.");
      await expect(page.locator(".pp-aviso--danger")).toContainText("Solo se admite un archivo JSON o CSV.");

      await archivo.setInputFiles({
        name: "asignaciones-30sep.csv",
        mimeType: "text/csv",
        buffer: Buffer.from(
          [
            "Código del perfil,Cliente,Fecha de inicio,Fecha de liberación,Observaciones",
            `${nuevo},Logística Magdalena,${dia(-30)},${dia(80)},renovación probable`,
            `${delPanel},Seguros Altamira,${dia(-100)},${dia(60)},`,
          ].join("\n"),
        ),
      });
      await page.waitForURL(/\/colocados\?carga=/);
      await expect(page.getByText("Carga aplicada: 2 filas de asignaciones-30sep.csv.")).toBeVisible();
      await expect(page.getByText(/Se ignoró la columna «Observaciones»/)).toBeVisible();
      const fila = page.getByRole("row", { name: new RegExp(`${marca} Uno`) });
      await expect(fila).toContainText(/Operaciones · corte/);
      const dif = page.getByRole("region", { name: "Diferencias con Operaciones" }).or(
        page.locator("section[aria-labelledby=cl-dif-t]"),
      );
      await expect(dif).toContainText(`${marca} Dos`);
      expect(
        (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical",
        ),
      ).toEqual([]);
      await page.getByRole("button", { name: `Aceptar la de Operaciones para ${marca} Dos` }).click();
      await expect(page.getByText(`${marca} Dos queda con los datos de Operaciones.`)).toBeVisible();
      await expect(page.locator("section[aria-labelledby=cl-dif-t]")).toHaveCount(0);
      for (const ancho of [320, 390]) {
        await page.setViewportSize({ width: ancho, height: 800 });
        expect(
          await page.evaluate(() => document.scrollingElement!.scrollWidth - document.scrollingElement!.clientWidth),
        ).toBe(0);
      }
    } finally {
      for (const c of [nuevo, delPanel])
        await page.request.post(`/api/v1/perfiles/${c}/archivar`, { data: {}, headers: cab });
    }
    expect(errores).toEqual([]);
  });
});

// Observador (EP-006 · sub-slice 9, HU-124) en un navegador real: la dirección de edición muestra el
// formulario inerte con «tu rol es de consulta» y «Avisar a Talento Humano» deja el aviso con el perfil
// identificado. El trabajo encolado se cierra al final para que el worker local no envíe el aviso.
test.describe("observador (HU-124)", () => {
  test.beforeEach(async ({ context, baseURL }, info) => {
    test.skip(info.project.name !== "panel", "solo el panel");
    await abrirSesion(context, baseURL!, { correo: "e2e-observador@trycore.com", rol: "observador" });
  });

  test("dirección de edición → consulta explicada → avisar a Talento Humano con el perfil", async ({ page }) => {
    const errores: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errores.push(m.text());
    });
    const bd = new pg.Client({ connectionString: INSTALACION });
    await bd.connect();
    try {
      const codigo = (
        await bd.query(`SELECT codigo FROM inventario.perfiles WHERE estado = 'publicado' ORDER BY codigo LIMIT 1`)
      ).rows[0].codigo as string;
      await page.goto("/inventario");
      await expect(page.getByRole("columnheader", { name: "¿Dato desactualizado?" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Crear perfil" })).toHaveCount(0);

      await page.goto(`/inventario/${codigo}`);
      await expect(page.getByText("Tu rol es de consulta.")).toBeVisible();
      await expect(page.getByText(/Llegaste por la dirección de edición de/)).toBeVisible();
      await expect(page.getByLabel("Nombre", { exact: true })).toBeDisabled();
      expect(
        (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical",
        ),
      ).toEqual([]);

      await page.getByRole("button", { name: "Avisar a Talento Humano" }).click();
      const hoja = page.getByRole("dialog", { name: "Avisar a Talento Humano" });
      await expect(hoja).toContainText(codigo);
      await hoja.getByLabel(/¿Qué está desactualizado\?/).fill("Prueba e2e: ya no está disponible.");
      await hoja.getByRole("button", { name: "Enviar aviso" }).click();
      await expect(page.getByText(/Aviso enviado a Talento Humano sobre/)).toBeVisible();
      const t = (
        await bd.query(
          `SELECT id, payload FROM operacion.trabajos WHERE tipo = 'notificar' AND origen = 'panel' ORDER BY id DESC LIMIT 1`,
        )
      ).rows[0];
      expect(t.payload).toMatchObject({ motivo: "dato_desactualizado", codigo, nota: "Prueba e2e: ya no está disponible." });
      await bd.query(`UPDATE operacion.trabajos SET estado = 'caducado', ultimo_error = 'e2e' WHERE id = $1`, [t.id]);
    } finally {
      await bd.end();
    }
    expect(errores).toEqual([]);
  });
});

// Recorrido del sub-slice 10 (HU-151, HU-147, HU-138): inscribir a otra administradora → entra → bajarla a
// observador corta su sesión en la siguiente petición → cambiar el contacto → el portal lo muestra → el
// registro del perfil muestra cada cambio con su autor. Lo que se crea en la BD de desarrollo se retira al
// terminar (la inscrita queda de baja y el contacto vuelve al buzón por omisión).
test.describe("administración (HU-151, HU-147, HU-138)", () => {
  test.beforeEach(async ({ context, baseURL }, info) => {
    test.skip(info.project.name !== "panel", "solo el panel");
    await abrirSesion(context, baseURL!);
  });

  test("inscribir → entra → bajarla de rol corta su sesión → contacto → portal → registro con autor", async ({
    page,
    browser,
    baseURL,
  }) => {
    const otra = `e2e-admin-${randomBytes(3).toString("hex")}@trycore.com`;
    const bd = new pg.Client({ connectionString: INSTALACION });
    await bd.connect();
    // El contacto es una fila única que también escribe el e2e HU-147 del portal (otro proyecto, en
    // paralelo): se turnan con el mismo candado (se suelta al cerrar esta conexión). La BD de desarrollo
    // es la del e2e: el contacto que hubiera se repone al terminar, no se borra.
    await bd.query(`SELECT pg_advisory_lock($1)`, [CANDADO_CONTACTO]);
    const contactoPrevio = (await bd.query(`SELECT * FROM inventario.configuracion_contacto`)).rows[0];
    try {
      await page.goto("/administracion/accesos");
      await page.getByRole("button", { name: "Inscribir correo" }).click();
      const alta = page.getByRole("dialog", { name: "Inscribir un correo" });
      await alta.getByLabel("Correo corporativo").fill(otra);
      await alta.getByRole("radio", { name: /^Administradora de inventario/ }).check();
      await alta.getByRole("button", { name: "Inscribir" }).click();
      await expect(page.getByText(`${otra} inscrito como administradora de inventario.`)).toBeVisible();

      // Entra (la sesión se abre con su rol de administradora, como la crea la puerta).
      const u = await bd.query(`SELECT id FROM identidad_panel.usuarios_panel WHERE correo = $1`, [otra]);
      const id = randomBytes(32).toString("base64url");
      await bd.query(
        `INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, expira, rol_al_abrir)
         VALUES ($1, $2, now() + interval '12 hours', 'administrador')`,
        [createHash("sha256").update(id).digest(), u.rows[0].id],
      );
      const suya = await browser.newContext({ extraHTTPHeaders: { "x-ps-edge": entornoPanel().EDGE_SECRET! } });
      await suya.addCookies([
        { name: "__Host-pp", value: id, domain: new URL(baseURL!).hostname, path: "/", secure: true, httpOnly: true, sameSite: "Lax" },
      ]);
      const ella = await suya.newPage();
      await ella.goto(`${baseURL}/administracion/accesos`);
      await expect(ella.getByRole("heading", { name: "Inscritos activos" })).toBeVisible();

      // Bajarla a observadora: la hoja avisa de la sesión abierta y su siguiente petición la corta.
      await page.reload();
      await page.getByRole("button", { name: `Cambiar el rol de ${otra}` }).click();
      const hoja = page.getByRole("dialog", { name: `Cambiar el rol de ${otra}` });
      await expect(hoja.getByText("Tiene una sesión abierta.")).toBeVisible();
      await hoja.getByRole("button", { name: "Pasar a observador" }).click();
      await expect(page.getByText(`${otra} pasó a observador.`)).toBeVisible();
      await ella.goto(`${baseURL}/inventario`);
      await expect(ella).toHaveURL(/\/acceso\?motivo=rol_cambiado/);
      await expect(ella.getByText("Cambió tu rol en el panel")).toBeVisible();
      await suya.close();

      // Contacto: solo correo → el portal dice «escribe a People Service: …».
      await page.goto("/administracion/contacto");
      await page.getByLabel("Nombre (opcional)").fill("");
      await page.getByLabel("Cargo (opcional)").fill("");
      await page.getByLabel("Correo", { exact: true }).fill("servicio.clientes@trycore.com");
      await page.getByRole("button", { name: "Guardar contacto" }).click();
      await expect(page.getByText("Contacto guardado.")).toBeVisible();
      await page.goto("http://127.0.0.1:3100/acceso?motivo=enlace_revocado");
      await expect(page.getByText("o escribe a People Service: servicio.clientes@trycore.com")).toBeVisible();

      // Registro del perfil: cada cambio con su autor.
      await page.goto("/inventario/PS-0142/auditoria");
      await expect(page.getByRole("table", { name: /Registro de auditoría del perfil PS-0142/ })).toBeVisible();
      const quienes = await page.locator(".au-td-quien").allInnerTexts();
      expect(quienes.length).toBeGreaterThan(0);
      expect(quienes.every((q) => q.trim().length > 0)).toBe(true);
      expect(
        (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical",
        ),
      ).toEqual([]);
    } finally {
      await bd.query(`DELETE FROM inventario.configuracion_contacto`);
      if (contactoPrevio)
        await bd.query(
          `INSERT INTO inventario.configuracion_contacto (unica, correo, nombre, cargo, actualizado_por, actualizado_en)
           VALUES (true, $1, $2, $3, $4, $5)`,
          [contactoPrevio.correo, contactoPrevio.nombre, contactoPrevio.cargo, contactoPrevio.actualizado_por, contactoPrevio.actualizado_en],
        );
      await bd.query(
        `UPDATE identidad_panel.usuarios_panel SET activo = false, dado_de_baja_en = now() WHERE correo = $1`,
        [otra],
      );
      await bd.end();
    }
  });
});
