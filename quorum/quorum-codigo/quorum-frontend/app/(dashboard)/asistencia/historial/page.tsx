"use client";

// Historial y matriz de asistencia — admin, coordinador, instructor, gestor (Módulo 8)

import axios from "axios";
import { ChevronLeft, ChevronRight, FolderOpen, History, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import MatrizAsistencia from "../../../../components/asistencia/MatrizAsistencia";
import BtnDescargarExcel from "../../../../components/reportes/BtnDescargarExcel";
import EmptyState from "../../../../components/ui/EmptyState";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import { useAuth } from "../../../../hooks/useAuth";
import { obtenerHistorialAsistencia } from "../../../../services/asistencia.service";
import { getFichas } from "../../../../services/fichas.service";
import type { HistorialMatrizRespuesta, TipoAsistencia } from "../../../../types/asistencia";
import type { FichaListado } from "../../../../types/ficha";

const ROLES_HISTORIAL = ["admin", "coordinador", "instructor", "gestor_grupo"] as const;

const TIPOS_FILTRO: { valor: TipoAsistencia; etiqueta: string }[] = [
  { valor: "presente", etiqueta: "Presente" },
  { valor: "falla", etiqueta: "Falla" },
  { valor: "excusa", etiqueta: "Excusa" },
  { valor: "parcial", etiqueta: "Parcial" },
];

/** YYYY-MM actual en zona Bogotá */
function ymActualBogota(): string {
  const s = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return s.slice(0, 7);
}

/** Primer y último día del mes (mes 1–12) */
function rangoMes(year: number, month1to12: number): { desde: string; hasta: string } {
  const desde = `${year}-${String(month1to12).padStart(2, "0")}-01`;
  const mi = month1to12 - 1;
  const ultimo = new Date(year, mi + 1, 0).getDate();
  const hasta = `${year}-${String(month1to12).padStart(2, "0")}-${String(ultimo).padStart(2, "0")}`;
  return { desde, hasta };
}

function rangoDesdeYm(ym: string): { desde: string; hasta: string } {
  const [ys, ms] = ym.split("-");
  const y = Number(ys);
  const m = Number(ms);
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
    const hoy = ymActualBogota();
    const [hy, hm] = hoy.split("-").map(Number);
    return rangoMes(hy, hm);
  }
  return rangoMes(y, m);
}

