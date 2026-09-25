---
artefacto: auditoria
tipo: agente
agente: trazabilidad-auditor
proyecto: portal-people-service
fecha: 2026-09-22
alcance: cadena AC → Historia → Épica → Objetivo-PRD en ambos sentidos, a nivel de requisito de segundo nivel (RF-x.y)
artefactos_auditados: PRD 4.8 · epicas 5.2 · backlog 5.2 · 80 HU · mapa 3.2 · priorizacion 2.2 · 11 flows
metodologia: "@trycore/spec-product-flow METODOLOGIA.md §2, §3, §4, §5a, §6, §9"
---

# Trazabilidad Audit — 2026-09-22

> Auditoría independiente. El análisis se hizo **antes** de leer `docs/.reviews/2026-09-18-auditoria-manual.md`; el contraste con esa auditoría está al final (§8).

## 0. Alcance de la medición

El PRD 4.8 define **220 requisitos** enumerados como viñeta en negrita: 133 de segundo nivel (`RF-x.y`), 84 de tercer nivel (`RF-x.y.z`) y 2 de cuarto. La auditoría previa verificó la cobertura al nivel de **familia** (RF-1 … RF-19) y con ese corte la cobertura es, en efecto, completa.

**Este audit mide al nivel que construye el equipo: `RF-x.y`.** A ese nivel:

| Medida | Resultado |
|---|---|
| RF-x.y definidos en el PRD | 133 |
| RF-x.y citados por al menos una HU | 73 |
| **RF-x.y sin ninguna HU que los cite** | **60 (45%)** |
| RF-x.y que ninguna épica redacta en su sección «Requisitos de esta épica» | 25 |
| **RF-x.y sin épica que los redacte Y sin HU que los cite** | **12** |
| AC totales escritos | 261 en 79 historias activas |
| HU fuera del rango 3-5 escenarios (METODOLOGIA §4) | 0 ✓ |

---

## 1. Cobertura top-down (Objetivo → Épica → Historia → AC)

| Objetivo PRD | Épicas | HU | AC | Estado |
|---|---|---|---|---|
| **O1** — Crecer equipos en cuentas activas | EP-005, EP-007, EP-008, EP-010 | 21 | 63 | 🟡 cadena completa, **métrica sin línea base** (`<!-- TODO -->` en §3) |
| **O2** — Convertir curaduría en intención | EP-001…005, EP-008…011 | 48 | 155 | 🟡 cadena completa; el eslabón EP-003/EP-004 es nominal (5 HU para 31 RF-x.y) |
| **O3** — Acortar el arranque comercial | EP-005, EP-007 | 12 | 36 | 🔴 **RF-17.3 —el numerador de O3— no tiene AC** |
| **O4** — Calidad del brief | EP-004, EP-005, EP-007, EP-009 | 27 | 88 | 🟡 RF-9.3 (propiedades del negocio) sin historia |
| **O5** — Inventario vivo | EP-006, EP-008, EP-011 | 35 | 115 | ✓ cobertura real y densa desde el 2026-09-21 |

**Ningún objetivo es huérfano en sentido estricto** — los cinco llegan hasta AC. La ruptura no está en el eje objetivo→épica (que la matriz de `epicas.md` cierra bien) sino **un nivel más abajo**: entre lo que la épica declara y lo que el backlog escribe.

### Densidad por épica — el desequilibrio

| Épica | HU escritas | AC | RF-x.y declarados | Lectura |
|---|---:|---:|---:|---|
| EP-001 | 8 | 24 | 14 | 🔴 falta el requisito de acceso (RF-1.2) |
| EP-002 | 2 | 8 | 19 | 🔴 2 historias para 19 requisitos |
| EP-003 | 3 | 11 | 18 | 🔴 3 historias para 18 requisitos |
| EP-004 | 2 | 7 | 5 | 🔴 las 2 escritas son periféricas; el núcleo no existe |
| EP-005 | 6 | 18 | 8 | 🟡 |
| EP-006 | 25 | 85 | 16 (+42 hijos) | ✓ |
| EP-007 | 6 | 18 | 10 | 🟡 |
| EP-008 | 5 | 15 | 4 | ✓ |
| EP-009 | 13 | 45 | 19 | 🟡 |
| EP-010 | 4 | 12 | 3 | 🟡 |
| EP-011 | 5 | 15 | 8 | ✓ |

---

## 2. Huérfanos top-down — requisitos sin historia

### 🔴 2.1 · RF-1.2 · El control de acceso del cliente no tiene AC — y la historia que dice cubrirlo lo contradice

Es el hallazgo más grave del audit, y es de tres capas.

**Capa 1 — el requisito no tiene historia.** RF-1.2 (*enlace firmado + verificación de correo corporativo con código de un uso*) y sus cinco hijos RF-1.2.1 a RF-1.2.5 no son citados por ninguna de las 80 historias. D-4 se **revisó el 2026-09-16** precisamente para introducirlo, porque tras revertirse D-1 el enlace expone la lista nominal del talento.

