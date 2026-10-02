---
id: HU-186
titulo: "Comparar la búsqueda con y sin Perfil Objetivo"
epica: EP-008
prioridad: media
complejidad: M
estado: lista
fase: telemetria-y-medicion
prd_version: 4.17
depende_de: [HU-167]
---

# HU-186 — Comparar la búsqueda con y sin Perfil Objetivo

**Como** Dirección de Mercadeo, responsable de producto del portal,
**quiero** que un administrador pueda encender y apagar en el panel el experimento con y sin Perfil Objetivo, y ver para cada variante el tiempo hasta el primer perfil abierto y la tasa de solicitud,
**para** aplicar con datos reales la prueba que falsea RF-13.1 y decidir si el Perfil Objetivo se queda, en lugar de apoyarme en tres sesiones con el prototipo.

## Criterios de aceptación

### Happy path — la comparación con y sin Perfil Objetivo

**Dado** que hay un experimento activo con una variante con Perfil Objetivo y otra sin él, y cuentas con sesiones reales asignadas a cada una,
**cuando** abro la lectura del experimento en Medición,
**Entonces** veo para cada variante el tiempo hasta el primer perfil abierto, la tasa de solicitud y cuántas cuentas y visitas tiene
**Y** los resultados aparecen rotulados como «lectura descriptiva, para la revisión trimestral», sin declarar ninguna variante ganadora

### Happy path — un administrador enciende el experimento

**Dado** que tengo el rol administrador y el permiso «Medición» y no hay ningún experimento con Perfil Objetivo encendido,
**cuando** lo enciendo en el panel,
**Entonces** cada cuenta queda asignada a una de las dos variantes, mitad y mitad, y todas las visitas de una misma cuenta ven la misma variante
**Y** la lectura muestra que el experimento está activo, desde cuándo y quién lo encendió

### Error — no hay experimento activo y quien mira no es administrador

**Dado** que no hay ningún experimento con Perfil Objetivo encendido y entré a Medición con el permiso «Medición» y el rol observador, sin rol de administrador,
**cuando** abro la lectura del experimento,
**Entonces** la lectura dice que no hay experimento activo, desde cuándo y quién lo apagó, sin cifras por variante
**Y** el control para encenderlo aparece inactivo, con el texto «solo un administrador puede encender o apagar el experimento»

### Edge case — la señal de que el patrón está mal aplicado

**Dado** que en la variante con Perfil Objetivo el tiempo hasta el primer perfil abierto es mayor que en la variante sin él y la tasa de solicitud no es mayor,
**cuando** abro la lectura del experimento,
**Entonces** la lectura señala que se da la condición de RF-13.1 («el tiempo sube y la tasa de solicitud no»)
**Y** la señal aparece junto al rótulo de lectura descriptiva: decide el equipo en la revisión trimestral

### Edge case — una visita sin perfil abierto

**Dado** que una visita asignada a una variante no abrió ningún perfil,
**cuando** abro la lectura del experimento,
**Entonces** esa visita cuenta en la tasa de solicitud de su variante
**Y** no entra en el tiempo hasta el primer perfil abierto, y la lectura dice cuántas visitas de cada variante quedaron fuera por eso

## Notas

Cubre la prueba de falsación de **RF-13.1** (*medición A/B de tiempo hasta el primer perfil abierto, con y sin Perfil Objetivo; si el tiempo sube y la tasa de solicitud no, el patrón está mal aplicado*; es condición de permanencia) y la medida de la **métrica de éxito de EP-009** (tiempo hasta el primer perfil abierto igual o menor que con facetas, con tasa de solicitud igual o mayor). Vistas `v_perfil_objetivo_ab` y `v_tiempo_primer_perfil` de ADR-0006.

**Nace el 2026-10-02 de la partición de HU-173** (validador independiente: fallaba la S). **Partición, no recorte**: la comparación A/B que estaba en HU-173 pasa entera a esta historia, también en EP-008.

