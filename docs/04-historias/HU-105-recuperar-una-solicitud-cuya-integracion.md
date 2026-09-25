---
id: HU-105
titulo: "Recuperar una solicitud cuya integración falló"
epica: EP-007
prioridad: alta
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-105 — Recuperar una solicitud cuya integración falló

**Como** responsable de la operación del portal,
**quiero** que ninguna solicitud se pierda cuando el CRM no responde,
**para** no perder una oportunidad por un fallo técnico que el cliente nunca va a ver.

## Criterios de aceptación

### Happy path

**Dado** que la creación del negocio falla,
**cuando** se procesa el envío,
**Entonces** la solicitud entra en cola de reintento
**Y** el cliente recibe su confirmación igual
**Y** se alerta al responsable

### Error — el reintento también falla

**Dado** que los reintentos se agotan,
**cuando** se evalúa,
**Entonces** la solicitud queda en una bandeja de fallos con todos sus datos
**Y** alguien nominal es notificado

### Edge case — el negocio se creó pero la respuesta se perdió

**Dado** que el CRM creó el registro y no confirmó,
**cuando** se reintenta,
**Entonces** no se crea un negocio duplicado
**Y** el reintento reconoce el que ya existe


## Notas

Cubre RF-9.6. El último escenario es el error clásico de las colas de reintento y hay que cerrarlo desde el diseño.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |
