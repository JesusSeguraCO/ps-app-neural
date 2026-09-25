---
id: HU-085
titulo: "Ajustar mi especificación con las opciones que el banco realmente tiene"
epica: EP-009
prioridad: alta
complejidad: M
estado: draft
fase: fase-2-rediseno
prd_version: 2.5
---

# HU-085 — Ajustar mi especificación con las opciones que el banco realmente tiene

**Como** líder de área que está afinando lo que necesita,
**quiero** ajustar cada campo del Perfil Objetivo eligiendo entre opciones coherentes con lo que ya seleccioné,
**para** no tener que adivinar cómo nombra Trycore las cosas ni descubrir al final que mi combinación no existe.

## Criterios de aceptación

### Happy path — la cascada acota las opciones

**Dado** que en el Perfil Objetivo elijo la familia de rol Desarrollador Frontend,
**cuando** abro el campo de tecnologías,
**Entonces** veo únicamente las tecnologías que existen en el banco para ese rol
**Y** cada una muestra cuántos perfiles la tienen
**Y** al elegir una, los demás campos recalculan sus opciones

### Happy path — necesidad que el banco no cubre

**Dado** que la tecnología que necesito no está entre las opciones,
**cuando** la añado manualmente,
**Entonces** queda marcada como no disponible en el banco
**Y** no se usa para filtrar resultados, porque no hay nada contra qué filtrar
**Y** viaja con mi solicitud y queda en el registro de demanda como necesidad no cubierta

### Error — combinación sin ningún perfil

**Dado** que fui acotando campos hasta que ningún perfil cumple,
**cuando** miro el panel,
**Entonces** veo que quedan cero perfiles antes de llegar a la pantalla de resultados
**Y** puedo soltar cualquiera de los criterios en un toque

### Edge case — cambio de familia de rol con tecnologías ya elegidas

**Dado** que tenía tecnologías seleccionadas y cambio la familia de rol,
**cuando** se recalculan las opciones,
**Entonces** mis selecciones anteriores siguen visibles y no se borran en silencio
**Y** las que ya no corresponden al nuevo rol quedan señaladas para que yo decida

## Notas

**La regla que impide que el panel se vuelva una jaula (RF-13.7.2):** el Perfil Objetivo describe lo que el cliente necesita, no lo que tenemos. Restringirlo al inventario destruiría el camino del cero y el registro de demanda, que es el activo de mayor valor del portal. Por eso la solución es de dos niveles y no de uno.

El texto libre en tecnologías —como estaba en la primera versión del Mid-Fi— produce datos que no se pueden filtrar, contar ni comparar, y le traslada al cliente el trabajo de adivinar nuestro vocabulario.

Cubre RF-13.7.

## Trazabilidad

Épica madre: **EP-009** · PRD v2.5

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ opera sobre el Perfil Objetivo ya existente |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |
