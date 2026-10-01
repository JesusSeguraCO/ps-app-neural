# Design

## Context

Ver `proposal.md` (Why). EP-001 dejó construido y archivado el caparazón: portal y panel (Next.js 15.5+, TypeScript), worker Node, PostgreSQL 16 con los roles `ps_portal`/`ps_panel`/`ps_worker`/`ps_migrador`, cola `operacion.trabajos`, sesión del panel de una jornada con matriz de permisos y V2-3, auditoría encadenada (`auditoria.registrar(...)`, `packages/infra/src/postgres/auditoria.ts`) y un **modelo mínimo de perfil publicable** (migración `0005_inventario_minimo`): catálogos con `activo` y `fusionado_en_id`, `perfiles` con `version` y disparadores, hijas de roles/tecnologías/sectores, `consentimientos` con un vigente por perfil, disparador que impide publicar sin consentimiento y las vistas `catalogo_publicable`, `estado_enlace_perfil`, `estado_seleccion_perfil` y `taxonomia_banco`. Los perfiles de hoy son ficticios sembrados.

Las decisiones de arquitectura ya están aceptadas; este diseño **no las repite, las aplica**:

- **ADR-0002**: sesión del panel (12 h, 60 min de inactividad), respuesta idéntica para no inscritos, envoltorios `conSesionPanel`/`conCsrf`/`conAutorizacion`, matriz rol × acción.
- **ADR-0003**: máquina de estados como única vía de escritura; `version` + `If-Match` (409); `inventario_version` global; auditoría por campo con `origen` tipado, compromiso de valor y clave por titular (`claves_titular`); importación en dos fases con foto previa y reversión del último lote; catálogos sin borrado y fusión transaccional; léxico con FK; evidencia privada; migraciones sin DML (V3-7).
- **ADR-0006/0009**: cola con `FOR UPDATE SKIP LOCKED`; `aplicar_importacion` y `revertir_importacion` (concurrencia 1, 1 intento, tope 5 min; contrato I-2 de ADR-0003); `proponer_lexico` semanal con Gemini por `fetch` y `AbortSignal.timeout(6 s)`; V9-8; `notificar` para avisos por correo.
- **ADR-0008/0010**: stack y roles; DO Spaces privado con URL prefirmadas de PUT y GET de 5 min solo desde el panel, CSP del panel con el origen del bucket; secretos `SPACES_KEY`/`SPACES_SECRET`, `GEMINI_API_KEY`, `AUDIT_HMAC_KEY`, `AUDIT_KEK` como `SECRET` por componente.
- **Decisiones del sponsor D1–D19** (`.claude/state/evidencia/ep-006/decisiones-sponsor-2026-09-30.md`) y **PRD v4.15** (enmiendas de RF-8.10, RF-8.11 y RF-8.13.1).

## Goals / Non-Goals

**Goals:**
- Toda regla del inventario (máquina de estados, guardas de publicación, matriz D5, semántica de importación, parecidos de catálogo, umbrales de 30/60/7 días, contenido del lote a Gemini) vive en `packages/dominio` como funciones puras y deterministas, con `Reloj.fechaHoy()` en `America/Bogota`, testeables sin red.
- Una sola vía de escritura del perfil (`ServicioPerfiles` sobre una unidad de trabajo) para panel, importación, reversión, fusión, colocados y revocación: cada vía hereda las guardas, la versión, `inventario_version` y la auditoría.
- Cada sub-slice cierra con su parte del `wiring_checklist` en `passing`, `journey_smoke` verde y fidelidad visual observada contra sus pantallas aprobadas.

**Non-Goals:**
- Demanda y cobertura en la consulta del observador (EP-010, D14); el registro real de consultas sin coincidencia (HU-078, EP-010): hasta entonces HU-139 se valida con consultas sintéticas.
- Lectura automática del artefacto (D11; HU-149 descartada): ninguna librería de PDF/Word.
- Integración automática con el sistema de asignación (D8): la carga de Operaciones es manual.
- Datos reales en producción mientras rija el bloqueo de solo datos ficticios.

## Decisions

### 1. Modelo de datos del inventario (migraciones 0013 en adelante, sobre la 0005)

Solo cambios de esquema, hacia adelante (expand/contract); los datos de tablas auditadas se mueven con trabajos del worker con `origen = migracion` (V3-7). Sin `DELETE` para ningún rol sobre inventario (CON-11).

