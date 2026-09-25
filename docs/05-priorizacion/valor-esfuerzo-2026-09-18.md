---
artefacto: priorizacion
proyecto: portal-people-service
framework: valor-esfuerzo
version: 2.2
fecha: 2026-09-22
prd_version: 4.8
epicas_version: 5.2
backlog_version: 5.2
historias_priorizadas: 79
historias_descartadas: 1
---

# Priorización — Portal de Perfiles People Service

> **Framework**: Valor / Esfuerzo (matriz 2×2)
> **Fecha**: 2026-09-18
> **Participantes**: sesión asistida sobre el backlog v4.0. **Pendiente de validación** con Jesús Segura (Mercadeo), Karen (Talento Humano) y Jonathan (CTO).

## Contexto de la sesión

Primera priorización formal del backlog. Se corre ahora porque el backlog acumuló 57 historias activas a través de cinco versiones de PRD sin que nadie declarara un orden, y porque el mapa de historias se acababa de regenerar sobre el PRD 4.5: hasta ese momento la vista de releases apuntaba a un espacio de IDs que no existía.

Se buscaban tres decisiones: **qué entra al MVP**, **qué historias no justifican su esfuerzo** y **cuánto del backlog está bloqueado por decisiones abiertas**.

**Advertencia de método.** Esta sesión no reemplaza las tres sesiones con clientes de PRD §13.6. Sus resultados pueden mover la prioridad de HU-065 a HU-074 y, bajo la regla asimétrica de §14.7, retirar parte de la Fase 2. Priorizar antes de esas sesiones sirve para ordenar la construcción, no para cerrarla.

---

## Escalas

**Valor** — se toma la prioridad declarada en el backlog, que ya incorpora cobertura de objetivos y riesgo:
`alta` → alto valor · `media` → bajo valor.

**Esfuerzo** — se toma la complejidad declarada, con pesos para poder sumar:
`S` = 1 pt (bajo) · `M` = 3 pts (alto) · `L` = 8 pts (alto).

**Total del backlog activo: 173 pts sobre 79 historias.**

---

## Matriz

```
                         Alto valor
                              │
        QUICK WINS            │           BIG BETS
        29 historias · 29 pts │    26 historias · 83 pts
        17% del esfuerzo      │    48% del esfuerzo
                              │
    ──────────────────────────┼──────────────────────────
                              │
        RELLENO               │           CUESTIONAR
        8 historias · 8 pts   │    16 historias · 53 pts
        5% del esfuerzo       │    31% del esfuerzo
                              │
                         Bajo valor
    Bajo esfuerzo (S)  ←──────┼──────→  Alto esfuerzo (M · L)
```

---

## Quick wins — 29 historias · 29 pts (17% del esfuerzo)

*alto valor · bajo esfuerzo.* Se construyen primero. Cada una cierra un comportamiento observable por 1 pt.

