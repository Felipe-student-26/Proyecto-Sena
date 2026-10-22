<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// Solo permite admin o coordinador (panel M10 y APIs asociadas)
class EnsureCoordinadorOAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $usuario = $request->user();

        if (! $usuario || ! in_array($usuario->rol, ['admin', 'coordinador'], true)) {
            return response()->json([
                'message' => 'No autorizado.',
            ], 403);
        }

        return $next($request);
    }
}
