---
id: HU-132
titulo: "Actualizar la disponibilidad en dos clics"
epica: EP-006
prioridad: alta
complejidad: S
estado: draft
fase: panel-crud
prd_version: 4.8
---

# HU-132 — Actualizar la disponibilidad en dos clics

**Como** administradora de inventario de Talento Humano,
**quiero** cambiar la disponibilidad de un perfil desde el listado sin abrirlo,
**para** que mantener el banco al día cueste segundos y no deje de hacerse.

## Criterios de aceptación

### Happy path — cambio desde el listado

**Dado** que estoy en el listado de perfiles,
**cuando** actualizo la disponibilidad de uno,
**Entonces** el cambio se guarda sin abrir la ficha completa
**Y** el portal refleja la nueva banda de arranque de inmediato
**Y** queda registrado quién lo cambió y cuándo

### Error — fecha que contradice el estado

**Dado** que el perfil está *pausado*,
**cuando** le pongo una fecha de disponibilidad,
**Entonces** el panel señala la incoherencia en la fila
**Y** me ofrece la acción que la corrige en un clic

### Edge case — varios perfiles a la vez

**Dado** que varios perfiles quedan libres el mismo día,
**cuando** los selecciono y actualizo juntos,
**Entonces** el cambio se aplica a todos
**Y** veo el resultado por perfil, no un mensaje global

## Notas

Cubre **RF-8.5** y se apoya en **RF-8.14.1** y **RF-8.14.3**.

**Esta es la historia de la que depende O5.** El objetivo habilitante mide el porcentaje de perfiles publicados con disponibilidad actualizada en los últimos 30 días. Si actualizar cuesta abrir una ficha, navegar y guardar, no se hace; y cuando no se hace, el portal empieza a afirmar disponibilidades que nadie sostiene. Dos clics no es una comodidad: es la condición de que el objetivo se cumpla.

**La fecha se captura aquí; el cliente ve una banda.** RF-3.13 traduce en el momento de mostrar, así que la banda se recalcula sola y no envejece.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · O5 · RF-3.13

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ «dos clics» es la intención, no la implementación |
| V | Valiosa | ✓ es la condición operativa de O5 |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
