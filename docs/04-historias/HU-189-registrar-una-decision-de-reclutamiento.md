---
id: HU-189
titulo: "Registrar una decisión de reclutamiento"
epica: EP-010
prioridad: media
complejidad: S
estado: lista
fase: telemetria-y-medicion
prd_version: 4.18
depende_de: [HU-078]
---

# HU-189 — Registrar una decisión de reclutamiento

**Como** administradora de inventario de Talento Humano, que decide a quién sumar al banco,
**quiero** registrar en el destino Demanda del panel cada decisión de reclutamiento que tomo a partir del registro de demanda, con las búsquedas que la motivaron, qué decidí y cuándo,
**para** que la revisión trimestral sepa si el registro de demanda produce decisiones reales y no dependa de lo que yo recuerde.

## Criterios de aceptación

### Happy path — registro una decisión desde el registro de demanda

**Dado** que entré al panel como administradora de inventario y en el registro de demanda de Demanda hay dos búsquedas sin coincidencia de «ingeniero de datos con Spark»,
**cuando** registro la decisión «Abrir reclutamiento de dos ingenieros de datos con Spark», con fecha 1 de octubre de 2026 y esas dos búsquedas como motivo,
**Entonces** la decisión aparece en la lista de decisiones de Demanda con su texto, su fecha, quién la registró y las dos búsquedas enlazadas
**Y** cada una de esas búsquedas muestra en el registro de demanda que motivó esa decisión
**Y** el alta queda en el registro de auditoría con quién la hizo y cuándo

### Error — una decisión sin búsqueda que la motive

**Dado** que entré al panel como administradora de inventario,
**cuando** intento guardar una decisión de reclutamiento sin enlazar ninguna búsqueda del registro de demanda,
**Entonces** el panel no la guarda y me dice que una decisión de reclutamiento se registra a partir de al menos una búsqueda del registro de demanda
**Y** la lista de decisiones queda igual

### Error — una fecha posterior a hoy

**Dado** que hoy es 2 de octubre de 2026,
**cuando** intento guardar una decisión de reclutamiento con fecha 15 de octubre de 2026,
**Entonces** el panel no la guarda y me dice que la fecha de una decisión no puede ser posterior a hoy
**Y** la lista de decisiones queda igual

### Edge case — anular una decisión registrada por error

**Dado** que la lista de decisiones tiene una decisión registrada por error en este trimestre,
**cuando** la anulo indicando el motivo,
**Entonces** la decisión aparece como anulada, con su motivo, y no desaparece de la lista
**Y** deja de contar en la segunda condición de retirada de §14.7 que lee HU-111
**Y** la anulación queda en el registro de auditoría con quién la hizo, cuándo y el motivo

### Edge case — quien no es administrador consulta Demanda

**Dado** que entré al panel como observador,
**cuando** abro la lista de decisiones de reclutamiento en Demanda,
**Entonces** veo las decisiones registradas con sus búsquedas enlazadas
**Y** no veo los controles para registrar ni anular decisiones

## Notas

Cubre la **segunda condición de retirada de §14.7** (D-17): *«el registro de demanda no produce ninguna decisión de reclutamiento en el trimestre»*. Para que esa condición se pueda leer con datos, alguien tiene que registrar las decisiones; RF-15 (registro de demanda) y HU-078 dan las búsquedas, no las decisiones.

**Nace el 2026-10-02 por D83** (sponsor, segunda ronda). D73 ya había decidido que las decisiones las registra **Talento Humano en el panel** (opción conservadora de HU-111), pero ninguna historia cubría la pantalla: HU-111 lo dejó como hueco pendiente. D83 crea esta historia **en EP-008**, en el destino **Demanda** del panel. **Partición, no recorte**: HU-111 lee las decisiones y aplica la condición; esta historia las captura.

**Por qué Demanda y no Medición.** Talento Humano trabaja el registro de demanda en Demanda (D-13, HU-078) y no necesita el permiso «Medición» (D74, HU-190) para registrar lo que decide. La lectura de la condición vive en Medición (HU-111).

**Qué es una decisión.** Un texto corto de qué se decidió (abrir un reclutamiento, sumar un perfil, descartar una demanda), su fecha y al menos una búsqueda del registro de demanda que la motivó. Una decisión enlazada a varias búsquedas cuenta **una vez** en el trimestre. El texto es interno del panel y no cruza al portal; no lleva datos de profesionales ni de contactos (las búsquedas enlazadas ya llegan enmascaradas, ADR-0006 H43).

**Dependencia del registro de demanda.** Las búsquedas enlazables son las de HU-078 (EP-010). Si EP-008 se construye antes que EP-010, esta historia necesita al menos el listado de `operacion.consultas_sin_coincidencia` que crea EP-009 (RF-2.6.3; corregido el 2026-10-02: antes se atribuía a EP-002) para poder enlazar; la historia no se puede probar sin búsquedas sembradas. Lo ordena el equipo en el DoR.

**Propuestas del modelo, negociables:** anular en lugar de borrar (los catálogos y registros del panel no tienen borrado físico, RF-8.3); fecha no futura; que el observador consulte la lista sin escribir (RF-8.1.2: el observador consulta demanda).

**D103 (sponsor, 2026-10-02): cambio de épica.** Esta historia pasa a **EP-010**, donde nacen los datos o la capacidad de la que depende. No es recorte: se construye entera con esa épica.

## Trazabilidad

Épica madre: **EP-010** (D103) · PRD v4.18 · §14.7 (D-17) · RF-15 · RF-8.1.2 · RF-8.3 · D-13 · D73 y D83 (sponsor, 2026-10-02) · ADR-0006 (H43) · depende de HU-078 (registro de demanda, EP-010) · la lee HU-111 (segunda condición de retirada) · relacionada con HU-172 (top 10 en Demanda, D82) y HU-190 (permiso «Medición»)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ⚠ con dependencia declarada: necesita búsquedas del registro de demanda para enlazarlas (HU-078, EP-010, o al menos la tabla de consultas sin coincidencia de EP-009, RF-2.6.3); no depende de HU-111, que la lee |
| N | Negociable | ✓ son fijos que la registre Talento Humano en Demanda (D73, D83), que se enlace al menos una búsqueda y que se audite; anular en lugar de borrar, la fecha no futura y los campos del texto son negociables |
| V | Valiosa | ✓ sin ella la segunda condición de retirada de §14.7 nunca se puede medir y la revisión trimestral decide sin el dato que justifica la ruta de instrucción |
| E | Estimable | ✓ S: una tabla con su migración, un formulario con dos validaciones, el enlace a búsquedas existentes, la anulación y la auditoría |
| S | Pequeña | ✓ S: una capacidad (registrar decisiones) en cinco escenarios |
| T | Testeable | ✓ búsquedas sembradas en el registro de demanda, un reloj fijado al 2 de octubre de 2026, una decisión anulada y una sesión de observador dan lista, enlaces, rechazos y auditoría observables |
