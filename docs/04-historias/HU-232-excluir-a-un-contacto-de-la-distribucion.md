---
id: HU-232
titulo: "Excluir a un contacto de la distribución"
epica: EP-011
prioridad: media
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-229]
---

# HU-232 — Excluir a un contacto de la distribución

> **Decisión de negocio 2026-09-27 (sponsor):** el boletín se confecciona y envía desde Gmail o HubSpot; el portal entrega la selección curada, el enlace de cada destinatario y el bloque de contenido para copiar (PRD v4.14, RF-18).

**Como** integrante de Mercadeo que arma las ediciones curadas,
**quiero** marcar a un contacto como excluido de la distribución, con su motivo, y que el panel no le vuelva a preparar enlace ni bloque,
**para** respetar a quien pidió no recibir más sin depender de acordarme en cada edición.

## Criterios de aceptación

### Happy path — excluyo a un contacto

**Dado** que Natalia Gómez es destinataria de la edición de Bancolombia, que aún no tiene enlaces generados, y pidió no recibir más correos,
**cuando** la marco como excluida con el motivo «Pidió no recibir más correos»,
**Entonces** Natalia aparece «Excluida: pidió no recibir más correos» en la lista de excluidos de la edición
**Y** al generar enlaces y contenido no se le genera ni enlace ni bloque
**Y** la marca queda en auditoría con quién la puso, cuándo y el motivo

### Error — excluir sin motivo

**Dado** que Natalia Gómez es destinataria de la edición de Bancolombia,
**cuando** intento marcarla como excluida sin motivo,
**Entonces** el panel no guarda la exclusión y me pide el motivo
**Y** Natalia sigue como destinataria

### Edge case — la exclusión sigue en las ediciones siguientes

**Dado** que `natalia.gomez@bancolombia.com.co` está excluida desde la edición de octubre,
**cuando** añado `Natalia.Gomez@Bancolombia.com.co` como destinataria de una edición nueva,
**Entonces** aparece ya marcada como excluida, con el motivo y la fecha de la marca
**Y** no se le genera enlace ni bloque hasta que alguien retire la marca

### Edge case — retiro la marca

**Dado** que Natalia Gómez está excluida y volvió a pedir recibir las ediciones,
**cuando** retiro su marca indicando el motivo,
**Entonces** vuelve a ser destinataria y recibe enlace y bloque en la siguiente generación
**Y** la retirada queda en auditoría con quién la hizo, cuándo y el motivo

### Edge case — excluyo a quien ya tiene enlace

**Dado** que Natalia Gómez ya tiene enlace generado en la edición de Bancolombia,
**cuando** la marco como excluida con su motivo,
**Entonces** su enlace ya generado sigue abriendo y el panel me lo dice, porque la exclusión es de la distribución y no del acceso
**Y** desde ese momento no se le genera ningún enlace ni bloque nuevo

## Notas

Cubre **RF-18.8**: *el panel no gestiona bajas: la fuente es la herramienta de envío. Quien arma la edición puede marcar a un contacto como excluido de la distribución, con motivo; a un excluido no se le genera enlace ni bloque en ediciones siguientes, hasta que alguien retire la marca.* Modelo de ADR-0009 (UC-16): `edicion_destinatarios.excluido` con motivo.

**Nace el 2026-10-02 por partición de HU-115** (validador: fallaba la S). **No es recorte**: la exclusión era el último edge de HU-115.

**Elegidas por el modelo por delegación del sponsor (2026-10-02):**
- **La exclusión es por correo**, no por edición: sigue a la persona en todas las ediciones (con la misma normalización de mayúsculas que los invitados, HU-122) hasta que se retire.
- **No revoca un enlace ya generado.** La exclusión es de la distribución (no recibir más correos), no un corte de acceso; revocar el acceso es otra acción (RF-1.4). El panel lo dice para que quien distribuye no crea que el enlace dejó de abrir.
- **Retirar la marca pide motivo**, como ponerla: el rastro debe explicar las dos decisiones.

**Las bajas del boletín no las gestiona el portal** (RF-18.8, decisión del sponsor del 2026-09-27): la fuente es Gmail o HubSpot. Esta marca es la herramienta del panel para no preparar enlace ni bloque a quien ya se dio de baja allí.

## Trazabilidad

Épica madre: **EP-011** · PRD v4.18 · RF-18.8 · RF-1.4 · ADR-0009 (UC-16) · spec `docs/10-specs/correo-curado.md` (§6) · prototipo `enlaces-y-contenido--excluidos` · depende de HU-229 · partida de HU-115 · la respetan HU-114 y HU-115

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: marca destinatarios de la edición de HU-229; la generación de HU-114 la respeta sin esperar a esta historia |
| N | Negociable | ✓ fija motivo obligatorio, persistencia por correo, retiro con motivo y que no corta el acceso; la presentación es negociable |
| V | Valiosa | ✓ respeta a quien pidió no recibir más y protege la reputación del canal, sin depender de la memoria de quien distribuye |
| E | Estimable | ✓ S: una marca con motivo por correo, su lectura al generar y su retiro, con auditoría |
| S | Pequeña | ✓ S: una capacidad (excluir y retirar la exclusión) en cinco escenarios |
| T | Testeable | ✓ una destinataria excluida antes y después de generar, sin motivo, en una edición nueva escrita con otras mayúsculas y con la marca retirada dan listas, enlaces y auditoría observables |
