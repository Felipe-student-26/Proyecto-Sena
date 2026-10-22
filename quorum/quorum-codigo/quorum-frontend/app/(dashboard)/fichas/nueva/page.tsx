"use client";

// Crear nueva ficha de caracterización (solo admin)

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import FichaFormulario from "../../../../components/fichas/FichaFormulario";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import { useAuth } from "../../../../hooks/useAuth";
import {
  getCentrosFormacion,
  getInstructoresDisponibles,
  getMacrorregiones,
  getProgramasFormacion,
} from "../../../../services/catalogos.service";
import { crearFicha } from "../../../../services/fichas.service";
import type {
  CatalogoItem,
  InstructorDisponible,
  Macrorregion,
  PayloadCrearFicha,
  ProgramaCatalogoItem,
} from "../../../../types/ficha";
import { isAxiosError } from "axios";

export default function NuevaFichaPage() {
  const router = useRouter();
  const { usuario, cargando: cargandoAuth } = useAuth();
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [centros, setCentros] = useState<CatalogoItem[]>([]);
  const [programas, setProgramas] = useState<ProgramaCatalogoItem[]>([]);
  const [instructores, setInstructores] = useState<InstructorDisponible[]>([]);
  const [macrorregiones, setMacrorregiones] = useState<Macrorregion[]>([]);

  useEffect(() => {
    if (cargandoAuth || !usuario) {
      return;
    }
    if (usuario.rol !== "admin") {
      router.replace("/fichas");
    }
  }, [cargandoAuth, usuario, router]);

  useEffect(() => {
    if (cargandoAuth || usuario?.rol !== "admin") {
      return;
    }
    let cancel = false;
    (async () => {
      setCargando(true);
      try {
        const [c, p, i, m] = await Promise.all([
          getCentrosFormacion(),
          getProgramasFormacion(),
          getInstructoresDisponibles(),
          getMacrorregiones(),
        ]);
        if (!cancel) {
          setCentros(c);
          setProgramas(p);
          setInstructores(i);
          setMacrorregiones(m);
        }
      } catch {
        if (!cancel) {
          toast.error("No se pudieron cargar los catálogos", { description: "¿Tienes permisos de administrador?" });
          router.replace("/fichas");
        }
      } finally {
        if (!cancel) {
          setCargando(false);
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, [cargandoAuth, usuario, router]);

  async function alGuardar(payload: PayloadCrearFicha) {
    setEnviando(true);
    try {
      const { id } = await crearFicha(payload);
      toast.success("Ficha creada", { description: "La Ficha de Caracterización se guardó correctamente." });
      router.push(`/fichas/${id}`);
      router.refresh();
    } catch (e: unknown) {
      let texto = "No se pudo crear la ficha.";
      if (isAxiosError(e) && e.response?.data) {
        const d = e.response.data as {
          message?: string;
          errors?: Record<string, string[]>;
        };
        if (d.errors) {
          texto = Object.values(d.errors).flat().join(" ");
        } else if (d.message) {
          texto = d.message;
        }
      }
      toast.error("Error al guardar", { description: texto });
    } finally {
      setEnviando(false);
    }
  }

  if (cargandoAuth || !usuario || usuario.rol !== "admin") {
    return (
      <div className="max-w-4xl mx-auto">
        <LoadingSpinner texto="Cargando…" />
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="max-w-4xl mx-auto">
        <LoadingSpinner texto="Cargando formulario…" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/fichas"
        className="inline-flex items-center gap-2 text-sm text-info hover:underline"
      >
        <ArrowLeft size={18} aria-hidden />
        Volver al listado
      </Link>
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Nueva Ficha de Caracterización
        </h1>
        <p className="text-sm text-muted mt-1">
          Completa los datos del grupo, instructores y horario semanal de
          Formación.
        </p>
      </div>
      <FichaFormulario
        centros={centros}
        programas={programas}
        instructoresDisponibles={instructores}
        macrorregiones={macrorregiones}
        alEnviar={alGuardar}
        textoBoton="Crear ficha"
        enviando={enviando}
      />
    </div>
  );
}
