---
id: HU-113
titulo: "Armar la selección de perfiles de una cuenta"
epica: EP-011
prioridad: alta
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-113 — Armar la selección de perfiles de una cuenta

**Como** responsable de la distribución en Mercadeo,
**quiero** elegir desde el panel los perfiles que le voy a proponer a una cuenta, viendo su disponibilidad real,
**para** no proponer gente que ya no está disponible cuando el cliente abra el correo.

## Criterios de aceptación

### Happy path

**Dado** que voy a armar el envío de una cuenta,
**cuando** abro la selección,
**Entonces** veo el inventario publicado con su disponibilidad en ese momento
**Y** elijo perfiles y escribo la razón de la selección referida al proyecto de la cuenta

### Error — un perfil seleccionado cambia antes del envío

**Dado** que el perfil se pausa después de que lo elegí,
**cuando** voy a enviar,
**Entonces** el sistema me lo advierte antes de enviar
**Y** puedo reemplazarlo o quitarlo

### Edge case — la cuenta no tiene proyecto conocido

**Dado** que no sabemos en qué está trabajando,
**cuando** armo la selección,
**Entonces** no se inventa una razón
**Y** la selección se envía con un encuadre genérico o no se envía


## Notas

Cubre RF-18.1, RF-18.3 y RF-18.4. **La selección se arma contra el inventario del momento**, no contra una hoja aparte que se degrada entre que se arma y que el cliente abre.

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
