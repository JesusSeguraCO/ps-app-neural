---
id: HU-200
titulo: "Ver en el recorrido cuándo una visita inició y envió su solicitud"
epica: EP-005
prioridad: media
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-167, HU-198]
---

# HU-200 — Ver en el recorrido cuándo una visita inició y envió su solicitud

**Como** directora de Mercadeo que mide el embudo del portal,
**quiero** que el recorrido de cada visita muestre cuándo el invitado empezó la solicitud, hasta qué paso llegó y cuándo la envió,
**para** saber en qué paso se quedan los que arman un equipo y no lo piden.

## Criterios de aceptación

### Happy path — abrir el formulario registra «solicitud iniciada»

**Dado** que un invitado con sesión verificada tiene 2 perfiles en su equipo
**Cuando** abre el formulario de solicitud
**Entonces** el recorrido de su visita en Medición muestra un evento «solicitud iniciada», con la cuenta, el enlace, el contacto y la edición que el servidor tomó de la sesión
**Y** el evento no lleva sus respuestas, su nota, su nombre, su cargo ni su correo

### Edge case — la solicitud enviada se registra aunque el navegador no envíe eventos

**Dado** que un invitado tiene en su navegador un bloqueador que impide enviar eventos
**Cuando** envía su solicitud
**Entonces** el recorrido de su visita muestra «solicitud enviada» con el identificador SOL de la solicitud, registrado por el servidor al guardarla
**Y** no muestra «solicitud iniciada», que depende del navegador

### Edge case — el abandono dice en qué paso de la solicitud se quedó

**Esquema del escenario:** el último paso alcanzado distingue formulario y resumen
**Dado** que un invitado llegó a <paso> y no envió la solicitud
**Cuando** pasan 30 minutos sin actividad
**Entonces** su visita se cierra con un evento «abandono» cuyo último paso es <paso>

**Ejemplos:**

| paso |
|---|
| formulario de solicitud |
| resumen antes de enviar |

### Error — el registro de eventos falla y la solicitud sale igual

**Dado** que el registro de eventos no está disponible
**Cuando** un invitado envía su solicitud
**Entonces** llega a la confirmación con su identificador SOL y la solicitud queda guardada
**Y** los eventos que no se pudieron guardar quedan contados como eventos perdidos en el estado de la captura (HU-167)

## Notas

Cubre la parte de **RF-7.1** que emite la solicitud: los eventos **solicitud iniciada** y **solicitud enviada** del catálogo, y los pasos de la solicitud dentro del **abandono**, contra el contrato de eventos de **HU-167** (ADR-0006).

**Nace el 2026-10-02 en el discovery de EP-005.** HU-167 (EP-008) deja el contrato completo y dice que «las pantallas de épicas aún no construidas (…, solicitud de EP-005) emiten sus eventos en su propio slice contra este contrato». **No es diferir**: esta es la parte de EP-005, que nadie más va a construir.

**«Solicitud enviada» no depende del navegador** (HU-167): la registra el servidor al guardar la solicitud (HU-198), fuera de la transacción del envío, de modo que un fallo de la telemetría nunca bloquea la solicitud (QA-6, error). Los informes de conversión la toman de las solicitudes registradas (HU-171, D70).

**Sin datos personales en los eventos:** del invitado, solo el `contacto_id` que el servidor toma de la sesión (ADR-0006); ni el correo ni el texto de la nota ni las respuestas. Los conteos por respuesta, si Mercadeo los quiere, salen de las solicitudes, no de la telemetría.

**Orden de construcción.** HU-167 (EP-008) está en estado `lista` y define el contrato completo, así que la historia está especificada; si EP-005 se construye antes que EP-008, esta historia se **secuencia detrás de HU-167** (o emite contra el contrato publicado de ADR-0006). Es orden de construcción, no recorte ni pregunta abierta.

## Trazabilidad

Épica madre: **EP-005** · PRD v4.18 · RF-7.1 · ADR-0006 · QA-6 · D70 · discovery 2026-10-02 · depende de HU-167 (EP-008, contrato de eventos) y HU-198 (la solicitud guardada) · relacionada con HU-108 y HU-171 (EP-008, embudo y conversión)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: usa el contrato de HU-167 y la solicitud guardada de HU-198; no depende de ningún informe |
| N | Negociable | ✓ son fijos los dos eventos, que «enviada» la registra el servidor, que no viajan datos personales y que la telemetría nunca frena el envío; los nombres de los pasos se negocian |
| V | Valiosa | ✓ Mercadeo ve dónde se quedan los que arman un equipo y no lo piden, que es el tramo de O2 |
| E | Estimable | ✓ S: dos emisiones contra un contrato ya definido, dos valores de paso en el abandono y la prueba de que la telemetría caída no afecta el envío |
| S | Pequeña | ✓ S: una capacidad (emitir los eventos de la solicitud) en cuatro escenarios |
| T | Testeable | ✓ con el recorrido de HU-167: una visita fijada que abre el formulario, un envío con eventos del navegador bloqueados, dos visitas cerradas por inactividad en el formulario y en el resumen, y el registro de eventos caído durante un envío |
