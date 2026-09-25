---
artefacto: auditoria
tipo: manual
proyecto: portal-people-service
fecha: 2026-09-18
alcance: realineación a PRD 4.5 + generación de 02, 05 y 06 + decisiones del 18 y 21 de septiembre (PRD 4.8) + redacción de EP-006 + resolución de duplicados y división de HU-131
nota: >
  Auditoría hecha a mano durante la instalación de la vertical.
  NO sustituye a los 8 agentes revisores: se instalaron en esta misma
  sesión y Claude Code no los registra hasta reiniciar.
  Correr /trycore:revisar tras reiniciar para la segunda opinión en contexto limpio.
---

# Auditoría — Portal de Perfiles People Service

## Resumen

| Severidad | Cantidad | Estado |
|---|---|---|
| Bloqueante | 2 | **ambos resueltos** |
| Mayor | 5 | **los 5 corregidos** |
| Menor | 5 | 4 corregidos · 2 abiertos (ambos del plugin) |

---

## Bloqueantes

### B-1 · ~~El objetivo habilitante no tiene backlog~~ — resuelto el 2026-09-21

*Cerrado.* Se redactaron **17 historias, HU-123 a HU-139**, y EP-006 pasó de 4 a 21.

Hasta el 21 de septiembre la épica declaraba RF-8 completo —46 líneas de requisitos— con cuatro historias, todas de importación y catálogos. No existía historia para el CRUD del perfil, el registro de la validación técnica, el consentimiento, la publicación ni el mantenimiento: el recorrido entero de Talento Humano. **O5, el objetivo que el PRD §3 llama habilitante, no tenía backlog que lo sostuviera**, y D-8 en CRUD completo ya había comprometido todo ese alcance para el MVP.

| Bloque | Historias |
|---|---|
| Acceso y roles (D-22) | HU-123, HU-124 |
| CRUD del perfil | HU-125, HU-126 |
| Consentimiento nominal | HU-127, HU-128 |
| Publicación y evidencia | HU-129, HU-130, HU-131 |
| Mantenimiento del banco | HU-132, HU-133, HU-134, HU-135, HU-136, HU-137 |
| Gobierno | HU-138, HU-139 |

**Lo que el trabajo dejó a la vista.** El panel pesa **40 de los 174 pts** del backlog — el 23%. No es un módulo administrativo al margen del producto: es casi un cuarto de lo que hay que construir, y hasta hace tres días no estaba en ninguna cuenta.

**Dependencia dura descubierta al redactar:** HU-138 (auditoría) no existe sin HU-123 (identidad corporativa). RF-8.1.3 lo dice — el «quién» del registro solo existe si hay identidad. Eso fija el orden de construcción del panel.

**Deuda que este trabajo no cubre.** EP-004 quedó como el nuevo caso invertido: sus dos historias escritas son observaciones sobre la composición del equipo, y el comportamiento que hace existir la épica —sumar, quitar, contador, recuperar «Mi equipo»— sigue sin redactarse. Es el mismo patrón que tenía EP-006.

### B-2 · ~~Decisiones bloqueando el backlog~~ — resuelto el 2026-09-21

*Cerrado.* Entre el 18 y el 21 de septiembre se cerraron seis decisiones y **no queda ninguna que bloquee una historia**.

| Decisión | Resolución | Fecha |
|---|---|---|
| **D-3** Umbral de perfiles para producción | 25 perfiles publicados | 18 sep |
| **D-8** Alcance del panel en v1 | **CRUD completo** | 18 sep |
| **D-10** Disponibilidad y vínculo laboral | El portal no comunica el vínculo; disponibilidad como banda de arranque | 18 sep |
| **D-18** Ubicación del profesional *(revisada)* | Ciudad publicada solo en necesidad Presencial o Híbrido | 18 sep |
| **D-16** Persistencia del Perfil Objetivo | **Por dispositivo**, no por cuenta — sin implicación ISO 27000 | 21 sep |
| **D-19** Composiciones de referencia | **Los tres tipos de proyecto más frecuentes** | 21 sep |

Quedan abiertas **D-2** (nombre del portal, afecta diseño visual) y **D-5** (detalle de la ficha, con VoBo condicionado a ver primero la propuesta). Ninguna detiene construcción.

**Lo que esto deja a la vista.** El backlog ya no espera decisiones: espera historias. D-8 en CRUD completo comprometió para el MVP un alcance cuya mayor parte no está redactada, y eso convirtió B-1 en el único bloqueante real del proyecto.

**Dependencia de insumo, no de decisión:** HU-084 necesita que Delivery entregue las tres composiciones reales. Es una reunión, no una resolución.

## Mayores

### M-1 · ~~HU-078 y HU-110 son la misma historia~~ — resuelto el 2026-09-22

