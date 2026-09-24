---
id: HU-110
titulo: "Ver qué filtros usan realmente los clientes"
epica: EP-008
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.8
---

# HU-110 — Ver qué filtros usan realmente los clientes

**Como** responsable de producto del portal,
**quiero** ver qué facetas y qué valores usan los clientes al refinar,
**para** retirar los filtros que nadie toca y saber si las facetas siguen siendo refinamiento o volvieron a ser la entrada.

## Criterios de aceptación

### Happy path — uso por faceta y por valor

**Dado** que hubo sesiones con filtros aplicados en el período,
**cuando** abro el informe,
**Entonces** veo cada faceta con cuántas sesiones la usaron y qué valores eligieron
**Y** veo cuáles facetas no se usaron ni una vez

### Error — período sin uso de filtros

**Dado** que ninguna sesión aplicó filtros,
**cuando** abro el informe,
**Entonces** veo un estado vacío explícito
**Y** el informe no presenta ceros como si fueran un hallazgo

### Edge case — filtros aplicados después de una instrucción

**Dado** que la sesión escribió una instrucción y luego filtró,
**cuando** reviso el informe,
**Entonces** ese uso aparece separado del de las sesiones que solo filtraron
**Y** puedo leer si la subordinación de las facetas se sostiene

## Notas

Cubre la **primera mitad de RF-7.2** — *reporte de filtros más usados*—, que hasta el 2026-09-22 no tenía historia. La segunda mitad —búsquedas sin resultados— la cubre **HU-078** en EP-010, que es donde vive el registro de demanda con su dueño y cadencia (D-13).

**Esta historia reemplaza a la HU-110 anterior**, que duplicaba a HU-078: mismo actor, mismo *quiero*, mismo propósito y el mismo escenario de error. Se había escrito en el cierre de huecos del PRD 4.0 sin ver que HU-078 existía desde el PRD 2.8.

**El edge case es el que le da valor real.** RF-14.2 subordinó las facetas a la instrucción, y §14.7 fija la prueba que puede tumbar esa decisión. Saber **qué** filtros se usan después de instruir es más fino que saber cuántos: si lo que la gente toca es disponibilidad y no rol, la instrucción está acertando en lo importante y fallando en lo operativo, que es una conclusión distinta de «las facetas ganaron».

**Se distingue de HU-111**, que compara las dos rutas de entrada a nivel de conversión. Esta mira dentro de una de ellas.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.8 · RF-7.2 (primera mitad) · relacionada con HU-078 y HU-111

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ ya no duplica a HU-078 |
| N | Negociable | ✓ describe la lectura, no el formato del informe |
| V | Valiosa | ✓ permite retirar facetas muertas y leer si la Fase 2 se sostiene |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
