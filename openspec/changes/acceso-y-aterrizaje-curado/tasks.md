# Tasks

> Un grupo = un sub-slice (ADR-0008). Se construyen de uno en uno; al cerrar cada grupo, `journey_smoke` verde y checkpoint en el hub. Cada tarea se da por hecha solo con su verificación ejecutada.

## 1. Sub-slice 1 — Esqueleto andante

- [x] 1.1 `packages/infra`: esquema de configuración por proceso que sale con código ≠ 0 ante cualquier variable obligatoria ausente y rechaza `DOBLES` con `APP_ENV=produccion`; verificar con el test V8-9 por proceso
- [ ] 1.2 `docker/`: PostgreSQL 16 + PgBouncer (transacción) + borde emulado en `docker-compose.yml`; `roles.sql` crea `ps_portal`, `ps_panel`, `ps_worker`, `ps_migrador`; verificar que `docker compose up` levanta y que ningún proceso conecta como superusuario
- [x] 1.3 Migraciones iniciales (`identidad`, `identidad_panel`, `operacion.trabajos`, funciones `encolar_portal`/`encolar_panel`/`encolar_worker`, modo degradado y purga de ADR-0002, permisos de ADR-0008 §3) y job `migrar`; verificar V8-11 (base vacía aplica todo, segunda ejecución no hace nada, hueco → ≠ 0) y V8-10/V2-2 para las tablas existentes
- [x] 1.4 `middleware.ts` en ambas apps (runtime nodejs): cabecera de borde en tiempo constante, 403 a `x-middleware-subrequest`, CSP con nonce, `Referrer-Policy: no-referrer`, `nosniff`, anti-marcos; verificar con los tests de borde, V8-2 y la prueba de CSP del shell
- [x] 1.5 `GET /api/v1/salud/vivo` y `/lista` en ambas apps (lista: `SELECT 1` con su rol y versión de esquema, tope 2 s); verificar 200/503 con BD arriba y caída
- [x] 1.6 `exigirSesion` y envoltorios `conSesion`/`conCsrf`/`conAutorizacion`/`conLimite` en `packages/dominio`/`infra` (con `server-only`); páginas públicas `/acceso` y `/e` como stubs; `rutas-permitidas.json` y `rutas-publicas.json`; verificar V8-1, V2-1 (307 a `/acceso` sin payload) y el test estático de `exigirSesion`
- [x] 1.7 Worker: despachador con `FOR UPDATE SKIP LOCKED`, arrendamiento, tipo `enviar_codigo` (genera código, guarda HMAC, reintentos 5/15/30 s, caducidad 10 min) con Mailgun detrás de adaptador y doble; `node dist/worker.js --comprobar`; verificar con tests de cola y V8-11
- [ ] 1.8 CI mínimo en `.github/`: lint, typecheck, V8-1, V8-2, V8-9, V8-11, V2-1, CSP, axe/móvil del shell (V8-7), Lighthouse del shell (V8-6a); verificar que el workflow corre en verde en el PR
- [x] 1.9 Journey smoke del esqueleto: portal y panel arrancan tras el borde emulado, `/acceso` y `/e` cargan, una página protegida redirige; verificar con el runner `integration-check`

## 2. Sub-slice 2 — Login del panel (HU-123)

- [x] 2.1 Lista de inscritos del panel con rol (administradora de inventario, observador) y `sembrar_admin_inicial`; verificar que falla si ya hay usuarios
- [x] 2.2 Flujo `/acceso` del panel: pedir código con respuesta neutra idéntica e indicación de a quién pedir acceso; encola `enviar_codigo {ambito: panel}` solo para inscritos; verificar escenarios «correo sin inscribir» y «buzón desactivado» (el doble de Mailgun rebota)
- [x] 2.3 Verificar código y abrir sesión de 12 h con 60 min de inactividad; identidad disponible para auditoría; verificar escenario de caducidad a las 12 h y de inactividad
- [x] 2.4 Auditoría encadenada mínima del panel (ADR-0003) con el correo de la sesión; verificar que la entrada queda registrada y que no existe desactivación manual
- [x] 2.5 `MatrizPermisos` y V2-3 (observador → 403 sin cambios) y V8-5 (CSRF); verificar en CI
- [x] 2.6 Verificar que el portal no expone ninguna ruta, enlace ni recurso hacia el host del panel (test sobre el manifiesto y el HTML del portal)
- [x] 2.7 Pantallas de acceso del panel según `docs/05-prototipo/`; verificar fidelidad con captura MCP y journey smoke (entrar al panel con código)

## 3. Sub-slice 3 — Modelo mínimo de perfil publicable

- [x] 3.1 Tablas mínimas de perfil y consentimiento con estados (publicado, borrador, pausado, archivado, colocado con fecha de liberación), rol y categoría; vista `catalogo_publicable` y vista de estados por código sin campos B.4; verificar V8-10 (no devuelve perfiles sin publicar ni sin consentimiento; `ps_portal` no lee `perfiles`)
- [x] 3.2 Siembra de perfiles ficticios solo en local, CI y staging (bloqueada con `APP_ENV=produccion`); verificar que la siembra falla en producción
- [x] 3.3 `GET /api/v1/catalogo` con sesión y esquema estricto; verificar V8-4 (401 sin sesión, campos extra fallan, rastreo de HTML/RSC sin campos B.4, `server-only`)

## 4. Sub-slice 4 — Generación del enlace (HU-122)

