---
artefacto: especificacion-consolidada
proyecto: portal-people-service
version: 5.3
fecha: 2026-09-25
prd_version: 4.10
epicas_version: 5.3
backlog_version: 5.3
historias_activas: 79
historias_descartadas: 1
fuente: generado con scripts/generar-especificacion-consolidada.py desde docs/01-prd, docs/03-backlog, docs/04-historias y docs/10-specs
uso: documento de construcción, organizado por épica
---

# Especificación consolidada — Portal de Perfiles People Service

> **Documento de construcción.** Reúne en un solo archivo el contexto que gobierna todo, el modelo de datos, y después **una sección por épica** con sus requisitos y sus historias completas. Se genera desde los artefactos originales con `scripts/generar-especificacion-consolidada.py`: **no se edita a mano**. Si algo está mal, se corrige la fuente y se regenera.

## Cómo usar este documento

1. **Parte I — Reglas que gobiernan todo.** Léela antes de tocar cualquier épica. Contiene el problema, los objetivos, lo que el producto no es, los principios transversales, los requisitos no funcionales (incluida la plataforma de ejecución, §8.3) y las decisiones ya cerradas.
2. **Parte II — Modelo de datos.** De dónde sale cada campo y qué nunca se publica.
3. **Parte III — Épicas.** Una sección por épica, autocontenida: para construir EP-00X basta con la Parte I más su sección.
4. **Parte IV — Especificaciones anexas.** Componentes con detalle propio.
5. **Parte V — Decisiones abiertas.** Lo que todavía puede cambiar y a quién hay que preguntarle.
6. **Parte VI — Orden de construcción.**

> **Artefactos hermanos, fuera de este documento.** El **mapa de historias** (`docs/02-user-story-map/`, v3.3) ordena el alcance por recorrido y release. La **priorización** (`docs/05-priorizacion/`) ordena las historias en una matriz valor/esfuerzo. Los **flujos de navegación** (`docs/06-flows/`, uno por épica, en Mermaid) diagraman cada épica con trazabilidad a sus criterios de aceptación. Las características verificadas del **hosting** viven en `docs/01-prd/requisitos-tecnicos-hosting.md` y el **prototipo** de referencia en `docs/07-prototipo/`.

---

# PARTE I · Reglas que gobiernan todo

## 2. Contexto y problema

### 2.1 Situación actual

| Hecho | Consecuencia |
|---|---|
| La página pública de la línea explica el servicio pero no tiene puerta ni evento de conversión | Quien la visita se informa y se va sin dejar rastro |
| La expansión en cuentas activas depende de que el comercial toque la puerta en el momento justo | El crecimiento del equipo ocurre cuando el cliente lo pide, no cuando Trycore lo propone |
| La curaduría de perfiles por cuenta ya existe, pero muere dentro de un correo | El cliente ve una lista estática, no puede explorar, y su interés no deja señal medible |
| La disponibilidad de perfiles vive en conversaciones y hojas internas | Ni el cliente ni el comercial pueden consultar el banco sin intermediar a Talento Humano |
| Existen calificaciones cuantificables para más de 15 roles | Activo de evidencia infrautilizado en el recorrido de compra |

### 2.2 El problema en una frase

**La propuesta de crecimiento llega como una lista muerta dentro de un correo, y el interés que despierta no deja rastro accionable.**

### 2.3 Por qué esta audiencia y no otra

Es la audiencia con mayor probabilidad de conversión y menor costo de adquisición: ya firmaron, ya conocen el estándar Neural-Grid™ porque lo tienen trabajando adentro, y ya hay un contrato marco. La fricción no es la confianza — es la visibilidad de lo que hay disponible y la oportunidad del momento.

### 2.4 Tensión estratégica que este producto debe resolver (no ignorar)

El modelo comercial de la línea dice: *"no tomamos pedidos, diagnosticamos el dolor del negocio antes de buscar el perfil"*. Un portal de autoservicio es, literalmente, tomar pedidos.

**Resolución adoptada:** el portal no cierra la venta, la **abre mejor especificada**. El envío final es una **solicitud de equipo** que crea la oportunidad y agenda la sesión de alineación — nunca "reservar" ni "contratar". El cliente siente que configuró y decidió; Trycore conserva el paso consultivo intacto. Toda decisión de diseño posterior se somete a esta regla.

### 2.5 Segunda tensión: curaduría vs. descubrimiento

El correo dice "estos perfiles son para ti". El portal ofrece explorar todo el banco. Mal resuelto, el descubrimiento devalúa la curaduría: si puedo ver todo, la selección que me hicieron no era especial.

**Resolución adoptada:** el aterrizaje presenta el conjunto curado **como conjunto, con su razón declarada** ("seleccionados para el proyecto X"). Ampliar la búsqueda es una acción explícita y secundaria que nunca destruye la selección curada — se puede volver a ella en un clic.

---

## 3. Objetivos

Medibles, con horizonte de dos trimestres desde el lanzamiento.

| # | Objetivo | Métrica | Meta |
|---|---|---|---|
| **O1** | Crecer los equipos dentro de cuentas activas | Perfiles adicionales colocados en cuentas que recibieron el correo | De `<!-- TODO: línea base trimestral -->` a `<!-- TODO: meta -->` |
| **O2** | Convertir la curaduría en intención registrada | Solicitudes de equipo enviadas / cuentas que abrieron el portal | ≥ 20% |
| **O3** | Acortar el arranque comercial | Días entre solicitud enviada y sesión de alineación agendada | ≤ 3 días hábiles |
| **O4** | Elevar la calidad del brief que llega a Delivery y al CRM | % de solicitudes con sector, fecha de inicio y duración diligenciados | ≥ 85% |
| **O5** | Sostener un inventario vivo | % de perfiles publicados con disponibilidad actualizada en los últimos 30 días | ≥ 90% |

> **Nota sobre O5:** es el objetivo habilitante. Si cae por debajo del umbral, los otros cuatro se degradan solos. Por eso el panel de administración entra al MVP.

> **Gap declarado:** O1 no es verificable hasta que Dirección Comercial y Delivery entreguen la línea base de perfiles colocados por cuenta activa. Ver §11.

---

## 4. Non-goals (lo que este producto NO es)

1. **No es canal de adquisición.** No entra al portal quien no es cuenta activa de la línea. Prospectos fríos siguen su ruta por pauta, banger y página de servicio.
2. **No es una bolsa de empleo ni un portal para candidatos.** No recibe hojas de vida ni postulaciones.
3. **No expone identidad.** Nada de nombre completo, foto, correo, teléfono, empleador identificable ni CV descargable.
4. **No muestra tarifas ni cotiza.** La conversación económica sigue viviendo en la propuesta comercial.
5. **No reserva ni bloquea al perfil.** El SLA de 10 días hábiles corre desde la solicitud formal, no desde el clic.
6. **No reemplaza la sesión de alineación estratégica** ni ninguno de los 3 pasos del proceso comercial.
7. **No es un ATS.** No gestiona contratos, nómina, timesheets, evaluaciones ni reemplazos.
8. **No es público ni indexable.** Sin SEO, sin acceso abierto.
9. **No hay contacto directo con los perfiles.** Ninguna vía de comunicación entre cliente y profesional dentro del portal.
10. **No borra información.** El panel de administración archiva; nunca elimina físicamente (ver RF-8.3).
11. **No es multi-idioma en v1.** Español únicamente.

---

## 5. Usuarios y personas

### 5.1 Cara cliente

| Persona | Rol y contexto | Qué viene a hacer | Qué lo frena |
|---|---|---|---|
| **P1 — El comprador técnico** | CTO, VP de Tecnología, Gerente de TI de una **cuenta activa**. Ya tiene perfiles Trycore trabajando | Ver si hay perfiles que aceleren el proyecto que tiene en curso | Presupuesto ya comprometido; necesita justificar el incremento ante su junta |
| **P2 — El líder de delivery** | Gerente de proyecto o PMO del cliente | Cubrir un rol específico con fecha dura, sin volver a abrir un proceso de selección | Necesita certeza de fecha antes de comprometerse con su cliente interno |
| **P3 — El validador de riesgo** | Talent lead, Seguridad o Compras en sector regulado | Confirmar que el perfil nuevo pasa por el mismo estándar que el que ya tiene adentro | Debe responder por el acceso a sistemas críticos |

### 5.2 Cara interna

| Persona | Rol | Relación con el producto |
|---|---|---|
| **P4 — Talento Humano** | [[karen]] y equipo | **Usuaria primaria del panel.** Publica, actualiza, pausa y archiva perfiles. Custodia el consentimiento de cada profesional |
| **P5 — Comercial Trycore** | Ejecutivo dueño de la cuenta | Recibe la oportunidad en su pipeline de HubSpot. Usa el portal en vivo en reunión y comparte enlaces con filtros aplicados |
| **P6 — Delivery** | Coordinación de Servicio (contacto de línea: Eida Tinjacá M.) | Recibe la solicitud con contexto suficiente para preparar la alineación |
| **P7 — Mercadeo** | Dirección de Mercadeo | Construye el correo curado por cuenta, genera los enlaces parametrizados y lee la telemetría de intención |

---

---

## Principios transversales

Ninguna épica puede contradecirlos.

- **RF-14.0 · Principio de origen del dato.** **El portal no expone campos que Talento Humano no produzca ya.** Todo campo nuevo debe justificarse contra dos cosas: su **costo operativo recurrente** de mantenimiento, y su lugar en la distinción **verificado por Trycore / autoreportado por el profesional**. Un campo que solo el candidato puede llenar no puede ocupar la posición de mayor jerarquía visual en un producto cuya tesis es la evidencia verificada.
  - *Origen del principio:* el benchmark de la Fase 2 proviene de plataformas donde el propio candidato completa su perfil. Ese no es el modelo de People Service, donde Talento Humano cura el banco. Importar patrones sin traducir el modelo de datos produce requisitos que no se pueden sostener.

- **RF-16.1** **El modelo interpreta. No recupera, no redacta, no ve los perfiles.** Salida estructurada contra nuestra taxonomía; recuperación determinista sobre el catálogo; degradación a léxico controlado si la API falla. *(M-19)*
  - *En contra:* se deja valor sobre la mesa; el modelo podría redactar la justificación del match.
  - *Criterio:* ese valor no compensa el riesgo de que el sistema afirme algo falso sobre una persona real por la que Trycore responde contractualmente. **Sin excepción en el MVP.**

- **RF-16.2** Al modelo se le envía **la consulta y la taxonomía; nunca los datos de los perfiles**. *(M-20)* Es una restricción, no una funcionalidad, con implicación directa en los consentimientos y en el frente de ISO 27000.

- **RF-16.3** **Separación entre la capa de especificación y la de recuperación.** El Perfil Objetivo tiene esquema versionado; la búsqueda vive tras una interfaz intercambiable. *(M-17)* Se hace porque el costo de no hacerlo es rehacer, no porque la expansión esté planeada: es una opción barata, no un compromiso.

- **RF-16.4 · El Perfil Objetivo nace multi-rol.** El campo de rol es **una lista desde el primer día**, aunque el MVP solo use un elemento. Nacer como valor único obliga, el día que exista la ruta por reto (§14), a una migración de datos sobre solicitudes históricas. Nacer como lista cuesta cero. Mismo criterio que RF-16.3: barato ahora, caro después.

- **RF-13.8 · Un solo motor de criterios.** El panel y los resultados se calculan con **la misma lógica**: el panel es el filtro, los resultados son lo que pasa el filtro. El contador del panel y el número de resultados son siempre el mismo número.
  - **RF-13.8.1 · Dentro de tecnologías vale *cualquiera*, no *todas*.** La interpretación devuelve el conjunto de tecnologías asociadas a un rol; exigirlas todas produce cero de forma sistemática en un banco de decenas. El campo lo declara en su etiqueta: *"basta con que tenga alguna"*.
  - **RF-13.8.2 · Un solo aviso, a nivel de panel.** Cuando ninguna combinación produce resultados se muestra **un** mensaje con los criterios activos como etiquetas removibles en un toque. Los avisos por campo se reducen a un único caso: el valor elegido no existe en el banco.
  - *Origen:* la primera versión usaba conjunción en tecnologías y una lógica distinta de la de los resultados. El panel decía cero mientras la pantalla mostraba dos perfiles, y avisaba de una incompatibilidad con campos que el usuario veía vacíos — estaban preseleccionados por la interpretación sin que se notara.

- **RF-8.14 · Coherencia entre estado y disponibilidad.** Son **dos ejes distintos** y el panel no debe permitir que se contradigan.
  - **RF-8.14.1** El **estado** responde si el perfil puede mostrarse: *borrador* (incompleto o sin consentimiento), *publicado*, *pausado*, *archivado*. La **disponibilidad** responde desde cuándo puede empezar, y **se captura como fecha en el panel aunque el portal la publique como banda** (RF-3.13). Confundirlos lleva a usar el estado para expresar fechas, que es lo que produjo la regla equivocada de RF-8.13.2.
  - **RF-8.14.2** **Pausar exige motivo**, elegido de una lista corta: en proceso de selección con otro cliente, en licencia o ausencia temporal, decisión de Talento Humano. **Si el motivo es una fecha, no es una pausa**: es disponibilidad, y el perfil debe quedar publicado con la fecha correcta.
  - **RF-8.14.3** El panel **señala las incoherencias en la propia fila**, con la acción que las corrige en un clic. Incoherencias de severidad alta impiden publicar; las medias se advierten sin bloquear.
  - **RF-8.14.4** **Una disponibilidad vencida y sin actualizar no se afirma.** Si la fecha ya pasó y el perfil lleva más de 30 días sin tocarse, el portal muestra **«Disponibilidad por confirmar»** en lugar de «Disponible ahora». Afirmar disponibilidad con base en un dato que nadie sostiene es la forma más silenciosa de perder credibilidad con una cuenta activa.

## 8. Requisitos no funcionales

| Categoría | Requisito |
|---|---|
| **Privacidad y datos personales** | Ley 1581 de 2012 (habeas data, Colombia). Consentimiento **nominal** informado por profesional, que cubra explícitamente la **publicación continua de su nombre, trayectoria y clientes nombrados ante cuentas cliente**. Debe existir un canal para ejercer rectificación y revocación —basta un buzón atendido por Talento Humano—. Bloqueante para producción y verificado por RF-8.4 |
| **Seguridad** | Sin datos identificables en el cliente. Credenciales de acceso no adivinables, revocables y con expiración. Inventario nunca expuesto por API abierta. Panel de administración con autenticación fuerte |
| **Rendimiento** | Resultados filtrados en menos de 1 segundo con el inventario esperado. Primer render útil en menos de 2,5 s en 4G |
| **Responsive** | Ver §8.1. "Diseño móvil primero" no es una especificación: es una intención que nadie puede verificar ni incumplir |
| **Accesibilidad** | Ver §8.2. WCAG 2.1 AA en una celda de tabla es una intención, no una especificación: nadie puede verificarla ni incumplirla |
| **Marca** | Sistema de diseño de Trycore. Vocabulario obligatorio: "perfil", "talento", "profesional". Prohibido: "recurso", "horas-hombre", "staffing", "candidato", "contratar a esta persona" |
| **Integridad del dato** | El portal es lector del inventario; la única fuente de escritura es el panel de Talento Humano |
| **Trazabilidad** | Toda solicitud queda vinculada a cuenta, contacto, sesión, conjunto curado y correo de origen |

### 8.2 Especificación de accesibilidad

Mismo tratamiento que §8.1, y por la misma razón: un requisito que no se puede comprobar no es un requisito.

| # | Criterio | Cómo se comprueba |
|---|---|---|
| A-1 | **Contraste mínimo 4.5:1** en texto normal y 3:1 en texto grande y en los bordes de los controles | Medidor de contraste sobre cada combinación de color del sistema |
| A-2 | **Todo el recorrido se completa solo con teclado**: escribir la instrucción, ajustar el panel, abrir una ficha, sumar al equipo y enviar la solicitud | Recorrer el flujo sin tocar el ratón |
| A-3 | **Foco siempre visible**, con un indicador que no dependa solo del color | Tabular por cada pantalla |
| A-4 | **Toda entrada tiene etiqueta asociada**, no solo texto de ayuda dentro del campo | Revisión del marcado |
| A-5 | **Los controles que cambian de estado lo anuncian**: chips de tecnología, filtros activos, tarjetas seleccionadas | Lector de pantalla sobre el panel de ajuste |
| A-6 | **Ningún significado descansa solo en el color**: los estados del panel de administración y las incoherencias llevan texto además de color | Revisión en escala de grises |
| A-7 | **Los cambios dinámicos se anuncian**: el número de resultados al cambiar un filtro, el aviso de cero, el resultado de una importación | Lector de pantalla sobre la búsqueda |
| A-8 | **Jerarquía de encabezados correcta y sin saltos** en cada pantalla | Revisión del marcado |

#### Definición de hecho

Una pantalla **no se da por terminada sin recorrerla con teclado y sin verificar contraste**. Igual que con móvil: no es una revisión posterior, es parte de terminar.

#### Estado

**No verificado.** El prototipo Mid-Fi no se ha recorrido con teclado ni con lector de pantalla. Es deuda declarada, no un requisito cumplido.

### 8.1 Especificación de comportamiento en móvil

**La cara del cliente es móvil obligatorio.** El recorrido completo —instrucción, resultados, ficha, equipo, solicitud y confirmación— debe poder completarse en un teléfono. El portal se alcanza desde un correo y ese correo se abre mayoritariamente en móvil.

**El panel de Talento Humano es de escritorio, con una excepción.** Nadie carga un perfil desde el celular, pero **actualizar disponibilidad sí** debe funcionar en móvil: es la acción más frecuente y quien la ejecuta no siempre está en su escritorio.

#### Criterios verificables

| # | Criterio | Cómo se comprueba |
|---|---|---|
| M-1 | **Sin desplazamiento horizontal** a 320 px de ancho en ninguna pantalla de la cara cliente | Abrir cada pantalla a 320 px e intentar desplazar lateralmente |
| M-2 | **Objetivo táctil mínimo de 44 × 44 px** en todo elemento accionable: chips de tecnología, etiquetas removibles, cerrar, sumar al equipo | Inspeccionar la caja de cada control |
| M-3 | **Tipografía mínima de 16 px en campos de entrada.** Por debajo, iOS hace zoom automático al enfocar y descuadra la pantalla | Enfocar cada campo en un iPhone real |
| M-4 | **El Perfil Objetivo es alcanzable sin recorrer los resultados.** En una sola columna no puede quedar después de veintitrés tarjetas | Abrir resultados en móvil y llegar al panel sin desplazarse hasta el final |
| M-5 | **La barra de instrucción permanece accesible** en la pantalla de resultados | Buscar, desplazarse, y volver a buscar sin salir de la pantalla |
| M-6 | **Las tablas se desplazan dentro de su contenedor**, nunca arrastrando el cuerpo de la página | Desplazar una tabla del panel a 320 px |
| M-7 | **La actualización de disponibilidad del panel funciona en móvil** | Cambiar la fecha de un perfil desde un teléfono |
| M-8 | **Ningún texto queda por debajo de 13 px** en la cara cliente | Revisión de estilos |

#### Definición de hecho

Una pantalla **no se da por terminada sin verificarla a 390 px y a 320 px**. No es una revisión posterior ni una tarea de cierre: es parte de terminar. Una pantalla verificada solo en escritorio está a medio hacer, no terminada con una deuda.

#### Estado del prototipo Mid-Fi

Los ocho criterios se aplicaron el 2026-09-16. En móvil, el Perfil Objetivo se muestra **plegado y por encima de los resultados** (M-4), los controles accionables alcanzan los 44 px (M-2), los campos suben a 16 px para evitar el zoom de iOS (M-3), la cuadrícula pasa a una columna por debajo de 560 px y las tablas del panel se desplazan dentro de su contenedor (M-6).

**Falta la comprobación en dispositivo real.** Lo anterior está verificado contra los estilos, no contra un teléfono. **Las sesiones con clientes deben correrse en el dispositivo en que el cliente abriría el correo**, no en un portátil, o estaríamos observando una experiencia que nadie va a tener.

---

### 8.3 Plataforma de ejecución: hosting compartido de Trycore

La v1 corre en el hosting compartido de Trycore (cPanel, paquete WP ULTIMATE V2). Las características verificadas viven en `docs/01-prd/requisitos-tecnicos-hosting.md`. Esta sección fija qué implica para el producto; ninguna decisión técnica puede contradecirla sin cambiar de plataforma (D-23).

| Aspecto | Decisión | Por qué |
|---|---|---|
| **Cara cliente** | Sitio estático compilado en local; al servidor solo sube el resultado del build | Nunca se sube `node_modules`: el límite de inodos del hosting ya va por el 20% |
| **Servidor** | PHP 8.3 con `curl`, `openssl`, `session` y `pdo_mysql` | Es lo que el hosting ejecuta sin configuración adicional. Node no participa en la v1 |
| **Persistencia** | MariaDB 10.6 | Inventario, enlaces, sesiones, auditoría, telemetría, cola de solicitudes |
| **Catálogo para el cliente** | Lo entrega el servidor tras validar la sesión, desde una carpeta privada hermana de la raíz pública de `people.trycore.com` | El inventario nunca queda expuesto por una ruta abierta (§8, Seguridad) |
| **Secretos** | Configuración PHP fuera de la carpeta pública | La llave de HubSpot y la del modelo no llegan nunca al navegador |
| **Acceso del cliente** | Enlace firmado + **lista nominal de correos invitados** + código al buzón, una vez por dispositivo | RF-1.2. Sin proveedor de identidad |
| **Acceso al panel** | **Lista nominal** de correos `@trycore.com` con rol + código al buzón + sesión de una jornada | RF-8.1. Mecanismo distinto del del cliente a propósito |
| **Correo saliente** | **SMTP autenticado** del buzón `notify@people.trycore.com` en el hosting, con MX, SPF y DKIM propios del subdominio. `trycore.com` sigue en Google Workspace, independiente. No se usa `sendmail` directo: en la prueba del 2026-09-25 no entregó, mientras el SMTP autenticado sí | El código de acceso es crítico: si cae en spam o se queda en el servidor, nadie entra |
| **Trabajo diferido** | Tareas programadas del hosting (cron), **activas desde la v1**: reintento cada 5 minutos, escalamiento cada 15, sincronización diaria. Dongee confirmó que frecuencia y número de tareas son personalizables (2026-09-25) | Reintento a HubSpot (RF-9.6.1), escalamiento (RF-9.7.3), sincronización de colocados (RF-8.13.1), vencimiento de enlaces. Corrige la nota del documento de hosting, que las dejaba para después de la v1 |
| **Vigilancia de las tareas** | Cada tarea registra su última ejecución; si alguna lleva más del doble de su intervalo sin correr, se avisa por correo al responsable técnico | Todo el escalamiento depende de esas tareas. Sin vigilancia, una tarea caída es un fallo silencioso (RF-9.6.2) |
| **Respaldo** | JetBackup 5 del hosting: copias diarias (unos 4 días) y semanales (unas 3 semanas), con base de datos y evidencia. La pérdida máxima aceptada es un día de datos. **JetBackup guarda las copias en el mismo servidor** (confirmado el 2026-09-25): no protege contra la pérdida del servidor. **Riesgo aceptado por el sponsor** (§10.3). Antes de producción, restauración de prueba | El servidor guarda datos nominales (Ley 1581) sobre un sistema operativo sin soporte (§10.3) |
| **Protección perimetral** | Cloudflare delante del portal, con límite de peticiones en los puntos de token y código; listado de directorios desactivado; páginas 404 y 403 propias | Evita la prueba masiva de tokens y que un error genérico de Apache aparezca en un flujo que llegó por correo |
| **Despliegue** | Local → GitHub → *Update from Remote* → *Deploy* en cPanel, con `.cpanel.yml` | No se editan archivos en el servidor: el despliegue falla con el árbol sucio |

**Lo que el hosting no hace, y el producto no pide:** procesos de larga duración, websockets, colas de trabajo, búsqueda semántica o vectorial, sincronización en tiempo real. Donde un requisito sonaba a eso, se resolvió con tabla más tarea programada (RF-9.6.1, RF-9.7.3, RF-8.13.1) o con recuperación determinista en el navegador (RF-2.6.4).

**ModSecurity** está activo y puede bloquear un POST legítimo. Es el primer sospechoso si el envío de la solicitud falla sin razón aparente.

---

## Decisiones cerradas

### 12.2 Decisiones cerradas

