---
artefacto: backlog
proyecto: portal-people-service
version: 5.3
fecha: 2026-09-25
prd_version: 4.10
epicas_version: 5.3
historias_escritas: 79
historias_descartadas: 1
---

# Backlog consolidado — Portal de Perfiles People Service

> **Este es el documento vivo del proyecto.** Cada iteración lo actualiza; no se reescribe desde cero.
> Para el detalle de cada historia, abrir su archivo en `docs/04-historias/`.

## Estado de los artefactos

| Artefacto | Versión | Dónde |
|---|---|---|
| PRD | **4.8** | `docs/01-prd/portal-people-service.md` |
| Épicas | **5.2** — 11 épicas, con requisitos por épica | `docs/03-backlog/epicas.md` |
| Mapa de historias | **2.0** — regenerado sobre PRD 4.5 con IDs reales | `docs/02-user-story-map/portal-people-service.md` |
| Historias escritas | **79** activas, 1 descartada | `docs/04-historias/` |
| Prototipo Low-Fi (v1) | entregado | `prototipo-portal-people-service.html` |
| Prototipo Mid-Fi (v2) | entregado, con llamada real al modelo | `prototipo-midfi-portal-people-service.html` |
| Auditoría de usabilidad (Krug) | 1.0 — 7 hallazgos corregidos | `docs/08-usabilidad/auditoria-krug.md` |
| Escalamiento de decisiones | 1.0 — por equipo | `docs/09-escalamiento/solicitudes-por-equipo.md` |
| Spec · Enlaces curados | 1.0 — construida | `docs/10-specs/enlaces-curados.md` |
| Spec · Importación masiva | 2.0 — especificada, no construida | `docs/10-specs/importacion-masiva.md` |
| **Especificación consolidada** | generada · documento de construcción por épicas | `docs/ESPECIFICACION-CONSOLIDADA.md` |

## Historias escritas con criterios de aceptación

Corresponden a la **Fase 2 de diseño** (PRD §13) y a los ajustes que esa fase introdujo en épicas anteriores.

