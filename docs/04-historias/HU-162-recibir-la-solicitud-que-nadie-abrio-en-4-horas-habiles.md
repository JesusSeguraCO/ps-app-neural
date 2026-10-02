---
id: HU-162
titulo: "Recibir la solicitud que nadie abrió en 4 horas hábiles"
epica: EP-007
prioridad: alta
complejidad: M
estado: draft
fase: integracion-hubspot
prd_version: 4.17
depende_de: [HU-103]
---

# HU-162 — Recibir la solicitud que nadie abrió en 4 horas hábiles

**Como** integrante de la dirección comercial,
**quiero** recibir la solicitud cuyo negocio nadie abrió en 4 horas hábiles desde el aviso al propietario,
**para** que alguien la tome el mismo día aunque el propietario no la haya visto.

## Criterios de aceptación

### Happy path — nadie la abre en 4 horas hábiles

**Dado** que el propietario recibió el aviso de una solicitud y nadie ha abierto el negocio,
**cuando** se cumplen 4 horas hábiles desde el aviso, según la tabla,
**Entonces** la dirección comercial recibe, con copia al propietario, un correo con la solicitud, lo que ha pasado desde el aviso y el enlace al negocio, en los 15 minutos siguientes al vencimiento
**Y** la solicitud queda marcada en el portal como escalada a la dirección comercial

| Aviso al propietario | Vence a las 4 h hábiles |
|---|---|
| lunes 28 sep 2026, 10:42 | lunes 28 sep, 14:42 |
| viernes 9 oct 2026, 16:00 | martes 13 oct, 10:00 (el lunes 12 es festivo) |
| sábado 3 oct 2026, 11:00 | lunes 5 oct, 12:00 |

### Edge case — el propietario abre el negocio desde el aviso

**Dado** que el propietario recibió el aviso de una solicitud hace menos de 4 horas hábiles,
**cuando** abre el negocio con el enlace del aviso o toca «Ya lo estoy atendiendo»,
**Entonces** la solicitud no se escala a la dirección comercial
**Y** el portal guarda el tiempo hábil entre el aviso y esa primera apertura

### Edge case — lo atiende cambiando el negocio en HubSpot

**Dado** que el propietario nunca usó el enlace del aviso, pero cambió la etapa o el propietario del negocio en HubSpot antes de las 4 horas hábiles,
**cuando** el portal evalúa la solicitud,
**Entonces** la cuenta como abierta en el momento del cambio y no la escala
**Y** guarda ese momento como primera apertura

## Notas

Cubre **RF-9.7.3** (primer escalón, 4 horas hábiles) y **RF-9.7.4** (tiempo hasta la primera apertura, la métrica que dice si el mecanismo funciona). El segundo escalón (24 h hábiles sin cambio de etapa → Dirección General) es HU-163.

**Calendario hábil** (T-4, 2026-09-25): lunes a viernes de 8:00 a 18:00 `America/Bogota`, festivos de Colombia en una tabla administrable. La tarea `escalar` corre cada 15 minutos, por eso el escalamiento llega entre el vencimiento y 15 minutos después, y nunca fuera de horario hábil.

**Qué cuenta como «abrir»** (CRN-1, ADR-0009): HubSpot no expone que alguien vio un negocio. Cuentan el primer clic en el enlace rastreado del aviso, el botón «Ya lo estoy atendiendo» y un cambio de etapa o de propietario leído de HubSpot. **Riesgo aceptado (R-23):** si el comercial abre el negocio directo en HubSpot y no lo cambia, el portal no lo ve y escala igual; el botón del correo de escalamiento corta la cadena. **Pregunta abierta:** ¿se acepta ese falso escalamiento?

**Destinatario nominal** de «la dirección comercial» (R-36): no está definido. Pregunta abierta. Se configura como un correo, no se codifica.

**Prototipo:** `correo-aviso-interno` (plazo en el aviso), `correo-aviso-interno--escalamiento`.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.17 · RF-9.7.3 (4 h), RF-9.7.4 · T-4 · CRN-1, CRN-3 · R-23, R-36 · ADR-0009 (`escalar`, `/r/`, `calendario_habil`, `aperturas`) · depende de HU-103 · relacionada con HU-163

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: escala el aviso de HU-103; no necesita el segundo escalón |
| N | Negociable | ✓ fija las 4 horas hábiles, el calendario y las tres señales de apertura; el texto del correo y el buzón se negocian |
| V | Valiosa | ✓ una solicitud que el propietario no vio no se queda quieta: la toma alguien el mismo día |
| E | Estimable | ✓ M: una tarea cada 15 min, un cálculo de horas hábiles con festivos y un enlace rastreado |
| S | Pequeña | ✓ M: una capacidad (primer escalón y su métrica) en tres escenarios |
| T | Testeable | ✓ con reloj simulado sobre una semana con festivo y un doble de HubSpot se observan correos, marcas y tiempos de apertura en las fechas de la tabla |
