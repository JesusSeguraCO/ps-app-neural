---
id: flow-006-administracion-del-inventario
epica: EP-006
historias_cubiertas: [HU-086, HU-087, HU-088, HU-089, HU-123, HU-124, HU-125, HU-126, HU-127, HU-128, HU-129, HU-130, HU-131, HU-132, HU-133, HU-134, HU-135, HU-136, HU-137, HU-138, HU-139, HU-140, HU-141, HU-142, HU-143]
---

# Flow 006 — Administración del inventario

## Resumen

El ciclo completo del panel: entrar, crear, consentir, publicar, mantener y gobernar. Actores: **Talento Humano** (rol administrador de inventario) y **Mercadeo** (rol observador), según D-22. Condición de éxito: el banco se sostiene vivo sin que nadie edite registro por registro, y nada se publica sin respaldo.

## Diagrama — acceso y creación

```mermaid
sequenceDiagram
  participant TH as Talento Humano
  participant P as Panel
  participant M as Mercadeo

  %% HU-123
  TH->>P: Entra con su identidad corporativa
  %% HU-123
  P-->>TH: Reconoce el rol administrador y registra quién es

  %% HU-123
  alt Cuenta corporativa desactivada
    %% HU-123
    P-->>TH: El acceso muere con la cuenta, sin desactivación aparte
  end

  %% HU-124
  M->>P: Entra con rol observador
  %% HU-124
  P-->>M: Consulta inventario, enlaces, colocados y demanda, sin controles de escritura

  %% HU-124
  alt El observador intenta escribir por ruta directa
    %% HU-124
    P-->>M: Rechaza la acción y la deja en el registro de auditoría
  end

  %% HU-125
  TH->>P: Crea un perfil eligiendo rol, tecnologías y sector del catálogo
  %% HU-125
  P-->>TH: Queda en borrador, invisible en el portal

  %% HU-125
  alt La familia del rol no tiene modalidades de prueba
    %% HU-125
    P-->>TH: Advierte al crear el rol que ningún perfil de esa familia podrá publicarse
  end

  %% HU-088
  TH->>P: Descarga la plantilla o exporta el banco
  %% HU-088
  P-->>TH: Entrega el archivo en dos formatos, sin campos internos

  %% HU-086
  TH->>P: Pega desde la hoja de cálculo y elige el modo de importación
  %% HU-086
  P-->>TH: Vista previa por tarjeta antes de tocar nada, resolviendo por código

  %% HU-086
  alt Dos filas con el mismo código
    %% HU-086
    P-->>TH: Rechaza el archivo y señala las filas en conflicto
  end

  %% HU-086
  alt Un valor no existe en la taxonomía
    %% HU-086
    P-->>TH: Lo destaca como nuevo para detectar el error de digitación
  end

  %% HU-141
  TH->>P: Confirma la importación declarando el modo
  %% HU-141
  P-->>TH: El código existente actualiza, el nuevo crea en borrador

  %% HU-141
  alt El archivo intenta conceder consentimiento o publicar
    %% HU-141
    P-->>TH: Rechaza esos campos, ningún perfil queda publicado por importación
  end

  %% HU-141
  alt Campo ausente frente a campo que quiero borrar
    %% HU-141
    P-->>TH: Ausente no toca nada, solo un nulo explícito vacía
  end

  %% HU-141
  alt Modo solo actualizar con un código inexistente
    %% HU-141
    P-->>TH: Omite la fila en vez de crear un perfil fantasma
  end

  %% HU-142
  TH->>P: Descarga solo las filas con error
  %% HU-142
  P-->>TH: Las entrega con su motivo y en el formato en que llegaron

  %% HU-142
  alt Reimporta las corregidas
    %% HU-142
    P-->>TH: Actualizan por código sin duplicar lo ya aplicado
  end

  %% HU-087
  TH->>P: Revierte la última importación
  %% HU-087
  P-->>TH: Devuelve cada perfil a su estado anterior y archiva los creados

  %% HU-087
  alt Un perfil se cambió a mano después de importar
    %% HU-087
    P-->>TH: Lo excluye de la reversión y lo reporta
  end
```

