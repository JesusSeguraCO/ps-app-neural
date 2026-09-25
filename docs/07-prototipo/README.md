# Prototipo de referencia (DESIGN_SOURCE)

Espejo local del proyecto de Claude Design «Portal de Perfiles».

- **Fuente:** https://claude.ai/design/p/c2c8fee5-350b-4d4d-9fa5-ecaac4069c4f?file=Portal+de+Perfiles+v2.dc.html
- **Importado:** 2026-09-25, con la autorización de diseño de la cuenta de Jesús Segura.
- **Referencia visual vigente:** `Portal de Perfiles v2.dc.html` (la v1 ya no es guía, según `handoff/README.md`).

## Qué hay

| Ruta | Contenido |
|---|---|
| `Portal de Perfiles v2.dc.html` | Prototipo navegable v2. ⚠️ **Incompleto**: la importación corta en 256 KB y el archivo es mayor. Para abrirlo completo, usa la URL de arriba o exporta el proyecto desde Claude Design y reemplaza este archivo |
| `_ds/trycore-design-system-…/` | Design system Trycore: `styles.css` y los 12 tokens que importa |
| `_ds/tokens/` | Copia anterior de 4 tokens (base, colors, effects, fonts). La reemplaza la carpeta de arriba |
| `assets/` | Logos Trycore y Neural Grid, símbolo y 2 retratos ilustrativos (`imagery/`) |
| `data/perfiles.js` | Banco de demostración: 14 perfiles ficticios, 3 cuentas y conjuntos curados |
| `support.js`, `image-slot.js` | Runtime del formato `.dc.html` de Claude Design |
| `handoff/` | Paquete de handoff: 31 componentes React/TSX (Next.js 15 + Tailwind + shadcn/ui), `lib/` (tipos, CSV, estado en URL), temas y `tailwind.config.ts`. Lee primero `handoff/README.md` |

No se importaron: la v1 del prototipo, las direcciones A/B, el catálogo de componentes, `screenshots/` ni `uploads/`.

## Reglas

- Esto es **referencia de diseño**, no código de la aplicación. La arquitectura decide qué se adopta (`/build:architect`).
- Donde el prototipo y el PRD discrepen, **gana el PRD** (`docs/01-prd/portal-people-service.md`).
- Los datos de `data/perfiles.js` son ficticios y no deben llegar a producción.
