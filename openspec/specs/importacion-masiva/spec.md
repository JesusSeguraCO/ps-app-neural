# importacion-masiva Specification

## Purpose
Permite crear o actualizar decenas de perfiles a la vez desde una hoja de cálculo o un JSON, viendo exactamente qué cambiaría antes de confirmar, sin que un archivo pueda publicar, conceder consentimiento, borrar ni vaciar datos por accidente, y con la última importación reversible por completo.

## Requirements

### Requirement: Plantilla de muestra y exportación en el formato de importación
El panel SHALL ofrecer la plantilla de muestra y la exportación del banco en hoja de cálculo y en JSON, con los mismos encabezados y la misma estructura que acepta la importación: una fila por perfil, una columna por campo del modelo, listas en una sola celda separadas por punto y coma. La plantilla SHALL traer encabezados autoexplicativos, un valor de ejemplo por columna y tres ejemplos (actualizar un campo, crear un perfil nuevo y archivar uno). La exportación SHALL incluir los campos internos que no se publican marcados como internos y no SHALL incluir el registro de consentimiento. Si el navegador bloquea la descarga, el contenido SHALL mostrarse en un área de texto para copiarlo.

#### Scenario: HU-088 · Exportar el banco en el formato de importación
- **GIVEN** un banco con perfiles cargados
- **WHEN** la administradora exporta el banco en hoja de cálculo
- **THEN** obtiene una fila por perfil y una columna por campo del modelo, con los mismos encabezados que la plantilla de muestra
- **AND** las listas vienen en una sola celda separadas por punto y coma

#### Scenario: HU-088 · Plantilla de muestra
- **GIVEN** una administradora que nunca ha importado y no conoce el formato
- **WHEN** descarga la plantilla de muestra
- **THEN** obtiene un archivo con las columnas y tres ejemplos: actualizar un campo, crear un perfil nuevo y archivar uno
- **AND** cada columna trae un encabezado autoexplicativo y un valor de ejemplo

#### Scenario: HU-088 · El mismo banco en JSON
- **GIVEN** un banco con perfiles cargados
- **WHEN** la administradora exporta el banco en JSON
- **THEN** obtiene los mismos perfiles y campos que en la hoja de cálculo
- **AND** el archivo tiene la estructura que acepta la importación, sin conversión

#### Scenario: HU-088 · El navegador bloquea la descarga
- **GIVEN** una vista incrustada donde el navegador bloquea las descargas
- **WHEN** la administradora descarga la plantilla de muestra
- **THEN** el contenido se muestra en un área de texto para copiarlo
- **AND** puede continuar sin que la descarga haya funcionado

#### Scenario: HU-088 · Campos internos
- **GIVEN** un banco con campos que no se publican, como el motivo de pausa o la fecha exacta de disponibilidad
- **WHEN** la administradora exporta el banco
- **THEN** esos campos vienen incluidos y marcados como internos
- **AND** el archivo no incluye el registro de consentimiento

### Requirement: Pegar la hoja y emparejar columnas
El asistente SHALL detectar sin preguntar si lo pegado o cargado es JSON, celdas de hoja de cálculo o CSV, y preguntar solo si hay ambigüedad. SHALL proponer por nombre el emparejamiento de cada columna con un campo del perfil o «no importar», y dejarlo corregir. Una columna sin emparejar SHALL ignorarse e informarse; una columna fuera del modelo (incluida cualquiera de la lista negra B.4) nunca SHALL entrar al banco.

#### Scenario: HU-086 · Pegar desde la hoja de cálculo
- **GIVEN** una administradora que copió de Excel un bloque de celdas con una columna de código y otra de disponibilidad
- **WHEN** lo pega en el asistente
- **THEN** el sistema reconoce que es un formato tabular sin que ella se lo diga
- **AND** propone el emparejamiento de cada columna con un campo del perfil, o «no importar», y le deja corregirlo

### Requirement: Emparejamientos guardados y reutilizables
Un emparejamiento corregido SHALL poder guardarse como plantilla con un nombre, conservando qué columna va a qué campo y cuáles quedaron en «no importar», y aparecer en la lista de emparejamientos guardados. Aplicarla SHALL emparejar las columnas conocidas como se guardó, dejando corregir antes de la vista previa. Si a la hoja le falta una columna de la plantilla, el asistente SHALL decir cuáles faltan y los campos que alimentaban no SHALL tocarse; una columna que la plantilla no conoce SHALL quedar sin emparejar, ignorada e informada.

#### Scenario: HU-148 · Guardar el emparejamiento
- **GIVEN** una administradora que corrigió en el asistente el emparejamiento de las columnas de su hoja con los campos del perfil
- **WHEN** lo guarda como plantilla con un nombre
- **THEN** la plantilla aparece en la lista de emparejamientos guardados
- **AND** conserva qué columna va a qué campo y cuáles quedaron en «no importar»

