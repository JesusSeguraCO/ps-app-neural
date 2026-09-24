---
id: HU-137
titulo: "Ver los perfiles colocados y sus vencimientos"
epica: EP-006
prioridad: media
complejidad: M
estado: draft
fase: panel-crud
prd_version: 4.8
---

# HU-137 — Ver los perfiles colocados y sus vencimientos

**Como** administradora de inventario de Talento Humano,
**quiero** una pestaña con los perfiles colocados, su cuenta y cuándo vence cada asignación,
**para** saber qué inventario vuelve a estar libre antes de que el cliente me lo pregunte.

## Criterios de aceptación

### Happy path — colocados ordenados por vencimiento

**Dado** que hay perfiles colocados en cuentas,
**cuando** abro la pestaña,
**Entonces** veo cuenta, fecha de inicio y fecha de vencimiento de cada uno
**Y** están ordenados por proximidad del vencimiento
**Y** los que vencen dentro de 60 días están destacados

### Error — el dato viene de otro sistema y puede estar desactualizado

**Dado** que la fuente de verdad de las asignaciones vive en el sistema de asignación,
**cuando** abro la pestaña,
**Entonces** veo la fecha de corte del último sincronizado, declarada
**Y** no puedo editar desde aquí, porque es espejo de solo lectura

### Edge case — un colocado sigue publicado

**Dado** que un perfil está colocado hasta cierta fecha,
**cuando** lo veo en el inventario,
**Entonces** sigue en estado *publicado* con su disponibilidad en la fecha de fin de la asignación
**Y** el cliente lo ve en el portal con su banda de arranque, no oculto

## Notas

Cubre **RF-8.13**, **RF-8.13.1** y **RF-8.13.2**.

**Declarar que es espejo no es un detalle técnico.** RF-8.13.1 lo dice sin rodeos: duplicar una fuente de verdad sin declararlo es cómo un dato desactualizado termina sosteniendo una decisión. Por eso la fecha de corte es criterio de aceptación y no una nota al pie.

**Un colocado no se oculta.** Es la corrección que trajo el PRD v3.4 a RF-8.13.2: con un banco de decenas, ocultar cuatro perfiles vendibles es caro, y «arranca en un mes» es información útil para quien planea el trimestre siguiente.

**Esta pestaña es el disparador de la renovación anticipada** (V2-2): convierte un dato administrativo en una lista de conversaciones comerciales con fecha.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · RF-3.13 · disparador de V2-2

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de la integración con el sistema de asignación |
| N | Negociable | ✓ |
| V | Valiosa | ✓ anticipa inventario que vuelve y abre conversaciones de renovación |
| E | Estimable | por confirmar con Tecnología — depende del sistema de asignación |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
