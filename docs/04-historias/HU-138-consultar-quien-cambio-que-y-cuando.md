---
id: HU-138
titulo: "Consultar quién cambió qué y cuándo"
epica: EP-006
prioridad: alta
complejidad: M
estado: draft
fase: panel-crud
prd_version: 4.8
---

# HU-138 — Consultar quién cambió qué y cuándo

**Como** administradora de inventario de Talento Humano,
**quiero** consultar el registro de cambios de un perfil,
**para** poder responder con evidencia cuando alguien pregunte por qué una ficha dice lo que dice.

## Criterios de aceptación

### Happy path — registro por perfil

**Dado** que un perfil tuvo cambios,
**cuando** abro su registro de auditoría,
**Entonces** veo qué campo cambió, su valor anterior y el nuevo, quién lo hizo y cuándo
**Y** los cambios de consentimiento y de estado aparecen igual que los de contenido

### Error — cambio sin autor identificable

**Dado** que un cambio entró por importación masiva o por sincronización,
**cuando** lo veo en el registro,
**Entonces** aparece atribuido al proceso y a quien lo disparó
**Y** nunca queda un cambio sin autor

### Edge case — perfil archivado

**Dado** que un perfil está archivado,
**cuando** consulto su registro,
**Entonces** sigo viendo su historia completa
**Y** puedo explicar qué se mostró al cliente en una solicitud pasada

## Notas

Cubre **RF-8.9**.

**Esta historia no existe sin HU-123.** RF-8.1.3 lo declara: el «quién» del registro solo existe si hay identidad. Construir auditoría sobre un panel sin autenticación produce un registro que no responde la única pregunta que importa.

**El caso de uso real es defensivo.** Cuando una cuenta diga «ustedes me mostraron a Fulano con experiencia en banca», alguien tiene que poder verificarlo. Es la misma razón por la que los perfiles se archivan y no se borran (HU-135) y por la que cada enlace curado lleva registro (HU-122).

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · depende de HU-123 · relacionada con HU-135

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-123 — sin identidad no hay autor |
| N | Negociable | ✓ |
| V | Valiosa | ✓ sostiene la capacidad de responder ante una cuenta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
