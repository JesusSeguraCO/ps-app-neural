# Fidelidad visual de generar/listar/revocar enlaces (Chrome DevTools MCP) — 2026-09-29T05:20:36Z
Revisión independiente (ux-fidelity-reviewer) a 1440×900 y 390×844 contra generador-enlace (+ --sin-razon, --sin-invitados, --perfil-no-publicado, --emitido) y enlaces-acceso, más observación propia del journey completo.
Veredicto: FIEL con desviaciones menores en el generador y sus estados; enlaces-acceso con D1 (pestaña activa) y D2 (banda en el detalle) medias → corregidas; D3-D8 menores → corregidas salvo D4 parcial (la miga tras emitir sigue «Nuevo enlace»: la pinta el servidor y el token solo vive en el navegador). Las 7 decisiones del sponsor/ADR verificadas. Móvil: tabla a filas apiladas, sin desbordamiento. Consola: solo los 422 provocados.
Tras corregir: suite 394 passed, e2e 18 passed (axe 0 graves y sin scroll a 320/390 en /enlaces y /enlaces/nuevo).
No verificado de punta a punta: el estado «perfil no publicado» real (se pintó con respuesta simulada; el camino está cubierto por el test de contrato 422 no_publicado).
Capturas: test-results/fidelidad-ss4/ (fuera de Git).
