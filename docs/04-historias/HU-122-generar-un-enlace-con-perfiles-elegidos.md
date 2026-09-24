---
id: HU-122
titulo: "Generar un enlace con exactamente los perfiles que elegí"
epica: EP-001
prioridad: alta
complejidad: S
estado: prototipado
fase: enlaces-curados
prd_version: 4.8
spec: docs/10-specs/enlaces-curados.md
---

# HU-122 — Generar un enlace con exactamente los perfiles que elegí

**Como** administradora del banco de talento,
**quiero** seleccionar perfiles de cualquier familia y generar un enlace para una cuenta,
**para** proponerle justo lo que pensamos para ella y no un catálogo que tenga que filtrar.

## Criterios de aceptación

### Happy path — selección heterogénea

**Dado** que quiero proponerle a una cuenta un gerente, un desarrollador y un QA,
**cuando** los selecciono en el inventario y genero el enlace,
**Entonces** el enlace contiene exactamente esos tres perfiles
**Y** no se intenta expresarlos como un filtro, porque ninguno los devolvería solo a ellos
**Y** queda registrado con la cuenta, la razón, quién lo generó y su vigencia

### Error — falta la razón de la selección

**Dado** que elegí los perfiles y la cuenta pero no escribí la razón,
**cuando** intento generar,
**Entonces** el sistema lo impide
**Y** me explica que sin razón el cliente recibe un catálogo y no una curaduría

### Error — un perfil sin publicar

**Dado** que uno de los seleccionados está en borrador,
**cuando** intento generar,
**Entonces** el sistema me lo indica y no emite el enlace

## Notas

**Dividida el 2026-09-22.** La historia original tenía **seis escenarios** y dos happy paths con **actores distintos**: Talento Humano generando el enlace y el cliente abriéndolo. Cuando los happy paths cambian de actor, el corte natural está ahí. Lo que el cliente ve al abrir es ahora **HU-144**.

**La decisión de fondo:** el enlace lleva **la lista de códigos**, no filtros. Una selección heterogénea no se puede expresar con ningún filtro, y ese es el caso real de uso.

**Coordinación necesaria:** Talento Humano genera el enlace porque conoce la disponibilidad, pero la razón de la selección necesita el contexto del proyecto, que lo tiene el ejecutivo comercial. Sin ese insumo la razón se vuelve genérica y la curaduría deja de serlo.

Cubre **RF-19.1**, **RF-19.3**, **RF-19.4**, **RF-19.5** y **RF-19.7**.

## Trazabilidad

Épica madre: **EP-001** · PRD v4.8 · habilita HU-144 · se relaciona con EP-011 (el correo es un vehículo para estos enlaces)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ es el mecanismo que hace existir la curaduría |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ tras la división |
| T | Testeable | ✓ |
