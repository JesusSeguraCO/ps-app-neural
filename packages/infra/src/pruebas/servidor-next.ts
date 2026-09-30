// Arranca el servidor standalone de una app ya compilada (`next build`) como en producción, con el
// entorno que se le pase, y ofrece un `fetch` que añade (o no) la cabecera de borde.
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";

export const RAIZ = fileURLToPath(new URL("../../../../", import.meta.url));

export type App = "portal" | "panel";

export function servidorStandalone(app: App): string {
  return `${RAIZ}apps/${app}/.next/standalone/apps/${app}/server.js`;
}

export function hayBuild(app: App): boolean {
  return existsSync(servidorStandalone(app));
}

export function entornoDev(
  proceso: "portal" | "panel" | "worker" | "migrar",
): Record<string, string> {
  const salida = execFileSync("bash", [`${RAIZ}scripts/entorno-dev.sh`, proceso], {
    encoding: "utf8",
  });
  const entorno: Record<string, string> = {};
  for (const linea of salida.split("\n")) {
    const m = linea.match(/^export ([A-Z_]+)=(.*)$/);
    if (m) entorno[m[1]!] = m[2]!;
  }
  return entorno;
}

async function puertoLibre(): Promise<number> {
  return new Promise((res, rej) => {
    const s = createServer();
    s.listen(0, "127.0.0.1", () => {
      const direccion = s.address();
      s.close(() =>
        typeof direccion === "object" && direccion
          ? res(direccion.port)
          : rej(new Error("sin puerto")),
      );
    });
  });
}

export interface ServidorPrueba {
  url: string;
  proceso: ChildProcess;
  salida: () => string;
  pedir(ruta: string, init?: RequestInit & { sinBorde?: boolean }): Promise<Response>;
  cerrar(): Promise<void>;
}

export async function arrancarServidor(
  app: App,
  entorno: Record<string, string>,
): Promise<ServidorPrueba> {
  const puerto = await puertoLibre();
  const proceso = spawn(process.execPath, [servidorStandalone(app)], {
    env: {
      PATH: process.env.PATH ?? "",
      NODE_ENV: "production",
      PORT: String(puerto),
      HOSTNAME: "127.0.0.1",
      ...entorno,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let salida = "";
  proceso.stdout?.on("data", (d) => (salida += String(d)));
  proceso.stderr?.on("data", (d) => (salida += String(d)));
  const url = `http://127.0.0.1:${puerto}`;

  const limite = Date.now() + 20_000;
  for (;;) {
    if (proceso.exitCode !== null)
      throw new Error(`el servidor ${app} salió con ${proceso.exitCode}: ${salida}`);
    try {
      await fetch(`${url}/api/v1/salud/vivo`);
      break;
    } catch {
      if (Date.now() > limite) throw new Error(`el servidor ${app} no respondió: ${salida}`);
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  return {
    url,
    proceso,
    salida: () => salida,
    pedir(ruta, init = {}) {
      const cabeceras = new Headers(init.headers);
      if (!init.sinBorde) cabeceras.set("x-ps-edge", entorno.EDGE_SECRET ?? "");
      return fetch(`${url}${ruta}`, { redirect: "manual", ...init, headers: cabeceras });
    },
    async cerrar() {
      if (proceso.exitCode !== null) return;
      const fin = new Promise((r) => proceso.once("exit", r));
      proceso.kill("SIGTERM");
      await fin;
    },
  };
}

// Arranca el proceso esperando que NO llegue a servir: devuelve su código de salida.
export async function codigoDeSalidaAlArrancar(
  app: App,
  entorno: Record<string, string>,
): Promise<number | null> {
  const puerto = await puertoLibre();
  const proceso = spawn(process.execPath, [servidorStandalone(app)], {
    env: {
      PATH: process.env.PATH ?? "",
      NODE_ENV: "production",
      PORT: String(puerto),
      HOSTNAME: "127.0.0.1",
      ...entorno,
    },
    stdio: "ignore",
  });
  const salida = await Promise.race([
    new Promise<number | null>((r) => proceso.once("exit", (c) => r(c))),
    new Promise<"vivo">((r) => setTimeout(() => r("vivo"), 15_000)),
  ]);
  if (salida === "vivo") {
    // Si llegó a escuchar, el test debe fallar: se comprueba y se mata.
    let escucha = false;
    try {
      await fetch(`http://127.0.0.1:${puerto}/api/v1/salud/vivo`);
      escucha = true;
    } catch {
      /* no escucha */
    }
    proceso.kill("SIGKILL");
    return escucha ? 0 : -1;
  }
  return salida;
}
