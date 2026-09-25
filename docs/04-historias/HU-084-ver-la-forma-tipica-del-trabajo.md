---
id: HU-084
titulo: "Ver la forma típica del trabajo que estoy por emprender"
epica: EP-004
prioridad: media
complejidad: M
estado: draft
fase: fase-2-rediseno
prd_version: 4.8
---

# HU-084 — Ver la forma típica del trabajo que estoy por emprender

**Como** líder de proyecto que declaró un reto y seleccionó algunos perfiles,
**quiero** ver qué capacidades suelen requerir los proyectos como el mío y cuáles ya cubrí,
**para** no descubrir a mitad de camino que me faltaba una capacidad que era evidente para quien ya hizo esto antes.

## Criterios de aceptación

### Happy path — forma de referencia informativa

**Dado** que mi reto corresponde a un tipo de proyecto con composición de referencia registrada,
**cuando** reviso mi equipo,
**Entonces** veo qué capacidades suele requerir ese tipo de proyecto y cuáles cubre mi selección
**Y** veo de cuántos proyectos entregados sale esa referencia
**Y** no veo perfiles propuestos ni botones de añadir

### Error — tipo de proyecto sin composición registrada

**Dado** que mi reto no corresponde a ningún tipo de proyecto con datos reales,
**cuando** reviso mi equipo,
**Entonces** no veo ninguna composición de referencia
**Y** no se muestra una composición genérica inventada para llenar el espacio

### Edge case — el cliente descarta la referencia

**Dado** que vi la composición de referencia y la descarto,
**cuando** sigo usando el portal en la misma sesión,
**Entonces** no vuelve a aparecer
**Y** puedo enviar la solicitud sin ninguna advertencia adicional

### Edge case — selección completa

**Dado** que mi selección cubre todas las capacidades de la referencia,
**cuando** reviso mi equipo,
**Entonces** la referencia lo confirma sin proponer nada más

## Notas

**D-19 cerrada el 2026-09-21: solo los tres tipos de proyecto más frecuentes.** Delivery entrega la composición real de esos tres. Fuera de ellos el portal calla, que es el escenario del AC de error. Desbloquea esta historia.

**Regla dura de RF-14.7.1:** las composiciones se construyen sobre proyectos que Trycore entregó realmente. Una composición inventada para inflar la solicitud es el peor tipo de humo y se detecta de inmediato. Si el dato no existe, no se muestra: mismo criterio que cerró D-15.

**Regla de tono (RF-14.7.2):** quien nombra la meta es el cliente. El portal le devuelve la forma del trabajo y él saca la conclusión. Ahí está la diferencia entre acompañar y vender, y en una relación de expansión de cuenta esa diferencia es el activo.

**Prueba que la falsea:** si la referencia no sube el promedio de perfiles por solicitud, o si sube el abandono en la pantalla de equipo, era venta cruzada disfrazada de ayuda y se retira.

Cubre RF-14.7. Es el primer peldaño verificable de la venta de células (V2-4).

**Bloqueada por D-19.** Delivery debe entregar las composiciones reales de los proyectos entregados.

## Trazabilidad

Épica madre: **EP-004** · PRD v2.3 · Depende de HU-083

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-083 para el reto |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Delivery según D-19 |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |
