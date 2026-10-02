---
artefacto: user-story-map
proyecto: portal-people-service
prd_origen: docs/01-prd/portal-people-service.md
prd_version: 4.14
epicas_origen: docs/03-backlog/epicas.md
epicas_version: 5.7
version: 3.6
fecha: 2026-10-02
historias_escritas: 125
historias_descartadas: 2
historias_anticipadas_sin_redactar: 5
---

# User Story Map — Portal de Perfiles People Service

> Estilo Jeff Patton. Backbone cronológico en el eje X, historias por prioridad en el eje Y, líneas de release como cortes horizontales.

## Qué cambió respecto de la v1.0

La v1.0 se construyó sobre el PRD 1.1 y reservó los IDs `HU-001`–`HU-064` para historias que nunca se escribieron. Después llegó la **Fase 2 de diseño** (PRD §13, v2.0) e invirtió la jerarquía del recorrido: la entrada dejó de ser el buscador facetado y pasó a ser la **instrucción en lenguaje natural**, con las facetas como refinamiento. Las historias se redactaron entonces en un espacio nuevo, hoy `HU-065`–`HU-144`, sin intersección con el mapa.

Esta v2.0 reconstruye el mapa sobre el PRD 4.5 con **los IDs que realmente existen**. Los rangos viejos se conservan solo en §Deuda de mapa, donde se declara qué parte de ese alcance sigue sin historia escrita.

**Tres backbones**, porque el producto tiene dos caras y un tercer actor interno. El del cliente es el principal.

---

## Backbone 1 — Cliente (recorrido principal)

**Del correo curado al equipo solicitado.** La columna 3 es la entrada real desde la Fase 2.

| 1. Recibir y entrar | 2. Reconocer la selección | 3. Decir lo que necesito | 4. Refinar y descubrir | 5. Evaluar un perfil | 6. Armar el equipo | 7. Solicitar y agendar |
|---|---|---|---|---|---|---|
| *EP-001 · EP-008* | *EP-001* | *EP-009* | *EP-002 · EP-010* | *EP-003* | *EP-004* | *EP-005* |
| **━━━━━━━━━━ MVP ━━━━━━━━━━** | | | | | | |
| HU-090 Entrar desde el correo sin registrarme | HU-091 Reconocer que la selección se armó para mi proyecto | HU-065 Buscar escribiendo lo que necesito | HU-074 Refinar con filtros lo que la instrucción devolvió | HU-159 Entender el estándar Neural-Grid antes del primer perfil | HU-192 Sumar y quitar perfiles de Mi equipo *(D88)* | HU-096 Revisar mi equipo antes de pedirlo |
| HU-092 Recuperar el acceso cuando el enlace venció | HU-144 Abrir el enlace y encontrar la selección que me armaron | HU-066 Arrancar desde una sugerencia | HU-121 Comparar muchos perfiles por el mismo criterio | HU-153 Leer en la tarjeta qué capacidad ofrece cada profesional | HU-080 Ver qué le falta al equipo que estoy armando | HU-097 Identificarme cuando no soy quien recibió el correo |
| HU-093 Entrar sin selección previa y ser encuadrado | HU-094 Volver a la selección después de explorar | HU-068 Ver cómo el portal entendió lo que pedí | HU-075 Entender qué pedí cuando no hay nada que mostrar | HU-081 Distinguir un perfil por sus competencias verificadas |  | HU-098 Saber qué pasa después de enviar |
| HU-095 Compartir el enlace con un colega |  | HU-069 Corregir la interpretación sin volver a escribir | HU-076 Ver alternativas solo cuando de verdad se parecen | HU-119 Saber por qué coincide cada perfil y por qué no |  | HU-100 Ser advertido si intento pedir sin haber elegido nada |
| HU-187 Ver el aviso de privacidad antes de entrar · *EP-008, D65* |  | HU-070 Revisar y ajustar la especificación | HU-077 Pedir el perfil que no existe todavía | HU-154 Distinguir en la ficha lo verificado de lo declarado |  |  |
|  |  | HU-072 Seguir usando el portal cuando la interpretación falla |  | HU-155 Consultar cómo se validó técnicamente a un profesional |  |  |
|  |  | HU-082 Decir en qué país y ciudad necesito el perfil |  | HU-156 Ver con fecha y alcance la verificación de seguridad y la evaluación DISC |  |  |
|  |  | HU-083 Decir qué tiene que estar funcionando cuando el proyecto termine |  | HU-157 Saber desde la ficha que la conversación va por Trycore |  |  |
|  |  | HU-085 Ajustar mi especificación con las opciones que el banco tiene |  | HU-158 Cerrar la ficha con condiciones operativas, SLA y garantía de servicio |  |  |
|  |  | HU-118 Distinguir lo que no puedo negociar de lo deseable |  | HU-120 Comparar perfiles sin perder la lista |  |  |
|  |  | HU-174 Ver la evidencia calculada por el mismo motor que decide los resultados *(D87, de EP-003; ubicación por confirmar: se ve en las columnas 4 y 5)* |  | HU-175 Sumar o quitar un perfil de mi equipo desde su ficha |  |  |
| **━━━━━━━━━━ v1.1 ━━━━━━━━━━** | | | | | | |
| | | HU-067 Pegar el requerimiento que ya tengo escrito | | | HU-084 Ver la forma típica del trabajo | HU-099 Agendar la sesión de alineación |
| | | HU-071 Responder una pregunta de afinamiento | | | | |
| | | HU-073 Encontrar mi especificación como la dejé | | | | |
| **━━━━━━━━━━ descartadas ━━━━━━━━━━** | | | | | | |
| | | | | HU-079 Reconocer de un vistazo qué ha logrado un perfil *(D-15: el dato no existe en el banco)* | | |

