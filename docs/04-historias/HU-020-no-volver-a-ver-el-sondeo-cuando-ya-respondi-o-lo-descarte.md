---
id: HU-020
titulo: "No volver a ver la pregunta de Trycore cuando ya respondí o la descarté"
epica: EP-002
prioridad: media
complejidad: S
estado: lista
fase: refinamiento-y-descubrimiento
prd_version: 4.18
depende_de: [HU-019, HU-167]
---

# HU-020 — No volver a ver la pregunta de Trycore cuando ya respondí o la descarté

**Como** líder de área que ya vio la pregunta de Trycore sobre agentes autónomos,
**quiero** descartarla para siempre y que no me la vuelvan a mostrar si ya respondí, ni se repita mientras exploro,
**para** que una pregunta que ya atendí no siga ocupando el lugar de un perfil cada vez que busco.

## Criterios de aceptación

### Happy path — descartar para siempre

**Dado** que veo el sondeo en «Todo el banco» con 12 perfiles,
**cuando** toco «No mostrar más»,
**Entonces** el sondeo desaparece y su lugar lo ocupa el perfil siguiente
**Y** no vuelve a aparecer en esta visita ni en las siguientes, en ningún dispositivo en el que entre con mi correo invitado

### Edge case — ya respondí en otra visita o desde otro dispositivo

**Dado** que respondí el sondeo en una visita anterior desde otro dispositivo,
**cuando** abro «Todo el banco» con 12 perfiles,
**Entonces** no aparece el sondeo

### Edge case — una sola vez por visita

**Dado** que en esta visita vi el sondeo sin responder ni descartarlo,
**cuando** cambio los filtros y siguen quedando 10 perfiles,
**Entonces** el sondeo no vuelve a aparecer en esta visita
**Y** en los resultados nunca hay una segunda copia del sondeo

### Edge case — una visita nueva sin haber respondido

**Dado** que vi el sondeo en una visita anterior sin responder ni descartarlo, y esa visita terminó tras 30 minutos sin actividad,
**cuando** abro «Todo el banco» con 12 perfiles en una visita nueva,
**Entonces** el sondeo aparece una vez más, en su lugar fijo

### Error — el descarte no se pudo guardar

**Dado** que veo el sondeo y el portal no logra guardar el descarte en este momento,
**cuando** toco «No mostrar más»,
**Entonces** el sondeo desaparece igual en esta visita
**Y** el portal reintenta guardar el descarte, sin pedirme nada

## Notas

Cubre **RF-10.4** («una vez por sesión, en posición fija, descartable de forma persistente. No se repite al desplazarse, no reaparece al cambiar filtros y no vuelve en visitas siguientes si el usuario ya votó o la descartó»). La posición fija es de **HU-226**; votar, de **HU-019**.

**Nace el 2026-10-02 (discovery de EP-002)** con el identificador HU-020 que el mapa y el backlog reservaban para el sondeo.

**Decisiones elegidas por el modelo por delegación del sponsor:**
- **«Sesión» = la visita** que define HU-167 (EP-008): termina tras **30 minutos sin actividad** (D73). No es la sesión de acceso de 30 días (RF-1.2), que haría aparecer el sondeo una vez al mes.
- **«Una vez por visita»**: aparece la primera vez que el grid de descubrimiento tiene 8 o más perfiles en esa visita; si el cliente cambia los filtros sin responder, no vuelve en esa visita (lectura literal de «no reaparece al cambiar filtros»).
- **El voto y el descarte se guardan en el servidor, por invitado**, no en el navegador. El PRD dice «no vuelve en visitas siguientes»; con identidad nominal (D-4), una visita siguiente puede ser desde otro dispositivo. **Diverge de ADR-0004**, que proponía guardar el descarte en `localStorage`: hay que enmendar esa línea en el change de EP-002. Sin cambio de alcance.
- **Degradación honesta del descarte**: si el reintento se agota, el sondeo puede aparecer una vez más en una visita siguiente, nunca en la misma.
- **Por invitado, no por cuenta**: que un colega de la misma cuenta haya respondido no le quita la pregunta a otro; cada uno es una señal (y el umbral cuenta cuentas distintas, HU-225).

## Trazabilidad

Épica madre: **EP-002** · PRD v4.18 · RF-10.4 · D-4 · ADR-0004 (enmienda: descarte en servidor por invitado) · id reservado en el mapa y el backlog (HU-019 – HU-020) · depende de HU-019 (el sondeo) y HU-167 (EP-008, definición de visita) · relacionada con HU-226 y HU-225

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: el sondeo de HU-019 (misma épica) y la definición de visita de HU-167 (EP-008, `lista`), que se construye antes porque EP-002 emite contra su contrato |
| N | Negociable | ✓ fijos: descarte y voto persistentes por invitado, una vez por visita, sin copias al desplazarse; el texto del botón y la duración de la visita (D73) son negociables |
| V | Valiosa | ✓ una pregunta atendida deja de ocupar el lugar de un perfil, que es la condición para que el sondeo no abarate el portal |
| E | Estimable | ✓ S: un registro de descarte por invitado, la consulta de voto o descarte antes de colocar el espacio y una marca por visita |
| S | Pequeña | ✓ S: cinco escenarios de una sola regla de frecuencia |
| T | Testeable | ✓ e2e con un invitado sembrado en dos contextos de navegador, visitas fijadas a más de 30 minutos y un fallo simulado del guardado |
