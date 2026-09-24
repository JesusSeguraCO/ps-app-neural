---
artefacto: escalamiento-de-decisiones
proyecto: portal-people-service
prd_version: 3.1
version: 1.0
fecha: 2026-09-16
decisiones_abiertas: 7
---

# Decisiones abiertas — qué necesitamos de cada equipo

> Cada bloque está redactado para reenviarse tal cual. Contiene qué se pregunta, por qué bloquea, qué hay que traer y qué pasa si no se decide.
> Referencia completa: PRD §12.3.

---

## Para Talento Humano — Karen

Cuatro decisiones abiertas más una carga de datos. Son una sola conversación si llega con los datos a la mano. **Es el equipo que más desbloquea de golpe.**

### D-18 · ~~¿Incorporamos país y ciudad del profesional al banco?~~ — **CERRADA el 2026-09-16**

**Resolución.** Se publica **solo el país**. La ciudad se carga pero no se publica: queda disponible para Delivery y se cruza en la sesión de alineación.

**Por qué.** El país resuelve lo que más pesa —si el talento está en el país de la operación— sin agregar una precisión que facilite el contacto directo con el profesional, riesgo ya elevado tras publicar nombre y trayectoria.

**Lo que sigue necesitándose de Talento Humano, y ya no es una decisión sino una carga de datos:** país y ciudad de cada perfil publicado, tomados de la hoja de vida. El país sale al portal; la ciudad se queda adentro.

### D-3 · ¿Cuántos perfiles publicados como mínimo para salir a producción?

**Qué se decide.** El umbral por debajo del cual no lanzamos.

**Por qué importa.** Con el banco actual, dos o tres criterios combinados dejan uno o dos resultados. Un portal que devuelve vacío en la mayoría de búsquedas no se lee como selectivo: se lee como pobre, y eso ocurre frente a una cuenta que ya tiene contrato.

**Lo que hay que traer.** Cuántos perfiles pueden sostenerse publicados y actualizados de forma permanente, no cuántos existen en total.

**Nuestra propuesta.** 20 como piso.

### D-10 · ¿Cómo se comunica la disponibilidad de los perfiles no vinculados laboralmente?

**Qué se decide.** Si la fecha de disponibilidad de alguien que no tiene contrato con Trycore se muestra igual que la de quien sí lo tiene. *(Esta se decide junto con Dirección Comercial.)*

**Por qué importa.** Una fecha que después no se sostiene hace el mismo daño que una insignia falsa, y en una cuenta activa cuesta más caro. El portal ya distingue el vínculo en su modelo de datos; falta decidir qué se le muestra al cliente.

**Opciones.** Un solo estado · Dos estados, confirmada y sujeta a confirmación · No publicar fecha para perfiles no vinculados.

**Nuestra propuesta.** Dos estados. Ocultar la diferencia se descubre en la primera reunión.

### D-8 · ¿Hasta dónde llega el panel de administración en la primera versión?

**Qué se decide.** El alcance del panel que usará Talento Humano. *(Se decide junto con el CTO.)*

**Por qué importa.** Todo el panel es un CRUD estándar salvo una cosa: la carga asistida, que lee el artefacto de evidencia —video, documento, repositorio o transcripción— y propone el borrador del bloque de validación. Eso tiene complejidad real de construcción. El resto no.

**Lo que hay que traer.** Cuánto trabajo por perfil es sostenible sin la asistencia, sabiendo que el texto de cada modalidad de prueba ya viene escrito en el catálogo y que seleccionarla es un clic.

**Opciones.** CRUD completo · CRUD sin carga masiva · Solo actualización de disponibilidad.

### D-5 · VoBo sobre el detalle de la trayectoria en la ficha

**Qué se decide.** Nada nuevo: confirmar lo que ya está implementado.

**Por qué importa.** Sin nombre destacado, la humanidad de la ficha la cargan el perfil profesional reescrito, las tres competencias del Sello Personal y la experiencia despersonalizada. Está construido y se puede ver en el prototipo. Solo falta su aprobación formal.

**Cómo resolverla.** Mostrarle la ficha en el prototipo y preguntarle si eso es lo que quiere que lea un cliente sobre una persona de su equipo.

---

## Para Tecnología — Jonathan

### D-16 · ¿Podemos persistir la especificación del cliente contra la cuenta?

**Qué se decide.** Si el Perfil Objetivo —la especificación de lo que el cliente necesita— se guarda asociado a la cuenta o solo dura la sesión.

**Por qué importa, y por qué es la de mayor riesgo.** El acceso al portal es por enlace firmado, sin credenciales, y ese enlace es reenviable dentro de la empresa del cliente, cosa que además es deseable. Guardar contra "cuenta" cuando no hay autenticación real significa que la especificación de un cliente viaja con el enlace hacia quien sea que lo reciba. **Hay implicación de ISO 27000.**

**Lo que hay que traer.** Si el modelo de acceso admite persistencia por cuenta con garantías suficientes, o si hay que esperar a que exista autenticación.

**Opciones.** Viable · Solo por sesión hasta que haya autenticación.

**Nuestra propuesta.** Solo por sesión. Es reversible hacia arriba; lo contrario no.

**Nota adicional que no es decisión pero sí es suya.** El PRD fija que el rol del Perfil Objetivo nace como lista aunque la primera versión use un solo elemento, y que la capa de especificación se mantiene separada de la de recuperación. Ambas son baratas ahora y caras después; conviene que las conozca antes de estimar.

---

## Para Delivery

### D-19 · ¿Existen composiciones reales de los proyectos que hemos entregado?

**Qué se decide.** Si el portal puede mostrarle al cliente la forma típica del trabajo que va a emprender: qué capacidades suelen requerir los proyectos como el suyo, y cuáles cubre su selección.

**Por qué importa.** Cuando el cliente busca un perfil, su meta real no es contratar a alguien: es que su proyecto salga. Mostrarle la composición típica lo acompaña en esa meta. Pero solo funciona si los números son verdaderos.

**La regla dura.** Las composiciones salen de proyectos entregados, no de lo que conviene vender. Una composición inventada para inflar la solicitud es humo del peor tipo y un director de proyecto con experiencia la detecta de inmediato. **Si el dato no existe, no se muestra** — mismo criterio con el que descartamos el logro cuantificado.

**Lo que hay que traer.** De los tipos de proyecto más frecuentes, qué roles compusieron el equipo y en cuántos proyectos. Mejor tres composiciones verdaderas que cinco presentables.

**Opciones.** Composiciones reales de todos los tipos · Solo los 3 más frecuentes · No se hace.

**Dependencia adicional.** Para la pestaña de perfiles colocados del panel necesitamos el espejo de las asignaciones vigentes con su fecha de vencimiento. Es de solo lectura: la fuente de verdad sigue siendo el sistema de asignación.

---

## Para Dirección Comercial

### D-10 · Disponibilidad de perfiles no vinculados *(compartida con Talento Humano)*

Ver el bloque de Talento Humano. La parte comercial es qué se le puede prometer a una cuenta activa sobre una fecha que no controlamos.

### Confirmaciones sobre lo ya decidido

Tres decisiones se tomaron con criterio de Mercadeo y conviene que Comercial las ratifique:

- **La solicitud crea un negocio en un pipeline propio de People Service**, con las etapas del pipeline comercial vigente y la etapa de entrada excluida del pronóstico. Requiere una propiedad de origen para distinguir lo que entra por el portal.
- **Si la cuenta ya tiene un negocio abierto, se crea uno nuevo asociado como relacionado.** Actualizar el existente borraría la atribución de origen y con ella la medición del proyecto.
- **El portal no muestra tarifas en ningún caso**, ni por perfil ni por célula.

**Consecuencia operativa que hay que aceptar explícitamente:** con pipeline aparte, el comercial no verá la solicitud por casualidad. La notificación automática deja de ser cortesía y pasa a ser el mecanismo que evita que una solicitud exista y nadie la atienda.

---

## Para Dirección General — Carlos

### VoBo sobre la regla de decisión de las sesiones

No es una decisión abierta: es una regla ya redactada que necesita su aval **antes** de que las sesiones ocurran.

El rediseño se sostiene por defecto. Solo se reduce el alcance si los tres participantes completan la tarea con la lista simple y al menos dos lo hacen con menos fricción visible que por la ruta de instrucción. Empate o resultados mixtos es evidencia insuficiente, no un voto a favor de la lista.

**Por qué necesita avalarse antes.** Tres personas no miden, descartan. Y si la regla se fija después de ver los datos, cualquier resultado se acomoda a lo que cada quien ya prefería.

---

## Para Mercadeo — pendiente propio

### D-2 · Nombre del portal

No se resuelve eligiendo en una tabla; es trabajo creativo. Restricciones ya fijadas: no puede ser el nombre de la línea, no puede insinuar catálogo de personas, y tiene que sobrevivir a que un CTO de banca lo lea en un correo.

Hoy la cabecera del prototipo dice "People Service", que es exactamente lo que la decisión dice que no debe ser.

---

## Resumen para seguimiento

| # | Decisión | Dueño | Bloquea |
|---|---|---|---|

| D-3 | Mínimo de perfiles publicados | Talento Humano + Delivery | Fecha de lanzamiento |
| D-10 | Disponibilidad de no vinculados | Talento Humano + Comercial | Credibilidad del portal |
| D-8 | Alcance del panel en v1 | Talento Humano + CTO | Estimación de esfuerzo |
| D-5 | VoBo del detalle de la ficha | Talento Humano | Trámite |
| D-16 | Persistencia por cuenta | CTO | RF-13.4 · ISO 27000 |
| D-19 | Composiciones de referencia | Delivery | RF-14.7 |
| D-2 | Nombre del portal | Mercadeo | Diseño visual |

**Lo que no depende de nadie más:** las tres sesiones con clientes. Cinco preguntas, treinta minutos por persona, una mañana, sin desarrollo. Pueden retirar la mitad del rediseño antes de que se escriba una línea de código.
