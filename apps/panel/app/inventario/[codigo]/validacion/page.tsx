// Borrador de la validación técnica (HU-140, HU-130 edge; prototipo borrador-evidencia sin la columna
// del artefacto, D29): lo precargado desde la modalidad de prueba con su origen, lo que escribe la
// persona (evaluador, fecha, resultado, D30) y confirmar o descartar. Sin borrador pendiente vuelve al
// perfil. Solo la administradora de inventario lo ve.
// Protegida: la guarda va en la primera línea.
import { notFound, redirect } from "next/navigation";
import { puede } from "@ps/dominio/acceso/permisos";
import { leerPerfil } from "@ps/infra/postgres/perfiles-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import { leerBorrador } from "@ps/infra/postgres/validaciones";
import { BorradorValidacion } from "../../../../src/inventario/BorradorValidacion";
import { AvisoDecision } from "../../../../src/marco/Hoja";
import { MarcoPanel } from "../../../../src/marco/MarcoPanel";
import { exigirSesion } from "../../../../src/sesion/exigirSesion";
import { hoyEnColombia } from "../../hoy";
import "../../../../src/marco/marco.css";
import "../../editor.css";
import "../../borrador.css";

export default async function Validacion({ params }: { params: Promise<{ codigo: string }> }) {
  const sesion = await exigirSesion();
  const { codigo } = await params;
  if (!/^PS-\d{4}$/.test(codigo)) notFound();
  if (!puede(sesion.rol, "perfil.escribir")) redirect(`/inventario/${codigo}`);
  const bd = poolDe("panel");
  const [perfil, borrador] = await Promise.all([leerPerfil(bd, codigo), leerBorrador(bd, codigo)]);
  if (!perfil) notFound();
  if (!borrador) redirect(`/inventario/${codigo}`);
  const nombre = [perfil.nombre, perfil.primerApellido].filter(Boolean).join(" ") || perfil.codigo;
  return (
    <MarcoPanel
      sesion={sesion}
      activo="inventario"
      migas={[{ texto: "Inventario", href: "/inventario" }, { texto: nombre, href: `/inventario/${codigo}` }, "Validación técnica"]}
    >
      <BorradorValidacion perfil={perfil} borrador={borrador} hoy={hoyEnColombia()} />
      <AvisoDecision />
    </MarcoPanel>
  );
}
