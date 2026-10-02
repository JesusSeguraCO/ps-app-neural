---
id: HU-102
titulo: "Recibir la oportunidad en mi pipeline"
epica: EP-007
prioridad: alta
complejidad: M
estado: draft
fase: integracion-hubspot
prd_version: 4.18
depende_de: []
---

# HU-102 — Recibir la oportunidad en mi pipeline

**Como** ejecutivo comercial dueño de una cuenta,
**quiero** que cada solicitud enviada desde el portal llegue a HubSpot como un negocio del pipeline «Comercial (People y Tecnología)»,
**para** trabajarla donde trabajo todo lo demás y no en una bandeja aparte del portal.

## Criterios de aceptación

> **Cómo se verifica.** Los escenarios **[portal]** los implementa el worker del portal y se prueban con su suite (doble de la API de CRM de HubSpot). Los **[HubSpot]** **no los implementa el portal**: son configuración del workflow de HubSpot (Mercadeo/RevOps) y se verifican con una **prueba de aceptación en HubSpot** (sandbox o portal real con datos ficticios) sobre un negocio creado por el worker.

### Happy path [portal] — el worker crea el contacto y el negocio

**Dado** que un cliente envió una solicitud, el portal la guardó con su identificador SOL-AAAA-NNNN y el worker tiene configurado `HUBSPOT_PRIVATE_APP_TOKEN`,
**cuando** el worker procesa el trabajo de esa solicitud,
**Entonces** el contacto queda creado o actualizado por su correo verificado, con el nombre, el apellido y el cargo que el portal conoce y el mensaje libre en `message`
**Y** existe un negocio en el pipeline «Comercial (People y Tecnología)», en su etapa de entrada, con `soluciones_ofrecidas` = «People Service» y `dealtype` = «Existing Business», asociado a ese contacto, con «Id solicitud People Service» = SOL-AAAA-NNNN y el requerimiento en «Solicitudes People Service» (HU-160)
**Y** la solicitud queda en el portal como «registrada en HubSpot», con la hora y el enlace al negocio

### Edge case [HubSpot] — la cuenta ya tiene un negocio abierto

**Dado** que la empresa del contacto tiene un negocio abierto en HubSpot,
**cuando** el workflow procesa el negocio nuevo que creó el worker,
**Entonces** el negocio nuevo queda asociado como relacionado al abierto
**Y** el negocio abierto no cambia ninguna de sus propiedades

### Edge case [HubSpot] — la cuenta solo tiene negocios cerrados

**Dado** que la empresa del contacto solo tiene negocios cerrados, ganados o perdidos,
**cuando** el workflow procesa el negocio nuevo que creó el worker,
**Entonces** el negocio nuevo no se asocia como relacionado a ninguno de los cerrados

### Error [portal] — falta el token de HubSpot

**Dado** que falta `HUBSPOT_PRIVATE_APP_TOKEN` en la configuración del worker,
**cuando** el worker intenta procesar una solicitud,
**Entonces** no hace ninguna llamada a HubSpot
**Y** el responsable técnico recibe un correo que nombra la variable que falta, nunca su valor
**Y** la solicitud sigue pendiente y se procesa en cuanto la variable quede configurada

### Error [portal] — la propiedad de valor único no existe en HubSpot

**Dado** que en HubSpot no existe la propiedad «Id solicitud People Service» del negocio,
**cuando** HubSpot responde 400 a la creación del negocio por esa propiedad,
**Entonces** no crea el negocio sin el identificador
**Y** la solicitud queda en la bandeja de fallos con el nombre de la propiedad que falta (HU-166)

## Notas

Cubre **RF-9.1** y la parte de **D-7** de **RF-9.2** (negocio nuevo relacionado, nunca actualizar el abierto, porque eso borraría la atribución de origen), con el mecanismo de la **enmienda v4.18 del PRD** y la **enmienda 2026-10-02 (D76) de ADR-0009**.

**Revisión 2026-10-02, segunda ronda (D76, corrige D52).** El sponsor cambió el mecanismo a **híbrido API + workflow**. El worker **crea o actualiza el contacto (upsert por `email`) y crea el negocio por la API privada de CRM** con `HUBSPOT_PRIVATE_APP_TOKEN` (vuelve; scopes mínimos `crm.objects.contacts.read`, `crm.objects.contacts.write`, `crm.objects.deals.read`, `crm.objects.deals.write`). La propiedad **«Id solicitud People Service»**, de **valor único** en el negocio, hace que HubSpot rechace un segundo negocio con el mismo identificador: es la idempotencia real (HU-105). El **workflow de HubSpot** se queda con lo que es de la cuenta: asociar la empresa por dominio y crearla si no existe (D53, D79, HU-104), el negocio relacionado de D-7 (estos dos escenarios), el propietario y los avisos comerciales (D55, HU-103) y el escalamiento (HU-162, HU-163). Desaparecen el formulario, `HUBSPOT_FORM_GUID` y «enviada a HubSpot = envío aceptado»: ahora el portal **sabe que el negocio existe** y guarda su enlace, que usa el aviso a Coordinación de Servicio (D78, HU-101).

**Campos (D54 sigue, D76).** Del contacto, los que el portal ya conoce: `email` (el verificado al entrar, D-4), `firstname`, `lastname`, `jobtitle` (HU-097) y `message` (mensaje libre). `company` no se escribe: la empresa la resuelve HubSpot por dominio. Del negocio: «Id solicitud People Service» y «Solicitudes People Service» (las **2 propiedades nuevas** de D76), pipeline, etapa y nombre del negocio. Origen y campaña: HU-106. **Mercadeo crea** las dos propiedades, el pipeline y el workflow; el pipeline y la etapa de entrada se configuran en el worker como identificadores no secretos (propuesta).

**Unicidad de la propiedad.** Comprobar en el arranque que «Id solicitud People Service» es de valor único exige leer el esquema del negocio (`crm.schemas.deals.read`), que no está entre los scopes mínimos de D76. Propuesta: no pedirlo y comprobar la unicidad en la prueba de aceptación de cada entorno; si no existe, HubSpot responde 400 y lo cubre el último escenario. **Por confirmar con Tecnología.**

**Por verificar en el HubSpot real (prueba de capacidades D84, solo lectura, antes del DoR):** que el workflow, disparado por la creación del negocio en el pipeline «Comercial (People y Tecnología)», pueda asociarlo como relacionado a otro negocio de la empresa una vez que la empresa quedó asociada por dominio. Si la suscripción no lo permite, se escala al sponsor: **no se recorta**.

**Etapa de entrada y pronóstico (D-21).** Crear el pipeline, sus etapas y la exclusión del pronóstico es configuración de HubSpot (§10.1).

**«Abierto»** = negocio de la empresa que no está en una etapa cerrada; si cuentan los de otros pipelines lo decide Mercadeo al configurar el workflow, y los escenarios valen para las dos respuestas.

**Disparador.** La solicitud guardada por el portal (EP-005, RF-5, con su clave única por envío, HU-098; también la solicitud a medida de HU-077, EP-010). Sin EP-005 se prueba con una solicitud sembrada.

**D85 (sponsor, 2026-10-02): pipeline existente.** En HubSpot no hay un pipeline «People Service» (lectura del conector, `hubspot-capacidades.md`). El negocio entra al pipeline existente **«Comercial (People y Tecnología)»**, marcado con la opción ya existente `soluciones_ofrecidas` = «People Service» para filtrarlo, y `dealtype` = «Existing Business» (al portal solo entran clientes invitados, D79). La **etapa de entrada** la confirma Comercial; propuesta: «35% Gestión con cliente / Solicitud de información». El portal la toma de configuración (`HUBSPOT_PIPELINE_ID`, `HUBSPOT_ETAPA_ENTRADA_ID`), no del código.

**Revisión de validación 2026-10-02.** El error de la propiedad que falta tenía dos acciones en el Cuando (el intento del worker y la respuesta); queda una sola: «HubSpot responde 400 a la creación».

## Trazabilidad

Épica madre: **EP-007** · PRD v4.18 · RF-9.1, RF-9.2 (D-7) · D-6, D-7, D-21 · D52 (sustituida en parte), D53, D54, D76, D79, D84 (sponsor, 2026-10-02) · ADR-0009 (enmienda 2026-10-02 D76: `crear_negocio` con subpasos `contacto` → `negocio` → `nota`, `HUBSPOT_PRIVATE_APP_TOKEN`) · relacionada con HU-098 y HU-101 (EP-005), HU-104, HU-105, HU-106, HU-160 y HU-166 · prototipo: sin pantalla (comportamiento de CRM)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: necesita una solicitud guardada (EP-005); el lado del portal se prueba con una solicitud sembrada y un doble de la API de CRM, y el lado de HubSpot con un negocio ficticio creado por el worker |
| N | Negociable | ✓ fija el pipeline, la etapa de entrada, el identificador único y la regla de D-7; nombres de propiedades y qué cuenta como «abierto» los fija Mercadeo |
| V | Valiosa | ✓ el comercial recibe la oportunidad en su herramienta, con la atribución intacta aunque la cuenta ya tenga un negocio |
| E | Estimable | ✓ en el portal (M: upsert de contacto y creación de negocio por API, con el diseño original de ADR-0009 ya analizado); ✗ en el lado de HubSpot hasta la prueba de capacidades D84 (negocio relacionado desde el workflow) |
| S | Pequeña | ✓ M: una capacidad (que la solicitud sea negocio) en cinco escenarios, tres del portal y dos de configuración |
| T | Testeable | ✓ suite del portal con doble de la API (creación, falta de token, 400 por propiedad); en HubSpot, negocios ficticios para una cuenta con uno abierto y otra solo con cerrados dan asociaciones observables |
