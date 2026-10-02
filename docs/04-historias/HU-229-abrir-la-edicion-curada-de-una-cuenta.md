---
id: HU-229
titulo: "Abrir la edición curada de una cuenta"
epica: EP-011
prioridad: alta
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: []
---

# HU-229 — Abrir la edición curada de una cuenta

> **Decisión de negocio 2026-09-27 (sponsor):** el boletín se confecciona y envía desde Gmail o HubSpot; el portal entrega la selección curada, el enlace de cada destinatario y el bloque de contenido para copiar (PRD v4.14, RF-18).

**Como** integrante de Mercadeo que prepara la distribución del mes,
**quiero** abrir en el destino Envíos del panel la edición de una cuenta con su proyecto, su ejecutivo, su dueño nominal y sus destinatarios,
**para** que cada propuesta tenga contexto y responsable antes de elegir un solo perfil.

## Criterios de aceptación

### Happy path — abro la edición de una cuenta

**Dado** que entré al panel con escritura en Envíos (rol de administración de inventario, o el permiso «Envíos» de HU-233) y Bancolombia no tiene ninguna edición sin enviar,
**cuando** creo la edición de Bancolombia, con su referencia de HubSpot, el proyecto «Migración de pagos inmediatos», el ejecutivo `andres.villa@trycore.com` y los destinatarios `juliana.restrepo@bancolombia.com.co` y `mauricio.cardenas@bancolombia.com.co`,
**Entonces** la edición aparece en Envíos, bajo octubre de 2026, en estado «borrador», con esos datos y conmigo como dueña nominal
**Y** el alta queda en el registro de auditoría con quién la hizo y cuándo

### Error — el ejecutivo no es de Trycore

**Dado** que estoy creando la edición de Bancolombia con todos sus datos,
**cuando** la guardo con el ejecutivo `andres.villa@gmail.com`,
**Entonces** el panel no la guarda y me explica que el ejecutivo debe tener un correo `@trycore.com`, porque a él le llegan los avisos internos de la cuenta
**Y** conserva lo que escribí

### Edge case — el mismo destinatario escrito dos veces

**Dado** que estoy creando la edición de Bancolombia y ya añadí `Mauricio.Cardenas@Bancolombia.com.co` como destinatario,
**cuando** añado `mauricio.cardenas@bancolombia.com.co`,
**Entonces** la edición queda con un solo destinatario para ese correo
**Y** el panel me indica que ese correo ya estaba en la lista

### Edge case — preparo la siguiente desde la anterior

**Dado** que la edición de octubre de Bancolombia está enviada, con su proyecto, su ejecutivo, su dueña y tres destinatarios, uno de ellos excluido de la distribución,
**cuando** toco «Preparar la siguiente edición»,
**Entonces** se crea una edición nueva de Bancolombia en «borrador» con la misma cuenta, proyecto, ejecutivo, dueña y destinatarios, y el excluido sigue excluido
**Y** la selección, la razón y los enlaces no se copian

### Error — ya hay una edición sin enviar

**Dado** que Bancolombia tiene una edición en «borrador»,
**cuando** intento crear otra edición de Bancolombia,
**Entonces** el panel no crea una segunda y me lleva a la que ya existe

## Notas

**Nace el 2026-10-02 en la discovery de EP-011.** HU-113 y HU-114 daban por hecho que la edición ya tenía cuenta, proyecto y destinatarios, y ninguna historia decía quién los pone ni dónde: es el «Envíos» del menú del panel (destino reservado y deshabilitado desde EP-001) y el modelo `ediciones_curadas` / `edicion_destinatarios` de ADR-0009 (UC-16: cuenta, dueño nominal, razón, selección, estado `borrador | lista | enviada`, cadencia). Cubre la parte de **RF-18.1** (cada envío es por cuenta) y **RF-18.5** (dueño nominal) que no es la selección.

**Elegidas por el modelo por delegación del sponsor (2026-10-02):**
- **Cuenta, proyecto, ejecutivo y destinatarios se escriben en el panel, sin leer HubSpot**, igual que el enlace curado de HU-122 (decisión del sponsor del 2026-09-28: *la cuenta se escribe por su nombre y los correos invitados a mano*). ADR-0009 no da al panel lectura de HubSpot (la única excepción es D75, en el worker). El prototipo `selecciones-curadas` dibuja el proyecto «HubSpot · 22 sep» y «Asócialo a Bancolombia en HubSpot»: se corrige en la pasada de copy. Leer HubSpot sería alcance nuevo y lo decide el sponsor.
- **Una edición sin enviar por cuenta a la vez.** Evita dos propuestas en paralelo a la misma cuenta. La edición se rotula con el mes en que se abre.
- **El ejecutivo es un correo `@trycore.com`**, porque recibe el aviso de HU-117.

**Destinatarios = correos invitados** (RF-1.2.7, acceso nominal D-4): al generar los enlaces (HU-114) cada destinatario queda como invitado del enlace de la edición, con su propio token.

**Quién escribe.** El administrador de inventario (RF-8.1.2: genera enlaces) y quien tenga el permiso «Envíos» (HU-233). El observador sin permiso consulta Envíos sin controles de escritura.

## Trazabilidad

Épica madre: **EP-011** · PRD v4.18 · RF-18.1 · RF-18.5 · RF-1.2.7 · RF-8.1.2 · ADR-0009 (UC-16, `ediciones_curadas`) · decisión del sponsor 2026-09-28 (HU-122, sin lectura de HubSpot) · prototipo `selecciones-curadas` · relacionada con HU-233 (permiso «Envíos», draft) · base de HU-113, HU-114, HU-230, HU-231 y HU-232

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ la administración de inventario ya escribe en el panel (EP-001/EP-006); el permiso de HU-233 (en `draft`, pendiente de enmienda de RF-8.1.2) solo amplía quién puede, sin bloquear esta historia |
| N | Negociable | ✓ fija los datos mínimos de la edición, el dueño nominal, el ejecutivo de Trycore, una edición sin enviar por cuenta y la copia de la anterior; la disposición es negociable |
| V | Valiosa | ✓ sin cuenta, proyecto y responsable no hay curaduría posible (spec §2) ni a quién avisar |
| E | Estimable | ✓ S: dos tablas ya diseñadas en ADR-0009, un formulario con dos validaciones y la copia desde la anterior |
| S | Pequeña | ✓ S: una capacidad (abrir la edición) en cinco escenarios |
| T | Testeable | ✓ una cuenta sin edición, un ejecutivo con dominio externo, un correo repetido con otras mayúsculas, una edición enviada con un excluido y una edición en borrador dan altas, rechazos y copias observables |
