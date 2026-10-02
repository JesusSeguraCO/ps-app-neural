# evidencia-validacion Specification

## Purpose
Ahorra a Talento Humano transcribir el reporte de validación: se precarga desde la modalidad de prueba y siempre lo confirma una persona. Adjuntar, descargar y ver el artefacto de evidencia (HU-131) se difiere a una versión futura por D29 (sponsor, 2026-10-01) y no forma parte de este change; en esta versión la evidencia es el reporte que Talento Humano registra a mano.

## Requirements

### Requirement: Borrador del reporte desde la modalidad de prueba
Pedir el borrador SHALL precargar, con una plantilla determinista y sin ningún servicio externo, el enunciado del reto, los entregables esperados y los criterios evaluados desde la modalidad de prueba elegida del perfil, marcando en cada campo que salió de la modalidad; no SHALL necesitar artefacto adjunto. Fecha y resultado los escribe una persona. El borrador SHALL quedar para revisión y no SHALL llegar a la ficha sin confirmación humana; un campo corregido SHALL guardarse con el valor escrito por la persona, y descartar el borrador SHALL dejar la ficha sin ningún campo de él. Sin modalidad de prueba elegida, el panel no SHALL precargar nada, SHALL explicar que el borrador sale de la modalidad y SHALL llevar al selector de modalidad del perfil.

#### Scenario: HU-140 · Borrador por plantilla para confirmación
- **GIVEN** un perfil con la modalidad de prueba elegida del catálogo
- **WHEN** la administradora pide el borrador
- **THEN** el sistema precarga desde la modalidad de prueba el enunciado del reto, los entregables esperados y los criterios evaluados
- **AND** indica en cada uno de esos campos que salió de la modalidad de prueba
- **AND** el borrador queda para su revisión y nunca se publica sin que ella lo confirme

#### Scenario: HU-140 · El perfil no tiene modalidad de prueba elegida
- **GIVEN** un perfil en borrador que todavía no tiene modalidad de prueba elegida
- **WHEN** la administradora pide el borrador
- **THEN** el panel no precarga nada y le explica que el borrador sale de la modalidad de prueba
- **AND** la lleva al selector de modalidad del perfil

#### Scenario: HU-140 · Corregir un campo que el artefacto no sostiene
- **GIVEN** un borrador precargado en revisión con un campo que describe algo que no está en el artefacto
- **WHEN** la administradora corrige ese campo
- **THEN** la ficha guarda el valor que ella escribió, no el que traía la plantilla

#### Scenario: HU-140 · Descartar un borrador que el artefacto no sostiene
- **GIVEN** un borrador precargado en revisión con un campo que describe algo que no está en el artefacto
- **WHEN** la administradora descarta el borrador
- **THEN** la ficha no recibe ningún campo de ese borrador
