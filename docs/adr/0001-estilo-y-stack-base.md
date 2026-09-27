---
id: 0001
title: "Estilo arquitectónico, stack y estructura del sistema"
date: 2026-09-25
status: superseded
superseded_by: 0008
authors:
  - setup-architecture (/build:architect)
tags: [estilo, stack, monorepo, estatico, php, mariadb]
add:
  iteracion: 1
  fase_prd: "Anexo A Fase 0–1 · MVP (estructura)"
---

# ADR 0001 — Estilo arquitectónico, stack y estructura del sistema

> ⛔ **SUPERSEDED (iteración 8, 2026-09-25)** por [ADR-0008](0008-plataforma-contenedores-y-stack.md) tras el cambio de plataforma
> (cPanel → Docker/DigitalOcean App Platform, Next.js TS, PostgreSQL, Mailgun). Se conserva como rastro;
> no es criterio de construcción.

## 1. Objetivo de la iteración y drivers seleccionados (Pasos 2–3)

- **Objetivo de la iteración:** fijar el estilo estructural, el stack y la división en módulos del
  sistema completo, dentro del techo del hosting compartido, aprovechando el handoff del prototipo.
- **Elemento a refinar:** sistema completo (primera ronda, top-down).
- **Drivers abordados:**
  - Funcionales: UC-4 (dónde y cómo se entrega el catálogo), UC-5 (dónde vive la lógica de búsqueda).
  - Atributos de calidad: QA-1 (filtrado < 1 s), QA-2 (LCP < 2,5 s), QA-4 (solo en su parte
    estructural: 0 rutas del panel alcanzables desde el host del cliente), QA-18 (móvil), QA-19
    (WCAG 2.1 AA).
  - Restricciones: CON-1, CON-2, CON-3, CON-9, CON-12, CON-13, CON-14.
  - Concerns: CRN-19 (entrada por instrucción retirable).
- **Fuera de alcance aquí:** el detalle de sesiones, códigos y matriz de autorización (ADR-0002), el
  modelo de datos y la proyección publicable (ADR-0003), el intérprete y el estado en URL en detalle
  (ADR-0004), y el pipeline de despliegue y el perímetro (ADR-0007). Este ADR fija la estructura que
  esos ADR refinan.

## 2. Conceptos de diseño elegidos (Paso 4)

