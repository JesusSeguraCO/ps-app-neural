---
id: HU-185
titulo: "Saber cuándo se cumple el disparador de la ruta por reto"
epica: EP-008
prioridad: media
complejidad: S
estado: draft
fase: telemetria-y-medicion
prd_version: 4.17
depende_de: [HU-167]
---

# HU-185 — Saber cuándo se cumple el disparador de la ruta por reto

**Como** Dirección de Mercadeo, responsable de producto del portal,
**quiero** ver cuántas solicitudes con dos o más perfiles y reto declarado van de las 50 que fija §14.5, si Delivery ya validó las tres composiciones reales, y que el panel me diga cuándo se cumple el disparador,
**para** abrir la ruta por reto cuando lo dice la regla y no reabrir la conversación de «¿ya es momento?» cada trimestre.

## Criterios de aceptación

### Happy path — cuánto falta para el disparador

**Dado** que se han registrado solicitudes con dos o más perfiles y reto declarado,
**cuando** abro la lectura del disparador en Medición,
**Entonces** veo cuántas van de las 50 que fija §14.5
**Y** veo cuántas solicitudes se descartaron del conteo por tener un solo perfil o no declarar reto

### Edge case — el límite de las 50

**Dado** que el número de solicitudes que cumplen la condición es el de la tabla,
**cuando** abro la lectura del disparador,
**Entonces** la lectura dice lo que indica la tabla

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

### Edge case — la condición de Delivery

**Dado** que el conteo va por debajo de 50 y un administrador registró en el panel que Delivery validó tres composiciones reales de proyectos entregados, con la fecha y quién de Delivery las validó,
**cuando** abro la lectura del disparador,
**Entonces** veo esa condición marcada como cumplida, con su fecha y quién la validó, junto al conteo de las 50
**Y** la lectura dice «condición del disparador cumplida por validación de Delivery»
**Y** si nadie la ha registrado, la condición aparece como «pendiente de validación de Delivery», nunca oculta

## Notas

Cubre el **disparador de §14.5**: la ruta por reto se abre cuando hay **50 solicitudes con dos o más perfiles registradas con su reto declarado**, o cuando Delivery valida al menos tres composiciones reales (D-19). Esta historia mide la primera condición, que es la que produce el portal.

**Nace el 2026-10-02 de la partición de HU-170** (validador independiente: fallaba la S). **Partición, no recorte**: la lectura del disparador que estaba en HU-170 pasa entera a esta historia, también en EP-008.

**De dónde salen los datos.** Las solicitudes y su número de perfiles, de EP-005; el reto declarado, de EP-009. Se construye y prueba con solicitudes fijadas del contrato de HU-167; mientras EP-009 no registre el reto, dice «aún no se mide». El conteo se toma de las solicitudes registradas, no del evento «solicitud enviada», para que una pérdida de telemetría no lo altere (mismo criterio que HU-171).

**Lo que esta historia no decide.** Abrir la ruta por reto lo decide §14.5 y el equipo; la lectura solo dice si la condición se cumplió.

**Resuelto por el sponsor (2026-10-02).**
- **D73, opción conservadora: la condición de Delivery se muestra.** La segunda vía de §14.5 —Delivery valida al menos tres composiciones reales— aparece en la lectura junto al conteo (edge nuevo). No la produce la telemetría: la registra una persona en el panel. Como Delivery no está entre quienes ven Medición (D67), la registra **un administrador**, con la fecha y el nombre de quien validó en Delivery. **A confirmar:** la decisión habla de «la 3.ª condición»; §14.5 tiene dos, y esta redacción la interpreta como la de las tres composiciones de Delivery.
- **D68:** las solicitudes de sesiones internas o demo **no cuentan** (error, motivo «no es sesión real»).

**Lo que sigue abierto:** §14.5 dice que Delivery «las sostiene actualizadas»; esta historia registra la validación y su fecha, pero no fija cada cuánto se revalida. Propuesta: lo decide Delivery con el sponsor.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · §14.5 · D-19 · V2-4 · ADR-0006 · T-26 · D67, D68 y D73 (sponsor, 2026-10-02) · sale de HU-170 · depende de HU-167

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: solo usa el contrato de HU-167 y las solicitudes; no depende de HU-170 ni de HU-184; los datos reales llegan con EP-005 y EP-009 y mientras tanto dice «aún no se mide» |
| N | Negociable | ✓ fija las dos condiciones de §14.5, el umbral de 50, los motivos de descarte y que la condición de Delivery se muestre (D73); la presentación del conteo y de la condición es negociable |
| V | Valiosa | ✓ convierte una regla del PRD en una señal que aparece sola el día que se cumple, sin discusión trimestral |
| E | Estimable | ✓ S en el límite: un conteo filtrado sobre las solicitudes con su número de perfiles, su reto y su sesión real, con un umbral y dos rótulos, más un registro sencillo (fecha y quién) de la validación de Delivery |
| S | Pequeña | ✓ S: una lectura del disparador (sus dos condiciones) en cinco escenarios |
| T | Testeable | ✓ conjuntos fijados de 49 y 50 solicitudes válidas, solicitudes sin reto, de un perfil o de una sesión demo, un contrato sin reto declarado y la validación de Delivery registrada o no dan conteos, rótulos y fechas esperados |
