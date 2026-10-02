// Inventario (HU-125; prototipo inventario-perfiles): listado base del banco con pestañas por estado,
// búsqueda por nombre, código o rol y lo que le falta a cada borrador para publicarse. Habilita el
// destino «Inventario» del menú. La administradora selecciona filas y las publica a la vez (HU-128,
// prototipo inventario-perfiles--publicacion-masiva). Disponibilidad en la fila y en bloque, y pausar
// con motivo (HU-132, HU-133; prototipos inventario-perfiles--lote y --pausar-motivo); la observadora
// solo lee. Las contradicciones entre estado y disponibilidad se señalan en la propia fila con la acción
// que las corrige, con su pestaña (HU-134; prototipo --incoherencia); «Archivar» en «Más acciones»
// (HU-135; prototipo --archivar). Protegida: la guarda va en la primera línea.
import { Fragment } from "react";
import { puede } from "@ps/dominio/acceso/permisos";
import { bandaDeDisponibilidad } from "@ps/dominio/catalogo/banda";
import { normalizar } from "@ps/dominio/catalogo/parecidos";
import { diasCivilesDesde } from "@ps/dominio/fecha/colombia";
import { momentoDeColombia } from "@ps/dominio/fecha/colombia";
import { ETIQUETA_ESTADO, type EstadoAlmacenado } from "@ps/dominio/inventario/estados";
import { ETIQUETA_BANDA_PANEL } from "@ps/dominio/inventario/perfil";
import { listarMotivosPausa, listarVigencia } from "@ps/infra/postgres/estado-perfil";
import { listarInventario, type FilaInventario } from "@ps/infra/postgres/perfiles-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import { AccionesFila, DisponibilidadFila } from "../../src/inventario/EstadoEnLista";
import { IncoherenciaFila } from "../../src/inventario/Incoherencia";
import {
  BarraSeleccion,
  ResultadoDisponibilidadBloque,
  ResultadoPublicacion,
} from "../../src/inventario/PublicacionMasiva";
import { AtajoBuscador } from "../../src/marco/FiltroAuto";
import { AvisarTalentoHumano } from "../../src/inventario/Avisar";
import { AvisoDecision } from "../../src/marco/Hoja";
import { MarcoPanel } from "../../src/marco/MarcoPanel";
import { exigirSesion } from "../../src/sesion/exigirSesion";
import { hoyEnColombia } from "./hoy";
import "../../src/marco/marco.css";
import "./inventario.css";

const POR_PAGINA = 25;
const PESTANAS = [
  { clave: "todos", etiqueta: "Todos" },
  { clave: "publicado", etiqueta: "Publicados" },
  { clave: "borrador", etiqueta: "Borradores" },
  { clave: "pausado", etiqueta: "Pausados" },
  { clave: "archivado", etiqueta: "Archivados" },
  { clave: "incoherencia", etiqueta: "Con incoherencia" },
] as const;
type Pestana = (typeof PESTANAS)[number]["clave"];

const CLASE_ESTADO: Record<EstadoAlmacenado, string> = {
  publicado: "pp-estado--ok",
  pausado: "pp-estado--warn",
  borrador: "pp-estado--borrador",
  archivado: "pp-estado--danger",
};

const enPestana = (f: FilaInventario, p: Pestana) =>
  p === "todos"
    ? true
    : p === "incoherencia"
      ? f.coherencia !== null
      : p === "publicado"
        ? f.estado === "publicado"
        : f.estado === p;

const nombreDe = (f: FilaInventario) =>
  [f.nombre, f.primerApellido].filter(Boolean).join(" ") || "Sin nombre todavía";

function detalleEstado(f: FilaInventario, ahora: Date): string | null {
  if (f.estado === "pausado") {
    const dias = f.pausa?.desde
      ? Math.max(0, diasCivilesDesde(new Date(f.pausa.desde), ahora))
      : null;
    return [
      f.pausa?.motivo ?? "Sin motivo registrado",
      dias === null
        ? null
        : dias === 0
          ? "desde hoy"
          : `hace ${dias} ${dias === 1 ? "día" : "días"}`,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  if (f.estado !== "borrador") return null;
  if (f.faltan === 0) return "Listo para publicar";
  if (!f.consentimiento) return "Falta el consentimiento de publicación";
  return f.faltan === 1
    ? "Falta 1 condición para publicar"
    : `Faltan ${f.faltan} condiciones para publicar`;
}

export default async function Inventario({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string; pagina?: string; rechazado?: string }>;
}) {
  const sesion = await exigirSesion();
  const p = await searchParams;
  const pestana: Pestana = PESTANAS.some((x) => x.clave === p.estado)
    ? (p.estado as Pestana)
    : "todos";
  const q = (p.q ?? "").slice(0, 200);
  const bd = poolDe("panel");
  const [filas, motivos, vigencia] = await Promise.all([
    listarInventario(bd),
    listarMotivosPausa(bd),
    listarVigencia(bd),
  ]);
  const porRevisar =
    vigencia.porConfirmar.length + vigencia.porRevisar.length + vigencia.pausados.length;
  const hoy = hoyEnColombia();
  const ahora = new Date();
  const texto = normalizar(q);
  const visibles = filas
    .filter((f) => enPestana(f, pestana))
    .filter(
      (f) =>
        !texto || [nombreDe(f), f.codigo, f.rol ?? ""].some((x) => normalizar(x).includes(texto)),
    );
  const paginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA));
  const pagina = Math.min(Math.max(1, Number(p.pagina) || 1), paginas);
  const enPagina = visibles.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const publicados = filas.filter((f) => enPestana(f, "publicado")).length;
  const escribe = puede(sesion.rol, "perfil.escribir");
  const importa = puede(sesion.rol, "importacion.ejecutar");
  const url = (cambios: Record<string, string | undefined>) => {
    const s = new URLSearchParams();
    const v = { estado: pestana === "todos" ? undefined : pestana, q: q || undefined, ...cambios };
    for (const [k, x] of Object.entries(v)) if (x) s.set(k, x);
    const t = s.toString();
    return t ? `/inventario?${t}` : "/inventario";
  };

  return (
    <MarcoPanel sesion={sesion} activo="inventario" migas={["Banco de perfiles", "Inventario"]}>
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="pp-encabezado__titulo">Inventario</h1>
          <p className="pp-encabezado__meta">
            {`${publicados} ${publicados === 1 ? "publicado" : "publicados"}`}
            {porRevisar > 0 && (
              <>
                {" · "}
                <a className="pp-enlace" href="/vigencia">{`${porRevisar} por revisar vigencia`}</a>
              </>
            )}
          </p>
        </div>
        {(escribe || importa) && (
          <div className="pp-encabezado__acciones">
            {/* Prototipo inventario-perfiles: «Importar» secundario a la izquierda de «Crear perfil» */}
            {importa && (
              <a className="pp-btn pp-btn--contorno" href="/importar">
                Importar
              </a>
            )}
            {escribe && (
              <a className="pp-btn pp-btn--primario" href="/inventario/nuevo">
                Crear perfil
              </a>
            )}
          </div>
        )}
      </div>

      {!escribe && p.rechazado === "nuevo" && (
        <div className="pp-aviso pp-aviso--info ip-avisos" role="status">
          <span className="pp-aviso__icono" aria-hidden="true">
            i
          </span>
          <p>
            <span className="pp-aviso__titulo">Tu rol es de consulta.</span>
            Llegaste por la dirección para crear un perfil: no se creó nada y el intento quedó en la
            auditoría. Si un dato está desactualizado, usa «Avisar» en su fila y le llega a Talento
            Humano con el perfil identificado.
          </p>
        </div>
      )}
      {escribe && <ResultadoPublicacion />}
      {escribe && <ResultadoDisponibilidadBloque />}

      <div className="pp-barra">
        <nav className="pp-pestanas" aria-label="Filtrar por estado">
          {PESTANAS.map((t) => (
            <a
              key={t.clave}
              className={`pp-pestana${t.clave === "incoherencia" ? " ip-pestana--alerta" : ""}`}
              href={t.clave === "todos" ? "/inventario" : `/inventario?estado=${t.clave}`}
              aria-current={t.clave === pestana ? "page" : undefined}
            >
              {t.etiqueta}{" "}
              <span className="pp-pestana__conteo">
                {filas.filter((f) => enPestana(f, t.clave)).length}
              </span>
            </a>
          ))}
        </nav>
        <form className="ip-busqueda" role="search" action="/inventario">
          {pestana !== "todos" && <input type="hidden" name="estado" value={pestana} />}
          <label className="pp-buscador">
            <span className="pp-sr">Buscar en el inventario</span>
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
              id="ip-buscar"
              type="search"
              name="q"
              placeholder="Nombre, código o rol"
              defaultValue={q}
            />
            <AtajoBuscador id="ip-buscar" />
          </label>
        </form>
      </div>

      {escribe && <BarraSeleccion />}

      {enPagina.length === 0 ? (
        <div className="pp-vacio">
          <p>
            {filas.length === 0
              ? "Aún no hay perfiles en el banco."
              : "Ningún perfil coincide con la búsqueda."}
          </p>
        </div>
      ) : (
        <div
          className="pp-tabla-marco ip-marco"
          tabIndex={0}
          role="region"
          aria-label="Perfiles del inventario"
        >
          <table className={`pp-tabla ip-tabla ${escribe ? "ip-tabla--admin" : "ip-tabla--obs"}`}>
            <caption className="pp-sr">
              Perfiles del banco con su estado y su disponibilidad (el portal la muestra como banda)
            </caption>
            <thead>
              <tr>
                {escribe && (
                  <th scope="col" className="ip-col-sel">
                    <label className="ip-sel">
                      <input type="checkbox" data-ip-todos="" />
                      <span className="pp-sr">Seleccionar todos los perfiles de esta página</span>
                    </label>
                  </th>
                )}
                <th scope="col">Perfil</th>
                <th scope="col">Estado</th>
                <th scope="col">Disponibilidad</th>
                <th scope="col" className="pp-tabla__acciones">
                  {escribe ? <span className="pp-sr">Acciones</span> : "¿Dato desactualizado?"}
                </th>
              </tr>
            </thead>
            <tbody>
              {enPagina.map((f) => {
                const nombre = nombreDe(f);
                const detalle = detalleEstado(f, ahora);
                const visible = f.estado === "publicado" || f.estado === "borrador";
                const contradice =
                  f.coherencia?.clave === "pausado_con_disponibilidad"
                    ? "Contradice el estado pausado"
                    : f.coherencia?.severidad === "alta"
                      ? "Contradice su estado"
                      : undefined;
                return (
                  <Fragment key={f.codigo}>
                    <tr className={f.coherencia ? "ip-con-detalle" : undefined}>
                      {escribe && (
                        <td className="ip-col-sel">
                          <label className="ip-sel">
                            <input
                              type="checkbox"
                              name="ip-sel"
                              value={f.codigo}
                              data-nombre={nombre}
                            />
                            <span className="pp-sr">{`Seleccionar a ${nombre}`}</span>
                          </label>
                        </td>
                      )}
                      <th scope="row">
                        <a
                          className="pp-tabla__perfil pp-enlace--sutil ip-nombre"
                          href={
                            escribe
                              ? `/inventario/${f.codigo}`
                              : `/inventario/${f.codigo}?vista=ficha`
                          }
                        >
                          {nombre}
                        </a>
                        <span className="pp-tabla__sub ip-trunc">
                          {f.rol ? `${f.rol} · ` : ""}
                          <span className="pp-mono">{f.codigo}</span>
                        </span>
                      </th>
                      <td className="ip-col-estado">
                        <span className={`pp-estado ${CLASE_ESTADO[f.estado]}`}>
                          {ETIQUETA_ESTADO[f.estado]}
                        </span>
                        {detalle && <span className="pp-tabla__sub ip-trunc">{detalle}</span>}
                      </td>
                      <td className="ip-col-disp">
                        {(visible || f.estado === "pausado") && escribe ? (
                          <DisponibilidadFila
                            codigo={f.codigo}
                            nombre={nombre}
                            fecha={f.disponibilidadFecha}
                            actualizadaEn={f.disponibilidadActualizadaEn}
                            hoy={hoy}
                            contradice={contradice}
                            recargar={f.estado === "pausado"}
                          />
                        ) : visible ? (
                          <>
                            <span className="ip-disp-texto">
                              {f.disponibilidadFecha
                                ? ETIQUETA_BANDA_PANEL[
                                    bandaDeDisponibilidad(
                                      {
                                        fecha: f.disponibilidadFecha,
                                        actualizadaEn: f.disponibilidadActualizadaEn
                                          ? new Date(f.disponibilidadActualizadaEn)
                                          : null,
                                      },
                                      ahora,
                                    )
                                  ]
                                : "Sin disponibilidad"}
                            </span>
                            {f.disponibilidadActualizadaEn && (
                              <span className="pp-tabla__sub ip-trunc ip-meta-disp">
                                {`Actualizada ${momentoDeColombia(new Date(f.disponibilidadActualizadaEn), ahora)}`}
                              </span>
                            )}
                          </>
                        ) : contradice ? (
                          <span className="ip-na">{contradice}</span>
                        ) : (
                          <span className="ip-na">{`No aplica: ${ETIQUETA_ESTADO[f.estado].toLowerCase()}`}</span>
                        )}
                      </td>
                      <td className="pp-tabla__acciones ip-col-acc">
                        {escribe ? (
                          <a
                            className="pp-btn pp-btn--fantasma pp-btn--sm ip-editar"
                            href={`/inventario/${f.codigo}`}
                            aria-label={`Editar el perfil de ${nombre}`}
                          >
                            Editar
                          </a>
                        ) : (
                          <AvisarTalentoHumano codigo={f.codigo} nombre={nombre} corto />
                        )}
                        {escribe && f.estado !== "archivado" && (
                          <AccionesFila
                            codigo={f.codigo}
                            nombre={nombre}
                            rol={f.rol}
                            motivos={motivos}
                            pausar={f.estado === "publicado"}
                          />
                        )}
                      </td>
                    </tr>
                    {f.coherencia && (
                      <IncoherenciaFila
                        codigo={f.codigo}
                        nombre={nombre}
                        coherencia={f.coherencia}
                        columnas={escribe ? 5 : 4}
                        escribe={escribe}
                      />
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {visibles.length > 0 && (
        <div className="pp-paginacion">
          <span>{`${(pagina - 1) * POR_PAGINA + 1}–${(pagina - 1) * POR_PAGINA + enPagina.length} de ${visibles.length}`}</span>
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
