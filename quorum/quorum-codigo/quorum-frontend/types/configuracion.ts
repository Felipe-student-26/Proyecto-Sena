// Tipos — configuración, festivos e historial (Módulo 12)

export interface ConfiguracionFila {
  id?: number;
  clave: string;
  valor: string | null;
  descripcion: string | null;
}

export interface DiaFestivo {
  id: number;
  fecha: string;
  descripcion: string;
  activo: number;
}

export interface HistorialActividadFila {
  id: number;
  usuario_nombre: string;
  accion: string;
  descripcion: string;
  creado_en: string;
}
