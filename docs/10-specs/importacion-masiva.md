---
artefacto: especificacion-funcional
proyecto: portal-people-service
componente: Importación masiva de perfiles
prd_version: 3.5
version: 2.2
fecha: 2026-09-16
estado: construido y verificado en el prototipo Mid-Fi
referencia: patrones de importación de HubSpot y Salesforce
---

# Especificación — Importación masiva de perfiles

## 0. Estado

Construido en el prototipo Mid-Fi, pestaña **Importar** del panel de Talento Humano. Verificado contra los ocho casos de esta especificación, incluida la prueba de ida y vuelta: exportar el banco y reimportarlo sin tocarlo deja las 23 filas en «sin cambios».

## 1. Qué resuelve

Crear o actualizar muchos perfiles a la vez sin abrirlos uno por uno. Los dos casos reales son la carga inicial del banco y las actualizaciones periódicas de disponibilidad, que hoy Talento Humano mantiene en otra parte.

## 2. La premisa que hay que corregir primero

**Quien importa no tiene un JSON: tiene una hoja de cálculo.** En los flujos de importación de HubSpot y Salesforce, el camino humano es subir un archivo tabular y mapear columnas; el JSON es el camino de máquina —lo que produce una integración o un agente—.

El asistente **acepta los dos y detecta cuál recibió**:

| Entrada | Cómo llega | Quién la usa |
|---|---|---|
| **Celdas pegadas desde una hoja de cálculo** (TSV) | Copiar un bloque de Excel o Google Sheets y pegar | Talento Humano. Es el camino principal |
| **CSV pegado o cargado** | Archivo exportado de cualquier herramienta | Talento Humano |
| **JSON** | Pegado o producido por una integración | Tecnología, agentes, sincronizaciones |

La detección es automática: si empieza por `[` o `{` es JSON; si la primera línea tiene tabuladores es TSV; si tiene comas y comillas balanceadas es CSV. Si hay ambigüedad, se pregunta.

## 3. Qué NO hace, y por qué

| No hace | Razón |
|---|---|
| **No borra perfiles, nunca, ni de a uno** | Irreversible y sin caso de uso legítimo. Lo que se necesita es archivar, que conserva la trazabilidad de lo que se mostró en solicitudes pasadas |
| **No concede consentimiento** | Si el consentimiento se pudiera otorgar pegando un archivo, el bloqueo de publicación de RF-8.4 se saltaría con un pegado. Puede **revocarlo**, nunca concederlo |
| **No publica** | Ninguna importación pone un perfil en *publicado*. Los nuevos llegan a **borrador** y alguien los publica con la ficha a la vista |
| **No dictamina el resultado de la validación técnica** | Puede traer modalidad y fecha; el resultado proviene del registro de evaluación interna |
| **No toca campos que no vengan en la fila** | Ver §5 |

## 4. Llave de identidad y modo de importación

### 4.1 La llave es `codigo`

Obligatoria en toda fila. Es el criterio de deduplicación, equivalente al *record ID* de un CRM.

### 4.2 Modo de importación — se elige antes de procesar

Los CRM siempre lo preguntan, y por una razón concreta: sin este control, un archivo destinado a actualizar disponibilidad crea perfiles fantasma por un código mal escrito.

| Modo | Código existente | Código nuevo |
|---|---|---|
| **Crear y actualizar** *(por omisión)* | Actualiza | Crea en borrador |
| **Solo actualizar** | Actualiza | **Se omite y se reporta**, no crea |
| **Solo crear** | **Se omite y se reporta**, no toca | Crea en borrador |

### 4.3 Duplicados dentro del mismo archivo

Dos filas con el mismo código son un **error**, no un «gana la última». Se muestran ambas y la importación no procede hasta resolverlo. Una regla de precedencia silenciosa aplica un cambio que nadie decidió.

### 4.4 Idempotencia

Reimportar el mismo archivo no duplica nada ni cambia nada: todas las filas caen en *sin cambios*.

## 5. Semántica de la actualización — fusión, no reemplazo

**Solo se modifica lo que viene en la fila.** Una fila con `codigo` y `disponibleDesde` actualiza la disponibilidad y deja intacto todo lo demás.

