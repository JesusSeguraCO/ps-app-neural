---
id: HU-133
titulo: "Pausar un perfil declarando el motivo"
epica: EP-006
prioridad: alta
complejidad: S
estado: lista
fase: panel-crud
prd_version: 4.8
depende_de: [HU-136]
---

# HU-133 — Pausar un perfil declarando el motivo

**Como** administradora de inventario de Talento Humano,
**quiero** que pausar un perfil me obligue a decir por qué, eligiendo de una lista corta,
**para** que nadie use la pausa como forma encubierta de expresar una fecha.

## Criterios de aceptación

### Happy path — pausa con motivo

**Dado** que un perfil está publicado en el portal,
**cuando** lo pauso,
**Entonces** el panel me exige elegir el motivo de una lista corta
**Y** el perfil deja de mostrarse en el portal
**Y** el motivo queda registrado con quién lo pausó y cuándo

### Error — el motivo es en realidad una fecha

**Dado** que un perfil está publicado y tiene una fecha de disponibilidad futura conocida,
**cuando** busco en la lista de motivos de pausa uno que exprese esa fecha,
**Entonces** el panel me indica que eso no es una pausa sino disponibilidad
**Y** me lleva a dejar el perfil publicado con la fecha correcta

### Edge case — la pausa se prolonga más de 30 días

**Dado** que un perfil lleva pausado más de 30 días,
**cuando** abro la bandeja de vigencia,
**Entonces** el perfil aparece marcado para revisión, con su motivo de pausa y los días que lleva pausado
**Y** puedo reactivarlo o archivarlo desde ahí

### Edge case — pausa todavía dentro del umbral

**Dado** que un perfil lleva pausado 30 días o menos,
**cuando** abro la bandeja de vigencia,
**Entonces** el perfil no aparece marcado por su pausa

## Notas

Cubre **RF-8.14.2** y se apoya en **RF-8.8**.

**La distinción que este requisito protege.** Estado y disponibilidad son ejes distintos (RF-8.14.1). Usar *pausado* para decir «vuelve en noviembre» destruye inventario vendible: RF-8.13.2 es explícito en que un perfil ocupado **no se oculta, se ofrece desde que queda libre**. La lista corta de motivos existe para que la pausa no sirva de comodín.

**Los motivos de pausa son catálogo paramétrico** (RF-8.16), administrable desde HU-089.

**El umbral es de 30 días** (decisión del sponsor D4, 2026-09-30): un perfil pausado hace más de 30 días se marca para revisión y aparece en la bandeja de vigencia, que HU-136 amplía para incluirlo. Es el mismo horizonte de 30 días que O5 usa para la disponibilidad.

**Revisión INVEST 2026-09-30:** se aplica D4: «más tiempo del razonable» pasa a «más de 30 días», el Entonces dice qué muestra la bandeja y se añade el escenario de frontera (30 días o menos no marca). Se declara la dependencia de HU-136, que pinta la bandeja y ofrece reactivar o archivar.

## Trazabilidad

> OpenSpec change: administracion-del-inventario

Épica madre: **EP-006** · PRD v4.8 · RF-8.14.2 · RF-8.8 · D4 del sponsor (2026-09-30) · depende de HU-136 (bandeja de vigencia) · relacionada con HU-089

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: la pausa con motivo y el desvío a disponibilidad se construyen solos; los dos edge cases se observan en la bandeja de HU-136 |
| N | Negociable | ✓ la regla y el umbral están fijados (RF-8.14.2, D4); la redacción de los motivos es catálogo administrable |
| V | Valiosa | ✓ protege inventario vendible de desaparecer por mal uso del estado |
| E | Estimable | ✓ una transición a *pausado* con motivo obligatorio del catálogo, fecha de inicio de pausa guardada, y un criterio de la bandeja (pausado desde hace más de 30 días) |
| S | Pequeña | ✓ S: una acción con selector de motivo y una regla de fechas |
| T | Testeable | ✓ motivo y autor en la auditoría, perfil fuera del portal, y frontera de 30 días comprobable con fechas fijadas |
