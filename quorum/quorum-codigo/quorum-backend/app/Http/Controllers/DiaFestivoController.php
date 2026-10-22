<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDiaFestivoRequest;
use App\Http\Requests\UpdateDiaFestivoRequest;
use App\Models\DiaFestivo;
use App\Support\LogActivity;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

// CRUD días festivos — soft delete con activo=0 (M12)
class DiaFestivoController extends Controller
{
    /** Listado por año (por defecto año actual, Bogotá), solo activos */
    public function index(Request $request): JsonResponse
    {
        $zona = 'America/Bogota';
        $anio = $request->filled('anio')
            ? (int) $request->input('anio')
            : (int) Carbon::now($zona)->year;

        $inicio = Carbon::createFromDate($anio, 1, 1, $zona)->startOfDay()->toDateString();
        $fin    = Carbon::createFromDate($anio, 12, 31, $zona)->endOfDay()->toDateString();

        $filas = DiaFestivo::query()
            ->whereBetween('fecha', [$inicio, $fin])
            ->where('activo', 1)
            ->orderBy('fecha')
            ->get();

        return response()->json(['data' => $filas, 'anio' => $anio]);
    }

    public function show(DiaFestivo $diaFestivo): JsonResponse
    {
        return response()->json(['data' => $diaFestivo]);
    }

    /**
     * Crea o reactiva: la fecha es UNIQUE en BD; si existe inactivo, se reactiva.
     */
    public function store(StoreDiaFestivoRequest $request): JsonResponse
    {
        $fecha       = $request->validated('fecha');
        $descripcion = $request->validated('descripcion');

        $existente = DiaFestivo::query()->where('fecha', $fecha)->first();

        if ($existente) {
            if ((int) $existente->activo === 1) {
                throw ValidationException::withMessages([
                    'fecha' => ['Ya existe un día festivo activo con esta fecha.'],
                ]);
            }

            $existente->update([
                'descripcion'    => $descripcion,
                'activo'         => 1,
                'actualizado_en' => now(),
            ]);

            LogActivity::registrar(
                'festivo_reactivado',
                'Fecha: '.$fecha.' — '.$descripcion
            );

            return response()->json([
                'message' => 'Día festivo registrado correctamente (se reactivó una fecha anterior).',
                'data'    => $existente->fresh(),
            ], 201);
        }

        $nuevo = DiaFestivo::query()->create([
            'fecha'          => $fecha,
            'descripcion'    => $descripcion,
            'activo'         => 1,
            'creado_en'      => now(),
            'actualizado_en' => now(),
        ]);

        LogActivity::registrar(
            'festivo_creado',
            'Fecha: '.$fecha.' — '.$descripcion
        );

        return response()->json([
            'message' => 'Día festivo creado correctamente.',
            'data'    => $nuevo,
        ], 201);
    }

    public function update(UpdateDiaFestivoRequest $request, DiaFestivo $diaFestivo): JsonResponse
    {
        $datos = $request->validated();

        if (isset($datos['fecha']) && $datos['fecha'] !== $diaFestivo->fecha->format('Y-m-d')) {
            $otro = DiaFestivo::query()
                ->where('fecha', $datos['fecha'])
                ->where('id', '!=', $diaFestivo->id)
                ->first();

            // UNIQUE(fecha): no puede haber otra fila con la misma fecha
            if ($otro) {
                throw ValidationException::withMessages([
                    'fecha' => ['Esa fecha ya está registrada en el sistema.'],
                ]);
            }
        }

        $diaFestivo->fill(array_intersect_key($datos, array_flip(['fecha', 'descripcion'])));
        $diaFestivo->actualizado_en = now();
        $diaFestivo->save();

        LogActivity::registrar(
            'festivo_actualizado',
            'ID '.$diaFestivo->id.' — '.$diaFestivo->descripcion
        );

        return response()->json([
            'message' => 'Día festivo actualizado correctamente.',
            'data'    => $diaFestivo->fresh(),
        ]);
    }

    /** Soft delete: activo = 0 */
    public function destroy(DiaFestivo $diaFestivo): JsonResponse
    {
        if ((int) $diaFestivo->activo === 0) {
            return response()->json([
                'message' => 'Este festivo ya estaba desactivado.',
            ], 422);
        }

        $diaFestivo->update([
            'activo'         => 0,
            'actualizado_en' => now(),
        ]);

        LogActivity::registrar(
            'festivo_desactivado',
            'Fecha: '.$diaFestivo->fecha->format('Y-m-d').' — '.$diaFestivo->descripcion
        );

        return response()->json([
            'message' => 'Día festivo desactivado correctamente.',
        ]);
    }
}
