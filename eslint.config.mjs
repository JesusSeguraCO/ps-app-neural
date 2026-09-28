// Lint del monorepo (typescript-eslint) con las reglas de ADR-0008 V8-2: sin Server Actions, sin
// Edge runtime y sin imports cruzados entre apps. Las prueba también apps/v8-2.test.ts.
import tseslint from "typescript-eslint";

const sinServerActionsNiEdge = {
  "no-restricted-syntax": [
    "error",
    {
      selector: "Program > ExpressionStatement[directive='use server']",
      message: "Server Actions prohibidas (ADR-0008 V8-2): muta solo por Route Handlers con conCsrf.",
    },
    {
      selector: "BlockStatement > ExpressionStatement[directive='use server']",
      message: "Server Actions prohibidas (ADR-0008 V8-2): muta solo por Route Handlers con conCsrf.",
    },
    {
      selector: "ExportNamedDeclaration VariableDeclarator[id.name='runtime'][init.value='edge']",
      message: "Edge runtime prohibido (ADR-0008 V8-2): todo corre en runtime nodejs.",
    },
    {
      selector: "Property[key.name='runtime'][value.value='edge']",
      message: "Edge runtime prohibido (ADR-0008 V8-2): todo corre en runtime nodejs.",
    },
  ],
};

const sinImportsDe = (otra) => ({
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        { group: [`@ps/${otra}`, `@ps/${otra}/*`], message: `Una app no importa de la otra (ADR-0008 §3).` },
        { group: [`**/apps/${otra}/**`, `../${otra}/**`, `../../${otra}/**`], message: "Una app no importa de la otra (ADR-0008 §3)." },
      ],
    },
  ],
});

export default tseslint.config(
  { ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**", "docs/**", "**/next-env.d.ts", ".local/**", ".claude/**", "_papelera/**"] },
  ...tseslint.configs.recommended,
  { files: ["**/*.{ts,tsx,mjs}"], rules: sinServerActionsNiEdge },
  { files: ["apps/portal/**/*.{ts,tsx}"], rules: sinImportsDe("panel") },
  { files: ["apps/panel/**/*.{ts,tsx}"], rules: sinImportsDe("portal") },
);
