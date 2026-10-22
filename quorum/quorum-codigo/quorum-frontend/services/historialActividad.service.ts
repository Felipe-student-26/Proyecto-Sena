// API historial de actividad — Módulo 12 (admin)

import api from "./api";
import type { HistorialActividadFila } from "../types/configuracion";

export async function getHistorialActividad(): Promise<HistorialActividadFila[]> {
  const r = await api.get<{ data: HistorialActividadFila[] }>(
    "/api/historial-actividad"
  );
  return r.data.data;
}
