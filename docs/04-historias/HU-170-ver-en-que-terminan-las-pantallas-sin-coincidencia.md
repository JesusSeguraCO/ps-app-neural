---
id: HU-170
titulo: "Ver en qué terminan las pantallas sin coincidencia"
epica: EP-008
prioridad: media
complejidad: S
estado: draft
fase: telemetria-y-medicion
prd_version: 4.17
depende_de: [HU-167]
---

# HU-170 — Ver en qué terminan las pantallas sin coincidencia

**Como** Dirección de Mercadeo, responsable de producto del portal,
**quiero** ver en qué terminan las visitas de clientes que llegaron a una pantalla sin coincidencia —solicitud dirigida, lo más cercano, refinando o abandono—,
**para** saber si el camino del cero cumple la métrica de éxito de EP-010 (que el cero termine en solicitud dirigida y no en abandono) con datos reales y no por impresión.

## Criterios de aceptación

### Happy path — en qué terminan los ceros

**Dado** que en el período hubo visitas de clientes que llegaron a una pantalla sin coincidencia,
**cuando** abro la lectura del camino del cero en Medición,
**Entonces** veo cuántas terminaron en solicitud dirigida, cuántas siguieron por lo más cercano, cuántas salieron refinando y cuántas abandonaron
**Y** veo la proporción que terminó en solicitud dirigida, rotulada como la métrica de éxito de EP-010

### Error — los eventos del cero todavía no se emiten

**Dado** que el portal aún no emite los eventos «cero mostrado» ni «cercanos mostrados» porque sus pantallas no existen,
**cuando** abro la lectura del camino del cero,
**Entonces** la lectura dice «aún no se mide» y nombra la épica que debe emitir el evento
**Y** no muestra 0 % ni ningún conteo como si fuera un resultado

### Error — no hay criterio para dar la proporción por buena

**Dado** que no se ha fijado cuántas visitas con cero hacen falta para que la proporción cuente,
**cuando** abro la lectura del camino del cero,
**Entonces** la proporción aparece con el número de visitas que la sostiene y rotulada como lectura descriptiva
**Y** la lectura no declara que el camino del cero cumple ni que falla

### Edge case — salir del cero refinando

**Dado** que una visita llegó a una pantalla sin coincidencia, quitó un criterio y terminó enviando una solicitud normal,
**cuando** abro la lectura del camino del cero,
**Entonces** esa visita cuenta como «salió del cero refinando»
**Y** no cuenta ni como solicitud dirigida ni como abandono

## Notas

Cubre la **métrica de éxito de EP-010**: proporción de pantallas de cero que terminan en solicitud dirigida en lugar de abandono. Vistas de cero y cercanos de ADR-0006 (eventos `cero_mostrado`, `cercanos_mostrados`), sobre la secuencia de la visita ordenada por `n`.

**Partición 2026-10-02, no recorte** (validador independiente: fallaba la S, tres capacidades en una historia). La redacción anterior juntaba tres lecturas con reglas y fuentes distintas. Se parte en tres historias, las tres en EP-008 y con el mismo alcance que tenía la original:
- **HU-170** (esta): el camino del cero, métrica de EP-010.
- **HU-184**: el efecto de las composiciones de referencia, prueba que falsea RF-14.7.
- **HU-185**: el disparador de la ruta por reto, §14.5.

**De dónde salen los datos.** EP-002 emite el cero y los cercanos; EP-010 emite la solicitud dirigida; las solicitudes las crea EP-005. Esta historia construye la lectura y su definición contra el contrato de HU-167 y se prueba con eventos fijados; mientras una épica no emita, la lectura dice «aún no se mide» (mismo criterio que HU-108).

**Sesiones reales (D68, sponsor 2026-10-02).** Solo cuentan las visitas con código verificado de un correo que no es `@trycore.com`, por un enlace que no se generó con la casilla «demo» (HU-188); las internas y las demo quedan fuera (HU-167). La visita termina al cerrar la pestaña o tras **30 minutos sin actividad** (D73), que es cuándo un cero cuenta como abandono.

**Lo que esta historia no decide.** D68 cerró qué es una sesión real, pero **no** fijó cuántos casos hacen falta para que la proporción cuente; por eso el AC conservador sigue rotulando la lectura como descriptiva.

**Abierto para el sponsor:** si una visita que llegó varias veces al cero cuenta una vez (por visita) o una por pantalla de cero; la métrica de EP-010 habla de «pantallas de cero» y esta lectura propone contar visitas.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-7.1 (abandono) · RF-14.3 · métrica de éxito de EP-010 · ADR-0006 (eventos de falsación, H32) · T-26 · D68 y D73 (sponsor, 2026-10-02) · partida con HU-184 y HU-185 · depende de HU-167

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: se construye y prueba sobre el contrato de HU-167 con eventos fijados; no depende de HU-184 ni de HU-185; los datos reales llegan con EP-002, EP-005 y EP-010 y mientras tanto dice «aún no se mide» |
| N | Negociable | ✓ fija los cuatro desenlaces, la proporción de la métrica de EP-010 y los rótulos «aún no se mide» y descriptivo; la forma de la lectura y la unidad de conteo son negociables |
| V | Valiosa | ✓ dice si el camino del cero convierte el «no tenemos» en una solicitud dirigida o en una pérdida, que es la razón de existir de EP-010 |
| E | Estimable | ✓ S: una consulta sobre la secuencia de la visita que clasifica su desenlace tras el primer cero, con dos rótulos |
| S | Pequeña | ✓ S: una sola lectura en cuatro escenarios |
| T | Testeable | ✓ visitas fijadas con cero seguido de solicitud dirigida, de cercanos, de refinamiento y de abandono, y un contrato sin eventos de cero, dan conteos y rótulos esperados |