| Tabla / cambio | Contenido | Historias |
|---|---|---|
| `catalogo_modalidades_prueba` (nueva) | `familia_id`, `nombre`, `texto_cliente` (qué exige/evalúa/entrega, NOT NULL, RF-8.16.8), `enunciado_reto`, `entregables`, `criterios` (plantilla de HU-140), `activo`, `fusionado_en_id` | 089, 125, 128, 130, 140, 143 |
| `catalogo_*` | índice único sobre la forma normalizada (`lower(unaccent)` calculada en la aplicación y guardada en `nombre_normal`) para impedir el idéntico salvo mayúsculas/acentos; `nombre_normal` único por catálogo | 089 |
| `perfiles` | + `modalidad_prueba_id`, `capacidad`, `anclaje`, `resumen`, `vinculo` (vinculado · banco no vinculado · fábrica), `formacion`, `idiomas`, `archivado_en`, `pausado_en`, `origen_creacion`; los campos del Anexo B.2/B.7/B.8.6 sin ninguna columna B.4 | 125, 126, 129, 133, 135 |
| `perfil_experiencias`, `perfil_sello_personal` (nuevas) | experiencia con `cliente_nombrado` separado del texto; tres competencias del Sello Personal | 127 (parcial), 129 |
| `consentimientos` | + `nominal` (el anonimizado no se registra como nominal), `incluye_clientes`, `registrado_por`; revocar = `vigente=false` + `revocado_en` | 127, 128 |
| Estado `colocado` | **se retira del CHECK de `perfiles.estado`** (RF-8.3: cuatro estados; RF-8.13.2: el colocado sigue publicado). Expand: tabla `colocaciones`; contract: migración que reescribe el CHECK y las vistas `estado_enlace_perfil`/`estado_seleccion_perfil`, que derivan `colocado` de una colocación vigente del perfil publicado. `catalogo_publicable` pasa a incluir a los colocados con su banda (HU-137, edge) | 137 |
| `colocaciones` (nueva) | `perfil_id`, `cuenta`, `inicio`, `liberacion` NOT NULL, `fuente` (`panel`·`operaciones`), `carga_id`, `registrado_por`, `vigente` | 137, 150 |
| `cargas_operaciones` (nueva) | `cargado_por`, `cargado_en` (= fecha de corte, D16), formato, filas válidas/erróneas, columnas ignoradas; `diferencias_operaciones` con los dos valores y la decisión | 150 |
| `validaciones` (nueva) | por perfil: `modalidad_prueba_id`, `fecha`, `resultado` (escrito por persona), `enunciado_reto`, `entregables`, `criterios` con `origen` por campo (`plantilla`·`persona`), `confirmada_por`, `confirmada_en` | 130, 140 |
| `borradores_evidencia` | la de ADR-0003 sin columnas de extracción (D11): `perfil_id`, `modalidad_prueba_id`, campos precargados, estado `borrador`·`confirmado`·`descartado` | 140 |
| `artefactos` (nueva) | `validacion_id`, `perfil_id`, `tipo` (`documento`·`transcripcion`·`repositorio`), `clave_objeto` (Spaces) o `url_repositorio`, `hash_sha256`, `tamano` ≤ 64 MB, `mime`, `subido_por`; `ps_portal` sin privilegio alguno | 131 |
| `inventario_version` (nueva, fila única) | sube en la misma transacción que toda escritura visible al cliente | todas |
| `lotes_importacion`, `lote_filas` (nuevas) | contrato de ADR-0003: `archivo_hash`, `modo`, `estado` (`calculado`·`aplicando`·`aplicado`·`abortado`·`revertido`), `foto_previa` por perfil, filas con su formato original y motivo | 086, 087, 141, 142 |
| `plantillas_emparejamiento` (nueva) | `nombre` único, `columnas → campo | no_importar` | 148 |
| `lexico`, `propuestas_lexico`, `candidatas_lexico` (nuevas) | término normalizado → `catalogo_tipo` + `catalogo_id` (FK real por tipo); propuesta `pendiente`·`aprobada`·`rechazada`; candidatas con destino `lexico`·`agenda_reclutamiento`. `ps_portal` lee solo `lexico` aprobado por vista | 139 |
| `configuracion_contacto` (nueva, fila única) | `correo` (CHECK `@trycore.com`), `nombre`, `cargo`; vista `operacion.contacto_trycore` legible por `ps_portal`; valor inicial `people.service@trycore.com` como excepción de siembra marcada | 147 |
| `identidad_panel.usuarios_panel` | + `dado_de_baja_en`, `actualizado_por`; baja = `activo=false` (sin borrado); `sesiones_panel` gana `rol_al_abrir` para el corte (decisión 9) | 151 |

### 2. Máquina de estados del perfil y matriz D5

`packages/dominio/inventario/estados.ts`: estados `borrador · publicado · pausado · archivado`; transiciones `crear → borrador` (panel e importación, siempre), `borrador → publicado` y `pausado → publicado` con guardas, `publicado → pausado` (exige motivo del catálogo), `* → archivado` (idempotente: si ya lo está, informa sin escribir), `publicado → borrador` (revocación de consentimiento o respuesta «paso a borrador» de D1). Guardas de publicar, evaluadas juntas y devueltas como lista de motivos: consentimiento nominal vigente (RF-8.4), modalidad de prueba elegida y activa de la familia del rol (D10), familia con al menos una modalidad (RF-8.16.4), atributos obligatorios completos, sin incoherencia ALTA. El disparador de la 0005 se mantiene como defensa en profundidad y se amplía a la modalidad.

La disponibilidad se clasifica con `Reloj.fechaHoy()`: `ninguna` (sin fecha), `ahora` (fecha ≤ hoy), `con_fecha` (fecha > hoy). Matriz `evaluarCoherencia(estado, colocadoVigente, disponibilidad, actualizadaEn)` → `{severidad: ALTA|MEDIA|null, contradiccion}` exactamente con las filas de D5 (corregida: colocado con fecha es coherente) más la regla RF-8.14.4 (vencida y > 30 días sin tocar → «Disponibilidad por confirmar», que ya calcula `bandaDeDisponibilidad`). Se usa en el listado, al publicar, en la bandeja y en la vista previa de importación. Tabla de verdad exhaustiva como test (estado × colocado × disponibilidad × antigüedad).

Edición de un publicado (D1, HU-126): `PATCH /api/v1/perfiles/{codigo}` con `If-Match` en dos pasos —`?previsualizar` devuelve el diff de cara al cliente sin escribir; confirmar aplica—. Si las guardas de publicar dejan de cumplirse, la respuesta es 409 `deja_incompleto` con la pregunta; el cliente reenvía con `resolucion=descartar` (nada se escribe ni se audita) o `resolucion=a_borrador` (cambio + transición en una transacción, auditada con motivo). La vista previa (HU-129) renderiza el mismo componente de ficha que el portal (`packages/ui`) con la proyección de `ProyeccionCatalogo` aplicada al estado en edición: una sola implementación, no una copia.

### 3. Importación masiva (docs/10-specs/importacion-masiva.md, ADR-0003 I-2)

- **Formato único** (D2, exportar primero): `packages/contratos/importacion` define columnas, encabezados, separador `;` de listas, marca de campos internos y el literal `[vaciar]`; exportación (CSV y JSON), plantilla de tres ejemplos e importación lo comparten, de modo que la ida y vuelta (exportar → reimportar sin tocar → todo «sin cambios») es un test.
- **Detección**: `[`/`{` → JSON; tabuladores en la primera línea → TSV; comas con comillas balanceadas → CSV; ambiguo → pregunta. Parser propio (sin librería nueva), con límite de filas publicado en la pantalla.
- **Emparejamiento** por nombre normalizado, corregible, guardable (HU-148); columnas fuera del modelo o B.4 → «ignorada» e informada, nunca a `perfiles` ni a `foto_previa`.
- **Plan sin escritura** (`POST /api/v1/importacion/lotes` → `calcularPlan`, función pura): grupos nuevos/actualizados/archivados/sin cambios/omitidos/con error; diff por campo; duplicados de código → error de ambas filas y bloqueo; valores nuevos de taxonomía con conteo; `consentimiento`, `resultadoValidacion` y `estado: publicado` rechazados por campo; incoherencias D5 evaluadas en la vista previa; exclusiones por tarjeta.
- **Aplicar** (`POST …/lotes/{id}/aplicar` → 202 y trabajo `aplicar_importacion`): una transacción con `pg_try_advisory_xact_lock`, revalidación de `version`, fusión ausente/vacío/nulo, nuevos a borrador, una sola subida de `inventario_version` y una sola toma de la cabeza de auditoría (`origen = importacion`, actor = quien confirmó, referencia al lote); el panel consulta `GET …/lotes/{id}`. Idempotente: reimportar lo corregido actualiza por código sin duplicar (HU-142).
- **Revertir** (`revertir_importacion`, mismo contrato): solo el último lote `aplicado`; restaura `foto_previa`, archiva los creados; los perfiles con `version` posterior al lote se listan y la persona elige incluirlos o dejarlos (HU-087); la reversión es un evento propio en la auditoría (`origen = reversion`).
- **Errores**: `GET …/lotes/{id}/errores` devuelve las filas con error en su formato original y con su motivo; distingue archivo entero de filas.

### 4. Evidencia en Spaces privado (D11, D18; ADR-0010)

Subida: `POST /api/v1/perfiles/{codigo}/artefactos` valida tipo (documento, transcripción en texto o URL de repositorio; video rechazado por MIME y extensión) y tamaño ≤ 64 MB, crea la fila y devuelve una URL prefirmada de PUT de 5 min con tamaño y tipo fijados; el navegador del panel sube directo; `…/confirmar` verifica el objeto (`HeadObject`: tamaño y hash) antes de asociarlo. Descarga: `GET /api/v1/artefactos/{id}` exige acción `descargar_evidencia` (solo administrador de inventario en la matriz) y responde con una URL prefirmada de GET de 5 min; el observador recibe 403 con el motivo y la ficha del panel muestra «existe» sin enlace. El portal no tiene ruta ni credencial hacia Spaces: la lista positiva de rutas del portal no incluye nada de artefactos y un test pide la ruta del panel con cookie del portal. Nada del artefacto se lee ni viaja fuera (RF-8.11.3). Adaptador en `packages/infra/spaces` con `@aws-sdk/client-s3` y `@aws-sdk/s3-request-presigner` (ya permitidos) y un doble en CI; bucket y CORS por entorno.

### 5. Borrador del reporte (HU-140, D19)

`borradorDesdeModalidad(modalidad)` en el dominio: copia enunciado, entregables y criterios de la modalidad elegida marcando `origen = plantilla`; sin modalidad → error tipado que el panel traduce en «el borrador sale de la modalidad» y redirige al selector. No necesita artefacto. Confirmar escribe la `validacion` (campos editados con `origen = persona`), audita y enriquece la ficha sin republicar (HU-130); descartar marca el borrador `descartado` sin tocar la ficha. Fecha y resultado los escribe la persona; ningún modelo interviene.

### 6. Catálogos, parecidos y fusión (HU-089, HU-143)

Parecidos deterministas en `dominio/catalogo/parecidos.ts`: normalización (minúsculas, sin acentos, espacios), igualdad normalizada → bloqueo con el nombre existente; distancia de edición de Damerau-Levenshtein ≤ 2 (umbral ajustable por longitud, abierto por la historia) o contención → «parecido», con confirmación explícita para crear. Desactivar cuenta referencias antes. Fusión: `POST /api/v1/catalogos/{tipo}/{id}/fusionar` con `?previsualizar` (conteo) y confirmación; transacción que reasigna en las hijas (sin duplicar la PK compuesta), sube `version` de cada perfil afectado e `inventario_version`, deja `activo=false` y `fusionado_en_id`, y audita con `origen = fusion`; rechaza mismo valor o distinto catálogo con motivo. La vista `taxonomia_banco` sigue mostrando solo activos.

### 7. Léxico y worker `proponer_lexico` (HU-139; ADR-0004 enmienda, ADR-0009)

Equivalencias por `POST /api/v1/lexico` con FK al catálogo del tipo (inexistente → 422 con los valores ofrecidos); el intérprete del portal lee el léxico aprobado por vista en cada carga (sin despliegue; entra en `inventario_version`). `proponer_lexico` (planificador semanal del worker): toma las consultas sin coincidencia del período, **quita** las de sesiones con `modelo_permitido = false` y las que contienen nombres o apellidos de perfiles (diccionario leído en la misma corrida, V9-8), y envía a Gemini por `fetch` server-side con `GEMINI_API_KEY` (token personal y solo datos ficticios en desarrollo; llave de negocio en producción) solo el texto de consulta y la taxonomía, con timeout de 6 s y esquema zod estricto para la respuesta; resultado → `propuestas_lexico` pendientes. Aprobar (con o sin edición) inserta en `lexico`; rechazar marca `rechazada` y el término no vuelve a proponerse. Candidatas: consultas sin coincidencia con dos salidas; hasta EP-010 se siembran sintéticas en local, CI y staging (bloqueado en producción). Doble de Gemini declarado en CI; sin SDK (prohibido por la allowlist).

### 8. Auditoría encadenada (HU-138; ADR-0003)

Toda escritura del inventario pasa por la unidad de trabajo que llama a `auditoria.registrar(...)` en la misma transacción: una fila por campo, `origen ∈ {panel, importacion, reversion, sincronizacion, fusion, revocacion, migracion}` (la carga de Operaciones usa `sincronizacion` con referencia a la carga y su fecha de corte), valores cifrados con la clave del titular (`claves_titular`) y compromiso HMAC; entidades sin titular (catálogos, léxico, contacto, usuarios del panel) con la clave de sistema. `GET /api/v1/perfiles/{codigo}/auditoria` descifra en el panel para ambos roles; enlaza al lote o a la carga. Una petición con sesión vencida no llega a la unidad de trabajo (`conSesionPanel` → 401 y redirección), así que no hay cambio sin autor. Descartar en D1 no escribe nada. Los rechazos por rol se registran como evento `acceso_rechazado` (HU-124), sin fila de cambio en el recurso. Verificaciones V3-1 y V3-3 entran con el primer sub-slice que escribe perfiles.

### 9. Permisos por rol, observador y HU-151 (accesos y corte de sesión)

`MatrizPermisos` (EP-001) gana las acciones de EP-006: `catalogo.escribir`, `lexico.escribir`, `perfil.escribir`, `perfil.publicar`, `consentimiento.registrar`, `disponibilidad.cambiar`, `importacion.ejecutar`, `evidencia.subir`, `evidencia.descargar`, `colocado.registrar`, `operaciones.cargar`, `contacto.escribir`, `accesos.administrar` —solo administrador— y `inventario.leer`, `enlaces.leer`, `colocados.leer`, `auditoria.leer`, `contacto.leer` para ambos. Las páginas del panel ocultan los controles según el rol (HU-124) y cada endpoint declara su acción (V2-3 extendido a todas): el observador recibe 403 con «tu rol es de consulta», el intento se audita y el aviso a la administradora usa el trabajo `notificar` con el código del perfil.

Accesos (HU-151): `POST/PATCH /api/v1/accesos` con correo validado `@trycore.com` (además del CHECK de la tabla), `correo_hmac` para la unicidad, baja lógica. Invariante «al menos un administrador activo» en el dominio y en una función de BD con bloqueo de fila sobre los administradores activos, para que dos bajas concurrentes no dejen el panel vacío. **Corte de sesión (D17):** `conSesionPanel` relee en cada petición `usuarios_panel.activo` y `rol` junto con la sesión (misma consulta, sin coste extra) y, si el usuario está inactivo o su rol actual es menor que `rol_al_abrir`, borra la sesión y redirige a `/acceso`; subir de observador a administrador no corta (la sesión solo gana permisos en la siguiente entrada). El correo dado de baja recibe la respuesta idéntica existente y no se le encola código.

### 10. Contacto de Trycore (HU-147)

Fila única `configuracion_contacto`, editable con `contacto.escribir` y auditada; el portal lo lee en el servidor por la vista `operacion.contacto_trycore` en cada carga de las cinco pantallas de contacto y un único componente `ContactoTrycore` compone «Nombre, Cargo: correo» o «escribe a People Service: correo» si faltan nombre y cargo. Reemplaza la constante `CONTACTO` de `apps/portal/src/acceso/Pantallas.tsx` (desviación temporal de EP-001 que aquí se cierra). Un nombre sin cargo o un cargo sin nombre se muestran sin separadores huérfanos.

### 11. Colocados (HU-137, HU-150; D8, D12, D15, D16)

