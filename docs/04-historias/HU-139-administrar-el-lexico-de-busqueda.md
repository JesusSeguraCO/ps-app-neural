---
id: HU-139
titulo: "Administrar el léxico de búsqueda"
epica: EP-006
prioridad: media
complejidad: M
estado: lista
fase: panel-crud
prd_version: 4.8
---

# HU-139 — Administrar el léxico de búsqueda

**Como** administradora de inventario de Talento Humano,
**quiero** administrar desde el panel los términos que usan los clientes y su equivalencia en rol, tecnología o sector,
**para** que la búsqueda entienda cómo habla cada cliente sin depender de que alguien toque el código.

## Criterios de aceptación

### Happy path — término del cliente con su equivalencia

**Dado** que los clientes escriben un término que el banco nombra de otro modo,
**cuando** lo registro con su equivalencia en rol, tecnología o sector,
**Entonces** las búsquedas siguientes lo reconocen
**Y** el cambio no exige despliegue

### Happy path — apruebo una propuesta del modelo (tal cual o editándola)

**Dado** que Gemini propuso una equivalencia nueva a partir de las consultas sin coincidencia del período,
**cuando** apruebo la propuesta, con o sin editarla antes de confirmar,
**Entonces** la equivalencia, tal como quedó, entra al léxico
**Y** las búsquedas siguientes la reconocen

### Edge case — rechazo una propuesta del modelo

**Dado** que Gemini propuso una equivalencia nueva a partir de las consultas sin coincidencia del período,
**cuando** la rechazo,
**Entonces** no entra al léxico y deja de ofrecerse como propuesta
**Y** ninguna propuesta pendiente afecta a las búsquedas mientras no la confirme

### Error — equivalencia a un valor que no existe en el catálogo

**Dado** que intento equiparar un término a un valor inexistente en el catálogo,
**cuando** guardo la equivalencia,
**Entonces** el panel la rechaza y me ofrece los valores del catálogo
**Y** el léxico no queda apuntando a un valor vacío

### Edge case — consultas sin coincidencia como candidatas

**Dado** que hubo búsquedas sin resultados en el período,
**cuando** abro el léxico,
**Entonces** esas consultas se me ofrecen como candidatas a incorporar
**Y** puedo mandarlas al léxico o a la agenda de reclutamiento

## Notas

Cubre **RF-8.12** y **RF-8.12.1**.

**La razón de que sea administrable está en el propio requisito:** si el léxico vive en el código, en seis meses está desactualizado. La búsqueda semántica del cliente degrada al léxico cuando el servicio de interpretación falla (HU-072), así que un léxico pobre no es un lujo perdido: es la red de seguridad de la entrada por instrucción.

**El modelo propone, Talento Humano aprueba (RF-8.12.1, D-24).** Gemini revisa periódicamente las consultas sin coincidencia y propone equivalencias; nada entra al léxico sin aprobación humana. Al modelo solo viaja el texto de la consulta y la taxonomía, nunca datos de perfiles (RF-16.2). En desarrollo se usa token personal y solo datos ficticios.

**El edge case conecta con el registro de demanda.** Una consulta sin coincidencia puede significar dos cosas distintas —que no sabemos cómo lo llaman, o que no tenemos el perfil— y la decisión de a cuál de las dos pertenece la toma una persona, no el sistema. Por eso las dos salidas están en el mismo lugar.

**Validación con datos sintéticos.** El registro de consultas sin coincidencia (RF-2.6.3) que alimenta el edge case y las propuestas de Gemini llega con HU-078 (EP-010), que se construye después de EP-006 y sobre EP-009. Hasta entonces, el edge case y el escenario de propuestas se validan con consultas sin coincidencia sintéticas; la conexión con el registro real se comprueba cuando EP-009 y EP-010 estén construidas.

**Revisión INVEST 2026-09-30:** añadido el escenario de RF-8.12.1 (propuestas de Gemini: aprobar, editar o rechazar; nada entra sin confirmación); declarado que el edge de consultas sin coincidencia se valida con datos sintéticos hasta EP-009/EP-010; When del error concretado («guardo la equivalencia»). No se declara `depende_de` en el frontmatter porque la dependencia con HU-078 se resuelve con datos sintéticos y no bloquea construir la historia.

## Trazabilidad

> OpenSpec change: administracion-del-inventario

Épica madre: **EP-006** · PRD v4.8 · RF-8.12 · RF-8.12.1 · D-24 · relacionada con HU-072 y HU-078 (EP-010)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con reserva declarada: la fuente real de consultas sin coincidencia (HU-078, EP-010) llega después; se sustituye por datos sintéticos hasta EP-009/EP-010 |
| N | Negociable | ✓ la aprobación humana obligatoria la fija RF-8.12.1; la periodicidad de las propuestas y la presentación de candidatas son negociables |
| V | Valiosa | ✓ sostiene la búsqueda sin intervención de Tecnología y la mejora con el uso |
| E | Estimable | ✓ un CRUD de equivalencias validado contra el catálogo, una bandeja de propuestas con tres decisiones y una lista de candidatas; la llamada a Gemini es la de la frontera ya declarada; falta la cifra del equipo |
| S | Pequeña | ✓ M: cinco escenarios sobre una sola pantalla de léxico |
| T | Testeable | ✓ con un catálogo fijo, propuestas sintéticas y consultas sin coincidencia sintéticas, cada escenario tiene un resultado observable en el léxico y en la búsqueda |
