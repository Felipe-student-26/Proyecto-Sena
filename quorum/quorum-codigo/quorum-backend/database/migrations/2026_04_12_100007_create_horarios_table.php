<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabla de horarios semanales
// Define qué instructor da clase a una ficha, en qué día y a qué horas
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horarios', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ficha_id');
            $table->unsignedBigInteger('jornada_ficha_id');
            $table->enum('dia_semana', ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']);
            $table->time('hora_inicio');
            $table->time('hora_fin');
            // Calculado: diferencia en horas entre hora_fin y hora_inicio
            $table->tinyInteger('horas_programadas')->unsigned();
            // El instructor asignado a este día específico
            $table->unsignedBigInteger('instructor_id');
            $table->tinyInteger('activo')->default(1);
            $table->dateTime('creado_en')->useCurrent();
            $table->dateTime('actualizado_en')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('ficha_id')
                  ->references('id')
                  ->on('fichas_caracterizacion')
                  ->restrictOnDelete();

            $table->foreign('jornada_ficha_id')
                  ->references('id')
                  ->on('jornadas_ficha')
                  ->restrictOnDelete();

            $table->foreign('instructor_id')
                  ->references('id')
                  ->on('usuarios')
                  ->restrictOnDelete();

            $table->index('ficha_id', 'idx_horario_ficha');
            $table->index('instructor_id', 'idx_horario_instructor');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horarios');
    }
};
