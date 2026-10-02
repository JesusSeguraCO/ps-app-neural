---
id: HU-180
titulo: "Llevar a HubSpot el contexto añadido a una solicitud en curso"
epica: EP-007
prioridad: alta
complejidad: S
estado: draft
fase: integracion-hubspot
prd_version: 4.18
depende_de: [HU-161]
---

# HU-180 — Llevar a HubSpot el contexto añadido a una solicitud en curso

**Como** integrante de Coordinación de Servicio que prepara la sesión de alineación,
**quiero** encontrar en HubSpot, junto a la solicitud que ya existe, el contexto que el cliente le añadió, con su fecha,
**para** llegar a la sesión con lo último que dijo el cliente sin tener que buscar un segundo negocio que no debería existir.

## Criterios de aceptación

### Happy path [portal] — el contexto queda como nota en el negocio existente

**Dado** que un cliente tiene una solicitud registrada en HubSpot hace 3 días y eligió añadir contexto en lugar de enviar otra,
**cuando** el worker procesa ese contexto,
**Entonces** existe una nota nueva asociada al negocio de la solicitud original y a su contacto, que empieza por «Contexto añadido el AAAA-MM-DD a SOL-AAAA-NNNN» y lleva el texto del cliente
**Y** no se crea ningún negocio
**Y** el párrafo de «Solicitudes People Service» y la nota inicial de la solicitud no cambian

### Edge case [portal] — la solicitud en curso ya no es reciente

**Dado** que un cliente prepara una solicitud con la misma especificación que otra suya anterior registrada hace los días de la tabla,
**cuando** la envía,
**Entonces** el portal le ofrece o no añadir contexto a la anterior, según la tabla

| Días desde la solicitud anterior | Qué ve el cliente |
|---|---|
| 7 | se le ofrece añadir contexto a la anterior en lugar de enviar otra; si lo elige, sigue el happy path, sin solicitud ni negocio nuevos |
| 8 | no se le ofrece añadir contexto: la solicitud se envía como nueva, con su propio identificador y su propio negocio |

### Edge case [portal] — la solicitud original aún no llegó a HubSpot

**Dado** que el cliente añadió contexto a una solicitud cuyo negocio sigue pendiente en la cola,
**cuando** el worker procesa la cola,
**Entonces** crea primero el negocio de la solicitud original y después la nota del contexto
**Y** el contexto nunca se procesa antes que la solicitud a la que pertenece

### Error [portal] — la respuesta de la nota de contexto se perdió

**Dado** que HubSpot creó la nota de un contexto añadido y su respuesta no llegó al worker,
**cuando** el worker reintenta ese contexto,
**Entonces** encuentra entre las notas del negocio la que lleva el marcador de ese contexto y no crea otra
**Y** la línea de tiempo del contacto muestra el contexto una sola vez

## Notas

Cubre la excepción de **D-7** (RF-9.2): «si ya existe una solicitud del portal con la misma especificación en días recientes, no se duplica: se añade contexto a la existente», con el mecanismo de la **enmienda v4.18 del PRD** corregida por **D76**.

**Revisión 2026-10-02 (D73; segunda ronda D76).** **D73**: «reciente» son **7 días** (tabla de límite 7 y 8). **D76**: el contexto ya no es un segundo envío de formulario que el workflow tenga que reconocer: el worker lo escribe como **nota por la API**, asociada al negocio que ya conoce (el enlace guardado al registrar la solicitud, HU-102) y a su contacto, con el marcador `[ps:<SOL>:contexto:<n>]`. Desaparecen la E ✗ por «cómo anota el workflow el contexto en el negocio» y el duplicado aceptado en la línea de tiempo. El escenario [HubSpot] anterior pasa a [portal]: lo que se ve en HubSpot es la nota que el worker crea.

**Revisión de validación 2026-10-02.** Faltaba un escenario de error: el de la **respuesta perdida** (tiempo agotado tras crear la nota) es un fallo de la integración y pasa a etiquetarse como **error**. La tabla de 7 y 8 días se reescribe como lo que ve el cliente (**se le ofrece / no se le ofrece** añadir contexto), coherente con el happy path, donde el cliente *elige* añadir contexto: el portal no convierte en silencio una solicitud en contexto.

**Por verificar en el HubSpot real (D84):** lo mismo que HU-161, que crear y leer notas funcione con los scopes mínimos; si exige uno más, lo aprueba el sponsor.

**`message` del contacto** no se toca: el texto añadido vive en la nota, para no pisar el mensaje de la solicitud original.

**Dónde se decide.** La pantalla que ofrece «añadir contexto en lugar de enviar otra» es de HU-098 (EP-005) y HU-077 (EP-010); aplica la ventana de 7 días de esta historia. Sin esas pantallas se prueba con un contexto sembrado.

**Datos personales:** el texto lo escribió el cliente; la nota no añade datos de la lista negra B.4 ni tarifas (D-9).

## Trazabilidad

Épica madre: **EP-007** · PRD v4.18 · RF-9.2 (excepción de D-7), RF-9.4 · D-7, D-9 · B.4 · D52 (sustituida en parte), D73, D76, D84 (sponsor, 2026-10-02) · ADR-0009 (enmienda D76) · sale de HU-161 · depende de HU-161 · relacionada con HU-098 (EP-005) y HU-077 (EP-010)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: reutiliza el negocio y el subpaso de nota de HU-161; se prueba con un contexto sembrado sin las pantallas de EP-005 ni EP-010 |
| N | Negociable | ✓ fija que el contexto va a la solicitud existente, que nunca crea un negocio, que el cliente lo elige, la ventana de 7 días para ofrecerlo, el orden en la cola y que no se duplica; la redacción de la nota se negocia |
| V | Valiosa | ✓ quien conduce la sesión ve lo último que dijo el cliente junto a la misma solicitud y el CRM no se llena de negocios repetidos |
| E | Estimable | ✓ S: una nota más con marcador, el orden en la cola y la regla de 7 días; con el mismo riesgo de scopes de notas que HU-161 hasta D84 |
| S | Pequeña | ✓ S: una capacidad (llevar el contexto añadido) en cuatro escenarios: happy, error (respuesta perdida) y dos edges |
| T | Testeable | ✓ el doble de la API muestra la nota de contexto en el negocio existente, el orden tras una original pendiente y el reintento tras una respuesta perdida que no la duplica; con reloj simulado, a 7 días se ofrece añadir contexto y a 8 no |
