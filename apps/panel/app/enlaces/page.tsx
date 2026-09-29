// Enlaces de acceso (prototipo enlaces-acceso): registro de enlaces con pestañas por estado, búsqueda
// y el detalle del elegido con «Revocar» (tarea 4.4). Protegida: la guarda va en la primera línea.
// Las aperturas por invitado llegan con el acceso del cliente (sub-slice 5).
import { puede } from "@ps/dominio/acceso/permisos";
import { ROTULO_BANDA } from "@ps/dominio/catalogo/banda";
import { horaDeColombia } from "@ps/dominio/fecha/colombia";
import {
  detalleEnlace,
  listarEnlaces,
  type EstadoEnlace,
  type FilaEnlace,
} from "@ps/infra/postgres/enlaces";
import { poolDe } from "@ps/infra/postgres/pool";
import { MarcoPanel } from "../../src/marco/MarcoPanel";
import { RevocarEnlace } from "../../src/enlaces/RevocarEnlace";
import { exigirSesion } from "../../src/sesion/exigirSesion";
import "../../src/marco/marco.css";
import "./enlaces.css";

const DIA_MS = 86_400_000;
const dia = (d: Date) => horaDeColombia(d).split(", ")[0]!;
const PESTANAS: Array<[EstadoEnlace | "todos", string]> = [
  ["todos", "Todos"],
  ["vigente", "Vigentes"],
  ["vencido", "Vencidos"],
  ["revocado", "Revocados"],
];
const ESTADO_CLASE: Record<EstadoEnlace, string> = {
  vigente: "pp-estado--ok",
  vencido: "pp-estado--neutro",
  revocado: "pp-estado--danger",
};
const ESTADO_TEXTO: Record<EstadoEnlace, string> = {
  vigente: "Vigente",
  vencido: "Vencido",
  revocado: "Revocado",
};
const PERFIL_TEXTO = {
  disponible: "Disponible",
  colocado: "Colocado",
  pausado: "Pausado",
  fuera_del_banco: "Fuera del banco",
  desconocido: "Fuera del banco",
};
const PERFIL_CLASE = {
  disponible: "pp-estado--ok",
  colocado: "pp-estado--info",
  pausado: "pp-estado--warn",
  fuera_del_banco: "pp-estado--borrador",
  desconocido: "pp-estado--borrador",
};

function vigencia(f: FilaEnlace, ahora: Date): { linea: string; sub: string } {
  if (f.estado === "revocado")
    return {
      linea: `Revocado el ${dia(f.revocadoEn!)}`,
      sub: f.revocadoPor ? `por ${f.revocadoPor}` : "",
    };
  const restan = Math.ceil((f.vigenteHasta.getTime() - ahora.getTime()) / DIA_MS);
  if (f.estado === "vencido") {
    const duro = Math.round((f.vigenteHasta.getTime() - f.vigenteDesde.getTime()) / DIA_MS);
    return { linea: `Venció el ${dia(f.vigenteHasta)}`, sub: `duró ${duro} días` };
  }
  return {
    linea: `Hasta el ${dia(f.vigenteHasta)}`,
    sub: `en ${restan} ${restan === 1 ? "día" : "días"}`,
  };
}

