---
id: HU-173
titulo: "Saber si la entrada por instrucción capta la demanda o la dicta"
epica: EP-008
prioridad: media
complejidad: S
estado: draft
fase: telemetria-y-medicion
prd_version: 4.17
depende_de: [HU-167]
---

# HU-173 — Saber si la entrada por instrucción capta la demanda o la dicta

**Como** Dirección de Mercadeo, responsable de producto del portal,
**quiero** ver qué parte de las instrucciones que envían los clientes son sugerencias del portal aceptadas sin editar, cuáles son sugerencias editadas y cuáles escribió el cliente,
**para** aplicar con datos reales la prueba que falsea RF-12.1 y saber si la demanda registrada es del cliente o inducida por nosotros.

## Criterios de aceptación

### Happy path — de dónde vienen las instrucciones

**Dado** que en el período los clientes enviaron instrucciones,
**cuando** abro la lectura de instrucciones en Medición,
**Entonces** veo qué proporción fueron sugerencias enviadas sin editar, sugerencias editadas e instrucciones escritas por el cliente, con el número de instrucciones de cada tipo
**Y** la lectura señala cuando las sugerencias sin editar superan el 60 %, que según RF-12.1 indica que el portal dicta la demanda en vez de captarla

### Edge case — el límite del 60 %

**Dado** que la proporción de sugerencias enviadas sin editar es la de la tabla,
**cuando** abro la lectura de instrucciones,
**Entonces** la señal de RF-12.1 aparece según la tabla

| Sugerencias sin editar | Señal «el portal dicta la demanda» |
|---|---|
| 60 % | no aparece |
| 61 % | aparece |

### Edge case — una sugerencia retocada

**Dado** que un cliente tomó una sugerencia y cambió una palabra antes de enviarla,
**cuando** abro la lectura de instrucciones,
**Entonces** esa instrucción cuenta como sugerencia editada
**Y** no cuenta como sugerencia sin editar

### Error — la instrucción todavía no se emite

**Dado** que el portal aún no emite el evento «instrucción enviada» porque la entrada por instrucción no existe,
**cuando** abro la lectura de instrucciones,
**Entonces** la lectura dice «aún no se mide» y nombra la épica que debe emitirlo
**Y** no muestra 0 % ni la señal de RF-12.1

## Notas

Cubre la prueba de falsación de **RF-12.1** (*si más del 60 % de las consultas son sugerencias enviadas sin editar, no estamos captando demanda, la estamos dictando*). Vista `v_falsacion_sugerencias` de ADR-0006.

**Partición 2026-10-02, no recorte** (validador independiente: fallaba la S, dos capacidades). La comparación A/B con y sin Perfil Objetivo (RF-13.1) que estaba aquí pasa entera a **HU-186**, también en EP-008. Esta historia se queda con la proporción de sugerencias; baja de M a S.

**De dónde salen los datos.** EP-009 emite `instruccion_enviada` con su origen (sugerencia sin editar, editada o libre). Esta historia define y construye la lectura sobre el contrato de HU-167, probada con eventos fijados; mientras EP-009 no emita, dice «aún no se mide». El origen de la instrucción lo declara el navegador (riesgo aceptado en ADR-0006).

**Se distingue de HU-111**, que compara la ruta de instrucción con la de filtros y aplica la regla de RF-14.2; esta mira dentro de la ruta de instrucción.

**Sesiones reales (D68, sponsor 2026-10-02).** Solo cuentan las instrucciones de sesiones reales: código verificado de un correo que no es `@trycore.com`, por un enlace sin la casilla «demo» (HU-188). D68 cierra qué es una sesión real, pero no fija un mínimo de instrucciones.

**Abierto para el sponsor:** si las sugerencias sin editar deben contarse por instrucción (propuesta del AC) o por visita; y si la señal debe esperar a un mínimo de instrucciones antes de aparecer (lo que queda de **T-26** tras D68).

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-12.1 · ADR-0006 (eventos de falsación, `v_falsacion_sugerencias`) · T-26 · D68 (sponsor, 2026-10-02) · partida con HU-186 · relacionada con HU-111 · depende de HU-167

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: lectura sobre el contrato de HU-167, probada con eventos fijados; no depende de HU-186; los datos reales llegan con EP-009 y hasta entonces lo declara |
| N | Negociable | ✓ fija los tres orígenes y el umbral del 60 % del PRD; el diseño de la lectura y la unidad de conteo son negociables |
| V | Valiosa | ✓ dice si la demanda que registra el portal es del cliente o la estamos dictando, que es la prueba de permanencia de RF-12.1 |
| E | Estimable | ✓ S: una consulta de proporciones sobre un evento con carga cerrada y un umbral |
| S | Pequeña | ✓ S: una sola lectura en cuatro escenarios |
| T | Testeable | ✓ instrucciones fijadas sin editar, editadas y libres, proporciones fijadas en 60 % y 61 % y un contrato sin el evento dan proporciones y señales esperadas |
