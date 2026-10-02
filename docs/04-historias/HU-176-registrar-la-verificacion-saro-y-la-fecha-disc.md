---
id: HU-176
titulo: "Registrar el alcance y la fecha de la verificación SARO y la fecha de la evaluación DISC"
epica: EP-006
prioridad: alta
complejidad: M
estado: draft
fase: panel-crud
prd_version: 4.17
depende_de: [HU-125, HU-126]
---

# HU-176 — Registrar el alcance y la fecha de la verificación SARO y la fecha de la evaluación DISC

**Como** administradora de inventario de Talento Humano,
**quiero** registrar en el perfil, desde el panel, el alcance y la fecha de la verificación de seguridad bajo SARO y la fecha de la evaluación DISC,
**para** que la ficha del cliente pueda mostrar cuándo y con qué alcance Trycore verificó a esa persona, sin afirmar nada que yo no haya registrado.

## Criterios de aceptación

### Happy path — registrar los tres datos en un perfil

**Dado** que tengo abierto en el editor del panel un perfil sin datos de seguridad ni de DISC
**Y** que escribí como verificación SARO el alcance «Antecedentes judiciales, disciplinarios y fiscales» con fecha 15 de marzo de 2026, y como evaluación DISC la fecha 10 de abril de 2026
**Cuando** guardo el perfil
**Entonces** el perfil queda guardado con esos tres datos
**Y** la vista previa de la ficha muestra la verificación SARO con ese alcance y «marzo de 2026», y la evaluación DISC con «abril de 2026»

### Error — una fecha futura

**Dado** que hoy es 2 de octubre de 2026 y en el editor de un perfil escribí como fecha de la verificación SARO el 15 de noviembre de 2026,
**cuando** guardo el perfil,
**Entonces** el panel no guarda el cambio y me dice que la fecha de una verificación no puede ser posterior a hoy
**Y** el perfil conserva los datos de seguridad que tenía

### Error — fecha de SARO sin alcance

**Dado** que en el editor de un perfil escribí una fecha de verificación SARO y dejé su alcance vacío,
**cuando** guardo el perfil,
**Entonces** el panel no guarda el cambio y me señala que la verificación de seguridad necesita alcance y fecha juntos
**Y** el perfil conserva los datos de seguridad que tenía

### Edge case — corregir el dato de un perfil publicado

**Dado** que un perfil publicado tiene registrada la verificación SARO con fecha 15 de marzo de 2026
**Y** que en el editor cambié esa fecha por el 20 de febrero de 2026
**Cuando** guardo el perfil
**Entonces** la ficha del cliente muestra «febrero de 2026»
**Y** el historial del perfil registra quién cambió la fecha, cuándo, y el valor anterior y el nuevo

## Notas

Cubre la parte de captura de **B.7** (campos del perfil: validación de seguridad con alcance y fecha; evaluación DISC con fecha) dentro de **RF-8** (edición del inventario en el panel), al servicio de **RF-3.2** y **B.1** en la ficha (HU-156). Se apoya en **RF-3.4** (la ficha no muestra lo que no está en el inventario) y en el historial de cambios de **HU-138**.

**Nace el 2026-10-02 de la partición de HU-156 por validación INVEST (fallas I, E y S).** **Partición, no recorte**: HU-156 (EP-003) muestra los datos en la ficha; esta historia los captura en el panel. Va en **EP-006** porque es edición del inventario por Talento Humano, aunque EP-006 ya está archivada: la sesión principal debe decidir cómo se construye (reapertura de EP-006 o sub-slice dentro del release que construya EP-003). Resuelve la pregunta 1 que tenía HU-156 sobre quién construye la captura.

**Hoy el dato no existe en el modelo** (migraciones 0014 a 0018): EP-006 guarda el Sello Personal (las tres competencias) y la validación técnica, pero no estos tres campos. Esta historia incluye la migración, los campos en el editor, su validación, su paso a la vista previa (HU-129) y al contrato de la ficha, y el registro en el historial (HU-138). Las tres competencias del Sello Personal no cambian.

**Las reglas de validación son propuestas del modelo** (fecha no futura; alcance y fecha de SARO van juntos) y se llevan al sponsor con las preguntas de abajo. La fecha DISC sola es válida: sus competencias ya existen.

**Preguntas abiertas para el sponsor:**
1. B.6 dice que las tres validaciones son condición de entrada de todo perfil publicado. ¿Estos datos deben ser **obligatorios para publicar**, como la modalidad de prueba (D10, HU-128)? Si es así, se añade un escenario de bloqueo de publicación con motivo y HU-156 solo cubriría datos heredados. Hasta la decisión, guardar y publicar sin ellos sigue permitido.
2. ¿El «alcance» de SARO es un **catálogo** cerrado (con texto de cara al cliente redactado por Talento Humano o Mercadeo) o texto libre por perfil? Un catálogo cambia la estimación (se administra como los demás catálogos, HU-089).
3. ¿La **importación masiva** y la plantilla (HU-086, HU-088) deben incluir estas tres columnas? Si es así, es alcance adicional de esta historia o de esas, y debe acordarse; no se omite en silencio.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.17 · RF-8 · B.1 · B.6 · B.7 · RF-3.2 · RF-3.4 · nace de la partición de HU-156 (2026-10-02) · depende de HU-125 y HU-126 (editor del perfil) · alimenta a HU-156 (EP-003) · relacionada con HU-129 (vista previa), HU-138 (historial) y HU-128 (bloqueos de publicación)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: amplía el editor que ya existe (HU-125, HU-126); no espera a ninguna historia de EP-003, que es la que la necesita |
| N | Negociable | ✓ son fijos los tres datos y que alcance y fecha de SARO vayan juntos; si son obligatorios para publicar, si el alcance es catálogo y si entra en la importación quedan para el sponsor |
| V | Valiosa | ✓ sin esta captura la ficha no puede mostrar la evidencia de seguridad y DISC que pide un área de riesgo (HU-156) |
| E | Estimable | ✓ M: una migración con tres campos, sus controles en el editor con dos reglas, la vista previa, el contrato de la ficha y el historial; las preguntas 1 a 3 pueden subirla y están declaradas |
| S | Pequeña | ✓ M: una capacidad de captura en cuatro escenarios |
| T | Testeable | ✓ en el panel, un perfil sembrado acepta los tres datos, rechaza una fecha futura y una fecha SARO sin alcance, y una corrección aparece en la ficha y en el historial |
