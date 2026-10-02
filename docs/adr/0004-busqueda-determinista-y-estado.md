---
id: 0004
title: "Búsqueda determinista, estado en la URL e interpretación con Gemini"
date: 2026-09-25
status: accepted
authors:
  - setup-architecture (/build:architect)
tags: [busqueda, motor-de-criterios, interprete, estado-url, persistencia-local, gemini, llm-interpreter]
add:
  iteracion: 4
  fase_prd: "Fases 2–3 · EP-002, EP-009, EP-010"
---

# ADR 0004 — Búsqueda determinista, estado en la URL e interpretación con Gemini

> **Enmienda de plataforma (iteración 8, 2026-09-25):** el diseño de esta ADR se conserva; el
> servidor pasa de PHP a TypeScript y el cron al worker. Ver la sección «Enmienda de plataforma» al
> final. La subsección «Revisión adversarial (2026-09-26)» de esa enmienda rige sobre el texto
> anterior donde choquen (escritura superficial del estado, contrato único de URL, gate de QA-1,
> confianza de RF-12.3, léxico, armado de equipo).
>
> **Consolidación (2026-09-26, tras la revisión en paralelo):** esta ADR es la referencia única del
> contrato de URL (lista cerrada de parámetros, incluido `cmp` reservado), de la búsqueda y de Gemini;
> ADR-0008 remite a ella sin enumerar los parámetros. QA-1 queda ⚠️ hasta ejecutar V4-1 (igual que en
> ADR-0008 y el tablero). La persistencia de la vista por defecto y el umbral de confianza 0,8 pasan a
> ser propuestas por defecto pendientes de T-30 y T-32.
>
> **Enmienda de discovery (2026-10-02, EP-002):** la lista cerrada de parámetros de URL se amplía con
> Categoría, Sector, Disponibilidad y orden, y el descarte y el voto del sondeo pasan de `localStorage`
> al servidor por invitado. Ver la sección «Enmienda de discovery (2026-10-02)» al final; rige sobre
> el texto anterior donde choquen.

> Plantilla alineada al método **ADD** (Attribute-Driven Design, Len Bass — *Software Architecture in
> Practice*). Cada sección numerada corresponde a un paso del método. Las decisiones deben trazar a
> [0000-drivers-y-asrs.md](0000-drivers-y-asrs.md) y actualizar
> [_backlog-arquitectonico.md](_backlog-arquitectonico.md). Generada por la skill `setup-architecture`
> (`/build:architect`) e incorpora la evaluación adversarial ATAM-lite; un humano la promueve
> `proposed → accepted`.

## 1. Objetivo de la iteración y drivers seleccionados (Pasos 2–3)

- **Objetivo de la iteración:** diseñar la búsqueda del cliente de punta a punta: cómo se interpreta
  lo que escribe (algoritmo propio primero, Gemini solo para requerimientos pegados largos, D-24), cómo
  se calculan resultados, panel y evidencia con un único motor, dónde vive el estado (query string,
  dispositivo, servidor) y cómo se registra la demanda no cubierta, sin cerrar las decisiones
  irreversibles de §13.7. Cada driver de calidad sale de esta iteración con una forma concreta de
  medirlo.
- **Elemento(s) a refinar:** `packages/motor` (intérprete + motor de criterios), `packages/contratos`
  (esquema del Perfil Objetivo y del estado), `apps/portal` (codificador de estado y persistencia local),
  `server/` (endpoint de interpretación, adaptador `Gemini`, cron de propuestas de léxico, token de
  estado largo), todo servido desde `people.trycore.com`; la aprobación de léxico vive en
  `people-panel.trycore.com` (EP-006).
- **Drivers abordados:**
  - Funcionales: UC-5 (motor único e intérprete), UC-6 (estado en la URL y persistencia local),
    UC-8 (camino del cero y registro de demanda), UC-18 (Gemini acotado).
  - Atributos de calidad: QA-1 (P95 < 1 000 ms de la entrada al pintado, contador = resultados en el
    100 %, holgura con 300 perfiles sintéticos), QA-15 (vuelta al determinista ≤ 8 s, 100 % de consultas
    cortas sin modelo, 0 pantallas de error, 0 léxico sin aprobación), QA-16 (100 % de ida y vuelta,
    URL ≤ 2 000 caracteres, parámetros desconocidos sin error).
  - Restricciones: CON-6 (`GEMINI_API_KEY` solo en servidor), CON-8 (Gemini solo en RF-12.2.1 y
    RF-8.12.1, nunca datos de perfiles), CON-13 (estado en la URL es requisito duro), CON-14
    (interpretación separada de recuperación, rol como lista, Perfil Objetivo por dispositivo).
  - Concerns: CRN-6 (salida HTTPS a Gemini, cuota y coste), CRN-12 (dónde vive «Mi equipo»), CRN-16
    (umbrales sin fijar: texto largo y confianza de RF-12.3), CRN-19 (entrada por instrucción
    retirable).

## 2. Conceptos de diseño elegidos (Paso 4)

