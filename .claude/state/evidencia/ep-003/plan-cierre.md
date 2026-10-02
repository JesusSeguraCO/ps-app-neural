# EP-003 · plan de cierre de la épica (grupo 8 de tasks.md)

Estado de partida: SS1–SS7 construidos en `feature/ep-003-evidencia-del-perfil` (sin push), cada uno con su
`wiring_checklist` en `passing` (evidencia ejecutada en `ssN/wiring/`, al menos una mutación muerta por item),
suite completa verde y journey smoke propio. Ningún gate de épica se ha cerrado: `tdd`, `journey_smoke`,
`fidelity`, `api`, `data`, `wiring_verified` y `dod` siguen en `false`.

## Pendiente de una persona (antes de `fidelity`)
- Aprobar las capturas de `ss1/`…`ss7/fidelidad.md` (D124/D126: pantallas sin prototipo sobre patrones de
  EP-006; SS4–SS7 con prototipo v2). Tareas 1.x/2.x/3.5/4.6/5.5/6.5/7.6 marcadas `[ ]` hasta esa aprobación.
- Revisión de copy con Mercadeo (D73), todo centralizado: `packages/ui/src/copy.ts` (ficha, cierre, respaldo,
  encabezado) y `packages/dominio/src/catalogo/estandar.ts` (frases «ningún»/descriptiva y cuatro dimensiones).
  Nota abierta: los textos de alcance SARO que terminan en punto se leen «… fiscales. · marzo de 2026».

## Orden propuesto (inner loop, `slice-ops.sh next-step` manda)
1. **tdd** — re-anclar a HEAD: `REQUIERE_BD=1 npx vitest run` + `npx eslint .` + `npm run typecheck`
   (plantilla `scratchpad/evid.sh`, como `ssN/suite-completa.md`).
2. **journey_smoke** — re-correr en servidores aislados (portal 3200 / panel 3201, `ps_ep003`, D125) los recorridos
   de los siete SS: `validaciones-entrada.panel`, `incompleto-lenguaje.panel`, `importacion-saro.panel`,
   `tarjeta-evidencia.portal`, `ficha-validacion-contacto.portal`, `ficha-saro-cierre.portal`,
   `estandar-recorrido.portal`, más la regresión e2e completa con
   `.local/playwright.ep003.config.ts`. Fallas conocidas del entorno aislado, no del producto:
   `marco.panel.spec.ts:812` (origin 3101 fijo) y `:952` (navega a 3100). Decidir si se parametrizan o se
   corren contra la BD compartida tras migrar `ps` (D125: `ps` no se migra hasta el merge).
3. **fidelity** — solo con la aprobación de arriba y capturas MCP vigentes (regla 7).
4. **api** — Newman (`api-contract-tester`) sobre los endpoints tocados: `/api/v1/catalogo` (sello, tecnologías),
   `/api/v1/perfiles/*` (SARO/DISC, avisos de lenguaje, D1), catálogo de alcances SARO, importación
   (plantilla/exportación con SARO/DISC).
5. **data** — `data-consistency-checker`: una sola regla de publicación (`evaluarPublicacion` → «Incompleto»,
   conteo del encabezado, D1, importación), vistas 0027–0029 sin B.4, contrato estricto de ficha y tarjeta.
6. **wiring_verified** — `wiring-adversarial-verifier` (contexto virgen) sobre todo el change; puntos que
   conviene que mire: ruta gemela del encuadre del banco sin perfiles (también lleva el encabezado), velo y Esc de
   la ficha con el ancla, vista previa del panel con contacto, conteo degradado.
7. **dod** → `dor-dod-gatekeeper`, PR (`gh pr create`, sin push previo de este agente) y `openspec archive`.

## Riesgos para el Release Gate
- **M-8 (PRD §8.1, texto ≥ 13 px en la cara cliente)**: lo de SS6–SS7 cumple; quedan textos de 12 px anteriores
  (`.pp-meta`, `.rs-sello`, `.fp-atajos`, campos de la validación técnica, `.fp-validacion__nota`).
- **Migrar `ps`** al merge (D125): 0028 bloquea publicar sin SARO/DISC; la demo y las e2e de `main` lo notarán.
- **La frase «ningún»** solo aparece con 0 incompletos en todo el banco: con los heredados de demostración
  (`--heredados-incompletos`) la demo mostrará la versión descriptiva (es lo que D80 pide).

