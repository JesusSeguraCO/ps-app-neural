---
id: HU-172
titulo: "Ver las diez búsquedas sin resultados más repetidas del mes"
epica: EP-008
prioridad: alta
complejidad: S
estado: draft
fase: telemetria-y-medicion
prd_version: 4.17
depende_de: [HU-167]
---

# HU-172 — Ver las diez búsquedas sin resultados más repetidas del mes

**Como** administradora de inventario de Talento Humano, que decide a quién sumar al banco,
**quiero** ver cada mes las diez consultas sin coincidencia más repetidas, con las palabras del cliente y cuántas cuentas las hicieron,
**para** priorizar el reclutamiento según lo que más piden las cuentas y no según la última búsqueda fallida que recuerdo.

## Criterios de aceptación

### Happy path — el top 10 del mes

**Dado** que en el mes hubo consultas de clientes sin coincidencia directa,
**cuando** abro el top 10 de ese mes,
**Entonces** veo las diez consultas más repetidas con su texto, cuántas veces se hicieron y cuántas cuentas distintas las hicieron
**Y** las variantes que solo difieren en acentos, mayúsculas o plurales cuentan como una misma consulta

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

## Notas

Cubre la **segunda mitad de RF-7.2** en su forma de **reporte mensual** —el KPI de §11 *«Búsquedas sin resultados: reportar top 10, mensual, telemetría»*— y el tercer indicador de la métrica de éxito de EP-008. El top 10 aparece en el tablero de HU-171.

**Se distingue de HU-078 (EP-010).** HU-078 es el **registro de demanda**: cada búsqueda fallida con su especificación estructurada completa, su cuenta y si terminó en solicitud dirigida, que Talento Humano revisa mensualmente (D-13). Esta historia es el **agregado**: qué consultas se repiten más y en cuántas cuentas. Una sirve para leer caso por caso; la otra, para ordenar prioridades. Mismo dueño (D-13), misma fuente.

**Fuente única.** El texto vive una sola vez en `operacion.consultas_sin_coincidencia` (ADR-0004, ADR-0006 H43), que ya aplica el enmascarado de correos, teléfonos y nombres del inventario; el evento solo guarda el identificador de la consulta. Lo crea EP-002 al registrar la consulta sin coincidencia (RF-2.6.3); hasta entonces el top 10 dice «aún no se mide». La normalización es la misma del intérprete determinista (RF-2.6). Las visitas internas no cuentan (HU-167). Es insumo directo de V2-1 (reclutamiento inverso).

**Abierto para el sponsor:**
- **Orden del top 10:** por número de veces (el AC lo muestra así por omisión) o por número de cuentas distintas, para que una sola cuenta que insiste no ocupe el primer lugar.
- Si basta con HU-078 y esta historia se funde con ella, o si el tablero mensual necesita el agregado propio (esta redacción lo mantiene: es lo que pide el KPI).
- Cómo se desempata el décimo lugar.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-7.2 (búsquedas sin resultados) · RF-2.6.3 · §11 KPI · V2-1 · D-13 · ADR-0004, ADR-0006 (H43) · relacionada con HU-078 · depende de HU-167

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: lee la tabla de consultas sin coincidencia que crea EP-002; se construye y prueba con consultas fijadas y declara «aún no se mide» mientras no haya captura |
| N | Negociable | ✓ fija qué se cuenta, la agrupación por normalización y el enmascarado; el orden y la presentación quedan abiertos |
| V | Valiosa | ✓ convierte las búsquedas fallidas en una lista corta de prioridades de reclutamiento |
| E | Estimable | ✓ S: una consulta agregada por mes con la normalización ya existente y una vista en Medición |
| S | Pequeña | ✓ S: una lectura en cuatro escenarios |
| T | Testeable | ✓ un mes con consultas repetidas en variantes de acento y plural, un mes vacío, uno con cuatro consultas y una con correo dan resultados observables |
