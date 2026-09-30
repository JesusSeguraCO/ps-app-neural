---
id: HU-134
titulo: "Corregir incoherencias entre estado y disponibilidad"
epica: EP-006
prioridad: alta
complejidad: M
estado: lista
fase: panel-crud
prd_version: 4.8
depende_de: [HU-136]
---

# HU-134 — Corregir incoherencias entre estado y disponibilidad

**Como** administradora de inventario de Talento Humano,
**quiero** ver en la propia fila cuándo el estado y la disponibilidad de un perfil se contradicen, con la acción que lo corrige,
**para** no tener que auditar el banco a mano buscando datos que se pelean entre sí.

## Criterios de aceptación

### Happy path — incoherencia señalada y corregible

**Dado** que un perfil está *pausado*,
**cuando** le pongo una fecha de disponibilidad,
**Entonces** la incoherencia aparece señalada en su propia fila, en rojo y con la contradicción nombrada
**Y** la acción que la corrige está disponible sin salir del listado

### Error — incoherencia de severidad alta

**Dado** que un perfil está en una de estas combinaciones de severidad alta:

| Estado | Disponibilidad | Severidad |
|---|---|---|
| pausado | «Disponible ahora» | ALTA |
| pausado | con fecha | ALTA |
| colocado | «Disponible ahora» | ALTA |
| archivado | «Disponible ahora» | ALTA |
| archivado | con fecha | ALTA |
| publicado | sin ninguna disponibilidad | ALTA |

**cuando** intento publicarlo,
**Entonces** el panel lo impide hasta que se resuelva, con un aviso en rojo
**Y** me dice cuál es la contradicción

### Edge case — incoherencia de severidad media

**Dado** que un perfil publicado está en una de estas combinaciones de severidad media:

| Estado | Disponibilidad | Severidad |
|---|---|---|
| publicado | fecha de disponibilidad ya pasada | MEDIA |
| publicado | sin actualizar hace más de 30 días | MEDIA |

**cuando** abro el listado,
**Entonces** la fila muestra una advertencia de severidad media, no en rojo, que nombra la contradicción
**Y** el perfil sigue publicado y visible en el portal hasta que se resuelva

### Edge case — disponibilidad vencida y sin tocar

**Dado** que la fecha de disponibilidad de un perfil publicado ya pasó y el perfil lleva más de 30 días sin actualizarse,
**cuando** abro el listado,
**Entonces** la fila indica que el portal lo está mostrando como «Disponibilidad por confirmar» y no como disponible ahora
**Y** el perfil aparece en mi bandeja de vigencia

### Edge case — fecha vencida pero actualizada hace poco

**Dado** que la fecha de disponibilidad de un perfil publicado ya pasó y el perfil se actualizó hace 30 días o menos,
**cuando** abro el listado,
**Entonces** la fila muestra la advertencia media de fecha vencida
**Y** no indica «Disponibilidad por confirmar» ni lo lleva a la bandeja de vigencia por esa causa

## Notas

Cubre **RF-8.14.3** y **RF-8.14.4**.

**La matriz de severidades es la de la decisión del sponsor D5 (2026-09-30).** ALTA bloquea publicar y avisa en rojo; MEDIA advierte sin bloquear. Las dos tablas de los escenarios son la matriz completa: cualquier otra combinación no es incoherencia.

**Esta historia es dueña del caso «pausado al que le ponen fecha»** (decisión del sponsor D6, 2026-09-30). HU-132 guarda la fecha desde el listado; la señal y la corrección viven aquí, sea cual sea la pantalla desde la que se puso la fecha.

**La regla del edge case de la fecha vencida es la que protege la credibilidad.** Afirmar disponibilidad con base en un dato que nadie sostiene es, según el PRD, «la forma más silenciosa de perder credibilidad con una cuenta activa». Por eso una fecha vencida no produce «Inmediato» (RF-3.13.3): produce «Por confirmar». Aquí se verifica del lado del panel; lo que ve el cliente lo cubren RF-3.13 y HU-096.

**La severidad separa lo que bloquea de lo que advierte.** Es una distinción de producto, no un parámetro administrable: queda fuera de los catálogos de RF-8.16.1.

**Colocado (sponsor, 2026-09-30, corrige D5):** un colocado siempre lleva su fecha de liberación como disponibilidad (RF-8.13.2), así que «colocado con fecha» es coherente; solo es ALTA «colocado con «Disponible ahora»».

**Revisión INVEST 2026-09-30:** se aplica D5: la matriz ALTA/MEDIA entra como tablas de ejemplos por severidad dentro de los AC y se añade un edge real (fecha vencida actualizada hace 30 días o menos: advierte, pero no «por confirmar»). El escenario que se observaba en el portal pasa a observar la señal en el panel. Se aplica D6 (esta historia es dueña del caso pausado + fecha, ahora happy path). «A un clic» pasa a «sin salir del listado». Se declara la dependencia de HU-136 por la bandeja de vigencia.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · RF-8.14.3 · RF-8.14.4 · RF-3.13.3 · D5 y D6 del sponsor (2026-09-30) · depende de HU-136 (bandeja de vigencia) · relacionada con HU-132 · la cara cliente de «Disponibilidad por confirmar» la cubren **RF-3.13** y **HU-096**

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: la señal en la fila y el bloqueo se construyen solos; la aparición en la bandeja la pinta HU-136 |
| N | Negociable | ✓ la matriz está fijada (D5); la acción de corrección que se ofrece en cada fila y el diseño del aviso son negociables |
| V | Valiosa | ✓ sostiene la credibilidad del inventario publicado |
| E | Estimable | ✓ la matriz es cerrada (seis combinaciones altas y dos medias), así que es una función determinista estado × disponibilidad × fechas, más su uso en la guarda de publicación y en la fila |
| S | Pequeña | ✓ M: una regla determinista con dos consumidores (fila y guarda de publicación) |
| T | Testeable | ✓ cada fila de las tablas es un caso de prueba, y la frontera de 30 días se prueba con fechas fijadas |
