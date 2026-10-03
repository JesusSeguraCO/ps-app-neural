// Catálogos (HU-089, HU-143; prototipo catalogos y variantes): una pestaña por catálogo (roles,
// familias, tecnologías, sectores, modalidades de prueba, motivos de pausa y alcances SARO de HU-177) con su uso en el banco, filtro de estado y
// búsqueda; crear, editar, desactivar, reactivar y fusionar en hojas laterales. Nada se borra. La
// observadora ve la lista sin acciones (el servidor además le responde 403). Protegida: la guarda va
// en la primera línea.
import { puede } from "@ps/dominio/acceso/permisos";
import { normalizar } from "@ps/dominio/catalogo/parecidos";
import {
  ETIQUETA_TIPO,
  FEMENINO,
  GRUPOS_TECNOLOGIA,
  TIPOS_CATALOGO,
  esTipoCatalogo,
  type TipoCatalogo,
} from "@ps/dominio/catalogo/tipos";
import {
  conteosCatalogos,
  listarCatalogo,
  type ValorListado,
} from "@ps/infra/postgres/catalogos-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import {
  AccionesEncabezado,
  AccionesFila,
  type ContextoCatalogo,
} from "../../src/catalogos/HojasCatalogo";
import { AtajoBuscador, SelectAuto } from "../../src/marco/FiltroAuto";
import { AvisoDecision } from "../../src/marco/Hoja";
import { MarcoPanel } from "../../src/marco/MarcoPanel";
import { exigirSesion } from "../../src/sesion/exigirSesion";
import "../../src/marco/marco.css";
import "./catalogos.css";

const POR_PAGINA = 25;
const CABECERA: Record<TipoCatalogo, string> = {
  rol: "Rol",
  familia: "Familia",
  tecnologia: "Tecnología",
  sector: "Sector",
  modalidad_prueba: "Modalidad de prueba",
  motivo_pausa: "Motivo de pausa",
  alcance_saro: "Alcance SARO",
};
const COLUMNA: Record<TipoCatalogo, string> = {
  rol: "Familia",
  familia: "Modalidades de prueba",
  tecnologia: "Grupo",
  sector: "Publicados",
  modalidad_prueba: "Familia",
  motivo_pausa: "Ayuda al elegirlo",
  alcance_saro: "Lo que ve el cliente",
};

function segundaColumna(tipo: TipoCatalogo, v: ValorListado): string {
  if (tipo === "familia") return v.modalidades ? `${v.modalidades}` : "Sin modalidades";
  if (tipo === "sector") return `${v.publicados}`;
  if (tipo === "motivo_pausa") return v.descripcion ?? "—";
  if (tipo === "alcance_saro") return v.textoCliente ?? "—";
  return v.grupo ?? "—";
}

