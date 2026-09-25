---
id: HU-104
titulo: "Que no se me duplique la empresa en el CRM"
epica: EP-007
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-104 — Que no se me duplique la empresa en el CRM

**Como** administrador del CRM,
**quiero** que una solicitud de alguien nuevo dentro de una empresa conocida no cree una empresa repetida,
**para** no tener que fusionar registros a mano cada mes.

## Criterios de aceptación

### Happy path

**Dado** que el contacto ya existe,
**cuando** llega la solicitud,
**Entonces** se asocia al contacto y a la empresa existentes
**Y** no se crea ningún registro nuevo de empresa

### Error — contacto nuevo en empresa conocida

**Dado** que quien solicita no está en el CRM,
**cuando** llega la solicitud,
**Entonces** se crea el contacto
**Y** se asocia a la empresa existente

### Edge case — dominio de correo distinto

**Dado** que el correo tiene un dominio que no coincide con el de la empresa,
**cuando** llega la solicitud,
**Entonces** se usa la cuenta del enlace para resolver la empresa, no el dominio del correo
**Y** el contacto queda marcado para revisión


## Notas

Cubre RF-9.2. El último escenario importa porque un invitado del enlace puede tener otro dominio, por ejemplo un consultor externo de la cuenta.

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
