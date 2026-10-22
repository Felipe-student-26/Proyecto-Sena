"use client";

// Contexto global de autenticación — provee el usuario actual a toda la app
// Se carga en app/layout.tsx para que esté disponible en todas las páginas

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getMe, logout as logoutServicio } from "../services/auth.service";
import type { UsuarioAuth } from "../types/auth";

// Forma del contexto: qué datos y funciones estarán disponibles
interface AuthContextType {
  usuario: UsuarioAuth | null;
  /** Staff: true solo tras configurar o verificar TOTP en esta sesión */
  totpSesionCompleta: boolean;
  /** Nombre del sistema (headbar) — viene de GET /api/auth/me */
  nombreSistema: string;
  cargando: boolean;
  isAuthenticated: boolean;
  setUsuario: (usuario: UsuarioAuth | null) => void;
  setTotpSesionCompleta: (valor: boolean) => void;
  setNombreSistema: (nombre: string) => void;
  logout: () => Promise<void>;
  recargarUsuario: () => Promise<void>;
}

// Creamos el contexto con valor vacío por defecto
const AuthContext = createContext<AuthContextType>({
  usuario: null,
  totpSesionCompleta: false,
  nombreSistema: "QUORUM",
  cargando: true,
  isAuthenticated: false,
  setUsuario: () => {},
  setTotpSesionCompleta: () => {},
  setNombreSistema: () => {},
  logout: async () => {},
  recargarUsuario: async () => {},
});

// Hook para consumir el contexto fácilmente desde cualquier componente
export function useAuthContext(): AuthContextType {
  return useContext(AuthContext);
}

function esRutaAuthInvitado(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const prefijos = ["/login", "/recuperar", "/reset"];
  return prefijos.some(
    (p) =>
      window.location.pathname === p ||
      window.location.pathname.startsWith(`${p}/`)
  );
}

// Proveedor — envuelve la app en layout.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAuth | null>(null);
  const [totpSesionCompleta, setTotpSesionCompleta] = useState(false);
  const [nombreSistema, setNombreSistema] = useState("QUORUM");
  const [cargando, setCargando] = useState(true);

  // Al montar, intentamos recuperar el usuario de la sesión activa
  const recargarUsuario = useCallback(async () => {
    try {
      const datos = await getMe();
      setUsuario(datos.usuario);
      setTotpSesionCompleta(datos.totp_sesion_completa);
      setNombreSistema(datos.nombre_sistema?.trim() || "QUORUM");
    } catch {
      // Si falla (401), no hay sesión activa — el usuario es null
      setUsuario(null);
      setTotpSesionCompleta(false);
      setNombreSistema("QUORUM");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    // En login/recuperar/reset no hay sesión que recuperar; evita GET /api/auth/me
    // que compite con el login en php artisan serve (un solo hilo).
    if (esRutaAuthInvitado()) {
      setCargando(false);
      return;
    }
    recargarUsuario();
  }, [recargarUsuario]);

  // Cierra la sesión en el backend y limpia el estado local
  const logout = useCallback(async () => {
    try {
      await logoutServicio();
    } finally {
      setUsuario(null);
      setTotpSesionCompleta(false);
      setNombreSistema("QUORUM");
    }
  }, []);

  const valor: AuthContextType = {
    usuario,
    totpSesionCompleta,
    nombreSistema,
    cargando,
    isAuthenticated: usuario !== null,
    setUsuario,
    setTotpSesionCompleta,
    setNombreSistema,
    logout,
    recargarUsuario,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
