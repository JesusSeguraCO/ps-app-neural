// Genera la colección Newman de EP-006 (tarea 11.2): pruebas de contrato de todos los endpoints nuevos del
// panel, por recurso, con el código de estado, la forma de la respuesta y los motivos de rechazo; y una
// carpeta transversal con la observadora (403 en todo lo que escribe), sin sesión (401) y sin CSRF (403).
// La colección generada se versiona junto a este script: node tests/postman/generar-ep-006.mjs
import { writeFileSync } from "node:fs";

const P = "{{panel}}/api/v1";
const COOKIE = {
  admin: "__Host-csrf={{csrf}}; __Host-pp={{adminSesion}}",
  obs: "__Host-csrf={{csrf}}; __Host-pp={{obsSesion}}",
  nadie: "__Host-csrf={{csrf}}",
  sinCsrf: "__Host-pp={{adminSesion}}",
};

const st = (n) => `pm.test("${n}", () => pm.response.to.have.status(${n}));`;
const motivo = (m) =>
  `pm.test("motivo ${m}", () => pm.expect(pm.response.json().motivo).to.eql("${m}"));`;
const tiene = (ruta) =>
  `pm.test("trae ${ruta}", () => pm.expect(${expr(ruta)}).to.not.be.undefined);`;
const guardar = (nombre, ruta) => `pm.collectionVariables.set("${nombre}", ${expr(ruta)});`;
const expr = (ruta) => `pm.response.json()${ruta.split(".").map((p) => (/^\d+$/.test(p) ? `[${p}]` : `.${p}`)).join("")}`;
const sinCuerpoDeDatos = `pm.test("sin datos", () => pm.expect(pm.response.text().length).to.be.below(200));`;

function req(nombre, metodo, ruta, { cuerpo, quien = "admin", cabeceras = {}, pruebas = [], antes } = {}) {
  const header = [
    { key: "cookie", value: COOKIE[quien] },
    { key: "origin", value: "{{panel}}" },
    ...(quien === "sinCsrf" ? [] : [{ key: "x-ps-csrf", value: "{{csrf}}" }]),
    ...Object.entries(cabeceras).map(([key, value]) => ({ key, value })),
  ];
  if (cuerpo !== undefined) header.push({ key: "content-type", value: "application/json" });
  return {
    name: nombre,
    event: [
      ...(antes ? [{ listen: "prerequest", script: { exec: antes.split("\n") } }] : []),
      { listen: "test", script: { exec: pruebas } },
    ],
    request: {
      method: metodo,
      header,
      url: `${P}${ruta}`,
      ...(cuerpo !== undefined
        ? { body: { mode: "raw", raw: typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo, null, 1) } }
        : {}),
    },
  };
}
const carpeta = (name, item) => ({ name, item });

const perfilCompleto = (extra = {}) => ({
  nombre: "Lorena",
  primerApellido: "Newman",
  rolId: "{{rolId}}",
  tecnologiaIds: ["{{tecnologiaId}}"],
  seniorityId: "{{seniorityId}}",
  aniosExperiencia: 8,
  ciudadId: "{{ciudadId}}",
  modalidadTrabajoId: "{{modalidadId}}",
  disponibilidad: { opcion: "ahora" },
  modalidadPruebaId: "{{modalidadPruebaId}}",
  experiencias: [{ cargo: "Backend senior", desde: 2021, descripcion: "Pagos inmediatos." }],
  ...extra,
});
const reporte = (revisado) =>
  `{"id":"{{borradorId}}","enunciadoReto":{{enunciado}},"entregables":{{entregables}},"criterios":{{criterios}},"evaluador":"Célula de arquitectura","fecha":"{{hoy}}","resultado":"Aprobada, nivel senior"${revisado === undefined ? "" : `,"revisado":${revisado}`}}`;

