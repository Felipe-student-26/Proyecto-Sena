"use client";

// Página para establecer nueva contraseña — Módulo 2
// Se accede desde el enlace enviado por correo: /reset?token=XXXXX
// Incluye validación en tiempo real de la política de contraseñas

import { CheckCircle, Eye, EyeOff, KeyRound, Lock, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { authClasses } from "../../../components/auth/authClasses";
import AppCreditFooter from "../../../components/ui/AppCreditFooter";
import { QuorumWordmark } from "../../../components/branding/QuorumMark";
import { REQUISITOS_CONTRASENA } from "../../../lib/politicaContrasena";
import { procesarReset } from "../../../services/auth.service";

const REQUISITOS = REQUISITOS_CONTRASENA;

// Componente interno que usa useSearchParams (necesita estar dentro de Suspense)
function ResetForm() {
  const router         = useRouter();
  const searchParams   = useSearchParams();
  const token          = searchParams.get("token");

  const [password, setPassword]               = useState("");
  const [confirmacion, setConfirmacion]       = useState("");
  const [mostrarPass, setMostrarPass]         = useState(false);
  const [mostrarConfirm, setMostrarConfirm]   = useState(false);
  const [enviando, setEnviando]               = useState(false);

  // Evaluamos cada requisito en tiempo real con la contraseña actual
  const requisitosEstado = REQUISITOS.map((r) => ({
    ...r,
    cumplido: r.cumple(password),
  }));

  // El formulario solo se puede enviar si todos los requisitos se cumplen
  // y las contraseñas coinciden
  const politicaValida     = requisitosEstado.every((r) => r.cumplido);
  const passwordsCoinciden = password === confirmacion && confirmacion.length > 0;
  const puedeEnviar        = politicaValida && passwordsCoinciden && !enviando;

  // Si no hay token en la URL, mostramos un error amigable
  if (!token) {
    return (
      <div className={`${authClasses.cardInner} text-center`}>
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
          <XCircle className="text-error" size={28} />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Enlace inválido
        </h2>
        <p className="mb-5 text-sm text-muted">
          Este enlace de recuperación no es válido o está incompleto.
          Solicita uno nuevo desde la página de recuperación.
        </p>
        <Link href="/recuperar" className={`inline-block ${authClasses.link}`}>
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  // Maneja el envío del formulario de nueva contraseña
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // TypeScript: dentro del closure el token sigue siendo string | null; aquí lo estrechamos
    if (!token) return;
    if (!puedeEnviar) return;

    setEnviando(true);

    try {
      // Enviamos el token junto con la nueva contraseña al backend
      await procesarReset(token, password, confirmacion);

      toast.success("¡Contraseña actualizada!", {
        description: "Tu contraseña fue cambiada correctamente. Ya puedes iniciar sesión.",
      });
      router.push("/login");
    } catch (error: unknown) {
      const mensaje = obtenerMensajeError(error);
      toast.error("No se pudo actualizar la contraseña", { description: mensaje });
    } finally {
      setEnviando(false);
    }
  }

  // Extrae el mensaje de error de la respuesta de axios
  function obtenerMensajeError(error: unknown): string {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response &&
      error.response.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data
    ) {
      return String((error.response.data as { message: string }).message);
    }
    return "Ocurrió un error inesperado. Intenta de nuevo.";
  }

  return (
    <div className={authClasses.card}>
      <h2 className={`mb-1 ${authClasses.heading}`}>Nueva contraseña</h2>
      <p className={`mb-5 ${authClasses.body}`}>
        Elige una contraseña segura para tu cuenta. Debe cumplir todos los
        requisitos que se muestran abajo.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          {/* Campo nueva contraseña */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Nueva contraseña
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="password"
                type={mostrarPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                disabled={enviando}
                className="quorum-input pl-9 pr-10 disabled:opacity-60"
              />
              {/* Botón para mostrar/ocultar contraseña */}
              <button
                type="button"
                onClick={() => setMostrarPass(!mostrarPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                aria-label={mostrarPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Indicadores de política en tiempo real */}
          {password.length > 0 && (
            <div className="space-y-1.5 rounded-lg bg-surfaceMuted p-3">
              <p className="mb-2 text-xs font-medium text-foreground">
                Requisitos de contraseña:
              </p>
              {requisitosEstado.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  {r.cumplido ? (
                    <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
                  ) : (
                    <XCircle size={14} className="text-rose-600 flex-shrink-0" />
                  )}
                  <span
                    className={`text-xs ${
                      r.cumplido ? "text-verde" : "text-muted"
                    }`}
                  >
                    {r.texto}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Campo confirmar contraseña */}
          <div>
            <label
              htmlFor="confirmacion"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="confirmacion"
                type={mostrarConfirm ? "text" : "password"}
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                placeholder="Repite la contraseña"
                required
                disabled={enviando}
                className="quorum-input pl-9 pr-10 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirm(!mostrarConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                aria-label={mostrarConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Indicador de coincidencia de contraseñas */}
            {confirmacion.length > 0 && (
              <p
                className={`mt-1 flex items-center gap-1 text-xs ${
                  passwordsCoinciden ? "text-verde" : "text-error"
                }`}
              >
                {passwordsCoinciden ? (
                  <CheckCircle size={12} />
                ) : (
                  <XCircle size={12} />
                )}
                {passwordsCoinciden
                  ? "Las contraseñas coinciden"
                  : "Las contraseñas no coinciden"}
              </p>
            )}
          </div>

          {/* Botón de envío — solo habilitado cuando todo es válido */}
          <button
            type="submit"
            disabled={!puedeEnviar}
            className={authClasses.btnPrimary}
          >
            {enviando ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <KeyRound size={16} />
                Guardar nueva contraseña
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Componente de carga mientras se resuelve useSearchParams
function CargandoReset() {
  return (
    <div className={`${authClasses.card} text-center`}>
      <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-verde border-t-transparent" />
      <p className={`mt-3 ${authClasses.body}`}>Verificando enlace...</p>
    </div>
  );
}

// Página principal — envuelve el formulario en Suspense (requerido por useSearchParams en App Router)
export default function ResetPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <div className={authClasses.iconBadge}>
          <KeyRound className="text-verde dark:text-verdeClaro" size={32} />
        </div>
        <h1 className="m-0 p-0">
          <QuorumWordmark variant="auth" />
        </h1>
        <p className={authClasses.subtitle}>
          Sistema de Control de Asistencia — SENA CPIC
        </p>
      </div>

      <Suspense fallback={<CargandoReset />}>
        <ResetForm />
      </Suspense>

      <div className="mt-4 text-center">
        <Link href="/login" className={authClasses.link}>
          Volver al inicio de sesión
        </Link>
      </div>

      <AppCreditFooter variant="auth" />
    </>
  );
}