| Driver | Concepto / Táctica | Alternativas descartadas | Razón |
|--------|--------------------|--------------------------|-------|
| CON-1, QA-2 | **Frontend estático compilado + API PHP del lado del servidor** («JAMstack» sobre hosting compartido). El HTML/JS/CSS se sirve como archivos estáticos cacheados por Cloudflare; la API es PHP bajo el mismo host | SPA servida por Node (Node no corre en v1); render en servidor con PHP (se pierde el handoff React y la interacción del panel de ajuste); Directus/CMS headless (Fase 2, exige Node) | Es lo único que el hosting ejecuta sin configuración adicional y cumple el primer render en 4G con caché de CDN |
| QA-18, QA-19, CON-12 | **Next.js 15 con `output: "export"`** (sitio estático, sin SSR, sin middleware, sin route handlers, sin server actions, `images.unoptimized`) + **Tailwind 3.4 + shadcn/ui (Radix)** + `nuqs` + `next-themes` + `lucide-react`, tal como define `docs/07-prototipo/handoff/` | Vite + React Router (reescribir los 31 componentes del handoff y su estructura de rutas); Astro (islas: el portal es casi todo interactivo) | Reutiliza el handoff completo (componentes, tokens, `tailwind.config.ts`, estado en URL); Radix aporta accesibilidad de base; el export estático cumple CON-1 |
| CON-13, CON-1 | **Regla «estado solo en query string»**: ninguna página usa segmentos dinámicos de ruta (`[id]`, `[...slug]`); el perfil abierto, los criterios y el equipo viajan en `?…` y se leen con `nuqs`/`useSearchParams`. Todo componente que llame a `useSearchParams` se monta **dentro de un `<Suspense>`** | Rutas dinámicas con `generateStaticParams` (obliga a conocer los ids de perfil en tiempo de compilación y recompilar al publicar uno); rutas dinámicas sin él (el export estático no las admite) | El export estático solo sirve rutas conocidas al compilar; con el estado en la query el conjunto de páginas es fijo y pequeño. Sin `<Suspense>`, Next 15 aborta el export de la página que lee la query |
| Modificabilidad, QA-2 | **`transpilePackages`** en `next.config` de ambas apps para `packages/ui` y `packages/motor` (y `packages/contratos`): se consumen como fuente TypeScript, sin paso de compilación propio | Compilar cada paquete a `dist/` antes de las apps; publicar paquetes | Un solo pipeline de compilación, tree-shaking sobre el fuente y sin artefactos intermedios que sincronizar |
| CON-9, UC-4 | **API PHP como monolito modular con puertos y adaptadores** (hexagonal): dominio sin dependencias; adaptadores para MariaDB, HubSpot, Gemini y SMTP | Microservicios (imposibles en hosting compartido); PHP sin estructura (mezcla dominio e infraestructura, impide probar sin red) | Aísla las fronteras externas declaradas en `build-config.json`; el dominio se prueba sin red |
| UC-4, CON-9 | **Catálogo como proyección desde la BD servida por la API autenticada**: `GET /api/v1/catalogo` del portal exige sesión válida y devuelve solo los campos publicables (sin lista negra B.4, banda de disponibilidad calculada contra la fecha del día, ciudad solo para presencial/híbrido). No hay archivo de catálogo estático ni API abierta | Archivo JSON generado en una carpeta fuera de la raíz pública y servido por PHP (dos fuentes de verdad, regeneración en cada edición); catálogo incrustado en el build (queda público en `out/`) | Una sola fuente de verdad (la BD, ADR-0003); CON-9 se cumple igual porque sin sesión la respuesta es 401 y no existe ningún endpoint de inventario sin autenticación |
| CON-2, CON-3 | **Slim 4** como micro-framework HTTP (routing + middleware PSR-15), **PDO** directo con repositorios SQL, **PHPMailer** para SMTP. Sin ORM | Laravel/Symfony (miles de archivos: presiona el límite de inodos; arranque más pesado); PHP puro sin router (reinventar middleware de sesión, CSRF, errores) | Superficie mínima de dependencias; `vendor/` de producción pequeño (`composer install --no-dev`) |
| QA-1, UC-5, CRN-19 | **Lógica de búsqueda como paquete TypeScript puro** (`packages/motor`) sin dependencias de UI, ejecutado en el navegador | Motor en PHP con una llamada por filtro (latencia de red en cada cambio; incumple QA-1 en 4G) | Con ~30 perfiles el cálculo es local e instantáneo; un solo motor para panel y resultados (RF-13.8); retirable sin tocar ficha ni cero |
| RF-8.1.4, QA-4 | **Dos aplicaciones estáticas y dos hosts de un solo nivel**: `people.trycore.com` (portal del cliente) y `people-panel.trycore.com` (panel de Talento Humano); en staging `people-staging.trycore.com` y `people-panel-staging.trycore.com`. Cada host tiene su propio front controller de API y su propia cookie de sesión | Un solo sitio con rutas `/panel` (el panel quedaría a una URL del enlace del cliente; cookies compartidas); hosts anidados (`panel.people.trycore.com`) | El panel nunca es alcanzable desde el enlace del cliente, ni por ruta ni por cookie. Los hosts son de un solo nivel porque el certificado gratuito de Cloudflare (Universal SSL) cubre solo `trycore.com` y `*.trycore.com`; un host de dos niveles exigiría un certificado avanzado de pago |
| QA-3, QA-4 | **CSRF con token en cabecera + comprobación de `Origin`/`Referer`**: toda petición mutante exige la cabecera `X-PS-CSRF` con el token de la sesión y un `Origin` (o, si falta, `Referer`) igual exactamente al origen del host que responde; la API no emite cabeceras CORS | Confiar solo en `SameSite=Lax`; token en campo de formulario | Los dos hosts (y cualquier otro subdominio de `trycore.com`) son **same-site** entre sí: comparten el dominio registrable `trycore.com`. `SameSite=Lax` solo frena peticiones *cross-site*, así que una página en otro subdominio de `trycore.com` sí enviaría la cookie. El token en cabecera obliga a un `fetch` del mismo origen (la cabecera personalizada dispara un preflight que la API rechaza) y la comprobación de `Origin` corta lo que quede. Detalle de sesión en ADR-0002 |
| Modificabilidad | **Monorepo con npm workspaces**: `apps/portal`, `apps/panel`, `packages/ui`, `packages/motor`, `packages/contratos`; y `server/` (PHP) | Repos separados (duplica contratos y componentes); un solo app Next con dos builds por variable (condicionales dispersos, riesgo de compilar rutas del panel en el portal) | Comparte design system, motor y contratos de API con tipado de extremo a extremo |

