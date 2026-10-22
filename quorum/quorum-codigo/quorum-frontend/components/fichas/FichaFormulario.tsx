"use client";

// Formulario crear/editar ficha: cabecera, instructores, jornadas y horarios (Módulo 5)

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { horasPredeterminadas } from "../../lib/fichaDefaults";
import type {
  CatalogoItem,
  DiaSemana,
  FichaDetalle,
  InstructorDisponible,
  Macrorregion,
  ModalidadFicha,
  PayloadCrearFicha,
  ProgramaCatalogoItem,
  TipoJornada,
} from "../../types/ficha";
import { TIPOS_PROGRAMA } from "../../types/ficha";

const TIPOS_JORNADA: TipoJornada[] = [
  "mañana",
  "tarde",
  "noche",
  "fin_de_semana",
];

const DIAS: DiaSemana[] = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
];

interface FilaHorario {
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  instructor_id: number;
}

interface BloqueJornada {
  tipo: TipoJornada;
  horarios: FilaHorario[];
}

interface Props {
  centros: CatalogoItem[];
  programas: ProgramaCatalogoItem[];
  instructoresDisponibles: InstructorDisponible[];
  /** Macrorregiones con sus regionales anidadas; habilita el filtro de regional */
  macrorregiones?: Macrorregion[];
  /** Si viene, precarga el formulario (edición) */
  inicial?: FichaDetalle | null;
  alEnviar: (payload: PayloadCrearFicha) => Promise<void>;
  textoBoton: string;
  enviando: boolean;
  /** Indica que se está editando una ficha existente (puede tener historial de asistencia) */
  modoEdicion?: boolean;
}

