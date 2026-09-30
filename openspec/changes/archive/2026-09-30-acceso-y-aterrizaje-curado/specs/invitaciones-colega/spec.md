# Spec Delta

## Purpose

Permite que un cliente sume la segunda opinión de un colega sin que el enlace se convierta en una llave: el cliente pide la invitación desde el portal y Talento Humano la decide en el panel, con registro auditado.

## ADDED Requirements

### Requirement: Pedir la invitación de un colega
Un invitado con sesión SHALL poder pedir desde el portal que se invite a un colega indicando su correo; la petición SHALL quedar registrada como pendiente y visible para quien la pidió con su estado (pendiente, aprobada o rechazada). Mientras no se apruebe, el colega no SHALL tener acceso.

#### Scenario: Petición pendiente
- **GIVEN** un invitado que pidió invitar a su colega y Talento Humano aún no decide
- **WHEN** vuelve a entrar al portal
- **THEN** ve la petición con el correo del colega marcada como pendiente y el colega sigue sin acceso

#### Scenario: Petición rechazada
- **GIVEN** una petición que Talento Humano rechazó
- **WHEN** quien la pidió vuelve a entrar al portal
- **THEN** ve que la invitación no se aprobó y el contacto de Trycore a quien consultar, y esa persona sigue sin acceso

### Requirement: Reenviar el enlace no da acceso
Un correo que no está en la lista de invitados no SHALL obtener acceso aunque tenga el enlace; la puerta SHALL darle la respuesta neutra de `acceso-cliente` y no SHALL enviarle código.

#### Scenario: Colega sin invitación con el enlace reenviado
- **WHEN** el colega sin invitación pide el código con su correo
- **THEN** ve el mensaje neutro, no le llega ningún código y no ve ningún perfil

### Requirement: El colega aprobado ve lo mismo, con su propio equipo
Un colega cuya invitación se aprobó SHALL entrar con su correo y su código a la misma selección y el mismo contexto de cuenta que quien lo invitó, con un «Mi equipo» propio que empieza vacío y no contiene los perfiles guardados por quien lo invitó.

#### Scenario: Invitación aprobada
- **GIVEN** una petición aprobada y un colega que tiene el enlace
- **WHEN** el colega completa el ingreso con su correo y su código
- **THEN** ve la misma selección y el mismo contexto de cuenta, su «Mi equipo» empieza vacío y no aparecen los perfiles guardados por quien lo invitó

### Requirement: Decidir las peticiones en el panel
La administradora de inventario SHALL ver en el panel las peticiones de invitación de cada enlace y poder aprobarlas o rechazarlas. Aprobar SHALL añadir el correo a la lista de invitados del enlace con origen «invitación aprobada»; rechazar SHALL exigir un motivo y no añadir el correo. Cada decisión SHALL registrarse en la auditoría del panel con quién decidió, cuándo, qué enlace, qué correo y, al rechazar, el motivo; la petición SHALL dejar de aparecer como pendiente.

#### Scenario: Apruebo la petición
- **GIVEN** una petición pendiente en un enlace vigente
- **WHEN** la administradora la aprueba
- **THEN** el correo queda en la lista de invitados marcado como invitación aprobada, la auditoría registra quién, cuándo, enlace y correo, y la petición deja de estar pendiente

#### Scenario: Rechazo la petición
- **GIVEN** una petición pendiente
- **WHEN** la administradora la rechaza escribiendo el motivo
- **THEN** el correo no se añade, la auditoría registra quién, cuándo, enlace, correo y motivo, y quien pidió ve en el portal que no se aprobó

### Requirement: No se aprueba sobre un enlace no vigente
Una petición de un enlace vencido o revocado SHALL mostrarse marcada con el estado del enlace y sin la opción de aprobar mientras el enlace no esté vigente.

#### Scenario: Petición en un enlace vencido o revocado
- **WHEN** la administradora abre la lista de peticiones pendientes con una petición de un enlace no vigente
- **THEN** ve la petición marcada con el estado del enlace y sin opción de aprobarla

### Requirement: Sin invitados duplicados
Una petición cuyo correo ya está invitado en ese enlace SHALL mostrarse indicando que ya tiene acceso, y la lista de invitados SHALL conservar ese correo una sola vez.

#### Scenario: El correo ya está invitado
- **WHEN** la administradora abre una petición cuyo correo ya está en la lista de invitados
- **THEN** ve que ese correo ya tiene acceso y la lista sigue teniéndolo una sola vez
