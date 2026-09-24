---
id: HU-094
titulo: "Volver a la selección después de explorar"
epica: EP-001
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-094 — Volver a la selección después de explorar

**Como** líder de proyecto que amplió la búsqueda al banco completo,
**quiero** volver a la selección que me armaron en un solo toque,
**para** no perder el trabajo de curaduría por haber explorado.

## Criterios de aceptación

### Happy path

**Dado** que amplié la búsqueda,
**cuando** toco volver a la selección,
**Entonces** regreso a los perfiles del correo
**Y** los que sumé al equipo mientras exploraba se conservan

### Error — la selección ya no existe

**Dado** que los perfiles de la selección se archivaron,
**cuando** intento volver,
**Entonces** se me explica y se ofrece continuar desde lo que llevo

### Edge case — nunca hubo selección

**Dado** que entré sin curaduría,
**cuando** miro la pantalla,
**Entonces** no aparece la opción de volver a una selección que no existe


## Notas

Cubre RF-2.2. Es la resolución de la tensión entre curaduría y descubrimiento de §2.5.

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
