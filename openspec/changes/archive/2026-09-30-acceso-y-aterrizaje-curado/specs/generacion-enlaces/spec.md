# Spec Delta

## Purpose

Permite que la administradora de inventario proponga a una cuenta exactamente los perfiles que pensó para ella, con su razón y sus invitados, mediante un enlace curado registrado y con vigencia.

## ADDED Requirements

### Requirement: Generar un enlace con perfiles elegidos
Desde el panel, la administradora de inventario SHALL poder seleccionar perfiles publicados de cualquier familia para una cuenta, escribir la razón de la selección, confirmar los correos invitados y generar el enlace. El enlace SHALL guardarse como lista explícita de códigos de perfil (no como criterios de filtro), con vigencia de 30 días por omisión y editable, y SHALL quedar registrado con la cuenta, la razón, los correos invitados, quién lo generó y su vigencia.

#### Scenario: Selección heterogénea
- **GIVEN** una administradora de inventario con sesión en el panel que seleccionó un gerente, un desarrollador y un QA para una cuenta, escribió la razón y confirmó los invitados
- **WHEN** genera el enlace
- **THEN** el enlace contiene exactamente esos tres perfiles como lista de códigos, la vigencia muestra 30 días editable y queda registrado con cuenta, razón, invitados, autora y vigencia

### Requirement: Sin razón no hay enlace
El sistema no SHALL emitir un enlace sin razón de selección y SHALL explicar que sin razón el cliente recibe un catálogo y no una curaduría.

#### Scenario: Falta la razón
- **GIVEN** perfiles y cuenta elegidos sin razón escrita
- **WHEN** la administradora intenta generar el enlace
- **THEN** el enlace no se emite y se muestra la explicación

### Requirement: Solo perfiles publicados
El sistema no SHALL emitir un enlace que incluya un perfil no publicado y SHALL indicar cuál es.

#### Scenario: Un perfil en borrador
- **GIVEN** una selección donde uno de los perfiles está en borrador
- **WHEN** la administradora intenta generar el enlace
- **THEN** el sistema indica qué perfil no está publicado y no emite el enlace

### Requirement: Invitados escritos a mano, sin duplicar
Al preparar los invitados, la administradora SHALL escribir uno o más correos; el sistema SHALL normalizarlos y guardarlos una sola vez, y no SHALL emitirse un enlace sin al menos un correo invitado. La generación no SHALL depender de HubSpot: la cuenta se identifica por su nombre.

#### Scenario: Varios correos de la cuenta
- **GIVEN** la administradora escribió el correo del contacto de la cuenta
- **WHEN** añade otro correo, como el del arquitecto de la cuenta
- **THEN** el enlace queda con los dos correos invitados, cada uno una sola vez

#### Scenario: Ningún correo invitado
- **GIVEN** no se añadió ningún correo invitado
- **WHEN** la administradora intenta generar el enlace
- **THEN** el enlace no se emite y se indica que necesita al menos un correo invitado

### Requirement: El token del enlace nunca se guarda en claro
El enlace SHALL identificarse por un token aleatorio opaco que viaja en el fragmento de la URL (`/e/#t=…`); la base de datos SHALL guardar solo su hash.

#### Scenario: Fuga de la base de datos
- **WHEN** se lee la tabla de enlaces
- **THEN** no contiene ningún token utilizable, solo su hash
