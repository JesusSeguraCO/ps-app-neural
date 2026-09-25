---
artefacto: prd
slug: portal-people-service
producto: "Portal de Perfiles People Service (nombre de trabajo)"
modo: para-agentes
version: 4.10
estado: borrador-para-vobo
autor: Jesús Segura (Dirección de Mercadeo)
fecha: 2026-09-25
linea_de_servicio: People Service
---

# PRD — Portal de Perfiles People Service

> **Modo para-agentes.** El cuerpo declara el *qué* y el *por qué*; el **Anexo A** descompone el *cómo* en fases secuenciales ejecutables por un agente de construcción. El prototipo Low-Fi es el resultado verificable de las Fases 0–7.

> **Cambios v0.2:** el producto se reorienta a **expansión de cuentas activas** (no adquisición). Entra el **panel de administración de Talento Humano** al MVP. Entra la **integración con HubSpot** como destino de la solicitud. Objetivos, KPIs y fases reescritos en consecuencia.

> **Cambios v0.3:** cerradas **D-1** (identificación del perfil) y **D-4** (control de acceso). Ver §12.2. Ajustados RF-1, RF-3, RF-5 y RF-9 en consecuencia.

> **Cambios v0.4:** incorporado el boletín de caracterización de Talento Humano (21 perfiles, 10 categorías) como fuente del modelo de datos. Nuevo **Anexo B** con el mapeo campo a campo, la lista de lo que no cruza al portal y los campos faltantes. RF-5.1 adopta el cuestionario ya diseñado. Nuevo RF-3.7.

> **Cambios v0.5:** la trayectoria con clientes nombrados **sí** se publica (es dato del profesional, no de Trycore). Nuevo **B.6** con la evidencia requerida por cada dimensión Neural-Grid y la regla de sello sin evidencia. Nuevos RF-3.8 y RF-3.9.

> **Cambios v0.6:** confirmado con Talento Humano que **los tres filtros —seguridad, técnico y Neural Fit— son condición de entrada** de todo perfil publicado. Se eliminan los sellos por perfil. El estándar se declara una vez como propiedad del banco. Neural Speed queda como garantía de servicio. Nueva decisión D-10 sobre disponibilidad.

> **Cambios v0.7:** la validación técnica es universal en existencia y **heterogénea en forma según el rol**. Nuevo **B.8** con las modalidades de prueba, la rúbrica común, la estructura fija del reporte y la regla de no publicar el artefacto crudo. Nuevo RF-3.10.

> **Cambios v0.8:** el detalle de la validación se organiza en **tres niveles progresivos** y **nunca bloquea la publicación** de un perfil. Nuevo **B.9** con el mecanismo de carga asistida desde el artefacto. Nuevos RF-3.11, RF-8.10 y RF-8.11.

> **Cambios v0.9:** la modalidad de prueba pasa de derivarse del rol a **seleccionarse de un catálogo cerrado**, agrupado por familia. Cada opción trae su texto de cara al cliente ya escrito, de modo que un clic completa los niveles 0 y 1. Catálogo sembrado en B.8.1, **propuesto y pendiente de validar con Talento Humano**.

> **Cambios v1.0:** roadmap de v2 definido con siete líneas aprobadas. Nuevo **RF-10**: tarjeta de sondeo de demanda para equipos híbridos persona-agente, en el MVP. Nueva **D-11** sobre el umbral que dispara I+D. Canal de rectificación y revocación en los requisitos no funcionales.

> **Cambios v1.1:** el sondeo RF-10 se traslada de la pantalla de confirmación a **una tarjeta dentro del grid de descubrimiento**, con el mismo espacio y peso que un perfil (patrón de anuncio nativo). Se define el concepto de *espacio no-perfil* y sus reglas. El sondeo pasa de EP-005 a EP-002.

> **Cambios v1.2 — tras el documento de especificaciones funcionales (ingeniería inversa de LinkedIn Recruiter):**
> - **D-1 revertida**: se publican nombre y primer apellido. El código pasa al pie.
> - **Sello Neural-Grid visible** en la tarjeta, como marca única de estándar y no como cuatro dimensiones puntuadas.
> - Se incorporan cuatro elementos del documento: verificado contra autoreportado, chips de acceso rápido, autocompletado con conteo y vista agregada del pool.
> - El documento de especificaciones se adopta como **visión de plataforma**, no como alcance del MVP (§9.5). El conflicto del SLA se resuelve a favor de §2.4.

> **Cambios v1.3:** la **búsqueda semántica con léxico** sube a MVP (RF-2.6) y su vocabulario se administra desde el panel (RF-8.12). Nueva pestaña de **perfiles colocados y vencimientos** (RF-8.13). El sondeo RF-10 se reencuadra: no es talento apoyado por agentes, es **contratar un agente autónomo como unidad**.

> **Cambios v2.0 — Fase 2 de diseño, posterior al prototipo Low-Fi.** Tras mostrar el prototipo v1 y correr un benchmark de seis plataformas, la entrada del portal pasa de **facetas** a **instrucción interpretada**, aparece el **Perfil Objetivo** como especificación editable, y el camino del cero se vuelve ciudadano de primera. Todo el bloque nuevo vive en **§13**, con su grado de evidencia, su argumento en contra y su prueba de falsación. Ninguna de esas mejoras está validada con un cliente real todavía, y el PRD lo dice así.

> **Cambios v2.1:** **RF-14.1 (ranking por logro cuantificado) queda descartado** y **D-15 cerrada como «no procede»** — el dato no existe en la fuente, producirlo tiene costo operativo recurrente y es autoreportado por naturaleza. Su lugar lo ocupan las **tres competencias del Sello Personal** (RF-14.1 reescrito). Nuevo principio **RF-14.0**: el portal no inventa campos que Talento Humano no produce.

> **Cambios v2.2:** el Perfil Objetivo captura **dónde se necesita el perfil** (país y ciudad) cuando la modalidad es presencial o híbrida (RF-13.5). Se distingue explícitamente entre la **ubicación de la necesidad** —dato del cliente, sin costo— y la **ubicación del profesional** —dato del banco que hoy no existe (D-18)—. Entra **Presencial 100%** como modalidad de la necesidad.

> **Cambios v2.3:** el Perfil Objetivo **sube de nivel: de especificación de un perfil a especificación de un reto** (RF-13.6). Aparecen las **composiciones de referencia** construidas sobre proyectos realmente entregados (RF-14.7), en tono informativo y con su prueba de falsación. Nueva **D-19** sobre si Delivery puede sostener ese dato.

> **Cambios v2.4:** nueva **§14 — La bifurcación**, visión de producto a dos rutas (buscar perfil / armar el equipo por reto) con su secuencia causal, su disparador y lo que hay que preservar hoy para no cerrarla. Nuevo **RF-16.4**: el rol del Perfil Objetivo nace como lista.

> **Cambios v2.5:** el Perfil Objetivo pasa de campos libres a **panel de ajuste con opciones consecuentes** (RF-13.7): cada campo calcula sus opciones contra lo ya seleccionado en los demás, con el conteo real del banco. Se resuelve en dos niveles para no perder la demanda no cubierta.

> **Cambios v2.6:** **un solo motor de criterios** para el panel y los resultados (RF-13.8). Dentro de tecnologías vale **cualquiera**, no todas. **D-14 queda cerrada** sin umbral numérico: "lo más cercano" son los perfiles que fallan **exactamente un criterio**, y la tarjeta dice cuál.

---

## 1. Resumen ejecutivo

Un portal privado al que llegan **clientes que ya tienen perfiles contratados en People Service** y en cuyos proyectos Trycore ve espacio para crecer el equipo.

El recorrido no empieza en el portal: empieza en un correo especializado por cuenta que propone perfiles que hacen match con el proyecto que ese cliente está trabajando hoy. El enlace de ese correo viaja con parámetros que, una vez superado el control de acceso, dejan al usuario frente a **exactamente los mismos perfiles que vio en el correo** — y con libertad de ajustar filtros y descubrir otros por cuenta propia.

Desde ahí arma su equipo y envía una solicitud que **crea una oportunidad en el pipeline de HubSpot** del comercial dueño de la cuenta y abre la sesión de alineación con Delivery.

El producto tiene **dos caras**: la del cliente y la de Talento Humano, que administra el inventario publicado desde un panel propio. La segunda no es accesoria — un portal con perfiles desactualizados destruye más confianza de la que construye.

**En una frase:** convertir la curaduría manual que hoy vive en un correo en un recorrido navegable que termina en una oportunidad de negocio registrada.

---

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

## 6. Recorridos

### 6.1 Recorrido principal — "del correo curado al equipo armado"

```
Correo especializado por cuenta
  (perfiles que hacen match con el proyecto en curso del cliente)
   └─> Enlace con parámetros: cuenta + conjunto curado + contexto del proyecto
         └─> Control de acceso  (código, login u otro mecanismo — D-4)
               └─> Aterrizaje: los MISMOS perfiles del correo, presentados como selección
                     ├─> Abre ficha → lee evidencia Neural-Grid
                     ├─> "Sumar a mi equipo"
                     └─> "Ampliar la búsqueda" → todo el banco, filtros ajustables
                           └─> Vuelve a la selección curada en un clic
                                 └─> Revisa "Mi equipo": roles, fechas, modalidad
                                       └─> Declara contexto: proyecto, sector, inicio, duración
                                             └─> Envía solicitud
                                                   ├─> Oportunidad creada en HubSpot
                                                   ├─> Notificación a Comercial y Delivery
                                                   └─> Confirmación + agendamiento de alineación
```

### 6.2 Recorrido de Talento Humano — "mantener el banco vivo"

```
Ingreso autenticado al panel
   ├─> Crear perfil → atributos → registrar consentimiento → vista previa → publicar
   ├─> Actualizar disponibilidad  (acción más frecuente: debe costar 2 clics)
   ├─> Pausar perfil ya asignado a un proyecto
   ├─> Archivar perfil que salió del banco
   └─> Bandeja de vigencia: perfiles sin actualizar en 30 días
```

### 6.3 Recorridos secundarios

- **Reunión en vivo:** el comercial comparte pantalla, filtra y envía el enlace del estado actual al cliente.
- **Regreso:** el cliente vuelve al enlace y encuentra su equipo en borrador tal como lo dejó.
- **Aterrizaje sin conjunto curado:** enlace sin parámetros de selección (por ejemplo, desde la firma del comercial). Entra a una pregunta de encuadre —"¿Qué necesita tu proyecto?"— antes del grid.

### 6.4 Qué se toma prestado de cada referente

| Referente | Qué se adopta | Cómo se traduce a People Service |
|---|---|---|
| **Airbnb** | Filtrado que reordena resultados en vivo, sin recargar | Contadores por faceta que muestran cuántos perfiles quedan antes de aplicar |
| **Airbnb** | La tarjeta da confianza sin abrir el detalle | Rol, seniority, stack ancla, sector, disponibilidad. Sin foto, sin nombre |
| **Airbnb** | Colecciones curadas con una razón declarada | "Seleccionados para tu proyecto X" como bloque con identidad propia, separado del descubrimiento |
| **Airbnb** | Escasez honesta y disponibilidad como eje | "Disponible desde el 6 de octubre". Nunca escasez inventada |
| **Airbnb** | Wishlist antes de comprometerse | "Mi equipo" — carrito de roles, no de personas |
| **Airbnb** | *Request to book* en vez de compra inmediata | "Enviar solicitud de equipo" → abre alineación, no cierra venta |
| **LinkedIn Recruiter** | Facetas combinables con lógica clara | Rol · Seniority · Stack · Sector · Modalidad · Disponibilidad |
| **LinkedIn Recruiter** | Proyectos como contenedor de búsqueda | "Mi equipo" persiste por cuenta y admite varios requerimientos |
| **LinkedIn Recruiter** | Comparación lado a lado | Comparador de hasta 3 perfiles con criterios homogéneos |
| **Recomendación propia** | La evidencia sustituye a la foto | Las 4 dimensiones Neural-Grid como sellos verificables en cada ficha |
| **Recomendación propia** | El estado vacío vende | Sin resultados → "Este perfil no está en el banco hoy. En 10 días hábiles podemos tenerlo" + solicitud de perfil a medida |
| **Recomendación propia** | El cliente ya está adentro: usarlo | La ficha puede referenciar que el estándar es el mismo que ya tiene trabajando en su equipo. Es el argumento más corto que existe para esta audiencia |

---

## 7. Requisitos funcionales

### RF-1 · Acceso y sesión
- **RF-1.1** El enlace del correo viaja con parámetros que identifican cuenta, contacto, conjunto curado y contexto del proyecto.
- **RF-1.2 · Acceso del cliente: enlace firmado más correo invitado.** Al abrir, el portal pide el correo; si está en la **lista de correos invitados del enlace** (RF-1.2.7), envía a ese buzón un código de un uso desde el correo saliente del portal (§8.3). Un correo que no está en la lista no entra, aunque sea de la misma empresa. Sin registro, sin contraseña, una vez por dispositivo. *(D-4 revisada el 2026-09-25.)*
  - **RF-1.2.1 · Por qué cambió respecto de la primera resolución.** D-4 se cerró sin código cuando los perfiles **no llevaban nombre**: lo que se filtraba era un banco anonimizado. Tras revertirse D-1, el enlace expone **la lista nominal del talento de Trycore con su trayectoria**. Cambió el contenido, así que cambió el cálculo del riesgo.
  - ~~**RF-1.2.2 · Por qué la verificación es por dominio y no un código al contacto original.**~~ *Sustituido el 2026-09-25 por RF-1.2.11.* Un código enviado solo a quien recibió el correo **rompe el reenvío interno**, que es deseable: el líder técnico se lo pasa a su arquitecto. La verificación por dominio deja entrar a cualquiera de la empresa del cliente y corta el reenvío hacia afuera.
  - **RF-1.2.3 · Lo que no sirve.** Un código estático incluido en el mismo correo que el enlace: quien tiene el enlace tiene el código. Es fricción con ganancia nula.
  - **RF-1.2.4 · Beneficio adicional.** Hoy solo se sabe quién es el visitante si llega a enviar la solicitud. Con verificación al entrar se sabe desde el primer momento, que es lo que RF-7.3 y el informe del correo necesitan.
  - **RF-1.2.5** El mensaje de la puerta explica la razón —*los perfiles incluyen nombre y trayectoria de profesionales reales*—. Una fricción explicada construye marca; una fricción muda la destruye.
  - **RF-1.2.6 · Sin proveedor de identidad.** El control completo —firma del enlace, lista de correos invitados, código, vigencia y revocación— lo resuelve el propio portal en el hosting (§8.3). No se instala ningún sistema de identidad externo (Keycloak, OAuth o similar).
  - **RF-1.2.7 · Los correos invitados los declara quien genera el enlace.** Uno o varios por enlace. Por omisión se propone el contacto del envío en HubSpot; Talento Humano lo confirma o añade a otras personas de la cuenta. Cada invitado queda registrado con el enlace (RF-19.5).
  - **RF-1.2.8 · Descartado: un código temporal generado por Talento Humano y enviado junto al enlace.** Es el caso de RF-1.2.3: quien tiene el correo tiene el enlace y el código, así que no aporta nada. El código que protege es el que llega **al buzón que la persona escribe**, porque prueba que lo controla.
  - **RF-1.2.10 · Invitar a un colega.** Un invitado puede pedir desde el portal que se invite a otra persona, indicando su correo. La petición llega a Talento Humano, que la aprueba añadiendo ese correo al enlace, o la rechaza. **El acceso no se concede sin esa aprobación.** Así la segunda opinión del arquitecto sigue siendo posible, sin que el enlace sea una llave que abre a quien lo tenga.
  - **RF-1.2.11 · Por qué lista nominal y no dominio** (decisión del sponsor, 2026-09-25). El portal muestra nombre y trayectoria de profesionales reales: cada persona que los ve debe estar invitada con nombre propio. Reenviar el enlace no da acceso; el colega entra por RF-1.2.10. *Costo aceptado:* el reenvío interno deja de ser inmediato y pasa a requerir una aprobación de Talento Humano.
  - **RF-1.2.9** El intento de código tiene límite por enlace y por dirección —cinco intentos, luego espera— y el punto de entrada va detrás del límite de peticiones de Cloudflare (§8.3). Un código de seis dígitos sin límite se adivina.
- **RF-1.3** Superado el control, el portal saluda por cuenta y muestra el conjunto curado del correo, sin pasos intermedios.
- **RF-1.4** Acceso revocable y con vigencia configurable. Vencido → pantalla de renovación con contacto, nunca error crudo.
- **RF-1.5** `noindex`, `nofollow` y exclusión de rastreadores en todo el portal.
- **RF-1.6** El enlace se genera desde el envío de correo con los tokens de personalización de la cuenta, sin construcción manual de URLs.
- **RF-19 · Enlaces curados.** Talento Humano selecciona perfiles para una cuenta y genera un enlace. Especificación completa en `docs/10-specs/enlaces-curados.md`.
  - **RF-19.1 · El enlace lleva la lista de códigos, no filtros.** Una selección heterogénea —un gerente, un desarrollador y un QA— **no se puede expresar con ningún filtro**: cualquiera que incluya a los tres incluye a muchos más. Los filtros sirven para la ruta de descubrimiento; la curaduría es una lista.
  - **RF-19.2 · Reevaluación al abrir.** El portal resuelve el estado real de cada código en el momento de abrirse. **Nunca omite un perfil en silencio**: el que cambió aparece con su estado —colocado hasta tal fecha, pausado, fuera del banco—. Un hueco silencioso se lee como desorden; un cambio explicado se lee como control.
  - **RF-19.3 · Dueño: Talento Humano**, que es quien conoce la disponibilidad y administra el inventario. *Coordinación necesaria:* la razón de la selección requiere el contexto del proyecto, que lo tiene el ejecutivo comercial.
  - **RF-19.4 · No se emite sin razón declarada.** Es lo que separa una curaduría de un catálogo. Tampoco sin cuenta destinataria, sin **correos invitados** (RF-1.2.7), sin vigencia, ni con perfiles que no estén publicados.
  - **RF-19.5 · Cada enlace es un objeto con registro**: quién lo generó, para qué cuenta, qué contenía, aperturas y revocación. Sin ese registro, cuando un cliente diga «ustedes me mostraron a Fulano» nadie podría verificarlo.
  - **RF-19.6 · Revocable.** Un enlace revocado lleva a una pantalla que explica cómo pedir uno nuevo, no a un error.
  - **RF-19.7** Si la selección mezcla familias, **el Perfil Objetivo arranca vacío**: no hay rol común entre un gerente y un QA, y deducir uno sería inventar.
  - **RF-19.8** Por encima de unas decenas de perfiles, la lista viaja como **token que resuelve del lado del servidor**, no como códigos en la dirección.

### RF-2 · Curaduría, búsqueda y filtrado
- **RF-2.1** El conjunto curado se presenta como bloque con identidad y razón declarada, diferenciado visualmente del resto del inventario.
- **RF-2.2** "Ampliar la búsqueda" abre el banco completo sin destruir el conjunto curado; se vuelve a él en un clic.
- **RF-2.3** Facetas mínimas: Rol · Categoría · Seniority · Stack/Tecnología · Sector de experiencia · Modalidad · Disponibilidad.
- **RF-2.4** Filtros combinables, con contador por opción. Cada filtro activo se muestra como **etiqueta removible** sobre los resultados, de modo que el usuario siempre sabe si está ampliando o cerrando la búsqueda.
- **RF-2.5** Todo el estado —conjunto curado y filtros— se refleja en la URL, es compartible y pre-cargable. Requisito duro.
- **RF-2.6** **Búsqueda en el lenguaje del cliente, no en el nuestro.** Un modelo de lenguaje traduce la instrucción del cliente a la taxonomía interna, con salida estructurada y bajo las restricciones de RF-16. Si la llamada falla, degrada a un **léxico controlado** que traduce cómo el cliente nombra lo que busca —"ingeniero de aplicaciones móviles"— a la taxonomía interna —rol *Desarrollador Móvil*, tecnologías *Flutter, React Native, Kotlin, Swift*—. Tolerante a acentos, plurales y errores de digitación.
  - **RF-2.6.1** Los resultados se presentan en dos niveles: **coincidencias directas** y **relacionados**. Un buscador que devuelve cero ante un casi-acierto es peor que no tener buscador: el cliente concluye que no hay nada cuando sí hay algo cercano.
  - **RF-2.6.2** El portal **muestra cómo interpretó la consulta** —qué rol y qué tecnologías entendió— para que el usuario corrija en lugar de adivinar por qué salió lo que salió.
  - **RF-2.6.3** Toda consulta sin coincidencia directa se registra con su texto literal (RF-7.2). Con texto libre esta señal es mucho más rica que con facetas: revela con qué palabras piensa el cliente, no solo qué casilla marcó.
  - **RF-2.6.4 · Sin índice semántico ni vectorial.** El hosting no los soporta (§8.3) y el banco no los necesita: con decenas de perfiles, la recuperación determinista sobre el catálogo completo cabe en el navegador y cumple el segundo de respuesta. Lo «semántico» vive en la interpretación del modelo y en el léxico, no en el índice.
- **RF-2.7** Ordenamiento: relevancia (default) · disponibilidad más próxima · seniority.
- **RF-2.8** Estado sin resultados con salida activa (ver §6.4).
- **RF-2.9** **Chips de acceso rápido**: segmentos de un clic que evitan armar filtros manualmente — disponibilidad inmediata, experiencia en el sector de la cuenta, recomendados para el último requerimiento. *(v1.1)*
- **RF-2.10** El **autocompletado muestra el conteo por sugerencia** —"Python · 38 perfiles"— para que el usuario calibre si su criterio es muy amplio o muy estrecho antes de aplicarlo. *(v1.1)*
- **RF-2.11** **Vista agregada del conjunto de resultados**: distribución por rol, seniority, stack y sector, para entender de un vistazo qué tan profundo es el banco en lo que se está buscando sin abrir perfil por perfil. Del lado interno es la materia prima del reclutamiento inverso (V2-1).

### RF-3 · Tarjeta y ficha de perfil
- **RF-3.1** La tarjeta muestra **nombre y primer apellido** del profesional (D-1 revertida), con la **capacidad como descriptor inmediato** —rol, seniority y anclaje de experiencia— y debajo 3–5 tecnologías ancla, sector, modalidad y **disponibilidad expresada como banda de arranque** (D-10, RF-3.13). Incluye el **sello Neural-Grid** en la forma definida por RF-3.8. Sin foto.
- **RF-3.2** La ficha muestra: resumen del perfil, experiencia demostrable con clientes y escala, competencias del Sello Personal, formación general, stack, y **el contenido concreto de las tres validaciones de entrada de ese perfil** —tipo de prueba, alcance y fecha— presentado como evidencia, no como insignia. Cierra con condiciones operativas, SLA y la garantía de servicio (Anexo B.6).
- **RF-3.3** Se publican **nombre y primer apellido**. **No se publican**: fotografía, correo, teléfono, perfiles en redes, ni hoja de vida en ningún formato. La ficha mantiene visible que **la conversación sobre este profesional va por Trycore y que no hay vía de contacto directo desde el portal**.
  - **RF-3.3.1 · El portal no declara la relación laboral del profesional con Trycore** (D-10). No dice si es empleado, contratista o parte de la red extendida, ni lo insinúa con etiquetas. Lo que la ficha sostiene es la **representación comercial** —Trycore responde por este perfil y lo pone a disposición—, que es lo que el cliente necesita saber y lo único que el banco puede respaldar de forma uniforme.
  - **RF-3.3.2** La barrera de contacto directo **no depende del vínculo**: se sostiene por sí sola. Retirar la afirmación laboral no debilita RF-3.3, porque lo que protegía era el canal, no la relación.
- **RF-3.13 · La disponibilidad se publica como banda de arranque, nunca como fecha** (D-10). El cliente ve **Inmediato · 1 semana · 2 semanas · 1 mes · Más de 1 mes**, derivado de la fecha que Talento Humano carga en el panel.
  - **RF-3.13.1 · La fecha vive en el panel y no sale de él.** RF-8.13 la necesita para los vencimientos y RF-8.14 para la coherencia entre estado y disponibilidad. El portal la traduce en el momento de mostrarla, de modo que la banda **se recalcula sola** y no envejece como envejece una fecha escrita.
  - **RF-3.13.2 · La banda se calcula contra la fecha del día, no contra la del envío.** Un perfil que decía «1 semana» cuando se armó el correo y hoy está libre, hoy dice «Inmediato». Es la misma regla de reevaluación al abrir de RF-19.2.
  - **RF-3.13.3** Una disponibilidad vencida y sin actualizar no produce «Inmediato»: produce **«Por confirmar»** (RF-8.14.4). La banda no puede convertir un dato que nadie sostiene en una promesa.
  - **RF-3.13.4 · Un solo lenguaje de disponibilidad para todo el banco.** La banda aplica a todos los perfiles publicados por igual. Dos lenguajes distintos harían visible en la tarjeta una distinción que D-10 decidió no comunicar.
- **RF-3.4** Cada afirmación de la ficha tiene respaldo verificable en el inventario cargado por Talento Humano. Nada generado ni inferido.
- **RF-3.5** El código de referencia (p. ej. `BE-SR-014`) **nunca es título ni protagonista visual**. Vive al pie de la ficha, en letra pequeña, con el peso de un número de requisición. Existe para citar el perfil en una conversación o en el comparador, no para etiquetar a nadie.
- **RF-3.8 · No hay insignia Neural-Grid por perfil.** *(Decisión revertida el 2026-09-16, volviendo a la resolución de la v0.6.)* Un atributo que cumplen **todos** los perfiles publicados no discrimina, y repetirlo en cada tarjeta enseña al ojo a ignorarlo.
  - **Razón adicional que no existía en la primera resolución:** la tarjeta ya tiene de qué diferenciar. Las tres competencias verificadas, la evidencia criterio por criterio (RF-13.10) y el conteo de deseables (RF-13.9.3) compiten por la misma atención. Cuando se quitó el sello la primera vez, la tarjeta quedaba escueta; hoy el sello es ruido sobre contenido que sí discrimina.
  - El estándar se declara **una vez, arriba, como condición de entrada** (RF-6.4), y ahí pesa más que fragmentado en veintitrés insignias idénticas.
  - Lo que sí vive en cada ficha es el **contenido** de las validaciones —modalidad de prueba, qué se pidió, qué entregó, fecha—, que es información y no medalla.
  - **Prohibido** mostrar las cuatro dimensiones con estado o puntaje por perfil. Tres son condición de entrada —marcarlas sugiere una diferencia que no existe— y Neural Speed no aplica a los perfiles no vinculados, de modo que un indicador por dimensión afirmaría algo falso.
  - El desglose de las tres validaciones vive en la ficha (RF-3.2), donde sustancia en lugar de competir.
  - La declaración de condición de entrada del encabezado (RF-6.4) se mantiene: el sello la recuerda, no la reemplaza.
- **RF-3.12** La ficha **distingue de forma explícita lo verificado por Trycore de lo autoreportado por el profesional**. Trayectoria, formación y stack son declarados por la persona; las validaciones de seguridad, técnica y DISC son ejecutadas por Trycore. La distinción se marca visualmente, no en letra pequeña: es la respuesta a la pregunta que hace todo comprador escéptico —¿esto lo comprobaron o me lo están contando?— y es el complemento honesto del bloque de validación.
- **RF-3.11** El detalle de la validación vive en un **bloque expandible dentro de la ficha**, nunca en un tooltip —el hover no existe en móvil y el correo se abre mayoritariamente en móvil— y nunca en la tarjeta, donde repetido en cada resultado volvería a ser la insignia decorativa que RF-3.8 elimina.
- **RF-3.10** La validación técnica se presenta con **estructura fija de cinco campos** (Anexo B.8), cualquiera sea la modalidad de prueba del rol. Nunca aparece vacía, nunca dice "no aplica" y nunca enlaza el artefacto crudo —repositorio, entregable— porque identifica al profesional y porque lo que Trycore vende es el dictamen, no el insumo.
- **RF-3.9** La Experiencia Clave nunca se presenta como Grid Técnico. La experiencia es trayectoria del profesional; el Grid Técnico es validación ejecutada por Trycore. Mezclarlas vacía la dimensión más diferenciadora del estándar.
- **RF-3.7** Ningún campo de la lista negra del Anexo B llega al portal, ni siquiera en forma resumida o parafraseada. El panel de administración no ofrece dónde escribirlos.
- **RF-3.6** La calidez la carga la prosa de la trayectoria, escrita en voz humana. Prohibido el registro de inventario al describir experiencia: "unidad", "ítem", "disponible para asignación", "stock".

