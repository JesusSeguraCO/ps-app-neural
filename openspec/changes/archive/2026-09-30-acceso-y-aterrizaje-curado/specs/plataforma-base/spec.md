# Spec Delta

## Purpose

Garantiza que el portal y el panel arrancan como un sistema seguro y operable antes de mostrar un solo dato: perímetro, rutas permitidas, guarda de sesión, salud, configuración completa y envío fiable de códigos de acceso.

## ADDED Requirements

### Requirement: Solo el borde de Cloudflare llega al origen
El portal y el panel SHALL rechazar con 403 toda petición que no traiga la cabecera secreta de borde válida, salvo las rutas de salud `GET /api/v1/salud/vivo` y `GET /api/v1/salud/lista`, que solo responden 200 o 503 sin cuerpo informativo. No SHALL existir ninguna opción de configuración que desactive la comprobación.

#### Scenario: Petición directa al origen
- **WHEN** una petición llega sin la cabecera de borde o con un valor que no coincide
- **THEN** la respuesta es 403 y no se ejecuta ninguna página ni endpoint

#### Scenario: Cabecera de subpetición interna desde fuera
- **WHEN** una petición externa trae la cabecera `x-middleware-subrequest`
- **THEN** la respuesta es 403

#### Scenario: Salud sin cabecera de borde
- **WHEN** se pide `GET /api/v1/salud/vivo` sin cabecera de borde
- **THEN** la respuesta es 200 o 503 sin cuerpo que revele versión, configuración ni datos

### Requirement: Cabeceras de seguridad en toda respuesta
Toda respuesta HTML del portal y del panel SHALL llevar una política CSP con nonce por petición, `Referrer-Policy: no-referrer`, protección contra embebido en marcos y `X-Content-Type-Options: nosniff`.

#### Scenario: Página servida con CSP
- **WHEN** se carga cualquier página del portal o del panel
- **THEN** la respuesta lleva una CSP con nonce distinto en cada petición y los scripts inline sin ese nonce no se ejecutan

### Requirement: Lista positiva de rutas del portal
El portal SHALL servir solo las rutas declaradas en su lista de rutas permitidas; cualquier ruta de página o endpoint no declarada SHALL hacer fallar la verificación de compilación. El portal no SHALL importar código del panel ni viceversa.

#### Scenario: Ruta no declarada
- **WHEN** la compilación del portal produce una ruta que no está en la lista permitida
- **THEN** la verificación de rutas falla y el cambio no se integra

### Requirement: Guarda de sesión en cada página protegida
Toda página que no sea pública (portal: `/e`, `/acceso`; panel: `/acceso`) SHALL exigir sesión antes de cualquier otra lectura, y sin sesión válida SHALL redirigir a `/acceso` con el motivo correcto sin incluir datos de inventario ni payload de componentes de servidor. Todo endpoint no público sin sesión SHALL responder 401.

#### Scenario: Página protegida sin sesión
- **WHEN** se pide una página protegida sin cookie de sesión, con o sin cabecera `RSC: 1`
- **THEN** la respuesta es una redirección 307 a `/acceso` con el motivo y el cuerpo no contiene datos de perfiles

#### Scenario: Sesión de un enlace revocado o vencido
- **WHEN** se pide una página protegida del portal con la cookie de un enlace revocado o vencido
- **THEN** la respuesta redirige a `/acceso` con el motivo del estado del enlace

#### Scenario: Endpoint sin sesión
- **WHEN** se llama a un endpoint no público sin sesión
- **THEN** la respuesta es 401

### Requirement: Sin mutaciones fuera de endpoints protegidos
Ninguna aplicación SHALL usar Server Actions ni el runtime Edge; toda mutación SHALL pasar por un endpoint que exige un token CSRF válido y un `Origin` del propio host.

#### Scenario: Mutación sin CSRF
- **WHEN** se envía una mutación sin cabecera CSRF, con token erróneo o con `Origin` de otro subdominio
- **THEN** la respuesta es 403 y no cambia ningún dato

### Requirement: Arranque solo con configuración completa
Cada proceso (portal, panel, worker) SHALL negarse a servir tráfico y salir con código distinto de 0 si falta cualquier variable obligatoria de su configuración; en producción SHALL rechazar dobles de servicios externos y credenciales ausentes.

#### Scenario: Falta una variable obligatoria
- **WHEN** se arranca un proceso sin una de sus variables obligatorias
- **THEN** el proceso sale con código distinto de 0 sin abrir el puerto

### Requirement: Salud y preparación
Cada aplicación SHALL exponer `GET /api/v1/salud/vivo` (sin tocar la base de datos) y `GET /api/v1/salud/lista` (consulta la base de datos con su propio rol y comprueba que la versión de esquema aplicada es suficiente, con tope de 2 s).

#### Scenario: Base de datos caída
- **WHEN** la base de datos no responde
- **THEN** `salud/vivo` responde 200 y `salud/lista` responde 503

### Requirement: Permisos mínimos de base de datos
Cada proceso SHALL conectarse con su propio rol (`ps_portal`, `ps_panel`, `ps_worker`; migraciones con `ps_migrador`), nunca como superusuario, y cada rol SHALL tener solo los permisos de su función: el portal no lee inventario completo ni toca la identidad del panel, y nadie escribe directamente en la cola salvo por las funciones de encolado permitidas.

#### Scenario: El portal intenta tocar la identidad del panel
- **WHEN** el rol del portal intenta leer o escribir cualquier tabla de `identidad_panel`
- **THEN** la base de datos devuelve error de permisos

#### Scenario: Encolado fuera de la lista permitida
- **WHEN** el rol del portal encola un tipo de trabajo o un ámbito que no le corresponde
- **THEN** la función de encolado lanza una excepción y no se crea el trabajo

### Requirement: Envío de códigos de acceso por el worker
El worker SHALL generar cada código de acceso de un uso, guardar solo su HMAC, enviarlo al buzón por el servicio de correo y reintentar a los 5, 15 y 30 s con un código nuevo; un código que supera su vigencia de 10 minutos SHALL caducar sin reenviarse. El código ni el correo SHALL viajar en claro por la cola.

#### Scenario: Envío con reintento
- **WHEN** el primer envío de un código falla de forma definitiva
- **THEN** el worker reintenta con un código nuevo y el anterior deja de ser válido

#### Scenario: Código caducado en cola
- **WHEN** un trabajo de envío supera los 10 minutos de vigencia sin entregarse
- **THEN** el trabajo pasa a caducado y no se envía

### Requirement: Migraciones deterministas
El proceso de migración SHALL aplicar todas las migraciones conocidas sobre una base vacía, no hacer nada en una segunda ejecución y fallar si las migraciones aplicadas no empiezan por las conocidas.

#### Scenario: Segunda ejecución
- **WHEN** se ejecuta la migración dos veces seguidas sobre la misma base
- **THEN** la segunda ejecución no aplica nada y sale con 0
