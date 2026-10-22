<?php

namespace App\Services;

use PragmaRX\Google2FA\Google2FA;

// TOTP (Google Authenticator / Microsoft Authenticator) — QUORUM
class TotpService
{
    // Nombre que verá el usuario en la app autenticadora
    private const ISSUER = 'QUORUM SENA CPIC';

    // Ventana de periodos TOTP admitidos (±30 s aprox. por paso)
    private const VENTANA_VERIFICACION = 1;

    public function __construct(
        private readonly Google2FA $google2fa
    ) {}

    /** Genera un secreto base32 nuevo */
    public function generarSecreto(): string
    {
        return $this->google2fa->generateSecretKey();
    }

    /** URL otpauth:// para generar QR en el cliente */
    public function urlOtpAuth(string $correo, string $secreto): string
    {
        return $this->google2fa->getQRCodeUrl(self::ISSUER, $correo, $secreto);
    }

    /** Valida el código de 6 dígitos contra el secreto */
    public function verificar(string $secreto, string $codigo): bool
    {
        $codigo = preg_replace('/\s+/', '', $codigo) ?? '';

        $resultado = $this->google2fa->verifyKey($secreto, $codigo, self::VENTANA_VERIFICACION);

        return $resultado !== false;
    }
}
