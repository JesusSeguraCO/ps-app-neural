---
id: HU-114
titulo: "Generar el enlace de cada contacto sin construirlo a mano"
epica: EP-011
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-114 — Generar el enlace de cada contacto sin construirlo a mano

**Como** responsable de la distribución,
**quiero** que el enlace de cada destinatario se genere solo desde el envío,
**para** no equivocarme copiando parámetros para veinte cuentas.

## Criterios de aceptación

### Happy path

**Dado** que preparo el envío,
**cuando** se generan los enlaces,
**Entonces** cada contacto recibe un enlace propio con su cuenta y su selección
**Y** ninguno se construye a mano

### Error — contacto sin cuenta asociada

**Dado** que un destinatario no está asociado a ninguna cuenta,
**cuando** se prepara el envío,
**Entonces** ese destinatario se excluye y se reporta
**Y** no se envía un enlace sin contexto

### Edge case — vigencia

**Dado** que el enlace se genera,
**cuando** se define su expiración,
**Entonces** la vigencia va atada al ciclo del envío
**Y** un enlace de un boletín anterior ya no abre inventario


## Notas

Cubre RF-1.6 y RF-18.2.

## Trazabilidad

Épica madre: **EP-011** · PRD v4.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |
