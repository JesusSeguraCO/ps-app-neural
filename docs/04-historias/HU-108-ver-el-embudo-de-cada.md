---
id: HU-108
titulo: "Ver el embudo de cada cuenta"
epica: EP-008
prioridad: media
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-108 — Ver el embudo de cada cuenta

**Como** responsable de la línea,
**quiero** ver cuántas cuentas abrieron, exploraron y solicitaron en el período,
**para** saber dónde se cae la gente en lugar de suponerlo.

## Criterios de aceptación

### Happy path

**Dado** que hubo actividad en el período,
**cuando** abro el informe,
**Entonces** veo entradas, sesiones con búsqueda, fichas abiertas y solicitudes
**Y** puedo verlo por cuenta y en total

### Error — período sin actividad

**Dado** que no hubo entradas,
**cuando** abro el informe,
**Entonces** veo un estado vacío que lo dice
**Y** no veo ceros sin explicación

### Edge case — una cuenta con muchas sesiones

**Dado** que alguien entró veinte veces,
**cuando** reviso,
**Entonces** distingo sesiones de personas distintas
**Y** una cuenta activa no distorsiona el total


## Notas

Cubre RF-7.1 y O2.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |
