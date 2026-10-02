---
artefacto: backlog
proyecto: portal-people-service
version: 5.9
fecha: 2026-10-02
prd_version: 4.13
epicas_version: 5.9
historias_escritas: 160
historias_descartadas: 2
---

# Backlog consolidado — Portal de Perfiles People Service

> **Este es el documento vivo del proyecto.** Cada iteración lo actualiza; no se reescribe desde cero.
> Para el detalle de cada historia, abrir su archivo en `docs/04-historias/`.

## Estado de los artefactos

| Artefacto | Versión | Dónde |
|---|---|---|
| PRD | **4.13** | `docs/01-prd/portal-people-service.md` |
| Épicas | **5.9** — 11 épicas, con requisitos por épica y notas del discovery 2026-10-02 (cuarta ronda: EP-004 y EP-005; quinta ronda D132–D131: EP-002, EP-009, EP-010 y EP-011) | `docs/03-backlog/epicas.md` |
| Mapa de historias | **3.8** — alineado a épicas 5.9 y al discovery 2026-10-02 (quinta ronda) | `docs/02-user-story-map/portal-people-service.md` |
| Historias escritas | **158** activas, 2 descartadas (HU-079, HU-149); de las activas, HU-131 diferida a v2 (D29, 2026-10-01). El 2026-10-02 entran 40 (HU-153–HU-178, HU-180, HU-184–HU-196; los IDs HU-179 y HU-181–HU-183 no se usaron); HU-195 y HU-196 nacen en la tercera ronda (D93, D94); en la cuarta ronda (D108–D123) entran 10 más: HU-197–HU-201 (EP-005) y HU-203–HU-207 (EP-004 y EP-008; el ID HU-202 no se usó); en la quinta ronda (D132–D131) entran 23 más: HU-019, HU-020, HU-219–HU-226 y HU-250 (EP-002), HU-209–HU-213 (EP-009), HU-227 y HU-228 (EP-010) y HU-229–HU-233 (EP-011). Quedan en draft HU-067, HU-213 y HU-072 (prueba previa T-23; D131 pendiente del sponsor) | `docs/04-historias/` |
| Prototipo Low-Fi (v1) | entregado | `prototipo-portal-people-service.html` |
| Prototipo Mid-Fi (v2) | entregado, con llamada real al modelo | `prototipo-midfi-portal-people-service.html` |
| Auditoría de usabilidad (Krug) | 1.0 — 7 hallazgos corregidos | `docs/08-usabilidad/auditoria-krug.md` |
| Escalamiento de decisiones | 1.0 — por equipo | `docs/09-escalamiento/solicitudes-por-equipo.md` |
| Spec · Enlaces curados | 1.0 — construida | `docs/10-specs/enlaces-curados.md` |
| Spec · Importación masiva | 2.0 — especificada, no construida | `docs/10-specs/importacion-masiva.md` |
| **Especificación consolidada** | generada · documento de construcción por épicas | `docs/ESPECIFICACION-CONSOLIDADA.md` |

## Historias escritas con criterios de aceptación

Corresponden a la **Fase 2 de diseño** (PRD §13) y a los ajustes que esa fase introdujo en épicas anteriores.

