# acceso-panel Specification

## Purpose
Permite que el personal de Trycore entre al panel con su correo corporativo inscrito y un código de un uso, sin contraseñas propias, de modo que el acceso muere con el buzón y el panel nunca es alcanzable desde el portal del cliente.

## Requirements

### Requirement: Entrada con correo inscrito y código de un uso
El panel SHALL permitir entrar solo a correos `@trycore.com` inscritos en la lista del panel, mediante un código de un uso enviado a ese buzón, y SHALL abrir la sesión con el rol inscrito sin pedir ni guardar contraseñas. La identidad de la sesión SHALL quedar disponible para el registro de auditoría.

#### Scenario: Entrada con correo inscrito
- **GIVEN** un correo `@trycore.com` inscrito con rol de administradora de inventario
- **WHEN** completa la entrada con el código de un uso que llegó a ese buzón
- **THEN** entra al panel con su rol, sin que se le pida contraseña, y el panel la identifica por su correo en la auditoría

#### Scenario: Buzón corporativo desactivado
- **GIVEN** una persona cuyo buzón corporativo se desactivó al salir de la empresa
- **WHEN** intenta entrar al panel
- **THEN** el código no le llega, no puede entrar y la auditoría no registra ninguna desactivación manual de su acceso

### Requirement: Respuesta idéntica para correos no inscritos
Al pedir el código, el panel SHALL responder con el mismo mensaje a un correo inscrito y a uno no inscrito («si tu correo tiene acceso, te llegó un código») e indicar a quién pedir acceso; a un correo no inscrito no SHALL enviarse ningún código.

#### Scenario: Correo sin inscribir
- **WHEN** alguien escribe un correo `@trycore.com` no inscrito para entrar
- **THEN** ve el mismo mensaje que vería un correo inscrito y a quién pedir el acceso, no le llega ningún código y no ve inventario ni datos de profesionales

### Requirement: Sesión de una jornada
La sesión del panel SHALL caducar a las 12 horas desde su apertura y tras 60 minutos de inactividad; al caducar, el panel SHALL pedir un código nuevo.

#### Scenario: Sesión abierta cuando el buzón se desactiva
- **GIVEN** una sesión abierta en el panel y un buzón corporativo que se desactiva
- **WHEN** pasan doce horas desde que se abrió la sesión
- **THEN** la sesión caducó y el panel pide un código nuevo, que ya no puede recibirse

#### Scenario: Inactividad
- **WHEN** una sesión del panel pasa 60 minutos sin actividad
- **THEN** la siguiente petición redirige a `/acceso`

### Requirement: El panel no se alcanza desde el portal
El panel SHALL vivir en un host propio que el portal nunca expone: ninguna página, enlace, redirección ni recurso del portal SHALL llevar al panel.

#### Scenario: El cliente busca el panel desde el portal
- **GIVEN** un cliente con el enlace del portal
- **WHEN** intenta llegar al panel desde ahí
- **THEN** no encuentra ninguna ruta del portal que lo lleve al panel

### Requirement: Autorización por rol en cada acción del panel
Cada endpoint mutante del panel SHALL declarar la acción que ejerce y SHALL rechazar con 403, sin cambios, a un rol que no tiene esa acción en la matriz de permisos.

#### Scenario: Observador intenta una acción de administradora
- **WHEN** un usuario con rol de observador invoca una acción reservada a la administradora
- **THEN** la respuesta es 403 y no cambia ningún dato
