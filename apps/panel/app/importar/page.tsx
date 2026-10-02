// Importar perfiles (HU-088, HU-086, HU-148, HU-141, HU-142, HU-087; prototipo importar-perfiles y
// variantes). Sin parámetros, el asistente: exportar el banco o la plantilla, pegar o cargar la hoja,
// emparejar, elegir el modo, la vista previa y confirmar. `?lote=` es el resultado de una importación
// (paso 3); `?vista=historial`, el historial; `?deshacer=`, deshacer la última (o, si no es la última,
// el historial explicando cuáles hay después). Solo la administradora importa y deshace (spec §8); la
// observadora ve el historial y los resultados. Protegida: la guarda va en la primera línea.
import { notFound } from "next/navigation";
import { z } from "zod";
import { puede } from "@ps/dominio/acceso/permisos";
import { CAMPOS_IMPORTACION, LIMITE_FILAS } from "@ps/contratos/importacion";
import {
  contarBanco,
  erroresDelLote,
  leerLote,
  listarLotes,
  listarPlantillas,
} from "@ps/infra/postgres/importacion";
import { poolDe } from "@ps/infra/postgres/pool";
import { detalleReversion } from "@ps/infra/postgres/revertir-importacion";
import { Asistente } from "../../src/importacion/Asistente";
import {
  DeshacerImportacion,
  HistorialImportaciones,
  ResultadoImportacion,
} from "../../src/importacion/Resultado";
import { MarcoPanel } from "../../src/marco/MarcoPanel";
import { exigirSesion } from "../../src/sesion/exigirSesion";
import "../../src/marco/marco.css";
import "./importar.css";

export const dynamic = "force-dynamic";

const IMPORTAR = { texto: "Importar perfiles", href: "/importar" };
const HISTORIAL = { texto: "Historial", href: "/importar?vista=historial" };
const uuid = (x: string | undefined) => {
  const r = z.uuid().safeParse(x);
  return r.success ? r.data : null;
};

export default async function Importar({
  searchParams,
}: {
  searchParams: Promise<{ lote?: string; vista?: string; deshacer?: string }>;
}) {
  const sesion = await exigirSesion();
  const q = await searchParams;
  const admin = puede(sesion.rol, "importacion.ejecutar");
  const bd = poolDe("panel");
  const banco = { texto: "Banco de perfiles", href: "/inventario" };
  const marco = (migas: Array<string | { texto: string; href: string }>, hijo: React.ReactNode) => (
    <MarcoPanel sesion={sesion} activo="importar" migas={[banco, ...migas]}>
      {hijo}
    </MarcoPanel>
  );

  if (q.lote !== undefined) {
    const id = uuid(q.lote);
    const lote = id ? await leerLote(bd, id) : null;
    if (!lote) notFound();
    const e = (await erroresDelLote(bd, lote.id))!;
    const ultima = (await listarLotes(bd)).find((l) => l.fase === "aplicado")?.id;
    return marco(
      [IMPORTAR, "Resultado"],
      <ResultadoImportacion
        inicial={{
          lote,
          errores: { filas: e.filas.length, todas: e.todas, causaComun: e.causaComun },
        }}
        esUltima={ultima === lote.id}
        puedeDeshacer={admin}
      />,
    );
  }

  if (q.deshacer !== undefined && admin) {
    const id = uuid(q.deshacer);
    const detalle = id ? await detalleReversion(bd, id) : null;
    if (!id || !detalle) notFound();
    const lotes = await listarLotes(bd);
    if (detalle.posteriores.length) {
      const ultima = lotes.find((l) => l.fase === "aplicado")!.id;
      return marco(
        [IMPORTAR, "Historial"],
        <HistorialImportaciones
          lotes={lotes}
          puedeImportar
          noUltima={{ id, archivo: detalle.archivo, posteriores: detalle.posteriores, ultima }}
        />,
      );
    }
    if (detalle.estado !== "aplicado")
      return marco([IMPORTAR, "Historial"], <HistorialImportaciones lotes={lotes} puedeImportar />);
    return marco(
      [IMPORTAR, HISTORIAL, "Deshacer"],
      <DeshacerImportacion loteId={id} detalle={detalle} />,
    );
  }

  if (q.vista === "historial" || !admin)
    return marco(
      [IMPORTAR, "Historial"],
      <>
        {!admin && (
          <div className="ip-ancho">
            <div className="pp-aviso pp-aviso--info ip-aviso-sep" role="status">
              <span className="pp-aviso__icono" aria-hidden="true">
                i
              </span>
              <p>
                <span className="pp-aviso__titulo">
                  Solo la administración del inventario importa.
                </span>
                Tu acceso es de consulta: ves el historial y el resultado de cada importación, pero
                no cargas, exportas ni deshaces.
              </p>
            </div>
          </div>
        )}
        <HistorialImportaciones lotes={await listarLotes(bd)} puedeImportar={admin} />
      </>,
    );

  const [plantillas, total] = await Promise.all([listarPlantillas(bd), contarBanco(bd)]);
  return marco(
    ["Importar perfiles"],
    <Asistente
      totalBanco={total}
      limiteFilas={LIMITE_FILAS}
      plantillas={plantillas}
      campos={CAMPOS_IMPORTACION.map((c) => c.clave)}
    />,
  );
}
