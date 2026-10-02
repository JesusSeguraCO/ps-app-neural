---
id: HU-171
titulo: "Ver el tablero mensual de medición"
epica: EP-008
prioridad: alta
complejidad: M
estado: draft
fase: telemetria-y-medicion
prd_version: 4.17
depende_de: [HU-167]
---

# HU-171 — Ver el tablero mensual de medición

**Como** Dirección de Mercadeo, que responde ante Dirección General por los objetivos del portal,
**quiero** abrir en el panel el tablero de un mes con la conversión, los perfiles por solicitud, el acierto de la curaduría y las diez búsquedas sin resultados más repetidas, cada indicador junto a su meta,
**para** reportar cada mes si el portal cumple sin que nadie tenga que sacar los datos a mano.

## Criterios de aceptación

### Happy path — el mes cerrado está listo sin trabajo manual

**Dado** que terminó un mes con visitas y solicitudes de clientes, y de una de esas solicitudes nunca llegó el evento «solicitud enviada»,
**cuando** abro el tablero de ese mes en Medición,
**Entonces** veo la conversión (solicitudes enviadas entre cuentas que abrieron el portal) junto a la meta del 20 %, las cuentas con al menos una solicitud y los perfiles promedio por solicitud junto a la meta de 1,8
**Y** la solicitud sin evento cuenta igual en la conversión y en los perfiles por solicitud, porque el tablero las toma de las solicitudes registradas
**Y** nadie tuvo que cargar, exportar ni calcular nada para que aparezcan

### Edge case — los paneles de acierto y de búsquedas sin resultados aún no existen

**Dado** que el cálculo del acierto de la curaduría (HU-109) y el del top 10 de búsquedas sin resultados (HU-172) todavía no están construidos,
**cuando** abro el tablero de un mes cerrado,
**Entonces** sus dos paneles aparecen con su meta (70 % de acierto; top 10) y el rótulo «aún no se mide»
**Y** la conversión y los perfiles por solicitud se muestran completos, sin esperar a esos dos paneles

### Error — mes sin actividad

**Dado** que en el mes ninguna cuenta abrió el portal,
**cuando** abro su tablero,
**Entonces** cada indicador dice «sin dato en este período»
**Y** ninguno muestra 0 % como si fuera un resultado

### Edge case — mes en curso

**Dado** que el mes todavía no termina,
**cuando** abro su tablero,
**Entonces** los indicadores aparecen rotulados como parciales, con la fecha y la hora hasta las que cuentan

### Edge case — las visitas internas quedan fuera

**Dado** que en el mes hubo visitas de personas de Trycore además de las de clientes,
**cuando** abro el tablero,
**Entonces** los indicadores cuentan solo las visitas de clientes
**Y** el tablero dice cuántas visitas internas dejó fuera

## Notas

Es la **métrica de éxito de EP-008**: *el tablero mensual reporta conversión, acierto de la curaduría y el top 10 de búsquedas sin resultados sin intervención manual*. Reúne los KPI de §11 cuya fuente es la telemetría o el portal: conversión (O2, meta ≥ 20 %), perfiles promedio por solicitud (meta ≥ 1,8, que es también la métrica de EP-004), acierto de la curaduría (meta ≥ 70 %, calculado en HU-109) y búsquedas sin resultados (top 10, calculado en HU-172). Vive en el destino **Medición** del menú del panel, hoy deshabilitado hasta que se construya esta épica.

**Revisión 2026-10-02 (validador independiente: fallaba la I).** El tablero dependía de HU-109 y HU-172 para existir. Ahora entrega por sí solo sus indicadores propios (conversión, cuentas con solicitud y perfiles por solicitud) y muestra los paneles de acierto y de top 10 en estado «aún no se mide» hasta que esas dos historias estén construidas; cuando lo estén, los paneles se llenan sin cambiar el tablero. **No es recorte**: los cinco indicadores siguen en el alcance; solo cambia el orden en que pueden construirse. Para no pasar de cinco escenarios, la solicitud cuyo evento se perdió pasa del edge propio al happy path, con el mismo resultado observable.

**Las métricas comerciales no se duplican.** Oportunidades creadas, tasa de cierre y días hasta la alineación se leen en HubSpot (ADR-0006, ADR-0005); el portal solo guarda el vínculo solicitud ↔ negocio.

**Dependencias de datos.** Las solicitudes las crea EP-005; sin ellas la conversión, los perfiles por solicitud y el acierto dicen «aún no se mide». Las consultas sin coincidencia llegan con EP-002. El tablero se construye y prueba con datos fijados del contrato de HU-167.

**Conflicto que hay que resolver antes del DoR.** El backlog (fila HU-059–HU-064) y el flow de EP-008 dicen «MVP · tablero en v1.1» y que el primer trimestre los datos se leerán a mano; la métrica de éxito de la épica exige el tablero mensual **sin intervención manual**. Esta historia redacta el tablero completo sin recortar; en qué línea de release entra lo decide el sponsor.

**Abierto para el sponsor:**
- **Definición de conversión.** O2 (§3) es «solicitudes enviadas / cuentas que abrieron el portal»; el KPI de §11 se llama «conversión visita → solicitud». El AC usa la de O2 por ser la del objetivo. Falta también decidir en qué mes cuenta una solicitud de una cuenta que abrió el portal el mes anterior.
- **Quién ve el tablero.** ADR-0006 lo da al rol observador o superior; RF-8.1.2 enumera lo que consulta el observador (inventario, enlaces, colocados, demanda, cobertura) y no nombra la medición. ¿Lo ven también Comercial y Talento Humano?
- Si el KPI «cuentas que envían al menos una solicitud ≥ 35 % de las cuentas contactadas» (trimestral) y «solicitudes con contexto completo ≥ 85 %» (O4, fuente portal) deben estar también en el tablero; el primero necesita las ediciones con salida registrada de EP-011.
- La exclusión de visitas internas es la propuesta por defecto de ADR-0006, pendiente de **T-26**.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · §3 O2 · §11 KPIs · RF-7.2 · RF-7.4 · métrica de éxito de EP-008 y de EP-004 · ADR-0006 (UC-17, QA-6) · depende de HU-167 · muestra los cálculos de HU-109 y HU-172 cuando existan

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ solo depende de la captura de HU-167; se construye y entrega antes o después de HU-109 y HU-172, cuyos paneles muestra en «aún no se mide» hasta que existan; las solicitudes llegan con EP-005 y hasta entonces el tablero lo declara |
| N | Negociable | ✓ fija los indicadores, sus metas del PRD, el cierre automático y los estados sin dato, parcial y «aún no se mide»; la disposición del tablero y su visualización son del equipo |
| V | Valiosa | ✓ es el informe que Mercadeo lleva a Dirección General cada mes y lo que hace cumplir la métrica de la épica |
| E | Estimable | ✓ M: pantalla de Medición en el panel, consulta de conversión y perfiles por solicitud sobre las solicitudes, y dos paneles que muestran los cálculos de HU-109 y HU-172 o «aún no se mide» |
| S | Pequeña | ✓ M: una pantalla con cinco escenarios; el acierto y el top 10 se calculan en sus propias historias |
| T | Testeable | ✓ meses fijados con actividad (incluida una solicitud sin evento), sin actividad, en curso y con visitas internas, y un entorno sin HU-109 ni HU-172, dan cifras y rótulos observables |
