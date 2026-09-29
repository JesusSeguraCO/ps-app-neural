---
id: HU-090
titulo: "Entrar al portal con mi correo invitado y un código, sin registrarme"
epica: EP-001
prioridad: alta
complejidad: M
estado: lista
fase: cierre-de-huecos
prd_version: 4.13
---

# HU-090 — Entrar al portal con mi correo invitado y un código, sin registrarme

**Como** líder de área que recibió un enlace con perfiles para su proyecto,
**quiero** entrar escribiendo mi correo y el código que me llega a ese buzón, sin crear usuario ni recordar contraseña,
**para** ver los perfiles sin perder tiempo en un registro y con la tranquilidad de que solo las personas invitadas los ven.

## Criterios de aceptación

### Happy path — correo invitado y código de un uso

**Dado** que mi correo está en la lista de invitados del enlace
**Y** que no tengo una sesión de ese enlace en este dispositivo
**Y** que la puerta me explicó que los perfiles incluyen nombre y trayectoria de profesionales reales
**Cuando** completo la verificación con mi correo invitado y el código de un uso que me llegó a ese buzón
**Entonces** entro al portal
**Y** veo el nombre de mi cuenta y el contexto de mi proyecto
**Y** no se me pidió crear usuario ni contraseña

### Error — correo que no está invitado

**Dado** que mi correo no está en la lista de invitados del enlace, aunque sea de la misma empresa
**Cuando** pido el código con ese correo
**Entonces** veo el mensaje «Si tu correo está invitado, te llegó un código. Si no te llega, pídele a quien te compartió el enlace que solicite tu invitación»
**Y** ese mensaje es idéntico al que ve una persona invitada al pedir su código
**Y** no llega ningún código a ese buzón
**Y** no veo ningún perfil

### Error — el código no sirve

**Esquema del escenario:** código no válido

**Dado** que pedí un código con mi correo invitado
**Y** que tengo un código `<tipo_de_codigo>`
**Cuando** ingreso ese código
**Entonces** no entro al portal
**Y** veo en lenguaje llano que el código no es válido
**Y** veo la opción de pedir un código nuevo en la misma pantalla

**Ejemplos:**

| tipo_de_codigo |
|---|
| equivocado |
| vencido |
| ya usado |

### Edge case — intentos agotados

**Dado** que ya fallé cinco veces el código con este enlace y este correo
**Y** que la espera tras el bloqueo no ha terminado
**Cuando** ingreso un código, incluso el correcto
**Entonces** no entro al portal
**Y** veo, sin tecnicismos, que debo esperar y a quién contactar si necesito entrar antes
**Y** el mensaje no revela si el correo está o no en la lista de invitados

### Edge case — vuelvo a abrir el enlace después de haber entrado

**Esquema del escenario:** alcance de la sesión

**Dado** que entré con mi correo y mi código en un dispositivo hace menos de 30 días
**Y** que el enlace está `<estado_del_enlace>`
**Cuando** abro el mismo enlace en `<dispositivo>`
**Entonces** `<resultado>`

**Ejemplos:**

| estado_del_enlace | dispositivo | resultado |
|---|---|---|
| vigente y sin revocar | ese mismo dispositivo | entro directamente, sin que se me pida correo ni código |
| vigente y sin revocar | otro dispositivo | veo la puerta que me pide el correo y el código |
| vencido | ese mismo dispositivo | veo la pantalla de renovación del enlace vencido (HU-092), no el portal |
| revocado | ese mismo dispositivo | veo la pantalla del enlace revocado (HU-144), no el portal |

## Notas

Cubre **RF-1.1**, **RF-1.2**, **RF-1.2.3**, **RF-1.2.5**, **RF-1.2.9**, **RF-1.2.11**, **RF-1.3** y **RF-1.4** (la parte de la sesión acotada a la vigencia del enlace).

**Reescrita el 2026-09-27** (corrección de discovery aprobada por el sponsor; backlog de arquitectura T-18 y CRN-13). El criterio anterior —«toco el enlace y entro directamente»— correspondía a la primera resolución de D-4 (enlace firmado a secas) y contradecía **D-4 revisada el 2026-09-25**: el acceso es **nominal**, solo entran los correos de la lista de invitados del enlace, verificados con un código a su buzón; reenviar el enlace no da acceso. La necesidad de la historia —no registrarse para mirar algo que Trycore envió— se conserva: sigue sin usuario ni contraseña.

**Sesión por dispositivo de 30 días, siempre acotada a la vigencia del enlace** (vigencia por omisión: 30 días; CRN-16 y T-5 resueltos el 2026-09-25, ADR-0002). La revocación surte efecto aunque la sesión no haya caducado.

**La respuesta neutra es deliberada.** Un mensaje distinto para correos no invitados permitiría adivinar la lista de invitados; por eso el escenario de error exige el mismo mensaje en los dos casos (ADR-0002). El texto exacto es negociable; la igualdad entre las dos respuestas no. El colega que no está invitado entra por **HU-095** (RF-1.2.10).

**Ajuste de forma del 2026-09-27** (validación BDD): los pasos se reescribieron para que cada «Dado» sea un estado y cada «Cuando» una sola acción; el código no válido y el alcance de la sesión pasaron a esquemas con ejemplos, sin quitar ningún caso. La explicación de por qué se pide el correo (RF-1.2.5) queda como precondición observable del happy path.

**Se movieron a HU-144** dos criterios que esta historia tenía en la versión 4.0: el enlace alterado (ahora junto al revocado, porque la respuesta es la misma pantalla) y la exclusión de buscadores (**RF-1.5**). No se recorta nada: siguen con criterio de aceptación propio, en la historia de apertura del enlace.

**Tamaño.** La infraestructura de identidad compartida de EP-001 (limitación de intentos, tablas de códigos y sesiones, revalidación por petición; ADR-0002, UC-1/2/3/9) es cimiento de la épica, no alcance de producto de esta historia. La complejidad M se mide sobre la puerta, el código y la sesión que se apoyan en ese cimiento.

Los plazos concretos del código y de la espera tras el bloqueo los calibra Tecnología con datos reales (CRN-16, ADR-0002); el límite de cinco intentos lo fija RF-1.2.9.

## Trazabilidad

> OpenSpec change: acceso-y-aterrizaje-curado

Épica madre: **EP-001** · PRD v4.13 · D-4 revisada · ADR-0002 (UC-1, QA-3) · backlog T-18, CRN-13 · orden de construcción: primera historia de la cara cliente de EP-001; no depende de otra historia (el enlace con invitados se siembra en pruebas sin esperar a HU-122)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ es la puerta de la cara cliente; solo necesita que exista un enlace con invitados, que en pruebas se siembra sin depender de HU-122 |
| N | Negociable | ✓ fija el resultado (correo invitado + código, respuesta neutra, sesión acotada); textos, plazos del código y de la espera son negociables |
| V | Valiosa | ✓ el cliente entra sin registro y los datos nominales del talento quedan protegidos (D-4, Ley 1581) |
| E | Estimable | ✓ el mecanismo está decidido en ADR-0002 (código de un uso, límite de intentos, sesión de 30 días); falta la cifra del equipo |
| S | Pequeña | ✓ M: una puerta, un código y una sesión, sobre el cimiento de identidad compartido de EP-001 |
| T | Testeable | ✓ cinco escenarios con resultado observable; la neutralidad se prueba comparando las dos respuestas |
