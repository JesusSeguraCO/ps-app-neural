---
id: HU-164
titulo: "Resolver desde el panel las solicitudes que no llegaron a HubSpot"
epica: EP-007
prioridad: alta
complejidad: M
estado: lista
fase: integracion-hubspot
prd_version: 4.18
depende_de: [HU-105]
---

# HU-164 — Resolver desde el panel las solicitudes que no llegaron a HubSpot

**Como** administradora del panel de Talento Humano,
**quiero** ver en la bandeja de fallos las solicitudes cuyo negocio no se pudo crear en HubSpot, reintentarlas o enlazarlas al negocio que alguien creó a mano,
**para** saber en todo momento qué solicitudes no están en el CRM y sacarlas de ahí sin pedirle nada a Tecnología.

## Criterios de aceptación

### Happy path [portal] — ver qué está atascado y por qué

**Dado** que hay solicitudes con tres o más intentos fallidos y otras con un error que no se arregla solo,
**cuando** abro «Fallos con HubSpot» en el panel,
**Entonces** veo cada una con su código, cuenta, quién solicita, perfiles, el último error de HubSpot, cada intento con su hora y resultado, y la hora del próximo intento o «sin reintento automático»
**Y** veo cuántas hay en reintento inicial con uno o dos fallos, sin aviso
**Y** veo las que salieron de la bandeja en los últimos 7 días y cómo salieron

### Happy path [portal] — enlazar el negocio creado a mano

**Dado** que alguien creó a mano en HubSpot el negocio de una solicitud de la bandeja y escribí su ID o su enlace en «Ya lo creé en HubSpot…»,
**cuando** confirmo,
**Entonces** el portal comprueba en HubSpot que ese negocio existe y está en el pipeline «Comercial (People y Tecnología)»
**Y** le escribe el «Id solicitud People Service» de la solicitud, para que ningún reintento cree otro negocio
**Y** la solicitud sale de la bandeja como «enlazada a un negocio creado a mano», con el enlace, quién la enlazó y cuándo

### Error [portal] — el negocio indicado no sirve

**Dado** que una solicitud está en la bandeja y en «Ya lo creé en HubSpot…» escribí un ID que no existe, está fuera del pipeline «Comercial (People y Tecnología)» o ya tiene el identificador de otra solicitud,
**cuando** confirmo,
**Entonces** el panel no la enlaza y me dice cuál de los tres casos es
**Y** la solicitud sigue en la bandeja con su reintento como estaba

### Edge case [portal] — reintentar ahora

**Dado** que una solicitud de la bandeja tiene su próximo intento dentro de 40 minutos o no tiene reintento automático, y ya se corrigió la causa,
**cuando** toco «Reintentar ahora»,
**Entonces** el intento se hace en el minuto siguiente, con el mismo identificador SOL
**Y** si HubSpot crea el negocio, la solicitud sale de la bandeja como «registrada en HubSpot en el intento N»

## Notas

Cubre la **bandeja de fallos** que RF-9.6 pide como «alerta al responsable» y que ADR-0009 hace visible en el panel (CRN-4). Es la mitad visible de HU-105 y HU-166. Mecanismo de la **enmienda v4.18 del PRD** corregida por **D76**.

**Revisión 2026-10-02, segunda ronda (D76, corrige D52).** Con la API, el portal **vuelve a poder leer** el negocio (`crm.objects.deals.read`), así que el enlace manual **se verifica** otra vez y se recupera el prototipo aprobado: «Ya lo creé en HubSpot…» con comprobación del ID. Escribir el identificador en el negocio manual (`crm.objects.deals.write`) cierra el riesgo que tenía la versión anterior: un reintento posterior choca con el valor único y no duplica. El error «marcar sin referencia» se sustituye por «el negocio indicado no sirve», que cubre también la referencia vacía (no existe). Las solicitudes con error permanente (HU-166) no tienen reintento automático y salen con «Reintentar ahora» tras corregir la causa o al enlazarlas.

**Quién llama a HubSpot:** el token vive **solo en el worker** (ADR-0009, enmienda D76). El panel encola un trabajo `enlazar_negocio` y muestra su resultado en segundos; no recibe el token. **Por confirmar con Tecnología.**

**Si al enlazar HubSpot no responde:** el panel lo dice y no enlaza; se intenta de nuevo a mano. No se guarda una referencia sin verificar.

**Reintentar varias a la vez.** Si 20 solicitudes chocan con la misma causa (HU-166), hoy se reintentan una a una. **Pregunta abierta:** ¿se quiere «reintentar todas las de esta causa»? Sería alcance nuevo; los escenarios no lo suponen.

**Quién actúa en la bandeja:** supuesto, solo el rol administrador, como en el resto del panel (ADR-0002). Sigue abierto si el observador (Mercadeo, Comercial) la ve.

**Prototipo aprobado:** `integraciones-fallidas`, `--marcar-creado`, `--vacia` (Operación › Fallos, con contador en el menú). Con D76 vuelven los textos del prototipo «Ya lo creé en HubSpot»; «Reenviar» pasa a «Reintentar» y «HubSpot confirmó» a «Registrada en HubSpot»: **marcados para revisión de copy**.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.18 · RF-9.6 · D52 (sustituida en parte), D55, D76 (sponsor, 2026-10-02) · ADR-0009 (CRN-4, bandeja de fallos; enmienda D76) · prototipo `integraciones-fallidas` · depende de HU-105 · relacionada con HU-107, HU-165 y HU-166

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: muestra y actúa sobre los fallos que producen HU-105 y HU-166 |
| N | Negociable | ✓ fija qué se ve, que el enlace manual se verifica y deja el identificador en el negocio, y el reintento inmediato; la disposición sigue al prototipo y se negocia |
| V | Valiosa | ✓ ninguna solicitud atascada es invisible y Talento Humano la saca sin pedir ayuda, sin riesgo de un segundo negocio |
| E | Estimable | ✓ M: una pantalla del panel con dos acciones sobre la cola, una lectura y una escritura del negocio con el adaptador de HU-102 |
| S | Pequeña | ✓ M: una capacidad (resolver lo atascado) en cuatro escenarios |
| T | Testeable | ✓ con solicitudes sembradas en distintos estados y un doble de la API se ven la bandeja, el enlace verificado con el identificador escrito, los tres rechazos y el reintento |
