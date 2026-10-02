---
id: HU-171
titulo: "Ver el tablero mensual de medición"
epica: EP-008
prioridad: alta
complejidad: M
estado: draft
fase: telemetria-y-medicion
prd_version: 4.18
depende_de: [HU-167, HU-190, HU-107]
---

# HU-171 — Ver el tablero mensual de medición

**Como** Dirección de Mercadeo, que responde ante Dirección General por los objetivos del portal,
**quiero** abrir en el panel el tablero de un mes con la conversión, los perfiles por solicitud, los días hasta la alineación agendada, el acierto de la curaduría y las diez búsquedas sin resultados más repetidas, cada indicador junto a su meta,
**para** reportar cada mes si el portal cumple sin que nadie tenga que sacar los datos a mano.

## Criterios de aceptación

### Happy path — el mes cerrado está listo sin trabajo manual

**Dado** que tengo el permiso «Medición» y terminó un mes en el que entraron cuentas con sesiones reales, algunas enviaron solicitudes, de una de esas solicitudes nunca llegó el evento «solicitud enviada», y la lectura diaria de HU-107 de hoy guardó en el portal la fecha «Agendada el» de las solicitudes que ya tienen la alineación agendada,
**cuando** abro el tablero de ese mes en Medición,
**Entonces** veo la conversión —cuentas con al menos una solicitud enviada en el mes entre cuentas que entraron en el mes— junto a la meta del 20 % y con el número de cuentas de cada lado, y los perfiles promedio por solicitud junto a la meta de 1,8
**Y** veo los días hábiles entre la solicitud enviada y la alineación agendada (O3) junto a la meta de 3 días hábiles, con cuántas solicitudes del mes siguen sin alineación agendada y la fecha de la última lectura de HubSpot
**Y** la solicitud sin evento cuenta igual en la conversión, en los perfiles por solicitud y en O3, porque el tablero las toma de las solicitudes registradas
**Y** cada solicitud cuenta en el mes en que se envió
**Y** nadie tuvo que cargar, exportar ni calcular nada para que aparezcan

### Edge case — un panel depende de algo que aún no está o no se actualizó

**Dado** que el panel del tablero está en la situación de la tabla,
**cuando** abro el tablero de un mes cerrado,
**Entonces** ese panel aparece como dice la tabla
**Y** la conversión y los perfiles por solicitud se muestran completos, sin esperar a ese panel

| Panel y situación | Cómo aparece |
|---|---|
| acierto de la curaduría, sin HU-109 construida | con su meta (70 %) y el rótulo «aún no se mide» |
| top 10 sin resultados, sin HU-172 construida | con su meta (top 10) y el rótulo «aún no se mide» |
| O3, sin la propiedad «Agendada el» en HubSpot (HU-107) | con su meta (3 días hábiles) y el rótulo «aún no se mide» |
| O3, con la última lectura de HubSpot de hace 2 días | con el último dato, su fecha y el aviso «dato de HubSpot de hace 2 días» |

### Edge case — mes sin actividad o en curso

**Dado** que el mes está en la situación de la tabla,
**cuando** abro su tablero,
**Entonces** los indicadores aparecen como dice la tabla

| Situación del mes | Indicadores |
|---|---|
| cerrado, sin ninguna cuenta con sesión real | cada uno dice «sin dato en este período» y ninguno muestra 0 % como si fuera un resultado |
| en curso | rotulados como parciales, con la fecha y la hora hasta las que cuentan |

### Edge case — las visitas internas y las demo quedan fuera

**Dado** que en el mes hubo, además de sesiones reales de clientes, visitas de personas de Trycore y visitas por enlaces generados con la casilla «demo»,
**cuando** abro el tablero,
**Entonces** los indicadores cuentan solo las sesiones reales y las solicitudes enviadas desde ellas
**Y** el tablero dice cuántas visitas internas y cuántas demo dejó fuera

### Error — quien no tiene el permiso «Medición»

**Dado** que entré al panel con un correo inscrito sin el permiso «Medición», sea administrador de inventario u observador,
**cuando** abro Medición, desde el menú o con su dirección,
**Entonces** no veo ningún indicador ni ninguna cifra del tablero
**Y** el panel me explica que Medición la consultan las personas con el permiso «Medición» y que lo concede un administrador del panel, en lugar de una pantalla vacía o un error genérico

## Notas