### RF-4 · "Mi equipo"
- **RF-4.1** Sumar y quitar perfiles a una selección persistente por cuenta.
- **RF-4.2** Indicador siempre visible con el conteo, accesible desde cualquier pantalla.
- **RF-4.3** Vista de resumen: perfiles seleccionados, roles cubiertos y fecha de inicio más temprana posible del conjunto.
- **RF-4.4** Comparador de hasta 3 perfiles con los mismos criterios en paralelo.
- **RF-4.5** La selección sobrevive al cierre del navegador dentro de la vigencia del acceso.

### RF-5 · Solicitud de equipo
- **RF-5.1** Formulario con las tres preguntas ya validadas por Talento Humano, en opciones cerradas, más sector y notas libres:
  - *¿Para qué iniciativa o proyecto requieren el apoyo de este perfil?* → Proyecto nuevo o nueva célula de desarrollo · Refuerzo o reemplazo en un equipo existente · Exploración preliminar o presupuestación a futuro
  - *¿Cuándo estiman que debería incorporarse el talento?* → Inmediata (1 a 15 días) · Corto plazo (dentro del mes actual) · Mediano plazo (próximo mes o trimestre)
  - *¿Por cuánto tiempo estiman la vinculación o dedicación inicial?* → 3 a 6 meses · 6 a 12 meses · Más de 12 meses o indefinido · Tiempo parcial u horas por bolsa
- **RF-5.2** Datos de contacto y cuenta pre-llenados desde los parámetros del enlace; editables.
- **RF-5.3** Resumen de confirmación antes de enviar, con el equipo completo a la vista.
- **RF-5.4** Al enviar: confirmación que explica el paso siguiente —sesión de alineación— y el SLA de 10 días hábiles, y ofrece agendar.
- **RF-5.5** El envío nunca se comunica como reserva, contratación ni bloqueo de disponibilidad.
- **RF-5.6** Quien envía puede no ser el contacto que recibió el correo. El formulario permite identificarse —nombre, cargo, correo corporativo— y esa identificación es la que viaja al CRM.

### RF-6 · Contenido de encuadre
- **RF-6.1** Encabezado breve que explica el estándar Neural-Grid antes del primer resultado, sin bloquear la exploración.
- **RF-6.2** El SLA de 10 días hábiles es visible en el recorrido, no en la letra pequeña.
- **RF-6.3** Bloque de respaldo: Trycore University, Hive Mind y Coordinación de Servicio dedicada.
- **RF-6.4** **Declaración de condición de entrada**, visible antes del primer resultado y con autoridad: ningún perfil llega al portal sin verificación de identidad bajo SARO, prueba técnica en vivo y evaluación DISC. Se enuncia una vez, no se repite por tarjeta.
- **RF-6.5** **Garantía de servicio (Neural Speed)**, enunciada como propiedad del servicio y nunca como atributo de la persona: el talento que entra al proyecto trabaja con agentes de IA desde el día 1 y con línea directa al CoE. Donde exista evidencia previa del perfil en IA aplicada, se muestra como parte de su experiencia.

### RF-7 · Telemetría
- **RF-7.1** Eventos: entrada, filtros aplicados, ampliación de búsqueda, fichas abiertas, perfiles sumados y retirados, comparaciones, solicitud iniciada, solicitud enviada, abandono.
- **RF-7.2** Reporte de filtros más usados y de búsquedas sin resultados — insumo directo para decidir qué perfiles reclutar.
- **RF-7.3** Atribución de cada sesión a la cuenta, al contacto y al envío de correo que la originó.
- **RF-7.4** Distinguir interacción con el conjunto curado frente a interacción por descubrimiento. Mide si la curaduría acierta.

### RF-8 · Panel de administración (Talento Humano)
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
- **RF-8.7** Vista previa exacta de la ficha antes de publicar.
- **RF-8.8** Bandeja de vigencia: perfiles sin actualización en más de 30 días, marcados para revisión.
- **RF-8.9** Registro de auditoría: qué cambió, quién y cuándo.
- **RF-8.10** **La publicación de un perfil nunca se bloquea por falta del reporte detallado de validación.** Basta el Nivel 0 (Anexo B.9), que se deriva del rol sin intervención. El detalle enriquece la ficha cuando existe.
- **RF-8.16 · Catálogos paramétricos.** Roles, familias, tecnologías, sectores, modalidades de prueba y motivos de pausa **se administran desde el panel**, no viven en el código.
  - **RF-8.16.1 · El criterio de qué es paramétrico.** Es administrable **lo que cambia sin que cambie el producto**. Que Talento Humano agregue una modalidad de prueba no es un cambio de producto. Que "lo más cercano" sea fallar exactamente un criterio sí lo es: eso es lógica, y ponerlo en una pantalla de ajustes invita a que alguien lo toque sin saber qué rompe. **Quedan fuera**: los bloqueos por consentimiento, la prohibición de publicar por importación, el contrato del modelo y el umbral del sondeo, que es un experimento con fecha y no un parámetro operativo.
  - **RF-8.16.2 · Crear un valor es un acto deliberado, no el efecto secundario de escribir.** En el editor de perfiles, tecnologías, sectores y rol **se seleccionan del catálogo**. Nunca texto libre: el texto libre construye la taxonomía por tecleo, y «Figma», «figma» y «Fgima» se vuelven tres tecnologías distintas que contaminan los filtros para siempre.
  - **RF-8.16.3 · Detección de parecidos antes de crear.** Al escribir un valor que no existe, el sistema muestra los existentes que se le parecen —por distancia de edición y por contención— y ofrece usarlos. Crear queda disponible, pero después de haber visto la alternativa.
  - **RF-8.16.4 · Los catálogos tienen dependencias y el panel las encadena.** Un rol exige familia; la familia determina qué modalidades de prueba se le ofrecen. **Una familia sin modalidades de prueba impide publicar** cualquier perfil de esa familia, y el panel lo advierte al crear el rol, no después.
  - **RF-8.16.5 · Un valor en uso no se borra: se desactiva.** Desactivar impide elegirlo en perfiles nuevos; los que ya lo tienen lo conservan. Borrar una modalidad que cinco perfiles referencian dejaría sus fichas sin el texto que explica cómo se validaron. **No existe la acción de borrar, y es a propósito.**
  - **RF-8.16.6 · Fusión de duplicados.** Dos valores que son el mismo se fusionan, y el cambio se aplica a todos los perfiles que los usan. Sin esto, cualquier error de tecleo es permanente.
  - **RF-8.16.7 · La relación entre rol y tecnologías no se declara.** Emerge de los perfiles reales y el panel de ajuste del cliente la calcula (RF-13.7). Declararla a mano sería trabajo doble que se desactualiza. Para un rol recién creado sin perfiles, se ofrece el catálogo completo.
  - **RF-8.16.8** Agregar una modalidad de prueba **exige redactar su texto de cara al cliente en ese momento**. Sin texto no hay opción.
- **RF-8.12** **El léxico de búsqueda se administra desde el panel.** Términos del cliente, sinónimos y su equivalencia en rol, tecnología o sector. Si vive en el código, en seis meses está desactualizado. Las consultas sin coincidencia se ofrecen como candidatas a incorporar al léxico o a la agenda de reclutamiento.
- **RF-8.14 · Coherencia entre estado y disponibilidad.** Son **dos ejes distintos** y el panel no debe permitir que se contradigan.
  - **RF-8.14.1** El **estado** responde si el perfil puede mostrarse: *borrador* (incompleto o sin consentimiento), *publicado*, *pausado*, *archivado*. La **disponibilidad** responde desde cuándo puede empezar, y **se captura como fecha en el panel aunque el portal la publique como banda** (RF-3.13). Confundirlos lleva a usar el estado para expresar fechas, que es lo que produjo la regla equivocada de RF-8.13.2.
  - **RF-8.14.2** **Pausar exige motivo**, elegido de una lista corta: en proceso de selección con otro cliente, en licencia o ausencia temporal, decisión de Talento Humano. **Si el motivo es una fecha, no es una pausa**: es disponibilidad, y el perfil debe quedar publicado con la fecha correcta.
  - **RF-8.14.3** El panel **señala las incoherencias en la propia fila**, con la acción que las corrige en un clic. Incoherencias de severidad alta impiden publicar; las medias se advierten sin bloquear.
  - **RF-8.14.4** **Una disponibilidad vencida y sin actualizar no se afirma.** Si la fecha ya pasó y el perfil lleva más de 30 días sin tocarse, el portal muestra **«Disponibilidad por confirmar»** en lugar de «Disponible ahora». Afirmar disponibilidad con base en un dato que nadie sostiene es la forma más silenciosa de perder credibilidad con una cuenta activa.
- **RF-8.13** **Pestaña de perfiles colocados**, con la cuenta, la fecha de inicio y la de vencimiento, ordenada por proximidad del vencimiento y destacando los que vencen dentro de 60 días.
  - **RF-8.13.1** Es **espejo de solo lectura**. La fuente de verdad vive en el sistema de asignación; el panel muestra la fecha de corte del último sincronizado y lo marca como tal. Duplicar una fuente de verdad sin declararlo es cómo un dato desactualizado termina sosteniendo una decisión. **La sincronización es periódica, nunca en tiempo real** —tarea programada diaria o importación del archivo que el sistema de asignación exporte—, porque el hosting no sostiene conexiones permanentes con sistemas internos (§8.3).
  - **RF-8.13.2** **Un perfil colocado no se oculta: se ofrece para cuando queda libre.** Permanece *publicado* con su disponibilidad igual a la fecha de fin de la asignación. Ocultarlo esconde inventario que sí es vendible —un perfil que arranca en un mes es información útil para un cliente que planea el trimestre siguiente, y así se lo muestra el portal según RF-3.13— y con un banco de decenas, ocultar cuatro perfiles es caro. *Corrige la redacción anterior de este requisito, que forzaba el estado pausado.*
  - **RF-8.13.3** Esta pestaña es el disparador operativo de la renovación anticipada (V2-2): convierte un dato administrativo en una lista de conversaciones comerciales con fecha.
- **RF-8.11** Talento Humano puede **adjuntar el artefacto de evidencia tal como lo tenga** —documento, repositorio o transcripción— y el sistema propone un borrador de los campos descriptivos para su revisión. El artefacto se almacena internamente y nunca se expone en el portal (B.8.4).
  - **RF-8.11.1 · Formatos y límites (§8.3).** **El proyecto no opera con video.** La evidencia es un documento, una transcripción en texto o el enlace a un repositorio. El archivo se guarda **fuera de la carpeta pública**, con un máximo de 64 MB por archivo, y el borrador se genera a partir de ese texto.

### RF-9 · Integración con HubSpot
- **RF-9.1** Al enviar la solicitud se crea un negocio en el **pipeline propio de la línea People Service** (D-6), en su etapa de entrada.
  - **RF-9.1.1** El negocio lleva una propiedad de **origen** que distingue lo que entra por el portal de lo que entra por gestión comercial. Sin ella, el pipeline propio impide comparar el rendimiento del portal contra los demás orígenes de la línea, que es el KPI de §11.
  - **RF-9.1.3** El negocio lleva una **propiedad de fecha de alineación agendada**. Al usar las etapas del pipeline comercial (D-21), la sesión de alineación no tiene etapa propia y sin este dato **O3 no se puede medir**: no habría forma de ver cuántas solicitudes mueren entre que llegan y que la sesión ocurre. Una propiedad de fecha resuelve la medición sin obligar a nadie a aprender un juego de etapas nuevo.
  - **RF-9.1.2** Un pipeline aparte significa que el comercial tiene que mirar en dos sitios. La notificación de RF-9.5 deja de ser una cortesía y pasa a ser el mecanismo que evita que una solicitud se quede sin ver.
- **RF-9.2** El negocio se asocia al contacto y a la empresa existentes. Nunca se duplican registros. **Si la cuenta ya tiene un negocio abierto, se crea uno nuevo y se asocia como relacionado** (D-7): actualizar el existente conservaría un solo registro pero borraría la atribución de origen, y sin origen el portal no se puede medir. Si quien solicita es una persona nueva dentro de una empresa conocida —consecuencia directa de D-4—, se crea el contacto y se asocia a la empresa existente; jamás se crea una empresa duplicada.
- **RF-9.3** Propiedades del negocio: perfiles solicitados, roles, sector, fecha de inicio deseada, duración, modalidad, campaña y correo de origen.
- **RF-9.4** El resumen completo de la solicitud queda en la línea de tiempo del contacto.
- **RF-9.5** El propietario del negocio se asigna según el propietario de la cuenta. Notificación a Comercial y a Delivery.
- **RF-9.7 · Notificación con escalamiento.** Con pipeline propio (D-6), el comercial no ve la solicitud por casualidad: la notificación es lo único que evita que exista y nadie la atienda.
  - **RF-9.7.1** Al enviarse una solicitud se notifica **al propietario de la cuenta y a Coordinación de Servicio**, por el canal de trabajo diario del equipo, no solo por correo.
  - **RF-9.7.2** La notificación trae lo necesario para decidir sin abrir el CRM: cuenta, quién solicita, perfiles o especificación, momento de incorporación y enlace al negocio.
  - **RF-9.7.3 · Escalamiento.** Si nadie abre el negocio en **4 horas hábiles**, se reenvía a la dirección comercial. A las **24 horas hábiles** sin movimiento de etapa, se escala a Dirección General. Un punto único de falla sin escalamiento no es un mecanismo: es una esperanza. *Mecanismo:* una tarea programada cada quince minutos compara los plazos en horas hábiles contra el estado del negocio en HubSpot. Es lo que obliga a activar las tareas programadas del hosting desde la v1 (§8.3).
  - **RF-9.7.4** El tiempo entre la notificación y la primera apertura del negocio se registra. Es la métrica que dice si el mecanismo funciona, y sin ella el escalamiento se calibra a ciegas.
