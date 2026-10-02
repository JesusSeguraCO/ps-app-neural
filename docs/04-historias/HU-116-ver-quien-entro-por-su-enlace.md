---
id: HU-116
titulo: "Ver quién entró por su enlace"
epica: EP-011
prioridad: alta
complejidad: M
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-230, HU-112, HU-168]
---

# HU-116 — Ver quién entró por su enlace

> **Decisión de negocio 2026-09-27 (sponsor):** el boletín se confecciona y envía desde Gmail o HubSpot; el portal entrega la selección curada, el enlace de cada destinatario y el bloque de contenido para copiar (PRD v4.14, RF-18).

**Como** integrante de Mercadeo responsable de la distribución,
**quiero** ver por edición, por cuenta y por destinatario quién entró por su enlace, quién verificó su correo y quién llegó a solicitar,
**para** saber si el problema está en el portal, en la oferta o antes de llegar al portal.

## Criterios de aceptación

### Happy path — el seguimiento de una edición

**Dado** que la edición de septiembre salió el 1 de septiembre de 2026 a tres cuentas y, con sesiones reales, en Bancolombia `natalia.cardenas@bancolombia.com.co` entró por su enlace, verificó su correo y envió SOL-2026-0231, en Sura un destinatario entró y verificó sin solicitar, y en Alpina nadie entró,
**cuando** abro el seguimiento de la edición de septiembre en Envíos,
**Entonces** veo «3 cuentas · 2 entraron · 2 verificaron · 1 solicitó»
**Y** por cuenta y por destinatario veo si entró por su enlace, si verificó su correo y la solicitud con su identificador, con fecha y hora

### Error — la apertura del correo no la mide el portal

**Dado** que la edición de septiembre salió desde la herramienta de la tabla,
**cuando** abro su seguimiento,
**Entonces** la apertura del correo aparece como dice la tabla, nunca como un número

| Herramienta de la salida | Apertura del correo |
|---|---|
| HubSpot | «No la mide el portal · consúltala en HubSpot» |
| Gmail | «No la mide el portal · Gmail no la registra» |

### Edge case — una edición sin salida registrada

**Dado** que la edición de octubre de Alpina tiene enlaces generados y nadie registró su salida,
**cuando** abro el seguimiento de octubre,
**Entonces** Alpina aparece «sin salida registrada», no como una cuenta sin entradas
**Y** esa edición no cuenta para la regla de tres envíos (HU-117)

### Edge case — entra otro invitado del mismo enlace

**Dado** que el correo de la edición de septiembre de Bancolombia salió a Natalia y Andrés, y `mariana.ospina@bancolombia.com.co`, invitada del mismo enlace sin haber recibido el correo, entró y verificó,
**cuando** abro el seguimiento de Bancolombia,
**Entonces** su entrada aparece atribuida a la edición con su propio contacto, como «+1 invitado»
**Y** no se suma a las entradas de Natalia ni de Andrés

### Edge case — entró y no sumó perfiles

**Dado** que en Sura un destinatario entró por su enlace de la edición de septiembre, miró cuatro fichas y no sumó ningún perfil a su equipo,
**cuando** abro el seguimiento de Sura,
**Entonces** veo la lectura «Entró y no sumó perfiles»
**Y** la selección de Sura queda señalada para revisión antes de preparar su siguiente edición, porque el problema no es el canal sino la propuesta

## Notas

Cubre **RF-18.6** (el portal mide entrada por enlace, verificación y solicitud, atribuidas a cuenta, contacto y edición; la apertura no la mide el portal) sobre la atribución de **RF-7.3** (HU-112) y la entrada de HU-168. **Sustituye a «Ver quién abrió y quién entró»** (PRD v4.0): la apertura del correo pasa a la herramienta de envío por decisión del sponsor del 2026-09-27 (HubSpot la mide; Gmail no). El escenario de la apertura evita la conclusión más común y más equivocada de todo informe de correo.

**Refinamiento 2026-10-02 (discovery de EP-011).** Los Given describen estado con datos fijados; se añade la lectura **«entró y no sumó perfiles»**, que estaba en HU-117 como edge: es una lectura del seguimiento (spec §7, *se entra y no se suman perfiles → se revisa la selección*), no una reacción a la falta de entrada. Sube de S a M por el embudo por edición, la tabla de apertura y esta lectura. Ajustar el backlog si el sponsor lo aprueba.

**Fuente de los datos.** `telemetria.entradas_por_envio` (ADR-0006, enmienda 2026-09-27: solo conteos por edición, contacto y tipo, sin filas de evento), las salidas de HU-230 y las solicitudes con su edición de origen (EP-005, HU-112). **Solo sesiones reales** (D68): las internas y las demo no cuentan. «Sumó perfiles» es el evento de sumar al equipo (HU-192, EP-004).

**No es Medición.** El seguimiento vive en Envíos y no exige el permiso «Medición»; lo consultan quienes ven Envíos (HU-233). Muestra correos de destinatarios porque es la herramienta de quien distribuye; los informes de Medición siguen seudonimizados (ADR-0006).

## Trazabilidad

Épica madre: **EP-011** · PRD v4.18 · RF-18.6 · RF-7.3 · D68 (sponsor, 2026-10-02) · ADR-0006 (enmienda 2026-09-27, `entradas_por_envio`) · spec `docs/10-specs/correo-curado.md` (§7) · prototipo `seguimiento-envios`, `--sin-salida-registrada` · depende de HU-230, HU-112 y HU-168 (EP-008) · relacionada con HU-117, HU-192 y HU-233

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: lee salidas (HU-230) y entradas atribuidas (HU-112, HU-168, EP-008, que se construye antes); con datos sembrados se prueba sin clientes reales |
| N | Negociable | ✓ fija qué pasos se ven, que la apertura nunca sea un número, que lo sin salida se distinga y la lectura «entró y no sumó»; la disposición es negociable |
| V | Valiosa | ✓ dice dónde se pierde cada cuenta —antes del portal, en la puerta o en la propuesta— para corregir lo que de verdad falla |
| E | Estimable | ✓ M: una vista sobre una función de conteos ya diseñada, el cruce con salidas y solicitudes y dos lecturas derivadas |
| S | Pequeña | ✓ M: una lectura en cinco escenarios |
| T | Testeable | ✓ una edición sembrada con tres cuentas, salidas desde HubSpot y Gmail, una edición sin salida, un invitado extra y una visita sin sumar dan conteos, rótulos y señales observables |
