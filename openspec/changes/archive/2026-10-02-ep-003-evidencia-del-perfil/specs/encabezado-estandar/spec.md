# Spec Delta

## Purpose

Declara el estándar Neural-Grid una sola vez, antes de lo primero que el cliente evalúa, sin bloquear la exploración y sin afirmar de todos los perfiles algo que el inventario no respalda.

## ADDED Requirements

### Requirement: El estándar se declara una vez, arriba
Con sesión válida, en la selección del correo, en el banco al ampliar la búsqueda y en el encuadre de un enlace sin selección, el portal SHALL mostrar antes del primer contenido un encabezado breve que explica el estándar Neural-Grid en cuatro dimensiones —tres condiciones de entrada y Neural Speed como garantía del servicio— y, una sola vez, que exige a cada perfil verificación de identidad bajo SARO, prueba técnica revisada por Trycore y evaluación DISC. Nada de lo que sigue SHALL repetir esa declaración y ninguna tarjeta SHALL llevar una insignia del estándar. En el teléfono el encabezado SHALL estar en el flujo de la página: no SHALL abrirse como ventana sobre la lista, exigir cerrar, aceptar ni descartar nada, ni volver a aparecer encima de la lista al recorrerla.

#### Scenario: HU-159 · En la selección del correo
- **GIVEN** un cliente con una sesión válida
- **WHEN** entra a la selección de su correo
- **THEN** antes del primer perfil ve un encabezado breve que explica el estándar Neural-Grid en cuatro dimensiones: tres condiciones de entrada y Neural Speed como garantía del servicio
- **AND** ve, una sola vez, que el estándar exige a cada perfil verificación de identidad bajo SARO, prueba técnica revisada por Trycore y evaluación DISC
- **AND** nada de lo que sigue en la página repite esa declaración, y ninguna tarjeta lleva una insignia del estándar

#### Scenario: HU-159 · En el banco al ampliar la búsqueda
- **GIVEN** un cliente con una sesión válida
- **WHEN** entra al banco completo al ampliar la búsqueda
- **THEN** antes del primer perfil ve el mismo encabezado del estándar en cuatro dimensiones, una sola vez

#### Scenario: HU-159 · En el encuadre de un enlace sin selección
- **GIVEN** un cliente con una sesión válida en un enlace sin selección
- **WHEN** entra al encuadre
- **THEN** antes de la pregunta «¿Qué necesita tu proyecto?» ve el mismo encabezado del estándar en cuatro dimensiones, una sola vez

#### Scenario: HU-159 · El encuadre no bloquea la exploración en el teléfono
- **GIVEN** un cliente con una sesión válida que usa un teléfono
- **WHEN** entra a la selección de su correo
- **THEN** ve el encabezado del estándar y puede bajar hasta el primer perfil sin cerrar, aceptar ni descartar nada
- **AND** el encabezado no se abre como una ventana sobre la lista ni vuelve a aparecer encima de ella al recorrer los perfiles

### Requirement: La afirmación «ninguno» solo con cero publicados incompletos
El encabezado SHALL afirmar que ningún perfil llega al portal sin verificación de identidad bajo SARO, prueba técnica revisada por Trycore y evaluación DISC solo cuando el conteo de publicados incompletos (la misma guarda que marca «Incompleto» en el panel) es 0; con uno o más, o si el conteo no puede obtenerse (falla o no responde a tiempo), SHALL mostrar la versión que describe lo que el estándar exige a cada perfil, sin la palabra «ningún» ni otra afirmación de que todos lo cumplen. Nunca SHALL nombrar los perfiles incompletos ni decir cuántos son. Sin conteo, la página SHALL cargar los perfiles con normalidad, sin mensaje de error en el encabezado, y SHALL quedar un registro técnico.

#### Scenario: HU-159 · Cero publicados incompletos
- **GIVEN** un banco con 0 perfiles publicados marcados como incompletos
- **WHEN** el cliente entra a la selección de su correo
- **THEN** el encabezado afirma que ningún perfil llega al portal sin verificación de identidad bajo SARO, prueba técnica revisada por Trycore y evaluación DISC
- **AND** no nombra perfiles incompletos ni dice cuántos son

#### Scenario: HU-159 · Un publicado incompleto
- **GIVEN** un banco con 1 perfil publicado marcado como incompleto
- **WHEN** el cliente entra a la selección de su correo
- **THEN** el encabezado describe lo que el estándar exige a cada perfil, sin la palabra «ningún» ni otra afirmación de que todos lo cumplen
- **AND** no nombra el perfil incompleto ni dice cuántos son

#### Scenario: HU-159 · El conteo de incompletos no está disponible
- **GIVEN** que el conteo de perfiles publicados marcados como incompletos no se puede obtener porque su consulta falla o no responde a tiempo
- **WHEN** el cliente entra a la selección de su correo
- **THEN** el encabezado muestra la versión que describe lo que el estándar exige a cada perfil, sin la palabra «ningún» ni otra afirmación de que todos lo cumplen
- **AND** la página carga los perfiles con normalidad, sin mensaje de error en el encabezado
- **AND** queda un registro técnico de que el conteo no estuvo disponible

### Requirement: El respaldo y el plazo están a la vista
La selección del correo SHALL mostrar un bloque de respaldo del servicio con Trycore University, Hive Mind y la Coordinación de Servicio dedicada, y que Trycore responde a una solicitud en 10 días hábiles en el tamaño del texto de la página, no en una nota al pie.

#### Scenario: HU-159 · El respaldo y el plazo están a la vista
- **GIVEN** un cliente en la selección de su correo
- **WHEN** llega al bloque de respaldo del servicio
- **THEN** ve Trycore University, Hive Mind y la Coordinación de Servicio dedicada
- **AND** ve que Trycore responde a una solicitud en 10 días hábiles, en el tamaño del texto de la página y no en una nota al pie
