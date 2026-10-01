// Lista de acceso del panel administrada desde el propio panel (HU-151; diseño §9, D17): alta solo
// `@trycore.com`, cambio de rol y baja lógica, cada uno auditado con quién y cuándo (y en el cambio de
// rol, el anterior y el nuevo). El cambio de rol y la baja pasan por `identidad_panel.cambiar_acceso`,
// que bloquea a las administradoras activas: el panel nunca queda sin ninguna, ni con dos bajas a la vez.
import "server-only";
import type pg from "pg";
import { validarCorreoPanel } from "@ps/dominio/acceso/accesos";
import { hmacCorreo } from "@ps/dominio/acceso/codigo";
import { DURACION_PANEL_MS, INACTIVIDAD_PANEL_MS, type RolPanel } from "@ps/dominio/acceso/sesion";
import { conAuditoria, type CambioAuditado, type ClavesAuditoria } from "./auditoria";
import type { Autor } from "./catalogos-panel";
import { RechazoInventario } from "./unidad-inventario";

type Consultor = Pick<pg.PoolClient, "query">;

export interface InscritoPanel {
  id: string;
  correo: string;
  rol: RolPanel;
  activo: boolean;
  creadoEn: string;
  creadoPor: string | null;
  dadoDeBajaEn: string | null;
  actualizadoPor: string | null;
  // Última sesión que se conserva (las vencidas se purgan) y si hay una abierta ahora.
  ultimaEntrada: string | null;
  sesionAbierta: boolean;
}

export async function listarAccesos(bd: Consultor): Promise<InscritoPanel[]> {
  const r = await bd.query(
    `SELECT u.id, u.correo, u.rol, u.activo, u.creado_en, u.dado_de_baja_en,
            c.correo AS creado_por, a.correo AS actualizado_por,
            (SELECT max(s.creada) FROM identidad_panel.sesiones_panel s WHERE s.usuario_id = u.id) AS ultima_entrada,
            EXISTS (SELECT 1 FROM identidad_panel.sesiones_panel s
                     WHERE s.usuario_id = u.id AND s.creada > now() - make_interval(secs => $1)
                       AND s.ultima_actividad > now() - make_interval(secs => $2)) AS sesion_abierta
       FROM identidad_panel.usuarios_panel u
       LEFT JOIN identidad_panel.usuarios_panel c ON c.id = u.creado_por
       LEFT JOIN identidad_panel.usuarios_panel a ON a.id = u.actualizado_por
      ORDER BY u.activo DESC, u.creado_en DESC, u.correo`,
    [DURACION_PANEL_MS / 1000, INACTIVIDAD_PANEL_MS / 1000],
  );
  return r.rows.map((f) => ({
    id: f.id,
    correo: f.correo,
    rol: f.rol,
    activo: f.activo,
    creadoEn: f.creado_en.toISOString(),
    creadoPor: f.creado_por,
    dadoDeBajaEn: f.dado_de_baja_en?.toISOString() ?? null,
    actualizadoPor: f.actualizado_por,
    ultimaEntrada: f.ultima_entrada?.toISOString() ?? null,
    sesionAbierta: f.activo && f.sesion_abierta,
  }));
}

const cambio = (
  autor: Autor,
  id: string,
  campo: string,
  antes: string | null,
  despues: string | null,
): CambioAuditado => ({
  actor: autor.correo,
  entidad: "usuarios_panel",
  entidadId: id,
  campo,
  antes,
  despues,
  origen: "panel",
});

