"use client";

// Listado de fichas de caracterización con filtros y tabla (Módulo 5)

import { FolderOpen, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import DataTable from "../../../components/ui/DataTable";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useAuth } from "../../../hooks/useAuth";
import { getFichas } from "../../../services/fichas.service";
import { getCentrosFormacion, getProgramasFormacion } from "../../../services/catalogos.service";
import type { CatalogoItem, FichaListado, ProgramaCatalogoItem } from "../../../types/ficha";

export default function FichasPage() {
  const router = useRouter();
  const { usuario, cargando: cargandoAuth } = useAuth();
  const [cargando, setCargando] = useState(true);
  const [fichas, setFichas] = useState<FichaListado[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [centroId, setCentroId] = useState("");
  const [programaId, setProgramaId] = useState("");
  const [activo, setActivo] = useState<string>("");
  const [centros, setCentros] = useState<CatalogoItem[]>([]);
  const [programas, setProgramas] = useState<ProgramaCatalogoItem[]>([]);

  const esAdmin = usuario?.rol === "admin";

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await getFichas({
        page: pagina,
        per_page: 12,
        busqueda: busqueda.trim() || undefined,
        centro_id: centroId ? Number(centroId) : undefined,
        programa_id: programaId ? Number(programaId) : undefined,
        activo: activo === "" ? undefined : (Number(activo) as 0 | 1),
      });
      setFichas(res.data);
      setTotalPaginas(res.last_page);
      setTotal(res.total);
    } catch {
      setFichas([]);
      toast.error("No se pudieron cargar las fichas", { description: "Verifica tu conexión o inténtalo más tarde." });
    } finally {
      setCargando(false);
    }
  }, [pagina, busqueda, centroId, programaId, activo]);

  useEffect(() => {
    if (cargandoAuth || !usuario) {
      return;
    }
    if (usuario.rol === "aprendiz") {
      router.replace("/mi-historial");
      return;
    }
    void cargar();
  }, [cargandoAuth, usuario, cargar, router]);

  useEffect(() => {
    if (!esAdmin) {
      return;
    }
    void (async () => {
      try {
        const [c, p] = await Promise.all([
          getCentrosFormacion(),
          getProgramasFormacion(),
        ]);
        setCentros(c);
        setProgramas(p);
      } catch {
        /* filtros opcionales */
      }
    })();
  }, [esAdmin]);

  useEffect(() => {
    if (cargandoAuth || !usuario || usuario.rol === "aprendiz") {
      return;
    }
    router.prefetch("/fichas/nueva");
  }, [cargandoAuth, usuario, router]);

  if (cargandoAuth || !usuario) {
    return (
      <div className="max-w-6xl mx-auto">
        <LoadingSpinner texto="Cargando…" />
      </div>
    );
  }

  if (usuario.rol === "aprendiz") {
    return null;
  }

  const columnas = [
    {
      clave: "numero_ficha",
      etiqueta: "Ficha",
      render: (f: FichaListado) => (
        <Link
          href={`/fichas/${f.id}`}
          className="font-medium text-info hover:underline"
        >
          {f.numero_ficha}
        </Link>
      ),
    },
    {
      clave: "centro",
      etiqueta: "Centro",
      anchoMinimo: "140px",
      render: (f: FichaListado) => f.centro?.nombre ?? "—",
    },
    {
      clave: "programa",
      etiqueta: "Programa",
      anchoMinimo: "160px",
      render: (f: FichaListado) => f.programa?.nombre ?? "—",
    },
    {
      clave: "estado",
      etiqueta: "Estado",
      render: (f: FichaListado) => (
        <span className="capitalize">{f.estado}</span>
      ),
    },
    {
      clave: "activo",
      etiqueta: "Activa en sistema",
      render: (f: FichaListado) => (f.activo ? "Sí" : "No"),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-verdeClaro flex items-center justify-center">
            <FolderOpen size={22} className="text-verde" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Fichas de Caracterización
            </h1>
            <p className="text-sm text-muted">
              Gestión de grupos de Formación, jornadas y Ambientes de Formación
              académica
            </p>
          </div>
        </div>
        {esAdmin && (
          <Link
            href="/fichas/nueva"
            className="inline-flex items-center gap-2 rounded-xl bg-verde px-4 py-2.5 text-sm font-semibold text-white hover:bg-verdeOscuro"
          >
            <Plus size={20} aria-hidden />
            Nueva ficha
          </Link>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-3 items-end rounded-xl border border-borderSubtle bg-surface p-4">
        <label className="text-sm flex-1 min-w-[140px]">
          <span className="text-muted block mb-1">Buscar</span>
          <input
            className="quorum-field w-full"
            placeholder="Número de ficha…"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
          />
        </label>
        {esAdmin && (
          <>
            <label className="text-sm min-w-[160px]">
              <span className="text-muted block mb-1">Centro</span>
              <select
                className="quorum-field w-full"
                value={centroId}
                onChange={(e) => {
                  setCentroId(e.target.value);
                  setPagina(1);
                }}
              >
                <option value="">Todos</option>
                {centros.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm min-w-[160px]">
              <span className="text-muted block mb-1">Programa</span>
              <select
                className="quorum-field w-full"
                value={programaId}
                onChange={(e) => {
                  setProgramaId(e.target.value);
                  setPagina(1);
                }}
              >
                <option value="">Todos</option>
                {programas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        <label className="text-sm min-w-[120px]">
          <span className="text-muted block mb-1">Activo</span>
          <select
            className="quorum-field w-full"
            value={activo}
            onChange={(e) => {
              setActivo(e.target.value);
              setPagina(1);
            }}
          >
            <option value="">Todos</option>
            <option value="1">Activas</option>
            <option value="0">Inactivas</option>
          </select>
        </label>
        <button
          type="button"
          className="rounded-lg border border-borderSubtle bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:bg-surfaceMuted"
          onClick={() => void cargar()}
        >
          Aplicar filtros
        </button>
      </div>

      {cargando ? (
        <LoadingSpinner texto="Cargando fichas…" />
      ) : (
        <DataTable<FichaListado>
          columnas={columnas}
          datos={fichas}
          getClaveFila={(f) => f.id}
          paginacion={
            totalPaginas > 1
              ? {
                  paginaActual: pagina,
                  totalPaginas,
                  total,
                  alCambiarPagina: setPagina,
                }
              : undefined
          }
          vacioTexto="No hay fichas que coincidan con los filtros."
        />
      )}
    </div>
  );
}
