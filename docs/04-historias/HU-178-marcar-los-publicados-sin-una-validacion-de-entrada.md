---
id: HU-178
titulo: "Ver marcados como incompletos los perfiles publicados a los que les falta una validación de entrada"
epica: EP-003
prioridad: alta
complejidad: M
estado: lista
fase: panel-crud
prd_version: 4.18
depende_de: [HU-176, HU-126, HU-128]
---

# HU-178 — Ver marcados como incompletos los perfiles publicados a los que les falta una validación de entrada

**Como** administradora de inventario de Talento Humano,
**quiero** que el panel me señale qué perfiles ya publicados no tienen completas sus tres validaciones de entrada, y qué le falta a cada uno, sin retirarlos del portal,
**para** completarlos sin dejar de atender a los clientes que ya los están mirando, y sin volver a publicar un cambio mientras sigan incompletos.

## Criterios de aceptación

### Happy path — el panel marca lo que falta y el perfil sigue visible

**Esquema del escenario:** un publicado incompleto se marca con su motivo
**Dado** que un perfil se publicó antes de que la regla lo exigiera y no tiene registrada <validacion>
**Cuando** abro el listado de perfiles del panel
**Entonces** el perfil aparece marcado «Incompleto: falta <validacion>»
**Y** puedo filtrar el listado por «incompleto»
**Y** el perfil sigue en estado *publicado* y visible en el portal

**Ejemplos:**

| validacion |
|---|
| la verificación SARO (alcance y fecha) |
| la fecha de la evaluación DISC |
| la modalidad de prueba |

### Error — editar un publicado incompleto sin completarlo

**Dado** que un perfil publicado está marcado «Incompleto: falta la verificación SARO»
**Y** que en el editor cambié su resumen sin registrar la verificación SARO
**Cuando** guardo
**Entonces** el panel me dice que el cambio no se puede publicar mientras falte la verificación SARO, y me pregunta si descarto el cambio o paso el perfil a borrador
**Y** mientras no responda, el portal sigue mostrando la versión anterior del perfil

### Edge case — completar lo que falta permite publicar el cambio

**Dado** que un perfil publicado está marcado «Incompleto: falta la fecha de la evaluación DISC»
**Y** que en el editor registré esa fecha, guardé y el panel me pide confirmar el cambio en un perfil publicado
**Cuando** confirmo el cambio
**Entonces** el cambio queda visible en el portal
**Y** el perfil deja de aparecer marcado como incompleto

### Edge case — completar el último incompleto devuelve la afirmación del estándar

**Dado** que completé y confirmé el cambio de un perfil que estaba marcado «Incompleto», y en el banco quedan los publicados incompletos que dice la tabla,
**cuando** un cliente abre la selección de su correo en el portal,
**Entonces** el encabezado del estándar (HU-159) dice lo que indica la tabla

| Publicados incompletos tras confirmar | Encabezado del estándar en el portal |
|---|---|
| 1 | describe lo que el estándar exige a cada perfil, sin afirmar que ninguno llega sin SARO, DISC y validaciones |
| 0 | afirma que ningún perfil llega al portal sin verificación SARO, prueba técnica revisada por Trycore y evaluación DISC |

### Edge case — el Sello Personal no marca un perfil como incompleto

**Dado** que un perfil publicado tiene sus tres validaciones de entrada completas y no tiene ninguna competencia del Sello Personal registrada,
**cuando** abro el listado de perfiles del panel,
**Entonces** el perfil no aparece marcado como incompleto
**Y** puedo editarlo y publicar el cambio sin registrar el Sello Personal

## Notas

Cubre **D62** y **D63** del sponsor sobre el motor de publicación del panel: **B.6** (las tres validaciones son condición de entrada), **RF-8.4 / RF-8.10** (guarda de publicación, HU-128) y **RF-8.2** (editar un publicado sin sorpresas, HU-126). En la ficha del cliente, el dato ausente se omite sin afirmarlo (**HU-156**, RF-3.4): el cliente nunca ve la marca «incompleto».

**Nace el 2026-10-02 por D62 y D63** (sponsor). HU-176 hace obligatorios SARO y DISC para publicar a partir de ahora. Esta historia cubre lo que ya está publicado y la regla común a las **tres validaciones de entrada**: seguridad (SARO, alcance y fecha), técnica (modalidad de prueba, ya obligatoria por D10) y Neural Fit (fecha de la evaluación DISC). **El Sello Personal sigue opcional** (D63): no cuenta como validación faltante. **Partición, no recorte**: se construye en el **sub-slice inicial de EP-003** (D60), detrás de HU-176.

