---
id: HU-115
titulo: "Copiar el contenido curado para enviarlo desde Gmail o HubSpot"
epica: EP-011
prioridad: alta
complejidad: M
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-114]
---

# HU-115 — Copiar el contenido curado para enviarlo desde Gmail o HubSpot

> **Decisión de negocio 2026-09-27 (sponsor):** el boletín se confecciona y envía desde Gmail o HubSpot; el portal entrega la selección curada, el enlace de cada destinatario y el bloque de contenido para copiar (PRD v4.14, RF-18).

**Como** integrante de Mercadeo que envía la edición curada,
**quiero** recibir del panel el contenido curado de cada destinatario listo para pegar en Gmail o para combinar en HubSpot,
**para** enviar con la herramienta que ya uso sin reescribir la selección ni equivocarme de enlace.

## Criterios de aceptación

### Happy path — el texto para Gmail de un destinatario

**Dado** que acabo de generar los enlaces y el contenido de la edición de Bancolombia, con el proyecto «Migración de pagos inmediatos», su razón y PS-0098, PS-0142 y PS-0088,
**cuando** copio el texto para Gmail de Juliana Restrepo,
**Entonces** el texto copiado, con formato, lleva un asunto sugerido referido al proyecto, una apertura con su nombre, el proyecto y la razón, y por cada perfil su rol, nombre y primer apellido, código, disponibilidad a la fecha de hoy, tecnologías y lo verificado por Trycore separado de lo declarado
**Y** lleva un solo enlace: el de Juliana

### Edge case — la tabla para combinar en HubSpot

**Dado** que acabo de generar los enlaces y el contenido de la edición de Bancolombia para Juliana y Mauricio, y Natalia está excluida,
**cuando** copio la tabla para HubSpot,
**Entonces** la tabla tiene una fila por destinatario con enlace —correo, nombre y su enlace—, sin Natalia
**Y** el bloque común para HubSpot lleva el asunto, la razón y los perfiles sin ningún enlace personal, porque el enlace lo pone la combinación

### Error — el inventario cambió después de generar el bloque

**Dado** que generé el contenido de Bancolombia a las 10:42 y a las 11:05 PS-0142 pasó a colocado,
**cuando** intento copiar el bloque de Mauricio,
**Entonces** el bloque aparece «desactualizado: PS-0142 cambió a colocado» y no se copia
**Y** el panel me ofrece regenerar enlaces y contenido contra el inventario de ese momento, avisando que los enlaces sin enviar de esta edición se reemplazan

### Edge case — nada de la lista negra ni tarifas

**Dado** que PS-0098 tiene en el inventario tarifa, foto, teléfono, correo personal y CV cargados,
**cuando** copio el texto para Gmail de Juliana Restrepo,
**Entonces** lo copiado no contiene la tarifa, la foto, los datos de contacto, el CV ni ningún otro dato de la lista negra B.4
**Y** la tabla y el bloque común para HubSpot de la misma edición tampoco los contienen, porque salen de la misma proyección publicable

### Edge case — después de la salida, el contenido es historia

**Dado** que la edición de Bancolombia está «enviada» (HU-230) y después PS-0142 se colocó,
**cuando** abro su contenido,
**Entonces** veo «Así salió» con los bloques tal como se generaron, sin los enlaces en claro
**Y** el contenido no se marca desactualizado, porque cada enlace reevalúa el estado de sus perfiles al abrirse (RF-19.2)

## Notas

Cubre **RF-18.7** (bloque listo para copiar: asunto, razón, perfiles sin tarifas y un solo enlace; texto con formato para Gmail y tabla destinatario–enlace para HubSpot) y **RF-18.4** (bloque desactualizado si un perfil cambia). **Sustituye a «Programar y enviar el boletín»** (PRD v4.0): redactar el correo, programarlo, enviarlo y gestionar las bajas pasan a Gmail o HubSpot por decisión del sponsor del 2026-09-27; no es un recorte de alcance. El portal no envía el boletín ni lo pasa por Mailgun. El pie con el contacto del ejecutivo y la salida para dejar de recibir los pone la herramienta de envío (RF-18.7).

**Partición 2026-10-02 (discovery de EP-011; validador: fallaba la S).** La versión anterior juntaba tres capacidades: copiar el contenido, registrar la salida con su cadencia y excluir contactos. Salen enteras a **HU-230** (registrar la salida), **HU-231** (vigilar la cadencia) y **HU-232** (excluir un contacto), todas en EP-011. El error «selección sin razón» pasa a HU-113 y HU-114, donde se impide. **Partición, no recorte.**

**Elegidas por el modelo por delegación del sponsor (2026-10-02):**
- **Tabla para HubSpot** = filas «correo, nombre, enlace», para importar el enlace como propiedad del contacto y combinarlo; el nombre de la propiedad y del token de personalización los define Mercadeo en HubSpot.
- **Regenerar un bloque desactualizado regenera también los enlaces sin enviar** de la edición: el bloque lleva el enlace y el enlace solo se ve al generarse (HU-114). Antes de registrar la salida no hay enlaces enviados que romper.

**Construido en servidor** desde la proyección publicable (ADR-0009, UC-16): sin tarifas (D-9), sin foto ni lista negra B.4; guarda la instantánea de estado y disponibilidad de cada perfil para detectar el cambio.

## Trazabilidad

Épica madre: **EP-011** · PRD v4.18 · RF-18.4 · RF-18.7 · RF-19.2 · D-9 · Anexo B.4 · ADR-0009 (UC-16) · spec `docs/10-specs/correo-curado.md` (§3, §4) · prototipo `enlaces-y-contenido`, `--desactualizado`, `--salida-registrada`, `correo-boletin-curado`, `--hubspot` · depende de HU-114 · partida con HU-230, HU-231 y HU-232

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: se genera junto con los enlaces de HU-114; no depende de la salida (HU-230) salvo para el último escenario, que se prueba con una edición sembrada como enviada |
| N | Negociable | ✓ fija el contenido del bloque, un solo enlace, los dos formatos, la regla de desactualizado y la lista negra; el diseño del bloque y su redacción son negociables |
| V | Valiosa | ✓ quien envía no reescribe la selección ni pega enlaces equivocados, y el cliente no recibe perfiles que ya no están |
| E | Estimable | ✓ M: plantilla de bloque en servidor desde la proyección publicable, dos formatos de copia, instantánea y comparación de estado |
| S | Pequeña | ✓ M: una capacidad (copiar el contenido) en cinco escenarios, tras sacar la salida, la cadencia y la exclusión |
| T | Testeable | ✓ una edición con enlaces recién generados, un excluido, un perfil que cambia tras generar, un perfil con datos de la lista negra y una edición enviada dan textos, tablas y marcas observables |
