---
id: HU-157
titulo: "Saber desde la ficha que la conversación sobre el profesional va por Trycore"
epica: EP-003
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.17
depende_de: [HU-147]
---

# HU-157 — Saber desde la ficha que la conversación sobre el profesional va por Trycore

**Como** líder de área interesado en un profesional concreto,
**quiero** ver en su ficha con quién de Trycore hablo sobre esa persona y que no hay forma de contactarla directamente desde el portal,
**para** saber cuál es el siguiente paso sin buscar por mi cuenta cómo llegarle y sin dudar de quién responde por ella.

## Criterios de aceptación

### Happy path — la ficha dice por dónde va la conversación

**Dado** que el contacto de Trycore vigente es «Eida Tinjacá, Coordinación de Servicio: eida.tinjaca@trycore.com»,
**cuando** abro la ficha de cualquier perfil publicado,
**Entonces** veo, sin desplegar nada, que la conversación sobre este profesional va por Trycore, con ese contacto
**Y** veo que Trycore responde por este perfil y lo pone a mi disposición
**Y** veo que el portal no tiene una vía de contacto directo con el profesional
**Y** no veo ningún botón ni acción aparte, como «Escribir a Trycore», fuera de ese bloque de contacto

### Error — no hay ningún camino hacia la persona

**Dado** que tengo abierta la ficha de un perfil publicado,
**cuando** busco en ella cómo escribirle al profesional,
**Entonces** la única vía de contacto que encuentro es la de Trycore
**Y** no veo correo, teléfono, perfiles en redes, hoja de vida ni ningún enlace o botón que lleve a la persona

### Edge case — el vínculo laboral no se declara ni se insinúa

**Esquema del escenario:** la ficha dice lo mismo sea cual sea el vínculo interno
**Dado** que un perfil publicado está registrado internamente con el vínculo <vinculo>
**Cuando** abro su ficha
**Entonces** veo el mismo texto de representación comercial y la misma forma de expresar la disponibilidad que en la ficha de cualquier otro perfil del banco
**Y** no veo nada que diga o sugiera con una etiqueta si la persona es empleada, contratista o parte de una red extendida de Trycore

**Ejemplos:**

| vinculo |
|---|
| vinculado |
| banco no vinculado |
| fábrica de software |

## Notas

Cubre **RF-3.3** (se publican nombre y primer apellido; no foto, correo, teléfono, redes ni hoja de vida; la ficha mantiene visible que la conversación va por Trycore), **RF-3.3.1** (el portal no declara la relación laboral; sostiene la representación comercial, D-10), **RF-3.3.2** (la barrera de contacto no depende del vínculo), **RF-3.13.4** en la ficha (un solo lenguaje de disponibilidad para todo el banco) y los puntos 1 a 3 de **B.4**.

**Reutiliza el contacto de HU-147** (EP-006, construida): el portal ya obtiene el contacto vigente de `operacion.contacto_trycore` y lo dibuja con `packages/ui/src/ContactoTrycore.tsx` (hoy en la pantalla de enlace revocado). Si solo hay buzón, se muestra como define HU-147 («escribe a People Service: …»). Esta historia no cambia cómo se configura ese contacto.

**El campo `vinculo` existe en el modelo** (migración 0014, B.7: vinculado · banco no vinculado · fábrica de software). Se usa internamente para Neural Speed (HU-158) y **nunca cruza al portal**. El edge case lo prueba con un esquema de una ficha por fila, uno por cada valor de B.7 (refinado el 2026-10-02: antes un solo «Cuando» abría dos fichas).

**D73 (sponsor, 2026-10-02, opción conservadora) cierra la pregunta abierta:** la ficha **no** ofrece una acción «Escribir a Trycore sobre este perfil» aparte del bloque de contacto. Basta con mostrar el contacto, que es lo que exige el PRD; una acción que abra el correo sería una vía nueva hacia Comercial sin especificar y competiría con «Sumar al equipo» (HU-175). Se añade al happy path como resultado observable.

**Copy para revisión de copy (D73):** el texto de representación comercial («la conversación sobre este profesional va por Trycore», «Trycore responde por este perfil y lo pone a tu disposición») es copy visible al cliente; se redacta con la opción del prototipo/PRD y queda **marcado para revisión de copy**.

## Trazabilidad

Épica madre: **EP-003** · PRD v4.17 · RF-3.3 · RF-3.3.1 · RF-3.3.2 · RF-3.13.4 · B.4 · D-1 · D-10 · D73 · depende de HU-147 (contacto de Trycore, EP-006) · relacionada con HU-158 (cierre de la ficha) y HU-154 (lista negra en la ficha)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: usa el contacto de HU-147, ya construida; no espera a ninguna otra historia de la épica |
| N | Negociable | ✓ son fijos el mensaje (va por Trycore, sin contacto directo, sin vínculo), la ausencia de vías a la persona y que no haya acción aparte del bloque de contacto (D73); la redacción y la ubicación se pueden negociar |
| V | Valiosa | ✓ protege el modelo de negocio (riesgo de contacto directo, §10.3) y le dice al cliente cuál es el siguiente paso |
| E | Estimable | ✓ S: un bloque de texto con el contacto que ya existe, más pruebas de ausencia |
| S | Pequeña | ✓ S: tres escenarios de presentación |
| T | Testeable | ✓ con el contacto configurado y un perfil por cada valor de vínculo (tres filas de ejemplo), el texto es comparable y la ausencia de enlaces y campos de contacto se comprueba en la pantalla y en la respuesta |
