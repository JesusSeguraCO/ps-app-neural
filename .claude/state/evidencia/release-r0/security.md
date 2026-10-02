# Release Gate R0-ep001-ep006 · gate security (security-reviewer) — PASS

Diff `acce296..c3ff45b`. Sin CRÍTICO ni ALTO. 2 MEDIO, 6 BAJO. Tests corridos: 291 en verde (con BD) y `npm audit --omit=dev`.

## MEDIO (decisión: arreglar o riesgo aceptado con fecha)
- **MEDIO-1 · Inyección de fórmulas en CSV.** `packages/contratos/src/importacion.ts:347-349` (`comillas`/`escribirCsv`) y `:389-390` (`celda` de `escribirTabla`: `escribirErrores`, `reporteDeLote`). Endpoints: `/api/v1/importacion/exportar?formato=csv`, `lotes/{id}/errores`, `lotes/{id}/reporte`. Comprobado: `=1+1`, `+cmd|' /C calc'!A0`, `@SUM(A1)` salen sin neutralizar. Fix: prefijar `'` a celdas que empiecen por `= + - @ \t \r`; test por función.
- **MEDIO-2 · Bloqueo del acceso al panel conociendo el correo.** `packages/infra/src/postgres/acceso-panel.ts:51-67,123-126`; `packages/dominio/src/acceso/intentos.ts:13-17,67-68` (3 emisiones/15 min, 10/día; 5 fallos/15 min, 20/día, bloqueo 24 h). Sin desbloqueo en el panel: `accesos.desbloquear` (`permisos.ts:11`) sin ruta. Fix: desbloqueo por administradora con alerta y auditoría, o tope por correo + IP.

## BAJO
1. `EDGE_SECRET` opcional y sin comprobación si falta (`config.ts:77-84`, `perimetro.ts:75`); IP de `x-forwarded-for` falsificable sin `do-connecting-ip` (`envoltorios.ts:33-42`). Fix: cerrar la enmienda de ADR-0010 y fijar la IP del proxy de staging.
2. `req.json()` sin límite de tamaño en rutas públicas de acceso. Fix: 413 por encima de ~16 KB.
3. (B1 diferido de EP-006) Descargas con sesión vencida muestran el JSON del 401; sin fuga. Fix: 303 a `/acceso?motivo=…`.
4. `npm audit`: `postcss@8.4.31` dentro de `next@15.5.26` (solo en compilación, CSS propio). Fix: planificar Next 16.
5. `lotes/[id]/reporte/route.ts:10-11` sin `conAutorizacion`: la observadora descarga el reporte (nombres) mientras `errores` y `exportar` exigen `importacion.ejecutar`. Decidir y alinear.
6. CSP `style-src-attr 'unsafe-inline'` (`perimetro.ts:51`); scripts con nonce + `strict-dynamic`.

## Controles que pasan (evidencia)
- Perímetro: sin cabecera de borde → 403; `x-middleware-subrequest` → 403 (`perimetro.ts:71`, `envoltorios.ts:69`); CSP con nonce, `frame-ancestors 'none'`, `object-src 'none'`; HSTS, nosniff, XFO DENY, Referrer-Policy.
- CSRF doble envío + Origin exacto (`envoltorios.ts:81-98`); Origin ajeno → 403 `csrf`; `__Host-csrf` Secure + SameSite=strict.
- 49 `route.ts` con `conBorde`; escrituras con `conCsrf` + sesión + `conAutorizacion`; páginas protegidas con `exigirSesion()`.
- Acceso cliente: token de 43 caracteres guardado como SHA-256; código de 6 dígitos HMAC + pepper, comparación en tiempo constante; respuesta neutra; sesión revalidada en cada petición; renovación solo al buzón invitado.
- Panel: solo `@trycore.com`; sesión de 12 h, 60 min de inactividad, corte al bajar de rol (`sesion.ts:64-90`).
- Ficha `?ficha=` (D47): `recorrido()` solo abre códigos de la lista visible; vista con publicado + consentimiento vigente.
- B.4: vistas sin `capacidad`, `anclaje`, `aporte`, `vinculo`; cliente nombrado solo con `incluye_clientes` (0014:77-88); `FichaPerfil` estricto; importación sin columnas B.4.
- Roles BD: 0 DELETE/TRUNCATE para `ps_portal`, `ps_panel` y `ps_worker`; `ps_portal` sin USAGE sobre `inventario`.
- Secretos: 0 apariciones en `.next/static`; sin `NEXT_PUBLIC_*`; `config.ts` exige ≥32 caracteres e impide dobles fuera de local/ci.
- Gemini: solo worker, timeout 6 s, `RespuestaModeloLexico.safeParse` estricto (`gemini/lexico.ts:79`), consultas con nombres de perfiles excluidas.
- Auditoría: cadena HMAC, AES-256-GCM por titular, clave envuelta con KEK.
- Inyección: SQL parametrizado; sin `dangerouslySetInnerHTML`; correos HTML con `escapar()`.

## Veredicto
**PASS** (`security: true`). Los MEDIO piden decisión: arreglar (recomendado MEDIO-1 ya) o registrar como riesgo aceptado con fecha.
