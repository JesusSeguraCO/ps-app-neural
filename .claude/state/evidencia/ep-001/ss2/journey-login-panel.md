# Journey sub-slice 2 en navegador real (Chrome DevTools MCP) — 2026-09-29T03:25:39Z
Entorno: BD local de desarrollo migrada (0001-0004), worker empaquetado real (sembró admin@trycore.com al primer arranque; en el segundo: admin_inicial_omitido), panel standalone en :3101, doble de Mailgun. HEAD 5e0bd9e.
Pasos: / sin sesión → 307 a /acceso · correo → «Enviarme el código» → 202, el worker (no el modo degradado) envió el correo con la plantilla nueva (Acceso, Pedido 28 sep 2026, 10:24 p. m. hora de Colombia) · 6 casillas → Entrar → 204 y / con el marco: 12 destinos deshabilitados, rol «Administración de inventario», «Sesión hasta las 10:24 a. m.», correo y «Cerrar sesión» · Cerrar sesión → /acceso, fila de sesión borrada, / vuelve a redirigir · sesión envejecida 12 h en BD → recarga → /acceso?motivo=sesion_expirada «Tu sesión terminó».
Consola: sin errores (antes: 404 de favicon.ico y aviso de campos sin id/name; el segundo corregido).
Hallazgo corregido en el camino: el 307 del middleware llevaba el host de escucha (http://localhost:PORT) con cualquier Host público (commit e339361).
Capturas: test-results/fidelidad-ss2/ (fuera de Git).
