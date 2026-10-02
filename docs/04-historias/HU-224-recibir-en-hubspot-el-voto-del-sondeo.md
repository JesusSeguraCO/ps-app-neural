---
id: HU-224
titulo: "Recibir en HubSpot cada respuesta al sondeo, atribuida a la cuenta y al contacto"
epica: EP-002
prioridad: media
complejidad: S
estado: lista
fase: refinamiento-y-descubrimiento
prd_version: 4.18
depende_de: [HU-019, HU-166]
---

# HU-224 — Recibir en HubSpot cada respuesta al sondeo, atribuida a la cuenta y al contacto

**Como** ejecutivo comercial dueño de una cuenta activa en HubSpot,
**quiero** que cada respuesta de un contacto de mi cuenta a la pregunta sobre agentes autónomos quede en su ficha de contacto en HubSpot, con la respuesta, la fecha y el comentario,
**para** tratar un sí de una cuenta con contrato vigente como una señal calificada y responder a quien pidió más detalle.

## Criterios de aceptación

### Happy path — el voto llega al contacto que ya existe

**Dado** que Ana Gómez, invitada verificada de la cuenta Bancolombia y contacto existente en HubSpot con su correo, respondió «Quiero más detalle» con el comentario «para conciliaciones bancarias»,
**cuando** el worker procesa el trabajo de ese voto,
**Entonces** el contacto de ese correo en HubSpot tiene «Sondeo agentes · respuesta» = «Quiere más detalle», «Sondeo agentes · fecha» con la fecha del voto y «Sondeo agentes · comentario» con el texto
**Y** en HubSpot no aparece ningún contacto nuevo ni ningún negocio nuevo

### Happy path — el contacto todavía no existe en HubSpot

**Dado** que un invitado verificado de la cuenta respondió «Me interesa» y su correo no existe como contacto en HubSpot,
**cuando** el worker procesa el trabajo de ese voto,
**Entonces** HubSpot tiene un contacto nuevo con ese correo, su nombre y su apellido, y las tres propiedades del sondeo
**Y** la empresa la asocia HubSpot por el dominio del correo, sin que el portal la cree ni la asocie

### Error — HubSpot no responde o rechaza el voto

**Esquema del escenario:** el voto no se pierde y el cliente no ve el fallo
**Dado** que hay un voto en cola y HubSpot responde <respuesta>,
**cuando** el worker procesa ese trabajo,
**Entonces** <resultado>
**Y** el cliente que votó no ve ningún error: ya vio el agradecimiento

**Ejemplos:**

| respuesta | resultado |
|---|---|
| con un error temporal o límite de tasa | el trabajo se reintenta más tarde y el voto sigue guardado en el portal |
| 401 o 403 | el trabajo queda como fallo permanente en la bandeja de fallos (HU-166), sin reintentos, con el voto guardado en el portal |

### Edge case — un reintento no duplica

**Dado** que el worker ya escribió en HubSpot el voto de un contacto y el mismo trabajo se procesa otra vez,
**cuando** termina el reintento,
**Entonces** el contacto conserva una sola respuesta, una sola fecha y un solo comentario, sin texto repetido

### Edge case — los votos internos y de demostración no viajan

**Dado** que un voto viene de una sesión de un correo `@trycore.com` o de un enlace marcado «demo» (HU-188),
**cuando** el portal lo registra,
**Entonces** el voto queda guardado en el portal marcado como interno o demo
**Y** no se encola ningún trabajo hacia HubSpot

## Notas

Cubre **RF-10.8** («el voto se atribuye a cuenta y contacto y viaja a HubSpot. Un sí de una cuenta con contrato vigente es una señal calificada, no un voto anónimo»). **Nace el 2026-10-02** por la nota 7.8 del discovery de EP-007 (`decisiones-pendientes.md`): RF-10.8 es de EP-002 y no tenía historia.

**Coherente con D76 (híbrido API + workflow), decisiones elegidas por el modelo por delegación del sponsor:**
- **Por API, en el worker** (ADR-0009, trabajo `RegistrarVoto`): el voto se encola al guardarse y el worker hace el **upsert del contacto por correo** con el mismo adaptador que EP-007 usa para las solicitudes (HU-104, D76). Quien se construya primero (EP-002 o EP-007) crea ese adaptador en `packages/infra`; el otro lo reutiliza. El portal **no** consulta HubSpot de forma síncrona.
- **Tres propiedades nuevas del contacto**, las crea Mercadeo en HubSpot (D54, D86): «Sondeo agentes · respuesta» (enumeración: Me interesa · Quiere más detalle · No por ahora), «Sondeo agentes · fecha» (fecha) y «Sondeo agentes · comentario» (texto multilínea). No se reutiliza `message`, que lleva el mensaje libre de la solicitud (D54). No se crea un negocio: un voto no es una oportunidad.
- **La empresa la asocia HubSpot por dominio** (D53, D79), igual que en las solicitudes.
- **El aviso al dueño de la cuenta cuando alguien pide detalle lo hace un workflow de HubSpot** sobre la propiedad «Sondeo agentes · respuesta» = «Quiere más detalle», que configura Mercadeo (mismo reparto que D55 y D76: avisos comerciales en el workflow). Es lo que cumple la promesa de HU-019 («alguien de Trycore te contará más»). Se verifica con la lista de verificación de HubSpot de D84, no con la suite del portal.
- **Scopes sin cambio**: contactos lectura y escritura ya están entre los mínimos de `HUBSPOT_PRIVATE_APP_TOKEN` (D76).
- **401/403 permanentes** (D73, HU-166); los demás fallos se reintentan con la política de la cola (ADR-0009).
- **Sesiones internas y demo no viajan** (D68): un voto de prueba en la ficha de un contacto real contaminaría la señal que el comercial lee.

**Datos personales.** Viajan a HubSpot solo el correo, el nombre y el apellido que el invitado ya declaró, la respuesta, la fecha y el comentario saneado de correos y teléfonos (HU-019). Ningún dato de profesionales del banco.

## Trazabilidad

Épica madre: **EP-002** · PRD v4.18 · RF-10.8 · RF-9 (frontera HubSpot) · D53, D54, D55, D68, D73, D76, D79, D84, D86 · ADR-0009 (`RegistrarVoto`, cola y reintentos) · nota 7.8 de `decisiones-pendientes.md` (discovery EP-007) · depende de HU-019 (el voto) y HU-166 (EP-007, fallos permanentes) · comparte con HU-104 (EP-007) el upsert del contacto por correo · relacionada con HU-188 (demo) y HU-225

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: el voto guardado de HU-019 (misma épica) y la clasificación de fallos permanentes de HU-166 (EP-007, `lista`); el upsert del contacto lo crea quien llegue primero, así que no espera a EP-007 |
| N | Negociable | ✓ fijos: atribución a contacto y cuenta, sin negocio, idempotencia, sin votos internos, avisos por workflow; nombres de propiedades y valores son negociables con Mercadeo |
| V | Valiosa | ✓ el comercial ve en la ficha del contacto una señal calificada y puede responder a quien pidió detalle |
| E | Estimable | ✓ S: un trabajo del worker con un upsert por correo y tres propiedades; la configuración en HubSpot es de Mercadeo |
| S | Pequeña | ✓ S: cinco escenarios de un solo trabajo |
| T | Testeable | ✓ suite del portal contra un doble del adaptador de HubSpot (contacto existente, inexistente, error temporal, 401, reintento) y la lista de verificación D84 en el sandbox con datos ficticios |
