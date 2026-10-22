<?php

namespace Tests\Feature;

use App\Mail\ResetPasswordMail;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

// Tests del correo de recuperación de contraseña (plantilla reset_password.blade.php)
class ResetPasswordMailTest extends TestCase
{
    private const NOMBRE_USUARIO = 'María García';

    private const TOKEN = 'abc123token456';

    private const FRONTEND_URL = 'http://localhost:3000';

    /** Construye el Mailable con datos de prueba reutilizables */
    private function crearMailable(): ResetPasswordMail
    {
        return new ResetPasswordMail(
            self::NOMBRE_USUARIO,
            self::TOKEN,
            self::FRONTEND_URL,
        );
    }

    /** Renderiza la vista HTML del correo como string */
    private function renderizarHtml(): string
    {
        return $this->crearMailable()->render();
    }

    /** El Mailable expone correctamente nombre, token y URL base del frontend */
    public function test_mailable_expone_datos_correctos(): void
    {
        $mailable = $this->crearMailable();

        $this->assertSame(self::NOMBRE_USUARIO, $mailable->nombreUsuario);
        $this->assertSame(self::TOKEN, $mailable->token);
        $this->assertSame(self::FRONTEND_URL, $mailable->frontendBaseUrl);
    }

    /** El asunto del correo coincide con el definido en el envelope */
    public function test_asunto_del_correo_es_correcto(): void
    {
        $mailable = $this->crearMailable();

        $this->assertSame(
            'Recuperación de contraseña — QUORUM SENA',
            $mailable->envelope()->subject,
        );
    }

    /** La vista renderizada incluye saludo, enlace con token y textos de marca */
    public function test_vista_contiene_contenido_esencial(): void
    {
        $html = $this->renderizarHtml();

        $this->assertStringContainsString(self::NOMBRE_USUARIO, $html);
        $this->assertStringContainsString(
            self::FRONTEND_URL . '/reset?token=' . self::TOKEN,
            $html,
        );
        $this->assertStringContainsString('Restablecer contraseña', $html);
        $this->assertStringContainsString('QUORUM', $html);
        $this->assertStringContainsString('SENA CPIC', $html);
        $this->assertStringContainsString('1 hora', $html);
    }

    /** La plantilla usa la paleta nueva del frontend y no el verde SENA antiguo */
    public function test_vista_usa_paleta_quorum_actual(): void
    {
        $html = $this->renderizarHtml();

        $this->assertStringContainsString('#059669', $html);
        $this->assertStringContainsString('#047857', $html);
        $this->assertStringContainsString('#D1FAE5', $html);
        $this->assertStringNotContainsString('#3DAE2B', $html);
    }

    /** El wordmark oscuro existe en el backend para el embed CID */
    public function test_asset_de_logo_existe_en_backend(): void
    {
        $this->assertFileExists(public_path('branding/wordmark_quorum_oscuro.png'));
    }

    /** La vista embebe el logo inline (cid al enviar, base64 al renderizar) sin URL del frontend */
    public function test_vista_embebe_logo_como_adjunto_inline(): void
    {
        $html = $this->renderizarHtml();

        $logoEmbebido = str_contains($html, 'cid:')
            || str_contains($html, 'data:image/png;base64,');
        $this->assertTrue($logoEmbebido, 'El logo debe embeberse como adjunto inline.');
        $this->assertStringContainsString('alt="QUORUM"', $html);
        $this->assertStringNotContainsString('/branding/wordmark_quorum.png', $html);
    }

    /** Mail::fake() permite enviar el Mailable sin SMTP real */
    public function test_correo_se_puede_enviar_con_mail_fake(): void
    {
        Mail::fake();

        Mail::to('usuario@sena.edu.co')->send($this->crearMailable());

        Mail::assertSent(ResetPasswordMail::class, function (ResetPasswordMail $mail) {
            return $mail->nombreUsuario === self::NOMBRE_USUARIO
                && $mail->token === self::TOKEN
                && $mail->frontendBaseUrl === self::FRONTEND_URL;
        });
    }
}
