// Genera la colección Newman de EP-003 (fase api): contrato de los endpoints nuevos o cambiados del slice.
// Panel: catálogo de alcances SARO (crear, duplicado, texto de cara al cliente requerido/largo, corregir el
// texto en dos pasos con impacto, retirar en uso, 403 observadora); perfiles con SARO/DISC (fechas no
// futuras, «Falta …» con su campo al publicar, avisos de lenguaje de inventario, la pregunta D1 de
// deja_incompleto, publicado heredado incompleto HU-178); importación (plantilla y exportación con las
// columnas SARO/DISC). Portal: contrato estricto del catálogo (claves exactas, sin B.4, sin «Incompleto»)
// y la ficha renderizada (texto de cara al cliente del alcance y mes; nunca el id ni el nombre interno).
// La colección generada se versiona junto a este script: node tests/postman/generar-ep-003.mjs
import { writeFileSync } from "node:fs";

const P = "{{panel}}/api/v1";
const COOKIE = {
  admin: "__Host-csrf={{csrf}}; __Host-pp={{adminSesion}}",
  obs: "__Host-csrf={{csrf}}; __Host-pp={{obsSesion}}",
};
const st = (n) => `pm.test("status ${n}", () => pm.response.to.have.status(${n}));`;
const motivo = (m) => `pm.test("motivo ${m}", () => pm.expect(pm.response.json().motivo).to.eql("${m}"));`;
const t = (nombre, cuerpo) => `pm.test(${JSON.stringify(nombre)}, () => { const j = pm.response.json(); ${cuerpo} });`;
const th = (nombre, cuerpo) => `pm.test(${JSON.stringify(nombre)}, () => { const h = pm.response.text(); ${cuerpo} });`;
const set = (k, v) => `pm.collectionVariables.set("${k}", ${v});`;
const version = set("version", "pm.response.json().perfil.version");
const json = `pm.test("content-type json", () => pm.expect(pm.response.headers.get("content-type")).to.include("application/json"));`;
const noStore = `pm.test("cache-control private, no-store", () => pm.expect(pm.response.headers.get("cache-control")).to.include("no-store"));`;
const avisoInventario = (expr) =>
  t(`aviso de lenguaje de inventario «${expr}»`, `pm.expect(j.avisos).to.eql([{ tipo: "lenguaje_inventario", expresion: ${JSON.stringify(expr)} }]);`);
const cond = (clave, cumple) => `j.evaluacion.condiciones.find((c) => c.clave === "${clave}").cumple === ${cumple}`;
const falta = (clave, texto) =>
  t(`«${texto}» con su campo`, `const c = j.evaluacion.condiciones.find((x) => x.clave === "${clave}"); pm.expect(c.cumple).to.eql(false); pm.expect("Falta " + c.motivo).to.eql(${JSON.stringify(texto)}); pm.expect(c.campo).to.eql("${clave}");`);
const cumple = (clave) => t(`${clave} cumple`, `pm.expect(${cond(clave, true)}).to.eql(true);`);

function req(nombre, metodo, url, { cuerpo, quien = "admin", cabeceras = {}, pruebas = [], portal = false } = {}) {
  const header = portal
    ? [{ key: "x-ps-edge", value: "{{borde}}" }, { key: "cookie", value: "__Host-ps={{portalSesion}}" }]
    : [
        { key: "x-ps-edge", value: "{{borde}}" },
        { key: "cookie", value: COOKIE[quien] },
        { key: "origin", value: "{{panel}}" },
        { key: "x-ps-csrf", value: "{{csrf}}" },
      ];
  for (const [key, value] of Object.entries(cabeceras)) {
    const i = header.findIndex((h) => h.key === key);
    if (value === null) { if (i >= 0) header.splice(i, 1); continue; }
    if (i >= 0) header[i] = { key, value }; else header.push({ key, value });
  }
  if (cuerpo !== undefined) header.push({ key: "content-type", value: "application/json" });
  return {
    name: nombre,
    event: [{ listen: "test", script: { exec: pruebas } }],
    request: {
      method: metodo,
      header,
      url: url.startsWith("{{") ? url : `${P}${url}`,
      ...(cuerpo !== undefined ? { body: { mode: "raw", raw: typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo) } } : {}),
    },
  };
}
const carpeta = (name, item) => ({ name, item });
const ifm = { "if-match": '"{{version}}"' };
const releer = (n = "releer el perfil (versión vigente)") =>
  req(n, "GET", "/perfiles/{{codigo}}", { pruebas: [st(200), version] });

const base = {
  nombre: "Lorena",
  primerApellido: "Newman{{run}}",
  rolId: "{{rolId}}",
  tecnologiaIds: ["{{tecnologiaId}}"],
  seniorityId: "{{seniorityId}}",
  aniosExperiencia: 8,
  ciudadId: "{{ciudadId}}",
  modalidadTrabajoId: "{{modalidadId}}",
  disponibilidad: { opcion: "ahora" },
  modalidadPruebaId: "{{modalidadPruebaId}}",
  experiencias: [{ cargo: "Backend senior", desde: 2021, descripcion: "Pagos inmediatos; recurso disponible para asignación." }],
};
const limpio = { ...base, experiencias: [{ cargo: "QA", desde: 2020, descripcion: "Lista itemizada de pruebas de regresión." }] };
const TEXTO = "Verificamos sus antecedentes ante Policía y Procuraduría (n3).";
const LIMITE_280 = "Verificamos sus antecedentes judiciales, disciplinarios y fiscales ante las entidades oficiales. ".repeat(4).slice(0, 279) + ".";
const TEXTO_NUEVO = "Verificamos sus antecedentes ante Policía, Procuraduría y Contraloría (n3).";
const CLAVES_PERFIL_CATALOGO = ["codigo", "nombre", "primerApellido", "familia", "roles", "seniority", "aniosExperiencia", "tecnologias", "sectores", "modalidad", "pais", "disponibilidad", "selloPersonal"];
const B4 = "/\\\\?\"(foto|fotoUrl|cv|curriculum|telefono|celular|correo|email|motivacion|proyeccion|discDetalle|disc_detalle|perfilDisc|promedio|certificaciones|saroAlcanceId|saro_alcance_id|evaluacion|faltaPara|incompleto|consentimiento)\\\\?\":/i";

// ── 1. catálogo de alcances SARO: alta y validaciones (HU-177) ───────────────────────────────
const alcances = carpeta("1 · Catálogo de alcances SARO: alta", [
  req("lista el catálogo con el texto de cara al cliente", "GET", "/catalogos/alcance_saro", {
    pruebas: [st(200), json, t("valores[] con textoCliente", `pm.expect(j.valores).to.be.an("array").that.is.not.empty; j.valores.forEach((v) => { pm.expect(v).to.include.keys("id", "nombre", "activo", "textoCliente", "perfiles", "publicados"); pm.expect(v.textoCliente).to.be.a("string").and.not.empty; });`)],
  }),
  req("crear un alcance → 201", "POST", "/catalogos/alcance_saro", {
    cuerpo: { nombre: "Alcance n3-{{run}}", textoCliente: TEXTO },
    pruebas: [st(201), json, t("valor con claves exactas", `pm.expect(Object.keys(j)).to.eql(["valor"]); pm.expect(Object.keys(j.valor).sort()).to.eql(["advertencia", "familia", "id", "nombre"]); pm.expect(j.valor.nombre).to.eql("Alcance n3-" + pm.variables.get("run"));`), set("alcanceId", "pm.response.json().valor.id")],
  }),
  req("duplicado idéntico salvo mayúsculas → 409 con el existente", "POST", "/catalogos/alcance_saro", {
    cuerpo: { nombre: "ALCANCE N3-{{run}}", textoCliente: "Otro texto." },
    pruebas: [st(409), motivo("duplicado"), t("señala el existente", `pm.expect(j.existente.id).to.eql(pm.collectionVariables.get("alcanceId"));`)],
  }),
  req("sin texto de cara al cliente → 422 texto_cliente_requerido", "POST", "/catalogos/alcance_saro", {
    cuerpo: { nombre: "Alcance sin texto n3-{{run}}" },
    pruebas: [st(422), motivo("texto_cliente_requerido")],
  }),
  req("texto en blanco → 422 texto_cliente_requerido", "POST", "/catalogos/alcance_saro", {
    cuerpo: { nombre: "Alcance en blanco n3-{{run}}", textoCliente: "   " },
    pruebas: [st(422), motivo("texto_cliente_requerido")],
  }),
  req("texto de 281 caracteres → 422 texto_cliente_largo con el máximo", "POST", "/catalogos/alcance_saro", {
    cuerpo: { nombre: "Alcance largo n3-{{run}}", textoCliente: "a".repeat(281) },
    pruebas: [st(422), motivo("texto_cliente_largo"), t("maximo 280", `pm.expect(j.maximo).to.eql(280);`)],
  }),
  req("texto de exactamente 280 caracteres → 201 (límite)", "POST", "/catalogos/alcance_saro", {
    cuerpo: { nombre: "Alcance limite n3-{{run}}", textoCliente: LIMITE_280 },
    pruebas: [st(201)],
  }),
  req("entrada fuera de forma → 400", "POST", "/catalogos/alcance_saro", { cuerpo: { nombre: 7 }, pruebas: [st(400), motivo("entrada_invalida")] }),
  req("observadora crea → 403 sin_permiso", "POST", "/catalogos/alcance_saro", {
    quien: "obs",
    cuerpo: { nombre: "Alcance obs n3-{{run}}", textoCliente: TEXTO },
    pruebas: [st(403), motivo("sin_permiso")],
  }),
  req("fichas que dependen del alcance nuevo: ninguna", "GET", "/catalogos/alcance_saro/{{alcanceId}}", {
    pruebas: [st(200), t("sin publicados", `pm.expect(j.publicados).to.eql([]);`)],
  }),
]);

// ── 2. perfiles con SARO/DISC (HU-176, HU-194, D1) ───────────────────────────────────────────
const perfiles = carpeta("2 · Perfiles: SARO, DISC y avisos", [
  req("crear sin SARO/DISC, con lenguaje de inventario → 201 + aviso", "POST", "/perfiles", {
    cuerpo: base,
    pruebas: [
      st(201), json, avisoInventario("disponible para asignación"),
      t("nace en borrador con saro/disc vacíos", `pm.expect(j.perfil.estado).to.eql("borrador"); pm.expect(j.perfil.saro).to.eql({ alcance: null, fecha: null }); pm.expect(j.perfil.disc).to.eql({ fecha: null });`),
      t("evaluación con las tres condiciones nuevas sin cumplir", `["saro_alcance", "saro_fecha", "disc_fecha"].forEach((k) => pm.expect(j.perfil.evaluacion.condiciones.find((c) => c.clave === k).cumple).to.eql(false)); pm.expect(j.perfil.evaluacion.publicable).to.eql(false);`),
      set("codigo", "pm.response.json().perfil.codigo"), version,
    ],
  }),
  req("la expresión con otra escritura («ITEM») también avisa", "POST", "/perfiles", {
    cuerpo: { ...base, experiencias: [{ cargo: "QA", desde: 2020, descripcion: "Cada ITEM del backlog." }] },
    pruebas: [st(201), avisoInventario("ITEM")],
  }),
  req("dentro de otra palabra («itemizada») no avisa", "POST", "/perfiles", {
    cuerpo: limpio,
    pruebas: [st(201), t("avisos vacío", `pm.expect(j.avisos).to.eql([]);`)],
  }),
  req("fecha SARO futura → 422 con el campo, y el aviso aparte", "POST", "/perfiles", {
    cuerpo: { ...base, saroAlcanceId: "{{alcanceId}}", saroFecha: "{{manana}}", discFecha: "{{hoy}}" },
    pruebas: [st(422), motivo("fecha_verificacion_futura"), t("campo saroFecha", `pm.expect(j.campo).to.eql("saroFecha"); pm.expect(j.valor).to.eql(pm.variables.get("manana"));`), avisoInventario("disponible para asignación")],
  }),
  req("fecha DISC futura → 422 campo discFecha", "POST", "/perfiles", {
    cuerpo: { ...limpio, discFecha: "{{manana}}" },
    pruebas: [st(422), motivo("fecha_verificacion_futura"), t("campo discFecha", `pm.expect(j.campo).to.eql("discFecha"); pm.expect(j.avisos).to.eql([]);`)],
  }),
  req("fecha que no existe (31 de febrero) → 422 ilegible", "POST", "/perfiles", {
    cuerpo: { ...limpio, saroFecha: "2026-02-31" },
    pruebas: [st(422), motivo("fecha_verificacion_ilegible"), t("campo saroFecha", `pm.expect(j.campo).to.eql("saroFecha");`)],
  }),
  req("fecha SARO de hoy → 201 (límite)", "POST", "/perfiles", {
    cuerpo: { ...limpio, saroAlcanceId: "{{alcanceId}}", saroFecha: "{{hoy}}", discFecha: "{{hoy}}" },
    pruebas: [st(201), t("guarda alcance y fechas", `pm.expect(j.perfil.saro.alcance.id).to.eql(pm.collectionVariables.get("alcanceId")); pm.expect(j.perfil.saro.fecha).to.eql(pm.variables.get("hoy")); pm.expect(j.perfil.disc.fecha).to.eql(pm.variables.get("hoy"));`)],
  }),
  req("alcance como texto libre (no uuid) → 400", "POST", "/perfiles", {
    cuerpo: { ...limpio, saroAlcanceId: "Antecedentes judiciales" },
    pruebas: [st(400), motivo("entrada_invalida")],
  }),
  req("alcance que no está en el catálogo → 422 valor_no_disponible", "POST", "/perfiles", {
    cuerpo: { ...limpio, saroAlcanceId: "00000000-0000-4000-8000-000000000000" },
    pruebas: [st(422), motivo("valor_no_disponible"), t("señala la tabla", `pm.expect(j.tabla).to.eql("catalogo_alcances_saro");`)],
  }),
  req("observadora crea → 403", "POST", "/perfiles", { quien: "obs", cuerpo: limpio, pruebas: [st(403), motivo("sin_permiso")] }),
  req("registrar el consentimiento", "POST", "/perfiles/{{codigo}}/consentimiento", {
    cuerpo: { nombreApellido: true, trayectoria: true, clientes: true },
    pruebas: [st(201), version],
  }),
  req("publicar sin SARO/DISC → 409 «Falta el alcance de la verificación SARO»", "POST", "/perfiles/{{codigo}}/publicar", {
    cuerpo: {}, cabeceras: ifm,
    pruebas: [st(409), motivo("no_publicable"), falta("saro_alcance", "Falta el alcance de la verificación SARO"), falta("saro_fecha", "Falta la fecha de la verificación SARO"), falta("disc_fecha", "Falta la fecha de la evaluación DISC"), cumple("consentimiento")],
  }),
  req("guardar el alcance SARO", "PATCH", "/perfiles/{{codigo}}", {
    cuerpo: { saroAlcanceId: "{{alcanceId}}" }, cabeceras: ifm,
    pruebas: [st(200), version, t("alcance con su texto de cara al cliente", `pm.expect(j.perfil.saro.alcance).to.eql({ id: pm.collectionVariables.get("alcanceId"), nombre: "Alcance n3-" + pm.variables.get("run"), textoCliente: ${JSON.stringify(TEXTO)}, activo: true }); pm.expect(j.avisos).to.eql([]);`)],
  }),
  req("publicar sin fecha SARO → 409 «Falta la fecha de la verificación SARO»", "POST", "/perfiles/{{codigo}}/publicar", {
    cuerpo: {}, cabeceras: ifm,
    pruebas: [st(409), motivo("no_publicable"), cumple("saro_alcance"), falta("saro_fecha", "Falta la fecha de la verificación SARO")],
  }),
  req("guardar fecha SARO futura → 422 y nada escrito", "PATCH", "/perfiles/{{codigo}}", {
    cuerpo: { saroFecha: "{{manana}}" }, cabeceras: ifm,
    pruebas: [st(422), motivo("fecha_verificacion_futura")],
  }),
  req("guardar la fecha SARO", "PATCH", "/perfiles/{{codigo}}", {
    cuerpo: { saroFecha: "2026-09-15" }, cabeceras: ifm,
    pruebas: [st(200), version, t("fecha guardada", `pm.expect(j.perfil.saro.fecha).to.eql("2026-09-15");`)],
  }),
  req("publicar sin fecha DISC → 409 «Falta la fecha de la evaluación DISC»", "POST", "/perfiles/{{codigo}}/publicar", {
    cuerpo: {}, cabeceras: ifm,
    pruebas: [st(409), cumple("saro_fecha"), falta("disc_fecha", "Falta la fecha de la evaluación DISC")],
  }),
  req("guardar la fecha DISC", "PATCH", "/perfiles/{{codigo}}", {
    cuerpo: { discFecha: "2026-09-20" }, cabeceras: ifm,
    pruebas: [st(200), version, t("evaluación publicable", `pm.expect(j.perfil.disc.fecha).to.eql("2026-09-20"); pm.expect(j.perfil.evaluacion.publicable).to.eql(true);`)],
  }),
  req("publicar completo → 200 publicado", "POST", "/perfiles/{{codigo}}/publicar", {
    cuerpo: {}, cabeceras: ifm,
    pruebas: [st(200), version, t("publicado", `pm.expect(j.perfil.estado).to.eql("publicado");`)],
  }),
  req("listado: el publicado completo no lleva marca Incompleto", "GET", "/perfiles", {
    pruebas: [st(200), t("incompleto null", `const f = j.perfiles.find((p) => p.codigo === pm.collectionVariables.get("codigo")); pm.expect(f.estado).to.eql("publicado"); pm.expect(f.incompleto).to.eql(null);`)],
  }),
  req("previsualizar corregir la fecha DISC de un publicado → impacto en meses", "PATCH", "/perfiles/{{codigo}}?previsualizar", {
    cuerpo: { discFecha: "2026-08-01" }, cabeceras: ifm,
    pruebas: [st(200), t("cambio de cara al cliente", `pm.expect(Object.keys(j).sort()).to.eql(["avisos", "impacto", "perfil"]); pm.expect(j.impacto.cambios).to.deep.include({ campo: "disc", etiqueta: "Evaluación DISC", antes: "septiembre de 2026", despues: "agosto de 2026" }); pm.expect(j.perfil.disc.fecha).to.eql("2026-09-20");`)],
  }),
  req("confirmar la corrección", "PATCH", "/perfiles/{{codigo}}", {
    cuerpo: { discFecha: "2026-08-01" }, cabeceras: ifm,
    pruebas: [st(200), version, t("fecha corregida y sigue publicado", `pm.expect(j.perfil.disc.fecha).to.eql("2026-08-01"); pm.expect(j.perfil.estado).to.eql("publicado");`)],
  }),
  req("D1 · previsualizar quitar el alcance → 200 deja_incompleto con la pregunta", "PATCH", "/perfiles/{{codigo}}?previsualizar", {
    cuerpo: { saroAlcanceId: null }, cabeceras: ifm,
    pruebas: [st(200), motivo("deja_incompleto"), t("pregunta D1", `pm.expect(j.pregunta).to.eql("Este cambio deja el perfil incompleto: ¿descarto el cambio o paso el perfil a borrador?"); pm.expect(j.yaIncompleto).to.eql(false); pm.expect(j.faltaPara).to.be.a("string").and.not.empty;`)],
  }),
  req("D1 · confirmar sin responder la pregunta → 409", "PATCH", "/perfiles/{{codigo}}", {
    cuerpo: { saroAlcanceId: null }, cabeceras: ifm,
    pruebas: [st(409), motivo("deja_incompleto")],
  }),
  req("D1 · resolución descartar → 200 y nada escrito", "PATCH", "/perfiles/{{codigo}}?resolucion=descartar", {
    cuerpo: { saroAlcanceId: null }, cabeceras: ifm,
    pruebas: [st(200), t("descartado, alcance intacto", `pm.expect(j.descartado).to.eql(true); pm.expect(j.perfil.saro.alcance.id).to.eql(pm.collectionVariables.get("alcanceId")); pm.expect(j.perfil.estado).to.eql("publicado");`)],
  }),
  req("observadora edita → 403", "PATCH", "/perfiles/{{codigo}}", { quien: "obs", cuerpo: { discFecha: "2026-08-02" }, cabeceras: ifm, pruebas: [st(403), motivo("sin_permiso")] }),
]);

// ── 3. portal: contrato estricto del catálogo y ficha (HU-176, HU-081, B.4) ────────────────────
const portal = carpeta("3 · Portal: catálogo y ficha", [
  req("catálogo sin sesión → 401 sin datos", "GET", "{{portal}}/api/v1/catalogo", {
    portal: true, cabeceras: { cookie: null },
    pruebas: [st(401), motivo("sin_sesion"), `pm.test("sin perfiles", () => pm.expect(pm.response.text()).to.not.include("codigo"));`],
  }),
  req("catálogo sin cabecera de borde → 403", "GET", "{{portal}}/api/v1/catalogo", {
    portal: true, cabeceras: { "x-ps-edge": null },
    pruebas: [st(403), `pm.test("sin perfiles", () => pm.expect(pm.response.text()).to.not.include("PS-"));`],
  }),
  req("catálogo con sesión → 200, claves exactas, sin B.4 ni «Incompleto»", "GET", "{{portal}}/api/v1/catalogo", {
    portal: true,
    pruebas: [
      st(200), json, noStore,
      `pm.test("nosniff", () => pm.expect(pm.response.headers.get("x-content-type-options")).to.eql("nosniff"));`,
      t("solo {perfiles}", `pm.expect(Object.keys(j)).to.eql(["perfiles"]); pm.expect(j.perfiles).to.be.an("array").that.is.not.empty;`),
      t("cada perfil con las 13 claves exactas", `const k = ${JSON.stringify(CLAVES_PERFIL_CATALOGO)}; j.perfiles.forEach((p) => pm.expect(Object.keys(p)).to.have.members(k).and.have.lengthOf(k.length));`),
      t("selloPersonal ≤ 3 sin vacíos", `j.perfiles.forEach((p) => { pm.expect(p.selloPersonal.length).to.be.at.most(3); p.selloPersonal.forEach((s) => pm.expect(s.trim()).to.not.eql("")); });`),
      th("ni Incompleto ni falta en el cuerpo", `pm.expect(h).to.not.match(/ncomplet|"falta/i);`),
      th("sin claves B.4 ni internas", `pm.expect(h).to.not.match(${B4});`),
      t("el perfil publicado de la corrida llega", `pm.expect(j.perfiles.map((p) => p.codigo)).to.include(pm.collectionVariables.get("codigo"));`),
    ],
  }),
  req("ficha del perfil: texto del alcance y mes; nunca id ni nombre interno", "GET", "{{portal}}/banco?ficha={{codigo}}", {
    portal: true,
    pruebas: [
      st(200),
      `pm.test("html", () => pm.expect(pm.response.headers.get("content-type")).to.include("text/html"));`, noStore,
      th("Verificación de seguridad SARO con el texto de cara al cliente y el mes", `pm.expect(h).to.include("Verificación de seguridad SARO"); pm.expect(h).to.include(${JSON.stringify(TEXTO + " · septiembre de 2026")});`),
      th("Evaluación DISC con el mes", `pm.expect(h).to.include("Evaluación DISC"); pm.expect(h).to.include("agosto de 2026");`),
      th("ni el id ni el nombre interno del alcance", `pm.expect(h).to.not.include(pm.collectionVariables.get("alcanceId")); pm.expect(h).to.not.include("Alcance n3-" + pm.variables.get("run"));`),
      th("ni fecha exacta de las verificaciones", `pm.expect(h).to.not.include("2026-09-15"); pm.expect(h).to.not.include("2026-08-01");`),
      th("sin claves B.4 ni internas ni «Incompleto»", `pm.expect(h).to.not.match(${B4}); pm.expect(h).to.not.match(/ncomplet/i);`),
    ],
  }),
]);

// ── 4. corregir el texto de un alcance en uso y retirarlo (HU-177 edge) ─────────────────────────
const alcanceEnUso = carpeta("4 · Alcance SARO en uso: corregir y retirar", [
  req("previsualizar el texto nuevo → impacto con las fichas publicadas", "PATCH", "/catalogos/alcance_saro/{{alcanceId}}?previsualizar", {
    cuerpo: { nombre: "Alcance n3-{{run}}", textoCliente: TEXTO_NUEVO },
    pruebas: [st(200), t("impacto exacto", `pm.expect(Object.keys(j)).to.eql(["impacto"]); pm.expect(Object.keys(j.impacto).sort()).to.eql(["publicados", "textoCliente"]); pm.expect(j.impacto.textoCliente).to.eql(${JSON.stringify(TEXTO)}); pm.expect(j.impacto.publicados.map((p) => p.codigo)).to.include(pm.collectionVariables.get("codigo")); j.impacto.publicados.forEach((p) => pm.expect(Object.keys(p).sort()).to.eql(["codigo", "nombre"]));`)],
  }),
  req("previsualizar no escribió: el catálogo conserva el texto", "GET", "/catalogos/alcance_saro", {
    pruebas: [st(200), t("texto anterior", `pm.expect(j.valores.find((v) => v.id === pm.collectionVariables.get("alcanceId")).textoCliente).to.eql(${JSON.stringify(TEXTO)});`)],
  }),
  req("previsualizar en un catálogo sin texto de cara al cliente → 409 no_aplica", "PATCH", "/catalogos/tecnologia/{{tecnologiaId}}?previsualizar", {
    cuerpo: { nombre: "Kafka" }, pruebas: [st(409), motivo("no_aplica")],
  }),
  req("previsualizar un alcance inexistente → 404", "PATCH", "/catalogos/alcance_saro/00000000-0000-4000-8000-000000000000?previsualizar", {
    cuerpo: { nombre: "x", textoCliente: "y" }, pruebas: [st(404), motivo("no_existe")],
  }),
  req("confirmar con texto de 281 → 422 texto_cliente_largo", "PATCH", "/catalogos/alcance_saro/{{alcanceId}}", {
    cuerpo: { nombre: "Alcance n3-{{run}}", textoCliente: "c".repeat(281) }, pruebas: [st(422), motivo("texto_cliente_largo")],
  }),
  req("observadora corrige → 403", "PATCH", "/catalogos/alcance_saro/{{alcanceId}}", {
    quien: "obs", cuerpo: { nombre: "Alcance n3-{{run}}", textoCliente: TEXTO_NUEVO }, pruebas: [st(403), motivo("sin_permiso")],
  }),
  req("confirmar el texto nuevo → 200", "PATCH", "/catalogos/alcance_saro/{{alcanceId}}", {
    cuerpo: { nombre: "Alcance n3-{{run}}", textoCliente: TEXTO_NUEVO },
    pruebas: [st(200), t("valor", `pm.expect(j.valor.id).to.eql(pm.collectionVariables.get("alcanceId"));`)],
  }),
  req("la ficha del portal ya muestra el texto nuevo", "GET", "{{portal}}/banco?ficha={{codigo}}", {
    portal: true, pruebas: [st(200), th("texto nuevo", `pm.expect(h).to.include(${JSON.stringify(TEXTO_NUEVO + " · septiembre de 2026")}); pm.expect(h).to.not.include(${JSON.stringify(TEXTO)});`)],
  }),
  req("observadora retira → 403", "POST", "/catalogos/alcance_saro/{{alcanceId}}/desactivar", { quien: "obs", cuerpo: {}, pruebas: [st(403), motivo("sin_permiso")] }),
  req("retirar el alcance en uso → 200 con sus dependientes", "POST", "/catalogos/alcance_saro/{{alcanceId}}/desactivar", {
    cuerpo: {},
    pruebas: [st(200), t("inactivo y en uso", `pm.expect(j.id).to.eql(pm.collectionVariables.get("alcanceId")); pm.expect(j.activo).to.eql(false); pm.expect(j.dependientes).to.be.at.least(1);`)],
  }),
  req("retirado: la ficha publicada sigue mostrando su texto", "GET", "{{portal}}/banco?ficha={{codigo}}", {
    portal: true, pruebas: [st(200), th("texto del alcance retirado", `pm.expect(h).to.include(${JSON.stringify(TEXTO_NUEVO)});`)],
  }),
  req("retirado: no se puede asignar a un perfil nuevo → 422", "POST", "/perfiles", {
    cuerpo: { ...limpio, saroAlcanceId: "{{alcanceId}}" }, pruebas: [st(422), motivo("valor_no_disponible")],
  }),
  req("reactivar el alcance", "POST", "/catalogos/alcance_saro/{{alcanceId}}/reactivar", {
    cuerpo: {}, pruebas: [st(200), t("activo", `pm.expect(j.activo).to.eql(true);`)],
  }),
]);

// ── 5. importación: plantilla y exportación con SARO/DISC (HU-191) ─────────────────────────────
const COLS = ["Modalidad de prueba (del catálogo de su familia)", "Alcance de la verificación SARO (del catálogo)", "Fecha de la verificación SARO (AAAA-MM-DD o DD/MM/AAAA)", "Fecha de la evaluación DISC (AAAA-MM-DD o DD/MM/AAAA)"];
const cabeceraCsv = th("columnas SARO/DISC tras la modalidad de prueba", `const c = h.split("\\n")[0]; pm.expect(c).to.include(${JSON.stringify(COLS.join(","))});`);
const importacion = carpeta("5 · Importación: plantilla y exportación", [
  req("plantilla CSV con las columnas SARO/DISC", "GET", "/importacion/plantilla?formato=csv", {
    pruebas: [st(200), `pm.test("text/csv adjunto", () => { pm.expect(pm.response.headers.get("content-type")).to.include("text/csv"); pm.expect(pm.response.headers.get("content-disposition")).to.match(/^attachment; filename="plantilla-importacion-\\d{4}-\\d{2}-\\d{2}\\.csv"$/); });`, noStore, cabeceraCsv],
  }),
  req("plantilla JSON: la fila de alta trae saroAlcance, saroFecha y discFecha", "GET", "/importacion/plantilla?formato=json", {
    pruebas: [st(200), t("fila de alta", `pm.expect(j).to.be.an("array"); const alta = j.find((f) => f.nombre); pm.expect(alta).to.include.keys("saroAlcance", "saroFecha", "discFecha"); pm.expect(alta.saroFecha).to.match(/^\\d{4}-\\d{2}-\\d{2}$/); pm.expect(alta.discFecha).to.match(/^\\d{4}-\\d{2}-\\d{2}$/); pm.expect(alta).to.not.have.any.keys("saroAlcanceId", "foto", "cv", "correo", "telefono");`)],
  }),
  req("plantilla en otro formato → 400", "GET", "/importacion/plantilla?formato=xlsx", { pruebas: [st(400)] }),
  req("observadora pide la plantilla → 403", "GET", "/importacion/plantilla?formato=csv", { quien: "obs", pruebas: [st(403), motivo("sin_permiso")] }),
  req("exportar CSV: el perfil sale con alcance (nombre interno) y fechas", "GET", "/importacion/exportar?formato=csv", {
    pruebas: [st(200), `pm.test("text/csv adjunto", () => { pm.expect(pm.response.headers.get("content-type")).to.include("text/csv"); pm.expect(pm.response.headers.get("content-disposition")).to.include("attachment"); });`, cabeceraCsv,
      th("fila del perfil", `const f = h.split("\\n").find((l) => l.startsWith(pm.collectionVariables.get("codigo") + ",")); pm.expect(f).to.include(",Prueba práctica revisada por un arquitecto,Alcance n3-" + pm.variables.get("run") + ",2026-09-15,2026-08-01,");`)],
  }),
  req("exportar JSON: saroAlcance, saroFecha y discFecha del perfil", "GET", "/importacion/exportar?formato=json", {
    pruebas: [st(200), t("item del perfil", `const p = j.find((x) => x.codigo === pm.collectionVariables.get("codigo")); pm.expect(p.saroAlcance).to.eql("Alcance n3-" + pm.variables.get("run")); pm.expect(p.saroFecha).to.eql("2026-09-15"); pm.expect(p.discFecha).to.eql("2026-08-01"); pm.expect(p).to.not.have.any.keys("saroAlcanceId", "foto", "cv");`)],
  }),
  req("observadora exporta → 403", "GET", "/importacion/exportar?formato=csv", { quien: "obs", pruebas: [st(403), motivo("sin_permiso")] }),
]);

