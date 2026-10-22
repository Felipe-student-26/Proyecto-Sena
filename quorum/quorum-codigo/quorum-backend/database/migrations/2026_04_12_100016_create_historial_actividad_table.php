<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabla de auditoría de acciones importantes del sistema
// Registra quién hizo qué y cuándo (visible en el módulo de configuración)
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('historial_actividad', function (Blueprint $table) {
            $table->id();
            // El usuario que realizó la acción
            $table->unsignedBigInteger('usuario_id');
            // Tipo de acción (ejemplo: 'crear_ficha', 'tomar_asistencia', 'importar_aprendices')
            $table->string('accion', 100);
            // Descripción legible de lo que se hizo
            $table->text('descripcion');
            // Dirección IP desde donde se realizó
            $table->string('ip', 45)->nullable();
            $table->dateTime('creado_en')->useCurrent();

            $table->foreign('usuario_id')
                  ->references('id')
                  ->on('usuarios')
                  ->restrictOnDelete();

            $table->index('usuario_id', 'idx_historial_usuario');
            $table->index('accion', 'idx_historial_accion');
            $table->index('creado_en', 'idx_historial_fecha');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historial_actividad');
    }
};
