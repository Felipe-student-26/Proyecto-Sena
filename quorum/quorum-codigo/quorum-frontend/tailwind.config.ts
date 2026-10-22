import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        surfaceMuted: "var(--surface-muted)",
        borderSubtle: "var(--border-subtle)",
        muted: "var(--muted-foreground)",
        input: "var(--input-background)",
        ring: "var(--ring)",
        // Paleta QUORUM — esmeralda profundo como acento principal
        verde: "#059669",
        verdeOscuro: "#047857",
        verdeClaro: "#D1FAE5",
        sidebar: "#0F172A",
        grisOscuro: "#334155",
        grisMedio: "#94A3B8",
        grisClaro: "#F8FAFC",
        error: "#E11D48",
        advertencia: "#D97706",
        info: "#4F46E5",
        // Colores de tipo de asistencia
        presente: "#059669",
        falla: "#E11D48",
        excusa: "#D97706",
        parcial: "#4F46E5",
        // Colores de badge por rol (unificados en Fase 3 / Badge.tsx)
        rolAdmin: "#7C3AED",
        rolCoordinador: "#4F46E5",
        rolInstructor: "#047857",
        rolGestor: "#059669",
        rolAprendiz: "#64748B",
      },
    },
  },
  plugins: [],
};
export default config;
