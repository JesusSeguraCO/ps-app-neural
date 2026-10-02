---
id: HU-072
titulo: "Seguir usando el portal cuando el servicio externo falla"
epica: EP-009
prioridad: alta
complejidad: S
estado: draft
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-067, HU-213]
---

# HU-072 — Seguir usando el portal cuando el servicio externo falla

**Como** líder de área que pegó un requerimiento porque necesita un perfil con urgencia,
**quiero** obtener criterios y resultados aunque el servicio externo de interpretación falle o tarde,
**para** no quedarme sin poder usar el portal justo el día que lo necesito.

## Criterios de aceptación

### Happy path — el servicio falla y el portal sigue

**Dado** que pegué un requerimiento largo con «backend», «Java» y «banca», veo el aviso de HU-213 y el servicio externo responde con error
**Cuando** elijo «Extraer criterios con Gemini»
**Entonces** en menos de 8 segundos veo las etiquetas «Desarrollador Backend», «Java» y «Banca» del intérprete propio y sus resultados
**Y** veo «No pudimos leer tu texto con el servicio externo; lo interpretamos con nuestras reglas. Revisa los criterios.», sin códigos de error ni pantalla en blanco
**Y** la lectura se muestra completa, no compacta (HU-068)

### Edge case — el servicio tarda

**Dado** que pegué un requerimiento largo y el servicio externo no responde en 6 segundos
**Cuando** elijo «Extraer criterios con Gemini»
**Entonces** a los 6 segundos veo los criterios del intérprete propio con el mismo aviso
**Y** si la respuesta del servicio llega después, no reemplaza los criterios que ya veo

### Error — tampoco el intérprete propio reconoce nada

**Dado** que el servicio externo falla y el texto que pegué no tiene ningún término del catálogo ni del léxico
**Cuando** elijo «Extraer criterios con Gemini»
**Entonces** veo «No encontramos criterios de perfil en tu texto» con mi texto conservado en la barra
**Y** la consulta queda registrada como consulta sin coincidencia con origen `larga_degradada`

### Edge case — el servicio se restablece

**Dado** que mi extracción anterior cayó al intérprete propio, el servicio externo ya responde y pegué otro requerimiento largo
**Cuando** elijo «Extraer criterios con Gemini»
**Entonces** los criterios llegan del servicio, marcados «extraído por servicio externo», sin recargar la página ni repetir lo anterior

### Edge case — la vuelta al intérprete propio no pasa en silencio

**Dado** que en las últimas 24 horas hubo las llamadas al servicio externo de la tabla
**Cuando** corre la vigilancia diaria del worker
**Entonces** el responsable técnico recibe o no la alerta «vuelta al determinista» según la tabla

| Llamadas elegibles en 24 h | Cayeron al intérprete propio | Alerta |
|---|---|---|
| 10 | 2 (20 %) | no |
| 10 | 3 (30 %) | sí |
| 9 | 9 (100 %) | no (menos de 10 llamadas) |

## Notas

Cubre **RF-12.2.1** («si Gemini falla o tarda, el portal aplica el intérprete determinista y lo dice») y **RF-16.1** (degradación a léxico controlado si la API falla), con **QA-15** (vuelta al determinista en 8 s o menos: **V4-7**, antes de cerrar EP-009) y la vigilancia de ADR-0004 (alerta si la tasa de vuelta supera el 20 % con al menos 10 llamadas en 24 h, tarea `vigilar` de ADR-0009).

**Refinada el 2026-10-02 (discovery de EP-009).** Tras D-24 la búsqueda corta nunca pasa por el modelo (HU-065), así que la degradación solo existe para el requerimiento pegado. El antiguo «cae a facetas» pasa a ser el mensaje del intérprete propio con el texto conservado; lo que muestra el cero lo decide EP-010.

**Decisión por delegación del sponsor (elegida por el modelo):** la respuesta tardía del servicio se descarta (no sustituye lo que el cliente ya ve), para que la pantalla no cambie debajo de quien está leyendo. Timeout de 6 s, de ADR-0004.

**Por qué sigue en draft.** Solo hay servicio externo en el requerimiento pegado de RF-12.2, que el PRD condiciona a la prueba previa **T-23** (pendiente). Refinada y con INVEST completo; sube a `lista` junto con HU-067 y HU-213.

**D131 (2026-10-02) — pendiente del sponsor.** Qué hacer con RF-12.2 si T-23 no se ejecuta (posible diferimiento) lo decide el sponsor, no el modelo. Mientras tanto esta historia sigue en `draft` junto con HU-067, HU-213 y HU-072; EP-009 arranca con sus 17 HU en `lista`.

## Trazabilidad

Épica madre: **EP-009** · PRD v4.18 · RF-12.2.1 · RF-16.1 · QA-15 · ADR-0004 (timeout, degradación, vigilancia, V4-7) · ADR-0009 (`vigilar`) · T-23 · D131 (pendiente del sponsor) · depende de HU-067 y HU-213 (misma épica)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✗ depende de HU-067, que el PRD condiciona a la prueba previa T-23 (pendiente) |
| N | Negociable | ✓ son fijos que el portal nunca muere con el servicio, que lo dice sin jerga, el límite de 8 s y la alerta; el texto del aviso se negocia |
| V | Valiosa | ✓ el cliente con urgencia no se queda sin portal y el equipo técnico se entera si el servicio cae en silencio |
| E | Estimable | ✓ S: timeout y respaldo local en el cliente, registro de la causa y la regla de la alerta sobre el registro de llamadas |
| S | Pequeña | ✓ S: cinco escenarios sobre un solo camino de respaldo |
| T | Testeable | ✓ integración con doble del servicio (error, demora, JSON inválido) y cronómetro; la alerta se prueba con registros de llamadas sembrados |
