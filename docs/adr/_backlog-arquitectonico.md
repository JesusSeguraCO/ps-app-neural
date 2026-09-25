# Backlog Arquitectónico (ADD — Paso 7)

> Tablero de seguimiento del método ADD. Rastrea qué drivers/ASRs
> ([0000-drivers-y-asrs.md](0000-drivers-y-asrs.md)) han sido abordados por una decisión, cuáles están en
> progreso y cuáles pendientes. Equivale al Kanban arquitectónico que recomienda Len Bass para no perder
> de vista la cobertura entre iteraciones.
>
> **Este archivo es el estado de la capa de arquitectura.** Lo escribe la skill `setup-architecture`
> (`/build:architect`) y lo consumen los gates del arnés: el **DoR** verifica que los drivers
> arquitectónicamente significativos de una épica tengan un ADR con estado ≥ `ABORDADO` antes de abrir el
> slice; el gate **`stack_arch`** del Release Gate audita conformidad contra los ADRs referenciados aquí.

**Convención de estado:**
- `PENDIENTE` — driver sin decisión asociada (o con decisión de negocio abierta que la bloquea); siempre con
  su riesgo explícito en la tabla de riesgos.
- `EN DISEÑO` — iteración en curso.
- `ABORDADO` — existe ADR que lo cubre con análisis (Paso 7) registrado en su §5.
- `VERIFICADO` — el análisis confirma que la decisión satisface la medida de respuesta (idealmente
  revisado por un par). Ningún driver está aún en `VERIFICADO`. Iteración 8 (2026-09-25): 0008, 0009 y 0010
  (accepted) sustituyen a 0001, 0005 y 0007 (superseded) tras el cambio de plataforma; 0002, 0003, 0004 y 0006 siguen vigentes
  con su enmienda de plataforma.

La marca entre paréntesis es el **peor veredicto** que el driver recibe en el §5 de los ADRs que lo cubren
(✅ medida o plan de verificación concreto · ⚠️ cubierto con verificación pendiente o riesgo residual ·
❌ no satisfecho).

## Tablero por driver

> La columna **Trazabilidad** (EP/HU/§PRD de los que sale el driver, heredada del `0000`) es la que usa
> el DoR para el join épica↔driver: dado un `EP-XXX`, sus drivers son las filas cuya trazabilidad cita
> esa épica o alguna de sus HU. En los QA, que en el `0000` no llevan columna propia, la trazabilidad se
> deriva del artefacto y del UC que cita el escenario.

### Casos de uso (UC)

| Driver | Tipo | Prioridad | Trazabilidad (EP/HU) | Iteración | ADR | Estado |
|--------|------|-----------|----------------------|-----------|-----|--------|
| UC-1 Acceso nominal del cliente | Funcional | (A,A) | EP-001 · HU-090, HU-092, HU-144 · RF-1.1–1.6, 1.2.7, 1.2.9, 1.2.11, 19.6 · D-4 | 2 | 0002 | ABORDADO (✅) |
| UC-2 Invitar a un colega | Funcional | (A,M) | EP-001 · HU-095 · RF-1.2.10 | 2 | 0002 | ABORDADO (✅) |
| UC-3 Enlace curado con registro | Funcional | (A,A) | EP-001 · HU-122, HU-144, HU-091, HU-093, HU-094 · RF-19, RF-1.3, RF-2.1–2.2 | 2 | 0002 | ABORDADO (⚠️) |
| UC-4 Catálogo recortado solo con sesión | Funcional | (A,A) | EP-003, EP-009 · RF-3.7, 3.13, 13.5.5.2, 14.0 · §8, §8.3 | 1, 3, 8 | 0008, 0003 | ABORDADO (⚠️) |
| UC-5 Motor de criterios determinista | Funcional | (A,A) | EP-002, EP-009, EP-010 · HU-065, 074, 085, 118, 119, 076, 121 · RF-2.6, 13.7–13.10, 13.12, 14.3, 16.3 · D-14, D-24 | 1, 4, 8 | 0008, 0004 | ABORDADO (✅) |
| UC-6 Estado en la URL y persistencia local | Funcional | (A,M) | EP-002, EP-009 · HU-073, HU-096 · RF-2.5, 13.4, 16.4, 19.8 · D-16 | 4 | 0004 | ABORDADO (✅) |
| UC-7 Solicitud durable hacia HubSpot | Funcional | (A,A) | EP-005, EP-007 · HU-096–101, 102, 104, 105, 106, 107, 077 · RF-5, 9.1–9.6.2, 17 · D-6, D-7, D-21 | 5, 8 | 0009 | ABORDADO (⚠️) |
| UC-8 Camino del cero y demanda | Funcional | (A,M) | EP-010, EP-002 · HU-075, 077, 078 · RF-10, 11, 14.3, 15.1, 13.7.3 · D-11, D-12 | 4 | 0004 | ABORDADO (✅) |
| UC-9 Acceso al panel | Funcional | (A,A) | EP-006 · HU-123, HU-124 · RF-8.1–8.1.6 · D-22 | 2 | 0002 | ABORDADO (✅) |
| UC-10 Ciclo de vida del perfil y consentimiento | Funcional | (A,A) | EP-006 · HU-125–130, 132–135 · RF-8.2–8.5, 8.7, 8.10, 8.14 · B.9.2 | 3 | 0003 | ABORDADO (⚠️) |
| UC-11 Importación masiva y reversión | Funcional | (A,A) | EP-006 · HU-086, 087, 088, 141, 142 · RF-8.15 | 3 | 0003 | ABORDADO (✅) |
| UC-12 Auditoría por campo | Funcional | (A,A) | EP-006 · HU-138 · RF-8.9, 8.1.3 | 3 | 0003 | ABORDADO (✅) |
| UC-13 Catálogos paramétricos y léxico | Funcional | (A,M) | EP-006 · HU-089, 139, 143 · RF-8.12, 8.12.1, 8.16 · D-24 | 3 | 0003 | ABORDADO (✅) |
| UC-14 Colocados y evidencia | Funcional | (M,M) | EP-006 · HU-131, 137, 140 · RF-8.11, 8.11.1, 8.13 · B.8.4, B.9.3 | 3 | 0003 | ABORDADO (⚠️) |
| UC-15 Notificación y escalamiento hábil | Funcional | (A,A) | EP-007 · HU-101, HU-103 · RF-9.5, 9.7, 17.1–17.2 | 5, 8 | 0009 | ABORDADO (⚠️) |
| UC-16 Correo curado | Funcional | (A,M) | EP-011 · HU-113–117 · RF-18, 1.6 | 5, 8 | 0009 | ABORDADO (⚠️) |
| UC-17 Telemetría con atribución | Funcional | (A,M) | EP-008 · HU-108–112 · RF-7 | 6 | 0006 | ABORDADO (⚠️) |
| UC-18 Gemini acotado | Funcional | (M,A) | EP-009, EP-006 · HU-067, 072, 139 · RF-12.2.1, 8.12.1, 16 · D-24 | 4 | 0004 | ABORDADO (⚠️) |
| UC-19 Tareas programadas vigiladas | Funcional | (A,M) | EP-007 · RF-9.6.2 · §8.3 | 5, 8 | 0009 | ABORDADO (✅) |

### Atributos de calidad (QA)

| Driver | Tipo | Prioridad | Trazabilidad (EP/HU) | Iteración | ADR | Estado |
|--------|------|-----------|----------------------|-----------|-----|--------|
| QA-1 Rendimiento del filtrado | QA | (A,A) | EP-002, EP-009, EP-010 (UC-5) · RF-13.8 · §8, §13.5 | 1, 4, 8 | 0008, 0004 | ABORDADO (⚠️) |
| QA-2 Primer render útil | QA | (A,A) | EP-001, EP-003 (UC-3, UC-4) · §8 | 1, 8 | 0008, 0006, 0010 | ABORDADO (⚠️) |
| QA-3 Seguridad del acceso del cliente | QA | (A,A) | EP-001 · HU-090, HU-092, HU-144 (UC-1) · RF-1.2.9 | 2, 8 | 0002, 0006, 0010 | ABORDADO (⚠️) |
| QA-4 Autorización del panel | QA | (A,A) | EP-006 · HU-123, HU-124 (UC-9) · RF-8.1 | 2, 8 | 0008, 0002 | ABORDADO (✅) |
| QA-5 Confidencialidad y Ley 1581 | QA | (A,A) | EP-003, EP-006, EP-009 (UC-4, UC-18) · RF-3.13, RF-16 · §8, Anexo B | 2, 3, 8 | 0002, 0003, 0006, 0010 | ABORDADO (⚠️) |
| QA-6 Durabilidad de la solicitud | QA | (A,A) | EP-005, EP-007 · HU-096–101, HU-105 (UC-7) · RF-9.6.1 | 5, 8 | 0009, 0006 | ABORDADO (⚠️) |
| QA-7 Idempotencia | QA | (A,A) | EP-005, EP-007 · HU-104, HU-106 (UC-7) · D-7 | 5, 8 | 0009 | ABORDADO (✅) |
| QA-8 Entrega de correo | QA | (A,A) | EP-001, EP-007, EP-011 (UC-1, UC-15, UC-16) · §8.3 | 5, 8 | 0002, 0009, 0010 | ABORDADO (⚠️) |
| QA-9 Integridad de la importación | QA | (A,A) | EP-006 · HU-086–088 (UC-11) · RF-8.15 | 3 | 0003 | ABORDADO (⚠️) |
| QA-10 Reversibilidad de la importación | QA | (A,A) | EP-006 · HU-141, HU-142 (UC-11) · RF-8.15 | 3 | 0003 | ABORDADO (✅) |
| QA-11 Auditoría completa | QA | (A,A) | EP-006 · HU-138 (UC-12) · RF-8.9 | 3 | 0003 | ABORDADO (⚠️) |
| QA-12 Recuperabilidad | QA | (A,A) | Transversal · §8.3, §10.3 | 3, 7, 8 | 0003, 0010 | ABORDADO (⚠️) |
| QA-13 Observabilidad de los crons | QA | (A,A) | EP-007 (UC-19) · RF-9.6.2 | 5, 7, 8 | 0009, 0006, 0010 | ABORDADO (⚠️) |
| QA-14 Escalamiento a tiempo | QA | (A,A) | EP-007 · HU-103 (UC-15) · RF-9.7, RF-17 | 5, 8 | 0009 | ABORDADO (⚠️) |
| QA-15 Degradación del modelo | QA | (A,M) | EP-009, EP-006 · HU-067, 072, 139 (UC-18) · D-24 | 4 | 0004 | ABORDADO (✅) |
| QA-16 Estado en la URL | QA | (A,M) | EP-002, EP-009 · HU-073 (UC-6) · RF-2.5, RF-19.8 | 4 | 0004 | ABORDADO (⚠️) |
| QA-17 Veracidad y frescura | QA | (A,M) | EP-001, EP-003 · HU-144 (UC-3, UC-4) · RF-19.2, RF-8.14.4 | 3 | 0003 | ABORDADO (✅) |
| QA-18 Móvil (M-1..M-8) | QA | (A,M) | Toda épica con UI de la cara cliente · §8.1 | 1, 8 | 0008 | ABORDADO (⚠️) |
| QA-19 Accesibilidad WCAG 2.1 AA (A-1..A-8) | QA | (A,M) | Toda épica con UI (ambas caras) · §8.2 | 1, 8 | 0008 | ABORDADO (⚠️) |
| QA-20 Modificabilidad de catálogos y léxico | QA | (A,M) | EP-006 · HU-089, 139, 143 (UC-13) · RF-8.12, 8.16 | 3 | 0003 | ABORDADO (✅) |
| QA-21 Atribución de la telemetría | QA | (A,M) | EP-008, EP-011 · HU-108–112 (UC-17) · RF-7 | 6 | 0002, 0006 | ABORDADO (⚠️) |
| QA-22 Latencia de la notificación | QA | (A,M) | EP-007 · HU-101 (UC-15) · RF-9.7.1 | 5, 8 | 0009 | ABORDADO (⚠️) |

### Restricciones (CON)

