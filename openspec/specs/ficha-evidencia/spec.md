# ficha-evidencia Specification

## Purpose
Hace que la ficha del perfil presente cada afirmación con su respaldo en el inventario: lo que Trycore verificó separado de lo que la persona declara, las tres validaciones de entrada como contenido y no como insignia, la conversación siempre por Trycore y un cierre con condiciones, SLA y garantía de servicio, sin que ningún dato de la lista negra B.4 cruce al portal.

## Requirements

### Requirement: Lo verificado separado de lo declarado
La ficha SHALL mostrar un bloque «Verificado por Trycore» (Sello Personal y validaciones) con un tratamiento visual propio, no en letra pequeña, y aparte un bloque «Declarado por la persona» (trayectoria, formación y stack). La trayectoria SHALL leerse en la prosa de la persona y ningún texto del portal sobre ella SHALL usar «unidad», «ítem», «disponible para asignación» ni «stock». La experiencia SHALL aparecer solo en «Declarado por la persona» y la validación técnica nunca SHALL citarla ni resumirla.

#### Scenario: HU-154 · Dos zonas con su origen declarado
- **GIVEN** un perfil publicado con resumen, trayectoria con clientes nombrados autorizados, formación, stack, Sello Personal y validación técnica
- **WHEN** el cliente abre su ficha
- **THEN** ve un bloque titulado «Verificado por Trycore», con el Sello Personal y las validaciones, marcado con un tratamiento propio y no en letra pequeña
- **AND** ve aparte un bloque titulado «Declarado por la persona», con la trayectoria, la formación y el stack
- **AND** la trayectoria se lee en prosa de la persona, con sus clientes y la escala, y ningún texto del portal sobre ella usa «unidad», «ítem», «disponible para asignación» ni «stock»

#### Scenario: HU-154 · La experiencia nunca se presenta como validación técnica
- **GIVEN** un perfil cuya trayectoria describe un proyecto en el que «diseñó la arquitectura de pagos» para un cliente
- **WHEN** el cliente abre su ficha
- **THEN** esa experiencia aparece solo en «Declarado por la persona»
- **AND** la validación técnica de «Verificado por Trycore» muestra solo la prueba que Trycore aplicó, sin citar ni resumir la trayectoria

### Requirement: La lista negra B.4 nunca cruza al portal
La respuesta que el servidor entrega a la ficha y a la tarjeta no SHALL contener la motivación del profesional (dato interno), fotografía, datos de contacto, hoja de vida, promedio académico, certificaciones con proveedor y fecha, resultado detallado del DISC, el vínculo laboral interno ni la marca «Incompleto»; el contrato del portal SHALL rechazar cualquier campo de más.

#### Scenario: HU-154 · Datos internos que nunca cruzan al portal
- **GIVEN** un perfil cuya motivación (qué le interesa aportar) registró Talento Humano en el panel
- **WHEN** el cliente abre su ficha
- **THEN** no ve la motivación, ni completa ni resumida
- **AND** no ve ningún otro dato de la lista negra B.4: fotografía, datos de contacto, hoja de vida, promedio académico, certificaciones con proveedor y fecha, ni resultado detallado del DISC
- **AND** la respuesta que el servidor entrega a la ficha no contiene ninguno de esos campos

### Requirement: Validación técnica desplegable con estructura fija
Tocar «Validación técnica» en la ficha SHALL desplegar dentro de la ficha, sin depender de pasar el cursor y nunca en la tarjeta, un bloque con cinco campos fijos y en el mismo orden: prueba aplicada, qué se evaluó, resultado, evaluador y fecha (mes y año). El resultado SHALL decir «Cumple el estándar», sin puntaje, nota ni porcentaje. Un perfil solo con Nivel 0 SHALL mostrar la prueba aplicada con el texto de cara al cliente de su modalidad, sin fecha y sin campos vacíos, «no aplica», «pendiente» ni promesa de detalle. Nunca SHALL enlazarse el artefacto crudo; SHALL decirse que la evidencia puede revisarse en la sesión de alineación con Trycore.

#### Scenario: HU-155 · El detalle se despliega con estructura fija
- **GIVEN** un perfil publicado con su reporte de validación técnica confirmado, de la modalidad «Reto de código con entrega funcional», evaluado en febrero de 2026
- **WHEN** el cliente toca «Validación técnica» en su ficha
- **THEN** se despliega dentro de la ficha un bloque con cinco campos, siempre los mismos y en el mismo orden: prueba aplicada, qué se evaluó, resultado, evaluador y fecha («febrero de 2026»)
- **AND** el resultado dice «Cumple el estándar», sin ningún puntaje, nota ni porcentaje
- **AND** el detalle se abre igual al tocarlo en un teléfono: no depende de pasar el cursor y no aparece en la tarjeta

