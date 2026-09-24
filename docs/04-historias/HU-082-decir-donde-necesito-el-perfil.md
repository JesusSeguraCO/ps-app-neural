---
id: HU-082
titulo: "Decir en qué país y ciudad necesito el perfil"
epica: EP-009
prioridad: alta
complejidad: S
estado: draft
fase: fase-2-rediseno
prd_version: 4.7
---

# HU-082 — Decir en qué país y ciudad necesito el perfil

**Como** líder de proyecto que necesita un perfil con presencia física en una sede,
**quiero** indicar el país y la ciudad donde se requiere el perfil,
**para** que Trycore no me proponga gente que no puede estar donde el proyecto la necesita.

## Criterios de aceptación

### Happy path — ubicación obligatoria en presencial e híbrido

**Dado** que en mi Perfil Objetivo elijo modalidad Presencial 100% o Híbrido,
**cuando** miro la especificación,
**Entonces** aparecen los campos de país y ciudad marcados como obligatorios
**Y** no se prellenan con la ubicación de mi cuenta, porque el proyecto puede estar en otra sede
**Y** el dato viaja con la solicitud y con el registro de demanda

### Error — solicitar presencial sin ubicación

**Dado** que mi modalidad es Presencial 100% y no indiqué país,
**cuando** intento enviar la solicitud,
**Entonces** el portal me pide completar la ubicación antes de enviar
**Y** conserva todo lo demás que ya había especificado

### Edge case — modalidad remota

**Dado** que mi modalidad es Remoto,
**cuando** reviso el Perfil Objetivo,
**Entonces** los campos de país y ciudad siguen disponibles pero son opcionales
**Y** su ausencia no impide enviar la solicitud

### Edge case — precisión del emparejamiento

**Dado** que indiqué una ciudad para una necesidad presencial,
**cuando** veo los resultados,
**Entonces** veo la ciudad de cada profesional junto a su país
**Y** el portal me indica que la logística concreta se cierra en la sesión de alineación

### Edge case — necesidad remota

**Dado** que declaré la modalidad como Remoto,
**cuando** veo los resultados,
**Entonces** veo el país de cada profesional y no su ciudad
**Y** el portal no me pide una ubicación que no decide nada

## Notas

Distingue dos datos que no son el mismo: la **ubicación de la necesidad** la aporta el cliente y no tiene costo operativo; la **ubicación del profesional** es dato del banco: tras D-18 se publica el país y la ciudad se carga sin publicarse.

El último criterio es la parte importante. Mientras D-18 no se resuelva, el portal captura la necesidad pero no puede emparejarla, y decirlo es preferible a simular un filtro que no funciona. Es el mismo principio que gobierna RF-14.0.

La concentración geográfica de la demanda presencial es además insumo de decisión de huella: dónde conviene tener talento y dónde no.

Cubre RF-13.5.

**Desbloqueada el 2026-09-16 (D-18 cerrada).** Se publica el país del profesional; la ciudad se carga y queda para Delivery, que la cruza en la sesión de alineación. El país solo se ofrece como filtro cuando el banco tiene más de un país publicado.

## Trazabilidad

Épica madre: **EP-009** · PRD v2.2

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ no depende de otra historia de la Fase 2 |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | ✓ campos simples sobre una especificación existente |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |
