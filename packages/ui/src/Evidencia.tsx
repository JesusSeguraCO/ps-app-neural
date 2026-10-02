// Líneas de evidencia ✓/– (HU-119; prototipo evidencia-criterio y ficha-perfil «Frente a tu búsqueda»).
// Un solo componente para la tarjeta y la ficha: las dos reciben las mismas `LineaEvidencia` de
// `lineasDeEvidencia`, así que el texto y el orden son los mismos en los dos lugares. Lo que cumple y lo
// que no se distinguen por la marca y el tono, y el lector de pantalla lo oye («Cumple:» / «No
// cumple:»), porque el símbolo es decorativo. Sin líneas no se dibuja nada (ni título ni hueco).
import type { LineaEvidencia } from "@ps/dominio/catalogo/evidencia";

const Lector = ({ l }: { l: LineaEvidencia }) => (
  <span className="pp-sr">{l.cumple ? "Cumple: " : "No cumple: "}</span>
);

export function EvidenciaTarjeta({ lineas }: { lineas: readonly LineaEvidencia[] }) {
  if (lineas.length === 0) return null;
  return (
    <div className="pp-evidencia__criterios">
      <p className="pp-evidencia__conteo">Evidencia contra los criterios activos</p>
      <ul className="pp-criterios" aria-label="Evidencia contra los criterios activos">
        {lineas.map((l, i) => (
          <li
            className={`pp-criterio ${l.cumple ? "pp-criterio--cumple" : "pp-criterio--no"}`}
            key={i}
          >
            <span className="pp-criterio__marca" aria-hidden="true">
              {l.marca}
            </span>
            <span>
              <Lector l={l} />
              {l.texto}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EvidenciaFicha({ lineas }: { lineas: readonly LineaEvidencia[] }) {
  if (lineas.length === 0) return null;
  return (
    <section className="fp-seccion" aria-labelledby="fp-busqueda">
      <div className="pp-seccion__cabecera">
        <h3 className="pp-seccion__titulo" id="fp-busqueda">
          Frente a tu búsqueda
        </h3>
      </div>
      <ul className="fp-criterios">
        {lineas.map((l, i) => (
          <li className={`fp-criterio${l.cumple ? "" : " fp-criterio--no"}`} key={i}>
            <span className="fp-criterio__marca" aria-hidden="true">
              {l.marca}
            </span>
            <span className="fp-criterio__nombre">
              <Lector l={l} />
              {l.texto}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
