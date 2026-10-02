// Pestaña de colocados (HU-137; prototipos colocados, --registrar, --sin-fecha-liberacion y
// --en-el-portal): cada perfil colocado con su cuenta, inicio y liberación, ordenados por vencimiento,
// con los que vencen dentro de 60 días en su grupo destacado y de dónde salió el dato (el panel es la
// fuente, D8). El colocado sigue publicado: la columna dice la banda que ve el cliente. La carga del
// archivo de Operaciones (HU-150; prototipos colocados--carga-*, --diferencia-operaciones,
// --formato-no-admitido y --corte-desactualizado) deja su resultado (`?carga=`), las diferencias con
// el panel para decidir y la fecha de corte con el aviso «dato desincronizado» a los más de 7 días. La
// observadora la consulta sin registrar ni cargar. Los días son civiles de Bogotá (V3-4).
// Protegida: la guarda va en la primera línea.
import { puede } from "@ps/dominio/acceso/permisos";
import { bandaDeDisponibilidad, ROTULO_BANDA } from "@ps/dominio/catalogo/banda";
import {
  diaCortoDeColombia,
  fechaCivil,
  momentoCortoDeColombia,
  momentoDeColombia,
} from "@ps/dominio/fecha/colombia";
import { datoDesincronizado } from "@ps/contratos/operaciones";
import { proximoCambioDeBanda, tablaDeColocados } from "@ps/dominio/inventario/colocados";
import { ETIQUETA_ESTADO } from "@ps/dominio/inventario/estados";
import { ETIQUETA_BANDA_PANEL } from "@ps/dominio/inventario/perfil";
import { diasCivilesDesde } from "@ps/dominio/inventario/vigencia";
import {
  listarColocados,
  listarDiferencias,
  resumenCarga,
  ultimoCorte,
  type Colocado,
  type ResumenCarga,
} from "@ps/infra/postgres/colocados";
import { poolDe } from "@ps/infra/postgres/pool";
import { NombreColocado, RegistrarColocado } from "../../src/colocados/Colocados";
import {
  BotonCargar,
  CargaOperaciones,
  DecidirDiferencia,
  LugarAvisos,
} from "../../src/colocados/Operaciones";
import { AvisoDecision } from "../../src/marco/Hoja";
import { MarcoPanel } from "../../src/marco/MarcoPanel";
import { exigirSesion } from "../../src/sesion/exigirSesion";
import { hoyEnColombia } from "../inventario/hoy";
import "../../src/marco/marco.css";
import "./colocados.css";

const corta = (aaaammdd: string) => fechaCivil(aaaammdd).replace(/ \d{4}$/, "");
const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

function bandaDe(
  d: { disponibilidadFecha: string | null; disponibilidadActualizadaEn: string | null },
  ahora: Date,
) {
  return bandaDeDisponibilidad(
    {
      fecha: d.disponibilidadFecha,
      actualizadaEn: d.disponibilidadActualizadaEn ? new Date(d.disponibilidadActualizadaEn) : null,
    },
    ahora,
  );
}

// El corte de una fila: con la hora si es de hoy («hoy 10:14»), si no solo el día («29 sep»).
function corteDeFila(corte: Date, ahora: Date): string {
  const m = momentoCortoDeColombia(corte, ahora);
  return m.startsWith("hoy ") ? m : diaCortoDeColombia(corte);
}

// De dónde salió el dato: en la fila (corto) y en la hoja (con fecha). Lo recién traído por la carga
// más reciente lleva «· nuevo» (prototipo colocados--carga-operaciones).
function fuente(c: Colocado, ahora: Date): { fila: string; hoja: string } {
  const registrada = fechaCivil(c.registradoEn.slice(0, 10));
  switch (c.fuente) {
    case "panel":
      return {
        fila: `Panel · ${c.registradoPor ?? "sin autor"}`,
        hoja: `Registrada en el panel por ${c.registradoPor ?? "sin autor"} · ${registrada}`,
      };
    case "operaciones": {
      const corte = c.corte ? corteDeFila(new Date(c.corte), ahora) : "sin fecha";
      return {
        fila: `Operaciones · corte ${corte}${c.nuevo ? " · nuevo" : ""}`,
        hoja: `Cargada de Operaciones · corte ${corte}`,
      };
    }
    case "migracion":
      return {
        fila: "Migración del antiguo estado «colocado»",
        hoja: `Migrada del antiguo estado «colocado» · ${registrada}`,
      };
    default:
      return { fila: "Datos de prueba", hoja: `Datos de prueba · ${registrada}` };
  }
}

const unir = (partes: string[]) =>
  partes.length <= 1 ? (partes[0] ?? "") : `${partes.slice(0, -1).join(", ")} y ${partes.at(-1)}`;

