// Tipos del módulo calendario de clases (M14)

export type EstadoSesionCalendario = "abierta" | "cerrada";

export interface EventoCalendario {
  fecha: string;          // YYYY-MM-DD
  horario_id: number;
  ficha_id: number;
  numero_ficha: string;
  jornada_tipo: string;   // mañana | tarde | noche | fin_de_semana
  hora_inicio: string;    // HH:mm
  hora_fin: string;       // HH:mm
  horas_programadas: number;
  sesion_id: number | null;
  sesion_estado: EstadoSesionCalendario | null;
}
