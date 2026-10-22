// Componente Avatar — muestra un “squircle” con las iniciales del usuario.
// El tono se calcula automáticamente según el ID del usuario.

import { cn } from "../../lib/utils";

type AvatarTone = {
  bg: string;
  text: string;
};

// Tonos suaves alineados con la paleta QUORUM / Badge (sin hex inline).
const AVATAR_TONES: AvatarTone[] = [
  {
    bg: "bg-emerald-500/12 dark:bg-emerald-500/18",
    text: "text-emerald-800 dark:text-emerald-300",
  },
  {
    bg: "bg-teal-500/12 dark:bg-teal-500/18",
    text: "text-teal-800 dark:text-teal-300",
  },
  {
    bg: "bg-slate-500/12 dark:bg-slate-500/18",
    text: "text-slate-800 dark:text-slate-300",
  },
  {
    bg: "bg-indigo-500/12 dark:bg-indigo-500/18",
    text: "text-indigo-800 dark:text-indigo-300",
  },
  {
    bg: "bg-violet-500/12 dark:bg-violet-500/18",
    text: "text-violet-800 dark:text-violet-300",
  },
  {
    bg: "bg-sky-500/12 dark:bg-sky-500/18",
    text: "text-sky-800 dark:text-sky-300",
  },
  {
    bg: "bg-amber-500/14 dark:bg-amber-500/18",
    text: "text-amber-900 dark:text-amber-300",
  },
  {
    bg: "bg-rose-500/12 dark:bg-rose-500/18",
    text: "text-rose-900 dark:text-rose-300",
  },
];

// Dimensiones del círculo según el tamaño solicitado
const DIMENSIONES: Record<"sm" | "md" | "lg" | "xl", string> = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-24 h-24 text-2xl",
};

interface AvatarProps {
  nombre: string;
  id: number;
  size?: "sm" | "md" | "lg" | "xl";
}

// Calcula las iniciales a partir del nombre completo
// Ejemplo: "Andres Orozco" → "AO" | "Admin" → "AD"
function obtenerIniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) {
    // Primera letra del primer nombre + primera letra del primer apellido
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  // Si es una sola palabra, usamos las dos primeras letras
  return nombre.slice(0, 2).toUpperCase();
}

function obtenerTono(id: number): AvatarTone {
  return AVATAR_TONES[id % AVATAR_TONES.length];
}

function obtenerRadio(size: "sm" | "md" | "lg" | "xl"): string {
  // Squircle más “compacto” en tamaños pequeños.
  return size === "sm" ? "rounded-xl" : "rounded-2xl";
}

function obtenerTipografia(size: "sm" | "md" | "lg" | "xl"): string {
  if (size === "sm") {
    // Más sobrio y legible: menos bold, tracking sutil, y centrado óptico.
    return "font-medium tracking-[0.02em] leading-none";
  }
  return "font-semibold tracking-[0.01em] leading-none";
}

export default function Avatar({ nombre, id, size = "md" }: AvatarProps) {
  const iniciales = obtenerIniciales(nombre);
  const tono = obtenerTono(id);
  const clasesTamano = DIMENSIONES[size];
  const radio = obtenerRadio(size);
  const tipografia = obtenerTipografia(size);

  return (
    <div
      className={cn(
        clasesTamano,
        radio,
        "flex items-center justify-center select-none shrink-0",
        tipografia,
        "ring-1 ring-inset ring-black/10 dark:ring-white/10 shadow-sm shadow-black/5 dark:shadow-black/30 transition-shadow hover:shadow-md",
        tono.bg,
        tono.text,
      )}
      title={nombre}
      aria-label={`Avatar de ${nombre}`}
    >
      {iniciales}
    </div>
  );
}
