---
id: HU-074
titulo: "Refinar con filtros lo que la instrucción me devolvió"
epica: EP-002
prioridad: alta
complejidad: S
estado: draft
fase: fase-2-rediseno
prd_version: 2.0
---

# HU-074 — Refinar con filtros lo que la instrucción me devolvió

**Como** líder de área que ya tiene resultados de una instrucción,
**quiero** aplicar filtros sobre esos resultados sin perder la búsqueda que hice,
**para** recuperar el control cuando la instrucción devuelve más de lo que puedo revisar.

## Criterios de aceptación

### Happy path — filtro sobre resultado de instrucción

**Dado** que tengo resultados de una instrucción,
**cuando** aplico un filtro de seniority,
**Entonces** los resultados se reducen conservando la instrucción activa
**Y** veo la instrucción y el filtro como dos capas distintas
**Y** el portal registra que hubo uso de filtros después de una instrucción

### Error — el filtro deja cero resultados

**Dado** que tengo resultados de una instrucción,
**cuando** aplico un filtro que ningún resultado cumple,
**Entonces** se me ofrece quitar ese filtro específico en un toque
**Y** no pierdo la instrucción

### Edge case — filtrar sin instrucción previa

**Dado** que no he escrito ninguna instrucción,
**cuando** aplico filtros sobre el banco completo,
**Entonces** funcionan como en la versión anterior del portal
**Y** la ruta por facetas sigue disponible de principio a fin


## Notas

Cubre RF-14.2. El registro del primer escenario es la prueba de falsación: si más de la mitad de las sesiones usan filtros tras una instrucción, la jerarquía de la Fase 2 está mal planteada. El último escenario preserva deliberadamente la ruta por facetas como condición de control para las sesiones con clientes.



## Trazabilidad

Épica madre: **EP-002** · PRD v2.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |
