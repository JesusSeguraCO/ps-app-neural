// Presupuesto de rendimiento del shell (ADR-0008 V8-6 (a)): Lighthouse CI en móvil con Slow 4G simulado
// contra el servidor standalone del portal, como regresión. LCP < 2,5 s; JS inicial ≤ 200 KB comprimido.
// La cabecera de borde la pone el propio Lighthouse (borde emulado).
const { execFileSync } = require("node:child_process");

const entorno = Object.fromEntries(
  [...execFileSync("bash", ["scripts/entorno-dev.sh", "portal"], { encoding: "utf8" }).matchAll(/^export ([A-Z_]+)=(.*)$/gm)].map(
    (m) => [m[1], m[2]],
  ),
);
const variables = Object.entries({ ...entorno, PORT: "3110", HOSTNAME: "127.0.0.1", NODE_ENV: "production" })
  .map(([k, v]) => `${k}=${v}`)
  .join(" ");

module.exports = {
  ci: {
    collect: {
      startServerCommand: `env ${variables} node apps/portal/.next/standalone/apps/portal/server.js`,
      startServerReadyPattern: "Ready",
      url: ["http://127.0.0.1:3110/acceso", "http://127.0.0.1:3110/e"],
      numberOfRuns: 1,
      settings: {
        extraHeaders: JSON.stringify({ "x-ps-edge": entorno.EDGE_SECRET }),
        formFactor: "mobile",
        throttlingMethod: "simulate",
        chromeFlags: "--headless=new --no-sandbox",
      },
    },
    assert: {
      assertions: {
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "resource-summary:script:size": ["error", { maxNumericValue: 204800 }],
      },
    },
    upload: { target: "filesystem", outputDir: ".local/lhci" },
  },
};