// ── catálogos (HU-089, HU-143) ──────────────────────────────────────────────────────────────
const catalogos = carpeta("Catálogos", [
  req("lista el catálogo de tecnologías", "GET", "/catalogos/tecnologia", { pruebas: [st(200), tiene("valores")] }),
  req("coincidencias para elegir (?q=)", "GET", "/catalogos/tecnologia?q=Jav", { pruebas: [st(200), tiene("valores")] }),
  req("tipo de catálogo inexistente → 404", "GET", "/catalogos/planeta", { pruebas: [st(404)] }),
  req("crear un valor → 201", "POST", "/catalogos/tecnologia", {
    cuerpo: { nombre: "Elixir {{run}}", grupo: "Lenguaje" },
    pruebas: [st(201), tiene("valor.id"), guardar("valorId", "valor.id")],
  }),
  req("duplicado salvo tildes y mayúsculas → 409", "POST", "/catalogos/tecnologia", {
    cuerpo: { nombre: "ELIXIR {{run}}" },
    pruebas: [st(409), motivo("duplicado")],
  }),
  req("entrada inválida → 400", "POST", "/catalogos/tecnologia", { cuerpo: { nombre: 7 }, pruebas: [st(400)] }),
  req("fichas que dependen del valor", "GET", "/catalogos/tecnologia/{{valorId}}", { pruebas: [st(200)] }),
  req("editar el nombre", "PATCH", "/catalogos/tecnologia/{{valorId}}", {
    cuerpo: { nombre: "Elixir OTP {{run}}", grupo: "Lenguaje" },
    pruebas: [st(200)],
  }),
  req("desactivar", "POST", "/catalogos/tecnologia/{{valorId}}/desactivar", { cuerpo: {}, pruebas: [st(200)] }),
  req("reactivar", "POST", "/catalogos/tecnologia/{{valorId}}/reactivar", { cuerpo: {}, pruebas: [st(200)] }),
  req("previsualizar la fusión no escribe", "POST", "/catalogos/tecnologia/{{valorId}}/fusionar?previsualizar", {
    cuerpo: { destinoId: "{{javaId}}" },
    pruebas: [st(200), tiene("impacto")],
  }),
  req("fusionar consigo mismo → 409", "POST", "/catalogos/tecnologia/{{valorId}}/fusionar", {
    cuerpo: { destinoId: "{{valorId}}" },
    pruebas: [st(409), motivo("mismo_valor")],
  }),
  req("valor inexistente → 404", "POST", "/catalogos/tecnologia/00000000-0000-4000-8000-000000000000/desactivar", {
    cuerpo: {},
    pruebas: [st(404)],
  }),
]);

// ── léxico (HU-139) ─────────────────────────────────────────────────────────────────────────
const lexico = carpeta("Léxico", [
  req("guardar un término con su equivalencia → 201", "POST", "/lexico", {
    cuerpo: { termino: "bancos {{run}}", sinonimos: [], tipo: "sector", valores: ["Banca"] },
    pruebas: [st(201)],
  }),
  req("valor que no existe en el catálogo → 422", "POST", "/lexico", {
    cuerpo: { termino: "x {{run}}", sinonimos: [], tipo: "sector", valores: ["Astronáutica"] },
    pruebas: [st(422)],
  }),
  req("aprobar una propuesta tal cual", "POST", "/lexico/propuestas/{{propuestaAprobar}}/aprobar", {
    cuerpo: {},
    pruebas: [st(200)],
  }),
  req("aprobarla otra vez → 409", "POST", "/lexico/propuestas/{{propuestaAprobar}}/aprobar", {
    cuerpo: {},
    pruebas: [st(409), motivo("ya_decidida")],
  }),
  req("rechazar otra propuesta", "POST", "/lexico/propuestas/{{propuestaRechazar}}/rechazar", { cuerpo: {}, pruebas: [st(200)] }),
  req("propuesta inexistente → 404", "POST", "/lexico/propuestas/00000000-0000-4000-8000-000000000000/rechazar", {
    cuerpo: {},
    pruebas: [st(404)],
  }),
  req("mandar una candidata a la agenda de reclutamiento", "POST", "/lexico/candidatas/{{candidataId}}", {
    cuerpo: { destino: "agenda_reclutamiento" },
    pruebas: [st(200), `pm.test("destino", () => pm.expect(pm.response.json().destino).to.eql("agenda_reclutamiento"));`],
  }),
  req("decidirla otra vez → 409", "POST", "/lexico/candidatas/{{candidataId}}", {
    cuerpo: { destino: "descartada" },
    pruebas: [st(409)],
  }),
  req("destino inválido → 400", "POST", "/lexico/candidatas/{{candidataId}}", {
    cuerpo: { destino: "lexico" },
    pruebas: [st(400)],
  }),
]);

// ── perfiles (HU-125–HU-136, HU-140, HU-124) ────────────────────────────────────────────────
const version = (nombre = "version") => [guardar(nombre, "perfil.version")];
const perfiles = carpeta("Perfiles", [
  req("listado del inventario", "GET", "/perfiles", { pruebas: [st(200)] }),
  req("crear un perfil → 201 en borrador", "POST", "/perfiles", {
    cuerpo: perfilCompleto(),
    pruebas: [
      st(201),
      `pm.test("borrador", () => pm.expect(pm.response.json().perfil.estado).to.eql("borrador"));`,
      guardar("codigo", "perfil.codigo"),
      ...version(),
    ],
  }),
  req("un campo de la lista negra B.4 → 400", "POST", "/perfiles", {
    cuerpo: perfilCompleto({ foto: "x.jpg" }),
    pruebas: [st(400)],
  }),
  req("un valor que no está en el catálogo → 422", "POST", "/perfiles", {
    cuerpo: perfilCompleto({ rolId: "00000000-0000-4000-8000-000000000000" }),
    pruebas: [st(422)],
  }),
  req("leer el perfil con lo que le falta", "GET", "/perfiles/{{codigo}}", { pruebas: [st(200), tiene("perfil.evaluacion")] }),
  req("perfil inexistente → 404", "GET", "/perfiles/PS-9999", { pruebas: [st(404)] }),
  req("guardar sin la versión abierta → 428", "PATCH", "/perfiles/{{codigo}}", {
    cuerpo: { aniosExperiencia: 9 },
    pruebas: [st(428), motivo("falta_version")],
  }),
  req("guardar con la versión abierta", "PATCH", "/perfiles/{{codigo}}", {
    cuerpo: { aniosExperiencia: 9 },
    cabeceras: { "if-match": '"{{version}}"' },
    pruebas: [st(200), ...version()],
  }),
  req("guardar con una versión vieja → 409", "PATCH", "/perfiles/{{codigo}}", {
    cuerpo: { aniosExperiencia: 10 },
    cabeceras: { "if-match": '"1"' },
    pruebas: [st(409)],
  }),
  req("publicar sin consentimiento → 409 con lo que falta", "POST", "/perfiles/{{codigo}}/publicar", {
    cuerpo: {},
    cabeceras: { "if-match": '"{{version}}"' },
    pruebas: [st(409), motivo("no_publicable")],
  }),
  req("registrar el consentimiento → 201", "POST", "/perfiles/{{codigo}}/consentimiento", {
    cuerpo: { nombreApellido: true, trayectoria: true, clientes: true },
    pruebas: [st(201), ...version()],
  }),
  req("consentimiento no nominal → 422", "POST", "/perfiles/{{codigo}}/consentimiento", {
    cuerpo: { nombreApellido: false, trayectoria: true, clientes: false },
    pruebas: [st(422)],
  }),
  req("pedir el borrador del reporte de validación", "POST", "/perfiles/{{codigo}}/validacion", {
    cuerpo: {},
    pruebas: [
      st(200),
      guardar("borradorId", "borrador.id"),
      `pm.collectionVariables.set("enunciado", JSON.stringify(pm.response.json().borrador.enunciadoReto));`,
      `pm.collectionVariables.set("entregables", JSON.stringify(pm.response.json().borrador.entregables));`,
      `pm.collectionVariables.set("criterios", JSON.stringify(pm.response.json().borrador.criterios));`,
    ],
  }),
  req("leer el borrador pendiente", "GET", "/perfiles/{{codigo}}/validacion", { pruebas: [st(200), tiene("borrador.id")] }),
  req("guardar el borrador sin confirmar", "PATCH", "/perfiles/{{codigo}}/validacion", { cuerpo: reporte(), pruebas: [st(200)] }),
  req("confirmar sin «Revisé cada campo» → 422", "POST", "/perfiles/{{codigo}}/validacion/confirmar", {
    cuerpo: reporte(false),
    pruebas: [st(422)],
  }),
  req("confirmar el reporte", "POST", "/perfiles/{{codigo}}/validacion/confirmar", {
    cuerpo: reporte(true),
    pruebas: [st(200), ...version()],
  }),
  req("descartar un borrador ya resuelto → 409", "POST", "/perfiles/{{codigo}}/validacion/descartar", {
    cuerpo: { id: "{{borradorId}}" },
    pruebas: [st(409), motivo("borrador_resuelto")],
  }),
  req("publicar sin versión → 428", "POST", "/perfiles/{{codigo}}/publicar", { cuerpo: {}, pruebas: [st(428)] }),
  req("publicar con la versión abierta", "POST", "/perfiles/{{codigo}}/publicar", {
    cuerpo: {},
    cabeceras: { "if-match": '"{{version}}"' },
    pruebas: [st(200), `pm.test("publicado", () => pm.expect(pm.response.json().perfil.estado).to.eql("publicado"));`],
  }),
  req("publicar en bloque: un resultado por perfil", "POST", "/perfiles/publicar", {
    cuerpo: { codigos: ["{{codigo}}", "PS-0142"] },
    pruebas: [st(200), tiene("resultados")],
  }),
  req("publicar en bloque sin códigos válidos → 400", "POST", "/perfiles/publicar", {
    cuerpo: { codigos: ["x"] },
    pruebas: [st(400)],
  }),
  req("disponibilidad en bloque", "POST", "/perfiles/disponibilidad", {
    cuerpo: { codigos: ["{{codigo}}"], disponibilidad: { opcion: "dos_semanas" } },
    pruebas: [st(200), tiene("resultados")],
  }),
  req("pausar con un motivo del catálogo", "POST", "/perfiles/{{codigo}}/pausar", {
    cuerpo: { motivoId: "{{motivoPausaId}}" },
    pruebas: [st(200)],
  }),
  req("pausar un pausado → 409", "POST", "/perfiles/{{codigo}}/pausar", {
    cuerpo: { motivoId: "{{motivoPausaId}}" },
    pruebas: [st(409), motivo("transicion_invalida")],
  }),
  req("quitar la disponibilidad que contradice la pausa", "POST", "/perfiles/{{codigo}}/quitar-disponibilidad", {
    cuerpo: {},
    pruebas: [st(200)],
  }),
  req("reactivar con su disponibilidad", "POST", "/perfiles/{{codigo}}/reactivar", {
    cuerpo: { disponibilidad: { opcion: "ahora" } },
    pruebas: [st(200)],
  }),
  req("reactivar un publicado → 409", "POST", "/perfiles/{{codigo}}/reactivar", {
    cuerpo: { disponibilidad: { opcion: "ahora" } },
    pruebas: [st(409), motivo("transicion_invalida")],
  }),
  req("quitar disponibilidad a un publicado → 409", "POST", "/perfiles/{{codigo}}/quitar-disponibilidad", {
    cuerpo: {},
    pruebas: [st(409), motivo("no_aplica")],
  }),
  req("usar la liberación sin colocación → 409", "POST", "/perfiles/{{codigo}}/usar-liberacion", {
    cuerpo: {},
    pruebas: [st(409), motivo("no_aplica")],
  }),
  req("avisar a Talento Humano (la observadora)", "POST", "/perfiles/{{codigo}}/avisar", {
    cuerpo: { nota: "Cambió de ciudad." },
    quien: "obs",
    pruebas: [st(202)],
  }),
  req("avisar sobre un perfil inexistente → 404", "POST", "/perfiles/PS-9999/avisar", { cuerpo: {}, quien: "obs", pruebas: [st(404)] }),
]);

