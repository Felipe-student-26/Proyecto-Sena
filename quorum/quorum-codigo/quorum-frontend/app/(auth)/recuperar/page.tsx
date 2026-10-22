"use client";

// Página de recuperación de contraseña — Módulo 2
// El usuario ingresa su correo y recibe un enlace de reset si su cuenta existe

import { KeyRound, Mail, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { authClasses } from "../../../components/auth/authClasses";
import AppCreditFooter from "../../../components/ui/AppCreditFooter";
import { QuorumWordmark } from "../../../components/branding/QuorumMark";
import { solicitarReset } from "../../../services/auth.service";

export default function RecuperarPage() {
  const [correo, setCorreo] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!correo.trim()) return;

    setEnviando(true);

    try {
      await solicitarReset(correo.trim());
    } catch {
      // Mensaje genérico por seguridad
    } finally {
      setEnviando(false);
    }

    toast.info("Solicitud enviada", {
      description:
        "Si el correo está registrado, recibirás las instrucciones en tu bandeja de entrada. Revisa también la carpeta de spam.",
    });

    setCorreo("");
  }

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

      <div className={authClasses.card}>
        <h2 className={`mb-1 ${authClasses.heading}`}>Recuperar contraseña</h2>
        <p className={`mb-5 ${authClasses.body}`}>
          Ingresa el correo asociado a tu cuenta. Si existe, recibirás un enlace
          para crear una nueva contraseña.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="correo" className={authClasses.labelSm}>
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="usuario@sena.edu.co"
                  required
                  disabled={enviando}
                  className={`${authClasses.input} pl-9 disabled:opacity-60`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={enviando || !correo.trim()}
              className={authClasses.btnPrimary}
            >
              {enviando ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Enviar instrucciones
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-4 text-center">
        <Link href="/login" className={`inline-flex items-center gap-1 ${authClasses.link}`}>
          <ArrowLeft size={14} />
          Volver al inicio de sesión
        </Link>
      </div>

      <AppCreditFooter variant="auth" />
    </>
  );
}
