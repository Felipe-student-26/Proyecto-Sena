"use client";

// Verificación TOTP en cada inicio de sesión (usuario ya tiene 2FA activo)

import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authClasses } from "../../../../components/auth/authClasses";
import AppCreditFooter from "../../../../components/ui/AppCreditFooter";
import { useAuthContext } from "../../../../contexts/AuthContext";
import { verificarCodigo2FA } from "../../../../services/totp.service";

export default function Verificar2FAPage() {
  const router = useRouter();
  const { usuario, cargando, totpSesionCompleta, recargarUsuario, logout } =
    useAuthContext();

  const [codigo, setCodigo] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (cargando) return;
    if (!usuario) {
      router.replace("/login");
      return;
    }
    if (usuario.rol === "aprendiz") {
      router.replace("/mi-historial");
      return;
    }
    if (totpSesionCompleta) {
      router.replace("/dashboard");
      return;
    }
    if (!usuario.totp_configurado) {
      router.replace("/2fa/configurar");
    }
  }, [cargando, usuario, totpSesionCompleta, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const limpio = codigo.replace(/\D/g, "").slice(0, 6);
    if (limpio.length !== 6) {
      toast.warning("Código incompleto", {
        description: "Ingresa los 6 dígitos que muestra tu aplicación.",
      });
      return;
    }

    setEnviando(true);
    try {
      await verificarCodigo2FA(limpio);
      await recargarUsuario();
      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
          ? String((err.response.data as { message: string }).message)
          : "No se pudo verificar el código.";
      toast.error("Error al verificar", { description: msg });
    } finally {
      setEnviando(false);
    }
  }

  async function handleVolverLogin() {
    await logout();
    router.replace("/login");
  }

  if (cargando || !usuario || usuario.rol === "aprendiz") {
    return <p className={`text-center ${authClasses.body}`}>Cargando...</p>;
  }

  return (
    <>
      <div className={`${authClasses.card} text-center`}>
      <div className={authClasses.iconBadge}>
        <KeyRound className="text-verde dark:text-verdeClaro" size={32} aria-hidden="true" />
      </div>

      <h1 className="mb-2 text-xl font-bold text-foreground dark:text-white">
        Verificación en dos pasos
      </h1>

      <p className={`mb-6 ${authClasses.body}`}>
        Ingresa el código de 6 dígitos que muestra tu aplicación de autenticación.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="codigo-verify" className="sr-only">
          Código TOTP
        </label>
        <input
          id="codigo-verify"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="••••••"
          value={codigo}
          onChange={(e) =>
            setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className={`${authClasses.input} py-3 text-center text-lg tracking-widest`}
        />
        <button
          type="submit"
          disabled={enviando || codigo.length !== 6}
          className={authClasses.btnPrimary}
        >
          {enviando ? "Verificando..." : "Continuar"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => void handleVolverLogin()}
        className={`mt-6 ${authClasses.link}`}
      >
        Volver al inicio de sesión
      </button>
      </div>

      <AppCreditFooter variant="auth" />
    </>
  );
}
