// Llamadas del navegador a la API de acceso: CSRF de doble envío (cookie legible + cabecera).
const COOKIE_CSRF = "__Host-csrf";

function tokenCsrf(): string {
  const par = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE_CSRF}=`));
  return par ? decodeURIComponent(par.slice(COOKIE_CSRF.length + 1)) : "";
}

export async function enviarJson(
  ruta: string,
  cuerpo: unknown,
  metodo: "POST" | "PATCH" = "POST",
): Promise<Response> {
  return fetch(ruta, {
    method: metodo,
    headers: { "content-type": "application/json", "x-ps-csrf": tokenCsrf() },
    body: JSON.stringify(cuerpo),
    credentials: "same-origin",
  });
}
