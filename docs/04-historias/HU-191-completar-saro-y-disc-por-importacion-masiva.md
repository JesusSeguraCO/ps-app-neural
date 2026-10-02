---
id: HU-191
titulo: "Completar SARO y DISC por importación masiva"
epica: EP-003
prioridad: alta
complejidad: M
estado: lista
fase: panel-crud
prd_version: 4.18
spec: docs/10-specs/importacion-masiva.md
depende_de: [HU-176, HU-177, HU-086, HU-088, HU-141]
---

# HU-191 — Completar SARO y DISC por importación masiva

**Como** administradora de inventario de Talento Humano,
**quiero** traer en la hoja de importación el alcance y la fecha de la verificación SARO y la fecha de la evaluación DISC de muchos perfiles a la vez, y encontrar esas columnas en la plantilla y en la exportación del banco,
**para** completar de una sola vez los perfiles que el panel marca como incompletos, sin abrirlos uno por uno.

## Criterios de aceptación

### Happy path — completo los publicados incompletos con una hoja

**Dado** que tres perfiles publicados están marcados «Incompleto: falta la verificación SARO» y el catálogo de alcances SARO tiene «Antecedentes judiciales, disciplinarios y fiscales»
**Y** que pegué una hoja con el código de esos tres perfiles, ese alcance, la fecha de la verificación SARO y la fecha de la evaluación DISC de cada uno
**Cuando** confirmo la importación tras la vista previa
**Entonces** los tres perfiles quedan con sus tres datos registrados y siguen en estado *publicado*
**Y** dejan de aparecer marcados como incompletos en el listado
**Y** la ficha de cada uno muestra en el portal la verificación SARO con ese alcance y su mes, y la evaluación DISC con su mes
**Y** el historial de cada perfil registra el cambio como hecho por importación, con quién la confirmó

### Happy path — la exportación trae las tres columnas y vuelve sin cambios

**Dado** que el banco tiene un perfil con la verificación SARO y la fecha DISC registradas,
**cuando** exporto el banco en hoja de cálculo,
**Entonces** la exportación trae las columnas de alcance SARO, fecha SARO y fecha DISC, con el alcance escrito tal como está en el catálogo
**Y** al pegar esa exportación sin tocarla, la vista previa pone el perfil en «sin cambios»

### Happy path — la plantilla de muestra trae las tres columnas

**Dado** que el catálogo de alcances SARO tiene al menos un alcance activo,
**cuando** descargo la plantilla de muestra de la importación,
**Entonces** la plantilla trae las columnas de alcance SARO, fecha SARO y fecha DISC, cada una con un encabezado autoexplicativo y un valor de ejemplo
**Y** el valor de ejemplo del alcance es uno activo del catálogo, escrito tal como está registrado
**Y** al pegar la fila de ejemplo de la plantilla, la vista previa no la marca con error en esas tres columnas

### Error — un valor de SARO o DISC fuera de regla

**Esquema del escenario:** la fila con un valor inválido va al grupo con error y no se aplica
**Dado** que hoy es 2 de octubre de 2026 y pegué una hoja en la que una fila trae <valor>
**Cuando** el sistema termina de procesar la hoja
**Entonces** esa fila aparece en el grupo con error, con el motivo «<motivo>» y el valor exacto, sin aplicarse
**Y** ese valor no se ofrece como valor nuevo en la taxonomía
**Y** las demás filas válidas siguen en la vista previa

**Ejemplos:**

| valor | motivo |
|---|---|
| alcance SARO «Antecedentes penales», que no existe en el catálogo | el alcance SARO no está en el catálogo |
| fecha SARO 15/11/2026 | la fecha de una verificación no puede ser posterior a hoy |
| fecha DISC «abril» | la fecha DISC no se reconoce como fecha |

### Edge case — vaciar una validación de un perfil publicado

**Dado** que un perfil publicado tiene registrada la verificación SARO y la fecha DISC
**Y** que pegué una hoja cuya fila de ese perfil trae `[vaciar]` en la fecha DISC
**Cuando** el sistema termina de procesar la hoja
**Entonces** esa fila aparece en el grupo con error, con el motivo «no se puede vaciar una validación de entrada de un perfil publicado; pásalo a borrador desde el editor»
**Y** el perfil conserva su fecha DISC y sigue publicado

## Notas

Cubre **RF-8.15** (importación masiva: RF-8.15.1, RF-8.15.5 vista previa, RF-8.15.9 plantilla y exportación) para los tres campos que **B.7** añadió al perfil y que **B.6** exige para publicar. Sigue la especificación `docs/10-specs/importacion-masiva.md`: fusión, no reemplazo (§5); celda vacía no toca, `[vaciar]` borra (§5.1); **la importación no publica** (RF-8.15.7): los perfiles nuevos llegan en borrador aunque traigan los tres datos.