| Driver | Tipo | Prioridad | Trazabilidad (EP/HU) | Iteración | ADR | Estado |
|--------|------|-----------|----------------------|-----------|-----|--------|
| CON-1 cPanel, PHP 8.3, MariaDB, sin Node | Restricción | — | §8.3, D-23, hosting §2 | 1, 8 | 0008, 0002, 0009 | REEMPLAZADA (it. 8 → CON-18, CON-19) |
| CON-2 Límites PHP 180 s / 512 MB / 64 MB | Restricción | — | hosting §2 | 1, 8 | 0008, 0003, 0009 | REEMPLAZADA (it. 8 → CON-18) |
| CON-3 Despliegue `.cpanel.yml`, sin `node_modules` | Restricción | — | §8.3, hosting §3–§4 | 1, 7, 8 | 0008, 0010 | REEMPLAZADA (it. 8 → CON-18) |
| CON-4 Acceso sin proveedor de identidad | Restricción | — | D-4, D-22, RF-1.2, RF-8.1 | 2 | 0002 | ABORDADO (✅) |
| CON-5 Correo solo por SMTP autenticado | Restricción | — | §8.3, hosting §7 | 5, 8 | 0009 | REEMPLAZADA (it. 8 → CON-20) |
| CON-6 Secretos solo en servidor | Restricción | — | §8.3 | 2 | 0002, 0004 | ABORDADO (✅) |
| CON-7 Llamadas externas solo con `curl` | Restricción | — | hosting §2 | 5, 8 | 0009 | REEMPLAZADA (it. 8 → CON-21) |
| CON-8 Gemini acotado, sin datos de perfiles | Restricción | — | RF-16, D-24 | 4 | 0004 | ABORDADO (✅) |
| CON-9 El portal solo lee; sin API abierta | Restricción | — | §8, §8.3 | 1, 3, 8 | 0008, 0003 | ABORDADO (✅) |
| CON-10 Privacidad Ley 1581 / lista negra B.4 | Restricción | — | §8, Anexo B, D-9, D-18, RF-1.5, RF-3.13 | 2 | 0002 | ABORDADO (⚠️) |
| CON-11 Sin borrado físico | Restricción | — | RF-8.3, 8.15.7, 8.16.5 | 3 | 0003 | ABORDADO (✅) |
| CON-12 Móvil y WCAG como definición de hecho | Restricción | — | §8.1, §8.2 | 1, 8 | 0008 | ABORDADO (⚠️) |
| CON-13 Estado en la URL es requisito duro | Restricción | — | RF-2.5 | 1, 4, 8 | 0008, 0004 | ABORDADO (✅) |
| CON-14 Decisiones irreversibles a preservar | Restricción | — | §13.7, RF-16.3, 16.4, D-16 | 1, 4, 8 | 0008, 0004 | ABORDADO (⚠️) |
| CON-15 Cloudflare, ModSecurity, sin listado | Restricción | — | §8.3, hosting §5 | 2, 7, 8 | 0002, 0003, 0010 | REEMPLAZADA (it. 8 → CON-22) |
| CON-16 JetBackup en el mismo servidor, 1 día | Restricción | — | §8.3, §10.3 | 3 | 0003 | REEMPLAZADA (it. 8 → CON-19) |
| CON-17 Alcance completo del panel en el MVP | Restricción | — | D-8 | 3 | 0003 (implícito) | PENDIENTE |
| CON-18 Contenedores Docker portables → DO App Platform; Next.js TS + worker Node | Restricción | — | D-23 revisada, PRD v4.12 §8.3 | 8 | 0008, 0010 | ABORDADO (⚠️) |
| CON-19 PostgreSQL administrado | Restricción | — | Decisión del sponsor 2026-09-25 | 8 | 0008, 0009, 0010 | ABORDADO (⚠️) |
| CON-20 Correo solo por Mailgun | Restricción | — | Decisión del sponsor 2026-09-25 (sustituye a CON-5) | 8 | 0009 | ABORDADO (✅) |
| CON-21 Llamadas externas solo desde servidor con timeout | Restricción | — | Derivada de CON-7 | 8 | 0009 | ABORDADO (✅) |
| CON-22 Cloudflare delante; origen no alcanzable sin él | Restricción | — | Derivada de CON-15 | 8 | 0010 | ABORDADO (⚠️) |

### Concerns (CRN)

| Driver | Tipo | Prioridad | Trazabilidad (EP/HU) | Iteración | ADR | Estado |
|--------|------|-----------|----------------------|-----------|-----|--------|
| CRN-1 HubSpot no expone la «apertura» del negocio | Concern | — | EP-007 · RF-9.7.3, 9.7.4 | 5, 8 | 0009 | ABORDADO (⚠️) |
| CRN-2 Canal diario de notificaciones sin identificar | Concern · negocio | — | EP-007 · RF-9.7.1 | 5, 8 | 0009 | ABORDADO (✅) |
| CRN-3 Calendario hábil sin definir | Concern · negocio | — | EP-007 · RF-9.7, 17 | 5, 8 | 0009 | ABORDADO (✅) |
| CRN-4 Reintento infinito vs. bandeja de fallos | Concern | — | EP-007 · HU-105 · RF-9.6.1 | 5, 8 | 0009 | ABORDADO (✅) |
| CRN-5 Medición del correo con SMTP propio | Concern | — | EP-011 · RF-18 | 5, 6, 8 | 0009, 0006 | ABORDADO (✅) |
| CRN-6 Salida HTTPS a Gemini y cuota sin verificar | Concern | — | EP-009 · RF-12.2.1 | 4 | 0004 | ABORDADO (⚠️) |
| CRN-7 Permisos de HubSpot y correspondencia de cuentas | Concern | — | EP-005, EP-007 | 5, 8 | 0009 | ABORDADO (⚠️) |
| CRN-8 Caída del crontab entero | Concern | — | EP-007 · RF-9.6.2 | 5, 8 | 0009 | ABORDADO (✅) |
| CRN-9 Pérdida del servidor | Concern | — | §8.3, §10.3 | 3, 8 | 0003, 0010 | ABORDADO (⚠️) |
| CRN-10 Retención de datos personales | Concern | — | EP-008, EP-006 · Ley 1581 | 3, 6 | 0003, 0006 | ABORDADO (⚠️) |
| CRN-11 Motor del borrador de evidencia (HU-140) | Concern · negocio | — | EP-006 · HU-140 · RF-8.11 · D-24 | 3 | 0003 | ABORDADO (✅) |
| CRN-12 Dónde vive «Mi equipo» | Concern · negocio | — | EP-002, EP-001 · HU-095 · RF-4.1 · D-16 | 4 | 0003, 0004 | ABORDADO (✅) |
| CRN-13 Restos anteriores a D-4/D-16 en discovery | Concern · discovery | — | EP-009 · HU-090 · RF-13.4.1, §13.7, §10.3 | — | — | PENDIENTE (discovery) |
| CRN-14 Nivel 0 de validación contradictorio | Concern · discovery | — | EP-006 · RF-8.10, B.8.1 | 3 | 0003 | PENDIENTE (discovery) |
| CRN-15 Concurrencia entre administradoras | Concern | — | EP-006 | 3 | 0003 | ABORDADO (✅) |
| CRN-16 Números sin fijar (sesión, enlace, código…) | Concern | — | EP-001, EP-006, EP-009 | 2, 4 | 0002, 0004 | ABORDADO (⚠️) |
| CRN-17 Sin SLO de disponibilidad | Concern | — | §8.3 | 7, 8 | 0010 | ABORDADO (⚠️) |
| CRN-18 ModSecurity puede bloquear POST legítimos | Concern | — | EP-005, EP-006, EP-009 · §8.3 | 7, 8 | 0010 | NO APLICA (it. 8: sin ModSecurity) |
| CRN-19 Entrada por instrucción retirable (D-17) | Concern | — | EP-009, EP-010 · D-17 | 1, 4, 8 | 0008, 0004 | ABORDADO (✅) |
| CRN-20 Agendamiento en el portal (HU-099) | Concern · negocio | — | EP-005 · HU-099 · RF-9.1.3 | — | — | PENDIENTE (fuera de capa, v1.1) |

**Resumen (iteración 8):** 83 drivers · **7 REEMPLAZADAS** (CON-1, 2, 3, 5, 7, 15, 16 → CON-18..22) ·
**1 NO APLICA** (CRN-18) · **71 ABORDADO** · **4 PENDIENTE** (CON-17; CRN-13, 14 de discovery; CRN-20
fuera de capa) · 0 VERIFICADO. Los drivers antes cubiertos por 0001/0005/0007 apuntan ahora a
0008/0009/0010.

## Riesgos arquitectónicos abiertos

> Salida del análisis ATAM-lite (Paso 6/7): puntos de sensibilidad, trade-offs y riesgos sin mitigar.
> Cada riesgo traza a su driver y a la mitigación planificada. Marcar ✅ CERRADO al resolver (no borrar:
> deja el rastro).

| # | Riesgo | Driver | Mitigación planificada | Iteración |
|---|--------|--------|------------------------|-----------|
| R-1 | ✅ MITIGADO (it. 8: rol sin UPDATE/DELETE + trigger en PostgreSQL; se cierra al pasar V-10 de ADR-0010) — El hosting no permite triggers de solo-inserción en la auditoría | QA-11, CON-1 | Verificar en staging; si no, HMAC con clave aparte + ancla diaria obligatoria por correo (ADR-0003) | 3 |
| R-2 | REDUCIDO (it. 8: App Platform tiene salida HTTPS; queda cuota y llave de producción) — Sin salida HTTPS a `generativelanguage.googleapis.com`; la vuelta al determinista la oculta | CRN-6, UC-18 | Script de verificación en el hosting como condición de entrada de EP-009; alerta si la vuelta al determinista supera 20 % en 24 h | 4 |
| R-3 | ✅ CERRADO (it. 8: rebotes y quejas por webhook firmado de Mailgun) — Extensión IMAP ausente: no se leen rebotes | CRN-5, QA-8 | Verificar en staging; alternativa Return-Path; estados «sin dato» explícitos | 5 |
| R-4 | ✅ CERRADO (it. 8: no hay inodos; imágenes Docker) — Inodos: 3 releases por entorno + `vendor/` + staging superan el cupo | CON-3 | Medir inodos tras el primer despliegue (V-1 de ADR-0007); bajar a 2 releases si hace falta | 7 |
| R-5 | REFORMULADO (it. 8: ya no hay IP compartida; queda la colocación en bandeja con Mailgun, V-4 de ADR-0010) — SPF/DKIM/DMARC o lista negra de la IP compartida mandan códigos a spam | QA-8, CON-5 | Prueba con buzones reales en staging; SMTP de staging solo a destinatarios internos | 5, 7 |
| R-6 | ✅ CERRADO (it. 8: sin ModSecurity; el conjunto gestionado de Cloudflare se prueba en el humo) — ModSecurity bloquea POST legítimos (solicitud, texto pegado, importación, artefacto de 60 MB) o URL de 2 000 caracteres | CRN-18, QA-16, UC-14 | Humo con cargas reales en staging tras Cloudflare; excepciones por id de regla | 7 |
| R-7 | Restauración nunca ensayada; RTO de 4 h sin validar | QA-12, CRN-17 | Restauración de prueba cronometrada antes de producción (V-5 de ADR-0007) | 7 |
| R-8 | (It. 8: pérdida de la BD → PITR, minutos; pérdida de cuenta o región → exportación semanal, hasta 7 días: T-16.) Perder el servidor = hasta 7 días de datos, consentimientos incluidos (el banco vuelve a borrador) | QA-12, CRN-9 | Decidido (2026-09-25): exportación semanal cifrada a Google Drive de Trycore, manual en v1; RPO 24 h / RTO 4 h. Riesgo residual aceptado: la ventana ante pérdida total sigue en 7 días y depende de que la copia manual se haga | 3, 7 |
| R-9 | ✅ CERRADO (it. 8: ambas ramas encolan; el worker genera y envía el código) — Sin `fastcgi_finish_request`/`litespeed_finish_request` la respuesta neutra depende de la cola | QA-3, CON-1 | Verificar en staging antes de EP-001; si faltan, ambas ramas encolan el envío | 2 |
| R-10 | Bloqueo de 24 h usable para negar el acceso a un invitado concreto | QA-3 | Alerta a Talento Humano y desbloqueo auditado desde el panel | 2 |
| R-11 | ✅ SUSTITUIDO por R-45 (it. 8: cabecera secreta de borde en lugar de rangos IP) — Lista de rangos IP de Cloudflare desactualizada, o el hosting reescribe `REMOTE_ADDR` | CON-15, QA-3 | Tarea semanal que compara la lista publicada; prueba V-8 en staging | 2, 7 |
| R-12 | La zona `trycore.com` es compartida: su única regla gratuita de rate limiting o Rocket Loader pueden estar ocupados o romper la CSP | CON-15, QA-5 | Revisar la zona (V-9); Configuration Rule por host; test Playwright de CSP en staging | 7 |
| R-13 | Umbrales de límite de tasa (20/10 s en borde, 30/min en eventos) frenan oficinas tras NAT | QA-3, QA-21 | Limitador de la aplicación como capa fina; ajustar con datos reales | 2, 6, 7 |
| R-14 | Subdominio de `trycore.com` comprometido es same-site (CSRF) | QA-3, QA-4 | Token en cabecera + Origin exacto + cookies `__Host-` + tests (ADR-0001) | 1 |
| R-15 | P95 < 1 s medido con CPU ×4, no en un teléfono real | QA-1 | Gate Playwright con 300 perfiles sintéticos + comprobación puntual en gama media antes de la release | 4 |
| R-16 | JS por encima de 200 KB y latencia del catálogo en el hosting sin medir | QA-2 | Lighthouse CI bloqueante; medir en staging | 1, 7 |
| R-17 | M-3..M-7 y A-2, A-3, A-5..A-7 solo verificables a mano, sin responsable ni iPhone asignados | QA-18, QA-19, CON-12 | axe en CI + lista manual obligatoria en el PR de cada épica con UI | 1 |
| R-18 | ✅ CERRADO (it. 8: la aplicación de la importación corre en el worker, sin corte de 100 s) — 200 filas de importación sin medir frente al corte de 100 s de Cloudflare | QA-9, CON-2 | Presupuesto de 90 s con ROLLBACK, GET_LOCK, endpoint de estado del lote; medir en staging y bajar el límite si no cabe | 3 |
| R-19 | Interbloqueos entre importación, panel y cron de colocados | CRN-15, QA-9 | Orden fijo de bloqueos, 3 reintentos, 503 sin escritura parcial | 3 |
| R-20 | ✅ CERRADO (it. 8: el servidor usa el mismo `packages/motor`) — Filtro mínimo de ciudad en PHP devuelve más ciudades de las que se muestran | UC-4, QA-5 | Test de contrato del payload; precisión exacta como trade-off de negocio | 3 |
| R-21 | `ps_solicitud_id` no creada como propiedad de valor único en HubSpot | QA-7, CRN-7 | El adaptador la comprueba al arrancar; si falta no crea negocios y alerta; la crean Mercadeo y Comercial | 5 |
| R-22 | ✅ CERRADO (it. 8: tope de backoff 55 min sin tick de cron → peor caso ≈ 55 min) — Peor caso de entrega tras recuperación de HubSpot ~65 min frente a la meta de 60 | QA-6 | Bajar el tope de backoff a 55 min o sonda de recuperación; decidir en la revisión | 5 |
| R-23 | Escalamiento falso si el comercial abre el negocio directamente en HubSpot | CRN-1, QA-14 | Enlace «ya lo estoy atendiendo» en el aviso; actividad de usuario como señal extra, a verificar | 5 |
| R-24 | Proveedor del monitor externo tipo «dead man's switch» sin elegir | QA-13, CRN-8 | Elegirlo antes de producción; alerta a 10 min sin latido; prueba de apagado del crontab en staging | 5, 7 |
| R-25 | ✅ CERRADO (it. 8: no hay límite de 180 s; timeouts por trabajo y arrendamiento) — PHP CLI ignora `max_execution_time`: el tope del despachador depende del propio bucle | CON-2, QA-13 | Presupuesto de tiempo en el bucle + `pcntl_alarm` si el hosting lo admite; arrendamiento `locked_until` | 5 |
| R-26 | ✅ CERRADO (it. 8: el código sale por `NOTIFY` en < 1 s con reintentos a 5/15/30 s) — Código de acceso retrasado hasta ~5 min si el SMTP falla en línea | QA-8 | Reintento por cola con prioridad alta y aviso en pantalla | 5 |
| R-27 | ✅ CERRADO (it. 8: `notificar` despachado en segundos; se mide en staging) — Latencia de notificación P95 puede superar 5 min | QA-22 | Notificar en la misma corrida; medir en el hosting | 5 |
| R-28 | Nombres propios en el texto pegado a Gemini o en la consulta literal de telemetría | CON-8, CON-10, QA-5 | Saneamiento + aviso previo al cliente con opción «Interpretar sin servicio externo»; decisión legal | 4, 6 |
| R-29 | Token de estado resoluble por cualquier sesión de la misma cuenta | QA-16, QA-3 | 404 neutro fuera de la cuenta, límite de creación de tokens, limpieza diaria | 4 |
| R-30 | Pérdida de eventos en el navegador no medible | QA-21 | Comparar sesiones de servidor con eventos de entrada | 6 |
| R-31 | Definiciones de los informes aún no escritas | UC-17 | El slice de EP-008 las escribe en G/W/T con test de contrato por vista | 6 |
| R-32 | ✅ CERRADO (it. 8: no hay caché de rutas de PHP) — `realpath_cache_ttl` sirve la release vieja hasta 120 s tras el cambio de symlink | CON-3 | Migraciones expand/contract; exponer `release` en `/api/v1/salud` | 7 |
| R-33 | ✅ CERRADO (it. 8: staging en Apps propias; la BD depende de T-14) — Staging comparte CPU, inodos e IP de correo con producción | CON-3, QA-8 | Sin pruebas de carga en staging; decisión de negocio sobre un segundo hosting | 7 |
| R-34 | CON-17 sin fila de §5 que verifique el alcance completo del panel | CON-17 | Cubrir en el DoR de EP-006 contra UC-10..UC-14 | 3 |
| R-35 | ✅ CERRADO (2026-09-25) — Canal diario sin elegir | CRN-2, UC-15 | Solo correo + notificación nativa de HubSpot al asignar propietario | 5 |
| R-36 | Calendario hábil ✅ CERRADO (2026-09-25: L–V 8–18 `America/Bogota`, festivos de Colombia, 24 h hábiles); siguen sin definir los destinatarios nominales | CRN-3, UC-15 | Fijar destinatarios antes de EP-007 | 5 |
| R-37 | ✅ CERRADO (2026-09-25) — HU-140 sin motor autorizado | CRN-11 | Plantilla determinista sin IA, confirmada por una persona | 3 |
| R-38 | ✅ CERRADO (2026-09-25) — Modelo de datos de «Mi equipo» abierto | CRN-12 | Por invitado en servidor (`equipos`, `equipo_perfiles`) | 4 |
| R-39 | La guarda de modalidad para publicar depende de CRN-14 | CRN-14, UC-10 | Devolver a discovery | 3 |
| R-41 | TTFB del HTML dinámico (nonce, sin caché de borde) y catálogo ≤ 500 ms sin medir en DO | QA-2 | V-6 de ADR-0008 en staging tras Cloudflare; instancias ≥ 1 GB | 8 |
| R-42 | Portabilidad de contenedores declarada pero no ensayada fuera de DO | CON-18 | Staging corre las mismas imágenes en un servidor de la empresa (T-14): la portabilidad se ejercita en cada despliegue | 8 |
| R-43 | Clave de firma del webhook de Mailgun filtrada o sin rotar | CRN-5, QA-5 | Dos claves durante la rotación; firma verificada en tiempo constante antes de escribir | 8 |
| R-44 | Región de datos (DO `nyc`, Mailgun EE. UU.) y transferencia internacional bajo Ley 1581 | QA-5, CON-10 | Decisión de negocio/legal T-15 | 8 |
| R-45 | Cabecera secreta de borde filtrada o *Transform Rule* borrada (origen alcanzable o 403 en los 4 hosts) | CON-22, QA-3 | Doble comprobación (middleware + Route Handler), rotación con valor previo, monitor externo detecta el 403 | 8 |
| R-46 | Retención corta de logs de App Platform | QA-13 | Aceptado en v1; valorar reenvío a un servicio gratuito | 8 |
| R-47 | Datos de perfiles colados en el payload RSC de un Server Component | UC-4, QA-5 | Solo `ProyeccionCatalogo` con esquema estricto; `server-only`; rastreo del HTML con sesión (V-4 de ADR-0008) | 8 |
| R-48 | Middleware en Edge o Next vulnerable a CVE-2025-29927 | QA-3, CON-22 | `next ≥ 15.5`, middleware `runtime: nodejs`, Cloudflare elimina `x-middleware-subrequest`, recomprobación en Route Handler | 8 |
| R-49 | Agotar las conexiones de la BD al escalar réplicas; `LISTEN` y candados de sesión a través de PgBouncer | CON-19, QA-6 | `max` fijo por proceso, PgBouncer en modo transacción solo para web, conexión directa para el worker, plan dimensionado | 8 |
| R-50 | La CSP rompe estilos en línea (atributos `style` de React SSR y Radix) | QA-5 | `style-src-attr 'unsafe-inline'`; test de CSP con Radix abierto | 8 |
| R-51 | ✅ MITIGADO (it. 8) — Rol de BD compartido entre portal y panel | CON-9 | Roles por componente (`ps_portal` sin escritura de inventario); V-10 | 8 |
| R-52 | El acceso de clientes y del panel depende del worker | QA-8, UC-1, UC-9 | Modo degradado con relleno de tiempo; probarlo en staging apagando el worker | 8 |
| R-53 | Supresiones de Mailgun dejan sin acceso a un invitado | QA-8, UC-1 | Supresiones visibles en el panel y retirables (auditado) | 8 |
| R-54 | Certificado del origen de App Platform con el proxy de Cloudflare sin renovación probada | CON-22 | V-1; alerta de caducidad; plan B *Full* temporal | 8 |
| R-55 | Despliegue no atómico entre las dos Apps | QA-12 | Compatibilidad N/N-1; `deploy.yml` revierte el panel si falla el portal | 8 |
| R-56 | Staging no reproduce App Platform (job `PRE_DEPLOY`, certificado con proxy, `SIGTERM`, dominio por defecto) | CON-18, CON-22, QA-12 | Verificaciones V-1, 2, 3, 7, 8, 11, 12 en producción en oscuro antes del primer envío real | 8 |
| R-57 | Runner autoalojado de GitHub Actions en el servidor de la empresa | QA-5 | Solo el job `deploy-staging` en `main`, nunca PRs; usuario sin privilegios; el servidor no guarda secretos de producción | 8 |
| R-40 | Restos anteriores a D-4/D-16 y «carpeta privada» en UC-4/CON-9 del `0000` | CRN-13, CON-9 | Corrección en discovery y en el `0000` con aprobación | — |