**Capa 2 — la historia que reclama el alcance describe el comportamiento anterior.** `HU-090` (`docs/04-historias/HU-090-entrar-al-portal-desde-el.md`) declara en sus Notas:

> Cubre RF-1.1 a RF-1.5. El acceso por enlace firmado sin credenciales es D-4, cerrada.

pero su AC-1 (happy path) dice:

> **cuando** toco el enlace, **Entonces** entro **directamente** al portal … **Y** no se me pide usuario ni contraseña

No hay ningún paso de correo ni de código. La historia está escrita contra `prd_version: 4.0` y contra la resolución de D-4 **anterior** al 2026-09-16. Declara cubrir RF-1.2 y describe su negación.

**Capa 3 — el flow cita un AC que no existe.** `docs/06-flows/EP-001-acceso-y-aterrizaje-curado.md` modela correctamente la puerta (`P-->>C: Pide correo corporativo y envía código de un uso` → `C->>P: Introduce el código`) y en su tabla de trazabilidad mapea ese paso a **«Abrir, verificar y entrar | HU-090 | AC-1 (happy)»**. Ese AC no contiene la transición. Esto viola la regla dura de METODOLOGIA §5a-2: *«Cero pasos sin AC: si una transición que el flow necesita NO está cubierta por ningún AC existente, detener y reportar el gap»*.

**Acción.** Escribir la historia de la puerta de acceso (verificación por dominio, código de un uso, una vez por dispositivo, mensaje que explica la razón — RF-1.2.5) y reescribir HU-090 AC-1, o fundir ambas. Corregir después la fila del flow.

---

### 🔴 2.2 · RF-17.3 · O3 no tiene numerador

EP-005 declara `RF-17.3` como capability. El PRD es explícito:

> **RF-17.3** El responsable **agenda la sesión de alineación en un plazo definido** desde la solicitud. Ese plazo es el numerador de O3 y debe estar acordado con Delivery, no supuesto.

Ninguna historia lo cita ni lo cubre por AC. `HU-099` cubre RF-5.4 + RF-17.4 (agendar desde el portal) y `HU-107` cubre RF-9.1.3 + RF-17.4 (escribir la fecha en el negocio) — ambas son el **denominador**. El compromiso de plazo, que es lo que O3 mide, no está en ningún AC. La propia priorización lo roza sin nombrarlo (*«Disidencia anticipada — HU-099 … es la única historia que automatiza el numerador de O3»*), pero HU-099 tampoco declara un plazo.

**Agravante:** `HU-101` («Recibir la solicitud con contexto suficiente») declara en Notas **«Cubre RF-17 completo»**. Sus AC cubren RF-17.1, RF-17.2 y RF-17.5. No cubren RF-17.3 ni RF-17.4. Una historia que se declara completa sobre una familia es lo que impidió ver el hueco.

---

### 🔴 2.3 · RF-16.2, RF-16.3, RF-16.4 · Las decisiones irreversibles no tienen historia

EP-009 declara **RF-16 (completo)**. De los cuatro hijos, solo RF-16.1 tiene historias (HU-065, HU-072, HU-119, HU-140). Los otros tres no aparecen en ninguna HU:

| RF | Qué es | Por qué importa |
|---|---|---|
| **RF-16.2** | Al modelo se le envía la consulta y la taxonomía, **nunca los datos de los perfiles** | PRD §13.7 lo marca **No reversible · «Antes de construir»**. Define el contrato de privacidad e ISO 27000 |
| **RF-16.3** | Separación capa de especificación / capa de recuperación, esquema versionado | PRD §13.7 lo marca **No reversible · «Antes de construir»** |
| **RF-16.4** | El campo de rol **nace como lista** aunque el MVP use un elemento | PRD §13.7: convertirlo después obliga a migrar solicitudes históricas. El backlog §«Visión documentada» lo nombra como uno de los **cuatro requisitos del MVP que existen para no cerrar la bifurcación** |

Son requisitos de arquitectura, no de interfaz — pero el PRD los declara condición previa a construir y el backlog los declara compromiso del MVP. Sin historia, nadie los verifica en un sprint.

---

### 🔴 2.4 · RF-13.8 · El invariante del motor de criterios no tiene AC

`RF-13.8` («Un solo motor de criterios»), `RF-13.8.1` («dentro de tecnologías vale *cualquiera*, no *todas*») y `RF-13.8.2` («un solo aviso a nivel de panel») no son citados por ninguna historia, pese a que EP-009 declara **RF-13 (completo)**.

No es un requisito especulativo: el PRD documenta su origen como un defecto observado en el prototipo Mid-Fi — *«El panel decía cero mientras la pantalla mostraba dos perfiles»*. `HU-085` roza el territorio (AC-3: *«veo que quedan cero perfiles antes de llegar a la pantalla de resultados»*) pero **no enuncia el invariante** —el contador del panel y el número de resultados son siempre el mismo número— ni la semántica de disyunción en tecnologías, que es lo que determina si el banco devuelve resultados o ceros sistemáticos.

---

### 🔴 2.5 · RF-2.5 · El estado en URL es «requisito duro» y no tiene historia

