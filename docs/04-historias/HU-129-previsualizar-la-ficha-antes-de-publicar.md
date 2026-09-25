---
id: HU-129
titulo: "Previsualizar la ficha exactamente como la verá el cliente"
epica: EP-006
prioridad: alta
complejidad: S
estado: draft
fase: panel-crud
prd_version: 4.8
---

# HU-129 — Previsualizar la ficha exactamente como la verá el cliente

**Como** administradora de inventario de Talento Humano,
**quiero** ver la ficha tal como la verá el cliente antes de publicarla,
**para** no descubrir en producción que un campo quedó vacío o que un texto se lee distinto de lo que pensé.

## Criterios de aceptación

### Happy path — vista previa fiel

**Dado** que tengo un perfil listo para publicar,
**cuando** abro la vista previa,
**Entonces** veo la ficha exactamente como la verá el cliente
**Y** veo la disponibilidad como banda de arranque, no como fecha
**Y** veo el país, y la ciudad solo si la necesidad fuera presencial o híbrida

### Error — campos que no alcanzan a llenar su bloque

**Dado** que un bloque de la ficha no tiene datos suficientes,
**cuando** previsualizo,
**Entonces** veo cómo se comporta ese bloque vacío en la ficha real
**Y** el panel me dice si eso impide publicar o solo empobrece la ficha

### Edge case — previsualizar un perfil ya publicado

**Dado** que edité un perfil publicado,
**cuando** previsualizo,
**Entonces** veo el resultado del cambio antes de confirmarlo
**Y** puedo compararlo con lo que el cliente ve ahora

## Notas

Cubre **RF-8.7**. Se apoya en **RF-3.13** (banda de disponibilidad) y en la revisión de **D-18** (ciudad condicionada a la modalidad).

**La fidelidad es el requisito, no el detalle.** Una vista previa aproximada es peor que ninguna: crea confianza en algo que no se verificó. Por eso los tres escenarios verifican equivalencia con lo que el portal publica, incluidas las reglas de presentación que no viven en el dato — la banda y la ciudad condicionada.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · RF-3.13 · D-18 revisada

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ evita publicar fichas rotas |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ la equivalencia con la ficha publicada es verificable |
