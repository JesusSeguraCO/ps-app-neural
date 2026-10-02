---
id: HU-019
titulo: "Responder de un toque la pregunta de Trycore sobre contratar agentes autónomos"
epica: EP-002
prioridad: media
complejidad: M
estado: lista
fase: refinamiento-y-descubrimiento
prd_version: 4.18
depende_de: [HU-226]
---

# HU-019 — Responder de un toque la pregunta de Trycore sobre contratar agentes autónomos

**Como** líder de área que explora el banco completo de su cuenta,
**quiero** ver entre los resultados una pregunta de Trycore que no se confunda con un perfil y responderla de un toque, con la opción de dejar un comentario,
**para** decir si contrataría un agente autónomo como parte de mi equipo sin creer que es un candidato ni que me ofrecen algo que ya existe.

## Criterios de aceptación

### Happy path — la tarjeta se lee como una pregunta de Trycore

**Dado** que el espacio no-perfil del grid (HU-226) muestra el sondeo,
**cuando** lo miro,
**Entonces** veo el encabezado «Pregunta de Trycore» y la declaración «Esto aún no existe: lo estamos explorando»
**Y** veo una sola pregunta sobre contratar un agente autónomo, con su propia especialidad, como una unidad más de mi equipo
**Y** veo tres respuestas de un toque: «Me interesa», «Quiero más detalle» y «No por ahora»
**Y** la tarjeta usa el estilo de pregunta, con fondo y borde distintos de los de una tarjeta de perfil, y no tiene nombre de persona, disponibilidad, «Sumar al equipo» ni «Ver ficha»

### Happy path — votar de un toque

**Dado** que veo el sondeo en el séptimo lugar del grid,
**cuando** toco «Me interesa»,
**Entonces** queda registrado mi voto con mi cuenta y mi contacto
**Y** la tarjeta se reduce a una línea que agradece la respuesta y ofrece «Añadir un comentario», opcional
**Y** deja de ocupar el lugar de un perfil: el perfil siguiente sube al séptimo lugar

### Alterno — pedir más detalle

**Dado** que veo el sondeo en el séptimo lugar del grid,
**cuando** toco «Quiero más detalle»,
**Entonces** queda registrado como pedido de detalle, con mi cuenta y mi contacto
**Y** la tarjeta se reduce a una línea que agradece, dice que alguien de Trycore me contará más de lo que estamos explorando y ofrece el campo opcional «¿Para qué lo usarías?»
**Y** si dejo el campo vacío, el pedido de detalle ya cuenta igual

### Error — el voto no se pudo guardar

**Dado** que veo el sondeo y el portal no logra guardar respuestas en este momento,
**cuando** toco «Me interesa»,
**Entonces** la tarjeta no agradece: dice que no se pudo guardar la respuesta y ofrece reintentar
**Y** no queda ningún voto registrado de ese intento

### Edge case — la redacción es de exploración

**Dado** que el sondeo está a la vista,
**cuando** leo todo su texto, incluido el agradecimiento,
**Entonces** no contiene ninguna fecha ni las palabras «próximamente», «pronto», «nuevo», «ya disponible» o «lanzamiento»
**Y** habla de contratar el agente como unidad, nunca de profesionales que trabajan apoyados en agentes

## Notas

Cubre **RF-10.5** (pregunta de Trycore, no publicidad; apariencia deliberadamente distinta), **RF-10.6** (una sola pregunta, respuesta de un toque, opción de ampliar en texto libre; tras votar agradece y colapsa), **RF-10.7** (redacción de exploración: sin fechas ni «próximamente»), **RF-10.9.1** (las opciones distinguen interés de compromiso), **RF-10.10** (lo que se sondea es contratar un **agente autónomo como unidad**, no talento humano que se apoya en agentes) y **RF-10.11** (puede tener forma de tarjeta, siempre que declare que **aún no existe**). La colocación (RF-10.1 a RF-10.3) es de **HU-226**; la frecuencia y el descarte (RF-10.4), de **HU-020**; el viaje a HubSpot (RF-10.8), de **HU-224**; el umbral (RF-10.9), de **HU-225**.