| ID | Título | Épica | Prioridad | Compl. | Estado | Condición o bloqueo |
|---|---|---|---|---|---|---|
| **HU-065** | Buscar escribiendo lo que necesito en mis propias palabras | EP-009 | alta | M | lista | Depende de HU-139 · *Discovery 2026-10-02*: refinada: intérprete determinista propio, la búsqueda corta nunca pasa por el modelo (D-24) |
| **HU-066** | Arrancar desde una sugerencia en lugar de un campo vacío | EP-009 | alta | S | lista | Depende de HU-065 · *Discovery 2026-10-02*: refinada |
| **HU-067** | Pegar el requerimiento que ya tengo escrito | EP-009 | media | M | **draft** | Depende de HU-065, HU-068, HU-213 · *Discovery 2026-10-02*: refinada; **draft** hasta ejecutar la prueba previa T-23 de RF-12.2; **D131 pendiente del sponsor** |
| **HU-068** | Ver cómo el portal entendió lo que pedí | EP-009 | alta | S | lista | Depende de HU-065 · *Discovery 2026-10-02*: refinada |
| **HU-069** | Corregir la interpretación sin volver a escribir | EP-009 | alta | S | lista | Depende de HU-068, HU-209 · *Discovery 2026-10-02*: refinada |
| **HU-070** | Revisar y ajustar la especificación de lo que necesito | EP-009 | alta | M | lista | Depende de HU-065, HU-209 · *Discovery 2026-10-02*: refinada; el viaje con la solicitud sale a HU-211 (partición) |
| **HU-071** | Responder una pregunta de afinamiento sin perder lo que ya veo | EP-009 | media | M | lista | Depende de HU-065, HU-118 · *Discovery 2026-10-02*: refinada |
| **HU-072** | Seguir usando el portal cuando el servicio externo falla | EP-009 | alta | S | **draft** | Depende de HU-067, HU-213 · *Discovery 2026-10-02*: refinada; **draft** con HU-067 y HU-213 (T-23); **D131 pendiente del sponsor** |
| **HU-073** | Encontrar mi especificación como la dejé | EP-009 | media | S | lista | Depende de HU-070 · *Discovery 2026-10-02*: refinada; D-16 cerrada (persistencia por dispositivo) |
| **HU-074** | Refinar con filtros lo que la instrucción me devolvió | EP-002 | alta | S | lista | Depende de HU-219, HU-220 · *Discovery 2026-10-02*: refinada; independiente de EP-009 por partición (patrón D87); el cero de filtros sigue en HU-223 |
| **HU-219** | Filtrar el banco combinando facetas y viendo cuántos perfiles deja cada opción | EP-002 | alta | M | lista | Depende de HU-167 · *Discovery 2026-10-02*: (nueva): facetas combinables con contadores por opción (RF-2.3, RF-2.4) |
| **HU-220** | Ver cada filtro activo como una etiqueta y quitarlo de un toque | EP-002 | alta | S | lista | Depende de HU-219 · *Discovery 2026-10-02*: (nueva): etiquetas de filtro activo, quitar uno o todos |
| **HU-223** | Salir del cero que dejaron mis filtros sin adivinar qué deshacer | EP-002 | alta | S | lista | Depende de HU-219, HU-220, HU-147 · *Discovery 2026-10-02*: (nueva): cero por filtros con cuántos recupera cada uno; salida a medida vía HU-228 (D132, HU-223) |
| **HU-222** | Ordenar los resultados por relevancia, disponibilidad o seniority | EP-002 | media | S | lista | Depende de HU-219 · *Discovery 2026-10-02*: (nueva): orden por relevancia, disponibilidad o seniority (RF-2.7) |
| **HU-221** | Compartir y retomar la búsqueda exacta con su enlace | EP-002 | alta | M | lista | Depende de HU-219, HU-222, HU-121 · *Discovery 2026-10-02*: (nueva): estado completo en la URL; amplía la lista cerrada de ADR-0004 con categoría, sector, disponibilidad y orden |
| **HU-075** | Entender qué pedí cuando no hay nada que mostrar | EP-010 | alta | S | lista | Depende de HU-085, HU-118, HU-167 · *Discovery 2026-10-02*: refinada; el cero por filtros es de EP-002; D130: sin solicitud no hay especificación en servidor |
| **HU-076** | Ver alternativas solo cuando de verdad se parecen | EP-010 | alta | M | lista | Depende de HU-075, HU-118, HU-174 · *Discovery 2026-10-02*: refinada: falla exactamente un obligatorio (D-14) |
| **HU-077** | Pedir el perfil que no existe todavía | EP-010 | alta | M | lista | Depende de HU-075, HU-198 · *Discovery 2026-10-02*: refinada: SOL-AAAA-NNNN y tabla de EP-005, un solo trabajo en cola (D76, D121); D130 |
| **HU-078** | Saber qué están pidiendo las cuentas y no tenemos | EP-010 | alta | M | lista | Depende de HU-077 · *Discovery 2026-10-02*: refinada: especificación solo de solicitudes a medida, texto enmascarado para el resto (D130) |
| **HU-227** | Entender que el banco es selectivo y no pequeño | EP-010 | media | S | lista | Depende de HU-075, HU-178 · *Discovery 2026-10-02*: (nueva): el banco es selectivo, no pequeño |
| **HU-228** | Pedir el perfil a medida desde una opción sin perfiles, un cero por filtros o un equipo vacío | EP-010 | media | S | lista | Depende de HU-075, HU-077, HU-093, HU-100, HU-223 · *Discovery 2026-10-02*: (nueva): pedir a medida desde la opción vacía, el cero por filtros o el equipo vacío (D121, D132) |
| **HU-079** | Reconocer de un vistazo qué ha logrado un perfil | EP-003 | n/a | M | **descartada** | DESCARTADA el 2026-09-14 por cierre de D-15 |
| **HU-080** | Ver qué le falta al equipo que estoy armando | EP-004 | media | S | lista | Depende de HU-203 · *Discovery 2026-10-02*: M → S; reglas fijas en código validadas por Delivery, sin viajar a HubSpot en v1 (D115) |
| **HU-192** | Sumar y quitar perfiles de Mi equipo | EP-004 | alta | M | lista | *Discovery 2026-10-02*: redactada ya por D88 (RF-4.1, RF-4.2, con su indicador); absorbe los criterios recibidos de EP-001 (HU-094, HU-095); habilita HU-175 |
| **HU-203** | Ver mi equipo como conjunto | EP-004 | alta | M | lista | Depende de HU-192 · *Discovery 2026-10-02* (nueva): arranque = banda del perfil más tardío (D110); HU-096 la reutiliza (D111) |
| **HU-206** | Saber qué pasó con un perfil de mi equipo que dejó de estar disponible | EP-004 | alta | M | lista | Depende de HU-192 y HU-203 · *Discovery 2026-10-02* (nueva): sigue en el contador, no cuenta en roles ni arranque (D114); absorbe el criterio recibido de HU-094 (error) |
| **HU-205** | Encontrar mi equipo como lo dejé al volver, desde otro dispositivo o al renovar el enlace | EP-004 | alta | M | lista | Depende de HU-192, HU-203, HU-206 y HU-092 · *Discovery 2026-10-02* (nueva): al renovar un enlace vencido se ofrece copiar el equipo (D113, enmienda RF-4.5); S → M |
| **HU-204** | Comparar hasta tres perfiles con los mismos criterios | EP-004 | media | M | lista | Depende de HU-203 y HU-250 (antes HU-121) · *Discovery 2026-10-02* (nueva): desde «Mi equipo» y desde la tabla, filas fijas (D112) · línea v1.1 |
| **HU-081** | Distinguir un perfil de otro por sus competencias verificadas | EP-003 | alta | S | lista | Depende de HU-153 · *Discovery 2026-10-02*: refinada; el Sello Personal sigue opcional (D63) |
| **HU-177** | Administrar el catálogo de alcances de la verificación SARO | EP-003 | alta | S | lista | Depende de HU-089 · *Discovery 2026-10-02*: **sub-slice inicial de EP-003** (D60); alcance SARO como catálogo cerrado administrable (D61). Toca el panel de EP-006, que sigue cerrada |
| **HU-176** | Registrar el alcance y la fecha de la verificación SARO y la fecha de la evaluación DISC | EP-003 | alta | M | lista | Depende de HU-125, HU-126, HU-128 y HU-177 · *Discovery 2026-10-02*: sub-slice inicial (D60); SARO y DISC obligatorios para publicar (D61). Nace de la partición de HU-156; antes prevista en EP-006 |
| **HU-178** | Ver marcados como incompletos los perfiles publicados a los que les falta una validación de entrada | EP-003 | alta | M | lista | Depende de HU-176, HU-126 y HU-128 · *Discovery 2026-10-02*: sub-slice inicial; los publicados siguen visibles con marca «incompleto» (D62); tres validaciones obligatorias, Sello opcional (D63) |
| **HU-191** | Completar SARO y DISC por importación masiva | EP-003 | alta | M | lista | Depende de HU-176, HU-177, HU-086, HU-088 y HU-141 · *Discovery 2026-10-02*: sub-slice inicial (D81); sale de HU-176 (partición, no recorte) |
| **HU-194** | Recibir un aviso de lenguaje de inventario al escribir la trayectoria | EP-003 | media | S | lista | Depende de HU-125, HU-126 y HU-176 · *Discovery 2026-10-02*: sub-slice inicial; el panel advierte, no bloquea (D73); sale de HU-154 |
| **HU-153** | Leer en la tarjeta qué capacidad ofrece cada profesional | EP-003 | alta | M | lista | — · *Discovery 2026-10-02*: cuatro dimensiones (D64); 5 tecnologías por orden de carga y anclaje = años de experiencia (D73) |
| **HU-154** | Distinguir en la ficha lo que Trycore verificó de lo que declara el profesional | EP-003 | alta | S | lista | — · *Discovery 2026-10-02*: tres validaciones de entrada obligatorias (D63) |
| **HU-155** | Consultar cómo se validó técnicamente a un profesional | EP-003 | alta | M | lista | Depende de HU-154 · *Discovery 2026-10-02*: los 5 campos ya construidos (D59); Nivel 0 sin fecha (D73) |
| **HU-156** | Ver con fecha y alcance la verificación de seguridad y la evaluación DISC | EP-003 | alta | S | lista | Depende de HU-154 y HU-176 · *Discovery 2026-10-02*: la ficha omite el dato ausente (D62) |
| **HU-157** | Saber desde la ficha que la conversación sobre el profesional va por Trycore | EP-003 | alta | S | lista | Depende de HU-147 · *Discovery 2026-10-02*: sin acción «Escribir a Trycore» aparte del bloque de contacto (D73) |
| **HU-158** | Cerrar la ficha con las condiciones operativas, el SLA y la garantía de servicio | EP-003 | alta | M | lista | Depende de HU-154 · *Discovery 2026-10-02*: copy de la garantía Neural Speed marcado para revisión (D73) |
| **HU-159** | Entender el estándar Neural-Grid antes del primer perfil | EP-003 | alta | M | lista | Depende de HU-178 · *Discovery 2026-10-02*: afirma «ningún perfil sin…» solo con 0 incompletos (D80); sin conteo disponible, versión descriptiva (D97); también en el encuadre de HU-093 (D73) |
| **HU-175** | Sumar o quitar un perfil de mi equipo desde su ficha sin cerrarla | EP-004 | alta | S | lista | Depende de HU-120 y HU-192 · *Discovery 2026-10-02*: sale de HU-120 (partición INVEST, no recorte); quitar por D73  · D101: pasa a EP-004 |
| **HU-082** | Decir en qué país y ciudad necesito el perfil | EP-009 | alta | M | lista | Depende de HU-070, HU-198 · *Discovery 2026-10-02*: refinada |
| **HU-083** | Decir qué tiene que estar funcionando cuando el proyecto termine | EP-009 | alta | S | lista | Depende de HU-070, HU-207, HU-209 · *Discovery 2026-10-02*: refinada: fija la asignación del reto a un tipo de proyecto; el nombre del tipo es público (alineado con HU-207) |
| **HU-084** | Ver la forma típica del trabajo que estoy por emprender | EP-009 | media | M | lista | Depende de HU-083, HU-203, HU-207 · *Discovery 2026-10-02*: pasa a EP-009 (D108); en lista tras el refinamiento de HU-083 |
| **HU-085** | Ajustar mi especificación con las opciones que el banco realmente tiene | EP-009 | alta | M | lista | Depende de HU-070, HU-209 · *Discovery 2026-10-02*: refinada |
| **HU-209** | Confiar en que el panel y los resultados dicen lo mismo | EP-009 | alta | M | lista | Depende de HU-065 · *Discovery 2026-10-02*: (nueva): contador del panel = resultados, motor único RF-13.8 |
| **HU-210** | Ver debajo de las coincidencias a quienes cumplen todo menos un requisito | EP-009 | alta | S | lista | Depende de HU-118, HU-209 · *Discovery 2026-10-02*: (nueva): relacionados bajo las coincidencias directas (RF-2.6.1) |
| **HU-211** | Recibir la especificación del cliente con su solicitud, revisada o inferida | EP-009 | alta | M | lista | Depende de HU-070, HU-198 · *Discovery 2026-10-02*: (nueva): partida de HU-070; la especificación viaja con la solicitud, revisada o inferida (RF-17.5) |
| **HU-212** | Que cada cuenta vea siempre su variante, con o sin Perfil Objetivo | EP-009 | media | M | lista | Depende de HU-070 · *Discovery 2026-10-02*: (nueva): variante del experimento fija por cuenta (D71) |
| **HU-213** | Decidir si mi requerimiento pegado sale a un servicio externo | EP-009 | media | M | **draft** | Depende de HU-065 · *Discovery 2026-10-02*: (nueva): partida de HU-067; aviso y saneamiento antes de Gemini; **draft** (T-23, **D131 pendiente del sponsor**) |
| **HU-088** | Descargar una plantilla o el banco para editarlo y devolverlo | EP-006 | media | S | lista | — |
| **HU-086** | Pegar mi hoja de cálculo y ver qué va a pasar | EP-006 | media | M | lista | *Dividida el 22-sep en 086 + 141 + 142* |
| **HU-148** | Reutilizar un emparejamiento de columnas guardado | EP-006 | media | S | lista | Depende de HU-086 · sale de HU-086 el 2026-09-30 (D2, partición, no recorte) |
| **HU-141** | Confirmar la importación sabiendo qué campos toca | EP-006 | media | M | lista | Depende de HU-086 |
| **HU-087** | Deshacer una importación que salió mal | EP-006 | media | M | lista | Depende de HU-141 (deshace lo que aplicó la confirmación; revisión INVEST 2026-09-30) |
| **HU-089** | Crear valores de catálogo sin duplicar los que ya existen | EP-006 | alta | M | lista | *Dividida el 22-sep en 089 + 143* |
| **HU-090** | Entrar al portal desde el correo sin registrarme | EP-001 | alta | M | borrador | — |
| **HU-091** | Reconocer que la selección se armó para mi proyecto | EP-001 | alta | S | borrador | — |
| **HU-092** | Recuperar el acceso cuando el enlace venció | EP-001 | alta | S | borrador | — |
| **HU-093** | Entrar sin una selección previa y ser encuadrado | EP-001 | media | S | borrador | — |
| **HU-094** | Volver a la selección después de explorar | EP-001 | alta | S | borrador | — |
| **HU-095** | Compartir el enlace con un colega | EP-001 | media | S | borrador | — |
| **HU-197** | Declarar el contexto de mi proyecto | EP-005 | alta | M | lista | Depende de HU-192 · *Discovery 2026-10-02* (nueva): las tres preguntas obligatorias, sector y nota opcionales (D117) |
| **HU-097** | Identificarme cuando no soy quien recibió el correo | EP-005 | alta | S | lista | — · *Discovery 2026-10-02*: correo verificado de solo lectura; nombre y cargo obligatorios (D90) |
| **HU-096** | Revisar mi equipo antes de pedirlo | EP-005 | alta | M | lista | Depende de HU-203, HU-197 y HU-097 · *Discovery 2026-10-02*: resumen antes de enviar que reutiliza la vista de HU-203 (D111); el no publicado no viaja y se ve solo por código y estado, el colocado sí viaja (D118) |
| **HU-198** | Enviar exactamente el equipo que revisé | EP-005 | alta | M | lista | Depende de HU-096 · *Discovery 2026-10-02* (nueva): perfiles del equipo guardado, solo publicados (D118); «Mi equipo» se conserva (D122); dispara EP-007 |
| **HU-098** | Saber qué pasa después de enviar | EP-005 | alta | S | lista | — · *Discovery 2026-10-02*: misma especificación = misma cuenta + mismos perfiles (D119); sin solicitud nueva en 7 días (D120); sin acuse por correo en v1 (D123) |
| **HU-199** | Saber que pedir el equipo no reserva a nadie | EP-005 | alta | S | lista | Depende de HU-198 · *Discovery 2026-10-02* (nueva): RF-5.5; «Mi equipo» igual tras enviar (D122) |
| **HU-099** | Agendar la sesión de alineación | EP-005 | media | S | lista | Depende de HU-098 · *Discovery 2026-10-02*: entra en EP-005 y en el MVP con enlace de reuniones de equipo con rotación de HubSpot (D116); M → S |
| **HU-100** | Ser advertido si intento pedir sin haber elegido nada | EP-005 | media | S | lista | Depende de HU-192 · *Discovery 2026-10-02*: sin solicitud sin perfiles; el camino es «a medida», HU-077 (D121) |
| **HU-201** | Añadir contexto a mi solicitud en curso en lugar de duplicarla | EP-005 | media | S | lista | Depende de HU-098 · *Discovery 2026-10-02* (nueva): lado del portal de D-7 (D119, D120); HU-180 lo lleva a HubSpot |
| **HU-200** | Ver en el recorrido cuándo una visita inició y envió su solicitud | EP-005 | media | S | lista | Depende de HU-167 y HU-198 · *Discovery 2026-10-02* (nueva): eventos de la solicitud contra el contrato de HU-167; se secuencia detrás de HU-167 si EP-005 va antes que EP-008 |
| **HU-101** | Recibir la solicitud con contexto suficiente para preparar la sesión | EP-005 | alta | M | lista | — |
| **HU-102** | Recibir la oportunidad en mi pipeline | EP-007 | alta | M | borrador | *Discovery 2026-10-02*: híbrido API + workflow (D76, corrige D52); pipeline existente «Comercial (People y Tecnología)» con `soluciones_ofrecidas = People Service` (D85); etapa inicial por definir con Comercial |
| **HU-103** | Enterarme de una solicitud sin tener que vigilar el pipeline | EP-007 | alta | S | borrador | Depende de HU-102 y HU-104 · *Discovery 2026-10-02*: M → S; avisos comerciales en el workflow de HubSpot (D55, D76); cuenta sin propietario → Dirección Comercial (D73) |
| **HU-104** | Que no se me duplique la empresa en el CRM | EP-007 | alta | S | borrador | Depende de HU-102 · *Discovery 2026-10-02*: HubSpot asocia y, si no existe, crea la empresa por dominio (D53, D79) |
| **HU-105** | Recuperar una solicitud que no llegó a HubSpot | EP-007 | alta | M | lista | Depende de HU-102 · *Discovery 2026-10-02*: título ajustado; idempotencia por «Id solicitud People Service» único (D76) |
| **HU-106** | Distinguir lo que entra por el portal de lo que entra por gestión | EP-007 | alta | S | borrador | Depende de HU-102 · *Discovery 2026-10-02*: origen y campaña en propiedades por defecto/UTM (D54, D85) |
| **HU-107** | Registrar cuándo se agendó la alineación | EP-007 | alta | S | borrador | Depende de HU-102 · *Discovery 2026-10-02*: O3 mide cuándo se agendó (D57); el worker lee una vez al día `engagements_last_meeting_booked` del contacto, sin propiedad nueva (D75, D92); días hábiles cruzados (D91) |
| **HU-160** | Ver el requerimiento completo en «Solicitudes People Service» | EP-007 | alta | S | lista | Depende de HU-102 · *Discovery 2026-10-02*: párrafo en la propiedad nueva multilínea «Solicitudes People Service» (D54, D86); mensaje libre en `message` |
| **HU-161** | Encontrar la solicitud completa en la línea de tiempo del contacto | EP-007 | alta | S | borrador | Depende de HU-160 · *Discovery 2026-10-02* (D76) |
| **HU-180** | Llevar a HubSpot el contexto añadido a una solicitud en curso | EP-007 | alta | S | borrador | Depende de HU-161 · *Discovery 2026-10-02*: «solicitud reciente» (D-7) = 7 días (D73) |
| **HU-162** | Recibir la solicitud que nadie atendió en 4 horas hábiles | EP-007 | alta | M | borrador | Depende de HU-103 · *Discovery 2026-10-02*: escalamiento en el workflow de HubSpot (D55); calendario T-4 de jornadas de 10 h (D77) |
| **HU-163** | Recibir en Dirección General la solicitud que no avanza en 24 horas hábiles | EP-007 | alta | S | borrador | Depende de HU-162 · *Discovery 2026-10-02*: workflow de HubSpot (D55); 24 h hábiles ≈ 2,4 jornadas T-4 (D77) |
| **HU-164** | Resolver desde el panel las solicitudes que no llegaron a HubSpot | EP-007 | alta | M | lista | Depende de HU-105 · *Discovery 2026-10-02*: bandeja de fallos (D76) |
| **HU-165** | Saber que el registro en HubSpot dejó de correr | EP-007 | alta | S | lista | Depende de HU-105 · *Discovery 2026-10-02*: se construye dentro de EP-007; monitor externo = alertas de DigitalOcean App Platform (D58) |
| **HU-166** | Distinguir un fallo de HubSpot que no se arregla solo | EP-007 | alta | S | lista | Depende de HU-105 · *Discovery 2026-10-02*: 401/403 permanentes, sin reintento, a la bandeja (D73) |
| **HU-167** | Registrar el recorrido del cliente y consultarlo en Medición | EP-008 | alta | M | lista | — · *Discovery 2026-10-02*: base de EP-008; sesión real = código verificado de correo no @trycore.com y enlace no demo (D68); vista del recorrido incluida (D72); 30 min sin actividad cierra la visita (D73) |
| **HU-168** | Medir la entrada al portal desde que se abre el enlace | EP-008 | alta | S | lista | Depende de HU-167 · *Discovery 2026-10-02*: abrir un enlace revocado cuenta como intento, no como entrada (D73) |
| **HU-169** | Que mi rastro en el portal no lleve mi correo y caduque | EP-008 | alta | M | lista | Depende de HU-167 · *Discovery 2026-10-02*: la supresión Ley 1581 sale a HU-193 (D89) |
| **HU-187** | Ver el aviso de privacidad antes de entrar | EP-008 | alta | S | lista | Depende de HU-169 · *Discovery 2026-10-02*: solo aviso enlazado en la puerta, sin casilla (D65); pantalla de EP-001 (HU-090); copy por revisar |
| **HU-193** | Atender una solicitud de supresión de un contacto | EP-008 | alta | S | lista | Depende de HU-169 y HU-190 · *Discovery 2026-10-02*: sale de HU-169 (D89); anonimiza eventos, conserva conteos |
| **HU-188** | Marcar un enlace como demo para que no cuente en Medición | EP-008 | alta | S | lista | Depende de HU-167 · *Discovery 2026-10-02*: casilla «demo» al generar el enlace (D68); pantalla de EP-001 (HU-122) |
| **HU-190** | Conceder o quitar el permiso de Medición a una persona del panel | EP-008 | alta | S | lista | Depende de HU-151 · *Discovery 2026-10-02*: permiso «Medición» por persona, independiente del rol (D74, corrige D67); toca la lista de acceso de HU-151 (EP-006, cerrada) |
| **HU-108** | Ver el embudo de cada cuenta | EP-008 | media | M | lista | Depende de HU-167 y HU-168 · *D66 (2026-10-02): sube de v1.1 al MVP con el tablero* |
| **HU-109** | Ver si la curaduría acierta | EP-008 | alta | S | lista | Depende de HU-167 y HU-112 · *Discovery 2026-10-02*: perfil curado no disponible al abrir cuenta como fallo de curaduría (D73) |
| **HU-110** | Ver qué filtros usan realmente los clientes | EP-008 | alta | S | lista | Depende de HU-167 · *Reescrita el 22-sep: antes duplicaba HU-078* |
| **HU-111** | Comparar la ruta de instrucción con la de filtros | EP-008 | media | M | lista | Depende de HU-167 y HU-110 · *D66 (2026-10-02): sube de v1.1 al MVP con el tablero*; las decisiones de reclutamiento que lee las registra Talento Humano (HU-189, D83) |
| **HU-112** | Atribuir cada sesión a su envío de correo | EP-008 | alta | M | lista | Depende de HU-167 y HU-168 · *Discovery 2026-10-02*: S → M; hereda la atribución del último correo curado con ventana de 90 días (D69) |
| **HU-171** | Ver el tablero mensual de medición | EP-008 | alta | M | lista | Depende de HU-167 y HU-190 · *Discovery 2026-10-02*: **MVP** (D66); conversión = cuentas con solicitud / cuentas que entraron (D70); O4 y KPI del 35 % en el tablero, este en «aún no se mide» hasta EP-011 (D93); el panel O3 sale a HU-196 (partición, no recorte) |
| **HU-196** | Ver en el tablero los días hasta la alineación agendada | EP-007 | alta | S | lista | Depende de HU-171 y HU-107 · *Discovery 2026-10-02*: sale de HU-171 (D93, partición, no recorte); O3 en días hábiles cruzados (D91) con la lectura diaria de HU-107 (D75, D92)  · D103: pasa a EP-007 |
| **HU-172** | Ver las diez búsquedas sin resultados más repetidas del mes | EP-008 | alta | S | lista | Depende de HU-167 · *Discovery 2026-10-02*: por cuentas distintas, empates del 10.º visibles (D73); también en «Demanda» para Talento Humano (D82) |
| **HU-170** | Ver en qué terminan las pantallas sin coincidencia | EP-008 | media | S | lista | Depende de HU-167 · *Discovery 2026-10-02*: partida con HU-184 y HU-185 (partición, no recorte) |
| **HU-184** | Ver si las composiciones de referencia agrandan los equipos pedidos | EP-008 | media | S | lista | Depende de HU-167 · *Discovery 2026-10-02*: sale de HU-170; quien vio y descartó cuenta en el grupo que la vio (D73) |
| **HU-185** | Saber cuándo se cumple el disparador de la ruta por reto | EP-008 | media | S | lista | Depende de HU-167, HU-190 y HU-195 · *Discovery 2026-10-02*: sale de HU-170; solo la lectura de Mercadeo de las tres condiciones de §14.5 (D73, D94, D95) |
| **HU-195** | Registrar la validación de Delivery de las composiciones de referencia | EP-008 | media | S | lista | Depende de HU-151 y HU-190 · *Discovery 2026-10-02*: sale de HU-185 (D94, partición, no recorte); la registra Coordinación de Servicio con el permiso «Validar composiciones»; tercera condición de §14.5 (D95) |
| **HU-207** | Registrar las composiciones de referencia que entrega Delivery | EP-008 | media | M | lista | Depende de HU-151 y HU-195 · *Discovery 2026-10-02* (nueva, cuarta ronda): EP-008 en el destino «Composiciones» (D106, D109); da el dato de HU-084 |
| **HU-173** | Saber si la entrada por instrucción capta la demanda o la dicta | EP-008 | media | S | lista | Depende de HU-167 · *Discovery 2026-10-02*: partida con HU-186 |
| **HU-186** | Comparar la búsqueda con y sin Perfil Objetivo | EP-008 | media | M | lista | Depende de HU-167 · *Discovery 2026-10-02*: sale de HU-173; A/B por cuenta 50/50, lectura descriptiva, lo enciende un administrador (D71) |
| **HU-189** | Registrar una decisión de reclutamiento | EP-010 | media | S | lista | Depende de HU-078 · *Discovery 2026-10-02*: nueva por D83; pasa a EP-010 (D103); la tabla de consultas sin coincidencia es de EP-009 |
| **HU-113** | Armar la selección de perfiles de una cuenta | EP-011 | alta | M | lista | Depende de HU-229 · *Discovery 2026-10-02*: refinada sobre la edición de HU-229 |
| **HU-114** | Generar el enlace de cada destinatario sin construirlo a mano | EP-011 | alta | M | lista | Depende de HU-113 · *Discovery 2026-10-02*: refinada |
| **HU-115** | Copiar el contenido curado para enviarlo desde Gmail o HubSpot | EP-011 | alta | M | lista | Depende de HU-114 · *Discovery 2026-10-02*: refinada; la salida y la exclusión salen a HU-230 y HU-232 |
| **HU-116** | Ver quién entró por su enlace | EP-011 | alta | M | lista | Depende de HU-230, HU-112, HU-168 · *Discovery 2026-10-02*: refinada |
| **HU-117** | Reaccionar a una cuenta que no entra | EP-011 | media | S | lista | Depende de HU-230, HU-231, HU-112 · *Discovery 2026-10-02*: refinada |
| **HU-229** | Abrir la edición curada de una cuenta | EP-011 | alta | S | lista | *Discovery 2026-10-02*: (nueva): abrir la edición curada de una cuenta |
| **HU-230** | Registrar la salida de una edición curada | EP-011 | alta | S | lista | Depende de HU-114 · *Discovery 2026-10-02*: (nueva): registrar la salida; cuenta contactada para el KPI (D93) |
| **HU-231** | Vigilar la cadencia de cada cuenta | EP-011 | media | S | lista | Depende de HU-230 · *Discovery 2026-10-02*: (nueva): vigilar la cadencia de cada cuenta |
| **HU-232** | Excluir a un contacto de la distribución | EP-011 | media | S | lista | Depende de HU-229 · *Discovery 2026-10-02*: (nueva): excluir a un contacto de la distribución |
| **HU-233** | Conceder o quitar el permiso «Envíos» | EP-011 | alta | S | lista | *Discovery 2026-10-02*: (nueva): permiso «Envíos» por persona (D129, enmienda RF-8.1.2); pasa a lista |
| **HU-118** | Distinguir lo que no puedo negociar de lo que sería bueno tener | EP-009 | alta | M | lista | Depende de HU-209 · *Discovery 2026-10-02*: refinada |
| **HU-174** | Ver la evidencia de cada perfil calculada por el mismo motor que decide los resultados | EP-009 | alta | M | lista | Depende de HU-118, HU-119 · *Discovery 2026-10-02*: pasa a EP-009 (D87); el error dice «coincidencias directas» (coherente con HU-210) |
| **HU-119** | Saber por qué coincide cada perfil y por qué no | EP-003 | alta | S | lista | Depende de HU-153 · *Discovery 2026-10-02*: refinada y partida; la conexión con el motor RF-13.8 pasa a HU-174 (EP-009, D87); tipo sin plantilla → texto genérico ✓/– y registro (D96). Vuelve a borrador (antes prototipado) |
| **HU-120** | Comparar perfiles sin perder la lista | EP-003 | alta | S | lista | *Discovery 2026-10-02*: partida por INVEST (M → S); sumar y quitar desde la ficha pasan a HU-175. Vuelve a borrador (antes prototipado) |
| **HU-121** | Comparar muchos perfiles por el mismo criterio | EP-002 | alta | S | lista | Depende de HU-219, HU-119 · *Discovery 2026-10-02*: refinada y partida (la selección múltiple pasa a HU-250); en teléfono la tabla se desplaza en su contenedor (M-6) |
| **HU-250** | Marcar varios perfiles en la tabla y sumarlos a mi equipo de una vez | EP-002 | alta | S | lista | Depende de HU-121, HU-192 · *Discovery 2026-10-02*: (nueva): partida de HU-121 por INVEST; selección múltiple en un solo PATCH (D112) |
| **HU-226** | Que entre los resultados haya como máximo un espacio que no es un perfil, y solo donde no estorba | EP-002 | media | S | lista | Depende de HU-219 · *Discovery 2026-10-02*: (nueva): un solo espacio no-perfil, desde 8 resultados (RF-11, D-12) |
| **HU-019** | Responder de un toque la pregunta de Trycore sobre contratar agentes autónomos | EP-002 | media | M | lista | Depende de HU-226 · *Discovery 2026-10-02*: (nueva): sondeo de agentes autónomos en el grid, id reservado en el mapa |
| **HU-020** | No volver a ver la pregunta de Trycore cuando ya respondí o la descarté | EP-002 | media | S | lista | Depende de HU-019, HU-167 · *Discovery 2026-10-02*: (nueva): descarte y voto guardados en servidor por invitado (enmienda ADR-0004) |
| **HU-224** | Recibir en HubSpot cada respuesta al sondeo, atribuida a la cuenta y al contacto | EP-002 | media | S | lista | Depende de HU-019, HU-166 · *Discovery 2026-10-02*: (nueva): voto del sondeo a HubSpot atribuido a cuenta y contacto (RF-10.8) |
| **HU-225** | Saber si el sondeo de agentes autónomos alcanzó el umbral para pasar a I+D | EP-002 | media | S | lista | Depende de HU-019, HU-190, HU-112 · *Discovery 2026-10-02*: (nueva): lectura del umbral D-11 del sondeo en Medición |
| **HU-122** | Generar un enlace con exactamente los perfiles que elegí | EP-001 | alta | S | prototipado | *Dividida el 22-sep en 122 + 144* |
| **HU-123** | Entrar al panel con mi correo corporativo | EP-001 | alta | M | lista | Sin proveedor de identidad: correo inscrito + código (D-22 rev. 2026-09-24). *Reasignada de EP-006 a EP-001 el 2026-09-27 (T-19): la caparazón necesita el login del panel para generar enlaces (HU-122)* |
| **HU-124** | Consultar el banco sin poder modificarlo | EP-006 | media | S | lista | Depende de HU-123 · limitada a inventario, enlaces y colocados; demanda y cobertura se añaden con EP-010 (D14, 2026-09-30) |
| **HU-151** | Administrar quién entra al panel y con qué rol | EP-006 | alta | M | lista | Depende de HU-123 · nace el 2026-09-30 (D13, bloqueo B4 del DoR): RF-8.1.5 y RF-8.1.2 |
| **HU-125** | Crear un perfil eligiendo del catálogo | EP-006 | alta | M | lista | — |
| **HU-126** | Editar un perfil publicado sin sorpresas | EP-006 | alta | M | lista | — |
| **HU-127** | Registrar el consentimiento nominal del profesional | EP-006 | alta | M | lista | Exige recoger de nuevo el consentimiento del banco existente |
| **HU-128** | Ser bloqueada si intento publicar sin consentimiento o sin modalidad de prueba | EP-006 | alta | S | lista | Depende de HU-127, HU-086 y HU-125 · modalidad obligatoria para publicar (D10, 2026-09-30) |
| **HU-129** | Previsualizar la ficha exactamente como la verá el cliente | EP-006 | alta | S | lista | — |
| **HU-130** | Publicar un perfil sin esperar el reporte detallado | EP-006 | alta | S | lista | — |
| **HU-131** | Adjuntar el artefacto de evidencia tal como lo tengo | EP-006 | media | M | lista | **DIFERIDA a v2** por el sponsor el 2026-10-01 (D29): fuera del alcance de EP-006 en esta versión («hacerlo nos va a costar más en producción»); se conserva con sus AC para cuando se retome. La evidencia de esta versión es el reporte de validación que registra Talento Humano (HU-130, HU-140) · *Dividida el 22-sep* |
| **HU-132** | Actualizar la disponibilidad en dos clics | EP-006 | alta | S | lista | Condición operativa de O5 |
| **HU-133** | Pausar un perfil declarando el motivo | EP-006 | alta | S | lista | — |
| **HU-134** | Corregir incoherencias entre estado y disponibilidad | EP-006 | alta | M | lista | — |
| **HU-135** | Archivar un perfil sin perder su rastro | EP-006 | media | S | lista | — |
| **HU-136** | Revisar la bandeja de vigencia | EP-006 | alta | S | lista | Instrumento de O5 |
| **HU-137** | Ver los perfiles colocados y sus vencimientos | EP-006 | media | M | lista | Registro en el panel, que es la fuente (D8); la carga de Operaciones sale a HU-150 (D12, 2026-09-30) |
| **HU-150** | Cargar la información de colocados de Operaciones | EP-006 | media | M | lista | Depende de HU-137 · sale de HU-137 el 2026-09-30 (D12, partición, no recorte): JSON o CSV, fecha de corte, «dato desincronizado» a los más de 7 días |
| **HU-138** | Consultar quién cambió qué y cuándo | EP-006 | alta | M | lista | Depende de HU-123 |
| **HU-139** | Administrar el léxico de búsqueda | EP-006 | media | M | lista | — |
| **HU-140** | Precargar el borrador desde la modalidad de prueba | EP-006 | media | S | lista | Sin dependencia de HU-131 (D29, 2026-10-01: el borrador sale de la modalidad, no del artefacto; D11, D19) · plantilla determinista sin IA (T-2, 2026-09-25) · la marca «candidata a v2» no es un acuerdo del equipo: diferirla exige ese acuerdo |
| **HU-149** | Reconocer fecha y resultado por patrones en el artefacto | EP-006 | media | M | **descartada** | DESCARTADA por el sponsor el 2026-09-30 (D11): sin lectura automática del artefacto; la evidencia se descarga y se ve en el panel (HU-131, diferida a v2 por D29) |
| **HU-142** | Corregir solo las filas que fallaron | EP-006 | media | S | lista | Depende de HU-141 |
| **HU-143** | Retirar y fusionar valores sin romper los perfiles que los usan | EP-006 | media | M | lista | Depende de HU-089 |
| **HU-144** | Abrir el enlace y encontrar la selección que me armaron | EP-001 | alta | S | borrador | Depende de HU-122 |
| **HU-145** | Aprobar o rechazar la invitación de un colega | EP-001 | media | S | lista | Depende de HU-123 y HU-095 · dividida de HU-095 el 2026-09-27 |
| **HU-146** | Enterarme de cada enlace nuevo que piden los clientes | EP-001 | alta | S | lista | Depende de HU-123 y HU-092 · dividida de HU-092 el 2026-09-29 (sponsor: la renovación no consulta HubSpot) |
| **HU-147** | Configurar el contacto de Trycore que ve el cliente | EP-006 | media | S | lista | Depende de HU-123 · nace el 2026-09-30 (sponsor: el contacto es paramétrico desde el panel, no un dato fijo); EP-001 usa `people.service@trycore.com` fijo hasta entonces |

