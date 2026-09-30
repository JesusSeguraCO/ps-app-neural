---
id: HU-138
titulo: "Consultar quién cambió qué y cuándo"
epica: EP-006
prioridad: alta
complejidad: M
estado: lista
fase: panel-crud
prd_version: 4.8
depende_de: [HU-123]
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

### Error — cambio sin identidad verificada

**Dado** que mi sesión del panel venció,
**cuando** intento guardar un cambio en un perfil,
**Entonces** el panel no aplica el cambio y me pide volver a entrar
**Y** el registro del perfil no contiene ningún cambio sin autor

### Edge case — cambio que entró por importación masiva

**Dado** que un campo del perfil cambió por una importación masiva,
**cuando** abro su registro de auditoría,
**Entonces** el cambio aparece atribuido a la importación y a la persona que la confirmó, con su fecha
**Y** puedo llegar desde ahí al registro de esa importación

### Edge case — cambio que entró por la carga del sistema de asignación

**Dado** que la disponibilidad del perfil cambió por una carga de Operaciones desde el sistema de asignación,
**cuando** abro su registro de auditoría,
**Entonces** el cambio aparece atribuido a esa carga y a la persona que la disparó
**Y** se muestra la fecha de corte de la hoja cargada

### Edge case — perfil archivado

**Dado** que un perfil está archivado,
**cuando** consulto su registro de auditoría,
**Entonces** veo su historial completo, con la fecha y el autor de cada cambio
**Y** el archivado aparece como un cambio de estado más

## Notas

Cubre **RF-8.9**.

**Esta historia no existe sin HU-123.** RF-8.1.3 lo declara: el «quién» del registro solo existe si hay identidad. Construir auditoría sobre un panel sin autenticación produce un registro que no responde la única pregunta que importa. Por eso el error propio es la sesión vencida: sin identidad verificada el cambio no entra (RF-8.1.6, sesión de una jornada).

**El caso de uso real es defensivo.** Cuando una cuenta diga «ustedes me mostraron a Fulano con experiencia en banca», alguien tiene que poder verificarlo. Es la misma razón por la que los perfiles se archivan y no se borran (HU-135) y por la que cada enlace curado lleva registro (HU-122).

**Los procesos también tienen autor.** La importación masiva registra quién, cuándo, origen, modo y estado anterior de cada perfil tocado (`docs/10-specs/importacion-masiva.md`); la carga de Operaciones de HU-137 (D8) se atribuye igual. Ningún cambio queda como «sistema» sin una persona detrás.

**Revisión INVEST 2026-09-30:** el antiguo «Error — sin autor» se separa en dos edges (importación masiva y carga del sistema de asignación) y se añade como error real el intento de guardar sin identidad verificada; el Then no observable del archivado («puedo explicar qué se mostró») se reemplaza por «veo su historial completo con fecha y autor»; I pasa a ✓ porque HU-123 ya está construida (EP-001 integrada); se declara `depende_de: [HU-123]`.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · RF-8.9 · RF-8.1.3 · depende de HU-123 (construida en EP-001) · relacionada con HU-135, HU-137 y HU-141

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ su única dependencia, HU-123 (identidad del panel), ya está construida e integrada en EP-001 |
| N | Negociable | ✓ qué se registra lo fija RF-8.9; la presentación del registro, los filtros y la navegación a la importación son negociables |
| V | Valiosa | ✓ sostiene la capacidad de responder ante una cuenta con evidencia |
| E | Estimable | ✓ un registro por cambio de campo con autor y fecha, escrito por la edición, la importación y la carga; falta la cifra del equipo |
| S | Pequeña | ✓ M: una vista de lectura sobre un registro que los flujos de escritura ya alimentan |
| T | Testeable | ✓ cinco escenarios con cambios fijables (edición, sesión vencida, importación, carga, archivado) y un registro observable |