## Trade-offs de negocio para la revisión única

> Revisión única cerrada por el sponsor (Jesús Segura) el 2026-09-25.

| # | Decisión | Opciones | Recomendación de arquitectura | ADR | Estado |
|---|----------|----------|-------------------------------|-----|--------|
| T-1 | **CRN-12 «Mi equipo»**: ¿por dispositivo o por invitado en servidor? | (a) Dispositivo/URL (D-16); (b) servidor por invitado (RF-4.1, HU-095) | (a) por defecto, reversible; (b) si negocio necesita continuidad entre dispositivos | 0003, 0004 | **RESUELTA 2026-09-25:** (b) por invitado en servidor (`equipos`/`equipo_perfiles` ligadas al correo verificado y al enlace; cada invitado ve solo el suyo; se recupera en otro dispositivo; viaja completo a la solicitud). Perfil Objetivo sigue por dispositivo (D-16) |
| T-2 | **CRN-11 motor del borrador de evidencia (HU-140)** | Ampliar D-24 con saneamiento · extracción determinista · diferir con acuerdo del equipo | Extracción determinista; nunca diferir sin acuerdo | 0003 | **RESUELTA 2026-09-25:** plantilla determinista sin IA (precarga desde la modalidad de prueba, fecha y resultado por patrones, nada sale del servidor, confirma una persona) |
| T-3 | **CRN-2 canal diario de notificaciones** | Correo · Slack/Chat · WhatsApp | Correo mientras no se decida | 0005 | **RESUELTA 2026-09-25:** solo correo + notificación nativa de HubSpot al asignar propietario, sin integración nueva. RF-9.7.1 pide «no solo por correo»: el aviso de HubSpot cuenta como segundo canal |
| T-4 | **CRN-3 horario hábil** y si las 24 h de RF-9.7 son hábiles o naturales | Horario, zona, festivos de Colombia, dueño del calendario | Tabla administrable; 24 h hábiles | 0005 | **RESUELTA 2026-09-25:** L–V 8:00–18:00 `America/Bogota`, festivos de Colombia en tabla administrable; 24 h en horas hábiles |
| T-5 | **Sesión del cliente 30 días y vigencia por defecto del enlace** | 30 d / 60 d renovable / otros | 30 d de sesión; 60 d renovable de enlace | 0002 | **RESUELTA 2026-09-25:** sesión 30 días acotada a la vigencia del enlace; vigencia por defecto del enlace 30 días |
| T-6 | **Retención**: telemetría 24 meses (seudónimo a los 12), accesos 180 días, auditoría con datos personales frente al derecho de supresión | Plazos propuestos vs. validación legal | Validar con el área legal antes de producción | 0003, 0006 | **RESUELTA 2026-09-25 (parcial):** telemetría 24 meses. Accesos 180 días y auditoría frente a supresión siguen como propuesta |
| T-7 | **Destino de la exportación semanal y objetivos RPO/RTO/SLO** | Semanal fuera del servidor · diaria cifrada a Drive · segundo hosting | Diaria cifrada; RTO 4 h tras ensayo | 0003, 0007 | **RESUELTA 2026-09-25:** exportación semanal cifrada a Google Drive de Trycore; en v1 procedimiento manual del responsable técnico (descarga y carga a Drive), sin integración nueva; RPO 24 h / RTO 4 h |
| T-8 | **Aviso al cliente por texto pegado a Gemini** (transferencia internacional) | Aviso informativo · autorización explícita · sin Gemini en la cara cliente | Aviso previo con opción «Interpretar sin servicio externo»; decide Mercadeo con asesoría legal | 0004 | **RESUELTA 2026-09-25:** aviso previo antes de enviar texto largo a Gemini, con opción «Interpretar sin servicio externo» |
| T-9 | **Precisión de la ciudad** que devuelve el servidor | Filtro mínimo en PHP · filtro completo en servidor | Filtro mínimo (modalidad ≠ Remoto + obligatorios de rol/país) | 0003 | **RESUELTA 2026-09-25:** ciudad solo cuando la necesidad es presencial o híbrida, con el filtro mínimo en servidor |
| T-10 | **Regla «3 envíos sin abrir»** medida por clic/entrada en lugar del píxel | Clic/entrada (más estricta) · píxel (falsos «abiertos») | Clic/entrada | 0005, 0006 | **RESUELTA 2026-09-25:** por clic o entrada, no por apertura |
| T-11 | **Staging en el mismo servidor** | Mismo servidor · segundo hosting de pago | Mismo servidor, sin pruebas de carga | 0007 | **RESUELTA 2026-09-25:** staging en el mismo hosting |
| T-12 | **CRN-13 / CRN-14 correcciones de discovery** (restos pre D-4/D-16; nivel 0 de validación) | Corregir en discovery con aprobación | Corregir antes del DoR de EP-006 y EP-009 | 0003 | **PENDIENTE (discovery, no arquitectura)** |
| T-13 | **Reflejar en el PRD las divergencias** decididas en esta revisión: «Mi equipo» por invitado en servidor (RF-4.1, HU-095, D-16), HU-140 determinista sin IA y canal de notificación solo correo + HubSpot (RF-9.7.1) | Actualizar PRD e HU con aprobación | Hacerlo antes del DoR de EP-001, EP-002, EP-006 y EP-007 | 0003, 0004, 0005 | **PENDIENTE (discovery, no arquitectura)** |

