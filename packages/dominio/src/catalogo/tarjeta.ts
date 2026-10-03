// Tarjeta del perfil (HU-153, HU-081; diseño §5). Puras y deterministas:
//  - `capacidadDeTarjeta`: «Rol · Seniority · N años de experiencia» como descriptor inmediato. El
//    anclaje de experiencia son los años (D73, B.2); el campo de texto `anclaje` no se muestra.
//  - `tecnologiasDeTarjeta`: las cinco primeras en el orden en que Talento Humano las cargó (D73, B.1);
//    la ficha conserva hasta 8.
//  - `selloValido`: el Sello Personal cumple su contrato con 1–3 competencias no vacías. Un sello fuera
//    de contrato no se dibuja a medias: la tarjeta se comporta como sin sello (HU-081 · error).

export const TECNOLOGIAS_EN_TARJETA = 5;
export const COMPETENCIAS_SELLO = 3;

interface Capacidad {
  roles: readonly string[];
  familia: string | null;
  seniority: string | null;
  aniosExperiencia: number | null;
}

export function capacidadDeTarjeta(p: Capacidad): string {
  const rol = p.roles[0] ?? p.familia ?? "Perfil";
  const anios =
    p.aniosExperiencia === null
      ? null
      : `${p.aniosExperiencia} ${p.aniosExperiencia === 1 ? "año" : "años"} de experiencia`;
  return [rol, p.seniority, anios].filter(Boolean).join(" · ");
}

export function tecnologiasDeTarjeta(tecnologias: readonly string[]): string[] {
  return tecnologias.slice(0, TECNOLOGIAS_EN_TARJETA);
}

export function selloValido(competencias: readonly string[]): boolean {
  return (
    competencias.length >= 1 &&
    competencias.length <= COMPETENCIAS_SELLO &&
    competencias.every((c) => c.trim().length > 0)
  );
}
