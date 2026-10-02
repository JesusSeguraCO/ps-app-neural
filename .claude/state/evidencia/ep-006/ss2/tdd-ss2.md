# EP-006 · sub-slice 2 — evidencia TDD (determinista)

- sha: `b77822a8425b5a4d061ea31b4c7db85b198673d4` · rama: `feature/ep-006-administracion-del-inventario` · 2026-10-01
- Entorno: PostgreSQL 16 + PgBouncer local (roles reales `ps_panel`/`ps_portal`/`ps_worker`, sin superusuario); panel y portal standalone compilados (`next build`); Playwright con Chrome.
- Runner `tools/loop/integration-check.sh` en este sha: VERDE (build, migrar, lint, tipos, vitest 730 ✓ / 1 omitido preexistente, e2e 41 ✓, Lighthouse). Reporte: `integration-report-ss2.txt`.
- Corrida de los tests que sostienen el checklist: `corrida-ss2.txt` (7 ficheros, 103 ✓) + e2e `editor de perfiles` (3 ✓).

## Tests por item del checklist

| Item | Tests |
|---|---|
| `HU-089-ac2-seleccionar-no-escribir` | e2e «las tecnologías se eligen del catálogo; Enter nunca guarda lo escrito»; HTTP `?q=kaf` → solo «Kafka»; `POST /perfiles` con nombres → 400, con id inexistente → 422; editor con `role="combobox"` |
| `HU-125-ac1-borrador-catalogo` | infra «guardado con sus atributos queda en borrador…» y «no acepta texto libre»; HTTP «…fuera del portal» (`ps_portal` no lo ve); dominio `ESTADO_INICIAL` |
| `HU-125-ac2-familia-sin-modalidades` | infra «el selector de rol trae las modalidades de su familia»; HTTP rol en familia sin modalidades → `advertencia` y conteo 0 en el editor; observado en navegador (aviso + «Registrar modalidad») |
| `HU-125-ac3-incompletos-que-falta` | dominio `evaluarPublicacion`; infra «con obligatorios sin llenar…»; HTTP «incompleto se guarda igual…» (HTML con «Completar 10 datos obligatorios» y «Falta el primer apellido.»); e2e «guardar un perfil nuevo lo deja en borrador y señala lo que falta» |
| `HU-125-ac4-parecidos-antes-de-crear` | e2e «un rol que no existe muestra los parecidos antes de dejar crearlo» (hoja con «Desarrollador full stack», «Usar este» y «Crear … de todos modos») |
| `HU-127-ac1-nominal-quien-cuando` | infra «registrar el nominal habilita publicar y deja quién y cuándo»; HTTP 201 con `registradoPor` y `firmadoEn`; observador 403 |
| `HU-127-ac2-anonimizado-rechazado` | dominio `validarConsentimiento`; infra y HTTP 422 `no_nominal` sin escritura; BD rechaza `nominal = false` (migración 0014) |
| `HU-127-ac3-revocado-despublica` | dominio tabla estado × acción; infra «revocar un publicado lo saca de publicado en la misma operación…» (auditoría `revocacion`: consentimiento + estado); HTTP contra el portal real: el enlace curado muestra la tarjeta «No publicado» en su lugar, sin el nombre |
| `HU-127-ac4-parcial-despersonaliza` | migración 0014 «la proyección de la trayectoria oculta el cliente…»; infra y HTTP: `experiencias_publicables.cliente = null`; dominio `clienteEnDescripcion` (el texto no puede nombrar al cliente) |

## Mutación manual acotada (9 mutantes, uno por item) — `mutacion-ss2.json`

| Item | Mutante | Resultado |
|---|---|---|
| `HU-089-ac2-seleccionar-no-escribir` | Enter guarda el texto escrito como valor | MUERTO (e2e) |
| `HU-125-ac1-borrador-catalogo` | el alta nace publicada | MUERTO |
| `HU-125-ac2-familia-sin-modalidades` | el selector nunca ve familias sin modalidades | MUERTO |
| `HU-125-ac3-incompletos-que-falta` | no señala la ciudad que falta | MUERTO |
| `HU-125-ac4-parecidos-antes-de-crear` | la hoja de alta no muestra los parecidos | MUERTO (e2e) |
| `HU-127-ac1-nominal-quien-cuando` | no guarda quién lo registró | MUERTO |
| `HU-127-ac2-anonimizado-rechazado` | acepta el anonimizado | MUERTO |
| `HU-127-ac3-revocado-despublica` | revocar no saca de publicado | MUERTO |
| `HU-127-ac4-parcial-despersonaliza` | el portal ve el cliente sin autorización | MUERTO |

Cada mutante se aplicó, se corrió su test (con `next build` previo en los dos de UI) y se revirtió; el árbol quedó igual al commit.

## Pendientes declarados

- Publicar (HU-128) es del sub-slice 5: en los tests de «parcial» el paso a `publicado` se fija en la BD como lo hará esa guarda.
- El enlace curado muestra el perfil revocado con el estado «No publicado — Estamos actualizando su perfil» de EP-001 (HU-144). No se omite (RF-19.2), pero el texto no dice «dejó de estar disponible» literal: se deja a decisión del sponsor si el revocado merece texto propio (revelar «revocó su consentimiento» al cliente sería exponer un dato personal).
