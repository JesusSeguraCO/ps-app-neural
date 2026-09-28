---
id: HU-092
titulo: "Recuperar el acceso cuando el enlace venció"
epica: EP-001
prioridad: alta
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.13
depende_de: [HU-090]
---

# HU-092 — Recuperar el acceso cuando el enlace venció

**Como** líder de área que guardó el correo y lo abre semanas después,
**quiero** pedir un enlace nuevo desde la misma pantalla, sin tener que escribirle a nadie y esperar,
**para** no perder la intención justo cuando por fin tuve tiempo de mirar.

## Criterios de aceptación

### Happy path — entiendo por qué no puedo entrar

**Dado** que mi enlace venció
**Cuando** abro el enlace
**Entonces** veo una explicación en lenguaje llano de que el enlace venció, sin un error técnico
**Y** veo en esa misma pantalla un campo para escribir mi correo y pedir un enlace nuevo

### Happy path — pido un enlace nuevo y llega a mi buzón

**Dado** que estoy en la pantalla del enlace vencido
**Y** que mi correo estaba en la lista de invitados de ese enlace
**Y** que la empresa de mi cuenta figura como cuenta activa en HubSpot
**Cuando** pido un enlace nuevo con mi correo
**Entonces** veo el mensaje «Si tu correo estaba invitado, te enviamos un enlace nuevo a tu buzón»
**Y** el enlace nuevo llega a mi buzón
**Y** el enlace nuevo nunca aparece en la pantalla

### Error — pido otra vez antes de que termine la espera

**Dado** que ya pedí un enlace nuevo hace pocos minutos y la ventana de espera sigue activa
**Cuando** pido otro enlace nuevo con el mismo correo
**Entonces** no se genera un segundo enlace
**Y** veo que el primero ya va en camino a mi buzón

### Error — quien pide no estaba invitado

**Dado** que tengo abierta la pantalla de un enlace vencido que me reenviaron
**Y** que mi correo no está en la lista de invitados de ese enlace
**Cuando** pido un enlace nuevo con mi correo
**Entonces** veo el mensaje «Si tu correo estaba invitado, te enviamos un enlace nuevo a tu buzón»
**Y** no se genera ni se envía ningún enlace

### Edge case — no se puede confirmar que la cuenta está activa

**Esquema del escenario:** la renovación automática no procede

**Dado** que estoy en la pantalla del enlace vencido con un correo que estaba invitado
**Y** que <estado_de_la_cuenta>
**Cuando** pido un enlace nuevo
**Entonces** no se genera ningún enlace automáticamente
**Y** <destinatario> recibe un correo con la petición
**Y** veo que alguien de Trycore me contactará

**Ejemplos:**

| estado_de_la_cuenta | destinatario |
|---|---|
| la empresa de mi cuenta no figura como cuenta activa en HubSpot | el propietario de la empresa en HubSpot |
| HubSpot no responde al comprobar si la cuenta está activa | Talento Humano |

## Notas

Cubre **RF-1.4**. La vigencia del enlace es configurable, con 30 días por omisión (ADR-0002, T-5).

**Ajustada el 2026-09-27 a D-4 revisada** (acceso nominal; corrección de discovery T-18, CRN-13): pedir un enlace nuevo no puede convertirse en una puerta trasera. Por eso el enlace renovado llega **solo al buzón de un correo invitado** y nunca se muestra en pantalla, y quien no estaba invitado recibe exactamente la misma respuesta que quien sí lo estaba.

**Ajuste de forma del 2026-09-27** (validación INVEST/BDD): el happy path se partió en dos escenarios (ver la explicación / pedir el enlace nuevo) para que cada «Cuando» sea una sola acción. La respuesta neutra tiene aquí **texto propio**, sin remitir a HU-090; el texto es negociable, la igualdad entre invitado y no invitado no. La prueba de coherencia con la respuesta neutra de HU-090 (mismo principio, mismo tono) se hace al cerrar la épica.

**Fuente de verdad de «cuenta activa» (resuelta el 2026-09-28 por el PO, DoR de EP-001).** Una cuenta está activa cuando **la empresa en HubSpot** lo indica en su propiedad de cuenta activa (nombre exacto de la propiedad a fijar en el adaptador); el propietario al que se avisa es el **propietario de la empresa en HubSpot**. EP-001 incluye por eso un adaptador de **solo lectura** de HubSpot para la empresa (estado activo y propietario), con doble declarado en CI. Si HubSpot no responde, la renovación **no** se concede automáticamente: pedir un enlace nuevo no puede abrirse por una caída.

**Canal del caso de cuenta inactiva.** La petición se avisa por correo al **propietario de la cuenta** en Trycore (el mismo propietario que asigna RF-9.5 y el mismo canal de correo de RF-9.7.1); no se crea una integración nueva. Qué define que una cuenta «ya no está activa» queda como pregunta abierta (abajo).

**Preguntas abiertas** (no las decide esta corrección; propuestas para §12.3 del PRD):
- Con acceso nominal, ¿la renovación para una cuenta activa sigue siendo automática, o Talento Humano debe confirmarla como confirma los invitados de un enlace nuevo (RF-1.2.7, RF-19.3)? Los criterios conservan la resolución vigente —automática para cuentas activas—.
- ¿El enlace renovado conserva la misma selección, o se reevalúa y se ofrece la selección vigente? RF-19.2 garantiza, en cualquier caso, que se ve el estado real de cada perfil al abrir.
- ~~¿Cuál es la fuente de verdad de «cuenta activa»?~~ **Resuelta el 2026-09-28:** la propiedad de la empresa en HubSpot (ver arriba).
- ~~Si HubSpot no responde, ¿a quién llega la petición?~~ **Resuelta el 2026-09-28 por el PO:** a Talento Humano, como los avisos de ADR-0006 (ver el esquema del escenario «no se puede confirmar que la cuenta está activa»).

## Trazabilidad

Épica madre: **EP-001** · PRD v4.13 · ADR-0002 (UC-1, estados de enlace vencido y revocado) · RF-9.5 / RF-9.7.1 (canal del aviso) · depende de HU-090 · orden de construcción: después de HU-090

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: es la rama «vencido» de la puerta de HU-090, así que se secuencia después de ella; su respuesta neutra tiene texto propio y se verifica sola con enlaces vencidos sembrados |
| N | Negociable | ✓ describe el resultado; textos y ventana antirrepetición son negociables |
| V | Valiosa | ✓ recupera la intención de compra del cliente que vuelve tarde |
| E | Estimable | ✓ el canal del aviso reutiliza RF-9.5/RF-9.7.1; la fuente de «cuenta activa» quedó resuelta el 2026-09-28 (propiedad de la empresa en HubSpot, adaptador de solo lectura con doble en CI); las preguntas abiertas restantes no cambian los criterios; falta la cifra del equipo |
| S | Pequeña | ✓ S: una pantalla de renovación y una petición |
| T | Testeable | ✓ cinco escenarios (uno es un esquema con dos ejemplos: cuenta no activa y HubSpot sin respuesta); enlaces vencidos sembrados, con correo invitado y no invitado, cuenta activa e inactiva y HubSpot simulado caído, dan resultados observables |
