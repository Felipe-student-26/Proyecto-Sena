<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProgramaFormacionRequest;
use App\Http\Requests\UpdateProgramaFormacionRequest;
use App\Models\FichaCaracterizacion;
use App\Models\ProgramaFormacion;
use App\Support\LogActivity;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// CRUD administración de programas de formación (solo admin)
class ProgramaFormacionAdminController extends Controller
{
    /** Listado completo para gestión; query activo: 1, 0 o vacío = todos */
    public function index(Request $request): JsonResponse
    {
        $q = ProgramaFormacion::query()->orderBy('nombre');

        if ($request->filled('activo')) {
            $q->where('activo', (int) $request->input('activo'));
        }

        if ($request->filled('tipo')) {
            $q->where('tipo', $request->input('tipo'));
        }

        $items = $q->get(['id', 'nombre', 'codigo', 'tipo', 'activo']);

        return response()->json(['data' => $items]);
    }

    public function store(StoreProgramaFormacionRequest $request): JsonResponse
    {
        $programa = ProgramaFormacion::query()->create([
            'nombre' => trim($request->validated('nombre')),
            'codigo' => $request->filled('codigo') ? trim((string) $request->validated('codigo')) : null,
            'tipo'   => $request->filled('tipo') ? $request->validated('tipo') : null,
            'activo' => 1,
        ]);

        LogActivity::registrar('crear_programa_formacion', 'Programa: '.$programa->nombre.' (id '.$programa->id.')');

        return response()->json([
            'message' => 'Programa de formación creado correctamente.',
            'data'    => $programa,
        ], 201);
    }

    public function update(UpdateProgramaFormacionRequest $request, ProgramaFormacion $programa): JsonResponse
    {
        $programa->update([
            'nombre' => trim($request->validated('nombre')),
            'codigo' => $request->filled('codigo') ? trim((string) $request->validated('codigo')) : null,
            'tipo'   => $request->filled('tipo') ? $request->validated('tipo') : null,
        ]);

        LogActivity::registrar('actualizar_programa_formacion', 'Programa id '.$programa->id.' — '.$programa->nombre);

        return response()->json([
            'message' => 'Programa de formación actualizado correctamente.',
            'data'    => $programa->fresh(),
        ]);
    }

    public function destroy(ProgramaFormacion $programa): JsonResponse
    {
        if ((int) $programa->activo === 1) {
            $programa->update(['activo' => 0]);

            LogActivity::registrar('desactivar_programa_formacion', 'Programa id '.$programa->id.' — '.$programa->nombre);

            return response()->json(['message' => 'El programa fue desactivado.']);
        }

        $tieneFichas = FichaCaracterizacion::query()
            ->where('programa_formacion_id', $programa->id)
            ->exists();

        if ($tieneFichas) {
            return response()->json([
                'message' => 'No se puede eliminar permanentemente: existen fichas vinculadas a este programa.',
            ], 422);
        }

        try {
            $id = $programa->id;
            $programa->delete();
        } catch (QueryException) {
            return response()->json([
                'message' => 'No se puede eliminar: el programa tiene datos relacionados en el sistema.',
            ], 422);
        }

        LogActivity::registrar('eliminar_programa_formacion', 'Id '.$id);

        return response()->json(['message' => 'El programa fue eliminado permanentemente.']);
    }

    public function reactivar(ProgramaFormacion $programa): JsonResponse
    {
        if ((int) $programa->activo === 1) {
            return response()->json(['message' => 'El programa ya está activo.'], 422);
        }

        $programa->update(['activo' => 1]);

        LogActivity::registrar('reactivar_programa_formacion', 'Programa id '.$programa->id.' — '.$programa->nombre);

        return response()->json([
            'message' => 'El programa fue reactivado.',
            'data'    => $programa->fresh(),
        ]);
    }
}
