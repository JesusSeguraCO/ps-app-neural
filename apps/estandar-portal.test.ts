// EP-003 · SS7 contra el portal standalone real con `ps_portal` (HU-159; D64, D80, D97, HU-178). El
// encabezado del estándar va antes del primer contenido en la selección, en el banco y en el encuadre sin
// selección, una sola vez y sin insignias en las tarjetas; «ningún perfil…» solo con 0 publicados
// incompletos (completar el último devuelve la frase); sin conteo, la versión descriptiva, la página carga
// normal y queda el registro `conteo_incompletos_no_disponible`. El respaldo con el SLA, en la selección.
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { FRASES_ESTANDAR } from "@ps/dominio/catalogo/estandar";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { sembrarFicticios } from "./worker/src/sembrar-ficticios";

const visible = (h: string) =>
  h
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<span class="pp-sr">[^<]*<\/span>/g, "")
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const encabezado = (h: string) => {
  const i = h.indexOf('<section class="ee-estandar"');
  return i < 0 ? "" : h.slice(i, h.indexOf("</section>", i));
};
const cuenta = (h: string, x: string) => visible(h).split(x).length - 1;

describe.skipIf(!HAY_BD || !hayBuild("portal"))("encabezado del estándar (EP-003 · SS7)", () => {
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
    await sembrarFicticios({
      bd: bd.como("ps_panel"),
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

  describe("HU-159 · el estándar se declara una vez, arriba", () => {
    it("selección, banco y encuadre sin selección: antes del primer contenido, una vez, sin insignias en las tarjetas", async () => {
      const conSeleccion = await sesion(["PS-0142", "PS-0187"]);
      const pantallas: Array<[string, string, string]> = [
        ["/", conSeleccion, 'class="pp-perfil'],
        ["/banco", conSeleccion, 'class="pp-perfil'],
        ["/", await sesion([]), "¿Qué necesita tu proyecto?"],
      ];
      for (const [ruta, cookie, primero] of pantallas) {
        const h = await texto(ruta, cookie);
        const donde = `${ruta} → ${primero}`;
        expect(encabezado(h), donde).not.toBe("");
        expect(h.indexOf('<section class="ee-estandar"'), donde).toBeLessThan(h.indexOf(primero));
        expect(h.match(/<section class="ee-estandar"/g)?.length, donde).toBe(1);
        expect(cuenta(h, "bajo SARO"), donde).toBe(1);
        expect(visible(encabezado(h)), donde).toMatch(/cuatro dimensiones/);
        expect(visible(h), donde).not.toMatch(/cinco componentes/);
        for (const t of h.match(/<article class="pp-perfil[\s\S]*?<\/article>/g) ?? [])
          expect(t, donde).not.toMatch(/Neural-Grid|Neural Speed|ee-estandar/);
      }
    });

    it("en el flujo de la página: sin diálogo ni nada que cerrar o aceptar", async () => {
      const e = encabezado(await texto("/", await sesion(["PS-0142"])));
      expect(e).not.toMatch(/role="dialog"|aria-modal|<button/);
    });
  });

  describe("HU-159 · «ninguno» solo con 0 incompletos (D80, HU-178)", () => {
    it("0 → afirma; 1 → describe sin «ningún» ni número; completar el último devuelve la afirmación", async () => {
      const cookie = await sesion(["PS-0142"]);
      expect(visible(encabezado(await texto("/", cookie)))).toContain(FRASES_ESTANDAR.ninguno);

      const previo = (
        await bd.instalacion.query(
          `SELECT saro_alcance_id, saro_fecha FROM inventario.perfiles WHERE codigo = 'PS-0187'`,
        )
      ).rows[0];
      await bd.instalacion.query(
        `UPDATE inventario.perfiles SET saro_alcance_id = NULL, saro_fecha = NULL WHERE codigo = 'PS-0187'`,
      );
      const uno = visible(encabezado(await texto("/", cookie)));
      expect(uno).toContain(FRASES_ESTANDAR.descriptiva);
      // Ni «ningún» ni el número (el único dígito es el «día 1» de la garantía, RF-6.5).
      expect(uno.replace("día 1", "")).not.toMatch(/ningún|ninguno|\d|PS-0187/i);

      await bd.instalacion.query(
        `UPDATE inventario.perfiles SET saro_alcance_id = $1, saro_fecha = $2 WHERE codigo = 'PS-0187'`,
        [previo.saro_alcance_id, previo.saro_fecha],
      );
      expect(visible(encabezado(await texto("/", cookie)))).toContain(FRASES_ESTANDAR.ninguno);
    });
  });

  describe("HU-159 · error: el conteo no está disponible (D97)", () => {
    it("versión descriptiva, los perfiles cargan, sin error en el encabezado y con registro técnico", async () => {
      const cookie = await sesion(["PS-0142", "PS-0187"]);
      const antes = srv.salida().length;
      await bd.instalacion.query(
        "REVOKE SELECT ON operacion.indicadores_publicacion FROM ps_portal",
      );
      try {
        const h = await texto("/", cookie);
        const e = visible(encabezado(h));
        expect(e).toContain(FRASES_ESTANDAR.descriptiva);
        expect(e).not.toMatch(/error|no disponible|inténtalo/i);
        expect(h.match(/<article class="pp-perfil/g)?.length).toBe(2);
        const registro = srv
          .salida()
          .slice(antes)
          .split("\n")
          .filter((l) => l.includes("conteo_incompletos_no_disponible"));
        expect(registro.length).toBeGreaterThan(0);
        expect(JSON.parse(registro[0]!)).toMatchObject({
          evento: "conteo_incompletos_no_disponible",
        });
      } finally {
        await bd.instalacion.query(
          "GRANT SELECT ON operacion.indicadores_publicacion TO ps_portal",
        );
      }
    });
  });

  describe("HU-159 · el respaldo y el plazo a la vista", () => {
    it("la selección trae Trycore University, Hive Mind, la Coordinación de Servicio dedicada y el SLA", async () => {
      const h = await texto("/", await sesion(["PS-0142"]));
      const i = h.indexOf('class="ee-respaldo"');
      expect(i).toBeGreaterThan(0);
      const r = visible(h.slice(i, h.indexOf("</section>", i)));
      for (const x of [
        "Trycore University",
        "Hive Mind",
        "Coordinación de Servicio dedicada",
        "10 días hábiles",
      ])
        expect(r).toContain(x);
    });
  });
});
