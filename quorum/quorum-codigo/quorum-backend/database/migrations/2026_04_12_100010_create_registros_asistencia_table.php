<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabla de registros de asistencia individual
// Un registro por cada aprendiz en cada sesión
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registros_asistencia', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sesion_id');
            // El aprendiz al que corresponde este registro
            $table->unsignedBigInteger('usuario_id');
            // Tipo de asistencia registrada
            $table->enum('tipo', ['presente', 'falla', 'excusa', 'parcial']);
            // Solo se llena cuando el tipo es 'parcial'
            $table->tinyInteger('horas_inasistencia')->unsigned()->nullable();
            $table->dateTime('creado_en')->useCurrent();
            $table->dateTime('actualizado_en')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('sesion_id')
                  ->references('id')
                  ->on('sesiones')
                  ->cascadeOnDelete();

            $table->foreign('usuario_id')
                  ->references('id')
                  ->on('usuarios')
                  ->restrictOnDelete();

            // Un aprendiz solo puede tener un registro por sesión
            $table->unique(['sesion_id', 'usuario_id'], 'uq_registro_sesion_usuario');
            $table->index('usuario_id', 'idx_registro_usuario');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registros_asistencia');
    }
};
