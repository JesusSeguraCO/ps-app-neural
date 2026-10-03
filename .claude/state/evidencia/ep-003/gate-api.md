# EP-003 · gate api — contrato Newman (fase api, cierre)

- **HEAD de la corrida**: `e5ceb698a274f3f45917b44717d2b578d39750c4` (rama `feature/ep-003-evidencia-del-perfil`). El código de producto
  es el de `71305da` (los dos commits posteriores solo tocan `tests/postman/`); servidores standalone compilados a las 17:36-17:37 -05.
- **Hora (UTC)**: 2026-10-02T22:48:54Z · **rc = 0**
- **Entorno**: BD aislada `ps_ep003` (PgBouncer :64329, siembra por :54329), portal :3210 y panel :3211 standalone con cabecera
  `x-ps-edge`, ayudante :3219. La BD `ps` no se tocó (los scripts se niegan a usarla).
- **Comando**: `tests/postman/correr-ep-003.sh` (genera la colección, siembra con sufijo, levanta servidores, corre
  `npx --yes newman run tests/postman/ep-003.postman_collection.json -e tests/postman/environment.json --env-var … --reporters cli,json --reporter-json-export .claude/state/evidencia/ep-003/newman-ep-003.json`, para por PID y limpia).
- **Resultado**: **71 peticiones, 179 aserciones, 0 fallidas** (`newman-ep-003.json`, `newman-ep-003.log`).

## Endpoints → peticiones → aserciones

| App | Método | Ruta | Peticiones | Aserciones | Fallidas |
|---|---|---|---|---|---|
| panel | GET | `/catalogos/alcance_saro` | 2 | 5 | 0 |
| panel | POST | `/catalogos/alcance_saro` | 8 | 18 | 0 |
| panel | GET | `/catalogos/alcance_saro/{id}` | 1 | 2 | 0 |
| panel | POST | `/perfiles` | 11 | 30 | 0 |
| panel | POST | `/perfiles/{codigo}/consentimiento` | 1 | 1 | 0 |
| panel | POST | `/perfiles/{codigo}/publicar` | 4 | 15 | 0 |
| panel | PATCH | `/perfiles/{codigo}` | 8 | 16 | 0 |
| panel | GET | `/perfiles` | 3 | 6 | 0 |
| panel | PATCH | `/perfiles/{codigo}?previsualizar` | 4 | 10 | 0 |
| panel | PATCH | `/perfiles/{codigo}?resolucion` | 2 | 4 | 0 |
| portal | GET | `/catalogo` | 5 | 20 | 0 |
| portal | GET | `/banco?ficha` | 4 | 14 | 0 |
| panel | PATCH | `/catalogos/alcance_saro/{id}?previsualizar` | 2 | 4 | 0 |
| panel | PATCH | `/catalogos/tecnologia/{id}?previsualizar` | 1 | 2 | 0 |
| panel | PATCH | `/catalogos/alcance_saro/{id}` | 3 | 6 | 0 |
| panel | POST | `/catalogos/alcance_saro/{id}/desactivar` | 2 | 4 | 0 |
| panel | POST | `/catalogos/alcance_saro/{id}/reactivar` | 1 | 2 | 0 |
| panel | GET | `/importacion/plantilla?formato=csv` | 2 | 6 | 0 |
| panel | GET | `/importacion/plantilla?formato=json` | 1 | 2 | 0 |
| panel | GET | `/importacion/plantilla?formato=xlsx` | 1 | 1 | 0 |
| panel | GET | `/importacion/exportar?formato=csv` | 2 | 6 | 0 |
| panel | GET | `/importacion/exportar?formato=json` | 1 | 2 | 0 |
| ayudante | POST | `/heredado?codigo={codigo}` | 1 | 2 | 0 |
| panel | GET | `/perfiles/{codigo}` | 1 | 1 | 0 |

Qué se aserta: status, motivo, claves exactas de la respuesta (catálogo del portal: las 13 claves de `PerfilCatalogo`, nada
más), cabeceras (`content-type`, `cache-control: no-store`, `nosniff`, `content-disposition` de CSV), «Falta <motivo>» + campo de
cada condición SARO/DISC, avisos de lenguaje de inventario (y su ausencia dentro de otra palabra), pregunta D1 y la de HU-178,
impacto en meses, y en el portal: sin claves B.4/internas, sin «Incompleto», sin id ni nombre interno del alcance, sin fecha exacta.

## Notas honestas

- **Ficha del portal**: no hay endpoint JSON; se verifica sobre el HTML renderizado de `/banco?ficha=…` (texto y ausencias).
- **Publicado heredado incompleto (HU-178)**: la API no permite crearlo; el ayudante `tests/postman/ayudante-ep-003.mjs` quita el
  SARO por SQL a un perfil de la propia corrida. Es una preparación por debajo de la app, no una prueba de ella.
- **Importación por lotes con columnas SARO/DISC** (subir → calcular → aplicar con el worker) no está en esta colección: solo
  plantilla y exportación. Queda cubierta por los tests de `apps/importacion-saro-panel.test.ts`, no por Newman.
- **Incidente en la BD aislada durante la preparación** (ya corregido): la primera limpieza borraba perfiles; el código PS se
  asigna como max+1 y la clave de titular es solo inserción, así que el siguiente alta reusaba el código y daba 500 (lo vio la
  corrida previa fallida, 67 aserciones). Entre ~22:46 y ~22:48 UTC las altas de perfil en `ps_ep003` pudieron fallar también
  para la otra corrida que comparte la BD. Arreglo: 7 perfiles marcador archivados («Newman EP003 retirado», PS-0708, 0730,
  0731, 0737–0740) y la limpieza ahora archiva en vez de borrar. Además, durante el sondeo se desactivó ~20 s el alcance
  compartido «Antecedentes judiciales, disciplinarios y fiscales» y se reactivó (queda en la auditoría).
- **Restos en `ps_ep003`**: perfiles archivados con apellido `Newman<RUN>` y sus consentimientos/auditoría (solo inserción),
  usuarios del panel de baja, y el alcance «Alcance n3-explora1», que otra corrida empezó a usar en sus perfiles (no se borró).

## Re-anclaje a HEAD (9c041678cedf67de80f857d2c06289750d515abb, 2026-10-02T23:32:29Z)
Corrida nueva de `tests/postman/correr-ep-003.sh` en HEAD (incluye la importación por lotes con SARO/DISC del commit
3a8b2af y el refactor d751aa1 de la importación), portal :3210 / panel :3211 standalone recién compilados por el runner,
BD `ps_ep003`:
```
│              iterations │                  1 │                 0 │
│                requests │                 82 │                 0 │
│            test-scripts │                 82 │                 0 │
│              assertions │                211 │                 0 │
newman rc=0
quedan (archivados) perfiles=4 no archivados=0 alcances=0 usuarios activos=0 claves huérfanas=0
```
82 peticiones, 211 aserciones, 0 fallidas. La limitación anterior («importación por lotes no está en Newman») queda
cerrada. Log: `newman-ep-003-head.log`; export JSON: `newman-ep-003.json`. Veredicto: PASS.

## Nota (2026-10-03): export JSON fuera del repositorio
`newman-ep-003.json` (135 MB) supera el límite de 100 MB de GitHub y se quitó del historial de la rama
(`mapa-sha-filtrado.md`). Se versiona `newman-ep-003.resumen.json` con las stats (82 peticiones, 211 aserciones,
0 fallos), los fallos (ninguno) y las aserciones por petición; el export completo se regenera con
`tests/postman/correr-ep-003.sh` y queda en local sin seguimiento.
