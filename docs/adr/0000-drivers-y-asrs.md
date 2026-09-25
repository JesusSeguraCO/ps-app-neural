---
id: 0000
title: "Catálogo de Drivers Arquitectónicos y ASRs (entrada del método ADD)"
date: 2026-09-25
status: living-document
authors:
  - setup-architecture (/build:architect) — propuesta para revisión de Jesús Segura
tags:
  - add
  - drivers
  - asr
  - quality-attributes
---

# ADR 0000 — Drivers Arquitectónicos y ASRs

> **Naturaleza:** No es un ADR de decisión, sino la **entrada de diseño** (Paso 1 del método ADD de Len
> Bass). Consolida propósito, requisitos funcionales primarios, escenarios de atributos de calidad
> priorizados, restricciones y concerns. Toda decisión en un ADR (0001+) debe trazar a uno o más drivers
> de este catálogo, y todo driver debe estar cubierto por al menos un ADR (ver
> [_backlog-arquitectonico.md](_backlog-arquitectonico.md)).
>
> **Cómo se genera:** la skill `setup-architecture` (`/build:architect`) lo **propone** leyendo `docs/`
> (PRD v4.11 + user story map + `03-backlog/epicas.md` + `04-historias/HU-*.md` + `10-specs/` +
> `01-prd/requisitos-tecnicos-hosting.md`) — de solo lectura. Este es un **documento vivo**: cada
> re-corrida añade drivers nuevos que surjan de HUs/épicas nuevas.
>
> **Iteración 8 (2026-09-25):** el sponsor cambió la plataforma después de aceptar 0001–0007. Las
> restricciones de hosting (CON-1, 2, 3, 5, 7, 15, 16) quedan marcadas como reemplazadas por CON-18..22,
> que salen de esa decisión, recogida en el PRD v4.12 (D-23 revisada, §8.3 reescrita).
>
> Las medidas marcadas *a validar* las propone la capa de arquitectura porque el PRD no las fija; se
> confirman en la revisión única o quedan como riesgo abierto.

## Cómo se usa este documento en ADD

- **Paso 1 — Review Inputs:** todo lo de este documento.
- **Paso 2 — Establish Iteration Goal:** cada iteración selecciona un subconjunto priorizado de estos
  drivers (ver §6 Plan de iteraciones).

## Propósito de diseño

**Greenfield.** Portal privado B2B de perfiles de talento curados, con dos caras: la del **cliente**
(llega por un enlace curado, se identifica con un correo invitado, busca, arma un equipo y envía una
solicitud que termina como oportunidad en HubSpot) y la de **Talento Humano** (panel que mantiene el
inventario, los consentimientos, los catálogos y los enlaces). Diseño **top-down desde el sistema
completo**: la primera ronda fija estilo, stack y plataforma; las siguientes refinan acceso, datos,
búsqueda, integraciones, telemetría y despliegue.

Fuente: [docs/01-prd/portal-people-service.md](../01-prd/portal-people-service.md) §1–§3, §8.3, D-23.

## 1. Objetivos de negocio (OE)

| ID | Objetivo | Métrica / Meta |
|----|----------|----------------|
| OE-01 | Crecer los equipos dentro de cuentas activas (O1) | Perfiles adicionales colocados en cuentas que recibieron el correo. Línea base y meta: **TODO del PRD** (§11) |
| OE-02 | Convertir la curaduría en intención registrada (O2) | Solicitudes / cuentas que abrieron el portal ≥ 20 %; conversión visita → solicitud ≥ 20 % mensual |
| OE-03 | Acortar el arranque comercial (O3) | ≤ 3 días hábiles de solicitud a alineación agendada; medible solo con la propiedad de fecha de RF-9.1.3 |
| OE-04 | Elevar la calidad del brief (O4) | ≥ 85 % de solicitudes con sector, inicio y duración |
| OE-05 | Sostener un inventario vivo (O5, habilitante) | ≥ 90 % de perfiles publicados con disponibilidad actualizada en 30 días |
| OE-06 | Publicación legal | 0 perfiles publicados sin consentimiento nominal vigente (RF-8.4, Ley 1581) |
| OE-07 | Umbral de salida a producción | ≥ 25 perfiles publicados con consentimiento nominal (D-3) |

## 2. Requisitos funcionales primarios (UC) — arquitecturalmente significativos

> Solo los casos de uso que **moldean** la arquitectura. No es el backlog completo.

