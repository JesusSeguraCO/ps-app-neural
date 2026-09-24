---
id: HU-143
titulo: "Retirar y fusionar valores sin romper los perfiles que los usan"
epica: EP-006
prioridad: media
complejidad: M
estado: draft
fase: panel-crud
prd_version: 4.8
---

# HU-143 — Retirar y fusionar valores sin romper los perfiles que los usan

**Como** administradora del banco de talento,
**quiero** sacar de circulación un valor obsoleto y unir los duplicados que ya entraron,
**para** limpiar la taxonomía sin dejar fichas sin el dato que explicaba cómo se validó un perfil.

## Criterios de aceptación

### Happy path — desactivar un valor en uso

**Dado** que una tecnología la usan varios perfiles y ya no queremos ofrecerla,
**cuando** la desactivo,
**Entonces** deja de poder elegirse en perfiles nuevos
**Y** los perfiles que ya la tienen la conservan
**Y** no existe ninguna opción de borrarla

### Happy path — fusionar duplicados que ya entraron

**Dado** que el catálogo tiene «Figma» y «Fgima» y ambos están en uso,
**cuando** los fusiono,
**Entonces** todos los perfiles que usaban el duplicado pasan al valor destino
**Y** veo cuántos perfiles se van a ver afectados antes de confirmar
**Y** el duplicado desaparece del catálogo

### Error — fusionar dos valores que no son el mismo

**Dado** que selecciono dos valores que representan cosas distintas,
**cuando** voy a fusionarlos,
**Entonces** el panel me muestra el impacto en perfiles antes de nada
**Y** la fusión es reversible mientras no la confirme

### Edge case — desactivar una modalidad que sostiene fichas publicadas

**Dado** que una modalidad de prueba aparece en las fichas de varios perfiles publicados,
**cuando** la desactivo,
**Entonces** esas fichas conservan su texto
**Y** el panel me advierte cuántas dependen de ella

## Notas

**Dividida de HU-089 el 2026-09-22.** Crear valores y limpiar la taxonomía son momentos distintos: el primero ocurre cada semana al editar perfiles, el segundo cada varios meses cuando alguien nota el desorden.

**No existe la acción de borrar, y es a propósito** (RF-8.16.5). Borrar una modalidad que cinco perfiles referencian dejaría sus fichas sin el texto que explica cómo se validaron. Desactivar impide elegirla en adelante y conserva lo publicado.

**La fusión es la única forma de deshacer un error de tecleo.** Sin ella, cualquier duplicado que haya entrado es permanente, y el filtro del cliente queda partido en dos para siempre.

Cubre **RF-8.16.5** y **RF-8.16.6**.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · depende de HU-089

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-089 — sin catálogo no hay qué limpiar |
| N | Negociable | ✓ |
| V | Valiosa | ✓ es la única forma de revertir un error de tecleo en la taxonomía |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