- [x] 4.1 Dominio: `crearEnlace` (perfiles solo publicados, razón obligatoria, ≥ 1 invitado, vigencia 30 días editable, lista explícita de códigos) y token opaco con hash; verificar los cinco escenarios de HU-122 en tests de dominio
- [ ] 4.2 Adaptador HubSpot de solo lectura `contactoDeCuenta` con timeout y doble; caída → invitados a mano sin bloquear; verificar con el doble en sus tres estados
- [ ] 4.3 Endpoint y pantalla del panel para seleccionar perfiles, escribir la razón, preparar invitados y generar; registro en auditoría (cuenta, razón, invitados, autora, vigencia); verificar con test de contrato (Newman) y captura MCP contra el prototipo
- [ ] 4.4 Revocar un enlace desde el panel (usado por HU-144 y HU-145), con auditoría; verificar con test de contrato

## 5. Sub-slice 5 — Aterrizaje y acceso del cliente (HU-090, HU-144, HU-092)

- [ ] 5.1 `/e/#t=`: leer el fragmento, `POST /acceso/enlace`, borrar de la barra; estados tipados (token inexistente = revocado); verificar escenarios «enlace revocado o alterado» de HU-144
- [ ] 5.2 Puerta: explicación de por qué pide el correo, pedir código con respuesta neutra en tiempo constante (V2-4), `enviar_codigo {ambito: cliente}` solo a invitados; verificar escenarios happy y «correo no invitado» de HU-090
- [ ] 5.3 Verificar código (equivocado, vencido, ya usado), límite de 5 intentos con espera sin revelar pertenencia, apertura registrada al verificar; verificar escenarios de error y «intentos agotados» de HU-090
- [ ] 5.4 Sesión de 30 días acotada a enlace y dispositivo, cortada por vencimiento o revocación; verificar el esquema «alcance de la sesión» de HU-090 y «la revocación corta una sesión abierta» de HU-144
- [ ] 5.5 Aterrizaje: selección con razón, sin filtros deducidos, reevaluación del estado real (`reevaluarSeleccion`) y perfiles colocados aparte con fecha de liberación; verificar escenarios happy y «un perfil cambió» de HU-144
- [ ] 5.6 `noindex, nofollow` en cabecera y página, `robots.txt`, respuesta sin sesión sin nombres; verificar escenario «un buscador rastrea el portal»
- [ ] 5.7 Adaptador HubSpot `estadoDeEmpresa` y trabajo `renovar_enlace` (añadido a la lista blanca de `encolar_portal`): enlace nuevo solo al buzón del invitado con cuenta activa; aviso al propietario o a Talento Humano con fallo cerrado; ventana de espera; verificar los cinco escenarios de HU-092 con el doble en tres estados
- [ ] 5.8 Pantallas de puerta, código, vencido, revocado y aterrizaje según el prototipo; `redirecciones-guards`; verificar fidelidad con captura MCP y journey smoke como invitado no admin

## 6. Sub-slice 6a — Selección, encuadre y retorno (HU-091, HU-093, HU-094)

- [ ] 6.1 Selección idéntica al correo con razón referida al proyecto; perfil pausado en su lugar con etiqueta; todos no publicados → lista completa con estados e invitación a explorar con contexto; verificar los tres escenarios de HU-091
- [ ] 6.2 Encuadre sin selección con roles y categorías publicados, filtrar por una opción, seguir sin elegir, opción vacía con «ampliar la búsqueda»; encabezado sin contexto inventado; verificar los cinco escenarios de HU-093
- [ ] 6.3 «Mi equipo» mínimo por invitado (`equipos`/`equipo_perfiles`, único por invitado y enlace, vacío al primer ingreso, solo lectura en EP-001); verificar aislamiento entre dos invitados con datos sembrados
- [ ] 6.4 Ampliar la búsqueda al banco completo y «Volver a la selección» sin alterar «Mi equipo»; archivados con etiqueta; sin la opción cuando no hubo selección; verificar los tres escenarios de HU-094
- [ ] 6.5 Pantallas según el prototipo; verificar fidelidad con captura MCP y journey smoke

## 7. Sub-slice 6b — Invitar a un colega (HU-095, HU-145)

- [ ] 7.1 Portal: pedir la invitación de un colega; ver petición pendiente, aprobada o rechazada con el contacto de Trycore; aviso a Talento Humano por `notificar`; verificar escenarios «pendiente» y «rechazada» de HU-095 con peticiones sembradas
- [ ] 7.2 Panel: lista de peticiones por enlace; aprobar (alta con origen «invitación aprobada», sin duplicar) y rechazar con motivo; auditoría de ambas; sin aprobar en enlaces no vigentes; verificar los cuatro escenarios de HU-145
- [ ] 7.3 Colega aprobado entra a la misma selección con su «Mi equipo» vacío y aislado; colega sin invitación recibe la respuesta neutra; verificar escenarios «aprobada» y «sin estar invitado» de HU-095
- [ ] 7.4 Prueba integrada pedir → aprobar → entrar y pedir → rechazar → sin acceso (recomendación INVEST); verificar de punta a punta con el runner `integration-check`
- [ ] 7.5 Pantallas del portal y del panel según el prototipo; verificar fidelidad con captura MCP

## 8. Cierre de la épica caparazón

- [ ] 8.1 Checklist de caparazón con evidencia de ejecución real: navegación y menús, layout del panel central, login (portal y panel), redirecciones y guardas; verificar que cada ítem tiene evidencia enlazada
- [ ] 8.2 Registrar la enmienda de ADR-0009 (`renovar_enlace` en la lista blanca) en `docs/adr/_backlog-arquitectonico.md`; verificar que el tablero la cita
- [ ] 8.3 Referencias de vuelta `> OpenSpec change: acceso-y-aterrizaje-curado` en EP-001 y en las 10 HU; verificar con `change-epic-coherence`
