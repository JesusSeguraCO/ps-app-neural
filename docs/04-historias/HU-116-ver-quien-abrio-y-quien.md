---
id: HU-116
titulo: "Ver quién abrió y quién entró"
epica: EP-011
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-116 — Ver quién abrió y quién entró

**Como** responsable de la distribución,
**quiero** ver por cuenta quién abrió el correo, quién tocó el enlace y quién llegó a solicitar,
**para** saber si el problema está en el correo, en el portal o en la oferta.

## Criterios de aceptación

### Happy path

**Dado** que hubo un envío,
**cuando** abro el informe,
**Entonces** veo apertura, clic y entrada por cuenta
**Y** veo cuántas terminaron en solicitud

### Error — envío sin datos de apertura

**Dado** que la herramienta no reporta aperturas,
**cuando** reviso,
**Entonces** el informe lo dice en lugar de mostrar cero
**Y** no se confunde ausencia de dato con ausencia de apertura

### Edge case — entra sin abrir

**Dado** que alguien entra por un enlace reenviado,
**cuando** se registra,
**Entonces** la entrada se atribuye al envío aunque no haya apertura propia


## Notas

Cubre RF-18.6 y RF-7.3. La distinción del segundo escenario evita la conclusión más común y más equivocada de todo informe de correo.

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
