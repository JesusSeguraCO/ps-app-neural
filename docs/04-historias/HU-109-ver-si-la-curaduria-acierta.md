---
id: HU-109
titulo: "Ver si la curaduría acierta"
epica: EP-008
prioridad: alta
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.17
depende_de: [HU-167, HU-112]
---

# HU-109 — Ver si la curaduría acierta

**Como** integrante de Mercadeo que arma la selección curada de cada cuenta,
**quiero** saber qué proporción de las solicitudes incluye al menos un perfil de los que propusimos, y cuántas fichas se abren del conjunto curado frente a las de descubrimiento,
**para** saber si el criterio con que armo la selección acierta o si la gente termina buscando otra cosa.

## Criterios de aceptación

### Happy path — el acierto del período

**Dado** que en el período se enviaron solicitudes desde enlaces con conjunto curado,
**cuando** abro el acierto de la curaduría,
**Entonces** veo qué porcentaje de esas solicitudes incluye al menos un perfil del conjunto curado de su enlace, en total y por cuenta, junto a la meta del 70 %
**Y** veo cuántas fichas abiertas fueron del conjunto curado y cuántas de descubrimiento

### Edge case — una solicitud mezcla curados y descubiertos

**Dado** que una solicitud lleva un perfil del conjunto curado y dos encontrados al ampliar la búsqueda,
**cuando** se calcula el acierto,
**Entonces** esa solicitud cuenta como acierto

### Error — solicitudes sin selección previa

**Dado** que algunas solicitudes vienen de enlaces sin conjunto curado,
**cuando** abro el acierto,
**Entonces** esas solicitudes quedan fuera del cálculo y no cuentan como fallo de la curaduría
**Y** el informe dice cuántas dejó fuera

### Edge case — el cliente pidió solo lo que descubrió

**Dado** que una solicitud lleva solo perfiles encontrados al ampliar la búsqueda,
**cuando** se calcula el acierto,
**Entonces** esa solicitud cuenta como no acierto
**Y** junto a ella veo los filtros que aplicó y lo que buscó esa visita, para corregir la próxima selección

### Edge case — el perfil propuesto ya no estaba disponible

**Dado** que el conjunto curado tenía un perfil que, al abrir el enlace, aparecía colocado o pausado, y la solicitud no lo incluyó,
**cuando** se calcula el acierto,
**Entonces** la solicitud cuenta como no acierto, según la definición del KPI
**Y** queda señalada como «perfil curado no disponible al abrir», para distinguir un fallo del criterio de un cambio del inventario

## Notas

Cubre **RF-7.4** completo: el indicador de acierto (KPI de §11: *solicitudes que incluyen al menos un perfil del conjunto curado*, meta ≥ 70 %, mensual) y la distinción curado / descubrimiento en la interacción (fichas abiertas), que HU-167 calcula en el servidor. Es el indicador más útil del proyecto para Mercadeo: mide el criterio con que se arma el correo, no el portal. Vista `v_acierto_curaduria` de ADR-0006. Aparece en el tablero de HU-171, que entra en el **MVP** (D66).

**Fuentes.** Las solicitudes con sus perfiles las crea EP-005; los filtros y las búsquedas, EP-002; el estado de cada perfil al abrir el enlace (RF-19.2) ya existe en EP-001. Mientras EP-005 no exista, el acierto dice «aún no se mide». Solo cuentan las **sesiones reales** (D68): código verificado de un correo que no es `@trycore.com`, por un enlace que no se generó con la casilla «demo» (HU-188); las visitas internas y las demo se registran, marcadas, pero quedan fuera de los indicadores (HU-167). Una solicitud enviada desde una sesión demo o interna no entra ni en el numerador ni en el denominador.

**Resuelto por el sponsor (D73, 2026-10-02), opción conservadora:** el perfil curado que no estaba disponible al abrir el enlace **cuenta como fallo de la curaduría** (no acierto), como dice la definición literal del KPI; el caso queda señalado aparte para distinguir un fallo del criterio de un cambio del inventario. Es lo que ya decía el último edge; no cambia el AC.

**Complejidad.** Se mantiene S como en el backlog: es un cruce entre solicitudes y conjunto curado, más un conteo de fichas que ya viene marcado desde la captura.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-7.4 · §11 KPI de acierto · O2 · ADR-0006 (`v_acierto_curaduria`) · D66, D68 y D73 (sponsor, 2026-10-02) · depende de HU-167 y HU-112

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: usa la marca curado / descubrimiento de HU-167 y el enlace de origen de HU-112; las solicitudes llegan con EP-005 y hasta entonces lo declara |
| N | Negociable | ✓ fija la definición del KPI (confirmada por D73 para el perfil no disponible), qué se excluye y qué se señala; la presentación por cuenta es negociable |
| V | Valiosa | ✓ le dice a Mercadeo si el criterio con que arma la selección sirve, que es la razón de ser de la épica |
| E | Estimable | ✓ S: un cruce de solicitudes con el conjunto curado del enlace y un conteo de fichas por ámbito |
| S | Pequeña | ✓ S: una lectura en cinco escenarios |
| T | Testeable | ✓ solicitudes fijadas con perfiles curados, mixtos, solo descubiertos, sin selección previa y con un perfil curado pausado dan porcentajes y señales esperados |
