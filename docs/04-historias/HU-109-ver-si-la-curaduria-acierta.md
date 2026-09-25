---
id: HU-109
titulo: "Ver si la curaduría acierta"
epica: EP-008
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-109 — Ver si la curaduría acierta

**Como** responsable de armar el correo de cada cuenta,
**quiero** saber qué proporción de solicitudes incluye al menos un perfil de los que propusimos,
**para** saber si el criterio con que armo la selección sirve o si la gente siempre busca otra cosa.

## Criterios de aceptación

### Happy path

**Dado** que hubo solicitudes en el período,
**cuando** abro el informe,
**Entonces** veo qué porcentaje incluyó al menos un perfil de la selección enviada
**Y** veo el dato por cuenta

### Error — solicitudes sin selección previa

**Dado** que algunas vienen de enlaces sin curaduría,
**cuando** reviso,
**Entonces** esas quedan excluidas del cálculo
**Y** no se cuentan como fallo de curaduría

### Edge case — el cliente amplió y eligió otra cosa

**Dado** que solicitó solo perfiles del descubrimiento,
**cuando** reviso,
**Entonces** se registra como curaduría fallida
**Y** veo qué buscó, para corregir la próxima selección


## Notas

Cubre RF-7.4. Es el indicador más útil del proyecto para Mercadeo: mide el criterio con que se arma el correo, no el portal.

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
