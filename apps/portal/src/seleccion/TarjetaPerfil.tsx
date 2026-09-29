// Tarjetas de la selección (PP:perfil del prototipo aterrizaje-curado). Disponible: rol, nombre,
// tecnologías, banda, sectores y modalidad (sin ciudad ni fecha: contrato del catálogo). Cambio: en su
// lugar, con la etiqueta de su estado real y una nota; sin datos si ya no hay consentimiento vigente.
import type { PerfilCatalogo } from "@ps/contratos/catalogo";
import type { ItemSeleccion } from "@ps/dominio/enlaces/seleccion";
import { DISPONIBILIDAD_CLIENTE, ETIQUETA_ESTADO, notaEstado } from "@ps/dominio/enlaces/textos-seleccion";

const idDe = (codigo: string) => `p-${codigo.slice(3)}`;
const lista = (xs: string[]) => xs.join(", ").toLowerCase().replace(/^./, (c) => c.toUpperCase());

function Disponible({ perfil }: { perfil: PerfilCatalogo }) {
  const id = idDe(perfil.codigo);
  return (
    <article className="pp-perfil" aria-labelledby={id}>
      <h3 className="pp-perfil__rol" id={id}>
        {perfil.roles[0] ?? perfil.familia ?? "Perfil"}
      </h3>
      <p className="pp-perfil__nombre">{`${perfil.nombre} ${perfil.primerApellido}`}</p>
      {perfil.tecnologias.length > 0 && (
        <ul className="pp-perfil__tecnologias" aria-label="Tecnologías">
          {perfil.tecnologias.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
      <ul className="pp-perfil__meta">
        <li className="ac-disponible">
          <span className={`pp-estado ${perfil.disponibilidad === "inmediato" ? "pp-estado--ok" : "pp-estado--neutro"}`}>
            {DISPONIBILIDAD_CLIENTE[perfil.disponibilidad]}
          </span>
        </li>
        {perfil.sectores.length > 0 && <li>{lista(perfil.sectores)}</li>}
        {perfil.modalidad && <li>{perfil.modalidad}</li>}
      </ul>
      <div className="pp-perfil__pie">
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

export function TarjetaPerfil({ item }: { item: ItemSeleccion<PerfilCatalogo> }) {
  return item.tipo === "disponible" ? <Disponible perfil={item.perfil} /> : <Cambio item={item} />;
}
