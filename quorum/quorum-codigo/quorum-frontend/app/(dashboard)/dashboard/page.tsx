"use client";

// Dashboard por rol — datos desde GET /api/dashboard (Módulo 4)

import {
  Activity,
  AlertTriangle,
  BookOpen,
  Building2,
  CalendarCheck,
  FolderOpen,
  LayoutDashboard,
  Percent,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import EmptyState from "../../../components/ui/EmptyState";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import StatCard from "../../../components/ui/StatCard";
import { useAuth } from "../../../hooks/useAuth";
import { getDashboard } from "../../../services/dashboard.service";
import {
  esDashboardAdmin,
  esDashboardCoordinador,
  esDashboardInstructorGestor,
  type DashboardRespuesta,
} from "../../../types/dashboard";

function formatearFechaActividad(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const { usuario, cargando: cargandoAuth } = useAuth();
  const [datos, setDatos] = useState<DashboardRespuesta | null>(null);
  const [cargando, setCargando] = useState(true);

  // Aprendices no usan esta vista — redirigir a Mi historial
  useEffect(() => {
    if (!cargandoAuth && usuario?.rol === "aprendiz") {
      router.replace("/mi-historial");
    }
  }, [cargandoAuth, usuario, router]);

  useEffect(() => {
    if (cargandoAuth || !usuario || usuario.rol === "aprendiz") {
      return;
    }

    let cancelado = false;

    async function cargar() {
      setCargando(true);
      try {
        const resp = await getDashboard();
        if (!cancelado) {
          setDatos(resp);
        }
      } catch {
        if (!cancelado) {
          setDatos(null);
          toast.error("No se pudo cargar el dashboard", { description: "Verifica tu conexión o inténtalo más tarde." });
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    void cargar();

    return () => {
      cancelado = true;
    };
  }, [cargandoAuth, usuario]);

  if (cargandoAuth || usuario?.rol === "aprendiz") {
    return (
      <div className="max-w-4xl mx-auto">
        <LoadingSpinner texto="Cargando..." />
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-verdeClaro dark:bg-verdeOscuro/35">
          <LayoutDashboard
            size={22}
            className="text-verde"
            aria-hidden="true"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted">Resumen según tu rol</p>
        </div>
      </div>

      {cargando ? (
        <LoadingSpinner texto="Cargando estadísticas..." />
      ) : datos ? (
        <ContenidoPorRol datos={datos} />
      ) : null}
    </div>
  );
}

function ContenidoPorRol({ datos }: { datos: DashboardRespuesta }) {
  if (esDashboardAdmin(datos)) {
    return <VistaAdmin datos={datos} />;
  }
  if (esDashboardCoordinador(datos)) {
    return <VistaCoordinador datos={datos} />;
  }
  if (esDashboardInstructorGestor(datos)) {
    return <VistaInstructor datos={datos} />;
  }
  return null;
}

function VistaAdmin({
  datos,
}: {
  datos: Extract<DashboardRespuesta, { rol: "admin" }>;
}) {
  const { resumen, actividad_reciente } = datos;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          etiqueta="Usuarios activos"
          valor={resumen.usuarios_activos}
          Icono={Users}
          classNameIcono="text-rolAdmin"
        />
        <StatCard
          etiqueta="Fichas activas"
          valor={resumen.fichas_activas}
          Icono={FolderOpen}
          classNameIcono="text-verde"
        />
        <StatCard
          etiqueta="Aprendices"
          valor={resumen.aprendices}
          Icono={BookOpen}
          classNameIcono="text-rolAprendiz"
        />
        <StatCard
          etiqueta="Sesiones hoy"
          valor={resumen.sesiones_hoy}
          Icono={CalendarCheck}
          classNameIcono="text-info"
        />
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-3">
        Actividad reciente
      </h2>
      {actividad_reciente.length === 0 ? (
        <EmptyState
          Icono={Activity}
          titulo="Sin actividad registrada"
          descripcion="Cuando haya acciones en el sistema, aparecerán aquí."
        />
      ) : (
        <ul className="space-y-2">
          {actividad_reciente.map((item, i) => (
            <li
              key={`${item.creado_en}-${i}`}
              className="bg-surface rounded-lg border border-borderSubtle px-4 py-3 text-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                <span className="font-medium text-foreground">
                  {item.accion}
                </span>
                <time
                  className="text-xs text-muted tabular-nums"
                  dateTime={item.creado_en}
                >
                  {formatearFechaActividad(item.creado_en)}
                </time>
              </div>
              <p className="text-muted">{item.descripcion}</p>
              <p className="text-xs text-muted mt-1">
                Por: {item.usuario_nombre}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function VistaCoordinador({
  datos,
}: {
  datos: Extract<DashboardRespuesta, { rol: "coordinador" }>;
}) {
  const { resumen, fichas_por_centro, fichas_asistencia } = datos;
  const pctGlobal =
    resumen.promedio_asistencia_mes !== null
      ? `${resumen.promedio_asistencia_mes}%`
      : "—";

  const sinTablaAsistencia =
    fichas_asistencia.length === 0 ||
    fichas_asistencia.every((f) => f.porcentaje === null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          etiqueta="Aprendices en el sistema"
          valor={resumen.total_aprendices}
          Icono={Users}
          classNameIcono="text-rolAprendiz"
        />
        <StatCard
          etiqueta="% asistencia (mes actual)"
          valor={pctGlobal}
          Icono={Percent}
          classNameIcono="text-verde"
        />
        <StatCard
          etiqueta="Centros con fichas"
          valor={fichas_por_centro.length}
          Icono={Building2}
          classNameIcono="text-rolCoordinador"
        />
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-3">
        Fichas activas por centro
      </h2>
      {fichas_por_centro.length === 0 ? (
        <EmptyState
          Icono={Building2}
          titulo="No hay fichas activas por centro"
          descripcion="Cuando existan fichas activas, verás el conteo agrupado aquí."
        />
      ) : (
        <div className="overflow-x-auto mb-8 rounded-xl border border-borderSubtle bg-surface">
          <table className="min-w-full text-sm">
            <thead className="bg-surfaceMuted text-left text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Centro</th>
                <th className="px-4 py-3 font-semibold text-right">
                  Fichas activas
                </th>
              </tr>
            </thead>
            <tbody>
              {fichas_por_centro.map((f) => (
                <tr
                  key={f.centro_id}
                  className="border-t border-borderSubtle/70 hover:bg-surfaceMuted/60"
                >
                  <td className="px-4 py-2.5">{f.centro_nombre}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {f.cantidad_fichas}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="text-lg font-semibold text-foreground mb-3">
        Asistencia por ficha (mes actual)
      </h2>
      {sinTablaAsistencia ? (
        <EmptyState
          Icono={Percent}
          titulo="Sin datos de asistencia este mes"
          descripcion="Aún no hay registros de asistencia en el mes actual para calcular porcentajes."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-borderSubtle bg-surface">
          <table className="min-w-full text-sm">
            <thead className="bg-surfaceMuted text-left text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Ficha</th>
                <th className="px-4 py-3 font-semibold">Centro</th>
                <th className="px-4 py-3 font-semibold text-right">% mes</th>
              </tr>
            </thead>
            <tbody>
              {fichas_asistencia.map((f) => (
                <tr
                  key={f.ficha_id}
                  className="border-t border-borderSubtle/70 hover:bg-surfaceMuted/60"
                >
                  <td className="px-4 py-2.5 font-medium">{f.numero_ficha}</td>
                  <td className="px-4 py-2.5 text-muted">
                    {f.centro_nombre}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {f.porcentaje !== null ? `${f.porcentaje}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function VistaInstructor({
  datos,
}: {
  datos: Extract<
    DashboardRespuesta,
    { rol: "instructor" | "gestor_grupo" }
  >;
}) {
  const { resumen, fichas, aprendices_alerta } = datos;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard
          etiqueta="Mis fichas asignadas"
          valor={resumen.total_fichas_asignadas}
          Icono={FolderOpen}
          classNameIcono="text-verde"
        />
        <StatCard
          etiqueta="Aprendices con alta inasistencia"
          valor={aprendices_alerta.length}
          Icono={AlertTriangle}
          classNameIcono="text-advertencia"
        />
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-3">
        Fichas asignadas
      </h2>
      {fichas.length === 0 ? (
        <EmptyState
          Icono={FolderOpen}
          titulo="No tienes fichas asignadas"
          descripcion="Cuando un administrador te asigne a una ficha, aparecerá aquí."
        />
      ) : (
        <ul className="flex flex-wrap gap-2 mb-8">
          {fichas.map((f) => (
            <li
              key={f.id}
              className="px-3 py-1.5 rounded-lg bg-surface border border-borderSubtle text-sm text-foreground"
            >
              {f.numero_ficha}
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-lg font-semibold text-foreground mb-3">
        Aprendices con inasistencia ≥ 20% (mes actual)
      </h2>
      {aprendices_alerta.length === 0 ? (
        <EmptyState
          Icono={AlertTriangle}
          titulo="Ningún aprendiz supera el umbral este mes"
          descripcion="Se consideran horas de falla y horas parciales no asistidas respecto al total programado."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-borderSubtle bg-surface">
          <table className="min-w-full text-sm">
            <thead className="bg-surfaceMuted text-left text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Aprendiz</th>
                <th className="px-4 py-3 font-semibold">Ficha</th>
                <th className="px-4 py-3 font-semibold text-right">
                  % inasistencia
                </th>
              </tr>
            </thead>
            <tbody>
              {aprendices_alerta.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-borderSubtle/70 hover:bg-surfaceMuted/60"
                >
                  <td className="px-4 py-2.5">
                    {a.nombre} {a.apellido}
                  </td>
                  <td className="px-4 py-2.5 text-muted">{a.numero_ficha}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-error font-medium">
                    {a.porcentaje_inasistencia}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