| # | Decisión | Resolución | Fecha |
|---|---|---|---|
| **D-23** | Plataforma de ejecución de la v1 | **Hosting compartido de Trycore**: sitio estático, PHP 8.3, MariaDB y tareas programadas, sin Node ni proveedor de identidad (§8.3). Todo requisito se resuelve dentro de ese techo; lo que lo exceda es Fase 3 y exige salir del hosting. El servidor se migró a CloudLinux 8 el 2026-09-25, lo que cierra el riesgo de sistema operativo sin soporte (§10.3) | 2026-09-24 |
| **D-16** | Viabilidad de persistir el Perfil Objetivo con acceso por enlace firmado | **Persistencia por dispositivo, no por cuenta.** La especificación queda en el navegador de quien la escribió. Resuelve el caso real —la misma persona que vuelve días después— y **elimina la implicación ISO 27000**, porque no se guarda del lado del servidor contra una identidad que el portal no puede verificar. Un enlace reenviado no arrastra especificación. Se reabre cuando exista autenticación real por usuario | 2026-09-21 |
| **D-19** | Composiciones de referencia por tipo de proyecto | **Se construyen solo para los tres tipos de proyecto más frecuentes.** Delivery entrega la composición real de esos tres; fuera de ellos el portal calla en vez de aproximar. Acota la recopilación a una sesión de trabajo con Delivery y conserva la regla dura de RF-14.7.1: composición real o ninguna | 2026-09-21 |
| **D-10** | Cómo se comunica la disponibilidad de perfiles no vinculados laboralmente | **El portal no comunica el vínculo laboral y publica un solo lenguaje de disponibilidad para todo el banco.** La ficha muestra resumen de experiencia e industrias, y la disponibilidad se expresa como **banda de arranque** —Inmediato, 1 semana, 2 semanas, 1 mes, Más de 1 mes— derivada de la fecha que el panel carga (RF-3.13). Resuelve la pregunta disolviéndola: si el portal no distingue vinculados de no vinculados, no necesita dos formas de comunicar su disponibilidad. *Consecuencias:* RF-3.3 deja de afirmar la relación laboral y conserva la barrera de contacto directo (RF-3.3.1, RF-3.3.2) | 2026-09-18 |
| **D-8** | Alcance del panel de administración en v1 | **CRUD completo.** Talento Humano y CTO cierran por el alcance mayor: el panel entra al MVP con creación, edición, validación, consentimiento, publicación, mantenimiento y carga masiva. *Consecuencia:* desbloquea HU-086 y HU-087 y obliga a redactar las historias del CRUD, la validación y el consentimiento, que hoy no existen | 2026-09-18 |
| **D-3** | Umbral mínimo de perfiles publicados para salir a producción | **25 perfiles publicados.** Por debajo de esa cifra el banco no sostiene ni el aterrizaje curado ni la ampliación de búsqueda: un cliente que amplía y encuentra una docena de perfiles lee el portal como vacío. Es condición de salida a producción, no de fin de construcción | 2026-09-18 |
| **D-18** | Ubicación del profesional en el banco | *Revisada el 2026-09-18 por Talento Humano:* **el país se publica siempre y la ciudad se publica solo cuando la necesidad declarada es Presencial 100% o Híbrido.** Acota la precisión de localización al caso donde el dato decide, y la mantiene oculta en Remoto, que es la mayor parte del banco. *Consecuencia aceptada:* en presencial e híbrido el riesgo de contacto directo de §10.3 sube, y se asume porque sin ciudad el emparejamiento presencial no se puede sostener. Resolución anterior, vigente hasta esa fecha: **solo país, publicado; la ciudad se carga pero no se publica.** El país resuelve lo que más pesa —si el talento está en el país de la operación— sin agregar precisión que facilite el contacto directo, que ya es un riesgo elevado tras publicar nombre y trayectoria. La ciudad queda disponible para Delivery y **se cruza en la sesión de alineación** | 2026-09-16 |
| **D-20** | Vista de banco completo para uso interno del comercial | **Diferida hasta que exista una necesidad observada.** Con el pipeline propio resuelto, el comercial ya tiene dónde ver su trabajo; una vista aparte del banco no resuelve todavía un problema identificado. Se reabre si el equipo comercial la pide con un caso concreto | 2026-09-15 |
| **D-21** | Etapas del pipeline propio de la línea | **Las mismas del pipeline comercial vigente**, con su etapa de entrada excluida del pronóstico. Reduce a cero el reentrenamiento y mantiene el reporte comparable. *Consecuencia aceptada:* el beneficio del pipeline aparte queda reducido a no contaminar el pronóstico, y la sesión de alineación no tiene etapa propia — se mide con la propiedad de fecha de RF-9.1.3 | 2026-09-15 |
| **D-6** | Qué se crea en HubSpot al enviar la solicitud | **Negocio en un pipeline propio de la línea People Service**, con etapas que corresponden a este negocio —solicitud, alineación, propuesta, colocación— y sin distorsionar el pronóstico comercial general. Exige una propiedad de **origen** para distinguir lo que entra por el portal de lo que entra por el comercial, y notificación al dueño de la cuenta para que no tenga que vigilar dos sitios | 2026-09-15 |
| **D-7** | Si la cuenta ya tiene un negocio abierto | **Se crea uno nuevo y se asocia como relacionado.** Actualizar el existente conserva un solo registro pero borra la atribución de origen, y sin origen no hay forma de medir el portal. Excepción de HU-077: si ya existe una solicitud del portal con la misma especificación en días recientes, no se duplica — se añade contexto a la existente | 2026-09-15 |
| **D-9** | Rango de tarifa en el portal | **No, en ningún caso.** Ni por perfil ni por célula. La conversación económica vive íntegra en la propuesta comercial. *Costo aceptado:* cuando llegue la venta de células (V2-4), la cifra de conjunto tendrá que aportarla el comercial por fuera del portal, lo que resta inmediatez al argumento de justificar una célula ante un comité | 2026-09-15 |
| **D-17** | Qué pasa si las sesiones validan la hipótesis rival | **Regla asimétrica, fijada antes de observar.** Se sostiene el rediseño por defecto; solo se reduce el alcance si **los tres participantes completan la tarea con la lista y al menos dos lo hacen con menos fricción visible**. Cualquier otro resultado es evidencia insuficiente, no un voto a favor de la lista. Ver §14.7 | 2026-09-15 (propuesta, pendiente de VoBo de Dirección General) |
| **D-11** | Umbral del sondeo de agentes que dispara I+D | **5 cuentas distintas responden que sí, y al menos 2 piden más detalle**, medido sobre los primeros tres envíos del boletín. Con este volumen contar cuentas es más honesto que calcular porcentajes, y pedir detalle cuesta algo mientras que tocar «me interesa» no. Si no se alcanza, la idea no muere: no hay evidencia para priorizarla ahora | 2026-09-15 |
| **D-12** | Mínimo de resultados para mostrar el espacio no-perfil | **8 resultados visibles.** Por debajo, una tarjeta que no es un perfil se lee como relleno y sugiere que el banco está vacío | 2026-09-15 |
| **D-13** | Dueño y cadencia del registro de demanda | **Talento Humano, revisión mensual.** Es quien actúa sobre el dato: el registro existe para decidir a quién sumar al banco. **Desbloquea RF-15 y HU-078** | 2026-09-15 |
| **D-14** | Umbral de similitud del camino del cero | **Resuelta sin umbral numérico.** "Lo más cercano" = perfiles que fallan exactamente un criterio, indicando cuál | 2026-09-15 |
| **D-15** | Ranking y ancla de tarjeta por logro cuantificado | **No procede.** El dato no existe en el banco entregado por Talento Humano, extraerlo tiene costo operativo recurrente y es autoreportado por naturaleza — incompatible con la jerarquía verificado/autoreportado del producto. Lo reemplazan las tres competencias del Sello Personal (RF-14.1) | 2026-09-14 |
| **D-4** | Control de acceso del cliente | **Enlace firmado + lista nominal de correos invitados + código al buzón.** Talento Humano declara los correos invitados al generar el enlace; un correo fuera de la lista no entra, aunque sea de la misma empresa. Un invitado puede pedir acceso para un colega y Talento Humano lo aprueba (RF-1.2.10). Una vez por dispositivo, sin registro ni contraseña, sin proveedor de identidad. *Revisada el 2026-09-25 por el sponsor: la resolución anterior (2026-09-24) autorizaba dominios y permitía el reenvío interno; antes, el 2026-09-16, había pasado de enlace firmado a secas a enlace más código* | 2026-09-25 |
| **D-22** | Acceso al panel de administración | **Correo `@trycore.com` inscrito en la lista nominal + código de un uso + sesión de una jornada.** Dos roles: administrador de inventario (Talento Humano, escribe) y observador (Mercadeo y Comercial, consulta). Sin credenciales propias del portal y **sin proveedor de identidad**. *Revisada el 2026-09-24 por decisión del sponsor: la resolución anterior era identidad corporativa, que exigía un proveedor de identidad que el hosting no justifica* | 2026-09-24 |
| **D-1** | Identificación del perfil | **Nombre y primer apellido visibles**, con la capacidad como descriptor inmediato y el código al pie. Sin fotografía. *Revertida el 2026-09-10: la resolución previa era publicar sin nombre* | 2026-09-10 |

> **Razón de la reversión de D-1.** Decisión de negocio de la Dirección de Mercadeo, alineada con el documento de especificaciones funcionales. Se aceptan de forma consciente sus dos consecuencias, ambas registradas: el consentimiento pasa a ser nominal y explícito (RF-8.4), y la reidentificación del profesional deja de ser un riesgo para volverse un hecho, con el efecto comercial descrito en §9.4 y en el riesgo de contacto directo de §10.3. Se mantiene sin fotografía: incluirla es una decisión distinta y no se tomó.

> **Razón de D-4.** Tras revertirse D-1, el enlace muestra nombre, primer apellido, trayectoria y clientes nombrados de profesionales reales. Por eso el acceso es **nominal**: solo entran los correos invitados en el enlace, verificados con un código a su buzón (RF-1.2, RF-1.2.11). Reenviar el enlace no da acceso; la segunda opinión de un colega pasa por una invitación que aprueba Talento Humano (RF-1.2.10). *Historia de la decisión:* el 2026-09-16 se pasó de enlace firmado a secas a verificación por dominio, que permitía el reenvío interno; el 2026-09-25 el sponsor la endureció a lista nominal.

---

# PARTE II · Modelo de datos

# Anexo B — Modelo de datos del perfil y mapeo desde el boletín

> Fuente: boletín de caracterización entregado por Talento Humano — 21 perfiles, 10 categorías de rol, 8 campos aplicados de forma consistente. Este anexo es el insumo directo de la **Fase 0** y la especificación de lo que Talento Humano debe entregar por perfil.

## B.1 Mapeo campo a campo

| Campo del boletín | Destino en el portal | Tratamiento |
|---|---|---|
| Nombre del profesional | Título de la tarjeta | **Cruza: nombre y primer apellido** (D-1 revertida). Sin segundo nombre ni segundo apellido, sin fotografía |
| Hoja de vida en cualquier formato | — | **No cruza.** El portal muestra evidencia estructurada, no documentos |
| Stack tecnológico | Faceta de tecnología | Normalizar contra una taxonomía cerrada; el texto libre no es filtrable |
| Etiquetas | Rol · Seniority · Especialidad | **Descomponer en tres campos discretos.** Es la fuente real del rol, no el encabezado de categoría (ver B.5) |
| Perfil Profesional | Resumen de la ficha | Reescribir eliminando universidad, semestre y empleadores nombrados |
| Formación académica | Nivel de formación (campo discreto) | Generalizar. "Ingeniero de Sistemas" o "Magíster en Gerencia de TI" sí; universidad, año, promedio y certificaciones con proveedor, no |
| Motivación y Proyección | — | **No cruza.** Ver B.4 |
| Experiencia Clave | Experiencia demostrable, en la ficha | **Cruza con clientes nombrados.** Es trayectoria del profesional, no información comercial de Trycore, y el nombre concreto es lo que la vuelve prueba. Se conservan los que aportan sector, escala o resultado; se descartan los que solo suman ruido. El consentimiento debe cubrir esta publicación explícitamente |
| Tecnologías Clave (8/10) | Anclas de tecnología | 5 en la tarjeta, hasta 8 en la ficha. Normalizar el conteo: hoy varía entre 8 y 13 |
| Sello Personal (3 competencias) | Neural Fit · **elemento diferenciador de la tarjeta** y bloque de la ficha | **Cruza tal cual.** Tras D-15, es además el único discriminador verificado del banco: existe para todos, lo produce Trycore y varía entre perfiles (RF-14.1) |
| Seguridad 360° · Sello SARO | Grid de Seguridad | Cruza como sello verificable, con fecha y alcance de la verificación. **SARO**, no "SORA" |
| Perfil evaluado DISC | Neural Fit | Cruza como sello; el resultado detallado no se publica |
| Cuestionario cliente (3 preguntas) | RF-5.1 | **Cruza literal** al formulario de solicitud |

## B.2 Campos que el portal necesita y el boletín no tiene

Talento Humano debe agregarlos por perfil. Sin ellos no hay facetas ni credibilidad de disponibilidad.

| Campo | Por qué | Requisito |
|---|---|---|
| Código de referencia | Identificador citable sin nombre | RF-3.5 |
| Disponibilidad (fecha desde) | Eje central de decisión del cliente. **Se carga como fecha y se publica como banda** (RF-3.13) | RF-2.3, RF-3.1, RF-3.13 |
| Estado de publicación | borrador · publicado · pausado · archivado | RF-8.3 |
| Consentimiento registrado | Bloquea la publicación | RF-8.4 |
| Modalidad (remoto / híbrido) | Faceta y condición operativa | RF-2.3 |
| Seniority normalizado | Hoy vive dentro de las etiquetas en texto libre | RF-2.3 |
| Años de experiencia (número) | Anclaje del título de la tarjeta | RF-3.1 |
| Sector de experiencia normalizado | Faceta crítica para BFSI | RF-2.3 |
| Idiomas y nivel | Presente en algunos perfiles, no capturado como campo. Relevante para cuentas regionales | RF-2.3 |
| País y ciudad del profesional | Está en la hoja de vida y no se capturó. Sin él no se puede emparejar la demanda presencial o híbrida | RF-13.5 · D-18 |
| Modalidades que el profesional acepta | Hoy solo Remoto o Híbrido, en un solo valor. Si un perfil acepta presencial, no hay dónde registrarlo | RF-13.5.2 |
| Evidencia de Grid Técnico | Hoy solo hay evidencia de Seguridad y de Neural Fit | RF-3.2 |
| Evidencia de Neural Speed | Ídem | RF-3.2 |

## B.3 Fecha de última actualización

Cada perfil debe registrar cuándo se actualizó por última vez su disponibilidad. Es lo que alimenta la bandeja de vigencia (RF-8.8) y el objetivo O5.

## B.4 Lista negra — lo que nunca cruza al portal

1. **Fotografía del profesional.** No se tomó la decisión de incluirla; hacerlo convierte la grilla en un directorio de personas.
2. **Datos de contacto**: correo, teléfono, perfiles en redes. No hay vía de contacto directo desde el portal.
3. **Hojas de vida** en cualquier formato o vía de acceso.
4. **Motivación y Proyección.** Expone la posición de negociación y la vida privada del profesional ante quien evalúa contratarlo, y choca con la restricción contractual de no motivar su integración a la planta del cliente. Es material interno de Talento Humano.
5. **Promedio académico y certificaciones con proveedor y fecha.** El nivel de formación cruza; el detalle no aporta y engorda la ficha.
6. **Resultado detallado del DISC.** Solo la lectura publicable: las tres competencias del Sello Personal.

> **Nota tras la reversión de D-1.** Con nombre, trayectoria y clientes nombrados, el profesional es plenamente identificable. Eso no es un defecto de la implementación: es la consecuencia aceptada de la decisión. Lo que exige es consentimiento nominal (RF-8.4), un canal de rectificación y revocación operativo (§8), y las mitigaciones contractuales del riesgo de contacto directo (§10.3).

## B.5 Hallazgos de calidad de datos

- **La categoría del boletín no coincide con el rol real en al menos dos perfiles.** Uno aparece bajo *Analista QA Funcional* y sus propias etiquetas lo describen como Ingeniero de Software Senior, backend y LLMs, sin mención de QA. Otro aparece bajo *Desarrollador IA* siendo principalmente QA Automation. **Consecuencia de diseño:** el filtro de rol se deriva de las etiquetas normalizadas, nunca del encabezado de categoría.
- **Las etiquetas mezclan rol y seniority en texto libre** ("Desarrollador junior Backend (Java/.NET)"). Hay que descomponerlas para que las facetas funcionen.
- **El conteo de "Tecnologías Clave" es inconsistente** entre perfiles, pese a declararse como 8.
- **Un mismo perfil trae varias etiquetas de rol.** El modelo debe admitir rol principal y roles secundarios, o el mismo perfil aparecerá en filtros contradictorios.

## B.6 Las cuatro dimensiones: qué es condición de entrada y qué es garantía

Confirmado con Talento Humano: los tres primeros filtros se aplican a **todo perfil antes de publicarse**. No hay perfiles parcialmente validados en el portal.

| Dimensión | Naturaleza | Dónde vive en el producto | Evidencia por perfil |
|---|---|---|---|
| **Grid de Seguridad** | Condición de entrada | Declaración única del banco (RF-6.4) | Sí, en el modelo de datos: alcance de la verificación y fecha. Se muestra como contenido de la ficha, no como insignia |
| **Grid Técnico** | Condición de entrada | Declaración única del banco (RF-6.4) | Sí: tipo de prueba, stack sobre el que se ejecutó, escenario de crisis y fecha |
| **Neural Fit** | Condición de entrada | Declaración única del banco (RF-6.4) | Sí: las tres competencias del Sello Personal. Es lo único de las tres que además diferencia entre perfiles, y por eso va destacado |
| **Neural Speed** | Garantía de servicio | Bloque de garantía (RF-6.5) | Solo donde exista. Parte del banco no está vinculado laboralmente y adquiere esta capa al incorporarse; afirmarla de la persona sería falso. Donde el perfil ya trabaja con agentes o LLMs, entra como experiencia |

**Reglas que se derivan**

1. **Uniforme no significa invisible, significa que no se repite.** El estándar se enuncia una vez, arriba, y pesa más así que fragmentado en 21 insignias.
2. **Uniforme tampoco significa vago.** Cada perfil conserva en el modelo de datos el detalle de sus tres validaciones. Si un cliente pregunta cómo se validó técnicamente a alguien, hay respuesta concreta con fecha y alcance. Uniforme en existencia, específico en contenido.
3. **Nunca se afirma de la persona lo que es del servicio.** Neural Speed se promete como forma de operar de Trycore, no como habilidad que el perfil trae puesta.
4. **Sin insignias, la tarjeta diferencia por lo que realmente decide la compra:** trayectoria, competencias, stack, sector y disponibilidad. Eso eleva el peso de la Experiencia Clave y del Sello Personal, que pasan a ser el contenido más importante de la ficha.

## B.7 Campos adicionales que exige B.6

| Campo | Contenido |
|---|---|
| Validación de seguridad | Alcance y fecha |
| Validación técnica | Tipo de prueba, stack, escenario resuelto y fecha |
| Evaluación DISC | Fecha y las tres competencias publicables |
| Vínculo con Trycore | Vinculado · banco no vinculado · fábrica de software. Determina si Neural Speed aplica como evidencia y condiciona D-10 |

## B.8 Cómo se presenta la validación técnica

Todo perfil publicado pasó validación técnica, pero **la prueba varía por familia de rol**: un desarrollador entrega código, un arquitecto resuelve un caso de diseño, un gerente de infraestructura responde un escenario de operación. Aplicar la misma prueba a todos no sería rigor, sería trámite. Lo que se estandariza no es la prueba: es el reporte.

### B.8.1 Catálogo de modalidades de prueba

La modalidad **se selecciona de un catálogo cerrado**, agrupado por familia de rol. No es texto libre y no se deriva automáticamente: dentro de una misma familia conviven pruebas distintas, y solo Talento Humano sabe cuál se le aplicó a cada persona.

Cada opción del catálogo trae **su propio texto de cara al cliente ya redactado** —qué exige, qué evalúa, qué entregable produce—. Seleccionarla completa los niveles 0 y 1 de B.9.2 en un solo acto.

> ⚠️ **El catálogo siguiente es una propuesta.** Está sembrado con los ejemplos aportados por Mercadeo y con equivalentes para las demás familias, para que la conversación con Talento Humano sea de corrección y no de creación. **Ninguna opción está validada contra la práctica real de evaluación.**

| Familia de rol | Opciones propuestas |
|---|---|
| **Desarrollo de software** | Proyecto bajo presión con persistencia, capa de servicios y modelo de arquitectura · Assessment center: aplicación desarrollada y código validado por un senior · Reto de código con entrega funcional y sustentación grabada ante evaluador |
| **Arquitectura de software** | Caso de arquitectura con trade-offs justificados ante panel · Revisión de una arquitectura existente y plan de evolución |
| **Infraestructura y operaciones** | Escenario de operación y continuidad bajo restricción · Caso de gobierno y gestión de proveedores de TI |
| **Automatización RPA** | Diseño de flujo de extremo a extremo con manejo de excepciones · Estabilización de un robot en producción con fallas |
| **QA y funcional** | Diseño de cobertura y casos límite sobre un requerimiento real · Automatización de un caso de regresión |
| **Gestión de proyectos** | Caso de planeación y control con desviaciones de costo y cronograma · Simulación de comité con interesados en conflicto |
| **Transversal** | Panel técnico con evaluador senior |

### B.8.1.1 Reglas de gobierno del catálogo

1. **Cerrado, nunca texto libre.** Un campo escribible produce, en seis meses, veintiún redacciones distintas de la misma prueba: se pierde la comparabilidad, el filtrado y la confianza en el vocabulario.
2. **Agregar una opción es un acto deliberado.** Quien la agrega redacta en ese momento su texto de cara al cliente. Si agregar es fácil y sin texto, el catálogo degenera en texto libre disfrazado.
3. **Salida honesta obligatoria.** Si la validación de alguien no encaja, no se fuerza una opción falsa ni se deja el campo vacío bloqueando la publicación: se usa *Panel técnico con evaluador senior*, que es una modalidad legítima, y el catálogo crece después.
4. **Opciones compuestas antes que selección múltiple.** Una entrada puede describir un paquete de pruebas. Mantiene el texto coherente y evita que la ficha se lea como una lista de trámites. Si la realidad exige combinaciones imprevisibles, se pasa a selección múltiple con máximo tres.

### B.8.2 Rúbrica común

Cuatro criterios aplicados a todas las modalidades, para que pruebas distintas sigan siendo comparables:

1. **Resolución del reto** — ¿resolvió lo que se le pidió?
2. **Decisiones de diseño** — ¿puede justificar por qué lo hizo así?
3. **Calidad y estándares** — estructura, documentación, trazabilidad.
4. **Sustentación** — ¿puede explicarlo ante un líder técnico del cliente?

**El resultado se publica como "cumple el estándar", nunca como puntaje.** Publicar 8,2 frente a 9,1 reintroduce el ranking entre personas que el producto evita por diseño y abre una discusión que no aporta a la decisión de compra. La calificación cuantificable de los más de 15 roles se conserva interna, para Delivery.

### B.8.3 Estructura fija del reporte en la ficha

Cinco campos, siempre los mismos, con contenido propio de cada modalidad:

> **Validación técnica — Reto de código con entrega funcional**
> **Se le pidió:** aplicación full stack de gestión de valor ganado (EVM), backend en Java 17 y Spring Boot, frontend en React.
> **Entregó:** repositorio funcional, documentación de arquitectura y sustentación grabada ante evaluador.
> **Se evaluó:** resolución del reto · decisiones de arquitectura · calidad y estándares · capacidad de sustentación.
> **Resultado:** cumple el estándar.
> **Fecha:** febrero de 2026.

### B.8.4 El artefacto crudo no se publica

Repositorios, documentos de sustentación y entregables **no se enlazan desde el portal**, por tres razones:

1. **Identifican al profesional.** Un repositorio cuelga de un usuario nombrado y un entregable lleva su firma. Publicarlos deroga D-1.
2. **El insumo no siempre favorece al candidato ante un comprador.** Una sustentación puede ser evidencia interna excelente y aun así incluir autocríticas, trabajo en curso o imprecisiones que restan ante alguien que llegó buscando certeza.
3. **Lo que se vende es el dictamen, no el insumo.** El repositorio es del candidato; la evaluación es de Trycore, y es el diferencial.

**Regla de cierre, alineada con D-1:** la ficha declara que el artefacto existe y está disponible para revisión en la sesión de alineación — el mismo momento en que aparece el nombre del profesional.

### B.8.5 Subproducto: evidencia de Neural Speed

Cuando la sustentación documenta criterio sobre uso de IA en el desarrollo —qué modelos empleó, por qué, con qué criterio de costo, cómo supervisó la salida—, eso es evidencia individual de Neural Speed y entra a la ficha como tal (B.6). No sustituye la garantía de servicio; la respalda donde existe.

### B.8.6 Campos adicionales que exige B.8

| Campo | Contenido |
|---|---|
| Modalidad de prueba | Seleccionada del catálogo cerrado de B.8.1 |
| Enunciado del reto | Una línea, concreta |
| Entregables recibidos | Qué produjo el candidato |
| Criterios evaluados | Los cuatro de B.8.2 |
| Resultado | Cumple el estándar |
| Fecha de la validación | Mes y año |
| Ubicación del artefacto | **Interno.** Nunca se expone en el portal |

## B.9 Cómo se carga la evidencia sin bloquear a Talento Humano

El riesgo operativo de B.8 es real: si publicar un perfil exige redactar un reporte, Talento Humano deja de publicar y el objetivo O5 se cae. La solución no es renunciar al detalle, es que casi todo el detalle no dependa del perfil.

### B.9.1 El texto vive en el catálogo, no en el perfil

El enunciado del reto, los entregables esperados y los criterios evaluados **son atributos de la modalidad**, no del individuo. Se redactan una sola vez, al crear la opción en el catálogo (B.8.1). Talento Humano no escribe: selecciona. Cada perfil nuevo hereda el bloque completo aportando únicamente su fecha de validación y su resultado.

### B.9.2 Tres niveles progresivos

| Nivel | Contenido | Costo para Talento Humano | ¿Bloquea publicar? |
|---|---|---|---|
| **0** | Modalidad, qué evalúa y fecha de validación | Un clic en el Select | No |
| **1** | Enunciado del reto y entregables esperados | Ninguno por perfil: viene con la opción del catálogo | No |
| **2** | Qué entregó ese perfil en concreto y qué se destacó | Por perfil, asistido (B.9.3) | No |

**Regla:** un perfil que pasó la validación —condición de entrada— puede publicarse con Nivel 0. El resto enriquece.

### B.9.3 Carga asistida desde el artefacto

Talento Humano adjunta la evidencia **en el formato en que ya la tiene**: documento, repositorio o transcripción de la llamada. El proyecto no opera con video (RF-8.11.1). El sistema propone un borrador de los campos descriptivos; la persona revisa y aprueba. El trabajo pasa de redactar a confirmar.

**Dos candados, porque aquí es donde el humo podría volver a entrar:**

1. **El veredicto nunca lo genera el sistema.** "Cumple el estándar" proviene del registro de evaluación interna, cargado por una persona. El asistente describe qué se pidió y qué se entregó; jamás dictamina.
2. **Nada se publica sin aprobación humana.** Estados del bloque: *borrador generado → revisado → publicado*. El asistente no puede afirmar lo que no está en el artefacto: si la evidencia no dice qué se evaluó, el campo queda vacío, nunca se completa por analogía con otro perfil.

### B.9.4 Campos que exige B.9

| Campo | Ámbito |
|---|---|
| Modalidad de prueba | Seleccionada del catálogo por Talento Humano |
| Enunciado, entregables esperados y criterios | Por opción del catálogo |
| Fecha de validación | Por perfil |
| Resultado | Por perfil, cargado por persona, nunca generado |
| Artefacto de evidencia | Por perfil, almacenamiento interno |
| Estado del bloque descriptivo | borrador generado · revisado · publicado |

---

---

# PARTE III · Épicas

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

### Historias de esta épica (8)

#### HU-090 — Entrar al portal desde el correo sin registrarme

**Como** líder de área que recibió el correo con perfiles para su proyecto,
**quiero** abrir el enlace y ver los perfiles sin crear usuario ni recordar contraseña,
**para** no perder tiempo en un registro para mirar algo que ustedes me enviaron.

##### Criterios de aceptación

###### Happy path

**Dado** que recibí el correo con el enlace de mi cuenta,
**cuando** toco el enlace,
**Entonces** entro directamente al portal
**Y** veo el nombre de mi cuenta y el contexto de mi proyecto
**Y** no se me pide usuario ni contraseña

###### Error — enlace manipulado

**Dado** que alguien altera los parámetros del enlace,
**cuando** se intenta abrir,
**Entonces** el portal no muestra inventario
**Y** se ofrece solicitar un enlace nuevo, sin lenguaje técnico

###### Edge case — buscador

**Dado** que un motor de búsqueda intenta indexar la dirección,
**cuando** rastrea la página,
**Entonces** el portal responde con exclusión de rastreo
**Y** ningún perfil queda indexado

##### Notas

Cubre RF-1.1 a RF-1.5. El acceso por enlace firmado sin credenciales es D-4, cerrada.

##### Trazabilidad

Épica madre: **EP-001** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-091 — Reconocer que la selección se armó para mi proyecto

**Como** líder de proyecto que abre el enlace del correo,
**quiero** encontrar los mismos perfiles que vi en el correo, con la razón por la que los eligieron,
**para** sentir que alguien pensó en mi caso y no que me mandaron un catálogo.

##### Criterios de aceptación

###### Happy path

**Dado** que entro desde un enlace con selección,
**cuando** carga el portal,
**Entonces** veo los mismos perfiles del correo, sin pasos intermedios
**Y** veo la razón declarada de la selección, referida a mi proyecto

