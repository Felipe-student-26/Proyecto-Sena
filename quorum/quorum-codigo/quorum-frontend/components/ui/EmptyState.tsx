// Estado vacío — cuando no hay datos que mostrar (Módulo 4)

import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  Icono: LucideIcon;
  titulo: string;
  descripcion?: string;
}

export default function EmptyState({
  Icono,
  titulo,
  descripcion,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-borderSubtle bg-surface px-4 py-12 text-center opacity-90 transition-opacity hover:opacity-100">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-surfaceMuted to-borderSubtle/30 text-muted">
        <Icono size={26} aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-foreground">{titulo}</p>
      {descripcion ? (
        <p className="mt-1.5 max-w-sm text-xs text-muted leading-relaxed">{descripcion}</p>
      ) : null}
    </div>
  );
}