| ID | Historia | Épica | Esf. | Estado |
|---|---|---|---|---|
| **HU-091** | Reconocer que la selección se armó para mi proyecto | EP-001 | S | borrador |
| **HU-092** | Recuperar el acceso cuando el enlace venció | EP-001 | S | borrador |
| **HU-094** | Volver a la selección después de explorar | EP-001 | S | borrador |
| **HU-122** | Generar un enlace con exactamente los perfiles que elegí | EP-001 | S | prototipado |
| **HU-144** | Abrir el enlace y encontrar la selección que me armaron | EP-001 | S | borrador |
| **HU-074** | Refinar con filtros lo que la instrucción me devolvió | EP-002 | S | borrador |
| **HU-081** | Distinguir un perfil de otro por sus competencias verificadas | EP-003 | S | borrador |
| **HU-119** | Saber por qué coincide cada perfil y por qué no | EP-003 | S | prototipado |
| **HU-097** | Identificarme cuando no soy quien recibió el correo | EP-005 | S | borrador |
| **HU-098** | Saber qué pasa después de enviar | EP-005 | S | borrador |
| **HU-128** | Ser bloqueada si intento publicar sin consentimiento | EP-006 | S | borrador |
| **HU-129** | Previsualizar la ficha exactamente como la verá el cliente | EP-006 | S | borrador |
| **HU-130** | Publicar un perfil sin esperar el reporte detallado | EP-006 | S | borrador |
| **HU-132** | Actualizar la disponibilidad en dos clics | EP-006 | S | borrador |
| **HU-133** | Pausar un perfil declarando el motivo | EP-006 | S | borrador |
| **HU-136** | Revisar la bandeja de vigencia | EP-006 | S | borrador |
| **HU-104** | Que no se me duplique la empresa en el CRM | EP-007 | S | borrador |
| **HU-106** | Distinguir lo que entra por el portal de lo que entra por gestión | EP-007 | S | borrador |
| **HU-107** | Registrar cuándo se agendó la alineación | EP-007 | S | borrador |
| **HU-109** | Ver si la curaduría acierta | EP-008 | S | borrador |
| **HU-110** | Ver qué filtros usan realmente los clientes | EP-008 | S | borrador |
| **HU-112** | Atribuir cada sesión a su envío de correo | EP-008 | S | borrador |
| **HU-066** | Arrancar desde una sugerencia en lugar de un campo vacío | EP-009 | S | borrador |
| **HU-068** | Ver cómo el portal entendió lo que pedí | EP-009 | S | borrador |
| **HU-069** | Corregir la interpretación sin volver a escribir | EP-009 | S | borrador |
| **HU-072** | Seguir usando el portal cuando la interpretación falla | EP-009 | S | borrador |
| **HU-082** | Decir en qué país y ciudad necesito el perfil | EP-009 | S | borrador |
| **HU-114** | Generar el enlace de cada contacto sin construirlo a mano | EP-011 | S | borrador |
| **HU-116** | Ver quién abrió y quién entró | EP-011 | S | borrador |

## Big bets — 26 historias · 83 pts (48% del esfuerzo)

*alto valor · esfuerzo alto.* El núcleo del producto. Se construyen, pero con su prueba de falsación a la vista.

| ID | Historia | Épica | Esf. | Estado |
|---|---|---|---|---|
| **HU-090** | Entrar al portal desde el correo sin registrarme | EP-001 | M | borrador |
| **HU-121** | Comparar muchos perfiles por el mismo criterio | EP-002 | M | prototipado |
| **HU-120** | Comparar perfiles sin perder la lista | EP-003 | M | prototipado |
| **HU-096** | Revisar mi equipo antes de pedirlo | EP-005 | M | borrador |
| **HU-101** | Recibir la solicitud con contexto suficiente para preparar la sesión | EP-005 | M | borrador |
| **HU-089** | Crear valores de catálogo sin duplicar los que ya existen | EP-006 | M | prototipado |
| **HU-123** | Entrar al panel con mi cuenta corporativa | EP-006 | M | borrador |
| **HU-125** | Crear un perfil eligiendo del catálogo | EP-006 | M | borrador |
| **HU-126** | Editar un perfil publicado sin sorpresas | EP-006 | M | borrador |
| **HU-127** | Registrar el consentimiento nominal del profesional | EP-006 | M | borrador |
| **HU-134** | Corregir incoherencias entre estado y disponibilidad | EP-006 | M | borrador |
| **HU-138** | Consultar quién cambió qué y cuándo | EP-006 | M | borrador |
| **HU-102** | Recibir la oportunidad en mi pipeline | EP-007 | M | borrador |
| **HU-103** | Enterarme de una solicitud sin tener que vigilar el pipeline | EP-007 | M | borrador |
| **HU-105** | Recuperar una solicitud cuya integración falló | EP-007 | M | borrador |
| **HU-065** | Buscar escribiendo lo que necesito en mis propias palabras | EP-009 | M | borrador |
| **HU-070** | Revisar y ajustar la especificación de lo que necesito | EP-009 | L | borrador |
| **HU-083** | Decir qué tiene que estar funcionando cuando el proyecto termine | EP-009 | M | borrador |
| **HU-085** | Ajustar mi especificación con las opciones que el banco realmente tiene | EP-009 | M | borrador |
| **HU-118** | Distinguir lo que no puedo negociar de lo que sería bueno tener | EP-009 | M | prototipado |
| **HU-075** | Entender qué pedí cuando no hay nada que mostrar | EP-010 | M | borrador |
| **HU-076** | Ver alternativas solo cuando de verdad se parecen | EP-010 | M | borrador |
| **HU-077** | Pedir el perfil que no existe todavía | EP-010 | M | borrador |
| **HU-078** | Saber qué están pidiendo las cuentas y no tenemos | EP-010 | M | borrador |
| **HU-113** | Armar la selección de perfiles de una cuenta | EP-011 | M | borrador |
| **HU-115** | Programar y enviar el boletín | EP-011 | M | borrador |