#### Scenario: HU-155 · El perfil todavía no tiene reporte detallado
- **GIVEN** un perfil publicado solo con el Nivel 0 de su modalidad de prueba, sin reporte detallado
- **WHEN** el cliente toca «Validación técnica» en su ficha
- **THEN** ve la prueba aplicada con el texto de cara al cliente de esa modalidad, sin fecha
- **AND** no ve ningún campo vacío, ni «no aplica», ni «pendiente», ni la promesa de un detalle que no existe

#### Scenario: HU-155 · El artefacto crudo nunca se enlaza
- **GIVEN** un perfil cuya validación técnica produjo un repositorio y una sustentación que Talento Humano conserva internamente
- **WHEN** el cliente despliega su validación técnica
- **THEN** no ve ningún enlace, nombre de archivo, repositorio ni descarga de ese material
- **AND** ve una línea que dice que la evidencia de la validación puede revisarse en la sesión de alineación con Trycore

### Requirement: Seguridad SARO y DISC como contenido
En «Verificado por Trycore», la ficha SHALL mostrar la verificación de seguridad bajo SARO con el texto de cara al cliente de su alcance y su mes, y la evaluación DISC con su mes y, si existen, las competencias del Sello Personal, como contenido (qué se verificó y cuándo) y no como insignias ni sellos de color. Un dato no registrado SHALL omitirse sin afirmar la validación y sin ninguna marca de «incompleto», «pendiente» ni «no aplica», mostrando completo el resto. Nunca SHALL mostrarse puntaje, porcentaje, semáforo ni marca de «aprobado» por dimensión Neural-Grid, ni el resultado detallado del DISC.

#### Scenario: HU-156 · Las dos validaciones como evidencia
- **GIVEN** un perfil publicado con su verificación SARO registrada con el alcance «Antecedentes judiciales, disciplinarios y fiscales» y fecha de marzo de 2026, y su evaluación DISC de abril de 2026 con tres competencias del Sello Personal
- **WHEN** el cliente abre su ficha
- **THEN** ve en «Verificado por Trycore» la verificación de seguridad bajo SARO con el texto de ese alcance y «marzo de 2026»
- **AND** ve la evaluación DISC con «abril de 2026» y sus tres competencias
- **AND** las dos se leen como contenido, no como insignias ni sellos de color

#### Scenario: HU-156 · Publicado antes de la regla, sin la verificación SARO
- **GIVEN** un perfil publicado antes de que la regla lo exigiera, sin la verificación SARO (alcance y fecha) registrada
- **WHEN** el cliente abre su ficha
- **THEN** la ficha no muestra la línea de la verificación de seguridad, ni incompleta ni con un dato que no esté registrado
- **AND** no ve ninguna marca de «incompleto», «pendiente» ni «no aplica»
- **AND** el resto de la ficha se muestra completo

#### Scenario: HU-156 · Publicado antes de la regla, sin la fecha DISC
- **GIVEN** un perfil publicado antes de que la regla lo exigiera, sin la fecha de la evaluación DISC registrada
- **WHEN** el cliente abre su ficha
- **THEN** la ficha no muestra la línea de la evaluación DISC
- **AND** no ve ninguna marca de «incompleto», «pendiente» ni «no aplica»
- **AND** el resto de la ficha se muestra completo

#### Scenario: HU-156 · Evaluación DISC con fecha y sin Sello Personal
- **GIVEN** un perfil publicado con la fecha de su evaluación DISC, abril de 2026, y ninguna competencia del Sello Personal registrada
- **WHEN** el cliente abre su ficha
- **THEN** ve la evaluación DISC con «abril de 2026»
- **AND** no ve competencias, ni un título vacío ni un hueco en su lugar

#### Scenario: HU-156 · Nunca un puntaje ni un estado por dimensión
- **GIVEN** un perfil publicado con sus tres validaciones de entrada registradas
- **WHEN** el cliente abre su ficha
- **THEN** no ve ningún puntaje, porcentaje, semáforo ni marca de «aprobado» por dimensión Neural-Grid
- **AND** no ve el resultado detallado del DISC: como mucho, las tres competencias del Sello Personal

### Requirement: La conversación va por Trycore
La ficha de todo perfil publicado SHALL mostrar, sin desplegar nada, que la conversación sobre el profesional va por Trycore con el contacto vigente configurado en el panel, que Trycore responde por el perfil y lo pone a disposición del cliente, y que el portal no tiene vía de contacto directo con el profesional. No SHALL ofrecer otra acción de contacto fuera de ese bloque ni ningún dato, enlace o botón que lleve a la persona. El texto de representación comercial y la forma de expresar la disponibilidad SHALL ser los mismos para todo el banco, sin declarar ni insinuar el vínculo laboral.

#### Scenario: HU-157 · La ficha dice por dónde va la conversación
- **GIVEN** el contacto de Trycore vigente «Eida Tinjacá, Coordinación de Servicio: eida.tinjaca@trycore.com»
- **WHEN** el cliente abre la ficha de cualquier perfil publicado
- **THEN** ve, sin desplegar nada, que la conversación sobre este profesional va por Trycore, con ese contacto
- **AND** ve que Trycore responde por este perfil y lo pone a su disposición
- **AND** ve que el portal no tiene una vía de contacto directo con el profesional
- **AND** no ve ningún botón ni acción aparte, como «Escribir a Trycore», fuera de ese bloque de contacto

#### Scenario: HU-157 · No hay ningún camino hacia la persona
- **GIVEN** la ficha abierta de un perfil publicado
- **WHEN** el cliente busca en ella cómo escribirle al profesional
- **THEN** la única vía de contacto que encuentra es la de Trycore
- **AND** no ve correo, teléfono, perfiles en redes, hoja de vida ni ningún enlace o botón que lleve a la persona

#### Scenario: HU-157 · El vínculo laboral no se declara ni se insinúa
- **GIVEN** tres perfiles publicados registrados internamente con los vínculos «vinculado», «banco no vinculado» y «fábrica de software»
- **WHEN** el cliente abre la ficha de cada uno
- **THEN** ve en las tres el mismo texto de representación comercial y la misma forma de expresar la disponibilidad
- **AND** no ve nada que diga o sugiera con una etiqueta si la persona es empleada, contratista o parte de una red extendida de Trycore

### Requirement: La ficha cierra con condiciones, SLA y garantía
Al final, la ficha SHALL mostrar las condiciones operativas (modalidad, banda de disponibilidad, idiomas y país; la ciudad solo si la necesidad declarada es presencial o híbrida), que Trycore responde a una solicitud en 10 días hábiles en el tamaño del texto de la ficha, y la garantía de servicio Neural Speed como forma de operar de Trycore, con el mismo texto para todos los perfiles y nunca como atributo, insignia ni estado de la persona. La experiencia con IA de la persona SHALL aparecer solo en su trayectoria. El código SHALL estar solo al pie, en letra pequeña, junto a una línea que recuerda que todo perfil publicado pasó el estándar Neural-Grid, y nunca como título, en la cabecera ni como nombre de la pestaña del navegador.

#### Scenario: HU-158 · El cierre de la ficha
- **GIVEN** un perfil publicado en modalidad Híbrido, que habla español e inglés, está en Colombia y cuya disponibilidad cae en la banda «1 mes»
- **WHEN** el cliente llega al final de su ficha
- **THEN** ve sus condiciones operativas: «Híbrido», «1 mes», los idiomas y el país
- **AND** ve, en el tamaño del texto de la ficha y no en letra pequeña, que Trycore responde a una solicitud en 10 días hábiles
- **AND** ve la garantía de servicio: el talento que entra al proyecto trabaja con agentes de IA desde el día 1 y con línea directa al CoE, dicho como forma de operar de Trycore y no como algo de la persona

#### Scenario: HU-158 · Neural Speed sin experiencia en IA en la trayectoria
- **GIVEN** un perfil publicado registrado como «banco no vinculado» y sin experiencia en IA en su trayectoria
- **WHEN** el cliente abre su ficha
- **THEN** ve la garantía de servicio con el mismo texto que en la ficha de cualquier otro perfil del banco
- **AND** la experiencia con LLM no aparece en ninguna parte de la ficha
- **AND** la ficha no marca a la persona con Neural Speed, ni con una insignia ni con un estado

#### Scenario: HU-158 · Neural Speed con un proyecto con LLM en la trayectoria
- **GIVEN** un perfil publicado con un proyecto con LLM en su trayectoria declarada
- **WHEN** el cliente abre su ficha
- **THEN** ve la garantía de servicio con el mismo texto que en la ficha de cualquier otro perfil del banco
- **AND** la experiencia con LLM aparece solo en su trayectoria, en «Declarado por la persona»
- **AND** la ficha no marca a la persona con Neural Speed, ni con una insignia ni con un estado

#### Scenario: HU-158 · El código está para citar, no para etiquetar
- **GIVEN** la ficha abierta del perfil PS-0142
- **WHEN** el cliente busca cómo citarlo
- **THEN** encuentra «PS-0142» solo al pie de la ficha, en letra pequeña, como referencia, junto a una línea que recuerda que todo perfil publicado pasó el estándar Neural-Grid
- **AND** el código no aparece como título, ni en la cabecera de la ficha, ni como nombre de la pestaña del navegador
