---
id: HU-111
titulo: "Comparar la ruta de instrucción con la de filtros"
epica: EP-008
prioridad: media
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-167, HU-110]
---

# HU-111 — Comparar la ruta de instrucción con la de filtros

**Como** Dirección de Mercadeo, responsable de producto del portal,
**quiero** comparar las visitas que entran por instrucción con las que entran por filtros, y ver qué parte de las primeras termina filtrando,
**para** decidir con datos reales, al cierre del primer trimestre, si la ruta de instrucción se sostiene según la regla de §14.7.

## Criterios de aceptación

### Happy path — la comparación por ruta

**Dado** que en el período hubo visitas de clientes por las dos rutas,
**cuando** abro la comparación de rutas,
**Entonces** veo para cada ruta el tiempo hasta el primer perfil abierto, las fichas abiertas y las solicitudes enviadas
**Y** veo cuántas visitas tiene cada ruta

### Happy path — la regla de retirada de RF-14.2

**Dado** que hubo visitas que entraron por instrucción,
**cuando** abro la comparación de rutas,
**Entonces** veo qué proporción de ellas aplicó filtros después de la instrucción
**Y** si supera la mitad, la lectura dice que se cumple la condición de retirada de RF-14.2

### Error — no hay mínimo de visitas para dar la comparación por concluyente

**Dado** que no se ha fijado cuántas sesiones reales hacen falta para que la comparación cuente, y la decisión de §14.7 se toma en la revisión trimestral,
**cuando** abro la comparación de rutas,
**Entonces** la comparación aparece rotulada como lectura descriptiva para la revisión trimestral, con el número de sesiones reales de cada ruta
**Y** no se presenta como concluyente

### Edge case — la misma visita usa las dos

**Dado** que una visita escribe una instrucción y después filtra,
**cuando** se clasifica,
**Entonces** cuenta en la ruta de instrucción, como uso posterior de filtros
**Y** no se cuenta además en la ruta de filtros

### Edge case — la segunda condición de retirada de §14.7

**Dado** que en el trimestre Talento Humano registró en Demanda (HU-189) el número de decisiones de reclutamiento tomadas a partir del registro de demanda que dice la tabla,
**cuando** abro la comparación de rutas al cierre del trimestre,
**Entonces** la lectura de la segunda condición de §14.7 dice lo que indica la tabla

| Decisiones de reclutamiento registradas en el trimestre | La lectura dice |
|---|---|
| 0 | «se cumple la segunda condición de retirada: el registro de demanda no produjo ninguna decisión» |
| 1 | «no se cumple la segunda condición», con la decisión registrada y su fecha |

## Notas

Cubre **RF-7.1** como comparación entre rutas, la prueba de falsación de **RF-14.2** (*si más de la mitad de las sesiones usan filtros después de una consulta por instrucción, la jerarquía está mal*) y la **revisión con telemetría real al cierre del primer trimestre** de **§14.7** (D-17). Vistas `v_ruta_entrada`, `v_filtros_tras_instruccion` y `v_tiempo_primer_perfil` de ADR-0006. El orden instrucción → filtro sale del contador de la visita, no del reloj. Solo cuentan las **sesiones reales** (D68, sponsor 2026-10-02): código verificado de un correo que no es `@trycore.com`, por un enlace que no se generó con la casilla «demo» (HU-188); las internas y las demo quedan fuera (HU-167). Es la definición de «sesiones reales» que usa §14.7.

**Fuente.** La ruta la determinan los eventos de EP-002 (filtros) y EP-009 (instrucción); las solicitudes, EP-005. Mientras no emitan, la comparación dice «aún no se mide».

**Línea de release: MVP** (D66, sponsor 2026-10-02), no v1.1. La revisión de §14.7 ocurre al cierre del primer trimestre, así que la lectura tiene que existir para esa fecha. El mapa de historias y el backlog todavía dicen v1.1: hay que actualizarlos.

**Se distingue de HU-110** (qué facetas se usan) y de **HU-173** (sugerencias sin editar dentro de la ruta de instrucción) y **HU-186** (experimento del Perfil Objetivo).

**Visita mixta.** Cuenta como ruta de instrucción con uso posterior de filtros (ADR-0006), que es lo que mide RF-14.2. El flow de EP-008 quedó alineado el 2026-10-02 (antes decía «se atribuye a la que produjo la solicitud»).

**Decisiones del sponsor (2026-10-02).**
- **D68 (T-26):** «sesión real» es la de código verificado de un correo que no es `@trycore.com`, fuera de los enlaces demo. **No fija** un mínimo de sesiones ni de cuentas distintas, así que la lectura sigue rotulada como descriptiva y la decisión la toma el equipo en la revisión trimestral (error).
- **D73:** las decisiones de reclutamiento de la **segunda condición de retirada** de §14.7 las **registra Talento Humano en el panel**. Esta historia las lee (último edge) y aplica la condición; mientras el registro no exista, esa parte de la lectura dice «aún no se mide».

**Hueco cerrado por D83** (sponsor, 2026-10-02, segunda ronda). La pantalla en la que Talento Humano registra una decisión de reclutamiento (qué búsquedas del registro de demanda la motivaron, qué se decidió, fecha) es **HU-189**, en EP-008, en el destino **Demanda** del panel. Esta historia **lee** esas decisiones (último edge): cuenta las no anuladas del trimestre, una vez cada una aunque enlace varias búsquedas. Mientras HU-189 no esté construida, esa parte de la lectura dice «aún no se mide»; no es dependencia dura.

**Quién la ve (D74).** La comparación vive en Medición: la abre quien tenga el permiso «Medición» (HU-190), sea cual sea su rol; la negación con explicación la prueba HU-171.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-7.1 · RF-14.2 · §14.7 (D-17) · ADR-0006 (`v_ruta_entrada`, `v_filtros_tras_instruccion`, `v_tiempo_primer_perfil`) · T-26 · D66, D68 y D73 (sponsor, 2026-10-02) · D74 y D83 (segunda ronda) · lee las decisiones de HU-189 · relacionada con HU-074, HU-110, HU-173, HU-186 y HU-190 · depende de HU-167 y HU-110

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: reutiliza la separación de HU-110 y la captura de HU-167; los datos reales llegan con EP-002 y EP-009, y las decisiones de reclutamiento con HU-189 (D83; mientras no esté construida, esa condición dice «aún no se mide») |
| N | Negociable | ✓ fija las medidas, las dos condiciones de §14.7 y la clasificación de la visita mixta; la presentación es negociable y el mínimo de sesiones sigue abierto (D68 no lo fija) |
| V | Valiosa | ✓ es la lectura que aplica la regla asimétrica de D-17 con datos reales; sin ella la revisión trimestral no tiene con qué hacerse |
| E | Estimable | ✓ M: clasificación de la visita por ruta según la secuencia, tiempo hasta el primer perfil, proporción de filtros tras instrucción y un conteo trimestral de decisiones registradas |
| S | Pequeña | ✓ M: una comparación con las dos condiciones de §14.7 en cinco escenarios; registrar las decisiones queda fuera, en HU-189 |
| T | Testeable | ✓ visitas fijadas por instrucción, por filtros y mixtas, con tiempos y solicitudes conocidos, y trimestres fijados con 0 y 1 decisiones registradas, dan cifras y rótulos esperados |
