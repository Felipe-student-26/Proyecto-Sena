<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateConfiguracionRequest;
use App\Models\Configuracion;
use App\Support\LogActivity;
use Illuminate\Http\JsonResponse;

// Listado y actualización de parámetros clave-valor (M12 — solo admin)
class ConfiguracionController extends Controller
{
    /** Devuelve todos los registros de configuración */
    public function index(): JsonResponse
    {
        $filas = Configuracion::query()->orderBy('clave')->get();

        return response()->json(['data' => $filas]);
    }

    /** Actualiza un valor por clave (lista blanca en el Form Request) */
    public function update(UpdateConfiguracionRequest $request): JsonResponse
    {
        $clave = $request->validated('clave');
        $valor = $request->validated('valor');
        $valorTexto = is_int($valor) ? (string) $valor : (string) $valor;

        Configuracion::query()->where('clave', $clave)->update(['valor' => $valorTexto]);

        LogActivity::registrar(
            'configuracion_actualizada',
            'Clave: '.$clave
        );

        return response()->json([
            'message' => 'Configuración actualizada correctamente.',
            'data'    => Configuracion::query()->where('clave', $clave)->first(),
        ]);
    }
}
