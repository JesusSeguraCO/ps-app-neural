// Vivacidad (ADR-0010 §3.3): 200 sin consultar nada y sin cuerpo informativo.
export const dynamic = "force-dynamic";

export function GET() {
  return new Response(null, { status: 200, headers: { "cache-control": "private, no-store" } });
}
