// Tarjetas de la selección y del banco (prototipo resultados / aterrizaje-curado, PP:perfil; EP-003 ·
// SS4: HU-153, HU-081, HU-119). Disponible: la capacidad primero («Rol · Seniority · N años de
// experiencia») con el nombre y el primer apellido junto y la banda a la derecha; debajo las 5 primeras
// tecnologías en orden de carga, sector (si hay, sin hueco), modalidad y país; el Sello Personal como
// competencias verificadas por Trycore, sin insignia ni puntaje (RF-3.8); la evidencia ✓/– solo si hay
// criterios activos; el código al pie en letra pequeña. Sin ciudad ni fecha (contrato del catálogo).
// Cambio: en su lugar, con la etiqueta de su estado real y una nota; sin datos si ya no hay
// consentimiento vigente.
import type { PerfilCatalogo } from "@ps/contratos/catalogo";
import type { LineaEvidencia } from "@ps/dominio/catalogo/evidencia";
import { capacidadDeTarjeta, tecnologiasDeTarjeta } from "@ps/dominio/catalogo/tarjeta";
import type { ItemSeleccion } from "@ps/dominio/enlaces/seleccion";
import { DISPONIBILIDAD_CLIENTE, ETIQUETA_ESTADO, notaEstado } from "@ps/dominio/enlaces/textos-seleccion";
import { EvidenciaTarjeta } from "@ps/ui/Evidencia";

const idDe = (codigo: string) => `p-${codigo.slice(3)}`;
const lista = (xs: string[]) => xs.join(", ").toLowerCase().replace(/^./, (c) => c.toUpperCase());

// La ficha se abre en panel lateral sobre esta misma lista (HU-120, D47).
export interface EnlaceFicha {
  href: string;
  abierta: boolean;
}

function Escudo() {
  return (
    <svg className="pp-icono pp-icono--sm" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function Disponible({
  perfil,
  ficha,
  evidencia = [],
}: {
  perfil: PerfilCatalogo;
  ficha?: EnlaceFicha;
  evidencia?: readonly LineaEvidencia[];
}) {
  const id = idDe(perfil.codigo);
  const tecnologias = tecnologiasDeTarjeta(perfil.tecnologias);
  const datos = [perfil.sectores.length > 0 ? lista(perfil.sectores) : null, perfil.modalidad, perfil.pais].filter(
    (x): x is string => Boolean(x),
  );
  const sello = perfil.selloPersonal;
  return (
    <article
      className={`pp-perfil${ficha?.abierta ? " fp-abierta" : ""}`}
      aria-labelledby={id}
      aria-current={ficha?.abierta ? "true" : undefined}
    >
      <div className="pp-perfil__cabecera">
        <div>
          <h3 className="pp-perfil__rol" id={id}>
            {capacidadDeTarjeta(perfil)}
          </h3>
          <p className="pp-perfil__nombre">{`${perfil.nombre} ${perfil.primerApellido}`}</p>
        </div>
        <span className={`pp-estado ${perfil.disponibilidad === "inmediato" ? "pp-estado--ok" : "pp-estado--neutro"}`}>
          {DISPONIBILIDAD_CLIENTE[perfil.disponibilidad]}
        </span>
      </div>
      {tecnologias.length > 0 && (
        <ul className="pp-perfil__tecnologias" aria-label="Tecnologías">
          {tecnologias.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
      {datos.length > 0 && (
        <ul className="pp-perfil__meta" aria-label="Sector, modalidad y país">
          {datos.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
      {(evidencia.length > 0 || sello.length > 0) && (
        <div className="pp-evidencia">
          <EvidenciaTarjeta lineas={evidencia} />
          {sello.length > 0 && (
            <div className="pp-bloque pp-bloque--verificado">
              <p className="pp-bloque__rotulo">
                <Escudo />
                Verificado por Trycore
              </p>
              <p className="rs-sello rs-sello--solo">
                <span className="rs-sello__rotulo">Sello Personal</span>
                {sello.join(" · ")}
              </p>
            </div>
          )}
        </div>
      )}
      <div className="pp-perfil__pie">
        {ficha &&
          (ficha.abierta ? (
            <span className="pp-meta">Ficha abierta</span>
          ) : (
            <a className="pp-enlace pp-enlace--sutil fp-ver" href={ficha.href}>
              Ver ficha<span className="pp-sr">{` de ${perfil.nombre} ${perfil.primerApellido}`}</span>
            </a>
          ))}
        <span className="pp-codigo-perfil">{perfil.codigo}</span>
      </div>
    </article>
  );
}

function Cambio({ item }: { item: Extract<ItemSeleccion<PerfilCatalogo>, { tipo: "cambio" }> }) {
  const id = idDe(item.codigo);
  const r = item.resumen;
  return (
    <article className="pp-perfil pp-perfil--cambio" aria-labelledby={id}>
      <p className="pp-perfil__estado">
        <span>
          <strong>{ETIQUETA_ESTADO[item.estado]}</strong>
        </span>
      </p>
      <h3 className="pp-perfil__rol" id={id}>
        {r ? (r.roles[0] ?? r.familia ?? "Perfil") : `Perfil ${item.codigo}`}
      </h3>
      {r && (
        <>
          <p className="pp-perfil__nombre">
            {`${r.nombre} ${r.primerApellido}`}
          </p>
          <ul className="pp-perfil__meta">
            {r.sectores.length > 0 && <li>{lista(r.sectores)}</li>}
            {r.modalidad && <li>{r.modalidad}</li>}
          </ul>
        </>
      )}
      <p className="ac-perfil__nota">{notaEstado(item.estado, item.liberaEn)}</p>
      <div className="pp-perfil__pie">
        <span className="pp-codigo-perfil">{item.codigo}</span>
      </div>
    </article>
  );
}

// Solo un perfil disponible tiene ficha: el que cambió de estado no está publicado para el cliente.
// `evidencia` solo la pasa el banco con un filtro activo (HU-119); la selección del correo, nunca.
export function TarjetaPerfil({
  item,
  ficha,
  evidencia,
}: {
  item: ItemSeleccion<PerfilCatalogo>;
  ficha?: EnlaceFicha;
  evidencia?: readonly LineaEvidencia[];
}) {
  return item.tipo === "disponible" ? (
    <Disponible perfil={item.perfil} ficha={ficha} evidencia={evidencia} />
  ) : (
    <Cambio item={item} />
  );
}
