// EP-003 · SS4 contra el portal standalone real con `ps_portal` (HU-153, HU-081, HU-119): la tarjeta de
// la selección y del banco, el Sello Personal por la proyección estricta (también por la API) y la
// evidencia ✓/– del filtro activo del banco, idéntica en la tarjeta y en «Frente a tu búsqueda» de la
// ficha. Los datos se ajustan por SQL en una BD de prueba propia (los ficticios fijados no se tocan en
// la BD de desarrollo).
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

const SELLO_A = [
  "Comunicación directa con negocio",
  "Rigor en la documentación",
  "Calma bajo presión",
];
const SELLO_B = ["Liderazgo técnico", "Pensamiento sistémico", "Comunicación clara"];
const SELLO_C = ["Curiosidad", "Autonomía", "Trabajo en equipo"];

const tarjetas = (html: string) =>
  Object.fromEntries(
    html
      .split('<article class="pp-perfil')
      .slice(1)
      .map((t) => [
        t.match(/<span class="pp-codigo-perfil">(PS-\d{4})<\/span>/)?.[1],
        t.split("</article>")[0]!,
      ]),
  ) as Record<string, string>;
const visible = (h: string) =>
  h
    .replace(/<span class="pp-sr">[^<]*<\/span>/g, "")
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
const capacidad = (t: string) =>
  visible(t.match(/<h3 class="pp-perfil__rol"[^>]*>(.*?)<\/h3>/)![1]!);
const sello = (t: string) => {
  const m = t.match(/<p class="rs-sello rs-sello--solo">(.*?)<\/p>/);
  return m ? visible(m[1]!) : null;
};
const lineasTarjeta = (t: string) =>
  [...t.matchAll(/<li class="pp-criterio (pp-criterio--\w+)">(.*?)<\/li>/g)].map((m) =>
    visible(m[2]!),
  );
const lineasFicha = (h: string) =>
  [...h.matchAll(/<li class="fp-criterio( fp-criterio--no)?">(.*?)<\/li>/g)].map((m) =>
    visible(m[2]!),
  );

