---
id: HU-141
titulo: "Confirmar la importación sabiendo qué campos toca"
epica: EP-006
prioridad: media
complejidad: M
estado: lista
fase: panel-crud
prd_version: 4.8
spec: docs/10-specs/importacion-masiva.md
depende_de: [HU-086]
---

# HU-141 — Confirmar la importación sabiendo qué campos toca

**Como** administradora de inventario de Talento Humano,
**quiero** declarar si la importación crea, actualiza o ambas, y que solo toque los campos que traje,
**para** que un código mal escrito no cree perfiles fantasma ni una celda vacía borre un dato que no quería perder.

## Criterios de aceptación

### Happy path — el código manda

**Dado** que una fila trae un código que ya existe y otra un código que no,
**cuando** confirmo la importación en modo crear y actualizar,
**Entonces** la primera actualiza el perfil existente
**Y** la segunda crea un perfil nuevo **en borrador**

### Error — el archivo intenta conceder consentimiento o publicar

**Dado** que alguna fila trae el consentimiento en verdadero o el estado en publicado,
**cuando** confirmo la importación,
**Entonces** esos campos se rechazan y se avisa en la tarjeta
**Y** el resto de la fila se importa con normalidad
**Y** ningún perfil queda publicado por efecto de la importación

### Edge case — campo ausente frente a nulo explícito

**Dado** que en la fila de un perfil existente falta la columna de un campo, otra columna trae la celda vacía y una tercera trae el nulo explícito (`[vaciar]`),
**cuando** confirmo la importación,
**Entonces** el campo de la columna ausente y el de la celda vacía quedan intactos
**Y** solo el campo marcado con el nulo explícito queda vacío

### Edge case — modo solo actualizar con un código inexistente

**Dado** que elegí modo solo actualizar y una fila trae un código que no existe,
**cuando** confirmo la importación,
**Entonces** esa fila se omite en lugar de crear un perfil
**Y** queda contada entre las omitidas con su motivo

## Notas

**Dividida de HU-086 el 2026-09-22.** Confirmar es el momento en que el banco cambia, y merece sus propios criterios de aceptación: los dos controles que evitan el daño clásico viven aquí, no en la vista previa.

**El control que evita el daño más común:** el modo de importación explícito. Sin él, un archivo destinado a actualizar disponibilidad crea perfiles fantasma por un código mal escrito.

**La regla que evita el bug clásico:** campo ausente y celda vacía no tocan nada; solo un nulo explícito vacía un campo (spec §5.1). Sin esa distinción nadie puede vaciar un campo a propósito ni evitar vaciarlo por accidente. El edge case pone los tres casos en la misma fila para que el contraste sea verificable en una sola corrida.

**La prohibición de publicar no es administrable.** RF-8.16.1 la deja fuera de los catálogos paramétricos: si el consentimiento se pudiera otorgar pegando un archivo, el bloqueo de RF-8.4 se saltaría con un pegado.

Cubre **RF-8.15.2**, **RF-8.15.3**, **RF-8.15.4** y **RF-8.15.7**.

**Revisión INVEST 2026-09-30:** rol unificado («administradora de inventario de Talento Humano»); verbo del When alineado a «confirmo la importación» en los cuatro escenarios; el edge ausente/vacío frente a nulo se reescribe para que los tres casos (ausente, vacío, nulo) convivan en el mismo Given y el nulo quede declarado como estado, no en el Then; se declara `depende_de: [HU-086]`.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · spec `docs/10-specs/importacion-masiva.md` §4.2 y §5.1 · depende de HU-086 · habilita HU-087, HU-137 y HU-142

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-086 (declarada): sin vista previa no hay qué confirmar |
| N | Negociable | ✓ los modos y la semántica ausente/vacío/nulo los fija la spec; los textos de aviso y la forma de la tarjeta son negociables |
| V | Valiosa | ✓ es donde el banco cambia, y donde están las garantías |
| E | Estimable | ✓ la spec define la tabla de modos (§4.2) y la semántica de fusión (§5.1) sin ambigüedad; falta la cifra del equipo |
| S | Pequeña | ✓ M tras la división de HU-086: solo el paso de confirmar |
| T | Testeable | ✓ un archivo de prueba con códigos existentes e inexistentes, consentimiento en verdadero, celda vacía y `[vaciar]` da un resultado por fila observable |
