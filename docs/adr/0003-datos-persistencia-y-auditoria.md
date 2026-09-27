---
id: 0003
title: "Datos, persistencia, auditoría e importación"
date: 2026-09-25
status: accepted
authors:
  - setup-architecture (/build:architect)
tags: [datos, mariadb, migraciones, auditoria, importacion, consentimiento, recuperabilidad]
add:
  iteracion: 3
  fase_prd: "Anexo A Fase 0 y 7–8 · inventario EP-006"
---

# ADR 0003 — Datos, persistencia, auditoría e importación

> **Enmienda de plataforma (iteración 8, 2026-09-25):** el diseño de esta ADR se conserva; la
> persistencia pasa de MariaDB a PostgreSQL 16 administrado y los crons al worker. Ver la sección
> «Enmienda de plataforma» al final.
>
> **Revisión adversarial (2026-09-26):** incorpora los hallazgos H1, H7, H13, H14, H15, H23, H24, H25,
> H31, H41, H42 y H45 de la revisión multiagente, en la subsección «Revisión adversarial (2026-09-26)»
> de la enmienda; donde contradiga al cuerpo o a la tabla de la enmienda, rige esa subsección.
>
> **Consolidación (2026-09-26, tras la revisión en paralelo):** esta ADR es la referencia única del
> contrato de `aplicar_importacion` (I-2), del dueño de la auditoría (I-5), de las vistas que lee el
> portal y de las reglas de las migraciones (carpeta `packages/infra/migraciones`, solo esquema,
> candado `mantenimiento_esquema`, I-7); la regla de BD por delante de la imagen (rollback) es de
> ADR-0010. ADR-0008, 0009 y 0010 la citan sin redefinirla.

> Plantilla alineada al método **ADD** (Attribute-Driven Design, Len Bass — *Software Architecture in
> Practice*). Cada sección numerada corresponde a un paso del método. Las decisiones deben trazar a
> [0000-drivers-y-asrs.md](0000-drivers-y-asrs.md) y actualizar
> [_backlog-arquitectonico.md](_backlog-arquitectonico.md). Generada por la skill `setup-architecture`
> (`/build:architect`); un humano la promueve `proposed → accepted`.
>
> **Revisión tras ATAM-lite adversarial (2026-09-25):** se incorporan la decisión de ciudades en
> servidor, el bloqueo y presupuesto de tiempo de la importación, la auditoría con HMAC y ancla externa
> diaria, las reglas de `version` y de ETag, y la consecuencia explícita de perder el servidor.

## 1. Objetivo de la iteración y drivers seleccionados (Pasos 2–3)

- **Objetivo de la iteración:** fijar el modelo de datos del inventario, la única vía de escritura de
  perfiles, cómo se audita cada cambio, cómo se importa y revierte en bloque, cómo se proyecta el
  catálogo que ve el cliente y cómo se recupera el sistema tras una pérdida.
- **Elemento(s) a refinar:** `server/src/Dominio` (perfil, consentimiento, catálogos),
  `server/src/Aplicacion` (perfiles, importación, catálogo, auditoría), `server/src/Adapters/Persistencia`,
  `server/db/migrations` y `server/cron`.
- **Drivers abordados:**
  - Funcionales: UC-4 (catálogo recortado solo con sesión), UC-10 (ciclo de vida del perfil y
    consentimiento), UC-11 (importación y reversión), UC-12 (auditoría por campo), UC-13 (catálogos y
    léxico), UC-14 (colocados y evidencia).
  - Atributos de calidad: QA-5 (0 campos B.4, 0 fechas, 0 ciudades fuera de contexto, 0 publicados sin
    consentimiento), QA-9 (todo o nada; P95 ≤ 30 s con 200 filas), QA-10 (reversión con diff = 0),
    QA-11 (1:1 mutación ↔ entrada; evidencia de manipulación), QA-12 (pérdida ≤ 24 h, restauración
    ≤ 4 h), QA-17 (0 omitidos en silencio; banda contra la fecha del día), QA-20 (sin despliegue; fusión
    en una transacción).
  - Restricciones: CON-2 (180 s, 512 MB, 64 MB de subida), CON-9 (el portal solo lee), CON-11 (sin
    borrado físico; la importación no publica ni concede consentimiento), CON-15 (Cloudflare delante),
    CON-16 (JetBackup en el mismo servidor).
  - Concerns: CRN-9 (pérdida del servidor), CRN-14 (nivel 0 de validación contradictorio), CRN-15
    (concurrencia entre administradoras). CRN-10 (retención) se trata como propuesta.

## 2. Conceptos de diseño elegidos (Paso 4)

| Driver | Concepto / Táctica | Alternativas descartadas | Razón |
|--------|--------------------|--------------------------|-------|
| CON-9, QA-20 | **MariaDB 10.6 InnoDB**, `utf8mb4_unicode_ci`, **una BD con dos esquemas lógicos** (identidad y operación / inventario) separados por prefijo y por repositorio | Dos bases de datos; SQLite; archivos JSON | cPanel otorga privilegios por BD, no por tabla, así que dos BD no aíslan más. InnoDB da transacciones y FK que la importación y la fusión necesitan |
| Todos | **Migraciones SQL versionadas** en `server/db/migrations` con runner propio mínimo y tabla `schema_migraciones` | Doctrine Migrations / Phinx | Sin ORM (ADR-0001); un runner de ~100 líneas evita una dependencia para aplicar ficheros en orden |
| UC-10, QA-5, CON-11 | **Máquina de estados del perfil en el dominio** (`borrador · publicado · pausado · archivado`) como única vía de escritura para panel, importación, reversión y fusión; guardas de publicación | Validar en cada controlador; restricciones solo en BD | Un único punto hace imposible publicar por una vía que olvidó la guarda. Las reglas (consentimiento vigente, modalidad) cruzan tablas y no caben en un `CHECK` |
| QA-5 | **Invariante verificable por consulta** (0 publicados sin consentimiento vigente) en CI y en el Release Gate | Confiar en la guarda | Defensa en profundidad: detecta datos corruptos por restauración o SQL manual |
| CRN-15 | **Concurrencia optimista** con columna `version` en `perfiles`, que **sube en toda escritura del perfil o de sus tablas hijas** (roles, tecnologías, sectores, consentimientos), en todo cambio de consentimiento y en toda fusión de catálogo que lo reasigne; 409 si cambió. **Reintento acotado ante interbloqueo** (deadlock) en la unidad de trabajo | Bloqueo pesimista; «gana el último»; `version` solo en la fila principal | Dos administradoras rara vez chocan; el bloqueo deja registros tomados si se cierra la pestaña. Si la versión no cubriera las hijas, una edición de roles pisaría otra sin 409 |
| QA-11, UC-12 | **Auditoría de solo inserción en la misma transacción** que la mutación + **cadena HMAC** (`hash = HMAC-SHA256(clave_auditoria, hash_anterior ‖ contenido)`) con clave en `config.php`, **distinta de las credenciales de BD** + **ancla externa diaria obligatoria** (correo al responsable técnico con el hash de cabeza) + trigger que rechaza `UPDATE/DELETE` si el hosting lo permite (*a verificar*) | Hash simple sin clave; trigger como única fuente; log en fichero; tabla con `UPDATE` permitido | En cPanel no se puede quitar `UPDATE/DELETE` por tabla al usuario de la aplicación. Un hash sin clave lo recalcula cualquiera con la credencial de BD; con HMAC hace falta además la clave del fichero. El ancla fuera del servidor detecta incluso a quien tenga ambas. Escribir desde el servicio garantiza autor y origen, que un trigger no conoce |
| UC-4, QA-5, QA-17 | **Proyección del catálogo en servidor por sesión** desde la BD, con **ETag por versión global del inventario**; el 304 se emite **solo después del middleware de sesión**; `Cache-Control: private, no-store` para que Cloudflare no guarde nada | JSON estático generado en la carpeta privada; filtrar en el navegador; caché de Cloudflare con clave por cookie | La banda de disponibilidad depende de la fecha del día y el enlace pide el estado real de cada perfil; un estático caducaría. Filtrar en el cliente enviaría campos prohibidos. Un 304 antes de la sesión confirmaría a un tercero que su ETag sigue vigente |
| UC-4, QA-5, CON-10 | **Ciudades decididas por el servidor**: recibe la modalidad de la necesidad y los criterios obligatorios, aplica en PHP la parte mínima del filtro (modalidad del perfil ≠ Remoto y obligatorios de rol y país) y devuelve solo esas ciudades; **nunca por ids elegidos por el cliente** | `GET /ciudades?ids=…` con ids del navegador; ciudad en el catálogo general; reimplementar el motor completo en PHP | Con ids del cliente, cualquiera con sesión pediría la ciudad de todo el banco. Reimplementar el motor entero en PHP duplicaría D-14 y rompería la regla de un motor único. La parte mínima basta para respetar «ciudad solo en presencial/híbrido» |
| QA-9, QA-10 | **Importación en dos fases**: `calcularPlan` (sin escritura) y `aplicarPlan` (una transacción), con `lote_importacion` y **foto previa JSON** por perfil tocado; **`GET_LOCK` exclusivo** para aplicar y revertir; **presupuesto de 90 s** por petición; **endpoint de estado del lote** | Importar fila a fila con commit; cola asíncrona; sin bloqueo | Todo o nada es requisito; la foto permite revertir con diff = 0. Con ≤ 200 filas la vía síncrona evita depender del cron (*a validar*). Cloudflare corta la conexión a los 100 s aunque PHP permita 180 s: el presupuesto de 90 s y el estado consultable evitan que la administradora quede sin saber si se aplicó |
| QA-20, UC-13 | **Catálogos con `activo` y fusión transaccional**; el léxico apunta solo a IDs de catálogo (FK) | Borrado de valores; léxico por texto libre | CON-11 prohíbe borrar. La FK impide entradas de léxico hacia valores inexistentes |
| UC-14, QA-5 | **Evidencia en carpeta privada** `~/portal-privado/evidencia/<hash>` servida por el panel (`people-panel.trycore.com`) tras autorización | Carpeta dentro de `public_html`; almacenamiento externo (S3) | 0 URL públicas (QA-5); S3 añade proveedor y secreto sin necesidad |
| QA-12, CRN-9 | **JetBackup diario + exportación semanal cifrada del banco a Google Drive de Trycore** (en v1, procedimiento manual del responsable técnico: descarga el export cifrado y lo carga a Drive; sin integración nueva) + restauración de prueba. Objetivo aceptado: **RPO 24 h / RTO 4 h** (revisión única 2026-09-25). **Perder el servidor entero = hasta 7 días de pérdida**, consentimientos incluidos | Réplica en otro servidor; exportación diaria automática a Drive | Coste y operación fuera de alcance del hosting compartido; riesgo aceptado en §10.3. El RPO de 24 h lo cubre JetBackup; ante pérdida total del servidor manda la exportación semanal |
| CRN-11, UC-14 | **Borrador de evidencia de colocado (HU-140) por plantilla determinista, sin IA** (decisión del sponsor, 2026-09-25): precarga desde la modalidad de prueba del catálogo y extrae fecha y resultado con patrones; ningún dato sale del servidor; una persona confirma el resultado antes de guardarlo | Ampliar D-24 para usar Gemini con saneamiento; diferir HU-140 | D-24 y CON-8 impiden enviar datos de perfiles a un modelo; los patrones son explicables y testeables; diferir exige acuerdo del equipo |
| CRN-12 | **«Mi equipo» por invitado en servidor** (`equipos`, `equipo_perfiles`), ligado al invitado verificado y al enlace (detalle en ADR-0004) | En la URL por dispositivo | Decisión del sponsor (2026-09-25): continuidad entre dispositivos y equipo completo en la solicitud |

