// Menú canónico del panel (prototipo admin-shell, patrón PP:panel): doce destinos en tres secciones.
// Decisión del sponsor (2026-09-28): los doce se ven siempre; los de épicas aún no construidas van
// deshabilitados (`ruta: null`) y cada épica, al entregarse, pone aquí la ruta de su destino.

export interface Destino {
  clave: string;
  etiqueta: string;
  ruta: string | null;
  icono: string; // `d` del path SVG de 24×24 del prototipo
}

export interface SeccionMenu {
  titulo: string;
  destinos: Destino[];
}

export const MENU_PANEL: SeccionMenu[] = [
  {
    titulo: "Banco de perfiles",
    destinos: [
      { clave: "inventario", etiqueta: "Inventario", ruta: "/inventario", icono: "M4 6h16M4 12h16M4 18h10" },
      {
        clave: "importar",
        etiqueta: "Importar",
        ruta: "/importar",
        icono: "M12 4v11M7 10l5 5 5-5M5 20h14",
      },
      {
        clave: "vigencia",
        etiqueta: "Vigencia",
        ruta: "/vigencia",
        icono: "M12 8v4l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
      },
      {
        clave: "catalogos",
        etiqueta: "Catálogos",
        ruta: "/catalogos",
        icono: "M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v5H4zM13 14h7v5h-7z",
      },
      {
        clave: "lexico",
        etiqueta: "Léxico",
        ruta: "/lexico",
        icono: "M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11M9 8h6",
      },
    ],
  },
  {
    titulo: "Clientes",
    destinos: [
      {
        clave: "enlaces",
        etiqueta: "Enlaces",
        ruta: "/enlaces",
        icono:
          "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
      },
      {
        clave: "peticiones",
        etiqueta: "Peticiones",
        ruta: "/peticiones",
        icono:
          "M13.5 8a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0zM3.5 20c.8-3.5 3.3-5.5 6.5-5.5s5.7 2 6.5 5.5M19 8v6M16 11h6",
      },
      { clave: "colocados", etiqueta: "Colocados", ruta: null, icono: "M5 12l5 5L20 7" },
      {
        clave: "demanda",
        etiqueta: "Demanda",
        ruta: null,
        icono: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5",
      },
    ],
  },
  {
    titulo: "Operación",
    destinos: [
      {
        clave: "medicion",
        etiqueta: "Medición",
        ruta: null,
        icono: "M4 19V9M10 19V5M16 19v-7M22 19H2",
      },
      { clave: "envios", etiqueta: "Envíos", ruta: null, icono: "M4 6h16v12H4zM4 7l8 6 8-6" },
      {
        clave: "fallos",
        etiqueta: "Fallos",
        ruta: null,
        icono:
          "M12 9v4M12 17h.01M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
      },
    ],
  },
];

export const ROL_ETIQUETA = {
  administrador: "Administración",
  observador: "Consulta",
} as const;

// «karen.rodriguez@trycore.com» → «KR».
export function iniciales(correo: string): string {
  const partes = correo
    .split("@")[0]!
    .split(/[._-]+/)
    .filter(Boolean);
  return (
    partes.length > 1 ? partes[0]![0]! + partes[1]![0]! : (partes[0] ?? "?").slice(0, 2)
  ).toUpperCase();
}
