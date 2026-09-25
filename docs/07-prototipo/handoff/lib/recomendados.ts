import type { Perfil } from "@/lib/types";

/**
 * Recomendados — perfiles que no entran en la búsqueda pero la complementan.
 *
 * Aparecen bajo los resultados SOLO después de una búsqueda con resultados.
 * Regla: para cada rol presente en los resultados se toman los roles que
 * suelen acompañarlo (ACOMPANA), se excluyen los que ya están en resultados
 * y se elige un perfil por rol (máx. 3), priorizando el sector buscado.
 * Cada tarjeta dice POR QUÉ suma, en una línea — nunca un porcentaje.
 *
 * Reemplaza al antiguo «Así entendimos la instrucción», que se eliminó:
 * los criterios se ven y se editan en el Perfil objetivo.
 */

export const ACOMPANA: Record<string, string[]> = {
  Backend: ["Arquitectura de soluciones", "DevOps / SRE", "QA de automatización", "Ciberseguridad", "Frontend"],
  Frontend: ["Backend", "QA de automatización", "Móvil"],
  Móvil: ["Backend", "QA de automatización", "Frontend"],
  "Ingeniería de datos": ["Backend", "Arquitectura de soluciones", "DevOps / SRE"],
  "Arquitectura de soluciones": ["Backend", "DevOps / SRE", "Ciberseguridad"],
  "DevOps / SRE": ["Backend", "Ciberseguridad", "Arquitectura de soluciones"],
  "QA de automatización": ["Backend", "Frontend"],
  Ciberseguridad: ["Backend", "DevOps / SRE"],
  "Full stack": ["QA de automatización", "DevOps / SRE"],
  "Analista funcional BPM": ["Backend", "QA de automatización"],
};

export const RAZON: Record<string, string> = {
  "Arquitectura de soluciones": "Da dirección técnica al equipo",
  "DevOps / SRE": "Opera lo que el equipo pone en producción",
  "QA de automatización": "Blinda cada entrega con pruebas",
  Ciberseguridad: "Revisa APIs y datos sensibles",
  Frontend: "Construye la interfaz del servicio",
  Backend: "Construye los servicios que se consumen",
  "Ingeniería de datos": "Convierte los datos en reportes y modelos",
  Móvil: "Lleva el servicio al canal móvil",
  "Full stack": "Cubre interfaz y servicios a la vez",
  "Analista funcional BPM": "Traduce el proceso de negocio en flujos",
};

export interface Recomendado {
  perfil: Perfil;
  razon: string;
}

export function recomendar(resultados: Perfil[], publicados: Perfil[], sectores: string[] = [], max = 3): Recomendado[] {
  const ids = new Set(resultados.map((p) => p.id));
  const rolesRes = [...new Set(resultados.map((p) => p.rol))];
  const orden: string[] = [];
  for (const r of rolesRes) for (const x of ACOMPANA[r] ?? []) if (!orden.includes(x) && !rolesRes.includes(x)) orden.push(x);

  const afin = (p: Perfil) => (sectores.some((s) => p.sector.includes(s)) ? 1 : 0);
  const candidatos = publicados
    .filter((p) => !ids.has(p.id) && orden.includes(p.rol))
    .sort((a, b) => orden.indexOf(a.rol) - orden.indexOf(b.rol) || afin(b) - afin(a));

  const elegidos: Perfil[] = [];
  for (const p of candidatos) {
    if (elegidos.length >= max) break;
    if (!elegidos.some((e) => e.rol === p.rol)) elegidos.push(p);
  }
  return elegidos.map((perfil) => ({ perfil, razon: RAZON[perfil.rol] ?? "Complementa tu búsqueda" }));
}
