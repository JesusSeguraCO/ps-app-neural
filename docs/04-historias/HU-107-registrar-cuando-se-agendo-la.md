---
id: HU-107
titulo: "Registrar cuándo se agendó la alineación"
epica: EP-007
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-107 — Registrar cuándo se agendó la alineación

**Como** responsable de medir el arranque comercial,
**quiero** que quede la fecha en que se agendó la sesión de alineación de cada solicitud,
**para** saber cuántas solicitudes mueren entre que llegan y que alguien se sienta con el cliente.

## Criterios de aceptación

### Happy path

**Dado** que se agenda la sesión,
**cuando** se registra,
**Entonces** la fecha queda en una propiedad del negocio
**Y** el informe puede calcular los días entre solicitud y sesión

### Error — se agenda por fuera del portal

**Dado** que el comercial agenda por teléfono,
**cuando** se procesa,
**Entonces** igual debe escribir la fecha en el negocio
**Y** sin ese dato el indicador no existe

### Edge case — se reagenda

**Dado** que la sesión se mueve de fecha,
**cuando** se actualiza,
**Entonces** se conserva la fecha del primer agendamiento
**Y** el indicador mide el tiempo hasta el compromiso, no hasta la reunión efectiva


## Notas

Cubre RF-9.1.3 y RF-17.4. **Sin esta historia, O3 no se puede medir.** Al usar las etapas del pipeline comercial (D-21), la alineación no tiene etapa propia y esta propiedad es el único registro del tramo.

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