| Driver | Concepto / Táctica | Alternativas descartadas | Razón |
|--------|--------------------|--------------------------|-------|
| UC-5, QA-1 | **Recuperación en el cliente sobre el catálogo recortado completo** (táctica: *reducir sobrecarga / mantener copias de datos*). El navegador recibe el catálogo (ADR-0003) y calcula todo en memoria | Búsqueda en servidor por cada cambio (PHP + SQL); índice full-text de MariaDB; índice vectorial | Con ~30 perfiles el recálculo local es de microsegundos y evita un viaje de red por toque; RF-2.6.4 excluye índice semántico/vectorial y el hosting no lo soporta (CON-1) |
| QA-1 | **Presupuesto de latencia verificado como gate de CI** (táctica: *monitorizar / probar el rendimiento*): prueba Playwright sobre el build estático, Chromium con la CPU frenada 4× (aproximación a un teléfono de gama media) y un catálogo de **300 perfiles sintéticos**; se mide de la entrada del usuario al pintado y el merge se bloquea si el **P95 ≥ 1 s** | Benchmark solo del motor en Node (no mide el render de React, que es el coste real); medición manual en un teléfono; Lighthouse (no mide interacciones sucesivas) | El riesgo de QA-1 está en el render, no en el cálculo; solo una medida de extremo a extremo con CPU limitada lo detecta antes de producción |
| UC-5 | **Intérprete determinista propio en TypeScript puro**: normalización NFD sin tildes + minúsculas + plurales simples, tokenización, léxico término → IDs de catálogo con coincidencia exacta y difusa Damerau-Levenshtein con umbral por longitud de token, patrones regex (seniority, «8 años», modalidad, país/ciudad) | Librería de búsqueda difusa (Fuse.js, MiniSearch); Gemini para toda consulta; solo facetas sin texto libre | Sin dependencias (inodos, bundle, CON-3); la distancia acotada es explicable y testeable; D-24 fija algoritmo primero; RF-2.6 exige texto libre |
| UC-5, QA-1 | **Un solo motor de criterios** (RF-13.8) para panel de ajuste, tarjetas y tabla: obligatorio/deseable, tecnologías por «cualquiera», «cumple N de M» sin porcentajes, evidencia ✓/– con texto determinista desde el dato, «lo más cercano» = falla exactamente un obligatorio, opciones consecuentes con conteo (RF-13.7) | Lógica separada para panel y resultados; puntaje ponderado o porcentaje de ajuste; justificaciones redactadas por modelo | Un solo cálculo garantiza contador = resultados; el porcentaje oculta qué falla; RF-13.10.1 y RF-16.1 prohíben que un modelo redacte sobre personas |
| CON-14, CRN-19 | **Separación interpretación ↔ recuperación** tras la interfaz `Criterios` (esquema versionado del Perfil Objetivo, `rol` como lista). El intérprete y la entrada por instrucción son módulos retirables | Intérprete que filtra directamente el catálogo; `rol` escalar | RF-16.3/16.4: barata ahora, cara después; D-17 exige poder retirar la instrucción sin tocar ficha, cero ni demanda |
| QA-16, CON-13 | **Estado solo en la query string** (ADR-0001): la URL es la única fuente de verdad del estado de búsqueda (criterios, vista, ámbito, ficha abierta; «Mi equipo» no es estado de búsqueda y vive en servidor, CRN-12). Se lee con `useSearchParams` **dentro de un `<Suspense>`** (exigencia del export estático de Next.js) y se escribe con `router.replace`; parseadores tipados propios en `packages/contratos`; formato legible (`?rol=o:Backend|Frontend`), parámetro `v=` de versión de esquema, parámetros desconocidos ignorados | Estado en memoria/Redux o contexto de React duplicando la URL; estado completo en `localStorage`; base64 del JSON en un solo parámetro; siempre token en servidor | Una sola fuente evita desincronizar URL y pantalla; la URL legible es compartible y requisito duro; base64 no se lee ni degrada por parámetro; siempre-servidor agrega red a cada cambio |
| QA-16, QA-3 | **Desborde a token de estado largo** por encima de 2 000 caracteres (RF-19.8): el servidor guarda el estado y la URL queda `?v=1&s=<token>`. El token es **aleatorio de 128 bits** (`random_bytes(16)`, base64url, 22 caracteres), no derivado del contenido, **ligado a la sesión que lo creó** (guarda sesión y cuenta) y solo se resuelve con una sesión válida de la misma cuenta; en cualquier otro caso responde 404 neutro. Caduca a los 90 días (*a validar*) (tácticas: *limitar la exposición*, *autenticar*) | Token secuencial o hash del estado (adivinable o enumerable); token sin sesión (cualquiera con el enlace ve los criterios de la cuenta); ligar solo a la sesión exacta | 128 bits aleatorios hacen inviable adivinar un token; exigir sesión alinea el token con la puerta de acceso (ADR-0002). Ligarlo solo a la sesión exacta impediría que otro invitado de la misma cuenta abra una URL compartida (QA-16), por eso el alcance es sesión válida + misma cuenta |
| CON-14, UC-6 | **Persistencia local versionada solo para lo que es por dispositivo** (`localStorage` con esquema `v`, migración o descarte): Perfil Objetivo (D-16), vista por defecto cuando la URL no trae `vista`, descarte del sondeo y la elección del aviso de servicio externo. Nunca guarda estado de búsqueda | IndexedDB; cookies; persistencia en servidor por invitado | Volumen mínimo; D-16 fija por dispositivo; una cookie viaja en cada petición sin necesidad; separar preferencia de estado mantiene la regla de la query string |
| CRN-12 | **«Mi equipo» por invitado en servidor** (decisión del sponsor, revisión única 2026-09-25): tablas `equipos`/`equipo_perfiles` (ADR-0003) ligadas al invitado verificado y al enlace; cada invitado ve solo el suyo, lo recupera desde otro dispositivo y viaja completo a la solicitud. El Perfil Objetivo sigue por dispositivo (D-16) | En la URL (`equipo=`), por dispositivo | La identidad ya está verificada (ADR-0002), así que el equipo puede seguir al invitado; en la URL se perdía si el cliente no la conservaba y no sobrevivía al cambio de dispositivo |
| UC-18, QA-15, CON-8 | **Gemini tras el adaptador `Adapters/Gemini`** (frontera `llm-interpreter`), invocado solo si el texto supera un umbral (propuesta: 280 caracteres o 2 párrafos); salida estructurada con JSON schema contra la taxonomía; validación del JSON contra el catálogo (se descartan IDs inexistentes); timeout duro 6 s; ante fallo o demora el cliente aplica el intérprete determinista y avisa sin jerga (tácticas: *degradación*, *timeout*, *validación de entrada*) | Llamada directa desde el navegador; streaming; texto libre del modelo parseado con regex; reintentos síncronos | La llave nunca sale del servidor (CON-6); JSON schema elimina el parseo frágil; sin reintento síncrono se respeta QA-15 |
| UC-18, CRN-6 | **Verificación de la salida y vigilancia de la vuelta al determinista** (tácticas: *condición de entrada*, *monitorizar*): antes de EP-009 se prueba desde el hosting una llamada HTTPS real a `generativelanguage.googleapis.com` (condición de entrada de la épica). En producción cada llamada registra resultado y causa (sin el texto); si la **tasa de vuelta al determinista supera el 20 %** en una ventana de 24 h (mínimo 10 llamadas elegibles) se alerta al responsable técnico | Descubrir en producción que el hosting no sale a Google (hoy solo se ha probado `api.hubapi.com` y `api.anthropic.com`); sin métrica de vuelta al determinista | Si el hosting bloquea la salida, la degradación esconde el fallo: el cliente nunca ve un error y UC-18 queda muerto en silencio. La alerta convierte ese silencio en señal |
| CON-8, CON-10 | **Aviso al cliente antes de enviar el texto pegado** (táctica: *informar al actor*): cuando el texto supera el umbral, antes de llamar a Gemini el portal indica que el texto se procesará con un servicio externo y ofrece dos opciones: «Continuar» o «Interpretar sin servicio externo» (determinista). La elección se recuerda por dispositivo. Además se quitan del texto, antes de enviarlo, correos, teléfonos y URL (saneamiento determinista) | Enviar sin aviso; bloquear toda llamada hasta un consentimiento formal | El cliente puede pegar datos de terceros; avisar antes cumple el deber de información. La base legal de la transferencia internacional queda como trade-off de negocio abierto (§6) |
| CON-8 | **Minimización de datos hacia el modelo**: solo viaja el texto del cliente saneado + la taxonomía, nunca perfiles (RF-16.2); test de contrato sobre el payload saliente | Enviar perfiles para que el modelo «elija»; confiar en revisión manual | RF-16.1: el modelo no recupera ni ve perfiles; un test automatizado hace la regla verificable |
| UC-13, UC-18 | **Propuestas de léxico por cron semanal** con Gemini sobre consultas sin coincidencia (RF-2.6.3) + taxonomía, guardadas como propuestas pendientes de aprobación humana (RF-8.12.1) | Aprendizaje automático sin aprobación; propuestas en línea durante la búsqueda | D-24: nada entra al léxico sin persona; fuera de línea no afecta la latencia |
| UC-8 | **Especificación estructurada completa en la solicitud a medida** (RF-15.1) y **sondeo como tarjeta no-perfil** con reglas (≥ 8 resultados, fuera del curado, una vez por sesión, descarte persistente); voto como trabajo hacia HubSpot (ADR-0005) | Guardar solo el texto libre; sondeo como banner o modal; voto síncrono a HubSpot | RF-15.1 pide la especificación, no el texto; RF-10.1–10.4 fijan el formato; la cola desacopla del CRM |

## 3. Instanciación: responsabilidades e interfaces (Paso 5)

- **Elementos instanciados:**
  - `packages/contratos`: `PerfilObjetivo` (versionado, `v: 1`, `rol: string[]`), `Criterio`
    (`{campo, valores, peso: 'obligatorio'|'deseable', fueraDelBanco: string[]}`), `EstadoBusqueda`,
    parseadores/serializadores de query string, `ResultadoInterpretacion`, esquema JSON de salida para
    Gemini (generado del mismo tipo).
  - `packages/motor/interprete`: `normalizar`, `tokenizar`, `Lexico` (índice exacto + difuso),
    `patrones` (seniority, años, modalidad, geografía), `interpretar()`.
  - `packages/motor/criterios`: `evaluar()`, `opcionesConsecuentes()`, `masCercanos()`, `evidencia()`.
  - `apps/portal`: `useEstadoBusqueda` (envuelve `useSearchParams` + `router.replace`; todo componente
    que lo usa cuelga de un `<Suspense>`), `almacenLocal` (versionado con migraciones, solo
    preferencias), aviso de servicio externo, tarjeta de sondeo, pantalla del cero, flujo de solicitud
    a medida.
  - `server/`: `POST /api/v1/interpretar-requerimiento`, `GET /api/v1/lexico` (ETag),
    `POST /api/v1/estado` y `GET /api/v1/estado/{token}` (estado largo),
    `POST /api/v1/consultas-sin-coincidencia`, `GET /api/v1/equipo` y `PUT /api/v1/equipo` (CRN-12), puerto `InterpreteLlm` con adaptador
    `server/src/Adapters/Gemini`, tablas `estados_largos` y `llamadas_llm`,
    `server/cron/proponer-lexico.php`, `server/bin/verificar-salida-gemini.php`.
  - `e2e/rendimiento-filtrado.spec.ts` (Playwright) y fixture `catalogo-300-sinteticos.json`.
- **Responsabilidades:**
  - El **intérprete** convierte texto → `Criterios` + `confianza` + `tokensNoReconocidos`; nunca filtra.
    Los tokens no reconocidos se envían al servidor como consulta sin coincidencia (RF-2.6.3).
  - El **motor** es función pura `(catalogo, criterios) → {resultados, cercanos, conteoPorOpcion, evidencia}`;
    opciones `fueraDelBanco` no filtran pero se conservan en `criterios` y viajan a la solicitud (RF-13.7.3).
    Mismo motor para panel, tarjetas y tabla.
  - El **codificador de estado** serializa `EstadoBusqueda` ↔ query string; es la única fuente de verdad
    (ningún estado de búsqueda en memoria global ni en `localStorage`); ignora parámetros desconocidos;
    si la longitud supera 2 000 caracteres pide un token al servidor y la URL queda `?v=1&s=<token>`.
  - El **servicio de estado largo** genera el token con `random_bytes(16)` (128 bits, base64url), guarda
    `{token, estado, sesion_id, cuenta_id, creado, caduca}`, limita la creación a 30 tokens por sesión y
    hora (*a validar*), resuelve solo con sesión válida de la misma cuenta y responde 404 neutro en
    cualquier otro caso (token inexistente, caducado, de otra cuenta o sin sesión). Un cron diario borra
    los caducados.
  - El **servicio de «Mi equipo»** (CRN-12) resuelve el equipo por `invitado_id` y `enlace_id` de la
    sesión (nunca por un id que mande el cliente); crea el equipo en la primera adición; responde solo
    el del invitado de la sesión (404 neutro a cualquier otro); solo admite perfiles publicables del
    enlace; al crear la solicitud (ADR-0005) se copia completo a ella.
  - El **almacén local** lee con `v`; si la versión no se reconoce, migra o descarta sin error.
  - El **aviso de servicio externo** se muestra antes de la primera llamada a Gemini del dispositivo
    (o de cada llamada si el cliente no pidió recordarlo); «Interpretar sin servicio externo» aplica
    `interpretar()` local sin llamar al servidor.
  - El **endpoint de interpretación** rechaza textos bajo el umbral (400 → el cliente ya usa el
    determinista), sanea correos, teléfonos y URL, llama a Gemini con `curl` y timeout 6 s, valida la
    respuesta contra el JSON schema y el catálogo, registra en `llamadas_llm` el resultado
    (`modelo` | `determinista`), la causa (`timeout`, `5xx`, `429`, `schema`, `red`) y la latencia (nunca
    el texto), y devuelve `Criterios`; no persiste el texto salvo como consulta sin coincidencia.
  - El **vigilante de la vuelta al determinista** (dentro del cron de vigilancia de ADR-0005) calcula la
    tasa de las últimas 24 h y alerta al responsable técnico si supera el 20 % con al menos 10 llamadas.
  - El **verificador de salida** (`verificar-salida-gemini.php`, ejecutado por SSH en staging y
    producción) hace una llamada real con la llave del entorno y deja resultado, latencia y versión TLS;
    su salida en verde es condición de entrada de EP-009.
  - El **cron de léxico** (semanal) lee consultas sin coincidencia no procesadas, envía lote + taxonomía,
    guarda filas en `propuestas_lexico` con estado `pendiente`; el panel (EP-006) aprueba o descarta.
  - La **prueba de rendimiento** sirve el build estático, carga el fixture de 300 perfiles, frena la CPU
    4× por CDP (`Emulation.setCPUThrottlingRate`), ejecuta 50 interacciones (cambiar criterio, cambiar
    filtro, quitar etiqueta), mide cada una con `performance.mark` en el manejador de la entrada y un
    doble `requestAnimationFrame` tras el commit, comprueba en cada paso que el contador coincide con el
    número de tarjetas y falla si el P95 ≥ 1 000 ms.
- **Interfaces / contratos:**
  - `interpretar(texto: string, lexico: Lexico): ResultadoInterpretacion`
  - `evaluar(catalogo: PerfilPublicable[], criterios: Criterio[]): Evaluacion`
  - `interface InterpreteLlm { extraer(texto: string, taxonomia: Taxonomia): ?Criterios }` (PHP, puerto)
  - `POST /api/v1/interpretar-requerimiento` `{texto}` → `200 {criterios, fuente:'modelo'}` |
    `204/503 {fuente:'determinista'}` (el cliente cae al intérprete local).
  - `POST /api/v1/estado` `{estado}` → `201 {token}` (requiere sesión) ·
    `GET /api/v1/estado/{token}` → `200 {estado}` | `404` neutro.
  - `GET /api/v1/lexico` → `200` con `ETag` + `version`; `304` si no cambió.
  - Parámetros de URL: `v`, `rol`, `tec`, `sen`, `mod`, `pais`, `vista`, `ambito`, `ficha`, `s`.
  - `GET /api/v1/equipo` → `200 {perfiles: [codigo]}` · `PUT /api/v1/equipo` `{perfiles: [codigo]}` →
    `200` (requieren sesión; siempre el equipo del invitado de la sesión).

## 4. Vistas y registro de la decisión (Paso 6)

Vista de módulos y conectores de la búsqueda:

```mermaid
flowchart LR
  subgraph Navegador["apps/portal (estático · people.trycore.com)"]
    UI[Barra de búsqueda / panel de ajuste / tarjetas / tabla]
    URL[(Query string · única fuente del estado<br/>useSearchParams en Suspense · v=)]
    LS[(localStorage versionado<br/>Perfil Objetivo · vista por defecto · sondeo · aviso)]
    AV[Aviso de servicio externo]
    subgraph Motor["packages/motor (TS puro)"]
      INT[Intérprete<br/>normaliza · léxico · D-L · patrones]
      MC[Motor de criterios único<br/>N de M · evidencia · cercanos · conteos]
    end
  end
  subgraph API["server/ · PHP 8.3 Slim 4"]
    EPI[POST /interpretar-requerimiento<br/>saneamiento · registro de llamadas]
    LEX[GET /lexico · ETag]
    CAT[GET /catalogo · ADR-0003]
    EST[POST/GET /estado · token 128 bits ligado a sesión]
    CSC[POST /consultas-sin-coincidencia]
    GEM[Adapters/Gemini · curl · 6 s]
    CRON[cron/proponer-lexico.php · semanal]
    VIG[Vigilancia ADR-0005<br/>alerta si vuelta al determinista > 20 %]
  end
  DB[(MariaDB<br/>lexico · propuestas_lexico · consultas_sin_coincidencia<br/>estados_largos · llamadas_llm)]
  G[[Gemini API<br/>generativelanguage.googleapis.com]]

  UI --> INT --> MC --> UI
  UI <--> URL
  UI <--> LS
  CAT --> MC
  LEX --> INT
  UI -- texto largo --> AV -- continuar --> EPI --> GEM --> G
  AV -- sin servicio externo --> INT
  EPI -- criterios validados --> UI
  EPI --> DB
  INT -- tokens no reconocidos --> CSC --> DB
  UI -- URL > 2000 --> EST --> DB
  CRON --> DB
  CRON --> GEM
  VIG --> DB
```

Secuencia del requerimiento pegado con aviso y degradación:

