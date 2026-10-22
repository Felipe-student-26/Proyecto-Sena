// API días festivos — Módulo 12 (admin)

import api from "./api";
import type { DiaFestivo } from "../types/configuracion";

async function obtenerCsrf(): Promise<void> {
  await api.get("/sanctum/csrf-cookie");
}

export async function getDiasFestivos(anio?: number): Promise<{
  data: DiaFestivo[];
  anio: number;
}> {
  const params = anio != null ? { anio } : {};
  const r = await api.get<{ data: DiaFestivo[]; anio: number }>(
    "/api/dias-festivos",
    { params }
  );
  return r.data;
}

export async function crearDiaFestivo(
  fecha: string,
  descripcion: string
): Promise<DiaFestivo> {
  await obtenerCsrf();
  const r = await api.post<{ data: DiaFestivo }>("/api/dias-festivos", {
    fecha,
    descripcion,
  });
  return r.data.data;
}

export async function desactivarDiaFestivo(id: number): Promise<void> {
  await obtenerCsrf();
  await api.delete(`/api/dias-festivos/${id}`);
}
