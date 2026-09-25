---
id: HU-118
titulo: "Distinguir lo que no puedo negociar de lo que sería bueno tener"
epica: EP-009
prioridad: alta
complejidad: M
estado: prototipado
fase: referencias-juicebox
prd_version: 4.1
---

# HU-118 — Distinguir lo que no puedo negociar de lo que sería bueno tener

**Como** líder de proyecto que está afinando lo que necesita,
**quiero** marcar cada criterio como obligatorio o deseable,
**para** que un requisito deseable ordene los resultados en lugar de dejarme sin ninguno.

## Criterios de aceptación

### Happy path — los deseables ordenan

**Dado** que marqué el rol como obligatorio y el sector como deseable,
**cuando** veo los resultados,
**Entonces** aparecen todos los perfiles de ese rol
**Y** los que además cumplen el sector aparecen primero
**Y** cada tarjeta dice cuántos deseables cumple

### Happy path — endurecer un criterio

**Dado** que un criterio estaba como deseable,
**cuando** lo marco como obligatorio,
**Entonces** los perfiles que no lo cumplen desaparecen de los resultados
**Y** veo cuántos quedaron

### Error — ningún perfil cumple los obligatorios

**Dado** que endurecí varios criterios,
**cuando** ninguno los cumple todos,
**Entonces** llego al camino del cero
**Y** veo quién falla exactamente un obligatorio, indicando cuál

### Edge case — todo deseable

**Dado** que no marqué ningún criterio como obligatorio,
**cuando** veo los resultados,
**Entonces** aparece el banco completo ordenado por cuántos deseables cumple cada perfil
**Y** no veo una lista vacía

## Notas

Tomado de Juicebox, que separa filtros de criterios (evidencia A).

**La razón por la que aquí vale más que en el referente:** Juicebox usa los criterios para ordenar 1.200 resultados; nosotros los necesitamos para no quedar en cero. Con un banco de decenas, tratar todo como filtro duro cierra el conjunto en dos pasos.

Por omisión solo el rol es obligatorio: es la configuración que más resultados produce, y el cliente endurece lo que de verdad no puede negociar.

Cubre RF-13.9.

## Trazabilidad

Épica madre: **EP-009** · PRD v4.1

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
