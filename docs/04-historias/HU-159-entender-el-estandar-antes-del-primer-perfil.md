---
id: HU-159
titulo: "Entender el estándar Neural-Grid antes del primer perfil"
epica: EP-003
prioridad: alta
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-178]
---

# HU-159 — Entender el estándar Neural-Grid antes del primer perfil

**Como** líder de área que abre por primera vez una selección de perfiles de Trycore,
**quiero** leer, antes del primer perfil y sin que me lo impida ver, qué verificó Trycore de todos ellos y qué respalda el servicio,
**para** evaluar a cada persona por lo que la diferencia, sabiendo que lo básico ya está comprobado en todas.

## Criterios de aceptación

### Happy path — el estándar se declara una vez, arriba

**Esquema del escenario:** la declaración precede a lo primero que el cliente evalúa
**Dado** que tengo una sesión válida y entro a <pantalla>
**Cuando** carga la página
**Entonces** antes de <primer_contenido> veo un encabezado breve que explica el estándar Neural-Grid en cuatro dimensiones: tres condiciones de entrada y Neural Speed como garantía del servicio
**Y** veo, una sola vez, que el estándar exige a cada perfil verificación de identidad bajo SARO, prueba técnica en vivo y evaluación DISC
**Y** nada de lo que sigue en la página repite esa declaración, y ninguna tarjeta lleva una insignia del estándar

**Ejemplos:**

| pantalla | primer_contenido |
|---|---|
| la selección de mi correo | el primer perfil |
| el banco completo, al ampliar la búsqueda | el primer perfil |
| el encuadre de un enlace sin selección (HU-093) | la pregunta «¿Qué necesita tu proyecto?» |

### Happy path — el respaldo y el plazo están a la vista

**Dado** que estoy en la selección de mi correo,
**cuando** llego al bloque de respaldo del servicio,
**Entonces** veo Trycore University, Hive Mind y la Coordinación de Servicio dedicada
**Y** veo que Trycore responde a una solicitud en 10 días hábiles, en el tamaño del texto de la página y no en una nota al pie

### Edge case — la afirmación «ninguno» solo con cero publicados incompletos

**Dado** que en el banco hay el número de perfiles publicados marcados como incompletos (HU-178) que dice la tabla,
**cuando** entro a la selección de mi correo,
**Entonces** el encabezado del estándar dice lo que indica la tabla
**Y** en ningún caso nombra los perfiles incompletos ni dice cuántos son

| Publicados incompletos | El encabezado |
|---|---|
| 0 | afirma que ningún perfil llega al portal sin verificación de identidad bajo SARO, prueba técnica en vivo y evaluación DISC |
| 1 | describe lo que el estándar exige a cada perfil, sin la palabra «ningún» ni otra afirmación de que todos lo cumplen |

### Edge case — el encuadre no bloquea la exploración en el teléfono

**Dado** que entro a la selección de mi correo desde un teléfono,
**cuando** carga la página,
**Entonces** veo el encabezado del estándar y puedo bajar hasta el primer perfil sin cerrar, aceptar ni descartar nada
**Y** el encabezado no se abre como una ventana sobre la lista ni vuelve a aparecer encima de ella al recorrer los perfiles

## Notas

Cubre **RF-6.1** (encabezado breve antes del primer resultado, sin bloquear la exploración), **RF-6.4** (declaración de condición de entrada, una vez, no por tarjeta), **RF-6.3** (bloque de respaldo), **RF-6.2** en el recorrido (SLA visible, no en letra pequeña), la regla 1 de **B.6** (uniforme no es invisible: no se repite) y el lado del encabezado de **RF-3.8** (el estándar se declara arriba, como condición de entrada).

**Superficies compartidas con otras épicas:** el encabezado vive sobre la selección curada (aterrizaje de **EP-001**, HU-091 y HU-144: `apps/portal/app/page.tsx`) y sobre el banco ampliado (**EP-001**, RF-2.2, `apps/portal/app/banco/page.tsx`), donde **EP-002** pondrá sus facetas y **EP-009** la barra de instrucción. Esta historia añade el bloque sin cambiar los criterios de esas historias. El SLA también aparece en la ficha (HU-158), en la confirmación de la solicitud (RF-5.4, EP-005) y en el camino del cero (RF-14.3, EP-010); cada una es dueña de su lugar.

**Qué existe ya:** nada. No hay texto del estándar, de SARO, de Hive Mind ni de Trycore University en el portal. El prototipo tiene una cabecera del conjunto curado (`hero-neural-grid`) y una franja de pasos de un solo uso (`franja-servicio`, «Te respondemos en 10 días hábiles»).

**Decisiones del sponsor aplicadas (2026-10-02):**
- **D64:** el estándar se explica en **cuatro dimensiones**, como el PRD (B.6): Grid de Seguridad, Grid Técnico y Neural Fit como condiciones de entrada, y Neural Speed como garantía del servicio. **Nota de corrección de copy del prototipo:** el prototipo dice «capacidad verificada en **cinco** componentes»; ese texto se corrige a cuatro al construir y no se copia tal cual. El happy path lo fija como resultado observable.
- **D73 (opción conservadora):** el encabezado aparece **también en el encuadre del enlace sin selección** (HU-093, EP-001), antes de la pregunta de encuadre. Se añade como tercera fila del esquema; la pantalla de HU-093 no cambia sus criterios.
- **D73 (copy):** el copy del encabezado y del bloque de respaldo (qué es Trycore University, qué es Hive Mind, qué hace la Coordinación de Servicio dedicada) se redacta con la opción del prototipo/PRD y queda **marcado para revisión de copy** con Mercadeo, con validación de Comercial (RF-14.4).

**Riesgo de D62 cerrado por D80** (sponsor, 2026-10-02, segunda ronda). Los perfiles publicados antes de que SARO y DISC fueran obligatorios siguen visibles sin esos datos (HU-178), y para ellos la afirmación «ningún perfil llega al portal sin SARO, prueba técnica y DISC» no tenía dato que la respaldara. D80: **la afirmación solo aparece cuando hay 0 publicados incompletos**; mientras quede alguno, el encabezado **describe el estándar sin afirmar «ninguno»** (edge nuevo, con tabla 0 / 1). El happy path pasa a la redacción que vale siempre (qué exige el estándar). El conteo de incompletos es el mismo cálculo de HU-178 (la guarda de publicación), en la capa determinista: el portal no lo muestra, solo elige la frase. Completar los incompletos de golpe es HU-191 (D81). Las dos frases se redactan con Mercadeo y quedan **marcadas para revisión de copy** (D73).

**Revisión INVEST 2026-10-02 (D80).** Se añade el cuarto escenario y `depende_de: [HU-178]`: la frase depende de la marca «incompleto». La historia sigue en M.

## Trazabilidad

Épica madre: **EP-003** · PRD v4.17 · RF-6.1 · RF-6.2 · RF-6.3 · RF-6.4 · RF-3.8 · B.6 · D64 · D73 · D80 · depende de HU-178 (conteo de publicados incompletos) · pantallas compartidas con EP-001 (HU-091, HU-093, HU-144, banco ampliado), EP-002 y EP-009 · relacionada con HU-158 (SLA y recordatorio del estándar en la ficha) y HU-153 (tarjeta sin insignia)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: se añade sobre pantallas ya construidas de EP-001 y lee la marca «incompleto» de HU-178 (sub-slice inicial de la misma épica, que se construye antes); no espera a EP-002 ni a EP-009 |
| N | Negociable | ✓ son fijos el contenido mínimo (estándar en cuatro dimensiones, condición de entrada con SARO, prueba en vivo y DISC, respaldo y SLA), que se diga una vez, en tres pantallas, que no bloquee y que «ninguno» solo se afirme con 0 incompletos (D80); la forma (cabecera ilustrada o texto) y el copy se pueden negociar |
| V | Valiosa | ✓ declarar una vez lo que todos cumplen libera la tarjeta para lo que sí diferencia, y le da autoridad al conjunto antes del primer perfil |
| E | Estimable | ✓ M: un encabezado en tres pantallas existentes (selección, banco y encuadre) con dos frases según el conteo de incompletos que ya calcula HU-178, y un bloque de respaldo, con comportamiento adaptable; el copy pendiente no cambia la mecánica |
| S | Pequeña | ✓ M: cuatro escenarios de presentación; el encuadre suma una fila al esquema y D80 una regla de redacción con tabla, no una capacidad |
| T | Testeable | ✓ el orden en el DOM (declaración antes de la primera tarjeta o de la pregunta de encuadre), que nombre cuatro dimensiones, la frase con 0 y con 1 publicado incompleto sembrado, que no se repita en las tarjetas, el tamaño del texto del SLA y que no haya diálogo en un teléfono emulado son observables |
