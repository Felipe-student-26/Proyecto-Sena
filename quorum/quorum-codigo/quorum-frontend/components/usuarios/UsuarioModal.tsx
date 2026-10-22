"use client";

// Modal crear/editar usuario — Módulo 6

import { CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import {
  REQUISITOS_CONTRASENA,
  contrasenaCumplePolitica,
} from "../../lib/politicaContrasena";
import { actualizarUsuario, crearUsuario } from "../../services/usuarios.service";
import type { FichaListado } from "../../types/ficha";
import type { RolUsuario, UsuarioListado } from "../../types/usuario";

const ROLES_FORMULARIO: { value: RolUsuario; etiqueta: string }[] = [
  { value: "admin", etiqueta: "Administrador" },
  { value: "coordinador", etiqueta: "Coordinador" },
  { value: "instructor", etiqueta: "Instructor" },
  { value: "gestor_grupo", etiqueta: "Gestor de grupo" },
  { value: "aprendiz", etiqueta: "Aprendiz" },
];

interface UsuarioModalProps {
  abierto: boolean;
  modo: "crear" | "editar";
  /** En edición, datos actuales; en creación null */
  usuario: UsuarioListado | null;
  fichas: FichaListado[];
  onCerrar: () => void;
  onGuardado: () => void;
}

function erroresDesdeApi(data: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!data || typeof data !== "object") return out;
  const raw = (data as { errors?: Record<string, string | string[]> }).errors;
  if (!raw) return out;
  for (const [clave, val] of Object.entries(raw)) {
    out[clave] = Array.isArray(val) ? val[0] : String(val);
  }
  return out;
}

export default function UsuarioModal({
  abierto,
  modo,
  usuario,
  fichas,
  onCerrar,
  onGuardado,
}: UsuarioModalProps) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState<RolUsuario>("instructor");
  const [fichaId, setFichaId] = useState<string>("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  const esAprendiz = rol === "aprendiz";
  const mostrarPolitica =
    (modo === "crear" && !esAprendiz) ||
    (modo === "editar" && !esAprendiz && password.length > 0);

  const requisitosEstado = REQUISITOS_CONTRASENA.map((r) => ({
    ...r,
    cumplido: r.cumple(password),
  }));

  // Al abrir o cambiar usuario/modo, rellenar el formulario
  useEffect(() => {
    if (!abierto) return;
    setErrores({});
    setPassword("");
    if (modo === "editar" && usuario) {
      setNombre(usuario.nombre);
      setApellido(usuario.apellido);
      setDocumento(usuario.documento);
      setCorreo(usuario.correo);
      setRol(usuario.rol);
      setFichaId(usuario.ficha_id != null ? String(usuario.ficha_id) : "");
    } else {
      setNombre("");
      setApellido("");
      setDocumento("");
      setCorreo("");
      setRol("instructor");
      setFichaId("");
    }
  }, [abierto, modo, usuario]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrores({});

    if (modo === "crear" && !esAprendiz && !contrasenaCumplePolitica(password)) {
      setErrores({
        password: "La contraseña no cumple la política de seguridad.",
      });
      return;
    }

    if (modo === "editar" && !esAprendiz && password.length > 0) {
      if (!contrasenaCumplePolitica(password)) {
        setErrores({
          password: "La contraseña no cumple la política de seguridad.",
        });
        return;
      }
    }

    setEnviando(true);
    try {
      if (modo === "crear") {
        if (esAprendiz) {
          await crearUsuario({
            nombre,
            apellido,
            documento,
            correo,
            rol,
            ficha_id: fichaId ? Number(fichaId) : null,
          });
        } else {
          await crearUsuario({
            nombre,
            apellido,
            documento,
            correo,
            rol,
            password,
          });
        }
      } else if (usuario) {
        await actualizarUsuario(usuario.id, {
          nombre,
          apellido,
          documento,
          correo,
          rol,
          ficha_id: esAprendiz ? (fichaId ? Number(fichaId) : null) : null,
          password: password.length > 0 ? password : null,
        });
      }
      onGuardado();
      onCerrar();
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 422) {
        setErrores(erroresDesdeApi(err.response.data));
      } else if (isAxiosError(err) && err.response?.data) {
        const msg =
          (err.response.data as { message?: string }).message ??
          "No se pudo guardar el usuario.";
        setErrores({ general: msg });
      } else {
        setErrores({ general: "Error de red. Inténtalo de nuevo." });
      }
    } finally {
      setEnviando(false);
    }
  }

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-usuario"
    >
      <div className="bg-surface rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto border border-borderSubtle">
        <div className="p-5 border-b border-borderSubtle/70">
          <h2
            id="titulo-modal-usuario"
            className="text-lg font-semibold text-foreground"
          >
            {modo === "crear" ? "Nuevo usuario" : "Editar usuario"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errores.general && (
            <p className="text-sm text-error">{errores.general}</p>
          )}

          <div>
            <label htmlFor="u-nombre" className="block text-sm font-medium text-foreground mb-1">
              Nombre
            </label>
            <input
              id="u-nombre"
              className="quorum-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              autoComplete="given-name"
            />
            {errores.nombre && (
              <p className="text-xs text-error mt-1">{errores.nombre}</p>
            )}
          </div>

          <div>
            <label htmlFor="u-apellido" className="block text-sm font-medium text-foreground mb-1">
              Apellido
            </label>
            <input
              id="u-apellido"
              className="quorum-input"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
              autoComplete="family-name"
            />
            {errores.apellido && (
              <p className="text-xs text-error mt-1">{errores.apellido}</p>
            )}
          </div>

          <div>
            <label htmlFor="u-doc" className="block text-sm font-medium text-foreground mb-1">
              Documento
            </label>
            <input
              id="u-doc"
              className="quorum-input"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              required
            />
            {errores.documento && (
              <p className="text-xs text-error mt-1">{errores.documento}</p>
            )}
          </div>

          <div>
            <label htmlFor="u-correo" className="block text-sm font-medium text-foreground mb-1">
              Correo
            </label>
            <input
              id="u-correo"
              type="email"
              className="quorum-input"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              autoComplete="email"
            />
            {errores.correo && (
              <p className="text-xs text-error mt-1">{errores.correo}</p>
            )}
          </div>

          <div>
            <label htmlFor="u-rol" className="block text-sm font-medium text-foreground mb-1">
              Rol
            </label>
            <select
              id="u-rol"
              className="quorum-input bg-input"
              value={rol}
              onChange={(e) => setRol(e.target.value as RolUsuario)}
            >
              {ROLES_FORMULARIO.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.etiqueta}
                </option>
              ))}
            </select>
            {errores.rol && (
              <p className="text-xs text-error mt-1">{errores.rol}</p>
            )}
          </div>

          {esAprendiz && (
            <div>
              <label htmlFor="u-ficha" className="block text-sm font-medium text-foreground mb-1">
                Ficha de caracterización
              </label>
              <select
                id="u-ficha"
                className="quorum-input bg-input"
                value={fichaId}
                onChange={(e) => setFichaId(e.target.value)}
                required={esAprendiz}
              >
                <option value="">Selecciona una ficha activa</option>
                {fichas.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.numero_ficha}
                  </option>
                ))}
              </select>
              {errores.ficha_id && (
                <p className="text-xs text-error mt-1">{errores.ficha_id}</p>
              )}
            </div>
          )}

          {modo === "crear" && !esAprendiz && (
            <div>
              <label htmlFor="u-pass" className="block text-sm font-medium text-foreground mb-1">
                Contraseña
              </label>
              <input
                id="u-pass"
                type="password"
                className="quorum-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {errores.password && (
                <p className="text-xs text-error mt-1">{errores.password}</p>
              )}
            </div>
          )}

          {modo === "editar" && !esAprendiz && (
            <div>
              <label htmlFor="u-pass2" className="block text-sm font-medium text-foreground mb-1">
                Nueva contraseña (opcional)
              </label>
              <input
                id="u-pass2"
                type="password"
                className="quorum-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              {errores.password && (
                <p className="text-xs text-error mt-1">{errores.password}</p>
              )}
            </div>
          )}

          {mostrarPolitica && (
            <ul className="text-xs space-y-1 text-muted border border-borderSubtle/70 rounded-lg bg-surfaceMuted p-3">
              {requisitosEstado.map((r) => (
                <li key={r.id} className="flex items-center gap-2">
                  {r.cumplido ? (
                    <CheckCircle className="text-verde shrink-0" size={16} aria-hidden />
                  ) : (
                    <XCircle className="text-muted shrink-0" size={16} aria-hidden />
                  )}
                  <span className={r.cumplido ? "text-foreground" : ""}>{r.texto}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 rounded-lg border border-borderSubtle text-sm text-foreground transition-colors hover:bg-surfaceMuted"
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="px-4 py-2 rounded-lg bg-verde text-white text-sm font-medium hover:bg-verdeOscuro disabled:opacity-50"
            >
              {enviando ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
