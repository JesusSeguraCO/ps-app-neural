---
id: HU-185
titulo: "Saber cuándo se cumple el disparador de la ruta por reto"
epica: EP-008
prioridad: media
complejidad: S
estado: lista
fase: telemetria-y-medicion
prd_version: 4.18
depende_de: [HU-167, HU-190, HU-195]
---

# HU-185 — Saber cuándo se cumple el disparador de la ruta por reto

**Como** Dirección de Mercadeo, responsable de producto del portal,
**quiero** leer en Medición las tres condiciones del disparador de §14.5 —cuántas solicitudes con dos o más perfiles van de las 50, si están registradas con su reto declarado y si Delivery ya validó las tres composiciones reales— y que el panel me diga cuándo se cumple,
**para** abrir la ruta por reto cuando lo dice la regla y no reabrir la conversación de «¿ya es momento?» cada trimestre.

## Criterios de aceptación

### Happy path — el disparador se cumple con las tres condiciones a la vez

**Dado** que tengo el permiso «Medición», la validación de Delivery (HU-195) está registrada el 20 oct 2026 y el número de solicitudes registradas con dos o más perfiles y reto declarado es el de la tabla, además de 3 descartadas (una con un solo perfil, una sin reto declarado y una de una sesión no real), y la solicitud que completa el conteo se registró el 12 nov 2026,
**cuando** abro la lectura del disparador en Medición,
**Entonces** la lectura dice lo que indica la tabla
**Y** veo «3 descartadas» con su motivo: 1 con un solo perfil, 1 sin reto declarado y 1 de una sesión no real
**Y** la lectura muestra por separado las tres condiciones de §14.5: dos o más perfiles, reto declarado y validación de Delivery

| Solicitudes con ≥ 2 perfiles y reto declarado | La lectura dice |
|---|---|
| 49 | «49 de 50, falta 1», con la validación de Delivery cumplida y el disparador **no** cumplido |
| 50 | «disparador cumplido el 12 nov 2026», la fecha de la última de las tres condiciones en cumplirse |

### Error — solicitudes que no cuentan

**Dado** que hay una solicitud con tres perfiles sin reto declarado, otra con reto declarado y un solo perfil, y otra con tres perfiles y reto declarado enviada desde una sesión demo,
**cuando** abro la lectura del disparador,
**Entonces** ninguna de las tres suma al conteo de las 50
**Y** las tres aparecen entre las descartadas, cada una con su motivo («sin reto declarado», «un solo perfil», «no es sesión real»)

### Error — el reto declarado todavía no se emite

**Dado** que el portal aún no registra el reto declarado de las solicitudes,
**cuando** abro la lectura del disparador,
**Entonces** la lectura dice «aún no se mide» y dice que el reto declarado llega con EP-009
**Y** no muestra «0 de 50» como si fuera un conteo real

### Edge case — una sola vía cumplida no abre el disparador

**Dado** que el conteo de solicitudes válidas y la validación de Delivery (HU-195) están en la situación de la tabla,
**cuando** abro la lectura del disparador,
**Entonces** la condición de Delivery aparece como dice la tabla, junto al conteo, nunca oculta
**Y** el disparador queda **no cumplido** en las dos filas, con lo que falta

| Conteo | Validación de Delivery | La condición de Delivery | El disparador |
|---|---|---|---|
| 32 de 50 | registrada el 20 oct 2026 por `coordinacion.servicio@trycore.com`, con tres composiciones | «validada por Delivery», con esa fecha y quién la registró | no cumplido: «32 de 50, faltan 18» |
| 50 de 50 | sin registrar | «pendiente de validación de Delivery» | no cumplido: «falta la validación de Delivery» |

## Notas

Cubre el **disparador de §14.5** con sus **tres condiciones** (enmienda v4.18, D95): (1) **50 solicitudes con dos o más perfiles**, (2) **registradas con su reto declarado** y (3) la **validación de Delivery de al menos 3 composiciones reales** de proyectos entregados (D-19). Las dos primeras las produce el portal y se cumplen juntas; la tercera la registra Coordinación de Servicio en HU-195. **El disparador se cumple solo cuando las tres se dan a la vez** (D98): ni la vía del portal (1 y 2) ni la de Delivery (3) bastan solas. Esta historia es **solo la lectura** de Mercadeo.

