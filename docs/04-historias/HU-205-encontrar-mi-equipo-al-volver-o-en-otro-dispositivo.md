---
id: HU-205
titulo: "Encontrar mi equipo como lo dejé al volver, desde otro dispositivo o al renovar el enlace"
epica: EP-004
prioridad: alta
complejidad: M
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-192, HU-203, HU-206, HU-092]
---

# HU-205 — Encontrar mi equipo como lo dejé al volver, desde otro dispositivo o al renovar el enlace

**Como** líder de proyecto invitado que empieza a armar su equipo en un dispositivo y lo retoma otro día o en otro,
**quiero** encontrar mi equipo tal como lo dejé mientras mi enlace siga vigente, y poder traerlo si renuevo un enlace vencido,
**para** no rehacer la selección cada vez que cambio de computador, vuelvo días después o mi enlace vence.

## Criterios de aceptación

### Happy path — mismo equipo en otro dispositivo

**Dado** que en mi portátil armé un equipo de 3 perfiles, sumados en el orden A, B y C, por el enlace vigente de mi correo
**Y** que tengo ese mismo enlace abierto en mi teléfono, donde nunca había entrado, con el código de verificación en mi buzón
**Cuando** verifico mi correo con ese código
**Entonces** el indicador «Mi equipo» dice 3
**Y** la vista «Mi equipo» muestra A, B y C en ese orden

### Alterno — un cambio en un dispositivo se ve en el otro

**Dado** que tengo sesión abierta en el portátil y en el teléfono por el mismo enlace, con el mismo equipo de 3 perfiles
**Y** que en el teléfono quité el perfil B
**Cuando** recargo la vista «Mi equipo» en el portátil
**Entonces** veo 2 perfiles, A y C, y el indicador dice 2

### Edge case — el equipo es de cada invitado y de cada enlace

**Esquema del escenario:** otra entrada no hereda mi equipo
**Dado** que tengo un equipo de 3 perfiles en el enlace de septiembre, todavía vigente, y cerré mi sesión en este navegador
**Cuando** <entrada>
**Entonces** el indicador «Mi equipo» de esa sesión dice 0
**Y** <consecuencia>

**Ejemplos:**

| entrada | consecuencia |
|---|---|
| entro con mi correo y mi código por otro enlace que Comercial envió a la misma cuenta | al volver a entrar por el enlace de septiembre encuentro mis 3 perfiles |
| un colega invitado entra en este mismo navegador, por el enlace de septiembre, con su correo y su código | mi colega no ve ninguno de mis 3 perfiles en su equipo |

### Edge case — al renovar un enlace vencido puedo copiar mi equipo anterior

**Dado** que mi enlace venció con un equipo de 3 perfiles A, B y C, que B se pausó después
**Y** que entré por el enlace renovado que pedí y el portal me ofrece «Copiar mi equipo anterior (3)» o «Empezar de cero»
**Cuando** toco «Copiar mi equipo anterior (3)»
**Entonces** el indicador «Mi equipo» dice 3 y la vista muestra A y C con su banda y B con la etiqueta «Pausado» (HU-206)
**Y** el equipo del enlace vencido sigue guardado sin cambios

### Error — el enlace venció

**Dado** que tengo un equipo de 3 perfiles en un enlace que ya venció
**Cuando** abro ese enlace
**Entonces** el portal no muestra mi equipo ni su conteo y me ofrece pedir un enlace nuevo
**Y** mi equipo sigue guardado en el servidor ligado a ese enlace, sin borrarse

## Notas

Cubre **RF-4.1.2** (se recupera en otro dispositivo con el correo y el código) y **RF-4.5** (sobrevive al cierre del navegador y al cambio de dispositivo **dentro de la vigencia del enlace**; un enlace nuevo para la misma cuenta abre un equipo nuevo), con la **enmienda v4.18 de RF-4.5 (D113)**. Paga el último criterio de recuperación que `epicas.md` y la nota de HU-094 dejan a EP-004.

**D113 (sponsor, 2026-10-02) cierra P5: renovar un enlace vencido ofrece copiar el equipo anterior.** Al entrar por primera vez por un enlace **renovado** (el que resulta de pedir enlace nuevo tras vencer, HU-092/HU-146), si el invitado tenía un equipo con perfiles en el enlace vencido, el portal ofrece copiarlo. Los perfiles que ya no están disponibles se copian **con su estado real** (HU-206), nunca se omiten en silencio ni se presentan como disponibles. Copiar no mueve: el equipo del enlace vencido se conserva. Un enlace **nuevo** que Comercial envía por su cuenta (no una renovación) sigue abriendo un equipo vacío, como dice RF-4.5. Se enmienda RF-4.5 en el PRD.

**Decisiones menores elegidas por el modelo por delegación del sponsor:** la oferta aparece una sola vez, en el primer ingreso por el enlace renovado, y solo si el equipo anterior tenía perfiles; «Empezar de cero» la descarta sin copiar; se copia el equipo del mismo invitado, nunca el de un colega; un perfil archivado o sin consentimiento se copia como en HU-206 (familia, referencia y etiqueta, sin nombre).

**Qué ya existe.** El equipo vive en el servidor por invitado y enlace desde EP-001 (`identidad.equipos`, único por `invitado_id` y `enlace_id`); la sesión de 30 días por dispositivo acotada a la vigencia del enlace es de RF-1.4 (EP-001). Lo nuevo es **probar** la continuidad entre dispositivos y entre enlaces, y la **copia** al enlace renovado, que exige saber de qué enlace viene la renovación. Por la copia, la complejidad pasa de S a **M**. El Perfil Objetivo no viaja entre dispositivos (RF-13.4.3): no es parte de esta historia.

**Conservación del equipo de un enlace vencido.** No se borra, igual que el resto del rastro de un enlace; cuánto tiempo se conserva antes de anonimizar lo decide la política de retención de Ley 1581 que gobierna EP-008 (HU-193).

## Trazabilidad

Épica madre: **EP-004** · PRD v4.18 · RF-4.1.2 · RF-4.5 (enmienda v4.18, D113) · RF-4.1.1 · RF-1.4 · RF-19.2 · D113 (sponsor, 2026-10-02) · depende de HU-192 (escritura del equipo), HU-203 (vista «Mi equipo»), HU-206 (estado real de los copiados) y HU-092 (EP-001, renovación del enlace vencido) · se apoya en el «Mi equipo» por invitado y enlace de EP-001 · relacionada con HU-146 y HU-094/HU-095 (EP-001)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: usa la escritura de HU-192, la vista de HU-203, las etiquetas de HU-206 y la renovación de HU-092, ya construida en EP-001 |
| N | Negociable | ✓ son fijos la continuidad dentro de la vigencia, el equipo nuevo por enlace nuevo, la oferta de copia al renovar con el estado real (D113) y que el enlace vencido no exponga el equipo; el texto de la oferta y su forma se negocian |
| V | Valiosa | ✓ un equipo que se pierde al cambiar de dispositivo o al renovar rompe el recorrido que termina en solicitud (RF-4.1.4) |
| E | Estimable | ✓ M: leer el equipo correcto al entrar por cada enlace, enlazar el renovado con el vencido y copiar el equipo, más las pruebas multi-dispositivo |
| S | Pequeña | ✓ M: una garantía de continuidad en cinco escenarios |
| T | Testeable | ✓ e2e con dos contextos de navegador del mismo invitado, dos enlaces de la misma cuenta, dos invitados en un mismo navegador, un enlace vencido renovado con un perfil pausado y una consulta a la BD que confirma que el equipo vencido no cambió |
