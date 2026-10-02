---
id: HU-113
titulo: "Armar la selección de perfiles de una cuenta"
epica: EP-011
prioridad: alta
complejidad: M
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-229]
---

# HU-113 — Armar la selección de perfiles de una cuenta

> **Decisión de negocio 2026-09-27 (sponsor):** el boletín se confecciona y envía desde Gmail o HubSpot; el portal entrega la selección curada, el enlace de cada destinatario y el bloque de contenido para copiar (PRD v4.14, RF-18).

**Como** integrante de Mercadeo que prepara la edición curada de una cuenta,
**quiero** elegir desde el panel los perfiles que le voy a proponer, viendo su disponibilidad real de ese momento, y escribir la razón referida a su proyecto,
**para** no proponer gente que ya no está disponible cuando el cliente abra el correo.

## Criterios de aceptación

### Happy path — elijo perfiles y razón contra el inventario del momento

**Dado** que la edición de Bancolombia está en «borrador» con el proyecto «Migración de pagos inmediatos» y dos destinatarios, y su selección me muestra solo los perfiles publicados, cada uno con la disponibilidad leída hoy a las 10:42,
**cuando** guardo la selección PS-0098, PS-0142 y PS-0088 con la razón «Andrés ya lideró una transición parecida en banca, Laura construyó la conciliación en Java para dos entidades y Camila automatiza pruebas de las API de pagos»,
**Entonces** la edición pasa a «lista» con esos tres perfiles, en ese orden, y esa razón
**Y** el cambio queda en el registro de auditoría con quién lo hizo y cuándo

### Error — un perfil que no está publicado

**Dado** que estoy en la selección de la edición de Bancolombia y PS-0113 está pausado,
**cuando** intento añadir PS-0113 por su código,
**Entonces** el panel no lo añade y me dice que PS-0113 está pausado y que solo se proponen perfiles publicados

### Error — la selección sin razón

**Dado** que elegí tres perfiles en la selección de la edición de Bancolombia y no escribí la razón,
**cuando** guardo la selección,
**Entonces** la edición sigue en «borrador»
**Y** el panel me explica que sin razón el cliente recibe un catálogo y no una curaduría

### Edge case — la cuenta no tiene proyecto conocido

**Dado** que la edición de Alpina no tiene proyecto,
**cuando** guardo su selección con perfiles y una razón,
**Entonces** la edición sigue en «borrador» y el panel me pide el proyecto de la cuenta o que marque de forma explícita «encuadre genérico»
**Y** el panel no propone ni completa ninguna razón por mí

### Edge case — un perfil ya propuesto sin reacción

**Dado** que PS-0142 se propuso a Bancolombia en la edición de septiembre, con salida registrada, y nadie de la cuenta entró por sus enlaces,
**cuando** añado PS-0142 a la selección de la nueva edición,
**Entonces** el panel me avisa «Se propuso en septiembre y nadie entró»
**Y** puedo mantenerlo o cambiarlo; el aviso no bloquea

## Notas

Cubre **RF-18.1** (selección construida para la cuenta, con razón declarada), **RF-18.3** (desde el panel, con la disponibilidad real) y el riesgo «la selección se repite entre envíos» de la spec (§8). **La selección se arma contra el inventario del momento**, no contra una hoja aparte que se degrada entre que se arma y que el cliente abre. «Sin reacción» se mide por entradas al portal (RF-18.6, HU-116), porque la apertura no la mide el portal.

**Refinamiento 2026-10-02 (discovery de EP-011).** Los Given describen estado y cada When es una acción. El error «un perfil seleccionado cambia antes de generar el contenido» pasa a **HU-114**, que es donde se genera; se añade el error sin razón (antes estaba en HU-115), coherente con RF-19.4 y HU-122. La edición y sus destinatarios son de **HU-229**.

**Disponibilidad «real» = la del panel de Talento Humano en ese momento** (bandas de RF-3.13 y estados del inventario de EP-006), con la hora de la lectura a la vista, como dibuja el prototipo («disponibilidad de hoy, 10:42»).

**Quién más la arma.** La administración de inventario (Talento Humano) puede escribir en Envíos con su rol (RF-8.1.2: genera enlaces); los criterios son los mismos.

**Encuadre genérico.** Es una marca explícita de quien arma la edición, con su razón escrita a mano; el panel nunca escribe la razón (no hay redacción por modelo en el panel: la razón es curaduría humana, spec §2).

## Trazabilidad

Épica madre: **EP-011** · PRD v4.18 · RF-18.1 · RF-18.3 · RF-18.6 · RF-19.4 · spec `docs/10-specs/correo-curado.md` (§2, §3, §8) · prototipo `selecciones-curadas`, `--perfil-repetido`, `--sin-proyecto` · depende de HU-229 · relacionada con HU-114 y HU-116

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: necesita la edición de HU-229; el inventario publicado ya existe (EP-006); el aviso de repetición usa entradas por edición que se siembran en prueba |
| N | Negociable | ✓ fija solo publicados, razón obligatoria, no inventar la razón y el aviso de repetición sin bloqueo; la forma del selector es negociable |
| V | Valiosa | ✓ evita proponer perfiles que ya no están y repetir lo que la cuenta ignoró, que es lo que destruye la credibilidad de la curaduría |
| E | Estimable | ✓ M: selector sobre el inventario publicado, guardado con razón y estado, la marca de encuadre genérico y una consulta de repetición contra la edición anterior |
| S | Pequeña | ✓ M: una capacidad (armar la selección) en cinco escenarios |
| T | Testeable | ✓ un inventario sembrado con publicados y un pausado, una edición sin proyecto y una edición anterior con salida y sin entradas dan estados, rechazos y avisos observables |