| ID | Título | Épica | Prioridad | Compl. | Estado | Condición o bloqueo |
|---|---|---|---|---|---|---|
| **HU-065** | Buscar escribiendo lo que necesito en mis propias palabras | EP-009 | alta | M | borrador | — |
| **HU-066** | Arrancar desde una sugerencia en lugar de un campo vacío | EP-009 | alta | S | borrador | — |
| **HU-067** | Pegar el requerimiento que ya tengo escrito | EP-009 | media | M | borrador | Condicionada a la prueba previa de RF-12.2 |
| **HU-068** | Ver cómo el portal entendió lo que pedí | EP-009 | alta | S | borrador | — |
| **HU-069** | Corregir la interpretación sin volver a escribir | EP-009 | alta | S | borrador | — |
| **HU-070** | Revisar y ajustar la especificación de lo que necesito | EP-009 | alta | L | borrador | — |
| **HU-071** | Responder una pregunta de afinamiento sin perder lo que ya veo | EP-009 | media | M | borrador | — |
| **HU-072** | Seguir usando el portal cuando la interpretación falla | EP-009 | alta | S | borrador | — |
| **HU-073** | Encontrar mi especificación como la dejé | EP-009 | media | M | borrador | Bloqueada por D-16 |
| **HU-074** | Refinar con filtros lo que la instrucción me devolvió | EP-002 | alta | S | borrador | — |
| **HU-075** | Entender qué pedí cuando no hay nada que mostrar | EP-010 | alta | M | borrador | — |
| **HU-076** | Ver alternativas solo cuando de verdad se parecen | EP-010 | alta | M | borrador | — |
| **HU-077** | Pedir el perfil que no existe todavía | EP-010 | alta | M | borrador | — |
| **HU-078** | Saber qué están pidiendo las cuentas y no tenemos | EP-010 | alta | M | borrador | — |
| **HU-079** | Reconocer de un vistazo qué ha logrado un perfil | EP-003 | n/a | M | **descartada** | DESCARTADA el 2026-09-14 por cierre de D-15 |
| **HU-080** | Ver qué le falta al equipo que estoy armando | EP-004 | media | M | borrador | — |
| **HU-081** | Distinguir un perfil de otro por sus competencias verificadas | EP-003 | alta | S | borrador | — |
| **HU-082** | Decir en qué país y ciudad necesito el perfil | EP-009 | alta | S | borrador | — |
| **HU-083** | Decir qué tiene que estar funcionando cuando el proyecto termine | EP-009 | alta | M | borrador | — |
| **HU-084** | Ver la forma típica del trabajo que estoy por emprender | EP-004 | media | M | borrador | Bloqueada por D-19 |
| **HU-085** | Ajustar mi especificación con las opciones que el banco realmente tiene | EP-009 | alta | M | borrador | — |
| **HU-086** | Pegar mi hoja de cálculo y ver qué va a pasar | EP-006 | media | M | prototipado | *Dividida el 22-sep en 086 + 141 + 142* |
| **HU-087** | Deshacer una importación que salió mal | EP-006 | media | M | prototipado | — |
| **HU-088** | Descargar una plantilla o el banco para editarlo y devolverlo | EP-006 | media | S | prototipado | — |
| **HU-089** | Crear valores de catálogo sin duplicar los que ya existen | EP-006 | alta | M | prototipado | *Dividida el 22-sep en 089 + 143* |
| **HU-090** | Entrar al portal desde el correo sin registrarme | EP-001 | alta | M | borrador | — |
| **HU-091** | Reconocer que la selección se armó para mi proyecto | EP-001 | alta | S | borrador | — |
| **HU-092** | Recuperar el acceso cuando el enlace venció | EP-001 | alta | S | borrador | — |
| **HU-093** | Entrar sin una selección previa y ser encuadrado | EP-001 | media | S | borrador | — |
| **HU-094** | Volver a la selección después de explorar | EP-001 | alta | S | borrador | — |
| **HU-095** | Compartir el enlace con un colega | EP-001 | media | S | borrador | — |
| **HU-096** | Revisar mi equipo antes de pedirlo | EP-005 | alta | M | borrador | — |
| **HU-097** | Identificarme cuando no soy quien recibió el correo | EP-005 | alta | S | borrador | — |
| **HU-098** | Saber qué pasa después de enviar | EP-005 | alta | S | borrador | — |
| **HU-099** | Agendar la sesión de alineación | EP-005 | media | M | borrador | — |
| **HU-100** | Ser advertido si intento pedir sin haber elegido nada | EP-005 | media | S | borrador | — |
| **HU-101** | Recibir la solicitud con contexto suficiente para preparar la sesión | EP-005 | alta | M | borrador | — |
| **HU-102** | Recibir la oportunidad en mi pipeline | EP-007 | alta | M | borrador | — |
| **HU-103** | Enterarme de una solicitud sin tener que vigilar el pipeline | EP-007 | alta | M | borrador | — |
| **HU-104** | Que no se me duplique la empresa en el CRM | EP-007 | alta | S | borrador | — |
| **HU-105** | Recuperar una solicitud cuya integración falló | EP-007 | alta | M | borrador | — |
| **HU-106** | Distinguir lo que entra por el portal de lo que entra por gestión | EP-007 | alta | S | borrador | — |
| **HU-107** | Registrar cuándo se agendó la alineación | EP-007 | alta | S | borrador | — |
| **HU-108** | Ver el embudo de cada cuenta | EP-008 | media | M | borrador | — |
| **HU-109** | Ver si la curaduría acierta | EP-008 | alta | S | borrador | — |
| **HU-110** | Ver qué filtros usan realmente los clientes | EP-008 | alta | S | borrador | *Reescrita el 22-sep: antes duplicaba HU-078* |
| **HU-111** | Comparar la ruta de instrucción con la de filtros | EP-008 | media | M | borrador | — |
| **HU-112** | Atribuir cada sesión a su envío de correo | EP-008 | alta | S | borrador | — |
| **HU-113** | Armar la selección de perfiles de una cuenta | EP-011 | alta | M | borrador | — |
| **HU-114** | Generar el enlace de cada contacto sin construirlo a mano | EP-011 | alta | S | borrador | — |
| **HU-115** | Programar y enviar el boletín | EP-011 | alta | M | borrador | — |
| **HU-116** | Ver quién abrió y quién entró | EP-011 | alta | S | borrador | — |
| **HU-117** | Reaccionar a una cuenta que nunca abre | EP-011 | media | S | borrador | — |
| **HU-118** | Distinguir lo que no puedo negociar de lo que sería bueno tener | EP-009 | alta | M | prototipado | — |
| **HU-119** | Saber por qué coincide cada perfil y por qué no | EP-003 | alta | S | prototipado | — |
| **HU-120** | Comparar perfiles sin perder la lista | EP-003 | alta | M | prototipado | — |
| **HU-121** | Comparar muchos perfiles por el mismo criterio | EP-002 | alta | M | prototipado | — |
| **HU-122** | Generar un enlace con exactamente los perfiles que elegí | EP-001 | alta | S | prototipado | *Dividida el 22-sep en 122 + 144* |
| **HU-123** | Entrar al panel con mi correo corporativo | EP-006 | alta | M | borrador | Sin proveedor de identidad: correo inscrito + código (D-22 rev. 2026-09-24) |
| **HU-124** | Consultar el banco sin poder modificarlo | EP-006 | media | S | borrador | Depende de HU-123 |
| **HU-125** | Crear un perfil eligiendo del catálogo | EP-006 | alta | M | borrador | — |
| **HU-126** | Editar un perfil publicado sin sorpresas | EP-006 | alta | M | borrador | — |
| **HU-127** | Registrar el consentimiento nominal del profesional | EP-006 | alta | M | borrador | Exige recoger de nuevo el consentimiento del banco existente |
| **HU-128** | Ser bloqueada si intento publicar sin consentimiento | EP-006 | alta | S | borrador | Depende de HU-127 |
| **HU-129** | Previsualizar la ficha exactamente como la verá el cliente | EP-006 | alta | S | borrador | — |
| **HU-130** | Publicar un perfil sin esperar el reporte detallado | EP-006 | alta | S | borrador | — |
| **HU-131** | Adjuntar el artefacto de evidencia tal como lo tengo | EP-006 | media | M | borrador | *Dividida el 22-sep* |
| **HU-132** | Actualizar la disponibilidad en dos clics | EP-006 | alta | S | borrador | Condición operativa de O5 |
| **HU-133** | Pausar un perfil declarando el motivo | EP-006 | alta | S | borrador | — |
| **HU-134** | Corregir incoherencias entre estado y disponibilidad | EP-006 | alta | M | borrador | — |
| **HU-135** | Archivar un perfil sin perder su rastro | EP-006 | media | S | borrador | — |
| **HU-136** | Revisar la bandeja de vigencia | EP-006 | alta | S | borrador | Instrumento de O5 |
| **HU-137** | Ver los perfiles colocados y sus vencimientos | EP-006 | media | M | borrador | Depende del sistema de asignación |
| **HU-138** | Consultar quién cambió qué y cuándo | EP-006 | alta | M | borrador | Depende de HU-123 |
| **HU-139** | Administrar el léxico de búsqueda | EP-006 | media | M | borrador | — |
| **HU-140** | Obtener un borrador de los campos desde el artefacto | EP-006 | media | L | borrador | Depende de HU-131 · candidata a v2 |
| **HU-141** | Confirmar la importación sabiendo qué campos toca | EP-006 | media | M | borrador | Depende de HU-086 |
| **HU-142** | Corregir solo las filas que fallaron | EP-006 | media | S | borrador | Depende de HU-141 |
| **HU-143** | Retirar y fusionar valores sin romper los perfiles que los usan | EP-006 | media | M | borrador | Depende de HU-089 |
| **HU-144** | Abrir el enlace y encontrar la selección que me armaron | EP-001 | alta | S | borrador | Depende de HU-122 |

