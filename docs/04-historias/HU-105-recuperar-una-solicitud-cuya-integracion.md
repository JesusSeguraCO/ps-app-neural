---
id: HU-105
titulo: "Recuperar una solicitud que no llegó a HubSpot"
epica: EP-007
prioridad: alta
complejidad: M
estado: draft
fase: integracion-hubspot
prd_version: 4.18
depende_de: [HU-102]
---

# HU-105 — Recuperar una solicitud que no llegó a HubSpot

**Como** responsable técnico de la integración con HubSpot,
**quiero** que una solicitud cuyo negocio no se pudo crear quede guardada, se reintente sola sin duplicarse y me avise cuando ya no parece un fallo pasajero,
**para** que ninguna oportunidad se pierda por una caída que el cliente nunca va a ver.

## Criterios de aceptación

### Happy path [portal] — el reintento crea el negocio cuando HubSpot vuelve

**Dado** que el primer intento de crear el negocio de una solicitud falló porque HubSpot no respondía, la solicitud está guardada como pendiente y HubSpot ya volvió a responder,
**cuando** llega la hora del siguiente intento programado,
**Entonces** el worker crea el negocio en HubSpot
**Y** la solicitud pasa a «registrada en HubSpot», con su enlace
**Y** no se envía ningún aviso de fallo al responsable técnico

### Error [portal] — HubSpot no responde al enviar la solicitud

**Dado** que la API de CRM de HubSpot no responde o responde con un error de servidor,
**cuando** el cliente envía la solicitud,
**Entonces** el cliente recibe su confirmación igual, sin mención al fallo
**Y** la solicitud queda guardada como pendiente y se reintenta con espera creciente según la tabla

| Intento fallido | Espera antes del siguiente (±10 %) |
|---|---|
| 1 | 5 min |
| 2 | 10 min |
| 3 | 20 min |
| 4 | 40 min |
| 5 y siguientes | 55 min |

### Error [portal] — tercer fallo seguido

**Dado** que una solicitud acumula dos intentos fallidos por errores pasajeros,
**cuando** falla el tercero,
**Entonces** el responsable técnico recibe un correo con la solicitud, los intentos y el error de cada uno
**Y** la solicitud aparece en la bandeja de fallos del panel (HU-164)
**Y** el reintento sigue con la misma tabla, sin límite de intentos

### Edge case [portal] — HubSpot creó el negocio pero la respuesta se perdió

**Dado** que HubSpot creó el negocio de una solicitud y su respuesta no llegó al worker por tiempo agotado,
**cuando** el worker reintenta crear el negocio con el mismo «Id solicitud People Service»,
**Entonces** HubSpot rechaza el duplicado por la propiedad de valor único y no existe un segundo negocio
**Y** el worker lee el negocio existente por ese identificador y la solicitud pasa a «registrada en HubSpot» una sola vez, con su enlace
**Y** Coordinación de Servicio recibe un solo aviso de esa solicitud (HU-101)

### Edge case [portal] — el contacto quedó y el negocio no

**Dado** que en el primer intento el worker creó o actualizó el contacto y la creación del negocio falló,
**cuando** el worker reintenta la solicitud,
**Entonces** continúa desde la creación del negocio sin volver a crear el contacto
**Y** en HubSpot queda un solo contacto con ese correo

## Notas

Cubre **RF-9.6** y **RF-9.6.1** (guardar antes de enviar, cola en la base de datos, espera creciente hasta 55 minutos, aviso al tercer fallo sin dejar de reintentar), con el mecanismo de la **enmienda v4.18 del PRD** corregida por **D76**.

**Revisión 2026-10-02, segunda ronda (D76, corrige D52).** Lo que se reintenta vuelve a ser **la creación por la API**: el trabajo `crear_negocio` con subpasos `contacto` → `negocio` → `nota` (ADR-0009, enmienda D76), cada uno con su clave en `trabajos_pasos`, y un reintento **salta los pasos hechos**. La idempotencia ya no depende de un workflow: el **«Id solicitud People Service» de valor único** hace que HubSpot rechace el segundo negocio, y el worker reutiliza el existente leyéndolo por ese identificador (`crm.objects.deals.read`). El escenario que antes era [HubSpot] («el reenvío no crea un segundo negocio») pasa a [portal] y se prueba con la suite. Un rechazo por valor duplicado **no es un fallo**: no suma intento ni va a la bandeja. Antes del reintento, el doble clic ya se cortó en origen (HU-098): una sola solicitud y un solo trabajo por envío.

**Revisión de validación 2026-10-02.** El happy path anterior tenía dos acciones (el envío y la vuelta de HubSpot). Se parte en dos: el **error** del envío con HubSpot caído (confirmación al cliente, pendiente y tabla de esperas) y el **happy** de la recuperación, con el fallo previo en el Dado y una sola acción (llega la hora del intento). Quedan cinco escenarios.

**Ya desaparece el duplicado en la línea de tiempo** que aceptaba la versión del formulario: la nota de la solicitud se crea una sola vez (HU-161).

**Ya existe en el código** (EP-001 y EP-006): la cola `operacion.trabajos` con reclamo por fila, `clave_idempotencia` única, el cálculo de espera y el adaptador de correo. Falta el manejador `crear_negocio`, el adaptador de la API de CRM y la tabla de solicitudes (EP-005).

**Errores que no se arreglan solos** (401, 403 y 400) y el **límite de tasa** (429): HU-166. **La bandeja**: HU-164. **El trabajo atascado o el worker parado**: HU-165.

**Responsable técnico nominal:** el prototipo lo pone en Jonathan (CTO). El buzón exacto es configuración; sigue abierto si es una persona o un buzón de Tecnología.

**Prototipo:** `correo-aviso-interno--fallo-integracion`, `integraciones-fallidas`.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.18 · RF-9.6, RF-9.6.1 · §10.3 (riesgo «solicitud enviada que no llega al CRM») · D52 (sustituida en parte), D76 (sponsor, 2026-10-02) · ADR-0009 (outbox, espera 5-10-20-40-55 ±10 %; enmienda D76: subpasos, valor único) · T-28 · depende de HU-102 · relacionada con HU-098 y HU-101 (EP-005), HU-164, HU-165 y HU-166

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: reintenta la creación de HU-102; no depende de la bandeja (HU-164) para cumplir sus escenarios, que se ven en la base y en el correo |
| N | Negociable | ✓ fija guardar antes, la tabla de esperas con tope de 55 min, el aviso al tercer fallo y el mismo identificador en cada reintento; el texto del aviso se negocia |
| V | Valiosa | ✓ una caída de HubSpot deja de costar oportunidades y el cliente nunca ve el fallo |
| E | Estimable | ✓ M: la cola, el reclamo por fila y el cálculo de espera ya existen; se suman el manejador por subpasos, la lectura por identificador ante el duplicado y el aviso al tercer fallo |
| S | Pequeña | ✓ M: una capacidad (recuperarse de un fallo pasajero sin duplicar) en cinco escenarios, todos del portal |
| T | Testeable | ✓ con reloj simulado y un doble de la API que falla N veces y luego responde, que crea y no contesta, o que rechaza el valor duplicado, se ven esperas, correo, bandeja, un solo negocio y un solo contacto |
