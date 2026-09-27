---
id: 0006
title: "Telemetría y atribución"
date: 2026-09-25
status: accepted
authors:
  - setup-architecture (/build:architect)
tags: [telemetria, atribucion, eventos, informes, privacidad, ley-1581]
add:
  iteracion: 6
  fase_prd: "Fase 8 · EP-008"
---

# ADR 0006 — Telemetría y atribución

> **Enmienda de plataforma (iteración 8, 2026-09-25):** el diseño de esta ADR se conserva; la tabla de
> eventos pasa a PostgreSQL y la retención al worker. Ver la sección «Enmienda de plataforma» al final.
> Su subsección «Revisión adversarial (2026-09-26)» incorpora los hallazgos H9, H13, H24, H26, H32,
> H40 y H43 de la revisión multiagente (particiones, eventos de falsación, variante, logs, token).
>
> **Consolidación (2026-09-26, tras la revisión en paralelo):** esta ADR es la referencia única del
> dueño de `eventos` (`ps_eventos_dueno`), de sus particiones (función `mantener_eventos(sal)` llamada
> por la tarea `retencion_eventos`) y de los permisos sobre `eventos` (I-4, resuelta). Se retiran el
> rol `ps_mantenimiento`, la tarea `mantener_particiones_eventos`, `MANTENIMIENTO_DATABASE_URL` y la
> creación de particiones por `migrar`. La unidad de asignación por cuenta y la exclusión de sesiones
> internas pasan a ser propuestas por defecto pendientes de T-25 y T-26.
>
> **Consolidación, 2.ª pasada (2026-09-26):** `eventos` pasa al esquema propio `telemetria`, propiedad de
> `ps_eventos_dueno` (antes `operacion.eventos`, en un esquema de `ps_duenio` donde `ps_migrador` podía
> hacer `DROP`); las particiones iniciales las crea `crear_particiones()` sin sal; el portal completa
> la visita por la función `completar_visita` (el `UPDATE` directo exigía `SELECT`); las vistas `v_*`
> son de `ps_eventos_dueno`; y el endpoint anónimo `POST /api/v1/eventos/acceso` se retira: el token
> solo viaja a `POST /acceso/enlace`, que escribe `enlace_abierto` (rige ADR-0002, H9).

> Plantilla alineada al método **ADD** (Attribute-Driven Design, Len Bass — *Software Architecture in
> Practice*). Cada sección numerada corresponde a un paso del método. Las decisiones deben trazar a
> [0000-drivers-y-asrs.md](0000-drivers-y-asrs.md) y actualizar
> [_backlog-arquitectonico.md](_backlog-arquitectonico.md). Generada por la skill `setup-architecture`
> (`/build:architect`); un humano la promueve `proposed → accepted`.
>
> **Revisión 2 (tras evaluación ATAM-lite adversarial):** se añade un endpoint anónimo acotado para el
> paso de acceso, los eventos guardan `contacto_id` en lugar del correo, la referencia a HubSpot pasa a
> ADR-0005, las definiciones de los informes se fijan en el slice de EP-008 y las entradas sin
> parámetros se atribuyen por defecto al último envío por el que entró el contacto.

## 1. Objetivo de la iteración y drivers seleccionados (Pasos 2–3)

- **Objetivo de la iteración:** decidir cómo se capturan, atribuyen, guardan y explotan los eventos
  de RF-7 para que los informes del embudo, del acierto de la curaduría, de los filtros usados y de
  las búsquedas sin resultados salgan solos, sin trabajo manual, sin enviar datos personales a
  terceros y sin que la telemetría pueda tumbar la solicitud. El embudo empieza en la apertura del
  enlace, antes de que exista sesión, así que también hay que medir el paso de acceso sin debilitarlo.
- **Elemento(s) a refinar:** capa de eventos (cliente en `apps/portal` + módulo `Telemetria` de la
  API PHP en `server/`), tabla `eventos` en MariaDB y la vista de informes del panel (`apps/panel`,
  rol observador).
- **Drivers abordados:**
  - Funcionales: UC-17 (telemetría con atribución: RF-7.1–RF-7.4, RF-2.6.3, RF-18.6; EP-008 ·
    HU-108–112). Apoyo: UC-1 (el paso de acceso genera los primeros eventos del embudo) y UC-16 (la
    entrada al portal alimenta la medición del correo curado y la regla de tres envíos).
  - Atributos de calidad: QA-21 (100 % de solicitudes vinculadas a cuenta, contacto, sesión,
    conjunto curado y correo de origen; ≥ 99 % de sesiones por enlace atribuidas a un envío
    *a validar*; pérdida de eventos ≤ 1 % *a validar*). Se apoya en QA-5 (0 datos de perfil fuera
    del sistema, Ley 1581), QA-2 (la telemetría no puede engordar el JS inicial ni el LCP), QA-3 (el
    endpoint anónimo no puede convertirse en un oráculo de invitados ni en una vía de abuso), QA-6
    (la solicitud no depende de la telemetría) y QA-13 (la tarea de retención queda vigilada).
  - Restricciones: CON-3 (sin `node_modules` en servidor: nada de SDK de analítica en runtime) y
    la plataforma de §8.3 (PHP 8.3 + MariaDB 10.6, sin colas ni procesos largos).
  - Concerns: CRN-10 (telemetría y notificaciones llevan datos personales; retención no definida),
    CRN-5 (la apertura por píxel no es fiable con SMTP propio) y CRN-18 (ModSecurity puede bloquear
    los POST de eventos).

## 2. Conceptos de diseño elegidos (Paso 4)

| Driver | Concepto / Táctica | Alternativas descartadas | Razón |
|--------|--------------------|--------------------------|-------|
| QA-21, QA-2 | **Emisión por lotes desde el cliente** con `navigator.sendBeacon` al cerrar/ocultar la página y `fetch(..., {keepalive: true})` de respaldo; cola en memoria que se vacía cada N eventos o cada pocos segundos | (a) Un `fetch` por evento; (b) `XMLHttpRequest` síncrono en `unload`; (c) píxel `<img>` | (a) multiplica peticiones y choca con el límite de tasa de Cloudflare; (b) está obsoleto y bloquea la navegación; (c) no transporta lotes JSON. `sendBeacon` sobrevive al cierre de pestaña, que es justo cuando ocurre el evento «abandono» |
| QA-21, QA-5 | **Enriquecimiento del lado servidor** (táctica *autenticar y derivar identidad en el borde confiable*): el cliente manda solo tipo de evento, marca de tiempo y carga funcional; el servidor añade cuenta, enlace, contacto, envío de origen y bandera curado/descubrimiento desde la sesión | Que el cliente mande `cuenta_id`, `contacto_id` o `envio_id` en el cuerpo | Un cliente manipulado podría falsear la atribución o atribuir eventos a otra cuenta. La sesión ya tiene todo eso (RF-1.2, ADR-0002); duplicarlo en el cliente solo abre superficie |
| UC-17, UC-1, QA-3 | **Endpoint anónimo acotado para el paso de acceso** (táctica *limitar la exposición* + *limitar la tasa*): antes de que haya sesión solo se aceptan cuatro tipos cerrados (`enlace_abierto`, `codigo_solicitado`, `codigo_fallido`, `acceso_concedido`), atribuidos al enlace y al envío que el servidor deduce del token firmado, nunca a un correo; límite de tasa por IP en la aplicación (fuera de la única regla de Cloudflare, ADR-0007); respuesta `204` idéntica pase lo que pase | (a) No medir nada antes de la sesión; (b) abrir el endpoint general sin sesión; (c) registrar el paso de acceso solo desde el servidor de acceso | (a) el embudo perdería su primer escalón (cuántos abren el enlace y no llegan a entrar), que es lo que RF-7.1 llama «entrada» y lo que el correo curado necesita; (b) cualquiera podría inyectar eventos de cualquier tipo; (c) cubre `codigo_solicitado`/`fallido` pero no la apertura en el navegador ni el abandono de la pantalla de código. Se combinan: el servidor de acceso registra lo que ya sabe y el navegador solo aporta `enlace_abierto` |
| QA-5, CRN-10 | **Identificador de contacto en lugar del correo**: los eventos guardan `contacto_id` (el id interno del invitado que la sesión ya conoce, ADR-0002); el correo vive solo en la tabla de invitados | Guardar el correo en cada evento | El correo repetido en millones de filas multiplica el dato personal y complica la retención y el derecho de supresión. Con `contacto_id` basta un `JOIN` para el informe por contacto, y suprimir o seudonimizar a un contacto es tocar una fila, no la tabla de eventos |
| QA-21, UC-16 | **Atribución por defecto al último envío por el que entró el contacto** (último toque): una entrada con parámetros de envío fija `envio_id`; una entrada sin parámetros hereda el último `envio_id` con el que ese contacto entró, marcada como `atribucion = heredada`; si nunca entró por un envío queda `directo` | (a) Toda entrada sin parámetros = directo; (b) atribuir al último envío mandado a la cuenta, haya entrado o no el contacto por él; (c) atribución multitoque | (a) castiga al cliente que guarda el enlace o vuelve desde el historial y hunde el ≥ 99 % de QA-21; (b) atribuye a un correo que ese contacto quizá no leyó; (c) es desproporcionada para decenas de cuentas. La marca `heredada` deja ver cuánto pesa la regla y permite cambiarla sin reescribir eventos. **Regla a validar por negocio** (ventana máxima incluida) |
| QA-21, UC-17 | **Registro append-only** en una tabla `eventos` con partición lógica por mes (columna `mes` + índices por `(fecha)` y `(cuenta_id, fecha)`) | (a) Particionado nativo de MariaDB (`PARTITION BY RANGE`); (b) una tabla por tipo de evento; (c) ficheros de log planos | (a) añade operación (crear particiones futuras por cron) para un volumen de decenas de cuentas que no lo justifica; se puede adoptar después sin cambiar el contrato; (b) complica los informes que cruzan tipos (embudo); (c) no se consultan con SQL desde el panel |
| UC-17 | **Informes como consultas SQL / vistas** servidas por la API al panel (rol observador), con estado «sin dato» explícito cuando no hay eventos. Las **definiciones exactas** de cada informe (qué es «abandono», ventana del embudo, qué cuenta como «acierto de curaduría») **se escriben en el slice de EP-008** (su OpenSpec change) como especificación verificable, no en esta ADR | (a) Herramienta externa de analítica (GA4, Matomo Cloud, PostHog, Mixpanel); (b) Matomo autoalojado en el hosting; (c) exportar a hoja de cálculo | (a) envía datos personales de invitados a un tercero (Ley 1581, QA-5) y obliga a abrir la CSP a su dominio (ADR-0007); (b) consume inodos, otra BD y otra superficie de ataque para informes que son 5 consultas; (c) es trabajo manual, lo que UC-17 prohíbe |
| KPIs §11 | **Métricas de negocio leídas de HubSpot**, no duplicadas: negocios creados, cierres y tiempos de alineación se consultan donde nacen | Copiar el estado del negocio a la BD del portal | Dos fuentes para el mismo número divergen; HubSpot es el sistema de registro comercial (ADR-0005). El portal solo guarda el vínculo solicitud ↔ negocio |
| CRN-10, QA-5 | **Minimización de datos**: no se registran textos de ficha ni datos de perfiles (solo su id opaco); sí la consulta literal sin coincidencia (RF-2.6.3), con un filtro que enmascara correos y teléfonos; retención de 24 meses y, a los 12 meses, sustitución de `contacto_id` por un seudónimo (hash con sal de servidor) por tarea programada | (a) Guardar todo indefinidamente; (b) anonimizar desde el primer día | (a) incumple el principio de finalidad y temporalidad de la Ley 1581; (b) rompe RF-7.3 (atribución a contacto) y el informe del correo por cuenta, que el comercial necesita durante el ciclo de venta |
| QA-21, QA-6 | **Degradación aceptada** (táctica *ignorar fallos no críticos*): si la escritura del lote falla, el evento se pierde y se cuenta; la solicitud nunca depende de telemetría | (a) Cola persistente con reintentos; (b) escribir el evento en la misma transacción que la solicitud | (a) el hosting no ofrece colas y el volumen no lo justifica; (b) acoplaría la durabilidad de la solicitud (QA-6) a la de una tabla secundaria. El evento «solicitud enviada» se deriva además de la propia tabla de solicitudes, así el informe del embudo no depende de la entrega del beacon |

## 3. Instanciación: responsabilidades e interfaces (Paso 5)

- **Elementos instanciados:**
  - `apps/portal` → módulo `telemetria` (cola en memoria, serializador del lote, emisor
    `sendBeacon`/`keepalive`, identificador de visita). Sin dependencias externas; tamaño objetivo
    < 2 KB comprimido.
  - `packages/contratos` → esquema del evento (`TipoEvento` enumerado de RF-7.1 más los cuatro tipos
    de acceso, y carga permitida por tipo), compartido por portal y por los tests PHP vía JSON Schema
    generado.
  - `server/` → casos de uso `RegistrarEventos` (con sesión) y `RegistrarEventosAcceso` (sin sesión; **retirado**, ver revisión adversarial),
    puerto `RepositorioEventos` (dominio), adaptador `EventosMariaDb` (infraestructura); servicio de
    dominio `ResolverAtribucion`; caso de uso `ConsultarInformeTelemetria` para el panel; tarea
    programada `RetencionEventos` (diaria).
  - MariaDB → tabla `eventos` y vistas `v_embudo_cuenta`, `v_acierto_curaduria`, `v_filtros_usados`,
    `v_ruta_entrada`, `v_busquedas_sin_resultado`. El SQL de cada vista lo fija el slice de EP-008.
