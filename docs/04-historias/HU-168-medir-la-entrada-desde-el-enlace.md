---
id: HU-168
titulo: "Medir la entrada al portal desde que se abre el enlace"
epica: EP-008
prioridad: alta
complejidad: S
estado: draft
fase: telemetria-y-medicion
prd_version: 4.17
depende_de: [HU-167]
---

# HU-168 — Medir la entrada al portal desde que se abre el enlace

**Como** Dirección de Mercadeo, que necesita saber si el correo curado lleva gente al portal,
**quiero** que el portal cuente cada apertura de un enlace y cada paso del acceso —código pedido, código fallido, acceso concedido— antes de que exista una sesión,
**para** saber cuántos invitados se quedan en la puerta, y no ver solo a los que lograron entrar.

## Criterios de aceptación

### Happy path — la apertura y la entrada de una misma visita quedan unidas

**Dado** que un destinatario abrió por primera vez el enlace de su edición curada y ya pidió su código,
**cuando** lo verifica,
**Entonces** quedan registrados, como una sola visita, la entrada atribuida al enlace, a la cuenta y a la edición, el código pedido y el acceso concedido
**Y** esos eventos quedan ligados al contacto solo a partir del momento en que verificó el código

### Edge case — alguien abre un enlace reenviado y no llega a entrar

**Dado** que una persona que no está en la lista de invitados abre un enlace que le reenviaron,
**cuando** deja la pantalla de acceso sin entrar,
**Entonces** la apertura cuenta como una entrada sin contacto
**Y** no se atribuye al destinatario original ni a ningún otro contacto

### Edge case — el invitado falla el código antes de acertarlo

**Dado** que un invitado escribe mal su código dos veces,
**cuando** lo escribe bien a la tercera,
**Entonces** su visita muestra dos «código fallido» y un «acceso concedido»
**Y** ninguno de esos eventos guarda el código ni el correo escritos

### Error — el enlace no existe

**Dado** que alguien abre un enlace cuyo token no corresponde a ningún enlace,
**cuando** el portal responde,
**Entonces** la respuesta es la misma que daría sin telemetría —mismo código, mismo cuerpo y tiempo dentro de la misma tolerancia—
**Y** no se registra ninguna entrada atribuida a una cuenta

### Edge case — alguien abre un enlace revocado o vencido

**Dado** que un enlace de una cuenta fue revocado o venció,
**cuando** alguien lo abre,
**Entonces** queda registrado un «intento de entrada» atribuido a ese enlace y a su cuenta, sin contacto
**Y** no cuenta como «entrada» en el embudo
**Y** la respuesta de la puerta es la misma que daría sin telemetría

## Notas

Cubre el evento **«entrada» de RF-7.1** y el primer escalón del embudo, que es lo que **RF-1.2.4** y **RF-18.6** necesitan (entrada por el enlace de cada destinatario y verificación del correo). Base de HU-108 (embudo), HU-112 (atribución) y HU-116 de EP-011 (quién entró por su enlace).

**Cómo se mide, según ADR-0006 tras la revisión adversarial (H9).** No hay endpoint anónimo de eventos: el navegador **nunca** envía el token en un lote. La entrada la escribe **el servidor** en `POST /acceso/enlace`, en la misma transacción que el registro de seguridad `enlace_consultado`, con el `visita_id` que manda el navegador y la edición que lee de `enlace_tokens.envio_id`. Los pasos del código los escribe el servicio de acceso. Al verificar, el portal completa el contacto en los eventos de esa visita de las últimas 24 horas (`completar_visita`). La neutralidad de la respuesta es la de ADR-0002 (verificación V6-5).

**Toca código ya construido.** El acceso del cliente es de EP-001 y ya existe (`apps/portal/app/api/v1/acceso/*`). Esta historia añade la escritura de eventos sin cambiar su contrato ni su respuesta; el registro de seguridad `identidad.accesos_log` sigue siendo el de seguridad, no la medida.

**Revisión G/W/T 2026-10-02 (validador independiente).** El When del happy path encadenaba tres acciones («pide su código, lo verifica y entra»); la apertura y la petición del código pasan al Given como estado y el When queda en una sola acción, verificar el código. Los tres eventos (entrada, código pedido, acceso concedido) siguen en el Then; el alcance no cambia.

**Resuelto por el sponsor (D73, 2026-10-02), opción conservadora:** abrir un enlace **revocado o vencido** cuenta como **intento de entrada, no como entrada** (edge nuevo). Queda la señal de que alguien quiso volver (útil para HU-146) sin inflar el primer paso del embudo de HU-108. El enlace inexistente sigue sin registrar nada atribuido (error).

**Sesiones reales (D68).** La entrada por un enlace generado con la casilla «demo» (HU-188) se registra marcada como demo y no cuenta en el embudo; la marca la toma el servidor del enlace, no del navegador.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-7.1 (entrada) · RF-1.2.4 · RF-18.6 · ADR-0006 (H9, V6-5) · ADR-0002 · D68 y D73 (sponsor, 2026-10-02) · relacionada con HU-146 y HU-188 · depende de HU-167

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: usa el contrato y la tabla de HU-167; el acceso de EP-001 ya existe, así que no espera a ninguna épica futura |
| N | Negociable | ✓ fija qué pasos se cuentan, que el enlace revocado o vencido es intento y no entrada (D73), cuándo se liga el contacto y que la respuesta no cambie; el mecanismo para unir los dos tramos de la visita es del equipo |
| V | Valiosa | ✓ sin este escalón el embudo empieza en quien ya entró y oculta justo la pérdida que más le importa al correo curado |
| E | Estimable | ✓ S: escritura en tres puntos del acceso ya construido más el intento sobre enlace revocado o vencido, identificador de visita y unión por 24 horas; diseño cerrado en ADR-0006 |
| S | Pequeña | ✓ S: una capacidad en cinco escenarios, cada When con una sola acción |
| T | Testeable | ✓ cada Given es un estado reproducible (enlace abierto, código pedido); visitas con token válido, reenviado sin invitación, con códigos fallidos, revocado, vencido e inexistente producen eventos y respuestas comparables |