El PRD lo marca literalmente: *«Todo el estado —conjunto curado y filtros— se refleja en la URL, es compartible y pre-cargable. **Requisito duro**»*. La justificación de EP-002 lo repite: *«La URL con estado sigue siendo requisito duro del mecanismo de correo»*.

Ninguna épica lo redacta en su sección de requisitos y ninguna historia lo cita. Con él se caen tres cosas que sí tienen historia: el enlace del correo (HU-114), compartir el enlace con un colega (HU-095) y volver a la selección tras explorar (HU-094).

---

### 🔴 2.6 · EP-003 y EP-004 — el alcance declarado es 6× lo redactado

Es el patrón que EP-006 tuvo hasta el 21 de septiembre, sin resolver.

**EP-003** declara `RF-3 (completo) · RF-6 (completo)` = 18 requisitos de segundo nivel. Escritas: 3 historias (HU-081, HU-119, HU-120). **Sin ninguna historia**: RF-3.1 (tarjeta), RF-3.2 (ficha), RF-3.3 (qué no se publica), RF-3.4, RF-3.5, RF-3.6, RF-3.7, RF-3.8, RF-3.9, RF-3.10 (estructura fija de cinco campos), RF-3.11, RF-3.12 (verificado vs. autoreportado), RF-6.1, RF-6.2, RF-6.3, RF-6.4 (declaración de condición de entrada), RF-6.5 (garantía Neural Speed). Es decir: **la tarjeta y la ficha —el corazón de la épica— no tienen historia**. RF-3.13 (banda de arranque) solo está cubierto del lado del panel (HU-129, HU-132, HU-137); su presentación al cliente, no.

**EP-004** declara `RF-4 (completo)`. Sin historia: RF-4.1 (sumar/quitar), RF-4.2 (contador visible), RF-4.4 (comparador de hasta 3). Las dos historias escritas —HU-080 y HU-084— cubren RF-14.6 y RF-14.7, que **la épica no declara**. La épica está literalmente invertida.

**EP-002** declara `RF-2.3 a RF-2.8 · RF-10 y RF-11` = 19 requisitos, con 2 historias. Sin historia: RF-2.3 (facetas mínimas), RF-2.4 (etiqueta removible por filtro), RF-2.5, RF-2.7 (ordenamiento), y las 13 de RF-10/RF-11 (sondeo de agentes y espacio no-perfil).

---

### 🟡 2.7 · Requisitos que ninguna épica declara y ninguna historia cubre

Doblemente huérfanos: no están en ninguna sección «Requisitos de esta épica» ni en ninguna `Capabilities`, y ninguna HU los cita.

| RF | Enunciado | Nota |
|---|---|---|
| **RF-2.9** | Chips de acceso rápido | marcado *(v1.1)* |
| **RF-2.10** | Autocompletado con conteo por sugerencia | marcado *(v1.1)* |
| **RF-2.11** | Vista agregada del conjunto de resultados | **sin marca de versión** → MVP por defecto; el PRD lo llama «materia prima del reclutamiento inverso (V2-1)» |
| **RF-14.5** | Ficha con condiciones y preferencias de trabajo (modalidad, disponibilidad, idioma) | ninguna épica lo reclama; EP-003 sería su casa |
| **RF-14.0** | Principio de origen del dato | citado por HU-081/HU-082, pero ninguna épica lo declara |
| **RF-14.1 · RF-14.2 · RF-14.6 · RF-14.7** | Ancla de tarjeta · filtros subordinados · vacíos de composición · composiciones de referencia | tienen historia (HU-081, HU-074/110/111, HU-080, HU-084) pero **ninguna épica los declara**: la cadena Historia→Épica→Objetivo se rompe en el eslabón del medio |
| **RF-19.1 a RF-19.8** | Enlaces curados | EP-001 los declara `RF-19 (completo)` pero **no redacta ni uno** en su sección de requisitos |

---

### 🟡 2.8 · Requisitos declarados por épica, sin historia

| RF | Épica que lo declara | Estado |
|---|---|---|
| RF-5.3 (resumen de confirmación antes de enviar) | EP-005 | sin historia. HU-096 revisa el equipo, no el resumen de envío |
| RF-9.3 (propiedades del negocio), RF-9.4 (timeline del contacto), RF-9.5 (propietario + notificación) | EP-007 | sin historia. HU-102 **describe** RF-9.3 en un AC (*«trae la especificación completa como propiedades»*) pero sus Notas dicen *«Cubre RF-9.1 y RF-9.2»* |
| RF-10.1 a RF-10.11, RF-11.1, RF-11.2 | EP-002 | 13 requisitos sin historia. El mapa lo declara honestamente («HU-019 – HU-020 · Sin historia escrita») |
| RF-14.4 (la escasez se declara, no se disimula) | EP-010 | sin historia, pese a figurar en «Historias anticipadas» de la épica |
| RF-19.8 (lista como token del lado del servidor) | EP-001 | sin historia. HU-122 y HU-144 cubren 19.1–19.7 |
| RF-2.6.1 (resultados en dos niveles: directas y relacionados) | EP-009 | sin AC. Ver §4.5 |
| RF-13.5.5.1 / RF-13.5.5.2 (ciudad condicionada; no revelarla por la puerta de atrás) | EP-009 | sin AC en HU-082; **`epicas.md` ni siquiera los transcribe** |
| RF-14.7.0 (alcance: los tres tipos más frecuentes) / RF-14.7.3 (nunca bloquea) | — | HU-084 cita 14.7, 14.7.1, 14.7.2; sus AC cubren de hecho 14.7.0 y 14.7.3, pero sin cita |

