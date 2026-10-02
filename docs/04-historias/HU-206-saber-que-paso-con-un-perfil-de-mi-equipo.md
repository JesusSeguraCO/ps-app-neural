---
id: HU-206
titulo: "Saber qué pasó con un perfil de mi equipo que dejó de estar disponible"
epica: EP-004
prioridad: alta
complejidad: M
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-192, HU-203]
---

# HU-206 — Saber qué pasó con un perfil de mi equipo que dejó de estar disponible

**Como** líder de proyecto invitado que sumó perfiles a su equipo días antes de decidir,
**quiero** ver con su estado, y no perder en silencio, a los perfiles de mi equipo que se pausaron, se colocaron o salieron del banco,
**para** saber con qué equipo cuento de verdad y decidir si los quito o sigo, sin descubrirlo en la sesión de alineación.

## Criterios de aceptación

### Happy path — el perfil que cambió sigue en el equipo con su estado

**Esquema del escenario:** un perfil que cambió nunca se omite
**Dado** que mi equipo tiene 3 perfiles y uno de ellos pasó a <estado> después de que lo sumé
**Cuando** abro la vista «Mi equipo»
**Entonces** ese perfil sigue en la lista con la etiqueta «<etiqueta>» y la nota «<nota>»
**Y** el indicador «Mi equipo» sigue en 3
**Y** el resumen <resumen>

**Ejemplos:**

| estado | etiqueta | nota | resumen |
|---|---|---|---|
| pausado | Pausado | Por ahora no está disponible. | dice «1 perfil de tu equipo ya no está disponible» y no lo cuenta en los roles cubiertos ni en el arranque del conjunto |
| archivado | Archivado | Ya no forma parte del banco. | dice «1 perfil de tu equipo ya no está disponible» y no lo cuenta en los roles cubiertos ni en el arranque del conjunto |
| colocado, con liberación el 15 de noviembre de 2026 | Colocado en otro proyecto | Se libera el 15 de noviembre de 2026. | lo cuenta en los roles cubiertos y en el arranque con la banda de su fecha de liberación, y no lo cuenta como no disponible |

### Alterno — el perfil vuelve a estar disponible

**Dado** que un perfil de mi equipo estaba pausado y Talento Humano lo volvió a publicar
**Cuando** abro la vista «Mi equipo»
**Entonces** el perfil aparece sin etiqueta de estado, con su banda de disponibilidad
**Y** vuelve a contar en los roles cubiertos y en el arranque del conjunto

### Error — sumar un perfil que dejó de estar disponible mientras lo miraba

**Dado** que estoy frente a la tarjeta de un perfil que no está en mi equipo y que se pausó después de que cargué la página
**Y** que mi equipo tiene 2 perfiles
**Cuando** toco «Sumar al equipo»
**Entonces** el portal me dice que ese perfil ya no se puede sumar porque está pausado
**Y** el indicador «Mi equipo» sigue en 2 y la tarjeta muestra la etiqueta «Pausado»

### Edge case — la selección de mi correo se archivó y mi equipo tiene perfiles

**Dado** que amplié la búsqueda al banco completo y sumé 2 perfiles del banco a mi equipo
**Y** que todos los perfiles de la selección de mi correo se archivaron mientras exploraba
**Cuando** toco «Volver a la selección»
**Entonces** veo cada perfil archivado de la selección con su etiqueta de estado
**Y** veo la acción «Continuar con mi equipo (2)», que me lleva a la vista «Mi equipo» con mis 2 perfiles

### Edge case — quitar un perfil que ya no está en el banco

**Dado** que mi equipo tiene 3 perfiles y uno de ellos está archivado
**Cuando** toco «Quitar» en el perfil archivado
**Entonces** la vista muestra 2 perfiles y el indicador pasa a 2
**Y** el resumen ya no dice que haya perfiles no disponibles

## Notas

