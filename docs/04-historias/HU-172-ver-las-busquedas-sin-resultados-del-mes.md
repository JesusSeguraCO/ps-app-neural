---
id: HU-172
titulo: "Ver las diez búsquedas sin resultados más repetidas del mes"
epica: EP-008
prioridad: alta
complejidad: S
estado: lista
fase: telemetria-y-medicion
prd_version: 4.18
depende_de: [HU-167]
---

# HU-172 — Ver las diez búsquedas sin resultados más repetidas del mes

**Como** administradora de inventario de Talento Humano, que decide a quién sumar al banco,
**quiero** ver cada mes las diez consultas sin coincidencia más repetidas, con las palabras del cliente y cuántas cuentas las hicieron,
**para** priorizar el reclutamiento según lo que más piden las cuentas y no según la última búsqueda fallida que recuerdo.

## Criterios de aceptación

### Happy path — el top 10 del mes

**Dado** que en el mes hubo consultas de clientes sin coincidencia directa y entré al panel como administradora de inventario sin el permiso «Medición»,
**cuando** abro el top 10 de ese mes en el destino Demanda,
**Entonces** veo las diez consultas hechas por más cuentas distintas, ordenadas por ese número, con su texto, cuántas cuentas distintas las hicieron y cuántas veces se hicieron
**Y** las variantes que solo difieren en acentos, mayúsculas o plurales cuentan como una misma consulta
**Y** quien tiene el permiso «Medición» ve la misma lista, con las mismas cifras, en el tablero de Medición (HU-171)

### Error — mes sin consultas fallidas

**Dado** que en el mes no hubo consultas sin coincidencia,
**cuando** abro el top 10,
**Entonces** veo un mensaje que dice que no hubo búsquedas sin resultados en el período
**Y** no veo una lista vacía sin explicación

### Edge case — menos de diez consultas distintas

**Dado** que en el mes solo hubo cuatro consultas distintas sin coincidencia,
**cuando** abro el top 10,
**Entonces** veo esas cuatro, sin relleno
**Y** el encabezado dice que son cuatro, no diez

### Edge case — una consulta trae datos personales

**Dado** que un cliente escribió en su consulta un correo, un teléfono o el nombre de un profesional del banco,
**cuando** esa consulta aparece en el top 10,
**Entonces** esos datos aparecen enmascarados
**Y** nunca se muestran en claro

### Edge case — empate en el décimo lugar

**Dado** que en el mes la décima consulta por número de cuentas distintas empata con otras dos,
**cuando** abro el top 10,
**Entonces** veo las tres consultas empatadas, doce en total
**Y** el encabezado dice que hay un empate en el décimo lugar
**Y** una sola cuenta que repite muchas veces la misma consulta no la sube por encima de una consulta hecha por más cuentas

## Notas

Cubre la **segunda mitad de RF-7.2** en su forma de **reporte mensual** —el KPI de §11 *«Búsquedas sin resultados: reportar top 10, mensual, telemetría»*— y el tercer indicador de la métrica de éxito de EP-008. El top 10 aparece en el tablero de HU-171.

**Se distingue de HU-078 (EP-010).** HU-078 es el **registro de demanda**: cada búsqueda fallida con su especificación estructurada completa, su cuenta y si terminó en solicitud dirigida, que Talento Humano revisa mensualmente (D-13). Esta historia es el **agregado**: qué consultas se repiten más y en cuántas cuentas. Una sirve para leer caso por caso; la otra, para ordenar prioridades. Mismo dueño (D-13), misma fuente.

**Fuente única.** El texto vive una sola vez en `operacion.consultas_sin_coincidencia` (ADR-0004, ADR-0006 H43), que ya aplica el enmascarado de correos, teléfonos y nombres del inventario; el evento solo guarda el identificador de la consulta. Lo crea EP-002 al registrar la consulta sin coincidencia (RF-2.6.3); hasta entonces el top 10 dice «aún no se mide». La normalización es la misma del intérprete determinista (RF-2.6). Las visitas internas no cuentan (HU-167). Es insumo directo de V2-1 (reclutamiento inverso).

**Resuelto por el sponsor (D73, 2026-10-02), opción conservadora:** el top 10 se ordena por **cuentas distintas** —una cuenta que insiste no ocupa el primer lugar— y, si hay empate en el décimo lugar, **se muestran todos los empatados** (edge nuevo). El número de veces se sigue mostrando como dato.

**Sesiones reales (D68).** Solo cuentan las consultas de sesiones reales: código verificado de un correo que no es `@trycore.com`, por un enlace sin la casilla «demo» (HU-188).

**Conflicto con D67 resuelto por D82 y D74** (sponsor, 2026-10-02, segunda ronda). D67 dejaba a Talento Humano sin Medición, donde vivía el top 10. **D82**: el top 10 se ve en **Medición y también en el destino «Demanda»** para Talento Humano, junto al registro de demanda de HU-078 (D-13). **D74** cambia además el mecanismo: Medición la abre quien tenga el **permiso «Medición»** (HU-190), no un rol; Demanda la ve Talento Humano con su rol, con o sin ese permiso. El happy path lo prueba en Demanda sin el permiso y fija que Medición muestra la misma lista. **Una sola consulta agregada, dos vistas**: no hay dos cálculos que puedan discrepar. Los demás escenarios valen igual en las dos vistas.

**Lo que se hace con el top 10** —una decisión de reclutamiento a partir de una búsqueda— se registra en Demanda con **HU-189** (D83).

**Abierto para el sponsor:**
- Si basta con HU-078 y esta historia se funde con ella, o si el tablero mensual necesita el agregado propio (esta redacción lo mantiene: es lo que pide el KPI).

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-7.2 (búsquedas sin resultados) · RF-2.6.3 · §11 KPI · V2-1 · D-13 · ADR-0004, ADR-0006 (H43) · D67, D68 y D73 (sponsor, 2026-10-02) · D74, D82 y D83 (segunda ronda) · relacionada con HU-078, HU-171 (panel del top 10), HU-189 (decisiones en Demanda) y HU-190 (permiso «Medición») · depende de HU-167

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: lee la tabla de consultas sin coincidencia que crea EP-002; se construye y prueba con consultas fijadas y declara «aún no se mide» mientras no haya captura |
| N | Negociable | ✓ fija qué se cuenta, el orden por cuentas distintas y el empate (D73), la agrupación por normalización y el enmascarado; la presentación es negociable |
| V | Valiosa | ✓ convierte las búsquedas fallidas en una lista corta de prioridades de reclutamiento, y su actor (Talento Humano) la ve donde trabaja la demanda (D82) |
| E | Estimable | ✓ S: una consulta agregada por mes con la normalización ya existente, orden por cuentas distintas con empates y dos vistas de la misma consulta (Demanda y el panel del tablero de Medición, D82) |
| S | Pequeña | ✓ S: una lectura en cinco escenarios |
| T | Testeable | ✓ una sesión de Talento Humano sin el permiso «Medición» en Demanda y una con el permiso en Medición sobre los mismos datos, un mes con consultas repetidas en variantes de acento y plural, un mes vacío, uno con cuatro consultas, uno con tres empatadas en el décimo lugar, una cuenta que repite su consulta y una consulta con correo dan resultados observables |
