"use client";

// Sidebar — rail oscuro (bg-sidebar); toggle solo desde Headbar (Headbar arriba, sidebar debajo)

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Building2,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FileText,
  FolderOpen,
  History,
  LayoutDashboard,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Avatar from "./Avatar";
import Badge from "./Badge";
import type { RolUsuario } from "../../types/usuario";

interface ItemMenu {
  etiqueta: string;
  ruta: string;
  Icono: React.ElementType;
}

const MENU_POR_ROL: Record<RolUsuario, ItemMenu[]> = {
  admin: [
    { etiqueta: "Dashboard", ruta: "/dashboard", Icono: LayoutDashboard },
    { etiqueta: "Usuarios", ruta: "/usuarios", Icono: Users },
    { etiqueta: "Fichas", ruta: "/fichas", Icono: FolderOpen },
    { etiqueta: "Centros de formación", ruta: "/admin/centros", Icono: Building2 },
    { etiqueta: "Programas de formación", ruta: "/admin/programas", Icono: BookOpenCheck },
    { etiqueta: "Historial de asistencia", ruta: "/asistencia/historial", Icono: History },
    { etiqueta: "Auditoría de asistencia", ruta: "/asistencia/auditoria", Icono: ClipboardList },
    { etiqueta: "Vista coordinador", ruta: "/coordinador", Icono: BarChart3 },
    { etiqueta: "Configuración", ruta: "/configuracion", Icono: Settings },
  ],
  coordinador: [
    { etiqueta: "Dashboard", ruta: "/dashboard", Icono: LayoutDashboard },
    { etiqueta: "Vista coordinador", ruta: "/coordinador", Icono: BarChart3 },
    { etiqueta: "Historial de asistencia", ruta: "/asistencia/historial", Icono: History },
    { etiqueta: "Evidencias de excusas", ruta: "/evidencias", Icono: FileText },
  ],
  instructor: [
    { etiqueta: "Dashboard", ruta: "/dashboard", Icono: LayoutDashboard },
    { etiqueta: "Tomar asistencia", ruta: "/asistencia/tomar", Icono: ClipboardCheck },
    { etiqueta: "Mi calendario", ruta: "/asistencia/calendario", Icono: CalendarDays },
    { etiqueta: "Historial", ruta: "/asistencia/historial", Icono: History },
    { etiqueta: "Evidencias de excusas", ruta: "/evidencias", Icono: FileText },
  ],
  gestor_grupo: [
    { etiqueta: "Dashboard", ruta: "/dashboard", Icono: LayoutDashboard },
    { etiqueta: "Tomar asistencia", ruta: "/asistencia/tomar", Icono: ClipboardCheck },
    { etiqueta: "Mi calendario", ruta: "/asistencia/calendario", Icono: CalendarDays },
    { etiqueta: "Historial", ruta: "/asistencia/historial", Icono: History },
    { etiqueta: "Evidencias de excusas", ruta: "/evidencias", Icono: FileText },
  ],
  aprendiz: [
    { etiqueta: "Mi historial", ruta: "/mi-historial", Icono: BookOpen },
    { etiqueta: "Mi perfil", ruta: "/perfil", Icono: UserCircle },
  ],
};

interface SidebarProps {
  expandido: boolean;
  onColapsarOverlay: () => void;
}

const railSurface = "bg-gradient-to-b from-slate-950 via-[#0F172A] to-slate-900 text-white";

function linkClasesCompacto(esActivo: boolean) {
  const base =
    "flex min-h-[44px] w-full max-w-[44px] items-center justify-center rounded-lg text-sm font-medium transition-all duration-150";
  const estado = esActivo
    ? "bg-emerald-500/15 text-emerald-300"
    : "text-white/60 hover:bg-white/[0.05] hover:text-white";
  return `${base} ${estado}`;
}

