# Release Gate R1-mvp (tramo EP-001 + EP-006) · gate integration — PARCIAL (riesgos declarados, D51.3)

Recorrido completo con dependencias reales del proyecto en la rama `fix/release-r0-hallazgos`:
- PostgreSQL 16 + PgBouncer con roles reales (`ps_portal`, `ps_panel`, `ps_worker`, `ps_migrador`), migraciones 0001–0026.
- Worker real con la cola (`trabajos`, `FOR UPDATE SKIP LOCKED`, NOTIFY) en `apps/recorrido-ep006.test.ts` (11 pasos: catálogo → perfil → consentimiento → reporte → publicar → el cliente entra con código enviado por la cola y abre la ficha → importar y revertir → vigencia → colocado → observadora → auditoría íntegra).
- Portal y panel standalone compilados; e2e Playwright: 61 ✓ / 1 omitido (CSP, axe, móvil 320/390).
- Runner `integration-check.sh`: build, migrar, lint, tipos, tests (1237 ✓ / 1 omitido; un error intermitente de cierre de BD temporal en `migracion-0018.test.ts` no reproducido en 4 corridas aisladas ni en la repetición completa), e2e, Lighthouse. Reporte: `integration-report-fix.txt`.

## Riesgos declarados (`na` de frontera, custodiados aquí)
- `otp-mail/send-access-code` y `otp-mail/send-notification` — `no_credentials`: sin llave de Mailgun; probado contra el doble. Decisión del sponsor: verificar en staging (que no lleva datos reales hasta E-14).
- Gemini `llm-interpreter/suggest-lexicon-entries`: sin llave en este entorno; evidencia viva anclada en `e772614` (módulo sin cambios).
- HubSpot: sin adaptador en esta release (E-6 → EP-007).

## Veredicto
**PARCIAL**: el journey camina de punta a punta con BD, worker y cola reales; las fronteras de correo y modelo quedan declaradas como riesgo. Cierre de la release: decisión humana en la consola.
