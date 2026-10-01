# EP-006 · 10.4 — mutación manual (2026-10-01)

| Mutante | Fichero | Test que lo mata | Resultado |
|---|---|---|---|
| M1 la vista ignora la tabla (siempre el buzón por omisión) | `packages/infra/migraciones/0024_contacto_trycore.ts` | infra «guardar cambia lo que lee el portal…», «solo correo…», «correo externo…» | muerto (3 fallan) |
| M2 el dominio acepta un correo externo | `packages/dominio/src/acceso/accesos.ts` | infra «un correo externo no se guarda…», dominio «valida…» | muerto (2 fallan) |
| M3 sin «People Service» cuando faltan nombre y cargo | `packages/dominio/src/contacto/contacto.ts` | dominio «por omisión…», «solo correo…»; ui «solo correo» | muerto (3 fallan) |
| M4 guardar sin auditar | `packages/infra/src/postgres/contacto.ts` | infra «guardar … audita el anterior y el nuevo», «solo correo…» | muerto (2 fallan) |
| M5 el endpoint declara `perfil.avisar` (ambos roles) en vez de `contacto.escribir` | `apps/panel/app/api/v1/contacto/permisos.ts` (build real del panel) | HTTP «la observadora no puede forzar un cambio por petición directa» | muerto (1 falla) |

Un primer intento de M5 con una acción inexistente rompía el build y dejaba el test HTTP saltado: descartado, se repitió con una acción válida.
Código restaurado y panel reconstruido: HTTP 6 ✓. Suite 1160 ✓ (98 ficheros), Playwright 57 ✓ (incluye «HU-147: la puerta nombra el contacto configurado…»).