## Historias anticipadas sin redactar

Reservadas en el mapa de historias. Se redactan cuando entren en construcción.

> Decisiones del discovery 2026-10-02 (D52–D131; cuarta ronda D108–D123 para EP-004 y EP-005; quinta ronda D132–D131 para EP-002, EP-009, EP-010 y EP-011) en `.claude/state/evidencia/discovery-2026-10-02/decisiones-sponsor-2026-10-02.md`. El estado de cada historia está en la tabla de arriba.

| Rango | Alcance | Épica | Release |
|---|---|---|---|
| HU-001 – HU-016 | Acceso, aterrizaje curado y selección | EP-001 | MVP |
| HU-017 – HU-018 | Búsqueda por texto y ordenamiento | EP-002 | **Superadas** por HU-065 y HU-074 |
| HU-019 – HU-020 | Sondeo de agentes autónomos en el grid | EP-002 | MVP · **Redactadas el 2026-10-02** como HU-019 y HU-020, con HU-224 y HU-225 (voto a HubSpot y umbral) y HU-226 (espacio no-perfil) |
| HU-021 – HU-028 | Tarjeta, ficha y evidencia de validación | EP-003 | **Redactadas el 2026-10-02** como HU-153 a HU-159, HU-175 a HU-178, HU-191 y HU-194 (más HU-081, HU-119 y HU-120 refinadas); HU-174 nace aquí y pasa a EP-009 (D87) · MVP |
| HU-029 – HU-034 | Mi equipo, resumen y comparador | EP-004 | MVP · comparador en v1.1 · **Redactadas el 2026-10-02** como HU-192 (D88), HU-203, HU-204, HU-205 y HU-206 (D110–D114), más HU-080 y HU-175; HU-084 pasa a EP-009 (D108) y HU-207 a EP-008 (D109) |
| HU-035 – HU-041 | Solicitud, identificación y confirmación | EP-005 | MVP · redactadas como HU-096 a HU-101 y, el 2026-10-02, HU-197 a HU-201 (D116–D123); HU-099 sube de v1.1 (D116) |
| HU-042 – HU-058 | Panel de Talento Humano: inventario, validación, publicación y mantenimiento | EP-006 | **Redactadas el 2026-09-21** como HU-123 a HU-139 |
| HU-059 – HU-064 | Distribución, oportunidad en HubSpot y medición | EP-007 · EP-008 | **Redactadas** como HU-102 a HU-117 y, el 2026-10-02, HU-160 a HU-166 y HU-180 (EP-007) y HU-167 a HU-173, HU-184 a HU-190, HU-193, HU-195 y HU-196 (EP-008) · MVP, tablero incluido (*D66: HU-108, HU-111 y HU-171 suben de v1.1*) |

