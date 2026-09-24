---
id: HU-140
titulo: "Obtener un borrador de los campos desde el artefacto"
epica: EP-006
prioridad: media
complejidad: L
estado: draft
fase: panel-crud
prd_version: 4.8
---

# HU-140 — Obtener un borrador de los campos desde el artefacto

**Como** administradora de inventario de Talento Humano,
**quiero** que el sistema me proponga los campos descriptivos a partir del artefacto que ya adjunté,
**para** no transcribir a mano la evidencia de cada perfil del banco.

## Criterios de aceptación

### Happy path — borrador propuesto para revisión

**Dado** que un perfil tiene artefacto adjunto,
**cuando** pido el borrador,
**Entonces** el sistema me propone los campos descriptivos de la validación
**Y** el borrador queda para mi revisión y nunca se publica solo

### Error — artefacto del que no se puede derivar nada

**Dado** que el artefacto es ilegible, está vacío o no contiene una validación,
**cuando** el sistema lo procesa,
**Entonces** me lo dice sin borrar el adjunto
**Y** puedo redactar los campos a mano

### Edge case — el borrador afirma algo que el artefacto no sostiene

**Dado** que reviso un borrador propuesto,
**cuando** encuentro una afirmación que no está en el artefacto,
**Entonces** puedo corregirla o descartar el borrador completo
**Y** nada llega a la ficha sin haber pasado por mi revisión

## Notas

Cubre la segunda mitad de **RF-8.11** y **B.9.3** (carga asistida desde el artefacto).

**Por qué es historia aparte desde el 2026-09-22.** La HU-131 original juntaba adjuntar y derivar en una sola historia de complejidad L con valor medio: el peor cuadrante del backlog. Guardar un archivo y derivar campos descriptivos de un video son trabajos de orden distinto. Dividirlas deja la mitad útil (HU-131) construible por una fracción del costo, y aísla la cara en una historia que se puede posponer sin perder nada.

**El borrador se revisa, siempre.** Es la misma restricción que **RF-16.1** impone al modelo del cliente: el sistema no afirma cosas sobre una persona real por la que Trycore responde contractualmente. Aquí el filtro es humano y explícito, y por eso el edge case es el que más importa de los tres.

**Candidata a v2.** En el mapa de historias v1.0 esta capacidad ya vivía en v2 como «obtener un borrador asistido desde el artefacto». El juicio se sostiene: es la parte cara y la que menos duele posponer.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · Anexo B.9.3 · RF-16.1 como criterio · depende de HU-131

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-131 — sin artefacto no hay de qué derivar |
| N | Negociable | ✓ |
| V | Valiosa | ✓ ahorra transcripción manual por perfil |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✗ **L** — es la parte cara y se acepta como tal, aislada a propósito |
| T | Testeable | ✓ |
