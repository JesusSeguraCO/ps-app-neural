---
id: HU-115
titulo: "Programar y enviar el boletín"
epica: EP-011
prioridad: alta
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-115 — Programar y enviar el boletín

**Como** responsable de la distribución,
**quiero** enviar con una cadencia definida y saber que salió,
**para** que el portal tenga tráfico recurrente y no por impulsos.

## Criterios de aceptación

### Happy path

**Dado** que la selección está lista,
**cuando** programo el envío,
**Entonces** el boletín sale en la fecha definida
**Y** queda registro de a quién se envió y con qué selección

### Error — selección incompleta

**Dado** que falta la razón de la selección de alguna cuenta,
**cuando** intento programar,
**Entonces** el sistema lo señala
**Y** no se envía una selección sin explicación

### Edge case — cuenta que pidió no recibir

**Dado** que un contacto pidió dejar de recibirlo,
**cuando** se prepara el envío,
**Entonces** queda excluido
**Y** su exclusión se mantiene en envíos siguientes


## Notas

Cubre RF-18.5. **Sin cadencia no hay hábito, y sin hábito no hay O5.**

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