---

## 3. Huérfanos bottom-up — artefactos sin razón

**Resultado limpio en el eje sintáctico.** No hay ninguno de estos defectos:

- ✓ Los 11 valores `epica:` usados en frontmatter corresponden a épicas reales (EP-001…EP-011).
- ✓ Ninguna HU carece de épica declarada.
- ✓ Ninguna historia cita un `RF-x.y` que no exista en el PRD.
- ✓ Las 79 historias activas están en `backlog.md`, en `valor-esfuerzo-2026-09-18.md` y en el mapa.
- ✓ Los 11 flows cubren el 100% de las HU de su épica (METODOLOGIA §5a-3); las referencias cruzadas entre flows (HU-077 en EP-005, HU-122 en EP-011, HU-110 en EP-010, HU-078 en EP-008, HU-075 en EP-009) son traspasos legítimos, no errores.
- ✓ Ningún flow referencia una HU inexistente.
- ✓ HU-079 descartada con justificación trazable (cierre de D-15).

### 🟢 3.1 · Rangos de ID referenciados que no existen como archivo

`backlog.md` §«Historias anticipadas sin redactar» y el mapa §«Deuda de mapa» citan `HU-001`–`HU-064`. No existen como archivo. **No son huérfanos**: ambos documentos los declaran explícitamente como alcance reservado, no como IDs vivos. Se registra solo porque un lector automático los leerá como referencias rotas.

**Pero los dos documentos se contradicen sobre dos rangos:**

| Rango | `backlog.md` | `mapa v3.2` |
|---|---|---|
| HU-001 – HU-016 | «MVP» (pendiente) | «**Cubierto** por HU-090 a HU-095, HU-122 y HU-144» |
| HU-059 – HU-064 | «MVP · tablero en v1.1» (pendiente) | «**Cubierto** por HU-102 a HU-117» |

La declaración de «Cubierto» del mapa sobre HU-001–016 es precisamente lo que dejó pasar el hueco de RF-1.2 (§2.1).

---

## 4. Quiebres semánticos

### 🔴 4.1 · HU-095 AC-3 afirma un «banco anonimizado» que el producto ya no tiene

`HU-095` («Compartir el enlace con un colega», `prd_version: 4.0`), escenario edge:

> **Dado** que el enlace llega a alguien ajeno a la cuenta, **cuando** lo abre, **Entonces** ve el **banco anonimizado** sin datos de contacto ni tarifas

Dos contradicciones duras con el PRD 4.8:

1. **No existe un banco anonimizado.** D-1 se revirtió el 2026-09-10: RF-3.1 y RF-3.3 publican **nombre y primer apellido** con trayectoria y clientes nombrados.
2. **Un tercero ajeno no entra.** RF-1.2.2 y el propio flow de EP-001 (`La verificación de dominio corta el acceso externo`) establecen que la verificación por dominio bloquea el acceso externo. El AC dice que ve el inventario.

El flow EP-001 mapea «Enlace fuera de la empresa → HU-095 AC-3» mientras su propio diagrama modela el bloqueo. El AC y el arco que lo cita describen resultados opuestos.

**Causa raíz, y hay que corregirla en el PRD.** `docs/01-prd/portal-people-service.md` §12.2 conserva, **debajo de la fila revisada de D-4**, la nota de justificación anterior:

> **Razón de D-4.** … Lo que queda expuesto —**banco anonimizado, sin identidad ni tarifas**— es información comercial sensible, no crítica. Se acepta el riesgo a cambio de **fricción cero**.

Esa nota contradice la fila D-4 que está tres líneas más arriba («*Revisada el 2026-09-16*») y contradice RF-1.2 entero. HU-090 y HU-095 son fieles a la nota, no a la resolución. Mientras la nota siga ahí, cualquier historia nueva de EP-001 volverá a nacer mal.

### 🟡 4.2 · `epicas.md` v5.2 transcribe requisitos en su versión derogada

La sección «Requisitos de esta épica» de `epicas.md` copia el texto del PRD. Seis copias están congeladas en una versión anterior, y en un caso la épica se contradice a sí misma:

