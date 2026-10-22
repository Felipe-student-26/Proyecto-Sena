// Tarjeta de estadística — ícono Lucide, valor destacado y etiqueta (Módulo 4)

import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  etiqueta: string;
  valor: string | number;
  Icono: LucideIcon;
  // Clase Tailwind para el color del ícono, ej. text-verde o text-info
  classNameIcono: string;
}

export default function StatCard({
  etiqueta,
  valor,
  Icono,
  classNameIcono,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-borderSubtle bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-sm text-muted">{etiqueta}</p>
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {valor}
          </p>
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-surfaceMuted to-borderSubtle/60"
          aria-hidden="true"
        >
          <Icono size={22} className={classNameIcono} />
        </div>
      </div>
    </div>
  );
}