*Cerrado, y mejor de lo propuesto.* Ambas describían el registro de demanda: mismo actor, mismo *quiero*, mismo propósito, mismo escenario de error. HU-078 se escribió contra el PRD 2.8; HU-110 contra el 4.0, en el cierre de huecos de EP-008, sin ver que la otra existía.

La propuesta del 18 de septiembre era **retirar HU-110**. Al ir a ejecutarla apareció que **RF-7.2 tiene dos mitades** —*«reporte de filtros más usados y de búsquedas sin resultados»*— y que las dos historias cubrían la segunda mientras **la primera no la cubría nadie**.

| | Resolución |
|---|---|
| **HU-078** (EP-010) | Queda como la historia **canónica** del registro de demanda: RF-15.1 + búsquedas sin resultados, con dueño y cadencia de D-13 |
| **HU-110** (EP-008) | **Reescrita**, no retirada: cubre el reporte de filtros más usados, la mitad de RF-7.2 que estaba huérfana |

Reescribirla costó lo mismo que retirarla y dejó el requisito completo. **La duplicación tapaba un hueco de trazabilidad que esta auditoría no había detectado.**

### M-2 · Deriva de versiones entre artefactos *(corregido)*

Ningún artefacto estaba alineado con el PRD 4.5.

| Artefacto | Antes | Decía alinearse a | Ahora |
|---|---|---|---|
| Épicas | 3.0 | PRD 4.0 | **4.0** ← PRD 4.5 |
| Backlog | 3.5 | PRD 3.5 · épicas 2.0 | **4.0** ← PRD 4.5 · épicas 4.0 |
| Mapa | 1.0 | PRD 1.1 | **2.0** ← PRD 4.5 |

El backlog declaraba `epicas_version: 2.0` mientras el archivo de épicas decía `3.0`.

### M-3 · RF-17 y RF-19 sin épica que los declarara *(corregido)*

El PRD 4.5 define 19 requisitos funcionales. `epicas.md` v3.0 solo citaba 17: faltaban **RF-17** (traspaso a Delivery, PRD v4.0) y **RF-19** (enlaces curados, PRD v4.4).

Las historias sí existían —HU-099, HU-101 y HU-107 cubren RF-17; HU-122 cubre RF-19— pero ninguna épica los declaraba como capability. La trazabilidad top-down estaba rota.

Añadidos a EP-005 (RF-17.3, RF-17.4), EP-007 (RF-17.1, RF-17.2, RF-17.5) y EP-001 (RF-19 completo). **Cobertura RF-1 a RF-19 ahora completa.**

### M-4 · Dos espacios de ID disjuntos *(corregido)*

El mapa usaba `HU-001`–`HU-064`, reservados y nunca escritos. Las historias reales son `HU-065`–`HU-122`. **Intersección: cero.** El mapa no trazaba a una sola historia existente.

Regenerado sobre PRD 4.5 con los IDs reales. Los rangos viejos se conservan en §Deuda de mapa como alcance pendiente, no como IDs vivos.

### M-5 · `epicas.md` marcaba EP-007 como bloqueada por decisiones cerradas *(corregido)*

D-6 y D-7 se cerraron el **2026-09-15** (PRD v3.0, que dice explícitamente «EP-007 desbloqueada»). `epicas.md` la siguió listando como bloqueada. Corregido, con la nota de cierre.

---

## Menores

### m-1 · Tabla de decisiones cerradas duplicada en el backlog *(corregido)*

Once filas repetidas: D-18, D-20, D-21, D-6, D-7, D-9, D-17, D-11, D-12, D-13, D-14. Error de copiado. Quedan 16 decisiones cerradas únicas.

### m-2 · Cuatro archivos duplicados en la raíz del proyecto *(corregido)*

`backlog.md`, `epicas.md`, `portal-people-service.md` y `ESPECIFICACION-CONSOLIDADA.md` existían en la raíz **byte a byte idénticos** a los de `docs/`, más un árbol `mnt/user-data/outputs/` de una exportación. Movidos a `_papelera/`, no borrados.

### m-3 · `estado-documental.sh` reporta 58 historias sin AC — es un bug del script *(abierto, es del plugin)*

`scripts/estado-documental.sh:46` usa `grep -qE '(Dado que|Given)'`, pero las historias escriben `**Dado** que` con los marcadores de negrita entre medio. **Las 58 tienen AC completos en Given/When/Then** — verificado historia por historia.

El mismo script cuenta `CLAUDE.md` como documento: la línea 22 filtra `-not -name '_*'`, que excluye `_README.md` pero no el `CLAUDE.md` scoped que el propio instalador deja en cada subdirectorio. Por eso reporta «PRD: 2 documento(s)» y «Priorización: 2 sesión(es)» donde hay uno de cada. El comando `trycore-spec status` cuenta bien; el fallo es solo del script suelto.

