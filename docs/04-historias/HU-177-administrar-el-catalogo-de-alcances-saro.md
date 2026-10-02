---
id: HU-177
titulo: "Administrar el catálogo de alcances de la verificación SARO"
epica: EP-003
prioridad: alta
complejidad: S
estado: draft
fase: panel-crud
prd_version: 4.17
depende_de: [HU-089]
---

# HU-177 — Administrar el catálogo de alcances de la verificación SARO

**Como** administradora de inventario de Talento Humano,
**quiero** crear, corregir y retirar en el panel los alcances posibles de la verificación de seguridad bajo SARO, cada uno con el texto que leerá el cliente,
**para** que cada perfil diga con las mismas palabras qué se le verificó, sin que cada persona del equipo lo redacte a su manera.

## Criterios de aceptación

### Happy path — crear un alcance con su texto de cara al cliente

**Dado** que el catálogo de alcances SARO no tiene ningún valor para la verificación de antecedentes judiciales, disciplinarios y fiscales,
**cuando** creo el alcance «Antecedentes judiciales, disciplinarios y fiscales» con su texto de cara al cliente,
**Entonces** el alcance queda disponible para elegirlo en el editor de perfiles
**Y** el editor no admite escribir un alcance que no esté en el catálogo

### Error — un alcance idéntico salvo mayúsculas

**Dado** que el catálogo ya tiene «Antecedentes judiciales, disciplinarios y fiscales»,
**cuando** intento crear «antecedentes judiciales, disciplinarios y fiscales»,
**Entonces** el panel impide crearlo
**Y** me indica que ya existe con su forma registrada

### Edge case — corregir el texto de un alcance en uso

**Dado** que el alcance «Antecedentes judiciales, disciplinarios y fiscales» está asignado a 4 perfiles publicados
**Y** que corregí su texto de cara al cliente y el panel me avisa, antes de aplicarlo, que el cambio se verá en 4 fichas publicadas
**Cuando** confirmo la corrección
**Entonces** las 4 fichas muestran el texto nuevo
**Y** el historial registra quién cambió el texto, cuándo, y el valor anterior y el nuevo

### Edge case — retirar un alcance en uso

**Dado** que el alcance «Antecedentes judiciales» está asignado a 2 perfiles publicados,
**cuando** lo desactivo en el catálogo,
**Entonces** el editor deja de ofrecerlo para perfiles nuevos o editados
**Y** los 2 perfiles lo conservan y sus fichas lo siguen mostrando
**Y** el catálogo no permite borrarlo, solo desactivarlo

### Edge case — editar un perfil que conserva un alcance desactivado

**Dado** que el alcance «Antecedentes judiciales» está desactivado en el catálogo y asignado a un perfil publicado
**Y** que en el editor de ese perfil cambié su resumen sin tocar el alcance, guardé y el panel me pide confirmar el cambio en un perfil publicado
**Cuando** confirmo el cambio
**Entonces** el perfil conserva «Antecedentes judiciales» como alcance y su ficha sigue mostrándolo
**Y** el cambio queda publicado, sin que el alcance desactivado lo marque como incompleto ni lo bloquee
**Y** el editor muestra ese alcance como su valor actual, señalado como desactivado, y no lo ofrece a otros perfiles

## Notas

Cubre la parte de **D61** que define el alcance SARO como **catálogo cerrado administrable**, al servicio de **B.7** (validación de seguridad: alcance y fecha) y **RF-3.2** (alcance como evidencia en la ficha). Sigue las reglas ya construidas para los catálogos del panel: **RF-8.16** (catálogos paramétricos administrables), selección en vez de texto libre y aviso de duplicados (**HU-089**) y **catálogos sin borrado** (capa determinista del dominio).

**Nace el 2026-10-02 por D61** (sponsor). HU-176 elige el alcance del catálogo; administrar el catálogo es una capacidad distinta con sus propios escenarios. Meterla en HU-176 la habría dejado con seis o siete escenarios y dos capacidades, fuera de pequeña. **Partición, no recorte**: las dos se construyen en el **sub-slice inicial de EP-003** (D60), y esta va antes porque HU-176 la necesita.

**Por qué un catálogo y no texto libre:** el alcance es una afirmación de Trycore frente al área de riesgo del cliente. Con texto libre, la misma verificación se describiría de varias formas y algunas podrían prometer más de lo que se verificó. El catálogo fija el texto una vez.

**Por qué corregir el texto avisa del impacto:** el texto lo leen clientes en fichas publicadas. Es la misma regla de HU-126 (editar lo publicado sin sorpresas), aplicada a un valor que comparten varias fichas.

**Copy para revisión de copy (D73):** el texto de cara al cliente de cada alcance lo escribe Talento Humano en el panel; el valor inicial de los ejemplos («Antecedentes judiciales, disciplinarios y fiscales») es ilustrativo y queda **marcado para revisión de copy** con Mercadeo antes de cargar el catálogo real.

**Editar un perfil con un alcance ya desactivado (validación 2026-10-02, validador independiente).** Faltaba decir qué pasa cuando se edita uno de los perfiles que conservan un alcance desactivado. Opción conservadora, coherente con «los perfiles lo conservan» y con los catálogos sin borrado: el perfil **lo conserva** al guardar y **puede re-publicarse**; un alcance desactivado sigue siendo un dato registrado, así que la guarda de publicación (HU-176, HU-178) no lo trata como faltante. Desactivar solo impide **asignarlo** a perfiles que no lo tenían (también por importación, HU-191). Si Talento Humano cambia el alcance de ese perfil por otro activo, el desactivado ya no vuelve a ofrecérsele. Quinto escenario.

**El valor parecido** (distancia de edición, «Fgima» frente a «Figma» en HU-089) se reutiliza tal cual de los catálogos existentes; no se reescribe aquí. Esta historia solo prueba el caso idéntico salvo mayúsculas.

## Trazabilidad

Épica madre: **EP-003** (sub-slice inicial, D60) · PRD v4.17 · B.7 · RF-3.2 · RF-8.16 · D60 · D61 · D73 (copy) · validación 2026-10-02 (editar con un alcance desactivado) · nace de D61 (2026-10-02) · reutiliza las reglas de catálogo de HU-089 (EP-006, construida y cerrada) · habilita a HU-176 · relacionada con HU-156 (ficha que muestra el alcance) y HU-138 (historial)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: reutiliza el mecanismo de catálogos de HU-089, ya construido; no espera a ninguna otra historia |
| N | Negociable | ✓ son fijos el catálogo cerrado (D61), la ausencia de borrado, que corregir lo publicado avise y que un alcance desactivado se conserve y deje re-publicar; el formulario y la redacción de los avisos se pueden negociar |
| V | Valiosa | ✓ hace que la evidencia de seguridad diga lo mismo para todos los perfiles verificados igual y no prometa de más ante un área de riesgo |
| E | Estimable | ✓ S: un catálogo más sobre un mecanismo que ya existe (crear, detectar duplicado, desactivar conservando el valor asignado) y un aviso de impacto con su registro en el historial |
| S | Pequeña | ✓ S: un catálogo con cinco escenarios, en el límite de la metodología |
| T | Testeable | ✓ en el panel, crear, duplicar, corregir un valor asignado a 4 perfiles sembrados, desactivar uno asignado a 2 y re-publicar uno de ellos tras editarlo dan resultados observables en el editor, en las fichas y en el historial |