// Lo que dejó la carga (prototipos colocados--carga-operaciones y --carga-filas-con-error).
function AvisoCarga({ r }: { r: ResumenCarga }) {
  const partes = [
    ...(r.nuevos ? [plural(r.nuevos, "colocado nuevo", "colocados nuevos")] : []),
    ...(r.venian
      ? [`${r.venian} que ya ${r.venian === 1 ? "venía" : "venían"} de la carga anterior`]
      : []),
    ...(r.iguales
      ? [`${r.iguales} ${r.iguales === 1 ? "igual" : "iguales"} a lo registrado en el panel`]
      : []),
    ...(r.diferencias
      ? [`${plural(r.diferencias, "diferencia", "diferencias")} con el panel para que decidas`]
      : []),
  ];
  const ignoradas = r.ignoradas.length
    ? ` ${r.ignoradas.length === 1 ? "Se ignoró la columna" : "Se ignoraron las columnas"} ${r.ignoradas.map((c) => `«${c}»`).join(", ")}: solo se leen código, cliente, fecha de inicio y fecha de liberación.`
    : "";
  const resumen = partes.length ? `${unir(partes)}.` : "";
  if (!r.errores.length)
    return (
      <div className="pp-aviso pp-aviso--ok cl-aviso" role="status">
        <span className="pp-aviso__icono" aria-hidden="true">
          ✓
        </span>
        <p>
          <span className="pp-aviso__titulo">{`Carga aplicada: ${plural(r.aplicadas, "fila", "filas")} de ${r.archivo}.`}</span>
          {`${resumen} La fecha de corte es el momento de esta carga.${ignoradas}`}
        </p>
      </div>
    );
  const titulo = r.aplicadas
    ? `Se aplicaron ${r.aplicadas} de ${r.filas} filas de ${r.archivo}.`
    : `No se aplicó ninguna de las ${r.filas} filas de ${r.archivo}.`;
  return (
    <div className="pp-aviso pp-aviso--warn cl-aviso" role="status">
      <span className="pp-aviso__icono" aria-hidden="true">
        !
      </span>
      <p>
        <span className="pp-aviso__titulo">{titulo}</span>
        {`${r.errores.length === 1 ? "La fila de abajo no se aplicó." : `Las ${r.errores.length} filas de abajo no se aplicaron.`} Corrígelas en el archivo y vuelve a cargarlo; las que ya entraron no se duplican.${resumen ? ` ${resumen}` : ""}${ignoradas}`}
      </p>
    </div>
  );
}