```mermaid
sequenceDiagram
  participant C as Cliente (portal)
  participant A as API /interpretar-requerimiento
  participant G as Gemini
  C->>C: longitud > umbral (280 car. o 2 párrafos)
  C->>C: aviso «se procesa con un servicio externo»
  alt el cliente elige «sin servicio externo»
    C->>C: interpretar() local
  else el cliente continúa
    C->>A: POST {texto}
    A->>A: sanear correos, teléfonos y URL
    A->>G: texto + taxonomía (JSON schema), timeout 6 s
    alt respuesta válida
      G-->>A: JSON estructurado
      A->>A: validar contra schema y catálogo, descartar IDs inexistentes
      A->>A: registrar fuente=modelo
      A-->>C: 200 {criterios}
    else fallo / timeout / cuota
      A->>A: registrar fuente=determinista + causa
      A-->>C: 503 {fuente: determinista}
      C->>C: interpretar() local + aviso sin jerga
    end
  end
  C->>C: evaluar(catalogo, criterios) · pinta (gate P95 < 1 s)
```

Vista de verificación (cómo se demuestra cada medida antes de producción):

| Medida | Dónde | Cuándo bloquea |
|--------|-------|----------------|
| QA-1: P95 < 1 000 ms entrada → pintado, CPU 4×, 300 perfiles; contador = tarjetas en cada paso | Playwright en CI sobre el build estático | Cada PR que toque `packages/motor` o `apps/portal` |
| QA-16: ida y vuelta 100 % y parámetros desconocidos sin error | fast-check en CI | Cada PR que toque `packages/contratos` |
| QA-16: URL de 2 000 caracteres y `s=<token>` atraviesan Cloudflare y ModSecurity | E2E en `people-staging.trycore.com` | Antes de cerrar EP-002 |
| QA-15: vuelta al determinista ≤ 8 s con fallo inyectado (timeout, 5xx, 429, JSON inválido) | Integración con doble de Gemini + E2E en staging con el POST real | Antes de cerrar EP-009 |
| CRN-6: salida HTTPS real a `generativelanguage.googleapis.com` | `verificar-salida-gemini.php` en el hosting | Condición de entrada de EP-009 |
| CON-8: payload saliente = texto saneado + taxonomía | Test de contrato del adaptador | Cada PR que toque `Adapters/Gemini` |

**Decisión:** la búsqueda es determinista y corre en el navegador sobre el catálogo recortado: un
intérprete propio produce `Criterios` y un único motor calcula resultados, conteos, evidencia y «lo más
cercano»; su latencia se defiende con un gate de CI (Playwright, CPU 4×, 300 perfiles, P95 < 1 s). El
estado de búsqueda vive **solo en la query string**, leído con `useSearchParams` dentro de `<Suspense>`
(ADR-0001), con desborde a un token de servidor aleatorio de 128 bits ligado a la sesión por encima de
2 000 caracteres; lo que es por dispositivo vive en `localStorage` versionado y nunca duplica el estado.
Gemini queda detrás de un puerto del servidor, solo para textos largos y para proponer léxico, con aviso
previo al cliente, saneamiento, timeout duro, salida estructurada validada contra el catálogo y vuelta
al determinista vigilada (alerta por encima del 20 %). La salida HTTPS a Google se verifica antes de
EP-009.

**Trade-offs aceptados:**
- El catálogo completo viaja al navegador (con sesión): a cambio de latencia nula por toque se acepta
  que un invitado vea toda la proyección publicable (ya recortada por ADR-0003).
- La CPU frenada 4× en Chromium de escritorio es una aproximación a un teléfono de gama media, no una
  medida en el dispositivo; se acepta a cambio de una medida repetible en cada PR.
- El léxico lo mantiene Talento Humano: la calidad del intérprete depende de esa curaduría.
- «Mi equipo» en servidor añade dos tablas y una escritura por cambio del equipo, a cambio de que el
  invitado lo recupere en otro dispositivo (CRN-12).
- El token largo exige sesión de la misma cuenta: una URL con `s=` reenviada fuera de la cuenta no abre
  (404), a cambio de que los criterios de una cuenta no se lean con solo conocer el enlace.
- El aviso previo añade un paso a quien pega un requerimiento largo.

## 5. Análisis del diseño (Paso 7)

> Resultado final tras la evaluación adversarial ATAM-lite. ✅ solo cuando hay medida o un plan de
> verificación concreto (dónde, cómo y cuándo bloquea); ⚠️ cuando falta calibrar o verificar una
> premisa; ❌ cuando el diseño no satisface el driver.

| Driver | ✅/⚠️/❌ | Evidencia / medida | Riesgo residual |
|--------|---------|--------------------|-----------------|
| UC-5 | ✅ | Motor único como función pura; conteos y evidencia salen del mismo `evaluar()`; test de propiedades (fast-check) de contador = resultados; la prueba de rendimiento lo reafirma en cada interacción | Calidad del léxico inicial; depende de la curaduría de Talento Humano |
| UC-6 | ✅ | Query string como única fuente + `localStorage` versionado solo para preferencias, con migración/descarte probada en unitarios; E2E de recarga reconstruye el mismo estado | — |
| UC-8 | ✅ | Test de contrato: la solicitud a medida lleva los `Criterios` completos (incluido `fueraDelBanco`); unitarios de las reglas RF-10 del sondeo; voto por la cola (ADR-0005) | — |
| UC-18 | ⚠️ | Adaptador, endpoint, aviso y registro diseñados; umbral de 280 car./2 párrafos propuesto sin calibrar; salida HTTPS a Google aún sin probar desde el hosting | Si el hosting no sale a Google, UC-18 no existe (la degradación lo oculta, la alerta del 20 % lo destapa); umbral mal calibrado |
| QA-1 | ✅ | Gate de CI: Playwright sobre el build estático, CPU 4×, 300 perfiles sintéticos, 50 interacciones, P95 < 1 000 ms de la entrada al pintado; bloquea el merge | La CPU 4× aproxima, no reproduce, un teléfono real (GPU, memoria, térmica); conviene contrastar una vez en un teléfono de gama media antes de la release |
| QA-15 | ✅ | Timeout duro 6 s + intérprete local; integración con doble de Gemini para timeout, 5xx, 429 y JSON inválido, más E2E en staging con el POST real, medida ≤ 8 s; umbral aplicado en cliente y servidor (100 % de cortas sin modelo); léxico solo por propuesta pendiente | ModSecurity o Cloudflare pueden cortar el POST largo; se detecta en el E2E de staging y se corrige con excepción por regla (CRN-18) |
| QA-16 | ⚠️ | fast-check de ida y vuelta; parámetros desconocidos ignorados; token de 128 bits ligado a sesión con 404 neutro; E2E en staging planificado | El límite de 2 000 caracteres es *a validar*: sin probar contra ModSecurity ni contra clientes de correo que truncan URLs; caducidad de 90 días sin validar con negocio |
| CON-6 | ✅ | `GEMINI_API_KEY` solo en `config.php` fuera de la carpeta pública; grep de secretos sobre el bundle en CI (ADR-0007) | — |
| CON-8 | ✅ | Test de contrato: payload saliente = texto saneado + taxonomía; saneamiento de correos, teléfonos y URL; desarrollo con token personal y solo datos ficticios | El saneamiento no detecta nombres propios en el texto pegado; queda cubierto solo por el aviso |
| CON-13 | ✅ | Todo `EstadoBusqueda` se serializa a la URL (fast-check); revisión de código y prueba E2E sin estado de búsqueda fuera de la query string | — |
| CON-14 | ✅ | `PerfilObjetivo` versionado, `rol: string[]`, interpretación separada tras `Criterios` (verificado por tipos en `packages/contratos`) | — |
| CRN-6 | ⚠️ | Verificación real de salida como condición de entrada de EP-009; registro por llamada y alerta si la vuelta al determinista supera el 20 % en 24 h | Cuota, coste y términos de la llave de producción desconocidos; sin tope de llamadas por invitado y día definido |
| CRN-12 | ✅ | Decidido: por invitado en servidor. Plan: tests de aceptación de aislamiento (otro invitado de la misma cuenta recibe 404 y no ve el equipo), recuperación desde un segundo dispositivo con la misma identidad y copia completa a la solicitud | Divergencia con el texto actual del PRD/HU-095, a reflejar por discovery |
| CRN-16 | ⚠️ | Umbral de texto largo y de confianza de RF-12.3 propuestos; el registro de `llamadas_llm` da datos para calibrar | Sin requerimientos reales para calibrar antes de EP-009 |
| CRN-19 | ✅ | Intérprete y entrada por instrucción aislados en módulo retirable; E2E del panel de ajuste con el módulo desactivado | — |

