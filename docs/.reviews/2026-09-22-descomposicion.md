---
artefacto: revision
agente: story-decomposer-auditor
fecha: 2026-09-22
proyecto: portal-people-service
prd: docs/01-prd/portal-people-service.md (v4.8)
epicas: docs/03-backlog/epicas.md (v5.2, 11 épicas)
historias: docs/04-historias/ (80 archivos · 79 activas · 1 descartada)
---

# Auditoría de descomposición PRD → Épicas → Historias — 2026-09-22

**PRD**: `docs/01-prd/portal-people-service.md` — v4.8
**Épicas**: `docs/03-backlog/epicas.md` — v5.2, 11 épicas
**Historias**: `docs/04-historias/HU-065` a `HU-144` — 80 archivos

---

## Matriz Épica × Objetivo-PRD

|        | O1 Crecer equipos | O2 Convertir curaduría | O3 Acortar arranque | O4 Calidad del brief | O5 Inventario vivo |
|--------|:---:|:---:|:---:|:---:|:---:|
| EP-001 |   | ● |   |   |   |
| EP-002 |   | ● |   |   |   |
| EP-003 |   | ● |   |   |   |
| EP-004 |   | ● |   | ● |   |
| EP-005 | ● | ● | ● | ● |   |
| EP-006 |   |   |   |   | ● |
| EP-007 | ● |   | ● | ● |   |
| EP-008 | ● | ● |   |   | ● |
| EP-009 |   | ● |   | ● |   |
| EP-010 | ● | ● |   |   |   |
| EP-011 |   | ● |   |   | ● |

**Cobertura bidireccional al nivel de épica: ✓ correcta.** Los 5 objetivos tienen ≥1 épica; las 11 épicas cubren ≥1 objetivo; no hay huérfanos. La matriz publicada en `epicas.md` §Matriz coincide con el campo *Objetivos del PRD que cubre* de cada épica, una por una. IDs `EP-001`…`EP-011` secuenciales, sin saltos ni duplicados.

**La cobertura se rompe un nivel más abajo.** Tres de los cinco objetivos pierden su mecanismo cuando se baja de la épica a la historia (ver 🔴-1, 🔴-2, 🔴-4).

---

## Tabla base de la auditoría

Requisitos declarados en el cuerpo de cada épica (viñetas `RF-` de primer y segundo nivel) frente a historias escritas, y cuántos de esos requisitos declarados tienen al menos una historia que los cubra.

| Épica | RF declarados | HU escritas | RF declarados **con** historia | RF declarados **sin** historia |
|---|---:|---:|---:|---:|
| EP-001 Acceso y aterrizaje curado | 13 | 8 | RF-1.1, 1.3, 1.4, 1.5, 2.1, 2.2 | **RF-1.2** (+5 subniveles), RF-1.6 (su historia vive en EP-011) |
| EP-002 Refinamiento y descubrimiento | 17 | **2** | **ninguno** | RF-2.3, 2.8, RF-10.1–10.11, RF-11.1–11.2 |
| EP-003 Evidencia del perfil | 18 | 3 activas | **ninguno** (RF-3.13 lo cubren historias de EP-006) | RF-3.1–3.12, RF-6.1–6.5 |
| EP-004 Armado de equipo | 5 | **2** | **ninguno** (RF-4.3 y 4.5 los cubre HU-096, que vive en EP-005) | RF-4.1, 4.2, 4.4 |
| EP-005 Solicitud y agendamiento | 6 | 6 | RF-5.1, 5.2, 5.4, 5.5, 5.6 | RF-5.3, RF-17.3 |
| EP-006 Administración del inventario | **45** | **25** | RF-8.1–8.16 (cobertura densa) | — |
| EP-007 Integración con HubSpot | 14 | 6 | RF-9.1, 9.1.1, 9.1.3, 9.2, 9.6, 9.7 | RF-9.3, 9.4, 9.5, RF-17.1, 17.2, 17.5 |
| EP-008 Telemetría y medición | 4 | 5 | RF-7.1–7.4 | — |
| EP-009 Instrucción y Perfil Objetivo | **47** | 13 | RF-12.1–12.3, 13.1–13.7, 13.9, 16.1, 2.6 | RF-13.8, RF-16.2, 16.3, 16.4 (13.10/13.11/13.12 se cubren desde EP-003 y EP-002) |
| EP-010 El camino del cero | 3 | 4 | RF-14.3, RF-15.1 | RF-14.4 |
| EP-011 Correo curado y distribución | 8 | 5 | RF-18.1–18.6, RF-1.6, RF-7.3 | — |

