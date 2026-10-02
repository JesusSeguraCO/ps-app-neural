---
id: HU-176
titulo: "Registrar el alcance y la fecha de la verificación SARO y la fecha de la evaluación DISC"
epica: EP-003
prioridad: alta
complejidad: M
estado: draft
fase: panel-crud
prd_version: 4.17
depende_de: [HU-125, HU-126, HU-128, HU-177]
---

# HU-176 — Registrar el alcance y la fecha de la verificación SARO y la fecha de la evaluación DISC

**Como** administradora de inventario de Talento Humano,
**quiero** registrar en el perfil, desde el panel, el alcance de la verificación de seguridad bajo SARO elegido del catálogo, su fecha y la fecha de la evaluación DISC, y que el panel no me deje publicar sin ellos,
**para** que ningún perfil nuevo llegue al cliente sin la evidencia de seguridad y DISC que el estándar promete, y que la ficha la muestre sin afirmar nada que yo no haya registrado.

## Criterios de aceptación

### Happy path — registrar los tres datos en un perfil

**Dado** que tengo abierto en el editor del panel un perfil sin datos de seguridad ni de DISC
**Y** que el catálogo de alcances SARO tiene el valor «Antecedentes judiciales, disciplinarios y fiscales»
**Y** que elegí ese alcance con fecha 15 de marzo de 2026, y como evaluación DISC la fecha 10 de abril de 2026
**Cuando** guardo el perfil
**Entonces** el perfil queda guardado con esos tres datos
**Y** la vista previa de la ficha muestra la verificación SARO con el texto de ese alcance y «marzo de 2026», y la evaluación DISC con «abril de 2026»

### Error — una fecha futura

**Dado** que hoy es 2 de octubre de 2026 y en el editor de un perfil escribí como fecha de la verificación SARO el 15 de noviembre de 2026,
**cuando** guardo el perfil,
**Entonces** el panel no guarda el cambio y me dice que la fecha de una verificación no puede ser posterior a hoy
**Y** el perfil conserva los datos de seguridad que tenía

### Error — publicar sin la verificación SARO o sin la fecha DISC

**Esquema del escenario:** el panel bloquea la publicación y dice qué falta
**Dado** que un perfil en borrador tiene consentimiento y modalidad de prueba, pero le falta <dato_faltante>
**Cuando** intento publicarlo
**Entonces** el panel lo impide y me dice exactamente «Falta <motivo>»
**Y** me lleva al campo que falta en el editor
**Y** el perfil sigue en borrador, fuera del portal

**Ejemplos:**

| dato_faltante | motivo |
|---|---|
| el alcance de la verificación SARO | el alcance de la verificación SARO |
| la fecha de la verificación SARO | la fecha de la verificación SARO |
| la fecha de la evaluación DISC | la fecha de la evaluación DISC |

### Edge case — corregir el dato de un perfil publicado

**Dado** que un perfil publicado tiene registrada la verificación SARO con fecha 15 de marzo de 2026
**Y** que en el editor cambié esa fecha por el 20 de febrero de 2026, guardé y el panel me pide confirmar el cambio en un perfil publicado
**Cuando** confirmo el cambio
**Entonces** la ficha del cliente muestra «febrero de 2026»
**Y** el historial del perfil registra quién cambió la fecha, cuándo, y el valor anterior y el nuevo

## Notas

Cubre la parte de captura de **B.7** (campos del perfil: validación de seguridad con alcance y fecha; evaluación DISC con fecha) dentro de **RF-8** (edición del inventario en el panel), al servicio de **RF-3.2** y **B.1** en la ficha (HU-156). Amplía la guarda de publicación de **RF-8.4 / RF-8.10** (HU-128) con dos condiciones nuevas, porque **B.6** dice que las tres validaciones son condición de entrada de todo perfil publicado. Se apoya en **RF-3.4** (la ficha no muestra lo que no está en el inventario) y en el historial de cambios de **HU-138**.

**Nace el 2026-10-02 de la partición de HU-156 por validación INVEST (fallas I, E y S).** **Partición, no recorte**: HU-156 muestra los datos en la ficha; esta historia los captura en el panel.

**Decisiones del sponsor aplicadas (2026-10-02, `.claude/state/evidencia/discovery-2026-10-02/decisiones-sponsor-2026-10-02.md`):**
- **D60:** se construye como **sub-slice inicial de EP-003** (panel + migración). Por eso su `epica` pasa de EP-006 a **EP-003**. Toca el editor del panel que construyó EP-006, que **sigue cerrada**: no se reabre.
- **D61:** SARO (alcance y fecha) y DISC (fecha) son **obligatorios para publicar**. Se añade el escenario de bloqueo con motivo: el panel dice qué falta y lleva al campo (explicabilidad de un bloqueo de publicación). El alcance SARO es un **catálogo cerrado administrable**. Administrar ese catálogo es otra capacidad, con sus propios escenarios, y haría que esta historia dejara de ser pequeña: pasa a **HU-177**, que entra en `depende_de`. Aquí el alcance solo se **elige** del catálogo, como las tecnologías de HU-089.
- **D62 y D63:** el trato de los perfiles **ya publicados** sin estos datos (siguen visibles, marcados «incompleto: falta …», sin re-publicar tras editar hasta completarlos) y la regla común de las tres validaciones de entrada son de **HU-178**. Esta historia cubre los perfiles que se publican a partir de ahora.