**Puntos de sensibilidad:** el umbral de texto largo (decide coste de Gemini y calidad), el límite de
2 000 caracteres (decide cuándo aparece la dependencia del servidor en el estado) y el alcance del
token (sesión exacta frente a cuenta: seguridad frente a compartir entre invitados).

**Drivers no resueltos en esta iteración:** CRN-6 (verificación de
salida HTTPS, cuota y coste antes de EP-009), CRN-16 (calibración del umbral de texto largo y del de
confianza de RF-12.3) y la validación del límite de 2 000 caracteres de QA-16. Se devuelven al backlog
arquitectónico.

## 6. Consecuencias

- **Positivas:**
  - La búsqueda no depende de la red ni del modelo; el mismo motor mantiene coherentes panel, tarjetas
    y tabla.
  - La latencia de QA-1 se defiende en cada PR con una medida de extremo a extremo, no con una
    suposición.
  - El estado es compartible por URL y tiene una sola fuente; recargar o abrir en otro dispositivo
    reconstruye la misma pantalla.
  - La privacidad hacia el modelo es verificable por test, y el cliente sabe antes de enviar que su
    texto sale a un servicio externo.
  - Un fallo silencioso de Gemini (bloqueo de salida, cuota agotada) genera alerta en lugar de pasar
    desapercibido.
  - La ruta por reto (§14) no exige migrar datos (rol como lista, esquema versionado).
- **Negativas:**
  - El léxico se vuelve un activo que hay que curar.
  - La tabla `estados_largos` crece y necesita la limpieza diaria; `llamadas_llm` también necesita
    retención (CRN-10).
  - El catálogo en el navegador debe mantenerse pequeño; si el banco crece a cientos se reevalúa (el
    gate con 300 perfiles avisa antes).
  - Dos intérpretes (modelo y determinista) pueden dar criterios distintos para el mismo texto.
  - El aviso previo añade fricción al recorrido del requerimiento pegado.
  - La prueba Playwright con CPU frenada añade minutos al CI y puede ser inestable si el runner es
    ruidoso; exige varias repeticiones por corrida.
- **Riesgos:**
  - Si el hosting no permite la salida HTTPS a `generativelanguage.googleapis.com`, EP-009 no puede
    cerrar con Gemini; mitigación: verificación antes de empezar la épica y, si falla, excepción del
    proveedor del hosting o decisión de negocio.
  - La CPU 4× no garantiza el comportamiento en un teléfono real; mitigación: contraste puntual en un
    teléfono de gama media antes de la release.
  - ModSecurity puede cortar el POST del texto pegado o las URL largas; mitigación: E2E en staging con
    cargas reales (CRN-18).
  - Coste y cuota de Gemini sin conocer; mitigación: umbral, registro por llamada y alerta.
  - *(Revisión adversarial 2026-09-26, a numerar en el backlog)* La escritura superficial del estado
    depende de que Next integre `history.replaceState` con `useSearchParams` (Next ≥ 14.1); un cambio
    de Next o de nuqs que vuelva a pedir el payload RSC reintroduciría una petición por filtro.
    Mitigación: V4-1 falla ante cualquier petición de documento o RSC por interacción.
  - *(Revisión adversarial 2026-09-26, a numerar)* El enmascarado de nombres de perfiles antes de
    `proponer_lexico` también quita términos homónimos (un apellido que coincide con una tecnología o
    un sector); esas consultas llegan al modelo empobrecidas. Se acepta: la propuesta solo pierde
    calidad, nunca expone un nombre.
  - *(Revisión adversarial 2026-09-26, a numerar)* La fórmula de confianza de RF-12.3 es heurística:
    con el umbral mal calibrado una interpretación errónea puede mostrarse en forma compacta.
    Mitigación: interpretación completa siempre que haya descartes, tokens no reconocidos o
    degradación; calibración con `llamadas_llm` y con la prueba previa de RF-12.2.
- **Trade-offs de negocio abiertos (no los decide la arquitectura):**
  - **Trade-off de negocio pendiente: alcance del comparador de EP-004 (H33).** El PRD se contradice
    (§13.5 descarta comparar perfiles de cara al cliente; RF-4.4, HU-120 y HU-121 lo piden) y
    `backlog.md` lo pasa a «v1.1» sin acuerdo registrado. Opciones: (a) en alcance de v1, con el diseño
    técnico de la revisión adversarial (coste: una vista más sobre el mismo `evaluar()`, sin endpoint
    nuevo); (b) descartado, corrigiendo RF-4.4/HU-120 en discovery; (c) diferido a v1.1, registrado
    como diferimiento acordado por el equipo. Recomendación técnica: (a), su coste es bajo. Mientras no
    se decida, el UC de armado queda ⚠️.
  - **Trade-off de negocio pendiente: prueba previa obligatoria de RF-12.2 (H36).** El PRD exige
    pegar cinco requerimientos reales antes de construir RF-12.2, pero D-24/CON-8 limitan el
    desarrollo a token personal y datos ficticios, y la llave de negocio solo existe en producción.
    Opciones: (a) la prueba se hace con la llave de producción sobre cinco requerimientos saneados,
    con consentimiento del cliente y la base legal de R-44 resuelta (coste: esperar a la llave y al
    consentimiento); (b) EP-009 se construye solo con el intérprete determinista y Gemini se aplaza,
    con acuerdo explícito del equipo (coste: RF-12.2.1 fuera de v1); (c) Comercial reescribe y
    anonimiza cinco requerimientos reales, que ya son datos ficticios y pueden usar el token personal
    (coste: horas de Comercial; la prueba pierde algo de realismo). Recomendación técnica: (c). El
    resultado, sea cual sea, es condición de entrada de EP-009 junto a V4-8 (`verificar-salidas`).
  - **Tope y presupuesto de Gemini (CRN-6):** límite de llamadas por invitado y día y coste mensual
    aceptable.
  - **Caducidad del token de estado largo:** 90 días propuestos; depende de cuánto tiempo debe seguir
    abriendo una URL compartida.
- **Decisiones de la revisión única (sponsor, 2026-09-25):**
  - **CRN-12 «Mi equipo»: por invitado en servidor.** Tablas `equipos`/`equipo_perfiles` ligadas al
    correo invitado verificado y al enlace; cada invitado ve solo el suyo, lo recupera desde otro
    dispositivo y viaja completo a la solicitud. El Perfil Objetivo sigue por dispositivo (D-16). El
    parámetro `equipo=` sale de la URL. Discovery debe reflejar la divergencia en el PRD.
  - **Aviso previo al enviar texto largo a Gemini: aceptado** (opción de aviso informativo con
    «Interpretar sin servicio externo»). Descartadas la autorización explícita y la cara cliente sin
    Gemini.
- **Operacionales:** `GEMINI_API_KEY` en `config.php` fuera de la carpeta pública; cron semanal de
  léxico y cron diario de limpieza de tokens con registro en `tareas_ejecucion` (ADR-0005); alerta de
  vuelta al determinista en la vigilancia de ADR-0005; prueba de rendimiento y tests de propiedades en
  CI (ADR-0007).

## 7. Trazabilidad

