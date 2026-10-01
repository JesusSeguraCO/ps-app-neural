// Pestaña de colocados (HU-137; prototipos colocados, --registrar, --sin-fecha-liberacion y
// --en-el-portal): cada perfil colocado con su cuenta, inicio y liberación, ordenados por vencimiento,
// con los que vencen dentro de 60 días en su grupo destacado y de dónde salió el dato (el panel es la
// fuente, D8). El colocado sigue publicado: la columna dice la banda que ve el cliente. La observadora
// la consulta sin registrar. Los días son civiles de Bogotá (V3-4).
// Protegida: la guarda va en la primera línea.
import { puede } from "@ps/dominio/acceso/permisos";
import { bandaDeDisponibilidad, ROTULO_BANDA } from "@ps/dominio/catalogo/banda";
import { diaCortoDeColombia, fechaCivil } from "@ps/dominio/fecha/colombia";
import { proximoCambioDeBanda, tablaDeColocados } from "@ps/dominio/inventario/colocados";
import { ETIQUETA_ESTADO } from "@ps/dominio/inventario/estados";
import { ETIQUETA_BANDA_PANEL } from "@ps/dominio/inventario/perfil";
import { listarColocados, type Colocado } from "@ps/infra/postgres/colocados";
import { poolDe } from "@ps/infra/postgres/pool";
import { NombreColocado, RegistrarColocado } from "../../src/colocados/Colocados";
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

// De dónde salió el dato: en la fila (corto) y en la hoja (con fecha).
function fuente(c: Colocado): { fila: string; hoja: string } {
  const registrada = fechaCivil(c.registradoEn.slice(0, 10));
  switch (c.fuente) {
    case "panel":
      return {
        fila: `Panel · ${c.registradoPor ?? "sin autor"}`,
        hoja: `Registrada en el panel por ${c.registradoPor ?? "sin autor"} · ${registrada}`,
      };
    case "operaciones": {
      const corte = c.corte ? diaCortoDeColombia(new Date(c.corte)) : "sin fecha";
      return {
        fila: `Operaciones · corte ${corte}`,
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

export default async function Colocados() {
  const sesion = await exigirSesion();
  const escribe = puede(sesion.rol, "colocados.escribir");
  const ahora = new Date();
  const hoy = hoyEnColombia();
  const { colocados, candidatos } = await listarColocados(poolDe("panel"));
  const t = tablaDeColocados(colocados, hoy);

  const cuentas = new Set(colocados.map((c) => c.cuenta)).size;
  const porFuente = (f: Colocado["fuente"]) => colocados.filter((c) => c.fuente === f).length;
  const meta = [
    `${plural(colocados.length, "colocado", "colocados")} en ${plural(cuentas, "cuenta", "cuentas")}`,
    `${porFuente("panel")} ${porFuente("panel") === 1 ? "registrado" : "registrados"} en el panel`,
    ...(porFuente("operaciones") ? [`${porFuente("operaciones")} de la carga de Operaciones`] : []),
    ...(porFuente("migracion") ? [`${porFuente("migracion")} de la migración`] : []),
  ].join(" · ");

  const fila = (c: Colocado & { faltan: number }, pronto: boolean) => {
    const f = fuente(c);
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
          <span className="pp-tabla__sub cl-fuente">{f.fila}</span>
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
            <p className="pp-encabezado__meta">{meta}</p>
          </div>
          {escribe && (
            <div className="pp-encabezado__acciones">
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
              El panel es la fuente: lo registrado aquí manda. El cliente ve la banda, nunca la
              fecha ni la cuenta.
            </p>
          </>
        )}
      </div>
      <AvisoDecision />
    </MarcoPanel>
  );
}
