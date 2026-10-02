---
id: flow-003-evidencia-del-perfil
epica: EP-003
historias_cubiertas: [HU-081, HU-119, HU-120, HU-153, HU-154, HU-155, HU-156, HU-157, HU-158, HU-159, HU-174, HU-175, HU-176, HU-177, HU-178, HU-191]
---

# Flow 003 — Evidencia del perfil

## Resumen

Cómo el cliente evalúa un perfil y entiende por qué coincide, y cómo Talento Humano deja en el panel la evidencia que la ficha muestra. Actores: el **Cliente** (líder de área o de proyecto) y **Talento Humano** (rol administrador de inventario). Condición de éxito: el cliente distingue un perfil de otro por evidencia verificada, no por adjetivos, pasa al siguiente sin perder la lista, y ningún perfil nuevo se publica sin sus tres validaciones de entrada.

**Orden de construcción (D60):** el diagrama del panel es el **sub-slice inicial** de EP-003 (HU-177 → HU-176 → HU-178 → HU-191). Toca el panel que construyó EP-006, que sigue cerrada.

## Diagrama — sub-slice inicial: evidencia de entrada en el panel

```mermaid
sequenceDiagram
  participant TH as Talento Humano
  participant PA as Panel
  participant P as Portal

  Note over TH,PA: Precondición — entró al panel con su correo inscrito y el código de un uso (HU-123, EP-001)

  %% HU-177
  TH->>PA: Crea un alcance SARO con su texto de cara al cliente
  %% HU-177
  PA-->>TH: El alcance queda disponible en el editor; no se admite texto libre

  %% HU-177
  alt Alcance idéntico salvo mayúsculas
    %% HU-177
    PA-->>TH: Impide crearlo y señala el que ya existe
  end

  %% HU-177
  alt Corrige el texto de un alcance en uso
    %% HU-177
    PA-->>TH: Avisa cuántas fichas publicadas cambian; al confirmar, las actualiza y lo registra en el historial
  end

  %% HU-177
  alt Desactiva un alcance en uso
    %% HU-177
    PA-->>TH: Deja de ofrecerlo; los perfiles que lo tienen lo conservan; no se borra
  end

  %% HU-176
  TH->>PA: Elige el alcance SARO, su fecha y la fecha DISC, y guarda
  %% HU-176
  PA-->>TH: Guarda los tres datos y la vista previa de la ficha los muestra

  %% HU-176
  alt Fecha futura
    %% HU-176
    PA-->>TH: No guarda y explica que una verificación no puede ser posterior a hoy
  end

  %% HU-176
  alt Intenta publicar sin SARO o sin fecha DISC
    %% HU-176
    PA-->>TH: Bloquea la publicación, dice exactamente qué falta y lleva al campo
  end

  %% HU-176
  alt Corrige el dato de un perfil publicado
    %% HU-176
    PA->>P: Tras confirmar, la ficha muestra el dato nuevo y el historial lo registra
  end

  %% HU-178
  TH->>PA: Abre el listado de perfiles
  %% HU-178
  PA-->>TH: Marca «Incompleto: falta …» los publicados sin una validación de entrada; siguen visibles en el portal

  %% HU-178
  alt Edita un publicado incompleto sin completarlo
    %% HU-178
    PA-->>TH: El cambio no se publica; pregunta si descarta el cambio o pasa el perfil a borrador
  end

  %% HU-178
  alt Completa lo que falta
    %% HU-178
    PA->>P: Publica el cambio y retira la marca
  end

  %% HU-178
  alt Le falta solo el Sello Personal
    %% HU-178
    PA-->>TH: No lo marca como incompleto: el Sello Personal es opcional
  end

  %% HU-178
  alt Completa el último publicado incompleto
    %% HU-178
    PA->>P: Con 0 incompletos, el encabezado del estándar vuelve a afirmar «ninguno»
  end

  %% HU-191
  TH->>PA: Pega una hoja con alcance SARO, fecha SARO y fecha DISC de muchos perfiles
  %% HU-191
  PA-->>TH: Vista previa; al confirmar, los publicados quedan completos, siguen publicados y pierden la marca
  %% HU-191
  alt Alcance que no está en el catálogo
    %% HU-191
    PA-->>TH: Fila con error y el valor exacto; no se ofrece como valor nuevo
  end
  %% HU-191
  alt Fecha futura o ilegible
    %% HU-191
    PA-->>TH: Fila con error y su motivo, sin aplicarse
  end
  %% HU-191
  alt Vaciar una validación de un publicado
    %% HU-191
    PA-->>TH: Fila con error; el perfil conserva el dato y sigue publicado
  end
  %% HU-191
  TH->>PA: Exporta el banco o descarga la plantilla
  %% HU-191
  PA-->>TH: Trae las tres columnas, con el alcance como está en el catálogo

  %% HU-154
  alt La trayectoria usa lenguaje de inventario
    %% HU-154
    PA-->>TH: Advierte y señala la expresión, sin impedir guardar ni publicar
  end
```

## Diagrama — el cliente evalúa el perfil

```mermaid
sequenceDiagram
  participant C as Cliente
  participant P as Portal

  %% HU-159
  C->>P: Entra a la selección, al banco o al encuadre sin selección
  %% HU-159
  P-->>C: Antes de lo primero que evalúa, declara una vez el estándar en cuatro dimensiones
  %% HU-159
  alt Cero publicados incompletos
    %% HU-159
    P-->>C: Afirma que ningún perfil llega sin SARO, prueba técnica y DISC
  else Queda al menos un publicado incompleto
    %% HU-159
    P-->>C: Describe lo que el estándar exige, sin afirmar «ninguno»
  end
  %% HU-159
  P-->>C: Muestra el respaldo del servicio y el SLA de 10 días hábiles
  %% HU-159
  alt Teléfono
    %% HU-159
    P-->>C: El encabezado no bloquea ni se superpone a la lista
  end

  %% HU-153
  C->>P: Recorre las tarjetas
  %% HU-153
  P-->>C: Cada tarjeta lidera con la capacidad y el nombre; código al pie, sin foto
  %% HU-153
  alt Disponibilidad vencida y sin actualizar
    %% HU-153
    P-->>C: La banda dice «Por confirmar»
  end
  %% HU-153
  alt Más de 5 tecnologías y sin sector
    %% HU-153
    P-->>C: Muestra las 5 primeras por orden de carga y omite el sector sin hueco
  end

  %% HU-081
  P-->>C: Cada tarjeta muestra las tres competencias del Sello Personal, sin insignias
  %% HU-081
  alt Perfil sin Sello Personal (opcional)
    %% HU-081
    P-->>C: La tarjeta omite el bloque sin dejar hueco ni texto de relleno
  end

  %% HU-119
  C->>P: Busca con criterios
  %% HU-119
  P-->>C: Tarjeta y ficha muestran una línea ✓/– por criterio, determinista y sin porcentaje
  %% HU-119
  alt Sin criterios activos
    %% HU-119
    P-->>C: No muestra ningún bloque de evidencia ni deduce coincidencias de la selección
  end
  %% HU-119
  alt El perfil no tiene el dato de un criterio
    %% HU-119
    P-->>C: La línea aparece como no cumplida, nunca como cumplida por omisión
  end

  %% HU-174
  P-->>C: La evidencia, los resultados y el conteo de deseables salen de la misma evaluación del motor
  %% HU-174
  alt El perfil falla un obligatorio
    %% HU-174
    P-->>C: No aparece en los resultados
  end
  %% HU-174
  alt Opción que no existe en el banco
    %% HU-174
    P-->>C: No produce línea ni cuenta como deseable
  end
  %% HU-174
  alt Quita un criterio
    %% HU-174
    P-->>C: La línea desaparece y el conteo se actualiza en la misma respuesta
  end

  %% HU-120
  C->>P: Abre la ficha
  %% HU-120
  P-->>C: Panel lateral sobre la lista, con la posición «n de N» y anterior / siguiente
  %% HU-120
  alt Primer o último perfil de la lista
    %% HU-120
    P-->>C: Desactiva la navegación en ese extremo, sin salto circular
  end
  %% HU-120
  alt Teléfono
    %% HU-120
    P-->>C: La ficha ocupa la pantalla completa
  end
  %% HU-120
  C->>P: Cierra la ficha
  %% HU-120
  P-->>C: Vuelve a la misma lista, con el mismo filtro y en la misma posición

  %% HU-175
  C->>P: Suma o quita el perfil del equipo desde la ficha
  %% HU-175
  P-->>C: Actualiza el indicador del equipo sin cerrar la ficha
  %% HU-175
  alt El servidor no puede guardar el equipo
    %% HU-175
    P-->>C: Dice que no se pudo y no cambia el indicador
  end
  %% HU-175
  alt El perfil ya estaba en el equipo
    %% HU-175
    P-->>C: Lo indica y ofrece quitarlo, no sumarlo otra vez
  end

  %% HU-154
  P-->>C: La ficha separa «Verificado por Trycore» de «Declarado por la persona»
  %% HU-154
  alt La trayectoria describe un trabajo técnico
    %% HU-154
    P-->>C: Aparece solo como declarado, nunca como validación técnica
  end
  %% HU-154
  P-->>C: Nunca muestra motivación ni datos de la lista negra B.4

  %% HU-155
  C->>P: Despliega la validación técnica
  %% HU-155
  P-->>C: Cinco campos fijos (prueba, qué se evaluó, resultado, evaluador, fecha), sin puntaje
  %% HU-155
  alt Solo Nivel 0
    %% HU-155
    P-->>C: Muestra la modalidad sin fecha, sin campos vacíos
  end
  %% HU-155
  P-->>C: No enlaza el artefacto; dice que se revisa en la sesión de alineación

  %% HU-156
  P-->>C: Verificación SARO con alcance y fecha, y evaluación DISC con fecha y competencias
  %% HU-156
  alt Perfil publicado antes de la regla, sin SARO o sin fecha DISC
    %% HU-156
    P-->>C: Omite esa línea sin afirmarla y sin marca de «incompleto»
  end
  %% HU-156
  alt DISC con fecha y sin Sello Personal
    %% HU-156
    P-->>C: Muestra la evaluación con su fecha, sin hueco de competencias
  end

  %% HU-157
  P-->>C: La conversación va por Trycore, con su contacto; sin vía directa a la persona
  %% HU-157
  alt Cualquier vínculo interno
    %% HU-157
    P-->>C: El mismo texto de representación, sin declarar el vínculo
  end

  %% HU-158
  P-->>C: Cierra con condiciones operativas, SLA visible y la garantía del servicio
  %% HU-158
  P-->>C: El código aparece solo al pie, como referencia para citarlo
```

