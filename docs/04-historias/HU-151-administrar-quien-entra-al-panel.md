---
id: HU-151
titulo: "Administrar quién entra al panel y con qué rol"
epica: EP-006
prioridad: alta
complejidad: M
estado: lista
fase: panel-crud
prd_version: 4.15
depende_de: [HU-123]
---

# HU-151 — Administrar quién entra al panel y con qué rol

**Como** administradora de inventario de Talento Humano,
**quiero** inscribir, cambiar de rol y dar de baja desde el panel los correos @trycore.com que pueden entrar,
**para** dar o quitar acceso a una persona del equipo el mismo día, sin pedir un cambio en la configuración del servidor.

## Criterios de aceptación

### Happy path — inscribo un correo con su rol

**Dado** que entré al panel como administradora de inventario y el correo `analista.mercadeo@trycore.com` no está inscrito,
**cuando** lo inscribo con el rol observador,
**Entonces** el correo aparece en la lista de acceso con el rol observador
**Y** al pedir entrar al panel con ese correo le llega un código de un uso
**Y** el alta queda en el registro de auditoría con quién la hizo y cuándo

### Happy path — paso a observador a otra administradora

**Dado** que entré al panel como administradora de inventario y otra administradora activa tiene una sesión abierta,
**cuando** le cambio el rol a observador,
**Entonces** la lista de acceso muestra el correo con su nuevo rol
**Y** en su siguiente petición al panel su sesión se corta y tiene que volver a entrar
**Y** el cambio queda en el registro de auditoría con quién lo hizo, cuándo, el rol anterior y el nuevo

### Happy path — doy de baja un correo inscrito

**Dado** que entré al panel como administradora de inventario y hay un correo inscrito que ya no debe entrar y tiene una sesión abierta,
**cuando** lo doy de baja,
**Entonces** el correo deja de aparecer entre los inscritos activos
**Y** en su siguiente petición al panel su sesión se corta
**Y** al pedir entrar con ese correo ya no le llega código y el panel responde igual que a un correo no inscrito
**Y** la baja queda en el registro de auditoría con quién la hizo y cuándo

### Error — correo que no es @trycore.com

**Dado** que entré al panel como administradora de inventario,
**cuando** intento inscribir el correo `eida.tinjaca@gmail.com`,
**Entonces** el panel no lo inscribe y me dice que solo admite correos `@trycore.com`
**Y** la lista de acceso queda igual

### Edge case — el panel nunca se queda sin administrador

**Dado** que soy la única administradora de inventario activa de la lista,
**cuando** intento cambiarme el rol a observador,
**Entonces** el panel lo impide y me explica que el panel no puede quedarse sin ningún administrador activo
**Y** sigo inscrita con el rol de administradora de inventario

## Notas

**Última administradora (revalidación 2026-09-30):** la misma guarda bloquea la baja: si siendo la única administradora activa intento darme de baja, el panel aplica el mismo bloqueo y el mismo mensaje. No se repite como escenario aparte para no pasar de cinco.

Cubre **RF-8.1.5** (lista nominal de acceso mantenida desde el panel) y **RF-8.1.2** (dos roles: administrador de inventario y observador). El «quién» de la auditoría es el correo verificado con el código (RF-8.1.3).

**Nace el 2026-09-30 por D13** (sponsor, tras el DoR de EP-006; bloqueo B4: RF-8.1.5 no tenía historia). HU-123 (construida en EP-001) siembra el primer administrador en la configuración del servidor y aplica la lista al entrar; esta historia da a los administradores la forma de mantenerla desde el panel.

**Quien no es administrador no puede.** Solo el rol administrador de inventario inscribe, cambia de rol o da de baja (RF-8.1.2: el observador no escribe nada). Un observador no ve los controles de la lista de acceso y, si envía el cambio por una dirección directa, el panel lo rechaza y deja el intento en la auditoría: es el mismo comportamiento que HU-124 fija para toda acción de escritura del panel (escenario «intento de escritura por ruta directa»), y esta acción se registra en esa misma matriz rol × acción. No se repite aquí como escenario para no pasar de cinco.

**No revela quién está en la lista.** A un correo dado de baja se le responde igual que a uno nunca inscrito —«si tu correo tiene acceso, te llegó un código»— (RF-8.1.5).

**Revisión DoR 2026-09-30: aplicada D17** (sponsor, mismo día). Dar de baja o bajar a observador **corta la sesión en la siguiente petición**: no se espera a que caduque la jornada (RF-8.1.6). El escenario de cambio de rol pasa a ser el de administradora → observador, que es el que corta la sesión; el paso de observador a administrador es el mismo cambio en sentido contrario y queda igual de auditado. La regla del observador se mantiene en esta nota, apoyada en HU-124 (opción (a) del sponsor).

## Trazabilidad

> OpenSpec change: administracion-del-inventario

Épica madre: **EP-006** · PRD v4.15 · RF-8.1.5 · RF-8.1.2 · RF-8.1.3 · D-22 · D13 y D17 (sponsor, 2026-09-30) · depende de HU-123 (construida en EP-001) · relacionada con HU-124 y HU-138

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: se apoya en la lista de acceso y la matriz rol × acción que HU-123 ya dejó construidas en EP-001; no bloquea a ninguna otra historia de la épica |
| N | Negociable | ✓ fija las reglas (solo @trycore.com, dos roles, todo auditado, nunca sin administrador, respuesta que no revela la lista); la pantalla de la lista y el texto de los mensajes son negociables |
| V | Valiosa | ✓ Talento Humano da o quita acceso el mismo día, sin depender de quien administra el servidor; la regla del último administrador evita dejar el panel sin nadie que lo gobierne |
| E | Estimable | ✓ M: alta, cambio de rol y baja sobre la lista que ya existe, con validación de dominio, guarda del último administrador, corte de la sesión en la siguiente petición (D17) y evento de auditoría por cada acción |
| S | Pequeña | ✓ M: una capacidad (mantener la lista de acceso) en cinco escenarios |
| T | Testeable | ✓ cada escenario deja un estado observable: la lista, la sesión cortada en la siguiente petición, la llegada o no del código al pedir entrar, el rechazo del correo externo, la guarda del último administrador y la auditoría |
