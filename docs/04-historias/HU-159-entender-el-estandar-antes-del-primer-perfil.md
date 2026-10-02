---
id: HU-159
titulo: "Entender el estándar Neural-Grid antes del primer perfil"
epica: EP-003
prioridad: alta
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.17
---

# HU-159 — Entender el estándar Neural-Grid antes del primer perfil

**Como** líder de área que abre por primera vez una selección de perfiles de Trycore,
**quiero** leer, antes del primer perfil y sin que me lo impida ver, qué verificó Trycore de todos ellos y qué respalda el servicio,
**para** evaluar a cada persona por lo que la diferencia, sabiendo que lo básico ya está comprobado en todas.

## Criterios de aceptación

### Happy path — el estándar se declara una vez, arriba

**Esquema del escenario:** la declaración precede a los perfiles en cada lista
**Dado** que tengo una sesión válida y entro a <lista>
**Cuando** carga la página
**Entonces** antes del primer perfil veo un encabezado breve que explica el estándar Neural-Grid
**Y** veo, con autoridad y una sola vez, que ningún perfil llega al portal sin verificación de identidad bajo SARO, prueba técnica en vivo y evaluación DISC
**Y** ninguna tarjeta de la lista repite esa declaración ni lleva una insignia del estándar

**Ejemplos:**

| lista |
|---|
| la selección de mi correo |
| el banco completo, al ampliar la búsqueda |

### Happy path — el respaldo y el plazo están a la vista

**Dado** que estoy en la selección de mi correo,
**cuando** llego al bloque de respaldo del servicio,
**Entonces** veo Trycore University, Hive Mind y la Coordinación de Servicio dedicada
**Y** veo que Trycore responde a una solicitud en 10 días hábiles, en el tamaño del texto de la página y no en una nota al pie

### Edge case — el encuadre no bloquea la exploración en el teléfono

**Dado** que entro a la selección de mi correo desde un teléfono,
**cuando** carga la página,
**Entonces** veo el encabezado del estándar y puedo bajar hasta el primer perfil sin cerrar, aceptar ni descartar nada
**Y** el encabezado no se abre como una ventana sobre la lista ni vuelve a aparecer encima de ella al recorrer los perfiles

## Notas

Cubre **RF-6.1** (encabezado breve antes del primer resultado, sin bloquear la exploración), **RF-6.4** (declaración de condición de entrada, una vez, no por tarjeta), **RF-6.3** (bloque de respaldo), **RF-6.2** en el recorrido (SLA visible, no en letra pequeña), la regla 1 de **B.6** (uniforme no es invisible: no se repite) y el lado del encabezado de **RF-3.8** (el estándar se declara arriba, como condición de entrada).

**Superficies compartidas con otras épicas:** el encabezado vive sobre la selección curada (aterrizaje de **EP-001**, HU-091 y HU-144: `apps/portal/app/page.tsx`) y sobre el banco ampliado (**EP-001**, RF-2.2, `apps/portal/app/banco/page.tsx`), donde **EP-002** pondrá sus facetas y **EP-009** la barra de instrucción. Esta historia añade el bloque sin cambiar los criterios de esas historias. El SLA también aparece en la ficha (HU-158), en la confirmación de la solicitud (RF-5.4, EP-005) y en el camino del cero (RF-14.3, EP-010); cada una es dueña de su lugar.

**Qué existe ya:** nada. No hay texto del estándar, de SARO, de Hive Mind ni de Trycore University en el portal. El prototipo tiene una cabecera del conjunto curado (`hero-neural-grid`) y una franja de pasos de un solo uso (`franja-servicio`, «Te respondemos en 10 días hábiles»).

**Preguntas abiertas para el sponsor:**
1. El prototipo habla de «capacidad verificada en **cinco** componentes». El PRD define **cuatro** dimensiones (B.6: tres de entrada y Neural Speed como garantía). ¿Cuántos componentes nombra el encabezado, y cuáles?
2. El copy del encabezado y del bloque de respaldo (qué es Trycore University, qué es Hive Mind, qué hace la Coordinación de Servicio dedicada) no está en el PRD. ¿Quién lo redacta y aprueba: Mercadeo, con validación de Comercial como pide RF-14.4?
3. ¿El encabezado aparece también en el encuadre del enlace sin selección (HU-093, EP-001)? La historia lo deja en las dos listas que muestran perfiles. Ponerlo en la pantalla de encuadre, que no muestra perfiles, no lo prohíbe el PRD, pero tampoco lo pide.

## Trazabilidad

Épica madre: **EP-003** · PRD v4.17 · RF-6.1 · RF-6.2 · RF-6.3 · RF-6.4 · RF-3.8 · B.6 · pantallas compartidas con EP-001 (HU-091, HU-144, banco ampliado), EP-002 y EP-009 · relacionada con HU-158 (SLA y recordatorio del estándar en la ficha) y HU-153 (tarjeta sin insignia)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ se añade sobre pantallas ya construidas de EP-001; no espera a EP-002 ni a EP-009 |
| N | Negociable | ✓ son fijos el contenido mínimo (estándar, condición de entrada con SARO, prueba en vivo y DISC, respaldo y SLA), que se diga una vez y que no bloquee; la forma (cabecera ilustrada o texto) y el copy se pueden negociar |
| V | Valiosa | ✓ declarar una vez lo que todos cumplen libera la tarjeta para lo que sí diferencia, y le da autoridad al conjunto antes del primer perfil |
| E | Estimable | ✓ M: un encabezado y un bloque de respaldo en dos pantallas existentes, con comportamiento adaptable; el copy pendiente no cambia la mecánica |
| S | Pequeña | ✓ M: tres escenarios de presentación |
| T | Testeable | ✓ el orden en el DOM (declaración antes de la primera tarjeta), que no se repita en las tarjetas, el tamaño del texto del SLA y que no haya diálogo en un teléfono emulado son observables |
