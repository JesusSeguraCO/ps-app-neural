# disponibilidad-y-vigencia Specification

## Purpose
Mantiene el banco al día sin esfuerzo: la disponibilidad se cambia en segundos, la pausa no sirve de comodín para expresar fechas, las contradicciones entre estado y disponibilidad se ven en la propia fila y nada envejece en silencio.

## Requirements

### Requirement: Disponibilidad en dos clics desde el listado
Desde el listado de perfiles, la administradora de inventario SHALL poder cambiar la fecha de disponibilidad de uno o de varios perfiles a la vez sin abrir la ficha; el cambio SHALL guardarse con su fecha de actualización, quedar registrado con quién y cuándo, y reflejarse de inmediato en el portal como banda de arranque. En bloque, el resultado SHALL mostrarse por perfil. El rol observador no SHALL poder cambiarla.

#### Scenario: HU-132 · Cambio desde el listado
- **GIVEN** una administradora en el listado de perfiles
- **WHEN** actualiza la disponibilidad de uno
- **THEN** el cambio se guarda sin abrir la ficha completa
- **AND** el portal refleja la nueva banda de arranque de inmediato
- **AND** queda registrado quién lo cambió y cuándo

#### Scenario: HU-132 · Un observador intenta cambiar la disponibilidad
- **GIVEN** una persona que entró al panel con rol observador
- **WHEN** intenta cambiar la disponibilidad de un perfil desde el listado
- **THEN** el panel no se lo permite
- **AND** la disponibilidad del perfil no cambia y no queda ningún cambio registrado

#### Scenario: HU-132 · Varios perfiles a la vez
- **GIVEN** varios perfiles seleccionados en el listado que quedan libres el mismo día
- **WHEN** la administradora actualiza su disponibilidad en bloque
- **THEN** el cambio se aplica a todos
- **AND** ve el resultado por perfil, no un mensaje global

### Requirement: Pausar exige un motivo de la lista corta
Pausar un perfil publicado SHALL exigir elegir un motivo del catálogo de motivos de pausa, SHALL sacarlo del portal y SHALL registrar el motivo con quién lo pausó y cuándo. Si lo que se busca expresar es una fecha futura de disponibilidad, el panel SHALL indicar que eso no es una pausa sino disponibilidad y llevar a dejar el perfil publicado con la fecha correcta.

#### Scenario: HU-133 · Pausa con motivo
- **GIVEN** un perfil publicado en el portal
- **WHEN** la administradora lo pausa
- **THEN** el panel le exige elegir el motivo de una lista corta
- **AND** el perfil deja de mostrarse en el portal
- **AND** el motivo queda registrado con quién lo pausó y cuándo

#### Scenario: HU-133 · El motivo es en realidad una fecha
- **GIVEN** un perfil publicado con una fecha de disponibilidad futura conocida
- **WHEN** la administradora busca en la lista de motivos de pausa uno que exprese esa fecha
- **THEN** el panel le indica que eso no es una pausa sino disponibilidad
- **AND** la lleva a dejar el perfil publicado con la fecha correcta

### Requirement: Matriz de incoherencias estado × disponibilidad
El panel SHALL evaluar, con la fecha civil de Bogotá, la matriz de D5 en cada fila del listado, al publicar y en la vista previa de importación. Severidad ALTA —pausado o archivado con «Disponible ahora» o con fecha; colocado con «Disponible ahora»; publicado sin ninguna disponibilidad— SHALL señalarse en rojo nombrando la contradicción, con la acción que la corrige sin salir del listado, y SHALL impedir publicar hasta resolverla. Severidad MEDIA —publicado con fecha ya pasada; publicado sin actualizar hace más de 30 días— SHALL advertirse sin rojo y sin bloquear, con el perfil publicado y visible. Cualquier otra combinación no es incoherencia. La matriz no SHALL ser un parámetro administrable.

#### Scenario: HU-134 · Incoherencia señalada y corregible
- **GIVEN** un perfil pausado
- **WHEN** la administradora le pone una fecha de disponibilidad
- **THEN** la incoherencia aparece señalada en su propia fila, en rojo y con la contradicción nombrada
- **AND** la acción que la corrige está disponible sin salir del listado

#### Scenario: HU-134 · Incoherencia de severidad alta
- **GIVEN** un perfil en una combinación de severidad alta: pausado con «Disponible ahora», pausado con fecha, colocado con «Disponible ahora», archivado con «Disponible ahora», archivado con fecha o publicado sin ninguna disponibilidad
- **WHEN** la administradora intenta publicarlo
- **THEN** el panel lo impide hasta que se resuelva, con un aviso en rojo
- **AND** le dice cuál es la contradicción

#### Scenario: HU-134 · Incoherencia de severidad media
- **GIVEN** un perfil publicado con fecha de disponibilidad ya pasada, o sin actualizar hace más de 30 días
- **WHEN** la administradora abre el listado
- **THEN** la fila muestra una advertencia de severidad media, no en rojo, que nombra la contradicción
- **AND** el perfil sigue publicado y visible en el portal hasta que se resuelva

#### Scenario: HU-134 · Disponibilidad vencida y sin tocar
- **GIVEN** un perfil publicado cuya fecha de disponibilidad ya pasó y que lleva más de 30 días sin actualizarse
- **WHEN** la administradora abre el listado
- **THEN** la fila indica que el portal lo está mostrando como «Disponibilidad por confirmar» y no como disponible ahora
- **AND** el perfil aparece en su bandeja de vigencia

#### Scenario: HU-134 · Fecha vencida pero actualizada hace poco
- **GIVEN** un perfil publicado cuya fecha de disponibilidad ya pasó y que se actualizó hace 30 días o menos
- **WHEN** la administradora abre el listado
- **THEN** la fila muestra la advertencia media de fecha vencida
- **AND** no indica «Disponibilidad por confirmar» ni lo lleva a la bandeja de vigencia por esa causa

### Requirement: Bandeja de vigencia
La bandeja de vigencia SHALL listar, marcados para revisión, los perfiles publicados cuya disponibilidad no se actualiza hace más de 30 días (ordenados por antigüedad del último cambio, con los que el portal ya muestra como «Disponibilidad por confirmar» al principio e indicándolo) y los perfiles pausados hace más de 30 días (con su motivo, desde qué fecha y los días que llevan). Un publicado sin fecha de última actualización SHALL aparecer como «dato incompleto», nunca omitido ni tratado como al día. Un pausado de 30 días o menos no SHALL aparecer por su pausa. Desde cada fila SHALL poder actualizarse la disponibilidad en dos clics y, en los pausados, reactivar o archivar. Vacía, la bandeja SHALL declarar que no hay perfiles pendientes de revisión.

#### Scenario: HU-136 · Publicados sin actualizar, con trabajo concreto
- **GIVEN** perfiles publicados cuya disponibilidad no se actualiza hace más de 30 días
- **WHEN** la administradora abre la bandeja de vigencia
- **THEN** los ve marcados para revisión, ordenados por antigüedad del último cambio
- **AND** desde cada fila puede actualizar la disponibilidad en dos clics sin abrir la ficha

#### Scenario: HU-136 · Pausado hace más de 30 días
- **GIVEN** un perfil que lleva más de 30 días en estado pausado
- **WHEN** la administradora abre la bandeja de vigencia
- **THEN** aparece marcado para revisión junto a los publicados vencidos
- **AND** la fila indica que está pausado, su motivo de pausa y desde qué fecha

#### Scenario: HU-136 · Perfil sin fecha de última actualización
- **GIVEN** un perfil publicado sin fecha registrada de su última actualización de disponibilidad
- **WHEN** la administradora abre la bandeja de vigencia
- **THEN** el perfil aparece en la bandeja marcado como «dato incompleto»
- **AND** no se omite de la lista ni se trata como si estuviera al día

#### Scenario: HU-136 · Bandeja vacía
- **GIVEN** ningún perfil publicado lleva más de 30 días sin actualizarse y ninguno lleva más de 30 días pausado
- **WHEN** la administradora abre la bandeja de vigencia
- **THEN** el panel declara explícitamente que no hay perfiles pendientes de revisión
- **AND** no muestra una lista vacía sin explicación

#### Scenario: HU-136 · Perfil vencido que ya se muestra como «por confirmar»
- **GIVEN** un perfil vencido que ya aparece en el portal como «Disponibilidad por confirmar»
- **WHEN** la administradora abre la bandeja de vigencia
- **THEN** ese perfil aparece al principio de la lista
- **AND** su fila indica que el cliente ya está viendo esa advertencia

#### Scenario: HU-133 · La pausa se prolonga más de 30 días
- **GIVEN** un perfil que lleva pausado más de 30 días
- **WHEN** la administradora abre la bandeja de vigencia
- **THEN** el perfil aparece marcado para revisión, con su motivo de pausa y los días que lleva pausado
- **AND** puede reactivarlo o archivarlo desde ahí

#### Scenario: HU-133 · Pausa todavía dentro del umbral
- **GIVEN** un perfil que lleva pausado 30 días o menos
- **WHEN** la administradora abre la bandeja de vigencia
- **THEN** el perfil no aparece marcado por su pausa
