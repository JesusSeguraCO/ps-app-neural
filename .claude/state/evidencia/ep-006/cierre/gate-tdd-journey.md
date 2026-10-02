# EP-006 · gates tdd y journey_smoke — anclados a HEAD b4110f8 (2026-10-01)

Runner determinista `tools/loop/integration-check.sh` re-ejecutado en HEAD `b4110f8` (tras los arreglos de 11.3, commit 4850728): **VERDE**.
- bd-local, build (panel + portal), migrar, lint, tipos: OK
- tests: 106 ficheros, 1203 ✓ / 1 omitido / 0 fallos
- e2e: 58 ✓ · Lighthouse OK
- Journey integrado de punta a punta (`apps/recorrido-ep006.test.ts`, 11 pasos con worker y cola reales) incluido en la suite: ver `recorrido-11.1.md`.
- TDD por sub-slice (rojo → verde, mutación de los tests que sostienen el cableado): evidencias `ss1/`–`ss10/`.

Reporte completo: `integration-report-head-b4110f8.txt`.