## 3. Instanciación: responsabilidades e interfaces (Paso 5)

- **Elementos instanciados:**
  - `Dominio/Perfil/Perfil` + `MaquinaEstadosPerfil` + `GuardasPublicacion`.
  - `Dominio/Consentimiento`, `Dominio/Catalogo`, `Dominio/Lexico`.
  - `Aplicacion/Perfiles/ServicioPerfiles`, `Aplicacion/Importacion/ServicioImportacion`,
    `Aplicacion/Catalogo/ServicioProyeccionCatalogo`, `Aplicacion/Catalogo/ServicioCiudades`,
    `Aplicacion/Catalogos/ServicioCatalogos`, `Aplicacion/Auditoria/RegistroAuditoria`,
    `Aplicacion/Auditoria/AnclaAuditoria`, `Aplicacion/Evidencia/ServicioEvidencia`,
    `Aplicacion/Colocados/ServicioColocados`, `Aplicacion/Exportacion/ServicioExportacion`.
  - `Adapters/Persistencia/*` (repositorios PDO, `UnidadDeTrabajo` que abre y cierra la transacción
    y reintenta ante interbloqueo), `Adapters/Http/MiddlewareSesion`, `Adapters/Http/CondicionalEtag`.
  - `cron/verificar-auditoria.php` (verifica la cadena y envía el ancla), `cron/sincronizar-colocados.php`,
    `cron/exportar-banco.php`.
- **Entidades principales:**

| Tabla | Campos clave | Notas |
|-------|--------------|-------|
| `perfiles` | codigo (único), estado, familia_id, modalidad_id, pais_id, ciudad_id, disponibilidad_fecha, disponibilidad_actualizada_en, motivo_pausa_id, version | Sin borrado físico; `archivado` es el final. `version` cubre también las tablas hijas |
| `perfil_roles`, `perfil_tecnologias`, `perfil_sectores` | perfil_id, valor_id, orden | Toda escritura sube `perfiles.version` en la misma transacción |
| `catalogo_*` | roles, familias, modalidades (texto_cliente), tecnologias, sectores, motivos_pausa, paises, ciudades; `activo`, `fusionado_en_id` | Dependencia rol → familia → modalidades |
| `consentimientos` | perfil_id, alcance, evidencia_id, vigente, otorgado_en, revocado_en | Nominal; revocar despublica; todo cambio sube `perfiles.version` |
| `inventario_version` | fila única: valor, actualizado_en | Versión global; la sube **toda** vía de escritura |
| `lexico`, `propuestas_lexico` | termino, catalogo_tipo, catalogo_id (FK); propuesta con estado `pendiente|aprobada|rechazada` | Gemini propone, persona aprueba (D-24) |
| `enlaces` y anexas | ver ADR-0002 | |
| `solicitudes`, `trabajos` | ver ADR-0005 | |
| `eventos` | ver ADR-0006 | |
| `colocados` | codigo_perfil, cuenta, fecha_corte | Espejo de solo lectura |
| `equipos` | id, invitado_id (correo verificado), enlace_id, creado_en, actualizado_en; único (invitado_id, enlace_id) | «Mi equipo» (CRN-12): cada invitado ve solo el suyo; se copia completo a la solicitud |
| `equipo_perfiles` | equipo_id, codigo_perfil, orden, agregado_en | Solo perfiles publicables del enlace |
| `borradores_evidencia` | colocado_id, modalidad_prueba_id, fecha_extraida, resultado_extraido, texto_plantilla, confirmado_por, confirmado_en | HU-140 (CRN-11): plantilla determinista; no vale como evidencia hasta que una persona lo confirma |
| `artefactos` | hash_sha256, ruta_privada, tipo, tamano, perfil_id | Nunca URL pública |
| `lotes_importacion` | id, archivo_hash, modo, estado (`calculado|aplicando|aplicado|abortado|revertido`), iniciado_en, terminado_en, filas_aplicadas, error, aplicado_por, foto_previa JSON por perfil | Solo el último aplicado es reversible |
| `auditoria` | id, actor, entidad, entidad_id, campo, antes, despues, origen, cuando, hash_anterior, hash (HMAC) | Solo inserción; índice por (entidad, entidad_id) |
| `anclas_auditoria` | fecha, ultimo_id, hash_cabeza, total_filas, enviado_a, enviado_en | Registro local de lo enviado; la copia que vale es la del buzón |