## Cuestionar — 16 historias · 53 pts (31% del esfuerzo)

*bajo valor · esfuerzo alto.* El cuadrante caro. Cada una necesita justificarse o dividirse.

| ID | Historia | Épica | Esf. | Estado |
|---|---|---|---|---|
| **HU-080** | Ver qué le falta al equipo que estoy armando | EP-004 | M | borrador |
| **HU-084** | Ver la forma típica del trabajo que estoy por emprender | EP-004 | M | borrador |
| **HU-099** | Agendar la sesión de alineación | EP-005 | M | borrador |
| **HU-086** | Pegar mi hoja de cálculo y ver qué va a pasar | EP-006 | M | prototipado |
| **HU-087** | Deshacer una importación que salió mal | EP-006 | M | prototipado |
| **HU-131** | Adjuntar el artefacto de evidencia tal como lo tengo | EP-006 | M | borrador |
| **HU-137** | Ver los perfiles colocados y sus vencimientos | EP-006 | M | borrador |
| **HU-139** | Administrar el léxico de búsqueda | EP-006 | M | borrador |
| **HU-140** | Obtener un borrador de los campos desde el artefacto | EP-006 | L | borrador |
| **HU-141** | Confirmar la importación sabiendo qué campos toca | EP-006 | M | borrador |
| **HU-143** | Retirar y fusionar valores sin romper los perfiles que los usan | EP-006 | M | borrador |
| **HU-108** | Ver el embudo de cada cuenta | EP-008 | M | borrador |
| **HU-111** | Comparar la ruta de instrucción con la de filtros | EP-008 | M | borrador |
| **HU-067** | Pegar el requerimiento que ya tengo escrito | EP-009 | M | borrador |
| **HU-071** | Responder una pregunta de afinamiento sin perder lo que ya veo | EP-009 | M | borrador |
| **HU-073** | Encontrar mi especificación como la dejé | EP-009 | M | borrador |

## Relleno — 8 historias · 8 pts (5% del esfuerzo)

*bajo valor · bajo esfuerzo.* Entran cuando sobra capacidad en un sprint. No se planifican aparte.

| ID | Historia | Épica | Esf. | Estado |
|---|---|---|---|---|
| **HU-093** | Entrar sin una selección previa y ser encuadrado | EP-001 | S | borrador |
| **HU-095** | Compartir el enlace con un colega | EP-001 | S | borrador |
| **HU-100** | Ser advertido si intento pedir sin haber elegido nada | EP-005 | S | borrador |
| **HU-088** | Descargar una plantilla o el banco para editarlo y devolverlo | EP-006 | S | prototipado |
| **HU-124** | Consultar el banco sin poder modificarlo | EP-006 | S | borrador |
| **HU-135** | Archivar un perfil sin perder su rastro | EP-006 | S | borrador |
| **HU-142** | Corregir solo las filas que fallaron | EP-006 | S | borrador |
| **HU-117** | Reaccionar a una cuenta que nunca abre | EP-011 | S | borrador |
---

## Lo que la matriz muestra

> **Recalculada el 2026-09-22** tras resolver la duplicación HU-078/HU-110 y dividir cuatro historias sobrecargadas (HU-131, HU-086, HU-089, HU-122). El backlog está en **79 historias activas y 173 pts**.

### 0. Dividir historias sobrecargadas bajó el backlog de 177 a 173 pts

El 22 de septiembre se dividieron cuatro historias que excedían el tope de escenarios de `METODOLOGIA.md` §4. El resultado es contraintuitivo y vale la pena registrarlo: **el backlog ganó 4 historias y perdió 4 pts.**

