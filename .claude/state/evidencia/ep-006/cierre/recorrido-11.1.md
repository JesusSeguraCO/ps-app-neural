# EP-006 · 11.1 — recorrido integrado de punta a punta (2026-10-01)

`apps/recorrido-ep006.test.ts` (11 pasos, 11 ✓) contra panel y portal standalone reales (`ps_panel`, `ps_portal`) y la cola
real procesada por el despacho del worker (`ps_worker`), con el doble declarado de Mailgun:

1. catálogo: tecnología nueva «Elixir» → 2. perfil en borrador con ella → 3. consentimiento nominal con clientes →
4. evidencia: reporte de validación desde la modalidad, confirmado con la revisión → 5. publicar con `If-Match` →
6. el cliente entra con su código (lo envía el worker por la cola; el portal no lo despacha porque el worker está vivo) y ve
   el perfil → 7. importar (lote aplicado por el worker) y revertir (worker) → el perfil vuelve a como estaba →
8. disponibilidad en bloque y, a 31 días sin tocarla, en la bandeja de vigencia → 9. colocado: sigue publicado, en Colocados
   y a la vista del cliente → 10. observadora: consulta la ficha, PATCH 403 con `acceso_rechazado`, «Avisar» encola
   `notificar` y el worker escribe a Talento Humano con la nota → 11. auditoría del perfil con cada paso (consentimiento,
   reporte, publicación, importación, importación deshecha, disponibilidad, colocación), ninguna fila sin autor, cadena íntegra.

Gemini no interviene en este recorrido (solo propone léxico; cubierto en `lexico-*.test.ts` con su doble). Spaces quedó fuera
de la versión (D29).

Runner `tools/loop/integration-check.sh`: **VERDE** — bd-local, build, migrar, lint, tipos, tests (1190 ✓, 103 ficheros),
e2e (58 ✓), Lighthouse. Reporte: `integration-report-11.1.txt`.
