---
id: HU-078
titulo: "Saber qué están pidiendo las cuentas y no tenemos"
epica: EP-010
prioridad: alta
complejidad: M
estado: lista
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-077]
---

# HU-078 — Saber qué están pidiendo las cuentas y no tenemos

**Como** administradora de inventario de Talento Humano, responsable del banco de talento,
**quiero** consultar cada mes, en el destino Demanda del panel, lo que las cuentas buscaron y no encontraron, con la especificación estructurada de lo que pidieron a medida,
**para** decidir a quién sumar al banco con base en demanda real de clientes activos y no por intuición.

## Criterios de aceptación

### Happy path — el registro del mes

**Dado** que entré al panel como administradora de inventario y en septiembre de 2026 hubo en Bancolombia la solicitud a medida SOL-2026-0047 (obligatorios «Arquitectura de pagos», «Senior» e «ISO 20022»; deseables «Banca» e «Híbrido»; reto e inicio escritos; PS-0142 y PS-0061 en su «Mi equipo») y en Alpina la consulta sin coincidencia «QA con Cypress presencial en Medellín», que no terminó en solicitud,
**cuando** abro el registro de demanda de septiembre de 2026 en Demanda,
**Entonces** veo las dos entradas con su cuenta, su fecha y su desenlace: «solicitud a medida SOL-2026-0047» o «sin solicitud»
**Y** la de Bancolombia muestra la especificación estructurada: obligatorios, deseables, reto e inicio, no solo un texto
**Y** muestra también los códigos que el cliente tenía en «Mi equipo» al enviarla, como contexto (§14.4.3)
**Y** la de Alpina muestra el texto de la consulta tal como quedó enmascarado en el registro de consultas sin coincidencia, rotulado «sin especificación: no llegó a solicitud»

### Error — mes sin búsquedas fallidas

**Dado** que en agosto de 2026 no hubo solicitudes a medida ni consultas sin coincidencia,
**cuando** abro el registro de demanda de agosto de 2026,
**Entonces** veo «En agosto de 2026 no hubo búsquedas sin coincidencia»
**Y** no veo una tabla en blanco sin explicación

### Edge case — demanda inducida por sugerencias

**Dado** que en septiembre de 2026 el registro tiene 21 entradas: 3 salieron de una instrucción sugerida por el portal que el cliente no editó y 18 de instrucciones escritas o editadas por el cliente,
**cuando** separo el registro por origen,
**Entonces** veo 18 entradas «espontáneas» y 3 «inducidas», cada inducida marcada «originada en una sugerencia»
**Y** los conteos por necesidad muestran las inducidas aparte de las espontáneas

### Edge case — lo que no está en el banco y dónde se necesita

**Dado** que la solicitud a medida SOL-2026-0045 pidió como obligatoria la tecnología «COBOL», añadida como opción que no está en el banco, con modalidad presencial en Medellín, Colombia,
**cuando** abro esa entrada del registro,
**Entonces** veo «COBOL» marcado «no está en el banco · necesidad no cubierta»
**Y** veo el país y la ciudad de la necesidad

## Notas

**Esta es la historia canónica del registro de demanda.** Resuelto el 2026-09-22: `HU-110` duplicaba esta historia y se reescribió para cubrir el reporte de filtros más usados (RF-7.2). El top 10 mensual de búsquedas sin resultados es **HU-172** (EP-008, también visible en Demanda por D82); esta historia es el registro entrada por entrada. Las decisiones de reclutamiento que se toman sobre él son **HU-189** (D83, D103).

Cubre **RF-15.1** y **§14.4.3** (*el registro guarda la especificación estructurada completa y los perfiles seleccionados*), la segunda mitad de **RF-7.2** (búsquedas sin resultados), **RF-13.7.3** y **RF-13.5.4** (lo no cubierto y la ubicación viajan al registro). Dueño y cadencia en **D-13**: Talento Humano, revisión mensual; por eso el registro se abre por mes. El edge de demanda inducida es la defensa contra el sesgo que identificó la Fase 2: sin esa marca, el registro mide lo que sugerimos y no lo que el cliente necesita (RF-12.1).

**Elegida por el modelo por delegación del sponsor (2026-10-02) — de dónde sale la especificación estructurada.** El PRD tiene dos reglas que se cruzan: RF-15.1 pide registrar la especificación estructurada completa, y **RF-13.4.2** prohíbe datos de especificación en el servidor **antes de la solicitud** (D-16, el Perfil Objetivo vive en el dispositivo). ADR-0004 (UC-8) ya lo resolvió: la especificación estructurada completa viaja **con la solicitud a medida** (HU-077), y ADR-0006 deja los eventos del cero sin contenido de criterios. Se aplica esa lectura: las entradas con solicitud a medida muestran la especificación estructurada; las búsquedas que no llegaron a solicitud muestran el texto enmascarado de `operacion.consultas_sin_coincidencia` (RF-2.6.3, EP-009; enmascarado y retirada de nombres de ADR-0006, H43). **No es recorte**: es la regla vigente del PRD. Si el sponsor quiere también la especificación de los ceros sin solicitud (como dibuja el prototipo `demanda-no-cubierta`), hace falta enmendar RF-13.4.2 y ADR-0006; queda como pregunta abierta en el informe de discovery. **D130 (2026-10-02, elegida por el modelo)** confirma esta lectura: se mantienen PRD y ADR-0004.

**Marca de origen inducido.** La solicitud a medida guarda si la especificación salió de una sugerencia sin editar (dato que el portal ya tiene por `instruccion_enviada`, ADR-0006); la consulta sin coincidencia necesita guardar ese mismo origen al insertarse (columna nueva en la tabla de EP-002, que añade la migración de EP-010). Se ordena en el DoR.

**Quién lo ve.** Administración de inventario y observadores (RF-8.1.2: el observador consulta demanda), sin permiso «Medición» (D82, D83). El texto de las consultas es interno del panel y nunca cruza al portal.

## Trazabilidad

Épica madre: **EP-010** · PRD v4.18 · RF-15.1 · RF-7.2 · RF-13.4.2 · RF-13.5.4 · RF-13.7.3 · RF-12.1 · RF-2.6.3 · RF-8.1.2 · D-13 · D82, D83 y D103 (sponsor, 2026-10-02) · D130 · ADR-0004 (UC-8) · ADR-0006 (H32, H43) · prototipo `demanda-no-cubierta`, `--vacia` · depende de HU-077 (solicitudes a medida) y de la tabla de consultas sin coincidencia de EP-009 (RF-2.6.3) · relacionada con HU-172 (top 10) y HU-189 (decisiones)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: lee las solicitudes a medida de HU-077 y las consultas sin coincidencia que guarda EP-002; con datos sembrados se prueba sin el portal |
| N | Negociable | ✓ fija la vista mensual, la especificación estructurada de lo pedido a medida, el texto enmascarado de lo que no llegó a solicitud, la marca inducida y lo no cubierto; columnas, filtros y presentación son negociables |
| V | Valiosa | ✓ Talento Humano decide a quién reclutar con la demanda real de las cuentas, y alimenta HU-189 y la regla de §14.7 |
| E | Estimable | ✓ M: una vista del panel sobre dos fuentes ya definidas, una columna de origen y el estado vacío |
| S | Pequeña | ✓ M: una lectura en cuatro escenarios |
| T | Testeable | ✓ solicitudes a medida y consultas sembradas en septiembre, un agosto vacío, entradas inducidas y espontáneas y una solicitud con «COBOL» fuera del banco dan entradas, conteos y rótulos observables |
