---
id: flow-005-solicitud-y-agendamiento
epica: EP-005
historias_cubiertas: [HU-096, HU-097, HU-098, HU-099, HU-100, HU-101]
---

# Flow 005 — Solicitud de equipo y agendamiento

## Resumen

Del equipo armado a la sesión de alineación. Actores: el **Cliente** y **Delivery** (Coordinación de Servicio). Condición de éxito: la solicitud sale con contexto suficiente, el cliente sabe qué pasa después, y alguien del lado de Trycore tiene asignado provocarla.

## Diagrama

```mermaid
sequenceDiagram
  participant C as Cliente
  participant P as Portal
  participant D as Delivery

  %% HU-096
  C->>P: Abre el resumen antes de enviar
  %% HU-096
  P-->>C: Muestra el equipo completo y la banda de arranque del conjunto

  %% HU-096
  alt Un perfil dejó de estar disponible
    %% HU-096
    P-->>C: Lo señala en el resumen antes del envío
  end

  %% HU-100
  alt Intenta enviar sin haber elegido nada
    %% HU-100
    P-->>C: Advierte y ofrece volver a los resultados
  end

  %% HU-097
  C->>P: Se identifica con nombre, cargo y correo corporativo
  %% HU-097
  P-->>C: Acepta la identificación y esa es la que viaja al CRM

  %% HU-097
  alt Correo personal
    %% HU-097
    P-->>C: Pide un correo corporativo y explica por qué
  end

  %% HU-098
  C->>P: Envía la solicitud
  %% HU-098
  P-->>C: Confirma, explica la sesión de alineación y el SLA de 10 días hábiles

  %% HU-098
  alt Falla la integración con el CRM
    %% HU-098
    P-->>C: La confirmación se mantiene y la solicitud entra en cola de reintento
  end

  %% HU-101
  P->>D: Entrega la especificación estructurada completa con responsable nominal
  %% HU-101
  D-->>P: Prepara la sesión con el reto, rol, tecnologías, sector y perfiles

  %% HU-101
  alt Especificación incompleta
    %% HU-101
    P->>D: Viaja marcada como no revisada por el cliente
  end

  %% HU-101
  alt Sin responsable asignado
    %% HU-101
    P->>D: Escala en vez de dejarla en bandeja compartida
  end

  %% HU-099
  C->>P: Agenda la sesión de alineación
  %% HU-099
  P-->>C: Confirma el horario y escribe la fecha en el negocio

  %% HU-099
  alt Sin horarios disponibles
    %% HU-099
    P-->>C: Ofrece que Delivery contacte, sin dejar al cliente sin salida
  end

  %% HU-099
  alt No quiere agendar ahora
    %% HU-099
    P-->>C: Cierra sin penalizar, el comercial agenda por fuera
  end
```

## Trazabilidad

| Paso | HU | AC |
|---|---|---|
| Resumen antes de enviar | HU-096 | AC-1 (happy) |
| Perfil no disponible en el resumen | HU-096 | AC-2 (error) |
| Envío sin selección | HU-100 | AC-1 (happy) |
| Identificación | HU-097 | AC-1 (happy) |
| Correo personal | HU-097 | AC-2 (error) |
| Envío y confirmación | HU-098 | AC-1 (happy) |
| Falla de integración | HU-098 | AC-2 (error) |
| Traspaso a Delivery | HU-101 | AC-1 (happy) |
| Especificación incompleta | HU-101 | AC-2 (error) |
| Sin responsable | HU-101 | AC-3 (edge) |
| Agendar | HU-099 | AC-1 (happy) |
| Sin horarios | HU-099 | AC-2 (error) |
| No agenda ahora | HU-099 | AC-3 (edge) |

## Notas

**HU-101 cierra RF-17, el hueco entre «se envió la solicitud» y «alguien la convirtió en sesión agendada».** Es donde vive O3. El requisito manda responsable nominal, no bandeja compartida: una bandeja sin dueño es una bandeja sin lector.

**HU-099 está en v1.1.** En el MVP la confirmación explica el paso siguiente y el comercial agenda por fuera. La consecuencia hay que aceptarla explícitamente: mientras HU-099 no exista, el numerador de O3 depende de que un humano escriba la fecha a mano (HU-107 en EP-007).

**AC no diagramados:** HU-096 AC-3 (equipo vacío, cubierto por HU-100), HU-097 AC-3 (contacto desconocido en empresa conocida, se resuelve en EP-007 con HU-104), HU-098 AC-3 (segunda solicitud parecida, se resuelve en EP-007 con HU-105 y la excepción de HU-077), HU-100 AC-2 y AC-3.
