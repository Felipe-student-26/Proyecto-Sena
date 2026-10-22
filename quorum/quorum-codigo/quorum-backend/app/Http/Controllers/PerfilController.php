<?php

namespace App\Http\Controllers;

use App\Http\Requests\CambiarContrasenaPerfilRequest;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

// Perfil del usuario autenticado — Módulo 13
class PerfilController extends Controller
{
    // Cambia la contraseña del usuario logueado (no aplica a aprendices sin password)
    public function cambiarContrasena(CambiarContrasenaPerfilRequest $request): JsonResponse
    {
        /** @var Usuario $usuario */
        $usuario = $request->user();

        if ($usuario->password === null || $usuario->password === '') {
            return response()->json([
                'message' => 'Tu cuenta no tiene contraseña configurada. Contacta al administrador.',
            ], 422);
        }

        $actual = $request->input('password_actual');
        if (! Hash::check($actual, $usuario->password)) {
            return response()->json([
                'message' => 'La contraseña actual no es correcta.',
            ], 422);
        }

        $nueva = $request->input('password');
        if (Hash::check($nueva, $usuario->password)) {
            return response()->json([
                'message' => 'La nueva contraseña debe ser diferente a la actual.',
            ], 422);
        }

        $usuario->update([
            'password' => bcrypt($nueva),
            'actualizado_en' => now(),
        ]);

        return response()->json([
            'message' => 'Contraseña actualizada correctamente.',
        ]);
    }
}
