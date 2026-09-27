---
id: HU-140
titulo: "Obtener un borrador de los campos desde el artefacto"
epica: EP-006
prioridad: media
complejidad: L
estado: draft
fase: panel-crud
prd_version: 4.13
---

# HU-140 — Obtener un borrador de los campos desde el artefacto

**Como** administradora de inventario de Talento Humano,
**quiero** que el sistema me proponga los campos descriptivos de la validación a partir de la modalidad de prueba y del artefacto que ya adjunté,
**para** no transcribir a mano la evidencia de cada perfil del banco.

## Criterios de aceptación

### Happy path — borrador por plantilla para mi confirmación

**Dado** que un perfil tiene la modalidad de prueba elegida del catálogo y un artefacto adjunto con texto legible,
**cuando** pido el borrador,
**Entonces** el sistema precarga desde la modalidad de prueba el enunciado del reto, los entregables esperados y los criterios evaluados
**Y** propone la fecha de la validación y el resultado cuando aparecen escritos en el artefacto, indicando para cada campo de dónde salió
**Y** el contenido del artefacto no se envía a ningún servicio fuera del servidor del portal
**Y** el borrador queda para mi revisión y nunca se publica sin que yo lo confirme

### Error — artefacto sin texto aprovechable

**Dado** que el artefacto está vacío, es ilegible o no contiene texto que el sistema pueda leer,
**cuando** pido el borrador,
**Entonces** el sistema me lo dice sin borrar el adjunto
**Y** precarga igualmente lo que viene de la modalidad de prueba
**Y** deja la fecha y el resultado vacíos para que los complete a mano

### Edge case — fecha o resultado ambiguos

**Dado** que el artefacto menciona varias fechas, o ninguna frase que corresponda a un resultado,
**cuando** el sistema arma el borrador,
**Entonces** deja ese campo vacío y marcado para que yo lo complete
**Y** nunca lo rellena por analogía con otro perfil ni con un valor por defecto

### Edge case — el borrador afirma algo que el artefacto no sostiene

**Dado** que reviso un borrador propuesto,
**cuando** encuentro un dato que no está en el artefacto,
**Entonces** puedo corregirlo o descartar el borrador completo
**Y** nada llega a la ficha sin haber pasado por mi confirmación

## Notas

Cubre la segunda mitad de **RF-8.11** y **B.9.3** (carga asistida desde el artefacto), con los dos candados de B.9.3.

**Ajustada el 2026-09-27 a T-2** (aprobado por el sponsor; backlog de arquitectura T-2, T-13): el borrador se arma con una **plantilla determinista, sin IA**. Lo que se precarga sale de la modalidad de prueba (B.9.1: el texto vive en el catálogo, no en el perfil); la fecha y el resultado se reconocen por patrones en el texto del artefacto; **nada sale del servidor** y **confirma siempre una persona**. Ningún modelo de lenguaje interviene, así que tampoco aplica la frontera de D-24 ni el riesgo de que un modelo redacte sobre una persona real (RF-16.1, RF-16.2).

**Por qué es historia aparte desde el 2026-09-22.** La HU-131 original juntaba adjuntar y derivar en una sola historia de complejidad L con valor medio. Guardar un archivo y derivar campos descriptivos de un documento son trabajos de orden distinto; dividirlas deja la mitad útil (HU-131) construible por una fracción del costo.

**El borrador se revisa, siempre.** El sistema no afirma cosas sobre una persona real por la que Trycore responde contractualmente. El filtro es humano y explícito; por eso los dos casos límite son los que más pesan.

**Complejidad.** Se conserva la **L** del corte original. La plantilla determinista sin IA probablemente la abarata; re-estimarla es tarea de Tecnología, no de esta corrección.

**Sobre el mapa de historias.** En el mapa v1.0 esta capacidad vivía en v2. Moverla de release es una decisión del equipo, nunca del modelo (regla de producto completo); esta corrección no la cambia de lugar.

**Pregunta abierta** (se lleva a §12.3 del PRD): B.9.3 dice que «el veredicto nunca lo genera el sistema; *Cumple el estándar* proviene del registro de evaluación interna, cargado por una persona». T-2 pide proponer el **resultado** por patrones. ¿Basta con que el resultado propuesto sea solo una sugerencia que la persona confirma, o el resultado debe quedar fuera de la precarga y llegar siempre del registro de evaluación? Mientras no se decida, los criterios exigen que ningún resultado llegue a la ficha sin confirmación humana, que cumple ambas lecturas.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.13 · Anexo B.9.1 y B.9.3 · T-2 · ADR-0003 · depende de HU-131

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-131: sin artefacto adjunto no hay de qué derivar |
| N | Negociable | ✓ fija el resultado (precarga por plantilla, confirmación humana, nada sale del servidor); qué patrones y qué formatos de fecha se reconocen es negociable |
| V | Valiosa | ✓ Talento Humano pasa de redactar a confirmar en cada perfil |
| E | Estimable | ✓ sin IA el alcance es acotado: plantilla de la modalidad más reconocimiento de fecha y resultado; falta la cifra del equipo |
| S | Pequeña | ✗ **L** — se acepta como tal y aislada a propósito; candidata a re-estimarse tras T-2 |
| T | Testeable | ✓ artefactos de prueba con y sin fecha, con fechas ambiguas y vacíos dan resultados observables |
