---
id: HU-099
titulo: "Agendar la sesión de alineación"
epica: EP-005
prioridad: media
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-099 — Agendar la sesión de alineación

**Como** líder de proyecto con prisa,
**quiero** elegir un horario para la sesión de alineación sin esperar un correo,
**para** arrancar el proceso el mismo día en que decidí.

## Criterios de aceptación

### Happy path

**Dado** que estoy en la confirmación,
**cuando** elijo un horario disponible,
**Entonces** la sesión queda agendada
**Y** la fecha se registra en el negocio
**Y** recibo la invitación

### Error — sin horarios disponibles

**Dado** que no hay disponibilidad en los próximos días,
**cuando** abro el agendamiento,
**Entonces** se me ofrece que el ejecutivo me contacte
**Y** no quedo en una pantalla sin salida

### Edge case — no quiero agendar ahora

**Dado** que cierro sin agendar,
**cuando** salgo del portal,
**Entonces** la solicitud sigue vigente
**Y** el responsable interno debe agendarla igual


## Notas

Cubre RF-5.4 y RF-17.4. Es v1.1: en el MVP la confirmación explica el paso y el comercial agenda. **La fecha de alineación debe escribirse en el negocio aunque se agende por fuera**, o O3 no se puede medir.

## Trazabilidad

Épica madre: **EP-005** · PRD v4.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |
