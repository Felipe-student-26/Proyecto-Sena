"use client";

// Gestión de programas de formación — solo administrador

import { isAxiosError } from "axios";
import { BookOpenCheck, Loader2, Pencil, Plus, Trash2, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "../../../../lib/confirm";
import DataTable from "../../../../components/ui/DataTable";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import { useAuth } from "../../../../hooks/useAuth";
import {
  actualizarPrograma,
  crearPrograma,
  desactivarPrograma,
  getProgramasAdmin,
  reactivarPrograma,
  type ProgramaAdmin,
} from "../../../../services/programas.service";
import { TIPOS_PROGRAMA, type TipoPrograma } from "../../../../types/ficha";

const ETIQUETA_TIPO: Record<string, string> = Object.fromEntries(
  TIPOS_PROGRAMA.map(({ value, label }) => [value, label])
);

export default function AdminProgramasPage() {
  const router = useRouter();
  const { usuario, cargando: cargandoAuth } = useAuth();
  const esAdmin = usuario?.rol === "admin";
  const confirm = useConfirm();

  const [cargando, setCargando] = useState(true);
  const [lista, setLista] = useState<ProgramaAdmin[]>([]);
  const [filtroActivo, setFiltroActivo] = useState<"" | "1" | "0">("");
  const [filtroTipo, setFiltroTipo] = useState<TipoPrograma | "">("");

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [tipo, setTipo] = useState<TipoPrograma | "">("");
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const activo = filtroActivo === "" ? undefined : filtroActivo === "1" ? 1 : 0;
      const data = await getProgramasAdmin(activo);
      const filtrados = filtroTipo ? data.filter((p) => p.tipo === filtroTipo) : data;
      setLista(filtrados);
    } catch {
      toast.error("Error", { description: "No se pudieron cargar los programas." });
    } finally {
      setCargando(false);
    }
  }, [filtroActivo, filtroTipo]);

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
    setTipo("");
    setModalAbierto(true);
  }

  function abrirEditar(p: ProgramaAdmin) {
    setEditandoId(p.id);
    setNombre(p.nombre);
    setCodigo(p.codigo ?? "");
    setTipo(p.tipo ?? "");
    setModalAbierto(true);
  }

  async function guardarModal(e: React.FormEvent) {
    e.preventDefault();
    const n = nombre.trim();
    if (!n) {
      toast.warning("Falta el nombre", { description: "Escribe el nombre del programa." });
      return;
    }
    setEnviando(true);
    try {
      const payload = {
        nombre: n,
        codigo: codigo.trim() || null,
        tipo: tipo || null,
      };
      if (editandoId === null) {
        await crearPrograma(payload);
        toast.success("Programa creado");
      } else {
        await actualizarPrograma(editandoId, payload);
        toast.success("Programa actualizado");
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

  async function confirmarDesactivar(p: ProgramaAdmin) {
    const ok = await confirm({
      title: "¿Desactivar programa?",
      description: p.nombre,
      confirmText: "Sí, desactivar",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await desactivarPrograma(p.id);
      toast.success("Desactivado");
      await cargar();
    } catch (err) {
      toast.error("Error", { description: isAxiosError(err) ? String(err.response?.data?.message ?? "") : "" });
    }
  }

  async function reactivar(p: ProgramaAdmin) {
    try {
      await reactivarPrograma(p.id);
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
            <BookOpenCheck size={22} className="text-verde" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Programas de formación</h1>
            <p className="text-sm text-muted">Alta, edición y baja de programas SENA por nivel</p>
          </div>
        </div>
        <button
          type="button"
          onClick={abrirNuevo}
          className="inline-flex items-center gap-2 rounded-lg bg-verde px-4 py-2 text-sm font-medium text-white hover:bg-verdeOscuro"
        >
          <Plus size={18} />
          Nuevo programa
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Tipo:</span>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as TipoPrograma | "")}
            className="rounded-lg border border-borderSubtle bg-input px-3 py-1.5 text-sm text-foreground"
          >
            <option value="">Todos</option>
            {TIPOS_PROGRAMA.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {cargando ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <DataTable<ProgramaAdmin>
          columnas={[
            { clave: "nombre", etiqueta: "Nombre", anchoMinimo: "14rem" },
            { clave: "codigo", etiqueta: "Código" },
            {
              clave: "tipo",
              etiqueta: "Tipo / Nivel",
              render: (p) =>
                p.tipo ? (
                  <span className="inline-flex items-center rounded-full bg-verdeClaro px-2.5 py-0.5 text-xs font-medium text-verdeOscuro">
                    {ETIQUETA_TIPO[p.tipo] ?? p.tipo}
                  </span>
                ) : (
                  <span className="text-muted italic text-xs">Sin clasificar</span>
                ),
            },
            {
              clave: "activo",
              etiqueta: "Estado",
              render: (p) => (
                <span className={p.activo === 1 ? "text-verde font-medium" : "text-muted"}>
                  {p.activo === 1 ? "Activo" : "Inactivo"}
                </span>
              ),
            },
            {
              clave: "acciones",
              etiqueta: "Acciones",
              render: (p) => (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => abrirEditar(p)}
                    className="inline-flex items-center gap-1 text-info text-sm hover:underline"
                  >
                    <Pencil size={14} /> Editar
                  </button>
                  {p.activo === 1 ? (
                    <button
                      type="button"
                      onClick={() => void confirmarDesactivar(p)}
                      className="inline-flex items-center gap-1 text-error text-sm hover:underline"
                    >
                      <Trash2 size={14} /> Desactivar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void reactivar(p)}
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
          getClaveFila={(p) => p.id}
        />
      )}

      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-modal-programa"
        >
          <div className="bg-surface rounded-xl shadow-xl max-w-md w-full p-6 border border-borderSubtle">
            <h2 id="titulo-modal-programa" className="text-lg font-semibold text-foreground mb-4">
              {editandoId === null ? "Nuevo programa" : "Editar programa"}
            </h2>
            <form onSubmit={(e) => void guardarModal(e)} className="space-y-4">
              <div>
                <label htmlFor="prog_nombre" className="block text-sm font-medium text-foreground mb-1">
                  Nombre <span className="text-error">*</span>
                </label>
                <input
                  id="prog_nombre"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="quorum-input"
                  maxLength={200}
                />
              </div>
              <div>
                <label htmlFor="prog_codigo" className="block text-sm font-medium text-foreground mb-1">
                  Código (opcional)
                </label>
                <input
                  id="prog_codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="quorum-input"
                  maxLength={30}
                />
              </div>
              <div>
                <label htmlFor="prog_tipo" className="block text-sm font-medium text-foreground mb-1">
                  Tipo / Nivel de formación
                </label>
                <select
                  id="prog_tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoPrograma | "")}
                  className="quorum-input"
                >
                  <option value="">Sin clasificar</option>
                  {TIPOS_PROGRAMA.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
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
