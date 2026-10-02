// Tarea semanal `proponer_lexico` (HU-139, RF-8.12.1; ADR-0009, ADR-0004 H43, V9-8): toma las
// consultas sin coincidencia de la última semana aún sin decidir, quita las que no permiten el modelo
// y las que contienen nombres o apellidos de perfiles (diccionario leído en la misma corrida), envía a
// Gemini solo su texto y la taxonomía, y guarda lo que vuelve como propuestas PENDIENTES: nada entra
// al léxico sin una persona.
import type pg from "pg";
import { armarLoteLexico, propuestasDesdeRespuesta } from "@ps/dominio/lexico/lote";
import type { ProponedorLexico } from "@ps/infra/gemini/lexico";

export interface ContextoLexico {
  bd: pg.Pool;
  proponedor: ProponedorLexico;
  registrar: (evento: Record<string, unknown>) => void;
}

export interface ResultadoCorrida {
  enviadas: number;
  omitidas: number;
  propuestas: number;
  fallo?: string;
}

export async function proponerLexico(ctx: ContextoLexico): Promise<ResultadoCorrida> {
  const [consultas, perfiles, taxonomia, excluidos] = await Promise.all([
    ctx.bd.query(
      `SELECT id, consulta AS texto, modelo_permitido, veces, cuentas FROM inventario.candidatas_lexico
        WHERE destino IS NULL AND ultima_en >= now() - interval '7 days' ORDER BY veces DESC, ultima_en DESC LIMIT 200`,
    ),
    ctx.bd.query(`SELECT nombre, primer_apellido FROM inventario.perfiles`),
    ctx.bd.query(
      `SELECT 'rol' AS tipo, id, nombre FROM inventario.catalogo_roles WHERE activo
       UNION ALL SELECT 'tecnologia', id, nombre FROM inventario.catalogo_tecnologias WHERE activo
       UNION ALL SELECT 'sector', id, nombre FROM inventario.catalogo_sectores WHERE activo`,
    ),
    ctx.bd.query(
      `SELECT termino_normal FROM inventario.lexico
       UNION SELECT termino_normal FROM inventario.propuestas_lexico WHERE estado IN ('pendiente', 'rechazada')`,
    ),
  ]);
  const lote = armarLoteLexico(
    consultas.rows.map((c) => ({
      id: c.id,
      texto: c.texto,
      modeloPermitido: c.modelo_permitido,
      veces: c.veces,
      cuentas: c.cuentas,
    })),
    perfiles.rows.map((p) => ({ nombre: p.nombre, primerApellido: p.primer_apellido })),
  );
  const base = { enviadas: lote.enviadas.length, omitidas: lote.omitidas.length };
  if (!lote.enviadas.length) {
    ctx.registrar({ evento: "proponer_lexico_sin_consultas", ...base });
    return { ...base, propuestas: 0 };
  }
  const nombresDe = (tipo: string) =>
    taxonomia.rows.filter((t) => t.tipo === tipo).map((t) => t.nombre as string);
  const r = await ctx.proponedor.proponer({
    consultas: lote.enviadas.map(({ id, texto }) => ({ id, texto })),
    taxonomia: {
      roles: nombresDe("rol"),
      tecnologias: nombresDe("tecnologia"),
      sectores: nombresDe("sector"),
    },
  });
  if (!r.ok) {
    ctx.registrar({
      evento: "proponer_lexico_fallo",
      motivo: r.motivo,
      status: r.status ?? null,
      ...base,
    });
    return { ...base, propuestas: 0, fallo: r.motivo };
  }
  const propuestas = propuestasDesdeRespuesta(r.respuesta, {
    enviadas: lote.enviadas,
    catalogo: taxonomia.rows,
    excluidos: excluidos.rows.map((e) => e.termino_normal),
  });
  let guardadas = 0;
  for (const p of propuestas) {
    const ins = await ctx.bd.query(
      `INSERT INTO inventario.propuestas_lexico (termino, sinonimos, equivalencias, ejemplo, busquedas, cuentas, consultas)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (termino_normal) WHERE estado IN ('pendiente', 'rechazada') DO NOTHING`,
      [
        p.termino,
        p.sinonimos,
        JSON.stringify(p.equivalencias),
        p.ejemplo,
        p.busquedas,
        p.cuentas,
        p.consultas,
      ],
    );
    guardadas += ins.rowCount ?? 0;
  }
  ctx.registrar({ evento: "proponer_lexico_hecho", ...base, propuestas: guardadas });
  return { ...base, propuestas: guardadas };
}
