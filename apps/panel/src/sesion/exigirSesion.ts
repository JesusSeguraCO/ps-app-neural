// Guarda de página del panel (ADR-0002 «Revisión adversarial» H5). Cada `page.tsx` protegida la llama
// en su primera línea. Lee `activo` y `rol` de la BD en cada petición; 12 h absolutas y 60 min de
// inactividad. Sin sesión válida redirige (307) antes de emitir nada.
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_PANEL, destinoSinSesion, validarSesionPanel, type RolPanel } from "@ps/dominio/acceso/sesion";
import { poolDe } from "@ps/infra/postgres/pool";
import {
  buscarSesionPanel,
  cortarSesionPanel,
  refrescarActividadPanel,
} from "@ps/infra/postgres/sesiones";

declare const marca: unique symbol;
export type SesionVerificada = {
  readonly usuarioId: string;
  readonly correo: string;
  readonly rol: RolPanel;
  readonly hasta: Date;
  readonly [marca]: true;
};

export const exigirSesion = cache(async (): Promise<SesionVerificada> => {
  const id = (await cookies()).get(COOKIE_PANEL)?.value;
  const bd = poolDe("panel");
  const fila = id ? await buscarSesionPanel(bd, id) : null;
  const r = validarSesionPanel(fila, new Date());
  // HU-151: dada de baja o con el rol bajado, la sesión se corta en esta misma petición.
  if (!r.ok && fila && id && (r.motivo === "rol_cambiado" || !fila.activo))
    await cortarSesionPanel(bd, id);
  if (!r.ok) redirect(destinoSinSesion(r.motivo));
  if (r.refrescarActividad && id) await refrescarActividadPanel(bd, id);
  return { usuarioId: r.usuarioId, correo: r.correo, rol: r.rol, hasta: r.hasta } as SesionVerificada;
});
