"use client";

// Configuración inicial de TOTP — QR + confirmación con código de 6 dígitos

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { authClasses } from "../../../../components/auth/authClasses";
import AppCreditFooter from "../../../../components/ui/AppCreditFooter";
import { useAuthContext } from "../../../../contexts/AuthContext";
import {
  activarConfiguracion2FA,
  prepararConfiguracion2FA,
} from "../../../../services/totp.service";

export default function Configurar2FAPage() {
  const router = useRouter();
  const { usuario, cargando, totpSesionCompleta, recargarUsuario } =
    useAuthContext();

  const [cargandoQr, setCargandoQr] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secreto, setSecreto] = useState<string | null>(null);
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
    if (usuario.totp_configurado && totpSesionCompleta) {
      router.replace("/dashboard");
      return;
    }
    if (usuario.totp_configurado && !totpSesionCompleta) {
      router.replace("/2fa/verificar");
    }
  }, [cargando, usuario, totpSesionCompleta, router]);

  const cargarQr = useCallback(async () => {
    if (!usuario || usuario.rol === "aprendiz" || usuario.totp_configurado) {
      return;
    }
    setCargandoQr(true);
    try {
      const datos = await prepararConfiguracion2FA();
      setSecreto(datos.secreto_manual);
      const url = await QRCode.toDataURL(datos.otpauth_url, {
        width: 220,
        margin: 2,
        color: { dark: "#333333", light: "#ffffff" },
      });
      setQrDataUrl(url);
    } catch {
      toast.error("No se pudo preparar el código QR", {
        description: "Comprueba la conexión o vuelve a iniciar sesión.",
      });
    } finally {
      setCargandoQr(false);
    }
  }, [usuario]);

  useEffect(() => {
    if (cargando || !usuario || usuario.rol === "aprendiz") return;
    if (usuario.totp_configurado) return;
    void cargarQr();
  }, [cargando, usuario, cargarQr]);

  async function handleConfirmar(e: React.FormEvent) {
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
      await activarConfiguracion2FA(limpio);
      await recargarUsuario();
      toast.success("Listo", { description: "Autenticación en dos pasos activada." });
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
          : "No se pudo validar el código.";
      toast.error("Error al confirmar", { description: msg });
    } finally {
      setEnviando(false);
    }
  }

  if (cargando || !usuario || usuario.rol === "aprendiz") {
    return <p className={`text-center ${authClasses.body}`}>Cargando...</p>;
  }

  return (
    <>
      <div className={`${authClasses.card} text-center`}>
      <div className={authClasses.iconBadge}>
        <ShieldCheck
          className="text-verde dark:text-verdeClaro"
          size={32}
          aria-hidden="true"
        />
      </div>

      <h1 className="mb-2 text-xl font-bold text-foreground dark:text-white">
        Configura tu autenticación en dos pasos
      </h1>

      <p className={`mb-6 text-left ${authClasses.body}`}>
        Escanea el código QR con Google Authenticator, Microsoft Authenticator
        o Authy e ingresa el código de 6 dígitos para confirmar.
      </p>

      <div className="mb-4 flex min-h-[200px] items-center justify-center rounded-lg bg-grisClaro p-4 dark:bg-white/[0.06]">
        {cargandoQr ? (
          <p className={authClasses.body}>Generando QR...</p>
        ) : qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt="Código QR para configurar autenticación en dos pasos"
            width={220}
            height={220}
            className="mx-auto"
          />
        ) : (
          <p className="text-sm text-error">No se pudo mostrar el QR.</p>
        )}
      </div>

      {secreto ? (
        <div className="mb-6 text-left">
          <p className="mb-1 text-xs font-medium text-foreground dark:text-white/80">
            Si no puedes escanear, ingresa manualmente:
          </p>
          <code className="block select-all break-all rounded border border-borderSubtle bg-input p-2 text-xs text-foreground dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
            {secreto}
          </code>
        </div>
      ) : null}

      <form onSubmit={handleConfirmar} className="space-y-4 text-left">
        <div>
          <label htmlFor="codigo-totp" className="sr-only">
            Código de 6 dígitos
          </label>
          <input
            id="codigo-totp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Código de 6 dígitos"
            value={codigo}
            onChange={(e) =>
              setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className={`${authClasses.input} py-3 text-center text-lg tracking-widest`}
          />
        </div>
        <button
          type="submit"
          disabled={enviando || codigo.length !== 6}
          className={authClasses.btnPrimary}
        >
          {enviando ? "Verificando..." : "Confirmar y continuar"}
        </button>
      </form>

      <Link href="/login" className={`inline-block mt-6 ${authClasses.link}`}>
        Volver al inicio de sesión
      </Link>
      </div>

      <AppCreditFooter variant="auth" />
    </>
  );
}
