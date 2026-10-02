---
id: HU-070
titulo: "Revisar y ajustar la especificación de lo que necesito"
epica: EP-009
prioridad: alta
complejidad: M
estado: lista
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-065, HU-209]
---

# HU-070 — Revisar y ajustar la especificación de lo que necesito

**Como** líder de proyecto que va a pedir un equipo,
**quiero** ver y editar de forma continua una especificación de lo que busco —reto, familia de rol, capacidades, seniority, condiciones de trabajo—, sin pasos de confirmación,
**para** que lo que pida a Trycore describa mi necesidad y no solo los perfiles que alcancé a ver.

## Criterios de aceptación

### Happy path — la especificación nace de mi instrucción

**Dado** que envié «desarrollador frontend senior con react para banca, híbrido»
**Cuando** abro el Perfil Objetivo
**Entonces** veo, en este orden, el reto (vacío y opcional), la familia de rol «Desarrollador Frontend» como obligatoria, «React» en tecnologías, «Senior» en seniority, «Banca» en sector y «Híbrido» en modalidad, estos cuatro como deseables, y la ubicación de la necesidad
**Y** el Perfil Objetivo dice «Inferido, sin revisar»

### Happy path — editar sin confirmar

**Dado** que tengo abierto el Perfil Objetivo con 12 perfiles que cumplen lo obligatorio
**Cuando** añado «TypeScript» en tecnologías
**Entonces** los resultados se recalculan en la misma pantalla, sin botón de confirmar ni ventana modal
**Y** el Perfil Objetivo pasa a «Revisado por ti»
**Y** se registra `perfil_objetivo_editado` con tipo `añadido` y clase `tecnologia`, sin el valor «TypeScript»

### Edge case — doy por buena la lectura sin cambiar nada

**Dado** que el Perfil Objetivo dice «Inferido, sin revisar»
**Cuando** pulso «La lectura es correcta»
**Entonces** pasa a «Revisado por ti»
**Y** los criterios y los resultados no cambian

### Edge case — aterrizo desde una selección curada de familias distintas

**Dado** que entré por un enlace curado con un Gerente de proyecto, un Desarrollador Backend y un QA de automatización, y no he escrito ninguna instrucción
**Cuando** abro el Perfil Objetivo
**Entonces** está vacío: sin familia de rol ni ningún criterio deducido de la selección
**Y** la selección curada sigue intacta, con sus 3 perfiles

### Error — la especificación no sale del navegador antes de la solicitud

**Dado** que tengo abierto el Perfil Objetivo y no he enviado ninguna solicitud
**Cuando** escribo el reto «El portal transaccional en producción (ficticio)»
**Entonces** ninguna petición del navegador al servidor lleva ese texto ni ningún otro contenido de la especificación (valores de criterios o ubicación)
**Y** al servidor solo llega `perfil_objetivo_editado` con tipo `añadido` y clase `reto`

## Notas

Cubre **RF-13.1** (el Perfil Objetivo es una especificación, no una persona: familia de rol, capacidades, seniority, condiciones de trabajo y contexto del proyecto), **RF-13.3** (editable de forma continua, no un modal), **RF-13.4.2** (sin datos de especificación en el servidor antes de la solicitud) y **RF-19.7** (si la selección mezcla familias, el Perfil Objetivo arranca vacío).

**Paga el criterio recibido de EP-001** (2026-09-28, antes en HU-144): «con una selección curada de familias distintas, el panel de especificación aparece vacío, sin un rol deducido» → cuarto escenario.

**Refinada el 2026-10-02 (discovery de EP-009). Partición, no recorte:** el viaje de la especificación con la solicitud, revisada o inferida, pasa a **HU-211**; el aviso de «especificación incompleta» de la versión anterior no está en el PRD (RF-13.3 propone revisar las veinte primeras requisiciones, no bloquear) y queda cubierto por la marca revisada/inferida de HU-211 y por la ubicación obligatoria de HU-082. El reto es **HU-083**; las opciones con conteo, **HU-085**; obligatorio y deseable, **HU-118**; el contador, **HU-209**.

**Decisiones por delegación del sponsor (elegidas por el modelo):**
- **«Revisado por ti»** se gana con cualquier edición del Perfil Objetivo o de la lectura, o con «La lectura es correcta» (como en el prototipo). Es la marca que viaja en HU-211 y que leen HU-101 y HU-161.
- **Selección de una sola familia:** el Perfil Objetivo también arranca vacío. EP-001 garantiza que no se deduce ningún rol de la selección, y deducirlo de una sola familia seguiría siendo inferir lo que el cliente no pidió.
- El quinto escenario se verifica con la interceptación de red del navegador en el e2e.

**Fuente de diseño:** `docs/05-prototipo/pantallas/perfil-objetivo.html` y `perfil-objetivo--baja-confianza.html` (borrador).

## Trazabilidad

Épica madre: **EP-009** · PRD v4.18 · RF-13.1 · RF-13.3 · RF-13.4.2 · RF-19.7 · criterio recibido de EP-001 (HU-144) · ADR-0004 (esquema `PerfilObjetivo`) · ADR-0006 (`perfil_objetivo_editado`) · depende de HU-065 (intérprete) y HU-209 (motor), misma épica · relacionada con HU-211, HU-083, HU-085, HU-118, HU-073 y HU-212

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas de la misma épica; no necesita la solicitud (HU-211) para construirse |
| N | Negociable | ✓ son fijos los campos de RF-13.1, la edición sin confirmación, el vacío ante familias mezcladas y que nada sale del navegador; disposición y textos se negocian |
| V | Valiosa | ✓ el cliente ve y ajusta lo que pide; Delivery recibe después una necesidad y no solo nombres |
| E | Estimable | ✓ M: panel que lee y escribe el estado de búsqueda, la marca revisado/inferido y el evento |
| S | Pequeña | ✓ M: cinco escenarios sobre el panel |
| T | Testeable | ✓ e2e con instrucción fija y con enlace curado sembrado; interceptación de red para el quinto escenario |