Registrar un colocado es una operación del `ServicioPerfiles` que crea la `colocacion` (fuente `panel`) y fija `disponibilidad_fecha = liberacion` y `disponibilidad_actualizada_en = now()` en la misma transacción (sin fecha de liberación → 422 sin escribir). La carga de Operaciones (`POST /api/v1/colocados/cargas`, síncrona: decenas de filas) acepta solo JSON o CSV (otro formato → rechazo entero), exige las cuatro columnas mínimas, ignora e informa el resto, aplica solo filas válidas y devuelve las erróneas con número y motivo; si el código ya tiene una colocación del panel con otros datos, **gana el panel** y la fila queda en `diferencias_operaciones` para aceptar o descartar; `fecha de corte = cargado_en`; «dato desincronizado» si `hoy − cargado_en > 7 días` (función pura; 7 → no, 8 → sí). La tarea diaria `sincronizar_colocados` de ADR-0009 no se construye (D8: sin integración automática en v1) y se registra como enmienda.

### 12. Pantallas y fidelidad

Las 66 pantallas de EP-006 aprobadas en `docs/05-prototipo/manifest.json` (33f671c), con tokens y componentes de `packages/ui`; el menú del panel habilita sus destinos a medida que cada sub-slice los entrega (hoy deshabilitados). Fidelidad verificada con captura real (MCP chrome-devtools) en la fase smoke de cada sub-slice; toda desviación se registra aquí con su razón y la aprobación del sponsor. No se generan pantallas sin aprobación humana.

**Desviaciones del sub-slice 1** (evidencia `.claude/state/evidencia/ep-006/ss1/fidelidad-ss1.md`; pendientes del visto bueno del sponsor):
- Alta/edición de modalidad de prueba sin pantalla en el prototipo: hoja PP:hoja con nombre, familia, texto de cara al cliente (obligatorio, RF-8.16.8), reto, entregables y criterios (plantilla de HU-140).
- Menú emergente «Más acciones» por fila (Editar, Desactivar, Fusionar / Reactivar): el prototipo solo dibuja el botón; en móvil es la única vía a Editar.
- Hoja de fusión con «Elegir otros valores» para cambiar el par antes de ver el impacto.
- Aviso tras guardar un término sin «Deshacer»: ninguna HU lo pide; se corrige con «Editar».
- El reconocimiento de candidatas usa el intérprete determinista mínimo (catálogo + léxico); textos como «Reconoció «ingeniero»» del prototipo dependen del intérprete de EP-009.
- Paginación de 25 (catálogos) y 20 (léxico) filas; grupos de tecnología como lista fija del dominio.

## Sub-slices (orden del DoR, `dor-pass.md`)

Uno por vez; cada uno cierra con su parte del `wiring_checklist` en `passing`, `journey_smoke` verde y checkpoint en el hub.

| # | Historias | Entrega | Migraciones / piezas nuevas |
|---|---|---|---|
| 1 | HU-089, HU-143, HU-139 | Catálogos (alta sin duplicados, modalidades de prueba con texto, desactivar, fusionar) y léxico con `proponer_lexico` | `catalogo_modalidades_prueba`, `nombre_normal`, `inventario_version`, `lexico`/`propuestas_lexico`/`candidatas_lexico`; unidad de trabajo + auditoría del inventario; adaptador Gemini + doble |
| 2 | HU-125, HU-127 | Crear perfil en borrador desde el catálogo y registrar/revocar consentimiento nominal | columnas del perfil (Anexo B), experiencias y sello, `consentimientos` ampliada; `ServicioPerfiles`; claves de titular |
| 3 | HU-088, HU-086, HU-148 | Plantilla y exportación; pegar, detectar, emparejar y vista previa; plantillas de emparejamiento | contrato `packages/contratos/importacion`; `lotes_importacion` (solo `calculado`), `plantillas_emparejamiento` |
| 4 | HU-141, HU-087, HU-142 | Confirmar por modo con fusión, revertir el último lote, descargar filas con error | trabajos `aplicar_importacion`/`revertir_importacion` en el worker; `foto_previa`; V3-5 |
| 5 | HU-128, HU-129, HU-130 | Guardas de publicación (incluida masiva), vista previa fiel, Nivel 0 | disparador ampliado a modalidad; componente de ficha compartido panel/portal |
| 6 | HU-126, HU-131, HU-140 | Editar publicado con impacto y pregunta D1; evidencia en Spaces; borrador desde la modalidad | `validaciones`, `artefactos`, `borradores_evidencia`; adaptador Spaces + doble; CSP del panel con el bucket |
| 7 | HU-132, HU-136, HU-133 | Disponibilidad en dos clics y en bloque; bandeja de vigencia; pausa con motivo | `pausado_en`; consultas de la bandeja |
| 8 | HU-134, HU-135 | Matriz D5 en fila, al publicar y en importación; archivar | `archivado_en`; tabla de verdad de coherencia |
| 9 | HU-137, HU-150, HU-124 | Colocados en el panel, carga de Operaciones, consulta del observador | `colocaciones`, `cargas_operaciones`, `diferencias_operaciones`; contract del estado `colocado` y vistas; matriz completa del observador |
| 10 | HU-151, HU-147, HU-138 | Accesos con corte de sesión; contacto de Trycore; consulta de auditoría | `usuarios_panel` ampliada, `rol_al_abrir`; `configuracion_contacto`; vista de auditoría descifrada |

