---
id: flow-005-solicitud-y-agendamiento
epica: EP-005
historias_cubiertas: [HU-096, HU-097, HU-098, HU-099, HU-100, HU-101, HU-197, HU-198, HU-199, HU-200, HU-201]
---

# Flow 005 — Solicitud de equipo y agendamiento

## Resumen

Del equipo armado a la sesión de alineación. Actores: el **Cliente**, **Delivery** (Coordinación de Servicio) y **Mercadeo** (lectura del recorrido). Condición de éxito: la solicitud sale con contexto suficiente y exactamente con el equipo revisado, nada comunica reserva, el cliente sabe qué pasa después y puede agendar, y Coordinación de Servicio recibe el aviso con el enlace al negocio.

## Diagrama

```mermaid
sequenceDiagram
  participant C as Cliente
  participant P as Portal
  participant D as Delivery
  participant M as Mercadeo

  %% HU-100
  alt Abre la solicitud con el equipo vacío
    %% HU-100
    P-->>C: «Todavía no tienes perfiles en tu equipo» y salidas a la selección o al banco; sin formulario (D121)
  end

  %% HU-197
  C->>P: Responde las tres preguntas cerradas, el sector y la nota, y toca «Revisar antes de enviar»
  %% HU-200
  P->>M: Registra «solicitud iniciada» en el recorrido de la visita, sin datos personales

  %% HU-197
  alt Falta una de las tres preguntas
    %% HU-197
    P-->>C: Sigue en el formulario y señala «Elige una opción» (D117)
  end

  %% HU-097
  C->>P: Pone su nombre y su cargo; el correo verificado aparece de solo lectura
  %% HU-097
  alt Falta nombre o cargo
    %% HU-097
    P-->>C: No envía y señala «falta nombre o cargo»
  end

  %% HU-096
  P-->>C: Muestra el resumen: el equipo entero con roles y arranque (vista de HU-203, D111), respuestas y datos

  %% HU-096
  alt Un perfil dejó de estar publicado
    %% HU-096
    P-->>C: Lo muestra solo con código y estado y avisa que no viajará (D118)
  end

  %% HU-096
  alt No se puede leer el equipo
    %% HU-096
    P-->>C: Dice que no pudo cargarlo, sin resumen parcial ni botón de enviar
  end

  %% HU-198
  C->>P: Toca «Enviar solicitud de equipo»
  %% HU-198
  P->>P: Guarda una sola solicitud con los perfiles publicados del equipo guardado y encola crear_negocio
  %% HU-200
  P->>M: El servidor registra «solicitud enviada» con su SOL

  %% HU-198
  alt El equipo cambió desde que lo revisó
    %% HU-198
    P-->>C: No envía y muestra el resumen actualizado con «Tu equipo cambió desde que lo revisaste»
  end

  %% HU-198
  alt La sesión o el enlace dejaron de valer
    %% HU-198
    P-->>C: Lleva a /acceso?motivo=… sin guardar nada
  end

  %% HU-098
  alt Hay una solicitud en curso con la misma especificación hace ≤ 7 días
    %% HU-098
    P-->>C: Muestra la solicitud en curso y ofrece solo añadir contexto o volver (D119, D120)
    %% HU-201
    C->>P: Escribe el contexto y toca «Añadir a mi solicitud»
    %% HU-201
    P-->>C: «Añadimos tu contexto a SOL-…», sin solicitud nueva; un solo trabajo hacia HubSpot
  end

  %% HU-098
  P-->>C: Confirma con su SOL, explica la sesión de alineación y el plazo de 10 días hábiles
  %% HU-199
  P-->>C: La confirmación dice que no se reservó ni comprometió a nadie; «Mi equipo» sigue igual (D122)

  %% HU-098
  alt HubSpot no responde
    %% HU-098
    P-->>C: La misma confirmación, sin mención al fallo; la solicitud queda pendiente en cola
  end

  %% HU-099
  C->>P: Toca «Agendar la sesión de alineación»
  %% HU-099
  P-->>C: Abre en otra pestaña el enlace de reuniones de equipo con rotación de HubSpot, con nombre y correo (D116)

  %% HU-099
  alt El enlace de reuniones no está configurado
    %% HU-099
    P-->>C: Sin botón ni enlace roto; dice que Coordinación de Servicio escribirá
  end

  %% HU-101
  P->>D: Al crearse el negocio, correo con la especificación completa y el enlace directo al negocio
  %% HU-101
  alt El negocio todavía no existe
    %% HU-101
    P->>D: No envía nada hasta que exista; sale una sola vez
  end
```

