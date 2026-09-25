---
id: HU-123
titulo: "Entrar al panel con mi correo corporativo"
epica: EP-006
prioridad: alta
complejidad: M
estado: draft
fase: panel-crud
prd_version: 4.9
---

# HU-123 — Entrar al panel con mi correo corporativo

**Como** administradora de inventario de Talento Humano,
**quiero** entrar al panel con el correo corporativo que ya uso todos los días,
**para** no administrar una contraseña más y que mi acceso muera el día que salga de la empresa.

## Criterios de aceptación

### Happy path — entrada con correo inscrito y código

**Dado** que mi correo `@trycore.com` está inscrito en la lista del panel con rol de administradora de inventario,
**cuando** completo la entrada con el código de un uso que me llegó a ese buzón,
**Entonces** entro al panel con mi rol
**Y** no se me pide crear ni recordar una contraseña propia del portal
**Y** el panel me identifica por mi correo para el registro de auditoría

### Error — mi buzón corporativo ya no existe

**Dado** que salí de la empresa y mi buzón corporativo se desactivó,
**cuando** intento entrar al panel,
**Entonces** el código no me llega y no puedo entrar
**Y** el registro de auditoría no muestra ninguna desactivación manual de mi acceso

### Error — correo sin inscribir

**Dado** que tengo un correo `@trycore.com` que no está inscrito en la lista del panel,
**cuando** lo escribo para entrar,
**Entonces** veo el mismo mensaje que vería un correo inscrito —«si tu correo tiene acceso, te llegó un código»— y a quién pedir el acceso
**Y** no me llega ningún código ni veo inventario ni datos de profesionales

### Edge case — el panel no se alcanza desde el enlace del cliente

**Dado** que un cliente tiene el enlace del portal,
**cuando** intenta llegar al panel desde ahí,
**Entonces** no encuentra ninguna ruta que lo lleve, porque el panel vive en una dirección que el portal nunca expone

### Edge case — sesión abierta cuando el buzón se desactiva

**Dado** que tengo una sesión abierta en el panel y mi buzón corporativo se desactiva,
**cuando** pasan doce horas desde que abrí la sesión,
**Entonces** la sesión caducó y el panel me pide un código nuevo, que ya no puedo recibir

## Notas

Cubre **RF-8.1**, **RF-8.1.1**, **RF-8.1.3**, **RF-8.1.4**, **RF-8.1.5** y **RF-8.1.6**. Aplica **D-22 revisada el 2026-09-24**: no hay proveedor de identidad; el acceso es correo inscrito más código de un uso, dentro de lo que resuelve el propio portal, sin servicios externos de identidad (§8.3 del PRD). El archivo conserva su nombre anterior para no romper referencias.

**Por qué esta historia va primera de la épica.** RF-8.1.3 lo dice sin rodeos: el registro de auditoría de RF-8.9 exige saber *quién* cambió algo, y el «quién» solo existe si hay identidad. Sin esta historia, HU-138 no se puede construir.

**Duración de la sesión:** una jornada con un máximo de doce horas, y cierre a los sesenta minutos de inactividad (RF-8.1.6).

## Trazabilidad

Épica madre: **EP-006** · PRD v4.9 · D-22

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ no depende de otra historia del panel |
| N | Negociable | ✓ describe el resultado; el formato del código y del mensaje es negociable |
| V | Valiosa | ✓ elimina administración de credenciales y cierra el riesgo de accesos huérfanos |
| E | Estimable | ✓ sin proveedor de identidad: firma, código y sesión en el propio portal; correo saliente por Mailgun (§8.3) |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |
