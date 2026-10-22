<?php

namespace App\Http\Controllers;

use App\Http\Requests\Configurar2FARequest;
use App\Http\Requests\LoginAprendizRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\ProcesarResetRequest;
use App\Http\Requests\SolicitarResetRequest;
use App\Http\Requests\Verificar2FARequest;
use App\Mail\ResetPasswordMail;
use App\Models\Configuracion;
use App\Models\IntentoLogin;
use App\Models\TokenReset;
use App\Models\Usuario;
use App\Services\TotpService;
use App\Support\LogActivity;
use App\Support\TotpLocalBypass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

// Controlador de autenticación — maneja los dos flujos de login y el logout
class AuthController extends Controller
{
    // Valores por defecto si la tabla configuracion no tiene dato válido (M12)
    private const INTENTOS_FALLBACK = 5;

    private const MINUTOS_BLOQUEO_FALLBACK = 15;

    // -------------------------------------------------------------------------
    // Login para staff: admin, coordinador, instructor, gestor_grupo
    // Requiere correo + contraseña
    // -------------------------------------------------------------------------
    public function login(LoginRequest $request): JsonResponse
    {
        $correo = $request->input('correo');
        $ip = $request->ip();

        $maxIntentos = $this->maxIntentosLoginDesdeConfig();
        $minutosBloqueo = $this->minutosBloqueoDesdeConfig();

        // Verificamos si el correo está bloqueado por exceso de intentos fallidos
        $intentosRecientes = IntentoLogin::recientesFallidos($correo, $minutosBloqueo)->count();

        if ($intentosRecientes >= $maxIntentos) {
            return response()->json([
                'message' => 'Demasiados intentos fallidos. Intenta de nuevo en '.$minutosBloqueo.' minutos.',
            ], 429);
        }

        // Buscamos al usuario por correo
        $usuario = Usuario::where('correo', $correo)->first();

        // Si el usuario no existe o está inactivo, registramos intento fallido
        // Mensaje genérico para no revelar si el correo existe o no
        if (! $usuario || $usuario->activo == 0) {
            $this->registrarIntento($correo, $ip, false);

            // Mensaje especial para cuentas desactivadas (sin revelar la existencia del correo)
            if ($usuario && $usuario->activo == 0) {
                return response()->json([
                    'message' => 'Tu cuenta está desactivada. Comunícate con el administrador.',
                ], 401);
            }

            return response()->json([
                'message' => 'Las credenciales no son correctas.',
            ], 401);
        }

        // Si el usuario no tiene contraseña, no puede iniciar sesión por este flujo
        if (empty($usuario->password)) {
            $this->registrarIntento($correo, $ip, false);

            return response()->json([
                'message' => 'Las credenciales no son correctas.',
            ], 401);
        }

        // Verificamos que la contraseña sea correcta
        if (! Hash::check($request->input('password'), $usuario->password)) {
            $this->registrarIntento($correo, $ip, false);

            return response()->json([
                'message' => 'Las credenciales no son correctas.',
            ], 401);
        }

        // Login exitoso — registramos el intento, autenticamos en el guard web y regeneramos sesión
        $this->registrarIntento($correo, $ip, true);
        Auth::guard('web')->login($usuario, false);
        $request->session()->regenerate();

        // Aprendiz: no usa 2FA; staff: exige 2FA en sesión
        if ($usuario->rol === 'aprendiz') {
            $request->session()->put('totp_sesion_ok', true);
            LogActivity::registrar('login_exitoso', 'Aprendiz: '.$usuario->correo);

            return response()->json([
                'usuario' => $this->usuarioParaSesion($usuario, false),
                'totp_sesion_completa' => true,
                'nombre_sistema' => $this->nombreSistemaParaJson(),
            ]);
        }

        // Desarrollo local: opcionalmente omitir TOTP (TOTP_BYPASS_LOCAL + APP_ENV=local)
        if (TotpLocalBypass::activo()) {
            $request->session()->put('totp_sesion_ok', true);
            LogActivity::registrar('login_exitoso', 'Staff: '.$usuario->correo.' (TOTP bypass local)');
            return response()->json([
                'usuario' => $this->usuarioParaSesion($usuario, true),
                'totp_sesion_completa' => true,
                'nombre_sistema' => $this->nombreSistemaParaJson(),
            ]);
        }

        // Hasta pasar 2FA no se considera sesión completa para API protegidas
        $request->session()->put('totp_sesion_ok', false);
        LogActivity::registrar('login_exitoso', 'Staff: '.$usuario->correo);
        return response()->json([
            'usuario' => $this->usuarioParaSesion($usuario, true),
            'totp_sesion_completa' => false,
            'nombre_sistema' => $this->nombreSistemaParaJson(),
        ]);
    }

