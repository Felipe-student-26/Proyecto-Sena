<?php

namespace App\Http\Controllers;

use App\Services\AprendizService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Endpoints solo para usuarios con rol aprendiz (Módulo 9)
class AprendizController extends Controller
{
    public function __construct(
        private AprendizService $aprendizService
    ) {}

    /**
     * Historial de asistencia del aprendiz autenticado (solo lectura).
     */
    public function miHistorial(Request $request): JsonResponse
    {
        $usuario = $request->user();

        // Solo el rol aprendiz puede usar esta ruta
        if ($usuario->rol !== 'aprendiz') {
            abort(403, 'No autorizado.');
        }

        // Evitar que intenten ver datos de otro usuario por query string (IDOR)
        $clavesProhibidas = ['aprendiz_id', 'aprendiz', 'usuario_id', 'user_id'];
        foreach ($clavesProhibidas as $clave) {
            if ($request->query->has($clave)) {
                abort(403, 'No autorizado.');
            }
        }

        $datos = $this->aprendizService->miHistorial($usuario->id);

        return response()->json($datos);
    }
}
