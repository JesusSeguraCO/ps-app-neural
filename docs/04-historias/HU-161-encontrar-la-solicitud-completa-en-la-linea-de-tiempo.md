---
id: HU-161
titulo: "Encontrar la solicitud completa en la línea de tiempo del contacto"
epica: EP-007
prioridad: alta
complejidad: M
estado: draft
fase: integracion-hubspot
prd_version: 4.17
depende_de: [HU-102, HU-104]
---

# HU-161 — Encontrar la solicitud completa en la línea de tiempo del contacto

**Como** integrante de Coordinación de Servicio que prepara la sesión de alineación,
**quiero** encontrar en la línea de tiempo del contacto y del negocio el resumen completo de la solicitud, con la especificación y si el cliente la revisó,
**para** llegar a la sesión sabiendo qué problema tiene el cliente y no solo qué perfiles marcó.

## Criterios de aceptación

### Happy path — el resumen queda en la línea de tiempo

**Dado** que un cliente envió una solicitud con reto declarado, especificación revisada y perfiles seleccionados,
**cuando** el portal termina de crear el negocio,
**Entonces** la línea de tiempo del contacto y la del negocio muestran una nota con el reto, rol, seniority, tecnologías obligatorias y deseables, sector, modalidad, ubicación, los perfiles con su código y las respuestas del formulario
**Y** la nota dice «Especificación revisada por el cliente: sí»

### Edge case — el cliente no abrió el Perfil Objetivo

**Dado** que el cliente envió la solicitud sin abrir el Perfil Objetivo,
**cuando** el portal termina de crear el negocio,
**Entonces** la nota lleva la especificación inferida marcada «Especificación revisada por el cliente: no (inferida)»
**Y** el negocio lleva la misma marca en su propiedad de especificación revisada
**Y** el negocio se crea igual, sin esperar a que el cliente la revise

### Error — falla la nota después de crear el negocio

**Dado** que el negocio y sus asociaciones ya se crearon y la nota falló,
**cuando** el portal reintenta la solicitud,
**Entonces** crea solo la nota que faltaba
**Y** el negocio tiene una sola nota de esa solicitud, aunque se reintente varias veces

### Edge case — el cliente añade contexto a una solicitud en curso

**Dado** que el cliente tiene una solicitud del portal en curso con la misma especificación y elige añadir contexto en lugar de enviar otra,
**cuando** el portal procesa el contexto añadido,
**Entonces** el negocio existente recibe una nota nueva con ese contexto y su fecha
**Y** no se crea un negocio nuevo

## Notas

Cubre **RF-9.4**, **RF-17.1** y **RF-17.5** en su lado de HubSpot. El correo a Coordinación de Servicio con la misma especificación es HU-101 (EP-005, decisión T-28 del 2026-09-27); la nota en HubSpot sigue siendo la fuente para quien abre el negocio.

**Una sola nota por solicitud:** la nota lleva un marcador con el identificador de la solicitud y el portal la busca entre las notas del negocio antes de crearla (ADR-0009, subpaso `nota`).

**Contexto añadido:** es la excepción de **D-7** (si ya hay una solicitud del portal con la misma especificación en días recientes, no se duplica: se añade contexto). La pantalla que lo ofrece es de HU-098 (EP-005) y HU-077 (EP-010); esta historia lleva el contexto al negocio. **Cuántos días son «recientes»** no lo fija el PRD: pregunta abierta (ADR-0009 lo deja configurable).

**Datos personales:** la nota lleva nombre y primer apellido y código de los perfiles, nunca datos de la lista negra B.4 ni tarifas (D-9). Es la misma información que el cliente ya vio en el portal.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.17 · RF-9.4, RF-17.1, RF-17.5 · D-7 (excepción de HU-077) · D-9 · B.4 · T-28 · ADR-0009 (subpaso `nota`, `ps_especificacion_revisada`) · depende de HU-102 y HU-104 · relacionada con HU-101, HU-098 (EP-005) y HU-077 (EP-010)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: anota el negocio de HU-102 en el contacto de HU-104; el contexto añadido se prueba con una solicitud sembrada aunque la pantalla de EP-005 no exista |
| N | Negociable | ✓ fija el contenido de RF-17.1, la marca revisada o inferida, una sola nota y que el contexto no crea negocio; la plantilla de la nota se negocia |
| V | Valiosa | ✓ quien prepara la sesión llega con el problema del cliente, y una especificación inferida se reconoce como tal |
| E | Estimable | ✓ M: una plantilla, un marcador y una nota adicional; el algoritmo está en ADR-0009 |
| S | Pequeña | ✓ M: una capacidad (dejar la solicitud legible en HubSpot) en cuatro escenarios |
| T | Testeable | ✓ solicitudes revisada, inferida, con fallo de la nota y con contexto añadido dan notas y propiedades observables en un doble de HubSpot |