export default async function Enlaces({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string; enlace?: string }>;
}) {
  const sesion = await exigirSesion();
  const { estado: estadoParam, q = "", enlace } = await searchParams;
  const bd = poolDe("panel");
  const ahora = new Date();
  const todos = await listarEnlaces(bd);
  const estado = PESTANAS.some(([k]) => k === estadoParam)
    ? (estadoParam as EstadoEnlace | "todos")
    : "todos";
  const texto = q.trim().toLowerCase();
  const visibles = todos
    .filter((f) => estado === "todos" || f.estado === estado)
    .filter(
      (f) =>
        !texto ||
        [f.cuenta, f.proyecto ?? "", f.codigo, ...f.invitados].some((x) =>
          x.toLowerCase().includes(texto),
        ),
    );
  const cuenta = (e: EstadoEnlace) => todos.filter((f) => f.estado === e).length;
  const vencenPronto = todos.filter(
    (f) => f.estado === "vigente" && f.vigenteHasta.getTime() - ahora.getTime() <= 7 * DIA_MS,
  ).length;
  const detalle = enlace ? await detalleEnlace(bd, enlace) : null;
  const url = (cambios: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const v = {
      estado: estado === "todos" ? undefined : estado,
      q: q || undefined,
      enlace,
      ...cambios,
    };
    for (const [k, x] of Object.entries(v)) if (x) p.set(k, x);
    const s = p.toString();
    return s ? `/enlaces?${s}` : "/enlaces";
  };

  return (
    <MarcoPanel sesion={sesion} activo="enlaces" migas={["Clientes", "Enlaces de acceso"]}>
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="pp-encabezado__titulo">Enlaces de acceso</h1>
          <p className="pp-encabezado__meta">
            {`${todos.length} ${todos.length === 1 ? "enlace" : "enlaces"} · ${cuenta("vigente")} ${cuenta("vigente") === 1 ? "vigente" : "vigentes"}`}
            {vencenPronto > 0 &&
              ` · ${vencenPronto} ${vencenPronto === 1 ? "vence pronto" : "vencen pronto"}`}
          </p>
        </div>
        {puede(sesion.rol, "enlaces.generar") && (
          <div className="pp-encabezado__acciones">
            <a className="pp-btn pp-btn--primario" href="/enlaces/nuevo">
              Generar enlace
            </a>
          </div>
        )}
      </div>

      <div className="pp-barra">
        <nav className="pp-pestanas" aria-label="Estado de los enlaces">
          {PESTANAS.map(([k, t]) => (
            <a
              key={k}
              className="pp-pestana"
              href={url({ estado: k === "todos" ? undefined : k, enlace: undefined })}
              aria-current={k === estado ? "page" : undefined}
            >
              {t}{" "}
              <span className="pp-pestana__conteo">{k === "todos" ? todos.length : cuenta(k)}</span>
            </a>
          ))}
        </nav>
        <form className="pp-buscador" role="search" action="/enlaces">
          {estado !== "todos" && <input type="hidden" name="estado" value={estado} />}
          <label className="pp-sr" htmlFor="ea-buscar">
            Buscar enlaces
          </label>
          <svg className="pp-icono pp-icono--sm pp-buscador__icono" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <input
            className="pp-input"
            id="ea-buscar"
            name="q"
            type="search"
            placeholder="Cuenta, proyecto o correo"
            defaultValue={q}
          />
        </form>
      </div>

      {visibles.length === 0 ? (
        <div className="pp-vacio">
          <p>
            {todos.length === 0
              ? "Aún no hay enlaces. Genera el primero para una cuenta."
              : "Ningún enlace coincide con la búsqueda."}
          </p>
        </div>
      ) : (
        <div
          className="pp-tabla-marco ea-tabla-marco"
          tabIndex={0}
          role="region"
          aria-label="Registro de enlaces de acceso"
        >
          <table className="pp-tabla ea-tabla">
            <caption className="pp-sr">
              Enlaces de acceso: cuenta, invitados, quién lo generó, vigencia y estado.
            </caption>
            <thead>
              <tr>
                <th scope="col">Cuenta</th>
                <th scope="col" className="ea-col-invitados">
                  Invitados
                </th>
                <th scope="col" className="ea-col-genero">
                  Generó
                </th>
                <th scope="col" className="ea-col-vigencia">
                  Vigencia
                </th>
                <th scope="col" className="ea-col-estado">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((f) => {
                const v = vigencia(f, ahora);
                const elegido = f.codigo === enlace;
                return (
                  <tr key={f.codigo} aria-selected={elegido ? true : undefined}>
                    <th scope="row">
                      <a
                        className="pp-tabla__perfil ea-cuenta"
                        href={`${url({ enlace: f.codigo })}#registro`}
                        aria-current={elegido ? "true" : undefined}
                      >
                        {f.cuenta}
                      </a>
                      <span className="pp-tabla__sub">
                        {[f.proyecto, f.sinSeleccion ? "sin selección" : null]
                          .filter(Boolean)
                          .join(" · ")}
                        {(f.proyecto || f.sinSeleccion) && " · "}
                        <span className="pp-mono">{f.codigo}</span>
                      </span>
                    </th>
                    <td className="ea-col-invitados">
                      <span className="ea-corta">{f.invitados[0]}</span>
                      {f.invitados.length > 1 && (
                        <span className="pp-tabla__sub">{`y ${f.invitados.length - 1} más`}</span>
                      )}
                    </td>
                    <td className="ea-col-genero">
                      <span className="pp-tabla__perfil">{f.generadoPor}</span>
                      <span className="pp-tabla__sub pp-tabla__num">{dia(f.generadoEn)}</span>
                    </td>
                    <td className="ea-col-vigencia pp-tabla__num">
                      <span className="pp-tabla__perfil">{v.linea}</span>
                      {v.sub && (
                        <span className="pp-tabla__sub">
                          <span className="ea-movil"> · </span>
                          {v.sub}
                        </span>
                      )}
                    </td>
                    <td className="ea-col-estado">
                      <span className={`pp-estado ${ESTADO_CLASE[f.estado]}`}>
                        {ESTADO_TEXTO[f.estado]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {detalle && (
        <section className="ea-detalle" id="registro" aria-labelledby="ea-detalle-titulo">
          <div className="ea-detalle__cabecera">
            <h2 className="ea-detalle__titulo" id="ea-detalle-titulo">
              {[detalle.cuenta, detalle.proyecto].filter(Boolean).join(" · ")}
            </h2>
            <p className="ea-detalle__meta">
              <span className={`pp-estado ${ESTADO_CLASE[detalle.estado]}`}>
                {ESTADO_TEXTO[detalle.estado]}
              </span>
            </p>
          </div>
          <div className="pp-con-lateral">
            <div className="ea-principal">
              <dl className="pp-datos">
                <div className="pp-datos__fila">
                  <dt>Enlace</dt>
                  <dd>
                    <span className="pp-mono">{detalle.codigo}</span>
                  </dd>
                </div>
                <div className="pp-datos__fila">
                  <dt>Razón de la selección</dt>
                  <dd className="ea-razon">{`«${detalle.razon}»`}</dd>
                </div>
                <div className="pp-datos__fila">
                  <dt>Vigencia</dt>
                  <dd className="pp-tabla__num">
                    {(() => {
                      const v = vigencia(detalle, ahora);
                      const total = Math.round(
                        (detalle.vigenteHasta.getTime() - detalle.vigenteDesde.getTime()) / DIA_MS,
                      );
                      return detalle.estado === "vigente"
                        ? `${v.linea} · ${total} días, ${v.sub.replace("en ", "quedan ")}`
                        : `${v.linea}${v.sub ? ` · ${v.sub}` : ""}`;
                    })()}
                  </dd>
                </div>
                <div className="pp-datos__fila">
                  <dt>Generado por</dt>
                  <dd>
                    {detalle.generadoPor} ·{" "}
                    <span className="pp-tabla__num">{horaDeColombia(detalle.generadoEn)}</span>
                  </dd>
                </div>
              </dl>

              <section className="pp-seccion" aria-labelledby="ea-perfiles-titulo">
                <div className="pp-seccion__cabecera">
                  <h3 className="pp-seccion__titulo" id="ea-perfiles-titulo">
                    Perfiles <span className="pp-meta">{detalle.perfiles.length}</span>
                  </h3>
                  <span className="pp-meta">Lista fija de códigos, no un filtro</span>
                </div>
                {detalle.perfiles.length === 0 ? (
                  <p className="pp-meta">Sin selección: el cliente entra al encuadre del banco.</p>
                ) : (
                  <ul className="pp-filas ea-filas">
                    {detalle.perfiles.map((p) => (
                      <li key={p.codigo} className="pp-fila ea-fila-perfil">
                        <span className="pp-mono ea-fila__codigo">{p.codigo}</span>
                        <div className="pp-fila__principal">
                          <p className="ea-fila__nombre">{p.nombre ?? "Perfil fuera del banco"}</p>
                          {p.rol && <p className="pp-fila__sub">{p.rol}</p>}
                        </div>
                        <div className="ea-fila__lado">
                          <span className={`pp-estado ${p.banda && p.banda !== "inmediato" ? "pp-estado--neutro" : PERFIL_CLASE[p.estado]}`}>
                            {p.banda ? ROTULO_BANDA[p.banda] : PERFIL_TEXTO[p.estado]}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="pp-seccion" aria-labelledby="ea-invitados-titulo">
                <div className="pp-seccion__cabecera">
                  <h3 className="pp-seccion__titulo" id="ea-invitados-titulo">
                    Correos invitados <span className="pp-meta">{detalle.invitados.length}</span>
                  </h3>
                  <span className="pp-meta">Reenviar el enlace no da acceso</span>
                </div>
                <ul className="pp-filas ea-filas">
                  {detalle.invitados.map((c) => (
                    <li key={c} className="pp-fila">
                      <div className="pp-fila__principal">
                        <p className="ea-correo">{c}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <aside className="ea-lateral" aria-label="Revocación">
              {detalle.estado === "vigente" && puede(sesion.rol, "enlaces.revocar") ? (
                <section className="ea-revocar" id="revocar" aria-labelledby="ea-revocar-titulo">
                  <div className="pp-seccion__cabecera">
                    <h3 className="pp-seccion__titulo" id="ea-revocar-titulo">
                      Revocar enlace
                    </h3>
                  </div>
                  <p className="ea-revocar__texto">
                    Nadie vuelve a entrar, ni quien lo tiene abierto. Verán cómo pedir un enlace
                    nuevo. El registro se conserva.
                  </p>
                  <RevocarEnlace codigo={detalle.codigo} />
                </section>
              ) : detalle.estado === "revocado" ? (
                <p className="ea-revocar__texto">{`Revocado el ${horaDeColombia(detalle.revocadoEn!)}${detalle.revocadoPor ? ` por ${detalle.revocadoPor}` : ""}. Nadie puede entrar con este enlace.`}
                  {detalle.motivoRevocacion && (
                    <>
                      <br />
                      {`Motivo: ${detalle.motivoRevocacion}`}
                    </>
                  )}
                </p>
              ) : null}
            </aside>
          </div>
        </section>
      )}
    </MarcoPanel>
  );
}
