// Ayudante de la colección Newman de EP-003 (solo pruebas locales). La API no deja publicar un perfil sin
// SARO/DISC, así que el caso «publicado heredado incompleto» (HU-178, D62: un publicado de antes de EP-003)
// solo se puede preparar por debajo de la app: este servidor quita el alcance y la fecha SARO de UN perfil
// creado por la propia corrida (primer apellido Newman<RUN>) en la BD aislada. Se niega a tocar la BD `ps`.
//   AYUDANTE_BD=postgres://ps_instalacion@127.0.0.1:54329/ps_ep003 AYUDANTE_RUN=<RUN> AYUDANTE_PORT=3219 node ayudante-ep-003.mjs
//   POST /heredado?codigo=PS-0000 → 200 {codigo, filas:1} | 404 {filas:0}
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";

const BD = process.env.AYUDANTE_BD;
const RUN = process.env.AYUDANTE_RUN;
const PORT = Number(process.env.AYUDANTE_PORT ?? 3219);
if (!BD || !RUN) throw new Error("AYUDANTE_BD y AYUDANTE_RUN obligatorios");
if (/\/ps$/.test(BD)) throw new Error("ayudante-ep-003: me niego a tocar la BD ps");

createServer((req, res) => {
  const u = new URL(req.url, "http://x");
  const codigo = u.searchParams.get("codigo") ?? "";
  const enviar = (s, o) => {
    res.writeHead(s, { "content-type": "application/json" });
    res.end(JSON.stringify(o));
  };
  if (req.method !== "POST" || u.pathname !== "/heredado" || !/^PS-\d{4}$/.test(codigo)) return enviar(400, {});
  const filas = execFileSync(
    "psql",
    [BD, "-qAt", "-v", "ON_ERROR_STOP=1", "-c",
      `WITH u AS (UPDATE inventario.perfiles SET saro_alcance_id = NULL, saro_fecha = NULL
         WHERE codigo = '${codigo}' AND primer_apellido = 'Newman${RUN.replace(/[^A-Za-z0-9]/g, "")}' AND estado = 'publicado' RETURNING 1)
       SELECT count(*) FROM u`],
    { encoding: "utf8" },
  ).trim();
  enviar(filas === "1" ? 200 : 404, { codigo, filas: Number(filas) });
}).listen(PORT, "127.0.0.1");
