---
id: HU-197
titulo: "Declarar el contexto de mi proyecto"
epica: EP-005
prioridad: alta
complejidad: M
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-192]
---

# HU-197 — Declarar el contexto de mi proyecto

**Como** líder de proyecto que ya armó su equipo y va a pedirlo,
**quiero** responder en opciones cerradas para qué es, cuándo debe incorporarse el talento y por cuánto tiempo, y añadir el sector y una nota si quiero,
**para** que Trycore llegue a la conversación sabiendo qué proyecto tengo, sin una llamada solo para aclararlo.

## Criterios de aceptación

### Happy path — las tres respuestas, el sector y la nota llegan al resumen

**Dado** que entré por el enlace de la cuenta «Banco Andino» con 2 perfiles en mi equipo
**Y** que en el formulario de solicitud elegí «Proyecto nuevo o nueva célula de desarrollo», «Corto plazo (dentro del mes actual)» y «6 a 12 meses», el sector «Banca» y escribí la nota «Migración del core en dos fases»
**Cuando** toco «Revisar antes de enviar»
**Entonces** llego al resumen (HU-096), que muestra esas tres respuestas con su texto literal, el sector «Banca» y la nota
**Y** el resumen muestra la cuenta «Banco Andino», tomada del enlace y no de un campo que yo haya escrito

### Error — falta una de las tres preguntas

**Esquema del escenario:** sin las tres respuestas no se pasa al resumen
**Dado** que diligencié el formulario y dejé sin responder <pregunta>
**Cuando** toco «Revisar antes de enviar»
**Entonces** sigo en el formulario y no llego al resumen
**Y** la pregunta <pregunta> queda señalada con el mensaje «Elige una opción»
**Y** el formulario conserva las demás respuestas, el sector y la nota

**Ejemplos:**

| pregunta |
|---|
| ¿Para qué iniciativa o proyecto requieren el apoyo de este perfil? |
| ¿Cuándo estiman que debería incorporarse el talento? |
| ¿Por cuánto tiempo estiman la vinculación o dedicación inicial? |

### Edge case — sin sector ni nota

**Dado** que respondí las tres preguntas y dejé vacíos el sector y la nota
**Cuando** toco «Revisar antes de enviar»
**Entonces** llego al resumen
**Y** el resumen dice «Sector: no indicado» y no muestra un bloque de nota vacío ni un valor inventado

### Edge case — las opciones son exactamente las validadas por Talento Humano

**Dado** que tengo perfiles en mi equipo y no he abierto el formulario en esta visita
**Cuando** abro el formulario de solicitud
**Entonces** cada pregunta ofrece exactamente sus opciones de la tabla, en ese orden, sin ninguna marcada de antemano y sin campo de texto libre

| Pregunta | Opciones |
|---|---|
| ¿Para qué iniciativa o proyecto requieren el apoyo de este perfil? | Proyecto nuevo o nueva célula de desarrollo · Refuerzo o reemplazo en un equipo existente · Exploración preliminar o presupuestación a futuro |
| ¿Cuándo estiman que debería incorporarse el talento? | Inmediata (1 a 15 días) · Corto plazo (dentro del mes actual) · Mediano plazo (próximo mes o trimestre) |
| ¿Por cuánto tiempo estiman la vinculación o dedicación inicial? | 3 a 6 meses · 6 a 12 meses · Más de 12 meses o indefinido · Tiempo parcial u horas por bolsa |

### Edge case — vuelvo al equipo y regreso

**Dado** que respondí las tres preguntas, elegí el sector «Banca», escribí una nota y toqué «Volver al equipo» sin enviar
**Cuando** vuelvo a la solicitud desde «Mi equipo» en la misma visita
**Entonces** el formulario muestra las tres respuestas, el sector y la nota como las dejé

## Notas

Cubre **RF-5.1** (las tres preguntas validadas por Talento Humano en opciones cerradas, más sector y notas libres) y la parte de cuenta de **RF-5.2** (la cuenta sale del enlace). La identificación de quien envía —correo verificado de solo lectura, nombre y cargo— es de **HU-097** (D90). El cuestionario **cruza literal** al formulario (Anexo B.1): las opciones de la tabla son las del PRD, palabra por palabra.

**Nace el 2026-10-02 en el discovery de EP-005.** RF-5.1 no tenía historia: HU-100 lo citaba solo para el caso del equipo vacío. Era la historia anticipada «declarar el contexto del proyecto» de `docs/03-backlog/epicas.md`.

**D117 (sponsor, 2026-10-02) cierra qué es obligatorio: inicio, duración y «modalidad» obligatorios; sector y nota opcionales.** El formulario no tiene un campo de modalidad de trabajo (remoto/híbrido/presencial): esa viaja con el Perfil Objetivo de EP-009 (RF-17.1). Por eso «modalidad» se lee como la **primera pregunta**, el tipo de iniciativa («¿Para qué iniciativa o proyecto…?»), y las **tres preguntas cerradas son obligatorias**, que es la opción recomendada que el sponsor aceptó. *Lectura elegida por el modelo por delegación del sponsor.* **Consecuencia para O4** (≥ 85 % con sector, fecha de inicio y duración): con inicio y duración obligatorios, O4 mide en la práctica el sector; es efecto aceptado de D117.

**Sector (propuesta, negociable).** Un valor, opcional, elegido del catálogo de sectores que administra Talento Humano (RF-8.16); nunca texto libre (RF-8.16.2).

**Nota libre (propuesta).** Hasta 2.000 caracteres con contador; viaja al contacto como `message` (HU-160, D54).

**Dónde vive lo diligenciado antes de enviar (propuesta).** En el navegador, durante la visita, como el Perfil Objetivo (D-16): es un borrador, y el servidor solo guarda la solicitud cuando se envía (HU-198). Si el sponsor prefiere recuperarlo en otro dispositivo, se reabre D-16.

**Contexto del enlace.** El proyecto del enlace (`identidad.enlaces.proyecto`), si existe, se muestra como encabezado del formulario («Para el proyecto …») y no se edita: lo escribió Comercial al armar la selección.

**La primera pregunta no sustituye al Perfil Objetivo.** El rol, el seniority, las tecnologías y la modalidad (RF-17.1) llegan con la especificación de EP-009 (HU-070), no con este formulario.

**Prototipo:** «Solicitud de equipo» (`Portal de Perfiles v2.dc.html`): «Tres preguntas y tus datos de contacto. Con eso preparamos la conversación. No reservamos ni comprometemos a ningún profesional.», «Revisar antes de enviar», «Volver al equipo».

## Trazabilidad

Épica madre: **EP-005** · PRD v4.18 · RF-5.1 · RF-5.2 (cuenta) · Anexo B.1 · O4 · RF-8.16 · D-16 · D-25 · D117 (sponsor, 2026-10-02) · discovery 2026-10-02 · depende de HU-192 (EP-004, un equipo con perfiles) · relacionada con HU-096 (resumen), HU-097 (identificación), HU-100 (equipo vacío) y HU-160 (el contenido llega al negocio)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: necesita un equipo con perfiles (HU-192); el formulario se construye y prueba con un equipo sembrado |
| N | Negociable | ✓ son fijas las tres preguntas con sus opciones literales y que nada se preselecciona ni se inventa; también que las tres son obligatorias y sector y nota opcionales (D117); el diseño, el límite de la nota y dónde vive el borrador se negocian |
| V | Valiosa | ✓ Delivery y Comercial reciben el para qué, el cuándo y el cuánto del proyecto sin una llamada de aclaración |
| E | Estimable | ✓ M: un formulario de tres preguntas cerradas, un selector de sector del catálogo existente, una nota con límite, validación y un borrador en el navegador |
| S | Pequeña | ✓ M: una capacidad (declarar el contexto) en cinco escenarios |
| T | Testeable | ✓ e2e: las tres respuestas, el sector y la nota en el resumen; cada pregunta vacía bloquea el paso con «Elige una opción»; sin opcionales se ve «Sector: no indicado»; las opciones literales sin preselección; volver al equipo y regresar conserva todo |