###### Error — un perfil de la selección ya no está disponible

**Dado** que uno de los perfiles se pausó desde el envío,
**cuando** entro,
**Entonces** veo los demás con normalidad
**Y** el portal indica que uno cambió de disponibilidad, sin dejar un hueco sin explicar

###### Edge case — selección vacía

**Dado** que todos los perfiles de la selección dejaron de estar publicados,
**cuando** entro,
**Entonces** no veo una pantalla vacía
**Y** se me lleva a explorar el banco con el contexto de mi proyecto ya aplicado

##### Notas

Cubre RF-1.3 y RF-2.1. El escenario de error es real: entre que se arma el correo y que el cliente lo abre pasan días.

##### Trazabilidad

Épica madre: **EP-001** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-092 — Recuperar el acceso cuando el enlace venció

**Como** líder de área que guardó el correo y lo abre semanas después,
**quiero** obtener un enlace nuevo sin tener que escribirle a nadie y esperar,
**para** no perder la intención justo cuando por fin tuve tiempo de mirar.

##### Criterios de aceptación

###### Happy path

**Dado** que mi enlace expiró,
**cuando** lo abro,
**Entonces** veo una explicación en lenguaje llano de por qué expiró
**Y** puedo pedir uno nuevo desde ahí mismo

###### Error — solicito varias veces seguidas

**Dado** que pido un enlace nuevo dos veces en pocos minutos,
**cuando** envío la segunda,
**Entonces** el portal no genera enlaces en cadena
**Y** me indica que el primero ya va en camino

###### Edge case — la cuenta ya no está activa

**Dado** que mi cuenta dejó de tener perfiles contratados,
**cuando** pido un enlace nuevo,
**Entonces** la solicitud llega al ejecutivo comercial en lugar de generarse sola

##### Notas

Cubre RF-1.4. La vigencia del enlace va atada al ciclo del correo.

##### Trazabilidad

Épica madre: **EP-001** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-093 — Entrar sin una selección previa y ser encuadrado

**Como** líder de área que llegó por un enlace compartido en una reunión, sin selección,
**quiero** que el portal me oriente en lugar de mostrarme una lista de 23 perfiles,
**para** empezar por lo que necesito y no por lo que ustedes tienen.

##### Criterios de aceptación

###### Happy path

**Dado** que entro sin parámetros de selección,
**cuando** carga el portal,
**Entonces** veo una pregunta de encuadre antes del listado
**Y** puedo escribir una instrucción o entrar por familia de rol

###### Error — no elijo nada

**Dado** que ignoro el encuadre,
**cuando** sigo adelante,
**Entonces** accedo al banco completo con filtros disponibles
**Y** no quedo bloqueado

###### Edge case — enlace sin cuenta

**Dado** que el enlace no identifica ninguna cuenta,
**cuando** entro,
**Entonces** el portal no inventa un nombre de cuenta ni un proyecto
**Y** el saludo es neutro

##### Notas

Cubre RF-1.3 y el recorrido secundario de §6.3.

##### Trazabilidad

Épica madre: **EP-001** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-094 — Volver a la selección después de explorar

**Como** líder de proyecto que amplió la búsqueda al banco completo,
**quiero** volver a la selección que me armaron en un solo toque,
**para** no perder el trabajo de curaduría por haber explorado.

##### Criterios de aceptación

###### Happy path

**Dado** que amplié la búsqueda,
**cuando** toco volver a la selección,
**Entonces** regreso a los perfiles del correo
**Y** los que sumé al equipo mientras exploraba se conservan

###### Error — la selección ya no existe

**Dado** que los perfiles de la selección se archivaron,
**cuando** intento volver,
**Entonces** se me explica y se ofrece continuar desde lo que llevo

###### Edge case — nunca hubo selección

**Dado** que entré sin curaduría,
**cuando** miro la pantalla,
**Entonces** no aparece la opción de volver a una selección que no existe

##### Notas

Cubre RF-2.2. Es la resolución de la tensión entre curaduría y descubrimiento de §2.5.

##### Trazabilidad

Épica madre: **EP-001** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-095 — Pedir acceso para un colega

**Como** líder de área que quiere una segunda opinión de su arquitecto,
**quiero** pedir que inviten a mi colega y que vea lo mismo que yo,
**para** decidir en equipo sin tener que explicarle todo por escrito.

##### Criterios de aceptación

###### Happy path — invitación aprobada

**Dado** que pedí desde el portal que invitaran a mi colega y Talento Humano lo aprobó,
**cuando** mi colega abre el enlace y verifica su correo con el código,
**Entonces** ve la misma selección y el mismo contexto de cuenta
**Y** puede explorar y sumar perfiles

###### Error — el colega abre el enlace sin estar invitado

**Dado** que le reenvié el enlace a mi colega sin pedir su invitación,
**cuando** él escribe su correo en la puerta,
**Entonces** no recibe código ni ve perfiles
**Y** el portal le explica que el acceso es nominal y le ofrece pedir la invitación

###### Edge case — Talento Humano rechaza la invitación

**Dado** que pedí invitar a una persona y Talento Humano rechazó la petición,
**cuando** vuelvo a entrar al portal,
**Entonces** veo que la invitación no se aprobó y a quién consultar
**Y** esa persona sigue sin acceso

##### Notas

Cubre RF-1.2.10 y RF-1.2.11. **Reescrita el 2026-09-25** tras la revisión de D-4 a acceso nominal: antes la historia era «Compartir el enlace con un colega» y dependía del reenvío libre dentro de la empresa, que ya no da acceso. La necesidad —la segunda opinión del arquitecto— se conserva por invitación aprobada.

##### Trazabilidad

Épica madre: **EP-001** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-122 — Generar un enlace con exactamente los perfiles que elegí

**Como** administradora del banco de talento,
**quiero** seleccionar perfiles de cualquier familia y generar un enlace para una cuenta,
**para** proponerle justo lo que pensamos para ella y no un catálogo que tenga que filtrar.

##### Criterios de aceptación

###### Happy path — selección heterogénea

**Dado** que quiero proponerle a una cuenta un gerente, un desarrollador y un QA,
**cuando** los selecciono en el inventario y genero el enlace,
**Entonces** el enlace contiene exactamente esos tres perfiles
**Y** no se intenta expresarlos como un filtro, porque ninguno los devolvería solo a ellos
**Y** queda registrado con la cuenta, la razón, quién lo generó y su vigencia

###### Error — falta la razón de la selección

**Dado** que elegí los perfiles y la cuenta pero no escribí la razón,
**cuando** intento generar,
**Entonces** el sistema lo impide
**Y** me explica que sin razón el cliente recibe un catálogo y no una curaduría

###### Error — un perfil sin publicar

**Dado** que uno de los seleccionados está en borrador,
**cuando** intento generar,
**Entonces** el sistema me lo indica y no emite el enlace

###### Edge case — correos invitados del enlace

**Dado** que la cuenta tiene un contacto en el CRM y quiero invitar también a su arquitecto,
**cuando** genero el enlace,
**Entonces** el sistema me propone el correo del contacto y me deja añadir el del arquitecto
**Y** no emite el enlace sin al menos un correo invitado

##### Notas

**Dividida el 2026-09-22.** La historia original tenía **seis escenarios** y dos happy paths con **actores distintos**: Talento Humano generando el enlace y el cliente abriéndolo. Cuando los happy paths cambian de actor, el corte natural está ahí. Lo que el cliente ve al abrir es ahora **HU-144**.

**La decisión de fondo:** el enlace lleva **la lista de códigos**, no filtros. Una selección heterogénea no se puede expresar con ningún filtro, y ese es el caso real de uso.

**Coordinación necesaria:** Talento Humano genera el enlace porque conoce la disponibilidad, pero la razón de la selección necesita el contexto del proyecto, que lo tiene el ejecutivo comercial. Sin ese insumo la razón se vuelve genérica y la curaduría deja de serlo.

Cubre **RF-19.1**, **RF-19.3**, **RF-19.4**, **RF-19.5**, **RF-19.7** y **RF-1.2.7**.

##### Trazabilidad

Épica madre: **EP-001** · PRD v4.8 · habilita HU-144 · se relaciona con EP-011 (el correo es un vehículo para estos enlaces)

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ es el mecanismo que hace existir la curaduría |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ tras la división |
| T | Testeable | ✓ |

#### HU-144 — Abrir el enlace y encontrar la selección que me armaron

**Como** líder de área que recibió un enlace curado,
**quiero** abrirlo y ver los perfiles que eligieron para mí con su razón,
**para** entender en un vistazo por qué me proponen a estas personas y no a otras.

##### Criterios de aceptación

###### Happy path — la selección con su razón

**Dado** que abro un enlace curado vigente,
**cuando** carga el portal,
**Entonces** veo los perfiles seleccionados con la razón de la selección
**Y** el panel de especificación arranca vacío, porque no hay un rol común entre familias distintas
**Y** puedo ampliar la búsqueda y volver a la selección en un toque

###### Error — enlace revocado

**Dado** que el enlace fue revocado,
**cuando** lo abro,
**Entonces** veo una pantalla que explica cómo pedir uno nuevo
**Y** no veo un error ni el inventario

###### Edge case — un perfil cambió entre generar y abrir

**Dado** que un perfil del enlace se colocó en otro proyecto,
**cuando** abro el enlace,
**Entonces** veo los demás con normalidad
**Y** veo ese perfil aparte, con su estado real y cuándo se libera
**Y** nunca encuentro un hueco sin explicación

##### Notas

**Dividida de HU-122 el 2026-09-22.** El actor es otro —el cliente, no Talento Humano— y eso hacía que la historia original tuviera dos happy paths incompatibles en una sola.

**La fragilidad de la lista se resuelve sin renunciar a ella.** El portal reevalúa cada código al abrirse (RF-19.2): un hueco silencioso se lee como desorden; un cambio explicado se lee como control. Por eso el edge case es el criterio que más pesa de los tres.

**El panel arranca vacío a propósito.** Si la selección mezcla familias —un gerente y un QA— no hay rol común, y deducir uno sería inventar (RF-19.7).

Cubre **RF-19.2**, **RF-19.6** y **RF-19.7**.

##### Trazabilidad

Épica madre: **EP-001** · PRD v4.8 · depende de HU-122

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-122 — sin enlace emitido no hay qué abrir |
| N | Negociable | ✓ |
| V | Valiosa | ✓ el beneficio es del cliente y es visible en el primer segundo |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

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

### Historias de esta épica (2)

#### HU-074 — Refinar con filtros lo que la instrucción me devolvió

**Como** líder de área que ya tiene resultados de una instrucción,
**quiero** aplicar filtros sobre esos resultados sin perder la búsqueda que hice,
**para** recuperar el control cuando la instrucción devuelve más de lo que puedo revisar.

##### Criterios de aceptación

###### Happy path — filtro sobre resultado de instrucción

**Dado** que tengo resultados de una instrucción,
**cuando** aplico un filtro de seniority,
**Entonces** los resultados se reducen conservando la instrucción activa
**Y** veo la instrucción y el filtro como dos capas distintas
**Y** el portal registra que hubo uso de filtros después de una instrucción

###### Error — el filtro deja cero resultados

**Dado** que tengo resultados de una instrucción,
**cuando** aplico un filtro que ningún resultado cumple,
**Entonces** se me ofrece quitar ese filtro específico en un toque
**Y** no pierdo la instrucción

###### Edge case — filtrar sin instrucción previa

**Dado** que no he escrito ninguna instrucción,
**cuando** aplico filtros sobre el banco completo,
**Entonces** funcionan como en la versión anterior del portal
**Y** la ruta por facetas sigue disponible de principio a fin

##### Notas

Cubre RF-14.2. El registro del primer escenario es la prueba de falsación: si más de la mitad de las sesiones usan filtros tras una instrucción, la jerarquía de la Fase 2 está mal planteada. El último escenario preserva deliberadamente la ruta por facetas como condición de control para las sesiones con clientes.

##### Trazabilidad

Épica madre: **EP-002** · PRD v2.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-121 — Comparar muchos perfiles por el mismo criterio

**Como** líder de proyecto con varios perfiles candidatos,
**quiero** ver los resultados como tabla, con una columna por criterio,
**para** comparar leyendo columnas en lugar de abrir tarjeta por tarjeta.

##### Criterios de aceptación

###### Happy path — conmutar de vista

**Dado** que tengo resultados,
**cuando** cambio a la vista de tabla,
**Entonces** veo una fila por perfil y una columna por cada criterio activo
**Y** cada celda muestra si lo cumple o no
**Y** al pasar el cursor veo el dato que lo sustenta
**Y** la vista elegida se mantiene mientras siga navegando

###### Happy path — seleccionar varios y sumarlos de una vez

**Dado** que la tabla está a la vista,
**cuando** marco varios perfiles,
**Entonces** aparece una acción para sumarlos todos al equipo
**Y** al usarla se suman los que no estuvieran ya
**Y** la selección se limpia

###### Happy path — abrir un perfil desde la tabla

**Dado** que veo una fila que me interesa,
**cuando** la toco,
**Entonces** se abre el panel lateral con la ficha
**Y** puedo pasar al siguiente perfil sin cerrar

###### Error — sin criterios activos

**Dado** que no definí ningún criterio,
**cuando** miro la tabla,
**Entonces** veo las columnas base —perfil, disponibilidad, modalidad, país— sin columnas de criterio vacías
**Y** no aparece la columna de conteo de deseables

###### Edge case — pantalla estrecha

**Dado** que estoy en un teléfono,
**cuando** abro la tabla,
**Entonces** se desplaza horizontalmente dentro de su contenedor
**Y** la página no se arrastra de lado

##### Notas

Tomado de Juicebox, que ofrece vista clásica y vista de tabla (evidencia A).

**Para qué sirve cada vista:** las tarjetas sirven para evaluar un perfil a la vez; la tabla sirve para comparar muchos por el mismo criterio. Son tareas distintas y ninguna sustituye a la otra.

**Dos diferencias deliberadas con el referente.** Ellos muestran «Match 100%»; nosotros mostramos **«cumple 3 de 4»**, porque un porcentaje sugiere una precisión que no existe con cuatro criterios y además oculta cuáles cumple. Y no replicamos las columnas de empresa actual ni de enlace al perfil público: contradicen la decisión de no exponer contacto ni empleador de forma directa.

**Lo que la tabla habilita y la grilla no:** la selección múltiple. Es el motivo principal para tenerla.

Cubre RF-13.12.

##### Trazabilidad

Épica madre: **EP-002** · PRD v4.2

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ opera sobre los resultados existentes |
| N | Negociable | ✓ |
| V | Valiosa | ✓ |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

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

### Historias de esta épica (3)

#### HU-081 — Distinguir un perfil de otro por sus competencias verificadas

**Como** líder de área comparando varios perfiles en la lista de resultados,
**quiero** ver en cada tarjeta las tres competencias que Trycore verificó de esa persona,
**para** distinguir un perfil de otro por cómo trabaja y no solo por su cargo y su lista de tecnologías.

##### Criterios de aceptación

###### Happy path — competencias como elemento diferenciador

**Dado** que estoy viendo los resultados de una búsqueda,
**cuando** miro cualquier tarjeta,
**Entonces** veo las tres competencias del Sello Personal de ese perfil
**Y** veo que están marcadas como verificadas por Trycore
**Y** veo que difieren entre un perfil y otro de la lista

###### Error — perfil sin Sello Personal registrado

**Dado** que un perfil no tiene sus tres competencias cargadas,
**cuando** Talento Humano intenta publicarlo,
**Entonces** el panel impide la publicación
**Y** indica que el Sello Personal es obligatorio por ser condición de entrada del banco

###### Edge case — dos perfiles con las mismas tres competencias

**Dado** que dos perfiles comparten exactamente las mismas competencias,
**cuando** aparecen juntos en los resultados,
**Entonces** la tarjeta se apoya en los demás elementos diferenciadores —seniority, sector, stack y disponibilidad—
**Y** no se muestra ninguna señal que sugiera que son perfiles equivalentes

##### Notas

Reemplaza a **HU-079**, descartada al cerrarse D-15. El logro cuantificado no existe en el banco entregado por Talento Humano, su extracción tiene costo operativo recurrente y es autoreportado por naturaleza.

Las competencias del Sello Personal cumplen lo que el logro prometía sin ninguno de sus problemas: existen para el 100% de los perfiles porque el DISC es condición de entrada, las produce Trycore y no el candidato, no añaden mantenimiento, y son lo único de las tres validaciones que varía entre perfiles.

Cubre RF-14.0 y RF-14.1.

##### Trazabilidad

Épica madre: **EP-003** · PRD v2.1 · Reemplaza HU-079

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ no depende de otra historia de la Fase 2 |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | ✓ usa un campo que ya existe en el modelo de datos |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-119 — Saber por qué coincide cada perfil y por qué no

**Como** líder de área comparando varios perfiles,
**quiero** ver en cada tarjeta qué criterio cumple y cuál no, con el dato concreto,
**para** decidir sin abrir cada ficha ni fiarme de una puntuación que no puedo verificar.

##### Criterios de aceptación

###### Happy path — evidencia criterio por criterio

**Dado** que busqué con varios criterios,
**cuando** miro una tarjeta,
**Entonces** veo una línea por criterio con el dato que lo sustenta
**Y** las que cumple se distinguen de las que no

###### Happy path — también lo que no cumple

**Dado** que un perfil no cumple uno de mis criterios,
**cuando** miro su tarjeta,
**Entonces** lo veo dicho explícitamente
**Y** puedo decidir si me importa

###### Error — sin criterios activos

**Dado** que no he definido ningún criterio,
**cuando** miro las tarjetas,
**Entonces** no aparece ningún bloque de evidencia vacío

###### Edge case — dato ausente en el perfil

**Dado** que un perfil no tiene registrado el dato de un criterio,
**cuando** se evalúa,
**Entonces** se muestra como no cumplido y no como cumplido por omisión
**Y** nunca se infiere ni se redacta una explicación

##### Notas

Tomado de Juicebox, que muestra una línea de justificación por criterio (evidencia A).

**La diferencia es una restricción nuestra, no un olvido.** Las justificaciones de Juicebox las redacta un modelo sobre una persona real. Eso choca con RF-16.1: Trycore responde contractualmente por cada perfil publicado, y una afirmación inferida sobre alguien es un riesgo que no compensa. Nuestra evidencia sale de los datos, no de una redacción.

Mostrar también lo no cumplido es deliberado: un listado que solo enseña aciertos no ayuda a decidir, ayuda a vender.

Cubre RF-13.10.

##### Trazabilidad

Épica madre: **EP-003** · PRD v4.1

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

#### HU-120 — Comparar perfiles sin perder la lista

**Como** líder de proyecto revisando varios perfiles seguidos,
**quiero** abrir la ficha sobre los resultados y pasar al siguiente perfil sin volver atrás,
**para** comparar rápido sin perder dónde estaba.

##### Criterios de aceptación

###### Happy path — panel lateral con navegación

**Dado** que tengo una lista de resultados,
**cuando** abro un perfil,
**Entonces** la ficha se abre como panel lateral sobre la lista
**Y** puedo pasar al perfil anterior o siguiente sin cerrarla
**Y** veo en qué posición del conjunto estoy

###### Happy path — sumar desde el panel

**Dado** que tengo la ficha abierta,
**cuando** sumo el perfil a mi equipo,
**Entonces** se suma sin cerrar el panel
**Y** puedo seguir revisando

###### Error — primer o último perfil

**Dado** que estoy en el primero o en el último,
**cuando** miro la navegación,
**Entonces** la flecha correspondiente está deshabilitada
**Y** no se produce ningún salto inesperado

###### Edge case — móvil

**Dado** que estoy en un teléfono,
**cuando** abro un perfil,
**Entonces** el panel ocupa la pantalla completa
**Y** conserva la navegación entre perfiles

##### Notas

Tomado de Juicebox (evidencia A). Reemplaza la navegación a pantalla completa, que obligaba a ir y volver por cada perfil.

Cubre RF-13.11.

##### Trazabilidad

Épica madre: **EP-003** · PRD v4.1

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

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

### Historias de esta épica (2)

#### HU-080 — Ver qué le falta al equipo que estoy armando

**Como** líder de proyecto que está seleccionando varios perfiles,
**quiero** que el portal me señale los roles ausentes en la composición que llevo,
**para** no descubrir en la sesión de alineación que me faltaba un rol clave del proyecto.

##### Criterios de aceptación

###### Happy path — vacío señalado en tono informativo

**Dado** que llevo dos perfiles de desarrollo y ninguno de pruebas,
**cuando** reviso mi equipo,
**Entonces** veo una observación que describe la composición actual y los roles ausentes
**Y** la observación no propone perfiles concretos ni incluye llamados a la acción de venta

###### Error — composición sin patrón conocido

**Dado** que mi selección no corresponde a ninguna composición típica,
**cuando** reviso mi equipo,
**Entonces** no veo ninguna observación inventada
**Y** el resumen del equipo se muestra normalmente

###### Edge case — el cliente ignora la observación

**Dado** que vi la observación de vacío y aun así envío la solicitud,
**cuando** envío,
**Entonces** la solicitud se procesa sin fricción adicional
**Y** la observación mostrada queda registrada para la sesión de alineación

##### Notas

Cubre RF-14.6. El tono informativo es requisito y no estilo: en una relación de expansión de cuenta, sugerir roles no pedidos se lee como venta cruzada.

##### Trazabilidad

Épica madre: **EP-004** · PRD v2.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-084 — Ver la forma típica del trabajo que estoy por emprender

**Como** líder de proyecto que declaró un reto y seleccionó algunos perfiles,
**quiero** ver qué capacidades suelen requerir los proyectos como el mío y cuáles ya cubrí,
**para** no descubrir a mitad de camino que me faltaba una capacidad que era evidente para quien ya hizo esto antes.

##### Criterios de aceptación

###### Happy path — forma de referencia informativa

**Dado** que mi reto corresponde a un tipo de proyecto con composición de referencia registrada,
**cuando** reviso mi equipo,
**Entonces** veo qué capacidades suele requerir ese tipo de proyecto y cuáles cubre mi selección
**Y** veo de cuántos proyectos entregados sale esa referencia
**Y** no veo perfiles propuestos ni botones de añadir

###### Error — tipo de proyecto sin composición registrada

**Dado** que mi reto no corresponde a ningún tipo de proyecto con datos reales,
**cuando** reviso mi equipo,
**Entonces** no veo ninguna composición de referencia
**Y** no se muestra una composición genérica inventada para llenar el espacio

###### Edge case — el cliente descarta la referencia

**Dado** que vi la composición de referencia y la descarto,
**cuando** sigo usando el portal en la misma sesión,
**Entonces** no vuelve a aparecer
**Y** puedo enviar la solicitud sin ninguna advertencia adicional

###### Edge case — selección completa

**Dado** que mi selección cubre todas las capacidades de la referencia,
**cuando** reviso mi equipo,
**Entonces** la referencia lo confirma sin proponer nada más

##### Notas

**D-19 cerrada el 2026-09-21: solo los tres tipos de proyecto más frecuentes.** Delivery entrega la composición real de esos tres. Fuera de ellos el portal calla, que es el escenario del AC de error. Desbloquea esta historia.

**Regla dura de RF-14.7.1:** las composiciones se construyen sobre proyectos que Trycore entregó realmente. Una composición inventada para inflar la solicitud es el peor tipo de humo y se detecta de inmediato. Si el dato no existe, no se muestra: mismo criterio que cerró D-15.

**Regla de tono (RF-14.7.2):** quien nombra la meta es el cliente. El portal le devuelve la forma del trabajo y él saca la conclusión. Ahí está la diferencia entre acompañar y vender, y en una relación de expansión de cuenta esa diferencia es el activo.

**Prueba que la falsea:** si la referencia no sube el promedio de perfiles por solicitud, o si sube el abandono en la pantalla de equipo, era venta cruzada disfrazada de ayuda y se retira.

Cubre RF-14.7. Es el primer peldaño verificable de la venta de células (V2-4).

**Bloqueada por D-19.** Delivery debe entregar las composiciones reales de los proyectos entregados.

##### Trazabilidad

Épica madre: **EP-004** · PRD v2.3 · Depende de HU-083

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-083 para el reto |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Delivery según D-19 |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

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

### Historias de esta épica (6)

#### HU-096 — Revisar mi equipo antes de pedirlo

**Como** líder de proyecto que seleccionó varios perfiles,
**quiero** ver el conjunto completo con sus roles y en cuánto tiempo puede arrancar,
**para** saber qué estoy pidiendo antes de pedirlo.

##### Criterios de aceptación

###### Happy path

**Dado** que tengo varios perfiles seleccionados,
**cuando** abro mi equipo,
**Entonces** veo cada perfil con su banda de disponibilidad
**Y** veo los roles cubiertos
**Y** veo en cuánto tiempo el conjunto completo podría estar operando, que es la banda del perfil más lejano

###### Error — un perfil dejó de estar disponible

**Dado** que uno de los seleccionados se pausó,
**cuando** abro mi equipo,
**Entonces** ese perfil aparece señalado
**Y** puedo quitarlo o continuar sabiendo que cambió

###### Edge case — equipo vacío

**Dado** que quité todos los perfiles,
**cuando** abro mi equipo,
**Entonces** veo una salida clara hacia los resultados
**Y** no veo una pantalla en blanco

##### Notas

Cubre RF-4.3 y RF-4.5. La fecha del conjunto es la del perfil más tardío: es cuándo puede arrancar el equipo completo, no cuándo arranca el primero.

##### Trazabilidad

Épica madre: **EP-005** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-097 — Identificarme cuando no soy quien recibió el correo

**Como** arquitecto invitado al enlace que va a enviar la solicitud,
**quiero** poner mis datos en lugar de los del contacto original,
**para** que Trycore me busque a mí y no al contacto principal del envío.

##### Criterios de aceptación

###### Happy path

**Dado** que entré con mi correo invitado y no soy el contacto principal del envío,
**cuando** diligencio mis datos,
**Entonces** la solicitud viaja con mi nombre, mi cargo y el correo con el que entré
**Y** la cuenta sigue siendo la misma

###### Error — intento cambiar el correo

**Dado** que en el formulario escribo un correo distinto del que verifiqué al entrar,
**cuando** intento enviar,
**Entonces** la solicitud usa el correo verificado
**Y** el portal me explica que el correo es el de mi invitación

###### Edge case — contacto desconocido en empresa conocida

**Dado** que mi correo no existe en el CRM,
**cuando** se envía la solicitud,
**Entonces** se crea el contacto y se asocia a la empresa existente
**Y** nunca se crea una empresa duplicada

##### Notas

Cubre RF-5.2, RF-5.6 y RF-9.2. Con acceso nominal (D-4 revisada el 2026-09-25) el correo de quien solicita siempre es uno invitado y verificado; el último escenario sigue vigente porque un invitado puede no existir aún en el CRM.

##### Trazabilidad

Épica madre: **EP-005** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-098 — Saber qué pasa después de enviar

**Como** líder de proyecto que acaba de enviar la solicitud,
**quiero** entender cuál es el paso siguiente y en cuánto tiempo,
**para** no quedarme esperando sin saber si alguien la recibió.

##### Criterios de aceptación

###### Happy path

**Dado** que envío la solicitud,
**cuando** llego a la confirmación,
**Entonces** veo que el paso siguiente es una sesión de alineación con Delivery
**Y** veo el plazo de 10 días hábiles y desde cuándo corre
**Y** veo un resumen de lo que envié

