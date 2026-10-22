<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabla para controlar el bloqueo por intentos fallidos de login
// Después de 5 intentos fallidos en 15 minutos, la cuenta se bloquea temporalmente
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('intentos_login', function (Blueprint $table) {
            $table->id();
            // El usuario que intentó iniciar sesión (puede ser null si el correo no existe)
            $table->unsignedBigInteger('usuario_id')->nullable();
            // Correo que se usó en el intento (para bloquear incluso si el usuario no existe)
            $table->string('correo', 150);
            // Dirección IP desde donde se hizo el intento
            $table->string('ip', 45)->nullable();
            $table->tinyInteger('exitoso')->default(0);
            $table->dateTime('creado_en')->useCurrent();

            $table->foreign('usuario_id')
                  ->references('id')
                  ->on('usuarios')
                  ->nullOnDelete();

            $table->index('correo', 'idx_intento_correo');
            $table->index('creado_en', 'idx_intento_fecha');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('intentos_login');
    }
};