// ── colocados (HU-137, HU-150) ──────────────────────────────────────────────────────────────
const colocados = carpeta("Colocados", [
  req("registrar un colocado", "POST", "/colocados", {
    cuerpo: { codigo: "{{codigo}}", cuenta: "Bancolombia", inicio: "{{hoy}}", liberacion: "{{enSesenta}}" },
    pruebas: [st(200)],
  }),
  req("ya colocado → 409", "POST", "/colocados", {
    cuerpo: { codigo: "{{codigo}}", cuenta: "Sura", inicio: "{{hoy}}", liberacion: "{{enSesenta}}" },
    pruebas: [st(409), motivo("ya_colocado")],
  }),
  req("fecha que no existe → 422", "POST", "/colocados", {
    cuerpo: { codigo: "{{codigo}}", cuenta: "Sura", inicio: "2026-02-30", liberacion: "{{enSesenta}}" },
    pruebas: [st(422), motivo("fecha_invalida")],
  }),
  req("usar la fecha de liberación como disponibilidad", "POST", "/perfiles/{{codigo}}/usar-liberacion", {
    cuerpo: {},
    pruebas: [`pm.test("200 o 409 no_aplica (ya coincide)", () => pm.expect([200, 409]).to.include(pm.response.code));`],
  }),
  req("carga de Operaciones con una diferencia → 201", "POST", "/colocados/cargas", {
    cuerpo: {
      archivo: "asignaciones-{{run}}.csv",
      contenido: "Código del perfil,Cliente,Fecha de inicio,Fecha de liberación\n{{codigo}},Bancolombia,{{hoy}},{{enNoventa}}",
    },
    pruebas: [st(201), tiene("carga")],
  }),
  req("otro formato → 422 sin escribir", "POST", "/colocados/cargas", {
    cuerpo: { archivo: "asignaciones.xlsx", contenido: "PK\u0003\u0004binario" },
    pruebas: [st(422), motivo("formato_no_admitido")],
  }),
  req("faltan columnas → 422", "POST", "/colocados/cargas", {
    cuerpo: { archivo: "a.csv", contenido: "Código del perfil,Cliente\nPS-0142,Sura" },
    pruebas: [st(422), motivo("faltan_columnas")],
  }),
  // No hay un GET de diferencias: la pestaña Colocados las trae en los datos de la página.
  {
    name: "la pestaña Colocados muestra la diferencia (se toma su id)",
    event: [
      {
        listen: "test",
        script: {
          exec: [
            st(200),
            `const html = pm.response.text().replace(/\\\\"/g, '"');`,
            // El botón «Decidir» recibe { id, nombre } del perfil (Lorena Newman).
            `const re = /"id":"([0-9a-f-]{36})","nombre":"Lorena Newman"/;`,
            `const hallado = html.match(re);`,
            `pm.test("diferencia del perfil", () => pm.expect(hallado).to.not.be.null);`,
            `if (hallado) pm.collectionVariables.set("diferenciaId", hallado[1]);`,
          ],
        },
      },
    ],
    request: { method: "GET", header: [{ key: "cookie", value: COOKIE.admin }], url: "{{panel}}/colocados" },
  },
  req("aceptar la diferencia con Operaciones", "POST", "/colocados/diferencias/{{diferenciaId}}", {
    cuerpo: { decision: "aceptada" },
    pruebas: [st(200)],
  }),
  req("decidirla otra vez → 409", "POST", "/colocados/diferencias/{{diferenciaId}}", {
    cuerpo: { decision: "descartada" },
    pruebas: [st(409), motivo("ya_decidida")],
  }),
  req("diferencia inexistente → 404", "POST", "/colocados/diferencias/00000000-0000-4000-8000-000000000000", {
    cuerpo: { decision: "aceptada" },
    pruebas: [st(404)],
  }),
]);

