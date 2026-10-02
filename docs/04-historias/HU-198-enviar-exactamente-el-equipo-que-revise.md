---
id: HU-198
titulo: "Enviar exactamente el equipo que revisé"
epica: EP-005
prioridad: alta
complejidad: M
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-096]
---

# HU-198 — Enviar exactamente el equipo que revisé

**Como** líder de proyecto que acaba de revisar el resumen de su solicitud,
**quiero** que la solicitud lleve exactamente los perfiles que vi en el resumen, tomados de mi equipo guardado,
**para** que Trycore prepare la conversación con el equipo que de verdad elegí y no con uno incompleto, desactualizado o alterado.

## Criterios de aceptación

### Happy path — la solicitud guarda el equipo del servidor

**Dado** que el resumen muestra PS-0142, PS-0187 y PS-0203, que son los perfiles de mi equipo guardado, con mis respuestas y mis datos
**Cuando** toco «Enviar solicitud de equipo»
**Entonces** el portal guarda una sola solicitud con un identificador SOL-AAAA-NNNN, los códigos PS-0142, PS-0187 y PS-0203 en el orden de mi equipo, mis respuestas, mi nombre, mi cargo y la cuenta, el enlace y el correo de mi sesión
**Y** encola un solo trabajo para crear el negocio en HubSpot con esa solicitud (HU-102)
**Y** llego a la confirmación con ese identificador (HU-098)

### Edge case — el equipo cambió después de revisarlo

**Esquema del escenario:** no se envía un equipo distinto del revisado sin decirlo
**Dado** que el resumen me mostró PS-0142, PS-0187 y PS-0203 y después <cambio>
**Cuando** toco «Enviar solicitud de equipo»
**Entonces** no se guarda ninguna solicitud ni se encola ningún trabajo
**Y** veo el resumen actualizado con el aviso «Tu equipo cambió desde que lo revisaste» y lo que cambió
**Y** puedo enviar el equipo actualizado desde ese mismo resumen

**Ejemplos:**

| cambio |
|---|
| quité PS-0187 de mi equipo en otra pestaña |
| sumé PS-0219 a mi equipo en otra pestaña |
| Talento Humano pausó PS-0187 |

### Edge case — una petición alterada trae otros perfiles

**Dado** que mi equipo guardado tiene PS-0142 y PS-0187
**Cuando** envío por una dirección directa una solicitud que trae los perfiles PS-0142, PS-0187 y PS-0999
**Entonces** la solicitud que se guarda lleva solo PS-0142 y PS-0187, los de mi equipo guardado
**Y** PS-0999 no aparece en la solicitud, en el trabajo en cola ni en la confirmación

### Error — la sesión o el enlace dejaron de valer al enviar

**Esquema del escenario:** sin sesión válida no hay envío, y se explica
**Dado** que estoy en el resumen y <situacion>
**Cuando** toco «Enviar solicitud de equipo»
**Entonces** no se guarda ninguna solicitud ni se encola ningún trabajo
**Y** el portal me lleva a `/acceso?motivo=<motivo>`, que explica por qué tengo que volver a entrar

**Ejemplos:**

| situacion | motivo |
|---|---|
| mi sesión expiró | sesion_expirada |
| Comercial revocó el enlace | enlace_revocado |
| el enlace venció | enlace_vencido |

### Error — la solicitud no se puede guardar

**Dado** que estoy en el resumen y la base de datos no puede guardar la solicitud en este momento
**Cuando** toco «Enviar solicitud de equipo»
**Entonces** el portal me dice «No pudimos enviar tu solicitud. Inténtalo de nuevo.» y sigo en el resumen con todo lo que diligencié
**Y** no veo una confirmación ni un identificador SOL
**Y** no queda ningún trabajo en cola

## Notas

Cubre **RF-4.1.3** (el equipo viaja completo a la solicitud, sin recorte ni reconstrucción desde el navegador) y la parte de envío de **RF-5.3**, y es el **disparador** de EP-007: la solicitud guardada y su trabajo `crear_negocio` (RF-9.6.1: se guarda primero en la base de datos y después se envía; ADR-0009).

**Nace el 2026-10-02 en el discovery de EP-005.** Ninguna historia decía qué se guarda al enviar ni de dónde salen los perfiles: HU-098 cubre la confirmación y el doble envío, HU-097 la identificación, HU-096 el resumen. Esta es la historia anticipada «enviar la solicitud» de `docs/03-backlog/epicas.md`.

**Cómo se sabe que el equipo cambió (propuesta, negociable).** El resumen lleva una **huella** del equipo que mostró (códigos, orden y estado de publicación); el servidor la compara con el equipo guardado al recibir el envío. El navegador no manda la lista de perfiles que viaja: la toma el servidor (edge de petición alterada, mismo criterio que el correo de la sesión en HU-097, D90).

**Qué se guarda (propuesta de modelo, ADR-0009).** `operacion.solicitudes` con `clave_envio` única (D76, HU-098), identificador SOL-AAAA-NNNN, cuenta, enlace, invitado, nombre, cargo, las tres respuestas, sector, nota, especificación y su marca revisada o inferida (la pone EP-009; sin Perfil Objetivo viaja vacía y marcada «sin especificación»), y los códigos de perfil en su orden. Solo nombre y primer apellido, código y banda de cada perfil; sin tarifas (D-9) ni datos de la lista negra B.4. `encolar_portal` ya admite `crear_negocio` (migración 0001).

**Sin EP-007 construida**, el trabajo `crear_negocio` queda pendiente en la cola (el worker solo reclama los tipos que sabe ejecutar) y la solicitud no se pierde; HU-102 lo procesa cuando exista.

**401 → `/acceso?motivo=…`** (convención aprendida de EP-006): con los motivos que ya existen en `packages/dominio/src/acceso/sesion.ts`. Lo diligenciado vive en el navegador (HU-197) y sigue ahí al volver a entrar en el mismo dispositivo.

**D118 (sponsor, 2026-10-02): qué perfiles viajan.** Viajan los perfiles **publicados** del equipo guardado, **incluidos los colocados** (siguen publicados, contrato 0021). Un perfil **no publicado** (pausado, archivado o en borrador) **no viaja**: no entra en la solicitud, ni en el trabajo en cola, ni en HubSpot ni en el correo a Coordinación (Ley 1581); el resumen lo muestra solo por código y estado (HU-096). Si pasa a no publicado entre el resumen y el envío, aplica el edge «el equipo cambió».

**D122 (sponsor, 2026-10-02): «Mi equipo» se conserva igual tras enviar.** El envío no vacía, no marca ni bloquea el equipo guardado (HU-199 lo prueba desde el cliente).

## Trazabilidad

Épica madre: **EP-005** · PRD v4.18 · RF-4.1.3 · RF-5.3 · RF-9.6.1 · D-9 · B.4 · D76 · D118 · D122 · D90 (mismo criterio) · ADR-0009 · discovery 2026-10-02 · depende de HU-096 (el resumen) · relacionada con HU-097, HU-098, HU-100, HU-192 (EP-004) y HU-102 (EP-007, que procesa el trabajo)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: parte del resumen de HU-096; no espera a EP-007, porque el trabajo encolado queda pendiente hasta que exista su manejador |
| N | Negociable | ✓ son fijos que los perfiles salen del equipo guardado y solo viajan los publicados, colocados incluidos (D118), que un cambio no se envía en silencio, que sin sesión válida no hay envío y que un fallo no se presenta como éxito; el mecanismo de la huella y el texto de los avisos se negocian |
| V | Valiosa | ✓ Trycore recibe el equipo que el cliente eligió, ni más ni menos, y el cliente nunca ve una confirmación de algo que no se guardó |
| E | Estimable | ✓ M: la tabla de solicitudes con su migración, la ruta de envío con la comparación de la huella, el encolado del trabajo y los tres errores tipificados |
| S | Pequeña | ✓ M: una capacidad (enviar lo revisado) en cinco escenarios |
| T | Testeable | ✓ prueba de la ruta con base de datos real: una fila y un trabajo con los códigos del servidor; cambios simulados en otra pestaña y por Talento Humano sin fila; una petición con PS-0999 que no lo guarda; sesiones expiradas, enlaces revocados y vencidos que redirigen con su motivo; una escritura forzada a fallar sin confirmación ni trabajo |
