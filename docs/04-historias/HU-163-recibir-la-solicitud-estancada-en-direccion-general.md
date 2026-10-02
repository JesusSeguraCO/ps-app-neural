---
id: HU-163
titulo: "Recibir en Dirección General la solicitud que no avanza en 24 horas hábiles"
epica: EP-007
prioridad: alta
complejidad: S
estado: draft
fase: integracion-hubspot
prd_version: 4.18
depende_de: [HU-162]
---

# HU-163 — Recibir en Dirección General la solicitud que no avanza en 24 horas hábiles

> **Historia de configuración en HubSpot.** Responsable: **Mercadeo/RevOps**. Verificación: **prueba en el sandbox o el portal real de HubSpot con datos ficticios** sobre una semana con festivo. Por **D55** lo hace el **workflow de HubSpot**; el portal no lo implementa.

**Como** director general de Trycore,
**quiero** recibir la solicitud cuyo negocio sigue en la etapa de entrada 24 horas hábiles después del aviso,
**para** intervenir antes de que una cuenta activa sienta que Trycore la ignoró.

## Criterios de aceptación

### Happy path [HubSpot] — 24 horas hábiles sin cambio de etapa

**Dado** que el negocio de una solicitud sigue en la etapa de entrada desde el aviso al propietario,
**cuando** se cumplen 24 horas hábiles desde ese aviso, según la tabla,
**Entonces** Dirección General recibe, con copia al propietario y a la dirección comercial, la notificación del workflow con la solicitud, los avisos anteriores y el enlace al negocio
**Y** el negocio queda marcado como escalado a Dirección General

| Aviso al propietario | Vence a las 24 h hábiles |
|---|---|
| lunes 28 sep 2026, 10:42 | miércoles 30 sep, 14:42 |
| viernes 9 oct 2026, 16:00 | jueves 15 oct, 10:00 (el lunes 12 es festivo) |
| jueves 1 oct 2026, 17:00 | martes 6 oct, 11:00 (cruza el fin de semana) |

### Edge case [HubSpot] — atender no basta

**Dado** que el propietario registró actividad en el negocio antes de las 4 horas hábiles, pero la etapa sigue siendo la de entrada,
**cuando** se cumplen 24 horas hábiles desde el aviso,
**Entonces** el negocio se escala igual a Dirección General
**Y** la notificación dice cuándo fue la primera atención y que el negocio no cambió de etapa

### Edge case [HubSpot] — el negocio avanzó a tiempo

**Dado** que el negocio pasó de la etapa de entrada a la siguiente antes de las 24 horas hábiles,
**cuando** se cumple el plazo,
**Entonces** Dirección General no recibe ninguna notificación de ese negocio

### Error [HubSpot] — el negocio se quedó sin propietario a mitad del plazo

**Dado** que alguien quitó el propietario del negocio y la etapa sigue siendo la de entrada,
**cuando** se cumplen 24 horas hábiles desde el aviso,
**Entonces** Dirección General recibe la notificación con copia a la dirección comercial
**Y** la notificación dice que el negocio no tiene propietario

## Notas

Cubre **RF-9.7.3** (segundo escalón): «a las 24 horas hábiles sin movimiento de etapa, se escala a Dirección General». Lo que cuenta es el **cambio de etapa**, no la atención (prototipo `correo-aviso-interno--escalamiento`: «Abrir el negocio no basta»). Mecanismo de la **enmienda v4.18 del PRD**.

**Revisión 2026-10-02 (D55, D56; segunda ronda D76, D77).** **D76** mantiene el escalamiento en el workflow aunque el negocio lo cree el worker por la API. **D55**: el escalamiento es del workflow; desaparece el escenario «HubSpot no responde al leer la etapa», porque el portal no lee nada. **D77** (corrige D56): **calendario hábil aprobado T-4 con jornadas de 10 h** (lunes a viernes 8:00–18:00 `America/Bogota`, festivos de Colombia); 24 h hábiles ≈ **2,4 jornadas**. **Se corrige el prototipo**, que ponía el vencimiento del aviso del lunes 28 sep a las 10:42 en el jueves 1 oct. Con T-4: lunes 10:42–18:00 son 7 h 18 min, el martes suma 10 h y el miércoles faltan 6 h 42 min, así que vence el **miércoles 30 sep a las 14:42**. La E ✗ por la definición de 24 h queda resuelta.

**Ejemplos recalculados con T-4 (D77).** Viernes 9 oct 16:00: 2 h el viernes, el lunes 12 es festivo, 10 h el martes 13 y 10 h el miércoles 14 suman 22 h, y faltan 2 h del jueves 15 → 10:00. Jueves 1 oct 17:00: 1 h el jueves, 10 h el viernes 2 y 10 h el lunes 5 suman 21 h, y faltan 3 h del martes 6 → 11:00. Queda resuelta la pregunta que dejaba la frase «3 jornadas de 8 h» de D56: **D77 confirma T-4**.

**Riesgo heredado de HU-162:** que el workflow cuente horas hábiles con festivos de forma nativa. Se resuelve con la misma prueba de capacidades.

**Destinatario nominal** de Dirección General (R-36): configuración del workflow; pregunta abierta. La tarea de seguimiento para Dirección Comercial que menciona el prototipo puede añadirse al workflow si Comercial la quiere; no cambia los escenarios.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.18 · RF-9.7.3 (24 h) · T-4 · CRN-3 · R-36 · D55, D56 (corregida por D77), D76, D77 (sponsor, 2026-10-02) · ADR-0009 (enmienda 2026-10-02) · depende de HU-162

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: reutiliza el workflow, el calendario y la marca de primera atención de HU-162 |
| N | Negociable | ✓ fija 24 horas hábiles con T-4 (jornadas de 10 h) y que cuenta la etapa; los destinatarios y el texto se configuran |
| V | Valiosa | ✓ la solicitud que nadie mueve llega a quien puede mover a todos |
| E | Estimable | ✗ por la misma razón que HU-162: falta comprobar si HubSpot cuenta horas hábiles con festivos de forma nativa. La definición de las 24 h está resuelta (D77) |
| S | Pequeña | ✓ S: cuatro escenarios sobre un solo escalón |
| T | Testeable | ✓ negocios ficticios creados en las horas de la tabla, uno que avanza, uno atendido sin avanzar y uno sin propietario dan notificaciones observables en HubSpot |