| UC | Descripción | Trazabilidad |
|----|-------------|--------------|
| UC-1 | **Acceso nominal del cliente**: enlace firmado → correo en la lista de invitados → código de un uso al buzón → sesión por dispositivo. Vencimiento, revocación y renovación con pantallas propias, nunca error crudo | EP-001 · HU-090, HU-092, HU-144 · RF-1.1–1.6, 1.2.7, 1.2.9, 1.2.11, 19.6 · D-4 |
| UC-2 | **Invitar a un colega** con aprobación de Talento Humano (flujo entre cara cliente y panel) | EP-001 · HU-095 · RF-1.2.10 |
| UC-3 | **Enlace curado como objeto con registro**: generación desde el panel (lista de códigos, razón, invitados, vigencia), reevaluación del estado de cada perfil al abrir, aperturas, revocación; token en servidor por encima de unas decenas de perfiles | EP-001 · HU-122, HU-144, HU-091, HU-093, HU-094 · RF-19, RF-1.3, RF-2.1–2.2 · spec enlaces-curados |
| UC-4 | **Catálogo recortado solo con sesión**: el servidor entrega la proyección publicable (sin lista negra B.4, sin fecha de disponibilidad —solo la banda calculada contra la fecha del día—, ciudad solo para el conjunto presencial/híbrido) como proyección desde la BD por la API autenticada del portal | EP-003, EP-009 · RF-3.7, 3.13, 13.5.5.2, 14.0 · §8 Seguridad · §8.3 |
| UC-5 | **Motor de criterios único y determinista** en el navegador: intérprete propio (léxico, normalización, distancia de edición, patrones), obligatorio/deseable, «cumple N de M», evidencia por criterio, «lo más cercano» = falla exactamente un obligatorio; interpretación separada de recuperación | EP-002, EP-009, EP-010 · HU-065, 074, 085, 118, 119, 076, 121 · RF-2.6, 13.7–13.10, 13.12, 14.3, 16.3 · D-14, D-24 |
| UC-6 | **Estado en la URL y persistencia local**: criterios, vista, ámbito, ficha abierta y equipo en la URL; Perfil Objetivo y preferencias por dispositivo con esquema versionado | EP-002, EP-009 · HU-073, HU-096 · RF-2.5, 13.4, 16.4, 19.8 · D-16 |
| UC-7 | **Solicitud durable hacia HubSpot**: se guarda primero en MariaDB y luego crea el negocio en el pipeline propio con propiedades, línea de tiempo y propietario; resolución de contacto/empresa sin duplicar; negocio nuevo relacionado si ya hay uno abierto; cola de reintento como tabla + cron | EP-005, EP-007 · HU-096–101, 102, 104, 105, 106, 107, 077 · RF-5, 9.1–9.6.2, 17 · D-6, D-7, D-21 |
| UC-8 | **Camino del cero y registro de demanda**: solicitud de perfil a medida + especificación estructurada completa; opciones fuera del banco viajan pero no filtran; sondeo como tarjeta no-perfil con voto a HubSpot | EP-010, EP-002 · HU-075, 077, 078 · RF-10, 11, 14.3, 15.1, 13.7.3 · D-11, D-12 |
| UC-9 | **Acceso al panel**: correo `@trycore.com` inscrito en lista nominal + código + sesión ≤ 12 h con cierre por inactividad a 60 min; roles administrador/observador aplicados en servidor; respuesta neutra; primer administrador sembrado en configuración | EP-006 · HU-123, HU-124 · RF-8.1–8.1.6 · D-22 |
| UC-10 | **Ciclo de vida del perfil y consentimiento**: máquina de estados única (borrador · publicado · pausado · archivado) con guardas de publicación; consentimiento nominal con alcance; revocar despublica; sin borrado físico | EP-006 · HU-125–130, 132–135 · RF-8.2–8.5, 8.7, 8.10, 8.14 · B.9.2 |
| UC-11 | **Importación masiva y reversión**: detección de formato, vista previa sin escritura, tres modos, fusión por campo, código duplicado = error, síncrona con límite de filas; revertir la última importación con foto previa y detección de conflictos; exportación del banco | EP-006 · HU-086, 087, 088, 141, 142 · RF-8.15 · spec importacion-masiva |
| UC-12 | **Auditoría por campo** de toda vía de escritura (panel, importación, reversión, sincronización, fusión, revocación), consultable también en archivados | EP-006 · HU-138 · RF-8.9, 8.1.3 |
| UC-13 | **Catálogos paramétricos y léxico** administrables sin despliegue, con dependencias rol → familia → modalidades, detección de parecidos, desactivar en vez de borrar, fusión con impacto; Gemini propone léxico y una persona aprueba | EP-006 · HU-089, 139, 143 · RF-8.12, 8.12.1, 8.16 · D-24 |
| UC-14 | **Colocados y evidencia**: espejo de solo lectura sincronizado a diario; artefacto de evidencia (documento, transcripción o enlace; sin video; ≤ 64 MB) en carpeta privada; borrador de campos revisado por persona | EP-006 · HU-131, 137, 140 · RF-8.11, 8.11.1, 8.13 · B.8.4, B.9.3 |
| UC-15 | **Notificación y escalamiento por horas hábiles**: aviso al propietario de la cuenta y a Coordinación de Servicio por el canal diario; 4 h hábiles sin apertura → Dirección Comercial; 24 h sin cambio de etapa → Dirección General; tiempo hasta la primera apertura registrado | EP-007 · HU-101, HU-103 · RF-9.5, 9.7, 17.1–17.2 |
| UC-16 | **Correo curado**: armado desde el panel contra el inventario del momento, enlace firmado por destinatario, envío programado, bajas persistentes, medición de apertura/clic/entrada y regla de 3 envíos sin abrir | EP-011 · HU-113–117 · RF-18, 1.6 · spec correo-curado |
| UC-17 | **Telemetría con atribución**: eventos RF-7 atribuidos a cuenta, correo invitado, sesión, conjunto curado y envío; informes de embudo, acierto de curaduría, filtros y rutas sin trabajo manual | EP-008 · HU-108–112 · RF-7 · §8 Trazabilidad |
| UC-18 | **Gemini acotado**: extracción de criterios de requerimientos pegados largos con salida estructurada y vuelta al intérprete determinista; propuestas periódicas de léxico | EP-009, EP-006 · HU-067, 072, 139 · RF-12.2.1, 8.12.1, 16 · D-24 |
| UC-19 | **Tareas programadas vigiladas**: reintento, escalamiento, sincronización, boletín y propuestas de léxico registran cada ejecución; alerta si alguna supera 2× su intervalo | EP-007 · RF-9.6.2 · §8.3 |

## 3. Escenarios de atributos de calidad (QA) — formato de 6 partes

> Prioridad `(Importancia de negocio, Impacto arquitectónico)` en {A, M, B}.

### QA-1 — Rendimiento del filtrado · (A, A)
- **Fuente:** cliente en un teléfono de gama media.
- **Estímulo:** cambia un criterio, un filtro o quita una etiqueta.
- **Artefacto:** motor de criterios (UC-5).
- **Entorno:** normal, ~30 perfiles publicados.
- **Respuesta:** recalcula resultados, contador del panel y aviso.
- **Medida:** P95 < 1 000 ms de la entrada al pintado (§8); contador = número de resultados en el 100 % de los casos (RF-13.8); holgura verificada con 300 perfiles sintéticos (*a validar*, §13.5).

### QA-2 — Primer render útil · (A, A)
- **Fuente:** cliente que llega desde el correo.
- **Estímulo:** abre el enlace (primera visita o retorno con sesión).
- **Artefacto:** sitio estático, entrega del catálogo, aterrizaje curado.
- **Entorno:** red 4G (perfil «Slow 4G»), Cloudflare delante.
- **Respuesta:** ve la selección curada con su razón.
- **Medida:** LCP < 2,5 s en P75 (§8); JS inicial ≤ 200 KB comprimido (*a validar*); catálogo servido en ≤ 500 ms (*a validar*).

### QA-3 — Seguridad del acceso del cliente · (A, A)
- **Fuente:** atacante con el enlace o colega no invitado.
- **Estímulo:** prueba códigos o correos, o altera parámetros del enlace.
- **Artefacto:** puerta de acceso, endpoints de token y código.
- **Entorno:** sin sesión.
- **Respuesta:** rechaza, aplica espera y no revela quién está invitado.
- **Medida:** 0 accesos con correo no invitado; tope de 5 intentos por enlace y por dirección (RF-1.2.9) más límite de Cloudflare; código de 6 dígitos, un uso, vigente ≤ 10 min (*a validar*); enlace manipulado → 0 bytes de inventario (HU-090); revocación efectiva en la siguiente petición (≤ 60 s, *a validar*).

### QA-4 — Autorización del panel · (A, A)
- **Fuente:** observador, o tercero con correo `@trycore.com` no inscrito.
- **Estímulo:** POST directo a una ruta de edición, o solicitud de código.
- **Artefacto:** capa de autorización del panel.
- **Entorno:** con y sin sesión.
- **Respuesta:** rechaza, audita el intento y responde de forma indistinguible.
- **Medida:** matriz rol × acción cubre el 100 % de los endpoints de escritura (403 y 0 cambios para observador); misma respuesta y código HTTP para inscrito y no inscrito; sesión caduca a las 12 h y a 60 min de inactividad (±1 min); 0 rutas del panel alcanzables desde el host del cliente.

### QA-5 — Confidencialidad y Ley 1581 · (A, A)
- **Fuente:** cualquier cliente HTTP, la importación o una revocación.
- **Estímulo:** pide el catálogo o la ficha, inspecciona el bundle, publica sin consentimiento o revoca uno.
- **Artefacto:** proyección del catálogo, guardas de estado, proxy de Gemini, build estático.
- **Entorno:** producción con datos reales.
- **Respuesta:** sin sesión 401; con sesión, proyección recortada; publicar sin consentimiento se bloquea; revocar despublica.
- **Medida:** 0 campos de B.4, 0 fechas de disponibilidad y 0 ciudades fuera del contexto presencial/híbrido en el payload (test de contrato); invariante en BD de 0 publicados sin consentimiento vigente; revocación excluida del catálogo en la siguiente petición; 0 URL públicas a artefactos; 0 datos de perfil hacia Gemini; 0 secretos en el bundle (grep en CI); `noindex` en el 100 % de las respuestas.

### QA-6 — Durabilidad de la solicitud y entrega a HubSpot · (A, A)
- **Fuente:** HubSpot o la red de salida.
- **Estímulo:** 5xx, timeout o 429 al crear el negocio; ModSecurity interfiere.
- **Artefacto:** endpoint de solicitud y cola de trabajos.
- **Entorno:** HubSpot caído hasta 24 h; hosting operativo.
- **Respuesta:** persiste, confirma al cliente, reintenta con espera creciente, alerta y entrega al volver.
- **Medida:** 0 solicitudes perdidas (100 % persistidas antes de responder); confirmación P95 ≤ 2 s sin depender de HubSpot (*a validar*); alerta al tercer fallo (RF-9.6.1); entrega ≤ 60 min tras la recuperación (*a validar*). Fuera de alcance: pérdida del servidor (CRN-9).

### QA-7 — Idempotencia · (A, A)
- **Fuente:** el cron de reintento, corridas solapadas o doble envío del cliente.
- **Estímulo:** HubSpot creó el negocio y la respuesta se perdió; una corrida se solapa con la siguiente.
- **Artefacto:** creación de negocio, contacto y empresa.
- **Entorno:** fallo parcial.
- **Respuesta:** reconoce lo ya creado por clave de idempotencia y bloqueo por trabajo.
- **Medida:** en inyección de 50 respuestas perdidas y corridas solapadas: 0 negocios y 0 empresas duplicados; misma especificación reciente → 0 negocios nuevos (D-7).

### QA-8 — Entrega de correo (códigos, avisos, boletín) · (A, A)
- **Fuente:** el portal, vía SMTP autenticado de `notify@people.trycore.com`.
- **Estímulo:** código de acceso, aviso de solicitud o boletín.
- **Artefacto:** módulo de correo saliente.
- **Entorno:** IP compartida 192.99.84.46; destinatarios en Google Workspace y buzones corporativos de clientes.
- **Respuesta:** llega a la bandeja de entrada; rebotes clasificados aparte.
- **Medida:** SPF, DKIM y DMARC en pass en el 100 %; código de acceso en bandeja P95 ≤ 60 s (*a validar*); ≥ 95 % en bandeja principal en prueba con buzones reales antes del primer envío (*a validar*); 0 envíos por `sendmail`.

### QA-9 — Integridad transaccional de la importación · (A, A)
- **Fuente:** administradora de inventario.
- **Estímulo:** confirma una importación y el proceso falla a mitad (timeout, ModSecurity, error de BD).
- **Artefacto:** servicio de importación.
- **Entorno:** hosting compartido (180 s, 512 MB).
- **Respuesta:** todo o nada; la vista previa no escribe.
- **Medida:** 0 perfiles aplicados a medias; diff = 0 tras una corrida abortada; reimportar el mismo archivo deja 100 % «sin cambios»; confirmar el límite de filas en P95 ≤ 30 s con límite de 200 filas (*a validar*); 0 perfiles publicados o con consentimiento concedido por importación.

### QA-10 — Reversibilidad de la importación · (A, A)
- **Fuente:** administradora.
- **Estímulo:** deshacer la última importación, con perfiles editados a mano después.
- **Artefacto:** lote de importación con foto previa.
- **Entorno:** normal.
- **Respuesta:** restaura, archiva lo creado y avisa de conflictos.
- **Medida:** 100 % de los actualizados con diff = 0 contra la foto; 100 % de los creados archivados y 0 borrados; 100 % de conflictos mostrados antes de aplicar; revertir una que no es la última → rechazo en el 100 %; ≤ 30 s (*a validar*).

### QA-11 — Auditoría completa · (A, A)
- **Fuente:** cualquier vía de escritura.
- **Estímulo:** cambio de un dato.
- **Artefacto:** registro de auditoría.
- **Entorno:** normal.
- **Respuesta:** registra quién, qué campo, valor anterior y nuevo, y cuándo.
- **Medida:** 1:1 mutaciones ↔ entradas en la batería de pruebas; 0 entradas sin autor; registro de solo inserción con evidencia de manipulación (cadena de hashes) verificable; historia de archivados consultable al 100 %.

### QA-12 — Recuperabilidad · (A, A)
- **Fuente:** fallo de BD, error humano masivo o pérdida del servidor.
- **Estímulo:** datos corruptos o perdidos.
- **Artefacto:** MariaDB, carpeta privada, JetBackup, exportación del banco.
- **Entorno:** degradado.
- **Respuesta:** restaurar, o reconstruir desde exportación.
- **Medida:** pérdida máxima ≤ 24 h (§8.3); restauración ≤ 4 h (*a validar*); una restauración de prueba superada antes de producción; exportación → importación deja 100 % «sin cambios». Pérdida del servidor: riesgo aceptado (§10.3).