| Requisito | `epicas.md` v5.2 dice | PRD v4.8 dice |
|---|---|---|
| **RF-13.4** | «persiste contra **la cuenta**… ***Bloqueante:*** revisión del modelo de acceso con el CTO antes de implementar. Hay implicación de **ISO 27000**» | «persiste contra **el dispositivo**… (D-16 cerrada el 2026-09-21)… **sin implicación ISO 27000**» |
| **RF-13.5.3** | «Tras D-18: el país del profesional se publica **y la ciudad no**» | «Tras la revisión de D-18 del 2026-09-18: el país siempre; **la ciudad se publica en Presencial 100% o Híbrido**» |
| **RF-13.5.6** | «el portal indica que el emparejamiento se hace **por país** y que la ciudad se revisa en la alineación» | «el portal **muestra la ciudad del profesional junto al país**» |
| **RF-13.5.5.1 / .5.2** | **ausentes** | definidos (ciudad condicionada; no revelable por la puerta de atrás) |
| **RF-3.1** | «…sector, modalidad y **disponibilidad**» | «…**disponibilidad expresada como banda de arranque** (D-10, RF-3.13)» |
| **RF-8.13.2** | ejemplifica con «**disponible desde el 1 de noviembre**» | reescrito para no publicar fechas: «así se lo muestra el portal según RF-3.13» |
| **RF-8.14.1** | «La disponibilidad responde desde cuándo puede empezar» | «…**y se captura como fecha en el panel aunque el portal la publique como banda** (RF-3.13)» |

**El caso de RF-13.4 es autocontradictorio dentro del mismo bloque**: la cabecera de EP-009 dice «*Sin bloqueos. D-16 se cerró el 2026-09-21 en persistencia por dispositivo: RF-13.4 ya no depende de una revisión del modelo de acceso*», y catorce líneas más abajo el cuerpo del requisito declara el bloqueo y la implicación ISO 27000. `HU-073` sí está correcta (v4.8, persistencia por dispositivo): la épica está por detrás de su propia historia.

Además, el frontmatter **declara la desalineación**: `prd_version: 4.8` junto a `prd_version_alineada: 4.5`. Y el encabezado del documento sigue diciendo «Descomposición del PRD v0.3».

### 🟡 4.3 · Historias bajo una épica que no declara su requisito

| Historia | Épica declarada | Requisito que cubre | Épica que declara ese requisito |
|---|---|---|---|
| HU-096 «Revisar mi equipo antes de pedirlo» | EP-005 | RF-4.3, RF-4.5 | **EP-004** (`RF-4 completo`) |
| HU-101 «Recibir la solicitud con contexto» | EP-005 | RF-17.1, RF-17.2, RF-17.5 | **EP-007** |
| HU-080 «Ver qué le falta al equipo» | EP-004 | RF-14.6 | ninguna |
| HU-084 «Ver la forma típica del trabajo» | EP-004 | RF-14.7 | ninguna |
| HU-119 «Saber por qué coincide cada perfil» | EP-003 | RF-13.10 | **EP-009** (`RF-13 completo`) |
| HU-120 «Comparar perfiles sin perder la lista» | EP-003 | RF-13.11 | **EP-009** |
| HU-121 «Comparar perfiles en tabla» | EP-002 | RF-13.12 | **EP-009** |

No son errores de contenido: cada historia está donde el usuario la vive. Es el **mapa de capabilities el que está desactualizado** — la Fase 2 (§13 del PRD) repartió RF-13 y RF-14 por el recorrido del cliente y `epicas.md` no lo recogió. El efecto práctico: quien lea `epicas.md` para saber qué contiene EP-004 verá `RF-4 (completo)` y no encontrará ninguna de sus dos historias.

Caso especial: **EP-004 declara RF-4.4 (comparador de hasta 3)** mientras las dos historias de comparación del proyecto viven en EP-003 (HU-120) y EP-002 (HU-121) bajo RF-13.11/RF-13.12. Hay que decidir si RF-4.4 sobrevive a la Fase 2 o queda derogado por RF-13.12; hoy está en un limbo con épica y sin historia.

### 🟡 4.4 · HU-082 contradice sus propios AC en sus Notas

`HU-082` (`prd_version: 4.7`) tiene AC correctos bajo el D-18 revisado — su edge case dice *«veo la ciudad de cada profesional junto a su país»*. Pero sus Notas conservan el texto anterior:

> tras D-18 se publica el país y **la ciudad se carga sin publicarse** … **Mientras D-18 no se resuelva**, el portal captura la necesidad pero no puede emparejarla

D-18 está resuelta (revisada el 2026-09-18) y la ciudad sí se publica en presencial e híbrido. La nota niega el AC de la misma historia. Además ningún AC cubre **RF-13.5.5.2** (la ciudad se muestra sobre el conjunto que devuelve la necesidad presencial, no sobre el banco completo), que es la regla anti-abuso del requisito.

### 🟡 4.5 · HU-065 elimina el nivel «relacionados» de RF-2.6.1

RF-2.6.1 es explícito: *«Un buscador que devuelve cero ante un casi-acierto es peor que no tener buscador»*, y exige dos niveles de resultado — **coincidencias directas** y **relacionados**. HU-065 (la historia canónica de RF-2.6) resuelve su edge case saltando directo al camino del cero: *«no veo resultados forzados por coincidencia parcial · veo el camino del cero de EP-010»*. Ningún AC del proyecto materializa el nivel «relacionados». Puede ser una decisión deliberada de la Fase 2 —RF-13.9.4 reencuadra el cero como «falla exactamente un obligatorio»— pero **no está declarada**: RF-2.6.1 sigue vigente en el PRD.