## Trazabilidad

| Paso | HU | AC |
|---|---|---|
| Equipo vacío, sin formulario | HU-100 | AC-1 (happy, esquema) |
| Declarar el contexto | HU-197 | AC-1 (happy) |
| Falta una pregunta | HU-197 | AC-2 (error) |
| Solicitud iniciada en el recorrido | HU-200 | AC-1 (happy) |
| Falta nombre o cargo | HU-097 | AC-2 (error) |
| Resumen antes de enviar | HU-096 | AC-1 (happy) |
| Perfil no publicado en el resumen | HU-096 | AC-3 (edge) |
| Fallo de lectura del equipo | HU-096 | AC-5 (error) |
| Enviar el equipo guardado | HU-198 | AC-1 (happy) |
| Solicitud enviada registrada por el servidor | HU-200 | AC-2 (edge) |
| Equipo cambiado tras revisar | HU-198 | AC-2 (edge) |
| Sesión o enlace inválidos | HU-198 | AC-4 (error) |
| Solicitud en curso con la misma especificación | HU-098 | AC-3 (edge) |
| Añadir contexto | HU-201 | AC-1 (happy) |
| Confirmación | HU-098 | AC-1 (happy) |
| Sin reserva | HU-199 | AC-1 (happy) |
| HubSpot no responde | HU-098 | AC-2 (error) |
| Agendar | HU-099 | AC-1 (happy [portal]) |
| Enlace de reuniones sin configurar | HU-099 | AC-3 (error) |
| Aviso a Coordinación de Servicio | HU-101 | AC-1 (happy) |
| Negocio aún no creado | HU-101 | AC-3 (error) |

## Notas

**Discovery 2026-10-02 — cuarta ronda (D116–D123).** Nacen HU-197, HU-198, HU-199, HU-200 y HU-201. **HU-099 entra en EP-005 y en el MVP (D116)**: la confirmación abre un enlace de reuniones de equipo con rotación de HubSpot, sin calendario propio; al agendar por ese enlace HubSpot llena `engagements_last_meeting_booked` del contacto, que mide O3 (HU-107, EP-007, D92). Lo agendado fuera de la herramienta no se mide (riesgo aceptado). **D123:** sin acuse por correo al cliente en v1.

**HU-101 cierra RF-17**, el hueco entre «se envió la solicitud» y «alguien la convirtió en sesión agendada». El aviso a Coordinación de Servicio lo envía el portal tras crear el negocio (D78); el escalamiento sin responsable es del workflow de HubSpot (HU-162, HU-163, EP-007).

**AC no diagramados:** HU-096 AC-2 (corregir) y AC-4 (equipo grande con un colocado); HU-097 AC-1, AC-3 y AC-4; HU-098 AC-4 (envío repetido); HU-099 AC-2 ([HubSpot], prueba de aceptación) y AC-4 (sale sin agendar); HU-100 AC-2 a AC-4; HU-101 AC-2 y AC-4; HU-197 AC-3 a AC-5; HU-198 AC-3 (petición alterada) y AC-5 (fallo al guardar); HU-199 AC-2 a AC-5; HU-200 AC-3 (abandono por paso) y AC-4 (telemetría caída); HU-201 AC-2 a AC-4.
