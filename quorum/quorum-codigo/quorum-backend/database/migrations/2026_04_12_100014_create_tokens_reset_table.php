<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabla de tokens para recuperación de contraseña
// El token expira en aproximadamente 1 hora
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tokens_reset', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('usuario_id');
            // Token único que se envía al correo del usuario
            $table->string('token', 100)->unique();
            // Indica si el token ya fue utilizado (no puede usarse dos veces)
            $table->tinyInteger('usado')->default(0);
            // Fecha y hora en que expira el token
            $table->dateTime('expira_en');
            $table->dateTime('creado_en')->useCurrent();

            $table->foreign('usuario_id')
                  ->references('id')
                  ->on('usuarios')
                  ->cascadeOnDelete();

            $table->index('token', 'idx_token_reset');
            $table->index('usuario_id', 'idx_token_usuario');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tokens_reset');
    }
};