**Nace el 2026-10-02 por D81** (sponsor, segunda ronda), que responde la pregunta abierta de HU-176: la importación masiva y su plantilla **sí** llevan las columnas SARO alcance (validado contra el catálogo de HU-177), SARO fecha y DISC fecha. Meterlo en HU-176 la sacaba de M (captura en el editor + importación + plantilla + exportación son dos superficies): por eso es **historia propia**, en el **sub-slice inicial de EP-003** (D60), detrás de HU-177 y HU-176. **Partición, no recorte.**

**Por qué importa más de lo que parece.** D62 deja visibles los perfiles ya publicados sin SARO ni DISC, marcados «incompleto» (HU-178). Completar decenas de perfiles uno por uno es lo que haría que la marca se quedara meses; esta historia es la vía rápida para cerrar el riesgo que HU-159 y D80 vinculan al encabezado del estándar (la afirmación «ninguno» solo aparece con 0 incompletos).

**El alcance SARO no es taxonomía abierta.** A diferencia de una tecnología o un rol, que la importación acepta como «valor nuevo en la taxonomía» (HU-086), el alcance sale de un **catálogo cerrado** (D61): un valor desconocido es error de fila, no propuesta. La comparación con el catálogo ignora mayúsculas y acentos, como el control de duplicados de HU-177, y guarda la forma registrada. Un alcance **desactivado** en el catálogo (HU-177) tampoco se acepta para perfiles que no lo tenían.

**Vaciar es error, no pregunta (propuesta del modelo, negociable).** En el editor, dejar un publicado sin un dato exigido pregunta «¿descarto o paso a borrador?» (HU-126). En una importación de muchas filas esa pregunta no tiene dónde hacerse, y la importación no cambia estados; por eso la fila va a error y el motivo dice qué hacer. Vaciar en un borrador sí se aplica.

**La regla de fecha no futura** es la misma de HU-176 (propuesta del modelo, negociable). El formato de fecha aceptado es el de la spec para las demás fechas del perfil.

**Validación 2026-10-02 (validador independiente).** Reordenación sin cambio de alcance: la plantilla de muestra sale a **su propio escenario** (antes compartía uno con la exportación) y los dos errores (alcance fuera del catálogo; fecha futura o ilegible) se **funden en un esquema** de tres filas. Siguen cinco escenarios. El escenario de la plantilla añade que su valor de ejemplo del alcance sea uno activo del catálogo, para que la fila de ejemplo no nazca con error.

## Trazabilidad

Épica madre: **EP-003** (sub-slice inicial, D60) · PRD v4.18 · RF-8.15 (8.15.1, 8.15.5, 8.15.7, 8.15.9) · B.6 · B.7 · D60 · D61 · D62 · D81 (sponsor, 2026-10-02) · validación 2026-10-02 · spec `docs/10-specs/importacion-masiva.md` · toca la importación, la plantilla y la exportación de **EP-006, que sigue cerrada** · depende de HU-176 (los tres campos y su guarda), HU-177 (catálogo de alcances), HU-086 y HU-141 (vista previa y confirmación) y HU-088 (plantilla y exportación) · relacionada con HU-178 (la marca «incompleto» se retira) y HU-159 (encabezado del estándar, D80)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: necesita los campos de HU-176 y el catálogo de HU-177 del mismo sub-slice; el importador, la plantilla y la exportación ya existen (EP-006) |
| N | Negociable | ✓ son fijos las tres columnas, que el alcance se valide contra el catálogo (D81) y que la importación no publique; vaciar como error, la fecha no futura y los textos de motivo son negociables |
| V | Valiosa | ✓ convierte en una hoja el trabajo de completar todos los publicados incompletos, que es lo que permite que el encabezado del estándar vuelva a afirmar «ninguno» (D80) |
| E | Estimable | ✓ M: tres columnas en el modelo de importación, validación contra el catálogo y de fecha, regla de no vaciar en publicados, y su paso a la plantilla, la exportación y la ida y vuelta |
| S | Pequeña | ✓ M: una capacidad (traer y llevar SARO y DISC por hoja) en cinco escenarios: importar, exportar, plantilla, un esquema de errores con tres filas y vaciar |
| T | Testeable | ✓ hojas fijadas con alcances del catálogo y fuera de él, fechas futuras e ilegibles, `[vaciar]` en un publicado, la exportación reimportada y la plantilla descargada dan vista previa, errores por fila, marcas y fichas observables |
