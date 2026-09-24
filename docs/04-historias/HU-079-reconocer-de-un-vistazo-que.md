---
id: HU-079
titulo: "Reconocer de un vistazo qué ha logrado un perfil"
epica: EP-003
prioridad: n/a
complejidad: M
estado: descartada
fase: fase-2-rediseno
prd_version: 2.0
---

# HU-079 — Reconocer de un vistazo qué ha logrado un perfil

**Como** líder de área comparando varios perfiles en la lista de resultados,
**quiero** leer primero un logro concreto y cuantificado de cada perfil, antes que su cargo o su lista de tecnologías,
**para** juzgar capacidad real en segundos en lugar de leer currículums.

## Criterios de aceptación

### Happy path — logro como encabezado

**Dado** que un perfil tiene al menos un logro cuantificado,
**cuando** veo su tarjeta en los resultados,
**Entonces** el logro aparece como el elemento de mayor jerarquía visual
**Y** el cargo y las tecnologías quedan como información de apoyo

### Error — perfil sin logro cuantificado

**Dado** que un perfil no tiene logro cuantificado registrado,
**cuando** veo su tarjeta,
**Entonces** la tarjeta usa un encabezado alterno consistente
**Y** no queda un espacio vacío ni se ve como una tarjeta incompleta

### Edge case — logro no comparable con la búsqueda

**Dado** que el logro del perfil pertenece a un sector distinto al que pedí,
**cuando** veo su tarjeta,
**Entonces** el logro se muestra con su sector explícito
**Y** no se presenta como si respondiera a mi necesidad


## Notas

Cubre RF-14.1.

**DESCARTADA el 2026-09-14 por cierre de D-15.** El logro cuantificado no existe en el banco entregado por Talento Humano; extraerlo tiene costo operativo recurrente y es autoreportado por naturaleza, incompatible con la jerarquía verificado/autoreportado del producto. La sustituye **HU-081**, que usa las tres competencias del Sello Personal como elemento diferenciador de la tarjeta. Se conserva el archivo por trazabilidad: la decisión de descarte es más útil que su ausencia.

## Trazabilidad

Épica madre: **EP-003** · PRD v2.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |
