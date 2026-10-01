// Siembra ficticia para catálogos y léxico (EP-006 · sub-slice 1): modalidades de prueba de las
// familias sembradas y consultas sin coincidencia SINTÉTICAS (HU-139: hasta EP-010 no hay registro
// real). Solo local, CI y staging; idempotente. Datos inventados, sin personas reales salvo el caso de
// prueba que contiene el nombre de un perfil ficticio (V9-8: nunca debe viajar a Gemini).
import type pg from "pg";

// Cada modalidad trae su plantilla (B.9.1: el texto vive en el catálogo): de ahí sale el borrador del
// reporte de validación (HU-140).
export const MODALIDADES_FICTICIAS: Array<{
  familia: string;
  nombre: string;
  texto: string;
  enunciadoReto: string;
  entregables: string;
  criterios: string[];
}> = [
  {
    familia: "Desarrollo",
    nombre: "Prueba práctica revisada por un arquitecto",
    texto:
      "Resolvió un ejercicio de código real y un arquitecto de Trycore revisó su diseño y sus pruebas.",
    enunciadoReto:
      "Construir en 72 horas un servicio REST de conciliación de pagos con persistencia, pruebas automatizadas y despliegue en contenedor, y sustentar las decisiones ante un arquitecto.",
    entregables: "Repositorio con el código y las pruebas · README de despliegue",
    criterios: ["Diseño de la capa de servicios", "Modelo de datos y persistencia", "Cobertura y calidad de las pruebas", "Claridad al sustentar decisiones técnicas"],
  },
  {
    familia: "Calidad",
    nombre: "Suite de pruebas automatizadas",
    texto: "Automatizó un flujo de extremo a extremo y explicó su estrategia de pruebas.",
    enunciadoReto:
      "Automatizar de extremo a extremo el flujo de compra de una tienda de prueba e integrarlo a un pipeline.",
    entregables: "Repositorio con la suite · Reporte de ejecución",
    criterios: ["Estrategia de pruebas", "Estabilidad de la suite", "Integración continua"],
  },
  {
    familia: "Datos",
    nombre: "Caso de negocio con sustentación",
    texto: "Analizó un conjunto de datos de negocio y sustentó sus conclusiones ante el equipo.",
    enunciadoReto:
      "Analizar un conjunto de datos de ventas, construir un tablero y sustentar tres hallazgos de negocio.",
    entregables: "Cuaderno de análisis · Tablero · Presentación de hallazgos",
    criterios: ["Calidad del análisis", "Visualización", "Comunicación de hallazgos"],
  },
  {
    familia: "Infraestructura",
    nombre: "Laboratorio de despliegue en la nube",
    texto: "Desplegó un servicio en la nube con infraestructura como código y monitoreo.",
    enunciadoReto:
      "Desplegar un servicio web en la nube con infraestructura como código, monitoreo y alertas.",
    entregables: "Repositorio de infraestructura como código · Guía de operación",
    criterios: ["Infraestructura como código", "Observabilidad", "Seguridad del despliegue"],
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
      `INSERT INTO inventario.catalogo_modalidades_prueba (familia_id, nombre, texto_cliente, enunciado_reto, entregables, criterios)
       SELECT f.id, $2, $3, $4, $5, $6 FROM inventario.catalogo_familias f
        WHERE f.nombre = $1 AND NOT EXISTS (
          SELECT 1 FROM inventario.catalogo_modalidades_prueba m WHERE m.familia_id = f.id AND m.nombre = $2)`,
      [m.familia, m.nombre, m.texto, m.enunciadoReto, m.entregables, m.criterios.join("\n")],
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
