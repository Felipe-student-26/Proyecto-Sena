<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCentroFormacionRequest;
use App\Http\Requests\UpdateCentroFormacionRequest;
use App\Models\CentroFormacion;
use App\Models\FichaCaracterizacion;
use App\Support\LogActivity;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// CRUD administración de centros de formación (solo admin)
class CentroFormacionAdminController extends Controller
{
    /** Listado completo para gestión; query activo: 1, 0 o vacío = todos */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('create', CentroFormacion::class);

        $q = CentroFormacion::query()
            ->with('regional:id,nombre,macrorregion_id')
            ->orderBy('nombre');

        if ($request->filled('activo')) {
            $q->where('activo', (int) $request->input('activo'));
        }

        if ($request->filled('regional_id')) {
            $q->where('regional_id', (int) $request->input('regional_id'));
        }

        $items = $q->get(['id', 'nombre', 'codigo', 'regional_id', 'activo', 'creado_en', 'actualizado_en']);

        return response()->json(['data' => $items]);
    }

    public function store(StoreCentroFormacionRequest $request): JsonResponse
    {
        $this->authorize('create', CentroFormacion::class);

        $ahora = now();
        $centro = CentroFormacion::query()->create([
            'nombre'         => trim($request->validated('nombre')),
            'codigo'         => $request->filled('codigo') ? trim((string) $request->validated('codigo')) : null,
            'regional_id'    => $request->filled('regional_id') ? (int) $request->validated('regional_id') : null,
            'activo'         => 1,
            'creado_en'      => $ahora,
            'actualizado_en' => $ahora,
        ]);

        $centro->load('regional:id,nombre');
        LogActivity::registrar('crear_centro_formacion', 'Centro: '.$centro->nombre.' (id '.$centro->id.')');

        return response()->json([
            'message' => 'Centro de formación creado correctamente.',
            'data'    => $centro,
        ], 201);
    }

    public function update(UpdateCentroFormacionRequest $request, CentroFormacion $centro): JsonResponse
    {
        $this->authorize('update', $centro);

        $centro->update([
            'nombre'         => trim($request->validated('nombre')),
            'codigo'         => $request->filled('codigo') ? trim((string) $request->validated('codigo')) : null,
            'regional_id'    => $request->filled('regional_id') ? (int) $request->validated('regional_id') : $centro->regional_id,
            'actualizado_en' => now(),
        ]);

        LogActivity::registrar('actualizar_centro_formacion', 'Centro id '.$centro->id.' — '.$centro->nombre);

        return response()->json([
            'message' => 'Centro de formación actualizado correctamente.',
            'data'    => $centro->fresh()->load('regional:id,nombre'),
        ]);
    }

    public function destroy(CentroFormacion $centro): JsonResponse
    {
        $this->authorize('delete', $centro);

        if ((int) $centro->activo === 1) {
            $centro->update([
                'activo'         => 0,
                'actualizado_en' => now(),
            ]);

            LogActivity::registrar('desactivar_centro_formacion', 'Centro id '.$centro->id.' — '.$centro->nombre);

            return response()->json([
                'message' => 'El centro fue desactivado.',
            ]);
        }

        $tieneFichas = FichaCaracterizacion::query()
            ->where('centro_formacion_id', $centro->id)
            ->exists();

        if ($tieneFichas) {
            return response()->json([
                'message' => 'No se puede eliminar permanentemente: existen fichas vinculadas a este centro.',
            ], 422);
        }

        try {
            $id = $centro->id;
            $centro->delete();
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'No se puede eliminar: el centro tiene datos relacionados en el sistema.',
            ], 422);
        }

        LogActivity::registrar('eliminar_centro_formacion', 'Id '.$id);

        return response()->json([
            'message' => 'El centro fue eliminado permanentemente.',
        ]);
    }

    public function reactivar(CentroFormacion $centro): JsonResponse
    {
        $this->authorize('reactivate', $centro);

        if ((int) $centro->activo === 1) {
            return response()->json([
                'message' => 'El centro ya está activo.',
            ], 422);
        }

        $centro->update([
            'activo'         => 1,
            'actualizado_en' => now(),
        ]);

        LogActivity::registrar('reactivar_centro_formacion', 'Centro id '.$centro->id.' — '.$centro->nombre);

        return response()->json([
            'message' => 'El centro fue reactivado.',
            'data'    => $centro->fresh(),
        ]);
    }
}
