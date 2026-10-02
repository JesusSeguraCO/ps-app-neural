---
id: HU-185
titulo: "Saber cuándo se cumple el disparador de la ruta por reto"
epica: EP-008
prioridad: media
complejidad: S
estado: draft
fase: telemetria-y-medicion
prd_version: 4.17
depende_de: [HU-167, HU-190]
---

# HU-185 — Saber cuándo se cumple el disparador de la ruta por reto

**Como** Dirección de Mercadeo, responsable de producto del portal,
**quiero** ver cuántas solicitudes con dos o más perfiles y reto declarado van de las 50 que fija §14.5, si Delivery ya validó las tres composiciones reales, y que el panel me diga cuándo se cumple el disparador,
**para** abrir la ruta por reto cuando lo dice la regla y no reabrir la conversación de «¿ya es momento?» cada trimestre.

## Criterios de aceptación

### Happy path — cuánto falta para el disparador

**Dado** que tengo el permiso «Medición» y el número de solicitudes registradas con dos o más perfiles y reto declarado es el de la tabla, además de algunas descartadas,
**cuando** abro la lectura del disparador en Medición,
**Entonces** la lectura dice lo que indica la tabla
**Y** veo cuántas solicitudes se descartaron del conteo por tener un solo perfil, no declarar reto o no venir de una sesión real

| Solicitudes con ≥ 2 perfiles y reto declarado | La lectura dice |
|---|---|
| 49 | «49 de 50, falta 1», sin dar la condición por cumplida |
| 50 | «condición del disparador cumplida», con la fecha en que se cumplió |

### Error — solicitudes que no cuentan

**Dado** que hay una solicitud con tres perfiles sin reto declarado, otra con reto declarado y un solo perfil, y otra con tres perfiles y reto declarado enviada desde una sesión demo,
**cuando** abro la lectura del disparador,
**Entonces** ninguna de las tres suma al conteo de las 50
**Y** las tres aparecen entre las descartadas, cada una con su motivo («sin reto declarado», «un solo perfil», «no es sesión real»)

### Error — el reto declarado todavía no se emite

**Dado** que el portal aún no registra el reto declarado de las solicitudes,
**cuando** abro la lectura del disparador,
**Entonces** la lectura dice «aún no se mide» y nombra la épica que debe registrarlo
**Y** no muestra «0 de 50» como si fuera un conteo real

### Happy path — registro la validación de Delivery

**Dado** que entré al panel con el rol administrador y el permiso «Medición», el conteo va en 32 de 50 y Coordinación de Servicio (Delivery) me confirmó que validó tres composiciones reales de proyectos entregados,
**cuando** registro esa validación en la lectura del disparador, con su fecha y quién de Delivery la validó,
**Entonces** la condición de Delivery aparece como cumplida, con esa fecha y ese nombre, junto al conteo de 32 de 50
**Y** la lectura dice «condición del disparador cumplida por validación de Delivery»
**Y** el registro queda en el registro de auditoría con quién lo hizo y cuándo

### Edge case — la validación de Delivery no está registrada

**Dado** que el conteo va por debajo de 50 y nadie ha registrado la validación de Delivery,
**cuando** abro la lectura del disparador,
**Entonces** la condición de Delivery aparece como «pendiente de validación de Delivery», nunca oculta
**Y** la lectura no da el disparador por cumplido

## Notas

Cubre el **disparador de §14.5**: la ruta por reto se abre cuando hay **50 solicitudes con dos o más perfiles registradas con su reto declarado**, o cuando Delivery valida al menos tres composiciones reales (D-19). Esta historia mide la primera condición, que es la que produce el portal.

**Nace el 2026-10-02 de la partición de HU-170** (validador independiente: fallaba la S). **Partición, no recorte**: la lectura del disparador que estaba en HU-170 pasa entera a esta historia, también en EP-008.

