// V8-4 (ADR-0008): el catálogo solo sale tras sesión y por el esquema estricto, por los dos canales
// (API y HTML/RSC). Contra el servidor standalone real del portal con `ps_portal` por PgBouncer y
// los perfiles ficticios sembrados por el worker (tarea 3.2).
import { createHash, randomBytes } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CAMPOS_PERFIL_CATALOGO } from "@ps/contratos/catalogo";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  RAIZ,
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { PERFILES_FICTICIOS, sembrarFicticios } from "./worker/src/sembrar-ficticios";

// Claves de la lista negra B.4 y de lo que la proyección recorta (fecha y ciudad), en forma de clave
// JSON (`"clave":`, también escapada `\"clave\":` en el payload RSC): así no chocan con el texto de la
// interfaz («tu correo corporativo») ni con atributos HTML (`type="email"`), que no son datos.
const CLAVES_PROHIBIDAS = [
  "foto",
  "fotografia",
  "correo",
  "email",
  "telefono",
  "celular",
  "linkedin",
  "cv",
  "hojaDeVida",
  "motivacion",
  "proyeccion",
  "promedio",
  "certificaciones",
  "disc",
  "segundoApellido",
  "ciudad",
  "disponibilidadFecha",
  "disponibilidad_fecha",
  "disponibilidad_actualizada_en",
  "primer_apellido",
  "tarifa",
];

const comoClave = (clave: string) => new RegExp(`\\\\?"${clave}\\\\?"\\s*:`);

function listar(dir: string): string[] {
  const salida: string[] = [];
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) salida.push(...listar(p));
    else salida.push(p);
  }
  return salida;
}

