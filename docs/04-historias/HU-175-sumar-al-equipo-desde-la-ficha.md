---
id: HU-175
titulo: "Sumar un perfil a mi equipo desde su ficha sin cerrarla"
epica: EP-003
prioridad: alta
complejidad: S
estado: draft
fase: referencias-juicebox
prd_version: 4.17
depende_de: [HU-120]  # y la capacidad de sumar a «Mi equipo» de EP-004 (RF-4.1, RF-4.2), aún sin historia redactada
---

# HU-175 — Sumar un perfil a mi equipo desde su ficha sin cerrarla

**Como** líder de proyecto que recorre las fichas de su selección o del banco para armar su equipo,
**quiero** sumar a mi equipo el perfil que estoy viendo directamente desde su ficha, sin cerrarla,
**para** decidir mientras comparo, sin volver a la lista cada vez que alguien me convence.

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

### Error — no se puede guardar el cambio en el equipo

**Dado** que tengo abierta la ficha de un perfil que no está en mi equipo y el servidor no puede guardar mi equipo en este momento
**Cuando** toco «Sumar al equipo»
**Entonces** la ficha me dice que no se pudo sumar y que lo intente de nuevo
**Y** el indicador de mi equipo no cambia y la ficha no dice que el perfil está en mi equipo

### Edge case — el perfil ya estaba en mi equipo

**Dado** que sumé un perfil a mi equipo desde la lista
**Cuando** abro su ficha
**Entonces** la ficha dice que ya está en mi equipo, sin ofrecer sumarlo otra vez
**Y** el indicador de mi equipo no cambia

## Notas

Cubre la parte de **RF-13.11** que permite actuar sobre el perfil sin cerrar la ficha, apoyada en **RF-4.1** (sumar y quitar perfiles a una selección guardada en el servidor por invitado) y **RF-4.2** (el indicador con el conteo de «Mi equipo»), ambos de **EP-004**.

**Nace el 2026-10-02 de la partición de HU-120 por validación INVEST (fallas I y E).** **Partición, no recorte**: el alcance sigue en EP-003. HU-120 se queda con recorrer las fichas sin perder la lista (ya construido en buena parte por D47 de EP-006); esta historia lleva el «sumar desde la ficha», que quedó explícitamente en EP-003.

**Dependencia con EP-004, declarada en `depende_de`:** sumar a «Mi equipo», guardarlo en el servidor por invitado y el indicador con el conteo son capacidades de **EP-004** que **no tienen historia redactada** (deuda del mapa de historias; ver los criterios recibidos de EP-001 en `docs/03-backlog/epicas.md`). Esta historia no construye esa capacidad: pone la acción en la ficha y fija que no la cierra. Se secuencia **después** de que EP-004 entregue sumar y el indicador, o se construye contra el contrato que EP-004 publique. Mientras esa historia no exista, la sesión principal debe registrarla como deuda del mapa.

**Pregunta abierta para el sponsor:** si el perfil ya está en mi equipo, ¿la ficha permite también **quitarlo** desde ahí (el prototipo alterna «Sumar al equipo» / «En el equipo»)? RF-4.1 habla de sumar y quitar, pero no dice desde dónde. El edge case toma la opción más conservadora (solo informa que ya está); si el sponsor dice que sí, se añade un escenario de quitar.

## Trazabilidad

Épica madre: **EP-003** · PRD v4.17 · RF-13.11 · RF-4.1 · RF-4.2 · nace de la partición de HU-120 (2026-10-02) · depende de HU-120 (ficha y recorrido) y de la capacidad de sumar de EP-004 (sin historia aún) · relacionada con HU-080 (EP-004, qué le falta al equipo)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: necesita la ficha de HU-120, ya construida, y la capacidad de sumar de EP-004; se secuencia detrás de EP-004 o se construye contra su contrato |
| N | Negociable | ✓ son fijos sumar sin cerrar, la confirmación en la ficha y que un fallo no se presente como éxito; el texto de la acción y si se puede quitar desde ahí se pueden negociar |
| V | Valiosa | ✓ convierte la comparación en decisión sin perder el hilo, que es la palanca sobre el promedio de perfiles por solicitud |
| E | Estimable | ✓ S: una acción en un panel que existe, que llama a la capacidad de EP-004 y refleja su estado; la incertidumbre está acotada al contrato de EP-004, no a la ficha |
| S | Pequeña | ✓ S: una acción con cuatro escenarios |
| T | Testeable | ✓ e2e: indicador de 2 a 3, ficha abierta en «2 de 5», recorrido después de sumar, fallo simulado del servidor sin cambio de indicador y perfil ya sumado desde la lista |
