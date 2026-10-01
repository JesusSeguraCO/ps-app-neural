// Registro de auditoría del perfil (HU-138; prototipos auditoria-perfil y auditoria-perfil--archivado): qué
// campo cambió, el valor anterior y el nuevo, quién y cuándo, del más reciente al más antiguo; los cambios
// de consentimiento y de estado igual que los de contenido. Lo que entró por una importación o una carga
// de Operaciones lleva su proceso, su persona y el enlace al lote o a la carga con su fecha de corte. Un
// perfil archivado muestra su historial completo. Ambos roles lo consultan (se descifra aquí, en el
// servidor). Filtros por la dirección (`?campo=&quien=&periodo=&pagina=`), sin JavaScript.
// Protegida: la guarda va en la primera línea.
import { notFound } from "next/navigation";
import { puede } from "@ps/dominio/acceso/permisos";
import {
  ETIQUETA_GRUPO,
  FILTRO_QUIEN,
  filtrarRegistro,
  leerFiltros,
  paginar,
  type FiltrosRegistro,
} from "@ps/dominio/auditoria/registro";
import { ETIQUETA_ESTADO } from "@ps/dominio/inventario/estados";
import { fechaDeColombia, horaDeColombia } from "@ps/dominio/fecha/colombia";
import { poolDe } from "@ps/infra/postgres/pool";
import {
  cabeceraRegistro,
  leerRegistroPerfil,
  type FilaRegistro,
} from "@ps/infra/postgres/registro-perfil";
import { clavesAuditoria } from "../../../../src/inventario/api";
import { MarcoPanel } from "../../../../src/marco/MarcoPanel";
import { exigirSesion } from "../../../../src/sesion/exigirSesion";
import "../../../../src/marco/marco.css";
import "../../auditoria.css";

export const dynamic = "force-dynamic";

