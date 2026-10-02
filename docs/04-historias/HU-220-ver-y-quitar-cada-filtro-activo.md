---
id: HU-220
titulo: "Ver cada filtro activo como una etiqueta y quitarlo de un toque"
epica: EP-002
prioridad: alta
complejidad: S
estado: lista
fase: refinamiento-y-descubrimiento
prd_version: 4.18
depende_de: [HU-219]
---

# HU-220 — Ver cada filtro activo como una etiqueta y quitarlo de un toque

**Como** líder de área que combinó varios filtros en el banco,
**quiero** ver cada filtro activo como una etiqueta sobre los resultados y quitarlo de un toque,
**para** saber en todo momento si estoy ampliando o cerrando la búsqueda y deshacer un filtro sin ir a buscarlo al panel.

## Criterios de aceptación

### Happy path — quitar un filtro desde su etiqueta

**Dado** que tengo marcados «Desarrollador backend» en Rol y «Disponible ahora» en Disponibilidad, y veo 4 perfiles,
**cuando** toco quitar en la etiqueta «Disponibilidad: Disponible ahora»,
**Entonces** la etiqueta desaparece y veo los 9 perfiles backend
**Y** la opción «Disponible ahora» queda desmarcada en el panel de facetas

### Happy path — quitar todos los filtros

**Dado** que tengo tres filtros activos de tres facetas,
**cuando** toco «Quitar todos los filtros»,
**Entonces** veo «Todo el banco» con sus 23 perfiles publicados
**Y** no queda ninguna etiqueta ni ninguna opción marcada

### Error — un valor activo ya no tiene perfiles publicados

**Dado** que tengo marcadas las tecnologías «Java» y «Cobol» y hoy ningún perfil publicado declara Cobol,
**cuando** miro las etiquetas,
**Entonces** la etiqueta «Tecnología: Cobol» dice «sin perfiles hoy» y se puede quitar como las demás
**Y** los resultados siguen mostrando los perfiles con Java, sin ocultar la etiqueta

### Edge case — cada etiqueta nombra su faceta y la combinación dice cuántos deja

**Dado** que tengo marcadas «Java» y «Kotlin» en Tecnología y «Senior» en Seniority,
**cuando** miro la barra de etiquetas,
**Entonces** veo una etiqueta por valor, con el nombre de su faceta: «Tecnología: Java», «Tecnología: Kotlin» y «Seniority: Senior»
**Y** junto a las etiquetas veo cuántos perfiles deja la combinación

### Edge case — sin filtros no hay barra, y se quita también con el teclado

**Esquema del escenario:** la barra solo existe cuando hay algo que quitar
**Dado** que tengo <filtros> en «Todo el banco»,
**cuando** <accion>,
**Entonces** <resultado>

**Ejemplos:**

| filtros | accion | resultado |
|---|---|---|
| ningún filtro activo | miro los resultados | no veo barra de etiquetas vacía ni el botón «Quitar todos los filtros» |
| dos filtros activos y el foco del teclado en la primera etiqueta | pulso Enter | se quita ese filtro y el foco pasa a la etiqueta siguiente |

## Notas

Cubre la segunda mitad de **RF-2.4** (cada filtro activo como etiqueta removible, «de modo que el usuario siempre sabe si está ampliando o cerrando la búsqueda»). El filtrado y los contadores son de **HU-219**.

**Decisiones elegidas por el modelo por delegación del sponsor:**
- **Una etiqueta por valor**, no una por faceta: quitar «Kotlin» no debe obligar a quitar también «Java».
- Un valor marcado que hoy no tiene perfiles **no se oculta ni se borra solo**: se marca «sin perfiles hoy» y el cliente decide. Borrarlo en silencio cambiaría la búsqueda que el cliente armó (o la que le compartieron, HU-221) sin decírselo. Mismo principio que RF-19.2: nunca omitir en silencio.
- «Quitar todos los filtros» quita **solo los filtros**. Si hay una instrucción activa, la conserva (HU-074).
- Accesibilidad (§8.2): las etiquetas se quitan con teclado y el foco no se pierde.

**Superficie compartida:** la misma barra mostrará los criterios de la instrucción como un grupo aparte cuando EP-009 exista (HU-074, HU-068). Esta historia construye la barra de los filtros; no presupone la instrucción.

## Trazabilidad

Épica madre: **EP-002** · PRD v4.18 · RF-2.4 (etiquetas removibles) · RF-19.2 (principio de no omitir en silencio) · §8.2 · depende de HU-219 · relacionada con HU-074, HU-221 y HU-223

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: dibuja los filtros que marca HU-219, de la misma épica y construida antes |
| N | Negociable | ✓ fija una etiqueta por valor, que nada se borra en silencio y que se quita con un toque o con el teclado; forma y textos son negociables |
| V | Valiosa | ✓ el cliente ve en todo momento qué está acotando y lo deshace sin buscar |
| E | Estimable | ✓ S: una barra sobre el estado de filtros que ya existe, con un estado «sin perfiles hoy» calculado con el mismo conteo de HU-219 |
| S | Pequeña | ✓ S: cinco escenarios de una sola superficie |
| T | Testeable | ✓ banco sembrado con conteos conocidos; quitar uno, quitar todos, un valor sin perfiles y la navegación por teclado son observables en e2e |
