"use client";

// Calendario de clases del instructor — vistas mensual y semanal (Módulo 14)

import { CalendarDays, ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import { useAuth } from "../../../../hooks/useAuth";
import { getEventosCalendario } from "../../../../services/calendario.service";
import type { EventoCalendario } from "../../../../types/calendario";

// ─── Helpers de fecha ────────────────────────────────────────────────────────

function fechaHoyBogota(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}

/** Retorna el lunes de la semana que contiene la fecha dada. */
function lunesDeLaSemana(fecha: Date): Date {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0=Dom, 1=Lun … 6=Sáb
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return d;
}

/** Construye el grid del mes: semanas completas de Lun→Dom que cubren el mes. */
function construirGridMes(año: number, mes: number): Date[] {
  const primerDia = new Date(año, mes - 1, 1);
  const ultimoDia = new Date(año, mes, 0);
  const inicio   = lunesDeLaSemana(primerDia);

  const fin = new Date(ultimoDia);
  const dow = fin.getDay();
  if (dow !== 0) fin.setDate(fin.getDate() + (7 - dow));

  const grid: Date[] = [];
  const cursor = new Date(inicio);
  while (cursor <= fin || grid.length < 35) {
    grid.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return grid;
}

function construirSemana(lunes: Date): Date[] {
  const dias: Date[] = [];
  const cursor = new Date(lunes);
  for (let i = 0; i < 7; i++) {
    dias.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dias;
}

const DIAS_CORTO = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function etiquetaMes(año: number, mes: number): string {
  const d = new Date(año, mes - 1, 1);
  const s = d.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function etiquetaSemana(lunes: Date): string {
  const dom = new Date(lunes);
  dom.setDate(dom.getDate() + 6);
  const ini = lunes.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
  const fin = dom.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
  return `${ini} – ${fin}`;
}

function formatoFechaColombia(ymd: string): string {
  const [y, m, d] = ymd.split("-");
  const fecha = new Date(Number(y), Number(m) - 1, Number(d));
  return fecha.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Lógica de eventos ───────────────────────────────────────────────────────

function estadoEvento(ev: EventoCalendario, hoy: string): "completada" | "en_curso" | "pendiente" | "programada" {
  if (ev.sesion_estado === "cerrada") return "completada";
  if (ev.sesion_estado === "abierta") return "en_curso";
  if (ev.fecha <= hoy) return "pendiente";
  return "programada";
}

function etiquetaEstado(estado: ReturnType<typeof estadoEvento>): string {
  switch (estado) {
    case "completada": return "Completada";
    case "en_curso":   return "En curso";
    case "pendiente":  return "Pendiente";
    case "programada": return "Programada";
  }
}

function clasesBadge(estado: ReturnType<typeof estadoEvento>): string {
  switch (estado) {
    case "completada":
      return "bg-verde/15 text-verdeOscuro border border-verde/40 dark:bg-verde/20 dark:text-green-300 dark:border-verde/30";
    case "en_curso":
      return "bg-advertencia/20 text-amber-800 border border-advertencia/50 dark:text-amber-300 dark:border-advertencia/40";
    case "pendiente":
      return "bg-error/10 text-error border border-error/30 dark:text-red-300 dark:border-error/30";
    case "programada":
      return "bg-info/10 text-info border border-info/30 dark:text-blue-300 dark:border-info/30";
  }
}

function clasesChip(estado: ReturnType<typeof estadoEvento>): string {
  switch (estado) {
    case "completada":
      return "border-l-2 border-l-verde bg-verde/10 dark:bg-verde/15";
    case "en_curso":
      return "border-l-2 border-l-advertencia bg-advertencia/10 dark:bg-advertencia/10";
    case "pendiente":
      return "border-l-2 border-l-error bg-error/8 dark:bg-error/10";
    case "programada":
      return "border-l-2 border-l-info bg-info/8 dark:bg-info/10";
  }
}

function etiquetaJornada(tipo: string): string {
  switch (tipo) {
    case "mañana":      return "Mañana";
    case "tarde":       return "Tarde";
    case "noche":       return "Noche";
    case "fin_de_semana": return "Fin de semana";
    default:            return tipo;
  }
}

// ─── Chip compacto para vista mensual ────────────────────────────────────────

function ChipEventoMes({
  ev,
  hoy,
}: {
  ev: EventoCalendario;
  hoy: string;
}) {
  const estado = estadoEvento(ev, hoy);
  return (
    <div className={`rounded px-1 py-0.5 text-[10px] leading-tight truncate ${clasesChip(estado)}`}>
      <span className="font-medium">{ev.numero_ficha}</span>
      <span className="ml-1 opacity-70">{ev.hora_inicio}</span>
    </div>
  );
}

// ─── Tarjeta de evento para panel lateral y vista semanal ───────────────────

function TarjetaEvento({
  ev,
  hoy,
  compacto = false,
}: {
  ev: EventoCalendario;
  hoy: string;
  compacto?: boolean;
}) {
  const estado = estadoEvento(ev, hoy);
  const esFuturo = ev.fecha > hoy;
  const esCloseable = estado === "completada";

  return (
    <div className={`rounded-lg border border-borderSubtle/60 bg-surface p-3 shadow-sm ${compacto ? "p-2" : ""}`}>
      <div className={compacto ? "flex flex-col gap-1" : "flex items-start justify-between gap-2"}>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {ev.numero_ficha}
          </p>
          {!compacto && (
            <p className="text-xs text-muted mt-0.5">{etiquetaJornada(ev.jornada_tipo)}</p>
          )}
        </div>
        <span className={`${compacto ? "self-start" : "shrink-0"} rounded-full px-2 py-0.5 text-[10px] font-medium leading-tight ${clasesBadge(estado)}`}>
          {etiquetaEstado(estado)}
        </span>
        {compacto && (
          <p className="text-xs text-muted">{etiquetaJornada(ev.jornada_tipo)}</p>
        )}
      </div>

      <div className="mt-2 flex items-center gap-1 text-xs text-muted">
        <Clock size={12} className="shrink-0" aria-hidden />
        <span>{ev.hora_inicio} – {ev.hora_fin}</span>
        <span className="ml-1 text-muted/60">({ev.horas_programadas}h)</span>
      </div>

      {!compacto && (
        <div className="mt-3">
          {esCloseable ? (
            <Link
              href="/asistencia/historial"
              className="inline-block rounded-lg bg-surface border border-borderSubtle px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surfaceMuted transition-colors"
            >
              Ver historial
            </Link>
          ) : esFuturo ? (
            <p className="text-[11px] text-muted italic">Clase aún no disponible para tomar asistencia.</p>
          ) : (
            <Link
              href={`/asistencia/tomar?ficha=${ev.ficha_id}&fecha=${ev.fecha}`}
              className="inline-block rounded-lg bg-verde px-3 py-1.5 text-xs font-medium text-white hover:bg-verdeOscuro transition-colors"
            >
              {estado === "en_curso" ? "Continuar asistencia" : "Tomar asistencia"}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Panel lateral del día seleccionado ──────────────────────────────────────

function PanelDia({
  fecha,
  eventos,
  hoy,
  onCerrar,
}: {
  fecha: string;
  eventos: EventoCalendario[];
  hoy: string;
  onCerrar: () => void;
}) {
  return (
    <>
      {/* Overlay móvil */}
      <div
        className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        onClick={onCerrar}
        aria-hidden
      />
      {/* Panel */}
      <aside
        className="fixed right-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-full max-w-sm flex-col border-l border-borderSubtle bg-surface shadow-xl lg:max-w-[320px]"
        aria-label="Detalle del día"
      >
        {/* Header del panel */}
        <div className="flex items-start justify-between border-b border-borderSubtle/70 px-4 py-3">
          <div>
            <p className="text-xs text-muted capitalize">
              {formatoFechaColombia(fecha)}
            </p>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {eventos.length === 0
                ? "Sin clases"
                : eventos.length === 1
                ? "1 clase"
                : `${eventos.length} clases`}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg p-1.5 text-muted hover:bg-surfaceMuted hover:text-foreground transition-colors"
            aria-label="Cerrar panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {eventos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CalendarDays size={36} className="text-muted/40 mb-3" aria-hidden />
              <p className="text-sm text-muted">No tienes clases programadas para este día.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {eventos.map((ev) => (
                <TarjetaEvento key={`${ev.horario_id}-${ev.fecha}`} ev={ev} hoy={hoy} />
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// ─── Vista Mensual ────────────────────────────────────────────────────────────

function VistaMensual({
  año,
  mes,
  eventosPorFecha,
  hoy,
  diaSeleccionado,
  onSeleccionarDia,
}: {
  año: number;
  mes: number;
  eventosPorFecha: Map<string, EventoCalendario[]>;
  hoy: string;
  diaSeleccionado: string | null;
  onSeleccionarDia: (fecha: string) => void;
}) {
  const grid = useMemo(() => construirGridMes(año, mes), [año, mes]);

  return (
    <div className="select-none">
      {/* Encabezados de días */}
      <div className="grid grid-cols-7 border-b border-borderSubtle/60">
        {DIAS_CORTO.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[11px] font-medium uppercase tracking-wide text-muted"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7">
        {grid.map((fecha, idx) => {
          const fechaStr   = toYmd(fecha);
          const esMesActual = fecha.getMonth() + 1 === mes;
          const esHoy      = fechaStr === hoy;
          const esSelec    = diaSeleccionado === fechaStr;
          const evsDia     = eventosPorFecha.get(fechaStr) ?? [];
          const masEvs     = evsDia.length > 3 ? evsDia.length - 2 : 0;
          const visibles   = masEvs > 0 ? evsDia.slice(0, 2) : evsDia;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSeleccionarDia(fechaStr)}
              className={[
                "relative min-h-[80px] border-b border-r border-borderSubtle/40 p-1.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-verde/50",
                !esMesActual && "opacity-35",
                esSelec
                  ? "bg-verde/10 dark:bg-verde/15"
                  : esHoy
                  ? "bg-verdeClaro/50 dark:bg-verdeOscuro/20"
                  : "hover:bg-surfaceMuted",
                idx % 7 === 0 && "border-l-0",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={`${fechaStr}${evsDia.length > 0 ? `, ${evsDia.length} clases` : ""}`}
              aria-pressed={esSelec}
            >
              {/* Número del día */}
              <span
                className={[
                  "mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  esHoy
                    ? "bg-verde text-white font-bold"
                    : "text-foreground",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {fecha.getDate()}
              </span>

              {/* Chips de eventos */}
              <div className="flex flex-col gap-0.5">
                {visibles.map((ev) => (
                  <ChipEventoMes key={ev.horario_id} ev={ev} hoy={hoy} />
                ))}
                {masEvs > 0 && (
                  <span className="pl-1 text-[10px] text-muted">+{masEvs} más</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Vista Semanal ────────────────────────────────────────────────────────────

function VistaSemanal({
  semanaBase,
  eventosPorFecha,
  hoy,
  diaSeleccionado,
  onSeleccionarDia,
}: {
  semanaBase: Date;
  eventosPorFecha: Map<string, EventoCalendario[]>;
  hoy: string;
  diaSeleccionado: string | null;
  onSeleccionarDia: (fecha: string) => void;
}) {
  const semana = useMemo(() => construirSemana(semanaBase), [semanaBase]);

  return (
    <div className="select-none">
      {/* Encabezados */}
      <div className="grid grid-cols-7 border-b border-borderSubtle/60">
        {semana.map((fecha, idx) => {
          const fechaStr = toYmd(fecha);
          const esHoy    = fechaStr === hoy;
          return (
            <div
              key={idx}
              className={`py-2 text-center ${esHoy ? "text-verde font-semibold" : "text-muted"}`}
            >
              <p className="text-[11px] uppercase tracking-wide">{DIAS_CORTO[idx]}</p>
              <p className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                esHoy ? "bg-verde text-white" : "text-foreground"
              }`}>
                {fecha.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Columnas por día */}
      <div className="grid min-h-[400px] grid-cols-7 divide-x divide-borderSubtle/40">
        {semana.map((fecha, idx) => {
          const fechaStr = toYmd(fecha);
          const esHoy    = fechaStr === hoy;
          const esSelec  = diaSeleccionado === fechaStr;
          const evsDia   = eventosPorFecha.get(fechaStr) ?? [];

          return (
            <div
              key={idx}
              onClick={() => onSeleccionarDia(fechaStr)}
              className={[
                "cursor-pointer p-1.5 transition-colors",
                esSelec
                  ? "bg-verde/10 dark:bg-verde/15"
                  : esHoy
                  ? "bg-verdeClaro/40 dark:bg-verdeOscuro/15"
                  : "hover:bg-surfaceMuted",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="flex flex-col gap-1.5">
                {evsDia.map((ev) => (
                  <TarjetaEvento key={ev.horario_id} ev={ev} hoy={hoy} compacto />
                ))}
                {evsDia.length === 0 && (
                  <div className="h-4" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const ROLES_CALENDARIO = ["instructor", "gestor_grupo"] as const;

export default function CalendarioPage() {
  const router  = useRouter();
  const { usuario, cargando: cargandoAuth } = useAuth();

  const hoy = useRef(fechaHoyBogota()).current;

  // Vista y navegación
  const [vista, setVista] = useState<"mes" | "semana">("mes");

  const ahora = new Date();
  const [año, setAño]  = useState(ahora.getFullYear());
  const [mes, setMes]  = useState(ahora.getMonth() + 1);
  const [semanaBase, setSemanaBase] = useState<Date>(() => lunesDeLaSemana(ahora));

  // Eventos
  const [eventos,   setEventos]   = useState<EventoCalendario[]>([]);
  const [cargando,  setCargando]  = useState(false);

  // Día seleccionado (panel lateral)
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);

  // ── Guard de rol ──
  useEffect(() => {
    if (cargandoAuth || !usuario) return;
    if (!ROLES_CALENDARIO.includes(usuario.rol as (typeof ROLES_CALENDARIO)[number])) {
      router.replace("/dashboard");
    }
  }, [cargandoAuth, usuario, router]);

  // ── Cálculo de rango ──
  const { desde, hasta } = useMemo(() => {
    if (vista === "mes") {
      const grid = construirGridMes(año, mes);
      return { desde: toYmd(grid[0]), hasta: toYmd(grid[grid.length - 1]) };
    }
    const fin = new Date(semanaBase);
    fin.setDate(fin.getDate() + 6);
    return { desde: toYmd(semanaBase), hasta: toYmd(fin) };
  }, [vista, año, mes, semanaBase]);

  // ── Carga de datos ──
  useEffect(() => {
    if (cargandoAuth || !usuario) return;
    if (!ROLES_CALENDARIO.includes(usuario.rol as (typeof ROLES_CALENDARIO)[number])) return;

    let cancelado = false;
    setCargando(true);
    (async () => {
      try {
        const data = await getEventosCalendario(desde, hasta);
        if (!cancelado) setEventos(data);
      } catch {
        if (!cancelado) {
          toast.error("Error al cargar el calendario", { description: "No se pudieron cargar tus clases. Inténtalo más tarde." });
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => { cancelado = true; };
  }, [cargandoAuth, usuario, desde, hasta]);

  // ── Índice de eventos por fecha ──
  const eventosPorFecha = useMemo(() => {
    const map = new Map<string, EventoCalendario[]>();
    for (const ev of eventos) {
      if (!map.has(ev.fecha)) map.set(ev.fecha, []);
      map.get(ev.fecha)!.push(ev);
    }
    return map;
  }, [eventos]);

  // ── Navegación ──
  function irAnterior() {
    setDiaSeleccionado(null);
    if (vista === "mes") {
      if (mes === 1) { setMes(12); setAño((a) => a - 1); }
      else setMes((m) => m - 1);
    } else {
      setSemanaBase((prev) => {
        const d = new Date(prev);
        d.setDate(d.getDate() - 7);
        return d;
      });
    }
  }

  function irSiguiente() {
    setDiaSeleccionado(null);
    if (vista === "mes") {
      if (mes === 12) { setMes(1); setAño((a) => a + 1); }
      else setMes((m) => m + 1);
    } else {
      setSemanaBase((prev) => {
        const d = new Date(prev);
        d.setDate(d.getDate() + 7);
        return d;
      });
    }
  }

  function irAHoy() {
    const ahora = new Date();
    setDiaSeleccionado(null);
    setAño(ahora.getFullYear());
    setMes(ahora.getMonth() + 1);
    setSemanaBase(lunesDeLaSemana(ahora));
  }

  const tituloNav = useMemo(() => {
    if (vista === "mes") return etiquetaMes(año, mes);
    return etiquetaSemana(semanaBase);
  }, [vista, año, mes, semanaBase]);

  const handleSeleccionarDia = useCallback((fecha: string) => {
    setDiaSeleccionado((prev) => (prev === fecha ? null : fecha));
  }, []);

  // ── Render guards ──
  if (cargandoAuth || !usuario) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!ROLES_CALENDARIO.includes(usuario.rol as (typeof ROLES_CALENDARIO)[number])) {
    return null;
  }

  const eventosDiaSeleccionado = diaSeleccionado
    ? (eventosPorFecha.get(diaSeleccionado) ?? [])
    : [];

  return (
    <div className="mx-auto max-w-6xl">
      {/* ── Encabezado de página ── */}
      <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-borderSubtle/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-verdeClaro dark:bg-verdeOscuro/35"
            aria-hidden
          >
            <CalendarDays size={20} className="text-verde" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Mi calendario</h1>
            <p className="mt-0.5 text-xs text-muted">Clases programadas y asistencias tomadas</p>
          </div>
        </div>

        {/* Toggle de vista */}
        <div className="ml-auto flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-borderSubtle bg-surface p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => { setVista("mes"); setDiaSeleccionado(null); }}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                vista === "mes"
                  ? "bg-verde text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Mes
            </button>
            <button
              type="button"
              onClick={() => { setVista("semana"); setDiaSeleccionado(null); }}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                vista === "semana"
                  ? "bg-verde text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Semana
            </button>
          </div>
        </div>
      </div>

      {/* ── Controles de navegación ── */}
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={irAnterior}
          className="rounded-lg border border-borderSubtle p-1.5 text-muted hover:bg-surfaceMuted hover:text-foreground transition-colors"
          aria-label="Período anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={irSiguiente}
          className="rounded-lg border border-borderSubtle p-1.5 text-muted hover:bg-surfaceMuted hover:text-foreground transition-colors"
          aria-label="Período siguiente"
        >
          <ChevronRight size={16} />
        </button>
        <h2 className="mx-1 text-base font-semibold capitalize text-foreground">{tituloNav}</h2>
        <button
          type="button"
          onClick={irAHoy}
          className="ml-auto rounded-lg border border-borderSubtle px-3 py-1.5 text-xs font-medium text-muted hover:bg-surfaceMuted hover:text-foreground transition-colors"
        >
          Hoy
        </button>
      </div>

      {/* ── Leyenda ── */}
      <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px]">
        {[
          { clase: "bg-info/15 border-info/40 text-info dark:text-blue-300",       label: "Programada" },
          { clase: "bg-error/10 border-error/30 text-error dark:text-red-300",      label: "Pendiente" },
          { clase: "bg-advertencia/20 border-advertencia/50 text-amber-800 dark:text-amber-300", label: "En curso" },
          { clase: "bg-verde/15 border-verde/40 text-verdeOscuro dark:text-green-300", label: "Completada" },
        ].map(({ clase, label }) => (
          <span key={label} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${clase}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
            {label}
          </span>
        ))}
      </div>

      {/* ── Contenedor de calendario + panel ── */}
      <div className="relative">
        {/* Calendario */}
        <div className={`rounded-xl border border-borderSubtle bg-surface shadow-sm overflow-hidden transition-all duration-300 ${
          diaSeleccionado ? "lg:mr-[332px]" : ""
        }`}>
          {/* Overlay de carga */}
          {cargando && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-surface/70 backdrop-blur-[2px]">
              <LoadingSpinner />
            </div>
          )}

          {vista === "mes" ? (
            <VistaMensual
              año={año}
              mes={mes}
              eventosPorFecha={eventosPorFecha}
              hoy={hoy}
              diaSeleccionado={diaSeleccionado}
              onSeleccionarDia={handleSeleccionarDia}
            />
          ) : (
            <VistaSemanal
              semanaBase={semanaBase}
              eventosPorFecha={eventosPorFecha}
              hoy={hoy}
              diaSeleccionado={diaSeleccionado}
              onSeleccionarDia={handleSeleccionarDia}
            />
          )}
        </div>

        {/* Panel lateral del día seleccionado */}
        {diaSeleccionado && (
          <PanelDia
            fecha={diaSeleccionado}
            eventos={eventosDiaSeleccionado}
            hoy={hoy}
            onCerrar={() => setDiaSeleccionado(null)}
          />
        )}
      </div>

      {/* ── Nota explicativa ── */}
      {!cargando && eventos.length === 0 && (
        <div className="mt-6 rounded-xl border border-borderSubtle/60 bg-surfaceMuted px-5 py-8 text-center">
          <CalendarDays size={40} className="mx-auto mb-3 text-muted/40" aria-hidden />
          <p className="text-sm font-medium text-foreground">Sin clases en este período</p>
          <p className="mt-1 text-xs text-muted">
            No tienes horarios activos asignados para las fechas visibles. Contacta al coordinador si crees que es un error.
          </p>
        </div>
      )}
    </div>
  );
}
