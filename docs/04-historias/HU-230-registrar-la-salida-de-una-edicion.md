---
id: HU-230
titulo: "Registrar la salida de una edición curada"
epica: EP-011
prioridad: alta
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-114]
---

# HU-230 — Registrar la salida de una edición curada

> **Decisión de negocio 2026-09-27 (sponsor):** el boletín se confecciona y envía desde Gmail o HubSpot; el portal entrega la selección curada, el enlace de cada destinatario y el bloque de contenido para copiar (PRD v4.14, RF-18).

**Como** dueña nominal de una edición curada, que la envía desde Gmail o HubSpot,
**quiero** registrar en el panel cuándo salió, desde qué herramienta y a quién,
**para** que el portal sepa que hubo envío y pueda contar entradas, vigilar la cadencia y avisar de las cuentas que no entran.

## Criterios de aceptación

### Happy path — registro la salida

**Dado** que hoy es 6 de octubre de 2026, los enlaces de la edición de Bancolombia se generaron el 5 de octubre y la envié hoy desde HubSpot a Juliana Restrepo y Mauricio Cárdenas,
**cuando** registro la salida con fecha 6 de octubre de 2026, herramienta HubSpot y esos dos destinatarios,
**Entonces** la edición pasa a «enviada», con esa fecha, esa herramienta, esos destinatarios y su dueña nominal
**Y** Bancolombia cuenta como cuenta contactada en el cuarto trimestre de 2026, que es el denominador del KPI «cuentas que envían al menos una solicitud» (HU-171)
**Y** el registro queda en auditoría con quién lo hizo y cuándo

### Edge case — salió solo a una parte de los destinatarios

**Dado** que el correo de la edición de Bancolombia salió a Juliana Restrepo y no a Mauricio Cárdenas,
**cuando** registro la salida solo para Juliana,
**Entonces** Juliana queda «salió el 6 oct desde HubSpot» y Mauricio «sin salida registrada»
**Y** la edición cuenta como enviada, porque salió al menos a un destinatario

### Error — sin enlaces no hay salida que registrar

**Dado** que la edición de Alpina está «lista» y todavía no tiene enlaces generados,
**cuando** intento registrar su salida,
**Entonces** el panel no la registra y me explica que primero se generan los enlaces, porque sin enlace la entrada de la cuenta no se puede medir

### Error — una fecha imposible

**Dado** que hoy es 6 de octubre de 2026 y los enlaces de la edición de Bancolombia se generaron el 5 de octubre,
**cuando** registro la salida con la fecha de la tabla,
**Entonces** el resultado es el de la tabla

| Fecha de salida | Resultado |
|---|---|
| 4 oct 2026 | no se registra: la edición no pudo salir antes de generar sus enlaces |
| 5 oct 2026 | se registra |
| 7 oct 2026 | no se registra: la fecha de salida no puede ser posterior a hoy |

### Edge case — anulo una salida registrada por error

**Dado** que registré por error la salida de la edición de Bancolombia,
**cuando** la anulo indicando el motivo,
**Entonces** la salida aparece anulada con su motivo, sin desaparecer, y la edición vuelve a «lista»
**Y** deja de contar para la cadencia (HU-231), para la regla de tres envíos (HU-117) y para el KPI de cuentas contactadas
**Y** la anulación queda en auditoría con quién la hizo, cuándo y el motivo

## Notas

Cubre la parte de **RF-18.5** que registra la salida: *como la salida ocurre en Gmail o HubSpot, quien envía registra la salida en el panel (fecha y herramienta)*. Sin este registro no hay conteo de envíos (RF-18.6) ni cadencia (riesgo «nadie registra la salida» de la spec §8). Modelo de ADR-0009 (UC-16): `edicion_destinatarios.salida_registrada_en` y `herramienta` `gmail | hubspot`, por destinatario.

**Nace el 2026-10-02 por partición de HU-115** (validador: fallaba la S). **No es recorte**: el registro de la salida estaba en el edge «registrar la salida y la cadencia» de HU-115; la cadencia pasa a HU-231.

**D93 (sponsor, 2026-10-02).** El KPI del 35 % (§11) aparece en el tablero «aún no se mide» hasta que EP-011 registre los envíos. Esta historia es ese registro: **«cuenta contactada» = cuenta con al menos un destinatario con salida registrada, no anulada, en el período**. HU-171 la lee; esta historia no construye el tablero.

**Elegidas por el modelo por delegación del sponsor (2026-10-02):** salida por destinatario (ADR-0009 ya lo modela), fecha entre la generación de los enlaces y hoy, y **anular en lugar de borrar** (los registros del panel no tienen borrado físico, RF-8.3, como HU-189).

**Quién registra.** El dueño nominal o quien pueda escribir en Envíos (administración de inventario o permiso «Envíos», HU-233).

## Trazabilidad

Épica madre: **EP-011** · PRD v4.18 · RF-18.5 · RF-18.6 · RF-8.3 · §11 KPI de cuentas que envían · D93 (sponsor, 2026-10-02) · ADR-0009 (UC-16) · spec `docs/10-specs/correo-curado.md` (§6, §8) · prototipo `enlaces-y-contenido--salida-registrada` · depende de HU-114 · partida de HU-115 · la leen HU-116, HU-117, HU-171 y HU-231

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: necesita enlaces generados (HU-114); no depende de las lecturas que la usan |
| N | Negociable | ✓ fija fecha, herramienta y destinatarios, la guarda sin enlaces, el rango de fechas y la anulación con motivo; la forma del registro es negociable |
| V | Valiosa | ✓ es lo único que le dice al portal que hubo envío; sin ella no hay seguimiento, cadencia ni KPI del 35 % |
| E | Estimable | ✓ S: un formulario sobre columnas ya diseñadas, dos validaciones y la anulación con auditoría |
| S | Pequeña | ✓ S: una capacidad (registrar la salida) en cinco escenarios |
| T | Testeable | ✓ un reloj fijado al 6 de octubre de 2026, una edición con enlaces del 5 de octubre, una sin enlaces, una salida parcial y una anulación dan estados, rechazos y conteos observables |
