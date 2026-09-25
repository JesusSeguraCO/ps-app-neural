# Especificaciones del servidor de hosting

**Proyecto:** Portal de perfiles — línea People Service
**Última verificación:** 25 de septiembre de 2026 (servidor migrado a CloudLinux 8; valores anteriores entre paréntesis)
**Fuente:** cPanel de Trycore (paquete WP ULTIMATE V2)

---

## 1. Datos del servidor

| Ítem | Valor |
|---|---|
| Paquete de hosting | WP ULTIMATE V2 |
| Nombre del servidor | **didac** (antes: sibyl) |
| Versión de cPanel | **136.0 (build 44)** (antes: 110.0 build 142) |
| Apache | 2.4.68 |
| MariaDB | **10.6.28-MariaDB-cll-lve** (antes: 10.6.20) |
| PostgreSQL | Disponible (0 bases creadas) |
| Arquitectura | x86_64 |
| Sistema operativo | **CloudLinux 8** — kernel 4.18.0-553.150.1.lve.1.el8 (antes: CentOS 7, kernel 3.10.0, sin soporte) |
| IP compartida | **192.99.84.46** (antes: 192.99.84.55) |
| Ruta a Sendmail | /usr/sbin/sendmail |
| Perl | **5.26.3** en `/usr/bin/perl` (antes: 5.16.3) |

---

## 2. Lenguajes y entornos disponibles

### PHP

- **Versión activa: 8.3**
- Versiones disponibles en el desplegable: 5.4, 5.5, 5.6, 7.0, 7.1, 7.2, 7.3, 7.4, 8.0, 8.1, 8.2, **8.3 (actual)**, 8.4, 8.5
- Gestor: `Select PHP Version` (CloudLinux), no MultiPHP

**Extensiones activas relevantes para el proyecto:**

| Extensión | Estado | Para qué la usamos |
|---|---|---|
| `curl` | ✅ | Llamadas a la API de HubSpot |
| `json` | ✅ | Lectura del catálogo |
| `mbstring` | ✅ | Acentos y ñ |
| `session` | ✅ | Cookie tras validar el token |
| `openssl` | ✅ | HTTPS y firma de tokens |
| `filter` | ✅ | Validación de entradas |
| `random` | ✅ | Generación de tokens |
| `dom` | ✅ | Manipulación de estructuras |
| `opcache` | ✅ | Caché de bytecode |
| `pdo_pgsql` | ✅ | PostgreSQL (para Fase 2) |
| `pdo_mysql` | ✅ | MariaDB |

**No hay extensiones pendientes por activar.**

**Configuración de PHP (pestaña Options):**

| Directiva | Valor |
|---|---|
| `memory_limit` | 512M |
| `max_execution_time` | 180 |
| `max_input_time` | 60 |
| `post_max_size` | 64M |
| `upload_max_filesize` | 64M |
| `display_errors` | Off |
| `log_errors` | On |
| `allow_url_fopen` | On |
| `error_reporting` | E_ALL & ~E_DEPRECATED & ~E_STRICT |

Notas:
- `display_errors` en Off es lo correcto para producción. **No activarlo.** Para depurar, usar los logs de cPanel (sección Errors) o `error_log()`.
- `allow_url_fopen` está activo. Usar siempre `curl` para peticiones externas y **nunca** `file_get_contents()` con URLs que provengan de parámetros del usuario.
- Los límites de memoria y tiempo son muy holgados para este proyecto; no se van a alcanzar.

### Node.js

- Gestor: `Setup Node.js App` (Passenger)
- Versiones disponibles: 9.11.2, 16.20.2, 18.20.8, **20.20.2 (recomendada)**
- Soporta variables de entorno para secretos
- `Application mode` por defecto en Development — cambiar a Production si se usa en real

Node **no participa en la v1**. Queda disponible para la Fase 2.

**Confirmado con soporte de Dongee (septiembre 2026):** el modelo de Node como API headless para uso administrativo interno —pocos editores, sin tráfico público hacia Node— encaja en el hosting compartido y es un uso típico del entorno. La app se despliega desde `Setup Node.js App`, se configura en modo Production y corre como servicio separado del sitio estático.

Implicación a anticipar: al correr como servicio separado, la app Node y el portal estático quedan en rutas distintas. Habrá que resolver CORS entre ambas, o montar la app bajo el mismo dominio con una regla de reescritura.

Advertencia de dimensionamiento: si Directus fuera a servir tráfico público directo, el proveedor recomendaría un VPS. El caso validado es exclusivamente API interna con frontend público estático.

### Otros entornos disponibles

Python (Setup Python App), Ruby (Setup Ruby App), Application Manager, Perl 5.16.3.

---

## 3. Control de versiones y despliegue

**Git Version Control disponible en cPanel** (`docs.cpanel.net/cpanel/files/git-version-control/`)

