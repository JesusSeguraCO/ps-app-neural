---
id: HU-106
titulo: "Distinguir lo que entra por el portal de lo que entra por gestión"
epica: EP-007
prioridad: alta
complejidad: S
estado: draft
fase: integracion-hubspot
prd_version: 4.18
depende_de: [HU-102]
---

# HU-106 — Distinguir lo que entra por el portal de lo que entra por gestión

**Como** directora de Mercadeo que mide el rendimiento de la línea,
**quiero** que todo negocio que crea el portal llegue a HubSpot con su origen, su medio y su campaña marcados,
**para** comparar el portal contra los negocios que entran por gestión comercial en lugar de suponer que funciona.

## Criterios de aceptación

### Happy path [portal] — solicitud desde una edición curada

**Dado** que un cliente envió una solicitud en una sesión que entró por el enlace de una edición curada,
**cuando** el worker crea el negocio en HubSpot,
**Entonces** el negocio lleva el origen «portal-people», el medio «curado» y como campaña el identificador de esa edición, en las propiedades de origen y campaña que fije Mercadeo

### Edge case [portal] — solicitud a medida o por descubrimiento, sin edición

**Dado** que un cliente envió una solicitud desde un enlace sin edición curada,
**cuando** el worker crea el negocio, según la tabla,
**Entonces** el negocio lleva el origen «portal-people» y el medio de la tabla
**Y** la campaña queda vacía, en lugar de un valor inventado

| Solicitud | Medio |
|---|---|
| con perfiles del banco | `descubrimiento` |
| de perfil a medida, sin perfiles del banco | `a-medida` |

### Error [portal] — el origen no se puede determinar

**Dado** que una solicitud guardada no trae ni perfiles del banco ni una especificación a medida, un dato fuera de contrato,
**cuando** el worker prepara la creación del negocio,
**Entonces** no crea el negocio con un origen inventado
**Y** la solicitud queda en la bandeja de fallos con el motivo «origen no determinable» y el responsable técnico recibe el aviso inmediato

### Happy path [HubSpot] — el origen se puede filtrar en HubSpot

**Dado** que el worker creó negocios del portal con los tres medios,
**cuando** Mercadeo filtra los negocios del pipeline «Comercial (People y Tecnología)» por origen,
**Entonces** los del portal aparecen separados de los creados a mano por gestión comercial
**Y** cada negocio del portal muestra su medio (curado, descubrimiento o a medida) y, si la tiene, su campaña

## Notas

Cubre **RF-9.1.1** con el mecanismo de la **enmienda v4.18 del PRD** corregida por **D76**. Sin origen, el pipeline propio (D-6) impide comparar el portal con los demás orígenes, que es el KPI «tasa de cierre de oportunidades originadas en el portal» de §11.

**Revisión 2026-10-02, segunda ronda (D76).** Con la API ya no hay envío de formulario ni `context.pageUri`, así que los UTM de la versión D54 no viajan solos. D76 deja dos caminos y **los confirma Mercadeo**: (a) **propiedades por defecto** del negocio o del contacto que admitan escribirse por API (candidatas a comprobar: la propiedad de campaña de HubSpot si la suscripción la tiene, y las fuentes de tráfico, que HubSpot calcula y en un registro creado por una app privada suelen quedar como «fuentes sin conexión» con la app como detalle); (b) la **propuesta de D54** (origen `portal-people`, medio `curado|descubrimiento|a-medida`, campaña `<edición>`) llevada a la propiedad por defecto que Mercadeo designe. Lo que fija la historia, sea cual sea el camino: los tres medios se distinguen, nada nace sin origen y la campaña no se inventa. **D76 limita las propiedades nuevas a 2** («Id solicitud People Service» y «Solicitudes People Service»): si ninguna propiedad por defecto sirve, una tercera la decide Mercadeo con el sponsor. **No se recorta.**

**Criterio de los tres medios (propuesta):** `curado` = la sesión entró por el enlace de una edición curada (atribución de RF-7.3, HU-112); `descubrimiento` = solicitud con perfiles del banco desde un enlace sin edición; `a-medida` = sin perfiles del banco (HU-077, HU-100). Mercadeo puede cambiar los nombres.

**Por verificar en el HubSpot real (prueba de capacidades D84, solo lectura, antes del DoR):** qué propiedades por defecto de origen y campaña son escribibles por API en el negocio y en el contacto, y qué fuente original conserva un contacto que ya existía (no debe pisarse).

**Negocios creados a mano sin origen.** El informe que los muestra como «no especificado» se arma en HubSpot: es configuración.

**D85 (2026-10-02).** El pipeline es compartido («Comercial (People y Tecnología)»): los negocios de la línea se aíslan con `soluciones_ofrecidas` = «People Service» y, dentro de ellos, los del portal se distinguen por «Id solicitud People Service» (solo lo llevan los creados por el portal) además del origen de esta historia.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.18 · RF-9.1.1 · D-6 · §11 (KPI de tasa de cierre por origen) · D54, D76, D84 (sponsor, 2026-10-02) · ADR-0009 (enmienda D76) · depende de HU-102 · relacionada con HU-077 (EP-010), HU-112 (EP-008), HU-164 y HU-166

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: añade tres valores a la creación del negocio de HU-102; la edición se siembra si EP-008/EP-011 no están construidas |
| N | Negociable | ✓ fija que nada del portal nace sin origen y que los tres medios se distinguen; propiedades y valores exactos los confirma Mercadeo |
| V | Valiosa | ✓ sin origen no hay forma de saber si el portal produce negocios que cierran |
| E | Estimable | ✗ hasta que Mercadeo designe las propiedades (D76) tras la prueba de capacidades D84; el lado del portal es S en cualquiera de los dos caminos (tres valores en la creación) |
| S | Pequeña | ✓ S: cuatro escenarios sobre una sola marca de origen |
| T | Testeable | ✓ el doble de la API muestra origen, medio y campaña de cada tipo de solicitud y el rechazo sin origen; en HubSpot, negocios ficticios de los tres tipos se filtran por origen |
