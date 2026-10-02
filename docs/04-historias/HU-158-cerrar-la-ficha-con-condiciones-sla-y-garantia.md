---
id: HU-158
titulo: "Cerrar la ficha con las condiciones operativas, el SLA y la garantía de servicio"
epica: EP-003
prioridad: alta
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.17
depende_de: [HU-154]
---

# HU-158 — Cerrar la ficha con las condiciones operativas, el SLA y la garantía de servicio

**Como** líder de proyecto que ya leyó la trayectoria y las validaciones de un profesional,
**quiero** encontrar al final de su ficha cómo trabajaría, cuándo podría arrancar, en cuánto me responde Trycore y qué garantiza el servicio, con una referencia corta para citarlo,
**para** decidir si lo sumo a mi equipo y poder nombrarlo en una conversación sin confundirlo con otro.

## Criterios de aceptación

### Happy path — el cierre de la ficha

**Dado** que un perfil publicado trabaja en modalidad Híbrido, habla español e inglés, está en Colombia y su disponibilidad cae en la banda «1 mes»,
**cuando** llego al final de su ficha,
**Entonces** veo sus condiciones operativas: «Híbrido», «1 mes», los idiomas y el país (la ciudad solo si mi necesidad declarada es presencial o híbrida)
**Y** veo, en el tamaño del texto de la ficha y no en letra pequeña, que Trycore responde a una solicitud en 10 días hábiles
**Y** veo la garantía de servicio: el talento que entra al proyecto trabaja con agentes de IA desde el día 1 y con línea directa al CoE, dicho como forma de operar de Trycore y no como algo de la persona

### Edge case — Neural Speed nunca es un atributo de la persona

**Esquema del escenario:** la garantía es del servicio, sea cual sea la persona
**Dado** que un perfil publicado <perfil>
**Cuando** abro su ficha
**Entonces** veo la garantía de servicio con el mismo texto que en la ficha de cualquier otro perfil del banco
**Y** la experiencia con LLM <experiencia_llm>
**Y** la ficha no marca a la persona con Neural Speed, ni con una insignia ni con un estado

**Ejemplos:**

| perfil | experiencia_llm |
|---|---|
| está registrado como «banco no vinculado» y no tiene experiencia en IA en su trayectoria | no aparece en ninguna parte de la ficha |
| tiene en su trayectoria declarada un proyecto con LLM | aparece solo en su trayectoria, en «Declarado por la persona» |

### Edge case — el código está para citar, no para etiquetar

**Dado** que tengo abierta la ficha del perfil PS-0142,
**cuando** busco cómo citarlo,
**Entonces** encuentro «PS-0142» solo al pie de la ficha, en letra pequeña, como referencia, junto a una línea que recuerda que todo perfil publicado pasó el estándar Neural-Grid
**Y** el código no aparece como título, ni en la cabecera de la ficha, ni como nombre de la pestaña del navegador

## Notas

Cubre el cierre de **RF-3.2** («cierra con condiciones operativas, SLA y la garantía de servicio, Anexo B.6»), **RF-14.5** (condiciones y preferencias de trabajo en la ficha: modalidad, disponibilidad, idioma), **RF-6.5** en la ficha (garantía Neural Speed como propiedad del servicio; la evidencia previa en IA se muestra como experiencia), **RF-6.2** en la ficha (SLA visible, no en letra pequeña), **RF-3.5** en la ficha (código al pie, con el peso de un número de requisición), el último punto de **RF-3.8** (el estándar se recuerda, no se repite como insignia) y las reglas 1 y 3 de **B.6**.

**Qué existe ya y qué cambia:** la ficha (`packages/ui/src/FichaPerfil.tsx`) muestra hoy la modalidad, el país y la ciudad en una fila, y los idiomas en otra, dentro de «Declarado por la persona». **El código va en la cabecera**, entre los datos del perfil. Esta historia **mueve el código al pie** (RF-3.5) y añade el bloque de cierre con el SLA y la garantía. Como el componente es compartido con la vista previa del panel (HU-129), el cambio se verá igual allí; eso es lo que HU-129 exige.

**La ciudad condicionada** a la modalidad de la necesidad la decide `armarFicha` (D-18, ya construido). La necesidad declarada la produce **EP-009** (RF-13.5). Hasta entonces, la necesidad es «remota» por omisión y la ciudad no se muestra.

**Evidencia previa en IA (B.8.5):** cuando existe, entra como experiencia en la trayectoria que escribe Talento Humano. El edge case de Neural Speed se prueba con un esquema de una ficha por fila (refinado el 2026-10-02: antes un solo «Cuando» abría dos fichas). Esta historia no crea un campo nuevo (RF-14.0). El campo interno `vinculo` (B.7) no cambia lo que ve el cliente (HU-157).

**D73 (sponsor, 2026-10-02) cierra las dos preguntas abiertas** con la opción del prototipo/PRD, **marcada para revisión de copy**:
1. **Garantía de servicio:** se redacta con el contenido de RF-6.5 («el talento que entra al proyecto trabaja con agentes de IA desde el día 1 y con línea directa al CoE») y el nombre «Neural Speed» del prototipo. Texto **para revisión de copy** con Mercadeo; el escenario no cambia si cambia la redacción, porque fija el contenido y que sea igual para todos.
2. **Pie de la ficha:** «Referencia interna PS-XXXX. Todos los perfiles que publicamos pasan por nuestro estándar Neural-Grid™», tal como el prototipo. Texto **para revisión de copy**.

**D64:** el estándar que recuerda el pie tiene **cuatro dimensiones**. El pie no las enumera, así que no cambia; la corrección del copy del prototipo vive en HU-159.

## Trazabilidad

Épica madre: **EP-003** · PRD v4.17 · RF-3.2 · RF-3.5 · RF-3.8 · RF-6.2 · RF-6.5 · RF-14.5 · B.6 · B.8.5 · D-18 · D64 · D73 · depende de HU-154 (estructura de la ficha) · relacionada con HU-157 (contacto de Trycore), HU-159 (el estándar declarado arriba), HU-129 (vista previa con el mismo componente) y HU-082 (necesidad presencial, EP-009)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: se apoya en la ficha existente; la ciudad condicionada funciona sola con la necesidad por omisión |
| N | Negociable | ✓ son fijos los contenidos (condiciones, SLA visible, garantía del servicio y no de la persona, código al pie); la redacción, marcada para revisión de copy (D73), y la disposición se pueden negociar |
| V | Valiosa | ✓ cierra la decisión con lo que el cliente necesita para sumar a alguien y citarlo, sin prometer nada que la persona no trae |
| E | Estimable | ✓ M: reordenar el componente compartido (mover el código, agrupar condiciones) y añadir un bloque de texto fijo; sin datos nuevos |
| S | Pequeña | ✓ M: tres escenarios (uno de ellos un esquema con dos ejemplos) sobre un componente ya construido |
| T | Testeable | ✓ perfiles sembrados (híbrido con dos idiomas, no vinculado, con LLM en la trayectoria, PS-0142) dan textos exactos; la posición del código y el título de la pestaña se comprueban en el DOM |
