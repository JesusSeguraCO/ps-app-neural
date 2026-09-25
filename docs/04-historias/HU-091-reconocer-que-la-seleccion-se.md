---
id: HU-091
titulo: "Reconocer que la selección se armó para mi proyecto"
epica: EP-001
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-091 — Reconocer que la selección se armó para mi proyecto

**Como** líder de proyecto que abre el enlace del correo,
**quiero** encontrar los mismos perfiles que vi en el correo, con la razón por la que los eligieron,
**para** sentir que alguien pensó en mi caso y no que me mandaron un catálogo.

## Criterios de aceptación

### Happy path

**Dado** que entro desde un enlace con selección,
**cuando** carga el portal,
**Entonces** veo los mismos perfiles del correo, sin pasos intermedios
**Y** veo la razón declarada de la selección, referida a mi proyecto

### Error — un perfil de la selección ya no está disponible

**Dado** que uno de los perfiles se pausó desde el envío,
**cuando** entro,
**Entonces** veo los demás con normalidad
**Y** el portal indica que uno cambió de disponibilidad, sin dejar un hueco sin explicar

### Edge case — selección vacía

**Dado** que todos los perfiles de la selección dejaron de estar publicados,
**cuando** entro,
**Entonces** no veo una pantalla vacía
**Y** se me lleva a explorar el banco con el contexto de mi proyecto ya aplicado


## Notas

Cubre RF-1.3 y RF-2.1. El escenario de error es real: entre que se arma el correo y que el cliente lo abre pasan días.

## Trazabilidad

Épica madre: **EP-001** · PRD v4.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |
