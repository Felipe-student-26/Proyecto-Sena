<?php

use App\Http\Controllers\AprendizController;
use App\Http\Controllers\AuditoriaAsistenciaController;
use App\Http\Controllers\AsistenciaController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CalendarioController;
use App\Http\Controllers\CentroFormacionAdminController;
use App\Http\Controllers\CentroFormacionController;
use App\Http\Controllers\ConfiguracionController;
use App\Http\Controllers\CoordinadorController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DiaFestivoController;
use App\Http\Controllers\FichaController;
use App\Http\Controllers\HistorialActividadController;
use App\Http\Controllers\MacrorregionController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\ProgramaFormacionAdminController;
use App\Http\Controllers\ProgramaFormacionController;
use App\Http\Controllers\RegionalController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\UsuarioController;
use App\Http\Middleware\EnsureTotpSessionOk;
use Illuminate\Support\Facades\Route;

// Rutas de la API QUORUM

// Ruta de prueba — verifica que la API responde correctamente
Route::get('/ping', function () {
    return response()->json([
        'status'  => 'ok',
        'mensaje' => 'API QUORUM funcionando correctamente',
        'version' => '1.0',
    ]);
});

// -----------------------------------------------------------------------
// Módulo 1 — Autenticación
// -----------------------------------------------------------------------
Route::prefix('auth')->group(function () {
    // Rutas públicas — no requieren sesión activa
    Route::post('login',          [AuthController::class, 'login']);
    Route::post('login-aprendiz', [AuthController::class, 'loginAprendiz']);

    // Rutas protegidas — requieren sesión Sanctum activa
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me',      [AuthController::class, 'me']);
        Route::post('2fa/configurar', [AuthController::class, 'configurar2FA']);
        Route::post('2fa/verificar',  [AuthController::class, 'verificar2FA']);
    });
});

// -----------------------------------------------------------------------
// Módulo 9 — Mi historial (aprendiz; sin TOTP en sesión)
// -----------------------------------------------------------------------
Route::middleware('auth:sanctum')->get('/mi-historial', [AprendizController::class, 'miHistorial']);

// Módulo 13 — cambio de contraseña desde el perfil (sin exigir TOTP en sesión)
Route::middleware('auth:sanctum')->patch('/perfil/contrasena', [PerfilController::class, 'cambiarContrasena']);

