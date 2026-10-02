---
id: HU-165
titulo: "Saber que el reintento o el escalamiento dejaron de correr"
epica: EP-007
prioridad: alta
complejidad: S
estado: draft
fase: integracion-hubspot
prd_version: 4.17
depende_de: [HU-105, HU-162]
---

# HU-165 — Saber que el reintento o el escalamiento dejaron de correr

**Como** responsable técnico de la integración con HubSpot,
**quiero** recibir un correo cuando la tarea de reintento o la de escalamiento lleve más del doble de su intervalo sin correr,
**para** enterarme de que la cola está parada antes de que una solicitud se quede solo en el portal sin que nadie lo sepa.

## Criterios de aceptación

### Happy path — una tarea se detiene

**Dado** que la tarea de escalamiento, que corre cada 15 minutos, no ha corrido según la tabla,
**cuando** el portal vigila sus tareas,
**Entonces** el responsable técnico recibe o no un correo que nombra la tarea y la hora de su última ejecución, según la tabla
**Y** el aviso no se repite en cada vigilancia mientras siga detenida

| Minutos sin correr la tarea de escalamiento | Correo al responsable técnico |
|---|---|
| 30 | no |
| 31 | sí |

### Edge case — la bandeja lo dice

**Dado** que el proceso que reintenta las solicitudes lleva más del doble de su intervalo sin correr,
**cuando** abro «Fallos con HubSpot» en el panel,
**Entonces** veo la franja «El reintento no corre desde las HH:MM» y que ninguna solicitud se reenvía mientras siga así
**Y** el próximo intento de cada solicitud aparece «en espera, cuando el proceso vuelva», no con una hora que no se va a cumplir

### Error — el correo tampoco puede salir

**Dado** que el proceso de trabajo diferido completo está caído y con él la salida de correo,
**cuando** el monitor externo deja de recibir la señal periódica del proceso,
**Entonces** el monitor avisa al responsable técnico por su propio canal
**Y** el aviso llega aunque el portal no pueda enviar ningún correo

## Notas

Cubre **RF-9.6.2**: «una cola que nadie procesa es otra forma de que la solicitud se quede solo en el portal». Aplica a la tarea de reintento (HU-105) y a la de escalamiento (HU-162, HU-163); la sincronización de la fecha de alineación (HU-107) entra en la misma vigilancia.

**Mecanismo (ADR-0009):** cada tarea registra su última ejecución; la tarea `vigilar` compara contra el doble del intervalo y avisa por correo en línea, no por la cola que podría estar parada; un monitor externo espera la señal periódica (`LATIDO_URL`) y avisa si falta.

**Diferimiento ya acordado que hay que respetar (E-14, sponsor, 2026-10-02, Release Gate R0):** `vigilar` y el latido se construyen «en la release que vaya a producción, antes de su DoR», y ningún entorno con datos reales se despliega sin ellos. **Pregunta al sponsor:** ¿esta historia se construye dentro de EP-007 o con el bloque de operación de la release de producción? No se recorta: solo cambia dónde se construye. Sin ella EP-007 no puede ir a producción. **Opción conservadora que usan los escenarios:** la capacidad entera (vigilancia, franja de la bandeja y monitor externo), se construya donde se construya; los escenarios no cambian con la respuesta.

**Proveedor del monitor externo:** sin decidir (ADR-0009). Pregunta abierta. **Opción conservadora que usan los escenarios:** cualquier monitor que espere una señal periódica y avise por un canal propio, fuera de la infraestructura del portal; se prueba con un doble.

**Prototipo:** `integraciones-fallidas--proceso-detenido`.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.17 · RF-9.6.2 · §8.3 (Vigilancia) · ADR-0009 (`vigilar`, `tareas_ejecucion`, latido) · E-14 · depende de HU-105 y HU-162 · relacionada con HU-164

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: vigila las tareas de HU-105 y HU-162; el planificador y el registro de ejecuciones ya existen |
| N | Negociable | ✓ fija el umbral del doble del intervalo, un solo aviso y el monitor externo; el proveedor y el texto se negocian |
| V | Valiosa | ✓ una caída del proceso deja de ser silenciosa y nadie descubre días después que nada llegó a HubSpot |
| E | Estimable | ✗ hasta que el sponsor cierre E-14 (dónde se construye) y se elija el proveedor del monitor externo: la vigilancia y la franja son S; el monitor externo no se estima sin proveedor |
| S | Pequeña | ✓ S: una capacidad (detectar la cola parada) en tres escenarios |
| T | Testeable | ✓ con reloj simulado y ejecuciones registradas a 30 y 31 minutos, un doble de Mailgun y un doble del monitor se observan el correo, la franja de la bandeja y el aviso externo |
