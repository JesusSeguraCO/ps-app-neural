# HU-133-ac1-pausa-motivo

estado-perfil.test.ts «exige un motivo del catálogo, sale del portal y queda el motivo con quién y desde cuándo», «un motivo retirado del catálogo no sirve para pausar»; migracion-0019.test.ts (pausado_en por disparador, CHECK); e2e pausa por la hoja → BD pausado+motivo+pausado_en. Mutantes M10, M11, M14 muertos.

Corrida 2026-10-01 con BD real (eval scripts/bd-local.sh entorno): suite 962 ✓, Playwright 51 ✓; mutación ss7 17/17 muertos (../mutar-ss7.out). Detalle: ../tdd-ss7.md, ../journey-ss7.md, ../fidelidad-ss7.md.
