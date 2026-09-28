// V8-2 (ADR-0008): sin Server Actions ni Edge runtime, middleware en runtime nodejs, `next` fijado a
// ≥ 15.5 y < 16, y cada Route Handler mutante envuelto en `conCsrf`. El lint aplica las mismas reglas;
// este test comprueba además que el lint las tiene y que falla ante ellas.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RAIZ } from "@ps/infra/pruebas/servidor-next";

const APPS = ["portal", "panel"] as const;

function ficheros(dir: string, filtro: (f: string) => boolean): string[] {
  const salida: string[] = [];
  for (const f of readdirSync(dir)) {
    if (f === "node_modules" || f === ".next" || f === "dist") continue;
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) salida.push(...ficheros(p, filtro));
    else if (filtro(f)) salida.push(p);
  }
  return salida;
}

describe("V8-2", () => {
  it.each(APPS)("next de %s está en ≥ 15.5 y < 16", (app) => {
    const version = JSON.parse(readFileSync(`${RAIZ}node_modules/next/package.json`, "utf8"))
      .version as string;
    const [mayor, menor] = version.split(".").map(Number);
    expect(mayor).toBe(15);
    expect(menor).toBeGreaterThanOrEqual(5);
    const declarada = JSON.parse(readFileSync(`${RAIZ}apps/${app}/package.json`, "utf8"))
      .dependencies.next as string;
    expect(declarada).toMatch(/^15\.(5|[6-9])\./);
  });

  it.each(APPS)("el middleware de %s declara runtime nodejs", (app) => {
    const fuente = readFileSync(`${RAIZ}apps/${app}/middleware.ts`, "utf8");
    expect(fuente).toMatch(/runtime:\s*"nodejs"/);
  });

  it.each(APPS)("%s no contiene 'use server' ni runtime edge", (app) => {
    for (const f of ficheros(`${RAIZ}apps/${app}`, (n) => /\.(tsx?|mjs)$/.test(n))) {
      const fuente = readFileSync(f, "utf8");
      expect(fuente, f).not.toMatch(/["']use server["']/);
      expect(fuente, f).not.toMatch(/runtime\s*[=:]\s*["']edge["']/);
    }
  });

  it.each(APPS)("cada route.ts mutante de %s usa conCsrf", (app) => {
    for (const f of ficheros(`${RAIZ}apps/${app}/app`, (n) => n === "route.ts")) {
      const fuente = readFileSync(f, "utf8");
      const mutante = /export\s+(const|async function|function)\s+(POST|PUT|PATCH|DELETE)\b/.test(
        fuente,
      );
      if (mutante) expect(fuente, f).toMatch(/conCsrf\(/);
    }
  });

  it("el lint falla ante 'use server', runtime edge e imports cruzados", () => {
    const dir = mkdtempSync(`${RAIZ}apps/portal/.lint-v82-`);
    try {
      writeFileSync(`${dir}/accion.ts`, `"use server";\nexport async function a() {}\n`);
      writeFileSync(`${dir}/edge.ts`, `export const runtime = "edge";\n`);
      writeFileSync(`${dir}/cruzado.ts`, `import x from "@ps/panel";\nexport default x;\n`);
      let salida = "";
      try {
        execFileSync("npx", ["eslint", "--no-warn-ignored", dir], {
          cwd: RAIZ,
          encoding: "utf8",
          stdio: "pipe",
        });
      } catch (e) {
        salida = String((e as { stdout?: string }).stdout ?? "");
      }
      expect(salida).toContain("Server Actions prohibidas");
      expect(salida).toContain("Edge runtime prohibido");
      expect(salida).toContain("Una app no importa de la otra");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 60_000);
});
