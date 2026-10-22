/**
 * Configuración del fondo aurora ligero para páginas de autenticación.
 *
 * Paleta alineada con el aurora original (#10b981, #34d399, #6ee7b7, #2dd4bf, #14b8a6)
 * y con los tokens QUORUM (verde #059669, --background #121212 en oscuro).
 *
 * Los blobs usan clases Tailwind estáticas para que el purge no elimine estilos.
 */

/** Clase que activa la animación por transform (desactivada en prefers-reduced-motion vía CSS). */
export const AURORA_BLOB_ANIMATION_CLASS = "animate-aurora-blob-drift";

/** Media query usada en globals.css para respetar accesibilidad de movimiento. */
export const AURORA_REDUCED_MOTION_MEDIA = "(prefers-reduced-motion: reduce)";

/** Contenedor exterior del shell de auth (claro / oscuro). */
export const AURORA_SHELL_CLASSES =
  "relative flex min-h-[100vh] flex-col items-center justify-start bg-zinc-50 pt-[12vh] text-slate-950 dark:bg-zinc-900 dark:text-slate-50";

/** Gradiente base estático — sin animación, sin repintado continuo. */
export const AURORA_BASE_GRADIENT_CLASSES =
  "pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-zinc-50 to-zinc-100 dark:from-emerald-950/40 dark:via-zinc-900 dark:to-[#121212]";

/** Patrón de puntos reutilizado de globals.css (.bg-dot-pattern). */
export const AURORA_DOT_PATTERN_CLASSES =
  "pointer-events-none absolute inset-0 bg-dot-pattern opacity-30 dark:opacity-20";

/** Máscara radial opcional (desvanecido esquina superior derecha, igual que antes). */
export const AURORA_RADIAL_MASK_CLASSES =
  "[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]";

export interface AuroraBlobConfig {
  /** Identificador estable para keys de React y tests. */
  id: string;
  /** Posición y tamaño del blob (sin color ni animación). */
  position: string;
  /** Color del blob en modo claro y oscuro. */
  color: string;
  /** Índice 0–2 para asignar duración desde getAuroraDurations. */
  durationIndex: 0 | 1 | 2;
  /** Si true, la animación corre en dirección reverse. */
  reverse: boolean;
}

/** Tres blobs con posiciones distintas para movimiento orgánico. */
export const AURORA_BLOBS: readonly AuroraBlobConfig[] = [
  {
    id: "blob-emerald-left",
    position: "absolute -left-1/4 top-0 h-[60vh] w-[60vw] rounded-full blur-3xl",
    color: "bg-emerald-400/30 dark:bg-emerald-500/20",
    durationIndex: 0,
    reverse: false,
  },
  {
    id: "blob-teal-right",
    position: "absolute -right-1/4 top-1/3 h-[50vh] w-[50vw] rounded-full blur-3xl",
    color: "bg-teal-300/25 dark:bg-teal-400/15",
    durationIndex: 1,
    reverse: true,
  },
  {
    id: "blob-emerald-bottom",
    position: "absolute bottom-0 left-1/3 h-[40vh] w-[40vw] rounded-full blur-3xl",
    color: "bg-emerald-300/20 dark:bg-emerald-600/15",
    durationIndex: 2,
    reverse: false,
  },
] as const;

/** Tokens de tema para tests y documentación (claro vs oscuro). */
export const AURORA_THEME = {
  light: {
    shell: "bg-zinc-50",
    baseGradient: "from-emerald-50/80",
    blobSample: "bg-emerald-400/30",
  },
  dark: {
    shell: "dark:bg-zinc-900",
    baseGradient: "dark:from-emerald-950/40",
    blobSample: "dark:bg-emerald-500/20",
  },
} as const;

/**
 * Deriva tres duraciones distintas a partir de animationSpeed (segundos).
 * Cada blob usa una duración diferente para que el movimiento no sea sincronizado.
 */
export function getAuroraDurations(baseSpeed: number): readonly [number, number, number] {
  const speed = baseSpeed > 0 ? baseSpeed : 15;
  return [speed, speed * 1.25, speed * (5 / 3)] as const;
}

/** Clase de animación; con prefers-reduced-motion el CSS fuerza animation: none. */
export function getBlobAnimationClass(): string {
  return AURORA_BLOB_ANIMATION_CLASS;
}
