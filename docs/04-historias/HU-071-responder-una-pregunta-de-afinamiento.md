---
id: HU-071
titulo: "Responder una pregunta de afinamiento sin perder lo que ya veo"
epica: EP-009
prioridad: media
complejidad: M
estado: lista
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-065, HU-118]
---

# HU-071 — Responder una pregunta de afinamiento sin perder lo que ya veo

**Como** líder de área que está revisando resultados,
**quiero** responder a lo sumo dos preguntas cortas con opciones tocables mientras los resultados siguen en pantalla,
**para** afinar el orden de la búsqueda sin que el portal me detenga antes de mostrarme algo.

## Criterios de aceptación

### Happy path — la respuesta reordena sin filtrar

**Dado** que envié «desarrollador móvil para banca», veo 11 perfiles y junto a ellos la pregunta «¿Con qué tecnología?» con las opciones «Kotlin · 5», «Swift · 4» y «Flutter · 3»
**Cuando** toco «Swift»
**Entonces** siguen los 11 perfiles y los 4 que tienen Swift pasan primero
**Y** «Swift» queda como tecnología deseable en el Perfil Objetivo
**Y** la pregunta queda como «Respondida»

### Edge case — puedo ignorar la pregunta

**Dado** que veo la pregunta de afinamiento en el bloque «Afinar el orden · opcional» junto a los resultados
**Cuando** sumo un perfil a «Mi equipo» sin responderla
**Entonces** el perfil se suma con normalidad
**Y** la pregunta sigue en su bloque, sin cubrir ninguna tarjeta ni bloquear ninguna acción

### Error — hay más preguntas posibles que las permitidas

**Dado** que la interpretación dejó sin fijar tecnologías, seniority y modalidad, y las tres dividen el conjunto actual
**Cuando** envío la instrucción
**Entonces** veo 2 preguntas, no 3
**Y** veo el aviso «Queda 1 pregunta más», que indica que la tercera aparecerá al responder u ocultar una de las dos

### Edge case — una pregunta que no divide el conjunto no se hace

**Dado** que los 6 perfiles que cumplen mi búsqueda son todos Senior
**Cuando** envío la instrucción sin seniority
**Entonces** no aparece la pregunta de seniority
**Y** si ningún campo divide el conjunto, no aparece ninguna pregunta

### Edge case — ocultar las preguntas

**Dado** que veo dos preguntas de afinamiento
**Cuando** toco «Ocultar»
**Entonces** las preguntas desaparecen y los resultados no cambian
**Y** el bloque «Afinar el orden» ya no se muestra en esta búsqueda

## Notas

Cubre **RF-13.2** (preguntas de perfilamiento en paralelo, máximo dos, con opciones tocables, mientras los primeros resultados ya se ven; nunca como compuerta). Corrige la regla previa de «nunca preguntar antes de mostrar un resultado».

**Decisiones por delegación del sponsor (elegidas por el modelo):**
- **Qué se pregunta, sin modelo:** un catálogo fijo en código de preguntas por campo del Perfil Objetivo (tecnologías del rol, seniority, modalidad, sector), en ese orden. Solo se pregunta por un campo que la interpretación dejó sin fijar **y** cuyas opciones dividen el conjunto actual (al menos dos opciones con perfiles). Las opciones y sus conteos los calcula el motor (HU-209).
- **Responder añade un deseable**, nunca un obligatorio: la pregunta afina el orden y no puede llevar a un cero (RF-13.9.2).
- El prototipo redacta preguntas propias del rol («¿Para qué plataforma es la app?») y una de contexto del proyecto («¿El equipo trabajará sobre una app que ya existe?»). La redacción por rol es negociable sobre el mismo catálogo; una pregunta de contexto que no se traduce en un criterio no forma parte de RF-13.2 y no se incluye.

**Respuesta al «en contra» del PRD** (con resultados instantáneos la pregunta se lee como innecesaria): por eso vive en un bloque rotulado «opcional», no cubre resultados y se puede ocultar.

**Línea de release.** El mapa ubica esta historia fuera del MVP (solo vale cuando la interpretación acierta lo suficiente). Es ubicación, no recorte.

**Fuente de diseño:** `docs/05-prototipo/pantallas/resultados--afinamiento.html` (borrador).

## Trazabilidad

Épica madre: **EP-009** · PRD v4.18 · RF-13.2 · RF-13.9.2 · depende de HU-065 (intérprete) y HU-118 (deseables que ordenan), misma épica · relacionada con HU-209 (conteos)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas de la misma épica |
| N | Negociable | ✓ son fijos el máximo de dos, que nunca bloquea, que solo ordena y que no pregunta lo que no divide; redacción y posición se negocian |
| V | Valiosa | ✓ el cliente afina con un toque sin perder lo que ya ve |
| E | Estimable | ✓ M: catálogo fijo de preguntas, cálculo de qué campo divide el conjunto con el motor existente y el bloque en pantalla |
| S | Pequeña | ✓ M: cinco escenarios sobre un bloque |
| T | Testeable | ✓ e2e con banco sembrado: opciones y conteos exactos, orden tras responder, límite de dos y ausencia de preguntas que no dividen |