Requisitos del PRD con **cero historias** en todo el backlog: RF-1.2, RF-2.4, RF-2.5, RF-2.7, RF-3.1 a RF-3.12, RF-4.1, RF-4.2, RF-4.4, RF-5.3, RF-6.1 a RF-6.5, RF-9.3, RF-9.4, RF-9.5, RF-10 (11 subrequisitos), RF-11 (2), RF-13.8, RF-14.4, RF-14.5, RF-16.2, RF-16.3, RF-16.4, RF-17.1, RF-17.2, RF-17.3, RF-17.5, RF-19.8.

---

## Issues

### 🔴 Bloqueante 1 — EP-002 y EP-004 no son épicas pequeñas: son épicas vacías

La pregunta del encargo era si EP-002 y EP-004 están incompletas. **Lo están, y de una forma más grave que un conteo bajo de historias**: ninguna de sus cuatro historias cubre un solo requisito de los que la propia épica declara.

**EP-002** declara `Capabilities: RF-2.3 a RF-2.8 · RF-10 y RF-11` — 17 viñetas de requisito en su cuerpo. Sus dos historias son:

- **HU-074** «Refinar con filtros lo que la instrucción me devolvió» → sus notas dicen *"Cubre RF-14.2"*. RF-14.2 no aparece en la línea `Capabilities` de ninguna épica del documento.
- **HU-121** «Comparar muchos perfiles por el mismo criterio» → *"Cubre RF-13.12"*, declarado en **EP-009**.

El mecanismo que da nombre a la épica —las facetas— nunca se redacta. RF-2.3 (facetas mínimas), RF-2.4 (filtros combinables con contador y etiqueta removible), RF-2.5 (*"Todo el estado se refleja en la URL… **Requisito duro**"*), RF-2.7 (ordenamiento) y RF-2.8 (estado sin resultados) no tienen historia. El tercer escenario de HU-074 lo delata: *"cuando aplico filtros sobre el banco completo, **Entonces** funcionan **como en la versión anterior del portal**"*. La historia presupone un comportamiento que ningún artefacto especifica.

Además, RF-10 (sondeo de agentes autónomos, 11 subrequisitos, con umbral D-11 cerrado y fecha) y RF-11 (espacio no-perfil) están transcritos completos en el cuerpo de EP-002 y no tienen ninguna historia. Son 13 de las 17 viñetas de la épica.

**EP-004** declara `Capabilities: RF-4 (completo)` — 5 requisitos. Sus dos historias son HU-080 (*"Cubre RF-14.6"*) y HU-084 (*"Cubre RF-14.7"*), ninguno declarado por EP-004. RF-4.1 (sumar y quitar perfiles), RF-4.2 (indicador con conteo) y RF-4.4 (comparador de hasta 3) no tienen historia; RF-4.3 y RF-4.5 solo existen dentro de **HU-096, que está asignada a EP-005**.

Consecuencia concreta: *"sumar un perfil al equipo"* —la acción sobre la que se apoya la métrica de éxito de la épica, *"promedio de 1,8 perfiles o más por solicitud enviada"*, y con ella O4— no está escrita en ninguna parte del backlog.

> El mapa de historias ya lo diagnostica en §Deuda de mapa: *"**EP-004 es el que queda invertido**: sus dos historias escritas son observaciones sobre la composición, y el comportamiento que hace existir la épica no está redactado."* La auditoría lo confirma y añade que EP-002 está en el mismo estado, con el agravante de RF-2.5, marcado *requisito duro* en el PRD.

### 🔴 Bloqueante 2 — EP-003 declara 18 requisitos y no tiene ninguno redactado

EP-003 es, según su propia justificación, *"donde se juega la conversión y, sobre todo, donde se juega la marca"*. Declara `RF-3 (completo) · RF-6 (completo)`.

**Cero historias cubren RF-3.1 a RF-3.12 o RF-6.1 a RF-6.5.** El único RF-3 con historia es RF-3.13 (banda de disponibilidad), y sus cuatro historias —HU-129, HU-132, HU-134, HU-137— están todas en **EP-006**, del lado del panel.

Las tres historias activas de EP-003 cubren requisitos de otras épicas:

| Historia | Cubre | Épica que lo declara |
|---|---|---|
| HU-081 Distinguir un perfil por sus competencias | RF-14.0, RF-14.1 | ninguna |
| HU-119 Saber por qué coincide cada perfil | RF-13.10 | EP-009 |
| HU-120 Comparar perfiles sin perder la lista | RF-13.11 | EP-009 |

