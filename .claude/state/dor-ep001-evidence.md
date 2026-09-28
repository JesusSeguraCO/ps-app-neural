# DoR EP-001 — PASA (2026-09-28)

Veredicto: dor-dod-gatekeeper, dos pasadas. 1ª: NO PASA (B1-B4). 2ª: NO PASA solo por HU-092 (6 escenarios, destinatario abierto). Tras fix, bdd-validator HU-092 PASA → condición del gatekeeper cumplida.
Decisiones del PO: reformular AC sin recortar (B1-B3); cuenta activa = propiedad de empresa en HubSpot (B4); HU-092 fusiona edge cases, aviso a Talento Humano si HubSpot cae.
Revalidación independiente: invest-validator 5/5 + HU-145 6/6; bdd-validator 5/5 + HU-092 + HU-145.
Commits (rama chore/dependencias-epicas, PR #8): 2d09acc, 09f2a71, 60b47aa, 3c75b45.

Criterios: 1-4 ✓ · 5 ✓ · 6 ✓ · 7/7-bis N/A (foundational, caparazón) · 8 ✓ troceado · 9 ✓ (37 pantallas aprobadas, docs/05-prototipo/manifest.json) · 10 ✓ (UC-1..3, QA-2, QA-3, QA-8 ABORDADO).
layer: foundational

sub_slices (ADR-0008, normativo por T-19):
1-esqueleto-andante [] · 2-login-panel [HU-123] · 3-modelo-perfil-publicable [] (con rol y categoría) · 4-generacion-enlace [HU-122] · 5-aterrizaje-y-acceso-cliente [HU-090, HU-144, HU-092] (+adaptador HubSpot lectura) · 6a-seleccion-encuadre-retorno [HU-091, HU-093, HU-094] (+Mi equipo mínimo) · 6b-invitar-colega [HU-095, HU-145]

files_scope: apps/portal/** apps/panel/** apps/worker/** packages/** docker/** docker-compose.yml scripts/** .github/** package.json package-lock.json tsconfig.base.json eslint.config.mjs openspec/changes/acceso-y-aterrizaje-curado/** docs/03-backlog/epicas.md docs/04-historias/HU-*.md
openspec_change: acceso-y-aterrizaje-curado · branch: feature/ep-001-acceso-y-aterrizaje-curado · api y fidelity aplican.
Pendiente humano: design_source aplica=false en el hub (solo ADMIN en consola).