## Retomar aquí (pausa del sponsor, 2026-10-02)

**Gates cerrados:** `tdd` → `gate-tdd.md` (suite 1548/1548, lint y tipos en verde; 95 items de wiring, 94 con
mutante muerto y el e2e INT-SS1-journey-smoke sin mutación propia; M14–M17 añadidas en el cierre).

**Con evidencia lista pero sin registrar** (van después de `journey_smoke` en el orden de fases):
- `fidelity` → `gate-fidelity.md` + `fidelidad-final/` (re-captura MCP en HEAD de selección, encabezado y ficha) y
  desviaciones en `design.md` § «Fidelidad final de la épica» (commit 017089d).
- `data` → `gate-data.md` (data-consistency-checker: 5 invariantes CUMPLE; observación: `faltasDePublicado` en
  `packages/dominio/src/importacion/plan.ts:603` es una segunda lista que no llama a `evaluarPublicacion`).
- `api` → `gate-api.md` (Newman: 71 peticiones, 179 aserciones, 0 fallidas, rc 0; commits fc27548, e5ceb69, c3ce4ea).
  Ojo: una corrida previa del Newman borró perfiles marcador y dejó colisión de códigos (500) en `ps_ep003` entre ~22:46 y
  22:48 UTC; ya se archivan en vez de borrarse (detalle en gate-api.md).

**Gate pendiente: `journey_smoke`.** `runner-integracion.md` salió ROJO solo por la e2e
`estandar-recorrido.portal` (código de acceso no llegó): causa probable, el worker del Newman corría a la vez sobre
`ps_ep003` y se llevó el trabajo `enviar_codigo` (job 157 despachado en 7 ms). Aislado, acceso+estandar pasan
(13/13). El recorrido integrado 8.1 pasa 2 veces (`journey-integrado.md`, spec `e2e/journey-ep003.portal.spec.ts`).
`marco.panel` :824/:952 ya pasan con PORTAL_URL/PANEL_URL (commit 71305da).

**Siguiente paso exacto** (sin otro proceso sobre `ps_ep003` ni en 3200/3201/3210/3211):
1. `bash /private/tmp/claude-501/-Users-cmo-Local-claude-Apps-App-People-Service/e5d4a5ad-ce69-4930-81c2-9b46673c9ba5/scratchpad/runner-ep003.sh .claude/state/evidencia/ep-003/runner-integracion.md`
   (fases build, migrar sobre ps_ep003, lint, tipos, tests, e2e con `.local/playwright.ep003.config.ts`; ahora incluye el journey 8.1).
2. Si VERDE: escribir `gate-journey-smoke.md` (runner + `journey-integrado.md`) y
   `slice-ops.sh phase smoke` → `gate journey_smoke pass --evidence-file …` → `gate fidelity pass --evidence-file gate-fidelity.md`
   → `phase api` → `gate api …` → `phase data` → `gate data pass --evidence-file gate-data.md` (re-anclar sha a HEAD).
3. Opcional antes de cerrar: mutación del e2e INT-SS1-journey-smoke (M2 en `perfil.ts`, recompilar panel, correr `validaciones-entrada.panel`).
No cerrar `wiring_verified` ni `dod` (verificador independiente).

**Actualización `api` (tras la pausa):** `gate-api.md` listo: Newman 71 peticiones, 179 aserciones, 0 fallidas, rc 0
(commits fc27548, e5ceb69, c3ce4ea). Límites: la ficha del portal se verificó sobre HTML (no hay JSON) y la importación
por lotes con SARO/DISC no está en Newman (sí plantilla y exportación). Incidente ya corregido: una primera limpieza
borró perfiles y provocó códigos PS repetidos (500) en `ps_ep003` entre ~22:46 y 22:48 UTC; se insertaron 7
marcadores archivados y la limpieza ahora archiva.

## Estado tras la reanudación (2026-10-02T23:33:11Z, sha 9c04167)
Registrados: `journey_smoke`, `fidelity`, `api`, `data` (con `tdd` y `dor`/`coherence_link` ya en true). Runner VERDE
(1554 tests, 71 e2e); Newman en HEAD 82/211/0; refactor d751aa1 con mutaciones M18–M21. Los avisos `phase_advanced`
quedaron encolados en el runtime («se entregan al reconectar»). Siguiente: `wiring_verified` con el verificador
independiente (contexto virgen) y después `dod`.
