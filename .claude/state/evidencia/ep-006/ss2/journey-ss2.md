# EP-006 · sub-slice 2 — journey smoke (tarea 2.7)

Recorrido: crear perfil → borrador fuera del portal → registrar consentimiento → revocar → el enlace curado lo muestra como no disponible.

- Por la UI real del panel (MCP chrome-devtools, ver fidelidad-ss2.md) como administradora: alta de PS-0239 en borrador con valores del catálogo, rechazo del consentimiento anonimizado, registro del nominal, y revocación del consentimiento de PS-0142 (publicado → borrador, aviso «El perfil salió del portal y quedó en borrador»).
- Contra los servidores standalone reales de panel y portal (`apps/perfiles-panel.test.ts`, BD propia): el perfil creado no aparece en `catalogo_publicable` leído como `ps_portal`; el enlace curado con PS-0187 y PS-0142 muestra antes a «Laura Méndez» y, tras la revocación por la API del panel, la tarjeta de PS-0142 sigue en su lugar con «No publicado» y sin el nombre.
- Runner determinista `tools/loop/integration-check.sh` en `b77822a`: VERDE (build de los tres procesos, migrar, lint, tipos, vitest, e2e de portal y panel con axe a 320/390 en /inventario, /inventario/nuevo y un perfil, y el editor por teclado; Lighthouse). Reporte en `integration-report-ss2.txt`.

Nota: la BD de desarrollo quedó con PS-0142 revocado tras la prueba manual y rompió una e2e del portal que lo usa; se restauró ese dato ficticio local (consentimiento + publicado) antes de la corrida final.
