---
id: flow-004-armado-de-equipo
epica: EP-004
historias_cubiertas: [HU-080, HU-175, HU-192, HU-203, HU-204, HU-205, HU-206]
---

# Flow 004 — Armado de equipo

## Resumen

Cómo el cliente suma y quita perfiles de «Mi equipo» con su indicador, lo revisa como conjunto, compara hasta tres candidatos, lo recupera en otro dispositivo o al renovar el enlace, y ve con su estado a los perfiles que dejaron de estar disponibles. Actor principal: el **Cliente**. Condición de éxito: el cliente arma su equipo en el servidor, ve en todo momento cuántos lleva y con qué equipo cuenta de verdad, sin que el portal le imponga una forma.

## Diagrama

```mermaid
sequenceDiagram
  participant C as Cliente
  participant P as Portal

  %% HU-192
  C->>P: Toca «Sumar al equipo» en la tarjeta de un perfil
  %% HU-192
  P-->>C: El indicador «Mi equipo» sube y la tarjeta ofrece «Quitar del equipo»; el conteo sigue al recargar o cambiar de pantalla
  %% HU-192
  C->>P: Toca «Quitar del equipo»
  %% HU-192
  P-->>C: El indicador baja y el perfil sigue en la lista

  %% HU-192
  alt El servidor no puede guardar el equipo
    %% HU-192
    P-->>C: Dice que no se pudo y no cambia el indicador ni el estado de la tarjeta
  end

  %% HU-192
  alt Otro invitado del mismo enlace
    %% HU-192
    P-->>C: Cada invitado arma y ve solo su propio equipo
  end

  %% HU-175
  C->>P: Toca «Sumar al equipo» o «Quitar del equipo» en la ficha abierta
  %% HU-175
  P-->>C: El indicador cambia y la ficha sigue abierta en el mismo perfil

  %% HU-203
  C->>P: Toca el indicador «Mi equipo»
  %% HU-203
  P-->>C: Muestra los perfiles, «Roles cubiertos» y el arranque del equipo completo (banda del más tardío, D110)

  %% HU-203
  alt Equipo vacío
    %% HU-203
    P-->>C: «Todavía no has sumado perfiles» y una acción hacia la selección
  end

  %% HU-203
  alt No se puede leer el equipo
    %% HU-203
    P-->>C: Dice que no pudo cargarlo y ofrece reintentar, sin mostrar un conteo en 0
  end

  %% HU-206
  alt Un perfil del equipo se pausó o se archivó
    %% HU-206
    P-->>C: Sigue en la lista y en el contador con su etiqueta; no cuenta en roles ni arranque (D114)
  end

  %% HU-206
  alt Intenta sumar un perfil que se pausó mientras lo miraba
    %% HU-206
    P-->>C: Rechaza el alta, dice por qué y muestra la etiqueta «Pausado»
  end

  %% HU-206
  alt La selección del correo se archivó y el equipo tiene perfiles
    %% HU-206
    P-->>C: Muestra cada archivado con su etiqueta y ofrece «Continuar con mi equipo (N)»
  end

  %% HU-080
  P-->>C: Señala el vacío de composición que valida una regla de Delivery, en tono informativo (D115)

  %% HU-080
  alt Ninguna regla aplica
    %% HU-080
    P-->>C: Calla en vez de inventar un vacío
  end

  %% HU-204
  C->>P: Marca 2 o 3 perfiles y toca «Comparar» en «Mi equipo» o en la barra de la tabla
  %% HU-204
  P-->>C: Abre el comparador con las mismas filas fijas para cada perfil, sin puntajes (D112)

  %% HU-204
  alt Marca 1 o 4 perfiles
    %% HU-204
    P-->>C: «Comparar» no está disponible y explica por qué
  end

  %% HU-205
  C->>P: Entra por el mismo enlace desde otro dispositivo y verifica su correo
  %% HU-205
  P-->>C: Encuentra el mismo equipo, en el mismo orden

  %% HU-205
  alt Entra por un enlace renovado tras vencer
    %% HU-205
    P-->>C: Ofrece «Copiar mi equipo anterior (N)», con los no disponibles en su estado (D113)
  end

  %% HU-205
  alt Abre un enlace vencido
    %% HU-205
    P-->>C: No muestra el equipo ni su conteo y ofrece pedir un enlace nuevo
  end
```

## Trazabilidad

| Paso | HU | AC |
|---|---|---|
| Sumar al equipo | HU-192 | AC-1 (happy) |
| Quitar del equipo | HU-192 | AC-2 (alterno) |
| Fallo al guardar | HU-192 | AC-3 (error) |
| Equipos aislados entre invitados | HU-192 | AC-5 (edge) |
| Sumar o quitar desde la ficha | HU-175 | AC-1 y AC-3 |
| Abrir el resumen desde el indicador | HU-203 | AC-1 (happy) |
| Equipo vacío | HU-203 | AC-4 (edge) |
| Fallo de lectura | HU-203 | AC-5 (error) |
| Perfil pausado o archivado en el equipo | HU-206 | AC-1 (happy, esquema) |
| Sumar un perfil que se pausó | HU-206 | AC-3 (error) |
| Selección archivada, continuar con el equipo | HU-206 | AC-4 (edge) |
| Vacío señalado | HU-080 | AC-1 (happy) |
| Ninguna regla aplica | HU-080 | AC-2 (error) |
| Comparar desde las dos entradas | HU-204 | AC-1 (happy, esquema) |
| Menos de 2 o más de 3 marcados | HU-204 | AC-2 (edge) |
| Mismo equipo en otro dispositivo | HU-205 | AC-1 (happy) |
| Copiar el equipo al renovar | HU-205 | AC-4 (edge) |
| Enlace vencido | HU-205 | AC-5 (error) |

## Notas

**Discovery 2026-10-02 — cuarta ronda (D108–D115).** Con HU-203, HU-204, HU-205 y HU-206 el RF-4 queda entero en historias, y los tres criterios recibidos de EP-001 están pagados (HU-192 y HU-206). **HU-084 pasa a EP-009 (D108)**: su arco («forma típica del trabajo») se dibuja en la vista «Mi equipo» pero se diagrama en `EP-009-instruccion-y-perfil-objetivo.md`. **HU-207** (composiciones de Delivery) es de **EP-008 (D109)**.

**Orden de los arcos.** El diagrama sigue el recorrido típico; la observación de vacío (HU-080) y los estados de HU-206 se pintan cada vez que se abre la vista de HU-203.

**AC no diagramados:** HU-192 AC-4 (lo sumado en el banco sigue al volver a la selección); HU-175 AC-2, AC-4 y AC-5; HU-203 AC-2 (quitar desde el resumen) y AC-3 (roles repetidos y «Por confirmar», esquema); HU-206 AC-2 (vuelve a estar disponible) y AC-5 (quitar un archivado); HU-080 AC-3 y AC-4; HU-204 AC-3 («No declarado») y AC-4 (perfil pausado entre marcar y abrir); HU-205 AC-2 (cambio visto en el otro dispositivo) y AC-3 (equipo por invitado y por enlace, esquema).
