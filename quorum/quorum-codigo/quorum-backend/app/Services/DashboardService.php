<?php

namespace App\Services;

use App\Models\FichaCaracterizacion;
use App\Models\FichaInstructor;
use App\Models\HistorialActividad;
use App\Models\Sesion;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

// Agregaciones del dashboard por rol — reglas alineadas con contexto.md / plan M4
class DashboardService
{
    // Límites del mes actual en zona de la app (America/Bogota)
    private function rangoMesActual(): array
    {
        $inicio = Carbon::now()->startOfMonth()->toDateString();
        $fin    = Carbon::now()->endOfMonth()->toDateString();

        return [$inicio, $fin];
    }

    /**
     * Dashboard para administrador.
     */
    public function paraAdmin(): array
    {
        $usuariosActivos = Usuario::where('activo', 1)->count();
        $fichasActivas   = FichaCaracterizacion::where('activo', 1)->count();
        $aprendices      = Usuario::where('activo', 1)->where('rol', 'aprendiz')->count();
        // Sesiones con fecha = hoy (cualquier estado)
        $sesionesHoy = Sesion::whereDate('fecha', Carbon::today())->count();

        $actividad = HistorialActividad::query()
            ->with('usuario')
            ->orderByDesc('creado_en')
            ->limit(5)
            ->get()
            ->map(function (HistorialActividad $fila) {
                $nombreUsuario = 'Sistema';
                if ($fila->usuario) {
                    $nombreUsuario = trim($fila->usuario->nombre.' '.$fila->usuario->apellido);
                }

                return [
                    'creado_en'       => $fila->creado_en,
                    'accion'          => $fila->accion,
                    'descripcion'     => $fila->descripcion,
                    'usuario_nombre'  => $nombreUsuario,
                ];
            })
            ->values()
            ->all();

        return [
            'rol'     => 'admin',
            'resumen' => [
                'usuarios_activos' => $usuariosActivos,
                'fichas_activas'   => $fichasActivas,
                'aprendices'       => $aprendices,
                'sesiones_hoy'     => $sesionesHoy,
            ],
            'actividad_reciente' => $actividad,
        ];
    }

    /**
     * Dashboard para coordinador.
     * % asistencia: presente + excusa / total registros del mes (registros activos).
     */
    public function paraCoordinador(): array
    {
        [$inicio, $fin] = $this->rangoMesActual();

        $totalAprendices = Usuario::where('activo', 1)->where('rol', 'aprendiz')->count();

        $aggMes = DB::table('registros_asistencia as r')
            ->join('sesiones as s', 's.id', '=', 'r.sesion_id')
            ->where('r.activo', 1)
            ->whereBetween('s.fecha', [$inicio, $fin])
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(CASE WHEN r.tipo IN ('presente', 'excusa') THEN 1 ELSE 0 END) as asistieron")
            ->first();

        $promedioMes = null;
        if ($aggMes && (int) $aggMes->total > 0) {
            $promedioMes = round(100 * (int) $aggMes->asistieron / (int) $aggMes->total, 1);
        }

        // Fichas activas agrupadas por centro
        $fichasPorCentro = DB::table('fichas_caracterizacion as f')
            ->join('centros_formacion as c', 'c.id', '=', 'f.centro_formacion_id')
            ->where('f.activo', 1)
            ->groupBy('c.id', 'c.nombre')
            ->orderBy('c.nombre')
            ->select([
                'c.id as centro_id',
                'c.nombre as centro_nombre',
                DB::raw('COUNT(f.id) as cantidad_fichas'),
            ])
            ->get()
            ->map(fn ($row) => [
                'centro_id'     => (int) $row->centro_id,
                'centro_nombre' => $row->centro_nombre,
                'cantidad_fichas' => (int) $row->cantidad_fichas,
            ])
            ->all();

        // % por ficha activa en el mes
        $porFicha = DB::table('fichas_caracterizacion as f')
            ->join('centros_formacion as c', 'c.id', '=', 'f.centro_formacion_id')
            ->leftJoin('sesiones as s', function ($join) use ($inicio, $fin) {
                $join->on('s.ficha_id', '=', 'f.id')
                    ->whereBetween('s.fecha', [$inicio, $fin]);
            })
            ->leftJoin('registros_asistencia as r', function ($join) {
                $join->on('r.sesion_id', '=', 's.id')
                    ->where('r.activo', '=', 1);
            })
            ->where('f.activo', 1)
            ->groupBy('f.id', 'f.numero_ficha', 'c.nombre')
            ->orderBy('f.numero_ficha')
            ->select([
                'f.id as ficha_id',
                'f.numero_ficha',
                'c.nombre as centro_nombre',
                DB::raw('COUNT(r.id) as total_registros'),
                DB::raw("SUM(CASE WHEN r.tipo IN ('presente', 'excusa') THEN 1 ELSE 0 END) as asistieron"),
            ])
            ->get()
            ->map(function ($row) {
                $total = (int) $row->total_registros;
                $pct   = null;
                if ($total > 0) {
                    $pct = round(100 * (int) $row->asistieron / $total, 1);
                }

                return [
                    'ficha_id'      => (int) $row->ficha_id,
                    'numero_ficha'  => $row->numero_ficha,
                    'centro_nombre' => $row->centro_nombre,
                    'porcentaje'    => $pct,
                ];
            })
            ->all();

        return [
            'rol'     => 'coordinador',
            'resumen' => [
                'total_aprendices'         => $totalAprendices,
                'promedio_asistencia_mes' => $promedioMes,
            ],
            'fichas_por_centro'  => $fichasPorCentro,
            'fichas_asistencia'  => $porFicha,
        ];
    }