- **Responsabilidades clave:**
  - **Máquina de estados:** transiciones `borrador→publicado` (guardas: consentimiento nominal vigente,
    modalidad válida para la familia, sin incoherencias de severidad alta), `publicado→pausado`
    (exige motivo), `pausado→publicado`, `*→archivado`. Revocar consentimiento fuerza
    `publicado→borrador`. La regla de modalidad obligatoria depende de CRN-14.
  - **Versión y concurrencia:** `perfiles.version` sube en cada escritura del perfil, de sus tablas
    hijas, de su consentimiento y en cada fusión que reasigne alguno de sus valores. El panel envía
    `If-Match: <version>`; si no coincide, 409 con los campos que cambiaron. `inventario_version` sube
    en la misma transacción que cualquier escritura que cambie lo que el cliente puede ver: panel,
    importación, reversión, fusión y catálogos, revocación de consentimiento y **cron de colocados**.
    La `UnidadDeTrabajo` reintenta hasta 3 veces, con espera corta y aleatoria, cuando MariaDB devuelve
    interbloqueo (1213) o espera de bloqueo agotada (1205); al tercer fallo responde 503 sin escribir
    nada. Los bloqueos se toman siempre en el mismo orden (perfil → hijas → versión global →
    auditoría) para reducir interbloqueos.
  - **Auditoría:** `RegistroAuditoria::registrar()` solo se invoca dentro de la `UnidadDeTrabajo`; una
    fila por campo cambiado; `origen ∈ {panel, importacion, reversion, sincronizacion, fusion,
    revocacion}`. La cadena se encadena con `SELECT … FOR UPDATE` sobre la última fila para
    serializar. `hash = HMAC-SHA256(clave_auditoria, hash_anterior ‖ contenido canónico)`; la clave
    vive en `config.php` fuera de `public_html`, es distinta de la contraseña de BD y de los demás
    secretos, y no se guarda en la BD ni en las exportaciones. Si el hosting permite triggers, se
    añade uno que rechace `UPDATE/DELETE` sobre `auditoria` (*a verificar* en el servidor antes de
    EP-006).
  - **Ancla externa (obligatoria):** el cron diario verifica la cadena completa y envía por correo al
    responsable técnico (buzón en Google Workspace, fuera del servidor) la fecha, el último id, el
    total de filas y el hash de cabeza. Si la verificación falla, el correo lo dice en el asunto. Si el
    correo no sale dos días seguidos, lo detecta la vigilancia de tareas (ADR-0005, QA-13). Para
    verificar tras un incidente se recalcula la cadena y se compara con los hashes de cabeza del buzón.
  - **Proyección (UC-4):** `ServicioProyeccionCatalogo::paraSesion(enlace)` devuelve solo publicados,
    sin campos del Anexo B.4, con `banda_disponibilidad` calculada con `Reloj` (fecha vencida > 30
    días → «Por confirmar»), sin ciudad. El orden de la respuesta es por código (o por un criterio que
    no dependa de la fecha); nunca por `disponibilidad_fecha`, para que el orden no revele la fecha.
    Para cada código del enlace curado informa el estado real (`disponible | colocado | pausado |
    fuera_del_banco`).
  - **ETag y caché:** ETag = `inventario_version` + fecha del día + enlace. Orden en la petición:
    primero el middleware de sesión (sin sesión válida → 401, nunca 304); después la comparación de
    `If-None-Match`. Todas las respuestas del catálogo y de ciudades llevan `Cache-Control: private,
    no-store` y `Vary: Cookie`; Cloudflare tiene una regla de no cachear `/api/*`. Como `no-store`
    impide que el navegador guarde la respuesta, el portal conserva en memoria el último cuerpo y su
    ETag y envía `If-None-Match` a mano con `fetch`; un 304 le ahorra descargar y analizar el catálogo.
  - **Ciudades (UC-4, CON-10):** `ServicioCiudades::paraNecesidad(sesion, modalidad_necesidad,
    obligatorios)`. Si la modalidad de la necesidad no es presencial ni híbrida, devuelve lista vacía.
    Si lo es, toma los perfiles publicados del conjunto de la sesión, descarta los de modalidad Remoto,
    aplica solo los obligatorios de rol y de país y devuelve `{codigo, ciudad}` de los que quedan. El
    cliente no puede pedir ciudades por código. El resto de criterios los sigue aplicando el motor del
    navegador (ADR-0004), así que el servidor puede devolver la ciudad de algunos perfiles que el
    navegador luego no muestra; cuánta precisión exigir es un trade-off de negocio abierto (§6).
  - **Importación:** `calcularPlan(archivo, modo)` → vista previa por fila (crear, actualizar, sin
    cambios, error); `aplicarPlan(plan)` toma `GET_LOCK('importacion', 0)`: si otra aplicación o
    reversión está en curso, responde 423 al momento sin esperar. Con el bloqueo, marca el lote
    `aplicando`, activa `ignore_user_abort(true)` y aplica en una transacción que revalida `version`.
    Presupuesto de 90 s de reloj (Cloudflare corta a 100 s): si se agota, `ROLLBACK`, lote `abortado`
    con motivo, y la administradora ve «no se aplicó nada, divide el archivo». `GET
    /importaciones/{id}/estado` devuelve estado, filas aplicadas y error, para que la pantalla lo
    consulte si la conexión se corta. Límite de 200 filas por archivo (*a validar* contra el
    presupuesto); idempotente; nunca cambia estado a `publicado` ni crea consentimiento.
    `revertir(lote)` usa el mismo bloqueo y presupuesto, solo sobre el último lote aplicado: restaura
    la foto de los actualizados, archiva los creados y aborta si algún perfil tiene `version` posterior
    al lote, listando conflictos.
  - **Catálogos:** `fusionar(origen, destino)` muestra antes el recuento de referencias y luego las
    reasigna en una transacción, sube `version` de cada perfil afectado y la versión global, deja
    `origen.activo=false` y `fusionado_en_id=destino`.
  - **Colocados:** cron diario o importación del archivo del sistema de asignación; pasa por la misma
    unidad de trabajo (auditoría con origen `sincronizacion`, sube la versión global); muestra
    `fecha_corte` en el panel.
  - **Recuperabilidad:** JetBackup diario (mismo servidor, CRN-9 aceptado); exportación JSON/CSV del
    banco semanal (RF-8.15.9) copiada fuera del servidor; restauración de prueba antes de producción.
    **Si se pierde el servidor, se pierde hasta 7 días de trabajo** (lo hecho desde la última
    exportación), **consentimientos incluidos**: la reconstrucción desde exportación no restituye
    consentimientos vigentes, así que todos los perfiles quedan en `borrador` hasta que Talento Humano
    vuelva a registrar cada consentimiento con su evidencia. La cola de solicitudes, la auditoría y los
    artefactos de evidencia de esa ventana también se pierden.
  - **Borrador de evidencia (HU-140, CRN-11):** `ServicioBorradorEvidencia` arma el texto desde una
    plantilla por modalidad de prueba del catálogo y extrae fecha y resultado del material de entrada
    con patrones (regex de fecha y de resultado sobre un vocabulario cerrado). Si un patrón no
    encuentra valor, el campo queda vacío para que la persona lo complete. No llama a ningún servicio
    externo. Guardarlo exige confirmación nominal (queda en la auditoría).
  - **Retención (propuesta, CRN-10, a validar):** consentimientos revocados y su evidencia se
    conservan 5 años como prueba y luego se anonimizan; `intentos` y códigos se purgan a los 30 días;
    auditoría se conserva mientras exista el perfil más 5 años.
- **Interfaces / contratos:**
  - Portal (`people.trycore.com`): `GET /api/v1/catalogo` (ETag, 304 solo con sesión válida,
    `Cache-Control: private, no-store`); `POST /api/v1/catalogo/ciudades` con cuerpo
    `{modalidad_necesidad, obligatorios: {roles[], pais}}` → `[{codigo, ciudad}]`. Es `POST` por el
    tamaño del cuerpo, pero no escribe nada (CON-9).
  - Panel (`people-panel.trycore.com`): `PATCH /perfiles/{codigo}` con `If-Match: <version>` → 200 |
    409; `POST /perfiles/{codigo}/transicion`; `POST /importaciones/plan`; `POST
    /importaciones/{id}/aplicar` → 200 | 409 | 423; `GET /importaciones/{id}/estado`; `POST
    /importaciones/{id}/revertir`; `POST /catalogos/{tipo}/{id}/fusionar`; `GET /auditoria`; `GET
    /evidencia/{id}` (autorizado); `GET /exportacion`.
  - Staging: los mismos contratos en `people-staging.trycore.com` y `people-panel-staging.trycore.com`,
    con su propia clave de auditoría y su propio destinatario del ancla.

## 4. Vistas y registro de la decisión (Paso 6)

Máquina de estados del perfil:

```mermaid
stateDiagram-v2
  [*] --> borrador: crear (panel o importación)
  borrador --> publicado: publicar [consentimiento vigente ∧ modalidad válida ∧ sin incoherencia alta]
  publicado --> pausado: pausar [motivo]
  pausado --> publicado: reanudar [guardas]
  publicado --> borrador: revocar consentimiento
  borrador --> archivado: archivar
  publicado --> archivado: archivar
  pausado --> archivado: archivar
  archivado --> [*]
```

Escritura con auditoría encadenada, versión e importación en dos fases:

```mermaid
flowchart TB
  UI[apps/panel] -->|PATCH con If-Match| API[API panel]
  UI -->|POST plan / aplicar / revertir| API
  UI -->|GET estado del lote| API
  API --> SP[ServicioPerfiles]
  API --> SI[ServicioImportacion]
  SI -->|calcularPlan sin escritura| SP
  SI -->|GET_LOCK · presupuesto 90 s| UT
  CRC[cron colocados] --> UT
  SP --> ME[MaquinaEstadosPerfil + Guardas]
  ME --> UT[UnidadDeTrabajo: BEGIN · reintento ante interbloqueo]
  UT --> RP[(perfiles e hijas · version)]
  UT --> IV[(inventario_version)]
  UT --> LI[(lotes_importacion · foto previa · estado)]
  UT --> RA[RegistroAuditoria: HMAC clave, hash_anterior ‖ fila]
  RA --> AU[(auditoria solo inserción)]
  UT -->|COMMIT o ROLLBACK| DB[(MariaDB InnoDB)]
  CR[cron verificar-auditoria] -->|recalcula cadena| AU
  CR -->|hash de cabeza diario| MAIL[Buzón del responsable técnico fuera del servidor]
```

Lectura del catálogo y de ciudades por el cliente:

```mermaid
sequenceDiagram
  participant N as Navegador (people.trycore.com)
  participant CF as Cloudflare (no cachea /api)
  participant MS as Middleware de sesión
  participant E as Condicional ETag
  participant P as Proyección / Ciudades
  N->>CF: GET /api/v1/catalogo · If-None-Match
  CF->>MS: reenvía sin caché
  alt sin sesión válida
    MS-->>N: 401 (nunca 304)
  else con sesión
    MS->>E: compara con inventario_version + fecha + enlace
    alt igual
      E-->>N: 304 · private, no-store
    else distinto
      E->>P: proyección sin B.4, sin fecha, sin ciudad, orden por código
      P-->>N: 200 · ETag · private, no-store
    end
  end
  N->>CF: POST /api/v1/catalogo/ciudades {modalidad, obligatorios}
  CF->>MS: reenvía
  MS->>P: si presencial/híbrido: perfiles ≠ Remoto ∧ rol ∧ país
  P-->>N: [{codigo, ciudad}]
```

**Decisión:** MariaDB única con esquemas lógicos y migraciones propias; toda escritura de perfiles pasa
por la máquina de estados del dominio dentro de una unidad de trabajo que también escribe la auditoría
encadenada con HMAC, sube la versión del perfil y la versión global, y reintenta ante interbloqueo; la
cadena se ancla a diario fuera del servidor por correo; el catálogo del cliente es una proyección
calculada por sesión, sin caché compartida y con 304 solo tras validar la sesión; las ciudades las
decide el servidor con la parte mínima del filtro; la importación separa plan y aplicación, se
serializa con `GET_LOCK`, cabe en 90 s, expone su estado y es reversible solo en su último lote;
evidencia en carpeta privada; respaldo diario más exportación semanal fuera del servidor, con la
pérdida de hasta 7 días declarada.

**Trade-offs aceptados:**
- La cadena serializa las escrituras de auditoría (bloqueo sobre la última fila); con el volumen de
  Talento Humano es aceptable, y el reintento cubre los interbloqueos ocasionales.
- La cadena detecta manipulación, no la impide. Con HMAC, la credencial de BD sola no basta para
  reescribirla; quien tenga además el fichero de configuración sí puede, pero no puede cambiar los
  hashes de cabeza que ya llegaron al buzón. Queda una ventana de hasta 24 h (desde el último ancla).
- Proyectar por sesión cuesta CPU en cada carga; el ETag lo reduce a una consulta de versión, pero
  como Cloudflare no cachea, todo el tráfico del catálogo llega al hosting.
- El filtro mínimo de ciudades devuelve un superconjunto de lo que el navegador mostrará.
- Una sola importación a la vez y archivos acotados por el presupuesto de 90 s.
- Revertir solo el último lote simplifica el modelo a costa de no poder deshacer uno anterior.

## 5. Análisis del diseño (Paso 7)

> Tras la evaluación ATAM-lite adversarial. ✅ solo cuando hay medida o un plan de verificación
> concreto; ⚠️ cuando depende de algo sin medir o sin decidir; ❌ cuando no se resuelve aquí.

| Driver | ✅/⚠️/❌ | Evidencia / medida | Riesgo residual |
|--------|---------|--------------------|-----------------|
| UC-4 | ⚠️ | Proyección por sesión sin B.4 ni fecha; ciudades decididas en servidor por modalidad y obligatorios de rol/país; estado real por código del enlace. Plan: test de contrato del payload (campos permitidos, orden por código, 401 sin sesión) | Precisión del filtro de ciudades sin decidir: el servidor puede revelar la ciudad de perfiles que el navegador no mostrará |
| UC-10 | ⚠️ | Máquina de estados única con guardas; revocar despublica y sube `version` | Guarda de modalidad depende de CRN-14, sin resolver en discovery |
| UC-11 | ✅ | Plan/aplicación, lote con foto, reversión del último, idempotencia. Plan: test de dos aplicaciones simultáneas (la segunda recibe 423); test de corte de conexión a los 100 s con consulta de estado; reimportar el mismo archivo → 100 % «sin cambios» | Límite de 200 filas aún no confirmado contra el presupuesto de 90 s (ver QA-9) |
| UC-12 | ✅ | Una fila por campo, origen tipado, misma transacción, índice por entidad. Plan: batería 1:1 mutación ↔ entrada por cada origen, incluido el cron de colocados | — |
| UC-13 | ✅ | `activo`, fusión transaccional que sube versiones, léxico con FK, propuestas con estado. Plan: test de fusión con recuento previo = reasignados | — |
| UC-14 | ⚠️ | Espejo con `fecha_corte` por la unidad de trabajo; evidencia privada servida tras autorización | `post_max_size` = 64 MB deja el límite real de archivo algo por debajo de 64 MB; ModSecurity sin probar con subidas grandes. Plan: subir un artefacto de 60 MB en staging |
| QA-5 | ✅ | Proyección sin B.4, sin fecha y orden neutro; ciudad solo si la necesidad es presencial/híbrida y el perfil no es Remoto; 401 antes de cualquier 304; `private, no-store`; invariante de consentimiento por consulta en CI y Release Gate. Plan: test de contrato de campos, de orden (dos fechas distintas no cambian el orden) y de cabeceras; prueba en staging de que Cloudflare no devuelve `cf-cache-status: HIT` en `/api/*` | Superconjunto de ciudades dentro del contexto presencial/híbrido (ver UC-4) |
| QA-9 | ⚠️ | Transacción única; vista previa sin escritura; `GET_LOCK`; presupuesto de 90 s con `ROLLBACK`; estado del lote consultable | P95 ≤ 30 s con 200 filas sin medir en el hosting; el corte de Cloudflare a 100 s es la cota real, no los 180 s de PHP. Plan: medir en staging con archivo de 200 filas reales |
| QA-10 | ✅ | Foto previa, archivado de creados, detección de conflictos por `version` (que ahora cubre hijas y consentimiento). Plan: test diff = 0 tras revertir; test de rechazo al revertir un lote que no es el último | ≤ 30 s sin medir (mismo plan que QA-9) |
| QA-11 | ⚠️ | Solo inserción en la transacción; cadena HMAC con clave separada de la BD; ancla diaria por correo obligatoria; cron de verificación. Plan: test que altera una fila y comprueba que la verificación falla; test que reescribe la cadena sin la clave y falla | Trigger de solo-inserción sin verificar en el hosting; quien comprometa BD y fichero puede reescribir hasta 24 h sin detección; el ancla depende de que el correo salga (vigilado por QA-13) |
| QA-12 | ⚠️ | JetBackup diario cubre fallo de BD y error humano (pérdida ≤ 24 h); exportación semanal fuera del servidor; restauración de prueba antes de producción | Restauración ≤ 4 h no ensayada. Perder el servidor = hasta 7 días de pérdida, consentimientos incluidos (todos los perfiles a `borrador`). Destino de la exportación y RPO/RTO sin decidir |
| QA-17 | ✅ | Banda con `Reloj` contra la fecha del día; «Por confirmar» > 30 días; fecha del día en el ETag; estados explícitos por código. Plan: tests con reloj simulado al cruzar medianoche y a 31 días | — |
| QA-20 | ✅ | Catálogos editables en panel; toda escritura sube la versión global, así que el ETag cambia y el portal los ve en la siguiente carga. Plan: test de que cada vía de escritura (incluido el cron de colocados) sube `inventario_version` | — |
| CON-2 | ⚠️ | Presupuesto de 90 s por debajo de 180 s y del corte de 100 s de Cloudflare | Memoria con 200 filas y foto previa JSON sin medir contra 512 MB |
| CON-9 | ✅ | El portal solo tiene lecturas; `POST /ciudades` no escribe. Plan: test que recorre las rutas del portal y verifica 0 escrituras en BD | — |
| CON-11 | ✅ | Sin `DELETE` en repositorios de perfiles ni catálogos; importación sin publicar ni conceder consentimiento. Plan: grep en CI de `DELETE` en esos repositorios | — |
| CON-15 | ✅ | `private, no-store`, `Vary: Cookie` y regla de Cloudflare de no cachear `/api/*`; presupuesto por debajo de los 100 s. Plan: prueba en staging de cabeceras y `cf-cache-status` | — |
| CON-16 | ✅ | JetBackup diario asumido; restauración de prueba planificada | — |
| CRN-9 | ⚠️ | Consecuencia declarada con cifra (hasta 7 días, consentimientos incluidos); exportación fuera del servidor | Consentimientos no reconstruibles desde exportación; destino de la exportación sin decidir |
| CRN-10 | ⚠️ | Retención propuesta (5 años consentimientos y auditoría, 30 días intentos) | Propuesta sin validar legalmente |
| CRN-11 | ✅ | Plantilla determinista sin IA; plan: unitarios de extracción por patrón (fechas en formatos locales, resultados del vocabulario, campo vacío si no hay coincidencia), test de contrato de 0 llamadas salientes y test de que sin confirmación no se guarda como evidencia | Divergencia con el texto actual de HU-140, a reflejar por discovery |
| CRN-12 | ✅ | `equipos`/`equipo_perfiles` con único (invitado, enlace); plan en ADR-0004 | — |
| CRN-14 | ❌ | No se resuelve aquí | Devuelto a discovery |
| CRN-15 | ✅ | `If-Match` + `version` que sube en hijas, consentimiento y fusión; 409; reintento ante interbloqueo. Plan: test de dos ediciones concurrentes, una sobre roles y otra sobre el perfil (la segunda recibe 409); test de interbloqueo inyectado que termina en éxito o 503 sin escritura parcial | — |

