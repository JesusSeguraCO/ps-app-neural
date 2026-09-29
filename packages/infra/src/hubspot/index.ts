// Frontera HubSpot de SOLO LECTURA (design §3, HU-092; frontera `hubspot-api`, forma get-company-status).
// Solo en el worker, con `HUBSPOT_PRIVATE_APP_TOKEN`. `estadoDeEmpresa`: por id si el enlace lo tiene;
// si no, por nombre exacto con una sola coincidencia (desde la enmienda del 2026-09-28 la cuenta se
// escribe a mano). La propiedad «cuenta activa» y su valor se fijan en configuración, no en código.
// Cualquier fallo, timeout o ambigüedad → «desconocido»: el dominio lo trata como fallo cerrado.
import "server-only";
import { z } from "zod";
import type { EstadoEmpresa } from "@ps/dominio/enlaces/renovacion";

export interface ConsultaHubspot {
  estadoDeEmpresa(empresa: { id: string | null; nombre: string }): Promise<EstadoEmpresa>;
}

const BASE = "https://api.hubapi.com";
const Empresa = z.object({ id: z.string(), properties: z.record(z.string(), z.string().nullable().optional()) });
const Busqueda = z.object({ total: z.number(), results: z.array(Empresa) });
const Propietario = z.object({ email: z.string().nullable().optional() });

export function consultaHubspot(o: {
  token: string;
  propiedad: string; // HUBSPOT_PROP_CUENTA_ACTIVA
  valorActiva: string; // HUBSPOT_VALOR_CUENTA_ACTIVA
  timeoutMs?: number; // ADR-0009: 20 s
  fetch?: typeof fetch;
}): ConsultaHubspot {
  const f = o.fetch ?? fetch;
  const propiedades = [o.propiedad, "hubspot_owner_id"];
  const pedir = async (ruta: string, init: RequestInit = {}) => {
    const r = await f(`${BASE}${ruta}`, {
      ...init,
      headers: { authorization: `Bearer ${o.token}`, "content-type": "application/json" },
      signal: AbortSignal.timeout(o.timeoutMs ?? 20_000),
    });
    if (!r.ok) throw new Error(`hubspot ${r.status}`);
    return r.json();
  };

  return {
    async estadoDeEmpresa({ id, nombre }) {
      try {
        let empresa: z.infer<typeof Empresa>;
        if (id) {
          empresa = Empresa.parse(
            await pedir(`/crm/v3/objects/companies/${encodeURIComponent(id)}?properties=${propiedades.join(",")}`),
          );
        } else {
          const b = Busqueda.parse(
            await pedir("/crm/v3/objects/companies/search", {
              method: "POST",
              body: JSON.stringify({
                filterGroups: [{ filters: [{ propertyName: "name", operator: "EQ", value: nombre.trim() }] }],
                properties: propiedades,
                limit: 2,
              }),
            }),
          );
          if (b.total !== 1 || b.results.length !== 1) return { estado: "desconocido" };
          empresa = b.results[0]!;
        }
        const activa = empresa.properties[o.propiedad] === o.valorActiva;
        const duenio = empresa.properties.hubspot_owner_id;
        let propietario: string | null = null;
        if (duenio) {
          try {
            propietario = Propietario.parse(await pedir(`/crm/v3/owners/${encodeURIComponent(duenio)}`)).email ?? null;
          } catch {
            propietario = null; // sin correo del propietario, el aviso va a Talento Humano
          }
        }
        return { estado: activa ? "activa" : "inactiva", propietario };
      } catch {
        return { estado: "desconocido" };
      }
    },
  };
}

// Doble declarado (DOBLES=hubspot, solo local y ci): estados sembrados por nombre de cuenta.
export type EmpresaDoble = { estado: "activa" | "inactiva"; propietario: string | null } | "sin_respuesta";

export class DobleHubspot implements ConsultaHubspot {
  readonly consultas: string[] = [];
  constructor(private readonly empresas: Record<string, EmpresaDoble> = {}) {}
  async estadoDeEmpresa({ nombre }: { id: string | null; nombre: string }): Promise<EstadoEmpresa> {
    this.consultas.push(nombre);
    const e = this.empresas[nombre];
    if (!e || e === "sin_respuesta") return { estado: "desconocido" };
    return e;
  }
}

// DOBLE_HUBSPOT_EMPRESAS='{"Bancolombia":{"estado":"activa","propietario":"x@trycore.com"},"Caida":"sin_respuesta"}'
export function dobleDesdeEntorno(crudo: string | undefined): DobleHubspot {
  try {
    return new DobleHubspot(crudo ? (JSON.parse(crudo) as Record<string, EmpresaDoble>) : {});
  } catch {
    return new DobleHubspot({});
  }
}
