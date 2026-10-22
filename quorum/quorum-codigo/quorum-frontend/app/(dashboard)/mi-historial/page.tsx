"use client";

// Mi historial — aprendiz ve solo sus sesiones de asistencia (solo lectura, Módulo 9)

import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ListaRegistrosHistorialAprendiz from "../../../components/aprendiz/ListaRegistrosHistorialAprendiz";
import ResumenTotalesHistorial from "../../../components/aprendiz/ResumenTotalesHistorial";
import EmptyState from "../../../components/ui/EmptyState";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useAuth } from "../../../hooks/useAuth";
import { obtenerMiHistorial } from "../../../services/aprendiz.service";
import type { MiHistorialRespuesta } from "../../../types/miHistorial";

export default function MiHistorialPage() {
  const router = useRouter();
  const { usuario, cargando: cargandoAuth } = useAuth();
  const [datos, setDatos] = useState<MiHistorialRespuesta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [huboError, setHuboError] = useState(false);

  // Solo aprendices usan esta pantalla; el resto vuelve al dashboard
  useEffect(() => {
    if (!cargandoAuth && usuario && usuario.rol !== "aprendiz") {
      router.replace("/dashboard");
    }
  }, [cargandoAuth, usuario, router]);

  useEffect(() => {
    if (cargandoAuth || !usuario || usuario.rol !== "aprendiz") {
      return;
    }

    let cancelado = false;

    async function cargar() {
      setCargando(true);
      setHuboError(false);
      try {
        const resp = await obtenerMiHistorial();
        if (!cancelado) {
          setDatos(resp);
        }
      } catch (err: unknown) {
        if (cancelado) return;
        const mensaje =
          err &&
          typeof err === "object" &&
          "response" in err &&
          err.response &&
          typeof err.response === "object" &&
          "status" in err.response &&
          err.response.status === 403
            ? "No tienes permiso para ver este historial."
            : "No se pudo cargar tu historial. Intenta de nuevo.";
        toast.error("Error", { description: mensaje });
        setDatos(null);
        setHuboError(true);
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

  if (cargandoAuth || (usuario && usuario.rol !== "aprendiz")) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  const totales = datos?.totales;
  const registros = datos?.registros ?? [];
  const haySesiones = (totales?.total_sesiones ?? 0) > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-verdeClaro flex items-center justify-center">
          <BookOpen size={22} className="text-verde" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Mi historial</h1>
          <p className="text-sm text-muted">
            Tu registro de asistencia en la ficha (solo lectura)
          </p>
        </div>
      </div>

      {cargando ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : huboError ? (
        <div className="rounded-xl border border-borderSubtle bg-surface p-8 text-center text-sm text-muted">
          No se pudieron obtener los datos. Recarga la página o vuelve a iniciar sesión.
        </div>
      ) : !haySesiones ? (
        <EmptyState
          Icono={BookOpen}
          titulo="Aún no hay sesiones registradas"
          descripcion="Cuando tu instructor tome asistencia, aquí verás cada sesión con fecha, ficha y tipo."
        />
      ) : totales ? (
        <>
          <ResumenTotalesHistorial
            totales={totales}
            mensajeAlertaInasistencia="Supera el 20 % de tus horas programadas"
          />
          <ListaRegistrosHistorialAprendiz registros={registros} />
        </>
      ) : null}
    </div>
  );
}
