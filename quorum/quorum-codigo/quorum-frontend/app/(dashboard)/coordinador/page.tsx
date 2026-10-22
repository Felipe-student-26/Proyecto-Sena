"use client";

// Panel coordinador: por ficha, por aprendiz y estadísticas (Módulo 10)

import axios from "axios";
import { BarChart3, ChevronLeft, ChevronRight, Loader2, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ListaRegistrosHistorialAprendiz from "../../../components/aprendiz/ListaRegistrosHistorialAprendiz";
import ResumenTotalesHistorial from "../../../components/aprendiz/ResumenTotalesHistorial";
import MatrizAsistencia from "../../../components/asistencia/MatrizAsistencia";
import BtnDescargarExcel from "../../../components/reportes/BtnDescargarExcel";
import EmptyState from "../../../components/ui/EmptyState";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useAuth } from "../../../hooks/useAuth";
import { getCentrosFormacion } from "../../../services/catalogos.service";
import {
  buscarAprendicesCoordinador,
  getCoordinadorEstadisticas,
  getCoordinadorFichas,
  getCoordinadorHistorialAprendiz,
  getCoordinadorHistorialFicha,
} from "../../../services/coordinador.service";
import { getFicha } from "../../../services/fichas.service";
import type { HistorialMatrizRespuesta, TipoAsistencia } from "../../../types/asistencia";
import type {
  CatalogoItem,
  FichaListado,
  JornadaFichaDetalle,
  TipoJornada,
} from "../../../types/ficha";
import type { MiHistorialRespuesta } from "../../../types/miHistorial";

const ROLES_PANEL = ["admin", "coordinador"] as const;

const ETIQUETA_JORNADA: Record<TipoJornada, string> = {
  mañana: "Mañana",
  tarde: "Tarde",
  noche: "Noche",
  fin_de_semana: "Fin de semana",
};

const TIPOS_FILTRO: { valor: TipoAsistencia; etiqueta: string }[] = [
  { valor: "presente", etiqueta: "Presente" },
  { valor: "falla", etiqueta: "Falla" },
  { valor: "excusa", etiqueta: "Excusa" },
  { valor: "parcial", etiqueta: "Parcial" },
];

function ymActualBogota(): string {
  const s = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return s.slice(0, 7);
}

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
  return "No se pudo completar la acción. Inténtalo más tarde.";
}

type Pestaña = "ficha" | "aprendiz" | "estadisticas";

export default function CoordinadorPage() {
  const router = useRouter();
  const { usuario, cargando: cargandoAuth } = useAuth();

  const puedeVer =
    usuario && ROLES_PANEL.includes(usuario.rol as (typeof ROLES_PANEL)[number]);

  const [pestaña, setPestaña] = useState<Pestaña>("ficha");

  // --- Pestaña ficha ---
  const [centros, setCentros] = useState<CatalogoItem[]>([]);
  const [centroId, setCentroId] = useState<number | "">("");
  const [fichas, setFichas] = useState<FichaListado[]>([]);
  const [cargandoFichas, setCargandoFichas] = useState(false);
  const [fichaId, setFichaId] = useState<number | "">("");
  const [jornadas, setJornadas] = useState<JornadaFichaDetalle[]>([]);
  const [jornadaFichaId, setJornadaFichaId] = useState<number | "">("");
  const [mesYm, setMesYm] = useState(ymActualBogota);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [tiposFiltro, setTiposFiltro] = useState<TipoAsistencia[]>([]);
  const [matriz, setMatriz] = useState<HistorialMatrizRespuesta | null>(null);
  const [cargandoMatriz, setCargandoMatriz] = useState(false);

  // --- Pestaña aprendiz ---
  const [qAprendiz, setQAprendiz] = useState("");
  const [sugerencias, setSugerencias] = useState<
    Awaited<ReturnType<typeof buscarAprendicesCoordinador>>
  >([]);
  const [buscandoAp, setBuscandoAp] = useState(false);
  const [aprendizSel, setAprendizSel] = useState<{
    id: number;
    nombre: string;
    apellido: string;
    documento: string;
  } | null>(null);
  const [historialAp, setHistorialAp] = useState<MiHistorialRespuesta | null>(null);
  const [cargandoHistorialAp, setCargandoHistorialAp] = useState(false);

  // --- Pestaña estadísticas ---
  const [centroEstId, setCentroEstId] = useState<number | "">("");
  const [filasEst, setFilasEst] = useState<
    Awaited<ReturnType<typeof getCoordinadorEstadisticas>>
  >([]);
  const [cargandoEst, setCargandoEst] = useState(false);
  const [ordenAsc, setOrdenAsc] = useState(false);

  useEffect(() => {
    if (!cargandoAuth && usuario && !puedeVer) {
      router.replace("/dashboard");
    }
  }, [cargandoAuth, usuario, puedeVer, router]);

  useEffect(() => {
    const { desde: d, hasta: h } = rangoDesdeYm(mesYm);
    setDesde(d);
    setHasta(h);
  }, [mesYm]);

  // Centros al montar (coordinador ya tiene permiso tras M10)
  useEffect(() => {
    if (!puedeVer) return;
    let c = false;
    (async () => {
      try {
        const lista = await getCentrosFormacion();
        if (!c) setCentros(lista);
      } catch {
        if (!c) setCentros([]);
      }
    })();
    return () => {
      c = true;
    };
  }, [puedeVer]);

  // Fichas cuando cambia el centro
  useEffect(() => {
    if (!puedeVer) return;
    let cancelado = false;
    (async () => {
      setCargandoFichas(true);
      setFichaId("");
      setJornadas([]);
      setJornadaFichaId("");
      setMatriz(null);
      try {
        const pag = await getCoordinadorFichas({
          activo: 1,
          per_page: 100,
          ...(centroId === "" ? {} : { centro_id: centroId }),
        });
        if (!cancelado) setFichas(pag.data);
      } catch {
        if (!cancelado) setFichas([]);
      } finally {
        if (!cancelado) setCargandoFichas(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [centroId, puedeVer]);

  // Detalle ficha → jornadas
  useEffect(() => {
    if (fichaId === "") {
      setJornadas([]);
      setJornadaFichaId("");
      return;
    }
    let cancelado = false;
    (async () => {
      try {
        const det = await getFicha(fichaId);
        if (!cancelado) {
          setJornadas(det.jornadas ?? []);
          setJornadaFichaId("");
          setMatriz(null);
        }
      } catch {
        if (!cancelado) {
          setJornadas([]);
          setJornadaFichaId("");
        }
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [fichaId]);

  const verAsistencia = useCallback(async () => {
    if (fichaId === "" || desde === "" || hasta === "") return;
    setCargandoMatriz(true);
    try {
      const data = await getCoordinadorHistorialFicha(fichaId, {
        desde,
        hasta,
        tipos: tiposFiltro.length > 0 ? tiposFiltro : undefined,
        jornada_ficha_id:
          jornadaFichaId === "" ? undefined : (jornadaFichaId as number),
      });
      setMatriz(data);
    } catch (e) {
      setMatriz(null);
      toast.error("Error", { description: mensajeError(e) });
    } finally {
      setCargandoMatriz(false);
    }
  }, [fichaId, desde, hasta, tiposFiltro, jornadaFichaId]);

  const toggleTipo = useCallback((t: TipoAsistencia) => {
    setTiposFiltro((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }, []);

  const tituloMes = useMemo(() => etiquetaMes(mesYm), [mesYm]);

  // Búsqueda aprendiz debounce
  useEffect(() => {
    if (pestaña !== "aprendiz") return;
    const t = qAprendiz.trim();
    if (t.length < 2) {
      setSugerencias([]);
      return;
    }
    const id = window.setTimeout(() => {
      void (async () => {
        setBuscandoAp(true);
        try {
          const lista = await buscarAprendicesCoordinador(t);
          setSugerencias(lista);
        } catch {
          setSugerencias([]);
        } finally {
          setBuscandoAp(false);
        }
      })();
    }, 300);
    return () => window.clearTimeout(id);
  }, [qAprendiz, pestaña]);

  const seleccionarAprendiz = useCallback(
    async (item: { id: number; nombre: string; apellido: string; documento: string }) => {
      setAprendizSel(item);
      setQAprendiz(`${item.nombre} ${item.apellido}`.trim());
      setSugerencias([]);
      setCargandoHistorialAp(true);
      setHistorialAp(null);
      try {
        const h = await getCoordinadorHistorialAprendiz(item.id);
        setHistorialAp(h);
      } catch (e) {
        toast.error("Error", { description: mensajeError(e) });
      } finally {
        setCargandoHistorialAp(false);
      }
    },
    []
  );

  // Estadísticas
  useEffect(() => {
    if (pestaña !== "estadisticas" || !puedeVer) return;
    let c = false;
    (async () => {
      setCargandoEst(true);
      try {
        const data = await getCoordinadorEstadisticas(
          centroEstId === "" ? undefined : centroEstId
        );
        if (!c) setFilasEst(data);
      } catch {
        if (!c) setFilasEst([]);
      } finally {
        if (!c) setCargandoEst(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [pestaña, centroEstId, puedeVer]);

  const filasEstOrdenadas = useMemo(() => {
    const copia = [...filasEst];
    copia.sort((a, b) => {
      const pa = a.porcentaje_asistencia;
      const pb = b.porcentaje_asistencia;
      if (pa === null && pb === null) return a.ficha_id - b.ficha_id;
      if (pa === null) return 1;
      if (pb === null) return -1;
      const cmp = pa - pb;
      const dir = ordenAsc ? -1 : 1;
      if (cmp === 0) return a.ficha_id - b.ficha_id;
      return cmp * dir;
    });
    return copia;
  }, [filasEst, ordenAsc]);

  const numeroFichaCoordinador = useMemo(() => {
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

  const haySesionesAp =
    historialAp != null && (historialAp.totales?.total_sesiones ?? 0) > 0;

  return (
    <div className="mx-auto max-w-[100vw] px-2 pb-8 sm:px-4">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-verdeClaro">
            <BarChart3 size={22} className="text-verde" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Vista coordinador</h1>
            <p className="text-sm text-muted">
              Consulta de asistencia y estadísticas (solo lectura)
            </p>
          </div>
        </div>
      </div>

      <div
        className="mb-4 flex flex-wrap gap-2 border-b border-borderSubtle pb-2"
        role="tablist"
        aria-label="Secciones del panel"
      >
        <button
          type="button"
          role="tab"
          aria-selected={pestaña === "ficha"}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            pestaña === "ficha"
              ? "bg-verde text-white"
              : "border border-borderSubtle bg-surfaceMuted text-foreground transition-colors hover:bg-surface"
          }`}
          onClick={() => setPestaña("ficha")}
        >
          Por ficha
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={pestaña === "aprendiz"}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            pestaña === "aprendiz"
              ? "bg-verde text-white"
              : "border border-borderSubtle bg-surfaceMuted text-foreground transition-colors hover:bg-surface"
          }`}
          onClick={() => setPestaña("aprendiz")}
        >
          Por aprendiz
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={pestaña === "estadisticas"}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            pestaña === "estadisticas"
              ? "bg-verde text-white"
              : "border border-borderSubtle bg-surfaceMuted text-foreground transition-colors hover:bg-surface"
          }`}
          onClick={() => setPestaña("estadisticas")}
        >
          Estadísticas por centro
        </button>
      </div>

      {pestaña === "ficha" ? (
        <>
          <div className="mb-4 flex flex-col gap-4 rounded-xl border border-borderSubtle bg-surface p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="coord-centro" className="block text-xs font-medium text-foreground">
                  Centro de formación
                </label>
                <select
                  id="coord-centro"
                  className="quorum-field mt-1 w-full"
                  value={centroId === "" ? "" : String(centroId)}
                  onChange={(e) =>
                    setCentroId(e.target.value === "" ? "" : Number(e.target.value))
                  }
                >
                  <option value="">Todos los centros</option>
                  {centros.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="coord-ficha" className="block text-xs font-medium text-foreground">
                  Ficha
                </label>
                <select
                  id="coord-ficha"
                  className="quorum-field mt-1 w-full"
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
              <div>
                <label htmlFor="coord-jornada" className="block text-xs font-medium text-foreground">
                  Jornada
                </label>
                <select
                  id="coord-jornada"
                  className="quorum-field mt-1 w-full"
                  value={jornadaFichaId === "" ? "" : String(jornadaFichaId)}
                  onChange={(e) =>
                    setJornadaFichaId(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  disabled={fichaId === "" || jornadas.length === 0}
                >
                  <option value="">Todas las jornadas</option>
                  {jornadas.map((j) =>
                    j.id != null ? (
                      <option key={j.id} value={j.id}>
                        {ETIQUETA_JORNADA[j.tipo] ?? j.tipo}
                      </option>
                    ) : null
                  )}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
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
              <div>
                <label htmlFor="coord-desde" className="block text-xs font-medium text-foreground">
                  Desde
                </label>
                <input
                  id="coord-desde"
                  type="date"
                  className="quorum-field mt-1 w-full"
                  value={desde}
                  onChange={(e) => {
                    setDesde(e.target.value);
                    setMatriz(null);
                  }}
                />
              </div>
              <div>
                <label htmlFor="coord-hasta" className="block text-xs font-medium text-foreground">
                  Hasta
                </label>
                <input
                  id="coord-hasta"
                  type="date"
                  className="quorum-field mt-1 w-full"
                  value={hasta}
                  onChange={(e) => {
                    setHasta(e.target.value);
                    setMatriz(null);
                  }}
                />
              </div>
            </div>

            <div className="border-t border-borderSubtle/70 pt-3">
              <p className="mb-2 text-xs font-medium text-foreground">Filtrar por tipo (opcional)</p>
              <div className="flex flex-wrap gap-2">
                {TIPOS_FILTRO.map(({ valor, etiqueta }) => (
                  <label key={valor} className="inline-flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={tiposFiltro.includes(valor)}
                      onChange={() => toggleTipo(valor)}
                    />
                    {etiqueta}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-borderSubtle/70 pt-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-verde px-4 py-2 text-sm font-semibold text-white hover:bg-verdeOscuro disabled:opacity-50"
                disabled={fichaId === "" || cargandoMatriz}
                onClick={() => void verAsistencia()}
              >
                {cargandoMatriz ? (
                  <Loader2 className="animate-spin" size={18} aria-hidden />
                ) : null}
                Ver asistencia
              </button>
              <BtnDescargarExcel
                fichaId={fichaId}
                numeroFicha={numeroFichaCoordinador}
                desdeInicial={desde}
                hastaInicial={hasta}
                className="inline-flex items-center gap-2 rounded-lg border border-borderSubtle bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surfaceMuted disabled:opacity-50"
              />
            </div>
          </div>

          {matriz && fichaId !== "" ? (
            <MatrizAsistencia
              datos={matriz}
              usuarioId={usuario.id}
              onRegistroActualizado={() => void verAsistencia()}
              soloLectura
            />
          ) : (
            <div className="rounded-xl border border-dashed border-borderSubtle bg-surface p-8 text-center text-sm text-muted">
              Elige ficha, período y opciones; luego pulsa &quot;Ver asistencia&quot;.
            </div>
          )}
        </>
      ) : null}

      {pestaña === "aprendiz" ? (
        <div className="max-w-4xl space-y-6">
          <div className="relative z-0 rounded-xl border border-borderSubtle bg-surface p-4 shadow-sm">
            <label htmlFor="buscar-ap" className="block text-xs font-medium text-foreground">
              Buscar aprendiz (nombre o cédula)
            </label>
            <div className="relative mt-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                size={18}
                aria-hidden
              />
              <input
                id="buscar-ap"
                type="search"
                autoComplete="off"
                className="quorum-field w-full pl-10 pr-3"
                placeholder="Escribe al menos 2 caracteres…"
                value={qAprendiz}
                onChange={(e) => {
                  setQAprendiz(e.target.value);
                  setAprendizSel(null);
                  setHistorialAp(null);
                }}
              />
              {buscandoAp ? (
                <Loader2
                  className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted"
                  size={18}
                />
              ) : null}
            </div>
            {sugerencias.length > 0 ? (
              <ul
                className="absolute z-10 mt-1 max-h-56 w-full max-w-xl overflow-auto rounded-lg border border-borderSubtle bg-surface shadow-lg"
                role="listbox"
              >
                {sugerencias.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surfaceMuted"
                      onClick={() => void seleccionarAprendiz(s)}
                    >
                      <span className="font-medium text-foreground">
                        {s.nombre} {s.apellido}
                      </span>
                      <span className="ml-2 text-muted">CC {s.documento}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {cargandoHistorialAp ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : aprendizSel && historialAp ? (
            !haySesionesAp ? (
              <EmptyState
                Icono={Users}
                titulo="Sin sesiones registradas"
                descripcion="Este aprendiz aún no tiene asistencias en el sistema."
              />
            ) : (
              <>
                <p className="text-sm text-muted">
                  Aprendiz:{" "}
                  <span className="font-semibold text-foreground">
                    {aprendizSel.nombre} {aprendizSel.apellido} · CC {aprendizSel.documento}
                  </span>
                </p>
                <ResumenTotalesHistorial
                  totales={historialAp.totales}
                  mensajeAlertaInasistencia="Supera el 20 % de las horas programadas del aprendiz"
                />
                <ListaRegistrosHistorialAprendiz
                  registros={historialAp.registros}
                  mostrarEvidencia
                />
              </>
            )
          ) : (
            <p className="text-sm text-muted">Selecciona un aprendiz de la lista para ver su historial.</p>
          )}
        </div>
      ) : null}

      {pestaña === "estadisticas" ? (
        <div className="rounded-xl border border-borderSubtle bg-surface p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-[200px]">
              <label htmlFor="est-centro" className="block text-xs font-medium text-foreground">
                Centro (filtro)
              </label>
              <select
                id="est-centro"
                className="quorum-field mt-1 w-full"
                value={centroEstId === "" ? "" : String(centroEstId)}
                onChange={(e) =>
                  setCentroEstId(e.target.value === "" ? "" : Number(e.target.value))
                }
              >
                <option value="">Todos</option>
                {centros.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="rounded-lg border border-borderSubtle bg-surface px-3 py-2 text-sm text-foreground transition-colors hover:bg-surfaceMuted"
              onClick={() => setOrdenAsc((v) => !v)}
            >
              Orden % asistencia: {ordenAsc ? "mejor primero" : "peor primero"}
            </button>
          </div>

          {cargandoEst ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-borderSubtle bg-surfaceMuted text-left">
                    <th className="px-3 py-2 font-semibold text-foreground">Ficha</th>
                    <th className="px-3 py-2 font-semibold text-foreground">Centro</th>
                    <th className="px-3 py-2 font-semibold text-foreground">Total aprendices</th>
                    <th className="px-3 py-2 font-semibold text-foreground">% asistencia</th>
                    <th className="px-3 py-2 font-semibold text-foreground">Sesiones tomadas</th>
                  </tr>
                </thead>
                <tbody>
                  {filasEstOrdenadas.map((row) => {
                    const bajo = row.porcentaje_asistencia != null && row.porcentaje_asistencia < 80;
                    return (
                      <tr
                        key={row.ficha_id}
                        className={`border-b border-borderSubtle/70 ${
                          bajo ? "bg-red-50 text-error" : "text-foreground"
                        }`}
                      >
                        <td className="px-3 py-2 font-medium">{row.numero_ficha}</td>
                        <td className="px-3 py-2">{row.centro_nombre}</td>
                        <td className="px-3 py-2 tabular-nums">{row.total_aprendices}</td>
                        <td className="px-3 py-2 tabular-nums">
                          {row.porcentaje_asistencia != null
                            ? `${row.porcentaje_asistencia} %`
                            : "—"}
                        </td>
                        <td className="px-3 py-2 tabular-nums">{row.sesiones_tomadas}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filasEstOrdenadas.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">No hay fichas para mostrar.</p>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
