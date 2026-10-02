// Recorrido integrado de EP-006 (tarea 11.1) contra los servidores standalone reales del panel (`ps_panel`) y
// del portal (`ps_portal`), con la cola real procesada por el despacho del worker (`ps_worker`) y el doble
// declarado de Mailgun: catálogo → perfil → consentimiento → evidencia (reporte de validación) → publicar →
// el cliente entra con su código y lo ve → importar y revertir → disponibilidad y vigencia → colocado →
// observador (consulta, rechazo y aviso) → auditoría del perfil con cada paso y su autor, y la cadena íntegra.
// Gemini no interviene en este recorrido (solo propone léxico) y Spaces quedó fuera de la versión (D29).
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DobleCorreo } from "@ps/infra/mailgun/index";
import { verificarCadena } from "@ps/infra/postgres/auditoria";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { vuelta, type ContextoDespacho } from "./worker/src/despacho";
import { sembrarFicticios } from "./worker/src/sembrar-ficticios";

const TALENTO = "people.service@trycore.com";
const INVITADA = "ana.restrepo@bancolombia.com.co";
const plano = (html: string) =>
  html
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
const hoyBogota = () => new Date(Date.now() - 5 * 3_600_000).toISOString().slice(0, 10);
const enDias = (n: number) =>
  new Date(Date.now() - 5 * 3_600_000 + n * 86_400_000).toISOString().slice(0, 10);

