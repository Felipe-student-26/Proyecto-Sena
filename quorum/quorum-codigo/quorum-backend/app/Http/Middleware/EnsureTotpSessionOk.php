<?php

namespace App\Http\Middleware;

use App\Support\TotpLocalBypass;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// Bloquea rutas API si el staff no completó 2FA en esta sesión
class EnsureTotpSessionOk
{
    public function handle(Request $request, Closure $next): Response
    {
        if (TotpLocalBypass::activo()) {
            return $next($request);
        }

        $usuario = $request->user();

        if (! $usuario || $usuario->rol === 'aprendiz') {
            return $next($request);
        }

        if (empty($usuario->password)) {
            return $next($request);
        }

        if (! $usuario->totp_verificado) {
            return response()->json([
                'message' => 'Completa la configuración de autenticación en dos pasos.',
            ], 403);
        }

        if (! $request->session()->get('totp_sesion_ok')) {
            return response()->json([
                'message' => 'Ingresa el código de verificación en dos pasos para continuar.',
            ], 403);
        }

        return $next($request);
    }
}
