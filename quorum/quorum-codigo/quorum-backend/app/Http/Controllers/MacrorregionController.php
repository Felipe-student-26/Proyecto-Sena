<?php

namespace App\Http\Controllers;

use App\Models\Macrorregion;
use Illuminate\Http\JsonResponse;

// Listado de macrorregiones con sus regionales — catálogo de solo lectura
class MacrorregionController extends Controller
{
    public function index(): JsonResponse
    {
        $items = Macrorregion::query()
            ->with(['regionales' => fn ($q) => $q->orderBy('nombre')])
            ->orderBy('nombre')
            ->get(['id', 'nombre']);

        return response()->json(['data' => $items]);
    }
}