**Por qué HU-067, HU-071 y HU-073 salen del MVP.** Las tres dependen de que la entrada por instrucción ya esté validada: pegar un requerimiento largo (HU-067) está condicionado a la prueba previa de RF-12.2; la pregunta de afinamiento (HU-071) solo tiene sentido cuando el modelo acierta lo suficiente como para que afinar valga la pena; y persistir la especificación (HU-073) queda en v1.1 por alcance, no por bloqueo: **D-16 cerró el 2026-09-21 en persistencia por dispositivo**, que la abarata mucho —vive en el navegador, no en el servidor— y la deja disponible para adelantar al MVP si se quiere.

---

## Backbone 2 — Talento Humano (mantener el banco vivo)

| A. Cargar el inventario | B. Registrar la validación | C. Publicar | D. Mantener | E. Gobernar catálogos |
|---|---|---|---|---|
| *EP-006 · EP-001 · EP-003 · EP-008* | *EP-006 · EP-003* | *EP-006 · EP-003* | *EP-006* | *EP-006 · EP-003* |
| **━━━━━━━━━━ MVP ━━━━━━━━━━** | | | | |
| HU-123 Entrar al panel con mi correo corporativo · *EP-001* | HU-140 Precargar el borrador desde la modalidad de prueba *(plantilla determinista sin IA, T-2)* | HU-127 Registrar el consentimiento nominal | HU-132 Actualizar la disponibilidad en dos clics | HU-089 Crear valores de catálogo sin duplicar |
| HU-125 Crear un perfil eligiendo del catálogo | HU-176 Registrar el alcance y la fecha de SARO y la fecha de DISC · *EP-003, sub-slice inicial (D60, D61)* | HU-128 Ser bloqueada si publico sin consentimiento | HU-133 Pausar declarando el motivo | HU-139 Administrar el léxico de búsqueda |
| HU-126 Editar un perfil publicado sin sorpresas |  | HU-129 Previsualizar la ficha | HU-134 Corregir incoherencias estado/disponibilidad | HU-177 Administrar el catálogo de alcances SARO · *EP-003, sub-slice inicial (D61)* |
| HU-194 Recibir un aviso de lenguaje de inventario al escribir la trayectoria · *EP-003, sub-slice inicial* |  | HU-130 Publicar sin esperar el reporte detallado | HU-136 Revisar la bandeja de vigencia |  |
| HU-191 Completar SARO y DISC por importación masiva · *EP-003, sub-slice inicial (D81)* |  | HU-178 Ver marcados como incompletos los publicados sin una validación de entrada · *EP-003, sub-slice inicial (D62, D63)* | HU-135 Archivar sin perder el rastro |  |
| HU-124 Consultar el banco sin poder modificarlo |  |  | HU-137 Ver los colocados y sus vencimientos |  |
| HU-138 Consultar quién cambió qué y cuándo |  |  |  |  |
| HU-190 Conceder o quitar el permiso de Medición · *EP-008 (D74)* |  |  |  |  |
| **━━━━━━━━━━ v1.1 ━━━━━━━━━━** | | | | |
| HU-086 Pegar mi hoja de cálculo y ver qué va a pasar | | | | HU-143 Retirar y fusionar valores |
| HU-141 Confirmar la importación sabiendo qué campos toca | | | | |
| HU-142 Corregir solo las filas que fallaron | | | | |
| HU-087 Deshacer una importación que salió mal | | | | |
| HU-088 Descargar una plantilla o el banco para editarlo y devolverlo | | | | |
| **━━━━━━━━━━ v2 ━━━━━━━━━━** | | | | |
| | HU-131 Adjuntar el artefacto de evidencia *(diferida por el sponsor el 2026-10-01, D29)* | | | |