## 3. Instanciación: responsabilidades e interfaces (Paso 5)

**Estructura del repositorio**

```
apps/
  portal/        Next.js export estático — cara cliente (people.trycore.com)
  panel/         Next.js export estático — Talento Humano (people-panel.trycore.com)
packages/
  ui/            componentes del handoff (docs/07-prototipo/handoff), tokens y tema
  motor/         intérprete de consultas + motor de criterios (TypeScript puro, sin React)
  contratos/     tipos y esquemas de la API compartidos por las dos apps
server/
  public/portal/api/index.php   front controller de la API del portal
  public/panel/api/index.php    front controller de la API del panel
  src/Dominio/                  entidades, reglas, máquina de estados, invariantes
  src/Aplicacion/               casos de uso (un servicio por UC)
  src/Adapters/Persistencia/    repositorios PDO sobre MariaDB (incluida la proyección del catálogo)
  src/Adapters/HubSpot/         frontera hubspot-api
  src/Adapters/Gemini/          frontera llm-interpreter
  src/Adapters/Mail/            frontera otp-mail (PHPMailer, SMTP autenticado)
  cron/                         entradas de las tareas programadas
  db/migrations/                SQL versionado
.cpanel.yml                     copia los artefactos de la rama de despliegue (ADR-0007)
```

**Hosts por entorno**

| Entorno | Portal (cliente) | Panel (Talento Humano) |
|---------|------------------|------------------------|
| Producción | `people.trycore.com` | `people-panel.trycore.com` |
| Staging | `people-staging.trycore.com` | `people-panel-staging.trycore.com` |

Todos son de un solo nivel bajo `trycore.com`, cubiertos por el certificado Universal SSL gratuito de
Cloudflare. Cualquier host nuevo debe seguir la misma regla.

**Responsabilidades**

- `apps/portal` y `apps/panel`: solo presentación y estado de interfaz. Leen y escriben únicamente a
  través de la API de su propio host. No contienen secretos ni datos de inventario en el build.
  `apps/portal` no importa nada de `apps/panel` (ni al revés); lo compartido vive en `packages/`.
- **Regla de rutas del frontend:** el árbol `app/` de ambas apps no contiene carpetas con corchetes;
  el estado de pantalla (perfil abierto, criterios, equipo, pestaña) vive en la query string y se lee
  con `nuqs`/`useSearchParams` dentro de un `<Suspense>` con su propio estado de carga.
- `packages/motor`: funciones puras `interpretar(texto, lexico, catalogo) → Criterios` y
  `evaluar(criterios, catalogo) → Resultado[]`. Determinista, sin red. La entrada por instrucción
  (barra de instrucción + `interpretar`) es un módulo que la ficha, el estado cero y el registro de
  demanda no importan.
- `server/src/Aplicacion`: un servicio por caso de uso (acceso, enlaces, catálogo, solicitud, perfiles,
  importación, auditoría, telemetría, notificaciones). Dependen de interfaces del dominio, no de los
  adaptadores.
- `server/src/Adapters/*`: única capa que habla con red o base de datos. El catálogo se construye
  como **proyección** en `Adapters/Persistencia` a partir de las tablas de inventario (ADR-0003); no
  se escribe a disco.

**Interfaces / contratos**

- API JSON sobre HTTPS bajo `/api/v1/…` en cada host. Los tipos viven en `packages/contratos` y el
  servidor valida cada entrada contra el mismo esquema.
- `GET /api/v1/catalogo` (solo portal): exige sesión; responde 401 sin ella. El contrato enumera los
  campos permitidos (lista blanca); cualquier campo extra rompe el test de contrato.
