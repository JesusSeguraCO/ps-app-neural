---
artefacto: epicas
proyecto: portal-people-service
prd_origen: docs/01-prd/portal-people-service.md
prd_version: 4.10
version: 5.2
fecha: 2026-09-18
total_epicas: 11
prd_version_alineada: 4.5
---

# Épicas — Portal de Perfiles People Service

> Descomposición del PRD v0.3. Toda épica se traza a al menos un objetivo del PRD; todo objetivo está cubierto por al menos una épica. Matriz al final.

---

## EP-001 — Acceso y aterrizaje curado

**Resumen.** El cliente llega desde el correo, supera el control de acceso y aterriza frente a los mismos perfiles que le propusimos, presentados como selección con su razón declarada.

**Justificación.** Es el primer contacto con el producto y el punto donde se gana o se pierde la percepción de curaduría. Si el aterrizaje muestra un grid genérico, el correo pierde su valor y el trabajo de selección de Mercadeo se vuelve invisible.

**Objetivos del PRD que cubre:** O2
**Capabilities:** RF-1 (completo) · RF-2.1 · RF-2.2 · RF-19 (completo)
**Fase:** Low-Fi + MVP
**Capa:** `layer: foundational`
**Métrica de éxito:** el 100% de los aterrizajes con parámetros muestran el conjunto curado sin pasos intermedios; tasa de rebote en el aterrizaje por debajo del 30%.
**Riesgo asociado:** enlace firmado que circula fuera de la empresa del cliente (§10.3 del PRD).

**Historias anticipadas:** entrar desde el correo · aterrizar en el conjunto curado con su razón · ampliar la búsqueda sin perder la selección · volver al conjunto curado · enlace vencido · aterrizaje sin parámetros de curaduría.

### Requisitos de esta épica

- **RF-1.1** El enlace del correo viaja con parámetros que identifican cuenta, contacto, conjunto curado y contexto del proyecto.
- **RF-1.2 · Acceso del cliente: enlace firmado más correo invitado.** Al abrir, el portal pide el correo; si está en la **lista de correos invitados del enlace** (RF-1.2.7), envía a ese buzón un código de un uso desde el correo saliente del portal (§8.3). Un correo que no está en la lista no entra, aunque sea de la misma empresa. Sin registro, sin contraseña, una vez por dispositivo. *(D-4 revisada el 2026-09-25.)*
  - **RF-1.2.1 · Por qué cambió respecto de la primera resolución.** D-4 se cerró sin código cuando los perfiles **no llevaban nombre**: lo que se filtraba era un banco anonimizado. Tras revertirse D-1, el enlace expone **la lista nominal del talento de Trycore con su trayectoria**. Cambió el contenido, así que cambió el cálculo del riesgo.
  - ~~**RF-1.2.2 · Por qué la verificación es por dominio y no un código al contacto original.**~~ *Sustituido el 2026-09-25 por RF-1.2.11.* Un código enviado solo a quien recibió el correo **rompe el reenvío interno**, que es deseable: el líder técnico se lo pasa a su arquitecto. La verificación por dominio deja entrar a cualquiera de la empresa del cliente y corta el reenvío hacia afuera.
  - **RF-1.2.3 · Lo que no sirve.** Un código estático incluido en el mismo correo que el enlace: quien tiene el enlace tiene el código. Es fricción con ganancia nula.
  - **RF-1.2.4 · Beneficio adicional.** Hoy solo se sabe quién es el visitante si llega a enviar la solicitud. Con verificación al entrar se sabe desde el primer momento, que es lo que RF-7.3 y el informe del correo necesitan.
  - **RF-1.2.5** El mensaje de la puerta explica la razón —*los perfiles incluyen nombre y trayectoria de profesionales reales*—. Una fricción explicada construye marca; una fricción muda la destruye.
  - **RF-1.2.6 · Sin proveedor de identidad.** El control completo —firma del enlace, lista de dominios, código, vigencia y revocación— lo resuelve el propio portal en el hosting (§8.3). No se instala ningún sistema de identidad externo (Keycloak, OAuth o similar).
  - **RF-1.2.7 · Los correos invitados los declara quien genera el enlace.** Uno o varios por enlace. Por omisión se propone el contacto del envío en HubSpot; Talento Humano lo confirma o añade a otras personas de la cuenta. Cada invitado queda registrado con el enlace (RF-19.5).
  - **RF-1.2.8 · Descartado: un código temporal generado por Talento Humano y enviado junto al enlace.** Es el caso de RF-1.2.3: quien tiene el correo tiene el enlace y el código, así que no aporta nada. El código que protege es el que llega **al buzón que la persona escribe**, porque prueba que lo controla.
  - **RF-1.2.10 · Invitar a un colega.** Un invitado puede pedir desde el portal que se invite a otra persona, indicando su correo. La petición llega a Talento Humano, que la aprueba añadiendo ese correo al enlace, o la rechaza. **El acceso no se concede sin esa aprobación.** Así la segunda opinión del arquitecto sigue siendo posible, sin que el enlace sea una llave que abre a quien lo tenga.
  - **RF-1.2.11 · Por qué lista nominal y no dominio** (decisión del sponsor, 2026-09-25). El portal muestra nombre y trayectoria de profesionales reales: cada persona que los ve debe estar invitada con nombre propio. Reenviar el enlace no da acceso; el colega entra por RF-1.2.10. *Costo aceptado:* el reenvío interno deja de ser inmediato y pasa a requerir una aprobación de Talento Humano.
  - **RF-1.2.9** El intento de código tiene límite por enlace y por dirección —cinco intentos, luego espera— y el punto de entrada va detrás del límite de peticiones de Cloudflare (§8.3). Un código de seis dígitos sin límite se adivina.
- **RF-1.3** Superado el control, el portal saluda por cuenta y muestra el conjunto curado del correo, sin pasos intermedios.
- **RF-1.4** Acceso revocable y con vigencia configurable. Vencido → pantalla de renovación con contacto, nunca error crudo.
- **RF-1.5** `noindex`, `nofollow` y exclusión de rastreadores en todo el portal.
- **RF-1.6** El enlace se genera desde el envío de correo con los tokens de personalización de la cuenta, sin construcción manual de URLs.

- **RF-2.1** El conjunto curado se presenta como bloque con identidad y razón declarada, diferenciado visualmente del resto del inventario.

- **RF-2.2** "Ampliar la búsqueda" abre el banco completo sin destruir el conjunto curado; se vuelve a él en un clic.
---

## EP-002 — Refinamiento y descubrimiento del banco

**Resumen.** El usuario refina lo que la instrucción devolvió: facetas combinables con contadores, etiquetas de filtro activo y ordenamiento, con el estado siempre reflejado en la URL.

**Justificación.** Tras la Fase 2, las facetas dejan de ser la entrada y pasan a ser el refinamiento (RF-14.2). No desaparecen: el control que dan es lo único que repone la sensación de dominio cuando la instrucción devuelve algo inesperado. La URL con estado sigue siendo requisito duro del mecanismo de correo.

**Riesgo propio.** Esta épica contiene la prueba que puede tumbar la jerarquía de la Fase 2: si más de la mitad de las sesiones usa filtros después de haber escrito una instrucción, la subordinación está mal hecha.

**Objetivos del PRD que cubre:** O2
**Capabilities:** RF-2.3 a RF-2.8 · RF-10 y RF-11 (sondeo y espacio no-perfil en el grid)
**Fase:** Low-Fi + MVP
**Capa:** `layer: business`
**Métrica de éxito:** resultados filtrados en menos de 1 segundo; al menos el 50% de las sesiones aplican un filtro propio más allá del conjunto curado.

**Historias anticipadas:** filtrar por rol y categoría · filtrar por stack · filtrar por disponibilidad · combinar y limpiar filtros · buscar por texto libre · ordenar resultados · compartir el estado por URL · estado sin resultados con salida activa · ver y responder el sondeo de equipos híbridos · descartarlo de forma persistente.

### Requisitos de esta épica

