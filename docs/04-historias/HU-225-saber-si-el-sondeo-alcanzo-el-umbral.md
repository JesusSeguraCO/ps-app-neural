---
id: HU-225
titulo: "Saber si el sondeo de agentes autónomos alcanzó el umbral para pasar a I+D"
epica: EP-002
prioridad: media
complejidad: S
estado: lista
fase: refinamiento-y-descubrimiento
prd_version: 4.18
depende_de: [HU-019, HU-190, HU-112]
---

# HU-225 — Saber si el sondeo de agentes autónomos alcanzó el umbral para pasar a I+D

**Como** Dirección de Mercadeo, con el permiso «Medición» en el panel,
**quiero** ver cuántas cuentas distintas respondieron que sí y cuántas pidieron más detalle, frente al umbral de 5 y 2 y a su plazo,
**para** llevar la oferta de agentes a Investigación y Desarrollo solo con la evidencia acordada, y cerrarla sin que quede flotando si no llega.

## Criterios de aceptación

### Happy path — umbral alcanzado dentro del plazo

**Dado** que dentro del plazo 6 cuentas distintas respondieron «Me interesa» o «Quiero más detalle» y 2 de ellas pidieron detalle,
**cuando** abro el sondeo en Medición,
**Entonces** veo «6 cuentas con sí · meta 5» y «2 cuentas que piden detalle · meta 2»
**Y** veo el estado «Umbral alcanzado: pasa a Investigación y Desarrollo», con la fecha en que se cumplió
**Y** veo, por cuenta, qué respondió cada contacto y su comentario

### Edge case — se cuentan cuentas, no votos

**Esquema del escenario:** varios contactos de una cuenta son una sola cuenta
**Dado** que dentro del plazo respondieron <votos>,
**cuando** abro el sondeo en Medición,
**Entonces** veo <sí> cuentas con sí y <detalle> cuentas que piden detalle

**Ejemplos:**

| votos | sí | detalle |
|---|---|---|
| tres contactos de Bancolombia con «Me interesa» | 1 | 0 |
| un contacto de Bancolombia con «Me interesa» y otro con «Quiero más detalle» | 1 | 1 |
| un contacto de Sura con «No por ahora» | 0 | 0 |

### Error — el plazo cerró sin alcanzar el umbral

**Dado** que el plazo cerró el 15 de enero de 2027 con 4 cuentas con sí y 1 que pide detalle,
**cuando** abro el sondeo en Medición,
**Entonces** veo «Plazo cerrado el 15 ene 2027: umbral no alcanzado»
**Y** veo que la idea no se descarta: no hay evidencia para priorizarla ahora

### Edge case — votos que no cuentan para el umbral

**Dado** que hubo votos de sesiones `@trycore.com`, de enlaces «demo» y de cuentas fuera del plazo,
**cuando** abro el sondeo en Medición,
**Entonces** esos votos no suman en las cifras del umbral
**Y** aparecen aparte, con su motivo: interno, demo o fuera del plazo

### Error — todavía no hay ediciones con salida registrada

**Dado** que el sondeo está activo y ninguna edición curada tiene aún su salida registrada en el panel,
**cuando** abro el sondeo en Medición,
**Entonces** veo los votos recibidos por cuenta
**Y** el plazo y el veredicto dicen «aún no se mide», sin presentar ceros como hallazgo

## Notas

Cubre **RF-10.9** (umbral cerrado, **D-11**: 5 cuentas distintas con sí y al menos 2 que piden más detalle, medido sobre los primeros tres envíos), **RF-10.9.1** (solo pedir detalle alimenta el segundo criterio) y **RF-10.9.2** (el plazo es parte del umbral: sin fecha, un umbral no se cumple ni se descarta).

**Decisiones elegidas por el modelo por delegación del sponsor** (revisables con Mercadeo):
- **Qué es «sí»:** «Me interesa» o «Quiero más detalle» (HU-019). **Qué es «pide detalle»:** solo «Quiero más detalle».
- **Qué son «los primeros tres envíos».** D-11 se cerró cuando el portal enviaba el boletín. Desde la v4.14 (RF-18) un «envío» es la **edición curada con salida registrada** en el panel (RF-18.1, RF-18.5). El plazo se mide **por cuenta**: cuenta un voto emitido en una sesión atribuida (D69, HU-112) a la 1.ª, 2.ª o 3.ª edición con salida registrada de esa cuenta desde que el sondeo se activó.
- **Fecha de cierre, para que el umbral no flote** (RF-10.9.2): el plazo cierra cuando todas las cuentas que tuvieron una primera edición registrada tienen registrada la tercera, **o a los 90 días** de la primera salida registrada tras activar el sondeo, lo que ocurra antes. Los 90 días equivalen a tres ediciones con la cadencia mensual que el PRD supone para el inventario (§10.2); si Mercadeo fija otra cadencia (RF-18.5), cambia ese número, no la mecánica. **Marcado para revisión con Mercadeo.**
- **«Alcanzado» se declara en cuanto se cumple**, sin esperar al cierre del plazo.
- **Solo sesiones reales** (D68): los votos internos y de demo se muestran aparte, nunca en las cifras.
- **Dónde se lee:** en **Medición**, con el permiso «Medición» por persona (D74, HU-190). Se lee de la tabla de votos del portal, no de HubSpot.

**Dependencias de datos.** Las ediciones con salida registrada las crea **EP-011** (RF-18.5); mientras no existan, el plazo dice «aún no se mide» (último escenario), con el mismo patrón que el tablero de HU-171. La atribución de la sesión a la edición es de **HU-112** (EP-008).

## Trazabilidad

Épica madre: **EP-002** · PRD v4.18 · RF-10.9 · RF-10.9.1 · RF-10.9.2 · D-11 · RF-18.1 · RF-18.5 · D68, D69, D74 · depende de HU-019 (votos), HU-190 (EP-008, permiso «Medición») y HU-112 (EP-008, atribución a la edición) · lee las salidas registradas de EP-011 cuando existan · relacionada con HU-224 y HU-171

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: los votos de HU-019 (misma épica), el permiso de HU-190 y la atribución de HU-112 (EP-008, ambas `lista`); sin salidas de EP-011 dice «aún no se mide» y se prueba con ediciones sembradas |
| N | Negociable | ✓ fijos: el umbral D-11, contar cuentas distintas, solo pedir detalle para el segundo criterio, un plazo con fecha y solo sesiones reales; la fecha concreta de cierre y la forma de la lectura son negociables con Mercadeo |
| V | Valiosa | ✓ convierte las respuestas en una decisión con fecha: pasa a I+D o se cierra sin quedar flotando |
| E | Estimable | ✓ S: un conteo por cuenta distinta sobre la tabla de votos, filtrado por sesión real y por número de edición, y una vista en Medición |
| S | Pequeña | ✓ S: una lectura en cinco escenarios |
| T | Testeable | ✓ votos y ediciones sembrados: seis cuentas con dos que piden detalle, tres contactos de una cuenta, un plazo cerrado con cuatro, votos internos, demo y fuera de plazo, y un banco sin ediciones registradas dan cifras y estados exactos |
