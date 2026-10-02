// «¿Qué necesita tu proyecto?» (HU-093; prototipo encuadre-sin-seleccion y --opcion-sin-perfiles): las
// categorías y los roles del banco publicado con su conteo; elegir una abre el banco filtrado por esa
// opción y «Ver los N perfiles» abre el banco completo, sin bloqueo. Una opción sin perfiles lo dice y
// ofrece ampliar la búsqueda (pedir el perfil a medida llega con EP-010).
import type { OpcionCategoria } from "@ps/dominio/catalogo/encuadre";
import { EncabezadoEstandar } from "@ps/ui/EncabezadoEstandar";

const enlace = (tipo: "categoria" | "rol", valor: string) =>
  `/banco?${tipo}=${encodeURIComponent(valor)}`;

function Opcion(p: {
  href: string;
  nombre: string;
  n: number;
  categoria?: boolean;
  actual?: boolean;
}) {
  return (
    <a
      className={`enc-op${p.categoria ? " enc-op--categoria" : ""}`}
      href={p.href}
      aria-current={p.actual || undefined}
    >
      <span className="enc-op__nombre">{p.nombre}</span>
      <span className="enc-op__conteo" aria-hidden="true">
        {p.n}
      </span>
      <span className="pp-sr">{`, ${p.n} ${p.n === 1 ? "perfil" : "perfiles"}`}</span>
    </a>
  );
}

export function Encuadre(props: {
  taxonomia: OpcionCategoria[];
  total: number;
  sinPerfiles?: string;
  // HU-159 (D73): el encabezado del estándar también aquí, antes de la pregunta de encuadre.
  frase: string;
}) {
  return (
    <div className="enc-cuerpo">
      <EncabezadoEstandar frase={props.frase} />
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="enc-titulo" id="enc-titulo">
            ¿Qué necesita tu proyecto?
          </h1>
          <p className="pp-encabezado__meta">{`${props.total} perfiles publicados`}</p>
        </div>
      </div>
      {props.sinPerfiles && (
        <div className="pp-aviso pp-aviso--info enc-aviso" role="status" aria-live="polite">
          <p>{`Hoy no hay perfiles publicados de ${props.sinPerfiles}.`}</p>
          <div className="pp-aviso__accion enc-aviso__acciones">
            <a className="pp-enlace" href="/banco">
              Ampliar la búsqueda
            </a>
          </div>
        </div>
      )}
      <nav className="pp-filas enc-lista" aria-labelledby="enc-titulo">
        <div className="pp-filas__cabecera" aria-hidden="true">
          <span className="enc-rotulo">Categoría</span>
          <span className="enc-rotulo">Rol</span>
        </div>
        <ul className="pp-lista">
          {props.taxonomia.map((c) => (
            <li className="pp-fila" key={c.categoria}>
              <div>
                <Opcion
                  href={enlace("categoria", c.categoria)}
                  nombre={c.categoria}
                  n={c.n}
                  categoria
                  actual={props.sinPerfiles === c.categoria}
                />
              </div>
              <ul className="enc-roles" aria-label={`Roles de ${c.categoria}`}>
                {c.roles.map((r) => (
                  <li key={r.rol}>
                    <Opcion
                      href={enlace("rol", r.rol)}
                      nombre={r.rol}
                      n={r.n}
                      actual={props.sinPerfiles === r.rol}
                    />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
      {!props.sinPerfiles && (
        <div className="enc-pie">
          <a className="pp-btn pp-btn--contorno" href="/banco">
            <span>
              Ver los <span className="enc-num">{props.total}</span> perfiles
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