- **RF-10.1** El sondeo se presenta como una **tarjeta dentro del grid de resultados**, con el mismo espacio y peso que una tarjeta de perfil, al modo del anuncio nativo. La ubicación en el grid maximiza el alcance: la pantalla de confirmación solo la vería quien envía solicitud, y con el universo actual de cuentas eso no produce datos suficientes para decidir.
- **RF-10.2** **Nunca dentro del conjunto curado.** Solo aparece en el grid de descubrimiento, después de ampliar la búsqueda. Insertar una tarjeta que no es un perfil dentro de la selección hecha para esa cuenta rompe la resolución de §2.5.
- **RF-10.3** **Nunca con menos de 8 resultados visibles (D-12).** Por debajo de ese número, la tarjeta no se muestra: con inventario escaso se lee como relleno y sugiere que no hay perfiles. El patrón de anuncio nativo funciona con inventario abundante; este banco no lo es.
- **RF-10.4** **Una vez por sesión, en posición fija, descartable de forma persistente.** No se repite al desplazarse, no reaparece al cambiar filtros y no vuelve en visitas siguientes si el usuario ya votó o la descartó.
- **RF-10.5** **Se lee como una pregunta de Trycore, no como publicidad.** Mismo espacio y peso que un perfil; apariencia deliberadamente distinta, para que nadie la toque creyendo que es un candidato. En una herramienta por la que el cliente ya paga, algo con estética de anuncio abarata la percepción del resto.
- **RF-10.6** Una sola pregunta, respuesta de un toque, con opción de ampliar en texto libre. Tras votar, la tarjeta agradece y **colapsa**: no sigue ocupando un espacio de inventario.
- **RF-10.7** Redacción explícita de exploración. Sin fechas, sin "próximamente", sin insinuar que la capacidad ya existe. Con una cuenta activa, prometer lo inexistente cuesta más caro que con un prospecto.
- **RF-10.8** El voto se atribuye a cuenta y contacto y viaja a HubSpot. Un sí de una cuenta con contrato vigente es una señal calificada, no un voto anónimo.
- **RF-10.9** **Umbral cerrado (D-11):** el sondeo pasa a Investigación y Desarrollo cuando **5 cuentas distintas responden que sí y al menos 2 piden más detalle**, medido sobre los primeros tres envíos del boletín.
  - **RF-10.9.1** Las opciones de respuesta deben distinguir **el interés del compromiso**: tocar "me interesa" cuesta un segundo, pedir detalle cuesta tiempo del cliente. Solo la segunda alimenta el segundo criterio del umbral.
  - **RF-10.9.2** El plazo es parte del umbral. Sin fecha, un umbral no se cumple ni se descarta: se queda flotando.
- **RF-10.10** **Lo que se sondea es contratar un agente autónomo como unidad**, con su expertise, no talento humano que se apoya en agentes. Son dos ofertas distintas: una vende una persona, la otra vende una capacidad que no tiene disponibilidad, no renuncia y no se agota. La redacción no debe confundirlas.
- **RF-10.11** La tarjeta **puede presentarse con la forma de una tarjeta de perfil** —un agente entre los perfiles es la metáfora exacta de lo que se vendería— siempre que declare de forma inequívoca que **aún no existe**. Sin esa declaración, el usuario intentará sumarlo a su equipo.

- **RF-11.1** RF-10 introduce un **espacio de tarjeta que no es un perfil** dentro del grid. Se implementa como un tipo de tarjeta con reglas propias, no como un caso especial del sondeo, porque es reutilizable: la tarjeta de "no encontramos ese rol, ¿lo buscamos para ti?" y, más adelante, las células de V2-4.
- **RF-11.2** Se trata como **excepción gobernada, nunca como inventario publicitario disponible**. Todo espacio no-perfil hereda las restricciones de RF-10.2 a RF-10.6. Un grid con varios espacios no-perfil compitiendo con los resultados destruye la utilidad de la herramienta y se nota de inmediato desde el otro lado de la pantalla.

- **RF-2.3** Facetas mínimas: Rol · Categoría · Seniority · Stack/Tecnología · Sector de experiencia · Modalidad · Disponibilidad.

- **RF-2.8** Estado sin resultados con salida activa (ver §6.4).
---

## EP-003 — Evidencia del perfil

**Resumen.** Tarjeta y ficha que comunican una capacidad verificada —no una persona— con las cuatro dimensiones Neural-Grid, la trayectoria en prosa humana, condiciones operativas y SLA.

**Justificación.** Es donde se juega la conversión y, sobre todo, donde se juega la marca. Aquí se materializa la decisión D-1: sin nombre, con la capacidad como título y el código relegado al pie. Si esta épica se ejecuta mal, el portal se siente un catálogo de personas y el daño no se repara con copy.

**Objetivos del PRD que cubre:** O2
**Capabilities:** RF-3 (completo) · RF-6 (completo)
**Fase:** Low-Fi + MVP
**Capa:** `layer: business`
**Métrica de éxito:** al menos el 60% de las sesiones abren como mínimo una ficha; ninguna revisión de marca detecta lenguaje de inventario aplicado a personas.
**Decisión abierta que la condiciona:** D-5, grado de detalle de la trayectoria — crítica desde el cierre de D-1.

**Historias anticipadas:** leer la tarjeta y entender la capacidad · abrir la ficha completa · consultar las 4 dimensiones Neural-Grid · ver condiciones operativas y SLA · citar el perfil por su código · leer el encuadre del estándar antes del primer resultado.

### Requisitos de esta épica

- **RF-3.1** La tarjeta muestra **nombre y primer apellido** del profesional (D-1 revertida), con la **capacidad como descriptor inmediato** —rol, seniority y anclaje de experiencia— y debajo 3–5 tecnologías ancla, sector, modalidad y disponibilidad. Incluye el **sello Neural-Grid** en la forma definida por RF-3.8. Sin foto.
- **RF-3.2** La ficha muestra: resumen del perfil, experiencia demostrable con clientes y escala, competencias del Sello Personal, formación general, stack, y **el contenido concreto de las tres validaciones de entrada de ese perfil** —tipo de prueba, alcance y fecha— presentado como evidencia, no como insignia. Cierra con condiciones operativas, SLA y la garantía de servicio (Anexo B.6).
- **RF-3.3** Se publican **nombre y primer apellido**. **No se publican**: fotografía, correo, teléfono, perfiles en redes, ni hoja de vida en ningún formato. La ficha mantiene visible que **la conversación sobre este profesional va por Trycore y que no hay vía de contacto directo desde el portal**. Tras D-10 (2026-09-18) **el portal no declara la relación laboral del profesional**: sostiene la representación comercial, no el vínculo (RF-3.3.1, RF-3.3.2).
- **RF-3.13** La disponibilidad se publica como **banda de arranque** —Inmediato, 1 semana, 2 semanas, 1 mes, Más de 1 mes— derivada de la fecha que el panel carga y que no sale del panel. Se recalcula contra la fecha del día, no la del envío. Una disponibilidad vencida produce «Por confirmar», nunca «Inmediato».
- **RF-3.4** Cada afirmación de la ficha tiene respaldo verificable en el inventario cargado por Talento Humano. Nada generado ni inferido.
- **RF-3.5** El código de referencia (p. ej. `BE-SR-014`) **nunca es título ni protagonista visual**. Vive al pie de la ficha, en letra pequeña, con el peso de un número de requisición. Existe para citar el perfil en una conversación o en el comparador, no para etiquetar a nadie.
- **RF-3.6** La calidez la carga la prosa de la trayectoria, escrita en voz humana. Prohibido el registro de inventario al describir experiencia: "unidad", "ítem", "disponible para asignación", "stock".
- **RF-3.7** Ningún campo de la lista negra del Anexo B llega al portal, ni siquiera en forma resumida o parafraseada. El panel de administración no ofrece dónde escribirlos.
- **RF-3.8 · No hay insignia Neural-Grid por perfil.** *(Decisión revertida el 2026-09-16, volviendo a la resolución de la v0.6.)* Un atributo que cumplen **todos** los perfiles publicados no discrimina, y repetirlo en cada tarjeta enseña al ojo a ignorarlo.
  - **Razón adicional que no existía en la primera resolución:** la tarjeta ya tiene de qué diferenciar. Las tres competencias verificadas, la evidencia criterio por criterio (RF-13.10) y el conteo de deseables (RF-13.9.3) compiten por la misma atención. Cuando se quitó el sello la primera vez, la tarjeta quedaba escueta; hoy el sello es ruido sobre contenido que sí discrimina.
  - El estándar se declara **una vez, arriba, como condición de entrada** (RF-6.4), y ahí pesa más que fragmentado en veintitrés insignias idénticas.
  - Lo que sí vive en cada ficha es el **contenido** de las validaciones —modalidad de prueba, qué se pidió, qué entregó, fecha—, que es información y no medalla.
  - **Prohibido** mostrar las cuatro dimensiones con estado o puntaje por perfil. Tres son condición de entrada —marcarlas sugiere una diferencia que no existe— y Neural Speed no aplica a los perfiles no vinculados, de modo que un indicador por dimensión afirmaría algo falso.
  - El desglose de las tres validaciones vive en la ficha (RF-3.2), donde sustancia en lugar de competir.
  - La declaración de condición de entrada del encabezado (RF-6.4) se mantiene: el sello la recuerda, no la reemplaza.
- **RF-3.9** La Experiencia Clave nunca se presenta como Grid Técnico. La experiencia es trayectoria del profesional; el Grid Técnico es validación ejecutada por Trycore. Mezclarlas vacía la dimensión más diferenciadora del estándar.
- **RF-3.10** La validación técnica se presenta con **estructura fija de cinco campos** (Anexo B.8), cualquiera sea la modalidad de prueba del rol. Nunca aparece vacía, nunca dice "no aplica" y nunca enlaza el artefacto crudo —repositorio, entregable— porque identifica al profesional y porque lo que Trycore vende es el dictamen, no el insumo.
- **RF-3.11** El detalle de la validación vive en un **bloque expandible dentro de la ficha**, nunca en un tooltip —el hover no existe en móvil y el correo se abre mayoritariamente en móvil— y nunca en la tarjeta, donde repetido en cada resultado volvería a ser la insignia decorativa que RF-3.8 elimina.
- **RF-3.12** La ficha **distingue de forma explícita lo verificado por Trycore de lo autoreportado por el profesional**. Trayectoria, formación y stack son declarados por la persona; las validaciones de seguridad, técnica y DISC son ejecutadas por Trycore. La distinción se marca visualmente, no en letra pequeña: es la respuesta a la pregunta que hace todo comprador escéptico —¿esto lo comprobaron o me lo están contando?— y es el complemento honesto del bloque de validación.

