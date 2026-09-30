---
id: HU-137
titulo: "Ver los perfiles colocados y sus vencimientos"
epica: EP-006
prioridad: media
complejidad: M
estado: lista
fase: panel-crud
prd_version: 4.15
depende_de: [HU-141]
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

### Edge case — información cargada por Operaciones

**Dado** que Operaciones tiene información de asignaciones que no está en el panel,
**cuando** importo la hoja del sistema de asignación,
**Entonces** los colocados cargados aparecen en la pestaña marcados como procedentes de esa carga
**Y** la pestaña muestra visible la fecha de corte de la hoja cargada

### Error — la carga de Operaciones está desincronizada

**Dado** que la última carga de Operaciones tiene una fecha de corte más antigua que su periodicidad acordada,
**cuando** abro la pestaña de colocados,
**Entonces** el panel muestra el aviso «dato desincronizado» junto a la fecha de corte
**Y** los colocados de esa carga siguen visibles, marcados con el aviso, sin ocultarse

### Edge case — un colocado sigue publicado

**Dado** que un perfil está colocado hasta cierta fecha,
**cuando** lo busco en el inventario,
**Entonces** sigue en estado *publicado* con su disponibilidad en la fecha de liberación
**Y** el cliente lo ve en el portal con su banda de arranque, no oculto

## Notas

Cubre **RF-8.13**, **RF-8.13.1** y **RF-8.13.2**.

**De dónde sale el dato (D8, sponsor, 2026-09-30).** Combinación: Talento Humano lleva el control de los colocados en el propio panel —al marcar «colocado» registra cliente y fecha de liberación— y **el panel es la fuente**. Si Operaciones tiene otra información, la **carga** por importación (hoja del sistema de asignación), con su fecha de corte visible. **Sin integración automática en v1.** D8 revisa la lectura de RF-8.13.1 como «espejo de solo lectura»: la pestaña deja de ser solo un espejo y el PRD ya lo refleja (enmienda de RF-8.13.1 en la v4.15).

**Declarar la antigüedad del dato no es un detalle técnico.** RF-8.13.1 lo dice sin rodeos: duplicar una fuente de verdad sin declararlo es cómo un dato desactualizado termina sosteniendo una decisión. Por eso la fecha de corte y el aviso «dato desincronizado» son criterio de aceptación y no una nota al pie.

**Un colocado no se oculta.** Es la corrección que trajo el PRD v3.4 a RF-8.13.2: con un banco de decenas, ocultar cuatro perfiles vendibles es caro, y «arranca en un mes» es información útil para quien planea el trimestre siguiente. «Colocado» no es un estado: el perfil sigue *publicado* y la asignación se expresa en la disponibilidad (RF-8.14.1).

**Esta pestaña es el disparador de la renovación anticipada** (V2-2): convierte un dato administrativo en una lista de conversaciones comerciales con fecha.

**Revisión INVEST 2026-09-30:** aplicada D8 (registro del colocado en el panel como fuente, carga opcional de Operaciones con fecha de corte visible, sin integración automática); el antiguo «Error» del espejo pasa a edge de la carga de Operaciones y se añade el error real (carga más antigua que su periodicidad → «dato desincronizado»); When del último edge convertido en acción; se declara `depende_de: [HU-141]` porque la carga de Operaciones reutiliza la confirmación de la importación masiva. Sigue abierto confirmar con Eida y Jonathan el formato de la hoja que exporta el sistema de asignación y su periodicidad.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · RF-8.13 · RF-3.13 · D8 (sponsor, 2026-09-30) · depende de HU-141 · disparador de V2-2

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-141 (declarada) solo para la carga de Operaciones; el registro en el panel y la pestaña no dependen de ningún sistema externo tras D8 |
| N | Negociable | ✓ la fuente y la ausencia de integración las fija D8; el umbral de 60 días viene de RF-8.13; la forma de marcar lo cargado y el texto del aviso son negociables |
| V | Valiosa | ✓ anticipa inventario que vuelve y abre conversaciones de renovación |
| E | Estimable | parcial: el registro y la pestaña son estimables; la carga de Operaciones necesita el formato de la hoja y la periodicidad acordada (confirmar con Eida y Jonathan) |
| S | Pequeña | ✓ M: un registro en la ficha, una lista ordenada y una carga que reutiliza el importador |
| T | Testeable | ✓ cinco escenarios con fechas fijables (vencimiento a 59 y 61 días, carga con corte vencido) y resultado observable en la pestaña y en el portal |