Ambos son del paquete `@trycore/spec-product-flow` v0.4.0, no de este proyecto.

### m-4 · El PRD no pasa `lint-prd.sh` — seis falsos positivos y dos huecos reales *(abierto)*

El lint busca headers literales. Seis son diferencias de nombre, no ausencias:

| Busca | El PRD tiene |
|---|---|
| Introducción | §1 Resumen ejecutivo |
| Historias de Usuarios | §5 Usuarios y personas |
| Características / Funcionalidades | §7 Requisitos funcionales |
| Requisitos Técnicos | §8 Requisitos no funcionales |
| Planificación | §9 Alcance y fases · Anexo A |
| Apéndices / Recursos | Anexo A · Anexo B |

**Dos son huecos reales:**

- **Componentes principales y sitemap** — el PRD no tiene mapa de navegación del sistema. Los 11 flows recién escritos lo cubren parcialmente, pero no hay sitemap.
- **Criterios de aceptación a nivel producto** — las 58 historias tienen AC; el PRD no define qué significa «done» para el producto completo.

---

### m-5 · ~~Tres historias exceden el máximo de escenarios~~ — resuelto el 2026-09-22

`METODOLOGIA.md` §4 es explícita: *«Toda historia tiene 3-5 escenarios (no más; si necesitas más, la historia es muy grande)»*. El tope no es una regla de formato — es un **detector de tamaño**.

Se dividieron las cuatro historias que lo excedían. **Ninguna de las 80 historias queda fuera del rango 3-5.**

| Original | AC | División |
|---|---|---|
| **HU-086** Importación masiva | 8 | **HU-086** pegar y previsualizar · **HU-141** confirmar con el modo correcto · **HU-142** corregir lo que falló |
| **HU-089** Catálogos | 6 | **HU-089** crear valores · **HU-143** retirar y fusionar |
| **HU-122** Enlace curado | 6 | **HU-122** generar · **HU-144** abrir |
| **HU-131** Evidencia asistida | 3 | **HU-131** adjuntar · **HU-140** derivar *(dividida el 21-sep por complejidad, no por AC)* |

**HU-086 y HU-089 ya traían su propio corte propuesto** en la tabla INVEST —*«si no cabe, se parte»*—. HU-122 no: su tabla marcaba la S como cumplida. Lo que la delató fueron **dos happy paths con actores distintos**: Talento Humano generando el enlace y el cliente abriéndolo. Ese es el corte natural, y el conteo de escenarios fue lo único que lo hizo visible.

**Hallazgo del ejercicio: dividir bajó el backlog de 177 a 173 pts.** Tres de las cuatro pesaron menos al partirse. La complejidad L no medía trabajo: medía **desconocimiento**. Una historia que hace cuatro cosas se estima cara porque nadie sabe cuál de las cuatro duele; al separarlas aparece que tres eran pequeñas. La excepción fue HU-131, que subió — ahí sí había una parte genuinamente cara escondida detrás de una barata.

## Cobertura, después de la realineación

| Eje | Resultado |
|---|---|
| Objetivos O1–O5 → épicas | ✓ los 5 cubiertos, sin huérfanos |
| RF-1 a RF-19 → épicas | ✓ los 19 cubiertos |
| Historias escritas → mapa | ✓ las 58 mapeadas |
| Historias → backlog | ✓ las 58 en la tabla |
| Historias con AC en G/W/T | ✓ 58 de 58 |
| HU por épica → flow | ✓ 11 de 11 flows completos (HU-079 descartada, justificada) |
| Arcos de flow → AC real | ✓ anotación `%% HU-XXX` 1:1 |
| Historias priorizadas | ✓ 57 activas, las 4 del cuadrante caro señaladas |

**Sin cobertura:** las ~30 historias anticipadas que nunca se redactaron, concentradas en EP-006 (panel), EP-003 (ficha y evidencia), EP-004 (Mi equipo) y EP-002 (sondeo RF-10 y espacio no-perfil RF-11).

---

## Acciones recomendadas, en orden

1. **Resolver HU-078 / HU-110.** Una decisión, cinco minutos, y el backlog deja de contar doble.
2. **Cerrar D-8.** Define si EP-006 entra completa al MVP y desbloquea 11 pts.
3. **Escribir las historias de EP-006.** Sin ellas O5 no tiene backlog y el MVP no se sostiene.
4. **Cerrar D-16 y D-19.** Liberan HU-073 y HU-084.
5. **Escribir el núcleo de EP-004** (RF-4: sumar, quitar, contador, recuperar).
6. **Añadir al PRD** el sitemap y los criterios de aceptación a nivel producto.
7. **Correr `/trycore:revisar`** tras reiniciar Claude Code, para la segunda opinión de los 8 agentes en contexto limpio.
8. **Reportar al plugin** el bug de `estado-documental.sh:46`.
