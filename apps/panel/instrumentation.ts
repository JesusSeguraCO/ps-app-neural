// Arranque (V8-9): sin configuración completa el proceso sale con código ≠ 0 antes de servir.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { exigirConfiguracion } = await import("@ps/infra/config");
    exigirConfiguracion("panel");
  }
}
