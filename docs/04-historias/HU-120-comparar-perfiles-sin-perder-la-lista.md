---
id: HU-120
titulo: "Comparar perfiles sin perder la lista"
epica: EP-003
prioridad: alta
complejidad: M
estado: draft
fase: referencias-juicebox
prd_version: 4.17
---

# HU-120 — Comparar perfiles sin perder la lista

**Como** líder de proyecto que revisa seguidos varios perfiles de su selección o del banco,
**quiero** abrir la ficha sobre la lista, pasar al perfil anterior o siguiente y sumarlo a mi equipo sin cerrarla,
**para** comparar rápido sin perder dónde estaba ni tener que ir y volver por cada perfil.

## Criterios de aceptación

### Happy path — recorrer las fichas sobre la lista

**Esquema del escenario:** la ficha se abre sin perder la lista
**Dado** que tengo delante una lista de 5 perfiles en un <dispositivo>
**Y** que tengo abierta la ficha del segundo perfil
**Cuando** paso al perfil siguiente
**Entonces** veo la ficha del tercer perfil, que ocupa <espacio>
**Y** veo «3 de 5» como posición dentro de esa lista
**Y** al cerrar la ficha vuelvo a la misma lista, con el mismo filtro y en la misma posición

**Ejemplos:**

| dispositivo | espacio |
|---|---|
| computador | un panel lateral sobre la lista, que sigue visible detrás |
| teléfono | la pantalla completa, con la navegación anterior / siguiente |

### Happy path — sumar desde la ficha sin cerrarla

**Dado** que tengo abierta la ficha de un perfil que no está en mi equipo,
**cuando** lo sumo a mi equipo desde la ficha,
**Entonces** el perfil queda sumado y el indicador de mi equipo aumenta en uno
**Y** la ficha sigue abierta en el mismo perfil y dice que ya está en mi equipo
**Y** puedo pasar al perfil siguiente sin volver a la lista

### Error — primer o último perfil de la lista

**Dado** que tengo abierta la ficha del último perfil de la lista,
**cuando** intento pasar al siguiente, con el botón o con la flecha del teclado,
**Entonces** el botón «siguiente» aparece deshabilitado y no pasa nada
**Y** no salto al primer perfil ni a ningún perfil que no esté en la lista

## Notas

Cubre **RF-13.11** (ficha en panel lateral, con navegación dentro del conjunto actual y pantalla completa en el teléfono). Para el «sumar» se apoya en **RF-4.1** y **RF-4.2** (EP-004).

Tomado de Juicebox (evidencia A). Reemplaza la navegación a pantalla completa, que obligaba a ir y volver por cada perfil.

**Ya construido en EP-006 (D47, 2026-10-01):** abrir la ficha en panel lateral sobre la selección o el banco, recorrerla con ← → en el orden de la lista, la flecha del extremo deshabilitada, Esc para cerrar volviendo a la misma lista y la pantalla completa en el teléfono (`apps/portal/src/ficha/PanelFicha.tsx`, `packages/dominio/src/catalogo/recorrido.ts`; spec `perfiles-inventario`, escenario «HU-120 · Recorrer fichas sin perder la lista»). En EP-003 esos escenarios **se vuelven a verificar** como parte de la historia. Lo nuevo es **sumar desde la ficha**, que quedó explícitamente en EP-003.

**Refinada el 2026-10-02 (discovery de EP-003).** El rol se precisa. El «Cuando» del escenario de error pasa a ser una acción (antes era «miro la navegación»). La regla del teléfono se funde con el happy path en un esquema con ejemplos, de modo que la historia queda en tres escenarios, proporcional a M. La vuelta a la lista «en la misma posición» viene del diagrama de `docs/06-flows/EP-003`.

**Dependencia con EP-004:** sumar a «Mi equipo» y el indicador con el conteo son capacidades de **EP-004** (RF-4.1, servidor por invitado; RF-4.2). Hoy esas capacidades **no tienen historia redactada** (deuda del mapa de historias). Esta historia solo fija que sumar desde la ficha no la cierra. Hasta que EP-004 exista, el escenario de sumar se construye contra el equipo que defina EP-004 o se secuencia después de ella.

**Pregunta abierta para el sponsor:** si el perfil ya está en mi equipo, ¿la ficha permite también **quitarlo** desde ahí (el prototipo alterna «Sumar al equipo» / «En el equipo»)? RF-4.1 habla de sumar y quitar, pero no dice desde dónde.

## Trazabilidad

Épica madre: **EP-003** · PRD v4.17 · RF-13.11 · RF-4.1 · RF-4.2 · parte de recorrer construida en EP-006 por D47 · depende de la capacidad de sumar de EP-004 (sin historia aún) · relacionada con HU-119 (bloque «Frente a tu búsqueda» de la ficha) y HU-121 (abrir la ficha desde la tabla, EP-002)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: recorrer ya funciona sola; sumar necesita el equipo de EP-004, así que ese escenario se secuencia detrás de EP-004 o se construye contra su contrato |
| N | Negociable | ✓ son fijos el panel sobre la lista, la posición, los extremos y sumar sin cerrar; la forma de la barra, los atajos y la animación se pueden negociar |
| V | Valiosa | ✓ comparar perfiles seguidos es la tarea central de la evaluación; perder la lista cada vez la vuelve lenta |
| E | Estimable | ✓ M: recorrer ya existe y se vuelve a verificar; lo nuevo es una acción en la ficha que llama a la capacidad de EP-004 y deja el panel abierto |
| S | Pequeña | ✓ M: tres escenarios sobre un panel que ya existe |
| T | Testeable | ✓ e2e en computador y teléfono: posición «3 de 5», vuelta a la misma lista, extremo deshabilitado y contador del equipo tras sumar |
