# EP-006 · sub-slice 10 — journey smoke (10.7)

Recorrido: inscribir a otra administradora → entra con código → bajarla a observadora corta su sesión → cambiar el contacto →
el portal lo muestra → el registro del perfil muestra cada cambio con su autor.

1. **MCP chrome-devtools, clics reales, entrada real** (BD efímera `ps_t_59b5d246`, worker con el doble de Mailgun):
   Karen inscribe a paula.rios@ como administradora → el doble registra su código (921104) → Paula entra y ve «Accesos al
   panel» → Karen abre «Cambiar el rol» y la hoja avisa «Tiene una sesión abierta…» (`journey-1-bajar-rol-sesion-abierta.png`)
   → «Pasar a observador» → la siguiente petición de Paula la lleva a `/acceso?motivo=rol_cambiado` con «Cambió tu rol en el
   panel, así que tu sesión se cerró» (`journey-2-sesion-cortada-rol-cambiado.png`) → Karen guarda el contacto solo con
   `servicio.clientes@trycore.com` → el portal en «Este enlace ya no abre» dice «o escribe a People Service:
   servicio.clientes@trycore.com» (`journey-3-portal-contacto-nuevo.png`) → el registro de PS-0142 lista 7 cambios, todos con
   autor (persona, importación con quien la confirmó, carga con su corte y quien la cargó, siembra ficticia).
   Consola sin errores en el panel; en el portal solo `favicon.ico` 404 (preexistente, ajeno a este sub-slice).
2. **Playwright** `e2e/marco.panel.spec.ts` «administración (HU-151, HU-147, HU-138)»: el mismo recorrido por la interfaz
   (sesión de la inscrita abierta con su rol), axe sin incidencias graves en el registro; deja la BD de desarrollo como
   estaba (inscrita de baja, contacto por omisión). Más `e2e/acceso.portal.spec.ts` «HU-147: la puerta nombra el contacto…».

Corrida 2026-10-01 con BD real: vitest 1177 ✓ (101 ficheros), Playwright 58 ✓. Mutación: 10.1–10.3 3/3, 10.4 5/5, 10.5 6/6.
