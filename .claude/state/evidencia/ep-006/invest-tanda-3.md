# INVEST + BDD EP-006 — tanda 3 (HU-136..143) — 2026-09-30 (invest-validator, solo lectura)
Veredicto: 8/8 NO APTA.

## Decisiones de negocio / externas (bloquean)
- HU-140: PRD §12.3 / T-2 — el «resultado» precargado ¿sugerencia confirmable o fuera de la precarga? Marca «candidata a v2» del mapa: diferir exige acuerdo del equipo.
- HU-137: contrato del «sistema de asignación» (qué exporta, campos, periodicidad) — confirmar Eida/Jonathan.

## Dependencias ocultas
- HU-136 depende de HU-132 (dos clics dentro de la bandeja).
- HU-139 edge case necesita registro de búsquedas fallidas (HU-078, EP-010) que llega después de EP-006: validar con datos sintéticos, declararlo.
- HU-138: dependencia de HU-123 ya resuelta (EP-001 integrada); actualizar I a ✓.

## Fixes de redacción por historia
- HU-136: «Error — bandeja vacía» → Edge; añadir error real (fecha de última actualización ausente → «dato incompleto», no omitir); «para» orientado a cliente.
- HU-137: «Error» actual → Edge; error real: sincronización vencida → alerta «dato desincronizado».
- HU-138: «Error — sin autor» → Edge (separar importación/sincronización); Then no observable del archivado → «veo su historial completo… con fecha y autor».
- HU-139: añadir escenario RF-8.12.1 (propuesta de Gemini: aprobar/editar/rechazar; nada entra sin confirmación).
- HU-140: When no-acción en edge → «cuando corrijo el campo o descarto el borrador»; S=L (divisible en A plantilla / B patrones, opcional).
- HU-141: alinear verbo del When; edge ausente vs null en el mismo escenario; unificar rol.
- HU-142: When del happy → «cuando descargo el archivo de errores»; unificar rol.
- HU-143: separar fusión en «veo impacto antes» y «confirmo»; «Error — no son el mismo» → Edge; error real: origen=destino o catálogos distintos → rechazo con motivo.
- Transversal: unificar el rol («administradora de inventario de Talento Humano» vs «administradora del banco de talento»).