**Cambios del 2026-10-02 tras las decisiones:** se retira el escenario «fecha de SARO sin alcance»: con los dos datos obligatorios para publicar, la combinación incompleta ya no llega al cliente y la señala el bloqueo con su motivo. Un borrador sí puede guardarse con parte de los datos, igual que con los demás obligatorios (HU-125). El edge de corrección añade «y confirmo», porque editar un publicado pasa por la confirmación de impacto de HU-126.

**Hoy el dato no existe en el modelo** (migraciones 0014 a 0018): EP-006 guarda el Sello Personal (las tres competencias) y la validación técnica, pero no estos tres campos. Esta historia incluye la migración, los controles en el editor, la validación de fecha no futura, las dos condiciones nuevas en la guarda de publicación (individual y masiva, reutilizando la de HU-128), su paso a la vista previa (HU-129) y al contrato de la ficha, y el registro en el historial (HU-138). Las tres competencias del Sello Personal no cambian y siguen siendo **opcionales** (D63).

**La regla de fecha no futura** es una propuesta del modelo que no contradice ninguna decisión; se mantiene como negociable.

**Importación masiva resuelta por D81** (sponsor, 2026-10-02, segunda ronda). La pregunta que dejaba abierta esta historia —¿la importación masiva y la plantilla (HU-086, HU-088) incluyen estos tres datos?— se respondió que **sí**: columnas SARO alcance (validado contra el catálogo de HU-177), SARO fecha y DISC fecha. Sumarlo aquí sacaba a esta historia de M (editor más importación, plantilla y exportación), así que pasa a **HU-191**, en el mismo sub-slice inicial y detrás de esta. **Partición, no recorte.** Esta historia sigue cubriendo la captura en el editor y la guarda de publicación, que la importación reutiliza.

**Validación 2026-10-02 (validador independiente).** El edge de corrección decía «guardo y confirmo» (dos acciones en un «Cuando»). Ahora el «Dado» deja el estado («guardé y el panel pide confirmar», la confirmación de impacto de HU-126) y el «Cuando» es una sola acción («confirmo»), como en HU-177. Sin cambio de alcance.

## Trazabilidad

Épica madre: **EP-003** (sub-slice inicial, D60) · PRD v4.17 · RF-8 · RF-8.4 · RF-8.10 · B.1 · B.6 · B.7 · RF-3.2 · RF-3.4 · D60 · D61 · D63 · validación 2026-10-02 (forma G/W/T) · nace de la partición de HU-156 (2026-10-02) · toca el editor y la guarda de publicación del panel de **EP-006, que sigue cerrada** · depende de HU-125 y HU-126 (editor del perfil), HU-128 (guarda de publicación) y HU-177 (catálogo de alcances SARO) · alimenta a HU-156 · el trato de los perfiles ya publicados es de HU-178 · la importación masiva de estos datos es de HU-191 (D81) · relacionada con HU-129 (vista previa) y HU-138 (historial)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: amplía el editor y la guarda que ya existen (HU-125, HU-126, HU-128) y elige del catálogo de HU-177, que es del mismo sub-slice inicial y se construye antes; no espera a ninguna historia de cara al cliente |
| N | Negociable | ✓ son fijos los tres datos, que sean obligatorios para publicar (D61) y que el alcance salga de un catálogo cerrado; la regla de fecha no futura, el texto del motivo y la disposición en el editor se pueden negociar |
| V | Valiosa | ✓ sin esta captura y este bloqueo, un perfil nuevo podría llegar al cliente sin la evidencia de seguridad y DISC que el encabezado del estándar (HU-159) afirma de todos |
| E | Estimable | ✓ M: una migración con tres campos, sus controles en el editor, una validación de fecha, dos condiciones más en una guarda que ya existe, la vista previa, el contrato de la ficha y el historial. D61 cerró las dudas de obligatoriedad y de catálogo; D81 llevó la importación a HU-191 |
| S | Pequeña | ✓ M: una capacidad (capturar y exigir dos validaciones de entrada) en cuatro escenarios; la administración del catálogo (HU-177), el trato de lo ya publicado (HU-178) y la importación masiva (HU-191, D81) quedan fuera |
| T | Testeable | ✓ en el panel, un perfil sembrado acepta los tres datos, rechaza una fecha futura, no se publica sin cada uno de los tres datos (tres filas de ejemplo con su motivo) y una corrección aparece en la ficha y en el historial |
