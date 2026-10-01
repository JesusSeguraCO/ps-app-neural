// Importar perfiles (HU-088, HU-086, HU-148; prototipo importar-perfiles y variantes): exportar el
// banco o la plantilla de muestra, pegar o cargar la hoja, emparejar sus columnas (o aplicar un
// emparejamiento guardado), elegir el modo y ver la vista previa por grupos sin tocar el banco.
// Confirmar, el resultado, descargar errores y revertir son del sub-slice 4 (HU-141, HU-142, HU-087).
// Solo la administradora importa (spec §8); la observadora ve por qué no. Protegida: la guarda va en
// la primera línea.
import { puede } from "@ps/dominio/acceso/permisos";
import { CAMPOS_IMPORTACION, LIMITE_FILAS } from "@ps/contratos/importacion";
import { contarBanco, listarPlantillas } from "@ps/infra/postgres/importacion";
import { poolDe } from "@ps/infra/postgres/pool";
import { Asistente } from "../../src/importacion/Asistente";
import { MarcoPanel } from "../../src/marco/MarcoPanel";
import { exigirSesion } from "../../src/sesion/exigirSesion";
import "../../src/marco/marco.css";
import "./importar.css";

export const dynamic = "force-dynamic";

export default async function Importar() {
  const sesion = await exigirSesion();
  const migas = [{ texto: "Banco de perfiles", href: "/inventario" }, "Importar perfiles"];
  if (!puede(sesion.rol, "importacion.ejecutar"))
    return (
      <MarcoPanel sesion={sesion} activo="importar" migas={migas}>
        <div className="ip-ancho">
          <div className="pp-encabezado">
            <div className="pp-encabezado__texto">
              <h1 className="pp-encabezado__titulo">Importar perfiles</h1>
            </div>
          </div>
          <div className="pp-aviso pp-aviso--info" role="status">
            <span className="pp-aviso__icono" aria-hidden="true">
              i
            </span>
            <p>
              <span className="pp-aviso__titulo">
                Solo la administración del inventario importa.
              </span>
              Tu acceso es de consulta: puedes ver el inventario, pero no cargar ni exportar
              perfiles.
            </p>
          </div>
        </div>
      </MarcoPanel>
    );
  const bd = poolDe("panel");
  const [plantillas, total] = await Promise.all([listarPlantillas(bd), contarBanco(bd)]);
  return (
    <MarcoPanel sesion={sesion} activo="importar" migas={migas}>
      <Asistente
        totalBanco={total}
        limiteFilas={LIMITE_FILAS}
        plantillas={plantillas}
        campos={CAMPOS_IMPORTACION.map((c) => c.clave)}
      />
    </MarcoPanel>
  );
}
