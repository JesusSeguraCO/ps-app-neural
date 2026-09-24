---
id: HU-066
titulo: "Arrancar desde una sugerencia en lugar de un campo vacío"
epica: EP-009
prioridad: alta
complejidad: S
estado: draft
fase: fase-2-rediseno
prd_version: 2.0
---

# HU-066 — Arrancar desde una sugerencia en lugar de un campo vacío

**Como** líder de área que entra al portal sin tener claro cómo formular lo que busca,
**quiero** encontrar la barra precargada con el contexto de mi proyecto y algunas instrucciones sugeridas,
**para** no tener que decidir qué escribir desde cero cuando entro con prisa y poca frecuencia de uso.

## Criterios de aceptación

### Happy path — sugerencia enviada sin editar

**Dado** que entro desde el enlace de mi cuenta con un proyecto activo asociado,
**cuando** toco una de las instrucciones sugeridas,
**Entonces** se ejecuta la búsqueda con esa instrucción
**Y** el portal registra que la consulta salió de una sugerencia y que no fue editada

### Happy path — sugerencia editada

**Dado** que una instrucción sugerida está cargada en la barra,
**cuando** la modifico antes de enviarla,
**Entonces** se ejecuta la búsqueda con mi texto
**Y** el portal registra la consulta como editada por el usuario

### Edge case — cuenta sin proyecto activo conocido

**Dado** que entro con un enlace sin contexto de proyecto,
**cuando** llego a la pantalla de entrada,
**Entonces** veo sugerencias genéricas por familia de rol y no sugerencias inventadas sobre un proyecto que no conocemos
**Y** la barra no queda vacía


## Notas

Cubre RF-12.1. La distinción entre sugerencia editada y sin editar es la prueba de falsación: por encima del 60% sin editar, el portal está dictando la demanda en vez de captarla.



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
