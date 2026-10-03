# Spec Delta

## ADDED Requirements

### Requirement: Aviso de lenguaje de inventario al guardar la trayectoria
Al guardar un perfil, el panel SHALL advertir si el resumen o la trayectoria usan una expresión de la lista de lenguaje de inventario (RF-3.6: «unidad», «ítem», «disponible para asignación», «stock») y SHALL señalar cuáles. La comprobación SHALL ser determinista, por expresión completa y sin distinguir mayúsculas ni tildes. El aviso no SHALL impedir guardar ni publicar, no SHALL entrar en la guarda de publicación ni en la marca «Incompleto», y cuando el guardado falle por otra regla SHALL mostrarse aparte del error, sin presentarse como su causa.

#### Scenario: HU-194 · El aviso señala la expresión y no bloquea
- **GIVEN** un perfil en el editor cuya trayectoria dice «perfil disponible para asignación inmediata en proyectos de banca»
- **WHEN** la administradora guarda el perfil
- **THEN** el panel advierte que la trayectoria usa lenguaje de inventario y señala la expresión «disponible para asignación»
- **AND** el perfil queda guardado
- **AND** puede publicarlo igual, sin que el aviso lo impida

#### Scenario: HU-194 · El guardado falla por otra regla y la trayectoria tiene lenguaje de inventario
- **GIVEN** un perfil en el editor cuya trayectoria dice «stock de consultores para banca» y cuya fecha de la verificación SARO es posterior a hoy
- **WHEN** la administradora guarda el perfil
- **THEN** el panel no guarda el cambio y dice que la fecha de una verificación no puede ser posterior a hoy
- **AND** muestra también el aviso de lenguaje de inventario con la expresión «stock», separado del error y sin presentarlo como la causa del rechazo

#### Scenario: HU-194 · La expresión se reconoce con otra escritura
- **GIVEN** un perfil cuya trayectoria dice «Lideró la migración de un ITEM crítico del core bancario»
- **WHEN** la administradora guarda el perfil
- **THEN** el panel advierte y señala la expresión «ITEM»

#### Scenario: HU-194 · La expresión no se reconoce dentro de otra palabra
- **GIVEN** un perfil cuya trayectoria dice «Trabajó dos años en Stockholm para un banco nórdico»
- **WHEN** la administradora guarda el perfil
- **THEN** el panel no muestra ningún aviso de lenguaje de inventario

#### Scenario: HU-194 · Corregir la trayectoria retira el aviso
- **GIVEN** un perfil para el que el panel advirtió que la trayectoria usa «unidad»
- **AND** la frase reescrita sin esa expresión
- **WHEN** la administradora guarda el perfil
- **THEN** el panel no muestra ningún aviso de lenguaje de inventario
- **AND** el perfil queda guardado con la trayectoria nueva

## MODIFIED Requirements

### Requirement: Ficha del perfil en el portal (D47)
El portal SHALL abrir la ficha de un perfil disponible en un panel lateral sobre la lista que el cliente tiene delante —la selección del correo o el banco con su filtro—, dibujada con el mismo componente que la vista previa del panel. SHALL recorrerse en el orden de esa lista con anterior y siguiente, diciendo la posición («n de N»), con el botón y la flecha del teclado del extremo deshabilitados y sin dar la vuelta ni saltar a un perfil fuera de la lista, y cerrarse volviendo a la misma lista, con el mismo filtro y en la posición del perfil que estaba abierto; en el teléfono SHALL ocupar la pantalla con la navegación anterior / siguiente. El cliente nombrado de cada experiencia SHALL mostrarse solo si el consentimiento lo incluye, y la validación técnica SHALL mostrarse por niveles (enunciado de Nivel 0 o reporte de Nivel 1). Ningún perfil fuera de la lista ni sin publicar SHALL abrir ficha.

#### Scenario: HU-120 · Recorrer fichas sin perder la lista (D47)
- **GIVEN** un cliente con su selección abierta
- **WHEN** abre la ficha de un perfil y pasa al siguiente
- **THEN** la ficha se abre como panel lateral sobre la lista y dice su posición en ella
- **AND** en el último perfil la flecha siguiente está deshabilitada y al cerrar vuelve a la misma lista

#### Scenario: HU-120 · Pasar al siguiente en un computador
- **GIVEN** una lista de 5 perfiles en un computador con la ficha del segundo abierta
- **WHEN** el cliente pasa al perfil siguiente
- **THEN** ve la ficha del tercer perfil en un panel lateral sobre la lista, que sigue visible detrás
- **AND** ve «3 de 5» como posición dentro de esa lista

#### Scenario: HU-120 · Pasar al siguiente en un teléfono
- **GIVEN** una lista de 5 perfiles en un teléfono con la ficha del segundo abierta
- **WHEN** el cliente pasa al perfil siguiente
- **THEN** ve la ficha del tercer perfil a pantalla completa, con la navegación anterior / siguiente
- **AND** ve «3 de 5» como posición dentro de esa lista

#### Scenario: HU-120 · El último perfil de la lista, con el botón
- **GIVEN** la ficha abierta del último perfil de una lista de 5
- **WHEN** el cliente toca el botón «siguiente»
- **THEN** el botón aparece deshabilitado y la ficha sigue en el mismo perfil, «5 de 5»
- **AND** no salta al primer perfil ni a ningún perfil que no esté en la lista

#### Scenario: HU-120 · El primer perfil de la lista, con el teclado
- **GIVEN** la ficha abierta en un computador del primer perfil de una lista de 5
- **WHEN** el cliente pulsa la flecha izquierda del teclado
- **THEN** la ficha sigue en el mismo perfil, «1 de 5», con el botón «anterior» deshabilitado
- **AND** no salta al último perfil ni a ningún perfil que no esté en la lista

#### Scenario: HU-120 · Cerrar la ficha devuelve a la misma lista
- **GIVEN** una lista de 5 perfiles filtrada con la ficha del tercero abierta
- **WHEN** el cliente cierra la ficha
- **THEN** vuelve a la misma lista, con el mismo filtro aplicado
- **AND** la lista queda en la posición del tercer perfil, sin volver al principio

#### Scenario: HU-127 · Experiencia sin cliente nombrado en la ficha (D47)
- **GIVEN** un perfil publicado cuyo consentimiento no incluye a los clientes
- **WHEN** el cliente abre su ficha
- **THEN** ve cada experiencia con su cargo, su periodo y su descripción
- **AND** no ve el nombre del cliente de ninguna experiencia

#### Scenario: HU-130 · El cliente ve la validación por niveles (D47)
- **GIVEN** un perfil publicado con el reporte de validación confirmado
- **WHEN** el cliente abre su ficha
- **THEN** ve la modalidad, el resultado, el evaluador, la fecha y lo que se evaluó