// ── importación (HU-086–HU-088, HU-141, HU-142, HU-148) ─────────────────────────────────────
const TSV = "Código\\tAños de experiencia\\n{{codigo}}\\t11";
const columnas = [
  { columna: "Código", clave: "codigo" },
  { columna: "Años de experiencia", clave: "aniosExperiencia" },
];
const importacion = carpeta("Importación", [
  req("emparejar lo pegado", "POST", "/importacion/emparejar", {
    cuerpo: `{"texto":"${TSV}","formato":"tsv"}`,
    pruebas: [st(200)],
  }),
  req("emparejar nada → 422", "POST", "/importacion/emparejar", { cuerpo: { texto: " " }, pruebas: [st(422)] }),
  req("exportar el banco en CSV", "GET", "/importacion/exportar?formato=csv", {
    pruebas: [st(200), `pm.test("csv", () => pm.expect(pm.response.headers.get("content-type")).to.include("csv"));`],
  }),
  req("exportar en otro formato → 400", "GET", "/importacion/exportar?formato=xlsx", { pruebas: [st(400)] }),
  req("plantilla de muestra en JSON", "GET", "/importacion/plantilla?formato=json", { pruebas: [st(200)] }),
  req("guardar una plantilla de emparejamiento → 201", "POST", "/importacion/plantillas", {
    cuerpo: { nombre: "Newman {{run}}", columnas },
    pruebas: [st(201)],
  }),
  req("con el mismo nombre → 409", "POST", "/importacion/plantillas", {
    cuerpo: { nombre: "Newman {{run}}", columnas },
    pruebas: [st(409), motivo("nombre_repetido")],
  }),
  req("plantillas guardadas", "GET", "/importacion/plantillas", { pruebas: [st(200)] }),
  req("calcular la vista previa → 201", "POST", "/importacion/lotes", {
    cuerpo: `{"texto":"${TSV}","formato":"tsv","modo":"solo_actualizar","archivo":"inventario-{{run}}.tsv","columnas":${JSON.stringify(columnas)}}`,
    pruebas: [st(201), guardar("loteId", "loteId")],
  }),
  req("recalcular con otro modo", "PATCH", "/importacion/lotes/{{loteId}}", {
    cuerpo: { modo: "crear_y_actualizar", excluidas: [] },
    pruebas: [st(200)],
  }),
  req("leer el lote calculado", "GET", "/importacion/lotes/{{loteId}}", {
    pruebas: [st(200), `pm.test("calculado", () => pm.expect(pm.response.json().lote.fase).to.eql("calculado"));`],
  }),
  req("confirmar → 202 con el trabajo", "POST", "/importacion/lotes/{{loteId}}/aplicar", {
    cuerpo: {},
    pruebas: [st(202), tiene("trabajoId")],
  }),
  req("confirmar otra vez devuelve el mismo trabajo → 202", "POST", "/importacion/lotes/{{loteId}}/aplicar", {
    cuerpo: {},
    pruebas: [st(202)],
  }),
  req("seguir el lote hasta que el worker lo aplique", "GET", "/importacion/lotes/{{loteId}}", {
    pruebas: [
      st(200),
      `const fase = pm.response.json().lote.fase;`,
      `const n = Number(pm.collectionVariables.get("espera") || 0);`,
      `if (fase !== "aplicado" && n < 40) { pm.collectionVariables.set("espera", n + 1); setTimeout(() => {}, 500); postman.setNextRequest(pm.info.requestName); }`,
      `else { pm.collectionVariables.set("espera", 0); pm.test("aplicado", () => pm.expect(fase).to.eql("aplicado")); }`,
    ],
  }),
  req("filas con error del lote", "GET", "/importacion/lotes/{{loteId}}/errores", { pruebas: [st(200)] }),
  req("reporte del lote", "GET", "/importacion/lotes/{{loteId}}/reporte", { pruebas: [st(200)] }),
  req("historial de importaciones", "GET", "/importacion/lotes", { pruebas: [st(200)] }),
  req("lo que hay que saber antes de deshacer", "GET", "/importacion/lotes/{{loteId}}/revertir", { pruebas: [st(200)] }),
  req("incluir un código mal escrito → 400", "POST", "/importacion/lotes/{{loteId}}/revertir", {
    cuerpo: { incluir: ["x"] },
    pruebas: [st(400)],
  }),
  req("deshacer → 202", "POST", "/importacion/lotes/{{loteId}}/revertir", { cuerpo: { incluir: [] }, pruebas: [st(202)] }),
  req("lote inexistente → 404", "GET", "/importacion/lotes/00000000-0000-4000-8000-000000000000", { pruebas: [st(404)] }),
]);

