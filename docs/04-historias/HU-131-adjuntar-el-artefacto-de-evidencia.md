---
id: HU-131
titulo: "Adjuntar el artefacto de evidencia tal como lo tengo"
epica: EP-006
prioridad: media
complejidad: M
estado: lista
fase: panel-crud
prd_version: 4.8
---

# HU-131 — Adjuntar el artefacto de evidencia tal como lo tengo

**Como** administradora de inventario de Talento Humano,
**quiero** guardar el documento, la transcripción o el repositorio de la validación en el formato en que existe,
**para** que la evidencia de cada perfil viva en un solo sitio y no en la carpeta de quien hizo la prueba.

## Criterios de aceptación

### Happy path — el artefacto queda asociado al perfil

**Dado** que tengo el artefacto de una validación,
**cuando** lo adjunto al perfil,
**Entonces** queda almacenado internamente y asociado a esa validación
**Y** puedo recuperarlo después desde el panel

### Error — formato o tamaño no admitido

**Dado** que tengo abierto un perfil con datos ya registrados y un archivo de video o de más de 64 MB,
**cuando** lo adjunto,
**Entonces** el panel lo rechaza y me dice que admite un documento, una transcripción en texto o el enlace a un repositorio, de hasta 64 MB por archivo, y que el proyecto no opera con video
**Y** lo demás que ya había registrado del perfil sigue intacto

### Edge case — el artefacto nunca se publica

**Dado** que un perfil publicado tiene un artefacto adjunto,
**cuando** el cliente abre la ficha,
**Entonces** ve el reporte estructurado y nunca el artefacto crudo
**Y** la ficha no incluye enlace ni referencia al artefacto

## Notas

Cubre la primera mitad de **RF-8.11**, sus límites de **RF-8.11.1** y la prohibición de **B.8.4**.

**El artefacto crudo no se publica, y es regla dura.** B.8.4 lo fija: a la ficha llega el reporte estructurado, no el documento de la prueba. Publicar el crudo expondría material que el profesional no consintió y que ninguna cuenta necesita. El archivo vive en almacenamiento privado, al que solo se llega desde el panel con autorización (RF-8.11.1).

**Esta historia vale sola.** Aunque nunca se construya la derivación asistida (HU-140 y HU-149), tener la evidencia guardada y asociada al perfil resuelve el problema de que hoy vive dispersa. Por eso se separó.

**Revisión INVEST 2026-09-30:** en el error, la acción sale del Dado (que queda como estado) y los límites concretos —formatos admitidos, 64 MB, sin video— pasan al Entonces; el edge case se vuelve falsable: «la ficha no incluye enlace ni referencia al artefacto» en lugar de «no hay ninguna ruta que lo alcance».

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · RF-8.11 · RF-8.11.1 · Anexo B.8.4 · dividida de la HU-131 original el 2026-09-22

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ no depende de HU-140 ni de HU-149 |
| N | Negociable | ✓ los límites vienen del PRD; cómo se presenta el adjunto y su recuperación en el panel son negociables |
| V | Valiosa | ✓ centraliza la evidencia dispersa |
| E | Estimable | ✓ subida a almacenamiento privado de objetos con enlace temporal tras autorización (§8.3), validación de tipo y tamaño en servidor y una tabla que asocia el archivo a la validación; es la parte M de la historia |
| S | Pequeña | ✓ M tras la división: adjuntar, rechazar y recuperar, sin derivación de campos |
| T | Testeable | ✓ archivo recuperable desde el panel, rechazo con mensaje y datos intactos, y ficha del portal sin enlace ni referencia al artefacto |
