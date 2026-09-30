import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@ps/ui/tokens.css";
import "@ps/ui/patrones.css";
import "./globals.css";

// Todo el árbol es dinámico: cada HTML lleva su nonce de CSP (ADR-0008 fila QA-5/QA-2).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portal de Perfiles People Service",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-canvas text-text-b antialiased">{children}</body>
    </html>
  );
}
