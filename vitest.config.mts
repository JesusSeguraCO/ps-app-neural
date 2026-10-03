// Vitest del monorepo. `server-only` lanza fuera de la condición `react-server`,
// así que en tests (igual que en el bundle del worker) se redirige a un módulo vacío (ADR-0008).
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const vacio = fileURLToPath(new URL("./scripts/server-only-vacio.mjs", import.meta.url));

export default defineConfig({
  // Los componentes de las apps Next (tsconfig con `jsx: preserve`) también se dibujan en los tests con
  // el runtime automático de React, como los de `packages/ui`.
  oxc: { jsx: { runtime: "automatic" } },
  resolve: {
    alias: { "server-only": vacio },
  },
  test: {
    include: ["{apps,packages}/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
  },
});
