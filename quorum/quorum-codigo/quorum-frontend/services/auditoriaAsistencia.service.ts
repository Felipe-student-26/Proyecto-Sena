// API auditoría de correcciones de asistencia — solo admin

import api from "./api";

export interface FilaAuditoriaAsistencia {
  id: number;
  creado_en: string;
  registro_asistencia_id: number;
  ficha_id: number | null;
  numero_ficha: string | null;
  fecha_sesion: string | null;
  aprendiz_nombre: string;
  aprendiz_documento: string | null;
  tipo_anterior: string | null;
  tipo_nuevo: string;
  horas_inasistencia_ant: number | null;
  horas_inasistencia_new: number | null;
  modificado_por_nombre: string;
  modificado_por_rol: string | null;
  razon: string | null;
}

export interface PaginacionAuditoria {
  data: FilaAuditoriaAsistencia[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface FiltrosAuditoriaAsistencia {
  page?: number;
  per_page?: number;
  desde?: string;
  hasta?: string;
  ficha_id?: number;
  modificado_por?: number;
}

export async function getAuditoriaAsistencia(
  filtros: FiltrosAuditoriaAsistencia = {}
): Promise<PaginacionAuditoria> {
  const params: Record<string, string | number> = {};
  if (filtros.page != null) params.page = filtros.page;
  if (filtros.per_page != null) params.per_page = filtros.per_page;
  if (filtros.desde) params.desde = filtros.desde;
  if (filtros.hasta) params.hasta = filtros.hasta;
  if (filtros.ficha_id != null) params.ficha_id = filtros.ficha_id;
  if (filtros.modificado_por != null) params.modificado_por = filtros.modificado_por;

  const r = await api.get<PaginacionAuditoria>("/api/admin/auditoria-asistencia", { params });
  return r.data;
}
