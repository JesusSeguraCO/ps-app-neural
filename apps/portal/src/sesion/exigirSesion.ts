// Guarda de página del portal (ADR-0002 «Revisión adversarial» H5). Cada `page.tsx` protegida la llama
// en su primera línea. Revalida en BD enlace activo y vigente e invitado activo; sin sesión válida
// redirige (307) antes de emitir nada. Devuelve un tipo marcado que solo ella construye.
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_PORTAL,
  destinoSinSesion,
  validarSesionPortal,
  type SesionPortalVerificada,
} from "@ps/dominio/acceso/sesion";
import { poolDe } from "@ps/infra/postgres/pool";
import { buscarSesionPortal } from "@ps/infra/postgres/sesiones";

export type SesionVerificada = SesionPortalVerificada;

export const exigirSesion = cache(async (): Promise<SesionVerificada> => {
  const id = (await cookies()).get(COOKIE_PORTAL)?.value;
  const fila = id ? await buscarSesionPortal(poolDe("portal"), id) : null;
  const r = validarSesionPortal(fila, new Date());
  if (!r.ok) redirect(destinoSinSesion(r.motivo));
  return { enlaceId: r.enlaceId, invitadoId: r.invitadoId } as SesionVerificada;
});