Lo que no tiene historia es la ficha completa (RF-3.2), la separación verificado/autoreportado (RF-3.12) —*"la respuesta a la pregunta que hace todo comprador escéptico"*—, la estructura de cinco campos de la validación técnica (RF-3.10), las prohibiciones de publicación (RF-3.3, RF-3.7) y **todo el contenido de encuadre RF-6**: la declaración de condición de entrada (RF-6.4), el SLA visible (RF-6.2) y la garantía Neural Speed (RF-6.5).

D-5 no lo explica: el mapa es explícito en que D-5 *"no las bloquea, define su calidad"*. RF-6 no depende de D-5 en absoluto.

### 🔴 Bloqueante 3 — La nota de granularidad de `epicas.md` afirma lo contrario de lo que es

`epicas.md` §Notas de descomposición dice:

> *"**Granularidad.** EP-008 es la más pequeña y EP-002 la más grande; la diferencia es de aproximadamente el doble, dentro del rango aceptable."*

Ninguna de las tres afirmaciones se sostiene. Medido en requisitos declarados: EP-010 = 3, EP-008 = 4, EP-002 = 17, **EP-009 = 47, EP-006 = 45**. Medido en historias escritas: EP-002 = 2, EP-004 = 2, **EP-006 = 25**. La diferencia no es del doble: es de **12,5×** en historias y **15×** en requisitos.

La misma sección declara *"**Sin solapes.** El único límite discutible es entre EP-001 y EP-002"* — refutado en 🟡-1. Y el documento abre con *"Descomposición del PRD v0.3"* mientras su frontmatter dice `prd_version: 4.8`.

La nota final de EP-006 dice *"la épica pasó de 4 a 21 historias"*; hoy tiene **25** (HU-086 a 089, HU-123 a 139, HU-140 a 143).

Estas notas son lo que un lector consulta para decidir si la descomposición está sana. Hoy dicen que sí cuando la respuesta es no.

### 🔴 Bloqueante 4 — O3 está cubierto en la matriz y sin mecanismo en el backlog

O3 —*"Días entre solicitud enviada y sesión de alineación agendada ≤ 3 días hábiles"*— lo cubren EP-005 y EP-007. El requisito que lo produce es RF-17.3: *"El responsable **agenda la sesión de alineación en un plazo definido** desde la solicitud. Ese plazo es **el numerador de O3** y debe estar acordado con Delivery, no supuesto."*

RF-17.3 está declarado en `Capabilities` de EP-005 y **no tiene historia**. Tampoco la tienen RF-17.1, RF-17.2 ni RF-17.5, declarados en EP-007. De los cinco requisitos de RF-17 solo RF-17.4 está redactado (HU-107). Lo que queda escrito es el registro de la fecha, no el compromiso de agendar: el denominador sin el numerador.

Lo mismo, en menor escala, con **RF-9.3, RF-9.4 y RF-9.5** (propiedades del negocio, resumen en la línea de tiempo, asignación de propietario), declarados como `RF-9 (completo)` en EP-007 y sin historia. RF-9.3 es el que sostiene O4.

---

### 🟡 Mayor 1 — Hay seis solapes, y el declarado no es el importante

`epicas.md` declara un único límite discutible, EP-001 / EP-002. **Ese se verificó y está bien resuelto**: RF-2.1 y RF-2.2 viven en EP-001, HU-094 («Volver a la selección después de explorar») está en EP-001, y la ampliación de búsqueda no aparece duplicada en EP-002. El criterio declarado —*"lo que se está protegiendo ahí es la percepción de la curaduría, no la mecánica del filtro"*— se aplicó de forma consistente.

Los que no están declarados:

**a) EP-001 / EP-011 — dos historias para el mismo acto, con dueños distintos.** Es el solape con consecuencia operativa real.

- **HU-122** (EP-001) · *administradora del banco de talento* · *"seleccionar perfiles de cualquier familia y generar un enlace para una cuenta"* · cubre RF-19.1, 19.3, 19.4, 19.5, 19.7.
- **HU-113** (EP-011) · *responsable de la distribución en Mercadeo* · *"elegir desde el panel los perfiles que le voy a proponer a una cuenta, viendo su disponibilidad real"* · cubre RF-18.1, 18.3, 18.4.

