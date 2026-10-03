// EP-003 · SS5 contra el portal standalone real con `ps_portal` (HU-154, HU-155, HU-157). Lista negra
// B.4 (tarea 5.1): un perfil con motivación (`aporte`), vínculo, capacidad y anclaje internos, y con
// correo, teléfono, redes, «hoja de vida», promedio, certificaciones y DISC detallado escritos en esos
// campos internos: nada cruza a la respuesta de la ficha ni a la de la tarjeta (HTML/RSC de la selección y
// del banco, y JSON de la API). La validación técnica de Nivel 0 y el bloque de conversación con el
// contacto vigente, el mismo para los tres vínculos; un cambio del contacto se ve en la siguiente carga.
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { sembrarFicticios } from "./worker/src/sembrar-ficticios";

// Lo que Talento Humano escribió en los campos internos: si algo cruza, aparece literal.
const INTERNO = {
  aporte:
    "MOTIVACION-SECRETA quiere proyectarse a gerente; correo laura.personal@gmail.com tel +57 300 123 4567",
  capacidad: "CAPACIDAD-INTERNA disponible para asignación",
  anclaje: "ANCLAJE-INTERNO promedio 4.8 certificación AWS 2024",
};
// Claves de la lista negra B.4 y de lo interno (D20, B.7), como clave JSON (también escapada en el RSC).
const CLAVES_B4 = [
  "foto",
  "fotografia",
  "correo",
  "email",
  "telefono",
  "celular",
  "linkedin",
  "github",
  "cv",
  "hojaDeVida",
  "motivacion",
  "proyeccion",
  "aporte",
  "vinculo",
  "capacidad",
  "anclaje",
  "promedio",
  "certificaciones",
  "discDetalle",
  "discResultado",
  "perfilDisc",
  "segundoApellido",
];
const comoClave = (c: string) => new RegExp(`\\\\?"${c}\\\\?"\\s*:`);
const visible = (h: string) =>
  h
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<span class="pp-sr">[^<]*<\/span>/g, "")
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const seccion = (h: string, id: string) => {
  const i = h.indexOf(`aria-labelledby="${id}"`);
  return i < 0 ? "" : h.slice(i, h.indexOf("</section>", i));
};

