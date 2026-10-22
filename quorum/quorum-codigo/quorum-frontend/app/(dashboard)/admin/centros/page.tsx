"use client";

// Gestión de centros de formación — solo administrador (con selector de regional)

import { isAxiosError } from "axios";
import { Building2, Loader2, Pencil, Plus, Trash2, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "../../../../lib/confirm";
import DataTable from "../../../../components/ui/DataTable";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import { useAuth } from "../../../../hooks/useAuth";
import {
  actualizarCentroFormacion,
  crearCentroFormacion,
  desactivarCentroFormacion,
  getCentrosFormacionAdmin,
  reactivarCentroFormacion,
  type CentroFormacionAdmin,
} from "../../../../services/centrosFormacionAdmin.service";
import { getMacrorregiones } from "../../../../services/catalogos.service";
import type { Macrorregion } from "../../../../types/ficha";

export default function AdminCentrosPage() {
  const router = useRouter();
  const { usuario, cargando: cargandoAuth } = useAuth();
  const esAdmin = usuario?.rol === "admin";
  const confirm = useConfirm();

  const [cargando, setCargando] = useState(true);
  const [lista, setLista] = useState<CentroFormacionAdmin[]>([]);
  const [filtroActivo, setFiltroActivo] = useState<"" | "1" | "0">("");

  // Datos del modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [regionalId, setRegionalId] = useState<number | "">("");
  const [enviando, setEnviando] = useState(false);

  // Catálogo de regionales para el modal
  const [macrorregiones, setMacrorregiones] = useState<Macrorregion[]>([]);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const activo = filtroActivo === "" ? undefined : filtroActivo === "1" ? 1 : 0;
      const [data, macros] = await Promise.all([
        getCentrosFormacionAdmin(activo),
        getMacrorregiones(),
      ]);
      setLista(data);
      setMacrorregiones(macros);
    } catch {
      toast.error("Error", { description: "No se pudieron cargar los centros." });
    } finally {
      setCargando(false);
    }
  }, [filtroActivo]);

  useEffect(() => {
    if (cargandoAuth) return;
    if (!esAdmin) {
      router.replace("/dashboard");
      return;
    }
    void cargar();
  }, [cargandoAuth, esAdmin, router, cargar]);

  function abrirNuevo() {
    setEditandoId(null);
    setNombre("");
    setCodigo("");
    setRegionalId("");
    setModalAbierto(true);
  }

  function abrirEditar(c: CentroFormacionAdmin) {
    setEditandoId(c.id);
    setNombre(c.nombre);
    setCodigo(c.codigo ?? "");
    setRegionalId(c.regional_id ?? "");
    setModalAbierto(true);
  }

  async function guardarModal(e: React.FormEvent) {
    e.preventDefault();
    const n = nombre.trim();
    if (!n) {
      toast.warning("Falta el nombre", { description: "Escribe el nombre del centro." });
      return;
    }
    setEnviando(true);
    try {
      const payload = {
        nombre: n,
        codigo: codigo.trim() || null,
        regional_id: regionalId !== "" ? (regionalId as number) : null,
      };
      if (editandoId === null) {
        await crearCentroFormacion(payload);
        toast.success("Centro creado");
      } else {
        await actualizarCentroFormacion(editandoId, payload);
        toast.success("Centro actualizado");
      }
      setModalAbierto(false);
      await cargar();
    } catch (err) {
      const msg = isAxiosError(err)
        ? String(err.response?.data?.message ?? "Error al guardar.")
        : "Error al guardar.";
      toast.error("Error", { description: msg });
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarDesactivar(c: CentroFormacionAdmin) {
    const ok = await confirm({
      title: "¿Desactivar centro?",
      description: c.nombre,
      confirmText: "Sí, desactivar",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await desactivarCentroFormacion(c.id);
      toast.success("Desactivado");
      await cargar();
    } catch (err) {
      toast.error("Error", { description: isAxiosError(err) ? String(err.response?.data?.message ?? "") : "" });
    }
  }

  async function reactivar(c: CentroFormacionAdmin) {
    try {
      await reactivarCentroFormacion(c.id);
      toast.success("Reactivado");
      await cargar();
    } catch (err) {
      toast.error("Error", { description: isAxiosError(err) ? String(err.response?.data?.message ?? "") : "" });
    }
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-verdeClaro flex items-center justify-center">
            <Building2 size={22} className="text-verde" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Centros de formación</h1>
            <p className="text-sm text-muted">Alta, edición y baja de centros SENA por regional</p>
          </div>
        </div>
        <button
          type="button"
          onClick={abrirNuevo}
          className="inline-flex items-center gap-2 rounded-lg bg-verde px-4 py-2 text-sm font-medium text-white hover:bg-verdeOscuro"
        >
          <Plus size={18} />
          Nuevo centro
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Estado:</span>
        <select
          value={filtroActivo}
          onChange={(e) => setFiltroActivo(e.target.value as "" | "1" | "0")}
          className="rounded-lg border border-borderSubtle bg-input px-3 py-1.5 text-sm text-foreground"
        >
          <option value="">Todos</option>
          <option value="1">Activos</option>
          <option value="0">Inactivos</option>
        </select>
      </div>

      {cargando ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <DataTable<CentroFormacionAdmin>
          columnas={[
            { clave: "nombre", etiqueta: "Nombre", anchoMinimo: "12rem" },
            { clave: "codigo", etiqueta: "Código" },
            {
              clave: "regional",
              etiqueta: "Regional",
              render: (f) => (
                <span className="text-sm text-foreground">
                  {f.regional?.nombre ?? <span className="text-muted italic">Sin asignar</span>}
                </span>
              ),
            },
            {
              clave: "activo",
              etiqueta: "Estado",
              render: (f) => (
                <span className={f.activo === 1 ? "text-verde font-medium" : "text-muted"}>
                  {f.activo === 1 ? "Activo" : "Inactivo"}
                </span>
              ),
            },
            {
              clave: "acciones",
              etiqueta: "Acciones",
              render: (f) => (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => abrirEditar(f)}
                    className="inline-flex items-center gap-1 text-info text-sm hover:underline"
                  >
                    <Pencil size={14} /> Editar
                  </button>
                  {f.activo === 1 ? (
                    <button
                      type="button"
                      onClick={() => void confirmarDesactivar(f)}
                      className="inline-flex items-center gap-1 text-error text-sm hover:underline"
                    >
                      <Trash2 size={14} /> Desactivar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void reactivar(f)}
                      className="inline-flex items-center gap-1 text-verde text-sm hover:underline"
                    >
                      <UserCheck size={14} /> Reactivar
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          datos={lista}
          getClaveFila={(f) => f.id}
        />
      )}

      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-modal-centro"
        >
          <div className="bg-surface rounded-xl shadow-xl max-w-md w-full p-6 border border-borderSubtle">
            <h2 id="titulo-modal-centro" className="text-lg font-semibold text-foreground mb-4">
              {editandoId === null ? "Nuevo centro" : "Editar centro"}
            </h2>
            <form onSubmit={(e) => void guardarModal(e)} className="space-y-4">
              <div>
                <label htmlFor="centro_nombre" className="block text-sm font-medium text-foreground mb-1">
                  Nombre <span className="text-error">*</span>
                </label>
                <input
                  id="centro_nombre"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="quorum-input"
                  maxLength={150}
                />
              </div>
              <div>
                <label htmlFor="centro_codigo" className="block text-sm font-medium text-foreground mb-1">
                  Código (opcional)
                </label>
                <input
                  id="centro_codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="quorum-input"
                  maxLength={20}
                />
              </div>
              <div>
                <label htmlFor="centro_regional" className="block text-sm font-medium text-foreground mb-1">
                  Regional SENA
                </label>
                <select
                  id="centro_regional"
                  value={regionalId}
                  onChange={(e) => setRegionalId(e.target.value === "" ? "" : Number(e.target.value))}
                  className="quorum-input"
                >
                  <option value="">Sin asignar</option>
                  {macrorregiones.map((m) => (
                    <optgroup key={m.id} label={`Macrorregión ${m.nombre}`}>
                      {(m.regionales ?? []).map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nombre}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-borderSubtle text-foreground transition-colors hover:bg-surfaceMuted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-verde text-white hover:bg-verdeOscuro disabled:opacity-50"
                >
                  {enviando ? <Loader2 className="animate-spin" size={18} /> : null}
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
