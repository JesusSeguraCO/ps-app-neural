---
id: HU-117
titulo: "Reaccionar a una cuenta que no entra"
epica: EP-011
prioridad: media
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-230, HU-231, HU-112]
---

# HU-117 — Reaccionar a una cuenta que no entra

> **Decisión de negocio 2026-09-27 (sponsor):** el boletín se confecciona y envía desde Gmail o HubSpot; el portal entrega la selección curada, el enlace de cada destinatario y el bloque de contenido para copiar (PRD v4.14, RF-18).

**Como** ejecutivo comercial dueño de la cuenta,
**quiero** que me avisen cuando una de mis cuentas acumula tres ediciones seguidas con salida registrada sin que nadie entre por sus enlaces,
**para** tratarlo como lo que es, una señal comercial, y no como un problema de correo.

## Criterios de aceptación

### Happy path — tres ediciones seguidas sin entrada

**Dado** que Colsubsidio, con ejecutivo `camilo.duarte@trycore.com`, tiene tres ediciones seguidas con salida registrada, sin rebote registrado, cuyo ciclo cerró sin ninguna entrada de la cuenta por sus enlaces,
**cuando** corre la evaluación diaria,
**Entonces** Camilo recibe un aviso por correo interno con el histórico de las tres ediciones: fecha de salida, herramienta, destinatarios y perfiles propuestos
**Y** Colsubsidio queda marcada «para revisión», y la marca se ve al preparar su siguiente edición (HU-229)

### Edge case — cuántas ediciones hacen falta

**Dado** que Colsubsidio tiene las últimas ediciones de la tabla, todas con salida registrada, sin rebote y con el ciclo cerrado,
**cuando** corre la evaluación diaria,
**Entonces** el resultado es el de la tabla

| Últimas ediciones | Resultado |
|---|---|
| 2, ninguna con entrada | sin aviso; el seguimiento muestra «a una edición del aviso» |
| 3, ninguna con entrada | aviso al ejecutivo y cuenta marcada para revisión |
| 3, pero en la segunda hubo una entrada | sin aviso; la racha es de 1, la tercera |

### Error — un posible problema de entrega

**Dado** que la herramienta de envío reportó rebote para `juliana.r@alpina.com` en la edición de octubre de Alpina,
**cuando** registro el rebote de ese destinatario en el panel,
**Entonces** esa edición deja de contar para la regla de tres ediciones
**Y** el destinatario queda señalado «rebote: corregir el correo antes de la siguiente edición»

### Edge case — ediciones sin salida registrada

**Dado** que Alpina tiene dos ediciones con salida registrada y sin entrada y una tercera con enlaces generados y sin salida registrada,
**cuando** corre la evaluación diaria,
**Entonces** la tercera no cuenta como envío
**Y** no se envía ningún aviso

### Edge case — la cuenta vuelve a entrar

**Dado** que Colsubsidio está marcada «para revisión» tras tres ediciones sin entrada,
**cuando** un destinatario de Colsubsidio entra por el enlace de su siguiente edición,
**Entonces** la marca «para revisión» se retira y la racha vuelve a cero
**Y** el seguimiento muestra la entrada

## Notas

Cubre **RF-18.6**: *una cuenta que no entra en tres envíos con salida registrada es una señal comercial, no un fallo de entregabilidad: se avisa al ejecutivo antes de preparar la siguiente edición*. **La regla pasa de «tres envíos sin abrir» a «tres envíos sin entrar»** por decisión del sponsor del 2026-09-27: la apertura la mide la herramienta de envío, no el portal (T-10, 2026-09-25, por la poca fiabilidad del píxel). Tarea diaria `evaluar_correo_curado` de ADR-0009: *tres ediciones con salida registrada, sin rebote registrado y sin entrada → aviso interno al ejecutivo y cuenta marcada*.

**Refinamiento 2026-10-02 (discovery de EP-011).** El edge «entra pero nunca suma perfiles» pasa a **HU-116**, porque es una lectura del seguimiento (la propuesta no le habla), no una reacción a la falta de entrada. Se añaden el límite de 2/3 y la racha, y el retiro de la marca.

**Elegidas por el modelo por delegación del sponsor (2026-10-02):**
- **«Seguidas»**: una entrada en cualquier edición corta la racha (prototipo `seguimiento-envios`: *ediciones seguidas con salida registrada y sin ninguna entrada*).
- **Cuándo una edición cuenta «sin entrada»**: cuando **cierra su ciclo** —vence la cadencia de la cuenta (HU-231)— sin ninguna entrada de la cuenta por sus enlaces. Así la tercera no se cuenta el mismo día en que sale, y el aviso llega cuando toca preparar la siguiente, como pide RF-18.6.
- **El rebote lo registra quien distribuye**, por destinatario (`edicion_destinatarios.rebote_registrado`, ADR-0009), porque el portal no recibe los rebotes del boletín (sale por Gmail o HubSpot); una edición con un rebote registrado no cuenta.
- **El aviso sale una vez por racha**; la marca se retira con la siguiente entrada.

«Abre pero nunca entra» solo se puede leer en HubSpot cuando el envío salió desde allí (spec §7).

## Trazabilidad

Épica madre: **EP-011** · PRD v4.18 · RF-18.6 · RF-7.3 · T-10 · ADR-0009 (UC-16, `evaluar_correo_curado`) · ADR-0006 (`entradas_por_envio`) · spec `docs/10-specs/correo-curado.md` (§7) · prototipo `seguimiento-envios--cuenta-escalada`, `--entregabilidad` · depende de HU-230 (salidas), HU-231 (ciclo por cadencia) y HU-112 (atribución, EP-008) · relacionada con HU-116 y HU-229

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: lee salidas, cadencia y entradas atribuidas; el ejecutivo viene de la edición (HU-229); se prueba con ediciones sembradas y reloj fijado |
| N | Negociable | ✓ fija tres ediciones seguidas, que el rebote y lo sin salida no cuenten, el aviso al ejecutivo y la marca; la forma del aviso es negociable |
| V | Valiosa | ✓ convierte una métrica que nadie miraría en una acción comercial a tiempo, antes de la siguiente edición |
| E | Estimable | ✓ S: una regla en la tarea diaria existente, una marca por cuenta, el registro del rebote y un correo interno |
| S | Pequeña | ✓ S: una regla en cinco escenarios |
| T | Testeable | ✓ cuentas sembradas con 2 y 3 ediciones sin entrada, una racha cortada, un rebote, una edición sin salida y una entrada nueva dan avisos, marcas y conteos observables |
