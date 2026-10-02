# Spec Delta

## Purpose

Permite que Talento Humano cree, corrija, previsualice y retire los perfiles del banco desde el panel sabiendo siempre qué verá el cliente, sin texto libre en la taxonomía y sin borrar nunca el rastro de lo que se mostró.

## ADDED Requirements

### Requirement: Un perfil nuevo nace en borrador
Guardar un perfil nuevo SHALL dejarlo en estado borrador, fuera del portal, con rol, tecnologías, sector y modalidad de prueba como valores del catálogo. Si faltan atributos obligatorios del modelo, el perfil SHALL guardarse igual como borrador y el panel SHALL señalar qué falta para poder publicarlo. Ningún camino (panel ni importación) SHALL crear un perfil en otro estado que borrador.

#### Scenario: HU-125 · Perfil nuevo en borrador
- **GIVEN** una administradora con sesión en el panel que está creando un perfil nuevo
- **WHEN** lo guarda con sus atributos del modelo de datos
- **THEN** el perfil queda en estado borrador
- **AND** rol, tecnologías y sector quedan como valores del catálogo, no como texto libre
- **AND** el perfil no es visible en el portal

#### Scenario: HU-125 · Campos obligatorios incompletos
- **GIVEN** un perfil nuevo con un atributo obligatorio del modelo sin llenar
- **WHEN** la administradora lo guarda
- **THEN** el perfil se guarda igual como borrador
- **AND** el panel señala qué falta para poder publicarlo

### Requirement: El editor encadena rol, familia y modalidad de prueba
Al seleccionar un rol, el editor SHALL ofrecer como modalidades de prueba solo las activas de la familia de ese rol. Si la familia no tiene ninguna, el panel SHALL advertir en ese momento que ningún perfil de esa familia podrá publicarse y SHALL ofrecer ir a registrar la modalidad. Si el valor escrito no existe, el editor SHALL mostrar los parecidos antes de dejar crear uno nuevo.

#### Scenario: HU-125 · Familia sin modalidades de prueba
- **GIVEN** un rol que pertenece a una familia sin modalidades de prueba registradas
- **WHEN** la administradora lo selecciona en el editor del perfil
- **THEN** el panel le advierte en ese momento que ningún perfil de esa familia podrá publicarse
- **AND** le ofrece ir a registrar la modalidad antes de seguir

#### Scenario: HU-125 · El valor que necesito no está en el catálogo
- **GIVEN** un rol que no existe en el catálogo
- **WHEN** la administradora lo escribe en el campo de rol
- **THEN** el panel le muestra los valores parecidos antes de dejarle crear uno nuevo
- **AND** crear queda disponible después de haber visto la alternativa

### Requirement: Editar un publicado declara el impacto antes de aplicarlo
Guardar un cambio sobre un perfil publicado SHALL mostrar primero qué campos cambian de cara al cliente, con su valor anterior y el nuevo, sin aplicar nada; el portal SHALL seguir mostrando la versión vigente hasta la confirmación. Confirmar SHALL hacer visible el cambio en el portal y registrar qué cambió, quién y cuándo. El guardado SHALL rechazarse si el perfil cambió desde que se abrió (versión distinta), mostrando qué cambió.

#### Scenario: HU-126 · Guardar muestra el impacto
- **GIVEN** una administradora que editó un campo visible de un perfil publicado
- **WHEN** guarda el cambio
- **THEN** el panel le muestra qué campos cambian de cara al cliente, con su valor anterior y el nuevo
- **AND** el portal sigue mostrando la versión anterior mientras no confirme

#### Scenario: HU-126 · Confirmar aplica y deja registro
- **GIVEN** el impacto de un cambio en un perfil publicado a la vista
- **WHEN** la administradora confirma
- **THEN** el cambio queda visible en el portal
- **AND** queda registrado qué cambió, quién y cuándo

### Requirement: Un cambio que deja incompleto un publicado se pregunta
Si el cambio sobre un perfil publicado quita un dato que la publicación exige, el panel SHALL preguntar «Este cambio deja el perfil incompleto: ¿descarto el cambio o paso el perfil a borrador?» y, mientras no haya respuesta, el perfil SHALL seguir publicado sin el cambio. Descartar SHALL dejar el perfil exactamente como estaba y sin ninguna entrada de auditoría; pasar a borrador SHALL guardar el cambio, sacar el perfil del portal y registrar que salió de publicado por esa edición, quién y cuándo. El panel nunca SHALL despublicar solo ni bloquear el guardado en silencio.

#### Scenario: HU-126 · El cambio deja el perfil sin un dato que la publicación exige
- **GIVEN** una administradora que quitó en un perfil publicado un dato que la publicación exige
- **WHEN** guarda
- **THEN** el panel le pregunta «Este cambio deja el perfil incompleto: ¿descarto el cambio o paso el perfil a borrador?»
- **AND** mientras no responda, el perfil sigue publicado sin el cambio

#### Scenario: HU-126 · Elijo descartar el cambio
- **GIVEN** el panel preguntó si descartar el cambio o pasar el perfil a borrador
- **WHEN** la administradora elige descartar
- **THEN** el cambio no se aplica y el perfil conserva exactamente los valores que tenía antes de su edición
- **AND** no queda en la auditoría ningún cambio que nunca se aplicó

#### Scenario: HU-126 · Elijo pasar el perfil a borrador
- **GIVEN** el panel preguntó si descartar el cambio o pasar el perfil a borrador
- **WHEN** la administradora elige pasarlo a borrador
- **THEN** el cambio se guarda y el perfil queda en borrador, fuera del portal
- **AND** queda registrado que salió de publicado por esta edición, quién y cuándo

### Requirement: Ficha del perfil en el portal (D47)
El portal SHALL abrir la ficha de un perfil disponible en un panel lateral sobre la lista que el cliente tiene delante —la selección del correo o el banco con su filtro—, dibujada con el mismo componente que la vista previa del panel. SHALL recorrerse en el orden de esa lista con anterior y siguiente, con la flecha del extremo deshabilitada, y cerrarse volviendo a la misma lista; en el teléfono SHALL ocupar la pantalla. El cliente nombrado de cada experiencia SHALL mostrarse solo si el consentimiento lo incluye, y la validación técnica SHALL mostrarse por niveles (enunciado de Nivel 0 o reporte de Nivel 1). Ningún perfil fuera de la lista ni sin publicar SHALL abrir ficha.

#### Scenario: HU-120 · Recorrer fichas sin perder la lista (D47)
- **GIVEN** un cliente con su selección abierta
- **WHEN** abre la ficha de un perfil y pasa al siguiente
- **THEN** la ficha se abre como panel lateral sobre la lista y dice su posición en ella
- **AND** en el último perfil la flecha siguiente está deshabilitada y al cerrar vuelve a la misma lista

#### Scenario: HU-127 · Experiencia sin cliente nombrado en la ficha (D47)
- **GIVEN** un perfil publicado cuyo consentimiento no incluye a los clientes
- **WHEN** el cliente abre su ficha
- **THEN** ve cada experiencia con su cargo, su periodo y su descripción
- **AND** no ve el nombre del cliente de ninguna experiencia

#### Scenario: HU-130 · El cliente ve la validación por niveles (D47)
- **GIVEN** un perfil publicado con el reporte de validación confirmado
- **WHEN** el cliente abre su ficha
- **THEN** ve la modalidad, el resultado, el evaluador, la fecha y lo que se evaluó

### Requirement: Vista previa fiel de la ficha
La vista previa SHALL mostrar la ficha exactamente como la publicará el portal, con las mismas reglas de presentación: disponibilidad como banda de arranque y no como fecha, país siempre y ciudad solo si la necesidad fuera presencial o híbrida, bloques opcionales sin datos omitidos sin título ni hueco. Un bloque que depende de un atributo obligatorio ausente SHALL aparecer marcado como incompleto nombrando el dato. Sobre un publicado con cambios sin guardar, SHALL mostrar la ficha con el cambio aplicado mientras el portal sigue con la versión vigente. No SHALL existir comparación lado a lado (D3).

#### Scenario: HU-129 · Vista previa fiel
- **GIVEN** un perfil listo para publicar
- **WHEN** la administradora abre la vista previa
- **THEN** ve la ficha exactamente como la verá el cliente
- **AND** ve la disponibilidad como banda de arranque, no como fecha
- **AND** ve el país, y la ciudad solo si la necesidad fuera presencial o híbrida

#### Scenario: HU-129 · Falta un dato que la publicación exige
- **GIVEN** un perfil al que le falta un atributo obligatorio del modelo
- **WHEN** la administradora abre la vista previa
- **THEN** el bloque que depende de ese atributo aparece marcado como incompleto y nombra el dato que falta
- **AND** el panel le dice que el perfil no puede publicarse hasta completarlo

#### Scenario: HU-129 · Bloque opcional sin datos
- **GIVEN** un bloque opcional de la ficha sin datos, como el reporte detallado de validación
- **WHEN** la administradora abre la vista previa
- **THEN** la ficha se muestra sin ese bloque, sin título ni hueco vacío, igual que la publicará el portal
- **AND** el panel le indica que ese bloque es opcional y que su ausencia no impide publicar

#### Scenario: HU-129 · Previsualizar un perfil ya publicado
- **GIVEN** cambios sin guardar sobre un perfil publicado
- **WHEN** la administradora abre la vista previa
- **THEN** ve la ficha con el cambio aplicado, tal como la verá el cliente si lo guarda
- **AND** el portal sigue mostrando la versión vigente hasta que guarde

### Requirement: Eliminar archiva, nunca borra
La acción de eliminar SHALL pasar el perfil a archivado, sacarlo del portal y conservarlo para explicar solicitudes y enlaces pasados; no SHALL existir borrado físico de perfiles por ninguna vía. Archivar un perfil ya archivado SHALL informar que ya lo está sin cambiar su fecha de archivo ni su historial. Solo el rol administrador de inventario SHALL poder archivar.

#### Scenario: HU-135 · Archivar en lugar de borrar
- **GIVEN** un profesional que salió del banco
- **WHEN** la administradora usa la acción de eliminar
- **THEN** el perfil pasa a estado archivado y no se borra
- **AND** deja de mostrarse en el portal
- **AND** sigue disponible para explicar solicitudes pasadas

#### Scenario: HU-135 · Archivar sin permiso de escritura
- **GIVEN** una persona que entró al panel con rol observador
- **WHEN** intenta archivar un perfil
- **THEN** el panel no se lo permite
- **AND** el perfil conserva su estado y no queda ningún cambio registrado

#### Scenario: HU-135 · Archivar un perfil ya archivado
- **GIVEN** un perfil ya archivado
- **WHEN** la administradora intenta archivarlo de nuevo
- **THEN** el panel le indica que ya está archivado
- **AND** su fecha de archivo y su historial no cambian

#### Scenario: HU-135 · Perfil archivado que estaba en una selección curada
- **GIVEN** un perfil archivado que forma parte de un enlace curado ya emitido
- **WHEN** el cliente abre ese enlace
- **THEN** el portal muestra su estado real —fuera del banco— y no lo omite en silencio
- **AND** los demás perfiles de la selección se ven con normalidad