- **Responsabilidades:**
  - Cliente: emitir solo lo que ocurrió (tipo, `ocurrido_en` del cliente, `perfil_id` opaco, filtros
    aplicados, texto de consulta cuando no hubo coincidencia). Nunca identidad. En la pantalla de
    acceso genera un `visita_id` aleatorio (en `sessionStorage`) que viaja en el lote anónimo y en el
    primer lote con sesión, para enlazar ambos tramos del embudo.
  - ⛔ *Retirado en la revisión adversarial (2026-09-26): este endpoint anónimo ya no existe; `enlace_abierto` lo escribe el servidor en `POST /acceso/enlace` (ver «Revisión adversarial», fila del endpoint anónimo). Se conserva el texto como rastro.*
  - ~~`RegistrarEventosAcceso` (sin sesión)~~:
    - Acepta solo `enlace_abierto` desde el navegador; `codigo_solicitado`, `codigo_fallido` y
      `acceso_concedido` los inserta el propio servicio de acceso (ADR-0002) desde el servidor.
    - Verifica la firma del token del enlace; si no es válida, descarta en silencio.
    - Deduce `enlace_id`, `cuenta_id` y `envio_id` del token. Nunca recibe ni guarda un correo:
      `contacto_id` queda `NULL` en este tramo.
    - Máx. 5 eventos y 2 KB por cuerpo; límite de tasa de 30 peticiones por minuto por IP en la API
      (*a validar*) en el limitador de la aplicación; los eventos quedan **fuera** de la única regla de Cloudflare, reservada al acceso (ADR-0007).
    - Responde siempre `204`, sea el token válido, inválido o esté revocado, para no revelar el
      estado del enlace ni quién está invitado (QA-3).
  - `RegistrarEventos` (con sesión): validar sesión, validar cada evento contra el esquema (descarta
    los inválidos sin rechazar el lote), enriquecer con `ResolverAtribucion`, insertar el lote en
    una sola sentencia, contar descartes y fallos. Al recibir un `visita_id` ya visto en el tramo
    anónimo, completa `contacto_id` en esos eventos de acceso (un `UPDATE` acotado a esa visita y a
    las últimas 24 h).
  - `ResolverAtribucion` (se calcula una vez al abrir la sesión y se guarda en ella; RF-1.2 / RF-7.3):
    - Entrada con parámetros de envío → `envio_id` del correo de origen, `atribucion = directa`.
    - Entrada **sin parámetros** → `envio_id` = último envío por el que **ese contacto** entró antes,
      `atribucion = heredada`; si nunca entró por un envío, `envio_id = NULL`,
      `atribucion = directo`. La ventana máxima de herencia es un parámetro de configuración
      (propuesta: 90 días, *a validar por negocio*).
    - **Otro invitado del mismo enlace** → mismo `envio_id`, `contacto_id` distinto (su propio correo
      verificado).
    - Bandera `curado | descubrimiento` (RF-7.4) calculada en servidor comparando el `perfil_id`
      con el conjunto curado vigente de la cuenta.
    - Ruta `instruccion | filtros` según cómo llegó el cliente al resultado (RF-2.6).
  - `ConsultarInformeTelemetria`: solo rol observador (o superior); devuelve cada informe con
    `estado: con_dato | sin_dato`, periodo consultado y el reparto de atribución
    (`directa | heredada | directo`) para que la regla sea visible.
  - `RetencionEventos`: sustituye `contacto_id` por `contacto_seudonimo` (hash con sal de servidor)
    en eventos con más de 12 meses y borra los de más de 24; registra su corrida en
    `tareas_ejecucion` como las demás tareas (QA-13, ADR-0005).
- **Interfaces / contratos:**
  - `POST /api/v1/eventos` en el host del portal (`people.trycore.com`), mismo origen (sin CORS),
    cookie de sesión `__Host-ps`, cuerpo
    `{"visita_id":"…","eventos":[{"tipo":"ficha_abierta","ocurrido_en":"…","perfil_id":"…"}]}`,
    máx. 50 eventos por lote y 16 KB por cuerpo; responde `204` siempre que la sesión sea válida
    (incluso con descartes) y `401` sin sesión. `sendBeacon` ignora la respuesta.
  - `POST /api/v1/eventos/acceso` en `people.trycore.com`, sin cookie, cuerpo
    `{"visita_id":"…","token":"<token firmado del enlace>","eventos":[{"tipo":"enlace_abierto","ocurrido_en":"…"}]}`;
    responde siempre `204`; `429` solo lo emite el limitador de la aplicación.
  - `GET /api/v1/panel/informes/{embudo|curaduria|filtros|ruta|sin-resultados}?desde=&hasta=&cuenta=`
    en `people-panel.trycore.com`, rol observador.
  - Esquema de `eventos` (propuesto): `id BIGINT`, `mes CHAR(7)`, `recibido_en`, `ocurrido_en`,
    `tipo`, `visita_id NULL`, `sesion_id NULL`, `cuenta_id`, `enlace_id`, `envio_id NULL`,
    `atribucion` (`directa|heredada|directo`), `contacto_id NULL`, `contacto_seudonimo NULL`,
    `perfil_id NULL`, `ambito` (curado/descubrimiento), `ruta`, `carga JSON` (filtros, texto de
    consulta sin coincidencia ya enmascarado). **Ninguna columna de correo.** Índices
    `(mes, recibido_en)`, `(cuenta_id, recibido_en)`, `(tipo, recibido_en)`, `(visita_id)`,
    `(contacto_id, envio_id)`.

## 4. Vistas y registro de la decisión (Paso 6)

```mermaid
sequenceDiagram
    autonumber
    participant N as Navegador (apps/portal)
    participant CF as Cloudflare
    participant AC as API PHP · RegistrarEventosAcceso
    participant API as API PHP · RegistrarEventos
    participant S as Sesión (MariaDB)
    participant E as Tabla eventos (append-only)
    participant P as Panel · rol observador

    Note over N,AC: Tramo anónimo (pantalla de acceso, sin sesión)
    N->>CF: POST /api/v1/eventos/acceso (visita_id, token, enlace_abierto)
    CF->>CF: límite de tasa por IP
    CF->>AC: bypass de caché /api/*
    AC->>AC: verifica firma del token → enlace, cuenta, envío
    AC->>E: INSERT (contacto_id NULL)
    AC-->>N: 204 siempre
    Note over N,API: Tramo con sesión
    N->>N: acumula eventos RF-7.1 en cola en memoria
    N->>CF: sendBeacon POST /api/v1/eventos (lote + visita_id, cookie __Host-ps)
    Note over N,CF: respaldo: fetch keepalive si sendBeacon devuelve false
    CF->>API: bypass de caché /api/*
    API->>S: resuelve sesión → cuenta, enlace, contacto_id, envío y atribución
    API->>API: valida esquema, calcula curado/descubrimiento y ruta
    API->>E: INSERT del lote (una sentencia) + completa contacto_id de la visita
    alt fallo de escritura
        API-->>API: cuenta el fallo y descarta (≤ 1 % tolerado)
    end
    API-->>N: 204 (ignorado por sendBeacon)
    P->>API: GET /api/v1/panel/informes/embudo (people-panel.trycore.com)
    API->>E: SELECT sobre vistas v_*
    API-->>P: informe con estado con_dato / sin_dato y reparto de atribución
```

```mermaid
flowchart LR
    subgraph Portal["apps/portal (estático) · people.trycore.com"]
      T[telemetria: cola + emisor + visita_id]
    end
    subgraph API["server/ (PHP 8.3, hexagonal)"]
      RA[RegistrarEventosAcceso] --> PR[(puerto RepositorioEventos)]
      RE[RegistrarEventos] --> RS[ResolverAtribucion]
      RE --> PR
      CI[ConsultarInformeTelemetria] --> PR
      RT[cron RetencionEventos] --> PR
      ACC[Servicio de acceso · ADR-0002] -->|codigo_solicitado / fallido / concedido| RA
    end
    PR --> DB[(MariaDB · eventos + vistas v_*)]
    T -->|POST /api/v1/eventos/acceso · sin sesión| RA
    T -->|POST /api/v1/eventos · con sesión| RE
    PA["apps/panel · people-panel.trycore.com"] -->|GET informes| CI
    HS[(HubSpot · ADR-0005)] -.->|negocios y cierres: se leen allí| PA
```

**Decisión:** la telemetría es una capa propia, mínima y de primera parte. El cliente emite lotes
sin identidad; el servidor los atribuye con la sesión (o, en el paso de acceso, con el token firmado
del enlace) y los guarda en una tabla append-only que identifica a la persona solo por `contacto_id`.
Las entradas sin parámetros heredan el último envío por el que entró ese contacto, con la marca
`heredada` visible en los informes. Los informes son SQL servido al panel, con definiciones fijadas
en el slice de EP-008, y las métricas comerciales se leen de HubSpot (ADR-0005). Ninguna herramienta
externa de analítica.

**Trade-offs aceptados:**
- Se pierde la riqueza «gratis» de una herramienta de analítica (mapas de calor, cohortes
  prediseñadas) a cambio de no enviar datos personales a terceros y de mantener la CSP cerrada.
- Un endpoint sin sesión amplía la superficie de ataque; se acota con tipos cerrados, token firmado,
  respuesta constante y límite de tasa. Los eventos anónimos pueden inflarse con tokens válidos
  robados; se acepta porque solo afectan al primer escalón del embudo y quedan separados por
  `contacto_id NULL`.
- Sin cola persistente: un fallo de BD pierde eventos. Se acepta porque la solicitud (el dato que de
  verdad importa) tiene su propia durabilidad y porque el embudo toma «solicitud enviada» de la tabla
  de solicitudes.
- `sendBeacon` no confirma entrega: la pérdida real en el cliente solo se estima (comparando
  sesiones con evento «entrada» contra sesiones abiertas en servidor).
- La atribución heredada puede acreditar a un envío una visita que en realidad vino de otra parte
  (un reenvío interno, un marcador guardado hace meses). Se limita con la ventana y se hace visible.

## 5. Análisis del diseño (Paso 7)

> Resultado final tras la evaluación adversarial (ATAM-lite). ✅ solo cuando hay medida o un plan de
> verificación concreto; ⚠️ cuando el diseño lo permite pero falta validar un número o una regla de
> negocio; ❌ cuando el diseño no lo satisface.

| Driver | ✅/⚠️/❌ | Evidencia / medida | Riesgo residual |
|--------|---------|--------------------|-----------------|
| UC-17 · informes sin trabajo manual | ⚠️ | Cinco vistas SQL servidas al panel con `con_dato / sin_dato`. Plan: el slice de EP-008 escribe la definición de cada informe como escenario G/W/T y un test de contrato por vista con un conjunto de eventos fijo y resultado esperado | Las definiciones («abandono», ventana del embudo, «acierto») aún no existen; hasta que el slice las fije, el informe puede medir algo distinto de lo que el negocio espera |
| QA-21 · 100 % de solicitudes vinculadas | ✅ | La solicitud toma cuenta, contacto, sesión, conjunto curado y envío de la sesión al crearse, no de los eventos. Plan: columnas `NOT NULL` en la tabla de solicitudes (salvo `envio_id`, que admite `directo` explícito) y test de integración que crea solicitudes en los tres casos de atribución y comprueba los cinco vínculos | Una solicitud `directo` cumple la regla pero no tiene correo de origen; la medida debe leerse como «vinculada o declarada directa» |
| QA-21 · ≥ 99 % de sesiones atribuidas a un envío | ⚠️ | Atribución directa por parámetros más herencia del último envío del contacto; el informe muestra el reparto `directa / heredada / directo`. Plan: medir el reparto en las dos primeras semanas tras el primer boletín | La cifra depende de una regla aún no validada por negocio (ventana incluida); con herencia amplia el 99 % se alcanza «por construcción» y deja de medir algo real |
| QA-21 · pérdida de eventos ≤ 1 % | ⚠️ | `sendBeacon` + `keepalive`; fallos de servidor contados. Plan: comparar sesiones abiertas en servidor contra sesiones con evento de entrada, y `acceso_concedido` (servidor) contra `enlace_abierto` (navegador) de la misma visita | Sin medida en el navegador (bloqueadores, Safari, ModSecurity sobre el POST, CRN-18); la tolerancia del 1 % sigue *a validar* y exige prueba real tras Cloudflare y ModSecurity |
| QA-5 · Ley 1581 | ⚠️ | 0 correos en `eventos` (solo `contacto_id`); 0 textos de ficha ni datos de perfil; sin terceros; seudonimización a 12 meses y borrado a 24 por tarea. Plan: test de esquema que falla si aparece una columna o clave JSON con correo; test del enmascarado sobre consultas con correos y teléfonos | La consulta literal puede traer nombres propios que el enmascarado no detecta; la retención es una propuesta, no una decisión validada |
| QA-3 · el endpoint anónimo no filtra ni se abusa | ⚠️ | Tipos cerrados, token firmado verificado en servidor, `204` constante, sin correo en el cuerpo, 5 eventos / 2 KB por petición, límite por IP en la aplicación (fuera de la regla de Cloudflare). Plan: test de respuesta idéntica (cuerpo, código y tiempo) para token válido, inválido y revocado; prueba de carga que confirme el `429` | El límite de 30 peticiones por minuto por IP está *a validar*; oficinas detrás de una misma IP pueden chocar con él |
| QA-2 · sin coste en el primer render | ✅ | Módulo propio sin SDK, emisión diferida fuera del camino crítico. Plan: comprobación en CI del tamaño comprimido del módulo (< 2 KB) y del JS inicial total (≤ 200 KB), y Lighthouse con y sin el módulo en Slow 4G | — |
| QA-6 · la solicitud no depende de la telemetría | ✅ | Tablas y transacciones separadas; «solicitud enviada» se deriva de la tabla de solicitudes. Plan: test de integración con la tabla `eventos` bloqueada o caída que confirma que la solicitud se persiste y se confirma | — |
| QA-13 · retención vigilada | ✅ | `RetencionEventos` registra cada corrida en `tareas_ejecucion` y entra en la alerta de 2× su intervalo (ADR-0005). Plan: test con reloj simulado sobre eventos de 11, 13 y 25 meses | Si la tarea deja de correr, la retención se incumple en silencio hasta que salte la alerta (≤ 48 h) |
| CON-3 · sin dependencias de runtime | ✅ | Sin SDK de analítica ni paquetes nuevos; `stack-allowlist.json` prohíbe SDKs de terceros en `apps/portal` y `apps/panel`. Plan: el hook `stack-guard.sh` y el gate `stack_arch` lo comprueban | — |
| CRN-10 · retención y datos personales | ⚠️ | Retención de 24 meses aceptada por el sponsor (2026-09-25), seudónimo a los 12, con mecanismo técnico | Falta reflejarla en el texto del aviso de privacidad |
| CRN-5 · medición del correo sin píxel fiable | ⚠️ | La entrada al portal y el clic se miden en primera parte y sirven de señal fiable; la apertura por píxel queda como `sin_dato` cuando no llega | La regla «3 envíos sin abrir» (RF-18.6) pasa a medirse por clic o entrada, lo que cambia su significado (ver §6) |