// ── 6. publicado heredado incompleto (HU-178, D62) ────────────────────────────────────────────
const heredado = carpeta("6 · Publicado heredado sin SARO (HU-178)", [
  req("preparar: quitar el SARO por debajo de la app (ayudante)", "POST", "{{ayudante}}/heredado?codigo={{codigo}}", {
    portal: true, pruebas: [st(200), t("una fila", `pm.expect(j.filas).to.eql(1);`)],
  }),
  req("listado: marca «Incompleto: falta la verificación SARO (alcance y fecha)»", "GET", "/perfiles", {
    pruebas: [st(200), t("marca exacta", `const f = j.perfiles.find((p) => p.codigo === pm.collectionVariables.get("codigo")); pm.expect(f.estado).to.eql("publicado"); pm.expect(f.incompleto).to.eql("Incompleto: falta la verificación SARO (alcance y fecha)");`)],
  }),
  releer(),
  req("editar sin completarlo → 200 deja_incompleto: no se publica mientras falte", "PATCH", "/perfiles/{{codigo}}?previsualizar", {
    cuerpo: { aniosExperiencia: 9 }, cabeceras: ifm,
    pruebas: [st(200), motivo("deja_incompleto"), t("pregunta de HU-178", `pm.expect(j.yaIncompleto).to.eql(true); pm.expect(j.faltaPara).to.eql("la verificación SARO (alcance y fecha)"); pm.expect(j.pregunta).to.eql("Este cambio no se puede publicar mientras falte la verificación SARO (alcance y fecha): ¿descarto el cambio o paso el perfil a borrador?");`)],
  }),
  req("portal: el catálogo lo sirve sin marca Incompleto", "GET", "{{portal}}/api/v1/catalogo", {
    portal: true,
    pruebas: [st(200), t("presente con claves exactas", `const p = j.perfiles.find((x) => x.codigo === pm.collectionVariables.get("codigo")); pm.expect(Object.keys(p)).to.have.members(${JSON.stringify(CLAVES_PERFIL_CATALOGO)});`), th("sin Incompleto", `pm.expect(h).to.not.match(/ncomplet|"falta/i);`)],
  }),
  req("portal: la ficha omite el SARO sin marca y conserva el DISC", "GET", "{{portal}}/banco?ficha={{codigo}}", {
    portal: true,
    pruebas: [st(200), th("sin fila SARO ni marca", `pm.expect(h).to.not.include("Verificación de seguridad SARO"); pm.expect(h).to.not.match(/ncomplet|Falta la/i); pm.expect(h).to.include("Evaluación DISC"); pm.expect(h).to.include("agosto de 2026");`)],
  }),
  req("completar lo que falta: previsualizar", "PATCH", "/perfiles/{{codigo}}?previsualizar", {
    cuerpo: { saroAlcanceId: "{{alcanceId}}", saroFecha: "2026-09-15" }, cabeceras: ifm,
    pruebas: [st(200), t("impacto, sin pregunta", `pm.expect(j.motivo).to.be.undefined; pm.expect(j.impacto.cambios.map((c) => c.campo)).to.include("seguridad");`)],
  }),
  req("completar lo que falta: confirmar → publicado completo", "PATCH", "/perfiles/{{codigo}}", {
    cuerpo: { saroAlcanceId: "{{alcanceId}}", saroFecha: "2026-09-15" }, cabeceras: ifm,
    pruebas: [st(200), version, t("publicable", `pm.expect(j.perfil.estado).to.eql("publicado"); pm.expect(j.perfil.evaluacion.publicable).to.eql(true);`)],
  }),
  req("listado: ya sin marca", "GET", "/perfiles", {
    pruebas: [st(200), t("incompleto null", `pm.expect(j.perfiles.find((p) => p.codigo === pm.collectionVariables.get("codigo")).incompleto).to.eql(null);`)],
  }),
  req("D1 · pasar a borrador (resolución a_borrador) sale del portal", "PATCH", "/perfiles/{{codigo}}?resolucion=a_borrador", {
    cuerpo: { saroAlcanceId: null }, cabeceras: ifm,
    pruebas: [st(200), t("borrador", `pm.expect(j.perfil.estado).to.eql("borrador");`)],
  }),
  req("portal: el perfil en borrador ya no está en el catálogo", "GET", "{{portal}}/api/v1/catalogo", {
    portal: true, pruebas: [st(200), t("ausente", `pm.expect(j.perfiles.map((p) => p.codigo)).to.not.include(pm.collectionVariables.get("codigo"));`)],
  }),
]);

const coleccion = {
  info: {
    name: "EP-003 · Evidencia del perfil (contrato API)",
    description: "Generada por tests/postman/generar-ep-003.mjs. Correr con tests/postman/correr-ep-003.sh (BD aislada ps_ep003, portal :3210, panel :3211).",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [{ key: "codigo", value: "" }, { key: "version", value: "" }, { key: "alcanceId", value: "" }],
  item: [alcances, perfiles, portal, alcanceEnUso, importacion, heredado],
};
writeFileSync(new URL("./ep-003.postman_collection.json", import.meta.url), JSON.stringify(coleccion, null, 1) + "\n");
console.log(`ep-003: ${coleccion.item.reduce((n, c) => n + c.item.length, 0)} peticiones`);
