---
id: flow-010-el-camino-del-cero
epica: EP-010
historias_cubiertas: [HU-075, HU-227, HU-076, HU-077, HU-228, HU-078, HU-189]
---

# Flow 010 — El camino del cero

## Resumen

Qué pasa cuando el banco no tiene lo que el cliente pidió. Actores: el **Cliente**, el **Portal**, **HubSpot** (recibe la solicitud a medida por el worker de EP-007) y **Talento Humano** como lectora del registro de demanda y autora de las decisiones de reclutamiento. Condición de éxito: el cero deja de ser un callejón sin salida y se convierte en una solicitud a medida o, como mínimo, en demanda registrada que alguien lee y decide.

## Diagrama

```mermaid
sequenceDiagram
  participant C as Cliente
  participant P as Portal
  participant H as HubSpot
  participant TH as Talento Humano

  %% HU-075
  C->>P: Aplica un Perfil Objetivo cuyos obligatorios ningún perfil cumple
  %% HU-075
  P-->>C: Pantalla de cero con la especificación a la vista y la salida a medida

  %% HU-075
  alt Falta rol o seniority para pedir a medida
    %% HU-075
    P-->>C: Dice qué completar antes de pedir
  end

  %% HU-075
  alt Solo los deseables no se cumplen
    %% HU-075
    P-->>C: No hay cero: los deseables ordenan, no excluyen
  end

  %% HU-227
  P-->>C: El tamaño del banco dicho como selectividad, con la cifra de publicados del momento

  %% HU-227
  alt El conteo no está disponible o el banco no cumple lo que se afirmaría
    %% HU-227
    P-->>C: Omite la línea en lugar de afirmar lo que no es
  end

  %% HU-076
  P-->>C: Lo más cercano: perfiles que fallan exactamente un obligatorio, diciendo cuál, sin porcentajes

  %% HU-076
  alt Nada se parece de verdad
    %% HU-076
    P-->>C: No muestra alternativas; prefiere el vacío honesto al relleno
  end

  %% HU-076
  alt Muchos perfiles fallan uno solo
    %% HU-076
    P-->>C: Acota la lista en vez de devolver medio banco
  end

  %% HU-228
  C->>P: Toca «Pedir el perfil a medida» desde una opción sin perfiles, un cero por filtros o un equipo vacío
  %% HU-228
  P-->>C: Llega a la pantalla de cero con el rol como obligatorio de su Perfil Objetivo

  %% HU-228
  alt Eligió una categoría, no un rol, o no tiene Perfil Objetivo en este dispositivo
    %% HU-228
    P-->>C: Pide elegir el rol antes de seguir
  end

  %% HU-077
  C->>P: Envía la solicitud a medida
  %% HU-077
  P-->>C: Confirma con SOL-AAAA-NNNN y «10 días hábiles desde la fecha de envío», sin depender de HubSpot
  %% HU-077
  P->>H: Un solo trabajo en cola con la especificación completa (HU-102, origen «a medida» HU-106)

  %% HU-077
  alt Toque repetido o HubSpot no responde
    %% HU-077
    P-->>C: Una sola solicitud; el envío a HubSpot se reintenta sin que el cliente lo vea
  end

  %% HU-077
  alt Misma cuenta y mismos obligatorios en los últimos 7 días
    %% HU-077
    P-->>C: No duplica; ofrece añadir contexto a la existente
  end

  %% HU-078
  TH->>P: Abre el registro de demanda del mes
  %% HU-078
  P-->>TH: Solicitudes a medida con su especificación; ceros sin solicitud con el texto enmascarado (D130)

  %% HU-078
  alt Mes sin búsquedas fallidas
    %% HU-078
    P-->>TH: Lo declara explícitamente
  end

  %% HU-078
  alt Demanda inducida por sugerencias
    %% HU-078
    P-->>TH: La marca aparte
  end

  %% HU-189
  TH->>P: Registra una decisión de reclutamiento enlazada a búsquedas del registro
  %% HU-189
  P-->>TH: La decisión queda con fecha, texto y búsquedas que la motivaron

  %% HU-189
  alt Sin búsqueda que la motive o fecha posterior a hoy
    %% HU-189
    P-->>TH: Rechaza y explica
  end
```

## Trazabilidad

| Paso | HU | AC |
|---|---|---|
| Cero con especificación | HU-075 | AC-1 (happy) |
| Falta rol o seniority | HU-075 | AC-2 (error) |
| Deseables no llevan al cero | HU-075 | AC-3 (edge) |
| Banco selectivo | HU-227 | AC-1 (happy) |
| No se afirma lo que no es / sin conteo | HU-227 | AC-2 (edge) · AC-3 (error) |
| Lo más cercano | HU-076 | AC-1 (happy) · AC-2 (edge) |
| Nada se parece | HU-076 | AC-3 (error) |
| Muchos fallan uno | HU-076 | AC-4 (edge) |
| Pedir a medida desde otras pantallas | HU-228 | AC-1, AC-2 y AC-3 (happy) |
| Sin rol o sin Perfil Objetivo | HU-228 | AC-4 (edge) · AC-5 (error) |
| Solicitud a medida | HU-077 | AC-1 (happy) · AC-2 (edge) |
| Toque repetido / HubSpot no responde | HU-077 | AC-4 y AC-5 (error) |
| Solicitud reciente igual | HU-077 | AC-3 (edge) |
| Registro de demanda | HU-078 | AC-1 (happy) · AC-4 (edge) |
| Mes sin fallos | HU-078 | AC-2 (error) |
| Demanda inducida | HU-078 | AC-3 (edge) |
| Decisión de reclutamiento | HU-189 | AC-1 (happy) |
| Sin búsqueda / fecha futura | HU-189 | AC-2 y AC-3 (error) |

## Notas

**Discovery 2026-10-02.** La épica pasa de 4 a 7 historias: nacen **HU-227** (banco selectivo) y **HU-228** (pedir a medida desde la opción vacía del encuadre, el cero por filtros de HU-223 y el equipo vacío de HU-100; D121, D132 sobre HU-223), y entra **HU-189** desde EP-008 (D103). El cero causado por filtros es de EP-002 (HU-074, HU-223); esta pantalla es la del cero que dejan los obligatorios del Perfil Objetivo (RF-13.9.4). **D130** (elegida por el modelo): se mantienen PRD y ADR-0004; la especificación estructurada solo existe en el servidor si hubo solicitud a medida, y el cero sin solicitud se registra con el texto enmascarado. La solicitud a medida usa la tabla y el identificador de EP-005 y llega a HubSpot por el worker (D76).

**D-14 cerró sin umbral numérico.** «Lo más cercano» son los perfiles que fallan **exactamente un obligatorio**, indicando cuál. No hay porcentaje de similitud que calibrar.

**Esta épica no existe sin EP-009.** El camino del cero funciona porque hay un Perfil Objetivo que mostrar cuando no hay resultados.

**AC no diagramados:** HU-189 AC-4 (anular) y AC-5 (observador consulta Demanda).
