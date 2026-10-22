// API del panel coordinador (Módulo 10)

import api from "./api";
import type { HistorialMatrizRespuesta, TipoAsistencia } from "../types/asistencia";
import type { MiHistorialRespuesta } from "../types/miHistorial";
import type { PaginacionFichas } from "../types/ficha";
import type { FiltrosFichas } from "./fichas.service";

export interface AprendizBusquedaItem {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  ficha_id: number | null;
}

export interface EstadisticaFichaFila {
  ficha_id: number;
  numero_ficha: string;
  centro_nombre: string;
  total_aprendices: number;
  sesiones_tomadas: number;
  porcentaje_asistencia: number | null;
}

export interface FiltrosHistorialCoordinadorFicha {
  desde?: string;
  hasta?: string;
  tipos?: TipoAsistencia[];
  jornada_ficha_id?: number;
}

function queryHistorialCoordinador(f: FiltrosHistorialCoordinadorFicha): string {
  const p = new URLSearchParams();
  if (f.desde) p.set("desde", f.desde);
  if (f.hasta) p.set("hasta", f.hasta);
  f.tipos?.forEach((t) => p.append("tipo[]", t));
  if (f.jornada_ficha_id != null) {
    p.set("jornada_ficha_id", String(f.jornada_ficha_id));
  }
  return p.toString();
}

/** Listado de fichas (activas por defecto en servidor) */
export async function getCoordinadorFichas(
  filtros: FiltrosFichas = {}
): Promise<PaginacionFichas> {
  const r = await api.get<PaginacionFichas>("/api/coordinador/fichas", { params: filtros });
  return r.data;
}

/** Matriz de asistencia (solo lectura en UI) */
export async function getCoordinadorHistorialFicha(
  fichaId: number,
  filtros: FiltrosHistorialCoordinadorFicha = {}
): Promise<HistorialMatrizRespuesta> {
  const qs = queryHistorialCoordinador(filtros);
  const base = `/api/coordinador/asistencia/ficha/${fichaId}`;
  const url = qs === "" ? base : `${base}?${qs}`;
  const r = await api.get<HistorialMatrizRespuesta>(url);
  return r.data;
}

export async function buscarAprendicesCoordinador(
  q: string
): Promise<AprendizBusquedaItem[]> {
  const r = await api.get<{ data: AprendizBusquedaItem[] }>(
    "/api/coordinador/aprendices/buscar",
    { params: { q } }
  );
  return r.data.data;
}

export async function getCoordinadorHistorialAprendiz(
  aprendizId: number
): Promise<MiHistorialRespuesta> {
  const r = await api.get<MiHistorialRespuesta>(
    `/api/coordinador/aprendices/${aprendizId}/historial`
  );
  return r.data;
}

export async function getCoordinadorEstadisticas(
  centroId?: number
): Promise<EstadisticaFichaFila[]> {
  const r = await api.get<{ data: EstadisticaFichaFila[] }>(
    "/api/coordinador/estadisticas",
    { params: centroId != null ? { centro_id: centroId } : {} }
  );
  return r.data.data;
}