**Drivers no resueltos en esta iteración:** la
regla de atribución heredada y su ventana (QA-21), la tolerancia de pérdida (QA-21), el límite de
tasa del endpoint anónimo (QA-3) se devuelven al backlog
arquitectónico. Las definiciones de los informes (UC-17) pasan al slice de EP-008.

## 6. Consecuencias

- **Positivas:**
  - Atribución confiable: la identidad sale de la sesión verificada o del token firmado, nunca del
    cliente.
  - El embudo empieza donde empieza de verdad: la apertura del enlace, antes del código de acceso.
  - Menos dato personal repetido: los eventos solo conocen `contacto_id`; suprimir o seudonimizar a
    una persona es un cambio acotado.
  - Cero dependencia de terceros para analítica; la CSP se mantiene en `'self'`.
  - El insumo de reclutamiento inverso (V2-1) queda recogido desde el MVP con la consulta literal.
  - Una sola fuente por número: telemetría en el portal, negocio en HubSpot (ADR-0005).
  - La regla de atribución es visible y reversible: cambiarla no exige reescribir eventos.
- **Negativas:**
  - Cada informe nuevo es trabajo de desarrollo (consulta + pantalla), no configuración.
  - Dos endpoints de eventos en lugar de uno; su límite de tasa vive en la aplicación (la única regla gratuita de Cloudflare se reserva al acceso, ADR-0007), así que cada petición abusiva cuesta un proceso PHP.
  - Pérdida de eventos no totalmente medible en el navegador.
  - Nueva tarea programada `RetencionEventos` que mantener dentro de la vigilancia de QA-13.
- **Riesgos:**
  - El texto literal de búsqueda puede traer datos personales no previstos que el enmascarado no
    reconoce (nombres propios).
  - El endpoint anónimo puede recibir ruido con tokens válidos reenviados; infla solo el primer
    escalón y se distingue por `contacto_id NULL`.
  - Si la herencia es demasiado amplia, el indicador de ≥ 99 % se cumple sin significar nada.
  - ModSecurity puede bloquear los POST de eventos (CRN-18); hay que probarlo con cargas reales antes
    de producción.
  - El crecimiento de la tabla es bajo (decenas de cuentas); se revisa en cada release y se migra a
    particionado nativo solo si una consulta de informe supera su presupuesto.
- **Decisiones de la revisión única (sponsor, 2026-09-25):**
  - **Retención de la telemetría (CRN-10): 24 meses**, con seudónimo a los 12. Hay que reflejarla en
    el aviso de privacidad.
  - **Regla «3 envíos sin abrir» (RF-18.6): por clic o entrada, no por apertura.** El píxel no es
    fiable con SMTP propio; se acepta que una cuenta que lee sin hacer clic cuente como «sin abrir».
- **Trade-offs de negocio abiertos (decide Mercadeo con el responsable de datos):**
  - **Atribución heredada del último envío** y su ventana (propuesta de 90 días): define cuánto
    crédito recibe el correo curado en los informes.
  - **Trade-off de negocio pendiente (H32, revisión 2026-09-26): criterio estadístico del A/B con y
    sin Perfil Objetivo (RF-13.1)** — umbral de decisión, ventana, muestra mínima, unidad de
    asignación (cuenta o sesión) y qué pasa si al cierre no hay potencia. Con decenas de cuentas el
    A/B probablemente no alcanza significación; hay que decidir antes de encender el experimento si
    se acepta una lectura descriptiva o se decide por otra vía. La captura técnica ya está resuelta
    (ver «Revisión adversarial» al final).
  - **Trade-off de negocio pendiente (H32): definición de «sesión real»** para las reglas de
    retirada de §14.7 y RF-14.2 más allá de la exclusión técnica de sesiones internas (p. ej. umbral
    mínimo de actividad o de cuentas distintas para que la regla del 50 % cuente).
- **Riesgos nuevos de la revisión adversarial (2026-09-26)**, pendientes de numerar en el backlog:
  descritos al final de la subsección «Revisión adversarial».

## 7. Trazabilidad

- Drivers: [0000-drivers-y-asrs.md](0000-drivers-y-asrs.md) — UC-17, QA-21, CRN-10 (apoyo: UC-1,
  UC-16, QA-2, QA-3, QA-5, QA-6, QA-13, CON-3, CRN-5, CRN-18).
- PRD: [portal-people-service.md](../01-prd/portal-people-service.md) — RF-7.1–RF-7.4, RF-2.6.3,
  RF-18.6, RF-1.2, §8.3 (persistencia de telemetría en MariaDB), §11 (KPIs de telemetría y de
  HubSpot).
- HU / Flows: EP-008 · HU-108–112 (las definiciones de los informes se escriben en el OpenSpec change
  del slice de EP-008); apoyo EP-001 (paso de acceso) y EP-011 (correo curado).
- ADR relacionadas: [0001](0001-estilo-y-stack-base.md) (stack y módulos),
  [0002](0002-identidad-acceso-y-sesiones.md) (sesión, `invitado_id` como `contacto_id`, token
  firmado del enlace, eventos del servicio de acceso),
  [0005](0005-integraciones-y-trabajo-diferido.md) (HubSpot como sistema de registro comercial,
  tareas programadas y alertas, medición del correo),
  [0007](0007-entornos-despliegue-y-perimetro.md) (CSP, límite de tasa de ambos endpoints,
  ModSecurity).
- Stack operacionalizado en: `.claude/config/stack-allowlist.json` — esta ADR **no añade**
  dependencias; prohíbe SDKs de analítica de terceros en `apps/portal` y `apps/panel`.


## Enmienda de plataforma (iteración 8, 2026-09-25)

> Se conservan: emisión por lotes con `sendBeacon`/`keepalive`, endpoint anónimo acotado para el paso
> de acceso, registro solo de inserción, informes como vistas con «sin dato» explícito, atribución al
> último envío, sin SDK de analítica de terceros y la retención de 24 meses (decisión del sponsor).
> Donde el texto anterior diga PHP, MariaDB o cron, rige esta tabla.

