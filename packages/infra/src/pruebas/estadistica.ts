// Estadística para las pruebas de tiempos (V2-4, QA-3): mediana y Mann-Whitney U bilateral por la
// aproximación normal con corrección por empates (válida para N ≥ 20 por grupo).

export function mediana(xs: readonly number[]): number {
  if (xs.length === 0) throw new Error("mediana de una muestra vacía");
  const o = [...xs].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m]! : (o[m - 1]! + o[m]!) / 2;
}

// Φ(z) por Abramowitz-Stegun 7.1.26 (error < 1,5e-7).
function normalAcumulada(z: number): number {
  const t = 1 / (1 + 0.3275911 * (Math.abs(z) / Math.SQRT2));
  const erf =
    1 -
    t *
      (0.254829592 +
        t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) *
      Math.exp(-(z * z) / 2);
  return z >= 0 ? (1 + erf) / 2 : (1 - erf) / 2;
}

export interface ResultadoMannWhitney {
  u: number;
  z: number;
  p: number;
}

export function mannWhitney(a: readonly number[], b: readonly number[]): ResultadoMannWhitney {
  const n1 = a.length;
  const n2 = b.length;
  if (n1 < 20 || n2 < 20) throw new Error("Mann-Whitney por aproximación normal exige N ≥ 20");
  const todos = [...a.map((v) => ({ v, g: 0 })), ...b.map((v) => ({ v, g: 1 }))].sort(
    (x, y) => x.v - y.v,
  );
  const rangos = new Array<number>(todos.length);
  let sumaEmpates = 0;
  for (let i = 0; i < todos.length;) {
    let j = i;
    while (j + 1 < todos.length && todos[j + 1]!.v === todos[i]!.v) j++;
    const r = (i + j + 2) / 2;
    for (let k = i; k <= j; k++) rangos[k] = r;
    const t = j - i + 1;
    sumaEmpates += t ** 3 - t;
    i = j + 1;
  }
  let r1 = 0;
  todos.forEach((x, i) => {
    if (x.g === 0) r1 += rangos[i]!;
  });
  const u1 = r1 - (n1 * (n1 + 1)) / 2;
  const u = Math.min(u1, n1 * n2 - u1);
  const n = n1 + n2;
  const sigma = Math.sqrt(((n1 * n2) / 12) * (n + 1 - sumaEmpates / (n * (n - 1))));
  if (sigma === 0) return { u, z: 0, p: 1 };
  const z = (u1 - (n1 * n2) / 2) / sigma;
  return { u, z, p: 2 * (1 - normalAcumulada(Math.abs(z))) };
}
