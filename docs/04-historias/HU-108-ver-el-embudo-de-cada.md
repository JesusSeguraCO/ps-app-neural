---
id: HU-108
titulo: "Ver el embudo de cada cuenta"
epica: EP-008
prioridad: media
complejidad: M
estado: lista
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

Cubre **RF-7.1** como lectura de conjunto y **O2**. Además mide dos métricas de éxito de otras épicas que dependen de la telemetría: la **tasa de rebote en el aterrizaje** de EP-001 (por debajo del 30 %) y la **proporción de sesiones que abren al menos una ficha** de EP-003 (al menos 60 %). Vista `v_embudo_cuenta` de ADR-0006. Solo cuentan las **sesiones reales** (D68): código verificado de un correo que no es `@trycore.com`, por un enlace que no se generó con la casilla «demo» (HU-188); las visitas internas y las demo se registran, marcadas, pero quedan fuera de los indicadores (HU-167). Los pasos de «entrada» previos a la sesión siguen la misma regla: una entrada por un enlace demo no cuenta.

**Cada visita cuenta en el último paso que alcanzó.** El evento «abandono» (HU-167) marca dónde terminó; «solicitud enviada» se toma de las solicitudes registradas, no del navegador (ADR-0006). La entrada y el acceso salen de HU-168. La visita se da por terminada al cerrar la pestaña o tras **30 minutos sin actividad** (D73, HU-167). Abrir un enlace revocado o vencido es un **intento de entrada**, no una entrada (D73, HU-168): no suma al primer paso del embudo.

**El último edge es lo que permite construir EP-008 antes que las épicas que emiten.** Hoy existen el aterrizaje y la ficha (EP-001); la búsqueda (EP-002), «Mi equipo» (EP-004) y la solicitud (EP-005) aún no. El embudo nace completo y cada paso empieza a medirse cuando su épica emite, sin mostrar ceros falsos entre tanto.

**Línea de release: MVP** (D66, sponsor 2026-10-02). El tablero mensual y sus lecturas entran con EP-008 en el MVP, no en v1.1. El mapa de historias (columna H del backbone 3) y el backlog todavía la ponen en v1.1: hay que actualizarlos.

**Resuelto por el sponsor (D73, 2026-10-02), opción conservadora:**
- **Abandono** (ADR-0006, R-31): la visita termina al cerrar la página o tras **30 minutos sin actividad**.
- **Rebote** (métrica de EP-001): visita con acceso concedido que no registra ninguna otra interacción antes de terminar, sin tiempo mínimo. Es la definición que ya usaba el AC.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-7.1 · O2 · métricas de éxito de EP-001 y EP-003 · ADR-0006 (`v_embudo_cuenta`, R-31) · D66, D68 y D73 (sponsor, 2026-10-02) · relacionada con HU-188 · depende de HU-167 y HU-168

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: lee la captura de HU-167 y la entrada de HU-168; los pasos de épicas no construidas se declaran «aún no se mide», así que no espera a ninguna |
| N | Negociable | ✓ fija los pasos, el conteo por visita y por contacto y los estados sin dato; la visualización del embudo es negociable; rebote, abandono (30 min) y sesión real quedan fijados por D68 y D73 |
| V | Valiosa | ✓ dice dónde se pierde la conversión y mide dos métricas de éxito que sin esto no tienen fuente |
| E | Estimable | ✓ M: una consulta por paso sobre la secuencia de la visita, con desglose por cuenta y conteo de contactos distintos |
| S | Pequeña | ✓ M: una lectura en cinco escenarios |
| T | Testeable | ✓ visitas fijadas que llegan a cada paso, un contacto con veinte visitas, una visita sin código, una visita demo, un enlace revocado abierto y un paso sin eventos dan conteos observables |
