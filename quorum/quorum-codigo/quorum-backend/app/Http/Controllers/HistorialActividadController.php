<?php

namespace App\Http\Controllers;

use App\Models\HistorialActividad;
use Illuminate\Http\JsonResponse;

// Últimas acciones para pantalla de configuración (M12)
class HistorialActividadController extends Controller
{
    /** Últimas 20 entradas con nombre de usuario legible */
    public function index(): JsonResponse
    {
        $filas = HistorialActividad::query()
            ->with('usuario')
            ->orderByDesc('creado_en')
            ->limit(20)
            ->get()
            ->map(function (HistorialActividad $fila) {
                $nombreUsuario = 'Sistema';
                if ($fila->usuario) {
                    $nombreUsuario = trim($fila->usuario->nombre.' '.$fila->usuario->apellido);
                }

                return [
                    'id'             => $fila->id,
                    'usuario_nombre' => $nombreUsuario,
                    'accion'         => $fila->accion,
                    'descripcion'    => $fila->descripcion,
                    'creado_en'      => $fila->creado_en,
                ];
            })
            ->values();

        return response()->json(['data' => $filas]);
    }
}
