// Tipos del módulo tomar asistencia (M7)

export type TipoAsistencia = "presente" | "falla" | "excusa" | "parcial";

export interface AprendizAsistencia {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  avatar_color: string | null;
}

export interface SesionAsistencia {
  id: number;
  ficha_id: number;
  horario_id: number;
  fecha: string;
  instructor_id: number;
  horas_programadas: number;
  estado: "abierta" | "cerrada";
}

export interface IniciarSesionRespuesta {
  sesion: SesionAsistencia;
  aprendices: AprendizAsistencia[];
  fecha_servidor: string;
}

export interface HorarioCandidato {
  id: number;
  etiqueta: string;
}

export interface MarcaAprendiz {
  tipo: TipoAsistencia | null;
  horas_inasistencia: number | null;
  /** Obligatorio si tipo es excusa (texto del motivo). */
  excusa_motivo?: string | null;
  /** Archivo opcional solo para excusa; no se serializa al API como JSON suelto. */
  excusa_archivo?: File | null;
}

// Historial / matriz (Módulo 8)

export interface SesionHistorialColumna {
  id: number;
  fecha: string;
  estado: "abierta" | "cerrada";
  horas_programadas: number;
  instructor_id: number;
  instructor_nombre_completo: string;
  instructor_nombre_corto: string;
}

export interface RegistroHistorialCelda {
  id: number;
  sesion_id: number;
  aprendiz_id: number;
  tipo: TipoAsistencia;
  horas_inasistencia: number | null;
  excusa_motivo?: string | null;
  excusa_tiene_evidencia?: boolean;
  excusa_evidencia_nombre_original?: string | null;
}

export interface HistorialMatrizRespuesta {
  aprendices: AprendizAsistencia[];
  sesiones: SesionHistorialColumna[];
  registros: RegistroHistorialCelda[];
}

// Panel de gestión de evidencias de excusas

export interface EvidenciaExcusaItem {
  id: number;
  excusa_motivo: string | null;
  excusa_evidencia_nombre_original: string | null;
  aprendiz: {
    id: number;
    nombre: string;
    apellido: string;
    documento: string;
  };
  sesion: {
    id: number;
    fecha: string;
  };
  ficha: {
    id: number;
    numero_ficha: string;
    nombre_programa: string | null;
  };
}

export interface ListadoEvidenciasRespuesta {
  data: EvidenciaExcusaItem[];
}
