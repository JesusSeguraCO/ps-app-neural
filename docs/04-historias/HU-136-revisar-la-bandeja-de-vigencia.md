---
id: HU-136
titulo: "Revisar la bandeja de vigencia"
epica: EP-006
prioridad: alta
complejidad: S
estado: draft
fase: panel-crud
prd_version: 4.8
---

# HU-136 — Revisar la bandeja de vigencia

**Como** administradora de inventario de Talento Humano,
**quiero** una bandeja con los perfiles que llevan más de 30 días sin actualizarse,
**para** que mantener el banco vivo sea una lista de trabajo y no un acto de memoria.

## Criterios de aceptación

### Happy path — bandeja con trabajo concreto

**Dado** que hay perfiles publicados sin actualización en más de 30 días,
**cuando** abro la bandeja de vigencia,
**Entonces** los veo marcados para revisión, ordenados por antigüedad del último cambio
**Y** desde ahí puedo actualizar la disponibilidad sin abrir cada ficha

### Error — bandeja vacía

**Dado** que ningún perfil lleva más de 30 días sin tocarse,
**cuando** abro la bandeja,
**Entonces** el panel lo declara explícitamente
**Y** no muestra una lista vacía sin explicación

### Edge case — perfil vencido que ya se muestra como «por confirmar»

**Dado** que un perfil vencido ya aparece en el portal como «Disponibilidad por confirmar»,
**cuando** lo veo en la bandeja,
**Entonces** el panel me indica que el cliente ya está viendo esa advertencia
**Y** eso lo pone al principio de la lista

## Notas

Cubre **RF-8.8** y se conecta con **RF-8.14.4**.

**La bandeja es el instrumento de O5.** El objetivo pide 90% de perfiles publicados con disponibilidad actualizada en los últimos 30 días; la bandeja es exactamente la lista de los que lo incumplen. Sin ella, el objetivo se mide pero no se gestiona.

**El edge case ordena por daño, no por antigüedad.** Un perfil que ya está mostrando «por confirmar» a los clientes cuesta credibilidad ahora; uno que lleva 31 días pero con fecha futura vigente, todavía no.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · O5 · relacionada con HU-132 y HU-134

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ los 30 días vienen del PRD, el orden de la lista es negociable |
| V | Valiosa | ✓ convierte O5 en trabajo accionable |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
