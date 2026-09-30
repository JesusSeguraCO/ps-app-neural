---
id: HU-088
titulo: "Descargar una plantilla o el banco para editarlo y devolverlo"
epica: EP-006
prioridad: media
complejidad: S
estado: lista
fase: fase-2-rediseno
prd_version: 4.7
spec: docs/10-specs/importacion-masiva.md
---

# HU-088 — Descargar una plantilla o el banco para editarlo y devolverlo

**Como** administradora de inventario de Talento Humano,
**quiero** descargar los perfiles actuales en el mismo formato que acepta la importación,
**para** editarlos donde me resulta cómodo y devolverlos sin pelear con el formato.

## Criterios de aceptación

### Happy path — exportar el banco en el formato de importación

**Dado** que el banco tiene perfiles cargados,
**cuando** exporto el banco en hoja de cálculo,
**Entonces** obtengo una fila por perfil y una columna por campo del modelo, con los mismos encabezados que la plantilla de muestra
**Y** las listas vienen en una sola celda separadas por punto y coma

### Happy path — plantilla de muestra

**Dado** que nunca he importado y no conozco el formato,
**cuando** descargo la plantilla de muestra,
**Entonces** obtengo un archivo con las columnas y **tres ejemplos**: actualizar un campo, crear un perfil nuevo y archivar uno
**Y** cada columna trae un encabezado autoexplicativo y un valor de ejemplo

### Happy path — el mismo banco en JSON

**Dado** que el banco tiene perfiles cargados,
**cuando** exporto el banco en JSON,
**Entonces** obtengo los mismos perfiles y campos que en la hoja de cálculo
**Y** el archivo tiene la estructura que acepta la importación, sin conversión

### Error — el navegador bloquea la descarga

**Dado** que estoy en una vista incrustada donde el navegador bloquea las descargas,
**cuando** descargo la plantilla de muestra,
**Entonces** el contenido se muestra en un área de texto para copiarlo
**Y** puedo continuar sin que la descarga haya funcionado

### Edge case — campos internos

**Dado** que el banco tiene campos que no se publican, como el motivo de pausa o la fecha exacta de disponibilidad,
**cuando** exporto el banco,
**Entonces** esos campos vienen incluidos y marcados como internos
**Y** el archivo no incluye el registro de consentimiento

## Notas

**Por qué esta historia importa más de lo que parece.** La forma más confiable de obtener el formato correcto no es leer una documentación: es sacar lo que ya existe, editarlo y devolverlo. Sin exportación, la importación obliga a construir el archivo desde cero y a adivinar nombres de campos.

**Esta historia fija el formato; HU-086 lo consume** (D2, sponsor 2026-09-30: exportar primero). Por eso se construye antes que la importación. La prueba de ida y vuelta —exportar, reimportar sin tocar y que todo caiga en «sin cambios»— es el mejor control de calidad de todo el mecanismo, y vive en el segundo escenario de **HU-086**, que es donde existe el importador que la ejecuta.

**El respaldo del área de texto vale para los dos botones** (spec §6, paso 1: la funcionalidad no depende de que la descarga funcione). El escenario de error se ilustra con la plantilla; la exportación del banco se comporta igual.

**La exportación no es un respaldo del banco** (PRD §10.3): no lleva consentimientos, y la importación no puede concederlos (RF-8.15.7). Los campos internos siguen sin publicarse al volver porque la importación no publica.

Cubre RF-8.15.9 y el paso 1 de la spec (plantilla de muestra y exportación).

**Revisión INVEST 2026-09-30:** rol unificado; el escenario de error ya no dice «la plantilla o el banco» (una acción por escenario); el Entonces de la plantilla pasa a observable (encabezado autoexplicativo y valor de ejemplo); «dos formatos» se reescribe como exportar en JSON con estado en el Dado; la ida y vuelta pasa a HU-086 para que esta historia no dependa del importador (D2); el borde de campos internos deja de depender de reimportar; tabla INVEST razonada.

## Trazabilidad

Épica madre: **EP-006** · PRD v3.5 · habilita HU-086 (fija el formato que HU-086 consume, D2)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ no depende de ninguna otra historia de la épica; se construye primero porque fija el formato (D2), y tiene valor por sí sola como forma de sacar el inventario a una hoja |
| N | Negociable | ✓ fija qué columnas y ejemplos trae; el diseño de los botones y del área de texto queda abierto |
| V | Valiosa | ✓ quita la necesidad de adivinar nombres de campos y deja el formato de la importación definido antes de construirla |
| E | Estimable | ✓ S: serializar `inventario.perfiles` y sus relaciones de rol, tecnología y sector (tablas existentes desde la migración 0005) a CSV y JSON, una plantilla fija de tres filas y el área de texto de respaldo. Sin servicio externo |
| S | Pequeña | ✓ cinco escenarios de una sola capacidad (sacar el formato en dos versiones) |
| T | Testeable | ✓ encabezados, ejemplos y campos internos se comprueban leyendo el archivo; el bloqueo de descarga se simula en una vista incrustada |