**Drivers no resueltos en esta iteración:** CRN-14 (modalidad obligatoria para publicar, a corregir en
discovery); CRN-10 (retención: propuesta sin validar); verificaciones pendientes en el hosting
(permiso de triggers, tiempo y memoria de importación, subida de artefactos grandes) para QA-9,
QA-11, UC-14 y CON-2; las decisiones de negocio de UC-4 y QA-12 quedaron tomadas en la revisión única (§6).

## 6. Consecuencias

- **Positivas:**
  - Una sola vía de escritura hace auditable y verificable el 100 % de las mutaciones, incluidas las
    del cron de colocados.
  - El cliente nunca recibe campos prohibidos ni la ciudad de un perfil remoto, porque la decisión
    se toma en el servidor; ni Cloudflare ni un tercero sin sesión pueden obtener el catálogo.
  - Importar es seguro de repetir y de deshacer, no puede solaparse y nunca deja a la administradora
    sin saber si se aplicó.
  - Manipular la auditoría exige la BD, el fichero de configuración y además no deja rastro en el
    buzón externo, que ya tiene los hashes anteriores.
  - Ninguna edición se pisa en silencio: la versión cubre todo lo que forma el perfil.
- **Negativas:**
  - SQL a mano en repositorios exige disciplina de pruebas.
  - Sin caché en Cloudflare, cada carga del catálogo llega al hosting compartido.
  - Una importación a la vez y archivos limitados por el presupuesto de 90 s; los archivos grandes
    hay que dividirlos.
  - El filtro de ciudades en PHP es una segunda implementación parcial de reglas del motor del
    navegador; hay que mantener ambas coherentes (test compartido de casos).
  - La recuperación ante pérdida total del servidor es parcial y lenta: sin consentimientos, todo el
    banco vuelve a `borrador`.
- **Riesgos:**
  - Triggers no permitidos en el hosting: la solo-inserción descansa solo en la cadena HMAC y el ancla.
  - El correo del ancla no sale (SMTP caído, rebote): se detecta por la vigilancia de tareas, pero
    ese día queda sin ancla.
  - Filtración de `config.php` (clave de auditoría y credencial de BD a la vez): reescritura posible
    dentro de la ventana de 24 h.
  - Tiempo de importación de 200 filas por encima de 90 s en el hosting real: habría que bajar el
    límite de filas.
  - Interbloqueos más frecuentes de lo previsto si coinciden importación, panel y cron de colocados.
- **Trade-offs de negocio abiertos (decide el equipo, no la arquitectura):**
  - **Destinatario del ancla diaria:** qué persona o buzón es el «responsable técnico» y cuánto tiempo
    conserva esos correos (debe ser al menos lo que dure la auditoría).
- **Decisiones de la revisión única (sponsor, 2026-09-25):**
  - **CRN-11 (HU-140):** borrador de evidencia por plantilla determinista, sin IA; ningún dato sale
    del servidor; el resultado lo confirma una persona. Discovery debe reflejarlo en HU-140.
  - **CRN-12:** «Mi equipo» por invitado en servidor (`equipos`, `equipo_perfiles`); el Perfil
    Objetivo sigue por dispositivo (D-16).
  - **Ciudad:** solo cuando la necesidad es presencial o híbrida, con el filtro mínimo en servidor
    (se acepta la pequeña exposición extra de R-20).
  - **Exportación y recuperación:** semanal, cifrada, a Google Drive de Trycore; en v1 la hace a mano
    el responsable técnico (descarga el export cifrado y lo carga a Drive), sin integración nueva.
    Objetivo RPO 24 h / RTO 4 h (QA-12). Ante pérdida total del servidor la ventana sigue siendo de
    hasta 7 días (R-8 aceptado).
- **Operacionales:** tres crons diarios (verificar auditoría y enviar ancla, colocados, purga) y uno
  semanal (exportación); ensayo de restauración antes de producción y tras cada cambio de esquema
  mayor; rotar la clave de auditoría exige empezar un nuevo tramo de cadena y anclarlo.

## 7. Trazabilidad

- Drivers: [0000-drivers-y-asrs.md](0000-drivers-y-asrs.md) — UC-4, UC-10, UC-11, UC-12, UC-13,
  UC-14, QA-5, QA-9, QA-10, QA-11, QA-12, QA-17, QA-20, CON-2, CON-9, CON-11, CON-15, CON-16, CRN-9,
  CRN-14, CRN-15 (y CRN-10 como propuesta). Se añaden CON-2 y CON-15 por el presupuesto de 90 s y la
  política de caché.
- PRD / HU / Flows: [portal-people-service.md](../01-prd/portal-people-service.md) RF-3.7, 3.13,
  RF-8.2–8.5, 8.7, 8.9–8.16 (incl. 8.15.7, 8.15.9, 8.16.5), RF-13.5.5.2, RF-14.0, RF-19.2, §8.3,
  §10.3, Anexo B (B.4, B.8, B.9); D-14, D-24; EP-003, EP-006, EP-009 (HU-086–089, HU-125–143);
  [requisitos-tecnicos-hosting.md](../01-prd/requisitos-tecnicos-hosting.md).
- Relacionadas: [ADR-0001](0001-estilo-y-stack-base.md), [ADR-0002](0002-identidad-acceso-y-sesiones.md)
  (middleware de sesión), [ADR-0004](0004-busqueda-determinista-y-estado.md) (motor del navegador y
  filtro de ciudades), [ADR-0005](0005-integraciones-y-trabajo-diferido.md) (solicitudes, trabajos,
  vigilancia de crons y correo del ancla), [ADR-0006](0006-telemetria-y-atribucion.md) (eventos),
  [ADR-0007](0007-entornos-despliegue-y-perimetro.md) (reglas de Cloudflare, respaldo y exportación).
- Stack operacionalizado en: `.claude/config/stack-allowlist.json` — sin dependencias nuevas (PDO,
  `hash_hmac` nativo de PHP, runner de migraciones propio).


## Enmienda de plataforma (iteración 8, 2026-09-25)

> Se conservan: toda escritura por la unidad de trabajo, auditoría por campo en la misma transacción
> con cadena HMAC y ancla diaria externa, versión global y ETag del catálogo tras sesión con
> `private, no-store`, proyección sin lista negra B.4, importación en dos fases con foto previa y
> reversión del último lote, sin borrado físico, colocados por la unidad de trabajo, concurrencia
> optimista y la exportación semanal cifrada a Google Drive (decisión del sponsor). Donde el texto
> anterior diga MariaDB, PDO, `GET_LOCK`, cron, JetBackup o carpeta privada, rige esta tabla.

