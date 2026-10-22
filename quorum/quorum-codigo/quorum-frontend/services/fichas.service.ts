// API de fichas de caracterización (Módulo 5)

import api from "./api";
import type {
  FichaDetalle,
  PaginacionFichas,
  PayloadCrearFicha,
  ResumenImportacion,
} from "../types/ficha";

export interface FiltrosFichas {
  busqueda?: string;
  centro_id?: number;
  programa_id?: number;
  activo?: 0 | 1;
  page?: number;
  per_page?: number;
}

export async function getFichas(filtros: FiltrosFichas = {}): Promise<PaginacionFichas> {
  const r = await api.get<PaginacionFichas>("/api/fichas", { params: filtros });
  return r.data;
}

export async function getFicha(id: number): Promise<FichaDetalle> {
  const r = await api.get<{ data: FichaDetalle }>(`/api/fichas/${id}`);
  return r.data.data;
}

export async function crearFicha(
  payload: PayloadCrearFicha
): Promise<{ message: string; id: number }> {
  const r = await api.post<{ message: string; id: number }>("/api/fichas", payload);
  return r.data;
}

export async function actualizarFicha(
  id: number,
  payload: PayloadCrearFicha
): Promise<{ message: string; advertencias?: string[] }> {
  const r = await api.put<{ message: string; advertencias?: string[] }>(
    `/api/fichas/${id}`,
    payload
  );
  return r.data;
}

export async function desactivarFicha(id: number): Promise<{ message: string }> {
  const r = await api.delete<{ message: string }>(`/api/fichas/${id}`);
  return r.data;
}

export async function reactivarFicha(
  id: number
): Promise<{ message: string; data: unknown }> {
  const r = await api.post<{ message: string; data: unknown }>(
    `/api/fichas/${id}/reactivar`
  );
  return r.data;
}

export interface PayloadAprendizManual {
  nombre: string;
  apellido: string;
  documento: string;
  correo: string;
}

export async function crearAprendizFicha(
  fichaId: number,
  body: PayloadAprendizManual
): Promise<{ message: string; data: unknown }> {
  const r = await api.post<{ message: string; data: unknown }>(
    `/api/fichas/${fichaId}/aprendices`,
    body
  );
  return r.data;
}

export async function actualizarAprendizFicha(
  fichaId: number,
  aprendizId: number,
  body: PayloadAprendizManual
): Promise<{ message: string; data: unknown }> {
  const r = await api.put<{ message: string; data: unknown }>(
    `/api/fichas/${fichaId}/aprendices/${aprendizId}`,
    body
  );
  return r.data;
}

export async function eliminarAprendizFicha(
  fichaId: number,
  aprendizId: number
): Promise<{ message: string }> {
  const r = await api.delete<{ message: string }>(
    `/api/fichas/${fichaId}/aprendices/${aprendizId}`
  );
  return r.data;
}

export async function asignarInstructorFicha(
  fichaId: number,
  body: {
    usuario_id: number;
    accion: "asignar" | "desasignar" | "toggle_gestor";
    es_gestor?: boolean;
  }
): Promise<{ message: string }> {
  const r = await api.post<{ message: string }>(
    `/api/fichas/${fichaId}/instructores`,
    body
  );
  return r.data;
}

export async function importarAprendicesExcel(
  fichaId: number,
  archivo: File,
  onProgress?: (porcentaje: number) => void
): Promise<ResumenImportacion> {
  const formData = new FormData();
  formData.append("archivo", archivo);

  const r = await api.post<ResumenImportacion>(
    `/api/fichas/${fichaId}/importar-aprendices`,
    formData,
    {
      onUploadProgress: (ev) => {
        if (ev.total && onProgress) {
          onProgress(Math.round((ev.loaded * 100) / ev.total));
        }
      },
    }
  );
  return r.data;
}
