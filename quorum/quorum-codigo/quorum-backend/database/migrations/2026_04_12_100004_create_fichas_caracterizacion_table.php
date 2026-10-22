<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabla de fichas de caracterización
// Una ficha es el número de grupo de aprendices en el SENA
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fichas_caracterizacion', function (Blueprint $table) {
            $table->id();
            // Número único de la ficha (ejemplo: 2893456)
            $table->string('numero_ficha', 20)->unique();
            $table->enum('estado', ['activa', 'suspendida'])->default('activa');
            $table->unsignedBigInteger('centro_formacion_id');
            $table->unsignedBigInteger('programa_formacion_id');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->tinyInteger('activo')->default(1);
            $table->dateTime('creado_en')->useCurrent();
            $table->dateTime('actualizado_en')->useCurrent()->useCurrentOnUpdate();

            // FK hacia centros y programas
            $table->foreign('centro_formacion_id')
                  ->references('id')
                  ->on('centros_formacion')
                  ->restrictOnDelete();

            $table->foreign('programa_formacion_id')
                  ->references('id')
                  ->on('programas_formacion')
                  ->restrictOnDelete();

            $table->index('estado', 'idx_estado');
            $table->index('centro_formacion_id', 'idx_centro');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fichas_caracterizacion');
    }
};
