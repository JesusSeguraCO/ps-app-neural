---
id: HU-147
titulo: "Configurar el contacto de Trycore que ve el cliente"
epica: EP-006
prioridad: media
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.14
depende_de: [HU-123]
---

# HU-147 — Configurar el contacto de Trycore que ve el cliente

**Como** administradora de inventario de Talento Humano,
**quiero** definir desde el panel a quién escribe el cliente cuando tiene dudas (nombre, cargo y correo),
**para** que el portal nombre siempre a la persona o al buzón correcto sin esperar un cambio de código cuando cambia quien atiende.

## Criterios de aceptación

### Happy path — cambio el contacto y el portal lo muestra

**Dado** que entré al panel con mi correo inscrito como administradora de inventario
**Y** que el contacto vigente es el buzón `people.service@trycore.com` sin nombre
**Cuando** guardo como contacto a «Eida Tinjacá», cargo «Coordinación de Servicio», correo `eida.tinjaca@trycore.com`
**Entonces** las pantallas del portal que ofrecen a quién escribir (aviso de invitación rechazada, enlace vencido, enlace revocado, intentos agotados y «si no te llega el código» de la puerta de acceso) muestran «Eida Tinjacá, Coordinación de Servicio: eida.tinjaca@trycore.com» en su siguiente carga
**Y** queda un registro en la auditoría del panel con quién cambió el contacto, cuándo, y el valor anterior y el nuevo

### Error — correo que no es de Trycore

**Dado** que entré al panel con mi correo inscrito como administradora de inventario
**Cuando** intento guardar como correo de contacto `eida.tinjaca@gmail.com`
**Entonces** el panel no lo guarda y me dice que el correo de contacto debe ser `@trycore.com`
**Y** el portal sigue mostrando el contacto anterior

### Error — quien observa no puede cambiarlo

**Dado** que entré al panel con mi correo inscrito como observadora
**Cuando** abro la configuración del contacto
**Entonces** veo el contacto vigente sin poder editarlo
**Y** si se intenta guardar un cambio con mi sesión, el panel lo rechaza y no queda cambio en la auditoría

### Edge case — nunca se configuró o se deja solo el buzón

**Dado** que nadie ha guardado un contacto en el panel, o que se guardó solo un correo sin nombre ni cargo
**Cuando** una persona invitada abre en el portal una pantalla que ofrece a quién escribir
**Entonces** ve «escribe a People Service: » seguido del correo vigente (`people.service@trycore.com` si nunca se configuró)
**Y** nunca ve un nombre vacío, un cargo suelto ni un error

## Notas

**Nace el 2026-09-30 por decisión del sponsor** en la revisión de fidelidad de EP-001: el prototipo `invitar-colega--rechazada` nombra a Eida Tinjacá y la app muestra el buzón genérico; el sponsor pide que el contacto sea **paramétrico desde el panel de administración, no un dato fijo en el código**. Hasta que se construya, EP-001 usa `people.service@trycore.com` como valor fijo (desviación temporal registrada en el `design.md` del change `acceso-y-aterrizaje-curado`).

**Un solo contacto para todo el portal**, no uno por enlace ni por cuenta: es lo que el prototipo y las pantallas de EP-001 piden. Un contacto por cuenta (p. ej. el ejecutivo comercial) sería otra historia y dependería del enlace con HubSpot (EP-007).

**Correo `@trycore.com` obligatorio** para que un error de digitación no mande a los clientes a un buzón externo. El nombre y el correo del contacto son datos personales de una persona empleada (Ley 1581): se muestran a clientes invitados por decisión explícita de quien los configura.

**Superficie:** la sección «Administración» del panel (hoy solo el pie con la sesión); el menú del panel ya reserva ese destino.

**Preguntas abiertas** (no bloquean los criterios):
- ¿Los correos que envía el sistema a clientes (código de acceso, enlace renovado) también firman con este contacto? Hoy firman «People Service · Trycore».

## Trazabilidad

Épica madre: **EP-006** · PRD v4.14 · RF-1.4 (pantalla de renovación «con contacto») · HU-095 y HU-145 («el contacto de Trycore a quien consultar») · RF-8.1.2 (roles: solo el administrador de inventario escribe) · RF-8.9 (auditoría) · depende de HU-123 (login del panel)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: solo necesita el login y los roles del panel (HU-123); las pantallas del portal ya existen con el valor fijo y se cambian a leerlo |
| N | Negociable | ✓ fija qué se configura (nombre, cargo, correo) y dónde se ve; la ubicación exacta en el panel y los textos son negociables |
| V | Valiosa | ✓ quien atiende a los clientes cambia sin pasar por un despliegue, y el cliente ve a una persona concreta si Talento Humano lo decide |
| E | Estimable | ✓ un registro de configuración, una pantalla, auditoría y roles que ya existen, y cinco pantallas del portal que ya muestran el contacto |
| S | Pequeña | ✓ S: un dato, un formulario, una validación y su lectura en el portal |
| T | Testeable | ✓ cada escenario deja un resultado observable en el portal, en el panel o en la auditoría |
