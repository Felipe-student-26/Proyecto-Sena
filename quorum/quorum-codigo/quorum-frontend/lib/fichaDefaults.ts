import type { DiaSemana, TipoJornada } from "../types/ficha";

/**
 * Retorna las horas predeterminadas para una fila de horario
 * según la jornada y el día. El sábado siempre tiene prioridad.
 */
export function horasPredeterminadas(
  tipo: TipoJornada,
  dia: DiaSemana
): { hora_inicio: string; hora_fin: string } {
  if (dia === "sabado")  return { hora_inicio: "08:00", hora_fin: "12:00" };
  if (tipo === "mañana") return { hora_inicio: "07:00", hora_fin: "13:00" };
  if (tipo === "tarde")  return { hora_inicio: "13:00", hora_fin: "19:00" };
  if (tipo === "noche")  return { hora_inicio: "18:00", hora_fin: "22:00" };
  return { hora_inicio: "08:00", hora_fin: "12:00" }; // fin_de_semana
}
