---
id: HU-153
titulo: "Leer en la tarjeta qué capacidad ofrece cada profesional"
epica: EP-003
prioridad: alta
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.17
---

# HU-153 — Leer en la tarjeta qué capacidad ofrece cada profesional

**Como** líder de área que recorre la selección del correo o el banco de perfiles,
**quiero** leer en cada tarjeta, antes que nada, el rol, el seniority y la experiencia del profesional junto con su nombre, y debajo sus tecnologías ancla, sector, modalidad, país y cuándo podría arrancar,
**para** saber en segundos si ese perfil sirve para mi proyecto sin abrir la ficha y sin sentir que recorro un catálogo de personas.

## Criterios de aceptación

### Happy path — la capacidad como descriptor inmediato

**Dado** que un perfil publicado es «Desarrolladora Backend», Senior, con 9 años de experiencia, cuatro tecnologías ancla, el sector Banca, modalidad Remoto, país Colombia y disponibilidad dentro de 10 días,
**cuando** veo su tarjeta en la lista,
**Entonces** veo primero la capacidad («Desarrolladora Backend · Senior · 9 años de experiencia») y junto a ella el nombre y el primer apellido de la persona
**Y** debajo veo sus cuatro tecnologías, «Banca», «Remoto», «Colombia» y la banda «2 semanas»
**Y** el código del perfil aparece solo al pie de la tarjeta, en letra pequeña
**Y** no veo fotografía, segundo apellido ni fecha de disponibilidad

### Error — la disponibilidad venció y nadie la actualizó

**Dado** que la fecha de disponibilidad de un perfil publicado ya pasó y Talento Humano no la toca desde hace más de 30 días,
**cuando** veo su tarjeta,
**Entonces** la banda dice «Por confirmar»
**Y** en ningún lugar de la tarjeta dice «Inmediato» ni muestra la fecha vencida

### Edge case — más tecnologías de las que caben y sin sector

**Dado** que un perfil publicado tiene 8 tecnologías registradas y ningún sector,
**cuando** veo su tarjeta,
**Entonces** veo sus 5 primeras tecnologías ancla, en el orden en que Talento Humano las registró, y las 8 siguen disponibles en su ficha
**Y** la tarjeta no muestra el sector, ni un título vacío, ni un hueco en su lugar

## Notas

Cubre **RF-3.1** (D-1 revertida, D-25: sector opcional y con varios valores), **RF-3.5** en la tarjeta (código al pie), **RF-3.13** y **RF-3.13.3** en la tarjeta (banda de arranque, «Por confirmar» si venció), **B.1** (5 tecnologías en la tarjeta, hasta 8 en la ficha) y **B.2** (años de experiencia como anclaje del título). Muestra el país en la tarjeta como pide **RF-13.5.5**. La ciudad condicionada a la modalidad de la necesidad (RF-13.5.5.1) es de **EP-009** (HU-082).

**Qué existe ya:** la tarjeta de la selección (`apps/portal/src/seleccion/TarjetaPerfil.tsx`, EP-001) muestra rol, nombre, tecnologías, banda, sectores, modalidad y código al pie, pero **no** muestra el seniority, los años ni el país, y no corta en 5 tecnologías. El contrato del catálogo (`@ps/contratos/catalogo`) ya trae `seniority`, `aniosExperiencia` y `pais`. La banda la calcula `packages/dominio/src/catalogo/banda.ts` (EP-001/EP-006): aquí no se reimplementa, se verifica que la tarjeta la usa.

**El sello Neural-Grid de RF-3.1 no es una insignia en la tarjeta.** RF-3.1 dice que la tarjeta «incluye el sello Neural-Grid en la forma definida por RF-3.8», y RF-3.8 elimina la insignia por perfil. El estándar se declara una vez arriba (HU-159) y la tarjeta diferencia por competencias (HU-081) y evidencia (HU-119). Por eso esta historia no dibuja ningún sello.

**Banda «2 semanas» en el ejemplo:** con los límites que ya construyó `banda.ts` (0 días → Inmediato; 1-7 → 1 semana; 8-14 → 2 semanas; 15-30 → 1 mes; más de 30 → Más de 1 mes), 10 días caen en «2 semanas».

**Decisiones del sponsor aplicadas (2026-10-02):**
- **D73 (opción conservadora):** las cinco tecnologías de la tarjeta son las cinco primeras **en el orden en que Talento Humano las cargó**; no se marcan «anclas» en el panel y no hay cambio en EP-006. El edge case ya lo decía y se mantiene.
- **D73 (opción conservadora):** el «anclaje de experiencia» de RF-3.1 son los **años de experiencia** (B.2), como ya dice el happy path. El campo de texto `anclaje` (migración 0014) no se muestra en la tarjeta.
- **D64:** el estándar Neural-Grid tiene **cuatro dimensiones**, no cinco. Esta historia no dibuja el estándar (ver el párrafo anterior), así que no cambia; la corrección del copy del prototipo («cinco componentes») vive en HU-159.

## Trazabilidad

Épica madre: **EP-003** · PRD v4.17 · RF-3.1 · RF-3.5 · RF-3.13 · RF-13.5.5 · B.1 · B.2 · D-1 · D-25 · D64 · D73 · reutiliza la banda de EP-001/EP-006 · habilita HU-081 y HU-119 (bloques que viven en esta tarjeta) · relacionada con HU-082 (ciudad, EP-009)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ usa el contrato del catálogo y la banda que ya existen; no espera a ninguna otra historia de la épica |
| N | Negociable | ✓ son fijos la jerarquía (capacidad primero, código al pie), el límite de 5 tecnologías por orden de carga, los años como anclaje (D73), la banda y que no haya foto; la disposición visual se puede negociar |
| V | Valiosa | ✓ la tarjeta es donde el cliente decide qué ficha abrir y donde se juega que el portal no parezca un catálogo de personas |
| E | Estimable | ✓ M: rehacer la jerarquía de una tarjeta que ya existe, con datos que el contrato ya trae; se usa en la selección y en el banco |
| S | Pequeña | ✓ M: un componente con tres comportamientos |
| T | Testeable | ✓ perfiles sembrados (completo, con la disponibilidad vencida, con 8 tecnologías y sin sector) dan textos exactos en pantalla |
