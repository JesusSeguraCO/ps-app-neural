// Llamadas del navegador a la API de acceso: CSRF de doble envío (cookie legible + cabecera).
const COOKIE_CSRF = "__Host-csrf";

function tokenCsrf(): string {
  const par = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE_CSRF}=`));
  return par ? decodeURIComponent(par.slice(COOKIE_CSRF.length + 1)) : "";
}

// Toda petición del navegador al panel pasa por aquí. Sesión vencida, rol bajado o baja a mitad de una
// acción (HU-138, HU-151): nada se escribió ni se leyó; vuelve a la puerta con la causa en vez de un
// «inténtalo de nuevo» que nunca funcionará. La puerta misma responde 401 a un código errado: esa la
// maneja su pantalla.
export async function pedir(ruta: string, init: RequestInit = {}): Promise<Response> {
  const r = await fetch(ruta, { credentials: "same-origin", ...init });
  if (r.status === 401 && !ruta.startsWith("/api/v1/acceso/")) {
    const { motivo } = (await r.clone().json().catch(() => ({}))) as { motivo?: string };
    window.location.assign(destinoTrasRechazo(motivo));
  }
  return r;
}

export function enviarJson(
  ruta: string,
  cuerpo: unknown,
  metodo: "POST" | "PATCH" = "POST",
  cabeceras: Record<string, string> = {},
): Promise<Response> {
  return pedir(ruta, {
    method: metodo,
    headers: { "content-type": "application/json", "x-ps-csrf": tokenCsrf(), ...cabeceras },
    body: JSON.stringify(cuerpo),
  });
}

// Solo las causas conocidas viajan en la URL (sin redirector abierto); cualquier otra, a la puerta.
export function destinoTrasRechazo(motivo: string | undefined): string {
  return motivo === "rol_cambiado" || motivo === "sesion_expirada"
    ? `/acceso?motivo=${motivo}`
    : "/acceso";
}
