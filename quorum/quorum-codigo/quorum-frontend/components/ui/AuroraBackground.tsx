"use client";

import type React from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  AURORA_BASE_GRADIENT_CLASSES,
  AURORA_BLOB_ANIMATION_CLASS,
  AURORA_BLOBS,
  AURORA_DOT_PATTERN_CLASSES,
  AURORA_RADIAL_MASK_CLASSES,
  AURORA_SHELL_CLASSES,
  getAuroraDurations,
} from "./auroraConfig";

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
  /** Duración base de la animación en segundos. Por defecto 15s (movimiento sutil). */
  animationSpeed?: number;
}

/**
 * Fondo aurora ligero para login y páginas de autenticación.
 *
 * Sustituye gradientes animados + blur en pantalla completa + mix-blend-difference
 * por blobs con blur local animados solo con transform (capa GPU, sin repintado continuo).
 * Soporta modo claro/oscuro vía clases dark: y respeta prefers-reduced-motion en CSS.
 */
export function AuroraBackground({
  className,
  children,
  showRadialGradient = true,
  animationSpeed = 15,
  ...props
}: AuroraBackgroundProps) {
  const durations = getAuroraDurations(animationSpeed);

  return (
    <main>
      <div className={cn(AURORA_SHELL_CLASSES, className)} {...props}>
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          {/* Fondo base — gradiente estático, cero coste de animación */}
          <div className={AURORA_BASE_GRADIENT_CLASSES} />

          {/* Blobs animados — solo transform vía animate-aurora-blob-drift (globals.css) */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0",
              showRadialGradient && AURORA_RADIAL_MASK_CLASSES,
            )}
          >
            {AURORA_BLOBS.map((blob) => (
              <div
                key={blob.id}
                className={cn(
                  blob.position,
                  blob.color,
                  AURORA_BLOB_ANIMATION_CLASS,
                )}
                style={
                  {
                    "--aurora-blob-duration": `${durations[blob.durationIndex]}s`,
                    animationDirection: blob.reverse ? "reverse" : "normal",
                  } as React.CSSProperties
                }
              />
            ))}
          </div>

          {/* Textura sutil — reutiliza .bg-dot-pattern de globals.css */}
          <div className={AURORA_DOT_PATTERN_CLASSES} />
        </div>

        {children}
      </div>
    </main>
  );
}
