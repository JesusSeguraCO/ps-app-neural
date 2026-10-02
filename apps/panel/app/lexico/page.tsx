// Léxico de búsqueda (HU-139; prototipo lexico-busqueda y variantes): propuestas de Gemini por
// aprobar (nada entra sin una persona), términos con su equivalencia en el catálogo y, en la pestaña
// «Sin coincidencia», las consultas del período como candidatas —al léxico, a la agenda de
// reclutamiento o descartadas— con lo que la búsqueda de hoy reconoce y lo que no (subrayado). Las
// consultas son sintéticas hasta EP-010. Protegida: la guarda va en la primera línea.
import { puede } from "@ps/dominio/acceso/permisos";
import { normalizar } from "@ps/dominio/catalogo/parecidos";
import { diaCortoDeColombia, momentoDeColombia } from "@ps/dominio/fecha/colombia";
import {
  candidatasDelPeriodo,
  listarLexico,
  periodosCandidatas,
  propuestasPendientes,
  type Candidata,
} from "@ps/infra/postgres/lexico";
import { valoresActivos } from "@ps/infra/postgres/catalogos-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import { Equivalencias, PantallaLexico } from "../../src/lexico/Lexico";
import { AtajoBuscador, SelectAuto } from "../../src/marco/FiltroAuto";
import { AvisoDecision } from "../../src/marco/Hoja";
import { MarcoPanel } from "../../src/marco/MarcoPanel";
import { exigirSesion } from "../../src/sesion/exigirSesion";
import "../../src/marco/marco.css";
import "./lexico.css";

const POR_PAGINA = 20;
const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const mes = (periodo: string) => {
  const [a, m] = periodo.split("-").map(Number);
  return `${MESES[m! - 1]} de ${a}`;
};
const ORIGEN = {
  manual: "Manual",
  propuesta: "Propuesta aprobada",
  candidata: "Desde candidata",
} as const;
const DESTINO = {
  lexico: ["En el léxico", "pp-estado--ok"],
  agenda_reclutamiento: ["En la agenda de reclutamiento", "pp-estado--info"],
  descartada: ["Descartada", "pp-estado--neutro"],
} as const;
const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
const citas = (xs: string[]) => xs.map((x) => `«${x}»`).join(xs.length > 2 ? ", " : " y ");

// Término sugerido al llevar la consulta al léxico: el tramo no reconocido más largo.
const sugerido = (c: Candidata) =>
  [...c.reconocimiento.sinReconocer].sort((a, b) => b.length - a.length)[0] ?? c.consulta;

// `data-lx-fila`: la tarjeta lateral resalta la fila de la que sale el término al «Llevar al léxico».
function FilaCandidata({
  c,
  escribe,
  seleccionada,
}: {
  c: Candidata;
  escribe: boolean;
  seleccionada: boolean;
}) {
  const r = c.reconocimiento;
  const resuelta = c.destino !== null;
  return (
    <li
      className={`pp-fila${resuelta ? " lx-fila-resuelta" : seleccionada ? " pp-fila--seleccionada" : ""}`}
      data-lx-fila={c.id}
    >
      <div className="pp-fila__principal">
        <p className="pp-fila__titulo">
          <span className="lx-consulta">
            {resuelta
              ? c.consulta
              : r.tramos.map((t, k) => (
                  <span key={k}>
                    {k > 0 && " "}
                    {t.tipo === "sin_reconocer" ? (
                      <span className="lx-norec">{t.texto}</span>
                    ) : (
                      t.texto
                    )}
                  </span>
                ))}
          </span>
        </p>
        <p className="pp-fila__meta">
          {`${plural(c.veces, "búsqueda", "búsquedas")} · ${plural(c.cuentas, "cuenta", "cuentas")} · `}
          {resuelta
            ? `decidido el ${diaCortoDeColombia(c.decididoEn!)}${c.decididoPor ? ` por ${c.decididoPor}` : ""}`
            : `última el ${diaCortoDeColombia(c.ultimaEn)}`}
        </p>
        {!resuelta && (
          <p className="pp-fila__meta">
            {r.reconocidos.length
              ? `Reconoció ${citas(r.reconocidos.map((x) => x.texto))}.`
              : "No reconoció ninguna palabra."}
          </p>
        )}
      </div>
      <div className="pp-fila__acciones lx-acciones">
        {resuelta ? (
          <span className={`pp-estado ${DESTINO[c.destino!][1]}`}>{DESTINO[c.destino!][0]}</span>
        ) : (
          escribe && (
            <>
              <button
                type="button"
                className="pp-btn pp-btn--fantasma pp-btn--sm"
                data-lx="descartar"
                data-id={c.id}
              >
                Descartar
              </button>
              <button
                type="button"
                className="pp-btn pp-btn--fantasma pp-btn--sm"
                data-lx="reclutamiento"
                data-id={c.id}
              >
                Llevar a reclutamiento
              </button>
              <a
                className="pp-btn pp-btn--contorno pp-btn--sm"
                href="#lx-alta"
                data-lx="llevar-lexico"
                data-id={c.id}
              >
                Llevar al léxico
              </a>
            </>
          )
        )}
      </div>
    </li>
  );
}

