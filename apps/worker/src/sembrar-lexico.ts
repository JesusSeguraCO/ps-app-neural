// Siembra ficticia para catálogos y léxico (EP-006 · sub-slice 1): modalidades de prueba de las
// familias sembradas y consultas sin coincidencia SINTÉTICAS (HU-139: hasta EP-010 no hay registro
// real). Solo local, CI y staging; idempotente. Datos inventados, sin personas reales salvo el caso de
// prueba que contiene el nombre de un perfil ficticio (V9-8: nunca debe viajar a Gemini).
import type pg from "pg";

export const MODALIDADES_FICTICIAS: Array<{ familia: string; nombre: string; texto: string }> = [
  {
    familia: "Desarrollo",
    nombre: "Prueba práctica revisada por un arquitecto",
    texto:
      "Resolvió un ejercicio de código real y un arquitecto de Trycore revisó su diseño y sus pruebas.",
  },
  {
    familia: "Calidad",
    nombre: "Suite de pruebas automatizadas",
    texto: "Automatizó un flujo de extremo a extremo y explicó su estrategia de pruebas.",
  },
  {
    familia: "Datos",
    nombre: "Caso de negocio con sustentación",
    texto: "Analizó un conjunto de datos de negocio y sustentó sus conclusiones ante el equipo.",
  },
  {
    familia: "Infraestructura",
    nombre: "Laboratorio de despliegue en la nube",
    texto: "Desplegó un servicio en la nube con infraestructura como código y monitoreo.",
  },
];

export const CANDIDATAS_SINTETICAS: Array<{
  consulta: string;
  veces: number;
  cuentas: number;
  hace: number;
  modeloPermitido: boolean;
}> = [
  {
    consulta: "analista de calidad de software con pruebas automatizadas",
    veces: 3,
    cuentas: 2,
    hace: 4,
    modeloPermitido: true,
  },
  {
    consulta: "desarrollador con experiencia en pagos en tiempo real para banca",
    veces: 4,
    cuentas: 3,
    hace: 4,
    modeloPermitido: true,
  },
  {
    consulta: "líder técnico que haya trabajado con aseguradoras",
    veces: 2,
    cuentas: 1,
    hace: 5,
    modeloPermitido: true,
  },
  {
    consulta: "ingeniero de integraciones con experiencia en pasarelas de pago",
    veces: 5,
    cuentas: 3,
    hace: 4,
    modeloPermitido: false,
  },
  {
    consulta: "desarrollador COBOL para migración de core",
    veces: 4,
    cuentas: 3,
    hace: 6,
    modeloPermitido: true,
  },
  {
    consulta: "arquitecto cloud-native senior",
    veces: 2,
    cuentas: 2,
    hace: 9,
    modeloPermitido: true,
  },
  {
    consulta: "alguien como Laura Méndez pero en Java",
    veces: 1,
    cuentas: 1,
    hace: 2,
    modeloPermitido: true,
  },
];

export async function sembrarLexicoFicticio(ctx: {
  bd: pg.Pool;
  appEnv: "local" | "ci" | "staging" | "produccion";
  registrar: (e: Record<string, unknown>) => void;
}): Promise<{ modalidades: number; candidatas: number }> {
  if (ctx.appEnv === "produccion")
    throw new Error("sembrar_lexico: bloqueado en producción (solo local, CI y staging)");
  let modalidades = 0;
  for (const m of MODALIDADES_FICTICIAS) {
    const r = await ctx.bd.query(
      `INSERT INTO inventario.catalogo_modalidades_prueba (familia_id, nombre, texto_cliente)
       SELECT f.id, $2, $3 FROM inventario.catalogo_familias f
        WHERE f.nombre = $1 AND NOT EXISTS (
          SELECT 1 FROM inventario.catalogo_modalidades_prueba m WHERE m.familia_id = f.id AND m.nombre = $2)`,
      [m.familia, m.nombre, m.texto],
    );
    modalidades += r.rowCount ?? 0;
  }
  let candidatas = 0;
  for (const c of CANDIDATAS_SINTETICAS) {
    // El período es el mes (en Bogotá) de la última búsqueda.
    const r = await ctx.bd.query(
      `INSERT INTO inventario.candidatas_lexico (consulta, periodo, veces, cuentas, ultima_en, modelo_permitido, sintetica)
       SELECT $1, date_trunc('month', (now() - make_interval(days => $4)) AT TIME ZONE 'America/Bogota')::date,
              $2, $3, now() - make_interval(days => $4), $5, true
       ON CONFLICT (consulta_normal, periodo) DO NOTHING`,
      [c.consulta, c.veces, c.cuentas, c.hace, c.modeloPermitido],
    );
    candidatas += r.rowCount ?? 0;
  }
  ctx.registrar({ evento: "lexico_ficticio_sembrado", modalidades, candidatas });
  return { modalidades, candidatas };
}
