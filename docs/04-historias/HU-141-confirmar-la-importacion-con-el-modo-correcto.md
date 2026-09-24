---
id: HU-141
titulo: "Confirmar la importación sabiendo qué campos toca"
epica: EP-006
prioridad: media
complejidad: M
estado: draft
fase: panel-crud
prd_version: 4.8
spec: docs/10-specs/importacion-masiva.md
---

# HU-141 — Confirmar la importación sabiendo qué campos toca

**Como** administradora del banco de talento,
**quiero** declarar si la importación crea, actualiza o ambas, y que solo toque los campos que traje,
**para** que un código mal escrito no cree perfiles fantasma ni una celda vacía borre un dato que no quería perder.

## Criterios de aceptación

### Happy path — el código manda

**Dado** que una fila trae un código que ya existe y otra un código que no,
**cuando** confirmo en modo crear y actualizar,
**Entonces** la primera actualiza el perfil existente
**Y** la segunda crea un perfil nuevo **en borrador**

### Error — el archivo intenta conceder consentimiento o publicar

**Dado** que alguna fila trae el consentimiento en verdadero o el estado en publicado,
**cuando** la proceso,
**Entonces** esos campos se rechazan y se avisa en la tarjeta
**Y** el resto de la fila se importa con normalidad
**Y** ningún perfil queda publicado por efecto de la importación

### Edge case — campo ausente frente a campo que quiero borrar

**Dado** que mi hoja tiene celdas vacías en columnas que no quiero cambiar,
**cuando** confirmo,
**Entonces** esos campos quedan intactos
**Y** solo se vacían los que marqué explícitamente con un nulo

### Edge case — modo solo actualizar con un código inexistente

**Dado** que elegí modo solo actualizar y una fila trae un código que no existe,
**cuando** confirmo,
**Entonces** esa fila se omite en lugar de crear un perfil
**Y** queda contada entre las omitidas con su motivo

## Notas

**Dividida de HU-086 el 2026-09-22.** Confirmar es el momento en que el banco cambia, y merece sus propios criterios de aceptación: los dos controles que evitan el daño clásico viven aquí, no en la vista previa.

**El control que evita el daño más común:** el modo de importación explícito. Sin él, un archivo destinado a actualizar disponibilidad crea perfiles fantasma por un código mal escrito.

**La regla que evita el bug clásico:** campo ausente y celda vacía no tocan nada; solo un nulo explícito vacía un campo. Sin esa distinción nadie puede vaciar un campo a propósito ni evitar vaciarlo por accidente.

**La prohibición de publicar no es administrable.** RF-8.16.1 la deja fuera de los catálogos paramétricos: si el consentimiento se pudiera otorgar pegando un archivo, el bloqueo de RF-8.4 se saltaría con un pegado.

Cubre **RF-8.15.2**, **RF-8.15.3**, **RF-8.15.4** y **RF-8.15.7**.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · depende de HU-086 · habilita HU-087 y HU-142

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-086 — sin vista previa no hay qué confirmar |
| N | Negociable | ✓ |
| V | Valiosa | ✓ es donde el banco cambia, y donde están las garantías |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ tras la división |
| T | Testeable | ✓ |
