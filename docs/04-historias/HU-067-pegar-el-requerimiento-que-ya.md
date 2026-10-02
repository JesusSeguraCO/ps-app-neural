---
id: HU-067
titulo: "Pegar el requerimiento que ya tengo escrito"
epica: EP-009
prioridad: media
complejidad: M
estado: lista
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-065, HU-068, HU-213]
---

# HU-067 — Pegar el requerimiento que ya tengo escrito

**Como** líder de proyecto que ya redactó el requerimiento en un documento interno,
**quiero** pegar ese texto completo y que el portal extraiga los criterios como etiquetas que pueda editar,
**para** aprovechar el trabajo que ya hice en lugar de volver a describir la necesidad.

## Criterios de aceptación

### Happy path — criterios extraídos como etiquetas editables

**Dado** que pegué un requerimiento ficticio de 1.012 caracteres que pide un desarrollador backend senior con Java 17, Spring Boot y Kafka, experiencia en banca, deseable AWS, inglés intermedio, y trae además plazos de contrato y una póliza
**Y** que veo el aviso de servicio externo de HU-213
**Cuando** elijo «Extraer criterios con Gemini»
**Entonces** veo aplicadas como etiquetas «Desarrollador Backend» (obligatorio), «Senior», «Java», «Spring Boot», «Kafka» y «Banca», cada una marcada «extraído por servicio externo» y con el fragmento del texto que la originó, y «AWS» como sugerencia deseable bajo «Ver 1 criterio más»
**Y** el plazo de contrato, la póliza y el inglés intermedio no producen ninguna etiqueta
**Y** los resultados son los que el motor calcula con esas etiquetas

### Error — el servicio devuelve una lista vacía para un texto que sí pide un perfil

**Dado** que pegué un requerimiento ficticio de 600 caracteres que pide «alguien para la plataforma de pagos en la nube, con experiencia en fintech», sin nombrar tecnologías
**Y** que el servicio externo responde sin error con una lista de criterios vacía
**Cuando** elijo «Extraer criterios con Gemini»
**Entonces** veo como etiquetas los criterios que el intérprete propio (HU-065) reconoce en mi texto, entre ellos «Fintech», y sus resultados
**Y** veo «El servicio externo no encontró criterios en tu texto; lo interpretamos con nuestras reglas. Revisa los criterios.»
**Y** no veo «No encontramos criterios de perfil en tu texto» mientras el intérprete propio reconozca algún criterio

### Edge case — tope de seis etiquetas aplicadas

**Dado** que el servicio propone de mi texto los criterios válidos de la tabla
**Cuando** elijo «Extraer criterios con Gemini»
**Entonces** veo aplicadas las etiquetas y, bajo «Ver N criterios más», las sugerencias deseables sin aplicar que indica la tabla

| Propuesta del servicio | Aplicadas | Sugerencias deseables sin aplicar |
|---|---|---|
| 2 obligatorios y 8 deseables | 6: los 2 obligatorios y los 4 primeros deseables en el orden del texto | 4 |
| 8 obligatorios, todos exigidos de forma explícita por el texto | 6: los 6 primeros obligatorios en el orden del texto | 2, que pasan a deseables |
| 4 obligatorios de perfil, más «Híbrido» y «México» marcados obligatorios cuyo fragmento («modalidad híbrida en Ciudad de México») no los exige, y 2 deseables que aparecen después en el texto | 6: los 4 obligatorios, y «Híbrido» y «México» como deseables | 2 |

### Edge case — valores fuera del catálogo o inventados

**Dado** que el servicio propone «Cobol», que no está en el catálogo, y «Scrum», cuyo fragmento no aparece en mi texto
**Cuando** elijo «Extraer criterios con Gemini»
**Entonces** «Cobol» aparece en la lectura completa como descartado con el motivo «no está en el banco» y no se aplica
**Y** «Scrum» no aparece en ninguna parte de la lectura ni se aplica

### Edge case — corregir una etiqueta no vuelve a llamar al servicio

**Dado** que tengo aplicadas las etiquetas extraídas de mi requerimiento
**Cuando** quito la etiqueta «Kafka»
**Entonces** los resultados se recalculan sin «Kafka»
**Y** no sale ninguna llamada nueva al servicio externo

## Notas

Cubre **RF-12.2** (pegar un requerimiento y obtener chips editables) y **RF-12.2.1** (para textos largos Gemini extrae los criterios con salida estructurada contra la taxonomía, bajo el contrato de RF-16), con **RF-16.1** (el modelo interpreta: no recupera ni redacta). El aviso previo, el saneamiento y la garantía de que no viajan datos de perfiles (RF-16.2) son de **HU-213**; la vuelta al determinista cuando el servicio falla, de **HU-072**.

