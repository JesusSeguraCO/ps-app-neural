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
