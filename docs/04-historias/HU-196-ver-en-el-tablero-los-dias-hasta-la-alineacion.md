---
id: HU-196
titulo: "Ver en el tablero los días hasta la alineación agendada"
epica: EP-007
prioridad: alta
complejidad: S
estado: lista
fase: telemetria-y-medicion
prd_version: 4.18
depende_de: [HU-171, HU-107]
---

# HU-196 — Ver en el tablero los días hasta la alineación agendada

**Como** Dirección de Mercadeo, que responde ante Dirección General por el arranque comercial,
**quiero** ver en el tablero mensual cuántos días hábiles pasan entre la solicitud enviada y la alineación agendada, junto a la meta de 3 días hábiles y con las solicitudes que siguen sin agendar,
**para** reportar O3 cada mes sin pedirle a Comercial que cuente fechas a mano.

## Criterios de aceptación

### Happy path — O3 del mes cerrado

**Dado** que tengo el permiso «Medición», terminó un mes con 7 solicitudes enviadas desde sesiones reales, la lectura diaria de HU-107 guardó «agendada el» en 5 de ellas, con 1, 2, 2, 5 y 9 días hábiles desde el envío, y otras dos siguen sin agendar,
**cuando** abro el tablero de ese mes en Medición,
**Entonces** el panel O3 muestra la mediana «2 días hábiles» y «60 % agendadas en 3 días hábiles o menos» (3 de 5), junto a la meta de 3 días hábiles
**Y** dice que 2 solicitudes del mes siguen sin alineación agendada, sin descartarlas ni contarlas como 0 días
**Y** muestra la fecha y la hora de la última lectura completa de HubSpot
**Y** cada solicitud cuenta en el mes en que se envió

### Error — la lectura de HubSpot se atrasó

**Dado** que la última lectura completa de HU-107 fue hace 2 días porque las de ayer y hoy fallaron,
**cuando** abro el tablero de un mes cerrado,
**Entonces** el panel O3 muestra el último dato que tiene, con su fecha, y el aviso «dato de HubSpot de hace 2 días»
**Y** no lo presenta como un dato al día
**Y** los demás indicadores del tablero se muestran completos, sin esperar a O3

### Edge case — todavía no hay lectura de HubSpot

**Dado** que la lectura diaria de HU-107 aún no se ha completado ninguna vez,
**cuando** abro el tablero de un mes cerrado con solicitudes enviadas,
**Entonces** el panel O3 aparece con su meta (3 días hábiles) y el rótulo «aún no se mide»
**Y** no muestra 0 días ni da todas las solicitudes por no agendadas

### Edge case — se agenda en el mes siguiente y con festivo

**Dado** que una solicitud se envió el viernes 30 oct 2026 a las 10:00, el lunes 2 nov 2026 es festivo en Colombia y la lectura diaria del 4 nov guardó para ella «agendada el 3 nov 2026, 9:00»,
**cuando** abro el tablero de octubre de 2026,
**Entonces** esa solicitud cuenta en O3 de octubre con 1 día hábil
**Y** ya no figura entre las solicitudes de octubre sin alineación agendada

## Notas

Cubre **§3 O3** (días entre solicitud enviada y sesión de alineación agendada, meta ≤ 3 días hábiles) en el tablero mensual, con la fecha que guarda **RF-9.1.3** según la lectura de HU-107.

**Nace el 2026-10-02 de la partición de HU-171** (tercera ronda, D93). Con O4 y el KPI del 35 % el tablero dejaba de ser M; el panel de O3 sale entero aquí. **Partición, no recorte**: HU-171 reserva el panel en «aún no se mide» hasta que esta historia exista, y aquí se construyen sus cifras, las solicitudes sin agendar, la fecha de la última lectura y el aviso de atraso, que antes estaban en el happy path y en el edge de paneles de HU-171.

**Decisiones del sponsor aplicadas.**
- **D75:** la lectura diaria y el conteo de días hábiles **viven en HU-107**; esta historia solo muestra lo que esa lectura guardó, sin leer HubSpot ni tener tarea propia.
- **D91:** O3 se mide en **días hábiles cruzados**, sin fracción, con el calendario T-4: mismo día = 0; lunes → miércoles = 2; viernes → lunes = 1; un festivo no cuenta. El edge del festivo lo prueba aquí con un mes que cambia (viernes 30 oct → martes 3 nov, con el lunes 2 nov festivo = 1).
- **D92:** la fecha sale de `engagements_last_meeting_booked` del contacto (herramienta de reuniones de HubSpot). Lo que se agenda fuera de la herramienta figura como «sin alineación agendada» (riesgo aceptado).
- **D68:** solo cuentan las solicitudes enviadas desde sesiones reales; la regla común está en HU-171.

**La negación a quien no tiene el permiso «Medición»** es la regla común de HU-190 y HU-171 (D74) y no se repite aquí.


**Plazo de agendamiento de RF-17.3** (T-28): sigue pendiente; sin él, las solicitudes sin agendar se cuentan sin calificarlas de retrasadas.

**D100 (sponsor, 2026-10-02).** O3 se agrega con la **mediana** de días hábiles y el **% de solicitudes agendadas en ≤ 3 días hábiles**; las no agendadas no entran en ninguno de los dos y se cuentan aparte. Sustituye la propuesta anterior de mediana sola.

**D103 (sponsor, 2026-10-02): cambio de épica.** Esta historia pasa a **EP-007**, donde nacen los datos o la capacidad de la que depende. No es recorte: se construye entera con esa épica.

## Trazabilidad

Épica madre: **EP-007** (D103) · PRD v4.18 · §3 O3 · §11 KPIs · RF-9.1.3 · RF-17.4 · T-4 · D68, D74 y D75 · D91, D92 y D93 (sponsor, 2026-10-02, tercera ronda) · sale de HU-171 (partición, no recorte) · depende de HU-171 (tablero y permiso «Medición») y HU-107 (lectura diaria y conteo de días hábiles, EP-007) · D100 (sponsor, 2026-10-02: mediana + % en ≤ 3 días hábiles)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: el tablero de HU-171, donde vive el panel, y el dato que guarda HU-107; se prueba con fechas «agendada el» y horas de lectura fijadas como las deja HU-107, sin HubSpot |
| N | Negociable | ✓ fija la meta de 3 días hábiles, la unidad de D91, que las solicitudes sin agendar se vean, el mes de envío y los estados «aún no se mide» y atrasado; la agregación (mediana) y la visualización son del equipo |
| V | Valiosa | ✓ O3 es el objetivo del arranque comercial y el único que dice cuántas solicitudes mueren antes de la sesión |
| E | Estimable | ✓ S: un panel que agrega por mes de envío un dato ya contado por HU-107, con dos estados de la lectura |
| S | Pequeña | ✓ S: un panel en cuatro escenarios |
| T | Testeable | ✓ solicitudes fijadas con y sin «agendada el», una última lectura completa de hace 2 días, un entorno sin ninguna lectura y una solicitud del 30 oct agendada el 3 nov con el festivo del 2 nov dan cifras, rótulos y avisos observables |