    // -------------------------------------------------------------------------
    // Login para aprendices: correo + documento (cédula)
    // Sin 2FA
    // -------------------------------------------------------------------------
    public function loginAprendiz(LoginAprendizRequest $request): JsonResponse
    {
        $correo = $request->input('correo');
        $documento = $request->input('documento');
        $ip = $request->ip();

        // Endpoint deprecado: los aprendices ahora usan el login unificado (correo + contraseña).
        // Mantenemos este endpoint para no romper clientes antiguos, pero forzamos la migración.
        return response()->json([
            'message' => 'Este método de inicio de sesión fue actualizado. Usa correo y contraseña en el login principal.',
        ], 410);
    }

    // -------------------------------------------------------------------------
    // Logout — cierra la sesión del usuario autenticado
    // -------------------------------------------------------------------------
    public function logout(Request $request): JsonResponse
    {
        // Cerramos sesión en el guard, invalidamos la sesión y renovamos el token CSRF
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ]);
    }

    // -------------------------------------------------------------------------
    // Me — retorna los datos del usuario actualmente autenticado
    // -------------------------------------------------------------------------
    public function me(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if (! $usuario) {
            return response()->json([
                'message' => 'No autenticado.',
            ], 401);
        }

        return response()->json([
            'usuario' => $this->usuarioParaSesion($usuario, true),
            'totp_sesion_completa' => $this->totpSesionCompleta($usuario, $request),
            'nombre_sistema' => $this->nombreSistemaParaJson(),
        ]);
    }

    // -------------------------------------------------------------------------
    // 2FA TOTP — configurar (QR + activación) o verificar en cada login
    // -------------------------------------------------------------------------

    public function configurar2FA(Configurar2FARequest $request, TotpService $totp): JsonResponse
    {
        $usuario = $request->user();

        if (! $this->esStaffConTotpObligatorio($usuario)) {
            return response()->json([
                'message' => 'Esta acción no aplica para tu tipo de cuenta.',
            ], 403);
        }

        if ($usuario->totp_verificado) {
            return response()->json([
                'message' => 'El doble factor ya está activado. Usa la verificación en cada inicio de sesión.',
            ], 422);
        }

        // Fase preparar: devolver URL otpauth y secreto (generar secreto si no existe)
        if (! $request->filled('codigo')) {
            if (empty($usuario->totp_secret)) {
                $secreto = $totp->generarSecreto();
                $usuario->update(['totp_secret' => $secreto]);
                $usuario->refresh();
            }

            return response()->json([
                'otpauth_url' => $totp->urlOtpAuth($usuario->correo, $usuario->totp_secret),
                'secreto_manual' => $usuario->totp_secret,
            ]);
        }

        // Fase confirmar: validar código y activar 2FA
        if (empty($usuario->totp_secret)) {
            return response()->json([
                'message' => 'Primero solicita los datos del código QR.',
            ], 422);
        }

        if (! $totp->verificar($usuario->totp_secret, $request->input('codigo'))) {
            return response()->json([
                'message' => 'El código no es válido. Verifica la hora de tu dispositivo e inténtalo de nuevo.',
            ], 422);
        }

        $usuario->update(['totp_verificado' => 1]);
        $request->session()->put('totp_sesion_ok', true);

        return response()->json([
            'message' => 'Autenticación en dos pasos activada correctamente.',
            'nombre_sistema' => $this->nombreSistemaParaJson(),
        ]);
    }

    public function verificar2FA(Verificar2FARequest $request, TotpService $totp): JsonResponse
    {
        $usuario = $request->user();

        if (! $this->esStaffConTotpObligatorio($usuario)) {
            return response()->json([
                'message' => 'Esta acción no aplica para tu tipo de cuenta.',
            ], 403);
        }

        if (! $usuario->totp_verificado) {
            return response()->json([
                'message' => 'Primero debes configurar la autenticación en dos pasos.',
            ], 422);
        }

        if (empty($usuario->totp_secret)) {
            return response()->json([
                'message' => 'Tu cuenta no tiene un secreto 2FA válido. Contacta al administrador.',
            ], 422);
        }

        if (! $totp->verificar($usuario->totp_secret, $request->input('codigo'))) {
            return response()->json([
                'message' => 'El código no es válido. Verifica la hora de tu dispositivo e inténtalo de nuevo.',
            ], 422);
        }

        $request->session()->put('totp_sesion_ok', true);

        return response()->json([
            'message' => 'Verificación correcta.',
            'nombre_sistema' => $this->nombreSistemaParaJson(),
        ]);
    }

    // -------------------------------------------------------------------------
    // Solicitar reset — Módulo 2 Recuperación de contraseña
    // El usuario ingresa su correo; si existe y no es aprendiz, se envía el link
    // Siempre se retorna el mismo mensaje para no revelar si el correo existe
    // -------------------------------------------------------------------------
    public function solicitarReset(SolicitarResetRequest $request): JsonResponse
    {
        $correo = $request->input('correo');
        $mensaje = ['message' => 'Si el correo existe, recibirás las instrucciones en tu bandeja de entrada.'];

        // Buscamos el usuario — sin revelar si existe o no en caso de falla
        $usuario = Usuario::where('correo', $correo)->first();

        // No enviamos correo si: no existe o está inactivo
        if (! $usuario || $usuario->activo == 0) {
            return response()->json($mensaje);
        }

        try {
            // Invalidamos todos los tokens anteriores del usuario antes de crear uno nuevo
            TokenReset::where('usuario_id', $usuario->id)->update(['usado' => 1]);

            // Generamos un token seguro de 64 caracteres hexadecimales
            $token = bin2hex(random_bytes(32));

            // Guardamos el nuevo token con expiración de 1 hora
            TokenReset::create([
                'usuario_id' => $usuario->id,
                'token' => $token,
                'expira_en' => now()->addHour(),
                'usado' => 0,
            ]);

            $frontendBase = $this->frontendBaseUrlParaCorreoReset($request);
            $correoDestino = $usuario->correo;
            $nombreUsuario = $usuario->nombre;

            // Envío diferido: la respuesta HTTP no espera la conexión SMTP
            dispatch(function () use ($correoDestino, $nombreUsuario, $token, $frontendBase) {
                try {
                    Mail::to($correoDestino)->send(
                        new ResetPasswordMail($nombreUsuario, $token, $frontendBase)
                    );
                } catch (\Throwable $e) {
                    \Log::error('Error al enviar correo de reset: '.$e->getMessage());
                }
            })->afterResponse();
        } catch (\Throwable $e) {
            // Si falla la preparación del reset, registramos el error pero no lo mostramos al usuario
            \Log::error('Error al enviar correo de reset: '.$e->getMessage());
        }

        // Siempre retornamos el mismo mensaje (no revelamos si el correo existe)
        return response()->json($mensaje);
    }

    // -------------------------------------------------------------------------
    // Procesar reset — Módulo 2 Recuperación de contraseña
    // Verifica el token y actualiza la contraseña si todo es válido
    // -------------------------------------------------------------------------
    public function procesarReset(ProcesarResetRequest $request): JsonResponse
    {
        $token = $request->input('token');
        $nuevaPass = $request->input('password');

        // Buscamos el token en la base de datos
        $tokenReset = TokenReset::where('token', $token)->first();

        // Verificamos que el token exista
        if (! $tokenReset) {
            return response()->json([
                'message' => 'El enlace de recuperación es inválido.',
            ], 422);
        }

        // Verificamos que el token no haya sido usado antes
        if ($tokenReset->usado == 1) {
            return response()->json([
                'message' => 'Este enlace ya fue utilizado. Solicita uno nuevo si lo necesitas.',
            ], 422);
        }

        // Verificamos que el token no haya expirado (máximo 1 hora)
        if ($tokenReset->estaExpirado()) {
            return response()->json([
                'message' => 'El enlace ha expirado. Solicita uno nuevo.',
            ], 422);
        }

        // Actualizamos la contraseña y marcamos el token como usado en una sola transacción
        DB::transaction(function () use ($tokenReset, $nuevaPass) {
            // Actualizamos la contraseña del usuario con hash bcrypt
            $tokenReset->usuario()->update([
                'password' => bcrypt($nuevaPass),
            ]);

            // Marcamos el token como usado para que no pueda usarse de nuevo
            $tokenReset->update(['usado' => 1]);
        });

        return response()->json([
            'message' => 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.',
        ]);
    }

    /**
     * Datos del usuario para respuestas JSON de sesión (login / me).
     *
     * @return array<string, mixed>
     */
    private function usuarioParaSesion(Usuario $usuario, bool $incluirEstadoTotp): array
    {
        $data = [
            'id' => $usuario->id,
            'nombre' => $usuario->nombre,
            'apellido' => $usuario->apellido,
            'correo' => $usuario->correo,
            'documento' => $usuario->documento,
            'rol' => $usuario->rol,
            'ficha_id' => $usuario->ficha_id,
            'avatar_color' => $usuario->avatar_color,
            'activo' => (int) $usuario->activo,
            'creado_en' => $usuario->creado_en,
        ];
        if ($incluirEstadoTotp) {
            // El frontend usa este flag para decidir si ir a /2fa/configurar o /2fa/verificar
            $data['totp_configurado'] = (bool) $usuario->totp_verificado;
        }

        return $data;
    }

    // -------------------------------------------------------------------------
    // Registra un intento de login en la tabla intentos_login
    // -------------------------------------------------------------------------
    private function registrarIntento(string $correo, string $ip, bool $exitoso): void
    {
        IntentoLogin::create([
            'correo' => $correo,
            'ip' => $ip,
            'exitoso' => $exitoso ? 1 : 0,
        ]);
    }

    // Staff con contraseña (no aprendiz) — debe usar 2FA
    private function esStaffConTotpObligatorio(?Usuario $usuario): bool
    {
        return $usuario !== null
            && $usuario->rol !== 'aprendiz'
            && ! empty($usuario->password);
    }

    // ¿Puede usar el dashboard y APIs que exigen 2FA en esta sesión?
    private function totpSesionCompleta(Usuario $usuario, Request $request): bool
    {
        if ($usuario->rol === 'aprendiz') {
            return true;
        }

        if (empty($usuario->password)) {
            return false;
        }

        if (TotpLocalBypass::activo()) {
            return true;
        }

        return (bool) $request->session()->get('totp_sesion_ok');
    }

    /** Nombre corto del sistema para el headbar de la SPA */
    private function nombreSistemaParaJson(): string
    {
        return (string) (Configuracion::obtener('nombre_sistema') ?: 'QUORUM');
    }

    /** Lee max_intentos_login de configuracion (1–999) */
    private function maxIntentosLoginDesdeConfig(): int
    {
        $v = Configuracion::obtener('max_intentos_login');
        if ($v === null || ! is_numeric($v)) {
            return self::INTENTOS_FALLBACK;
        }
        $n = (int) $v;

        return ($n >= 1 && $n <= 999) ? $n : self::INTENTOS_FALLBACK;
    }

    /** Lee minutos_bloqueo de configuracion (1–999) */
    private function minutosBloqueoDesdeConfig(): int
    {
        $v = Configuracion::obtener('minutos_bloqueo');
        if ($v === null || ! is_numeric($v)) {
            return self::MINUTOS_BLOQUEO_FALLBACK;
        }
        $n = (int) $v;

        return ($n >= 1 && $n <= 999) ? $n : self::MINUTOS_BLOQUEO_FALLBACK;
    }

    /**
     * Base URL del SPA para el enlace del correo de reset.
     * Si el navegador envía Origin y coincide con un origen permitido en CORS, se usa ese valor
     * para evitar desajuste cuando FRONTEND_URL en .env no coincide con el puerto real (p. ej. 3000 vs 3001).
     */
    private function frontendBaseUrlParaCorreoReset(Request $request): string
    {
        $configured = rtrim((string) config('app.frontend_url'), '/');
        $origin = (string) $request->headers->get('Origin', '');
        if ($origin !== '' && $this->origenCoincideConCorsPermitido($origin)) {
            return rtrim($origin, '/');
        }

        return $configured;
    }

    private function origenCoincideConCorsPermitido(string $origin): bool
    {
        $norm = rtrim($origin, '/');
        foreach (config('cors.allowed_origins', []) as $allowed) {
            if (rtrim((string) $allowed, '/') === $norm) {
                return true;
            }
        }
        foreach (config('cors.allowed_origins_patterns', []) as $pattern) {
            if (is_string($pattern) && $pattern !== '' && preg_match($pattern, $origin) === 1) {
                return true;
            }
        }

        return false;
    }
}
