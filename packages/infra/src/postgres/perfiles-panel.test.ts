// ServicioPerfiles contra PostgreSQL real con `ps_panel` (EP-006 · sub-slice 2; HU-125, HU-127):
// crear siempre en borrador con valores del catálogo, guardar con la versión abierta, auditoría por
// campo con el titular del perfil, consentimiento nominal con autor y revocación que despublica en la
// misma transacción. El portal se comprueba leyendo con `ps_portal`.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import { verificarCadena, type ClavesAuditoria } from "./auditoria";
import {
  crearPerfil,
  guardarPerfil,
  leerPerfil,
  listarInventario,
  opcionesEditor,
  registrarConsentimiento,
  revocarConsentimiento,
} from "./perfiles-panel";
import { RechazoInventario } from "./unidad-inventario";
import { sembrarFicticios } from "../../../../apps/worker/src/sembrar-ficticios";
import { sembrarLexicoFicticio } from "../../../../apps/worker/src/sembrar-lexico";

const claves: ClavesAuditoria = {
  hmac: randomBytes(32).toString("base64"),
  kek: randomBytes(32).toString("base64"),
};

const rechazo = async (p: Promise<unknown>) => {
  try {
    await p;
  } catch (e) {
    if (e instanceof RechazoInventario) return e.motivo;
    throw e;
  }
  return "sin_rechazo";
};