Es la misma acción —elegir perfiles para una cuenta, escribir la razón, emitir el enlace— redactada dos veces, en dos épicas, con dos actores. El PRD tampoco lo resuelve: RF-19.3 dice *"Dueño: **Talento Humano**"*; RF-18.3 dice que la selección se arma desde el panel sin nombrar dueño, y la historia se la asigna a Mercadeo. Hay que decidir quién arma la curaduría antes de construir cualquiera de las dos.

**b) RF-1.6 en EP-001 y EP-011.** Declarado en las dos líneas `Capabilities` y transcrito en los dos cuerpos. Su historia (HU-114) está en EP-011.

**c) RF-7.3 en EP-008 (`RF-7 completo`) y EP-011.** Dos historias lo cubren: HU-112 (EP-008) y HU-116 (EP-011).

**d) RF-2.6 en EP-002 y EP-009.** EP-002 declara el rango *"RF-2.3 a RF-2.8"*, que lo contiene; EP-009 lo declara explícito y es la única que lo transcribe en su cuerpo. Su historia, HU-065, está en EP-009.

**e) EP-005 / EP-007 — cobertura duplicada de RF-9.2 y RF-9.6.** HU-097 y HU-104 cubren ambas RF-9.2 (no duplicar empresa); HU-098 y HU-105 cubren ambas RF-9.6 (recuperar solicitud fallida). Dos épicas escriben sobre el mismo requisito desde caras opuestas sin declarar cuál es la dueña.

**f) EP-003 / EP-006 — RF-3.13.** Declarado en EP-003 (`RF-3 completo`), redactado íntegramente en EP-006 (HU-129, 132, 134, 137). Es defendible —RF-3.13.1 dice que la fecha vive en el panel— pero significa que el único requisito de RF-3 con historia no está en la épica que lo declara, y eso nadie lo escribió.

### 🟡 Mayor 2 — Alcance declarado mayor que el redactado: cinco épicas, no una

Además de EP-002, EP-003 y EP-004 (bloqueantes 1 y 2):

**EP-001** declara `RF-1 (completo) · RF-19 (completo)`. Dos huecos:

- **RF-1.2 no tiene historia** — el control de acceso entero: verificación de correo corporativo, código de un uso, mensaje de la puerta que explica la fricción (RF-1.2.5). Es el requisito reinstaurado tras revertirse D-1, con cinco subniveles de justificación en el PRD.
- Peor: **HU-090 lo contradice.** Su happy path dice *"**cuando** toco el enlace, **Entonces** entro directamente al portal… **Y** no se me pide usuario ni contraseña"*, sin paso de verificación. Su frontmatter dice `prd_version: 4.0`. RF-1.2 es de v4.8. La historia describe el modelo de acceso anterior al cierre actual de D-4.
- **RF-19 es la única capability del documento que no se transcribe en el cuerpo de su épica.** EP-001 declara `RF-19 (completo)` en `Capabilities` y su sección *Requisitos de esta épica* salta de RF-1.6 a RF-2.1. RF-19.8 (token del lado del servidor) no tiene historia.

**EP-009** declara 47 viñetas y tiene 13 historias. **RF-13.8** no tiene historia: es la regla de *un solo motor de criterios* —*"El contador del panel y el número de resultados son siempre el mismo número"*— redactada a partir de un defecto ya observado (*"El panel decía cero mientras la pantalla mostraba dos perfiles"*). Tampoco RF-16.2 (nunca enviar datos de perfiles al modelo, con implicación ISO 27000 declarada), RF-16.3 ni RF-16.4.

**EP-010** declara tres requisitos y no tiene historia para **RF-14.4** (*"La escasez se declara, no se disimula"*), pese a que sus *Historias anticipadas* la listan como *"entender que el banco es selectivo y no pobre"*.

### 🟡 Mayor 3 — Seis requisitos del PRD no pertenecen a ninguna épica

RF-14.0, RF-14.1, RF-14.2, RF-14.5, RF-14.6 y RF-14.7 (PRD §13.4) **no aparecen en la línea `Capabilities` de ninguna épica**. Solo RF-14.3 y RF-14.4 se asignaron, a EP-010.

No son residuales. Cinco de ellos tienen historia escrita —huérfana de épica declarada:

