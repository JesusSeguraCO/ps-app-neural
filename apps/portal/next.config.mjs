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
};

export default config;