**Nace el 2026-10-02 (discovery de EP-002)** con el identificador HU-019 que el mapa de historias y el backlog reservaban para el sondeo («HU-019 – HU-020 · Sondeo de agentes autónomos en el grid · sin historia escrita»).

**Decisiones elegidas por el modelo por delegación del sponsor** (copy marcado para revisión con Mercadeo, como D73):
- **Tres respuestas.** «Me interesa» es el interés que cuesta un segundo; «Quiero más detalle» es el compromiso que cuesta tiempo al cliente, porque acepta que Trycore le escriba (RF-10.9.1); «No por ahora» es la salida honesta. **«Quiero más detalle» cuenta también como un sí** para el primer criterio del umbral (HU-225): quien pide detalle está diciendo que sí con más fuerza.
- **El voto se registra en el toque** (respuesta de un toque, RF-10.6); el texto libre es opcional y se añade después: «Añadir un comentario» tras «Me interesa» y «¿Para qué lo usarías?» al pedir detalle. Pedirlo obligatorio convertiría el toque en un formulario.
- **Colapsa en el mismo toque**: la tarjeta se reduce a una línea de agradecimiento y el perfil siguiente sube a su lugar; no sigue ocupando un espacio de inventario (RF-10.6).
- **Lo que promete «Quiero más detalle»** es que alguien de Trycore le contará más de la exploración, no una fecha ni un producto. Quién y cómo le escribe lo resuelve HU-224 (aviso al propietario de la cuenta por workflow de HubSpot).
- **Un voto por contacto**: el registro es idempotente por invitado; reintentar tras un fallo deja un solo voto (prueba unitaria del endpoint). El comentario opcional se guarda junto a la respuesta al enviarlo.
- **Texto propuesto** (a revisar con Mercadeo): «Pregunta de Trycore · Esto aún no existe: lo estamos explorando. ¿Contratarías un agente de IA autónomo, con su propia especialidad, como una unidad más de tu equipo?».

**Diseño.** El prototipo v2 no tiene pantalla del sondeo. Antes de construir su interfaz hace falta la pantalla, generada con `/build:prototype` en modo feature y aprobada por el sponsor (mismo trato que D102 para EP-008).

**Medición.** El voto se guarda en el portal (`POST /api/v1/sondeo/voto`, ADR-0004/ADR-0009) con cuenta, contacto, respuesta, texto y la sesión de acceso en que ocurrió (de ella salen el enlace y la edición curada); de ahí lo leen HU-224 (HubSpot) y HU-225 (umbral). El texto libre se sanea de correos y teléfonos antes de guardarse, como las consultas sin coincidencia (ADR-0006).

## Trazabilidad

Épica madre: **EP-002** · PRD v4.18 · RF-10.5 · RF-10.6 · RF-10.7 · RF-10.9.1 · RF-10.10 · RF-10.11 · D-11 · ADR-0004 (UC-8) · ADR-0009 (`RegistrarVoto`) · id reservado en el mapa y el backlog (HU-019 – HU-020) · depende de HU-226 (espacio no-perfil) · relacionada con HU-020, HU-224 y HU-225

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: ocupa el espacio no-perfil de HU-226 (misma épica, se construye antes); guarda el voto en el portal sin esperar a HubSpot (HU-224) ni al umbral (HU-225) |
| N | Negociable | ✓ fijos: que se lea como pregunta y declare que no existe, tres respuestas que separan interés de compromiso, texto opcional, sin fechas ni promesas, colapso tras votar; el copy queda para revisión con Mercadeo |
| V | Valiosa | ✓ produce la señal calificada que decide si Trycore investiga la oferta de agentes, sin prometer lo que no existe |
| E | Estimable | ✓ M: una tarjeta con tres estados (pregunta, comentario, agradecimiento), un endpoint idempotente y su tabla |
| S | Pequeña | ✓ M: una capacidad (responder el sondeo) en cinco escenarios; colocación, descarte, HubSpot y umbral van aparte |
| T | Testeable | ✓ e2e con el sondeo sembrado: textos y estilo, voto y comentario registrados, fallo y reintento sin duplicar, y una comprobación automática de las palabras prohibidas |