> **Este backbone era el hueco grande del proyecto. Se cerró el 2026-09-21.** EP-006 declaraba RF-8 completo —46 líneas de requisitos— con solo 4 historias, todas de importación y catálogos. Se redactaron **HU-123 a HU-139** y la épica pasó de 4 a 21. El CRUD, la validación, el consentimiento, la publicación y el mantenimiento ya tienen backlog, y con ellos **O5, el objetivo habilitante**.

> **HU-131 pasa a v2 desde el 2026-10-01 (D29, sponsor Jesús Segura).** Adjuntar, descargar y ver el artefacto de evidencia en el panel se difiere a una versión futura: «hacerlo nos va a costar más en producción». Es diferir con acuerdo del sponsor, no descartar: la historia y sus criterios se conservan y sigue siendo de EP-006. En esta versión la evidencia es el reporte de validación que Talento Humano registra a mano (HU-130, HU-140). **HU-140 sube a la línea MVP**: el sponsor la mantuvo en EP-006 (la marca «candidata a v2» nunca fue un recorte) y no necesita artefacto (D11, D19); la columna B la refleja ahora donde se construye.

> **Sub-slice inicial de EP-003 en este backbone (D60, 2026-10-02).** HU-177, HU-176, HU-178, HU-191 y HU-194 son de **EP-003** pero su actor es Talento Humano en el panel: capturan SARO y DISC, obligatorios para publicar (D61), marcan los publicados incompletos (D62, D63) y los completan por importación (D81). EP-006 sigue cerrada. **HU-191** queda en la línea MVP con su sub-slice aunque depende de HU-086, HU-088 y HU-141, que este mapa aún ubica en v1.1 (el importador ya lo construyó EP-006): *ubicación de la carga masiva por confirmar*. **HU-190** (permiso «Medición», D74) es de EP-008 y vive aquí porque amplía la lista de acceso del panel (HU-151).

> **HU-123 pertenece a EP-001 desde el 2026-09-27** (T-19, épicas v5.5). Sigue en este backbone porque su actor es Talento Humano, no el cliente, y la columna 1 del backbone 1 es la entrada del cliente. La construye EP-001 porque la caparazón necesita el login del panel para generar enlaces (HU-122, columna F del backbone 3).

**D-8 cerró el 2026-09-18 en CRUD completo**, así que todo este backbone está comprometido para el MVP. La carga masiva (HU-086, HU-087, HU-088) queda en v1.1 por alcance y no por bloqueo: con **25 perfiles como umbral de producción (D-3)**, importar masivamente resuelve un problema que a esa escala todavía no aparece.

