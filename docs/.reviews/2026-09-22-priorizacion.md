---
artefacto: revision
agente: priorizacion-auditor
fecha: 2026-09-22
audita: docs/05-priorizacion/valor-esfuerzo-2026-09-18.md (v2.2)
contra: docs/03-backlog/backlog.md (v5.2) · METODOLOGIA.md §7 · docs/05-priorizacion/CLAUDE.md
---

# Priorización Audit — 2026-09-22

**Sesión auditada**: `docs/05-priorizacion/valor-esfuerzo-2026-09-18.md` — v2.2
**Framework declarado**: Valor / Esfuerzo (matriz 2×2) — coincide con el método aplicado y con el framework del proyecto (`CLAUDE.md` raíz).

## Resumen

La **aritmética es impecable y la clasificación está completa**: las 79 historias activas caen en un cuadrante, ninguna se repite, ninguna queda fuera, y las cuatro cuentas de historias, puntos y porcentajes reproducen exactamente lo que se deriva de `backlog.md`. Verificado celda por celda.

El problema no está en las cuentas. Está en **cuánta señal contienen** y en **la conclusión que se cuelga de ellas**.

Dos hallazgos bloquean la aprobación:

1. La afirmación más fuerte del documento —«dividir cuatro historias bajó el backlog de 177 a 173 pts, luego la L medía desconocimiento»— **es falsa en la aritmética y no se sostiene en la lógica**. Tres de esos cuatro puntos no vienen de dividir nada: vienen de comparar dos poblaciones distintas. El punto restante es un artefacto mecánico de la escala S=1/M=3/L=8.
2. La matriz **no añade información sobre el backlog**. Es una recodificación determinista de dos columnas categóricas que nadie debatió (`prioridad`, con solo dos niveles usados) ni validó (`complejidad`, marcada «por confirmar con Tecnología» en 75 de 79 historias). El documento lo declara con honestidad poco común en sus Supuestos 1 y 2 — y luego escribe siete conclusiones que exceden esa base.

---

## Consistencia del framework

| Chequeo | Resultado |
|---|---|
| ¿Todas las historias activas clasificadas? | ✓ 79 de 79. Cero sin clasificar, cero duplicadas, cero clasificadas que no estén activas |
| ¿HU-079 (descartada) correctamente excluida? | ✓ |
| ¿Cuadrantes derivados consistentemente de `prioridad` × `complejidad`? | ✓ **regla perfecta, 0 excepciones en 79 casos** |
| ¿Cuentas y puntos cuadran? | ✓ los cuatro cuadrantes, exactos |
| ¿Total del backlog activo = 173 pts? | ✓ |
| ¿`prioridad`/`complejidad` sincronizadas entre `backlog.md` y los 79 `HU-XXX.md`? | ✓ **0 desalineadas** |

**Regla de derivación reconstruida** (implícita, nunca escrita como tal en el documento):
`alta`+`S` → Quick wins · `alta`+`M|L` → Big bets · `media`+`M|L` → Cuestionar · `media`+`S` → Relleno.

Recálculo independiente desde `backlog.md`:

| Cuadrante | Declarado | Recalculado | |
|---|---|---|---|
| Quick wins | 29 hist · 29 pts · 17% | 29 · 29 · 17% | ✓ |
| Big bets | 26 hist · 83 pts · 48% | 26 · 83 · 48% | ✓ |
| Cuestionar | 16 hist · 53 pts · 31% | 16 · 53 · 31% | ✓ |
| Relleno | 8 hist · 8 pts · 5% | 8 · 8 · 5% | ✓ |

Cumple la heurística del agente («Quick wins debería ser el cuadrante con más items»): 29, el mayor. Cumple la regla local 2 en lo aplicable (el tope del 60% es de MoSCoW; aquí el 65% del esfuerzo en alto valor no dispara alerta).

---

## 🔴 Bloqueante B-1 · La conclusión sobre la escala L no se sostiene

> §0: «Dividir historias sobrecargadas bajó el backlog de 177 a 173 pts… La L no medía trabajo: medía **desconocimiento**.»

