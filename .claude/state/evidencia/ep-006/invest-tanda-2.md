# INVEST + BDD EP-006 — tanda 2 (HU-128..135) — 2026-09-30 (invest-validator, solo lectura)
APTA con fixes menores: HU-128, HU-130, HU-131. NO APTA: HU-129, 132, 133, 134, 135.

## Decisiones (bloquean)
- HU-129: ¿vista de comparación lado a lado borrador vs publicado, o solo vista previa fiel?
- HU-133: umbral numérico de «pausa demasiado larga» (no existe en ningún artefacto) y si la bandeja de vigencia (HU-136) lo incluye.
- HU-134: matriz completa estado × disponibilidad → severidad alta / media (hoy solo un ejemplo en el prototipo). AC-4 se observa en el portal (RF-3.13, también HU-096 de EP-005).
- HU-132/HU-134: dueño del AC compartido «pausado + fecha = incoherencia alta».

## Fixes de redacción
- HU-128: reconciliar tabla INVEST (dice depende de HU-127) con los AC; edge: When = confirmo publicación masiva.
- HU-130: «registro» al When; declarar apoyo en HU-126 y HU-131/HU-140.
- HU-131: acción fuera del Given en error; edge falsable («la ficha no incluye enlace ni referencia al artefacto»); límites (formatos, 64 MB) al Then.
- HU-132: edge When con dos acciones → «actualizo su disponibilidad en bloque».
- HU-134: «a un clic» → «sin salir del listado»; edge real o fusionar severidades.
- HU-135: «Error — no existe el borrado físico» no ejecutable → «Dado archivado, cuando consulto acciones, la única de retiro es archivar» o error real (archivar ya archivado / sin permiso); depende_de HU-122 (ya construida).
- Transversal: fila E «por confirmar con Tecnología» copiada; usar depende_de: en frontmatter.