// Inscribir (HU-151 happy): un correo nuevo entra activo con su rol; uno dado de baja se reactiva con el
// rol elegido (no se duplica: `correo_hmac` es único). Uno ya activo → `ya_inscrito`.
export async function inscribirCorreo(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  claveCorreo: string,
  autor: Autor,
  entrada: { correo: string; rol: RolPanel },
): Promise<{ id: string; correo: string; reactivado: boolean }> {
  const v = validarCorreoPanel(entrada.correo);
  if (!v.ok) throw new RechazoInventario(v.motivo);
  return conAuditoria<{ id: string; correo: string; reactivado: boolean }>(
    bd,
    claves,
    async (tx) => {
      const previo = (
        await tx.query(
          `SELECT id, rol, activo FROM identidad_panel.usuarios_panel WHERE correo_hmac = $1 FOR UPDATE`,
          [hmacCorreo(v.correo, claveCorreo)],
        )
      ).rows[0] as { id: string; rol: RolPanel; activo: boolean } | undefined;
      if (previo?.activo) throw new RechazoInventario("ya_inscrito", { rol: previo.rol });
      if (previo) {
        await tx.query(`SELECT * FROM identidad_panel.cambiar_acceso($1, $2, true, $3)`, [
          previo.id,
          entrada.rol,
          autor.usuarioId,
        ]);
        return {
          resultado: { id: previo.id, correo: v.correo, reactivado: true },
          cambios: [
            cambio(autor, previo.id, "activo", "false", "true"),
            ...(previo.rol !== entrada.rol
              ? [cambio(autor, previo.id, "rol", previo.rol, entrada.rol)]
              : []),
          ],
        };
      }
      const id = (
        await tx.query(
          `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol, creado_por)
         VALUES ($1, $2, $3, $4) RETURNING id`,
          [v.correo, hmacCorreo(v.correo, claveCorreo), entrada.rol, autor.usuarioId],
        )
      ).rows[0].id as string;
      return {
        resultado: { id, correo: v.correo, reactivado: false },
        cambios: [cambio(autor, id, "alta", null, `${v.correo} · ${entrada.rol}`)],
      };
    },
  );
}

async function cambiarAcceso(
  tx: Consultor,
  autor: Autor,
  id: string,
  rol: RolPanel,
  activo: boolean,
): Promise<{ rolAnterior: RolPanel; activoAnterior: boolean }> {
  try {
    await tx.query("SAVEPOINT acceso");
    const f = (
      await tx.query(
        `SELECT rol_anterior, activo_anterior FROM identidad_panel.cambiar_acceso($1, $2, $3, $4)`,
        [id, rol, activo, autor.usuarioId],
      )
    ).rows[0];
    return { rolAnterior: f.rol_anterior, activoAnterior: f.activo_anterior };
  } catch (e) {
    const m =
      (e as { code?: string; message?: string }).code === "P0001" ? (e as Error).message : null;
    if (m === "ultimo_administrador" || m === "no_existe") {
      await tx.query("ROLLBACK TO SAVEPOINT acceso");
      throw new RechazoInventario(m);
    }
    throw e;
  }
}

async function estadoDe(tx: Consultor, id: string) {
  const f = (
    await tx.query(`SELECT rol, activo FROM identidad_panel.usuarios_panel WHERE id = $1`, [id])
  ).rows[0] as { rol: RolPanel; activo: boolean } | undefined;
  if (!f) throw new RechazoInventario("no_existe");
  return f;
}

// Cambiar el rol de un inscrito activo (HU-151): bajarlo a observador corta su sesión en la siguiente
// petición (`rol_al_abrir`); el último administrador activo no puede dejar de serlo.
export async function cambiarRol(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  id: string,
  rol: RolPanel,
): Promise<{ rolAnterior: RolPanel; rol: RolPanel }> {
  return conAuditoria(bd, claves, async (tx) => {
    const actual = await estadoDe(tx, id);
    if (!actual.activo) throw new RechazoInventario("dado_de_baja");
    if (actual.rol === rol) return { resultado: { rolAnterior: rol, rol }, cambios: [] };
    const r = await cambiarAcceso(tx, autor, id, rol, true);
    return {
      resultado: { rolAnterior: r.rolAnterior, rol },
      cambios: [cambio(autor, id, "rol", r.rolAnterior, rol)],
    };
  });
}

// Dar de baja (HU-151): sale de los inscritos activos sin borrarse; su sesión se corta en la siguiente
// petición y al pedir entrar recibe la respuesta de un correo no inscrito, sin código.
export async function darDeBaja(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  id: string,
): Promise<{ yaDeBaja: boolean }> {
  return conAuditoria<{ yaDeBaja: boolean }>(bd, claves, async (tx) => {
    const actual = await estadoDe(tx, id);
    if (!actual.activo) return { resultado: { yaDeBaja: true }, cambios: [] };
    await cambiarAcceso(tx, autor, id, actual.rol, false);
    return {
      resultado: { yaDeBaja: false },
      cambios: [cambio(autor, id, "activo", "true", "false")],
    };
  });
}
