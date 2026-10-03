# Tarea 8.1 · recorrido integrado de EP-003 en navegador real

- HEAD: `71305dac2f3f5c380721dc2b27319762924cc86e` (el spec se commitea encima; solo e2e, sin cambio de producto)
- Rama: `feature/ep-003-evidencia-del-perfil`
- Spec: `e2e/journey-ep003.portal.spec.ts` (proyecto portal; panel por URL absoluta `PANEL`)
- Entorno: `.local/playwright.ep003.config.ts` (portal 3200 + panel 3201 standalone, BD aislada `ps_ep003`)
- Comando:
  `BD_INSTALACION_URL=postgres://ps_instalacion@127.0.0.1:54329/ps_ep003 SOLO_SPEC="journey-ep003\.portal" npx playwright test --config .local/playwright.ep003.config.ts --project portal`

## Corrida 1 · 2026-10-02T22:41:54Z UTC · rc: 0

```
Running 1 test using 1 worker
  ✓  1 [portal] › e2e/journey-ep003.portal.spec.ts:157:7 › recorrido integrado de EP-003 (tarea 8.1) › catálogo (alcance SARO) → editor (bloqueado sin DISC, publicar) → «Incompleto» en el panel → importación SARO/DISC → portal (tarjeta, ficha, sin marca al cliente) → estándar descriptivo (9.6s)
  1 passed (10.8s)
```

## Corrida 2 · 2026-10-02T22:42:05Z UTC · rc: 0

```
Running 1 test using 1 worker
  ✓  1 [portal] › e2e/journey-ep003.portal.spec.ts:157:7 › recorrido integrado de EP-003 (tarea 8.1) › catálogo (alcance SARO) → editor (bloqueado sin DISC, publicar) → «Incompleto» en el panel → importación SARO/DISC → portal (tarjeta, ficha, sin marca al cliente) → estándar descriptivo (9.5s)
  1 passed (11.0s)
```

(Hubo una corrida previa de puesta a punto, también verde; las dos de arriba son consecutivas.)

## Los 6 pasos y lo que asierta cada uno

1. **Catálogos (panel, UI)**: crea el alcance SARO `Listas restrictivas y antecedentes <sufijo>` con su texto de cara al cliente; la revisión de parecidos dice «Ningún alcance SARO parecido»; la fila nueva aparece con el texto.
2. **Editor del perfil**: borrador nuevo (API del panel, con Sello Personal, sin SARO ni DISC); en el editor se elige el alcance creado (muestra «texto»), fecha SARO, se guarda; «Publicar» con `aria-disabled` → clic: `#pe-bloqueo` «No se publicó PS-…: Falta la fecha de la evaluación DISC.», foco en `#pe-disc-fecha`, error en el campo, sigue `borrador` en BD; completar DISC → «Publicado. El portal ya muestra su ficha.».
3. **«Incompleto» en el panel**: dos publicados a los que se quita SARO por SQL (heredados, D62); el listado (`?q=código`) marca «Incompleto: falta la verificación SARO (alcance y fecha)» y «Publicado»; el filtro `?estado=incompleto` (activo, `aria-current`) lista a ambos y no al completo.
4. **Importación**: pegar hoja Código + alcance (el creado en 1) + SARO `12/03/2026` + DISC `2026-04-08` → «1 fila · 4 columnas» → vista previa con el código y la columna de alcance → «Importar 1 perfil» → worker real aplica → BD: alcance = el creado, saro 2026-03-12, disc 2026-04-08, `publicado`; el filtro de incompletos ya no lo lista (el otro heredado sí).
5. **Portal con enlace e invitado**: código al buzón por el worker real (doble de Mailgun) → «Los 3 perfiles del correo»; tarjeta del completo con `.pp-bloque--verificado` «Verificado por Trycore» y su Sello Personal; tarjeta del heredado y la página sin «incomplet»/«falta»; ficha del completo: `#vp-fila-seguridad` = «<texto del alcance de 1> · marzo de 2026», `#vp-fila-disc` = «abril de 2026Sello Personal: …»; ficha del importado: misma línea SARO (texto de 1, marzo) y DISC abril; ficha del heredado: sin fila SARO y sin /SARO|incomplet|pendiente|no aplica|falta/, DISC abril.
6. **Encabezado del estándar**: `.ee-estandar__frase` = la frase descriptiva («El estándar exige a cada perfil verificación de identidad bajo SARO, prueba técnica revisada por Trycore y evaluación DISC.»), un solo encabezado.

Transversal: sin errores de consola ni `pageerror` en todo el recorrido (panel y portal); `sinIncidenciasGraves` (axe WCAG 2.1 AA, serious/critical) en la selección, la ficha del completo y la del heredado.

## Datos de la BD aislada
Los publicados incompletos previos se completan al empezar y se reponen tal cual en `finally` (patrón SS7). Quedan los datos creados con sufijo: el alcance nuevo, el perfil completo, el importado (completo) y un heredado sin SARO (incompleto, publicado), más el enlace e invitado.
