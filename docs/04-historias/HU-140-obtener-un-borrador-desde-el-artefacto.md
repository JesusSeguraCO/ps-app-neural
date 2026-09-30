---
id: HU-140
titulo: "Precargar el borrador desde la modalidad de prueba"
epica: EP-006
prioridad: media
complejidad: S
estado: lista
fase: panel-crud
prd_version: 4.13
depende_de: [HU-131]
---

# HU-140 — Precargar el borrador desde la modalidad de prueba

**Como** administradora de inventario de Talento Humano,
**quiero** que el sistema me proponga el enunciado del reto, los entregables esperados y los criterios evaluados a partir de la modalidad de prueba del perfil,
**para** no transcribir a mano, perfil por perfil, un texto que ya vive en el catálogo.

## Criterios de aceptación

### Happy path — borrador por plantilla para mi confirmación

**Dado** que un perfil tiene la modalidad de prueba elegida del catálogo y un artefacto adjunto,
**cuando** pido el borrador,
**Entonces** el sistema precarga desde la modalidad de prueba el enunciado del reto, los entregables esperados y los criterios evaluados
**Y** indica en cada uno de esos campos que salió de la modalidad de prueba
**Y** el borrador queda para mi revisión y nunca se publica sin que yo lo confirme

### Error — artefacto sin texto aprovechable

**Dado** que el artefacto adjunto está vacío, es ilegible o no contiene texto que el sistema pueda leer,
**cuando** pido el borrador,
**Entonces** el sistema precarga igualmente lo que viene de la modalidad de prueba
**Y** el adjunto no se borra

### Edge case — corrijo un campo que el artefacto no sostiene

**Dado** que reviso un borrador precargado y uno de sus campos describe algo que no está en el artefacto,
**cuando** corrijo ese campo,
**Entonces** la ficha guarda el valor que yo escribí, no el que traía la plantilla

### Edge case — descarto un borrador que el artefacto no sostiene

**Dado** que reviso un borrador precargado y uno de sus campos describe algo que no está en el artefacto,
**cuando** descarto el borrador,
**Entonces** la ficha no recibe ningún campo de ese borrador

## Notas

Cubre la segunda mitad de **RF-8.11** en su parte de plantilla (**RF-8.11.2**, precarga desde la modalidad; **RF-8.11.4**, confirma una persona) y **B.9.3** (carga asistida), con los dos candados de B.9.3. El reconocimiento de fecha y resultado por patrones en el texto del artefacto vive en **HU-149**.

**Ajustada el 2026-09-27 a T-2** (aprobado por el sponsor; backlog de arquitectura T-2, T-13): el borrador se arma con una **plantilla determinista, sin IA**. Lo que se precarga sale de la modalidad de prueba (B.9.1: el texto vive en el catálogo, no en el perfil); **nada sale del servidor** y **confirma siempre una persona**. Ningún modelo de lenguaje interviene, así que tampoco aplica la frontera de D-24 ni el riesgo de que un modelo redacte sobre una persona real (RF-16.1, RF-16.2). Esta historia no lee el contenido del artefacto: por eso la precarga funciona aunque el artefacto no tenga texto legible.

**Por qué es historia aparte desde el 2026-09-22.** La HU-131 original juntaba adjuntar y derivar en una sola historia de complejidad L con valor medio. Guardar un archivo y derivar campos descriptivos de un documento son trabajos de orden distinto; dividirlas deja la mitad útil (HU-131) construible por una fracción del costo.

**El borrador se revisa, siempre.** El sistema no afirma cosas sobre una persona real por la que Trycore responde contractualmente. El filtro es humano y explícito; por eso el caso límite es el que más pesa.

**Sobre el mapa de historias.** En el mapa v1.0 esta capacidad vivía en v2. La marca «candidata a v2» **no es un recorte**: el alcance acordado se construye entero (regla de producto completo) y moverla de release es una decisión del equipo, nunca del modelo. Esta historia sigue en EP-006.

**Revisión INVEST 2026-09-30:** aplicada D7 (resultado como sugerencia «sin confirmar», nunca en la ficha sin confirmación; hoy vive en HU-149) y resuelta con ella la pregunta abierta de §12.3; When del último edge a «corrijo el campo o descarto el borrador»; la marca «candidata a v2» del mapa no se toma como recorte; se declara `depende_de: [HU-131]`.

**Revisión INVEST 2026-09-30: partida por D9 (partición, no recorte).** HU-140 queda con la precarga desde la plantilla de la modalidad (talla S); el reconocimiento de fecha y resultado por patrones en el artefacto, con la sugerencia «sin confirmar» de D7 y los casos de ambigüedad, pasa a **HU-149**. Las dos se construyen en EP-006.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.13 · RF-8.11 (RF-8.11.2, RF-8.11.4) · Anexo B.9.1 y B.9.3 · T-2 · D9 (sponsor, 2026-09-30) · ADR-0003 · depende de HU-131 · parte de fecha y resultado en HU-149

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: el borrador se pide sobre la evidencia que adjunta HU-131; no depende de HU-149, que se apoya en esta |
| N | Negociable | ✓ fija el resultado (precarga por plantilla, origen visible, confirmación humana, nada sale del servidor); cómo se presenta el borrador en el panel es negociable |
| V | Valiosa | ✓ Talento Humano deja de transcribir en cada perfil el enunciado, los entregables y los criterios que ya viven en el catálogo |
| E | Estimable | ✓ copiar tres textos del catálogo de la modalidad a un borrador con estado (generado → revisado) y confirmarlo o descartarlo; sin IA ni lectura del artefacto |
| S | Pequeña | ✓ **S** tras la partición de D9: una capacidad (precargar y confirmar la plantilla) en cuatro escenarios |
| T | Testeable | ✓ una modalidad con textos conocidos da un borrador comparable campo a campo; un artefacto vacío no impide la precarga; lo descartado o corregido se verifica en la ficha |
