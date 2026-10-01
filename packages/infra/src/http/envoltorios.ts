// Envoltorios de Route Handler (ADR-0002 enmienda y H19; ADR-0008 fila QA-3/QA-4): se componen en
// cada `route.ts`. `conCsrf` exige cabecera X-PS-CSRF igual a la cookie CSRF del host (doble envío)
// y Origin (o Referer) del propio host; `conSesion` revalida en BD; `conAutorizacion` aplica la
// matriz rol × acción. Vuelven a comprobar la cabecera de borde por si el middleware se saltara.
import "server-only";
import { timingSafeEqual } from "node:crypto";
import { esAccion, puede, type AccionPanel } from "@ps/dominio/acceso/permisos";
import { MENSAJE_CONSULTA } from "@ps/dominio/inventario/observador";
import {
  CABECERA_CSRF,
  COOKIE_CSRF,
  COOKIE_PANEL,
  COOKIE_PORTAL,
  validarSesionPanel,
  validarSesionPortal,
  type RolPanel,
  type SesionPortalVerificada,
} from "@ps/dominio/acceso/sesion";
import { CABECERA_BORDE, bordeValido } from "../perimetro";
import { poolDe } from "../postgres/pool";
import { registrarAccesoRechazado } from "../postgres/observador";
import {
  buscarSesionPanel,
  buscarSesionPortal,
  cortarSesionPanel,
  refrescarActividadPanel,
} from "../postgres/sesiones";

export { CABECERA_CSRF, COOKIE_CSRF };

// IP del cliente para los límites (ADR-0002): la del borde solo si hay borde configurado; si no, la que
// fija App Platform (`do-connecting-ip`) o el primer salto de x-forwarded-for.
export function ipDelCliente(req: Request): string | null {
  if (process.env.EDGE_SECRET) {
    const cf = req.headers.get("cf-connecting-ip");
    if (cf) return cf;
  }
  return (
    req.headers.get("do-connecting-ip") ??
    (req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null)
  );
}

type Manejador<C> = (req: Request, ctx: C) => Promise<Response> | Response;

const json = (status: number, cuerpo?: unknown) =>
  new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
    status,
    headers: { "content-type": "application/json", "cache-control": "private, no-store" },
  });

export function leerCookie(req: Request, nombre: string): string | undefined {
  for (const parte of (req.headers.get("cookie") ?? "").split(";")) {
    const [k, ...v] = parte.trim().split("=");
    if (k === nombre) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

function iguales(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function conBorde<C>(h: Manejador<C>): Manejador<C> {
  return (req, ctx) => {
    // Segunda barrera frente a CVE-2025-29927, independiente del middleware (R-89).
    if (req.headers.has("x-middleware-subrequest")) return json(403);
    const secretos = [process.env.EDGE_SECRET, process.env.EDGE_SECRET_PREV].filter(
      (s): s is string => Boolean(s),
    );
    if (secretos.length > 0 && !bordeValido(req.headers.get(CABECERA_BORDE), secretos))
      return json(403);
    return h(req, ctx);
  };
}

// CSRF por cabecera + Origin exacto (ADR-0002 §2): los hosts hermanos de trycore.com son same-site,
// así que SameSite no basta; la cabecera obliga a pasar por fetch y el Origin distingue el host.
export function conCsrf<C>(h: Manejador<C>): Manejador<C> {
  return (req, ctx) => {
    const host = req.headers.get("host");
    const origen = req.headers.get("origin") ?? req.headers.get("referer");
    let origenValido = false;
    if (host && origen) {
      try {
        origenValido = new URL(origen).host === host;
      } catch {
        origenValido = false;
      }
    }
    const token = req.headers.get(CABECERA_CSRF);
    const cookie = leerCookie(req, COOKIE_CSRF);
    if (!origenValido || !token || !cookie || !iguales(token, cookie))
      return json(403, { motivo: "csrf" });
    return h(req, ctx);
  };
}

export interface ContextoPanel {
  usuarioId: string;
  correo: string;
  rol: RolPanel;
  idCookie: string;
}

export function conSesionPanel(
  h: (req: Request, sesion: ContextoPanel) => Promise<Response> | Response,
): Manejador<unknown> {
  return async (req) => {
    const id = leerCookie(req, COOKIE_PANEL);
    const bd = poolDe("panel");
    const fila = id ? await buscarSesionPanel(bd, id) : null;
    const r = validarSesionPanel(fila, new Date());
    // HU-151: dada de baja o con el rol bajado, la sesión se corta en esta misma petición.
    if (!r.ok && fila && id && (r.motivo === "rol_cambiado" || !fila.activo))
      await cortarSesionPanel(bd, id);
    if (!r.ok) return json(401, { motivo: r.motivo === "sin_sesion" ? "sin_sesion" : r.motivo });
    if (r.refrescarActividad) await refrescarActividadPanel(bd, id!);
    return h(req, { usuarioId: r.usuarioId, correo: r.correo, rol: r.rol, idCookie: id! });
  };
}

// Portal: revalida en BD enlace activo y vigente e invitado activo (misma regla que la guarda de
// página); sin sesión válida, 401 sin cuerpo de datos.
export function conSesionPortal(
  h: (req: Request, sesion: SesionPortalVerificada) => Promise<Response> | Response,
): Manejador<unknown> {
  return async (req) => {
    const id = leerCookie(req, COOKIE_PORTAL);
    const fila = id ? await buscarSesionPortal(poolDe("portal"), id) : null;
    const r = validarSesionPortal(fila, new Date());
    if (!r.ok) return json(401, { motivo: r.motivo });
    return h(req, { enlaceId: r.enlaceId, invitadoId: r.invitadoId } as SesionPortalVerificada);
  };
}

export function conAutorizacion(
  accion: AccionPanel,
  h: (req: Request, sesion: ContextoPanel) => Promise<Response> | Response,
): (req: Request, sesion: ContextoPanel) => Promise<Response> | Response {
  if (!esAccion(accion)) throw new Error(`acción desconocida en MatrizPermisos: ${accion}`);
  return async (req, sesion) => {
    if (puede(sesion.rol, accion)) return h(req, sesion);
    // HU-124: el rechazo explica el rol y queda en el registro de accesos; si el registro fallara, el
    // rechazo se mantiene igual.
    try {
      await registrarAccesoRechazado(poolDe("panel"), {
        usuarioId: sesion.usuarioId,
        accion,
        recurso: `${req.method} ${new URL(req.url).pathname}`,
        ip: ipDelCliente(req),
      });
    } catch {
      // Sin registro el panel sigue sin escribir nada.
    }
    return json(403, { motivo: "sin_permiso", mensaje: MENSAJE_CONSULTA });
  };
}

export { json as respuestaJson };
