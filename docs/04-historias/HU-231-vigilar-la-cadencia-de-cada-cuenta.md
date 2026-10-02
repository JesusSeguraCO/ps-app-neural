---
id: HU-231
titulo: "Vigilar la cadencia de cada cuenta"
epica: EP-011
prioridad: media
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-230]
---

# HU-231 — Vigilar la cadencia de cada cuenta

> **Decisión de negocio 2026-09-27 (sponsor):** el boletín se confecciona y envía desde Gmail o HubSpot; el portal entrega la selección curada, el enlace de cada destinatario y el bloque de contenido para copiar (PRD v4.14, RF-18).

**Como** dueña nominal de las ediciones curadas de varias cuentas,
**quiero** ver cuándo vence la siguiente edición de cada cuenta y recibir un aviso por correo interno cuando se pasa,
**para** que ninguna cuenta se quede sin propuesta por olvido y el canal sostenga el hábito que el inventario vivo necesita.

## Criterios de aceptación

### Happy path — veo cuándo vence la siguiente edición

**Dado** que Bancolombia tiene la cadencia mensual por omisión (30 días) y su última salida registrada fue el 1 de septiembre de 2026,
**cuando** abro Envíos,
**Entonces** veo para Bancolombia «la siguiente edición vence el 1 oct 2026», con su dueña nominal

### Edge case — el aviso al pasarse

**Dado** que la última salida registrada de Bancolombia fue el 1 de septiembre de 2026, con cadencia de 30 días, y desde entonces no se registró ninguna otra,
**cuando** corre la evaluación diaria del día de la tabla,
**Entonces** el resultado es el de la tabla

| Día de la evaluación | Resultado |
|---|---|
| 1 oct 2026 | sin aviso; Envíos muestra «vence hoy» |
| 2 oct 2026 | aviso por correo interno a la dueña nominal con la cuenta, la fecha de la última salida y el enlace a la edición; Envíos muestra «vencida» |
| 3 oct 2026 | no se repite el aviso; sigue «vencida» |

### Edge case — cambio la cadencia de una cuenta

**Dado** que Bancolombia tiene cadencia de 30 días y su última salida registrada fue el 1 de septiembre de 2026,
**cuando** cambio su cadencia a 45 días,
**Entonces** su siguiente edición vence el 16 de octubre de 2026
**Y** el cambio queda en auditoría con quién lo hizo, cuándo y los dos valores

### Error — enlaces generados que nadie registró como enviados

**Dado** que la edición de octubre de Bancolombia tiene enlaces generados el 5 de octubre y nadie registró su salida,
**cuando** abro Envíos,
**Entonces** esa edición aparece «enlaces generados · sin salida registrada», no como enviada
**Y** el vencimiento de Bancolombia sigue contando desde la última salida registrada, el 1 de septiembre

### Edge case — una cuenta que nunca recibió una edición

**Dado** que Alpina tiene su primera edición en «borrador» y ninguna salida registrada,
**cuando** abro Envíos,
**Entonces** Alpina aparece «sin envíos todavía», sin fecha de vencimiento
**Y** la evaluación diaria no le envía ningún aviso de cadencia

## Notas

Cubre la parte de **RF-18.5** que vigila la cadencia: *cadencia definida y dueño nominal; con el registro de la salida el panel muestra cuándo vence la siguiente edición de cada cuenta y avisa al dueño por correo interno cuando se pasa*. **Sin cadencia no hay hábito, y sin hábito no hay O5.** El aviso es un correo interno por Mailgun (§8.3, ADR-0009: tarea diaria `evaluar_correo_curado`), nunca el boletín.

**Nace el 2026-10-02 por partición de HU-115** (validador: fallaba la S). **No es recorte**: la cadencia estaba en el edge «registrar la salida y la cadencia» de HU-115.

**Elegidas por el modelo por delegación del sponsor (2026-10-02):**
- **Cadencia por cuenta, mensual (30 días) por omisión, editable**: el prototipo dibuja ediciones mensuales y la spec deja la cadencia a Mercadeo (§6); 30 días coincide con la vigencia por omisión de los enlaces (RF-1.4, HU-114).
- **Vence el día de salida + cadencia; avisa al día siguiente y una sola vez por vencimiento**, para que el aviso no se vuelva ruido diario. El límite se prueba a los dos lados en la tabla.
- **Las ediciones sin salida registrada no reinician la cadencia**, y se ven como tales (spec §8: «nadie registra la salida»).

**Quién cambia la cadencia.** Quien puede escribir en Envíos (administración de inventario o permiso «Envíos», HU-233).

## Trazabilidad

Épica madre: **EP-011** · PRD v4.18 · RF-18.5 · RF-1.4 · §8.3 · O5 · ADR-0009 (UC-16, `evaluar_correo_curado`) · spec `docs/10-specs/correo-curado.md` (§6, §8) · prototipo `enlaces-y-contenido--cadencia-vencida` · depende de HU-230 · partida de HU-115 · relacionada con HU-117

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: lee las salidas de HU-230; el worker y el correo interno ya existen (EP-006, ADR-0009) |
| N | Negociable | ✓ fija vencimiento = salida + cadencia, aviso único al pasarse, que lo sin salida no reinicie y la cadencia editable; el valor por omisión y la forma del aviso son negociables |
| V | Valiosa | ✓ ninguna cuenta queda sin propuesta por olvido; el dueño se entera sin revisar el panel cada día |
| E | Estimable | ✓ S: un cálculo de fecha por cuenta, una tarea diaria con marca de aviso enviado y una columna editable |
| S | Pequeña | ✓ S: una capacidad (vigilar la cadencia) en cinco escenarios |
| T | Testeable | ✓ salidas sembradas, un reloj de la tarea fijado al 1, 2 y 3 de octubre de 2026, una cadencia cambiada a 45 días, una edición sin salida y una cuenta sin envíos dan fechas, estados y correos observables |