- **RF-6.1** Encabezado breve que explica el estándar Neural-Grid antes del primer resultado, sin bloquear la exploración.
- **RF-6.2** El SLA de 10 días hábiles es visible en el recorrido, no en la letra pequeña.
- **RF-6.3** Bloque de respaldo: Trycore University, Hive Mind y Coordinación de Servicio dedicada.
- **RF-6.4** **Declaración de condición de entrada**, visible antes del primer resultado y con autoridad: ningún perfil llega al portal sin verificación de identidad bajo SARO, prueba técnica en vivo y evaluación DISC. Se enuncia una vez, no se repite por tarjeta.
- **RF-6.5** **Garantía de servicio (Neural Speed)**, enunciada como propiedad del servicio y nunca como atributo de la persona: el talento que entra al proyecto trabaja con agentes de IA desde el día 1 y con línea directa al CoE. Donde exista evidencia previa del perfil en IA aplicada, se muestra como parte de su experiencia.
---

## EP-004 — Armado de equipo

**Resumen.** El usuario suma y quita perfiles a una selección persistente, la revisa como conjunto y compara hasta tres alternativas antes de decidir.

**Justificación.** Es la traducción del wishlist de Airbnb y del contenedor de proyectos de LinkedIn Recruiter. Convierte una intención vaga en un requerimiento con forma, y es lo que eleva el promedio de perfiles por solicitud —la palanca directa sobre el valor de cada oportunidad.

**Objetivos del PRD que cubre:** O2 · O4
**Capabilities:** RF-4 (completo)
**Fase:** Low-Fi + MVP
**Capa:** `layer: business`
**Métrica de éxito:** promedio de 1,8 perfiles o más por solicitud enviada.

**Historias anticipadas:** sumar un perfil al equipo · quitarlo · ver el contador desde cualquier pantalla · revisar el equipo como conjunto con fecha de inicio más temprana · comparar hasta tres perfiles · recuperar el equipo al volver.

### Requisitos de esta épica

- **RF-4.1** Sumar y quitar perfiles a una selección persistente por cuenta.
- **RF-4.2** Indicador siempre visible con el conteo, accesible desde cualquier pantalla.
- **RF-4.3** Vista de resumen: perfiles seleccionados, roles cubiertos y fecha de inicio más temprana posible del conjunto.
- **RF-4.4** Comparador de hasta 3 perfiles con los mismos criterios en paralelo.
- **RF-4.5** La selección sobrevive al cierre del navegador dentro de la vigencia del acceso.
---

## EP-005 — Solicitud de equipo y agendamiento

**Resumen.** El usuario declara el contexto de su proyecto, se identifica, revisa el resumen y envía la solicitud; la confirmación reencuadra hacia la sesión de alineación y el SLA de 10 días hábiles.

**Justificación.** Es el evento de conversión que hoy no existe en ninguna parte de la línea, y el punto donde se resuelve la tensión estratégica del §2.4: aquí el portal abre la venta mejor especificada en lugar de cerrarla como un checkout.

**Objetivos del PRD que cubre:** O1 · O2 · O3 · O4
**Capabilities:** RF-5 (completo) · RF-17.3 · RF-17.4
**Fase:** Low-Fi + MVP
**Capa:** `layer: business`
**Métrica de éxito:** al menos el 85% de las solicitudes llegan con sector, fecha de inicio y duración diligenciados; ninguna pieza del flujo comunica reserva o contratación.

**Historias anticipadas:** declarar el contexto del proyecto · identificarse cuando no se es el contacto del correo · revisar el resumen antes de enviar · enviar la solicitud · recibir la confirmación con el paso siguiente · agendar la alineación · intentar enviar con el equipo vacío.

### Requisitos de esta épica

- **RF-5.1** Formulario con las tres preguntas ya validadas por Talento Humano, en opciones cerradas, más sector y notas libres:
  - *¿Para qué iniciativa o proyecto requieren el apoyo de este perfil?* → Proyecto nuevo o nueva célula de desarrollo · Refuerzo o reemplazo en un equipo existente · Exploración preliminar o presupuestación a futuro
  - *¿Cuándo estiman que debería incorporarse el talento?* → Inmediata (1 a 15 días) · Corto plazo (dentro del mes actual) · Mediano plazo (próximo mes o trimestre)
  - *¿Por cuánto tiempo estiman la vinculación o dedicación inicial?* → 3 a 6 meses · 6 a 12 meses · Más de 12 meses o indefinido · Tiempo parcial u horas por bolsa
- **RF-5.2** Datos de contacto y cuenta pre-llenados desde los parámetros del enlace; editables.
- **RF-5.3** Resumen de confirmación antes de enviar, con el equipo completo a la vista.
- **RF-5.4** Al enviar: confirmación que explica el paso siguiente —sesión de alineación— y el SLA de 10 días hábiles, y ofrece agendar.
- **RF-5.5** El envío nunca se comunica como reserva, contratación ni bloqueo de disponibilidad.
- **RF-5.6** Quien envía puede no ser el contacto que recibió el correo. El formulario permite identificarse —nombre, cargo, correo corporativo— y esa identificación es la que viaja al CRM.
---

## EP-006 — Administración del inventario

**Resumen.** Talento Humano publica, actualiza, pausa y archiva perfiles desde un panel propio, con consentimiento obligatorio para publicar y bandeja de vigencia.

**Justificación.** Es el objetivo habilitante O5. Un perfil marcado disponible que no lo está quema la credibilidad de una cuenta activa, que es el activo más caro de la línea. Además es donde el requisito de habeas data deja de depender de la memoria de alguien y pasa a ser imposible de saltar por diseño.

**Objetivos del PRD que cubre:** O5
**Capabilities:** RF-8 (completo)
**Fase:** Low-Fi (CRUD simulado) + MVP
**Capa:** `layer: foundational`
**Métrica de éxito:** 90% o más de los perfiles publicados con disponibilidad actualizada en los últimos 30 días; cero perfiles publicados sin consentimiento registrado.
**Decisión abierta que la condiciona:** D-8, alcance del panel en v1.

**Historias anticipadas:** crear un perfil · registrar consentimiento antes de publicar · actualizar disponibilidad en dos clics · pausar un perfil asignado · archivar un perfil que salió del banco · previsualizar la ficha · revisar la bandeja de vigencia · cargar perfiles masivamente · consultar el registro de auditoría.

### Requisitos de esta épica

- **RF-8.1 · Acceso al panel: correo corporativo de Trycore con código de un uso** (D-22 revisada el 2026-09-24). Quien administra entra con su correo `@trycore.com`, recibe en él un código de un uso y abre una sesión de duración corta. **No se instala proveedor de identidad** (Keycloak, OAuth o similar): el hosting compartido no lo justifica y el correo corporativo ya resuelve lo que la identidad corporativa prometía. No es el mismo mecanismo que el del cliente y no debe serlo: el cliente entra dos o tres veces al año y es externo; quien administra el panel entra cada semana, escribe datos y maneja información personal de profesionales.
  - **RF-8.1.1 · Por qué el buzón corporativo y no credenciales propias.** No hay contraseñas nuevas que administrar; **el segundo factor se hereda del buzón**, que ya lo tiene configurado; y —lo decisivo— **cuando alguien sale de la empresa su buzón muere y con él la posibilidad de recibir el código**. La sesión vigente caduca sola en horas, así que nadie tiene que acordarse de desactivar a nadie.
  - **RF-8.1.2 · Dos roles.** *Administrador de inventario* (Talento Humano): crea, edita, publica, importa, genera enlaces y administra catálogos. *Observador* (Mercadeo y Comercial): consulta inventario, enlaces, colocados, demanda y cobertura. No escribe nada.
  - **RF-8.1.3 · Sin identidad no hay auditoría.** RF-8.9 exige registrar qué cambió, quién y cuándo. El «quién» es el correo corporativo verificado con el código.
  - **RF-8.1.4** El panel vive en una dirección distinta y **nunca es alcanzable desde el enlace del cliente**.
  - **RF-8.1.5 · Lista nominal de acceso.** Tener un correo `@trycore.com` no basta: el panel solo envía código a los correos inscritos en su lista, cada uno con su rol. Los administradores de inventario mantienen la lista desde el panel; el primer administrador se siembra en la configuración del servidor. A un correo no inscrito se le responde igual que a uno inscrito —«si tu correo tiene acceso, te llegó un código»—, para no revelar quién está en la lista.
  - **RF-8.1.6 · Duración de la sesión: una jornada, doce horas como máximo**, y cierre por inactividad a los sesenta minutos. Es un panel que escribe datos personales: una sesión de semanas convierte un portátil olvidado en un acceso abierto.