### Trade-offs de negocio de la iteración 8

| # | Decisión | Opciones | Recomendación de arquitectura | ADR | Estado |
|---|----------|----------|-------------------------------|-----|--------|
| T-14 | **Dónde vive la BD de staging** | (a) Clúster propio pequeño (coste mensual extra); (b) base separada en el clúster de producción (sin coste extra, pero el PITR es por clúster: un ensayo de restauración de staging arrastra datos reales de producción, Ley 1581, y staging tiene camino de red a producción) | (a) | 0010 | **RESUELTA 2026-09-25:** staging completo en un servidor de la empresa con Docker (mismas imágenes, PostgreSQL en contenedor, Cloudflare Tunnel); lo propio de App Platform se verifica en producción en oscuro |
| T-15 | **Región de datos** | (a) DO `nyc` + Mailgun EE. UU. (latencia ~70 ms desde Bogotá; transferencia internacional a EE. UU.); (b) DO `ams`/`fra` + Mailgun UE (más latencia) | (a), con validación legal de la transferencia | 0008, 0009, 0010 | **RESUELTA 2026-09-25:** indiferente para el sponsor → DO `nyc` + Mailgun EE. UU.; validación legal de la transferencia sigue en R-44 |
| T-16 | **Ventana de pérdida ante caída de la cuenta o la región de DO y copia de evidencias** | (a) Aceptar hasta 7 días (exportación semanal) y evidencias sin copia fuera de DO; (b) exportación diaria cifrada fuera de DO (más carga manual o integración nueva) | (a), como ya se aceptó para la pérdida del servidor | 0010 | **RESUELTA 2026-09-25:** indiferente para el sponsor → hasta 7 días y evidencias sin copia fuera de DO |
| T-17 | **Reescribir D-23 y §8.3 del PRD** (plataforma), `requisitos-tecnicos-hosting.md`, el bloque de dominio de `CLAUDE.md` (secretos y fronteras: SMTP → Mailgun) y `build-config.json#boundaries` | Actualizar con aprobación | Hacerlo antes del DoR de la épica caparazón | 0008–0010 | **RESUELTA 2026-09-25:** PRD v4.12 (D-23 revisada, §8.3 reescrita, RF-1.2.6, 2.6.4, 8.1, 8.11.1, 8.13.1, 9.6.1, 9.7.3 y §10.3), épicas, backlog y HU-123 alineados; `requisitos-tecnicos-hosting.md` marcado como antecedente; `CLAUDE.md`, `build-config.json` y `stack-allowlist.json#source` actualizados |