## Diagrama — consentimiento, evidencia y publicación

```mermaid
sequenceDiagram
  participant TH as Talento Humano
  participant P as Panel
  participant C as Cliente

  %% HU-127
  TH->>P: Registra el consentimiento nominal del profesional
  %% HU-127
  P-->>TH: Habilita el perfil para pasar a publicado y registra quién y cuándo

  %% HU-127
  alt Consentimiento recogido para publicación anonimizada
    %% HU-127
    P-->>TH: Lo rechaza, ese consentimiento no cubre el uso nominal
  end

  %% HU-127
  alt El profesional revoca
    %% HU-127
    P-->>TH: El perfil sale de publicado de inmediato
  end

  %% HU-131
  TH->>P: Adjunta el artefacto de evidencia tal como lo tiene
  %% HU-131
  P-->>TH: Lo almacena internamente y lo asocia a esa validación

  %% HU-131
  alt Formato o tamaño no admitido
    %% HU-131
    P-->>TH: Dice qué admite sin perder lo ya registrado del perfil
  end

  %% HU-140
  TH->>P: Pide el borrador de campos desde el artefacto
  %% HU-140
  P-->>TH: Propone los campos descriptivos para su revisión, nunca los publica solo

  %% HU-140
  alt No se puede derivar nada del artefacto
    %% HU-140
    P-->>TH: Lo dice sin borrar el adjunto, se redacta a mano
  end

  %% HU-140
  alt El borrador afirma algo que el artefacto no sostiene
    %% HU-140
    P-->>TH: Se corrige o se descarta entero, nada llega a la ficha sin revisión
  end

  %% HU-129
  TH->>P: Previsualiza la ficha
  %% HU-129
  P-->>TH: La muestra exactamente como la verá el cliente, con banda de disponibilidad

  %% HU-128
  TH->>P: Intenta publicar
  %% HU-128
  alt Sin consentimiento registrado
    %% HU-128
    P-->>TH: Bloquea y señala exactamente qué falta
  end

  %% HU-130
  P-->>TH: Publica con el enunciado de Nivel 0 derivado de la familia de rol

  %% HU-130
  alt El reporte detallado llega después
    %% HU-130
    P-->>TH: La ficha se enriquece sin republicar el perfil
  end

  %% HU-126
  TH->>P: Edita un perfil ya publicado
  %% HU-126
  P-->>TH: Declara qué campos cambian de cara al cliente antes de confirmar

  %% HU-126
  alt El cambio deja el perfil sin requisitos de publicación
    %% HU-126
    P-->>TH: Bloquea o propone pasarlo a borrador
  end

  %% HU-129
  P-->>C: La ficha publicada coincide con lo previsualizado
```

## Diagrama — mantenimiento y gobierno

