---
id: HU-128
titulo: "Ser bloqueada si intento publicar sin consentimiento o sin modalidad de prueba"
epica: EP-006
prioridad: alta
complejidad: S
estado: lista
fase: panel-crud
prd_version: 4.15
depende_de: [HU-127, HU-086, HU-125]
---

# HU-128 — Ser bloqueada si intento publicar sin consentimiento o sin modalidad de prueba

**Como** administradora de inventario de Talento Humano,
**quiero** que el panel me impida publicar un perfil sin consentimiento registrado o sin modalidad de prueba elegida,
**para** que un descuido mío no ponga el nombre de un profesional frente a un cliente sin su autorización ni sin decir cómo se validó.

## Criterios de aceptación

### Happy path — el bloqueo actúa

**Dado** que un perfil no tiene consentimiento nominal registrado,
**cuando** intento publicarlo,
**Entonces** el panel lo impide y me dice exactamente qué falta
**Y** me ofrece ir a registrarlo

### Error — intento de saltarse el bloqueo por importación

**Dado** que un archivo de importación trae un campo de consentimiento,
**cuando** lo proceso,
**Entonces** el consentimiento no se concede y el perfil llega a borrador
**Y** el bloqueo se mantiene

### Error — perfil sin modalidad de prueba elegida

**Dado** que un perfil tiene consentimiento nominal registrado pero ninguna modalidad de prueba elegida del catálogo de su familia,
**cuando** intento publicarlo,
**Entonces** el panel lo impide y me dice que falta elegir la modalidad de prueba
**Y** me ofrece elegirla entre las modalidades de la familia de su rol

### Edge case — publicación masiva

**Dado** que seleccioné varios perfiles para publicar a la vez y alguno no tiene consentimiento registrado o modalidad de prueba elegida,
**cuando** confirmo la publicación masiva,
**Entonces** se publican los que sí lo tienen
**Y** los demás quedan señalados con su motivo, sin abortar la operación completa

## Notas

Cubre **RF-8.4** desde el lado del bloqueo, **RF-8.10** (enmienda v4.15, modalidad obligatoria para publicar) y **RF-8.15.7** desde el lado de la importación.

**Por qué es historia aparte de HU-127.** Registrar el consentimiento es un acto administrativo; el bloqueo es una garantía del sistema. Separarlas permite verificar la garantía sin depender de cómo se recoja el consentimiento, y deja el bloqueo como criterio de aceptación propio — que es lo que se va a auditar.

**Revisión DoR 2026-09-30: aplicada D10** (sponsor; CRN-14 y T-12 del backlog arquitectónico, R-39). La modalidad de prueba no se deriva del rol: se elige del catálogo cerrado de su familia (Anexo B.8.1) y es obligatoria para publicar, igual que el consentimiento. El rol solo filtra qué modalidades se ofrecen. Se añade el escenario de error «perfil sin modalidad de prueba elegida» y el lote masivo señala también ese motivo. La elección de la modalidad ocurre en el editor de HU-125, que entra en `depende_de`. Si la familia no tiene ninguna modalidad registrada, el caso es de HU-130 (RF-8.16.4).

**El bloqueo es de los que RF-8.16.1 deja fuera de los catálogos paramétricos**: no es administrable, es lógica de producto.

**Revisión INVEST 2026-09-30:** se reconcilió la tabla INVEST con los AC: la dependencia de HU-127 existe solo para el destino de «ir a registrarlo» y para tener perfiles con consentimiento en el caso masivo, y el escenario de importación necesita el importador de HU-086; ambas quedan en `depende_de`. En el edge, la condición pasa al Dado y el Cuando queda en una sola acción («confirmo la publicación masiva»).

## Trazabilidad

> OpenSpec change: administracion-del-inventario

Épica madre: **EP-006** · PRD v4.15 · RF-8.4 · RF-8.10 (D10) · RF-8.15.7 · Anexo B.8.1 · depende de HU-127 (registro del consentimiento), HU-086 (importación) y HU-125 (elección de la modalidad en el editor)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: el bloqueo se verifica solo con un perfil sin consentimiento o sin modalidad; HU-127 aporta el destino de «ir a registrarlo» y los perfiles con consentimiento del caso masivo, HU-086 el importador del escenario de error y HU-125 el selector de modalidad al que remite el nuevo error |
| N | Negociable | ✓ las garantías son fijas (RF-8.4; RF-8.10 enmendado por D10); el texto del motivo y cómo se presenta el resultado del lote son negociables |
| V | Valiosa | ✓ es la garantía que protege al profesional y a Trycore |
| E | Estimable | ✓ dos condiciones (consentimiento y modalidad elegida) en una misma guarda de la transición a *publicado* de la máquina de estados del dominio (ADR-0003, única vía de escritura), reutilizada por la publicación individual, la masiva y la importación |
| S | Pequeña | ✓ S: una guarda con dos condiciones aplicada en tres puntos de entrada, en cuatro escenarios |
| T | Testeable | ✓ cada escenario deja un estado observable: perfil en borrador con el motivo (consentimiento o modalidad), consentimiento sin conceder, lote con resultado y motivo por perfil |