// ── perfiles: revocar y archivar (al final, cuando ya no se usa el perfil) ──────────────────
const cierre = carpeta("Perfiles · revocar y archivar", [
  req("revocar el consentimiento: sale de publicado", "POST", "/perfiles/{{codigo}}/consentimiento/revocar", {
    cuerpo: {},
    pruebas: [st(200)],
  }),
  req("revocar sin consentimiento → 409", "POST", "/perfiles/{{codigo}}/consentimiento/revocar", {
    cuerpo: {},
    pruebas: [st(409), motivo("sin_consentimiento")],
  }),
  req("archivar sin borrar", "POST", "/perfiles/{{codigo}}/archivar", { cuerpo: {}, pruebas: [st(200)] }),
  req("archivar otra vez informa sin escribir", "POST", "/perfiles/{{codigo}}/archivar", {
    cuerpo: {},
    pruebas: [st(200), `pm.test("yaArchivado", () => pm.expect(pm.response.json().yaArchivado).to.eql(true));`],
  }),
]);

// ── administración (HU-151, HU-147) ─────────────────────────────────────────────────────────
const administracion = carpeta("Administración", [
  req("inscribir un correo @trycore.com → 201", "POST", "/accesos", {
    cuerpo: { correo: "newman-nuevo-{{run}}@trycore.com", rol: "observador" },
    pruebas: [st(201), guardar("inscritoId", "inscrito.id")],
  }),
  req("ya inscrito → 409", "POST", "/accesos", {
    cuerpo: { correo: "newman-nuevo-{{run}}@trycore.com", rol: "observador" },
    pruebas: [st(409), motivo("ya_inscrito")],
  }),
  req("correo externo → 422", "POST", "/accesos", {
    cuerpo: { correo: "alguien@gmail.com", rol: "observador" },
    pruebas: [st(422), motivo("correo_externo")],
  }),
  req("cambiar el rol", "POST", "/accesos/{{inscritoId}}/rol", {
    cuerpo: { rol: "administrador" },
    pruebas: [st(200), `pm.test("rol anterior y nuevo", () => pm.expect(pm.response.json()).to.include({ rolAnterior: "observador", rol: "administrador" }));`],
  }),
  req("dar de baja", "POST", "/accesos/{{inscritoId}}/baja", { cuerpo: {}, pruebas: [st(200)] }),
  req("cambiar el rol de un dado de baja → 409", "POST", "/accesos/{{inscritoId}}/rol", {
    cuerpo: { rol: "observador" },
    pruebas: [st(409), motivo("dado_de_baja")],
  }),
  req("la única administradora no se quita el rol → 409", "POST", "/accesos/{{adminId}}/rol", {
    cuerpo: { rol: "observador" },
    pruebas: [st(409), motivo("ultimo_administrador")],
  }),
  req("inscrito inexistente → 404", "POST", "/accesos/00000000-0000-4000-8000-000000000000/baja", {
    cuerpo: {},
    pruebas: [st(404)],
  }),
  req("guardar el contacto de Trycore", "POST", "/contacto", {
    cuerpo: { nombre: "Eida Tinjacá", cargo: "Coordinación de Servicio", correo: "eida.tinjaca@trycore.com" },
    pruebas: [st(200), `pm.test("cambio", () => pm.expect(pm.response.json().cambio).to.eql(true));`],
  }),
  req("contacto con correo externo → 422", "POST", "/contacto", {
    cuerpo: { correo: "eida@gmail.com" },
    pruebas: [st(422), motivo("correo_externo")],
  }),
]);