###### Error — falla la integración con el CRM

**Dado** que la creación del negocio falla,
**cuando** se procesa el envío,
**Entonces** recibo la confirmación igual
**Y** la solicitud entra en cola de reintento y se alerta internamente

###### Edge case — segunda solicitud parecida

**Dado** que ya envié una solicitud similar hace días,
**cuando** envío otra,
**Entonces** el portal me muestra que hay una en curso y su fecha
**Y** puedo añadir contexto en lugar de duplicarla

##### Notas

Cubre RF-5.4, RF-5.5 y RF-9.6. La confirmación nunca se comunica como reserva ni contratación: es la resolución de §2.4.

##### Trazabilidad

Épica madre: **EP-005** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-099 — Agendar la sesión de alineación

**Como** líder de proyecto con prisa,
**quiero** elegir un horario para la sesión de alineación sin esperar un correo,
**para** arrancar el proceso el mismo día en que decidí.

##### Criterios de aceptación

###### Happy path

**Dado** que estoy en la confirmación,
**cuando** elijo un horario disponible,
**Entonces** la sesión queda agendada
**Y** la fecha se registra en el negocio
**Y** recibo la invitación

###### Error — sin horarios disponibles

**Dado** que no hay disponibilidad en los próximos días,
**cuando** abro el agendamiento,
**Entonces** se me ofrece que el ejecutivo me contacte
**Y** no quedo en una pantalla sin salida

###### Edge case — no quiero agendar ahora

**Dado** que cierro sin agendar,
**cuando** salgo del portal,
**Entonces** la solicitud sigue vigente
**Y** el responsable interno debe agendarla igual

##### Notas

Cubre RF-5.4 y RF-17.4. Es v1.1: en el MVP la confirmación explica el paso y el comercial agenda. **La fecha de alineación debe escribirse en el negocio aunque se agende por fuera**, o O3 no se puede medir.

##### Trazabilidad

Épica madre: **EP-005** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-100 — Ser advertido si intento pedir sin haber elegido nada

**Como** líder de área que llegó al formulario sin seleccionar perfiles,
**quiero** que el portal me lo diga antes de enviar,
**para** no mandar una solicitud vacía que obligue a una llamada para aclararla.

##### Criterios de aceptación

###### Happy path

**Dado** que no tengo perfiles seleccionados y tengo especificación,
**cuando** intento enviar,
**Entonces** el portal me ofrece enviarla como solicitud de perfil a medida
**Y** no me bloquea sin alternativa

###### Error — sin perfiles y sin especificación

**Dado** que no tengo ni lo uno ni lo otro,
**cuando** intento enviar,
**Entonces** se me pide completar lo mínimo
**Y** se conserva lo que ya escribí

###### Edge case — insisto

**Dado** que completo lo mínimo y envío igual,
**cuando** se procesa,
**Entonces** la solicitud se envía
**Y** queda marcada como especificación mínima para quien prepare la sesión

##### Notas

Cubre RF-5.1 y RF-14.3.

##### Trazabilidad

Épica madre: **EP-005** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-101 — Recibir la solicitud con contexto suficiente para preparar la sesión

**Como** integrante de Coordinación de Servicio responsable de la alineación,
**quiero** recibir la especificación completa del cliente y no solo los perfiles que eligió,
**para** llegar a la sesión sabiendo qué problema tiene y no solo qué pidió.

##### Criterios de aceptación

###### Happy path

**Dado** que llega una solicitud,
**cuando** la abro,
**Entonces** veo el reto declarado, la especificación completa y los perfiles seleccionados
**Y** veo si el cliente revisó su especificación o si la inferimos nosotros
**Y** veo quién solicita y desde qué cuenta

###### Error — especificación incompleta

**Dado** que el cliente no abrió el Perfil Objetivo,
**cuando** recibo la solicitud,
**Entonces** la especificación inferida llega marcada como no revisada
**Y** tengo lo suficiente para preparar la sesión igual

###### Edge case — sin responsable asignado

**Dado** que la solicitud llega sin dueño,
**cuando** pasa el tiempo,
**Entonces** el escalamiento se activa
**Y** nunca queda en una bandeja compartida sin lector

##### Notas

Cubre RF-17 completo. Cierra el hueco entre «se envió la solicitud» y «alguien la convirtió en una sesión agendada», que es donde vive O3.

##### Trazabilidad

Épica madre: **EP-005** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

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

### Historias de esta épica (25)

#### HU-086 — Pegar mi hoja de cálculo y ver qué va a pasar

**Como** administradora del banco de talento,
**quiero** pegar mi hoja de cálculo y ver exactamente qué cambiaría antes de confirmar,
**para** revisar decenas de perfiles de una vez sin miedo a romper algo.

##### Criterios de aceptación

###### Happy path — pegar desde la hoja de cálculo

**Dado** que copié un bloque de celdas de Excel con una columna de código y otra de disponibilidad,
**cuando** lo pego en el asistente,
**Entonces** el sistema reconoce que es un formato tabular sin que yo se lo diga
**Y** empareja las columnas con los campos del perfil y me deja corregir el emparejamiento
**Y** puedo guardar ese emparejamiento como plantilla para la próxima vez

###### Happy path — vista previa antes de tocar nada

**Dado** que el archivo se procesó,
**cuando** llego a la vista previa,
**Entonces** veo cada fila como tarjeta colapsada agrupada en nuevos, actualizados, archivados, sin cambios, omitidos y con error, con su conteo
**Y** al abrir un actualizado veo **solo los campos que cambian**, con valor anterior y nuevo
**Y** puedo desmarcar cualquier tarjeta para excluirla
**Y** nada se ha modificado todavía en el banco

###### Error — dos filas con el mismo código

**Dado** que mi archivo repite un código en dos filas,
**cuando** el sistema lo procesa,
**Entonces** ambas filas se marcan como error
**Y** no se aplica ninguna regla de precedencia por su cuenta

###### Edge case — valores que no existen en el banco

**Dado** que una fila trae una tecnología o un rol que hoy no existe,
**cuando** reviso la vista previa,
**Entonces** ese valor aparece destacado como nuevo en la taxonomía
**Y** puedo detectar de un vistazo si fue un error de digitación

##### Notas

**Dividida el 2026-09-22.** La historia original tenía **ocho escenarios**, y `METODOLOGIA.md` §4 usa el tope de cinco como detector de tamaño: más de cinco significa que la historia es muy grande. Su propia tabla INVEST ya proponía el corte —*«pegar y vista previa primero»*—. Se partió en tres: **HU-086** (pegar y previsualizar), **HU-141** (confirmar con el modo correcto) y **HU-142** (corregir solo lo que falló).

**La premisa que corrige esta historia:** quien importa no tiene un JSON, tiene una hoja de cálculo. El camino principal es pegar celdas; el JSON es el camino de máquina.

**Nada se modifica aquí.** Esta historia termina en la vista previa. Confirmar es HU-141, y esa separación es justamente lo que hace verificable la promesa de RF-8.15.5.

Cubre **RF-8.15.1**, **RF-8.15.5** y **RF-8.15.6**. Especificación completa en `docs/10-specs/importacion-masiva.md`.

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · depende de HU-088 · habilita HU-141

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ la vista previa vale aunque se confirme después |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ tras la división |
| T | Testeable | ✓ |

#### HU-087 — Deshacer una importación que salió mal

**Como** administradora del banco de talento,
**quiero** revertir por completo la última importación,
**para** que un archivo equivocado no me obligue a reconstruir decenas de perfiles a mano.

##### Criterios de aceptación

###### Happy path — revertir la última importación

**Dado** que acabo de importar y el resultado no es el que esperaba,
**cuando** uso la opción de deshacer,
**Entonces** cada perfil actualizado vuelve exactamente al estado que tenía antes
**Y** los perfiles que la importación creó quedan **archivados**, no borrados
**Y** el historial registra la reversión como un evento propio

###### Error — intentar revertir una importación que ya no es la última

**Dado** que hubo otra importación después de la que quiero deshacer,
**cuando** intento revertir la anterior,
**Entonces** el sistema me explica que solo se revierte la última
**Y** me muestra qué importaciones hay después

###### Edge case — un perfil cambiado a mano después de la importación

**Dado** que edité manualmente un perfil que la importación había tocado,
**cuando** reverto la importación,
**Entonces** el sistema me advierte cuáles perfiles cambiaron después
**Y** me deja elegir si los incluyo en la reversión o los dejo como están

##### Notas

**Por qué existe, si los CRM no lo hacen.** HubSpot y Salesforce permiten borrar lo que una importación creó, pero no deshacer lo que actualizó: con cientos de miles de registros es impracticable. Con un banco de decenas de perfiles curados a mano, volver atrás es barato y vale mucho.

**Es la contraparte del borrado masivo prohibido.** No se puede borrar en masa, pero una actualización masiva equivocada hace un daño equivalente, y sin reversión ese daño es permanente.

Cubre RF-8.15.8.

##### Trazabilidad

Épica madre: **EP-006** · PRD v3.5 · Depende de HU-086

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-086 |
| N | Negociable | ✓ |
| V | Valiosa | ✓ es la red de seguridad de la funcionalidad más destructiva del panel |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

#### HU-088 — Descargar una plantilla o el banco para editarlo y devolverlo

**Como** administradora del banco de talento,
**quiero** descargar los perfiles actuales en el mismo formato que acepta la importación,
**para** editarlos donde me resulta cómodo y devolverlos sin pelear con el formato.

##### Criterios de aceptación

###### Happy path — exportar y reimportar sin cambios

**Dado** que exporto el banco,
**cuando** vuelvo a importar el archivo sin tocarlo,
**Entonces** todas las filas caen en «sin cambios»
**Y** no se crea ni se modifica ningún perfil

###### Happy path — plantilla de muestra

**Dado** que nunca he importado y no conozco el formato,
**cuando** descargo la plantilla de muestra,
**Entonces** obtengo un archivo con las columnas y **tres ejemplos**: actualizar un campo, crear un perfil nuevo y archivar uno
**Y** puedo editarla y pegarla sin haber leído ninguna documentación

###### Error — el navegador bloquea la descarga

**Dado** que estoy en una vista donde la descarga está bloqueada,
**cuando** pido la plantilla o el banco,
**Entonces** el contenido se muestra para copiarlo
**Y** puedo continuar sin que la descarga haya funcionado

###### Happy path — dos formatos

**Dado** que voy a exportar,
**cuando** elijo el formato,
**Entonces** puedo descargar en hoja de cálculo o en JSON
**Y** ambos se pueden volver a importar sin conversión

###### Edge case — campos internos

**Dado** que el banco tiene campos que no se publican, como el motivo de pausa o la fecha exacta de disponibilidad,
**cuando** exporto,
**Entonces** esos campos vienen incluidos y marcados como internos
**Y** al reimportarlos siguen sin publicarse

##### Notas

**Por qué esta historia importa más de lo que parece.** La forma más confiable de obtener el formato correcto no es leer una documentación: es sacar lo que ya existe, editarlo y devolverlo. Sin exportación, la importación obliga a construir el archivo desde cero y a adivinar nombres de campos.

La prueba de ida y vuelta del primer criterio es además el mejor control de calidad de todo el mecanismo: si exportar e importar no es neutro, hay un error de formato en alguna parte.

Cubre RF-8.15.9.

##### Trazabilidad

Épica madre: **EP-006** · PRD v3.5 · Habilita HU-086

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ tiene valor por sí sola como respaldo del inventario |
| N | Negociable | ✓ |
| V | Valiosa | ✓ |
| E | Estimable | ✓ |
| S | Pequeña | ✓ |
| T | Testeable | ✓ la prueba de ida y vuelta es objetiva |

#### HU-089 — Crear valores de catálogo sin duplicar los que ya existen

**Como** administradora del banco de talento,
**quiero** crear roles, tecnologías y sectores desde un catálogo que me avise si ya existe algo parecido,
**para** que el banco crezca sin llenarse de duplicados que rompan los filtros del cliente.

##### Criterios de aceptación

###### Happy path — rol nuevo con su familia

**Dado** que necesito publicar un Diseñador UX/UI Banking y ese rol no existe,
**cuando** lo creo en el catálogo,
**Entonces** el sistema me exige elegir una familia
**Y** si la familia no tiene modalidades de prueba, me advierte que ningún perfil de esa familia se podrá publicar hasta definirla
**Y** el rol queda disponible en el editor de perfiles

###### Happy path — seleccionar en vez de escribir

**Dado** que estoy editando un perfil,
**cuando** voy a poner sus tecnologías,
**Entonces** las selecciono del catálogo, nunca las escribo libremente
**Y** si escribo algo que no existe, se me ofrece crearlo como una acción aparte

###### Error — valor parecido a uno existente

**Dado** que el catálogo ya tiene «Figma» y yo escribo «Fgima»,
**cuando** voy a crearlo,
**Entonces** el sistema me muestra el parecido y me deja usarlo en un toque
**Y** si aun así lo creo, es una decisión mía y no un accidente

###### Error — valor idéntico salvo mayúsculas

**Dado** que el catálogo ya tiene «Figma» y escribo «figma»,
**cuando** intento crearlo,
**Entonces** el sistema lo impide
**Y** me indica que ya existe

##### Notas

**Dividida el 2026-09-22.** La historia original tenía **seis escenarios** y mezclaba cuatro capacidades: crear, detectar parecidos, desactivar y fusionar. Su propia tabla INVEST proponía el corte —*«selección en vez de texto libre primero, fusión de duplicados después»*—. La limpieza de la taxonomía es ahora **HU-143**.

**El problema que resuelve:** con texto libre, la taxonomía se construye por tecleo. Tres formas de escribir Figma son tres tecnologías distintas y contaminan los filtros del cliente de forma permanente.

**La dependencia que el panel encadena:** un rol exige familia, y la familia determina las modalidades de prueba disponibles. Crear un rol de una familia sin modalidades produce perfiles que no se pueden publicar, y eso hay que saberlo **al crear el rol**, no al intentar publicar.

**Lo que deliberadamente no se declara:** la relación entre rol y tecnologías. Emerge de los perfiles reales y el panel del cliente la calcula sola (RF-8.16.7). Declararla a mano sería trabajo doble que se desactualiza.

Cubre **RF-8.16.2**, **RF-8.16.3**, **RF-8.16.4** y **RF-8.16.8**.

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · consumida por HU-125 · habilita HU-143

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ protege la calidad de los filtros, que es lo que el cliente usa |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ tras la división |
| T | Testeable | ✓ |

#### HU-123 — Entrar al panel con mi correo corporativo

**Como** administradora de inventario de Talento Humano,
**quiero** entrar al panel con el correo corporativo que ya uso todos los días,
**para** no administrar una contraseña más y que mi acceso muera el día que salga de la empresa.

##### Criterios de aceptación

###### Happy path — entrada con correo inscrito y código

**Dado** que mi correo `@trycore.com` está inscrito en la lista del panel con rol de administradora de inventario,
**cuando** completo la entrada con el código de un uso que me llegó a ese buzón,
**Entonces** entro al panel con mi rol
**Y** no se me pide crear ni recordar una contraseña propia del portal
**Y** el panel me identifica por mi correo para el registro de auditoría

###### Error — mi buzón corporativo ya no existe

**Dado** que salí de la empresa y mi buzón corporativo se desactivó,
**cuando** intento entrar al panel,
**Entonces** el código no me llega y no puedo entrar
**Y** el registro de auditoría no muestra ninguna desactivación manual de mi acceso

###### Error — correo sin inscribir

**Dado** que tengo un correo `@trycore.com` que no está inscrito en la lista del panel,
**cuando** lo escribo para entrar,
**Entonces** veo el mismo mensaje que vería un correo inscrito —«si tu correo tiene acceso, te llegó un código»— y a quién pedir el acceso
**Y** no me llega ningún código ni veo inventario ni datos de profesionales

###### Edge case — el panel no se alcanza desde el enlace del cliente

**Dado** que un cliente tiene el enlace del portal,
**cuando** intenta llegar al panel desde ahí,
**Entonces** no encuentra ninguna ruta que lo lleve, porque el panel vive en una dirección que el portal nunca expone

###### Edge case — sesión abierta cuando el buzón se desactiva

**Dado** que tengo una sesión abierta en el panel y mi buzón corporativo se desactiva,
**cuando** pasan doce horas desde que abrí la sesión,
**Entonces** la sesión caducó y el panel me pide un código nuevo, que ya no puedo recibir

##### Notas

Cubre **RF-8.1**, **RF-8.1.1**, **RF-8.1.3**, **RF-8.1.4**, **RF-8.1.5** y **RF-8.1.6**. Aplica **D-22 revisada el 2026-09-24**: no hay proveedor de identidad; el acceso es correo inscrito más código de un uso, dentro de lo que permite el hosting compartido (§8.3 del PRD). El archivo conserva su nombre anterior para no romper referencias.

**Por qué esta historia va primera de la épica.** RF-8.1.3 lo dice sin rodeos: el registro de auditoría de RF-8.9 exige saber *quién* cambió algo, y el «quién» solo existe si hay identidad. Sin esta historia, HU-138 no se puede construir.

**Duración de la sesión:** una jornada con un máximo de doce horas, y cierre a los sesenta minutos de inactividad (RF-8.1.6).

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.9 · D-22

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ no depende de otra historia del panel |
| N | Negociable | ✓ describe el resultado; el formato del código y del mensaje es negociable |
| V | Valiosa | ✓ elimina administración de credenciales y cierra el riesgo de accesos huérfanos |
| E | Estimable | ✓ sin proveedor externo: firma, código, sesión y correo saliente, todo en el hosting |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-124 — Consultar el banco sin poder modificarlo

**Como** analista de Mercadeo con rol observador,
**quiero** consultar el inventario, los enlaces, los colocados y la demanda sin poder escribir nada,
**para** armar la curaduría de una cuenta sin riesgo de alterar el banco por accidente.

##### Criterios de aceptación

###### Happy path — consulta completa

**Dado** que tengo rol observador,
**cuando** entro al panel,
**Entonces** veo inventario, enlaces generados, perfiles colocados, registro de demanda y cobertura
**Y** no veo ningún control de edición, publicación ni importación

###### Error — intento de escritura por ruta directa

**Dado** que tengo rol observador,
**cuando** llego por una dirección de edición que alguien me pasó,
**Entonces** el panel rechaza la acción y explica que mi rol es de consulta
**Y** el intento queda en el registro de auditoría

###### Edge case — necesito un cambio que no puedo hacer

**Dado** que veo un dato desactualizado,
**cuando** quiero corregirlo,
**Entonces** el panel me ofrece avisar a quien administra el inventario
**Y** no me deja en un callejón sin salida

##### Notas

Cubre **RF-8.1.2**, rol *observador*. Es el rol de Mercadeo y Comercial.

**Por qué el observador no es un lujo.** Mercadeo arma la selección de perfiles de cada cuenta (HU-113) y necesita ver disponibilidad real. Darle permiso de escritura para que pueda mirar sería el camino corto y el error: quien arma correos no debería poder despublicar un perfil.

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · D-22 · relacionada con HU-113

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-123 — el rol necesita identidad |
| N | Negociable | ✓ |
| V | Valiosa | ✓ habilita a Mercadeo sin exponer el banco a escritura |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

#### HU-125 — Crear un perfil eligiendo del catálogo

**Como** administradora de inventario de Talento Humano,
**quiero** crear un perfil eligiendo rol, tecnologías y sector de un catálogo en lugar de escribirlos,
**para** que el banco no termine con «Figma», «figma» y «Fgima» como tres tecnologías distintas.

##### Criterios de aceptación

###### Happy path — perfil nuevo en borrador

**Dado** que tengo rol de administradora,
**cuando** creo un perfil con sus atributos del modelo de datos,
**Entonces** el perfil queda en estado *borrador*
**Y** rol, tecnologías y sector se eligieron del catálogo, no se escribieron libres
**Y** el perfil no es visible en el portal

###### Error — familia sin modalidades de prueba

**Dado** que elijo un rol cuya familia no tiene modalidades de prueba registradas,
**cuando** lo selecciono,
**Entonces** el panel me advierte en ese momento que ningún perfil de esa familia podrá publicarse
**Y** me ofrece ir a registrar la modalidad antes de seguir

###### Error — campos obligatorios incompletos

**Dado** que dejo sin llenar un atributo obligatorio del modelo,
**cuando** intento guardar,
**Entonces** el perfil se guarda igual como borrador
**Y** el panel señala qué falta para poder publicarlo

###### Edge case — el valor que necesito no está en el catálogo

**Dado** que el rol que necesito no existe,
**cuando** lo escribo,
**Entonces** el panel me muestra los valores parecidos antes de dejarme crear uno nuevo
**Y** crear queda disponible después de haber visto la alternativa

##### Notas

Cubre **RF-8.2**, **RF-8.16.2**, **RF-8.16.3** y **RF-8.16.4**.

**El borrador es el estado de llegada, siempre.** Un perfil nuevo no nace publicado ni puede nacerlo: RF-8.4 exige consentimiento nominal registrado antes de publicar, y ese registro es un acto aparte (HU-127).

**La detección de parecidos vive en HU-089** (catálogos). Aquí solo se consume desde el editor: por eso el edge case describe el comportamiento y no la mecánica.

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · relacionada con HU-089

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | consume el catálogo de HU-089, no lo construye |
| N | Negociable | ✓ |
| V | Valiosa | ✓ es la puerta de entrada del inventario |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

#### HU-126 — Editar un perfil publicado sin sorpresas

**Como** administradora de inventario de Talento Humano,
**quiero** corregir un perfil que ya está publicado sabiendo qué verá el cliente al guardar,
**para** no cambiar en vivo la ficha que una cuenta está mirando sin darme cuenta.

##### Criterios de aceptación

###### Happy path — edición con efecto declarado

**Dado** que edito un perfil en estado *publicado*,
**cuando** guardo el cambio,
**Entonces** el panel me dice qué campos cambian de cara al cliente antes de confirmar
**Y** al confirmar el cambio queda visible en el portal
**Y** queda registrado qué cambió, quién y cuándo

###### Error — el cambio deja el perfil sin requisitos de publicación

**Dado** que edito un perfil publicado y quito un dato que la publicación exige,
**cuando** guardo,
**Entonces** el panel bloquea el guardado o me ofrece pasar el perfil a borrador
**Y** nunca deja publicado un perfil que dejó de cumplir sus condiciones

###### Edge case — edición de un perfil colocado

**Dado** que el perfil está colocado en una cuenta,
**cuando** lo edito,
**Entonces** puedo cambiar sus atributos con normalidad
**Y** el panel me recuerda que sigue publicado con su disponibilidad en la fecha de fin de la asignación

##### Notas

Cubre **RF-8.2** y se apoya en **RF-8.7** (vista previa, HU-129) y **RF-8.9** (auditoría, HU-138).

**Editar publicado no es lo mismo que editar borrador.** Un borrador no lo ve nadie; un publicado puede estar abierto en la pantalla de un cliente ahora mismo. Por eso el happy path exige declarar el efecto antes de confirmar y no después.

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ evita cambios en vivo no advertidos |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

#### HU-127 — Registrar el consentimiento nominal del profesional

**Como** administradora de inventario de Talento Humano,
**quiero** registrar que el profesional autorizó publicar su nombre junto con su trayectoria y sus clientes,
**para** que el banco tenga respaldo de cada perfil nominal que se muestra a una cuenta.

##### Criterios de aceptación

###### Happy path — consentimiento nominal y explícito

**Dado** que el profesional autorizó publicar nombre y primer apellido junto con trayectoria y clientes nombrados, ante cuentas cliente y de forma continua,
**cuando** registro ese consentimiento en su perfil,
**Entonces** el perfil queda habilitado para pasar a *publicado*
**Y** queda registrado quién lo registró y cuándo

###### Error — consentimiento anterior para publicación anonimizada

**Dado** que el profesional consintió cuando el banco se publicaba sin nombres,
**cuando** intento usar ese consentimiento para el perfil nominal,
**Entonces** el panel lo rechaza y explica que ese consentimiento no cubre este uso
**Y** exige recogerlo de nuevo

###### Error — consentimiento revocado

**Dado** que un profesional revoca su consentimiento,
**cuando** lo registro,
**Entonces** el perfil sale de *publicado* de inmediato
**Y** el portal deja de mostrarlo sin dejar un hueco sin explicar

###### Edge case — consentimiento parcial

**Dado** que el profesional autoriza su trayectoria pero no que se nombren sus clientes,
**cuando** lo registro,
**Entonces** el perfil puede publicarse con la experiencia despersonalizada
**Y** los clientes nombrados no aparecen en su ficha

##### Notas

Cubre **RF-8.4**. Es consecuencia directa de la **reversión de D-1** (2026-09-10): al publicarse nombre y primer apellido, el consentimiento pasó de genérico a **nominal y explícito**.

**El consentimiento recogido antes no sirve.** El PRD es explícito: el consentimiento para una publicación anonimizada no cubre la publicación nominal. Esto significa trabajo real de Talento Humano sobre el banco existente antes de salir a producción, y se cruza con **D-3** — 25 perfiles publicados como umbral, cada uno con consentimiento nominal recogido de nuevo.

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · D-1 revertida · condiciona D-3

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el registro, no el medio de recolección |
| V | Valiosa | ✓ es el respaldo legal de todo el producto |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

#### HU-128 — Ser bloqueada si intento publicar sin consentimiento

**Como** administradora de inventario de Talento Humano,
**quiero** que el panel me impida publicar un perfil sin consentimiento registrado,
**para** que un descuido mío no ponga el nombre de un profesional frente a un cliente sin su autorización.

##### Criterios de aceptación

###### Happy path — el bloqueo actúa

**Dado** que un perfil no tiene consentimiento nominal registrado,
**cuando** intento publicarlo,
**Entonces** el panel lo impide y me dice exactamente qué falta
**Y** me ofrece ir a registrarlo

###### Error — intento de saltarse el bloqueo por importación

**Dado** que un archivo de importación trae un campo de consentimiento,
**cuando** lo proceso,
**Entonces** el consentimiento no se concede y el perfil llega a borrador
**Y** el bloqueo se mantiene

###### Edge case — publicación masiva

**Dado** que selecciono varios perfiles para publicar a la vez,
**cuando** alguno no tiene consentimiento,
**Entonces** se publican los que sí lo tienen
**Y** los demás quedan señalados con su motivo, sin abortar la operación completa

##### Notas

Cubre **RF-8.4** desde el lado del bloqueo y **RF-8.15.7** desde el lado de la importación.

**Por qué es historia aparte de HU-127.** Registrar el consentimiento es un acto administrativo; el bloqueo es una garantía del sistema. Separarlas permite verificar la garantía sin depender de cómo se recoja el consentimiento, y deja el bloqueo como criterio de aceptación propio — que es lo que se va a auditar.

**El bloqueo es de los que RF-8.16.1 deja fuera de los catálogos paramétricos**: no es administrable, es lógica de producto.

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · depende de HU-127

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-127 para tener qué verificar |
| N | Negociable | ✓ |
| V | Valiosa | ✓ es la garantía que protege al profesional y a Trycore |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

#### HU-129 — Previsualizar la ficha exactamente como la verá el cliente

