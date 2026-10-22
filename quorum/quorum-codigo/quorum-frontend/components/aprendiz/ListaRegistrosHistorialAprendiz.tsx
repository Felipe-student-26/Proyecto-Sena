"use client";

// Lista cronológica de sesiones de un aprendiz (M9 y M10)

import { toast } from "sonner";
import { descargarExcusaEvidencia } from "../../services/asistencia.service";
import type {
  MiHistorialRegistro,
  TipoHistorialAprendiz,
} from "../../types/miHistorial";

function formatearFecha(ymd: string | null): string {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    return ymd ?? "—";
  }
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}

function etiquetaFicha(reg: MiHistorialRegistro): string {
  const n = reg.ficha.numero_ficha ?? "";
  const prog = reg.ficha.nombre_programa?.trim();
  if (prog) {
    return `Ficha ${n} — ${prog}`;
  }
  return n ? `Ficha ${n}` : "Ficha";
}

const BADGE_TIPO: Record<
  TipoHistorialAprendiz,
  { etiqueta: string; className: string }
> = {
  presente: {
    etiqueta: "Presente",
    className: "bg-verde text-white",
  },
  falla: {
    etiqueta: "Falla",
    className: "bg-error text-white",
  },
  parcial: {
    etiqueta: "Parcial",
    className: "bg-info text-white",
  },
  excusa: {
    etiqueta: "Excusa",
    className: "bg-advertencia text-white",
  },
};

interface ListaRegistrosHistorialAprendizProps {
  registros: MiHistorialRegistro[];
  tituloSeccion?: string;
  /** Solo staff (coordinador, etc.); el aprendiz no ve el enlace de evidencia. */
  mostrarEvidencia?: boolean;
}

export default function ListaRegistrosHistorialAprendiz({
  registros,
  tituloSeccion = "Sesiones (más recientes primero)",
  mostrarEvidencia = false,
}: ListaRegistrosHistorialAprendizProps) {
  return (
    <section aria-label="Lista de sesiones">
      <h2 className="text-sm font-semibold text-foreground mb-3">{tituloSeccion}</h2>
      <ul className="space-y-3">
        {registros.map((reg) => {
          const badge = BADGE_TIPO[reg.tipo] ?? BADGE_TIPO.presente;
          return (
            <li
              key={reg.id}
              className="flex flex-col gap-3 rounded-xl border border-borderSubtle bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  {formatearFecha(reg.fecha)}
                </p>
                <p className="text-sm text-muted truncate">
                  {etiquetaFicha(reg)}
                </p>
                <p className="text-sm text-foreground">
                  Instructor:{" "}
                  <span className="font-medium">
                    {reg.instructor_nombre.trim() || "—"}
                  </span>
                </p>
                {reg.tipo === "excusa" && reg.excusa_motivo && (
                  <p className="mt-1 text-sm text-foreground/90">
                    <span className="text-muted">Motivo: </span>
                    {reg.excusa_motivo}
                  </p>
                )}
                {mostrarEvidencia && reg.tipo === "excusa" && reg.excusa_tiene_evidencia && (
                  <p className="mt-1">
                    <button
                      type="button"
                      className="text-sm font-medium text-verde underline"
                      onClick={() =>
                        void (async () => {
                          try {
                            await descargarExcusaEvidencia(reg.id);
                          } catch (err) {
                            toast.error("No se pudo descargar", {
                              description:
                                err instanceof Error
                                  ? err.message
                                  : "Inténtalo de nuevo.",
                            });
                          }
                        })()
                      }
                    >
                      Ver evidencia adjunta
                    </button>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${badge.className}`}
                >
                  {badge.etiqueta}
                </span>
                <span className="text-sm text-muted">
                  {reg.tipo === "parcial" && reg.horas_inasistencia != null ? (
                    <>
                      Inasistencia: {reg.horas_inasistencia} h
                      {reg.horas_programadas != null
                        ? ` / ${reg.horas_programadas} h sesión`
                        : ""}
                    </>
                  ) : (
                    <>
                      Sesión:{" "}
                      {reg.horas_programadas != null
                        ? `${reg.horas_programadas} h`
                        : "—"}
                    </>
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
