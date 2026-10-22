<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabla de centros de formación del SENA
// Ejemplo: Centro de Procesos Industriales y Construcción (CPIC)
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('centros_formacion', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->string('codigo', 20)->nullable();
            // Soft delete: 1=activo, 0=desactivado
            $table->tinyInteger('activo')->default(1);
            $table->dateTime('creado_en')->useCurrent();
            $table->dateTime('actualizado_en')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('centros_formacion');
    }
};
