---
id: HU-112
titulo: "Atribuir cada sesión a su envío de correo"
epica: EP-008
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-112 — Atribuir cada sesión a su envío de correo

**Como** responsable de la distribución,
**quiero** saber de qué envío vino cada sesión del portal,
**para** poder atribuir resultados al correo y no a la casualidad.

## Criterios de aceptación

### Happy path

**Dado** que alguien entra desde un enlace del boletín,
**cuando** se registra la sesión,
**Entonces** queda atribuida a la cuenta, al contacto y al envío de origen

### Error — entrada sin parámetros

**Dado** que alguien llega por un enlace sin atribución,
**cuando** se registra,
**Entonces** queda como origen directo y no se atribuye a ningún envío

### Edge case — entra otro invitado del mismo enlace

**Dado** que el enlace lo abre otra persona invitada al mismo enlace,
**cuando** se registra,
**Entonces** se atribuye al mismo envío
**Y** queda registrado el correo invitado con el que entró, distinto del contacto principal


## Notas

Cubre RF-7.3. Sin esto, el informe de EP-011 no puede existir.

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
