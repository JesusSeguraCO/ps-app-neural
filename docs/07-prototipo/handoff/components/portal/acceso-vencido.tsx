import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * AccesoVencido — pantalla de renovación con contacto. Nunca un error crudo.
 *
 * Dice la razón (el consentimiento del profesional caduca a los 90 días, y con
 * él el acceso), da nombre y contacto del consultor, y promete lo que el
 * cliente teme perder: el equipo que ya había armado se conserva.
 */

export interface AccesoVencidoProps {
  vencioEl: string;
  /** Por omisión el buzón comercial: comercial@trycore.com. */
  consultor: { nombre: string; area: string; correo: string; telefono?: string };
  onPedirRenovacion: () => void;
  onVolverAEntrar: () => void;
  /** Mensaje de confirmación tras pedir la renovación; se anuncia por aria-live. */
  aviso?: string;
  className?: string;
}

export function AccesoVencido({
  vencioEl,
  consultor,
  onPedirRenovacion,
  onVolverAEntrar,
  aviso,
  className,
}: AccesoVencidoProps) {
  return (
    <main className={cn("grid min-h-screen place-items-center px-8 py-10", className)}>
      <div className="w-full max-w-[620px]">
        <div className="rounded-lg border border-hairline bg-card p-8 shadow-2">
          <p className="inline-block rounded-pill bg-amber-bg px-3 py-[5px] text-[12.5px] font-semibold text-warn-ink">
            Acceso vencido el {vencioEl}
          </p>
          <h1 className="mt-4 font-heading text-[26px] font-bold leading-[1.25] tracking-[-0.02em] text-text-h">
            Tu acceso a este portal terminó su vigencia
          </h1>
          <p className="mt-3.5 max-w-[62ch] text-body leading-[1.7] text-text-b">
            No es un error: los perfiles incluyen nombre y trayectoria de
            profesionales reales, y su consentimiento se renueva cada 90 días. Cuando
            el consentimiento caduca, el acceso también.
          </p>
          <p className="mt-3 max-w-[62ch] text-body leading-[1.7] text-text-b">
            Pedir la renovación toma un clic y responde el mismo consultor de tu
            cuenta.{" "}
            <strong className="font-semibold">
              El equipo que ya habías armado se conserva
            </strong>{" "}
            y lo vuelves a encontrar tal cual al entrar.
          </p>

          <div className="mt-6 rounded-lg bg-subtle p-5">
            <p className="text-[12.5px] font-semibold text-text-m">
              Tu consultora
            </p>
            <p className="mt-1.5 font-heading text-body font-semibold text-text-h">
              {consultor.nombre} · {consultor.area}
            </p>
            <p className="mt-[3px] text-small text-text-b">
              {consultor.correo}{consultor.telefono ? ` · ${consultor.telefono}` : ""}
            </p>
          </div>

          <p aria-live="polite" className="min-h-6 pt-3.5 text-small text-primary-strong">
            {aviso}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onPedirRenovacion}
              className="bg-primary-strong text-white hover:bg-primary-strong-hover"
            >
              Pedir renovación del acceso
            </Button>
            <Button asChild variant="outline">
              <a href={`mailto:${consultor.correo}`}>Escribir a mi consultora</a>
            </Button>
          </div>
        </div>

        <p className="mt-5 text-caption text-text-m">
          ¿Te llegó una invitación nueva?{" "}
          <button type="button" onClick={onVolverAEntrar} className="text-primary-strong underline">
            Entra con tu correo
          </button>
          .
        </p>
      </div>
    </main>
  );
}
