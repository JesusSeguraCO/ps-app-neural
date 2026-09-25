---
id: HU-069
titulo: "Corregir la interpretación sin volver a escribir"
epica: EP-009
prioridad: alta
complejidad: S
estado: draft
fase: fase-2-rediseno
prd_version: 2.0
---

# HU-069 — Corregir la interpretación sin volver a escribir

**Como** líder de área que ve que el portal entendió mal un criterio,
**quiero** quitar o cambiar un criterio interpretado directamente sobre la lectura,
**para** ajustar la búsqueda sin reformular toda la frase desde cero.

## Criterios de aceptación

### Happy path — quitar un criterio mal interpretado

**Dado** que la lectura incluye un sector que yo no pedí,
**cuando** toco la equis de esa etiqueta,
**Entonces** los resultados se recalculan sin ese criterio
**Y** la etiqueta desaparece de la lectura
**Y** el Perfil Objetivo se actualiza en consecuencia

### Error — se quitan todos los criterios

**Dado** que la lectura tiene un solo criterio,
**cuando** lo elimino,
**Entonces** vuelvo al estado sin búsqueda con el banco completo a la vista
**Y** no veo una pantalla vacía

### Edge case — corrección que deja cero resultados

**Dado** que agrego una restricción que ningún perfil cumple,
**cuando** se recalculan los resultados,
**Entonces** veo el camino del cero con mi Perfil Objetivo actualizado
**Y** puedo deshacer la última corrección en un toque


## Notas

Cubre RF-12.3 y RF-13.3.



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
