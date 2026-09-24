---
id: HU-106
titulo: "Distinguir lo que entra por el portal de lo que entra por gestión"
epica: EP-007
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-106 — Distinguir lo que entra por el portal de lo que entra por gestión

**Como** responsable de medir el rendimiento de la línea,
**quiero** saber qué negocios se originaron en el portal,
**para** poder comparar el portal contra los demás orígenes en lugar de suponer que funciona.

## Criterios de aceptación

### Happy path

**Dado** que se crea un negocio desde el portal,
**cuando** reviso el CRM,
**Entonces** el negocio lleva una propiedad de origen marcada como portal
**Y** puedo filtrar y comparar por origen

### Error — origen sin definir

**Dado** que un negocio de la línea se crea a mano sin origen,
**cuando** reviso el informe,
**Entonces** aparece como origen no especificado y no se suma al portal
**Y** el informe no atribuye al portal lo que no es suyo

### Edge case — solicitud dirigida desde el camino del cero

**Dado** que la solicitud nace de una búsqueda sin resultados,
**cuando** se crea el negocio,
**Entonces** el origen distingue entre solicitud de perfiles existentes y solicitud de perfil a medida


## Notas

Cubre RF-9.1.1. Sin esta propiedad, el pipeline propio impide comparar el portal con los demás orígenes, que es el KPI de §11.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |
