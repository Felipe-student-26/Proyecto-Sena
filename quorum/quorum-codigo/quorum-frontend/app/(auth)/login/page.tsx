"use client";

// Página de login — Módulo 1 Autenticación
// Login único: correo + contraseña

import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { authClasses } from "../../../components/auth/authClasses";
import DevQuickLogin, { type UsuarioPrueba } from "../../../components/auth/DevQuickLogin";
import AppCreditFooter from "../../../components/ui/AppCreditFooter";
import { useAuth } from "../../../hooks/useAuth";
import { QuorumWordmark } from "../../../components/branding/QuorumMark";

export default function LoginPage() {
  const { login, enviando } = useAuth();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      await login({ correo, password });
    } catch (error: unknown) {
      const mensaje = obtenerMensajeError(error);
      toast.error("Error al iniciar sesión", { description: mensaje });
    }
  }

  function usarUsuarioPrueba(usuario: UsuarioPrueba) {
    setCorreo(usuario.correo);
    setPassword(usuario.password ?? "");
  }

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
    <>
      <div className="mb-6 text-center">
        <h1 className="flex flex-col items-center gap-3">
          <QuorumWordmark variant="login" priority />
        </h1>
        <p className={authClasses.subtitle}>
          Sistema de Control de Asistencia — SENA
        </p>
      </div>

      <div className={authClasses.card}>
        <form onSubmit={handleLogin} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="correo" className={authClasses.label}>
                Correo electrónico
              </label>
              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="usuario@sena.edu.co"
                required
                className={authClasses.input}
              />
            </div>

            <div>
              <label htmlFor="password" className={authClasses.label}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  required
                  className={`${authClasses.input} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground dark:text-white/40 dark:hover:text-white/70"
                  aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={enviando}
              className={`mt-2 ${authClasses.btnPrimary}`}
            >
              {enviando ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Verificando...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Ingresar
                </>
              )}
            </button>

            <div className="text-center">
              <a href="/recuperar" className={authClasses.linkXs}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>
        </form>
      </div>

      <AppCreditFooter variant="auth" />

      <div className="mt-[min(40vh,360px)] pb-8">
        <DevQuickLogin onSelectUsuario={usarUsuarioPrueba} />
      </div>
    </>
  );
}
