---
id: HU-139
titulo: "Administrar el léxico de búsqueda"
epica: EP-006
prioridad: media
complejidad: M
estado: draft
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

### Error — equivalencia a un valor que no existe en el catálogo

**Dado** que intento equiparar un término a un valor inexistente,
**cuando** guardo,
**Entonces** el panel lo rechaza y me ofrece los valores del catálogo
**Y** el léxico no puede apuntar al vacío

### Edge case — consultas sin coincidencia como candidatas

**Dado** que hubo búsquedas sin resultados en el período,
**cuando** abro el léxico,
**Entonces** esas consultas se me ofrecen como candidatas a incorporar
**Y** puedo mandarlas al léxico o a la agenda de reclutamiento

## Notas

Cubre **RF-8.12**.

**La razón de que sea administrable está en el propio requisito:** si el léxico vive en el código, en seis meses está desactualizado. La búsqueda semántica del cliente degrada al léxico cuando el servicio de interpretación falla (HU-072), así que un léxico pobre no es un lujo perdido: es la red de seguridad de la entrada por instrucción.

**El edge case conecta con el registro de demanda.** Una consulta sin coincidencia puede significar dos cosas distintas —que no sabemos cómo lo llaman, o que no tenemos el perfil— y la decisión de a cuál de las dos pertenece la toma una persona, no el sistema. Por eso las dos salidas están en el mismo lugar.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · relacionada con HU-072 y HU-078

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ sostiene la búsqueda sin intervención de Tecnología |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
