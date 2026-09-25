---
id: HU-117
titulo: "Reaccionar a una cuenta que nunca abre"
epica: EP-011
prioridad: media
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-117 — Reaccionar a una cuenta que nunca abre

**Como** ejecutivo comercial dueño de la cuenta,
**quiero** que me avisen cuando una de mis cuentas acumula tres envíos sin abrir,
**para** tratarlo como lo que es, una señal comercial, y no como un problema de correo.

## Criterios de aceptación

### Happy path

**Dado** que una cuenta acumula tres envíos sin abrir,
**cuando** se evalúa,
**Entonces** recibo el aviso con el histórico
**Y** la cuenta queda marcada para revisión antes de seguir enviando

### Error — problema de entregabilidad

**Dado** que el correo ni siquiera llega,
**cuando** se evalúa,
**Entonces** se distingue del caso de no apertura
**Y** se corrige el dato antes de escalar comercialmente

### Edge case — abre pero nunca entra

**Dado** que abre el correo y nunca toca el enlace,
**cuando** se evalúa,
**Entonces** se trata distinto: el problema no es el canal sino la propuesta
**Y** la selección de esa cuenta se revisa


## Notas

Cubre RF-18.6. El tercer escenario es el más informativo: quien abre y no entra está diciendo que la selección no le habla.

## Trazabilidad

Épica madre: **EP-011** · PRD v4.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |
