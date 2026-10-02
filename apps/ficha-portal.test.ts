// Ficha del perfil en el portal (D47; HU-120, HU-127, HU-129, HU-130) contra el servidor standalone con
// `ps_portal`: se abre en panel lateral sobre la lista que el cliente tiene delante y se recorre en su
// orden; los clientes nombrados solo salen si el consentimiento los incluye; ningún perfil fuera de la
// lista ni sin publicar abre ficha.
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { PERFILES_FICTICIOS, sembrarFicticios } from "./worker/src/sembrar-ficticios";

describe.skipIf(!HAY_BD || !hayBuild("portal"))("ficha del perfil en el portal (D47)", () => {
  let bd: BdPrueba;
  let srv: ServidorPrueba;
  let cookie: string;
  const publicados = PERFILES_FICTICIOS.filter((p) => p.estado === "publicado").slice(0, 3);
  const [a, b, c] = publicados.map((p) => p.codigo) as [string, string, string];
  const pausado = PERFILES_FICTICIOS.find((p) => p.estado === "pausado")!.codigo;
  const nombreDe = (codigo: string) => {
    const p = PERFILES_FICTICIOS.find((x) => x.codigo === codigo)!;
    return `${p.nombre} ${p.primerApellido}`;
  };

  const pagina = async (ruta: string) => {
    const r = await srv.pedir(ruta, { headers: { cookie } });
    expect(r.status).toBe(200);
    return r.text();
  };
  const dialogo = (html: string) => html.match(/<article[^>]*role="dialog"[\s\S]*?<\/article>/)?.[0] ?? null;
  const experiencia = async (codigo: string, cliente: string, incluye: boolean) => {
    const id = (
      await bd.instalacion.query(`SELECT id FROM inventario.perfiles WHERE codigo = $1`, [codigo])
    ).rows[0].id;
    await bd.instalacion.query(
      `INSERT INTO inventario.perfil_experiencias (perfil_id, orden, cargo, cliente_nombrado, desde, hasta, descripcion)
       VALUES ($1, 2, 'Ingeniera de pagos', $2, 2021, 2025, 'Pagos inmediatos con Kafka.')`,
      [id, cliente],
    );
    await bd.instalacion.query(
      `UPDATE inventario.consentimientos SET incluye_clientes = $2 WHERE perfil_id = $1 AND vigente`,
      [id, incluye],
    );
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
    await experiencia(a, "Bancolombia", true);
    await experiencia(b, "Davivienda", false);
    const e = await bd.instalacion.query(
      `INSERT INTO identidad.enlaces (cuenta_ref, cuenta_nombre, proyecto, razon, codigos_perfil, vigente_desde, vigente_hasta, generado_por)
       VALUES (NULL, 'Bancolombia', 'Modernización de pagos', 'Pagos en banca.', $1, now() - interval '1 day',
               now() + interval '25 days', gen_random_uuid()) RETURNING id`,
      [[a, pausado, b, c]],
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
    cookie = `__Host-ps=${id}`;
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

  it("HU-120: cada perfil disponible ofrece «Ver ficha»; el que cambió de estado no; sin ficha pedida no hay diálogo", async () => {
    const html = await pagina("/");
    for (const codigo of [a, b, c]) expect(html).toContain(`href="/?ficha=${codigo}"`);
    expect(html).not.toContain(`ficha=${pausado}`);
    expect(dialogo(html)).toBeNull();
  });

  it("HU-120: la ficha se abre sobre la lista (que sigue detrás, inerte), con su posición y los vecinos en el orden del correo", async () => {
    const html = await pagina(`/?ficha=${b}`);
    const ficha = dialogo(html)!;
    expect(ficha).toContain('aria-modal="true"');
    expect(ficha).toContain(nombreDe(b));
    // El pausado no cuenta: la ficha recorre solo los disponibles.
    expect(ficha).toMatch(/<b>2 de 3<\/b> · selección para ti/);
    expect(ficha).toContain(`href="/?ficha=${a}"`);
    expect(ficha).toContain(`href="/?ficha=${c}"`);
    // Cerrar vuelve a la misma lista en la posición del perfil abierto (HU-120, EP-003 · SS7).
    expect(ficha).toContain(`href="/#p-${b.slice(3)}" aria-label="Cerrar la ficha"`);
    expect(html).toContain(`id="p-${b.slice(3)}"`);
    // La lista sigue: inerte detrás, con la tarjeta abierta marcada.
    expect(html).toMatch(/<div inert="">/);
    expect(html).toContain("Ficha abierta");
    for (const codigo of [a, c]) expect(html).toContain(nombreDe(codigo));
  });

  it("HU-120 · error: en el primero la flecha anterior está deshabilitada; en el último, la siguiente", async () => {
    const primera = dialogo(await pagina(`/?ficha=${a}`))!;
    expect(primera).toMatch(/<button[^>]*aria-label="Perfil anterior"[^>]*disabled/);
    expect(primera).toMatch(/<a[^>]*aria-label="Perfil siguiente"/);
    const ultima = dialogo(await pagina(`/?ficha=${c}`))!;
    expect(ultima).toMatch(/<button[^>]*aria-label="Perfil siguiente"[^>]*disabled/);
  });

  it("HU-127: el cliente nombrado sale solo si el consentimiento lo incluye; sin él, la experiencia sin el nombre", async () => {
    const con = dialogo(await pagina(`/?ficha=${a}`))!;
    expect(con).toContain("Bancolombia · 2021–2025");
    const sin = dialogo(await pagina(`/?ficha=${b}`))!;
    expect(sin).toContain("Ingeniera de pagos");
    expect(sin).toContain("2021–2025");
    expect(sin).not.toContain("Davivienda");
  });

  it("HU-129/HU-130: es el mismo componente de la vista previa (bloques verificado y declarado) con la validación de Nivel 0", async () => {
    const ficha = dialogo(await pagina(`/?ficha=${a}`))!;
    expect(ficha).toContain("Verificado por Trycore");
    expect(ficha).toContain("Declarado por la persona");
    const enunciado = (
      await bd.instalacion.query(`SELECT enunciado_prueba FROM operacion.ficha_publicable WHERE codigo = $1`, [a])
    ).rows[0].enunciado_prueba as string;
    expect(ficha).toContain("Validación técnica");
    expect(ficha).toContain(enunciado.replace(/&/g, "&amp;"));
    // Nada de la vista previa del panel: ni marcas de bloque incompleto ni datos internos.
    expect(ficha).not.toContain("vp-marca");
  });

  it("ninguna ficha fuera de la lista: un código ajeno, uno sin publicar o uno inventado no abren nada", async () => {
    const ajeno = PERFILES_FICTICIOS.find(
      (p) => p.estado === "publicado" && ![a, b, c].includes(p.codigo),
    )!.codigo;
    for (const codigo of [ajeno, pausado, "PS-9999", "<script>"])
      expect(dialogo(await pagina(`/?ficha=${encodeURIComponent(codigo)}`)), codigo).toBeNull();
  });

  it("un publicado con un dato heredado fuera de contrato (sin trayectoria): el panel se abre y lo explica, sin datos del perfil (Release Gate R0, ux B1)", async () => {
    await bd.instalacion.query(
      `UPDATE inventario.perfil_experiencias SET vigente = false, retirada_en = now()
        WHERE perfil_id = (SELECT id FROM inventario.perfiles WHERE codigo = $1)`,
      [c],
    );
    const html = await pagina(`/?ficha=${c}`);
    expect(html).toContain(nombreDe(c));
    const panel = dialogo(html)!;
    expect(panel).toContain("Esta ficha se está actualizando");
    expect(panel).toMatch(/<b>3 de 3<\/b> · selección para ti/);
    expect(panel).toContain(`href="/#p-${c.slice(3)}" aria-label="Cerrar la ficha"`);
    expect(panel).not.toContain("Verificado por Trycore");
    expect(panel).not.toContain(nombreDe(c));
  });

  it("en el banco la ficha recorre la lista del banco y vuelve a ella al cerrar", async () => {
    const lista = await pagina(`/banco`);
    expect(lista).toContain(`href="/banco?ficha=${a}"`);
    const ficha = dialogo(await pagina(`/banco?ficha=${a}`))!;
    expect(ficha).toMatch(/de \d+<\/b> · banco de perfiles/);
    expect(ficha).toContain(`href="/banco#p-${a.slice(3)}" aria-label="Cerrar la ficha"`);
  });

  it("con un filtro aplicado, la ficha recorre solo la lista filtrada y al cerrar conserva el filtro", async () => {
    const familia = PERFILES_FICTICIOS.find((p) => p.codigo === a)!.familia;
    const enFamilia = PERFILES_FICTICIOS.filter((p) => p.estado === "publicado" && p.familia === familia);
    const q = `categoria=${encodeURIComponent(familia)}`;
    const ficha = dialogo(await pagina(`/banco?${q}&ficha=${a}`))!;
    expect(ficha).toMatch(new RegExp(`de ${enFamilia.length}</b> · banco · ${familia}`));
    expect(ficha).toContain(`href="/banco?${q.replace(/%20/g, "+")}#p-${a.slice(3)}"`);
    // Un perfil de otra familia no se abre sobre esta lista filtrada.
    const otro = PERFILES_FICTICIOS.find((p) => p.estado === "publicado" && p.familia !== familia)!.codigo;
    expect(dialogo(await pagina(`/banco?${q}&ficha=${otro}`))).toBeNull();
  });
});
