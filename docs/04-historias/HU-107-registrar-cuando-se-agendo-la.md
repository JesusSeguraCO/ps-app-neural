---
id: HU-107
titulo: "Registrar cuándo se agendó la alineación"
epica: EP-007
prioridad: alta
complejidad: S
estado: draft
fase: integracion-hubspot
prd_version: 4.18
depende_de: [HU-102]
---

# HU-107 — Registrar cuándo se agendó la alineación

> **Historia del portal.** Por **D92** la fecha de agendado sale de la **herramienta de reuniones de HubSpot**: la propiedad nativa `engagements_last_meeting_booked` del contacto, que se llena cuando el comercial agenda con su enlace de reuniones. No hay propiedad nueva ni workflow que configurar. La **lectura diaria** la hace el **worker del portal** (D75, excepción de lectura) y se prueba con su suite, con un doble de la API de CRM y reloj simulado.

**Como** directora de Mercadeo que mide el arranque comercial,
**quiero** que el portal lea cada día cuándo se agendó la sesión de alineación de cada solicitud y cuente los días hábiles desde su envío,
**para** saber cuántos días hábiles pasan entre la solicitud y el agendamiento y cuántas solicitudes se quedan sin sesión.

## Criterios de aceptación

### Happy path — la lectura diaria guarda cuándo se agendó

**Dado** que la solicitud SOL-2026-0042 se envió el lunes 5 oct 2026 a las 9:00 y el comercial agendó la alineación con su enlace de reuniones de HubSpot, de modo que el contacto de la solicitud tiene `engagements_last_meeting_booked` = miércoles 7 oct 2026 a las 11:00,
**cuando** corre la lectura diaria del worker,
**Entonces** la solicitud guarda en el portal «agendada el 7 oct 2026, 11:00»
**Y** su dato de O3 es 2 días hábiles con el calendario T-4

### Edge case — los días hábiles se cuentan cruzados, sin fracción

**Esquema del escenario:** O3 cuenta los días hábiles que se cruzan, no las horas
**Dado** que una solicitud se envió el <enviada> y la lectura diaria guardó «agendada el» <agendada>,
**cuando** se consulta el dato de O3 de esa solicitud,
**Entonces** O3 dice <dias> días hábiles, un número entero, sin fracción

**Ejemplos:**

| enviada | agendada | dias | por qué |
|---|---|---|---|
| lunes 5 oct 2026, 9:00 | lunes 5 oct 2026, 16:00 | 0 | mismo día |
| lunes 5 oct 2026, 9:00 | miércoles 7 oct 2026, 11:00 | 2 | se cruzan martes y miércoles |
| viernes 2 oct 2026, 17:00 | lunes 5 oct 2026, 8:30 | 1 | el fin de semana no cuenta |
| viernes 9 oct 2026, 10:00 | martes 13 oct 2026, 10:00 | 1 | el lunes 12 oct es festivo en Colombia |

### Edge case — se reagenda la sesión

**Dado** que la solicitud ya guardó «agendada el 7 oct 2026, 11:00» y el comercial reagendó con la herramienta de reuniones, de modo que `engagements_last_meeting_booked` del contacto ahora es jueves 8 oct 2026 a las 15:00,
**cuando** corre la lectura diaria del worker,
**Entonces** la solicitud conserva «agendada el 7 oct 2026, 11:00»
**Y** su dato de O3 sigue siendo 2 días hábiles: O3 mide hasta el primer agendamiento

### Edge case — no hay agendamiento que medir

**Dado** que una solicitud se envió hace 4 días hábiles, su contacto está en la situación de la tabla y ya corrió la lectura diaria del worker,
**cuando** se consulta el dato de O3 de esa solicitud,
**Entonces** la solicitud figura como «sin alineación agendada», con 4 días hábiles desde su envío
**Y** no se descarta del cálculo como si no existiera

| Situación del contacto | Por qué no hay agendamiento medible |
|---|---|
| `engagements_last_meeting_booked` vacío | no se agendó, o se agendó fuera de la herramienta de reuniones (riesgo aceptado, D92) |
| `engagements_last_meeting_booked` anterior al envío de la solicitud | es una reunión previa, no la alineación de esta solicitud |

### Error — HubSpot no responde a la lectura diaria

**Dado** que la API de CRM no responde o responde con error durante la lectura diaria,
**cuando** el worker intenta leer los contactos de las solicitudes pendientes,
**Entonces** el portal conserva las marcas «agendada el» que ya tenía, sin borrar ni inventar ninguna
**Y** el registro de la tarea diaria marca esa lectura como fallida y conserva la hora de la última lectura completa
**Y** la lectura se reintenta con la espera de los trabajos de HubSpot (HU-105) y, si no se completa en el día, el responsable técnico recibe un aviso

## Notas

Cubre **RF-9.1.3** y **RF-17.4** del lado de la medición. **Sin esta historia O3 no se puede medir**: con las etapas del pipeline comercial (D-21) la alineación no tiene etapa propia.

**Revisión 2026-10-02 (D57; segunda ronda D75, D76).** **D57**: O3 mide **cuándo se agendó** (el compromiso), no la fecha de la sesión. **D75** (excepción de lectura, corrige la parte de D55 que lo impedía): el **worker lee una vez al día** el dato de agendamiento con el token privado (`HUBSPOT_PRIVATE_APP_TOKEN`, el mismo de D76) y lo guarda en la solicitud: tarea diaria (`sincronizar_alineacion`, propuesta de nombre) y columna `agendada_el` en la solicitud del portal. Los **días hábiles los cuenta el portal** con el calendario T-4 (lunes a viernes 8:00–18:00 `America/Bogota`, festivos de Colombia).

**Tercera ronda 2026-10-02 (D91, D92).**
- **D92 — fuente de la fecha.** Se usa la **herramienta de reuniones de HubSpot**: `engagements_last_meeting_booked` **del contacto** de la solicitud (el que crea o actualiza HU-102 por el correo verificado), que se llena cuando el comercial agenda con su enlace de reuniones. **Sin propiedad nueva**: desaparecen las dos propiedades del negocio («Fecha de la sesión de alineación» y «Agendada el») y el workflow que marcaba la segunda; por eso salen los dos escenarios [HubSpot] y la historia deja de ser mixta. **No es recorte**: lo que medían (primera marca, reagendar no la mueve) sigue aquí, ahora en la lectura del portal. Como la propiedad es la *última* reunión, el portal guarda la **primera** fecha posterior al envío y no la sobrescribe (edge de reagendar). **Riesgo aceptado por el sponsor:** lo que se agenda fuera de la herramienta de reuniones no se mide y la solicitud figura «sin alineación agendada» (edge). El token ya lleva lectura de contactos (D76), sin scope nuevo.
- **D91 — unidad de O3.** **Días hábiles cruzados**, sin fracciones: se cuentan los días hábiles T-4 posteriores al día del envío hasta el día del agendamiento, inclusive; la hora no cuenta. Mismo día = 0; lunes → miércoles = 2; viernes → lunes = 1; un festivo no cuenta. La tabla del edge prueba los cuatro casos.
- **Error sin depender de HU-171.** El Entonces del error ya no habla del tablero: la hora de la última lectura completa queda en el registro de la tarea diaria, que es lo que HU-171 mostrará. La historia se prueba entera sin el tablero.
- **Inicio del conteo = solicitud enviada**, como dice O3 en §3 del PRD («días entre solicitud enviada y sesión de alineación agendada») y HU-171; antes decía «registrada en HubSpot».

**Qué contactos lee:** los de las solicitudes enviadas que aún no tienen `agendada_el`, por el identificador de contacto que guardó HU-102. Una solicitud registrada a mano (HU-164) se lee igual si quedó enlazada a su contacto. **Límite conocido (propuesta del modelo, a confirmar):** si un mismo contacto tiene dos solicitudes abiertas, una reunión posterior a ambos envíos cuenta para las dos.

**Por verificar en el HubSpot real (D84):** que `engagements_last_meeting_booked` guarde el momento en que se agendó y no la fecha de la reunión (D57 mide el agendamiento); y el límite de tasa de la lectura de contactos con el volumen esperado (pocas decenas de solicitudes al mes).

**La lectura diaria vive en esta historia (D75).** La tarea diaria del worker, la columna `agendada_el` de la solicitud y el conteo de días hábiles T-4 se construyen y prueban **aquí**, una sola vez. **El tablero mensual** (EP-008, D66, HU-171) **solo muestra** O3 a partir de lo que esta lectura guardó; no lee HubSpot ni duplica la tarea.

**Revisión de validación 2026-10-02.** En el edge de «sin agendamiento», que la lectura diaria ya corrió va en el Dado (era una segunda acción en el Cuando) y la consulta no exige el tablero: se observa el dato de O3 de la solicitud, así que la historia se prueba sin HU-171.

**Plazo de agendamiento de RF-17.3** (T-28): sigue pendiente; sin él, «sin alineación agendada» muestra los días, sin calificarla de retrasada.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.18 · RF-9.1.3, RF-17.3, RF-17.4 · O3 · D-21 · T-4 · D55 (sustituida en parte), D57, D75, D76, D85, D91 y D92 (sponsor, 2026-10-02) · ADR-0009 (enmienda D76: vuelve una lectura diaria) · depende de HU-102 · relacionada con HU-101 y HU-099 (EP-005) y HU-164 · alimenta a HU-171 (EP-008), que muestra O3 y depende de esta historia

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: lee el contacto que crea o actualiza HU-102; no necesita configuración en HubSpot (la herramienta de reuniones es nativa, D92), ni el aviso ni el escalamiento; el tablero (HU-171) consume el dato y depende de esta historia, pero no es necesario para probarla |
| N | Negociable | ✓ fija la fuente (D92), la unidad en días hábiles cruzados (D91), que la primera marca nunca se sobrescribe, que la solicitud sin agendamiento cuenta y que una lectura fallida no inventa; el nombre de la tarea y la hora de la lectura se configuran |
| V | Valiosa | ✓ sin este dato O3 no existe y nadie sabe cuántas solicitudes mueren antes de la sesión |
| E | Estimable | ✓ S: una tarea diaria que lee una propiedad nativa del contacto, la columna `agendada_el` con la regla de primera fecha posterior al envío y el conteo de días hábiles cruzados con el calendario T-4; D92 quitó la parte de configuración en HubSpot |
| S | Pequeña | ✓ S: una capacidad (leer y contar el agendamiento) en cinco escenarios, dos con tabla |
| T | Testeable | ✓ con un doble de la API de CRM y reloj simulado: contactos con fecha posterior, reagendada, vacía o anterior al envío y una API caída dan marcas, días hábiles exactos (0, 2, 1 y 1 con festivo), «sin alineación agendada» y lectura fallida observables |
