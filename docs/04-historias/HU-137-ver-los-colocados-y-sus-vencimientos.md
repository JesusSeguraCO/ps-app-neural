---
id: HU-137
titulo: "Ver los perfiles colocados y sus vencimientos"
epica: EP-006
prioridad: media
complejidad: M
estado: lista
fase: panel-crud
prd_version: 4.15
depende_de: []
---

# HU-137 — Ver los perfiles colocados y sus vencimientos

**Como** administradora de inventario de Talento Humano,
**quiero** registrar en el panel cada perfil colocado con su cuenta y su fecha de liberación, y verlos todos en una pestaña ordenada por vencimiento,
**para** saber qué inventario vuelve a estar libre antes de que el cliente me lo pregunte.

## Criterios de aceptación

### Happy path — registrar un colocado en el panel

**Dado** que un perfil publicado acaba de ser asignado a una cuenta,
**cuando** lo marco como colocado registrando el cliente y la fecha de liberación,
**Entonces** el perfil aparece en la pestaña de colocados con la cuenta, la fecha de inicio y la de liberación
**Y** su disponibilidad pasa a ser la fecha de liberación
**Y** el registro queda atribuido a mí como fuente del dato

### Happy path — colocados ordenados por vencimiento

**Dado** que hay perfiles colocados en cuentas,
**cuando** abro la pestaña de colocados,
**Entonces** veo cuenta, fecha de inicio y fecha de liberación de cada uno
**Y** están ordenados por proximidad del vencimiento
**Y** los que vencen dentro de 60 días están destacados

### Error — colocado sin fecha de liberación

**Dado** que estoy marcando un perfil publicado como colocado,
**cuando** guardo el registro con el cliente pero sin fecha de liberación,
**Entonces** el panel no guarda el registro y me dice que un colocado siempre lleva su fecha de liberación
**Y** el perfil conserva el estado y la disponibilidad que tenía

### Edge case — un colocado sigue publicado

**Dado** que un perfil está colocado hasta cierta fecha,
**cuando** lo busco en el inventario,
**Entonces** sigue en estado *publicado* con su disponibilidad en la fecha de liberación
**Y** el cliente lo ve en el portal con su banda de arranque, no oculto

## Notas

Cubre **RF-8.13**, **RF-8.13.1** (en su parte de registro en el panel) y **RF-8.13.2**. La carga de la información de Operaciones, su fecha de corte y el aviso «dato desincronizado» viven en **HU-150**.

**De dónde sale el dato (D8, sponsor, 2026-09-30).** Talento Humano lleva el control de los colocados en el propio panel —al marcar «colocado» registra cliente y fecha de liberación— y **el panel es la fuente**. Sin integración automática en v1. D8 revisa la lectura de RF-8.13.1 como «espejo de solo lectura» (enmienda de RF-8.13.1 en la v4.15).

**Un colocado no se oculta.** Es la corrección que trajo el PRD v3.4 a RF-8.13.2: con un banco de decenas, ocultar cuatro perfiles vendibles es caro, y «arranca en un mes» es información útil para quien planea el trimestre siguiente. «Colocado» no es un estado: el perfil sigue *publicado* y la asignación se expresa en la disponibilidad (RF-8.14.1). Por eso un colocado siempre lleva su fecha de liberación (RF-8.13.2, D5): sin ella no hay disponibilidad que mostrar.

**Esta pestaña es el disparador de la renovación anticipada** (V2-2): convierte un dato administrativo en una lista de conversaciones comerciales con fecha.

**Revisión INVEST 2026-09-30:** aplicada D8 (registro del colocado en el panel como fuente, sin integración automática); When del último edge convertido en acción.

**Revisión DoR 2026-09-30: aplicada D12** (sponsor; bloqueo B5 del DoR, partición, no recorte). La carga de la información de colocados de Operaciones sale a **HU-150** («Cargar la información de colocados de Operaciones», JSON o CSV, fecha de corte visible, aviso «dato desincronizado» a los más de 7 días sin carga nueva). HU-137 queda con el registro en el panel y su vista ordenada por vencimiento. Salen de aquí el edge de la carga de Operaciones y el error de «dato desincronizado»; entra como error el registro sin fecha de liberación (RF-8.13.2). Se retira `depende_de: [HU-141]`, que solo existía por la carga. Con eso la E pasa a ✓: ya no depende del formato de la hoja de Operaciones.

## Trazabilidad

> OpenSpec change: administracion-del-inventario

Épica madre: **EP-006** · PRD v4.15 · RF-8.13 · RF-8.13.1 · RF-8.13.2 · RF-3.13 · D8 y D12 (sponsor, 2026-09-30) · la carga de Operaciones en HU-150 · disparador de V2-2

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ tras D12 el registro en el panel y la pestaña no dependen de ningún sistema externo ni de la importación; HU-150 se apoya en esta, no al revés |
| N | Negociable | ✓ la fuente (el panel) la fija D8 y el umbral de 60 días viene de RF-8.13; la forma de registrar el colocado en la ficha y cómo se destaca el vencimiento son negociables |
| V | Valiosa | ✓ anticipa inventario que vuelve y abre conversaciones de renovación |
| E | Estimable | ✓ M: un registro de colocado en la ficha (cliente, fecha de inicio y de liberación) que fija la disponibilidad, y una lista ordenada con destacado; ya no depende del formato de la hoja de Operaciones (D12) |
| S | Pequeña | ✓ M: una capacidad (registrar y ver colocados) en cuatro escenarios |
| T | Testeable | ✓ fechas fijables (vencimiento a 59 y 61 días), rechazo sin fecha de liberación con el perfil intacto, y estado y banda observables en la pestaña y en el portal |
