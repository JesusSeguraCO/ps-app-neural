---
id: HU-089
titulo: "Crear valores de catálogo sin duplicar los que ya existen"
epica: EP-006
prioridad: alta
complejidad: M
estado: prototipado
fase: fase-2-rediseno
prd_version: 4.8
---

# HU-089 — Crear valores de catálogo sin duplicar los que ya existen

**Como** administradora del banco de talento,
**quiero** crear roles, tecnologías y sectores desde un catálogo que me avise si ya existe algo parecido,
**para** que el banco crezca sin llenarse de duplicados que rompan los filtros del cliente.

## Criterios de aceptación

### Happy path — rol nuevo con su familia

**Dado** que necesito publicar un Diseñador UX/UI Banking y ese rol no existe,
**cuando** lo creo en el catálogo,
**Entonces** el sistema me exige elegir una familia
**Y** si la familia no tiene modalidades de prueba, me advierte que ningún perfil de esa familia se podrá publicar hasta definirla
**Y** el rol queda disponible en el editor de perfiles

### Happy path — seleccionar en vez de escribir

**Dado** que estoy editando un perfil,
**cuando** voy a poner sus tecnologías,
**Entonces** las selecciono del catálogo, nunca las escribo libremente
**Y** si escribo algo que no existe, se me ofrece crearlo como una acción aparte

### Error — valor parecido a uno existente

**Dado** que el catálogo ya tiene «Figma» y yo escribo «Fgima»,
**cuando** voy a crearlo,
**Entonces** el sistema me muestra el parecido y me deja usarlo en un toque
**Y** si aun así lo creo, es una decisión mía y no un accidente

### Error — valor idéntico salvo mayúsculas

**Dado** que el catálogo ya tiene «Figma» y escribo «figma»,
**cuando** intento crearlo,
**Entonces** el sistema lo impide
**Y** me indica que ya existe

## Notas

**Dividida el 2026-09-22.** La historia original tenía **seis escenarios** y mezclaba cuatro capacidades: crear, detectar parecidos, desactivar y fusionar. Su propia tabla INVEST proponía el corte —*«selección en vez de texto libre primero, fusión de duplicados después»*—. La limpieza de la taxonomía es ahora **HU-143**.

**El problema que resuelve:** con texto libre, la taxonomía se construye por tecleo. Tres formas de escribir Figma son tres tecnologías distintas y contaminan los filtros del cliente de forma permanente.

**La dependencia que el panel encadena:** un rol exige familia, y la familia determina las modalidades de prueba disponibles. Crear un rol de una familia sin modalidades produce perfiles que no se pueden publicar, y eso hay que saberlo **al crear el rol**, no al intentar publicar.

**Lo que deliberadamente no se declara:** la relación entre rol y tecnologías. Emerge de los perfiles reales y el panel del cliente la calcula sola (RF-8.16.7). Declararla a mano sería trabajo doble que se desactualiza.

Cubre **RF-8.16.2**, **RF-8.16.3**, **RF-8.16.4** y **RF-8.16.8**.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · consumida por HU-125 · habilita HU-143

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ protege la calidad de los filtros, que es lo que el cliente usa |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ tras la división |
| T | Testeable | ✓ |
