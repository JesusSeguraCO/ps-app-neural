---
id: HU-088
titulo: "Descargar una plantilla o el banco para editarlo y devolverlo"
epica: EP-006
prioridad: media
complejidad: S
estado: prototipado
fase: fase-2-rediseno
prd_version: 4.7
spec: docs/10-specs/importacion-masiva.md
---

# HU-088 — Descargar una plantilla o el banco para editarlo y devolverlo

**Como** administradora del banco de talento,
**quiero** descargar los perfiles actuales en el mismo formato que acepta la importación,
**para** editarlos donde me resulta cómodo y devolverlos sin pelear con el formato.

## Criterios de aceptación

### Happy path — exportar y reimportar sin cambios

**Dado** que exporto el banco,
**cuando** vuelvo a importar el archivo sin tocarlo,
**Entonces** todas las filas caen en «sin cambios»
**Y** no se crea ni se modifica ningún perfil

### Happy path — plantilla de muestra

**Dado** que nunca he importado y no conozco el formato,
**cuando** descargo la plantilla de muestra,
**Entonces** obtengo un archivo con las columnas y **tres ejemplos**: actualizar un campo, crear un perfil nuevo y archivar uno
**Y** puedo editarla y pegarla sin haber leído ninguna documentación

### Error — el navegador bloquea la descarga

**Dado** que estoy en una vista donde la descarga está bloqueada,
**cuando** pido la plantilla o el banco,
**Entonces** el contenido se muestra para copiarlo
**Y** puedo continuar sin que la descarga haya funcionado

### Happy path — dos formatos

**Dado** que voy a exportar,
**cuando** elijo el formato,
**Entonces** puedo descargar en hoja de cálculo o en JSON
**Y** ambos se pueden volver a importar sin conversión

### Edge case — campos internos

**Dado** que el banco tiene campos que no se publican, como el motivo de pausa o la fecha exacta de disponibilidad,
**cuando** exporto,
**Entonces** esos campos vienen incluidos y marcados como internos
**Y** al reimportarlos siguen sin publicarse

## Notas

**Por qué esta historia importa más de lo que parece.** La forma más confiable de obtener el formato correcto no es leer una documentación: es sacar lo que ya existe, editarlo y devolverlo. Sin exportación, la importación obliga a construir el archivo desde cero y a adivinar nombres de campos.

La prueba de ida y vuelta del primer criterio es además el mejor control de calidad de todo el mecanismo: si exportar e importar no es neutro, hay un error de formato en alguna parte.

Cubre RF-8.15.9.

## Trazabilidad

Épica madre: **EP-006** · PRD v3.5 · Habilita HU-086

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ tiene valor por sí sola como respaldo del inventario |
| N | Negociable | ✓ |
| V | Valiosa | ✓ |
| E | Estimable | ✓ |
| S | Pequeña | ✓ |
| T | Testeable | ✓ la prueba de ida y vuelta es objetiva |
