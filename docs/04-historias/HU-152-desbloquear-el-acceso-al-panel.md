---
id: HU-152
titulo: "Desbloquear el acceso al panel de una persona del equipo"
epica: EP-006
prioridad: alta
complejidad: S
estado: draft
fase: panel-crud
prd_version: 4.17
depende_de: [HU-123, HU-151]
---

# HU-152 — Desbloquear el acceso al panel de una persona del equipo

**Como** administradora de inventario de Talento Humano,
**quiero** ver en la lista de acceso quién tiene la entrada al panel bloqueada por intentos y desbloquearla,
**para** que una compañera vuelva a entrar el mismo día cuando alguien agotó sus intentos a propósito o por error, sin pedir un cambio en la base de datos.

## Criterios de aceptación

### Happy path — desbloqueo a una compañera bloqueada

**Dado** que entré al panel como administradora de inventario y `eida.tinjaca@trycore.com` tiene la entrada bloqueada por intentos fallidos hasta mañana a las 9:40 a. m.,
**cuando** la desbloqueo desde la lista de acceso,
**Entonces** la lista deja de mostrarla como bloqueada
**Y** al pedir entrar con ese correo le llega un código de un uso
**Y** el desbloqueo queda en el registro de auditoría con quién lo hizo y cuándo

### Happy path — la lista dice quién está bloqueado y hasta cuándo

**Dado** que entré al panel como administradora de inventario y un correo inscrito agotó sus pedidos de código del día,
**cuando** abro la lista de acceso,
**Entonces** ese correo aparece marcado como bloqueado con la hora hasta la que dura el bloqueo y el motivo (intentos fallidos o pedidos de código)
**Y** los demás correos no muestran ninguna marca

### Error — la observadora no puede desbloquear

**Dado** que entré al panel con el rol observador,
**cuando** intento desbloquear a una persona bloqueada,
**Entonces** el panel no lo hace y me explica que mi rol es de consulta
**Y** el bloqueo sigue igual
**Y** el intento queda registrado como acceso rechazado

### Edge case — el bloqueo vuelve si siguen los intentos

**Dado** que desbloqueé a una compañera,
**cuando** alguien vuelve a agotar los intentos con su correo,
**Entonces** el panel la bloquea otra vez con las mismas reglas
**Y** el nuevo bloqueo aparece en la lista de acceso

## Notas

**Origen:** Release Gate R0 (2026-10-02), hallazgo MEDIO-2 de seguridad. Quien conoce el correo de una administradora puede pedir códigos o fallarlos hasta bloquear su entrada 24 horas (ADR-0002 §2, tres capas), y hoy solo se desbloquea tocando la base de datos. El permiso `accesos.desbloquear` ya está declarado en la matriz de roles sin ninguna ruta que lo use. **Decisión del sponsor (D51.2): se construye.**

**Fuera de alcance:** cambiar las reglas de bloqueo (cinco fallos en 15 minutos, veinte al día, bloqueo de 24 horas) o contarlas por IP; eso es una decisión de ADR-0002.

## Revisión INVEST

| Letra | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ se apoya en HU-123 (bloqueo) y HU-151 (lista de acceso), ya construidas |
| N | Negociable | ✓ el cómo (botón en la fila, hoja de confirmación) se ajusta al prototipo de `admin-accesos` |
| V | Valiosa | ✓ evita que una persona del equipo quede fuera del panel un día entero por un ataque o un error |
| E | Estimable | ✓ S: una acción de la matriz, una ruta, una marca en la lista y su auditoría |
| S | Pequeña | ✓ cabe en un slice de menos de un día |
| T | Testeable | ✓ cuatro escenarios con resultado observable en la lista, el correo y la auditoría |
