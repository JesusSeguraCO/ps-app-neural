---
id: HU-132
titulo: "Actualizar la disponibilidad en dos clics"
epica: EP-006
prioridad: alta
complejidad: S
estado: lista
fase: panel-crud
prd_version: 4.8
depende_de: [HU-123]
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

### Error — un observador intenta cambiar la disponibilidad

**Dado** que entré al panel con rol observador,
**cuando** intento cambiar la disponibilidad de un perfil desde el listado,
**Entonces** el panel no me lo permite
**Y** la disponibilidad del perfil no cambia y no queda ningún cambio registrado

### Edge case — varios perfiles a la vez

**Dado** que seleccioné en el listado varios perfiles que quedan libres el mismo día,
**cuando** actualizo su disponibilidad en bloque,
**Entonces** el cambio se aplica a todos
**Y** veo el resultado por perfil, no un mensaje global

## Notas

Cubre **RF-8.5** y se apoya en **RF-8.14.1** y **RF-8.14.3**. Los roles del panel (administrador de inventario escribe, observador consulta) son los de **D-22** y **HU-123**.

**Esta es la historia de la que depende O5.** El objetivo habilitante mide el porcentaje de perfiles publicados con disponibilidad actualizada en los últimos 30 días. Si actualizar cuesta abrir una ficha, navegar y guardar, no se hace; y cuando no se hace, el portal empieza a afirmar disponibilidades que nadie sostiene. Dos clics no es una comodidad: es la condición de que el objetivo se cumpla.

**La fecha se captura aquí; el cliente ve una banda.** RF-3.13 traduce en el momento de mostrar, así que la banda se recalcula sola y no envejece.

**Qué pasa si la fecha contradice el estado.** El caso «perfil *pausado* al que le ponen fecha» es de **HU-134** (decisión del sponsor D6, 2026-09-30): allí se señala la incoherencia en la fila y se ofrece la corrección. Esta historia solo guarda la fecha.

**Revisión INVEST 2026-09-30:** se aplica D6: sale el caso pausado + fecha (pasa a HU-134) y el error propio pasa a ser el observador que intenta cambiar la disponibilidad; en el edge, la selección queda en el Dado y el Cuando es una sola acción («actualizo su disponibilidad en bloque»). Se declara la dependencia de HU-123 por los roles.

## Trazabilidad

> OpenSpec change: administracion-del-inventario

Épica madre: **EP-006** · PRD v4.8 · RF-8.5 · O5 · RF-3.13 · D-22 · D6 del sponsor (2026-09-30) · depende de HU-123 (roles del panel) · relacionada con HU-134

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: necesita los roles del panel de HU-123, ya construida; la señal de incoherencia es de HU-134 y no bloquea esta |
| N | Negociable | ✓ «dos clics» es la intención, no la implementación |
| V | Valiosa | ✓ es la condición operativa de O5 |
| E | Estimable | ✓ un control de fecha en la fila, una acción en bloque sobre la selección y la escritura por la vía única del dominio con auditoría y control de versión (ADR-0003) |
| S | Pequeña | ✓ S: un campo editable en el listado, individual y en bloque |
| T | Testeable | ✓ banda nueva en el portal, auditoría con autor y hora, rechazo al observador sin escritura, y resultado por perfil en el bloque |
