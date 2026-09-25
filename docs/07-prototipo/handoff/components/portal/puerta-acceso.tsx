"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * PuertaAcceso — correo corporativo + código de un solo uso.
 *
 * El panel izquierdo NO es decoración: explica la razón de la fricción
 * (los perfiles incluyen nombre y trayectoria de profesionales reales).
 * Una fricción explicada construye marca; una fricción muda la destruye.
 *
 * Sin contraseña y sin cuenta: el código llega al mismo correo por el que
 * se recibió la invitación, así el acceso sigue siendo nominal.
 */

export interface PuertaAccesoProps {
  /** Pide el código al backend. Debe resolver aunque el correo no exista (no filtrar cuentas). */
  onSolicitarCodigo: (correo: string) => Promise<void>;
  /** Verifica el código. Lanza con mensaje legible si no es válido. */
  onVerificar: (correo: string, codigo: string) => Promise<void>;
  onAccesoVencido: () => void;
  className?: string;
}

export function PuertaAcceso({
  onSolicitarCodigo,
  onVerificar,
  onAccesoVencido,
  className,
}: PuertaAccesoProps) {
  const [paso, setPaso] = useState<"correo" | "codigo">("correo");
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function pedirCodigo(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      setError("Escribe el correo corporativo al que llegó la invitación.");
      return;
    }
    setEnviando(true);
    try {
      await onSolicitarCodigo(correo.trim());
      setPaso("codigo");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos enviar el código.");
    } finally {
      setEnviando(false);
    }
  }

  async function verificar(e: React.FormEvent) {
    e.preventDefault();
    if (codigo.length !== 6) {
      setError("El código tiene seis dígitos. Revisa el correo o pide uno nuevo.");
      return;
    }
    setEnviando(true);
    try {
      await onVerificar(correo.trim(), codigo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ese código no es válido o ya venció.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className={cn("grid min-h-screen grid-cols-1 lg:grid-cols-2", className)}>
      <section className="flex flex-col bg-grad-sidebar p-10">
        <p className="text-[12.5px] font-semibold text-teal-on-navy">
          People Services · Trycore
        </p>
        <div className="flex max-w-[46ch] flex-1 flex-col justify-center">
          <h1 className="text-pretty font-heading text-[32px] font-bold leading-[1.22] tracking-[-0.02em] text-white">
            Este portal pide tu correo antes de abrirse. Vale la pena decir por qué.
          </h1>
          <p className="mt-5 text-body leading-[1.7] text-navy-ink">
            Los perfiles que vas a ver incluyen el nombre y la trayectoria de
            profesionales reales, publicados con su consentimiento por escrito. Por
            eso el acceso es nominal, tiene fecha de vencimiento y se verifica con un
            código de un solo uso.
          </p>
          <p className="mt-3.5 text-body leading-[1.7] text-navy-ink">
            No pedimos contraseña ni creamos una cuenta: el código llega al mismo
            correo por el que recibiste la invitación.
          </p>
        </div>
      </section>

      <section className="grid place-items-center p-10">
        <div className="w-full max-w-[420px]">
          {paso === "correo" ? (
            <form onSubmit={pedirCodigo}>
              <h2 className="font-heading text-h2 font-semibold text-text-h">
                Entra con tu correo corporativo
              </h2>
              <p className="mb-6 mt-2.5 text-body leading-[1.6] text-text-b">
                Te enviamos un código de seis dígitos válido por 15 minutos y un solo uso.
              </p>
              <Label htmlFor="pa-correo" className="font-heading text-caption font-semibold text-text-h">
                Correo corporativo
              </Label>
              <Input
                id="pa-correo"
                type="email"
                autoComplete="email"
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  setError("");
                }}
                placeholder="nombre.apellido@empresa.com"
                aria-describedby="pa-error"
                className="mt-1.5"
              />
              <p id="pa-error" aria-live="polite" className="min-h-5 pt-2 text-caption text-danger">
                {error}
              </p>
              <Button
                type="submit"
                disabled={enviando}
                className="w-full bg-primary-strong py-3 text-white hover:bg-primary-strong-hover"
              >
                Enviarme el código
              </Button>
              <p className="mt-5 text-caption leading-[1.6] text-text-m">
                ¿El enlace del correo ya no funciona?{" "}
                <button
                  type="button"
                  onClick={onAccesoVencido}
                  className="text-primary-strong underline"
                >
                  Tu acceso pudo vencer
                </button>
                .
              </p>
            </form>
          ) : (
            <form onSubmit={verificar}>
              <h2 className="font-heading text-h2 font-semibold text-text-h">
                Revisa tu correo
              </h2>
              <p className="mb-6 mt-2.5 text-body leading-[1.6] text-text-b">
                Enviamos un código de seis dígitos a{" "}
                <strong className="font-semibold">{correo}</strong>. Vence en 15 minutos.
              </p>
              <Label htmlFor="pa-codigo" className="font-heading text-caption font-semibold text-text-h">
                Código de un solo uso
              </Label>
              <Input
                id="pa-codigo"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={codigo}
                onChange={(e) => {
                  setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                placeholder="000000"
                aria-describedby="pa-error-2"
                className="mt-1.5 h-auto py-3 font-heading text-[22px] font-semibold tracking-[7px]"
              />
              <p id="pa-error-2" aria-live="polite" className="min-h-5 pt-2 text-caption text-danger">
                {error}
              </p>
              <Button
                type="submit"
                disabled={enviando}
                className="w-full bg-primary-strong py-3 text-white hover:bg-primary-strong-hover"
              >
                Entrar al portal
              </Button>
              <div className="mt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => void onSolicitarCodigo(correo)}
                  className="text-caption text-primary-strong underline"
                >
                  Reenviar el código
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaso("correo");
                    setCodigo("");
                    setError("");
                  }}
                  className="text-caption text-text-m underline"
                >
                  Usar otro correo
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
