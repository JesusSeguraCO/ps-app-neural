# EP-006 · sub-slice 10 (HU-151, HU-147, HU-138) — plan

## Estado al abrir (tras cerrar ss9 en 31136cf)
- BD local en 0022. `conSesionPanel`/`exigirSesion` ya releen `activo` y `rol` en cada petición; falta cortar la
  sesión al bajar de rol (`rol_al_abrir`) y la baja lógica con autor y fecha.
- La fila de auditoría no guarda el lote ni la carga: el enlace de HU-138 necesita una referencia aparte.

## Diseño (§9, §10, §8) y decisiones
1. 0023 accesos: `usuarios_panel.dado_de_baja_en`, `actualizado_por`; `sesiones_panel.rol_al_abrir` (las abiertas
   antes, `NULL` = el rol actual); función `identidad_panel.cambiar_acceso(objetivo, rol, activo, autor)` que bloquea
   las filas de administradores activos (`FOR UPDATE`) y se niega a dejar cero (V3-7: solo DDL; V8-10: grants).
2. Accesos: `/administracion/accesos` (solo administradora), alta `@trycore.com` con `correo_hmac`, cambio de rol,
   baja lógica; auditados (`usuarios_panel`, titular sistema) con rol anterior y nuevo; reinscribir reactiva.
3. Corte: la sesión se corta si el usuario está inactivo o si su rol actual es menor que `rol_al_abrir`
   (administrador → observador); se borra la sesión con `cerrar_sesion` y se va a `/acceso`.
4. 0024 contacto: `operacion.configuracion_contacto` (fila única, correo `@trycore.com`, nombre y cargo
   opcionales), vista `operacion.contacto_trycore` para `ps_portal`; `ContactoTrycore` en las cinco pantallas; edición
   auditada en `/administracion/contacto`; observadora en lectura; 403 por petición directa.
5. 0025 referencias de auditoría: `auditoria`-adjunta `inventario.referencias_auditoria(seq_desde, seq_hasta, tipo,
   ref_id)` escrita en la misma transacción por la importación, la reversión y la carga de Operaciones.
6. Registro por perfil: `/inventario/{código}/auditoria`, descifrado en el servidor (ambos roles), con campo, antes,
   después, quién, cuándo, origen; lote o carga enlazados (con su fecha de corte); archivado como cambio de estado.

## Orden
10.1 → 10.2 → 10.3 → 10.4 → 10.5 → 10.6 fidelidad → 10.7 journey, mutación, wiring.

## Avance (2026-10-01) — retomar aquí
- **10.1–10.3 hechas**: 0023 (`dado_de_baja_en`, `actualizado_por`, `actualizado_en`, `rol_al_abrir`,
  `cambiar_acceso` con bloqueo), `accesos-panel.ts` (listar, inscribir, cambiar rol, dar de baja; auditados),
  `POST /api/v1/accesos`, `/{id}/rol`, `/{id}/baja` (`accesos.administrar`), `/administracion` → contacto,
  `/administracion/accesos` con sus hojas, pie del menú como enlace, corte de sesión `rol_cambiado` en
  `conSesionPanel` y `exigirSesion`. Permiso `contacto.escribir` ya en la matriz. BD de desarrollo en 0023.
  Tests: dominio +5, infra 8 (carrera real), HTTP 7. Mutación `mutacion-10.1-10.3.md` (3/3). D38.
- **Siguiente: 10.4** (0024 `configuracion_contacto` + vista `operacion.contacto_trycore` sin DML —la vista da
  `people.service@trycore.com` si no hay fila—, `ContactoTrycore` en `Pantallas.tsx` (EnlaceRevocado, AbreTuEnlace),
  `PuertaCliente.tsx` (en_espera 429, intentos agotados, «Recibimos tu petición») e `invitar/page.tsx`; la constante
  `CONTACTO` se retira; `/administracion/contacto` con `?rechazado=accesos`). Luego 10.5 (0025 referencias de
  auditoría + `/inventario/{código}/auditoria`), 10.6, 10.7.
- **10.4 hecha**: 0024 (`inventario.configuracion_contacto` fila única + vista `operacion.contacto_trycore` sin DML),
  `contacto.ts` (leer, guardar auditado por campo, historial descifrado con `leerCambios` —reutilizable en 10.5—),
  `POST /api/v1/contacto` (`contacto.escribir`), `/administracion/contacto` (formulario / lectura de la observadora /
  `?rechazado=accesos`), `ContactoTrycore` en `@ps/ui` usado en las cinco pantallas; constante `CONTACTO` retirada.
  Campo `direccion` por V8-4 (D39). BD de desarrollo en 0024. Tests: dominio 5, ui 3, infra 5, HTTP 6, e2e 1.
  Mutación `mutacion-10.4.md` (5/5).
- **Siguiente: 10.5** (0025 referencias de auditoría + `/inventario/{código}/auditoria` con `leerCambios`).