### QA-13 — Observabilidad de las tareas programadas · (A, A)
- **Fuente:** el hosting.
- **Estímulo:** una tarea deja de ejecutarse o termina con error.
- **Artefacto:** crons de reintento, escalamiento, sincronización, boletín y léxico.
- **Entorno:** fallo silencioso.
- **Respuesta:** aviso al responsable técnico; cada corrida registra inicio, fin, resultado y cantidad.
- **Medida:** alerta cuando una tarea supera 2× su intervalo (≤ 10 min reintento, ≤ 30 min escalamiento, ≤ 48 h diaria) (RF-9.6.2); 100 % de corridas registradas; cada corrida < 180 s; la vigilancia no depende solo del cron.

### QA-14 — Escalamiento a tiempo · (A, A)
- **Fuente:** el reloj hábil.
- **Estímulo:** vencen 4 h hábiles sin apertura o 24 h hábiles sin cambio de etapa.
- **Artefacto:** cron de escalamiento y consulta a HubSpot.
- **Entorno:** incluye noches, fines de semana y festivos.
- **Respuesta:** avisa a Dirección Comercial o a Dirección General.
- **Medida:** escalamiento entre el vencimiento y +15 min; 0 escalamientos por horas no hábiles en prueba con reloj simulado sobre una semana con festivo; 100 % de solicitudes con el tiempo hasta la primera apertura registrado.

### QA-15 — Degradación del modelo · (A, M)
- **Fuente:** Gemini.
- **Estímulo:** falla, tarda o agota cuota.
- **Artefacto:** interpretación de requerimientos pegados y propuestas de léxico.
- **Entorno:** degradado.
- **Respuesta:** aplica el intérprete determinista y avisa sin jerga.
- **Medida:** vuelta al determinista ≤ 8 s desde el envío (*a validar*); 100 % de consultas cortas sin llamada al modelo (D-24); 0 pantallas de error; 0 entradas de léxico sin aprobación.

### QA-16 — Estado en la URL · (A, M)
- **Fuente:** comercial o cliente.
- **Estímulo:** recarga, comparte la URL o la abre otro invitado.
- **Artefacto:** codificador/decodificador de estado.
- **Entorno:** otro dispositivo o navegador.
- **Respuesta:** reconstruye el mismo estado.
- **Medida:** 100 % de ida y vuelta en test de propiedades; URL ≤ 2 000 caracteres, por encima pasa a token en servidor (*a validar*, RF-19.8); parámetros desconocidos → degradación sin error.

### QA-17 — Veracidad y frescura de lo mostrado · (A, M)
- **Fuente:** el tiempo entre el envío y la apertura.
- **Estímulo:** el perfil cambió o su fecha venció.
- **Artefacto:** reevaluación al abrir y cálculo de la banda.
- **Entorno:** enlace abierto días después.
- **Respuesta:** muestra el estado real.
- **Medida:** 0 perfiles omitidos en silencio (RF-19.2); 0 «Inmediato» con fecha vencida y > 30 días sin tocar (RF-8.14.4); banda calculada contra la fecha del día en el 100 %.

### QA-18 — Móvil · (A, M)
- **Fuente:** cliente en teléfono.
- **Estímulo:** recorrido completo instrucción → solicitud.
- **Artefacto:** pantallas de la cara cliente.
- **Entorno:** 320 y 390 px, iOS real.
- **Respuesta:** recorrido completable.
- **Medida:** criterios M-1..M-8 de §8.1 al 100 % por pantalla (0 scroll horizontal, objetivos de 44 × 44 px, 16 px en campos).

### QA-19 — Accesibilidad WCAG 2.1 AA · (A, M)
- **Fuente:** usuario de teclado o lector de pantalla.
- **Estímulo:** recorrido completo.
- **Artefacto:** UI de ambas caras.
- **Entorno:** normal.
- **Respuesta:** todo operable y anunciado.
- **Medida:** criterios A-1..A-8 de §8.2 al 100 %; 0 violaciones serias o críticas de axe (*a validar*).

### QA-20 — Modificabilidad de catálogos y léxico · (A, M)
- **Fuente:** Talento Humano.
- **Estímulo:** añade una modalidad, tecnología o término, o fusiona duplicados.
- **Artefacto:** catálogos y léxico.
- **Entorno:** producción.
- **Respuesta:** disponible sin despliegue y con integridad referencial.
- **Medida:** 0 cambios de código ni despliegues; visible en el portal en la siguiente carga de catálogo; fusión reasigna el 100 % de perfiles en una transacción; 0 entradas de léxico apuntando a valores inexistentes.

### QA-21 — Atribución de la telemetría · (A, M)
- **Fuente:** invitado que entra desde el boletín u otro invitado del mismo enlace.
- **Estímulo:** inicio de sesión y eventos del embudo.
- **Artefacto:** capa de eventos.
- **Entorno:** normal, incluido el pico tras un envío.
- **Respuesta:** evento con cuenta, correo invitado, envío y bandera curado/descubrimiento.
- **Medida:** 100 % de solicitudes vinculadas a cuenta, contacto, sesión, conjunto curado y correo de origen; ≥ 99 % de sesiones por enlace atribuidas a un envío (*a validar*); pérdida de eventos ≤ 1 % (*a validar*).

