// Preparación (ADR-0010 §3.3): 200 si la BD responde con el rol del componente y el esquema está al
// día, en ≤ 2 s; si no, 503. Sin cuerpo informativo.
import { poolDe } from "@ps/infra/postgres/pool";
import { estaLista } from "@ps/infra/postgres/salud";

export const dynamic = "force-dynamic";

export async function GET() {
  const lista = await estaLista(poolDe("panel"));
  return new Response(null, { status: lista ? 200 : 503, headers: { "cache-control": "private, no-store" } });
}
