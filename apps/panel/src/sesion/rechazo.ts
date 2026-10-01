// Rechazo por rol al llegar por una dirección de escritura (HU-124 error): la página explica que el rol
// es de consulta y el intento queda en el registro de accesos como `acceso_rechazado`, igual que el 403
// de los endpoints (`conAutorizacion`). Si el registro fallara, la página se muestra igual.
import "server-only";
import { headers } from "next/headers";
import type { AccionPanel } from "@ps/dominio/acceso/permisos";
import { registrarAccesoRechazado } from "@ps/infra/postgres/observador";
import { poolDe } from "@ps/infra/postgres/pool";
import type { SesionVerificada } from "./exigirSesion";

export async function registrarRechazoDePagina(
  sesion: SesionVerificada,
  accion: AccionPanel,
  ruta: string,
): Promise<void> {
  const h = await headers();
  try {
    await registrarAccesoRechazado(poolDe("panel"), {
      usuarioId: sesion.usuarioId,
      accion,
      recurso: `GET ${ruta}`,
      ip: h.get("do-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    });
  } catch {
    // El rechazo no depende del registro: nada se escribió en el recurso.
  }
}
