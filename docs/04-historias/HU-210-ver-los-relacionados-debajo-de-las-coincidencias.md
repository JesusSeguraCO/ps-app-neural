---
id: HU-210
titulo: "Ver debajo de las coincidencias a quienes cumplen todo menos un requisito"
epica: EP-009
prioridad: alta
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-118, HU-209]
---

# HU-210 — Ver debajo de las coincidencias a quienes cumplen todo menos un requisito

**Como** líder de área que busca un perfil en un banco de decenas,
**quiero** ver, debajo de las coincidencias directas, a los perfiles que cumplen todo menos uno de mis requisitos obligatorios, con el requisito que les falta,
**para** no concluir que no hay nada cuando hay algo cercano.

## Criterios de aceptación

### Happy path — relacionados bajo las coincidencias directas

**Dado** que el banco tiene 12 perfiles de Desarrollador Frontend, 5 de ellos con Banca, y ningún perfil de otro rol con Banca
**Y** que tengo «Desarrollador Frontend» obligatorio
**Cuando** marco «Banca» como obligatorio
**Entonces** veo arriba las 5 coincidencias directas y debajo la sección «Relacionados» con los 3 primeros de los 7 Desarrolladores Frontend sin Banca, cada uno con «Cumple todo menos: Banca», y «3 de 7 · Ver los otros 4»
**Y** el contador del panel dice 5: los relacionados no cuentan como resultados

### Edge case — quien falla dos obligatorios no es relacionado

**Dado** que tengo «Desarrollador Frontend» y «Banca» obligatorios
**Y** que un Desarrollador Frontend semi-senior no tiene Banca
**Cuando** marco «Senior» como obligatorio
**Entonces** ese perfil, que ahora falla Banca y Senior, no aparece en la sección «Relacionados»

### Edge case — otro rol no es un casi acierto

**Dado** que el banco tiene 12 Desarrolladores Frontend y 14 Desarrolladores Backend
**Cuando** envío «desarrollador frontend», con el rol como único obligatorio
**Entonces** veo los 12 Desarrolladores Frontend y no aparece la sección «Relacionados»
**Y** ningún Desarrollador Backend se muestra como casi acierto

### Error — sin coincidencias directas no hay sección de relacionados

**Dado** que tengo «Desarrollador Frontend» y «Banca» obligatorios con 5 perfiles, ninguno Líder técnico
**Cuando** marco «Líder técnico» como obligatorio
**Entonces** no aparece la sección «Relacionados» en la lista de resultados
**Y** veo el aviso único del panel (HU-209), que es la entrada al camino del cero de EP-010

## Notas

Cubre **RF-2.6.1** (los resultados se presentan en dos niveles, coincidencias directas y relacionados: un buscador que devuelve cero ante un casi acierto es peor que no tener buscador). La revisión de trazabilidad del 2026-09-22 (§4.5, m-4) señaló que ninguna historia lo materializaba.

**Nace el 2026-10-02 (discovery de EP-009).** ADR-0004 (revisión adversarial, H35) fija **«Relacionados» = `masCercanos()`** del mismo `evaluar()`: los que fallan exactamente un obligatorio, en una sección bajo las coincidencias directas, rotulada con el criterio que falla; sin coincidencias directas es el camino del cero (RF-13.9.4), que es de EP-010.

**Decisiones por delegación del sponsor (elegidas por el modelo):**
- **Con un solo obligatorio no hay relacionados.** Fallar el único obligatorio es no cumplir ninguno: todo el resto del banco «fallaría uno» y la sección sería relleno, justo lo que el «en contra» de RF-14.3 llama peor que no mostrar nada. Es **la misma regla de `masCercanos()` que HU-076 (EP-010)** aplica a «lo más cercano» de la pantalla del cero: un solo cálculo para los dos niveles.
- **Tres relacionados visibles**, ordenados por deseables cumplidos y, a igualdad, con el desempate del motor; el resto tras «3 de N · Ver los otros M» (mismo tope que HU-076).
- **Lectura de HU-174** (lista, no se modifica): su «ese perfil no aparece entre los resultados» se refiere a la lista de coincidencias directas. La sección «Relacionados» es un nivel aparte, rotulado, que sí muestra el «–» del obligatorio que falla y nunca entra en el contador.

**Medición:** el evento `cercanos_mostrados` (ADR-0006) lo incorpora EP-002 o el primer slice que lo emita.

## Trazabilidad

Épica madre: **EP-009** · PRD v4.18 · RF-2.6.1 · RF-13.9.4 · RF-14.3 (en contra) · ADR-0004 (relacionados = `masCercanos()`) · revisión de trazabilidad 2026-09-22 §4.5 · depende de HU-118 y HU-209 (misma épica) · relacionada con HU-174, HU-076 (EP-010) y HU-119 (EP-003, línea ✓/–)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas de la misma épica (motor y obligatorios) |
| N | Negociable | ✓ son fijos el nivel aparte, el rótulo del criterio que falla, que no cuentan como resultados y que con un solo obligatorio no hay relacionados; el tope de tres y la forma se negocian |
| V | Valiosa | ✓ el cliente ve lo que casi encaja en lugar de concluir que el banco no tiene nada |
| E | Estimable | ✓ S: `masCercanos()` sale del mismo `evaluar()` y la sección reutiliza la tarjeta existente |
| S | Pequeña | ✓ S: cuatro escenarios |
| T | Testeable | ✓ unitarios de `masCercanos()` y e2e con banco sembrado: quién entra, quién no, rótulo y contador |
