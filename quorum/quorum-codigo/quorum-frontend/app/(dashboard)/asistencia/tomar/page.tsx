"use client";

// Tomar asistencia del día — instructor / gestor (Módulo 7)

import axios from "axios";
import { ClipboardCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import FilaAprendiz from "../../../../components/asistencia/FilaAprendiz";
import ProgressBar from "../../../../components/asistencia/ProgressBar";
import { useAuth } from "../../../../hooks/useAuth";
import {
  guardarAsistencia,
  iniciarSesionAsistencia,
  type FilaRegistroGuardar,
} from "../../../../services/asistencia.service";
import { getFichas } from "../../../../services/fichas.service";
import type {
  AprendizAsistencia,
  HorarioCandidato,
  MarcaAprendiz,
  SesionAsistencia,
} from "../../../../types/asistencia";
import type { FichaListado } from "../../../../types/ficha";

/** Fecha local de hoy en Bogotá (YYYY-MM-DD) */
function fechaHoyBogota(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Convierte fechas devueltas por la API a YYYY-MM-DD.
 * Evita que `value` de input type="date" y las comparaciones del clamp fallen con ISO u hora.
 */
function fechaSoloYmd(raw: string | undefined | null): string {
  if (raw == null || String(raw).trim() === "") return "";
  const s = String(raw).trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const t = Date.parse(s);
  if (!Number.isNaN(t)) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Bogota",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(t));
  }
  return s.slice(0, 10);
}

function normalizarFichaListado(f: FichaListado): FichaListado {
  return {
    ...f,
    fecha_inicio: fechaSoloYmd(f.fecha_inicio),
    fecha_fin: fechaSoloYmd(f.fecha_fin),
  };
}

/** YYYY-MM-DD → DD/MM/AAAA (solo para textos de ayuda). */
function formatoFechaColombia(ymd: string): string {
  const p = ymd.split("-");
  if (p.length !== 3) return ymd;
  return `${p[2]}/${p[1]}/${p[0]}`;
}

function mensajeDesdeError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data) {
    const d = err.response.data as {
      message?: string;
      errors?: Record<string, string[]>;
      codigo?: string;
    };
    if (typeof d.message === "string" && d.message.trim() !== "") {
      return d.message;
    }
    if (d.errors) {
      const vals = Object.values(d.errors).flat();
      if (vals[0]) return String(vals[0]);
    }
  }
  return "No se pudo completar la acción. Verifica tu conexión o inténtalo más tarde.";
}

function marcasIniciales(aprendices: AprendizAsistencia[]): Record<number, MarcaAprendiz> {
  const m: Record<number, MarcaAprendiz> = {};
  aprendices.forEach((a) => {
    m[a.id] = { tipo: null, horas_inasistencia: null, excusa_motivo: null, excusa_archivo: null };
  });
  return m;
}

/**
 * Días elegibles: [fecha_inicio, min(fecha_fin, hoy)].
 * Si hoy < fecha_inicio, no hay intersección → null (no forzar un solo día “futuro” en el input).
 */
function rangoFechaTomarAsistencia(f: FichaListado): { min: string; max: string } | null {
  const hoy = fechaHoyBogota();
  const min = f.fecha_inicio;
  const topeSup = f.fecha_fin < hoy ? f.fecha_fin : hoy;
  if (topeSup < min) return null;
  return { min, max: topeSup };
}

function clampFechaSesion(f: FichaListado, ymd: string): string {
  const r = rangoFechaTomarAsistencia(f);
  if (!r) return ymd;
  if (ymd < r.min) return r.min;
  if (ymd > r.max) return r.max;
  return ymd;
}

export default function TomarAsistenciaPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { usuario, cargando: cargandoAuth } = useAuth();

  // Query params opcionales que vienen del calendario (?ficha=ID&fecha=YYYY-MM-DD)
  const qFichaId = searchParams.get("ficha");
  const qFecha   = searchParams.get("fecha");
  /** Evita que los query params se apliquen más de una vez al cargar fichas. */
  const queryParamsAplicadosRef = useRef(false);

  const [fichas, setFichas] = useState<FichaListado[]>([]);
  const [cargandoFichas, setCargandoFichas] = useState(true);
  const [fichaId, setFichaId] = useState<number | "">("");

  const [sesion, setSesion] = useState<SesionAsistencia | null>(null);
  const [aprendices, setAprendices] = useState<AprendizAsistencia[]>([]);
  const [marcas, setMarcas] = useState<Record<number, MarcaAprendiz>>({});
  /** Fecha (Bogotá) para la que se toma o reanuda la asistencia */
  const [fechaSesion, setFechaSesion] = useState<string>(() => fechaHoyBogota());

  const [candidatosHorarios, setCandidatosHorarios] = useState<HorarioCandidato[] | null>(null);
  const [horarioElegido, setHorarioElegido] = useState<number | "">("");

  const [cargandoSesion, setCargandoSesion] = useState(false);
  const [guardando, setGuardando] = useState(false);

  /** Evita aplicar estado o modales de una petición de sesión obsoleta si cambian ficha/fecha. */
  const sesionPeticionSeqRef = useRef(0);
  /** Longitud actual de fichas (para no poner “cargando” en refetch si ya hay lista). */
  const fichasLenRef = useRef(0);
  fichasLenRef.current = fichas.length;

  // Solo instructor o gestor
  useEffect(() => {
    if (cargandoAuth || !usuario) return;
    if (usuario.rol !== "instructor" && usuario.rol !== "gestor_grupo") {
      router.replace("/dashboard");
    }
  }, [cargandoAuth, usuario, router]);

  useEffect(() => {
    if (cargandoAuth || !usuario) return;
    if (usuario.rol !== "instructor" && usuario.rol !== "gestor_grupo") return;

    let cancelado = false;
    const listaVacia = fichasLenRef.current === 0;
    if (listaVacia) {
      setCargandoFichas(true);
    }
    (async () => {
      try {
        const pag = await getFichas({ activo: 1, per_page: 100 });
        if (!cancelado) {
          const normalizadas = pag.data.map(normalizarFichaListado);
          setFichas(normalizadas);

          // Aplicar query params del calendario solo la primera vez
          const paramFichaId = qFichaId ? Number(qFichaId) : null;
          if (!queryParamsAplicadosRef.current && paramFichaId) {
            queryParamsAplicadosRef.current = true;
            const fichaParam = normalizadas.find((x) => x.id === paramFichaId);
            if (fichaParam) {
              setFichaId(fichaParam.id);
              setFechaSesion(() => clampFechaSesion(fichaParam, qFecha ?? fechaHoyBogota()));
              return; // evita que la auto-selección de ficha única lo sobreescriba
            }
          }

          if (normalizadas.length === 1) {
            const f0 = normalizadas[0];
            setFichaId(f0.id);
            // Misma regla que al cambiar ficha a mano: fecha dentro de vigencia (evita doble paso por el efecto)
            setFechaSesion((prev) => clampFechaSesion(f0, prev));
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
  }, [cargandoAuth, usuario, usuario?.id, usuario?.rol]);

  const cargarSesion = useCallback(async (fid: number, fecha: string, hid?: number) => {
    const seq = ++sesionPeticionSeqRef.current;
    const sigueVigente = () => seq === sesionPeticionSeqRef.current;

    setCargandoSesion(true);
    setCandidatosHorarios(null);
    setHorarioElegido("");
    try {
      const payload: { ficha_id: number; fecha: string; horario_id?: number } = {
        ficha_id: fid,
        fecha,
      };
      if (hid !== undefined) payload.horario_id = hid;

      const data = await iniciarSesionAsistencia(payload);
      if (!sigueVigente()) return;
      setSesion(data.sesion);
      setAprendices(data.aprendices);
      setMarcas(marcasIniciales(data.aprendices));
    } catch (err) {
      if (!sigueVigente()) return;
      setSesion(null);
      setAprendices([]);
      setMarcas({});

      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const d = err.response.data as {
          message?: string;
          codigo?: string;
          horarios_candidatos?: HorarioCandidato[];
          errors?: Record<string, string[]>;
        };
        if (d.codigo === "multiples_horarios" && Array.isArray(d.horarios_candidatos)) {
          if (!sigueVigente()) return;
          setCandidatosHorarios(d.horarios_candidatos);
          const primero = d.horarios_candidatos[0]?.id;
          setHorarioElegido(primero ?? "");
          toast.info("Varios horarios para esta fecha", { description: d.message ?? "Elige el horario que corresponde a esta toma de asistencia." });
          return;
        }

        const msg = mensajeDesdeError(err);
        const errFecha = d.errors?.fecha?.[0] ?? "";
        const yaCerrada =
          msg.toLowerCase().includes("ya fue registrada") ||
          errFecha.toLowerCase().includes("ya fue registrada");
        if (yaCerrada) {
          if (!sigueVigente()) return;
          toast.info("Sesión ya guardada", { description: msg });
          return;
        }
      }

      if (!sigueVigente()) return;
      toast.warning("No se puede tomar asistencia", { description: mensajeDesdeError(err) });
    } finally {
      if (sigueVigente()) {
        setCargandoSesion(false);
      }
    }
  }, []);

  const fichaSeleccionada = useMemo(
    () => (fichaId === "" ? null : fichas.find((f) => f.id === fichaId) ?? null),
    [fichaId, fichas]
  );

  /** Al cambiar de ficha, ajustamos la fecha en el mismo evento (no solo en el efecto). Así no “salta sola” un render después. */
  const handleCambioFicha = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const raw = e.target.value;
      if (raw === "") {
        setFichaId("");
        setCandidatosHorarios(null);
        setHorarioElegido("");
        return;
      }
      const id = Number(raw);
      const f = fichas.find((x) => x.id === id);
      setSesion(null);
      setAprendices([]);
      setMarcas({});
      setCandidatosHorarios(null);
      setHorarioElegido("");
      setFichaId(id);
      if (f) {
        setFechaSesion((prev) => clampFechaSesion(f, prev));
      }
    },
    [fichas]
  );

  /**
   * Firma estable del catálogo de fichas (id + vigencia). Evita que el efecto de carga se
   * re-ejecute solo porque `getFichas` devolvió un array nuevo con los mismos datos (referencia
   * distinta), lo que hacía titilar el input de fecha y repetía llamadas a la API.
   */
  const fichasListaKey = useMemo(
    () =>
      [...fichas]
        .sort((a, b) => a.id - b.id)
        .map((f) => `${f.id}:${f.fecha_inicio}:${f.fecha_fin}`)
        .join("|"),
    [fichas]
  );

  const fichasRef = useRef(fichas);
  fichasRef.current = fichas;

  useEffect(() => {
    if (fichaId === "" || !fichaId) {
      setSesion(null);
      setAprendices([]);
      setMarcas({});
      setCandidatosHorarios(null);
      return;
    }
    const f = fichasRef.current.find((x) => x.id === fichaId);
    if (!f) {
      return;
    }
    const rango = rangoFechaTomarAsistencia(f);
    if (!rango) {
      setSesion(null);
      setAprendices([]);
      setMarcas({});
      setCandidatosHorarios(null);
      return;
    }
    const clamped = clampFechaSesion(f, fechaSesion);
    if (clamped !== fechaSesion) {
      setSesion(null);
      setAprendices([]);
      setMarcas({});
      setCandidatosHorarios(null);
      setFechaSesion(clamped);
      return;
    }
    void cargarSesion(fichaId, clamped);
  }, [fichaId, fechaSesion, fichasListaKey, cargarSesion]);

  const maxHorasParcial = sesion ? Math.max(0, sesion.horas_programadas - 1) : 0;

  const marcadosCount = useMemo(() => {
    return aprendices.filter((a) => {
      const m = marcas[a.id];
      if (!m?.tipo) return false;
      if (m.tipo === "parcial") {
        return (
          m.horas_inasistencia !== null &&
          m.horas_inasistencia !== undefined &&
          m.horas_inasistencia >= 1
        );
      }
      return true;
    }).length;
  }, [aprendices, marcas]);

  const rangoTomar = useMemo(
    () => (fichaSeleccionada ? rangoFechaTomarAsistencia(fichaSeleccionada) : null),
    [fichaSeleccionada]
  );
  const hayRangoTomar = rangoTomar !== null;

  const fechaInputMinMax = useMemo(() => {
    if (!rangoTomar) return {} as { min?: string; max?: string };
    return { min: rangoTomar.min, max: rangoTomar.max };
  }, [rangoTomar]);

  const onCambiarFechaRegistro = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (!fichaSeleccionada) return;
      if (v === "") return;
      const r = rangoFechaTomarAsistencia(fichaSeleccionada);
      if (!r) return;
      if (v < r.min || v > r.max) {
        toast.info("Fecha no válida", { description: `Elige una fecha entre ${r.min} y ${r.max} (vigencia de la ficha y no futura).` });
        e.target.value = fechaSesion;
        return;
      }
      setFechaSesion(v);
    },
    [fichaSeleccionada, fechaSesion]
  );

  function actualizarMarca(id: number, marca: MarcaAprendiz) {
    setMarcas((prev) => ({ ...prev, [id]: marca }));
  }

  function marcarTodosPresentesSinMarcar() {
    setMarcas((prev) => {
      const next = { ...prev };
      aprendices.forEach((a) => {
        const actual = next[a.id];
        if (!actual?.tipo) {
          next[a.id] = {
            tipo: "presente",
            horas_inasistencia: null,
            excusa_motivo: null,
            excusa_archivo: null,
          };
        }
      });
      return next;
    });
  }

  function validarMarcasCompleto(): string | null {
    for (const a of aprendices) {
      const m = marcas[a.id];
      if (!m?.tipo) {
        return `${a.nombre} ${a.apellido}`.trim();
      }
      if (m.tipo === "parcial") {
        if (
          m.horas_inasistencia === null ||
          m.horas_inasistencia === undefined ||
          m.horas_inasistencia < 1
        ) {
          return `${a.nombre} ${a.apellido}`.trim();
        }
      }
      if (m.tipo === "excusa") {
        const t = (m.excusa_motivo ?? "").trim();
        if (t === "") {
          return `${a.nombre} ${a.apellido}`.trim();
        }
      }
    }
    return null;
  }

  async function continuarConHorario() {
    if (fichaId === "" || !fichaId || horarioElegido === "" || !horarioElegido) {
      toast.info("Selecciona un horario");
      return;
    }
    await cargarSesion(fichaId, fechaSesion, horarioElegido);
  }

  async function enviarGuardado() {
    const falta = validarMarcasCompleto();
    if (falta) {
      toast.warning("Falta marcar", { description: `Debes marcar la asistencia de: ${falta}.` });
      return;
    }

    if (!sesion) return;

    setGuardando(true);
    try {
      const registros: FilaRegistroGuardar[] = aprendices.map((a) => {
        const m = marcas[a.id];
        const base: FilaRegistroGuardar = {
          aprendiz_id: a.id,
          tipo: m.tipo!,
          horas_inasistencia: m.tipo === "parcial" ? m.horas_inasistencia : null,
        };
        if (m.tipo === "excusa") {
          base.excusa_motivo = (m.excusa_motivo ?? "").trim();
        }
        return base;
      });

      const evidencias: Record<number, File> = {};
      aprendices.forEach((a) => {
        const m = marcas[a.id];
        if (m.tipo === "excusa" && m.excusa_archivo) {
          evidencias[a.id] = m.excusa_archivo;
        }
      });

      await guardarAsistencia(
        sesion.id,
        registros,
        Object.keys(evidencias).length > 0 ? evidencias : undefined
      );

      toast.success("Asistencia guardada", { description: "Los registros se guardaron correctamente." });

      router.push("/asistencia/historial");
    } catch (err) {
      toast.error("No se pudo guardar", { description: mensajeDesdeError(err) });
    } finally {
      setGuardando(false);
    }
  }

  if (cargandoAuth || !usuario) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-verde" size={36} aria-hidden />
      </div>
    );
  }

  if (usuario.rol !== "instructor" && usuario.rol !== "gestor_grupo") {
    return null;
  }

  const claseSelect =
    "w-full rounded-lg border border-borderSubtle bg-input py-2 pl-3 pr-3 text-sm text-foreground shadow-sm " +
    "focus:border-verde focus:outline-none focus:ring-2 focus:ring-verde/25";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Barra compacta: título + selector ficha (sin caja blanca extra) */}
      <div className="mb-4 flex flex-wrap items-end gap-x-4 gap-y-3 border-b border-borderSubtle/70 pb-4">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 md:flex-initial md:max-w-md">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-verdeClaro dark:bg-verdeOscuro/35"
            aria-hidden
          >
            <ClipboardCheck size={20} className="text-verde" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Tomar asistencia</h1>
            <p className="mt-0.5 text-xs text-muted">
              Fecha {sesion?.fecha ?? fechaSesion} · Marca a todos antes de guardar.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end md:ml-auto md:w-auto md:shrink-0">
          <div className="w-full sm:w-44">
            <label htmlFor="fecha-registro-asistencia" className="mb-1 block text-xs font-medium text-muted">
              Fecha del registro
            </label>
            <input
              id="fecha-registro-asistencia"
              type="date"
              className={claseSelect}
              value={fechaSesion}
              min={fechaInputMinMax.min}
              max={fechaInputMinMax.max}
              disabled={
                fichaId === "" || !fichaSeleccionada || cargandoFichas || !hayRangoTomar
              }
              onChange={(e) => void onCambiarFechaRegistro(e)}
            />
          </div>
          <div className="w-full min-w-0 sm:w-72">
            <label htmlFor="ficha-select" className="mb-1 block text-xs font-medium text-muted">
              Ficha
            </label>
            {cargandoFichas ? (
              <div className="flex items-center gap-2 py-2 text-xs text-muted">
                <Loader2 className="shrink-0 animate-spin" size={16} aria-hidden />
                Cargando fichas…
              </div>
            ) : fichas.length === 0 ? (
              <p className="py-2 text-xs text-muted">No tienes fichas asignadas.</p>
            ) : (
              <select
                id="ficha-select"
                className={claseSelect}
                value={fichaId}
                onChange={handleCambioFicha}
              >
                <option value="">Elige una ficha…</option>
                {fichas.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.numero_ficha}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {fichaSeleccionada && !hayRangoTomar && (
        <p className="mb-4 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs leading-snug text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          La vigencia de esta ficha comienza el {formatoFechaColombia(fichaSeleccionada.fecha_inicio)}. Mientras
          la fecha de hoy sea anterior a ese día, no hay fechas disponibles para tomar asistencia (no se
          registran días futuros). Vuelve cuando el calendario alcance el inicio de la ficha o recarga la
          página ese día.
        </p>
      )}

      {fichaSeleccionada && hayRangoTomar && (
        <p className="mb-4 text-xs text-muted">
          Al cambiar de ficha, la fecha se ajusta al rango permitido de esa ficha (vigencia y no futuro
          respecto a hoy). Puedes elegir un día pasado dentro de la vigencia; la sesión solo se abre si ese
          día tienes horario asignado en esta ficha. Si la asistencia de ese día ya fue guardada,{" "}
          <Link href="/asistencia/historial" className="font-medium text-verde underline">
            corrígela en Historial de asistencia
          </Link>{" "}
          (allí puedes ajustar registros de sesiones ya cerradas que te correspondan).
        </p>
      )}

      {candidatosHorarios && candidatosHorarios.length > 0 && (
        <div className="mb-4 rounded-lg border border-borderSubtle/80 bg-surfaceMuted p-3">
          <p className="mb-2 text-xs leading-snug text-foreground">
            Varios horarios para esta fecha. Elige cuál registrar.
          </p>
          <div className="flex flex-wrap items-stretch sm:items-center gap-2">
            <select
              id="horario-candidato-select"
              className={`${claseSelect} flex-1 min-w-[160px] sm:min-w-[200px]`}
              value={horarioElegido}
              onChange={(e) => setHorarioElegido(e.target.value ? Number(e.target.value) : "")}
              aria-label="Horario a registrar"
            >
              <option value="">Horario…</option>
              {candidatosHorarios.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.etiqueta}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-verde text-white text-xs font-medium hover:bg-[#2E7D22] disabled:opacity-50 shrink-0"
              disabled={cargandoSesion}
              onClick={() => continuarConHorario()}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {cargandoSesion && fichaId !== "" && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted">
          <Loader2 className="animate-spin text-verde" size={24} aria-hidden />
          Preparando sesión…
        </div>
      )}

      {!cargandoSesion && sesion && aprendices.length > 0 && (
        <div className="rounded-xl border border-borderSubtle bg-surface p-4 shadow-sm">
          <div className="mb-4">
            <ProgressBar marcados={marcadosCount} total={aprendices.length} />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-verde text-verde text-xs font-medium hover:bg-verdeClaro"
              onClick={marcarTodosPresentesSinMarcar}
            >
              Marcar todos presentes
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {aprendices.map((a) => (
              <FilaAprendiz
                key={a.id}
                aprendiz={a}
                maxHorasParcial={maxHorasParcial}
                marca={marcas[a.id] ?? { tipo: null, horas_inasistencia: null }}
                onCambio={(m) => actualizarMarca(a.id, m)}
              />
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="px-5 py-2 rounded-lg bg-verde text-white text-sm font-medium hover:bg-[#2E7D22] disabled:opacity-50 disabled:pointer-events-none"
              disabled={guardando}
              onClick={() => enviarGuardado()}
            >
              {guardando ? "Guardando…" : "Guardar asistencia"}
            </button>
          </div>
        </div>
      )}

      {!cargandoSesion &&
        fichaId !== "" &&
        hayRangoTomar &&
        sesion === null &&
        !candidatosHorarios && (
          <p className="border-t border-borderSubtle/70 py-6 text-left text-xs text-muted">
            No hay sesión activa. Revisa la ficha o los mensajes anteriores.
          </p>
        )}
    </div>
  );
}