- Drivers: [0000-drivers-y-asrs.md](0000-drivers-y-asrs.md) · UC-5, UC-6, UC-8, UC-18 · QA-1, QA-15,
  QA-16 · CON-6, CON-8, CON-13, CON-14 · CRN-6, CRN-12, CRN-16, CRN-19 (también toca QA-3 por el token
  ligado a la sesión y CON-10 por el aviso de servicio externo)
- PRD v4.11: RF-2.5, RF-2.6 (2.6.1–2.6.4), RF-8.12.1, RF-10.1–10.8, RF-12.2.1, RF-12.3, RF-13.7
  (13.7.1–13.7.4), RF-13.8 (13.8.1–13.8.2), RF-13.10.1, RF-14.3, RF-15.1, RF-16.1–16.4, RF-19.8 ·
  D-12, D-16, D-17, D-24 · §8, §13.5, §13.7, §14
- Épicas: EP-002, EP-009, EP-010 (y EP-006 para la aprobación de léxico en `people-panel.trycore.com`)
- ADR relacionados: [0001](0001-estilo-y-stack-base.md) (monorepo, `packages/motor`, estado solo en
  query string con `useSearchParams` en `<Suspense>`),
  [0002](0002-identidad-acceso-y-sesiones.md) (sesión e identidad del invitado a las que se liga el
  token), [0003](0003-datos-persistencia-y-auditoria.md) (catálogo recortado, léxico),
  [0005](0005-integraciones-y-trabajo-diferido.md) (cola, voto del sondeo, vigilancia de crons y
  alerta de vuelta al determinista), [0007](0007-entornos-despliegue-y-perimetro.md) (CI, staging,
  grep de secretos)
- Stack a operacionalizar en `.claude/config/stack-allowlist.json`: `vitest`, `fast-check`,
  `@playwright/test`


## Enmienda de plataforma (iteración 8, 2026-09-25)

> Se conservan: recuperación en el cliente sobre el catálogo recortado, intérprete determinista propio,
> estado solo en la URL con token de estado para URL largas, Gemini acotado tras un adaptador (sin
> datos de perfiles, umbral de texto, timeout duro y vuelta al determinista, aviso previo al cliente),
> propuestas de léxico con aprobación humana y el sondeo. Donde el texto anterior diga PHP, `curl`,
> cron o `config.php`, rige esta tabla.

| Mecanismo (texto anterior) | Implementación vigente |
|----------------------------|------------------------|
| `Adapters/Gemini` en PHP con `curl` y timeout 6 s | `packages/infra/gemini` con `fetch` a la API REST de Gemini y `AbortSignal.timeout(6000)`; salida validada con un esquema `zod` que refleja el JSON schema de salida estructurada. Solo lo importan Route Handlers y worker (lint impide importarlo desde código de cliente) |
| `interface InterpreteLlm` en PHP | `interface InterpreteLlm { extraer(texto: string, taxonomia: Taxonomia): Promise<Criterios \| null> }` en `packages/dominio` |
| `cron/proponer-lexico.php` semanal; cron diario de limpieza de tokens | Tareas `proponer_lexico` (semanal) y `limpiar_tokens` (diaria) del planificador del worker (ADR-0009) |
| `bin/verificar-salida-gemini.php` por SSH | `worker verificar-salidas` ejecutado como job puntual de App Platform en staging (comprueba HubSpot, Gemini y Mailgun). **R-2** se reduce: App Platform tiene salida HTTPS abierta; queda verificar cuota y llave de producción |
| `GEMINI_API_KEY` en `config.php` | Variable `SECRET` solo en los procesos que la usan (portal y worker) |
| URL de 2 000 caracteres y POST del texto pegado frente a ModSecurity | Sin ModSecurity; el E2E en staging se mantiene contra el conjunto gestionado de Cloudflare y los límites de cabecera de App Platform |
| Tablas en MariaDB (`lexico`, `propuestas_lexico`, `consultas_sin_coincidencia`, `estados_largos`, `llamadas_llm`) | Mismas tablas en el esquema `operacion` de PostgreSQL |

**Veredictos que cambian en §5:** CRN-6 pasa a ⚠️ solo por cuota y coste de la llave de producción;
QA-16 ⚠️ solo por el E2E de URL larga en staging. `@google/generative-ai` y `@google/genai` siguen
fuera del stack: la llamada es `fetch` desde el servidor.

### Revisión adversarial (2026-09-26)

> Incorpora los hallazgos H4, H14 (parte del cliente), H15 (parte de `verificar-salidas`), H18 (CON-6),
> H19 (vigilante), H31, H33 (parte técnica), H34, H35, H36 y H43 de la revisión multiagente. Donde esta
> subsección choque con el texto anterior, incluida la tabla de arriba, rige esta subsección. Los
> trade-offs de negocio que abre están en §6.

