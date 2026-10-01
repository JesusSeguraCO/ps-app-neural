// HU-144 (la selección con su razón; un perfil cambió; un buscador rastrea el portal) y HU-090 (veo mi
// cuenta y mi proyecto) contra el servidor standalone del portal, con `ps_portal` por PgBouncer y los
// perfiles ficticios de la tarea 3.2 (publicados, pausado, colocado, borrador y archivado).
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { fechaCivil } from "@ps/dominio/fecha/colombia";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { PERFILES_FICTICIOS, sembrarFicticios } from "./worker/src/sembrar-ficticios";

const perfil = (codigo: string) => PERFILES_FICTICIOS.find((p) => p.codigo === codigo)!;
const nombre = (codigo: string) => `${perfil(codigo).nombre} ${perfil(codigo).primerApellido}`;
const escapar = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

describe.skipIf(!HAY_BD || !hayBuild("portal"))("aterrizaje curado (HU-144, HU-090)", () => {
  let bd: BdPrueba;
  let srv: ServidorPrueba;

  async function sesionEn(opciones: {
    codigos: string[];
    proyecto?: string | null;
  }): Promise<string> {
    const e = await bd.instalacion.query(
      `INSERT INTO identidad.enlaces (cuenta_ref, cuenta_nombre, proyecto, razon, codigos_perfil, vigente_desde, vigente_hasta, generado_por)
       VALUES (NULL, 'Bancolombia', $1, 'Personas que ya conectaron sistemas de pagos en banca.', $2,
               '2026-09-22T15:00:00Z', now() + interval '25 days', gen_random_uuid())
       RETURNING id`,
      [
        opciones.proyecto === undefined ? "Modernización de pagos" : opciones.proyecto,
        opciones.codigos,
      ],
    );
    const i = await bd.instalacion.query(
      `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, 'lider@bancolombia.com.co', $2) RETURNING id`,
      [e.rows[0].id, randomBytes(32)],
    );
    const id = randomBytes(32).toString("base64url");
    await bd.instalacion.query(
      `INSERT INTO identidad.sesiones_portal (id_hash, enlace_id, invitado_id, expira) VALUES ($1, $2, $3, now() + interval '20 days')`,
      [createHash("sha256").update(id).digest(), e.rows[0].id, i.rows[0].id],
    );
    return `__Host-ps=${id}`;
  }

  const pagina = async (cookie: string) => {
    const r = await srv.pedir("/", { headers: { cookie } });
    expect(r.status).toBe(200);
    return r.text();
  };

  beforeAll(async () => {
    bd = await crearBdPrueba();
    const panelEnv = entornoDev("panel");
    await sembrarFicticios({
      bd: bd.como("ps_worker"),
      auditoria: { hmac: panelEnv.AUDIT_HMAC_KEY!, kek: panelEnv.AUDIT_KEK! },
      appEnv: "ci",
      registrar: () => {},
    });
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

  it("HU-144 happy path + HU-090: cuenta y proyecto, la razón, los perfiles del enlace en su orden y la opción de ampliar", async () => {
    const codigos = ["PS-0187", "PS-0142", "PS-0223"];
    const html = await pagina(await sesionEn({ codigos }));
    expect(html).toContain("Bancolombia · Modernización de pagos");
    expect(html).toContain("Personas que ya conectaron sistemas de pagos en banca.");
    expect(html).toContain("Tres perfiles para Modernización de pagos");
    const posiciones = codigos.map((c) => html.indexOf(escapar(nombre(c))));
    expect(posiciones.every((p) => p > 0)).toBe(true);
    expect([...posiciones].sort((a, b) => a - b)).toEqual(posiciones);
    expect(html).toMatch(/href="\/banco"[^>]*>Ampliar la búsqueda al banco</);
    // Ningún rol ni criterio deducido aplicado: solo los tres del enlace, sin filtros activos.
    for (const otro of PERFILES_FICTICIOS.filter(
      (p) => p.estado === "publicado" && !codigos.includes(p.codigo),
    ))
      expect(html, otro.codigo).not.toContain(otro.codigo);
    expect(html).not.toMatch(/aria-pressed="true"|filtro activo|Filtrado por/i);
    expect(html).not.toContain("cambiaron desde");
  });

  it("HU-144 edge: un perfil colocado y otros que cambiaron quedan en su lugar con su estado real; ninguna posición vacía", async () => {
    // PS-0151 pausado, PS-0137 colocado (publicado con colocación vigente), PS-0099 archivado, PS-0160
    // borrador.
    const codigos = ["PS-0142", "PS-0151", "PS-0137", "PS-0187", "PS-0099", "PS-0160"];
    const html = await pagina(await sesionEn({ codigos }));
    const tarjetas = html.split('<article class="pp-perfil').slice(1);
    expect(tarjetas).toHaveLength(6);
    expect(tarjetas.map((t) => t.match(/PS-\d{4}/)?.[0])).toEqual(codigos);
    expect(tarjetas[0]).toContain(escapar(nombre("PS-0142")));
    expect(tarjetas[1]).toContain("Pausado");
    expect(tarjetas[1]).toContain(escapar(nombre("PS-0151")));
    expect(tarjetas[2]).toContain("Colocado en otro proyecto");
    const libera = (
      await bd.instalacion.query(
        `SELECT c.liberacion::text AS f FROM inventario.colocaciones c
           JOIN inventario.perfiles p ON p.id = c.perfil_id WHERE p.codigo = 'PS-0137' AND c.vigente`,
      )
    ).rows[0].f as string;
    expect(tarjetas[2]).toContain(`Se libera el ${fechaCivil(libera)}`);
    expect(tarjetas[4]).toContain("Archivado");
    expect(tarjetas[4]).not.toContain(escapar(perfil("PS-0099").nombre));
    expect(tarjetas[5]).toContain("No publicado");
    expect(tarjetas[5]).not.toContain(escapar(perfil("PS-0160").nombre));
    expect(html).toContain("Cuatro perfiles cambiaron desde el 22 sep.");
  });

  it("ningún perfil sigue publicado → la lista completa con su estado y la invitación a explorar el banco", async () => {
    const html = await pagina(await sesionEn({ codigos: ["PS-0151", "PS-0137"] }));
    expect(html.split('<article class="pp-perfil').length - 1).toBe(2);
    expect(html).toContain("Ninguno de los dos sigue publicado");
    expect(html).toMatch(
      /href="\/banco\?contexto=seleccion"[^>]*>Explorar el banco con este contexto/,
    );
  });

  it("enlace sin contexto de proyecto: saluda con la cuenta, sin proyecto inventado", async () => {
    const html = await pagina(await sesionEn({ codigos: ["PS-0142"], proyecto: null }));
    expect(html).toContain("Un perfil escogido para Bancolombia");
    expect(html).not.toContain("Modernización");
  });

  it("la selección nunca expone ciudad ni fecha de disponibilidad (contrato del catálogo)", async () => {
    const html = await pagina(await sesionEn({ codigos: ["PS-0142", "PS-0151"] }));
    expect(html).not.toContain(perfil("PS-0142").ciudad);
    expect(html).not.toContain(perfil("PS-0151").ciudad);
    expect(html).not.toMatch(/disponibilidad_fecha|\d{4}-\d{2}-\d{2}/);
  });

  describe("HU-144 edge: un buscador rastrea el portal", () => {
    it.each(["/e", "/acceso", "/", "/acceso?motivo=enlace_revocado", "/cualquier-cosa"])(
      "%s → noindex, nofollow en cabecera y página, sin nombres de profesionales",
      async (ruta) => {
        const r = await srv.pedir(ruta);
        expect(r.headers.get("x-robots-tag")).toBe("noindex, nofollow");
        const cuerpo = await r.text();
        if (r.status === 200)
          expect(cuerpo).toMatch(/<meta name="robots" content="noindex, nofollow"/);
        for (const p of PERFILES_FICTICIOS)
          expect(cuerpo, p.codigo).not.toContain(escapar(p.primerApellido));
      },
    );
    it("robots.txt excluye todas las direcciones del portal", async () => {
      const r = await srv.pedir("/robots.txt");
      expect(r.status).toBe(200);
      expect(r.headers.get("content-type")).toMatch(/^text\/plain/);
      const t = await r.text();
      expect(t).toMatch(/User-Agent: \*/i);
      expect(t).toMatch(/^Disallow: \/$/m);
      expect(t).not.toMatch(/^Allow:/im);
    });
  });
});
