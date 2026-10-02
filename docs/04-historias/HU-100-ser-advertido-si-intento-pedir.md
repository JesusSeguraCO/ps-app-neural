---
id: HU-100
titulo: "Ser advertido si intento pedir sin haber elegido nada"
epica: EP-005
prioridad: media
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-192]
---

# HU-100 — Ser advertido si intento pedir sin haber elegido nada

**Como** líder de área que llegó a la solicitud de equipo sin perfiles en su equipo,
**quiero** que el portal me lo diga antes de pedirme datos y me muestre adónde ir a elegirlos,
**para** no mandar una solicitud vacía ni llenar un formulario que no voy a poder enviar.

## Criterios de aceptación

### Happy path — sin perfiles no hay formulario, hay salida

**Esquema del escenario:** la salida depende de si el enlace trae selección
**Dado** que mi equipo está vacío y entré por un enlace <enlace>
**Cuando** abro la solicitud de equipo
**Entonces** el portal no muestra el formulario
**Y** dice «Todavía no tienes perfiles en tu equipo» y me ofrece <salidas>
**Y** no veo una pantalla en blanco ni un formulario deshabilitado

**Ejemplos:**

| enlace | salidas |
|---|---|
| con selección curada para mi cuenta | «Ver la selección para ti» y «Buscar en el banco» |
| sin selección curada (HU-093) | «Buscar en el banco» |

### Edge case — el equipo se vació después de diligenciar

**Dado** que diligencié el formulario de solicitud y después quité todos los perfiles de mi equipo en otra pestaña
**Cuando** toco «Revisar antes de enviar»
**Entonces** no llego al resumen y veo «Todavía no tienes perfiles en tu equipo» con sus salidas
**Y** lo que diligencié se conserva y lo encuentro en el formulario cuando vuelvo a tener perfiles

### Error — una petición directa con el equipo vacío

**Dado** que mi equipo guardado está vacío
**Cuando** envío por una dirección directa una solicitud de equipo
**Entonces** el servidor la rechaza con el motivo «equipo vacío»
**Y** no se guarda ninguna solicitud ni se encola ningún trabajo hacia HubSpot

### Edge case — vuelvo con un perfil y sigo donde iba

**Dado** que tengo un formulario a medio diligenciar de cuando mi equipo estaba vacío y ahora PS-0142 está en mi equipo
**Cuando** abro la solicitud de equipo
**Entonces** veo el formulario con lo que había diligenciado
**Y** puedo seguir al resumen con PS-0142 en mi equipo

## Notas

Cubre el estado límite **«equipo vacío»** de la solicitud (Fase 6 del Anexo A: «sin resultados, equipo vacío… se comportan según §6.3»), y la parte de **RF-5.1** y **RF-5.3** que dice que una solicitud de equipo lleva equipo. La historia anticipada era «intentar enviar con el equipo vacío» (`docs/03-backlog/epicas.md`).

**Refinamiento 2026-10-02 (discovery de EP-005).** La versión anterior proponía, sin perfiles y con especificación, enviar la solicitud «como solicitud de perfil a medida», y, con lo mínimo, enviarla «marcada como especificación mínima». La **solicitud de perfil a medida** es **HU-077** (EP-010, RF-14.3), que nace en la pantalla del cero con su especificación; construirla aquí la duplicaría. Esta historia se queda con lo que es de EP-005: **no dejar salir una solicitud de equipo vacía** y dar salida. **No es recorte**: la solicitud a medida sigue entera en HU-077, y el enlace desde este aviso hacia ella se suma cuando EP-010 la construya.

**D121 (sponsor, 2026-10-02) cierra la pregunta: no hay solicitud de equipo sin perfiles.** No se permite enviar desde este formulario una solicitud solo con las tres respuestas («especificación mínima»). Quien no encontró perfiles tiene el camino **«a medida»** de **HU-077** (EP-010), que se construye entero en esa épica; el acceso a ese camino desde este aviso lo cablea HU-077 cuando exista la pantalla del cero. No es recorte de EP-005.

**Dos defensas.** La pantalla no ofrece el formulario (happy path) y el servidor rechaza el envío aunque alguien lo fuerce (error), con el mismo criterio que HU-198: lo que viaja sale del equipo guardado.

**Borrador conservado:** lo diligenciado vive en el navegador durante la visita (HU-197), así que vaciar el equipo no lo borra.

**Prototipo:** la vista «Mi equipo» ya tiene su estado vacío («Todavía no has sumado perfiles», «Ver el conjunto curado»), que es de EP-004; este aviso usa el mismo tono en la ruta de la solicitud. Textos **marcados para revisión de copy** (D73).

## Trazabilidad

Épica madre: **EP-005** · PRD v4.18 · RF-5.1 · RF-5.3 · Anexo A Fase 6 · §6.3 · D73 · D121 (sponsor, 2026-10-02) · discovery 2026-10-02 (refinamiento) · depende de HU-192 (EP-004, el equipo guardado) · relacionada con HU-093 (EP-001, enlace sin selección), HU-197 (formulario), HU-198 (envío) y HU-077 (EP-010, solicitud a medida)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: lee el equipo guardado de HU-192; las salidas llevan a pantallas que ya existen (selección y banco, EP-001) |
| N | Negociable | ✓ son fijos que no sale una solicitud de equipo vacía, que siempre hay salida y que lo diligenciado no se pierde; que no hay solicitud solo con contexto también (D121); el texto del aviso se negocia |
| V | Valiosa | ✓ el cliente no pierde tiempo en un formulario que no puede enviar y Trycore no recibe solicitudes vacías que exijan una llamada |
| E | Estimable | ✓ S: una guarda en la ruta de la solicitud, el rechazo en el servidor y un aviso con dos variantes de salida |
| S | Pequeña | ✓ S: una capacidad (impedir la solicitud vacía con salida) en cuatro escenarios |
| T | Testeable | ✓ e2e con un equipo sembrado vacío en un enlace con y sin selección, un equipo vaciado en otra pestaña tras diligenciar, un POST directo con el equipo vacío sin fila ni trabajo, y la vuelta con un perfil que recupera el formulario |
