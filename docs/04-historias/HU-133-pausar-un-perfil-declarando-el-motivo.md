---
id: HU-133
titulo: "Pausar un perfil declarando el motivo"
epica: EP-006
prioridad: alta
complejidad: S
estado: draft
fase: panel-crud
prd_version: 4.8
---

# HU-133 — Pausar un perfil declarando el motivo

**Como** administradora de inventario de Talento Humano,
**quiero** que pausar un perfil me obligue a decir por qué, eligiendo de una lista corta,
**para** que nadie use la pausa como forma encubierta de expresar una fecha.

## Criterios de aceptación

### Happy path — pausa con motivo

**Dado** que necesito retirar temporalmente un perfil del portal,
**cuando** lo pauso,
**Entonces** el panel me exige elegir el motivo de una lista corta
**Y** el perfil deja de mostrarse en el portal
**Y** el motivo queda registrado con quién lo pausó y cuándo

### Error — el motivo es en realidad una fecha

**Dado** que quiero pausar un perfil porque está ocupado hasta cierta fecha,
**cuando** busco el motivo,
**Entonces** el panel me indica que eso no es una pausa sino disponibilidad
**Y** me lleva a dejar el perfil publicado con la fecha correcta

### Edge case — la pausa se prolonga

**Dado** que un perfil lleva pausado más tiempo del razonable,
**cuando** reviso la bandeja de vigencia,
**Entonces** aparece marcado para revisión
**Y** puedo reactivarlo o archivarlo

## Notas

Cubre **RF-8.14.2** y se apoya en **RF-8.8**.

**La distinción que este requisito protege.** Estado y disponibilidad son ejes distintos (RF-8.14.1). Usar *pausado* para decir «vuelve en noviembre» destruye inventario vendible: RF-8.13.2 es explícito en que un perfil ocupado **no se oculta, se ofrece desde que queda libre**. La lista corta de motivos existe para que la pausa no sirva de comodín.

**Los motivos de pausa son catálogo paramétrico** (RF-8.16), administrable desde HU-089.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · relacionada con HU-089 y HU-136

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ protege inventario vendible de desaparecer por mal uso del estado |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
