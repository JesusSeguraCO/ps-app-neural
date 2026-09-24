---
id: HU-087
titulo: "Deshacer una importación que salió mal"
epica: EP-006
prioridad: media
complejidad: M
estado: prototipado
fase: fase-2-rediseno
prd_version: 3.5
spec: docs/10-specs/importacion-masiva.md
---

# HU-087 — Deshacer una importación que salió mal

**Como** administradora del banco de talento,
**quiero** revertir por completo la última importación,
**para** que un archivo equivocado no me obligue a reconstruir decenas de perfiles a mano.

## Criterios de aceptación

### Happy path — revertir la última importación

**Dado** que acabo de importar y el resultado no es el que esperaba,
**cuando** uso la opción de deshacer,
**Entonces** cada perfil actualizado vuelve exactamente al estado que tenía antes
**Y** los perfiles que la importación creó quedan **archivados**, no borrados
**Y** el historial registra la reversión como un evento propio

### Error — intentar revertir una importación que ya no es la última

**Dado** que hubo otra importación después de la que quiero deshacer,
**cuando** intento revertir la anterior,
**Entonces** el sistema me explica que solo se revierte la última
**Y** me muestra qué importaciones hay después

### Edge case — un perfil cambiado a mano después de la importación

**Dado** que edité manualmente un perfil que la importación había tocado,
**cuando** reverto la importación,
**Entonces** el sistema me advierte cuáles perfiles cambiaron después
**Y** me deja elegir si los incluyo en la reversión o los dejo como están

## Notas

**Por qué existe, si los CRM no lo hacen.** HubSpot y Salesforce permiten borrar lo que una importación creó, pero no deshacer lo que actualizó: con cientos de miles de registros es impracticable. Con un banco de decenas de perfiles curados a mano, volver atrás es barato y vale mucho.

**Es la contraparte del borrado masivo prohibido.** No se puede borrar en masa, pero una actualización masiva equivocada hace un daño equivalente, y sin reversión ese daño es permanente.

Cubre RF-8.15.8.

## Trazabilidad

Épica madre: **EP-006** · PRD v3.5 · Depende de HU-086

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-086 |
| N | Negociable | ✓ |
| V | Valiosa | ✓ es la red de seguridad de la funcionalidad más destructiva del panel |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
