---
id: flow-002-refinamiento-y-descubrimiento
epica: EP-002
historias_cubiertas: [HU-074, HU-121]
---

# Flow 002 — Refinamiento y descubrimiento del banco

## Resumen

Lo que el cliente hace **después** de que la instrucción devolvió resultados. Actor principal: el **Cliente**. Condición de éxito: acota o amplía el conjunto sin perder lo que la instrucción entendió, y puede leer muchos perfiles por el mismo criterio.

## Diagrama

```mermaid
sequenceDiagram
  participant C as Cliente
  participant P as Portal

  %% HU-074
  C->>P: Aplica una faceta sobre el resultado de la instrucción
  %% HU-074
  P-->>C: Acota sin descartar la especificación, con contadores y estado en la URL

  %% HU-074
  alt El filtro deja cero resultados
    %% HU-074
    P-->>C: Un solo aviso de cero con los criterios removibles
  end

  %% HU-074
  alt Filtrar sin instrucción previa
    %% HU-074
    P-->>C: Las facetas operan sobre el banco completo
  end

  %% HU-121
  C->>P: Conmuta de tarjetas a vista de tabla
  %% HU-121
  P-->>C: Una columna por criterio activo y conteo de deseables

  %% HU-121
  alt Sin criterios activos
    %% HU-121
    P-->>C: La tabla muestra los atributos base y explica qué la enriquece
  end

  %% HU-121
  C->>P: Selecciona varios perfiles desde la tabla
  %% HU-121
  P-->>C: Los suma a Mi equipo de una vez

  %% HU-121
  C->>P: Abre un perfil desde la tabla
  %% HU-121
  P-->>C: Ficha en panel lateral, sin perder la tabla

  %% HU-121
  alt Pantalla estrecha
    %% HU-121
    P-->>C: La tabla degrada a tarjetas sin perder los criterios
  end
```

## Trazabilidad

| Paso | HU | AC |
|---|---|---|
| Faceta sobre instrucción | HU-074 | AC-1 (happy) |
| Cero por filtro | HU-074 | AC-2 (error) |
| Faceta sin instrucción | HU-074 | AC-3 (edge) |
| Conmutar de vista | HU-121 | AC-1 (happy) |
| Tabla sin criterios | HU-121 | AC-4 (error) |
| Selección múltiple | HU-121 | AC-2 (happy) |
| Abrir perfil desde tabla | HU-121 | AC-3 (happy) |
| Pantalla estrecha | HU-121 | AC-5 (edge) |

## Notas

**Esta épica contiene la prueba que puede tumbar la Fase 2.** Si más de la mitad de las sesiones usa filtros después de haber escrito una instrucción, la subordinación de las facetas está mal hecha (PRD §14.2). El flujo se diagrama como refinamiento, no como entrada: si la medición dice lo contrario, este diagrama se invierte.

**Sin historia escrita en esta épica:** RF-10 (sondeo de agentes autónomos en el grid) y RF-11 (espacio no-perfil). Están en `epicas.md` y no tienen historia. Ver §Deuda de mapa.
