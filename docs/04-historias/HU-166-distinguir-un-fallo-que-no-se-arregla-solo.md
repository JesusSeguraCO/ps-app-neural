---
id: HU-166
titulo: "Distinguir un fallo de HubSpot que no se arregla solo"
epica: EP-007
prioridad: alta
complejidad: S
estado: draft
fase: integracion-hubspot
prd_version: 4.17
depende_de: [HU-105]
---

# HU-166 — Distinguir un fallo de HubSpot que no se arregla solo

**Como** responsable técnico de la integración con HubSpot,
**quiero** que el portal separe los fallos que reintentar no arregla, como una credencial inválida o una etapa borrada, de los límites de tasa que solo piden esperar,
**para** corregir la causa en cuanto aparece y no recibir alarmas por algo que HubSpot resuelve solo.

## Criterios de aceptación

### Happy path — credencial inválida o sin permisos

**Dado** que la credencial del portal en HubSpot fue revocada o perdió permisos, de modo que HubSpot responde 401 o 403,
**cuando** el worker envía una solicitud a HubSpot,
**Entonces** el responsable técnico recibe un correo inmediato que dice «credencial de HubSpot inválida o sin permisos», sin esperar al tercer fallo
**Y** ninguna solicitud se pierde: todas quedan pendientes y se envían cuando la credencial vuelva a funcionar
**Y** el cliente recibe su confirmación igual

### Error — HubSpot rechaza la solicitud por configuración

**Dado** que en HubSpot se borró la etapa de entrada del pipeline People Service, de modo que HubSpot responde 400 por un dato no válido al crear el negocio,
**cuando** el worker envía una solicitud a HubSpot,
**Entonces** la solicitud entra a la bandeja de fallos desde el primer rechazo, con el error de HubSpot y la indicación «este error no se arregla solo»
**Y** el responsable técnico recibe el aviso inmediato
**Y** la solicitud se sigue reintentando, para que salga sola cuando alguien corrija la configuración

### Edge case — límite de tasa de HubSpot

**Dado** que HubSpot responde 429 porque se superó su límite de peticiones e indica cuánto esperar,
**cuando** el worker envía una solicitud a HubSpot,
**Entonces** el siguiente intento se programa tras esa espera, como máximo 10 minutos
**Y** ese intento no cuenta como fallo ni produce aviso ni entrada en la bandeja

## Notas

Cubre la parte de **RF-9.6** que separa los fallos por su clase. Los errores tipificados vienen de ADR-0009: **Transitorio** (5xx, tiempo agotado, 429) se reintenta con espera creciente (HU-105); **Permanente** (4xx de validación) va a la bandeja con aviso inmediato y se reintenta tras corrección; **Conflicto** (el negocio ya existe) se reutiliza (HU-105). 401 y 403 no los nombra ADR-0009: esta historia los trata como permanentes con aviso inmediato, porque ninguna espera los arregla. **Pregunta abierta** para Tecnología: confirmar esa clasificación al enmendar ADR-0009.

**Credencial:** `HUBSPOT_PRIVATE_APP_TOKEN`, solo en el worker y nunca en el navegador. Fue retirada del worker en EP-001 (ya no se consultaba HubSpot para los enlaces); EP-007 la vuelve a declarar. Si el sponsor confirma formulario más workflow (E-6), la credencial y sus errores cambian.

**Un solo aviso por causa:** si 20 solicitudes chocan con la misma credencial inválida, el responsable recibe un aviso, no 20. Supuesto conservador; el texto del correo es negociable.

**Prototipo:** `integraciones-fallidas` (caso «400 · etapa inexistente», «Este error no se arregla solo. Restaura la etapa en el pipeline de HubSpot y luego reintenta»).

## Trazabilidad

Épica madre: **EP-007** · PRD v4.17 · RF-9.6 · ADR-0009 (errores tipificados, 429 con `Retry-After` acotado a 10 min) · prototipo `integraciones-fallidas` · depende de HU-105 · relacionada con HU-102, HU-106, HU-160 y HU-164

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: clasifica los fallos del reintento de HU-105 |
| N | Negociable | ✓ fija que lo permanente avisa al primer rechazo, que nada se pierde y que el límite de tasa no alarma; la clasificación exacta de cada código se confirma con Tecnología |
| V | Valiosa | ✓ la causa real (credencial, configuración) se corrige el mismo día y las alarmas significan algo |
| E | Estimable | ✓ S: clasificar respuestas en tres clases y programar la espera; la cola ya existe |
| S | Pequeña | ✓ S: una capacidad (clasificar el fallo) en tres escenarios |
| T | Testeable | ✓ un doble de HubSpot fijado de antemano a responder 401, 403, 400 o 429 con espera da, ante un envío del worker, avisos, bandeja y programación observables |
