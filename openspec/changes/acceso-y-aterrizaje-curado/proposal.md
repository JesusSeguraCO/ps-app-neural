# Proposal

## Why

El portal convierte un correo curado en una conversación comercial, y todo empieza cuando una persona invitada abre su enlace: sin una puerta nominal segura, un aterrizaje frente a los perfiles que le propusimos y un panel desde el que Talento Humano genera esos enlaces, no existe ningún recorrido del producto. EP-001 es además la épica caparazón del proyecto (greenfield): ninguna épica de negocio puede construirse antes de que exista, archivada y con evidencia.

## What Changes

- **Plataforma base (esqueleto andante)**: las dos aplicaciones (portal y panel) arrancan con cabeceras de seguridad, lista positiva de rutas, guarda de sesión en cada página, salud, arranque que falla con configuración incompleta, roles de base de datos sin privilegios de más, cola de trabajos y worker que envía los códigos por correo.
- **Acceso al panel**: entrada con correo `@trycore.com` inscrito y código de un uso al buzón, sesión de una jornada, sin contraseñas; el panel vive en una dirección que el portal nunca expone.
- **Generación de enlaces curados**: desde el panel, la administradora de inventario elige perfiles publicados de cualquier familia, escribe la razón, confirma los correos invitados (con propuesta del contacto del CRM) y genera un enlace con vigencia editable (30 días por omisión).
- **Acceso nominal del cliente**: la puerta explica por qué pide el correo, envía un código de un uso solo a correos invitados con respuesta idéntica para no invitados, limita intentos, abre una sesión de 30 días acotada al enlace y al dispositivo, y permite renovar un enlace vencido solo al buzón de un invitado cuando la cuenta está activa en HubSpot (si no se puede confirmar, avisa a una persona de Trycore).
- **Aterrizaje curado**: el cliente ve la selección con su razón, el estado real de cada perfil (nunca omitido), el encuadre cuando no hay selección, la ampliación al banco completo y el retorno a la selección; enlaces revocados o alterados muestran una salida en lenguaje llano; nada del portal se indexa ni sirve nombres sin sesión.
- **Invitar a un colega**: el cliente pide desde el portal la invitación de un colega; Talento Humano la aprueba o rechaza en el panel, con auditoría; el colega entra con su propio «Mi equipo», vacío y aislado.
- **Mínimos que las historias necesitan** (decisión del PO en el DoR): un «Mi equipo» por invitado en el servidor (sin sumar ni quitar, que es de EP-004), un modelo mínimo de perfil publicable con perfiles ficticios, y un adaptador de solo lectura de HubSpot (contacto de la cuenta, cuenta activa y propietario) con doble en CI.

Se construye en siete sub-slices, de uno en uno y con el recorrido verde entre cada uno, en el orden normativo de ADR-0008: 1 esqueleto andante · 2 login del panel · 3 modelo mínimo de perfil publicable · 4 generación del enlace · 5 aterrizaje y acceso del cliente · 6a selección, encuadre y retorno · 6b invitar a un colega.

## Capabilities

### New Capabilities

- `plataforma-base`: cabeceras y perímetro de ambas aplicaciones, lista positiva de rutas, guarda de sesión, salud, arranque con configuración completa, cola y envío de códigos.
- `acceso-panel`: entrada al panel con correo corporativo inscrito y código de un uso, sesión de una jornada, separación del portal.
- `generacion-enlaces`: creación de enlaces curados desde el panel con perfiles publicados, razón, invitados y vigencia.
- `acceso-cliente`: puerta nominal del cliente, código de un uso, límite de intentos, sesión acotada y renovación del enlace vencido.
- `aterrizaje-curado`: la selección con su razón y el estado real de cada perfil, el encuadre sin selección, ampliar y volver, enlaces que ya no abren y exclusión de rastreadores.
- `invitaciones-colega`: petición de invitación desde el portal y decisión en el panel con auditoría.

### Modified Capabilities

(Ninguna: no existen specs previas en `openspec/specs/`.)

## Impact

- **Código**: `apps/portal`, `apps/panel`, `apps/worker`, `packages/{dominio,infra,contratos,motor,ui}`, migraciones y `roles.sql`, `docker/`, `docker-compose.yml`, `.github/` (CI mínimo de ADR-0008/0010).
- **Datos**: esquemas `identidad` e `identidad_panel`, cola `trabajos`, enlaces, invitados y peticiones, «Mi equipo» por invitado, modelo mínimo de perfil publicable y vista `catalogo_publicable`, auditoría del panel (ADR-0003).
- **Fronteras externas (solo servidor)**: Mailgun para los códigos y avisos (doble declarado en CI); HubSpot en solo lectura (doble en CI). Gemini no interviene.
- **Seguridad y datos personales**: Ley 1581; lista negra B.4 nunca cruza al portal; sin proveedor de identidad; secretos solo en variables `SECRET` por componente.
- **Dependencias**: dentro de `.claude/config/stack-allowlist.json` (vigilado por `stack-guard.sh`).

## Trazabilidad

- Épica: EP-001
- Historias: HU-090, HU-091, HU-092, HU-093, HU-094, HU-095, HU-122, HU-123, HU-144, HU-145
- Discovery: docs/03-backlog/epicas.md#ep-001--acceso-y-aterrizaje-curado
- Arquitectura: docs/adr/0002, 0003, 0008, 0009, 0010 (orden de sub-slices: ADR-0008 «Esqueleto andante y orden de construcción de la épica caparazón»)
- Diseño: docs/05-prototipo/manifest.json (pantallas de EP-001 aprobadas)