| Mecanismo (texto anterior) | Implementación vigente | Efecto |
|----------------------------|------------------------|--------|
| MariaDB 10.6 InnoDB, una BD con dos esquemas lógicos por prefijo | PostgreSQL 16 administrado con **esquemas reales** `identidad` y `operacion`; `pg` + Kysely; migraciones Kysely ejecutadas por el job `migrar` (ADR-0010) | Separación nativa y permisos por esquema |
| Auditoría de solo inserción descansando en HMAC si el hosting no permite triggers | **Rol de aplicación sin `UPDATE`/`DELETE` sobre `auditoria.auditoria`** + trigger `BEFORE UPDATE OR DELETE` que lanza excepción, **además** de la cadena HMAC y el ancla diaria. La clave HMAC (`AUDIT_HMAC_KEY`) solo la reciben panel y worker | **Se cierra R-1** si V10-10 confirma los permisos **ejecutada en producción en oscuro** (staging usa el mismo script de roles sin superusuario para la aplicación, pero no reproduce los usuarios creados con `doctl`, los *pools* de DO ni los privilegios reales de `doadmin` en la BD administrada; *corregido en la consolidación: el texto anterior decía «en staging somos superusuario»*); si no, queda la protección HMAC + ancla como antes |
| `GET_LOCK('importacion', 0)` | `pg_try_advisory_xact_lock(hashtext('importacion'))` dentro de la transacción de aplicación | Se libera solo al terminar la transacción |
| `aplicarPlan` síncrono con presupuesto de 90 s por el corte de 100 s de Cloudflare | `POST /importacion/lotes/{id}/aplicar` responde `202` y encola el trabajo `aplicar_importacion`; el worker aplica en **una** transacción sin techo de 100 s; el panel consulta `GET /importacion/lotes/{id}` hasta `aplicado`, `abortado` o `error`. La reversión sigue el mismo camino | **Se cierra R-18** (el corte de Cloudflare ya no aplica); el límite de filas se fija por memoria y tiempo medidos, no por el borde |
| Reintento de la unidad de trabajo ante interbloqueo de MariaDB | Reintento hasta 3 veces ante `40P01` (interbloqueo) y `40001` (serialización) | R-19 sin cambios de fondo |
| Filtro mínimo de ciudad en PHP (segunda implementación parcial) | El servidor importa **`packages/motor`** y decide la ciudad con el mismo motor que el navegador (regla T-9 sin cambios: ciudad solo si la necesidad es presencial o híbrida) | **Se cierra R-20** |
| Evidencias (video, transcripción) en carpeta privada del hosting, límite `post_max_size` 64 MB | **DO Spaces** privado con URL prefirmadas de PUT y GET, solo para el panel (ADR-0010) | El tamaño deja de depender de PHP y de Cloudflare |
| JetBackup diario en el mismo servidor | Respaldo diario automático + **PITR de 7 días** de la BD administrada; la exportación semanal a Drive se mantiene como copia fuera del proveedor | R-8: ventana ante pérdida de la BD = minutos; ante pérdida de cuenta o región = hasta 7 días (aceptado) |
| Crons `verificar-auditoria`, `sincronizar-colocados`, `exportar-banco`, purgas | Tareas del planificador del worker (ADR-0009) | — |
| `hash_hmac` nativo de PHP | `crypto.createHmac` de Node | Sin dependencias nuevas |
| CON-2 (180 s, 512 MB, 64 MB) y CON-16 (JetBackup) | Reemplazadas por CON-18/CON-19 | — |

**Veredictos que cambian en §5:** UC-14 pasa a ✅ con subida directa a Spaces (plan: test de URL
prefirmada vencida y de acceso sin autorización → 403); QA-9 ⚠️ solo por el P95 de 200 filas sin
medir en DO; QA-11 ⚠️ hasta V10-10; QA-12 ⚠️ hasta ensayar la restauración (V10-3); CON-2,
CON-15 y CON-16 dejan de aplicar.

### Revisión adversarial (2026-09-26)

> Resuelve los hallazgos de la revisión multiagente que tocan esta ADR. Donde el cuerpo o la tabla
> anterior digan otra cosa, rige esta subsección. Las verificaciones propias de esta ADR se numeran
> V3-n; las de otras ADR se citan con su prefijo (V10-3, V10-10…).

#### Decisiones (§2 y §3)

