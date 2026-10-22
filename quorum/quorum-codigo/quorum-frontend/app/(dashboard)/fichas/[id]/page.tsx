"use client";

// Detalle de ficha: información, instructores, aprendices e importación (Módulo 5)

import { ArrowLeft, Pencil, Search, Trash2, Upload, UserPlus } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "../../../../lib/confirm";
import FichaFormulario from "../../../../components/fichas/FichaFormulario";
import DataTable from "../../../../components/ui/DataTable";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import { useAuth } from "../../../../hooks/useAuth";
import {
  getCentrosFormacion,
  getInstructoresDisponibles,
  getProgramasFormacion,
} from "../../../../services/catalogos.service";
import {
  actualizarAprendizFicha,
  actualizarFicha,
  asignarInstructorFicha,
  crearAprendizFicha,
  desactivarFicha,
  eliminarAprendizFicha,
  getFicha,
  importarAprendicesExcel,
  reactivarFicha,
} from "../../../../services/fichas.service";
import type {
  AprendizFicha,
  CatalogoItem,
  FichaDetalle,
  InstructorDisponible,
  PayloadCrearFicha,
  ProgramaCatalogoItem,
} from "../../../../types/ficha";
import { isAxiosError } from "axios";

type Pestaña = "informacion" | "instructores" | "aprendices";

