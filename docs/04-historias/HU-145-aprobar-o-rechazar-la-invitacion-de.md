---
id: HU-145
titulo: "Aprobar o rechazar la invitación de un colega"
epica: EP-001
prioridad: media
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.13
depende_de: [HU-123, HU-095]
---

# HU-145 — Aprobar o rechazar la invitación de un colega

**Como** administradora de inventario del banco de talento,
**quiero** ver las peticiones de invitación de cada enlace y aprobarlas o rechazarlas desde el panel,
**para** que el colega de un cliente pueda dar su segunda opinión sin que el enlace se convierta en una llave que abre a quien lo tenga.

## Criterios de aceptación

### Happy path — apruebo la petición

**Dado** que entré al panel con mi correo inscrito como administradora de inventario
**Y** que hay una petición pendiente para invitar a un colega en un enlace vigente
**Cuando** apruebo la petición
**Entonces** el correo del colega queda en la lista de invitados de ese enlace, marcado como invitación aprobada
**Y** queda un registro en la auditoría del panel con quién aprobó, cuándo, qué enlace y qué correo
**Y** la petición deja de aparecer como pendiente

### Error — rechazo la petición

**Dado** que entré al panel como administradora de inventario
**Y** que hay una petición pendiente para invitar a una persona en un enlace
**Cuando** rechazo la petición escribiendo el motivo
**Entonces** el correo de esa persona no se añade a la lista de invitados del enlace
**Y** queda un registro en la auditoría del panel con quién rechazó, cuándo, qué enlace, qué correo y el motivo
**Y** quien pidió la invitación ve en el portal que no se aprobó y el contacto de Trycore a quien consultar

### Edge case — la petición es para un enlace que ya no está vigente

**Dado** que entré al panel como administradora de inventario
**Y** que hay una petición pendiente en un enlace que venció o fue revocado
**Cuando** abro la lista de peticiones pendientes
**Entonces** veo esa petición marcada con el estado del enlace
**Y** no veo la opción de aprobarla mientras el enlace no esté vigente

### Edge case — el correo ya está invitado

**Dado** que entré al panel como administradora de inventario
**Y** que hay una petición pendiente cuyo correo ya está en la lista de invitados de ese enlace
**Cuando** abro la petición
**Entonces** veo que ese correo ya tiene acceso al enlace
**Y** la lista de invitados del enlace sigue teniendo ese correo una sola vez

## Notas

Cubre **RF-1.2.10** (el lado de quien decide). **Dividida de HU-095 el 2026-09-27** por actor (validación INVEST: la historia original sumaba el portal del cliente y el panel de Talento Humano). El alcance no cambia: la pantalla del panel donde Talento Humano decide ya formaba parte de HU-095 y ahora tiene criterios propios.

**Mecanismo decidido en ADR-0002 (UC-2):** la petición queda registrada como invitación solicitada; aprobar da de alta el correo en la lista de invitados del enlace con origen «invitación aprobada»; aprobar y rechazar son actos administrativos que van a la auditoría encadenada del panel (ADR-0003). El aviso a Talento Humano de que hay una petición pendiente es de ADR-0006.

**Criterios derivados del mecanismo, no decisiones nuevas.** Que una petición de un enlace vencido o revocado no se pueda aprobar sigue de RF-1.4 (un enlace vencido no da acceso a nadie); que un correo ya invitado no se duplique sigue de la lista nominal de RF-1.2.7. Si negocio prefiere que al aprobar sobre un enlace vencido se renueve el enlace, es decisión nueva y va a la pregunta abierta de renovación de HU-092.

**Preguntas abiertas** (no bloquean los criterios; se resuelven con negocio):
- Al rechazar, ¿el portal muestra al cliente el motivo que escribió Talento Humano o solo el contacto a quien consultar? Los criterios piden lo segundo como mínimo y guardan el motivo en la auditoría.
- Al aprobar, ¿se avisa al colega por correo de que ya puede entrar, o se confía en que quien pidió se lo diga? Hoy ningún requisito pide ese aviso; los criterios no lo exigen.

## Trazabilidad

> OpenSpec change: acceso-y-aterrizaje-curado

Épica madre: **EP-001** · PRD v4.13 · D-4 revisada · RF-1.2.10 · ADR-0002 (UC-2) · ADR-0003 (auditoría encadenada) · ADR-0006 (aviso de peticiones pendientes) · depende de HU-123 (login del panel) y HU-095 (la petición) · orden de construcción: HU-123 y HU-095 → HU-145

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: se secuencia después del login del panel (HU-123) y de la petición (HU-095); se construye y verifica sola con una sesión de panel y peticiones sembradas |
| N | Negociable | ✓ fija el resultado (alta en la lista, registro de auditoría, sin aprobación no hay acceso); la forma de la pantalla y los textos son negociables |
| V | Valiosa | ✓ sin esta decisión no existe la segunda opinión del colega que el cliente pide en HU-095 |
| E | Estimable | ✓ mecanismo, tablas y auditoría decididos en ADR-0002/0003; falta la cifra del equipo |
| S | Pequeña | ✓ S: un actor (Talento Humano), una superficie (el panel), una lista con dos acciones |
| T | Testeable | ✓ cada decisión deja un resultado observable en la lista de invitados, en la auditoría y en el portal del cliente |
