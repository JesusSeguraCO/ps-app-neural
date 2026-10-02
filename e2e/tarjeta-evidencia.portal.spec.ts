// Recorrido de la tarjeta en un navegador real (EP-003 · SS4, tarea 4.7; HU-153, HU-081, HU-119):
// entrar con el código que llega al buzón → la selección del correo (tarjetas con la capacidad primero,
// el Sello Personal y el código al pie, sin evidencia) → ampliar al banco → filtrar por una categoría →
// cada tarjeta con su línea ✓ → abrir la ficha con «Frente a tu búsqueda» y la misma línea. Los tres
// perfiles los crea el spec por la API del panel (publicados con las validaciones de entrada y el Sello
// Personal); el código lo envía el worker real del worktree con el doble de Mailgun (APP_ENV=local), y
// el spec lo lee de su registro, como lo leería la persona en su buzón.
import AxeBuilder from "@axe-core/playwright";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import pg from "pg";

const INSTALACION =
  process.env.BD_INSTALACION_URL ?? "postgres://ps_instalacion@127.0.0.1:54329/ps";
const BD = new URL(INSTALACION).pathname.slice(1);
const PANEL = process.env.PANEL_URL ?? "http://127.0.0.1:3201";
const ADMIN = "e2e-tarjeta-ss4@trycore.com";
const SELLO_A = [
  "Comunicación directa con negocio",
  "Rigor en la documentación",
  "Calma bajo presión",
];
const SELLO_B = ["Liderazgo técnico", "Pensamiento sistémico", "Comunicación clara"];

const entorno = (proceso: string): Record<string, string> => {
  const salida = execFileSync("bash", ["scripts/entorno-dev.sh", proceso], { encoding: "utf8" });
  return Object.fromEntries(
    [...salida.matchAll(/^export ([A-Z_]+)=(.*)$/gm)].map((m) => [m[1]!, m[2]!]),
  );
};

async function conBd<T>(f: (bd: pg.Client) => Promise<T>): Promise<T> {
  const bd = new pg.Client({ connectionString: INSTALACION });
  await bd.connect();
  try {
    return await f(bd);
  } finally {
    await bd.end();
  }
}