export default async function Lexico({
  searchParams,
}: {
  searchParams: Promise<{
    vista?: string;
    q?: string;
    periodo?: string;
    pagina?: string;
    candidata?: string;
  }>;
}) {
  const sesion = await exigirSesion();
  const p = await searchParams;
  const vista = p.vista === "candidatas" ? "candidatas" : "terminos";
  const q = (p.q ?? "").slice(0, 200);
  const bd = poolDe("panel");
  const ahora = new Date();
  const [terminos, propuestas, periodos, roles, tecnologias, sectores] = await Promise.all([
    listarLexico(bd),
    propuestasPendientes(bd),
    periodosCandidatas(bd),
    valoresActivos(bd, "rol"),
    valoresActivos(bd, "tecnologia"),
    valoresActivos(bd, "sector"),
  ]);
  const periodo = periodos.includes(p.periodo ?? "") ? p.periodo! : periodos[0];
  const candidatas = periodo ? await candidatasDelPeriodo(bd, periodo) : [];
  const pendientes = candidatas.filter((c) => c.destino === null).length;
  const escribe = puede(sesion.rol, "lexico.escribir");

  const texto = normalizar(q);
  const filtrados = terminos.filter(
    (t) =>
      !texto ||
      [t.termino, ...t.sinonimos, ...t.equivalencias.map((e) => e.nombre)].some((x) =>
        normalizar(x).includes(texto),
      ),
  );
  const lista = vista === "terminos" ? filtrados : candidatas;
  const paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  const pagina = Math.min(Math.max(1, Number(p.pagina) || 1), paginas);
  const desde = (pagina - 1) * POR_PAGINA;
  const url = (cambios: Record<string, string | undefined>) => {
    const s = new URLSearchParams();
    const v = {
      vista: vista === "terminos" ? undefined : vista,
      q: q || undefined,
      periodo: vista === "candidatas" ? periodo : undefined,
      ...cambios,
    };
    for (const [k, x] of Object.entries(v)) if (x) s.set(k, x);
    const t = s.toString();
    return t ? `/lexico?${t}` : "/lexico";
  };
  const meta = [
    plural(terminos.length, "término", "términos"),
    plural(propuestas.length, "propuesta por aprobar", "propuestas por aprobar"),
    periodo
      ? `${plural(pendientes, "búsqueda sin resultados", "búsquedas sin resultados")} en ${mes(periodo).split(" de ")[0]}`
      : null,
  ].filter(Boolean);

  const listado = (
    <section aria-label="Léxico y búsquedas sin coincidencia">
      <div className="pp-barra">
        <nav className="pp-pestanas" aria-label="Qué ver">
          <a
            className="pp-pestana"
            href="/lexico"
            aria-current={vista === "terminos" ? "page" : undefined}
          >
            Términos <span className="pp-pestana__conteo">{terminos.length}</span>
          </a>
          <a
            className="pp-pestana"
            href="/lexico?vista=candidatas"
            aria-current={vista === "candidatas" ? "page" : undefined}
          >
            Sin coincidencia <span className="pp-pestana__conteo">{pendientes}</span>
          </a>
        </nav>
        {vista === "terminos" ? (
          <form className="pp-buscador" role="search" action="/lexico">
            <label className="pp-sr" htmlFor="lx-buscar">
              Buscar en el léxico
            </label>
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
              id="lx-buscar"
              name="q"
              type="search"
              placeholder="Término o valor del catálogo"
              defaultValue={q}
            />
            <AtajoBuscador id="lx-buscar" />
          </form>
        ) : (
          periodos.length > 0 && (
            <form action="/lexico">
              <input type="hidden" name="vista" value="candidatas" />
              <SelectAuto
                id="lx-periodo"
                name="periodo"
                valor={periodo ?? ""}
                etiqueta="Período"
                className="lx-periodo"
              >
                {periodos.map((x) => (
                  <option key={x} value={x}>
                    {mes(x).replace(/^./, (c) => c.toUpperCase())}
                  </option>
                ))}
              </SelectAuto>
            </form>
          )
        )}
      </div>
      {vista === "terminos" ? (
        filtrados.length === 0 ? (
          <div className="pp-vacio">
            <p>
              {terminos.length
                ? "Ningún término coincide con la búsqueda."
                : "Aún no hay términos. Agrega el primero con el formulario."}
            </p>
          </div>
        ) : (
          <div
            className="pp-tabla-marco lx-tabla-marco"
            tabIndex={0}
            role="region"
            aria-label="Términos del léxico"
          >
            <table className="pp-tabla lx-tabla">
              <caption className="pp-sr">
                Términos de los clientes y su equivalencia en el catálogo
              </caption>
              <thead>
                <tr>
                  <th scope="col">Término del cliente</th>
                  <th scope="col">Equivale a</th>
                  <th scope="col">Editado · origen</th>
                  <th scope="col" className="pp-tabla__acciones">
                    <span className="pp-sr">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtrados.slice(desde, desde + POR_PAGINA).map((t) => (
                  <tr key={t.id}>
                    <th scope="row">
                      <span className="pp-tabla__perfil">{t.termino}</span>
                      {t.sinonimos.length > 0 && (
                        <span className="lx-sinonimos" title={t.sinonimos.join(", ")}>
                          {t.sinonimos.join(", ")}
                        </span>
                      )}
                    </th>
                    <td>
                      <Equivalencias lista={t.equivalencias} bloque />
                    </td>
                    <td className="pp-tabla__num">
                      <span className="lx-fecha">{momentoDeColombia(t.actualizadoEn, ahora)}</span>
                      <span className="pp-tabla__sub">{`${t.actualizadoPor ?? "Sistema"} · ${ORIGEN[t.origen]}`}</span>
                    </td>
                    <td className="pp-tabla__acciones">
                      {escribe && (
                        <button
                          type="button"
                          className="pp-btn pp-btn--fantasma pp-btn--sm"
                          aria-label={`Editar «${t.termino}»`}
                          data-lx="editar-termino"
                          data-id={t.id}
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : candidatas.length === 0 ? (
        <div className="pp-vacio">
          <p>No hubo búsquedas sin resultados en el período.</p>
        </div>
      ) : (
        <div className="pp-filas">
          <div className="pp-filas__cabecera">
            <h3 className="pp-filas__titulo">Búsquedas sin resultados</h3>
            <span className="pp-meta">
              <span className="lx-norec">Subrayado</span>: lo que no reconoció
            </span>
          </div>
          <ul className="pp-lista" aria-label="Consultas sin coincidencia del período">
            {candidatas.slice(desde, desde + POR_PAGINA).map((c) => (
              <FilaCandidata
                key={c.id}
                c={c}
                escribe={escribe}
                seleccionada={escribe && c.id === p.candidata}
              />
            ))}
          </ul>
        </div>
      )}
      {lista.length > 0 && (
        <div className="pp-paginacion">
          <span>
            {`${desde + 1}–${Math.min(desde + POR_PAGINA, lista.length)} de ${lista.length} · ${vista === "terminos" ? "más recientes primero" : "más búsquedas primero"}`}
          </span>
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
    </section>
  );

  return (
    <MarcoPanel sesion={sesion} activo="lexico" migas={["Banco de perfiles", "Léxico de búsqueda"]}>
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="pp-encabezado__titulo">Léxico de búsqueda</h1>
          <p className="pp-encabezado__meta">{meta.join(" · ")}</p>
        </div>
      </div>
      <PantallaLexico
        escribe={escribe}
        propuestas={propuestas.map((x) => ({
          id: x.id,
          termino: x.termino,
          sinonimos: x.sinonimos,
          equivalencias: x.equivalencias.map((e) => ({ tipo: e.tipo, nombre: e.nombre })),
          meta: `${diaCortoDeColombia(x.propuestaEn)} · ${plural(x.busquedas, "búsqueda", "búsquedas")} · ${plural(x.cuentas, "cuenta", "cuentas")}`,
          fecha: diaCortoDeColombia(x.propuestaEn),
          ejemplo: x.ejemplo,
          busquedas: x.busquedas,
          cuentas: x.cuentas,
        }))}
        terminos={terminos.map((t) => ({
          id: t.id,
          termino: t.termino,
          sinonimos: t.sinonimos,
          equivalencias: t.equivalencias.map((e) => ({ tipo: e.tipo, nombre: e.nombre })),
        }))}
        candidatas={candidatas
          .filter((c) => c.destino === null)
          .map((c) => ({ id: c.id, consulta: c.consulta, sugerido: sugerido(c) }))}
        candidataInicial={p.candidata}
        valores={{
          rol: roles.map((v) => v.nombre),
          tecnologia: tecnologias.map((v) => v.nombre),
          sector: sectores.map((v) => v.nombre),
        }}
        lista={listado}
      />
      <AvisoDecision />
    </MarcoPanel>
  );
}