export default async function Colocados({
  searchParams,
}: {
  searchParams: Promise<{ carga?: string }>;
}) {
  const sesion = await exigirSesion();
  const escribe = puede(sesion.rol, "colocados.escribir");
  const ahora = new Date();
  const hoy = hoyEnColombia();
  const bd = poolDe("panel");
  const { carga } = await searchParams;
  const [{ colocados, candidatos }, corte, diferencias, resultado] = await Promise.all([
    listarColocados(bd),
    ultimoCorte(bd),
    listarDiferencias(bd),
    carga && /^[0-9a-f-]{36}$/.test(carga) ? resumenCarga(bd, carga) : Promise.resolve(null),
  ]);
  const t = tablaDeColocados(colocados, hoy);
  const desincronizado = corte !== null && datoDesincronizado(corte, ahora);
  const corteTexto = corte ? momentoDeColombia(corte, ahora) : null;

  const cuentas = new Set(colocados.map((c) => c.cuenta)).size;
  const porFuente = (f: Colocado["fuente"]) => colocados.filter((c) => c.fuente === f).length;
  const meta = [
    `${plural(colocados.length, "colocado", "colocados")} en ${plural(cuentas, "cuenta", "cuentas")}`,
    `${porFuente("panel")} ${porFuente("panel") === 1 ? "registrado" : "registrados"} en el panel`,
    ...(porFuente("operaciones") ? [`${porFuente("operaciones")} de la carga de Operaciones`] : []),
    ...(porFuente("migracion") ? [`${porFuente("migracion")} de la migración`] : []),
  ].join(" · ");

  const fila = (c: Colocado & { faltan: number }, pronto: boolean) => {
    const f = fuente(c, ahora);
    const banda = ROTULO_BANDA[bandaDe(c, ahora)];
    const despues = c.disponibilidadFecha ? proximoCambioDeBanda(c.disponibilidadFecha, hoy) : null;
    const rolSeniority = [c.rol, c.seniority].filter(Boolean).join(" · ") || "Sin rol";
    return (
      <tr key={c.codigo}>
        <th scope="row">
          <NombreColocado
            colocado={{
              codigo: c.codigo,
              nombre: c.nombre,
              rolSeniority,
              rol: c.rol,
              cuenta: c.cuenta,
              inicio: c.inicio,
              liberacion: c.liberacion,
              faltan: c.faltan,
              pronto,
              origen: f.hoja,
              estado: ETIQUETA_ESTADO[c.estado],
              disponibilidadFecha: c.disponibilidadFecha,
              bandaPortal: banda,
              despues: despues && { desde: despues.desde, banda: ROTULO_BANDA[despues.banda] },
            }}
          />
          <span className="cl-codigo">{c.codigo}</span>
          <span className="pp-tabla__sub">{rolSeniority}</span>
        </th>
        <td className="cl-col-cuenta">
          <span className="cl-cuenta">{c.cuenta}</span>
          <span className="pp-tabla__sub cl-fuente">
            {f.fila}
            {c.diferencia && (
              <>
                {" · "}
                <span className="cl-atraso">diferencia con Operaciones</span>
              </>
            )}
          </span>
        </td>
        <td className="cl-col-inicio pp-tabla__num">
          {c.inicio ? (
            <time className="cl-fecha" dateTime={c.inicio}>
              {fechaCivil(c.inicio)}
            </time>
          ) : (
            <span className="cl-fecha">Sin registrar</span>
          )}
        </td>
        <td className="cl-col-vence pp-tabla__num">
          <time className="cl-fecha" dateTime={c.liberacion}>
            {fechaCivil(c.liberacion)}
          </time>
        </td>
        <td className="cl-col-faltan pp-tabla__num cl-der">
          <span className={`cl-faltan${pronto ? " cl-faltan--pronto" : ""}`}>
            {plural(c.faltan, "día", "días")}
          </span>
        </td>
        <td className="cl-col-banda">
          <span className="cl-banda">{banda}</span>
        </td>
        <td className="cl-chev" aria-hidden="true">
          <svg className="pp-icono" viewBox="0 0 24 24">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </td>
      </tr>
    );
  };

  return (
    <MarcoPanel sesion={sesion} activo="colocados" migas={["Clientes", "Colocados"]}>
      <div className="cl-contenedor">
        <div className="pp-encabezado">
          <div className="pp-encabezado__texto">
            <div className="cl-titulo">
              <h1 className="pp-encabezado__titulo">Colocados</h1>
            </div>
            <p className="pp-encabezado__meta">
              {meta}
              {corte && (
                <>
                  {" · corte "}
                  <time dateTime={corte.toISOString()}>{corteTexto}</time>
                  {desincronizado && (
                    <>
                      {" · "}
                      <span className="cl-atraso">dato desincronizado</span>
                    </>
                  )}
                </>
              )}
            </p>
          </div>
          {escribe && (
            <div className="pp-encabezado__acciones">
              <CargaOperaciones corte={corteTexto} />
              <RegistrarColocado
                hoy={hoy}
                candidatos={candidatos.map((c) => ({
                  codigo: c.codigo,
                  nombre: c.nombre,
                  bandaPanel: c.disponibilidadFecha
                    ? ETIQUETA_BANDA_PANEL[bandaDe(c, ahora)]
                    : "Sin disponibilidad",
                }))}
              />
            </div>
          )}
        </div>

        <LugarAvisos />
        {resultado && <AvisoCarga r={resultado} />}
        {resultado && resultado.errores.length > 0 && (
          <section className="cl-grupo-extra" aria-labelledby="cl-err-t">
            <div className="pp-seccion__cabecera">
              <h2 className="pp-seccion__titulo" id="cl-err-t">
                Filas que no se aplicaron
              </h2>
              <span className="pp-meta">{resultado.errores.length}</span>
            </div>
            <ul className="pp-filas" aria-labelledby="cl-err-t">
              {resultado.errores.map((e) => (
                <li className="pp-fila" key={e.numero}>
                  <div className="pp-fila__principal">
                    <p className="pp-fila__titulo">
                      <span>{`Fila ${e.numero}`}</span>
                      {e.codigo && <span className="pp-mono pp-meta">{e.codigo}</span>}
                    </p>
                    <p className="pp-fila__nota">{e.motivo}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
        {desincronizado && corte && (
          <div className="pp-aviso pp-aviso--warn cl-aviso" role="status">
            <span className="pp-aviso__icono" aria-hidden="true">
              !
            </span>
            <p>
              <span className="pp-aviso__titulo">Dato desincronizado.</span>
              {`La última carga de Operaciones es del ${diaCortoDeColombia(corte)}: hace ${diasCivilesDesde(corte, ahora)} días sin una nueva. ${porFuente("operaciones") === 1 ? "Su colocado sigue" : `Sus ${porFuente("operaciones")} colocados siguen`} a la vista; antes de hablar con una cuenta, confirma sus fechas o carga el archivo nuevo.`}
            </p>
            {escribe && (
              <BotonCargar
                texto="Cargar archivo"
                clase="pp-btn pp-btn--contorno pp-btn--sm pp-aviso__accion"
              />
            )}
          </div>
        )}
        {diferencias.length > 0 && (
          <section className="cl-grupo-extra" aria-labelledby="cl-dif-t">
            <div className="pp-seccion__cabecera">
              <h2 className="pp-seccion__titulo" id="cl-dif-t">
                Diferencias con Operaciones
              </h2>
              <span className="pp-meta">{`${diferencias.length} · gana el panel hasta que decidas`}</span>
            </div>
            <ul className="pp-filas" aria-labelledby="cl-dif-t">
              {diferencias.map((d) => {
                const campos = (
                  [
                    ["Cliente", d.panel.cuenta, d.operaciones.cuenta],
                    [
                      "Inicio",
                      d.panel.inicio ? fechaCivil(d.panel.inicio) : "sin registrar",
                      fechaCivil(d.operaciones.inicio),
                    ],
                    [
                      "Liberación",
                      fechaCivil(d.panel.liberacion),
                      fechaCivil(d.operaciones.liberacion),
                    ],
                  ] as const
                ).filter(([, a, b]) => a !== b);
                return (
                  <li className="pp-fila" key={d.id}>
                    <div className="pp-fila__principal">
                      <p className="pp-fila__titulo">
                        <span>{d.nombre}</span>
                        <span className="pp-mono pp-meta">{d.codigo}</span>
                      </p>
                      <p className="pp-fila__meta">
                        {`${d.panel.cuenta} · fila ${d.numeroFila} del archivo · carga de ${momentoDeColombia(new Date(d.cargadoEn), ahora)}`}
                      </p>
                      <dl className="cl-valores">
                        <div>
                          <dt>{`En el panel${d.panel.registradoPor ? ` · ${d.panel.registradoPor}` : ""}`}</dt>
                          <dd>{campos.map(([n, a]) => `${n} ${a}`).join(" · ")}</dd>
                        </div>
                        <div>
                          <dt>En Operaciones</dt>
                          <dd>{campos.map(([n, , b]) => `${n} ${b}`).join(" · ")}</dd>
                        </div>
                      </dl>
                    </div>
                    {escribe && <DecidirDiferencia id={d.id} nombre={d.nombre} />}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {colocados.length === 0 ? (
          <section className="pp-vacio" aria-labelledby="cl-vacio">
            <h2 id="cl-vacio">Ningún perfil está colocado</h2>
            <p>
              {escribe
                ? "Cuando un perfil publicado quede asignado a una cuenta, regístralo aquí con el cliente y la fecha de liberación: sigue publicado y el cliente ve cuándo arranca."
                : "Cuando Talento Humano registre un perfil asignado a una cuenta, aparecerá aquí con su fecha de liberación."}
            </p>
          </section>
        ) : (
          <>
            <div
              className="pp-tabla-marco cl-marco"
              role="region"
              aria-label="Perfiles colocados y sus vencimientos"
            >
              <table className="pp-tabla cl-tabla">
                <caption className="pp-sr">
                  Perfiles colocados ordenados por vencimiento de la asignación; primero los que
                  vencen dentro de 60 días. El panel es la fuente.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Perfil</th>
                    <th scope="col" className="cl-col-cuenta">
                      Cuenta
                    </th>
                    <th scope="col" className="cl-col-inicio">
                      Inicio
                    </th>
                    <th scope="col">Vence</th>
                    <th scope="col" className="cl-der">
                      Faltan
                    </th>
                    <th scope="col">Banda en el portal</th>
                    <th scope="col">
                      <span className="pp-sr">Abrir</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {t.pronto.length > 0 && (
                    <tr className="cl-grupo">
                      <th scope="rowgroup" colSpan={7}>
                        Vencen en los próximos 60 días{" "}
                        <span>{`· ${t.pronto.length} · hasta el ${corta(t.limitePronto)}`}</span>
                      </th>
                    </tr>
                  )}
                  {t.pronto.map((c) => fila(c, true))}
                  {t.despues.length > 0 && (
                    <tr className="cl-grupo">
                      <th scope="rowgroup" colSpan={7}>
                        Después de 60 días <span>{`· ${t.despues.length}`}</span>
                      </th>
                    </tr>
                  )}
                  {t.despues.map((c) => fila(c, false))}
                </tbody>
              </table>
            </div>
            <p className="cl-pie">
              El panel es la fuente: una fila de Operaciones nunca pisa un colocado registrado aquí.
              El cliente ve la banda, nunca la fecha ni la cuenta.
            </p>
          </>
        )}
      </div>
      <AvisoDecision />
    </MarcoPanel>
  );
}
