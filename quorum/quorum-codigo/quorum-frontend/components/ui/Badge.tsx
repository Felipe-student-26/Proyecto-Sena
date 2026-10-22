// Componente Badge — muestra el rol del usuario con estilo outlined unificado

import type { RolUsuario } from "../../types/usuario";

const ETIQUETAS_ROL: Record<RolUsuario, string> = {
  admin: "Administrador",
  coordinador: "Coordinador",
  instructor: "Instructor",
  gestor_grupo: "Gestor de Grupo",
  aprendiz: "Aprendiz",
};

// Estilo outlined: fondo semitransparente + borde + texto — coherente como familia
const ESTILOS_ROL: Record<RolUsuario, string> = {
  admin:       "bg-violet-500/10 border border-violet-400/30 text-violet-600 dark:bg-violet-500/15 dark:border-violet-400/20 dark:text-violet-300",
  coordinador: "bg-indigo-500/10 border border-indigo-400/30 text-indigo-600 dark:bg-indigo-500/15 dark:border-indigo-400/20 dark:text-indigo-300",
  instructor:  "bg-emerald-500/10 border border-emerald-400/30 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-400/20 dark:text-emerald-300",
  gestor_grupo:"bg-emerald-500/10 border border-emerald-400/30 text-emerald-600 dark:bg-emerald-500/15 dark:border-emerald-400/20 dark:text-emerald-400",
  aprendiz:    "bg-slate-500/10 border border-slate-400/30 text-slate-600 dark:bg-slate-500/15 dark:border-slate-400/20 dark:text-slate-300",
};

interface BadgeProps {
  rol: RolUsuario;
  size?: "sm" | "md";
}

export default function Badge({ rol, size = "md" }: BadgeProps) {
  const etiqueta = ETIQUETAS_ROL[rol];
  const estilos = ESTILOS_ROL[rol];
  const clasesTamano = size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-0.5";

  return (
    <span className={`${clasesTamano} ${estilos} rounded-full font-medium inline-block shrink-0`}>
      {etiqueta}
    </span>
  );
}
