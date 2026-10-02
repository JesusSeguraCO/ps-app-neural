# contacto-trycore Specification

## Purpose
Permite que el portal nombre siempre a la persona o al buzón correcto de Trycore cuando el cliente necesita escribir a alguien, configurándolo desde el panel sin esperar un cambio de código cuando cambia quien atiende.

## Requirements

### Requirement: Contacto configurable desde el panel
La administradora de inventario SHALL poder guardar desde el panel el contacto que ve el cliente: correo obligatorio `@trycore.com`, y nombre y cargo opcionales. Las pantallas de contacto del portal —invitación rechazada, enlace revocado, «Abre tu enlace», intentos agotados y «Recibimos tu petición»— SHALL mostrar el contacto vigente en su siguiente carga, y el cambio SHALL quedar en la auditoría del panel con quién, cuándo, el valor anterior y el nuevo. Un correo que no es `@trycore.com` SHALL rechazarse sin guardar y el portal SHALL seguir con el contacto anterior. Mientras nadie lo configure, el contacto vigente SHALL ser el buzón `people.service@trycore.com` sin nombre ni cargo.

#### Scenario: HU-147 · Cambio el contacto y el portal lo muestra
- **GIVEN** una administradora de inventario con su correo inscrito y el buzón `people.service@trycore.com` sin nombre ni cargo como contacto vigente
- **WHEN** guarda como contacto a «Eida Tinjacá», cargo «Coordinación de Servicio», correo `eida.tinjaca@trycore.com`
- **THEN** las pantallas de contacto del portal muestran «Eida Tinjacá, Coordinación de Servicio: eida.tinjaca@trycore.com» en su siguiente carga
- **AND** queda un registro en la auditoría del panel con quién cambió el contacto, cuándo, y el valor anterior y el nuevo

#### Scenario: HU-147 · Correo que no es de Trycore
- **GIVEN** una administradora de inventario con su correo inscrito
- **WHEN** intenta guardar como correo de contacto `eida.tinjaca@gmail.com`
- **THEN** el panel no lo guarda y le dice que el correo de contacto debe ser `@trycore.com`
- **AND** el portal sigue mostrando el contacto anterior

### Requirement: El observador ve el contacto sin editarlo
Con rol observador, la configuración del contacto SHALL mostrarse en modo lectura, sin controles de edición, y un cambio enviado por petición directa SHALL rechazarse sin cambiar el contacto ni dejar ningún cambio en la auditoría.

#### Scenario: HU-147 · Quien observa ve el contacto sin poder editarlo
- **GIVEN** una persona con su correo inscrito como observadora
- **WHEN** abre la configuración del contacto
- **THEN** ve el contacto vigente en modo lectura, sin controles para editarlo

#### Scenario: HU-147 · Quien observa no puede forzar un cambio
- **GIVEN** una sesión del panel con rol observadora
- **WHEN** envía un cambio del contacto saltándose la pantalla (petición directa con su sesión)
- **THEN** el panel la rechaza
- **AND** el contacto vigente no cambia y no queda ningún cambio en la auditoría

### Requirement: Contacto solo con correo
Si el contacto guardado no tiene nombre ni cargo, las pantallas de contacto del portal SHALL mostrar «escribe a People Service: <correo>» y nunca un nombre vacío, un cargo suelto ni un error.

#### Scenario: HU-147 · Se guardó solo un correo, sin nombre ni cargo
- **GIVEN** un contacto guardado con correo `servicio.clientes@trycore.com` sin nombre ni cargo
- **WHEN** una persona invitada abre en el portal una pantalla de contacto
- **THEN** ve «escribe a People Service: servicio.clientes@trycore.com»
- **AND** nunca ve un nombre vacío, un cargo suelto ni un error
