---
id: HU-126
titulo: "Editar un perfil publicado sin sorpresas"
epica: EP-006
prioridad: alta
complejidad: M
estado: lista
fase: panel-crud
prd_version: 4.8
depende_de: [HU-128]
---

# HU-126 — Editar un perfil publicado sin sorpresas

**Como** administradora de inventario de Talento Humano,
**quiero** corregir un perfil que ya está publicado sabiendo qué verá el cliente al guardar,
**para** no cambiar en vivo la ficha que una cuenta está mirando sin darme cuenta.

## Criterios de aceptación

### Happy path — guardar muestra el impacto

**Dado** que edité un campo visible de un perfil en estado *publicado*,
**cuando** guardo el cambio,
**Entonces** el panel me muestra qué campos cambian de cara al cliente, con su valor anterior y el nuevo
**Y** el portal sigue mostrando la versión anterior mientras no confirme

### Happy path — confirmar aplica y deja registro

**Dado** que el panel me mostró el impacto de mi cambio en un perfil publicado,
**cuando** confirmo,
**Entonces** el cambio queda visible en el portal
**Y** queda registrado qué cambió, quién y cuándo

### Error — el cambio deja el perfil sin un dato que la publicación exige

**Dado** que en un perfil publicado quité un dato que la publicación exige,
**cuando** guardo,
**Entonces** el panel me pregunta: «Este cambio deja el perfil incompleto: ¿descarto el cambio o paso el perfil a borrador?»
**Y** mientras no responda, el perfil sigue publicado sin el cambio

### Error — elijo descartar el cambio

**Dado** que el panel me preguntó si descarto el cambio o paso el perfil a borrador,
**cuando** elijo descartar,
**Entonces** el cambio no se aplica y el perfil conserva exactamente los valores que tenía antes de mi edición
**Y** no queda en la auditoría ningún cambio que nunca se aplicó

### Edge case — elijo pasar el perfil a borrador

**Dado** que el panel me preguntó si descarto el cambio o paso el perfil a borrador,
**cuando** elijo pasarlo a borrador,
**Entonces** el cambio se guarda y el perfil queda en *borrador*, fuera del portal
**Y** queda registrado que salió de publicado por esta edición, quién y cuándo

## Notas

Cubre **RF-8.2** y se apoya en **RF-8.7** (vista previa, HU-129) y **RF-8.9** (auditoría, HU-138).

**Editar publicado no es lo mismo que editar borrador.** Un borrador no lo ve nadie; un publicado puede estar abierto en la pantalla de un cliente ahora mismo. Por eso el happy path exige declarar el efecto antes de confirmar y no después.

**El panel pregunta; nunca decide solo** (D1, sponsor 2026-09-30). Un perfil que dejó de cumplir sus condiciones no queda publicado, pero tampoco se bloquea el guardado en silencio ni se despublica sin avisar: la administradora elige entre descartar el cambio o pasar el perfil a borrador; cada respuesta tiene su escenario.

**Perfil colocado:** editarlo sigue el mismo camino de impacto y confirmación que cualquier publicado, y el panel recuerda que sigue publicado con su disponibilidad en la fecha de fin de la asignación (RF-8.13.2). No es un escenario aparte: no introduce comportamiento observable nuevo.

**El antes y después por campo es de esta historia** (D3): HU-129 muestra la ficha completa como la verá el cliente, sin comparación; la comparación campo a campo aparece aquí, al guardar.

**Revisión INVEST 2026-09-30:** aplicada D1 en el escenario de error (el panel pregunta descartar o pasar a borrador) y un escenario para la elección «pasar a borrador»; separados guardar (muestra el impacto) y confirmar (aplica y audita); revalidación: añadido el escenario «descartar» para cubrir las dos respuestas de D1 (el colocado pasa a Notas); `depende_de: [HU-128]`; tabla INVEST razonada. Cinco escenarios, el tope.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · D1 · D3 · depende de HU-128 (cadena HU-125 → HU-127 → HU-128 → HU-126) · relacionada con HU-129 y HU-138

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: necesita perfiles que puedan estar publicados, y eso llega con la cadena de consentimiento y bloqueo (HU-127, HU-128); se construye después |
| N | Negociable | ✓ fija el orden guardar → ver impacto → confirmar y la pregunta de D1; la presentación del impacto queda abierta |
| V | Valiosa | ✓ evita cambios en vivo no advertidos |
| E | Estimable | ✓ M: la edición en dos tiempos pide guardar el cambio pendiente aparte de la versión publicada hasta confirmar; la lista de datos que la publicación exige es la misma que usa HU-125, y el registro se escribe en la cadena de auditoría existente (`packages/dominio/src/auditoria`) |
| S | Pequeña | ✓ cinco escenarios de una capacidad (editar un publicado sin sorpresas) |
| T | Testeable | ✓ el portal se consulta antes y después de confirmar, y el estado del perfil tras cada una de las dos respuestas a la pregunta de D1 (descartar / pasar a borrador) es comprobable |
