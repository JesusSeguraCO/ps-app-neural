---
id: HU-090
titulo: "Entrar al portal desde el correo sin registrarme"
epica: EP-001
prioridad: alta
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-090 — Entrar al portal desde el correo sin registrarme

**Como** líder de área que recibió el correo con perfiles para su proyecto,
**quiero** abrir el enlace y ver los perfiles sin crear usuario ni recordar contraseña,
**para** no perder tiempo en un registro para mirar algo que ustedes me enviaron.

## Criterios de aceptación

### Happy path

**Dado** que recibí el correo con el enlace de mi cuenta,
**cuando** toco el enlace,
**Entonces** entro directamente al portal
**Y** veo el nombre de mi cuenta y el contexto de mi proyecto
**Y** no se me pide usuario ni contraseña

### Error — enlace manipulado

**Dado** que alguien altera los parámetros del enlace,
**cuando** se intenta abrir,
**Entonces** el portal no muestra inventario
**Y** se ofrece solicitar un enlace nuevo, sin lenguaje técnico

### Edge case — buscador

**Dado** que un motor de búsqueda intenta indexar la dirección,
**cuando** rastrea la página,
**Entonces** el portal responde con exclusión de rastreo
**Y** ningún perfil queda indexado


## Notas

Cubre RF-1.1 a RF-1.5. El acceso por enlace firmado sin credenciales es D-4, cerrada.

## Trazabilidad

Épica madre: **EP-001** · PRD v4.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |
