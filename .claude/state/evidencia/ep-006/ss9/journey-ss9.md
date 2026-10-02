# EP-006 · sub-slice 9 — journey smoke

Recorrido de 9.7: registrar un colocado → pestaña ordenada → cargar Operaciones con una diferencia → el panel gana →
entrar como observador y ver sin editar.

1. **Playwright** (`e2e/marco.panel.spec.ts`, 56 ✓ con 2 workers):
   - «colocados (HU-137)»: registrar sin liberación → aviso sin guardar → con liberación → fila en el grupo de 60 días
     → hoja «Lo que ve el cliente»; axe y 320/390.
   - «carga de Operaciones (HU-150)»: xlsx rechazado entero → CSV aplicado con columna ignorada → la fila distinta del
     colocado del panel queda como diferencia (el panel conserva sus datos) → «Aceptar la de Operaciones».
   - «observador (HU-124)»: listado sin controles → dirección de edición con «tu rol es de consulta» → «Avisar».
2. **MCP chrome-devtools, clics reales** (`fidelidad-ss9.md`): registrar Laura Méndez (PS-1473) en Bancolombia → la
   pestaña la ordena por vencimiento → subir `archivos/asignaciones-operaciones-02oct.csv` → «Se aplicaron 3 de 5»,
   dos filas con motivo y la diferencia de PS-1466 (el panel conserva 13 nov mientras no se decide) → aceptar → el
   portal pasa a 30 nov → corte atrasado 9 días: «dato desincronizado» → sesión de observadora: inventario con
   «Avisar», editor inerte, aviso enviado y `acceso_rechazado` registrado. Consola limpia.
3. «Mantener la del panel» (descartar) por la API e infra: `colocados.test.ts` (infra, «gana el panel…») y
   `colocados-panel.test.ts` (409 al decidir dos veces).

Corrida 2026-10-01 con BD real: vitest 1121 ✓ (3 workers), Playwright 56 ✓; mutación 9.1 4/4 (`mutar-ss9.out`),
9.2 3/3, 9.3 5/5, 9.4 4/4.
