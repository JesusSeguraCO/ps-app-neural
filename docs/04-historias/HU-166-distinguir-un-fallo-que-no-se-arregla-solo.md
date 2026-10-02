---
id: HU-166
titulo: "Distinguir un fallo de HubSpot que no se arregla solo"
epica: EP-007
prioridad: alta
complejidad: S
estado: draft
fase: integracion-hubspot
prd_version: 4.18
depende_de: [HU-105]
---

# HU-166 — Distinguir un fallo de HubSpot que no se arregla solo

**Como** responsable técnico de la integración con HubSpot,
**quiero** que el portal separe los rechazos de la API que reintentar no arregla de los límites de tasa que solo piden esperar,
**para** corregir la causa en cuanto aparece y no recibir alarmas por algo que HubSpot resuelve solo.

## Criterios de aceptación

### Happy path [portal] — HubSpot rechaza el token

**Dado** que la API de CRM responde 401 (token revocado o rotado) o 403 (al token le falta un scope) a la creación del contacto o del negocio de una solicitud,
**cuando** el worker recibe esa respuesta,
**Entonces** la solicitud entra a la bandeja de fallos desde ese primer rechazo, con el error y la indicación «este error no se arregla solo»
**Y** el responsable técnico recibe el aviso inmediato, que nombra el scope que falta si HubSpot lo indica y nunca muestra el token
**Y** la solicitud no se reintenta sola: queda guardada hasta que alguien la reintente desde la bandeja (HU-164)

### Error [portal] — HubSpot rechaza los datos

**Dado** que una propiedad del contacto o del negocio no existe en HubSpot o no admite uno de los valores, de modo que la API responde 400,
**cuando** el worker recibe esa respuesta,
**Entonces** la solicitud entra a la bandeja desde el primer rechazo, con la propiedad y el error que dio HubSpot
**Y** el responsable técnico recibe el aviso inmediato
**Y** el cliente recibió su confirmación igual y no ve el fallo

### Edge case [portal] — límite de tasa de HubSpot

**Dado** que la API de CRM responde 429,
**cuando** el worker recibe esa respuesta,
**Entonces** el siguiente intento se programa tras la espera que indica HubSpot o, si no la indica, al minuto, y como máximo a los 10 minutos
**Y** ese intento no cuenta como fallo ni produce aviso ni entrada en la bandeja

### Edge case [portal] — muchas solicitudes con la misma causa

**Dado** que 20 solicitudes reciben 401 de la API de CRM en la misma hora,
**cuando** el worker clasifica esos rechazos,
**Entonces** las 20 quedan en la bandeja
**Y** el responsable técnico recibe un solo aviso por esa causa, no 20

## Notas

Cubre la parte de **RF-9.6** que separa los fallos por su clase, con el mecanismo de la **enmienda v4.18 del PRD** corregida por **D76**.

**Revisión 2026-10-02 (D73; segunda ronda D76).** **D76** devuelve la API privada y con ella **`HUBSPOT_PRIVATE_APP_TOKEN`** (scopes mínimos `crm.objects.contacts.read/write`, `crm.objects.deals.read/write`): vuelve a haber una credencial que se puede revocar o rotar (401) o a la que le puede faltar un scope (403). Desaparecen `HUBSPOT_FORM_GUID` y el formulario. **D73 sigue**: **401, 403 y 400 son permanentes**, no se reintentan solos y van a la bandeja con aviso inmediato; **429 se reintenta con espera**. Las clases quedan así: **Transitorio** (5xx, tiempo agotado) → espera creciente (HU-105); **Espera** (429) → tras la espera, sin contar fallo; **Conflicto** (valor duplicado de «Id solicitud People Service», o contacto que ya existe con ese correo) → **no es un fallo**: el worker reutiliza el registro existente (HU-105, HU-104); **Permanente** (400, 401, 403) → bandeja y aviso inmediato.

**404** (un negocio o contacto que ya no existe, p. ej. borrado a mano entre dos subpasos): no lo nombra D73. Propuesta conservadora para confirmar con Tecnología: permanente, porque ninguna espera lo arregla.

**Límite de tasa de las apps privadas:** HubSpot limita por ventana de 10 s y por día según la suscripción; con el volumen esperado (decenas de solicitudes al mes más la lectura diaria de HU-107) no se espera llegar, pero el escenario lo cubre.

**Causas típicas de 400 que conviene ver en la prueba de aceptación:** propiedad que no existe, valor fuera de las opciones de una propiedad de selección, pipeline o etapa con un identificador equivocado.

**Un solo aviso por causa:** supuesto conservador; el texto del correo es negociable.

**Prototipo:** `integraciones-fallidas` (el caso «400 · etapa inexistente» del prototipo vuelve a ser válido con la API: **marcado para revisión de copy**).

## Trazabilidad

Épica madre: **EP-007** · PRD v4.18 · RF-9.6 · D52 (sustituida en parte), D73, D76 (sponsor, 2026-10-02) · ADR-0009 (errores tipificados, 429 acotado a 10 min; enmienda D76) · prototipo `integraciones-fallidas` · depende de HU-105 · relacionada con HU-102, HU-104, HU-160 y HU-164

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: clasifica las respuestas de la creación de HU-105 |
| N | Negociable | ✓ fija que lo permanente va a la bandeja al primer rechazo y no se reintenta solo, que el conflicto no es fallo y que el límite de tasa no alarma; el trato del 404 se confirma con Tecnología |
| V | Valiosa | ✓ un token revocado o un scope que falta se corrige el mismo día y las alarmas significan algo |
| E | Estimable | ✓ S: clasificar respuestas en cuatro clases, programar la espera y agrupar avisos por causa; la cola ya existe |
| S | Pequeña | ✓ S: una capacidad (clasificar el fallo) en cuatro escenarios |
| T | Testeable | ✓ un doble de la API fijado a responder 401, 403, 400 o 429 (con y sin espera indicada), y 20 solicitudes con 401, dan bandeja, avisos y programación observables |
