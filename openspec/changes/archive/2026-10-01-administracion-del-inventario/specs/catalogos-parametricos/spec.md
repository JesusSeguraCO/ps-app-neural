# Spec Delta

## Purpose

Permite que Talento Humano haga crecer y limpie la taxonomía del banco (roles, familias, tecnologías, sectores, modalidades de prueba y motivos de pausa) desde el panel, sin texto libre, sin duplicados y sin borrar nunca un valor que explica una ficha.

## ADDED Requirements

### Requirement: Rol nuevo encadenado a su familia
El formulario de rol SHALL exigir la familia como campo obligatorio y, al guardarlo, el rol SHALL quedar disponible en el editor de perfiles. Si la familia elegida no tiene ninguna modalidad de prueba activa, el rol SHALL crearse igual y el panel SHALL advertir en ese momento que ningún perfil de esa familia podrá publicarse hasta registrar una modalidad.

#### Scenario: HU-089 · Rol nuevo en una familia con modalidades de prueba
- **GIVEN** una administradora de inventario que necesita publicar un Diseñador UX/UI Banking, un rol que no existe, en una familia con modalidades de prueba registradas
- **WHEN** crea el rol en el catálogo eligiendo esa familia
- **THEN** el rol queda disponible en el editor de perfiles
- **AND** el formulario de rol tiene la familia como campo obligatorio

#### Scenario: HU-089 · Rol nuevo en una familia sin modalidades de prueba
- **GIVEN** una familia sin ninguna modalidad de prueba registrada
- **WHEN** la administradora crea un rol en esa familia
- **THEN** el rol queda creado
- **AND** el panel advierte que ningún perfil de esa familia se podrá publicar hasta registrar una modalidad

### Requirement: Modalidad de prueba con su texto de cara al cliente
Agregar una modalidad de prueba SHALL exigir su familia y su texto de cara al cliente en el mismo acto (qué exige, qué evalúa y qué entregable produce: enunciado del reto, entregables esperados y criterios evaluados); sin ese texto la modalidad no SHALL crearse.

#### Scenario: HU-089 (RF-8.16.8) · Modalidad sin texto de cara al cliente
- **GIVEN** una administradora que agrega una modalidad de prueba a una familia
- **WHEN** intenta guardarla sin su texto de cara al cliente
- **THEN** la modalidad no se crea y el panel señala el texto que falta

### Requirement: Selección del catálogo, nunca texto libre
Los campos de rol, tecnologías, sector y modalidad de prueba del editor de perfiles SHALL ofrecer solo valores activos del catálogo que coinciden con lo escrito y no SHALL aceptar guardar texto libre; crear un valor nuevo SHALL ser una acción aparte de las coincidencias.

#### Scenario: HU-089 · Seleccionar en vez de escribir
- **GIVEN** una administradora que está editando las tecnologías de un perfil
- **WHEN** escribe «Fig» en el campo
- **THEN** el panel le ofrece para elegir los valores del catálogo que coinciden, como «Figma»
- **AND** el campo no acepta guardar texto libre
- **AND** crear un valor nuevo aparece como una acción aparte de las coincidencias

### Requirement: Sin duplicados al crear un valor
Al crear un valor, el panel SHALL normalizar mayúsculas y acentos y SHALL impedir crear un valor idéntico a uno existente del mismo catálogo tras esa normalización, indicando cómo se llama el existente. Si el valor se parece a uno existente por distancia de edición o por contención, el panel SHALL mostrar el parecido, permitir usarlo en un toque y exigir una confirmación explícita de que es un valor distinto antes de crearlo. La detección SHALL ser determinista.

#### Scenario: HU-089 · Valor parecido a uno existente
- **GIVEN** un catálogo de tecnologías que ya tiene «Figma»
- **WHEN** la administradora intenta crear la tecnología «Fgima»
- **THEN** el panel le muestra «Figma» como valor parecido y le deja usarlo en un toque
- **AND** crear «Fgima» exige que confirme que es un valor distinto

#### Scenario: HU-089 · Valor idéntico salvo mayúsculas
- **GIVEN** un catálogo de tecnologías que ya tiene «Figma»
- **WHEN** la administradora intenta crear «figma»
- **THEN** el panel impide crearlo
- **AND** le indica que ya existe como «Figma»

### Requirement: Desactivar sin borrar
El panel no SHALL ofrecer ninguna acción de borrar un valor de catálogo. Desactivar un valor SHALL advertir antes cuántas fichas dependen de él, SHALL impedir elegirlo en perfiles nuevos y SHALL conservar el valor y su texto en las fichas que ya lo tienen.

#### Scenario: HU-143 · Desactivar una modalidad de prueba en uso
- **GIVEN** una modalidad de prueba que aparece en las fichas de varios perfiles publicados y que ya no se quiere ofrecer
- **WHEN** la administradora la desactiva
- **THEN** el panel le advierte cuántas fichas dependen de ella
- **AND** deja de poder elegirse en perfiles nuevos
- **AND** las fichas que ya la tienen conservan su texto
- **AND** no existe ninguna opción de borrarla

### Requirement: Fusión de duplicados con impacto previo
Fusionar un valor origen en un destino del mismo catálogo SHALL mostrar primero cuántos perfiles pasarán al destino sin cambiar nada; solo al confirmar SHALL reasignar en una sola transacción todos los perfiles que usaban el origen, sacar el origen del catálogo (marcado como fusionado, sin borrado físico) y registrar la fusión en la auditoría. Una fusión de un valor en sí mismo o entre catálogos distintos SHALL rechazarse con su motivo sin cambiar nada. Cancelar desde la vista de impacto no SHALL cambiar nada.

#### Scenario: HU-143 · Ver el impacto de una fusión antes de confirmarla
- **GIVEN** un catálogo con «Figma» y «Fgima», ambos en uso
- **WHEN** la administradora elige fusionar «Fgima» en «Figma»
- **THEN** ve cuántos perfiles pasarán al valor destino
- **AND** nada cambia en los perfiles ni en el catálogo hasta que confirme

#### Scenario: HU-143 · Confirmar la fusión
- **GIVEN** la vista de impacto de fusionar «Fgima» en «Figma»
- **WHEN** la administradora confirma la fusión
- **THEN** todos los perfiles que usaban «Fgima» pasan a «Figma»
- **AND** «Fgima» desaparece del catálogo

#### Scenario: HU-143 · Fusión imposible
- **GIVEN** una fusión con el mismo valor como origen y destino, o con dos valores de catálogos distintos
- **WHEN** la administradora intenta fusionarlos
- **THEN** el panel rechaza la fusión y le dice el motivo
- **AND** ningún perfil ni catálogo cambia

#### Scenario: HU-143 · Dos valores que no son el mismo
- **GIVEN** la vista de impacto de fusionar dos valores que representan cosas distintas
- **WHEN** la administradora cancela la fusión
- **THEN** ambos valores siguen en el catálogo
- **AND** ningún perfil cambia