- Toda petición mutante (en ambos hosts): cabecera `X-PS-CSRF` + `Origin`/`Referer` igual al origen
  del host; si no, 403 sin efecto.
- Puertos del dominio: `RepositorioPerfiles`, `RepositorioEnlaces`, `ProyeccionCatalogo`,
  `ColaTrabajos`, `ClienteCrm`, `ClienteModelo`, `EnviadorCorreo`, `Reloj`, `RegistroAuditoria`.
- La configuración (secretos, DSN, dominios) vive en `~/portal-config/config.php`, fuera de toda raíz
  pública, y se inyecta al arrancar.

**Verificaciones que este ADR exige (entran al pipeline de ADR-0007)**

| ID | Verificación | Driver |
|----|--------------|--------|
| V-1 | **0 rutas del panel en el build del portal**: tras `next build` de `apps/portal`, un test recorre `apps/portal/out/` y compara las rutas compiladas contra la lista de rutas de `apps/panel`; además enumera las rutas registradas en el front controller `server/public/portal/api/index.php` y falla si aparece alguna del panel. Una regla de lint prohíbe importar `apps/panel` desde `apps/portal` | QA-4, RF-8.1.4 |
| V-2 | **Sin segmentos dinámicos**: un test falla si existe una carpeta `[…]` bajo `apps/*/app/`; el propio `next build` con `output: "export"` falla si un `useSearchParams` queda fuera de `<Suspense>` | CON-13, CON-1 |
| V-3 | **Retirada de la entrada por instrucción (CRN-19)**: un job de CI aplica la retirada según la instrucción documentada (quitar la barra de instrucción y su import de `interpretar`), compila ambas apps y corre el humo de Playwright sobre ficha, estado cero y registro de demanda; los tres deben compilar y funcionar | CRN-19 |
| V-4 | **Catálogo tras sesión**: test de contrato `GET /api/v1/catalogo` → 401 sin sesión; con sesión, solo campos de la lista blanca; `grep` sobre `out/` de ambas apps sin datos de perfiles | UC-4, CON-9 |
| V-5 | **CSRF**: tests de API que envían una mutación sin cabecera, con token erróneo, con `Origin` de otro subdominio de `trycore.com` y sin `Origin` ni `Referer`; todas → 403 y 0 cambios | QA-3, QA-4 |
| V-6 | **Presupuesto de rendimiento**: Lighthouse CI en perfil Slow 4G con LCP < 2,5 s y JS inicial ≤ 200 KB comprimido; benchmark de `packages/motor` con 300 perfiles sintéticos (P95 de `evaluar` + pintado < 1 000 ms con CPU ×4 más lenta en Playwright) | QA-1, QA-2 |
| V-7 | **Accesibilidad y móvil automatizados**: axe en Playwright sobre cada pantalla (0 violaciones serias o críticas); a 320 y 390 px, `scrollWidth ≤ clientWidth` (M-1), cajas de controles ≥ 44 × 44 px (M-2), `font-size` ≥ 16 px en campos (M-3) y ≥ 13 px en texto (M-8) | QA-18, QA-19, CON-12 |
| V-8 | **Verificación manual por pantalla** (lista de chequeo en el PR que cierra cada épica con UI): M-3 en iPhone real, M-4, M-5, M-6, M-7; A-2 (recorrido solo con teclado), A-3 (foco visible), A-5 y A-7 (lector de pantalla: VoiceOver), A-6 (escala de grises), A-1 sobre combinaciones de color nuevas | QA-18, QA-19, CON-12 |

## 4. Vistas y registro de la decisión (Paso 6)

