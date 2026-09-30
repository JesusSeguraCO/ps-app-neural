# V2-4 panel: tiempos por rama en modo degradado (ADR-0002 H8) — 2026-09-29T01:39:36Z
Entorno: next build del panel, servidor standalone real, BD local con ps_panel y ps_worker por PgBouncer, sin fila en worker_ciclo (worker caído), doble de Mailgun con DOBLE_MAILGUN_LATENCIA_MS=3000-5000.
$ npx vitest run apps/v2-4-panel.test.ts → 3 passed · suite completa 295 passed / 2 skipped · lint y typecheck limpios.
N=200 por rama (20 de calentamiento, orden aleatorio por par, un correo distinto por petición): mediana inscrito 2,66 ms, no inscrito 2,69 ms, Δ 0,03 ms, Mann-Whitney p=0,94; cuerpo idéntico; códigos llegaron solo a inscritos · 4 concurrentes con Mailgun lento: cada una < 1 s y la siguiente también · carrera worker vivo + worker_ciclo retrasado: 10 peticiones → exactamente 1 código cada una.
Mutación: 10 ms extra en la rama inscrita (panel reconstruido) → Δ 12,15 ms, p=0, falla.
Alcance: solo el panel; la mitad del portal (invitado / no invitado) llega con la tarea 5.2.
