// Vista previa fiel (EP-006 · sub-slice 5; HU-129, HU-130; diseño §2): para el mismo perfil
// publicado, la ficha que arma el portal (vistas con `ps_portal`) y la que arma la vista previa del
// panel (perfil leído con `ps_panel`) producen el MISMO HTML con el componente compartido. Además:
// banda y no fecha, ciudad solo si la necesidad es presencial o híbrida, Nivel 0 desde la modalidad
// de prueba sin redactar nada, sin bloques vacíos y sin el cliente si el consentimiento no lo incluye.
import { randomBytes } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { armarFicha, type Necesidad } from "@ps/contratos/ficha";
import type { SesionPortalVerificada } from "@ps/dominio/acceso/sesion";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import type { ClavesAuditoria } from "@ps/infra/postgres/auditoria";
import { fichaDelPortal } from "@ps/infra/postgres/catalogo";
import {
  crearPerfil,
  leerPerfil,
  publicarPerfil,
  registrarConsentimiento,
} from "@ps/infra/postgres/perfiles-panel";
import { FichaPerfil } from "@ps/ui/FichaPerfil";
import { datosFichaDePerfil } from "./panel/src/inventario/ficha";
import { sembrarFicticios } from "./worker/src/sembrar-ficticios";
import { sembrarLexicoFicticio } from "./worker/src/sembrar-lexico";

const claves: ClavesAuditoria = {
  hmac: randomBytes(32).toString("base64"),
  kek: randomBytes(32).toString("base64"),
};
// La proyección exige haber pasado por la guarda; aquí no se lee (el tipo es una marca).
const sesion = { enlaceId: "x", invitadoId: "y" } as unknown as SesionPortalVerificada;
const AHORA = new Date();

const html = (ficha: Parameters<typeof FichaPerfil>[0]["ficha"]) =>
  renderToStaticMarkup(createElement(FichaPerfil, { ficha }));

