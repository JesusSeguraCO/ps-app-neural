---
id: HU-194
titulo: "Recibir un aviso de lenguaje de inventario al escribir la trayectoria"
epica: EP-003
prioridad: media
complejidad: S
estado: lista
fase: panel-crud
prd_version: 4.18
depende_de: [HU-125, HU-126, HU-176]
---

# HU-194 — Recibir un aviso de lenguaje de inventario al escribir la trayectoria

**Como** administradora de inventario de Talento Humano que redacta la trayectoria de un profesional en el panel,
**quiero** que el panel me advierta, al guardar, si la trayectoria usa expresiones de inventario y me señale cuáles, sin impedirme guardar ni publicar,
**para** corregir la redacción antes de que el cliente lea a una persona descrita como si fuera existencias.

## Criterios de aceptación

### Happy path — el aviso señala la expresión y no bloquea

**Dado** que en el editor del panel la trayectoria de un perfil dice «perfil disponible para asignación inmediata en proyectos de banca»,
**cuando** guardo el perfil,
**Entonces** el panel me advierte que la trayectoria usa lenguaje de inventario y me señala la expresión «disponible para asignación»
**Y** el perfil queda guardado
**Y** puedo publicarlo igual, sin que el aviso lo impida

### Error — el guardado falla por otra regla y la trayectoria tiene lenguaje de inventario

**Dado** que en el editor la trayectoria de un perfil dice «stock de consultores para banca» y la fecha de la verificación SARO que escribí es posterior a hoy,
**cuando** guardo el perfil,
**Entonces** el panel no guarda el cambio y me dice que la fecha de una verificación no puede ser posterior a hoy
**Y** me muestra también el aviso de lenguaje de inventario con la expresión «stock», separado del error y sin presentarlo como la causa del rechazo

### Edge case — la expresión se reconoce con otra escritura, y no dentro de otra palabra

**Esquema del escenario:** la comprobación es por expresión completa, sin distinguir mayúsculas ni tildes
**Dado** que la trayectoria de un perfil dice «<texto>»
**Cuando** guardo el perfil
**Entonces** el panel <resultado>

**Ejemplos:**

| texto | resultado |
|---|---|
| Lideró la migración de un ITEM crítico del core bancario | me advierte y señala la expresión «ITEM» |
| Trabajó dos años en Stockholm para un banco nórdico | no muestra ningún aviso |

### Edge case — corregir la trayectoria retira el aviso

**Dado** que el panel me advirtió que la trayectoria de un perfil usa «unidad»
**Y** que reescribí la frase sin esa expresión
**Cuando** guardo el perfil
**Entonces** el panel no muestra ningún aviso de lenguaje de inventario
**Y** el perfil queda guardado con la trayectoria nueva

## Notas

Cubre el lado del panel de **RF-3.6** (la calidez la carga la prosa; prohibido el registro de inventario al describir experiencia: «unidad», «ítem», «disponible para asignación», «stock»), dentro de la edición del inventario de **RF-8**. Aplica **D73** (sponsor, 2026-10-02, opción conservadora): el panel **advierte, no bloquea**.

**Nace el 2026-10-02 por la validación independiente de EP-003.** El aviso estaba como edge case en HU-154, cuyo actor es el líder de área en la ficha; aquí el actor es Talento Humano en el panel. Se parte para que cada historia tenga un solo actor. **Partición, no recorte**: el aviso se construye en EP-003, en el **sub-slice inicial del panel** (D60), junto a HU-177, HU-176, HU-178 y HU-191. Toca el editor que construyó EP-006, que **sigue cerrada**.

**Capa determinista.** Es una comprobación léxica sobre el texto al guardar: lista fija de expresiones de RF-3.6, por expresión completa (límite de palabra), sin distinguir mayúsculas ni tildes. No interviene ningún modelo (RF-16). La lista se puede ampliar sin cambiar la mecánica. Que «ítem» se advierta aun en usos técnicos legítimos («ítems del backlog») es deliberado: el aviso no bloquea y la decisión queda en Talento Humano.

**El aviso no es un error.** No entra en la guarda de publicación (HU-128, HU-176) ni marca el perfil como incompleto (HU-178). Cuando el guardado falla por otra regla, el aviso se muestra aparte para que no se confunda con la causa del rechazo.

**Fuera de esta historia:** la importación masiva (HU-086, HU-191) no muestra este aviso; si se quiere en la vista previa de la importación, es una ampliación que decide el sponsor. Copy del aviso **marcado para revisión de copy** (D73).

## Trazabilidad

> OpenSpec change: ep-003-evidencia-del-perfil

Épica madre: **EP-003** (sub-slice inicial, D60) · PRD v4.18 · RF-3.6 · RF-8 · RF-16 · D60 · D73 · validación 2026-10-02 · nace del edge case retirado de HU-154 · toca el editor del panel de **EP-006, que sigue cerrada** · depende de HU-125 (editor del perfil), HU-126 (editar un publicado) y HU-176 (la regla de fecha no futura que usa el escenario de error) · relacionada con HU-154 (la ficha que lee la trayectoria)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: se apoya en el editor de HU-125 y HU-126, ya construidos, y se construye detrás de HU-176 en el mismo sub-slice porque el escenario de error usa su regla de fecha (con cualquier otra regla de guardado el comportamiento es el mismo); no espera a ninguna historia de cara al cliente |
| N | Negociable | ✓ son fijos advertir sin bloquear (D73) y la lista de RF-3.6; el copy del aviso, cómo se resalta la expresión y si se amplía la lista se pueden negociar |
| V | Valiosa | ✓ evita que la prosa que lee el cliente describa a una persona como existencias, que es lo que RF-3.6 prohíbe y lo que el cliente percibe como trato de inventario |
| E | Estimable | ✓ S: una comprobación léxica con límite de palabra y normalización de mayúsculas y tildes, y un aviso no bloqueante en un editor que existe |
| S | Pequeña | ✓ S: un aviso en una pantalla, con cuatro escenarios |
| T | Testeable | ✓ trayectorias sembradas con «disponible para asignación», «stock», «ITEM», «Stockholm» y una reescrita sin «unidad» dan avisos, ausencias de aviso y guardados observables en el panel |