Es la **métrica de éxito de EP-008**: *el tablero mensual reporta conversión, acierto de la curaduría y el top 10 de búsquedas sin resultados sin intervención manual*. Reúne los KPI de §11 cuya fuente es la telemetría o el portal: conversión (O2, meta ≥ 20 %), perfiles promedio por solicitud (meta ≥ 1,8, que es también la métrica de EP-004), días hasta la alineación agendada (O3, meta ≤ 3 días hábiles, desde D75), acierto de la curaduría (meta ≥ 70 %, calculado en HU-109) y búsquedas sin resultados (top 10, calculado en HU-172). Vive en el destino **Medición** del menú del panel, hoy deshabilitado hasta que se construya esta épica.

**Decisiones del sponsor (2026-10-02) aplicadas.**
- **D66 — línea de release: MVP.** El tablero mensual entra con EP-008 en el MVP, no en v1.1. Resuelve el conflicto con el backlog y el flow (ver abajo).
- **D70 — conversión.** **Cuentas con al menos una solicitud enviada / cuentas que entraron**, por mes; la solicitud cuenta en el **mes de envío** (O2). «Entró en el mes» = tuvo al menos una sesión real con actividad en ese mes, así que la cuenta que envía en un mes siempre está en el denominador de ese mes. El happy path muestra los dos lados del cociente.
- **D68 — sesión real.** Código verificado de un correo que no es `@trycore.com`, por un enlace sin la casilla «demo» (HU-188). Internas y demo se cuentan aparte (edge).
- **D67 — quién ve Medición** (corregida por D74, abajo). Administradores, Mercadeo, Comercial y Dirección General; Talento Humano y la observadora no.
- **D74 (segunda ronda, corrige D67) — permiso «Medición» por persona.** Medición la abre quien tenga el **permiso «Medición»** en la lista nominal del panel, **independiente del rol**; lo concede y lo quita un administrador (**HU-190**). El acceso denegado explica el motivo (error), como pide la convención del proyecto: ninguna pantalla muda ante un 403. La regla vale para todo el destino Medición (también las lecturas de HU-108 a HU-112, HU-167, HU-170, HU-172 a HU-173 y HU-184 a HU-186); este escenario la prueba una vez. Se enmiendan RF-8.1.2 (nota v4.18) y ADR-0006 (enmienda 2026-10-02).
- **D75 (segunda ronda) — O3 en el tablero.** **Excepción de lectura** a «el portal no consulta HubSpot» (D55): la lectura diaria de «Agendada el» con el token privado (D76) **vive en HU-107**, que la guarda junto a la solicitud. Este tablero **solo la muestra**: calcula O3 con esa fecha ya guardada, sin leer HubSpot: días hábiles (calendario T-4) entre la solicitud enviada y «Agendada el», por solicitudes enviadas en el mes. Se añade al happy path y al edge de paneles pendientes (sin la propiedad en HubSpot o con la lectura atrasada); la historia sigue en cinco escenarios.

**Revisión 2026-10-02 (D67).** Para añadir el acceso denegado sin pasar de cinco escenarios, el mes sin actividad y el mes en curso se unen en un edge con tabla de ejemplos; ningún caso se pierde.

**Revisión 2026-10-02 (validador independiente: fallaba la I).** El tablero dependía de HU-109 y HU-172 para existir. Ahora entrega por sí solo sus indicadores propios (conversión, cuentas con solicitud y perfiles por solicitud) y muestra los paneles de acierto y de top 10 en estado «aún no se mide» hasta que esas dos historias estén construidas; cuando lo estén, los paneles se llenan sin cambiar el tablero. **No es recorte**: los cinco indicadores siguen en el alcance; solo cambia el orden en que pueden construirse. Para no pasar de cinco escenarios, la solicitud cuyo evento se perdió pasa del edge propio al happy path, con el mismo resultado observable.

**Las métricas comerciales no se duplican.** Oportunidades creadas y tasa de cierre se leen en HubSpot (ADR-0006, ADR-0005). Los días hasta la alineación (O3) son la excepción de D75: los cuenta el portal con la fecha que guarda la lectura diaria de HU-107.

**Dependencias de datos.** Las solicitudes las crea EP-005; sin ellas la conversión, los perfiles por solicitud y el acierto dicen «aún no se mide». Las consultas sin coincidencia llegan con EP-002. El tablero se construye y prueba con datos fijados del contrato de HU-167.

**Conflicto de release resuelto por D66.** El backlog (fila HU-059–HU-064) decía «MVP · tablero en v1.1» y que el primer trimestre los datos se leerían a mano; el sponsor decidió el tablero en el **MVP**. El flow de EP-008 quedó alineado el 2026-10-02; el backlog y el mapa de historias se alinearon el mismo día (nota D66 en ambos).