// -----------------------------------------------------------------------
// Módulo 4 — Dashboard por rol (requiere 2FA completado en sesión)
// -----------------------------------------------------------------------
Route::middleware(['auth:sanctum', EnsureTotpSessionOk::class])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Módulo 6 — Usuarios (solo admin vía UsuarioPolicy)
    Route::get('/usuarios', [UsuarioController::class, 'index']);
    Route::post('/usuarios', [UsuarioController::class, 'store']);
    Route::post('/usuarios/{usuario}/reactivar', [UsuarioController::class, 'reactivar']);
    Route::put('/usuarios/{usuario}', [UsuarioController::class, 'update']);
    Route::delete('/usuarios/{usuario}', [UsuarioController::class, 'destroy']);

    // Catálogos geográficos SENA
    Route::get('/macrorregiones', [MacrorregionController::class, 'index']);
    Route::get('/regionales', [RegionalController::class, 'index']);

    // Módulo 5 — Fichas de caracterización y catálogos
    Route::get('/centros-formacion', [CentroFormacionController::class, 'index']);
    Route::get('/programas-formacion', [ProgramaFormacionController::class, 'index']);
    Route::get('/instructores-disponibles', [FichaController::class, 'instructoresDisponibles']);

    Route::get('/fichas', [FichaController::class, 'index']);
    Route::post('/fichas', [FichaController::class, 'store']);
    Route::get('/fichas/{ficha}', [FichaController::class, 'show']);
    Route::put('/fichas/{ficha}', [FichaController::class, 'update']);
    Route::delete('/fichas/{ficha}', [FichaController::class, 'destroy']);
    Route::post('/fichas/{ficha}/reactivar', [FichaController::class, 'reactivar']);
    Route::post('/fichas/{ficha}/instructores', [FichaController::class, 'asignarInstructor']);
    Route::post('/fichas/{ficha}/aprendices', [FichaController::class, 'storeAprendiz']);
    Route::put('/fichas/{ficha}/aprendices/{usuario}', [FichaController::class, 'updateAprendiz']);
    Route::delete('/fichas/{ficha}/aprendices/{usuario}', [FichaController::class, 'destroyAprendiz']);
    Route::post('/fichas/{ficha}/importar-aprendices', [FichaController::class, 'importarAprendices']);

    // Módulo 8 — Historial / matriz por ficha (admin, coordinador, instructor, gestor)
    Route::get('/asistencia/historial/{ficha}', [AsistenciaController::class, 'historial']);
    Route::get('/asistencia/evidencias', [AsistenciaController::class, 'listarEvidencias']);

    // Módulo 11 — Reporte Excel CPIC (mismos roles que historial; FichaPolicy::view)
    Route::get('/reportes/excel/{ficha}', [ReporteController::class, 'descargarExcel']);

    // Módulo 10 — Panel coordinador (solo admin y coordinador)
    Route::middleware('coordinador_o_admin')->prefix('coordinador')->group(function () {
        Route::get('/fichas', [CoordinadorController::class, 'fichas']);
        Route::get('/asistencia/ficha/{ficha}', [CoordinadorController::class, 'historialFicha']);
        Route::get('/aprendices/buscar', [CoordinadorController::class, 'buscarAprendices']);
        Route::get('/aprendices/{aprendiz}/historial', [CoordinadorController::class, 'historialAprendiz']);
        Route::get('/estadisticas', [CoordinadorController::class, 'estadisticas']);
    });

    // Módulo 14 — Calendario de clases (instructor / gestor)
    Route::get('/calendario', [CalendarioController::class, 'misEventos']);

    // Módulo 7 — Tomar asistencia (instructor / gestor)
    Route::post('/asistencia/iniciar-sesion', [AsistenciaController::class, 'iniciarSesion']);
    Route::post('/asistencia/sesiones/{sesion}/guardar', [AsistenciaController::class, 'guardar']);
    Route::get('/asistencia/registros/{registro}/excusa-evidencia', [AsistenciaController::class, 'descargarExcusaEvidencia']);
    Route::put('/asistencia/registros/{registro}', [AsistenciaController::class, 'actualizar']);

    // Módulo 12 — Configuración, festivos e historial (solo admin)
    Route::middleware('admin')->group(function () {
        Route::get('/configuracion', [ConfiguracionController::class, 'index']);
        Route::patch('/configuracion', [ConfiguracionController::class, 'update']);

        Route::get('/dias-festivos', [DiaFestivoController::class, 'index']);
        Route::post('/dias-festivos', [DiaFestivoController::class, 'store']);
        Route::get('/dias-festivos/{diaFestivo}', [DiaFestivoController::class, 'show']);
        Route::put('/dias-festivos/{diaFestivo}', [DiaFestivoController::class, 'update']);
        Route::delete('/dias-festivos/{diaFestivo}', [DiaFestivoController::class, 'destroy']);

        Route::get('/historial-actividad', [HistorialActividadController::class, 'index']);

        // Administración centros de formación (listado completo + CRUD)
        Route::prefix('admin')->group(function () {
            Route::get('/centros-formacion', [CentroFormacionAdminController::class, 'index']);
            Route::post('/centros-formacion', [CentroFormacionAdminController::class, 'store']);
            Route::put('/centros-formacion/{centro}', [CentroFormacionAdminController::class, 'update']);
            Route::delete('/centros-formacion/{centro}', [CentroFormacionAdminController::class, 'destroy']);
            Route::post('/centros-formacion/{centro}/reactivar', [CentroFormacionAdminController::class, 'reactivar']);

            // CRUD programas de formación (admin)
            Route::get('/programas-formacion', [ProgramaFormacionAdminController::class, 'index']);
            Route::post('/programas-formacion', [ProgramaFormacionAdminController::class, 'store']);
            Route::put('/programas-formacion/{programa}', [ProgramaFormacionAdminController::class, 'update']);
            Route::delete('/programas-formacion/{programa}', [ProgramaFormacionAdminController::class, 'destroy']);
            Route::post('/programas-formacion/{programa}/reactivar', [ProgramaFormacionAdminController::class, 'reactivar']);

            Route::get('/auditoria-asistencia', [AuditoriaAsistenciaController::class, 'index']);
        });
    });
});

// -----------------------------------------------------------------------
// Módulo 2 — Recuperación de contraseña
// throttle:5,1 → máximo 5 solicitudes por minuto por IP (protección anti-spam)
// -----------------------------------------------------------------------
Route::prefix('auth')->middleware('throttle:5,1')->group(function () {
    // Solicitar enlace de recuperación por correo
    Route::post('recuperar', [AuthController::class, 'solicitarReset']);
    // Procesar el cambio de contraseña con el token recibido
    Route::post('reset',     [AuthController::class, 'procesarReset']);
});
