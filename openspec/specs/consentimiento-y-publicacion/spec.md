# consentimiento-y-publicacion Specification

## Purpose
Garantiza que ningún perfil llega al cliente con el nombre de un profesional sin su consentimiento nominal y explícito ni sin decir cómo se validó, y que la publicación nunca espera a que alguien redacte el reporte detallado.

## Requirements

### Requirement: Consentimiento nominal y explícito
El registro de consentimiento SHALL declarar su alcance: publicar nombre y primer apellido junto con la trayectoria y, si se autoriza, los clientes nombrados, ante cuentas cliente y de forma continua. Un consentimiento nominal registrado SHALL habilitar el perfil para pasar a publicado y SHALL quedar con quién lo registró y cuándo. Un consentimiento recogido para una publicación anonimizada SHALL rechazarse como nominal, explicando que no cubre este uso y que hay que recogerlo de nuevo. Solo el rol administrador de inventario SHALL registrar o revocar consentimientos, y solo desde el panel.

#### Scenario: HU-127 · Consentimiento nominal y explícito
- **GIVEN** un profesional que autorizó publicar nombre y primer apellido junto con trayectoria y clientes nombrados, ante cuentas cliente y de forma continua
- **WHEN** la administradora registra ese consentimiento en su perfil
- **THEN** el perfil queda habilitado para pasar a publicado
- **AND** queda registrado quién lo registró y cuándo

#### Scenario: HU-127 · Consentimiento anterior para publicación anonimizada
- **GIVEN** un profesional cuyo único consentimiento es de cuando el banco se publicaba sin nombres
- **WHEN** la administradora intenta registrarlo como consentimiento nominal
- **THEN** el panel lo rechaza y explica que ese consentimiento no cubre este uso
- **AND** le indica que hay que recogerlo de nuevo

### Requirement: Revocar despublica de inmediato
Registrar la revocación del consentimiento de un perfil publicado SHALL sacarlo de publicado en la misma operación; un enlace curado que lo incluía SHALL mostrar, al abrirse, que el perfil dejó de estar disponible en lugar de omitirlo.

#### Scenario: HU-127 · Consentimiento revocado
- **GIVEN** un perfil publicado cuyo profesional comunicó que revoca su consentimiento
- **WHEN** la administradora registra la revocación
- **THEN** el perfil sale de publicado de inmediato
- **AND** un enlace curado que lo incluía, al abrirse, muestra que el perfil dejó de estar disponible en lugar de omitirlo

### Requirement: Consentimiento parcial despersonaliza la experiencia
Un consentimiento que autoriza la trayectoria pero no nombrar a los clientes SHALL permitir publicar el perfil con la experiencia despersonalizada; los clientes nombrados no SHALL aparecer en la ficha ni en ninguna respuesta del portal.

#### Scenario: HU-127 · Consentimiento parcial
- **GIVEN** un profesional que autoriza su trayectoria pero no que se nombren sus clientes
- **WHEN** la administradora registra ese consentimiento
- **THEN** el perfil puede publicarse con la experiencia despersonalizada
- **AND** los clientes nombrados no aparecen en su ficha

### Requirement: Publicar exige consentimiento y modalidad de prueba
Pasar un perfil a publicado SHALL exigir un consentimiento nominal vigente y una modalidad de prueba elegida del catálogo de la familia de su rol; si falta alguno, el panel SHALL impedirlo, decir exactamente qué falta y ofrecer ir a registrarlo o elegirlo entre las modalidades de esa familia. La guarda SHALL aplicarse en toda vía de escritura del perfil y no SHALL ser un parámetro administrable.

#### Scenario: HU-128 · El bloqueo actúa
- **GIVEN** un perfil sin consentimiento nominal registrado
- **WHEN** la administradora intenta publicarlo
- **THEN** el panel lo impide y le dice exactamente qué falta
- **AND** le ofrece ir a registrarlo

#### Scenario: HU-128 · Perfil sin modalidad de prueba elegida
- **GIVEN** un perfil con consentimiento nominal registrado pero ninguna modalidad de prueba elegida del catálogo de su familia
- **WHEN** la administradora intenta publicarlo
- **THEN** el panel lo impide y le dice que falta elegir la modalidad de prueba
- **AND** le ofrece elegirla entre las modalidades de la familia de su rol

#### Scenario: HU-128 · Intento de saltarse el bloqueo por importación
- **GIVEN** un archivo de importación que trae un campo de consentimiento
- **WHEN** se procesa
- **THEN** el consentimiento no se concede y el perfil llega a borrador
- **AND** el bloqueo se mantiene

### Requirement: Publicación masiva sin abortar el lote
Publicar varios perfiles a la vez SHALL publicar los que cumplen las guardas y SHALL señalar cada uno de los demás con su motivo, sin abortar la operación completa.

#### Scenario: HU-128 · Publicación masiva
- **GIVEN** varios perfiles seleccionados para publicar a la vez, alguno sin consentimiento registrado o sin modalidad de prueba elegida
- **WHEN** la administradora confirma la publicación masiva
- **THEN** se publican los que sí lo tienen
- **AND** los demás quedan señalados con su motivo, sin abortar la operación completa

### Requirement: Publicar con Nivel 0
Un perfil con consentimiento y modalidad de prueba elegida SHALL poder publicarse sin reporte detallado de validación, con el enunciado de Nivel 0 que trae la modalidad elegida y sin que nadie redacte nada; la ficha no SHALL mostrar un bloque vacío ni prometer un detalle que no existe. Si la familia del rol no tiene ninguna modalidad de prueba en el catálogo, publicar SHALL impedirse remitiendo a registrar la modalidad. Registrar después el reporte detallado de un publicado SHALL enriquecer la ficha sin republicar el perfil.

#### Scenario: HU-130 · Publicación con Nivel 0
- **GIVEN** un perfil con consentimiento registrado y modalidad de prueba elegida, sin reporte detallado de validación
- **WHEN** la administradora lo publica
- **THEN** se publica con el enunciado de Nivel 0 que trae la modalidad de prueba elegida, sin que ella redacte nada
- **AND** la ficha no muestra un bloque vacío ni promete un detalle que no existe

#### Scenario: HU-130 · La familia no tiene modalidades de prueba registradas
- **GIVEN** un perfil cuya familia de rol no tiene ninguna modalidad de prueba en el catálogo
- **WHEN** la administradora intenta publicarlo
- **THEN** el panel lo impide y la manda a registrar la modalidad
- **AND** explica que sin ella ningún perfil de esa familia puede publicarse

#### Scenario: HU-130 · El detalle llega después
- **GIVEN** un perfil publicado con Nivel 0
- **WHEN** la administradora registra y guarda su reporte detallado de validación
- **THEN** la ficha se enriquece sin republicar el perfil
- **AND** el cliente que la abra ve la evidencia por criterio
