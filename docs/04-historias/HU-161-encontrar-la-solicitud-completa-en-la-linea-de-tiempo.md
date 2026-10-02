---
id: HU-161
titulo: "Encontrar la solicitud completa en la línea de tiempo del contacto"
epica: EP-007
prioridad: alta
complejidad: S
estado: draft
fase: integracion-hubspot
prd_version: 4.18
depende_de: [HU-160]
---

# HU-161 — Encontrar la solicitud completa en la línea de tiempo del contacto

**Como** integrante de Coordinación de Servicio que prepara la sesión de alineación,
**quiero** encontrar en la línea de tiempo del contacto y en el negocio la especificación completa de la solicitud y si el cliente la revisó,
**para** llegar a la sesión sabiendo qué problema tiene el cliente y no solo qué perfiles marcó.

## Criterios de aceptación

### Happy path [portal] — la especificación revisada queda en una nota

**Dado** que un cliente envió una solicitud con reto declarado, especificación revisada, perfiles seleccionados y un mensaje libre,
**cuando** el worker termina de crear el negocio,
**Entonces** existe una nota asociada al negocio y al contacto con el reto, el rol, el seniority, las tecnologías obligatorias y deseables, el sector, la modalidad, la ubicación, los perfiles con su código y el mensaje libre
**Y** la nota dice «Especificación revisada por el cliente: sí»
**Y** la especificación también va en el párrafo de «Solicitudes People Service» (HU-160)

### Edge case [portal] — el cliente no abrió el Perfil Objetivo

**Dado** que el cliente envió la solicitud sin abrir el Perfil Objetivo,
**cuando** el worker crea la nota,
**Entonces** la nota lleva la especificación inferida y dice «Especificación revisada por el cliente: no (inferida)»
**Y** el negocio se crea sin esperar a que el cliente la revise

### Edge case [portal] — la respuesta de la nota se perdió

**Dado** que HubSpot creó la nota de una solicitud y su respuesta no llegó al worker,
**cuando** el worker reintenta ese paso,
**Entonces** encuentra entre las notas del negocio la que lleva el marcador de esa solicitud y no crea otra
**Y** el negocio y el contacto muestran una sola nota de la solicitud

### Happy path [HubSpot] — se ve en la línea de tiempo y en el negocio

**Dado** que el worker creó el negocio y la nota de una solicitud,
**cuando** Coordinación de Servicio abre el negocio,
**Entonces** el negocio muestra la nota en su actividad, con la especificación completa, su fecha y la marca de revisada o inferida
**Y** la misma nota aparece en la línea de tiempo del contacto asociado al negocio

## Notas

Cubre **RF-9.4**, **RF-17.1** y **RF-17.5** en su lado de HubSpot, con el mecanismo de la **enmienda v4.18 del PRD** corregida por **D76**.

**Revisión 2026-10-02, segunda ronda (D76, corrige D52).** Ya no hay envío de formulario que deje rastro en la línea de tiempo: el resumen vuelve a ser **una nota creada por la API**, el subpaso `nota` de `crear_negocio` (ADR-0009, enmienda D76), asociada al negocio y al contacto, con el marcador `[ps:<SOL>:nota]` para que un reintento no la duplique. Desaparece el duplicado en la línea de tiempo que aceptaba la versión del formulario. La marca revisada o inferida va **dentro del texto** de la nota y del párrafo: D76 limita a 2 las propiedades nuevas, así que no vuelve `ps_especificacion_revisada`.

**Por verificar en el HubSpot real (prueba de capacidades D84):** que crear notas y leer las notas asociadas a un negocio funcione con los scopes mínimos de D76 (contactos y negocios, lectura y escritura). **Si exige un scope más, lo aprueba el sponsor**; no se recorta ni se cambia el mecanismo sin decisión.

**El correo a Coordinación de Servicio** con la misma especificación y el enlace al negocio lo envía el portal (D78, HU-101).

**Datos personales:** nombre y primer apellido y código de los perfiles, nunca datos de la lista negra B.4 ni tarifas (D-9). Es lo mismo que el cliente ya vio en el portal.

**Partición del 2026-10-02:** el contexto añadido a una solicitud en curso (excepción de D-7) es HU-180.

**Revisión de validación 2026-10-02.** El happy [HubSpot] tenía dos acciones (abrir el contacto y el negocio); queda una (abrir el negocio) y la línea de tiempo del contacto pasa al Entonces como resultado observable de la misma nota.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.18 · RF-9.4, RF-17.1, RF-17.5 · D-9 · B.4 · T-28 · D52 (sustituida en parte), D54, D76, D78, D84 (sponsor, 2026-10-02) · ADR-0009 (enmienda D76: vuelve el subpaso `nota`) · depende de HU-160 · relacionada con HU-101 (EP-005), HU-105 y HU-180

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: añade la nota al negocio de HU-160; no necesita el contexto añadido (HU-180) |
| N | Negociable | ✓ fija el contenido de RF-17.1, la marca revisada o inferida y que la nota no se duplica; la redacción se negocia |
| V | Valiosa | ✓ quien prepara la sesión llega con el problema del cliente, y una especificación inferida se reconoce como tal |
| E | Estimable | ✓ S en el portal (una plantilla y un subpaso con marcador, como en el diseño original de ADR-0009); con riesgo declarado hasta D84 por los scopes de notas |
| S | Pequeña | ✓ S: una capacidad (dejar la especificación legible en HubSpot) en cuatro escenarios |
| T | Testeable | ✓ el doble de la API muestra la nota revisada e inferida y el reintento que no la duplica; en HubSpot, un negocio ficticio muestra la nota en el contacto y en el negocio |
