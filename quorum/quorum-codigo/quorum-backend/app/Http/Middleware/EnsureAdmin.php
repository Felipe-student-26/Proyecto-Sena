<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// Solo administrador — usado en rutas de configuración, festivos e historial (M12)
class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $usuario = $request->user();

        if (! $usuario || $usuario->rol !== 'admin') {
            return response()->json([
                'message' => 'No autorizado.',
            ], 403);
        }

        return $next($request);
    }
}
