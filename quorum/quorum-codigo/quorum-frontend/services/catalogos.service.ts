// Servicio de catálogos del sistema SENA: centros, programas, instructores, macrorregiones y regionales

import api from "./api";
import type {
  CatalogoItem,
  InstructorDisponible,
  Macrorregion,
  ProgramaCatalogoItem,
  Regional,
} from "../types/ficha";

// ── Catálogos de fichas ─────────────────────────────────────────────────────

export async function getCentrosFormacion(): Promise<CatalogoItem[]> {
  const r = await api.get<{ data: CatalogoItem[] }>("/api/centros-formacion");
  return r.data.data;
}

export async function getProgramasFormacion(tipo?: string): Promise<ProgramaCatalogoItem[]> {
  const params = tipo ? { tipo } : {};
  const r = await api.get<{ data: ProgramaCatalogoItem[] }>("/api/programas-formacion", { params });
  return r.data.data;
}

export async function getInstructoresDisponibles(): Promise<InstructorDisponible[]> {
  const r = await api.get<{ data: InstructorDisponible[] }>("/api/instructores-disponibles");
  return r.data.data;
}

// ── Catálogos geográficos ────────────────────────────────────────────────────

export async function getMacrorregiones(): Promise<Macrorregion[]> {
  const r = await api.get<{ data: Macrorregion[] }>("/api/macrorregiones");
  return r.data.data;
}

export async function getRegionales(macrorregionId?: number): Promise<Regional[]> {
  const params = macrorregionId ? { macrorregion_id: macrorregionId } : {};
  const r = await api.get<{ data: Regional[] }>("/api/regionales", { params });
  return r.data.data;
}
