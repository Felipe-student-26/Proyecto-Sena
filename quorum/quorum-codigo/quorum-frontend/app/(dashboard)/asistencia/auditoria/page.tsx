"use client";

// Auditoría de correcciones de asistencia (instructores) — solo administrador

import { isAxiosError } from "axios";
import { ClipboardList, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import DataTable from "../../../../components/ui/DataTable";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import { useAuth } from "../../../../hooks/useAuth";
import {
  getAuditoriaAsistencia,
  type FilaAuditoriaAsistencia,
} from "../../../../services/auditoriaAsistencia.service";
import { getFichas } from "../../../../services/fichas.service";
import type { FichaListado } from "../../../../types/ficha";

function formatearFechaHora(iso: string): string {
  const normalizado = iso.includes("T") ? iso : iso.replace(" ", "T");
  const d = new Date(normalizado);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatearFechaSesion(f: string | null): string {
  if (!f) return "—";
  const [y, m, d] = f.split("-");
  if (y && m && d) return `${d}/${m}/${y}`;
  return f;
}

export default function AuditoriaAsistenciaPage() {
  const router = useRouter();
  const { usuario, cargando: cargandoAuth } = useAuth();
  const esAdmin = usuario?.rol === "admin";

  const [cargando, setCargando] = useState(true);
  const [fichas, setFichas] = useState<FichaListado[]>([]);
  const [filas, setFilas] = useState<FilaAuditoriaAsistencia[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);

  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [fichaId, setFichaId] = useState<string>("");
  /** Incrementar al pulsar Buscar aunque la página siga en 1 */
  const [repintar, setRepintar] = useState(0);

  const cargarFichas = useCallback(async () => {
    try {
      const r = await getFichas({ per_page: 100, activo: 1 });
      setFichas(r.data ?? []);
    } catch {
      setFichas([]);
    }
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const r = await getAuditoriaAsistencia({
        page: pagina,
        per_page: 15,
        desde: desde.trim() || undefined,
        hasta: hasta.trim() || undefined,
        ficha_id: fichaId ? parseInt(fichaId, 10) : undefined,
      });
      setFilas(r.data);
      setTotalPaginas(r.last_page);
      setTotal(r.total);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 403) {
        router.replace("/dashboard");
        return;
      }
      toast.error("Error", { description: "No se pudo cargar la auditoría." });
    } finally {
      setCargando(false);
    }
  }, [pagina, desde, hasta, fichaId, router]);

  useEffect(() => {
    if (cargandoAuth) return;
    if (!esAdmin) {
      router.replace("/dashboard");
      return;
    }
    void cargarFichas();
  }, [cargandoAuth, esAdmin, router, cargarFichas]);

  useEffect(() => {
    if (!esAdmin || cargandoAuth) return;
    void cargar();
  }, [esAdmin, cargandoAuth, cargar, repintar]);

  function buscar() {
    setPagina(1);
    setRepintar((n) => n + 1);
  }

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

  return (
    <div className="max-w-[100rem] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-verdeClaro flex items-center justify-center">
          <ClipboardList size={22} className="text-verde" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Auditoría de asistencia</h1>
          <p className="text-sm text-muted">
            Cambios realizados por instructores sobre registros ya cerrados
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-borderSubtle bg-surface p-4 space-y-3">
        <p className="text-sm text-muted">
          Solo aparecen correcciones guardadas desde el historial de asistencia (sesión cerrada).
        </p>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label htmlFor="aud_desde" className="block text-xs text-muted mb-1">
              Desde
            </label>
            <input
              id="aud_desde"
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="rounded-lg border border-borderSubtle bg-input px-2 py-1.5 text-sm text-foreground"
            />
          </div>
          <div>
            <label htmlFor="aud_hasta" className="block text-xs text-muted mb-1">
              Hasta
            </label>
            <input
              id="aud_hasta"
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="rounded-lg border border-borderSubtle bg-input px-2 py-1.5 text-sm text-foreground"
            />
          </div>
          <div className="min-w-[12rem]">
            <label htmlFor="aud_ficha" className="block text-xs text-muted mb-1">
              Ficha
            </label>
            <select
              id="aud_ficha"
              value={fichaId}
              onChange={(e) => setFichaId(e.target.value)}
              className="w-full rounded-lg border border-borderSubtle bg-input px-2 py-1.5 text-sm text-foreground"
            >
              <option value="">Todas</option>
              {fichas.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.numero_ficha}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => buscar()}
            className="inline-flex items-center gap-2 rounded-lg bg-verde px-4 py-2 text-sm font-medium text-white hover:bg-verdeOscuro"
          >
            <Search size={16} />
            Buscar
          </button>
        </div>
      </div>

      {cargando ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <DataTable<FilaAuditoriaAsistencia>
          columnas={[
            {
              clave: "creado_en",
              etiqueta: "Fecha cambio",
              render: (f) => formatearFechaHora(f.creado_en),
            },
            { clave: "numero_ficha", etiqueta: "Ficha", render: (f) => f.numero_ficha ?? "—" },
            {
              clave: "fecha_sesion",
              etiqueta: "Fecha sesión",
              render: (f) => formatearFechaSesion(f.fecha_sesion),
            },
            {
              clave: "aprendiz",
              etiqueta: "Aprendiz",
              render: (f) => (
                <span>
                  {f.aprendiz_nombre}
                  {f.aprendiz_documento ? (
                    <span className="block text-xs text-muted">{f.aprendiz_documento}</span>
                  ) : null}
                </span>
              ),
            },
            {
              clave: "cambio",
              etiqueta: "Tipo",
              anchoMinimo: "10rem",
              render: (f) => (
                <span className="text-xs">
                  {(f.tipo_anterior ?? "—") + " → " + f.tipo_nuevo}
                  {(f.horas_inasistencia_ant != null || f.horas_inasistencia_new != null) && (
                    <span className="block text-muted">
                      h: {f.horas_inasistencia_ant ?? "—"} → {f.horas_inasistencia_new ?? "—"}
                    </span>
                  )}
                </span>
              ),
            },
            {
              clave: "modifico",
              etiqueta: "Modificó",
              render: (f) => (
                <span className="text-xs">
                  {f.modificado_por_nombre}
                  {f.modificado_por_rol ? (
                    <span className="block text-muted">{f.modificado_por_rol}</span>
                  ) : null}
                </span>
              ),
            },
            {
              clave: "razon",
              etiqueta: "Razón",
              anchoMinimo: "8rem",
              render: (f) => <span className="text-xs break-words max-w-[12rem]">{f.razon ?? "—"}</span>,
            },
          ]}
          datos={filas}
          getClaveFila={(f) => f.id}
          paginacion={{
            paginaActual: pagina,
            totalPaginas,
            total,
            alCambiarPagina: (p) => setPagina(p),
          }}
          vacioTexto="No hay correcciones registradas. Los instructores deben editar desde el historial con sesión cerrada."
        />
      )}
    </div>
  );
}
