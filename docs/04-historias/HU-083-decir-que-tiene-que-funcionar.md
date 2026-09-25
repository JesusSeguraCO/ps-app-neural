---
id: HU-083
titulo: "Decir qué tiene que estar funcionando cuando el proyecto termine"
epica: EP-009
prioridad: alta
complejidad: M
estado: draft
fase: fase-2-rediseno
prd_version: 2.3
---

# HU-083 — Decir qué tiene que estar funcionando cuando el proyecto termine

**Como** líder de proyecto cuya meta no es contratar a alguien sino entregar algo,
**quiero** describir el resultado que mi proyecto tiene que alcanzar, antes que el rol que creo necesitar,
**para** que Trycore entienda mi problema y no solo mi pedido.

## Criterios de aceptación

### Happy path — el reto encabeza la especificación

**Dado** que estoy viendo mi Perfil Objetivo,
**cuando** lo abro,
**Entonces** el primer campo me pregunta qué tiene que estar funcionando al terminar el proyecto
**Y** aparece antes que la familia de rol
**Y** lo que escriba viaja con la solicitud y con el registro de demanda

### Happy path — el reto cambia la pantalla de cero

**Dado** que describí un reto y el banco no tiene el rol que pedí,
**cuando** llego a la pantalla sin coincidencias,
**Entonces** veo mi reto a la vista junto con los perfiles del banco que sí aportan a ese reto
**Y** la ausencia de un rol no se presenta como ausencia de respuesta

### Error — reto vacío

**Dado** que dejo el campo del reto sin diligenciar,
**cuando** envío la solicitud,
**Entonces** la solicitud se procesa con normalidad
**Y** queda registrada como especificación sin reto declarado

### Edge case — el cliente solo quiere un perfil

**Dado** que sé exactamente qué rol necesito y no quiero describir nada más,
**cuando** uso el portal,
**Entonces** puedo ignorar el campo del reto sin fricción adicional
**Y** el flujo hasta la solicitud no se alarga

## Notas

El campo es opcional por diseño. Quien busca un perfil concreto no debe pagar el costo de una pregunta que no necesita, y el argumento de venta del flujo es la velocidad.

Su valor mayor es aguas abajo: Delivery recibe el resultado esperado y no solo el rol pedido, que es exactamente lo que el proceso comercial de la línea dice querer diagnosticar antes de buscar a nadie.

Cubre RF-13.6.

## Trazabilidad

Épica madre: **EP-009** · PRD v2.3 · Habilita HU-084 y refuerza EP-010

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ funciona sin HU-084 |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | ✓ un campo sobre una especificación existente |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |
