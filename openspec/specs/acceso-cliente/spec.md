# acceso-cliente Specification

## Purpose
Da acceso nominal al cliente sin registro ni contraseña: solo los correos invitados en un enlace entran, con un código de un uso a su buzón, y quien vuelve tarde puede recuperar el acceso sin abrir una puerta trasera.

## Requirements

### Requirement: La puerta explica por qué pide el correo
Antes de pedir el correo, la puerta SHALL explicar que los perfiles incluyen nombre y trayectoria de profesionales reales.

#### Scenario: Primera visita al enlace
- **WHEN** una persona sin sesión abre un enlace vigente
- **THEN** ve la explicación de por qué se le pide el correo y el campo para escribirlo

### Requirement: Entrada con correo invitado y código de un uso
El portal SHALL dejar entrar solo a correos de la lista de invitados del enlace, mediante un código de un uso enviado a ese buzón, sin crear usuario ni contraseña; al entrar, la persona SHALL ver el nombre de su cuenta y el contexto de su proyecto. La apertura del enlace SHALL registrarse al verificar el código, no al cargar la página.

#### Scenario: Correo invitado y código válido
- **GIVEN** un correo invitado sin sesión de ese enlace en el dispositivo
- **WHEN** completa la verificación con el código de un uso que llegó a su buzón
- **THEN** entra al portal, ve el nombre de su cuenta y el contexto de su proyecto y no se le pidió usuario ni contraseña

### Requirement: Respuesta neutra para correos no invitados
Al pedir el código, el portal SHALL mostrar el mismo mensaje a un correo invitado y a uno no invitado («Si tu correo está invitado, te llegó un código. Si no te llega, pídele a quien te compartió el enlace que solicite tu invitación»), con un tiempo de respuesta indistinguible, y no SHALL enviar código a un correo no invitado aunque sea de la misma empresa.

#### Scenario: Correo no invitado de la misma empresa
- **WHEN** un correo no invitado pide el código
- **THEN** ve el mensaje idéntico al de un invitado, no le llega ningún código y no ve ningún perfil

### Requirement: Códigos que no sirven
Un código equivocado, vencido o ya usado no SHALL dar acceso; el portal SHALL explicarlo en lenguaje llano y ofrecer pedir un código nuevo en la misma pantalla.

#### Scenario: Código no válido
- **GIVEN** un correo invitado que pidió un código
- **WHEN** ingresa un código equivocado, vencido o ya usado
- **THEN** no entra, ve en lenguaje llano que el código no es válido y ve la opción de pedir uno nuevo

### Requirement: Límite de intentos
Tras cinco fallos de código para un mismo enlace y correo, el portal SHALL bloquear la verificación durante una espera, incluso con el código correcto, e indicar sin tecnicismos que debe esperar y a quién contactar, sin revelar si el correo está invitado.

#### Scenario: Intentos agotados
- **GIVEN** cinco fallos previos con este enlace y este correo y la espera sin terminar
- **WHEN** ingresa un código, incluso el correcto
- **THEN** no entra y ve que debe esperar y a quién contactar, sin revelar si el correo está invitado

### Requirement: Sesión acotada al enlace y al dispositivo
Una verificación correcta SHALL abrir una sesión de hasta 30 días válida solo para ese enlace y ese dispositivo; la sesión SHALL dejar de valer en cuanto el enlace vence o se revoca.

#### Scenario: Alcance de la sesión
- **GIVEN** una persona que entró con su correo y su código hace menos de 30 días
- **WHEN** abre el mismo enlace
- **THEN** entra directamente si el enlace sigue vigente y es el mismo dispositivo; ve la puerta si es otro dispositivo; ve la pantalla de renovación si el enlace venció; y ve la pantalla de enlace revocado si se revocó

### Requirement: Explicación del enlace vencido
Al abrir un enlace vencido, el portal SHALL explicar en lenguaje llano que venció, sin error técnico, y ofrecer en la misma pantalla un campo para pedir un enlace nuevo con el correo.

#### Scenario: Abro un enlace vencido
- **WHEN** abro un enlace que venció
- **THEN** veo la explicación y el campo para pedir un enlace nuevo

### Requirement: Renovación solo al buzón de un invitado
Al pedir un enlace nuevo, el portal SHALL responder siempre «Si tu correo estaba invitado, te enviamos un enlace nuevo a tu buzón». Si el correo estaba invitado SHALL generarse un enlace nuevo, sin consultar sistemas externos, que SHALL llegar únicamente al buzón y nunca mostrarse en pantalla. Dentro de la ventana de espera no SHALL generarse un segundo enlace. *(2026-09-29, sponsor: ya no se consulta si la cuenta está activa en HubSpot; toda petición avisa a Talento Humano, ver «Aviso de renovaciones a Talento Humano».)*

#### Scenario: Invitado pide un enlace nuevo
- **GIVEN** un correo invitado en el enlace vencido
- **WHEN** pide un enlace nuevo
- **THEN** ve el mensaje neutro, el enlace nuevo llega a su buzón y nunca aparece en pantalla

#### Scenario: Petición repetida en la ventana de espera
- **GIVEN** una petición de enlace nuevo hecha hace pocos minutos con la ventana activa
- **WHEN** pide otro con el mismo correo
- **THEN** no se genera un segundo enlace y ve que el primero ya va en camino

#### Scenario: Quien pide no estaba invitado
- **GIVEN** un enlace vencido reenviado a un correo que no está en su lista de invitados
- **WHEN** ese correo pide un enlace nuevo
- **THEN** ve el mensaje neutro y no se genera ni se envía ningún enlace

#### Scenario: Vuelvo con la sesión de un enlace vencido
- **GIVEN** una sesión de este dispositivo cuyo enlace venció
- **WHEN** abro el portal sin el enlace del correo
- **THEN** veo la explicación del vencimiento con su fecha y puedo pedir un enlace nuevo con el mismo resultado

### Requirement: Aviso de renovaciones a Talento Humano
Cada petición de enlace nuevo SHALL avisarse a Talento Humano por correo y SHALL quedar en la bandeja de renovaciones del panel con la cuenta, el proyecto, el correo de quien la pidió, cuándo, el enlace vencido y su resultado («Enlace nuevo enviado» con el código del enlace nuevo, «No estaba invitado · no se envió enlace» o «No se pudo enviar el enlace nuevo»). Una petición repetida dentro de la ventana de espera no SHALL crear otra fila ni otro correo. La respuesta al cliente SHALL seguir siendo la misma para invitados y no invitados. (HU-146)

#### Scenario: Aviso de un invitado
- **GIVEN** una persona invitada que pidió un enlace nuevo y lo recibió
- **WHEN** Talento Humano abre la bandeja de renovaciones
- **THEN** ve la petición marcada «Enlace nuevo enviado» con el código del enlace nuevo, y recibió un correo con esos datos

#### Scenario: Aviso de quien no estaba invitado
- **GIVEN** alguien cuyo correo no está invitado que pidió un enlace nuevo
- **WHEN** Talento Humano abre la bandeja
- **THEN** ve la petición marcada «No estaba invitado · no se envió enlace» con el correo que escribió, y recibió un correo que lo dice

#### Scenario: Entrega fallida
- **GIVEN** un enlace nuevo cuyo correo no se pudo entregar
- **WHEN** Talento Humano abre la bandeja
- **THEN** ve la petición marcada «No se pudo enviar el enlace nuevo»

#### Scenario: Petición repetida
- **GIVEN** una petición dentro de la ventana de espera
- **WHEN** la misma persona vuelve a pedir
- **THEN** la bandeja sigue con una sola fila y no llega un segundo correo

#### Scenario: Revocar desde la bandeja
- **GIVEN** una petición con «Enlace nuevo enviado»
- **WHEN** la administradora revoca el enlace nuevo desde esa petición, con motivo opcional
- **THEN** la petición muestra «Enlace revocado», quien lo tenga abierto pierde el acceso en su siguiente petición y queda en la auditoría con quién, cuándo, qué enlace y el motivo
