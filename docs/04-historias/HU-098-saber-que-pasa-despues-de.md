---
id: HU-098
titulo: "Saber qué pasa después de enviar"
epica: EP-005
prioridad: alta
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-096, HU-198]
---

# HU-098 — Saber qué pasa después de enviar

**Como** líder de proyecto que acaba de enviar la solicitud,
**quiero** entender cuál es el paso siguiente y en cuánto tiempo,
**para** no quedarme esperando sin saber si alguien la recibió.

## Criterios de aceptación

### Happy path — la confirmación dice qué sigue y cuándo

**Dado** que el jueves 1 de octubre de 2026 estoy en el resumen de una solicitud con 3 perfiles de mi equipo
**Cuando** toco «Enviar solicitud de equipo»
**Entonces** llego a la confirmación con el identificador de mi solicitud (SOL-AAAA-NNNN) y veo que el paso siguiente es una sesión de alineación con Delivery
**Y** veo el plazo «10 días hábiles desde el 1 de octubre de 2026»
**Y** veo un resumen de lo que envié: los 3 perfiles con su código y mis tres respuestas

### Error — HubSpot no responde al procesar mi solicitud

**Dado** que estoy en el resumen de una solicitud y HubSpot no responde en este momento
**Cuando** toco «Enviar solicitud de equipo»
**Entonces** llego a la misma confirmación, con su identificador SOL, sin ninguna mención al fallo
**Y** la solicitud queda guardada en el portal como pendiente de llegar a HubSpot; su reintento y el aviso al responsable técnico son de HU-105

### Edge case — ya hay una solicitud en curso con la misma especificación

**Dado** que hace 3 días mi colega ana.perez@cliente.com envió desde la misma cuenta SOL-2026-0042 con PS-0187 y PS-0142, y mi equipo tiene PS-0142 y PS-0187
**Cuando** toco «Enviar solicitud de equipo»
**Entonces** no se guarda ninguna solicitud nueva ni se encola ningún trabajo
**Y** el portal me muestra que mi cuenta tiene SOL-2026-0042 en curso, enviada hace 3 días
**Y** me ofrece solo «Añadir contexto a esa solicitud» (HU-201) o «Volver sin enviar», sin opción de enviarla como nueva

### Edge case — el envío se repite antes de la confirmación

**Esquema del escenario:** un envío repetido no crea una segunda solicitud
**Dado** que estoy en el resumen y toqué «Enviar solicitud de equipo»
**Cuando** <repeticion> antes de llegar a la confirmación
**Entonces** el botón queda bloqueado desde el primer toque y muestra que se está enviando
**Y** el portal guarda una sola solicitud con un solo identificador SOL y encola un solo trabajo hacia HubSpot
**Y** llego a la misma confirmación, sin aviso de error

**Ejemplos:**

| repeticion |
|---|
| vuelvo a tocar «Enviar solicitud de equipo» |
| el navegador reenvía el formulario |


## Notas

Cubre RF-5.4, RF-5.5 y RF-9.6. La confirmación nunca se comunica como reserva ni contratación: es la resolución de §2.4.

**Revisión 2026-10-02 (D76, sponsor).** El doble envío **se corta en origen**: el botón se bloquea al primer toque y cada formulario lleva una **clave única por envío**, que la tabla de solicitudes guarda con restricción de unicidad. Un segundo POST con la misma clave devuelve la solicitud ya guardada (misma confirmación), sin insertar otra ni encolar otro trabajo; el trabajo hacia HubSpot conserva su `clave_idempotencia` única (ADR-0009). Es la primera de las dos defensas de D76; la segunda es el «Id solicitud People Service» de valor único en HubSpot (HU-102, HU-105). Esto es distinto del «segunda solicitud parecida» de días después, que es la excepción de D-7 con ventana de 7 días (HU-180).

**Error de CRM (escenario 2).** Con D76 la «creación del negocio» vuelve a ser literal: el worker crea contacto y negocio por la API; el reintento y la alerta son HU-105.

**Validación 2026-10-02 (validador independiente).** (1) El error decía «se alerta internamente», que el cliente no puede observar: ahora el «Entonces» dice lo que ve (la misma confirmación con su SOL, sin mención al fallo) y lo que queda en el portal (la solicitud pendiente), y **remite a HU-105** el reintento y el aviso al responsable técnico. (2) «Similar hace días» pasa a **«misma especificación hace ≤ 7 días»**, la regla de D-7 que fijó D73 (opción conservadora: 7 días) y que usa HU-180; qué pasa pasada la ventana es de HU-180. (3) El doble clic pasa a **esquema de dos filas** (segundo toque / reenvío del navegador), con una sola acción por fila en el «Cuando». De paso, el happy path deja el envío en el «Cuando» (antes estaba en el «Dado»).

**D119 y D120 (sponsor, 2026-10-02).** «Misma especificación» (D-7) es **misma cuenta + mismo conjunto de códigos de perfil**, en cualquier orden y la haya enviado cualquier invitado de la cuenta (D119). Dentro de los 7 días **no se puede enviar una nueva**: solo añadir contexto (HU-201) o volver (D120). El edge se reescribe con esos valores; la comparación se hace en el servidor contra las solicitudes guardadas, no en el navegador.

**D123 (sponsor, 2026-10-02): sin acuse por correo al cliente en v1.** La confirmación en pantalla es el único acuse; no se añade alcance.

**Dueña del mecanismo de doble envío (validación INVEST, 2026-10-02).** La tabla de solicitudes con `clave_envio` única la construye **HU-198**, dueña del guardado; esta historia fija y prueba lo que el cliente observa (botón bloqueado, una sola confirmación) sobre ese mecanismo, sin especificarlo de nuevo. Dependencias declaradas: HU-096 (el resumen desde el que se envía) y HU-198 (el guardado y el SOL).

**Valores comprobables (validación independiente, 2026-10-02).** El happy path deja el estado en el «Dado» (resumen con 3 perfiles, fecha fija) y el envío como única acción, con el plazo y el resumen observables.

## Trazabilidad

Épica madre: **EP-005** · PRD v4.18 · RF-5.4, RF-5.5, RF-9.6 · D-7 · D73 (ventana de 7 días) · D76 · D119 · D120 · D123 (sponsor, 2026-10-02) · validación 2026-10-02 · ADR-0009 (enmienda D76: clave única por envío) · relacionada con HU-201 (añadir contexto), HU-102, HU-105 y HU-180 (EP-007)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas (HU-096, HU-198): la confirmación vive en EP-005; el reintento y su aviso son de HU-105 y añadir contexto en HubSpot es de HU-180 (EP-007), que esta historia no construye |
| N | Negociable | ✓ son fijos el paso siguiente con su plazo, la confirmación sin mención a fallos, la ventana de 7 días con la definición de D119, que dentro de ella no se envía otra (D120) y una sola solicitud por envío; el diseño de la confirmación y el texto de la oferta de añadir contexto se pueden negociar |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta: sabe qué sigue, no duplica su pedido y no ve un fallo que no le toca resolver |
| E | Estimable | ✓ S: una confirmación con resumen y plazo, la detección de una solicitud en curso con la misma especificación en 7 días y el bloqueo del doble envío con clave única (D76) |
| S | Pequeña | ✓ S: cuatro escenarios sobre la confirmación y el envío |
| T | Testeable | ✓ e2e de la confirmación con HubSpot simulado caído, una solicitud sembrada hace 3 días por otro invitado de la cuenta con los mismos perfiles en otro orden (sin fila nueva), y dos POST seguidos con la misma clave (una fila, un trabajo) más un doble toque en el navegador |
