# Proposal

## Why

El portal solo vale lo que vale su banco: si Talento Humano no puede crear, publicar, corregir y retirar perfiles con consentimiento nominal, cuidar su disponibilidad y cargar decenas de cambios de una vez sin miedo a romper nada, el cliente ve un inventario viejo o vacío y la curaduría pierde credibilidad. Hasta hoy el banco vive en perfiles ficticios sembrados (modelo mínimo de EP-001). EP-006 entrega la administración completa del inventario desde el panel —perfiles, catálogos, léxico, evidencia, importación, colocados, auditoría, accesos y contacto— con las garantías que el PRD declara no negociables: sin borrado físico, sin publicar sin consentimiento nominal ni modalidad de prueba, sin que la importación publique ni conceda consentimiento, y con cada cambio atribuido a una persona.

## What Changes

- **Catálogos paramétricos**: alta de roles, tecnologías, sectores, modalidades de prueba (con su texto de cara al cliente) y motivos de pausa sin duplicar (idéntico salvo mayúsculas se impide; parecido se avisa); desactivar sin borrar y fusionar duplicados con vista de impacto previa.
- **Léxico de búsqueda**: equivalencias término → valor de catálogo administradas en el panel, sin despliegue; propuestas semanales de Gemini (solo texto de consulta y taxonomía) que entran únicamente con aprobación humana; consultas sin coincidencia como candidatas al léxico o a la agenda de reclutamiento.
- **Perfiles**: crear siempre en borrador eligiendo del catálogo; editar un publicado con impacto declarado antes de confirmar y la pregunta de D1 si el cambio lo deja incompleto; vista previa fiel de la ficha (D3); archivar en lugar de borrar.
- **Consentimiento y publicación**: consentimiento nominal y explícito (el anonimizado no sirve; revocar despublica al momento; parcial despersonaliza la experiencia); bloqueo de publicar sin consentimiento o sin modalidad de prueba elegida (D10), también en lote; publicación con Nivel 0 sin esperar el reporte detallado.
- **Disponibilidad y vigencia**: cambio de disponibilidad en dos clics desde el listado y en bloque; pausa con motivo de lista corta (una fecha no es una pausa); matriz de incoherencias estado × disponibilidad de D5 (ALTA bloquea, MEDIA advierte) en la propia fila; bandeja de vigencia con publicados sin actualizar y pausados de más de 30 días (D4).
- **Evidencia de validación**: artefacto (documento, transcripción o repositorio, hasta 64 MB, sin video) en almacenamiento privado; solo la administradora lo descarga desde el panel (D11, D18); nunca llega al portal; borrador del reporte precargado desde la modalidad de prueba por plantilla determinista, sin IA, que una persona confirma (D19).
- **Importación masiva**: plantilla y exportación del banco en hoja de cálculo y JSON (D2: exportar primero); pegar la hoja con detección de formato, emparejamiento de columnas guardable y reutilizable (HU-148); vista previa sin escritura; modos crear/actualizar/ambos; fusión con ausente ≠ vacío ≠ `[vaciar]`; prohibido publicar o conceder consentimiento; descarga de solo las filas con error; reversión de la última importación.
- **Colocados**: registro del colocado en el panel como fuente (D8), pestaña ordenada por vencimiento con los de 60 días destacados; el colocado sigue publicado con su fecha de liberación; carga del archivo de Operaciones en JSON o CSV con fecha de corte, aviso «dato desincronizado» a los más de 7 días y «diferencia con Operaciones» cuando choca con el panel (D12, D15, D16).
- **Auditoría del inventario**: consulta por perfil de qué campo cambió, antes y después, quién y cuándo, incluidos consentimiento, estado, importación y carga de Operaciones; sin identidad verificada no entra ningún cambio.
- **Rol observador**: consulta de inventario, enlaces y colocados sin controles de escritura (D14); el intento por ruta directa se rechaza, se explica y queda en la auditoría; aviso a la administradora con el perfil identificado.
- **Accesos al panel (HU-151)**: alta, cambio de rol y baja de correos `@trycore.com` desde el panel, auditados; dar de baja o bajar a observador corta la sesión en la siguiente petición (D17); el panel nunca queda sin administradora activa.
- **Contacto de Trycore (HU-147)**: nombre, cargo y correo `@trycore.com` configurables desde el panel; las cinco pantallas de contacto del portal dejan de usar el buzón fijo de EP-001.

Se construye en diez sub-slices de hasta tres historias, de uno en uno y con el recorrido verde entre cada uno, en el orden del DoR: 1 catálogos y léxico · 2 crear perfil y consentimiento · 3 exportar, pegar y plantillas de columnas · 4 confirmar, revertir y corregir errores · 5 bloqueo, vista previa y Nivel 0 · 6 editar publicado, evidencia y borrador · 7 disponibilidad, vigencia y pausa · 8 incoherencias y archivo · 9 colocados, carga de Operaciones y observador · 10 accesos, contacto y auditoría.

