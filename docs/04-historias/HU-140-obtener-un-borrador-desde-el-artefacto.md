---
id: HU-140
titulo: "Precargar el borrador desde la modalidad de prueba"
epica: EP-006
prioridad: media
complejidad: S
estado: lista
fase: panel-crud
prd_version: 4.15
---

# HU-140 — Precargar el borrador desde la modalidad de prueba

**Como** administradora de inventario de Talento Humano,
**quiero** que el sistema me proponga el enunciado del reto, los entregables esperados y los criterios evaluados a partir de la modalidad de prueba del perfil,
**para** no transcribir a mano, perfil por perfil, un texto que ya vive en el catálogo.

## Criterios de aceptación

### Happy path — borrador por plantilla para mi confirmación

**Dado** que un perfil tiene la modalidad de prueba elegida del catálogo,
**cuando** pido el borrador,
**Entonces** el sistema precarga desde la modalidad de prueba el enunciado del reto, los entregables esperados y los criterios evaluados
**Y** indica en cada uno de esos campos que salió de la modalidad de prueba
**Y** el borrador queda para mi revisión y nunca se publica sin que yo lo confirme

### Error — el perfil no tiene modalidad de prueba elegida

**Dado** que un perfil en borrador todavía no tiene modalidad de prueba elegida,
**cuando** pido el borrador,
**Entonces** el panel no precarga nada y me explica que el borrador sale de la modalidad de prueba
**Y** me lleva al selector de modalidad del perfil (HU-125)

### Edge case — corrijo un campo que el artefacto no sostiene

**Dado** que reviso un borrador precargado y uno de sus campos describe algo que no está en el artefacto,
**cuando** corrijo ese campo,
**Entonces** la ficha guarda el valor que yo escribí, no el que traía la plantilla

### Edge case — descarto un borrador que el artefacto no sostiene

**Dado** que reviso un borrador precargado y uno de sus campos describe algo que no está en el artefacto,
**cuando** descarto el borrador,
**Entonces** la ficha no recibe ningún campo de ese borrador

## Notas

**Revisión DoR 2026-09-30 (sponsor):** sin modalidad elegida no hay borrador: el panel lo impide y remite al selector (HU-125). El borrador **no necesita artefacto adjunto**: tras D11 la precarga solo usa la modalidad de prueba, y la evidencia se puede adjuntar antes o después (HU-131). En los dos edge, quien compara el campo con el artefacto es la administradora, no el sistema.

Cubre la segunda mitad de **RF-8.11** en su parte de plantilla (**RF-8.11.2**, precarga desde la modalidad; **RF-8.11.4**, confirma una persona) y **B.9.3** (carga asistida), con los dos candados de B.9.3. La fecha y el resultado no se leen del artefacto (D11): los escribe Talento Humano.

**Ajustada el 2026-09-27 a T-2** (aprobado por el sponsor; backlog de arquitectura T-2, T-13): el borrador se arma con una **plantilla determinista, sin IA**. Lo que se precarga sale de la modalidad de prueba (B.9.1: el texto vive en el catálogo, no en el perfil); **nada sale del servidor** y **confirma siempre una persona**. Ningún modelo de lenguaje interviene, así que tampoco aplica la frontera de D-24 ni el riesgo de que un modelo redacte sobre una persona real (RF-16.1, RF-16.2). Esta historia no lee el contenido del artefacto: por eso la precarga funciona aunque el artefacto no tenga texto legible.

**Por qué es historia aparte desde el 2026-09-22.** La HU-131 original juntaba adjuntar y derivar en una sola historia de complejidad L con valor medio. Guardar un archivo y derivar campos descriptivos de un documento son trabajos de orden distinto; dividirlas deja la mitad útil (HU-131) construible por una fracción del costo.

**El borrador se revisa, siempre.** El sistema no afirma cosas sobre una persona real por la que Trycore responde contractualmente. El filtro es humano y explícito; por eso el caso límite es el que más pesa.

**Sobre el mapa de historias.** En el mapa v1.0 esta capacidad vivía en v2. La marca «candidata a v2» **no es un recorte**: el alcance acordado se construye entero (regla de producto completo) y moverla de release es una decisión del equipo, nunca del modelo. Esta historia sigue en EP-006.

**Revisión INVEST 2026-09-30:** aplicada D7 (resultado como sugerencia «sin confirmar», nunca en la ficha sin confirmación; hoy vive en HU-149) y resuelta con ella la pregunta abierta de §12.3; When del último edge a «corrijo el campo o descarto el borrador»; la marca «candidata a v2» del mapa no se toma como recorte; se declara `depende_de: [HU-131]`.

**Revisión INVEST 2026-09-30: partida por D9 (partición, no recorte).** HU-140 queda con la precarga desde la plantilla de la modalidad (talla S); el reconocimiento de fecha y resultado por patrones en el artefacto, con la sugerencia «sin confirmar» de D7 y los casos de ambigüedad, pasa a **HU-149**. Las dos se construyen en EP-006.

**Revisión DoR 2026-09-30: aplicada D11** (sponsor). No hay lectura automática del artefacto y HU-149 se descarta (no se construye). HU-140 se mantiene tal cual: nunca leyó el contenido del artefacto, así que no necesita librería de PDF o Word. La fecha y el resultado de la validación los escribe Talento Humano en la ficha; ya no hay sugerencia «sin confirmar» que venga del artefacto.

**Revisión 2026-10-01: aplicada D29** (sponsor). HU-131 (adjuntar el artefacto) se difiere a una versión futura, así que se retira de `depende_de`: el borrador nunca necesitó artefacto adjunto (D11, D19) y sale solo de la modalidad de prueba. Los criterios no cambian: en los dos edge, «el artefacto» es la evidencia que la administradora tiene a mano fuera del panel (el documento, la transcripción o el repositorio de la prueba); es ella quien contrasta el campo contra esa evidencia, no el sistema, y en esta versión no hay artefacto guardado en el panel.

## Trazabilidad

> OpenSpec change: administracion-del-inventario

Épica madre: **EP-006** · PRD v4.15 · RF-8.11 (RF-8.11.2, RF-8.11.4) · Anexo B.9.1 y B.9.3 · T-2 · D9, D11 y D19 (sponsor, 2026-09-30) · ADR-0003 · D29 (sponsor, 2026-10-01): sin dependencia de HU-131, diferida a v2

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ no depende de HU-131 (diferida a v2 por D29; el borrador no exige artefacto, D19); necesita la modalidad elegida en HU-125; ninguna otra historia depende de esta tras el descarte de HU-149 (D11) |
| N | Negociable | ✓ fija el resultado (precarga por plantilla, origen visible, confirmación humana, nada sale del servidor); cómo se presenta el borrador en el panel es negociable |
| V | Valiosa | ✓ Talento Humano deja de transcribir en cada perfil el enunciado, los entregables y los criterios que ya viven en el catálogo |
| E | Estimable | ✓ copiar tres textos del catálogo de la modalidad a un borrador con estado (generado → revisado) y confirmarlo o descartarlo; sin IA ni lectura del artefacto |
| S | Pequeña | ✓ **S** tras la partición de D9: una capacidad (precargar y confirmar la plantilla) en cuatro escenarios |
| T | Testeable | ✓ una modalidad con textos conocidos da un borrador comparable campo a campo; sin modalidad elegida el panel lo impide y remite al selector; lo descartado o corregido se verifica en la ficha |
