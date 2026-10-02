---
id: HU-175
titulo: "Sumar o quitar un perfil de mi equipo desde su ficha sin cerrarla"
epica: EP-004
prioridad: alta
complejidad: S
estado: lista
fase: referencias-juicebox
prd_version: 4.17
depende_de: [HU-120, HU-192]
---

# HU-175 — Sumar o quitar un perfil de mi equipo desde su ficha sin cerrarla

**Como** líder de proyecto que recorre las fichas de su selección o del banco para armar su equipo,
**quiero** sumar a mi equipo, o quitar de él, el perfil que estoy viendo directamente desde su ficha, sin cerrarla,
**para** decidir mientras comparo, sin volver a la lista cada vez que alguien me convence o cambio de opinión.

## Criterios de aceptación

### Happy path — sumar sin cerrar la ficha

**Dado** que tengo abierta la ficha del segundo perfil de una lista de 5, que no está en mi equipo
**Y** que mi equipo tiene 2 perfiles
**Cuando** toco «Sumar al equipo» en la ficha
**Entonces** el indicador de mi equipo pasa a 3
**Y** la ficha sigue abierta en el mismo perfil, «2 de 5», y dice que ya está en mi equipo

### Happy path — seguir recorriendo después de sumar

**Dado** que acabo de sumar a mi equipo, desde su ficha, el segundo perfil de una lista de 5
**Cuando** paso al perfil siguiente
**Entonces** veo la ficha del tercer perfil, «3 de 5», con la acción «Sumar al equipo» disponible
**Y** el indicador de mi equipo sigue en 3

### Alterno — quitar del equipo sin cerrar la ficha

**Dado** que tengo abierta la ficha del cuarto perfil de una lista de 5, que está en mi equipo
**Y** que mi equipo tiene 3 perfiles
**Cuando** toco «Quitar del equipo» en la ficha
**Entonces** el indicador de mi equipo pasa a 2
**Y** la ficha sigue abierta en el mismo perfil, «4 de 5», con la acción «Sumar al equipo» disponible

### Error — no se puede guardar el cambio en el equipo

**Esquema del escenario:** un fallo no se presenta como éxito
**Dado** que tengo abierta la ficha de un perfil que <situacion> y el servidor no puede guardar mi equipo en este momento
**Cuando** toco «<accion>»
**Entonces** la ficha me dice que no se pudo guardar el cambio y que lo intente de nuevo
**Y** el indicador de mi equipo no cambia y la ficha sigue mostrando el perfil como <estado_previo>

**Ejemplos:**

| situacion | accion | estado_previo |
|---|---|---|
| no está en mi equipo | Sumar al equipo | fuera de mi equipo |
| está en mi equipo | Quitar del equipo | en mi equipo |

### Edge case — el perfil ya estaba en mi equipo

**Dado** que sumé un perfil a mi equipo desde la lista
**Cuando** abro su ficha
**Entonces** la ficha dice que ya está en mi equipo y ofrece «Quitar del equipo», sin ofrecer sumarlo otra vez
**Y** el indicador de mi equipo no cambia

## Notas

Cubre la parte de **RF-13.11** que permite actuar sobre el perfil sin cerrar la ficha, apoyada en **RF-4.1** (sumar y quitar perfiles a una selección guardada en el servidor por invitado) y **RF-4.2** (el indicador con el conteo de «Mi equipo»), ambos de **EP-004**.

**Nace el 2026-10-02 de la partición de HU-120 por validación INVEST (fallas I y E).** **Partición, no recorte**: el alcance sigue en EP-003. HU-120 se queda con recorrer las fichas sin perder la lista (ya construido en buena parte por D47 de EP-006); esta historia lleva el «sumar desde la ficha», que quedó explícitamente en EP-003.

**Dependencia con EP-004, declarada en `depende_de` (D88, sponsor, 2026-10-02).** Sumar y quitar en «Mi equipo», guardarlo en el servidor por invitado y el indicador con el conteo son capacidades de **EP-004**, ahora redactadas en **HU-192** «Sumar y quitar perfiles de Mi equipo». Esta historia no construye esa capacidad: pone las mismas dos acciones en la ficha y fija que no la cierran. Se secuencia **después de HU-192**, o se construye contra el contrato que HU-192 publique. La deuda de mapa que señalaba esta nota queda pagada por D88.

**D73 (sponsor, 2026-10-02, opción conservadora) cierra la pregunta abierta:** desde la ficha se puede **quitar** del equipo además de sumar, como alterna el prototipo («Sumar al equipo» / «En el equipo») y como permite RF-4.1. Cambios: se añade el escenario alterno de quitar, el de error pasa a un esquema con las dos acciones y el edge «ya estaba en mi equipo» ofrece quitar en vez de solo informar. El título y el «quiero» lo dicen. **Ampliación por decisión del sponsor, no recorte.** La complejidad sigue en S: quitar usa la misma capacidad de HU-192 y el mismo estado de la acción.

**D101 (sponsor, 2026-10-02): cambio de épica.** Esta historia pasa a **EP-004**, donde nacen los datos o la capacidad de la que depende. No es recorte: se construye entera con esa épica.

## Trazabilidad

Épica madre: **EP-004** (D101) · PRD v4.17 · RF-13.11 · RF-4.1 · RF-4.2 · D73 · nace de la partición de HU-120 (2026-10-02) · D88 · depende de HU-120 (ficha y recorrido) y de HU-192 (sumar y quitar en «Mi equipo» con su indicador, EP-004) · relacionada con HU-080 (EP-004, qué le falta al equipo)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: necesita la ficha de HU-120, ya construida, y la capacidad de sumar y quitar de HU-192 (EP-004, D88); se secuencia detrás de HU-192 o se construye contra su contrato |
| N | Negociable | ✓ son fijos sumar y quitar sin cerrar (D73), la confirmación en la ficha y que un fallo no se presente como éxito; el texto de las acciones y su forma visual se pueden negociar |
| V | Valiosa | ✓ convierte la comparación en decisión sin perder el hilo, que es la palanca sobre el promedio de perfiles por solicitud |
| E | Estimable | ✓ S: una acción de dos estados (sumar / quitar) en un panel que existe, que llama a la capacidad de HU-192 y refleja su estado; la incertidumbre está acotada al contrato de HU-192, no a la ficha |
| S | Pequeña | ✓ S: una acción de dos estados con cinco escenarios, en el límite de la metodología; si crece más, se parte |
| T | Testeable | ✓ e2e: indicador de 2 a 3 al sumar y de 3 a 2 al quitar con la ficha abierta, recorrido después de sumar, fallo simulado del servidor en las dos acciones sin cambio de indicador y perfil ya sumado desde la lista que ofrece quitar |
