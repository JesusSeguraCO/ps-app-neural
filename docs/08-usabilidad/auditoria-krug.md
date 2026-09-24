---
artefacto: auditoria-usabilidad
proyecto: portal-people-service
marco: Steve Krug — "Don't Make Me Think" / "Rocket Surgery Made Easy"
objeto: prototipo Mid-Fi
version: 2.0
fecha: 2026-09-15
---

# Auditoría de usabilidad — principios de Steve Krug

## Qué es y qué no es

Una revisión experta contra los principios de Krug. **No sustituye a las sesiones con clientes de PRD §13.6** — el propio Krug es explícito en que ver a tres personas usar algo vale más que cualquier opinión de experto, incluida la suya.

Su función es otra y es concreta: **quitar los problemas obvios antes de las sesiones**, para que los treinta minutos de cada participante se gasten en las preguntas que no sabemos responder y no en fricciones que ya conocíamos.

## Principios aplicados

| # | Principio | Formulación de Krug |
|---|---|---|
| P1 | No me hagas pensar | Cada página debe ser evidente por sí misma |
| P2 | No leemos, escaneamos | El diseño debe soportar el escaneo, no la lectura |
| P3 | Nos conformamos | Elegimos la primera opción razonable, no la óptima |
| P4 | Salimos del paso | No averiguamos cómo funcionan las cosas; improvisamos |
| P5 | Diseño de valla publicitaria | Jerarquía visual, convenciones, zonas definidas, ruido mínimo |
| P6 | Elimina las palabras que sobran | Quita la mitad, y después la mitad de lo que queda |
| P7 | Señales de tránsito | Dónde estoy, cómo vuelvo, dónde busco |
| P8 | Reserva de buena voluntad | No la agotes con fricción innecesaria |

## Hallazgos

### K-01 · El campo de entrada traía texto en lugar de placeholder — **corregido**
*Principios:* P1, P8.
Para escribir lo suyo, el usuario tenía que seleccionar y borrar primero. Fricción en el primer gesto del producto, y además corrompía la métrica de RF-12.1: un texto que hay que borrar sesga hacia "sugerencia sin editar".
**Arreglo:** campo vacío con placeholder; la primera sugerencia pasa a ser un chip como las demás. La métrica ahora distingue *sugerencia* de *escritura libre* correctamente.

### K-02 · Documentación escrita dentro de la interfaz — **corregido**
*Principios:* P2, P6.
Había avisos de dos y tres frases explicando por qué hacemos las cosas: la nota de verificado contra autoreportado en la ficha, la de ubicación, la de composición de referencia, la de privacidad durante la carga. Son justificaciones de PRD, no contenido de pantalla.
**Arreglo:** cada una reducida a una línea o eliminada. La distinción verificado/autoreportado sigue existiendo donde importa —en las etiquetas de cada bloque— sin el párrafo que la explicaba.

### K-03 · La búsqueda desaparecía después de buscar — **corregido**
*Principios:* P4, P7.
Para cambiar la instrucción había que volver a la pantalla anterior. Krug: la búsqueda debe estar disponible en todas partes; no es una pantalla de la que se sale.
**Arreglo:** barra de instrucción persistente y editable en la parte superior de los resultados.

### K-04 · "Perfil Objetivo" es vocabulario inventado por nosotros — **corregido**
*Principios:* P1, P4.
El usuario tenía que descifrar qué es. Nombre interno legítimo, mal rótulo de interfaz.
**Arreglo:** en pantalla se llama **"Lo que necesitas"**. "Perfil Objetivo" se conserva como nombre del artefacto en PRD, historias y modelo de datos.

### K-05 · Las tarjetas lideraban con el nombre de la persona — **corregido**
*Principios:* P2, P5.
Escanear veinte tarjetas por nombre no sirve: nadie decide por el nombre. La prominencia visual debe corresponder a la importancia para la decisión.
**Arreglo:** la capacidad pasa a ser el elemento de mayor peso; el nombre queda visible en segunda línea. **No contradice D-1** —el nombre sigue publicado— solo corrige su jerarquía.

### K-06 · El botón atrás del navegador sacaba del prototipo — **corregido**
*Principios:* P4, P7.
En una sesión con un cliente, retroceder es el primer gesto de alguien perdido. Salir del prototipo en ese momento arruina la observación.
**Arreglo:** estado de vista sincronizado con el hash de la URL y escucha de `hashchange`. El botón atrás navega dentro del portal.

### K-07 · Los chips de tecnología no parecían clicables — **corregido**
*Principios:* P1, P5.
Se veían como etiquetas estáticas. Krug: lo clicable debe ser obviamente clicable.
**Arreglo:** pasan a ser botones con signo `+` o `✓`, cambio al pasar el cursor y `aria-pressed` para lectores de pantalla.

## Hallazgos que NO se corrigieron, y por qué

| Hallazgo | Por qué se deja |
|---|---|
| **La pantalla de cero apila tres bloques** | Cada uno hace un trabajo distinto: el reto, la escasez declarada y la acción. Reducirlos requiere decidir cuál sacrificar, y esa es justamente la pregunta 3 de §13.6. Se decide con datos de sesión, no por criterio propio |
| **La barra superior del prototipo mezcla producto e instrumentación** | Es andamiaje de investigación, no interfaz de producto. Se retira al construir |
| **No hay "usted está aquí" entre resultados, ficha y equipo** | El recorrido tiene tres niveles y vuelve siempre con un enlace explícito. Añadir migas de pan agregaría ruido a un producto de sesión corta |
| **La escasez declarada (RF-14.4) puede leerse como excusa** | Es riesgo de redacción, no de usabilidad. Su prueba es con Comercial, ya registrada en el PRD |

## Segunda revisión — el panel «Lo que necesitas»

Revisado el 2026-09-16 contra los mismos ocho principios. Seis hallazgos, todos corregidos.

### K-08 · El panel se leía como un formulario — **corregido**
*Principios:* P2, P3, P5, P6.
Diez campos en una columna, la mayoría vacíos. Krug: la gente no llena formularios, se conforma con lo primero razonable. Y la pregunta 2 de las sesiones —¿reconoce el Perfil Objetivo como suyo o lo lee como formulario?— quedaba contestada de antemano por el diseño.
**Arreglo:** el panel abre con **una frase en lenguaje llano** que resume la especificación —*«Buscas un Desarrollador Móvil senior con Flutter o Kotlin, para Banca, en remoto»*— y los campos quedan detrás de un botón de **Ajustar**. Se mira primero; se llena solo si hace falta.

### K-09 · Dos controles para el mismo dato — **corregido**
*Principios:* P1, P4.
Arriba de los resultados, el bloque «Entendimos que buscas» mostraba rol, tecnologías y sector como etiquetas removibles. En el panel estaban los mismos criterios como desplegables. El usuario tenía que averiguar cuál de los dos manda.
**Arreglo:** con confianza alta, el bloque de lectura desaparece y el panel es el único editor. El bloque se conserva **solo cuando la confianza es baja o la interpretación fue degradada**, que es cuando hace falta advertir algo — y eso es exactamente lo que pide RF-12.3.

### K-10 · Tres campos de texto preguntaban casi lo mismo — **corregido**
*Principios:* P1, P6.
«El reto», «capacidades que debe cubrir» y «contexto del proyecto». Nadie puede saber qué va en cuál.
**Arreglo:** se conserva el reto —que tiene función propia en RF-13.6— y los otros dos se funden en un único **«Detalles del proyecto · opcional»**.

### K-11 · El contador no decía de qué — **corregido**
*Principio:* P1. Decía «23 perfiles», que podía ser el tamaño del banco o los que coinciden. Ahora dice **«23 cumplen»**.

### K-12 · Lo opcional ocupaba el primer lugar — **corregido**
*Principio:* P3. El campo del reto es opcional y largo, y era lo primero que veía alguien con prisa.
**Arreglo:** cuando está vacío se reduce a un enlace de una línea; cuando tiene contenido aparece bajo el resumen, como cita.

### K-13 · El panel prometía algo que no es cierto todavía — **corregido**
*Principio:* P8, reserva de buena voluntad.
Decía «se guarda con tu cuenta». La persistencia por cuenta es **D-16**, una decisión abierta con implicación de ISO 27000, y por ahora la respuesta recomendada es que no. Prometerlo en pantalla es una promesa que el producto no puede cumplir.
**Arreglo:** ahora dice **«lo conservamos mientras dure tu sesión»**, que es lo que efectivamente ocurre. Si D-16 se resuelve a favor, el texto cambia.

## Hallazgo posterior — la condición de control estaba inutilizable

Detectado el 2026-09-15 al revisar la pantalla "sin buscador", tres defectos que invalidaban el experimento antes de correrlo:

1. **Se anunciaba a sí misma como experimento.** El recuadro que explicaba la hipótesis rival lo leía el participante. Quien sabe que está en un experimento deja de usar un producto y empieza a evaluar una teoría. *Corregido:* la explicación pasó a un bloque plegado y rotulado **Solo facilitador**; el cuerpo de la pantalla no menciona ni control ni hipótesis.
2. **El recorrido no se podía completar.** Al abrir una ficha desde la lista y volver, el participante caía en la pantalla de la otra ruta. Las dos condiciones se mezclaban. *Corregido:* la ficha regresa al punto de origen, y desde la lista se arma equipo y se envía solicitud igual que en la otra ruta.
3. **Las dos rutas escribían en los mismos contadores.** Aunque la sesión saliera bien, no había con qué comparar. *Corregido:* medición separada por condición —tiempo al primer perfil, fichas abiertas, solicitudes y perfiles por solicitud— con tabla comparativa en el panel de Medición.

**Mejora adicional:** la lista pasó de ser un listado plano ordenado por rol a estar agrupada por familia con accesos rápidos y conteo. Un control debe ser la **mejor versión posible** de la hipótesis rival, no un hombre de paja: si la lista pierde, tiene que perder en buena lid.

## Lo que esta auditoría no puede responder

Krug clasifica los problemas por gravedad observada, no por gravedad supuesta. Nada de lo anterior sustituye estas cinco preguntas, que solo se responden mirando:

1. ¿El cliente escribe en el campo abierto o espera una lista?
2. ¿Reconoce "Lo que necesitas" como suyo o lo lee como formulario?
3. ¿Qué hace cuando no hay coincidencia?
4. ¿Qué mira primero en una tarjeta sin fotografía?
5. ¿Cuánto tiempo está dispuesto a invertir?

**Protocolo sugerido, siguiendo *Rocket Surgery*:** tres participantes, treinta minutos cada uno, una mañana. Pensar en voz alta. El facilitador no explica nada; si hay que explicar algo, eso ya es el hallazgo. Al terminar, listar los tres problemas más graves y aplicar a cada uno **lo mínimo que se pueda hacer** para resolverlo. Repetir mensualmente.

## Nota de método

Los siete hallazgos anteriores son míos, sobre un diseño mío. Eso los hace sospechosos en un sentido preciso: **encontré lo que sé buscar.** Un evaluador que no haya construido esto encontraría otras cosas, y un usuario real encontrará las que ninguno de los dos anticipó.
