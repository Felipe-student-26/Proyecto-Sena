// Llamadas API solo para el rol aprendiz (Módulo 9)

import type { MiHistorialRespuesta } from "../types/miHistorial";
import api from "./api";

export async function obtenerMiHistorial(): Promise<MiHistorialRespuesta> {
  const { data } = await api.get<MiHistorialRespuesta>("/api/mi-historial");
  return data;
}
