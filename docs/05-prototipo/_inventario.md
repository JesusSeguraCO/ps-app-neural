# Inventario de pantallas — prototipo de referencia (heredar v2 y completar)

> Artefacto de trabajo (no entra al manifest). Derivado el 2026-09-27 de `docs/06-flows/`,
> `docs/04-historias/` (81 HU; HU-079 descartada), PRD v4.13 y el prototipo v2
> (`docs/07-prototipo/`, 9 pantallas `data-screen-label` + menú de `admin-shell.tsx`).
> Origen: **v2-existe** = se hereda casi tal cual · **v2-adaptar** = cambia por acceso nominal,
> «Mi equipo» en servidor o login con código · **nueva** = sin pieza en el v2.

| # | slug | título | épica | HU | origen | variantes |
|---|---|---|---|---|---|---|
| 1 | app-shell | Marco cliente (riel, cuenta, vigencia) | EP-001 | 090, 091, 094 | v2-existe | --sin-seleccion |
| 2 | puerta-acceso | Puerta: correo invitado → código | EP-001 | 090, 095 | v2-adaptar | --codigo, --codigo-invalido, --intentos-agotados |
| 3 | correo-codigo-acceso | Correo con código de un uso | EP-001 | 090, 123 | nueva | --panel |
| 4 | acceso-vencido | Enlace vencido y renovación | EP-001 | 092 | v2-adaptar | --enviado, --en-camino, --cuenta-inactiva |
| 5 | enlace-revocado | Enlace revocado o alterado | EP-001 | 144, 090 | v2-adaptar | — |
| 6 | correo-enlace-renovado | Correo con el enlace nuevo | EP-001 | 092 | nueva | — |
| 7 | aterrizaje-curado | Selección con su razón | EP-001 | 091, 144, 094 | v2-adaptar | --perfil-cambio, --sin-publicados, --sin-proyecto |
| 8 | encuadre-sin-seleccion | «¿Qué necesita tu proyecto?» | EP-001 | 093 | nueva | --opcion-sin-perfiles |
| 9 | invitar-colega | Pedir acceso para un colega | EP-001 | 095, 145 | nueva | --pendiente, --rechazada |
| 10 | panel-acceso | Login del panel (@trycore.com + código) | EP-001 | 123 | nueva | --codigo, --sesion-caducada |
| 11 | admin-shell | Marco del panel | EP-001 | 123 | v2-adaptar | — |
| 12 | enlaces-acceso | Registro de enlaces y revocación | EP-001 | 122, 144 | v2-adaptar | — |
| 13 | generador-enlace | Generar enlace curado | EP-001 | 122 | v2-adaptar | --sin-razon, --perfil-no-publicado, --sin-invitados, --emitido |
| 14 | peticiones-invitacion | Peticiones de invitación | EP-001 | 145 | nueva | --rechazo-motivo, --enlace-no-vigente, --ya-invitado |
| 14b | renovaciones-enlace | Renovaciones de enlace | EP-001 | 146 | feature (2026-09-29) | --revocar |
| 15 | resultados | Resultados en tarjetas y facetas | EP-002 (+EP-009) | 074, 081, 065, 071, 072 | v2-existe | --banco-completo, --buscando, --sin-reconocer, --afinamiento |
| 16 | resultados-tabla | Vista tabla | EP-002 | 121 | v2-existe | --sin-criterios, --seleccion, --estrecha |
| 17 | ficha-perfil | Ficha en panel lateral | EP-003 | 119, 120, 081 | v2-existe | --sin-criterios, --dato-ausente, --extremo, --movil |
| 18 | mi-equipo | Mi equipo | EP-004 | 080, 084, 095 | v2-adaptar | --vacio, --forma-referencia, --completa |
| 19 | resumen-solicitud | Resumen y envío (paso 3 de 3) | EP-005 | 096, 100 | v2-existe | --perfil-no-disponible, --vacio |
| 20 | solicitud-equipo | Identificación (paso 2 de 3) | EP-005 | 097, 070, 082 | v2-adaptar | --correo-bloqueado, --ubicacion-requerida, --especificacion-incompleta |
| 21 | confirmacion-solicitud | Confirmación con SLA de 10 días hábiles | EP-005 | 098 | v2-existe | --solicitud-parecida |
| 22 | agendar-alineacion | Agendar la sesión de alineación | EP-005 | 099 | nueva | --sin-horarios, --agendada |
| 23 | correo-aviso-interno | Avisos internos por correo | EP-005/007/011 | 101, 103, 105, 117 | nueva | --solicitud-delivery, --fallo-integracion, --cuenta-sin-apertura, --escalamiento |
| 24 | inventario-perfiles | Inventario | EP-006 | 124, 132, 133, 134, 135 | v2-adaptar | --observador, --incoherencia, --pausar-motivo, --lote |
| 25 | perfil-editor | Crear/editar perfil | EP-006 | 125, 126, 127, 128, 130, 131 | v2-adaptar | --campos-incompletos, --familia-sin-modalidades, --publicar-bloqueado, --cambios-declarados, --consentimiento-invalido, --adjunto-no-admitido |
| 26 | borrador-evidencia | Borrador de campos desde el artefacto | EP-006 | 140 | nueva | --sin-texto, --campo-ambiguo |
| 27 | vista-previa-ficha | Vista previa de la ficha | EP-006 | 129 | v2-existe | --bloque-incompleto |
| 28 | importar-perfiles | Importar, exportar y revertir | EP-006 | 086, 088, 141, 142, 087 | v2-adaptar | --vista-previa, --codigo-duplicado, --campos-rechazados, --filas-con-error, --revertir, --revertir-no-ultima |
| 29 | catalogos | Catálogos | EP-006 | 089, 143 | nueva | --parecidos, --duplicado, --fusion, --modalidad-en-uso |
| 30 | lexico-busqueda | Léxico de búsqueda | EP-006 | 139 | nueva | --equivalencia-invalida, --candidatas |
| 31 | bandeja-vigencia | Bandeja de vigencia | EP-006 | 136 | v2-existe | --vacia |
| 32 | colocados | Colocados y vencimientos | EP-006 | 137 | nueva | --corte-desactualizado, --en-el-portal |
| 33 | auditoria-perfil | Registro de auditoría | EP-006 | 138 | nueva | --archivado |
| 34 | integraciones-fallidas | Bandeja de fallos con HubSpot | EP-007 | 105 | nueva | — |
| 35 | medicion | Tablero: embudo, acierto, facetas, rutas | EP-008 | 108–112 | nueva | --sin-actividad, --ruta-sin-datos |
| 36 | inicio-busqueda | Inicio: saludo, compositor, sugerencias | EP-009 | 065, 066, 067 | v2-existe | --sugerencia-generica, --requerimiento-pegado, --sin-criterios-reconocibles |
| 37 | perfil-objetivo | Perfil Objetivo | EP-009 | 068, 069, 070, 118, 082, 083, 085, 073 | v2-existe | --baja-confianza, --combinacion-vacia, --ubicacion-obligatoria, --retomada |
| 38 | cero-resultados | El cero con la especificación a la vista | EP-010 | 075, 076, 118, 083 | v2-existe | --por-filtro, --cercanos, --obligatorio-vaciante, --vaga |
| 39 | solicitud-a-medida | Pedir el perfil que no existe | EP-010 | 077 | v2-existe | --enviada, --ya-existente |
| 40 | demanda-no-cubierta | Registro de demanda (panel) | EP-010 | 078, 085 | nueva | --vacia |
| 41 | selecciones-curadas | Selección curada y enlaces por destinatario | EP-011 | 113, 114 | nueva | --destinatario-sin-cuenta, --enlace-perdido, --perfil-cambio, --perfil-repetido, --sin-proyecto |
| 42 | enlaces-y-contenido | Enlaces y contenido listo para Gmail/HubSpot | EP-011 | 115 | nueva | --cadencia-vencida, --contacto-sin-cuenta, --desactualizado, --enlace-no-visible, --excluidos, --salida-registrada, --sin-razon |
| 43 | seguimiento-envios | Quién entró por su enlace | EP-011 | 116, 117 | nueva | --cuenta-escalada, --entregabilidad, --sin-salida-registrada |
| 44 | correo-boletin-curado | Vista previa del bloque curado (se envía desde Gmail o HubSpot) | EP-011 | 113, 114, 115 | nueva | --hubspot, --sin-proyecto |

**Totales:** 44 pantallas base · 116 variantes de estado (rediseño con oficio del 2026-09-27; EP-011 rehecha: el boletín se arma y envía desde Gmail o HubSpot, el portal entrega selección curada y enlaces por destinatario).

**Historias sin interfaz del portal** (comportamiento de backend/CRM, verificadas en sus slices, no en el prototipo): HU-102, HU-104, HU-106, HU-107 (EP-007). HU-079 descartada.

**Lotes:** 1 · EP-001 (#1–14) → 2 · búsqueda y evidencia (#36–37, 15–17) → 3 · equipo y solicitud
(#18–23) → 4 · el cero (#38–40) → 5 · panel de inventario (#24–33) → 6 · integración, medición y
distribución (#34–35, 41–44).

**Supuestos confirmados por el sponsor (2026-09-27):** HU-101 y HU-105 avisan por correo interno (T-28); el boletín (RF-18) se programa en el panel. **Pendiente:** HU-145 falta en el Mermaid de EP-001 (tarea del auditor de flows).
