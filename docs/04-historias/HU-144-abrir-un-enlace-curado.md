---
id: HU-144
titulo: "Abrir el enlace y encontrar la selección que me armaron"
epica: EP-001
prioridad: alta
complejidad: S
estado: draft
fase: enlaces-curados
prd_version: 4.8
spec: docs/10-specs/enlaces-curados.md
---

# HU-144 — Abrir el enlace y encontrar la selección que me armaron

**Como** líder de área que recibió un enlace curado,
**quiero** abrirlo y ver los perfiles que eligieron para mí con su razón,
**para** entender en un vistazo por qué me proponen a estas personas y no a otras.

## Criterios de aceptación

### Happy path — la selección con su razón

**Dado** que abro un enlace curado vigente,
**cuando** carga el portal,
**Entonces** veo los perfiles seleccionados con la razón de la selección
**Y** el panel de especificación arranca vacío, porque no hay un rol común entre familias distintas
**Y** puedo ampliar la búsqueda y volver a la selección en un toque

### Error — enlace revocado

**Dado** que el enlace fue revocado,
**cuando** lo abro,
**Entonces** veo una pantalla que explica cómo pedir uno nuevo
**Y** no veo un error ni el inventario

### Edge case — un perfil cambió entre generar y abrir

**Dado** que un perfil del enlace se colocó en otro proyecto,
**cuando** abro el enlace,
**Entonces** veo los demás con normalidad
**Y** veo ese perfil aparte, con su estado real y cuándo se libera
**Y** nunca encuentro un hueco sin explicación

## Notas

**Dividida de HU-122 el 2026-09-22.** El actor es otro —el cliente, no Talento Humano— y eso hacía que la historia original tuviera dos happy paths incompatibles en una sola.

**La fragilidad de la lista se resuelve sin renunciar a ella.** El portal reevalúa cada código al abrirse (RF-19.2): un hueco silencioso se lee como desorden; un cambio explicado se lee como control. Por eso el edge case es el criterio que más pesa de los tres.

**El panel arranca vacío a propósito.** Si la selección mezcla familias —un gerente y un QA— no hay rol común, y deducir uno sería inventar (RF-19.7).

Cubre **RF-19.2**, **RF-19.6** y **RF-19.7**.

## Trazabilidad

Épica madre: **EP-001** · PRD v4.8 · depende de HU-122

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-122 — sin enlace emitido no hay qué abrir |
| N | Negociable | ✓ |
| V | Valiosa | ✓ el beneficio es del cliente y es visible en el primer segundo |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