Capacidades:
- Alojar repositorios Git en la cuenta
- Clonar un repo existente, crear uno nuevo, o adoptar uno ya presente
- Despliegue mediante archivo `.cpanel.yml` + botón `Deploy HEAD Commit`
- Muestra commit HEAD y datos del último despliegue (fecha, SHA, autor)
- Gitweb para navegar el historial
- El sistema deniega globalmente el acceso público a los directorios `.git`

Restricciones a tener en cuenta:
- **El directorio del repositorio debe estar vacío al crearlo.** Los directorios de subdominio traen `cgi-bin` y a veces `.well-known` — hay que moverlos antes.
- Sin acceso a shell solo se puede crear, clonar, borrar y ver repositorios. El despliegue por botón sí funciona sin shell.
- El `.cpanel.yml` debe vivir en el repositorio remoto, no en el gestionado por cPanel.
- No se puede desplegar con el árbol de trabajo sucio — no editar archivos directamente en el servidor.

**Flujo de trabajo decidido:** local → push a GitHub → `Update from Remote` → `Deploy` en cPanel.

---

## 4. Cuotas y consumo actual

| Recurso | Uso | Límite | % |
|---|---|---|---|
| Procesos de entrada | 1 | 150 | 0.67% |
| Número de procesos | 1 | 200 | 0.5% |
| Memoria física | 316 MB | 6 GB | 5.15% |
| Uso de CPU | 0 | 100 | 0% |
| IOPS | 0 | 1,024 | 0% |
| Uso de E/S | 0 | 10 MB/s | 0% |
| **Inodos** | **124,759** | **600,000** | **20.79%** |
| Espacio en disco | 8.18 GB | 70 GB | 11.68% |
| Bases MySQL | 8 | 100 | 8% |
| Disco MySQL | 268.99 MB | 62.09 GB | 0.42% |
| Bases PostgreSQL | 0 | 100 | 0% |
| Disco PostgreSQL | 0 | 61.82 GB | 0% |
| Subdominios | 19 | 50 | 38% |
| Dominios adicionales | 5 | 50 | 10% |
| Cuentas FTP | 3 | 10 | 30% |
| Cuentas de correo | 0 | 20 | 0% |
| Ancho de banda | 5.75 GB | ∞ | — |

### ⚠️ Alerta única: inodos

Un inodo es un archivo. Ya hay 20% consumido con un WordPress y 5 dominios adicionales.

**Regla:** nunca subir `node_modules` al hosting — puede meter entre 20.000 y 40.000 archivos. Solo se sube el build compilado. Si se desarrolla local con npm, la carpeta de trabajo no debe vivir dentro del servidor.

### Capacidad confirmada

Con 150 procesos de entrada y 200 procesos totales, un envío de boletín con aperturas escalonadas no representa riesgo. La preocupación inicial sobre límites de CloudLinux queda descartada.

---

## 5. Acceso y seguridad

### SSH

**`SSH Access` y `Terminal` están disponibles en cPanel.** `Terminal` (Advanced) confirma que el shell está habilitado — no requiere ticket ni configuración previa. `SSH Access` permite generar y autorizar llaves para conectarse desde el equipo local, que es lo preferible para desarrollar.

Lo que habilita el shell:
- Git desde línea de comandos, no solo por botón
- `git pull` y despliegue sin pasar por la interfaz
- Logs de PHP en vivo con `tail -f`
- Verificación directa de permisos y rutas al configurar el `.cpanel.yml`

### Seguridad disponible

| Herramienta | Nota para el proyecto |
|---|---|
| **SSL/TLS Status** | Verificar que AutoSSL emitió certificado para el subdominio del portal antes del primer envío |
| **ModSecurity** | Activo. Puede dar falsos positivos que bloqueen peticiones POST legítimas. **Primer sospechoso si el formulario de solicitud falla sin razón aparente.** Revisable por dominio |
| **IP Blocker** | Útil si alguien prueba tokens en masa. Cloudflare lo hace mejor |
| Imunify360, Monarx Security | Antimalware del servidor |
| Two-Factor Authentication | Recomendado para la cuenta de cPanel |
| Hotlink / Leech Protection | No aplican al proyecto |

### Herramientas avanzadas (sección Advanced)

| Herramienta | Nota para el proyecto |
|---|---|
| **Terminal** | Shell en el navegador. Confirma que el acceso a línea de comandos está habilitado |
| **Cron Jobs** | Disponible. Habilita alertas por criterio automáticas, recordatorio de revisión de disponibilidad antes de cada boletín, y regeneración programada del JSON. ~~No se usa en v1~~ **Se usa desde la v1** (PRD v4.9 §8.3, 2026-09-24): reintento a HubSpot cada 5 min, escalamiento cada 15 min, sincronización diaria. *Pendiente verificar con Dongee:* intervalo mínimo y número de tareas admitidas |
| **Indexes** | Desactivar el listado de directorios. Un clic, cierra el hueco de exponer archivos en carpetas sin `index.html` |
| **Error Pages** | Páginas 404 y 403 propias. La SPA va a generar rutas inexistentes; un error genérico de Apache en un flujo que llegó por correo se ve mal. Prioridad baja |
| Apache Handlers, MIME Types | No aplican |
| Track DNS | Solo si el subdominio no resuelve |

