// Frontera `hubspot-api` (build-config.json), lectura del contacto de una cuenta (HU-122; ADR-0005/0009):
// `fetch` con timeout, solo servidor. Fallo, timeout o respuesta inesperada → «desconocido», que el
// dominio trata como fallo cerrado: se escriben los invitados a mano y nada se bloquea por la caída.
import "server-only";
import { normalizarCorreo } from "@ps/dominio/acceso/codigo";

export type ContactoDeCuenta =
  | { estado: "con_contacto"; correos: string[] }
  | { estado: "sin_contacto" }
  | { estado: "desconocido" };

export interface LectorHubspot {
  contactoDeCuenta(cuentaRef: string): Promise<ContactoDeCuenta>;
}

const ID_HUBSPOT = /^\d{1,20}$/;

export function lectorHubspot(opciones: {
  token: string;
  timeoutMs?: number;
  base?: string;
  fetch?: typeof fetch;
}): LectorHubspot {
  const f = opciones.fetch ?? fetch;
  const base = opciones.base ?? "https://api.hubapi.com";
  const cabeceras = { authorization: `Bearer ${opciones.token}`, "content-type": "application/json" };
  return {
    async contactoDeCuenta(cuentaRef) {
      if (!ID_HUBSPOT.test(cuentaRef)) return { estado: "desconocido" };
      // Un solo presupuesto de tiempo para las dos llamadas.
      const senal = AbortSignal.timeout(opciones.timeoutMs ?? 5_000);
      try {
        const a = await f(`${base}/crm/v4/objects/companies/${cuentaRef}/associations/contacts?limit=10`, {
          headers: cabeceras,
          signal: senal,
        });
        if (a.status !== 200) return { estado: "desconocido" };
        const asociaciones = (await a.json()) as { results?: Array<{ toObjectId?: number | string }> };
        if (!Array.isArray(asociaciones.results)) return { estado: "desconocido" };
        const ids = asociaciones.results.map((x) => String(x.toObjectId ?? "")).filter((x) => ID_HUBSPOT.test(x));
        if (!ids.length) return { estado: "sin_contacto" };
        const c = await f(`${base}/crm/v3/objects/contacts/batch/read`, {
          method: "POST",
          headers: cabeceras,
          body: JSON.stringify({ properties: ["email"], inputs: ids.map((id) => ({ id })) }),
          signal: senal,
        });
        if (c.status !== 200) return { estado: "desconocido" };
        const contactos = (await c.json()) as { results?: Array<{ properties?: { email?: string | null } }> };
        if (!Array.isArray(contactos.results)) return { estado: "desconocido" };
        const correos = [
          ...new Set(
            contactos.results
              .map((x) => x.properties?.email)
              .filter((x): x is string => typeof x === "string" && x.includes("@"))
              .map(normalizarCorreo),
          ),
        ];
        return correos.length ? { estado: "con_contacto", correos } : { estado: "sin_contacto" };
      } catch {
        return { estado: "desconocido" };
      }
    },
  };
}

// Doble declarado (`DOBLES=hubspot`, solo local y CI): tres cuentas fijas, una por estado.
export class DobleHubspot implements LectorHubspot {
  async contactoDeCuenta(cuentaRef: string): Promise<ContactoDeCuenta> {
    if (cuentaRef === "hs-caido") return { estado: "desconocido" };
    if (cuentaRef === "hs-sin-contacto") return { estado: "sin_contacto" };
    return { estado: "con_contacto", correos: ["contacto@cliente-ficticio.com"] };
  }
}
