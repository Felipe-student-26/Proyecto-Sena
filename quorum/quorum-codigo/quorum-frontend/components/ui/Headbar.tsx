"use client";

// Headbar — barra superior del dashboard
// Muestra: botón hamburguesa (móvil), nombre del sistema, badge de rol, avatar, tema, accesibilidad y logout

import { useState, useRef, useEffect } from "react";
import {
  Accessibility,
  LogOut,
  Menu,
  Minus,
  Moon,
  Plus,
  Sun,
  ZoomIn,
} from "lucide-react";
import { useConfirm } from "../../lib/confirm";
import { toggleHtmlTheme } from "../../lib/toggleTheme";
import {
  aplicarAltoContrasteEnDocumento,
  aplicarEscalaEnDocumento,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  guardarAltoContraste,
  guardarEscala,
  escucharPreferenciasAccesibilidad,
  obtenerAltoContrasteGuardado,
  obtenerEscalaGuardada,
} from "../../lib/themeStorage";
import { useAuth } from "../../hooks/useAuth";
import Avatar from "./Avatar";
import Badge from "./Badge";
import { QuorumWordmark } from "../branding/QuorumMark";

interface HeadbarProps {
  sidebarExpandido: boolean;
  onToggleSidebar: () => void;
}

export default function Headbar({
  sidebarExpandido,
  onToggleSidebar,
}: HeadbarProps) {
  const { usuario, nombreSistema, logout } = useAuth();
  const confirm = useConfirm();

  const [panelAbierto, setPanelAbierto] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const [escalaTexto, setEscalaTexto] = useState(1);
  const [altoContraste, setAltoContraste] = useState(false);
  const [temaOscuro, setTemaOscuro] = useState(false);

  // Sincroniza estado UI con lo que ya aplicó el script inline (tema y escala)
  useEffect(() => {
    setTemaOscuro(document.documentElement.classList.contains("dark"));
    const guardada = obtenerEscalaGuardada();
    if (guardada != null) {
      setEscalaTexto(guardada);
      aplicarEscalaEnDocumento(guardada);
    }
    const altoContrasteGuardado = obtenerAltoContrasteGuardado();
    setAltoContraste(altoContrasteGuardado);
    aplicarAltoContrasteEnDocumento(altoContrasteGuardado);
  }, []);

  // Si el usuario cambia preferencias en /perfil, actualizamos el panel del headbar
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

  useEffect(() => {
    function handleClickFuera(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setPanelAbierto(false);
      }
    }
    if (panelAbierto) {
      document.addEventListener("mousedown", handleClickFuera);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickFuera);
    }
  }, [panelAbierto]);

  function alternarTema() {
    setTemaOscuro(toggleHtmlTheme());
  }

  function aumentarTexto() {
    const nueva = Math.min(parseFloat((escalaTexto + 0.1).toFixed(1)), FONT_SCALE_MAX);
    setEscalaTexto(nueva);
    aplicarEscalaEnDocumento(nueva);
    guardarEscala(nueva);
  }

  function reducirTexto() {
    const nueva = Math.max(parseFloat((escalaTexto - 0.1).toFixed(1)), FONT_SCALE_MIN);
    setEscalaTexto(nueva);
    aplicarEscalaEnDocumento(nueva);
    guardarEscala(nueva);
  }

  function toggleAltoContraste() {
    const nuevoEstado = !altoContraste;
    setAltoContraste(nuevoEstado);
    aplicarAltoContrasteEnDocumento(nuevoEstado);
    guardarAltoContraste(nuevoEstado);
  }

  async function handleLogout() {
    const ok = await confirm({
      title: "¿Cerrar sesión?",
      description: "Se cerrará tu sesión actual.",
      confirmText: "Sí, cerrar sesión",
      variant: "danger",
    });
    if (ok) {
      await logout();
    }
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full min-w-0 shrink-0 items-center gap-3 border-b border-borderSubtle/50 bg-surface/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-surface/60">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="rounded-lg p-2 text-foreground transition-colors hover:bg-surfaceMuted"
        aria-label={
          sidebarExpandido ? "Contraer menú lateral" : "Expandir menú lateral"
        }
        title={sidebarExpandido ? "Contraer menú" : "Expandir menú"}
      >
        <Menu size={20} />
      </button>

      <div
        className="flex min-w-0 items-center gap-2"
        title={nombreSistema || "QUORUM"}
      >
        <QuorumWordmark variant="headbar" />
        <span className="sr-only">{nombreSistema || "QUORUM"}</span>
      </div>

      <div className="flex-1 min-w-0" />

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={alternarTema}
          className="rounded-lg p-2 text-foreground transition-colors hover:bg-surfaceMuted dark:text-amber-200"
          aria-label={temaOscuro ? "Activar modo claro" : "Activar modo oscuro"}
          title={temaOscuro ? "Modo claro" : "Modo oscuro"}
        >
          {temaOscuro ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {usuario && (
          <span className="hidden sm:block">
            <Badge rol={usuario.rol} />
          </span>
        )}

        {usuario && (
          <Avatar
            nombre={`${usuario.nombre} ${usuario.apellido}`}
            id={usuario.id}
            size="sm"
          />
        )}

        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setPanelAbierto(!panelAbierto)}
            className={`rounded-lg p-2 transition-colors ${
              panelAbierto
                ? "bg-verde text-white"
                : "text-foreground hover:bg-surfaceMuted"
            }`}
            aria-label="Opciones de accesibilidad"
            aria-expanded={panelAbierto}
          >
            <Accessibility size={18} />
          </button>

          {panelAbierto && (
            <div className="absolute right-0 top-11 z-50 w-64 rounded-xl border border-borderSubtle bg-surface p-4 shadow-lg">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground">
                Accesibilidad
              </p>

              <div className="mb-4">
                <p className="mb-2 flex items-center gap-1.5 text-sm text-foreground">
                  <ZoomIn size={14} aria-hidden="true" />
                  Tamaño del texto
                </p>
                <div className="flex items-center gap-2">
                  <button
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
                    onClick={aumentarTexto}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-borderSubtle transition-colors hover:bg-surfaceMuted disabled:opacity-40"
                    aria-label="Aumentar texto"
                    disabled={escalaTexto >= FONT_SCALE_MAX}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted">
                  Máximo 200% — usa scroll horizontal en tablas anchas.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground">Alto contraste</p>
                <button
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
          )}
        </div>

        <button
          onClick={() => void handleLogout()}
          className="rounded-lg p-2 text-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
