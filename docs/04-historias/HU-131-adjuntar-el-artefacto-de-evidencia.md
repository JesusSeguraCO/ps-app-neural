---
id: HU-131
titulo: "Adjuntar el artefacto de evidencia tal como lo tengo"
epica: EP-006
prioridad: media
complejidad: M
estado: draft
fase: panel-crud
prd_version: 4.8
---

# HU-131 — Adjuntar el artefacto de evidencia tal como lo tengo

**Como** administradora de inventario de Talento Humano,
**quiero** guardar el video, documento o repositorio de la validación en el formato en que existe,
**para** que la evidencia de cada perfil viva en un solo sitio y no en la carpeta de quien hizo la prueba.

## Criterios de aceptación

### Happy path — el artefacto queda asociado al perfil

**Dado** que tengo el artefacto de una validación,
**cuando** lo adjunto al perfil,
**Entonces** queda almacenado internamente y asociado a esa validación
**Y** puedo recuperarlo después desde el panel

### Error — formato o tamaño no admitido

**Dado** que adjunto un archivo que el sistema no admite,
**cuando** intento guardarlo,
**Entonces** el panel me dice qué admite y por qué
**Y** no pierdo lo demás que ya había registrado del perfil

### Edge case — el artefacto nunca se publica

**Dado** que el perfil tiene un artefacto adjunto,
**cuando** el cliente abre la ficha,
**Entonces** ve el reporte estructurado y nunca el artefacto crudo
**Y** no hay ninguna ruta desde el portal que lo alcance

## Notas

Cubre la primera mitad de **RF-8.11** y la prohibición de **B.8.4**.

**El artefacto crudo no se publica, y es regla dura.** B.8.4 lo fija: a la ficha llega el reporte estructurado, no el video de la prueba. Publicar el crudo expondría material que el profesional no consintió y que ninguna cuenta necesita.

**Esta historia vale sola.** Aunque nunca se construya la derivación asistida (HU-140), tener la evidencia guardada y asociada al perfil resuelve el problema de que hoy vive dispersa. Por eso se separó.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · Anexo B.8.4 · dividida de la HU-131 original el 2026-09-22

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ no depende de HU-140 |
| N | Negociable | ✓ |
| V | Valiosa | ✓ centraliza la evidencia dispersa |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ tras la división |
| T | Testeable | ✓ |
