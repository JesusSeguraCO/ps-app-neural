// EP-003 · SS6 contra el portal standalone real con `ps_portal` (HU-156, HU-158). Los publicados heredados
// sin SARO o sin DISC (D62) siguen abriendo su ficha: la línea ausente se omite sin marca y la marca
// «Incompleto» del panel (HU-178) no cruza ni en el HTML ni en el RSC. El cierre con condiciones, SLA y
// garantía es el mismo para todos los vínculos; el código está solo al pie y nunca en el `<title>`.
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import {
  ALCANCE_SARO_FICTICIO,
  sembrarFicticios,
  sembrarHeredadosIncompletos,
} from "./worker/src/sembrar-ficticios";

const visible = (h: string) =>
  h
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<span class="pp-sr">[^<]*<\/span>/g, "")
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const ficha = (h: string) => {
  const i = h.indexOf('id="ficha"');
  return i < 0 ? "" : h.slice(i, h.indexOf("</article>", i));
};
const seccion = (h: string, id: string) => {
  const i = h.indexOf(`aria-labelledby="${id}"`);
  return i < 0 ? "" : h.slice(i, h.indexOf("</section>", i));
};

describe.skipIf(!HAY_BD || !hayBuild("portal"))("ficha · SARO/DISC y cierre (EP-003 · SS6)", () => {
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

  beforeAll(async () => {
    bd = await crearBdPrueba();
    const panelEnv = entornoDev("panel");
    const ctx = {
      bd: bd.como("ps_panel"),
      auditoria: { hmac: panelEnv.AUDIT_HMAC_KEY!, kek: panelEnv.AUDIT_KEK! },
      appEnv: "ci" as const,
      registrar: () => {},
    };
    await sembrarFicticios(ctx);
    await sembrarHeredadosIncompletos(ctx);
    await bd.instalacion.query(
      `UPDATE inventario.perfiles SET vinculo = 'vinculado' WHERE codigo = 'PS-0187'`,
    );
    await bd.instalacion.query(
      `UPDATE inventario.perfiles SET vinculo = 'banco_no_vinculado' WHERE codigo = 'PS-0215'`,
    );
    await bd.instalacion.query(
      `UPDATE inventario.perfil_experiencias SET descripcion = 'Construyó un asistente con LLM para atención al cliente.'
        WHERE perfil_id = (SELECT id FROM inventario.perfiles WHERE codigo = 'PS-0187')`,
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

  describe("HU-156 · SARO y DISC en la ficha del portal", () => {
    it("happy: un publicado completo muestra el texto del alcance con «marzo de 2026» y la DISC con «abril de 2026»", async () => {
      const h = ficha(await texto("/?ficha=PS-0142", await sesion(["PS-0142"])));
      const ver = visible(seccion(h, "fp-verificado"));
      expect(ver).toContain(`${ALCANCE_SARO_FICTICIO.texto} · marzo de 2026`);
      expect(ver).toMatch(/Evaluación DISC abril de 2026/);
    });

    it("error: los heredados sin SARO o sin DISC siguen abriendo su ficha, sin la línea y sin marca de incompleto", async () => {
      const cookie = await sesion(["PS-0105", "PS-0112", "PS-0118"]);
      const casos: Array<[string, boolean, boolean]> = [
        ["PS-0105", false, true],
        ["PS-0112", false, false],
        ["PS-0118", true, false],
      ];
      for (const [codigo, conSaro, conDisc] of casos) {
        const pagina = await texto(`/?ficha=${codigo}`, cookie);
        const h = ficha(pagina);
        expect(h, codigo).toContain('aria-labelledby="fp-verificado"');
        expect(visible(h), codigo).not.toContain("Esta ficha se está actualizando");
        expect(h.includes("vp-fila-seguridad"), codigo).toBe(conSaro);
        expect(h.includes("vp-fila-disc"), codigo).toBe(conDisc);
        expect(visible(h), codigo).not.toMatch(/incomplet|pendiente|no aplica|falta/i);
        // El resto completo: validación, trayectoria, cierre y referencia.
        for (const x of [
          "Validación técnica",
          "Trayectoria",
          "fp-condiciones",
          "fp-servicio",
          `Referencia interna ${codigo}`,
        ])
          expect(h, `${codigo}: ${x}`).toContain(x);
        // La marca del panel no viaja en ninguna forma (ni HTML ni RSC).
        expect(pagina, codigo).not.toMatch(/Incompleto|estadoDeEntrada|incompleto/);
      }
    });
  });

  describe("HU-158 · cierre y código al pie", () => {
    it("el código no está en el <title>, ni en la cabecera; solo al pie con la línea del estándar", async () => {
      const pagina = await texto("/?ficha=PS-0142", await sesion(["PS-0142"]));
      expect(pagina.match(/<title>(.*?)<\/title>/)?.[1]).not.toMatch(/PS-\d{4}/);
      const h = ficha(pagina);
      expect(h.slice(0, h.indexOf("</header>"))).not.toContain("PS-0142");
      expect(visible(h).match(/PS-0142/g)).toEqual(["PS-0142"]);
      expect(visible(h)).toContain(
        "Referencia interna PS-0142. Todos los perfiles que publicamos pasan por nuestro estándar Neural-Grid™.",
      );
    });

    it("edge: la garantía y el SLA son los mismos para los tres vínculos; la IA solo en la trayectoria de quien la tiene", async () => {
      const cookie = await sesion(["PS-0142", "PS-0187", "PS-0215"]);
      const servicios: string[] = [];
      for (const codigo of ["PS-0142", "PS-0187", "PS-0215"]) {
        const h = ficha(await texto(`/?ficha=${codigo}`, cookie));
        servicios.push(seccion(h, "fp-servicio"));
        expect(h.replace(seccion(h, "fp-servicio"), ""), codigo).not.toMatch(/Neural Speed/);
        const sinDeclarado = visible(h.replace(seccion(h, "fp-declarado"), ""));
        expect(sinDeclarado, codigo).not.toMatch(/LLM/);
      }
      expect(new Set(servicios).size).toBe(1);
      expect(visible(servicios[0]!)).toMatch(/10 días hábiles/);
      const conLlm = ficha(await texto("/?ficha=PS-0187", cookie));
      expect(visible(seccion(conLlm, "fp-declarado"))).toContain("LLM");
      const sinIa = ficha(await texto("/?ficha=PS-0215", cookie));
      expect(visible(sinIa)).not.toMatch(/LLM/);
    });
  });
});
