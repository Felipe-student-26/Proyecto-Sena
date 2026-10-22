"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { AuroraBackground } from "../ui/AuroraBackground";
import { toggleHtmlTheme } from "../../lib/toggleTheme";

interface AuthShellProps {
  children: ReactNode;
}

export default function AuthShell({ children }: AuthShellProps) {
  const [temaOscuro, setTemaOscuro] = useState(false);

  useEffect(() => {
    setTemaOscuro(document.documentElement.classList.contains("dark"));
  }, []);

  function alternarTema() {
    setTemaOscuro(toggleHtmlTheme());
  }

  return (
    <AuroraBackground animationSpeed={15} showRadialGradient>
      <button
        type="button"
        onClick={alternarTema}
        className="absolute right-4 top-4 z-20 rounded-lg p-2 text-foreground/70 transition-colors hover:bg-black/5 hover:text-foreground dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white/80"
        aria-label={temaOscuro ? "Activar modo claro" : "Activar modo oscuro"}
      >
        {temaOscuro ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="relative z-10 w-full max-w-md px-4 py-8">{children}</div>
    </AuroraBackground>
  );
}

export { authClasses } from "./authClasses";
