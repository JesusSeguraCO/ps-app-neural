---
id: HU-155
titulo: "Consultar cómo se validó técnicamente a un profesional"
epica: EP-003
prioridad: alta
complejidad: M
estado: lista
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
**Entonces** veo la prueba aplicada con el texto de cara al cliente de esa modalidad, sin fecha
**Y** no veo ningún campo vacío, ni «no aplica», ni «pendiente», ni la promesa de un detalle que no existe

### Edge case — el artefacto crudo nunca se enlaza

**Dado** que la validación técnica de un perfil produjo un repositorio y una sustentación que Talento Humano conserva internamente,
**cuando** despliego su validación técnica,
**Entonces** no veo ningún enlace, nombre de archivo, repositorio ni descarga de ese material
**Y** veo una línea que dice que la evidencia de la validación puede revisarse en la sesión de alineación con Trycore

## Notas

Cubre **RF-3.10** (estructura fija de cinco campos, nunca vacía, nunca «no aplica», nunca el artefacto crudo), **RF-3.11** (bloque desplegable dentro de la ficha, nunca tooltip ni tarjeta), la parte técnica de **RF-3.2** (tipo de prueba, alcance y fecha como evidencia, no como insignia), **B.8.2** (se publica «cumple el estándar», nunca un puntaje), **B.8.3** y **B.8.4** (el artefacto no se publica; la ficha declara que existe y se revisa en la alineación).

**Qué existe ya (EP-006):** la ficha muestra la validación como una fila del bloque verificado. Si hay reporte confirmado (HU-130, HU-140), esa fila es el Nivel 1: modalidad · resultado, evaluador · fecha, «Evaluó: criterios». Si no hay reporte, muestra el enunciado de Nivel 0 de la modalidad. **Hoy no es un bloque desplegable** y no declara la revisión en la alineación: eso es lo que añade esta historia. El dato y su confirmación no cambian.

**Los cinco campos (D59, sponsor 2026-10-02).** Son los **ya construidos** tras **D30** de EP-006 y los del bloque `validacion-tecnica` del prototipo: **prueba aplicada · qué se evaluó · resultado · evaluador · fecha**. El enunciado del reto y los entregables quedan **internos**. D59 cierra la bifurcación con B.8.3 del PRD («Se le pidió · Entregó · Se evaluó · Resultado · Fecha»): no se captura el Nivel 2 por perfil para esta historia y no hay datos nuevos. El happy path ya estaba redactado con estos cinco campos y no cambia.

**Nivel 0 sin fecha (D73, opción conservadora):** en el modelo la fecha solo existe con el reporte confirmado. Un perfil publicado solo con el Nivel 0 muestra la modalidad sin fecha; no se captura un dato nuevo en el panel para esto. B.9.2 menciona la fecha en el Nivel 0; la discrepancia con el PRD queda resuelta por D73 a favor de lo construido.

**La técnica es obligatoria para publicar (D63):** la modalidad de prueba ya lo era (D10, HU-128). El trato de un publicado sin modalidad, si existiera, es de **HU-178**; esta historia no cambia por eso.

**Sin artefacto adjunto en esta versión (D29):** el artefacto no se sube al panel. La evidencia la tiene Talento Humano en su formato, y la línea del edge case no promete un archivo del portal: promete la revisión en la sesión de alineación (B.8.4, regla de cierre alineada con D-1).

**Copy para revisión de copy (D73):** la línea «la evidencia de la validación puede revisarse en la sesión de alineación con Trycore» y el texto de cara al cliente de cada modalidad son copy visible; se redactan con la opción del prototipo/PRD y quedan **marcados para revisión de copy**.

**Pregunta abierta para el sponsor (no bloquea la estimación):** ¿el bloque abre plegado o desplegado por omisión? El prototipo lo deja desplegado. Es una decisión de presentación, negociable, que no cambia los escenarios.

## Trazabilidad

Épica madre: **EP-003** · PRD v4.17 · RF-3.2 · RF-3.10 · RF-3.11 · B.8.2 · B.8.3 · B.8.4 · B.9.2 · D29 y D30 de EP-006 · D59 · D63 · D73 · se apoya en HU-130 y HU-140 (EP-006, origen de los Niveles 0 y 1) · depende de HU-154 (bloque verificado donde vive)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: vive en el bloque verificado de HU-154 y usa datos que EP-006 ya produce; no espera a la búsqueda ni al equipo |
| N | Negociable | ✓ son fijos los cinco campos de D59, sin puntaje, nunca vacío, Nivel 0 sin fecha y sin artefacto; el estado inicial del desplegable y el copy se pueden negociar |
| V | Valiosa | ✓ es la respuesta concreta, con fecha y alcance, a «¿cómo lo validaron?», que es el diferencial que vende Trycore |
| E | Estimable | ✓ M: D59 fijó los cinco campos ya construidos; el trabajo es convertir una fila en un bloque desplegable con estructura fija y dos estados (con reporte y Nivel 0), sin datos nuevos ni migración |
| S | Pequeña | ✓ M: un bloque de la ficha con tres escenarios |
| T | Testeable | ✓ perfiles sembrados con y sin reporte dan campos exactos; la ausencia de enlaces y puntajes se comprueba en la pantalla y en la respuesta; el despliegue se prueba con toque en un teléfono emulado |
