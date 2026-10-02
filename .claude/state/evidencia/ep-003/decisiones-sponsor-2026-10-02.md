# Decisiones del sponsor — discovery EP-003 · EP-007 · EP-008 (2026-10-02)

Tomadas por Jesús Segura (sponsor/PO) en sesión, pregunta a pregunta. Numeración continúa D51.

| D | Tema | Decisión | Afecta |
|---|---|---|---|
| D52 | E-6 · cómo llega la solicitud a HubSpot | **Formulario de HubSpot + workflow** (no API de negocios). Se enmienda ADR-0009 y RF-9. | HU-102, 104, 105, 160–166 |
| D53 | E-7 · identificación de la empresa | **El workflow/HubSpot asocia por dominio del correo** (función nativa). El portal no crea ni asocia empresas. | HU-104 |
| D54 | Propiedades del formulario | Reutilizar propiedades **por defecto** de HubSpot; crear una propia solo si hace falta. Datos que el portal ya conoce del contacto (correo, nombre, apellido, empresa) van como **campos ocultos** prellenados: el cliente no los ve. El mensaje libre del cliente → propiedad `message` existente. Todo el requerimiento (perfiles, modalidad, momento de incorporación…) se **concatena en un párrafo** en una única propiedad nueva **«Solicitudes People Service»**. Origen y campaña en sus propiedades correspondientes (por defecto/UTM si existen). Lista de campos la propone el equipo; **Mercadeo crea** formulario, propiedad y workflow en HubSpot y entrega el ID del formulario. | HU-160, 102, 106 |
| D55 | Escalamiento 4 h / 24 h hábiles | Lo hace el **workflow de HubSpot** (retrasos en horario laboral, notificación/reasignación). El portal no consulta HubSpot. | HU-162, 163 |
| D56 | Definición de 24 h hábiles | **Calendario hábil aprobado (T-4)**: 3 jornadas de 8 h. Se corrige el prototipo. | HU-163 |
| D57 | O3 · alineación agendada | Mide **cuándo se agendó** (propiedad del negocio/contacto en HubSpot). | HU-107 |
| D58 | HU-165 aviso de detención | **Se construye dentro de EP-007**: aviso si el envío del formulario queda atascado en cola o el worker deja de latir; monitor externo = alertas de DigitalOcean App Platform. | HU-165 |
| D59 | Validación técnica en la ficha | Los **5 campos ya construidos** (D30): prueba aplicada · qué se evaluó · resultado · evaluador · fecha. Enunciado y entregables internos. | HU-155 |
| D60 | SARO/DISC · dónde se captura | **Sub-slice inicial de EP-003** (panel + migración), EP-006 sigue cerrada. | HU-176, HU-156 |
| D61 | SARO/DISC · obligatoriedad | **Ambos obligatorios para publicar**. Alcance SARO = **catálogo cerrado** administrable. | HU-176 |
| D62 | Perfiles ya publicados sin SARO/DISC | **Siguen visibles**; el panel los marca «incompleto: falta …» y no se pueden re-publicar tras editarlos hasta completarlo. La ficha omite el dato ausente. | HU-176, HU-156 |
| D63 | B.6 · validaciones de entrada y Sello | Las **tres validaciones de entrada son obligatorias** para publicar (mismo trato que D62 para los ya publicados); el **Sello Personal sigue opcional**. | HU-081, 154, motor de publicación |
| D64 | Cuatro o cinco componentes | **Cuatro dimensiones**, como el PRD. Se corrige el copy del prototipo. | HU-153, 159 |
| D65 | Ley 1581 · telemetría atribuida | **Solo aviso de privacidad** enlazado en la puerta de acceso (sin casilla). | HU-169, EP-001 puerta |
| D66 | Tablero mensual | **MVP** (con EP-008), no v1.1. | HU-108, 111, 171 |
| D67 | Quién ve Medición | **Administradores, Mercadeo, Comercial y Dirección General**; Talento Humano y observadora no. | HU-171 + |
| D68 | T-26 · sesión real | Sesión con **código verificado de un correo no @trycore.com**; las demos se marcan con una casilla «demo» al generar el enlace y no cuentan. | HU-167, 171, 111, 170 |
| D69 | Atribución | Hereda la del último correo curado **90 días** (ADR-0006). | HU-112 |
| D70 | Conversión | **Cuentas con solicitud / cuentas que entraron**, por mes; la solicitud cuenta en el mes de envío (O2). | HU-171 |
| D71 | T-25 · A/B Perfil Objetivo | **Asignación por cuenta 50/50, lectura descriptiva**, decisión en revisión trimestral; lo enciende/apaga un administrador en el panel. | HU-186 |
| D72 | HU-167 vista de recorrido | **Se incluye**: Mercadeo abre el recorrido de una visita y el estado de la captura (sin correo; seudónimo a 12 meses). | HU-167 |
| D73 | Decisiones menores | Se aplica en cada una la **opción conservadora** ya escrita en su HU (lista abajo). Ninguna recorta alcance. | varias |

## D73 — opciones conservadoras aplicadas
- Top 10 sin resultados: por **cuentas distintas**; empate en el 10.º → se muestran todos los empatados (HU-172).
- Abandono / rebote: **30 min sin actividad** cierra la sesión (HU-167).
- Cuenta sin propietario en HubSpot → la recibe **Dirección Comercial** (HU-103).
- Tarjeta: **5 tecnologías por orden de carga** (HU-153); «anclaje» = **años de experiencia** (HU-153).
- Ficha: se puede **quitar** del equipo además de sumar (HU-175); **sin** acción «Escribir a Trycore» aparte del bloque de contacto (HU-157).
- Panel **advierte** (no bloquea) lenguaje de inventario en la trayectoria (HU-154).
- Nivel 0 **sin fecha** (HU-155).
- Encabezado del estándar **también** en el encuadre de HU-093 (HU-159).
- Perfil curado no disponible al abrir **cuenta como fallo de curaduría** (HU-109); abrir un enlace revocado **cuenta como intento de entrada, no como entrada** (HU-168).
- Decisiones de reclutamiento §14.7 las registra **Talento Humano** en el panel (HU-111); la 3.ª condición del disparador **se muestra** (HU-185); quien vio y descartó una composición **cuenta en el grupo que la vio** (HU-184).
- 401/403 de HubSpot = **permanentes** (no se reintentan, van a la bandeja) (HU-166); «solicitud reciente» (D-7) = **7 días** (HU-180).
- Copy visible al cliente (encabezado del estándar, garantía Neural Speed, pie «Referencia PS-XXXX…», aviso de privacidad) se redacta con la opción del prototipo/PRD y queda **marcado para revisión de copy** en la HU.

## Segunda ronda (misma sesión, tras aplicar D52–D73)

| D | Tema | Decisión | Afecta |
|---|---|---|---|
| D74 | Permiso de Medición (corrige D67) | **Permiso «Medición» por persona** en la lista nominal del panel, independiente del rol. Se enmienda RF-8.1.2 y ADR-0006. | HU-151 (EP-006, ya construida → cambio en EP-008), HU-171 |
| D75 | O3 en el tablero | **Excepción de lectura**: el worker lee una vez al día la fecha de agendado de los negocios People Service con un token privado de HubSpot (lectura). | HU-171, HU-107 |
| D76 | Duplicados (corrige D52) | **Híbrido API + workflow**. El portal impide el doble clic (botón bloqueado + clave única por envío en la BD, una sola solicitud, un solo trabajo en cola). El worker crea/actualiza **contacto y negocio por API** con la propiedad **«Id solicitud People Service» de valor único** (HubSpot rechaza el duplicado: idempotencia real). El requerimiento va en el párrafo «Solicitudes People Service» y el mensaje libre en `message` (D54 sigue). Asociación de empresa por dominio (D53), escalamiento 4 h/24 h y avisos comerciales **se quedan en el workflow** (D55). Vuelve `HUBSPOT_PRIVATE_APP_TOKEN` (scopes mínimos: contactos y negocios lectura/escritura). Propiedades nuevas: 2. | HU-102, 105, 106, 160, 161, 164, 166, 180, ADR-0009, PRD RF-9, EP-005 |
| D77 | Jornada hábil (corrige D56) | **T-4, jornadas de 10 h**. 24 h hábiles ≈ 2,4 jornadas; los ejemplos se recalculan con T-4. | HU-162, 163 |
| D78 | Aviso a Coordinación de Servicio | **Lo envía el portal** (Mailgun) tras crear el negocio, con enlace directo al negocio. | HU-101 (EP-005) |
| D79 | Empresa inexistente | HubSpot **la crea** por dominio (nativo). Contexto: al portal solo entran clientes invitados nominalmente, así que es un caso de borde. | HU-104 |
| D80 | Encabezado del estándar | La afirmación «ningún perfil sin SARO, DISC y validaciones» **solo aparece cuando hay 0 publicados incompletos**; mientras tanto el encabezado describe el estándar sin afirmar «ninguno». | HU-159, HU-178 |
| D81 | Importación masiva | **Columnas nuevas** SARO alcance (validado contra catálogo), SARO fecha y DISC fecha en la importación y su plantilla. | HU-176 o HU nueva del sub-slice inicial de EP-003 |
| D82 | Top 10 sin resultados | Se ve en Medición **y también en «Demanda»** para Talento Humano. | HU-172 |
| D83 | Decisiones de reclutamiento | **HU-189 nueva en EP-008**: Talento Humano registra una decisión de reclutamiento en el panel (destino Demanda). | HU-189, HU-111 |
| D84 | Prueba de capacidades de HubSpot | La hace el modelo **en solo lectura** por el conector + **lista de verificación** para Mercadeo/RevOps en la interfaz. No se escribe en HubSpot. | DoR de EP-007 |
| D85 | Pipeline de las solicitudes | Pipeline existente **«Comercial (People y Tecnología)»** (no existe uno «People Service»); el negocio entra con `soluciones_ofrecidas = People Service` y `dealtype = Existing Business`. Etapa inicial: a definir con Comercial (propuesta: «35% Gestión con cliente / Solicitud de información»). | HU-102, HU-106, HU-107, PRD RF-9.1 |
| D86 | Propiedad del párrafo | **Crear «Solicitudes People Service»** (multilínea); no reutilizar `formato_people_service` (uso desconocido) ni `description`. | HU-160 |
| D87 | HU-174 (evidencia por el motor único) | **Se mueve a EP-009**, junto al motor de criterios (HU-118). No es recorte: cambia de épica. EP-003 queda sin dependencia de EP-009. | HU-174, EP-003, EP-009 |
| D88 | Capacidad base de «Mi equipo» | **Se redacta ya la HU de EP-004** «sumar y quitar perfiles de Mi equipo» (RF-4.1/4.2) con su indicador (HU-192); HU-175 depende de ella. | HU-192, HU-175 |
| D89 | Supresión Ley 1581 | **Se confirma** como HU propia de EP-008 (HU-193 «Atender una solicitud de supresión»): anonimiza eventos del contacto, conserva conteos. Sale de HU-169. | HU-169, HU-193 |
| D90 | HU-097 · correo del contacto | **Solo lectura**: se muestra el correo verificado; nombre y cargo editables. El error es «falta nombre o cargo». | HU-097 |
| D91 | HU-107 · días hábiles de O3 | **Días hábiles cruzados**, sin fracciones (lunes→miércoles = 2; mismo día = 0), con calendario T-4. | HU-107, HU-171 |
| D92 | HU-107 · fuente de la fecha de agendado | **Herramienta de reuniones de HubSpot**: `engagements_last_meeting_booked` del contacto (se llena cuando el comercial agenda con el enlace de reuniones). Sin propiedad nueva. Riesgo aceptado: lo agendado fuera de la herramienta no se mide. | HU-107 |
| D93 | HU-171 · KPI 35 % y O4 | **Ambos en el tablero**: O4 desde ya; el KPI del 35 % en «aún no se mide» hasta que EP-011 registre los envíos. | HU-171 |
| D94 | HU-185 · validación de Delivery | La registra **Coordinación de Servicio** con un permiso «Validar composiciones», en una **HU propia** (HU-195). HU-185 queda solo con la lectura de Mercadeo. | HU-185, HU-195 |
| D95 | §14.5 · tercera condición | La **validación de Delivery de las 3 composiciones** es la tercera condición del disparador; se enmienda §14.5. | HU-185, PRD §14.5 |
| D96 | HU-119 · error | **Criterio sin plantilla**: muestra ✓/– con texto genérico «cumple / no cumple <criterio>», nunca en blanco, y se registra. | HU-119 |
| D97 | HU-159 · error | **Conteo de incompletos no disponible** → el encabezado no afirma «ninguno»; muestra la versión descriptiva (D80). | HU-159 |
| D98 | §14.5 · combinación | El disparador se cumple solo con **las tres condiciones a la vez** (1 y 2 de demanda + 3 validación de Delivery). | HU-185, PRD §14.5 |
| D99 | HU-195 · permiso | «Validar composiciones» se concede **por persona como el permiso Medición** (HU-190); Coordinación de Servicio entra como observadora + este permiso. | HU-195, HU-190 |
| D100 | HU-196 · agregado de O3 | **Mediana de días hábiles + % de solicitudes agendadas en ≤ 3 días hábiles**. Ejemplo 1, 2, 2, 5, 9 → mediana 2 · 60 % en meta. | HU-196 |
| D101 | HU-175 (sumar/quitar desde la ficha) | **Se mueve a EP-004**, junto a HU-192 (análogo a D87). Cambio de épica, no recorte. EP-003 abre con 15 historias. | HU-175, EP-003, EP-004 |
| D102 | Fuente de diseño de EP-008 | Las pantallas de Medición (tablero, recorrido, aviso de privacidad, casilla «demo», permiso en Accesos, supresión) se generan con **/build:prototype en modo feature** desde el panel construido y las **aprueba el sponsor** antes de construir su UI. | EP-008 |
| D103 | HU-189 y HU-196 | **HU-189 → EP-010** y **HU-196 → EP-007**, donde nacen sus datos (análogo a D87/D101). Cambio de épica, no recorte. EP-008 abre con 20 historias. | HU-189, HU-196 |
| D104 | Pantallas de Medición (EP-008) | **Aprobadas las 45** (manifest `aprobada`). El sponsor sugiere revisar acentos visuales y branding en una pasada posterior, sin bloquear el DoR. | EP-008, docs/05-prototipo |
| D105 | Branding de Medición | Pasada de **acentos visuales de marca + revisión de tildes y redacción** sobre las pantallas de EP-008, con antes/después para el sponsor. | docs/05-prototipo (EP-008) |
| D106 | Destino «Composiciones» | **Destino propio** en el menú del panel, visible solo con el permiso «Validar composiciones» (13 destinos). | HU-195, menú del panel |
| D107 | Aviso de privacidad | El texto final lo aprueba **Jurídico de Trycore** antes de producción; en desarrollo se construye con un borrador completo (Ley 1581). | HU-187 |

## Cuarta ronda — EP-004 y EP-005 (2026-10-02; P1–P8 de EP-004 y 1–9 de EP-005 respondidas por el sponsor con la opción recomendada)

| D | Tema | Decisión | Afecta |
|---|---|---|---|
| D108 | HU-084 | **Se mueve a EP-009** (depende de HU-083). | HU-084 |
| D109 | HU-207 composiciones de Delivery | **EP-008**, junto a HU-195, en el destino «Composiciones» (D106). | HU-207 |
| D110 | Arranque del equipo (HU-203) | Fecha del **perfil más tardío**; si alguno «por confirmar», el conjunto «por confirmar». | HU-203, HU-096 |
| D111 | HU-096 vs HU-203 | HU-096 queda como **resumen antes de enviar** (RF-5.3) reutilizando la vista de HU-203. | HU-096 |
| D112 | Comparador (HU-204) | Desde **«Mi equipo» y desde la acción en grupo de la vista de tabla**; **filas fijas** de la ficha, sin criterios de EP-009. | HU-204, HU-121 |
| D113 | Renovar enlace vencido | **Se ofrece copiar** el equipo anterior (no disponibles con su estado real). Enmienda RF-4.5. | HU-205, PRD RF-4.5 |
| D114 | Perfil pausado/archivado en el equipo | **Sigue en el contador** con su estado real; no cuenta en roles ni en el arranque (RF-19.2). | HU-206 |
| D115 | Vacíos del equipo (HU-080) | **Reglas fijas en código validadas por Delivery**; S; el aviso no viaja a HubSpot en v1. | HU-080 |
| D116 | HU-099 agendar | **Entra en EP-005**, enlace de reuniones **de equipo con rotación** (HubSpot). | HU-099 |
| D117 | Obligatorios del formulario | **Inicio, duración y modalidad obligatorios**; sector y nota opcionales. | HU-197, O4 |
| D118 | Perfil no publicado al enviar | **No viaja**; aparece solo por código y estado (Ley 1581); el colocado sí viaja. | HU-198 |
| D119 | «Misma especificación» (D-7) | **Misma cuenta + mismo conjunto de perfiles**, cualquier invitado. | HU-098, HU-180, HU-201 |
| D120 | Nueva dentro de 7 días | **No**: solo añadir contexto o volver. | HU-098, HU-201 |
| D121 | Solicitud sin perfiles | **No**; el camino es «a medida» (HU-077, EP-010). | HU-100 |
| D122 | «Mi equipo» tras enviar | **Se conserva igual**. | HU-198, HU-203 |
| D123 | Acuse por correo al cliente | **No en v1** (no se añade alcance). | — |
| D124 | Fidelidad de las 6 pantallas de panel de EP-003 SS1 (sin prototipo) | **Elegida por el modelo por delegación del sponsor (D27 + «elige las recomendadas»):** se aceptan como referencia las capturas construidas sobre patrones ya aprobados de EP-006 (catálogos, editor); desviación registrada en `design.md` del change; el gate `fidelity` se evalúa al final de la épica contra esas capturas + prototipo v2. Revisable por el sponsor en el PR de EP-003. | EP-003 SS1 |
| D125 | Migrar la BD compartida `ps` (demo/e2e) | **No se migra `ps` hasta el merge de EP-003**; los tramos se verifican en BD aislada `ps_ep003` y puertos 3200/3201. Motivo: 0028 bloquea publicar perfiles sin SARO/DISC y rompería la demo y las e2e actuales. | EP-003 |
| D126 | Fidelidad de pantallas de SS2/SS3 sin prototipo | **Elegida por el modelo por delegación:** mismo trato que D124 (capturas sobre patrones aprobados de EP-006 como referencia; revisable en el PR). Copy a la pasada D73: aire dentro de las comillas de «stock» y corte de «Alcance de la verificación SAR…» en el selector. | EP-003 SS2, SS3 |
| D127 | Migraciones adicionales de EP-003 | **Elegida por el modelo:** EP-003 reserva también **0030–0031** si SS4–SS7 las necesitan; EP-005 y EP-008 (en secuencia después) numeran a partir de la siguiente libre al abrir su slice. | EP-003, EP-005, EP-008 |
| D128 | Ejecución en paralelo de EP-003 («El salvador», `.wt/ep-003`) y EP-008 («David», `.wt/ep-008`) en la misma máquina | **Elegida por el modelo por delegación del sponsor:** cada épica verifica en su BD aislada sobre el mismo PostgreSQL (EP-003 `ps_ep003` + 3200/3201, D125; EP-008 `ps_ep008` + 3300/3301); nadie para el servidor compartido; EP-008 numera migraciones desde 0032 (D127); el navegador del MCP chrome-devtools se usa por turnos con el candado `.local/runtime.lock`. EP-004 espera token propio del ADMIN (frente EP-004 → EP-008). | EP-003, EP-004, EP-008 |
| D132 | Salida «pedir el perfil a medida» del cero por filtros (HU-223) | **Elegida por el modelo por delegación:** se cablea a HU-077 cuando se construya EP-010 (como HU-093); HU-223 ya admite ambas. Secuencia, no recorte. | HU-223, HU-077 |
| D129 | Permiso «Envíos» (EP-011, HU-233) | **Elegida por el modelo por delegación:** permiso **por persona** como «Medición» (D74) y «Validar composiciones» (D99); se enmienda RF-8.1.2 (el observador no escribe salvo con un permiso explícito por persona). | HU-233, RF-8.1.2 |
| D130 | RF-15.1 vs RF-13.4.2 | **Elegida por el modelo:** se mantiene PRD + ADR-0004: la especificación estructurada solo existe si hubo solicitud a medida; el cero sin solicitud muestra el texto enmascarado. | HU-077, HU-075 |
| D131 | RF-12.2 si T-23 no se ejecuta | **Pendiente del sponsor** (posible diferimiento): HU-067, HU-213, HU-072 quedan en draft; EP-009 arranca con sus 17 HU listas. | EP-009 |
| D133-reserva | Rangos de migración y entornos por épica (coordinación entre sesiones) | EP-003 0027–0031 (`ps_ep003`, 3200/3201) · EP-008 0032–0036 (`ps_ep008`, 3300/3301) · EP-004 0037–0041 (`ps_ep004`, 3400/3401) · EP-005 desde 0042. MCP por turnos con `.local/runtime.lock`. Decisiones nuevas de cualquier sesión desde D133. | todas |
| D134 | Encabezado del estándar (HU-159) | **Elegida por el modelo por delegación:** se acepta la marca simple (núcleo y cuatro nodos) en vez del hero ilustrado con retratos del prototipo; HU-159 deja la forma negociable. Copy en `packages/ui/src/copy.ts` y frases del estándar para revisión con Mercadeo (D73). Textos de 12 px heredados en la cara cliente → Release Gate (M-8). | HU-159, EP-003 |