| Requisito | Historia | Épica donde vive | Épica que lo declara |
|---|---|---|---|
| RF-14.0 · Principio de origen del dato | HU-081, HU-082 | EP-003, EP-009 | — |
| RF-14.1 · La tarjeta lidera con identidad y capacidad | HU-081 | EP-003 | — |
| RF-14.2 · Los filtros se subordinan a refinamiento | HU-074, HU-110, HU-111 | EP-002, EP-008 | — |
| RF-14.5 · Condiciones y preferencias de trabajo en la ficha | *ninguna* | — | — |
| RF-14.6 · «Mi equipo» lee vacíos de composición | HU-080 | EP-004 | — |
| RF-14.7 · Composiciones de referencia | HU-084 | EP-004 | — |

RF-14.2 es el caso más incómodo: es *la razón de ser* de EP-002 en la Fase 2 —su propia justificación lo cita— y EP-002 no lo declara. Es también el requisito que sostiene la prueba de falsación que la épica se atribuye (*"si más de la mitad de las sesiones usa filtros después de haber escrito una instrucción, la subordinación está mal hecha"*).

### 🟡 Mayor 4 — Cuatro historias están en la épica equivocada por actor

La regla que aplico: el actor de la historia debe pertenecer al recorrido que la épica describe.

| Historia | Épica actual | Actor | Recorrido de la épica | Épica correcta |
|---|---|---|---|---|
| **HU-122** Generar un enlace con los perfiles que elegí | EP-001 | *administradora del banco de talento* | cliente entrando desde el correo | **EP-011** o EP-006 |
| **HU-078** Saber qué están pidiendo las cuentas y no tenemos | EP-010 | *integrante de Talento Humano* | cliente que no encontró nada | **EP-006** o EP-008 |
| **HU-101** Recibir la solicitud con contexto suficiente | EP-005 | *Coordinación de Servicio* | cliente que envía la solicitud | **EP-007** |
| **HU-096** Revisar mi equipo antes de pedirlo | EP-005 | cliente (actor correcto) | — | **EP-004** (cubre RF-4.3 y RF-4.5) |

HU-122 es la más clara: es la única historia de actor interno dentro de una épica cuyo resumen es *"El cliente llega desde el correo, supera el control de acceso y aterriza…"*. Sus propias notas lo reconocen —*"dos happy paths con **actores distintos**… Cuando los happy paths cambian de actor, el corte natural está ahí"*— y cortaron la parte del cliente a HU-144, pero dejaron la mitad interna en la épica del cliente.

HU-101 acumula las dos señales: actor interno (Delivery) en la épica del cliente, y cubre RF-17.1 y RF-17.5, que EP-007 declara y EP-005 no.

HU-096 es el caso inverso: actor correcto, épica equivocada por requisito. Es la única historia que toca RF-4 y está fuera de EP-004.

Tres historias más están desplazadas por requisito aunque su actor encaje: **HU-119** y **HU-120** (EP-003, cubren RF-13.10 y RF-13.11 de EP-009) y **HU-121** (EP-002, cubre RF-13.12 de EP-009). Las tres describen el comportamiento de los resultados del Perfil Objetivo, no la ficha ni las facetas.

---

### 🟢 Menor 1 — EP-006 no debe partirse por granularidad; sí por dominio, y es opcional

Respuesta directa al encargo: **las 25 historias de EP-006 reflejan alcance real, no inflación.** Con 45 requisitos declarados, su densidad es de 1,8 requisitos por historia — la mediana del proyecto (EP-001: 1,6; EP-011: 1,6; EP-007: 2,3). La épica desbalanceada no es EP-006 por exceso de historias: son EP-002, EP-003 y EP-004 por defecto de redacción sobre alcance declarado.

Dicho eso, EP-006 contiene dos subdominios autocontenidos, cada uno más grande que EP-008 o EP-010 enteras:

- **RF-8.15 · Importación masiva** — 10 subrequisitos, **especificación propia** en `docs/10-specs/importacion-masiva.md`, 5 historias (HU-086, 087, 088, 141, 142).
- **RF-8.16 · Catálogos paramétricos** — 8 subrequisitos, 2 historias propias (HU-089, HU-143) más parte de HU-125.

Extraerlos dejaría EP-006 en ~18 historias sobre el CRUD, el consentimiento y el mantenimiento —el corazón de O5— y produciría dos épicas de tamaño comparable al de EP-010 y EP-011. Es una mejora de legibilidad, no una corrección: la épica hoy es coherente en actor (Talento Humano) y en objetivo (O5), y esa coherencia es lo que la metodología §2 pide de una épica.

**EP-009, no EP-006, es la épica más grande del documento** (47 requisitos declarados frente a 45), y con 13 historias es la que tiene mayor deuda de redacción en términos absolutos.

### 🟢 Menor 2 — Métricas de éxito por épica: todas medibles menos una

Las 11 épicas declaran métrica. Diez son verificables. **EP-009** declara *"tiempo hasta el primer perfil abierto igual o menor que con facetas, con tasa de solicitud igual o mayor"* — el comparador («con facetas») no existirá si EP-002 no se redacta, que es justamente el estado actual. La métrica de EP-009 depende de construir la ruta que EP-002 dejó sin especificar.

### 🟢 Menor 3 — Metadatos contradictorios y desactualizados

- `epicas.md` frontmatter: `prd_version: 4.8` y `prd_version_alineada: 4.5` conviven. La segunda es la real, a juzgar por los huecos detectados.
- Encabezado de `epicas.md`: *"Descomposición del PRD **v0.3**"*.
- **26 historias declaran `prd_version: 4.0`** y 22 declaran versiones anteriores (2.0 a 3.5); solo 29 están en 4.8. El caso con consecuencia es HU-090 (🟡-2).
- Nombres inconsistentes entre el encabezado de la épica y la matriz: EP-002 «Refinamiento y descubrimiento del banco» vs «Búsqueda y descubrimiento»; EP-005 «Solicitud de equipo y agendamiento» vs «Solicitud y agendamiento».
- `backlog.md` §Historias anticipadas sin redactar sigue listando HU-001–016 (EP-001), HU-035–041 (EP-005) y HU-059–064 (EP-007/008) como pendientes; el mapa de historias ya las marca cubiertas. Las dos tablas describen el mismo hecho de forma distinta.
- Frontmatter fuera de la taxonomía de METODOLOGIA §3: `estado: prototipado` (7 historias) y `estado: descartada` (HU-079) no están en `draft|lista|en-curso|hecha`; `prioridad: n/a` en HU-079.

---

## Acciones recomendadas

Por orden de consecuencia, no de esfuerzo.

1. **Redactar las historias de EP-002, EP-003 y EP-004 antes de priorizar.** Son ~20 historias: facetas y estado en URL (RF-2.3 a RF-2.8), sondeo y espacio no-perfil (RF-10, RF-11), tarjeta y ficha (RF-3.1 a RF-3.12), encuadre (RF-6), y «Mi equipo» (RF-4.1, 4.2, 4.4). Sin ellas, la priorización ordenaría un backlog al que le falta el recorrido central del cliente.
2. **Resolver quién arma la curaduría** — Talento Humano (RF-19.3, HU-122) o Mercadeo (RF-18.3, HU-113) — y fusionar o delimitar las dos historias. Es decisión de negocio, no de redacción, y bloquea a las dos épicas.
3. **Escribir la historia de RF-1.2 y corregir HU-090**, cuyo happy path contradice el control de acceso vigente del PRD v4.8.
4. **Asignar RF-14.0, 14.1, 14.2, 14.5, 14.6 y 14.7 a una épica** en la línea `Capabilities`. La ubicación natural: 14.0/14.1/14.5 → EP-003; 14.2 → EP-002; 14.6/14.7 → EP-004.
5. **Cerrar la cadena de O3**: historia para RF-17.3 con el plazo acordado con Delivery, y para RF-17.1, 17.2 y 17.5 en EP-007.
6. **Mover HU-122 → EP-011, HU-101 → EP-007, HU-078 → EP-006 y HU-096 → EP-004.** Reasignar HU-119, HU-120 y HU-121 a EP-009, o declarar RF-13.10/13.11/13.12 como capabilities compartidas de EP-003 y EP-002 con la razón escrita.
7. **Reescribir §Notas de descomposición de `epicas.md`**: la afirmación de granularidad y la de «sin solapes» son falsas; el conteo de EP-006 está desactualizado (25, no 21).
8. **Declarar los seis solapes** (RF-1.6, RF-7.3, RF-2.6, RF-9.2, RF-9.6, RF-3.13) con la épica dueña de cada uno.
9. **Historias faltantes de menor volumen**: RF-5.3, RF-9.3, RF-9.4, RF-9.5, RF-13.8, RF-14.4, RF-16.2, RF-16.3, RF-16.4, RF-19.8.
10. **Opcional, tras lo anterior**: extraer RF-8.15 y RF-8.16 de EP-006 como épicas propias. Mejora de legibilidad, no corrección.

---

*Auditoría de solo lectura. No se modificó ningún artefacto de `docs/` fuera de este archivo.*