    /**
     * Dashboard instructor o gestor: fichas asignadas y aprendices con inasistencia >= 20 % en horas (mes actual).
     */
    public function paraInstructorOGestor(Usuario $usuario): array
    {
        [$inicio, $fin] = $this->rangoMesActual();

        $fichaIds = FichaInstructor::query()
            ->where('usuario_id', $usuario->id)
            ->activos()
            ->pluck('ficha_id')
            ->unique()
            ->values();

        $fichas = FichaCaracterizacion::query()
            ->whereIn('id', $fichaIds)
            ->where('activo', 1)
            ->orderBy('numero_ficha')
            ->get(['id', 'numero_ficha'])
            ->map(fn (FichaCaracterizacion $f) => [
                'id'           => $f->id,
                'numero_ficha' => $f->numero_ficha,
            ])
            ->values()
            ->all();

        if ($fichaIds->isEmpty()) {
            return [
                'rol'     => $usuario->rol,
                'resumen' => [
                    'total_fichas_asignadas' => 0,
                ],
                'fichas'             => [],
                'aprendices_alerta'  => [],
            ];
        }

        // Horas de inasistencia vs horas programadas por aprendiz en el mes
        $alertasQuery = DB::table('registros_asistencia as r')
            ->join('sesiones as s', 's.id', '=', 'r.sesion_id')
            ->where('r.activo', 1)
            ->whereIn('s.ficha_id', $fichaIds)
            ->whereBetween('s.fecha', [$inicio, $fin])
            ->groupBy('r.aprendiz_id')
            ->havingRaw('SUM(s.horas_programadas) > 0')
            ->havingRaw(
                '(SUM(CASE WHEN r.tipo = \'falla\' THEN s.horas_programadas WHEN r.tipo = \'parcial\' THEN COALESCE(r.horas_inasistencia, 0) ELSE 0 END) / SUM(s.horas_programadas)) >= 0.20'
            )
            ->select([
                'r.aprendiz_id',
                DB::raw('SUM(s.horas_programadas) as horas_totales'),
                DB::raw(
                    'SUM(CASE WHEN r.tipo = \'falla\' THEN s.horas_programadas WHEN r.tipo = \'parcial\' THEN COALESCE(r.horas_inasistencia, 0) ELSE 0 END) as horas_ausente'
                ),
            ]);

        $filasAlerta = $alertasQuery->get();

        $aprendicesAlerta = [];
        foreach ($filasAlerta as $row) {
            $aprendiz = Usuario::query()
                ->where('id', $row->aprendiz_id)
                ->where('rol', 'aprendiz')
                ->where('activo', 1)
                ->first();

            if (! $aprendiz || ! $aprendiz->ficha_id) {
                continue;
            }

            $horasTot   = (float) $row->horas_totales;
            $horasAus   = (float) $row->horas_ausente;
            $pctInasist = $horasTot > 0 ? round(100 * $horasAus / $horasTot, 1) : 0;

            $ficha = FichaCaracterizacion::query()->find($aprendiz->ficha_id);

            $aprendicesAlerta[] = [
                'id'                      => $aprendiz->id,
                'nombre'                  => $aprendiz->nombre,
                'apellido'                => $aprendiz->apellido,
                'ficha_id'                => $aprendiz->ficha_id,
                'numero_ficha'            => $ficha?->numero_ficha ?? '',
                'porcentaje_inasistencia' => $pctInasist,
            ];
        }

        // Ordenar por mayor % inasistencia
        usort($aprendicesAlerta, fn ($a, $b) => $b['porcentaje_inasistencia'] <=> $a['porcentaje_inasistencia']);

        return [
            'rol'     => $usuario->rol,
            'resumen' => [
                'total_fichas_asignadas' => count($fichas),
            ],
            'fichas'            => $fichas,
            'aprendices_alerta' => $aprendicesAlerta,
        ];
    }
}