Es la decisión más importante de la especificación. El reemplazo total es la alternativa obvia y es peligrosa: un archivo abreviado borraría en silencio el Sello Personal, la experiencia y la validación de cada perfil que toque.

### 5.1 Ausente, vacío y nulo — la distinción que evita el bug clásico

| En la fila | Efecto |
|---|---|
| **Campo ausente** (la columna no existe o la clave no está) | No se toca |
| **Celda vacía o cadena vacía** | **No se toca.** Una hoja de cálculo se llena de celdas vacías sin intención |
| **`null` explícito**, o el literal `[vaciar]` en formato tabular | **Se vacía el campo.** Es la única forma deliberada de borrar un valor |

Sin esta regla nadie puede vaciar un campo a propósito, ni evitar vaciarlo por accidente.

### 5.2 Reemplazo total

Si alguna vez se necesita, es una casilla explícita, apagada por omisión, con advertencia y contando cuántos campos se vaciarían en cuántos perfiles.

## 6. El asistente, paso a paso

### Paso 1 · Origen

Área para pegar o cargar, con tres ayudas:

- **Descargar plantilla de muestra**, en hoja de cálculo y en JSON. Trae las columnas con **tres ejemplos que cubren los tres casos**: actualizar un campo de un perfil existente, crear uno nuevo con todos sus datos, y archivar uno. Quien la abre entiende el formato sin leer documentación.
- **Exportar el banco actual**, en hoja de cálculo y en JSON. La forma más confiable de obtener el formato correcto es sacar lo que ya existe, editarlo y devolverlo.
- **Nota de formato visible junto a los botones:** las listas van en una sola celda separadas por punto y coma; una celda vacía no cambia nada;  borra el campo a propósito.

**Si el navegador bloquea la descarga** —cosa que ocurre en vistas incrustadas— el contenido se muestra en un área de texto para copiarlo. La funcionalidad no depende de que la descarga funcione.

Validación inmediata: formato reconocible, raíz correcta, y límite de filas por importación.

### Paso 2 · Mapeo de campos

Solo aparece cuando hace falta: si las columnas o claves no coinciden con el esquema.

- Cada columna del archivo se empareja con un campo del perfil, o se marca **no importar**.
- El emparejamiento se propone automáticamente por nombre.
- **Las plantillas de mapeo se guardan y se reutilizan**, porque la misma persona importa el mismo formato todos los meses.
- Una columna sin emparejar no bloquea: se ignora y se informa.

### Paso 3 · Vista previa

Cada fila se presenta como una **tarjeta de perfil colapsada**, agrupada por resultado con su conteo:

| Bloque | Qué contiene | Qué muestra al expandirse |
|---|---|---|
| **Nuevos** | Códigos que no existen | La ficha resultante completa |
| **Actualizados** | Códigos existentes con cambios | **Solo los campos que cambian**, valor anterior y nuevo enfrentados |
| **Archivados** | Filas con `estado: archivado` | El perfil que sale del banco |
| **Sin cambios** | La fila es idéntica a lo que ya hay | Nada. Existe para que los números cuadren |
| **Omitidos** | Excluidos por el modo de importación | El motivo |
| **Con error** | Sin código, duplicado, tipo inválido, valor fuera de rango | El error concreto y la fila tal como vino |

**Cada tarjeta se puede desmarcar** para excluirla. No hay que corregir el archivo entero por una fila.

**Los valores nuevos se destacan.** Un rol, una tecnología o un sector que no existe hoy en el banco se marca como *valor nuevo en la taxonomía*. No se bloquea —el banco es la fuente de la taxonomía y ampliarla es legítimo— pero un error de digitación crea una tecnología fantasma que contamina los filtros para siempre, y verlo antes cuesta un segundo.

**Las incoherencias de RF-8.14 se evalúan aquí**, no después: un perfil colocado cuya disponibilidad quede antes del fin de su asignación se marca en la vista previa.

**Descargar solo las filas con error** como archivo, con su motivo y en el mismo formato en que llegaron. Es lo que evita reprocesar sesenta filas por tres malas.

### Paso 4 · Confirmar

Resumen numérico —*se crearán N, se actualizarán M, se archivarán K, se omitirán J, hay E con error*— y el botón de importar. **Nada se ha modificado hasta este punto.**

### Paso 5 · Resultado

Qué se hizo, con enlace a cada perfil afectado, la opción de descargar el reporte, y el botón de **deshacer esta importación**.

## 7. Historial y reversibilidad

Cada importación queda registrada: quién, cuándo, origen del archivo, modo, conteos por bloque y **el estado anterior de cada perfil tocado**.

**La última importación se revierte por completo.** Es la contraparte necesaria de una acción que modifica decenas de registros de una vez: el borrado masivo está prohibido, pero una actualización masiva equivocada hace un daño equivalente.

Aquí nos apartamos deliberadamente del patrón de los CRM. HubSpot y Salesforce permiten borrar lo que una importación creó, pero no deshacer lo que actualizó. **Con un banco de decenas de perfiles curados a mano, poder volver atrás vale más que en un CRM de cientos de miles de registros**, donde revertir es impracticable.

Revertir no borra los perfiles creados: los archiva.

## 8. Permisos, límites y auditoría

- **Solo el rol de administrador de inventario importa.** El rol observador ve el historial y no puede ejecutar.
- **Límite por importación** acorde al tamaño del banco. Por encima del límite, el asistente pide dividir el archivo en lugar de procesar en segundo plano: con estos volúmenes, un proceso asíncrono añade complejidad sin resolver nada.
- **Cada cambio queda atribuido a su importación** en el registro de auditoría (RF-8.9), nunca a «sistema». Si dentro de seis meses alguien pregunta por qué cambió un dato, la respuesta tiene nombre y fecha.

## 9. Esquema

Solo `codigo` es obligatorio. Todo lo demás es opcional y se fusiona.

```json
[
  {
    "codigo": "BE-SR-014",
    "nombre": "Andrés Molina",
    "capacidad": "Ingeniero Backend Senior",
    "anclaje": "8 años en core bancario",
    "rol": "Desarrollador Backend",
    "familia": "Desarrollo de software",
    "seniority": "Senior",
    "anios": 8,
    "modalidad": "Híbrido",
    "pais": "Colombia",
    "ciudad": "Bogotá",
    "tecnologias": ["Java 17", "Spring Boot", "gRPC"],
    "sectores": ["Banca"],
    "disponibleDesde": "2026-11-01",
    "vinculo": "vinculado",
    "resumen": "Perfil de backend con foco en sistemas transaccionales…",
    "experiencia": ["Core bancario en Davivienda Empresas: migración de REST a gRPC sobre más de 50 mil usuarios."],
    "selloPersonal": ["Rigurosidad y calidad", "Autodidactismo", "Cautela y responsabilidad"],
    "validacion": { "modalidadId": "des-3", "fecha": "2026-02-01" },
    "estado": "pausado",
    "motivoPausa": "En licencia o ausencia temporal"
  }
]
```

**Equivalente tabular.** En hoja de cálculo, las listas van separadas por punto y coma en una sola celda: `Java 17; Spring Boot; gRPC`.

**Ejemplo mínimo** — actualización de disponibilidad:

```json
[
  { "codigo": "BE-SR-014", "disponibleDesde": "2026-11-01" },
  { "codigo": "QA-SR-012", "disponibleDesde": "2026-10-15" },
  { "codigo": "RPA-SS-030", "estado": "archivado" }
]
```

**Campos rechazados si aparecen**, con aviso en la vista previa: `consentimiento` en verdadero, `resultadoValidacion`, y cualquier intento de fijar `estado: "publicado"`.

## 10. Dónde encaja

Detalla **RF-8.6**, que decía «carga y actualización masiva por archivo estructurado» sin más. Se formaliza como **RF-8.15** en el PRD.

Tiene efecto sobre **D-8**, el alcance del panel en la primera versión: ahora Talento Humano puede decidir con criterio si la importación entra en v1 o espera, porque se sabe qué implica.

Historias: **HU-086** (importar), **HU-087** (revertir), **HU-088** (exportar el banco como plantilla).
