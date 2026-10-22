// Servicio del dashboard — datos reales según rol (Módulo 4)

import api from "./api";
import type { DashboardRespuesta } from "../types/dashboard";

export async function getDashboard(): Promise<DashboardRespuesta> {
  const respuesta = await api.get<DashboardRespuesta>("/api/dashboard");
  return respuesta.data;
}
