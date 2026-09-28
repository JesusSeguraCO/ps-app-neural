---
id: HU-114
titulo: "Generar el enlace de cada destinatario sin construirlo a mano"
epica: EP-011
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.14
---

# HU-114 — Generar el enlace de cada destinatario sin construirlo a mano

> **Decisión de negocio 2026-09-27 (sponsor):** el boletín se confecciona y envía desde Gmail o HubSpot; el portal entrega la selección curada, el enlace de cada destinatario y el bloque de contenido para copiar (PRD v4.14, RF-18).

**Como** responsable de la distribución,
**quiero** que el enlace de cada destinatario se genere desde la edición curada en el panel,
**para** no equivocarme copiando parámetros para veinte cuentas y que cada entrada quede atribuida a quien la hizo.

## Criterios de aceptación

### Happy path

**Dado** que la selección de la cuenta está lista y tiene destinatarios invitados,
**cuando** genero los enlaces,
**Entonces** cada destinatario recibe un enlace propio ligado a su cuenta, a su correo invitado y a esta edición
**Y** ninguno se construye a mano

### Error — destinatario sin cuenta asociada

**Dado** que un destinatario no está asociado a ninguna cuenta,
**cuando** genero los enlaces,
**Entonces** ese destinatario se excluye y se reporta en pantalla con el motivo
**Y** no se genera un enlace sin contexto

### Edge case — perdí el enlace antes de pegarlo

**Dado** que cerré la pantalla antes de copiar el enlace de un destinatario,
**cuando** vuelvo a la edición,
**Entonces** el panel me dice que el enlace ya no se puede mostrar y me ofrece regenerarlo
**Y** al regenerarlo el enlace anterior de ese destinatario queda revocado y deja de abrir

### Edge case — vigencia

**Dado** que el enlace se genera,
**cuando** se define su expiración,
**Entonces** la vigencia va atada al ciclo de la edición
**Y** quien abre el enlace de una edición anterior encuentra la pantalla de renovación, no inventario ni un error

## Notas

Cubre RF-1.6, RF-18.2 y RF-18.2.1. El enlace es el token opaco por destinatario de ADR-0002: solo se guarda su huella, por eso se muestra al generarse y se regenera si se pierde. Una fuga de la base no entrega enlaces que abran.

## Trazabilidad

Épica madre: **EP-011** · PRD v4.14 · spec `docs/10-specs/correo-curado.md`

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |
