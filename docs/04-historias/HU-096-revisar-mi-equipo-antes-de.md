---
id: HU-096
titulo: "Revisar mi equipo antes de pedirlo"
epica: EP-005
prioridad: alta
complejidad: M
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-203, HU-197, HU-097]
---

# HU-096 — Revisar mi equipo antes de pedirlo

**Como** líder de proyecto que armó su equipo y diligenció la solicitud,
**quiero** ver en una sola pantalla todo lo que voy a enviar —cada perfil de mi equipo, mis respuestas y mis datos— y poder corregirlo antes de enviar,
**para** saber exactamente qué estoy pidiendo antes de pedirlo.

## Criterios de aceptación

### Happy path — el resumen muestra todo lo que viajará

**Dado** que entré por el enlace de la cuenta «Banco Andino» con mi correo verificado luis.gomez@cliente.com
**Y** que mi equipo guardado tiene 3 perfiles publicados: PS-0142 Ana Gómez, Backend, banda «1 semana»; PS-0187 Luis Pérez, QA de automatización, «Inmediato»; y PS-0203 Marta Ruiz, Arquitectura de software, «1 mes»
**Y** que en el formulario elegí «Proyecto nuevo o nueva célula de desarrollo», «Corto plazo (dentro del mes actual)» y «6 a 12 meses», el sector «Banca», la nota «Migración del core en dos fases», y puse mi nombre «Luis Gómez» y mi cargo «Arquitecto de soluciones»
**Cuando** toco «Revisar antes de enviar»
**Entonces** veo «El equipo (3)» con los tres perfiles, cada uno con su capacidad, su nombre y primer apellido, su código y su banda, y el resumen del equipo de «Mi equipo»: «Roles cubiertos: 3» y «Arranque del equipo completo: 1 mes»
**Y** veo las tres respuestas, el sector y la nota tal como las dejé, sin reescribirlas
**Y** veo quién envía —Luis Gómez, Arquitecto de soluciones, luis.gomez@cliente.com— y la cuenta Banco Andino
**Y** veo los botones «Enviar solicitud de equipo» y «Corregir»

### Alterno — corregir antes de enviar

**Dado** que estoy en el resumen de una solicitud con PS-0142, PS-0187 y PS-0203, las respuestas «Proyecto nuevo o nueva célula de desarrollo», «Corto plazo (dentro del mes actual)» y «6 a 12 meses», el sector «Banca», la nota «Migración del core en dos fases», el nombre «Luis Gómez» y el cargo «Arquitecto de soluciones»
**Cuando** toco «Corregir»
**Entonces** vuelvo al formulario con las tres respuestas, el sector, la nota, el nombre y el cargo como los dejé
**Y** no existe ninguna solicitud guardada ni ningún trabajo en cola por haber visto el resumen

### Edge case — un perfil de mi equipo dejó de estar publicado

**Esquema del escenario:** un perfil no publicado no viaja y se dice solo con su código y su estado
**Dado** que mi equipo guardado tiene PS-0142, PS-0187 y PS-0203 y Talento Humano dejó PS-0187 <estado> después de que lo sumé
**Cuando** toco «Revisar antes de enviar»
**Entonces** el resumen muestra «El equipo (2)» con PS-0142 y PS-0203
**Y** un aviso dice «PS-0187 · <etiqueta> — no viajará con la solicitud», sin su nombre ni el motivo
**Y** puedo enviar con los dos perfiles o volver a «Mi equipo»

**Ejemplos:**

| estado | etiqueta |
|---|---|
| pausado | Pausado |
| archivado | Archivado |
| en borrador (consentimiento revocado) | No disponible |

### Edge case — un equipo grande con un colocado se muestra entero

**Dado** que mi equipo guardado tiene 12 perfiles publicados y uno de ellos, PS-0231, está colocado en otro proyecto con liberación el 15 de noviembre de 2026
**Cuando** toco «Revisar antes de enviar»
**Entonces** el resumen dice «El equipo (12)» y muestra los 12 perfiles en el orden de mi equipo, sin recortarlos ni resumirlos como «y 9 más»
**Y** PS-0231 aparece con la etiqueta «Colocado en otro proyecto» y la banda de su fecha de liberación, como uno de los 12 que viajan

### Error — el equipo no se puede leer

**Dado** que diligencié el formulario y el servidor no puede leer mi equipo en este momento
**Cuando** toco «Revisar antes de enviar»
**Entonces** el portal me dice que no pudo cargar mi equipo y me ofrece intentarlo de nuevo
**Y** no muestra un resumen parcial ni el botón «Enviar solicitud de equipo»
**Y** el formulario conserva todo lo que diligencié

## Notas

Cubre **RF-5.3** (resumen de confirmación antes de enviar, con el equipo completo a la vista) y, del lado de la lectura, **RF-4.1.3** (el equipo viaja completo, sin recorte ni reconstrucción desde el navegador). Que lo enviado sea **exactamente** lo que se revisó, aunque el equipo cambie entre el resumen y el envío, es de **HU-198**. El caso del equipo vacío es de **HU-100**.

**Refinamiento 2026-10-02 (discovery de EP-005).** La versión anterior describía la vista **«Mi equipo»** (RF-4.3, EP-004). **D111 (sponsor, 2026-10-02):** esta historia queda como **resumen antes de enviar** (RF-5.3) y **reutiliza el bloque de equipo de la vista de HU-203** (perfiles, roles cubiertos y arranque del conjunto con la banda del más tardío, D110); no lo construye dos veces. Por eso depende de HU-203 y no solo de HU-192. No es recorte: RF-4.3 sigue entero en EP-004.

**D118 (sponsor, 2026-10-02) cierra la pregunta del perfil no publicado.** Un perfil **no publicado** al enviar —pausado, archivado o en borrador— **no viaja** y aparece **solo por su código y su estado** (Ley 1581): sin nombre ni motivo, también el pausado (corrige el borrador, que lo nombraba). El **colocado sí viaja**: sigue publicado (contrato 0021) y lleva la banda de su liberación. La etiqueta «No disponible» del borrador (consentimiento revocado) no revela la causa. *Texto de la etiqueta elegido por el modelo por delegación del sponsor, marcado para revisión de copy (D73).*

**Dos conteos distintos, a propósito.** «El equipo (N)» de este resumen cuenta **solo lo que viaja** (publicados, colocados incluidos; D118). «Perfiles: N» de la vista «Mi equipo» (HU-203) cuenta **todo el equipo guardado**, no disponibles incluidos (D114). Con un pausado en el equipo, «Mi equipo» dice 3 y el resumen «El equipo (2)»: no es un error y no se igualan.

**Qué se muestra de cada perfil:** capacidad, nombre y primer apellido, código y banda (RF-3.1, RF-3.13); sin tarifas (D-9) ni datos de la lista negra B.4. La banda se calcula con la misma función del portal (`packages/dominio/src/catalogo/banda.ts`), no se recalcula aparte.

**Contexto del enlace.** La cuenta se toma de la sesión (el enlace), no del formulario (HU-197).

**Prototipo:** «Resumen antes de enviar» (`Portal de Perfiles v2.dc.html`): título «Revisa antes de enviar», «Esto es lo que vamos a recibir», «El equipo (N)», «Contexto», «Enviar solicitud de equipo», «Corregir».

## Trazabilidad

Épica madre: **EP-005** · PRD v4.18 · RF-5.3 · RF-4.1.3 · RF-3.1 · RF-3.13 · D-9 · B.4 · D110 · D111 · D118 (sponsor, 2026-10-02) · depende de HU-203 (EP-004, bloque de equipo y equipo guardado), HU-197 (formulario) y HU-097 (identificación) · relacionada con HU-098 (envío y confirmación), HU-100 (equipo vacío), HU-198 (lo enviado es lo revisado) y HU-206 (EP-004, estado en «Mi equipo»)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: reutiliza el bloque de HU-203 (EP-004) y lee lo diligenciado en HU-197 y HU-097; se prueba con un equipo y un formulario sembrados |
| N | Negociable | ✓ son fijos que se ve el equipo entero sin recorte, que se ve lo que el cliente escribió sin reescribirlo, que un no publicado no viaja y se dice solo con código y estado (D118) y que un fallo no muestra un resumen parcial; el diseño y el orden de los bloques se negocian |
| V | Valiosa | ✓ el cliente sabe exactamente qué pide antes de pedirlo y puede corregirlo |
| E | Estimable | ✓ M: una pantalla de lectura que junta el bloque de equipo existente con lo diligenciado, con el aviso del no publicado y el error de lectura |
| S | Pequeña | ✓ M: una capacidad (revisar antes de enviar) en cinco escenarios |
| T | Testeable | ✓ e2e con un equipo sembrado de 3 y de 12 perfiles (uno colocado), un perfil pasado a pausado, archivado y borrador, «Corregir» que vuelve con todo, y una lectura del equipo forzada a fallar |
