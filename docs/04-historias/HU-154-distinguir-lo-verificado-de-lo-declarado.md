---
id: HU-154
titulo: "Distinguir en la ficha lo que Trycore verificó de lo que declara el profesional"
epica: EP-003
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.17
---

# HU-154 — Distinguir en la ficha lo que Trycore verificó de lo que declara el profesional

**Como** líder de área escéptico que evalúa a un profesional antes de pedirlo,
**quiero** ver en la ficha, separado a simple vista, lo que Trycore comprobó y lo que la persona cuenta de sí misma,
**para** saber en qué afirmaciones puedo apoyarme ante mi comité y cuáles tendré que confirmar en la conversación.

## Criterios de aceptación

### Happy path — dos zonas con su origen declarado

**Dado** que un perfil publicado tiene resumen, trayectoria con clientes nombrados autorizados, formación, stack, Sello Personal y validación técnica,
**cuando** abro su ficha,
**Entonces** veo un bloque titulado «Verificado por Trycore», con el Sello Personal y las validaciones, marcado visualmente con un tratamiento propio (no en letra pequeña)
**Y** veo aparte un bloque titulado «Declarado por la persona», con la trayectoria, la formación y el stack
**Y** la trayectoria se lee en prosa de la persona, con sus clientes y la escala, y ningún texto del portal sobre ella usa «unidad», «ítem», «disponible para asignación» ni «stock»

### Edge case — la experiencia nunca se presenta como validación técnica

**Dado** que la trayectoria de un perfil describe un proyecto en el que «diseñó la arquitectura de pagos» para un cliente,
**cuando** abro su ficha,
**Entonces** esa experiencia aparece solo en «Declarado por la persona»
**Y** la validación técnica de «Verificado por Trycore» muestra solo la prueba que Trycore aplicó, sin citar ni resumir la trayectoria

### Error — datos internos que nunca cruzan al portal

**Dado** que Talento Humano registró en el panel qué le interesa aportar al profesional (su motivación, dato interno por D20),
**cuando** abro su ficha,
**Entonces** no veo la motivación, ni completa ni resumida
**Y** no veo ningún otro dato de la lista negra B.4: fotografía, datos de contacto, hoja de vida, promedio académico, certificaciones con proveedor y fecha, ni resultado detallado del DISC
**Y** la respuesta que el servidor entrega a la ficha no contiene ninguno de esos campos

### Edge case — el panel advierte, sin bloquear, el lenguaje de inventario en la trayectoria

**Dado** que en el editor del panel la trayectoria de un perfil dice «perfil disponible para asignación inmediata en proyectos de banca»,
**cuando** Talento Humano guarda el perfil,
**Entonces** el panel le advierte que la trayectoria usa lenguaje de inventario y le señala la expresión «disponible para asignación»
**Y** el perfil se guarda y se puede publicar igual, sin que el aviso lo impida

## Notas

Cubre **RF-3.12** (verificado contra autoreportado, marcado visualmente), **RF-3.9** (la Experiencia Clave nunca se presenta como Grid Técnico), **RF-3.6** (calidez en la prosa, sin registro de inventario), **RF-3.4** (cada afirmación tiene respaldo en el inventario), **RF-3.7** y **B.4** (lista negra: motivación, promedio y certificaciones), y la parte de **RF-3.2** que corresponde a resumen, experiencia con clientes y escala, Sello Personal, formación general y stack.

**Qué existe ya (EP-006, D47 y D48):** la ficha compartida entre el portal y la vista previa del panel (`packages/ui/src/FichaPerfil.tsx`) ya tiene los bloques «Verificado por Trycore» (con escudo) y «Declarado por la persona». El contrato estricto `@ps/contratos/ficha` hace fallar cualquier campo de más. Los clientes nombrados ya respetan el consentimiento (HU-127, construida). Esta historia **no rehace** esos bloques: fija como criterio del cliente lo que hoy solo está verificado desde el panel, y añade los tres comportamientos de arriba. D20 dejó la motivación como dato interno (`perfiles.aporte`) fuera de toda vista de `operacion`; el escenario de error la prueba desde el portal.

**Qué cuenta como «escala»** (RF-3.2): la historia no fabrica un campo nuevo (RF-14.0). La escala es la que Talento Humano escribe en la descripción de cada experiencia.

**Decisiones del sponsor aplicadas (2026-10-02):**
- **D73 (opción conservadora):** el panel **advierte, no bloquea**, cuando la trayectoria que escribe Talento Humano usa «unidad», «ítem», «disponible para asignación» o «stock». Se añade el edge case. Cierra la pregunta abierta. Es una comprobación léxica determinista sobre el texto al guardar, en el editor que construyó EP-006 (que sigue cerrada); se construye con esta historia en EP-003. La lista de expresiones es la de RF-3.6 y se puede ampliar.
- **D63:** el **Sello Personal es opcional**. Si un perfil no lo tiene, «Verificado por Trycore» muestra las validaciones sin competencias, sin hueco (HU-081, HU-156); el happy path describe el caso con Sello Personal y no cambia. Las tres validaciones de entrada sí son obligatorias para publicar (HU-176, HU-178).

**Observación honesta sobre el nuevo edge case:** su actor es Talento Humano en el panel, no el líder de área de la historia. Se deja aquí porque D73 lo asigna a esta historia y protege el mismo resultado que ve el cliente (la prosa sin registro de inventario, RF-3.6). Si la revisión BDD exige un solo actor por historia, se parte en una historia propia del panel (requiere un ID nuevo).

## Trazabilidad

Épica madre: **EP-003** · PRD v4.17 · RF-3.2 · RF-3.4 · RF-3.6 · RF-3.7 · RF-3.9 · RF-3.12 · B.4 · D20 y D47 de EP-006 · D63 · D73 · se apoya en HU-127 (clientes nombrados según consentimiento) y HU-129 (la vista previa usa este mismo componente) · habilita HU-155 y HU-156 (contenido del bloque verificado)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ se apoya en la ficha que ya existe; no espera a ninguna otra historia de la épica |
| N | Negociable | ✓ son fijas las dos zonas con su origen visible, la lista negra y que el aviso de lenguaje de inventario advierta sin bloquear (D73); el tratamiento visual (columnas, bandas o placa, como explora el prototipo) se puede negociar |
| V | Valiosa | ✓ responde la pregunta de todo comprador escéptico: ¿esto lo comprobaron o me lo están contando? |
| E | Estimable | ✓ S: la estructura existe; falta asegurar los tres comportamientos en la pantalla del cliente y añadir una comprobación léxica con aviso en el editor |
| S | Pequeña | ✓ S, con observación: cuatro escenarios sobre dos superficies ya construidas (ficha y editor); el aviso del panel tiene otro actor (ver Notas) |
| T | Testeable | ✓ un perfil sembrado con motivación interna, y una trayectoria con «diseñó la arquitectura», dan resultados observables en la pantalla y en la respuesta del servidor; una trayectoria sembrada con «disponible para asignación» produce el aviso y se guarda igual |
