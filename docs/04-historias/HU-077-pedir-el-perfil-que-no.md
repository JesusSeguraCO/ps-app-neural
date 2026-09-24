---
id: HU-077
titulo: "Pedir el perfil que no existe todavía"
epica: EP-010
prioridad: alta
complejidad: M
estado: draft
fase: fase-2-rediseno
prd_version: 2.0
---

# HU-077 — Pedir el perfil que no existe todavía

**Como** líder de proyecto que no encontró el perfil que necesita,
**quiero** solicitar formalmente ese perfil con el plazo de incorporación a la vista,
**para** resolver mi necesidad aunque el banco no la cubra hoy, en lugar de cerrar la pestaña y buscar por fuera.

## Criterios de aceptación

### Happy path — solicitud dirigida

**Dado** que estoy en la pantalla de cero con una especificación completa,
**cuando** envío la solicitud de perfil a medida,
**Entonces** recibo confirmación con el plazo de 10 días hábiles
**Y** se crea la oportunidad correspondiente en el pipeline comercial
**Y** la especificación completa viaja con la solicitud

### Error — falla la creación en el CRM

**Dado** que envío la solicitud y la integración con el CRM falla,
**cuando** se procesa el envío,
**Entonces** la solicitud no se pierde y entra en cola de reintento
**Y** recibo igualmente la confirmación
**Y** se alerta al responsable interno

### Edge case — segunda solicitud de la misma especificación

**Dado** que ya solicité este mismo perfil hace pocos días,
**cuando** envío la solicitud de nuevo,
**Entonces** el portal me muestra que ya hay una solicitud en curso y su fecha
**Y** puedo añadir contexto en lugar de duplicar la oportunidad


## Notas

Cubre RF-14.3 y RF-9. Según el análisis de la Fase 2, es la mejora con mayor retorno comercial del rediseño.



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