describe.skipIf(!HAY_BD || !hayBuild("panel") || !hayBuild("portal"))(
  "Recorrido integrado de EP-006 (11.1)",
  () => {
    let bd: BdPrueba;
    let panel: ServidorPrueba;
    let portal: ServidorPrueba;
    let ctx: ContextoDespacho;
    let correo: DobleCorreo;
    let admin: string;
    let observadora: string;
    let codigo: string;
    let version: number;
    let token: string;
    let cookieCliente: string;
    let loteId: string;
    const csrf = randomBytes(16).toString("hex");
    const panelEnv = entornoDev("panel");
    const portalEnv = entornoDev("portal");
    const workerEnv = entornoDev("worker");
    let ip = 0;

    async function sesionPanel(c: string, rol: "administrador" | "observador") {
      const u = await bd.instalacion.query(
        `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ($1, $2, $3) RETURNING id`,
        [c, randomBytes(32), rol],
      );
      const s = randomBytes(32).toString("base64url");
      await bd.instalacion.query(
        `INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, expira, rol_al_abrir)
         VALUES ($1, $2, now() + interval '12 hours', $3)`,
        [createHash("sha256").update(s).digest(), u.rows[0].id, rol],
      );
      return `__Host-pp=${s}`;
    }
    const pedir = (
      srv: ServidorPrueba,
      metodo: string,
      ruta: string,
      cuerpo: unknown,
      cookie = "",
      extra: Record<string, string> = {},
    ) =>
      srv.pedir(ruta, {
        method: metodo,
        body: JSON.stringify(cuerpo),
        headers: {
          "content-type": "application/json",
          origin: srv.url,
          "x-ps-csrf": csrf,
          "do-connecting-ip": `10.9.0.${++ip % 250}`,
          cookie: [`__Host-csrf=${csrf}`, cookie].filter(Boolean).join("; "),
          ...extra,
        },
      });
    const enPanel = (ruta: string, cuerpo: unknown, cookie = admin, extra = {}) =>
      pedir(panel, "POST", ruta, cuerpo, cookie, extra);
    const pagina = async (srv: ServidorPrueba, ruta: string, cookie: string) =>
      plano(await (await srv.pedir(ruta, { headers: { cookie } })).text());
    const idDe = async (tabla: string, nombre: string) =>
      (await bd.instalacion.query(`SELECT id FROM inventario.${tabla} WHERE nombre = $1`, [nombre]))
        .rows[0]?.id as string;
    const leerPerfil = async () =>
      (
        await (
          await panel.pedir(`/api/v1/perfiles/${codigo}`, { headers: { cookie: admin } })
        ).json()
      ).perfil as { version: number; estado: string; aniosExperiencia: number | null };

    beforeAll(async () => {
      bd = await crearBdPrueba();
      const auditoria = { hmac: panelEnv.AUDIT_HMAC_KEY!, kek: panelEnv.AUDIT_KEK! };
      await sembrarFicticios({
        bd: bd.como("ps_worker"),
        auditoria,
        appEnv: "ci",
        registrar: () => {},
      });
      admin = await sesionPanel("karen.rodriguez@trycore.com", "administrador");
      observadora = await sesionPanel("mariana.velez@trycore.com", "observador");
      panel = await arrancarServidor("panel", {
        ...panelEnv,
        APP_ENV: "ci",
        DATABASE_URL: bd.urlDe("ps_panel"),
      });
      portal = await arrancarServidor("portal", {
        ...portalEnv,
        APP_ENV: "ci",
        DATABASE_URL: bd.urlDe("ps_portal"),
      });
      correo = new DobleCorreo();
      ctx = {
        bd: bd.como("ps_worker"),
        correo,
        peppers: { cliente: workerEnv.OTP_PEPPER_CLIENTE!, panel: workerEnv.OTP_PEPPER_PANEL! },
        reclamo: `recorrido-${randomBytes(3).toString("hex")}`,
        registrar: () => {},
        renovacion: {
          portalOrigen: portal.url,
          correoTalentoHumano: TALENTO,
          auditoria: { hmac: workerEnv.AUDIT_HMAC_KEY!, kek: workerEnv.AUDIT_KEK! },
        },
        importacion: { auditoria: { hmac: workerEnv.AUDIT_HMAC_KEY!, kek: workerEnv.AUDIT_KEK! } },
      };
    }, 180_000);

    afterAll(async () => {
      await panel?.cerrar();
      await portal?.cerrar();
      await bd?.cerrar();
    });

    it("1 · catálogo: la administradora crea una tecnología nueva", async () => {
      const r = await enPanel("/api/v1/catalogos/tecnologia", {
        nombre: "Elixir",
        grupo: "Lenguaje",
      });
      expect(r.status).toBe(201);
      expect(await idDe("catalogo_tecnologias", "Elixir")).toBeTruthy();
    });

    it("2 · perfil: nace en borrador con los valores del catálogo, incluida la tecnología nueva", async () => {
      const r = await enPanel("/api/v1/perfiles", {
        nombre: "Lorena",
        primerApellido: "Salcedo",
        rolId: await idDe("catalogo_roles", "Desarrolladora backend Java"),
        tecnologiaIds: [
          await idDe("catalogo_tecnologias", "Elixir"),
          await idDe("catalogo_tecnologias", "Kafka"),
        ],
        seniorityId: await idDe("catalogo_seniorities", "Senior"),
        aniosExperiencia: 8,
        ciudadId: await idDe("catalogo_ciudades", "Medellín"),
        modalidadTrabajoId: await idDe("catalogo_modalidades", "hibrido"),
        disponibilidad: { opcion: "ahora" },
        modalidadPruebaId: await idDe(
          "catalogo_modalidades_prueba",
          "Prueba práctica revisada por un arquitecto",
        ),
        experiencias: [{ cargo: "Backend senior", desde: 2021, descripcion: "Pagos inmediatos." }],
      });
      expect(r.status).toBe(201);
      const p = (await r.json()).perfil as { codigo: string; estado: string; version: number };
      expect(p.estado).toBe("borrador");
      codigo = p.codigo;
    });

    it("3 · consentimiento: nominal, con clientes nombrados", async () => {
      const r = await enPanel(`/api/v1/perfiles/${codigo}/consentimiento`, {
        nombreApellido: true,
        trayectoria: true,
        clientes: true,
      });
      expect(r.status).toBe(201);
    });

    it("4 · evidencia: el reporte de validación sale de la modalidad y se confirma con la revisión", async () => {
      const b = (await (await enPanel(`/api/v1/perfiles/${codigo}/validacion`, {})).json())
        .borrador;
      const r = await enPanel(`/api/v1/perfiles/${codigo}/validacion/confirmar`, {
        id: b.id,
        enunciadoReto: b.enunciadoReto,
        entregables: b.entregables,
        criterios: b.criterios,
        evaluador: "Célula de arquitectura de Trycore",
        fecha: hoyBogota(),
        resultado: "Aprobada, nivel senior",
        revisado: true,
      });
      expect(r.status).toBe(200);
    });

    it("5 · publicar con la versión abierta", async () => {
      version = (await leerPerfil()).version;
      const r = await enPanel(`/api/v1/perfiles/${codigo}/publicar`, {}, admin, {
        "if-match": `"${version}"`,
      });
      expect(r.status).toBe(200);
      expect((await leerPerfil()).estado).toBe("publicado");
    });

    it("6 · el cliente entra con su código (cola real y doble de Mailgun) y ve el perfil con su validación", async () => {
      const e = await enPanel("/api/v1/enlaces", {
        cuenta: "Bancolombia",
        proyecto: "Modernización de pagos",
        razon: "Perfil backend senior para el equipo de pagos.",
        codigos: [codigo],
        invitados: [INVITADA],
      });
      expect(e.status).toBe(201);
      token = ((await e.json()).enlace.url as string).split("#t=")[1]!;
      // Con el worker vivo (su vuelta deja el latido), el código lo envía la cola, no el portal.
      await vuelta(ctx);
      expect((await pedir(portal, "POST", "/api/v1/acceso/enlace", { token })).status).toBe(200);
      expect(
        (await pedir(portal, "POST", "/api/v1/acceso/codigo", { token, correo: INVITADA })).status,
      ).toBe(202);
      await vuelta(ctx);
      const m = correo.enviados.filter((x) => x.para === INVITADA).at(-1)!;
      const cod = m.texto.match(/(\d{3}) ?(\d{3})/)!;
      const v = await pedir(portal, "POST", "/api/v1/acceso/verificar", {
        token,
        correo: INVITADA,
        codigo: `${cod[1]}${cod[2]}`,
      });
      expect(v.status).toBe(204);
      cookieCliente = v.headers.get("set-cookie")!.split(";")[0]!;
      const t = await pagina(portal, "/", cookieCliente);
      expect(t).toContain("Lorena Salcedo");
      // Lo que el portal sirve con su rol trae la validación de Nivel 1 confirmada en el paso 4…
      const ficha = (
        await bd
          .como("ps_portal")
          .query(
            `SELECT reporte_evaluador, reporte_resultado FROM operacion.ficha_publicable WHERE codigo = $1`,
            [codigo],
          )
      ).rows[0];
      expect(ficha).toEqual({
        reporte_evaluador: "Célula de arquitectura de Trycore",
        reporte_resultado: "Aprobada, nivel senior",
      });
      // …y que el cliente la ve en la ficha del perfil (D47, HU-130 Nivel 1).
      const html = await pagina(portal, `/?ficha=${codigo}`, cookieCliente);
      expect(html).toContain("1 de 1 · selección para ti");
      expect(html).toContain("Verificado por Trycore");
      expect(html).toContain("Aprobada, nivel senior");
      expect(html).toContain("Célula de arquitectura de Trycore");
    });

    it("7 · importar y revertir: el worker aplica el lote y luego lo deshace; el perfil vuelve a como estaba", async () => {
      const texto = ["Código\tAños de experiencia", `${codigo}\t12`].join("\n");
      const c = await enPanel("/api/v1/importacion/lotes", {
        texto,
        formato: "tsv",
        modo: "crear_y_actualizar",
        archivo: "inventario-oct.tsv",
        columnas: [
          { columna: "Código", clave: "codigo" },
          { columna: "Años de experiencia", clave: "aniosExperiencia" },
        ],
      });
      expect(c.status).toBe(201);
      loteId = (await c.json()).loteId;
      expect((await enPanel(`/api/v1/importacion/lotes/${loteId}/aplicar`, {})).status).toBe(202);
      await vuelta(ctx);
      expect((await leerPerfil()).aniosExperiencia).toBe(12);
      expect(
        (await enPanel(`/api/v1/importacion/lotes/${loteId}/revertir`, { incluir: [] })).status,
      ).toBe(202);
      await vuelta(ctx);
      expect((await leerPerfil()).aniosExperiencia).toBe(8);
    });

    it("8 · disponibilidad y vigencia: se actualiza en bloque y, sin tocarla 31 días, entra a la bandeja", async () => {
      const r = await enPanel("/api/v1/perfiles/disponibilidad", {
        codigos: [codigo],
        disponibilidad: { opcion: "dos_semanas" },
      });
      expect(r.status).toBe(200);
      // El reloj de la prueba: la última actualización fue hace 31 días civiles.
      await bd.instalacion.query(
        `UPDATE inventario.perfiles SET disponibilidad_actualizada_en = now() - interval '31 days' WHERE codigo = $1`,
        [codigo],
      );
      expect(await pagina(panel, "/vigencia", admin)).toContain("Lorena Salcedo");
    });

    it("9 · colocado: registrado en el panel, sigue publicado y el cliente lo ve con su banda", async () => {
      const r = await enPanel("/api/v1/colocados", {
        codigo,
        cuenta: "Bancolombia",
        inicio: hoyBogota(),
        liberacion: enDias(75),
      });
      expect(r.status).toBe(200);
      expect((await leerPerfil()).estado).toBe("publicado");
      expect(await pagina(panel, "/colocados", admin)).toContain("Lorena Salcedo");
      expect(await pagina(portal, "/", cookieCliente)).toContain("Lorena Salcedo");
    });

    it("10 · observador: consulta la ficha, no edita (403 y queda el intento) y avisa a Talento Humano", async () => {
      expect(await pagina(panel, `/inventario/${codigo}?vista=ficha`, observadora)).toContain(
        "Lorena Salcedo",
      );
      const r = await pedir(
        panel,
        "PATCH",
        `/api/v1/perfiles/${codigo}`,
        { aniosExperiencia: 30 },
        observadora,
        {
          "if-match": `"${(await leerPerfil()).version}"`,
        },
      );
      expect(r.status).toBe(403);
      const rechazo = await bd.instalacion.query(
        `SELECT accion FROM identidad.accesos_log WHERE evento = 'acceso_rechazado' ORDER BY id DESC LIMIT 1`,
      );
      expect(rechazo.rows[0]?.accion).toBe("perfil.escribir");
      const a = await pedir(
        panel,
        "POST",
        `/api/v1/perfiles/${codigo}/avisar`,
        { nota: "Cambió de ciudad." },
        observadora,
      );
      expect(a.status).toBe(202);
      await vuelta(ctx);
      const aviso = correo.enviados.find((x) => x.para === TALENTO && x.texto.includes(codigo));
      expect(aviso?.texto).toContain("Cambió de ciudad.");
    });

    it("11 · auditoría: el registro del perfil muestra cada paso con su autor y la cadena sigue íntegra", async () => {
      const t = await pagina(panel, `/inventario/${codigo}/auditoria`, admin);
      for (const paso of [
        "Consentimiento",
        "Reporte de validación",
        "Publicación",
        `Importación «`,
        "Importación deshecha",
        "Disponibilidad",
        "Colocación",
      ])
        expect(t, paso).toContain(paso);
      expect(t).toContain("karen.rodriguez@trycore.com");
      const sinAutor = await bd.instalacion.query(
        `SELECT count(*)::int AS n FROM auditoria.auditoria WHERE titular = $1 AND btrim(actor) = ''`,
        [codigo],
      );
      expect(sinAutor.rows[0].n).toBe(0);
      expect((await verificarCadena(bd.instalacion, panelEnv.AUDIT_HMAC_KEY!)).ok).toBe(true);
      // La observadora también lo consulta.
      expect(await pagina(panel, `/inventario/${codigo}/auditoria`, observadora)).toContain(
        "Registro de auditoría",
      );
    });
  },
);
