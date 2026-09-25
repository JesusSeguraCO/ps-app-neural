---
id: HU-134
titulo: "Corregir incoherencias entre estado y disponibilidad"
epica: EP-006
prioridad: alta
complejidad: M
estado: draft
fase: panel-crud
prd_version: 4.8
---

# HU-134 — Corregir incoherencias entre estado y disponibilidad

**Como** administradora de inventario de Talento Humano,
**quiero** ver en la propia fila cuándo el estado y la disponibilidad de un perfil se contradicen, con la acción que lo corrige,
**para** no tener que auditar el banco a mano buscando datos que se pelean entre sí.

## Criterios de aceptación

### Happy path — incoherencia señalada y corregible

**Dado** que un perfil tiene estado y disponibilidad que se contradicen,
**cuando** miro el listado,
**Entonces** la incoherencia aparece señalada en su propia fila
**Y** la acción que la corrige está a un clic

### Error — incoherencia de severidad alta

**Dado** que la incoherencia es de severidad alta,
**cuando** intento publicar ese perfil,
**Entonces** el panel lo impide hasta que se resuelva
**Y** me dice cuál es la contradicción

### Edge case — incoherencia de severidad media

**Dado** que la incoherencia es de severidad media,
**cuando** publico,
**Entonces** el panel me advierte sin bloquear
**Y** la advertencia queda visible en la fila hasta que se resuelva

### Edge case — disponibilidad vencida y sin tocar

**Dado** que la fecha de disponibilidad ya pasó y el perfil lleva más de 30 días sin actualizarse,
**cuando** el cliente lo ve en el portal,
**Entonces** aparece como «Disponibilidad por confirmar» y no como disponible ahora
**Y** el perfil aparece en mi bandeja de vigencia

## Notas

Cubre **RF-8.14.3** y **RF-8.14.4**.

**La regla del último edge case es la que protege la credibilidad.** Afirmar disponibilidad con base en un dato que nadie sostiene es, según el PRD, «la forma más silenciosa de perder credibilidad con una cuenta activa». Por eso una fecha vencida no produce «Inmediato» (RF-3.13.3): produce «Por confirmar».

**La severidad separa lo que bloquea de lo que advierte.** Es una distinción de producto, no un parámetro administrable: queda fuera de los catálogos de RF-8.16.1.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · RF-3.13.3 · relacionada con HU-132 y HU-136

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ sostiene la credibilidad del inventario publicado |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
