---
id: HU-068
titulo: "Ver cómo el portal entendió lo que pedí"
epica: EP-009
prioridad: alta
complejidad: S
estado: draft
fase: fase-2-rediseno
prd_version: 2.0
---

# HU-068 — Ver cómo el portal entendió lo que pedí

**Como** líder de área que acaba de escribir una instrucción,
**quiero** ver la lectura que el portal hizo de mi instrucción antes de mirar los resultados,
**para** saber si los resultados son raros porque el banco no tiene lo que busco o porque me entendieron mal.

## Criterios de aceptación

### Happy path — interpretación visible

**Dado** que envié una instrucción reconocida,
**cuando** se muestran los resultados,
**Entonces** veo el rol, las tecnologías, el sector y el seniority que el portal entendió
**Y** cada elemento entendido se muestra como una etiqueta identificable

### Edge case — interpretación de baja confianza

**Dado** que mi instrucción es ambigua,
**cuando** el portal la interpreta con confianza baja,
**Entonces** la lectura se muestra de forma destacada y no compacta
**Y** se me invita explícitamente a corregirla

### Edge case — interpretación evidente

**Dado** que escribí una instrucción inequívoca como «desarrollador Java senior»,
**cuando** se muestran los resultados,
**Entonces** la lectura se muestra en forma compacta para no agregar un paso de ruido


## Notas

Cubre RF-12.3. La variación por nivel de confianza es la resolución del argumento en contra registrado en el PRD.



## Trazabilidad

Épica madre: **EP-009** · PRD v2.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |
