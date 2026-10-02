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

> **Historia mixta.** La marca «Agendada el» la escribe el **workflow de HubSpot** (configuración de Mercadeo/RevOps con Coordinación de Servicio; se verifica con una prueba en HubSpot con datos ficticios). La **lectura diaria** de esa marca para O3 la hace el **worker del portal** (D75, excepción de lectura) y se prueba con su suite.

**Como** directora de Mercadeo que mide el arranque comercial,
**quiero** que cada negocio del portal guarde cuándo se agendó su sesión de alineación y que el portal lo lea para O3,
**para** saber cuántos días hábiles pasan entre la solicitud y el agendamiento y cuántas solicitudes se quedan sin sesión.

## Criterios de aceptación

### Happy path [HubSpot] — se agenda la sesión

**Dado** que un negocio del portal no tiene fecha de la sesión de alineación,
**cuando** Coordinación de Servicio escribe en el negocio la fecha de la sesión,
**Entonces** el workflow guarda en «Agendada el» la fecha y hora de ese cambio

### Edge case [HubSpot] — se reagenda o se borra la sesión

**Dado** que un negocio ya tiene guardado «Agendada el»,
**cuando** alguien modifica la fecha de la sesión, cambiándola o borrándola,
**Entonces** el negocio muestra la fecha de la sesión como quedó
**Y** «Agendada el» no cambia: O3 sigue midiendo hasta el primer agendamiento

### Happy path [portal] — la lectura diaria alimenta O3

**Dado** que el negocio de la solicitud SOL-2026-0042, registrada en HubSpot el lunes 5 oct 2026 a las 9:00, tiene «Agendada el» = miércoles 7 oct 2026 a las 11:00,
**cuando** corre la lectura diaria del worker,
**Entonces** la solicitud guarda en el portal «agendada el 7 oct 2026, 11:00»
**Y** O3 cuenta para ella 2 días hábiles con el calendario T-4

### Edge case [portal] — la sesión nunca se agenda

**Dado** que el negocio de una solicitud no tiene «Agendada el» y ya corrió la lectura diaria del worker,
**cuando** se consulta el dato de O3 de esa solicitud,
**Entonces** la solicitud figura como «sin alineación agendada» con los días hábiles que lleva desde que se registró en HubSpot
**Y** no se descarta del cálculo como si no existiera

### Error [portal] — HubSpot no responde a la lectura diaria

**Dado** que la API de CRM no responde o responde con error durante la lectura diaria,
**cuando** el worker intenta leer los negocios del portal,
**Entonces** el portal conserva las marcas que ya tenía, sin borrar ni inventar ninguna
**Y** el tablero muestra la hora de la última lectura completa
**Y** la lectura se reintenta con la espera de los trabajos de HubSpot (HU-105) y, si no se completa en el día, el responsable técnico recibe un aviso

## Notas

Cubre **RF-9.1.3** y **RF-17.4**. **Sin esta historia O3 no se puede medir**: con las etapas del pipeline comercial (D-21) la alineación no tiene etapa propia.

**Revisión 2026-10-02 (D57; segunda ronda D75, D76).** **D57**: O3 mide **cuándo se agendó** (el compromiso), no la fecha de la sesión; la marca vive en el negocio. **D75** (excepción de lectura, corrige la parte de D55 que lo impedía): el **worker lee una vez al día** «Agendada el» de los negocios People Service con el token privado (`crm.objects.deals.read`, el mismo de D76) y lo guarda en la solicitud. Vuelve la tarea diaria (`sincronizar_alineacion`, propuesta de nombre) y una columna `agendada_el` en la solicitud del portal; **la escritura de la marca sigue siendo del workflow**. Con eso los **días hábiles los cuenta el portal** con el calendario T-4 (lunes a viernes 8:00–18:00 `America/Bogota`, festivos de Colombia), y desaparece la E ✗ por «cómo cuenta HubSpot los días hábiles» en el informe. El ejemplo: del lunes 5 oct 9:00 al miércoles 7 oct 11:00 hay dos fronteras de día hábil, sin festivo.

**Mecanismo propuesto:** dos propiedades de fecha en el negocio, «Fecha de la sesión de alineación» (la escribe Coordinación de Servicio, también desde el enlace del aviso de HU-101) y «Agendada el» (la escribe el workflow una sola vez, al primer cambio de la otra, sin reinscripción). Son propiedades del negocio para D57, no de la solicitud: no cuentan entre las 2 nuevas de D76. Las crea Mercadeo.

**Qué negocios lee:** los del pipeline «Comercial (People y Tecnología)» con `soluciones_ofrecidas` = «People Service» (D85) y «Id solicitud People Service», para casar cada uno con su solicitud. Una solicitud registrada a mano (HU-164) se lee igual si su negocio quedó enlazado.

**Por verificar en el HubSpot real (D84):** el límite de tasa de la búsqueda de negocios con el volumen esperado; con pocas decenas de solicitudes al mes no se espera problema.

**La lectura diaria vive en esta historia (D75).** La tarea diaria del worker, la columna `agendada_el` de la solicitud y el conteo de días hábiles T-4 se construyen y prueban **aquí**, una sola vez. **El tablero mensual** (EP-008, D66, HU-171) **solo muestra** O3 a partir de lo que esta lectura guardó; no lee HubSpot ni duplica la tarea. Ya no hace falta enlazar un informe de HubSpot.

**Revisión de validación 2026-10-02.** En el edge «la sesión nunca se agenda», que la lectura diaria ya corrió pasa al Dado (era una segunda acción en el Cuando) y la consulta deja de exigir el tablero: se observa el dato de O3 de la solicitud, así que la historia se prueba sin HU-171.

**Plazo de agendamiento de RF-17.3** (T-28): sigue pendiente; sin él, «sin alineación agendada» muestra los días, sin calificarla de retrasada.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.18 · RF-9.1.3, RF-17.3, RF-17.4 · O3 · D-21 · T-4 · D55 (sustituida en parte), D57, D75, D76, D85 (sponsor, 2026-10-02) · ADR-0009 (enmienda D76: vuelve una lectura diaria) · depende de HU-102 · relacionada con HU-101 y HU-099 (EP-005) y HU-164 · alimenta a HU-171 (EP-008), que muestra O3 y depende de esta historia

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: marca y lee el negocio que crea HU-102; no necesita el aviso ni el escalamiento; el tablero (HU-171) consume el dato y depende de esta historia, pero no es necesario para probarla |
| N | Negociable | ✓ fija que la primera marca nunca se sobrescribe, que el negocio sin sesión cuenta y que una lectura fallida no inventa; nombres de propiedades y hora de la lectura se configuran |
| V | Valiosa | ✓ sin este dato O3 no existe y nadie sabe cuántas solicitudes mueren antes de la sesión |
| E | Estimable | ✓ S: en HubSpot, dos propiedades y un workflow sin reinscripción; en el portal, la tarea diaria de lectura (que vive aquí, no en HU-171), la columna `agendada_el` y el conteo con el calendario T-4 |
| S | Pequeña | ✓ S: una capacidad (marcar y leer el agendamiento) en cinco escenarios |
| T | Testeable | ✓ negocios ficticios sin fecha, con fecha y reagendados dan marcas observables en HubSpot; con un doble de la API y reloj simulado se ven la marca guardada, los días hábiles, el «sin alineación» y la lectura fallida |
