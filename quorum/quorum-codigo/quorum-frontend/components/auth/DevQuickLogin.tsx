"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { authClasses } from "./authClasses";

const USUARIOS_PRUEBA = [
  {
    etiqueta: "Admin",
    correo: "andresfelipeorozcopiedrahita@gmail.com",
    password: "Admin123!",
  },
  {
    etiqueta: "Coordinador",
    correo: "sbecerra@sena.edu.co",
    password: "Admin123!",
  },
  {
    etiqueta: "Instructor",
    correo: "documentosorozco25@gmail.com",
    password: "Admin123!",
  },
  {
    etiqueta: "Gestor",
    correo: "mgomez@sena.edu.co",
    password: "Admin123!",
  },
  {
    etiqueta: "Aprendiz",
    correo: "andres@aprendiz.sena.edu.co",
    password: "33333333",
  },
] as const;

export type UsuarioPrueba = (typeof USUARIOS_PRUEBA)[number];

interface DevQuickLoginProps {
  onSelectUsuario: (usuario: UsuarioPrueba) => void;
}

export default function DevQuickLogin({ onSelectUsuario }: DevQuickLoginProps) {
  const [expandido, setExpandido] = useState(false);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  if (!expandido) {
    return (
      <button
        type="button"
        onClick={() => setExpandido(true)}
        className="flex w-full items-center justify-center gap-1 text-xs text-muted transition-colors hover:text-foreground dark:text-white/30 dark:hover:text-white/50"
      >
        Acceso rápido de pruebas (solo desarrollo)
        <ChevronDown size={14} />
      </button>
    );
  }

  return (
    <div className={authClasses.cardInner}>
      <button
        type="button"
        onClick={() => setExpandido(false)}
        className="flex w-full items-center justify-between border-b border-borderSubtle px-4 py-2 text-left transition-colors hover:bg-surfaceMuted/50 dark:border-white/10 dark:hover:bg-white/[0.03]"
      >
        <span className="text-xs font-medium text-amber-700 dark:text-amber-400/80">
          Acceso rápido de pruebas (solo desarrollo)
        </span>
        <ChevronUp size={14} className="shrink-0 text-muted dark:text-white/40" />
      </button>
      <div className="flex flex-wrap gap-2 p-3">
        {USUARIOS_PRUEBA.map((u) => (
          <button
            key={u.correo}
            type="button"
            onClick={() => onSelectUsuario(u)}
            className="rounded-full bg-surfaceMuted px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-borderSubtle dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/15"
          >
            {u.etiqueta}
          </button>
        ))}
      </div>
      <p className="px-4 pb-3 text-xs text-muted dark:text-white/30">
        Haz clic para rellenar el formulario.
      </p>
    </div>
  );
}
