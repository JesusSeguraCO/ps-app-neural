---
id: HU-098
titulo: "Saber qué pasa después de enviar"
epica: EP-005
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-098 — Saber qué pasa después de enviar

**Como** líder de proyecto que acaba de enviar la solicitud,
**quiero** entender cuál es el paso siguiente y en cuánto tiempo,
**para** no quedarme esperando sin saber si alguien la recibió.

## Criterios de aceptación

### Happy path

**Dado** que envío la solicitud,
**cuando** llego a la confirmación,
**Entonces** veo que el paso siguiente es una sesión de alineación con Delivery
**Y** veo el plazo de 10 días hábiles y desde cuándo corre
**Y** veo un resumen de lo que envié

### Error — falla la integración con el CRM

**Dado** que la creación del negocio falla,
**cuando** se procesa el envío,
**Entonces** recibo la confirmación igual
**Y** la solicitud entra en cola de reintento y se alerta internamente

### Edge case — segunda solicitud parecida

**Dado** que ya envié una solicitud similar hace días,
**cuando** envío otra,
**Entonces** el portal me muestra que hay una en curso y su fecha
**Y** puedo añadir contexto en lugar de duplicarla


## Notas

Cubre RF-5.4, RF-5.5 y RF-9.6. La confirmación nunca se comunica como reserva ni contratación: es la resolución de §2.4.

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
