// Lector del buzón doble (solo pruebas locales): expone por HTTP los correos que el worker "envió" con
// el doble de Mailgun (líneas {"evento":"correo_doble"} de su log), para que Newman lea el código de un
// uso sin tocar la app. No envía nada ni escribe en la BD.
//   BUZON_LOG=<ruta del log del worker> BUZON_PORT=3199 node buzon-doble.mjs
//   GET /codigo?para=<correo>&desde=<iso>&espera=<ms>   → 200 {codigo, asunto, ts} | 404 {codigo:null}
//   GET /correos?para=<correo>&desde=<iso>&espera=<ms>  → 200 {correos:[{asunto, ts}]} tras esperar
import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const LOG = process.env.BUZON_LOG;
const PORT = Number(process.env.BUZON_PORT ?? 3199);
if (!LOG) throw new Error("BUZON_LOG obligatorio");

function correos(para, desde) {
  const out = [];
  for (const l of readFileSync(LOG, "latin1").replace(/\0/g, "").split("\n")) {
    if (!l.includes('"correo_doble"')) continue;
    try {
      const m = JSON.parse(l);
      if (String(m.para).toLowerCase() === para && (!desde || m.ts >= desde)) out.push(m);
    } catch {}
  }
  return out;
}
const codigoDe = (t) => {
  const c = /\b(\d{3}) ?(\d{3})\b/.exec(t ?? "");
  return c ? c[1] + c[2] : null;
};
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

createServer(async (req, res) => {
  const u = new URL(req.url, "http://x");
  const para = (u.searchParams.get("para") ?? "").toLowerCase();
  const desde = u.searchParams.get("desde") ?? "";
  const espera = Math.min(Number(u.searchParams.get("espera") ?? 15000), 60000);
  const enviar = (s, b) => { res.writeHead(s, { "content-type": "application/json" }); res.end(JSON.stringify(b)); };
  if (u.pathname === "/codigo") {
    const fin = Date.now() + espera;
    while (Date.now() < fin) {
      const m = correos(para, desde).filter((x) => codigoDe(x.texto)).at(-1);
      if (m) return enviar(200, { codigo: codigoDe(m.texto), asunto: m.asunto, ts: m.ts });
      await dormir(250);
    }
    return enviar(404, { codigo: null });
  }
  if (u.pathname === "/correos") {
    await dormir(espera);
    return enviar(200, { correos: correos(para, desde).map((m) => ({ asunto: m.asunto, ts: m.ts })) });
  }
  enviar(404, {});
}).listen(PORT, "127.0.0.1", () => console.log(`buzon-doble en ${PORT}`));