### QA-22 — Latencia de la notificación · (A, M)
- **Fuente:** un cliente.
- **Estímulo:** envía una solicitud.
- **Artefacto:** notificador.
- **Entorno:** normal.
- **Respuesta:** propietario y Coordinación de Servicio reciben el aviso con los campos de RF-9.7.2.
- **Medida:** P95 ≤ 5 min del envío a la entrega (*a validar*); 100 % de avisos con los 5 campos.

## 4. Restricciones (CON)

| ID | Restricción | Origen |
|----|-------------|--------|
| CON-1 | ⛔ **Reemplazada en la iteración 8 por CON-18 y CON-19** (decisión del sponsor, 2026-09-25). Texto original: Hosting compartido cPanel: PHP 8.3 (`curl`, `openssl`, `session`, `pdo_mysql`), MariaDB 10.6, cron. Frontend estático compilado; **Node no corre en v1**. Sin websockets, colas, workers, procesos largos ni búsqueda vectorial | §8.3, D-23, hosting §2 |
| CON-2 | ⛔ **Reemplazada en la iteración 8 por CON-18** (no hay límites de proceso PHP). Texto original: Límites PHP: `max_execution_time` 180 s, `memory_limit` 512 MB, `upload_max_filesize`/`post_max_size` 64 MB | hosting §2 |
| CON-3 | ⛔ **Reemplazada en la iteración 8 por CON-18** (despliegue por imagen, ADR-0010). Texto original: Despliegue Local → GitHub → *Update from Remote* → *Deploy* con `.cpanel.yml`; árbol del servidor limpio; **nunca `node_modules`** (inodos al 20 %) | §8.3, hosting §3–§4 |
| CON-4 | Acceso sin proveedor de identidad: cliente por lista nominal de invitados + código; panel por lista nominal `@trycore.com` + código + sesión ≤ 12 h / 60 min | D-4, D-22, RF-1.2, RF-8.1 |
| CON-5 | ⛔ **Reemplazada en la iteración 8 por CON-20**. Texto original: Correo solo por SMTP autenticado de `notify@people.trycore.com`; `sendmail` prohibido; `trycore.com` sigue en Google Workspace | §8.3, hosting §7 |
| CON-6 | Secretos solo en servidor (desde la iteración 8: variables `SECRET` de App Platform, nunca en repositorio ni imagen; añade `MAILGUN_API_KEY`, `MAILGUN_WEBHOOK_SIGNING_KEY`, `EDGE_SECRET`, `AUDIT_HMAC_KEY`, `SPACES_*`, `LATIDO_URL`; `SMTP_PASSWORD` desaparece). Texto original: en configuración PHP fuera de la carpeta pública: `HUBSPOT_PRIVATE_APP_TOKEN`, `GEMINI_API_KEY`, `SMTP_PASSWORD`, `LINK_SIGNING_SECRET`, secreto de códigos, credenciales de BD | §8.3 |
| CON-7 | ⛔ **Reemplazada en la iteración 8 por CON-21**. Texto original: Llamadas externas solo con `curl`; nunca `file_get_contents` con URL del usuario | hosting §2 |
| CON-8 | Gemini solo en RF-12.2.1 y RF-8.12.1; recibe consulta y taxonomía, **nunca datos de perfiles**; no redacta sobre personas; desarrollo con token personal y solo datos ficticios | RF-16, D-24 |
| CON-9 | El portal solo lee; la única escritura del inventario es el panel; catálogo solo tras sesión, como proyección desde la BD por la API autenticada; nunca API abierta | §8, §8.3 |
| CON-10 | Privacidad: Ley 1581, lista negra B.4, sin foto/contacto/CV/tarifas, fecha de disponibilidad no sale del panel, ciudad solo en presencial/híbrido, `noindex` | §8, Anexo B, D-9, D-18, RF-1.5, RF-3.13 |
| CON-11 | Sin borrado físico de perfiles ni de valores de catálogo; la importación no borra, no concede consentimiento, no publica | RF-8.3, 8.15.7, 8.16.5 |
| CON-12 | Móvil (M-1..M-8) y WCAG 2.1 AA (A-1..A-8) son definición de hecho por pantalla | §8.1, §8.2 |
| CON-13 | Estado en la URL es requisito duro | RF-2.5 |
| CON-14 | Decisiones irreversibles a preservar: interpretación separada de recuperación con esquema versionado; rol como lista; Perfil Objetivo por dispositivo | §13.7, RF-16.3, 16.4, D-16 |
| CON-15 | ⛔ **Reemplazada en la iteración 8 por CON-22** (ya no hay ModSecurity ni listado de directorios). Texto original: Cloudflare delante (caché de estáticos, límite de peticiones en token y código); ModSecurity activo; listado de directorios desactivado | §8.3, hosting §5 |
| CON-16 | ⛔ **Reemplazada en la iteración 8 por CON-19** (respaldo y PITR de la BD administrada). Texto original: Respaldo JetBackup en el mismo servidor, pérdida máxima 1 día (riesgo aceptado) | §8.3, §10.3 |
| CON-17 | Alcance completo del panel en el MVP | D-8 |
| CON-18 | **Contenedores Docker portables**; destino inicial **DigitalOcean App Platform**. Backend TypeScript con **Next.js** (servidor + rutas de API) y un **worker Node** para trabajo diferido. El hosting cPanel se abandona | D-23 revisada, PRD v4.12 §8.3 |
| CON-19 | **PostgreSQL administrado** (respaldos y PITR fuera de los contenedores) | D-23 revisada, PRD v4.12 §8.3 |
| CON-20 | Correo transaccional y boletín **solo por Mailgun** desde `notify@people.trycore.com`; `trycore.com` sigue en Google Workspace | PRD v4.12 §8.3 (sustituye a CON-5) |
| CON-21 | Llamadas externas **solo desde el servidor**, por adaptadores con timeout; nunca a URL aportadas por el usuario | Derivada de CON-7 y de la frontera de `build-config.json` (iteración 8) |
| CON-22 | **Cloudflare delante** de los 4 hosts (proxy, caché de estáticos, límite de peticiones en el acceso) y el origen no alcanzable saltándose Cloudflare | Derivada de CON-15 (iteración 8) |