Se descompone en tres errores, en orden de gravedad.

### (a) Tres de los cuatro puntos vienen de cambiar la población, no de dividir

Reconstruí el backlog deshaciendo las cuatro divisiones del 22-sep:

| Estado | Historias | Pts |
|---|---|---|
| Antes de dividir, **contando HU-079 (descartada el 2026-09-14)** | 75 filas | **177** |
| Antes de dividir, **solo activas** | 74 activas | **174** |
| Hoy, solo activas | 79 activas | **173** |

El «177» es el total **con la historia descartada dentro**; el «173» es el total **sin ella**. HU-079 se descartó ocho días antes de la división y pesa exactamente los 3 pts que faltan. La comparación 177 → 173 pone un número de la población A contra un número de la población B.

**Efecto neto real de dividir: −1 pt, no −4.** El documento lo demuestra sin darse cuenta: su propia tabla de §0 suma 27 pts antes y 26 después.

Corolario: **las divisiones crearon 5 historias nuevas, no 4** (HU-140, 141, 142, 143, 144). El «ganó 4 historias y perdió 4 pts» falla en ambos lados.

### (b) El punto que queda es un artefacto de la escala, no un hallazgo

Con S=1 / M=3 / L=8, el salto M→L es de 2,67×. Eso hace que **partir una L en piezas no-L reduzca puntos por construcción**: L→M+M = 6 < 8; L→M+M+S = 7 < 8; M→S+S = 2 < 3. Para que una L no baje al partirse hacen falta tres M o que una pieza siga siendo L.

Los cuatro casos obedecen esa mecánica sin excepción — **incluido el único que subió**: HU-131 subió porque una de sus piezas conservó la L. No es «la parte genuinamente cara escondida»; es la definición de la escala.

La prueba decisiva es cambiar la escala sin tocar una sola etiqueta de tamaño:

| Escala | Antes | Después | Δ |
|---|---|---|---|
| **Sesión — S=1 M=3 L=8** | 27 | 26 | **−1** |
| Fibonacci — S=1 M=2 L=5 | 17 | 18 | **+1** |
| Camiseta — S=1 M=3 L=5 | 18 | 23 | **+5** |
| Lineal — S=1 M=2 L=3 | 11 | 16 | **+5** |
| Fibonacci desplazada — S=2 M=3 L=5 | 18 | 26 | **+8** |

**El signo del resultado lo decide la elección de pesos, no el ejercicio de dividir.** Con cinco de seis escalas razonables el backlog *sube* al dividir, y la conclusión se invierte palabra por palabra: «la L subestimaba el trabajo». Una conclusión que cambia de sentido según una constante que nadie justificó no es un hallazgo sobre el backlog.

### (c) No hay medición independiente ni caso que la sostenga

- Las piezas las re-etiquetó **el mismo estimador** que puso la L original, el mismo día, sin construir nada. No hay observación de trabajo real: solo dos rondas de la misma opinión. Concluir que la primera medía «desconocimiento» exige un tercer dato que no existe.
- n = 4, de un solo lote, sin grupo de control.
- **Contradice el Supuesto 2 del propio documento**: «Los pts son una escala relativa útil para ordenar, **no una estimación**». Un instrumento declarado inválido para estimar no puede después demostrar qué estaba midiendo la estimación.
- La frase de cierre —«es exactamente lo que el tope de cinco escenarios existe para detectar»— **es falsa para HU-131**: la auditoría previa registra que HU-131 tenía **3 AC** (dentro del rango) y se dividió *«por complejidad, no por AC»*. El tope detectó 3 de 4, y justamente no detectó la única que subió, que es la que el argumento usa como excepción reveladora.

**Origen**: el párrafo está copiado casi literalmente de `docs/.reviews/2026-09-18-auditoria-manual.md` §m-5. La sesión de priorización **importó la afirmación sin verificarla**. El error vive en los dos documentos.

**Veredicto**: narrativa impuesta sobre un artefacto de escala, montada además sobre una comparación de poblaciones distintas. El ejercicio de dividir fue **correcto y valioso** —mejoró la granularidad, destapó el corte por actores de HU-122, aisló la parte cara de HU-131—. Lo que no se sostiene es usar el delta de puntos como evidencia de qué medía la L.

---

## 🔴 Bloqueante B-2 · La matriz no añade información sobre el backlog

No es un error de ejecución: es el techo del método, y conviene que quede escrito antes de que alguien decida con esto.

**1. Los dos ejes salen de dos columnas del backlog, sin nada en medio.** No hubo ponderación, ni votación, ni un segundo criterio. La matriz es una función determinista de `prioridad × complejidad`. Con 2 valores de prioridad y 3 de complejidad hay **6 combinaciones posibles**, mapeadas a 4 cuadrantes. Reordenar las 79 historias por esas dos columnas en una hoja de cálculo produce exactamente el mismo resultado, en un minuto. La sesión **no puede descubrir nada que las columnas no dijeran ya**.

**2. El eje de valor no tiene nivel bajo.** `prioridad` solo usa `alta` (55) y `media` (24); **cero historias marcadas `baja`**. «Bajo valor» en la matriz significa literalmente *«no marcada alta»*. Sobre eso descansa toda la sección «el cuadrante caro»: las 16 historias de Cuestionar no fueron juzgadas de poco valor por nadie — simplemente no fueron marcadas altas por alguien, en otro momento, con otro propósito. Llamarlas «dieciséis historias de **bajo valor declarado**» le atribuye a la columna una declaración que nunca hizo.

**3. El eje de esfuerzo es casi binario.** El reparto es S=37, M=40, **L=2**. La mitad «alto esfuerzo» es 98% M. El eje real es «S vs. no-S», y colapsa la única distinción grande que la escala tenía (M=3 vs L=8) justo donde importaría.

**4. El esfuerzo nunca lo validó Tecnología — y es peor que «sistemático».** Conté las tablas INVEST de las 79 historias: **75 declaran la E de *Estimable* como «por confirmar con Tecnología»**. Solo 4 tienen una E afirmativa. El 95% del eje de esfuerzo es autoreportado y sin validar, y los dos únicos L del backlog (HU-070, HU-140) están entre los no validados — siendo que la escala les da 8 pts cada uno, el 9% del backlog entre dos historias.

**5. Circularidad.** El documento usa el cuadrante como si fuera un hallazgo («el cuadrante caro hay que discutirlo por si esas historias valen lo que cuestan») cuando el cuadrante es la entrada. La pregunta correcta no es si Cuestionar vale lo que cuesta: es **si la columna `prioridad` está bien puesta**. El documento lo ve en un solo caso —la disidencia sobre HU-099, que es el mejor párrafo del archivo— y no generaliza.

### Qué tan fiable es, entonces

| Uso | Fiabilidad |
|---|---|
| Separar lo barato de lo caro para secuenciar | **Alta.** Las 29 quick wins son S y su lectura («empezar por aquí, 29 pts») se sostiene |
| Detectar concentración de esfuerzo (EP-006 = 35%) | **Alta**, es aritmética sobre las columnas |
| Afirmar que 16 historias «valen poco» y son candidatas a recorte | **Baja.** Hereda una columna que nadie debatió y que no tiene nivel `baja` |
| Afirmar que el 65% del esfuerzo en alto valor «es sano» | **Baja.** Con 70% de historias marcadas `alta`, el numerador está inflado por construcción, no por salud |
| Cualquier afirmación con puntos como magnitud («bajó 4 pts», «pesa 40 pts») | **Nula.** El propio documento declara que no son estimaciones |

El documento declara ambas debilidades con precisión en Supuestos 1 y 2. **El defecto es que las declara y después las ignora**: escribe siete conclusiones numeradas, una tabla de recortes candidatos y un orden de construcción de 10 pasos como si la base fuera firme. La honestidad está en los supuestos; el exceso, en todo lo demás.

---

## 🟡 Mayor M-1 · El orden de construcción deja fuera 13 de 79 historias

