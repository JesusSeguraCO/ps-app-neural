// Pública (ADR-0002 H5): entrada al panel con correo @trycore.com y código de un uso (HU-123).
// Tras una sesión vencida, si su fila aún existe, explica la causa real y precarga el correo
// (prototipo panel-acceso--sesion-caducada). La cookie vencida no da acceso a nada más.
import { cookies } from "next/headers";
import { COOKIE_PANEL, explicarFinDeSesion } from "@ps/dominio/acceso/sesion";
import { poolDe } from "@ps/infra/postgres/pool";
import { buscarSesionPanel } from "@ps/infra/postgres/sesiones";
import { PuertaPanel } from "../../src/acceso/PuertaPanel";
import "./acceso.css";

export default async function Acceso({ searchParams }: { searchParams: Promise<{ motivo?: string }> }) {
  const { motivo } = await searchParams;
  const sesionTerminada = motivo === "sesion_expirada";
  if (!sesionTerminada) return <PuertaPanel sesionTerminada={false} />;
  const id = (await cookies()).get(COOKIE_PANEL)?.value;
  const fila = id ? await buscarSesionPanel(poolDe("panel"), id).catch(() => null) : null;
  return (
    <PuertaPanel
      sesionTerminada
      explicacion={explicarFinDeSesion(fila, new Date())}
      correoInicial={fila?.activo ? fila.correo : ""}
    />
  );
}
