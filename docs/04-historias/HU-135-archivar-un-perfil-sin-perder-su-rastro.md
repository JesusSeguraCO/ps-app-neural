---
id: HU-135
titulo: "Archivar un perfil sin perder su rastro"
epica: EP-006
prioridad: media
complejidad: S
estado: draft
fase: panel-crud
prd_version: 4.8
---

# HU-135 — Archivar un perfil sin perder su rastro

**Como** administradora de inventario de Talento Humano,
**quiero** que retirar un perfil del banco lo archive en vez de borrarlo,
**para** que una solicitud de hace tres meses siga explicándose con los perfiles que realmente se mostraron.

## Criterios de aceptación

### Happy path — archivar en lugar de borrar

**Dado** que un profesional salió del banco,
**cuando** uso la acción de eliminar,
**Entonces** el perfil pasa a estado *archivado* y no se borra
**Y** deja de mostrarse en el portal
**Y** sigue disponible para explicar solicitudes pasadas

### Error — no existe el borrado físico

**Dado** que quiero eliminar definitivamente un perfil,
**cuando** busco esa acción,
**Entonces** no existe en el panel
**Y** el panel explica que archivar conserva la trazabilidad de lo que se mostró

### Edge case — perfil archivado que estaba en una selección curada

**Dado** que un perfil archivado forma parte de un enlace curado ya emitido,
**cuando** el cliente abre ese enlace,
**Entonces** el portal muestra su estado real —fuera del banco— y no lo omite en silencio
**Y** los demás perfiles de la selección se ven con normalidad

## Notas

Cubre **RF-8.3**. El edge case se apoya en **RF-19.2** (reevaluación al abrir, HU-122).

**El borrado físico no existe a propósito.** Una solicitud enviada en julio tiene que poder explicarse en octubre con los perfiles que el cliente vio. Borrar un perfil destruye esa explicación y con ella la capacidad de responder cuando una cuenta dice «ustedes me mostraron a Fulano».

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · relacionada con HU-122

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ conserva la trazabilidad de lo mostrado |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