**Decisiones por delegación del sponsor (elegidas por el modelo, opción recomendada de ADR-0004):**
- **Texto largo = más de 280 caracteres o más de un párrafo** (propuesta de ADR-0004, CRN-16), recalibrable con la prueba previa sin cambiar los escenarios.
- **Seis etiquetas aplicadas como máximo** (precisado por **D135**): primero los obligatorios en el orden del texto y los deseables completan hasta seis; lo que pase de seis, obligatorio o no, queda como sugerencia deseable sin aplicar. **Modalidad y país** solo se marcan obligatorios cuando el texto los exige de forma explícita; si no, son deseables (en T-23 marcarlos obligatorios llevaba a 7–9 etiquetas aplicadas). Es la respuesta al «en contra» de RF-12.2 (diez chips donde importan tres): no se le pide al cliente limpiar lo que no pidió activar.
- **Validación de la salida** (ADR-0004, revisión adversarial): un valor fuera del catálogo se descarta con motivo visible; un valor cuyo fragmento no aparece en el texto se descarta en silencio, porque no tiene de dónde salir.

**Lista vacía con texto no vacío (D135).** En T-23 un texto ambiguo devolvió una lista vacía en 1 de 3 corridas. Se resuelve cayendo al intérprete propio con aviso, no con «No encontramos criterios». Si tampoco el intérprete propio reconoce nada, aplica el mensaje sin coincidencia y el texto conservado de HU-072.

**T-23 (2026-10-02): PASA, con reserva.** Precisión 100 % (0 etiquetas que sobran en 15 corridas), 0 criterios inventados, exhaustividad 98,2 % (109 de 111 esperados), salida con esquema válido 15/15. Reserva de método: los cinco textos y sus conjuntos esperados los escribió el agente, no Comercial (mismo autor, sesgo a favor). Es un ensayo válido del mecanismo, no la prueba definitiva. **D135** (cierra D131): RF-12.2 se construye.

**Prerrequisito del DoR de EP-009 (no es recorte):** repetir T-23 con 5 textos reales anonimizados por Comercial (método c), cambiando solo `esperados.json`, y registrar el resultado. Sigue siendo condición de entrada la verificación **V4-8** (`worker verificar-salidas` con la llave de producción).

**Pregunta abierta del sponsor (D135):** la historia pedía extraer la dimensión «idioma» («Inglés intermedio»), que hoy no existe en el catálogo. Mientras el sponsor no decida si entra, el escenario feliz no produce etiqueta de idioma (no hay valor del banco contra el que validarla); si entra, se añade la etiqueta sin cambiar el resto de escenarios.

**Línea de release.** Vuelve al MVP con D135 (antes estaba en v1.1 a la espera de T-23).

**Fuente de diseño:** `docs/05-prototipo/pantallas/inicio-busqueda--requerimiento-pegado.html` y `inicio-busqueda--sin-criterios-reconocibles.html` (borrador).

## Trazabilidad

Épica madre: **EP-009** · PRD v4.18 · RF-12.2 · RF-12.2.1 · RF-16.1 · D-24 · ADR-0004 (umbral de texto, validación de la salida, chips de origen) · T-23 (PASA con reserva) · D131 → D135 · V4-8 · depende de HU-065 (intérprete), HU-068 (lectura) y HU-213 (aviso y saneamiento), misma épica · relacionada con HU-072

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ la condición del PRD (T-23) se ejecutó y PASA (D135); sus dependencias de la misma épica (HU-065, HU-068, HU-213) están declaradas y la repetición con textos de Comercial es prerrequisito del DoR de la épica, no de la historia |
| N | Negociable | ✓ son fijos la salida estructurada contra la taxonomía, la validación de lo que propone el servicio, la vuelta al intérprete propio con lista vacía y que corregir no vuelve a llamarlo; la forma de las etiquetas y el texto del aviso se negocian |
| V | Valiosa | ✓ el cliente reaprovecha el requerimiento que ya escribió |
| E | Estimable | ✓ M: Route Handler que llama al adaptador de `packages/infra/gemini` ya existente, esquema de salida, validación contra el catálogo y la pantalla de etiquetas |
| S | Pequeña | ✓ M: cinco escenarios sobre una capacidad |
| T | Testeable | ✓ e2e con un doble del servicio que devuelve salidas fijadas (válida, lista vacía, las tres filas del tope, fuera de catálogo, fragmento inexistente) y conteo de llamadas salientes |
