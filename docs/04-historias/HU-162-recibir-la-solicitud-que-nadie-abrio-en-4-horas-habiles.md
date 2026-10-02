---
id: HU-162
titulo: "Recibir la solicitud que nadie atendió en 4 horas hábiles"
epica: EP-007
prioridad: alta
complejidad: M
estado: draft
fase: integracion-hubspot
prd_version: 4.18
depende_de: [HU-103]
---

# HU-162 — Recibir la solicitud que nadie atendió en 4 horas hábiles

> **Historia de configuración en HubSpot.** Responsable: **Mercadeo/RevOps**. Verificación: **prueba en el sandbox o el portal real de HubSpot con datos ficticios** y relojes de prueba sobre una semana con festivo. Por **D55** el escalamiento lo hace el **workflow de HubSpot** con retrasos en horario laboral; **el portal no lo implementa** ni lee HubSpot para escalar (D76 lo mantiene así).

**Como** integrante de la dirección comercial,
**quiero** recibir la solicitud cuyo negocio nadie atendió en 4 horas hábiles desde el aviso al propietario,
**para** que alguien la tome el mismo día aunque el propietario no la haya visto.

## Criterios de aceptación

### Happy path [HubSpot] — nadie la atiende en 4 horas hábiles

**Dado** que el propietario recibió el aviso de un negocio del portal y en el negocio no hubo cambio de etapa, de propietario ni actividad registrada,
**cuando** se cumplen 4 horas hábiles desde el aviso, según la tabla,
**Entonces** la dirección comercial recibe, con copia al propietario, la notificación del workflow con la solicitud y el enlace al negocio
**Y** el negocio queda marcado como escalado a la dirección comercial

| Aviso al propietario | Vence a las 4 h hábiles |
|---|---|
| lunes 28 sep 2026, 10:42 | lunes 28 sep, 14:42 |
| viernes 9 oct 2026, 16:00 | martes 13 oct, 10:00 (el lunes 12 es festivo) |
| sábado 3 oct 2026, 11:00 | lunes 5 oct, 12:00 |
| jueves 1 oct 2026, 17:00 | viernes 2 oct, 11:00 |

### Edge case [HubSpot] — el propietario la atiende a tiempo

**Dado** que el propietario recibió el aviso hace menos de 4 horas hábiles,
**cuando** cambia la etapa o el propietario del negocio, o registra una actividad en él,
**Entonces** el negocio no se escala a la dirección comercial
**Y** el negocio guarda la fecha y hora de esa primera atención

### Error [HubSpot] — el propietario lo vio pero no dejó rastro

**Dado** que el propietario abrió el negocio en HubSpot y no cambió nada ni registró actividad,
**cuando** se cumplen 4 horas hábiles desde el aviso,
**Entonces** el negocio se escala igual a la dirección comercial
**Y** la notificación dice que no hay ninguna actividad registrada, para que quien lo atendió la registre

## Notas

Cubre **RF-9.7.3** (primer escalón, 4 horas hábiles) y **RF-9.7.4** (tiempo hasta la primera atención, la métrica que dice si el mecanismo funciona), con el mecanismo de la **enmienda v4.18 del PRD**. El segundo escalón es HU-163.

**Revisión 2026-10-02 (D55, D56; segunda ronda D76, D77).** **D76** no cambia esta historia: el negocio lo crea ahora el worker por la API (HU-102), pero el escalamiento **sigue en el workflow**, que arranca al crearse el negocio y avisar al propietario (HU-103). **D55**: el escalamiento sale del portal y lo hace el workflow; se retiran la tarea `escalar` cada 15 min, el enlace rastreado `/r/`, el botón «Ya lo estoy atendiendo» y la tabla `aperturas` de ADR-0009. Con eso desaparece el escenario «HubSpot no responde al evaluar»: no hay lectura del portal que pueda fallar. **D77** (corrige D56): calendario hábil aprobado **T-4** con **jornadas de 10 h** (lunes a viernes 8:00–18:00 `America/Bogota`, festivos de Colombia en tabla administrable). Las fechas de la tabla están recalculadas con T-4: el lunes 12 oct 2026 es festivo (Día de la Raza); el viernes 9 oct a las 16:00 deja 2 h y faltan 2 h del martes 13; el sábado no cuenta y el lunes 5 empieza a las 8:00; el jueves 1 oct a las 17:00 deja 1 h y faltan 3 h del viernes 2.

**Qué cuenta como «atendida»** (propuesta para el workflow, negociable): cambio de etapa, cambio de propietario o una actividad registrada en el negocio (llamada, correo, reunión, nota o tarea). HubSpot no registra que alguien **vio** un negocio, así que el riesgo **R-23** sigue aceptado: abrir sin dejar rastro escala igual (escenario de error). La primera atención queda en una propiedad de fecha del negocio («Primera atención»), que es la métrica de RF-9.7.4.

**Riesgo por verificar en el HubSpot real (antes del DoR):** que el workflow cuente **4 horas hábiles exactas con festivos de Colombia**. Un retraso nativo cuenta horas de reloj y las ventanas de ejecución solo aplazan la acción a la siguiente franja; con eso, el aviso del viernes a las 16:00 podría salir el martes a las 8:00 en lugar de a las 10:00. Si la suscripción no lo resuelve de forma nativa, Mercadeo/RevOps elige entre una acción de código propio o una propiedad con la fecha de vencimiento calculada. **No lo decide el modelo y no se recorta.**

**Destinatario nominal** de «la dirección comercial» (R-36): usuario o equipo de HubSpot configurado en el workflow; pregunta abierta para Comercial.

**Prototipo:** `correo-aviso-interno` (plazo en el aviso), `correo-aviso-interno--escalamiento` (pasa a ser la plantilla de la notificación del workflow, sin el botón).

## Trazabilidad

Épica madre: **EP-007** · PRD v4.18 · RF-9.7.3 (4 h), RF-9.7.4 · T-4 · CRN-1, CRN-3 · R-23, R-36 · D55, D56 (corregida por D77), D76, D77 (sponsor, 2026-10-02) · ADR-0009 (enmienda 2026-10-02: se retiran `escalar`, `/r/` y `aperturas`) · depende de HU-103 · relacionada con HU-163

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: escala el aviso de HU-103; no necesita el segundo escalón |
| N | Negociable | ✓ fija las 4 horas hábiles, el calendario T-4 de jornadas de 10 h y que se escala salvo atención registrada; qué actividades cuentan y el texto se configuran |
| V | Valiosa | ✓ una solicitud que el propietario no vio no se queda quieta: la toma alguien el mismo día |
| E | Estimable | ✗ hasta comprobar en el HubSpot real si el workflow cuenta horas hábiles con festivos de forma nativa; con retrasos nativos es S, con código propio es M. La definición del plazo está resuelta (D77) |
| S | Pequeña | ✓ M: una capacidad (primer escalón y su métrica) en tres escenarios, el primero con cuatro casos de calendario |
| T | Testeable | ✓ negocios ficticios creados en las horas de la tabla, uno atendido a tiempo y uno abierto sin rastro, dan notificaciones y marcas observables en HubSpot |