| Original | Antes | Después |
|---|---|---|
| HU-131 Adjuntar y derivar | L — 8 pts | HU-131 (M) + HU-140 (L) — 11 pts |
| HU-086 Importación masiva | L — 8 pts | HU-086 (M) + HU-141 (M) + HU-142 (S) — 7 pts |
| HU-089 Catálogos | L — 8 pts | HU-089 (M) + HU-143 (M) — 6 pts |
| HU-122 Enlace curado | M — 3 pts | HU-122 (S) + HU-144 (S) — 2 pts |

**Qué muestra.** Tres de las cuatro bajaron de peso al partirse. La L no medía trabajo: medía **desconocimiento**. Una historia que hace cuatro cosas se estima cara porque nadie sabe cuál de las cuatro duele, y al separarlas aparece que tres eran pequeñas. La excepción es HU-131, que subió — ahí sí había una parte genuinamente cara (derivar campos de un video) escondida detrás de una barata.

Es exactamente lo que el tope de cinco escenarios existe para detectar.

### 1. El cuadrante caro pesa 31% y ya no tiene excusa de bloqueo

Dieciséis historias de bajo valor declarado consumen 53 de los 173 pts. **Ninguna está bloqueada por una decisión abierta** — D-8, D-16 y D-19 se cerraron entre el 18 y el 21 de septiembre.

*Corrección de una lectura anterior de este documento.* Se anotó que al cerrar D-8 el cuadrante caro «bajaba de 35 a 24 pts». Es falso: el cuadrante se define por valor y esfuerzo, no por bloqueo. HU-086 y HU-087 siguen siendo media/L y media/M y siguen en Cuestionar. Lo que cambió no es su posición, sino que dejaron de esperar a nadie.

Ahora el cuadrante hay que discutirlo por lo único que queda: **si esas trece historias valen lo que cuestan.** Tres candidatas claras:

| Historia | Esf. | Por qué cuestionarla |
|---|---|---|
| **HU-140** Obtener un borrador desde el artefacto | L (8 pts) | *Resultado de dividir HU-131 el 22-sep.* La parte cara quedó aislada y se puede posponer entera sin perder nada: el mapa v1.0 ya la ubicaba en v2. La mitad útil —guardar el artefacto— es ahora HU-131, M y construible aparte |
| **HU-086 + HU-141 + HU-142** Importación masiva | M + M + S (7 pts) | Con 25 perfiles como umbral de producción (D-3), la carga masiva resuelve un problema que a esa escala casi no existe. Vale cuando el banco crezca — y ahora se puede posponer por partes |
| **HU-137** Ver los colocados y sus vencimientos | M (3 pts) | Depende de integrar el sistema de asignación. Su valor real es el disparador de renovación (V2-2), que no es MVP. |

### 2. EP-004 sigue invertida: lo escrito es lo periférico

"Armar el equipo" es la columna 6 del recorrido del cliente y **sus dos únicas historias escritas caen en Cuestionar** (HU-080 y HU-084, ambas media/M). Sumar un perfil, quitarlo, ver el contador y recuperar el equipo al volver —el comportamiento que hace que la épica exista— sigue sin redactarse.

No es que EP-004 valga poco: es que se escribieron primero sus adornos. **Es el mismo problema que tenía EP-006 hasta el 21 de septiembre, y la solución es la misma: escribir el núcleo.**

### 3. La duplicación HU-078 / HU-110 — resuelta el 2026-09-22

`HU-078` y `HU-110` eran la misma historia: mismo actor, mismo *quiero*, mismo propósito, mismo escenario de error. HU-078 se escribió contra el PRD 2.8; HU-110 contra el 4.0, en el cierre de huecos de EP-008, sin ver que ya existía.

**Se resolvió sin retirar ninguna.** Al revisar RF-7.2 apareció que el requisito tiene **dos mitades** —*«reporte de filtros más usados y de búsquedas sin resultados»*— y que ambas historias cubrían la segunda. La primera no la cubría nadie.

| | Antes | Ahora |
|---|---|---|
| **HU-078** (EP-010) | Registro de demanda | **Canónica.** RF-15.1 + búsquedas sin resultados. Dueño y cadencia en D-13 |
| **HU-110** (EP-008) | Duplicaba a HU-078 | **Reescrita.** Reporte de filtros más usados — la mitad de RF-7.2 que estaba huérfana |