- **RF-8.2** Crear y editar perfiles con todos los atributos del modelo de datos.
- **RF-8.3** Estados del perfil: **borrador · publicado · pausado · archivado**. "Eliminar" archiva; nunca hay borrado físico, para conservar trazabilidad de lo que se mostró en solicitudes pasadas.
- **RF-8.4** Campo obligatorio de consentimiento registrado: un perfil no puede pasar a *publicado* sin él. Tras revertirse D-1, el consentimiento debe ser **nominal y explícito** —autoriza publicar nombre y primer apellido junto con la trayectoria y los clientes nombrados, ante cuentas cliente, de forma continua—. El consentimiento recogido para una publicación anonimizada **no cubre este uso** y debe recogerse de nuevo.
- **RF-8.5** Actualizar disponibilidad en dos clics desde el listado, sin abrir el perfil completo.
- **RF-8.6** Carga y actualización masiva. Detallada en **RF-8.15**.
- **RF-8.7** Vista previa exacta de la ficha antes de publicar.
- **RF-8.8** Bandeja de vigencia: perfiles sin actualización en más de 30 días, marcados para revisión.
- **RF-8.9** Registro de auditoría: qué cambió, quién y cuándo.
- **RF-8.10** **La publicación de un perfil nunca se bloquea por falta del reporte detallado de validación.** Basta el Nivel 0 (Anexo B.9), que se deriva del rol sin intervención. El detalle enriquece la ficha cuando existe.
- **RF-8.11** Talento Humano puede **adjuntar el artefacto de evidencia tal como lo tenga** —documento, repositorio o transcripción— y el sistema propone un borrador de los campos descriptivos para su revisión. El artefacto se almacena internamente y nunca se expone en el portal (B.8.4).
  - **RF-8.11.1 · Formatos y límites (§8.3).** **El proyecto no opera con video.** La evidencia es un documento, una transcripción en texto o el enlace a un repositorio. El archivo se guarda **fuera de la carpeta pública**, con un máximo de 64 MB por archivo, y el borrador se genera a partir de ese texto.
- **RF-8.12** **El léxico de búsqueda se administra desde el panel.** Términos del cliente, sinónimos y su equivalencia en rol, tecnología o sector. Si vive en el código, en seis meses está desactualizado. Las consultas sin coincidencia se ofrecen como candidatas a incorporar al léxico o a la agenda de reclutamiento.
- **RF-8.13** **Pestaña de perfiles colocados**, con la cuenta, la fecha de inicio y la de vencimiento, ordenada por proximidad del vencimiento y destacando los que vencen dentro de 60 días.
  - **RF-8.13.1** Es **espejo de solo lectura**. La fuente de verdad vive en el sistema de asignación; el panel muestra la fecha de corte del último sincronizado y lo marca como tal. Duplicar una fuente de verdad sin declararlo es cómo un dato desactualizado termina sosteniendo una decisión. **La sincronización es periódica, nunca en tiempo real** —tarea programada diaria o importación del archivo que el sistema de asignación exporte—, porque el hosting no sostiene conexiones permanentes con sistemas internos (§8.3).
  - **RF-8.13.2** **Un perfil colocado no se oculta: se ofrece para cuando queda libre.** Permanece *publicado* con su disponibilidad igual a la fecha de fin de la asignación. Ocultarlo esconde inventario que sí es vendible —un perfil que arranca en un mes es información útil para un cliente que planea el trimestre siguiente, y así se lo muestra el portal según RF-3.13— y con un banco de decenas, ocultar cuatro perfiles es caro. *Corrige la redacción anterior de este requisito, que forzaba el estado pausado.*
  - **RF-8.13.3** Esta pestaña es el disparador operativo de la renovación anticipada (V2-2): convierte un dato administrativo en una lista de conversaciones comerciales con fecha.
- **RF-8.14 · Coherencia entre estado y disponibilidad.** Son **dos ejes distintos** y el panel no debe permitir que se contradigan.
  - **RF-8.14.1** El **estado** responde si el perfil puede mostrarse: *borrador* (incompleto o sin consentimiento), *publicado*, *pausado*, *archivado*. La **disponibilidad** responde desde cuándo puede empezar. Confundirlos lleva a usar el estado para expresar fechas, que es lo que produjo la regla equivocada de RF-8.13.2.
  - **RF-8.14.2** **Pausar exige motivo**, elegido de una lista corta: en proceso de selección con otro cliente, en licencia o ausencia temporal, decisión de Talento Humano. **Si el motivo es una fecha, no es una pausa**: es disponibilidad, y el perfil debe quedar publicado con la fecha correcta.
  - **RF-8.14.3** El panel **señala las incoherencias en la propia fila**, con la acción que las corrige en un clic. Incoherencias de severidad alta impiden publicar; las medias se advierten sin bloquear.
  - **RF-8.14.4** **Una disponibilidad vencida y sin actualizar no se afirma.** Si la fecha ya pasó y el perfil lleva más de 30 días sin tocarse, el portal muestra **«Disponibilidad por confirmar»** en lugar de «Disponible ahora». Afirmar disponibilidad con base en un dato que nadie sostiene es la forma más silenciosa de perder credibilidad con una cuenta activa.
- **RF-8.15 · Importación masiva de perfiles.** Especificación completa en `docs/10-specs/importacion-masiva.md`.
  - **RF-8.15.1 · Acepta hoja de cálculo y JSON, y detecta cuál recibió.** Quien importa no tiene un JSON: tiene una hoja de cálculo. El camino principal es pegar celdas desde Excel; el JSON es el camino de máquina, para integraciones y agentes.
  - **RF-8.15.2 · La llave es el código.** Existente actualiza, nuevo crea en borrador. **Dos filas con el mismo código son un error**, nunca «gana la última»: una regla de precedencia silenciosa aplica un cambio que nadie decidió.
  - **RF-8.15.3 · Modo de importación explícito**: crear y actualizar · solo actualizar · solo crear. Sin este control, un archivo destinado a actualizar disponibilidad crea perfiles fantasma por un código mal escrito.
  - **RF-8.15.4 · Fusión, no reemplazo.** Solo se modifican los campos presentes. **Campo ausente y celda vacía no tocan nada; solo un `null` explícito vacía un campo.** Sin esta distinción nadie puede vaciar un campo a propósito ni evitar vaciarlo por accidente, que es el error clásico de estos procesos.
  - **RF-8.15.5 · Nada se modifica antes de confirmar.** Vista previa con cada fila como tarjeta colapsada, agrupada en nuevos, actualizados, archivados, sin cambios, omitidos y con error. En los actualizados se muestran **solo los campos que cambian**, con valor anterior y nuevo. Cada tarjeta se puede excluir individualmente.
  - **RF-8.15.6 · Los valores nuevos se destacan.** Un rol o una tecnología que no existe en el banco se marca como valor nuevo en la taxonomía. No se bloquea —ampliar la taxonomía es legítimo— pero un error de digitación crea una tecnología fantasma que contamina los filtros para siempre.
  - **RF-8.15.7 · Prohibiciones.** La importación **no borra perfiles**, **no concede consentimiento** —puede revocarlo— y **no publica**: los perfiles nuevos llegan a borrador. Si el consentimiento se pudiera otorgar pegando un archivo, el bloqueo de RF-8.4 se saltaría con un pegado.
  - **RF-8.15.8 · La última importación se revierte por completo**, con el estado anterior de cada perfil tocado. Aquí nos apartamos del patrón de los CRM, que permiten borrar lo creado pero no deshacer lo actualizado: con un banco de decenas de perfiles curados a mano, volver atrás vale más que en un CRM de cientos de miles de registros. Revertir no borra los perfiles creados: los archiva.
  - **RF-8.15.9 · Exportar el banco** en JSON y en CSV. La forma más confiable de obtener el formato correcto es sacar lo que ya existe, editarlo y devolverlo.
  - **RF-8.15.10 · Descargar solo las filas con error**, con su motivo y en el formato en que llegaron, para corregir y reimportar únicamente esas.
- **RF-8.16 · Catálogos paramétricos.** Roles, familias, tecnologías, sectores, modalidades de prueba y motivos de pausa **se administran desde el panel**, no viven en el código.
  - **RF-8.16.1 · El criterio de qué es paramétrico.** Es administrable **lo que cambia sin que cambie el producto**. Que Talento Humano agregue una modalidad de prueba no es un cambio de producto. Que "lo más cercano" sea fallar exactamente un criterio sí lo es: eso es lógica, y ponerlo en una pantalla de ajustes invita a que alguien lo toque sin saber qué rompe. **Quedan fuera**: los bloqueos por consentimiento, la prohibición de publicar por importación, el contrato del modelo y el umbral del sondeo, que es un experimento con fecha y no un parámetro operativo.
  - **RF-8.16.2 · Crear un valor es un acto deliberado, no el efecto secundario de escribir.** En el editor de perfiles, tecnologías, sectores y rol **se seleccionan del catálogo**. Nunca texto libre: el texto libre construye la taxonomía por tecleo, y «Figma», «figma» y «Fgima» se vuelven tres tecnologías distintas que contaminan los filtros para siempre.
  - **RF-8.16.3 · Detección de parecidos antes de crear.** Al escribir un valor que no existe, el sistema muestra los existentes que se le parecen —por distancia de edición y por contención— y ofrece usarlos. Crear queda disponible, pero después de haber visto la alternativa.
  - **RF-8.16.4 · Los catálogos tienen dependencias y el panel las encadena.** Un rol exige familia; la familia determina qué modalidades de prueba se le ofrecen. **Una familia sin modalidades de prueba impide publicar** cualquier perfil de esa familia, y el panel lo advierte al crear el rol, no después.
  - **RF-8.16.5 · Un valor en uso no se borra: se desactiva.** Desactivar impide elegirlo en perfiles nuevos; los que ya lo tienen lo conservan. Borrar una modalidad que cinco perfiles referencian dejaría sus fichas sin el texto que explica cómo se validaron. **No existe la acción de borrar, y es a propósito.**
  - **RF-8.16.6 · Fusión de duplicados.** Dos valores que son el mismo se fusionan, y el cambio se aplica a todos los perfiles que los usan. Sin esto, cualquier error de tecleo es permanente.
  - **RF-8.16.7 · La relación entre rol y tecnologías no se declara.** Emerge de los perfiles reales y el panel de ajuste del cliente la calcula (RF-13.7). Declararla a mano sería trabajo doble que se desactualiza. Para un rol recién creado sin perfiles, se ofrece el catálogo completo.
  - **RF-8.16.8** Agregar una modalidad de prueba **exige redactar su texto de cara al cliente en ese momento**. Sin texto no hay opción.
---

## EP-007 — Integración con HubSpot

**Resumen.** Cada solicitud enviada se convierte en una oportunidad en el pipeline comercial, asociada al contacto y a la empresa correctos, con todas las propiedades del requerimiento y su propietario asignado.

**Justificación.** Es lo que convierte una señal de interés en trabajo comercial real. Sin esta épica, la solicitud muere en el portal y el comercial se entera tarde o no se entera. También es la fuente de la métrica de O1.

**Objetivos del PRD que cubre:** O1 · O3 · O4
**Capabilities:** RF-9 (completo) · RF-17.1 · RF-17.2 · RF-17.5
**Fase:** MVP
**Capa:** `layer: business`
**Métrica de éxito:** el 100% de las solicitudes enviadas tienen su oportunidad correspondiente en el CRM; cero registros duplicados de empresa; tiempo de solicitud a alineación agendada de 3 días hábiles o menos.
**Desbloqueada el 2026-09-15.** D-6 cerrada: negocio en el pipeline propio de la línea, con propiedad de origen. D-7 cerrada: negocio nuevo asociado como relacionado al existente.

**Historias anticipadas:** crear la oportunidad al enviar · asociar contacto y empresa existentes · crear contacto nuevo dentro de empresa conocida · escribir las propiedades del requerimiento · registrar el resumen en la línea de tiempo · asignar propietario y notificar · recuperar una solicitud cuya integración falló.

### Requisitos de esta épica

- **RF-9.1** Al enviar la solicitud se crea un negocio en el **pipeline propio de la línea People Service** (D-6), en su etapa de entrada.
  - **RF-9.1.1** El negocio lleva una propiedad de **origen** que distingue lo que entra por el portal de lo que entra por gestión comercial. Sin ella, el pipeline propio impide comparar el rendimiento del portal contra los demás orígenes de la línea, que es el KPI de §11.
  - **RF-9.1.3** El negocio lleva una **propiedad de fecha de alineación agendada**. Al usar las etapas del pipeline comercial (D-21), la sesión de alineación no tiene etapa propia y sin este dato **O3 no se puede medir**: no habría forma de ver cuántas solicitudes mueren entre que llegan y que la sesión ocurre. Una propiedad de fecha resuelve la medición sin obligar a nadie a aprender un juego de etapas nuevo.
  - **RF-9.1.2** Un pipeline aparte significa que el comercial tiene que mirar en dos sitios. La notificación de RF-9.5 deja de ser una cortesía y pasa a ser el mecanismo que evita que una solicitud se quede sin ver.
- **RF-9.2** El negocio se asocia al contacto y a la empresa existentes. Nunca se duplican registros. **Si la cuenta ya tiene un negocio abierto, se crea uno nuevo y se asocia como relacionado** (D-7): actualizar el existente conservaría un solo registro pero borraría la atribución de origen, y sin origen el portal no se puede medir. Si quien solicita es una persona nueva dentro de una empresa conocida —consecuencia directa de D-4—, se crea el contacto y se asocia a la empresa existente; jamás se crea una empresa duplicada.
- **RF-9.3** Propiedades del negocio: perfiles solicitados, roles, sector, fecha de inicio deseada, duración, modalidad, campaña y correo de origen.
- **RF-9.4** El resumen completo de la solicitud queda en la línea de tiempo del contacto.
- **RF-9.5** El propietario del negocio se asigna según el propietario de la cuenta. Notificación a Comercial y a Delivery.
- **RF-9.6** Si la creación falla, la solicitud no se pierde: cola de reintento y alerta al responsable. Ninguna solicitud puede quedar solo en el portal.
  - **RF-9.6.1 · La cola es una tabla, no un servicio.** El hosting no admite colas de trabajo ni procesos permanentes (§8.3). La solicitud se guarda primero en la base de datos y después se envía a HubSpot. Si falla, queda marcada como pendiente y una tarea programada la reintenta cada cinco minutos con espera creciente. Al tercer fallo se avisa por correo al responsable, sin dejar de reintentar. Guardar antes de enviar es lo que garantiza que ninguna solicitud dependa de que HubSpot responda en ese segundo.
  - **RF-9.6.2 · Vigilancia de la tarea.** Si la tarea de reintento o la de escalamiento lleva más del doble de su intervalo sin ejecutarse, se avisa por correo al responsable técnico. Una cola que nadie procesa es otra forma de que la solicitud se quede solo en el portal.
- **RF-9.7 · Notificación con escalamiento.** Con pipeline propio (D-6), el comercial no ve la solicitud por casualidad: la notificación es lo único que evita que exista y nadie la atienda.
  - **RF-9.7.1** Al enviarse una solicitud se notifica **al propietario de la cuenta y a Coordinación de Servicio**, por el canal de trabajo diario del equipo, no solo por correo.
  - **RF-9.7.2** La notificación trae lo necesario para decidir sin abrir el CRM: cuenta, quién solicita, perfiles o especificación, momento de incorporación y enlace al negocio.
  - **RF-9.7.3 · Escalamiento.** Si nadie abre el negocio en **4 horas hábiles**, se reenvía a la dirección comercial. A las **24 horas hábiles** sin movimiento de etapa, se escala a Dirección General. Un punto único de falla sin escalamiento no es un mecanismo: es una esperanza. *Mecanismo:* una tarea programada cada quince minutos compara los plazos en horas hábiles contra el estado del negocio en HubSpot. Es lo que obliga a activar las tareas programadas del hosting desde la v1 (§8.3).
  - **RF-9.7.4** El tiempo entre la notificación y la primera apertura del negocio se registra. Es la métrica que dice si el mecanismo funciona, y sin ella el escalamiento se calibra a ciegas.
---

## EP-008 — Telemetría y medición

**Resumen.** El portal emite los eventos que permiten medir la intención, atribuir cada sesión a su cuenta y su correo de origen, y distinguir lo que ocurre con el conjunto curado de lo que ocurre por descubrimiento.

**Justificación.** Sin esta épica no hay forma de saber si el portal funciona ni de decidir qué perfiles reclutar. El indicador de acierto de la curaduría —qué porcentaje de solicitudes incluye al menos un perfil de los propuestos— solo existe si esta épica existe, y es el que le dice a Mercadeo si el criterio con que arma el correo es correcto.

**Objetivos del PRD que cubre:** O1 · O2 · O5
**Capabilities:** RF-7 (completo)
**Fase:** MVP
**Capa:** `layer: business`
**Métrica de éxito:** el tablero mensual reporta conversión, acierto de la curaduría y el top 10 de búsquedas sin resultados sin intervención manual.

**Historias anticipadas:** registrar la entrada atribuida al correo · registrar filtros aplicados · distinguir curaduría de descubrimiento · registrar el embudo hasta el envío · reportar búsquedas sin resultados · reportar filtros más usados.

### Requisitos de esta épica

- **RF-7.1** Eventos: entrada, filtros aplicados, ampliación de búsqueda, fichas abiertas, perfiles sumados y retirados, comparaciones, solicitud iniciada, solicitud enviada, abandono.
- **RF-7.2** Reporte de filtros más usados y de búsquedas sin resultados — insumo directo para decidir qué perfiles reclutar.
- **RF-7.3** Atribución de cada sesión a la cuenta, al contacto y al envío de correo que la originó.
- **RF-7.4** Distinguir interacción con el conjunto curado frente a interacción por descubrimiento. Mide si la curaduría acierta.
---

## EP-009 — Entrada por instrucción y Perfil Objetivo

**Resumen.** El cliente escribe o pega lo que necesita en lenguaje natural; un modelo lo interpreta contra la taxonomía de Trycore, el portal muestra su lectura, y de ahí nace un Perfil Objetivo editable que es una especificación y no una persona.

**Justificación.** Es el cambio de fondo de la Fase 2. El usuario objetivo busca un perfil dos o tres veces al año y no conoce nuestra taxonomía: obligarlo a traducir su necesidad a nuestras facetas es cobrarle el trabajo de aprender nuestro vocabulario. El Perfil Objetivo, además, convierte el cero resultados de callejón en objeto accionable — que es lo que habilita EP-010.

**Objetivos del PRD que cubre:** O2 · O4
**Capabilities:** RF-12 (completo) · RF-13 (completo) · RF-16 (completo) · RF-2.6
**Fase:** Mid-Fi + MVP
**Capa:** `layer: business`
**Métrica de éxito:** tiempo hasta el primer perfil abierto igual o menor que con facetas, con tasa de solicitud igual o mayor.
**Prueba que la falsea:** si el tiempo sube y la tasa de solicitud no se mueve, el patrón está mal aplicado. Es condición de permanencia, no de lanzamiento.
**Sin bloqueos.** D-16 se cerró el 2026-09-21 en persistencia por dispositivo: RF-13.4 ya no depende de una revisión del modelo de acceso.

**Historias anticipadas:** escribir una instrucción en lenguaje natural · partir de una sugerencia precargada · pegar un requerimiento y obtener chips editables · ver cómo se interpretó la consulta · corregir la interpretación · revisar y editar el Perfil Objetivo · responder una pregunta de perfilamiento sin perder los resultados · recuperar el Perfil Objetivo al volver · seguir buscando si el modelo no responde.

### Requisitos de esta épica

- **RF-12.1** La entrada principal es una **barra de instrucción en lenguaje natural**, nunca vacía: llega precargada con el proyecto activo de la cuenta y tres o cuatro instrucciones sugeridas. *(M-01 · evidencia D+E)*
  - *En contra:* las sugerencias pueden anclar al cliente en lo que tenemos y contaminar el registro de demanda de RF-15.
  - *Falsa la hipótesis:* si más del 60% de las consultas son sugerencias enviadas sin editar, no estamos captando demanda, la estamos dictando.
- **RF-12.2** El usuario puede **pegar un requerimiento completo** y el portal extrae los criterios como **chips editables**. *(M-02 · evidencia B)*
  - *En contra:* un requerimiento corporativo real trae cláusulas e historia del proyecto; puede producir diez chips donde importan tres, y limpiarlos es justo la fricción que queríamos evitar.
  - *Prueba previa obligatoria:* pegar cinco requerimientos reales de clientes actuales y contar cuántos chips sobran. Sin esa prueba, RF-12.2 no se construye.
- **RF-12.3** **La interpretación es visible antes del resultado.** *(M-03 · evidencia A+B)*
  - *En contra:* para una consulta obvia, mostrarla es un paso de ruido.
  - *Resolución:* se muestra siempre que la confianza de la interpretación esté bajo umbral, y de forma compacta cuando esté por encima.

- **RF-13.1** La consulta produce un **Perfil Objetivo: una especificación, no una persona** — familia de rol, capacidades, seniority, condiciones de trabajo y contexto del proyecto. *(M-04 · evidencia A+E)*
  - *En contra, y es el mejor argumento del documento:* es un paso adicional en un flujo cuyo argumento de venta es la velocidad. Torre puede pagarlo porque su búsqueda tarda; la nuestra es instantánea sobre decenas de perfiles.
  - *Falsa la hipótesis:* medición A/B de **tiempo hasta el primer perfil abierto**, con y sin Perfil Objetivo. Si el tiempo sube y la tasa de solicitud no, el patrón está mal aplicado aunque la idea sea correcta. Es **condición de permanencia**, no de lanzamiento.
- **RF-13.2** Las **preguntas de perfilamiento corren en paralelo**, máximo dos, con opciones tocables, mientras los primeros resultados ya se ven. Nunca como compuerta. *(M-05 · evidencia A+C)*
  - *Corrige* la regla previa de "nunca preguntar antes de mostrar un resultado".
  - *En contra:* si la búsqueda responde en milisegundos, las preguntas aparecen junto a resultados completos y se leen como innecesarias.
- **RF-13.3** El Perfil Objetivo es **editable de forma continua**, no un modal de confirmación. *(M-06 · evidencia E)*
  - *En contra:* sin momento explícito de confirmación, la requisición puede llegar a Talento Humano a medias.
  - *Prueba:* revisar la calidad de las primeras veinte requisiciones generadas.
- **RF-13.4** El Perfil Objetivo **persiste contra la cuenta**, no contra la sesión. *(M-07 · evidencia E)*
  - *En contra:* con acceso por enlace firmado, "cuenta" es una ficción que puede filtrar la especificación de un cliente a quien reenvíe el enlace.
  - *Bloqueante:* revisión del modelo de acceso con el CTO antes de implementar. Hay implicación de ISO 27000.
- **RF-13.5** El Perfil Objetivo captura **dónde se necesita el perfil**: país y ciudad.
  - **RF-13.5.1** Es **obligatorio** cuando la modalidad de la necesidad es **Presencial 100%** o **Híbrido**, y opcional cuando es Remoto. La ubicación de la cuenta no se asume como respuesta: una aseguradora con sede en Bogotá puede estar abriendo operación en Ciudad de México.
  - **RF-13.5.2** Entra **Presencial 100%** como modalidad de la necesidad. El banco actual solo registra Remoto e Híbrido como modalidades que el profesional acepta, de modo que ambas cosas no son el mismo campo y no deben compararse como si lo fueran.
  - **RF-13.5.3** **Distinción obligatoria**: *ubicación de la necesidad* es dato del cliente; *ubicación del profesional* es dato del banco. Tras D-18: **el país del profesional se publica y la ciudad no.** La ciudad se carga y queda disponible para Delivery, y **se cruza en la sesión de alineación**.
  - **RF-13.5.5** El país **se muestra siempre** en la tarjeta y en la ficha, pero **solo es filtro cuando el banco tiene más de un país publicado**. Un filtro con una sola opción no informa nada y ocupa espacio. Es la misma regla de opciones consecuentes de RF-13.7.
  - **RF-13.5.6** Cuando la necesidad es presencial o híbrida, el portal indica que el emparejamiento se hace **por país** y que la ciudad se revisa en la alineación. **No debe decir que el dato no existe**: existe, y afirmar lo contrario sería falso una vez cargado.
  - **RF-13.5.4** País y ciudad viajan al registro de demanda (RF-15.1) y a la solicitud. La concentración geográfica de la demanda presencial es insumo de decisión de huella: dónde conviene tener talento y dónde no.
- **RF-13.6 · El reto, no el rol.** El Perfil Objetivo abre con **qué tiene que estar funcionando cuando el proyecto termine**, antes que con la familia de rol.
  - *Por qué:* quien busca no tiene como meta contratar un diseñador de experiencia; tiene como meta que su proyecto salga. Hablarle en unidades de perfil es hablarle de nuestro inventario en lugar de su problema.
  - *Qué habilita:* que el cero deje de ser un callejón —"no tenemos ese perfil, pero para este reto tenemos estos tres"—; que Delivery reciba el resultado esperado y no solo el rol pedido, que es justamente lo que el modelo comercial dice querer diagnosticar; y que la unidad de venta pueda ser una célula con una misión, lo cual disuelve de raíz el riesgo de mercantilización.
  - *Costo:* un campo más en una pantalla cuyo argumento es la velocidad. Es opcional: quien solo quiere un perfil lo deja vacío y el flujo no cambia.
- **RF-13.7 · Opciones consecuentes.** El Perfil Objetivo es un **panel de ajuste**, no un formulario de campos libres. Cada campo calcula sus opciones **contra lo ya seleccionado en los demás**, con el conteo real de perfiles del banco. Elegir *Desarrollador Frontend* deja en tecnologías las que existen para ese rol, no las de otras disciplinas.
  - **RF-13.7.1 · Tecnologías es selección múltiple, nunca texto libre.** El texto libre produce datos que no se pueden filtrar, contar ni comparar, y le pide al cliente que adivine cómo escribimos nosotros.
  - **RF-13.7.2 · Dos niveles, y esta es la regla que impide que el panel se vuelva una jaula.** El Perfil Objetivo describe **lo que el cliente necesita**, no lo que tenemos. Por eso ofrece primero las opciones del banco con su conteo, **y permite añadir lo que no tenemos, marcado como no disponible**. Restringir el panel al inventario destruiría el camino del cero (RF-14.3) y el registro de demanda (RF-15), que es el activo de mayor valor del portal.
  - **RF-13.7.3** Una opción fuera del banco **no se usa como criterio de emparejamiento** —no puede filtrar contra algo que no existe— pero **sí viaja a la solicitud y al registro de demanda** como necesidad no cubierta.
  - **RF-13.7.4** El panel muestra en todo momento **cuántos perfiles quedan** con la combinación seleccionada, para que el cliente entienda si está cerrando demasiado antes de llegar a un cero.
  - *En contra:* la cascada puede ocultarle al cliente opciones que sí querría considerar. Se mitiga con el acceso explícito a la lista completa del banco y con el conteo visible en cada opción.
- **RF-13.8 · Un solo motor de criterios.** El panel y los resultados se calculan con **la misma lógica**: el panel es el filtro, los resultados son lo que pasa el filtro. El contador del panel y el número de resultados son siempre el mismo número.
  - **RF-13.8.1 · Dentro de tecnologías vale *cualquiera*, no *todas*.** La interpretación devuelve el conjunto de tecnologías asociadas a un rol; exigirlas todas produce cero de forma sistemática en un banco de decenas. El campo lo declara en su etiqueta: *"basta con que tenga alguna"*.
  - **RF-13.8.2 · Un solo aviso, a nivel de panel.** Cuando ninguna combinación produce resultados se muestra **un** mensaje con los criterios activos como etiquetas removibles en un toque. Los avisos por campo se reducen a un único caso: el valor elegido no existe en el banco.
  - *Origen:* la primera versión usaba conjunción en tecnologías y una lógica distinta de la de los resultados. El panel decía cero mientras la pantalla mostraba dos perfiles, y avisaba de una incompatibilidad con campos que el usuario veía vacíos — estaban preseleccionados por la interpretación sin que se notara.
- **RF-13.9 · Obligatorio y deseable.** Cada criterio del Perfil Objetivo se marca como **obligatorio** —reduce el conjunto— o **deseable** —lo ordena—. *(Referencia: Juicebox separa filtros de criterios · evidencia A.)*
  - **RF-13.9.1 · Por qué importa más aquí que en el referente.** Juicebox usa los criterios para **ordenar 1.200 resultados**; nosotros los necesitamos para **no quedar en cero**. Con un banco de decenas, tratar todo como filtro duro cierra el conjunto en dos pasos. Mismo mecanismo, razón opuesta.
  - **RF-13.9.2 · Por omisión, solo el rol es obligatorio.** Todo lo demás entra como deseable: es la configuración que más resultados produce, y el cliente endurece lo que de verdad no puede negociar.
  - **RF-13.9.3** Los resultados se ordenan por cuántos deseables cumple cada perfil, y la tarjeta lo dice: *«cumple 3 de 4 deseables»*.
  - **RF-13.9.4** El camino del cero se activa solo cuando **ningún perfil cumple los obligatorios**. «Lo más cercano» pasa a ser quien falla exactamente un obligatorio.
- **RF-13.10 · Evidencia por criterio en la tarjeta.** Cada tarjeta muestra, criterio por criterio, **por qué coincide y por qué no**: *«✓ Banca · 8 años declarados»*, *«– Sin experiencia declarada en Seguros»*. *(Referencia: Juicebox · evidencia A.)*
  - **RF-13.10.1 · La diferencia con el referente es una restricción nuestra, no un olvido.** Las justificaciones de Juicebox las **redacta un modelo** sobre una persona real —*«indicating hands-on experience»*—. Eso choca con RF-16.1: Trycore responde contractualmente por cada perfil que publica, y una afirmación inferida sobre alguien es un riesgo que no compensa. **Nuestra evidencia es determinista**: sale de los datos del perfil, no de una redacción.
  - **RF-13.10.2** Se muestran también los criterios **no** cumplidos. Un listado que solo enseña aciertos no ayuda a decidir: ayuda a vender.
- **RF-13.11 · La ficha se abre como panel lateral**, sobre los resultados y sin perderlos, con navegación al perfil anterior y siguiente dentro del conjunto actual. *(Referencia: Juicebox · evidencia A.)* En móvil ocupa la pantalla completa.
- **RF-13.12 · Dos vistas de resultados: tarjetas y tabla.** El usuario conmuta entre ambas y la elección persiste en la sesión. *(Referencia: Juicebox ofrece *Classic view* y *Table view* · evidencia A.)*
  - **RF-13.12.1 · Para qué sirve cada una.** Las **tarjetas** sirven para evaluar un perfil a la vez; la **tabla** sirve para comparar muchos por el mismo criterio, leyendo columnas. Son dos tareas distintas y ninguna sustituye a la otra.
  - **RF-13.12.2 · Una columna por criterio activo**, con ✓ o – y el dato que lo sustenta al pasar el cursor. Es la misma evidencia determinista de RF-13.10, dispuesta para comparar.
  - **RF-13.12.3 · Sin porcentaje de coincidencia.** El referente muestra *«Match 100%»*. Nosotros mostramos **«cumple 3 de 4»**: un porcentaje sugiere una precisión que no existe cuando hay cuatro criterios, y además oculta cuáles cumple. La cifra honesta es el conteo.
  - **RF-13.12.4 · Selección múltiple.** La tabla habilita seleccionar varios perfiles y **sumarlos al equipo de una vez**, cosa que la grilla no permite y que es el motivo principal para tener tabla.
  - **RF-13.12.5** No se replican dos columnas del referente: **empresa actual** y **enlaces al perfil público del profesional**. Ambas contradicen la decisión de no exponer contacto ni empleador identificable de forma directa.
  - **RF-13.12.6** La tabla se desplaza dentro de su contenedor, nunca arrastrando la página (M-6 de §8.1).

- **RF-16.1** **El modelo interpreta. No recupera, no redacta, no ve los perfiles.** Salida estructurada contra nuestra taxonomía; recuperación determinista sobre el catálogo; degradación a léxico controlado si la API falla. *(M-19)*
  - *En contra:* se deja valor sobre la mesa; el modelo podría redactar la justificación del match.
  - *Criterio:* ese valor no compensa el riesgo de que el sistema afirme algo falso sobre una persona real por la que Trycore responde contractualmente. **Sin excepción en el MVP.**
- **RF-16.2** Al modelo se le envía **la consulta y la taxonomía; nunca los datos de los perfiles**. *(M-20)* Es una restricción, no una funcionalidad, con implicación directa en los consentimientos y en el frente de ISO 27000.
- **RF-16.3** **Separación entre la capa de especificación y la de recuperación.** El Perfil Objetivo tiene esquema versionado; la búsqueda vive tras una interfaz intercambiable. *(M-17)* Se hace porque el costo de no hacerlo es rehacer, no porque la expansión esté planeada: es una opción barata, no un compromiso.
- **RF-16.4 · El Perfil Objetivo nace multi-rol.** El campo de rol es **una lista desde el primer día**, aunque el MVP solo use un elemento. Nacer como valor único obliga, el día que exista la ruta por reto (§14), a una migración de datos sobre solicitudes históricas. Nacer como lista cuesta cero. Mismo criterio que RF-16.3: barato ahora, caro después.

- **RF-2.6** **Búsqueda en el lenguaje del cliente, no en el nuestro.** Un modelo de lenguaje traduce la instrucción del cliente a la taxonomía interna, con salida estructurada y bajo las restricciones de RF-16. Si la llamada falla, degrada a un **léxico controlado** que traduce cómo el cliente nombra lo que busca —"ingeniero de aplicaciones móviles"— a la taxonomía interna —rol *Desarrollador Móvil*, tecnologías *Flutter, React Native, Kotlin, Swift*—. Tolerante a acentos, plurales y errores de digitación.
  - **RF-2.6.1** Los resultados se presentan en dos niveles: **coincidencias directas** y **relacionados**. Un buscador que devuelve cero ante un casi-acierto es peor que no tener buscador: el cliente concluye que no hay nada cuando sí hay algo cercano.
  - **RF-2.6.2** El portal **muestra cómo interpretó la consulta** —qué rol y qué tecnologías entendió— para que el usuario corrija en lugar de adivinar por qué salió lo que salió.
  - **RF-2.6.3** Toda consulta sin coincidencia directa se registra con su texto literal (RF-7.2). Con texto libre esta señal es mucho más rica que con facetas: revela con qué palabras piensa el cliente, no solo qué casilla marcó.
  - **RF-2.6.4 · Sin índice semántico ni vectorial.** El hosting no los soporta (§8.3) y el banco no los necesita: con decenas de perfiles, la recuperación determinista sobre el catálogo completo cabe en el navegador y cumple el segundo de respuesta. Lo «semántico» vive en la interpretación del modelo y en el léxico, no en el índice.
---

## EP-010 — El camino del cero

**Resumen.** Cuando no hay coincidencia, el portal muestra el Perfil Objetivo, lo más cercano por encima del umbral de similitud, y una solicitud dirigida con el SLA de 10 días hábiles que llega a HubSpot.

**Justificación.** Con un banco de decenas de perfiles el cero es frecuente, no excepcional, y hoy es un estado de error. Bien manejado es la mejora con mayor retorno comercial de toda la Fase 2: convierte la ausencia de inventario en una conversación de reclutamiento pagada por el cliente.

**Objetivos del PRD que cubre:** O1 · O2
**Capabilities:** RF-14.3 · RF-14.4 · RF-15
**Fase:** Mid-Fi + MVP
**Capa:** `layer: business`
**Métrica de éxito:** proporción de pantallas de cero que terminan en solicitud dirigida en lugar de abandono.
**Riesgo propio:** mostrar "lo más cercano" cuando no se parece daña más que no mostrar nada.
**Bloqueada por:** D-14 (umbral de similitud) y D-13 (dueño del registro de demanda).

**Historias anticipadas:** ver el Perfil Objetivo cuando no hay resultados · ver lo más cercano solo si supera el umbral · solicitar un perfil a medida con el SLA a la vista · entender que el banco es selectivo y no pobre · que la especificación quede registrada como demanda.

### Requisitos de esta épica

- **RF-14.3** **El "sin coincidencia" es ciudadano de primera**: Perfil Objetivo a la vista, lo más cercano, y solicitud dirigida con el SLA de 10 días hábiles hacia HubSpot. *(M-13 · evidencia E)*
  - *En contra:* mostrar "lo más cercano" cuando no se parece es peor que no mostrar nada.
  - *Resuelto sin umbral numérico (D-14 cerrada):* "lo más cercano" son los perfiles que **fallan exactamente un criterio**, y la tarjeta dice cuál —"cumple todo menos el sector Banca"—. Es verificable por el cliente y explicable por el comercial; un número calibrado no sería ninguna de las dos cosas.

- **RF-14.4** **La escasez se declara, no se disimula**: el tamaño del banco se comunica como selectividad. *(M-14 · evidencia B)*
  - *En contra:* declarar selectividad con decenas de perfiles puede sonar a excusa si el cliente ya sospecha que el banco es pequeño. Sujeto a redacción validada con Comercial.

- **RF-15.1** Se registra la **especificación estructurada completa**, no el texto libre. *(M-18 · evidencia E)*
  - *En contra:* solo vale si alguien lo revisa con cadencia. Sin dueño y frecuencia definidos antes de construirlo, es una tabla que nadie abre. Y RF-12.1 puede contaminarlo con demanda inducida.
  - *Resuelto (D-13):* **Talento Humano, revisión mensual.** Es quien actúa sobre el dato. El registro deja de estar bloqueado.
---

## EP-011 — Correo curado y distribución

**Resumen.** Mercadeo arma la selección de perfiles de cada cuenta contra el proyecto que esa cuenta tiene en curso, genera el enlace parametrizado y envía. Después mide quién abrió, quién entró y quién nunca lo hizo.

**Justificación.** Es **la fuente de todo el tráfico del portal** y hasta la v4.0 del PRD vivía como un supuesto de una línea. Especificamos con enorme detalle el destino sin haber escrito nada sobre el camino: si el correo no funciona, nada de lo demás importa.

**Objetivos del PRD que cubre:** O2 · O5
**Capabilities:** RF-18 (completo) · RF-1.6 · RF-7.3
**Fase:** MVP
**Capa:** `layer: business`
**Métrica de éxito:** 40% o más de las cuentas contactadas entran al portal, y ninguna cuenta acumula tres envíos sin abrir sin que alguien lo sepa.
**Riesgo propio:** una selección armada en una hoja aparte se degrada entre que se arma y que el cliente abre el correo. Por eso RF-18.3 y RF-18.4 exigen construirla desde el panel, contra el inventario del momento.

**Historias:** armar la selección de una cuenta · generar el enlace parametrizado · programar y enviar · ver quién abrió y quién entró · reaccionar a una cuenta que nunca abre.

### Requisitos de esta épica

- **RF-1.6** El enlace se genera desde el envío de correo con los tokens de personalización de la cuenta, sin construcción manual de URLs.

- **RF-18.1** Cada envío lleva una **selección de perfiles construida para esa cuenta** contra el proyecto que Trycore sabe que tiene en curso, con su razón declarada. No es un boletín con el mismo contenido para todos.
- **RF-18.2** El enlace se genera **desde el envío**, con los tokens de personalización de la cuenta y del contacto. Nadie construye URLs a mano.
- **RF-18.3** La selección se arma **desde el panel**, no en una hoja aparte: quien la arma ve la disponibilidad real en ese momento y no propone perfiles que ya no están.
- **RF-18.4 · La curaduría se genera contra el inventario del momento del envío.** Una selección fija se degrada entre que se arma y que el cliente abre el correo, y el cliente encuentra menos perfiles de los que le prometimos.
- **RF-18.5** Cadencia definida y **dueño nominal** del envío. Un canal sin cadencia no produce el hábito que O5 necesita.
- **RF-18.6** Se registra apertura, clic y entrada al portal, atribuidos a cuenta y contacto (RF-7.3). Una cuenta que **nunca abre en tres envíos** es una señal comercial, no un fallo de entregabilidad: se escala al ejecutivo antes de seguir enviando.

- **RF-7.3** Atribución de cada sesión a la cuenta, al contacto y al envío de correo que la originó.
---

# Matriz de trazabilidad

| Épica | O1 Crecer equipos | O2 Convertir curaduría | O3 Acortar arranque | O4 Calidad del brief | O5 Inventario vivo |
|---|:---:|:---:|:---:|:---:|:---:|
| EP-001 Acceso y aterrizaje curado | | ● | | | |
| EP-002 Búsqueda y descubrimiento | | ● | | | |
| EP-003 Evidencia del perfil | | ● | | | |
| EP-004 Armado de equipo | | ● | | ● | |
| EP-005 Solicitud y agendamiento | ● | ● | ● | ● | |
| EP-006 Administración del inventario | | | | | ● |
| EP-007 Integración con HubSpot | ● | | ● | ● | |
| EP-008 Telemetría y medición | ● | ● | | | ● |
| EP-009 Instrucción y Perfil Objetivo | | ● | | ● | |
| EP-010 Camino del cero | ● | ● | | | |
| EP-011 Correo curado y distribución | | ● | | | ● |

**Cobertura bidireccional:** ✓ Los 5 objetivos están cubiertos. ✓ Las 11 épicas cubren al menos un objetivo. Sin huérfanos.

---

# Notas de descomposición

**Granularidad.** EP-008 es la más pequeña y EP-002 la más grande; la diferencia es de aproximadamente el doble, dentro del rango aceptable. No se dividió EP-002 porque su valor solo se verifica con las facetas funcionando en conjunto.

**Sin solapes.** El único límite discutible es entre EP-001 y EP-002: la primera es dueña del conjunto curado y su presentación, la segunda del banco completo y su filtrado. El punto de contacto —"ampliar la búsqueda"— pertenece a EP-001, porque lo que se está protegiendo ahí es la percepción de la curaduría, no la mecánica del filtro.

**Corte del prototipo Low-Fi (v1, entregado).** EP-001 a EP-006.

**Corte del prototipo Mid-Fi (v2).** EP-009 y EP-010 completas, más los ajustes de EP-002, EP-003 y EP-004 que trae la Fase 2. Su propósito no es demostrar que funciona: es **responder las cinco preguntas de §13.6 del PRD con clientes reales** y producir las mediciones que pueden tumbar RF-13.1 y RF-14.2.

**Dependencia nueva entre épicas.** EP-010 no existe sin EP-009: el camino del cero funciona porque hay un Perfil Objetivo que mostrar. Construir EP-010 sobre facetas sería volver al estado de error.

**Ruta crítica del prototipo.** EP-001 → EP-002 → EP-003 → EP-004 → EP-005. EP-006 corre en paralelo desde el modelo de datos.

**Ninguna épica está bloqueada por decisión abierta.** Quedan D-2 (nombre del portal, afecta diseño visual) y D-5 (detalle de la ficha), y ninguna bloquea construcción. EP-003 está condicionada por D-5, que define su calidad y no su viabilidad; Talento Humano condicionó ese VoBo a ver primero la propuesta de ficha (2026-09-18), lo que invierte el orden: la ficha se propone y después se aprueba.

> **EP-006 quedó desbloqueada y redactada.** D-8 se cerró el 2026-09-18 en **CRUD completo**: el panel entra al MVP con creación, edición, validación, consentimiento, publicación, mantenimiento y carga masiva. El 2026-09-21 se redactaron las **17 historias que faltaban (HU-123 a HU-139)** y la épica pasó de 4 a 21 historias. El alcance comprometido y el alcance redactado vuelven a coincidir, y **O5 —el objetivo habilitante— tiene por fin backlog que lo sostenga**.

> **EP-007 quedó desbloqueada.** D-6 y D-7 se cerraron el 2026-09-15 (PRD v3.0): pipeline propio de la línea con propiedad de origen, y negocio nuevo asociado como relacionado.
