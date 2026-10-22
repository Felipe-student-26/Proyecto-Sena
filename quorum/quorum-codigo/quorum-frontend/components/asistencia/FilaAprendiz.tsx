"use client";

// Fila compacta: avatar, datos, selector de horas si parcial, botones de estado con iconos (paleta QUORUM)

import { Check, Clock, FileText, X } from "lucide-react";
import Avatar from "../ui/Avatar";
import type { AprendizAsistencia, MarcaAprendiz, TipoAsistencia } from "../../types/asistencia";

interface FilaAprendizProps {
  aprendiz: AprendizAsistencia;
  /** Máximo de horas seleccionables en parcial (= horas_programadas - 1) */
  maxHorasParcial: number;
  marca: MarcaAprendiz;
  onCambio: (marca: MarcaAprendiz) => void;
}

// Pill inactivo: fondo neutro, sin borde de color
const BOTON_INACTIVO =
  "border border-borderSubtle bg-surface text-muted transition-all hover:bg-surfaceMuted hover:text-foreground";

const BOTONES: {
  tipo: TipoAsistencia;
  Icon: typeof Check;
  titulo: string;
  activo: string;
  inactivo: string;
}[] = [
  {
    tipo: "presente",
    Icon: Check,
    titulo: "Presente",
    activo: "border border-emerald-300/50 bg-emerald-500/15 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-300",
    inactivo: BOTON_INACTIVO,
  },
  {
    tipo: "falla",
    Icon: X,
    titulo: "Falla",
    activo: "border border-rose-300/50 bg-rose-500/15 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/20 dark:text-rose-300",
    inactivo: BOTON_INACTIVO,
  },
  {
    tipo: "parcial",
    Icon: Clock,
    titulo: "Inasistencia parcial",
    activo: "border border-indigo-300/50 bg-indigo-500/15 text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-500/20 dark:text-indigo-300",
    inactivo: BOTON_INACTIVO,
  },
  {
    tipo: "excusa",
    Icon: FileText,
    titulo: "Excusa",
    activo: "border border-amber-300/50 bg-amber-500/15 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-300",
    inactivo: BOTON_INACTIVO,
  },
];

// Tinte de fila: más suave, sin fondos sólidos de colores agresivos
const FILA_POR_TIPO: Partial<Record<TipoAsistencia, string>> = {
  presente: "bg-emerald-50/60 border-emerald-200/50 dark:bg-emerald-950/25 dark:border-emerald-800/30",
  falla:    "bg-rose-50/60 border-rose-200/50 dark:bg-rose-950/25 dark:border-rose-800/30",
  parcial:  "bg-indigo-50/60 border-indigo-200/50 dark:bg-indigo-950/25 dark:border-indigo-800/30",
  excusa:   "bg-amber-50/60 border-amber-200/50 dark:bg-amber-950/25 dark:border-amber-800/30",
};

