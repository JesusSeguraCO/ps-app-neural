---
id: HU-128
titulo: "Ser bloqueada si intento publicar sin consentimiento"
epica: EP-006
prioridad: alta
complejidad: S
estado: lista
fase: panel-crud
prd_version: 4.8
depende_de: [HU-127, HU-086]
---

# HU-128 — Ser bloqueada si intento publicar sin consentimiento

**Como** administradora de inventario de Talento Humano,
**quiero** que el panel me impida publicar un perfil sin consentimiento registrado,
**para** que un descuido mío no ponga el nombre de un profesional frente a un cliente sin su autorización.

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

### Edge case — publicación masiva

**Dado** que seleccioné varios perfiles para publicar a la vez y alguno no tiene consentimiento registrado,
**cuando** confirmo la publicación masiva,
**Entonces** se publican los que sí lo tienen
**Y** los demás quedan señalados con su motivo, sin abortar la operación completa

## Notas

Cubre **RF-8.4** desde el lado del bloqueo y **RF-8.15.7** desde el lado de la importación.

**Por qué es historia aparte de HU-127.** Registrar el consentimiento es un acto administrativo; el bloqueo es una garantía del sistema. Separarlas permite verificar la garantía sin depender de cómo se recoja el consentimiento, y deja el bloqueo como criterio de aceptación propio — que es lo que se va a auditar.

**El bloqueo es de los que RF-8.16.1 deja fuera de los catálogos paramétricos**: no es administrable, es lógica de producto.

**Revisión INVEST 2026-09-30:** se reconcilió la tabla INVEST con los AC: la dependencia de HU-127 existe solo para el destino de «ir a registrarlo» y para tener perfiles con consentimiento en el caso masivo, y el escenario de importación necesita el importador de HU-086; ambas quedan en `depende_de`. En el edge, la condición pasa al Dado y el Cuando queda en una sola acción («confirmo la publicación masiva»).

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · RF-8.4 · RF-8.15.7 · depende de HU-127 (registro del consentimiento) y HU-086 (importación)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: el bloqueo se verifica solo con un perfil sin consentimiento; HU-127 aporta el destino de «ir a registrarlo» y los perfiles con consentimiento del caso masivo, y HU-086 el importador del escenario de error |
| N | Negociable | ✓ la garantía es fija (RF-8.4); el texto del motivo y cómo se presenta el resultado del lote son negociables |
| V | Valiosa | ✓ es la garantía que protege al profesional y a Trycore |
| E | Estimable | ✓ una guarda en la transición a *publicado* de la máquina de estados del dominio (ADR-0003, única vía de escritura), reutilizada por la publicación individual, la masiva y la importación |
| S | Pequeña | ✓ S: una regla aplicada en tres puntos de entrada que ya existen o existirán en la épica |
| T | Testeable | ✓ cada escenario deja un estado observable: perfil en borrador, consentimiento sin conceder, lote con resultado por perfil |