- **RF-9.6** Si la creación falla, la solicitud no se pierde: cola de reintento y alerta al responsable. Ninguna solicitud puede quedar solo en el portal.
  - **RF-9.6.1 · La cola es una tabla, no un servicio.** El hosting no admite colas de trabajo ni procesos permanentes (§8.3). La solicitud se guarda primero en la base de datos y después se envía a HubSpot. Si falla, queda marcada como pendiente y una tarea programada la reintenta cada cinco minutos con espera creciente. Al tercer fallo se avisa por correo al responsable, sin dejar de reintentar. Guardar antes de enviar es lo que garantiza que ninguna solicitud dependa de que HubSpot responda en ese segundo.
  - **RF-9.6.2 · Vigilancia de la tarea.** Si la tarea de reintento o la de escalamiento lleva más del doble de su intervalo sin ejecutarse, se avisa por correo al responsable técnico. Una cola que nadie procesa es otra forma de que la solicitud se quede solo en el portal.

### RF-17 · Traspaso a Delivery
El producto no termina cuando se envía la solicitud: termina cuando alguien del lado de Trycore la convierte en una sesión agendada. Hoy O3 mide los días hasta esa sesión sin que nadie tenga asignado provocarla.
- **RF-17.1** Coordinación de Servicio recibe **la especificación estructurada completa**, no un resumen: reto declarado, rol, seniority, tecnologías, sector, modalidad, ubicación de la necesidad, perfiles seleccionados y si el cliente revisó o no su especificación.
- **RF-17.2** La solicitud llega con **un responsable nominal asignado**, no a una bandeja compartida. Una bandeja sin dueño es una bandeja sin lector.
- **RF-17.3** El responsable **agenda la sesión de alineación en un plazo definido** desde la solicitud. Ese plazo es el numerador de O3 y debe estar acordado con Delivery, no supuesto.
- **RF-17.4** Al agendar se escribe la **fecha de alineación** en el negocio (RF-9.1.3). Sin ese dato, O3 no existe.
- **RF-17.5** Si la solicitud llega con especificación incompleta —el cliente no abrió el Perfil Objetivo—, la sesión se prepara igual: la especificación inferida viaja marcada como no revisada, y eso es información para quien la conduce, no un impedimento.

### RF-18 · Correo curado
Es la fuente de todo el tráfico del portal y hasta ahora vivía en el PRD como supuesto. Especificación completa en `docs/10-specs/correo-curado.md`.
- **RF-18.1** Cada envío lleva una **selección de perfiles construida para esa cuenta** contra el proyecto que Trycore sabe que tiene en curso, con su razón declarada. No es un boletín con el mismo contenido para todos.
- **RF-18.2** El enlace se genera **desde el envío**, con los tokens de personalización de la cuenta y del contacto. Nadie construye URLs a mano.
- **RF-18.3** La selección se arma **desde el panel**, no en una hoja aparte: quien la arma ve la disponibilidad real en ese momento y no propone perfiles que ya no están.
- **RF-18.4 · La curaduría se genera contra el inventario del momento del envío.** Una selección fija se degrada entre que se arma y que el cliente abre el correo, y el cliente encuentra menos perfiles de los que le prometimos.
- **RF-18.5** Cadencia definida y **dueño nominal** del envío. Un canal sin cadencia no produce el hábito que O5 necesita.
- **RF-18.6** Se registra apertura, clic y entrada al portal, atribuidos a cuenta y contacto (RF-7.3). Una cuenta que **nunca abre en tres envíos** es una señal comercial, no un fallo de entregabilidad: se escala al ejecutivo antes de seguir enviando.

### RF-10 · Sondeo de demanda (contratación de agentes autónomos)
- **RF-10.1** El sondeo se presenta como una **tarjeta dentro del grid de resultados**, con el mismo espacio y peso que una tarjeta de perfil, al modo del anuncio nativo. La ubicación en el grid maximiza el alcance: la pantalla de confirmación solo la vería quien envía solicitud, y con el universo actual de cuentas eso no produce datos suficientes para decidir.
- **RF-10.2** **Nunca dentro del conjunto curado.** Solo aparece en el grid de descubrimiento, después de ampliar la búsqueda. Insertar una tarjeta que no es un perfil dentro de la selección hecha para esa cuenta rompe la resolución de §2.5.
- **RF-10.3** **Nunca con menos de 8 resultados visibles (D-12).** Por debajo de ese número, la tarjeta no se muestra: con inventario escaso se lee como relleno y sugiere que no hay perfiles. El patrón de anuncio nativo funciona con inventario abundante; este banco no lo es.
- **RF-10.4** **Una vez por sesión, en posición fija, descartable de forma persistente.** No se repite al desplazarse, no reaparece al cambiar filtros y no vuelve en visitas siguientes si el usuario ya votó o la descartó.
- **RF-10.5** **Se lee como una pregunta de Trycore, no como publicidad.** Mismo espacio y peso que un perfil; apariencia deliberadamente distinta, para que nadie la toque creyendo que es un candidato. En una herramienta por la que el cliente ya paga, algo con estética de anuncio abarata la percepción del resto.
- **RF-10.6** Una sola pregunta, respuesta de un toque, con opción de ampliar en texto libre. Tras votar, la tarjeta agradece y **colapsa**: no sigue ocupando un espacio de inventario.
- **RF-10.7** Redacción explícita de exploración. Sin fechas, sin "próximamente", sin insinuar que la capacidad ya existe. Con una cuenta activa, prometer lo inexistente cuesta más caro que con un prospecto.
- **RF-10.10** **Lo que se sondea es contratar un agente autónomo como unidad**, con su expertise, no talento humano que se apoya en agentes. Son dos ofertas distintas: una vende una persona, la otra vende una capacidad que no tiene disponibilidad, no renuncia y no se agota. La redacción no debe confundirlas.
- **RF-10.11** La tarjeta **puede presentarse con la forma de una tarjeta de perfil** —un agente entre los perfiles es la metáfora exacta de lo que se vendería— siempre que declare de forma inequívoca que **aún no existe**. Sin esa declaración, el usuario intentará sumarlo a su equipo.
- **RF-10.8** El voto se atribuye a cuenta y contacto y viaja a HubSpot. Un sí de una cuenta con contrato vigente es una señal calificada, no un voto anónimo.
- **RF-10.9** **Umbral cerrado (D-11):** el sondeo pasa a Investigación y Desarrollo cuando **5 cuentas distintas responden que sí y al menos 2 piden más detalle**, medido sobre los primeros tres envíos del boletín.
  - **RF-10.9.1** Las opciones de respuesta deben distinguir **el interés del compromiso**: tocar "me interesa" cuesta un segundo, pedir detalle cuesta tiempo del cliente. Solo la segunda alimenta el segundo criterio del umbral.
  - **RF-10.9.2** El plazo es parte del umbral. Sin fecha, un umbral no se cumple ni se descarta: se queda flotando.

### RF-11 · Espacio no-perfil en el grid
- **RF-11.1** RF-10 introduce un **espacio de tarjeta que no es un perfil** dentro del grid. Se implementa como un tipo de tarjeta con reglas propias, no como un caso especial del sondeo, porque es reutilizable: la tarjeta de "no encontramos ese rol, ¿lo buscamos para ti?" y, más adelante, las células de V2-4.
- **RF-11.2** Se trata como **excepción gobernada, nunca como inventario publicitario disponible**. Todo espacio no-perfil hereda las restricciones de RF-10.2 a RF-10.6. Un grid con varios espacios no-perfil compitiendo con los resultados destruye la utilidad de la herramienta y se nota de inmediato desde el otro lado de la pantalla.
---

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

## 9. Alcance y fases

### 9.1 Prototipo Low-Fi (entregable inmediato — objeto del VoBo)

Navegable, con datos semilla, sin backend. Cubre las dos caras: aterrizaje con conjunto curado, grid con facetas, ficha, "Mi equipo", solicitud y confirmación **más** el panel de administración con su CRUD simulado. Su propósito es validar los dos flujos y cerrar las decisiones abiertas de §12, no lucir terminado.

### 9.2 MVP (v1)

Low-Fi validado + control de acceso real + inventario persistente administrado por Talento Humano + integración con HubSpot + telemetría + responsive + accesibilidad AA.

### 9.3 Fuera del MVP (v2 en adelante)

**Aprobadas para el roadmap**

| # | Línea | Qué hace | Por qué importa |
|---|---|---|---|
| V2-1 | **Reclutamiento inverso** | Convierte las búsquedas sin resultados y los filtros más usados (RF-7.2) en la agenda de contratación de Talento Humano | El banco se arma contra demanda observada de las propias cuentas, no por intuición. El dato ya se recoge en el MVP |
| V2-2 | **Renovación anticipada** | Aviso 60 días antes del vencimiento de un contrato, con los perfiles que podrían continuar o relevar | Convierte un evento administrativo en conversación comercial. Requiere de Delivery quién está en qué proyecto y hasta cuándo |
| V2-3 | **Reemplazo sin fricción** | Camino de "necesito relevar este rol" que aterriza en el portal con perfiles equivalentes precargados | Es el momento de mayor riesgo de fuga de la cuenta y el de mayor retorno emocional del respaldo |
| V2-4 | **Venta de células · ruta de reto (§14)** | Unidades preconfiguradas por misión, con su composición. **Sin cifra en el portal** (D-9): el valor de conjunto lo aporta el comercial en la propuesta | Unidad de venta mayor y más fácil de justificar ante un comité. Disuelve el riesgo de mercantilización: lo expuesto es un equipo con misión, no individuos en una grilla. **RF-13.6 y RF-14.7 son su primer peldaño**: si las composiciones de referencia funcionan, esta línea deja de ser especulación y pasa a estar validada |
| V2-5 | **Contratación de agentes autónomos** | Ofrecer un agente con expertise como unidad contratable, junto a los perfiles humanos | Es otra unidad de venta, no una variante del talento. Responde de frente a la objeción que llegará —"¿para qué contrato personas si tengo agentes?"— en lugar de esquivarla. Y como la unidad no es una persona, ninguna de las cautelas de mercantilización que gobiernan este PRD aplica a esta línea: es la parte más limpia del portafolio futuro. Se valida antes con RF-10 |
| V2-6 | **Credenciales verificables** | El estándar Neural-Grid como registro auditable con fecha y alcance, no como afirmación | Convierte el argumento en activo. Tensión honesta: una credencial portátil se la lleva el profesional |
| V2-8 | **Seguimiento del equipo asignado** | Visibilidad de las calibraciones y la formación continua de los perfiles que la cuenta ya tiene trabajando | Ningún portal de reclutamiento sigue existiendo después de la contratación. Hace tangible que el estándar no caduca y alimenta directamente la renovación anticipada de V2-2 |
| V2-9 | **Pipeline por requerimiento** | Fases visibles del lado del cliente: propuesto, en entrevista, seleccionado, en inicio | Solo tiene sentido después de la sesión de alineación. **Nunca inicia el conteo del SLA desde el portal** (§2.4) |
| V2-10 | **Mensajería con Coordinación de Servicio** | Canal directo con el equipo de servicio de la cuenta, nunca con el profesional | Refuerza el respaldo sin abrir la puerta a la desintermediación |
| V2-11 | **Módulo de profesionales** | Registro en el banco de talento y seguimiento del propio estado de validación | Producto por derecho propio, con su propio consentimiento y riesgo legal. Tras la reversión de D-1 gana peso: el titular publicado nominalmente debería poder ver y rectificar lo suyo |
| V2-12 | **Módulo público** | Explorador anonimizado de categorías de talento, orientado a adquisición | Cambia la naturaleza del producto de expansión a adquisición. Requiere decisión de negocio previa |
| V2-7 | **Capacidad por resultado** | Vender throughput con compromiso de entrega, no persona por tiempo | Hacia donde empuja el mercado y la propia fábrica agéntica. **Implicación para el MVP:** el modelo de datos debe separar desde ya *perfil* de *capacidad ofrecida*; unirlos ahora y separarlos después es caro |

**Ya previstas:** recomendación automática de equipo por tipo de proyecto · disponibilidad sincronizada con el sistema interno de asignación · generación del correo curado desde el panel · vista para el comercial con actividad de la cuenta · apertura a prospectos no clientes · inglés · rangos de tarifa.

**Descartada:** vista para el profesional sobre su propia publicación. La relación con el cliente es confidencial y la participación en el proceso de selección cubre el tratamiento. El derecho de rectificación y revocación se atiende por el canal descrito en §8, no por producto.

### 9.4 Relación con el documento de especificaciones funcionales

El documento de especificaciones —ingeniería inversa de LinkedIn Recruiter— describe una **plataforma de cuatro módulos y tres audiencias**: público, profesionales, empresas y administración, con ATS, mensajería e informes. Se adopta como **visión de plataforma a dos o tres años**, no como alcance del MVP.

Razón: construir para tres audiencias a la vez es la forma más común de no entregarle bien a ninguna. El módulo de profesionales y el módulo público son productos por derecho propio, cada uno con su ciclo, su consentimiento y su riesgo legal.

**Orden sugerido de maduración:** portal de cuenta cerrado (este PRD) → seguimiento del equipo asignado (V2-8) → pipeline por requerimiento (V2-9) → módulo de profesionales (V2-11) → módulo público (V2-12).

**Conflictos resueltos a favor de este PRD:**

| Documento de especificaciones | Resolución |
|---|---|
| El SLA de 10 días arranca al publicar el requerimiento, con contador visible | **No.** El SLA corre desde la solicitud formalizada en la sesión de alineación (§2.4). Arrancarlo en el clic convierte el portal en un sistema de tomar pedidos |
| Credenciales corporativas y gestión de usuarios de la cuenta | **No en el MVP.** Enlace firmado (D-4). Las credenciales llegan con V2-9, cuando haya un pipeline que sostener |
| Portal público con explorador indexable | **No en el MVP.** Es V2-12 y exige decisión de negocio previa |
| Sello con las cuatro dimensiones por perfil | **Parcial.** Sello único e idéntico sí; cuatro dimensiones puntuadas no (RF-3.8) |
| Nombre visible solo al marcar interés formal | **Superado.** El nombre es visible desde la tarjeta (D-1 revertida) |

