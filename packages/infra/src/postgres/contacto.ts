// Contacto de Trycore que ve el cliente (HU-147; diseño §10): el portal lo lee por la vista
// `operacion.contacto_trycore` en cada carga de las pantallas de contacto; el panel lo cambia con
// `contacto.escribir`, con una fila de auditoría por campo cambiado (titular sistema) en la misma
// transacción. Un correo externo no llega a la BD (y su CHECK tampoco lo deja pasar).
import "server-only";
import type pg from "pg";
import { validarContacto, type ContactoTrycore } from "@ps/dominio/contacto/contacto";
import { conAuditoria, leerCambios, type CambioAuditado, type ClavesAuditoria } from "./auditoria";
import type { Autor } from "./catalogos-panel";
import { RechazoInventario } from "./unidad-inventario";

type Consultor = Pick<pg.PoolClient, "query">;

const ENTIDAD = "configuracion_contacto";
const ID = "contacto";
// Campo del contacto → nombre del campo en la auditoría.
const CAMPOS = { direccion: "correo", nombre: "nombre", cargo: "cargo" } as const;
type Campo = keyof typeof CAMPOS;
const LLAVES = Object.keys(CAMPOS) as Campo[];

export async function leerContacto(bd: Consultor): Promise<ContactoTrycore> {
  const f = (await bd.query(`SELECT correo, nombre, cargo FROM operacion.contacto_trycore`))
    .rows[0];
  return { direccion: f.correo, nombre: f.nombre, cargo: f.cargo };
}

export interface ContactoVigente extends ContactoTrycore {
  actualizadoPor: string | null;
  actualizadoEn: string | null;
}

export async function leerContactoPanel(bd: Consultor): Promise<ContactoVigente> {
  const contacto = await leerContacto(bd);
  const f = (
    await bd.query(
      `SELECT u.correo AS por, c.actualizado_en
         FROM inventario.configuracion_contacto c
         JOIN identidad_panel.usuarios_panel u ON u.id = c.actualizado_por`,
    )
  ).rows[0];
  return {
    ...contacto,
    actualizadoPor: f?.por ?? null,
    actualizadoEn: f?.actualizado_en?.toISOString() ?? null,
  };
}

export async function guardarContacto(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  entrada: { correo: string; nombre?: string | null; cargo?: string | null },
): Promise<{ cambio: boolean }> {
  const v = validarContacto(entrada);
  if (!v.ok) throw new RechazoInventario(v.motivo);
  const nuevo = v.contacto;
  return conAuditoria<{ cambio: boolean }>(bd, claves, async (tx) => {
    // Bloquea la fila (si existe) para que dos guardados a la vez no auditen el mismo «antes».
    await tx.query(`SELECT 1 FROM inventario.configuracion_contacto FOR UPDATE`);
    const anterior = await leerContacto(tx);
    const cambios: CambioAuditado[] = LLAVES.filter((c) => anterior[c] !== nuevo[c]).map((c) => ({
      actor: autor.correo,
      entidad: ENTIDAD,
      entidadId: ID,
      campo: CAMPOS[c],
      antes: anterior[c],
      despues: nuevo[c],
      origen: "panel",
    }));
    if (!cambios.length) return { resultado: { cambio: false }, cambios };
    await tx.query(
      `INSERT INTO inventario.configuracion_contacto (unica, correo, nombre, cargo, actualizado_por)
       VALUES (true, $1, $2, $3, $4)
       ON CONFLICT (unica) DO UPDATE
         SET correo = EXCLUDED.correo, nombre = EXCLUDED.nombre, cargo = EXCLUDED.cargo,
             actualizado_por = EXCLUDED.actualizado_por, actualizado_en = now()`,
      [nuevo.direccion, nuevo.nombre, nuevo.cargo, autor.usuarioId],
    );
    return { resultado: { cambio: true }, cambios };
  });
}

export interface CambioContacto {
  actor: string;
  cuando: string;
  antes: ContactoTrycore;
  despues: ContactoTrycore;
}

// Cambios del contacto, del más reciente al más antiguo: cada guardado (filas del mismo instante y autor)
// reconstruye el contacto completo antes y después, partiendo del buzón por omisión.
export async function historialContacto(bd: Consultor, kek: string): Promise<CambioContacto[]> {
  const filas = await leerCambios(bd, kek, ENTIDAD, ID);
  const grupos: CambioContacto[] = [];
  let vigente: ContactoTrycore = {
    direccion: "people.service@trycore.com",
    nombre: null,
    cargo: null,
  };
  let clave = "";
  for (const f of filas) {
    const k = `${f.cuando}|${f.actor}`;
    if (k !== clave) {
      grupos.push({
        actor: f.actor,
        cuando: f.cuando,
        antes: { ...vigente },
        despues: { ...vigente },
      });
      clave = k;
    }
    const g = grupos[grupos.length - 1]!;
    const campo = LLAVES.find((c) => CAMPOS[c] === f.campo);
    // El valor registrado manda sobre el reconstruido.
    if (campo === "direccion") {
      g.antes.direccion = f.antes ?? g.antes.direccion;
      g.despues.direccion = f.despues ?? g.despues.direccion;
    } else if (campo) {
      g.antes[campo] = f.antes;
      g.despues[campo] = f.despues;
    }
    vigente = g.despues;
  }
  return grupos.reverse();
}