## Decisiones que bloquean backlog

**Ninguna de construcción.** Pendiente del sponsor **D131** (qué hacer con RF-12.2 si la prueba previa T-23 no se ejecuta): solo afecta a HU-067, HU-213 y HU-072, que siguen en draft; EP-009 arranca con sus otras 17 historias. D-16 y D-19 se cerraron el 2026-09-21 y con ellas se fue el último bloqueo. Quedan dos decisiones abiertas y ninguna detiene construcción: **D-2** (nombre del portal, afecta diseño visual) y **D-5** (detalle de la ficha, cuyo VoBo Talento Humano condicionó a ver primero la propuesta).

El backlog ya no espera a nadie. Lo que lo limita ahora es lo que no está escrito, no lo que no está decidido.

## Decisiones cerradas que ya no se rediscuten

| Decisión | Resolución |
|---|---|
| **D-1** Identificación del perfil | Nombre y primer apellido visibles, capacidad como descriptor, código al pie, sin fotografía |
| **D-4** Control de acceso del cliente | Enlace firmado + lista nominal de correos invitados + código al buzón, sesión de 30 días por dispositivo acotada a la vigencia del enlace (30 días por omisión), sin proveedor de identidad. Reenviar no da acceso; el colega se invita con aprobación de Talento Humano |
| **D-22** Acceso al panel | Correo `@trycore.com` inscrito + código de un uso + sesión de una jornada, con rol administrador y rol observador; sin proveedor de identidad |
| **D-24** Interpretación y modelo | Algoritmo propio primero (léxico + normalización + tolerancia a errores); Gemini solo para requerimientos pegados largos y para proponer léxico con aprobación humana. Desarrollo con token personal y datos ficticios; producción con llave de negocio |
| **D-23** Plataforma de la v1 | *Revisada 2026-09-25:* contenedores Docker en DigitalOcean — Next.js TypeScript + proceso de trabajo diferido + PostgreSQL administrado + Mailgun (PRD §8.3, ADR 0008–0010) |
| **D-18** Ubicación del profesional | Solo país publicado; la ciudad se carga y se cruza en la alineación |
| **D-20** Vista de banco para el comercial | Diferida hasta que exista una necesidad observada |
| **D-21** Etapas del pipeline de la línea | Las del pipeline comercial vigente, con entrada excluida del pronóstico |
| **D-6** Qué se crea en HubSpot | Negocio en pipeline propio de la línea, con propiedad de origen |
| **D-7** Si la cuenta ya tiene negocio abierto | Uno nuevo, asociado como relacionado |
| **D-9** Rango de tarifa | No, en ningún caso. Ni por perfil ni por célula |
| **D-17** Qué pasa si gana la hipótesis rival | Regla asimétrica: el rediseño se sostiene salvo victoria clara de la lista (§14.7) |
| **D-11** Umbral del sondeo de agentes | 5 cuentas con sí y 2 que piden detalle, en 3 boletines |
| **D-12** Mínimo de resultados para el espacio no-perfil | 8 resultados visibles |
| **D-13** Dueño y cadencia del registro de demanda | Talento Humano, revisión mensual |
| **D-14** Umbral de similitud del camino del cero | Sin umbral numérico: fallar exactamente un criterio, diciendo cuál |
| **D-16** Persistencia del Perfil Objetivo | **Por dispositivo, solo para el Perfil Objetivo** (acotada el 2026-09-25, T-1). Queda en el navegador de quien la escribió. **«Mi equipo» no sigue esta regla:** vive en el servidor por invitado, cada invitado ve solo el suyo, se recupera en otro dispositivo y viaja completo a la solicitud (RF-4.1) |
| **D-19** Composiciones de referencia | **Solo los tres tipos de proyecto más frecuentes.** Delivery entrega esas tres composiciones reales; fuera de ellas el portal calla |
| **D-10** Disponibilidad y vínculo laboral | **El portal no comunica el vínculo laboral** y publica un solo lenguaje de disponibilidad: banda de arranque (Inmediato, 1 semana, 2 semanas, 1 mes, Más de 1 mes), derivada de la fecha del panel. RF-3.13 nuevo; RF-3.3 reescrito |
| **D-18** Ubicación del profesional | *Revisada:* país siempre; **ciudad publicada solo en necesidad Presencial 100% o Híbrido** |
| **D-8** Alcance del panel en v1 | **CRUD completo.** El panel entra al MVP con todo el alcance. Desbloquea HU-086 y HU-087 |
| **D-3** Umbral de perfiles para producción | **25 perfiles publicados**, como condición de salida a producción |
| **D-5** Detalle de la trayectoria | Perfil profesional reescrito + Sello Personal + experiencia despersonalizada. **VoBo condicionado a ver la propuesta de ficha** (2026-09-18) |
| **D-15** Ranking por logro cuantificado | **No procede.** El dato no existe en el banco, su extracción es recurrente y es autoreportado. Lo reemplaza el Sello Personal |

## Visión documentada, no aprobada

**§14 del PRD — la bifurcación.** Dos rutas de entrada con profundidad comparable: buscar un perfil o armar el equipo por reto. No está estimada ni aprobada; está documentada para que las decisiones de hoy no la cierren.

Cuatro requisitos del MVP existen para no cerrarla, y ninguno cuesta trabajo adicional ahora: **RF-16.4** (el rol nace como lista), **RF-16.3** (especificación y recuperación separadas), **RF-15.1** (el registro guarda también los perfiles seleccionados) y tratar "Mi equipo" como embrión de célula y no como carrito.

**Disparador:** 50 solicitudes con dos o más perfiles y reto declarado, o 3 composiciones reales validadas por Delivery. *(Enmienda v4.18, D98: las tres condiciones a la vez.)*

## Próximo paso del pipeline

Priorización formal del backlog (`/trycore:priorizar`). Antes conviene correr las **tres sesiones con clientes** de PRD §13.6: sus resultados cambian la prioridad de HU-065 a HU-074 y pueden retirar la mitad de la Fase 2.
