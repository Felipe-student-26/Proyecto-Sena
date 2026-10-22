"use client";

// Panel de gestión de evidencias de excusas — instructor, gestor, coordinador

import axios from "axios";
import { Download, FileText, FolderOpen, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import EmptyState from "../../../components/ui/EmptyState";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useAuth } from "../../../hooks/useAuth";
import {
  descargarExcusaEvidencia,
  listarEvidencias,
} from "../../../services/asistencia.service";
import { getFicha, getFichas } from "../../../services/fichas.service";
import type { EvidenciaExcusaItem } from "../../../types/asistencia";
import type { AprendizFicha, FichaListado } from "../../../types/ficha";

const ROLES_EVIDENCIAS = ["instructor", "gestor_grupo", "coordinador"] as const;

function formatearFecha(ymd: string | null | undefined): string {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    return ymd ?? "—";
  }
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}

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
  return "No se pudieron cargar las evidencias. Inténtalo más tarde.";
}

export default function EvidenciasPage() {
  const router = useRouter();
  const { usuario, cargando: cargandoAuth } = useAuth();

  const [fichas, setFichas] = useState<FichaListado[]>([]);
  const [cargandoFichas, setCargandoFichas] = useState(true);
  const [fichaId, setFichaId] = useState<number | "">("");
  const [aprendices, setAprendices] = useState<AprendizFicha[]>([]);
  const [cargandoAprendices, setCargandoAprendices] = useState(false);
  const [aprendizId, setAprendizId] = useState<number | "">("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [evidencias, setEvidencias] = useState<EvidenciaExcusaItem[]>([]);
  const [cargandoEvidencias, setCargandoEvidencias] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const puedeVer =
    usuario &&
    ROLES_EVIDENCIAS.includes(usuario.rol as (typeof ROLES_EVIDENCIAS)[number]);

  useEffect(() => {
    if (cargandoAuth || !usuario) return;
    if (!puedeVer) {
      router.replace(usuario.rol === "aprendiz" ? "/mi-historial" : "/dashboard");
    }
  }, [cargandoAuth, usuario, puedeVer, router]);

  useEffect(() => {
    if (cargandoAuth || !usuario || !puedeVer) return;

    let cancelado = false;
    (async () => {
      setCargandoFichas(true);
      try {
        const pag = await getFichas({ activo: 1, per_page: 100 });
        if (!cancelado) setFichas(pag.data);
      } catch {
        if (!cancelado) {
          setFichas([]);
          toast.error("No se pudieron cargar las fichas", { description: "Inténtalo más tarde." });
        }
      } finally {
        if (!cancelado) setCargandoFichas(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [cargandoAuth, usuario, puedeVer]);

  useEffect(() => {
    if (fichaId === "") {
      setAprendices([]);
      setAprendizId("");
      return;
    }

    let cancelado = false;
    (async () => {
      setCargandoAprendices(true);
      try {
        const detalle = await getFicha(fichaId);
        if (!cancelado) {
          setAprendices(detalle.aprendices ?? []);
          setAprendizId("");
        }
      } catch {
        if (!cancelado) setAprendices([]);
      } finally {
        if (!cancelado) setCargandoAprendices(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [fichaId]);

  const cargarEvidencias = useCallback(async () => {
    setCargandoEvidencias(true);
    setBuscado(true);
    try {
      const data = await listarEvidencias({
        ficha_id: fichaId === "" ? undefined : fichaId,
        aprendiz_id: aprendizId === "" ? undefined : aprendizId,
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
      });
      setEvidencias(data);
    } catch (e) {
      setEvidencias([]);
      toast.error("Error", { description: mensajeError(e) });
    } finally {
      setCargandoEvidencias(false);
    }
  }, [fichaId, aprendizId, fechaDesde, fechaHasta]);

  const limpiarFiltros = useCallback(() => {
    setFichaId("");
    setAprendizId("");
    setAprendices([]);
    setFechaDesde("");
    setFechaHasta("");
    setEvidencias([]);
    setBuscado(false);
  }, []);

  if (cargandoAuth || !usuario) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!puedeVer) {
    return null;
  }

  return (
    <div className="mx-auto max-w-[100vw] px-2 pb-8 sm:px-4">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-verdeClaro">
          <FileText size={22} className="text-verde" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Evidencias de excusas</h1>
          <p className="text-sm text-muted">
            Consulta y descarga evidencias adjuntas a registros de excusa
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-4 rounded-xl border border-borderSubtle bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-[200px] flex-1">
            <label htmlFor="ficha-evidencias" className="block text-xs font-medium text-foreground">
              Ficha (opcional)
            </label>
            <select
              id="ficha-evidencias"
              className="mt-1 w-full rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground"
              value={fichaId === "" ? "" : String(fichaId)}
              onChange={(e) => setFichaId(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={cargandoFichas}
            >
              <option value="">Todas las fichas</option>
              {fichas.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.numero_ficha}
                  {f.programa?.nombre ? ` — ${f.programa.nombre}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[200px] flex-1">
            <label
              htmlFor="aprendiz-evidencias"
              className="block text-xs font-medium text-foreground"
            >
              Aprendiz (opcional)
            </label>
            <select
              id="aprendiz-evidencias"
              className="mt-1 w-full rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground"
              value={aprendizId === "" ? "" : String(aprendizId)}
              onChange={(e) =>
                setAprendizId(e.target.value === "" ? "" : Number(e.target.value))
              }
              disabled={fichaId === "" || cargandoAprendices}
            >
              <option value="">
                {fichaId === ""
                  ? "Selecciona una ficha primero"
                  : cargandoAprendices
                    ? "Cargando aprendices…"
                    : "Todos los aprendices"}
              </option>
              {aprendices.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre} {a.apellido} — {a.documento}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="desde-evidencias" className="block text-xs font-medium text-foreground">
              Desde
            </label>
            <input
              id="desde-evidencias"
              type="date"
              className="mt-1 rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="hasta-evidencias" className="block text-xs font-medium text-foreground">
              Hasta
            </label>
            <input
              id="hasta-evidencias"
              type="date"
              className="mt-1 rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-borderSubtle/70 pt-3">
          <button
            type="button"
            className="rounded-lg bg-verde px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-verdeOscuro disabled:opacity-60"
            onClick={() => void cargarEvidencias()}
            disabled={cargandoEvidencias}
          >
            {cargandoEvidencias ? "Buscando…" : "Buscar evidencias"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-borderSubtle bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:bg-surfaceMuted"
            onClick={limpiarFiltros}
            disabled={cargandoEvidencias}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {cargandoEvidencias && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-verde" aria-label="Cargando" />
        </div>
      )}

      {!cargandoEvidencias && buscado && evidencias.length === 0 && (
        <EmptyState
          Icono={FileText}
          titulo="Sin evidencias"
          descripcion="No hay excusas con evidencia adjunta para los filtros seleccionados."
        />
      )}

      {!cargandoEvidencias && !buscado && (
        <EmptyState
          Icono={FolderOpen}
          titulo="Busca evidencias"
          descripcion="Usa los filtros y pulsa «Buscar evidencias» para ver el listado."
        />
      )}

      {!cargandoEvidencias && evidencias.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-borderSubtle bg-surface shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-borderSubtle bg-surfaceMuted/50">
                <th className="px-4 py-3 font-semibold text-foreground">Aprendiz</th>
                <th className="px-4 py-3 font-semibold text-foreground">Ficha</th>
                <th className="px-4 py-3 font-semibold text-foreground">Fecha sesión</th>
                <th className="px-4 py-3 font-semibold text-foreground">Motivo</th>
                <th className="px-4 py-3 font-semibold text-foreground">Archivo</th>
                <th className="px-4 py-3 font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {evidencias.map((ev) => (
                <tr
                  key={ev.id}
                  className="border-b border-borderSubtle/70 last:border-b-0 hover:bg-surfaceMuted/30"
                >
                  <td className="px-4 py-3 text-foreground">
                    <span className="font-medium">
                      {ev.aprendiz.nombre} {ev.aprendiz.apellido}
                    </span>
                    <br />
                    <span className="text-xs text-muted">CC {ev.aprendiz.documento}</span>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    <span className="font-medium">{ev.ficha.numero_ficha}</span>
                    {ev.ficha.nombre_programa && (
                      <>
                        <br />
                        <span className="text-xs text-muted">{ev.ficha.nombre_programa}</span>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground whitespace-nowrap">
                    {formatearFecha(ev.sesion.fecha)}
                  </td>
                  <td className="max-w-[200px] px-4 py-3 text-foreground">
                    <span className="line-clamp-2" title={ev.excusa_motivo ?? ""}>
                      {ev.excusa_motivo ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    <span className="text-xs text-muted break-all">
                      {ev.excusa_evidencia_nombre_original ?? "evidencia"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-verdeClaro px-3 py-1.5 text-xs font-medium text-verde transition-colors hover:bg-verde/10"
                      onClick={() =>
                        void (async () => {
                          try {
                            await descargarExcusaEvidencia(ev.id);
                          } catch (err) {
                            toast.error("No se pudo descargar", { description: err instanceof Error ? err.message : "Inténtalo de nuevo." });
                          }
                        })()
                      }
                    >
                      <Download size={14} aria-hidden="true" />
                      Ver / Descargar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-borderSubtle/70 px-4 py-2 text-xs text-muted">
            {evidencias.length} evidencia{evidencias.length !== 1 ? "s" : ""} encontrada
            {evidencias.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