**Riesgo de D67 cerrado por D74.** Con los dos roles del panel (administrador = Talento Humano, observador = Mercadeo y Comercial) D67 no se podía expresar. D74 lo resuelve con un permiso por persona, independiente del rol (HU-190). El escenario de error deja de nombrar áreas y prueba el permiso con los dos roles.

**Dependencia con HU-107 (EP-007) por D75.** La propiedad «Agendada el» la crea Mercadeo en HubSpot, la marca el workflow y **la lectura diaria del worker que la trae al portal vive en HU-107** (D75), con su conteo de días hábiles T-4. Esta historia **solo muestra** O3 y la hora de la última lectura completa que HU-107 registra; no lee HubSpot ni tiene tarea propia, así que nada se construye dos veces. Mientras la propiedad no exista, O3 dice «aún no se mide» (edge). La lectura diaria implica que el dato puede tener hasta un día de atraso; el tablero muestra la fecha de la última lectura y avisa si se atrasa.

**Revisión de validación 2026-10-02.** Se quita la afirmación de que los días hasta la alineación se leen en HubSpot (contradecía D75) y la reclamación de la lectura diaria, que es de HU-107. HU-107 pasa a ser dependencia dura para el panel O3.

**Propuestas del modelo, negociables (no son decisiones del sponsor):** O3 se muestra como **mediana** de días hábiles de las solicitudes del mes ya agendadas, más el número de las que siguen sin agendar (para que una solicitud que nunca se agenda no desaparezca del indicador, como pide HU-107); el aviso de atraso aparece desde la segunda lectura fallida.

**Abierto para el sponsor:**
- Si el KPI «cuentas que envían al menos una solicitud ≥ 35 % de las cuentas contactadas» (trimestral) y «solicitudes con contexto completo ≥ 85 %» (O4, fuente portal) deben estar también en el tablero; el primero necesita las ediciones con salida registrada de EP-011.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · §3 O2 · §11 KPIs · RF-7.2 · RF-7.4 · métrica de éxito de EP-008 y de EP-004 · ADR-0006 (UC-17, QA-6) · §3 O3 · RF-9.1.3 · RF-8.1.2 (enmienda v4.18, D74) · ADR-0006 (enmienda 2026-10-02, D74) · D66, D67, D68 y D70 (sponsor, 2026-10-02) · D74 y D75 (segunda ronda) · relacionada con HU-188 · depende de HU-167, HU-190 (permiso «Medición») y HU-107 (lectura diaria de «Agendada el», EP-007, D75) · muestra los cálculos de HU-109 y HU-172 cuando existan

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: la captura de HU-167, el permiso de HU-190 y la lectura diaria de HU-107, que deja «Agendada el» guardada en el portal; se construye y entrega antes o después de HU-109 y HU-172, cuyos paneles muestra en «aún no se mide» hasta que existan; las solicitudes llegan con EP-005 y hasta entonces el tablero lo declara |
| N | Negociable | ✓ fija los indicadores, la definición de conversión (D70), sus metas del PRD, quién lo ve (permiso «Medición», D74), O3 desde la lectura diaria de HU-107 (D75), el cierre automático y los estados sin dato, parcial, «aún no se mide» y atrasado; la agregación de O3 (mediana), la disposición del tablero y su visualización son del equipo |
| V | Valiosa | ✓ es el informe que Mercadeo lleva a Dirección General cada mes y lo que hace cumplir la métrica de la épica |
| E | Estimable | ✓ M en el límite alto: pantalla de Medición en el panel, conversión por cuentas y mes de envío, perfiles por solicitud, exclusión de internas y demo, O3 a partir de la fecha que ya guardó HU-107 (sin adaptador de HubSpot aquí), dos paneles de HU-109 y HU-172 y la negación con explicación sobre el permiso de HU-190. D74 quitó la incertidumbre del acceso y D75 dejó la lectura en HU-107 |
| S | Pequeña | ✓ M: una pantalla con cinco escenarios (dos con tabla); el acierto y el top 10 se calculan en sus propias historias, el permiso se administra en HU-190 y la lectura de HubSpot para O3 vive en HU-107 |
| T | Testeable | ✓ meses fijados con actividad (incluida una solicitud sin evento), sin actividad, en curso y con visitas internas y demo, fechas «Agendada el» fijadas en las solicitudes como las deja HU-107 (y una última lectura completa de hace 2 días), un entorno sin HU-109 ni HU-172 y sesiones de administrador y observador sin el permiso dan cifras, rótulos y negaciones observables |
