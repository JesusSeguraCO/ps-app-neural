---
id: HU-111
titulo: "Comparar la ruta de instrucción con la de filtros"
epica: EP-008
prioridad: media
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.17
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

### Error — no hay criterio para dar la comparación por buena

**Dado** que no se ha fijado cuántas visitas hacen falta para que la comparación cuente,
**cuando** abro la comparación de rutas,
**Entonces** la comparación aparece rotulada como lectura descriptiva, con el número de visitas de cada ruta
**Y** no se presenta como concluyente

### Edge case — la misma visita usa las dos

**Dado** que una visita escribe una instrucción y después filtra,
**cuando** se clasifica,
**Entonces** cuenta en la ruta de instrucción, como uso posterior de filtros
**Y** no se cuenta además en la ruta de filtros

## Notas

Cubre **RF-7.1** como comparación entre rutas, la prueba de falsación de **RF-14.2** (*si más de la mitad de las sesiones usan filtros después de una consulta por instrucción, la jerarquía está mal*) y la **revisión con telemetría real al cierre del primer trimestre** de **§14.7** (D-17). Vistas `v_ruta_entrada`, `v_filtros_tras_instruccion` y `v_tiempo_primer_perfil` de ADR-0006. El orden instrucción → filtro sale del contador de la visita, no del reloj. Las visitas internas no cuentan (HU-167).

**Fuente.** La ruta la determinan los eventos de EP-002 (filtros) y EP-009 (instrucción); las solicitudes, EP-005. Mientras no emitan, la comparación dice «aún no se mide».

**Línea de release:** el mapa de historias pone esta historia en **v1.1**. No es recorte. La revisión de §14.7 ocurre al cierre del primer trimestre, así que la lectura tiene que existir para esa fecha.

**Se distingue de HU-110** (qué facetas se usan) y de **HU-173** (sugerencias sin editar dentro de la ruta de instrucción) y **HU-186** (experimento del Perfil Objetivo).

**Discrepancia con el flow de EP-008.** El flow dice que la visita mixta «se atribuye a la que produjo la solicitud»; esta historia (y ADR-0006) la cuentan como ruta de instrucción con uso posterior de filtros, que es lo que mide RF-14.2. Hay que alinear el flow.

**Abierto para el sponsor:**
- **T-26:** qué es una «sesión real» para la regla del 50 % (actividad mínima, número mínimo de cuentas distintas). Hasta entonces el AC conservador rotula la lectura como descriptiva.
- La **segunda condición de retirada** de §14.7 —que el registro de demanda no produzca ninguna decisión de reclutamiento en el trimestre— no la mide la telemetría: ninguna historia registra hoy las decisiones de reclutamiento. ¿Dónde se registran?

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-7.1 · RF-14.2 · §14.7 (D-17) · ADR-0006 (`v_ruta_entrada`, `v_filtros_tras_instruccion`, `v_tiempo_primer_perfil`) · T-26 · relacionada con HU-074, HU-110, HU-173 y HU-186 · depende de HU-167 y HU-110

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: reutiliza la separación de HU-110 y la captura de HU-167; los datos reales llegan con EP-002 y EP-009 |
| N | Negociable | ✓ fija las medidas, la regla de RF-14.2 y la clasificación de la visita mixta; la presentación es negociable y la suficiencia queda abierta |
| V | Valiosa | ✓ es la lectura que aplica la regla asimétrica de D-17 con datos reales; sin ella la revisión trimestral no tiene con qué hacerse |
| E | Estimable | ✓ M: clasificación de la visita por ruta según la secuencia, tiempo hasta el primer perfil y proporción de filtros tras instrucción |
| S | Pequeña | ✓ M: una comparación en cuatro escenarios |
| T | Testeable | ✓ visitas fijadas por instrucción, por filtros y mixtas, con tiempos y solicitudes conocidos, dan cifras y rótulos esperados |