```mermaid
flowchart LR
  subgraph Navegador cliente
    P[apps/portal · estático] --> M[packages/motor]
  end
  subgraph Navegador Talento Humano
    A[apps/panel · estático] --> M2[packages/motor]
  end
  CF[Cloudflare · Universal SSL *.trycore.com] --> H1[people.trycore.com]
  CF --> H2[people-panel.trycore.com]
  P -- "HTTPS /api/v1 (cookie + X-PS-CSRF)" --> CF
  A -- "HTTPS /api/v1 (cookie + X-PS-CSRF)" --> CF
  subgraph Hosting cPanel
    H1 --> FP[front controller portal]
    H2 --> FA[front controller panel]
    FP --> APP[Aplicación + Dominio PHP]
    FA --> APP
    APP --> PROY[Proyección del catálogo]
    PROY --> DB[(MariaDB 10.6)]
    APP --> DB
    APP --> CFG[/config fuera de la raíz pública/]
    CRON[cron] --> APP
  end
  APP -- curl --> HS[HubSpot API]
  APP -- curl --> GM[Gemini API]
  APP -- SMTP 587 --> MAIL[notify@people.trycore.com]
```

**Decisión:** frontend estático en Next.js 15 (export) organizado como monorepo con dos aplicaciones y
dos hosts de un solo nivel (`people.trycore.com`, `people-panel.trycore.com`; en staging
`people-staging.trycore.com`, `people-panel-staging.trycore.com`); estado de pantalla solo en la query
string, sin segmentos dinámicos; API PHP 8.3 con Slim 4 en estilo de puertos y adaptadores; MariaDB
10.6 vía PDO, con el catálogo servido como proyección desde la BD por la API autenticada; CSRF por
token en cabecera más comprobación de `Origin`/`Referer`; lógica de búsqueda en un paquete TypeScript
puro que corre en el navegador.

**Trade-offs aceptados:**
- El export estático renuncia a SSR, middleware y optimización de imágenes de Next; la protección del
  contenido vive en la API, no en el enrutamiento del frontend.
- Sin segmentos dinámicos, las URL de ficha son `/perfil?id=…` en vez de `/perfil/123`: menos
  «bonitas», pero compartibles y sin recompilar al publicar un perfil.
- Dos hosts duplican la configuración de DNS, AutoSSL y Cloudflare a cambio de aislar el panel. El
  nombre `people-panel` es menos jerárquico que `panel.people`, a cambio de no pagar certificado.
- El catálogo sale de la BD en cada petición autenticada: una consulta más por sesión frente a un
  archivo estático, a cambio de una sola fuente de verdad (mitigable con caché corta en PHP).
- Sin ORM: más SQL escrito a mano, a cambio de control fino de transacciones (ADR-0003) y menos archivos.

## 5. Análisis del diseño (Paso 7)

> Evaluación ATAM-lite adversarial (`architecture-evaluator`), con las correcciones ya incorporadas en
> §2–§4. Criterio: ✅ solo si hay medida o plan de verificación concreto (V-1..V-8 de §3); ⚠️ si el
> plan existe pero la medida depende de algo aún no probado o manual; ❌ si no se cumple.

