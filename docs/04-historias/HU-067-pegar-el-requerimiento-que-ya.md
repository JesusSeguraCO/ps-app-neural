---
id: HU-067
titulo: "Pegar el requerimiento que ya tengo escrito"
epica: EP-009
prioridad: media
complejidad: M
estado: draft
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
**Entonces** veo como etiquetas «Desarrollador Backend» (obligatorio), «Senior», «Java», «Spring Boot», «Kafka», «Banca» e «Inglés intermedio», cada una marcada «extraído por servicio externo» y con el fragmento del texto que la originó
**Y** el plazo de contrato y la póliza no producen ninguna etiqueta
**Y** los resultados son los que el motor calcula con esas etiquetas

### Error — texto sin criterios de perfil

**Dado** que pegué un acta de reunión ficticia de 900 caracteres sin roles, tecnologías, sectores ni seniority del catálogo
**Cuando** elijo «Extraer criterios con Gemini»
**Entonces** veo «No encontramos criterios de perfil en tu texto» y mi texto sigue completo en la barra
**Y** puedo editarlo o reemplazarlo por una instrucción corta, y no veo perfiles presentados como coincidencia

### Edge case — más criterios de los que conviene mostrar

**Dado** que el servicio extrae de mi texto 10 criterios válidos: 2 obligatorios y 8 deseables
**Cuando** elijo «Extraer criterios con Gemini»
**Entonces** veo aplicadas 6 etiquetas: los 2 obligatorios y los 4 primeros deseables en el orden en que aparecen en el texto
**Y** los otros 4 quedan bajo «Ver 4 criterios más», sin aplicarse hasta que active cada uno

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
- **Seis etiquetas aplicadas como máximo**: siempre todos los obligatorios que proponga el servicio; los deseables completan hasta seis en el orden del texto; el resto queda como propuesta sin aplicar. Es la respuesta al «en contra» de RF-12.2 (diez chips donde importan tres): no se le pide al cliente limpiar lo que no pidió activar.
- **Validación de la salida** (ADR-0004, revisión adversarial): un valor fuera del catálogo se descarta con motivo visible; un valor cuyo fragmento no aparece en el texto se descarta en silencio, porque no tiene de dónde salir.

**Por qué sigue en draft (condición del PRD, no del refinamiento).** RF-12.2 dice: *«Prueba previa obligatoria: pegar cinco requerimientos reales de clientes actuales y contar cuántos chips sobran. Sin esa prueba, RF-12.2 no se construye.»* Esa prueba es **T-23** del backlog arquitectónico, **PENDIENTE**. Por delegación se elige su método recomendado, la opción (c): **Comercial reescribe y anonimiza cinco requerimientos reales**, que pasan a ser datos ficticios y pueden usar el token personal de desarrollo (CON-8, D-24). La historia está refinada y pasa INVEST; sube a `lista` cuando T-23 se ejecute y su resultado se registre. Qué hacer si la prueba sale mal (sobran más chips de los que sirven) es una decisión de alcance del sponsor, no del modelo. También es condición de entrada de esta parte la verificación **V4-8** (`worker verificar-salidas` con la llave de producción).

**D131 (2026-10-02) — pendiente del sponsor.** Qué hacer con RF-12.2 si T-23 no se ejecuta (posible diferimiento) lo decide el sponsor, no el modelo. Mientras tanto esta historia sigue en `draft` junto con HU-067, HU-213 y HU-072; EP-009 arranca con sus 17 HU en `lista`.

**Línea de release.** El mapa ubica esta historia fuera del MVP por la prueba previa. Es ubicación, no recorte.

**Fuente de diseño:** `docs/05-prototipo/pantallas/inicio-busqueda--requerimiento-pegado.html` y `inicio-busqueda--sin-criterios-reconocibles.html` (borrador).

## Trazabilidad

Épica madre: **EP-009** · PRD v4.18 · RF-12.2 · RF-12.2.1 · RF-16.1 · D-24 · ADR-0004 (umbral de texto, validación de la salida, chips de origen) · T-23 · D131 (pendiente del sponsor) (prueba previa, pendiente) · V4-8 · depende de HU-065 (intérprete), HU-068 (lectura) y HU-213 (aviso y saneamiento), misma épica · relacionada con HU-072

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✗ condicionada por el PRD a la prueba previa T-23 (pendiente); sus dependencias de la misma épica (HU-065, HU-068, HU-213) están declaradas |
| N | Negociable | ✓ son fijos la salida estructurada contra la taxonomía, la validación de lo que propone el servicio y que corregir no vuelve a llamarlo; el tope de seis y la forma de las etiquetas se negocian |
| V | Valiosa | ✓ el cliente reaprovecha el requerimiento que ya escribió |
| E | Estimable | ✓ M: Route Handler que llama al adaptador de `packages/infra/gemini` ya existente, esquema de salida, validación contra el catálogo y la pantalla de etiquetas |
| S | Pequeña | ✓ M: cinco escenarios sobre una capacidad |
| T | Testeable | ✓ e2e con un doble del servicio que devuelve salidas fijadas (válida, vacía, diez criterios, fuera de catálogo, fragmento inexistente) y conteo de llamadas salientes |
