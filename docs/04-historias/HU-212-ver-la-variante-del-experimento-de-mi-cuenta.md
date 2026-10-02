---
id: HU-212
titulo: "Que cada cuenta vea siempre su variante, con o sin Perfil Objetivo"
epica: EP-009
prioridad: media
complejidad: M
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-070]
---

# HU-212 — Que cada cuenta vea siempre su variante, con o sin Perfil Objetivo

**Como** responsable de Mercadeo que en la revisión trimestral decide si el Perfil Objetivo se queda,
**quiero** que cada cuenta vea siempre la variante que el servidor le asignó, con o sin Perfil Objetivo, y que el navegador no pueda cambiarla,
**para** que la comparación de HU-186 mida dos experiencias reales y no una mezcla.

## Criterios de aceptación

### Happy path — la cuenta asignada a «sin Perfil Objetivo»

**Dado** que hay un experimento activo y la cuenta «Cuenta B (ficticia)» está asignada a la variante «sin Perfil Objetivo»
**Cuando** un invitado de esa cuenta envía «desarrollador frontend react»
**Entonces** ve la lectura como etiquetas removibles y los resultados del mismo motor, con «Desarrollador Frontend» obligatorio y «React» deseable
**Y** no ve el Perfil Objetivo ni ningún acceso a él (reto, obligatorio o deseable, opciones con conteo, ubicación)

### Happy path — la cuenta asignada a «con Perfil Objetivo»

**Dado** que hay un experimento activo y la cuenta «Cuenta A (ficticia)» está asignada a la variante «con Perfil Objetivo»
**Cuando** un invitado de esa cuenta envía «desarrollador frontend react»
**Entonces** ve la lectura, los resultados y el Perfil Objetivo con sus campos
**Y** sus eventos `instruccion_enviada` y `perfil_objetivo_editado` quedan con la variante «con Perfil Objetivo»

### Error — el navegador intenta elegir la variante

**Dado** que la cuenta «Cuenta B (ficticia)» está asignada a «sin Perfil Objetivo»
**Cuando** un invitado de esa cuenta manipula su navegador para mandar en el lote de eventos la clave `variante` con el valor «con Perfil Objetivo»
**Entonces** el servidor descarta esa clave y los eventos quedan con «sin Perfil Objetivo»
**Y** la variante guardada en su sesión sigue siendo «sin Perfil Objetivo», que es la que lee el render de cada página

### Edge case — dos colegas de la misma cuenta ven lo mismo

**Dado** que la cuenta «Cuenta B (ficticia)» está asignada a «sin Perfil Objetivo» y dos invitados distintos de esa cuenta entran desde dispositivos distintos
**Cuando** cada uno envía una instrucción
**Entonces** los dos ven la variante «sin Perfil Objetivo»

### Edge case — sin experimento activo

**Dado** que no hay ningún experimento activo
**Cuando** un invitado de cualquier cuenta envía una instrucción
**Entonces** ve el Perfil Objetivo, que es el producto que define el PRD
**Y** sus eventos no llevan variante

## Notas

Cubre la parte de EP-009 de la prueba de falsación de **RF-13.1** (medición A/B de tiempo hasta el primer perfil abierto, con y sin Perfil Objetivo; condición de permanencia, no de lanzamiento) y la métrica de éxito de la épica. Cierra lo que HU-186 (EP-008, lista) espera de esta épica: «EP-009 emite `perfil_objetivo_editado` y asigna la variante en el servidor al abrir la sesión». La lectura, el encendido y el apagado del experimento son de **HU-186**.

**Nace el 2026-10-02 (discovery de EP-009)** porque ninguna historia de la épica mostraba u ocultaba el Perfil Objetivo según la variante.

**Cómo se construye (ADR-0006, V6-3, negociable):** tabla `operacion.experimentos`; al abrir la sesión, `ResolverAtribucion` calcula la variante con `HMAC(sal, id de la cuenta) mod 2` y la guarda en la sesión; el render lee la variante de la sesión; cada evento se enriquece con ella en el servidor; la clave `variante` del navegador se descarta. Para probar esta historia antes de HU-186 basta un experimento sembrado en la tabla.

**Decisiones por delegación del sponsor (elegidas por el modelo):**
- **Sin experimento activo, todos ven el Perfil Objetivo.** HU-186 lo dejaba abierto con esta misma propuesta («la que el PRD define como producto»); ADR-0006 dice «todos reciben el control», y el control es el producto definido.
- **Qué quita la variante «sin Perfil Objetivo»:** el panel (reto, obligatorio y deseable, opciones con conteo y ubicación). Se conservan la barra, la lectura con etiquetas removibles y el mismo motor con los valores por omisión (solo el rol obligatorio). La solicitud de esa variante viaja con la especificación inferida y su marca (HU-211). Así las dos variantes solo difieren en lo que se mide.
- **Unidad de asignación = cuenta, 50/50** (D71).
- **Sesiones internas y demo** quedan marcadas y no cuentan en la lectura (D68, HU-186); qué variante ven no cambia esta historia.

## Trazabilidad

Épica madre: **EP-009** · PRD v4.18 · RF-13.1 (prueba de falsación) · D71 · D68 · ADR-0006 (variante en servidor, V6-3, eventos de falsación) · depende de HU-070 (misma épica) · alimenta HU-186 (EP-008)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada del Perfil Objetivo (misma épica); se prueba con un experimento sembrado, sin esperar a HU-186 |
| N | Negociable | ✓ son fijos la asignación en servidor por cuenta, que el navegador no la elige y que sin experimento se ve el producto; qué se oculta exactamente se negocia |
| V | Valiosa | ✓ sin ella HU-186 no tiene qué comparar y la permanencia del Perfil Objetivo se decidiría sin evidencia |
| E | Estimable | ✓ M: asignación al abrir la sesión, bandera en el render, enriquecimiento de eventos y descarte de la clave del navegador |
| S | Pequeña | ✓ M: cinco escenarios sobre un mecanismo |
| T | Testeable | ✓ e2e con experimento sembrado y dos cuentas fijadas a cada variante; lote de eventos manipulado; lectura de la variante en la tabla de eventos |
