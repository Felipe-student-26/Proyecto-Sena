"use client";

// Página Mi perfil — Módulo 13: datos en lectura, cambio de contraseña y accesibilidad

import { useEffect, useState } from "react";
import {
  Check,
  Circle,
  Lock,
  Mail,
  Minus,
  Plus,
  UserCircle,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import Avatar from "../../../components/ui/Avatar";
import Badge from "../../../components/ui/Badge";
import { useAuth } from "../../../hooks/useAuth";
import {
  REQUISITOS_CONTRASENA,
  contrasenaCumplePolitica,
} from "../../../lib/politicaContrasena";
import {
  aplicarAltoContrasteEnDocumento,
  aplicarEscalaEnDocumento,
  escucharPreferenciasAccesibilidad,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  guardarAltoContraste,
  guardarEscala,
  obtenerAltoContrasteGuardado,
  obtenerEscalaGuardada,
} from "../../../lib/themeStorage";
import { cambiarContrasenaPerfil } from "../../../services/perfil.service";

// Formatea la fecha de alta (America/Bogota se asume en datos del servidor)
function formatearMiembroDesde(valor: string | null | undefined): string {
  if (!valor) return "—";
  try {
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return "—";
  }
}

function mensajeErrorApi(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const r = err as {
      response?: {
        data?: { message?: string; errores?: Record<string, string[]> };
      };
    };
    const data = r.response?.data;
    if (data?.message) return data.message;
    const errores = data?.errores;
    if (errores && typeof errores === "object") {
      const primera = Object.values(errores)[0];
      if (Array.isArray(primera) && primera[0]) return primera[0];
    }
  }
  return "No se pudo completar la operación.";
}

