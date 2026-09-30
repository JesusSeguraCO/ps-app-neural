---
id: HU-131
titulo: "Adjuntar el artefacto de evidencia tal como lo tengo"
epica: EP-006
prioridad: media
complejidad: M
estado: lista
fase: panel-crud
prd_version: 4.15
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

### Happy path — descargar y ver el artefacto desde el panel

**Dado** que un perfil tiene un artefacto adjunto y tengo sesión en el panel como administradora de inventario,
**cuando** abro el artefacto desde el perfil en el panel,
**Entonces** lo descargo y lo veo tal como se adjuntó, en su formato original
**Y** el panel no lo resume, no lo interpreta ni extrae datos de él

### Error — el observador ve que existe pero no lo descarga

**Dado** que un perfil tiene un artefacto adjunto y tengo sesión en el panel con rol observador,
**cuando** intento descargar el artefacto,
**Entonces** el panel no me lo entrega y me dice que solo la administradora de inventario puede descargarlo
**Y** en el perfil veo que el artefacto existe, sin enlace de descarga

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
**Y** la dirección de descarga del artefacto no responde desde una sesión del portal

## Notas

Cubre la primera mitad de **RF-8.11**, sus límites de **RF-8.11.1** y la prohibición de **B.8.4**.

**El artefacto crudo no se publica, y es regla dura.** B.8.4 lo fija: a la ficha llega el reporte estructurado, no el documento de la prueba. Publicar el crudo expondría material que el profesional no consintió y que ninguna cuenta necesita. El archivo vive en almacenamiento privado, al que solo se llega desde el panel con autorización (RF-8.11.1).

**Esta historia vale sola.** Aunque nunca se construya la precarga desde la modalidad (HU-140), tener la evidencia guardada y asociada al perfil resuelve el problema de que hoy vive dispersa. Por eso se separó.

**Revisión DoR 2026-09-30: aplicada D11** (sponsor). No hay lectura automática del artefacto: la evidencia se sube y quien la necesita en el panel la descarga y la ve; nunca desde el portal. Se añade el escenario de descarga y visualización en el panel y el edge gana un Entonces que comprueba que el portal no sirve el archivo. HU-149 (reconocer fecha y resultado por patrones) se descarta, así que esta historia no necesita ninguna librería para leer PDF o Word. RF-8.11 enmendado en la v4.15.

**Revisión DoR 2026-09-30: aplicada D18** (sponsor, mismo día; Ley 1581). **Solo la administradora de inventario descarga y ve el artefacto**; el observador ve que existe y no lo descarga. Se añade ese escenario de error (5 en total).

**Revisión INVEST 2026-09-30:** en el error, la acción sale del Dado (que queda como estado) y los límites concretos —formatos admitidos, 64 MB, sin video— pasan al Entonces; el edge case se vuelve falsable: «la ficha no incluye enlace ni referencia al artefacto» en lugar de «no hay ninguna ruta que lo alcance».

## Trazabilidad

Épica madre: **EP-006** · PRD v4.15 · RF-8.11 (D11) · RF-8.11.1 · Anexo B.8.4 · D11 y D18 (sponsor, 2026-09-30) · dividida de la HU-131 original el 2026-09-22

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ no depende de HU-140 |
| N | Negociable | ✓ los límites vienen del PRD; cómo se presenta el adjunto y su recuperación en el panel son negociables |
| V | Valiosa | ✓ centraliza la evidencia dispersa |
| E | Estimable | ✓ subida a almacenamiento privado de objetos con enlace temporal tras autorización (§8.3), validación de tipo y tamaño en servidor, una tabla que asocia el archivo a la validación y la descarga desde el panel; sin lectura del contenido (D11) |
| S | Pequeña | ✓ M tras la división: adjuntar, descargar y ver solo como administradora, rechazar, y no exponer; cinco escenarios sin derivación de campos |
| T | Testeable | ✓ archivo descargable desde el panel idéntico al adjuntado, descarga negada al observador con el artefacto visible como existente, rechazo con mensaje y datos intactos, ficha del portal sin enlace ni referencia y descarga rechazada desde una sesión del portal |
