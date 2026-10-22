// Indicador de carga accesible — spinner + texto opcional (Módulo 4)

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  texto?: string;
  // Tamaño visual del ícono
  tamano?: "sm" | "md" | "lg";
}

const TAMANOS = {
  sm: 24,
  md: 40,
  lg: 48,
} as const;

export default function LoadingSpinner({
  texto = "Cargando...",
  tamano = "md",
}: LoadingSpinnerProps) {
  const px = TAMANOS[tamano];

  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-12"
      role="status"
      aria-live="polite"
    >
      <Loader2
        size={px}
        className="animate-spin text-verde"
        aria-hidden="true"
      />
      {texto ? (
        <p className="text-sm text-muted">{texto}</p>
      ) : null}
    </div>
  );
}