### 🟢 4.6 · Citas al RF padre sin el hijo (notación, no cobertura)

Cuatro historias citan solo el ID padre. En estos casos **verifiqué los AC uno a uno y la cobertura material sí existe** — el defecto es de anotación:

| Historia | Cita | Cubre de hecho |
|---|---|---|
| HU-103 | RF-9.7 | 9.7.1, 9.7.2, 9.7.3 (4h/24h), 9.7.4 ✓ |
| HU-118 | RF-13.9 | 13.9.2, 13.9.3, 13.9.4 ✓ |
| HU-121 | RF-13.12 | 13.12.1 a 13.12.6 ✓ |
| HU-085 | RF-13.7 | 13.7.1, 13.7.2, 13.7.3, 13.7.4 ✓ |
| HU-077 | **RF-9** (familia entera) | solo el alta de la solicitud dirigida |

La excepción es **HU-101 con «Cubre RF-17 completo»**, donde la cita al padre sí oculta un hueco real (§2.2).

---

## 5. Deriva de versiones — la causa estructural

La auditoría del 18 de septiembre corrigió la deriva (M-2) a nivel de frontmatter. **Reapareció a nivel de contenido.**

### 5.1 · Historias contra PRD antiguos

Solo **29 de 80** historias declaran `prd_version: 4.8`:

| prd_version | HU | Riesgo |
|---|---:|---|
| 2.0 | 14 | HU-065 a HU-080 — anteriores a D-1 revertida, D-4 revisada, D-10, D-18 revisada |
| 2.1 – 2.5 | 3 | HU-081, HU-083, HU-085 |
| 3.5 | 1 | HU-087 |
| **4.0** | **26** | HU-090 a HU-117 — **anteriores a D-10, D-16, D-18 revisada, D-19 y D-8** |
| 4.1 – 4.2 | 4 | HU-118 a HU-121 |
| 4.7 | 3 | HU-082, HU-088, HU-096 |
| 4.8 | 29 | HU-073, HU-078, HU-084, HU-086, HU-089, HU-110, HU-122 a HU-144 |

El bloque de 26 historias en v4.0 (todo EP-001, EP-005, EP-007, EP-008, EP-011) es donde viven los quiebres 4.1 y 2.1. **No es casualidad: son las historias del «cierre de huecos» de septiembre, y nadie las revisó contra las seis decisiones que se cerraron después.**

### 5.2 · Contradicciones internas de documento

| Documento | Contradicción |
|---|---|
| `backlog.md` | HU-073 «Bloqueada por D-16» y HU-084 «Bloqueada por D-19» **en la misma tabla** que la sección «Decisiones que bloquean backlog: **Ninguna.** D-16 y D-19 se cerraron el 2026-09-21» |
| `backlog.md` | **D-18 aparece dos veces** en «Decisiones cerradas» con resoluciones opuestas: «Solo país publicado; la ciudad se carga y se cruza en la alineación» y «*Revisada:* país siempre; **ciudad publicada en Presencial o Híbrido**» |
| `backlog.md` | Tabla de artefactos: «Mapa de historias · **2.0** — regenerado sobre **PRD 4.5**». El mapa es **v3.2 sobre PRD 4.8** |
| `mapa v3.2` | «El panel de Talento Humano … **D-8 sigue abierta**» — D-8 cerró el 2026-09-18; el propio mapa dice dos tablas más abajo que HU-042–058 está «Cubierto el 2026-09-21» |
| `mapa v3.2` | «**Esta v2.0** reconstruye el mapa sobre el **PRD 4.5**» en un documento cuyo frontmatter dice `version: 3.2` / `prd_version: 4.8` |
| `priorizacion v2.2` | «Quick wins — **29** historias» vs «De las **27** quick wins»; «bajó el backlog de 177 a **173** pts» vs «40 de los **174** pts» vs «Los **134** pts son una escala relativa» |
| `epicas.md v5.2` | `prd_version: 4.8` + `prd_version_alineada: 4.5` + encabezado «Descomposición del PRD **v0.3**» |

### 5.3 · Desvíos menores de la metodología

- **`estado: prototipado`** (9 historias) no pertenece al enum de METODOLOGIA §3 (`draft｜lista｜en-curso｜hecha`). El backlog además traduce `draft` como `borrador` en su columna Estado. Conviene declarar el valor en el CLAUDE.md del proyecto o normalizarlo.
- **El orden de filas del backlog no es la priorización.** METODOLOGIA §6: *«El factor diferencial respecto a "una lista de historias" es el orden… Sin orden no hay backlog, hay una lista»*. `backlog.md` está ordenado por ID (HU-065 → HU-144). El orden existe, pero vive en `valor-esfuerzo-2026-09-18.md` §«Orden de construcción propuesto», que se declara *«Propuesta, no aprobada»*. Es coherente con la regla local de `docs/05-priorizacion/`, pero mientras dure, el artefacto que la metodología llama backlog es una lista.
- **`O1` no tiene meta.** PRD §3 la deja como `<!-- TODO: línea base trimestral -->` → `<!-- TODO: meta -->`. Está declarado como gap en el propio PRD; se registra porque un objetivo sin meta no es verificable y O1 depende de tres épicas.

