// Tarjetas de resumen de horas y % asistencia (M9 y M10)

import type { MiHistorialTotales } from "../../types/miHistorial";

interface ResumenTotalesHistorialProps {
  totales: MiHistorialTotales;
  /** Texto si las horas de inasistencia superan el 20 % del total programado */
  mensajeAlertaInasistencia: string;
}

export default function ResumenTotalesHistorial({
  totales,
  mensajeAlertaInasistencia,
}: ResumenTotalesHistorialProps) {
  const haySesiones = totales.total_sesiones > 0;
  const ratioInasistencia =
    totales.total_horas_programadas > 0
      ? totales.total_horas_inasistencia / totales.total_horas_programadas
      : 0;
  const inasistenciaAlta = haySesiones && ratioInasistencia > 0.2;

  const pct = totales.porcentaje_asistencia;
  const pctColorClass =
    pct == null ? "text-muted" : pct >= 80 ? "text-verde" : "text-error";

  return (
    <section
      className="mb-6 rounded-xl border border-borderSubtle bg-surface p-5 shadow-sm md:p-6"
      aria-label="Resumen de asistencia"
    >
      <h2 className="mb-4 text-sm font-semibold text-foreground">Resumen</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-muted uppercase tracking-wide">
            Horas de inasistencia
          </p>
          <p
            className={`text-3xl font-bold tabular-nums ${
              inasistenciaAlta ? "text-error" : "text-foreground"
            }`}
          >
            {totales.total_horas_inasistencia}
          </p>
          {inasistenciaAlta ? (
            <p className="text-xs text-error mt-1">{mensajeAlertaInasistencia}</p>
          ) : null}
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wide">
            Asistencia (horas)
          </p>
          <p className={`text-3xl font-bold tabular-nums ${pctColorClass}`}>
            {pct != null ? `${pct} %` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wide">
            Sesiones registradas
          </p>
          <p className="text-3xl font-bold tabular-nums text-foreground">
            {totales.total_sesiones}
          </p>
        </div>
      </div>
    </section>
  );
}
