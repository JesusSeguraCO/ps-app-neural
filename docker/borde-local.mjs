// Borde emulado de desarrollo (ADR-0010 §3.1 `borde-local`): hace lo que la Transform Rule del borde
// en staging — pone la cabecera secreta `x-ps-edge` (sustituye la que traiga la petición) — y reenvía
// a la app del host. DESTINOS = "puerto=host:puerto,…". `/__borde` responde 200 (salud del contenedor).
import http from "node:http";

const secreto = process.env.EDGE_SECRET;
const destinos = (process.env.DESTINOS ?? "")
  .split(",")
  .filter(Boolean)
  .map((d) => {
    const [escucha, destino] = d.split("=");
    const [host, puerto] = destino.split(":");
    return { escucha: Number(escucha), host, puerto: Number(puerto) };
  });
if (!secreto || destinos.length === 0) {
  console.error("borde-local: faltan EDGE_SECRET o DESTINOS");
  process.exit(2);
}

for (const d of destinos) {
  http
    .createServer((req, res) => {
      if (req.url === "/__borde") return res.writeHead(200).end("ok");
      const salida = http.request(
        {
          host: d.host,
          port: d.puerto,
          path: req.url,
          method: req.method,
          headers: { ...req.headers, "x-ps-edge": secreto },
        },
        (r) => {
          res.writeHead(r.statusCode ?? 502, r.headers);
          r.pipe(res);
        },
      );
      salida.on("error", () => {
        if (!res.headersSent) res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
        res.end(`borde-local: la app de ${d.host}:${d.puerto} no responde`);
      });
      req.pipe(salida);
    })
    .listen(d.escucha, "0.0.0.0", () => console.log(`borde-local :${d.escucha} → ${d.host}:${d.puerto}`));
}
