---
id: HU-108
titulo: "Ver el embudo de cada cuenta"
epica: EP-008
prioridad: media
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.17
depende_de: [HU-167, HU-168]
---

# HU-108 — Ver el embudo de cada cuenta

**Como** Dirección de Mercadeo, que responde por la conversión del portal,
**quiero** ver, por cuenta y en total, cuántas visitas llegan a cada paso del recorrido: entrada, acceso, interacción, ficha abierta, perfil sumado, solicitud iniciada y solicitud enviada,
**para** saber en qué paso se cae la gente en lugar de suponerlo.

## Criterios de aceptación

### Happy path — el embudo del período

**Dado** que hubo visitas de clientes en el período,
**cuando** abro el embudo,
**Entonces** veo cuántas visitas alcanzaron cada paso y qué proporción pasó del paso anterior, en total y por cuenta
**Y** veo, junto a su meta, la proporción de visitas que abrieron al menos una ficha (meta de EP-003: al menos 60 %) y la de visitas que se quedaron en el aterrizaje sin ninguna interacción (meta de EP-001: por debajo del 30 %)

### Error — período sin actividad

**Dado** que en el período no hubo entradas de clientes,
**cuando** abro el embudo,
**Entonces** veo un mensaje que dice que no hubo actividad en ese período
**Y** no veo una fila de ceros sin explicación

### Edge case — un contacto con muchas visitas

**Dado** que un mismo contacto entró veinte veces en el período,
**cuando** reviso el embudo de su cuenta,
**Entonces** veo por separado el número de visitas y el de contactos distintos
**Y** esas veinte visitas no se cuentan como veinte personas

### Edge case — la visita se queda en la puerta

**Dado** que alguien abrió el enlace y nunca verificó su código,
**cuando** reviso el embudo,
**Entonces** esa visita cuenta en «entrada» y no en «acceso»
**Y** aparece sin contacto asignado

### Edge case — un paso que todavía no se mide

**Dado** que el portal aún no emite los eventos de un paso porque su pantalla no existe todavía,
**cuando** abro el embudo,
**Entonces** ese paso aparece como «aún no se mide»
**Y** no como cero ni como una caída del cien por ciento

## Notas

Cubre **RF-7.1** como lectura de conjunto y **O2**. Además mide dos métricas de éxito de otras épicas que dependen de la telemetría: la **tasa de rebote en el aterrizaje** de EP-001 (por debajo del 30 %) y la **proporción de sesiones que abren al menos una ficha** de EP-003 (al menos 60 %). Vista `v_embudo_cuenta` de ADR-0006. Las visitas internas no cuentan (HU-167).

**Cada visita cuenta en el último paso que alcanzó.** El evento «abandono» (HU-167) marca dónde terminó; «solicitud enviada» se toma de las solicitudes registradas, no del navegador (ADR-0006). La entrada y el acceso salen de HU-168.

**El último edge es lo que permite construir EP-008 antes que las épicas que emiten.** Hoy existen el aterrizaje y la ficha (EP-001); la búsqueda (EP-002), «Mi equipo» (EP-004) y la solicitud (EP-005) aún no. El embudo nace completo y cada paso empieza a medirse cuando su épica emite, sin mostrar ceros falsos entre tanto.

**Línea de release:** el mapa de historias pone esta historia en **v1.1** (columna H del backbone 3). No es recorte: está entera en EP-008.

**Abierto para el sponsor:**
- **Definición de rebote** para la métrica de EP-001. El AC usa la más conservadora: visita con acceso concedido que no registra ninguna otra interacción. ¿Es esa la que se quiere, o debe haber un tiempo mínimo?
- **Definición de abandono** (ADR-0006, R-31): cierre de la página o inactividad. ¿Hay ventana de inactividad que dé la visita por terminada?

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-7.1 · O2 · métricas de éxito de EP-001 y EP-003 · ADR-0006 (`v_embudo_cuenta`, R-31) · depende de HU-167 y HU-168

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: lee la captura de HU-167 y la entrada de HU-168; los pasos de épicas no construidas se declaran «aún no se mide», así que no espera a ninguna |
| N | Negociable | ✓ fija los pasos, el conteo por visita y por contacto y los estados sin dato; la visualización del embudo es negociable, y las definiciones de rebote y abandono quedan abiertas |
| V | Valiosa | ✓ dice dónde se pierde la conversión y mide dos métricas de éxito que sin esto no tienen fuente |
| E | Estimable | ✓ M: una consulta por paso sobre la secuencia de la visita, con desglose por cuenta y conteo de contactos distintos |
| S | Pequeña | ✓ M: una lectura en cinco escenarios |
| T | Testeable | ✓ visitas fijadas que llegan a cada paso, un contacto con veinte visitas, una visita sin código y un paso sin eventos dan conteos observables |