describe.skipIf(!HAY_BD)("ServicioPerfiles (HU-125, HU-127)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let portal: pg.Pool;
  let autor: { usuarioId: string; correo: string };
  const ids = {} as Record<
    | "rol" | "java" | "kafka" | "banca" | "senior" | "medellin" | "hibrido" | "prueba" | "rolQa" | "creado" | "conConsentimiento",
    string
  >;

  const id = async (tabla: string, nombre: string) =>
    (await bd.instalacion.query(`SELECT id FROM inventario.${tabla} WHERE nombre = $1`, [nombre]))
      .rows[0].id as string;

  const completo = () => ({
    nombre: "Lorena",
    primerApellido: "Salcedo",
    rolId: ids.rol,
    tecnologiaIds: [ids.java, ids.kafka],
    sectorId: ids.banca,
    seniorityId: ids.senior,
    aniosExperiencia: 8,
    ciudadId: ids.medellin,
    modalidadTrabajoId: ids.hibrido,
    disponibilidad: { opcion: "ahora" as const },
    modalidadPruebaId: ids.prueba,
    capacidad: "Ingeniera Backend Senior",
    anclaje: "8 años en core bancario",
    selloPersonal: ["Rigurosidad", "Autodidactismo", "Cautela"],
    experiencias: [
      {
        cargo: "Backend senior",
        cliente: "Bancolombia",
        desde: 2021,
        hasta: 2026,
        descripcion: "Pagos inmediatos con Java y Kafka para 4 millones de transacciones diarias.",
      },
    ],
  });

  beforeAll(async () => {
    bd = await crearBdPrueba();
    panel = bd.como("ps_panel");
    portal = bd.como("ps_portal");
    const worker = bd.como("ps_worker");
    await sembrarFicticios({ bd: worker, auditoria: claves, appEnv: "ci", registrar: () => {} });
    await sembrarLexicoFicticio({ bd: worker, appEnv: "ci", registrar: () => {} });
    const u = await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('karen@trycore.com', $1, 'administrador') RETURNING id`,
      [randomBytes(32)],
    );
    autor = { usuarioId: u.rows[0].id, correo: "karen@trycore.com" };
    ids.rol = await id("catalogo_roles", "Desarrolladora backend Java");
    ids.java = await id("catalogo_tecnologias", "Java");
    ids.kafka = await id("catalogo_tecnologias", "Kafka");
    ids.banca = await id("catalogo_sectores", "Banca");
    ids.senior = await id("catalogo_seniorities", "Senior");
    ids.medellin = await id("catalogo_ciudades", "Medellín");
    ids.hibrido = await id("catalogo_modalidades", "hibrido");
    ids.prueba = await id(
      "catalogo_modalidades_prueba",
      "Prueba práctica revisada por un arquitecto",
    );
    ids.rolQa = await id("catalogo_roles", "Analista QA automatización");
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  describe("HU-125 · crear en borrador desde el catálogo", () => {
    it("guardado con sus atributos queda en borrador, con valores del catálogo y fuera del portal", async () => {
      const p = await crearPerfil(panel, claves, autor, completo());
      expect(p.estado).toBe("borrador");
      expect(p.codigo).toMatch(/^PS-\d{4}$/);
      expect(p.rol?.nombre).toBe("Desarrolladora backend Java");
      expect(p.familia?.nombre).toBe("Desarrollo");
      expect(p.tecnologias.map((t) => t.nombre)).toEqual(["Java", "Kafka"]);
      expect(p.sector?.nombre).toBe("Banca");
      expect(p.evaluacion.faltanDatos).toEqual([]);
      // Solo le falta el consentimiento (acto aparte, HU-127).
      expect(p.evaluacion.condiciones.filter((c) => !c.cumple).map((c) => c.clave)).toEqual([
        "consentimiento",
      ]);
      const enPortal = await portal.query(
        `SELECT 1 FROM operacion.catalogo_publicable WHERE codigo = $1`,
        [p.codigo],
      );
      expect(enPortal.rowCount).toBe(0);
      ids.creado = p.codigo;
    });

    it("no acepta texto libre: un id que no es un valor activo del catálogo se rechaza sin escribir", async () => {
      const antes = await bd.instalacion.query(
        `SELECT count(*)::int AS n FROM inventario.perfiles`,
      );
      expect(await rechazo(crearPerfil(panel, claves, autor, { rolId: randomUuid() }))).toBe(
        "valor_no_disponible",
      );
      await bd.instalacion.query(
        `UPDATE inventario.catalogo_tecnologias SET activo = false WHERE nombre = 'Kotlin'`,
      );
      expect(
        await rechazo(
          crearPerfil(panel, claves, autor, {
            tecnologiaIds: [await id("catalogo_tecnologias", "Kotlin")],
          }),
        ),
      ).toBe("valor_no_disponible");
      const despues = await bd.instalacion.query(
        `SELECT count(*)::int AS n FROM inventario.perfiles`,
      );
      expect(despues.rows[0].n).toBe(antes.rows[0].n);
    });

    it("con obligatorios sin llenar se guarda igual como borrador y dice qué falta", async () => {
      const p = await crearPerfil(panel, claves, autor, { nombre: "Mateo" });
      expect(p.estado).toBe("borrador");
      expect(p.evaluacion.publicable).toBe(false);
      expect(p.evaluacion.faltanDatos.map((f) => f.campo)).toEqual([
        "primer_apellido",
        "rol",
        "tecnologias",
        "sector",
        "seniority",
        "anios_experiencia",
        "ciudad",
        "modalidad_trabajo",
        "disponibilidad",
        "trayectoria",
      ]);
    });

    it("el selector de rol trae las modalidades de su familia para advertir al elegirlo", async () => {
      const f = await bd.instalacion.query(
        `INSERT INTO inventario.catalogo_familias (nombre) VALUES ('Infraestructura legada') RETURNING id`,
      );
      await bd.instalacion.query(
        `INSERT INTO inventario.catalogo_roles (nombre, familia_id) VALUES ('Especialista en mainframe', $1)`,
        [f.rows[0].id],
      );
      const o = await opcionesEditor(panel);
      expect(o.roles.find((r) => r.nombre === "Especialista en mainframe")).toMatchObject({
        familia: "Infraestructura legada",
        modalidades: 0,
      });
      expect(o.roles.find((r) => r.nombre === "Desarrolladora backend Java")?.modalidades).toBe(1);
      expect(o.familias.find((x) => x.nombre === "Infraestructura legada")?.modalidades).toBe(0);
    });

    it("la modalidad de prueba debe ser de la familia del rol (D10)", async () => {
      expect(
        await rechazo(
          crearPerfil(panel, claves, autor, { rolId: ids.rolQa, modalidadPruebaId: ids.prueba }),
        ),
      ).toBe("modalidad_de_otra_familia");
    });

    it("una experiencia que nombra al cliente en el texto se rechaza (el parcial no la ocultaría)", async () => {
      expect(
        await rechazo(
          crearPerfil(panel, claves, autor, {
            experiencias: [
              { cargo: "QA", cliente: "Sura", descripcion: "Automatización para Sura en pólizas" },
            ],
          }),
        ),
      ).toBe("cliente_en_texto");
    });

    it("dos altas a la vez reciben códigos distintos", async () => {
      const [a, b] = await Promise.all([
        crearPerfil(panel, claves, autor, { nombre: "Uno" }),
        crearPerfil(panel, claves, autor, { nombre: "Dos" }),
      ]);
      expect(a.codigo).not.toBe(b.codigo);
    });

    it("cada alta y cada guardado dejan una fila por campo con su autor y la cadena íntegra", async () => {
      const p = (await leerPerfil(panel, ids.creado!))!;
      const r = await bd.instalacion.query(
        `SELECT campo, actor, titular, origen FROM auditoria.auditoria WHERE entidad_id = $1 ORDER BY seq`,
        [p.id],
      );
      expect(r.rows.map((f) => f.campo)).toEqual(
        expect.arrayContaining([
          "nombre",
          "rol",
          "tecnologias",
          "modalidad_prueba",
          "experiencias",
          "estado",
        ]),
      );
      for (const f of r.rows) {
        expect(f.actor).toBe("karen@trycore.com");
        expect(f.titular).toBe(p.codigo);
        expect(f.origen).toBe("panel");
      }
      expect((await verificarCadena(bd.instalacion, claves.hmac)).ok).toBe(true);
    });
  });

  describe("guardar con la versión abierta", () => {
    it("guarda los cambios y quita lo que ya no está, sin borrar experiencias (quedan no vigentes)", async () => {
      const p = (await leerPerfil(panel, ids.creado!))!;
      const g = await guardarPerfil(panel, claves, autor, p.codigo, p.version, {
        tecnologiaIds: [ids.kafka],
        experiencias: [],
      });
      expect(g.tecnologias.map((t) => t.nombre)).toEqual(["Kafka"]);
      expect(g.experiencias).toEqual([]);
      expect(g.evaluacion.faltanDatos.map((f) => f.campo)).toEqual(["trayectoria"]);
      const r = await bd.instalacion.query(
        `SELECT vigente FROM inventario.perfil_experiencias WHERE perfil_id = $1`,
        [p.id],
      );
      expect(r.rows).toEqual([{ vigente: false }]);
    });

    it("409 si el perfil cambió desde que se abrió", async () => {
      const p = (await leerPerfil(panel, ids.creado!))!;
      expect(
        await rechazo(
          guardarPerfil(panel, claves, autor, p.codigo, p.version - 1, { nombre: "X" }),
        ),
      ).toBe("version_distinta");
    });

    it("cambiar a un rol de otra familia suelta la modalidad de prueba", async () => {
      const p = (await leerPerfil(panel, ids.creado!))!;
      const g = await guardarPerfil(panel, claves, autor, p.codigo, p.version, {
        rolId: ids.rolQa,
      });
      expect(g.familia?.nombre).toBe("Calidad");
      expect(g.modalidadPrueba).toBeNull();
      expect(g.evaluacion.condiciones.find((c) => c.clave === "modalidad_prueba")?.detalle).toBe(
        "sin_elegir",
      );
    });

    it("un publicado no se edita por esta vía (HU-126, dos pasos)", async () => {
      const p = (await leerPerfil(panel, "PS-0142"))!;
      expect(
        await rechazo(guardarPerfil(panel, claves, autor, p.codigo, p.version, { nombre: "Y" })),
      ).toBe("editar_publicado");
    });
  });

  describe("HU-127 · consentimiento nominal", () => {
    it("registrar el nominal habilita publicar y deja quién y cuándo", async () => {
      const nuevo = await crearPerfil(panel, claves, autor, completo());
      const p = await registrarConsentimiento(panel, claves, autor, nuevo.codigo, {
        nombreApellido: true,
        trayectoria: true,
        clientes: true,
      });
      expect(p.consentimiento).toMatchObject({
        vigente: true,
        nominal: true,
        incluyeClientes: true,
        registradoPor: "karen@trycore.com",
      });
      expect(p.evaluacion.publicable).toBe(true);
      ids.conConsentimiento = nuevo.codigo;
    });

    it("el consentimiento de la publicación anonimizada se rechaza y nada se escribe", async () => {
      const nuevo = await crearPerfil(panel, claves, autor, completo());
      expect(
        await rechazo(
          registrarConsentimiento(panel, claves, autor, nuevo.codigo, {
            nombreApellido: false,
            trayectoria: true,
            clientes: false,
          }),
        ),
      ).toBe("no_nominal");
      expect((await leerPerfil(panel, nuevo.codigo))!.consentimiento).toBeNull();
    });

    it("revocar un publicado lo saca de publicado en la misma operación y el enlace lo explica", async () => {
      const antes = await bd.instalacion.query(
        `SELECT estado FROM operacion.estado_seleccion_perfil WHERE codigo = 'PS-0142'`,
      );
      expect(antes.rows[0].estado).toBe("disponible");
      const p = await revocarConsentimiento(panel, claves, autor, "PS-0142");
      expect(p.estado).toBe("borrador");
      expect(p.consentimiento).toMatchObject({ vigente: false, revocadoPor: "karen@trycore.com" });
      const enPortal = await portal.query(
        `SELECT 1 FROM operacion.catalogo_publicable WHERE codigo = 'PS-0142'`,
      );
      expect(enPortal.rowCount).toBe(0);
      // RF-19.2: el enlace curado no lo omite: lo muestra como no disponible.
      const sel = await portal.query(
        `SELECT estado FROM operacion.estado_seleccion_perfil WHERE codigo = 'PS-0142'`,
      );
      expect(sel.rows[0].estado).toBe("no_publicado");
      const aud = await bd.instalacion.query(
        `SELECT campo, origen FROM auditoria.auditoria WHERE entidad_id = $1 AND origen = 'revocacion' ORDER BY seq`,
        [p.id],
      );
      expect(aud.rows.map((f) => f.campo)).toEqual(["consentimiento", "estado"]);
    });

    it("el parcial deja publicar con la experiencia despersonalizada: el cliente no llega al portal", async () => {
      const p = await registrarConsentimiento(panel, claves, autor, ids.conConsentimiento!, {
        nombreApellido: true,
        trayectoria: true,
        clientes: false,
      });
      expect(p.evaluacion.publicable).toBe(true);
      expect(p.consentimiento?.incluyeClientes).toBe(false);
      // Publicar es de HU-128 (sub-slice 5): aquí se fija el estado como lo hará esa guarda.
      await bd.instalacion.query(
        `UPDATE inventario.perfiles SET estado = 'publicado' WHERE codigo = $1`,
        [p.codigo],
      );
      const r = await portal.query(
        `SELECT cargo, cliente, descripcion FROM operacion.experiencias_publicables WHERE codigo = $1`,
        [p.codigo],
      );
      expect(r.rows).toEqual([
        {
          cargo: "Backend senior",
          cliente: null,
          descripcion:
            "Pagos inmediatos con Java y Kafka para 4 millones de transacciones diarias.",
        },
      ]);
    });

    it("revocar sin consentimiento vigente se rechaza", async () => {
      expect(await rechazo(revocarConsentimiento(panel, claves, autor, "PS-0142"))).toBe(
        "sin_consentimiento",
      );
    });
  });

  it("el listado base trae todos los estados (las pestañas filtran) con lo que les falta", async () => {
    const filas = await listarInventario(panel);
    const codigos = filas.map((f) => f.codigo);
    expect(codigos).toContain(ids.creado);
    expect(filas.find((f) => f.codigo === "PS-0099")?.estado).toBe("archivado");
    const mateo = filas.find((f) => f.nombre === "Mateo")!;
    expect(mateo.estado).toBe("borrador");
    expect(mateo.faltan).toBeGreaterThan(0);
  });
});

function randomUuid(): string {
  return "00000000-0000-4000-8000-000000000000";
}
