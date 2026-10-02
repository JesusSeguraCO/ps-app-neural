// Copy visible de la ficha (EP-003; D73): centralizado para que la revisión de copy con Mercadeo cambie
// los textos sin tocar la mecánica ni los escenarios. MARCADO PARA REVISIÓN DE COPY (opción del
// prototipo/PRD mientras tanto).
export const COPY_FICHA = {
  // HU-155: resultado publicado de la validación técnica (B.8.2: nunca un puntaje).
  validacionResultado: "Cumple el estándar",
  // HU-155 · edge (B.8.4): el artefacto no se publica; se revisa en la alineación.
  validacionAlineacion: "La evidencia de la validación puede revisarse en la sesión de alineación con Trycore.",
  // HU-157: representación comercial (RF-3.3, RF-3.3.1); idéntico para todo vínculo.
  contactoTitulo: "Conversación con Trycore",
  contactoConversacion: "La conversación sobre este profesional va por Trycore.",
  contactoRespaldo: "Trycore responde por este perfil y lo pone a tu disposición.",
  contactoSinViaDirecta: "Este portal no tiene una vía de contacto directo con el profesional.",
} as const;