**Como** administradora de inventario de Talento Humano,
**quiero** ver la ficha tal como la verá el cliente antes de publicarla,
**para** no descubrir en producción que un campo quedó vacío o que un texto se lee distinto de lo que pensé.

##### Criterios de aceptación

###### Happy path — vista previa fiel

**Dado** que tengo un perfil listo para publicar,
**cuando** abro la vista previa,
**Entonces** veo la ficha exactamente como la verá el cliente
**Y** veo la disponibilidad como banda de arranque, no como fecha
**Y** veo el país, y la ciudad solo si la necesidad fuera presencial o híbrida

###### Error — campos que no alcanzan a llenar su bloque

**Dado** que un bloque de la ficha no tiene datos suficientes,
**cuando** previsualizo,
**Entonces** veo cómo se comporta ese bloque vacío en la ficha real
**Y** el panel me dice si eso impide publicar o solo empobrece la ficha

###### Edge case — previsualizar un perfil ya publicado

**Dado** que edité un perfil publicado,
**cuando** previsualizo,
**Entonces** veo el resultado del cambio antes de confirmarlo
**Y** puedo compararlo con lo que el cliente ve ahora

##### Notas

Cubre **RF-8.7**. Se apoya en **RF-3.13** (banda de disponibilidad) y en la revisión de **D-18** (ciudad condicionada a la modalidad).

**La fidelidad es el requisito, no el detalle.** Una vista previa aproximada es peor que ninguna: crea confianza en algo que no se verificó. Por eso los tres escenarios verifican equivalencia con lo que el portal publica, incluidas las reglas de presentación que no viven en el dato — la banda y la ciudad condicionada.

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · RF-3.13 · D-18 revisada

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ evita publicar fichas rotas |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ la equivalencia con la ficha publicada es verificable |

#### HU-130 — Publicar un perfil sin esperar el reporte detallado de validación

**Como** administradora de inventario de Talento Humano,
**quiero** publicar un perfil con el enunciado que se deriva de su rol, sin esperar a redactar el reporte completo,
**para** que el banco no se quede vacío mientras alguien encuentra tiempo de escribir evidencia.

##### Criterios de aceptación

###### Happy path — publicación con Nivel 0

**Dado** que un perfil cumple sus condiciones de publicación y no tiene reporte detallado de validación,
**cuando** lo publico,
**Entonces** se publica con el enunciado de Nivel 0, derivado de su familia de rol sin intervención mía
**Y** la ficha no muestra un bloque vacío ni promete un detalle que no existe

###### Error — la familia no tiene modalidades de prueba registradas

**Dado** que la familia del rol no tiene ninguna modalidad de prueba en el catálogo,
**cuando** intento publicar,
**Entonces** el panel lo impide y me manda a registrar la modalidad
**Y** explica que sin ella ningún perfil de esa familia puede publicarse

###### Edge case — el detalle llega después

**Dado** que publiqué con Nivel 0 y más tarde registro el reporte detallado,
**cuando** lo guardo,
**Entonces** la ficha se enriquece sin republicar el perfil
**Y** el cliente que la abra ve la evidencia por criterio

##### Notas

Cubre **RF-8.10** y los **tres niveles progresivos del Anexo B.9**.

**Este requisito existe para proteger a O5 de sí mismo.** Si publicar exigiera el reporte completo de las tres validaciones, el cuello de botella de la redacción se convertiría en cuello de botella del inventario, y un banco vacío no sostiene ningún objetivo. La publicación nunca se bloquea por falta de detalle; se bloquea por falta de consentimiento (HU-128) y por falta de modalidad en la familia (RF-8.16.4).

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · Anexo B.9

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ desbloquea el llenado del banco, que es la condición de D-3 |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

#### HU-131 — Adjuntar el artefacto de evidencia tal como lo tengo

**Como** administradora de inventario de Talento Humano,
**quiero** guardar el documento, la transcripción o el repositorio de la validación en el formato en que existe,
**para** que la evidencia de cada perfil viva en un solo sitio y no en la carpeta de quien hizo la prueba.

##### Criterios de aceptación

###### Happy path — el artefacto queda asociado al perfil

**Dado** que tengo el artefacto de una validación,
**cuando** lo adjunto al perfil,
**Entonces** queda almacenado internamente y asociado a esa validación
**Y** puedo recuperarlo después desde el panel

###### Error — formato o tamaño no admitido

**Dado** que adjunto un archivo que el sistema no admite,
**cuando** intento guardarlo,
**Entonces** el panel me dice qué admite y por qué
**Y** no pierdo lo demás que ya había registrado del perfil

###### Edge case — el artefacto nunca se publica

**Dado** que el perfil tiene un artefacto adjunto,
**cuando** el cliente abre la ficha,
**Entonces** ve el reporte estructurado y nunca el artefacto crudo
**Y** no hay ninguna ruta desde el portal que lo alcance

##### Notas

Cubre la primera mitad de **RF-8.11** y la prohibición de **B.8.4**.

**El artefacto crudo no se publica, y es regla dura.** B.8.4 lo fija: a la ficha llega el reporte estructurado, no el documento de la prueba. Publicar el crudo expondría material que el profesional no consintió y que ninguna cuenta necesita.

**Esta historia vale sola.** Aunque nunca se construya la derivación asistida (HU-140), tener la evidencia guardada y asociada al perfil resuelve el problema de que hoy vive dispersa. Por eso se separó.

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · Anexo B.8.4 · dividida de la HU-131 original el 2026-09-22

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ no depende de HU-140 |
| N | Negociable | ✓ |
| V | Valiosa | ✓ centraliza la evidencia dispersa |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ tras la división |
| T | Testeable | ✓ |

#### HU-132 — Actualizar la disponibilidad en dos clics

**Como** administradora de inventario de Talento Humano,
**quiero** cambiar la disponibilidad de un perfil desde el listado sin abrirlo,
**para** que mantener el banco al día cueste segundos y no deje de hacerse.

##### Criterios de aceptación

###### Happy path — cambio desde el listado

**Dado** que estoy en el listado de perfiles,
**cuando** actualizo la disponibilidad de uno,
**Entonces** el cambio se guarda sin abrir la ficha completa
**Y** el portal refleja la nueva banda de arranque de inmediato
**Y** queda registrado quién lo cambió y cuándo

###### Error — fecha que contradice el estado

**Dado** que el perfil está *pausado*,
**cuando** le pongo una fecha de disponibilidad,
**Entonces** el panel señala la incoherencia en la fila
**Y** me ofrece la acción que la corrige en un clic

###### Edge case — varios perfiles a la vez

**Dado** que varios perfiles quedan libres el mismo día,
**cuando** los selecciono y actualizo juntos,
**Entonces** el cambio se aplica a todos
**Y** veo el resultado por perfil, no un mensaje global

##### Notas

Cubre **RF-8.5** y se apoya en **RF-8.14.1** y **RF-8.14.3**.

**Esta es la historia de la que depende O5.** El objetivo habilitante mide el porcentaje de perfiles publicados con disponibilidad actualizada en los últimos 30 días. Si actualizar cuesta abrir una ficha, navegar y guardar, no se hace; y cuando no se hace, el portal empieza a afirmar disponibilidades que nadie sostiene. Dos clics no es una comodidad: es la condición de que el objetivo se cumpla.

**La fecha se captura aquí; el cliente ve una banda.** RF-3.13 traduce en el momento de mostrar, así que la banda se recalcula sola y no envejece.

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · O5 · RF-3.13

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ «dos clics» es la intención, no la implementación |
| V | Valiosa | ✓ es la condición operativa de O5 |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

#### HU-133 — Pausar un perfil declarando el motivo

**Como** administradora de inventario de Talento Humano,
**quiero** que pausar un perfil me obligue a decir por qué, eligiendo de una lista corta,
**para** que nadie use la pausa como forma encubierta de expresar una fecha.

##### Criterios de aceptación

###### Happy path — pausa con motivo

**Dado** que necesito retirar temporalmente un perfil del portal,
**cuando** lo pauso,
**Entonces** el panel me exige elegir el motivo de una lista corta
**Y** el perfil deja de mostrarse en el portal
**Y** el motivo queda registrado con quién lo pausó y cuándo

###### Error — el motivo es en realidad una fecha

**Dado** que quiero pausar un perfil porque está ocupado hasta cierta fecha,
**cuando** busco el motivo,
**Entonces** el panel me indica que eso no es una pausa sino disponibilidad
**Y** me lleva a dejar el perfil publicado con la fecha correcta

###### Edge case — la pausa se prolonga

**Dado** que un perfil lleva pausado más tiempo del razonable,
**cuando** reviso la bandeja de vigencia,
**Entonces** aparece marcado para revisión
**Y** puedo reactivarlo o archivarlo

##### Notas

Cubre **RF-8.14.2** y se apoya en **RF-8.8**.

**La distinción que este requisito protege.** Estado y disponibilidad son ejes distintos (RF-8.14.1). Usar *pausado* para decir «vuelve en noviembre» destruye inventario vendible: RF-8.13.2 es explícito en que un perfil ocupado **no se oculta, se ofrece desde que queda libre**. La lista corta de motivos existe para que la pausa no sirva de comodín.

**Los motivos de pausa son catálogo paramétrico** (RF-8.16), administrable desde HU-089.

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · relacionada con HU-089 y HU-136

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ protege inventario vendible de desaparecer por mal uso del estado |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

#### HU-134 — Corregir incoherencias entre estado y disponibilidad

**Como** administradora de inventario de Talento Humano,
**quiero** ver en la propia fila cuándo el estado y la disponibilidad de un perfil se contradicen, con la acción que lo corrige,
**para** no tener que auditar el banco a mano buscando datos que se pelean entre sí.

##### Criterios de aceptación

###### Happy path — incoherencia señalada y corregible

**Dado** que un perfil tiene estado y disponibilidad que se contradicen,
**cuando** miro el listado,
**Entonces** la incoherencia aparece señalada en su propia fila
**Y** la acción que la corrige está a un clic

###### Error — incoherencia de severidad alta

**Dado** que la incoherencia es de severidad alta,
**cuando** intento publicar ese perfil,
**Entonces** el panel lo impide hasta que se resuelva
**Y** me dice cuál es la contradicción

###### Edge case — incoherencia de severidad media

**Dado** que la incoherencia es de severidad media,
**cuando** publico,
**Entonces** el panel me advierte sin bloquear
**Y** la advertencia queda visible en la fila hasta que se resuelva

###### Edge case — disponibilidad vencida y sin tocar

**Dado** que la fecha de disponibilidad ya pasó y el perfil lleva más de 30 días sin actualizarse,
**cuando** el cliente lo ve en el portal,
**Entonces** aparece como «Disponibilidad por confirmar» y no como disponible ahora
**Y** el perfil aparece en mi bandeja de vigencia

##### Notas

Cubre **RF-8.14.3** y **RF-8.14.4**.

**La regla del último edge case es la que protege la credibilidad.** Afirmar disponibilidad con base en un dato que nadie sostiene es, según el PRD, «la forma más silenciosa de perder credibilidad con una cuenta activa». Por eso una fecha vencida no produce «Inmediato» (RF-3.13.3): produce «Por confirmar».

**La severidad separa lo que bloquea de lo que advierte.** Es una distinción de producto, no un parámetro administrable: queda fuera de los catálogos de RF-8.16.1.

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · RF-3.13.3 · relacionada con HU-132 y HU-136

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ sostiene la credibilidad del inventario publicado |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

#### HU-135 — Archivar un perfil sin perder su rastro

**Como** administradora de inventario de Talento Humano,
**quiero** que retirar un perfil del banco lo archive en vez de borrarlo,
**para** que una solicitud de hace tres meses siga explicándose con los perfiles que realmente se mostraron.

##### Criterios de aceptación

###### Happy path — archivar en lugar de borrar

**Dado** que un profesional salió del banco,
**cuando** uso la acción de eliminar,
**Entonces** el perfil pasa a estado *archivado* y no se borra
**Y** deja de mostrarse en el portal
**Y** sigue disponible para explicar solicitudes pasadas

###### Error — no existe el borrado físico

**Dado** que quiero eliminar definitivamente un perfil,
**cuando** busco esa acción,
**Entonces** no existe en el panel
**Y** el panel explica que archivar conserva la trazabilidad de lo que se mostró

###### Edge case — perfil archivado que estaba en una selección curada

**Dado** que un perfil archivado forma parte de un enlace curado ya emitido,
**cuando** el cliente abre ese enlace,
**Entonces** el portal muestra su estado real —fuera del banco— y no lo omite en silencio
**Y** los demás perfiles de la selección se ven con normalidad

##### Notas

Cubre **RF-8.3**. El edge case se apoya en **RF-19.2** (reevaluación al abrir, HU-122).

**El borrado físico no existe a propósito.** Una solicitud enviada en julio tiene que poder explicarse en octubre con los perfiles que el cliente vio. Borrar un perfil destruye esa explicación y con ella la capacidad de responder cuando una cuenta dice «ustedes me mostraron a Fulano».

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · relacionada con HU-122

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ conserva la trazabilidad de lo mostrado |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

#### HU-136 — Revisar la bandeja de vigencia

**Como** administradora de inventario de Talento Humano,
**quiero** una bandeja con los perfiles que llevan más de 30 días sin actualizarse,
**para** que mantener el banco vivo sea una lista de trabajo y no un acto de memoria.

##### Criterios de aceptación

###### Happy path — bandeja con trabajo concreto

**Dado** que hay perfiles publicados sin actualización en más de 30 días,
**cuando** abro la bandeja de vigencia,
**Entonces** los veo marcados para revisión, ordenados por antigüedad del último cambio
**Y** desde ahí puedo actualizar la disponibilidad sin abrir cada ficha

###### Error — bandeja vacía

**Dado** que ningún perfil lleva más de 30 días sin tocarse,
**cuando** abro la bandeja,
**Entonces** el panel lo declara explícitamente
**Y** no muestra una lista vacía sin explicación

###### Edge case — perfil vencido que ya se muestra como «por confirmar»

**Dado** que un perfil vencido ya aparece en el portal como «Disponibilidad por confirmar»,
**cuando** lo veo en la bandeja,
**Entonces** el panel me indica que el cliente ya está viendo esa advertencia
**Y** eso lo pone al principio de la lista

##### Notas

Cubre **RF-8.8** y se conecta con **RF-8.14.4**.

**La bandeja es el instrumento de O5.** El objetivo pide 90% de perfiles publicados con disponibilidad actualizada en los últimos 30 días; la bandeja es exactamente la lista de los que lo incumplen. Sin ella, el objetivo se mide pero no se gestiona.

**El edge case ordena por daño, no por antigüedad.** Un perfil que ya está mostrando «por confirmar» a los clientes cuesta credibilidad ahora; uno que lleva 31 días pero con fecha futura vigente, todavía no.

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · O5 · relacionada con HU-132 y HU-134

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ los 30 días vienen del PRD, el orden de la lista es negociable |
| V | Valiosa | ✓ convierte O5 en trabajo accionable |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

#### HU-137 — Ver los perfiles colocados y sus vencimientos

**Como** administradora de inventario de Talento Humano,
**quiero** una pestaña con los perfiles colocados, su cuenta y cuándo vence cada asignación,
**para** saber qué inventario vuelve a estar libre antes de que el cliente me lo pregunte.

##### Criterios de aceptación

###### Happy path — colocados ordenados por vencimiento

**Dado** que hay perfiles colocados en cuentas,
**cuando** abro la pestaña,
**Entonces** veo cuenta, fecha de inicio y fecha de vencimiento de cada uno
**Y** están ordenados por proximidad del vencimiento
**Y** los que vencen dentro de 60 días están destacados

###### Error — el dato viene de otro sistema y puede estar desactualizado

**Dado** que la fuente de verdad de las asignaciones vive en el sistema de asignación,
**cuando** abro la pestaña,
**Entonces** veo la fecha de corte del último sincronizado, declarada
**Y** no puedo editar desde aquí, porque es espejo de solo lectura

###### Edge case — un colocado sigue publicado

**Dado** que un perfil está colocado hasta cierta fecha,
**cuando** lo veo en el inventario,
**Entonces** sigue en estado *publicado* con su disponibilidad en la fecha de fin de la asignación
**Y** el cliente lo ve en el portal con su banda de arranque, no oculto

##### Notas

Cubre **RF-8.13**, **RF-8.13.1** y **RF-8.13.2**.

**Declarar que es espejo no es un detalle técnico.** RF-8.13.1 lo dice sin rodeos: duplicar una fuente de verdad sin declararlo es cómo un dato desactualizado termina sosteniendo una decisión. Por eso la fecha de corte es criterio de aceptación y no una nota al pie.

**Un colocado no se oculta.** Es la corrección que trajo el PRD v3.4 a RF-8.13.2: con un banco de decenas, ocultar cuatro perfiles vendibles es caro, y «arranca en un mes» es información útil para quien planea el trimestre siguiente.

**Esta pestaña es el disparador de la renovación anticipada** (V2-2): convierte un dato administrativo en una lista de conversaciones comerciales con fecha.

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · RF-3.13 · disparador de V2-2

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de la integración con el sistema de asignación |
| N | Negociable | ✓ |
| V | Valiosa | ✓ anticipa inventario que vuelve y abre conversaciones de renovación |
| E | Estimable | por confirmar con Tecnología — depende del sistema de asignación |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

#### HU-138 — Consultar quién cambió qué y cuándo

**Como** administradora de inventario de Talento Humano,
**quiero** consultar el registro de cambios de un perfil,
**para** poder responder con evidencia cuando alguien pregunte por qué una ficha dice lo que dice.

##### Criterios de aceptación

###### Happy path — registro por perfil

**Dado** que un perfil tuvo cambios,
**cuando** abro su registro de auditoría,
**Entonces** veo qué campo cambió, su valor anterior y el nuevo, quién lo hizo y cuándo
**Y** los cambios de consentimiento y de estado aparecen igual que los de contenido

###### Error — cambio sin autor identificable

**Dado** que un cambio entró por importación masiva o por sincronización,
**cuando** lo veo en el registro,
**Entonces** aparece atribuido al proceso y a quien lo disparó
**Y** nunca queda un cambio sin autor

###### Edge case — perfil archivado

**Dado** que un perfil está archivado,
**cuando** consulto su registro,
**Entonces** sigo viendo su historia completa
**Y** puedo explicar qué se mostró al cliente en una solicitud pasada

##### Notas

Cubre **RF-8.9**.

**Esta historia no existe sin HU-123.** RF-8.1.3 lo declara: el «quién» del registro solo existe si hay identidad. Construir auditoría sobre un panel sin autenticación produce un registro que no responde la única pregunta que importa.

**El caso de uso real es defensivo.** Cuando una cuenta diga «ustedes me mostraron a Fulano con experiencia en banca», alguien tiene que poder verificarlo. Es la misma razón por la que los perfiles se archivan y no se borran (HU-135) y por la que cada enlace curado lleva registro (HU-122).

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · depende de HU-123 · relacionada con HU-135

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-123 — sin identidad no hay autor |
| N | Negociable | ✓ |
| V | Valiosa | ✓ sostiene la capacidad de responder ante una cuenta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

#### HU-139 — Administrar el léxico de búsqueda

**Como** administradora de inventario de Talento Humano,
**quiero** administrar desde el panel los términos que usan los clientes y su equivalencia en rol, tecnología o sector,
**para** que la búsqueda entienda cómo habla cada cliente sin depender de que alguien toque el código.

##### Criterios de aceptación

###### Happy path — término del cliente con su equivalencia

**Dado** que los clientes escriben un término que el banco nombra de otro modo,
**cuando** lo registro con su equivalencia en rol, tecnología o sector,
**Entonces** las búsquedas siguientes lo reconocen
**Y** el cambio no exige despliegue

###### Error — equivalencia a un valor que no existe en el catálogo

**Dado** que intento equiparar un término a un valor inexistente,
**cuando** guardo,
**Entonces** el panel lo rechaza y me ofrece los valores del catálogo
**Y** el léxico no puede apuntar al vacío

###### Edge case — consultas sin coincidencia como candidatas

**Dado** que hubo búsquedas sin resultados en el período,
**cuando** abro el léxico,
**Entonces** esas consultas se me ofrecen como candidatas a incorporar
**Y** puedo mandarlas al léxico o a la agenda de reclutamiento

##### Notas

Cubre **RF-8.12**.

**La razón de que sea administrable está en el propio requisito:** si el léxico vive en el código, en seis meses está desactualizado. La búsqueda semántica del cliente degrada al léxico cuando el servicio de interpretación falla (HU-072), así que un léxico pobre no es un lujo perdido: es la red de seguridad de la entrada por instrucción.

**El edge case conecta con el registro de demanda.** Una consulta sin coincidencia puede significar dos cosas distintas —que no sabemos cómo lo llaman, o que no tenemos el perfil— y la decisión de a cuál de las dos pertenece la toma una persona, no el sistema. Por eso las dos salidas están en el mismo lugar.

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · relacionada con HU-072 y HU-078

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ sostiene la búsqueda sin intervención de Tecnología |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

#### HU-140 — Obtener un borrador de los campos desde el artefacto

**Como** administradora de inventario de Talento Humano,
**quiero** que el sistema me proponga los campos descriptivos a partir del artefacto que ya adjunté,
**para** no transcribir a mano la evidencia de cada perfil del banco.

##### Criterios de aceptación

###### Happy path — borrador propuesto para revisión

**Dado** que un perfil tiene artefacto adjunto,
**cuando** pido el borrador,
**Entonces** el sistema me propone los campos descriptivos de la validación
**Y** el borrador queda para mi revisión y nunca se publica solo

###### Error — artefacto del que no se puede derivar nada

**Dado** que el artefacto es ilegible, está vacío o no contiene una validación,
**cuando** el sistema lo procesa,
**Entonces** me lo dice sin borrar el adjunto
**Y** puedo redactar los campos a mano

###### Edge case — el borrador afirma algo que el artefacto no sostiene

**Dado** que reviso un borrador propuesto,
**cuando** encuentro una afirmación que no está en el artefacto,
**Entonces** puedo corregirla o descartar el borrador completo
**Y** nada llega a la ficha sin haber pasado por mi revisión

##### Notas

Cubre la segunda mitad de **RF-8.11** y **B.9.3** (carga asistida desde el artefacto).

**Por qué es historia aparte desde el 2026-09-22.** La HU-131 original juntaba adjuntar y derivar en una sola historia de complejidad L con valor medio: el peor cuadrante del backlog. Guardar un archivo y derivar campos descriptivos de un documento son trabajos de orden distinto. Dividirlas deja la mitad útil (HU-131) construible por una fracción del costo, y aísla la cara en una historia que se puede posponer sin perder nada.

**El borrador se revisa, siempre.** Es la misma restricción que **RF-16.1** impone al modelo del cliente: el sistema no afirma cosas sobre una persona real por la que Trycore responde contractualmente. Aquí el filtro es humano y explícito, y por eso el edge case es el que más importa de los tres.

**Candidata a v2.** En el mapa de historias v1.0 esta capacidad ya vivía en v2 como «obtener un borrador asistido desde el artefacto». El juicio se sostiene: es la parte cara y la que menos duele posponer.

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · Anexo B.9.3 · RF-16.1 como criterio · depende de HU-131

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-131 — sin artefacto no hay de qué derivar |
| N | Negociable | ✓ |
| V | Valiosa | ✓ ahorra transcripción manual por perfil |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✗ **L** — es la parte cara y se acepta como tal, aislada a propósito |
| T | Testeable | ✓ |

#### HU-141 — Confirmar la importación sabiendo qué campos toca

**Como** administradora del banco de talento,
**quiero** declarar si la importación crea, actualiza o ambas, y que solo toque los campos que traje,
**para** que un código mal escrito no cree perfiles fantasma ni una celda vacía borre un dato que no quería perder.

##### Criterios de aceptación

###### Happy path — el código manda

**Dado** que una fila trae un código que ya existe y otra un código que no,
**cuando** confirmo en modo crear y actualizar,
**Entonces** la primera actualiza el perfil existente
**Y** la segunda crea un perfil nuevo **en borrador**

###### Error — el archivo intenta conceder consentimiento o publicar

**Dado** que alguna fila trae el consentimiento en verdadero o el estado en publicado,
**cuando** la proceso,
**Entonces** esos campos se rechazan y se avisa en la tarjeta
**Y** el resto de la fila se importa con normalidad
**Y** ningún perfil queda publicado por efecto de la importación

###### Edge case — campo ausente frente a campo que quiero borrar

**Dado** que mi hoja tiene celdas vacías en columnas que no quiero cambiar,
**cuando** confirmo,
**Entonces** esos campos quedan intactos
**Y** solo se vacían los que marqué explícitamente con un nulo

###### Edge case — modo solo actualizar con un código inexistente

**Dado** que elegí modo solo actualizar y una fila trae un código que no existe,
**cuando** confirmo,
**Entonces** esa fila se omite en lugar de crear un perfil
**Y** queda contada entre las omitidas con su motivo

##### Notas

**Dividida de HU-086 el 2026-09-22.** Confirmar es el momento en que el banco cambia, y merece sus propios criterios de aceptación: los dos controles que evitan el daño clásico viven aquí, no en la vista previa.

**El control que evita el daño más común:** el modo de importación explícito. Sin él, un archivo destinado a actualizar disponibilidad crea perfiles fantasma por un código mal escrito.

**La regla que evita el bug clásico:** campo ausente y celda vacía no tocan nada; solo un nulo explícito vacía un campo. Sin esa distinción nadie puede vaciar un campo a propósito ni evitar vaciarlo por accidente.

**La prohibición de publicar no es administrable.** RF-8.16.1 la deja fuera de los catálogos paramétricos: si el consentimiento se pudiera otorgar pegando un archivo, el bloqueo de RF-8.4 se saltaría con un pegado.

Cubre **RF-8.15.2**, **RF-8.15.3**, **RF-8.15.4** y **RF-8.15.7**.

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · depende de HU-086 · habilita HU-087 y HU-142

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-086 — sin vista previa no hay qué confirmar |
| N | Negociable | ✓ |
| V | Valiosa | ✓ es donde el banco cambia, y donde están las garantías |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ tras la división |
| T | Testeable | ✓ |

#### HU-142 — Corregir solo las filas que fallaron

**Como** administradora del banco de talento,
**quiero** descargar únicamente las filas con error, con su motivo y en el formato en que las mandé,
**para** corregir tres filas sin tener que reprocesar las cincuenta y siete que ya estaban bien.

##### Criterios de aceptación

###### Happy path — descargar solo lo que falló

**Dado** que tres de sesenta filas tienen error,
**cuando** estoy en el resultado de la importación,
**Entonces** puedo descargar solo esas tres con su motivo, en el formato en que llegaron
**Y** las cincuenta y siete buenas quedaron aplicadas

###### Error — el archivo completo falló

**Dado** que ninguna fila pudo procesarse,
**cuando** descargo el archivo de errores,
**Entonces** recibo todas las filas con su motivo
**Y** el panel me dice si el problema fue del archivo entero y no de las filas

###### Edge case — reimportar las corregidas

**Dado** que corregí las tres filas y las vuelvo a pegar,
**cuando** confirmo,
**Entonces** actualizan los perfiles que corresponden por código
**Y** no se duplica nada de lo que ya había entrado en la primera importación

##### Notas