**T-25 cerrada por el sponsor (D71, 2026-10-02); se quita el bloqueo.** Asignación **por cuenta, 50/50**; **lectura descriptiva** (sin umbral estadístico ni ganadora declarada, porque con decenas de cuentas no habría potencia); la decisión de mantener o retirar el Perfil Objetivo se toma en la **revisión trimestral**; el experimento lo **enciende y apaga un administrador en el panel**. La historia ya puede avanzar hacia `lista` cuando pase su revisión. Para incluir el encendido sin pasar de cinco escenarios, el rótulo descriptivo (antes un error propio) pasa al happy path, y el «no hay experimento activo» se une con la negación al que no es administrador. **Ampliación de alcance, no recorte.**

**De dónde salen los datos.** EP-009 emite `perfil_objetivo_editado` y asigna la variante en el servidor al abrir la sesión (`operacion.experimentos`, `HMAC(sal, unidad) mod n`); EP-005 crea las solicitudes. Se construye sobre el contrato de HU-167 con variantes y eventos fijados. La variante que mande el navegador se ignora (ADR-0006, V6-3).

**Encender y apagar (D71).** El control vive en esta historia, en la lectura del experimento en Medición, solo para administradores (`ps_panel` ya tiene escritura sobre `operacion.experimentos`, ADR-0006). Las variantes son fijas: con y sin Perfil Objetivo. Apagarlo deja de asignar variantes a las visitas nuevas; lo ya medido no se borra. **D74 (segunda ronda) cierra el riesgo que compartía con HU-171:** ver la lectura exige el **permiso «Medición»** (HU-190), independiente del rol; encender o apagar exige **además el rol administrador**, porque es una escritura (RF-8.1.2). El permiso da lectura; el rol, escritura.

**Sesiones reales (D68).** Solo cuentan en la lectura las sesiones con código verificado de un correo que no es `@trycore.com`, por un enlace sin la casilla «demo» (HU-188). Qué variante ven las internas y las demo es del equipo (ADR-0006 propone el control); no cuentan en ningún caso.

**Abierto:** qué ve una cuenta cuando el experimento está apagado (la versión con Perfil Objetivo de EP-009 o sin él). Propuesta: la que el PRD define como producto (con Perfil Objetivo), a confirmar con el sponsor.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-13.1 · métrica de éxito de EP-009 · ADR-0006 (variante en servidor, `v_perfil_objetivo_ab`, `v_tiempo_primer_perfil`, V6-3, H32) · T-25 y T-26 (cerradas por D71 y D68) · D74 (segunda ronda, permiso «Medición», HU-190) · D67, D68 y D71 (sponsor, 2026-10-02) · sale de HU-173 · relacionada con HU-078 · depende de HU-167

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: lectura y control sobre el contrato de HU-167, probados con variantes fijadas; no depende de HU-173; T-25 cerrada (D71) y el encendido ya tiene historia (esta) |
| N | Negociable | ✓ fija las dos medidas, la condición de RF-13.1, la asignación por cuenta 50/50, la lectura descriptiva y quién enciende (D71); la presentación y la forma del control son negociables |
| V | Valiosa | ✓ decide si la apuesta principal de la Fase 2 (el Perfil Objetivo) se sostiene, y mide la métrica de éxito de EP-009 |
| E | Estimable | ✓ M en el límite alto: dos medidas por variante sobre la secuencia de la visita y las solicitudes, con exclusión de visitas sin perfil abierto, asignación por cuenta en el servidor y un control de encendido para administradores; D71 cerró la unidad de asignación |
| S | Pequeña | ✓ M, justa: el A/B (encenderlo y leerlo) en cinco escenarios; si al estimar se pasa, el control de encendido sale a su propia historia, no se recorta |
| T | Testeable | ✓ variantes fijadas con tiempos y solicitudes conocidos, una visita sin perfil abierto, el encendido por un administrador con cuentas asignadas mitad y mitad, un experimento apagado visto por Mercadeo y la condición de RF-13.1 forzada dan cifras, rótulos y señales esperados |
