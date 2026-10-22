<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

// Correo que se envía cuando un usuario solicita recuperar su contraseña
// Contiene el enlace único con el token de 64 caracteres
class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    // El nombre del usuario para personalizar el saludo
    public string $nombreUsuario;

    // El token único de recuperación
    public string $token;

    /** Base del SPA (sin barra final) — mismo host/puerto desde el que se solicitó el reset cuando aplica */
    public string $frontendBaseUrl;

    public function __construct(string $nombreUsuario, string $token, string $frontendBaseUrl)
    {
        $this->nombreUsuario    = $nombreUsuario;
        $this->token            = $token;
        $this->frontendBaseUrl  = rtrim($frontendBaseUrl, '/');
    }

    // Asunto y remitente del correo
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Recuperación de contraseña — QUORUM SENA',
        );
    }

    // Vista Blade que se usa como cuerpo del correo
    public function content(): Content
    {
        return new Content(
            view: 'emails.reset_password',
        );
    }
}