### 9.5 Riesgo estratégico de largo plazo

Llevado a su extremo lógico, este producto es un marketplace, y los marketplaces desintermedian a quien los opera: mientras mejor encuentre talento el portal, más fácil le resulta al cliente concluir que podría hacerlo solo. La defensa no es esconder información sino que el valor resida en la validación y el respaldo, no en el acceso. La decisión de publicar el dictamen y no el artefacto (B.8.4) ya apunta ahí. **Cada funcionalidad futura debe pasar por esa prueba antes de entrar al roadmap.** La reversión de D-1 aumenta esta exposición: un perfil identificable es un perfil contactable por fuera. La defensa se traslada al contrato y al respaldo, que es donde de todos modos vive el valor real.

---

## 10. Dependencias, supuestos y riesgos

### 10.1 Dependencias

| Dependencia | Responsable | Bloquea |
|---|---|---|
| Modelo de atributos normalizado del perfil | Talento Humano + Mercadeo | Todo. Sin esto no hay producto |
| Consentimiento de los profesionales sobre lo publicado | Talento Humano | Producción |
| Calificaciones cuantificables de los +15 roles | Delivery | RF-3.2 |
| Validación del catálogo de modalidades de prueba contra la práctica real de evaluación | Talento Humano | B.8.1 y la credibilidad del bloque de validación |
| Definición del pipeline, etapa de entrada y propiedades del negocio | Dirección Comercial | RF-9 |
| Permisos y credenciales de integración con HubSpot | Mercadeo (administrador de HubSpot) | RF-9 |
| Segmentación y calendario del correo curado por cuenta | Mercadeo | O2 y RF-1.6 |
| Línea base de perfiles colocados por cuenta activa | Dirección Comercial + Delivery | O1 y §11 |

### 10.2 Supuestos

- Existe un conjunto de cuentas activas con proyectos en curso conocidos por Trycore, suficiente para sostener un envío recurrente.
- Talento Humano dispone de capacidad para mantener el inventario con cadencia al menos mensual.
- El contacto que recibe el correo tiene capacidad de decidir o influir sobre el crecimiento del equipo.

### 10.3 Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| **El portal se lee como un catálogo de personas** | Daño de marca en el segmento que más cuida la ética laboral | La unidad expuesta es el perfil validado, no el individuo. Sin foto, sin nombre completo, sin CV. Todo el copy pasa por el filtro de la línea |
| **El descubrimiento devalúa la curaduría** | El cliente concluye que la selección no era para él | §2.5: el conjunto curado tiene identidad propia y ampliar es acción secundaria |
| **Inventario desactualizado** | Un perfil "disponible" que no lo está quema la credibilidad de una cuenta activa, que es el activo más caro | RF-8.5, RF-8.8 y O5. La bandeja de vigencia es obligatoria, no opcional |
| **El autoservicio erosiona el paso consultivo** | Se pierde el diferencial de "no tomamos pedidos" | El flujo termina en solicitud, nunca en reserva. La confirmación reencuadra hacia la alineación |
| **Exposición de datos personales sin consentimiento** | Riesgo legal y reputacional real | RF-8.4 lo hace imposible por diseño: sin consentimiento no hay publicación |
| **El cliente contacta al profesional por fuera del portal** | Con nombre y trayectoria publicados, llegar a la persona toma un minuto. Choca con la restricción contractual de no integrar los perfiles a la planta del cliente y alimenta el riesgo de desintermediación de §9.4 | La mitigación es contractual antes que de producto: cláusula explícita en el acuerdo marco. En el producto: cero datos de contacto, sin fotografía, y la condición de vinculación visible en cada ficha |
| **El enlace firmado circula fuera de la empresa del cliente** | Tras revertirse D-1, un tercero vería nombre, trayectoria y clientes nombrados de profesionales reales | Tener el enlace no basta: solo entra quien recibe el código en un correo invitado (RF-1.2, RF-1.2.7). Límite de intentos (RF-1.2.9), vigencia atada al ciclo del correo, revocación inmediata (RF-1.4) y ninguna tarifa expuesta (D-9). Riesgo residual: un invitado que muestra la pantalla a otra persona. Se acepta |
| **Solicitud enviada que no llega al CRM** | Se pierde la oportunidad y el cliente cree que Trycore lo ignoró | RF-9.6: cola de reintento y alerta |
| **Sistema operativo del hosting fuera de soporte** | *Cerrado el 2026-09-25.* El servidor corría CentOS 7, sin parches desde 2024; **se migró a CloudLinux 8** (servidor didac) antes de cargar datos reales de profesionales | Se mantienen: datos mínimos en servidor, secretos fuera de la carpeta pública, Cloudflare delante y antimalware del hosting |
| **Pérdida del servidor con sus respaldos** | JetBackup guarda las copias en el mismo servidor. Si el servidor se pierde, se pierden el inventario, los consentimientos nominales, la auditoría y las solicitudes en cola | **Riesgo aceptado** por el sponsor el 2026-09-25. Las solicitudes ya enviadas a HubSpot sobreviven allí; el inventario se reconstruye desde la exportación del banco (RF-8.15.9) |
| **El código de acceso cae en spam** | Nadie entra al portal, cliente ni panel, y el correo curado pierde su efecto | SPF, DKIM y DMARC en el dominio del portal antes del primer envío; prueba con buzones de cuentas reales; mensaje de la puerta que dice dónde buscar el código |

---

## 11. KPIs

| KPI | Línea base | Meta | Cuándo se mide | Fuente |
|---|---|---|---|---|
| Perfiles adicionales colocados en cuentas activas | `<!-- TODO -->` | `<!-- TODO -->` | Trimestral | HubSpot + Delivery |
| Cuentas que envían al menos una solicitud | 0 (no existe hoy) | ≥ 35% de las cuentas contactadas | Trimestral | Portal + HubSpot |
| Conversión visita → solicitud | 0 (no existe hoy) | ≥ 20% | Mensual | Telemetría |
| Oportunidades creadas en HubSpot desde el portal | 0 | `<!-- TODO -->` | Mensual | HubSpot |
| Tasa de cierre de oportunidades originadas en el portal | Sin dato | Superior a la de otros orígenes de la línea | Trimestral | HubSpot |
| Perfiles promedio por solicitud | Sin dato | ≥ 1,8 | Mensual | Telemetría |
| Solicitudes con contexto completo | Sin dato | ≥ 85% | Mensual | Portal |
| Días de solicitud a alineación agendada | `<!-- TODO -->` | ≤ 3 hábiles | Mensual | HubSpot |
| Perfiles con disponibilidad actualizada en 30 días | Sin dato | ≥ 90% | Mensual | Panel de administración |
| Acierto de la curaduría: solicitudes que incluyen al menos un perfil del conjunto curado | Sin dato | ≥ 70% | Mensual | Telemetría |
| Búsquedas sin resultados | Sin dato | Reportar top 10 | Mensual | Telemetría |

> **Gaps de KPI declarados (regla dura 4):** cuatro indicadores carecen de línea base y dos de meta. Se requiere de Dirección Comercial y Delivery el histórico de perfiles colocados por cuenta activa y el tiempo promedio de arranque comercial antes de considerar aprobado este PRD.

---

## 12. Stakeholders y decisiones abiertas

### 12.1 Stakeholders

| Rol | Persona | Responsabilidad |
|---|---|---|
| Sponsor / Product Owner | Jesús Segura — Dirección de Mercadeo | Visión, PRD, backlog, prototipo, correo curado |
| Aprobador de negocio | [[carlos-andres-segura]] — Dirección General | VoBo de inversión y alcance |
| Dueña del inventario | [[karen]] — Talento Humano | Perfiles, atributos, consentimiento, panel de administración |
| Delivery de la línea | Coordinación de Servicio — Eida Tinjacá M. | Recepción de solicitudes, SLA |
| Comercial | Dirección Comercial | Pipeline, etapa de entrada, línea base, uso en cuenta |
| Tecnología | [[jonathan]] — CTO | Viabilidad, construcción, integración |

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

### 12.3 Decisiones abiertas

| # | Decisión | Opciones | Dueño | Bloquea |
|---|---|---|---|---|
| **D-2** | Nombre del portal | Pendiente. No usar el nombre de la línea como nombre de producto | Mercadeo | Diseño visual |
| **D-5** | Grado de detalle de la trayectoria en la ficha | *Resuelta de hecho:* Perfil Profesional reescrito + Sello Personal (3 competencias) + Experiencia Clave despersonalizada. Ver Anexo B. **Talento Humano condiciona el VoBo a ver la propuesta de ficha** (2026-09-18): hasta que exista esa propuesta la decisión no se puede tomar, y el orden se invierte — la ficha se propone primero y se aprueba después | Talento Humano | RF-3.2 · **bloquea su propio cierre hasta que exista propuesta de ficha** |

> **Nota sobre D-5, ahora crítica.** Con el nombre fuera del portal, el grado de detalle de la trayectoria es lo único que carga la humanidad de la ficha. Deja de ser una decisión menor de contenido y pasa a ser la que define si el portal se siente humano o se siente un inventario.

---

## 13. Fase 2 de diseño — rediseño posterior al prototipo Low-Fi

> Origen: benchmark de seis plataformas de talento, recorrido directo de Torre.ai y feedback interno sobre el prototipo v1. Cada requisito de esta sección declara la **calidad de su evidencia**, su **argumento en contra** y la **prueba que lo falsea**. Un requisito sin prueba de falsación no entra al PRD.

### 13.1 El dato que gobierna esta sección

**Ninguna mejora de este bloque está validada con un cliente real.** Cero. Lo que sigue es diseño sobre inferencia informada, y la §13.6 define cómo cambiar eso antes de construir. Cualquier presentación de este material que lo muestre como hallazgo de investigación estaría vistiendo un juicio de negocio con ropa que no es suya.

### 13.2 Escala de evidencia

| Grado | Significa | Cuánto pesa |
|---|---|---|
| **A** | Observado por nosotros funcionando en un producto real | Alto sobre el *qué*, nulo sobre si sirve a nuestro usuario |
| **B** | Declarado por el proveedor o reportado por prensa | Medio. Es material comercial de un competidor |
| **C** | Investigación independiente | Alto sobre el principio, requiere traducción al contexto |
| **D** | Opinión interna de Trycore | Bajo. Útil como hipótesis |
| **E** | Inferencia nuestra sin respaldo externo | Muy bajo. Marcado para no confundirlo con hallazgo |

### 13.3 Sesgos declarados que operan sobre este rediseño

1. **Autoridad interna.** Torre.ai entró al análisis porque la mencionó el CTO. Es un marketplace abierto de millones de perfiles; esto es un banco cerrado de decenas. Parecido superficial alto, similitud estructural baja.
2. **Evaluador.** El recorrido lo hizo Mercadeo, que navega productos digitales a diario. El usuario real es un líder de área en un cliente BFSI que busca un perfil dos o tres veces al año.
3. **Fuente escrita.** Casi toda la evidencia grado B viene del marketing de los competidores. Publican velocidad, no abandono.
4. **Novedad contra costo hundido.** Las facetas del v1 están construidas y funcionando; la v2 las subordina. El apego a lo hecho y el atractivo de lo nuevo empujan en direcciones opuestas y ninguno es evidencia.
5. **Proxy de usuario.** Jonathan y Karen originaron este trabajo. Su criterio vale sobre viabilidad técnica e inventario, que es lo que sí son. Sobre la experiencia del cliente es especulación.

### 13.4 Requisitos nuevos

#### RF-12 · Entrada por instrucción
- **RF-12.1** La entrada principal es una **barra de instrucción en lenguaje natural**, nunca vacía: llega precargada con el proyecto activo de la cuenta y tres o cuatro instrucciones sugeridas. *(M-01 · evidencia D+E)*
  - *En contra:* las sugerencias pueden anclar al cliente en lo que tenemos y contaminar el registro de demanda de RF-15.
  - *Falsa la hipótesis:* si más del 60% de las consultas son sugerencias enviadas sin editar, no estamos captando demanda, la estamos dictando.
- **RF-12.2** El usuario puede **pegar un requerimiento completo** y el portal extrae los criterios como **chips editables**. *(M-02 · evidencia B)*
  - *En contra:* un requerimiento corporativo real trae cláusulas e historia del proyecto; puede producir diez chips donde importan tres, y limpiarlos es justo la fricción que queríamos evitar.
  - *Prueba previa obligatoria:* pegar cinco requerimientos reales de clientes actuales y contar cuántos chips sobran. Sin esa prueba, RF-12.2 no se construye.
- **RF-12.3** **La interpretación es visible antes del resultado.** *(M-03 · evidencia A+B)*
  - *En contra:* para una consulta obvia, mostrarla es un paso de ruido.
  - *Resolución:* se muestra siempre que la confianza de la interpretación esté bajo umbral, y de forma compacta cuando esté por encima.

#### RF-13 · Perfil Objetivo
- **RF-13.1** La consulta produce un **Perfil Objetivo: una especificación, no una persona** — familia de rol, capacidades, seniority, condiciones de trabajo y contexto del proyecto. *(M-04 · evidencia A+E)*
  - *En contra, y es el mejor argumento del documento:* es un paso adicional en un flujo cuyo argumento de venta es la velocidad. Torre puede pagarlo porque su búsqueda tarda; la nuestra es instantánea sobre decenas de perfiles.
  - *Falsa la hipótesis:* medición A/B de **tiempo hasta el primer perfil abierto**, con y sin Perfil Objetivo. Si el tiempo sube y la tasa de solicitud no, el patrón está mal aplicado aunque la idea sea correcta. Es **condición de permanencia**, no de lanzamiento.
- **RF-13.2** Las **preguntas de perfilamiento corren en paralelo**, máximo dos, con opciones tocables, mientras los primeros resultados ya se ven. Nunca como compuerta. *(M-05 · evidencia A+C)*
  - *Corrige* la regla previa de "nunca preguntar antes de mostrar un resultado".
  - *En contra:* si la búsqueda responde en milisegundos, las preguntas aparecen junto a resultados completos y se leen como innecesarias.
