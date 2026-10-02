---
id: HU-201
titulo: "Añadir contexto a mi solicitud en curso en lugar de duplicarla"
epica: EP-005
prioridad: media
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-098]
---

# HU-201 — Añadir contexto a mi solicitud en curso en lugar de duplicarla

**Como** líder de proyecto que vuelve a pedir el mismo equipo pocos días después de haberlo pedido,
**quiero** escribir lo que cambió o lo que me faltó decir y sumarlo a la solicitud que ya envié,
**para** que Trycore tenga lo último de mi proyecto en una sola conversación y no en dos solicitudes que alguien tenga que juntar.

## Criterios de aceptación

### Happy path — el contexto se suma a la solicitud que ya existe

**Dado** que el 29 sep 2026 se envió desde mi cuenta SOL-2026-0042 con los mismos perfiles de mi equipo, el portal me ofreció añadir contexto a esa solicitud (HU-098) y escribí «Necesitamos además inglés avanzado»
**Cuando** toco «Añadir a mi solicitud»
**Entonces** veo «Añadimos tu contexto a SOL-2026-0042, enviada el 29 sep 2026» y el plazo «10 días hábiles desde el 29 sep 2026», que no se reinicia
**Y** no se guarda ninguna solicitud nueva ni se crea otro identificador SOL
**Y** queda un solo trabajo en cola para llevar ese contexto a HubSpot (HU-180)

### Error — el contexto está vacío

**Dado** que el portal me ofreció añadir contexto a SOL-2026-0042 y dejé el campo vacío o solo con espacios
**Cuando** toco «Añadir a mi solicitud»
**Entonces** el campo queda señalado con «Escribe lo que quieres añadir»
**Y** no se guarda ningún contexto ni se encola ningún trabajo

### Alterno — vuelvo sin añadir nada

**Dado** que el portal me ofreció añadir contexto a SOL-2026-0042
**Cuando** toco «Volver sin enviar»
**Entonces** vuelvo al resumen con todo lo que diligencié
**Y** no se guarda ninguna solicitud ni ningún contexto

### Edge case — el toque repetido no duplica el contexto

**Esquema del escenario:** un envío repetido del contexto no crea un segundo contexto
**Dado** que escribí el contexto y toqué «Añadir a mi solicitud»
**Cuando** <repeticion> antes de ver el mensaje
**Entonces** el botón queda bloqueado desde el primer toque
**Y** SOL-2026-0042 tiene un solo contexto añadido y hay un solo trabajo en cola para llevarlo

**Ejemplos:**

| repeticion |
|---|
| vuelvo a tocar «Añadir a mi solicitud» |
| el navegador reenvía el formulario |

## Notas

Cubre el **lado del portal** de la excepción de **D-7** (RF-9.2): «si ya existe una solicitud del portal con la misma especificación en días recientes, no se duplica: se añade contexto a la existente». **HU-098** detecta la solicitud en curso y **ofrece** añadir contexto (ventana de **7 días**, D73); **HU-180** (EP-007) lleva el contexto a HubSpot como nota. Faltaba quién **captura** el contexto y lo guarda: esta historia.

**Nace el 2026-10-02 en el discovery de EP-005.** HU-180 dice que «la pantalla que ofrece añadir contexto es de HU-098 (EP-005) y HU-077 (EP-010)», pero HU-098 solo ofrece; escribir el contexto, guardarlo y encolarlo no estaba en ninguna historia.

**Doble envío (D76, mismo criterio que HU-098).** Botón bloqueado al primer toque y **clave única por envío** en la tabla de contextos; un segundo POST con la misma clave devuelve el contexto ya guardado, sin otro trabajo. El trabajo hacia HubSpot conserva su `clave_idempotencia` y el marcador `[ps:<SOL>:contexto:<n>]` de HU-180.

**D120 (sponsor, 2026-10-02): dentro de los 7 días no se envía una solicitud nueva.** El portal solo ofrece **añadir contexto** o **volver sin enviar** (alterno). Si el cliente dice que es otro proyecto con el mismo equipo, lo escribe como contexto; Coordinación de Servicio lo separa en la conversación si hace falta.

**D119 (sponsor, 2026-10-02): «misma especificación» = misma cuenta + mismo conjunto de códigos de perfil**, en cualquier orden, sea cual sea el invitado de la cuenta que envió la primera (HU-098, HU-180). Si la primera la envió un colega, el contexto queda a nombre de quien lo escribe. *Esto último, elegido por el modelo por delegación del sponsor.*

**El plazo no se reinicia:** los 10 días hábiles siguen contando desde la solicitud original; añadir contexto no crea una solicitud y O3 se mide desde su envío (HU-107).

**Límite del texto (propuesta):** 2.000 caracteres, como la nota de HU-197.

**Datos personales:** el texto lo escribe el cliente; no se añaden datos de la lista negra B.4 ni tarifas (D-9).

## Trazabilidad

Épica madre: **EP-005** · PRD v4.18 · RF-9.2 (D-7) · D73 (7 días) · D76 (clave única por envío) · D119 · D120 (sponsor, 2026-10-02) · discovery 2026-10-02 · depende de HU-098 (la oferta) · relacionada con HU-180 (EP-007, la nota en HubSpot), HU-077 (EP-010) y HU-107 (O3)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: parte de la oferta de HU-098; no espera a EP-007, porque el trabajo encolado queda pendiente hasta que HU-180 lo procese |
| N | Negociable | ✓ son fijos que no se crea una solicitud nueva, que un contexto vacío no se guarda y que un toque repetido no lo duplica; también la definición de «misma especificación» (D119) y que no hay solicitud nueva dentro de los 7 días (D120); el texto de los botones y el límite se negocian |
| V | Valiosa | ✓ el cliente actualiza su pedido en un paso y Coordinación de Servicio llega a una sola conversación con lo último |
| E | Estimable | ✓ S: un campo con su validación, una tabla de contextos con clave única y un trabajo en cola; la detección de la solicitud en curso es de HU-098 |
| S | Pequeña | ✓ S: una capacidad (añadir contexto) en cuatro escenarios |
| T | Testeable | ✓ e2e con una solicitud sembrada hace 3 días: mensaje con SOL y fecha sin solicitud nueva, campo vacío señalado, «Volver sin enviar» sin escritura, y dos POST con la misma clave que dejan un contexto y un trabajo |
