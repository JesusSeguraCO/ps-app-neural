# Decisiones del sponsor (Jesús Segura) sobre EP-006 — 2026-09-30

Tomadas en la revisión INVEST/BDD previa al DoR (resumen en resumen-invest-ep006.md).

- **D1 · HU-126** — al guardar un perfil publicado al que le falta un dato que la publicación exige, el panel **pregunta**: «Este cambio deja el perfil incompleto: ¿descarto el cambio o paso el perfil a borrador?». Nunca bloquea en silencio ni despublica solo.
- **D2 · HU-086 / HU-088** — **exportar primero**: HU-088 fija el formato de la hoja y HU-086 lo consume. Se corrige el orden del backlog (HU-088 antes que HU-086). «Guardar el emparejamiento de columnas como plantilla» sale de HU-086 a una historia nueva, **HU-148 «Reutilizar un emparejamiento de columnas guardado»** (EP-006; partición, no recorte).
- **D3 · HU-129** — **solo vista previa fiel** (la ficha como la verá el cliente, con el cambio aplicado); sin comparación lado a lado. El antes/después por campo lo da HU-126 al guardar.
- **D4 · HU-133 / HU-136** — un perfil pausado hace **más de 30 días** se marca para revisión y aparece en la **bandeja de vigencia** (HU-136 amplía su alcance a publicados sin actualizar > 30 días y pausados > 30 días).
- **D5 · HU-134** — matriz de incoherencias estado × disponibilidad:
  - **ALTA** (bloquea publicar, aviso en rojo): pausado o archivado con disponibilidad «Disponible ahora» o con fecha; colocado con «Disponible ahora»; publicado sin ninguna disponibilidad. *(Corregido por el sponsor el mismo día: un colocado siempre lleva su fecha de liberación —RF-8.13.2—, así que «colocado con fecha» es coherente.)*
  - **MEDIA** (aviso, no bloquea): publicado con fecha de disponibilidad ya pasada; publicado sin actualizar hace más de 30 días.
- **D6 · HU-132 / HU-134** — el caso «pausado al que le ponen fecha» es de **HU-134**. HU-132 pasa a tener como error propio: un observador intenta cambiar la disponibilidad y el panel no lo deja.
- **D7 · HU-140** (PRD §12.3 / T-2) — el «resultado» de la prueba se **precarga como sugerencia** marcada «sin confirmar»; no llega a la ficha hasta que Talento Humano lo confirma.
- **D8 · HU-137** — **combinación**: Talento Humano lleva el control de los colocados en el propio panel (al marcar «colocado» registra cliente y fecha de liberación; el panel es la fuente), y si Operaciones tiene otra información puede **cargarla** por importación (hoja del sistema de asignación), con fecha de corte visible. Sin integración automática en v1.
- **Aplicación**: aprobado aplicar estas decisiones y los arreglos de redacción de las 24 historias, revalidar con INVEST y pasar a `lista` las que aprueben.
- **D9 · HU-140** (revalidación, mismo día) — se **parte en dos** para que pase «pequeña»: HU-140 queda como «precargar el borrador desde la modalidad de prueba (plantilla)» y nace **HU-149 «Reconocer fecha y resultado por patrones en el artefacto»** (sugerencia «sin confirmar», D7). Partición, no recorte: las dos se construyen en EP-006.

## Decisiones tras el DoR (mismo día)
- **D10 · B3 / CRN-14 / T-12** — la modalidad de prueba **se elige** del catálogo cerrado de su familia (Anexo B.8.1) y es **obligatoria para publicar**, igual que el consentimiento. RF-8.10 se enmienda: el rol solo filtra qué modalidades se ofrecen. CRN-14 pasa a ABORDADO.
- **D11 · B7** — **no hay lectura automática del artefacto**: la evidencia se sube y quien la necesita en el panel la descarga y la ve. **HU-149 se descarta** por decisión del sponsor (no se construye). HU-131 debe permitir descargar/ver el artefacto desde el panel (nunca desde el portal). HU-140 (plantilla desde la modalidad) se mantiene. Sin librería nueva de PDF/Word.
- **D12 · B5** — la carga de Operaciones sale de HU-137 a una historia nueva **HU-150 «Cargar la información de colocados de Operaciones»** en **JSON o CSV**, con fecha de corte visible y aviso «dato desincronizado» si pasan **más de 7 días** sin una carga nueva. HU-137 queda con el registro en el panel. Partición, no recorte.
- **D13 · B4** — nueva **HU-151 «Administrar quién entra al panel y con qué rol»** (RF-8.1.5): alta, cambio de rol y baja de correos @trycore.com inscritos, auditada, sin poder quedarse sin administradores.
- **D14 · B6** — HU-124 (observador) se limita a los destinos que existen en EP-006 (inventario, enlaces, colocados); demanda y cobertura se añaden cuando llegue EP-010.
- **D15 · HU-150 conflicto** — si una fila de Operaciones difiere de un colocado registrado en el panel, **gana el panel**: la fila no lo pisa y queda señalada como «diferencia con Operaciones» para que Talento Humano decida si la acepta.
- **D16 · HU-150 archivo** — la fecha de corte es **el momento de la carga**; columnas mínimas: código del perfil (PS-XXXX), cliente, fecha de inicio y fecha de liberación; lo demás se ignora y se informa.
- **D17 · HU-151 sesión** — dar de baja o bajar a observador **corta la sesión en la siguiente petición**.
- **D18 · HU-131 evidencia** — solo la administradora de inventario descarga y ve el artefacto; el observador ve que existe, no lo descarga (Ley 1581).
- **D19 · HU-140** (DoR, B8) — sin modalidad de prueba elegida no se puede pedir el borrador: el panel lo impide y remite al selector (HU-125). El borrador no necesita artefacto adjunto.