**Nace el 2026-10-02 de la partición de HU-170** (validador independiente: fallaba la S). **Partición, no recorte**: la lectura del disparador que estaba en HU-170 pasa entera a esta historia, también en EP-008.

**De dónde salen los datos.** Las solicitudes y su número de perfiles, de EP-005; el reto declarado, de EP-009. Se construye y prueba con solicitudes fijadas del contrato de HU-167; mientras EP-009 no registre el reto, dice «aún no se mide». El conteo se toma de las solicitudes registradas, no del evento «solicitud enviada», para que una pérdida de telemetría no lo altere (mismo criterio que HU-171).

**Lo que esta historia no decide.** Abrir la ruta por reto lo decide §14.5 y el equipo; la lectura solo dice si la condición se cumplió.

**Resuelto por el sponsor (2026-10-02).**
- **D73, opción conservadora: la condición de Delivery se muestra** junto al conteo. No la produce la telemetría: la registra una persona en el panel.
- **D68:** las solicitudes de sesiones internas o demo **no cuentan** (error, motivo «no es sesión real»).
- **D94 (tercera ronda) — quién registra la validación.** La registra **Coordinación de Servicio** con un permiso propio, «Validar composiciones», en **HU-195**. Esta historia queda **solo con la lectura de Mercadeo**: sale el happy de «registro la validación de Delivery» (que hacía un administrador con el permiso «Medición», D74) y la condición registrada o pendiente se funde en un edge con tabla. **Partición, no recorte**: el registro, su auditoría y su negación pasan enteros a HU-195. Sustituye la interpretación de D74 que se aplicaba aquí.
- **D95 (tercera ronda) — tercera condición.** Cierra el «a confirmar» anterior: la validación de Delivery de las 3 composiciones es la **tercera condición** de §14.5, que se enmienda (nota v4.18). La lectura muestra las tres.
- **D98 (tercera ronda) — combinación.** El disparador se cumple **solo con las tres condiciones a la vez**; corrige la lectura «(1 y 2) o 3» que tenía esta historia. El happy pasa a exigir la validación de Delivery registrada y el edge muestra que cada vía sola deja el disparador no cumplido. La fecha de cumplimiento es la de la última condición que se cumplió.

**Revisión de validación 2026-10-02.** El edge de Delivery mezclaba dos estados en un solo Entonces; ahora son dos filas de una tabla con su resultado cada una. El límite de 49 y 50 va como tabla en el happy del conteo. La negación a quien no tiene el permiso «Medición» es la regla común de HU-190 y HU-171 y no se repite aquí.

**Lo que sigue abierto:** §14.5 dice que Delivery «las sostiene actualizadas»; HU-195 guarda cada validación con su fecha, pero nadie fijó cada cuánto se revalida. Propuesta: lo decide Delivery con el sponsor.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.18 · §14.5 (enmienda v4.18, D95, D98) · D-19 · V2-4 · ADR-0006 · T-26 · D67 (sustituida por D74), D68, D73, D74, D94, D95 y D98 (sponsor, 2026-10-02) · sale de HU-170 · el registro de la validación de Delivery sale a HU-195 (D94) · depende de HU-167, HU-190 (permiso «Medición») y HU-195 (validación de Delivery)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: el contrato de HU-167, el permiso de HU-190 y el registro de HU-195, que se siembra para probar la lectura; no depende de HU-170 ni de HU-184; los datos reales llegan con EP-005 y EP-009 y mientras tanto dice «aún no se mide» |
| N | Negociable | ✓ fija las tres condiciones de §14.5 y que se cumplan a la vez (D95, D98), el umbral de 50, los motivos de descarte y que la condición de Delivery se muestre siempre (D73); la presentación del conteo y de las condiciones es negociable |
| V | Valiosa | ✓ convierte una regla del PRD en una señal que aparece sola el día que se cumple, sin discusión trimestral |
| E | Estimable | ✓ S: un conteo filtrado sobre las solicitudes con su número de perfiles, su reto y su sesión real, con un umbral y sus rótulos, más la lectura de un registro que ya guarda HU-195 |
| S | Pequeña | ✓ S: una lectura del disparador en cuatro escenarios; el registro de Delivery salió a HU-195 |
| T | Testeable | ✓ conjuntos fijados de 49 y 50 solicitudes válidas, solicitudes sin reto, de un perfil o de una sesión demo, un contrato sin reto declarado y una validación de Delivery sembrada y ausente dan conteos, rótulos y fechas esperados |