HU-138 va al final porque consulta lo que todas las anteriores escriben, pero la **escritura** auditada existe desde el sub-slice 1 (cada sub-slice verifica que sus escrituras dejan fila y autor).

## Risks / Trade-offs

- [EP-006 es la épica más grande después del caparazón: 28 HU, 10 sub-slices] → uno por vez, `journey_smoke` verde entre cada uno, checkpoint en el hub; `files_scope` de inventario y panel, nunca en paralelo con otra épica que toque `inventario`.
- [Retirar el estado `colocado` toca vistas que EP-001 consume (aterrizaje, enlaces)] → expand/contract en el sub-slice 9 con los tests de `aterrizaje-curado` y `generacion-enlaces` como regresión; el aterrizaje sigue mostrando al colocado aparte con su fecha de liberación y el banco pasa a mostrarlo con su banda (RF-8.13.2). Contradicción residual a vigilar: `estado_enlace_perfil` hoy trata colocado como no publicado.
- [Corte de sesión por petición (D17)] → relectura de `usuarios_panel` en la misma consulta de la sesión; test de carrera baja ↔ petición en curso (la petición en curso termina; la siguiente se corta).
- [Invariante de «al menos un administrador» con dos bajas concurrentes] → bloqueo de fila sobre los administradores activos en la transacción; test concurrente.
- [Gemini: datos de perfiles en el lote] → filtro determinista previo, V9-8 con el doble, esquema estricto de la respuesta; ante fallo o timeout la corrida no propone nada (sin reintento agresivo).
- [Spaces solo con doble en CI] → la subida y descarga reales se prueban en staging y en el Release Gate (integración con dependencias reales); V10 de subida de 60 MB en staging.
- [Límite de filas de importación sin medir en DO] → se mide con V3-5 en el sub-slice 4 y se publica en la pantalla; hasta medir, 200 filas.
- [Umbral de parecido abierto por HU-089] → Damerau-Levenshtein ≤ 2 con ajuste por longitud y contención; se valida con los casos de la historia («Fgima», «figma», «Fig»).
- [Contacto de una persona empleada visible a clientes (Ley 1581)] → solo por decisión explícita de quien lo configura, auditada; finalidad a revisar en el Release Gate (seguridad).
- [Artefactos que identifican al profesional] → bucket privado, sin ACL pública, URL de 5 min, solo administrador; retención (CRN-10) pendiente de decisión de negocio.
- [Consultas sin coincidencia sintéticas hasta EP-010] → declarado en el PR; la conexión con el registro real se verifica cuando EP-009/EP-010 existan.

## Migration Plan

Migraciones 0013 en adelante, una o más por sub-slice, hacia adelante y sin DML de nivel superior (excepciones enumeradas: fila única de `inventario_version` y de `configuracion_contacto`, catálogos iniciales vacíos). La reescritura de `estado = 'colocado'` de los perfiles ficticios a `publicado` + `colocacion` es un trabajo del worker con `origen = migracion` antes del contract. Rollback de un sub-slice = revertir su PR; en local y CI la base se recrea desde cero; en staging, la siembra ficticia se vuelve a correr.

## Open Questions

- Umbral exacto de parecido y forma del aviso (HU-089 los deja abiertos; se fija en TDD con los casos de la historia).
- Cadencia exacta de `proponer_lexico` (semanal por ADR-0009) y tamaño máximo del lote a Gemini.
- Límite de filas por importación (a medir, V3-5).
- Plazos de retención de artefactos y consentimientos revocados (CRN-10, trade-off de negocio abierto).