**Dividida de HU-086 el 2026-09-22.** Es el ciclo de corrección, que tiene valor por sí solo: sin él, tres filas malas obligan a rehacer el archivo entero.

**El edge case es el que hace segura la función.** Reimportar solo lo corregido depende de que el código siga siendo la llave de identidad (RF-8.15.2) y de que la importación sea idempotente. Sin eso, corregir produciría duplicados y la función haría más daño que bien.

Cubre **RF-8.15.10**.

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · depende de HU-141

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-141 |
| N | Negociable | ✓ |
| V | Valiosa | ✓ evita rehacer archivos completos por errores puntuales |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

#### HU-143 — Retirar y fusionar valores sin romper los perfiles que los usan

**Como** administradora del banco de talento,
**quiero** sacar de circulación un valor obsoleto y unir los duplicados que ya entraron,
**para** limpiar la taxonomía sin dejar fichas sin el dato que explicaba cómo se validó un perfil.

##### Criterios de aceptación

###### Happy path — desactivar un valor en uso

**Dado** que una tecnología la usan varios perfiles y ya no queremos ofrecerla,
**cuando** la desactivo,
**Entonces** deja de poder elegirse en perfiles nuevos
**Y** los perfiles que ya la tienen la conservan
**Y** no existe ninguna opción de borrarla

###### Happy path — fusionar duplicados que ya entraron

**Dado** que el catálogo tiene «Figma» y «Fgima» y ambos están en uso,
**cuando** los fusiono,
**Entonces** todos los perfiles que usaban el duplicado pasan al valor destino
**Y** veo cuántos perfiles se van a ver afectados antes de confirmar
**Y** el duplicado desaparece del catálogo

###### Error — fusionar dos valores que no son el mismo

**Dado** que selecciono dos valores que representan cosas distintas,
**cuando** voy a fusionarlos,
**Entonces** el panel me muestra el impacto en perfiles antes de nada
**Y** la fusión es reversible mientras no la confirme

###### Edge case — desactivar una modalidad que sostiene fichas publicadas

**Dado** que una modalidad de prueba aparece en las fichas de varios perfiles publicados,
**cuando** la desactivo,
**Entonces** esas fichas conservan su texto
**Y** el panel me advierte cuántas dependen de ella

##### Notas

**Dividida de HU-089 el 2026-09-22.** Crear valores y limpiar la taxonomía son momentos distintos: el primero ocurre cada semana al editar perfiles, el segundo cada varios meses cuando alguien nota el desorden.

**No existe la acción de borrar, y es a propósito** (RF-8.16.5). Borrar una modalidad que cinco perfiles referencian dejaría sus fichas sin el texto que explica cómo se validaron. Desactivar impide elegirla en adelante y conserva lo publicado.

**La fusión es la única forma de deshacer un error de tecleo.** Sin ella, cualquier duplicado que haya entrado es permanente, y el filtro del cliente queda partido en dos para siempre.

Cubre **RF-8.16.5** y **RF-8.16.6**.

##### Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · depende de HU-089

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-089 — sin catálogo no hay qué limpiar |
| N | Negociable | ✓ |
| V | Valiosa | ✓ es la única forma de revertir un error de tecleo en la taxonomía |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

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

### Historias de esta épica (6)

#### HU-102 — Recibir la oportunidad en mi pipeline

**Como** ejecutivo comercial dueño de una cuenta,
**quiero** que cada solicitud del portal llegue como un negocio en el pipeline de la línea,
**para** trabajarla donde trabajo todo lo demás y no en una bandeja aparte.

##### Criterios de aceptación

###### Happy path

**Dado** que un cliente envía una solicitud,
**cuando** se procesa,
**Entonces** se crea un negocio en el pipeline de People Service, en su etapa de entrada
**Y** queda asociado al contacto y a la empresa existentes
**Y** trae la especificación completa como propiedades, no como texto libre

###### Error — la cuenta ya tiene un negocio abierto

**Dado** que existe un negocio vigente para esa empresa,
**cuando** llega la solicitud,
**Entonces** se crea uno nuevo y se asocia como relacionado
**Y** no se actualiza el existente, porque eso borraría la atribución de origen

###### Edge case — etapa de entrada y pronóstico

**Dado** que el negocio entra al pipeline,
**cuando** se calcula el pronóstico,
**Entonces** la etapa de entrada queda excluida del pronóstico
**Y** una solicitud no infla el forecast antes de estar calificada

##### Notas

Cubre RF-9.1 y RF-9.2. D-6 y D-7 cerradas.

##### Trazabilidad

Épica madre: **EP-007** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-103 — Enterarme de una solicitud sin tener que vigilar el pipeline

**Como** ejecutivo comercial con varias cuentas a cargo,
**quiero** que me avisen por mi canal de trabajo diario cuando llega una solicitud, con lo necesario para decidir,
**para** no descubrir tres días después que un cliente pidió algo.

##### Criterios de aceptación

###### Happy path

**Dado** que llega una solicitud de mi cuenta,
**cuando** se procesa,
**Entonces** recibo la notificación en el canal de trabajo del equipo, no solo por correo
**Y** trae cuenta, quién solicita, qué pidió, cuándo lo necesita y el enlace al negocio
**Y** puedo decidir sin abrir el CRM

###### Error — nadie abre el negocio

**Dado** que pasan 4 horas hábiles sin que nadie lo abra,
**cuando** se evalúa,
**Entonces** la notificación se reenvía a la dirección comercial

###### Edge case — sigue sin moverse

**Dado** que pasan 24 horas hábiles sin cambio de etapa,
**cuando** se evalúa,
**Entonces** se escala a Dirección General
**Y** el tiempo entre notificación y primera apertura queda registrado

##### Notas

Cubre RF-9.7. **Con pipeline propio, esta notificación es el único mecanismo que evita que una solicitud exista y nadie la vea.** Un punto único de falla sin escalamiento no es un mecanismo, es una esperanza.

##### Trazabilidad

Épica madre: **EP-007** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-104 — Que no se me duplique la empresa en el CRM

**Como** administrador del CRM,
**quiero** que una solicitud de alguien nuevo dentro de una empresa conocida no cree una empresa repetida,
**para** no tener que fusionar registros a mano cada mes.

##### Criterios de aceptación

###### Happy path

**Dado** que el contacto ya existe,
**cuando** llega la solicitud,
**Entonces** se asocia al contacto y a la empresa existentes
**Y** no se crea ningún registro nuevo de empresa

###### Error — contacto nuevo en empresa conocida

**Dado** que quien solicita no está en el CRM,
**cuando** llega la solicitud,
**Entonces** se crea el contacto
**Y** se asocia a la empresa existente

###### Edge case — dominio de correo distinto

**Dado** que el correo tiene un dominio que no coincide con el de la empresa,
**cuando** llega la solicitud,
**Entonces** se usa la cuenta del enlace para resolver la empresa, no el dominio del correo
**Y** el contacto queda marcado para revisión

##### Notas

Cubre RF-9.2. El último escenario importa porque un invitado del enlace puede tener otro dominio, por ejemplo un consultor externo de la cuenta.

##### Trazabilidad

Épica madre: **EP-007** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-105 — Recuperar una solicitud cuya integración falló

**Como** responsable de la operación del portal,
**quiero** que ninguna solicitud se pierda cuando el CRM no responde,
**para** no perder una oportunidad por un fallo técnico que el cliente nunca va a ver.

##### Criterios de aceptación

###### Happy path

**Dado** que la creación del negocio falla,
**cuando** se procesa el envío,
**Entonces** la solicitud entra en cola de reintento
**Y** el cliente recibe su confirmación igual
**Y** se alerta al responsable

###### Error — el reintento también falla

**Dado** que los reintentos se agotan,
**cuando** se evalúa,
**Entonces** la solicitud queda en una bandeja de fallos con todos sus datos
**Y** alguien nominal es notificado

###### Edge case — el negocio se creó pero la respuesta se perdió

**Dado** que el CRM creó el registro y no confirmó,
**cuando** se reintenta,
**Entonces** no se crea un negocio duplicado
**Y** el reintento reconoce el que ya existe

##### Notas

Cubre RF-9.6. El último escenario es el error clásico de las colas de reintento y hay que cerrarlo desde el diseño.

##### Trazabilidad

Épica madre: **EP-007** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-106 — Distinguir lo que entra por el portal de lo que entra por gestión

**Como** responsable de medir el rendimiento de la línea,
**quiero** saber qué negocios se originaron en el portal,
**para** poder comparar el portal contra los demás orígenes en lugar de suponer que funciona.

##### Criterios de aceptación

###### Happy path

**Dado** que se crea un negocio desde el portal,
**cuando** reviso el CRM,
**Entonces** el negocio lleva una propiedad de origen marcada como portal
**Y** puedo filtrar y comparar por origen

###### Error — origen sin definir

**Dado** que un negocio de la línea se crea a mano sin origen,
**cuando** reviso el informe,
**Entonces** aparece como origen no especificado y no se suma al portal
**Y** el informe no atribuye al portal lo que no es suyo

###### Edge case — solicitud dirigida desde el camino del cero

**Dado** que la solicitud nace de una búsqueda sin resultados,
**cuando** se crea el negocio,
**Entonces** el origen distingue entre solicitud de perfiles existentes y solicitud de perfil a medida

##### Notas

Cubre RF-9.1.1. Sin esta propiedad, el pipeline propio impide comparar el portal con los demás orígenes, que es el KPI de §11.

##### Trazabilidad

Épica madre: **EP-007** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-107 — Registrar cuándo se agendó la alineación

**Como** responsable de medir el arranque comercial,
**quiero** que quede la fecha en que se agendó la sesión de alineación de cada solicitud,
**para** saber cuántas solicitudes mueren entre que llegan y que alguien se sienta con el cliente.

##### Criterios de aceptación

###### Happy path

**Dado** que se agenda la sesión,
**cuando** se registra,
**Entonces** la fecha queda en una propiedad del negocio
**Y** el informe puede calcular los días entre solicitud y sesión

###### Error — se agenda por fuera del portal

**Dado** que el comercial agenda por teléfono,
**cuando** se procesa,
**Entonces** igual debe escribir la fecha en el negocio
**Y** sin ese dato el indicador no existe

###### Edge case — se reagenda

**Dado** que la sesión se mueve de fecha,
**cuando** se actualiza,
**Entonces** se conserva la fecha del primer agendamiento
**Y** el indicador mide el tiempo hasta el compromiso, no hasta la reunión efectiva

##### Notas

Cubre RF-9.1.3 y RF-17.4. **Sin esta historia, O3 no se puede medir.** Al usar las etapas del pipeline comercial (D-21), la alineación no tiene etapa propia y esta propiedad es el único registro del tramo.

##### Trazabilidad

Épica madre: **EP-007** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

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

### Historias de esta épica (5)

#### HU-108 — Ver el embudo de cada cuenta

**Como** responsable de la línea,
**quiero** ver cuántas cuentas abrieron, exploraron y solicitaron en el período,
**para** saber dónde se cae la gente en lugar de suponerlo.

##### Criterios de aceptación

###### Happy path

**Dado** que hubo actividad en el período,
**cuando** abro el informe,
**Entonces** veo entradas, sesiones con búsqueda, fichas abiertas y solicitudes
**Y** puedo verlo por cuenta y en total

###### Error — período sin actividad

**Dado** que no hubo entradas,
**cuando** abro el informe,
**Entonces** veo un estado vacío que lo dice
**Y** no veo ceros sin explicación

###### Edge case — una cuenta con muchas sesiones

**Dado** que alguien entró veinte veces,
**cuando** reviso,
**Entonces** distingo sesiones de personas distintas
**Y** una cuenta activa no distorsiona el total

##### Notas

Cubre RF-7.1 y O2.

##### Trazabilidad

Épica madre: **EP-008** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-109 — Ver si la curaduría acierta

**Como** responsable de armar el correo de cada cuenta,
**quiero** saber qué proporción de solicitudes incluye al menos un perfil de los que propusimos,
**para** saber si el criterio con que armo la selección sirve o si la gente siempre busca otra cosa.

##### Criterios de aceptación

###### Happy path

**Dado** que hubo solicitudes en el período,
**cuando** abro el informe,
**Entonces** veo qué porcentaje incluyó al menos un perfil de la selección enviada
**Y** veo el dato por cuenta

###### Error — solicitudes sin selección previa

**Dado** que algunas vienen de enlaces sin curaduría,
**cuando** reviso,
**Entonces** esas quedan excluidas del cálculo
**Y** no se cuentan como fallo de curaduría

###### Edge case — el cliente amplió y eligió otra cosa

**Dado** que solicitó solo perfiles del descubrimiento,
**cuando** reviso,
**Entonces** se registra como curaduría fallida
**Y** veo qué buscó, para corregir la próxima selección

##### Notas

Cubre RF-7.4. Es el indicador más útil del proyecto para Mercadeo: mide el criterio con que se arma el correo, no el portal.

##### Trazabilidad

Épica madre: **EP-008** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-110 — Ver qué filtros usan realmente los clientes

**Como** responsable de producto del portal,
**quiero** ver qué facetas y qué valores usan los clientes al refinar,
**para** retirar los filtros que nadie toca y saber si las facetas siguen siendo refinamiento o volvieron a ser la entrada.

##### Criterios de aceptación

###### Happy path — uso por faceta y por valor

**Dado** que hubo sesiones con filtros aplicados en el período,
**cuando** abro el informe,
**Entonces** veo cada faceta con cuántas sesiones la usaron y qué valores eligieron
**Y** veo cuáles facetas no se usaron ni una vez

###### Error — período sin uso de filtros

**Dado** que ninguna sesión aplicó filtros,
**cuando** abro el informe,
**Entonces** veo un estado vacío explícito
**Y** el informe no presenta ceros como si fueran un hallazgo

###### Edge case — filtros aplicados después de una instrucción

**Dado** que la sesión escribió una instrucción y luego filtró,
**cuando** reviso el informe,
**Entonces** ese uso aparece separado del de las sesiones que solo filtraron
**Y** puedo leer si la subordinación de las facetas se sostiene

##### Notas

Cubre la **primera mitad de RF-7.2** — *reporte de filtros más usados*—, que hasta el 2026-09-22 no tenía historia. La segunda mitad —búsquedas sin resultados— la cubre **HU-078** en EP-010, que es donde vive el registro de demanda con su dueño y cadencia (D-13).

**Esta historia reemplaza a la HU-110 anterior**, que duplicaba a HU-078: mismo actor, mismo *quiero*, mismo propósito y el mismo escenario de error. Se había escrito en el cierre de huecos del PRD 4.0 sin ver que HU-078 existía desde el PRD 2.8.

**El edge case es el que le da valor real.** RF-14.2 subordinó las facetas a la instrucción, y §14.7 fija la prueba que puede tumbar esa decisión. Saber **qué** filtros se usan después de instruir es más fino que saber cuántos: si lo que la gente toca es disponibilidad y no rol, la instrucción está acertando en lo importante y fallando en lo operativo, que es una conclusión distinta de «las facetas ganaron».

**Se distingue de HU-111**, que compara las dos rutas de entrada a nivel de conversión. Esta mira dentro de una de ellas.

##### Trazabilidad

Épica madre: **EP-008** · PRD v4.8 · RF-7.2 (primera mitad) · relacionada con HU-078 y HU-111

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ ya no duplica a HU-078 |
| N | Negociable | ✓ describe la lectura, no el formato del informe |
| V | Valiosa | ✓ permite retirar facetas muertas y leer si la Fase 2 se sostiene |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

#### HU-111 — Comparar la ruta de instrucción con la de filtros

**Como** responsable del producto,
**quiero** ver cómo se comporta cada ruta de entrada,
**para** decidir con datos si la maquinaria de búsqueda se gana su lugar.

##### Criterios de aceptación

###### Happy path

**Dado** que hubo sesiones por ambas rutas,
**cuando** abro el informe,
**Entonces** veo tiempo hasta el primer perfil, fichas abiertas y solicitudes por ruta
**Y** veo el uso de filtros después de una instrucción

###### Error — una ruta sin datos suficientes

**Dado** que apenas hubo sesiones por una de ellas,
**cuando** reviso,
**Entonces** el informe lo advierte
**Y** no se presenta una comparación como concluyente cuando no lo es

###### Edge case — la misma sesión usa las dos

**Dado** que alguien escribe una instrucción y luego filtra,
**cuando** se registra,
**Entonces** cuenta como ruta de instrucción con uso posterior de filtros
**Y** que es justamente la prueba de falsación de RF-14.2

##### Notas

Cubre RF-7.1 y la regla de decisión de §14.7. Es la versión con datos reales de lo que las sesiones con clientes solo pueden insinuar con tres personas.

##### Trazabilidad

Épica madre: **EP-008** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-112 — Atribuir cada sesión a su envío de correo

**Como** responsable de la distribución,
**quiero** saber de qué envío vino cada sesión del portal,
**para** poder atribuir resultados al correo y no a la casualidad.

##### Criterios de aceptación

###### Happy path

**Dado** que alguien entra desde un enlace del boletín,
**cuando** se registra la sesión,
**Entonces** queda atribuida a la cuenta, al contacto y al envío de origen

###### Error — entrada sin parámetros

**Dado** que alguien llega por un enlace sin atribución,
**cuando** se registra,
**Entonces** queda como origen directo y no se atribuye a ningún envío

###### Edge case — entra otro invitado del mismo enlace

**Dado** que el enlace lo abre otra persona invitada al mismo enlace,
**cuando** se registra,
**Entonces** se atribuye al mismo envío
**Y** queda registrado el correo invitado con el que entró, distinto del contacto principal

##### Notas

Cubre RF-7.3. Sin esto, el informe de EP-011 no puede existir.

##### Trazabilidad

Épica madre: **EP-008** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

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

### Historias de esta épica (13)

#### HU-065 — Buscar escribiendo lo que necesito en mis propias palabras

**Como** líder de área en una cuenta cliente de People Service, que busca un perfil dos o tres veces al año,
**quiero** escribir en un campo abierto lo que necesito, con mis propias palabras,
**para** encontrar perfiles sin tener que aprender antes cómo nombra Trycore los roles y las tecnologías.

##### Criterios de aceptación

###### Happy path — instrucción reconocida

**Dado** que estoy en el portal con el banco publicado,
**cuando** escribo «necesito un ingeniero de aplicaciones móviles para banca» y envío,
**Entonces** veo los perfiles cuyo rol y tecnologías corresponden a esa instrucción
**Y** veo, antes de los resultados, la lectura que el portal hizo de mi instrucción
**Y** el tiempo entre el envío y el primer resultado visible queda registrado

###### Error — el servicio de interpretación no responde

**Dado** que el servicio de interpretación no está disponible,
**cuando** envío una instrucción,
**Entonces** obtengo resultados igualmente, resueltos con el léxico controlado
**Y** el portal me indica que la lectura fue aproximada
**Y** no veo un error técnico ni una pantalla en blanco

###### Edge case — instrucción sin ningún término reconocible

**Dado** que escribo sobre una especialidad que el banco no maneja,
**cuando** envío «experto en blockchain»,
**Entonces** no veo resultados forzados por coincidencia parcial
**Y** veo el camino del cero de EP-010
**Y** la especificación queda registrada como demanda no cubierta

##### Notas

Cubre RF-2.6, RF-12.3 y RF-16.1. El registro de tiempo del primer criterio es el insumo de la prueba de falsación de RF-13.1.

##### Trazabilidad

Épica madre: **EP-009** · PRD v2.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-066 — Arrancar desde una sugerencia en lugar de un campo vacío

**Como** líder de área que entra al portal sin tener claro cómo formular lo que busca,
**quiero** encontrar la barra precargada con el contexto de mi proyecto y algunas instrucciones sugeridas,
**para** no tener que decidir qué escribir desde cero cuando entro con prisa y poca frecuencia de uso.

##### Criterios de aceptación

###### Happy path — sugerencia enviada sin editar

**Dado** que entro desde el enlace de mi cuenta con un proyecto activo asociado,
**cuando** toco una de las instrucciones sugeridas,
**Entonces** se ejecuta la búsqueda con esa instrucción
**Y** el portal registra que la consulta salió de una sugerencia y que no fue editada

###### Happy path — sugerencia editada

**Dado** que una instrucción sugerida está cargada en la barra,
**cuando** la modifico antes de enviarla,
**Entonces** se ejecuta la búsqueda con mi texto
**Y** el portal registra la consulta como editada por el usuario

###### Edge case — cuenta sin proyecto activo conocido

**Dado** que entro con un enlace sin contexto de proyecto,
**cuando** llego a la pantalla de entrada,
**Entonces** veo sugerencias genéricas por familia de rol y no sugerencias inventadas sobre un proyecto que no conocemos
**Y** la barra no queda vacía

##### Notas

Cubre RF-12.1. La distinción entre sugerencia editada y sin editar es la prueba de falsación: por encima del 60% sin editar, el portal está dictando la demanda en vez de captarla.

##### Trazabilidad

Épica madre: **EP-009** · PRD v2.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-067 — Pegar el requerimiento que ya tengo escrito

**Como** líder de proyecto que ya redactó el requerimiento en un documento interno,
**quiero** pegar ese texto completo y que el portal extraiga los criterios como etiquetas que pueda editar,
**para** aprovechar el trabajo que ya hice en lugar de volver a describir la necesidad.

##### Criterios de aceptación

###### Happy path — extracción de criterios

**Dado** que tengo un requerimiento de cargo en el portapapeles,
**cuando** lo pego en la barra y envío,
**Entonces** veo los criterios extraídos como etiquetas editables
**Y** puedo eliminar cualquier etiqueta antes de buscar
**Y** los resultados responden a las etiquetas que dejé

###### Error — texto sin criterios reconocibles

**Dado** que pego un texto que no describe un perfil,
**cuando** envío,
**Entonces** el portal me dice que no encontró criterios y conserva mi texto
**Y** puedo editarlo o escribir una instrucción corta en su lugar

###### Edge case — exceso de criterios extraídos

**Dado** que el requerimiento contiene condiciones contractuales e historia del proyecto,
**cuando** el portal extrae los criterios,
**Entonces** se muestran solo los criterios más relevantes, no todos los detectados
**Y** el resto queda accesible bajo «ver todos» sin ocupar la pantalla

##### Notas

Cubre RF-12.2.

**Condicionada a la prueba previa de RF-12.2**: pegar cinco requerimientos reales de clientes actuales y contar cuántos chips sobran. Si sobran más de los que sirven, la historia no se construye.

##### Trazabilidad

Épica madre: **EP-009** · PRD v2.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-068 — Ver cómo el portal entendió lo que pedí

**Como** líder de área que acaba de escribir una instrucción,
**quiero** ver la lectura que el portal hizo de mi instrucción antes de mirar los resultados,
**para** saber si los resultados son raros porque el banco no tiene lo que busco o porque me entendieron mal.

##### Criterios de aceptación

###### Happy path — interpretación visible

**Dado** que envié una instrucción reconocida,
**cuando** se muestran los resultados,
**Entonces** veo el rol, las tecnologías, el sector y el seniority que el portal entendió
**Y** cada elemento entendido se muestra como una etiqueta identificable

###### Edge case — interpretación de baja confianza

**Dado** que mi instrucción es ambigua,
**cuando** el portal la interpreta con confianza baja,
**Entonces** la lectura se muestra de forma destacada y no compacta
**Y** se me invita explícitamente a corregirla

###### Edge case — interpretación evidente

**Dado** que escribí una instrucción inequívoca como «desarrollador Java senior»,
**cuando** se muestran los resultados,
**Entonces** la lectura se muestra en forma compacta para no agregar un paso de ruido

##### Notas

Cubre RF-12.3. La variación por nivel de confianza es la resolución del argumento en contra registrado en el PRD.

##### Trazabilidad

Épica madre: **EP-009** · PRD v2.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-069 — Corregir la interpretación sin volver a escribir

**Como** líder de área que ve que el portal entendió mal un criterio,
**quiero** quitar o cambiar un criterio interpretado directamente sobre la lectura,
**para** ajustar la búsqueda sin reformular toda la frase desde cero.

##### Criterios de aceptación

###### Happy path — quitar un criterio mal interpretado

**Dado** que la lectura incluye un sector que yo no pedí,
**cuando** toco la equis de esa etiqueta,
**Entonces** los resultados se recalculan sin ese criterio
**Y** la etiqueta desaparece de la lectura
**Y** el Perfil Objetivo se actualiza en consecuencia

###### Error — se quitan todos los criterios

**Dado** que la lectura tiene un solo criterio,
**cuando** lo elimino,
**Entonces** vuelvo al estado sin búsqueda con el banco completo a la vista
**Y** no veo una pantalla vacía

###### Edge case — corrección que deja cero resultados

**Dado** que agrego una restricción que ningún perfil cumple,
**cuando** se recalculan los resultados,
**Entonces** veo el camino del cero con mi Perfil Objetivo actualizado
**Y** puedo deshacer la última corrección en un toque

##### Notas

Cubre RF-12.3 y RF-13.3.

##### Trazabilidad

Épica madre: **EP-009** · PRD v2.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-070 — Revisar y ajustar la especificación de lo que necesito

**Como** líder de proyecto que va a pedir un equipo,
**quiero** ver y editar de forma continua una especificación de lo que busco: familia de rol, capacidades, seniority, condiciones y contexto del proyecto,
**para** que la solicitud que llegue a Trycore describa mi necesidad y no solo los perfiles que alcancé a ver.

##### Criterios de aceptación

###### Happy path — edición continua

**Dado** que hay un Perfil Objetivo generado a partir de mi instrucción,
**cuando** edito cualquiera de sus campos,
**Entonces** los resultados se recalculan sin que yo confirme en un paso aparte
**Y** el cambio queda reflejado de inmediato en la especificación

###### Happy path — la especificación viaja con la solicitud

**Dado** que tengo un Perfil Objetivo y un equipo armado,
**cuando** envío la solicitud,
**Entonces** la especificación completa acompaña a la solicitud
**Y** Talento Humano recibe lo que pedí y no solo a quién seleccioné

###### Error — especificación incompleta al solicitar

**Dado** que el Perfil Objetivo no tiene seniority ni condiciones de trabajo,
**cuando** intento enviar la solicitud,
**Entonces** el portal señala qué falta antes de enviar
**Y** puedo enviar de todos modos si lo decido, y esa omisión queda registrada

###### Edge case — el usuario nunca abre el Perfil Objetivo

**Dado** que armé mi equipo directamente desde los resultados,
**cuando** envío la solicitud,
**Entonces** la especificación inferida de mi instrucción viaja igual
**Y** queda marcada como no revisada por el cliente

##### Notas

Cubre RF-13.1 y RF-13.3. El último escenario alimenta la prueba de calidad de las primeras veinte requisiciones.

##### Trazabilidad

Épica madre: **EP-009** · PRD v2.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-071 — Responder una pregunta de afinamiento sin perder lo que ya veo

**Como** líder de área que está revisando resultados,
**quiero** responder a lo sumo dos preguntas cortas con opciones tocables mientras los resultados siguen en pantalla,
**para** afinar la búsqueda sin que el portal me detenga antes de mostrarme algo.

##### Criterios de aceptación

###### Happy path — pregunta en paralelo

**Dado** que envié una instrucción y ya veo resultados,
**cuando** el portal muestra una pregunta de afinamiento,
**Entonces** la pregunta aparece junto a los resultados y nunca sobre ellos
**Y** puedo ignorarla y seguir navegando
**Y** al responderla los resultados se reordenan

