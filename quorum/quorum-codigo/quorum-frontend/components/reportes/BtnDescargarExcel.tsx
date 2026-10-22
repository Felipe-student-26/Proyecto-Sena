"use client";

// Botón para descargar reporte Excel CPIC con modal de fechas (Módulo 11)

import axios from "axios";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { descargarReporteExcelCp } from "../../services/reportes.service";

export interface BtnDescargarExcelProps {
  fichaId: number | "";
  numeroFicha: string;
  desdeInicial: string;
  hastaInicial: string;
  /** Estilos del botón que abre el modal (por defecto secundario tipo borde) */
  className?: string;
}

function mensajeError(err: unknown): string {
  if (err instanceof Error && err.message.trim() !== "") {
    return err.message;
  }
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
  return "No se pudo descargar el reporte. Inténtalo más tarde.";
}

export default function BtnDescargarExcel({
  fichaId,
  numeroFicha,
  desdeInicial,
  hastaInicial,
  className,
}: BtnDescargarExcelProps) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [desde, setDesde] = useState(desdeInicial);
  const [hasta, setHasta] = useState(hastaInicial);
  const [cargando, setCargando] = useState(false);

  // Al abrir el modal, copiamos las fechas que vienen de la pantalla
  useEffect(() => {
    if (modalAbierto) {
      setDesde(desdeInicial);
      setHasta(hastaInicial);
    }
  }, [modalAbierto, desdeInicial, hastaInicial]);

  const cerrarModal = useCallback(() => {
    if (!cargando) setModalAbierto(false);
  }, [cargando]);

  const ejecutarDescarga = useCallback(async () => {
    if (fichaId === "") return;
    if (desde === "" || hasta === "") {
      toast.warning("Fechas incompletas", {
        description: "Elige fecha desde y hasta.",
      });
      return;
    }
    if (hasta < desde) {
      toast.warning("Rango inválido", {
        description: "La fecha hasta debe ser igual o posterior a la fecha desde.",
      });
      return;
    }

    setCargando(true);
    try {
      await descargarReporteExcelCp({
        fichaId,
        numeroFicha: numeroFicha || String(fichaId),
        desde,
        hasta,
      });
      setModalAbierto(false);
      toast.success("Descarga lista", {
        description: "El archivo Excel se guardó en tu carpeta de descargas.",
      });
    } catch (e) {
      toast.error("Error", { description: mensajeError(e) });
    } finally {
      setCargando(false);
    }
  }, [fichaId, numeroFicha, desde, hasta]);

  const claseBoton =
    className ??
    "inline-flex items-center gap-2 rounded-lg border border-borderSubtle px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surfaceMuted disabled:opacity-50";

  return (
    <>
      <button
        type="button"
        className={claseBoton}
        disabled={fichaId === "" || cargando}
        onClick={() => setModalAbierto(true)}
      >
        {cargando ? <Loader2 className="animate-spin" size={18} aria-hidden /> : null}
        <FileSpreadsheet size={18} aria-hidden />
        Descargar Excel
      </button>

      {modalAbierto ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={cerrarModal}
          onKeyDown={(ev) => {
            if (ev.key === "Escape") cerrarModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-excel"
            className="w-full max-w-md rounded-xl border border-borderSubtle bg-surface p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <h2 id="titulo-modal-excel" className="text-lg font-semibold text-foreground">
              Reporte Excel CPIC
            </h2>
            <p className="mt-1 text-sm text-muted">
              Sesiones cerradas del periodo (sin domingos ni festivos). Elige el rango de fechas.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="excel-desde" className="block text-xs font-medium text-foreground">
                  Desde
                </label>
                <input
                  id="excel-desde"
                  type="date"
                  className="mt-1 w-full rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  disabled={cargando}
                />
              </div>
              <div>
                <label htmlFor="excel-hasta" className="block text-xs font-medium text-foreground">
                  Hasta
                </label>
                <input
                  id="excel-hasta"
                  type="date"
                  className="mt-1 w-full rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  disabled={cargando}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-borderSubtle px-4 py-2 text-sm text-foreground transition-colors hover:bg-surfaceMuted disabled:opacity-50"
                onClick={cerrarModal}
                disabled={cargando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-verde px-4 py-2 text-sm font-semibold text-white hover:bg-verdeOscuro disabled:opacity-50"
                onClick={() => void ejecutarDescarga()}
                disabled={cargando || fichaId === ""}
              >
                {cargando ? <Loader2 className="animate-spin" size={18} aria-hidden /> : null}
                Descargar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
