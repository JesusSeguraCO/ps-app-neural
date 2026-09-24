---
id: flow-010-el-camino-del-cero
epica: EP-010
historias_cubiertas: [HU-075, HU-076, HU-077, HU-078]
---

# Flow 010 — El camino del cero

## Resumen

Qué pasa cuando el banco no tiene lo que el cliente pidió. Actores: el **Cliente** y **Talento Humano** como lector del registro. Condición de éxito: el cero deja de ser un callejón sin salida y se convierte en demanda registrada.

## Diagrama

```mermaid
sequenceDiagram
  participant C as Cliente
  participant P as Portal
  participant TH as Talento Humano

  %% HU-075
  C->>P: Aplica una especificación que el banco no cubre
  %% HU-075
  P-->>C: Muestra el cero con la especificación a la vista, no una pantalla vacía

  %% HU-075
  alt El cero se produce por un filtro y no por el banco
    %% HU-075
    P-->>C: Lo distingue y señala qué filtro quitar
  end

  %% HU-076
  P-->>C: Ofrece los perfiles que fallan exactamente un criterio, diciendo cuál

  %% HU-076
  alt Ningún perfil supera el umbral
    %% HU-076
    P-->>C: No muestra alternativas, prefiere el vacío honesto al relleno
  end

  %% HU-076
  alt Muchos perfiles apenas por encima del umbral
    %% HU-076
    P-->>C: Acota la lista en vez de devolver medio banco
  end

  %% HU-077
  C->>P: Solicita el perfil que no existe todavía
  %% HU-077
  P-->>C: Confirma la solicitud dirigida con su especificación completa

  %% HU-077
  alt Falla la creación en el CRM
    %% HU-077
    P-->>C: Conserva la solicitud y la encola, como en EP-007
  end

  %% HU-077
  alt Segunda solicitud de la misma especificación en días recientes
    %% HU-077
    P-->>C: No duplica, añade contexto a la existente
  end

  %% HU-078
  P->>TH: Registra la especificación estructurada de la búsqueda fallida
  %% HU-078
  TH->>P: Consulta el registro de demanda
  %% HU-078
  P-->>TH: Especificación, cuenta, fecha y si terminó en solicitud dirigida

  %% HU-078
  alt Período sin búsquedas fallidas
    %% HU-078
    P-->>TH: Lo declara explícitamente
  end

  %% HU-078
  alt Demanda inducida por sugerencias del portal
    %% HU-078
    P-->>TH: La marca aparte, no se confunde con demanda espontánea
  end
```

## Trazabilidad

| Paso | HU | AC |
|---|---|---|
| Cero con especificación | HU-075 | AC-1 (happy) |
| Cero por filtro | HU-075 | AC-3 (edge) |
| Cercanos por un criterio | HU-076 | AC-1 (happy) |
| Nada supera el umbral | HU-076 | AC-2 (error) |
| Muchos apenas por encima | HU-076 | AC-3 (edge) |
| Solicitud dirigida | HU-077 | AC-1 (happy) |
| Falla en el CRM | HU-077 | AC-2 (error) |
| Segunda solicitud igual | HU-077 | AC-3 (edge) |
| Registro de demanda | HU-078 | AC-1 (happy) |
| Período sin fallos | HU-078 | AC-2 (error) |
| Demanda inducida | HU-078 | AC-3 (edge) |

## Notas

**D-14 cerró sin umbral numérico.** «Lo más cercano» son los perfiles que fallan **exactamente un criterio**, indicando cuál. No hay porcentaje de similitud que calibrar, y esa es la razón por la que HU-076 es construible hoy.

**Esta épica no existe sin EP-009.** El camino del cero funciona porque hay un Perfil Objetivo que mostrar cuando no hay resultados. Construirlo sobre facetas sería volver al estado de error: un cero sin especificación a la vista es una pantalla vacía.

**HU-078 quedó como la historia canónica del registro de demanda** (2026-09-22). HU-110 la duplicaba y se reescribió para cubrir la otra mitad de RF-7.2 —el reporte de filtros más usados—, que no tenía historia. El registro de demanda vive entero aquí, donde están su dueño y su cadencia: Talento Humano, revisión mensual (D-13).

**AC no diagramado:** HU-075 AC-2 (especificación demasiado vaga para solicitar).
