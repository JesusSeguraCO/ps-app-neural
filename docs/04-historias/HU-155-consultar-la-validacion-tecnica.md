---
id: HU-155
titulo: "Consultar cómo se validó técnicamente a un profesional"
epica: EP-003
prioridad: alta
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.17
depende_de: [HU-154]
---

# HU-155 — Consultar cómo se validó técnicamente a un profesional

**Como** líder técnico del cliente que tiene que defender ante su comité a quién va a pedir,
**quiero** desplegar en la ficha el detalle de la validación técnica que Trycore le hizo a ese profesional, siempre con los mismos campos,
**para** saber qué prueba pasó, qué se le evaluó y con qué resultado, sin tener que fiarme de un sello.

## Criterios de aceptación

### Happy path — el detalle se despliega con estructura fija

**Dado** que un perfil publicado tiene confirmado su reporte de validación técnica, de la modalidad «Reto de código con entrega funcional», evaluado en febrero de 2026,
**cuando** toco «Validación técnica» en su ficha,
**Entonces** se despliega dentro de la ficha un bloque con cinco campos, siempre los mismos y en el mismo orden: prueba aplicada, qué se evaluó, resultado, evaluador y fecha («febrero de 2026»)
**Y** el resultado dice «Cumple el estándar», sin ningún puntaje, nota ni porcentaje
**Y** el detalle se abre igual al tocarlo en un teléfono: no depende de pasar el cursor y no aparece en la tarjeta

### Error — el perfil todavía no tiene reporte detallado

**Dado** que un perfil está publicado solo con el Nivel 0 de su modalidad de prueba, sin reporte detallado,
**cuando** toco «Validación técnica» en su ficha,
**Entonces** veo la prueba aplicada con el texto de cara al cliente de esa modalidad
**Y** no veo ningún campo vacío, ni «no aplica», ni «pendiente», ni la promesa de un detalle que no existe

### Edge case — el artefacto crudo nunca se enlaza

**Dado** que la validación técnica de un perfil produjo un repositorio y una sustentación que Talento Humano conserva internamente,
**cuando** despliego su validación técnica,
**Entonces** no veo ningún enlace, nombre de archivo, repositorio ni descarga de ese material
**Y** veo una línea que dice que la evidencia de la validación puede revisarse en la sesión de alineación con Trycore

## Notas

Cubre **RF-3.10** (estructura fija de cinco campos, nunca vacía, nunca «no aplica», nunca el artefacto crudo), **RF-3.11** (bloque desplegable dentro de la ficha, nunca tooltip ni tarjeta), la parte técnica de **RF-3.2** (tipo de prueba, alcance y fecha como evidencia, no como insignia), **B.8.2** (se publica «cumple el estándar», nunca un puntaje), **B.8.3** y **B.8.4** (el artefacto no se publica; la ficha declara que existe y se revisa en la alineación).

**Qué existe ya (EP-006):** la ficha muestra la validación como una fila del bloque verificado. Si hay reporte confirmado (HU-130, HU-140), esa fila es el Nivel 1: modalidad · resultado, evaluador · fecha, «Evaluó: criterios». Si no hay reporte, muestra el enunciado de Nivel 0 de la modalidad. **Hoy no es un bloque desplegable** y no declara la revisión en la alineación: eso es lo que añade esta historia. El dato y su confirmación no cambian.

**Los cinco campos que se toman.** Son los del bloque `validacion-tecnica` del prototipo y lo que el modelo ya guarda tras **D30** de EP-006: prueba aplicada, evaluador, fecha, resultado y alcance evaluado (los criterios). **Difieren de B.8.3 del PRD**, cuyos cinco campos son «Se le pidió · Entregó · Se evaluó · Resultado · Fecha». D30 (decisión de diseño aprobada por el modelo bajo D27) dejó **internos** el enunciado del reto y los entregables. Bajo la regla de no inventar decisiones, la historia toma la opción que ya está construida y expone menos. Se lleva al sponsor como pregunta.

**Sin artefacto adjunto en esta versión (D29):** el artefacto no se sube al panel. La evidencia la tiene Talento Humano en su formato, y la línea del edge case no promete un archivo del portal: promete la revisión en la sesión de alineación (B.8.4, regla de cierre alineada con D-1).

**Preguntas abiertas para el sponsor:**
1. **Decisión pendiente que bloquea la estimación (INVEST E ✗, validación del 2026-10-02):** ¿Los cinco campos de la ficha son los de B.8.3 («Se le pidió» y «Entregó» a la vista del cliente) o los de D30 y el prototipo (con evaluador, sin enunciado ni entregables)? Si se queda B.8.3, el enunciado del reto sale del catálogo, pero «Entregó» exige el Nivel 2 por perfil (B.9.2), que hoy no se captura. Mientras no se decida, la historia no se puede estimar: con D30 es M sin datos nuevos; con B.8.3 exige capturar el Nivel 2 por perfil en EP-006 y la estimación cambia. El happy path está redactado con los campos de D30 y se reescribe si gana B.8.3.
2. B.9.2 dice que el Nivel 0 incluye la **fecha** de validación, pero en el modelo la fecha solo existe con el reporte. ¿El Nivel 0 debe mostrar fecha (otro dato a capturar en EP-006) o basta con la modalidad?
3. ¿El bloque abre plegado o desplegado por omisión? (El prototipo lo deja desplegado.)

## Trazabilidad

Épica madre: **EP-003** · PRD v4.17 · RF-3.2 · RF-3.10 · RF-3.11 · B.8.2 · B.8.3 · B.8.4 · D29 y D30 de EP-006 · se apoya en HU-130 y HU-140 (EP-006, origen de los Niveles 0 y 1) · depende de HU-154 (bloque verificado donde vive)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: vive en el bloque verificado de HU-154 y usa datos que EP-006 ya produce; no espera a la búsqueda ni al equipo |
| N | Negociable | ✓ son fijos los cinco campos estables, sin puntaje, nunca vacío y sin artefacto; queda abierto qué cinco campos son (pregunta 1) y el estado inicial del desplegable |
| V | Valiosa | ✓ es la respuesta concreta, con fecha y alcance, a «¿cómo lo validaron?», que es el diferencial que vende Trycore |
| E | Estimable | ✗ pendiente de la decisión del sponsor sobre los cinco campos (pregunta 1): con los de D30 sería M (convertir una fila en un bloque desplegable con estructura fija y dos estados, sin datos nuevos); con los de B.8.3 exige capturar «Entregó» (Nivel 2, B.9.2) en EP-006 y no se puede estimar hasta saberlo |
| S | Pequeña | ✓ M con los campos de D30: un bloque de la ficha con tres escenarios; se revisa si gana B.8.3 |
| T | Testeable | ✓ perfiles sembrados con y sin reporte dan campos exactos; la ausencia de enlaces y puntajes se comprueba en la pantalla y en la respuesta; el despliegue se prueba con toque en un teléfono emulado |
