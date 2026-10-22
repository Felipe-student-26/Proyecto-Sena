<?php

namespace App\Services;

use App\Models\RegistroAsistencia;
use Illuminate\Support\Facades\DB;

// Historial de asistencia del aprendiz — solo sus registros (Módulo 9)
class AprendizService
{
    /**
     * Lista cronológica y totales para un aprendiz (por id de usuario).
     */
    public function miHistorial(int $aprendizId): array
    {
        $agg = DB::table('registros_asistencia as r')
            ->join('sesiones as s', 's.id', '=', 'r.sesion_id')
            ->where('r.aprendiz_id', $aprendizId)
            ->where('r.activo', 1)
            ->selectRaw('COUNT(*) as total_sesiones')
            ->selectRaw('COALESCE(SUM(s.horas_programadas), 0) as total_horas_programadas')
            ->selectRaw(
                "COALESCE(SUM(CASE WHEN r.tipo = 'falla' THEN s.horas_programadas "
                ."WHEN r.tipo = 'parcial' THEN COALESCE(r.horas_inasistencia, 0) ELSE 0 END), 0) as total_horas_inasistencia"
            )
            ->first();

        $totalSesiones = (int) ($agg->total_sesiones ?? 0);
        $totalHorasProgramadas = (int) ($agg->total_horas_programadas ?? 0);
        $totalHorasInasistencia = (int) ($agg->total_horas_inasistencia ?? 0);

        $porcentajeAsistencia = null;
        if ($totalHorasProgramadas > 0) {
            $horasAsistidas = $totalHorasProgramadas - $totalHorasInasistencia;
            $porcentajeAsistencia = round(100 * $horasAsistidas / $totalHorasProgramadas, 1);
        }

        $registros = RegistroAsistencia::query()
            ->activos()
            ->where('aprendiz_id', $aprendizId)
            ->with(['sesion.ficha.programa', 'sesion.instructor'])
            ->join('sesiones as s', 's.id', '=', 'registros_asistencia.sesion_id')
            ->orderByDesc('s.fecha')
            ->orderByDesc('s.id')
            ->select('registros_asistencia.*')
            ->get()
            ->map(function (RegistroAsistencia $reg) {
                $sesion = $reg->sesion;
                $ficha = $sesion?->ficha;
                $programa = $ficha?->programa;
                $instructor = $sesion?->instructor;

                $nombreInstructor = '';
                if ($instructor) {
                    $nombreInstructor = trim($instructor->nombre.' '.$instructor->apellido);
                }

                return [
                    'id' => $reg->id,
                    'fecha' => $sesion?->fecha,
                    'ficha' => [
                        'id' => $ficha?->id,
                        'numero_ficha' => $ficha?->numero_ficha,
                        'nombre_programa' => $programa?->nombre,
                    ],
                    'instructor_nombre' => $nombreInstructor,
                    'tipo' => $reg->tipo,
                    'horas_inasistencia' => $reg->tipo === 'parcial' ? $reg->horas_inasistencia : null,
                    'horas_programadas' => $sesion?->horas_programadas,
                    'excusa_motivo' => $reg->tipo === 'excusa' ? $reg->excusa_motivo : null,
                    'excusa_tiene_evidencia' => $reg->tipo === 'excusa'
                        && $reg->excusa_evidencia_path !== null && $reg->excusa_evidencia_path !== '',
                ];
            })
            ->values()
            ->all();

        return [
            'totales' => [
                'total_horas_programadas' => $totalHorasProgramadas,
                'total_horas_inasistencia' => $totalHorasInasistencia,
                'porcentaje_asistencia' => $porcentajeAsistencia,
                'total_sesiones' => $totalSesiones,
            ],
            'registros' => $registros,
        ];
    }
}
