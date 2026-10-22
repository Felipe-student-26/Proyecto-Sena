<?php

namespace App\Services;

use App\Models\FichaCaracterizacion;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;

// Estadísticas y búsqueda para el panel del coordinador (Módulo 10)
class CoordinadorService
{
    /**
     * Busca aprendices activos por nombre, apellido o documento.
     *
     * @return list<array{id:int,nombre:string,apellido:string,documento:string,ficha_id:int|null}>
     */
    public function buscarAprendices(string $termino, int $limite = 20): array
    {
        $t = trim($termino);
        if (mb_strlen($t) < 2) {
            return [];
        }

        $like = '%'.$t.'%';

        return Usuario::query()
            ->where('activo', 1)
            ->where('rol', 'aprendiz')
            ->where(function ($q) use ($like): void {
                $q->where('nombre', 'like', $like)
                    ->orWhere('apellido', 'like', $like)
                    ->orWhere('documento', 'like', $like);
            })
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->limit($limite)
            ->get(['id', 'nombre', 'apellido', 'documento', 'ficha_id'])
            ->map(fn (Usuario $u) => [
                'id'         => (int) $u->id,
                'nombre'     => (string) $u->nombre,
                'apellido'   => (string) $u->apellido,
                'documento'  => (string) $u->documento,
                'ficha_id'   => $u->ficha_id !== null ? (int) $u->ficha_id : null,
            ])
            ->values()
            ->all();
    }

    /**
     * Por ficha activa: aprendices, sesiones registradas y % asistencia por horas (misma idea que M9).
     * Sesiones tomadas = todas las filas en sesiones de esa ficha.
     *
     * @return list<array{ficha_id:int,numero_ficha:string,centro_nombre:string,total_aprendices:int,sesiones_tomadas:int,porcentaje_asistencia:float|null}>
     */
    public function estadisticasPorFicha(?int $centroId = null): array
    {
        $qFichas = FichaCaracterizacion::query()
            ->where('activo', 1)
            ->with('centro:id,nombre')
            ->when($centroId !== null, fn ($q) => $q->where('centro_formacion_id', $centroId))
            ->orderBy('numero_ficha');

        $fichas = $qFichas->get(['id', 'numero_ficha', 'centro_formacion_id']);

        if ($fichas->isEmpty()) {
            return [];
        }

        $ids = $fichas->pluck('id')->all();

        $aggHoras = DB::table('registros_asistencia as r')
            ->join('sesiones as s', 's.id', '=', 'r.sesion_id')
            ->where('r.activo', 1)
            ->whereIn('s.ficha_id', $ids)
            ->groupBy('s.ficha_id')
            ->selectRaw('s.ficha_id as ficha_id')
            ->selectRaw('SUM(s.horas_programadas) as total_horas_programadas')
            ->selectRaw(
                "SUM(CASE WHEN r.tipo = 'falla' THEN s.horas_programadas "
                ."WHEN r.tipo = 'parcial' THEN COALESCE(r.horas_inasistencia, 0) ELSE 0 END) as total_horas_inasistencia"
            )
            ->get()
            ->keyBy('ficha_id');

        $sesionesPorFicha = DB::table('sesiones')
            ->whereIn('ficha_id', $ids)
            ->groupBy('ficha_id')
            ->selectRaw('ficha_id, COUNT(*) as total')
            ->pluck('total', 'ficha_id');

        $aprendicesPorFicha = DB::table('usuarios')
            ->where('rol', 'aprendiz')
            ->where('activo', 1)
            ->whereIn('ficha_id', $ids)
            ->groupBy('ficha_id')
            ->selectRaw('ficha_id, COUNT(*) as total')
            ->pluck('total', 'ficha_id');

        $filas = [];
        foreach ($fichas as $f) {
            $fid = (int) $f->id;
            $agg = $aggHoras->get($fid);

            $hp = $agg ? (int) $agg->total_horas_programadas : 0;
            $hi = $agg ? (int) $agg->total_horas_inasistencia : 0;

            $porcentaje = null;
            if ($hp > 0) {
                $porcentaje = round(100 * ($hp - $hi) / $hp, 1);
            }

            $centroNombre = $f->centro?->nombre ?? '—';

            $filas[] = [
                'ficha_id'               => $fid,
                'numero_ficha'           => (string) $f->numero_ficha,
                'centro_nombre'          => (string) $centroNombre,
                'total_aprendices'       => (int) ($aprendicesPorFicha[$fid] ?? 0),
                'sesiones_tomadas'       => (int) ($sesionesPorFicha[$fid] ?? 0),
                'porcentaje_asistencia'  => $porcentaje,
            ];
        }

        // Peor asistencia primero; sin datos al final
        usort($filas, function (array $a, array $b): int {
            $pa = $a['porcentaje_asistencia'];
            $pb = $b['porcentaje_asistencia'];
            if ($pa === null && $pb === null) {
                return $a['ficha_id'] <=> $b['ficha_id'];
            }
            if ($pa === null) {
                return 1;
            }
            if ($pb === null) {
                return -1;
            }
            if ($pa === $pb) {
                return $a['ficha_id'] <=> $b['ficha_id'];
            }

            return $pa <=> $pb;
        });

        return $filas;
    }
}
