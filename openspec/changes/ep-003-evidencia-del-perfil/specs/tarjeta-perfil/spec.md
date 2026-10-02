# Spec Delta

## Purpose

Hace que la tarjeta de cada perfil comunique una capacidad verificada —no un catálogo de personas—: lidera con la capacidad, diferencia por las competencias del Sello Personal y muestra criterio por criterio por qué coincide o no, sin porcentajes ni frases inferidas.

## ADDED Requirements

### Requirement: La tarjeta lidera con la capacidad
La tarjeta de un perfil publicado SHALL mostrar primero la capacidad («Rol · Seniority · N años de experiencia») y junto a ella el nombre y el primer apellido; debajo, hasta 5 tecnologías en el orden en que Talento Humano las registró, los sectores si los hay, la modalidad, el país y la banda de disponibilidad calculada contra la fecha del día. El código SHALL aparecer solo al pie, en letra pequeña. No SHALL mostrar fotografía, segundo apellido, fecha de disponibilidad, insignia del estándar ni un hueco o título vacío por un dato opcional ausente. Una disponibilidad vencida y sin tocar en más de 30 días SHALL mostrarse «Por confirmar», nunca «Inmediato» ni la fecha.

#### Scenario: HU-153 · La capacidad como descriptor inmediato
- **GIVEN** un perfil publicado «Desarrolladora Backend», Senior, con 9 años de experiencia, cuatro tecnologías ancla, el sector Banca, modalidad Remoto, país Colombia y disponibilidad dentro de 10 días
- **WHEN** el cliente ve su tarjeta en la lista
- **THEN** ve primero la capacidad («Desarrolladora Backend · Senior · 9 años de experiencia») y junto a ella el nombre y el primer apellido
- **AND** debajo ve sus cuatro tecnologías, «Banca», «Remoto», «Colombia» y la banda «2 semanas»
- **AND** el código del perfil aparece solo al pie de la tarjeta, en letra pequeña
- **AND** no ve fotografía, segundo apellido ni fecha de disponibilidad

#### Scenario: HU-153 · La disponibilidad venció y nadie la actualizó
- **GIVEN** un perfil publicado cuya fecha de disponibilidad ya pasó y que Talento Humano no toca desde hace más de 30 días
- **WHEN** el cliente ve su tarjeta
- **THEN** la banda dice «Por confirmar»
- **AND** en ningún lugar de la tarjeta dice «Inmediato» ni muestra la fecha vencida

#### Scenario: HU-153 · Más tecnologías de las que caben y sin sector
- **GIVEN** un perfil publicado con 8 tecnologías registradas y ningún sector
- **WHEN** el cliente ve su tarjeta
- **THEN** ve sus 5 primeras tecnologías en el orden en que Talento Humano las registró, y las 8 siguen disponibles en su ficha
- **AND** la tarjeta no muestra el sector, ni un título vacío, ni un hueco en su lugar

### Requirement: Las competencias del Sello Personal diferencian la tarjeta
La tarjeta SHALL mostrar las competencias del Sello Personal del perfil (hasta tres) marcadas como verificadas por Trycore, sin insignia, estado ni puntaje por dimensión Neural-Grid y sin ninguna señal de equivalencia entre perfiles. Sin Sello Personal, o con un sello fuera de contrato (más de tres competencias o una vacía), la tarjeta SHALL dibujarse sin el bloque, sin hueco ni texto de error, el resto de la lista SHALL mostrarse normalmente y, en el caso fuera de contrato, el servidor SHALL registrar el perfil para que Talento Humano lo corrija.

#### Scenario: HU-081 · Competencias como elemento diferenciador
- **GIVEN** una lista con dos perfiles publicados con Sello Personal distinto
- **WHEN** el cliente recorre sus tarjetas
- **THEN** cada tarjeta muestra las tres competencias del Sello Personal de su perfil
- **AND** las competencias aparecen marcadas como verificadas por Trycore
- **AND** ninguna tarjeta muestra una insignia, un estado ni un puntaje por dimensión Neural-Grid

#### Scenario: HU-081 · Perfil publicado sin Sello Personal
- **GIVEN** un perfil publicado sin ninguna competencia del Sello Personal registrada
- **WHEN** aparece su tarjeta en la lista
- **THEN** la tarjeta se muestra sin el bloque de competencias, sin título ni hueco vacío
- **AND** no aparece ningún texto de relleno ni ninguna competencia que no esté registrada

#### Scenario: HU-081 · Sello Personal con cuatro competencias
- **GIVEN** un perfil publicado cuyo Sello Personal registrado tiene cuatro competencias en vez de hasta tres
- **WHEN** aparece su tarjeta en la lista
- **THEN** la tarjeta se muestra sin el bloque de competencias, igual que un perfil sin Sello Personal
- **AND** no aparece ninguna competencia suelta, recortada ni un texto de error técnico
- **AND** el resto de la lista se muestra normalmente
- **AND** el servidor registra el perfil con el sello fuera de contrato para que Talento Humano lo corrija

#### Scenario: HU-081 · Sello Personal con una competencia vacía
- **GIVEN** un perfil publicado cuyo Sello Personal registrado tiene una competencia vacía o solo con espacios
- **WHEN** aparece su tarjeta en la lista
- **THEN** la tarjeta se muestra sin el bloque de competencias y el resto de la lista se muestra normalmente
- **AND** el servidor registra el perfil con el sello fuera de contrato

#### Scenario: HU-081 · Dos perfiles con las mismas tres competencias
- **GIVEN** dos perfiles publicados que comparten exactamente las mismas tres competencias
- **WHEN** aparecen juntos en la lista
- **THEN** cada tarjeta muestra sus competencias igual que cualquier otra
- **AND** ninguna tarjeta muestra una señal que sugiera que los dos perfiles son equivalentes o intercambiables

### Requirement: Evidencia criterio por criterio, también lo que no cumple
Con criterios de búsqueda activos, la tarjeta y el bloque «Frente a tu búsqueda» de la ficha SHALL mostrar una línea por criterio activo, con el mismo texto y el mismo orden, a partir de criterios ya resueltos (cumple / no cumple y el dato que lo sustenta). Cada línea SHALL salir de una plantilla fija por tipo de criterio y de los datos registrados del perfil, sin ninguna frase redactada ni inferida; un dato ausente SHALL ser no cumplido, nunca cumplido por omisión; las líneas que cumplen SHALL distinguirse a simple vista de las que no; no SHALL mostrarse porcentaje ni puntaje. Un tipo sin plantilla SHALL usar el texto genérico «✓ Cumple {criterio}» o «– No cumple {criterio}», nunca en blanco ni omitido, y SHALL dejar un registro técnico con el tipo. Sin criterios activos no SHALL aparecer ningún bloque de evidencia.

#### Scenario: HU-119 · Evidencia en la tarjeta
- **GIVEN** una búsqueda con los criterios «Banca» y «Seguros»
- **AND** un perfil publicado con 8 años declarados en Banca y ninguna experiencia declarada en Seguros
- **WHEN** el cliente mira ese perfil en su tarjeta de la lista de resultados
- **THEN** ve una línea por criterio activo, en este orden: «✓ Banca · 8 años declarados» y «– Sin experiencia declarada en Seguros»
- **AND** las líneas que cumple se distinguen a simple vista de las que no
- **AND** no ve ningún porcentaje ni puntaje de coincidencia

#### Scenario: HU-119 · Evidencia en el bloque «Frente a tu búsqueda» de la ficha
- **GIVEN** una búsqueda con los criterios «Banca» y «Seguros»
- **AND** un perfil publicado con 8 años declarados en Banca y ninguna experiencia declarada en Seguros
- **WHEN** el cliente mira ese perfil en el bloque «Frente a tu búsqueda» de su ficha
- **THEN** ve las mismas líneas, con el mismo texto y el mismo orden que en la tarjeta
- **AND** no ve ningún porcentaje ni puntaje de coincidencia

#### Scenario: HU-119 · Criterio de un tipo sin plantilla que cumple
- **GIVEN** una búsqueda con el criterio «Disponibilidad inmediata», de un tipo sin plantilla, resuelto como cumplido para un perfil publicado
- **WHEN** el cliente mira su tarjeta
- **THEN** la línea dice exactamente «✓ Cumple Disponibilidad inmediata», en el mismo lugar y con la misma distinción visual que las demás
- **AND** queda un registro técnico que nombra el tipo de criterio sin plantilla

#### Scenario: HU-119 · Criterio de un tipo sin plantilla que no cumple
- **GIVEN** una búsqueda con el criterio «Disponibilidad inmediata», de un tipo sin plantilla, resuelto como no cumplido para un perfil publicado
- **WHEN** el cliente mira su tarjeta
- **THEN** la línea dice exactamente «– No cumple Disponibilidad inmediata» y nunca aparece en blanco ni se omite
- **AND** queda un registro técnico que nombra el tipo de criterio sin plantilla

#### Scenario: HU-119 · Sin criterios activos
- **GIVEN** ningún criterio de búsqueda activo, como en la selección del correo antes de ampliar la búsqueda
- **WHEN** el cliente mira un perfil en su tarjeta o en su ficha
- **THEN** no aparece ningún bloque de evidencia, ni vacío ni con título
- **AND** no aparece ninguna línea de coincidencia deducida de la selección

#### Scenario: HU-119 · El perfil no tiene registrado el dato de un criterio
- **GIVEN** una búsqueda con el criterio «Inglés» y un perfil publicado sin ningún idioma registrado
- **WHEN** el cliente mira su tarjeta
- **THEN** la línea de ese criterio aparece como no cumplida («– Sin idioma declarado: Inglés»), nunca como cumplida por omisión
- **AND** el texto sale de los datos del perfil y de una plantilla fija, sin ninguna frase redactada ni inferida sobre la persona

#### Scenario: HU-119 · Cada tipo de criterio usa su plantilla fija
- **GIVEN** búsquedas con los criterios rol «Desarrollador backend», seniority «Senior», tecnología «Java», modalidad «Remoto» y país «Colombia»
- **AND** un perfil publicado con rol «Desarrollador backend», seniority «Semi-senior», Java en su stack, ninguna modalidad y país «México»
- **WHEN** el cliente mira su tarjeta
- **THEN** las líneas dicen exactamente «✓ Rol: Desarrollador backend», «– Seniority registrada: Semi-senior», «✓ Java en su stack declarado», «– Sin modalidad declarada: Remoto» y «– País registrado: México»
