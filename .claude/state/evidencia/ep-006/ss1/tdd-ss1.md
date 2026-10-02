# EP-006 · sub-slice 1 — evidencia TDD (determinista)

- sha: `6d27e064a05a62b762095671e80cae1a8fc59155` · rama: `feature/ep-006-administracion-del-inventario` · hora: 2026-10-01T00:01:44Z
- Entorno: PostgreSQL 16 + PgBouncer local (roles reales, sin superusuario); panel standalone compilado (`next build`); Gemini con el doble declarado.
- Suite completa del monorepo en verde en este sha: 50 ficheros, 643 tests (2 omitidos preexistentes, ajenos a EP-006).

## Corrida de los tests que sostienen el checklist

```
Test Files  13 passed (13)
      Tests  136 passed (136)
```

## Mutación manual acotada (22 mutantes, uno por item)

| Item | Mutante | Resultado |
|---|---|---|
| `HU-089-ac1-rol-familia-con-modalidades` | el rol se crea sin exigir familia | MUERTO |
| `HU-089-ac2-seleccionar-no-escribir` | las coincidencias solo por igualdad exacta | MUERTO |
| `HU-089-ac3-parecido-fgima` | umbral de parecido en cero | MUERTO |
| `HU-089-ac4-identico-mayusculas` | normalizar distingue mayúsculas | MUERTO |
| `HU-089-ac5-familia-sin-modalidades` | nunca advierte familia sin modalidades | MUERTO |
| `HU-089-rf-8-16-8-modalidad-texto-cliente` | no exige el texto de cara al cliente | MUERTO |
| `HU-143-ac1-desactivar-en-uso` | desactivar no cambia el activo | MUERTO |
| `HU-143-ac2-impacto-fusion` | el impacto lista perfiles de cualquier valor | MUERTO |
| `HU-143-ac3-confirmar-fusion` | la fusión no retira las filas hijas del origen | MUERTO |
| `HU-143-ac4-fusion-imposible` | no rechaza fusionar un valor consigo mismo | MUERTO |
| `HU-143-ac5-cancelar-fusion` | ver el impacto ya escribe | MUERTO |
| `HU-139-ac1-equivalencia` | el vocabulario ignora el léxico aprobado | MUERTO |
| `HU-139-ac2-aprobar-propuesta` | aprobar editada ignora la edición | MUERTO |
| `HU-139-ac3-rechazar-propuesta` | rechazar no cambia el estado | MUERTO |
| `HU-139-ac4-valor-inexistente` | un valor inexistente cae al primero del catálogo | MUERTO |
| `HU-139-ac5-candidatas` | una candidata decidida se puede volver a decidir | MUERTO |
| `IP-ss1-migracion-permisos` | el panel recibe DELETE sobre el léxico | MUERTO |
| `IP-ss1-unidad-trabajo-auditoria` | la unidad de trabajo no sube la versión global | MUERTO |
| `IP-ss1-observador-403` | la observadora puede escribir catálogos | MUERTO |
| `IP-ss1-lexico-portal` | el portal pierde la vista del léxico aprobado | MUERTO |
| `IP-ss1-worker-proponer-lexico` | el lote no veta nombres de perfiles | MUERTO |
| `BND-llm-interpreter-suggest-lexicon-entries` | la llave viaja en la URL en vez de la cabecera | MUERTO |

Todos los mutantes murieron; el árbol se restauró tras cada uno (`git status` limpio en el sha).

## Pendientes declarados

- `HU-089-ac2-seleccionar-no-escribir`: el endpoint `?q=` y las coincidencias del dominio están probados y mutados, pero el campo de tecnologías del **editor de perfiles** no existe hasta el sub-slice 2 (HU-125): el item sigue `failing` hasta verlo en esa pantalla.
- `BND-llm-interpreter-suggest-lexicon-entries`: `GEMINI_API_KEY` ausente → `na: no_credentials` (transitorio). Sin intercambio real con Gemini el item sigue `failing`; el adaptador está probado contra un `fetch` falso y el doble (no cuenta como evidencia de frontera).
