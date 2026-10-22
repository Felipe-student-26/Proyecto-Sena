<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabla de sesiones de clase
// Una sesión es la instancia real de un horario en una fecha específica
// Cuando un instructor toma asistencia, crea o abre una sesión
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sesiones', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('horario_id');
            // Fecha real en que se tomó la asistencia
            $table->date('fecha');
            $table->enum('estado', ['abierta', 'cerrada'])->default('abierta');
            // El instructor que tomó la asistencia esta sesión
            $table->unsignedBigInteger('tomado_por')->nullable();
            $table->dateTime('creado_en')->useCurrent();
            $table->dateTime('actualizado_en')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('horario_id')
                  ->references('id')
                  ->on('horarios')
                  ->restrictOnDelete();

            $table->foreign('tomado_por')
                  ->references('id')
                  ->on('usuarios')
                  ->nullOnDelete();

            $table->index('horario_id', 'idx_sesion_horario');
            $table->index('fecha', 'idx_sesion_fecha');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sesiones');
    }
};
