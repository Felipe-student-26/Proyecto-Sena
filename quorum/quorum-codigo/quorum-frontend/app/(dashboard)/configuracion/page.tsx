"use client";

// Configuración del sistema y días festivos — Módulo 12 (solo administrador)

import { isAxiosError } from "axios";
import {
  CalendarOff,
  Clock,
  History,
  Loader2,
  Lock,
  Save,
  Settings,
  Shield,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "../../../lib/confirm";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useAuth } from "../../../hooks/useAuth";
import { getConfiguracion, patchConfiguracion } from "../../../services/configuracion.service";
import {
  crearDiaFestivo,
  desactivarDiaFestivo,
  getDiasFestivos,
} from "../../../services/diasFestivos.service";
import { getHistorialActividad } from "../../../services/historialActividad.service";
import type { ConfiguracionFila, DiaFestivo, HistorialActividadFila } from "../../../types/configuracion";

// Muestra fecha Y-m-d como DD/MM/AAAA
function formatearFechaSolo(fechaYmd: string): string {
  const [y, m, d] = fechaYmd.split("-");
  if (!y || !m || !d) return fechaYmd;
  return `${d}/${m}/${y}`;
}

// Fecha/hora del historial en español (zona Bogotá)
function formatearFechaHora(iso: string): string {
  const normalizado = iso.includes("T") ? iso : iso.replace(" ", "T");
  const fecha = new Date(normalizado);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function valorClave(filas: ConfiguracionFila[], clave: string): string {
  return filas.find((f) => f.clave === clave)?.valor ?? "";
}

export default function ConfiguracionPage() {
  const router = useRouter();
  const { usuario, cargando: cargandoAuth, recargarUsuario } = useAuth();
  const confirm = useConfirm();

  const esAdmin = usuario?.rol === "admin";

  const [cargando, setCargando] = useState(false);
  const [festivos, setFestivos] = useState<DiaFestivo[]>([]);
  const [anioFestivos, setAnioFestivos] = useState<number>(new Date().getFullYear());
  const [historial, setHistorial] = useState<HistorialActividadFila[]>([]);

  // Campos editables — datos del sistema
  const [nombreSistema, setNombreSistemaLocal] = useState("");
  const [nombreInstitucion, setNombreInstitucion] = useState("");

  // Seguridad
  const [timeoutSesion, setTimeoutSesion] = useState("");
  const [maxIntentos, setMaxIntentos] = useState("");

  // Nuevo festivo
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevaDescFestivo, setNuevaDescFestivo] = useState("");

  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const [guardandoTimeout, setGuardandoTimeout] = useState(false);
  const [guardandoIntentos, setGuardandoIntentos] = useState(false);
  const [guardandoFestivo, setGuardandoFestivo] = useState(false);

  const cargarTodo = useCallback(async () => {
    setCargando(true);
    try {
      const [cfg, fest, hist] = await Promise.all([
        getConfiguracion(),
        getDiasFestivos(),
        getHistorialActividad(),
      ]);
      setFestivos(fest.data);
      setAnioFestivos(fest.anio);
      setHistorial(hist);

      setNombreSistemaLocal(valorClave(cfg, "nombre_sistema"));
      setNombreInstitucion(valorClave(cfg, "nombre_institucion"));
      setTimeoutSesion(valorClave(cfg, "timeout_sesion"));
      setMaxIntentos(valorClave(cfg, "max_intentos_login"));
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 403) {
        toast.error("Sin permiso", { description: "Solo el administrador puede ver esta página." });
        router.replace("/dashboard");
        return;
      }
      toast.error("Error", { description: "No se pudieron cargar los datos de configuración." });
    } finally {
      setCargando(false);
    }
  }, [router]);

  useEffect(() => {
    if (cargandoAuth) return;
    if (!usuario) return;
    if (!esAdmin) {
      router.replace("/dashboard");
      return;
    }
    void cargarTodo();
  }, [cargandoAuth, usuario, esAdmin, router, cargarTodo]);

  async function guardarDatosSistema() {
    setGuardandoDatos(true);
    try {
      await patchConfiguracion("nombre_sistema", nombreSistema.trim());
      await patchConfiguracion("nombre_institucion", nombreInstitucion.trim());
      await recargarUsuario();
      toast.success("Guardado", { description: "Los datos del sistema se actualizaron. El nombre en la barra superior ya está al día." });
      await cargarTodo();
    } catch (err) {
      const msg = isAxiosError(err)
        ? String(err.response?.data?.message ?? "No se pudo guardar.")
        : "No se pudo guardar.";
      toast.error("Error", { description: msg });
    } finally {
      setGuardandoDatos(false);
    }
  }

  async function guardarTimeout() {
    setGuardandoTimeout(true);
    try {
      const n = parseInt(timeoutSesion, 10);
      if (Number.isNaN(n) || n < 1) {
        toast.warning("Valor inválido", { description: "Indica un número de minutos mayor o igual a 1." });
        return;
      }
      await patchConfiguracion("timeout_sesion", n);
      toast.success("Listo", { description: "Tiempo de sesión actualizado (aplica en próximas peticiones al servidor)." });
      await cargarTodo();
    } catch (err) {
      const msg = isAxiosError(err)
        ? String(err.response?.data?.message ?? "Error al guardar.")
        : "Error al guardar.";
      toast.error("Error", { description: msg });
    } finally {
      setGuardandoTimeout(false);
    }
  }

  async function guardarMaxIntentos() {
    setGuardandoIntentos(true);
    try {
      const n = parseInt(maxIntentos, 10);
      if (Number.isNaN(n) || n < 1) {
        toast.warning("Valor inválido", { description: "Indica un número de intentos mayor o igual a 1." });
        return;
      }
      await patchConfiguracion("max_intentos_login", n);
      toast.success("Listo", { description: "Máximo de intentos de login actualizado." });
      await cargarTodo();
    } catch (err) {
      const errores = isAxiosError(err) ? err.response?.data?.errors : undefined;
      const msg =
        errores && typeof errores === "object" && "valor" in errores
          ? String((errores as { valor?: string[] }).valor?.[0] ?? "Error al guardar.")
          : isAxiosError(err)
            ? String(err.response?.data?.message ?? "Error al guardar.")
            : "Error al guardar.";
      toast.error("Error", { description: msg });
    } finally {
      setGuardandoIntentos(false);
    }
  }

  async function agregarFestivo(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevaFecha.trim() || !nuevaDescFestivo.trim()) {
      toast.warning("Faltan datos", { description: "Completa la fecha y la descripción del festivo." });
      return;
    }
    setGuardandoFestivo(true);
    try {
      await crearDiaFestivo(nuevaFecha, nuevaDescFestivo.trim());
      setNuevaFecha("");
      setNuevaDescFestivo("");
      toast.success("Festivo agregado");
      await cargarTodo();
    } catch (err) {
      const errores = isAxiosError(err) ? err.response?.data?.errors : undefined;
      const msgFecha =
        errores && typeof errores === "object" && "fecha" in errores
          ? String((errores as { fecha?: string[] }).fecha?.[0] ?? "")
          : "";
      toast.error("No se pudo agregar", { description: msgFecha || (isAxiosError(err) ? String(err.response?.data?.message ?? "") : "") || "Revisa la fecha o intenta de nuevo." });
    } finally {
      setGuardandoFestivo(false);
    }
  }

  async function confirmarDesactivarFestivo(f: DiaFestivo) {
    const ok = await confirm({
      title: "¿Desactivar festivo?",
      description: `${formatearFechaSolo(f.fecha)} — ${f.descripcion}`,
      confirmText: "Sí, desactivar",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await desactivarDiaFestivo(f.id);
      toast.success("Desactivado");
      await cargarTodo();
    } catch (err) {
      toast.error("Error", { description: isAxiosError(err) ? String(err.response?.data?.message ?? "") : "No se pudo desactivar." });
    }
  }

  const seccionBase = useMemo(
    () => "rounded-xl border border-borderSubtle bg-surface p-6 shadow-sm",
    []
  );

  if (cargandoAuth || !usuario) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (!esAdmin) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-verdeClaro flex items-center justify-center">
          <Settings size={22} className="text-verde" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Configuración</h1>
          <p className="text-sm text-muted">Parámetros generales, seguridad, festivos e historial</p>
        </div>
      </div>

      {/* Sección 1 — Datos del sistema */}
      <section className={seccionBase} aria-labelledby="titulo-datos-sistema">
        <h2 id="titulo-datos-sistema" className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Settings size={20} className="text-verde" aria-hidden="true" />
          Datos del sistema
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre_sistema" className="block text-sm font-medium text-foreground mb-1">
              Nombre del sistema
            </label>
            <input
              id="nombre_sistema"
              type="text"
              value={nombreSistema}
              onChange={(e) => setNombreSistemaLocal(e.target.value)}
              className="w-full rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="nombre_institucion" className="block text-sm font-medium text-foreground mb-1">
              Nombre de la institución
            </label>
            <input
              id="nombre_institucion"
              type="text"
              value={nombreInstitucion}
              onChange={(e) => setNombreInstitucion(e.target.value)}
              className="w-full rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground"
              autoComplete="organization"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => void guardarDatosSistema()}
          disabled={guardandoDatos}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-verde px-4 py-2 text-sm font-medium text-white hover:bg-[#2E7D22] disabled:opacity-50"
        >
          {guardandoDatos ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Guardar datos del sistema
        </button>
      </section>

      {/* Sección 2 — Parámetros de seguridad */}
      <section className={seccionBase} aria-labelledby="titulo-seguridad">
        <h2 id="titulo-seguridad" className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield size={20} className="text-verde" aria-hidden="true" />
          Parámetros de seguridad
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
            <div className="flex-1">
              <label htmlFor="timeout_sesion" className="block text-sm font-medium text-foreground mb-1 flex items-center gap-1">
                <Clock size={14} aria-hidden="true" />
                Tiempo máximo de sesión (minutos)
              </label>
              <input
                id="timeout_sesion"
                type="number"
                min={1}
                value={timeoutSesion}
                onChange={(e) => setTimeoutSesion(e.target.value)}
                className="w-full max-w-xs rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground"
              />
            </div>
            <button
              type="button"
              onClick={() => void guardarTimeout()}
              disabled={guardandoTimeout}
              className="inline-flex items-center gap-2 rounded-lg border border-verde text-verde px-4 py-2 text-sm font-medium hover:bg-verdeClaro disabled:opacity-50"
            >
              {guardandoTimeout ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Guardar tiempo de sesión
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
            <div className="flex-1">
              <label htmlFor="max_intentos" className="block text-sm font-medium text-foreground mb-1 flex items-center gap-1">
                <Lock size={14} aria-hidden="true" />
                Máximo de intentos de login fallidos
              </label>
              <input
                id="max_intentos"
                type="number"
                min={1}
                value={maxIntentos}
                onChange={(e) => setMaxIntentos(e.target.value)}
                className="w-full max-w-xs rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground"
              />
            </div>
            <button
              type="button"
              onClick={() => void guardarMaxIntentos()}
              disabled={guardandoIntentos}
              className="inline-flex items-center gap-2 rounded-lg border border-verde text-verde px-4 py-2 text-sm font-medium hover:bg-verdeClaro disabled:opacity-50"
            >
              {guardandoIntentos ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Guardar intentos de login
            </button>
          </div>
        </div>
      </section>

      {/* Sección 3 — Días festivos */}
      <section className={seccionBase} aria-labelledby="titulo-festivos">
        <h2 id="titulo-festivos" className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <CalendarOff size={20} className="text-verde" aria-hidden="true" />
          Días festivos ({anioFestivos})
        </h2>
        <p className="text-sm text-muted mb-4">
          No se toma asistencia en estas fechas. Lista solo festivos activos del año en curso.
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-borderSubtle text-left text-muted">
                <th className="py-2 pr-4 font-medium">Fecha</th>
                <th className="py-2 pr-4 font-medium">Descripción</th>
                <th className="py-2 font-medium w-28">Acción</th>
              </tr>
            </thead>
            <tbody>
              {festivos.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-muted">
                    No hay festivos activos para este año.
                  </td>
                </tr>
              ) : (
                festivos.map((f) => (
                  <tr key={f.id} className="border-b border-borderSubtle/70">
                    <td className="py-2 pr-4 whitespace-nowrap">{formatearFechaSolo(f.fecha)}</td>
                    <td className="py-2 pr-4">{f.descripcion}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => void confirmarDesactivarFestivo(f)}
                        className="inline-flex items-center gap-1 text-error text-sm hover:underline"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        Desactivar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <form onSubmit={agregarFestivo} className="rounded-lg border border-borderSubtle bg-surfaceMuted p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Agregar festivo</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="nueva_fecha_festivo" className="block text-xs text-muted mb-1">
                Fecha
              </label>
              <input
                id="nueva_fecha_festivo"
                type="date"
                value={nuevaFecha}
                onChange={(e) => setNuevaFecha(e.target.value)}
                className="w-full rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label htmlFor="nueva_desc_festivo" className="block text-xs text-muted mb-1">
                Descripción
              </label>
              <input
                id="nueva_desc_festivo"
                type="text"
                maxLength={150}
                value={nuevaDescFestivo}
                onChange={(e) => setNuevaDescFestivo(e.target.value)}
                className="w-full rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground"
                placeholder="Ej. Día de la Independencia"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={guardandoFestivo}
            className="inline-flex items-center gap-2 rounded-lg bg-verde px-4 py-2 text-sm font-medium text-white hover:bg-[#2E7D22] disabled:opacity-50"
          >
            {guardandoFestivo ? <Loader2 size={18} className="animate-spin" /> : null}
            Agregar festivo
          </button>
        </form>
      </section>

      {/* Sección 4 — Historial de actividad */}
      <section className={seccionBase} aria-labelledby="titulo-historial">
        <h2 id="titulo-historial" className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <History size={20} className="text-verde" aria-hidden="true" />
          Historial de actividad (últimas 20 acciones)
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-borderSubtle text-left text-muted">
                <th className="py-2 pr-3 font-medium">Usuario</th>
                <th className="py-2 pr-3 font-medium">Acción</th>
                <th className="py-2 pr-3 font-medium">Descripción</th>
                <th className="py-2 font-medium whitespace-nowrap">Fecha y hora</th>
              </tr>
            </thead>
            <tbody>
              {historial.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-muted">
                    Aún no hay registros de actividad.
                  </td>
                </tr>
              ) : (
                historial.map((h) => (
                  <tr key={h.id} className="border-b border-borderSubtle/70 align-top">
                    <td className="py-2 pr-3">{h.usuario_nombre}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{h.accion}</td>
                    <td className="py-2 pr-3 max-w-md break-words">{h.descripcion}</td>
                    <td className="py-2 whitespace-nowrap text-muted">
                      {formatearFechaHora(h.creado_en)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
