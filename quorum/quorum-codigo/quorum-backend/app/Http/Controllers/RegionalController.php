<?php

namespace App\Http\Controllers;

use App\Models\Regional;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Listado de regionales — catálogo de solo lectura; filtrable por macrorregion_id
class RegionalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Regional::query()
            ->with('macrorregion:id,nombre')
            ->orderBy('nombre');

        if ($request->filled('macrorregion_id')) {
            $q->where('macrorregion_id', (int) $request->input('macrorregion_id'));
        }

        $items = $q->get(['id', 'nombre', 'macrorregion_id']);

        return response()->json(['data' => $items]);
    }
}
