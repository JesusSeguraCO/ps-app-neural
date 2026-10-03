# Spec Delta

## ADDED Requirements

### Requirement: Catálogo de alcances SARO con su texto de cara al cliente
El panel SHALL administrar un catálogo cerrado de alcances de la verificación de seguridad bajo SARO, cada uno con un texto de cara al cliente obligatorio. Un alcance creado SHALL quedar disponible para elegirlo en el editor de perfiles, y el editor no SHALL admitir un alcance escrito que no esté en el catálogo. Crear un alcance idéntico a otro salvo mayúsculas o tildes SHALL impedirse indicando la forma registrada; los parecidos SHALL tratarse con el mismo mecanismo que los demás catálogos.

#### Scenario: HU-177 · Crear un alcance con su texto de cara al cliente
- **GIVEN** un catálogo de alcances SARO sin ningún valor para la verificación de antecedentes judiciales, disciplinarios y fiscales
- **WHEN** la administradora crea el alcance «Antecedentes judiciales, disciplinarios y fiscales» con su texto de cara al cliente
- **THEN** el alcance queda disponible para elegirlo en el editor de perfiles
- **AND** el editor no admite escribir un alcance que no esté en el catálogo

#### Scenario: HU-177 · Un alcance idéntico salvo mayúsculas
- **GIVEN** un catálogo que ya tiene «Antecedentes judiciales, disciplinarios y fiscales»
- **WHEN** la administradora intenta crear «antecedentes judiciales, disciplinarios y fiscales»
- **THEN** el panel impide crearlo
- **AND** le indica que ya existe con su forma registrada

### Requirement: Corregir el texto de un alcance en uso declara el impacto
Corregir el texto de cara al cliente de un alcance asignado a perfiles publicados SHALL avisar, antes de aplicarlo, cuántas fichas publicadas mostrarán el cambio. Confirmar SHALL hacer que esas fichas muestren el texto nuevo y SHALL registrar en el historial quién lo cambió, cuándo, y el valor anterior y el nuevo.

#### Scenario: HU-177 · Corregir el texto de un alcance en uso
- **GIVEN** el alcance «Antecedentes judiciales, disciplinarios y fiscales» asignado a 4 perfiles publicados
- **AND** una corrección de su texto de cara al cliente para la que el panel avisó, antes de aplicarla, que se verá en 4 fichas publicadas
- **WHEN** la administradora confirma la corrección
- **THEN** las 4 fichas muestran el texto nuevo
- **AND** el historial registra quién cambió el texto, cuándo, y el valor anterior y el nuevo

### Requirement: Un alcance desactivado se conserva donde ya estaba
Un alcance SARO SHALL poder desactivarse pero nunca borrarse. Desactivado, el editor y la importación no SHALL ofrecerlo ni aceptarlo para perfiles que no lo tenían; los perfiles que ya lo tienen SHALL conservarlo, sus fichas SHALL seguir mostrándolo y la guarda de publicación no SHALL tratarlo como faltante, de modo que un cambio en esos perfiles pueda publicarse.

#### Scenario: HU-177 · Retirar un alcance en uso
- **GIVEN** el alcance «Antecedentes judiciales» asignado a 2 perfiles publicados
- **WHEN** la administradora lo desactiva en el catálogo
- **THEN** el editor deja de ofrecerlo para perfiles nuevos o editados
- **AND** los 2 perfiles lo conservan y sus fichas lo siguen mostrando
- **AND** el catálogo no permite borrarlo, solo desactivarlo

#### Scenario: HU-177 · Editar un perfil que conserva un alcance desactivado
- **GIVEN** el alcance «Antecedentes judiciales» desactivado y asignado a un perfil publicado
- **AND** un cambio de su resumen, sin tocar el alcance, guardado y pendiente de la confirmación de cambio en un perfil publicado
- **WHEN** la administradora confirma el cambio
- **THEN** el perfil conserva «Antecedentes judiciales» como alcance y su ficha sigue mostrándolo
- **AND** el cambio queda publicado sin que el alcance desactivado lo marque como incompleto ni lo bloquee
- **AND** el editor muestra ese alcance como valor actual, señalado como desactivado, y no lo ofrece a otros perfiles