const iniciales = (correo: string) =>
  correo
    .split("@")[0]!
    .split(/[._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

// Iconos del prototipo: lote (descarga), carga de Operaciones (sincronizar), otro proceso (reloj).
const ICONO: Record<string, string> = {
  importacion: "M12 4v11M7 10l5 5 5-5M5 20h14",
  carga: "M4 12a8 8 0 0 1 14-5l2 2M20 4v5h-5M20 12a8 8 0 0 1-14 5l-2-2M4 20v-5h5",
  proceso: "M12 8v4l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
};

function Valor({ texto, antes }: { texto: string | null; antes?: boolean }) {
  if (texto === null) return <span className="au-vacio">Sin valor</span>;
  return antes ? <s className="au-antes">{texto}</s> : <>{texto}</>;
}

function Quien({ f }: { f: FilaRegistro }) {
  const { quien } = f;
  return (
    <div className="au-quien">
      {quien.tipo === "persona" ? (
        <span className="pp-avatar" aria-hidden="true">
          {iniciales(f.actor)}
        </span>
      ) : (
        <span className="au-proceso" aria-hidden="true">
          <svg className="pp-icono pp-icono--sm" viewBox="0 0 24 24">
            <path d={ICONO[quien.tipo]} />
          </svg>
        </span>
      )}
      <span className="au-quien__texto">
        <span className="pp-tabla__perfil">
          {quien.enlace ? (
            <a className="pp-enlace" href={quien.enlace}>
              {quien.titulo}
            </a>
          ) : (
            quien.titulo
          )}
        </span>
        {quien.detalle && <span className="pp-tabla__sub">{quien.detalle}</span>}
      </span>
    </div>
  );
}

function enlace(codigo: string, f: FiltrosRegistro, pagina: number) {
  const q = new URLSearchParams();
  if (f.grupo) q.set("campo", f.grupo);
  if (f.quien !== "todos") q.set("quien", f.quien);
  if (f.periodo !== "todo") q.set("periodo", f.periodo);
  if (pagina > 1) q.set("pagina", String(pagina));
  const s = q.toString();
  return `/inventario/${codigo}/auditoria${s ? `?${s}` : ""}`;
}

export default async function RegistroAuditoria({
  params,
  searchParams,
}: {
  params: Promise<{ codigo: string }>;
  searchParams: Promise<{ campo?: string; quien?: string; periodo?: string; pagina?: string }>;
}) {
  const sesion = await exigirSesion();
  const { codigo } = await params;
  if (!/^PS-\d{4}$/.test(codigo)) notFound();
  const q = await searchParams;
  const bd = poolDe("panel");
  const cabecera = await cabeceraRegistro(bd, codigo);
  if (!cabecera) notFound();
  const todas = await leerRegistroPerfil(bd, clavesAuditoria().kek, codigo);
  const ahora = new Date();
  const filtros = leerFiltros(q);
  const visibles = filtrarRegistro(todas, filtros, ahora);
  const pagina = paginar(visibles, Number(q.pagina ?? 1));
  const escribe = puede(sesion.rol, "perfil.escribir");
  const nombre =
    [cabecera.nombre, cabecera.primerApellido].filter(Boolean).join(" ") || cabecera.codigo;
  const archivado = cabecera.estado === "archivado";
  // La observadora consulta el perfil en la vista de la ficha (HU-124): la de edición registra el intento.
  const datos = escribe ? `/inventario/${codigo}` : `/inventario/${codigo}?vista=ficha`;
  const creacion = todas.at(-1);

  return (
    <MarcoPanel
      sesion={sesion}
      activo="inventario"
      migas={[
        { texto: "Inventario", href: "/inventario" },
        { texto: nombre, href: datos },
        "Registro de auditoría",
      ]}
    >
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="pp-encabezado__titulo">{nombre}</h1>
          <p className="pp-encabezado__meta au-encabezado-meta">
            {cabecera.rol && (
              <>
                {cabecera.rol}
                <span className="au-sep" aria-hidden="true">
                  ·
                </span>
              </>
            )}
            <span className="pp-mono">{cabecera.codigo}</span>
            <span className="au-sep" aria-hidden="true">
              ·
            </span>
            {archivado ? (
              <>
                <span className="pp-estado pp-estado--danger">
                  {cabecera.archivadoEn
                    ? `Archivado el ${fechaDeColombia(new Date(cabecera.archivadoEn))}`
                    : "Archivado"}
                </span>
                <span className="au-sep" aria-hidden="true">
                  ·
                </span>
                no aparece en el portal
              </>
            ) : (
              <span
                className={`pp-estado ${cabecera.estado === "publicado" ? "pp-estado--ok" : "pp-estado--neutro"}`}
              >
                {ETIQUETA_ESTADO[cabecera.estado]}
              </span>
            )}
          </p>
        </div>
        {escribe && !archivado && (
          <div className="pp-encabezado__acciones">
            <a className="pp-btn pp-btn--primario" href={`/inventario/${codigo}`}>
              Editar perfil
            </a>
          </div>
        )}
      </div>
      <nav className="pp-pestanas au-pestanas" aria-label="Secciones del perfil">
        <a className="pp-pestana" href={datos}>
          Datos del perfil
        </a>
        <a className="pp-pestana" href={`/inventario/${codigo}/auditoria`} aria-current="page">
          Registro de auditoría <span className="pp-pestana__conteo">{todas.length}</span>
        </a>
      </nav>

      <section aria-labelledby="au-cambios-t">
        <h2 className="pp-sr" id="au-cambios-t">
          Cambios del perfil
        </h2>
        <form className="au-filtros" method="get" aria-label="Filtrar el registro">
          <div className="pp-select">
            <label className="pp-sr" htmlFor="au-f-campo">
              Campo
            </label>
            <select
              className="pp-input"
              id="au-f-campo"
              name="campo"
              defaultValue={filtros.grupo ?? ""}
            >
              <option value="">Todos los campos</option>
              {Object.entries(ETIQUETA_GRUPO).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="pp-select">
            <label className="pp-sr" htmlFor="au-f-quien">
              Quién
            </label>
            <select className="pp-input" id="au-f-quien" name="quien" defaultValue={filtros.quien}>
              {Object.entries(FILTRO_QUIEN).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="pp-select">
            <label className="pp-sr" htmlFor="au-f-periodo">
              Periodo
            </label>
            <select
              className="pp-input"
              id="au-f-periodo"
              name="periodo"
              defaultValue={filtros.periodo}
            >
              <option value="todo">
                {creacion
                  ? `Desde la creación · ${fechaDeColombia(new Date(creacion.cuando))}`
                  : "Desde la creación"}
              </option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
            </select>
          </div>
          <button type="submit" className="pp-btn pp-btn--contorno pp-btn--sm">
            Filtrar
          </button>
          <span className="pp-meta au-orden">Más reciente primero</span>
        </form>

        {pagina.filas.length === 0 ? (
          <p className="pp-meta">
            {todas.length === 0
              ? "Este perfil aún no tiene cambios registrados."
              : "Ningún cambio coincide con estos filtros."}
          </p>
        ) : (
          <div
            className="pp-tabla-marco au-marco"
            tabIndex={0}
            role="region"
            aria-label={`Cambios del perfil ${codigo}`}
          >
            <table className="pp-tabla au-tabla">
              <caption className="pp-sr">
                {`Registro de auditoría del perfil ${codigo}, del más reciente al más antiguo`}
              </caption>
              <colgroup>
                <col className="au-c-cuando" />
                <col className="au-c-campo" />
                <col className="au-c-antes" />
                <col className="au-c-despues" />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">Cuándo</th>
                  <th scope="col">Campo</th>
                  <th scope="col">Antes</th>
                  <th scope="col">Después</th>
                  <th scope="col">Quién</th>
                </tr>
              </thead>
              <tbody>
                {pagina.filas.map((f) => (
                  <tr key={f.seq}>
                    <td className="au-td-cuando">
                      <time className="au-cuando" dateTime={f.cuando}>
                        {horaDeColombia(new Date(f.cuando))}
                      </time>
                    </td>
                    <th scope="row" className="au-td-campo">
                      <span className="pp-tabla__perfil">{f.etiqueta}</span>
                      {/* Como el prototipo: sin repetir el grupo cuando el campo ya lo nombra. */}
                      {!f.etiqueta.startsWith(ETIQUETA_GRUPO[f.grupo]) && (
                        <span className="pp-tabla__sub">{ETIQUETA_GRUPO[f.grupo]}</span>
                      )}
                    </th>
                    <td className="au-td-antes">
                      {f.suprimido ? (
                        <span className="au-vacio">Dato suprimido</span>
                      ) : (
                        <Valor texto={f.antes} antes />
                      )}
                    </td>
                    <td className="au-td-despues au-despues">
                      {f.suprimido ? (
                        <span className="au-vacio">Dato suprimido</span>
                      ) : (
                        <Valor texto={f.despues} />
                      )}
                    </td>
                    <td className="au-td-quien">
                      <Quien f={f} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {visibles.length > 0 && (
          <div className="pp-paginacion au-paginacion">
            <span>{`${pagina.desde + 1}–${pagina.desde + pagina.filas.length} de ${visibles.length}`}</span>
            <div>
              {pagina.pagina > 1 ? (
                <a
                  className="pp-btn pp-btn--contorno pp-btn--sm"
                  href={enlace(codigo, filtros, pagina.pagina - 1)}
                >
                  Anterior
                </a>
              ) : (
                <button type="button" className="pp-btn pp-btn--contorno pp-btn--sm" disabled>
                  Anterior
                </button>
              )}
              {pagina.pagina < pagina.paginas ? (
                <a
                  className="pp-btn pp-btn--contorno pp-btn--sm"
                  href={enlace(codigo, filtros, pagina.pagina + 1)}
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
    </MarcoPanel>
  );
}
