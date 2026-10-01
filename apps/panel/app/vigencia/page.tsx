// Bandeja de vigencia (HU-136, HU-133; prototipos bandeja-vigencia, --vacia y --pausado-reactivar):
// lo que el cliente ya ve «por confirmar» primero; luego los publicados sin actualizar hace más de 30
// días, del cambio más antiguo al más reciente (sin fecha registrada: «dato incompleto»); al final los
// pausados hace más de 30 días con su motivo y desde cuándo. Vacía, lo dice y anticipa quién entra.
// Los días son civiles de Bogotá (V3-4). La observadora la ve sin acciones.
// Protegida: la guarda va en la primera línea.
import { puede } from "@ps/dominio/acceso/permisos";
import { bandaDeDisponibilidad, ROTULO_BANDA } from "@ps/dominio/catalogo/banda";
import { fechaCivil } from "@ps/dominio/fecha/colombia";
import { ETIQUETA_BANDA_PANEL } from "@ps/dominio/inventario/perfil";
import type { FilaVigencia } from "@ps/dominio/inventario/vigencia";
import { listarVigencia, type PerfilEnBandeja } from "@ps/infra/postgres/estado-perfil";
import { poolDe } from "@ps/infra/postgres/pool";
import { AvisoDecision } from "../../src/marco/Hoja";
import { MarcoPanel } from "../../src/marco/MarcoPanel";
import { exigirSesion } from "../../src/sesion/exigirSesion";
import { AccionesVigencia } from "../../src/vigencia/FilaVigencia";
import { hoyEnColombia } from "../inventario/hoy";
import "../../src/marco/marco.css";
import "./vigencia.css";

const corta = (aaaammdd: string) => fechaCivil(aaaammdd).replace(/ \d{4}$/, "");

// A quién afecta: el prototipo añade «· en N enlaces activos» a la causa de un publicado vencido.
const enEnlaces = (n: number) =>
  n === 0 ? "" : ` · en ${n} ${n === 1 ? "enlace activo" : "enlaces activos"}`;

function causa(
  tipo: "por_confirmar" | "publicado" | "pausado",
  f: FilaVigencia,
  p: PerfilEnBandeja,
  hoy: string,
): string {
  return tipo === "pausado"
    ? causaSinEnlaces(tipo, f, p, hoy)
    : causaSinEnlaces(tipo, f, p, hoy) + enEnlaces(p.enlacesActivos);
}

function causaSinEnlaces(
  tipo: "por_confirmar" | "publicado" | "pausado",
  f: FilaVigencia,
  p: PerfilEnBandeja,
  hoy: string,
): string {
  if (tipo === "pausado")
    return `${p.estado === "pausado" ? "Pausado" : ""} · ${f.motivoPausa ?? "sin motivo registrado"}`;
  if (f.datoIncompleto)
    return "No tiene registrada la fecha de su última actualización: no se da por al día";
  if (!p.disponibilidadFecha) return "No tiene fecha de disponibilidad";
  if (tipo === "por_confirmar")
    return `La fecha en que quedaba libre venció el ${corta(p.disponibilidadFecha)}`;
  return p.disponibilidadFecha > hoy
    ? `Su fecha es el ${corta(p.disponibilidadFecha)}; si vence sin actualizar, el cliente verá «Por confirmar»`
    : `Su fecha (${corta(p.disponibilidadFecha)}) ya llegó: el cliente ve «Inmediato»`;
}

