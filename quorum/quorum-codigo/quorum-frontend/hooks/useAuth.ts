"use client";

// Hook principal de autenticación — simplifica el consumo del AuthContext
// Centraliza la lógica de login con redirección según rol y estado de 2FA

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { loginStaff as loginStaffServicio } from "../services/auth.service";
import type { LoginStaffPayload } from "../types/auth";

export function useAuth() {
  const router = useRouter();
  const {
    usuario,
    totpSesionCompleta,
    nombreSistema,
    cargando,
    isAuthenticated,
    setUsuario,
    setTotpSesionCompleta,
    setNombreSistema,
    logout,
    recargarUsuario,
  } = useAuthContext();

  // Estado local para saber si hay una petición en curso (deshabilitar botón de enviar)
  const [enviando, setEnviando] = useState(false);

  // Login unificado — redirige según rol y estado de 2FA (solo staff)
  const login = useCallback(
    async (datos: LoginStaffPayload) => {
      setEnviando(true);
      try {
        const respuesta = await loginStaffServicio(datos);
        const usuarioActual = respuesta.usuario;
        setUsuario(usuarioActual);
        setTotpSesionCompleta(respuesta.totp_sesion_completa);
        if (respuesta.nombre_sistema?.trim()) {
          setNombreSistema(respuesta.nombre_sistema.trim());
        }

        if (usuarioActual.rol === "aprendiz") {
          router.push("/mi-historial");
          return;
        }

        // Backend local puede marcar sesión completa sin TOTP (TOTP_BYPASS_LOCAL)
        if (respuesta.totp_sesion_completa) {
          router.push("/dashboard");
          return;
        }

        // Decidimos a dónde ir según si ya tiene 2FA configurado o no
        if (!usuarioActual.totp_configurado) {
          router.push("/2fa/configurar");
        } else {
          router.push("/2fa/verificar");
        }
      } finally {
        setEnviando(false);
      }
    },
    [router, setUsuario, setTotpSesionCompleta, setNombreSistema]
  );

  // Logout — cierra sesión y redirige al login
  const cerrarSesion = useCallback(async () => {
    await logout();
    router.push("/login");
  }, [logout, router]);

  return {
    usuario,
    totpSesionCompleta,
    nombreSistema,
    isAuthenticated,
    cargando,
    enviando,
    login,
    logout: cerrarSesion,
    recargarUsuario,
  };
}
