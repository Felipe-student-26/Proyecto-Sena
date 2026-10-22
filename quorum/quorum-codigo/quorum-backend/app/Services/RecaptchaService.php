<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

// Servicio para verificar tokens de reCAPTCHA v3 (score) contra la API de Google
class RecaptchaService
{
    // URL de verificación de reCAPTCHA de Google
    private const URL_VERIFICACION = 'https://www.google.com/recaptcha/api/siteverify';

    /**
     * Verifica un token de reCAPTCHA v3 validando success + score + action.
     *
     * @param  string  $accionEsperada  Action enviada en grecaptcha.execute(..., { action })
     */
    public function verificarV3(string $token, string $ip, string $accionEsperada): bool
    {
        // Bypass solo en entorno local si RECAPTCHA_BYPASS_LOCAL=true
        if (app()->environment('local') && (bool) config('services.recaptcha.bypass_local')) {
            Log::info('reCAPTCHA: bypass local activo — verificación omitida', ['action' => $accionEsperada]);

            return true;
        }

        $minScore = (float) config('services.recaptcha.min_score', 0.5);
        $secret = (string) config('services.recaptcha.secret');

        if (trim($token) === '' || trim($secret) === '') {
            Log::warning('reCAPTCHA: token o secret vacío (config/env)');

            return false;
        }

        try {
            $respuesta = Http::asForm()->post(self::URL_VERIFICACION, [
                'secret' => $secret,
                'response' => $token,
                'remoteip' => $ip,
            ]);

            if (! $respuesta->successful()) {
                Log::warning('reCAPTCHA: error al contactar el servidor de Google');

                return false;
            }

            $datos = $respuesta->json() ?: [];

            $success = (bool) ($datos['success'] ?? false);
            $score = is_numeric($datos['score'] ?? null) ? (float) $datos['score'] : null;
            $action = (string) ($datos['action'] ?? '');

            if (! $success) {
                $codes = $datos['error-codes'] ?? null;
                Log::info('reCAPTCHA: success=false', [
                    'action_esperada' => $accionEsperada,
                    'action' => $action,
                    'score' => $score,
                    'error_codes' => $codes,
                ]);

                return false;
            }

            if ($score === null) {
                Log::info('reCAPTCHA: respuesta sin score', [
                    'action_esperada' => $accionEsperada,
                    'action' => $action,
                ]);

                return false;
            }

            if ($action !== $accionEsperada) {
                Log::info('reCAPTCHA: action no coincide', [
                    'action_esperada' => $accionEsperada,
                    'action' => $action,
                    'score' => $score,
                ]);

                return false;
            }

            if ($score < $minScore) {
                Log::info('reCAPTCHA: score insuficiente', [
                    'min_score' => $minScore,
                    'score' => $score,
                    'action' => $action,
                ]);

                return false;
            }

            return true;
        } catch (\Throwable $e) {
            // Si falla la conexión con Google, registramos el error pero no bloqueamos el sistema
            Log::error('reCAPTCHA: excepción al verificar token — '.$e->getMessage());

            return false;
        }
    }
}
