// Encabezado del estándar Neural-Grid (HU-159; prototipo hero-neural-grid) y bloque de respaldo del
// servicio (RF-6.3; prototipo franja-servicio, «Te respondemos en 10 días hábiles»). Un solo componente
// para la selección, el banco y el encuadre sin selección: va antes del primer contenido, en el flujo de
// la página —sin diálogo, sin nada que cerrar ni aceptar, sin fijarse encima de la lista— y dice una sola
// vez lo que el estándar exige. La frase la elige el dominio según el conteo de incompletos (D80, D97).
import { DIMENSIONES_ESTANDAR } from "@ps/dominio/catalogo/estandar";
import { COPY_ESTANDAR } from "./copy";

function Marca() {
  // Núcleo y cuatro dimensiones (el prototipo dibuja un núcleo con su anillo de componentes); decorativo.
  return (
    <svg className="ee-estandar__marca" viewBox="0 0 96 96" aria-hidden="true">
      <circle cx="48" cy="48" r="34" className="ee-anillo" />
      <circle cx="48" cy="48" r="12" className="ee-nucleo" />
      {[
        [48, 14],
        [82, 48],
        [48, 82],
        [14, 48],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="6" className="ee-nodo" />
      ))}
    </svg>
  );
}

export function EncabezadoEstandar({ frase }: { frase: string }) {
  return (
    <section className="ee-estandar" aria-labelledby="ee-titulo">
      <Marca />
      <div className="ee-estandar__texto">
        <p className="ee-estandar__antetitulo">{COPY_ESTANDAR.antetitulo}</p>
        <h2 className="ee-estandar__titulo" id="ee-titulo">
          {COPY_ESTANDAR.titulo}
        </h2>
        <p className="ee-estandar__intro">{COPY_ESTANDAR.introduccion}</p>
        <p className="ee-estandar__frase">{frase}</p>
        <ul className="ee-dimensiones" aria-label="Las cuatro dimensiones del estándar">
          {DIMENSIONES_ESTANDAR.map((d) => (
            <li className={`ee-dim${d.papel === "Garantía del servicio" ? " ee-dim--servicio" : ""}`} key={d.nombre}>
              <span className="ee-dim__nombre">{d.nombre}</span>
              <span className="ee-dim__papel">{d.papel}</span>
              <span className="ee-dim__detalle">{d.detalle}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function RespaldoServicio() {
  return (
    <section className="ee-respaldo" aria-labelledby="ee-respaldo-t">
      <h2 className="ee-respaldo__titulo" id="ee-respaldo-t">
        {COPY_ESTANDAR.respaldoTitulo}
      </h2>
      <ul className="ee-respaldo__lista">
        {COPY_ESTANDAR.respaldo.map((r) => (
          <li key={r.nombre}>
            <span className="ee-respaldo__nombre">{r.nombre}</span>
            <span className="ee-respaldo__texto">{r.texto}</span>
          </li>
        ))}
      </ul>
      <p className="ee-respaldo__sla">{COPY_ESTANDAR.sla}</p>
    </section>
  );
}
