<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

// Alineación con PRD §5 tabla registros_asistencia_backup:
// PRD define: registro_asistencia_id, sesion_id, aprendiz_id,
//             tipo_anterior, horas_inasistencia_ant,
//             tipo_nuevo, horas_inasistencia_new,
//             modificado_por, razon (opcional)
// La versión M0 tenía solo el estado anterior (tipo + horas) sin "nuevo" ni razon
// La tabla de backup no debe tener FK para no impedir borrar el original
// Dado que en desarrollo no hay datos de auditoría reales, se recrea la tabla
return new class extends Migration
{
    public function up(): void
    {
        // Eliminamos la tabla M0 (sin datos productivos todavía)
        Schema::dropIfExists('registros_asistencia_backup');

        // Recreamos según PRD: guarda antes y después de cada cambio
        Schema::create('registros_asistencia_backup', function (Blueprint $table) {
            $table->id();
            // FK al registro original (sin FK referencial — el original puede haberse editado)
            $table->unsignedBigInteger('registro_asistencia_id');
            $table->unsignedBigInteger('sesion_id');
            $table->unsignedBigInteger('aprendiz_id');
            // Estado ANTES del cambio
            $table->enum('tipo_anterior', ['presente', 'falla', 'excusa', 'parcial'])->nullable();
            $table->tinyInteger('horas_inasistencia_ant')->nullable();
            // Estado DESPUÉS del cambio (el nuevo valor guardado)
            $table->enum('tipo_nuevo', ['presente', 'falla', 'excusa', 'parcial']);
            $table->tinyInteger('horas_inasistencia_new')->nullable();
            // Quién realizó el cambio
            $table->unsignedBigInteger('modificado_por');
            // Razón opcional del cambio (el instructor puede explicar por qué editó)
            $table->string('razon', 255)->nullable();
            $table->dateTime('creado_en')->useCurrent();

            // Índices para consultas de auditoría (sin FK para no bloquear borrados)
            $table->index('registro_asistencia_id', 'idx_registro');
            $table->index('aprendiz_id', 'idx_aprendiz_backup');
            $table->index('modificado_por', 'idx_modificado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registros_asistencia_backup');

        // Restaurar versión M0
        Schema::create('registros_asistencia_backup', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('registro_original_id');
            $table->unsignedBigInteger('sesion_id');
            $table->unsignedBigInteger('usuario_id');
            $table->enum('tipo', ['presente', 'falla', 'excusa', 'parcial']);
            $table->tinyInteger('horas_inasistencia')->unsigned()->nullable();
            $table->unsignedBigInteger('modificado_por');
            $table->dateTime('creado_en')->useCurrent();
            $table->index('registro_original_id', 'idx_backup_original');
            $table->index('usuario_id', 'idx_backup_usuario');
        });
    }
};
