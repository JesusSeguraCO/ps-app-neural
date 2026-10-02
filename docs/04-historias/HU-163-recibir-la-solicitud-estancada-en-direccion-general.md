---
id: HU-163
titulo: "Recibir en Dirección General la solicitud que no avanza en 24 horas hábiles"
epica: EP-007
prioridad: alta
complejidad: S
estado: draft
fase: integracion-hubspot
prd_version: 4.17
depende_de: [HU-162]
---

# HU-163 — Recibir en Dirección General la solicitud que no avanza en 24 horas hábiles

**Como** director general de Trycore,
**quiero** recibir la solicitud cuyo negocio sigue en la etapa de entrada 24 horas hábiles después del aviso,
**para** intervenir antes de que una cuenta activa sienta que Trycore la ignoró.

## Criterios de aceptación

### Happy path — 24 horas hábiles sin cambio de etapa

**Dado** que el negocio de una solicitud sigue en la etapa de entrada desde el aviso al propietario,
**cuando** se cumplen 24 horas hábiles desde ese aviso, según la tabla,
**Entonces** Dirección General recibe, con copia al propietario y a la dirección comercial, un correo con la solicitud, la historia de avisos y el enlace al negocio
**Y** la solicitud queda marcada en el portal como escalada a Dirección General

| Aviso al propietario | Vence a las 24 h hábiles |
|---|---|
| lunes 28 sep 2026, 10:42 | miércoles 30 sep, 14:42 |
| viernes 9 oct 2026, 16:00 | jueves 15 oct, 10:00 (el lunes 12 es festivo) |

### Edge case — abrir no basta

**Dado** que el propietario abrió el negocio o tocó «Ya lo estoy atendiendo», pero la etapa sigue siendo la de entrada,
**cuando** se cumplen 24 horas hábiles desde el aviso,
**Entonces** la solicitud se escala igual a Dirección General
**Y** el correo dice que el negocio se abrió y a qué hora, pero que no cambió de etapa

### Error — HubSpot no responde al leer la etapa

**Dado** que una solicitud cumplió 24 horas hábiles y HubSpot no responde al leer la etapa de su negocio,
**cuando** el portal evalúa la solicitud,
**Entonces** no la escala con una etapa que no pudo leer
**Y** la vuelve a evaluar en la siguiente pasada de 15 minutos
**Y** el responsable técnico recibe el aviso de fallo de la tarea de escalamiento desde el primer fallo

## Notas

Cubre **RF-9.7.3** (segundo escalón): «a las 24 horas hábiles sin movimiento de etapa, se escala a Dirección General». Lo que cuenta es el **cambio de etapa**, no la apertura (prototipo `correo-aviso-interno--escalamiento`: «Abrir el negocio no basta»).

**24 horas hábiles** con el calendario de T-4 (L–V 8:00–18:00 `America/Bogota`, festivos de Colombia) son 2,4 jornadas de 10 horas. **Discrepancia a resolver:** el prototipo de escalamiento pone el vencimiento del aviso del lunes 28 sep a las 10:42 en el **jueves 1 oct a las 10:42** (tres jornadas); con el calendario aprobado es el **miércoles 30 sep a las 14:42**. La tabla sigue el calendario aprobado; pregunta al sponsor si «24 horas hábiles» quiere decir tres días hábiles.

**Error de lectura:** `escalar` es tarea crítica en ADR-0009 (alerta al primer fallo). El escalamiento se retrasa como mucho lo que dure la caída, nunca se dispara con un dato inventado.

**Destinatario nominal** de Dirección General (R-36): no definido; pregunta abierta. El prototipo menciona además que «HubSpot también asignó una tarea de seguimiento a Dirección Comercial»: eso sería un workflow de HubSpot, no del portal; pregunta abierta si se quiere.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.17 · RF-9.7.3 (24 h) · T-4 · CRN-3 · R-36 · ADR-0009 (`escalar`, tarea crítica) · depende de HU-162

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: reutiliza la tarea, el calendario y los avisos de HU-162 |
| N | Negociable | ✓ fija 24 horas hábiles, que cuenta la etapa y que no se escala a ciegas; el buzón y el texto se negocian |
| V | Valiosa | ✓ la solicitud que nadie mueve llega a quien puede mover a todos |
| E | Estimable | ✓ S: una regla más sobre la tarea de HU-162 y una lectura de etapa |
| S | Pequeña | ✓ S: tres escenarios sobre un solo escalón |
| T | Testeable | ✓ con reloj simulado y un doble de HubSpot con etapa fija, cambiada y caído se observan correos y marcas en las fechas de la tabla |
