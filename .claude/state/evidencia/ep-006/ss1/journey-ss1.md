# EP-006 · sub-slice 1 — journey smoke (tarea 1.10)

Recorrido por la UI real del panel (MCP chrome-devtools, ver fidelidad-ss1.md) como administradora:
entrar al panel → crear «Figma» → «Fgima» avisada como parecida y creada confirmando → fusionar Fgima en Figma
(impacto: 2 perfiles; confirmado; Fgima sale del catálogo) → crear un rol en una familia sin modalidades (advertencia)
→ editar y aprobar la propuesta de Gemini «pagos en tiempo real» (doble) → el intérprete (`interpretarConsulta`), leyendo con
`ps_portal` contra la misma BD y sin redesplegar, reconoce «pagos inmediatos» como Tecnología: Kafka.
*Corrección 2026-10-01 (pasada 1 de cableado, D46):* la búsqueda del portal todavía no llama al intérprete; ese consumidor
es de EP-009 (RF-2.6) y entra en su DoR.

Runner determinista `tools/loop/integration-check.sh`: resultado VERDE (build de los tres procesos, suite vitest,
e2e Playwright de portal y panel con axe a 320/390 en /catalogos y /lexico, Lighthouse). Reporte copiado en
`integration-report-ss1.txt`.

Pendiente declarado: HU-089 «seleccionar en vez de escribir» se verá en el editor de perfiles (sub-slice 2);
frontera Gemini sin intercambio real (na no_credentials).
