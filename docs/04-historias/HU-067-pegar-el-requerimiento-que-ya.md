---
id: HU-067
titulo: "Pegar el requerimiento que ya tengo escrito"
epica: EP-009
prioridad: media
complejidad: M
estado: draft
fase: fase-2-rediseno
prd_version: 2.0
---

# HU-067 — Pegar el requerimiento que ya tengo escrito

**Como** líder de proyecto que ya redactó el requerimiento en un documento interno,
**quiero** pegar ese texto completo y que el portal extraiga los criterios como etiquetas que pueda editar,
**para** aprovechar el trabajo que ya hice en lugar de volver a describir la necesidad.

## Criterios de aceptación

### Happy path — extracción de criterios

**Dado** que tengo un requerimiento de cargo en el portapapeles,
**cuando** lo pego en la barra y envío,
**Entonces** veo los criterios extraídos como etiquetas editables
**Y** puedo eliminar cualquier etiqueta antes de buscar
**Y** los resultados responden a las etiquetas que dejé

### Error — texto sin criterios reconocibles

**Dado** que pego un texto que no describe un perfil,
**cuando** envío,
**Entonces** el portal me dice que no encontró criterios y conserva mi texto
**Y** puedo editarlo o escribir una instrucción corta en su lugar

### Edge case — exceso de criterios extraídos

**Dado** que el requerimiento contiene condiciones contractuales e historia del proyecto,
**cuando** el portal extrae los criterios,
**Entonces** se muestran solo los criterios más relevantes, no todos los detectados
**Y** el resto queda accesible bajo «ver todos» sin ocupar la pantalla


## Notas

Cubre RF-12.2.

**Condicionada a la prueba previa de RF-12.2**: pegar cinco requerimientos reales de clientes actuales y contar cuántos chips sobran. Si sobran más de los que sirven, la historia no se construye.

## Trazabilidad

Épica madre: **EP-009** · PRD v2.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |
