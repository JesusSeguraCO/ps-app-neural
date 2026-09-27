---
id: HU-113
titulo: "Armar la selección de perfiles de una cuenta"
epica: EP-011
prioridad: alta
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.14
---

# HU-113 — Armar la selección de perfiles de una cuenta

> **Decisión de negocio 2026-09-27 (sponsor):** el boletín se confecciona y envía desde Gmail o HubSpot; el portal entrega la selección curada, el enlace de cada destinatario y el bloque de contenido para copiar (PRD v4.14, RF-18).

**Como** responsable de la distribución en Mercadeo o Talento Humano,
**quiero** elegir desde el panel los perfiles que le voy a proponer a una cuenta, viendo su disponibilidad real,
**para** no proponer gente que ya no está disponible cuando el cliente abra el correo.

## Criterios de aceptación

### Happy path

**Dado** que preparo la edición curada de una cuenta,
**cuando** abro la selección,
**Entonces** veo el inventario publicado con su disponibilidad en ese momento
**Y** elijo perfiles y escribo la razón de la selección referida al proyecto de la cuenta

### Error — un perfil seleccionado cambia antes de generar el contenido

**Dado** que un perfil se pausa o deja de estar publicado después de que lo elegí,
**cuando** voy a generar los enlaces y el bloque para copiar,
**Entonces** el panel me lo advierte antes de generarlos
**Y** puedo reemplazarlo o quitarlo

### Edge case — la cuenta no tiene proyecto conocido

**Dado** que no sabemos en qué está trabajando la cuenta,
**cuando** armo la selección,
**Entonces** el panel no inventa una razón
**Y** la edición queda en borrador hasta que el ejecutivo aporte el contexto o yo elija de forma explícita un encuadre genérico

### Edge case — perfil ya propuesto sin reacción

**Dado** que un perfil ya se propuso a esta cuenta en una edición anterior y nadie entró a verlo,
**cuando** lo vuelvo a elegir,
**Entonces** el panel me avisa que se repite sin reacción
**Y** puedo mantenerlo con conocimiento o cambiarlo

## Notas

Cubre RF-18.1, RF-18.3 y RF-18.4. **La selección se arma contra el inventario del momento**, no contra una hoja aparte que se degrada entre que se arma y que el cliente abre. El cuarto escenario viene del riesgo «la selección se repite entre envíos» de la spec; «sin reacción» se mide por entradas al portal (RF-18.6), porque la apertura no la mide el portal.

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