| Mecanismo (texto anterior) | Decisión vigente | Hallazgo · razón |
|----------------------------|------------------|------------------|
| Cadena encadenada con `SELECT … FOR UPDATE` sobre la última fila de `auditoria`; orden por `id` | **Cabeza de cadena en una fila por tramo** `auditoria.auditoria_cabeza(tramo PRIMARY KEY, seq, hash)` (sin columna `id`: la clave es `tramo`), sembrada con un hash génesis por el script de roles de ADR-0008 (`roles.sql`; *corregido en la consolidación, 2.ª pasada: antes «por la migración inicial», imposible porque `ps_migrador` no puede escribir en una tabla de `ps_auditoria_dueno`*). `RegistroAuditoria` no toca las tablas: llama a la función `SECURITY DEFINER` `auditoria.registrar(...)` de `ps_auditoria_dueno` (*revisión de coherencia*), que dentro hace `SELECT … FROM auditoria_cabeza WHERE tramo = <tramo vigente> FOR UPDATE` (fila fija por clave, sin `ORDER BY`/`LIMIT`: la segunda transacción ve la versión actualizada tras la espera), numera las filas con `seq` consecutivo desde la cabeza, las inserta con sus valores cifrados y actualiza la cabeza **una vez por transacción** (acepta el lote de filas de la transacción). Así ningún rol de conexión necesita `UPDATE` sobre la cabeza. La cadena se ordena y verifica por `seq` y por el enlace `hash_anterior`, nunca por el `id` de secuencia (que se asigna al insertar, no al confirmar). Es el último bloqueo del orden perfil → hijas → versión global → auditoría | H1 · en READ COMMITTED `FOR UPDATE` con `ORDER BY … LIMIT 1` no re-ejecuta el orden tras la espera y bifurca la cadena; con la tabla vacía no bloquea nada |
| Contenido del hash = fila completa (`antes`, `despues` en claro); anonimización a 5 años «luego» | **Compromiso de valor + borrado criptográfico por titular.** El hash cubre metadatos (`seq`, actor, entidad, entidad_id, campo, origen, cuándo, tramo) más `HMAC(clave_titular, valor)` de `antes` y `despues`. Los valores viven cifrados (AES-256-GCM, `crypto` de Node) en `auditoria.auditoria_valores(seq, antes_cifrado, despues_cifrado)` con una **clave por profesional** en `identidad.claves_titular(perfil_id, clave_envuelta, destruida_en)`, envuelta con `AUDIT_KEK` (secreto nuevo, solo panel y worker). Suprimir o anonimizar = destruir la clave del titular (y vaciar sus valores), siempre con la función `SECURITY DEFINER` `auditoria.suprimir_titular(perfil_id)` de `ps_auditoria_dueno`, que vacía `auditoria_valores` del titular, marca `claves_titular.destruida_en`, borra `clave_envuelta` y escribe la fila `supresion` en la misma transacción (ningún rol de conexión tiene `UPDATE`/`DELETE` sobre `auditoria_valores` ni `UPDATE` sobre `claves_titular`): la cadena sigue verificable porque no depende del valor, y el compromiso deja de ser atacable por diccionario porque su clave ya no existe. Auditoría de entidades sin titular (catálogos, léxico) usa una clave de sistema que no se destruye | H42 · con el valor dentro del hash, anonimizar exige `UPDATE` (bloqueado por rol y trigger) e invalida todos los hashes posteriores y el ancla. Decidido antes de EP-006 para no migrar la cadena después |
| Rol dueño del esquema (`ps_migrador`) dueño también de `auditoria` | **Dueño de `auditoria`, `auditoria_cabeza` y `auditoria_valores`: rol `ps_auditoria_dueno` `NOLOGIN`**, del que ningún rol de conexión es miembro (tampoco `ps_migrador`), **y dueño también del esquema propio `auditoria` que las contiene** (*consolidación, 2.ª pasada*: el dueño de un esquema puede hacer `DROP` de objetos ajenos dentro de él, así que las tablas de auditoría no pueden vivir en un esquema de `ps_duenio`, del que `ps_migrador` es miembro). Ese rol, el esquema, las tres tablas, el trigger y la cabeza génesis los crea el script de roles de ADR-0008 (`packages/infra/bootstrap/roles.sql`, ejecutado a mano con `doadmin`), que también emite sus `GRANT` (*lista normativa, revisión de coherencia*): `USAGE` del esquema y `SELECT` sobre las tres tablas para `ps_panel` y `ps_worker` (verificación y lectura descifrada del panel) y para `ps_exportador`; **ninguna escritura directa**: `EXECUTE` de `auditoria.registrar(...)` para `ps_panel` y `ps_worker` (todo acto auditado, incluidos `sembrar_admin_inicial` y los tramos `restauracion` y `rotacion`) y `EXECUTE` de `auditoria.suprimir_titular(perfil_id)` solo para `ps_panel`; sobre `identidad.claves_titular`, `SELECT` e `INSERT` para `ps_panel` y `ps_worker` (crear la clave de un titular nuevo), sin `UPDATE` ni `DELETE` (la destrucción va solo por `suprimir_titular`, cuyo dueño recibe el `UPDATE` sobre esa tabla); `REVOKE ALL` de `PUBLIC` sobre ambas funciones; `anclas_auditoria` sigue en `operacion`. Los demás esquemas son del grupo `NOLOGIN` `ps_duenio` de ADR-0008, del que `ps_migrador` es miembro (I-5: el `ps_auditoria` y los esquemas propiedad directa de `ps_migrador` que describía ADR-0010 quedan sustituidos). Un cambio de esquema en esas tablas es un procedimiento manual con `doadmin`, dos personas, que abre un tramo nuevo de cadena y lo ancla. La tarea `vigilar` (ADR-0009) comprueba en cada pasada que el trigger tiene `pg_trigger.tgenabled = 'O'`, el dueño y los grants esperados, y alerta si no | H25 · el dueño puede `DISABLE TRIGGER` y hacer `UPDATE`/`DELETE` sin pasar por la cadena |
| Migraciones por el job `migrar` sin límites | Cada migración corre con `SET lock_timeout = '5s'` y `statement_timeout` acotado; si agota el candado, `migrar` reintenta hasta 3 veces con espera y, si no, falla el despliegue sin dejar nada a medias. **Exclusión mutua** entre `migrar` y `exportar_banco` (**candado único, I-7**): ambos toman con `pg_try_advisory_lock` el candado consultivo **de sesión** `mantenimiento_esquema` (los dos van por conexión directa, no por el *pool*, así que el candado de sesión es seguro; la prohibición de candados de sesión de ADR-0008 rige solo para las conexiones por *pool*). **Política única:** `migrar` reintenta la toma durante **como máximo 10 min** (el volcado semanal dura minutos) y después falla con mensaje claro, sin aplicar nada; `exportar_banco` no espera: si el candado está tomado, la corrida falla y el planificador la reintenta a los 15 min (ADR-0009). *Sustituye al texto anterior de esta fila (candado `mantenimiento`, `migrar` falla sin esperar)*. **Las migraciones solo cambian esquema**: los cambios de datos sobre tablas auditadas son un trabajo del worker con `origen = migracion` por la unidad de trabajo. Excepciones enumeradas: fila única de `inventario_version` y catálogos iniciales vacíos. *Consolidación, 2.ª pasada: la siembra de la cabeza génesis sale de esta lista y pasa a `roles.sql` (la tabla es de `ps_auditoria_dueno`), y el primer administrador no es una excepción sino la tarea auditada `sembrar_admin_inicial` del worker (ADR-0002, tabla de la enmienda); los `GRANT` sobre tablas de dueños `NOLOGIN` distintos de `ps_duenio` (auditoría, `eventos`) los emite `roles.sql`, no las migraciones.* Las migraciones viven en **`packages/infra/migraciones`** (ruta fija de ADR-0008) y **CI aplica la regla única de migraciones sin DML** (*revisión de coherencia: esta es su única definición; ADR-0010 y V3-7 la citan*): un analizador del SQL (no un grep de texto) rechaza toda sentencia `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `MERGE` o `COPY … FROM` **de nivel superior** sobre tablas de datos; **no mira el cuerpo de `CREATE FUNCTION`/`CREATE PROCEDURE`** (las funciones de `ps_duenio` como `encolar_*`, `reclamar_propio`, `cerrar_propio`, `guardar_codigo_*`, `purgar_vencidos` o `sembrar_admin_inicial` contienen DML legítimo y se crean en la migración inicial); y solo admite las excepciones enumeradas arriba (fila única de `inventario_version` y catálogos iniciales vacíos), marcadas en la migración y listadas en la configuración del analizador | H25 · un `ALTER TABLE` en cola tras `pg_dump` o una importación larga cuelga portal, panel y worker; una migración de datos sin `AUDIT_HMAC_KEY` rompe el 1:1 de QA-11 |
| `ps_portal` con «lectura de inventario» | **`ps_portal` lee solo vistas**: `operacion.catalogo_publicable` (`security_barrier`, dueño `NOLOGIN`) con lista blanca de columnas (código, familia, roles, tecnologías, sectores, modalidad, país, ciudad, fecha y fecha de actualización de disponibilidad) filtrada por `estado = 'publicado'` **y** consentimiento vigente; `operacion.estado_enlace_perfil` (solo código y estado público `disponible \| colocado \| pausado \| fuera_del_banco`, para RF-19.2); catálogos activos y léxico aprobado; más las tablas de sesión y de «Mi equipo» que fijan ADR-0002 y ADR-0004. `REVOKE ALL` de `ps_portal` sobre `perfiles` y sus hijas, `consentimientos`, `claves_titular`, `artefactos`, `lotes_importacion`, `borradores_evidencia`, `auditoria*` y `anclas_auditoria`. La fecha y la ciudad siguen sin llegar al cliente: las recorta `ProyeccionCatalogo` (zod) como antes | H7 · el filtro en código solo no da defensa en profundidad en lectura; un Server Component nuevo o una consulta mal escrita vuelca el banco |
| Campos del Anexo B.4 en la BD | **No se guardan.** La importación trabaja con una lista blanca de columnas del modelo: una columna B.4 (foto, contacto, CV, motivación/proyección, DISC detallado, promedio, certificaciones) aparece en la vista previa como «ignorada» y nunca entra en `perfiles` ni en `foto_previa`. El panel no tiene campos para ellos | H7 · lo que no está en la BD no se filtra |
| `POST /api/v1/catalogo/ciudades` con `{modalidad_necesidad, obligatorios:{roles[], pais}}` | El cuerpo son los **`Criterios` completos** (esquema zod de `packages/contratos`) y la modalidad de la necesidad. El servidor, sobre `catalogo_publicable` de la sesión, ejecuta `evaluar` de `packages/motor` y devuelve `{codigo, ciudad}` solo de los perfiles que el navegador mostrará (resultados y «lo más cercano»), no remotos, y solo si la necesidad es presencial o híbrida. El portal solo llama cuando la necesidad es presencial o híbrida, con *debounce*; su latencia entra en el gate de QA-1 de ADR-0004 | H14 (y H4 en lo que toca a esta ADR) · con solo rol y país el servidor no reproduce el resultado del navegador y devuelve ciudades de perfiles no visibles; así R-20 sí queda cerrado |
| «Fecha del día» sin zona | **`Reloj.fechaHoy()` devuelve la fecha civil en `America/Bogota`**, y la usan la banda de disponibilidad, el ETag del catálogo, la regla de 30 días (RF-3.13.3/RF-8.14.4) y la coherencia de estado del panel. Nada del dominio usa `new Date()` ni la fecha UTC del contenedor | H41 · los contenedores corren en UTC; de 19:00 a 24:00 de Bogotá la banda y el ETag irían un día adelantados |
| ETag en memoria del portal como ahorro de la carga | El ETag solo ahorra en re-peticiones dentro de la misma pestaña; en carga completa no aplica. La proyección se puede llamar desde el Server Component de la primera carga con el mismo esquema zod, de modo que el bloque curado del enlace llega en el primer HTML (la decisión de camino de carga y su medida de LCP son de ADR-0008/0010) | H31 · parte de esta ADR: la proyección no obliga a un *fetch* cliente adicional |
| `aplicar_importacion` en una transacción «sin techo» | **Contrato del trabajo** (el tipo y su fila de cola los recoge ADR-0009): concurrencia 1; `intentos` máximo 1, **sin reintento automático**; tope de reloj de **5 min**, menor que el arrendamiento de 10 min, así que no hace falta renovarlo: el manejador comprueba el tope entre perfiles y hace `ROLLBACK` si lo agota. Dentro de la transacción: `pg_try_advisory_xact_lock`; `SELECT … FOR UPDATE` del lote y comprobación de `estado = 'calculado'` (un reclamo que lo retome no aplica dos veces); escrituras de perfiles con su `version`; al final, **una sola** subida de `inventario_version` y **una sola** toma de la cabeza de auditoría con inserción en bloque de las filas de auditoría; y `estado = 'aplicado'` del lote **en la misma transacción**. El lote es la fuente de verdad del resultado (el `hecho` del trabajo puede afectar 0 filas por `locked_by` sin consecuencia). Si falla o agota el tope, una transacción corta escribe `abortado` con motivo y el trabajo se cierra sin reintento automático (visible en la bandeja; reintentar es una acción explícita de la persona desde el panel); si el proceso muere, el reclamo que lo retome (tras vencer el arrendamiento de 10 min) lee el lote: si ya está `aplicado` (la transacción confirmó pero el cierre del trabajo no llegó), cierra el trabajo `hecho` sin reaplicar; si no, ve `intentos` agotado y marca el lote `abortado` («interrumpido, no se aplicó nada»). Si el candado consultivo está tomado, el trabajo vuelve a `pendiente` con `proximo_intento = now() + 1 min` sin sumar intento. «Aplicando» en el panel se deriva del trabajo `en_curso`. La reversión sigue el mismo contrato. **Es el contrato único (I-2):** ADR-0009 lo cita; el tope de 30 min con renovación del arrendamiento que describía ADR-0009 queda retirado | H45 · un arrendamiento vencido retomaría la importación a medias; retener la versión global y la auditoría toda la transacción dejaba al panel en 503 |
| Límite de filas «por memoria y tiempo medidos» sin cota | Límite de filas fijado por medición con dos cotas: la transacción cabe en el tope de 5 min y la **retención de la versión global y de la cabeza de auditoría es ≤ 5 s P95** con guardados concurrentes del panel (V3-5). Se publica en la pantalla de importación | H45 · QA-9 y QA-10 vuelven a tener un límite comprobable |
| Recuperabilidad: «exportación JSON/CSV semanal (RF-8.15.9) que no restituye consentimientos» | **El artefacto de recuperación es el `pg_dump` completo cifrado con `age`** que define ADR-0010 (identidad, operación, inventario, auditoría con su cabeza y valores cifrados, y consentimientos; sin los datos de `telemetria.eventos`, que excluye ADR-0006, ni los de las tablas transitorias de identidad que enumera ADR-0010). Ante pérdida de cuenta o región **sí se recuperan los consentimientos y la auditoría** de hasta la última exportación; se pierde lo posterior (hasta 7 días, T-16) y las evidencias de Spaces sin copia fuera de DO. La exportación JSON/CSV de RF-8.15.9 (`GET /exportacion` del panel) sigue existiendo como función de edición en bloque, **no** como respaldo. Verificar la cadena desde el volcado exige `AUDIT_HMAC_KEY` y `AUDIT_KEK`, que no viajan en él | H13 · había dos definiciones incompatibles; rige la de ADR-0010. Sustituye el párrafo «Recuperabilidad» de §3 y la frase «consentimientos incluidos» de §2 y §6 para el caso de la exportación |
| Ancla externa sin regla tras restaurar | **Tramos de cadena.** Rotar `AUDIT_HMAC_KEY` y restaurar (PITR o volcado) abren un tramo nuevo: la primera fila del tramo es un evento `restauracion` (o `rotacion`) con `T`, el `seq` y el hash de cabeza restaurados, y la tarea envía un ancla inmediata. La verificación compara cada tramo con sus anclas del buzón; las anclas con `seq` posterior al punto restaurado se registran como «perdidas por restauración de fecha T», no como manipulación. El worker arranca en pausa tras restaurar (runbook en V10-3) | H23 · parte de esta ADR: sin regla, una cadena legítimamente más corta parece manipulada |
| `origen ∈ {panel, importacion, reversion, sincronizacion, fusion, revocacion}` | Se añaden `migracion`, `restauracion`, `rotacion` y `supresion` (destrucción de la clave de un titular, que queda auditada sin valores) | H25, H23, H42 |

#### Verificaciones de esta ADR

| Id | Qué se verifica | Drivers | Cómo se mide |
|----|-----------------|---------|--------------|
| V3-1 | La cadena no se bifurca con escritores concurrentes | QA-11 | Test de integración contra PostgreSQL 16 real: N = 16 escritores en paralelo (panel, worker, revocación) durante 60 s; la verificación recorre por `seq` y `hash_anterior` sin huecos ni bifurcaciones; se repite con la tabla recién creada. Permisos (*revisión de coherencia*): como `ps_panel` y `ps_worker`, `auditoria.registrar(...)` escribe y avanza la cabeza; `INSERT`, `UPDATE` o `SELECT … FOR UPDATE` directos sobre `auditoria`, `auditoria_cabeza` o `auditoria_valores` → error de permisos; como `ps_portal`, `EXECUTE` de `registrar` → error de permisos |
| V3-2 | `ps_portal` no lee tablas base | QA-5, CON-9 | Test de permisos (amplía V10-10): conectado como `ps_portal`, `SELECT` sobre cada tabla revocada → error de permiso; la vista no devuelve perfiles en borrador, pausados, archivados ni sin consentimiento vigente; se ejecuta también en producción en oscuro junto a V10-10 |
| V3-3 | Anonimizar no rompe la cadena | QA-11, CRN-10 | Test que crea historia de un titular, destruye su clave y comprueba que la verificación completa pasa, que sus valores ya no se descifran y que las anclas previas siguen coincidiendo. Con roles reales (*revisión de coherencia*): como `ps_panel`, `auditoria.suprimir_titular(perfil_id)` vacía los valores, marca `destruida_en` y escribe la fila `supresion`; como `ps_worker` o `ps_portal`, `EXECUTE` de `suprimir_titular` → error de permisos; como `ps_panel` o `ps_worker`, `UPDATE`/`DELETE` directos sobre `auditoria_valores` o `UPDATE` sobre `identidad.claves_titular` → error de permisos, e `INSERT` de una clave nueva en `claves_titular` → pasa |
| V3-4 | Fecha civil de Bogotá | QA-17 | Reloj simulado a las 19:30 de Bogotá (00:30 UTC del día siguiente): banda, ETag y regla de 30 días no cambian hasta las 00:00 de Bogotá |
| V3-5 | Importación acotada sin bloquear el panel | QA-9, QA-10, CRN-15 | Archivo del límite de filas aplicado por el worker mientras un script guarda perfiles desde el panel cada 500 ms: retención de versión global y cabeza ≤ 5 s P95, 0 respuestas 503, transacción dentro del tope de 5 min sin renovar el arrendamiento; matar el worker a mitad → lote `abortado`, 0 filas aplicadas, sin reaplicación; retoma de un trabajo cuyo lote ya está `aplicado` → trabajo `hecho` sin reaplicar (sustituye a V9-6) |
| V3-6 | Ciudades ⊆ resultados visibles | UC-4, CON-10 | Test de contrato con los casos compartidos del motor: para cada caso, los códigos de `/ciudades` están incluidos en los que `evaluar` muestra en el navegador; necesidad remota → lista vacía |
| V3-7 | Migraciones seguras | QA-11, QA-22 | Test: `ALTER TABLE` con una transacción abierta que retiene la tabla → la migración falla a los 5 s sin encolar lecturas; `migrar` con `exportar_banco` reteniendo `mantenimiento_esquema` → espera y aplica al liberarse; retenido más de 10 min → falla con mensaje sin aplicar nada; `exportar_banco` con el candado tomado por `migrar` → falla y se reprograma; la regla de migraciones sin DML de la fila «Migraciones» de esta revisión: una migración con `UPDATE` de nivel superior sobre una tabla de datos → CI la rechaza; una migración que crea una función con `INSERT`/`UPDATE`/`DELETE` en su cuerpo → pasa; la siembra de `inventario_version` marcada como excepción → pasa; trigger deshabilitado a mano en staging → `vigilar` alerta; como `ps_migrador`, `DROP TABLE`, `ALTER TABLE` o `DROP SCHEMA` sobre `auditoria.*` y `telemetria.eventos` → error de permisos (se repite en V10-10) |

#### Veredictos que cambian en §5 (tras esta revisión)

UC-4 pasa a ✅ (V3-6; ya no hay superconjunto de ciudades). QA-5 ✅ reforzado con V3-2. QA-11 ⚠️
hasta V10-10 en producción en oscuro, V3-1 y V3-7. QA-17 ✅ con V3-4. QA-9 y QA-10 ⚠️ hasta V3-5 en
DO. QA-12 ⚠️ hasta V10-3 (ahora con consentimientos y auditoría en el volcado) y hasta resolver la
custodia de claves (abajo). CRN-10 ⚠️: la técnica de supresión está decidida; los plazos, no.

#### Consecuencias añadidas (§6)

- **Positivas:** la auditoría admite la supresión sin romper la cadena; el portal no puede leer
  inventario no publicable aunque su código falle; el volcado semanal recupera consentimientos; la
  importación no deja al panel en 503 ni se aplica dos veces.
- **Negativas:** un secreto más (`AUDIT_KEK`) y una tabla de claves por titular; los valores de la
  auditoría ya no se leen con un `SELECT` directo (el panel los descifra); los cambios de esquema de
  la auditoría son manuales y a dos personas.
- **Riesgos nuevos (a numerar en el backlog):**
  - Pérdida de `AUDIT_KEK` o de `claves_titular` sin copia: los valores de la auditoría quedan
    ilegibles (la cadena sigue verificable). Mitigación: misma custodia que `AUDIT_HMAC_KEY`.
  - El volcado completo en Drive contiene identidad y datos de profesionales (la telemetría atribuida
    queda fuera: ADR-0006 excluye los datos de `eventos`): amplía el perímetro de Ley 1581 fuera del
    proveedor.
  - Un campo libre del modelo (p. ej. trayectoria) puede recibir texto B.4 pegado por error (un
    teléfono, un correo). Mitigación: la vista previa de importación y el panel marcan patrones de
    contacto como error de validación.
- **Trade-off de negocio pendiente: custodia de secretos fuera de DO (H24).** Técnicamente se exige una
  copia cifrada de los secretos de la **lista normativa de ADR-0010 §3.5** (entre ellos `AUDIT_HMAC_KEY`
  y `AUDIT_KEK`, que esta ADR introduce; *consolidación, 2.ª pasada: se cita la lista en vez de
  repetirla, porque la copia anterior omitía la llave de cuenta de Mailgun*), fuera del proveedor, con al menos dos custodios,
  y cada rotación registrada con su tramo. Falta decidir **quién custodia y dónde** (gestor corporativo
  o caja fuerte). Sin eso, V10-3 no puede verificar la cadena desde el volcado.
- **Trade-off de negocio pendiente: retención del volcado en Google Drive (H13, Ley 1581).** Cuántas
  copias semanales se conservan y quién tiene acceso a la carpeta.
- **Trade-off de negocio pendiente: fin de la retención de la auditoría de un perfil (H42, T-6).**
  Propuesta técnica: a los 5 años de `archivado` (o de la revocación del consentimiento) se destruye
  la clave del titular y quedan solo metadatos y compromisos; la validación legal del plazo y de si
  basta con esa supresión sigue abierta.
- **Trade-off de negocio pendiente: destinatario del ancla** (ya abierto en §6): su conservación debe
  cubrir también las anclas de cada tramo nuevo.