export default async function Catalogos({
  searchParams,
}: {
  searchParams: Promise<{
    tipo?: string;
    estado?: string;
    q?: string;
    pagina?: string;
    crear?: string;
    familia?: string;
  }>;
}) {
  const sesion = await exigirSesion();
  const p = await searchParams;
  const tipo: TipoCatalogo = p.tipo && esTipoCatalogo(p.tipo) ? p.tipo : "rol";
  const estado = p.estado === "activos" || p.estado === "desactivados" ? p.estado : "todos";
  const q = (p.q ?? "").slice(0, 200);
  const bd = poolDe("panel");
  const [todos, conteos, familias] = await Promise.all([
    listarCatalogo(bd, tipo),
    conteosCatalogos(bd),
    listarCatalogo(bd, "familia"),
  ]);
  const vigentes = todos.filter((v) => !v.fusionadoEn);
  const texto = normalizar(q);
  const visibles = vigentes
    .filter((v) => estado === "todos" || (estado === "activos" ? v.activo : !v.activo))
    .filter((v) => !texto || normalizar(v.nombre).includes(texto));
  const paginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA));
  const pagina = Math.min(Math.max(1, Number(p.pagina) || 1), paginas);
  const enPagina = visibles.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const desactivados = vigentes.filter((v) => !v.activo).length;
  const et = ETIQUETA_TIPO[tipo];
  const escribe = puede(sesion.rol, "catalogo.escribir");
  const ctx: ContextoCatalogo = {
    tipo,
    singular: et.singular,
    femenino: FEMENINO[tipo],
    familias: familias
      .filter((f) => f.activo && !f.fusionadoEn)
      .map((f) => ({ id: f.id, nombre: f.nombre, modalidades: f.modalidades ?? 0 })),
    grupos: GRUPOS_TECNOLOGIA,
    activos: vigentes
      .filter((v) => v.activo)
      .map((v) => ({ id: v.id, nombre: v.nombre, perfiles: v.perfiles, familiaId: v.familiaId })),
  };
  const url = (cambios: Record<string, string | undefined>) => {
    const s = new URLSearchParams();
    const v = {
      tipo: tipo === "rol" ? undefined : tipo,
      estado: estado === "todos" ? undefined : estado,
      q: q || undefined,
      ...cambios,
    };
    for (const [k, x] of Object.entries(v)) if (x) s.set(k, x);
    const t = s.toString();
    return t ? `/catalogos?${t}` : "/catalogos";
  };
  const des = FEMENINO[tipo]
    ? desactivados === 1
      ? "desactivada"
      : "desactivadas"
    : desactivados === 1
      ? "desactivado"
      : "desactivados";

  return (
    <MarcoPanel sesion={sesion} activo="catalogos" migas={["Banco de perfiles", "Catálogos"]}>
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="pp-encabezado__titulo">Catálogos</h1>
          <p className="pp-encabezado__meta">
            {`${vigentes.length} ${vigentes.length === 1 ? et.singular : et.plural} · `}
            {desactivados
              ? `${desactivados} ${des}`
              : FEMENINO[tipo]
                ? "todas activas"
                : "todos activos"}
          </p>
        </div>
        {escribe && (
          <div className="pp-encabezado__acciones">
            <AccionesEncabezado
              ctx={ctx}
              crearAbierto={p.crear === "1"}
              familiaInicial={p.familia}
            />
          </div>
        )}
      </div>

      <div className="pp-barra">
        <nav className="pp-pestanas" aria-label="Catálogos del banco">
          {TIPOS_CATALOGO.map((t) => (
            <a
              key={t}
              className="pp-pestana"
              href={t === "rol" ? "/catalogos" : `/catalogos?tipo=${t}`}
              aria-current={t === tipo ? "page" : undefined}
            >
              {ETIQUETA_TIPO[t].pestana} <span className="pp-pestana__conteo">{conteos[t]}</span>
            </a>
          ))}
        </nav>
        <form className="ct-barra__derecha" role="search" action="/catalogos">
          {tipo !== "rol" && <input type="hidden" name="tipo" value={tipo} />}
          <SelectAuto
            id="ct-filtro"
            name="estado"
            valor={estado}
            etiqueta="Mostrar"
            className="ct-filtro"
          >
            <option value="todos">Todos</option>
            <option value="activos">Solo activos</option>
            <option value="desactivados">Solo desactivados</option>
          </SelectAuto>
          <label className="pp-buscador">
            <span className="pp-sr">{`Buscar en ${et.plural}`}</span>
            <svg
              className="pp-icono pp-icono--sm pp-buscador__icono"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <input
              className="pp-input"
              id="ct-buscar"
              type="search"
              name="q"
              placeholder={`Nombre ${FEMENINO[tipo] ? "de la" : "del"} ${et.singular}`}
              defaultValue={q}
            />
            <AtajoBuscador id="ct-buscar" />
          </label>
        </form>
      </div>

      {enPagina.length === 0 ? (
        <div className="pp-vacio">
          <p>
            {vigentes.length === 0
              ? `Aún no hay ${et.plural} en el catálogo.`
              : `Ningún valor coincide con la búsqueda.`}
          </p>
        </div>
      ) : (
        <div
          className="pp-tabla-marco ct-marco"
          tabIndex={0}
          role="region"
          aria-label={`${et.pestana} del catálogo`}
        >
          <table className="pp-tabla">
            <caption className="pp-sr">{`${et.pestana} del catálogo`}</caption>
            <colgroup>
              <col className="ct-col-nombre" />
              <col className="ct-col-grupo" />
              <col className="ct-col-num" />
              <col className="ct-col-acc" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">
                  {CABECERA[tipo]}
                </th>
                <th scope="col">{COLUMNA[tipo]}</th>
                <th scope="col" className="ct-num">
                  Perfiles
                </th>
                <th scope="col" className="pp-tabla__acciones">
                  <span className="pp-sr">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {enPagina.map((v) => (
                <tr key={v.id} className={v.activo ? undefined : "ct-inactiva"}>
                  <th scope="row">
                    <span className="pp-tabla__perfil" title={v.nombre}>
                      {v.nombre}
                    </span>
                    {!v.activo && (
                      <span className="pp-tabla__sub">{`${FEMENINO[tipo] ? "Desactivada" : "Desactivado"} · sus perfiles l${FEMENINO[tipo] ? "a" : "o"} conservan`}</span>
                    )}
                    {tipo === "familia" && v.activo && !v.modalidades && (
                      <span className="pp-tabla__sub">
                        Sin modalidades: sus perfiles no se pueden publicar
                      </span>
                    )}
                  </th>
                  <td title={segundaColumna(tipo, v)}>{segundaColumna(tipo, v)}</td>
                  <td className="pp-tabla__num ct-num">
                    {v.perfiles}
                    {(tipo === "modalidad_prueba" || tipo === "alcance_saro") && (
                      <span className="pp-tabla__sub">{`${v.publicados} ${tipo === "alcance_saro" ? (v.publicados === 1 ? "publicado" : "publicados") : v.publicados === 1 ? "publicada" : "publicadas"}`}</span>
                    )}
                  </td>
                  <td className="pp-tabla__acciones">
                    {escribe && (
                      <AccionesFila
                        ctx={ctx}
                        valor={{
                          id: v.id,
                          nombre: v.nombre,
                          activo: v.activo,
                          grupo: v.grupo,
                          familiaId: v.familiaId,
                          perfiles: v.perfiles,
                          textoCliente: v.textoCliente,
                          enunciadoReto: v.enunciadoReto,
                          entregables: v.entregables,
                          criterios: v.criterios,
                          descripcion: v.descripcion,
                        }}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {visibles.length > 0 && (
        <div className="pp-paginacion">
          <span>{`${(pagina - 1) * POR_PAGINA + 1}–${(pagina - 1) * POR_PAGINA + enPagina.length} de ${visibles.length} · ordenados por uso`}</span>
          <div>
            {pagina > 1 ? (
              <a
                className="pp-btn pp-btn--contorno pp-btn--sm"
                href={url({ pagina: String(pagina - 1) })}
              >
                Anterior
              </a>
            ) : (
              <button type="button" className="pp-btn pp-btn--contorno pp-btn--sm" disabled>
                Anterior
              </button>
            )}
            {pagina < paginas ? (
              <a
                className="pp-btn pp-btn--contorno pp-btn--sm"
                href={url({ pagina: String(pagina + 1) })}
              >
                Siguiente
              </a>
            ) : (
              <button type="button" className="pp-btn pp-btn--contorno pp-btn--sm" disabled>
                Siguiente
              </button>
            )}
          </div>
        </div>
      )}
      <AvisoDecision />
    </MarcoPanel>
  );
}
