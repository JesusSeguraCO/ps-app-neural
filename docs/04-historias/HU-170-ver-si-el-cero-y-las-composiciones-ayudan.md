---
id: HU-170
titulo: "Ver si el camino del cero y las composiciones de referencia ayudan"
epica: EP-008
prioridad: media
complejidad: M
estado: draft
fase: telemetria-y-medicion
prd_version: 4.17
depende_de: [HU-167]
---

# HU-170 — Ver si el camino del cero y las composiciones de referencia ayudan

**Como** Dirección de Mercadeo, responsable de producto del portal,
**quiero** ver en qué terminan las pantallas sin coincidencia, si las composiciones de referencia cambian el tamaño de los equipos pedidos y cuánto falta para el disparador de la ruta por reto,
**para** sostener o retirar esas piezas con la regla que el PRD fijó antes de observar, y no por impresión.

## Criterios de aceptación

### Happy path — en qué terminan los ceros

**Dado** que en el período hubo visitas de clientes que llegaron a una pantalla sin coincidencia,
**cuando** abro la lectura del camino del cero,
**Entonces** veo cuántas terminaron en solicitud dirigida, cuántas siguieron por lo más cercano o refinando y cuántas abandonaron
**Y** veo la proporción que terminó en solicitud dirigida, que es la métrica de éxito de EP-010

### Happy path — efecto de las composiciones de referencia

**Dado** que hubo solicitudes de visitas que vieron una composición de referencia y de visitas que no la vieron,
**cuando** abro la lectura de composiciones,
**Entonces** veo para cada grupo el promedio de perfiles por solicitud y el abandono en la pantalla de equipo
**Y** la lectura señala si se cumple alguna de las dos condiciones de retirada de RF-14.7: que el promedio no suba o que el abandono suba

### Happy path — disparador de la ruta por reto

**Dado** que se han registrado solicitudes con dos o más perfiles y reto declarado,
**cuando** abro la lectura,
**Entonces** veo cuántas van de las 50 que fija §14.5
**Y** al llegar a 50 la lectura dice que la condición del disparador se cumplió

### Error — no hay criterio para dar una comparación por buena

**Dado** que no se ha fijado cuántos casos hacen falta para que una comparación cuente,
**cuando** abro cualquiera de estas lecturas,
**Entonces** cada comparación muestra el número de casos de cada grupo y aparece rotulada como lectura descriptiva
**Y** la lectura no declara que una pieza deba retirarse ni sostenerse

### Edge case — salir del cero refinando

**Dado** que una visita llegó a una pantalla sin coincidencia, quitó un criterio y terminó enviando una solicitud normal,
**cuando** se clasifica esa visita,
**Entonces** cuenta como «salió del cero refinando»
**Y** no cuenta ni como solicitud dirigida ni como abandono

## Notas

Cubre las mediciones que el PRD pone en manos de la telemetría para tres piezas de la Fase 2: la **métrica de éxito de EP-010** (proporción de pantallas de cero que terminan en solicitud dirigida en lugar de abandono), la **prueba que falsea RF-14.7** (composiciones de referencia: *si no sube el promedio de perfiles por solicitud, o si sube el abandono en la pantalla de equipo, se retira*) y el **disparador de §14.5** (50 solicitudes con dos o más perfiles y reto declarado). Vistas `v_composiciones` y las de cero y cercanos de ADR-0006 (eventos `cero_mostrado`, `cercanos_mostrados`, `composicion_vista`, `composicion_descartada`).

**De dónde salen los datos.** Los eventos los emiten EP-002 (cero y cercanos), EP-009 (composiciones y reto declarado) y EP-010 (solicitud dirigida); las solicitudes, EP-005. Esta historia construye las lecturas y sus definiciones contra el contrato de HU-167; mientras una épica no emita su evento, la lectura correspondiente dice «aún no se mide» (mismo criterio que HU-108). Fuera de los tres tipos de proyecto de D-19 el portal no muestra composición, así que esas visitas caen en el grupo que no la vio.

**Lo que esta historia no decide.** El umbral de suficiencia (cuántos casos hacen falta) es parte de **T-26** («sesión real») y está pendiente; por eso el AC conservador es rotular todo como descriptivo. Mantener la ruta por reto fuera hasta el disparador lo decide §14.5, no esta lectura: la lectura solo dice si se cumplió.

**Abierto para el sponsor:** si una visita que **vio y descartó** una composición cuenta en el grupo que la vio (lo habitual en una comparación así) o aparte; y si la otra condición del disparador —Delivery valida tres composiciones reales (§14.5)— debe aparecer también en esta lectura, aunque no la produce la telemetría.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-7.1 (abandono) · RF-14.3 · RF-14.7 · §14.5 · métrica de éxito de EP-010 · ADR-0006 (eventos de falsación, H32) · T-26 · depende de HU-167

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: se construye y prueba sobre el contrato de HU-167 con eventos fijados; sus datos reales llegan cuando EP-002, EP-005, EP-009 y EP-010 emitan, y mientras tanto declara «aún no se mide» |
| N | Negociable | ✓ fija qué se cuenta y contra qué regla del PRD; la forma de la lectura y su ubicación en Medición son negociables |
| V | Valiosa | ✓ es la única forma de aplicar las reglas de retirada de RF-14.7 y de saber cuándo abrir la ruta por reto sin repetir la discusión cada trimestre |
| E | Estimable | ✓ M: tres consultas sobre la secuencia de la visita y sobre las solicitudes, con el rótulo descriptivo |
| S | Pequeña | ✓ M: tres lecturas de la misma familia (¿la ayuda guiada sirve?) en cinco escenarios |
| T | Testeable | ✓ un conjunto fijo de visitas con cero, cercanos, refinamiento, composición vista o no y solicitudes de uno y varios perfiles da conteos esperados |
