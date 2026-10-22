<?php

namespace App\Http\Controllers;

use App\Http\Requests\ListAuditoriaAsistenciaRequest;
use App\Models\RegistroAsistenciaBackup;
use Illuminate\Http\JsonResponse;

// Listado de correcciones de asistencia (tabla backup) — solo admin
class AuditoriaAsistenciaController extends Controller
{
    public function index(ListAuditoriaAsistenciaRequest $request): JsonResponse
    {
        $v = $request->validated();
        $perPage = min(100, max(5, (int) ($v['per_page'] ?? 15)));

        $q = RegistroAsistenciaBackup::query()
            ->with([
                'sesion.ficha:id,numero_ficha',
                'aprendiz:id,nombre,apellido,documento',
                'modificadoPor:id,nombre,apellido,correo,rol',
            ])
            ->orderByDesc('creado_en');

        if (! empty($v['desde'])) {
            $q->whereDate('creado_en', '>=', $v['desde']);
        }
        if (! empty($v['hasta'])) {
            $q->whereDate('creado_en', '<=', $v['hasta']);
        }
        if (! empty($v['ficha_id'])) {
            $fid = (int) $v['ficha_id'];
            $q->whereHas('sesion', fn ($s) => $s->where('ficha_id', $fid));
        }
        if (! empty($v['modificado_por'])) {
            $q->where('modificado_por', (int) $v['modificado_por']);
        }

        $pag = $q->paginate(perPage: $perPage);

        $pag->getCollection()->transform(function (RegistroAsistenciaBackup $b) {
            $ficha = $b->sesion?->ficha;
            $ap = $b->aprendiz;
            $mod = $b->modificadoPor;

            return [
                'id'                     => $b->id,
                'creado_en'              => $b->creado_en,
                'registro_asistencia_id' => $b->registro_asistencia_id,
                'ficha_id'               => $b->sesion?->ficha_id,
                'numero_ficha'           => $ficha?->numero_ficha,
                'fecha_sesion'           => $b->sesion?->fecha,
                'aprendiz_nombre'        => $ap ? trim($ap->nombre.' '.$ap->apellido) : '—',
                'aprendiz_documento'     => $ap?->documento,
                'tipo_anterior'          => $b->tipo_anterior,
                'tipo_nuevo'             => $b->tipo_nuevo,
                'horas_inasistencia_ant' => $b->horas_inasistencia_ant,
                'horas_inasistencia_new' => $b->horas_inasistencia_new,
                'modificado_por_nombre'  => $mod ? trim($mod->nombre.' '.$mod->apellido) : '—',
                'modificado_por_rol'     => $mod?->rol,
                'razon'                  => $b->razon,
            ];
        });

        return response()->json($pag);
    }
}
