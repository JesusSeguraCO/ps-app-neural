---
id: HU-101
titulo: "Recibir la solicitud con contexto suficiente para preparar la sesión"
epica: EP-005
prioridad: alta
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-101 — Recibir la solicitud con contexto suficiente para preparar la sesión

**Como** integrante de Coordinación de Servicio responsable de la alineación,
**quiero** recibir la especificación completa del cliente y no solo los perfiles que eligió,
**para** llegar a la sesión sabiendo qué problema tiene y no solo qué pidió.

## Criterios de aceptación

### Happy path

**Dado** que llega una solicitud,
**cuando** la abro,
**Entonces** veo el reto declarado, la especificación completa y los perfiles seleccionados
**Y** veo si el cliente revisó su especificación o si la inferimos nosotros
**Y** veo quién solicita y desde qué cuenta

### Error — especificación incompleta

**Dado** que el cliente no abrió el Perfil Objetivo,
**cuando** recibo la solicitud,
**Entonces** la especificación inferida llega marcada como no revisada
**Y** tengo lo suficiente para preparar la sesión igual

### Edge case — sin responsable asignado

**Dado** que la solicitud llega sin dueño,
**cuando** pasa el tiempo,
**Entonces** el escalamiento se activa
**Y** nunca queda en una bandeja compartida sin lector


## Notas

Cubre RF-17 completo. Cierra el hueco entre «se envió la solicitud» y «alguien la convirtió en una sesión agendada», que es donde vive O3.

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
