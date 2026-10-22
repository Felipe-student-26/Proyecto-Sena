<?php

namespace App\Support;

// Bypass de la obligación de TOTP solo en desarrollo (APP_ENV=local + .env).
class TotpLocalBypass
{
    public static function activo(): bool
    {
        if (! app()->environment('local')) {
            return false;
        }

        return (bool) config('auth.totp_bypass_local');
    }
}