async function sesionPanel(context: BrowserContext): Promise<void> {
  await conBd(async (bd) => {
    const hmac = createHmac("sha256", entorno("panel").EMAIL_HMAC_KEY!).update(ADMIN).digest();
    const u = await bd.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ($1, $2, 'administrador')
       ON CONFLICT (correo_hmac) DO UPDATE SET activo = true RETURNING id`,
      [ADMIN, hmac],
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
        domain: "127.0.0.1",
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
  });
}

interface Alta {
  nombre: string;
  sello: string[];
  tecnologias: string[];
  sectores: string[];
}

// Tres publicados por la API del panel, con las tres validaciones de entrada y su Sello Personal.
async function publicar(page: Page, altas: Alta[]): Promise<string[]> {
  const ids = await conBd(async (bd) => {
    const id = async (tabla: string, cond: string, p: unknown[] = []) =>
      (await bd.query(`SELECT id FROM inventario.${tabla} WHERE ${cond} LIMIT 1`, p)).rows[0]
        .id as string;
    const tecnologias = Object.fromEntries(
      await Promise.all(
        [...new Set(altas.flatMap((a) => a.tecnologias))].map(async (t) => [
          t,
          await id("catalogo_tecnologias", "nombre = $1", [t]),
        ]),
      ),
    );
    const sectores = Object.fromEntries(
      await Promise.all(
        [...new Set(altas.flatMap((a) => a.sectores))].map(async (s) => [
          s,
          await id("catalogo_sectores", "nombre = $1", [s]),
        ]),
      ),
    );
    return {
      comunes: {
        rolId: await id("catalogo_roles", "nombre = 'Desarrolladora backend Java'"),
        seniorityId: await id("catalogo_seniorities", "nombre = 'Senior'"),
        ciudadId: await id("catalogo_ciudades", "nombre = 'Medellín'"),
        modalidadTrabajoId: await id("catalogo_modalidades", "nombre = 'remoto'"),
        modalidadPruebaId: await id(
          "catalogo_modalidades_prueba",
          "nombre = 'Prueba práctica revisada por un arquitecto'",
        ),
        saroAlcanceId: await id("catalogo_alcances_saro", "activo"),
      },
      tecnologias,
      sectores,
    };
  });
  await page.goto(`${PANEL}/inventario`);
  return page.evaluate(
    async ({ ids, altas }) => {
      const csrf = decodeURIComponent(
        document.cookie
          .split("; ")
          .find((c) => c.startsWith("__Host-csrf="))!
          .slice("__Host-csrf=".length),
      );
      const enviar = async (ruta: string, cuerpo: unknown, version?: number) => {
        const r = await fetch(ruta, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-ps-csrf": csrf,
            ...(version ? { "if-match": `"${version}"` } : {}),
          },
          body: JSON.stringify(cuerpo),
        });
        const j = await r.json();
        if (!r.ok) throw new Error(`${ruta} ${r.status} ${JSON.stringify(j)}`);
        return j;
      };
      const salida: string[] = [];
      for (const a of altas) {
        const { perfil } = await enviar("/api/v1/perfiles", {
          nombre: a.nombre,
          primerApellido: "Tarjeta",
          aniosExperiencia: 9,
          disponibilidad: { opcion: "dos_semanas" },
          saroFecha: "2026-03-15",
          discFecha: "2026-04-10",
          selloPersonal: a.sello,
          tecnologiaIds: a.tecnologias.map((t) => ids.tecnologias[t]),
          sectorIds: a.sectores.map((s) => ids.sectores[s]),
          experiencias: [
            { cargo: "Backend", desde: 2018, descripcion: "Pagos inmediatos para banca." },
          ],
          ...ids.comunes,
        });
        const c = await enviar(`/api/v1/perfiles/${perfil.codigo}/consentimiento`, {
          nombreApellido: true,
          trayectoria: true,
          clientes: true,
        });
        await enviar(`/api/v1/perfiles/${perfil.codigo}/publicar`, {}, c.perfil.version);
        salida.push(perfil.codigo as string);
      }
      return salida;
    },
    { ids, altas },
  );
}

async function enlace(codigos: string[], correo: string): Promise<string> {
  const clave = entorno("portal").EMAIL_HMAC_KEY!;
  return conBd(async (bd) => {
    const e = await bd.query(
      `INSERT INTO identidad.enlaces (cuenta_nombre, proyecto, razon, codigos_perfil, vigente_desde, vigente_hasta, generado_por)
       VALUES ('Bancolombia', 'Pagos inmediatos', 'Backend para la nueva plataforma de pagos.', $1, now() - interval '1 day',
               now() + interval '20 days', gen_random_uuid()) RETURNING id`,
      [codigos],
    );
    await bd.query(
      `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, $2, $3)`,
      [e.rows[0].id, correo, createHmac("sha256", clave).update(correo).digest()],
    );
    const token = randomBytes(32).toString("base64url");
    await bd.query(`INSERT INTO identidad.enlace_tokens (enlace_id, token_hash) VALUES ($1, $2)`, [
      e.rows[0].id,
      createHash("sha256").update(token).digest(),
    ]);
    return token;
  });
}

// El worker real del worktree con el doble de Mailgun: registra cada correo «enviado» con su texto.
function arrancarWorker(): {
  proceso: ChildProcess;
  codigoPara: (correo: string) => Promise<string>;
} {
  const e = entorno("worker");
  const conBdAislada = (u: string) => u.replace(/\/ps$/, `/${BD}`);
  const env = {
    ...process.env,
    ...e,
    DATABASE_URL: conBdAislada(e.DATABASE_URL!),
    DATABASE_DIRECT_URL: conBdAislada(e.DATABASE_DIRECT_URL!),
    EXPORT_DATABASE_URL: conBdAislada(e.EXPORT_DATABASE_URL!),
  };
  const proceso = spawn("node", ["apps/worker/dist/worker.js"], {
    env,
    stdio: ["ignore", "pipe", "ignore"],
  });
  let salida = "";
  proceso.stdout!.on("data", (d) => (salida += String(d)));
  const codigoPara = async (correo: string) => {
    let codigo = "";
    await expect
      .poll(
        () => {
          for (const l of salida.split("\n")) {
            if (!l.includes('"correo_doble"')) continue;
            const m = JSON.parse(l) as { para: string; texto: string };
            const c = m.para === correo ? m.texto.match(/^(\d{3}) (\d{3})$/m)?.slice(1).join("") : undefined;
            if (c) codigo = c;
          }
          return codigo;
        },
        { timeout: 30_000, intervals: [300] },
      )
      .toMatch(/^\d{6}$/);
    return codigo;
  };
  return { proceso, codigoPara };
}

async function sinIncidenciasGraves(page: Page) {
  const r = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(
    graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
  ).toEqual([]);
}

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
