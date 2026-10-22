// API configuración clave-valor — Módulo 12 (admin)

import api from "./api";
import type { ConfiguracionFila } from "../types/configuracion";

async function obtenerCsrf(): Promise<void> {
  await api.get("/sanctum/csrf-cookie");
}

export async function getConfiguracion(): Promise<ConfiguracionFila[]> {
  const r = await api.get<{ data: ConfiguracionFila[] }>("/api/configuracion");
  return r.data.data;
}

export async function patchConfiguracion(
  clave: string,
  valor: string | number
): Promise<ConfiguracionFila> {
  await obtenerCsrf();
  const r = await api.patch<{ data: ConfiguracionFila }>("/api/configuracion", {
    clave,
    valor,
  });
  return r.data.data;
}
