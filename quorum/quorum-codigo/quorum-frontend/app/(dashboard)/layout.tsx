"use client";

// Layout del dashboard — envuelve todas las páginas protegidas
// Verifica sesión activa con Sanctum; si no existe redirige al login
// Incluye Sidebar, Headbar y el área de contenido principal

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  guardarSidebarExpandido,
  leerSidebarExpandido,
} from "../../lib/sidebarStorage";
import Sidebar from "../../components/ui/Sidebar";
import Headbar from "../../components/ui/Headbar";
import AppCreditFooter from "../../components/ui/AppCreditFooter";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { usuario, cargando, totpSesionCompleta } = useAuth();

  // Sidebar: rail (solo iconos) vs expandido; preferencia en localStorage
  const [sidebarExpandido, setSidebarExpandido] = useState(false);

  useEffect(() => {
    const guardado = leerSidebarExpandido();
    if (guardado !== null) {
      setSidebarExpandido(guardado);
    }
  }, []);

  function toggleSidebar() {
    setSidebarExpandido((prev) => {
      const next = !prev;
      guardarSidebarExpandido(next);
      return next;
    });
  }

  function colapsarSidebar() {
    setSidebarExpandido(false);
    guardarSidebarExpandido(false);
  }

  // Cuando termina de cargar y no hay usuario, redirigir al login
  // Esto cubre el caso de cookie expirada que el middleware no pudo detectar
  useEffect(() => {
    if (!cargando && !usuario) {
      router.replace("/login");
    }
  }, [cargando, usuario, router]);

  // Aprendiz: solo puede estar en Mi historial o Perfil (evita URL manual a /fichas, etc.)
  useEffect(() => {
    if (cargando || !usuario || usuario.rol !== "aprendiz") {
      return;
    }
    const enMiHistorial =
      pathname === "/mi-historial" || pathname.startsWith("/mi-historial/");
    const enPerfil =
      pathname === "/perfil" || pathname.startsWith("/perfil/");
    if (!enMiHistorial && !enPerfil) {
      router.replace("/mi-historial");
    }
  }, [cargando, usuario, pathname, router]);

  // Staff debe completar 2FA antes de usar el panel (sesión parcial tras contraseña)
  useEffect(() => {
    if (cargando || !usuario || usuario.rol === "aprendiz") {
      return;
    }
    if (totpSesionCompleta) {
      return;
    }
    if (usuario.totp_configurado) {
      router.replace("/2fa/verificar");
    } else {
      router.replace("/2fa/configurar");
    }
  }, [cargando, usuario, totpSesionCompleta, router]);

  // Mientras se verifica la sesión, mostramos un spinner de pantalla completa
  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-grisClaro dark:bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={40}
            className="animate-spin text-verde"
            aria-hidden="true"
          />
          <p className="text-sm text-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario (sesión inválida), no renderizamos nada mientras se redirige
  if (!usuario) {
    return null;
  }

  // Staff sin TOTP completado en esta sesión: esperamos redirección a /2fa/*
  if (usuario.rol !== "aprendiz" && !totpSesionCompleta) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-grisClaro dark:bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={40}
            className="animate-spin text-verde"
            aria-hidden="true"
          />
          <p className="text-sm text-muted">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    // Headbar a ancho completo; debajo, fila sidebar + contenido (estilo Gmail)
    <div className="flex h-screen min-h-0 w-full max-w-[100vw] flex-col overflow-hidden bg-grisClaro dark:bg-background">
      <Headbar
        sidebarExpandido={sidebarExpandido}
        onToggleSidebar={toggleSidebar}
      />

      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <Sidebar
          expandido={sidebarExpandido}
          onColapsarOverlay={colapsarSidebar}
        />

        {/* min-w-0: el flex no corta tablas; overflow-x-auto: scroll si el texto es muy grande */}
        <main className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      <AppCreditFooter variant="dashboard" />
    </div>
  );
}
