// API del calendario de clases del instructor (M14)

import api from "./api";
import type { EventoCalendario } from "../types/calendario";

/**
 * Obtiene los eventos del instructor autenticado en el rango [desde, hasta].
 * El backend proyecta los horarios semanales en fechas reales y fusiona las sesiones existentes.
 */
export async function getEventosCalendario(
  desde: string,
  hasta: string
): Promise<EventoCalendario[]> {
  const r = await api.get<EventoCalendario[]>("/api/calendario", {
    params: { desde, hasta },
  });
  return r.data;
}
