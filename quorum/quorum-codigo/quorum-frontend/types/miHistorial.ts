// Respuesta de GET /api/mi-historial (Módulo 9)

export type TipoHistorialAprendiz =
  | "presente"
  | "falla"
  | "excusa"
  | "parcial";

export interface MiHistorialFicha {
  id: number | null;
  numero_ficha: string | null;
  nombre_programa: string | null;
}

export interface MiHistorialRegistro {
  id: number;
  fecha: string | null;
  ficha: MiHistorialFicha;
  instructor_nombre: string;
  tipo: TipoHistorialAprendiz;
  horas_inasistencia: number | null;
  horas_programadas: number | null;
  excusa_motivo?: string | null;
  excusa_tiene_evidencia?: boolean;
}

export interface MiHistorialTotales {
  total_horas_programadas: number;
  total_horas_inasistencia: number;
  porcentaje_asistencia: number | null;
  total_sesiones: number;
}

export interface MiHistorialRespuesta {
  totales: MiHistorialTotales;
  registros: MiHistorialRegistro[];
}