Aplica **RF-19.2** (el portal resuelve el estado real de cada código al abrir y nunca omite un perfil en silencio) y **RF-8.3** (archivar no borra: el rastro de lo que el cliente vio se conserva) al equipo del invitado, sobre RF-4.1 y RF-4.3. Paga el **criterio recibido de EP-001** que HU-192 dejó explícitamente fuera: «ante perfiles de la selección archivados, ofrecer continuar desde lo que se lleva en Mi equipo» (antes en HU-094, error) → edge «la selección de mi correo se archivó».

**Qué ya existe.** La vista `operacion.estado_seleccion_perfil` (migración 0010) ya clasifica cada código en disponible, pausado, colocado, archivado o no publicado, y el dominio ya tiene sus etiquetas (`packages/dominio/src/enlaces/textos-seleccion.ts`: «Pausado», «Colocado en otro proyecto», «Archivado», «Ya no forma parte del banco.»). Las notas de pausado y colocado de ese módulo hablan de «tu selección»; en el equipo se redactan para el equipo (ejemplos de arriba), **marcado para revisión de copy** como en D73.

**D114 (sponsor, 2026-10-02) cierra P6.** El perfil pausado o archivado **sigue en el contador** con su estado real (nadie lo quitó: quitarlo es acto del cliente) y **no cuenta** en roles cubiertos ni en el arranque del conjunto (RF-19.2: no se puede prometer). Qué viaja a la solicitud lo fija EP-005 (D118, HU-096 y HU-198): el no publicado no viaja; esta historia solo garantiza que el cliente lo ve antes.

**Colocado (coherencia con D118).** Un colocado **sigue publicado** (contrato 0021) y **viaja** con la solicitud (D118), así que aquí lleva su etiqueta y su nota de liberación pero **cuenta** en roles y en el arranque con la banda que sale de su fecha de liberación, y no se suma a «ya no está disponible». Corrige el borrador, que lo trataba como pausado. *Elegida por el modelo por delegación del sponsor.*

**Datos nominales de un archivado.** La vista de EP-001 solo devuelve nombre y roles de pausados y colocados con consentimiento; de un archivado, solo la familia. El equipo lo muestra igual que la selección de HU-094: familia, referencia y etiqueta, **sin nombre**, porque archivar puede responder a un retiro de consentimiento (Ley 1581). *Propuesta del modelo, negociable.*

**Fronteras:** «No publicado» (perfil vuelto a borrador, p. ej. sin consentimiento) recibe el mismo trato que archivado; el error de guardar por fallo del servidor es de HU-192, aquí el rechazo es por estado del perfil.

## Trazabilidad

Épica madre: **EP-004** · PRD v4.18 · RF-4.1 · RF-4.3 · RF-19.2 · RF-8.3 · RF-3.13 · D114 · D118 (sponsor, 2026-10-02) · absorbe el criterio recibido de EP-001 (HU-094, error) · depende de HU-192 (sumar y quitar) y HU-203 (vista «Mi equipo») · relacionada con HU-094 (EP-001), HU-135 (EP-006, archivar) y HU-096 (EP-005)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: se apoya en la vista de estados de EP-001, la escritura de HU-192 y la vista de HU-203 |
| N | Negociable | ✓ son fijos que nada se omite en silencio, que no se puede sumar un perfil no disponible y que el cliente puede continuar con su equipo si la selección se archivó; el conteo en el indicador y fuera de roles y arranque (D114) también; el copy de las notas es negociable |
| V | Valiosa | ✓ el cliente sabe con qué equipo cuenta antes de pedirlo, y un cambio explicado se lee como control (RF-19.2) |
| E | Estimable | ✓ M: reevaluar estados al leer el equipo, rechazar el alta de un no disponible en el servidor, excluirlo del cálculo del resumen y la acción «Continuar con mi equipo» en la selección |
| S | Pequeña | ✓ M: un comportamiento (perfiles no disponibles en el equipo) en cinco escenarios |
| T | Testeable | ✓ e2e con perfiles ficticios sembrados y cambiados de estado en BD entre pasos: etiquetas y notas de la tabla, indicador sin cambio, resumen sin contar pausado ni archivado y contando al colocado con reloj fijo, rechazo al sumar, «Continuar con mi equipo (2)» y quitar un archivado |
