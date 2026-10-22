<?php

namespace App\Http\Controllers;

use App\Models\CentroFormacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Listado de centros de formación para formularios (Módulo 5)
class CentroFormacionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', CentroFormacion::class);

        $items = CentroFormacion::query()
            ->with('regional:id,nombre,macrorregion_id')
            ->where('activo', 1)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'codigo', 'regional_id']);

        return response()->json(['data' => $items]);
    }
}