describe.skipIf(!HAY_BD || !hayBuild("portal"))(
  "ficha · lista negra, validación y contacto (EP-003 · SS5)",
  () => {
    let bd: BdPrueba;
    let srv: ServidorPrueba;

    async function sesion(codigos: string[]): Promise<string> {
      const e = await bd.instalacion.query(
        `INSERT INTO identidad.enlaces (cuenta_nombre, proyecto, razon, codigos_perfil, vigente_desde, vigente_hasta, generado_por)
       VALUES ('Bancolombia', 'Pagos', 'Perfiles para pagos.', $1, now() - interval '2 days', now() + interval '25 days', gen_random_uuid())
       RETURNING id`,
        [codigos],
      );
      const i = await bd.instalacion.query(
        `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, $2, $3) RETURNING id`,
        [e.rows[0].id, `inv-${randomBytes(3).toString("hex")}@bancolombia.com`, randomBytes(32)],
      );
      const id = randomBytes(32).toString("base64url");
      await bd.instalacion.query(
        `INSERT INTO identidad.sesiones_portal (id_hash, enlace_id, invitado_id, expira) VALUES ($1, $2, $3, now() + interval '20 days')`,
        [createHash("sha256").update(id).digest(), e.rows[0].id, i.rows[0].id],
      );
      return `__Host-ps=${id}`;
    }
    const texto = async (ruta: string, cookie: string) => {
      const r = await srv.pedir(ruta, { headers: { cookie } });
      expect(r.status, ruta).toBe(200);
      return r.text();
    };
    const contacto = (correo: string, nombre: string | null, cargo: string | null) =>
      bd.instalacion.query(
        `INSERT INTO inventario.configuracion_contacto (unica, correo, nombre, cargo, actualizado_por, actualizado_en)
       VALUES (true, $1, $2, $3, (SELECT id FROM identidad_panel.usuarios_panel LIMIT 1), now())
       ON CONFLICT (unica) DO UPDATE SET correo = EXCLUDED.correo, nombre = EXCLUDED.nombre, cargo = EXCLUDED.cargo`,
        [correo, nombre, cargo],
      );

    beforeAll(async () => {
      bd = await crearBdPrueba();
      const panelEnv = entornoDev("panel");
      await sembrarFicticios({
        bd: bd.como("ps_panel"),
        auditoria: { hmac: panelEnv.AUDIT_HMAC_KEY!, kek: panelEnv.AUDIT_KEK! },
        appEnv: "ci",
        registrar: () => {},
      });
      await bd.instalacion.query(
        `UPDATE inventario.perfiles SET aporte = $2, capacidad = $3, anclaje = $4, vinculo = 'fabrica' WHERE codigo = $1`,
        ["PS-0142", INTERNO.aporte, INTERNO.capacidad, INTERNO.anclaje],
      );
      await bd.instalacion.query(
        `UPDATE inventario.perfiles SET vinculo = 'vinculado' WHERE codigo = 'PS-0187'`,
      );
      await bd.instalacion.query(
        `UPDATE inventario.perfiles SET vinculo = 'banco_no_vinculado' WHERE codigo = 'PS-0215'`,
      );
      await bd.instalacion.query(
        `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('ss5@trycore.com', $1, 'administrador')`,
        [randomBytes(32)],
      );
      await contacto("eida.tinjaca@trycore.com", "Eida Tinjacá", "Coordinación de Servicio");
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

    describe("HU-154 · datos internos que nunca cruzan al portal (B.4)", () => {
      it("ni la ficha (selección y banco) ni la tarjeta ni la API traen la motivación ni nada de B.4", async () => {
        const cookie = await sesion(["PS-0142", "PS-0187"]);
        const respuestas = {
          "ficha desde la selección": await texto("/?ficha=PS-0142", cookie),
          "ficha desde el banco filtrado": await texto(
            "/banco?categoria=Desarrollo&ficha=PS-0142",
            cookie,
          ),
          "tarjetas de la selección": await texto("/", cookie),
          "tarjetas del banco": await texto("/banco", cookie),
          "API del catálogo": await texto("/api/v1/catalogo", cookie),
        };
        for (const [donde, r] of Object.entries(respuestas)) {
          for (const v of Object.values(INTERNO))
            expect(r, `${donde}: ${v}`).not.toContain(v.split(" ")[0]);
          expect(r, donde).not.toMatch(/laura\.personal|gmail\.com|300 123 4567|proyectarse/);
          for (const c of CLAVES_B4) expect(r, `${donde}: clave ${c}`).not.toMatch(comoClave(c));
          expect(r, donde).not.toMatch(/<img\b/);
          // La única forma de DISC que cruza es el mes de la evaluación (`disc: { fecha }`).
          for (const m of r.matchAll(/\\?"disc\\?"\s*:\s*(\{[^}]*\}|null)/g))
            expect(m[1]).toMatch(/^(null|\{\\?"fecha\\?":[^,]*\})$/);
        }
      });
    });

    describe("HU-155 · validación técnica de Nivel 0 en el portal", () => {
      it("desplegable, solo la prueba con el texto de cara al cliente, sin fecha, sin enlaces", async () => {
        const h = await texto("/?ficha=PS-0142", await sesion(["PS-0142"]));
        const v = h.match(/<details class="fp-validacion"[^>]*>[\s\S]*?<\/details>/)?.[0] ?? "";
        expect(v).toMatch(/<details class="fp-validacion" open=""/);
        expect(v).toMatch(/<summary[^>]*>Validación técnica<\/summary>/);
        expect([...v.matchAll(/<dt>(.*?)<\/dt>/g)].map((m) => m[1])).toEqual(["Prueba aplicada"]);
        expect(visible(v)).not.toMatch(/Fecha|no aplica|pendiente|\b20\d\d\b/i);
        expect(v).not.toMatch(/<a\b|href=/);
      });
    });

    describe("HU-157 · la conversación va por Trycore", () => {
      it("el contacto vigente con el texto de representación comercial; ninguna vía hacia la persona", async () => {
        const h = await texto("/?ficha=PS-0142", await sesion(["PS-0142"]));
        const c = seccion(h, "fp-contacto");
        expect(visible(c)).toContain("La conversación sobre este profesional va por Trycore.");
        expect(visible(c)).toContain(
          "Trycore responde por este perfil y lo pone a tu disposición.",
        );
        expect(visible(c)).toContain(
          "Este portal no tiene una vía de contacto directo con el profesional.",
        );
        expect(visible(c)).toContain(
          "Eida Tinjacá, Coordinación de Servicio: eida.tinjaca@trycore.com",
        );
        expect(visible(h)).not.toMatch(/Escribir a Trycore/);
        const ficha = h.slice(h.indexOf('id="ficha"'), h.indexOf("</article>", h.indexOf('id="ficha"')));
        expect(ficha.replace(c, "").match(/.{60}(mailto:|tel:|linkedin|hoja de vida).{60}/i)?.[0] ?? null).toBeNull();
      });

      it("edge: mismo texto de representación y de disponibilidad para los tres vínculos, sin etiqueta del vínculo", async () => {
        const cookie = await sesion(["PS-0142", "PS-0187", "PS-0215"]);
        const bloques: string[] = [];
        for (const codigo of ["PS-0142", "PS-0187", "PS-0215"]) {
          const h = await texto(`/?ficha=${codigo}`, cookie);
          bloques.push(seccion(h, "fp-contacto"));
          expect(visible(h)).not.toMatch(
            /emplead[oa]|contratista|red extendida|vinculad[oa]|fábrica de software|banco no vinculado/i,
          );
          expect(h).toMatch(
            /<span class="pp-badge pp-badge--banda">(Disponible ahora|En [^<]+|Disponibilidad por confirmar)<\/span>/,
          );
        }
        expect(new Set(bloques).size).toBe(1);
      });

      it("cambiar el contacto se refleja en la siguiente apertura; solo buzón → «People Service: …»", async () => {
        const cookie = await sesion(["PS-0142"]);
        await contacto("ana.ruiz@trycore.com", "Ana Ruiz", "Dirección Comercial");
        expect(visible(seccion(await texto("/?ficha=PS-0142", cookie), "fp-contacto"))).toContain(
          "Ana Ruiz, Dirección Comercial: ana.ruiz@trycore.com",
        );
        await contacto("people.service@trycore.com", null, null);
        expect(visible(seccion(await texto("/?ficha=PS-0142", cookie), "fp-contacto"))).toContain(
          "People Service: people.service@trycore.com",
        );
        await contacto("eida.tinjaca@trycore.com", "Eida Tinjacá", "Coordinación de Servicio");
      });
    });
  },
);