La resolución cierra la duplicación y **además tapa un hueco de trazabilidad que la auditoría no había visto**: RF-7.2 estaba a medio cubrir.

*Diferencia con lo propuesto el 18 de septiembre*, que era retirar HU-110. Reescribirla cuesta lo mismo y deja el requisito completo.

### 4. Los quick wins se reparten ahora entre dos frentes

De las 27 quick wins, **cinco son de EP-009** (HU-066, 068, 069, 072, 082) y hacen legible la interpretación del modelo: ver qué entendió, corregirlo, sobrevivir cuando falla. **Cuestan 5 pts.** Siguen siendo el mejor retorno del backlog y la mejor inversión antes de las sesiones de §13.6: sin ellas una interpretación fallida se lee como que el producto no funciona, y la sesión mide frustración en vez de hipótesis.

**Seis son de EP-006** (HU-128, 129, 130, 132, 133, 136) y cuestan 6 pts. Entre ellas está HU-132 —actualizar disponibilidad en dos clics—, que es la condición operativa de O5: si actualizar cuesta abrir una ficha y navegar, no se hace, y el portal empieza a afirmar disponibilidades que nadie sostiene.

**Once historias de alto valor por 11 pts, repartidas entre la apuesta de producto y el objetivo habilitante.** Ahí empieza la construcción.

### 5. El objetivo habilitante ya tiene backlog

*Resuelto el 2026-09-21.* Hasta esa fecha EP-006 declaraba RF-8 completo —46 líneas de requisitos— con **cuatro historias**, todas de importación y catálogos. El CRUD del perfil, la validación técnica, el consentimiento, la publicación y el mantenimiento no tenían historia, y D-8 en CRUD completo había comprometido todo ese alcance para el MVP.

Se redactaron **17 historias, HU-123 a HU-139**, y EP-006 pasó de 4 a 21. O5 —el objetivo que el PRD §3 llama habilitante— tiene por fin backlog que lo sostenga.

**Lo que ese trabajo dejó a la vista:** el panel pesa 40 de los 174 pts del backlog, el 23%. No es un módulo administrativo al margen del producto — es casi un cuarto de lo que hay que construir, y hasta hace tres días no estaba en ninguna cuenta.

---

## Orden de construcción propuesto

No reemplaza el Anexo A del PRD (fases para agentes); lo complementa ordenando **qué historia** entra en cada fase.

| Orden | Qué | Pts | Por qué ahí |
|---|---|---|---|
| **1** | Quick wins de EP-009 (HU-066, 068, 069, 072, 082) | 5 | Hacen legible la instrucción. Condición para que las sesiones de §13.6 midan la hipótesis y no la frustración |
| **2** | **Base del panel** — HU-123 (identidad), HU-125 (crear), HU-127 y HU-128 (consentimiento), HU-130 (publicar con Nivel 0) | 12 | Sin identidad no hay auditoría (RF-8.1.3) y sin consentimiento no se publica nada. Es el orden que el propio PRD impone |
| **3** | **Mantenimiento del banco** — HU-132 (dos clics), HU-134 (incoherencias), HU-136 (vigencia), HU-133 (pausar) | 6 | Aquí vive O5. Son 6 pts y sostienen el objetivo del que dependen los otros cuatro |
| **4** | Big bets de EP-009 y EP-010 (HU-065, 070, 083, 085, 118, 075, 076, 077, 078) | 29 | El núcleo de la Fase 2. Se construye con la regla asimétrica de §14.7 a la vista |
| **5** | Quick wins de EP-001 y EP-005 (HU-091, 092, 094, 097, 098) + HU-126 y HU-129 | 9 | Cierran el recorrido de extremo a extremo y la edición segura del panel |
| **6** | EP-007 (HU-102, 103, 105, 104, 106, 107) | 12 | La solicitud llega al comercial con cola de reintento. HU-107 cierra RF-17.4 y hace medible O3 |
| **7** | EP-011 completo (HU-113, 114, 115, 116, 117) | 9 | El correo es la fuente de todo el tráfico. Sin él el portal no recibe visitas |
| **8** | EP-003 y EP-002 (HU-081, 119, 120, 074, 121) | 10 | Evidencia y refinamiento. Ya prototipados en Mid-Fi |
| **9** | Auditoría y catálogos (HU-138, HU-089, HU-139, HU-124, HU-135) + HU-131 (adjuntar artefacto) | 19 | Gobierno del banco. HU-138 exige HU-123 hecha |
| **10** | Telemetría (HU-109, 110→078, 112) y v1.1 (HU-108, 111, 099, 067, 071) | 20 | El tablero llega después de que haya datos que mirar |

