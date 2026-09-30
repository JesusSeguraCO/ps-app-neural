# Spec Delta

## MODIFIED Requirements

### Requirement: Autorización por rol en cada acción del panel
Cada endpoint mutante del panel SHALL declarar la acción que ejerce y SHALL rechazar con 403, sin cambios, a un rol que no tiene esa acción en la matriz de permisos. El rechazo SHALL explicar que el rol de la sesión es de consulta y SHALL registrar el intento en la auditoría del panel como evento de acceso rechazado (quién, cuándo, qué acción y sobre qué recurso), distinto de un cambio: el registro de cambios del recurso no gana ninguna entrada.

#### Scenario: Observador intenta una acción de administradora
- **WHEN** un usuario con rol de observador invoca una acción reservada a la administradora
- **THEN** la respuesta es 403 y no cambia ningún dato

#### Scenario: HU-124 · Intento de escritura por ruta directa
- **GIVEN** una persona con rol observador
- **WHEN** llega por una dirección de edición que alguien le pasó
- **THEN** el panel rechaza la acción y explica que su rol es de consulta
- **AND** el intento queda en el registro de auditoría

## ADDED Requirements

### Requirement: Consulta del observador
Con rol observador, el panel SHALL mostrar el inventario, los enlaces de acceso generados y los perfiles colocados sin ningún control de edición, publicación ni importación. Al intentar editar un dato, el panel SHALL explicar que el rol es de consulta y ofrecer avisar a quien administra el inventario con el perfil ya identificado en el aviso. (La demanda y la cobertura se añaden a esta consulta cuando existan, con EP-010.)

#### Scenario: HU-124 · Consulta completa
- **GIVEN** una persona con rol observador
- **WHEN** entra al panel
- **THEN** ve el inventario, los enlaces de acceso generados y los perfiles colocados
- **AND** no ve ningún control de edición, publicación ni importación

#### Scenario: HU-124 · Necesito un cambio que no puedo hacer
- **GIVEN** una persona con rol observador que ve un dato desactualizado en un perfil
- **WHEN** intenta editarlo
- **THEN** el panel le explica que su rol es de consulta
- **AND** le ofrece un botón para avisar a quien administra el inventario, con el perfil ya identificado en el aviso

### Requirement: Lista de acceso administrada desde el panel
Solo el rol administrador de inventario SHALL poder inscribir, cambiar de rol y dar de baja desde el panel los correos que entran, y solo correos `@trycore.com`; un correo de otro dominio SHALL rechazarse sin cambiar la lista. Inscribir SHALL dejar el correo en la lista con su rol y, desde ese momento, al pedir entrar le SHALL llegar un código de un uso. Dar de baja SHALL sacarlo de los inscritos activos (sin borrado físico) y, desde entonces, al pedir entrar no le SHALL llegar código y el panel SHALL responderle igual que a un correo nunca inscrito. Cada alta, cambio de rol y baja SHALL quedar en la auditoría con quién, cuándo y, en el cambio de rol, el rol anterior y el nuevo.

#### Scenario: HU-151 · Inscribo un correo con su rol
- **GIVEN** una administradora de inventario con sesión y el correo `analista.mercadeo@trycore.com` sin inscribir
- **WHEN** lo inscribe con el rol observador
- **THEN** el correo aparece en la lista de acceso con el rol observador
- **AND** al pedir entrar al panel con ese correo le llega un código de un uso
- **AND** el alta queda en el registro de auditoría con quién la hizo y cuándo

#### Scenario: HU-151 · Correo que no es @trycore.com
- **GIVEN** una administradora de inventario con sesión
- **WHEN** intenta inscribir el correo `eida.tinjaca@gmail.com`
- **THEN** el panel no lo inscribe y le dice que solo admite correos `@trycore.com`
- **AND** la lista de acceso queda igual

### Requirement: Bajar de rol o dar de baja corta la sesión
Cambiar a observador a una administradora o dar de baja un correo con una sesión abierta SHALL cortar esa sesión en su siguiente petición al panel, sin esperar a que caduque la jornada, y obligarla a volver a entrar.

#### Scenario: HU-151 · Paso a observador a otra administradora
- **GIVEN** una administradora de inventario con sesión y otra administradora activa con una sesión abierta
- **WHEN** le cambia el rol a observador
- **THEN** la lista de acceso muestra el correo con su nuevo rol
- **AND** en su siguiente petición al panel su sesión se corta y tiene que volver a entrar
- **AND** el cambio queda en el registro de auditoría con quién lo hizo, cuándo, el rol anterior y el nuevo

#### Scenario: HU-151 · Doy de baja un correo inscrito
- **GIVEN** una administradora de inventario con sesión y un correo inscrito que ya no debe entrar y tiene una sesión abierta
- **WHEN** lo da de baja
- **THEN** el correo deja de aparecer entre los inscritos activos
- **AND** en su siguiente petición al panel su sesión se corta
- **AND** al pedir entrar con ese correo ya no le llega código y el panel responde igual que a un correo no inscrito
- **AND** la baja queda en el registro de auditoría con quién la hizo y cuándo

### Requirement: El panel nunca queda sin administradora
Ningún cambio de rol ni baja SHALL dejar la lista sin al menos un correo activo con rol administrador de inventario; el panel SHALL impedirlo y explicar por qué, sin cambiar nada.

#### Scenario: HU-151 · El panel nunca se queda sin administrador
- **GIVEN** la única administradora de inventario activa de la lista
- **WHEN** intenta cambiarse el rol a observador
- **THEN** el panel lo impide y le explica que el panel no puede quedarse sin ningún administrador activo
- **AND** sigue inscrita con el rol de administradora de inventario
