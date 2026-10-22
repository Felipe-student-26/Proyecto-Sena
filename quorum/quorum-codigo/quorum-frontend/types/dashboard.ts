// Respuestas del endpoint GET /api/dashboard (Módulo 4)

export interface ActividadRecienteItem {
  creado_en: string;
  accion: string;
  descripcion: string;
  usuario_nombre: string;
}

export interface DashboardAdmin {
  rol: "admin";
  resumen: {
    usuarios_activos: number;
    fichas_activas: number;
    aprendices: number;
    sesiones_hoy: number;
  };
  actividad_reciente: ActividadRecienteItem[];
}

export interface FichaPorCentro {
  centro_id: number;
  centro_nombre: string;
  cantidad_fichas: number;
}

export interface FichaAsistenciaFila {
  ficha_id: number;
  numero_ficha: string;
  centro_nombre: string;
  porcentaje: number | null;
}

export interface DashboardCoordinador {
  rol: "coordinador";
  resumen: {
    total_aprendices: number;
    promedio_asistencia_mes: number | null;
  };
  fichas_por_centro: FichaPorCentro[];
  fichas_asistencia: FichaAsistenciaFila[];
}

export interface FichaAsignadaResumen {
  id: number;
  numero_ficha: string;
}

export interface AprendizAlerta {
  id: number;
  nombre: string;
  apellido: string;
  ficha_id: number;
  numero_ficha: string;
  porcentaje_inasistencia: number;
}

export interface DashboardInstructorGestor {
  rol: "instructor" | "gestor_grupo";
  resumen: {
    total_fichas_asignadas: number;
  };
  fichas: FichaAsignadaResumen[];
  aprendices_alerta: AprendizAlerta[];
}

export type DashboardRespuesta =
  | DashboardAdmin
  | DashboardCoordinador
  | DashboardInstructorGestor;

export function esDashboardAdmin(d: DashboardRespuesta): d is DashboardAdmin {
  return d.rol === "admin";
}

export function esDashboardCoordinador(
  d: DashboardRespuesta
): d is DashboardCoordinador {
  return d.rol === "coordinador";
}

export function esDashboardInstructorGestor(
  d: DashboardRespuesta
): d is DashboardInstructorGestor {
  return d.rol === "instructor" || d.rol === "gestor_grupo";
}