## Historias anticipadas sin redactar

Reservadas en el mapa de historias. Se redactan cuando entren en construcción.

| Rango | Alcance | Épica | Release |
|---|---|---|---|
| HU-001 – HU-016 | Acceso, aterrizaje curado y selección | EP-001 | MVP |
| HU-017 – HU-018 | Búsqueda por texto y ordenamiento | EP-002 | **Superadas** por HU-065 y HU-074 |
| HU-019 – HU-020 | Sondeo de agentes autónomos en el grid | EP-002 | MVP |
| HU-021 – HU-028 | Tarjeta, ficha y evidencia de validación | EP-003 | MVP |
| HU-029 – HU-034 | Mi equipo, resumen y comparador | EP-004 | MVP · comparador en v1.1 |
| HU-035 – HU-041 | Solicitud, identificación y confirmación | EP-005 | MVP |
| HU-042 – HU-058 | Panel de Talento Humano: inventario, validación, publicación y mantenimiento | EP-006 | **Redactadas el 2026-09-21** como HU-123 a HU-139 |
| HU-059 – HU-064 | Distribución, oportunidad en HubSpot y medición | EP-007 · EP-008 | MVP · tablero en v1.1 |

## Decisiones que bloquean backlog

**Ninguna.** D-16 y D-19 se cerraron el 2026-09-21 y con ellas se fue el último bloqueo. Quedan dos decisiones abiertas y ninguna detiene construcción: **D-2** (nombre del portal, afecta diseño visual) y **D-5** (detalle de la ficha, cuyo VoBo Talento Humano condicionó a ver primero la propuesta).

El backlog ya no espera a nadie. Lo que lo limita ahora es lo que no está escrito, no lo que no está decidido.

