<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabla de días festivos
// Se usa para validar que no se tome asistencia en fechas no hábiles
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dias_festivos', function (Blueprint $table) {
            $table->id();
            // La fecha del festivo — debe ser única para evitar duplicados
            $table->date('fecha')->unique();
            $table->string('descripcion', 150);
            $table->tinyInteger('activo')->default(1);
            $table->dateTime('creado_en')->useCurrent();
            $table->dateTime('actualizado_en')->useCurrent()->useCurrentOnUpdate();

            $table->index('fecha', 'idx_festivo_fecha');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dias_festivos');
    }
};
