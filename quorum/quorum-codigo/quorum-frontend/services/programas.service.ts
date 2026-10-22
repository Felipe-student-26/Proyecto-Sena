// Servicio CRUD de programas de formación (solo admin)

import api from "./api";
import type { TipoPrograma } from "../types/ficha";

export interface ProgramaAdmin {
  id: number;
  nombre: string;
  codigo: string | null;
  tipo: TipoPrograma | null;
  activo: number;
}

export interface PayloadPrograma {
  nombre: string;
  codigo?: string | null;
  tipo?: TipoPrograma | null;
}

export async function getProgramasAdmin(activo?: 0 | 1): Promise<ProgramaAdmin[]> {
  const params = activo !== undefined ? { activo } : {};
  const r = await api.get<{ data: ProgramaAdmin[] }>("/api/admin/programas-formacion", { params });
  return r.data.data;
}

export async function crearPrograma(payload: PayloadPrograma): Promise<{ message: string; data: ProgramaAdmin }> {
  const r = await api.post<{ message: string; data: ProgramaAdmin }>("/api/admin/programas-formacion", payload);
  return r.data;
}

export async function actualizarPrograma(id: number, payload: PayloadPrograma): Promise<{ message: string; data: ProgramaAdmin }> {
  const r = await api.put<{ message: string; data: ProgramaAdmin }>(`/api/admin/programas-formacion/${id}`, payload);
  return r.data;
}

export async function desactivarPrograma(id: number): Promise<{ message: string }> {
  const r = await api.delete<{ message: string }>(`/api/admin/programas-formacion/${id}`);
  return r.data;
}

export async function reactivarPrograma(id: number): Promise<{ message: string; data: ProgramaAdmin }> {
  const r = await api.post<{ message: string; data: ProgramaAdmin }>(`/api/admin/programas-formacion/${id}/reactivar`);
  return r.data;
}
