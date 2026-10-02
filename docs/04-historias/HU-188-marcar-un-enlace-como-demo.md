---
id: HU-188
titulo: "Marcar un enlace como demo para que no cuente en Medición"
epica: EP-008
prioridad: alta
complejidad: S
estado: lista
fase: telemetria-y-medicion
prd_version: 4.17
depende_de: [HU-167]
---

# HU-188 — Marcar un enlace como demo para que no cuente en Medición

**Como** integrante de Trycore que genera en el panel un enlace para enseñar el portal en una demostración,
**quiero** marcar ese enlace con una casilla «demo» al generarlo,
**para** que las visitas de la demostración, aunque entren con el correo de alguien de fuera, no se cuenten como interés real de una cuenta en ningún indicador de Medición.

## Criterios de aceptación

### Happy path — genero un enlace demo

**Dado** que estoy generando un enlace en el panel, con sus perfiles y sus correos invitados elegidos,
**cuando** lo genero con la casilla «demo» marcada,
**Entonces** el enlace aparece en la lista de enlaces con la marca «demo»
**Y** las visitas que entren por él quedan en Medición como sesiones demo, fuera de todos los indicadores, aunque el código se verifique con un correo que no es `@trycore.com`

### Edge case — la casilla no se marca

**Dado** que estoy generando un enlace en el panel,
**cuando** lo genero sin tocar la casilla «demo»,
**Entonces** la casilla estaba desmarcada por omisión y el enlace queda sin la marca «demo»
**Y** las visitas de clientes que entren por él cuentan como sesiones reales

### Error — intento marcar como demo un enlace ya generado

**Dado** que un enlace se generó sin la casilla «demo»,
**cuando** intento marcarlo como demo desde la lista de enlaces,
**Entonces** el panel no lo permite
**Y** me explica que la marca «demo» solo se fija al generar el enlace, para no reescribir lo que ya se midió, y que para una demostración genere otro enlace

### Edge case — el navegador dice otra cosa

**Dado** que un enlace demo está abierto en el portal,
**cuando** el navegador manda un lote de eventos sin la marca demo o con la marca de sesión real,
**Entonces** el servidor conserva la marca «demo» que tomó del enlace
**Y** los eventos de esa visita siguen fuera de los indicadores

## Notas

**Nace el 2026-10-02 por D68** (sponsor; cierra T-26 en su definición): una **sesión real** es la que tiene **código verificado de un correo que no es `@trycore.com`**; las demos se marcan con una casilla «demo» **al generar el enlace** y no cuentan. La generación de enlaces es pantalla del panel de EP-001 (HU-122, ya construida); la casilla no cabe en HU-122 ni en HU-167 sin pasar de cinco escenarios, así que vive aquí, en EP-008. **Toca código ya construido:** añade la casilla y la columna del enlace sin cambiar el resto de la generación.

**Por qué hace falta además del dominio.** El filtro `@trycore.com` (HU-167) no basta: en una demostración se suele entrar con el correo de un cliente invitado o de un aliado, y esa visita contaría como interés real de una cuenta. La marca la pone el servidor desde el enlace (`enlace_tokens`), nunca el navegador (mismo principio que la marca interna, ADR-0006).

**Opción conservadora del error.** La marca se fija al generar y no se cambia después: cambiarla reescribiría meses ya cerrados del tablero (HU-171). Si el sponsor prefiere poder corregir una marca olvidada, el cambio tendría que dejar rastro y recalcular; no se adopta sin su decisión.

**Quién puede generarlo.** Lo genera quien hoy puede generar enlaces en el panel (administrador, RF-8.1.2). Las **ediciones curadas** de EP-011 (HU-114) se envían a clientes reales y no llevan casilla; si se quiere una demo de una edición, se pregunta al sponsor.

**Dónde se ve el efecto.** HU-167 (marca en el recorrido), HU-168 (entrada demo fuera del embudo) y HU-171 (cuántas visitas demo dejó fuera el tablero). Todas las lecturas de Medición cuentan solo sesiones reales.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-7.1 · RF-7.3 · §11 KPIs · ADR-0006 (marca del lado del servidor) · T-26 · D68 (sponsor, 2026-10-02) · pantalla de EP-001 (HU-122) · relacionada con HU-167, HU-168 y HU-171 · depende de HU-167

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: usa la marca de sesión de HU-167 y la generación de enlaces de EP-001, ya construida; las lecturas que la respetan no la bloquean |
| N | Negociable | ✓ fija la casilla al generar, desmarcada por omisión, que la marca no se cambie después y que la ponga el servidor; el diseño de la casilla y de la marca en la lista son negociables |
| V | Valiosa | ✓ sin ella las demostraciones con correos de fuera inflan la conversión, el embudo y el acierto que Mercadeo reporta a Dirección General |
| E | Estimable | ✓ S: una casilla y una columna en la generación de enlaces, la marca en la sesión al verificar el código y su exclusión en las vistas de Medición |
| S | Pequeña | ✓ S: una capacidad (marcar una demo) en cuatro escenarios |
| T | Testeable | ✓ enlaces generados con y sin la casilla, una visita demo con correo de cliente, el intento de marcar un enlace ya generado y un lote con la marca alterada dan marcas y conteos observables |
