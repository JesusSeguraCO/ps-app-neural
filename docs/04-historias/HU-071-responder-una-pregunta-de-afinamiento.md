---
id: HU-071
titulo: "Responder una pregunta de afinamiento sin perder lo que ya veo"
epica: EP-009
prioridad: media
complejidad: M
estado: draft
fase: fase-2-rediseno
prd_version: 2.0
---

# HU-071 — Responder una pregunta de afinamiento sin perder lo que ya veo

**Como** líder de área que está revisando resultados,
**quiero** responder a lo sumo dos preguntas cortas con opciones tocables mientras los resultados siguen en pantalla,
**para** afinar la búsqueda sin que el portal me detenga antes de mostrarme algo.

## Criterios de aceptación

### Happy path — pregunta en paralelo

**Dado** que envié una instrucción y ya veo resultados,
**cuando** el portal muestra una pregunta de afinamiento,
**Entonces** la pregunta aparece junto a los resultados y nunca sobre ellos
**Y** puedo ignorarla y seguir navegando
**Y** al responderla los resultados se reordenan

### Error — más preguntas de las permitidas

**Dado** que la interpretación dejó varias ambigüedades,
**cuando** se generan las preguntas,
**Entonces** se muestran como máximo dos a la vez
**Y** las demás esperan a que resuelva las primeras

### Edge case — resultados instantáneos

**Dado** que la búsqueda devolvió resultados completos de inmediato,
**cuando** aparece la pregunta de afinamiento,
**Entonces** la pregunta se presenta como refinamiento opcional y no como paso pendiente
**Y** no bloquea ninguna acción


## Notas

Cubre RF-13.2. Corrige la regla previa de «nunca preguntar antes de mostrar un resultado».



## Trazabilidad

Épica madre: **EP-009** · PRD v2.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |
