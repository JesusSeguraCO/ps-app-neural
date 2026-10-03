# Spec Delta

## Purpose

Garantiza que ningún perfil nuevo llegue al cliente sin las tres validaciones de entrada del estándar —seguridad bajo SARO, técnica y evaluación DISC— y que los ya publicados a los que les falta alguna sigan visibles, señalados en el panel con lo que les falta, sin volver a publicar un cambio hasta completarlas.

## ADDED Requirements

### Requirement: Registrar SARO y DISC en el perfil
El editor del perfil SHALL permitir registrar el alcance de la verificación SARO elegido del catálogo de alcances, la fecha de esa verificación y la fecha de la evaluación DISC. Guardar SHALL conservar los tres datos y la vista previa de la ficha SHALL mostrarlos (texto del alcance y mes de cada fecha). Una fecha de verificación posterior a hoy (`America/Bogota`) SHALL rechazarse sin guardar, con el mensaje «la fecha de una verificación no puede ser posterior a hoy», conservando los datos que el perfil tenía. Un borrador SHALL poder guardarse con parte de estos datos.

#### Scenario: HU-176 · Registrar los tres datos en un perfil
- **GIVEN** un perfil abierto en el editor sin datos de seguridad ni de DISC y un catálogo de alcances con «Antecedentes judiciales, disciplinarios y fiscales»
- **AND** ese alcance elegido con fecha 15 de marzo de 2026 y como evaluación DISC la fecha 10 de abril de 2026
- **WHEN** la administradora guarda el perfil
- **THEN** el perfil queda guardado con esos tres datos
- **AND** la vista previa de la ficha muestra la verificación SARO con el texto de ese alcance y «marzo de 2026», y la evaluación DISC con «abril de 2026»

#### Scenario: HU-176 · Una fecha futura
- **GIVEN** que hoy es 2 de octubre de 2026 y la fecha de la verificación SARO escrita en el editor es el 15 de noviembre de 2026
- **WHEN** la administradora guarda el perfil
- **THEN** el panel no guarda el cambio y dice que la fecha de una verificación no puede ser posterior a hoy
- **AND** el perfil conserva los datos de seguridad que tenía

#### Scenario: HU-176 · Corregir el dato de un perfil publicado
- **GIVEN** un perfil publicado con la verificación SARO registrada con fecha 15 de marzo de 2026
- **AND** esa fecha cambiada en el editor por el 20 de febrero de 2026, guardada y pendiente de la confirmación de cambio en un perfil publicado
- **WHEN** la administradora confirma el cambio
- **THEN** la ficha del cliente muestra «febrero de 2026»
- **AND** el historial del perfil registra quién cambió la fecha, cuándo, y el valor anterior y el nuevo

### Requirement: Publicar exige SARO y DISC
La guarda única de publicación SHALL exigir, además de lo que ya exige, el alcance de la verificación SARO, la fecha de la verificación SARO y la fecha de la evaluación DISC, en toda vía de publicación (individual y masiva). Si falta alguno, el panel SHALL impedir publicar, decir exactamente «Falta <motivo>», llevar al campo que falta en el editor y dejar el perfil en borrador, fuera del portal. El Sello Personal no SHALL ser condición de publicación.

#### Scenario: HU-176 · Publicar sin el alcance SARO
- **GIVEN** un perfil en borrador con consentimiento y modalidad de prueba al que le falta el alcance de la verificación SARO
- **WHEN** la administradora intenta publicarlo
- **THEN** el panel lo impide y dice exactamente «Falta el alcance de la verificación SARO»
- **AND** la lleva al campo que falta en el editor
- **AND** el perfil sigue en borrador, fuera del portal

#### Scenario: HU-176 · Publicar sin la fecha SARO
- **GIVEN** un perfil en borrador con consentimiento y modalidad de prueba al que le falta la fecha de la verificación SARO
- **WHEN** la administradora intenta publicarlo
- **THEN** el panel lo impide y dice exactamente «Falta la fecha de la verificación SARO»
- **AND** la lleva al campo que falta en el editor
- **AND** el perfil sigue en borrador, fuera del portal

#### Scenario: HU-176 · Publicar sin la fecha DISC
- **GIVEN** un perfil en borrador con consentimiento y modalidad de prueba al que le falta la fecha de la evaluación DISC
- **WHEN** la administradora intenta publicarlo
- **THEN** el panel lo impide y dice exactamente «Falta la fecha de la evaluación DISC»
- **AND** la lleva al campo que falta en el editor
- **AND** el perfil sigue en borrador, fuera del portal

### Requirement: Publicados incompletos marcados sin retirarlos
Un perfil publicado al que la guarda de publicación rechazaría hoy por una validación de entrada (verificación SARO, fecha DISC o modalidad de prueba) SHALL seguir en estado publicado y visible en el portal, y el listado del panel SHALL marcarlo «Incompleto: falta <validación>» y permitir filtrar por «incompleto». La marca SHALL calcularse con la misma guarda de publicación, no SHALL ser un estado del perfil y nunca SHALL cruzar al portal. La falta de Sello Personal no SHALL marcar un perfil como incompleto.

#### Scenario: HU-178 · Publicado sin la verificación SARO
- **GIVEN** un perfil publicado antes de que la regla lo exigiera, sin la verificación SARO (alcance y fecha) registrada
- **WHEN** la administradora abre el listado de perfiles del panel
- **THEN** el perfil aparece marcado «Incompleto: falta la verificación SARO (alcance y fecha)»
- **AND** el listado se puede filtrar por «incompleto»
- **AND** el perfil sigue en estado publicado y visible en el portal

#### Scenario: HU-178 · Publicado sin la fecha DISC
- **GIVEN** un perfil publicado antes de que la regla lo exigiera, sin la fecha de la evaluación DISC registrada
- **WHEN** la administradora abre el listado de perfiles del panel
- **THEN** el perfil aparece marcado «Incompleto: falta la fecha de la evaluación DISC»
- **AND** el perfil sigue en estado publicado y visible en el portal

#### Scenario: HU-178 · Publicado sin modalidad de prueba
- **GIVEN** un perfil publicado antes de que la regla lo exigiera, sin modalidad de prueba registrada
- **WHEN** la administradora abre el listado de perfiles del panel
- **THEN** el perfil aparece marcado «Incompleto: falta la modalidad de prueba»
- **AND** el perfil sigue en estado publicado y visible en el portal

#### Scenario: HU-178 · El Sello Personal no marca un perfil como incompleto
- **GIVEN** un perfil publicado con sus tres validaciones de entrada completas y ninguna competencia del Sello Personal registrada
- **WHEN** la administradora abre el listado de perfiles del panel
- **THEN** el perfil no aparece marcado como incompleto
- **AND** puede editarlo y publicar el cambio sin registrar el Sello Personal

### Requirement: Un cambio en un publicado incompleto solo se publica completándolo
Guardar un cambio sobre un publicado incompleto que no complete lo que falta SHALL recibir la pregunta de la edición de publicados («¿descarto el cambio o paso el perfil a borrador?») con el motivo de lo que falta y, mientras no haya respuesta, el portal SHALL seguir mostrando la versión anterior. Un cambio que complete lo que falta SHALL publicarse tras la confirmación de impacto y el perfil SHALL dejar de estar marcado como incompleto.

#### Scenario: HU-178 · Editar un publicado incompleto sin completarlo
- **GIVEN** un perfil publicado marcado «Incompleto: falta la verificación SARO»
- **AND** un cambio de su resumen en el editor sin registrar la verificación SARO
- **WHEN** la administradora guarda
- **THEN** el panel dice que el cambio no se puede publicar mientras falte la verificación SARO y pregunta si descarta el cambio o pasa el perfil a borrador
- **AND** mientras no responda, el portal sigue mostrando la versión anterior del perfil

#### Scenario: HU-178 · Completar lo que falta permite publicar el cambio
- **GIVEN** un perfil publicado marcado «Incompleto: falta la fecha de la evaluación DISC»
- **AND** esa fecha registrada en el editor, guardada y pendiente de la confirmación de cambio en un perfil publicado
- **WHEN** la administradora confirma el cambio
- **THEN** el cambio queda visible en el portal
- **AND** el perfil deja de aparecer marcado como incompleto

### Requirement: El conteo de incompletos alimenta la afirmación del estándar
El número de publicados incompletos SHALL calcularse con la misma guarda que produce la marca del panel y SHALL ser lo único que decide si el encabezado del estándar del portal afirma «ninguno», de modo que la marca y la frase no puedan discrepar.

#### Scenario: HU-178 · Completar el último incompleto devuelve la afirmación
- **GIVEN** la confirmación del cambio que completa un perfil marcado «Incompleto», tras la cual queda 0 publicados incompletos en el banco
- **WHEN** un cliente abre la selección de su correo en el portal
- **THEN** el encabezado del estándar afirma que ningún perfil llega al portal sin verificación SARO, prueba técnica revisada por Trycore y evaluación DISC

#### Scenario: HU-178 · Queda un incompleto tras confirmar
- **GIVEN** la confirmación del cambio que completa un perfil marcado «Incompleto», tras la cual queda 1 publicado incompleto en el banco
- **WHEN** un cliente abre la selección de su correo en el portal
- **THEN** el encabezado describe lo que el estándar exige a cada perfil, sin afirmar que ninguno llega sin SARO, DISC y validaciones