| Driver | ✅/⚠️/❌ | Evidencia / medida | Riesgo residual |
|--------|---------|--------------------|-----------------|
| UC-4 | ✅ | Proyección desde la BD por `GET /api/v1/catalogo` autenticado; V-4 (401 sin sesión, lista blanca de campos, 0 datos de perfil en `out/`) | Las reglas de la proyección (banda contra la fecha del día, ciudad condicionada) se prueban en ADR-0003; si allí fallan, aquí el contrato solo detecta campos, no valores |
| UC-5 | ✅ | `packages/motor` puro y sin red; mismo paquete en panel y resultados; tests de propiedades de determinismo (ADR-0004) | — |
| QA-1 | ⚠️ | Cálculo local; plan V-6 con 300 perfiles sintéticos y CPU ×4 | La CPU ralentizada aproxima un teléfono de gama media, no lo mide; P95 sin confirmar en dispositivo real |
| QA-2 | ⚠️ | Estático + Cloudflare; V-6 con Lighthouse CI (Slow 4G, LCP < 2,5 s, JS ≤ 200 KB) bloqueante | El P75 real exige datos de campo que no se recogen; Radix/shadcn pueden empujar el bundle; la llamada autenticada al catálogo (≤ 500 ms) depende del hosting compartido y no está medida |
| QA-4 (estructural) | ✅ | Dos apps, dos hosts, dos front controllers; V-1 verifica 0 rutas del panel compiladas en el portal y 0 registradas en su API; lint impide imports cruzados | La matriz rol × acción y la respuesta indistinguible quedan en ADR-0002 |
| QA-18 | ⚠️ | V-7 automatiza M-1, M-2, M-3 (estilo computado) y M-8 a 320/390 px; V-8 cubre M-3 en iPhone real, M-4..M-7 a mano | Depende de que la lista manual se ejecute por pantalla; no hay aún iPhone asignado ni responsable |
| QA-19 | ⚠️ | axe en CI (V-7, 0 serias/críticas) cubre parte de A-1, A-4 y A-8; V-8 cubre A-2, A-3, A-5, A-6, A-7 con teclado, VoiceOver y escala de grises | axe detecta una fracción de WCAG; A-5 y A-7 (anuncios dinámicos) solo se verifican a mano y son los más frágiles en Radix + `nuqs` |
| CON-1 | ✅ | En el servidor solo PHP, MariaDB y estáticos; `output: "export"` hace fallar el build si se usa SSR, middleware o route handlers; V-2 | — |
| CON-2 | ⚠️ | Slim + PDO son ligeros; ninguna petición del portal hace trabajo pesado | Los límites de 180 s / 512 MB / 64 MB se juegan en la importación (ADR-0003) y en el cron (ADR-0005), no medidos aquí |
| CON-3 | ⚠️ | Solo se despliegan artefactos compilados y `vendor/` sin dev; nunca `node_modules` (coherente con ADR-0007) | Pendiente de verificar en el hosting compartido: que `.cpanel.yml` despliega limpio y el consumo real de inodos de `vendor/` + historial de `deploy` (ver ADR-0007) |
| CON-9 | ✅ | El front controller del portal no registra escrituras de inventario; catálogo solo tras sesión; no existe API abierta; V-1 y V-4 | — |
| CON-12 | ⚠️ | Móvil y AA como definición de hecho: V-7 automático + V-8 manual en el PR de cada épica con UI | Mismo que QA-18/QA-19: la parte manual depende de disciplina y de un responsable no asignado |
| CON-13 | ✅ | Regla «estado solo en query string»; V-2 (sin carpetas `[…]`, build falla sin `<Suspense>`); ida y vuelta por test de propiedades (ADR-0004) | El límite de 2 000 caracteres de URL y su paso a token se resuelven en ADR-0004 |
| CON-14 | ⚠️ | La estructura separa `interpretar` de `evaluar` con esquema de criterios versionado en `packages/contratos` | «Rol como lista» y «Perfil Objetivo por dispositivo» dependen del modelo de datos (ADR-0003) y del estado (ADR-0004); aquí solo se preserva la separación |
| CRN-19 | ✅ | La entrada por instrucción es un módulo que ficha, cero y demanda no importan; V-3 la retira según la instrucción y comprueba que los tres compilan y funcionan | Si el job V-3 no se mantiene al día con la instrucción de retirada, la prueba deja de representar la retirada real |

**Drivers no resueltos en esta iteración:** los de acceso, datos, integraciones y telemetría pasan a
las iteraciones 2–6.

## 6. Consecuencias

**Positivas**
- Se reutiliza el handoff completo (31 componentes, tokens, estado en URL) sin reescritura.
- El dominio PHP y el motor TypeScript se prueban sin red; el motor es el mismo en panel y resultados.
- El panel queda aislado del cliente por host, por cookie y por build, y eso se verifica en CI (V-1).
- Sin archivos de catálogo ni API abierta: una sola fuente de verdad (la BD) y nada de inventario en
  los estáticos.
- Certificados gratuitos: los cuatro hosts caben en el Universal SSL de Cloudflare.

**Negativas**
- Dos builds de Next y dos front controllers que mantener.
- El export estático limita Next: sin `middleware.ts`, sin SSR, sin rutas dinámicas; toda la
  navegación con estado pasa por la query string y por `<Suspense>`.
- Consumir los paquetes como fuente (`transpilePackages`) alarga algo el build de cada app.
- La cara cliente depende de JavaScript: sin JS no hay búsqueda (aceptable para un portal privado).

**Riesgos**
- **Presupuesto de JS (QA-2):** Radix/shadcn + `nuqs` + motor pueden superar 200 KB; mitigación:
  Lighthouse CI bloqueante (V-6) e importación por componente.