El «Orden de construcción propuesto» cubre 66 historias entre sus 10 pasos y la lista «fuera del orden». **Faltan 13** — el 16% del backlog, 25 pts — sin aparecer en ningún paso ni en la lista de exclusiones:

| Historia | Cuadrante | |
|---|---|---|
| **HU-090** Entrar al portal desde el correo sin registrarme | Big bet (M) | la puerta de entrada del producto |
| **HU-096** Revisar mi equipo antes de pedirlo | Big bet (M) | |
| **HU-101** Recibir la solicitud con contexto suficiente | Big bet (M) | la que el Supuesto 1 señala como candidata a *subir* |
| **HU-122** Generar un enlace con los perfiles que elegí | Quick win (S) | |
| **HU-144** Abrir el enlace y encontrar la selección | Quick win (S) | |
| **HU-141**, **HU-142**, **HU-143** | Cuestionar / Relleno | |
| HU-073, HU-088, HU-093, HU-095, HU-100 | Cuestionar / Relleno | |

Nota fina: **HU-122 y HU-144 son las dos mitades de la división que el documento celebra en §0** — y ninguna de las dos tiene lugar en el plan que ese mismo documento propone.

Además: **HU-078 aparece dos veces** (orden 4 y orden 10, esta como «110→078»).

## 🟡 Mayor M-2 · Cinco de los diez totales del orden están mal sumados

| Paso | Declara | Real | Δ |
|---|---|---|---|
| 2 · Base del panel | 12 | **11** | −1 |
| 4 · Big bets EP-009/EP-010 | 29 | **32** | +3 |
| 8 · EP-003 y EP-002 | 10 | **9** | −1 |
| 9 · Auditoría y catálogos | 19 | **14** | −5 |
| 10 · Telemetría y v1.1 | 20 | **21** | +1 |

(Pasos 1, 3, 5, 6, 7 correctos.) El paso 9 se desvía 5 pts, un 36%.

## 🟡 Mayor M-3 · Cifras obsoletas de una versión anterior, en las frases que más peso cargan

| Dónde | Dice | Real |
|---|---|---|
| Supuesto 2 | «Los **134 pts** son una escala relativa» | 173 |
| §5 | «el panel pesa **40 de los 174 pts**, el **23%**» | **60 de 173 = 35%** |
| §4 | «De las **27** quick wins» | 29 |
| §1 | «si esas **trece** historias valen lo que cuestan» | 16 |
| Participantes | «sobre el backlog **v4.0**» | frontmatter declara v5.2 |

El de §5 es el grave: el párrafo argumenta que *«el panel es casi un cuarto de lo que hay que construir y no estaba en ninguna cuenta»*, y lo hace **subestimando el panel en 12 puntos porcentuales**. EP-006 es 35% del backlog y 25 de las 79 historias. El argumento es más fuerte de lo que el documento cree y aun así usa el número equivocado.

## 🟡 Mayor M-4 · El «Estado» condiciona la aprobación a dos cosas que el propio documento da por hechas

> «Para aprobar quedan dos cosas: resolver la duplicación HU-078/HU-110 y escribir las historias faltantes de EP-006.»

§3 declara la duplicación **resuelta el 2026-09-22**; §5 declara las 17 historias de EP-006 **escritas el 2026-09-21**. La sección de cierre quedó sin actualizar en la revisión v2.2, y con ella el estado real de aprobación: o ya no hay condiciones pendientes, o hay otras que nadie escribió.

---

## Cumplimiento de reglas locales (`docs/05-priorizacion/CLAUDE.md`)

| Regla | Estado |
|---|---|
| **1 · Framework aplicado completo** | ✓ 79/79, sin excepciones |
| **2 · Distribución sana** | ✓ no aplica el tope de Must (MoSCoW); Quick wins es el cuadrante mayor |
| **3 · Disidencias registradas** | ✓ **con reserva** — ver abajo |
| **4 · `backlog.md` no reordenado sin aprobación** | ✓ **respetada** — ver abajo |