## 5. Concerns / preocupaciones del proyecto (CRN)

| ID | Concern | Implicación de diseño |
|----|---------|-----------------------|
| CRN-1 | La API de HubSpot probablemente no expone cuándo alguien «abre» un negocio (RF-9.7.3, 9.7.4) | Hace falta una señal propia (clic rastreado en la notificación, cambio de propietario o de etapa) |
| CRN-2 | El «canal de trabajo diario» de las notificaciones (RF-9.7.1) no está identificado, ni los destinatarios nominales de escalamiento | Integración saliente adicional sin definir; decisión de negocio |
| CRN-3 | Falta el calendario hábil (horario, zona, festivos de Colombia, quién lo mantiene) | Tabla de calendario administrable; decisión de negocio sobre el horario |
| CRN-4 | HU-105 dice que los reintentos se agotan y van a una bandeja de fallos; RF-9.6.1 dice que nunca se deja de reintentar | El diseño debe cumplir ambas (bandeja visible sin dejar de reintentar) |
| CRN-5 | (Iteración 8: Mailgun entrega rebotes, quejas y aperturas por webhook firmado.) Medición del correo con SMTP propio: la apertura exige píxel (falla con Apple Mail Privacy Protection); rebotes exigen procesar el buzón; límite de envío no verificado | Estados «sin dato» explícitos; lectura de rebotes por IMAP o Return-Path |
| CRN-6 | Salida HTTPS hacia `generativelanguage.googleapis.com` no verificada; cuotas y coste de la llave de producción desconocidos | Verificar en el servidor antes de EP-009; presupuesto de llamadas |
| CRN-7 | Permisos de la private app de HubSpot, pipeline y propiedades dependen de Mercadeo y Comercial; correspondencia cuenta del portal ↔ empresa de HubSpot | La cuenta guarda el id de empresa y propietario de HubSpot |
| CRN-8 | (Iteración 8: el equivalente es la caída o el atasco del worker.) Si cae el crontab entero, la vigilancia de RF-9.6.2 cae con él | Vigilancia secundaria apoyada en el tráfico web o un monitor externo |
| CRN-9 | Pérdida del servidor = pérdida de cola, auditoría, consentimientos y artefactos; la importación no puede reponer consentimientos | Riesgo aceptado; exportación periódica recomendada; declarar la consecuencia |
| CRN-10 | Telemetría y notificaciones llevan datos personales; retención no definida (Ley 1581) | Política de retención propuesta y a validar |
| CRN-11 | Motor del borrador de evidencia (HU-140) sin autorizar: D-24 no cubre RF-8.11 y el artefacto contiene datos personales | Decisión de negocio: ampliar D-24 con saneamiento, extracción determinista o diferir con acuerdo del equipo |
| CRN-12 | Dónde vive «Mi equipo»: por dispositivo (D-16) o por invitado en servidor (RF-4.1, HU-095) | Decisión de negocio; cambia el modelo de datos |
| CRN-13 | Documentos de discovery con restos anteriores a D-4/D-16 (EP-009 «contra la cuenta», HU-090 «entra directamente», RF-13.4.1, §13.7, §10.3 «sin nombre completo») | Corrección en discovery con aprobación; no bloquea la arquitectura |
| CRN-14 | Nivel 0 de validación contradictorio (RF-8.10 «se deriva del rol» vs. B.8.1 «no se deriva automáticamente») | Define si la modalidad es obligatoria para publicar; corregir en discovery |
| CRN-15 | Concurrencia: dos administradoras editando el mismo perfil | Control de concurrencia optimista |
| CRN-16 | Números sin fijar: duración de la sesión del cliente, vigencia del enlace, vigencia del código, umbral de confianza de RF-12.3, límite de filas de importación | Valores propuestos por la arquitectura, a validar |
| CRN-17 | Sin SLO de disponibilidad en el PRD; hosting compartido | Se declara como hueco, no como QA |
| CRN-18 | ⛔ **No aplica desde la iteración 8** (no hay ModSecurity). Texto original: ModSecurity puede bloquear POST legítimos (solicitud, requerimiento pegado, importación) | Pruebas con cargas reales y excepciones por regla |
| CRN-19 | Hipótesis rival D-17: la entrada por instrucción debe poder retirarse sin tocar ficha, cero ni registro de demanda | Módulos separables |
| CRN-20 | Agendamiento en el portal (HU-099) marcado v1.1 sin proveedor de calendario | Fuera de esta capa; la fecha de alineación debe llegar al negocio (RF-9.1.3) |

