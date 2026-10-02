// Observador (HU-124; diseño §9): el rechazo por rol queda en el registro de accesos del panel como
// `acceso_rechazado` —quién, cuándo, qué acción y sobre qué recurso—, sin fila de cambio en el recurso;
// «Avisar» encola `notificar` a Talento Humano con el código del perfil.
import "server-only";
import type pg from "pg";
import { TOPE_NOTA_AVISO } from "@ps/dominio/inventario/observador";
import { RechazoInventario } from "./unidad-inventario";

type Consultor = Pick<pg.PoolClient, "query">;

export async function registrarAccesoRechazado(
  bd: Consultor,
  r: { usuarioId: string; accion: string; recurso: string; ip?: string | null },
): Promise<void> {
  await bd.query(
    `INSERT INTO identidad.accesos_log (host, ambito, evento, usuario_id, accion, recurso, ip)
     VALUES ('panel', 'panel', 'acceso_rechazado', $1, $2, $3, $4)`,
    [r.usuarioId, r.accion.slice(0, 80), r.recurso.slice(0, 300), r.ip ?? null],
  );
}

export async function avisarDatoDesactualizado(
  bd: Consultor,
  a: { usuarioId: string; codigo: string; nota: string | null },
): Promise<void> {
  const existe = await bd.query(`SELECT 1 FROM inventario.perfiles WHERE codigo = $1`, [a.codigo]);
  if (existe.rowCount === 0) throw new RechazoInventario("no_existe");
  const nota = a.nota?.trim().slice(0, TOPE_NOTA_AVISO) || null;
  await bd.query(`SELECT operacion.encolar_panel('notificar', $1::jsonb)`, [
    JSON.stringify({ motivo: "dato_desactualizado", codigo: a.codigo, usuario: a.usuarioId, nota }),
  ]);
}