export default async function Vigencia() {
  const sesion = await exigirSesion();
  const escribe = puede(sesion.rol, "perfil.escribir");
  const ahora = new Date();
  const hoy = hoyEnColombia();
  const b = await listarVigencia(poolDe("panel"), ahora);
  const pendientes = b.porConfirmar.length + b.porRevisar.length;

  const fila = (tipo: "por_confirmar" | "publicado" | "pausado", f: FilaVigencia) => {
    const p = b.perfiles[f.codigo]!;
    const banda = p.disponibilidadFecha
      ? bandaDeDisponibilidad(
          {
            fecha: p.disponibilidadFecha,
            actualizadaEn: p.disponibilidadActualizadaEn
              ? new Date(p.disponibilidadActualizadaEn)
              : null,
          },
          ahora,
        )
      : null;
    const pausada = tipo === "pausado";
    const contenido = (
      <>
        <div className="bv-perfil">
          <p className="bv-nombre" id={`bv-${f.codigo}-n`}>
            <a href={`/inventario/${f.codigo}`}>{p.nombre}</a>
            <span className="bv-codigo">{f.codigo}</span>
          </p>
          <p className="bv-rol">{[p.rol, p.seniority].filter(Boolean).join(" · ") || "Sin rol"}</p>
          <p className="bv-causa">{causa(tipo, f, p, hoy)}</p>
        </div>
        <div className="bv-edad">
          {f.dias === null ? (
            <>
              <span className="pp-estado pp-estado--warn">Dato incompleto</span>
              <span className="bv-sin-fecha">sin fecha registrada</span>
            </>
          ) : (
            <>
              <span className="bv-dias">
                {`${f.dias} días`}
                <span className="bv-solo-movil">{pausada ? " pausado" : " sin actualizar"}</span>
              </span>
              <time dateTime={f.desde!}>{`desde el ${corta(f.desde!)}`}</time>
            </>
          )}
        </div>
        {pausada ? (
          <span className="pp-estado pp-estado--warn">Pausado</span>
        ) : tipo === "por_confirmar" ? (
          <span className="pp-estado pp-estado--warn">Por confirmar</span>
        ) : (
          <span className="pp-estado pp-estado--neutro">
            {banda ? ETIQUETA_BANDA_PANEL[banda] : "Sin disponibilidad"}
          </span>
        )}
      </>
    );
    if (!escribe)
      return (
        <li className="bv-fila" key={f.codigo} aria-labelledby={`bv-${f.codigo}-n`}>
          <div className="bv-rejilla">{contenido}</div>
        </li>
      );
    return (
      <AccionesVigencia
        key={f.codigo}
        tipo={
          pausada
            ? "pausado"
            : tipo === "por_confirmar"
              ? "por_confirmar"
              : f.datoIncompleto
                ? "dato_incompleto"
                : "publicado"
        }
        codigo={f.codigo}
        nombre={p.nombre}
        hoy={hoy}
        bandaActual={banda ? ROTULO_BANDA[banda] : null}
        fila={contenido}
      />
    );
  };

  const meta = b.vacia
    ? `${b.alDia} de ${b.publicados} publicados al día · meta 9 de cada 10`
    : `${pendientes + b.pausados.length} por revisar: ${pendientes} ${pendientes === 1 ? "publicado" : "publicados"} sin actualizar en más de 30 días y ${b.pausados.length} ${b.pausados.length === 1 ? "pausado" : "pausados"} hace más de 30 días · ${b.alDia} de ${b.publicados} al día, meta 9 de cada 10`;

  return (
    <MarcoPanel sesion={sesion} activo="vigencia" migas={["Banco de perfiles", "Vigencia"]}>
      <div className="bv-contenedor">
        <div className="pp-encabezado">
          <div className="pp-encabezado__texto">
            <h1 className="pp-encabezado__titulo">Bandeja de vigencia</h1>
            <p className="pp-encabezado__meta">{meta}</p>
          </div>
          <div className="pp-encabezado__acciones">
            <a className="pp-btn pp-btn--contorno" href="/inventario">
              Ver inventario
            </a>
          </div>
        </div>

        {b.vacia ? (
          <section className="pp-vacio" aria-labelledby="bv-vacio">
            <h2 id="bv-vacio">No hay perfiles pendientes de revisión</h2>
            <p>
              Ningún publicado lleva más de 30 días sin actualizar y ningún perfil lleva más de 30
              días pausado; ningún cliente ve «Disponibilidad por confirmar».
              {b.proxima && (
                <>
                  {` La próxima en entrar es ${b.proxima.nombre} (`}
                  <span className="pp-mono">{b.proxima.codigo}</span>
                  {`), el ${corta(b.proxima.entra)}, si nadie la actualiza antes.`}
                </>
              )}
            </p>
          </section>
        ) : (
          <>
            <div className="pp-filas">
              <div className="bv-rejilla bv-columnas" aria-hidden="true">
                <span>Perfil</span>
                <span>Sin actualizar</span>
                <span>En el portal</span>
                <span></span>
              </div>
              <ul className="pp-lista" aria-label="Perfiles por revisar">
                {b.porConfirmar.length > 0 && (
                  <li className="bv-grupo">
                    <h2 id="bv-g1">El cliente ya ve «Disponibilidad por confirmar»</h2>
                    <span className="bv-grupo__conteo">{b.porConfirmar.length}</span>
                  </li>
                )}
                {b.porConfirmar.map((f) => fila("por_confirmar", f))}
                {b.porRevisar.length > 0 && (
                  <li className="bv-grupo">
                    <h2 id="bv-g2">Por revisar</h2>
                    <span className="bv-grupo__conteo">{b.porRevisar.length}</span>
                    <span className="bv-grupo__orden">del cambio más antiguo al más reciente</span>
                  </li>
                )}
                {b.porRevisar.map((f) => fila("publicado", f))}
                {b.pausados.length > 0 && (
                  <li className="bv-grupo">
                    <h2 id="bv-g3">Pausados hace más de 30 días</h2>
                    <span className="bv-grupo__conteo">{b.pausados.length}</span>
                    <span className="bv-grupo__orden">no se muestran en el portal</span>
                  </li>
                )}
                {b.pausados.map((f) => fila("pausado", f))}
              </ul>
            </div>
            {escribe && (
              <p className="bv-pie">
                Guardar o confirmar saca un publicado de la bandeja; reactivar o archivar saca a un
                pausado.
              </p>
            )}
          </>
        )}
      </div>
      <AvisoDecision />
    </MarcoPanel>
  );
}
