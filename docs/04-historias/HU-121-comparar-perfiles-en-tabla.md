---
id: HU-121
titulo: "Comparar muchos perfiles por el mismo criterio"
epica: EP-002
prioridad: alta
complejidad: M
estado: prototipado
fase: referencias-juicebox
prd_version: 4.2
---

# HU-121 — Comparar muchos perfiles por el mismo criterio

**Como** líder de proyecto con varios perfiles candidatos,
**quiero** ver los resultados como tabla, con una columna por criterio,
**para** comparar leyendo columnas en lugar de abrir tarjeta por tarjeta.

## Criterios de aceptación

### Happy path — conmutar de vista

**Dado** que tengo resultados,
**cuando** cambio a la vista de tabla,
**Entonces** veo una fila por perfil y una columna por cada criterio activo
**Y** cada celda muestra si lo cumple o no
**Y** al pasar el cursor veo el dato que lo sustenta
**Y** la vista elegida se mantiene mientras siga navegando

### Happy path — seleccionar varios y sumarlos de una vez

**Dado** que la tabla está a la vista,
**cuando** marco varios perfiles,
**Entonces** aparece una acción para sumarlos todos al equipo
**Y** al usarla se suman los que no estuvieran ya
**Y** la selección se limpia

### Happy path — abrir un perfil desde la tabla

**Dado** que veo una fila que me interesa,
**cuando** la toco,
**Entonces** se abre el panel lateral con la ficha
**Y** puedo pasar al siguiente perfil sin cerrar

### Error — sin criterios activos

**Dado** que no definí ningún criterio,
**cuando** miro la tabla,
**Entonces** veo las columnas base —perfil, disponibilidad, modalidad, país— sin columnas de criterio vacías
**Y** no aparece la columna de conteo de deseables

### Edge case — pantalla estrecha

**Dado** que estoy en un teléfono,
**cuando** abro la tabla,
**Entonces** se desplaza horizontalmente dentro de su contenedor
**Y** la página no se arrastra de lado

## Notas

Tomado de Juicebox, que ofrece vista clásica y vista de tabla (evidencia A).

**Para qué sirve cada vista:** las tarjetas sirven para evaluar un perfil a la vez; la tabla sirve para comparar muchos por el mismo criterio. Son tareas distintas y ninguna sustituye a la otra.

**Dos diferencias deliberadas con el referente.** Ellos muestran «Match 100%»; nosotros mostramos **«cumple 3 de 4»**, porque un porcentaje sugiere una precisión que no existe con cuatro criterios y además oculta cuáles cumple. Y no replicamos las columnas de empresa actual ni de enlace al perfil público: contradicen la decisión de no exponer contacto ni empleador de forma directa.

**Lo que la tabla habilita y la grilla no:** la selección múltiple. Es el motivo principal para tenerla.

Cubre RF-13.12.

## Trazabilidad

Épica madre: **EP-002** · PRD v4.2

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ opera sobre los resultados existentes |
| N | Negociable | ✓ |
| V | Valiosa | ✓ |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
