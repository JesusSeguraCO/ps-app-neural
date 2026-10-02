// Concordancia de número en las frases de uso de un valor del catálogo: «La usa 1 perfil»,
// «Lo usan 3 perfiles». El sustantivo y el verbo cambian juntos.

export const perfilesTexto = (n: number) => `${n} ${n === 1 ? "perfil" : "perfiles"}`;

// «La usa» / «Lo usan»: el comienzo de la frase, antes de la cifra.
export const laUsa = (n: number, femenino: boolean) =>
  `L${femenino ? "a" : "o"} ${n === 1 ? "usa" : "usan"}`;

export const cuantosLaUsan = (n: number, femenino: boolean) =>
  `${laUsa(n, femenino)} ${perfilesTexto(n)}`;

// `a` es la terminación del artículo del tipo de catálogo («a» o «o»).
export const cuantosSinPublicarLaConservan = (n: number, a: string) =>
  `${perfilesTexto(n)} sin publicar l${a} ${n === 1 ? "conserva" : "conservan"}.`;