---

## 6. Reporte de IDs

| Verificación | Resultado |
|---|---|
| IDs de épica usados en frontmatter pero inexistentes | **ninguno** ✓ |
| Historias sin épica declarada | **ninguna** ✓ |
| `HU-XXX` referenciados en mapa/backlog/priorización sin archivo | `HU-001`–`HU-064` (rangos declarados como alcance reservado, no como IDs vivos) |
| `HU-XXX` referenciados en flows sin archivo | **ninguno** ✓ |
| `RF-x.y` citados por historias e inexistentes en el PRD | **ninguno** ✓ |
| Objetivos citados por épicas e inexistentes | **ninguno** ✓ |
| HU escritas ausentes de su flow de épica | **ninguna** ✓ |
| HU escritas ausentes del backlog / mapa / priorización | **ninguna** ✓ |
| Numeración de HU | continua HU-065…HU-144, sin saltos ni duplicados ✓ |
| Numeración de EP | continua EP-001…EP-011 ✓ |

---

## 7. Resumen por severidad

### 🔴 Críticos (6)

| # | Hallazgo | Dónde |
|---|---|---|
| C-1 | **RF-1.2 sin AC, y HU-090 describe el comportamiento derogado de D-4.** El flow EP-001 cita un AC que no contiene la transición que modela | `HU-090`, `06-flows/EP-001` |
| C-2 | **HU-095 AC-3 afirma un «banco anonimizado» inexistente** y da acceso a un tercero ajeno que RF-1.2.2 bloquea. Causa raíz: la nota «Razón de D-4» del PRD §12.2 conserva la justificación anterior a la revisión | `HU-095`, `01-prd §12.2` |
| C-3 | **RF-17.3 —el numerador de O3— no tiene AC.** HU-101 declara «Cubre RF-17 completo» y no lo cubre | `HU-101`, `epicas.md` EP-005 |
| C-4 | **RF-16.2, RF-16.3 y RF-16.4 sin historia**, siendo decisiones que PRD §13.7 marca no reversibles y «antes de construir», y RF-16.4 compromiso declarado del MVP | `epicas.md` EP-009 |
| C-5 | **EP-002, EP-003 y EP-004 declaran 42 requisitos y tienen 7 historias.** La tarjeta, la ficha, el encuadre del estándar y el núcleo de «Mi equipo» —el eje de O2— no tienen historia | `epicas.md`, `backlog.md` |
| C-6 | **RF-13.8 (invariante panel/resultados) y RF-2.5 (estado en URL, «requisito duro») sin historia** | `epicas.md` EP-009, EP-002 |

### 🟡 Mayores (7)

| # | Hallazgo |
|---|---|
| M-1 | `epicas.md` v5.2 transcribe **7 requisitos en su versión derogada** (RF-13.4, RF-13.5.3, RF-13.5.6, RF-3.1, RF-8.13.2, RF-8.14.1) y **omite RF-13.5.5.1/.5.2**. EP-009 se contradice a sí misma sobre D-16 |
| M-2 | **51 de 80 historias escritas contra PRD anterior a 4.8**, 26 de ellas en v4.0 (EP-001, 005, 007, 008, 011 completas) — el bloque donde viven C-1 y C-2 |
| M-3 | **25 RF-x.y que ninguna épica redacta**, incluidos los 8 de RF-19 (EP-001 los declara `completo` y no escribe ninguno) y los 5 de RF-17 |
| M-4 | **7 historias bajo una épica que no declara su requisito** (RF-4.3/4.5, RF-13.10/13.11/13.12, RF-14.6/14.7). El mapa de capabilities no recogió el reparto que hizo la Fase 2 |
| M-5 | **Contradicciones internas** en backlog (D-16/D-19 bloqueando y no bloqueando; D-18 duplicada con resoluciones opuestas), mapa (D-8 «sigue abierta») y priorización (29 vs 27; 173 vs 174 vs 134 pts) |
| M-6 | **RF-10 y RF-11 (13 requisitos, sondeo y espacio no-perfil) sin historia**, más RF-9.3/9.4/9.5, RF-5.3, RF-14.4, RF-14.5, RF-19.8, RF-2.9/2.10/2.11 |
| M-7 | **HU-082 contradice sus AC en sus Notas** (D-18) y no cubre RF-13.5.5.2 |

### 🟢 Menores (5)

| # | Hallazgo |
|---|---|
| m-1 | `estado: prototipado` fuera del enum de METODOLOGIA §3 (9 historias) |
| m-2 | El orden de filas de `backlog.md` no es la priorización (METODOLOGIA §6); el orden vive en priorización y está «no aprobado» |
| m-3 | O1 sin línea base ni meta (`<!-- TODO -->` en PRD §3) |
| m-4 | HU-065 no materializa el nivel «relacionados» de RF-2.6.1, sin declarar que se deroga |
| m-5 | Citas al RF padre sin el hijo en HU-077, HU-085, HU-103, HU-118, HU-121 — verificadas: cobertura material correcta, defecto de anotación |