###### Error — más preguntas de las permitidas

**Dado** que la interpretación dejó varias ambigüedades,
**cuando** se generan las preguntas,
**Entonces** se muestran como máximo dos a la vez
**Y** las demás esperan a que resuelva las primeras

###### Edge case — resultados instantáneos

**Dado** que la búsqueda devolvió resultados completos de inmediato,
**cuando** aparece la pregunta de afinamiento,
**Entonces** la pregunta se presenta como refinamiento opcional y no como paso pendiente
**Y** no bloquea ninguna acción

##### Notas

Cubre RF-13.2. Corrige la regla previa de «nunca preguntar antes de mostrar un resultado».

##### Trazabilidad

Épica madre: **EP-009** · PRD v2.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-072 — Seguir usando el portal cuando la interpretación falla

**Como** líder de área que entró a buscar un perfil con urgencia,
**quiero** obtener resultados aunque el servicio de interpretación no esté disponible,
**para** no quedarme sin poder usar el portal justo el día que lo necesito.

##### Criterios de aceptación

###### Happy path — degradación silenciosa

**Dado** que el servicio de interpretación no responde,
**cuando** envío una instrucción,
**Entonces** obtengo resultados resueltos con el léxico controlado
**Y** el portal indica que la lectura fue aproximada, sin lenguaje técnico

###### Error — el léxico tampoco reconoce nada

**Dado** que el servicio falló y mi instrucción no tiene términos del léxico,
**cuando** envío,
**Entonces** veo el camino del cero con la opción de solicitar el perfil a medida
**Y** la consulta queda registrada como demanda

###### Edge case — el servicio se restablece a mitad de sesión

**Dado** que estuve buscando en modo degradado,
**cuando** el servicio vuelve a estar disponible,
**Entonces** la siguiente búsqueda usa la interpretación completa
**Y** no se me pide recargar ni repetir lo que ya hice

##### Notas

Cubre RF-16.1. La degradación no es un caso de error: es parte del contrato del modelo.

##### Trazabilidad

Épica madre: **EP-009** · PRD v2.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-073 — Encontrar mi especificación como la dejé

**Como** líder de proyecto que vuelve al portal días después,
**quiero** recuperar el Perfil Objetivo que ya había ajustado,
**para** no repetir el trabajo de especificar cada vez que entro.

##### Criterios de aceptación

###### Happy path — recuperación

**Dado** que ajusté un Perfil Objetivo en una visita anterior,
**cuando** vuelvo a entrar desde el mismo dispositivo,
**Entonces** encuentro la especificación como la dejé
**Y** puedo partir de ella o empezar una nueva

###### Error — el navegador no conserva el dato

**Dado** que vuelvo desde otro equipo, en modo privado o tras limpiar el almacenamiento,
**cuando** entro al portal,
**Entonces** arranco con una especificación en blanco
**Y** el portal no me promete una recuperación que no puede cumplir

###### Edge case — otro invitado del mismo enlace

**Dado** que un colega invitado al mismo enlace entra al portal,
**cuando** él entra al portal desde su propio dispositivo,
**Entonces** arranca limpio y no ve la especificación que yo escribí
**Y** eso es el comportamiento correcto, no una carencia

##### Notas

Cubre RF-13.4.

**D-16 cerrada el 2026-09-21: persistencia por dispositivo, no por cuenta.** La especificación queda en el navegador de quien la escribió. Resuelve el caso real —la misma persona que vuelve— y elimina la implicación ISO 27000, porque nada se guarda del lado del servidor contra una identidad que el portal no puede verificar. Se reabre cuando exista autenticación real por usuario.

##### Trazabilidad

Épica madre: **EP-009** · PRD v4.8

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-082 — Decir en qué país y ciudad necesito el perfil

**Como** líder de proyecto que necesita un perfil con presencia física en una sede,
**quiero** indicar el país y la ciudad donde se requiere el perfil,
**para** que Trycore no me proponga gente que no puede estar donde el proyecto la necesita.

##### Criterios de aceptación

###### Happy path — ubicación obligatoria en presencial e híbrido

**Dado** que en mi Perfil Objetivo elijo modalidad Presencial 100% o Híbrido,
**cuando** miro la especificación,
**Entonces** aparecen los campos de país y ciudad marcados como obligatorios
**Y** no se prellenan con la ubicación de mi cuenta, porque el proyecto puede estar en otra sede
**Y** el dato viaja con la solicitud y con el registro de demanda

###### Error — solicitar presencial sin ubicación

**Dado** que mi modalidad es Presencial 100% y no indiqué país,
**cuando** intento enviar la solicitud,
**Entonces** el portal me pide completar la ubicación antes de enviar
**Y** conserva todo lo demás que ya había especificado

###### Edge case — modalidad remota

**Dado** que mi modalidad es Remoto,
**cuando** reviso el Perfil Objetivo,
**Entonces** los campos de país y ciudad siguen disponibles pero son opcionales
**Y** su ausencia no impide enviar la solicitud

###### Edge case — precisión del emparejamiento

**Dado** que indiqué una ciudad para una necesidad presencial,
**cuando** veo los resultados,
**Entonces** veo la ciudad de cada profesional junto a su país
**Y** el portal me indica que la logística concreta se cierra en la sesión de alineación

###### Edge case — necesidad remota

**Dado** que declaré la modalidad como Remoto,
**cuando** veo los resultados,
**Entonces** veo el país de cada profesional y no su ciudad
**Y** el portal no me pide una ubicación que no decide nada

##### Notas

Distingue dos datos que no son el mismo: la **ubicación de la necesidad** la aporta el cliente y no tiene costo operativo; la **ubicación del profesional** es dato del banco: tras D-18 se publica el país y la ciudad se carga sin publicarse.

El último criterio es la parte importante. Mientras D-18 no se resuelva, el portal captura la necesidad pero no puede emparejarla, y decirlo es preferible a simular un filtro que no funciona. Es el mismo principio que gobierna RF-14.0.

La concentración geográfica de la demanda presencial es además insumo de decisión de huella: dónde conviene tener talento y dónde no.

Cubre RF-13.5.

**Desbloqueada el 2026-09-16 (D-18 cerrada).** Se publica el país del profesional; la ciudad se carga y queda para Delivery, que la cruza en la sesión de alineación. El país solo se ofrece como filtro cuando el banco tiene más de un país publicado.

##### Trazabilidad

Épica madre: **EP-009** · PRD v2.2

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ no depende de otra historia de la Fase 2 |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | ✓ campos simples sobre una especificación existente |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-083 — Decir qué tiene que estar funcionando cuando el proyecto termine

**Como** líder de proyecto cuya meta no es contratar a alguien sino entregar algo,
**quiero** describir el resultado que mi proyecto tiene que alcanzar, antes que el rol que creo necesitar,
**para** que Trycore entienda mi problema y no solo mi pedido.

##### Criterios de aceptación

###### Happy path — el reto encabeza la especificación

**Dado** que estoy viendo mi Perfil Objetivo,
**cuando** lo abro,
**Entonces** el primer campo me pregunta qué tiene que estar funcionando al terminar el proyecto
**Y** aparece antes que la familia de rol
**Y** lo que escriba viaja con la solicitud y con el registro de demanda

###### Happy path — el reto cambia la pantalla de cero

**Dado** que describí un reto y el banco no tiene el rol que pedí,
**cuando** llego a la pantalla sin coincidencias,
**Entonces** veo mi reto a la vista junto con los perfiles del banco que sí aportan a ese reto
**Y** la ausencia de un rol no se presenta como ausencia de respuesta

###### Error — reto vacío

**Dado** que dejo el campo del reto sin diligenciar,
**cuando** envío la solicitud,
**Entonces** la solicitud se procesa con normalidad
**Y** queda registrada como especificación sin reto declarado

###### Edge case — el cliente solo quiere un perfil

**Dado** que sé exactamente qué rol necesito y no quiero describir nada más,
**cuando** uso el portal,
**Entonces** puedo ignorar el campo del reto sin fricción adicional
**Y** el flujo hasta la solicitud no se alarga

##### Notas

El campo es opcional por diseño. Quien busca un perfil concreto no debe pagar el costo de una pregunta que no necesita, y el argumento de venta del flujo es la velocidad.

Su valor mayor es aguas abajo: Delivery recibe el resultado esperado y no solo el rol pedido, que es exactamente lo que el proceso comercial de la línea dice querer diagnosticar antes de buscar a nadie.

Cubre RF-13.6.

##### Trazabilidad

Épica madre: **EP-009** · PRD v2.3 · Habilita HU-084 y refuerza EP-010

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ funciona sin HU-084 |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | ✓ un campo sobre una especificación existente |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-085 — Ajustar mi especificación con las opciones que el banco realmente tiene

**Como** líder de área que está afinando lo que necesita,
**quiero** ajustar cada campo del Perfil Objetivo eligiendo entre opciones coherentes con lo que ya seleccioné,
**para** no tener que adivinar cómo nombra Trycore las cosas ni descubrir al final que mi combinación no existe.

##### Criterios de aceptación

###### Happy path — la cascada acota las opciones

**Dado** que en el Perfil Objetivo elijo la familia de rol Desarrollador Frontend,
**cuando** abro el campo de tecnologías,
**Entonces** veo únicamente las tecnologías que existen en el banco para ese rol
**Y** cada una muestra cuántos perfiles la tienen
**Y** al elegir una, los demás campos recalculan sus opciones

###### Happy path — necesidad que el banco no cubre

**Dado** que la tecnología que necesito no está entre las opciones,
**cuando** la añado manualmente,
**Entonces** queda marcada como no disponible en el banco
**Y** no se usa para filtrar resultados, porque no hay nada contra qué filtrar
**Y** viaja con mi solicitud y queda en el registro de demanda como necesidad no cubierta

###### Error — combinación sin ningún perfil

**Dado** que fui acotando campos hasta que ningún perfil cumple,
**cuando** miro el panel,
**Entonces** veo que quedan cero perfiles antes de llegar a la pantalla de resultados
**Y** puedo soltar cualquiera de los criterios en un toque

###### Edge case — cambio de familia de rol con tecnologías ya elegidas

**Dado** que tenía tecnologías seleccionadas y cambio la familia de rol,
**cuando** se recalculan las opciones,
**Entonces** mis selecciones anteriores siguen visibles y no se borran en silencio
**Y** las que ya no corresponden al nuevo rol quedan señaladas para que yo decida

##### Notas

**La regla que impide que el panel se vuelva una jaula (RF-13.7.2):** el Perfil Objetivo describe lo que el cliente necesita, no lo que tenemos. Restringirlo al inventario destruiría el camino del cero y el registro de demanda, que es el activo de mayor valor del portal. Por eso la solución es de dos niveles y no de uno.

El texto libre en tecnologías —como estaba en la primera versión del Mid-Fi— produce datos que no se pueden filtrar, contar ni comparar, y le traslada al cliente el trabajo de adivinar nuestro vocabulario.

Cubre RF-13.7.

##### Trazabilidad

Épica madre: **EP-009** · PRD v2.5

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ opera sobre el Perfil Objetivo ya existente |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-118 — Distinguir lo que no puedo negociar de lo que sería bueno tener

**Como** líder de proyecto que está afinando lo que necesita,
**quiero** marcar cada criterio como obligatorio o deseable,
**para** que un requisito deseable ordene los resultados en lugar de dejarme sin ninguno.

##### Criterios de aceptación

###### Happy path — los deseables ordenan

**Dado** que marqué el rol como obligatorio y el sector como deseable,
**cuando** veo los resultados,
**Entonces** aparecen todos los perfiles de ese rol
**Y** los que además cumplen el sector aparecen primero
**Y** cada tarjeta dice cuántos deseables cumple

###### Happy path — endurecer un criterio

**Dado** que un criterio estaba como deseable,
**cuando** lo marco como obligatorio,
**Entonces** los perfiles que no lo cumplen desaparecen de los resultados
**Y** veo cuántos quedaron

###### Error — ningún perfil cumple los obligatorios

**Dado** que endurecí varios criterios,
**cuando** ninguno los cumple todos,
**Entonces** llego al camino del cero
**Y** veo quién falla exactamente un obligatorio, indicando cuál

###### Edge case — todo deseable

**Dado** que no marqué ningún criterio como obligatorio,
**cuando** veo los resultados,
**Entonces** aparece el banco completo ordenado por cuántos deseables cumple cada perfil
**Y** no veo una lista vacía

##### Notas

Tomado de Juicebox, que separa filtros de criterios (evidencia A).

**La razón por la que aquí vale más que en el referente:** Juicebox usa los criterios para ordenar 1.200 resultados; nosotros los necesitamos para no quedar en cero. Con un banco de decenas, tratar todo como filtro duro cierra el conjunto en dos pasos.

Por omisión solo el rol es obligatorio: es la configuración que más resultados produce, y el cliente endurece lo que de verdad no puede negociar.

Cubre RF-13.9.

##### Trazabilidad

Épica madre: **EP-009** · PRD v4.1

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |

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

### Historias de esta épica (4)

#### HU-075 — Entender qué pedí cuando no hay nada que mostrar

**Como** líder de proyecto cuya búsqueda no arrojó coincidencias,
**quiero** ver mi especificación a la vista junto con la ausencia de resultados,
**para** saber que el portal entendió lo que necesito aunque hoy no lo tenga, y poder pedirlo.

##### Criterios de aceptación

###### Happy path — cero con especificación

**Dado** que mi búsqueda no tiene coincidencias,
**cuando** se muestra la pantalla de resultados,
**Entonces** veo mi Perfil Objetivo completo y editable
**Y** veo el plazo de 10 días hábiles para incorporar un perfil a medida
**Y** veo la acción para solicitarlo

###### Error — especificación demasiado vaga para solicitar

**Dado** que llegué al cero con una especificación sin rol ni seniority,
**cuando** intento solicitar el perfil a medida,
**Entonces** el portal me pide completar los campos mínimos antes de enviar
**Y** conserva lo que ya escribí

###### Edge case — el cero se produce por un filtro y no por el banco

**Dado** que tengo una instrucción con resultados y un filtro que los anula,
**cuando** llego al cero,
**Entonces** el portal distingue entre «el banco no lo tiene» y «tus filtros lo excluyeron»
**Y** en el segundo caso se ofrece quitar el filtro antes que solicitar un perfil nuevo

##### Notas

Cubre RF-14.3. El último escenario evita el error más caro de esta pantalla: pedirle a Trycore que recluten a alguien que ya está en el banco.

##### Trazabilidad

Épica madre: **EP-010** · PRD v2.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-076 — Ver alternativas solo cuando de verdad se parecen

**Como** líder de proyecto que no encontró lo que buscaba,
**quiero** que el portal me muestre perfiles cercanos únicamente si realmente lo son,
**para** no perder la confianza en el banco por culpa de sugerencias que no tienen que ver con lo que pedí.

##### Criterios de aceptación

###### Happy path — cercanos por encima del umbral

**Dado** que mi búsqueda no tiene coincidencias exactas y hay perfiles que fallan exactamente un criterio,
**cuando** se muestra la pantalla de cero,
**Entonces** veo esos perfiles bajo un encabezado que los identifica como aproximaciones
**Y** veo en qué se parecen y en qué no a lo que pedí

###### Error — ningún perfil supera el umbral

**Dado** que no hay perfiles suficientemente cercanos,
**cuando** se muestra la pantalla de cero,
**Entonces** no se muestra ninguna sección de aproximaciones
**Y** la pantalla lleva directamente a la solicitud dirigida

###### Edge case — muchos perfiles apenas por encima del umbral

**Dado** que varios perfiles superan el umbral por poco,
**cuando** se muestran las aproximaciones,
**Entonces** se limita la cantidad mostrada
**Y** se ordenan por cercanía real a la especificación

##### Notas

Cubre RF-14.3.

**Desbloqueada el 2026-09-15 (D-14 cerrada).** El umbral deja de ser numérico: «lo más cercano» son los perfiles que fallan exactamente un criterio, y la tarjeta dice cuál. Es verificable por el cliente y explicable por el comercial, cosa que un número calibrado nunca sería.

##### Trazabilidad

Épica madre: **EP-010** · PRD v2.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-077 — Pedir el perfil que no existe todavía

**Como** líder de proyecto que no encontró el perfil que necesita,
**quiero** solicitar formalmente ese perfil con el plazo de incorporación a la vista,
**para** resolver mi necesidad aunque el banco no la cubra hoy, en lugar de cerrar la pestaña y buscar por fuera.

##### Criterios de aceptación

###### Happy path — solicitud dirigida

**Dado** que estoy en la pantalla de cero con una especificación completa,
**cuando** envío la solicitud de perfil a medida,
**Entonces** recibo confirmación con el plazo de 10 días hábiles
**Y** se crea la oportunidad correspondiente en el pipeline comercial
**Y** la especificación completa viaja con la solicitud

###### Error — falla la creación en el CRM

**Dado** que envío la solicitud y la integración con el CRM falla,
**cuando** se procesa el envío,
**Entonces** la solicitud no se pierde y entra en cola de reintento
**Y** recibo igualmente la confirmación
**Y** se alerta al responsable interno

###### Edge case — segunda solicitud de la misma especificación

**Dado** que ya solicité este mismo perfil hace pocos días,
**cuando** envío la solicitud de nuevo,
**Entonces** el portal me muestra que ya hay una solicitud en curso y su fecha
**Y** puedo añadir contexto en lugar de duplicar la oportunidad

##### Notas

Cubre RF-14.3 y RF-9. Según el análisis de la Fase 2, es la mejora con mayor retorno comercial del rediseño.

##### Trazabilidad

Épica madre: **EP-010** · PRD v2.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-078 — Saber qué están pidiendo las cuentas y no tenemos

**Como** integrante del equipo de Talento Humano responsable del banco de talento,
**quiero** consultar las especificaciones completas que las cuentas buscaron y no encontraron,
**para** decidir a quién sumar al banco con base en demanda real de clientes activos y no por intuición.

##### Criterios de aceptación

###### Happy path — registro consultable

**Dado** que hubo búsquedas sin coincidencia en el período,
**cuando** abro el registro de demanda,
**Entonces** veo la especificación estructurada de cada búsqueda y no solo el texto que escribieron
**Y** veo la cuenta, la fecha y si la búsqueda terminó en solicitud dirigida

###### Error — período sin búsquedas fallidas

**Dado** que no hubo búsquedas sin coincidencia,
**cuando** abro el registro,
**Entonces** veo un estado vacío que lo dice con claridad
**Y** no veo una tabla en blanco sin explicación

###### Edge case — demanda inducida por sugerencias

**Dado** que parte de las búsquedas provienen de instrucciones sugeridas sin editar,
**cuando** reviso el registro,
**Entonces** esas entradas están marcadas como originadas en una sugerencia
**Y** puedo separarlas de la demanda espontánea

##### Notas

**Esta es la historia canónica del registro de demanda.** Resuelto el 2026-09-22: `HU-110` duplicaba esta historia —mismo actor, mismo *quiero*, mismo propósito, mismo escenario de error— porque se escribió en el cierre de huecos del PRD 4.0 sin ver que esta existía desde el PRD 2.8. HU-110 se reescribió para cubrir la mitad de **RF-7.2** que nadie cubría: el reporte de filtros más usados.

Cubre **RF-15.1** y la segunda mitad de **RF-7.2** (búsquedas sin resultados). Dueño y cadencia en **D-13**: Talento Humano, revisión mensual.

Cubre RF-15.1 y RF-7.2. El último escenario es la defensa contra el sesgo que el propio documento de Fase 2 identificó: sin esa marca, el registro mide lo que sugerimos y no lo que el cliente necesita.

**Desbloqueada el 2026-09-15 (D-13 cerrada).** Dueño: Talento Humano. Cadencia: revisión mensual. Es quien actúa sobre el dato, porque el registro existe para decidir a quién sumar al banco.

##### Trazabilidad

Épica madre: **EP-010** · PRD v2.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |

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

### Historias de esta épica (5)

#### HU-113 — Armar la selección de perfiles de una cuenta

**Como** responsable de la distribución en Mercadeo,
**quiero** elegir desde el panel los perfiles que le voy a proponer a una cuenta, viendo su disponibilidad real,
**para** no proponer gente que ya no está disponible cuando el cliente abra el correo.

##### Criterios de aceptación

###### Happy path

**Dado** que voy a armar el envío de una cuenta,
**cuando** abro la selección,
**Entonces** veo el inventario publicado con su disponibilidad en ese momento
**Y** elijo perfiles y escribo la razón de la selección referida al proyecto de la cuenta

###### Error — un perfil seleccionado cambia antes del envío

**Dado** que el perfil se pausa después de que lo elegí,
**cuando** voy a enviar,
**Entonces** el sistema me lo advierte antes de enviar
**Y** puedo reemplazarlo o quitarlo

###### Edge case — la cuenta no tiene proyecto conocido

**Dado** que no sabemos en qué está trabajando,
**cuando** armo la selección,
**Entonces** no se inventa una razón
**Y** la selección se envía con un encuadre genérico o no se envía

##### Notas

Cubre RF-18.1, RF-18.3 y RF-18.4. **La selección se arma contra el inventario del momento**, no contra una hoja aparte que se degrada entre que se arma y que el cliente abre.

##### Trazabilidad

Épica madre: **EP-011** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-114 — Generar el enlace de cada contacto sin construirlo a mano

**Como** responsable de la distribución,
**quiero** que el enlace de cada destinatario se genere solo desde el envío,
**para** no equivocarme copiando parámetros para veinte cuentas.

##### Criterios de aceptación

###### Happy path

**Dado** que preparo el envío,
**cuando** se generan los enlaces,
**Entonces** cada contacto recibe un enlace propio con su cuenta y su selección
**Y** ninguno se construye a mano

###### Error — contacto sin cuenta asociada

**Dado** que un destinatario no está asociado a ninguna cuenta,
**cuando** se prepara el envío,
**Entonces** ese destinatario se excluye y se reporta
**Y** no se envía un enlace sin contexto

###### Edge case — vigencia

**Dado** que el enlace se genera,
**cuando** se define su expiración,
**Entonces** la vigencia va atada al ciclo del envío
**Y** un enlace de un boletín anterior ya no abre inventario

##### Notas

Cubre RF-1.6 y RF-18.2.

##### Trazabilidad

Épica madre: **EP-011** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-115 — Programar y enviar el boletín

**Como** responsable de la distribución,
**quiero** enviar con una cadencia definida y saber que salió,
**para** que el portal tenga tráfico recurrente y no por impulsos.

##### Criterios de aceptación

###### Happy path

**Dado** que la selección está lista,
**cuando** programo el envío,
**Entonces** el boletín sale en la fecha definida
**Y** queda registro de a quién se envió y con qué selección

###### Error — selección incompleta

**Dado** que falta la razón de la selección de alguna cuenta,
**cuando** intento programar,
**Entonces** el sistema lo señala
**Y** no se envía una selección sin explicación

###### Edge case — cuenta que pidió no recibir

**Dado** que un contacto pidió dejar de recibirlo,
**cuando** se prepara el envío,
**Entonces** queda excluido
**Y** su exclusión se mantiene en envíos siguientes

##### Notas

Cubre RF-18.5. **Sin cadencia no hay hábito, y sin hábito no hay O5.**

##### Trazabilidad

Épica madre: **EP-011** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-116 — Ver quién abrió y quién entró

**Como** responsable de la distribución,
**quiero** ver por cuenta quién abrió el correo, quién tocó el enlace y quién llegó a solicitar,
**para** saber si el problema está en el correo, en el portal o en la oferta.

##### Criterios de aceptación

###### Happy path

**Dado** que hubo un envío,
**cuando** abro el informe,
**Entonces** veo apertura, clic y entrada por cuenta
**Y** veo cuántas terminaron en solicitud

###### Error — envío sin datos de apertura

**Dado** que la herramienta no reporta aperturas,
**cuando** reviso,
**Entonces** el informe lo dice en lugar de mostrar cero
**Y** no se confunde ausencia de dato con ausencia de apertura

###### Edge case — entra sin abrir

**Dado** que entra un invitado del enlace que no recibió el correo del envío,
**cuando** se registra,
**Entonces** la entrada se atribuye al envío aunque no haya apertura propia

##### Notas

Cubre RF-18.6 y RF-7.3. La distinción del segundo escenario evita la conclusión más común y más equivocada de todo informe de correo.

##### Trazabilidad

Épica madre: **EP-011** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

#### HU-117 — Reaccionar a una cuenta que nunca abre

**Como** ejecutivo comercial dueño de la cuenta,
**quiero** que me avisen cuando una de mis cuentas acumula tres envíos sin abrir,
**para** tratarlo como lo que es, una señal comercial, y no como un problema de correo.

##### Criterios de aceptación

###### Happy path

**Dado** que una cuenta acumula tres envíos sin abrir,
**cuando** se evalúa,
**Entonces** recibo el aviso con el histórico
**Y** la cuenta queda marcada para revisión antes de seguir enviando

###### Error — problema de entregabilidad

**Dado** que el correo ni siquiera llega,
**cuando** se evalúa,
**Entonces** se distingue del caso de no apertura
**Y** se corrige el dato antes de escalar comercialmente

###### Edge case — abre pero nunca entra

**Dado** que abre el correo y nunca toca el enlace,
**cuando** se evalúa,
**Entonces** se trata distinto: el problema no es el canal sino la propuesta
**Y** la selección de esa cuenta se revisa

##### Notas

Cubre RF-18.6. El tercer escenario es el más informativo: quien abre y no entra está diciendo que la selección no le habla.

##### Trazabilidad

Épica madre: **EP-011** · PRD v4.0

##### INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |

---

# PARTE IV · Especificaciones anexas

### Especificación — Correo curado

#### 0. Por qué esta especificación llega tarde y por qué importa

El PRD dedicó treinta y tantas versiones a especificar el portal. El correo —que es **la fuente de todo su tráfico**— vivía en una sola línea, como supuesto.

Es una asimetría peligrosa: especificamos con enorme detalle el destino sin haber escrito nada sobre el camino. **Si el correo no funciona, nada de lo demás importa.** Un portal excelente al que nadie entra es un portal que no existe.

#### 1. Qué es

Un envío **construido por cuenta**, no un boletín con el mismo contenido para todos. Cada cuenta recibe una selección de perfiles elegida contra el proyecto que Trycore sabe que tiene en curso, con la razón de esa elección declarada.

**No es una campaña de marketing.** Es una propuesta comercial personalizada que usa el correo como vehículo. La diferencia se nota en el tono, en la frecuencia y en qué se hace cuando alguien no lo abre.

#### 2. Quién lo arma y con qué criterio

| Pieza | Dueño | Insumo |
|---|---|---|
| Selección de perfiles por cuenta | Mercadeo, con criterio comercial | Proyecto en curso de la cuenta, aportado por el ejecutivo |
| Razón de la selección | Mercadeo | Por qué esos perfiles para ese proyecto |
| Conocimiento del proyecto de la cuenta | Ejecutivo comercial | Es el insumo que nadie más tiene |
| Disponibilidad real | Panel de Talento Humano | En el momento de armar el envío |

**Si nadie sabe en qué está trabajando la cuenta, no hay curaduría posible.** Ese es el punto de falla del mecanismo, y es humano, no técnico: depende de que el ejecutivo aporte el contexto.

