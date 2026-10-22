"use client";

// Matriz de historial: aprendices × sesiones (Módulo 8)

import axios from "axios";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useConfirm } from "../../lib/confirm";
import Avatar from "../ui/Avatar";
import {
  actualizarRegistroAsistencia,
  descargarExcusaEvidencia,
  type PayloadActualizarRegistro,
} from "../../services/asistencia.service";
import type {
  HistorialMatrizRespuesta,
  RegistroHistorialCelda,
  SesionHistorialColumna,
  TipoAsistencia,
} from "../../types/asistencia";

const TIPOS_ORDEN: TipoAsistencia[] = ["presente", "falla", "parcial", "excusa"];

const ETIQUETA_TIPO: Record<TipoAsistencia, string> = {
  presente: "Presente",
  falla: "Falla",
  excusa: "Excusa",
  parcial: "Parcial",
};

/** Fecha calendario local a partir de YYYY-MM-DD (evita desfase UTC). */
function parseYmdLocal(ymd: string): Date | null {
  const [ys, ms, ds] = ymd.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  return new Date(y, m - 1, d);
}

function partesCabeceraSesion(fechaYmd: string): { dia: string; mesCorto: string; diaSemana: string } {
  const dt = parseYmdLocal(fechaYmd);
  if (!dt) return { dia: "?", mesCorto: "", diaSemana: "" };
  const dia = String(dt.getDate());
  const mesCorto = new Intl.DateTimeFormat("es-CO", { month: "short" })
    .format(dt)
    .replace(/\./g, "")
    .trim();
  const diaSemana = new Intl.DateTimeFormat("es-CO", { weekday: "short" })
    .format(dt)
    .replace(/\./g, "")
    .trim();
  return { dia, mesCorto, diaSemana };
}

function formatearFechaCol(fechaYmd: string): string {
  const [y, m, d] = fechaYmd.split("-");
  if (!y || !m || !d) return fechaYmd;
  return `${d}/${m}/${y}`;
}

function nombreCompacto(nombre: string, apellido: string): string {
  const n = nombre.trim().split(/\s+/)[0] ?? "";
  const a = apellido.trim().split(/\s+/)[0] ?? "";
  return `${n} ${a}`.trim() || nombre || apellido;
}

function nombreCompletoAprendiz(nombre: string, apellido: string): string {
  return `${nombre} ${apellido}`.trim();
}

const BADGE_BASE =
  "inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-md px-1 text-xs font-semibold text-white";

const ESTADO_CELDA: Record<
  TipoAsistencia,
  { etiqueta: string; badgeClass: string; simbolo: (reg: RegistroHistorialCelda) => string }
> = {
  presente: {
    etiqueta: "Presente",
    badgeClass: `${BADGE_BASE} bg-verde`,
    simbolo: () => "P",
  },
  falla: {
    etiqueta: "Falla",
    badgeClass: `${BADGE_BASE} bg-error`,
    simbolo: () => "X",
  },
  parcial: {
    etiqueta: "Parcial",
    badgeClass: `${BADGE_BASE} bg-info`,
    simbolo: (reg) =>
      reg.horas_inasistencia != null ? String(reg.horas_inasistencia) : "—",
  },
  excusa: {
    etiqueta: "Excusa",
    badgeClass: `${BADGE_BASE} bg-advertencia`,
    simbolo: () => "E",
  },
};

function mensajeError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data) {
    const d = err.response.data as {
      message?: string;
      errors?: Record<string, string[]>;
    };
    if (typeof d.message === "string" && d.message.trim() !== "") {
      return d.message;
    }
    if (d.errors) {
      const vals = Object.values(d.errors).flat();
      if (vals[0]) return String(vals[0]);
    }
  }
  return "No se pudo guardar el cambio. Inténtalo de nuevo.";
}

function tituloCelda(
  nombreAp: string,
  fechaYmd: string,
  reg: RegistroHistorialCelda | undefined
): string {
  const fechaTxt = formatearFechaCol(fechaYmd);
  if (!reg) {
    return `${nombreAp} · ${fechaTxt} · Sin registro`;
  }
  const info = ESTADO_CELDA[reg.tipo];
  let detalle = info.etiqueta;
  if (reg.tipo === "parcial" && reg.horas_inasistencia != null) {
    detalle += ` (${reg.horas_inasistencia} h de inasistencia)`;
  }
  if (reg.tipo === "excusa" && reg.excusa_motivo && reg.excusa_motivo.trim() !== "") {
    const corto =
      reg.excusa_motivo.length > 60 ? `${reg.excusa_motivo.slice(0, 60)}…` : reg.excusa_motivo;
    detalle += ` — ${corto}`;
  }
  return `${nombreAp} · ${fechaTxt} · ${detalle}`;
}