---

## 8. Contraste con la auditoría manual del 2026-09-18

La auditoría previa afirma en su tabla de cierre:

> | RF-1 a RF-19 → épicas | ✓ los 19 cubiertos |

y en M-3: *«**Cobertura RF-1 a RF-19 ahora completa.**»*

**La afirmación es correcta en su propio nivel de medición y engañosa como conclusión.** Verifica que cada **familia** RF-1…RF-19 esté nombrada en alguna `Capabilities`. Eso es cierto: las 19 lo están. Pero la unidad que el equipo construye no es la familia, es el `RF-x.y`, y a ese nivel **60 de 133 no tienen historia**.

El propio documento lleva la contradicción dentro: dos líneas bajo el ✓ escribe *«**Sin cobertura:** las ~30 historias anticipadas que nunca se redactaron, concentradas en EP-006, EP-003, EP-004 y EP-002»*. Ambas frases no pueden ser verdad a la vez. La segunda es la correcta.

Tres precisiones más:

1. **M-3 afirma que «las historias sí existían — HU-099, HU-101 y HU-107 cubren RF-17».** Cubren RF-17.1, 17.2, 17.4 y 17.5. **RF-17.3 no lo cubre ninguna** — y es el requisito del que depende O3. El audit por familia no podía verlo.
2. **M-3 añadió `RF-19 (completo)` a EP-001 y `RF-17.x` a EP-005/EP-007 sin transcribir los requisitos** a la sección «Requisitos de esta épica». La corrección cerró el hueco en la línea de `Capabilities` y dejó el cuerpo de la épica vacío: es el origen directo del hallazgo M-3 de este audit.
3. **Los conteos están congelados**: la tabla de cobertura habla de «58 historias» y la de priorización de «57 activas»; hoy son **79 activas + 1 descartada**. El documento se actualizó por secciones (M-1 y m-5 llevan fecha del 22 de septiembre) pero no su tabla de cierre.

**Lo que la auditoría previa acertó y este audit confirma:** B-1 (EP-006 sin backlog) está genuinamente resuelto — EP-006 es hoy la épica mejor trazada del proyecto, con 25 historias y 85 AC; B-2 (decisiones bloqueantes) está resuelto; M-1 (duplicación HU-078/HU-110) está resuelto y resuelto bien; m-5 (3-5 escenarios) está resuelto: **ninguna de las 80 historias queda fuera del rango**. Y su «deuda que este trabajo no cubre» sobre EP-004 sigue siendo exacta.

---

## 9. Acciones recomendadas (top 5)

1. **Borrar del PRD §12.2 la nota «Razón de D-4»** que conserva la justificación anterior al 2026-09-16, y reescribirla contra RF-1.2. Después corregir `HU-090` (AC-1 sin puerta de acceso) y `HU-095` (AC-3 con «banco anonimizado»), y escribir la historia de verificación por dominio que RF-1.2.1–1.2.5 exige. Sin esto, cualquier historia nueva de EP-001 nace derogada. *Es la única acción con exposición de datos personales detrás.*
2. **Reconciliar `epicas.md` v5.2 con el PRD v4.8**: transcribir de nuevo los 7 requisitos congelados (RF-13.4 el primero — la épica se contradice a sí misma), añadir RF-13.5.5.1/.5.2, redactar los 8 hijos de RF-19 en EP-001 y los 5 de RF-17 en EP-005/EP-007, y poner `prd_version_alineada: 4.8`.
3. **Escribir el núcleo de EP-003 y EP-004** —tarjeta (RF-3.1), ficha (RF-3.2, RF-3.10, RF-3.12), encuadre del estándar (RF-6.1–6.5), sumar/quitar/contador/recuperar (RF-4.1, RF-4.2)— y decidir si RF-4.4 sobrevive a RF-13.12. Es el mismo trabajo que desbloqueó O5 el 21 de septiembre, aplicado ahora a O2.
4. **Cubrir los cuatro requisitos que sostienen una métrica o una decisión irreversible**: RF-17.3 (numerador de O3), RF-16.2/16.3/16.4 (contrato del modelo y multi-rol — «antes de construir» según PRD §13.7), RF-13.8 + RF-13.8.1 (invariante del motor de criterios) y RF-2.5 (estado en URL, «requisito duro»).
5. **Pasar las 51 historias con `prd_version < 4.8` por una revisión de decisiones**, empezando por el bloque de 26 en v4.0 (EP-001, EP-005, EP-007, EP-008, EP-011): contrastar cada una contra D-1, D-4, D-8, D-10, D-16, D-18 y D-19. Y **limpiar las contradicciones internas** de backlog (D-16/D-19 «bloqueando», D-18 duplicada), mapa («D-8 sigue abierta», «esta v2.0») y priorización (29/27, 173/174/134).

---

*Este audit no modificó ningún artefacto. Regla dura del agente: solo reportar.*