describe.skipIf(!HAY_BD || !hayBuild("portal"))("catálogo tras sesión (V8-4)", () => {
  let bd: BdPrueba;
  let srv: ServidorPrueba;
  let cookie: string;
  let enlaceId: string;
  const fechasSembradas = new Set<string>();

  const nuevaSesion = async (enlace: string, invitado: string) => {
    const id = randomBytes(32).toString("base64url");
    await bd.instalacion.query(
      `INSERT INTO identidad.sesiones_portal (id_hash, enlace_id, invitado_id, expira)
       VALUES ($1, $2, $3, now() + interval '30 days')`,
      [createHash("sha256").update(id).digest(), enlace, invitado],
    );
    return `__Host-ps=${id}`;
  };

  beforeAll(async () => {
    bd = await crearBdPrueba();
    const panelEnv = entornoDev("panel");
    await sembrarFicticios({
      bd: bd.como("ps_panel"),
      auditoria: { hmac: panelEnv.AUDIT_HMAC_KEY!, kek: panelEnv.AUDIT_KEK! },
      appEnv: "ci",
      registrar: () => {},
    });
    const f = await bd.instalacion.query(
      `SELECT disponibilidad_fecha::text f FROM inventario.perfiles WHERE disponibilidad_fecha IS NOT NULL`,
    );
    for (const r of f.rows) fechasSembradas.add(r.f);
    const i = bd.instalacion;
    const admin = await i.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('ana@trycore.com', '\\x01', 'administrador') RETURNING id`,
    );
    enlaceId = (
      await i.query(
        `INSERT INTO identidad.enlaces (cuenta_ref, cuenta_nombre, razon, vigente_hasta, generado_por, codigos_perfil)
         VALUES ('hs-1', 'Cuenta', 'razón', now() + interval '30 days', $1, ARRAY['PS-0142'])
         RETURNING id`,
        [admin.rows[0].id],
      )
    ).rows[0].id;
    const invitado = await i.query(
      `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, 'lider@cliente.com', '\\x02') RETURNING id`,
      [enlaceId],
    );
    cookie = await nuevaSesion(enlaceId, invitado.rows[0].id);
    srv = await arrancarServidor("portal", {
      ...entornoDev("portal"),
      APP_ENV: "ci",
      DATABASE_URL: bd.urlDe("ps_portal"),
    });
  }, 90_000);

  afterAll(async () => {
    await srv?.cerrar();
    await bd?.cerrar();
  });

  it("401 sin sesión y sin ningún dato de perfil en la respuesta", async () => {
    const r = await srv.pedir("/api/v1/catalogo");
    expect(r.status).toBe(401);
    const cuerpo = await r.text();
    for (const p of PERFILES_FICTICIOS) expect(cuerpo).not.toContain(p.primerApellido);
  });

  it("401 con una cookie que no existe", async () => {
    expect(
      (await srv.pedir("/api/v1/catalogo", { headers: { cookie: "__Host-ps=no-existe" } })).status,
    ).toBe(401);
  });

  it("con sesión: 200, privado, solo los publicados y exactamente los campos del esquema", async () => {
    const r = await srv.pedir("/api/v1/catalogo", { headers: { cookie } });
    expect(r.status).toBe(200);
    expect(r.headers.get("cache-control")).toContain("no-store");
    const cuerpo = await r.text();
    const datos = JSON.parse(cuerpo) as { perfiles: Array<Record<string, unknown>> };
    expect(Object.keys(datos)).toEqual(["perfiles"]);
    const publicados = PERFILES_FICTICIOS.filter((p) => p.estado === "publicado")
      .map((p) => p.codigo)
      .sort();
    expect(datos.perfiles.map((p) => p.codigo)).toEqual(publicados);
    for (const p of datos.perfiles)
      expect(Object.keys(p).sort()).toEqual([...CAMPOS_PERFIL_CATALOGO].sort());
    for (const clave of CLAVES_PROHIBIDAS) expect(cuerpo, clave).not.toMatch(comoClave(clave));
    for (const fecha of fechasSembradas) expect(cuerpo, fecha).not.toContain(fecha);
    for (const p of PERFILES_FICTICIOS.filter((x) => x.estado === "publicado"))
      expect(cuerpo, p.ciudad).not.toContain(`"${p.ciudad}"`);
  });

  it("un enlace revocado corta el catálogo en la siguiente petición", async () => {
    const i = bd.instalacion;
    const inv = await i.query(
      `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, 'otro@cliente.com', '\\x03') RETURNING id`,
      [enlaceId],
    );
    const otra = await nuevaSesion(enlaceId, inv.rows[0].id);
    expect((await srv.pedir("/api/v1/catalogo", { headers: { cookie: otra } })).status).toBe(200);
    await i.query(`UPDATE identidad.enlace_invitados SET activo = false WHERE id = $1`, [
      inv.rows[0].id,
    ]);
    expect((await srv.pedir("/api/v1/catalogo", { headers: { cookie: otra } })).status).toBe(401);
  });

  it("el HTML y el payload RSC de cada página del portal, con sesión, no llevan claves B.4 ni valores sembrados", async () => {
    const manifiesto = JSON.parse(
      readFileSync(
        `${RAIZ}apps/portal/.next/standalone/apps/portal/.next/app-path-routes-manifest.json`,
        "utf8",
      ),
    ) as Record<string, string>;
    const paginas = [...new Set(Object.values(manifiesto))].filter(
      (r) => !r.startsWith("/api/") && r !== "/_not-found",
    );
    expect(paginas.length).toBeGreaterThan(0);
    for (const pagina of paginas) {
      for (const rsc of [false, true]) {
        const headers: Record<string, string> = { cookie };
        if (rsc) headers.RSC = "1";
        const cuerpo = await (await srv.pedir(pagina, { headers })).text();
        const donde = `${pagina} RSC=${rsc}`;
        for (const clave of CLAVES_PROHIBIDAS)
          expect(cuerpo, `${donde} ${clave}`).not.toMatch(comoClave(clave));
        for (const fecha of fechasSembradas)
          expect(cuerpo, `${donde} ${fecha}`).not.toContain(fecha);
      }
    }
  });

  it("los ficheros estáticos del cliente no contienen datos de perfiles", () => {
    const estaticos = listar(`${RAIZ}apps/portal/.next/static`);
    expect(estaticos.length).toBeGreaterThan(0);
    const contenido = estaticos.map((f) => readFileSync(f, "utf8")).join("\n");
    for (const p of PERFILES_FICTICIOS) {
      expect(contenido, p.codigo).not.toContain(p.codigo);
      expect(contenido, p.primerApellido).not.toContain(p.primerApellido);
    }
  });
});

describe("server-only en los módulos con datos o secretos (V8-4)", () => {
  // Excepciones justificadas: perimetro.ts y config.ts los importa el middleware (sin condición
  // react-server); las reglas puras de dominio/acceso, fecha y catalogo/banda no tocan datos y
  // `contratos` las comparte con el navegador; pruebas/ y migrar.ts no entran en las apps.
  const OBLIGADOS = [
    "packages/infra/src/postgres",
    "packages/infra/src/http",
    "packages/infra/src/acceso",
    "packages/infra/src/mailgun",
    "packages/dominio/src/auditoria",
  ];
  const EXENTOS = new Set(["packages/infra/src/postgres/migrar.ts"]);

  it.each(OBLIGADOS)("cada módulo de %s importa server-only", (dir) => {
    const modulos = listar(`${RAIZ}${dir}`).filter(
      (f) => f.endsWith(".ts") && !f.endsWith(".test.ts"),
    );
    expect(modulos.length).toBeGreaterThan(0);
    const sin = modulos
      .map((f) => path.relative(RAIZ, f))
      .filter((f) => !EXENTOS.has(f))
      .filter((f) => !readFileSync(`${RAIZ}${f}`, "utf8").includes('import "server-only"'));
    expect(sin).toEqual([]);
  });
});
