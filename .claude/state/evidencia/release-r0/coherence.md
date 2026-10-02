# Release Gate R0-ep001-ep006 · gate coherence (coherence-three-way) — FAIL

164 AC de 38 HU (EP-001: 49; EP-006: 115; sin HU-131 ni HU-149). Todos con escenario en spec y tarea marcada.
**158 con test real, 4 en parte, 2 sin test.** vitest con BD real en `c3ff45b`: 1229 ✓ / 1 omitido (Gemini real).
Sin código huérfano relevante.

## Sin test automático (bloquean)
1. **HU-133 · AC2 «el motivo es en realidad una fecha».** Código `apps/panel/src/inventario/EstadoEnLista.tsx:443-455` («¿Está ocupada hasta una fecha?», «Poner la fecha en que queda libre»); solo MCP. `apps/vigencia-panel.test.ts:166` dice «la hoja trae el desvío» pero no lo comprueba. Tarea 7.2 marcada.
   Fix: en el flujo de `e2e/marco.panel.spec.ts:512`, abrir «Pausar a…», comprobar el desvío, pulsar «Poner la fecha en que queda libre» → hoja cerrada, perfil sigue `publicado`, foco en la fecha; corregir el título de `vigencia-panel.test.ts:166`.
2. **HU-129 · AC2 «falta un dato que la publicación exige».** Marca del bloque incompleto (`apps/panel/src/inventario/VistaPrevia.tsx:91-111,258-278`; `packages/ui/src/FichaPerfil.tsx:55,95,104`, `vp-marca`, «Falta: …») sin test en positivo (solo se prueba la evaluación: `perfil.test.ts:47`, `publicar-panel.test.ts:120`). Tarea 5.3 marcada.
   Fix: test que abra la vista previa de un borrador incompleto y compruebe `.vp-marca` con el dato nombrado y el aviso de que no se puede publicar.

## En parte (no bloquean)
3. HU-129 AC4: se prueba que el portal sigue igual (`infra/editar-publicado.test.ts:137`), no que la vista previa muestra el cambio ni «Cambios sin guardar…» (`VistaPrevia.tsx:128`).
4. HU-088 AC4: `apps/importacion-panel.test.ts:434` solo ve el área de texto vacía; el relleno (`Asistente.tsx:73-102`) sin test.
5. HU-136 AC4: bandeja vacía solo en dominio (`vigencia.test.ts:123`); el texto de `apps/panel/app/vigencia/page.tsx:162-165` sin test.
6. HU-086 AC3: diferencia en la API (`importacion-panel.test.ts:219`, `plan.test.ts:120`); la tarjeta «Hoy / Si lo incluyes» sin test.

## Sin historia
`packages/motor/src/index.ts` (andamio de EP-009); `interpretarConsulta` sin consumidor (D46); título exagerado en `apps/catalogos-lexico-panel.test.ts:293` («búsqueda del portal» → intérprete con `ps_portal`).

## Matriz
EP-001: 49/49 con test (acceso-cliente, acceso-panel, aterrizaje-portal, banco-portal, enlaces-panel, invitaciones-colega, renovacion-enlace, renovaciones-panel, e2e acceso.portal). EP-006: 109 con test, 4 en parte, 2 sin test. La parte de HU-120 de D47: `ficha-portal.test.ts:88-111`, `e2e/acceso.portal.spec.ts:195`. Matriz completa AC → fichero:línea en el informe del revisor (sesión 2026-10-01).

## Veredicto
**FAIL** por 1 y 2. Opciones: A) dos tests con mutación (~2 h, recomendada); B) aceptar MCP como evidencia (contradice «verificación ejecutada»); C) A + los 4 parciales (~4 h).

## Re-verificación incremental (PR #11) — PASS
- HU-133 AC2 → `e2e/marco.panel.spec.ts:545-562` (desvío, hoja cerrada, foco en la fecha, BD sigue `publicado` sin motivo; textos de `EstadoEnLista.tsx:445-457`); título de `apps/vigencia-panel.test.ts:165` corregido.
- HU-129 AC2 → `e2e/marco.panel.spec.ts:263-276` («Bloques incompletos», «Impide publicar», `.fp-persona.vp-marca` «Falta: … primer apellido»).
- Ambos corrieron en verde en el runner (61 e2e ✓) y se validaron por mutación (`d96e5f4`).
- Arreglos del PR con test: CSV `packages/contratos/src/importacion.test.ts:170,178,185`; ficha «se está actualizando» `apps/ficha-portal.test.ts:158`; 0026 `migracion-0026.test.ts`; siembra `proceso.test.ts` y `sembrar-ficticios.test.ts`.
- Huecos menores (no bloquean): ningún test recorre el plan con una celda neutralizada (ida y vuelta); la salida de producción de `migrar.ts --sembrar-ficticios` la cubre `proceso.test.ts`; comentario de `sembrar-ficticios.ts:1` corregido.
