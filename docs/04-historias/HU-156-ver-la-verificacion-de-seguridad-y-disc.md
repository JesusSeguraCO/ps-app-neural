---
id: HU-156
titulo: "Ver con fecha y alcance la verificación de seguridad y la evaluación DISC"
epica: EP-003
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.17
depende_de: [HU-154, HU-176]
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

### Error — falta el alcance o la fecha de la verificación de seguridad

**Esquema del escenario:** sin el dato completo, la ficha no afirma la verificación
**Dado** que un perfil publicado tiene registrada su verificación de seguridad SARO sin <dato_ausente>
**Cuando** abro su ficha
**Entonces** la ficha no muestra la línea de seguridad, ni incompleta ni con un <dato_ausente> que no esté registrado
**Y** el resto de la ficha, incluida la evaluación DISC, se muestra completo

**Ejemplos:**

| dato_ausente |
|---|
| alcance |
| fecha |

### Edge case — falta la fecha de la evaluación DISC

**Dado** que un perfil publicado tiene sus tres competencias del Sello Personal pero no tiene registrada la fecha de su evaluación DISC,
**cuando** abro su ficha,
**Entonces** la ficha no muestra la línea de la evaluación DISC con fecha, ni una fecha que no esté registrada
**Y** la verificación de seguridad, si está completa, se muestra con su alcance y su fecha

### Edge case — nunca un puntaje ni un estado por dimensión

**Dado** que un perfil publicado tiene registradas sus tres validaciones de entrada,
**cuando** abro su ficha,
**Entonces** no veo ningún puntaje, porcentaje, semáforo ni marca de «aprobado» por dimensión Neural-Grid
**Y** no veo el resultado detallado del DISC: solo las tres competencias del Sello Personal

## Notas

Cubre la parte de seguridad y DISC de **RF-3.2** («el contenido concreto de las tres validaciones de entrada: tipo de prueba, alcance y fecha»), **RF-3.8** (prohibido mostrar las dimensiones con estado o puntaje por perfil), **RF-3.4** (nada que no esté en el inventario), **B.1** (Seguridad 360° · Sello SARO con fecha y alcance; DISC como sello, sin resultado detallado), **B.4.6**, **B.6** (uniforme en existencia, específico en contenido) y **B.7** (campos: validación de seguridad con alcance y fecha; evaluación DISC con fecha y tres competencias). La validación técnica es de **HU-155**. Las tres competencias como diferenciador de la tarjeta son de **HU-081**.

**El dato lo captura HU-176 (EP-006).** EP-006 guarda el Sello Personal (las tres competencias) y la validación técnica (`validaciones`), pero hoy **no** el alcance ni la fecha de la verificación de seguridad ni la fecha de la evaluación DISC (migraciones 0014 a 0018). **Partida el 2026-10-02 por validación INVEST (fallas I, E y S), sin recortar alcance:** esta historia solo **muestra** los tres datos cuando existen y los omite sin afirmar cuando faltan (complejidad M → S); la **captura en el panel** por Talento Humano pasa a **HU-176**, en EP-006, y queda en `depende_de`. Mientras HU-176 no esté construida, esta historia se puede construir y verificar con datos sembrados, pero no tiene dato real que mostrar.

**Los escenarios de dato ausente toman la opción más conservadora:** si falta el dato, no se afirma (RF-3.4). La línea no se muestra, igual que un bloque opcional vacío (HU-129). La alternativa, impedir publicar sin esos datos, sería una regla del panel y se pregunta en HU-176.

**SARO, no «SORA»** (B.1).

**Preguntas abiertas para el sponsor** (se resuelven en HU-176, que captura el dato):
1. B.6 dice que las tres validaciones son condición de entrada de todo perfil publicado. ¿Deben ser obligatorias para publicar, como la modalidad de prueba (D10)? Si es así, los escenarios de dato ausente solo cubrirían datos heredados.
2. ¿Qué texto de cara al cliente describe el «alcance» de la verificación SARO? Lo debe redactar Talento Humano o Mercadeo; es catálogo o texto libre por perfil.

## Trazabilidad

Épica madre: **EP-003** · PRD v4.17 · RF-3.2 · RF-3.4 · RF-3.8 · B.1 · B.4 · B.6 · B.7 · depende de HU-154 (bloque verificado) · depende de HU-176 (EP-006, captura de los datos de seguridad y DISC en el panel) · relacionada con HU-081 y HU-155

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: vive en el bloque verificado de HU-154 y toma el dato que captura HU-176 (EP-006); se construye y prueba con datos sembrados sin esperar a esa captura |
| N | Negociable | ✓ son fijos el contenido con fecha y alcance, la ausencia de puntajes y que no se afirme lo no registrado; la redacción y la disposición se pueden negociar |
| V | Valiosa | ✓ convierte la declaración genérica del estándar en evidencia concreta por persona, que es lo que pregunta un área de riesgo |
| E | Estimable | ✓ S: dos líneas en un bloque existente y tres campos más en el contrato de la ficha; la captura y su migración se estiman en HU-176 |
| S | Pequeña | ✓ S: solo presentación, con cuatro escenarios; la captura en el panel está fuera, en HU-176 |
| T | Testeable | ✓ perfiles sembrados con datos completos, sin alcance, sin fecha SARO y sin fecha DISC dan líneas exactas o su ausencia; la ausencia de puntajes y del DISC detallado se verifica en la pantalla y en la respuesta |