```mermaid
sequenceDiagram
  participant TH as Talento Humano
  participant P as Panel

  %% HU-132
  TH->>P: Actualiza la disponibilidad desde el listado, sin abrir la ficha
  %% HU-132
  P-->>TH: Guarda el cambio y el portal refleja la nueva banda de inmediato

  %% HU-134
  alt Estado y disponibilidad se contradicen
    %% HU-134
    P-->>TH: Señala la incoherencia en la propia fila con la acción que la corrige
  end

  %% HU-134
  alt Incoherencia de severidad alta
    %% HU-134
    P-->>TH: Impide publicar hasta resolverla
  end

  %% HU-133
  TH->>P: Pausa un perfil
  %% HU-133
  P-->>TH: Exige elegir el motivo de una lista corta

  %% HU-133
  alt El motivo es en realidad una fecha
    %% HU-133
    P-->>TH: Indica que eso es disponibilidad, no pausa, y lo deja publicado con la fecha
  end

  %% HU-136
  TH->>P: Abre la bandeja de vigencia
  %% HU-136
  P-->>TH: Lista los perfiles sin actualizar en más de 30 días, ordenados por antigüedad

  %% HU-136
  alt Un perfil vencido ya se muestra como por confirmar
    %% HU-136
    P-->>TH: Lo pone al principio, el cliente ya está viendo la advertencia
  end

  %% HU-137
  TH->>P: Abre la pestaña de colocados
  %% HU-137
  P-->>TH: Cuenta, inicio y vencimiento, ordenados por proximidad, con la fecha de corte declarada

  %% HU-137
  alt Un colocado sigue publicado
    %% HU-137
    P-->>TH: Conserva su disponibilidad en la fecha de fin, no se oculta
  end

  %% HU-135
  TH->>P: Retira un profesional del banco
  %% HU-135
  P-->>TH: Lo archiva, nunca lo borra, para conservar la trazabilidad de lo mostrado

  %% HU-089
  TH->>P: Crea un valor de catálogo con su familia
  %% HU-089
  P-->>TH: Propone los parecidos antes de crear y exige familia al rol

  %% HU-089
  alt Valor idéntico salvo mayúsculas
    %% HU-089
    P-->>TH: Lo impide e indica que ya existe
  end

  %% HU-143
  TH->>P: Desactiva un valor en uso
  %% HU-143
  P-->>TH: Deja de ofrecerse en perfiles nuevos y los existentes lo conservan

  %% HU-143
  TH->>P: Fusiona dos duplicados
  %% HU-143
  P-->>TH: Muestra cuántos perfiles se afectan antes de confirmar

  %% HU-143
  alt Desactivar una modalidad que sostiene fichas publicadas
    %% HU-143
    P-->>TH: Advierte cuántas dependen de ella y conserva su texto
  end

  %% HU-139
  TH->>P: Registra un término del cliente con su equivalencia
  %% HU-139
  P-->>TH: Las búsquedas siguientes lo reconocen, sin despliegue

  %% HU-139
  alt Consultas sin coincidencia del período
    %% HU-139
    P-->>TH: Las ofrece como candidatas al léxico o a la agenda de reclutamiento
  end

  %% HU-138
  TH->>P: Consulta el registro de auditoría de un perfil
  %% HU-138
  P-->>TH: Campo, valor anterior y nuevo, quién y cuándo

  %% HU-138
  alt Cambio entrado por importación o sincronización
    %% HU-138
    P-->>TH: Lo atribuye al proceso y a quien lo disparó, nunca sin autor
  end
```

## Trazabilidad

