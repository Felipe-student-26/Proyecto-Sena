<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        // Rutas web normales
        web: __DIR__.'/../routes/web.php',
        // Rutas de la API REST
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Configuramos Sanctum para que funcione con la SPA del frontend
        // El frontend está en localhost:3000 y se comunica por cookies
        $middleware->statefulApi();

        // Habilitamos CORS para aceptar peticiones desde el frontend
        $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);

        $middleware->alias([
            'coordinador_o_admin' => \App\Http\Middleware\EnsureCoordinadorOAdmin::class,
            'admin'               => \App\Http\Middleware\EnsureAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Sin esto, Laravel intenta route('login') y revienta si no existe esa ruta nombrada.
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'No autenticado.',
                ], 401);
            }

            return null;
        });

        // Cuando falla la autenticación en rutas API, respondemos JSON (no redirect)
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            return $request->is('api/*');
        });
    })->create();
