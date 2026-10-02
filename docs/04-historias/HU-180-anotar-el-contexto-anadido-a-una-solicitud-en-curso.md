---
id: HU-180
titulo: "Anotar en el negocio el contexto añadido a una solicitud en curso"
epica: EP-007
prioridad: alta
complejidad: S
estado: draft
fase: integracion-hubspot
prd_version: 4.17
depende_de: [HU-161]
---

# HU-180 — Anotar en el negocio el contexto añadido a una solicitud en curso

**Como** integrante de Coordinación de Servicio que prepara la sesión de alineación,
**quiero** encontrar en el negocio que ya existe el contexto que el cliente añadió a su solicitud en curso, con su fecha,
**para** llegar a la sesión con lo último que dijo el cliente sin tener que buscar un segundo negocio que no debería existir.

## Criterios de aceptación

### Happy path — el contexto llega al negocio existente

**Dado** que un cliente tiene una solicitud del portal en curso con su negocio en HubSpot y eligió añadir contexto en lugar de enviar otra solicitud,
**cuando** el portal procesa ese contexto añadido,
**Entonces** la línea de tiempo del negocio existente y la del contacto muestran una nota nueva con el texto añadido y su fecha
**Y** no se crea un negocio nuevo
**Y** la nota del resumen inicial de la solicitud no cambia

### Error — falla la nota del contexto añadido

**Dado** que la nota del contexto añadido falló al crearse en HubSpot,
**cuando** el portal reintenta ese contexto,
**Entonces** crea la nota que faltaba en el mismo negocio
**Y** el negocio tiene una sola nota de ese contexto, aunque se reintente varias veces

### Edge case — el negocio de la solicitud aún no existe en HubSpot

**Dado** que el cliente añadió contexto a una solicitud cuyo negocio todavía está pendiente de crearse en HubSpot,
**cuando** el portal procesa el contexto añadido,
**Entonces** el contexto espera y se anota en cuanto el negocio exista, después de la nota del resumen inicial
**Y** no se crea un negocio aparte para el contexto

### Edge case — el cliente añade contexto dos veces

**Dado** que una solicitud en curso ya tiene en su negocio una nota de contexto añadido,
**cuando** el portal procesa un segundo contexto añadido por el cliente,
**Entonces** el negocio muestra dos notas de contexto, cada una con su texto y su fecha
**Y** la primera nota no se reescribe ni se borra

## Notas

Cubre la excepción de **D-7** (RF-9.2): «si ya existe una solicitud del portal con la misma especificación en días recientes, no se duplica: se añade contexto a la existente». Lleva ese contexto a HubSpot como nota del negocio existente (RF-9.4).

**Nace el 2026-10-02 al partir HU-161** (validación INVEST, criterio S). **Partición, no recorte:** las dos se construyen en EP-007. HU-161 conserva el resumen inicial de la solicitud y el reintento de su nota; esta historia lleva el contexto añadido.

**Qué decide esta historia y qué no.** La pantalla que ofrece «añadir contexto en lugar de enviar otra» es de HU-098 (EP-005) y HU-077 (EP-010); ahí se decide si la solicitud nueva coincide con una en curso. Esta historia recibe el contexto ya ligado a una solicitud y lo anota. Sin esas pantallas se prueba con un contexto añadido sembrado.

**Pregunta abierta al sponsor: cuántos días son «recientes»** en D-7. El PRD no lo fija y ADR-0009 lo deja configurable. Opción conservadora que usan los escenarios: la ventana la aplica la pantalla de EP-005 / EP-010, no esta historia, así que ningún escenario depende del número de días.

**Una sola nota por contexto:** cada contexto añadido lleva un marcador propio (solicitud más el contexto) que el portal busca entre las notas del negocio antes de crearla, igual que la nota de HU-161 (ADR-0009, subpaso `nota`).

**Datos personales:** el texto lo escribió el cliente; la nota no añade datos de la lista negra B.4 ni tarifas (D-9).

## Trazabilidad

Épica madre: **EP-007** · PRD v4.17 · RF-9.2 (excepción de D-7), RF-9.4 · D-7, D-9 · B.4 · ADR-0009 (subpaso `nota`) · sale de HU-161 · depende de HU-161 · relacionada con HU-098 (EP-005) y HU-077 (EP-010)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: añade notas al negocio que ya anotó HU-161; se prueba con un contexto sembrado sin las pantallas de EP-005 ni EP-010 |
| N | Negociable | ✓ fija que el contexto va al negocio existente, que nunca crea un negocio y que no se pierde ni se duplica; la plantilla de la nota y la ventana de «recientes» se negocian |
| V | Valiosa | ✓ quien conduce la sesión ve lo último que dijo el cliente en el mismo negocio y el CRM no se llena de negocios repetidos |
| E | Estimable | ✓ S: una nota más con su marcador sobre el mecanismo de HU-161 y una espera mientras el negocio no exista; la ventana de días no afecta a esta historia |
| S | Pequeña | ✓ S: una capacidad (anotar el contexto añadido) en cuatro escenarios |
| T | Testeable | ✓ contextos sembrados sobre un negocio existente, sobre uno pendiente, con fallo de la nota y en dos tandas dan notas observables en un doble de HubSpot |