### Otras herramientas disponibles

- **Cloudflare** — gratis. Recomendado: caché en CDN para estáticos, IP del servidor oculta, y límites de peticiones sobre el endpoint del token.
- phpMyAdmin, phpPgAdmin, Remote MySQL
- Softaculous Apps Installer, WordPress Manager
- AccelerateWP, Optimize Website, X-Ray App
- PHP PEAR Packages, Perl Modules

---

## 6. Qué habilita este servidor

| Funcionalidad | Estado |
|---|---|
| Catálogo, filtros, ficha, selección | ✅ |
| Micro-calificación → HubSpot | ✅ |
| Eventos de comportamiento | ✅ |
| Token de cuenta real (no decorativo) | ✅ |
| JSON del catálogo fuera del webroot | ✅ |
| Nombre visible solo tras identificación | ✅ |
| Llave de API oculta del navegador | ✅ |
| Alertas por criterio con envío periódico | ✅ (vía Cron Jobs) |
| Histórico de qué vio cada cliente | ✅ (vía MariaDB o PostgreSQL) |
| CMS headless para que TH edite (Fase 2) | ✅ (Directus sobre Node 20 + PostgreSQL) |

### Techo del servidor

No soporta: procesos de larga duración, websockets, colas de trabajo, búsqueda semántica o vectorial, sincronización en tiempo real con sistemas internos. Eso corresponde a Fase 3 y requeriría salir del hosting.

### Nota sobre antigüedad

~~El kernel es CentOS 7, que llegó a fin de vida en 2024 y no recibe parches del sistema operativo.~~ **Resuelto el 2026-09-25:** el servidor se migró a CloudLinux 8 (kernel el8), que tiene soporte vigente.

Node 20 también salió de su ventana de soporte oficial. Los majors nuevos de Directus y Strapi se están moviendo a Node 22 — verificar el desplegable cuando se llegue a la Fase 2.

---

## 7. Verificaciones posteriores (2026-09-25)

Confirmado por Jesús Segura desde cPanel.

| Tema | Resultado | Pendiente |
|---|---|---|
| **Cron Jobs** | Editor estándar con campo de minuto libre: admite `*/5` y `*/15`. Binario PHP indicado por cPanel: `/usr/local/bin/php`. Home de la cuenta: `/home6/trycorec/`. El cron envía por correo su salida: cada tarea debe redirigirla a un log o a `/dev/null` | ✅ `/usr/local/bin/php -v` → PHP 8.3.33 (CLI). ✅ Dongee: frecuencia y número de tareas personalizables |
| **Carpeta fuera de `public_html`** | Sí: el subdominio `people.trycore.com` puede apuntar a una carpeta fuera de `public_html`. Esa carpeta es la **raíz pública** del portal; los datos privados (catálogo, secretos, evidencia) van en **otra carpeta hermana** que ningún subdominio sirve | — |
| **Correo** | `trycore.com` sigue en Google Workspace, independiente. `people.trycore.com` tiene MX propio en el hosting y buzón `notify@people.trycore.com`: **desde webmail (SMTP autenticado) el envío funciona**. Desde la Terminal con `sendmail` el mensaje no llegó: el portal enviará por **SMTP autenticado** con ese buzón, el mismo camino que ya funciona | Límite de envíos: no se verifica, el volumen esperado es bajo (decisión del sponsor, 2026-09-25). ✅ SPF, DKIM y DNS verificados con la IP nueva (2026-09-25). Pendiente: lista negra de 192.99.84.46 |
| **Respaldos** | JetBackup 5: copias **diarias** (se conservan unos 4 días) y **semanales** (unas 3 semanas). Pérdida máxima ante un fallo: un día de datos | La restauración es autoservicio, a demanda. ⚠️ **Las copias se guardan en el mismo servidor**: si el servidor se pierde, se pierden con él. Riesgo aceptado por el sponsor (2026-09-25). Pendiente: restauración de prueba antes de producción |

| **Salida HTTPS** | ✅ `curl` a `api.hubapi.com` → 302 y a `api.anthropic.com` → 404: hay conexión saliente | — |
| **Sistema operativo** | ✅ **Migrado a CloudLinux 8** el 2026-09-25 (servidor didac, IP 192.99.84.46) | ✅ SPF/DKIM y DNS re-verificados. Pendiente: PHP y ruta de home en el servidor nuevo (`php -v`, `pwd`) |

**Nota crítica sobre el correo.** Los códigos del panel van a buzones `@trycore.com`, que viven en Google Workspace. Si cPanel tiene `trycore.com` configurado como dominio *local*, el servidor entrega esos correos en un buzón interno que no existe y nunca llegan a Google. En *Email Routing* de `trycore.com` debe figurar **Remote Mail Exchanger**.

