---
id: HU-126
titulo: "Editar un perfil publicado sin sorpresas"
epica: EP-006
prioridad: alta
complejidad: M
estado: draft
fase: panel-crud
prd_version: 4.8
---

# HU-126 — Editar un perfil publicado sin sorpresas

**Como** administradora de inventario de Talento Humano,
**quiero** corregir un perfil que ya está publicado sabiendo qué verá el cliente al guardar,
**para** no cambiar en vivo la ficha que una cuenta está mirando sin darme cuenta.

## Criterios de aceptación

### Happy path — edición con efecto declarado

**Dado** que edito un perfil en estado *publicado*,
**cuando** guardo el cambio,
**Entonces** el panel me dice qué campos cambian de cara al cliente antes de confirmar
**Y** al confirmar el cambio queda visible en el portal
**Y** queda registrado qué cambió, quién y cuándo

### Error — el cambio deja el perfil sin requisitos de publicación

**Dado** que edito un perfil publicado y quito un dato que la publicación exige,
**cuando** guardo,
**Entonces** el panel bloquea el guardado o me ofrece pasar el perfil a borrador
**Y** nunca deja publicado un perfil que dejó de cumplir sus condiciones

### Edge case — edición de un perfil colocado

**Dado** que el perfil está colocado en una cuenta,
**cuando** lo edito,
**Entonces** puedo cambiar sus atributos con normalidad
**Y** el panel me recuerda que sigue publicado con su disponibilidad en la fecha de fin de la asignación

## Notas

Cubre **RF-8.2** y se apoya en **RF-8.7** (vista previa, HU-129) y **RF-8.9** (auditoría, HU-138).

**Editar publicado no es lo mismo que editar borrador.** Un borrador no lo ve nadie; un publicado puede estar abierto en la pantalla de un cliente ahora mismo. Por eso el happy path exige declarar el efecto antes de confirmar y no después.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ evita cambios en vivo no advertidos |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
