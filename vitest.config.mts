// Vitest del monorepo. `server-only` lanza fuera de la condición `react-server`,
// así que en tests (igual que en el bundle del worker) se redirige a un módulo vacío (ADR-0008).
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const vacio = fileURLToPath(new URL("./scripts/server-only-vacio.mjs", import.meta.url));

export default defineConfig({
  resolve: {
    alias: { "server-only": vacio },
  },
  test: {
    include: ["{apps,packages}/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
  },
});
