---
id: HU-184
titulo: "Ver si las composiciones de referencia agrandan los equipos pedidos"
epica: EP-008
prioridad: media
complejidad: S
estado: draft
fase: telemetria-y-medicion
prd_version: 4.17
depende_de: [HU-167]
---

# HU-184 — Ver si las composiciones de referencia agrandan los equipos pedidos

**Como** Dirección de Mercadeo, responsable de producto del portal,
**quiero** comparar el promedio de perfiles por solicitud y el abandono en la pantalla de equipo entre las visitas que vieron una composición de referencia y las que no,
**para** aplicar la regla de retirada de RF-14.7 que el PRD fijó antes de observar, y sostener o retirar las composiciones con datos.

## Criterios de aceptación

### Happy path — efecto de las composiciones de referencia

**Dado** que en el período hubo solicitudes de visitas que vieron una composición de referencia y de visitas que no la vieron,
**cuando** abro la lectura de composiciones en Medición,
**Entonces** veo para cada grupo el número de visitas, el promedio de perfiles por solicitud y el abandono en la pantalla de equipo
**Y** la lectura señala si se cumple alguna de las dos condiciones de retirada de RF-14.7: que el promedio no suba o que el abandono suba

### Error — no hay criterio para dar la comparación por buena

**Dado** que no se ha fijado cuántas visitas hacen falta en cada grupo para que la comparación cuente,
**cuando** abro la lectura de composiciones,
**Entonces** la comparación aparece con el número de visitas de cada grupo y rotulada como lectura descriptiva
**Y** la lectura no declara que las composiciones deban retirarse ni sostenerse

### Error — las composiciones todavía no se emiten

**Dado** que el portal aún no emite los eventos «composición vista» ni «composición descartada»,
**cuando** abro la lectura de composiciones,
**Entonces** la lectura dice «aún no se mide» y nombra la épica que debe emitirlos
**Y** no muestra una comparación con un grupo vacío

### Edge case — visita de un tipo de proyecto sin composición

**Dado** que una visita declaró un reto de un tipo de proyecto que no está entre los tres con composición real (D-19) y envió una solicitud,
**cuando** abro la lectura de composiciones,
**Entonces** esa visita cuenta en el grupo que no vio composición
**Y** no aparece como composición vista ni descartada

### Edge case — visita que vio y descartó la composición

**Dado** que una visita vio una composición de referencia, la descartó y envió una solicitud,
**cuando** abro la lectura de composiciones,
**Entonces** esa visita cuenta en el grupo que la vio
**Y** la lectura muestra aparte cuántas de ese grupo la descartaron

## Notas

Cubre la **prueba que falsea RF-14.7** (composiciones de referencia: *si no sube el promedio de perfiles por solicitud, o si sube el abandono en la pantalla de equipo, se retira*). Vista `v_composiciones` de ADR-0006 (eventos `composicion_vista`, `composicion_descartada`).

**Nace el 2026-10-02 de la partición de HU-170** (validador independiente: fallaba la S). **Partición, no recorte**: la lectura de composiciones que estaba en HU-170 pasa entera a esta historia, también en EP-008.

**De dónde salen los datos.** EP-009 emite las composiciones y el reto declarado; las solicitudes y la pantalla de equipo, EP-005 y EP-004. Se construye y prueba con eventos fijados del contrato de HU-167; mientras EP-009 no emita, dice «aún no se mide». Fuera de los tres tipos de proyecto de D-19 el portal no muestra composición (RF-14.7.0), así que esas visitas caen en el grupo que no la vio.

**Lo que esta historia no decide.** El umbral de suficiencia es parte de **T-26** y está pendiente; por eso el AC conservador es la lectura descriptiva. Retirar las composiciones lo decide el equipo con la regla de RF-14.7; la lectura solo dice si la regla se cumple.

**Resuelto por el sponsor (D73, 2026-10-02), opción conservadora:** quien vio y descartó una composición **cuenta en el grupo que la vio**, y el descarte se muestra aparte. Es lo que ya decía el último edge; no cambia el AC.

**Sesiones reales (D68).** Solo cuentan las visitas con código verificado de un correo que no es `@trycore.com`, por un enlace sin la casilla «demo» (HU-188). D68 no fija el umbral de suficiencia: la lectura sigue siendo descriptiva (error).

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-14.7 (RF-14.7.0, RF-14.7.3) · D-19 · ADR-0006 (eventos de falsación, `v_composiciones`, H32) · T-26 · D68 y D73 (sponsor, 2026-10-02) · sale de HU-170 · depende de HU-167

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: solo usa el contrato de HU-167; no depende de HU-170 ni de HU-185; los datos reales llegan con EP-009 y EP-005 y mientras tanto dice «aún no se mide» |
| N | Negociable | ✓ fija los dos grupos, las dos medidas y las dos condiciones de retirada del PRD; el tratamiento del descarte lo confirmó el sponsor (D73); la forma de la lectura es negociable |
| V | Valiosa | ✓ es la única forma de aplicar la regla de retirada de RF-14.7, el primer peldaño de la venta de células (V2-4) |
| E | Estimable | ✓ S: una consulta que asigna cada visita a un grupo y calcula promedio de perfiles y abandono, con dos rótulos |
| S | Pequeña | ✓ S: una sola lectura en cinco escenarios |
| T | Testeable | ✓ visitas fijadas con composición vista, descartada y no mostrada, de un tipo sin composición y con solicitudes de uno y varios perfiles dan grupos, promedios y señales esperados |
