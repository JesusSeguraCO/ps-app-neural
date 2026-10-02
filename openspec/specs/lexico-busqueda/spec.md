# lexico-busqueda Specification

## Purpose
Permite que Talento Humano enseñe a la búsqueda cómo habla cada cliente, registrando equivalencias entre términos y valores del catálogo desde el panel, con propuestas del modelo que solo entran con aprobación humana.

## Requirements

### Requirement: Equivalencias administrables sin despliegue
La administradora de inventario SHALL poder registrar un término del cliente con su equivalencia en un valor existente del catálogo de roles, tecnologías o sectores; las búsquedas siguientes SHALL reconocerlo sin despliegue. El léxico SHALL apuntar solo a valores existentes del catálogo: una equivalencia hacia un valor inexistente SHALL rechazarse ofreciendo los valores del catálogo.

#### Scenario: HU-139 · Término del cliente con su equivalencia
- **GIVEN** un término que los clientes escriben y que el banco nombra de otro modo
- **WHEN** la administradora lo registra con su equivalencia en rol, tecnología o sector
- **THEN** las búsquedas siguientes lo reconocen
- **AND** el cambio no exige despliegue

#### Scenario: HU-139 · Equivalencia a un valor que no existe en el catálogo
- **GIVEN** una administradora que intenta equiparar un término a un valor inexistente en el catálogo
- **WHEN** guarda la equivalencia
- **THEN** el panel la rechaza y le ofrece los valores del catálogo
- **AND** el léxico no queda apuntando a un valor vacío

### Requirement: El modelo propone, una persona aprueba
Periódicamente el sistema SHALL pedir a Gemini, desde el servidor, propuestas de equivalencias a partir de las consultas sin coincidencia del período; al modelo SHALL viajar solo el texto de las consultas y la taxonomía, nunca datos de perfiles (se excluyen las consultas que contienen nombres o apellidos de perfiles y las de sesiones que eligieron no usar servicio externo). Cada propuesta SHALL quedar pendiente hasta que una persona la apruebe (tal cual o editada) o la rechace; una propuesta pendiente o rechazada no SHALL afectar a las búsquedas y una rechazada no SHALL volver a ofrecerse.

#### Scenario: HU-139 · Aprobar una propuesta del modelo, tal cual o editándola
- **GIVEN** una equivalencia nueva que Gemini propuso a partir de las consultas sin coincidencia del período
- **WHEN** la administradora aprueba la propuesta, con o sin editarla antes de confirmar
- **THEN** la equivalencia, tal como quedó, entra al léxico
- **AND** las búsquedas siguientes la reconocen

#### Scenario: HU-139 · Rechazar una propuesta del modelo
- **GIVEN** una equivalencia nueva que Gemini propuso a partir de las consultas sin coincidencia del período
- **WHEN** la administradora la rechaza
- **THEN** no entra al léxico y deja de ofrecerse como propuesta
- **AND** ninguna propuesta pendiente afecta a las búsquedas mientras no la confirme

#### Scenario: HU-139 (RF-16.2) · El lote al modelo no lleva datos de perfiles
- **GIVEN** consultas sin coincidencia del período, una de ellas con el nombre de un perfil y otra de una sesión que eligió no usar servicio externo
- **WHEN** el sistema arma el lote que envía a Gemini
- **THEN** ninguna de esas dos consultas aparece en lo enviado y lo enviado no contiene ningún dato de perfiles

### Requirement: Consultas sin coincidencia como candidatas
Al abrir el léxico, el panel SHALL ofrecer las búsquedas sin resultados del período como candidatas, cada una con dos salidas: incorporarla al léxico o mandarla a la agenda de reclutamiento. La decisión la toma una persona.

#### Scenario: HU-139 · Consultas sin coincidencia como candidatas
- **GIVEN** búsquedas sin resultados en el período
- **WHEN** la administradora abre el léxico
- **THEN** esas consultas se le ofrecen como candidatas a incorporar
- **AND** puede mandarlas al léxico o a la agenda de reclutamiento