describe.skipIf(!HAY_BD)("ficha compartida panel/portal (HU-129, HU-130)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let portal: pg.Pool;
  let autor: { usuarioId: string; correo: string };
  let completo: string;
  let minimo: string;

  const id = async (tabla: string, nombre: string) =>
    (await bd.instalacion.query(`SELECT id FROM inventario.${tabla} WHERE nombre = $1`, [nombre]))
      .rows[0].id as string;

  const delPanel = async (codigo: string, necesidad: Necesidad) =>
    armarFicha(datosFichaDePerfil((await leerPerfil(panel, codigo))!), { ahora: AHORA, necesidad });

  beforeAll(async () => {
    bd = await crearBdPrueba();
    panel = bd.como("ps_panel");
    portal = bd.como("ps_portal");
    await sembrarFicticios({ bd: bd.como("ps_panel"), auditoria: claves, appEnv: "ci", registrar: () => {} });
    await sembrarLexicoFicticio({ bd: bd.como("ps_panel"), candidatas: bd.como("ps_worker"), appEnv: "ci", registrar: () => {} });
    const u = await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('karen@trycore.com', $1, 'administrador') RETURNING id`,
      [randomBytes(32)],
    );
    autor = { usuarioId: u.rows[0].id, correo: "karen@trycore.com" };
    const base = {
      nombre: "Lorena",
      primerApellido: "Salcedo",
      rolId: await id("catalogo_roles", "Desarrolladora backend Java"),
      tecnologiaIds: [
        await id("catalogo_tecnologias", "Java"),
        await id("catalogo_tecnologias", "Kafka"),
      ],
      seniorityId: await id("catalogo_seniorities", "Senior"),
      aniosExperiencia: 8,
      ciudadId: await id("catalogo_ciudades", "Medellín"),
      modalidadTrabajoId: await id("catalogo_modalidades", "hibrido"),
      disponibilidad: { opcion: "dos_semanas" as const },
      modalidadPruebaId: await id(
        "catalogo_modalidades_prueba",
        "Prueba práctica revisada por un arquitecto",
      ),
      experiencias: [
        {
          cargo: "Backend senior",
          cliente: "Bancolombia",
          desde: 2021,
          hasta: 2026,
          descripcion: "Pagos inmediatos y conciliación en línea.",
        },
        {
          cargo: "Desarrolladora Java",
          cliente: "Sura",
          desde: 2018,
          hasta: 2021,
          descripcion: "Servicios de cotización.",
        },
      ],
    };
    const c = await crearPerfil(panel, claves, autor, {
      ...base,
      sectorIds: [await id("catalogo_sectores", "Banca"), await id("catalogo_sectores", "Seguros")],
      resumen: "Construye servicios de pagos con alta disponibilidad.",
      selloPersonal: ["Rigurosidad", "Autodidactismo", "Cautela"],
      formacion: "Ingeniería de Sistemas",
      idiomas: ["Inglés B2"],
      aporte: "Quiere liderar un equipo pequeño.",
    });
    // Consentimiento parcial: la trayectoria sí, los clientes no (HU-127).
    const cc = await registrarConsentimiento(panel, claves, autor, c.codigo, {
      nombreApellido: true,
      trayectoria: true,
      clientes: false,
    });
    await publicarPerfil(panel, claves, autor, cc.codigo, cc.version);
    completo = c.codigo;
    const m = await crearPerfil(panel, claves, autor, base);
    const mc = await registrarConsentimiento(panel, claves, autor, m.codigo, {
      nombreApellido: true,
      trayectoria: true,
      clientes: true,
    });
    await publicarPerfil(panel, claves, autor, mc.codigo, mc.version);
    minimo = m.codigo;
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("HU-129 · el HTML de la vista previa es el del portal para el mismo perfil, en cada necesidad", async () => {
    for (const necesidad of ["remota", "hibrida", "presencial"] as const) {
      for (const codigo of [completo, minimo]) {
        const delPortal = await fichaDelPortal(portal, sesion, codigo, { necesidad, ahora: AHORA });
        expect(delPortal).not.toBeNull();
        expect(html(await delPanel(codigo, necesidad))).toBe(html(delPortal!));
      }
    }
  });

  it("HU-129 · banda de arranque, no fecha; país siempre y ciudad solo si es presencial o híbrida", async () => {
    const remota = html(
      (await fichaDelPortal(portal, sesion, completo, { necesidad: "remota", ahora: AHORA }))!,
    );
    const hibrida = html(
      (await fichaDelPortal(portal, sesion, completo, { necesidad: "hibrida", ahora: AHORA }))!,
    );
    expect(remota).toContain("En 2 semanas");
    expect(remota).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(remota).toContain("Colombia");
    expect(remota).not.toContain("Medellín");
    expect(hibrida).toContain("Híbrido · Colombia · Medellín");
  });

  it("HU-130 · Nivel 0 con el enunciado de la modalidad de prueba, sin que nadie redacte nada", async () => {
    const f = (await fichaDelPortal(portal, sesion, minimo, { ahora: AHORA }))!;
    expect(f.validacion).toEqual({
      nivel: 0,
      enunciado:
        "Resolvió un ejercicio de código real y un arquitecto de Trycore revisó su diseño y sus pruebas.",
    });
    expect(html(f)).toContain(f.validacion.enunciado);
  });

  it("HU-129/HU-130 · los bloques opcionales sin datos no existen: ni título ni hueco", async () => {
    const m = html((await fichaDelPortal(portal, sesion, minimo, { ahora: AHORA }))!);
    for (const titulo of ["Sello Personal", "Formación", "Idiomas", "Sectores", "fp-resumen"])
      expect(m).not.toContain(titulo);
    expect(m).not.toMatch(/<dd>\s*<\/dd>/);
    const c = html((await fichaDelPortal(portal, sesion, completo, { ahora: AHORA }))!);
    for (const texto of [
      "Sello Personal",
      "Formación",
      "Idiomas",
      "Sectores",
      "Construye servicios",
    ])
      expect(c).toContain(texto);
  });

  it("el consentimiento parcial despersonaliza la trayectoria; la motivación (B.4, D20) nunca viaja", async () => {
    const c = html((await fichaDelPortal(portal, sesion, completo, { ahora: AHORA }))!);
    expect(c).not.toContain("Bancolombia");
    expect(c).not.toContain("Quiere liderar");
    const m = html((await fichaDelPortal(portal, sesion, minimo, { ahora: AHORA }))!);
    expect(m).toContain("Bancolombia · 2021–2026");
  });

  it("un perfil no publicado no tiene ficha en el portal", async () => {
    const b = await crearPerfil(panel, claves, autor, { nombre: "Ana" });
    expect(await fichaDelPortal(portal, sesion, b.codigo)).toBeNull();
  });
});