**De dónde salen los datos.** Las solicitudes y su número de perfiles, de EP-005; el reto declarado, de EP-009. Se construye y prueba con solicitudes fijadas del contrato de HU-167; mientras EP-009 no registre el reto, dice «aún no se mide». El conteo se toma de las solicitudes registradas, no del evento «solicitud enviada», para que una pérdida de telemetría no lo altere (mismo criterio que HU-171).

**Lo que esta historia no decide.** Abrir la ruta por reto lo decide §14.5 y el equipo; la lectura solo dice si la condición se cumplió.

**Resuelto por el sponsor (2026-10-02).**
- **D73, opción conservadora: la condición de Delivery se muestra.** La segunda vía de §14.5 —Delivery valida al menos tres composiciones reales— aparece en la lectura junto al conteo. No la produce la telemetría: la registra una persona en el panel.
- **D74 (corrige D67) — quién la registra.** Ver la lectura exige el **permiso «Medición»** por persona, independiente del rol (HU-190); registrarla es una **escritura** en Medición, y la regla de HU-190 es que el permiso da lectura y el rol da escritura. Por eso la registra **un administrador del panel con el permiso «Medición»**, con la fecha y el nombre de quien validó en Delivery. Coordinación de Servicio no está inscrita como administradora; si alguien de Delivery recibe el permiso «Medición», puede **ver** la condición, pero no registrarla. La razón ya no es «Delivery no está entre quienes ven Medición» (D67, sustituida). **A confirmar:** la decisión habla de «la 3.ª condición»; §14.5 tiene dos, y esta redacción la interpreta como la de las tres composiciones de Delivery.
- **D68:** las solicitudes de sesiones internas o demo **no cuentan** (error, motivo «no es sesión real»).

**Revisión de validación 2026-10-02.** El edge de Delivery mezclaba dos estados (registrada y no registrada) en un solo Entonces y faltaba el acto de registrarla. Se parte en el **happy de registrar la validación**, cuyo resultado es la condición registrada, y el **edge de la validación no registrada**. Para no pasar de cinco escenarios, el límite de 49 y 50 entra como tabla en el happy del conteo; ningún caso se pierde. La negación a quien no puede escribir en Medición es la regla común de HU-190 y HU-171 y no se repite aquí. No se movió a HU-189: allí Talento Humano registra decisiones de reclutamiento (§14.7, destino Demanda), otra regla y otro destino.

**Lo que sigue abierto:** §14.5 dice que Delivery «las sostiene actualizadas»; esta historia registra la validación y su fecha, pero no fija cada cuánto se revalida. Propuesta: lo decide Delivery con el sponsor.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · §14.5 · D-19 · V2-4 · ADR-0006 · T-26 · D67 (sustituida por D74), D68, D73 y D74 (sponsor, 2026-10-02) · sale de HU-170 · depende de HU-167 y HU-190 (permiso «Medición»)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: el contrato de HU-167, las solicitudes y el permiso de HU-190; no depende de HU-170 ni de HU-184; los datos reales llegan con EP-005 y EP-009 y mientras tanto dice «aún no se mide» |
| N | Negociable | ✓ fija las dos condiciones de §14.5, el umbral de 50, los motivos de descarte que la condición de Delivery se muestre (D73) y que la registre un administrador con el permiso «Medición» (D74); la presentación del conteo y de la condición es negociable |
| V | Valiosa | ✓ convierte una regla del PRD en una señal que aparece sola el día que se cumple, sin discusión trimestral |
| E | Estimable | ✓ S en el límite: un conteo filtrado sobre las solicitudes con su número de perfiles, su reto y su sesión real, con un umbral y dos rótulos, más un registro sencillo (fecha, quién validó y auditoría) de la validación de Delivery sobre la guarda de rol y permiso que ya existe |
| S | Pequeña | ✓ S: una lectura del disparador (sus dos condiciones) y el registro de la segunda, en cinco escenarios |
| T | Testeable | ✓ conjuntos fijados de 49 y 50 solicitudes válidas, solicitudes sin reto, de un perfil o de una sesión demo, un contrato sin reto declarado una sesión de administrador con el permiso «Medición» que registra la validación y un entorno sin ella dan conteos, rótulos, fechas y auditoría esperados |
