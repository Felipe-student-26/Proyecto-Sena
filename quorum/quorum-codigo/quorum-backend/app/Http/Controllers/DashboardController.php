<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Resumen del dashboard según el rol del usuario autenticado (Módulo 4)
class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if ($usuario->rol === 'aprendiz') {
            return response()->json([
                'message' => 'Los aprendices no tienen acceso al panel principal. Usa Mi historial.',
            ], 403);
        }

        $payload = match ($usuario->rol) {
            'admin' => $this->dashboardService->paraAdmin(),
            'coordinador' => $this->dashboardService->paraCoordinador(),
            'instructor', 'gestor_grupo' => $this->dashboardService->paraInstructorOGestor($usuario),
            default => null,
        };

        if ($payload === null) {
            return response()->json([
                'message' => 'Rol no reconocido para el dashboard.',
            ], 403);
        }

        return response()->json($payload);
    }
}