function ymAnterior(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function ymSiguiente(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function etiquetaMes(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return ym;
  const d = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" }).format(d);
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
  return "No se pudo cargar el historial. Inténtalo más tarde.";
}

export default function HistorialAsistenciaPage() {
  const router = useRouter();
  const { usuario, cargando: cargandoAuth } = useAuth();

  const [fichas, setFichas] = useState<FichaListado[]>([]);
  const [cargandoFichas, setCargandoFichas] = useState(true);
  const [fichaId, setFichaId] = useState<number | "">("");

  const [mesYm, setMesYm] = useState(ymActualBogota);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [tiposFiltro, setTiposFiltro] = useState<TipoAsistencia[]>([]);

  const [matriz, setMatriz] = useState<HistorialMatrizRespuesta | null>(null);
  const [cargandoMatriz, setCargandoMatriz] = useState(false);

  const puedeVer = usuario && ROLES_HISTORIAL.includes(usuario.rol as (typeof ROLES_HISTORIAL)[number]);

  useEffect(() => {
    if (cargandoAuth || !usuario) return;
    if (!puedeVer) {
      router.replace(usuario.rol === "aprendiz" ? "/mi-historial" : "/dashboard");
    }
  }, [cargandoAuth, usuario, puedeVer, router]);

  useEffect(() => {
    const { desde: d, hasta: h } = rangoDesdeYm(mesYm);
    setDesde(d);
    setHasta(h);
  }, [mesYm]);

  useEffect(() => {
    if (cargandoAuth || !usuario || !puedeVer) return;

    let cancelado = false;
    (async () => {
      setCargandoFichas(true);
      try {
        const pag = await getFichas({ activo: 1, per_page: 100 });
        if (!cancelado) {
          setFichas(pag.data);
          if (pag.data.length === 1) {
            setFichaId(pag.data[0].id);
          }
        }
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

  const cargarMatriz = useCallback(async () => {
    if (fichaId === "" || desde === "" || hasta === "") return;
    setCargandoMatriz(true);
    try {
      const data = await obtenerHistorialAsistencia(fichaId, {
        desde,
        hasta,
        tipos: tiposFiltro.length > 0 ? tiposFiltro : undefined,
      });
      setMatriz(data);
    } catch (e) {
      setMatriz(null);
      toast.error("Error", { description: mensajeError(e) });
    } finally {
      setCargandoMatriz(false);
    }
  }, [fichaId, desde, hasta, tiposFiltro]);

  useEffect(() => {
    if (fichaId === "" || desde === "" || hasta === "") {
      setMatriz(null);
      return;
    }
    void cargarMatriz();
  }, [fichaId, desde, hasta, tiposFiltro, cargarMatriz]);

  const toggleTipo = useCallback((t: TipoAsistencia) => {
    setTiposFiltro((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }, []);

  const restablecerMes = useCallback(() => {
    const { desde: d, hasta: h } = rangoDesdeYm(mesYm);
    setDesde(d);
    setHasta(h);
  }, [mesYm]);

  const tituloMes = useMemo(() => etiquetaMes(mesYm), [mesYm]);

  const numeroFichaSeleccionada = useMemo(() => {
    if (fichaId === "") return "";
    return fichas.find((f) => f.id === fichaId)?.numero_ficha ?? "";
  }, [fichas, fichaId]);

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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-verdeClaro">
            <History size={22} className="text-verde" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Historial de asistencia</h1>
            <p className="text-sm text-muted">Matriz por ficha y período</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-4 rounded-xl border border-borderSubtle bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-[200px] flex-1">
            <label htmlFor="ficha-historial" className="block text-xs font-medium text-foreground">
              Ficha
            </label>
            <select
              id="ficha-historial"
              className="mt-1 w-full rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground"
              value={fichaId === "" ? "" : String(fichaId)}
              onChange={(e) => setFichaId(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={cargandoFichas || fichas.length === 0}
            >
              <option value="">Selecciona una ficha</option>
              {fichas.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.numero_ficha}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-borderSubtle bg-surface p-2 text-foreground transition-colors hover:bg-surfaceMuted"
              aria-label="Mes anterior"
              onClick={() => setMesYm((prev) => ymAnterior(prev))}
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <span className="min-w-[140px] text-center text-sm font-medium capitalize text-foreground">
              {tituloMes}
            </span>
            <button
              type="button"
              className="rounded-lg border border-borderSubtle bg-surface p-2 text-foreground transition-colors hover:bg-surfaceMuted"
              aria-label="Mes siguiente"
              onClick={() => setMesYm((prev) => ymSiguiente(prev))}
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-borderSubtle/70 pt-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div>
            <label htmlFor="desde-historial" className="block text-xs font-medium text-foreground">
              Desde
            </label>
            <input
              id="desde-historial"
              type="date"
              className="mt-1 rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="hasta-historial" className="block text-xs font-medium text-foreground">
              Hasta
            </label>
            <input
              id="hasta-historial"
              type="date"
              className="mt-1 rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-borderSubtle bg-surface px-3 py-2 text-sm text-foreground transition-colors hover:bg-surfaceMuted"
              onClick={restablecerMes}
            >
              Restablecer al mes visible
            </button>
            <BtnDescargarExcel
              fichaId={fichaId}
              numeroFicha={numeroFichaSeleccionada}
              desdeInicial={desde}
              hastaInicial={hasta}
            />
          </div>
        </div>

        <fieldset className="border-t border-borderSubtle/70 pt-3">
          <legend className="text-xs font-medium text-foreground">Filtrar por tipo (opcional)</legend>
          <p className="mb-2 text-xs text-muted">
            Si no marcas ninguno, se muestran todas las sesiones del rango. Si marcas tipos, solo
            aparecen columnas de sesiones que tengan al menos un registro de esos tipos.
          </p>
          <div className="flex flex-wrap gap-3">
            {TIPOS_FILTRO.map(({ valor, etiqueta }) => (
              <label key={valor} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={tiposFiltro.includes(valor)}
                  onChange={() => toggleTipo(valor)}
                  className="rounded border-borderSubtle text-verde focus:ring-verde"
                />
                {etiqueta}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {cargandoFichas && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-verde" aria-label="Cargando" />
        </div>
      )}

      {!cargandoFichas && fichas.length === 0 && (
        <EmptyState
          Icono={FolderOpen}
          titulo="Sin fichas disponibles"
          descripcion="No tienes fichas asignadas o no hay fichas activas para consultar."
        />
      )}

      {!cargandoFichas && fichas.length > 0 && fichaId === "" && (
        <EmptyState
          Icono={FolderOpen}
          titulo="Elige una ficha"
          descripcion="Selecciona una ficha para ver la matriz de asistencia."
        />
      )}

      {fichaId !== "" && cargandoMatriz && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {fichaId !== "" && !cargandoMatriz && matriz && (
        <MatrizAsistencia
          datos={matriz}
          usuarioId={usuario.id}
          onRegistroActualizado={() => void cargarMatriz()}
        />
      )}
    </div>
  );
}