**Cómo encaja con HU-126.** Editar un publicado que queda sin un dato exigido ya pregunta «¿descarto el cambio o paso el perfil a borrador?». Un publicado incompleto está en esa situación desde antes de editarlo: cualquier cambio que no complete lo que falta recibe la misma pregunta, y eso es lo que D62 llama «no se puede re-publicar tras editarlo hasta completarlo». El perfil no se retira solo: sigue visible mientras nadie lo edite, porque D62 lo decidió así.

**La técnica entra en la tabla por D63** («mismo trato que D62»). Desde D10 la guarda de HU-128 impide publicar sin modalidad, de modo que un publicado sin modalidad solo existe si se publicó antes de esa guarda. La fila se mantiene para que la regla sea una sola para las tres validaciones; si en datos reales no hay ninguno, el escenario se verifica con un perfil sembrado.

**La marca es explicabilidad, no un estado nuevo.** «Incompleto» se calcula con la misma guarda de publicación (capa determinista): un perfil está incompleto si esa guarda lo rechazaría hoy. No se añade un estado a la máquina de estados del perfil (ADR-0003).

**Riesgo cerrado por D80** (sponsor, 2026-10-02, segunda ronda). Antes: mientras existieran publicados incompletos, el encabezado del estándar (HU-159, RF-6.4) afirmaba que ningún perfil llega al portal sin SARO, prueba técnica y DISC, sin dato que lo respaldara para esos perfiles. D80: **la afirmación «ninguno» solo aparece con 0 publicados incompletos**; mientras quede uno, el encabezado describe el estándar sin afirmarlo. El conteo es el mismo cálculo de esta historia (la guarda de publicación), así que la marca del panel y la frase del portal no pueden discrepar. Se añade el edge con la tabla 1 / 0: el lado del panel es el que hace cambiar la frase. Completar muchos a la vez por importación es HU-191 (D81).

**Revisión INVEST 2026-10-02 (D80).** Quinto escenario añadido; la historia sigue en M porque la frase vive en HU-159 y aquí solo se expone el conteo que ya se calcula.

**Validación 2026-10-02 (validador independiente).** Dos ajustes de forma, sin cambio de alcance: (1) «guardo y confirmo» eran dos acciones en un «Cuando»; ahora el «Dado» deja el estado («guardé y el panel pide confirmar») y el «Cuando» es una sola acción («confirmo»), como en HU-177. (2) «prueba técnica en vivo» pasa a **«prueba técnica revisada por Trycore»**, que no excluye las modalidades que no son en vivo (por ejemplo «Reto de código con entrega funcional», HU-155; D59); **marcado para revisión de copy** (D73), igual que en HU-159.

## Trazabilidad

> OpenSpec change: ep-003-evidencia-del-perfil

Épica madre: **EP-003** (sub-slice inicial, D60) · PRD v4.17 · B.6 · RF-8.2 · RF-8.4 · RF-8.10 · RF-3.4 · D10 · D60 · D62 · D63 · nace de D62 y D63 (2026-10-02) · toca el listado, el editor y la guarda de publicación del panel de **EP-006, que sigue cerrada** · depende de HU-176 (datos SARO y DISC), HU-126 (confirmación de cambios en publicados) y HU-128 (guarda de publicación) · D80 y D81 (sponsor, 2026-10-02, segunda ronda) · validación 2026-10-02 (forma G/W/T y copy de la prueba técnica) · relacionada con HU-156 (la ficha omite el dato ausente), HU-159 (el encabezado afirma «ninguno» solo con 0 incompletos, D80) y HU-191 (completar por importación, D81)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: reutiliza la guarda de HU-128 ampliada por HU-176 y la confirmación de HU-126; se construye detrás de HU-176 en el mismo sub-slice |
| N | Negociable | ✓ son fijos que los publicados sigan visibles, la marca con su motivo, que no se publique un cambio sin completar y que el Sello Personal no cuente; el texto de la marca, el filtro y su ubicación se pueden negociar |
| V | Valiosa | ✓ permite exigir las tres validaciones sin retirar de golpe perfiles que los clientes están mirando, y le dice a Talento Humano exactamente qué completar |
| E | Estimable | ✓ M: calcular la marca con la guarda existente, mostrarla y filtrarla en el listado, exponer su conteo al portal (D80) y aplicar la pregunta de HU-126 a los publicados incompletos; sin estados nuevos ni datos nuevos |
| S | Pequeña | ✓ M: una regla del panel en cinco escenarios (un esquema con tres ejemplos y una tabla 1 / 0 de D80) |
| T | Testeable | ✓ perfiles sembrados publicados sin SARO, sin fecha DISC, sin modalidad y sin Sello Personal dan marcas, filtros, preguntas y publicaciones observables en el panel y en el portal; completar el último incompleto sembrado cambia la frase del encabezado |
