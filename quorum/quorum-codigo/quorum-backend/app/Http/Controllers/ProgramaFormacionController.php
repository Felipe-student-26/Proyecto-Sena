<?php

namespace App\Http\Controllers;

use App\Models\ProgramaFormacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Listado de programas de formación para formularios (Módulo 5)
class ProgramaFormacionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', ProgramaFormacion::class);

        $q = ProgramaFormacion::query()
            ->where('activo', 1)
            ->orderBy('nombre');

        if ($request->filled('tipo')) {
            $q->where('tipo', $request->input('tipo'));
        }

        $items = $q->get(['id', 'nombre', 'codigo', 'tipo']);

        return response()->json(['data' => $items]);
    }
}
