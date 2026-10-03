# Spec Delta

## ADDED Requirements

### Requirement: Columnas SARO y DISC en la importación, la plantilla y la exportación
El formato único de importación SHALL incluir las columnas alcance de la verificación SARO, fecha de la verificación SARO y fecha de la evaluación DISC, con encabezados autoexplicativos, en la importación, en la plantilla de muestra y en la exportación del banco. La exportación SHALL escribir el alcance tal como está registrado en el catálogo, de modo que pegar la exportación sin tocarla deje el perfil «sin cambios». La plantilla SHALL traer como valor de ejemplo del alcance uno activo del catálogo con su forma registrada, de modo que su fila de ejemplo no dé error en esas columnas. Confirmar SHALL aplicar los tres datos por fusión sin cambiar el estado de ningún perfil, y el historial SHALL registrar el cambio como hecho por importación con quién la confirmó.

#### Scenario: HU-191 · Completar los publicados incompletos con una hoja
- **GIVEN** tres perfiles publicados marcados «Incompleto: falta la verificación SARO» y un catálogo de alcances con «Antecedentes judiciales, disciplinarios y fiscales»
- **AND** una hoja pegada con el código de esos tres perfiles, ese alcance, la fecha SARO y la fecha DISC de cada uno
- **WHEN** la administradora confirma la importación tras la vista previa
- **THEN** los tres perfiles quedan con sus tres datos registrados y siguen en estado publicado
- **AND** dejan de aparecer marcados como incompletos en el listado
- **AND** la ficha de cada uno muestra en el portal la verificación SARO con ese alcance y su mes, y la evaluación DISC con su mes
- **AND** el historial de cada perfil registra el cambio como hecho por importación, con quién la confirmó

#### Scenario: HU-191 · La exportación trae las tres columnas y vuelve sin cambios
- **GIVEN** un perfil del banco con la verificación SARO y la fecha DISC registradas
- **WHEN** la administradora exporta el banco en hoja de cálculo
- **THEN** la exportación trae las columnas de alcance SARO, fecha SARO y fecha DISC, con el alcance escrito tal como está en el catálogo
- **AND** al pegar esa exportación sin tocarla, la vista previa pone el perfil en «sin cambios»

#### Scenario: HU-191 · La plantilla de muestra trae las tres columnas
- **GIVEN** un catálogo de alcances SARO con al menos un alcance activo
- **WHEN** la administradora descarga la plantilla de muestra de la importación
- **THEN** la plantilla trae las columnas de alcance SARO, fecha SARO y fecha DISC, cada una con un encabezado autoexplicativo y un valor de ejemplo
- **AND** el valor de ejemplo del alcance es uno activo del catálogo, escrito tal como está registrado
- **AND** al pegar la fila de ejemplo de la plantilla, la vista previa no la marca con error en esas tres columnas

### Requirement: Valores de SARO y DISC fuera de regla van a error de fila
En el cálculo del plan, el alcance SARO SHALL compararse contra el catálogo cerrado sin distinguir mayúsculas ni tildes; un alcance desconocido, o desactivado para un perfil que no lo tenía, SHALL ser error de fila y nunca un valor nuevo de taxonomía. Una fecha posterior a hoy o que no se reconozca como fecha SHALL ser error de fila con su motivo y el valor exacto. Vaciar (`[vaciar]`) una validación de entrada de un perfil publicado SHALL ser error de fila que conserva el dato y el estado; en un borrador SHALL aplicarse. Las filas válidas SHALL seguir en la vista previa.

#### Scenario: HU-191 · Alcance SARO fuera del catálogo
- **GIVEN** que hoy es 2 de octubre de 2026 y una hoja pegada en la que una fila trae el alcance SARO «Antecedentes penales», que no existe en el catálogo
- **WHEN** el sistema termina de procesar la hoja
- **THEN** esa fila aparece en el grupo con error, con el motivo «el alcance SARO no está en el catálogo» y el valor exacto, sin aplicarse
- **AND** ese valor no se ofrece como valor nuevo en la taxonomía
- **AND** las demás filas válidas siguen en la vista previa

#### Scenario: HU-191 · Fecha SARO futura
- **GIVEN** que hoy es 2 de octubre de 2026 y una hoja pegada en la que una fila trae la fecha SARO 15/11/2026
- **WHEN** el sistema termina de procesar la hoja
- **THEN** esa fila aparece en el grupo con error, con el motivo «la fecha de una verificación no puede ser posterior a hoy» y el valor exacto, sin aplicarse
- **AND** las demás filas válidas siguen en la vista previa

#### Scenario: HU-191 · Fecha DISC ilegible
- **GIVEN** que hoy es 2 de octubre de 2026 y una hoja pegada en la que una fila trae la fecha DISC «abril»
- **WHEN** el sistema termina de procesar la hoja
- **THEN** esa fila aparece en el grupo con error, con el motivo «la fecha DISC no se reconoce como fecha» y el valor exacto, sin aplicarse
- **AND** las demás filas válidas siguen en la vista previa

#### Scenario: HU-191 · Vaciar una validación de un perfil publicado
- **GIVEN** un perfil publicado con la verificación SARO y la fecha DISC registradas
- **AND** una hoja pegada cuya fila de ese perfil trae `[vaciar]` en la fecha DISC
- **WHEN** el sistema termina de procesar la hoja
- **THEN** esa fila aparece en el grupo con error, con el motivo «no se puede vaciar una validación de entrada de un perfil publicado; pásalo a borrador desde el editor»
- **AND** el perfil conserva su fecha DISC y sigue publicado