function linkClasesExpandido(esActivo: boolean) {
  const base =
    "flex min-h-[40px] items-center gap-3 text-sm font-medium transition-all duration-150";
  const estado = esActivo
    ? "rounded-r-lg border-l-2 border-emerald-500 bg-white/[0.07] pl-[10px] pr-3 py-2.5 text-white"
    : "rounded-lg px-3 py-2.5 text-white/60 hover:bg-white/[0.05] hover:text-white";
  return `${base} ${estado}`;
}

export default function Sidebar({
  expandido,
  onColapsarOverlay,
}: SidebarProps) {
  const { usuario } = useAuth();
  const pathname = usePathname();

  if (!usuario) return null;

  const items = MENU_POR_ROL[usuario.rol] ?? [];

  function esActivo(ruta: string) {
    return ruta === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(ruta);
  }

  const navMini = (
    <nav className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-1.5 pb-2 pt-3">
      <ul className="flex flex-col gap-0.5">
        {items.map(({ etiqueta, ruta, Icono }) => {
          const activo = esActivo(ruta);
          return (
            <li key={ruta} className="flex justify-center">
              <Link
                href={ruta}
                className={linkClasesCompacto(activo)}
                aria-current={activo ? "page" : undefined}
                title={etiqueta}
              >
                <Icono size={20} className="shrink-0" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const navFull = (onNavigate?: () => void) => (
    <nav className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-2 pb-4 pt-3">
      <ul className="space-y-0.5">
        {items.map(({ etiqueta, ruta, Icono }) => {
          const activo = esActivo(ruta);
          return (
            <li key={ruta}>
              <Link
                href={ruta}
                onClick={onNavigate}
                className={linkClasesExpandido(activo)}
                aria-current={activo ? "page" : undefined}
              >
                <Icono size={18} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{etiqueta}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const perfilMini = (
    <div className="shrink-0 border-t border-white/[0.06] px-2 py-3">
      <Link
        href="/perfil"
        className="flex justify-center rounded-lg p-2 transition-colors hover:bg-white/[0.05]"
        title="Ver perfil"
      >
        <Avatar
          nombre={`${usuario.nombre} ${usuario.apellido}`}
          id={usuario.id}
          size="sm"
        />
      </Link>
    </div>
  );

  const perfilFull = (onNavigate?: () => void) => (
    <div className="shrink-0 border-t border-white/[0.06] px-3 py-3">
      <Link
        href="/perfil"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/[0.05]"
        title="Ver perfil"
      >
        <Avatar
          nombre={`${usuario.nombre} ${usuario.apellido}`}
          id={usuario.id}
          size="sm"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {usuario.nombre} {usuario.apellido}
          </p>
          <Badge rol={usuario.rol} size="sm" />
        </div>
      </Link>
    </div>
  );

  const asideClass = `flex h-full flex-col overflow-hidden border-r border-white/[0.06] ${railSurface}`;

  return (
    <div className="relative z-0 flex h-full shrink-0">
      <aside
        className={`${asideClass} w-[72px] lg:hidden`}
        aria-label="Menú de navegación compacto"
      >
        {navMini}
        {perfilMini}
      </aside>

      {expandido && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={onColapsarOverlay}
            aria-hidden="true"
          />
          <aside
            className={`fixed left-0 top-16 z-[45] flex h-[calc(100vh-4rem)] w-[min(280px,85vw)] max-w-[280px] flex-col shadow-xl lg:hidden ${asideClass}`}
            aria-label="Menú de navegación"
          >
            {navFull(onColapsarOverlay)}
            {perfilFull(onColapsarOverlay)}
          </aside>
        </>
      )}

      <aside
        className={`relative hidden h-full shrink-0 flex-col overflow-hidden border-r border-white/[0.06] transition-[width] duration-300 ease-out lg:flex ${railSurface} ${
          expandido ? "w-[260px]" : "w-[72px]"
        }`}
        aria-label="Menú de navegación"
      >
        {expandido ? (
          <>
            {navFull()}
            {perfilFull()}
          </>
        ) : (
          <>
            {navMini}
            {perfilMini}
          </>
        )}
      </aside>
    </div>
  );
}
