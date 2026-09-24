---
id: HU-095
titulo: "Compartir el enlace con un colega"
epica: EP-001
prioridad: media
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-095 — Compartir el enlace con un colega

**Como** líder de área que quiere una segunda opinión de su arquitecto,
**quiero** reenviar el enlace y que mi colega vea lo mismo que yo,
**para** decidir en equipo sin tener que explicarle todo por escrito.

## Criterios de aceptación

### Happy path

**Dado** que reenvío el enlace a un colega de mi empresa,
**cuando** él lo abre,
**Entonces** ve la misma selección y el mismo contexto de cuenta
**Y** puede explorar y sumar perfiles

### Error — el colega envía la solicitud

**Dado** que él llega al formulario,
**cuando** lo diligencia,
**Entonces** puede identificarse como quien solicita
**Y** la solicitud viaja con sus datos y no con los míos

### Edge case — el enlace sale de la empresa

**Dado** que el enlace llega a alguien ajeno a la cuenta,
**cuando** lo abre,
**Entonces** ve el banco anonimizado sin datos de contacto ni tarifas
**Y** la sesión queda registrada como no correspondiente al contacto original


## Notas

Cubre RF-1.3 y RF-5.6. El reenvío interno es deseable y así se decidió en D-4; el último escenario es el riesgo aceptado de esa decisión.

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
