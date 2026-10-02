---
id: HU-105
titulo: "Recuperar una solicitud cuya integración falló"
epica: EP-007
prioridad: alta
complejidad: M
estado: draft
fase: integracion-hubspot
prd_version: 4.17
depende_de: [HU-102]
---

# HU-105 — Recuperar una solicitud cuya integración falló

**Como** responsable técnico de la integración con HubSpot,
**quiero** que una solicitud que HubSpot no acepta quede guardada, se reintente sola y me avise cuando ya no parece un fallo pasajero,
**para** que ninguna oportunidad se pierda por una caída que el cliente nunca va a ver.

## Criterios de aceptación

### Happy path — HubSpot no responde y el reintento lo resuelve

**Dado** que HubSpot no responde o responde con un error de servidor,
**cuando** el cliente envía la solicitud,
**Entonces** el cliente recibe su confirmación igual, sin mención al fallo
**Y** la solicitud queda guardada como pendiente y se reintenta con espera creciente según la tabla
**Y** cuando HubSpot vuelve, el siguiente intento crea el negocio y la solicitud pasa a «enviada a HubSpot»

| Intento fallido | Espera antes del siguiente (±10 %) |
|---|---|
| 1 | 5 min |
| 2 | 10 min |
| 3 | 20 min |
| 4 | 40 min |
| 5 y siguientes | 55 min |

### Error — tercer fallo seguido

**Dado** que una solicitud acumula dos intentos fallidos,
**cuando** falla el tercero,
**Entonces** el responsable técnico recibe un correo con la solicitud, los intentos y el error de cada uno
**Y** la solicitud aparece en la bandeja de fallos del panel
**Y** el reintento sigue con la misma tabla, sin límite de intentos

### Edge case — HubSpot creó el negocio pero la respuesta se perdió

**Dado** que HubSpot creó el negocio de una solicitud y su respuesta no llegó al portal,
**cuando** el portal reintenta esa solicitud,
**Entonces** no se crea un segundo negocio
**Y** el portal enlaza la solicitud con el negocio que ya existía y sigue con los pasos que faltaban

## Notas

Cubre **RF-9.6** y **RF-9.6.1**: guardar antes de enviar, cola en la base de datos, espera creciente hasta un tope de 55 minutos, aviso al tercer fallo sin dejar de reintentar. Ninguna solicitud puede quedar solo en el portal.

**Ya existe en el código** (EP-001 y EP-006): la cola `operacion.trabajos` con reclamo por fila, el tipo `crear_negocio` en la lista blanca del portal y el adaptador de correo. Falta el manejador de `crear_negocio`, el adaptador de HubSpot (retirado en EP-001 al dejar de consultarse para enlaces) y la tabla de solicitudes (EP-005).

**Respuesta perdida:** la propiedad del identificador de solicitud es de valor único en HubSpot (HU-102), así que el duplicado choca y el portal lee el existente; cada paso (negocio, asociaciones, nota) se marca hecho y un reintento salta los hechos (ADR-0009).

**Errores que no se arreglan solos** (credencial inválida, permisos, configuración) y los **límites de tasa** de HubSpot tienen su propia historia: HU-166. **La bandeja de fallos** en el panel (verla, reintentar ahora, enlazar un negocio creado a mano): HU-164. **El reintento detenido** (el proceso no corre): HU-165.

**Responsable técnico nominal:** el prototipo lo pone en Jonathan (CTO). El buzón exacto es configuración; pregunta abierta si es una persona o un buzón de Tecnología.

**Prototipo:** `correo-aviso-interno--fallo-integracion`, `integraciones-fallidas`.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.17 · RF-9.6, RF-9.6.1 · §10.3 (riesgo «solicitud enviada que no llega al CRM») · ADR-0009 (outbox, backoff 5-10-20-40-55 ±10 %, subpasos, `ps_solicitud_id`) · T-28 · depende de HU-102 · relacionada con HU-098 (EP-005), HU-164, HU-165 y HU-166

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: reintenta el paso de HU-102; no depende de la bandeja (HU-164) para cumplir sus escenarios, que se observan en la base y en el correo |
| N | Negociable | ✓ fija guardar antes, la tabla de esperas con tope de 55 min, el aviso al tercer fallo y cero duplicados; el texto del aviso se negocia |
| V | Valiosa | ✓ una caída de HubSpot deja de costar oportunidades y el cliente nunca ve el fallo |
| E | Estimable | ✓ M: la cola, el reclamo por fila y el cálculo de espera ya existen; se suman el manejador y el aviso al tercer fallo |
| S | Pequeña | ✓ M: una capacidad (recuperarse de un fallo pasajero) en tres escenarios |
| T | Testeable | ✓ con reloj simulado y un doble de HubSpot que falla N veces, que responde 503 o que crea y no confirma, se observan esperas, correo, bandeja y un solo negocio |