- **RF-13.3** El Perfil Objetivo es **editable de forma continua**, no un modal de confirmación. *(M-06 · evidencia E)*
  - *En contra:* sin momento explícito de confirmación, la requisición puede llegar a Talento Humano a medias.
  - *Prueba:* revisar la calidad de las primeras veinte requisiciones generadas.
- **RF-13.6 · El reto, no el rol.** El Perfil Objetivo abre con **qué tiene que estar funcionando cuando el proyecto termine**, antes que con la familia de rol.
  - *Por qué:* quien busca no tiene como meta contratar un diseñador de experiencia; tiene como meta que su proyecto salga. Hablarle en unidades de perfil es hablarle de nuestro inventario en lugar de su problema.
  - *Qué habilita:* que el cero deje de ser un callejón —"no tenemos ese perfil, pero para este reto tenemos estos tres"—; que Delivery reciba el resultado esperado y no solo el rol pedido, que es justamente lo que el modelo comercial dice querer diagnosticar; y que la unidad de venta pueda ser una célula con una misión, lo cual disuelve de raíz el riesgo de mercantilización.
  - *Costo:* un campo más en una pantalla cuyo argumento es la velocidad. Es opcional: quien solo quiere un perfil lo deja vacío y el flujo no cambia.
- **RF-14.7 · Composiciones de referencia.** Cuando el reto corresponde a un tipo de proyecto conocido, el portal muestra **la forma típica de ese trabajo** —qué capacidades suele requerir— señalando cuáles ya cubrió la selección del cliente y cuáles no.
  - **RF-14.7.0 · Alcance: los tres tipos de proyecto más frecuentes** (D-19, cerrada el 2026-09-21). Delivery entrega la composición real de los tres tipos que más entrega. **Fuera de esos tres, el portal calla** — no aproxima ni generaliza. Acota el trabajo de recopilación a algo abordable y mantiene intacta la regla de RF-14.7.1.
  - **RF-14.7.1 · Origen del dato, regla dura.** Las composiciones **se construyen sobre proyectos que Trycore entregó**, no sobre lo que conviene vender. Una composición inventada para inflar la solicitud es humo del peor tipo y un director de proyecto con experiencia la detecta de inmediato. Aplica el mismo criterio que cerró D-15: si el dato no existe, no se muestra.
  - **RF-14.7.2 · Tono.** Informativo, una sola vez, descartable. **Nunca propone perfiles concretos ni incluye llamados a la acción de venta.** Quien nombra la meta es el cliente; el portal solo le devuelve la forma del trabajo. La diferencia entre acompañar y vender está en quién saca la conclusión.
  - **RF-14.7.3 · Nunca bloquea.** Un cliente puede tener presupuesto para un solo rol. La referencia no insiste, no reaparece y no condiciona el envío.
  - *Prueba que la falsea:* si la referencia **no sube el promedio de perfiles por solicitud**, o si **sube el abandono en la pantalla de equipo**, era venta cruzada disfrazada de ayuda y se retira.
- **RF-13.9 · Obligatorio y deseable.** Cada criterio del Perfil Objetivo se marca como **obligatorio** —reduce el conjunto— o **deseable** —lo ordena—. *(Referencia: Juicebox separa filtros de criterios · evidencia A.)*
  - **RF-13.9.1 · Por qué importa más aquí que en el referente.** Juicebox usa los criterios para **ordenar 1.200 resultados**; nosotros los necesitamos para **no quedar en cero**. Con un banco de decenas, tratar todo como filtro duro cierra el conjunto en dos pasos. Mismo mecanismo, razón opuesta.
  - **RF-13.9.2 · Por omisión, solo el rol es obligatorio.** Todo lo demás entra como deseable: es la configuración que más resultados produce, y el cliente endurece lo que de verdad no puede negociar.
  - **RF-13.9.3** Los resultados se ordenan por cuántos deseables cumple cada perfil, y la tarjeta lo dice: *«cumple 3 de 4 deseables»*.
  - **RF-13.9.4** El camino del cero se activa solo cuando **ningún perfil cumple los obligatorios**. «Lo más cercano» pasa a ser quien falla exactamente un obligatorio.
- **RF-13.10 · Evidencia por criterio en la tarjeta.** Cada tarjeta muestra, criterio por criterio, **por qué coincide y por qué no**: *«✓ Banca · 8 años declarados»*, *«– Sin experiencia declarada en Seguros»*. *(Referencia: Juicebox · evidencia A.)*
  - **RF-13.10.1 · La diferencia con el referente es una restricción nuestra, no un olvido.** Las justificaciones de Juicebox las **redacta un modelo** sobre una persona real —*«indicating hands-on experience»*—. Eso choca con RF-16.1: Trycore responde contractualmente por cada perfil que publica, y una afirmación inferida sobre alguien es un riesgo que no compensa. **Nuestra evidencia es determinista**: sale de los datos del perfil, no de una redacción.
  - **RF-13.10.2** Se muestran también los criterios **no** cumplidos. Un listado que solo enseña aciertos no ayuda a decidir: ayuda a vender.
- **RF-13.12 · Dos vistas de resultados: tarjetas y tabla.** El usuario conmuta entre ambas y la elección persiste en la sesión. *(Referencia: Juicebox ofrece *Classic view* y *Table view* · evidencia A.)*
  - **RF-13.12.1 · Para qué sirve cada una.** Las **tarjetas** sirven para evaluar un perfil a la vez; la **tabla** sirve para comparar muchos por el mismo criterio, leyendo columnas. Son dos tareas distintas y ninguna sustituye a la otra.
  - **RF-13.12.2 · Una columna por criterio activo**, con ✓ o – y el dato que lo sustenta al pasar el cursor. Es la misma evidencia determinista de RF-13.10, dispuesta para comparar.
  - **RF-13.12.3 · Sin porcentaje de coincidencia.** El referente muestra *«Match 100%»*. Nosotros mostramos **«cumple 3 de 4»**: un porcentaje sugiere una precisión que no existe cuando hay cuatro criterios, y además oculta cuáles cumple. La cifra honesta es el conteo.
  - **RF-13.12.4 · Selección múltiple.** La tabla habilita seleccionar varios perfiles y **sumarlos al equipo de una vez**, cosa que la grilla no permite y que es el motivo principal para tener tabla.
  - **RF-13.12.5** No se replican dos columnas del referente: **empresa actual** y **enlaces al perfil público del profesional**. Ambas contradicen la decisión de no exponer contacto ni empleador identificable de forma directa.
  - **RF-13.12.6** La tabla se desplaza dentro de su contenedor, nunca arrastrando la página (M-6 de §8.1).
- **RF-13.11 · La ficha se abre como panel lateral**, sobre los resultados y sin perderlos, con navegación al perfil anterior y siguiente dentro del conjunto actual. *(Referencia: Juicebox · evidencia A.)* En móvil ocupa la pantalla completa.
- **RF-13.8 · Un solo motor de criterios.** El panel y los resultados se calculan con **la misma lógica**: el panel es el filtro, los resultados son lo que pasa el filtro. El contador del panel y el número de resultados son siempre el mismo número.
  - **RF-13.8.1 · Dentro de tecnologías vale *cualquiera*, no *todas*.** La interpretación devuelve el conjunto de tecnologías asociadas a un rol; exigirlas todas produce cero de forma sistemática en un banco de decenas. El campo lo declara en su etiqueta: *"basta con que tenga alguna"*.
  - **RF-13.8.2 · Un solo aviso, a nivel de panel.** Cuando ninguna combinación produce resultados se muestra **un** mensaje con los criterios activos como etiquetas removibles en un toque. Los avisos por campo se reducen a un único caso: el valor elegido no existe en el banco.
  - *Origen:* la primera versión usaba conjunción en tecnologías y una lógica distinta de la de los resultados. El panel decía cero mientras la pantalla mostraba dos perfiles, y avisaba de una incompatibilidad con campos que el usuario veía vacíos — estaban preseleccionados por la interpretación sin que se notara.
- **RF-13.7 · Opciones consecuentes.** El Perfil Objetivo es un **panel de ajuste**, no un formulario de campos libres. Cada campo calcula sus opciones **contra lo ya seleccionado en los demás**, con el conteo real de perfiles del banco. Elegir *Desarrollador Frontend* deja en tecnologías las que existen para ese rol, no las de otras disciplinas.
  - **RF-13.7.1 · Tecnologías es selección múltiple, nunca texto libre.** El texto libre produce datos que no se pueden filtrar, contar ni comparar, y le pide al cliente que adivine cómo escribimos nosotros.
  - **RF-13.7.2 · Dos niveles, y esta es la regla que impide que el panel se vuelva una jaula.** El Perfil Objetivo describe **lo que el cliente necesita**, no lo que tenemos. Por eso ofrece primero las opciones del banco con su conteo, **y permite añadir lo que no tenemos, marcado como no disponible**. Restringir el panel al inventario destruiría el camino del cero (RF-14.3) y el registro de demanda (RF-15), que es el activo de mayor valor del portal.
  - **RF-13.7.3** Una opción fuera del banco **no se usa como criterio de emparejamiento** —no puede filtrar contra algo que no existe— pero **sí viaja a la solicitud y al registro de demanda** como necesidad no cubierta.
  - **RF-13.7.4** El panel muestra en todo momento **cuántos perfiles quedan** con la combinación seleccionada, para que el cliente entienda si está cerrando demasiado antes de llegar a un cero.
  - *En contra:* la cascada puede ocultarle al cliente opciones que sí querría considerar. Se mitiga con el acceso explícito a la lista completa del banco y con el conteo visible en cada opción.
- **RF-13.5** El Perfil Objetivo captura **dónde se necesita el perfil**: país y ciudad.
  - **RF-13.5.1** Es **obligatorio** cuando la modalidad de la necesidad es **Presencial 100%** o **Híbrido**, y opcional cuando es Remoto. La ubicación de la cuenta no se asume como respuesta: una aseguradora con sede en Bogotá puede estar abriendo operación en Ciudad de México.
  - **RF-13.5.2** Entra **Presencial 100%** como modalidad de la necesidad. El banco actual solo registra Remoto e Híbrido como modalidades que el profesional acepta, de modo que ambas cosas no son el mismo campo y no deben compararse como si lo fueran.
  - **RF-13.5.3** **Distinción obligatoria**: *ubicación de la necesidad* es dato del cliente; *ubicación del profesional* es dato del banco. Tras la revisión de D-18 del 2026-09-18: **el país del profesional se publica siempre; la ciudad se publica solo cuando la necesidad declarada es Presencial 100% o Híbrido.** En Remoto la ciudad no se muestra, porque no decide nada y sí agrega precisión de localización.
  - **RF-13.5.5** El país **se muestra siempre** en la tarjeta y en la ficha, pero **solo es filtro cuando el banco tiene más de un país publicado**. Un filtro con una sola opción no informa nada y ocupa espacio. Es la misma regla de opciones consecuentes de RF-13.7.
  - **RF-13.5.5.1 · La ciudad aparece condicionada a la modalidad de la necesidad.** Con Presencial 100% o Híbrido declarado, la ciudad del profesional se muestra en tarjeta y ficha y es filtrable bajo la misma regla de más de un valor. Sin modalidad declarada, o en Remoto, **no se muestra**.
  - **RF-13.5.5.2 · La ciudad no se revela por la puerta de atrás.** Cambiar la modalidad a Presencial no puede usarse como truco para leer la ciudad de todo el banco: la ciudad se muestra sobre el conjunto que la necesidad presencial devuelve, no sobre el inventario completo.
  - **RF-13.5.6** Cuando la necesidad es presencial o híbrida, el portal **muestra la ciudad del profesional junto al país** y explica que la logística concreta se cierra en la alineación. **No debe decir que el dato no existe**: existe, está cargado y ahora se publica en ese contexto.
  - **RF-13.5.4** País y ciudad viajan al registro de demanda (RF-15.1) y a la solicitud. La concentración geográfica de la demanda presencial es insumo de decisión de huella: dónde conviene tener talento y dónde no.
- **RF-13.4** El Perfil Objetivo **persiste contra el dispositivo de quien lo especificó**, no contra la cuenta ni contra la sesión. *(M-07 · evidencia E · D-16 cerrada el 2026-09-21)*
  - **RF-13.4.1 · Por qué el dispositivo y no la cuenta.** Con acceso por enlace firmado, «cuenta» no es una identidad: es un enlace, y D-4 permite a propósito que se reenvíe dentro de la empresa del cliente. Persistir contra la cuenta haría que el arquitecto que recibe el reenvío viera lo que especificó el gerente. El dispositivo resuelve el caso real —**la misma persona que vuelve**— sin convertir un enlace compartible en un almacén de datos de otro.
  - **RF-13.4.2 · Sin implicación ISO 27000.** La especificación no se guarda del lado del servidor asociada a una identidad que el portal no puede verificar. Queda en el navegador de quien la escribió.
  - **RF-13.4.3 · Un enlace reenviado no arrastra especificación.** Quien abre en otro dispositivo arranca limpio. No es una carencia: es el comportamiento correcto.
  - **RF-13.4.4 · Degradación honesta.** Si el navegador no conserva el dato —modo privado, otro equipo, almacenamiento limpiado—, el portal arranca en blanco **sin prometer una recuperación que no puede cumplir**.
  - *Se reabre* el día que exista autenticación real por usuario, donde persistir contra la cuenta sí tiene sujeto verificable.

#### RF-14 · Resultados y camino del cero
- **RF-14.0 · Principio de origen del dato.** **El portal no expone campos que Talento Humano no produzca ya.** Todo campo nuevo debe justificarse contra dos cosas: su **costo operativo recurrente** de mantenimiento, y su lugar en la distinción **verificado por Trycore / autoreportado por el profesional**. Un campo que solo el candidato puede llenar no puede ocupar la posición de mayor jerarquía visual en un producto cuya tesis es la evidencia verificada.
  - *Origen del principio:* el benchmark de la Fase 2 proviene de plataformas donde el propio candidato completa su perfil. Ese no es el modelo de People Service, donde Talento Humano cura el banco. Importar patrones sin traducir el modelo de datos produce requisitos que no se pueden sostener.