export default function FichaFormulario({
  centros,
  programas,
  instructoresDisponibles,
  macrorregiones = [],
  inicial,
  alEnviar,
  textoBoton,
  enviando,
  modoEdicion = false,
}: Props) {
  const [numeroFicha, setNumeroFicha] = useState("");
  const [estado, setEstado] = useState<"activa" | "suspendida">("activa");
  const [modalidad, setModalidad] = useState<ModalidadFicha>("presencial");
  const [centroId, setCentroId] = useState<number>(0);
  const [programaId, setProgramaId] = useState<number>(0);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [idsInstructores, setIdsInstructores] = useState<number[]>([]);
  const [gestorId, setGestorId] = useState<number | null>(null);
  const [jornadas, setJornadas] = useState<BloqueJornada[]>([]);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  // Filtro de regional: reduce la lista de centros antes de elegir
  const [regionalId, setRegionalId] = useState<number>(0);

  useEffect(() => {
    if (!inicial) {
      return;
    }
    setNumeroFicha(inicial.numero_ficha);
    setEstado(inicial.estado);
    setModalidad(inicial.modalidad ?? "presencial");
    setCentroId(inicial.centro_formacion_id);
    setProgramaId(inicial.programa_formacion_id);
    setFechaInicio(String(inicial.fecha_inicio).slice(0, 10));
    setFechaFin(String(inicial.fecha_fin).slice(0, 10));
    const ins = inicial.instructores ?? [];
    setIdsInstructores(ins.map((i) => i.usuario_id));
    const g = ins.find((i) => i.es_gestor);
    setGestorId(g ? g.usuario_id : null);
    setJornadas(
      (inicial.jornadas ?? []).map((j) => ({
        tipo: j.tipo,
        horarios: (j.horarios ?? []).map((h) => ({
          dia_semana: h.dia_semana,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          instructor_id: h.instructor_id,
        })),
      }))
    );
    // Pre-selecciona la regional del centro para que el filtro coincida en edición
    const centroInicial = centros.find((c) => c.id === inicial.centro_formacion_id);
    if (centroInicial?.regional_id) {
      setRegionalId(centroInicial.regional_id);
    }
  }, [inicial, centros]);

  // Centros disponibles según la regional seleccionada (0 = sin filtro)
  const centrosFiltrados =
    regionalId > 0
      ? centros.filter((c) => c.regional_id === regionalId)
      : centros;

  /**
   * Cambia la regional del filtro; si el centro elegido no pertenece a la
   * nueva regional se limpia para evitar un valor inconsistente en el payload.
   */
  function cambiarRegional(nuevoId: number) {
    setRegionalId(nuevoId);
    if (
      nuevoId > 0 &&
      !centros.find((c) => c.id === centroId && c.regional_id === nuevoId)
    ) {
      setCentroId(0);
    }
  }

  const tiposLibres = TIPOS_JORNADA.filter(
    (t) => !jornadas.some((j) => j.tipo === t)
  );

  function toggleInstructor(id: number) {
    setIdsInstructores((prev) => {
      if (prev.includes(id)) {
        if (gestorId === id) {
          setGestorId(null);
        }
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  }

  function agregarJornada(tipo: TipoJornada) {
    const primerIns = idsInstructores[0] ?? instructoresDisponibles[0]?.id ?? 0;
    const diaInicial: DiaSemana = tipo === "fin_de_semana" ? "sabado" : "lunes";
    setJornadas((prev) => [
      ...prev,
      {
        tipo,
        horarios: [
          {
            dia_semana: diaInicial,
            ...horasPredeterminadas(tipo, diaInicial),
            instructor_id: primerIns,
          },
        ],
      },
    ]);
  }

  function quitarJornada(tipo: TipoJornada) {
    setJornadas((prev) => prev.filter((j) => j.tipo !== tipo));
  }

  function agregarFilaHorario(tipo: TipoJornada) {
    const primerIns = idsInstructores[0] ?? 0;
    const diaInicial: DiaSemana = tipo === "fin_de_semana" ? "sabado" : "lunes";
    setJornadas((prev) =>
      prev.map((j) =>
        j.tipo === tipo
          ? {
              ...j,
              horarios: [
                ...j.horarios,
                {
                  dia_semana: diaInicial,
                  ...horasPredeterminadas(tipo, diaInicial),
                  instructor_id: primerIns,
                },
              ],
            }
          : j
      )
    );
  }

  function quitarFilaHorario(tipo: TipoJornada, index: number) {
    setJornadas((prev) =>
      prev.map((j) =>
        j.tipo === tipo
          ? { ...j, horarios: j.horarios.filter((_, i) => i !== index) }
          : j
      )
    );
  }

  function actualizarHorario(
    tipo: TipoJornada,
    index: number,
    parcial: Partial<FilaHorario>
  ) {
    setJornadas((prev) =>
      prev.map((j) => {
        if (j.tipo !== tipo) {
          return j;
        }
        const horarios = [...j.horarios];
        const base = { ...horarios[index], ...parcial };
        if ("dia_semana" in parcial && parcial.dia_semana !== undefined) {
          horarios[index] = { ...base, ...horasPredeterminadas(tipo, parcial.dia_semana) };
        } else {
          horarios[index] = base;
        }
        return { ...j, horarios };
      })
    );
  }

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorForm(null);

    if (idsInstructores.length < 1) {
      setErrorForm("Selecciona al menos un instructor o gestor de la Formación.");
      return;
    }
    if (gestorId === null || !idsInstructores.includes(gestorId)) {
      setErrorForm("Debes marcar un Gestor de Grupo entre los instructores seleccionados.");
      return;
    }
    if (jornadas.length < 1) {
      setErrorForm("Agrega al menos una jornada (mañana, tarde, noche o fin de semana).");
      return;
    }
    for (const j of jornadas) {
      if (j.horarios.length < 1) {
        setErrorForm(`La jornada "${j.tipo}" debe tener al menos un día de horario.`);
        return;
      }
      for (const h of j.horarios) {
        if (!idsInstructores.includes(h.instructor_id)) {
          setErrorForm(
            "Cada horario debe usar un instructor que esté seleccionado en la lista."
          );
          return;
        }
        if (h.hora_inicio >= h.hora_fin) {
          setErrorForm("La hora de fin debe ser posterior a la de inicio en todos los horarios.");
          return;
        }
      }
    }

    const instructoresPayload = idsInstructores.map((uid) => ({
      usuario_id: uid,
      es_gestor: uid === gestorId,
    }));

    const payload: PayloadCrearFicha = {
      numero_ficha: numeroFicha.trim(),
      estado,
      modalidad,
      centro_formacion_id: centroId,
      programa_formacion_id: programaId,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      instructores: instructoresPayload,
      jornadas: jornadas.map((j) => ({
        tipo: j.tipo,
        horarios: j.horarios.map((h) => ({
          dia_semana: h.dia_semana,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          instructor_id: h.instructor_id,
        })),
      })),
    };

    await alEnviar(payload);
  }

  return (
    <form onSubmit={(e) => void manejarSubmit(e)} className="space-y-8">
      {modoEdicion && (
        <div
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          role="note"
        >
          <span className="font-semibold">Modo edición:</span> los cambios de
          horario solo afectarán sesiones futuras. El historial de asistencia
          existente siempre se conserva.
        </div>
      )}
      {errorForm && (
        <div
          className="rounded-lg border border-error/40 bg-red-50 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {errorForm}
        </div>
      )}

      <section className="rounded-xl border border-borderSubtle bg-surface p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Datos de la Ficha de Caracterización
        </h2>
        <p className="text-sm text-muted">
          Centro y programa definen el contexto de Formación del grupo.
        </p>

        {/* Info de regional del centro seleccionado */}
        {centroId > 0 && (() => {
          const centroSel = centros.find((c) => c.id === centroId);
          return centroSel?.regional ? (
            <div className="rounded-lg border border-verde/30 bg-verdeClaro/40 px-4 py-2.5 text-sm text-verdeOscuro">
              <span className="font-semibold">Regional:</span>{" "}
              {centroSel.regional.nombre}
            </div>
          ) : null;
        })()}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-foreground">Número de ficha</span>
            <input
              required
              className="mt-1 quorum-input"
              value={numeroFicha}
              onChange={(e) => setNumeroFicha(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Estado</span>
            <select
              className="mt-1 quorum-input"
              value={estado}
              onChange={(e) =>
                setEstado(e.target.value as "activa" | "suspendida")
              }
            >
              <option value="activa">Activa</option>
              <option value="suspendida">Suspendida</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Modalidad</span>
            <select
              className="mt-1 quorum-input"
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value as ModalidadFicha)}
            >
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
            </select>
          </label>
          {/* Filtro de regional: aparece cuando se cargaron las macrorregiones */}
          {macrorregiones.length > 0 && (
            <label className="block text-sm">
              <span className="font-medium text-foreground">Regional</span>
              <select
                className="mt-1 quorum-input"
                value={regionalId || ""}
                onChange={(e) => cambiarRegional(Number(e.target.value))}
              >
                <option value="">Todas las regionales</option>
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
            </label>
          )}
          <label className="block text-sm">
            <span className="font-medium text-foreground">Centro de formación</span>
            <select
              required
              className="mt-1 quorum-input"
              value={centroId || ""}
              onChange={(e) => setCentroId(Number(e.target.value))}
            >
              <option value="">Seleccione…</option>
              {centrosFiltrados.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-foreground">Programa de formación</span>
            <select
              required
              className="mt-1 quorum-input"
              value={programaId || ""}
              onChange={(e) => setProgramaId(Number(e.target.value))}
            >
              <option value="">Seleccione…</option>
              {TIPOS_PROGRAMA.map(({ value, label }) => {
                const grupo = programas.filter((p) => p.tipo === value);
                if (grupo.length === 0) return null;
                return (
                  <optgroup key={value} label={label}>
                    {grupo.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
              {/* programas sin tipo clasificado */}
              {programas.filter((p) => !p.tipo).length > 0 && (
                <optgroup label="Otros">
                  {programas
                    .filter((p) => !p.tipo)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Fecha de inicio</span>
            <input
              required
              type="date"
              className="mt-1 quorum-input"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Fecha de fin</span>
            <input
              required
              type="date"
              className="mt-1 quorum-input"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-borderSubtle bg-surface p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Instructores</h2>
        <p className="text-sm text-muted">
          Marca quién acompaña la Formación y un único Gestor de Grupo.
        </p>
        <ul className="divide-y divide-borderSubtle/70 rounded-lg border border-borderSubtle/70">
          {instructoresDisponibles.map((ins) => (
            <li
              key={ins.id}
              className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm"
            >
              <label className="flex flex-1 items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={idsInstructores.includes(ins.id)}
                  onChange={() => toggleInstructor(ins.id)}
                />
                <span>
                  {ins.nombre} {ins.apellido}{" "}
                  <span className="text-muted">({ins.correo})</span>
                </span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="gestor"
                  disabled={!idsInstructores.includes(ins.id)}
                  checked={gestorId === ins.id}
                  onChange={() => setGestorId(ins.id)}
                />
                Gestor de Grupo
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-borderSubtle bg-surface p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            Jornadas y horario semanal
          </h2>
          {tiposLibres.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted">Agregar jornada:</span>
              {tiposLibres.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="rounded-lg bg-verdeClaro px-3 py-1.5 text-sm font-medium text-verdeOscuro hover:bg-verde/20"
                  onClick={() => agregarJornada(t)}
                >
                  {t.replace("_", " ")}
                </button>
              ))}
            </div>
          )}
        </div>

        {jornadas.map((bloque) => (
          <div
            key={bloque.tipo}
            className="rounded-lg space-y-3 rounded-lg border border-borderSubtle/70 p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold capitalize text-foreground">
                Jornada: {bloque.tipo.replace("_", " ")}
              </h3>
              <button
                type="button"
                className="text-error text-sm inline-flex items-center gap-1"
                onClick={() => quitarJornada(bloque.tipo)}
              >
                <Trash2 size={16} aria-hidden />
                Quitar jornada
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted border-b">
                    <th className="py-2 pr-2">Día</th>
                    <th className="py-2 pr-2">Inicio</th>
                    <th className="py-2 pr-2">Fin</th>
                    <th className="py-2 pr-2">Instructor</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {bloque.horarios.map((h, idx) => (
                    <tr key={idx} className="border-b border-borderSubtle/50">
                      <td className="py-2 pr-2">
                        <select
                          className="rounded border border-borderSubtle bg-input px-2 py-1 text-foreground"
                          value={h.dia_semana}
                          onChange={(e) =>
                            actualizarHorario(bloque.tipo, idx, {
                              dia_semana: e.target.value as DiaSemana,
                            })
                          }
                        >
                          {DIAS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="time"
                          className="rounded border border-borderSubtle bg-input px-2 py-1 text-foreground"
                          value={h.hora_inicio}
                          onChange={(e) =>
                            actualizarHorario(bloque.tipo, idx, {
                              hora_inicio: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="time"
                          className="rounded border border-borderSubtle bg-input px-2 py-1 text-foreground"
                          value={h.hora_fin}
                          onChange={(e) =>
                            actualizarHorario(bloque.tipo, idx, {
                              hora_fin: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <select
                          className="min-w-[10rem] rounded border border-borderSubtle bg-input px-2 py-1 text-foreground"
                          value={h.instructor_id || ""}
                          onChange={(e) =>
                            actualizarHorario(bloque.tipo, idx, {
                              instructor_id: Number(e.target.value),
                            })
                          }
                        >
                          {idsInstructores.map((id) => {
                            const u = instructoresDisponibles.find((x) => x.id === id);
                            if (!u) {
                              return null;
                            }
                            return (
                              <option key={id} value={id}>
                                {u.nombre} {u.apellido}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          className="text-error p-1"
                          aria-label="Quitar fila"
                          onClick={() => quitarFilaHorario(bloque.tipo, idx)}
                          disabled={bloque.horarios.length <= 1}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm text-verde font-medium"
              onClick={() => agregarFilaHorario(bloque.tipo)}
            >
              <Plus size={18} aria-hidden />
              Agregar día
            </button>
          </div>
        ))}
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-xl bg-verde px-6 py-2.5 font-semibold text-white hover:bg-verdeOscuro disabled:opacity-50"
        >
          {enviando ? "Guardando…" : textoBoton}
        </button>
      </div>
    </form>
  );
}
