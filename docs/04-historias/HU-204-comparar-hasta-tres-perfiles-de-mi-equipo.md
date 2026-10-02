---
id: HU-204
titulo: "Comparar hasta tres perfiles con los mismos criterios"
epica: EP-004
prioridad: media
complejidad: M
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-203, HU-250]
---

# HU-204 — Comparar hasta tres perfiles con los mismos criterios

**Como** líder de proyecto invitado que tiene varios candidatos para el mismo lugar,
**quiero** poner hasta tres de ellos lado a lado, con los mismos criterios en paralelo, desde mi equipo o desde la tabla de resultados,
**para** decidir con quién me quedo leyendo una fila por criterio, sin abrir y cerrar fichas para recordar qué decía cada una.

## Criterios de aceptación

### Happy path — comparar tres perfiles desde cualquiera de las dos entradas

**Esquema del escenario:** el comparador es el mismo desde «Mi equipo» y desde la tabla
**Dado** que estoy en <origen> con 3 perfiles marcados
**Cuando** toco <accion>
**Entonces** se abre el comparador con una columna por cada uno de los 3 perfiles, encabezada por su capacidad y su nombre y primer apellido
**Y** las tres columnas tienen las mismas filas, en el mismo orden: rol y seniority, experiencia declarada, sector, tecnologías, modalidad y ubicación, validación técnica de Trycore (resultado y fecha), disponibilidad y referencia
**Y** ninguna fila muestra puntaje, porcentaje ni posición entre los tres

**Ejemplos:**

| origen | accion |
|---|---|
| la vista «Mi equipo», con 4 perfiles en el equipo | «Comparar (3)» |
| la vista de tabla de resultados (HU-121, selección múltiple de HU-250) | «Comparar» de la barra de acciones en grupo |

### Edge case — con menos de 2 o más de 3 marcados no hay comparación

**Esquema del escenario:** el comparador solo se abre con 2 o 3 perfiles
**Dado** que estoy en la vista «Mi equipo» con 5 perfiles
**Cuando** dejo marcados <marcados> perfiles
**Entonces** la acción «Comparar» no está disponible
**Y** junto a ella leo «<mensaje>»

**Ejemplos:**

| marcados | mensaje |
|---|---|
| 1 | Marca 2 o 3 perfiles para comparar |
| 4 | Puedes comparar hasta 3 perfiles |

### Edge case — un perfil no declara un dato

**Dado** que marqué 2 perfiles y uno de ellos no tiene sector registrado
**Cuando** abro el comparador
**Entonces** su celda de sector dice «No declarado», no queda en blanco
**Y** las demás filas de las dos columnas siguen alineadas

### Error — un perfil marcado dejó de estar disponible

**Dado** que marqué 3 perfiles y uno de ellos se pausó después de marcarlo
**Cuando** abro el comparador
**Entonces** su columna muestra la etiqueta «Pausado» con la nota de su estado, en lugar de sus datos
**Y** las otras 2 columnas se comparan con todas sus filas

## Notas

Cubre **RF-4.4** (comparador de hasta 3 perfiles con los mismos criterios en paralelo). Prototipo: diálogo «Comparador» de `docs/07-prototipo/Portal de Perfiles v2.dc.html` («Hasta tres perfiles enfrentados por los mismos criterios. Sin puntajes: se compara lo declarado y lo verificado») con sus filas `filasComparador`, que son las de esta historia.

**D112 (sponsor, 2026-10-02) cierra P3 y P4.** El comparador se abre **desde «Mi equipo» y desde la acción en grupo de la vista de tabla** (barra «Sumar al equipo · Comparar · Quitar selección» del prototipo v2.5), y usa **filas fijas** de la ficha, **sin criterios de EP-009** (sin filas ✓/– del motor). Por eso el título deja de decir «de mi equipo»: desde la tabla se comparan perfiles marcados aunque aún no estén en el equipo.

**Regla de 2 o 3 marcados (unificada para las dos entradas).** En la tabla la selección también sirve para sumar en grupo (HU-121), así que no se puede topar en 3 (HU-250); por coherencia, en las dos entradas «Comparar» solo está disponible con 2 o 3 marcados y explica por qué cuando no. Sustituye a «el cuarto no queda marcado» del borrador. El prototipo toma los tres primeros cuando hay más, descartando en silencio: se corrige. *Elegida por el modelo por delegación del sponsor.*

**Sin puntajes por diseño.** El portal compara lo declarado y lo verificado (RF-3.12) y deja la conclusión al cliente. Ninguna celda trae campos de la lista negra del Anexo B (RF-3.7): las filas salen del mismo contrato de lectura de la ficha que construye EP-003 (`packages/contratos/src/ficha.ts`), no de una consulta propia.

**El estado se reevalúa al abrir** (RF-19.2): un perfil que cambió se muestra con su estado, nunca se omite. El tratamiento de esos perfiles en el equipo es de HU-206.

**Secuencia.** La entrada desde la tabla usa la selección múltiple de **HU-250** (EP-002; antes descrita en HU-121, de la que se partió en la discovery 2026-10-02); si EP-004 se construye antes, esa entrada se cablea en cuanto exista la barra, dentro de esta misma historia. No es recorte.

**Línea de release.** `docs/03-backlog/backlog.md` ubica el comparador en **v1.1**. Es ubicación de release, no recorte.

## Trazabilidad

Épica madre: **EP-004** · PRD v4.18 · RF-4.4 · RF-3.7 · RF-3.12 · RF-19.2 · D112 (sponsor, 2026-10-02) · depende de HU-203 (vista «Mi equipo») y HU-250 (EP-002, selección múltiple de la tabla; antes HU-121) · lee el contrato de ficha de EP-003 (HU-155 para la validación técnica) · relacionada con HU-206

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: se abre desde la vista de HU-203 y desde la barra de HU-250, y lee el contrato de ficha de EP-003; no depende del motor de criterios (D112) |
| N | Negociable | ✓ son fijos el máximo de 3, las dos entradas, las mismas filas fijas para todos, la ausencia de puntajes y que un dato ausente o un estado cambiado se digan; el diseño del diálogo y el texto de los mensajes se negocian |
| V | Valiosa | ✓ el cliente decide entre candidatos del mismo rol leyendo por fila, que es lo que lo lleva a pedir uno y no a abandonar |
| E | Estimable | ✓ M: marcar en la vista existente, la acción en la barra de la tabla, un diálogo con filas fijas sobre el contrato de ficha y la reevaluación del estado al abrir |
| S | Pequeña | ✓ M: una capacidad (comparar hasta 3) en cuatro escenarios |
| T | Testeable | ✓ e2e con un equipo sembrado de 5 y una tabla de resultados: tres columnas con las mismas filas y sin puntaje desde las dos entradas, «Comparar» no disponible con 1 y con 4 con su mensaje, «No declarado» en un sector vacío y un perfil pausado entre marcar y abrir |