## Trazabilidad

| Paso | HU | AC |
|---|---|---|
| Crear un alcance SARO | HU-177 | AC-1 (happy) |
| Alcance duplicado | HU-177 | AC-2 (error) |
| Corregir un alcance en uso | HU-177 | AC-3 (edge) |
| Desactivar un alcance en uso | HU-177 | AC-4 (edge) |
| Registrar SARO y DISC | HU-176 | AC-1 (happy) |
| Fecha futura | HU-176 | AC-2 (error) |
| Bloqueo de publicación con motivo | HU-176 | AC-3 (error) |
| Corregir el dato de un publicado | HU-176 | AC-4 (edge) |
| Marca «Incompleto: falta …» | HU-178 | AC-1 (happy) |
| Editar un incompleto sin completarlo | HU-178 | AC-2 (error) |
| Completar lo que falta | HU-178 | AC-3 (edge) |
| Completar el último incompleto (D80) | HU-178 | AC-4 (edge) |
| El Sello Personal no marca incompleto | HU-178 | AC-5 (edge) |
| Completar por importación | HU-191 | AC-1 (happy) |
| Plantilla y exportación con las tres columnas | HU-191 | AC-2 (happy) |
| Alcance fuera del catálogo | HU-191 | AC-3 (error) |
| Fecha futura o ilegible | HU-191 | AC-4 (error) |
| Vaciar una validación de un publicado | HU-191 | AC-5 (edge) |
| Aviso de lenguaje de inventario | HU-154 | AC-4 (edge) |
| Encabezado del estándar | HU-159 | AC-1 (happy) |
| Respaldo y SLA | HU-159 | AC-2 (happy) |
| «Ninguno» solo con 0 incompletos (D80) | HU-159 | AC-3 (edge) |
| Encabezado en el teléfono | HU-159 | AC-4 (edge) |
| Capacidad en la tarjeta | HU-153 | AC-1 (happy) |
| Disponibilidad vencida | HU-153 | AC-2 (error) |
| Más de 5 tecnologías y sin sector | HU-153 | AC-3 (edge) |
| Competencias en la tarjeta | HU-081 | AC-1 (happy) |
| Perfil sin Sello Personal | HU-081 | AC-2 (error) |
| Evidencia por criterio, también lo no cumplido | HU-119 | AC-1 (happy) |
| Sin criterios activos | HU-119 | AC-2 (error) |
| Dato ausente = no cumplido | HU-119 | AC-3 (edge) |
| Evidencia del motor | HU-174 | AC-1 (happy) |
| Falla un obligatorio | HU-174 | AC-2 (error) |
| Opción fuera del banco | HU-174 | AC-3 (edge) |
| Quitar un criterio | HU-174 | AC-4 (edge) |
| Panel lateral con posición | HU-120 | AC-1 (happy) |
| Extremos de la lista | HU-120 | AC-2 (error), AC-3 (edge) |
| Cerrar vuelve a la misma lista | HU-120 | AC-4 (edge) |
| Sumar o quitar desde la ficha | HU-175 | AC-1, AC-2 (happy), AC-3 (alterno) |
| Fallo al guardar el equipo | HU-175 | AC-4 (error) |
| Ya estaba en el equipo | HU-175 | AC-5 (edge) |
| Verificado frente a declarado | HU-154 | AC-1 (happy) |
| Experiencia nunca como validación | HU-154 | AC-2 (edge) |
| Lista negra B.4 | HU-154 | AC-3 (error) |
| Validación técnica en cinco campos | HU-155 | AC-1 (happy) |
| Solo Nivel 0 | HU-155 | AC-2 (error) |
| Sin artefacto | HU-155 | AC-3 (edge) |
| SARO y DISC en la ficha | HU-156 | AC-1 (happy) |
| Dato heredado ausente | HU-156 | AC-2 (error) |
| DISC sin Sello Personal | HU-156 | AC-3 (edge) |
| Sin puntaje por dimensión | HU-156 | AC-4 (edge; no se diagrama: es una prohibición) |
| La conversación va por Trycore | HU-157 | AC-1 (happy), AC-2 (error) |
| Vínculo no declarado | HU-157 | AC-3 (edge) |
| Cierre de la ficha | HU-158 | AC-1 (happy), AC-2 (edge) |
| Código al pie | HU-158 | AC-3 (edge) |