## Bitácora de iteraciones

> Una fila por ronda ADD. `Objetivo` = Paso 2; `Resultado` = Paso 7 (qué ADR se creó/refactorizó y qué
> quedó sin resolver). La fila de **Cierre** registra la promoción `proposed → accepted` tras la revisión
> humana.

| Iteración | Fecha | Objetivo (Paso 2) | Resultado (Paso 7) |
|-----------|-------|-------------------|--------------------|
| 1 | 2026-09-25 | Estilo, stack y módulos (CON-1, 2, 3, 9, 12, 13, 14 · QA-2, 18, 19 · CRN-19) | ADR-0001: dos apps estáticas + API PHP, hosts de un nivel; QA-18/19 y CON-3 quedan ⚠️ |
| 2 | 2026-09-25 | Identidad, sesiones y enlaces (UC-1, 2, 3, 9 · QA-3, 4, 5 · CON-4, 6, 10, 15 · CRN-16) | ADR-0002: respuesta neutra, bloqueo acumulado, token en fragmento; valores de sesión a validar |
| 3 | 2026-09-25 | Datos, persistencia, auditoría e importación (UC-4, 10–14 · QA-5, 9–12, 17, 20 · CON-9, 11, 16 · CRN-9, 14, 15) | ADR-0003: auditoría HMAC + ancla diaria, versión global, importación con presupuesto; CRN-14 ❌ a discovery |
| 4 | 2026-09-25 | Búsqueda, estado y Gemini (UC-5, 6, 8, 18 · QA-1, 15, 16 · CON-8, 13, 14 · CRN-6, 12, 19) | ADR-0004: motor determinista, token de estado de 128 bits; CRN-12 abierto |
| 5 | 2026-09-25 | Integraciones y trabajo diferido (UC-7, 15, 16, 19 · QA-6, 7, 8, 13, 14, 22 · CON-5, 7 · CRN-1–5, 7, 8) | ADR-0005: cola con arrendamiento, idempotencia por subpaso, dead man's switch; CRN-2 ❌ y CRN-3 de negocio |
| 6 | 2026-09-25 | Telemetría y atribución (UC-17 · QA-21 · CRN-10) | ADR-0006: endpoint anónimo acotado, `contacto_id`, atribución al último envío; informes en EP-008 |
| 7 | 2026-09-25 | Entornos, despliegue y perímetro (CON-3, 15 · QA-12, 13 · CRN-17, 18) | ADR-0007: release por sha + symlink, CSP con hashes en CI, origen solo IPs de Cloudflare; verificaciones de hosting pendientes |
| Evaluación ATAM-lite | 2026-09-25 | Refutar adversarialmente 0001–0007 | Hallazgos incorporados: hosts de un nivel; CSRF con cabecera + Origin; catálogo como proyección desde la BD; respuesta neutra con `finish_request` y mensaje único; bloqueo 5/15 min y 20/día; `accesos_log` separado; ciudad decidida en servidor; importación con GET_LOCK y 90 s; HMAC + ancla diaria; ETag tras sesión con `no-store`; Playwright ×4 con 300 perfiles; aviso por Gemini; `ps_solicitud_id` único; arrendamiento `locked_until`; dead man's switch; endpoint anónimo de eventos; despliegue atómico; una regla de Cloudflare. 40 riesgos abiertos y 12 trade-offs de negocio a la revisión única |
| Cierre | 2026-09-25 | Revisión única del sponsor | ADRs 0001–0007 accepted; decisiones de negocio registradas; stack consolidado en .claude/config/stack-allowlist.json |
| 8 | 2026-09-25 | Replanteo de plataforma: Docker → DO App Platform, Next.js TS + worker, PostgreSQL administrado, Mailgun (CON-18..22) | ADR-0008 (stack y estructura), ADR-0009 (worker y correo), ADR-0010 (entornos, despliegue, perímetro) proponen sustituir a 0001, 0005 y 0007; enmiendas de plataforma en 0002, 0003, 0004 y 0006; 0000 con CON-18..22 y 7 restricciones reemplazadas |
| Evaluación ATAM-lite it. 8 | 2026-09-25 | Refutar adversarialmente 0008–0010 | Hallazgos incorporados: datos solo por la proyección con esquema estricto (payload RSC); middleware Node con `next ≥ 15.5` (CVE-2025-29927); roles de BD por componente; presupuesto de conexiones; lista positiva de rutas del portal; planificador con reclamo por fila (no candado de sesión); código generado por el worker y reintentos de 5/15/30 s; apagado con devolución de filas; cierre condicionado al reclamo; modo degradado del acceso; supresiones visibles; webhook endurecido; CSP con `style-src-attr` y Spaces en `connect-src`; `pg_dump` + `age` en el worker; cabecera de borde doble; N/N-1 entre Apps; protección contra borrado. 15 riesgos cerrados o sustituidos, 15 nuevos, 3 trade-offs de negocio (T-14..16) |
| Cierre it. 8 | 2026-09-25 | Revisión única del sponsor | ADR-0008, 0009 y 0010 accepted; 0001, 0005 y 0007 superseded; T-14 (staging en servidor de la empresa con Docker), T-15 (EE. UU.) y T-16 (7 días) resueltas; stack consolidado en `.claude/config/stack-allowlist.json` (sale PHP) |

## Replanteo de plataforma (2026-09-25) — atendido en la iteración 8

El sponsor cambió la plataforma después de aceptar 0001–0007 (Docker portable → DigitalOcean App
Platform; Next.js TypeScript + worker Node; PostgreSQL administrado; Mailgun; se abandona cPanel). La
iteración 8 lo recoge en ADR-0008, 0009 y 0010 y en las enmiendas de 0002, 0003, 0004 y 0006. Discovery quedó alineado en el PRD v4.12 (T-17).
