<?php

namespace App\Http\Controllers;

use App\Models\Horario;
use App\Models\Sesion;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

// Calendario de clases del instructor — proyecta horarios semanales sobre fechas reales (Módulo 14)
class CalendarioController extends Controller
{
    private const SLUG_POR_ISO = [
        1 => 'lunes',
        2 => 'martes',
        3 => 'miercoles',
        4 => 'jueves',
        5 => 'viernes',
        6 => 'sabado',
    ];

    /**
     * Devuelve todos los eventos del instructor (horarios proyectados + sesiones existentes)
     * en el rango [desde, hasta]. Solo accesible para instructor y gestor_grupo.
     */
    public function misEventos(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if (! in_array($usuario->rol, ['instructor', 'gestor_grupo'], true)) {
            return response()->json(['message' => 'Solo instructores y gestores pueden ver el calendario.'], 403);
        }

        $validados = $request->validate([
            'desde' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
            'hasta' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
        ]);

        $tz  = 'America/Bogota';
        $hoy = Carbon::now($tz);

        $desde = (isset($validados['desde']) && $validados['desde'])
            ? Carbon::parse($validados['desde'], $tz)->startOfDay()
            : $hoy->copy()->startOfMonth();

        $hasta = (isset($validados['hasta']) && $validados['hasta'])
            ? Carbon::parse($validados['hasta'], $tz)->startOfDay()
            : $hoy->copy()->endOfMonth();

        if ($hasta->lt($desde)) {
            throw ValidationException::withMessages([
                'hasta' => ['La fecha de fin debe ser posterior a la fecha de inicio.'],
            ]);
        }

        $difDias = (new \DateTimeImmutable($desde->toDateString()))
            ->diff(new \DateTimeImmutable($hasta->toDateString()))
            ->days;

        if ($difDias > 92) {
            throw ValidationException::withMessages([
                'hasta' => ['El rango máximo de consulta es 92 días.'],
            ]);
        }

        $desdeStr = $desde->toDateString();
        $hastaStr = $hasta->toDateString();

        // Horarios activos donde el instructor es responsable de ese día
        $horarios = Horario::query()
            ->where('instructor_id', $usuario->id)
            ->where('activo', 1)
            ->with([
                'ficha:id,numero_ficha,fecha_inicio,fecha_fin,activo',
                'jornada:id,tipo',
            ])
            ->get()
            ->filter(fn ($h) => $h->ficha && (int) $h->ficha->activo === 1);

        if ($horarios->isEmpty()) {
            return response()->json([]);
        }

        // Sesiones existentes para esos horarios en el rango (una sola query)
        $horarioIds = $horarios->pluck('id')->all();
        $sesiones   = Sesion::query()
            ->whereIn('horario_id', $horarioIds)
            ->whereBetween('fecha', [$desdeStr, $hastaStr])
            ->get()
            ->keyBy(fn ($s) => "{$s->horario_id}_{$s->fecha}");

        // Índice de horarios por slug de día para búsqueda O(1)
        $horariosPorSlug = [];
        foreach ($horarios as $horario) {
            $horariosPorSlug[$horario->dia_semana][] = $horario;
        }

        $eventos     = [];
        $fechaActual = $desde->copy();

        while (! $fechaActual->gt($hasta)) {
            $n        = (int) $fechaActual->format('N'); // ISO: 1=lunes … 7=domingo
            $fechaStr = $fechaActual->toDateString();

            // No hay clases los domingos (no existen horarios con dia_semana = domingo)
            if ($n !== 7 && isset(self::SLUG_POR_ISO[$n])) {
                $slug = self::SLUG_POR_ISO[$n];

                foreach ($horariosPorSlug[$slug] ?? [] as $horario) {
                    $ficha = $horario->ficha;

                    // Usar solo la parte de fecha (los campos pueden incluir hora)
                    $fichaInicio = substr((string) $ficha->fecha_inicio, 0, 10);
                    $fichaFin    = substr((string) $ficha->fecha_fin,    0, 10);

                    if ($fechaStr < $fichaInicio || $fechaStr > $fichaFin) {
                        continue;
                    }

                    $key    = "{$horario->id}_{$fechaStr}";
                    $sesion = $sesiones->get($key);

                    $eventos[] = [
                        'fecha'             => $fechaStr,
                        'horario_id'        => $horario->id,
                        'ficha_id'          => $ficha->id,
                        'numero_ficha'      => $ficha->numero_ficha,
                        'jornada_tipo'      => $horario->jornada?->tipo ?? 'desconocida',
                        'hora_inicio'       => substr((string) $horario->hora_inicio, 0, 5),
                        'hora_fin'          => substr((string) $horario->hora_fin,    0, 5),
                        'horas_programadas' => (int) $horario->horas_programadas,
                        'sesion_id'         => $sesion?->id,
                        'sesion_estado'     => $sesion?->estado,
                    ];
                }
            }

            $fechaActual->addDay();
        }

        // Ordenar por fecha, luego por hora de inicio
        usort($eventos, static function (array $a, array $b): int {
            $cmp = strcmp($a['fecha'], $b['fecha']);
            return $cmp !== 0 ? $cmp : strcmp($a['hora_inicio'], $b['hora_inicio']);
        });

        return response()->json($eventos);
    }
}
