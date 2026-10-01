# EP-006 · 11.3 — fidelidad final (plan y estado, 2026-10-01) — RETOMAR AQUÍ

Manifiesto `docs/05-prototipo/manifest.json`: 66 pantallas de EP-006.
- 64 ya verificadas FIEL con captura MCP en su sub-slice (fidelidad-ss1…ss10.md); 2 N/A por D29:
  `perfil-editor--adjunto-no-admitido` (HU-131 diferida) y `borrador-evidencia--sin-texto` (sin artefacto, D30(7)).
- Vigentes contra HEAD: las 11 de ss10 (admin-accesos ×6, admin-contacto ×3, auditoria-perfil ×2), capturadas en
  `d2c5f4c`; después solo hubo commits de tests (`ecfcbda`, `c895ebd`, `3b5e5ba`).
- **Por recapturar con MCP contra HEAD: las 53 de ss1–ss9** (desde su fidelidad cambiaron pantallas compartidas:
  inventario, editor, vista previa). Lista: inventario-perfiles ×7, perfil-editor ×9 (sin adjunto), borrador-evidencia ×2,
  vista-previa-ficha ×3, importar-perfiles ×10, catalogos ×6, lexico-busqueda ×4, bandeja-vigencia ×3, colocados ×9.

Hecho: capturas del prototipo a 1440 en `.local/fid-final/proto/<slug>.png` (66, con `.local/fid-final/proto.mjs`).

Pasos que faltan:
1. BD efímera con datos ricos (base: `.local/fid-ss10/preparar.mts` + `sembrarLexicoFicticio` + lotes de importación,
   colocados y pausados de >30 días); panel :3101, portal :3100 y worker contra ella (`.local/fid-ss10/arrancar.sh`).
2. Entrada real de la administradora y de la observadora por código (doble de Mailgun en el log del worker).
3. Por cada pantalla: navegar o reproducir el estado con clics (MCP), capturar `app-<slug>-1440.png` en `cierre/fidelidad/`,
   comparar con `proto/<slug>.png` (componer lado a lado con PIL) y anotar FIEL / DESVIACIÓN.
4. Corregir desviaciones nuevas (si las hay) o aprobarlas bajo D27 y registrarlas.
5. Registrar en `design.md` (sección de fidelidad) todas las desviaciones aprobadas: D22, D25, D28, D30–D41.
6. `cierre/fidelidad-final.md` con la tabla de las 66 y el conteo 64 FIEL + 2 N/A = 66 contra el manifiesto; marcar 11.3.
