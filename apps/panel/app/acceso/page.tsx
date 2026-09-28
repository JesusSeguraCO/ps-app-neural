// Pública (ADR-0002 H5): entrada al panel con correo @trycore.com y código de un uso (HU-123).
import { PuertaPanel } from "../../src/acceso/PuertaPanel";
import "./acceso.css";

export default async function Acceso({ searchParams }: { searchParams: Promise<{ motivo?: string }> }) {
  const { motivo } = await searchParams;
  return <PuertaPanel sesionTerminada={motivo === "sesion_expirada"} />;
}