## Capabilities

### New Capabilities

- `catalogos-parametricos`: alta sin duplicados, dependencia rol → familia → modalidades de prueba, desactivación sin borrado y fusión con impacto previo.
- `lexico-busqueda`: equivalencias administrables, propuestas de Gemini con aprobación humana y consultas sin coincidencia como candidatas.
- `perfiles-inventario`: creación en borrador desde el catálogo, edición de publicados con impacto declarado, vista previa fiel y archivo sin borrado.
- `consentimiento-y-publicacion`: consentimiento nominal, bloqueo de publicación por consentimiento o modalidad, publicación masiva y Nivel 0.
- `disponibilidad-y-vigencia`: disponibilidad en dos clics y en bloque, pausa con motivo, matriz de incoherencias D5 y bandeja de vigencia.
- `evidencia-validacion`: artefacto privado descargable solo por la administradora desde el panel y borrador del reporte desde la modalidad de prueba.
- `importacion-masiva`: plantilla y exportación, pegar y previsualizar, emparejamientos guardados, confirmación por modo, reversión y descarga de filas con error.
- `colocados`: registro de colocados en el panel, pestaña por vencimiento y carga del archivo de Operaciones con fecha de corte.
- `auditoria-inventario`: registro consultable por perfil de cada cambio con su autor y su origen.
- `contacto-trycore`: contacto que ve el cliente, configurable desde el panel.

### Modified Capabilities

- `acceso-panel`: la autorización por rol explica el rechazo y deja el intento en la auditoría (HU-124); se añaden la consulta del observador (HU-124) y la administración de la lista de acceso con corte de sesión y sin quedarse sin administradora (HU-151).

`plataforma-base` no cambia de contrato: la CSP del panel ya prevé el origen de Spaces para la subida prefirmada (ADR-0010) y los tipos de trabajo de importación ya están en la lista blanca del panel (migración 0001); `aterrizaje-curado` ya garantiza el estado real de un perfil que dejó de estar publicado, que HU-127 y HU-135 solo consumen.

## Impact

- **Código**: `apps/panel` (inventario, editor, vista previa, importar, catálogos, léxico, bandeja, colocados, auditoría, administración), `apps/portal` (pantallas de contacto, ficha con reporte de validación y experiencia despersonalizada), `apps/worker` (`aplicar_importacion`, `revertir_importacion`, `proponer_lexico`), `packages/{dominio,infra,contratos,ui}`.
- **Datos**: migraciones hacia adelante desde la 0013 sobre el inventario de la 0005: modalidades de prueba por familia, perfil completo del Anexo B (B.2, B.7, B.8.6), consentimiento nominal con alcance, `inventario_version`, validaciones y artefactos, borradores de evidencia, lotes de importación con foto previa, plantillas de emparejamiento, léxico y propuestas, colocaciones y cargas de Operaciones, contacto de Trycore; `colocado` deja de ser un estado del perfil (RF-8.3, RF-8.13.2). Auditoría encadenada de ADR-0003 por `auditoria.registrar(...)`.
- **Fronteras externas (solo servidor)**: Gemini por `fetch` desde el worker (`proponer_lexico`, sin datos de perfiles, doble en CI); DO Spaces privado con URL prefirmadas solo del panel (`@aws-sdk/client-s3` y `@aws-sdk/s3-request-presigner`, ya en la lista permitida). HubSpot no interviene.
- **Seguridad y datos personales**: Ley 1581 (consentimiento nominal, artefactos que identifican al profesional, contacto de una persona empleada); lista negra B.4 nunca entra al banco; `ps_portal` sigue leyendo solo vistas.
- **Dependencias**: ninguna nueva; todo dentro de `.claude/config/stack-allowlist.json` (vigilado por `stack-guard.sh`).

## Trazabilidad

- Épica: EP-006
- Historias: HU-086, HU-087, HU-088, HU-089, HU-124, HU-125, HU-126, HU-127, HU-128, HU-129, HU-130, HU-131, HU-132, HU-133, HU-134, HU-135, HU-136, HU-137, HU-138, HU-139, HU-140, HU-141, HU-142, HU-143, HU-147, HU-148, HU-150, HU-151
- Discovery: docs/03-backlog/epicas.md#ep-006--administración-del-inventario
- Decisiones: .claude/state/evidencia/ep-006/decisiones-sponsor-2026-09-30.md (D1–D19; HU-149 descartada por D11, no entra)
- DoR: .claude/state/evidencia/ep-006/dor-pass.md (orden de los 10 sub-slices)
- Arquitectura: docs/adr/0002, 0003, 0006, 0008, 0009, 0010 y docs/adr/_backlog-arquitectonico.md (UC-9 a UC-14, QA-4, QA-5, QA-9 a QA-11, QA-20)
- Diseño: docs/05-prototipo/manifest.json (66 pantallas de EP-006 aprobadas, 33f671c)
