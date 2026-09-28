import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** @type {import('next').NextConfig} */
const config = {
  output: "standalone",
  outputFileTracingRoot: raiz,
  transpilePackages: ["@ps/ui", "@ps/motor", "@ps/contratos", "@ps/dominio", "@ps/infra"],
  poweredByHeader: false,
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  serverExternalPackages: ["pg"],
  // Cabeceras globales (ADR-0010 fila QA-5/CON-10); cubren también /_next/static.
  async headers() {
    const globales = [
      { key: "Strict-Transport-Security", value: "max-age=31536000" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
    ];
    return [
      { source: "/:ruta*", headers: globales },
      { source: "/api/:ruta*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
    ];
  },
};

export default config;
