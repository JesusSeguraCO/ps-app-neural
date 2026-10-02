---
id: HU-199
titulo: "Saber que pedir el equipo no reserva a nadie"
epica: EP-005
prioridad: alta
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-198]
---

# HU-199 — Saber que pedir el equipo no reserva a nadie

**Como** líder de proyecto que envía una solicitud de equipo,
**quiero** que nada en el portal me dé a entender que reservé, aparté o contraté a los profesionales que elegí,
**para** no comprometer a mi empresa ni contar con alguien cuya disponibilidad Trycore todavía no me confirmó.

## Criterios de aceptación

### Happy path — la confirmación dice que nada quedó reservado

**Dado** que estoy en el resumen de una solicitud con 3 perfiles
**Cuando** toco «Enviar solicitud de equipo»
**Entonces** la confirmación dice «No reservamos ni comprometimos a ninguno de los profesionales que elegiste: su disponibilidad la confirmamos contigo»
**Y** ningún texto de la confirmación usa «reserva», «reservar», «apartar», «bloquear» ni «contratar» salvo para negarlo

### Edge case — cada pantalla del recorrido encuadra la solicitud como conversación

**Esquema del escenario:** el encuadre está en cada pantalla, no solo al final
**Dado** que tengo perfiles en mi equipo
**Cuando** abro <pantalla>
**Entonces** veo <encuadre>
**Y** ningún botón ni texto de la pantalla usa «reserva», «reservar», «apartar», «bloquear» ni «contratar» salvo para negarlo

**Ejemplos:**

| pantalla | encuadre |
|---|---|
| el formulario de solicitud | «No reservamos ni comprometemos a ningún profesional.» |
| el resumen antes de enviar | el botón «Enviar solicitud de equipo», nunca «Reservar» ni «Contratar» |

### Edge case — la disponibilidad del perfil no cambia para nadie

**Dado** que envié una solicitud con PS-0142, cuya banda de arranque es «1 semana»
**Cuando** un invitado de otra cuenta abre la ficha de PS-0142
**Entonces** la ve publicada con la misma banda «1 semana»
**Y** nada en su tarjeta ni en su ficha indica que otra cuenta lo pidió

### Edge case — mi equipo sigue igual después de enviar

**Dado** que envié una solicitud con los 3 perfiles de mi equipo
**Cuando** vuelvo a «Mi equipo»
**Entonces** mi equipo sigue con los mismos 3 perfiles
**Y** ninguno aparece marcado como «reservado», «apartado» ni «contratado»

### Error — un envío fallido no habla de reservas perdidas

**Dado** que estoy en el resumen y la solicitud no se puede guardar en este momento
**Cuando** toco «Enviar solicitud de equipo»
**Entonces** el mensaje dice «No pudimos enviar tu solicitud. Inténtalo de nuevo.»
**Y** no dice que se perdió una reserva ni que los profesionales dejaron de estar disponibles

## Notas

Cubre **RF-5.5** (el envío nunca se comunica como reserva, contratación ni bloqueo de disponibilidad) y la resolución de la tensión del **§2.4**: el portal abre la venta mejor especificada, no la cierra como un checkout. Es la mitad de la métrica de éxito de EP-005: «ninguna pieza del flujo comunica reserva o contratación».

**Nace el 2026-10-02 en el discovery de EP-005.** RF-5.5 solo aparecía en una frase de las notas de HU-098; sin escenarios propios no era verificable. **HU-098** sigue siendo la dueña de la confirmación (paso siguiente y plazo); esta historia fija lo que ninguna pantalla puede decir y lo que el envío no puede cambiar.

**La disponibilidad no se toca** (edge de otra cuenta): enviar no cambia el estado del perfil (`publicado`), su fecha de disponibilidad ni su banda, y no crea una colocación; las colocaciones las registra Talento Humano (HU-137). La confidencialidad entre cuentas también es un requisito: una cuenta nunca sabe qué pidió otra.

**D122 (sponsor, 2026-10-02) cierra la pregunta: «Mi equipo» se conserva igual tras enviar**, sin vaciarse ni marcarse «enviado». Un segundo envío del mismo equipo dentro de los 7 días cae en la regla de D-7 (HU-098: solo añadir contexto o volver, D119–D120).

**Lista de palabras (propuesta).** «reserva», «reservar», «apartar», «bloquear», «contratar» y sus conjugaciones; la prueba recorre los textos de las pantallas de EP-005 y de la confirmación. Los textos marcados para revisión de copy (D73) mantienen la regla.

**Prototipo:** «Solicitud de equipo», «Resumen antes de enviar» y «Confirmación» (`Portal de Perfiles v2.dc.html`); la vista «Mi equipo» ya dice «Armar un equipo aquí no reserva ni compromete a nadie» (EP-004).

## Trazabilidad

Épica madre: **EP-005** · PRD v4.18 · RF-5.5 · §2.4 · métrica de éxito de EP-005 · D73 (copy) · D122 (sponsor, 2026-10-02) · discovery 2026-10-02 · depende de HU-198 (el envío) · relacionada con HU-098 (confirmación), HU-197 (formulario), HU-096 (resumen) y HU-137 (EP-006, colocaciones)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: verifica las pantallas de EP-005 y el efecto del envío de HU-198; la ficha de otra cuenta ya existe (EP-001) |
| N | Negociable | ✓ son fijos que nada afirma reserva ni contratación y que el envío no cambia la disponibilidad ni se ve desde otra cuenta; también que el equipo se conserva igual tras enviar (D122); la redacción del encuadre (D73) se negocia |
| V | Valiosa | ✓ el cliente no cree haber asegurado a alguien que todavía no se confirmó y Trycore no promete lo que no puede cumplir |
| E | Estimable | ✓ S: textos de encuadre en tres pantallas, una prueba de vocabulario sobre esos textos y la comprobación de que el envío no escribe en el inventario |
| S | Pequeña | ✓ S: una regla de producto en cinco escenarios cortos |
| T | Testeable | ✓ e2e: confirmación con el texto de encuadre, barrido de vocabulario en formulario, resumen y confirmación, ficha de PS-0142 vista por otra cuenta con la misma banda, «Mi equipo» intacto tras enviar y un envío forzado a fallar con su mensaje |
