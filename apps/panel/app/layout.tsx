import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@ps/ui/tokens.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Panel de People Service",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-canvas text-text-b antialiased">{children}</body>
    </html>
  );
}
