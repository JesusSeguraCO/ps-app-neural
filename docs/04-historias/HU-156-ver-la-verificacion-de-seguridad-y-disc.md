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

**Dado** que un perfil publicado tiene registrada su verificación de seguridad bajo SARO, con el alcance «Antecedentes judiciales, disciplinarios y fiscales» del catálogo y la fecha de marzo de 2026, y su evaluación DISC de abril de 2026 con sus tres competencias del Sello Personal,
**cuando** abro su ficha,
**Entonces** veo en «Verificado por Trycore» la verificación de seguridad bajo SARO con el texto de ese alcance y «marzo de 2026»
**Y** veo la evaluación DISC con «abril de 2026» y sus tres competencias
**Y** las dos se leen como contenido (qué se verificó y cuándo), no como insignias ni sellos de color

### Error — un perfil publicado antes de la regla, sin uno de los datos

**Esquema del escenario:** sin el dato registrado, la ficha no afirma la validación
**Dado** que un perfil se publicó antes de que la regla lo exigiera y no tiene registrada <dato_ausente>
**Cuando** abro su ficha
**Entonces** la ficha no muestra <linea_omitida>, ni incompleta ni con un dato que no esté registrado
**Y** no veo ninguna marca de «incompleto», «pendiente» ni «no aplica»
**Y** el resto de la ficha se muestra completo

**Ejemplos:**

| dato_ausente | linea_omitida |
|---|---|
| la verificación SARO (alcance y fecha) | la línea de la verificación de seguridad |
| la fecha de la evaluación DISC | la línea de la evaluación DISC |

### Edge case — evaluación DISC con fecha y sin Sello Personal

**Dado** que un perfil publicado tiene la fecha de su evaluación DISC, abril de 2026, y ninguna competencia del Sello Personal registrada,
**cuando** abro su ficha,
**Entonces** veo la evaluación DISC con «abril de 2026»
**Y** no veo competencias, ni un título vacío ni un hueco en su lugar

### Edge case — nunca un puntaje ni un estado por dimensión

**Dado** que un perfil publicado tiene registradas sus tres validaciones de entrada,
**cuando** abro su ficha,
**Entonces** no veo ningún puntaje, porcentaje, semáforo ni marca de «aprobado» por dimensión Neural-Grid
**Y** no veo el resultado detallado del DISC: como mucho, las tres competencias del Sello Personal

## Notas

Cubre la parte de seguridad y DISC de **RF-3.2** («el contenido concreto de las tres validaciones de entrada: tipo de prueba, alcance y fecha»), **RF-3.8** (prohibido mostrar las dimensiones con estado o puntaje por perfil), **RF-3.4** (nada que no esté en el inventario), **B.1** (Seguridad 360° · Sello SARO con fecha y alcance; DISC como sello, sin resultado detallado), **B.4.6**, **B.6** (uniforme en existencia, específico en contenido) y **B.7** (campos: validación de seguridad con alcance y fecha; evaluación DISC con fecha y tres competencias). La validación técnica es de **HU-155**. Las tres competencias como diferenciador de la tarjeta son de **HU-081**.

**El dato lo captura HU-176.** **Partida el 2026-10-02 por validación INVEST (fallas I, E y S), sin recortar alcance:** esta historia solo **muestra** los datos; la captura en el panel está en **HU-176**, en `depende_de`. Se construye y verifica con datos sembrados.

**Decisiones del sponsor aplicadas (2026-10-02):**
- **D60:** HU-176 se construye como **sub-slice inicial de EP-003**, antes que esta historia. Ya no es una dependencia hacia otra épica.
- **D61:** SARO (alcance y fecha) y DISC (fecha) son **obligatorios para publicar**, y el alcance sale de un **catálogo cerrado** (HU-177). Por eso el happy path cita el texto del catálogo, y el alcance y la fecha de SARO ya no pueden faltar por separado en un perfil publicado: el antiguo esquema «sin alcance / sin fecha» se funde en una sola fila.
- **D62:** los perfiles **ya publicados** sin estos datos siguen visibles y la ficha **omite el dato ausente sin afirmarlo**. El escenario de error pasa a tratar solo esos datos heredados y se funde con el antiguo edge «falta la fecha DISC». La marca «incompleto: falta …» es del panel (HU-178) y **nunca** cruza a la ficha del cliente.
- **D63:** el **Sello Personal es opcional**. Se añade el edge «DISC con fecha y sin Sello Personal»: la evaluación se afirma con su fecha y las competencias se omiten sin hueco, igual que en la tarjeta (HU-081).

**Las dos preguntas abiertas que tenía esta historia quedan cerradas** por D61 (obligatoriedad y catálogo de alcance).

**SARO, no «SORA»** (B.1).

## Trazabilidad

Épica madre: **EP-003** · PRD v4.17 · RF-3.2 · RF-3.4 · RF-3.8 · B.1 · B.4 · B.6 · B.7 · D60 · D61 · D62 · D63 · depende de HU-154 (bloque verificado) y HU-176 (captura de SARO y DISC, sub-slice inicial de EP-003) · relacionada con HU-177 (catálogo de alcances), HU-178 (publicados incompletos en el panel), HU-081 y HU-155

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: vive en el bloque verificado de HU-154 y toma el dato de HU-176, que es del sub-slice inicial de la misma épica; se prueba con datos sembrados |
| N | Negociable | ✓ son fijos el contenido con fecha y alcance, la ausencia de puntajes, que no se afirme lo no registrado y que la marca «incompleto» no cruce al cliente; la redacción y la disposición se pueden negociar |
| V | Valiosa | ✓ convierte la declaración genérica del estándar en evidencia concreta por persona, que es lo que pregunta un área de riesgo |
| E | Estimable | ✓ S: dos líneas en un bloque existente y tres campos más en el contrato de la ficha; D61 a D63 cerraron las dudas que quedaban |
| S | Pequeña | ✓ S: solo presentación, con cuatro escenarios; la captura y la marca del panel están fuera (HU-176, HU-178) |
| T | Testeable | ✓ perfiles sembrados completo, heredado sin SARO, heredado sin fecha DISC y con DISC sin Sello Personal dan líneas exactas o su ausencia; la ausencia de puntajes, del DISC detallado y de la marca «incompleto» se verifica en la pantalla y en la respuesta |
