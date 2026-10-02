# auditoria-inventario Specification

## Purpose
Permite responder con evidencia por qué una ficha dice lo que dice: cada cambio del inventario queda con qué campo cambió, su valor anterior y el nuevo, quién lo hizo, cuándo y por qué vía, y ningún cambio entra sin una persona identificada detrás.

## Requirements

### Requirement: Registro de cambios por perfil
Toda escritura sobre un perfil, su consentimiento, su estado, su disponibilidad, su evidencia o sus colocaciones SHALL registrar, en la misma transacción y en la auditoría encadenada, una entrada por campo cambiado con su valor anterior y el nuevo, el correo verificado de quien lo hizo, cuándo y el origen (panel, importación, reversión, carga de Operaciones, fusión o revocación). El registro de un perfil SHALL poder consultarse desde el panel y mostrar los cambios de consentimiento y de estado igual que los de contenido. El registro no SHALL poder modificarse ni borrarse.

#### Scenario: HU-138 · Registro por perfil
- **GIVEN** un perfil que tuvo cambios
- **WHEN** la administradora abre su registro de auditoría
- **THEN** ve qué campo cambió, su valor anterior y el nuevo, quién lo hizo y cuándo
- **AND** los cambios de consentimiento y de estado aparecen igual que los de contenido

#### Scenario: HU-138 · Perfil archivado
- **GIVEN** un perfil archivado
- **WHEN** la administradora consulta su registro de auditoría
- **THEN** ve su historial completo, con la fecha y el autor de cada cambio
- **AND** el archivado aparece como un cambio de estado más

### Requirement: Sin identidad verificada no entra ningún cambio
Un cambio enviado con una sesión del panel vencida SHALL rechazarse sin aplicarse, pidiendo volver a entrar; el registro no SHALL contener ningún cambio sin autor.

#### Scenario: HU-138 · Cambio sin identidad verificada
- **GIVEN** una sesión del panel vencida
- **WHEN** la administradora intenta guardar un cambio en un perfil
- **THEN** el panel no aplica el cambio y le pide volver a entrar
- **AND** el registro del perfil no contiene ningún cambio sin autor

### Requirement: Los procesos también tienen autor
Un cambio que entró por una importación SHALL aparecer atribuido a esa importación y a la persona que la confirmó, con su fecha y un enlace al registro de la importación. Un cambio que entró por una carga de Operaciones SHALL aparecer atribuido a esa carga y a la persona que la hizo, con la fecha de corte de la carga. Ningún cambio SHALL figurar como «sistema» sin una persona detrás.

#### Scenario: HU-138 · Cambio que entró por importación masiva
- **GIVEN** un campo del perfil que cambió por una importación masiva
- **WHEN** la administradora abre su registro de auditoría
- **THEN** el cambio aparece atribuido a la importación y a la persona que la confirmó, con su fecha
- **AND** puede llegar desde ahí al registro de esa importación

#### Scenario: HU-138 · Cambio que entró por la carga del sistema de asignación
- **GIVEN** una disponibilidad del perfil que cambió por una carga de Operaciones desde el sistema de asignación
- **WHEN** la administradora abre su registro de auditoría
- **THEN** el cambio aparece atribuido a esa carga y a la persona que la disparó
- **AND** se muestra la fecha de corte de la hoja cargada