| Tema (hallazgo) | Decisión vigente | Razón |
|-----------------|------------------|-------|
| Escritura del estado (H4) | `useEstadoBusqueda` se implementa con `useQueryStates` de nuqs con **`shallow: true` y `history: "replace"` fijados en los parsers compartidos**, no por llamada. Cambiar criterio, vista, ámbito o ficha actualiza la URL con `history.replaceState` y **no navega**: el árbol `force-dynamic` (ADR-0008) no se vuelve a pedir. Solo la carga inicial y la resolución de `s=` tocan el servidor. Regla de lint propia: falla ante `router.replace`, `router.push` o `<Link>` que escriban claves del contrato de búsqueda, ante `shallow: false` en ellas y ante `useSearchParams` leído fuera de `useEstadoBusqueda` | En App Router, cambiar `searchParams` navegando pide un payload RSC nuevo; con todo el árbol dinámico cada filtro viajaría a nyc con sesión y `ProyeccionCatalogo`, y QA-1 perdería la «latencia nula por toque» en que se apoya |
| Ciudades en presencial/híbrido (H4, H14) | `POST /api/v1/catalogo/ciudades` es **aditiva**: no bloquea el pintado de resultados. Se llama solo cuando, con necesidad presencial o híbrida, cambia el conjunto de códigos visibles, 300 ms después del último cambio y cancelando la anterior (`AbortController`); la ciudad aparece en su sitio al llegar. El cliente envía los **`Criterios` completos** validados con el esquema de `packages/contratos` y el servidor ejecuta el mismo `evaluar()` (contrato en ADR-0003), con test de contrato «ciudades ⊆ resultados visibles» | Con criterios completos el servidor reproduce el resultado del navegador (sin ciudades de perfiles que no se muestran, CON-10); la espera y la cancelación evitan una petición por toque |
| Gate de QA-1 unificado (H4) | Un solo gate, **V4-1** (tabla de abajo): sustituye a la prueba «sobre el build estático» de §3 y al benchmark de `packages/motor` como gate de QA-1 en V8-6 (el benchmark queda como test auxiliar) | Había dos definiciones incompatibles y ninguna medía la red a nyc, `/ciudades` ni las peticiones RSC |
| Contrato único de URL (H34) | Los parsers viven **solo** en `packages/contratos/estado-busqueda`: un `createParser` de nuqs por parámetro más `createSerializer` y `createLoader` de `nuqs/server`, importados por el portal, los Route Handlers (resolver `s=`, construir URL en el panel y en correos) y los tests. Nombres cerrados: `v`, `rol`, `tec`, `sen`, `mod`, `pais`, `vista`, `ambito`, `ficha`, `s` y `cmp` (reservado para el comparador si queda en alcance). **El perfil abierto es `ficha=<codigo>`**: el `?id=` de ADR-0008 queda sustituido. `v=1` se escribe siempre; al leer, `v` ausente vale 1 y una versión desconocida lee los parámetros conocidos e ignora el resto; un valor inválido cae al valor por defecto del parámetro, nunca a una excepción. `nuqs` traza en `stack-allowlist.json` a ADR-0008 y a esta enmienda | Dos contratos hacían imposible el test de ida y vuelta de QA-16 y rompían URL compartidas; `ficha` nombra el código público del perfil y no sugiere un id interno de BD |
| Vista por defecto (H34) | **Propuesta por defecto, pendiente de T-30 (no normativa):** pasar de `localStorage` a **`sessionStorage` versionado** según una lectura de RF-13.12 («persiste en la sesión»); `vista=` en la URL sigue mandando en cualquier caso. Qué significa «sesión» lo decide discovery en T-30: si es la pestaña, rige esta propuesta; si es la sesión de acceso (varios dispositivos), la vista se guarda en servidor junto a la sesión. Hasta que T-30 se resuelva, el slice de EP-002 no fija el comportamiento en un AC | Alinea la persistencia con el PRD sin crear estado de búsqueda fuera de la URL |
| Confianza de la interpretación (H35) | **Determinista:** `confianza = Σ w(t) / n` sobre los n tokens significativos (sin palabras vacías, lista fija en `packages/motor`), con w = 1 por coincidencia exacta o patrón, 0,7 por difusa a distancia 1, 0,4 a distancia 2 y 0 si no se reconoce. Cada `Criterio` lleva `origen` (`lexico` \| `difuso` \| `patron` \| `modelo` \| `usuario`) y `fragmento` (texto que lo originó). **Modelo:** `200 {criterios (origen: 'modelo', fragmento), descartados: [{valor, motivo: 'fuera_de_catalogo' \| 'sin_fragmento'}], confianza}`, con `confianza` = valores válidos / valores propuestos; un valor cuyo fragmento no aparece en el texto se descarta. **RF-12.3 igual en las dos rutas:** umbral configurable; **0,8 es propuesta por defecto, pendiente de T-32** (CRN-16; no normativa hasta que negocio lo fije con la calibración de `llamadas_llm` y la prueba previa de T-23); bajo umbral, con descartes, con tokens no reconocidos o tras degradación, interpretación completa (chips con su origen, no reconocidos y descartados); por encima, compacta (una línea de chips). Los chips del modelo se marcan «extraído por servicio externo» y la degradación se avisa sin jerga | Hace aplicable RF-12.3 con una cifra explicable y la misma regla sea cual sea el intérprete; el origen por criterio cubre RF-2.6.2 y la explicabilidad exigida |
| Coincidencias directas y relacionados (H35, RF-2.6.1) | **«Relacionados» = `masCercanos()`** (fallan exactamente un obligatorio), en una sección bajo las coincidencias directas, visible siempre que exista y rotulada con el criterio que falla; sin coincidencias directas es el camino del cero (RF-13.9.4). Sale del mismo `evaluar()` | Un solo motor y una sola definición de cercanía para RF-2.6.1 y RF-13.9.4 |
| Propuestas de léxico (H43) | `consultas_sin_coincidencia` guarda **`modelo_permitido`** (booleano, por defecto `false`) y `origen` (`corta` \| `larga_local` \| `larga_degradada`). El cliente envía `false` si el dispositivo eligió «Interpretar sin servicio externo»; el servidor fuerza `false` para `larga_local`. `proponer_lexico` **solo selecciona filas con `modelo_permitido = true`**. Antes de enviar el lote enmascara, con `normalizar()` y coincidencia exacta por token, los nombres y primeros apellidos de todos los perfiles de `inventario` (cualquier estado, archivados incluidos), leídos en el momento del envío; una consulta que queda vacía o solo con máscara no se envía. Las filas no enviadas siguen visibles para Talento Humano en el panel | El servidor no conocía la elección local y la incumplía en diferido; con perfiles nominales un nombre buscado sin coincidencia llegaba al modelo, contra RF-16.2 |
| Armado de equipo EP-004 (H33, parte técnica) | **Fecha de inicio más temprana (RF-4.3):** banda mínima del conjunto según el orden total de `banda_disponibilidad` declarado en `packages/contratos` («Por confirmar» solo si todas lo son), calculada en el cliente desde la proyección y nunca con fechas (QA-5); la banda la calcula el servidor con `Reloj` en America/Bogota (ADR-0003). Roles cubiertos = unión de `rol`. Función pura `resumenEquipo()` en `packages/motor`. **Concurrencia (RF-4.1, RF-13.12.4):** `PUT` de reemplazo completo se retira; la mutación es `PATCH /api/v1/equipo` `{agregar: [codigo], quitar: [codigo]}`, idempotente (operaciones de conjunto, `ON CONFLICT DO NOTHING`), en una transacción, que responde el equipo completo y su `version`; códigos no publicables del enlace → 422 con la lista; sesión y CSRF como en ADR-0002. La selección múltiple de la tabla es un solo `PATCH`. **Comparador (RF-4.4), si queda en alcance:** hasta 3 perfiles evaluados con el mismo `evaluar()` y los criterios de la URL; columnas = criterios activos con ✓/– y el dato (la misma evidencia que la tabla, RF-13.12.2); sin endpoint ni lógica nuevos; selección en `cmp=` | El cliente solo tiene bandas, no fechas; el reemplazo completo perdía cambios entre pestañas o dispositivos y las operaciones de conjunto conmutan sin `If-Match`. El alcance del comparador es de negocio (§6) |
| Dónde se ejecutan las verificaciones de red (H31, H15) | E2E de URL de 2 000 caracteres, `s=<token>` y POST del texto pegado: el tramo de Cloudflare (conjunto gestionado, límites) en staging por el túnel; los límites de cabecera y cuerpo de **App Platform en producción en oscuro** (host `…ondigitalocean.app` y host público antes de difundirlo). `worker verificar-salidas` como **job puntual de App Platform en producción en oscuro** con las llaves de producción; en staging, `docker compose run worker verificar-salidas` solo prueba el código con token personal. La mitigación de R-2 queda condicionada a la corrida en producción. LCP y TTFB (QA-2) los mide ADR-0010 en oscuro; esta ADR no mide QA-2 | Staging es Docker Compose fuera de DigitalOcean (T-14): lo propio de App Platform no se puede observar allí |
| Vigilante de la vuelta al determinista (H19) | Vive en la tarea `vigilar` del worker (ADR-0009): lee `llamadas_llm` y alerta si la tasa supera el 20 % con al menos 10 llamadas en 24 h. La referencia al cron de vigilancia de ADR-0005 queda sin efecto | ADR-0005 está reemplazado; la obligación no puede vivir solo en un ADR superseded |
| Evidencia de CON-6 (H18) | `GEMINI_API_KEY` como variable `SECRET` solo en portal y worker; V8-9 (un proceso sin variable obligatoria sale con código ≠ 0) y `grep` de secretos sobre `.next/static` y la imagen en el CI de ADR-0010 (V8-4). `config.php` y ADR-0007 quedan sin efecto como evidencia | La evidencia de §5 citaba mecanismos de la plataforma abandonada |
| Permisos sobre las tablas de búsqueda (consolidación, 2.ª pasada) | **Lista normativa** de esta ADR (ADR-0008 la cita sin copiarla; las migraciones de cada tabla emiten los `GRANT`, porque son objetos de `ps_duenio` en `operacion`): `ps_portal` — `SELECT` de `lexico` aprobado (la lectura de léxico que cita ADR-0003), `INSERT` en `consultas_sin_coincidencia` y `llamadas_llm`, `INSERT` y `SELECT` en `estados_largos` (crear y resolver `s=`); sin `UPDATE` ni `DELETE` en ninguna. `ps_panel` — `SELECT`, `INSERT` y `UPDATE` en `lexico` y `propuestas_lexico` (aprobar o rechazar propuestas, siempre por la unidad de trabajo), `INSERT` y `SELECT` en `estados_largos` (URL construidas en el panel y en correos), `SELECT` de `llamadas_llm` (observabilidad). `ps_worker` — `SELECT` y `UPDATE (procesada)` en `consultas_sin_coincidencia`, `INSERT` en `propuestas_lexico` y `llamadas_llm`, `SELECT` de `llamadas_llm` (vigilante), `INSERT` y `SELECT` en `estados_largos` (enlaces de avisos) y `DELETE` en `estados_largos` vencidos (`limpiar_tokens`) y en `consultas_sin_coincidencia` y `llamadas_llm` con más de 24 meses (retención de la telemetría, ADR-0006). `ps_exportador` — `SELECT`, como en todo el banco | Estas tablas no tenían dueño en ninguna lista de permisos: el portal no podía escribir en ellas con la lista de ADR-0002/0003/0006 y V8-10 no las cubría |

**Vista de verificación vigente** (sustituye a la tabla de §4):

| ID | Verificación | Dónde | Cuándo bloquea |
|----|--------------|-------|----------------|
| V4-1 | **QA-1:** Playwright contra la imagen standalone de `apps/portal` con PostgreSQL de CI sembrado con 300 perfiles sintéticos; CPU ×4 y red emulada por CDP (RTT 150 ms, 1,6 Mbps: Bogotá → nyc sobre 4G); 50 interacciones en tarjetas, 50 en tabla y un recorrido presencial con `/ciudades` real. Aserciones: P95 entrada → pintado de resultados < 1 000 ms; contador = resultados en cada paso; **0 peticiones de documento o RSC** (cabecera `RSC: 1` o parámetro `_rsc`) por interacción de filtrado; como mucho 1 `/ciudades` por ráfaga, con su latencia registrada | CI | Cada PR que toque `apps/portal`, `packages/motor` o `packages/contratos` |
| V4-2 | **QA-16 y CON-13:** fast-check de ida y vuelta con los parsers compartidos (`createSerializer` → `createLoader` = identidad, en navegador y servidor); parámetros y versiones desconocidos y valores inválidos sin error; lint de claves de búsqueda (sin `router.*` ni `shallow: false`, sin `useSearchParams` directo) | CI | Cada PR que toque `packages/contratos` o `apps/portal` |
| V4-3 | **QA-16:** URL de 2 000 caracteres, `s=<token>` y POST del texto pegado de extremo a extremo | Staging por el túnel (Cloudflare) y producción en oscuro (App Platform) | Antes de cerrar EP-002 (staging) y antes del primer envío real (producción) |
| V4-4 | **CON-8, RF-16.2:** contrato del payload de `proponer_lexico`: con un perfil de prueba sembrado («Nombre Apellido») y consultas que lo contienen, una de ellas con `modelo_permitido = false`, el lote no lleva el nombre ni la consulta local | CI | Cada PR que toque `proponer_lexico` o `packages/infra/gemini` |
| V4-5 | **CON-8:** payload de `POST /interpretar-requerimiento` = texto saneado + taxonomía | CI | Cada PR que toque `packages/infra/gemini` |
| V4-6 | **RF-12.3:** propiedades de `confianza` (determinista; añadir un token no reconocido nunca la sube) y E2E de las dos rutas con doble de Gemini: completa bajo umbral o con descartes, compacta por encima, chips de origen, aviso de degradación. El umbral se lee de configuración; el valor 0,8 del E2E está *condicionado a T-32* (si T-32 fija otro, el test usa ese) | CI | Cada PR que toque `packages/motor/interprete` o la interpretación |
| V4-7 | **QA-15:** vuelta al determinista ≤ 8 s con fallo inyectado (timeout, 5xx, 429, JSON inválido) | Integración con doble de Gemini en CI; E2E en staging con token personal | Antes de cerrar EP-009 |
| V4-8 | **CRN-6:** `worker verificar-salidas` con las llaves de producción | Producción en oscuro | Condición de entrada de EP-009 |
| V4-9 | **EP-004:** dos `PATCH /equipo` concurrentes del mismo invitado desde dos sesiones dan la unión sin pérdida; la selección múltiple es una sola petición; unitarios de `resumenEquipo()` (banda mínima, «Por confirmar», roles cubiertos) | CI | Antes de cerrar EP-004 |

**Veredictos que cambian en §5 (revisión adversarial):**

| Driver | ✅/⚠️/❌ | Evidencia / medida | Riesgo residual |
|--------|---------|--------------------|-----------------|
| QA-1 | ⚠️ | V4-1 con escritura superficial del estado y aserción de 0 peticiones RSC (plan concreto, sin ejecutar; mismo veredicto que ADR-0008 y el tablero) | Hasta ejecutar V4-1. La red y la CPU emuladas aproximan, no reproducen, un teléfono en Bogotá; se mantiene el contraste en un teléfono de gama media antes de la release |
| QA-16 | ⚠️ | V4-2 en CI; contrato único de parsers | Hasta correr V4-3 en producción en oscuro; caducidad de 90 días sin validar con negocio |
| UC-5 | ✅ | Relacionados = `masCercanos()` del mismo `evaluar()` | Calidad del léxico inicial |
| UC-18 | ⚠️ | Diseño completo; V4-8 en producción en oscuro | Bloqueado por el trade-off de la prueba previa de RF-12.2 (§6) |
| CON-6 | ✅ | V8-9 y V8-4 en el CI de ADR-0010 | — |
| CON-8 | ✅ | V4-4 y V4-5; `modelo_permitido` y enmascarado de nombres de perfiles en `proponer_lexico` | Nombres de terceros ajenos al banco en el texto pegado siguen cubiertos solo por el aviso |
| CRN-16 | ⚠️ | Fórmula de confianza definida; umbral 0,8 como propuesta por defecto (T-32); V4-6 | Umbral pendiente de negocio (T-32) y sin calibrar: depende de `llamadas_llm` y de la prueba previa de RF-12.2 |
| Armado de equipo (UC a numerar en 0000; EP-004) | ⚠️ | Banda mínima, `PATCH` idempotente y comparador sobre `evaluar()` decididos; V4-9 | Alcance del comparador pendiente de negocio (§6) |

**Trazabilidad añadida:** EP-004 (HU-080, HU-084, HU-120, HU-121) · RF-2.6.1, RF-2.6.2, RF-4.3, RF-4.4,
RF-12.2, RF-13.9.4, RF-13.12, RF-13.12.4 · ADR-0009 (`vigilar`, `proponer_lexico`), ADR-0010 (entornos,
verificaciones en oscuro) · stack: `nuqs`.

## Enmienda de discovery (2026-10-02)

> Nace de la discovery de EP-002 (HU-219, HU-221, HU-222, HU-019, HU-020). No cambia el alcance: alinea
> la ADR con las historias. Elegida por el modelo por delegación del sponsor; revisable en el PR de la
> discovery y se concreta en el change de EP-002. Rige sobre el texto anterior, incluida la revisión
> adversarial (H34), donde choquen.

| Tema | Decisión vigente | Razón |
|------|------------------|-------|
| Parámetros de URL que faltaban (H34) | La lista cerrada se **amplía** (no se reutilizan parámetros existentes) con las facetas de RF-2.3 que no tenía y con el orden de RF-2.7: **Categoría**, **Sector**, **Disponibilidad** (banda de arranque) y **orden**. Nombres propuestos: `cat`, `sec`, `disp` y `orden`; el change de EP-002 los fija en `packages/contratos/estado-busqueda` con su parser. Rigen las mismas reglas: `v=1`, parámetros desconocidos ignorados, valor inválido al valor por defecto, y el `orden` por omisión (relevancia) no se escribe. V4-2 cubre los nuevos parámetros en su ida y vuelta | HU-221 exige que el enlace reproduzca exactamente filtros, orden y vista (RF-2.5); sin estos parámetros, Categoría, Sector, Disponibilidad y orden se perderían al compartir |
| Descarte y voto del sondeo (RF-10.4) | **Se guardan en el servidor por invitado**, no en `localStorage`: el sondeo no vuelve en visitas siguientes desde ningún dispositivo del mismo invitado (HU-020; el voto lo lleva a HubSpot HU-224). La fila «descarte del sondeo» sale de la persistencia local de §2 (CON-14, UC-6) y del diagrama de §4; la persistencia local queda para el Perfil Objetivo, la vista por defecto (pendiente de T-30) y la elección del aviso de servicio externo | Con identidad nominal (D-4) una visita siguiente puede venir de otro dispositivo; guardar en el navegador haría reaparecer la pregunta |

