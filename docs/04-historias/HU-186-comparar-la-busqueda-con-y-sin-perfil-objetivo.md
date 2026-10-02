---
id: HU-186
titulo: "Comparar la búsqueda con y sin Perfil Objetivo"
epica: EP-008
prioridad: media
complejidad: M
estado: draft
fase: telemetria-y-medicion
prd_version: 4.17
depende_de: [HU-167]
---

# HU-186 — Comparar la búsqueda con y sin Perfil Objetivo

**Como** Dirección de Mercadeo, responsable de producto del portal,
**quiero** ver, para cada variante del experimento con y sin Perfil Objetivo, el tiempo hasta el primer perfil abierto y la tasa de solicitud,
**para** aplicar con datos reales la prueba que falsea RF-13.1 y decidir si el Perfil Objetivo se queda, en lugar de apoyarme en tres sesiones con el prototipo.

## Criterios de aceptación

### Happy path — la comparación con y sin Perfil Objetivo

**Dado** que hay un experimento activo con una variante con Perfil Objetivo y otra sin él, y visitas de clientes asignadas a cada una,
**cuando** abro la lectura del experimento en Medición,
**Entonces** veo para cada variante el tiempo hasta el primer perfil abierto y la tasa de solicitud
**Y** veo cuántas unidades del experimento hay en cada variante

### Error — el experimento no tiene criterio de decisión

**Dado** que no se ha fijado el criterio estadístico del experimento (T-25),
**cuando** abro la lectura del experimento,
**Entonces** los resultados se muestran rotulados como «lectura descriptiva, sin criterio de decisión fijado»
**Y** la lectura no declara ninguna variante ganadora

### Error — no hay experimento activo

**Dado** que no hay ningún experimento con Perfil Objetivo encendido,
**cuando** abro la lectura del experimento,
**Entonces** la lectura dice que no hay experimento activo y desde cuándo
**Y** no muestra cifras por variante

### Edge case — la señal de que el patrón está mal aplicado

**Dado** que en la variante con Perfil Objetivo el tiempo hasta el primer perfil abierto es mayor que en la variante sin él y la tasa de solicitud no es mayor,
**cuando** abro la lectura del experimento,
**Entonces** la lectura señala que se da la condición de RF-13.1 («el tiempo sube y la tasa de solicitud no»)
**Y** mientras no haya criterio de decisión fijado, la señal aparece junto al rótulo de lectura descriptiva

### Edge case — una visita sin perfil abierto

**Dado** que una visita asignada a una variante no abrió ningún perfil,
**cuando** abro la lectura del experimento,
**Entonces** esa visita cuenta en la tasa de solicitud de su variante
**Y** no entra en el tiempo hasta el primer perfil abierto, y la lectura dice cuántas visitas de cada variante quedaron fuera por eso

## Notas

Cubre la prueba de falsación de **RF-13.1** (*medición A/B de tiempo hasta el primer perfil abierto, con y sin Perfil Objetivo; si el tiempo sube y la tasa de solicitud no, el patrón está mal aplicado*; es condición de permanencia) y la medida de la **métrica de éxito de EP-009** (tiempo hasta el primer perfil abierto igual o menor que con facetas, con tasa de solicitud igual o mayor). Vistas `v_perfil_objetivo_ab` y `v_tiempo_primer_perfil` de ADR-0006.

**Nace el 2026-10-02 de la partición de HU-173** (validador independiente: fallaba la S). **Partición, no recorte**: la comparación A/B que estaba en HU-173 pasa entera a esta historia, también en EP-008.

**Bloqueada por la decisión T-25 del sponsor.** ADR-0006 deja pendiente (H32) el criterio estadístico del A/B: umbral de decisión, ventana, muestra mínima, **unidad de asignación** (la cuenta es la propuesta por defecto, no normativa) y qué hacer si al cierre no hay potencia. Con decenas de cuentas probablemente no la haya. La lectura descriptiva del escenario de error se puede construir y probar ya, pero **la historia no puede pasar a `lista` ni el experimento encenderse con clientes hasta que T-25 se cierre**, porque de esa decisión dependen la unidad que cuenta la lectura y si declara o no ganadora.

**De dónde salen los datos.** EP-009 emite `perfil_objetivo_editado` y asigna la variante en el servidor al abrir la sesión (`operacion.experimentos`, `HMAC(sal, unidad) mod n`); EP-005 crea las solicitudes. Se construye sobre el contrato de HU-167 con variantes y eventos fijados. La variante que mande el navegador se ignora (ADR-0006, V6-3).

**Abierto para el sponsor:**
- **T-25** completo (ver arriba).
- **Quién enciende y configura el experimento en el panel.** ADR-0006 da a `ps_panel` escritura sobre `operacion.experimentos`, pero ninguna historia cubre la pantalla para encenderlo, apagarlo y fijar sus variantes. ¿La hace Mercadeo, con qué rol, y va en esta épica o en EP-009? Hasta que se decida, encender el experimento no tiene historia.
- Si las visitas internas (`@trycore.com`) reciben siempre el control y quedan fuera de la lectura (propuesta de ADR-0006, pendiente de **T-26**).

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-13.1 · métrica de éxito de EP-009 · ADR-0006 (variante en servidor, `v_perfil_objetivo_ab`, `v_tiempo_primer_perfil`, V6-3, H32) · T-25 · T-26 · sale de HU-173 · relacionada con HU-078 · depende de HU-167

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: lectura sobre el contrato de HU-167, probada con variantes fijadas; no depende de HU-173; bloqueada para `lista` por T-25 (decisión del sponsor) y sin historia aún para encender el experimento |
| N | Negociable | ✓ fija las dos medidas, la condición de RF-13.1 y el rótulo descriptivo sin criterio; el criterio estadístico es justo lo que T-25 debe negociar |
| V | Valiosa | ✓ decide si la apuesta principal de la Fase 2 (el Perfil Objetivo) se sostiene, y mide la métrica de éxito de EP-009 |
| E | Estimable | ✓ M: dos medidas por variante sobre la secuencia de la visita y las solicitudes, con exclusión de visitas sin perfil abierto y tres rótulos; la unidad de asignación puede mover la estimación cuando se cierre T-25 |
| S | Pequeña | ✓ M: una sola lectura (el A/B) en cinco escenarios |
| T | Testeable | ✓ variantes fijadas con tiempos y solicitudes conocidos, una visita sin perfil abierto, un experimento apagado y la condición de RF-13.1 forzada dan cifras, rótulos y señales esperados |
