---
id: HU-078
titulo: "Saber qué están pidiendo las cuentas y no tenemos"
epica: EP-010
prioridad: alta
complejidad: M
estado: draft
fase: fase-2-rediseno
prd_version: 4.8
---

# HU-078 — Saber qué están pidiendo las cuentas y no tenemos

**Como** integrante del equipo de Talento Humano responsable del banco de talento,
**quiero** consultar las especificaciones completas que las cuentas buscaron y no encontraron,
**para** decidir a quién sumar al banco con base en demanda real de clientes activos y no por intuición.

## Criterios de aceptación

### Happy path — registro consultable

**Dado** que hubo búsquedas sin coincidencia en el período,
**cuando** abro el registro de demanda,
**Entonces** veo la especificación estructurada de cada búsqueda y no solo el texto que escribieron
**Y** veo la cuenta, la fecha y si la búsqueda terminó en solicitud dirigida

### Error — período sin búsquedas fallidas

**Dado** que no hubo búsquedas sin coincidencia,
**cuando** abro el registro,
**Entonces** veo un estado vacío que lo dice con claridad
**Y** no veo una tabla en blanco sin explicación

### Edge case — demanda inducida por sugerencias

**Dado** que parte de las búsquedas provienen de instrucciones sugeridas sin editar,
**cuando** reviso el registro,
**Entonces** esas entradas están marcadas como originadas en una sugerencia
**Y** puedo separarlas de la demanda espontánea


## Notas

**Esta es la historia canónica del registro de demanda.** Resuelto el 2026-09-22: `HU-110` duplicaba esta historia —mismo actor, mismo *quiero*, mismo propósito, mismo escenario de error— porque se escribió en el cierre de huecos del PRD 4.0 sin ver que esta existía desde el PRD 2.8. HU-110 se reescribió para cubrir la mitad de **RF-7.2** que nadie cubría: el reporte de filtros más usados.

Cubre **RF-15.1** y la segunda mitad de **RF-7.2** (búsquedas sin resultados). Dueño y cadencia en **D-13**: Talento Humano, revisión mensual.


Cubre RF-15.1 y RF-7.2. El último escenario es la defensa contra el sesgo que el propio documento de Fase 2 identificó: sin esa marca, el registro mide lo que sugerimos y no lo que el cliente necesita.

**Desbloqueada el 2026-09-15 (D-13 cerrada).** Dueño: Talento Humano. Cadencia: revisión mensual. Es quien actúa sobre el dato, porque el registro existe para decidir a quién sumar al banco.

## Trazabilidad

Épica madre: **EP-010** · PRD v2.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |
