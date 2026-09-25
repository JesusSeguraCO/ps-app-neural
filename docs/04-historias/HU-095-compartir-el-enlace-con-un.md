---
id: HU-095
titulo: "Pedir acceso para un colega"
epica: EP-001
prioridad: media
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.10
---

# HU-095 — Pedir acceso para un colega

**Como** líder de área que quiere una segunda opinión de su arquitecto,
**quiero** pedir que inviten a mi colega y que vea lo mismo que yo,
**para** decidir en equipo sin tener que explicarle todo por escrito.

## Criterios de aceptación

### Happy path — invitación aprobada

**Dado** que pedí desde el portal que invitaran a mi colega y Talento Humano lo aprobó,
**cuando** mi colega abre el enlace y verifica su correo con el código,
**Entonces** ve la misma selección y el mismo contexto de cuenta
**Y** puede explorar y sumar perfiles

### Error — el colega abre el enlace sin estar invitado

**Dado** que le reenvié el enlace a mi colega sin pedir su invitación,
**cuando** él escribe su correo en la puerta,
**Entonces** no recibe código ni ve perfiles
**Y** el portal le explica que el acceso es nominal y le ofrece pedir la invitación

### Edge case — Talento Humano rechaza la invitación

**Dado** que pedí invitar a una persona y Talento Humano rechazó la petición,
**cuando** vuelvo a entrar al portal,
**Entonces** veo que la invitación no se aprobó y a quién consultar
**Y** esa persona sigue sin acceso


## Notas

Cubre RF-1.2.10 y RF-1.2.11. **Reescrita el 2026-09-25** tras la revisión de D-4 a acceso nominal: antes la historia era «Compartir el enlace con un colega» y dependía del reenvío libre dentro de la empresa, que ya no da acceso. La necesidad —la segunda opinión del arquitecto— se conserva por invitación aprobada.

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