export default function PerfilPage() {
  const { usuario } = useAuth();

  const [escalaTexto, setEscalaTexto] = useState(1);
  const [altoContraste, setAltoContraste] = useState(false);

  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [enviandoPassword, setEnviandoPassword] = useState(false);

  // Sincroniza controles de accesibilidad con localStorage al entrar
  useEffect(() => {
    const escala = obtenerEscalaGuardada();
    if (escala != null) {
      setEscalaTexto(escala);
      aplicarEscalaEnDocumento(escala);
    }
    const hc = obtenerAltoContrasteGuardado();
    setAltoContraste(hc);
    aplicarAltoContrasteEnDocumento(hc);
  }, []);

  useEffect(() => {
    return escucharPreferenciasAccesibilidad(() => {
      const g = obtenerEscalaGuardada();
      if (g != null) {
        setEscalaTexto(g);
        aplicarEscalaEnDocumento(g);
      }
      const hc = obtenerAltoContrasteGuardado();
      setAltoContraste(hc);
      aplicarAltoContrasteEnDocumento(hc);
    });
  }, []);

  function aumentarTexto() {
    const nueva = Math.min(
      parseFloat((escalaTexto + 0.1).toFixed(1)),
      FONT_SCALE_MAX
    );
    setEscalaTexto(nueva);
    aplicarEscalaEnDocumento(nueva);
    guardarEscala(nueva);
  }

  function reducirTexto() {
    const nueva = Math.max(
      parseFloat((escalaTexto - 0.1).toFixed(1)),
      FONT_SCALE_MIN
    );
    setEscalaTexto(nueva);
    aplicarEscalaEnDocumento(nueva);
    guardarEscala(nueva);
  }

  function toggleAltoContraste() {
    const siguiente = !altoContraste;
    setAltoContraste(siguiente);
    aplicarAltoContrasteEnDocumento(siguiente);
    guardarAltoContraste(siguiente);
  }

  async function handleCambiarPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!contrasenaCumplePolitica(passwordNueva)) {
      toast.warning("Contraseña no válida", { description: "Revisa que la nueva contraseña cumpla todos los requisitos." });
      return;
    }
    if (passwordNueva !== passwordConfirm) {
      toast.warning("Las contraseñas no coinciden", { description: "Escribe la misma contraseña en los dos campos de la nueva clave." });
      return;
    }

    setEnviandoPassword(true);
    try {
      await cambiarContrasenaPerfil({
        password_actual: passwordActual,
        password: passwordNueva,
        password_confirmation: passwordConfirm,
      });
      setPasswordActual("");
      setPasswordNueva("");
      setPasswordConfirm("");
      toast.success("Listo", { description: "Tu contraseña se actualizó correctamente." });
    } catch (err) {
      toast.error("No se pudo cambiar", { description: mensajeErrorApi(err) });
    } finally {
      setEnviandoPassword(false);
    }
  }

  if (!usuario) {
    return null;
  }

  const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.trim();
  const esAprendiz = usuario.rol === "aprendiz";
  const activo =
    usuario.activo === undefined ? true : Number(usuario.activo) === 1;

  return (
    <div className="max-w-4xl mx-auto pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-verdeClaro dark:bg-verdeOscuro/35">
          <UserCircle size={22} className="text-verde" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Mi perfil
          </h1>
          <p className="text-sm text-muted">
            Tu información y preferencias
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-borderSubtle bg-surface p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar nombre={nombreCompleto} id={usuario.id} size="xl" />
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold text-foreground">
                {nombreCompleto}
              </h2>
              <Badge rol={usuario.rol} />
            </div>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">Documento</dt>
                <dd className="font-medium text-foreground">
                  {usuario.documento ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-muted">
                  <Mail size={14} aria-hidden="true" />
                  Correo
                </dt>
                <dd className="break-all font-medium text-foreground">
                  {usuario.correo}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Estado</dt>
                <dd className="font-medium text-foreground">
                  {activo ? "Activo" : "Inactivo"}
                </dd>
              </div>
              <div>
                <dt className="text-muted">
                  Miembro desde
                </dt>
                <dd className="font-medium text-foreground">
                  {formatearMiembroDesde(usuario.creado_en)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-verde/20 bg-verdeClaro/60 px-4 py-3 text-sm text-foreground dark:bg-verdeOscuro/25 dark:text-foreground">
          <p>
            Para modificar tu información, comunícate con el administrador:{" "}
            <a
              className="font-semibold text-verdeOscuro underline hover:no-underline dark:text-verde"
              href="mailto:gestradac@sena.edu.co"
            >
              gestradac@sena.edu.co
            </a>
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-borderSubtle bg-surface p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lock size={20} className="text-verde" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-foreground">
            Cambiar contraseña
          </h2>
        </div>
        {esAprendiz && (
          <p className="mb-4 text-sm text-muted">
            Tu contraseña inicial es tu número de cédula. Inicias sesión con
            correo y contraseña; puedes cambiarla aquí cuando lo desees.
          </p>
        )}
        <form onSubmit={(e) => void handleCambiarPassword(e)} className="space-y-4 max-w-md">
            <div>
              <label
                htmlFor="password_actual"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Contraseña actual
              </label>
              <input
                id="password_actual"
                type="password"
                autoComplete="current-password"
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                className="quorum-input"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password_nueva"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Nueva contraseña
              </label>
              <input
                id="password_nueva"
                type="password"
                autoComplete="new-password"
                value={passwordNueva}
                onChange={(e) => setPasswordNueva(e.target.value)}
                className="quorum-input"
                required
              />
              <ul className="mt-2 space-y-1 text-xs">
                {REQUISITOS_CONTRASENA.map((req) => (
                  <li
                    key={req.id}
                    className={`flex items-center gap-2 ${
                      req.cumple(passwordNueva)
                        ? "text-verdeOscuro dark:text-verde"
                        : "text-muted"
                    }`}
                  >
                    {req.cumple(passwordNueva) ? (
                      <Check size={14} className="shrink-0" aria-hidden="true" />
                    ) : (
                      <Circle size={14} className="shrink-0" aria-hidden="true" />
                    )}
                    {req.texto}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <label
                htmlFor="password_confirm"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Confirmar nueva contraseña
              </label>
              <input
                id="password_confirm"
                type="password"
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="quorum-input"
                required
              />
              {passwordConfirm.length > 0 && passwordNueva !== passwordConfirm && (
                <p className="mt-1 text-xs text-error">Las contraseñas no coinciden.</p>
              )}
            </div>
            <button
              type="submit"
              disabled={
                enviandoPassword ||
                !contrasenaCumplePolitica(passwordNueva) ||
                passwordNueva !== passwordConfirm
              }
              className="rounded-lg bg-verde px-4 py-2 text-sm font-semibold text-white hover:bg-verdeOscuro disabled:opacity-50 disabled:pointer-events-none"
            >
              {enviandoPassword ? "Guardando…" : "Guardar contraseña"}
            </button>
        </form>
      </div>

      <div className="rounded-xl border border-borderSubtle bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Preferencias de accesibilidad
        </h2>
        <p className="mb-4 text-sm text-muted">
          Se guardan en este navegador y se aplican al volver a entrar.
        </p>
        <div className="mb-6">
          <p className="mb-2 flex items-center gap-1.5 text-sm text-foreground">
            <ZoomIn size={14} aria-hidden="true" />
            Tamaño del texto
          </p>
          <div className="flex items-center gap-2 max-w-xs">
            <button
              type="button"
              onClick={reducirTexto}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-borderSubtle transition-colors hover:bg-surfaceMuted disabled:opacity-40"
              aria-label="Reducir texto"
              disabled={escalaTexto <= FONT_SCALE_MIN}
            >
              <Minus size={14} />
            </button>
            <span className="flex-1 text-center text-sm font-medium text-foreground">
              {Math.round(escalaTexto * 100)}%
            </span>
            <button
              type="button"
              onClick={aumentarTexto}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-borderSubtle transition-colors hover:bg-surfaceMuted disabled:opacity-40"
              aria-label="Aumentar texto"
              disabled={escalaTexto >= FONT_SCALE_MAX}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between max-w-xs">
          <p className="text-sm text-foreground">
            Alto contraste
          </p>
          <button
            type="button"
            onClick={toggleAltoContraste}
            className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
              altoContraste ? "bg-verde" : "bg-gray-300 dark:bg-surfaceMuted"
            }`}
            role="switch"
            aria-checked={altoContraste}
            aria-label="Activar alto contraste"
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                altoContraste ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
