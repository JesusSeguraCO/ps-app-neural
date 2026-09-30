---
id: HU-149
titulo: "Reconocer fecha y resultado por patrones en el artefacto"
epica: EP-006
prioridad: media
complejidad: M
estado: lista
fase: panel-crud
prd_version: 4.15
depende_de: [HU-140, HU-131]
---

# HU-149 — Reconocer fecha y resultado por patrones en el artefacto

**Como** administradora de inventario de Talento Humano,
**quiero** que el sistema reconozca en el texto del artefacto que ya adjunté la fecha de la validación y el resultado, y me los proponga en el borrador,
**para** confirmar esos datos en lugar de buscarlos y transcribirlos del documento de cada perfil.

## Criterios de aceptación

### Happy path — fecha y resultado propuestos desde el artefacto

**Dado** que un perfil tiene un artefacto adjunto con texto legible donde aparecen escritos la fecha de la validación y el resultado,
**cuando** pido el borrador,
**Entonces** el sistema propone la fecha de la validación, indicando de qué parte del artefacto salió
**Y** precarga el resultado como sugerencia marcada «sin confirmar», indicando de qué parte del artefacto salió
**Y** el contenido del artefacto no se envía a ningún servicio fuera del servidor del portal

### Error — artefacto sin texto aprovechable

**Dado** que el artefacto está vacío, es ilegible o no contiene texto que el sistema pueda leer,
**cuando** pido el borrador,
**Entonces** el sistema me dice que no pudo leer el artefacto, sin borrar el adjunto
**Y** deja la fecha y el resultado vacíos para que los complete a mano

### Edge case — fecha o resultado ambiguos

**Dado** que el artefacto menciona varias fechas, o ninguna frase que corresponda a un resultado,
**cuando** pido el borrador,
**Entonces** el sistema deja ese campo vacío y marcado para que yo lo complete
**Y** nunca lo rellena por analogía con otro perfil ni con un valor por defecto

### Edge case — corrijo la fecha o el resultado que el artefacto no sostiene

**Dado** que reviso un borrador cuya fecha o cuyo resultado propuestos no están en el artefacto,
**cuando** corrijo ese campo,
**Entonces** la ficha guarda el valor que yo escribí y lo registra como confirmado por mí

### Edge case — descarto un borrador cuya fecha o resultado no sostiene el artefacto

**Dado** que reviso un borrador cuya fecha o cuyo resultado propuestos no están en el artefacto,
**cuando** descarto el borrador,
**Entonces** la ficha no recibe la fecha ni el resultado propuestos
**Y** un resultado que sigue «sin confirmar» no llega a la ficha

## Notas

Cubre la segunda mitad de **RF-8.11** en su parte de patrones (**RF-8.11.2**: «la fecha y el resultado se extraen por patrones del texto de la evidencia; lo que la plantilla no encuentra queda vacío, nunca se completa por analogía») y **B.9.3**, con sus dos candados. La precarga desde la modalidad de prueba vive en **HU-140**.

**Nace el 2026-09-30 por D9** (sponsor): en la revalidación, HU-140 no pasaba «pequeña» (L). El corte natural era **A** (precarga desde la plantilla de la modalidad, que queda en HU-140) y **B** (reconocimiento de fecha y resultado por patrones en el artefacto, esta historia).

**Revisión INVEST 2026-09-30: partida por D9 (partición, no recorte).** El alcance sigue entero en EP-006; HU-140 y HU-149 se construyen las dos.

**Sin IA y sin salir del servidor** (T-2, aprobado por el sponsor el 2026-09-25; backlog de arquitectura T-2, T-13). El reconocimiento es por patrones deterministas sobre el texto del artefacto. Ningún modelo de lenguaje interviene, así que tampoco aplica la frontera de D-24 ni el riesgo de que un modelo redacte sobre una persona real (RF-16.1, RF-16.2).

**Pregunta de §12.3 resuelta (D7, sponsor, 2026-09-30).** B.9.3 dice que «el veredicto nunca lo genera el sistema; *Cumple el estándar* proviene del registro de evaluación interna, cargado por una persona», y T-2 pedía proponer el **resultado** por patrones. Decisión: el resultado se **precarga como sugerencia** marcada «sin confirmar» y **no llega a la ficha hasta que Talento Humano lo confirma**. El sistema sugiere; el veredicto lo sigue poniendo una persona, que es lo que B.9.3 protege.

**El borrador se revisa, siempre.** El sistema no afirma cosas sobre una persona real por la que Trycore responde contractualmente. El filtro es humano y explícito; por eso los dos casos límite son los que más pesan.

**Sobre el mapa de historias.** En el mapa v1.0 la carga asistida vivía en v2. La marca «candidata a v2» **no es un recorte**: el alcance acordado se construye entero (regla de producto completo) y moverla de release es una decisión del equipo, nunca del modelo. Esta historia sigue en EP-006.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.15 · §12.3 · RF-8.11 (RF-8.11.2, RF-8.11.4) · Anexo B.9.3 · T-2 · D7 y D9 (sponsor, 2026-09-30) · ADR-0003 · sale de HU-140 · depende de HU-140 y HU-131

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: lee el artefacto que guarda HU-131 y completa el borrador que abre HU-140; se construye después de ambas y no bloquea ninguna |
| N | Negociable | ✓ fija el resultado (fecha con su origen, resultado como sugerencia «sin confirmar», vacío ante la ambigüedad, nada sale del servidor); qué patrones y qué formatos de fecha se reconocen es negociable |
| V | Valiosa | ✓ Talento Humano deja de buscar la fecha y el resultado en cada documento y pasa a confirmarlos |
| E | Estimable | ✓ M: extraer texto del artefacto en el servidor, reconocer fechas y frases de resultado con patrones, marcar el origen y la ambigüedad; D7 elimina la duda sobre el resultado; falta la cifra del equipo |
| S | Pequeña | ✓ **M**, una sola capacidad (reconocer dos campos por patrones) en cinco escenarios, tras la partición de D9 |
| T | Testeable | ✓ artefactos de prueba con fecha y resultado, sin texto, con varias fechas, sin resultado y con un dato propuesto que el artefacto no sostiene dan resultados observables en el borrador y en la ficha |