export default function FichaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { usuario, cargando: cargandoAuth } = useAuth();
  const confirm = useConfirm();
  const [pestaña, setPestaña] = useState<Pestaña>("informacion");
  const [cargando, setCargando] = useState(true);
  const [ficha, setFicha] = useState<FichaDetalle | null>(null);
  const [centros, setCentros] = useState<CatalogoItem[]>([]);
  const [programas, setProgramas] = useState<ProgramaCatalogoItem[]>([]);
  const [instructoresCat, setInstructoresCat] = useState<InstructorDisponible[]>(
    []
  );
  const [enviandoForm, setEnviandoForm] = useState(false);
  const [modalImport, setModalImport] = useState(false);
  const [archivoImport, setArchivoImport] = useState<File | null>(null);
  const [progresoImport, setProgresoImport] = useState(0);
  const [importando, setImportando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalAprendiz, setModalAprendiz] = useState(false);
  const [apNom, setApNom] = useState("");
  const [apApe, setApApe] = useState("");
  const [apDoc, setApDoc] = useState("");
  const [apCorreo, setApCorreo] = useState("");
  const [guardandoAprendiz, setGuardandoAprendiz] = useState(false);
  const [editingAprendizId, setEditingAprendizId] = useState<number | null>(
    null
  );
  const [busquedaAprendices, setBusquedaAprendices] = useState("");

  const esAdmin = usuario?.rol === "admin";

  const recargar = useCallback(async () => {
    if (!Number.isFinite(id)) {
      return;
    }
    const d = await getFicha(id);
    setFicha(d);
  }, [id]);

  const aprendicesFiltrados = useMemo(() => {
    if (!ficha) {
      return [];
    }
    const lista = ficha.aprendices;
    const q = busquedaAprendices.trim().toLowerCase();
    if (!q) {
      return lista;
    }
    return lista.filter((a) => {
      const ap = a.apellido === "-" ? "" : a.apellido;
      const blob = [a.nombre, ap, a.documento, a.correo]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [ficha, busquedaAprendices]);

  useEffect(() => {
    if (cargandoAuth || !usuario) {
      return;
    }
    if (usuario.rol === "aprendiz") {
      router.replace("/mi-historial");
    }
  }, [cargandoAuth, usuario, router]);

  useEffect(() => {
    if (cargandoAuth || !usuario || usuario.rol === "aprendiz") {
      return;
    }
    let cancel = false;
    (async () => {
      setCargando(true);
      try {
        await recargar();
        if (esAdmin && !cancel) {
          const [c, p, i] = await Promise.all([
            getCentrosFormacion(),
            getProgramasFormacion(),
            getInstructoresDisponibles(),
          ]);
          if (!cancel) {
            setCentros(c);
            setProgramas(p);
            setInstructoresCat(i);
          }
        }
      } catch {
        if (!cancel) {
          toast.error("No se pudo cargar la ficha");
          router.push("/fichas");
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
  }, [cargandoAuth, usuario, recargar, router, esAdmin]);

  async function alActualizar(payload: PayloadCrearFicha) {
    if (!ficha) {
      return;
    }
    setEnviandoForm(true);
    try {
      const resultado = await actualizarFicha(ficha.id, payload);
      await recargar();
      toast.success("Cambios guardados");
      // Mostrar advertencias de fechas si las hay (sesiones fuera del nuevo rango)
      if (resultado.advertencias && resultado.advertencias.length > 0) {
        toast.warning("Revisa las fechas", { description: resultado.advertencias.join(" | ") });
      }
    } catch (e: unknown) {
      let texto = "No se pudo actualizar.";
      if (isAxiosError(e) && e.response?.data) {
        const d = e.response.data as {
          message?: string;
          errors?: Record<string, string[]>;
        };
        texto = d.errors
          ? Object.values(d.errors).flat().join(" ")
          : d.message ?? texto;
      }
      toast.error("Error", { description: texto });
    } finally {
      setEnviandoForm(false);
    }
  }

  async function confirmarReactivar() {
    if (!ficha) {
      return;
    }
    const ok = await confirm({
      title: "¿Reactivar esta ficha?",
      description: "Volverá a estar activa en el sistema y podrás gestionar aprendices e importaciones.",
      variant: "default",
    });
    if (!ok) {
      return;
    }
    try {
      await reactivarFicha(ficha.id);
      await recargar();
      toast.success("Ficha reactivada");
    } catch {
      toast.error("No se pudo reactivar");
    }
  }

  async function confirmarDesactivar() {
    if (!ficha) {
      return;
    }
    const ok = await confirm({
      title: "¿Desactivar esta ficha?",
      description: "La Ficha de Caracterización quedará inactiva en el sistema. No se borran los datos.",
      variant: "danger",
    });
    if (!ok) {
      return;
    }
    try {
      await desactivarFicha(ficha.id);
      await recargar();
      toast.success("Ficha desactivada");
    } catch {
      toast.error("No se pudo desactivar");
    }
  }

  async function accionInstructor(
    usuarioInsId: number,
    accion: "asignar" | "desasignar" | "toggle_gestor",
    esGestor?: boolean
  ) {
    if (!ficha) {
      return;
    }
    try {
      await asignarInstructorFicha(ficha.id, {
        usuario_id: usuarioInsId,
        accion,
        es_gestor: esGestor,
      });
      await recargar();
    } catch (e: unknown) {
      let texto = "No se pudo actualizar instructores.";
      if (isAxiosError(e) && e.response?.data) {
        const d = e.response.data as {
          message?: string;
          errors?: Record<string, string[]>;
        };
        texto = d.errors
          ? Object.values(d.errors).flat().join(" ")
          : d.message ?? texto;
      }
      toast.error("Error", { description: texto });
    }
  }

  function limpiarSeleccionImport() {
    setArchivoImport(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function ejecutarImport() {
    if (!ficha || !archivoImport) {
      return;
    }
    setImportando(true);
    setProgresoImport(0);
    try {
      const res = await importarAprendicesExcel(
        ficha.id,
        archivoImport,
        setProgresoImport
      );
      await recargar();
      setModalImport(false);
      limpiarSeleccionImport();
      const descImport = `Exitosos: ${res.exitosos} · Fallidos: ${res.fallidos}${res.errores.length ? "\n" + res.errores.slice(0, 15).join("\n") : ""}`;
      if (res.fallidos > 0) {
        toast.warning("Importación finalizada", { description: descImport });
      } else {
        toast.success("Importación finalizada", { description: descImport });
      }
    } catch (e: unknown) {
      let texto = "Error al importar.";
      if (isAxiosError(e) && e.response?.data) {
        const d = e.response.data as {
          message?: string;
          errors?: Record<string, string[]>;
        };
        texto = d.errors
          ? Object.values(d.errors).flat().join(" ")
          : d.message ?? texto;
      }
      toast.error("Importación", { description: texto });
    } finally {
      setImportando(false);
      setProgresoImport(0);
    }
  }

  function resetFormAprendiz() {
    setEditingAprendizId(null);
    setApNom("");
    setApApe("");
    setApDoc("");
    setApCorreo("");
  }

  async function guardarAprendizManual() {
    if (!ficha) {
      return;
    }
    setGuardandoAprendiz(true);
    const payload = {
      nombre: apNom.trim(),
      apellido: apApe.trim() !== "" ? apApe.trim() : "-",
      documento: apDoc.trim(),
      correo: apCorreo.trim(),
    };
    try {
      if (editingAprendizId != null) {
        await actualizarAprendizFicha(ficha.id, editingAprendizId, payload);
        toast.success("Aprendiz actualizado");
      } else {
        await crearAprendizFicha(ficha.id, payload);
        toast.success("Aprendiz registrado");
      }
      setModalAprendiz(false);
      resetFormAprendiz();
      await recargar();
    } catch (e: unknown) {
      let texto =
        editingAprendizId != null
          ? "No se pudo actualizar el aprendiz."
          : "No se pudo registrar el aprendiz.";
      if (isAxiosError(e) && e.response?.data) {
        const d = e.response.data as {
          message?: string;
          errors?: Record<string, string[]>;
        };
        texto = d.errors
          ? Object.values(d.errors).flat().join(" ")
          : d.message ?? texto;
      }
      toast.error("Error", { description: texto });
    } finally {
      setGuardandoAprendiz(false);
    }
  }

  async function confirmarEliminarAprendiz(a: AprendizFicha) {
    if (!ficha) {
      return;
    }
    const ok = await confirm({
      title: "¿Dar de baja este aprendiz?",
      description: "Quedará inactivo y desvinculado de la ficha. El historial de asistencia previo se conserva.",
      variant: "danger",
    });
    if (!ok) {
      return;
    }
    try {
      await eliminarAprendizFicha(ficha.id, a.id);
      await recargar();
      toast.success("Aprendiz dado de baja");
    } catch (e: unknown) {
      let texto = "No se pudo eliminar el aprendiz.";
      if (isAxiosError(e) && e.response?.data) {
        const d = e.response.data as {
          message?: string;
          errors?: Record<string, string[]>;
        };
        texto = d.errors
          ? Object.values(d.errors).flat().join(" ")
          : d.message ?? texto;
      }
      toast.error("Error", { description: texto });
    }
  }

  if (cargandoAuth || !usuario || usuario.rol === "aprendiz") {
    return (
      <div className="max-w-5xl mx-auto">
        <LoadingSpinner texto="Cargando…" />
      </div>
    );
  }

  if (cargando || !ficha) {
    return (
      <div className="max-w-5xl mx-auto">
        <LoadingSpinner texto="Cargando ficha…" />
      </div>
    );
  }

  const asignadosIds = new Set(ficha.instructores.map((i) => i.usuario_id));
  const noAsignados = instructoresCat.filter((i) => !asignadosIds.has(i.id));

  const colsAprendices = [
    {
      clave: "aprendiz",
      etiqueta: "Aprendiz",
      render: (a: AprendizFicha) =>
        [a.nombre, a.apellido && a.apellido !== "-" ? a.apellido : ""]
          .filter(Boolean)
          .join(" "),
    },
    { clave: "documento", etiqueta: "Cédula" },
    { clave: "correo", etiqueta: "Correo" },
    ...(esAdmin && ficha.activo === 1
      ? [
          {
            clave: "acciones",
            etiqueta: "Acciones",
            anchoMinimo: "120px",
            render: (a: AprendizFicha) => (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-borderSubtle px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-surfaceMuted"
                  onClick={() => {
                    setEditingAprendizId(a.id);
                    setApNom(a.nombre);
                    setApApe(a.apellido);
                    setApDoc(a.documento);
                    setApCorreo(a.correo);
                    setModalAprendiz(true);
                  }}
                  title="Editar"
                >
                  <Pencil size={14} aria-hidden />
                  Editar
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-error/40 px-2 py-1 text-xs font-medium text-error hover:bg-red-50"
                  onClick={() => void confirmarEliminarAprendiz(a)}
                  title="Dar de baja"
                >
                  <Trash2 size={14} aria-hidden />
                  Eliminar
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href="/fichas"
        className="inline-flex items-center gap-2 text-sm text-info hover:underline"
      >
        <ArrowLeft size={18} aria-hidden />
        Volver al listado
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Ficha {ficha.numero_ficha}
          </h1>
          <p className="text-sm text-muted mt-1">
            {ficha.centro?.nombre} · {ficha.programa?.nombre}
          </p>
        </div>
        {esAdmin && ficha.activo === 0 && (
          <button
            type="button"
            className="rounded-lg bg-verde px-4 py-2 text-sm font-semibold text-white hover:bg-verdeOscuro"
            onClick={() => void confirmarReactivar()}
          >
            Reactivar ficha
          </button>
        )}
        {esAdmin && ficha.activo === 1 && (
          <button
            type="button"
            className="rounded-lg border border-error px-4 py-2 text-sm font-medium text-error hover:bg-red-50"
            onClick={() => void confirmarDesactivar()}
          >
            Desactivar ficha
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-borderSubtle">
        {(
          [
            ["informacion", "Información"],
            ["instructores", "Instructores"],
            ["aprendices", "Aprendices"],
          ] as const
        ).map(([clave, etiqueta]) => (
          <button
            key={clave}
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              pestaña === clave
                ? "border-verde text-verdeOscuro"
                : "border-transparent text-muted hover:text-foreground"
            }`}
            onClick={() => setPestaña(clave)}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {pestaña === "informacion" && (
        <div className="space-y-4">
          {esAdmin && centros.length > 0 && programas.length > 0 ? (
            <FichaFormulario
              key={`${ficha.id}-${ficha.numero_ficha}`}
              centros={centros}
              programas={programas}
              instructoresDisponibles={instructoresCat}
              inicial={ficha}
              alEnviar={alActualizar}
              textoBoton="Guardar cambios"
              enviando={enviandoForm}
              modoEdicion
            />
          ) : (
            <div className="rounded-xl border border-borderSubtle bg-surface p-6 space-y-4 text-sm">
              <p>
                <span className="text-muted">Estado:</span>{" "}
                <span className="capitalize font-medium">{ficha.estado}</span>
              </p>
              <p>
                <span className="text-muted">Activa:</span>{" "}
                {ficha.activo ? "Sí" : "No"}
              </p>
              <p>
                <span className="text-muted">Fechas:</span>{" "}
                {String(ficha.fecha_inicio).slice(0, 10)} —{" "}
                {String(ficha.fecha_fin).slice(0, 10)}
              </p>
              <h3 className="font-semibold pt-4">Horario semanal</h3>
              {ficha.jornadas.map((j) => (
                <div key={j.id ?? j.tipo} className="border-t pt-3">
                  <p className="font-medium capitalize mb-2">
                    Jornada {j.tipo.replace("_", " ")}
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-foreground">
                    {j.horarios.map((h) => (
                      <li key={h.id ?? `${j.tipo}-${h.dia_semana}`}>
                        {h.dia_semana}: {h.hora_inicio}–{h.hora_fin} (
                        {h.instructor?.nombre} {h.instructor?.apellido})
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {pestaña === "instructores" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-borderSubtle bg-surface p-6">
            <h3 className="font-semibold text-foreground mb-3">
              Instructores asignados
            </h3>
            <ul className="divide-y divide-borderSubtle/70">
              {ficha.instructores.map((p) => (
                <li
                  key={p.usuario_id}
                  className="py-3 flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <div>
                    <span className="font-medium">
                      {p.usuario?.nombre} {p.usuario?.apellido}
                    </span>
                    {p.es_gestor && (
                      <span className="ml-2 rounded bg-verdeClaro px-2 py-0.5 text-xs text-verdeOscuro">
                        Gestor de Grupo
                      </span>
                    )}
                    <div className="text-muted text-xs">
                      {p.usuario?.correo}
                    </div>
                  </div>
                  {esAdmin && (
                    <div className="flex flex-wrap gap-2">
                      {!p.es_gestor && (
                        <button
                          type="button"
                          className="text-xs rounded border border-borderSubtle px-2 py-1 text-foreground transition-colors hover:bg-surfaceMuted"
                          onClick={() =>
                            void accionInstructor(p.usuario_id, "toggle_gestor")
                          }
                        >
                          Marcar gestor
                        </button>
                      )}
                      {p.es_gestor && (
                        <button
                          type="button"
                          className="text-xs rounded border border-borderSubtle px-2 py-1 text-foreground transition-colors hover:bg-surfaceMuted"
                          onClick={() =>
                            void accionInstructor(p.usuario_id, "toggle_gestor")
                          }
                        >
                          Quitar gestor
                        </button>
                      )}
                      <button
                        type="button"
                        className="text-xs rounded border border-error/40 text-error px-2 py-1 hover:bg-red-50"
                        onClick={() =>
                          void accionInstructor(p.usuario_id, "desasignar")
                        }
                      >
                        Desasignar
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {esAdmin && noAsignados.length > 0 && (
            <div className="rounded-xl border border-borderSubtle bg-surface p-6">
              <h3 className="font-semibold text-foreground mb-3">
                Agregar instructor
              </h3>
              <ul className="space-y-2">
                {noAsignados.map((ins) => (
                  <li
                    key={ins.id}
                    className="flex items-center justify-between gap-2 text-sm border-b border-borderSubtle/50 pb-2"
                  >
                    <span>
                      {ins.nombre} {ins.apellido}
                    </span>
                    <button
                      type="button"
                      className="rounded-lg bg-verde px-3 py-1 text-xs font-medium text-white hover:bg-verdeOscuro"
                      onClick={() =>
                        void accionInstructor(ins.id, "asignar", false)
                      }
                    >
                      Asignar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {pestaña === "aprendices" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <label className="relative flex min-w-0 flex-1 sm:max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                size={18}
                aria-hidden
              />
              <input
                type="search"
                value={busquedaAprendices}
                onChange={(e) => setBusquedaAprendices(e.target.value)}
                placeholder="Buscar por nombre, cédula o correo…"
                className="w-full rounded-xl border border-borderSubtle bg-input py-2 pl-10 pr-3 text-sm text-foreground placeholder:text-muted focus:border-verde focus:outline-none focus:ring-1 focus:ring-verde"
                aria-label="Buscar aprendices"
              />
            </label>
            {esAdmin && ficha.activo === 1 && (
              <div className="flex flex-wrap justify-end gap-2 shrink-0">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-borderSubtle bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surfaceMuted"
                  onClick={() => {
                    resetFormAprendiz();
                    setModalAprendiz(true);
                  }}
                >
                  <UserPlus size={18} aria-hidden />
                  Agregar aprendiz
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-verde px-4 py-2 text-sm font-semibold text-white hover:bg-verdeOscuro"
                  onClick={() => setModalImport(true)}
                >
                  <Upload size={18} aria-hidden />
                  Importar Excel
                </button>
              </div>
            )}
          </div>
          <DataTable<AprendizFicha>
            columnas={colsAprendices}
            datos={aprendicesFiltrados}
            getClaveFila={(a) => a.id}
            vacioTexto={
              ficha.aprendices.length === 0
                ? "No hay aprendices registrados en esta ficha."
                : "Ningún aprendiz coincide con la búsqueda."
            }
          />
        </div>
      )}

      {modalAprendiz && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div
            className="bg-surface rounded-xl shadow-xl max-w-md w-full p-6 space-y-4"
            role="dialog"
            aria-modal
            aria-labelledby="titulo-aprendiz"
          >
            <h2 id="titulo-aprendiz" className="text-lg font-semibold">
              {editingAprendizId != null ? "Editar aprendiz" : "Agregar aprendiz"}
            </h2>
            <div className="space-y-3 text-sm">
              <label className="block space-y-1">
                <span className="text-muted">Cédula</span>
                <input
                  type="text"
                  className="quorum-field w-full"
                  value={apDoc}
                  onChange={(e) => setApDoc(e.target.value)}
                  autoComplete="off"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-muted">Nombre</span>
                <input
                  type="text"
                  className="quorum-field w-full"
                  value={apNom}
                  onChange={(e) => setApNom(e.target.value)}
                  autoComplete="off"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-muted">Apellido</span>
                <input
                  type="text"
                  className="quorum-field w-full"
                  value={apApe}
                  onChange={(e) => setApApe(e.target.value)}
                  autoComplete="off"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-muted">Correo</span>
                <input
                  type="email"
                  className="quorum-field w-full"
                  value={apCorreo}
                  onChange={(e) => setApCorreo(e.target.value)}
                  autoComplete="off"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="rounded-lg border border-borderSubtle bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:bg-surfaceMuted"
                onClick={() => {
                  setModalAprendiz(false);
                  resetFormAprendiz();
                }}
                disabled={guardandoAprendiz}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-lg bg-verde px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                disabled={
                  guardandoAprendiz ||
                  !apNom.trim() ||
                  !apDoc.trim() ||
                  !apCorreo.trim()
                }
                onClick={() => void guardarAprendizManual()}
              >
                {editingAprendizId != null ? "Guardar cambios" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalImport && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div
            className="bg-surface rounded-xl shadow-xl max-w-md w-full p-6 space-y-4"
            role="dialog"
            aria-modal
            aria-labelledby="titulo-import"
          >
            <h2 id="titulo-import" className="text-lg font-semibold">
              Importar Aprendices
            </h2>
            <p className="text-sm text-muted">
              Archivo .xlsx con columnas: cedula, nombre_completo, correo (primera
              fila).
            </p>
            <label className="block space-y-2">
              <span className="text-sm text-muted">Archivo Excel</span>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="sr-only"
                  onChange={(e) =>
                    setArchivoImport(e.target.files?.[0] ?? null)
                  }
                />
                <button
                  type="button"
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-borderSubtle bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surfaceMuted"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={18} aria-hidden />
                  Elegir archivo
                </button>
                <span
                  className="min-w-0 truncate text-sm text-muted"
                  title={archivoImport?.name}
                >
                  {archivoImport?.name ?? "Ningún archivo seleccionado"}
                </span>
              </div>
            </label>
            {importando && (
              <div className="space-y-1">
                <div className="h-2 overflow-hidden rounded-full bg-surfaceMuted">
                  <div
                    className="h-full bg-verde transition-all"
                    style={{ width: `${progresoImport}%` }}
                  />
                </div>
                <p className="text-xs text-muted">
                  Subiendo… {progresoImport}%
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="rounded-lg border border-borderSubtle bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:bg-surfaceMuted"
                onClick={() => {
                  setModalImport(false);
                  limpiarSeleccionImport();
                }}
                disabled={importando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-lg bg-verde px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                disabled={!archivoImport || importando}
                onClick={() => void ejecutarImport()}
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