// ── transversal: observadora, sin sesión y sin CSRF ─────────────────────────────────────────
const MUTANTES = [
  ["POST", "/catalogos/tecnologia"],
  ["PATCH", "/catalogos/tecnologia/{{valorId}}"],
  ["POST", "/catalogos/tecnologia/{{valorId}}/desactivar"],
  ["POST", "/catalogos/tecnologia/{{valorId}}/reactivar"],
  ["POST", "/catalogos/tecnologia/{{valorId}}/fusionar"],
  ["POST", "/lexico"],
  ["POST", "/lexico/propuestas/{{propuestaRechazar}}/aprobar"],
  ["POST", "/lexico/propuestas/{{propuestaRechazar}}/rechazar"],
  ["POST", "/lexico/candidatas/{{candidataId}}"],
  ["POST", "/perfiles"],
  ["PATCH", "/perfiles/PS-0142"],
  ["POST", "/perfiles/PS-0142/publicar"],
  ["POST", "/perfiles/publicar"],
  ["POST", "/perfiles/disponibilidad"],
  ["POST", "/perfiles/PS-0142/consentimiento"],
  ["POST", "/perfiles/PS-0142/consentimiento/revocar"],
  ["POST", "/perfiles/PS-0142/pausar"],
  ["POST", "/perfiles/PS-0142/reactivar"],
  ["POST", "/perfiles/PS-0142/archivar"],
  ["POST", "/perfiles/PS-0142/quitar-disponibilidad"],
  ["POST", "/perfiles/PS-0142/usar-liberacion"],
  ["POST", "/perfiles/PS-0142/validacion"],
  ["PATCH", "/perfiles/PS-0142/validacion"],
  ["POST", "/perfiles/PS-0142/validacion/confirmar"],
  ["POST", "/perfiles/PS-0142/validacion/descartar"],
  ["POST", "/colocados"],
  ["POST", "/colocados/cargas"],
  ["POST", "/colocados/diferencias/00000000-0000-4000-8000-000000000000"],
  ["POST", "/importacion/emparejar"],
  ["GET", "/importacion/exportar?formato=csv"],
  ["GET", "/importacion/plantilla?formato=csv"],
  ["GET", "/importacion/plantillas"],
  ["POST", "/importacion/plantillas"],
  ["POST", "/importacion/lotes"],
  ["PATCH", "/importacion/lotes/{{loteId}}"],
  ["POST", "/importacion/lotes/{{loteId}}/aplicar"],
  ["GET", "/importacion/lotes/{{loteId}}/errores"],
  ["POST", "/importacion/lotes/{{loteId}}/revertir"],
  ["POST", "/accesos"],
  ["POST", "/accesos/{{inscritoId}}/rol"],
  ["POST", "/accesos/{{inscritoId}}/baja"],
  ["POST", "/contacto"],
];
const LECTURAS = [
  "/catalogos/tecnologia",
  "/perfiles",
  "/perfiles/PS-0142",
  "/importacion/lotes",
  "/importacion/lotes/{{loteId}}",
  "/importacion/lotes/{{loteId}}/reporte",
];
const conCuerpo = (m) => (m === "GET" ? undefined : {});
const transversal = carpeta("Transversal · roles, sesión y CSRF", [
  ...MUTANTES.map(([m, r]) =>
    req(`observadora ${m} ${r} → 403 «tu rol es de consulta»`, m, r, {
      cuerpo: conCuerpo(m),
      quien: "obs",
      pruebas: [st(403), motivo("sin_permiso")],
    }),
  ),
  req("observadora pide el borrador de validación sin pendiente → 404 (pasa el permiso)", "GET", "/perfiles/PS-0142/validacion", {
    quien: "obs",
    pruebas: [st(404), motivo("no_existe")],
  }),
  ...LECTURAS.map((r) =>
    req(`observadora lee ${r} → 200`, "GET", r, { quien: "obs", pruebas: [st(200)] }),
  ),
  ...[...MUTANTES.filter(([m]) => m !== "GET"), ["GET", "/perfiles"]].map(([m, r]) =>
    req(`sin sesión ${m} ${r} → 401`, m, r, { cuerpo: conCuerpo(m), quien: "nadie", pruebas: [st(401), sinCuerpoDeDatos] }),
  ),
  ...MUTANTES.filter(([m]) => m !== "GET").map(([m, r]) =>
    req(`sin CSRF ${m} ${r} → 403`, m, r, { cuerpo: conCuerpo(m), quien: "sinCsrf", pruebas: [st(403)] }),
  ),
]);

const coleccion = {
  info: {
    name: "EP-006 · Administración del inventario (contrato del panel)",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    description:
      "Generada por tests/postman/generar-ep-006.mjs. Corre con tests/postman/correr-ep-006.sh sobre una BD efímera.",
  },
  variable: [{ key: "espera", value: "0" }],
  item: [catalogos, lexico, perfiles, colocados, importacion, cierre, administracion, transversal],
};
writeFileSync(
  new URL("./ep-006.postman_collection.json", import.meta.url),
  JSON.stringify(coleccion, null, 2) + "\n",
);
const total = coleccion.item.reduce((n, c) => n + c.item.length, 0);
console.log(`ep-006.postman_collection.json: ${total} peticiones en ${coleccion.item.length} carpetas`);