| Mecanismo (texto anterior) | Implementación vigente |
|----------------------------|------------------------|
| Tabla `eventos` con partición lógica por columna `mes` en MariaDB | Tabla `telemetria.eventos` con **particionado declarativo nativo** `PARTITION BY RANGE (fecha)` mensual; la retención de 24 meses es `DETACH` + `DROP` de la partición vencida, sin borrados fila a fila |
| Vistas `v_embudo_cuenta`, `v_acierto_curaduria`, `v_filtros_usados`… en MariaDB | Mismas vistas en PostgreSQL, servidas por Route Handlers del panel (rol observador) |
| Endpoints PHP `RegistrarEventos` y `RegistrarEventosAcceso` | Route Handlers `POST /api/v1/eventos` y `POST /api/v1/eventos/acceso` del portal con esquema `zod` por tipo (*el segundo se retira en la consolidación, 2.ª pasada: ver «Revisión adversarial», fila del endpoint anónimo*) |
| Limitador de eventos en la aplicación (tabla MariaDB) | Tabla `limites` en PostgreSQL (ADR-0010); los eventos siguen fuera de la regla única de Cloudflare |
| Cron `RetencionEventos` | Tarea `retencion_eventos` del planificador del worker (ADR-0009) |
| Apertura de correo por píxel propio con SMTP del hosting (CRN-5) | Apertura por el seguimiento de Mailgun, recibida por webhook (ADR-0009), tratada como señal débil; la regla de «3 envíos sin abrir» sigue midiéndose por clic o entrada (T-10) |
| ModSecurity puede bloquear los POST de eventos | No aplica |

**Veredictos que cambian en §5:** CRN-5 ✅ (eventos de Mailgun firmados); el resto sin cambios.

### Revisión adversarial (2026-09-26)

> Incorpora los hallazgos H9, H13, H24, H26, H32, H40 y H43 de la revisión multiagente en lo que toca a
> la telemetría. Donde el texto anterior o la tabla de la enmienda digan otra cosa, rige esta
> subsección. Verificaciones con el prefijo nuevo por ADR (`V6-n`); las de otros ADR se citan como
> `V8-n` (ADR-0008) y `V10-n` (ADR-0010). «V2-1» en §6 es la línea de Fase 2 del PRD (reclutamiento
> inverso), no una verificación de ADR-0002.

| Mecanismo (texto anterior) | Implementación vigente | Hallazgo |
|----------------------------|------------------------|----------|
| `PARTITION BY RANGE (fecha)` sin decir qué es `fecha` | La clave es `recibido_en` (reloj del servidor), nunca `ocurrido_en` del cliente: un reloj de navegador desajustado no puede mandar filas a meses sin partición. PK `(id, recibido_en)` | H26 |
| Particiones mensuales sin creación futura | La creación inicial (tabla, partición `DEFAULT` y las del mes en curso y los **tres siguientes**) la hace el script de roles de ADR-0008 (`packages/infra/bootstrap/roles.sql`) con `doadmin`, llamando a `telemetria.crear_particiones()` (sin parámetros: el script no tiene la sal, que solo recibe el worker y no se guarda en la BD; *corregido en la consolidación, 2.ª pasada: antes llamaba a `mantener_eventos(sal)`*), porque el dueño es `NOLOGIN` y `ps_migrador` no es miembro; los cambios de esquema de `eventos` siguen el mismo procedimiento manual que la auditoría (ADR-0003). `migrar` **no** crea particiones (*corregido en la consolidación: el texto anterior decía «la migración inicial» y ADR-0010 atribuía la creación a `migrar`*). La tarea `retencion_eventos` del worker (diaria; único nombre de la tarea, I-4) mantiene siempre tres meses por delante. La partición `DEFAULT` es red de seguridad, no destino: si recibe una fila, `vigilar` alerta (junto con «menos de dos meses creados por delante»), leyendo ambas señales por `telemetria.estado_particiones()` (fila de permisos) y la función de mantenimiento mueve esas filas a su partición antes de crearla (con filas en `DEFAULT` para ese rango, crear la partición falla). Un INSERT del mes siguiente nunca falla | H26 |
| `DETACH` + `DROP` ejecutados por `ps_worker`, que no es dueño | La tabla `telemetria.eventos` y sus particiones pertenecen a un rol **sin login** `ps_eventos_dueno`, dueño del **esquema propio `telemetria`** (*consolidación, 2.ª pasada*: fuera de los esquemas de `ps_duenio`, para que `ps_migrador` no pueda hacer `DROP` de la tabla), de esa tabla, de sus funciones y de las vistas `v_*`. Una función `telemetria.crear_particiones()` `SECURITY DEFINER`, sin parámetros, crea y adjunta las particiones futuras y mueve las filas de `DEFAULT`; la usan el script de roles y la función de mantenimiento. Una función `telemetria.mantener_eventos(sal)` `SECURITY DEFINER`, propiedad de ese rol, con `search_path` fijo y **sin parámetros de fecha** (usa la fecha del servidor, así un llamante no puede adelantar el borrado; su único argumento es la sal `EVENTOS_SEUDONIMO_SAL`, que solo recibe el worker y no se guarda en la BD), hace todo el mantenimiento: llamar a `crear_particiones()`, seudonimizar lo que cumple 12 meses y `DETACH` + `DROP` lo que cumple 24. `ps_worker` solo tiene `EXECUTE` sobre ella, por su *pool* normal (sin credencial aparte); no puede crear, soltar ni leer eventos. Se descarta `pg_partman` (extensión más que mantener para una operación de 20 líneas, y su disponibilidad en la BD administrada no está verificada) y un rol con login aparte (otra credencial más que custodiar: por eso no existen `ps_mantenimiento` ni `MANTENIMIENTO_DATABASE_URL`). Crear el rol y la función entra en el script de roles de ADR-0008 (V8-10) | H26 |
| Bloqueos de mantenimiento sin acotar | Las particiones nuevas se crean como tabla suelta y se adjuntan con `ATTACH PARTITION` (bloqueo `SHARE UPDATE EXCLUSIVE`, no frena los INSERT). `DETACH ... CONCURRENTLY` no se puede usar mientras exista `DEFAULT`, así que el `DETACH` es normal con `lock_timeout = '2s'`; si no obtiene el bloqueo, se reintenta en la siguiente corrida diaria (la retención admite un día de holgura) | H26 |
| Permisos implícitos sobre `eventos` | **Lista normativa** (ADR-0008 la cita sin copiarla): `ps_portal`: `USAGE` de `telemetria`, `INSERT` en `eventos` y `EXECUTE` de `telemetria.completar_visita(visita_id, contacto_id)`, `SECURITY DEFINER` de `ps_eventos_dueno` que hace el `UPDATE (contacto_id)` de los eventos de esa visita con la condición de 24 h dentro; sin `SELECT`, `UPDATE` ni `DELETE` directos (*consolidación, 2.ª pasada: el texto anterior daba `UPDATE (contacto_id)` directo «sin `SELECT`», que en PostgreSQL falla porque un `UPDATE` con `WHERE` exige `SELECT` sobre `visita_id` y `recibido_en`*); `SELECT` de `operacion.experimentos`. `ps_panel`: `SELECT` solo sobre las vistas `v_*`, no sobre la tabla; `SELECT`, `INSERT` y `UPDATE` en `operacion.experimentos` (configurar experimentos, por la unidad de trabajo). `ps_worker`: solo `EXECUTE` de `mantener_eventos(sal)` y de `telemetria.estado_particiones()`, `SECURITY DEFINER` de `ps_eventos_dueno` que devuelve, sin datos de eventos, el número de filas en `DEFAULT` y los meses de partición creados por delante (la usa `vigilar`, ADR-0009; *revisión de coherencia*); sin `SELECT` sobre `eventos`. `ps_exportador`: `SELECT` sobre `telemetria` pero el volcado excluye sus datos (fila «Exportación semanal»). Las vistas `v_*` son propiedad de `ps_eventos_dueno` y se definen en el script de roles (ADR-0008), que se ejecuta a mano con `doadmin` una vez por entorno al aprovisionarlo y de nuevo (idempotente, con dos personas) cada vez que cambian sus objetos (`auditoria`, `telemetria`, vistas `v_*`) o una migración añade objetos que requieren `GRANT` nuevos emitidos por él (regla de ADR-0008; incluye cuando EP-008 añade o cambia una vista): ni `ps_duenio` ni `migrar` leen `eventos`. Todos los `GRANT` sobre `telemetria` los emite ese script; los de `experimentos` (tabla de `ps_duenio`), la migración que la crea | H26, H0 |
| El endpoint anónimo «verifica la firma del token del enlace» | Rige el modelo único de ADR-0002 (H9): token **opaco** aleatorio, guardado solo como SHA-256, sin firma ni `LINK_SIGNING_SECRET`. **El endpoint anónimo `POST /api/v1/eventos/acceso` (`RegistrarEventosAcceso`) se retira** (*consolidación, 2.ª pasada*: ADR-0002 prohíbe que el navegador envíe el token en eventos, y un segundo endpoint que recibe tokens era un segundo oráculo). El único tipo que aceptaba del navegador, `enlace_abierto`, lo escribe ahora **el servidor** en `POST /acceso/enlace` (que ya recibe el token para abrir el flujo de código y ya calcula el hash y busca siempre el enlace, con la neutralidad y la limitación de ADR-0002), en la misma transacción que `enlace_consultado` de `accesos_log`, con el `visita_id` que el navegador manda en ese cuerpo; `codigo_solicitado`, `codigo_fallido` y `acceso_concedido` ya los escribía el servidor. El clic del boletín no pasa por `/r/…`: **se mide solo como `enlace_abierto`** con el `envio_id` que el servidor lee de la columna `enlace_tokens.envio_id` del token por destinatario (ADR-0002, H9; nula para el token de cuenta) (`enlace_consultado` queda como registro de seguridad, no como medida); `contacto_id` sigue `NULL` hasta el código verificado, porque un enlace reenviado lo abre otra persona. *Texto anterior (endpoint anónimo con el token en el cuerpo) sustituido* | H9 |
| Texto literal de la consulta sin coincidencia en `carga` de cada evento | El texto vive **una sola vez**, en `operacion.consultas_sin_coincidencia` (ADR-0004), que aplica el enmascarado, la retirada de nombres y apellidos de perfiles del inventario (diccionario determinista) y guarda `modelo_permitido` (falso si la sesión eligió «Interpretar sin servicio externo»; el navegador lo envía porque la elección vive en el dispositivo, y solo puede restringir). El evento `busqueda_sin_resultado` guarda solo `consulta_id`. Así hay un único punto de enmascarado y de retención y `proponer_lexico` puede excluir las consultas de quien rechazó el modelo. La tabla hereda la retención de la telemetría (24 meses) | H43 |
| Exportación semanal de la BD completa | Los **datos** de `telemetria.eventos` quedan fuera de `exportar_banco` (`--exclude-table-data=telemetria.eventos*`, particiones incluidas; el esquema sí va). La telemetría no hace falta para recuperar el banco y no debe acabar en Google Drive con `contacto_id` y retención distinta. Lo aplica ADR-0010 §2 (fila de la exportación, alineada en la consolidación) | H13 |
| Sal de seudonimización «de servidor» | Secreto `EVENTOS_SEUDONIMO_SAL`, custodiado con los demás fuera del proveedor (ADR-0010). Perderla o rotarla solo rompe la continuidad entre seudónimos antiguos y nuevos (no se pueden unir); no impide la retención ni expone datos. Se acepta y se registra la fecha de rotación | H24 |
| «Logs sin datos personales» sin mecanismo | Los dos endpoints de eventos **no registran cuerpos**: solo contadores por lote (recibidos, aceptados, descartados por tipo y motivo, fallos de escritura). Un fallo de `zod` se registra por ruta del campo y código, nunca por valor; el token solo viaja en el cuerpo de `POST /acceso/enlace` (ADR-0002), nunca en la URL ni en un lote de eventos (no llega a los logs de Cloudflare ni de App Platform); los errores de `pg` pasan por el logger central con redacción de ADR-0010 antes de salir. La IP solo la usa el limitador y no se escribe en los logs de eventos | H40 |
| `TipoEvento` = RF-7.1 + cuatro de acceso | Se amplía para poder ejecutar las pruebas de falsación del PRD (RF-12.1, RF-13.1, RF-14.2, RF-14.7, §14.7 · D-17). Ver «Eventos de falsación» abajo | H32 |

#### Eventos de falsación (H32)

Tipos nuevos, con carga cerrada por tipo en el esquema `zod` y **sin texto libre** (el único texto
guardado es el de la consulta sin coincidencia, en su tabla):

| Tipo | Carga | Mide |
|------|-------|------|
| `instruccion_enviada` | `origen` (`sugerencia_sin_editar` \| `sugerencia_editada` \| `libre`), `sugerencia_id` si la hubo, `fuente` (`determinista` \| `modelo`), número de criterios resultantes | RF-12.1 (> 60 % de sugerencias sin editar) y la ruta de entrada |
| `perfil_objetivo_editado` | tipo de cambio (`añadido` \| `quitado` \| `modificado`) y clase de criterio; **nunca** su contenido (RF-13.4: la especificación vive en el dispositivo) | RF-13.1 (si se reconoce como propio o se reescribe) |
| `cero_mostrado` | ruta, número de criterios obligatorios | camino del cero (EP-010) |
| `cercanos_mostrados` | número de perfiles cercanos, ids de los criterios que fallan | «lo más cercano» y su uso |
| `composicion_vista` / `composicion_descartada` | `composicion_id` | RF-14.7 (efecto de las composiciones de referencia) |

- **Orden dentro de la visita:** cada evento lleva `n`, un contador monótono por `visita_id` que pone
  el cliente; el servidor ordena por `(visita_id, n)` y no por relojes. Con eso «filtros aplicados
  después de una instrucción» (RF-14.2, §14.7) y «tiempo hasta el primer perfil por ruta» (HU-111)
  son consultas sobre la secuencia, sin eventos adicionales.
