---
id: HU-076
titulo: "Ver alternativas solo cuando de verdad se parecen"
epica: EP-010
prioridad: alta
complejidad: M
estado: draft
fase: fase-2-rediseno
prd_version: 2.0
---

# HU-076 — Ver alternativas solo cuando de verdad se parecen

**Como** líder de proyecto que no encontró lo que buscaba,
**quiero** que el portal me muestre perfiles cercanos únicamente si realmente lo son,
**para** no perder la confianza en el banco por culpa de sugerencias que no tienen que ver con lo que pedí.

## Criterios de aceptación

### Happy path — cercanos por encima del umbral

**Dado** que mi búsqueda no tiene coincidencias exactas y hay perfiles que fallan exactamente un criterio,
**cuando** se muestra la pantalla de cero,
**Entonces** veo esos perfiles bajo un encabezado que los identifica como aproximaciones
**Y** veo en qué se parecen y en qué no a lo que pedí

### Error — ningún perfil supera el umbral

**Dado** que no hay perfiles suficientemente cercanos,
**cuando** se muestra la pantalla de cero,
**Entonces** no se muestra ninguna sección de aproximaciones
**Y** la pantalla lleva directamente a la solicitud dirigida

### Edge case — muchos perfiles apenas por encima del umbral

**Dado** que varios perfiles superan el umbral por poco,
**cuando** se muestran las aproximaciones,
**Entonces** se limita la cantidad mostrada
**Y** se ordenan por cercanía real a la especificación


## Notas

Cubre RF-14.3.

**Desbloqueada el 2026-09-15 (D-14 cerrada).** El umbral deja de ser numérico: «lo más cercano» son los perfiles que fallan exactamente un criterio, y la tarjeta dice cuál. Es verificable por el cliente y explicable por el comercial, cosa que un número calibrado nunca sería.

## Trazabilidad

Épica madre: **EP-010** · PRD v2.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |
