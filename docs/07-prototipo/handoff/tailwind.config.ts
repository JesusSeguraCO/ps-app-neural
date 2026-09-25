import type { Config } from "tailwindcss";

/**
 * Las utilidades se enlazan a las variables CSS del sistema Trycore.
 * Ningún hex suelto vive en los componentes: todo pasa por aquí.
 * Requiere que los tokens del sistema (tokens/*.css) estén importados en el layout raíz.
 */
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // shadcn/ui estándar (styles/portal-theme.css) — cualquier primitiva nueva hereda la marca
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        "teal-ink": "var(--pp-teal-ink)",
        "navy-ink-accent": "var(--pp-navy-ink)",

        primary: "var(--tc-primary)",
        "primary-strong": "var(--tc-primary-strong)",
        "primary-strong-hover": "var(--tc-primary-strong-hover)",
        navy: "var(--tc-navy)",
        "brand-blue": "var(--tc-blue)",
        "text-h": "var(--tc-text-h)",
        "text-b": "var(--tc-text-b)",
        "text-m": "var(--tc-text-m)",
        "text-s": "var(--tc-text-s)",
        canvas: "var(--tc-bg-canvas)",
        card: "var(--tc-card)",
        accent: "var(--tc-accent)",
        subtle: "var(--tc-bg-subtle)",
        hairline: "var(--tc-border)",
        "hairline-strong": "var(--tc-border-s)",
        green: "var(--tc-green)",
        amber: "var(--tc-amber)",
        danger: "var(--tc-red)",
        "green-bg": "var(--tc-green-bg)",
        "amber-bg": "var(--tc-amber-bg)",
        "red-bg": "var(--tc-red-bg)",

        // Tokens de producto (styles/product-tokens.css)
        "primary-ink": "var(--tc-primary-ink)",
        "primary-surface": "var(--tc-primary-surface)",
        "primary-surface-border": "var(--tc-primary-surface-border)",
        "primary-surface-ink": "var(--tc-primary-surface-ink)",
        "ok-ink": "var(--tc-ok-ink)",
        "ok-mark": "var(--tc-ok-mark)",
        "ok-badge-ink": "var(--tc-ok-badge-ink)",
        "warn-ink": "var(--tc-warn-ink)",
        "warn-ink-strong": "var(--tc-warn-ink-strong)",
        "warn-border": "var(--tc-warn-border)",
        "warn-surface": "var(--tc-warn-surface)",
        "danger-ink": "var(--tc-danger-ink)",
        "surface-quiet": "var(--tc-surface-quiet)",
        "surface-declared": "var(--tc-surface-declared)",
        "navy-ink": "var(--tc-navy-ink)",
        "navy-ink-mute": "var(--tc-navy-ink-mute)",
        "teal-on-navy": "var(--tc-teal-on-navy)",
        "focus-ring": "var(--tc-focus-ring)",
      },
      fontFamily: {
        heading: ["var(--tc-font-heading)"],
        body: ["var(--tc-font-body)"],
        mono: ["var(--pp-mono)"],
      },
      spacing: {
        1: "var(--tc-sp-1)",
        2: "var(--tc-sp-2)",
        3: "var(--tc-sp-3)",
        4: "var(--tc-sp-4)",
        5: "var(--tc-sp-5)",
        6: "var(--tc-sp-6)",
        8: "var(--tc-sp-8)",
        10: "var(--tc-sp-10)",
      },
      fontSize: {
        badge: "var(--tc-fs-badge)",
        caption: "var(--tc-fs-caption)",
        small: "var(--tc-fs-small)",
        body: "var(--tc-fs-body)",
        h3: "var(--tc-fs-h3)",
        h2: "var(--tc-fs-h2)",
        h1: "var(--tc-fs-h1)",
      },
      borderRadius: {
        sm: "var(--tc-r-sm)",   // 6px  · tags, kbd
        md: "var(--tc-r-md)",   // 10px · botones, campos
        lg: "var(--tc-r-lg)",   // 16px · tarjetas, paneles
        xl: "20px",             // héroe de búsqueda, orbe
        pill: "var(--tc-r-pill)",
      },
      boxShadow: {
        1: "var(--tc-sh-1)",
        2: "var(--tc-sh-2)",
        3: "var(--tc-sh-3)",
        focus: "var(--tc-sh-focus)",
      },
      backgroundImage: {
        "grad-sidebar": "var(--tc-grad-sidebar)",
        "teal-fill": "var(--pp-teal-fill)",
        "teal-fill-hover": "var(--pp-teal-fill-hover)",
        hero: "var(--pp-hero)",
        "dot-grid": "radial-gradient(var(--pp-dot) 1px, transparent 1.3px)",
        "grad-brand": "var(--tc-grad-brand)",
      },
      transitionTimingFunction: { tc: "cubic-bezier(.4,0,.2,1)" },
      // Búsqueda asistida: el orbe solo gira mientras dura la búsqueda (~2 s).
      // motion-reduce:animate-none lo congela para quien lo pida al sistema.
      keyframes: {
        onda: { "0%": { transform: "scale(.45)", opacity: ".6" }, "100%": { transform: "scale(3.05)", opacity: "0" } },
        orbita: { to: { transform: "rotate(360deg)" } },
        flujo: { to: { strokeDashoffset: "-28" } },
        flotar: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-4px)" } },
        orbita: { to: { transform: "rotate(360deg)" } },
        pulso: {
          "0%, 100%": { transform: "scale(.9)", opacity: ".7" },
          "50%": { transform: "scale(1.08)", opacity: "1" },
        },
        revelar: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        "orbita-1": "orbita 5s linear infinite",
        "orbita-2": "orbita 9s linear infinite reverse",
        "orbita-3": "orbita 14s linear infinite",
        pulso: "pulso 1.8s cubic-bezier(.4,0,.2,1) infinite",
        revelar: "revelar .36s cubic-bezier(.4,0,.2,1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
