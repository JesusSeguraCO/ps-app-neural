# Spec Delta

## Purpose

Da a cada perfil un solo sitio para la evidencia de su validación, en el formato en que existe y fuera del alcance del cliente, y ahorra a Talento Humano transcribir el reporte: se precarga desde la modalidad de prueba y siempre lo confirma una persona.

## ADDED Requirements

### Requirement: Adjuntar el artefacto en su formato
La administradora de inventario SHALL poder adjuntar a una validación del perfil un documento, una transcripción en texto o el enlace a un repositorio, de hasta 64 MB por archivo; el artefacto SHALL quedar en almacenamiento privado, asociado a esa validación y recuperable desde el panel. Un video o un archivo de más de 64 MB SHALL rechazarse explicando lo que se admite y que el proyecto no opera con video, sin alterar nada de lo ya registrado del perfil. El sistema no SHALL leer, resumir ni extraer datos del artefacto, ni enviarlo a ningún servicio externo.

#### Scenario: HU-131 · El artefacto queda asociado al perfil
- **GIVEN** una administradora que tiene el artefacto de una validación
- **WHEN** lo adjunta al perfil
- **THEN** queda almacenado internamente y asociado a esa validación
- **AND** puede recuperarlo después desde el panel

#### Scenario: HU-131 · Formato o tamaño no admitido
- **GIVEN** un perfil abierto con datos ya registrados y un archivo de video o de más de 64 MB
- **WHEN** la administradora lo adjunta
- **THEN** el panel lo rechaza y le dice que admite un documento, una transcripción en texto o el enlace a un repositorio, de hasta 64 MB por archivo, y que el proyecto no opera con video
- **AND** lo demás que ya había registrado del perfil sigue intacto

### Requirement: Solo la administradora descarga el artefacto, solo desde el panel
Abrir el artefacto desde el perfil en el panel SHALL entregarlo, a una sesión con rol administrador de inventario, tal como se adjuntó y en su formato original, mediante una dirección de descarga de vida corta emitida tras autorizar. A una sesión con rol observador el panel SHALL mostrar que el artefacto existe, sin enlace de descarga, y SHALL rechazar la descarga explicando que solo la administradora de inventario puede hacerlo.

#### Scenario: HU-131 · Descargar y ver el artefacto desde el panel
- **GIVEN** un perfil con un artefacto adjunto y una sesión en el panel como administradora de inventario
- **WHEN** abre el artefacto desde el perfil en el panel
- **THEN** lo descarga y lo ve tal como se adjuntó, en su formato original
- **AND** el panel no lo resume, no lo interpreta ni extrae datos de él

#### Scenario: HU-131 · El observador ve que existe pero no lo descarga
- **GIVEN** un perfil con un artefacto adjunto y una sesión en el panel con rol observador
- **WHEN** intenta descargar el artefacto
- **THEN** el panel no se lo entrega y le dice que solo la administradora de inventario puede descargarlo
- **AND** en el perfil ve que el artefacto existe, sin enlace de descarga

### Requirement: El artefacto nunca se publica
La ficha del portal SHALL mostrar el reporte estructurado de la validación y nunca el artefacto crudo: sin enlace ni referencia a él, y la dirección de descarga del artefacto no SHALL responder a una sesión del portal.

#### Scenario: HU-131 · El artefacto nunca se publica
- **GIVEN** un perfil publicado con un artefacto adjunto
- **WHEN** el cliente abre la ficha
- **THEN** ve el reporte estructurado y nunca el artefacto crudo
- **AND** la ficha no incluye enlace ni referencia al artefacto
- **AND** la dirección de descarga del artefacto no responde desde una sesión del portal

### Requirement: Borrador del reporte desde la modalidad de prueba
Pedir el borrador SHALL precargar, con una plantilla determinista y sin ningún servicio externo, el enunciado del reto, los entregables esperados y los criterios evaluados desde la modalidad de prueba elegida del perfil, marcando en cada campo que salió de la modalidad; no SHALL necesitar artefacto adjunto. Fecha y resultado los escribe una persona. El borrador SHALL quedar para revisión y no SHALL llegar a la ficha sin confirmación humana; un campo corregido SHALL guardarse con el valor escrito por la persona, y descartar el borrador SHALL dejar la ficha sin ningún campo de él. Sin modalidad de prueba elegida, el panel no SHALL precargar nada, SHALL explicar que el borrador sale de la modalidad y SHALL llevar al selector de modalidad del perfil.

#### Scenario: HU-140 · Borrador por plantilla para confirmación
- **GIVEN** un perfil con la modalidad de prueba elegida del catálogo
- **WHEN** la administradora pide el borrador
- **THEN** el sistema precarga desde la modalidad de prueba el enunciado del reto, los entregables esperados y los criterios evaluados
- **AND** indica en cada uno de esos campos que salió de la modalidad de prueba
- **AND** el borrador queda para su revisión y nunca se publica sin que ella lo confirme

#### Scenario: HU-140 · El perfil no tiene modalidad de prueba elegida
- **GIVEN** un perfil en borrador que todavía no tiene modalidad de prueba elegida
- **WHEN** la administradora pide el borrador
- **THEN** el panel no precarga nada y le explica que el borrador sale de la modalidad de prueba
- **AND** la lleva al selector de modalidad del perfil

#### Scenario: HU-140 · Corregir un campo que el artefacto no sostiene
- **GIVEN** un borrador precargado en revisión con un campo que describe algo que no está en el artefacto
- **WHEN** la administradora corrige ese campo
- **THEN** la ficha guarda el valor que ella escribió, no el que traía la plantilla

#### Scenario: HU-140 · Descartar un borrador que el artefacto no sostiene
- **GIVEN** un borrador precargado en revisión con un campo que describe algo que no está en el artefacto
- **WHEN** la administradora descarta el borrador
- **THEN** la ficha no recibe ningún campo de ese borrador
