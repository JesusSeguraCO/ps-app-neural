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
  // HU-156 (B.1): las competencias del Sello Personal salen de la evaluación DISC; nunca su resultado.
  discCompetencias: "Sello Personal",
  // HU-158: cierre de la ficha. Condiciones operativas (RF-14.5), SLA visible en el tamaño del texto
  // (RF-6.2) y garantía Neural Speed como forma de operar del servicio, igual para todo perfil (RF-6.5).
  condicionesTitulo: "Condiciones de trabajo",
  servicioTitulo: "El servicio de Trycore",
  servicioSla: "Trycore responde a tu solicitud en 10 días hábiles.",
  servicioGarantia:
    "Garantía Neural Speed: en Trycore, el talento que entra a tu proyecto trabaja con agentes de IA desde el día 1 y con línea directa al CoE. Es nuestra forma de operar, la misma para todos los perfiles.",
  // HU-158 (RF-3.5, D73): el código para citar, al pie, con el recordatorio del estándar.
  referencia: (codigo: string) =>
    `Referencia interna ${codigo}. Todos los perfiles que publicamos pasan por nuestro estándar Neural-Grid™.`,
} as const;

// Encabezado del estándar y bloque de respaldo del servicio (HU-159; RF-6.1–6.4, B.6, D64, D73). Las frases
// «ninguno»/descriptiva y las cuatro dimensiones viven en el dominio (`@ps/dominio/catalogo/estandar`) junto a
// la regla que las elige. MARCADO PARA REVISIÓN DE COPY con Mercadeo y validación de Comercial (RF-14.4).
export const COPY_ESTANDAR = {
  antetitulo: "Antes de ver los perfiles",
  titulo: "El estándar Neural-Grid",
  introduccion:
    "Lo que Trycore verificó de todos los perfiles, para que evalúes a cada persona por lo que la diferencia. Son cuatro dimensiones: tres condiciones de entrada y Neural Speed, la garantía del servicio.",
  respaldoTitulo: "Lo que respalda el servicio",
  respaldo: [
    {
      nombre: "Trycore University",
      texto: "Formación continua del talento en las prácticas y herramientas con las que trabaja Trycore.",
    },
    {
      nombre: "Hive Mind",
      texto: "La comunidad técnica de Trycore: lo que aprende un proyecto queda disponible para el siguiente.",
    },
    {
      nombre: "Coordinación de Servicio dedicada",
      texto: "Una persona de Trycore acompaña tu solicitud de principio a fin.",
    },
  ],
  sla: "Trycore responde a tu solicitud en 10 días hábiles.",
} as const;