export default function FilaAprendiz({
  aprendiz,
  maxHorasParcial,
  marca,
  onCambio,
}: FilaAprendizProps) {
  const nombreCompleto = `${aprendiz.nombre} ${aprendiz.apellido}`.trim();

  function elegirTipo(tipo: TipoAsistencia) {
    if (tipo === "parcial") {
      onCambio({
        tipo,
        horas_inasistencia: marca.horas_inasistencia ?? (maxHorasParcial >= 1 ? 1 : null),
        excusa_motivo: null,
        excusa_archivo: null,
      });
    } else if (tipo === "excusa") {
      onCambio({
        tipo,
        horas_inasistencia: null,
        excusa_motivo: marca.excusa_motivo ?? "",
        excusa_archivo: marca.excusa_archivo ?? null,
      });
    } else {
      onCambio({
        tipo,
        horas_inasistencia: null,
        excusa_motivo: null,
        excusa_archivo: null,
      });
    }
  }

  const opcionesHoras =
    maxHorasParcial >= 1 ? Array.from({ length: maxHorasParcial }, (_, i) => i + 1) : [];

  const filaTint = marca.tipo ? FILA_POR_TIPO[marca.tipo] : "bg-surface border-borderSubtle";

  return (
    <div
      className={`
        flex flex-wrap items-center gap-2 sm:gap-3 rounded-lg border-2 p-2.5 sm:p-3 transition-colors
        ${filaTint}
      `}
    >
      <Avatar nombre={nombreCompleto} id={aprendiz.id} size="md" />

      <div className="min-w-0 flex-1 basis-[min(100%,12rem)]">
        <p className="truncate text-sm font-medium leading-tight text-foreground">{nombreCompleto}</p>
        <p className="mt-0.5 truncate text-xs leading-tight text-muted">
          Cédula: {aprendiz.documento}
        </p>
      </div>

      {marca.tipo === "excusa" && (
        <div className="order-3 w-full space-y-2 sm:order-none sm:max-w-md">
          <label htmlFor={`exc-motivo-${aprendiz.id}`} className="block text-xs font-medium text-muted">
            Motivo de la excusa <span className="text-rose-500">*</span>
          </label>
          <textarea
            id={`exc-motivo-${aprendiz.id}`}
            rows={2}
            className="w-full rounded-lg border border-borderSubtle bg-input px-2.5 py-1.5 text-xs text-foreground shadow-sm focus:border-verde focus:outline-none focus:ring-2 focus:ring-verde/25"
            placeholder="Describe brevemente el motivo (ej. cita médica, calamidad…)"
            value={marca.excusa_motivo ?? ""}
            onChange={(e) =>
              onCambio({
                tipo: "excusa",
                horas_inasistencia: null,
                excusa_motivo: e.target.value,
                excusa_archivo: marca.excusa_archivo ?? null,
              })
            }
          />
          <div>
            <label
              htmlFor={`exc-file-${aprendiz.id}`}
              className="mb-1 block text-xs text-muted"
            >
              Evidencia (opcional, máx. 10&nbsp;MB)
            </label>
            <input
              id={`exc-file-${aprendiz.id}`}
              type="file"
              accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="w-full max-w-full text-xs text-foreground file:mr-2 file:rounded file:border-0 file:bg-surfaceMuted file:px-2 file:py-1"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                onCambio({
                  tipo: "excusa",
                  horas_inasistencia: null,
                  excusa_motivo: marca.excusa_motivo ?? "",
                  excusa_archivo: f,
                });
              }}
            />
            {marca.excusa_archivo && (
              <p className="mt-1 truncate text-xs text-muted" title={marca.excusa_archivo.name}>
                {marca.excusa_archivo.name}
              </p>
            )}
          </div>
        </div>
      )}

      {marca.tipo === "parcial" && opcionesHoras.length > 0 && (
        <div className="order-3 flex w-full shrink-0 items-center justify-end gap-2 sm:order-none sm:w-auto sm:justify-start">
          <label htmlFor={`hrs-${aprendiz.id}`} className="sr-only">
            Horas de inasistencia
          </label>
          <select
            id={`hrs-${aprendiz.id}`}
            className="min-w-[4.5rem] rounded-lg border border-borderSubtle bg-input px-2 py-1.5 text-xs text-foreground shadow-sm focus:border-verde focus:outline-none focus:ring-2 focus:ring-verde/25"
            value={marca.horas_inasistencia ?? ""}
            onChange={(e) =>
              onCambio({
                tipo: "parcial",
                horas_inasistencia: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">—</option>
            {opcionesHoras.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <span className="hidden whitespace-nowrap text-xs text-muted sm:inline">
            Horas no asistidas
          </span>
          <span className="whitespace-nowrap text-xs text-muted sm:hidden">Hrs.</span>
        </div>
      )}

      <div className="order-2 ml-auto flex shrink-0 gap-1 sm:order-none">
        {BOTONES.map(({ tipo, Icon, titulo, activo, inactivo }) => {
          const sel = marca.tipo === tipo;
          return (
            <button
              key={tipo}
              type="button"
              title={titulo}
              aria-label={titulo}
              aria-pressed={sel}
              onClick={() => elegirTipo(tipo)}
              className={`
                inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-verde/40
                active:scale-95
                ${sel ? activo : inactivo}
              `}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="hidden sm:inline">{titulo}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
