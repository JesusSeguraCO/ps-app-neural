// Ayuda de los tests: una línea de evidencia como la lee una persona («✓ Rol: …»). La UI dibuja la
// marca y el texto por separado (la marca es decorativa, el lector de pantalla oye «Cumple:»), así que
// esta composición no es código de producción.
import type { LineaEvidencia } from "../catalogo/evidencia";

export const textoDeLinea = (l: LineaEvidencia) => `${l.marca} ${l.texto}`;