describe.skipIf(!HAY_BD || !hayBuild("portal"))(
  "tarjeta y evidencia en el portal (EP-003 · SS4)",
  () => {
    let bd: BdPrueba;
    let srv: ServidorPrueba;

    async function sesion(codigos: string[]): Promise<string> {
      const e = await bd.instalacion.query(
        `INSERT INTO identidad.enlaces (cuenta_nombre, proyecto, razon, codigos_perfil, vigente_desde, vigente_hasta, generado_por)
       VALUES ('Bancolombia', 'Pagos', 'Perfiles para pagos inmediatos.', $1, now() - interval '2 days', now() + interval '25 days', gen_random_uuid())
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
    const html = async (ruta: string, cookie: string) => {
      const r = await srv.pedir(ruta, { headers: { cookie } });
      expect(r.status, ruta).toBe(200);
      return r.text();
    };
    const sql = (q: string, p: unknown[] = []) => bd.instalacion.query(q, p);

    beforeAll(async () => {
      bd = await crearBdPrueba();
      const panelEnv = entornoDev("panel");
      await sembrarFicticios({
        bd: bd.como("ps_panel"),
        auditoria: { hmac: panelEnv.AUDIT_HMAC_KEY!, kek: panelEnv.AUDIT_KEK! },
        appEnv: "ci",
        registrar: () => {},
      });
      const sellar = (codigo: string, s: string[]) =>
        sql(`UPDATE inventario.perfiles SET sello_personal = $2 WHERE codigo = $1`, [codigo, s]);
      await sellar("PS-0142", SELLO_A);
      await sellar("PS-0187", SELLO_B);
      await sellar("PS-0215", SELLO_C);
      await sellar("PS-0223", SELLO_C);
      // Fuera de contrato: una competencia solo con espacios (la BD ya impide más de tres).
      await sellar("PS-0201", ["Precisión", "   "]);
      // PS-0230: 8 tecnologías (4 propias + 4 más en orden de carga) y ningún sector.
      await sql(
        `INSERT INTO inventario.perfil_tecnologias (perfil_id, valor_id, orden)
       SELECT p.id, t.id, 4 + x.n FROM inventario.perfiles p,
              unnest(ARRAY['Java','Python','React','SQL']) WITH ORDINALITY AS x(nombre, n)
              JOIN inventario.catalogo_tecnologias t ON t.nombre = x.nombre
        WHERE p.codigo = 'PS-0230'`,
      );
      await sql(
        `DELETE FROM inventario.perfil_sectores WHERE perfil_id = (SELECT id FROM inventario.perfiles WHERE codigo = 'PS-0230')`,
      );
      // PS-0238: disponibilidad vencida y sin tocar hace más de 30 días.
      await sql(
        `UPDATE inventario.perfiles SET disponibilidad_fecha = current_date - 50, disponibilidad_actualizada_en = now() - interval '40 days'
        WHERE codigo = 'PS-0238'`,
      );
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

    describe("HU-153 · la capacidad primero", () => {
      it("happy: capacidad, nombre, tecnologías, sector, modalidad, país, banda y el código solo al pie", async () => {
        const t = tarjetas(await html("/", await sesion(["PS-0142", "PS-0187"])))["PS-0142"]!;
        expect(capacidad(t)).toBe("Desarrolladora backend Java · Senior · 8 años de experiencia");
        expect(t).toMatch(/<p class="pp-perfil__nombre">Laura Méndez<\/p>/);
        expect(visible(t.match(/<ul class="pp-perfil__tecnologias"[^>]*>(.*?)<\/ul>/)![1]!)).toBe(
          "Java Spring Boot Kafka PostgreSQL",
        );
        expect(visible(t.match(/<ul class="pp-perfil__meta"[^>]*>(.*?)<\/ul>/)![1]!)).toBe(
          "Banca, seguros Híbrido Colombia",
        );
        expect(visible(t)).toContain("Disponible ahora");
        expect(visible(t).match(/PS-0142/g)).toHaveLength(1);
        expect(t).toMatch(
          /<div class="pp-perfil__pie">.*<span class="pp-codigo-perfil">PS-0142<\/span><\/div>$/,
        );
        expect(t).not.toMatch(/<img|Medellín/);
      });

      it("error: vencida y sin tocar > 30 días → «por confirmar», ni «Inmediato» ni la fecha", async () => {
        const t = tarjetas(await html("/", await sesion(["PS-0238"])))["PS-0238"]!;
        expect(visible(t)).toContain("Disponibilidad por confirmar");
        expect(visible(t)).not.toMatch(/Inmediato|Disponible ahora|\d{4}-\d{2}-\d{2}/);
      });

      it("edge: 8 tecnologías y sin sector → las 5 primeras en orden de carga y sin hueco; la ficha conserva las 8", async () => {
        const cookie = await sesion(["PS-0230"]);
        const t = tarjetas(await html("/", cookie))["PS-0230"]!;
        expect(visible(t.match(/<ul class="pp-perfil__tecnologias"[^>]*>(.*?)<\/ul>/)![1]!)).toBe(
          "Kubernetes Terraform AWS GitHub Actions Java",
        );
        expect(visible(t.match(/<ul class="pp-perfil__meta"[^>]*>(.*?)<\/ul>/)![1]!)).toBe(
          "Presencial Colombia",
        );
        const f = await html("/?ficha=PS-0230", cookie);
        expect(f).toContain(
          "Kubernetes · Terraform · AWS · GitHub Actions · Java · Python · React · SQL",
        );
      });
    });

    describe("HU-081 · Sello Personal", () => {
      it("happy y edge: sellos distintos, sin sello sin hueco, iguales sin equivalencia; ninguna insignia", async () => {
        const ts = tarjetas(
          await html("/", await sesion(["PS-0142", "PS-0187", "PS-0215", "PS-0223", "PS-0238"])),
        );
        expect(sello(ts["PS-0142"]!)).toBe(`Sello Personal ${SELLO_A.join(" · ")}`);
        expect(sello(ts["PS-0187"]!)).toBe(`Sello Personal ${SELLO_B.join(" · ")}`);
        expect(sello(ts["PS-0215"]!)).toBe(sello(ts["PS-0223"]!));
        expect(ts["PS-0142"]).toContain("Verificado por Trycore");
        expect(ts["PS-0238"]).not.toMatch(
          /rs-sello|Sello Personal|Verificado por Trycore|pp-evidencia/,
        );
        for (const t of Object.values(ts)) {
          expect(t).not.toMatch(/Neural|insignia|pp-badge|puntaje|%/i);
          expect(visible(t)).not.toMatch(/equivalente|intercambiable/i);
        }
      });

      it("error: sello fuera de contrato → la tarjeta sin sello, la lista entera y el registro sin datos personales", async () => {
        const antes = srv.salida().length;
        const ts = tarjetas(await html("/", await sesion(["PS-0201", "PS-0142"])));
        expect(Object.keys(ts).sort()).toEqual(["PS-0142", "PS-0201"]);
        expect(ts["PS-0201"]).not.toMatch(/rs-sello|Precisión|Sello Personal/);
        expect(sello(ts["PS-0142"]!)).toBe(`Sello Personal ${SELLO_A.join(" · ")}`);
        const registro = srv
          .salida()
          .slice(antes)
          .split("\n")
          .filter((l) => l.includes("sello_fuera_de_contrato"));
        expect(registro.map((l) => JSON.parse(l))).toContainEqual({
          evento: "sello_fuera_de_contrato",
          codigo: "PS-0201",
        });
        for (const l of registro) expect(l).not.toMatch(/Camila|Precisión/);
      });

      it("la API del catálogo trae el sello validado (estricta, mismo contrato que el HTML)", async () => {
        const r = await srv.pedir("/api/v1/catalogo", { headers: { cookie: await sesion([]) } });
        expect(r.status).toBe(200);
        const { perfiles } = (await r.json()) as {
          perfiles: Array<{ codigo: string; selloPersonal: string[] }>;
        };
        const de = (c: string) => perfiles.find((p) => p.codigo === c)!.selloPersonal;
        expect(de("PS-0142")).toEqual(SELLO_A);
        expect(de("PS-0201")).toEqual([]);
        expect(de("PS-0238")).toEqual([]);
      });
    });

    describe("HU-119 · evidencia ✓/– del filtro activo", () => {
      it("sin criterios (la selección del correo): ni en la tarjeta ni en la ficha", async () => {
        const cookie = await sesion(["PS-0142", "PS-0187"]);
        const h = await html("/", cookie);
        expect(h).not.toMatch(/pp-criterio|criterios activos|Frente a tu búsqueda/);
        const f = await html("/?ficha=PS-0142", cookie);
        expect(f).not.toMatch(/Frente a tu búsqueda|fp-criterio/);
        // El banco sin filtro tampoco deduce criterios.
        expect(await html("/banco", cookie)).not.toMatch(/pp-criterio|Frente a tu búsqueda/);
      });

      it("con una categoría: cada tarjeta con su línea ✓ y la ficha con la MISMA línea en «Frente a tu búsqueda»", async () => {
        const cookie = await sesion(["PS-0142"]);
        const ts = tarjetas(await html("/banco?categoria=Desarrollo", cookie));
        expect(Object.keys(ts).length).toBeGreaterThan(1);
        for (const t of Object.values(ts))
          expect(lineasTarjeta(t)).toEqual(["✓ Categoría: Desarrollo"]);
        const f = await html("/banco?categoria=Desarrollo&ficha=PS-0142", cookie);
        expect(f).toContain(">Frente a tu búsqueda</h3>");
        expect(lineasFicha(f)).toEqual(lineasTarjeta(ts["PS-0142"]!));
        expect(visible(f)).not.toMatch(/\d+\s*%/);
      });

      it("con un rol: «✓ Rol: …» en la tarjeta y en la ficha", async () => {
        const cookie = await sesion([]);
        const rol = "Analista QA automatización";
        const ts = tarjetas(await html(`/banco?rol=${encodeURIComponent(rol)}`, cookie));
        for (const t of Object.values(ts)) expect(lineasTarjeta(t)).toEqual([`✓ Rol: ${rol}`]);
        const f = await html(`/banco?rol=${encodeURIComponent(rol)}&ficha=PS-0201`, cookie);
        expect(lineasFicha(f)).toEqual([`✓ Rol: ${rol}`]);
      });
    });
  },
);
