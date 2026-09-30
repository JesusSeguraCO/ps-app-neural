# aterrizaje-curado Specification

## Purpose
Hace que el cliente aterrice frente a la selección que le armamos, con su razón y el estado real de cada perfil, pueda explorar el banco completo sin perder la curaduría y nunca encuentre un callejón sin salida ni un perfil omitido en silencio.

## Requirements

### Requirement: La selección con su razón
Con sesión válida en un enlace con selección, el portal SHALL mostrar, sin pasos intermedios, los mismos perfiles del enlace con la razón declarada de la selección referida al proyecto, y la opción de ampliar la búsqueda al banco completo. No SHALL deducir ni aplicar como filtro ningún rol ni criterio a partir de la selección.

#### Scenario: Selección de familias distintas
- **GIVEN** un enlace curado vigente con perfiles de familias distintas y un invitado que ya superó la puerta
- **WHEN** abre el enlace
- **THEN** ve los perfiles seleccionados con la razón, ningún rol ni criterio deducido aplicado como filtro y la opción de ampliar la búsqueda

### Requirement: Estado real de cada perfil, nunca omitido
Cada vez que se abre el enlace, el portal SHALL reevaluar el estado de sus perfiles y mostrar cada perfil que dejó de estar publicado en su lugar de la selección con la etiqueta de su estado real (pausado, archivado, colocado con la fecha en que se libera); ninguna posición de la selección SHALL quedar vacía sin una nota que la explique. Los perfiles que siguen publicados SHALL mostrarse con toda su información.

#### Scenario: Un perfil pausado desde el envío
- **GIVEN** una selección donde un perfil se pausó desde el envío
- **WHEN** carga el portal
- **THEN** los demás perfiles aparecen sin cambios y el pausado aparece en su lugar con la etiqueta «Pausado»

#### Scenario: Un perfil colocado en otro proyecto
- **GIVEN** una selección donde un perfil se colocó en otro proyecto tras generarse el enlace
- **WHEN** abre el enlace
- **THEN** ve el perfil colocado aparte con su estado real y la fecha en que se libera, y ninguna posición vacía sin nota

#### Scenario: Ningún perfil sigue publicado
- **GIVEN** una selección cuyos perfiles dejaron todos de estar publicados
- **WHEN** carga el portal
- **THEN** ve la lista completa con la etiqueta de estado de cada uno y una invitación a explorar el banco con el contexto del proyecto aplicado

### Requirement: Encuadre cuando el enlace no trae selección
Con sesión válida en un enlace sin selección, el portal SHALL mostrar antes del listado la pregunta «¿Qué necesita tu proyecto?» con los roles y categorías del banco publicado; elegir una opción SHALL filtrar el banco por ella, y seguir sin elegir SHALL mostrar el banco completo sin bloqueo. Una opción sin perfiles publicados SHALL indicarlo y ofrecer ampliar la búsqueda al banco completo.

#### Scenario: La pregunta de encuadre
- **WHEN** carga el portal en un enlace sin selección
- **THEN** ve la pregunta de encuadre con los roles y categorías del banco publicado antes del listado

#### Scenario: Elijo una opción
- **WHEN** elige una opción de rol o de categoría
- **THEN** ve el banco filtrado por esa opción

#### Scenario: Sigo sin elegir
- **WHEN** sigue al banco sin responder
- **THEN** ve el banco completo sin mensaje ni pantalla de bloqueo

#### Scenario: Opción sin perfiles publicados
- **GIVEN** una opción del encuadre sin perfiles publicados en este momento
- **WHEN** la elige
- **THEN** ve que hoy no hay perfiles publicados para esa opción y la opción de ampliar la búsqueda

### Requirement: Encabezado sin contexto inventado
Si el enlace identifica la cuenta pero no trae contexto de proyecto, el encabezado SHALL saludar con el nombre de la cuenta sin mostrar nombre de proyecto ni motivo de selección.

#### Scenario: Enlace sin contexto de proyecto
- **WHEN** carga el portal en un enlace sin contexto de proyecto
- **THEN** ve un saludo con el nombre de la cuenta y ningún nombre de proyecto ni motivo

### Requirement: Volver a la selección
Tras ampliar la búsqueda desde un enlace con selección, el portal SHALL ofrecer «Volver a la selección», que muestra de nuevo los perfiles del enlace con su razón y el estado real de cada uno, sin alterar el «Mi equipo» del invitado. En un enlace sin selección, la opción no SHALL aparecer.

#### Scenario: Vuelvo con Mi equipo guardado
- **GIVEN** un invitado que amplió la búsqueda y tiene perfiles guardados en su «Mi equipo»
- **WHEN** toca «Volver a la selección»
- **THEN** ve los perfiles del enlace con su razón y su «Mi equipo» conserva exactamente los mismos perfiles

#### Scenario: Perfiles archivados mientras exploraba
- **GIVEN** perfiles de la selección archivados mientras el invitado exploraba
- **WHEN** toca «Volver a la selección»
- **THEN** ve cada perfil archivado con la etiqueta de su estado y la opción de ampliar la búsqueda

#### Scenario: Nunca hubo selección
- **WHEN** un invitado de un enlace sin selección abre el banco completo
- **THEN** no ve la opción «Volver a la selección»

### Requirement: «Mi equipo» por invitado en el servidor
Cada invitado de un enlace SHALL tener su propio «Mi equipo» guardado en el servidor, ligado a su correo verificado y al enlace, vacío al primer ingreso e invisible para los demás invitados. (Sumar y quitar perfiles es alcance de EP-004.)

#### Scenario: Equipos aislados
- **GIVEN** dos invitados del mismo enlace, uno con perfiles guardados en su «Mi equipo»
- **WHEN** el otro entra por primera vez
- **THEN** su «Mi equipo» está vacío y no contiene los perfiles del primero

### Requirement: Enlaces que ya no abren
Un enlace revocado o con la dirección alterada SHALL mostrar una pantalla que explica sin lenguaje técnico cómo pedir un enlace nuevo, sin error crudo, sin la puerta y sin inventario. La revocación SHALL cortar las sesiones abiertas de ese enlace en la siguiente petición.

#### Scenario: Enlace revocado o alterado
- **WHEN** alguien abre la dirección de un enlace revocado o alterado
- **THEN** ve la pantalla explicativa y no ve error crudo, puerta ni inventario

#### Scenario: Revocación con sesión abierta
- **GIVEN** una sesión abierta en un enlace que Talento Humano revocó
- **WHEN** el invitado intenta ver un perfil de la selección
- **THEN** ve la pantalla de enlace revocado y ya no ve ningún perfil

### Requirement: El portal no se indexa ni sirve nombres sin sesión
Toda respuesta del portal SHALL llevar `noindex, nofollow` en cabecera y en la página, la exclusión de rastreadores SHALL cubrir todas sus direcciones, y ninguna respuesta servida sin sesión SHALL contener nombres de profesionales ni campos de la lista negra B.4.

#### Scenario: Un buscador rastrea el portal
- **WHEN** un motor de búsqueda solicita la dirección de un enlace curado o de cualquier página del portal
- **THEN** la respuesta lleva `noindex, nofollow` en cabecera y página, la exclusión de rastreadores la cubre y no contiene nombres de profesionales
