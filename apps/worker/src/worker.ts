// Worker de trabajo diferido (ADR-0009). Scaffold: arranca, espera y se apaga
// ordenadamente con SIGTERM. La cola, el planificador y las migraciones llegan
// en el sub-slice 1 de EP-001. `--once` arranca y sale (verificación de CI).
const unaVez = process.argv.includes("--once");

console.log(JSON.stringify({ evento: "worker_arrancado", pid: process.pid }));

if (unaVez) {
  process.exit(0);
}

const latido = setInterval(() => {}, 60_000);

const apagar = (senal: string) => {
  clearInterval(latido);
  console.log(JSON.stringify({ evento: "worker_detenido", senal }));
  process.exit(0);
};

process.on("SIGTERM", () => apagar("SIGTERM"));
process.on("SIGINT", () => apagar("SIGINT"));
