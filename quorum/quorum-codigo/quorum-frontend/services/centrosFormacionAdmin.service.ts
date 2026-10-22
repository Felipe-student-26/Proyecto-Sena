// API administración centros de formación — solo admin

import api from "./api";
import type { Regional } from "../types/ficha";

export interface CentroFormacionAdmin {
  id: number;
  nombre: string;
  codigo: string | null;
  regional_id: number | null;
  regional?: Regional | null;
  activo: number;
  creado_en?: string;
  actualizado_en?: string;
}

export interface PayloadCentro {
  nombre: string;
  codigo?: string | null;
  regional_id?: number | null;
}

export async function getCentrosFormacionAdmin(activo?: 0 | 1, regionalId?: number): Promise<CentroFormacionAdmin[]> {
  const params: Record<string, unknown> = {};
  if (activo !== undefined) params.activo = activo;
  if (regionalId !== undefined) params.regional_id = regionalId;
  const r = await api.get<{ data: CentroFormacionAdmin[] }>("/api/admin/centros-formacion", { params });
  return r.data.data;
}

export async function crearCentroFormacion(payload: PayloadCentro): Promise<CentroFormacionAdmin> {
  const r = await api.post<{ data: CentroFormacionAdmin }>("/api/admin/centros-formacion", payload);
  return r.data.data;
}

export async function actualizarCentroFormacion(
  id: number,
  payload: PayloadCentro
): Promise<CentroFormacionAdmin> {
  const r = await api.put<{ data: CentroFormacionAdmin }>(
    `/api/admin/centros-formacion/${id}`,
    payload
  );
  return r.data.data;
}

export async function desactivarCentroFormacion(id: number): Promise<void> {
  await api.delete(`/api/admin/centros-formacion/${id}`);
}

export async function reactivarCentroFormacion(id: number): Promise<CentroFormacionAdmin> {
  const r = await api.post<{ data: CentroFormacionAdmin }>(
    `/api/admin/centros-formacion/${id}/reactivar`
  );
  return r.data.data;
}
