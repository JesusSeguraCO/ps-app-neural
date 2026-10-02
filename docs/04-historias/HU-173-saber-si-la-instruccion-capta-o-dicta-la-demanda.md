---
id: HU-173
titulo: "Saber si la entrada por instrucción capta la demanda o la dicta"
epica: EP-008
prioridad: media
complejidad: M
estado: draft
fase: telemetria-y-medicion
prd_version: 4.17
depende_de: [HU-167]
---

# HU-173 — Saber si la entrada por instrucción capta la demanda o la dicta

**Como** Dirección de Mercadeo, responsable de producto del portal,
**quiero** ver qué parte de las instrucciones son sugerencias enviadas sin editar y cómo rinde la variante con Perfil Objetivo frente a la que no lo tiene,
**para** aplicar con datos reales las pruebas que falsean RF-12.1 y RF-13.1, en lugar de apoyarme en tres sesiones con el prototipo.

## Criterios de aceptación

### Happy path — de dónde vienen las instrucciones

**Dado** que en el período los clientes enviaron instrucciones,
**cuando** abro la lectura de instrucciones,
**Entonces** veo qué proporción fueron sugerencias enviadas sin editar, sugerencias editadas e instrucciones escritas por el cliente
**Y** la lectura señala cuando las sugerencias sin editar superan el 60 %, que según RF-12.1 indica que el portal dicta la demanda en vez de captarla

### Edge case — una sugerencia retocada

**Dado** que un cliente tomó una sugerencia y cambió una palabra antes de enviarla,
**cuando** se clasifica su instrucción,
**Entonces** cuenta como sugerencia editada
**Y** no cuenta como sugerencia sin editar

### Happy path — la comparación con y sin Perfil Objetivo

**Dado** que hay un experimento activo con una variante con Perfil Objetivo y otra sin él,
**cuando** abro la lectura del experimento,
**Entonces** veo para cada variante el tiempo hasta el primer perfil abierto y la tasa de solicitud
**Y** veo cuántas unidades del experimento hay en cada variante

### Error — el experimento no tiene criterio de decisión

**Dado** que no se ha fijado el criterio estadístico del experimento,
**cuando** abro la lectura del experimento,
**Entonces** los resultados se muestran rotulados como «lectura descriptiva, sin criterio de decisión fijado»
**Y** la lectura no declara ninguna variante ganadora

## Notas

Cubre las pruebas de falsación que el PRD asigna a la telemetría en la entrada por instrucción: **RF-12.1** (*si más del 60 % de las consultas son sugerencias enviadas sin editar, no estamos captando demanda, la estamos dictando*) y **RF-13.1** (*medición A/B de tiempo hasta el primer perfil abierto, con y sin Perfil Objetivo; si el tiempo sube y la tasa de solicitud no, el patrón está mal aplicado*; es condición de permanencia). Es también la medida de la **métrica de éxito de EP-009** (tiempo hasta el primer perfil abierto igual o menor que con facetas, con tasa de solicitud igual o mayor). Vistas `v_falsacion_sugerencias`, `v_perfil_objetivo_ab` y `v_tiempo_primer_perfil` de ADR-0006.

**De dónde salen los datos.** EP-009 emite `instruccion_enviada` (con su origen: sugerencia sin editar, editada o libre) y `perfil_objetivo_editado`, y asigna la variante en el servidor al abrir la sesión (`operacion.experimentos`); EP-005 crea las solicitudes. Esta historia define y construye las lecturas sobre el contrato de HU-167; mientras EP-009 no emita, dicen «aún no se mide». El origen de la instrucción lo declara el navegador (riesgo aceptado en ADR-0006).

**Se distingue de HU-111**, que compara la ruta de instrucción con la de filtros y aplica la regla de RF-14.2; esta mira dentro de la ruta de instrucción y del experimento del Perfil Objetivo.

**Abierto para el sponsor:**
- **T-25:** umbral de decisión, ventana, muestra mínima y **unidad de asignación** (la cuenta es la propuesta por defecto de ADR-0006) del experimento, y qué hacer si al cierre no hay potencia. Con decenas de cuentas probablemente no la haya; hasta que se fije, el AC conservador es la lectura descriptiva.
- Quién **activa y configura** el experimento en el panel (la tabla `operacion.experimentos` admite escritura del panel, pero ninguna historia lo cubre todavía).
- Si las sugerencias sin editar deben contarse por instrucción o por visita.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-12.1 · RF-13.1 · métrica de éxito de EP-009 · ADR-0006 (eventos de falsación, variante en servidor, H32) · T-25 · relacionada con HU-111 y HU-078 · depende de HU-167

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: lecturas sobre el contrato de HU-167, probadas con eventos fijados; los datos reales llegan con EP-009 y hasta entonces lo declaran |
| N | Negociable | ✓ fija las proporciones, el umbral del 60 % que da el PRD y el rótulo descriptivo sin criterio; el diseño de la lectura es negociable |
| V | Valiosa | ✓ decide si la apuesta principal de la Fase 2 se sostiene y si la demanda registrada es del cliente o inducida por nosotros |
| E | Estimable | ✓ M: dos consultas sobre eventos con carga cerrada y una por variante sobre la secuencia de la visita y las solicitudes |
| S | Pequeña | ✓ M: dos lecturas de la misma ruta en cuatro escenarios |
| T | Testeable | ✓ visitas fijadas con sugerencias sin editar, editadas y libres, y con variantes asignadas, dan proporciones y rótulos esperados |
