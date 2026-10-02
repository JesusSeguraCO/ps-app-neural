# Spec Delta

## Purpose

Da a Talento Humano el control de qué perfiles están asignados a una cuenta y cuándo vuelven a quedar libres, con el panel como fuente y la información de Operaciones cargada a su lado con su fecha de corte, sin ocultar nunca inventario vendible.

## ADDED Requirements

### Requirement: Registrar un colocado en el panel
Marcar un perfil publicado como colocado SHALL exigir el cliente y la fecha de liberación, y registrar la fecha de inicio; el registro SHALL quedar atribuido a quien lo hizo como fuente del dato y la disponibilidad del perfil SHALL pasar a ser la fecha de liberación. Sin fecha de liberación el registro no SHALL guardarse y el perfil SHALL conservar su estado y disponibilidad.

#### Scenario: HU-137 · Registrar un colocado en el panel
- **GIVEN** un perfil publicado que acaba de ser asignado a una cuenta
- **WHEN** la administradora lo marca como colocado registrando el cliente y la fecha de liberación
- **THEN** el perfil aparece en la pestaña de colocados con la cuenta, la fecha de inicio y la de liberación
- **AND** su disponibilidad pasa a ser la fecha de liberación
- **AND** el registro queda atribuido a ella como fuente del dato

#### Scenario: HU-137 · Colocado sin fecha de liberación
- **GIVEN** una administradora que está marcando un perfil publicado como colocado
- **WHEN** guarda el registro con el cliente pero sin fecha de liberación
- **THEN** el panel no guarda el registro y le dice que un colocado siempre lleva su fecha de liberación
- **AND** el perfil conserva el estado y la disponibilidad que tenía

### Requirement: Un colocado sigue publicado
Un perfil colocado SHALL seguir en estado publicado, con su disponibilidad en la fecha de liberación, y el cliente SHALL verlo en el portal con su banda de arranque, sin ocultarlo.

#### Scenario: HU-137 · Un colocado sigue publicado
- **GIVEN** un perfil colocado hasta cierta fecha
- **WHEN** la administradora lo busca en el inventario
- **THEN** sigue en estado publicado con su disponibilidad en la fecha de liberación
- **AND** el cliente lo ve en el portal con su banda de arranque, no oculto

### Requirement: Pestaña de colocados por vencimiento
La pestaña de colocados SHALL mostrar cuenta, fecha de inicio y fecha de liberación de cada colocado, ordenados por proximidad del vencimiento y con los que vencen dentro de 60 días destacados, indicando en cada uno si procede del panel o de la carga de Operaciones. Los roles administrador de inventario y observador SHALL poder consultarla.

#### Scenario: HU-137 · Colocados ordenados por vencimiento
- **GIVEN** perfiles colocados en cuentas
- **WHEN** la administradora abre la pestaña de colocados
- **THEN** ve cuenta, fecha de inicio y fecha de liberación de cada uno
- **AND** están ordenados por proximidad del vencimiento
- **AND** los que vencen dentro de 60 días están destacados

### Requirement: Cargar la información de Operaciones
La administradora de inventario SHALL poder cargar en la pestaña de colocados un archivo JSON o CSV de Operaciones con las columnas mínimas código del perfil (PS-XXXX), cliente, fecha de inicio y fecha de liberación. Los colocados cargados SHALL aparecer marcados como procedentes de la carga de Operaciones; la fecha de corte SHALL ser el momento de la carga y verse en la pestaña; cualquier otra columna SHALL ignorarse e informarse. Solo SHALL aplicarse las filas válidas y cada fila con error SHALL mostrarse con su número y su motivo. Un archivo que no es JSON ni CSV SHALL rechazarse entero, conservando los colocados y la fecha de corte anteriores. Sin integración automática con el sistema de asignación.

#### Scenario: HU-150 · Carga de un archivo de Operaciones
- **GIVEN** un archivo JSON o CSV de Operaciones con código del perfil (PS-XXXX), cliente, fecha de inicio y fecha de liberación de colocados que no están registrados en el panel, y una columna adicional de observaciones
- **WHEN** la administradora lo carga en la pestaña de colocados
- **THEN** esos colocados aparecen en la pestaña marcados como procedentes de la carga de Operaciones
- **AND** la pestaña muestra como fecha de corte el momento de esa carga
- **AND** el panel le informa que la columna de observaciones se ignoró

#### Scenario: HU-150 · Filas con errores de formato
- **GIVEN** un archivo de Operaciones con filas válidas y filas con errores de formato
- **WHEN** la administradora lo carga
- **THEN** se aplican solo las filas válidas
- **AND** cada fila con error se muestra con su número y el motivo, sin aplicarse

#### Scenario: HU-150 · El archivo no es JSON ni CSV
- **GIVEN** un archivo de Operaciones que no es JSON ni CSV
- **WHEN** la administradora lo carga
- **THEN** el panel lo rechaza entero y le dice que admite JSON o CSV
- **AND** la pestaña conserva los colocados y la fecha de corte de la carga anterior

### Requirement: Aviso de dato desincronizado
Si la última carga de Operaciones tiene más de 7 días sin una carga nueva, la pestaña SHALL mostrar el aviso «dato desincronizado» junto a la fecha de corte; con 7 días o menos no SHALL aparecer. En ambos casos los colocados de esa carga SHALL seguir visibles.

#### Scenario: HU-150 · La carga de Operaciones está desincronizada
- **GIVEN** la última carga de Operaciones hecha hace N días sin otra posterior
- **WHEN** la administradora abre la pestaña de colocados
- **THEN** con N = 7 el aviso «dato desincronizado» no aparece y con N = 8 aparece junto a la fecha de corte
- **AND** los colocados de esa carga siguen visibles, sin ocultarse, con o sin aviso

### Requirement: Gana el panel ante una diferencia con Operaciones
Si una fila de Operaciones trae para un código otros datos que el colocado registrado en el panel, el colocado del panel SHALL conservar sus datos y la fila no SHALL pisarlo; la fila SHALL quedar señalada como «diferencia con Operaciones» con los dos valores a la vista, para que la administradora decida si la acepta.

#### Scenario: HU-150 · Una fila difiere de un colocado registrado en el panel
- **GIVEN** un perfil registrado en el panel como colocado con una fecha de liberación y un archivo de Operaciones que trae para ese mismo código otra fecha de liberación
- **WHEN** la administradora carga el archivo
- **THEN** el colocado del panel conserva sus datos y la fila no lo pisa
- **AND** la fila queda señalada como «diferencia con Operaciones», con los dos valores a la vista, para que ella decida si la acepta