interface MatrizAsistenciaProps {
  datos: HistorialMatrizRespuesta;
  usuarioId: number;
  onRegistroActualizado: () => void;
  /** Si es true, no se puede editar ninguna celda (vista coordinador M10) */
  soloLectura?: boolean;
}

export default function MatrizAsistencia({
  datos,
  usuarioId,
  onRegistroActualizado,
  soloLectura = false,
}: MatrizAsistenciaProps) {
  const confirm = useConfirm();
  const mapaRegistros = useMemo(() => {
    const m = new Map<string, RegistroHistorialCelda>();
    datos.registros.forEach((r) => {
      m.set(`${r.sesion_id}-${r.aprendiz_id}`, r);
    });
    return m;
  }, [datos.registros]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [registroEdit, setRegistroEdit] = useState<RegistroHistorialCelda | null>(null);
  const [sesionEdit, setSesionEdit] = useState<SesionHistorialColumna | null>(null);
  const [tipoSel, setTipoSel] = useState<TipoAsistencia>("presente");
  const [horasParcial, setHorasParcial] = useState<number>(1);
  const [razon, setRazon] = useState("");
  const [excusaMotivo, setExcusaMotivo] = useState("");
  const [archivoEvidencia, setArchivoEvidencia] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);

  const abrirEditar = useCallback(
    (reg: RegistroHistorialCelda, sesion: SesionHistorialColumna) => {
      setRegistroEdit(reg);
      setSesionEdit(sesion);
      setTipoSel(reg.tipo);
      setHorasParcial(
        reg.tipo === "parcial" && reg.horas_inasistencia != null
          ? reg.horas_inasistencia
          : 1
      );
      setRazon("");
      setExcusaMotivo(reg.tipo === "excusa" ? (reg.excusa_motivo ?? "") : "");
      setArchivoEvidencia(null);
      setModalAbierto(true);
    },
    []
  );

  const cerrarModal = useCallback(() => {
    if (guardando) return;
    setModalAbierto(false);
    setRegistroEdit(null);
    setSesionEdit(null);
  }, [guardando]);

  const confirmarYGuardar = useCallback(async () => {
    if (!registroEdit || !sesionEdit) return;

    const hp = sesionEdit.horas_programadas;
    if (tipoSel === "parcial") {
      if (hp <= 1) {
        toast.warning("Parcial no permitido", {
          description: "Esta sesión tiene 1 hora o menos; no se puede marcar parcial.",
        });
        return;
      }
      if (horasParcial < 1 || horasParcial > hp - 1) {
        toast.warning("Horas no válidas", {
          description: `Las horas de inasistencia deben estar entre 1 y ${hp - 1}.`,
        });
        return;
      }
    }

    if (tipoSel === "excusa" && excusaMotivo.trim() === "") {
      toast.warning("Motivo requerido", {
        description: "Indica el motivo de la excusa.",
      });
      return;
    }

    const ok = await confirm({
      title: "¿Guardar cambio?",
      description: "Se registrará la corrección en el historial de auditoría.",
      confirmText: "Sí, guardar",
    });
    if (!ok) return;

    const payload: PayloadActualizarRegistro = {
      tipo: tipoSel,
      horas_inasistencia: tipoSel === "parcial" ? horasParcial : null,
      razon: razon.trim() !== "" ? razon.trim() : null,
      excusa_motivo:
        tipoSel === "excusa" ? excusaMotivo.trim() : undefined,
    };

    setGuardando(true);
    try {
      await actualizarRegistroAsistencia(
        registroEdit.id,
        payload,
        archivoEvidencia ?? undefined
      );
      toast.success("Listo", { description: "Registro actualizado correctamente." });
      cerrarModal();
      onRegistroActualizado();
    } catch (e) {
      toast.error("Error", { description: mensajeError(e) });
    } finally {
      setGuardando(false);
    }
  }, [
    confirm,
    registroEdit,
    sesionEdit,
    tipoSel,
    horasParcial,
    razon,
    excusaMotivo,
    archivoEvidencia,
    cerrarModal,
    onRegistroActualizado,
  ]);

  function renderBadge(reg: RegistroHistorialCelda | undefined): ReactNode {
    if (!reg) {
      return (
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-surfaceMuted text-xs font-semibold text-muted"
          aria-hidden
        >
          ?
        </span>
      );
    }
    const cfg = ESTADO_CELDA[reg.tipo];
    return (
      <span className={cfg.badgeClass} aria-hidden>
        {cfg.simbolo(reg)}
      </span>
    );
  }

  if (datos.aprendices.length === 0) {
    return (
      <div className="rounded-xl border border-borderSubtle bg-surface p-8 text-center text-sm text-muted">
        No hay aprendices activos en esta ficha.
      </div>
    );
  }

  if (datos.sesiones.length === 0) {
    return (
      <div className="rounded-xl border border-borderSubtle bg-surface p-8 text-center text-sm text-muted">
        No hay sesiones en el rango y filtros seleccionados.
      </div>
    );
  }

  return (
    <>
      <div className="min-w-0 overflow-hidden rounded-xl border border-borderSubtle bg-surface shadow-sm">
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-max min-w-full border-collapse text-sm">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-20 min-w-[12rem] border border-borderSubtle bg-surface px-2 py-2 text-left font-semibold text-foreground shadow-[2px_0_4px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_4px_rgba(0,0,0,0.3)]"
                >
                  Aprendiz
                </th>
                {datos.sesiones.map((s) => {
                  const { dia, mesCorto, diaSemana } = partesCabeceraSesion(s.fecha);
                  return (
                    <th
                      key={s.id}
                      scope="col"
                      title={`${formatearFechaCol(s.fecha)} · ${s.instructor_nombre_completo}`}
                      className="min-w-[3rem] max-w-[4.5rem] border border-borderSubtle bg-surfaceMuted px-1 py-2 text-center text-xs font-medium text-foreground"
                    >
                      <div className="text-sm font-semibold leading-none">{dia}</div>
                      <div className="mt-0.5 text-[10px] capitalize leading-tight text-muted">
                        {mesCorto}
                      </div>
                      <div className="mt-0.5 text-[10px] capitalize leading-tight text-muted">
                        {diaSemana}
                      </div>
                      <div
                        className="mt-1 truncate text-[10px] text-foreground/85"
                        title={s.instructor_nombre_completo}
                      >
                        {s.instructor_nombre_corto}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {datos.aprendices.map((a) => {
                const nc = nombreCompletoAprendiz(a.nombre, a.apellido);
                const nCompact = nombreCompacto(a.nombre, a.apellido);
                return (
                  <tr key={a.id} className="group hover:bg-surfaceMuted/50">
                    <th
                      scope="row"
                      className="sticky left-0 z-10 border border-borderSubtle bg-surface px-2 py-1.5 text-left font-normal shadow-[2px_0_4px_rgba(0,0,0,0.06)] group-hover:bg-surfaceMuted/50 dark:shadow-[2px_0_4px_rgba(0,0,0,0.3)]"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Avatar nombre={nc} id={a.id} size="sm" />
                        <div className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {nCompact}
                          </span>
                          <span className="block truncate text-xs text-muted">
                            CC {a.documento}
                          </span>
                        </div>
                      </div>
                    </th>
                    {datos.sesiones.map((s) => {
                      const reg = mapaRegistros.get(`${s.id}-${a.id}`);
                      const tipo = reg?.tipo ?? null;
                      const puedeEditar =
                        !soloLectura &&
                        s.estado === "cerrada" &&
                        s.instructor_id === usuarioId &&
                        reg != null;
                      const titulo = tituloCelda(nc, s.fecha, reg);

                      const celdaBase =
                        "border border-borderSubtle p-1 text-center align-middle w-12 min-w-[3rem] max-w-[4.5rem] group-hover:bg-surfaceMuted/40";
                      const celdaFondo =
                        tipo === null ? "bg-surfaceMuted/55" : "bg-surface";

                      const contenido = (
                        <span className="flex min-h-10 items-center justify-center">
                          {reg ? (
                            <>
                              {renderBadge(reg)}
                              <span className="sr-only">
                                {ETIQUETA_TIPO[reg.tipo]}
                                {reg.tipo === "parcial" && reg.horas_inasistencia != null
                                  ? `, ${reg.horas_inasistencia} horas de inasistencia`
                                  : ""}
                              </span>
                            </>
                          ) : (
                            <>
                              {renderBadge(undefined)}
                              <span className="sr-only">Sin registro</span>
                            </>
                          )}
                        </span>
                      );

                      return (
                        <td key={`${a.id}-${s.id}`} className={`${celdaBase} ${celdaFondo}`}>
                          {puedeEditar && reg ? (
                            <button
                              type="button"
                              title={titulo}
                              aria-label={`Editar asistencia: ${titulo}`}
                              className="flex min-h-10 w-full flex-col items-center justify-center rounded-sm hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-verde focus-visible:ring-offset-1"
                              onClick={() => abrirEditar(reg, s)}
                            >
                              {contenido}
                            </button>
                          ) : (
                            <div title={titulo} className="flex min-h-10 items-center justify-center">
                              {contenido}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-borderSubtle/70 px-3 py-2.5 text-xs text-muted">
          <span className="font-medium text-foreground">Leyenda:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className={ESTADO_CELDA.presente.badgeClass}>P</span>
            Presente
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className={ESTADO_CELDA.falla.badgeClass}>X</span>
            Falla
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className={ESTADO_CELDA.parcial.badgeClass}>2</span>
            Parcial (número = horas no asistidas)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className={ESTADO_CELDA.excusa.badgeClass}>E</span>
            Excusa
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-surfaceMuted text-xs font-semibold text-muted">
              ?
            </span>
            Sin registro
          </span>
        </div>
      </div>

      {modalAbierto && registroEdit && sesionEdit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 dark:bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-editar-registro"
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-borderSubtle bg-surface p-5 shadow-xl">
            <h2 id="titulo-editar-registro" className="text-lg font-bold text-foreground">
              Editar registro
            </h2>
            <p className="mt-1 text-xs text-muted">
              Sesión {formatearFechaCol(sesionEdit.fecha)} · {sesionEdit.horas_programadas} h
              programadas
            </p>

            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-foreground" htmlFor="tipo-asistencia">
                Tipo
              </label>
              <select
                id="tipo-asistencia"
                className="w-full rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground"
                value={tipoSel}
                onChange={(e) => setTipoSel(e.target.value as TipoAsistencia)}
                disabled={guardando}
              >
                {TIPOS_ORDEN.map((t) => (
                  <option key={t} value={t}>
                    {ETIQUETA_TIPO[t]}
                  </option>
                ))}
              </select>

              {tipoSel === "parcial" && (
                <div>
                  <label className="block text-sm font-medium text-foreground" htmlFor="horas-parcial">
                    Horas de inasistencia
                  </label>
                  <input
                    id="horas-parcial"
                    type="number"
                    min={1}
                    max={Math.max(1, sesionEdit.horas_programadas - 1)}
                    className="mt-1 w-full rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground"
                    value={horasParcial}
                    onChange={(e) => setHorasParcial(Number(e.target.value) || 1)}
                    disabled={guardando || sesionEdit.horas_programadas <= 1}
                  />
                </div>
              )}

              {tipoSel === "excusa" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground" htmlFor="excusa-motivo-edit">
                      Motivo de la excusa <span className="text-error">*</span>
                    </label>
                    <textarea
                      id="excusa-motivo-edit"
                      rows={3}
                      maxLength={500}
                      className="mt-1 w-full rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground"
                      value={excusaMotivo}
                      onChange={(e) => setExcusaMotivo(e.target.value)}
                      disabled={guardando}
                    />
                  </div>
                  {registroEdit.excusa_tiene_evidencia && (
                    <p className="text-xs text-muted">
                      <button
                        type="button"
                        className="font-medium text-verde underline"
                        disabled={guardando}
                        onClick={() =>
                          void (async () => {
                            try {
                              await descargarExcusaEvidencia(registroEdit.id);
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
                        Ver evidencia actual
                      </button>
                      {registroEdit.excusa_evidencia_nombre_original
                        ? ` (${registroEdit.excusa_evidencia_nombre_original})`
                        : ""}
                    </p>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-foreground" htmlFor="excusa-archivo-edit">
                      Nueva evidencia (opcional, máx. 10&nbsp;MB)
                    </label>
                    <input
                      id="excusa-archivo-edit"
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      className="mt-1 w-full text-sm text-foreground file:mr-2 file:rounded file:border-0 file:bg-surfaceMuted file:px-2 file:py-1"
                      disabled={guardando}
                      onChange={(e) => setArchivoEvidencia(e.target.files?.[0] ?? null)}
                    />
                    {archivoEvidencia && (
                      <p className="mt-1 truncate text-xs text-muted">{archivoEvidencia.name}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground" htmlFor="razon-registro">
                  Motivo de la corrección — auditoría (opcional)
                </label>
                <textarea
                  id="razon-registro"
                  rows={2}
                  maxLength={255}
                  className="mt-1 w-full rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted"
                  value={razon}
                  onChange={(e) => setRazon(e.target.value)}
                  disabled={guardando}
                  placeholder="Ej.: corrección acordada con coordinación"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-borderSubtle px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surfaceMuted"
                onClick={cerrarModal}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-lg bg-verde px-4 py-2 text-sm font-semibold text-white hover:bg-verdeOscuro disabled:opacity-50"
                onClick={() => void confirmarYGuardar()}
                disabled={guardando}
              >
                {guardando ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
