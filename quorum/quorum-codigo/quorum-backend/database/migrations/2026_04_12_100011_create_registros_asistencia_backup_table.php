<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabla espejo de auditoría — guarda el estado ANTERIOR de un registro antes de editarlo
// Regla de negocio: antes de modificar cualquier asistencia, se copia aquí el registro original
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registros_asistencia_backup', function (Blueprint $table) {
            $table->id();
            // ID del registro original que fue modificado
            $table->unsignedBigInteger('registro_original_id');
            $table->unsignedBigInteger('sesion_id');
            $table->unsignedBigInteger('usuario_id');
            $table->enum('tipo', ['presente', 'falla', 'excusa', 'parcial']);
            $table->tinyInteger('horas_inasistencia')->unsigned()->nullable();
            // Quién realizó el cambio (instructor que editó)
            $table->unsignedBigInteger('modificado_por');
            // Momento exacto en que se hizo la modificación
            $table->dateTime('creado_en')->useCurrent();

            $table->foreign('sesion_id')
                  ->references('id')
                  ->on('sesiones')
                  ->restrictOnDelete();

            $table->foreign('usuario_id')
                  ->references('id')
                  ->on('usuarios')
                  ->restrictOnDelete();

            $table->foreign('modificado_por')
                  ->references('id')
                  ->on('usuarios')
                  ->restrictOnDelete();

            $table->index('registro_original_id', 'idx_backup_original');
            $table->index('usuario_id', 'idx_backup_usuario');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registros_asistencia_backup');
    }
};
