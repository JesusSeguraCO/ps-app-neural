# INVEST + BDD EP-006 — tanda 1 (HU-086..089, 124..127) — 2026-09-30 (invest-validator, solo lectura)
Veredicto: 8/8 NO APTA.

## Decisiones (bloquean)
- HU-126 error: al quitar un dato obligatorio de un perfil publicado, ¿(A) bloquear el guardado, (B) degradar a borrador, (C) preguntar en el momento? Recomendación del validador: C.
- Orden HU-086/HU-088: las Trazabilidades dicen 088 habilita 086 (y el round-trip de 088 necesita el importador de 086); backlog.md pone 086 antes. Recomendación: exportar primero como contrato de formato.
- HU-086 S ✗: «guardar el emparejamiento como plantilla» es otra capacidad → propuesta HU-086b «Reutilizar un mapeo de columnas guardado» (cambia partición de alcance, no lo recorta).

## Dependencias
- HU-124: HU-123 ya construida (EP-001) → I ✓.
- HU-087 ← HU-086; HU-125 ← HU-089; cadena 125→127→128→126 (ya bien ordenadas).

## Fixes de redacción
- HU-086: separar vista previa (When = el sistema termina) / abrir tarjeta; duplicado → «ninguna se aplica; no procede hasta resolver»; valores inexistentes → «veo el valor exacto y cuántas veces se repite».
- HU-087: typo «reverto» → «revierto».
- HU-088: When con «o» (plantilla o banco) → uno por escenario; Then no observable → «cada columna trae encabezado autoexplicativo y ejemplo».
- HU-089: sin Edge y 3 Then con condicional; reorganizar en 5 escenarios (rol sin modalidades / con modalidades (edge) / seleccionar del catálogo / parecido «Fgima» / idéntico salvo mayúsculas).
- HU-124: edge When «quiero corregirlo» → «intento editarlo»; Then observable (botón para avisar con contexto).
- HU-125: Given/When repiten acción → Given estado (rol de familia sin modalidades), When lo selecciono.
- HU-126: separar guardar (muestra impacto) / confirmar (aplica y audita).
- HU-127: revocado → anclar a RF-19.2 (el enlace curado explica que dejó de estar disponible). Nota operativa: re-recolectar consentimiento nominal del banco existente antes de producción (D-3).