- **Verificación manual de móvil y AA (QA-18/19, CON-12):** sin responsable ni iPhone asignados, la
  lista V-8 puede quedarse en papel; mitigación: lista obligatoria en la plantilla del PR de cada
  épica con UI y revisión en el Release Gate.
- **Hosting compartido (CON-3, QA-2):** inodos y latencia de la API no medidos; mitigación: medir tras
  el primer despliegue a staging (ADR-0007).
- **CSRF entre subdominios hermanos:** cualquier sitio de `trycore.com` comprometido es same-site;
  mitigación: token en cabecera + `Origin` exacto + cookies `__Host-` (no se pueden fijar desde otro
  subdominio) y V-5.
- **Nombres de host atados al nombre de trabajo:** si D-2 cambia el nombre del producto, cambian los
  cuatro hosts, las cookies y la configuración de Cloudflare.

**Trade-offs de negocio abiertos** (para la revisión humana)
- **Hosts anidados vs certificado de pago:** se eligen `people-panel.trycore.com` y
  `people-staging.trycore.com` para no pagar un certificado avanzado de Cloudflare. Si se prefiere
  `panel.people.trycore.com`, el coste es ese certificado recurrente.
- **Nombre definitivo (D-2):** conviene cerrarlo antes del primer despliegue a producción para no
  migrar hosts y enlaces ya enviados a clientes.
- **Quién hace la verificación manual (V-8) y con qué dispositivo:** requiere asignar persona y un
  iPhone real por release; sin eso QA-18/19 no pasan de ⚠️.
- **Retirada de la entrada por instrucción (D-17 / CRN-19):** la arquitectura la permite y la prueba;
  la decisión de retirarla sigue siendo de negocio según la regla de §14.7 del PRD.

**Operacionales**
- La compilación ocurre en CI (ADR-0007), nunca en el servidor. V-1..V-7 corren en cada PR; V-8 en
  el PR que cierra cada épica con UI.

## 7. Trazabilidad

- Drivers: [0000-drivers-y-asrs.md](0000-drivers-y-asrs.md) — UC-4, UC-5, QA-1, QA-2, QA-4
  (estructural), QA-18, QA-19, CON-1, CON-2, CON-3, CON-9, CON-12, CON-13, CON-14, CRN-19. Se apoya en
  QA-3 para el CSRF (detalle en [ADR-0002](0002-identidad-acceso-y-sesiones.md)).
- Nota para 0000: UC-4 y CON-9 mencionan «carpeta privada» como origen del catálogo; este ADR lo
  sustituye por la proyección desde la BD servida por la API autenticada (el requisito de CON-9, sin
  API abierta, no cambia).
- ADR relacionados: [0002](0002-identidad-acceso-y-sesiones.md) (sesiones, CSRF, matriz),
  [0003](0003-datos-persistencia-y-auditoria.md) (proyección del catálogo),
  [0004](0004-busqueda-determinista-y-estado.md) (motor y estado en URL),
  [0007](0007-entornos-despliegue-y-perimetro.md) (hosts por entorno, pipeline, CON-3).
- PRD §8, §8.1 (M-1..M-8), §8.2 (A-1..A-8), §8.3, §14.7, D-2, D-17, D-23 · prototipo
  `docs/07-prototipo/handoff/README.md`
- Stack operacionalizado en: `.claude/config/stack-allowlist.json` (consolidado tras la revisión única del sponsor,
  2026-09-25).

### Stack consolidado (2026-09-25)

| Ecosistema | Producción | Desarrollo |
|------------|------------|------------|
| npm | `next` 15, `react` 19, `react-dom` 19, `typescript`, `tailwindcss` 3.4, `tailwindcss-animate`, `@radix-ui/*` (primitivas de shadcn/ui), `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `nuqs`, `next-themes` | `vitest`, `@testing-library/react`, `fast-check`, `@playwright/test`, `@axe-core/playwright`, `@lhci/cli`, `eslint`, `prettier` |
| composer | `slim/slim` 4, `slim/psr7`, `phpmailer/phpmailer` 6 | `phpunit/phpunit` |

Toda dependencia fuera de esta lista la bloquea el hook `stack-guard.sh` y exige un ADR nuevo o una
enmienda a este.
