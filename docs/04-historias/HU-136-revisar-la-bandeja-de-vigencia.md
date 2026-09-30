---
id: HU-136
titulo: "Revisar la bandeja de vigencia"
epica: EP-006
prioridad: alta
complejidad: S
estado: lista
fase: panel-crud
prd_version: 4.8
depende_de: [HU-132]
---

# HU-136 — Revisar la bandeja de vigencia

**Como** administradora de inventario de Talento Humano,
**quiero** una bandeja con los perfiles publicados que llevan más de 30 días sin actualizarse y los pausados hace más de 30 días,
**para** que ningún cliente vea como disponible a alguien que ya no lo está ni se quede sin ver a alguien que volvió a estarlo.

## Criterios de aceptación

### Happy path — publicados sin actualizar, con trabajo concreto

**Dado** que hay perfiles publicados cuya disponibilidad no se actualiza hace más de 30 días,
**cuando** abro la bandeja de vigencia,
**Entonces** los veo marcados para revisión, ordenados por antigüedad del último cambio
**Y** desde cada fila puedo actualizar la disponibilidad en dos clics sin abrir la ficha

### Happy path — pausado hace más de 30 días

**Dado** que un perfil lleva más de 30 días en estado *pausado*,
**cuando** abro la bandeja de vigencia,
**Entonces** aparece marcado para revisión junto a los publicados vencidos
**Y** la fila indica que está pausado, su motivo de pausa y desde qué fecha

### Error — perfil sin fecha de última actualización

**Dado** que un perfil publicado no tiene registrada la fecha de su última actualización de disponibilidad,
**cuando** abro la bandeja de vigencia,
**Entonces** el perfil aparece en la bandeja marcado como «dato incompleto»
**Y** no se omite de la lista ni se trata como si estuviera al día

### Edge case — bandeja vacía

**Dado** que ningún perfil publicado lleva más de 30 días sin actualizarse y ninguno lleva más de 30 días pausado,
**cuando** abro la bandeja de vigencia,
**Entonces** el panel declara explícitamente que no hay perfiles pendientes de revisión
**Y** no muestra una lista vacía sin explicación

### Edge case — perfil vencido que ya se muestra como «por confirmar»

**Dado** que un perfil vencido ya aparece en el portal como «Disponibilidad por confirmar»,
**cuando** abro la bandeja de vigencia,
**Entonces** ese perfil aparece al principio de la lista
**Y** su fila indica que el cliente ya está viendo esa advertencia

## Notas

Cubre **RF-8.8** y se conecta con **RF-8.14.4**.

**La bandeja es el instrumento de O5.** El objetivo pide 90% de perfiles publicados con disponibilidad actualizada en los últimos 30 días; la bandeja es exactamente la lista de los que lo incumplen. Sin ella, el objetivo se mide pero no se gestiona.

**El edge case ordena por daño, no por antigüedad.** Un perfil que ya está mostrando «por confirmar» a los clientes cuesta credibilidad ahora; uno que lleva 31 días pero con fecha futura vigente, todavía no.

**Pausados en la bandeja (D4, sponsor, 2026-09-30).** Un perfil pausado hace más de 30 días se marca para revisión y aparece aquí, igual que un publicado sin actualizar. La pausa sin revisar es inventario que se pierde en silencio; la regla que lo marca vive en HU-133 y la lista que lo muestra, aquí.

**Un dato ausente no es un dato al día.** Si falta la fecha de última actualización, omitir el perfil lo haría invisible justo al instrumento que debe detectarlo; por eso se muestra como «dato incompleto» (PRD, Anexo B.3: cada perfil registra cuándo se actualizó por última vez su disponibilidad).

**Revisión INVEST 2026-09-30:** «para» reorientado al efecto sobre el cliente; el antiguo «Error — bandeja vacía» pasa a edge y se añade el error real (fecha de última actualización ausente → «dato incompleto»); alcance ampliado a pausados > 30 días por D4 con su escenario propio; se declara `depende_de: [HU-132]` porque la actualización en dos clics dentro de la bandeja es la de esa historia; el When del edge «por confirmar» pasa a ser una acción («abro la bandeja»).

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · RF-8.8 · O5 · D4 (sponsor, 2026-09-30) · depende de HU-132 · relacionada con HU-133 y HU-134

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-132 (declarada): la actualización en dos clics desde la fila es la de esa historia; la bandeja como lista puede construirse antes, pero no cierra su happy path sin ella |
| N | Negociable | ✓ los 30 días vienen del PRD y de D4; el orden secundario, la forma de la fila y el texto de «dato incompleto» son negociables |
| V | Valiosa | ✓ convierte O5 en lista de trabajo y evita que un cliente vea disponibilidades vencidas o pierda perfiles pausados olvidados |
| E | Estimable | ✓ una consulta con dos condiciones (publicado > 30 días sin actualizar, pausado > 30 días) más la marca de dato incompleto y un orden; falta la cifra del equipo |
| S | Pequeña | ✓ S: una vista de lista que reutiliza la acción de HU-132 y la regla de pausa de HU-133 |
| T | Testeable | ✓ cinco escenarios con datos fijables por fecha (31 días publicado, 31 días pausado, fecha nula, ninguno vencido, vencido con «por confirmar») y resultado observable en la lista |