## Notas

**Alineado con HU-119 el 2026-10-02.** El diagrama anterior decía que el dato ausente se declaraba «como ausente, no como incumplido» y que, sin criterios activos, el portal «explicaba qué la habilita». HU-119 dice otra cosa y gana la historia: el dato ausente es **no cumplido** («– Sin idioma declarado: Inglés»), nunca cumplido por omisión, y sin criterios activos **no hay bloque de evidencia**. Sumar desde la ficha pasó de HU-120 a HU-175 (con quitar, por D73).

**Decisiones del sponsor reflejadas (2026-10-02):** D59 (cinco campos de la validación técnica), D60 (sub-slice inicial en el panel), D61 (SARO y DISC obligatorios; catálogo de alcances), D62 y D63 (publicados incompletos siguen visibles y marcados; tres validaciones obligatorias; Sello Personal opcional), D64 (cuatro dimensiones) y D73 (5 tecnologías por orden de carga, quitar desde la ficha, sin «Escribir a Trycore», el panel advierte el lenguaje de inventario, Nivel 0 sin fecha, encabezado también en el encuadre). Fuente: `.claude/state/evidencia/discovery-2026-10-02/decisiones-sponsor-2026-10-02.md`.

**Segunda ronda (2026-10-02): D80 y D81.** D80: el encabezado del estándar afirma «ningún perfil sin SARO, DISC y validaciones» **solo con 0 publicados incompletos**; mientras quede uno, describe el estándar sin afirmarlo (HU-159 y HU-178, alt nuevos). D81: la importación masiva y su plantilla llevan las columnas SARO alcance (validado contra el catálogo), SARO fecha y DISC fecha; como sacaba a HU-176 de M, nace **HU-191** en el sub-slice inicial, detrás de HU-176.

**HU-079 (reconocer de un vistazo qué ha logrado un perfil) está descartada y no se diagrama.** D-15 la cerró: el logro cuantificado no existe en el banco entregado por Talento Humano, extraerlo tiene costo recurrente y es autoreportado por naturaleza. Lo reemplazan las tres competencias del Sello Personal (RF-14.1).

**La calidad de este flujo depende de D-5**, abierta. Con el nombre publicado (D-1 revertida), el grado de detalle de la trayectoria es lo único que carga la humanidad de la ficha. D-5 no bloquea la construcción.

**La deuda de mapa anterior queda cubierta:** la ficha en cuatro bloques (RF-3.2) la cubren HU-154 a HU-158; el estándar declarado arriba, HU-159; la garantía Neural Speed, HU-158. Sigue abierta la deuda de **EP-004**: sumar y quitar a «Mi equipo» no tiene historia redactada, y HU-175 depende de ella.