- **RF-14.1** La tarjeta **lidera con la identidad y la capacidad** y usa como **elemento diferenciador las tres competencias del Sello Personal**. *(reemplaza a M-08)*
  - *Por qué esas y no un logro cuantificado:* existen para el 100% de los perfiles porque el DISC es condición de entrada; **las verifica Trycore**, no las declara el profesional; no tienen costo adicional; y son **lo único de las tres validaciones que varía entre perfiles** — el sello de seguridad y el técnico son idénticos en todos. Es el único discriminador verificado del banco.
  - *Costo aceptado:* sin una cifra, las tarjetas se parecen más entre sí y recorrer veinte cuesta más esfuerzo. Lo que distingue pasa a ser cualitativo.
  - *Consecuencia:* la pregunta 4 de §13.6 —qué mira primero alguien en una tarjeta sin fotografía— gana importancia, porque el ancla visual ya no es un número.
- **RF-14.2** **Los filtros se subordinan a refinamiento posterior; no desaparecen.** *(M-09 · evidencia B+D)*
  - *En contra:* el único elemento del prototipo v1 que recibió elogio explícito interno es justamente el que se degrada. Puede que lo valorado fuera el control, y el prompt no lo repone.
  - *Falsa la hipótesis:* medir uso de filtros después de una consulta por instrucción. Si más de la mitad de las sesiones los usan, la jerarquía propuesta está mal.
- **RF-14.3** **El "sin coincidencia" es ciudadano de primera**: Perfil Objetivo a la vista, lo más cercano, y solicitud dirigida con el SLA de 10 días hábiles hacia HubSpot. *(M-13 · evidencia E)*
  - *En contra:* mostrar "lo más cercano" cuando no se parece es peor que no mostrar nada.
  - *Resuelto sin umbral numérico (D-14 cerrada):* "lo más cercano" son los perfiles que **fallan exactamente un criterio**, y la tarjeta dice cuál —"cumple todo menos el sector Banca"—. Es verificable por el cliente y explicable por el comercial; un número calibrado no sería ninguna de las dos cosas.
- **RF-14.4** **La escasez se declara, no se disimula**: el tamaño del banco se comunica como selectividad. *(M-14 · evidencia B)*
  - *En contra:* declarar selectividad con decenas de perfiles puede sonar a excusa si el cliente ya sospecha que el banco es pequeño. Sujeto a redacción validada con Comercial.
- **RF-14.5** La ficha incorpora **campos de condiciones y preferencias de trabajo** —modalidad, disponibilidad, idioma—. *(M-11 · evidencia B)*
  - *En contra:* cada campo nuevo es mantenimiento recurrente. Un campo desactualizado hace más daño que un campo ausente. Solo entran los que Talento Humano pueda sostener.
- **RF-14.6** "Mi equipo" lee **vacíos de composición** —dos backend y ningún QA— en **tono informativo**, nunca sugerente. *(M-12 · evidencia B+E)*
  - *En contra:* sugerir roles no pedidos puede leerse como venta cruzada agresiva justo donde la confianza importa más.

#### RF-15 · Registro de demanda
- **RF-15.1** Se registra la **especificación estructurada completa**, no el texto libre. *(M-18 · evidencia E)*
  - *En contra:* solo vale si alguien lo revisa con cadencia. Sin dueño y frecuencia definidos antes de construirlo, es una tabla que nadie abre. Y RF-12.1 puede contaminarlo con demanda inducida.
  - *Resuelto (D-13):* **Talento Humano, revisión mensual.** Es quien actúa sobre el dato. El registro deja de estar bloqueado.

#### RF-16 · Contrato del modelo
- **RF-16.1** **El modelo interpreta. No recupera, no redacta, no ve los perfiles.** Salida estructurada contra nuestra taxonomía; recuperación determinista sobre el catálogo; degradación a léxico controlado si la API falla. *(M-19)*
  - *En contra:* se deja valor sobre la mesa; el modelo podría redactar la justificación del match.
  - *Criterio:* ese valor no compensa el riesgo de que el sistema afirme algo falso sobre una persona real por la que Trycore responde contractualmente. **Sin excepción en el MVP.**
- **RF-16.4 · El Perfil Objetivo nace multi-rol.** El campo de rol es **una lista desde el primer día**, aunque el MVP solo use un elemento. Nacer como valor único obliga, el día que exista la ruta por reto (§14), a una migración de datos sobre solicitudes históricas. Nacer como lista cuesta cero. Mismo criterio que RF-16.3: barato ahora, caro después.
- **RF-16.2** Al modelo se le envía **la consulta y la taxonomía; nunca los datos de los perfiles**. *(M-20)* Es una restricción, no una funcionalidad, con implicación directa en los consentimientos y en el frente de ISO 27000.
- **RF-16.3** **Separación entre la capa de especificación y la de recuperación.** El Perfil Objetivo tiene esquema versionado; la búsqueda vive tras una interfaz intercambiable. *(M-17)* Se hace porque el costo de no hacerlo es rehacer, no porque la expansión esté planeada: es una opción barata, no un compromiso.

### 13.5 Lo que se decidió no hacer

| Descartado | Por qué | Qué lo reabriría |
|---|---|---|
| Agente persistente que vigila y avisa | El usuario entra pocas veces al año; no hay relación continua que lo sostenga | Frecuencia de uso observada por encima de una vez al mes |
| Agregación de fuentes externas | El inventario es cerrado y curado por diseño | Decisión comercial de abrir la línea a terceros |
| Psicometría en la ficha | En un servicio donde Trycore responde por la persona, cambia la naturaleza del contrato | Nada previsible |
| Comparar perfiles entre sí de cara al cliente | Trycore responde por todos los perfiles que muestra; enfrentarlos es veneno | Nada |
| Densidad visual tipo Recruiter en la entrada | Con decenas de perfiles se lee como vacío | Banco por encima de ~300 perfiles |
| Revelar correo y teléfono del profesional *(Juicebox lo ofrece)* | Es nuestro modelo al revés: el portal no expone contacto en ningún caso | Nada |
| Ocultar perfiles de los resultados *(Juicebox lo ofrece)* | Tiene sentido con 1.200 resultados; con decenas es ruido | Banco por encima de ~300 perfiles |
| Justificaciones de coincidencia redactadas por un modelo *(Juicebox lo hace)* | Trycore responde contractualmente por cada persona publicada. Nuestra evidencia es determinista (RF-13.10.1) | Nada en el MVP |
| Que el modelo redacte sobre un perfil | Riesgo de afirmación falsa sobre una persona real | Nada en el MVP |

### 13.6 Las cinco preguntas que solo un cliente puede responder

Ninguna requiere construir nada. Tres sesiones de 30 minutos con clientes actuales, usando el prototipo, y una maqueta en papel del Perfil Objetivo.

1. ¿El cliente escribe en el campo abierto o espera una lista? → decide si RF-12/RF-13 son el flujo principal o un atajo.
2. ¿Reconoce el Perfil Objetivo como suyo o lo lee como un formulario? → decide la permanencia de RF-13.1.
3. ¿Qué hace cuando no hay coincidencia? → decide el diseño de RF-14.3.
4. ¿Qué mira primero en una tarjeta sin fotografía? → desbloquea el ancla visual.
5. ¿Cuánto tiempo está dispuesto a invertir? → si son 90 segundos, todo el flujo cambia.

**La hipótesis rival que estas sesiones deben intentar probar, no descartar:** que con un banco de decenas de perfiles curados, **una lista bien ordenada sin ningún buscador supera a todo lo anterior**. Cuarenta perfiles se recorren en tres minutos. Si sobrevive, este rediseño es una solución elegante a un problema que no tenemos, y el trabajo real está en la ficha y en el camino del cero. Alguien del equipo debe defender esa posición en la próxima reunión aunque no la crea: es la única forma de saber si la descartamos por evidencia o por entusiasmo.

### 13.7 Reversibilidad — qué hay que decidir antes de construir

| Decisión | ¿Reversible? | Cuándo se toma |
|---|---|---|
| Separación especificación / recuperación (RF-16.3) | No. Barata ahora, cara después | Antes de construir |
| El modelo interpreta y no ve perfiles (RF-16.1, RF-16.2) | No. Define el contrato de privacidad | Antes de construir |
| Perfil Objetivo persistente por cuenta (RF-13.4) | No. Define el modelo de datos | Antes de construir |
| Rol del Perfil Objetivo como lista (RF-16.4) | No. Convertirlo después obliga a migrar solicitudes históricas | Antes de construir |
| Instrucción como entrada principal (RF-12, RF-13) | Sí, es capa de interfaz | Después de las sesiones |
| Ancla visual de la tarjeta | Sí | Después de la auditoría del banco |
| Escasez declarada (RF-14.4) | Sí, es redacción | En cualquier momento |

Las tres primeras se toman **antes** de las sesiones con clientes, porque son de arquitectura y no de experiencia. Todo lo demás debería esperar.

---

## 14. La bifurcación — visión de producto a dos rutas

> Documentada para que las decisiones de hoy no la cierren. **No está aprobada ni estimada.**

### 14.1 Qué es

Dos rutas de entrada con profundidad comparable, no una principal y un atajo:

| | **Buscar un perfil** | **Armar el equipo por reto** |
|---|---|---|
| Unidad | La persona | La célula |
| Entrada | "Necesito un ingeniero de aplicaciones móviles" | "Necesito que el asegurado emita su póliza desde el celular" |
| Lo que devuelve | Perfiles que responden a la especificación | Una composición con su misión, sus capacidades y sus vacíos |
| Quien la usa | Quien ya sabe qué rol le falta | Quien sabe qué tiene que entregar y no cómo se compone |
| Salida | La misma solicitud, la misma sesión de alineación | Ídem |

La bifurcación **no es una pantalla, es un cambio de unidad de compra**. Por eso la ruta de reto no puede ser una variante de la de perfil con otro texto: necesita su propio recorrido, su propia forma de mostrar resultados y su propia manera de manejar el cero.

### 14.2 Por qué la ruta de reto va después, y no por falta de tiempo

**La ruta de perfil, operando, produce los datos que hacen posible la de reto.** Cada solicitud con varios perfiles es la observación de una célula que un cliente real compuso a mano para un problema real, y el registro de demanda (RF-15) ya guarda el reto declarado, la especificación completa y los perfiles seleccionados.

Con doce meses de eso existen composiciones verdaderas. Sin eso, construir la ruta de reto obliga a inventar la composición, que es exactamente lo que D-19 y D-15 nos enseñaron a no hacer.

**La secuencia es causal, no de conveniencia.**

### 14.3 Cómo se alimentan las dos rutas

| Dirección | Qué aporta |
|---|---|
| Perfil → Reto | Las selecciones manuales revelan qué roles se piden juntos y en qué proporción. Es el insumo empírico de las composiciones |
| Perfil → Reto | Los retos declarados en RF-13.6, aun con ruta de perfil, asocian resultado esperado con composición efectivamente pedida |
| Reto → Perfil | Un reto sin composición posible en el banco es la señal de reclutamiento más precisa que puede existir: no falta un rol, falta una capacidad de entrega completa |
| Reto → Perfil | El vocabulario con que los clientes describen resultados enriquece el léxico de interpretación (RF-2.6) |

El puente entre ambas es el **registro de demanda**. Su valor deja de ser solo inteligencia de reclutamiento y pasa a ser el activo que habilita la siguiente versión del producto.

### 14.4 Qué hay que preservar hoy para no cerrar la puerta

1. **RF-16.4** — el rol del Perfil Objetivo nace como lista.
2. **RF-16.3** — especificación y recuperación separadas; el esquema del Perfil Objetivo debe poder describir una célula sin rehacerse.
3. **RF-15.1** — el registro guarda la especificación estructurada completa **y los perfiles seleccionados**, no solo lo que se buscó.
4. **"Mi equipo" es el embrión de la célula.** Cualquier decisión que lo reduzca a un carrito de ítems destruye el dato que la ruta de reto necesita.

Ninguna de las cuatro cuesta trabajo adicional hoy. Las cuatro son caras de recuperar después.

### 14.5 Disparador

La ruta de reto se abre cuando se cumpla **cualquiera** de estas dos condiciones, no antes:

- **50 solicitudes con dos o más perfiles** registradas con su reto declarado; o
- **Delivery valida al menos 3 composiciones reales** de proyectos entregados (D-19) y las sostiene actualizadas.

Fijar el disparador ahora evita la conversación de "¿ya es momento?" repetida cada trimestre.

### 14.7 Regla de decisión sobre la hipótesis rival (D-17)

Fijada **antes** de observar a nadie. Después de ver los datos, cualquier regla se acomoda al resultado que cada quien ya prefería.

**Por qué la regla es asimétrica.** Tres participantes no miden: descartan. Con esa muestra se puede matar un diseño que falla de forma evidente en todos, pero no se puede confirmar ninguno. Una regla simétrica —"gana el que rinda mejor"— le daría a un empate el peso de un veredicto.

| Resultado observado | Decisión |
|---|---|
| **Los tres participantes completan la tarea con la lista y al menos dos con menos fricción visible que por instrucción** | Se reduce el alcance: la entrada pasa a ser la lista con filtros. **Se conservan** la ficha, el camino del cero (EP-010) y el registro de demanda. Se retiran la barra de instrucción, la interpretación por modelo y el panel de ajuste |
| **La ruta de instrucción rinde mejor en al menos dos de tres** | Se sostiene el rediseño completo |
| **Empate, resultados mixtos o alguna sesión inválida** | **Evidencia insuficiente para retirar la ruta de instrucción.** Se sostiene y se revisa con telemetría real al cierre del primer trimestre |

**La asimetría que no es de usabilidad y que sobrevive a un empate.** La ruta de instrucción produce algo que la lista no puede producir: **el texto con el que el cliente describe su necesidad**. Ese es el insumo del registro de demanda (RF-15), que decide a quién reclutar y habilita la ruta por reto (§14.2). Una lista de resultados no genera ese dato. Las dos rutas pueden empatar en completar la tarea sin ser equivalentes en lo que dejan atrás, y el criterio de decisión debe decirlo en lugar de esconderlo.

**Revisión con telemetría real, al cierre del primer trimestre.** Se retira la ruta de instrucción si se cumple **cualquiera** de estas dos: más de la mitad de las sesiones reales aplican filtros después de escribir una instrucción (RF-14.2), o el registro de demanda no produce **ninguna** decisión de reclutamiento en el trimestre — porque entonces el activo que justificaba la asimetría no existe.

