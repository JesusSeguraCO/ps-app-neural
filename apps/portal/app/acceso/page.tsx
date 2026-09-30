// Pública (ADR-0002 H5): a dónde redirige la guarda sin sesión válida. Sin datos: explica qué hacer.
//  - enlace_revocado → «Este enlace ya no abre» (HU-144)
//  - enlace_vencido  → pantalla de renovación (HU-092); la sesión vencida identifica el enlace
//  - sesion_expirada o sin motivo → «abre el enlace de tu correo»
import { cookies } from "next/headers";
import { COOKIE_PORTAL } from "@ps/dominio/acceso/sesion";
import { poolDe } from "@ps/infra/postgres/pool";
import { buscarSesionPortal } from "@ps/infra/postgres/sesiones";
import { AbreTuEnlace, EnlaceRevocado, Tarjeta } from "../../src/acceso/Pantallas";
import { PuertaCliente } from "../../src/acceso/PuertaCliente";
import "../acceso.css";

export default async function Acceso({ searchParams }: { searchParams: Promise<{ motivo?: string }> }) {
  const { motivo } = await searchParams;
  if (motivo === "enlace_revocado")
    return (
      <Tarjeta>
        <EnlaceRevocado />
      </Tarjeta>
    );
  if (motivo === "enlace_vencido") {
    const id = (await cookies()).get(COOKIE_PORTAL)?.value;
    const fila = id ? await buscarSesionPortal(poolDe("portal"), id).catch(() => null) : null;
    return (
      <Tarjeta>
        <PuertaCliente inicial="vencido" vencio={fila?.enlaceVigenteHasta.toISOString() ?? null} />
      </Tarjeta>
    );
  }
  return (
    <Tarjeta>
      <AbreTuEnlace sesionTerminada={motivo === "sesion_expirada"} />
    </Tarjeta>
  );
}