## 6. Plan de iteraciones (rondas ADD ↔ fases del PRD / líneas de release)

| Iteración | Fase PRD / Release | Drivers seleccionados (Paso 2) | Elementos a refinar (Paso 3) | ADRs |
|-----------|--------------------|--------------------------------|------------------------------|------|
| **1** | Anexo A Fase 0–1 · MVP (estructura) | CON-1, 2, 3, 9, 12, 13, 14 · QA-2, QA-18, QA-19 · CRN-19 | Sistema completo: estilo, stack, módulos, despliegue lógico | [0001](0001-estilo-y-stack-base.md) |
| **2** | Fase 8 · caparazón EP-001 y acceso al panel EP-006 | UC-1, 2, 3, 9 · QA-3, 4, 5 · CON-4, 6, 10, 15 · CRN-16 | Identidad, sesiones y enlaces | [0002](0002-identidad-acceso-y-sesiones.md) |
| **3** | Fase 0 y 7–8 · inventario EP-006 | UC-4, 10, 11, 12, 13, 14 · QA-5, 9, 10, 11, 12, 17, 20 · CON-9, 11, 16 · CRN-9, 14, 15 | Modelo de datos, persistencia, auditoría, importación | [0003](0003-datos-persistencia-y-auditoria.md) |
| **4** | Fases 2–3 · EP-002, EP-009, EP-010 | UC-5, 6, 8, 18 · QA-1, 15, 16 · CON-8, 13, 14 · CRN-6, 12, 19 | Búsqueda: intérprete, motor, estado, Gemini | [0004](0004-busqueda-determinista-y-estado.md) |
| **5** | Fase 9 · EP-005, EP-007, EP-011 | UC-7, 15, 16, 19 · QA-6, 7, 8, 13, 14, 22 · CON-5, 7 · CRN-1, 2, 3, 4, 5, 7, 8 | Integraciones y trabajo diferido | [0005](0005-integraciones-y-trabajo-diferido.md) |
| **6** | Fase 8 · EP-008 | UC-17 · QA-21 · CRN-10 | Telemetría y atribución | [0006](0006-telemetria-y-atribucion.md) |
| **7** | Transversal · salida a producción | CON-3, 15 · QA-12, 13 · CRN-17, 18 | Entornos, CI/CD, despliegue y perímetro | [0007](0007-entornos-despliegue-y-perimetro.md) |
| **8** | Transversal · replanteo de plataforma (2026-09-25) | CON-18, 19, 20, 21, 22 · re-evaluación de UC-4, 5, 7, 15, 16, 19 · QA-1, 2, 4, 6, 7, 8, 12, 13, 14, 18, 19, 22 · CON-6, 9, 12, 13, 14 · CRN-1–5, 7–9, 17, 19 | Sistema completo sobre la nueva plataforma; enmiendas a 0002, 0003, 0004, 0006 | [0008](0008-plataforma-contenedores-y-stack.md), [0009](0009-trabajo-diferido-worker-y-correo.md), [0010](0010-entornos-despliegue-y-perimetro.md) |

## 7. Matriz de priorización (Importancia de negocio × Impacto arquitectónico)

| | Impacto arq. ALTO | Impacto arq. MEDIO | Impacto arq. BAJO |
|---|---|---|---|
| **Negocio ALTO** | QA-1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 · UC-1, 3, 4, 5, 7, 9, 10, 11, 12, 15 | QA-15, 16, 17, 18, 19, 20, 21, 22 · UC-2, 6, 8, 13, 16, 17, 19 | — |
| **Negocio MEDIO** | UC-18 | UC-14 | — |

> Los cuadrantes superiores (alta importancia × alto impacto) son los **ASRs críticos**: se atacan
> primero o se mitiga su riesgo lo antes posible.