**Lo que la condición de control no es.** Es una pantalla desechable, no una vista de producto. Si adquiere un dueño y una razón de existir deja de poder perder, y el experimento necesita que ambas opciones puedan perder. La necesidad legítima de una vista de banco completo para el comercial se resuelve por separado (**D-20**), con su propio usuario y sus propios méritos.

---

### 14.6 Riesgos propios de la ruta de reto

| Riesgo | Por qué importa |
|---|---|
| **Dos caminos mal mantenidos** | Duplicar profundidad duplica mantenimiento. Dos rutas mediocres son peores que una buena. Si no hay capacidad para sostener ambas, no se abre |
| **Es la ruta que más fácil se vuelve humo** | Prometer una célula que el banco real no puede componer. La ruta de perfil falla mostrando cero; la de reto falla prometiendo un equipo |
| **Exige precio de conjunto** | Una célula sin cifra de conjunto es una lista de personas con otro nombre. Conecta con D-9 |
| **Acelera la desintermediación (§9.5)** | Una célula bien descrita es también una receta que el cliente puede ejecutar por su cuenta. La defensa sigue siendo la validación y el respaldo, no el secreto de la composición |

---

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


---

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

## Control de versiones

| Versión | Fecha | Cambio |
|---|---|---|
| 0.1 | 2026-09-09 | Borrador inicial. Modo para-agentes |
| 4.10 | 2026-09-25 | **D-4 revisada a acceso nominal:** solo entran los correos invitados en el enlace (RF-1.2, RF-1.2.7); reenviar el enlace no da acceso. Nuevo RF-1.2.10 (invitar a un colega, con aprobación de Talento Humano) y RF-1.2.11 (por qué lista y no dominio); RF-1.2.2 queda sustituido. RF-19.4, §8.3, §10.3 y la razón de D-4, actualizados |
| 4.9 | 2026-09-24 | **Ajuste al hosting compartido.** Nueva **§8.3** y nueva **D-23**: la v1 corre en el hosting de Trycore (estático, PHP 8.3, MariaDB y tareas programadas). **D-4 revisada**: los dominios autorizados se declaran al generar el enlace (RF-1.2.7, RF-19.4) y se descarta el código generado por Talento Humano (RF-1.2.8); límite de intentos (RF-1.2.9). **D-22 revisada**: sin proveedor de identidad, el panel entra con correo `@trycore.com` inscrito, código de un uso y sesión de una jornada (RF-8.1, RF-8.1.5, RF-8.1.6). RF-9.6.1: la cola de reintento es una tabla más una tarea programada. RF-9.7.3: el escalamiento corre por tarea programada. RF-8.13.1: la sincronización de colocados es periódica. RF-8.11.1: el proyecto no opera con video; la evidencia es documento, transcripción o repositorio, de hasta 64 MB y fuera de la carpeta pública. RF-2.6.4: sin índice semántico. Dos riesgos nuevos en §10.3; el riesgo del enlace que circula y la razón de D-4 se actualizan a los datos nominales. §8.3 añade vigilancia de tareas (RF-9.6.2) y respaldo fuera del servidor |
| 4.8 | 2026-09-21 | **D-16 cerrada en persistencia por dispositivo**: RF-13.4 reescrito con RF-13.4.1 a RF-13.4.4. La especificación vive en el navegador de quien la escribió, no en el servidor contra la cuenta — se elimina la implicación ISO 27000 y un enlace reenviado deja de arrastrar datos ajenos. **D-19 cerrada en los tres tipos más frecuentes**: nuevo RF-14.7.0. Fuera de esos tres el portal calla. **No quedan decisiones abiertas que bloqueen historias** |
| 4.7 | 2026-09-18 | **D-10 cerrada**: el portal no comunica el vínculo laboral y publica un solo lenguaje de disponibilidad. Nuevo RF-3.13 — la disponibilidad se publica como banda de arranque derivada de la fecha del panel, que no sale del panel. RF-3.3 reescrito con RF-3.3.1 y RF-3.3.2: la ficha deja de afirmar la relación laboral y sostiene la representación comercial y la barrera de contacto. **D-18 revisada**: la ciudad del profesional se publica cuando la necesidad es Presencial 100% o Híbrido; nuevos RF-13.5.5.1 y RF-13.5.5.2 |
| 4.6 | 2026-09-18 | **D-8 cerrada en CRUD completo**: el panel entra al MVP con todo el alcance, lo que desbloquea HU-086 y HU-087 y deja a la vista que el CRUD, la validación y el consentimiento no tienen historia escrita. **D-3 cerrada en 25 perfiles publicados** como condición de salida a producción. **D-5 sigue abierta con condición nueva**: Talento Humano condiciona el VoBo a ver primero la propuesta de ficha |
| 4.5 | 2026-09-16 | **D-4 revisada**: el cliente entra con enlace firmado más verificación de correo corporativo por dominio y código de un uso; el cambio lo justifica la reversión de D-1, que puso nombres en el enlace. **Nueva D-22**: el panel entra con identidad corporativa, con rol administrador y rol observador |
| 4.4 | 2026-09-16 | Nuevo RF-19: enlaces curados generados por Talento Humano. La URL lleva la lista de códigos y no filtros, porque una selección heterogénea no se puede expresar con filtros. Reevaluación de estado al abrir, registro y revocación. Spec en docs/10-specs |
| 4.3 | 2026-09-16 | **RF-3.8 revertido a la resolución original**: se retira la insignia Neural-Grid por perfil. Lo que cumplen todos no discrimina, y la tarjeta ya tiene competencias, evidencia por criterio y conteo de deseables compitiendo por la atención |
| 4.2 | 2026-09-16 | RF-13.12: dos vistas de resultados, tarjetas y tabla, con una columna por criterio, conteo de deseables en lugar de porcentaje de coincidencia y selección múltiple para sumar al equipo |
| 4.1 | 2026-09-16 | Referencias de Juicebox (evidencia A): RF-13.9 obligatorio contra deseable, RF-13.10 evidencia determinista por criterio, RF-13.11 ficha en panel lateral. Tres patrones del referente rechazados con su razón |
| 4.0 | 2026-09-16 | Cerrados los cinco huecos: RF-9.7 (notificación con escalamiento), RF-17 (traspaso a Delivery), RF-18 (correo curado, con spec propia), §8.2 (accesibilidad verificable) y las historias de EP-001, EP-005, EP-007 y EP-008. Nueva épica EP-011 |
| 3.6 | 2026-09-16 | Nuevo RF-8.16: catálogos paramétricos. El editor deja el texto libre y pasa a selección; detección de parecidos antes de crear; dependencias encadenadas rol→familia→modalidad; desactivar en vez de borrar; fusión de duplicados |
| 3.5 | 2026-09-16 | Nuevo RF-8.15: importación masiva de perfiles, con hoja de cálculo como camino principal y JSON como camino de máquina. Modo de importación explícito, fusión por campo presente, vista previa por tarjeta y reversión completa. Spec en docs/10-specs |
| 3.4 | 2026-09-16 | Nuevo RF-8.14: estado y disponibilidad son ejes distintos y no pueden contradecirse. Pausar exige motivo. **RF-8.13.2 corregido**: un colocado no se oculta, se ofrece desde que queda libre. Disponibilidad vencida sin actualizar se muestra como «por confirmar» |
| 3.3 | 2026-09-16 | D-18 cerrada: el país del profesional se publica, la ciudad se carga pero no. Nuevos RF-13.5.5 (el país solo es filtro si hay más de un país) y RF-13.5.6 (el mensaje deja de decir que el dato no existe) |
| 3.2 | 2026-09-16 | Nueva §8.1: el requisito de móvil pasa de intención a especificación verificable, con ocho criterios, definición de hecho y deuda declarada del prototipo |
| 3.1 | 2026-09-15 | Cerradas D-20 (vista del comercial diferida) y D-21 (etapas del pipeline comercial vigente). Nuevo RF-9.1.3: propiedad de fecha de alineación, sin la cual O3 deja de ser medible |
| 3.0 | 2026-09-15 | Cerradas D-6 (pipeline propio de la línea, con propiedad de origen), D-7 (negocio nuevo asociado como relacionado) y D-9 (sin tarifas en el portal, en ningún caso). RF-9 actualizado. **EP-007 desbloqueada** |
| 2.9 | 2026-09-15 | D-17 cerrada con regla asimétrica fijada antes de observar (§14.7), incluida la asimetría de datos que sobrevive a un empate y la revisión con telemetría al cierre del trimestre. Nueva D-20: vista de banco para el comercial, separada de la condición de control |
| 2.8 | 2026-09-15 | Cerradas D-11 (5 cuentas con sí y 2 que piden detalle, en 3 boletines), D-12 (8 resultados) y D-13 (Talento Humano, mensual). RF-15 y HU-078 desbloqueadas |
| 2.7 | 2026-09-15 | Corrección de integridad: D-18 y D-19 estaban listadas por error entre las decisiones cerradas. Movidas a §12.3, abiertas |
| 2.6 | 2026-09-15 | RF-13.8: un solo motor de criterios para panel y resultados; tecnologías por *cualquiera* y no por *todas*; un único aviso de cero con criterios removibles. D-14 cerrada sin umbral numérico |
| 2.5 | 2026-09-15 | RF-13.7: el Perfil Objetivo pasa a panel de ajuste con opciones consecuentes y conteo real. Tecnologías como selección múltiple. Regla de dos niveles para preservar la demanda no cubierta |
| 2.4 | 2026-09-15 | Nueva §14: la bifurcación perfil / reto como visión de producto, con secuencia causal, disparador cuantificado, retroalimentación entre rutas y riesgos propios. Nuevo RF-16.4: el rol nace como lista |
| 2.3 | 2026-09-15 | RF-13.6: el Perfil Objetivo pasa de especificar un perfil a especificar un reto. RF-14.7: composiciones de referencia sobre proyectos realmente entregados, en tono informativo y con prueba de falsación. Nueva D-19 |
| 2.2 | 2026-09-14 | RF-13.5: el Perfil Objetivo captura país y ciudad de la necesidad, obligatorio en presencial e híbrido. Se distingue ubicación de la necesidad (cliente, gratis) de ubicación del profesional (banco, inexistente hoy). Nueva D-18 |
| 2.1 | 2026-09-14 | D-15 cerrada: el ranking por logro cuantificado **no procede** por origen del dato. RF-14.1 reescrito sobre el Sello Personal. Nuevo principio RF-14.0: el portal no inventa campos que Talento Humano no produce |
| 2.0 | 2026-09-14 | **Fase 2 de diseño** tras el prototipo Low-Fi y el benchmark: nueva §13 con RF-12 a RF-16 (entrada por instrucción, Perfil Objetivo, camino del cero, registro de demanda, contrato del modelo), cada uno con grado de evidencia, argumento en contra y prueba de falsación. RF-2.6 pasa a interpretación por modelo con léxico como degradación. Nuevas D-13 a D-17 |
| 1.3 | 2026-09-10 | Búsqueda semántica con léxico administrable sube a MVP (RF-2.6, RF-8.12). Nueva pestaña de colocados y vencimientos (RF-8.13), espejo de solo lectura y disparador de V2-2. RF-10 reencuadrado a contratación de agentes autónomos; V2-5 reescrita |
| 1.2 | 2026-09-10 | **D-1 revertida**: nombre y primer apellido visibles. Sello Neural-Grid único en la tarjeta (RF-3.8). Nuevos RF-2.9 a RF-2.11 y RF-3.12. Consentimiento nominal (RF-8.4). Cinco líneas nuevas de v2 y §9.5 con la relación al documento de especificaciones |
| 1.1 | 2026-09-09 | RF-10 se traslada al grid de descubrimiento como tarjeta con el mismo peso que un perfil, con cuatro restricciones. Nuevo RF-11 de espacio no-perfil gobernado. Nueva D-12 |
| 1.0 | 2026-09-09 | Roadmap v2 con siete líneas aprobadas y riesgo estratégico de desintermediación (§9.3, §9.4). Nuevo RF-10 de sondeo de demanda en el MVP. Nueva D-11. Vista del profesional descartada; se atiende por canal de rectificación |
| 0.9 | 2026-09-09 | La modalidad pasa a catálogo cerrado seleccionable con texto de cliente incluido (B.8.1). Reglas de gobierno del catálogo. Nueva dependencia: validar el catálogo con Talento Humano |
| 0.8 | 2026-09-09 | Nuevo B.9: tres niveles progresivos de detalle, enunciado por familia de rol y carga asistida desde el artefacto. La publicación nunca se bloquea. Nuevos RF-3.11, RF-8.10 y RF-8.11 |
| 0.7 | 2026-09-09 | Nuevo B.8: modalidades de prueba por familia de rol, rúbrica común, estructura fija del reporte, resultado sin puntaje y prohibición de publicar el artefacto crudo. Nuevo RF-3.10 |
| 0.6 | 2026-09-09 | Las tres validaciones son condición de entrada: se eliminan las insignias por perfil (RF-3.8) y el estándar se declara una vez (RF-6.4). Neural Speed pasa a garantía de servicio (RF-6.5). Nueva D-10 sobre disponibilidad |
| 0.5 | 2026-09-09 | Trayectoria con clientes nombrados aprobada para publicación. Nuevo B.6 de evidencia por dimensión Neural-Grid. Nuevos RF-3.8 y RF-3.9. RF-3.2 reestructura la ficha en cuatro bloques |
| 0.4 | 2026-09-09 | Incorporado el boletín de Talento Humano como fuente del modelo de datos (Anexo B). RF-5.1 adopta el cuestionario cliente. Nuevo RF-3.7. D-5 resuelta de hecho por el campo Sello Personal |
| 0.3 | 2026-09-09 | Cerradas D-1 y D-4. Nuevos RF-3.5, RF-3.6 y RF-5.6. RF-9.2 cubre contacto nuevo en empresa conocida. D-5 escala a crítica |
| 0.2 | 2026-09-09 | Reorientado a expansión de cuentas activas. Entra panel de administración (RF-8) e integración HubSpot (RF-9) al MVP. Nueva tensión curaduría vs. descubrimiento (§2.5). Objetivos y KPIs reescritos. Decisiones abiertas: 6 → 9 |