#### Scenario: HU-148 · Reutilizar el emparejamiento en la hoja del mes siguiente
- **GIVEN** la plantilla guardada «Disponibilidad mensual» y una hoja pegada con los mismos encabezados
- **WHEN** la administradora elige esa plantilla en el paso de emparejamiento
- **THEN** cada columna queda emparejada como la guardó
- **AND** puede corregir cualquier emparejamiento antes de pasar a la vista previa

#### Scenario: HU-148 · A la hoja le falta una columna de la plantilla
- **GIVEN** una plantilla que empareja una columna «Disponibilidad» que la hoja pegada no trae
- **WHEN** la administradora aplica la plantilla
- **THEN** el asistente le dice qué columnas de la plantilla faltan en la hoja
- **AND** los campos que esas columnas alimentaban no se tocan en ningún perfil

#### Scenario: HU-148 · La hoja trae una columna que la plantilla no conoce
- **GIVEN** una hoja pegada con una columna nueva que no estaba cuando se guardó la plantilla
- **WHEN** la administradora aplica la plantilla
- **THEN** las columnas conocidas se emparejan como se guardaron
- **AND** la columna nueva queda sin emparejar, se ignora y el asistente lo informa

### Requirement: Vista previa sin escritura
Al terminar de procesar, el asistente SHALL mostrar cada fila como tarjeta colapsada agrupada en nuevos, actualizados, archivados, sin cambios, omitidos y con error, con su conteo, y cada tarjeta SHALL poder desmarcarse para excluirla; nada SHALL modificarse en el banco hasta confirmar. La tarjeta de un actualizado SHALL mostrar solo los campos que cambian, con valor anterior y nuevo enfrentados. Dos filas con el mismo código SHALL ir ambas al grupo con error con el código duplicado como motivo, ninguna se aplica y la importación no procede hasta resolverlo. Un valor de rol, tecnología o sector que no existe en el banco SHALL destacarse como nuevo en la taxonomía con el valor exacto y cuántas veces se repite, sin bloquear la vista previa. Reimportar la exportación sin tocar SHALL dejar todo en «sin cambios».

#### Scenario: HU-086 · La vista previa al terminar de procesar
- **GIVEN** una administradora que pegó la exportación del banco con la disponibilidad de dos perfiles cambiada y el resto sin tocar
- **WHEN** el sistema termina de procesarla
- **THEN** ve cada fila como tarjeta colapsada agrupada en nuevos, actualizados, archivados, sin cambios, omitidos y con error, con su conteo
- **AND** los dos perfiles editados aparecen en actualizados y todos los demás en «sin cambios»
- **AND** puede desmarcar cualquier tarjeta para excluirla
- **AND** nada se ha modificado todavía en el banco

#### Scenario: HU-086 · Abrir un perfil actualizado
- **GIVEN** una vista previa con un perfil en el grupo de actualizados
- **WHEN** la administradora abre su tarjeta
- **THEN** ve solo los campos que cambian, con valor anterior y nuevo enfrentados
- **AND** los campos que no cambian no aparecen

#### Scenario: HU-086 · Dos filas con el mismo código
- **GIVEN** una hoja que repite un código en dos filas
- **WHEN** el sistema termina de procesarla
- **THEN** ambas filas aparecen en el grupo con error, con el código duplicado como motivo
- **AND** ninguna de las dos se aplica
- **AND** la importación no procede hasta que se resuelva el duplicado

#### Scenario: HU-086 · Valores que no existen en el banco
- **GIVEN** una fila que trae una tecnología o un rol que hoy no existe en el banco
- **WHEN** el sistema termina de procesar la hoja
- **THEN** ese valor aparece destacado en la vista previa como nuevo en la taxonomía
- **AND** se ve el valor exacto y cuántas veces se repite en la hoja
- **AND** la vista previa no se bloquea por ello

### Requirement: Confirmar por modo, con fusión y sin publicar
La importación SHALL exigir elegir el modo antes de procesar —crear y actualizar (por omisión), solo actualizar o solo crear—; el código es la llave: existente actualiza, nuevo crea en borrador, y la fila excluida por el modo SHALL omitirse y contarse con su motivo. Solo SHALL modificarse lo que viene en la fila: campo ausente y celda vacía no tocan nada y solo el nulo explícito (`null` o `[vaciar]`) vacía un campo. Una fila que trae consentimiento en verdadero o estado publicado SHALL ver esos campos rechazados con aviso en su tarjeta e importarse en lo demás; ninguna importación SHALL publicar, conceder consentimiento ni borrar perfiles; la fila que dejaría a un publicado sin algo que la publicación exige (rol, seniority, años de experiencia, tecnologías, ciudad, modalidad de trabajo, disponibilidad, trayectoria o modalidad de prueba de la familia de su rol) SHALL ir a error con el motivo y no aplicarse, salvo que la misma fila lo pase a borrador (D44). La aplicación SHALL ser todo o nada, una sola a la vez, idempotente, y cada cambio SHALL quedar atribuido a la importación y a quien la confirmó. Solo el rol administrador de inventario SHALL ejecutarla.

#### Scenario: HU-141 · El código manda
- **GIVEN** una fila con un código que ya existe y otra con un código que no
- **WHEN** la administradora confirma la importación en modo crear y actualizar
- **THEN** la primera actualiza el perfil existente
- **AND** la segunda crea un perfil nuevo en borrador

#### Scenario: HU-141 · El archivo intenta conceder consentimiento o publicar
- **GIVEN** alguna fila que trae el consentimiento en verdadero o el estado en publicado
- **WHEN** la administradora confirma la importación
- **THEN** esos campos se rechazan y se avisa en la tarjeta
- **AND** el resto de la fila se importa con normalidad
- **AND** ningún perfil queda publicado por efecto de la importación

#### Scenario: HU-141 · La fila dejaría incompleto a un publicado (D44)
- **GIVEN** un perfil publicado y completo, y una fila que vacía su modalidad de prueba, sus tecnologías o le pone un rol de otra familia sin la modalidad de prueba de esa familia
- **WHEN** la administradora ve la vista previa y confirma la importación
- **THEN** esa fila queda con error nombrando lo que faltaría y no se aplica
- **AND** el perfil sigue publicado y completo en el portal, y las demás filas se importan

#### Scenario: HU-141 · Campo ausente frente a nulo explícito
- **GIVEN** la fila de un perfil existente a la que le falta la columna de un campo, con otra columna con la celda vacía y una tercera con el nulo explícito `[vaciar]`
- **WHEN** la administradora confirma la importación
- **THEN** el campo de la columna ausente y el de la celda vacía quedan intactos
- **AND** solo el campo marcado con el nulo explícito queda vacío

#### Scenario: HU-141 · Modo solo actualizar con un código inexistente
- **GIVEN** el modo solo actualizar elegido y una fila con un código que no existe
- **WHEN** la administradora confirma la importación
- **THEN** esa fila se omite en lugar de crear un perfil
- **AND** queda contada entre las omitidas con su motivo

### Requirement: Descargar solo las filas con error
El resultado de la importación SHALL permitir descargar solo las filas con error, con su motivo y en el formato en que llegaron; si ninguna fila pudo procesarse, SHALL entregar todas con su motivo y decir si el problema fue del archivo entero. Reimportar las filas corregidas SHALL actualizar por código sin duplicar nada de lo que ya entró.

#### Scenario: HU-142 · Descargar solo lo que falló
- **GIVEN** tres de sesenta filas con error y las cincuenta y siete buenas ya aplicadas
- **WHEN** la administradora descarga el archivo de errores desde el resultado de la importación
- **THEN** recibe solo esas tres filas con su motivo, en el formato en que llegaron
- **AND** el archivo no incluye ninguna de las cincuenta y siete aplicadas

#### Scenario: HU-142 · El archivo completo falló
- **GIVEN** una importación en la que ninguna fila pudo procesarse
- **WHEN** la administradora descarga el archivo de errores
- **THEN** recibe todas las filas con su motivo
- **AND** el panel le dice si el problema fue del archivo entero y no de las filas

#### Scenario: HU-142 · Reimportar las corregidas
- **GIVEN** las tres filas corregidas y pegadas de nuevo
- **WHEN** la administradora confirma la importación
- **THEN** actualizan los perfiles que corresponden por código
- **AND** no se duplica nada de lo que ya había entrado en la primera importación

### Requirement: Revertir la última importación
La última importación aplicada SHALL poder revertirse por completo: cada perfil actualizado vuelve exactamente al estado que tenía antes, los creados quedan archivados (no borrados) y la reversión queda en el historial como evento propio. Revertir una importación que ya no es la última SHALL explicarse mostrando qué importaciones hay después. Si algún perfil tocado cambió a mano después, el sistema SHALL advertir cuáles y dejar elegir si se incluyen en la reversión o se dejan como están.

#### Scenario: HU-087 · Revertir la última importación
- **GIVEN** una importación recién aplicada cuyo resultado no es el esperado
- **WHEN** la administradora usa la opción de deshacer
- **THEN** cada perfil actualizado vuelve exactamente al estado que tenía antes
- **AND** los perfiles que la importación creó quedan archivados, no borrados
- **AND** el historial registra la reversión como un evento propio

#### Scenario: HU-087 · Intentar revertir una importación que ya no es la última
- **GIVEN** otra importación posterior a la que se quiere deshacer
- **WHEN** la administradora intenta revertir la anterior
- **THEN** el sistema le explica que solo se revierte la última
- **AND** le muestra qué importaciones hay después

#### Scenario: HU-087 · Un perfil cambiado a mano después de la importación
- **GIVEN** un perfil que la importación había tocado y que después se editó manualmente
- **WHEN** la administradora revierte la importación
- **THEN** el sistema le advierte cuáles perfiles cambiaron después
- **AND** le deja elegir si los incluye en la reversión o los deja como están

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
