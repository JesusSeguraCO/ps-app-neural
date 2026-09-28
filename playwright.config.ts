// E2E del esqueleto (ADR-0010 §3.2): los servidores standalone de portal y panel detrás de un borde
// emulado (la cabecera secreta la inyecta el navegador de pruebas, como la Transform Rule de
// Cloudflare). Requiere `next build` de ambas apps y la BD local (scripts/bd-local.sh arrancar).
import { execFileSync } from "node:child_process";
import { defineConfig, devices } from "@playwright/test";

function entorno(proceso: "portal" | "panel"): Record<string, string> {
  const salida = execFileSync("bash", ["scripts/entorno-dev.sh", proceso], { encoding: "utf8" });
  return Object.fromEntries(
    [...salida.matchAll(/^export ([A-Z_]+)=(.*)$/gm)].map((m) => [m[1]!, m[2]!]),
  );
}

const PORTAL = {
  ...entorno("portal"),
  PORT: "3100",
  HOSTNAME: "127.0.0.1",
  NODE_ENV: "production",
};
const PANEL = { ...entorno("panel"), PORT: "3101", HOSTNAME: "127.0.0.1", NODE_ENV: "production" };
const BORDE = { "x-ps-edge": PORTAL.EDGE_SECRET! };

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: { extraHTTPHeaders: BORDE, trace: "retain-on-failure" },
  projects: [
    {
      name: "portal",
      use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:3100" },
      testMatch: /portal|comun/,
    },
    {
      name: "panel",
      use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:3101" },
      testMatch: /panel|comun/,
    },
  ],
  webServer: [
    {
      command: "node apps/portal/.next/standalone/apps/portal/server.js",
      url: "http://127.0.0.1:3100/api/v1/salud/vivo",
      env: PORTAL,
      reuseExistingServer: false,
    },
    {
      command: "node apps/panel/.next/standalone/apps/panel/server.js",
      url: "http://127.0.0.1:3101/api/v1/salud/vivo",
      env: PANEL,
      reuseExistingServer: false,
    },
  ],
});
