---
id: HU-135
titulo: "Archivar un perfil sin perder su rastro"
epica: EP-006
prioridad: media
complejidad: S
estado: lista
fase: panel-crud
prd_version: 4.8
depende_de: [HU-122]
---

# HU-135 — Archivar un perfil sin perder su rastro

**Como** administradora de inventario de Talento Humano,
**quiero** que retirar un perfil del banco lo archive en vez de borrarlo,
**para** que una solicitud de hace tres meses siga explicándose con los perfiles que realmente se mostraron.

## Criterios de aceptación

### Happy path — archivar en lugar de borrar

**Dado** que un profesional salió del banco,
**cuando** uso la acción de eliminar,
**Entonces** el perfil pasa a estado *archivado* y no se borra
**Y** deja de mostrarse en el portal
**Y** sigue disponible para explicar solicitudes pasadas

### Error — archivar sin permiso de escritura

**Dado** que entré al panel con rol observador,
**cuando** intento archivar un perfil,
**Entonces** el panel no me lo permite
**Y** el perfil conserva su estado y no queda ningún cambio registrado

### Edge case — archivar un perfil ya archivado

**Dado** que un perfil ya está *archivado*,
**cuando** intento archivarlo de nuevo,
**Entonces** el panel me indica que ya está archivado
**Y** su fecha de archivo y su historial no cambian

### Edge case — perfil archivado que estaba en una selección curada

**Dado** que un perfil archivado forma parte de un enlace curado ya emitido,
**cuando** el cliente abre ese enlace,
**Entonces** el portal muestra su estado real —fuera del banco— y no lo omite en silencio
**Y** los demás perfiles de la selección se ven con normalidad

## Notas

Cubre **RF-8.3**. El último edge case se apoya en **RF-19.2** (reevaluación al abrir, HU-122). Los roles del panel son los de **D-22**.

**El borrado físico no existe a propósito.** El panel no ofrece ninguna acción de borrado definitivo: «eliminar» archiva (RF-8.3), y lo explica al usarse. Una solicitud enviada en julio tiene que poder explicarse en octubre con los perfiles que el cliente vio. Borrar un perfil destruye esa explicación y con ella la capacidad de responder cuando una cuenta dice «ustedes me mostraron a Fulano».

**Revisión INVEST 2026-09-30:** el escenario «no existe el borrado físico» no era ejecutable (el Cuando era buscar una acción ausente) y pasa a Notas; en su lugar entran un error real (el observador intenta archivar y el panel no lo deja) y un edge (archivar uno ya archivado no altera su historial). Se declara la dependencia de HU-122, ya construida, por el enlace curado.

## Trazabilidad

> OpenSpec change: administracion-del-inventario

Épica madre: **EP-006** · PRD v4.8 · RF-8.3 · RF-19.2 · D-22 · depende de HU-122 (enlace curado con reevaluación al abrir)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: el enlace curado y los roles del panel ya existen (HU-122 y HU-123, construidas); el archivo en sí no espera a otra historia |
| N | Negociable | ✓ la regla es fija (RF-8.3); el texto que explica que eliminar archiva es negociable |
| V | Valiosa | ✓ conserva la trazabilidad de lo mostrado |
| E | Estimable | ✓ una transición a *archivado* en la máquina de estados del dominio (ADR-0003), idempotente, con la guarda de rol que ya existe; el portal ya reevalúa el estado real al abrir el enlace |
| S | Pequeña | ✓ S: una acción, una guarda y un caso de idempotencia |
| T | Testeable | ✓ estado *archivado* en BD con el perfil presente, rechazo al observador sin escritura, historial sin cambios, y estado real visible en el enlace |