| Paso | HU | AC |
|---|---|---|
| Entrar con identidad corporativa | HU-123 | AC-1 (happy) · AC-2 (error) |
| Observador consulta sin escribir | HU-124 | AC-1 (happy) · AC-2 (error) |
| Crear perfil desde catálogo | HU-125 | AC-1 (happy) · AC-2 (error) |
| Exportar y plantilla | HU-088 | AC-1, AC-2 y AC-4 (happy) · AC-5 (edge) |
| Pegar y previsualizar | HU-086 | AC-1 y AC-2 (happy) · AC-3 (error) · AC-4 (edge) |
| Confirmar con el modo correcto | HU-141 | AC-1 (happy) · AC-2 (error) · AC-3 y AC-4 (edge) |
| Corregir lo que falló | HU-142 | AC-1 (happy) · AC-3 (edge) |
| Revertir importación | HU-087 | AC-1 (happy) · AC-3 (edge) |
| Registrar consentimiento | HU-127 | AC-1 (happy) · AC-2 y AC-3 (error) |
| Adjuntar artefacto | HU-131 | AC-1 (happy) · AC-2 (error) |
| Borrador desde el artefacto | HU-140 | AC-1 (happy) · AC-2 (error) · AC-3 (edge) |
| Previsualizar | HU-129 | AC-1 (happy) |
| Bloqueo sin consentimiento | HU-128 | AC-1 (happy) |
| Publicar con Nivel 0 | HU-130 | AC-1 (happy) · AC-3 (edge) |
| Editar publicado | HU-126 | AC-1 (happy) · AC-2 (error) |
| Disponibilidad en dos clics | HU-132 | AC-1 (happy) |
| Incoherencias | HU-134 | AC-1 (happy) · AC-2 (error) |
| Pausar con motivo | HU-133 | AC-1 (happy) · AC-2 (error) |
| Bandeja de vigencia | HU-136 | AC-1 (happy) · AC-3 (edge) |
| Colocados | HU-137 | AC-1 (happy) · AC-3 (edge) |
| Archivar | HU-135 | AC-1 (happy) |
| Crear valores de catálogo | HU-089 | AC-1 y AC-2 (happy) · AC-3 y AC-4 (error) |
| Retirar y fusionar valores | HU-143 | AC-1 y AC-2 (happy) · AC-4 (edge) |
| Léxico | HU-139 | AC-1 (happy) · AC-3 (edge) |
| Auditoría | HU-138 | AC-1 (happy) · AC-2 (error) |

## Notas

**Este flow se reescribió el 2026-09-21.** Hasta esa fecha diagramaba cuatro historias —importación y catálogos— porque eran las únicas escritas, mientras la épica declaraba RF-8 completo. Con HU-123 a HU-139 redactadas, el panel tiene por fin un recorrido entero: acceso, creación, consentimiento, publicación, mantenimiento y gobierno.

**Tres diagramas y no uno.** El ciclo del panel no es un recorrido lineal: son tres momentos con actores y disparadores distintos —quien entra y carga, quien publica, quien mantiene—. Forzarlos en un solo diagrama produciría algo ilegible sin ganar precisión.

**El orden del segundo diagrama no es estético.** Consentimiento antes que publicación porque RF-8.4 lo bloquea; Nivel 0 después del bloqueo porque RF-8.10 es explícito en que la falta de reporte detallado **no** impide publicar. Invertirlos describiría un producto distinto.

**D-8 cerró el 2026-09-18 en CRUD completo**, así que todo lo diagramado está comprometido para el MVP. **D-22** fija los dos roles: administrador de inventario escribe, observador consulta.

**Dependencia dura:** HU-138 (auditoría) no existe sin HU-123 (identidad). RF-8.1.3 lo dice — el «quién» del registro solo existe si hay identidad. Igual **HU-140 no existe sin HU-131**: sin artefacto guardado no hay de qué derivar.

**Cuatro divisiones el 2026-09-22.** `METODOLOGIA.md` §4 usa el tope de cinco escenarios como detector de tamaño, y tres historias de esta épica lo excedían. HU-086 (8 AC) se partió en **HU-086** (pegar y previsualizar), **HU-141** (confirmar con el modo correcto) y **HU-142** (corregir lo que falló); HU-089 (6 AC) en **HU-089** (crear valores) y **HU-143** (retirar y fusionar). Las dos traían el corte propuesto en su propia tabla INVEST.

**HU-131 se dividió el mismo día.** Juntaba guardar el artefacto y derivar campos de él en una sola historia L de valor medio. Guardar un archivo y leer un video son trabajos de orden distinto: la mitad útil quedó en HU-131 (M) y la cara en HU-140 (L), que se puede posponer entera.

**AC no diagramados:** los escenarios de severidad media de HU-134, los límites de HU-125 AC-3 y AC-4, HU-086 AC-6 a AC-8, HU-087 AC-2, HU-089 AC-4 y AC-6, y los edge cases de móvil y bandeja de HU-133. Viven en los AC de su historia; incluirlos aquí no añade recorrido.
