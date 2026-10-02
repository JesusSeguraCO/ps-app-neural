# EP-003 · gate tdd (cierre de la épica)

- sha HEAD: e5ceb698a274f3f45917b44717d2b578d39750c4 (código de apps/ y packages/ idéntico al del runner y de las mutaciones; desde entonces solo e2e, tests/postman y evidencia)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T22:38:48Z
- suite completa ejecutada en sha 71305dac2f3f5c380721dc2b27319762924cc86e por el runner fuera del chat (`runner-integracion.md`); cambios en apps/ y packages/ entre ese sha y HEAD: ninguno (solo e2e/tests/evidencia)

## Suite completa, lint y tipos (REQUIERE_BD=1, BD real con BDs efímeras por test)
```
```
 RUN  v5.0.2 /Users/cmo/Local/claude/Apps/App People Service/.wt/ep-003
 Test Files  144 passed (144)
      Tests  1548 passed (1548)
   Start at  17:37:17
   Duration  31.29s (tests 92%, import 7%, transform 1%)
    Isolate  144 workers spawned · ~165ms startup each (spawn + environment, per file)
             at least ~2.47s faster with isolate: false — reuses workers across files instead of one per file
```
- rc: 0 · 32 s
```
lint (`npm run lint`) rc 0 · tipos (`npm run typecheck`) rc 0 — detalle en `runner-integracion.md`.

## Mutaciones de SS1–SS7 (presupuesto: obligatoria para cada test que sostiene un item de wiring)
| Sub-slice | Items de wiring | Items con mutación detectada | Mutantes muertos registrados | Evidencia |
|---|---|---|---|---|
| SS1 | 19 | 18 | 20 | `ss1/wiring/`  |
| SS2 | 17 | 17 | 29 | `ss2/wiring/`  |
| SS3 | 12 | 12 | 20 | `ss3/wiring/`  |
| SS4 | 16 | 16 | 48 | `ss4/wiring/` · `ss4/mutaciones.txt` |
| SS5 | 12 | 12 | 31 | `ss5/wiring/` · `ss5/mutaciones.txt` |
| SS6 | 9 | 9 | 28 | `ss6/wiring/` · `ss6/mutaciones.txt` |
| SS7 | 10 | 10 | 30 | `ss7/wiring/` · `ss7/mutaciones.txt` |
| **Total** | **95** | **94** | | |

94 de 95 items tienen al menos un mutante muerto; el restante es el recorrido e2e INT-SS1-journey-smoke (ver abajo) (el test cae con el código roto; código restaurado tras cada
mutante). Los 3 items de SS1 que solo citaban «rojo antes del código» recibieron mutación propia en este cierre
(`scratchpad/mutar-cierre.py`, sha 9519de3 de código idéntico al de HEAD):
```
M14 guarda: saro_fecha siempre cumple: rc=1 · 4 failed | 41 passed (45)
M15 observadora con catalogo.escribir: rc=1 · 1 failed | 14 passed (15)
M16 identico salvo mayusculas no se rechaza en la app: rc=1 · 1 failed | 9 passed | 15 skipped (25)
M17 indice unico sin normalizar: rc=1 · 1 failed | 7 passed (8)
```
M14 → HU-176-ac3b · M15 → INT-SS1-observador-403 · M16/M17 → HU-177-ac2. El item INT-SS1-journey-smoke es un
recorrido e2e (sin mutación exigible; su sensibilidad la dan las mutaciones de los items de AC que recorre).

Nota sobre la cifra: los `wiring-items.json` de SS1–SS7 suman 95 items (no 166); cada uno con su fichero en `ssN/wiring/`.

## Fronteras (references/boundary-check.md)
Ningún item `BND-*` en los checklists de SS1–SS7 ni en el runtime (`slice-ops.sh status` → wiring `[]`, ningún `failing`).
EP-003 no toca HubSpot, Gemini ni Mailgun (el doble de Mailgun solo se usa en e2e para el código de acceso).
