---
id: HU-156
titulo: "Ver con fecha y alcance la verificación de seguridad y la evaluación DISC"
epica: EP-003
prioridad: alta
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.17
depende_de: [HU-154]
---

# HU-156 — Ver con fecha y alcance la verificación de seguridad y la evaluación DISC

**Como** líder de área que responde ante su organización por quién entra a su proyecto,
**quiero** ver en la ficha cuándo y con qué alcance Trycore verificó la seguridad del profesional bajo SARO, y cuándo lo evaluó con DISC,
**para** tener una respuesta concreta, con fecha, si mi área de riesgo o mi comité preguntan cómo se verificó a esa persona.

## Criterios de aceptación

### Happy path — las dos validaciones como evidencia

**Dado** que un perfil publicado tiene registrada su verificación de seguridad bajo SARO, con su alcance y la fecha de marzo de 2026, y su evaluación DISC de abril de 2026 con sus tres competencias publicables,
**cuando** abro su ficha,
**Entonces** veo en «Verificado por Trycore» la verificación de seguridad bajo SARO con su alcance y «marzo de 2026»
**Y** veo la evaluación DISC con «abril de 2026» y sus tres competencias
**Y** las dos se leen como contenido (qué se verificó y cuándo), no como insignias ni sellos de color

### Edge case — nunca un puntaje ni un estado por dimensión

**Dado** que un perfil publicado tiene registradas sus tres validaciones de entrada,
**cuando** abro su ficha,
**Entonces** no veo ningún puntaje, porcentaje, semáforo ni marca de «aprobado» por dimensión Neural-Grid
**Y** no veo el resultado detallado del DISC: solo las tres competencias del Sello Personal

### Error — falta el dato de una validación en un perfil publicado

**Dado** que un perfil publicado no tiene registrada la fecha o el alcance de su verificación de seguridad,
**cuando** abro su ficha,
**Entonces** la ficha no muestra la línea de seguridad, ni sin fecha ni con una fecha o un alcance que no estén registrados
**Y** el resto de la ficha se muestra completo

## Notas

Cubre la parte de seguridad y DISC de **RF-3.2** («el contenido concreto de las tres validaciones de entrada: tipo de prueba, alcance y fecha»), **RF-3.8** (prohibido mostrar las dimensiones con estado o puntaje por perfil), **RF-3.4** (nada que no esté en el inventario), **B.1** (Seguridad 360° · Sello SARO con fecha y alcance; DISC como sello, sin resultado detallado), **B.4.6**, **B.6** (uniforme en existencia, específico en contenido) y **B.7** (campos: validación de seguridad con alcance y fecha; evaluación DISC con fecha y tres competencias). La validación técnica es de **HU-155**. Las tres competencias como diferenciador de la tarjeta son de **HU-081**.

**El dato no existe todavía en el modelo.** EP-006 guarda el Sello Personal (las tres competencias) y la validación técnica (`validaciones`), pero **no** el alcance ni la fecha de la verificación de seguridad ni la fecha de la evaluación DISC (migraciones 0014 a 0018). Para que esta historia funcione, el panel tiene que capturarlos. Esa captura es de **RF-8** (EP-006, ya archivada). Por eso esta historia lleva una **dependencia transversal** que la sesión principal debe resolver con el sponsor (pregunta 1). Mientras tanto se construye y verifica con datos sembrados.

**El escenario de error toma la opción más conservadora:** si falta el dato, no se afirma (RF-3.4). La línea no se muestra, igual que un bloque opcional vacío (HU-129). La alternativa, impedir publicar sin esos datos, sería una regla del panel y es parte de la pregunta 2.

**SARO, no «SORA»** (B.1).

**Preguntas abiertas para el sponsor:**
1. ¿Quién construye la captura en el panel del alcance y la fecha de la verificación SARO y de la fecha DISC: una historia nueva de EP-006 (reabierta) o un sub-slice de EP-003 que toca el editor del panel? Sin esa captura, esta historia no tiene dato real que mostrar.
2. B.6 dice que las tres validaciones son condición de entrada de todo perfil publicado. ¿Deben ser obligatorias para publicar, como la modalidad de prueba (D10)? Si es así, el escenario de error solo cubriría datos heredados.
3. ¿Qué texto de cara al cliente describe el «alcance» de la verificación SARO? Lo debe redactar Talento Humano o Mercadeo; es catálogo o texto libre por perfil.

## Trazabilidad

Épica madre: **EP-003** · PRD v4.17 · RF-3.2 · RF-3.4 · RF-3.8 · B.1 · B.4 · B.6 · B.7 · depende de HU-154 (bloque verificado) · dependencia transversal con EP-006 (captura de los datos de seguridad y DISC en el panel, sin historia aún) · relacionada con HU-081 y HU-155

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: dibujar las dos validaciones es independiente; necesita que el panel capture tres datos que hoy no existen (pregunta 1), y mientras tanto se prueba con datos sembrados |
| N | Negociable | ✓ son fijos el contenido con fecha y alcance, la ausencia de puntajes y que no se afirme lo no registrado; la redacción y la disposición se pueden negociar |
| V | Valiosa | ✓ convierte la declaración genérica del estándar en evidencia concreta por persona, que es lo que pregunta un área de riesgo |
| E | Estimable | ✓ M: dos filas en un bloque existente, más los campos en el contrato de la ficha y su vista; el costo de la captura en el panel se estima aparte según la pregunta 1 |
| S | Pequeña | ✓ M: tres escenarios de presentación; la captura en el panel queda fuera de esta historia |
| T | Testeable | ✓ perfiles sembrados con y sin datos de seguridad dan líneas exactas; la ausencia de puntajes y del DISC detallado se verifica en la pantalla y en la respuesta |