## Decisiones cerradas que ya no se rediscuten

| Decisión | Resolución |
|---|---|
| **D-1** Identificación del perfil | Nombre y primer apellido visibles, capacidad como descriptor, código al pie, sin fotografía |
| **D-4** Control de acceso del cliente | Enlace firmado + lista nominal de correos invitados + código al buzón, una vez por dispositivo, sin proveedor de identidad. Reenviar no da acceso; el colega se invita con aprobación de Talento Humano |
| **D-22** Acceso al panel | Correo `@trycore.com` inscrito + código de un uso + sesión de una jornada, con rol administrador y rol observador; sin proveedor de identidad |
| **D-23** Plataforma de la v1 | Hosting compartido de Trycore: estático + PHP 8.3 + MariaDB + tareas programadas (PRD §8.3) |
| **D-18** Ubicación del profesional | Solo país publicado; la ciudad se carga y se cruza en la alineación |
| **D-20** Vista de banco para el comercial | Diferida hasta que exista una necesidad observada |
| **D-21** Etapas del pipeline de la línea | Las del pipeline comercial vigente, con entrada excluida del pronóstico |
| **D-6** Qué se crea en HubSpot | Negocio en pipeline propio de la línea, con propiedad de origen |
| **D-7** Si la cuenta ya tiene negocio abierto | Uno nuevo, asociado como relacionado |
| **D-9** Rango de tarifa | No, en ningún caso. Ni por perfil ni por célula |
| **D-17** Qué pasa si gana la hipótesis rival | Regla asimétrica: el rediseño se sostiene salvo victoria clara de la lista (§14.7) |
| **D-11** Umbral del sondeo de agentes | 5 cuentas con sí y 2 que piden detalle, en 3 boletines |
| **D-12** Mínimo de resultados para el espacio no-perfil | 8 resultados visibles |
| **D-13** Dueño y cadencia del registro de demanda | Talento Humano, revisión mensual |
| **D-14** Umbral de similitud del camino del cero | Sin umbral numérico: fallar exactamente un criterio, diciendo cuál |
| **D-16** Persistencia del Perfil Objetivo | **Por dispositivo, no por cuenta.** Queda en el navegador de quien la escribió. Sin implicación ISO 27000. Un enlace reenviado no arrastra especificación |
| **D-19** Composiciones de referencia | **Solo los tres tipos de proyecto más frecuentes.** Delivery entrega esas tres composiciones reales; fuera de ellas el portal calla |
| **D-10** Disponibilidad y vínculo laboral | **El portal no comunica el vínculo laboral** y publica un solo lenguaje de disponibilidad: banda de arranque (Inmediato, 1 semana, 2 semanas, 1 mes, Más de 1 mes), derivada de la fecha del panel. RF-3.13 nuevo; RF-3.3 reescrito |
| **D-18** Ubicación del profesional | *Revisada:* país siempre; **ciudad publicada solo en necesidad Presencial 100% o Híbrido** |
| **D-8** Alcance del panel en v1 | **CRUD completo.** El panel entra al MVP con todo el alcance. Desbloquea HU-086 y HU-087 |
| **D-3** Umbral de perfiles para producción | **25 perfiles publicados**, como condición de salida a producción |
| **D-5** Detalle de la trayectoria | Perfil profesional reescrito + Sello Personal + experiencia despersonalizada. **VoBo condicionado a ver la propuesta de ficha** (2026-09-18) |
| **D-15** Ranking por logro cuantificado | **No procede.** El dato no existe en el banco, su extracción es recurrente y es autoreportado. Lo reemplaza el Sello Personal |

## Visión documentada, no aprobada

**§14 del PRD — la bifurcación.** Dos rutas de entrada con profundidad comparable: buscar un perfil o armar el equipo por reto. No está estimada ni aprobada; está documentada para que las decisiones de hoy no la cierren.

Cuatro requisitos del MVP existen para no cerrarla, y ninguno cuesta trabajo adicional ahora: **RF-16.4** (el rol nace como lista), **RF-16.3** (especificación y recuperación separadas), **RF-15.1** (el registro guarda también los perfiles seleccionados) y tratar "Mi equipo" como embrión de célula y no como carrito.

**Disparador:** 50 solicitudes con dos o más perfiles y reto declarado, o 3 composiciones reales validadas por Delivery.

## Próximo paso del pipeline

Priorización formal del backlog (`/trycore:priorizar`). Antes conviene correr las **tres sesiones con clientes** de PRD §13.6: sus resultados cambian la prioridad de HU-065 a HU-074 y pueden retirar la mitad de la Fase 2.
