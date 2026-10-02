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
**quiero** ver cuántas solicitudes con dos o más perfiles y reto declarado van de las 50 que fija §14.5, y que el panel me diga cuándo se cumple,
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

**Dado** que hay una solicitud con tres perfiles sin reto declarado y otra con reto declarado y un solo perfil,
**cuando** abro la lectura del disparador,
**Entonces** ninguna de las dos suma al conteo de las 50
**Y** las dos aparecen entre las descartadas, cada una con su motivo

### Error — el reto declarado todavía no se emite

**Dado** que el portal aún no registra el reto declarado de las solicitudes,
**cuando** abro la lectura del disparador,
**Entonces** la lectura dice «aún no se mide» y nombra la épica que debe registrarlo
**Y** no muestra «0 de 50» como si fuera un conteo real

## Notas

Cubre el **disparador de §14.5**: la ruta por reto se abre cuando hay **50 solicitudes con dos o más perfiles registradas con su reto declarado**, o cuando Delivery valida al menos tres composiciones reales (D-19). Esta historia mide la primera condición, que es la que produce el portal.

**Nace el 2026-10-02 de la partición de HU-170** (validador independiente: fallaba la S). **Partición, no recorte**: la lectura del disparador que estaba en HU-170 pasa entera a esta historia, también en EP-008.

**De dónde salen los datos.** Las solicitudes y su número de perfiles, de EP-005; el reto declarado, de EP-009. Se construye y prueba con solicitudes fijadas del contrato de HU-167; mientras EP-009 no registre el reto, dice «aún no se mide». El conteo se toma de las solicitudes registradas, no del evento «solicitud enviada», para que una pérdida de telemetría no lo altere (mismo criterio que HU-171).

**Lo que esta historia no decide.** Abrir la ruta por reto lo decide §14.5 y el equipo; la lectura solo dice si la condición se cumplió.

**Abierto para el sponsor:** si la segunda condición del disparador —Delivery valida tres composiciones reales y las sostiene actualizadas— debe aparecer también en esta lectura como casilla que marca una persona (no la produce la telemetría); y si las solicitudes de visitas internas (`@trycore.com`) se excluyen del conteo, pendiente de **T-26**.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · §14.5 · D-19 · V2-4 · ADR-0006 · T-26 · sale de HU-170 · depende de HU-167

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: solo usa el contrato de HU-167 y las solicitudes; no depende de HU-170 ni de HU-184; los datos reales llegan con EP-005 y EP-009 y mientras tanto dice «aún no se mide» |
| N | Negociable | ✓ fija la condición de §14.5, el umbral de 50 y los motivos de descarte; la presentación del conteo y de la segunda condición son negociables |
| V | Valiosa | ✓ convierte una regla del PRD en una señal que aparece sola el día que se cumple, sin discusión trimestral |
| E | Estimable | ✓ S: un conteo filtrado sobre las solicitudes con su número de perfiles y su reto, con un umbral y dos rótulos |
| S | Pequeña | ✓ S: un solo conteo en cuatro escenarios |
| T | Testeable | ✓ conjuntos fijados de 49 y 50 solicitudes válidas, solicitudes sin reto o de un perfil y un contrato sin reto declarado dan conteos, rótulos y fechas esperados |