**Fuera del orden, a discutir por valor:** HU-140 (la parte cara de la evidencia asistida — candidata a v2), HU-086 y HU-087 (carga masiva — con 25 perfiles de umbral, no urge), HU-137 (depende del sistema de asignación), HU-080 y HU-084 (adornos de una épica sin núcleo).

**Nada espera una decisión.** HU-084 depende de un insumo de Delivery —las tres composiciones reales—, no de una resolución pendiente.

---

## Distribución del esfuerzo — chequeo de salud

| Cuadrante | Historias | Pts | % |
|---|---|---|---|
| Quick wins | 29 | 29 | 17% |
| Big bets | 26 | 83 | 48% |
| Cuestionar | 16 | 53 | 31% |
| Relleno | 8 | 8 | 5% |

**Lectura.** El 65% del esfuerzo está en historias de alto valor, que sigue siendo sano. La proporción se sostuvo al sumar 21 historias entre el 21 y el 22 de septiembre — señal de que ni el panel ni las divisiones desbalancearon el backlog.

El 31% caro ya no esconde bloqueos, duplicados ni historias sobrecargadas: esconde **la cadena de importación masiva** (HU-086, HU-141, HU-142 — 7 pts que D-3 vuelve poco urgentes), **HU-140** (8 pts, la parte cara de la evidencia asistida, candidata a v2), **HU-137** (depende del sistema de asignación) y **los adornos de EP-004**, cuyo núcleo sigue sin escribirse. Esa es la conversación pendiente, y ahora es de valor: ya no quedan bloqueos ni deuda de granularidad.

---

## Disidencias y supuestos registrados

**Supuesto 1 — el valor se heredó, no se debatió.** La columna `prioridad` del backlog se tomó como proxy de valor. Nadie de Dirección Comercial ni de Delivery participó en asignarla. Si el valor se debate con ellos, es previsible que HU-101 y HU-107 (traspaso a Delivery, RF-17) suban y que parte de EP-009 baje.

**Supuesto 2 — la complejidad es autoreportada y nunca la vio Tecnología.** Las tablas INVEST de las historias marcan la E de *Estimable* como «por confirmar con Tecnología» de forma sistemática. Los 134 pts son una escala relativa útil para ordenar, **no una estimación**.

**Disidencia anticipada — HU-099 (agendar la sesión de alineación).** Queda en Cuestionar por su prioridad `media`, pero es la única historia que automatiza el numerador de **O3** (≤ 3 días hábiles entre solicitud y sesión agendada). Mientras esté fuera, O3 depende de que un humano escriba la fecha a mano (HU-107). Defendible mantenerla en v1.1, pero la consecuencia hay que aceptarla explícitamente.

**Disidencia anticipada — HU-089 (crear un rol nuevo sin ensuciar la taxonomía).** Es big bet con esfuerzo `L` y ya está prototipada. Talento Humano podría argumentar que sin gobierno de catálogos el banco se ensucia desde el primer día y debería adelantarse al orden 4.

---

## Estado

**Propuesta, no aprobada.** `docs/03-backlog/backlog.md` **no se modificó** con este orden: la regla local de `docs/05-priorizacion/` exige aprobación explícita antes de reordenar el backlog.

Para aprobar quedan dos cosas: resolver la duplicación HU-078/HU-110 y escribir las historias faltantes de EP-006, hoy en la ruta crítica. **Las decisiones ya no son el cuello de botella** — D-3, D-8, D-10, D-16, D-18 y D-19 se cerraron entre el 18 y el 21 de septiembre.
