"use client";

// Listado y gestión de usuarios — Módulo 6 (solo administrador)

import { Pencil, Plus, Trash2, UserCheck, UserX, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { useConfirm } from "../../../lib/confirm";
import UsuarioModal from "../../../components/usuarios/UsuarioModal";
import Badge from "../../../components/ui/Badge";
import DataTable from "../../../components/ui/DataTable";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useAuth } from "../../../hooks/useAuth";
import { getFichas } from "../../../services/fichas.service";
import {
  eliminarUsuario,
  getUsuarios,
  reactivarUsuario,
  type RolUsuarioFiltro,
} from "../../../services/usuarios.service";
import type { FichaListado } from "../../../types/ficha";
import type { RolUsuario, UsuarioListado } from "../../../types/usuario";

const ROLES_FILTRO: { value: RolUsuarioFiltro; etiqueta: string }[] = [
  { value: "", etiqueta: "Todos los roles" },
  { value: "admin", etiqueta: "Administrador" },
  { value: "coordinador", etiqueta: "Coordinador" },
  { value: "instructor", etiqueta: "Instructor" },
  { value: "gestor_grupo", etiqueta: "Gestor de grupo" },
  { value: "aprendiz", etiqueta: "Aprendiz" },
];

export default function UsuariosPage() {
  const router = useRouter();
  const { usuario: usuarioSesion, cargando: cargandoAuth } = useAuth();
  const confirm = useConfirm();

  const [cargando, setCargando] = useState(true);
  const [usuarios, setUsuarios] = useState<UsuarioListado[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");
  const [rolFiltro, setRolFiltro] = useState<RolUsuarioFiltro>("");
  const [fichas, setFichas] = useState<FichaListado[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoModal, setModoModal] = useState<"crear" | "editar">("crear");
  const [usuarioEditar, setUsuarioEditar] = useState<UsuarioListado | null>(null);

  const esAdmin = usuarioSesion?.rol === "admin";

  // Debounce de búsqueda (~300 ms)
  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busqueda.trim()), 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  useEffect(() => {
    setPagina(1);
  }, [busquedaDebounced, rolFiltro]);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await getUsuarios({
        page: pagina,
        per_page: 12,
        busqueda: busquedaDebounced || undefined,
        rol: rolFiltro || undefined,
      });
      setUsuarios(res.data);
      setTotalPaginas(res.last_page);
      setTotal(res.total);
    } catch {
      setUsuarios([]);
      toast.error("No se pudieron cargar los usuarios", { description: "Verifica tu conexión o inténtalo más tarde." });
    } finally {
      setCargando(false);
    }
  }, [pagina, busquedaDebounced, rolFiltro]);

  useEffect(() => {
    if (cargandoAuth || !usuarioSesion) return;
    if (!esAdmin) {
      router.replace("/dashboard");
      return;
    }
    void cargar();
  }, [cargandoAuth, usuarioSesion, esAdmin, router, cargar]);

  // Catálogo de fichas activas para el modal (aprendices)
  useEffect(() => {
    if (!esAdmin) return;
    void (async () => {
      try {
        const res = await getFichas({ activo: 1, per_page: 100 });
        setFichas(res.data);
      } catch {
        setFichas([]);
      }
    })();
  }, [esAdmin]);

  function abrirCrear() {
    setModoModal("crear");
    setUsuarioEditar(null);
    setModalAbierto(true);
  }

  function abrirEditar(u: UsuarioListado) {
    setModoModal("editar");
    setUsuarioEditar(u);
    setModalAbierto(true);
  }

  async function handleDesactivar(u: UsuarioListado) {
    const ok = await confirm({
      title: "¿Desactivar usuario?",
      description: `${u.nombre} ${u.apellido} no podrá iniciar sesión hasta que reactive su cuenta.`,
      confirmText: "Sí, desactivar",
      variant: "danger",
    });
    if (!ok) return;

    try {
      await eliminarUsuario(u.id);
      toast.success("Usuario desactivado");
      void cargar();
    } catch (err) {
      const msg = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ??
          "No se pudo desactivar el usuario."
        : "Error de red.";
      toast.error("Error", { description: msg });
    }
  }

  async function handleReactivar(u: UsuarioListado) {
    const ok = await confirm({
      title: "¿Reactivar usuario?",
      description: `${u.nombre} ${u.apellido} volverá a poder iniciar sesión con sus credenciales habituales.`,
      confirmText: "Sí, reactivar",
    });
    if (!ok) return;

    try {
      await reactivarUsuario(u.id);
      toast.success("Usuario reactivado");
      void cargar();
    } catch (err) {
      const msg = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ??
          "No se pudo reactivar el usuario."
        : "Error de red.";
      toast.error("No se pudo reactivar", { description: msg });
    }
  }

  async function handleEliminarPermanente(u: UsuarioListado) {
    const ok1 = await confirm({
      title: "Eliminar permanentemente",
      description: `Esta acción intentará borrar el registro de ${u.nombre} ${u.apellido} de la base de datos. Si el usuario tiene asistencias u otros vínculos, el sistema no permitirá el borrado.`,
      confirmText: "Continuar",
      variant: "danger",
    });
    if (!ok1) return;

    const ok2 = await confirm({
      title: "Confirmación final",
      description: "¿Seguro que deseas eliminar permanentemente a este usuario? Esta acción no se puede deshacer.",
      confirmText: "Sí, eliminar",
      variant: "danger",
    });
    if (!ok2) return;

    try {
      await eliminarUsuario(u.id);
      toast.success("Usuario eliminado");
      void cargar();
    } catch (err) {
      const msg = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ??
          "No se pudo eliminar el usuario."
        : "Error de red.";
      toast.error("No se pudo eliminar", { description: msg });
    }
  }

  if (cargandoAuth || !usuarioSesion) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (!esAdmin) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-verdeClaro flex items-center justify-center">
            <Users size={22} className="text-verde" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Usuarios</h1>
            <p className="text-sm text-muted">
              Gestión de instructores, coordinadores y aprendices
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={abrirCrear}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-verde px-4 py-2 text-sm font-medium text-white hover:bg-verdeOscuro"
        >
          <Plus size={18} aria-hidden />
          Nuevo usuario
        </button>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
        <input
          type="search"
          placeholder="Buscar por nombre, apellido, documento o correo…"
          className="flex-1 min-w-[200px] rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar usuarios"
        />
        <select
          className="rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground min-w-[180px]"
          value={rolFiltro}
          onChange={(e) => setRolFiltro(e.target.value as RolUsuarioFiltro)}
          aria-label="Filtrar por rol"
        >
          {ROLES_FILTRO.map((r) => (
            <option key={r.value || "todos"} value={r.value}>
              {r.etiqueta}
            </option>
          ))}
        </select>
      </div>

      {cargando ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : (
        <DataTable<UsuarioListado>
          columnas={[
            {
              clave: "nombre",
              etiqueta: "Nombre completo",
              anchoMinimo: "160px",
              render: (fila) => (
                <span className="whitespace-normal">
                  {fila.nombre} {fila.apellido}
                </span>
              ),
            },
            {
              clave: "rol",
              etiqueta: "Rol",
              render: (fila) => <Badge rol={fila.rol as RolUsuario} />,
            },
            { clave: "documento", etiqueta: "Documento" },
            {
              clave: "correo",
              etiqueta: "Correo",
              anchoMinimo: "200px",
              render: (fila) => (
                <span className="whitespace-normal break-all">{fila.correo}</span>
              ),
            },
            {
              clave: "activo",
              etiqueta: "Estado",
              render: (fila) => (
                <span className={fila.activo === 1 ? "text-verdeOscuro" : "text-error"}>
                  {fila.activo === 1 ? "Activo" : "Inactivo"}
                </span>
              ),
            },
            {
              clave: "acciones",
              etiqueta: "Acciones",
              anchoMinimo: "260px",
              render: (fila) => {
                const esYo = usuarioSesion?.id === fila.id;
                return (
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => abrirEditar(fila)}
                      className="inline-flex items-center gap-1 rounded-md border border-borderSubtle bg-surface px-2 py-1 text-xs text-foreground transition-colors hover:bg-surfaceMuted"
                    >
                      <Pencil size={14} aria-hidden />
                      Editar
                    </button>
                    {fila.activo === 1 && !esYo && (
                      <button
                        type="button"
                        onClick={() => void handleDesactivar(fila)}
                        className="inline-flex items-center gap-1 rounded-md border border-advertencia/40 px-2 py-1 text-xs text-advertencia hover:bg-amber-50"
                      >
                        <UserX size={14} aria-hidden />
                        Desactivar
                      </button>
                    )}
                    {fila.activo === 0 && !esYo && (
                      <>
                        <button
                          type="button"
                          onClick={() => void handleReactivar(fila)}
                          className="inline-flex items-center gap-1 rounded-md border border-verde/50 px-2 py-1 text-xs text-verdeOscuro hover:bg-verdeClaro"
                        >
                          <UserCheck size={14} aria-hidden />
                          Reactivar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleEliminarPermanente(fila)}
                          className="inline-flex items-center gap-1 rounded-md border border-error/40 px-2 py-1 text-xs text-error hover:bg-red-50"
                        >
                          <Trash2 size={14} aria-hidden />
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                );
              },
            },
          ]}
          datos={usuarios}
          getClaveFila={(f) => f.id}
          paginacion={{
            paginaActual: pagina,
            totalPaginas,
            total,
            alCambiarPagina: setPagina,
          }}
          vacioTexto="No hay usuarios que coincidan con los filtros."
        />
      )}

      <UsuarioModal
        abierto={modalAbierto}
        modo={modoModal}
        usuario={usuarioEditar}
        fichas={fichas}
        onCerrar={() => setModalAbierto(false)}
        onGuardado={() => void cargar()}
      />
    </div>
  );
}