- **Variante asignada en servidor:** tabla `operacion.experimentos` (nombre, variantes, unidad de
  asignación, activo, desde, hasta). Al abrir la sesión, `ResolverAtribucion` calcula la variante como
  `HMAC(sal del experimento, id de la unidad) mod n` y la guarda en
  `identidad.sesiones_portal.variantes` (nombre de tabla de ADR-0002). La unidad de asignación es un
  campo configurable del experimento; la **cuenta** como unidad es **propuesta por defecto, pendiente
  de T-25** (no normativa): evita que colegas de la misma cuenta y sesiones sucesivas vean variantes
  distintas (contaminación), a costa de menos potencia estadística (R-67). El render del portal lee la variante de la sesión
  para mostrar u ocultar el Perfil Objetivo; el cliente no puede elegirla (una clave `variante` en el
  cuerpo del lote se descarta). Cada evento se enriquece con las variantes de su sesión. Sin
  experimento activo todos reciben el control. Es una bandera en tiempo de ejecución, distinta de la
  retirada compilada de CRN-19 (V8-3).
- **Sesiones internas:** el servidor marca `interna = true` en la sesión cuando el invitado es de
  `@trycore.com` (vistas previas del comercial o de Mercadeo) y los eventos la heredan (marca técnica,
  siempre se captura). **Excluirlas de las vistas de falsación es propuesta por defecto, pendiente de
  T-26** (no normativa): forma parte de la definición de «sesión real», que decide negocio.
- **Versión del esquema:** cada lote lleva `esquema_version`; añadir un tipo es aditivo. Los tipos se
  incorporan al contrato en el **primer slice que los emite** (EP-002 para búsqueda, filtros, cero y
  cercanos; EP-009 para instrucción, Perfil Objetivo, composiciones y variante), no en EP-008: sin
  captura desde el primer día no hay trimestre que revisar. EP-008 sigue fijando las definiciones y el
  SQL de los informes. QA-21 y UC-17 trazan además a EP-002 y EP-009.
- **Vistas nuevas** (SQL en el slice de EP-008, aplicado en el script de roles con dueño `ps_eventos_dueno`; ver la fila de permisos): `v_falsacion_sugerencias`, `v_filtros_tras_instruccion`,
  `v_perfil_objetivo_ab`, `v_composiciones`, `v_tiempo_primer_perfil`.

#### Verificaciones

| ID | Verificación | Drivers |
|----|--------------|---------|
| V6-1 | **Cambio de mes y retención**: test de integración que crea particiones de meses pasados con datos sintéticos, ejecuta `mantener_eventos(sal)` como `ps_worker` y comprueba: tres meses creados por delante, `DEFAULT` vacía, INSERT del primer segundo del mes siguiente aceptado, seudonimización a 12 meses, partición de 25 meses eliminada. Conectado como `ps_worker`, `CREATE`, `DROP`, `DETACH` y `SELECT` directos sobre `eventos` fallan por permisos; una fila forzada en `DEFAULT` dispara la alerta de `vigilar`, que la detecta llamando como `ps_worker` a `telemetria.estado_particiones()` (devuelve el conteo de `DEFAULT` y los meses por delante, sin filas de eventos). **Visita y dueño** (*consolidación, 2.ª pasada*): como `ps_portal`, `completar_visita` rellena `contacto_id` en los eventos de su visita de las últimas 24 h y no toca los de otra visita ni los de más de 24 h; `UPDATE` o `SELECT` directos sobre `eventos` → error. Como `ps_migrador`, `DROP TABLE` o `ALTER TABLE` sobre `telemetria.eventos` → error. `crear_particiones()` sobre una BD vacía (como en el script de roles) deja el mes en curso y tres por delante sin necesitar la sal | QA-13, QA-21, CON-9 |
| V6-2 | **Eventos de falsación**: con un conjunto fijo de visitas (sugerencia sin editar, editada, libre, filtros tras instrucción, cero, cercanos, composición vista y descartada), las consultas base de cada vista nueva devuelven el resultado esperado; eventos fuera de orden de reloj se ordenan por `n` | UC-17, QA-21 |
| V6-3 | **Variante en servidor**: `variante` enviada por el cliente se ignora; el HTML con sesión de cada variante muestra u oculta el Perfil Objetivo; sesiones `@trycore.com` quedan con `interna = true`. *Condicionadas a T-25 y T-26:* la misma unidad (cuenta, si T-25 la confirma) recibe la misma variante en sesiones distintas; las sesiones internas quedan fuera de las vistas (si T-26 lo confirma) | UC-17 |
| V6-4 | **Logs sin datos personales**: lotes con correo y teléfono en la consulta, un campo `token` (descartado por `zod`), evento que falla `zod` y un error de escritura provocado; stdout no contiene el correo, el teléfono, el token, el texto de la consulta ni la IP | QA-5, CRN-10 |
| V6-5 | **Sin token en eventos** (*consolidación, 2.ª pasada*; sustituye a la prueba del endpoint anónimo retirado): `POST /api/v1/eventos/acceso` no aparece en el manifiesto del portal (V8-1); un lote de `POST /api/v1/eventos` con campo `token` se descarta; `POST /acceso/enlace` escribe `enlace_abierto` en la misma transacción que `enlace_consultado` (con el `envio_id` leído de `enlace_tokens.envio_id` si el token es de destinatario) y registrar `enlace_abierto` no altera la respuesta: para cada caso (token válido, inexistente, revocado), código, cuerpo y tiempo dentro de tolerancia son los mismos que sin telemetría; el contrato de la respuesta (200/410, token inexistente = mismo 410 que revocado) es el de ADR-0002; ningún camino verifica firmas. Misma prueba que la parte de telemetría de V2-6 | QA-3 |

#### Veredictos que cambian en §5

- **QA-13 · retención vigilada:** ✅ se mantiene, ahora con V6-1 (antes el mecanismo de la enmienda
  fallaba por permisos y por falta de particiones futuras).
- **UC-17 · informes:** sigue ⚠️, pero la captura para las pruebas de falsación ya existe (V6-2,
  V6-3); falta el criterio estadístico del A/B (trade-off de negocio en §6) y las definiciones de
  EP-008.
- **QA-5 · Ley 1581:** sigue ⚠️; la consulta literal pierde los nombres de perfiles del inventario y
  ya no se duplica en `eventos`; los logs se prueban (V6-4). Los nombres propios que no están en el
  inventario siguen sin detectarse (R-28).
- **QA-3 · endpoint anónimo:** ⚠️ se mantiene; V6-5 sustituye la prueba basada en firma y, tras la
  consolidación, la del endpoint anónimo, que se retira (el token solo llega a `POST /acceso/enlace`).

#### Riesgos nuevos (sin numerar; los numera el backlog)

- Con decenas de cuentas y asignación por cuenta, el A/B de RF-13.1 puede no tener potencia
  estadística; sin criterio fijado antes de encenderlo, el resultado se acomodará a lo que cada quien
  prefería (lo que §14.7 quiere evitar).
- Una partición `DEFAULT` con filas que nadie mueve bloquea la creación de la partición de su rango;
  lo mitiga la alerta de `vigilar` y la función de mantenimiento, pero depende de que la tarea corra.
- El origen de `instruccion_enviada` (sugerencia editada o no) y `modelo_permitido` los declara el
  navegador; un cliente manipulado puede sesgar la proporción de RF-12.1 (no la atribución). Se acepta:
  no hay otra fuente y el incentivo para falsearlo es nulo.
