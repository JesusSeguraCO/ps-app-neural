---
id: HU-123
titulo: "Entrar al panel con mi cuenta corporativa"
epica: EP-006
prioridad: alta
complejidad: M
estado: draft
fase: panel-crud
prd_version: 4.8
---

# HU-123 — Entrar al panel con mi cuenta corporativa

**Como** administradora de inventario de Talento Humano,
**quiero** entrar al panel con la cuenta corporativa que ya uso todos los días,
**para** no administrar una contraseña más y que mi acceso muera el día que salga de la empresa.

## Criterios de aceptación

### Happy path — entrada con identidad corporativa

**Dado** que tengo cuenta corporativa activa y rol de administradora de inventario,
**cuando** abro la dirección del panel,
**Entonces** entro con mi identidad corporativa y su segundo factor ya configurado
**Y** no se me pide crear ni recordar una contraseña propia del portal
**Y** el panel me identifica por nombre para el registro de auditoría

### Error — cuenta corporativa desactivada

**Dado** que salí de la empresa y mi cuenta corporativa se desactivó,
**cuando** intento entrar al panel,
**Entonces** el acceso se niega sin que nadie haya tenido que desactivarme aparte
**Y** el panel no conserva una credencial propia que sobreviva a mi salida

### Error — sin rol asignado

**Dado** que tengo cuenta corporativa pero ningún rol del panel,
**cuando** entro,
**Entonces** veo una pantalla que explica a quién pedir el acceso
**Y** no veo inventario ni datos de profesionales

### Edge case — el panel no se alcanza desde el enlace del cliente

**Dado** que un cliente tiene el enlace del portal,
**cuando** intenta llegar al panel desde ahí,
**Entonces** no encuentra ninguna ruta que lo lleve
**Y** el panel vive en una dirección distinta que el portal nunca expone

## Notas

Cubre **RF-8.1**, **RF-8.1.1**, **RF-8.1.3** y **RF-8.1.4**. Cierra **D-22**, cerrada el 2026-09-16.

**Por qué esta historia va primera de la épica.** RF-8.1.3 lo dice sin rodeos: el registro de auditoría de RF-8.9 exige saber *quién* cambió algo, y el «quién» solo existe si hay identidad. Sin esta historia, HU-138 no se puede construir.

**Pendiente con Tecnología:** proveedor de identidad y duración de la sesión antes de volver a pedir entrada. No bloquea la redacción; sí la estimación.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · D-22

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ no depende de otra historia del panel |
| N | Negociable | ✓ describe el resultado, no el proveedor de identidad |
| V | Valiosa | ✓ elimina administración de credenciales y cierra el riesgo de accesos huérfanos |
| E | Estimable | por confirmar con Tecnología — depende del proveedor de identidad |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |
