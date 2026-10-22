<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de contraseña — QUORUM</title>
    <style>
        /*
         * Estilos alineados con la paleta QUORUM del frontend:
         * verde #059669, verdeOscuro #047857, verdeClaro #D1FAE5, grisClaro #F8FAFC
         */
        body {
            font-family: Inter, 'Geist Sans', 'Segoe UI', Arial, sans-serif;
            background-color: #F8FAFC;
            margin: 0;
            padding: 20px;
            color: #333333;
        }
        .contenedor {
            max-width: 520px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
            border: 1px solid #e5e7eb;
        }
        .cabecera {
            /* Gradiente coherente con botones y acentos del frontend */
            background: linear-gradient(90deg, #047857 0%, #059669 100%);
            padding: 28px 24px;
            text-align: center;
        }
        .cabecera img {
            display: block;
            margin: 0 auto 10px;
            height: 36px;
            width: auto;
            max-width: 220px;
        }
        .cabecera p {
            color: #D1FAE5;
            margin: 0;
            font-size: 13px;
            line-height: 1.5;
        }
        .cuerpo {
            padding: 32px 28px;
        }
        .cuerpo p {
            line-height: 1.6;
            margin: 0 0 16px;
            font-size: 15px;
            color: #333333;
        }
        .boton-contenedor {
            text-align: center;
            margin: 28px 0;
        }
        .boton {
            display: inline-block;
            background-color: #059669;
            color: #ffffff;
            text-decoration: none;
            padding: 13px 32px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            letter-spacing: 0.02em;
        }
        .enlace-texto {
            font-size: 12px;
            color: #5f6368;
            word-break: break-all;
            margin-top: 12px;
            line-height: 1.5;
        }
        .aviso {
            background-color: #D1FAE5;
            border-left: 4px solid #059669;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 13px;
            color: #334155;
            margin-top: 24px;
        }
        .pie {
            background-color: #F8FAFC;
            padding: 16px 28px;
            text-align: center;
            font-size: 12px;
            color: #9E9E9E;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="contenedor">
        {{-- Wordmark oscuro embebido (CID): pensado para fondos verdes/oscuros --}}
        <div class="cabecera">
            <img
                src="{{ $message->embed(public_path('branding/wordmark_quorum_oscuro.png')) }}"
                alt="QUORUM"
                height="36"
                style="display:block;margin:0 auto 10px;height:36px;width:auto;max-width:220px;"
            >
            <p>Sistema de Control de Asistencia — SENA CPIC</p>
        </div>

        <div class="cuerpo">
            {{-- Saludo personalizado con el nombre del usuario --}}
            <p>Hola, <strong>{{ $nombreUsuario }}</strong>.</p>

            <p>
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en
                <strong>QUORUM</strong>. Si fuiste tú, haz clic en el botón de abajo para
                crear una nueva contraseña.
            </p>

            {{-- Enlace de reset: base resuelta en el backend (Origin permitido o FRONTEND_URL) --}}
            @php
                $enlaceReset = $frontendBaseUrl . '/reset?token=' . $token;
            @endphp
            <div class="boton-contenedor">
                <a href="{{ $enlaceReset }}"
                   class="boton"
                   style="color:#ffffff !important;text-decoration:none;display:inline-block;background-color:#059669;padding:13px 32px;border-radius:8px;font-size:15px;font-weight:600;">
                    Restablecer contraseña
                </a>
                {{-- Enlace en texto plano por si el botón no carga en el cliente de correo --}}
                <p class="enlace-texto">
                    O copia y pega este enlace en tu navegador:<br>
                    {{ $enlaceReset }}
                </p>
            </div>

            {{-- Aviso de expiración y uso único --}}
            <div class="aviso">
                <strong>Importante:</strong> Este enlace expira en <strong>1 hora</strong>
                y solo puede usarse <strong>una vez</strong>.
                Si no solicitaste este cambio, puedes ignorar este correo;
                tu contraseña actual seguirá siendo la misma.
            </div>
        </div>

        <div class="pie">
            SENA CPIC — QUORUM v1.0 &nbsp;|&nbsp;
            Este correo fue generado automáticamente, no respondas a él.
        </div>
    </div>
</body>
</html>