### Regla 3 — cumplida en forma, con una reserva de fondo

La sección existe y es la mejor parte del documento: nombra el Supuesto 1 (valor heredado), el Supuesto 2 (complejidad autoreportada) y dos disidencias con su consecuencia explícita. La de HU-099 es ejemplar — identifica que queda en Cuestionar por su `prioridad: media` y que eso deja el numerador de O3 en manos de un humano.

La reserva: **no hubo sesión con personas, luego no hubo disidencia real que registrar.** Los participantes son «sesión asistida… pendiente de validación con Jesús Segura, Karen y Jonathan», y las dos disidencias están marcadas *anticipadas* — son predicciones del autor sobre lo que otros dirían, no desacuerdos ocurridos. Es honesto y útil, pero **no es lo que la regla 3 pretende capturar**, y no debe leerse como que la priorización pasó por sus stakeholders. La regla se cumple; el control que la regla existe para ejercer, no.

### Regla 4 — respetada, y ahí aparece una tensión que hay que resolver

`backlog.md` está en **orden estrictamente ascendente de ID (HU-065 → HU-144)**, es decir en orden de escritura. No refleja la priorización propuesta, y el documento lo dice con todas las letras en su Estado. **No hubo reordenamiento sin aprobación.** ✓

Pero eso deja al proyecto en un punto que conviene nombrar: `METODOLOGIA.md` §6 define el backlog como *«lista ordenada… el factor diferencial es el orden. Sin orden no hay backlog, hay una lista»*. Hoy `backlog.md` es una lista. La regla local 4 y §6 apuntan en direcciones opuestas y **solo una aprobación explícita las reconcilia** — que es justo lo que M-4 dejó colgando de condiciones ya cumplidas.

---

## Coherencia con el backlog

| Chequeo | Resultado |
|---|---|
| Columna `prioridad` sincronizada | ✓ trivialmente: la sesión la usa como entrada |
| Frontmatter de las 79 historias vs. backlog | ✓ 0 desalineadas |
| Orden de filas refleja la priorización | ✗ **por diseño**, pendiente de aprobación (regla local 4) |
| `backlog.md` referencia la priorización | ✗ ver m-1 |

### 🟢 Menor m-1 · El backlog no sabe que la priorización existe
`backlog.md` §«Próximo paso del pipeline» dice: *«Priorización formal del backlog (`/trycore:priorizar`)»* — como si no se hubiera hecho. No hay una sola referencia a `docs/05-priorizacion/` en todo el archivo.

### 🟢 Menor m-2 · La columna «Condición o bloqueo» contradice al propio backlog
Las filas de **HU-073** («Bloqueada por D-16») y **HU-084** («Bloqueada por D-19») siguen marcadas como bloqueadas, mientras la sección «Decisiones que bloquean backlog» del mismo archivo dice *«Ninguna. D-16 y D-19 se cerraron el 2026-09-21»*. La sesión de priorización usa la versión correcta («Nada espera una decisión»); el backlog quedó a medio actualizar.

### 🟢 Menor m-3 · Sin fecha de próxima revisión
El agente revisor exige *«próxima revisión: fecha tentativa declarada»*. No hay ninguna. Dado que el documento condiciona todo a las tres sesiones de PRD §13.6, debería fijar la revisión contra ese hito.

### 🟢 Menor m-4 · Una sesión, un archivo — y aquí hay dos sesiones en uno
La regla de convención es *«una sesión por archivo: `<framework>-YYYY-MM-DD.md`»*. El archivo se llama `valor-esfuerzo-2026-09-18.md`, su cuerpo dice «Fecha: 2026-09-18», su frontmatter dice `fecha: 2026-09-22`, y su contenido es una **recalculación del 22-sep** sobre un backlog distinto (74 → 79 historias). Tres fechas en un archivo y la sesión original sobrescrita. Consecuencia práctica: **no queda rastro de la matriz del 18-sep**, que es exactamente lo que habría permitido verificar el «177» sin reconstruirlo.

### 🟢 Menor m-5 · Renombrar los cuadrantes ablanda la instrucción canónica
§7 nombra los cuadrantes «Refactor o dividir» y **«Skip»**. La sesión los renombra «Cuestionar» y **«Relleno»** — *«entran cuando sobra capacidad»*. La posición en la matriz es correcta, pero «Skip» es una instrucción de descarte y «Relleno» es una de inclusión oportunista. Ocho historias que el framework manda saltar quedan invitadas a entrar. Menor porque son 8 pts, pero conviene que el cambio sea deliberado y no tácito.

---

## Lo que sí resiste la auditoría

Para que el peso de lo anterior no lo tape:

- **La ejecución mecánica es exacta.** 79/79 clasificadas, cuatro cuadrantes con puntos y porcentajes correctos al dígito, cero desalineación entre backlog y los 79 archivos de historia. Es raro.
- **§2 (EP-004 invertida)** es un hallazgo real y no depende de los puntos: dos historias escritas, ambas periféricas, núcleo sin redactar. Se sostiene solo con leer los títulos.
- **§3 (HU-078/HU-110)** es el mejor trabajo del documento: no se resuelve retirando una historia, sino descubriendo que RF-7.2 tenía dos mitades y una estaba huérfana. Cierra un duplicado y tapa un hueco de trazabilidad a la vez.
- **La disidencia sobre HU-099** es el único lugar donde el documento cuestiona su propia entrada en vez de razonar sobre ella. Debería ser el patrón, no la excepción.
- **§0, despojada de su conclusión, sigue valiendo**: dividir por el tope de escenarios destapó cortes reales (dos actores distintos en HU-122, una parte cara aislada en HU-131). El ejercicio fue correcto; solo la métrica con la que se celebró no lo es.

---

## Acciones recomendadas, en orden

1. **Reescribir §0.** Registrar: efecto real de dividir = **−1 pt sobre 174**; 5 historias nuevas; y que el signo depende de la escala de pesos. Retirar la conclusión «la L medía desconocimiento» — o sostenerla con evidencia distinta de los puntos (p. ej. los cortes por actor que sí aparecieron). **Corregir también `docs/.reviews/2026-09-18-auditoria-manual.md` §m-5**, que es la fuente.
2. **Encabezar el documento con su límite de validez**: «los cuadrantes son una recodificación de dos columnas del backlog; no hay juicio de valor independiente ni estimación validada». Hoy eso vive enterrado en los Supuestos, al final.
3. **Poner la columna `prioridad` a debate** con Dirección Comercial y Delivery, y **abrir un nivel `baja`**. Mientras no exista, «bajo valor» significa «no marcada alta» y el cuadrante Cuestionar no es accionable.
4. **Validar la complejidad con Tecnología**, empezando por los dos L (HU-070, HU-140 = 16 pts entre dos historias) y por los M de EP-006. 75 de 79 historias declaran la E de INVEST sin confirmar.
5. **Completar el orden de construcción**: ubicar las 13 historias huérfanas —en especial HU-090, HU-096, HU-101, y las dos mitades de HU-122— y eliminar la repetición de HU-078.
6. **Recalcular los cinco totales erróneos** del orden y **actualizar las cinco cifras obsoletas** (134, 174, 40/23%, 27, trece).
7. **Actualizar el «Estado»**: la duplicación y EP-006 ya están resueltas. Declarar qué falta de verdad para aprobar, y fijar **fecha de próxima revisión** contra las sesiones de PRD §13.6.
8. **Decidir sobre el reordenamiento de `backlog.md`.** La regla local 4 se respetó; §6 de la metodología pide orden. Solo una aprobación explícita cierra la tensión — y no debería darse antes de (3) y (4).
9. **Corregir en `backlog.md`** la columna «Condición o bloqueo» de HU-073 y HU-084, y añadir el enlace a la priorización vigente en «Próximo paso del pipeline».
10. **Archivar la matriz del 18-sep** como archivo propio y dejar la v2.2 como `valor-esfuerzo-2026-09-22.md`, para que la próxima recalculación tenga contra qué compararse.
