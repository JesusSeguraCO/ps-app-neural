---
id: HU-097
titulo: "Identificarme cuando no soy quien recibió el correo"
epica: EP-005
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-097 — Identificarme cuando no soy quien recibió el correo

**Como** arquitecto invitado al enlace que va a enviar la solicitud,
**quiero** poner mis datos en lugar de los del contacto original,
**para** que Trycore me busque a mí y no al contacto principal del envío.

## Criterios de aceptación

### Happy path — la solicitud sale a mi nombre

**Dado** que entré con mi correo invitado luis.gomez@cliente.com por un enlace cuyo contacto principal es Ana Pérez
**Y** que en el formulario de solicitud puse mi nombre «Luis Gómez» y mi cargo «Arquitecto de soluciones»
**Cuando** envío la solicitud
**Entonces** la confirmación dice que Trycore contactará a Luis Gómez, Arquitecto de soluciones, en luis.gomez@cliente.com
**Y** la solicitud queda registrada a mi nombre, en la misma cuenta del enlace, y no a nombre de Ana Pérez

### Error — el correo del formulario no es el que verifiqué

**Dado** que entré con el correo verificado luis.gomez@cliente.com y en el campo de correo del formulario escribí luis.personal@correo.com
**Cuando** envío la solicitud
**Entonces** la solicitud se registra con luis.gomez@cliente.com
**Y** el portal me explica que el correo de la solicitud es el de mi invitación, con el que verifiqué el código, y no se puede cambiar

### Edge case — el formulario no trae los datos del contacto principal

**Dado** que entré con mi correo invitado por un enlace cuyo contacto principal es Ana Pérez, Gerente de TI
**Cuando** abro el formulario de solicitud
**Entonces** el formulario muestra mi correo verificado y no trae el nombre ni el cargo de Ana Pérez
**Y** ni el formulario ni la confirmación presentan a Ana Pérez como la persona a la que Trycore buscará

## Notas

Cubre RF-5.2 y RF-5.6, y del lado del portal RF-9.2 (los datos de quien solicita que llegan al CRM). Con acceso nominal (D-4 revisada el 2026-09-25) el correo de quien solicita siempre es uno invitado y verificado.

**Validación 2026-10-02 (validador independiente).** (1) El happy path tenía un «Cuando diligencio mis datos» sin acción de cierre: ahora el «Dado» deja los datos puestos y el «Cuando» es enviar, con resultado visible en la confirmación. (2) El error tenía una acción en el «Dado»; ahora el «Dado» es estado (correo verificado y correo escrito) y el «Cuando» es enviar. (3) El edge «contacto desconocido en empresa conocida» era invisible para el cliente y repetía **HU-104** (EP-007, upsert del contacto y asociación de empresa por dominio, D76 y D79): se retira de aquí y lo cubre HU-104. **No es recorte**: el comportamiento sigue especificado en EP-007. En su lugar entra un edge que el portal muestra: el formulario no hereda los datos del contacto principal del enlace.

**Revisión 2026-10-02 (D76, D79).** El contacto lo crea o actualiza el worker por la API con upsert por el correo verificado, con el nombre, el apellido y el cargo de esta historia; la empresa la asocia HubSpot por el dominio, y la crea si no existe (D79). Detalle en HU-104 (EP-007).

## Trazabilidad

Épica madre: **EP-005** · PRD v4.0 · RF-5.2 · RF-5.6 · RF-9.2 · D76, D79 (sponsor, 2026-10-02) · validación 2026-10-02 · relacionada con HU-102 y HU-104 (EP-007, dueña del contacto nuevo en empresa conocida) y HU-098 (confirmación)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ se apoya en el acceso nominal ya construido (EP-001: correo verificado por invitado) y en el formulario de solicitud de EP-005; lo que pasa en HubSpot es de HU-104 |
| N | Negociable | ✓ son fijos que la solicitud use el correo verificado y los datos de quien la envía, nunca los del contacto principal; la forma del formulario y el texto de la explicación se pueden negociar |
| V | Valiosa | ✓ Trycore llama a quien de verdad pidió el equipo, no a quien recibió el correo |
| E | Estimable | ✓ S: dos campos propios (nombre, cargo), el correo tomado de la sesión y no del formulario, y un formulario sin datos heredados del contacto principal |
| S | Pequeña | ✓ S: tres escenarios sobre un formulario |
| T | Testeable | ✓ e2e con un invitado que no es el contacto principal: confirmación con su nombre, cargo y correo verificado, correo escrito distinto ignorado con su explicación, y formulario sin los datos del contacto principal |
