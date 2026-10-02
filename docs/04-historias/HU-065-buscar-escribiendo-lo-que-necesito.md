---
id: HU-065
titulo: "Buscar escribiendo lo que necesito en mis propias palabras"
epica: EP-009
prioridad: alta
complejidad: M
estado: lista
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-139]
---

# HU-065 — Buscar escribiendo lo que necesito en mis propias palabras

**Como** líder de área en una cuenta cliente de People Service, que busca un perfil dos o tres veces al año,
**quiero** escribir lo que necesito con mis propias palabras, aunque no use los nombres de Trycore y cometa errores de digitación,
**para** encontrar perfiles sin tener que aprender antes cómo nombra Trycore los roles y las tecnologías.

## Criterios de aceptación

### Happy path — el léxico traduce mis palabras

**Dado** que el banco tiene perfiles publicados de rol Desarrollador Móvil y el léxico aprobado traduce «ingeniero de aplicaciones móviles» a rol Desarrollador Móvil y tecnologías Flutter, React Native, Kotlin y Swift
**Cuando** envío «necesito un ingeniero de aplicaciones móviles»
**Entonces** la lectura muestra «Desarrollador Móvil» como obligatorio y Flutter, React Native, Kotlin y Swift como tecnologías deseables, con la etiqueta «basta con que tenga alguna»
**Y** los resultados son los perfiles publicados de rol Desarrollador Móvil
**Y** se registra el evento `instruccion_enviada` con origen `libre` y fuente `determinista`

### Edge case — tildes, mayúsculas, plurales y errores de digitación

**Dado** que el banco tiene el rol Desarrollador Backend y la tecnología JavaScript
**Cuando** envío «DESAROLLADORES Backend con JavaScrip»
**Entonces** la lectura muestra «Desarrollador Backend» y «JavaScript», cada uno con el fragmento que lo originó («DESAROLLADORES», «JavaScrip»)
**Y** los resultados son los mismos que al enviar «desarrollador backend con javascript»

### Edge case — patrones de seniority, años, modalidad y ubicación

**Dado** que el banco tiene el rol Desarrollador Backend
**Cuando** envío «backend senior con 8 años, remoto, en Colombia»
**Entonces** la lectura muestra «Desarrollador Backend» como obligatorio y, como deseables, seniority «Senior», «8 años o más de experiencia» y modalidad «Remoto»
**Y** «Colombia» queda como país de la necesidad, sin filtrar perfiles (HU-082)

### Error — nada reconocible en la instrucción

**Dado** que ni el catálogo ni el léxico tienen ningún valor o término para «blockchain»
**Cuando** envío «experto en blockchain»
**Entonces** veo «No encontramos en el banco nada que corresponda a "experto en blockchain"» y mi texto sigue en la barra para editarlo
**Y** no veo ningún perfil presentado como coincidencia de mi búsqueda
**Y** la consulta queda registrada con su texto literal como consulta sin coincidencia

### Edge case — una consulta corta nunca pasa por el servicio externo

**Dado** que el servicio externo de interpretación no responde
**Cuando** envío «desarrollador java senior» (25 caracteres)
**Entonces** veo la lectura y los resultados completos, sin ningún aviso de lectura aproximada
**Y** no sale ninguna llamada al servicio externo (el registro de llamadas no tiene fila nueva)

## Notas

Cubre **RF-2.6** (intérprete determinista propio: normalización de tildes, plurales y mayúsculas, distancia de edición, patrones de seniority, años, modalidad y ubicación, léxico controlado de RF-8.12), **RF-2.6.3** (la consulta sin coincidencia se registra con su texto literal), **RF-2.6.4** (sin índice semántico ni vectorial) y la regla de **RF-12.2.1** «las consultas cortas nunca pasan por el modelo» (D-24). El léxico lo administra Talento Humano en el panel (HU-139, EP-006, construida).

**Refinada el 2026-10-02 (discovery de EP-009).** Tras D-24 la búsqueda corta no usa Gemini: el antiguo escenario «el servicio de interpretación no responde» deja de ser un error de esta historia y pasa a ser la garantía del quinto escenario. La degradación del requerimiento largo es de **HU-072**. La lectura (compacta o completa según la confianza) es de **HU-068**; los dos niveles de resultados, de **HU-210**.

**Decisiones por delegación del sponsor (elegidas por el modelo, opción recomendada de ADR-0004):**
- **Texto corto = hasta 280 caracteres y un solo párrafo.** Por encima entra el flujo de HU-213/HU-067. Es la propuesta de ADR-0004 (CRN-16); se recalibra con la prueba previa de RF-12.2 (T-23) sin cambiar esta historia.
- **Tolerancia de digitación:** Damerau-Levenshtein con umbral por longitud de palabra (distancia 1 desde 5 letras, 2 desde 9), sobre la forma normalizada. El valor exacto es negociable; lo fijo es que la corrección se muestra con su fragmento de origen.
- **Por omisión solo el rol es obligatorio** (RF-13.9.2): todo lo demás que reconoce el intérprete entra como deseable.
- **«8 años»** se lee como «8 años o más de experiencia» declarada.
- **Sin nada reconocido** el portal lo dice y conserva el texto; el contenido de la pantalla del cero (lo más cercano, solicitud a medida) es de **EP-010** (HU-075, HU-077). Esta historia no depende de EP-010.

**Medición.** `instruccion_enviada` (ADR-0006, eventos de falsación) es el insumo de HU-173 y, con la secuencia de eventos de la visita, del «tiempo hasta el primer perfil abierto» de RF-13.1 (HU-186). La consulta sin coincidencia se guarda una sola vez en su tabla, con el enmascarado de ADR-0006 (nunca en la carga del evento).

**Fuente de diseño:** `docs/05-prototipo/pantallas/inicio-busqueda.html`, `resultados.html` y `resultados--sin-reconocer.html` (estado «borrador» en el manifest).

## Trazabilidad

Épica madre: **EP-009** · PRD v4.18 · RF-2.6 · RF-2.6.3 · RF-2.6.4 · RF-12.2.1 (consultas cortas) · RF-13.9.2 · D-24 · ADR-0004 (intérprete, confianza) · ADR-0006 (`instruccion_enviada`) · depende de HU-139 (léxico, EP-006, construida) · relacionada con HU-068, HU-072, HU-210 (misma épica), HU-173 y HU-186 (EP-008), HU-075 (EP-010)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ solo necesita el léxico y el catálogo, que EP-006 ya construyó; la lectura visible (HU-068) y la degradación del texto largo (HU-072) son historias aparte |
| N | Negociable | ✓ son fijos el intérprete propio sin servicio externo, la regla de «solo el rol obligatorio» y el registro de lo no reconocido; los umbrales de distancia y la redacción del aviso se negocian |
| V | Valiosa | ✓ el cliente busca con sus palabras y con errores de digitación sin aprender la taxonomía de Trycore |
| E | Estimable | ✓ M: normalización, distancia de edición, cuatro patrones y léxico como funciones puras en `packages/motor`, más el registro de consultas sin coincidencia y el evento |
| S | Pequeña | ✓ M: una capacidad (interpretar la consulta corta) en cinco escenarios |
| T | Testeable | ✓ unitarios del intérprete con léxico sembrado (cada escenario es una entrada y una salida exactas) y e2e que verifica la lectura, el registro sin coincidencia y la ausencia de llamadas externas |
