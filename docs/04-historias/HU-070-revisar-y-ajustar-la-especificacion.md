---
id: HU-070
titulo: "Revisar y ajustar la especificación de lo que necesito"
epica: EP-009
prioridad: alta
complejidad: L
estado: draft
fase: fase-2-rediseno
prd_version: 2.0
---

# HU-070 — Revisar y ajustar la especificación de lo que necesito

**Como** líder de proyecto que va a pedir un equipo,
**quiero** ver y editar de forma continua una especificación de lo que busco: familia de rol, capacidades, seniority, condiciones y contexto del proyecto,
**para** que la solicitud que llegue a Trycore describa mi necesidad y no solo los perfiles que alcancé a ver.

## Criterios de aceptación

### Happy path — edición continua

**Dado** que hay un Perfil Objetivo generado a partir de mi instrucción,
**cuando** edito cualquiera de sus campos,
**Entonces** los resultados se recalculan sin que yo confirme en un paso aparte
**Y** el cambio queda reflejado de inmediato en la especificación

### Happy path — la especificación viaja con la solicitud

**Dado** que tengo un Perfil Objetivo y un equipo armado,
**cuando** envío la solicitud,
**Entonces** la especificación completa acompaña a la solicitud
**Y** Talento Humano recibe lo que pedí y no solo a quién seleccioné

### Error — especificación incompleta al solicitar

**Dado** que el Perfil Objetivo no tiene seniority ni condiciones de trabajo,
**cuando** intento enviar la solicitud,
**Entonces** el portal señala qué falta antes de enviar
**Y** puedo enviar de todos modos si lo decido, y esa omisión queda registrada

### Edge case — el usuario nunca abre el Perfil Objetivo

**Dado** que armé mi equipo directamente desde los resultados,
**cuando** envío la solicitud,
**Entonces** la especificación inferida de mi instrucción viaja igual
**Y** queda marcada como no revisada por el cliente


## Notas

Cubre RF-13.1 y RF-13.3. El último escenario alimenta la prueba de calidad de las primeras veinte requisiciones.



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
