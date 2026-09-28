// Lint base del monorepo (typescript-eslint). Las reglas de ADR-0008 V8-2
// (sin Server Actions, sin Edge runtime, sin imports cruzados entre apps)
// se añaden en el sub-slice 1 de EP-001 junto con sus tests.
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**", "docs/**", "**/next-env.d.ts"] },
  ...tseslint.configs.recommended,
);
