---
id: HU-123
titulo: "Entrar al panel con mi correo corporativo"
epica: EP-001
prioridad: alta
complejidad: M
estado: lista
fase: panel-crud
prd_version: 4.13
---

# HU-123 — Entrar al panel con mi correo corporativo

**Como** administradora de inventario de Talento Humano,
**quiero** entrar al panel con el correo corporativo que ya uso todos los días,
**para** no administrar una contraseña más y que mi acceso muera el día que salga de la empresa.

## Criterios de aceptación

### Happy path — entrada con correo inscrito y código

**Dado** que mi correo `@trycore.com` está inscrito en la lista del panel con rol de administradora de inventario,
**Cuando** completo la entrada con el código de un uso que me llegó a ese buzón,
**Entonces** entro al panel con mi rol
**Y** no se me pide crear ni recordar una contraseña propia del portal
**Y** el panel me identifica por mi correo para el registro de auditoría

### Error — mi buzón corporativo ya no existe

**Dado** que salí de la empresa y mi buzón corporativo se desactivó,
**Cuando** intento entrar al panel,
**Entonces** el código no me llega y no puedo entrar
**Y** el registro de auditoría no muestra ninguna desactivación manual de mi acceso

### Error — correo sin inscribir

**Dado** que tengo un correo `@trycore.com` que no está inscrito en la lista del panel,
**Cuando** lo escribo para entrar,
**Entonces** veo el mismo mensaje que vería un correo inscrito —«si tu correo tiene acceso, te llegó un código»— y a quién pedir el acceso
**Y** no me llega ningún código ni veo inventario ni datos de profesionales

### Edge case — el panel no se alcanza desde el enlace del cliente

**Dado** que un cliente tiene el enlace del portal,
**Cuando** intenta llegar al panel desde ahí,
**Entonces** no encuentra ninguna ruta que lo lleve, porque el panel vive en una dirección que el portal nunca expone

### Edge case — sesión abierta cuando el buzón se desactiva

**Dado** que tengo una sesión abierta en el panel y mi buzón corporativo se desactiva,
**Cuando** pasan doce horas desde que abrí la sesión,
**Entonces** la sesión caducó y el panel me pide un código nuevo, que ya no puedo recibir

## Notas

Cubre **RF-8.1**, **RF-8.1.1**, **RF-8.1.3**, **RF-8.1.4**, **RF-8.1.5** y **RF-8.1.6**. Aplica **D-22 revisada el 2026-09-24**: no hay proveedor de identidad; el acceso es correo inscrito más código de un uso, dentro de lo que resuelve el propio portal, sin servicios externos de identidad (§8.3 del PRD). El archivo conserva su nombre anterior para no romper referencias.

**Reasignada de EP-006 a EP-001 el 2026-09-27** (aprobado por el sponsor; backlog de arquitectura T-19). La caparazón (EP-001: navegación, entrada, generación de enlaces) necesita el login del panel para que Talento Humano genere enlaces (**HU-122**); dejarla en EP-006 habría obligado a construir EP-001 sin generación de enlaces. ADR-0008 la construye en el sub-slice 2 de EP-001. **No cambia el alcance**: los criterios son los mismos; solo cambia la épica que la entrega. El archivo conserva su nombre para no romper referencias.

**Por qué va antes que el resto del panel.** RF-8.1.3 lo dice sin rodeos: el registro de auditoría de RF-8.9 exige saber *quién* cambió algo, y el «quién» solo existe si hay identidad. Sin esta historia no se pueden construir HU-122 (EP-001) ni HU-138 y el resto de EP-006.

**Duración de la sesión:** una jornada con un máximo de doce horas, y cierre a los sesenta minutos de inactividad (RF-8.1.6).

## Trazabilidad

Épica madre: **EP-001** (antes EP-006, reasignada por T-19) · PRD v4.13 · D-22 · ADR-0002 (UC-9, QA-4) · ADR-0008 (sub-slice 2 de EP-001) · habilita HU-122 y EP-006

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ no depende de otra historia; es prerrequisito de HU-122 y de EP-006 |
| N | Negociable | ✓ describe el resultado; el formato del código y del mensaje es negociable |
| V | Valiosa | ✓ elimina administración de credenciales y cierra el riesgo de accesos huérfanos |
| E | Estimable | ✓ sin proveedor de identidad: firma, código y sesión en el propio portal; correo saliente por Mailgun (§8.3) |
| S | Pequeña | ✓ M: una puerta, un código y una sesión con dos límites de tiempo |
| T | Testeable | ✓ los criterios describen resultados observables |
