---
id: HU-075
titulo: "Entender qué pedí cuando no hay nada que mostrar"
epica: EP-010
prioridad: alta
complejidad: M
estado: draft
fase: fase-2-rediseno
prd_version: 2.0
---

# HU-075 — Entender qué pedí cuando no hay nada que mostrar

**Como** líder de proyecto cuya búsqueda no arrojó coincidencias,
**quiero** ver mi especificación a la vista junto con la ausencia de resultados,
**para** saber que el portal entendió lo que necesito aunque hoy no lo tenga, y poder pedirlo.

## Criterios de aceptación

### Happy path — cero con especificación

**Dado** que mi búsqueda no tiene coincidencias,
**cuando** se muestra la pantalla de resultados,
**Entonces** veo mi Perfil Objetivo completo y editable
**Y** veo el plazo de 10 días hábiles para incorporar un perfil a medida
**Y** veo la acción para solicitarlo

### Error — especificación demasiado vaga para solicitar

**Dado** que llegué al cero con una especificación sin rol ni seniority,
**cuando** intento solicitar el perfil a medida,
**Entonces** el portal me pide completar los campos mínimos antes de enviar
**Y** conserva lo que ya escribí

### Edge case — el cero se produce por un filtro y no por el banco

**Dado** que tengo una instrucción con resultados y un filtro que los anula,
**cuando** llego al cero,
**Entonces** el portal distingue entre «el banco no lo tiene» y «tus filtros lo excluyeron»
**Y** en el segundo caso se ofrece quitar el filtro antes que solicitar un perfil nuevo


## Notas

Cubre RF-14.3. El último escenario evita el error más caro de esta pantalla: pedirle a Trycore que recluten a alguien que ya está en el banco.



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