#### 3. La regla que evita la decepción

**La selección se arma contra el inventario del momento del envío, desde el panel.**

Una selección armada en una hoja aparte se degrada entre que se arma y que el cliente abre el correo. El cliente entra esperando cuatro perfiles y encuentra tres, o encuentra uno que ya no está disponible. Eso no es un detalle: es la primera impresión del producto.

Antes de enviar, el sistema verifica que cada perfil seleccionado siga publicado y disponible, y advierte de lo que cambió.

#### 4. Estructura del envío

| Elemento | Contenido | Por qué |
|---|---|---|
| **Asunto** | Referido al proyecto de la cuenta, no al producto | «Tres perfiles para la modernización del core» pesa más que «Boletín de talento» |
| **Apertura** | Una línea que nombra el proyecto y la razón de la selección | Es lo que separa una propuesta de un envío masivo |
| **Perfiles** | Capacidad, competencias verificadas, disponibilidad. **Sin tarifas** (D-9) | Lo mismo que muestra la tarjeta del portal |
| **Llamado** | Un enlace al portal, no varios | Un solo destino |
| **Pie** | Contacto del ejecutivo de la cuenta y salida para dejar de recibirlo | Es una propuesta comercial, no una campaña |

**No se incluye:** fotografías, nombres completos sin consentimiento nominal, tarifas, ni promesas de disponibilidad que el banco no sostenga.

#### 5. Enlace

Se genera **desde el envío**, con los tokens de personalización de la cuenta y del contacto. Nadie construye URLs a mano.

Lleva: cuenta, contacto, selección curada y contexto del proyecto. Su vigencia va atada al ciclo del envío: un enlace del boletín anterior ya no abre inventario, y quien lo intente encuentra la pantalla de renovación, no un error.

#### 6. Cadencia y dueño

**Cadencia definida y dueño nominal.** Un canal sin cadencia no produce el hábito que O5 necesita, y un canal sin dueño no sale.

La cadencia es una decisión de Mercadeo. El criterio para elegirla: suficientemente frecuente para construir hábito, suficientemente espaciada para que la selección cambie de verdad entre un envío y otro. Enviar lo mismo dos veces destruye la credibilidad de la curaduría más rápido que no enviar.

#### 7. Medición, y las tres conclusiones que hay que distinguir

Se registra apertura, clic y entrada al portal, atribuidos a cuenta y contacto.

| Lo que se observa | Qué significa | Qué se hace |
|---|---|---|
| **No llega** | Problema de entregabilidad | Se corrige el dato antes de sacar cualquier conclusión comercial |
| **Llega y no se abre** | Señal comercial, no técnica | Tres envíos sin apertura escalan al ejecutivo de la cuenta antes de seguir enviando |
| **Se abre y no se entra** | La selección no le habla | **Es el dato más informativo del mecanismo.** Se revisa el criterio de curaduría de esa cuenta, no el correo |
| **Se entra y no se solicita** | El problema está en el portal o en la oferta | Se mira en el embudo de EP-008 |

Confundir estos cuatro casos es el error más común de cualquier informe de correo, y lleva a corregir lo que no está roto.

#### 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| **El ejecutivo no aporta el contexto del proyecto** | Sin contexto no hay curaduría. El envío de esa cuenta se pospone antes que enviar una selección genérica disfrazada de personalizada |
| **La selección se repite entre envíos** | El sistema advierte si un perfil ya se propuso a esa cuenta y no hubo reacción |
| **El correo se lee como publicidad** | Tono de propuesta, un solo llamado, contacto nominal del ejecutivo en el pie |
| **La cuenta abre y nunca entra** | Es señal de que la selección no responde a su necesidad. Se revisa la curaduría, no el asunto del correo |

#### 9. Dónde encaja

Formaliza **RF-18** del PRD. Épica **EP-011**. Historias **HU-113** a **HU-117**.

Depende de **HU-112** (atribución de sesiones al envío): sin esa atribución, nada de §7 se puede medir.

---

### Especificación — Enlaces curados

#### 1. Qué resuelve

Talento Humano selecciona un conjunto de perfiles para una cuenta concreta y genera un enlace. El cliente lo abre y ve exactamente esa selección, con la razón por la que se armó.

#### 2. La distinción que gobierna todo el diseño: lista, no filtro

Una URL puede llevar dos cosas distintas y no son intercambiables.

| | **Filtros en la URL** | **Lista de códigos en la URL** |
|---|---|---|
| Qué expresa | Los criterios | Los perfiles exactos |
| Al abrirse | Se recalcula | Se resuelve perfil por perfil |
| Ventaja | Siempre al día | **Expresa cualquier conjunto** |
| Límite | **No puede expresar un conjunto heterogéneo** | Queda congelada |

**El caso real es una lista.** Talento Humano quiere enviar un gerente, un desarrollador y un QA. **No existe ningún filtro que devuelva exactamente esos tres**: cualquiera que los incluya a los tres incluye a muchos más.

Por eso el enlace lleva la lista de códigos. La fragilidad de la lista se resuelve en §4, no renunciando a ella.

#### 3. Quién lo genera

**Talento Humano.** Es quien conoce la disponibilidad real y quien administra el inventario, y la selección se arma desde el mismo panel donde se ve esa disponibilidad.

*Nota de coordinación:* el contexto del proyecto de la cuenta lo tiene el ejecutivo comercial. Talento Humano genera el enlace, pero **la razón de la selección necesita ese insumo**. Sin él, la razón se vuelve genérica y la curaduría deja de serlo.

#### 4. Reevaluación al abrir — la regla que evita el hueco

Un enlace generado hoy se abre dentro de días o semanas. En ese lapso un perfil puede colocarse, pausarse o archivarse.

**Al abrirse, el portal reevalúa el estado de cada código.** Nunca se omite un perfil en silencio: el cliente lo ve con su estado real.

| Estado al abrir | Qué ve el cliente |
|---|---|
| Publicado y disponible | Tarjeta normal |
| Publicado, disponibilidad posterior | Tarjeta con su fecha de liberación |
| Pausado por colocación | Aparte, con *«Colocado en otro proyecto. Se libera el 31 de octubre»* |
| Pausado por otro motivo | Aparte, con el motivo |
| Archivado o inexistente | Aparte, con *«Ya no forma parte del banco»* |

**Un hueco silencioso se lee como desorden; un cambio explicado se lee como control.** Es la misma diferencia entre que falte un perfil y que se explique por qué falta.

#### 5. Qué exige el generador antes de emitir

| Requisito | Por qué |
|---|---|
| **Al menos un perfil** | Obvio, pero hay que impedirlo |
| **Una cuenta destinataria** | Un enlace sin cuenta no tiene contexto ni atribución posible |
| **Correos invitados** | Solo esos correos reciben el código de acceso; un correo fuera de la lista no entra, aunque sea de la misma empresa (RF-1.2.7). Se propone el contacto del envío en el CRM; quien genera lo confirma o añade a otras personas |
| **Una razón de la selección** | **Es lo que separa una curaduría de un catálogo.** Sin razón, el cliente recibe una lista |
| **Todos los perfiles publicados** | No se puede enviar lo que no está publicado |
| **Una vigencia** | Atada al ciclo del envío |

#### 6. El enlace es un objeto con vida propia

Cada enlace registra: token, cuenta, correos invitados (y las invitaciones aprobadas después, RF-1.2.10), razón, perfiles incluidos, quién lo generó, cuándo, vigencia, aperturas y si fue revocado.

**Sin ese registro, cuando un cliente diga «ustedes me mostraron a Fulano», nadie podría verificarlo.** Y sin las aperturas, el análisis de EP-011 —quién abrió, quién entró— no tiene de dónde salir.

**Revocar** desactiva el enlace sin borrar su historia. El cliente que lo abra encuentra una pantalla que le dice cómo pedir uno nuevo, no un error.

#### 7. Consecuencia para el Perfil Objetivo

Si la selección mezcla familias, **el Perfil Objetivo arranca vacío**.

No hay un rol común entre un gerente, un desarrollador y un QA, y deducir uno sería inventar. El panel se llena solo si el cliente después escribe una instrucción. Hasta entonces, la selección se presenta por sí misma.

#### 8. Volumen

Para una selección de decenas, la lista cabe en la URL. Por encima de eso, el enlace debe llevar **un token corto que resuelva la lista del lado del servidor**, no los códigos en la dirección. En el prototipo van en la URL para que el mecanismo se pueda ver.

#### 9. Dónde encaja

Formaliza **RF-19** del PRD. Épica **EP-001**. Historia **HU-122**.

Se relaciona con **RF-18** (correo curado): el correo es un vehículo para estos enlaces, pero un enlace curado también puede enviarse suelto por el ejecutivo comercial, fuera de la cadencia del boletín.

---

### Especificación — Importación masiva de perfiles

#### 0. Estado

Construido en el prototipo Mid-Fi, pestaña **Importar** del panel de Talento Humano. Verificado contra los ocho casos de esta especificación, incluida la prueba de ida y vuelta: exportar el banco y reimportarlo sin tocarlo deja las 23 filas en «sin cambios».

#### 1. Qué resuelve

Crear o actualizar muchos perfiles a la vez sin abrirlos uno por uno. Los dos casos reales son la carga inicial del banco y las actualizaciones periódicas de disponibilidad, que hoy Talento Humano mantiene en otra parte.

#### 2. La premisa que hay que corregir primero

**Quien importa no tiene un JSON: tiene una hoja de cálculo.** En los flujos de importación de HubSpot y Salesforce, el camino humano es subir un archivo tabular y mapear columnas; el JSON es el camino de máquina —lo que produce una integración o un agente—.

El asistente **acepta los dos y detecta cuál recibió**:

| Entrada | Cómo llega | Quién la usa |
|---|---|---|
| **Celdas pegadas desde una hoja de cálculo** (TSV) | Copiar un bloque de Excel o Google Sheets y pegar | Talento Humano. Es el camino principal |
| **CSV pegado o cargado** | Archivo exportado de cualquier herramienta | Talento Humano |
| **JSON** | Pegado o producido por una integración | Tecnología, agentes, sincronizaciones |

La detección es automática: si empieza por `[` o `{` es JSON; si la primera línea tiene tabuladores es TSV; si tiene comas y comillas balanceadas es CSV. Si hay ambigüedad, se pregunta.

#### 3. Qué NO hace, y por qué

| No hace | Razón |
|---|---|
| **No borra perfiles, nunca, ni de a uno** | Irreversible y sin caso de uso legítimo. Lo que se necesita es archivar, que conserva la trazabilidad de lo que se mostró en solicitudes pasadas |
| **No concede consentimiento** | Si el consentimiento se pudiera otorgar pegando un archivo, el bloqueo de publicación de RF-8.4 se saltaría con un pegado. Puede **revocarlo**, nunca concederlo |
| **No publica** | Ninguna importación pone un perfil en *publicado*. Los nuevos llegan a **borrador** y alguien los publica con la ficha a la vista |
| **No dictamina el resultado de la validación técnica** | Puede traer modalidad y fecha; el resultado proviene del registro de evaluación interna |
| **No toca campos que no vengan en la fila** | Ver §5 |

#### 4. Llave de identidad y modo de importación

##### 4.1 La llave es `codigo`

Obligatoria en toda fila. Es el criterio de deduplicación, equivalente al *record ID* de un CRM.

##### 4.2 Modo de importación — se elige antes de procesar

Los CRM siempre lo preguntan, y por una razón concreta: sin este control, un archivo destinado a actualizar disponibilidad crea perfiles fantasma por un código mal escrito.

| Modo | Código existente | Código nuevo |
|---|---|---|
| **Crear y actualizar** *(por omisión)* | Actualiza | Crea en borrador |
| **Solo actualizar** | Actualiza | **Se omite y se reporta**, no crea |
| **Solo crear** | **Se omite y se reporta**, no toca | Crea en borrador |

##### 4.3 Duplicados dentro del mismo archivo

Dos filas con el mismo código son un **error**, no un «gana la última». Se muestran ambas y la importación no procede hasta resolverlo. Una regla de precedencia silenciosa aplica un cambio que nadie decidió.

##### 4.4 Idempotencia

Reimportar el mismo archivo no duplica nada ni cambia nada: todas las filas caen en *sin cambios*.

#### 5. Semántica de la actualización — fusión, no reemplazo

**Solo se modifica lo que viene en la fila.** Una fila con `codigo` y `disponibleDesde` actualiza la disponibilidad y deja intacto todo lo demás.

Es la decisión más importante de la especificación. El reemplazo total es la alternativa obvia y es peligrosa: un archivo abreviado borraría en silencio el Sello Personal, la experiencia y la validación de cada perfil que toque.

##### 5.1 Ausente, vacío y nulo — la distinción que evita el bug clásico

| En la fila | Efecto |
|---|---|
| **Campo ausente** (la columna no existe o la clave no está) | No se toca |
| **Celda vacía o cadena vacía** | **No se toca.** Una hoja de cálculo se llena de celdas vacías sin intención |
| **`null` explícito**, o el literal `[vaciar]` en formato tabular | **Se vacía el campo.** Es la única forma deliberada de borrar un valor |

Sin esta regla nadie puede vaciar un campo a propósito, ni evitar vaciarlo por accidente.

##### 5.2 Reemplazo total

Si alguna vez se necesita, es una casilla explícita, apagada por omisión, con advertencia y contando cuántos campos se vaciarían en cuántos perfiles.

#### 6. El asistente, paso a paso

##### Paso 1 · Origen

Área para pegar o cargar, con tres ayudas:

- **Descargar plantilla de muestra**, en hoja de cálculo y en JSON. Trae las columnas con **tres ejemplos que cubren los tres casos**: actualizar un campo de un perfil existente, crear uno nuevo con todos sus datos, y archivar uno. Quien la abre entiende el formato sin leer documentación.
- **Exportar el banco actual**, en hoja de cálculo y en JSON. La forma más confiable de obtener el formato correcto es sacar lo que ya existe, editarlo y devolverlo.
- **Nota de formato visible junto a los botones:** las listas van en una sola celda separadas por punto y coma; una celda vacía no cambia nada;  borra el campo a propósito.

**Si el navegador bloquea la descarga** —cosa que ocurre en vistas incrustadas— el contenido se muestra en un área de texto para copiarlo. La funcionalidad no depende de que la descarga funcione.

Validación inmediata: formato reconocible, raíz correcta, y límite de filas por importación.

##### Paso 2 · Mapeo de campos

Solo aparece cuando hace falta: si las columnas o claves no coinciden con el esquema.

- Cada columna del archivo se empareja con un campo del perfil, o se marca **no importar**.
- El emparejamiento se propone automáticamente por nombre.
- **Las plantillas de mapeo se guardan y se reutilizan**, porque la misma persona importa el mismo formato todos los meses.
- Una columna sin emparejar no bloquea: se ignora y se informa.

##### Paso 3 · Vista previa

Cada fila se presenta como una **tarjeta de perfil colapsada**, agrupada por resultado con su conteo:

| Bloque | Qué contiene | Qué muestra al expandirse |
|---|---|---|
| **Nuevos** | Códigos que no existen | La ficha resultante completa |
| **Actualizados** | Códigos existentes con cambios | **Solo los campos que cambian**, valor anterior y nuevo enfrentados |
| **Archivados** | Filas con `estado: archivado` | El perfil que sale del banco |
| **Sin cambios** | La fila es idéntica a lo que ya hay | Nada. Existe para que los números cuadren |
| **Omitidos** | Excluidos por el modo de importación | El motivo |
| **Con error** | Sin código, duplicado, tipo inválido, valor fuera de rango | El error concreto y la fila tal como vino |

**Cada tarjeta se puede desmarcar** para excluirla. No hay que corregir el archivo entero por una fila.

**Los valores nuevos se destacan.** Un rol, una tecnología o un sector que no existe hoy en el banco se marca como *valor nuevo en la taxonomía*. No se bloquea —el banco es la fuente de la taxonomía y ampliarla es legítimo— pero un error de digitación crea una tecnología fantasma que contamina los filtros para siempre, y verlo antes cuesta un segundo.

**Las incoherencias de RF-8.14 se evalúan aquí**, no después: un perfil colocado cuya disponibilidad quede antes del fin de su asignación se marca en la vista previa.

**Descargar solo las filas con error** como archivo, con su motivo y en el mismo formato en que llegaron. Es lo que evita reprocesar sesenta filas por tres malas.

##### Paso 4 · Confirmar

Resumen numérico —*se crearán N, se actualizarán M, se archivarán K, se omitirán J, hay E con error*— y el botón de importar. **Nada se ha modificado hasta este punto.**

##### Paso 5 · Resultado

Qué se hizo, con enlace a cada perfil afectado, la opción de descargar el reporte, y el botón de **deshacer esta importación**.

#### 7. Historial y reversibilidad

Cada importación queda registrada: quién, cuándo, origen del archivo, modo, conteos por bloque y **el estado anterior de cada perfil tocado**.

**La última importación se revierte por completo.** Es la contraparte necesaria de una acción que modifica decenas de registros de una vez: el borrado masivo está prohibido, pero una actualización masiva equivocada hace un daño equivalente.

Aquí nos apartamos deliberadamente del patrón de los CRM. HubSpot y Salesforce permiten borrar lo que una importación creó, pero no deshacer lo que actualizó. **Con un banco de decenas de perfiles curados a mano, poder volver atrás vale más que en un CRM de cientos de miles de registros**, donde revertir es impracticable.

Revertir no borra los perfiles creados: los archiva.

#### 8. Permisos, límites y auditoría

- **Solo el rol de administrador de inventario importa.** El rol observador ve el historial y no puede ejecutar.
- **Límite por importación** acorde al tamaño del banco. Por encima del límite, el asistente pide dividir el archivo en lugar de procesar en segundo plano: con estos volúmenes, un proceso asíncrono añade complejidad sin resolver nada.
- **Cada cambio queda atribuido a su importación** en el registro de auditoría (RF-8.9), nunca a «sistema». Si dentro de seis meses alguien pregunta por qué cambió un dato, la respuesta tiene nombre y fecha.

#### 9. Esquema

Solo `codigo` es obligatorio. Todo lo demás es opcional y se fusiona.

```json
[
  {
    "codigo": "BE-SR-014",
    "nombre": "Andrés Molina",
    "capacidad": "Ingeniero Backend Senior",
    "anclaje": "8 años en core bancario",
    "rol": "Desarrollador Backend",
    "familia": "Desarrollo de software",
    "seniority": "Senior",
    "anios": 8,
    "modalidad": "Híbrido",
    "pais": "Colombia",
    "ciudad": "Bogotá",
    "tecnologias": ["Java 17", "Spring Boot", "gRPC"],
    "sectores": ["Banca"],
    "disponibleDesde": "2026-11-01",
    "vinculo": "vinculado",
    "resumen": "Perfil de backend con foco en sistemas transaccionales…",
    "experiencia": ["Core bancario en Davivienda Empresas: migración de REST a gRPC sobre más de 50 mil usuarios."],
    "selloPersonal": ["Rigurosidad y calidad", "Autodidactismo", "Cautela y responsabilidad"],
    "validacion": { "modalidadId": "des-3", "fecha": "2026-02-01" },
    "estado": "pausado",
    "motivoPausa": "En licencia o ausencia temporal"
  }
]
```

**Equivalente tabular.** En hoja de cálculo, las listas van separadas por punto y coma en una sola celda: `Java 17; Spring Boot; gRPC`.

**Ejemplo mínimo** — actualización de disponibilidad:

```json
[
  { "codigo": "BE-SR-014", "disponibleDesde": "2026-11-01" },
  { "codigo": "QA-SR-012", "disponibleDesde": "2026-10-15" },
  { "codigo": "RPA-SS-030", "estado": "archivado" }
]
```

**Campos rechazados si aparecen**, con aviso en la vista previa: `consentimiento` en verdadero, `resultadoValidacion`, y cualquier intento de fijar `estado: "publicado"`.

#### 10. Dónde encaja

Detalla **RF-8.6**, que decía «carga y actualización masiva por archivo estructurado» sin más. Se formaliza como **RF-8.15** en el PRD.

Tiene efecto sobre **D-8**, el alcance del panel en la primera versión: ahora Talento Humano puede decidir con criterio si la importación entra en v1 o espera, porque se sabe qué implica.

Historias: **HU-086** (importar), **HU-087** (revertir), **HU-088** (exportar el banco como plantilla).

---

# PARTE V · Decisiones abiertas

### 12.3 Decisiones abiertas

| # | Decisión | Opciones | Dueño | Bloquea |
|---|---|---|---|---|
| **D-2** | Nombre del portal | Pendiente. No usar el nombre de la línea como nombre de producto | Mercadeo | Diseño visual |
| **D-5** | Grado de detalle de la trayectoria en la ficha | *Resuelta de hecho:* Perfil Profesional reescrito + Sello Personal (3 competencias) + Experiencia Clave despersonalizada. Ver Anexo B. **Talento Humano condiciona el VoBo a ver la propuesta de ficha** (2026-09-18): hasta que exista esa propuesta la decisión no se puede tomar, y el orden se invierte — la ficha se propone primero y se aprueba después | Talento Humano | RF-3.2 · **bloquea su propio cierre hasta que exista propuesta de ficha** |

> **Nota sobre D-5, ahora crítica.** Con el nombre fuera del portal, el grado de detalle de la trayectoria es lo único que carga la humanidad de la ficha. Deja de ser una decisión menor de contenido y pasa a ser la que define si el portal se siente humano o se siente un inventario.

---

# PARTE VI · Orden de construcción

# Anexo A — Fases secuenciales para agentes

> Ejecutar en orden. Cada fase termina en un resultado verificable en pantalla. El prototipo Low-Fi queda completo al terminar la Fase 7.

### Fase 0: Modelo de datos e inventario semilla
- **Dependencias**: ninguna
- **Resultado verificable**: archivo de datos con 18–24 perfiles semilla que cubren las 4 categorías reales de la línea (Procesos y diseño · Gestión de proyectos · Desarrollo · Especialistas), cada uno con id, rol, categoría, seniority, stack, sectores, modalidad, disponibilidad, resumen de trayectoria, estado de las 4 dimensiones Neural-Grid, estado de publicación y marca de consentimiento. Más 3 cuentas de ejemplo con su conjunto curado
- **Alcance**: SÍ estructura y datos representativos. NO datos reales de personas, NO backend
- **Tiempo estimado del agente**: 10–15 min

### Fase 1: Shell, parámetros de entrada y estado en URL
- **Dependencias**: Fase 0
- **Resultado verificable**: el portal abre con un enlace parametrizado, resuelve la cuenta y su conjunto curado, y todo cambio de filtro se refleja en la URL; recargar conserva el estado
- **Alcance**: SÍ layout, encabezado, indicador de "Mi equipo", enrutamiento, simulación del enlace firmado y su vencimiento. NO firma criptográfica real, NO estilos finales
- **Tiempo estimado del agente**: 15 min

### Fase 2: Aterrizaje curado y ampliación de búsqueda
- **Dependencias**: Fase 1
- **Resultado verificable**: el aterrizaje muestra el conjunto curado con su razón declarada; "Ampliar la búsqueda" abre el banco completo y se regresa al conjunto en un clic sin perder nada
- **Alcance**: SÍ RF-2.1 y RF-2.2. NO facetas completas
- **Tiempo estimado del agente**: 10–15 min

### Fase 3: Buscador facetado y grid de resultados
- **Dependencias**: Fase 2
- **Resultado verificable**: las facetas filtran en vivo con contadores; el grid muestra tarjetas conformes a RF-3.1; el ordenamiento funciona
- **Alcance**: SÍ RF-2.3 a RF-2.8 y RF-3.1. NO ficha de detalle
- **Tiempo estimado del agente**: 15 min

### Fase 4: Ficha de perfil
- **Dependencias**: Fase 3
- **Resultado verificable**: abrir una tarjeta muestra la ficha completa con las 4 dimensiones Neural-Grid, condiciones operativas y SLA, sin ningún dato identificable
- **Alcance**: SÍ RF-3.2 a RF-3.4. NO comparador
- **Tiempo estimado del agente**: 10–15 min

### Fase 5: "Mi equipo" y comparador
- **Dependencias**: Fase 4
- **Resultado verificable**: sumar y quitar perfiles actualiza el contador; el resumen muestra roles y fecha de inicio más temprana; el comparador enfrenta hasta 3 perfiles
- **Alcance**: SÍ RF-4 completo con persistencia en el navegador. NO persistencia en servidor
- **Tiempo estimado del agente**: 15 min

### Puerta de verificación — aplica a todas las fases de la cara cliente
- **Dependencias**: la fase que se esté cerrando
- **Resultado verificable**: los ocho criterios de §8.1 comprobados a 390 px y a 320 px, **y los ocho criterios de accesibilidad de §8.2**
- **Alcance**: SÍ verificación dentro de cada fase, antes de darla por terminada. NO una fase de «ajustes móviles» al final — eso convierte el requisito en deuda, y la deuda en algo que no se paga
- **Tiempo estimado del agente**: 5 min por fase

### Fase 6: Solicitud, confirmación y estados límite
- **Dependencias**: Fase 5
- **Resultado verificable**: el formulario valida obligatorios, muestra el resumen y llega a una confirmación que reencuadra hacia la alineación y el SLA; sin resultados, equipo vacío, acceso vencido y aterrizaje sin conjunto curado se comportan según §6.3 y §6.4
- **Alcance**: SÍ RF-5 simulado y todos los estados vacíos. NO envío real, NO HubSpot
- **Tiempo estimado del agente**: 15–20 min

### Fase 7: Panel de administración (CRUD simulado)
- **Dependencias**: Fase 6
- **Resultado verificable**: listado de inventario con estados, creación y edición de perfil, cambio de disponibilidad en dos clics, bloqueo de publicación sin consentimiento, vista previa de la ficha y bandeja de vigencia. Los cambios se reflejan de inmediato en la cara cliente del prototipo
- **Alcance**: SÍ RF-8.1 a RF-8.5, RF-8.7 y RF-8.8 simulados. NO autenticación real, NO carga masiva, NO auditoría
- **Tiempo estimado del agente**: 20 min
- **Cierre del prototipo Low-Fi**

### Fase 8: Control de acceso, persistencia y telemetría *(inicio del MVP)*
- **Dependencias**: Fase 7 y VoBo del prototipo
- **Resultado verificable**: enlace firmado real con expiración y revocación, inventario persistente escrito solo desde el panel, eventos de RF-7 emitidos
- **Alcance**: SÍ RF-1, RF-7, RF-8 completos. NO integración con CRM
- **Tiempo estimado del agente**: por estimar con Tecnología

### Fase 9: Integración con HubSpot
- **Dependencias**: Fase 8 y decisiones D-6 y D-7 cerradas
- **Resultado verificable**: una solicitud enviada crea el negocio en el pipeline, asociado a contacto y empresa existentes, con todas las propiedades, propietario asignado y notificación entregada. Una falla simulada deja la solicitud en cola de reintento con alerta
- **Alcance**: SÍ RF-9 completo. NO reportería avanzada
- **Tiempo estimado del agente**: por estimar con Tecnología

---

## Historias descartadas

Se conservan con su razón: la decisión de descartar es más útil que su ausencia.

- **HU-079** — Reconocer de un vistazo qué ha logrado un perfil (EP-003)
