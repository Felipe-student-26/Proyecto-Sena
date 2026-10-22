// API de usuarios — Módulo 6 (solo admin)

import api from "./api";
import type {
  PaginacionUsuarios,
  PayloadActualizarUsuario,
  PayloadCrearUsuario,
  UsuarioListado,
} from "../types/usuario";

export interface FiltrosUsuarios {
  busqueda?: string;
  rol?: RolUsuarioFiltro;
  activo?: 0 | 1;
  page?: number;
  per_page?: number;
}

/** Vacío = todos los roles */
export type RolUsuarioFiltro =
  | ""
  | "admin"
  | "coordinador"
  | "instructor"
  | "gestor_grupo"
  | "aprendiz";

export async function getUsuarios(
  filtros: FiltrosUsuarios = {}
): Promise<PaginacionUsuarios> {
  const params: Record<string, string | number> = {};
  if (filtros.page != null) params.page = filtros.page;
  if (filtros.per_page != null) params.per_page = filtros.per_page;
  if (filtros.busqueda?.trim()) params.busqueda = filtros.busqueda.trim();
  if (filtros.rol) params.rol = filtros.rol;
  if (filtros.activo !== undefined) params.activo = filtros.activo;

  const r = await api.get<PaginacionUsuarios>("/api/usuarios", { params });
  return r.data;
}

export async function crearUsuario(
  payload: PayloadCrearUsuario
): Promise<{ message: string; data: UsuarioListado }> {
  const r = await api.post<{ message: string; data: UsuarioListado }>(
    "/api/usuarios",
    payload
  );
  return r.data;
}

export async function actualizarUsuario(
  id: number,
  payload: PayloadActualizarUsuario
): Promise<{ message: string; data: UsuarioListado }> {
  const body: Record<string, unknown> = {
    nombre: payload.nombre,
    apellido: payload.apellido,
    documento: payload.documento,
    correo: payload.correo,
    rol: payload.rol,
    ficha_id: payload.ficha_id ?? null,
  };
  if (payload.password && payload.password.length > 0) {
    body.password = payload.password;
  }
  const r = await api.put<{ message: string; data: UsuarioListado }>(
    `/api/usuarios/${id}`,
    body
  );
  return r.data;
}

export async function eliminarUsuario(id: number): Promise<{ message: string }> {
  const r = await api.delete<{ message: string }>(`/api/usuarios/${id}`);
  return r.data;
}

export async function reactivarUsuario(
  id: number
): Promise<{ message: string; data: UsuarioListado }> {
  const r = await api.post<{ message: string; data: UsuarioListado }>(
    `/api/usuarios/${id}/reactivar`
  );
  return r.data;
}
