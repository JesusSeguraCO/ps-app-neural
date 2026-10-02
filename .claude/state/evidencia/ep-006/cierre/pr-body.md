Épica **EP-006 — Administración del inventario**, construida en 10 sub-slices más un cierre (11). Gates del slice: {{GATES}}. DoD {{DOD}}. El change OpenSpec se archiva en este mismo PR.

## Trazabilidad
- Épica: EP-006 · HU-086, HU-087, HU-088, HU-089, HU-124, HU-125, HU-126, HU-127, HU-128, HU-129, HU-130, HU-132, HU-133, HU-134, HU-135, HU-136, HU-137, HU-138, HU-139, HU-140, HU-141, HU-142, HU-143, HU-147, HU-148, HU-150, HU-151
- OpenSpec change: `administracion-del-inventario` → {{ARCHIVO}}
- Decisiones: D1–D19 (`decisiones-sponsor-2026-09-30.md`) y D20–D48 (`decisiones-sponsor-2026-10-01.md`)
- **Fuera de este change, declarado:**
  - HU-131 (adjuntar el artefacto de evidencia): **diferida a una versión futura** por el sponsor (D29). Sus 5 items de cableado y `I-spaces-subida-csp` quedan sin cerrar; no hay código a medias (sin tabla, SDK, permisos ni CSP del bucket).
  - HU-149: descartada por D11.
  - Consumidor del léxico en la búsqueda del portal → EP-009 (D46, sponsor): entra en su DoR.
  - De la ficha del cliente quedan en EP-003: «Frente a tu búsqueda» (HU-119), «Sumar al equipo» desde la ficha (HU-120) y competencias en tarjeta (HU-081) (D47).

## Sub-slices
- [x] 1 · Catálogos y léxico (HU-089, HU-143, HU-139)
- [x] 2 · Crear perfil y consentimiento nominal (HU-125, HU-127)
- [x] 3 · Exportar, pegar y emparejar (HU-088, HU-086, HU-148)
- [x] 4 · Confirmar, revertir y corregir (HU-141, HU-087, HU-142)
- [x] 5 · Bloqueo, vista previa y Nivel 0 (HU-128, HU-129, HU-130)
- [x] 6 · Editar publicado, reporte de validación y borrador (HU-126, HU-140)
- [x] 7 · Disponibilidad, vigencia y pausa (HU-132, HU-136, HU-133)
- [x] 8 · Incoherencias y archivo (HU-134, HU-135)
- [x] 9 · Colocados, carga de Operaciones y observador (HU-137, HU-150, HU-124)
- [x] 10 · Accesos, contacto y auditoría (HU-151, HU-147, HU-138)
- [x] 11 · Cierre: recorrido integrado, Newman, fidelidad final, gate data, verificación adversarial y ficha del cliente en el portal (D47)

## Verificación (ejecutada)
- Runner `integration-check` en 738d7f1: vitest {{VITEST}} con BD real; Playwright {{E2E}}; build, lint, tipos y Lighthouse en verde
- Recorrido integrado de punta a punta con la cola real del worker (11 pasos)
- Newman: 226 peticiones / 350 aserciones / 0 fallos; los 52 métodos de las 42 rutas nuevas del panel
- Fidelidad visual: 66 pantallas de EP-006 (64 FIEL + 2 N/A por D29) y la ficha del portal (FIEL contra `vista-previa-ficha`, D48), por captura MCP real
- Consistencia de datos: FAIL → PASS tras D44 (una importación ya no puede dejar incompleto un publicado)
- Verificación adversarial de cableado: pasada 1 sobre b4110f8 HUECOS (1 ALTA, 3 MEDIA, 3 BAJA) → arreglos en b833742/83ad7a6/c9b06ed → pasada 2 REFUTADA solo en M1 (MEDIA, código del cierre) → cerrada con mutación en 738d7f1 → `wiring_verified` PASS

## Excepciones de frontera (`na`)
- `otp-mail/send-notification` — `no_credentials` (heredado de EP-001; decisión del sponsor: Mailgun se verifica en staging). En EP-006 cubre «Avisar a Talento Humano» del observador (HU-124) y los avisos de la cola; probado solo contra el doble de Mailgun.
- `otp-mail/send-access-code` — `no_credentials` (heredado de EP-001): la entrada por código al panel en esta épica se probó con el doble.
- Gemini (`llm-interpreter/suggest-lexicon-entries`): evidencia viva anclada en `e772614` (el módulo no cambió desde entonces); en este entorno no hay llave para repetirla.

## Diferido al Release Gate
- Revisión independiente del cierre de la pasada 2 de cableado (M1 con mutación verificada; B2, B3 y B6 con tests), sin tercera pasada (condición de parada de `dod.md`).
- B1: las descargas de reporte y de filas con error son enlaces nativos; con la sesión vencida el navegador guarda el JSON del 401 en vez de volver a la puerta.
- B5 (H7 de la pasada 1): la observadora que llega a `/inventario/{c}/validacion` es redirigida y el rechazo se registra con otro recurso.

## Items de cableado que quedan sin cerrar, declarados
- `HU-131-ac1…ac5` e `I-spaces-subida-csp`: HU-131 diferida a una versión futura (D29); escalada resuelta en el hub como ACEPTADA. La tarea 6.3 del change queda tachada por lo mismo.
- `IP-ss1-lexico-portal`: transferido a EP-009 (D46, sponsor); el intérprete y el léxico están probados contra la BD con `ps_portal` (HU-139 pasa a nivel del intérprete).
- El hub no admite retirar ni marcar `na` un item de cableado: quedan `failing` y se declaran aquí.
- Como siempre: security, smell, ux, coherencia triple, stack_arch e integration.

## Para revisar
- Aviso de CSP de Zod 4 en el panel (`Function("")` para detectar JIT, capturado): se quita con `z.config({ jitless: true })` en un módulo cliente.
- Semillas antiguas de la BD de desarrollo publicadas sin modalidad de prueba (PS-0201, PS-0223, PS-0230, PS-0238): su ficha no se abre y queda `ficha_fuera_de_contrato` en el registro.
- La lista de la selección dice «Los 3 perfiles del correo» y la ficha «1 de 2» cuando uno está pausado (el recorrido solo cuenta los disponibles): a mirar en el gate UX.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
