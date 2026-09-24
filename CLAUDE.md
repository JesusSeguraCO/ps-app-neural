# CLAUDE.md

<!-- BEGIN trycore-vertical v0.4.0 -->
## Vertical documentaria Trycore

Este proyecto usa la vertical Trycore (`@trycore/spec-product-flow`) para producir y mantener artefactos de discovery / producto:

```
PRD → User Story Map → Backlog → Historias (AC G/W/T) → Priorización → Flows
```

### Estructura

```
docs/
├── 01-prd/                 PRD (12 componentes obligatorios)
├── 02-user-story-map/      Mapa estilo Jeff Patton (backbone + ranking + releases)
├── 03-backlog/             epicas.md + backlog.md (tabla ordenada)
├── 04-historias/           HU-XXX.md con frontmatter YAML obligatorio + AC en G/W/T
├── 05-priorizacion/        Aplicación de framework (MoSCoW/RICE/Valor-Esfuerzo/Eisenhower)
└── 06-flows/               Flujos de navegación en Mermaid, un archivo por épica
```

### Reglas duras (no negociables)

1. Toda Historia de Usuario vive en `docs/04-historias/HU-XXX.md` con frontmatter YAML obligatorio (`id, titulo, epica, prioridad, complejidad, estado`).
2. Todo Acceptance Criterion se escribe en **Given/When/Then**; nada de prosa libre. 3-5 escenarios incluyendo happy / error / edge.
3. Toda Historia pasa los 6 criterios **INVEST** antes de marcarse `estado: lista`.
4. La metodología canónica vive en el `METODOLOGIA.md` del paquete `@trycore/spec-product-flow` (ruta exacta depende de dónde npm haya instalado el paquete global; típicamente `$(npm root -g)/@trycore/spec-product-flow/METODOLOGIA.md`). Si una skill contradice la metodología, **gana la metodología**.
5. Ningún artefacto se marca como "final" sin pasar por su agente revisor (manual con `/trycore:revisar` o automático si `TRYCORE_AUTO_AUDIT=true`).

### Slash commands disponibles

| Operativos | Por artefacto |
|---|---|
| `/trycore:onboard` — parametriza el proyecto | `/trycore:prd` — escribe PRD |
| `/trycore:flujo` — pipeline completo | `/trycore:epicas` — descompone PRD |
| `/trycore:revisar` — auditoría global | `/trycore:mapa` — User Story Map |
|  | `/trycore:historia` — historia de usuario |
|  | `/trycore:ac` — criterios de aceptación BDD |
|  | `/trycore:invest` — valida INVEST |
|  | `/trycore:backlog` — backlog consolidado |
|  | `/trycore:priorizar` — priorización |
|  | `/trycore:flows` — flujos de navegación (Mermaid, por épica) |

### Contexto del proyecto

- **Nombre**: Portal de Perfiles People Service (nombre de trabajo — D-2 abierta)
- **Dominio**: Portal privado B2B de perfiles de talento curados: convierte un correo especializado por cuenta en una solicitud de equipo registrada como oportunidad en HubSpot
- **Stakeholders**: Jesús Segura (Dirección de Mercadeo — Sponsor/PO) · Carlos Andrés Segura (Dirección General — aprobador de negocio) · Karen (Talento Humano — dueña del inventario) · Eida Tinjacá M. (Coordinación de Servicio — Delivery) · Dirección Comercial (pipeline) · Jonathan (CTO — Tecnología)
- **Framework de priorización**: Valor / Esfuerzo (matriz 2×2)

(Si los valores aparecen como `{{...}}` aún, ejecuta `/trycore:onboard` para parametrizar.)

### Convenciones de naming

- Épicas: `EP-001`, `EP-002`, … (3 dígitos)
- Historias: `HU-001`, `HU-002`, … (3 dígitos)
- Slugs en kebab-case-sin-acentos

### Hooks de calidad (opt-in)

Dos flags opcionales en `.claude/settings.local.json`:

```json
{
  "env": {
    "TRYCORE_AUTO_AUDIT": "true",
    "TRYCORE_REFLECT_SESSION": "true"
  }
}
```

- `TRYCORE_AUTO_AUDIT=true` → tras cada Write/Edit en `docs/`, dispara el agente revisor correspondiente. Cuando esté off (default), usar `/trycore:revisar` manualmente.
- `TRYCORE_REFLECT_SESSION=true` → al cerrar sesión, escanea heurísticas (campos no canónicos en frontmatter, AC fuera de G/W/T, secciones inesperadas en PRD) y escribe propuestas en `docs/.trycore-suggestions.md` sin auto-editar nada. Útil para capturar convenciones emergentes del cliente.

<!-- END trycore-vertical -->

<!-- A partir de aquí, el equipo del proyecto puede agregar instrucciones específicas del cliente. -->
