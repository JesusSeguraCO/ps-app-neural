---
id: HU-065
titulo: "Buscar escribiendo lo que necesito en mis propias palabras"
epica: EP-009
prioridad: alta
complejidad: M
estado: draft
fase: fase-2-rediseno
prd_version: 2.0
---

# HU-065 — Buscar escribiendo lo que necesito en mis propias palabras

**Como** líder de área en una cuenta cliente de People Service, que busca un perfil dos o tres veces al año,
**quiero** escribir en un campo abierto lo que necesito, con mis propias palabras,
**para** encontrar perfiles sin tener que aprender antes cómo nombra Trycore los roles y las tecnologías.

## Criterios de aceptación

### Happy path — instrucción reconocida

**Dado** que estoy en el portal con el banco publicado,
**cuando** escribo «necesito un ingeniero de aplicaciones móviles para banca» y envío,
**Entonces** veo los perfiles cuyo rol y tecnologías corresponden a esa instrucción
**Y** veo, antes de los resultados, la lectura que el portal hizo de mi instrucción
**Y** el tiempo entre el envío y el primer resultado visible queda registrado

### Error — el servicio de interpretación no responde

**Dado** que el servicio de interpretación no está disponible,
**cuando** envío una instrucción,
**Entonces** obtengo resultados igualmente, resueltos con el léxico controlado
**Y** el portal me indica que la lectura fue aproximada
**Y** no veo un error técnico ni una pantalla en blanco

### Edge case — instrucción sin ningún término reconocible

**Dado** que escribo sobre una especialidad que el banco no maneja,
**cuando** envío «experto en blockchain»,
**Entonces** no veo resultados forzados por coincidencia parcial
**Y** veo el camino del cero de EP-010
**Y** la especificación queda registrada como demanda no cubierta


## Notas

Cubre RF-2.6, RF-12.3 y RF-16.1. El registro de tiempo del primer criterio es el insumo de la prueba de falsación de RF-13.1.



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
