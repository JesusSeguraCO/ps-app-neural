# EP-003 · correspondencia de sha tras quitar el export de Newman del historial

El export JSON completo de Newman (`newman-ep-003.json`, 96 MB y 135 MB en dos commits) superaba el límite de 100 MB de GitHub y bloqueaba el push. Se quitó de los 57 commits de la rama con `git filter-branch --index-filter 'git rm --cached …'` (único cambio: ese fichero; `git diff respaldo-ep003-antes-de-filtrar HEAD` solo lo muestra a él). La evidencia escrita antes cita los sha antiguos; esta tabla da su equivalente. El historial original queda en la etiqueta local `respaldo-ep003-antes-de-filtrar`. En su lugar se versiona `newman-ep-003.resumen.json` (stats, fallos y aserciones por petición).

| sha antiguo | sha nuevo | commit |
|---|---|---|
| f65f74e | f65f74e | docs(ep-003): change OpenSpec ep-003-evidencia-del-perfil |
| 891e056 | 891e056 | feat(ep-003): migraciones 0027 y 0028 de alcances SARO y validaciones de entrada |
| 0b83251 | 0b83251 | feat(ep-003): catálogo de alcances SARO y captura de SARO/DISC en el perfil (HU-177, HU-176) |
| cf76bea | cf76bea | feat(ep-003): contrato HTTP de SARO/DISC en el editor e historial legible (HU-176, HU-177) |
| a6ba2a6 | a6ba2a6 | test(ep-003): recorrido e2e de validaciones de entrada y down/up de 0027-0028 |
| 054834e | 054834e | fix(ep-003): la lista de fichas afectadas por corregir un texto va fuera del aviso |
| c78ea2b | c78ea2b | docs(ep-003): tareas 1.1–1.8 y 1.10 verificadas; 1.9 pendiente de aprobación |
| a71db2d | a71db2d | feat(ep-003): «Incompleto» con la guarda única y aviso de lenguaje de inventario en el dominio (HU-178, HU-194 |
| 0c40a91 | 0c40a91 | feat(ep-003): migración 0029 de indicadores de publicación y conteo de incompletos para el portal (HU-178, D80 |
| e8792ef | e8792ef | feat(ep-003): marca y filtro «Incompleto», pregunta con motivo y aviso de lenguaje en el panel (HU-178, HU-194 |
| 5df4f01 | 5df4f01 | fix(ep-003): heredados incompletos con códigos bajo el mayor del banco y opción --heredados-incompletos |
| 49e2c3a | 49e2c3a | test(ep-003): recorrido e2e de «Incompleto» y aviso de lenguaje; desviación de fidelidad de SS2 (D124) |
| 23c2f6d | 23c2f6d | test(ep-003): el conteo del portal se compara con las marcas antes de completar ningún incompleto |
| 6adb19c | 6adb19c | docs(ep-003): tareas 2.1–2.6 y 2.8 verificadas; 2.7 pendiente de aprobación |
| 343aa8a | 343aa8a | feat(ep-003): columnas SARO y DISC en importación, plantilla y exportación (HU-191, D81) |
| de2d980 | de2d980 | test(ep-003): recorrido e2e de SARO y DISC por importación con el worker real (HU-191) |
| ebc4a04 | ebc4a04 | docs(ep-003): decisiones de construcción de SS3 en design.md |
| 6d1491e | 6d1491e | docs(ep-003): tareas 3.1–3.4 y 3.6 verificadas; 3.5 pendiente de aprobación |
| 7084108 | 7084108 | feat(ep-003): capacidad, cinco tecnologías, Sello Personal válido y evidencia ✓/– en el dominio; el catálogo t |
| 92352f3 | 92352f3 | feat(ep-003): tarjeta con la capacidad primero, Sello Personal y evidencia ✓/– en tarjeta y «Frente a tu búsqu |
| 25f03b1 | 25f03b1 | test(ep-003): recorrido e2e de la tarjeta: código → selección → banco filtrado con ✓ → «Frente a tu búsqueda»  |
| ac8df73 | ac8df73 | test(ep-003): sin criterios, la tarjeta con Sello Personal no arrastra el título de evidencia (mutante M7) |
| dc1681a | dc1681a | test(ep-003): limpiar variables sin uso en los tests del contrato |
| 7222d73 | 7222d73 | docs(ep-003): tareas 4.1–4.5 y 4.7 verificadas; 4.6 pendiente de aprobación; decisiones de SS4 en design.md |
| de69456 | de69456 | feat(ep-003): validación técnica desplegable con los cinco campos de D59 y bloque de conversación con Trycore  |
| 7f00aac | 7f00aac | test(ep-003): recorrido e2e de la ficha: validación técnica desplegable, contacto y su cambio en el panel (HU- |
| 361217a | 361217a | test(ep-003): el e2e del reporte de EP-006 lee la validación técnica con los cinco campos de HU-155 |
| 2bffcf3 | 2bffcf3 | test(ep-003): el recorrido integrado de EP-006 lee la validación de Nivel 1 con los cinco campos de HU-155 |
| 632f8fa | 632f8fa | docs(ep-003): tareas 5.1–5.4 y 5.6 verificadas; 5.5 pendiente de aprobación; decisiones de SS5 en design.md |
| f0e3c70 | f0e3c70 | feat(ep-003): SARO y DISC con competencias como contenido, cierre con condiciones, SLA y garantía Neural Speed |
| f2faf4b | f2faf4b | test(ep-003): recorrido e2e de la ficha: SARO y DISC, cierre con SLA y garantía, código al pie, heredado sin S |
| 061051f | 061051f | docs(ep-003): tareas 6.1–6.4 y 6.6 verificadas; 6.5 pendiente de aprobación; decisiones de SS6 en design.md |
| e7e31b6 | e7e31b6 | feat(ep-003): encabezado del estándar Neural-Grid en cuatro dimensiones con la frase según el conteo de incomp |
| 785f76b | 785f76b | test(ep-003): recorrido e2e del estándar (descriptiva → completar el último incompleto → «ningún») y de las fi |
| f48808d | f48808d | fix(ep-003): aire vertical alrededor del encabezado del estándar y del respaldo (fidelidad SS7) |
| be0a9a8 | be0a9a8 | Revert «el doble de Mailgun espera hasta 90 s»: la causa era el orden con acceso.portal (topes de código), no  |
| ad5559f | ad5559f | docs(ep-003): tareas 7.1–7.5 y 7.7 verificadas; 7.6 pendiente de aprobación; decisiones de SS7 y plan de cierr |
| 7a52c71 | 7a52c71 | test(ep-003): los orígenes del portal y del panel en los e2e salen de PORTAL_URL/PANEL_URL (por defecto los de |
| 4db0e75 | 4db0e75 | test(ep-003): recorrido integrado de punta a punta en navegador real (tarea 8.1) |
| e644c18 | e644c18 | test(ep-003): contrato Newman de los endpoints de evidencia del perfil (fase api) |
| 2ec2f57 | 2ec2f57 | test(ep-003): la limpieza del contrato archiva los perfiles en lugar de borrarlos |
| b36f589 | b36f589 | docs(ep-003): desviaciones de fidelidad de la épica consolidadas en design.md (tarea 8.3; D124, D126, D134) |
| 2eed949 | 4a95eae | docs(ep-003): evidencia del gate api — Newman 71 peticiones, 179 aserciones, 0 fallos |
| 011e798 | 53fc9b7 | docs(ep-003): evidencia de gates (dor, tdd, coherencia, fidelidad, data) y plan de cierre |
| d751aa1 | 943476c | refactor(ep-003): la importación pregunta a la guarda única de publicación (evaluarPublicacion) |
| 3a8b2af | 974b1cd | test(ep-003): Newman de la importación por lotes con SARO/DISC (emparejar, vista previa, aplicar en el worker) |
| 8182a86 | 82cd3d4 | chore: ignorar los ficheros locales del arnés de construcción (credenciales y estado del runtime) |
| 9c04167 | 72a4b6f | test(ep-003): los e2e esperan a que el worker dé su primera vuelta antes de pedir el código y buscan el alcanc |
| f939e1d | e82468c | docs(ep-003): gates journey_smoke, fidelity, api y data con evidencia re-anclada a HEAD; tareas 8.1–8.3 hechas |
| c26c710 | 828122c | refactor(ep-003): un solo mapa campo→ancla para el editor, la vista previa y publicar varios; textoDeLinea pas |
| d20b6bb | dfe0483 | docs(ep-003): pasada 1 de cableado, item HU-178 ac4 con evidencia, frase de gate-tdd corregida y tareas de fid |
| c084db8 | c5e771d | fix(ep-003): la disponibilidad de los ficticios se siembra en día civil de Bogotá, no de UTC |
| c0476b2 | 3c518ea | docs(ep-003): runner de cierre en verde (build, lint, tipos, 1561 tests, 71 e2e) sobre ps_ep003 |
| e71ed18 | 63f21e2 | test(ep-003): los saltos «Falta …» de la vista previa y de publicar varios con test de comportamiento; todas l |
| 9f7682d | 3fdad38 | docs(ep-003): pasada 2 de cableado (PASA) y cierre de sus hallazgos con mutación verificada; runner verde en e |
| d81569f | b824ba0 | docs(ep-003): referencias «> OpenSpec change: ep-003-evidencia-del-perfil» en EP-003 y sus 15 HU; tarea 8.4 he |
| 038f712 | 20f8dad | chore(ep-003): gate dod (PASA) y archivo del change ep-003-evidencia-del-perfil con los specs sincronizados |
