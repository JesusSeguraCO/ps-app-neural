---
id: HU-120
titulo: "Comparar perfiles sin perder la lista"
epica: EP-003
prioridad: alta
complejidad: S
estado: lista
fase: referencias-juicebox
prd_version: 4.17
depende_de: []
---

# HU-120 — Comparar perfiles sin perder la lista

**Como** líder de proyecto que revisa seguidos varios perfiles de su selección o del banco,
**quiero** abrir la ficha sobre la lista y pasar al perfil anterior o siguiente sin cerrarla,
**para** comparar rápido sin perder dónde estaba ni tener que ir y volver por cada perfil.

## Criterios de aceptación

### Happy path — recorrer las fichas sobre la lista

**Esquema del escenario:** la ficha se abre sin perder la lista
**Dado** que tengo delante una lista de 5 perfiles en un <dispositivo>
**Y** que tengo abierta la ficha del segundo perfil
**Cuando** paso al perfil siguiente
**Entonces** veo la ficha del tercer perfil, que ocupa <espacio>
**Y** veo «3 de 5» como posición dentro de esa lista

**Ejemplos:**

| dispositivo | espacio |
|---|---|
| computador | un panel lateral sobre la lista, que sigue visible detrás |
| teléfono | la pantalla completa, con la navegación anterior / siguiente |

### Error — el último perfil de la lista, con el botón

**Dado** que tengo abierta la ficha del último perfil de una lista de 5,
**cuando** toco el botón «siguiente»,
**Entonces** el botón aparece deshabilitado y la ficha sigue en el mismo perfil, «5 de 5»
**Y** no salto al primer perfil ni a ningún perfil que no esté en la lista

### Edge case — el primer perfil de la lista, con el teclado

**Dado** que tengo abierta en un computador la ficha del primer perfil de una lista de 5,
**cuando** pulso la flecha izquierda del teclado,
**Entonces** la ficha sigue en el mismo perfil, «1 de 5», con el botón «anterior» deshabilitado
**Y** no salto al último perfil ni a ningún perfil que no esté en la lista

### Edge case — cerrar la ficha devuelve a la misma lista

**Dado** que filtré la lista de 5 perfiles y tengo abierta la ficha del tercero,
**cuando** cierro la ficha,
**Entonces** vuelvo a la misma lista, con el mismo filtro aplicado
**Y** la lista queda en la posición del tercer perfil, sin volver al principio

## Notas

Cubre **RF-13.11** (ficha en panel lateral, con navegación dentro del conjunto actual y pantalla completa en el teléfono).

Tomado de Juicebox (evidencia A). Reemplaza la navegación a pantalla completa, que obligaba a ir y volver por cada perfil.

**Ya construido en EP-006 (D47, 2026-10-01):** abrir la ficha en panel lateral sobre la selección o el banco, recorrerla con ← → en el orden de la lista, la flecha del extremo deshabilitada, Esc para cerrar volviendo a la misma lista y la pantalla completa en el teléfono (`apps/portal/src/ficha/PanelFicha.tsx`, `packages/dominio/src/catalogo/recorrido.ts`; spec `perfiles-inventario`, escenario «HU-120 · Recorrer fichas sin perder la lista»). Esta historia está, por tanto, **construida en buena parte**: en EP-003 sus escenarios **se vuelven a verificar** (incluidos los dos extremos y la vuelta «en la misma posición», que hay que comprobar contra lo construido) y se cierra lo que falte.

**Refinada el 2026-10-02 (discovery de EP-003).** El rol se precisa. La regla del teléfono se funde con el happy path en un esquema con ejemplos. La vuelta a la lista «en la misma posición» viene del diagrama de `docs/06-flows/EP-003`.

**Partida el 2026-10-02 por validación INVEST (fallas I y E).** Sumar al equipo desde la ficha dependía de la capacidad de sumar de **EP-004** (RF-4.1, RF-4.2), que no tiene historia redactada, y mezclaba algo ya construido con algo nuevo de estimación incierta. Se parte, **sin recortar alcance**: esta historia queda en recorrer las fichas sin perder la lista (complejidad M → S) y **sumar desde la ficha pasa a HU-175**, que lleva la dependencia con EP-004. La pregunta de si también se puede quitar desde la ficha la cerró **D73** (sponsor, 2026-10-02): sí, y vive en HU-175. Esta historia no cambia por eso. El escenario de extremo, que mezclaba botón y teclado en un mismo «Cuando», se parte en dos: último perfil con el botón y primer perfil con la flecha del teclado.

## Trazabilidad

Épica madre: **EP-003** · PRD v4.17 · RF-13.11 · parte de recorrer construida en EP-006 por D47 · sumar y quitar desde la ficha pasó a HU-175 (2026-10-02; quitar por D73) · relacionada con HU-119 (bloque «Frente a tu búsqueda» de la ficha) y HU-121 (abrir la ficha desde la tabla, EP-002)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ sin dependencias: recorrer funciona sobre la selección y el banco que ya existen; la parte que esperaba a EP-004 pasó a HU-175 |
| N | Negociable | ✓ son fijos el panel sobre la lista, la posición, los extremos sin salto circular y la vuelta a la misma lista; la forma de la barra, los atajos y la animación se pueden negociar |
| V | Valiosa | ✓ comparar perfiles seguidos es la tarea central de la evaluación; perder la lista cada vez la vuelve lenta |
| E | Estimable | ✓ S: ya está construida por D47; el trabajo es volver a verificar y cerrar lo que falte (posición tras cerrar, extremos con botón y teclado) |
| S | Pequeña | ✓ S: tres escenarios sobre un panel que ya existe |
| T | Testeable | ✓ e2e en computador y teléfono: posición «3 de 5», vuelta a la misma lista y posición, extremo con botón y con teclado sin salto |
