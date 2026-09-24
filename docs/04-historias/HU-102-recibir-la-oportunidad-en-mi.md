---
id: HU-102
titulo: "Recibir la oportunidad en mi pipeline"
epica: EP-007
prioridad: alta
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-102 — Recibir la oportunidad en mi pipeline

**Como** ejecutivo comercial dueño de una cuenta,
**quiero** que cada solicitud del portal llegue como un negocio en el pipeline de la línea,
**para** trabajarla donde trabajo todo lo demás y no en una bandeja aparte.

## Criterios de aceptación

### Happy path

**Dado** que un cliente envía una solicitud,
**cuando** se procesa,
**Entonces** se crea un negocio en el pipeline de People Service, en su etapa de entrada
**Y** queda asociado al contacto y a la empresa existentes
**Y** trae la especificación completa como propiedades, no como texto libre

### Error — la cuenta ya tiene un negocio abierto

**Dado** que existe un negocio vigente para esa empresa,
**cuando** llega la solicitud,
**Entonces** se crea uno nuevo y se asocia como relacionado
**Y** no se actualiza el existente, porque eso borraría la atribución de origen

### Edge case — etapa de entrada y pronóstico

**Dado** que el negocio entra al pipeline,
**cuando** se calcula el pronóstico,
**Entonces** la etapa de entrada queda excluida del pronóstico
**Y** una solicitud no infla el forecast antes de estar calificada


## Notas

Cubre RF-9.1 y RF-9.2. D-6 y D-7 cerradas.

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