**El panel pesa 40 de los 174 pts del backlog — el 23%.** No es un módulo administrativo al margen: es casi un cuarto de lo que hay que construir.

---

## Backbone 3 — Mercadeo, Comercial y Delivery (distribuir, recibir y medir)

| F. Curar y distribuir | G. Recibir la oportunidad | H. Medir y aprender |
|---|---|---|
| *EP-011 · EP-001 · EP-008* | *EP-007 · EP-005* | *EP-008 · EP-011 · EP-010* |
| **━━━━━━━━━━ MVP ━━━━━━━━━━** | | |
| HU-113 Armar la selección de perfiles de una cuenta | HU-101 Recibir la solicitud con contexto suficiente para preparar la sesión | HU-167 Registrar el recorrido del cliente y consultarlo en Medición |
| HU-114 Generar el enlace de cada destinatario sin construirlo a mano | HU-102 Recibir la oportunidad en mi pipeline | HU-168 Medir la entrada al portal desde que se abre el enlace |
| HU-122 Generar un enlace con los perfiles que elegí | HU-160 Ver el requerimiento completo en «Solicitudes People Service» | HU-169 Que mi rastro en el portal no lleve mi correo y caduque |
| HU-115 Copiar el contenido curado para enviarlo desde Gmail o HubSpot | HU-161 Encontrar la solicitud completa en la línea de tiempo del contacto | HU-193 Atender una solicitud de supresión de un contacto *(D89)* |
| HU-188 Marcar un enlace como demo para que no cuente en Medición · *EP-008 (D68)* | HU-180 Llevar a HubSpot el contexto añadido a una solicitud en curso | HU-112 Atribuir cada sesión a su envío de correo |
|  | HU-103 Enterarme de una solicitud sin tener que vigilar el pipeline | HU-116 Ver quién entró por su enlace |
|  | HU-162 Recibir la solicitud que nadie atendió en 4 horas hábiles | HU-109 Ver si la curaduría acierta |
|  | HU-163 Recibir en Dirección General la solicitud que no avanza en 24 horas hábiles | HU-078 Saber qué están pidiendo las cuentas y no tenemos |
|  | HU-104 Que no se me duplique la empresa en el CRM | HU-110 Ver qué filtros usan realmente los clientes |
|  | HU-105 Recuperar una solicitud que no llegó a HubSpot | HU-172 Ver las diez búsquedas sin resultados más repetidas del mes |
|  | HU-164 Resolver desde el panel las solicitudes que no llegaron a HubSpot | HU-171 Ver el tablero mensual de medición *(D66)* |
|  | HU-165 Saber que el registro en HubSpot dejó de correr | HU-108 Ver el embudo de cada cuenta *(D66)* |
|  | HU-166 Distinguir un fallo de HubSpot que no se arregla solo | HU-111 Comparar la ruta de instrucción con la de filtros *(D66)* |
|  | HU-106 Distinguir lo que entra por el portal de lo que entra por gestión | HU-170 Ver en qué terminan las pantallas sin coincidencia |
|  | HU-107 Registrar cuándo se agendó la alineación | HU-184 Ver si las composiciones de referencia agrandan los equipos pedidos |
|  |  | HU-185 Saber cuándo se cumple el disparador de la ruta por reto |
|  |  | HU-173 Saber si la entrada por instrucción capta la demanda o la dicta |
|  |  | HU-186 Comparar la búsqueda con y sin Perfil Objetivo |
|  |  | HU-189 Registrar una decisión de reclutamiento *(D83)* |
| **━━━━━━━━━━ v1.1 ━━━━━━━━━━** | | |
| HU-117 Reaccionar a una cuenta que no entra | | |

**D66 (sponsor, 2026-10-02): el tablero de medición entra al MVP.** HU-171 (tablero mensual), HU-108 (embudo por cuenta) y HU-111 (instrucción frente a filtros) suben de v1.1 a la línea de MVP con EP-008. No es ampliación de alcance: ya estaban comprometidas; cambia la línea de release.

**Discovery 2026-10-02 (D52–D89, `.claude/state/evidencia/discovery-2026-10-02/decisiones-sponsor-2026-10-02.md`).** Columna G: la solicitud llega por **híbrido API + workflow** (D76): contacto y negocio por API con «Id solicitud People Service» único, en el pipeline existente **«Comercial (People y Tecnología)»** (D85); la empresa por dominio, el escalamiento 4 h / 24 h hábiles y los avisos comerciales en el workflow de HubSpot (D53, D55, D77). Columna H: la base de EP-008 (HU-167, HU-168, HU-169) va primero; el permiso «Medición» es por persona (D74, HU-190) y la supresión Ley 1581 es historia propia (D89, HU-193). Todo en MVP.

**La columna F no envía el boletín** (decisión del sponsor del 2026-09-27, PRD v4.14, RF-18). El panel arma la selección curada (HU-113), genera el enlace de cada destinatario con un token opaco (HU-114) y entrega un bloque de contenido listo para copiar en Gmail o HubSpot, donde se redacta, programa y envía el correo; quien envía registra la salida en el panel (HU-115). La columna H mide entradas por el enlace, verificación y solicitud, no aperturas (HU-116), y la regla de HU-117 pasa a «tres envíos con salida registrada sin entrada». Mailgun queda solo para códigos de acceso y avisos internos. No es un recorte de alcance: redacción, programación, envío, bajas y apertura pasan a la herramienta de envío.

**HU-101 y HU-107 cierran RF-17**, el traspaso a Delivery. Sin ellas O3 —días entre solicitud y sesión agendada— no se puede medir, porque al usar las etapas del pipeline comercial vigente (D-21) la alineación no tiene etapa propia y la propiedad de fecha es el único registro del tramo.

**HU-105 acompaña obligatoriamente a HU-102.** Sin cola de reintento, el modo de falla de la integración es silencioso: el cliente cree que lo ignoraron.

---

## Línea de MVP: por qué se cortó ahí

**El criterio sigue siendo un solo test:** ¿puede el cliente completar el recorrido de extremo a extremo, y puede Trycore sostenerlo sin degradarse?

**Lo que la Fase 2 cambió respecto de la v1.0 del mapa.** La entrada por instrucción (columna 3) no era MVP en la v1.0 porque no existía. Hoy es la columna más poblada del backbone del cliente —10 historias en MVP— y el resto del recorrido está subordinado a ella. Esa es la apuesta de producto, y §14.7 del PRD fija la regla asimétrica que la falsea: solo se reduce el alcance si los tres participantes completan la tarea con la lista y al menos dos lo hacen con menos fricción visible.

**Lo que se sostiene de la v1.0.** La integración con HubSpot entra al MVP con su cola de reintento. El agendamiento dentro del portal sale a v1.1: en el MVP la confirmación explica el paso siguiente y el comercial agenda.

**Lo que empeoró.** El panel de Talento Humano estaba completo en el mapa v1.0 con HU-042 a HU-058. Hoy ese alcance no tiene historias escritas y D-8 sigue abierta. El MVP no se sostiene sin él: O5 es el objetivo habilitante y sin panel el inventario se degrada en semanas.

---

## Deuda de mapa — alcance anticipado sin historia escrita

Los rangos de la v1.0 que **siguen sin historia redactada**. No son IDs vivos: son alcance pendiente que hay que volver a redactar en el espacio actual.

| Rango v1.0 | Alcance | Épica | Estado real |
|---|---|---|---|
| HU-001 – HU-016 | Acceso, aterrizaje curado y selección | EP-001 | **Cubierto** por HU-090 a HU-095, HU-122 y HU-144 |
| HU-017 – HU-018 | Búsqueda por texto y ordenamiento | EP-002 | **Superado** por HU-065 (instrucción) y HU-074 (refinamiento) |
| HU-019 – HU-020 | Sondeo de agentes autónomos en el grid | EP-002 | **Sin historia escrita.** RF-10 y RF-11 están en `epicas.md` pero nadie los redactó |
| HU-021 – HU-028 | Tarjeta, ficha y evidencia de validación | EP-003 | **Cubierto el 2026-10-02** por HU-153 a HU-159 y HU-175 (cara cliente), HU-176 a HU-178, HU-191 y HU-194 (sub-slice inicial de panel), más HU-081, HU-119 y HU-120 refinadas. HU-174 nace aquí y pasa a EP-009 (D87) |
| HU-029 – HU-034 | Mi equipo, resumen y comparador | EP-004 | **Parcial.** HU-080, HU-084 y, desde el 2026-10-02, **HU-192** (sumar, quitar e indicador, D88; absorbe los criterios recibidos de HU-094 y HU-095). Siguen sin historia el resumen del conjunto (RF-4.3), el comparador de tres (RF-4.4) y la recuperación al volver (RF-4.5) |
| HU-035 – HU-041 | Solicitud, identificación y confirmación | EP-005 | **Cubierto** por HU-096 a HU-101 |
| HU-042 – HU-058 | Panel de Talento Humano completo | EP-006 | **Cubierto el 2026-09-21** por HU-123 a HU-139, más HU-086 a HU-089 |
| HU-059 – HU-064 | Distribución, oportunidad en HubSpot y medición | EP-007 · EP-008 · EP-011 | **Cubierto** por HU-102 a HU-117 y, el 2026-10-02, HU-160 a HU-173, HU-180, HU-184 a HU-190 y HU-193 |

**Conteo (2026-10-02).** Con el discovery de EP-003, EP-007 y EP-008, el alcance anticipado sin historia baja a **alrededor de 5**: **EP-004** (resumen, comparador y recuperación de «Mi equipo») y **EP-002** (sondeo RF-10 y espacio no-perfil RF-11).

**EP-004 deja de estar invertido el 2026-10-02:** HU-192 redacta el comportamiento que hace existir la épica (sumar, quitar, indicador). Quedan sin historia el resumen, el comparador y la recuperación.

---

## Historias bloqueadas por decisión abierta

**Ninguna.** D-16 y D-19 cerraron el 2026-09-21 y con ellas se fue el último bloqueo del backlog.

| Historia | Antes bloqueada por | Estado |
|---|---|---|
| HU-073 Encontrar mi especificación como la dejé | ~~D-16~~ | **Libre desde el 2026-09-21.** Persistencia por dispositivo: vive en el navegador de quien especificó. D-16 quedó acotada al Perfil Objetivo el 2026-09-25 (T-1); «Mi equipo» va al servidor por invitado |
| HU-084 Ver la forma típica del trabajo | ~~D-19~~ | **Libre desde el 2026-09-21**, con dependencia de insumo: Delivery entrega la composición real de los tres tipos más frecuentes. No es decisión pendiente, es una reunión |
| Historias de la ficha de EP-003 (HU-153–HU-159, redactadas el 2026-10-02) | **D-5** — grado de detalle de la trayectoria. No las bloquea, define su calidad. Talento Humano condicionó el VoBo a ver primero la propuesta de ficha (2026-09-18), así que la ficha se propone antes de aprobarse | Talento Humano |

---

## Trazabilidad a épicas

Backbone 1: col 1–2 → **EP-001** (HU-187 → EP-008) · col 3 → **EP-009** (incluye HU-174, D87) · col 4 → **EP-002** y **EP-010** · col 5 → **EP-003** · col 6 → **EP-004** · col 7 → **EP-005**.
Backbone 2 → **EP-006**, salvo HU-123 → **EP-001** (T-19), HU-176, HU-177, HU-178, HU-191 y HU-194 → **EP-003** (sub-slice inicial, D60) y HU-190 → **EP-008** (D74).
Backbone 3: col F → **EP-011** y EP-001 (HU-188 → EP-008) · col G → **EP-007** y EP-005 · col H → **EP-008**, EP-011 y EP-010.

**Cobertura bidireccional:** las 11 épicas aparecen en al menos una columna; ninguna columna queda sin épica. Sin huérfanos.
