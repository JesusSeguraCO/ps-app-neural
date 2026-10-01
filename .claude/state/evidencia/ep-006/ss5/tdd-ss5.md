# EP-006 · sub-slice 5 — evidencia TDD (determinista)

- Base: `832196c` + este commit · rama `feature/ep-006-administracion-del-inventario` · 2026-10-01
- Entorno: PostgreSQL 16 + PgBouncer local con roles reales; panel y portal standalone compilados; Chrome por MCP.
- vitest completo: 882 ✓ (3 omitidos preexistentes). e2e: 46 ✓ (1 omitido preexistente), incluida la nueva «vista previa de la ficha» (axe + sin scroll a 320/390 + ciudad según necesidad).
- Nuevos tests que sostienen el checklist: `packages/infra/src/postgres/publicar-perfil.test.ts` (11), `apps/ficha-compartida.test.ts` (6), `apps/publicar-panel.test.ts` (8 HTTP contra el standalone), `e2e/marco.panel.spec.ts` (vista previa).
- Ajustados por la nueva invariante (publicar exige modalidad, 0017): fixtures de `catalogos-panel`, `inventario`, `migracion-0014`, `catalogos-lexico-panel` y la siembra ficticia (`sembrar-ficticios.ts` da a los publicados la modalidad de su familia).
- Mutación acotada (`ss5/mutar-ss5.py`): publicar sin evaluar · disparador sin modalidad · masiva que aborta · ciudad siempre · vista previa que ignora el consentimiento · opcional vacío dibujado · Nivel 0 que no sale de la modalidad → **7/7 MUERTOS**, árbol restaurado tras cada una.
