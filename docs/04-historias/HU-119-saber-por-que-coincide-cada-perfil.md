---
id: HU-119
titulo: "Saber por qué coincide cada perfil y por qué no"
epica: EP-003
prioridad: alta
complejidad: S
estado: prototipado
fase: referencias-juicebox
prd_version: 4.1
---

# HU-119 — Saber por qué coincide cada perfil y por qué no

**Como** líder de área comparando varios perfiles,
**quiero** ver en cada tarjeta qué criterio cumple y cuál no, con el dato concreto,
**para** decidir sin abrir cada ficha ni fiarme de una puntuación que no puedo verificar.

## Criterios de aceptación

### Happy path — evidencia criterio por criterio

**Dado** que busqué con varios criterios,
**cuando** miro una tarjeta,
**Entonces** veo una línea por criterio con el dato que lo sustenta
**Y** las que cumple se distinguen de las que no

### Happy path — también lo que no cumple

**Dado** que un perfil no cumple uno de mis criterios,
**cuando** miro su tarjeta,
**Entonces** lo veo dicho explícitamente
**Y** puedo decidir si me importa

### Error — sin criterios activos

**Dado** que no he definido ningún criterio,
**cuando** miro las tarjetas,
**Entonces** no aparece ningún bloque de evidencia vacío

### Edge case — dato ausente en el perfil

**Dado** que un perfil no tiene registrado el dato de un criterio,
**cuando** se evalúa,
**Entonces** se muestra como no cumplido y no como cumplido por omisión
**Y** nunca se infiere ni se redacta una explicación

## Notas

Tomado de Juicebox, que muestra una línea de justificación por criterio (evidencia A).

**La diferencia es una restricción nuestra, no un olvido.** Las justificaciones de Juicebox las redacta un modelo sobre una persona real. Eso choca con RF-16.1: Trycore responde contractualmente por cada perfil publicado, y una afirmación inferida sobre alguien es un riesgo que no compensa. Nuestra evidencia sale de los datos, no de una redacción.

Mostrar también lo no cumplido es deliberado: un listado que solo enseña aciertos no ayuda a decidir, ayuda a vender.

Cubre RF-13.10.

## Trazabilidad

Épica madre: **EP-003** · PRD v4.1

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
